import { expect, test } from '@playwright/test';

test('Lokal regel står som en rad i översikten på varje nivå', async ({ page }) => {
	for (const [path, text] of [
		['/gron/', 'Inga mål får göras från egen planhalva'],
		['/bla/', 'Lagkapten behöver inte utses'],
		['/rod/', 'Målvakt får senare delta som utespelare'],
	] as const) {
		await page.goto(path);
		const row = page.getByRole('region', { name: 'Snabb översikt' }).locator('[data-fact="lokalregel"]');
		await expect(row).toBeVisible();
		await expect(row.getByText('Lokal regel', { exact: true })).toBeVisible();
		await expect(row).toContainText(text);
	}
});

test('källan för lokala regler är matrisens sida 2', async ({ page }) => {
	await page.goto('/gron/');
	const grupp = page.locator('[data-fact-group="lokala-regler"]');
	await expect(grupp.getByRole('link', { name: /^sida 2/ })).toHaveAttribute('href', /matris-ungdom.*\.pdf#page=2$/);
});

test('matchdagskortet räknar bara nivåns egna punkter', async ({ page }) => {
	const antal: Record<string, number> = {};
	for (const level of ['gron', 'bla', 'rod']) {
		await page.goto(`/${level}/`);
		const text = (await page.locator('.matchday-card').textContent()) ?? '';
		const n = Number(/(\d+) punkter/.exec(text)?.[1]);
		await page.goto(`/${level}/matchdagen/`);
		expect(n).toBe(await page.locator('.checklist li').count());
		antal[level] = n;
	}
	expect(new Set(Object.values(antal)).size).toBeGreaterThan(1);
});
