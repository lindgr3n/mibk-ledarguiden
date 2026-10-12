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

	// Divisionsanpassningar (ADR 0002): bara avvikelser, aldrig gemensamma fakta. Bygget misslyckas
	// om en division ligger utanför nivån eller om en anpassning upprepar en faktanyckel som nivåguiden äger.
	const commonKeys = new Set(guide.data.factGroups.flatMap((g) => g.facts.map((f) => f.key)));
	const divisionAdaptations = (await getCollection('divisionsanpassningar'))
		.filter((d) => d.data.guide.id === guide.id)
		.map((d) => {
			if (d.data.division < from || d.data.division > to) {
				throw new Error(`Division ${d.data.division} ligger utanför ${guide.data.name} (${from}–${to})`);
			}
			for (const key of d.data.adaptations.flatMap((a) => a.facts.map((f) => f.key))) {
				if (commonKeys.has(key)) {
					throw new Error(
						`Division ${d.data.division} upprepar nivåguidens faktum "${key}" – lagra bara avvikelser`,
					);
				}
			}
			return {
				division: d.data.division,
				// Endast verifierade anpassningar publiceras.
				adaptations: d.data.adaptations.filter((a) => a.status === 'verifierad'),
			};
		})
		.filter((d) => d.adaptations.length > 0)
		.sort((a, b) => a.division - b.division);

	return {
		guide: guide.data,
		season: season.data,
		factGroups: published,
		ruleSections: guide.data.ruleSections,
		unverifiedDivisions,
		divisionAdaptations,
	};
}

// Framtida divisionsvy (ingen publik sida ännu): nivåguidens gemensamma fakta sammanfogade med
// divisionens egna anpassningar vid bygge. Inget dupliceras – gemensamma fakta kommer bara från nivåguiden.
export async function getDivisionView(level: Level, division: number) {
	const { guide, season, factGroups, ruleSections, divisionAdaptations } = await getActiveGuide(level);
	if (division < guide.divisions.from || division > guide.divisions.to) {
		throw new Error(`Division ${division} ingår inte i ${guide.name}`);
	}
	return {
		season,
		division,
		levelName: guide.name,
		commonFactGroups: factGroups.filter((g) => g.appliesTo.includes(division)),
		adaptations: divisionAdaptations.find((d) => d.division === division)?.adaptations ?? [],
		ruleSections: ruleSections
			.map((r) => ({ ...r, statements: r.statements.filter((s) => s.appliesTo.includes(division)) }))
			.filter((r) => r.statements.length > 0),
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
