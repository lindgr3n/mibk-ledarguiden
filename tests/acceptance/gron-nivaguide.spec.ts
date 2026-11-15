import { expect, test } from '@playwright/test';

const matrisSida1 = /matris-ungdom-2026-27-med-arvoden\.pdf#page=[12]$/;
const matrisSida2 = 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=2';

test('Grön nivå nås från Nivåer och visar säsong 2026/27 och division 8–9', async ({ page }) => {
	await page.goto('/nivaer/');
	await page.getByRole('link', { name: /Gå till grön nivå/ }).click();
	await expect(page).toHaveURL('/gron/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Grön nivå');
	await expect(page.getByText('Säsong 2026/27')).toBeVisible();
	await expect(page.getByText('division 8–9').first()).toBeVisible();
});

test('Grön nivå visar matchfakta först, med källa och kontrolldatum', async ({ page }) => {
	await page.goto('/gron/');
	await expect(page.getByRole('heading', { level: 2, name: 'Snabb översikt' })).toBeVisible();
	const facts = page.getByRole('region', { name: 'Snabb översikt' });
	for (const [label, value] of [
		['Spelform', '3 mot 3, lokala sammandrag'],
		['Speltid', '1 × 15 min rullande tid'],
		['Byten', 'Tutbyte, 90 sek'],
		['Plan', '3 sargbitar bred och 6 eller 7 sargbitar lång, plus hörn (ca 20 × 12 m, ej mätt)'],
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
		await expect(group.getByText(/Kontrollerad \d{4}-\d{2}-\d{2}/)).toBeVisible();
		await expect(group.getByRole('link', { name: /^sida \d/ })).toHaveAttribute('href', matrisSida1);
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

test('divisionskorten för grön nivå visar rätt division', async ({ page }) => {
	await page.goto('/gron/');
	await expect(page.locator('#division-9')).toContainText('Utan målvakt; små mål (ca 60 × 40 cm)');
	await expect(page.locator('#division-8')).toContainText('Med målvakt; mål 120 × 90 cm');
});

test('regelavsnittet Regler och källor finns inte längre på nivåsidan', async ({ page }) => {
	await page.goto('/gron/');
	await expect(page.getByRole('heading', { name: 'Regler och källor' })).toHaveCount(0);
	await expect(page.getByText('Nationell spelform och distriktets anpassning')).toHaveCount(0);
	await expect(page.getByText(/Nationell regel|Föreningsvägledning/)).toHaveCount(0);
});
