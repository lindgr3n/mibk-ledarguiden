import { defineConfig, devices } from '@playwright/test';

// Acceptance tests run against the BUILT production site served by `astro preview`.
// Build first: `npm test` does both.
export default defineConfig({
	testDir: './tests/acceptance',
	fullyParallel: true,
	reporter: 'list',
	use: { baseURL: 'http://localhost:4321' },
	webServer: [
		{
			command: 'npx astro preview --ignore-lock --port 4321',
			url: 'http://localhost:4321',
			reuseExistingServer: false,
		},
		{
			// Fixturbygge med testinnehåll (t.ex. en uppdateringsnotis) som aldrig publiceras.
			command: 'npx astro build && npx astro preview --ignore-lock --port 4322',
			url: 'http://localhost:4322',
			reuseExistingServer: false,
			timeout: 180_000,
			env: {
				LEDARGUIDE_CONTENT_ROOT: './tests/fixtures/content',
				LEDARGUIDE_OUT_DIR: './dist-fixture',
			},
		},
	],
	projects: [
		{ name: 'mobil', use: { ...devices['Pixel 7'] } },
		{ name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
	],
});
