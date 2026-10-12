import { getCollection } from 'astro:content';

type Level = 'gron' | 'bla' | 'rod';

// Hämtar nivåguiden för en nivå i den aktiva säsongen (stabila adresser som /rod/, ADR 0001).
// Utkast och arkiverade säsonger publiceras inte här. Bygget misslyckas om det inte finns exakt en aktiv säsong.
export async function getActiveGuide(level: Level) {
	const active = (await getCollection('sasonger')).filter((s) => s.data.status === 'aktiv');
	if (active.length !== 1) {
		throw new Error(`Exakt en säsong måste vara aktiv, hittade ${active.length}`);
	}
	const season = active[0];
	const guide = (await getCollection('nivaguider')).find(
		(g) => g.data.season.id === season.id && g.data.level === level,
	);
	if (!guide) throw new Error(`Ingen nivåguide för ${level} i säsong ${season.data.label}`);

	// Endast verifierade faktagrupper publiceras.
	const published = guide.data.factGroups.filter((g) => g.status === 'verifierad');
	const covered = new Set(published.flatMap((g) => g.appliesTo));
	const { from, to } = guide.data.divisions;
	const unverifiedDivisions = Array.from({ length: to - from + 1 }, (_, i) => from + i).filter(
		(d) => !covered.has(d),
	);
	return {
		guide: guide.data,
		season: season.data,
		factGroups: published,
		ruleSections: guide.data.ruleSections,
		unverifiedDivisions,
	};
}

// "Division 1–4" / "Division 3" / "Division 1, 3 och 5" för en lista divisioner.
export function describeDivisions(divisions: number[]): string {
	const sorted = [...divisions].sort((a, b) => a - b);
	const isRange = sorted.length > 2 && sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
	if (sorted.length === 1) return `Division ${sorted[0]}`;
	if (isRange) return `Division ${sorted[0]}–${sorted[sorted.length - 1]}`;
	return `Division ${sorted.slice(0, -1).join(', ')} och ${sorted[sorted.length - 1]}`;
}
