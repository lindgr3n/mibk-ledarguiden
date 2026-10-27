import { expect, test } from '@playwright/test';

const matrisSida1 = 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=1';
const matrisSida2 = 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=2';

test('Grön nivå nås från Nivåer och visar säsong 2026/27 och division 8–9', async ({ page }) => {
	await page.goto('/nivaer/');
	await page.getByRole('link', { name: /Grön nivå/ }).click();
	await expect(page).toHaveURL('/gron/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Grön nivå');
	await expect(page.getByText('Säsong 2026/27')).toBeVisible();
	await expect(page.getByText('division 8–9').first()).toBeVisible();
});

test('Grön nivå visar matchfakta först, med källa och kontrolldatum', async ({ page }) => {
	await page.goto('/gron/');
	await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Snabb översikt');
	const facts = page.getByRole('region', { name: 'Snabb översikt' });
	for (const [label, value] of [
		['Spelform', '3 mot 3, lokala sammandrag'],
		['Speltid', '1 × 15 min rullande tid'],
		['Byten', 'Tutbyte, 90 sek'],
		['Plan', '3 sargbitar bred och 6 eller 7 sargbitar lång, plus hörn'],
		['Domare', '1 föreningsdomare'],
		['Sekretariat', 'Tidtagare, även för byten'],
		['Tabell', 'Ingen tabell och ingen resultattavla'],
	]) {
		await expect(facts.getByText(label, { exact: true })).toBeVisible();
		await expect(facts.getByText(value, { exact: true })).toBeVisible();
	}
	const groups = page.locator('[data-fact-group]');
	await expect(groups.first()).toBeVisible();
	for (const group of await groups.all()) {
		await expect(group.getByText('Kontrollerad 2026-10-27')).toBeVisible();
		await expect(group.getByRole('link', { name: /Originalkälla/ })).toHaveAttribute('href', matrisSida1);
	}
});

test('division 8 och 9 skiljer sig åt i målvakt och mål, utan att upprepa nivåns fakta', async ({ page }) => {
	await page.goto('/gron/');
	const adaptations = page.getByRole('region', { name: 'Divisionsanpassningar' });
	await expect(adaptations.locator('[data-division="8"]')).toContainText('Med målvakt; mål 120 × 90 cm');
	await expect(adaptations.locator('[data-division="9"]')).toContainText('Utan målvakt; små mål (ca 60 × 40 cm)');
	await expect(adaptations.getByText('Tutbyte, 90 sek')).toHaveCount(0);
});

test('lokal regel för division 8–9 visas som distriktsanpassning med källa', async ({ page }) => {
	await page.goto('/gron/');
	const rules = page.locator('main');
	await expect(rules.getByText(/Inga mål får göras från egen planhalva/)).toBeVisible();
	await expect(rules.getByRole('link', { name: /Originalkälla/ }).filter({ has: page.locator(`[href="${matrisSida2}"]`) })
		.or(rules.locator(`a[href="${matrisSida2}"]`)).first()).toBeVisible();
});

test('divisionssidorna för grön nivå visar rätt division', async ({ page }) => {
	await page.goto('/gron/division-9/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Division 9');
	await expect(page.getByText('Utan målvakt; små mål (ca 60 × 40 cm)')).toBeVisible();
	await page.goto('/gron/division-8/');
	await expect(page.getByText('Med målvakt; mål 120 × 90 cm')).toBeVisible();
});

test('nationell spelform visas bredvid distriktets anpassning, utan Behöver bekräftas', async ({ page }) => {
	await page.goto('/gron/');
	const section = page.locator('main').getByText('Nationell spelform och distriktets anpassning').first();
	await expect(section).toBeVisible();
	await expect(page.getByText(/spelplanen ska normalt vara 20 × 12 meter/).first()).toBeVisible();
	await expect(page.getByText(/små mål \(ca 60 × 40 cm\)/).first()).toBeVisible();
	await expect(page.getByText('Behöver bekräftas')).toHaveCount(0);
	await expect(page.locator('a[href^="https://www.innebandy.se/media/ta5bn1jz/"]').first()).toBeVisible();
});
