import { expect, test } from '@playwright/test';

const matrisSida1 = 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=1';

test('Röd nivå nås från Nivåer och visar säsong 2026/27', async ({ page }) => {
	await page.goto('/nivaer/');
	await page.getByRole('link', { name: /Röd nivå/ }).click();
	await expect(page).toHaveURL('/rod/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Röd nivå');
	await expect(page.getByText('Säsong 2026/27')).toBeVisible();
	await expect(page.getByText('division 1–5').first()).toBeVisible();
});

test('de viktigaste matchfakta visas först', async ({ page }) => {
	await page.goto('/rod/');
	await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Matchfakta');
	const facts = page.getByRole('region', { name: 'Matchfakta' });
	for (const [label, value] of [
		['Spelform', '5 utespelare + målvakt'],
		['Speltid', '3 × 15 min effektiv tid'],
		['Plan', '18 × 36 m'],
		['Mål', '160 × 115 cm'],
		['Domare', '2, tillsatta av VIBF'],
		['Sekretariat', 'iBIS Online; resultattavla'],
	]) {
		await expect(facts.getByText(label, { exact: true })).toBeVisible();
		await expect(facts.getByText(value, { exact: true })).toBeVisible();
	}
});

test('varje faktagrupp visar kontrolldatum och länk till originalkälla', async ({ page }) => {
	await page.goto('/rod/');
	const groups = page.locator('[data-fact-group]');
	expect(await groups.count()).toBeGreaterThan(0);
	for (const group of await groups.all()) {
		await expect(group.getByText('Kontrollerad 2026-10-12')).toBeVisible();
		await expect(group.getByRole('link', { name: /Originalkälla/ })).toHaveAttribute(
			'href',
			matrisSida1,
		);
	}
});

test('uppgifter som inte är verifierade för alla divisioner framgår tydligt', async ({ page }) => {
	await page.goto('/rod/');
	await expect(page.getByText(/Division 1–4/)).toBeVisible();
	await expect(page.getByText(/inte verifierade/)).toBeVisible();
});
