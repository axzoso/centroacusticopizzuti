'use strict';
// Verifica completa Fase 1: serve mockup/dist/ in-process, ispeziona il markup reale emesso da
// Elementor 4.4.2 sulla pagina bozza di prova e misura la parità a pixel (1440, 390, 320 px).
//   node tools/verifica-fase1.js [--post-id 40] [--con-tema]
const fs = require('fs');
const path = require('path');
const http = require('http');
const { openBrowser } = require('./cdp-session');
const { comparePngs } = require('./png-diff');
const { connetti } = require('./mcp-client');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'mockup', 'dist');
const cssFile = path.join(__dirname, 'out', 'pizzuti-prova.css');
const fontDir = path.join(root, 'mockup', 'node_modules', '@fontsource-variable', 'montserrat', 'files');
const statoFile = path.join(__dirname, 'out', 'prova-fase1-stato.json');
const outDir = path.join(__dirname, 'out', 'parita', 'fase1-testata');
fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const conTema = args.includes('--con-tema');
const pi = args.indexOf('--post-id');
const postId = pi >= 0 ? parseInt(args[pi + 1], 10) : JSON.parse(fs.readFileSync(statoFile, 'utf8')).post_id;

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };

function avviaServerStatico() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const clean = decodeURIComponent((req.url || '/').split('?')[0]);
      let p = path.join(distDir, clean);
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
      if (!fs.existsSync(p)) { res.writeHead(404); res.end('Not found'); return; }
      const ext = path.extname(p).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}/` }));
  });
}

function costruisciFontCss() {
  const latin = path.join(fontDir, 'montserrat-latin-wght-normal.woff2');
  const latinExt = path.join(fontDir, 'montserrat-latin-ext-wght-normal.woff2');
  let css = '';
  if (fs.existsSync(latinExt)) {
    css += `@font-face{font-family:'Montserrat Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url(data:font/woff2;base64,${fs.readFileSync(latinExt).toString('base64')}) format('woff2-variations');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;}\n`;
  }
  if (fs.existsSync(latin)) {
    css += `@font-face{font-family:'Montserrat Variable';font-style:normal;font-display:swap;font-weight:100 900;src:url(data:font/woff2;base64,${fs.readFileSync(latin).toString('base64')}) format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}\n`;
  }
  return css;
}

