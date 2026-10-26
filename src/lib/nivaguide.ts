import { getCollection } from 'astro:content';

export type Level = 'gron' | 'bla' | 'rod';

// Fakta som varje publicerad nivåguide måste ha (verifierade) för att bygget ska lyckas.
// Kontrolleras bara för aktiv och arkiverad säsong; ett utkast får ha overifierade fakta.
const REQUIRED_FACT_KEYS = ['spelform', 'matchtid', 'plan', 'mal', 'domare', 'sekretariat'];

// Den enda aktiva säsongen (ADR 0001). Bygget misslyckas om det inte finns exakt en.
export async function getActiveSeason() {
	const active = (await getCollection('sasonger')).filter((s) => s.data.status === 'aktiv');
	if (active.length !== 1) {
		throw new Error(`Exakt en säsong måste vara aktiv, hittade ${active.length}`);
	}
	return active[0];
}

// Säsong via id (t.ex. 2026-2027); misslyckas om den inte finns.
export async function getSeasonById(id: string) {
	const season = (await getCollection('sasonger')).find((s) => s.id === id);
	if (!season) throw new Error(`Okänd säsong: ${id}`);
	return season;
}

// Arkiverade säsonger: publiceras skrivskyddat på permanenta adresser /sasonger/<säsong>/.
export async function getArchivedSeasons() {
	return (await getCollection('sasonger')).filter((s) => s.data.status === 'arkiverad');
}

// Hämtar nivåguiden för en nivå i den aktiva säsongen (stabila adresser som /rod/, ADR 0001).
// Utkast och arkiverade säsonger publiceras inte här.
export async function getActiveGuide(level: Level) {
	return getSeasonGuide(await getActiveSeason(), level);
}

// Nivåguide för en given säsong. Utkast kan aldrig publiceras.
export async function getSeasonGuide(
	season: Awaited<ReturnType<typeof getActiveSeason>>,
	level: Level,
) {
	if (season.data.status === 'utkast') {
		throw new Error(`Säsong ${season.data.label} är ett utkast och får inte publiceras`);
	}
	const guide = (await getCollection('nivaguider')).find(
		(g) => g.data.season.id === season.id && g.data.level === level,
	);
	if (!guide) throw new Error(`Ingen nivåguide för ${level} i säsong ${season.data.label}`);

	const verifiedKeys = guide.data.factGroups
		.filter((g) => g.status === 'verifierad')
		.flatMap((g) => g.facts.map((f) => f.key));
	for (const key of REQUIRED_FACT_KEYS) {
		if (!verifiedKeys.includes(key)) {
			throw new Error(
				`${guide.data.name} ${season.data.label}: obligatoriskt faktum saknas bland verifierade faktagrupper: ${key}`,
			);
		}
	}

	// Endast verifierade faktagrupper publiceras.
	const published = guide.data.factGroups.filter((g) => g.status === 'verifierad');
	const covered = new Set(published.flatMap((g) => g.appliesTo));
	const { from, to } = guide.data.divisions;
	const unverifiedDivisions = Array.from({ length: to - from + 1 }, (_, i) => from + i).filter(
		(d) => !covered.has(d),
	);

	// Divisionsanpassningar (ADR 0002): bara avvikelser, aldrig gemensamma fakta. Bygget misslyckas
	// om en division ligger utanför nivån eller om en anpassning upprepar en faktanyckel som nivåguiden äger
	// för just den divisionen (en faktagrupp som inte gäller divisionen räknas inte).
	const commonKeysFor = (division: number) =>
		new Set(
			guide.data.factGroups
				.filter((g) => g.appliesTo.includes(division))
				.flatMap((g) => g.facts.map((f) => f.key)),
		);
	const divisionAdaptations = (await getCollection('divisionsanpassningar'))
		.filter((d) => d.data.guide.id === guide.id)
		.map((d) => {
			if (d.data.division < from || d.data.division > to) {
				throw new Error(`Division ${d.data.division} ligger utanför ${guide.data.name} (${from}–${to})`);
			}
			const commonKeys = commonKeysFor(d.data.division);
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
				// Overifierade anpassningar publiceras aldrig; bara en anteckning om att de finns (med
				// källhänvisning till specen) visas, aldrig själva uppgifterna.
				unverified: d.data.adaptations.flatMap((a) =>
					a.status === 'overifierad' && a.unverifiedNote
						? [{ id: a.id, title: a.title, note: a.unverifiedNote }]
						: [],
				),
			};
		})
		.filter((d) => d.adaptations.length > 0 || d.unverified.length > 0)
		.sort((a, b) => a.division - b.division);

	return {
		guide: guide.data,
		season: season.data,
		factGroups: published,
		// Endast verifierade regeluttalanden publiceras; avsnitt utan sådana utelämnas.
		ruleSections: guide.data.ruleSections
			.map((r) => ({ ...r, statements: r.statements.filter((st) => st.status === 'verifierad') }))
			.filter((r) => r.statements.length > 0),
		unverifiedDivisions,
		divisionAdaptations,
	};
}

