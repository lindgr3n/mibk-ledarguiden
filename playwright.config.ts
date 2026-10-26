import { defineConfig, devices } from '@playwright/test';

// Acceptance tests run against the BUILT production site served by `astro preview`.
// Build first: `npm test` does both.
export default defineConfig({
	testDir: './tests/acceptance',
	fullyParallel: true,
	reporter: 'list',
	use: { baseURL: 'http://localhost:4421' },
	webServer: [
		{
			command: 'npx astro preview --ignore-lock --port 4421',
			url: 'http://localhost:4421',
			reuseExistingServer: false,
		},
		{
			// Fixturbygge med testinnehåll (t.ex. en uppdateringsnotis) som aldrig publiceras.
			command: 'npx astro build && npx astro preview --ignore-lock --port 4422',
			url: 'http://localhost:4422',
			reuseExistingServer: false,
			timeout: 180_000,
			env: {
				LEDARGUIDE_CONTENT_ROOT: './tests/fixtures/content',
				LEDARGUIDE_OUT_DIR: './dist-fixture',
			},
		},
		{
			// Fixturbygge "efter aktivering": föregående säsong arkiverad, nästa säsong aktiv.
			command: 'npx astro build && npx astro preview --ignore-lock --port 4423',
			url: 'http://localhost:4423',
			reuseExistingServer: false,
			timeout: 180_000,
			env: {
				LEDARGUIDE_CONTENT_ROOT: './tests/fixtures/content-aktiverad',
				LEDARGUIDE_OUT_DIR: './dist-fixture-aktiverad',
			},
		},
	],
	projects: [
		{ name: 'mobil', use: { ...devices['Pixel 7'] } },
		{ name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
	],
});
