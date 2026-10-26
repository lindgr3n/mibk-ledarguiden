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
	await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Snabb översikt');
	const facts = page.getByRole('region', { name: 'Snabb översikt' });
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

test('alla divisioner 1–5 är verifierade; division 1 avviker bara på tabell och poängliga', async ({ page }) => {
	await page.goto('/rod/');
	await expect(page.getByText(/inte verifierade ännu/)).toHaveCount(0);
	await expect(page.getByText(/verifierat för division 1–5/)).toBeVisible();

	// Nivåguiden äger det gemensamma: tabell / poängliga Ja/Nej gäller division 2–5.
	const tabell = page.locator('[data-fact-group="tabell-och-poangliga"]');
	await expect(tabell).toContainText('Gäller division 2–5');

	// Division 1:s avvikelse ligger som divisionsanpassning.
	const d1 = page.getByRole('region', { name: 'Divisionsanpassningar' }).locator('[data-division="1"]');
	await expect(d1.getByText('Ja/Ja', { exact: true })).toBeVisible();
	await expect(d1.getByText('Tabell / poängliga', { exact: true })).toBeVisible();
	await expect(d1.getByText('Distriktsanpassning', { exact: true })).toBeVisible();
});
