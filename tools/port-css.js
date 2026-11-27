'use strict';
// Genera il CSS del sito a partire dal CSS della proposta A del mockup (mai modificare a mano l'uscita).
//   node tools/port-css.js [--out tools/out/pizzuti-prova.css]
// Concatena:
//   1. tools/css/reset.css             (reset degli stili base di Elementor V4)
//   2. mockup/src/styles/base.css      (senza @import)
//      + mockup/src/styles/sections.css
//      + <style is:global> delle pagine Astro della proposta A (esclusa proposta-b/)
//      con selettori prefissati "body.pizzuti .elementor" e rimappatura tag -> :is(tag, :where(.pizzuti-tag))
//   3. tools/css/adattamenti.css       (adattamenti strutturali al markup di Elementor)
// Adattato da artes/tools/rev2/port-css.js.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const uscita = path.resolve(root, oi >= 0 ? args[oi + 1] : path.join('wp', 'pizzuti-core', 'pizzuti.css'));

const PREFISSO = 'body.pizzuti .elementor';
const RADICE = '.page-root';
const TAG_IN_CLASSE = ['dl', 'dt', 'dd', 'p', 'small', 'strong', 'em', 'b', 'i', 'li', 'ul', 'ol', 'figure', 'figcaption', 'blockquote'];

function dividiLista(sel) {
  const out = []; let depth = 0, cur = '';
  for (const ch of sel) {
    if (ch === '(' || ch === '[') depth++; else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

const RE_TIPI = new RegExp('(^|[\\s>+~(,])(main|span|' + TAG_IN_CLASSE.join('|') + ')(?![\\w-])', 'g');
const SPAN_VERO = 'span:where(:not(.pizzuti-strong, .pizzuti-em, .pizzuti-b, .pizzuti-i, .pizzuti-small, .pizzuti-t))';

function rimappaTipi(sel) {
  return sel.replace(RE_TIPI, (m, pre, tag) => {
    if (tag === 'main') return pre + RADICE;
    if (tag === 'span') return pre + SPAN_VERO;
    return `${pre}:is(${tag}, :where(.pizzuti-${tag}))`;
  });
}

function riscriviSelettore(sel) {
  let s = sel.trim();
  if (s === ':root') return 'body.pizzuti';
  if (/^html(?![\w-])/.test(s)) return s.replace(/^html/, 'html:has(body.pizzuti)');
  if (/^body(?![\w-])/.test(s)) return s.replace(/^body/, 'body.pizzuti');
  if (/^\*/.test(s)) return 'body.pizzuti ' + s;
  if (/^::selection/.test(s) || /^:focus-visible/.test(s)) return 'body.pizzuti ' + s;
  if (s.startsWith('.js ')) return 'html.js ' + PREFISSO + ' ' + rimappaTipi(s.slice(4));
  s = rimappaTipi(s);
  return PREFISSO + ' ' + s;
}

const stat = { regole: 0, mappati: 0 };
function elabora(css) {
  let i = 0, out = '';
  const n = css.length;
  const fineStringa = (pos, q) => { let p = pos + 1; while (p < n && css[p] !== q) { if (css[p] === '\\') p++; p++; } return p + 1; };
  while (i < n) {
    const ws = /^\s+/.exec(css.slice(i, i + 4096)); if (ws) { out += ws[0]; i += ws[0].length; continue; }
    if (css.startsWith('/*', i)) { const e = css.indexOf('*/', i + 2); const fine = e < 0 ? n : e + 2; out += css.slice(i, fine); i = fine; continue; }
    if (css[i] === '}') { out += '}'; i++; continue; }
    let j = i, depth = 0;
    while (j < n) {
      const c = css[j];
      if (c === '"' || c === "'") { j = fineStringa(j, c); continue; }
      if (css.startsWith('/*', j)) { const e = css.indexOf('*/', j + 2); j = e < 0 ? n : e + 2; continue; }
      if (c === '(' || c === '[') depth++; else if (c === ')' || c === ']') depth--;
      else if ((c === '{' || c === ';') && depth === 0) break;
      j++;
    }
    const prelude = css.slice(i, j); const term = css[j];
    if (term === ';' || j >= n) {
      if (!/^\s*@import\b/i.test(prelude)) out += prelude + (term || '');
      i = j + 1;
      continue;
    }
    let k = j + 1, d = 1;
    while (k < n && d > 0) {
      const c = css[k];
      if (c === '"' || c === "'") { k = fineStringa(k, c); continue; }
      if (css.startsWith('/*', k)) { const e = css.indexOf('*/', k + 2); k = e < 0 ? n : e + 2; continue; }
      if (c === '{') d++; else if (c === '}') d--;
      k++;
    }
    const corpo = css.slice(j + 1, k - 1);
    const trimmed = prelude.trim();
    if (trimmed.startsWith('@')) {
      const nome = /^@([\w-]+)/.exec(trimmed)[1];
      if (nome === 'media' || nome === 'supports') {
        out += prelude + '{' + elabora(corpo) + '}';
      } else {
        out += prelude + '{' + corpo + '}';
      }
    } else {
      stat.regole++;
      const mc = /^(\s*(?:\/\*[\s\S]*?\*\/\s*)*)([\s\S]*)$/.exec(prelude);
      const lista = dividiLista(mc[2]);
      const tenuti = lista.map((s) => {
        if (rimappaTipi(s) !== s) stat.mappati++;
        return riscriviSelettore(s);
      });
      out += mc[1] + tenuti.join(',\n') + ' {' + corpo + '}';
    }
    i = k;
  }
  return out;
}

function raccogliStiliGlobaliPagine() {
  const pagesDir = path.join(root, 'mockup', 'src', 'pages');
  const blocchi = [];
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'proposta-b') continue;
        walk(p);
      } else if (e.name.endsWith('.astro')) {
        const s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
        for (const m of s.matchAll(/<style\s+is:global\s*>([\s\S]*?)<\/style>/g)) {
          blocchi.push(`/* --- ${path.relative(root, p).replace(/\\/g, '/')} --- */\n` + m[1].trim());
        }
      }
    }
  }
  walk(pagesDir);
  return blocchi.join('\n\n');
}

const baseCss = fs.readFileSync(path.join(root, 'mockup', 'src', 'styles', 'base.css'), 'utf8').replace(/\r\n/g, '\n');
const sectionsCss = fs.readFileSync(path.join(root, 'mockup', 'src', 'styles', 'sections.css'), 'utf8').replace(/\r\n/g, '\n');
const pagineCss = raccogliStiliGlobaliPagine();
const sorgenteUnito = baseCss + '\n\n' + sectionsCss + '\n\n' + pagineCss;

let trasformato = elabora(sorgenteUnito).replace(/\n{3,}/g, '\n\n');

const mappaMedia = JSON.parse(fs.readFileSync(path.join(__dirname, 'css', 'immagini.json'), 'utf8'));
let urlRiscritti = 0; const urlSenzaMappa = [];
trasformato = trasformato.replace(/url\((['"]?)([^)'"]+)\1\)/g, (tutto, q, rel) => {
  if (/^data:/i.test(rel)) return tutto;
  const norm = rel.replace(/^\.\.\//, '').replace(/^\//, '');
  const voce = mappaMedia[norm] || mappaMedia['/' + norm];
  if (!voce || !voce.url) { urlSenzaMappa.push(rel); return tutto; }
  urlRiscritti++;
  return `url(${q}${voce.url}${q})`;
});
if (urlSenzaMappa.length) {
  console.error('ERRORE: immagini nel CSS assenti in tools/css/immagini.json:', urlSenzaMappa.join(', '));
  process.exit(1);
}

const parte = (f) => { const p = path.join(__dirname, 'css', f); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') : ''; };
const resetCss = parte('reset.css');
const adattamentiCss = parte('adattamenti.css');
const impronta = 'sha1 ' + crypto.createHash('sha1').update(sorgenteUnito + '\n' + resetCss + '\n' + adattamentiCss).digest('hex').slice(0, 10);

const intestazione = `/* Centro Acustico Pizzuti (proposta A) — CSS GENERATO da tools/port-css.js: NON modificare a mano.
   Sorgenti: mockup/src/styles/base.css + sections.css + <style is:global> proposta A (impronta: ${impronta}).
   Struttura: 1) reset Elementor V4 (tools/css/reset.css)
              2) CSS della proposta A prefissato "${PREFISSO}"
              3) adattamenti di markup (tools/css/adattamenti.css)
   Si applica solo con la classe "pizzuti" sul <body>. */
`;

fs.mkdirSync(path.dirname(uscita), { recursive: true });
const finale = intestazione + '\n' + resetCss + '\n/* ===== 2. CSS della proposta A ===== */\n' + trasformato + '\n/* ===== 3. Adattamenti ===== */\n' + adattamentiCss;
fs.writeFileSync(uscita, finale);
console.log(`CSS generato: ${sorgenteUnito.split('\n').length} righe sorgente -> ${finale.split('\n').length} righe in ${path.relative(root, uscita)} (${impronta})`);
console.log(`regole: ${stat.regole}, tag rimappati: ${stat.mappati}, url() riscritti: ${urlRiscritti}`);
