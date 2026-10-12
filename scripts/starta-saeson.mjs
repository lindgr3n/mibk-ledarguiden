#!/usr/bin/env node
// Startar nästa säsong som dolt utkast genom att kopiera strukturen från en befintlig säsong.
//
//   node scripts/starta-saeson.mjs <från-säsong> <ny-säsong> [--root <innehållsrot>]
//   node scripts/starta-saeson.mjs 2026-2027 2027-2028
//
// Skapar sasonger/<ny>.yaml (status: utkast), nivaguider/<ny>/ och divisionsanpassningar/<ny>/.
// ALLA fakta, divisionsanpassningar och regeluttalanden sätts till "overifierad" och uppdaterings-
// notiser tas bort. Kontrolldatum och originalkällor behålls oförändrade som utgångspunkt: skriptet
// verifierar ingenting. Matchdagen och Regler och dokument har ingen verifieringsstatus och kopieras
// inte; de måste skrivas för den nya säsongen innan den kan aktiveras (se docs/saesongslivscykel.md).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const root = rootIdx >= 0 ? args.splice(rootIdx, 2)[1] : './src/content';
const [from, to] = args;

const isId = (s) => /^\d{4}-\d{4}$/.test(s ?? '');
if (!isId(from) || !isId(to)) {
	console.error('Användning: node scripts/starta-saeson.mjs <från, t.ex. 2026-2027> <ny, t.ex. 2027-2028> [--root <dir>]');
	process.exit(1);
}
const [y1, y2] = to.split('-');
if (Number(y2) !== Number(y1) + 1) {
	console.error(`Ogiltig säsong ${to}: året efter bindestrecket ska vara ${Number(y1) + 1}`);
	process.exit(1);
}
const label = `${y1}/${y2.slice(2)}`;

const seasonFile = join(root, 'sasonger', `${to}.yaml`);
if (existsSync(seasonFile) || existsSync(join(root, 'nivaguider', to))) {
	console.error(`Säsong ${to} finns redan. Skriver inte över något.`);
	process.exit(1);
}
if (!existsSync(join(root, 'nivaguider', from))) {
	console.error(`Hittar inga nivåguider för säsong ${from} i ${root}`);
	process.exit(1);
}

// Radbaserad omskrivning så att kommentarer och formatering bevaras.
function resetToUnverified(text, { fromId, toId }) {
	const out = [];
	let skippingNotices = false;
	for (const line of text.split(/\r?\n/)) {
		if (skippingNotices) {
			if (/^\S/.test(line) && !line.startsWith('#')) skippingNotices = false;
			else continue;
		}
		if (/^updateNotices:/.test(line)) {
			skippingNotices = true;
			continue;
		}
		let l = line.replace(/^(\s*status:\s*)verifierad\b/, '$1overifierad');
		l = l.replace(/^season:\s*\S+/, `season: ${toId}`);
		l = l.replace(/^guide:\s*\S+/, (m) => m.replace(fromId, toId));
		out.push(l);
		const stmt = l.match(/^(\s*)- ruleSource:/);
		if (stmt) out.push(`${stmt[1]}  status: overifierad`);
	}
	return out.join('\n');
}

function copyDir(sub) {
	const src = join(root, sub, from);
	if (!existsSync(src)) return 0;
	const dest = join(root, sub, to);
	mkdirSync(dest, { recursive: true });
	const files = readdirSync(src).filter((f) => f.endsWith('.yaml'));
	for (const f of files) {
		const text = readFileSync(join(src, f), 'utf8');
		writeFileSync(join(dest, f), resetToUnverified(text, { fromId: from, toId: to }));
	}
	return files.length;
}

mkdirSync(join(root, 'sasonger'), { recursive: true });
writeFileSync(seasonFile, `label: "${label}"\nstatus: utkast\n`);
const guides = copyDir('nivaguider');
const adaptations = copyDir('divisionsanpassningar');

console.log(`Skapade utkast för säsong ${label} (${to}): ${guides} nivåguider, ${adaptations} divisionsanpassningar.`);
console.log('Allt är overifierat och publiceras inte. Nästa steg: se docs/saesongslivscykel.md.');
