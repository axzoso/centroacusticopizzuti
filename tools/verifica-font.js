'use strict';
// Verifica che il sito carichi ZERO richieste verso Google Fonts e carichi Montserrat Variable in locale.
//   node tools/verifica-font.js [url1 url2 ...]   (default: https://dev1.minimalstudiodev.it/)
const { openBrowser } = require('./cdp-session');

const urls = process.argv.slice(2).length ? process.argv.slice(2) : ['https://dev1.minimalstudiodev.it/'];

(async () => {
  const b = await openBrowser({ width: 1440, height: 900 });
  let errori = 0;
  try {
    await b.send('Network.enable');
    for (const url of urls) {
      const richieste = [];
      b.on('Network.requestWillBeSent', (p) => richieste.push(p.request.url));
      const start = richieste.length;
      await b.navigate(url, { settle: 1000 });
      const nuove = richieste.slice(start);
      const google = nuove.filter((u) => /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(u));
      const locali = nuove.filter((u) => /pizzuti-core\/fonts\/.*\.woff2/i.test(u));
      const loaded = await b.evalJs(`JSON.stringify([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ':' + f.weight))`);
      console.log(`\n== ${url}`);
      console.log('   Google Fonts:', google.length, google.length ? google.join(', ') : '(OK: zero richieste)');
      console.log('   Font locali woff2:', locali.length, locali.map((u) => u.split('/').pop()).join(', '));
      console.log('   document.fonts loaded:', loaded);
      if (google.length > 0 || locali.length === 0) errori++;
    }
  } finally {
    await b.close();
  }
  if (errori > 0) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });
