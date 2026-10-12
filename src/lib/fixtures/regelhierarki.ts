import type { RuleSection } from '../regelhierarki';

// Uppdiktade exempel som bara byggs i testläge (astro build --mode test). Aldrig publicerat innehåll.
export const exampleSections: RuleSection[] = [
	{
		id: 'avvikelse',
		title: 'Exempel: avvikelse',
		statements: [
			{
				ruleSource: 'nationell-regel',
				text: 'Exempel nationell formulering',
				appliesTo: [5],
				checked: '2026-01-02',
				source: { label: 'Exempel nationell källa', url: 'https://example.org/nationell' },
			},
			{
				ruleSource: 'distriktsanpassning',
				text: 'Exempel distriktsformulering',
				appliesTo: [5],
				checked: '2026-01-03',
				source: { label: 'Exempel distriktskälla', url: 'https://example.org/distrikt' },
			},
		],
	},
	{
		id: 'rad',
		title: 'Exempel: föreningsråd',
		statements: [
			{ ruleSource: 'foreningsvagledning', text: 'Exempel föreningsråd', appliesTo: [5], checked: '2026-01-04' },
		],
	},
	{
		id: 'konflikt',
		title: 'Exempel: motstridiga källor',
		needsConfirmation: 'Exempel: källorna säger olika och distriktet har inte klargjort vad som gäller.',
		statements: [
			{
				ruleSource: 'distriktsanpassning',
				text: 'Exempel formulering A',
				appliesTo: [5],
				checked: '2026-01-05',
				source: { label: 'Exempel källa A', url: 'https://example.org/a' },
			},
		],
	},
];
