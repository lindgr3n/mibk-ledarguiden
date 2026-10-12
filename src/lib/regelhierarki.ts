import type { CollectionEntry } from 'astro:content';

export type RuleSource = 'nationell-regel' | 'distriktsanpassning' | 'foreningsvagledning';
export type RuleSection = CollectionEntry<'nivaguider'>['data']['ruleSections'][number];

// Etiketter och beskrivningar följer GLOSSARY.md och ADR 0003.
export const ruleTypes: Record<RuleSource, { label: string; issuer: string; description: string }> = {
	'nationell-regel': {
		label: 'Nationell regel',
		issuer: 'Svensk Innebandy',
		description: 'Gäller hela landet och anges av Svensk Innebandy.',
	},
	distriktsanpassning: {
		label: 'Distriktsanpassning',
		issuer: 'Västernorrlands IBF',
		description: 'Lokal ändring eller precisering som Västernorrlands IBF gör i förhållande till den nationella regeln.',
	},
	foreningsvagledning: {
		label: 'Föreningsvägledning',
		issuer: 'Moälvens IBK',
		description: 'Moälvens egna råd och rutiner. Kompletterar reglerna men ersätter inte reglerna.',
	},
};

export const ruleOrder: RuleSource[] = ['nationell-regel', 'distriktsanpassning', 'foreningsvagledning'];

// Ett avsnitt avviker när distriktet formulerar något annat än den nationella regeln.
export function deviatesFromNational(section: RuleSection): boolean {
	const kinds = new Set(section.statements.map((s) => s.ruleSource));
	return kinds.has('nationell-regel') && kinds.has('distriktsanpassning');
}

export function sortedStatements(section: RuleSection) {
	return [...section.statements].sort((a, b) => ruleOrder.indexOf(a.ruleSource) - ruleOrder.indexOf(b.ruleSource));
}
