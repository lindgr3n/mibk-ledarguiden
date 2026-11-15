import { expect, test } from '@playwright/test';

test('Ljusgrön nivå nås från startsidan och visar bladet utan divisioner', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: /Gå till ljusgrön nivå/ }).click();
	await expect(page).toHaveURL('/ljusgron/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Ljusgrön nivå');
	await expect(page.getByText('Säsong 2026/27')).toBeVisible();
	// Ingen division och inga matcher: inga divisionsrutor, divisionsanpassningar eller matchdag.
	await expect(page.getByText(/Division \d/)).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Divisionsanpassningar' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Matchdagen' })).toHaveCount(0);
	// I stället: en ruta överst, Viktiga dokument och Uppstart, som länkar till spelutbildningen.
	await expect(page.locator('.division-tiles').getByRole('link', { name: /Att vara med i Moälvens IBK/ })).toHaveAttribute('href', /\/att-vara-med\/$/);
	await expect(page.getByRole('heading', { name: 'Viktiga dokument' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Uppstart' })).toBeVisible();
	await expect(page.locator('.start-card').getByRole('link', { name: /Öppna uppstart/ })).toHaveAttribute('href', /\/nya-lag\/$/);
	// Uppstart står i sitt eget kort och upprepas inte bland dokumenten.
	await expect(page.locator('.doc-links').getByRole('link', { name: /Uppstart/ })).toHaveCount(0);
	await expect(page.getByRole('region', { name: 'Källor och kontrolldatum' })).toBeVisible();
});

test('Ljusgrön visar färgband, ikonrader och källa med kontrolldatum', async ({ page }) => {
	await page.goto('/ljusgron/');
	const sheet = page.getByRole('region', { name: 'Snabb översikt' });
	await expect(sheet.locator('.sheet-format')).toHaveText('Lek och rörelse');
	await expect(sheet.locator('.sheet-meta')).toHaveText('Ljusgrön nivå · Lek och rörelse · 0–6 år');
	for (const label of ['Matcher', 'Lagstart', 'Träning', 'Ledare', 'Utrustning']) {
		await expect(sheet.getByText(label, { exact: true })).toBeVisible();
	}
	await expect(sheet.getByText(/Moälven Kidz/)).toBeVisible();
	const sources = page.getByRole('region', { name: 'Källor och kontrolldatum' });
	await expect(sources.getByText(/Kontrollerad \d{4}-\d{2}-\d{2}/)).toBeVisible();
	await expect(sources.getByText(/undefined/)).toHaveCount(0);
	// Föreningsvägledning har ingen originalkälla: ingen länk till en sida som inte styrker uppgifterna.
	await expect(sources.getByRole('link', { name: /Originalkälla/ })).toHaveCount(0);
	await expect(sources.getByText(/Föreningsvägledning/)).toBeVisible();
});

test('nivåsidorna länkar till spelutbildningen', async ({ page }) => {
	for (const level of ['ljusgron', 'gron', 'bla', 'rod']) {
		await page.goto(`/${level}/`);
		const link = page.getByRole('link', { name: /Till spelutbildningen/ });
		await expect(link).toHaveAttribute('href', new RegExp(`/nivaer/${level}/$`));
		await expect(link).toHaveAttribute('rel', /noopener/);
	}
});

test('Grön nivå: "Nytt för" kommer direkt under divisionerna, före bladet, och matchdagskortet efter', async ({ page }) => {
	await page.goto('/gron/');
	const order = await page.locator('main h2, main h3').allTextContents();
	const idx = (t: string) => order.findIndex((x) => x.includes(t));
	expect(idx('Nytt för')).toBeGreaterThanOrEqual(0);
	expect(idx('Nytt för')).toBeLessThan(idx('Snabb översikt'));
	expect(idx('Snabb översikt')).toBeLessThan(idx('Matchdagen'));
	await expect(page.locator('.sheet-format')).toHaveText('3 mot 3');
	await expect(page.locator('.matchday-card')).toContainText('punkter på en egen sida');
	await expect(page.locator('.matchday-card').getByRole('link', { name: /matchdagens checklista/ })).toHaveAttribute('href', '/gron/matchdagen/');
});

test('Ljusgrön skrivs ut utan navigation med bladet synligt', async ({ page }) => {
	await page.emulateMedia({ media: 'print' });
	await page.goto('/ljusgron/');
	await expect(page.getByRole('navigation', { name: 'Huvudmeny' })).toBeHidden();
	await expect(page.getByRole('region', { name: 'Snabb översikt' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Till spelutbildningen/ })).toBeHidden();
});

test('Grön nivå: bara bladet skrivs ut, dokumentlänkar och matchdagskort döljs', async ({ page }) => {
	await page.emulateMedia({ media: 'print' });
	await page.goto('/gron/');
	await expect(page.locator('.matchday-card')).toBeHidden();
	await expect(page.getByRole('heading', { name: 'Viktiga dokument' })).toBeHidden();
	await expect(page.locator('.sheet-band')).toBeVisible();
});
