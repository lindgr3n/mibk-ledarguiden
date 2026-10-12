import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const pages = ['/', '/nivaer/', '/rod/', '/bla/', '/matchdagen/', '/regler/'];

async function scrollOverflow(page: Page) {
	return page.evaluate(() => ({
		doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
		body: document.body.scrollWidth - document.documentElement.clientWidth,
	}));
}

for (const path of pages) {
	test.describe(path, () => {
		test('ingen horisontell scroll', async ({ page }) => {
			await page.goto(path);
			const o = await scrollOverflow(page);
			expect(o.doc).toBeLessThanOrEqual(0);
			expect(o.body).toBeLessThanOrEqual(0);
		});

		test('ingen horisontell scroll vid 360 px bredd', async ({ page }) => {
			await page.setViewportSize({ width: 360, height: 740 });
			await page.goto(path);
			expect((await scrollOverflow(page)).doc).toBeLessThanOrEqual(0);
		});

		test('inga axe-överträdelser (WCAG A/AA, inkl. färgkontrast)', async ({ page }) => {
			await page.goto(path);
			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
				.analyze();
			expect(
				results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
			).toEqual([]);
		});

		test('tangentbord når alla länkar och varje fokus syns', async ({ page }) => {
			await page.goto(path);
			const expected = await page.evaluate(() => {
				const els = [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [tabindex="0"]')].filter(
					(e) => e.offsetParent !== null,
				);
				els.forEach((e, i) => e.setAttribute('data-kbd', String(i)));
				return els.length;
			});
			const seen = new Set<string>();
			const problems: string[] = [];
			for (let i = 0; i < expected + 3; i++) {
				await page.keyboard.press('Tab');
				const info = await page.evaluate(() => {
					const el = document.activeElement as HTMLElement;
					if (!el || el === document.body) return null;
					const cs = getComputedStyle(el);
					const visible =
						(cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) ||
						(cs.boxShadow !== 'none' && cs.boxShadow !== '');
					const r = el.getBoundingClientRect();
					return {
						idx: el.getAttribute('data-kbd') ?? el.tagName,
						id: `${el.tagName} ${el.getAttribute('href') ?? ''} ${el.textContent?.trim().slice(0, 30)}`,
						visible,
						inView: r.bottom > 0 && r.top < innerHeight,
					};
				});
				if (!info) continue;
				seen.add(info.idx);
				if (!info.visible) problems.push(`inget synligt fokus: ${info.id}`);
				if (!info.inView) problems.push(`fokus utanför bild: ${info.id}`);
			}
			expect(problems).toEqual([]);
			expect(seen.size).toBeGreaterThanOrEqual(expected);
		});

		test('reducerad rörelse stänger av animationer och övergångar', async ({ page }) => {
			await page.emulateMedia({ reducedMotion: 'reduce' });
			await page.goto(path);
			const moving = await page.evaluate(() =>
				[...document.querySelectorAll('*')]
					.filter((el) => {
						const cs = getComputedStyle(el);
						const t = cs.transitionDuration.split(',').some((d) => parseFloat(d) > 0);
						const a = cs.animationName !== 'none' && parseFloat(cs.animationDuration) > 0;
						return t || a || cs.scrollBehavior === 'smooth';
					})
					.map((el) => el.tagName + '.' + el.className),
			);
			expect(moving).toEqual([]);
		});

		test('inga cookies, ingen lagring, inga skript från andra värdar', async ({ page, context, baseURL }) => {
			const external: string[] = [];
			page.on('request', (r) => {
				if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:')) external.push(r.url());
			});
			await page.goto(path, { waitUntil: 'networkidle' });
			expect(external).toEqual([]);
			expect(await context.cookies()).toEqual([]);
			expect(await page.evaluate(() => document.cookie)).toBe('');
			const storage = await page.evaluate(() => ({
				local: localStorage.length,
				session: sessionStorage.length,
			}));
			expect(storage).toEqual({ local: 0, session: 0 });
			const srcs = await page
				.locator('script[src]')
				.evaluateAll((s) => s.map((e) => (e as HTMLScriptElement).src));
			expect(srcs.filter((s) => !s.startsWith(baseURL!))).toEqual([]);
		});
	});
}

test('hoppa-till-innehåll-länk är första tabbstoppet och leder till main', async ({ page }) => {
	await page.goto('/rod/');
	await page.keyboard.press('Tab');
	const skip = page.getByRole('link', { name: 'Hoppa till innehållet' });
	await expect(skip).toBeFocused();
	await expect(skip).toBeInViewport();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/#innehall$/);
	await expect(page.locator('main#innehall')).toBeVisible();
});

test('tryckytor i meny och nivåväljare är minst 44 px höga', async ({ page }) => {
	for (const path of ['/', '/nivaer/', '/matchdagen/']) {
		await page.goto(path);
		const small = await page
			.locator('nav a, .cta, .level a, .shortcuts a, .more, main ul:not(.checklist) > li > a')
			.evaluateAll((els) =>
				els
					.map((e) => ({ t: e.textContent?.trim(), h: e.getBoundingClientRect().height }))
					.filter((x) => x.h > 0 && x.h < 44),
			);
		expect(small).toEqual([]);
	}
});

test('nivåväljaren anger nivå och status med text, inte bara färg', async ({ page }) => {
	await page.goto('/');
	for (const [name, state] of [
		['Grön nivå', 'Kommer senare'],
		['Blå nivå', 'Öppna guiden'],
		['Röd nivå', 'Öppna guiden'],
	]) {
		await expect(page.locator('.levels li', { hasText: name })).toContainText(state);
	}
	await page.goto('/rod/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Röd nivå');
	await page.goto('/bla/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Blå nivå');
});

test('bygget är host-agnostiskt: ingen adapter, statisk utdata', () => {
	const config = readFileSync('astro.config.mjs', 'utf8');
	expect(config).not.toMatch(/adapter|output:\s*['"]server|output:\s*['"]hybrid/);
	const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
	const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
	expect(deps.filter((d) => /^@astrojs\/(vercel|netlify|node|cloudflare)/.test(d))).toEqual([]);
	const html = readFileSync('dist/index.html', 'utf8');
	expect(html).not.toMatch(/(?:href|src)="(?:https?:)?\/\/(?!localhost)/);
});

test('Matchdagen bär ingen nivåfärg (röd kant antyder annars Röd nivå)', async ({ page }) => {
	await page.goto('/matchdagen/');
	const border = await page.locator('.level-head').evaluate((e) => getComputedStyle(e).borderLeftColor);
	expect(border).not.toBe('rgb(181, 18, 27)');
	expect(border).not.toBe('rgb(7, 87, 166)');
	expect(border).not.toBe('rgb(8, 122, 63)');
});
