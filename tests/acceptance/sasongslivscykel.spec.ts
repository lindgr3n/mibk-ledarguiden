import { expect, test } from '@playwright/test';

// Säsongslivscykel (ADR 0001). Fixturbyggen innehåller bara påhittat testinnehåll:
//  - port 4422: före aktivering (2026/27 aktiv, 2027/28 dolt utkast)
//  - port 4423: efter aktivering (2026/27 arkiverad, 2027/28 aktiv)
// Den publicerade sajten (4421) har en enda säsong och därmed inget arkiv.

test.describe('den publicerade sajten med en enda säsong', () => {
	test('har inga arkivadresser', async ({ request }) => {
		for (const path of ['/sasonger/2026-2027/rod/', '/sasonger/2026-2027/bla/', '/sasonger/2027-2028/rod/']) {
			expect((await request.get(path)).status(), path).toBe(404);
		}
	});
});

test.describe('före aktivering: nästa säsong är ett dolt utkast', () => {
	test.use({ baseURL: 'http://localhost:4422' });

	test('stabila adresser visar den aktiva säsongen utan spår av utkastet', async ({ page }) => {
		for (const path of ['/rod/', '/bla/']) {
			await page.goto(path);
			await expect(page.getByText('Säsong 2026/27')).toBeVisible();
			await expect(page.getByText('UTKASTFAKTA')).toHaveCount(0);
			await expect(page.getByText('2027/28')).toHaveCount(0);
			await expect(page.getByText(/Arkiv/)).toHaveCount(0);
		}
	});

	test('utkastet nås inte på någon säsongsadress', async ({ request }) => {
		for (const path of ['/sasonger/2027-2028/rod/', '/sasonger/2027-2028/bla/']) {
			expect((await request.get(path)).status(), path).toBe(404);
		}
	});

	test('den aktiva säsongen ligger inte heller på en arkivadress', async ({ request }) => {
		expect((await request.get('/sasonger/2026-2027/rod/')).status()).toBe(404);
	});
});

test.describe('efter aktivering: föregående säsong är ett arkiv', () => {
	test.use({ baseURL: 'http://localhost:4423' });

	test('stabila adresser visar den nya säsongen', async ({ page }) => {
		for (const path of ['/rod/', '/bla/']) {
			await page.goto(path);
			await expect(page.getByText('Säsong 2027/28')).toBeVisible();
			await expect(page.getByText('NYFAKTA')).toBeVisible();
			await expect(page.getByText('ARKIVFAKTA')).toHaveCount(0);
			await expect(page.getByText(/Arkiv –/)).toHaveCount(0);
		}
	});

	test('den gamla säsongen finns på permanent säsongsbunden adress, markerad som arkiv', async ({ page }) => {
		for (const [path, name] of [
			['/sasonger/2026-2027/rod/', 'Röd nivå'],
			['/sasonger/2026-2027/bla/', 'Blå nivå'],
		]) {
			await page.goto(path);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
			const banner = page.getByRole('note', { name: 'Arkiv' });
			await expect(banner).toContainText('Arkiv – gällde säsong 2026/27');
			await expect(banner.getByRole('link', { name: /aktuell säsong/i })).toHaveAttribute(
				'href',
				path.endsWith('rod/') ? '/rod/' : '/bla/',
			);
			await expect(page.getByText('ARKIVFAKTA')).toBeVisible();
			await expect(page.getByText('NYFAKTA')).toHaveCount(0);
		}
	});

	test('den aktiva säsongen har ingen arkivadress och Matchdagen har inget arkiv', async ({ request, page }) => {
		expect((await request.get('/sasonger/2027-2028/rod/')).status()).toBe(404);
		expect((await request.get('/sasonger/2026-2027/matchdagen/')).status()).toBe(404);
		await page.goto('/matchdagen/');
		await expect(page.getByText('Säsong 2027/28')).toBeVisible();
	});
});
