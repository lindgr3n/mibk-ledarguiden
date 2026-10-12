import { expect, test } from '@playwright/test';

// Den publicerade sajten (port 4321) innehåller ingen uppdateringsnotis.
test('Röd nivå visar ingen uppdateringsnotis när den saknas', async ({ page }) => {
	await page.goto('/rod/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Röd nivå');
	await expect(page.getByRole('region', { name: 'Uppdatering under säsongen' })).toHaveCount(0);
	await expect(page.getByText('Uppdatering')).toHaveCount(0);
});

// Fixturbygget (port 4322) bygger från tests/fixtures/content, bara för testerna.
test.describe('med en uppdateringsnotis i innehållet', () => {
	test.use({ baseURL: 'http://localhost:4322' });

	test('Röd nivå visar notisens datum, text och källa', async ({ page }) => {
		await page.goto('/rod/');
		const notice = page.getByRole('region', { name: 'Uppdatering under säsongen' });
		await expect(notice).toBeVisible();
		await expect(notice.getByText('2031-01-02')).toBeVisible();
		await expect(notice.getByText('TESTNOTIS: byten ändrade i fixturen.')).toBeVisible();
		await expect(notice.getByRole('link', { name: 'Testkälla' })).toHaveAttribute(
			'href',
			'https://example.com/testkalla',
		);
	});
});
