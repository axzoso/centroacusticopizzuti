'use strict';
// Fase 4 — Costruisce le 11 pagine WordPress della proposta A (la 12a è il 404 già pubblicato in Fase 3),
// tutte IN BOZZA, con gerarchia URL identica al mockup e meta SEO (_pizzuti_seo_title, _pizzuti_seo_description).
//
// Uso:
//   node tools/costruisci-fase4.js --piano [--solo home,contatti]
//   node tools/costruisci-fase4.js --esegui [--solo home,contatti] [--pubblica]
//   node tools/costruisci-fase4.js --rollback
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { parse, trova } = require('./html-parse');
const { converti } = require('./html2elementor');
const { connetti, risolviServer } = require('./mcp-client');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'mockup', 'dist');
const outDir = path.join(__dirname, 'out');
const statoFile = path.join(outDir, 'fase4-pagine.json');
const backupFile = path.join(outDir, 'fase4-backup.json');
const mediaMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'css', 'immagini.json'), 'utf8'));

const PAGINE = [
  { chiave: 'home', titolo: 'Home', slug: 'home', parent: null, file: 'index.html', percorso: '/' },
  { chiave: 'chi-siamo', titolo: 'Il Centro e il Metodo', slug: 'chi-siamo', parent: null, file: 'chi-siamo/index.html', percorso: '/chi-siamo/' },
  { chiave: 'apparecchi-acustici', titolo: 'Apparecchi acustici', slug: 'apparecchi-acustici', parent: null, file: 'apparecchi-acustici/index.html', percorso: '/apparecchi-acustici/' },
  { chiave: 'prezzi', titolo: 'Prezzi', slug: 'prezzi', parent: 'apparecchi-acustici', file: 'apparecchi-acustici/prezzi/index.html', percorso: '/apparecchi-acustici/prezzi/' },
  { chiave: 'servizi', titolo: 'Servizi', slug: 'servizi', parent: null, file: 'servizi/index.html', percorso: '/servizi/' },
  { chiave: 'controllo-udito', titolo: 'Controllo dell’udito', slug: 'controllo-udito', parent: 'servizi', file: 'servizi/controllo-udito/index.html', percorso: '/servizi/controllo-udito/' },
  { chiave: 'riparazione', titolo: 'Riparazione e assistenza', slug: 'riparazione-assistenza-apparecchi-acustici', parent: 'servizi', file: 'servizi/riparazione-assistenza-apparecchi-acustici/index.html', percorso: '/servizi/riparazione-assistenza-apparecchi-acustici/' },
  { chiave: 'contatti', titolo: 'Contatti', slug: 'contatti', parent: null, file: 'contatti/index.html', percorso: '/contatti/' },
  { chiave: 'privacy-policy', titolo: 'Privacy Policy', slug: 'privacy-policy', parent: null, file: 'privacy-policy/index.html', percorso: '/privacy-policy/' },
  { chiave: 'cookie-policy', titolo: 'Cookie Policy', slug: 'cookie-policy', parent: null, file: 'cookie-policy/index.html', percorso: '/cookie-policy/' },
  { chiave: 'note-legali', titolo: 'Note legali', slug: 'note-legali', parent: null, file: 'note-legali/index.html', percorso: '/note-legali/' },
];

const args = process.argv.slice(2);
const modo = args.includes('--esegui') ? 'esegui' : args.includes('--rollback') ? 'rollback' : 'piano';
const pubblica = args.includes('--pubblica');
const soloIdx = args.indexOf('--solo');
const solo = soloIdx >= 0 && args[soloIdx + 1] ? new Set(args[soloIdx + 1].split(',').map((s) => s.trim())) : null;
const selezionate = solo ? PAGINE.filter((p) => solo.has(p.chiave)) : PAGINE;

const dec = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');

function compilaPagina(p) {
  const html = fs.readFileSync(path.join(distDir, p.file), 'utf8');
  const seoTitle = dec((/<title>([\s\S]*?)<\/title>/i.exec(html) || [])[1] || '').trim();
  const seoDesc = dec((/<meta name="description" content="([^"]*)"/i.exec(html) || [])[1] || '').trim();
  const bodyClass = ((/<body[^>]*class="([^"]*)"/i.exec(html) || [])[1] || '').split(/\s+/).filter(Boolean);
  const { radice } = parse(html);
  const main = trova(radice, (n) => n.tag === 'main')[0];
  if (!main) throw new Error(`Tag <main> non trovato in ${p.file}`);
  const conv = converti(main.figli, {
    file: p.file,
    media: mediaMap,
    radice: { tag: 'main', id: 'contenuto', classi: ['page-root', ...bodyClass] },
  });
  return { ...p, seoTitle, seoDesc, bodyClass, conv };
}

