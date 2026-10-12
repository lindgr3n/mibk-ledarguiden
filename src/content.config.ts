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

// Säsong: filnamnet (id) är adressvänligt, t.ex. 2026-2027. Bara en säsong får vara aktiv;
// den visas på de stabila adresserna (/rod/). Utkast publiceras aldrig.
const sasonger = defineCollection({
	loader: glob({ pattern: '*.yaml', base: './src/content/sasonger' }),
	schema: z.object({
		label: z.string().regex(/^\d{4}\/\d{2}$/, 'Säsongsnamn ska se ut som 2026/27'),
		status: z.enum(['aktiv', 'utkast', 'arkiverad']),
	}),
});

const originalkalla = z.object({
	label: z.string().min(1),
	url: z.url().refine((u) => u.startsWith('https://'), 'Originalkällan måste vara en https-länk'),
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
	// Reserverat för regelhierarkin (nationell regel / distriktsanpassning / föreningsvägledning).
	ruleSource: z.enum(['nationell-regel', 'distriktsanpassning', 'foreningsvagledning']).optional(),
	facts: z
		.array(z.object({ key: z.string().min(1), label: z.string().min(1), value: z.string().min(1) }))
		.min(1),
});

// Fakta som varje nivåguide måste ha (publicerade) för att bygget ska lyckas.
const REQUIRED_FACT_KEYS = ['spelform', 'matchtid', 'plan', 'mal', 'domare', 'sekretariat'];

// Nivåguide: filnamn <säsong>/<nivå>.yaml, t.ex. 2026-2027/rod.yaml
const nivaguider = defineCollection({
	loader: glob({ pattern: '*/*.yaml', base: './src/content/nivaguider' }),
	schema: z
		.object({
			season: reference('sasonger'),
			level: z.enum(['gron', 'bla', 'rod']),
			name: z.string().min(1),
			divisions: z
				.object({ from: z.number().int().min(1), to: z.number().int().min(1) })
				.refine((d) => d.from <= d.to, 'from måste vara <= to'),
			factGroups: z.array(faktagrupp).min(1),
		})
		.superRefine((guide, ctx) => {
			const ids = guide.factGroups.map((g) => g.id);
			if (new Set(ids).size !== ids.length) {
				ctx.addIssue({ code: 'custom', message: 'Faktagrupper måste ha unika id' });
			}
			const published = guide.factGroups
				.filter((g) => g.status === 'verifierad')
				.flatMap((g) => g.facts.map((f) => f.key));
			for (const key of REQUIRED_FACT_KEYS) {
				if (!published.includes(key)) {
					ctx.addIssue({
						code: 'custom',
						path: ['factGroups'],
						message: `Obligatoriskt faktum saknas bland verifierade faktagrupper: ${key}`,
					});
				}
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
	loader: glob({ pattern: '*.yaml', base: './src/content/matchdagen' }),
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

export const collections = { sasonger, nivaguider, matchdagen };
