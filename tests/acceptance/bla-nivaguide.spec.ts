import { expect, test } from '@playwright/test';

const matrisSida1 = 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=1';

test('Blå nivå nås från Nivåer och visar säsong 2026/27 och division 6–7', async ({ page }) => {
	await page.goto('/nivaer/');
	await page.getByRole('link', { name: /Blå nivå/ }).click();
	await expect(page).toHaveURL('/bla/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blå nivå');
	await expect(page.getByText('Säsong 2026/27')).toBeVisible();
	await expect(page.getByText('division 6–7').first()).toBeVisible();
});

test('Blå nivå har samma struktur som Röd nivå, matchfakta först', async ({ page }) => {
	await page.goto('/bla/');
	await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Snabb översikt');
	const facts = page.getByRole('region', { name: 'Snabb översikt' });
	for (const [label, value] of [
		['Spelform', '4 utespelare + målvakt'],
		['Plan', '15 × 30 m'],
		['Mål', '120 × 90 cm'],
		['Domare', '2, tillsatta av VIBF'],
		['Sekretariat', 'Tidtagare + matchklocka; ingen resultattavla'],
	]) {
		await expect(facts.getByText(label, { exact: true })).toBeVisible();
		await expect(facts.getByText(value, { exact: true })).toBeVisible();
	}
	for (const group of await page.locator('[data-fact-group]').all()) {
		await expect(group.getByText('Kontrollerad 2026-10-12')).toBeVisible();
		await expect(group.getByRole('link', { name: /Originalkälla/ })).toHaveAttribute('href', matrisSida1);
	}
});

test('gemensamma fakta är bara verifierade för division 6 och det framgår', async ({ page }) => {
	await page.goto('/bla/');
	const facts = page.getByRole('region', { name: 'Snabb översikt' });
	await expect(facts.getByText(/Division 7 är inte verifierade ännu/)).toBeVisible();
});

test('divisionsanpassningar visas separat: division 6 effektiv tid, division 7 overifierad', async ({ page }) => {
	await page.goto('/bla/');
	const adaptations = page.getByRole('region', { name: 'Divisionsanpassningar' });
	await expect(adaptations).toBeVisible();

	const d6 = adaptations.locator('[data-division="6"]');
	await expect(d6.getByRole('heading', { level: 3 })).toHaveText('Division 6');
	await expect(d6.getByText('Effektiv tid', { exact: true })).toBeVisible();
	await expect(d6.getByText('Flygande', { exact: true })).toBeVisible();
	await expect(d6.getByText('Distriktsanpassning', { exact: true })).toBeVisible();

	// Division 7 är inte verifierad mot originalkällan: inga publicerade uppgifter, bara en
	// tydligt märkt anteckning som hänvisar till specen och visar att skillnaden mot division 6 finns.
	const d7 = adaptations.locator('[data-division="7"]');
	await expect(d7.getByRole('heading', { level: 3 })).toHaveText('Division 7');
	await expect(d7.locator('dl')).toHaveCount(0);
	await expect(d7.getByText('Rullande tid', { exact: true })).toHaveCount(0);
	await expect(d7.getByText('Effektiv tid', { exact: true })).toHaveCount(0);
	const pending = d7.locator('[data-unverified-adaptation]');
	await expect(pending.getByRole('heading', { level: 4 })).toContainText('ej verifierat');
	await expect(pending).toContainText('rullande tid');
	await expect(pending).toContainText('särskilda bytesregler');
	await expect(pending).toContainText('Further Notes');
	await expect(pending).toContainText('inte verifierat mot originalkällan');

	// Varje verifierad anpassning har kontrolldatum och originalkälla.
	for (const group of await adaptations.locator('[data-adaptation]').all()) {
		await expect(group.getByText('Kontrollerad 2026-10-12')).toBeVisible();
		await expect(group.getByRole('link', { name: /Originalkälla/ })).toHaveAttribute('href', matrisSida1);
	}
});

test('gemensam information dupliceras inte i divisionsanpassningarna', async ({ page }) => {
	await page.goto('/bla/');
	const adaptations = page.getByRole('region', { name: 'Divisionsanpassningar' });
	for (const common of ['4 utespelare + målvakt', '15 × 30 m', '120 × 90 cm']) {
		await expect(adaptations.getByText(common)).toHaveCount(0);
	}
});

test('divisionssidor finns bara under nivåns adress med divisionsnamn', async ({ request }) => {
	for (const path of ['/bla/6/', '/bla/7/', '/division-6/', '/division-7/']) {
		expect((await request.get(path)).status()).toBe(404);
	}
});