function novamiraPhp(code, summary, reqId) {
  const tmp = path.join(outDir, `_nm-${reqId}.json`);
  fs.writeFileSync(tmp, JSON.stringify({ code, novamira_review: { attention: 2, summary, request_id: reqId } }));
  try {
    const out = execFileSync('novamira.cmd', ['--site', 'dev1.minimalstudiodev.it', 'run', 'novamira/execute-php', '--input', '@' + tmp, '--yes', '--json'], { encoding: 'utf8', shell: true });
    const j = JSON.parse(out);
    if (!j.ok || !j.data || !j.data.success) throw new Error(`Novamira PHP fallito (${reqId}): ${out.slice(0, 500)}`);
    return j.data.return_value;
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

async function assicuraClassi(el, tutte) {
  const res = await el.callJson('elementor-read-resource', { uri: 'elementor://global-classes' });
  const parsed = typeof res.content === 'string' ? JSON.parse(res.content) : res;
  const esistenti = new Set((parsed.classes || []).map((c) => c.label));
  const mancanti = [...tutte].filter((c) => !esistenti.has(c));
  if (!mancanti.length) {
    console.log('Classi globali: tutte già presenti');
    return;
  }
  for (let i = 0; i < mancanti.length; i += 45) {
    const blocco = mancanti.slice(i, i + 45);
    await el.callJson('elementor-manage-classes', {
      operations: blocco.map((label) => ({ action: 'create', label, css: '--p: 0;' })),
    });
    console.log(`Create ${blocco.length} classi globali:`, blocco.join(', '));
  }
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const compilate = selezionate.map(compilaPagina);
  const tutteClassi = new Set(compilate.flatMap((c) => c.conv.classiUsate));
  const tuttiAvvisi = compilate.flatMap((c) => c.conv.avvisi);

  if (modo === 'piano') {
    console.log(`=== PIANO FASE 4 (${compilate.length} pagine, offline — nessuna scrittura) ===`);
    console.log(`Classi totali usate (${tutteClassi.size}):`, [...tutteClassi].join(', '));
    for (const c of compilate) {
      console.log(` - ${c.chiave.padEnd(20)} ${c.percorso.padEnd(46)} ${String(c.conv.elementi).padStart(3)} el | avvisi: ${c.conv.avvisi.length} | title: "${c.seoTitle}"`);
    }
    if (tuttiAvvisi.length) {
      console.log('\nAVVISI CONVERSIONE:');
      tuttiAvvisi.forEach((a) => console.log('  !', a));
    } else {
      console.log('\n0 avvisi di conversione.');
    }
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
    if (!fs.existsSync(statoFile)) throw new Error('Stato non trovato: ' + statoFile);
    const st = JSON.parse(fs.readFileSync(statoFile, 'utf8'));
    for (const [k, v] of Object.entries(st.pagine || {})) {
      if (!v.id || v.preesistente) continue;
      await wpFetch(`/wp-json/wp/v2/pages/${v.id}`, { method: 'DELETE' });
      console.log(`Cestinata pagina bozza #${v.id} (${k})`);
    }
    return;
  }

  // --esegui
  if (tuttiAvvisi.length) {
    console.log('AVVISI CONVERSIONE (non bloccanti, verificare):');
    tuttiAvvisi.forEach((a) => console.log('  !', a));
  }

  const el = await connetti('elementor');
  await assicuraClassi(el, tutteClassi);

  const esistenti = await wpFetch('/wp-json/wp/v2/pages?per_page=100&status=draft,publish,pending,private');
  const perSlug = new Map(esistenti.map((x) => [x.slug, x]));
  const stato = fs.existsSync(statoFile) ? JSON.parse(fs.readFileSync(statoFile, 'utf8')) : { pagine: {} };
  const backup = fs.existsSync(backupFile) ? JSON.parse(fs.readFileSync(backupFile, 'utf8')) : { timestamp: new Date().toISOString(), before: {} };

  const metaDaSalvare = {};
  for (const c of compilate) {
    let id = stato.pagine[c.chiave] && stato.pagine[c.chiave].id;
    let preesistente = Boolean(stato.pagine[c.chiave] && stato.pagine[c.chiave].preesistente);
    const trov = (id && esistenti.find((x) => x.id === id)) || perSlug.get(c.slug);
    const parentId = c.parent ? (stato.pagine[c.parent] && stato.pagine[c.parent].id) || (perSlug.get(c.parent) && perSlug.get(c.parent).id) || 0 : 0;

    if (trov) {
      id = trov.id;
      if (trov.id === 3) preesistente = true;
      // Allinea slug, titolo, parent (mantenendo lo stato bozza salvo --pubblica)
      await wpFetch(`/wp-json/wp/v2/pages/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: c.titolo, slug: c.slug, parent: parentId }),
      });
      console.log(`Riuso pagina #${id}: ${c.titolo} (${c.percorso}, parent=${parentId})`);
    } else {
      const cr = await el.callJson('elementor-create-page', { title: c.titolo, post_type: 'page', template: 'elementor_header_footer' });
      id = cr.post_id || cr.id;
      if (!id) throw new Error(`Creazione pagina fallita (${c.chiave}): ${JSON.stringify(cr).slice(0, 400)}`);
      await wpFetch(`/wp-json/wp/v2/pages/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: c.slug, parent: parentId }),
      });
      console.log(`Creata pagina IN BOZZA #${id}: ${c.titolo} (${c.percorso}, parent=${parentId})`);
    }

    backup.before[c.chiave] = await el.callJson('elementor-get-page-structure', { post_id: id }).catch(() => null);

    // Imposta template pagina Elementor Full Width (così Header/Footer del Theme Builder si vedono!)
    await el.callJson('elementor-update-page-settings', { post_id: id, settings: { template: 'elementor_header_footer', hide_title: 'yes' } }).catch(() => {});

    const comp = await el.callJson('elementor-build-composition', {
      post_id: id,
      mode: 'replace_children',
      parent_id: 'document',
      ...c.conv.composizione,
    });
    if (comp.errors && comp.errors.length) {
      throw new Error(`Errori composizione ${c.chiave} (#${id}): ${JSON.stringify(comp.errors).slice(0, 500)}`);
    }

    if (pubblica) {
      await el.callJson('elementor-publish-document', { post_id: id });
    }
    const prev = await el.callJson('elementor-create-preview-link', { post_id: id }).catch(() => ({}));

    stato.pagine[c.chiave] = {
      id,
      titolo: c.titolo,
      slug: c.slug,
      parent: parentId,
      percorso: c.percorso,
      stato: pubblica ? 'publish' : 'draft',
      elementi: c.conv.elementi,
      seoTitle: c.seoTitle,
      seoDesc: c.seoDesc,
      preesistente,
      undo_revision_id: comp.undo_revision_id || null,
      preview_url: prev.url || null,
    };
    metaDaSalvare[id] = { title: c.seoTitle, desc: c.seoDesc };
    console.log(`  -> #${id} scritta (${c.conv.elementi} el, undo=${comp.undo_revision_id || 'n/a'}, stato=${pubblica ? 'publish' : 'draft'})`);
  }

  // Salva meta SEO (_pizzuti_seo_title, _pizzuti_seo_description) e svuota _elementor_element_cache
  const b64 = Buffer.from(JSON.stringify(metaDaSalvare), 'utf8').toString('base64');
  novamiraPhp(`
$M = json_decode(base64_decode('${b64}'), true);
foreach ($M as $id => $m) {
  $id = (int)$id;
  update_post_meta($id, '_pizzuti_seo_title', $m['title']);
  update_post_meta($id, '_pizzuti_seo_description', $m['desc']);
  update_post_meta($id, '_wp_page_template', 'elementor_header_footer');
  update_post_meta($id, '_elementor_edit_mode', 'builder');
  delete_metadata('post', $id, '_elementor_element_cache');
  foreach (wp_get_post_revisions($id) as $r) {
    delete_metadata('post', (int)$r->ID, '_elementor_element_cache');
  }
}
if (class_exists('\\Elementor\\Plugin')) { \\Elementor\\Plugin::$instance->files_manager->clear_cache(); }
wp_cache_flush();
return count($M);
`, 'Salva meta SEO e template elementor_header_footer sulle pagine Fase 4 in bozza.', 'f4-meta-seo');

  await el.callJson('elementor-clear-cache', {});
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  fs.writeFileSync(statoFile, JSON.stringify(stato, null, 2));
  console.log(`\n=== FASE 4: ${compilate.length} PAGINE SCRITTE IN BOZZA (stato in tools/out/fase4-pagine.json) ===`);
})().catch((e) => { console.error(e); process.exit(1); });
