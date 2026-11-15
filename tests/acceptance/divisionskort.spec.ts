import { expect, test } from '@playwright/test';

test('startsidan har ingen egen divisionspanel: nivåkorten leder till nivåsidorna', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('region', { name: 'Divisioner' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: /^Division \d/ })).toHaveCount(0);
});

test('divisionsrutorna högst upp leder till varsitt kort längre ned på samma sida', async ({ page }) => {
	await page.goto('/rod/');
	const tiles = page.getByRole('list', { name: 'Divisioner i röd nivå' });
	await expect(tiles.getByRole('link')).toHaveCount(5);
	await tiles.getByRole('link', { name: /Division 5/ }).click();
	await expect(page).toHaveURL('/rod/#division-5');
	await expect(page.locator('#division-5')).toBeVisible();
	await expect(page.locator('#division-5').getByRole('heading', { name: 'Division 5' })).toBeVisible();
});

test('varje division har ett kort, och det anger vad den skiljer sig i', async ({ page }) => {
	await page.goto('/rod/');
	// Division 1 skiljer sig i tabell och poängliga, division 2–5 inte alls.
	await expect(page.locator('#division-1')).toContainText('Ja/Ja');
	for (const n of [2, 3, 4, 5]) {
		await expect(page.locator(`#division-${n}`)).toContainText('Inga avvikelser från röd nivå');
	}
	await page.goto('/bla/');
	await expect(page.locator('#division-6')).toContainText('Effektiv tid');
	await expect(page.locator('#division-7')).toContainText('Rullande tid');
	await page.goto('/gron/');
	await expect(page.locator('#division-8')).toContainText('Med målvakt');
	await expect(page.locator('#division-9')).toContainText('Utan målvakt');
});

test('gamla adresser till divisionssidor skickas vidare till kortet på nivåsidan', async ({ page }) => {
	await page.goto('/rod/division-5/');
	await expect(page).toHaveURL('/rod/#division-5');
	await page.goto('/gron/division-8/');
	await expect(page).toHaveURL('/gron/#division-8');
});

test('det finns ingen sida för en division som inte hör till nivån', async ({ request }) => {
	for (const path of ['/gron/division-7/', '/rod/division-6/', '/bla/division-5/']) {
		expect((await request.get(path)).status()).toBe(404);
	}
});