(async () => {
  const { srv, url: urlMockup } = await avviaServerStatico();
  try {
    const el = await connetti('elementor');
    const prev = await el.callJson('elementor-create-preview-link', { post_id: postId });
    if (!prev.url) throw new Error('Preview non disponibile: ' + JSON.stringify(prev));
    const urlStaging = prev.url;

    const extraCss = costruisciFontCss() + fs.readFileSync(cssFile, 'utf8');
    const prove = [
      { w: 1440, h: 900, mobile: false, sel: '.home-hero', nome: 'hero' },
      { w: 390, h: 844, mobile: true, sel: '.home-hero', nome: 'hero' },
      { w: 390, h: 844, mobile: true, sel: '.contact-bar', nome: 'contactbar' },
      { w: 320, h: 568, mobile: true, sel: '.contact-bar', nome: 'contactbar' },
    ];

    let ispezionato = false;
    let errori = 0;

    for (const p of prove) {
      const b = await openBrowser({ width: p.w, height: p.h, mobile: p.mobile });
      try {
        const fa = path.join(outDir, `mockup-${p.nome}@${p.w}.png`);
        const fb = path.join(outDir, `staging-${p.nome}@${p.w}.png`);
        const fd = path.join(outDir, `diff-${p.nome}@${p.w}.png`);

        await b.navigate(urlMockup);
        const ra = await b.screenshotSelettore(p.sel, fa, { mantieniViewport: true, settle: 600 });
        const geomA = await b.evalJs(`(() => {
          const e = document.querySelector(${JSON.stringify(p.sel)});
          const h1 = document.querySelector('.home-hero h1');
          const lead = document.querySelector('.home-hero .lead');
          const btns = [...e.querySelectorAll('.btn')].map(x => { const r = x.getBoundingClientRect(); const cs = getComputedStyle(x); return { t: x.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, bg: cs.backgroundColor }; });
          return JSON.stringify({ rect: e.getBoundingClientRect(), h1: h1 ? { fs: getComputedStyle(h1).fontSize, lh: getComputedStyle(h1).lineHeight, ff: getComputedStyle(h1).fontFamily, w: Math.round(h1.getBoundingClientRect().width), h: Math.round(h1.getBoundingClientRect().height) } : null, lead: lead ? { fs: getComputedStyle(lead).fontSize, h: Math.round(lead.getBoundingClientRect().height) } : null, btns });
        })()`);

        await b.navigate(urlStaging);
        if (!ispezionato) {
          ispezionato = true;
          const domInfo = await b.evalJs(`(() => {
            const root = document.querySelector('.elementor');
            const sheets = [...document.querySelectorAll('link[rel="stylesheet"], style[id]')].map(s => s.tagName === 'LINK' ? s.href : '#' + s.id);
            const gfonts = [...document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]')].map(l => l.href);
            return JSON.stringify({
              bodyClass: document.body.className,
              rootOuterStart: root ? root.outerHTML.slice(0, 3500) : 'NO .elementor',
              sheets,
              gfonts,
            }, null, 2);
          })()`);
          fs.writeFileSync(path.join(outDir, 'dom-staging.json'), domInfo);
          console.log('=== ISPEZIONE DOM STAGING (salvata in tools/out/parita/fase1-testata/dom-staging.json) ===');
          const parsed = JSON.parse(domInfo);
          console.log('body.className:', parsed.bodyClass);
          console.log('Google Fonts links:', parsed.gfonts.length, parsed.gfonts);
          console.log('Stylesheets:', parsed.sheets.join('\n  '));
          console.log('\nMarkup .elementor:\n' + parsed.rootOuterStart);
        }

        await b.evalJs("document.querySelectorAll('#wpadminbar').forEach(e => e.remove()); 1");
        if (!conTema) {
          await b.evalJs("document.querySelectorAll('style#global-styles-inline-css, style#twentytwentyfive-style-inline-css, style#wp-block-library-inline-css, style#classic-theme-styles-inline-css, link[href*=\"twentytwentyfive\"], link[href*=\"hello-elementor\"], link[href*=\"fonts.googleapis.com\"]').forEach(e => e.remove()); 1");
        }
        await b.evalJs(`(() => {
          document.body.classList.add('pizzuti');
          const s = document.createElement('style');
          s.id = 'pizzuti-prova-css';
          s.textContent = ${JSON.stringify(extraCss)};
          document.head.appendChild(s);
          return document.fonts ? document.fonts.ready.then(() => 1) : 1;
        })()`);

        const rb = await b.screenshotSelettore(p.sel, fb, { mantieniViewport: true, settle: 800 });
        const geomB = await b.evalJs(`(() => {
          const e = document.querySelector(${JSON.stringify(p.sel)});
          const h1 = document.querySelector('.home-hero h1');
          const lead = document.querySelector('.home-hero .lead');
          const btns = [...e.querySelectorAll('.btn')].map(x => { const r = x.getBoundingClientRect(); const cs = getComputedStyle(x); return { t: x.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, bg: cs.backgroundColor }; });
          return JSON.stringify({ rect: e.getBoundingClientRect(), h1: h1 ? { fs: getComputedStyle(h1).fontSize, lh: getComputedStyle(h1).lineHeight, ff: getComputedStyle(h1).fontFamily, w: Math.round(h1.getBoundingClientRect().width), h: Math.round(h1.getBoundingClientRect().height) } : null, lead: lead ? { fs: getComputedStyle(lead).fontSize, h: Math.round(lead.getBoundingClientRect().height) } : null, btns, scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth });
        })()`);

        const c = comparePngs(fa, fb, { tol: 10, diffOut: fd, band: 100 });
        const gA = JSON.parse(geomA);
        const gB = JSON.parse(geomB);
        console.log(`\n== ${p.nome} @${p.w}px (${conTema ? 'con tema TT5' : 'senza fogli tema'}): mockup ${ra.width}x${ra.height} / staging ${rb.width}x${rb.height} (Δh ${rb.height - ra.height}px, Δw ${rb.width - ra.width}px); pixel diversi ${c.percentuale}%; scrollX: ${gB.scrollX}px`);
        if (p.nome === 'hero') {
          console.log('   H1 mockup:', JSON.stringify(gA.h1));
          console.log('   H1 staging:', JSON.stringify(gB.h1));
        }
        console.log('   BTN mockup:', JSON.stringify(gA.btns));
        console.log('   BTN staging:', JSON.stringify(gB.btns));
        const fasce = (c.bande || []).slice().sort((x, y) => y.percentuale - x.percentuale).slice(0, 5);
        if (fasce.length) console.log('   fasce diverse:', fasce.map((x) => `${x.da}-${x.a}: ${x.percentuale}%`).join('  '));
        if (gB.scrollX > 0) errori++;
      } finally {
        await b.close();
      }
    }
    if (errori > 0) process.exit(1);
  } finally {
    srv.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
