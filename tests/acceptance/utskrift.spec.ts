import { expect, test } from '@playwright/test';

const pages = [
	{ path: '/rod/', h1: /Röd/, sections: ['Snabb översikt'] },
	{ path: '/bla/', h1: /Blå/, sections: ['Snabb översikt', 'Divisionsanpassningar'] },
	{ path: '/matchdagen/', h1: /Matchdagen/, sections: ['Före match', 'Under och efter match'] },
];

for (const p of pages) {
	test(`${p.path} skrivs ut utan navigation, sidfot och genvägar`, async ({ page }) => {
		await page.emulateMedia({ media: 'print' });
		await page.goto(p.path);
		await expect(page.getByRole('navigation', { name: 'Huvudmeny' })).toBeHidden();
		await expect(page.getByRole('contentinfo')).toBeHidden();
		await expect(page.getByRole('navigation', { name: 'Genvägar på sidan' })).toBeHidden();
		await expect(page.locator('.site-header')).toBeHidden();
	});

	test(`${p.path} behåller innehåll, nivå som text, kontrolldatum och källor vid utskrift`, async ({ page }) => {
		await page.emulateMedia({ media: 'print' });
		await page.goto(p.path);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.h1);
		await expect(page.getByText('Säsong 2026/27').first()).toBeVisible();
		for (const name of p.sections) {
			await expect(page.getByRole('heading', { name }).first()).toBeVisible();
		}
		await expect(page.getByText(/Kontrollerad/).first()).toBeVisible();
		await expect(page.getByRole('link', { name: /Originalkälla/ }).first()).toBeVisible();
	});

	test(`${p.path} visar webbadressen till originalkällor vid utskrift`, async ({ page }) => {
		await page.emulateMedia({ media: 'print' });
		await page.goto(p.path);
		const link = page.getByRole('link', { name: /Originalkälla/ }).first();
		const after = await link.evaluate((el) => getComputedStyle(el, '::after').content);
		expect(after).toContain('http');
	});
}

test('skärmvisning behåller navigation och sidfot', async ({ page }) => {
	await page.emulateMedia({ media: 'screen' });
	await page.goto('/rod/');
	await expect(page.getByRole('navigation', { name: 'Huvudmeny' })).toBeVisible();
	await expect(page.getByRole('contentinfo')).toBeVisible();
});
