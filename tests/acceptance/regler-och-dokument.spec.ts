import { expect, test } from '@playwright/test';

const dokument = [
	['Regelbok 2026', 'https://www.innebandy.se/media/qaljq1sz/regelhandboken-2026-lowres.pdf'],
	['Ungdomsmatris 2026/27', 'https://www.innebandy.se/media/bjoi2qrd/matris-ungdom-2026-27-med-arvoden.pdf'],
	['Lokala förutsättningar 2026/27', 'https://www.innebandy.se/media/sb3hooik/lokala-forutsattningar-vnibf-2026-2027.pdf'],
];

test('Regler och dokument nås från menyn och har en h1', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('navigation', { name: 'Huvudmeny' }).getByRole('link', { name: 'Regler och dokument', exact: true }).click();
	await expect(page).toHaveURL('/regler/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Regler och dokument');
	await expect(page.getByText('Säsong 2026/27').first()).toBeVisible();
});

test('originaldokumenten länkas med kontrolldatum', async ({ page }) => {
	await page.goto('/regler/');
	const section = page.getByRole('region', { name: 'Originaldokument' });
	for (const [name, href] of dokument) {
		const link = section.getByRole('link', { name, exact: true });
		await expect(link).toHaveAttribute('href', href);
		await expect(link.locator('xpath=ancestor::li[1]').getByText('Kontrollerad 2026-10-12')).toBeVisible();
	}
});

test('nyheter för 2026/27 visas med länkar till presentation och ändringsmarkerad regelhandbok', async ({ page }) => {
	await page.goto('/regler/');
	const section = page.getByRole('region', { name: 'Nytt för 2026/27' });
	await expect(section.getByText('Ny regelhandbok gäller från 1 juli 2026')).toBeVisible();
	await expect(section.getByText('Målvakternas säkerhet')).toBeVisible();
	await expect(section.getByText('Byteszonen')).toBeVisible();
	await expect(section.getByRole('link', { name: /Nya regler 2026 – presentation/ })).toHaveAttribute(
		'href',
		'https://www.innebandy.se/media/wg3jha4x/nya-regler-presentation.pdf',
	);
	await expect(section.getByRole('link', { name: /ändringar från 2022/ })).toHaveAttribute(
		'href',
		'https://www.innebandy.se/media/yyzmfrej/regelhandboken-2026-med-alla-andringar-fran-2022.pdf',
	);
	await expect(section.getByText('Kontrollerad 2026-10-12')).toBeVisible();
});

test('bra matchmiljö definieras utan obekräftad föreningspolicy', async ({ page }) => {
	await page.goto('/regler/');
	const section = page.getByRole('region', { name: 'Bra matchmiljö' });
	await expect(section.getByText(/trygg, respektfull och utvecklande match/)).toBeVisible();
	await expect(section.getByRole('link', { name: /Barn och ungdom/ })).toHaveAttribute(
		'href',
		'https://www.innebandy.se/vasternorrland/tavling/barnungdom',
	);
	const text = await page.locator('main').innerText();
	expect(text).not.toMatch(/respektfullt språk|ojämn match|långsiktiga utveckling/);
});

test('sidan skiljer originalkälla från föreningens vägledning', async ({ page }) => {
	await page.goto('/regler/');
	await expect(page.getByText(/originalkällan som gäller/i)).toBeVisible();
});
