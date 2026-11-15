import { expect, test } from '@playwright/test';

const nivaer = [
	{ key: 'gron', namn: 'Grön nivå' },
	{ key: 'bla', namn: 'Blå nivå' },
	{ key: 'rod', namn: 'Röd nivå' },
] as const;

test('Matchdagen finns inte som eget menyval, och den gamla adressen går till nivåerna', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('navigation', { name: 'Huvudmeny' }).getByRole('link', { name: 'Matchdagen' })).toHaveCount(0);
	await page.goto('/matchdagen/');
	await expect(page).toHaveURL('/nivaer/');
});

for (const n of nivaer) {
	test(`${n.namn}: kortet på nivåsidan leder till nivåns matchdag`, async ({ page }) => {
		await page.goto(`/${n.key}/`);
		await page.locator('.matchday-card').getByRole('link', { name: /matchdagens checklista/ }).click();
		await expect(page).toHaveURL(`/${n.key}/matchdagen/`);
		await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Matchdagen');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(n.namn);
		await expect(page.getByText('Säsong 2026/27')).toBeVisible();
		await page.getByRole('link', { name: new RegExp(`Tillbaka till ${n.namn.toLowerCase()}`) }).click();
		await expect(page).toHaveURL(`/${n.key}/`);
	});
}

test('ljusgrön har ingen matchdag', async ({ request }) => {
	expect((await request.get('/ljusgron/matchdagen/')).status()).toBe(404);
});

test('punkterna som gäller alla nivåer finns på alla tre sidorna', async ({ page }) => {
	for (const n of nivaer) {
		await page.goto(`/${n.key}/matchdagen/`);
		for (const id of ['laguppstallning-ibis', 'licenser', 'matchvardar', 'sekretariat', 'glasogon', 'domare']) {
			await expect(page.locator(`li[data-item="${id}"]`)).toBeVisible();
		}
	}
	await page.goto('/gron/matchdagen/');
	await expect(page.locator('li[data-item="sekretariat"]')).toContainText('20 minuter före matchstart');
	await expect(page.locator('li[data-item="licenser"]')).toContainText('personlig spelarlicens');
});

test('resultat och arvode skiljer sig per nivå', async ({ page }) => {
	await page.goto('/gron/matchdagen/');
	await expect(page.locator('li[data-item="resultat-gron"]')).toContainText('Inga resultat rapporteras');
	await expect(page.locator('li[data-item="arvode-gron"]')).toContainText('betala domaren direkt');
	await expect(page.locator('li[data-item="resultat-bla"]')).toHaveCount(0);
	await expect(page.locator('li[data-item="foreningsdomare"]')).toBeVisible();

	await page.goto('/bla/matchdagen/');
	await expect(page.locator('li[data-item="resultat-bla"]')).toContainText('slutresultatet');
	await expect(page.locator('li[data-item="arvode-bla-rod"]')).toContainText('Förbundet betalar domaren');
	await expect(page.locator('li[data-item="resultat-gron"]')).toHaveCount(0);
	await expect(page.locator('li[data-item="foreningsdomare"]')).toHaveCount(0);
	await expect(page.locator('li[data-item="kalla-ibis"]')).toBeVisible();

	await page.goto('/rod/matchdagen/');
	await expect(page.locator('li[data-item="handelser"]')).toContainText('löpande händelser');
	await expect(page.locator('li[data-item="effektiv-tid-rod"]')).toBeVisible();
	await expect(page.locator('li[data-item="effektiv-tid-bla"]')).toHaveCount(0);
});

test('punkter för hemmalaget är markerade, andra inte', async ({ page }) => {
	await page.goto('/gron/matchdagen/');
	await expect(page.locator('li[data-item="matchvardar"] .home-tag')).toHaveText('Hemmalag/arrangör');
	await expect(page.locator('li[data-item="licenser"] .home-tag')).toHaveCount(0);
});

test('inga regeltyper och inga källor på varje punkt, bara en källista längst ned', async ({ page }) => {
	await page.goto('/gron/matchdagen/');
	await expect(page.locator('.checklist .rule-tag')).toHaveCount(0);
	await expect(page.locator('.checklist').getByText(/Föreningsvägledning|Distriktsanpassning/)).toHaveCount(0);
	await expect(page.locator('.checklist').getByText(/Originalkälla|Kontrollerad/)).toHaveCount(0);
	const kallor = page.getByRole('region', { name: 'Källor' });
	await expect(kallor.getByText(/Kontrollerad 2026-11-15/)).toBeVisible();
	await expect(kallor.getByRole('link', { name: /Manual för sammandrag/ })).toHaveAttribute('href', /manual-sammandrag.*\.pdf$/);
	await expect(kallor.getByRole('link', { name: /ungdomsmatris/ })).toHaveAttribute('href', /matris-ungdom.*\.pdf$/);
	await expect(kallor.getByText(/avser säsongen 2025\/26/)).toBeVisible();
});

test('avsnitten nås med ett tryck från genvägar överst', async ({ page }) => {
	await page.goto('/rod/matchdagen/');
	const shortcuts = page.getByRole('navigation', { name: 'Genvägar på sidan' });
	for (const [name, id] of [
		['Veckan före', 'veckan-fore'],
		['Före match', 'fore-match'],
		['Efter match', 'efter-match'],
		['Källor', 'kallor'],
	] as const) {
		await shortcuts.getByRole('link', { name, exact: true }).click();
		await expect(page).toHaveURL(new RegExp(`#${id}$`));
	}
});

test('matchflytt länkar till aktuell information utan hårdkodade avgifter eller tidsgränser', async ({ page }) => {
	await page.goto('/gron/matchdagen/');
	const section = page.locator('#matchflytt');
	await expect(section.getByRole('link', { name: /Aktuell matchflyttsinformation/ })).toHaveAttribute(
		'href',
		'https://www.innebandy.se/vasternorrland/tavling/matchflytt',
	);
	await expect(section).not.toContainText(/\d+\s*(kr|kronor|dagar|dygn)\b/i);
	await expect(section).toContainText('går alltid via förbundet');
});

test('utskrift: sidan skrivs ut utan navigation, med band, checklista och källornas adresser', async ({ page }) => {
	await page.emulateMedia({ media: 'print' });
	await page.goto('/gron/matchdagen/');
	await expect(page.getByRole('navigation', { name: 'Huvudmeny' })).toBeHidden();
	await expect(page.getByRole('navigation', { name: 'Genvägar på sidan' })).toBeHidden();
	await expect(page.locator('.sheet-band')).toBeVisible();
	await expect(page.locator('li[data-item="sekretariat"]')).toBeVisible();
	const after = await page.getByRole('region', { name: 'Källor' }).getByRole('link').first().evaluate((el) => getComputedStyle(el, '::after').content);
	expect(after).toContain('http');
});
