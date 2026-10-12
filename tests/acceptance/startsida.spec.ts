import { expect, test, type Page } from '@playwright/test';

const picker = (page: Page) => page.getByRole('region', { name: 'Välj nivå' });

test('startsidan visar säsong och en enda h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ledarguide 2026/27');
	await expect(page.getByText('Säsong 2026/27').first()).toBeVisible();
});

test('hero använder publikbilden och klubblogotypen oförändrad', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('img[src="/images/brand/moalvens-crowd-hero.webp"]')).toHaveCount(1);
	await expect(page.locator('img[src="/images/brand/moalvens-ibk-logo.png"]').first()).toBeVisible();
});

test('nivåväljaren leder från startsidan till röd och blå guide', async ({ page }) => {
	await page.goto('/');
	await picker(page).getByRole('link', { name: /Röd nivå/ }).click();
	await expect(page).toHaveURL('/rod/');
	await page.goto('/');
	await picker(page).getByRole('link', { name: /Blå nivå/ }).click();
	await expect(page).toHaveURL('/bla/');
});

test('grön nivå visas som kommande och är ingen länk', async ({ page }) => {
	await page.goto('/');
	await expect(picker(page).getByRole('link')).toHaveCount(2);
	await expect(picker(page).getByText('Grön nivå')).toBeVisible();
	await expect(picker(page).getByText('Kommer senare')).toBeVisible();
});

test('nivåerna visas i ordningen grön, blå, röd med divisioner', async ({ page }) => {
	await page.goto('/');
	const items = picker(page).getByRole('listitem');
	await expect(items).toHaveCount(3);
	await expect(items.nth(0)).toContainText('Grön nivå');
	await expect(items.nth(1)).toContainText('Blå nivå');
	await expect(items.nth(1)).toContainText('Division 6–7');
	await expect(items.nth(2)).toContainText('Röd nivå');
	await expect(items.nth(2)).toContainText('Division 1–5');
});

test('Matchdagen och Regler och dokument nås från startsidan', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('region', { name: 'Matchdagen' }).getByRole('link').click();
	await expect(page).toHaveURL('/matchdagen/');
	await page.goto('/');
	await page.getByRole('region', { name: 'Regler och dokument' }).getByRole('link').click();
	await expect(page).toHaveURL('/regler/');
});

test('bra matchmiljö använder definitionen från Regler och dokument', async ({ page }) => {
	await page.goto('/regler/');
	const definition = await page
		.getByRole('region', { name: 'Bra matchmiljö' })
		.locator('p')
		.first()
		.innerText();
	await page.goto('/');
	const section = page.getByRole('region', { name: 'Bra matchmiljö' });
	await expect(section).toContainText(definition);
	await section.getByRole('link').first().click();
	await expect(page).toHaveURL(/\/regler\/#matchmiljo$/);
});

test('säsongsarkivet är en teaser utan länkar eller kontroller', async ({ page }) => {
	await page.goto('/');
	const archive = page.getByRole('region', { name: 'Tidigare säsonger' });
	await expect(archive).toContainText('Kommer när nästa säsong publiceras');
	await expect(archive.getByRole('link')).toHaveCount(0);
	await expect(archive.getByRole('button')).toHaveCount(0);
	await expect(page.getByRole('searchbox')).toHaveCount(0);
});

test('säsongsarkivet listar arkiverade säsonger när sådana finns', async ({ page }) => {
	await page.goto('http://localhost:4323/');
	const archive = page.getByRole('region', { name: 'Tidigare säsonger' });
	await expect(archive).toContainText('2026/27');
	await expect(archive).not.toContainText('Kommer när nästa säsong publiceras');
	await expect(archive.getByRole('link', { name: 'Röd nivå' })).toHaveAttribute('href', '/sasonger/2026-2027/rod/');
	await expect(archive.getByRole('link', { name: 'Blå nivå' })).toHaveAttribute('href', '/sasonger/2026-2027/bla/');
});

test('säsongsetiketten följer den aktiva säsongen i rubrik, titel och sidfot', async ({ page }) => {
	await page.goto('http://localhost:4323/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ledarguide 2027/28');
	await expect(page).toHaveTitle('Ledarguide 2027/28');
	await expect(page.locator('footer')).toContainText('Ledarguide 2027/28');
	// Arkivsidor visar sin egen säsong i sidfoten.
	await page.goto('http://localhost:4323/sasonger/2026-2027/rod/');
	await expect(page.locator('footer')).toContainText('Ledarguide 2026/27');
	await page.goto('/');
	await expect(page.locator('footer')).toContainText('Ledarguide 2026/27');
});

test('grön nivå har samma ord och divisioner på startsidan och på Nivåer', async ({ page }) => {
	await page.goto('/nivaer/');
	const gron = page.getByRole('listitem').filter({ hasText: 'Grön nivå' });
	await expect(gron).toContainText('Kommer senare');
	await expect(gron).toContainText('Division 8–9');
	await expect(gron.getByRole('link')).toHaveCount(0);
	await expect(page.getByRole('listitem').filter({ hasText: 'Blå nivå' })).toContainText('Division 6–7');
	await expect(page.getByRole('listitem').filter({ hasText: 'Röd nivå' })).toContainText('Division 1–5');
});
