import { expect, test } from '@playwright/test';

const matrisSida1 = 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=1';
const matchflytt = 'https://www.innebandy.se/vasternorrland/tavling/matchflytt';

test('checklistan nås via menyn och har en rubrik på nivå 1', async ({ page }) => {
	await page.goto('/');
	await page
		.getByRole('navigation', { name: 'Huvudmeny' })
		.getByRole('link', { name: 'Matchdagen', exact: true })
		.click();
	await expect(page).toHaveURL('/matchdagen/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Matchdagen');
	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await expect(page.getByText('Säsong 2026/27')).toBeVisible();
});

test('alla checklistepunkter finns', async ({ page }) => {
	await page.goto('/matchdagen/');
	const checklist = page.getByRole('region', { name: 'Före match' });
	for (const text of [
		/licens och skyddsglasögon/,
		/iBIS/,
		/ledarlicens/,
		/två matchvärdar med rosa västar/,
		/sekretariat/i,
	]) {
		await expect(checklist.getByRole('listitem').filter({ hasText: text }).first()).toBeVisible();
	}
	await expect(page.getByRole('region', { name: 'Under och efter match' })).toBeVisible();
});

test('avsnitten nås med ett tryck från genvägar överst', async ({ page }) => {
	await page.goto('/matchdagen/');
	const shortcuts = page.getByRole('navigation', { name: 'Genvägar på sidan' });
	await expect(shortcuts.getByRole('link')).toHaveText([
		'Före match',
		'Under och efter match',
		'Om matchen behöver flyttas',
	]);
	await shortcuts.getByRole('link', { name: 'Om matchen behöver flyttas' }).click();
	await expect(page).toHaveURL(/#matchflytt$/);
	await expect(page.getByRole('heading', { level: 2, name: 'Om matchen behöver flyttas' })).toBeInViewport();
});

test('uppgifter visar kontrolldatum och originalkälla', async ({ page }) => {
	await page.goto('/matchdagen/');
	const before = page.getByRole('region', { name: 'Före match' });
	await expect(before.getByText('Kontrollerad 2026-10-12').first()).toBeVisible();
	await expect(before.getByRole('link', { name: /Originalkälla/ }).first()).toHaveAttribute(
		'href',
		matrisSida1,
	);
});

test('matchflytt länkar till aktuell information utan hårdkodade avgifter eller tidsgränser', async ({
	page,
}) => {
	await page.goto('/matchdagen/');
	const section = page.getByRole('region', { name: 'Om matchen behöver flyttas' });
	await expect(section.getByRole('link', { name: /matchflyttsinformation/ })).toHaveAttribute(
		'href',
		matchflytt,
	);
	await expect(section.getByText(/avboka halltid/i)).toBeVisible();
	const text = await section.innerText();
	expect(text).not.toMatch(/\d+\s*kr\b/i);
	expect(text).not.toMatch(/\d+\s*dagar/i);
});

test('föreningsvägledning förklaras en gång på sidan, inte under varje punkt', async ({ page }) => {
	await page.goto('/matchdagen/');
	const items = page.locator('li[data-item]').filter({ hasText: 'Föreningsvägledning' });
	expect(await items.count()).toBeGreaterThan(1);
	// Förklaringen står en enda gång, utanför checklistans punkter.
	await expect(page.getByText(/ersätter inte reglerna/)).toHaveCount(1);
	await expect(page.locator('li[data-item]').getByText(/ersätter inte reglerna/)).toHaveCount(0);
	await expect(page.locator('.rule-note')).toContainText('Moälvens egna råd och rutiner');
});

test('varje punkt länkar till det dokument och den sida där kravet står', async ({ page }) => {
	await page.goto('/matchdagen/');
	const lokala = 'https://www.innebandy.se/media/sb3hooik/lokala-forutsattningar-vnibf-2026-2027.pdf#page=11';
	// Laguppställningen i iBIS "i god tid" står i Lokala förutsättningar (inte i matrisen).
	await expect(
		page.locator('li[data-item="ibis"]').getByRole('link', { name: /Originalkälla: Lokala förutsättningar/ }),
	).toHaveAttribute('href', lokala);
	// Licens, ledare i båset, matchvärdar, sekretariat och klimat står på matrisens sida 1.
	for (const id of ['licens-skyddsglasogon', 'ledarlicens', 'matchvardar', 'sekretariat', 'tryggt-klimat']) {
		await expect(
			page.locator(`li[data-item="${id}"]`).getByRole('link', { name: /Originalkälla: Västernorrlands ungdomsmatris/ }),
		).toHaveAttribute('href', matrisSida1);
	}
});

test('källan anger var i dokumentet kravet står, inte bara vilken PDF', async ({ page }) => {
	await page.goto('/matchdagen/');
	await expect(page.locator('li[data-item="sekretariat"]')).toContainText('Divisionstabellen, kolumnen Sekretariat');
	await expect(page.locator('li[data-item="ledarlicens"]')).toContainText('Grundutbildning barn/ungdom och Steg 1');
	await expect(page.locator('li[data-item="licens-skyddsglasogon"]')).toContainText('Inledande text');
	await expect(page.locator('li[data-item="ibis"]')).toContainText('punkt b');
});
