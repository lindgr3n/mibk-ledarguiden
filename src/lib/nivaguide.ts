import { getCollection } from 'astro:content';

export type Level = 'ljusgron' | 'gron' | 'bla' | 'rod';

// Fakta som varje publicerad nivåguide måste ha (verifierade) för att bygget ska lyckas.
// Kontrolleras bara för aktiv och arkiverad säsong; ett utkast får ha overifierade fakta.
const REQUIRED_FACT_KEYS = ['spelform', 'matchtid', 'plan', 'mal', 'domare', 'sekretariat'];
// Ljusgrön spelar inga matcher och har därför egna obligatoriska fakta.
const REQUIRED_FACT_KEYS_LJUSGRON = ['matcher', 'lagstart', 'traning', 'ledare', 'utrustning'];
const requiredFactKeys = (level: Level) => (level === 'ljusgron' ? REQUIRED_FACT_KEYS_LJUSGRON : REQUIRED_FACT_KEYS);

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
	for (const key of requiredFactKeys(level)) {
		if (!verifiedKeys.includes(key)) {
			throw new Error(
				`${guide.data.name} ${season.data.label}: obligatoriskt faktum saknas bland verifierade faktagrupper: ${key}`,
			);
		}
	}

	// Endast verifierade faktagrupper publiceras.
	const published = guide.data.factGroups.filter((g) => g.status === 'verifierad');
	const covered = new Set(published.flatMap((g) => g.appliesTo));
	const divisions = guide.data.divisions;
	const unverifiedDivisions = divisions
		? Array.from({ length: divisions.to - divisions.from + 1 }, (_, i) => divisions.from + i).filter((d) => !covered.has(d))
		: [];

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
			if (!divisions || d.data.division < divisions.from || d.data.division > divisions.to) {
				throw new Error(`Division ${d.data.division} ligger utanför ${guide.data.name}`);
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
		unverifiedDivisions,
		divisionAdaptations,
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

export function divisionNumbers(divisions?: { from: number; to: number }): number[] {
	if (!divisions) return [];
	return Array.from({ length: divisions.to - divisions.from + 1 }, (_, i) => divisions.from + i);
}

export function describeDivisionRange({ from, to }: { from: number; to: number }): string {
	return describeDivisions(Array.from({ length: to - from + 1 }, (_, i) => from + i));
}

// Nivåerna i visningsordning (röd, blå, grön – som i referensbilderna) för den aktiva säsongen. Divisionerna kommer från innehållet.
export async function getLevelOverview() {
	const season = await getActiveSeason();
	const guides = (await getCollection('nivaguider')).filter((g) => g.data.season.id === season.id);
	const fromGuide = (level: Level) => {
		const guide = guides.find((g) => g.data.level === level);
		if (!guide) throw new Error(`Nivåguide saknas för ${level} i säsong ${season.data.label}`);
		return {
			key: level,
			name: guide.data.name,
			divisions: guide.data.divisions ? describeDivisionRange(guide.data.divisions) : 'Inga matcher',
			href: `/${level}/`,
			state: 'Öppna guiden',
		};
	};
	// Ljusgrön visas sist och bara om säsongen har en ljusgrön guide (äldre säsonger och testfixturer saknar den).
	const levels = [fromGuide('rod'), fromGuide('bla'), fromGuide('gron')];
	if (guides.some((g) => g.data.level === 'ljusgron')) levels.push(fromGuide('ljusgron'));
	return levels;
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
