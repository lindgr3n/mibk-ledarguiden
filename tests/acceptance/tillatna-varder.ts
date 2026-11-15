// Enda tillåtna externa värd: Pulse (besöksstatistik), som läggs in i Layout.astro. Allt annat som anropar
// en annan värd än webbplatsen själv ska fortfarande få testerna att falla.
export const TILLATNA_VARDAR = ['https://pulseapp.se/'];

export const arTillatenExtern = (url: string) => TILLATNA_VARDAR.some((v) => url.startsWith(v));
