import type { IconName } from '../components/Icon.astro';
import type { Level } from './nivaguide';

// Ikon per faktanyckel (Snabb översikt och Matchfakta, enligt referensbilderna). Okända nycklar får dokumentikonen.
const factIcons: Record<string, IconName> = {
	spelform: 'users',
	matchtid: 'clock',
	paus: 'clock',
	byten: 'swap',
	tidtagning: 'clock',
	plan: 'court',
	mal: 'goal',
	tabell: 'chart',
	domare: 'users',
	sekretariat: 'doc',
	ledarutbildning: 'doc',
};

export function factIcon(key: string): IconName {
	return factIcons[key] ?? 'doc';
}

// "Division 5 är den röda nivån" kräver böjd form.
export const levelAdjective: Record<Level, string> = { rod: 'röda', bla: 'blå', gron: 'gröna' };

// Nivåns första ord ("Röd") får nivåfärg i rubriken; resten av namnet ("nivå") står i vitt.
export function splitLevelName(name: string): { word: string; rest: string } {
	const [word, ...rest] = name.split(' ');
	return { word, rest: rest.join(' ') };
}