// Framtida divisionsvy (ingen publik sida ännu): nivåguidens gemensamma fakta sammanfogade med
// divisionens egna anpassningar vid bygge. Inget dupliceras – gemensamma fakta kommer bara från nivåguiden.
export async function getDivisionView(level: Level, division: number) {
	const { guide, season, factGroups, ruleSections, divisionAdaptations, unverifiedDivisions } =
		await getActiveGuide(level);
	if (division < guide.divisions.from || division > guide.divisions.to) {
		throw new Error(`Division ${division} ingår inte i ${guide.name}`);
	}
	return {
		season,
		division,
		levelName: guide.name,
		commonFactGroups: factGroups.filter((g) => g.appliesTo.includes(division)),
		adaptations: divisionAdaptations.find((d) => d.division === division)?.adaptations ?? [],
		unverifiedAdaptations: divisionAdaptations.find((d) => d.division === division)?.unverified ?? [],
		sourceUrl: factGroups[0]?.source,
		unverifiedDivisions,
		ruleSections: ruleSections
			.map((r) => ({ ...r, statements: r.statements.filter((s) => s.appliesTo.includes(division)) }))
			.filter((r) => r.statements.length > 0),
	};
}

// "Division 1–4" / "Division 3" / "Division 1, 3 och 5" för en lista divisioner.
export function describeDivisions(divisions: number[]): string {
	const sorted = [...divisions].sort((a, b) => a - b);
	const isRange = sorted.length > 1 && sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
	if (sorted.length === 1) return `Division ${sorted[0]}`;
	if (isRange) return `Division ${sorted[0]}–${sorted[sorted.length - 1]}`;
	return `Division ${sorted.slice(0, -1).join(', ')} och ${sorted[sorted.length - 1]}`;
}

export function divisionNumbers({ from, to }: { from: number; to: number }): number[] {
	return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

export function describeDivisionRange({ from, to }: { from: number; to: number }): string {
	return describeDivisions(Array.from({ length: to - from + 1 }, (_, i) => from + i));
}

// Grön nivå har ingen nivåguide ännu, så dess divisioner kan inte hämtas från innehållet.
// Enda platsen där de anges; startsidan och Nivåer delar den (specen, issue #2).
export const GRON_PLACEHOLDER = { name: 'Grön nivå', divisions: { from: 8, to: 9 }, state: 'Kommer senare' };

// Nivåerna i visningsordning (röd, blå, grön – som i referensbilderna) för den aktiva säsongen. Divisionerna för blå och röd
// kommer från innehållet; en nivå utan guide (grön) har ingen href.
export async function getLevelOverview() {
	const season = await getActiveSeason();
	const guides = (await getCollection('nivaguider')).filter((g) => g.data.season.id === season.id);
	const fromGuide = (level: 'bla' | 'rod') => {
		const guide = guides.find((g) => g.data.level === level);
		if (!guide) throw new Error(`Nivåguide saknas för ${level} i säsong ${season.data.label}`);
		return {
			key: level,
			name: guide.data.name,
			divisions: describeDivisionRange(guide.data.divisions),
			href: `/${level}/`,
			state: 'Öppna guiden',
		};
	};
	return [
		fromGuide('rod'),
		fromGuide('bla'),
		{
			key: 'gron' as const,
			name: GRON_PLACEHOLDER.name,
			divisions: describeDivisionRange(GRON_PLACEHOLDER.divisions),
			href: undefined,
			state: GRON_PLACEHOLDER.state,
		},
	];
}

// Alla arkivsidor som ska genereras: en per arkiverad säsong och nivåguide.
export async function getArchivePaths() {
	const guides = await getCollection('nivaguider');
	return (await getArchivedSeasons()).flatMap((season) =>
		guides
			.filter((g) => g.data.season.id === season.id)
			.map((g) => ({ params: { season: season.id, level: g.data.level }, props: { seasonId: season.id } })),
	);
}
