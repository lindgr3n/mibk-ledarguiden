import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Skriptet som startar nästa säsong som dolt utkast. Körs mot en tillfällig kopia av testinnehållet.
function setup() {
	const root = mkdtempSync(join(tmpdir(), 'ledarguide-'));
	cpSync('tests/fixtures/content', root, { recursive: true });
	writeFileSync(
		join(root, 'nivaguider/2026-2027/rod.yaml'),
		readFileSync(join(root, 'nivaguider/2026-2027/rod.yaml'), 'utf8') +
			`ruleSections:
  - id: testregel
    title: Testregel
    statements:
      - ruleSource: nationell-regel
        text: "Testtext"
        appliesTo: [1]
        checked: "2031-01-01"
        source: { label: Testkälla, url: "https://example.com/testkalla" }
`,
	);
	return root;
}
const run = (root: string, ...args: string[]) =>
	spawnSync('node', ['scripts/starta-saeson.mjs', ...args, '--root', root], { encoding: 'utf8' });

test('nästa säsong skapas som utkast med allt tillbakasatt till overifierat', () => {
	const root = setup();
	const res = run(root, '2026-2027', '2028-2029');
	expect(res.status, res.stderr).toBe(0);

	expect(readFileSync(join(root, 'sasonger/2028-2029.yaml'), 'utf8')).toBe('label: "2028/29"\nstatus: utkast\n');

	for (const file of ['nivaguider/2028-2029/rod.yaml', 'nivaguider/2028-2029/bla.yaml']) {
		const text = readFileSync(join(root, file), 'utf8');
		expect(text).toContain('season: 2028-2029');
		expect(text).not.toMatch(/status:\s*verifierad/);
		expect(text).not.toContain('updateNotices');
		expect(text).toContain('status: overifierad');
	}
	const rod = readFileSync(join(root, 'nivaguider/2028-2029/rod.yaml'), 'utf8');
	expect(rod).toMatch(/- ruleSource: nationell-regel\n\s+status: overifierad/);

	const adaptation = readFileSync(join(root, 'divisionsanpassningar/2028-2029/bla-7.yaml'), 'utf8');
	expect(adaptation).toContain('guide: 2028-2029/bla');
	expect(adaptation).toContain('status: overifierad');
	expect(adaptation).not.toMatch(/status:\s*verifierad/);

	// Källsäsongen är orörd.
	expect(readFileSync(join(root, 'nivaguider/2026-2027/rod.yaml'), 'utf8')).toMatch(/status:\s*verifierad/);
});

test('skriver aldrig över en säsong som redan finns och avvisar ogiltiga säsongsnamn', () => {
	const root = setup();
	expect(run(root, '2026-2027', '2027-2028').status).toBe(1);
	expect(existsSync(join(root, 'nivaguider/2027-2028/rod.yaml'))).toBe(true);
	expect(run(root, '2026-2027', '2029-2031').status).toBe(1);
});
