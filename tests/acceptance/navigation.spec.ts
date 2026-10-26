import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const menu = [
	{ name: 'Hem', path: '/', heading: 'Moälvens IBK – Ledarguide 2026/27' },
	{ name: 'Nivåer', path: '/nivaer/', heading: 'Nivåer' },
	{ name: 'Matchdagen', path: '/matchdagen/', heading: 'Matchdagen' },
	{ name: 'Regler och dokument', path: '/regler/', heading: 'Regler och dokument' },
];

test('webbplatsen är svensk och menyn har exakt fyra val', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'sv');
	const links = page.getByRole('navigation', { name: 'Huvudmeny' }).getByRole('link');
	await expect(links).toHaveText(menu.map((m) => m.name));
});

test('startsidan följer varje menyval', async ({ page }) => {
	for (const item of menu) {
		await page.goto('/');
		await page
			.getByRole('navigation', { name: 'Huvudmeny' })
			.getByRole('link', { name: item.name, exact: true })
			.click();
		await expect(page).toHaveURL(item.path);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(item.heading);
		await expect(
			page
				.getByRole('navigation', { name: 'Huvudmeny' })
				.getByRole('link', { name: item.name, exact: true }),
		).toHaveAttribute('aria-current', 'page');
	}
});

test('inga anrop går till andra värdar än webbplatsen själv', async ({ page, baseURL }) => {
	const external: string[] = [];
	page.on('request', (req) => {
		const url = req.url();
		if (!url.startsWith(baseURL!) && !url.startsWith('data:')) external.push(url);
	});
	for (const item of menu) {
		await page.goto(item.path, { waitUntil: 'networkidle' });
	}
	expect(external).toEqual([]);
});

test('typsnitten levereras lokalt', async ({ page }) => {
	const fonts: string[] = [];
	page.on('response', (res) => {
		if (/\.woff2?$/.test(res.url())) fonts.push(res.url());
	});
	await page.goto('/', { waitUntil: 'networkidle' });
	expect(fonts.length).toBeGreaterThan(0);
});

test('produktionsbygget är en helt statisk webbplats', () => {
	expect(existsSync('dist/index.html')).toBe(true);
	expect(existsSync('dist/server')).toBe(false);
});
