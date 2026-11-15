// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// LEDARGUIDE_OUT_DIR används bara av acceptanstesternas fixturbygge (se playwright.config.ts).
// Divisionerna är kort på nivåsidan (ADR 0006). De gamla divisionsadresserna skickas vidare dit.
export default defineConfig({
	outDir: process.env.LEDARGUIDE_OUT_DIR ?? './dist',
	redirects: {
		// Matchdagen finns bara per nivå (/gron/matchdagen/ m.fl.); den gamla gemensamma sidan går till nivåerna.
		'/matchdagen/': '/nivaer/',
		'/rod/division-1/': '/rod/#division-1',
		'/rod/division-2/': '/rod/#division-2',
		'/rod/division-3/': '/rod/#division-3',
		'/rod/division-4/': '/rod/#division-4',
		'/rod/division-5/': '/rod/#division-5',
		'/bla/division-6/': '/bla/#division-6',
		'/bla/division-7/': '/bla/#division-7',
		'/gron/division-8/': '/gron/#division-8',
		'/gron/division-9/': '/gron/#division-9',
	},
});
