// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// LEDARGUIDE_OUT_DIR används bara av acceptanstesternas fixturbygge (se playwright.config.ts).
export default defineConfig({ outDir: process.env.LEDARGUIDE_OUT_DIR ?? './dist' });
