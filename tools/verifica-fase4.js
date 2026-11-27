'use strict';
// Verifica completa Fase 4 sulle 11 pagine in bozza:
// - Parità visiva @1440px e @390px (mockup/dist/ vs anteprima firmata Elementor con Header+Footer reali)
// - Salute: 1 solo H1, title e description SEO, 0 immagini rotte, 0 errori console, 0 richieste Google Fonts, 0px scrollX
// - Presenza FAQPage JSON-LD sulle 4 pagine con e-accordion (faq_schema: true)
// Uso:
//   node tools/verifica-fase4.js [--solo home,contatti]
const fs = require('fs');
const path = require('path');
const http = require('http');
const { openBrowser } = require('./cdp-session');
const { comparePngs } = require('./png-diff');
const { connetti } = require('./mcp-client');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'mockup', 'dist');
const statoFile = path.join(__dirname, 'out', 'fase4-pagine.json');
const outDir = path.join(__dirname, 'out', 'parita', 'fase4');
fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const soloIdx = args.indexOf('--solo');
const solo = soloIdx >= 0 && args[soloIdx + 1] ? new Set(args[soloIdx + 1].split(',').map((s) => s.trim())) : null;

const CON_FAQ = new Set(['apparecchi-acustici', 'prezzi', 'controllo-udito', 'riparazione']);
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

function avviaServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const clean = decodeURIComponent((req.url || '/').split('?')[0]);
      let p = path.join(distDir, clean);
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
      if (!fs.existsSync(p)) { res.writeHead(404); res.end('404'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, base: `http://127.0.0.1:${srv.address().port}` }));
  });
}

async function svelaTutto(b) {
  // Scorre tutta la pagina per innescare IntersectionObserver (data-reveal/data-wipe/lazy) poi torna in cima
  await b.evalJs(`(async () => {
    const step = 600;
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 40));
    }
    document.querySelectorAll('[data-reveal],[data-wipe]').forEach(e => e.classList.add('in'));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 150));
    return 1;
  })()`);
}

(async () => {
  const st = JSON.parse(fs.readFileSync(statoFile, 'utf8')).pagine;
  const elenco = Object.entries(st).filter(([k]) => !solo || solo.has(k));
  const { srv, base } = await avviaServer();
  const el = await connetti('elementor');

  const riepilogo = [];
  let erroriTotali = 0;

  try {
    for (const [chiave, info] of elenco) {
      const prev = await el.callJson('elementor-create-preview-link', { post_id: info.id });
      if (!prev.url) throw new Error(`Preview mancante per ${chiave} (#${info.id})`);

      const urlMockup = base + info.percorso;
      const riga = { chiave, id: info.id, percorso: info.percorso, viste: {}, salute: null };

      for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
        const b = await openBrowser({ width: w, height: h, mobile });
        try {
          await b.send('Network.enable');
          const reqs = [];
          const errCon = [];
          b.on('Network.requestWillBeSent', (e) => reqs.push(e.request.url));
          b.on('Runtime.exceptionThrown', (e) => errCon.push(e.exceptionDetails.text));

          const fa = path.join(outDir, `mockup-${chiave}@${w}.png`);
          const fb = path.join(outDir, `staging-${chiave}@${w}.png`);
          const fd = path.join(outDir, `diff-${chiave}@${w}.png`);

          await b.navigate(urlMockup, { settle: 900 });
          await svelaTutto(b);
          const ra = await b.screenshotFull(fa, { settle: 400 });
          const ha = typeof ra === 'object' ? ra.height : ra;

          const reqStart = reqs.length;
          const errStart = errCon.length;
          await b.navigate(prev.url, { settle: 1000 });
          await b.evalJs("document.querySelectorAll('#wpadminbar').forEach(e => e.remove()); 1");
          await svelaTutto(b);
          const rb = await b.screenshotFull(fb, { settle: 400 });
          const hb = typeof rb === 'object' ? rb.height : rb;

          const gf = reqs.slice(reqStart).filter((u) => /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(u));
          const errs = errCon.slice(errStart);
          const scrollX = await b.evalJs('document.documentElement.scrollWidth - document.documentElement.clientWidth');

          if (w === 1440) {
            riga.salute = await b.evalJs(`(() => {
              const h1s = document.querySelectorAll('h1').length;
              const title = document.title;
              const descEl = document.querySelector('meta[name="description"]');
              const desc = descEl ? descEl.getAttribute('content') : '';
              const imgs = [...document.querySelectorAll('img')];
              const rotte = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src);
              const lds = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent);
              const hasFaqLd = lds.some(t => /FAQPage/i.test(t));
              const hasHeader = !!document.querySelector('.site-header');
              const hasFooter = !!document.querySelector('.site-footer');
              const hasPropB = /proposta-b/i.test(document.body.innerHTML);
              return { h1s, title, desc, imgs: imgs.length, rotte, hasFaqLd, hasHeader, hasFooter, hasPropB };
            })()`);
          }

          const c = comparePngs(fa, fb, { tol: 10, diffOut: fd, band: 300 });
          const dh = hb - ha;
          riga.viste[w] = { ha, hb, dh, diff: c.percentuale, scrollX, gfonts: gf.length, errs: errs.length };
          if (scrollX > 0 || gf.length > 0 || errs.length > 0) erroriTotali++;
        } finally {
          await b.close();
        }
      }

      const s = riga.salute;
      const seoOk = s.h1s === 1 && s.title === info.seoTitle && s.desc === info.seoDesc && s.rotte.length === 0 && s.hasHeader && s.hasFooter && !s.hasPropB && (!CON_FAQ.has(chiave) || s.hasFaqLd);
      if (!seoOk) erroriTotali++;
      riepilogo.push(riga);

      const v1440 = riga.viste[1440];
      const v390 = riga.viste[390];
      console.log(
        `${seoOk && v1440.scrollX === 0 && v390.scrollX === 0 ? 'OK  ' : 'ATT '} ${chiave.padEnd(20)} #${String(info.id).padEnd(3)} | ` +
        `@1440: ${v1440.ha}/${v1440.hb} (Δ${v1440.dh >= 0 ? '+' : ''}${v1440.dh}px, ${v1440.diff}%, sx:${v1440.scrollX}) | ` +
        `@390: ${v390.ha}/${v390.hb} (Δ${v390.dh >= 0 ? '+' : ''}${v390.dh}px, ${v390.diff}%, sx:${v390.scrollX}) | ` +
        `H1:${s.h1s} img:${s.imgs}(rotte:${s.rotte.length}) FAQ:${s.hasFaqLd ? 'sì' : 'no'} gf:${v1440.gfonts + v390.gfonts}`
      );
      if (!seoOk) {
        console.log('     DETTAGLIO:', JSON.stringify({
          titleMatch: s.title === info.seoTitle, titleGot: s.title, titleExp: info.seoTitle,
          descMatch: s.desc === info.seoDesc, rotte: s.rotte, hasFaqLd: s.hasFaqLd,
          hasHeader: s.hasHeader, hasFooter: s.hasFooter, hasPropB: s.hasPropB,
        }));
      }
    }
    fs.writeFileSync(path.join(outDir, 'riepilogo-fase4.json'), JSON.stringify(riepilogo, null, 2));
    console.log(`\nRiepilogo Fase 4: ${elenco.length} pagine verificate, anomalie bloccanti: ${erroriTotali}`);
  } finally {
    srv.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
