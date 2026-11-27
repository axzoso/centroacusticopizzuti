'use strict';
// Confronto di parità pixel a pixel tra build del mockup (proposta A) e pagina WordPress su staging.
//   node tools/parita.js <nome> <url-mockup> <url-staging|@post_id> [--w 1440,390] [--tol 10] [--band 100]
//                        [--sel-a .home-hero] [--sel-b .home-hero] [--css tools/out/pizzuti-prova.css]
//                        [--font-dir mockup/node_modules/@fontsource-variable/montserrat/files]
//                        [--body-class pizzuti] [--no-tema] [--viewport]
// Scrive tools/out/parita/<nome>/{mockup,staging,diff}@<larghezza>.png e stampa metriche e scroll orizzontale.
const fs = require('fs');
const path = require('path');
const { openBrowser } = require('./cdp-session');
const { comparePngs } = require('./png-diff');
const { connetti } = require('./mcp-client');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(k);
const pos = [];
for (let i = 0; i < args.length; i++) {
  if (['--w', '--tol', '--band', '--sel-a', '--sel-b', '--css', '--font-dir', '--body-class'].includes(args[i])) { i++; continue; }
  if (['--no-tema', '--viewport'].includes(args[i])) continue;
  pos.push(args[i]);
}
const [nome, urlA, urlBIn] = pos;
if (!nome || !urlA || !urlBIn) {
  console.error('uso: node tools/parita.js <nome> <url-mockup> <url-staging|@id> [--w 1440,390] [--sel-a sel] [--sel-b sel] [--css file.css]');
  process.exit(2);
}

const larghezze = opt('--w', '1440,390').split(',').map(Number);
const tol = parseInt(opt('--tol', '10'), 10);
const band = parseInt(opt('--band', '100'), 10);
const selA = opt('--sel-a', '');
const selB = opt('--sel-b', '');
const cssFile = opt('--css', '');
const fontDir = opt('--font-dir', '');
const bodyClass = opt('--body-class', '');
const noTema = flag('--no-tema');
const soloViewport = flag('--viewport');

const out = path.resolve(__dirname, 'out', 'parita', nome);
fs.mkdirSync(out, { recursive: true });

function costruisciFontCss(dir) {
  if (!dir) return '';
  const abs = path.resolve(dir);
  const latin = path.join(abs, 'montserrat-latin-wght-normal.woff2');
  const latinExt = path.join(abs, 'montserrat-latin-ext-wght-normal.woff2');
  let css = '';
  if (fs.existsSync(latinExt)) {
    const b64 = fs.readFileSync(latinExt).toString('base64');
    css += `@font-face{font-family:'Montserrat Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url(data:font/woff2;base64,${b64}) format('woff2-variations');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;}\n`;
  }
  if (fs.existsSync(latin)) {
    const b64 = fs.readFileSync(latin).toString('base64');
    css += `@font-face{font-family:'Montserrat Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url(data:font/woff2;base64,${b64}) format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}\n`;
  }
  return css;
}

async function risolviUrl(u) {
  const m = /^@(\d+)$/.exec(u);
  if (!m) return u;
  const el = await connetti('elementor');
  const p = await el.callJson('elementor-create-preview-link', { post_id: parseInt(m[1], 10) });
  if (!p.url) throw new Error('anteprima non disponibile per ' + m[1] + ': ' + JSON.stringify(p).slice(0, 200));
  return p.url;
}

(async () => {
  const urlB = await risolviUrl(urlBIn);
  const extraCss = (fontDir ? costruisciFontCss(fontDir) : '') + (cssFile ? fs.readFileSync(path.resolve(cssFile), 'utf8') : '');
  let falliti = 0;

  for (const w of larghezze) {
    const hView = w < 700 ? 844 : 900;
    const b = await openBrowser({ width: w, height: hView, mobile: w < 700 });
    try {
      const fa = path.join(out, `mockup@${w}.png`);
      const fb = path.join(out, `staging@${w}.png`);
      const fd = path.join(out, `diff@${w}.png`);

      await b.navigate(urlA);
      const ra = soloViewport
        ? await b.screenshotViewport(fa)
        : selA
          ? await b.screenshotSelettore(selA, fa, { mantieniViewport: true })
          : await b.screenshotFull(fa);

      await b.navigate(urlB);
      await b.evalJs("document.querySelectorAll('#wpadminbar').forEach(function (e) { e.remove(); }); 1");
      if (noTema) {
        await b.evalJs(`(() => {
          document.querySelectorAll('style#global-styles-inline-css, style#twentytwentyfive-style-inline-css, style#wp-block-library-inline-css, style#classic-theme-styles-inline-css, link[href*="twentytwentyfive"], link[href*="hello-elementor"], link[href*="fonts.googleapis.com"]').forEach(e => e.remove());
          return 1;
        })()`);
      }
      if (bodyClass) {
        await b.evalJs(`document.body.classList.add(...${JSON.stringify(bodyClass.split(/\s+/).filter(Boolean))}); 1`);
      }
      if (extraCss) {
        await b.evalJs(`(() => {
          const s = document.createElement('style');
          s.id = 'pizzuti-prova-css';
          s.textContent = ${JSON.stringify(extraCss)};
          document.head.appendChild(s);
          return document.fonts ? document.fonts.ready.then(() => 1) : 1;
        })()`);
      }
      const rb = soloViewport
        ? await b.screenshotViewport(fb)
        : selB
          ? await b.screenshotSelettore(selB, fb, { mantieniViewport: true })
          : await b.screenshotFull(fb);

      const c = comparePngs(fa, fb, { tol, diffOut: fd, band });
      const scroll = await b.evalJs('document.documentElement.scrollWidth - document.documentElement.clientWidth');
      console.log(`\n== ${nome} @${w}px: altezza mockup ${ra.height} / staging ${rb.height} (Δ ${rb.height - ra.height}px); pixel diversi ${c.percentuale}%; scroll orizzontale staging: ${scroll}px`);
      const fasce = (c.bande || []).slice().sort((x, y) => y.percentuale - x.percentuale).slice(0, 6);
      if (fasce.length) console.log('   fasce più diverse (y da-a: % pixel): ' + fasce.map((x) => `${x.da}-${x.a}: ${x.percentuale}%`).join('  '));
      if (scroll > 0) falliti++;
    } finally {
      await b.close();
    }
  }
  if (falliti > 0) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });
