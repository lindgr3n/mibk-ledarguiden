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

// Regler och dokument: förbundets originaldokument, nyheter för säsongen och bra matchmiljö.
// Filnamn <säsong>.yaml. Inga föreningsprinciper för ledarbeteende ryms i modellen (open-questions.md).
const httpsUrl = z.url().refine((u) => u.startsWith('https://'), 'Länken måste vara en https-länk');
const labelled = { label: z.string().min(1), url: httpsUrl };

const reglerochdokument = defineCollection({
	loader: glob({ pattern: '*.yaml', base: './src/content/reglerochdokument' }),
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
			links: z.array(z.object({ ...labelled, note: z.string().min(1), checked: isoDate })).min(1),
		}),
	}),
});

export const collections = { sasonger, nivaguider, reglerochdokument };
