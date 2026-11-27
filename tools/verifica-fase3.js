'use strict';
// Verifica di parità Fase 3 sui 4 template del Theme Builder IN BOZZA (con il vero CSS/JS di pizzuti-core
// servito da WordPress — nessuna iniezione CSS):
//   - Header #122 (@1440, @390 chiuso, @390 menu mobile aperto + verifica voce attiva)
//   - Footer #125 (@1440, @390)
//   - Barra mobile #128 (@390, @320, e nascosta @1440)
//   - Errore 404 #133 (@1440, @390)
//   - Verifica 0 richieste a Google Fonts e 0px scroll orizzontale.
const fs = require('fs');
const path = require('path');
const http = require('http');
const { openBrowser, sleep } = require('./cdp-session');
const { comparePngs } = require('./png-diff');
const { connetti } = require('./mcp-client');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'mockup', 'dist');
const statoFile = path.join(__dirname, 'out', 'fase3-template.json');
const outDir = path.join(__dirname, 'out', 'parita', 'fase3');
fs.mkdirSync(outDir, { recursive: true });

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

(async () => {
  const st = JSON.parse(fs.readFileSync(statoFile, 'utf8')).template;
  const { srv, base } = await avviaServer();
  const el = await connetti('elementor');
  const prev = {};
  for (const [k, v] of Object.entries(st)) {
    const p = await el.callJson('elementor-create-preview-link', { post_id: v.id });
    if (!p.url) throw new Error(`Preview mancante per ${k} (#${v.id}): ${JSON.stringify(p)}`);
    prev[k] = p.url;
  }

  const prove = [
    { nome: 'header', w: 1440, h: 900, mobile: false, urlA: base + '/', urlB: prev.header, sel: '.site-header' },
    { nome: 'header', w: 390, h: 844, mobile: true, urlA: base + '/', urlB: prev.header, sel: '.site-header' },
    { nome: 'footer', w: 1440, h: 900, mobile: false, urlA: base + '/', urlB: prev.footer, sel: '.site-footer' },
    { nome: 'footer', w: 390, h: 844, mobile: true, urlA: base + '/', urlB: prev.footer, sel: '.site-footer' },
    { nome: 'contactbar', w: 390, h: 844, mobile: true, urlA: base + '/', urlB: prev.barra_mobile, sel: '.contact-bar' },
    { nome: 'contactbar', w: 320, h: 568, mobile: true, urlA: base + '/', urlB: prev.barra_mobile, sel: '.contact-bar' },
    { nome: '404', w: 1440, h: 900, mobile: false, urlA: base + '/404.html', urlB: prev.errore_404, sel: '.nf' },
    { nome: '404', w: 390, h: 844, mobile: true, urlA: base + '/404.html', urlB: prev.errore_404, sel: '.nf' },
  ];

  let gfontsTot = 0;
  let scrollErr = 0;

  try {
    for (const p of prove) {
      const b = await openBrowser({ width: p.w, height: p.h, mobile: p.mobile });
      try {
        await b.send('Network.enable');
        const reqs = [];
        b.on('Network.requestWillBeSent', (e) => reqs.push(e.request.url));

        const fa = path.join(outDir, `mockup-${p.nome}@${p.w}.png`);
        const fb = path.join(outDir, `staging-${p.nome}@${p.w}.png`);
        const fd = path.join(outDir, `diff-${p.nome}@${p.w}.png`);

        await b.navigate(p.urlA, { settle: 1100 });
        if (p.nome === 'footer') await b.evalJs("document.querySelectorAll('.contact-bar').forEach(e => e.style.display='none'); 1");
        const ra = await b.screenshotSelettore(p.sel, fa, { mantieniViewport: p.nome === 'contactbar', settle: 400 });

        const reqStart = reqs.length;
        await b.navigate(p.urlB, { settle: 1100 });
        await b.evalJs("document.querySelectorAll('#wpadminbar').forEach(e => e.remove()); 1");
        const gf = reqs.slice(reqStart).filter((u) => /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(u));
        gfontsTot += gf.length;

        const rb = await b.screenshotSelettore(p.sel, fb, { mantieniViewport: p.nome === 'contactbar', settle: 400 });
        const scrollX = await b.evalJs('document.documentElement.scrollWidth - document.documentElement.clientWidth');
        if (scrollX > 0) scrollErr++;

        const c = comparePngs(fa, fb, { tol: 10, diffOut: fd, band: 100 });
        console.log(`== ${p.nome} @${p.w}px: mockup ${ra.width}x${ra.height} / staging ${rb.width}x${rb.height} (Δh ${rb.height - ra.height}px, Δw ${rb.width - ra.width}px); diff ${c.percentuale}%; scrollX ${scrollX}px; gfonts ${gf.length}`);
        if (c.percentuale > 1.0) {
          const fasce = (c.bande || []).slice().sort((x, y) => y.percentuale - x.percentuale).slice(0, 4);
          console.log('   fasce diverse:', fasce.map((x) => `${x.da}-${x.a}: ${x.percentuale}%`).join('  '));
        }
        // Diagnostica link/testi su header e footer alla prima passata
        if (p.w === 1440 && (p.nome === 'header' || p.nome === 'footer' || p.nome === '404')) {
          const dbg = await b.evalJs(`(() => {
            const el = document.querySelector(${JSON.stringify(p.sel)});
            const links = [...el.querySelectorAll('a')].map(a => a.textContent.trim() + '=>' + a.getAttribute('href'));
            return JSON.stringify({ linksCount: links.length, sample: links.slice(0, 8), textLen: el.innerText.trim().length });
          })()`);
          console.log('   DOM staging:', dbg);
        }
      } finally {
        await b.close();
      }
    }

    // Verifica interazione menu mobile @390px + voce attiva + barra mobile nascosta @1440px
    {
      const b = await openBrowser({ width: 390, height: 844, mobile: true });
      try {
        await b.navigate(prev.header, { settle: 600 });
        await b.evalJs("document.querySelectorAll('#wpadminbar').forEach(e => e.remove()); 1");
        const prima = await b.evalJs("getComputedStyle(document.querySelector('.m-menu-nav')).display");
        await b.evalJs("document.querySelector('.m-menu-summary').click(); 1");
        await sleep(250);
        const dopo = await b.evalJs("getComputedStyle(document.querySelector('.m-menu-nav')).display");
        const voci = await b.evalJs("JSON.stringify([...document.querySelectorAll('.m-menu-nav a')].map(a => a.textContent.trim()))");
        await b.evalJs("window.Pizzuti && window.Pizzuti.marcaAttivo('/chi-siamo/'); 1");
        const attiva = await b.evalJs("JSON.stringify([...document.querySelectorAll('.m-menu-nav a[aria-current=\"page\"]')].map(a => a.textContent.trim()))");
        console.log(`\n== Interazione menu mobile @390px: chiuso=${prima}, aperto=${dopo}, voci=${voci}, attiva(/chi-siamo/)=${attiva}`);
      } finally {
        await b.close();
      }
    }
    {
      const b = await openBrowser({ width: 1440, height: 900, mobile: false });
      try {
        await b.navigate(prev.barra_mobile, { settle: 500 });
        const disp = await b.evalJs("getComputedStyle(document.querySelector('.contact-bar')).display");
        console.log(`== Barra mobile @1440px: display=${disp} (atteso: none)`);
      } finally {
        await b.close();
      }
    }

    console.log(`\nRiepilogo: Google Fonts totali=${gfontsTot}, viste con scrollX>0=${scrollErr}`);
    if (gfontsTot > 0 || scrollErr > 0) process.exit(1);
  } finally {
    srv.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
