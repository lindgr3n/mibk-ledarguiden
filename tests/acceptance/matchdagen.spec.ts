import { expect, test } from '@playwright/test';

const matrisSida1 = 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=1';
const matchflytt = 'https://www.innebandy.se/vasternorrland/tavling/matchflytt';

test('checklistan nås via menyn och har en rubrik på nivå 1', async ({ page }) => {
	await page.goto('/');
	await page
		.getByRole('navigation', { name: 'Huvudmeny' })
		.getByRole('link', { name: 'Matchdagen', exact: true })
		.click();
	await expect(page).toHaveURL('/matchdagen/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Matchdagen');
	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await expect(page.getByText('Säsong 2026/27')).toBeVisible();
});

test('alla checklistepunkter finns', async ({ page }) => {
	await page.goto('/matchdagen/');
	const checklist = page.getByRole('region', { name: 'Före match' });
	for (const text of [
		/licens och skyddsglasögon/,
		/iBIS/,
		/ledarlicens/,
		/två matchvärdar med rosa västar/,
		/sekretariat/i,
	]) {
		await expect(checklist.getByRole('listitem').filter({ hasText: text }).first()).toBeVisible();
	}
	await expect(page.getByRole('region', { name: 'Under och efter match' })).toBeVisible();
});

test('avsnitten nås med ett tryck från genvägar överst', async ({ page }) => {
	await page.goto('/matchdagen/');
	const shortcuts = page.getByRole('navigation', { name: 'Genvägar på sidan' });
	await expect(shortcuts.getByRole('link')).toHaveText([
		'Före match',
		'Under och efter match',
		'Om matchen behöver flyttas',
	]);
	await shortcuts.getByRole('link', { name: 'Om matchen behöver flyttas' }).click();
	await expect(page).toHaveURL(/#matchflytt$/);
	await expect(page.getByRole('heading', { level: 2, name: 'Om matchen behöver flyttas' })).toBeInViewport();
});

test('uppgifter visar kontrolldatum och originalkälla', async ({ page }) => {
	await page.goto('/matchdagen/');
	const before = page.getByRole('region', { name: 'Före match' });
	await expect(before.getByText('Kontrollerad 2026-10-12').first()).toBeVisible();
	await expect(before.getByRole('link', { name: /Originalkälla/ }).first()).toHaveAttribute(
		'href',
		matrisSida1,
	);
});

test('matchflytt länkar till aktuell information utan hårdkodade avgifter eller tidsgränser', async ({
	page,
}) => {
	await page.goto('/matchdagen/');
	const section = page.getByRole('region', { name: 'Om matchen behöver flyttas' });
	await expect(section.getByRole('link', { name: /matchflyttsinformation/ })).toHaveAttribute(
		'href',
		matchflytt,
	);
	await expect(section.getByText(/avboka halltid/i)).toBeVisible();
	const text = await section.innerText();
	expect(text).not.toMatch(/\d+\s*kr\b/i);
	expect(text).not.toMatch(/\d+\s*dagar/i);
});
