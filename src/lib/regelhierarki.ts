export type RuleSource = 'nationell-regel' | 'distriktsanpassning' | 'foreningsvagledning';

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
