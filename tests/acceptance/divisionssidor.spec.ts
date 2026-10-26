import { expect, test } from '@playwright/test';

const matris = 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf#page=1';

test('startsidan har ingen egen divisionspanel: nivåkorten leder till nivåsidorna med divisionsflikarna', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('region', { name: 'Divisioner' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: /^Division \d/ })).toHaveCount(0);
});

test('nivåsidan har en flik per division och leder till divisionssidan', async ({ page }) => {
	await page.goto('/rod/');
	const tiles = page.getByRole('list', { name: 'Divisioner i röd nivå' });
	await expect(tiles.getByRole('link')).toHaveCount(5);
	await tiles.getByRole('link', { name: /Division 5/ }).click();
	await expect(page).toHaveURL('/rod/division-5/');
	await page.getByRole('link', { name: /Tillbaka till röd nivå/ }).click();
	await expect(page).toHaveURL('/rod/');
});

test('division 5 visar verifierade matchfakta med källa och kontrolldatum', async ({ page }) => {
	await page.goto('/rod/division-5/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Röd nivå Division 5');
	const facts = page.getByRole('region', { name: 'Matchfakta' });
	for (const [label, value] of [
		['Antal spelare', '5 utespelare + målvakt'],
		['Speltid', '3 × 15 min effektiv tid'],
		['Planstorlek', '18 × 36 m'],
		['Byten', 'Flygande'],
		['Sekretariat', 'iBIS Online; resultattavla'],
	]) {
		await expect(facts.getByText(label, { exact: true })).toBeVisible();
		await expect(facts.getByText(value, { exact: true })).toBeVisible();
	}
	await expect(page.getByRole('heading', { name: 'Serieinformation' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Öppna PDF/ })).toHaveAttribute('href', matris);
	const sources = page.getByRole('region', { name: 'Källor och kontrolldatum' });
	await expect(sources.getByText(/Kontrollerad 2026-10-12/).first()).toBeVisible();
	await expect(sources.getByRole('link', { name: /Originalkälla/ }).first()).toHaveAttribute('href', matris);
});

test('division 1 avviker från 2–5 bara på tabell och poängliga', async ({ page }) => {
	for (const [n, value, other] of [
		[1, 'Ja/Ja', 'Ja/Nej'],
		[2, 'Ja/Nej', 'Ja/Ja'],
		[5, 'Ja/Nej', 'Ja/Ja'],
	] as const) {
		await page.goto(`/rod/division-${n}/`);
		const facts = page.getByRole('region', { name: 'Matchfakta' });
		await expect(facts.getByText('Tabell / poängliga', { exact: true })).toBeVisible();
		await expect(facts.getByText(value, { exact: true })).toBeVisible();
		await expect(facts.getByText(other, { exact: true })).toHaveCount(0);
		// Allt annat är gemensamt för division 1–5.
		await expect(facts.getByText('5 utespelare + målvakt', { exact: true })).toBeVisible();
		await expect(facts.getByText('3 × 15 min effektiv tid', { exact: true })).toBeVisible();
		await expect(facts.getByText('18 × 36 m', { exact: true })).toBeVisible();
		await expect(page.getByText(/inte verifierade ännu/)).toHaveCount(0);
	}
});

test('blå nivå: division 6 visar effektiv tid, division 7 visar bara en ej verifierad notis', async ({ page }) => {
	await page.goto('/bla/division-6/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blå nivå Division 6');
	await expect(page.getByText('Effektiv tid').first()).toBeVisible();
	await expect(page.getByText('4 utespelare + målvakt').first()).toBeVisible();

	await page.goto('/bla/division-7/');
	await expect(page.getByText(/Uppgifterna för division 7 är inte verifierade ännu/)).toBeVisible();
	await expect(page.getByText(/ej verifierat/).first()).toBeVisible();
	await expect(page.getByText('Rullande tid', { exact: true })).toHaveCount(0);
	await expect(page.getByText('4 utespelare + målvakt')).toHaveCount(0);
});

test('det finns ingen sida för grön nivå eller dess divisioner', async ({ request }) => {
	for (const path of ['/gron/', '/gron/division-8/', '/rod/division-6/', '/bla/division-5/']) {
		expect((await request.get(path)).status()).toBe(404);
	}
});

test('divisionssidan upprepar inte matchfakta i serieinformationen', async ({ page }) => {
	await page.goto('/rod/division-5/');
	// Det som står i Matchfakta-raden visas inte en gång till längre ned.
	for (const value of ['5 utespelare + målvakt', '3 × 15 min effektiv tid', '18 × 36 m', 'Flygande', 'iBIS Online; resultattavla']) {
		await expect(page.getByText(value, { exact: true })).toHaveCount(1);
	}
	// Serieinformationen visar bara det som inte redan står i raden.
	const info = page.locator('.series-info');
	await expect(info.getByText('Paus:')).toBeVisible();
	await expect(info.getByText('Mål:')).toBeVisible();
	await expect(info.getByText('Domare:')).toBeVisible();
	await expect(info.getByText('Ledarutbildning:')).toBeVisible();
	await expect(info.getByText('Spelform:')).toHaveCount(0);
	await expect(info.getByText('Speltid:')).toHaveCount(0);
});
