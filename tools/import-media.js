'use strict';
// Carica in Libreria media di WordPress tutte le immagini della proposta A (mockup/public/img/ senza b/
// e mockup/public/logos/) tramite REST WP standard (conserva nomi file SEO e alt) e aggiorna
// tools/css/immagini.json. Idempotente.
//   node tools/import-media.js --piano
//   node tools/import-media.js --esegui
//   node tools/import-media.js --rollback
const fs = require('fs');
const path = require('path');
const { risolviServer } = require('./mcp-client');

const root = path.resolve(__dirname, '..');
const outDir = path.join(__dirname, 'out');
const mappaFile = path.join(__dirname, 'css', 'immagini.json');
const backupFile = path.join(outDir, 'import-media-backup.json');
const args = process.argv.slice(2);
const modo = args.includes('--esegui') ? 'esegui' : args.includes('--rollback') ? 'rollback' : 'piano';

// Elenco esplicito delle sole immagini della proposta A (proposta B /img/b/ esclusa) con alt dal mockup
const ELENCO = [
  { rel: '/img/studio-ufficio.jpg', file: 'mockup/public/img/studio-ufficio.jpg', alt: 'Il Dott. Pasqualino Pizzuti alla scrivania del suo studio' },
  { rel: '/img/dottore-ritratto.jpg', file: 'mockup/public/img/dottore-ritratto.jpg', alt: 'Ritratto del Dott. Pasqualino Pizzuti, audioprotesista a Cosenza' },
  { rel: '/img/dottore-studio.jpg', file: 'mockup/public/img/dottore-studio.jpg', alt: 'Il Dott. Pizzuti alla sua scrivania nel Centro' },
  { rel: '/img/dottore-apparecchio.jpg', file: 'mockup/public/img/dottore-apparecchio.jpg', alt: 'Il Dott. Pizzuti mostra un apparecchio acustico' },
  { rel: '/img/regolazione-orecchio.jpg', file: 'mockup/public/img/regolazione-orecchio.jpg', alt: 'Regolazione di un apparecchio acustico durante una visita' },
  { rel: '/img/visita-audiogramma.jpg', file: 'mockup/public/img/visita-audiogramma.jpg', alt: 'Il Dott. Pizzuti mostra a una paziente l’esito del controllo sul monitor' },
  { rel: '/img/vetrina-centro.jpg', file: 'mockup/public/img/vetrina-centro.jpg', alt: 'L’ingresso del Centro Acustico Pizzuti, con il Dott. Pizzuti sulla porta' },
  { rel: '/img/apparecchi-quaderno-rosso.jpg', file: 'mockup/public/img/apparecchi-quaderno-rosso.jpg', alt: 'Apparecchi acustici e custodia su una scrivania' },
  { rel: '/img/apparecchio-mano-arancio.jpg', file: 'mockup/public/img/apparecchio-mano-arancio.jpg', alt: 'Una mano apre la custodia di un apparecchio acustico' },
  { rel: '/img/auricolari-su-misura.jpg', file: 'mockup/public/img/auricolari-su-misura.jpg', alt: 'Due auricolari su misura, uno blu e uno rosso' },
  { rel: '/img/prova-mani-custodia.jpg', file: 'mockup/public/img/prova-mani-custodia.jpg', alt: 'Due mani estraggono un apparecchio acustico dalla custodia' },
  { rel: '/img/familiare-supporto.jpg', file: 'mockup/public/img/familiare-supporto.jpg', alt: 'Un giovane accompagna un familiare anziano durante la prova di un apparecchio' },
  { rel: '/img/senior-apparecchio.jpg', file: 'mockup/public/img/senior-apparecchio.jpg', alt: 'Un uomo con un apparecchio acustico durante una conversazione' },
  { rel: '/img/b/nonno-nipote.jpg', file: 'mockup/public/img/b/nonno-nipote.jpg', alt: 'Un nonno sorridente con il nipotino in braccio' },
  { rel: '/img/b/telefono-sorriso.jpg', file: 'mockup/public/img/b/telefono-sorriso.jpg', alt: 'Una signora sorride al telefono' },
  { rel: '/img/badge-google.png', file: 'mockup/public/img/badge-google.png', alt: 'Valutazione Google 5.0 su 5' },
  { rel: '/logos/logo-color.png', file: 'mockup/public/logos/logo-color.png', alt: 'Centro Acustico Pizzuti' },
  { rel: '/logos/logo-white.png', file: 'mockup/public/logos/logo-white.png', alt: 'Centro Acustico Pizzuti' },
  { rel: '/logos/mark-color.png', file: 'mockup/public/logos/mark-color.png', alt: 'Simbolo Centro Acustico Pizzuti' },
];

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  for (const e of ELENCO) {
    const abs = path.join(root, e.file);
    if (!fs.existsSync(abs)) throw new Error('File mancante: ' + e.file);
  }

  if (modo === 'piano') {
    console.log(`=== PIANO IMPORT MEDIA PROPOSTA A (${ELENCO.length} file, offline) ===`);
    let tot = 0;
    for (const e of ELENCO) {
      const sz = fs.statSync(path.join(root, e.file)).size;
      tot += sz;
      console.log(` - ${e.rel} (${(sz / 1024).toFixed(1)} KB) | alt: "${e.alt}"`);
    }
    console.log(`Totale: ${(tot / 1024).toFixed(1)} KB -> mappa in tools/css/immagini.json`);
    return;
  }

  const { auth, origin } = risolviServer('elementor');
  const wpFetch = async (ep, opts = {}) => {
    const r = await fetch(origin + ep, { ...opts, headers: { Authorization: auth, ...(opts.headers || {}) } });
    const txt = await r.text();
    if (!r.ok) throw new Error(`WP REST ${ep} HTTP ${r.status}: ${txt.slice(0, 400)}`);
    return JSON.parse(txt);
  };

  if (modo === 'rollback') {
    if (!fs.existsSync(backupFile)) throw new Error('Nessun backup trovato: ' + backupFile);
    const bk = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    for (const id of (bk.creati || [])) {
      await wpFetch(`/wp-json/wp/v2/media/${id}?force=true`, { method: 'DELETE' });
      console.log('Rimosso media ID', id);
    }
    if (bk.mappaPrima !== undefined) fs.writeFileSync(mappaFile, JSON.stringify(bk.mappaPrima, null, 2) + '\n');
    console.log('Rollback import media completato.');
    return;
  }

  // --esegui: legge la libreria attuale per idempotenza
  const esistenti = await wpFetch('/wp-json/wp/v2/media?per_page=100&context=edit');
  const perNome = new Map();
  for (const m of esistenti) {
    const bn = path.basename(m.source_url || '').toLowerCase();
    perNome.set(bn, m);
  }

  const mappaPrima = fs.existsSync(mappaFile) ? JSON.parse(fs.readFileSync(mappaFile, 'utf8')) : {};
  const mappa = {};
  const creati = [];

  for (const e of ELENCO) {
    const abs = path.join(root, e.file);
    const fname = path.basename(abs);
    const ext = path.extname(fname).toLowerCase();
    const gia = perNome.get(fname.toLowerCase());
    let rec;
    if (gia) {
      rec = gia;
      if ((gia.alt_text || '') !== e.alt) {
        rec = await wpFetch(`/wp-json/wp/v2/media/${gia.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alt_text: e.alt }),
        });
      }
      console.log(`Riusato #${rec.id}: ${fname}`);
    } else {
      const buf = fs.readFileSync(abs);
      rec = await wpFetch('/wp-json/wp/v2/media', {
        method: 'POST',
        headers: {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fname}"`,
        },
        body: buf,
      });
      rec = await wpFetch(`/wp-json/wp/v2/media/${rec.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt_text: e.alt, title: fname.replace(/\.[^.]+$/, '') }),
      });
      creati.push(rec.id);
      console.log(`Caricato #${rec.id}: ${fname} -> ${new URL(rec.source_url).pathname}`);
    }
    mappa[e.rel] = {
      id: rec.id,
      url: new URL(rec.source_url).pathname,
      alt: e.alt,
    };
  }

  fs.writeFileSync(backupFile, JSON.stringify({ timestamp: new Date().toISOString(), creati, mappaPrima }, null, 2));
  fs.writeFileSync(mappaFile, JSON.stringify(mappa, null, 2) + '\n');
  console.log(`\nImport media completato: ${ELENCO.length} file mappati (${creati.length} nuovi), mappa scritta in tools/css/immagini.json`);
})().catch((e) => { console.error(e); process.exit(1); });
