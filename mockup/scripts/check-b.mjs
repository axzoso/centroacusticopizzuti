// Controllo della build della Proposta B (dopo `astro build`).
// Esce con 1 se: manca una pagina, H1 non unico, link interni che escono da /proposta-b/,
// testo rotto ([object Object], undefined) o noindex assente.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(import.meta.dirname, '..', 'dist', 'proposta-b');
const PAGES = [
  '', 'chi-siamo/', 'apparecchi-acustici/', 'apparecchi-acustici/prezzi/', 'servizi/',
  'servizi/controllo-udito/', 'servizi/riparazione-assistenza-apparecchi-acustici/',
  'contatti/', 'privacy-policy/', 'cookie-policy/', 'note-legali/',
];
const OK_PREFIX = ['/proposta-b/', '/img/', '/logos/', '/_astro/'];
const errors = [];

for (const p of PAGES) {
  const file = join(DIST, p, 'index.html');
  const name = '/proposta-b/' + p;
  if (!existsSync(file)) { errors.push(`${name}: pagina mancante`); continue; }
  const html = readFileSync(file, 'utf8');

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${name}: ${h1} <h1> (atteso 1)`);

  for (const m of html.matchAll(/<[^>]*\s(?:href|action)="(\/[^"]*)"[^>]*>/g)) {
    const [tag, url] = m;
    if (OK_PREFIX.some((x) => url.startsWith(x))) continue;
    if (/\sdata-proposta-a[\s>=]/.test(tag)) continue;
    errors.push(`${name}: link fuori dalla B → ${url}`);
  }

  if (html.includes('[object Object]')) errors.push(`${name}: contiene [object Object]`);
  if (/>\s*undefined\s*</.test(html)) errors.push(`${name}: contiene undefined`);
  if (!/<meta name="robots" content="noindex"/.test(html)) errors.push(`${name}: manca noindex`);
}

if (errors.length) {
  console.error(`check-b: ${errors.length} problemi\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log(`check-b: OK (${PAGES.length} pagine)`);
