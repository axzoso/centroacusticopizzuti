'use strict';
// Prova tecnica Fase 1: converte la sola testata della home (hero + barra contatti mobile) dalla build
// Astro della proposta A e la scrive in una pagina IN BOZZA su staging tramite Elementor MCP.
//   node tools/prova-fase1.js --piano      (offline: mostra composizione, classi e passi senza scrivere)
//   node tools/prova-fase1.js --esegui     (carica studio-ufficio.jpg se manca, crea classi solo-etichetta,
//                                           crea/aggiorna la bozza di prova, salva backup in tools/out/)
//   node tools/prova-fase1.js --rollback   (annulla l'ultima modifica al documento tramite undo_revision_id)
// Non pubblica MAI (resta sempre in bozza).
const fs = require('fs');
const path = require('path');
const { parse, trova, classi } = require('./html-parse');
const { converti } = require('./html2elementor');
const { connetti } = require('./mcp-client');

const root = path.resolve(__dirname, '..');
const outDir = path.join(__dirname, 'out');
const statoFile = path.join(outDir, 'prova-fase1-stato.json');
const backupFile = path.join(outDir, 'prova-fase1-backup.json');
const distIndex = path.join(root, 'mockup', 'dist', 'index.html');
const heroImgFile = path.join(root, 'mockup', 'public', 'img', 'studio-ufficio.jpg');
const HERO_ALT = 'Il Dott. Pasqualino Pizzuti alla scrivania del suo studio';

const args = process.argv.slice(2);
const modo = args.includes('--esegui') ? 'esegui' : args.includes('--rollback') ? 'rollback' : 'piano';

function estraiTestata() {
  if (!fs.existsSync(distIndex)) {
    throw new Error('mockup/dist/index.html non trovato: esegui prima "cd mockup && npm run build"');
  }
  const html = fs.readFileSync(distIndex, 'utf8');
  const { radice, avvisi } = parse(html);
  const hero = trova(radice, (n) => n.tag === 'section' && classi(n).includes('home-hero'))[0];
  const bar = trova(radice, (n) => n.tag === 'div' && classi(n).includes('contact-bar'))[0];
  if (!hero || !bar) throw new Error('Hero o contact-bar non trovati in mockup/dist/index.html');
  return { hero, bar, parseAvvisi: avvisi };
}

async function caricaImmagineSeManca(el) {
  const assets = await el.callJson('elementor-list-assets', {});
  const lista = assets.assets || [];
  const esistente = lista.find((a) => /studio-ufficio/i.test(a.title || a.filename || a.url || ''));
  if (esistente) {
    console.log('Media esistente riusato:', esistente.id, esistente.url);
    return { id: esistente.id, url: esistente.url, creato: false };
  }
  const req = await el.callJson('elementor-request-media-upload', { consent: true, count: 1 });
  const slot = (req.uploads && req.uploads[0]) || req;
  const tok = slot.upload_token || slot.token;
  const hdr = slot.token_header || 'X-Elementor-Mcp-Upload-Token';
  if (!slot.upload_url || !tok) throw new Error('elementor-request-media-upload risposta inattesa: chiavi=' + Object.keys(slot).join(','));
  const buf = fs.readFileSync(heroImgFile);
  const up = await fetch(slot.upload_url, {
    method: 'POST',
    headers: {
      [hdr]: tok,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="studio-ufficio.jpg"',
    },
    body: buf,
  });
  const txt = await up.text();
  if (!up.ok) throw new Error(`Upload fallito (HTTP ${up.status}): ${txt.slice(0, 400)}`);
  const j = JSON.parse(txt);
  const id = j.id || j.attachment_id || (j.data && j.data.id);
  const url = j.url || (j.data && j.data.url);
  // Imposta alt text e titolo via REST WP standard (Basic auth dalla stessa configurazione MCP)
  const { risolviServer } = require('./mcp-client');
  const { auth, origin } = risolviServer('elementor');
  await fetch(`${origin}/wp-json/wp/v2/media/${id}`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: HERO_ALT, title: 'studio-ufficio' }),
  });
  console.log('Media caricato:', id, url);
  return { id, url, creato: true };
}

