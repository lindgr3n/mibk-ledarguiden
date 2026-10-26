import { expect, test } from '@playwright/test';

const pages = [
	'/',
	'/nivaer/',
	'/rod/',
	'/bla/',
	'/rod/division-1/',
	'/rod/division-5/',
	'/bla/division-6/',
	'/bla/division-7/',
	'/matchdagen/',
	'/regler/',
];

for (const path of pages) {
	test(`${path}: externa länkar öppnas i ny flik, interna i samma`, async ({ page, baseURL }) => {
		await page.goto(path);
		const links = await page.locator('main a[href]').evaluateAll((els) =>
			els.map((e) => ({
				href: (e as HTMLAnchorElement).href,
				target: e.getAttribute('target'),
				rel: e.getAttribute('rel') ?? '',
				text: e.textContent ?? '',
			})),
		);
		for (const link of links) {
			if (link.href.startsWith(baseURL!)) {
				expect(link.target, `intern länk ${link.href}`).toBeNull();
			} else {
				expect(link.target, `extern länk ${link.href}`).toBe('_blank');
				expect(link.rel).toContain('noopener');
				expect(link.rel).toContain('noreferrer');
				expect(link.text).toContain('öppnas i ny flik');
			}
		}
	});
}

test('originalkällor visar var dokumentet finns på förbundets webbplats, med länk till både sidan och PDF:en', async ({ page }) => {
	const matris = 'https://www.innebandy.se/vasternorrland/tavling/matris-serieoversikt';
	const lokala = 'https://www.innebandy.se/vasternorrland/tavling/lokala-tavlingsbestammelser';

	await page.goto('/matchdagen/');
	const licens = page.locator('li[data-item="licens-skyddsglasogon"]');
	await expect(licens).toContainText('Finns på');
	await expect(licens.getByRole('link', { name: /Matris – Serieöversikt/ })).toHaveAttribute('href', matris);
	await expect(licens.getByRole('link', { name: /Originalkälla/ })).toHaveAttribute('href', /matris-ungdom.*\.pdf#page=1/);
	await expect(
		page.locator('li[data-item="ibis"]').getByRole('link', { name: /Lokala tävlingsbestämmelser/ }),
	).toHaveAttribute('href', lokala);

	await page.goto('/rod/');
	const group = page.locator('[data-fact-group]').first();
	await expect(group.getByRole('link', { name: /Matris – Serieöversikt/ })).toHaveAttribute('href', matris);
	await page.goto('/rod/division-5/');
	await expect(page.getByRole('link', { name: /Matris – Serieöversikt/ }).first()).toHaveAttribute('href', matris);
});
