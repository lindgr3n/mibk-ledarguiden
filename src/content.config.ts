import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Innehållsmodellen följer ADR 0001 (säsongsindelat innehåll) och ADR 0002
// (nivåguider med divisionsanpassningar). Ogiltigt innehåll får bygget att misslyckas.

const isoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum måste vara ÅÅÅÅ-MM-DD (skriv det inom citattecken i YAML)')
	.refine((s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s), {
		message: 'Ogiltigt datum',
	});

// Innehållsroten kan bytas ut av acceptanstesternas fixturbygge (tests/fixtures/content).
const contentRoot = process.env.LEDARGUIDE_CONTENT_ROOT ?? './src/content';

// Säsong: filnamnet (id) är adressvänligt, t.ex. 2026-2027. Bara en säsong får vara aktiv;
// den visas på de stabila adresserna (/rod/). Utkast publiceras aldrig.
const sasonger = defineCollection({
	loader: glob({ pattern: '*.yaml', base: `${contentRoot}/sasonger` }),
	schema: z.object({
		label: z.string().regex(/^\d{4}\/\d{2}$/, 'Säsongsnamn ska se ut som 2026/27'),
		status: z.enum(['aktiv', 'utkast', 'arkiverad']),
	}),
});

const originalkalla = z.object({
	label: z.string().min(1),
	url: z.url().refine((u) => u.startsWith('https://'), 'Originalkällan måste vara en https-länk'),
	// Var i dokumentet uppgiften står (valfritt), eftersom en länk till ett helt dokument annars är för grov.
	detail: z.string().min(1).optional(),
});

// En faktagrupp hör ihop med en originalkälla och ett kontrolldatum.
// Endast status "verifierad" publiceras; "overifierad" renderas aldrig.
const faktagrupp = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	status: z.enum(['verifierad', 'overifierad']),
	// Vilka divisioner uppgifterna är verifierade för.
	appliesTo: z.array(z.number().int().min(1)).min(1),
	checked: isoDate,
	source: originalkalla,
	// Regelkälla (nationell regel / distriktsanpassning / föreningsvägledning, ADR 0003); visas som etikett.
	ruleSource: z.enum(['nationell-regel', 'distriktsanpassning', 'foreningsvagledning']).optional(),
	facts: z
		.array(z.object({ key: z.string().min(1), label: z.string().min(1), value: z.string().min(1) }))
		.min(1),
});

// Uppdateringsnotis: en kort notis när en faktagrupp ändras under säsongen (valfri på nivåguiden).
const uppdateringsnotis = z.object({
	date: isoDate,
	text: z.string().min(1),
	source: originalkalla.optional(),
});

// Regelhierarki (ADR 0003). Ett regelavsnitt samlar uttalanden om samma sak; varje uttalande
// tillhör exakt en regeltyp. Nationell regel och distriktsanpassning kräver originalkälla.
// Föreningsvägledning är Moälvens egna råd och har ingen originalkälla.
// needsConfirmation sätts när aktuella källor motsäger varandra och visas som "Behöver bekräftas".
const regeluttalande = z
	.object({
		ruleSource: z.enum(['nationell-regel', 'distriktsanpassning', 'foreningsvagledning']),
		// Som faktagrupper: bara "verifierad" publiceras (ett säsongsutkast sätter allt till "overifierad").
		status: z.enum(['verifierad', 'overifierad']).default('verifierad'),
		text: z.string().min(1),
		appliesTo: z.array(z.number().int().min(1)).min(1),
		checked: isoDate,
		source: originalkalla.optional(),
	})
	.superRefine((s, ctx) => {
		if (s.ruleSource !== 'foreningsvagledning' && !s.source) {
			ctx.addIssue({
				code: 'custom',
				path: ['source'],
				message: 'Nationell regel och distriktsanpassning kräver originalkälla',
			});
		}
	});

const regelavsnitt = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	statements: z.array(regeluttalande).min(1),
	needsConfirmation: z.string().min(1).optional(),
});

// Obligatoriska fakta (REQUIRED_FACT_KEYS i src/lib/nivaguide.ts) kontrolleras när en aktiv eller arkiverad
// säsong publiceras, inte här, så att ett säsongsutkast med overifierade fakta får finnas.

// Nivåguide: filnamn <säsong>/<nivå>.yaml, t.ex. 2026-2027/rod.yaml
const nivaguider = defineCollection({
	loader: glob({ pattern: '*/*.yaml', base: `${contentRoot}/nivaguider` }),
	schema: z
		.object({
			season: reference('sasonger'),
			level: z.enum(['gron', 'bla', 'rod']),
			name: z.string().min(1),
			divisions: z
				.object({ from: z.number().int().min(1), to: z.number().int().min(1) })
				.refine((d) => d.from <= d.to, 'from måste vara <= to'),
			factGroups: z.array(faktagrupp).min(1),
			updateNotices: z.array(uppdateringsnotis).default([]),
			ruleSections: z.array(regelavsnitt).default([]),
		})
		.superRefine((guide, ctx) => {
			const ids = guide.factGroups.map((g) => g.id);
			if (new Set(ids).size !== ids.length) {
				ctx.addIssue({ code: 'custom', message: 'Faktagrupper måste ha unika id' });
			}
			const ruleIds = guide.ruleSections.map((r) => r.id);
			if (new Set(ruleIds).size !== ruleIds.length) {
				ctx.addIssue({ code: 'custom', message: 'Regelavsnitt måste ha unika id' });
			}
		}),
});

// Divisionsanpassningar (ADR 0002): en fil per division, <säsong>/<nivå>-<division>.yaml.
// Lagrar ENBART divisionens avvikelser från nivåguiden; gemensamma fakta ägs av nivåguiden och får
// inte upprepas här. Att divisionen ligger inom nivåguidens divisioner och att faktanycklarna inte
// krockar med nivåguidens kontrolleras vid bygge i getSeasonGuide (src/lib/nivaguide.ts).
const divisionsanpassning = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	status: z.enum(['verifierad', 'overifierad']),
	checked: isoDate,
	source: originalkalla,
	ruleSource: z.enum(['nationell-regel', 'distriktsanpassning', 'foreningsvagledning']).optional(),
	// Anteckning som visas när anpassningen är overifierad (själva uppgifterna publiceras aldrig).
	// Ska ange varifrån uppgiften härrör och att den inte är verifierad.
	unverifiedNote: z.string().min(1).optional(),
	facts: z
		.array(z.object({ key: z.string().min(1), label: z.string().min(1), value: z.string().min(1) }))
		.min(1),
});

const divisionsanpassningar = defineCollection({
	loader: glob({ pattern: '*/*.yaml', base: `${contentRoot}/divisionsanpassningar` }),
	schema: z
		.object({
			guide: reference('nivaguider'),
			division: z.number().int().min(1),
			adaptations: z.array(divisionsanpassning).min(1),
		})
		.superRefine((d, ctx) => {
			const ids = d.adaptations.map((a) => a.id);
			if (new Set(ids).size !== ids.length) {
				ctx.addIssue({ code: 'custom', message: 'Divisionsanpassningar måste ha unika id' });
			}
		}),
});

// Matchdagen: checklista per säsong, filnamn <säsong>.yaml. Punkter som anger regelfakta
// (nationell regel / distriktsanpassning) kräver originalkälla och kontrolldatum; rena
// föreningsråd (foreningsvagledning) behöver ingen. Matchflytt har bara en länk till aktuell
// information – avgifter och tidsgränser får inte lagras här.
const checklistpunkt = z
	.object({
		id: z.string().min(1),
		text: z.string().min(1),
		homeOnly: z.boolean().default(false),
		ruleSource: z.enum(['nationell-regel', 'distriktsanpassning', 'foreningsvagledning']),
		checked: isoDate.optional(),
		source: originalkalla.optional(),
	})
	.refine((p) => p.ruleSource === 'foreningsvagledning' || (p.checked && p.source), {
		message: 'Punkter som anger regelfakta kräver checked och source',
		path: ['source'],
	});

const matchdagen = defineCollection({
	loader: glob({ pattern: '*.yaml', base: `${contentRoot}/matchdagen` }),
	schema: z
		.object({
			season: reference('sasonger'),
			sections: z
				.array(
					z.object({
						id: z.string().min(1),
						title: z.string().min(1),
						items: z.array(checklistpunkt).min(1),
					}),
				)
				.min(1),
			relocation: z.object({
				title: z.string().min(1),
				intro: z.string().min(1),
				reminder: z.string().min(1),
				link: originalkalla,
			}),
			readMore: z.array(originalkalla).min(1),
		})
		.superRefine((m, ctx) => {
			const ids = m.sections.flatMap((s) => s.items.map((i) => i.id));
			if (new Set(ids).size !== ids.length) {
				ctx.addIssue({ code: 'custom', message: 'Checklistepunkter måste ha unika id' });
			}
			const forbidden = /\d+\s*(kr|kronor|dagar|dygn)\b/i;
			const r = m.relocation;
			if ([r.intro, r.reminder].some((t) => forbidden.test(t))) {
				ctx.addIssue({
					code: 'custom',
					path: ['relocation'],
					message: 'Matchflytt får inte ange avgifter eller tidsgränser – länka till aktuell information',
				});
			}
		}),
});


// Regler och dokument: förbundets originaldokument, nyheter för säsongen och bra matchmiljö.
// Filnamn <säsong>.yaml. Föreningsprinciper för ledarbeteende tas bara med när föreningens befintliga riktlinjer stödjer dem (open-questions.md).
const httpsUrl = z.url().refine((u) => u.startsWith('https://'), 'Länken måste vara en https-länk');
const labelled = { label: z.string().min(1), url: httpsUrl };

const reglerochdokument = defineCollection({
	loader: glob({ pattern: '*.yaml', base: `${contentRoot}/reglerochdokument` }),
	schema: z.object({
		season: reference('sasonger'),
		documents: z
			.array(
				z.object({
					id: z.string().min(1),
					title: z.string().min(1),
					description: z.string().min(1),
					checked: isoDate,
					url: httpsUrl,
					foundAt: z.object(labelled).optional(),
				}),
			)
			.min(1),
		news: z.object({
			title: z.string().min(1),
			summary: z.string().min(1),
			checked: isoDate,
			items: z.array(z.object({ label: z.string().min(1), text: z.string().min(1) })).min(1),
			links: z.array(z.object({ ...labelled, note: z.string().min(1) })).min(1),
			caveat: z.string().min(1),
		}),
		matchEnvironment: z.object({
			definition: z.string().min(1),
			// Föreningsvägledning (ADR 0003): Moälvens egna råd till ledare. Har ingen originalkälla från förbundet utan
			// anger var i föreningens egna dokument rådet står. Tas bara med om föreningens befintliga riktlinjer stödjer det.
			principles: z
				.array(z.object({ text: z.string().min(1), basis: z.string().min(1), checked: isoDate }))
				.default([]),
			links: z.array(z.object({ ...labelled, note: z.string().min(1), checked: isoDate })).min(1),
		}),
	}),
});

export const collections = { sasonger, nivaguider, divisionsanpassningar, matchdagen, reglerochdokument };