async function assicuraClassi(el, nomi) {
  const res = await el.callJson('elementor-read-resource', { uri: 'elementor://global-classes' });
  const parsed = typeof res.content === 'string' ? JSON.parse(res.content) : res;
  const esistenti = new Set((parsed.classes || []).map((c) => c.label));
  const mancanti = nomi.filter((c) => !esistenti.has(c));
  if (!mancanti.length) {
    console.log('Tutte le classi globali esistono già:', nomi.length);
    return [];
  }
  const ops = mancanti.map((label) => ({ action: 'create', label, css: '--p: 0;' }));
  const r = await el.callJson('elementor-manage-classes', { operations: ops });
  console.log(`Create ${mancanti.length} classi globali (solo etichetta --p: 0;):`, mancanti.join(', '));
  return r;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  if (modo === 'rollback') {
    if (!fs.existsSync(statoFile)) throw new Error('Nessuno stato salvato in tools/out/prova-fase1-stato.json');
    const st = JSON.parse(fs.readFileSync(statoFile, 'utf8'));
    if (!st.undo_revision_id) throw new Error('Nessun undo_revision_id registrato');
    const el = await connetti('elementor');
    const r = await el.callJson('elementor-manage-revisions', { action: 'restore', post_id: st.post_id, revision_id: st.undo_revision_id });
    await el.callJson('elementor-clear-cache', {});
    console.log('Rollback eseguito su post', st.post_id, '-> revision', st.undo_revision_id, JSON.stringify(r));
    return;
  }

  const { hero, bar, parseAvvisi } = estraiTestata();
  if (modo === 'piano') {
    const conv = converti([hero, bar], {
      file: 'mockup/dist/index.html',
      radice: { tag: 'div', classi: ['page-root', 'home'] },
      media: { '/img/studio-ufficio.jpg': { id: 99999 } },
    });
    console.log('=== PIANO PROVA FASE 1 (offline, nessuna scrittura) ===');
    console.log('Parse avvisi:', parseAvvisi.length);
    console.log('Elementi generati:', conv.elementi);
    console.log('Statistiche:', JSON.stringify(conv.statistiche));
    console.log('Classi globali necessarie (' + conv.classiUsate.length + '):', conv.classiUsate.join(', '));
    console.log('Avvisi conversione:', conv.avvisi.length ? conv.avvisi.join(' | ') : 'nessuno');
    console.log('\nXML:\n' + conv.composizione.xml_structure);
    console.log('\nelement_config:\n' + JSON.stringify(conv.composizione.element_config, null, 2));
    console.log('\nclasses:\n' + JSON.stringify(conv.composizione.classes, null, 2));
    return;
  }

  // --esegui
  const el = await connetti('elementor');
  const mediaInfo = await caricaImmagineSeManca(el);
  const conv = converti([hero, bar], {
    file: 'mockup/dist/index.html',
    radice: { tag: 'div', classi: ['page-root', 'home'] },
    media: { '/img/studio-ufficio.jpg': { id: mediaInfo.id } },
  });
  await assicuraClassi(el, conv.classiUsate);

  let stato = fs.existsSync(statoFile) ? JSON.parse(fs.readFileSync(statoFile, 'utf8')) : {};
  let postId = stato.post_id;
  if (!postId) {
    const pages = await el.callJson('elementor-list-posts', { post_type: 'page', per_page: 25 });
    const trovata = (pages.posts || []).find((p) => p.title === '[Prova Fase 1] Testata Home');
    if (trovata) {
      postId = trovata.id;
      console.log('Pagina bozza esistente riusata:', postId);
    } else {
      const creata = await el.callJson('elementor-create-page', {
        title: '[Prova Fase 1] Testata Home',
        post_type: 'page',
        template: 'elementor_canvas',
        hide_title: true,
      });
      postId = creata.post_id || creata.id;
      console.log('Creata pagina IN BOZZA:', postId, JSON.stringify(creata));
    }
  } else {
    console.log('Aggiorno pagina bozza esistente:', postId);
  }

  // Backup stato precedente prima di scrivere
  const prima = await el.callJson('elementor-get-page-structure', { post_id: postId });
  fs.writeFileSync(backupFile, JSON.stringify({ timestamp: new Date().toISOString(), post_id: postId, before: prima }, null, 2));

  const res = await el.callJson('elementor-build-composition', {
    post_id: postId,
    mode: 'replace_children',
    xml_structure: conv.composizione.xml_structure,
    element_config: conv.composizione.element_config,
    classes: conv.composizione.classes,
  });
  await el.callJson('elementor-clear-cache', {});
  const preview = await el.callJson('elementor-create-preview-link', { post_id: postId });

  stato = {
    post_id: postId,
    status: 'draft',
    media_id: mediaInfo.id,
    media_url: mediaInfo.url,
    undo_revision_id: res.undo_revision_id || null,
    classi: conv.classiUsate,
    elementi: conv.elementi,
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(statoFile, JSON.stringify(stato, null, 2));
  console.log('\n=== PROVA FASE 1 COMPLETATA (pagina IN BOZZA) ===');
  console.log('Post ID:', postId, '| Media ID:', mediaInfo.id, '| undo_revision_id:', stato.undo_revision_id);
  console.log('Preview URL:', preview.url);
})().catch((e) => { console.error(e); process.exit(1); });
