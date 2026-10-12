import { expect, test } from '@playwright/test';

const matrisSida2 = 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=2';

// Verklig, dokumenterad data på Röd nivå.
test('Röd nivå skiljer nationell regel och distriktsanpassning med giltighet, källa och kontrolldatum', async ({ page }) => {
	await page.goto('/rod/');
	const rules = page.getByRole('region', { name: 'Regler och källor' });
	await expect(rules).toBeVisible();

	const national = rules.locator('[data-rule-source="nationell-regel"]').first();
	await expect(national.getByText('Nationell regel', { exact: true })).toBeVisible();
	await expect(national.getByText('Svensk Innebandy', { exact: true })).toBeVisible();
	await expect(national.getByText('Kontrollerad 2026-10-12')).toBeVisible();

	const district = rules.locator('[data-rule-source="distriktsanpassning"]').first();
	await expect(district.getByText('Distriktsanpassning', { exact: true })).toBeVisible();
	await expect(district.getByText('Västernorrlands IBF', { exact: true })).toBeVisible();
	await expect(district.getByText('Gäller division 5')).toBeVisible();
	await expect(district.getByText('Kontrollerad 2026-10-12')).toBeVisible();
	await expect(district.getByRole('link', { name: /Originalkälla/ })).toHaveAttribute('href', matrisSida2);
});

test('förklaringen visar de tre regeltyperna med varsin beskrivning', async ({ page }) => {
	await page.goto('/rod/');
	const legend = page.getByRole('region', { name: 'Regler och källor' }).locator('[data-rule-legend]');
	await expect(legend.getByText('Nationell regel', { exact: true })).toBeVisible();
	await expect(legend.getByText('Distriktsanpassning', { exact: true })).toBeVisible();
	await expect(legend.getByText('Föreningsvägledning', { exact: true })).toBeVisible();
	await expect(legend.getByText(/ersätter inte reglerna/)).toBeVisible();
});

// Exempelsidan byggs bara i testläge (astro build --mode test) och publiceras aldrig.
test.describe('regelhierarki, alla fall', () => {
	test('en avvikelse visar nationell och distriktsformulering var för sig', async ({ page }) => {
		await page.goto('/test-fixtures/regelhierarki/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
		const section = page.locator('[data-rule-section="avvikelse"]');
		await expect(section.getByText('Avviker från nationell regel')).toBeVisible();

		const national = section.locator('[data-rule-source="nationell-regel"]');
		await expect(national.getByText('Nationell regel', { exact: true })).toBeVisible();
		await expect(national.getByText('Exempel nationell formulering')).toBeVisible();
		await expect(national.getByText('Gäller division 5')).toBeVisible();
		await expect(national.getByText('Kontrollerad 2026-01-02')).toBeVisible();
		await expect(national.getByRole('link', { name: /Originalkälla/ })).toHaveAttribute('href', 'https://example.org/nationell');

		const district = section.locator('[data-rule-source="distriktsanpassning"]');
		await expect(district.getByText('Distriktsanpassning', { exact: true })).toBeVisible();
		await expect(district.getByText('Exempel distriktsformulering')).toBeVisible();
		await expect(district.getByText('Gäller division 5')).toBeVisible();
		await expect(district.getByText('Kontrollerad 2026-01-03')).toBeVisible();
		await expect(district.getByRole('link', { name: /Originalkälla/ })).toHaveAttribute('href', 'https://example.org/distrikt');
	});

	test('föreningsvägledning är skild från reglerna och visas utan originalkälla', async ({ page }) => {
		await page.goto('/test-fixtures/regelhierarki/');
		const club = page.locator('[data-rule-section="rad"] [data-rule-source="foreningsvagledning"]');
		await expect(club.getByText('Föreningsvägledning', { exact: true })).toBeVisible();
		await expect(club.getByText('Moälvens IBK', { exact: true })).toBeVisible();
		await expect(club.getByText(/ersätter inte reglerna/)).toBeVisible();
		await expect(club.getByRole('link', { name: /Originalkälla/ })).toHaveCount(0);
		await expect(page.locator('[data-rule-section="rad"]').getByText('Behöver bekräftas')).toHaveCount(0);
	});

	test('motstridiga källor märks Behöver bekräftas med skäl', async ({ page }) => {
		await page.goto('/test-fixtures/regelhierarki/');
		const section = page.locator('[data-rule-section="konflikt"]');
		await expect(section.getByText('Behöver bekräftas', { exact: true })).toBeVisible();
		await expect(section.getByText('Exempel: källorna säger olika')).toBeVisible();
		// Avvikelsen utan konflikt har ingen varning.
		await expect(page.locator('[data-rule-section="avvikelse"]').getByText('Behöver bekräftas')).toHaveCount(0);
	});
});
