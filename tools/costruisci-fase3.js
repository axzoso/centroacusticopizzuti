'use strict';
// Fase 3 — Costruisce i 4 template del Theme Builder di Elementor Pro (tutti IN BOZZA, condizioni impostate):
//   1. Header Pizzuti                  (type: header,            conditions: ['include/general'])
//   2. Footer Pizzuti                  (type: footer,            conditions: ['include/general'])
//   3. Barra mobile Chiama/WhatsApp    (type: floating-buttons,  conditions: ['include/general'])
//   4. Errore 404 Pizzuti              (type: error-404,         conditions: ['include/singular/not_found404'])
//
// Uso:
//   node tools/costruisci-fase3.js --piano       (offline: elenca classi, strutture e widget)
//   node tools/costruisci-fase3.js --esegui      (crea/aggiorna i 4 template IN BOZZA + backup in tools/out/)
//   node tools/costruisci-fase3.js --rollback    (ripristina revisioni o sposta nel cestino i template creati)
//   (La pubblicazione richiede esplicitamente --pubblica, MAI attivata di default.)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { connetti } = require('./mcp-client');

function collegaMenuWp(ids) {
  const tmp = path.join(outDir, '_nm-navmenu.json');
  const code = `
$ids = ${JSON.stringify(ids)};
$fatti = [];
$fissa = function (&$els) use (&$fissa, &$fatti) {
  foreach ($els as &$e) {
    if (($e['widgetType'] ?? '') === 'nav-menu' && !empty($e['settings']['menu_name'])) {
      $e['settings']['menu'] = $e['settings']['menu_name'];
      $fatti[] = $e['settings']['menu_name'];
    }
    if (!empty($e['elements']) && is_array($e['elements'])) { $fissa($e['elements']); }
  }
};
foreach ($ids as $id) {
  $targets = [(int)$id];
  foreach (wp_get_post_revisions($id) as $rev) { $targets[] = (int)$rev->ID; }
  foreach ($targets as $tid) {
    $raw = get_post_meta($tid, '_elementor_data', true);
    if (!$raw) continue;
    $arr = json_decode($raw, true);
    if (!is_array($arr)) continue;
    $fissa($arr);
    update_metadata('post', $tid, '_elementor_data', wp_slash(wp_json_encode($arr)));
    delete_metadata('post', $tid, '_elementor_element_cache');
  }
}
if (class_exists('\\Elementor\\Plugin')) { \\Elementor\\Plugin::$instance->files_manager->clear_cache(); }
wp_cache_flush();
return $fatti;
`;
  fs.writeFileSync(tmp, JSON.stringify({
    code,
    novamira_review: { attention: 3, summary: 'Collega i widget nav-menu di Header e Footer bozza ai rispettivi slug menu WordPress.', request_id: 'f3nav' },
  }));
  try {
    const out = execFileSync('novamira.cmd', ['--site', 'dev1.minimalstudiodev.it', 'run', 'novamira/execute-php', '--input', '@' + tmp, '--yes', '--json'], { encoding: 'utf8', shell: true });
    return JSON.parse(out);
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

const outDir = path.join(__dirname, 'out');
const statoFile = path.join(outDir, 'fase3-template.json');
const backupFile = path.join(outDir, 'fase3-backup.json');
const mappaImg = JSON.parse(fs.readFileSync(path.join(__dirname, 'css', 'immagini.json'), 'utf8'));

const args = process.argv.slice(2);
const modo = args.includes('--esegui') ? 'esegui' : args.includes('--rollback') ? 'rollback' : 'piano';
const pubblica = args.includes('--pubblica');

const sc = (shortcode) => ({ name: 'shortcode', settings: { shortcode } });
const W = (tipo, cfg, cls, figli, nome) => ({ tipo, cfg: cfg || {}, cls: [...new Set(cls || [])], figli: figli || [], nome });

function serializzaAlbero(radici) {
  let n = 0;
  const element_config = {};
  const classes = {};
  const classiUsate = new Set();
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  function visit(w) {
    n++;
    const base = String(w.nome || w.cls[0] || w.tipo).replace(/[^\w\- ]/g, '').trim().slice(0, 36) || 'el';
    const id = `${base} ${n}`;
    if (Object.keys(w.cfg).length) element_config[id] = w.cfg;
    if (w.cls.length) {
      classes[id] = w.cls;
      w.cls.forEach((c) => classiUsate.add(c));
    }
    const inner = w.figli.map(visit).join('');
    return `<${w.tipo} configuration-id="${esc(id)}">${inner}</${w.tipo}>`;
  }
  const xml_structure = radici.map(visit).join('');
  return { composizione: { xml_structure, element_config, classes }, classi: [...classiUsate], elementi: n };
}

function costruisciHeader() {
  const logoId = mappaImg['/logos/logo-color.png'].id;
  return serializzaAlbero([
    W('e-div-block', { tag: 'header' }, ['site-header'], [
      W('e-div-block', { tag: 'div' }, ['container'], [
        W('e-div-block', { tag: 'a', link: { destination: '/', tag: 'a' } }, ['brand'], [
          W('e-image', { image: { src: { id: logoId }, size: 'full' } }, [], [], 'logo'),
        ], 'brand'),
        // Menu mobile (stesso aspetto di <details class="m-menu"> + menu WordPress "menu-mobile")
        W('e-div-block', { tag: 'div' }, ['m-menu'], [
          W('e-button', { text: 'Menu', tag: 'button' }, ['m-menu-summary'], [], 'menu-btn'),
          W('e-div-block', { tag: 'nav' }, ['m-menu-nav'], [
            W('nav-menu', { menu_name: 'menu-mobile', layout: 'vertical', pointer: 'none', dropdown: 'none' }, [], [], 'nav-mobile'),
          ], 'm-menu-nav'),
        ], 'm-menu'),
        // Menu desktop (menu WordPress "menu-principale")
        W('e-div-block', { tag: 'nav' }, ['pizzuti-header-nav'], [
          W('nav-menu', { menu_name: 'menu-principale', layout: 'horizontal', pointer: 'none', dropdown: 'none' }, [], [], 'nav-desktop'),
        ], 'header-nav'),
        // CTA telefono (dinamica da pizzuti_dati)
        W('e-button', {
          text: sc('[pizzuti_dato campo="telefono"]'),
          link: { destination: sc('[pizzuti_dato campo="telefono_href"]'), tag: 'a' },
        }, ['btn', 'btn-primary', 'header-cta', 'pizzuti-ico-phone'], [], 'header-cta'),
      ], 'container'),
    ], 'site-header'),
  ]);
}

function costruisciFooter() {
  const logoWhiteId = mappaImg['/logos/logo-white.png'].id;
  const orariRighe = [1, 2, 3, 4].map((r) =>
    W('e-div-block', { tag: 'div' }, [], [
      W('e-paragraph', { tag: 'span', paragraph: sc(`[pizzuti_orario riga="${r}" parte="giorni"]`) }, ['pizzuti-dt', 'pizzuti-v'], [], `orari-g-${r}`),
      W('e-paragraph', { tag: 'span', paragraph: sc(`[pizzuti_orario riga="${r}" parte="ore"]`) }, ['pizzuti-dd'], [], `orari-o-${r}`),
    ], `orari-row-${r}`)
  );

  return serializzaAlbero([
    W('e-div-block', { tag: 'footer' }, ['site-footer', 'on-dark'], [
      W('e-div-block', { tag: 'div' }, ['container', 'footer-grid'], [
        // Col 1: Brand + tagline + social
        W('e-div-block', { tag: 'div' }, ['footer-brand'], [
          W('e-image', { image: { src: { id: logoWhiteId }, size: 'full' } }, [], [], 'footer-logo'),
          W('e-paragraph', { tag: 'p', paragraph: sc('[pizzuti_footer_tagline]') }, [], [], 'footer-tagline'),
          W('e-div-block', { tag: 'div' }, ['footer-social', 'pizzuti-ul'], [
            W('e-div-block', { tag: 'div' }, ['pizzuti-li'], [
              W('e-div-block', { tag: 'a', link: { destination: sc('[pizzuti_social_url nome="facebook"]'), tag: 'a' } }, ['pizzuti-ico-facebook'], [], 'social-fb'),
            ], 'li-fb'),
            W('e-div-block', { tag: 'div' }, ['pizzuti-li'], [
              W('e-div-block', { tag: 'a', link: { destination: sc('[pizzuti_social_url nome="instagram"]'), tag: 'a' } }, ['pizzuti-ico-instagram'], [], 'social-ig'),
            ], 'li-ig'),
          ], 'footer-social'),
        ], 'footer-brand'),
        // Col 2: Il Centro (menu WP)
        W('e-div-block', { tag: 'nav' }, ['footer-col'], [
          W('e-heading', { tag: 'h2', title: 'Il Centro' }, [], [], 'h2-centro'),
          W('nav-menu', { menu_name: 'footer-il-centro', layout: 'vertical', pointer: 'none', dropdown: 'none' }, [], [], 'nav-f-centro'),
        ], 'col-centro'),
        // Col 3: Servizi (menu WP)
        W('e-div-block', { tag: 'nav' }, ['footer-col'], [
          W('e-heading', { tag: 'h2', title: 'Servizi' }, [], [], 'h2-servizi'),
          W('nav-menu', { menu_name: 'footer-servizi', layout: 'vertical', pointer: 'none', dropdown: 'none' }, [], [], 'nav-f-servizi'),
        ], 'col-servizi'),
        // Col 4: Contatti (da shortcode pizzuti_dati)
        W('e-div-block', { tag: 'div' }, ['footer-col', 'footer-contact'], [
          W('e-heading', { tag: 'h2', title: 'Contatti' }, [], [], 'h2-contatti'),
          W('e-div-block', { tag: 'div' }, ['pizzuti-ul'], [
            W('e-div-block', { tag: 'div' }, ['pizzuti-li', 'pizzuti-ico-pin'], [
              W('e-paragraph', { tag: 'span', paragraph: sc('[pizzuti_dato campo="indirizzo"]') }, ['pizzuti-t'], [], 'fc-ind'),
            ], 'fc-row-ind'),
            W('e-div-block', { tag: 'div' }, ['pizzuti-li', 'pizzuti-ico-phone'], [
              W('e-div-block', { tag: 'a', link: { destination: sc('[pizzuti_dato campo="telefono_href"]'), tag: 'a' } }, [], [
                W('e-paragraph', { tag: 'span', paragraph: sc('[pizzuti_dato campo="telefono"]') }, ['pizzuti-t'], [], 'fc-tel-t'),
              ], 'fc-tel'),
            ], 'fc-row-tel'),
            W('e-div-block', { tag: 'div' }, ['pizzuti-li', 'pizzuti-ico-whatsapp'], [
              W('e-div-block', { tag: 'a', link: { destination: sc('[pizzuti_whatsapp_url]'), tag: 'a' } }, [], [
                W('e-paragraph', { tag: 'span', paragraph: 'Scrivici su WhatsApp' }, ['pizzuti-t'], [], 'fc-wa-t'),
              ], 'fc-wa'),
            ], 'fc-row-wa'),
            W('e-div-block', { tag: 'div' }, ['pizzuti-li', 'pizzuti-ico-mail'], [
              W('e-div-block', { tag: 'a', link: { destination: sc('[pizzuti_mailto]'), tag: 'a' } }, [], [
                W('e-paragraph', { tag: 'span', paragraph: sc('[pizzuti_dato campo="email"]') }, ['pizzuti-t'], [], 'fc-mail-t'),
              ], 'fc-mail'),
            ], 'fc-row-mail'),
          ], 'fc-list'),
        ], 'col-contatti'),
        // Col 5: Orari (da shortcode pizzuti_dati)
        W('e-div-block', { tag: 'div' }, ['footer-col'], [
          W('e-heading', { tag: 'h2', title: 'Orari' }, [], [], 'h2-orari'),
          W('e-div-block', { tag: 'div' }, ['footer-hours', 'pizzuti-dl'], orariRighe, 'footer-hours'),
        ], 'col-orari'),
      ], 'footer-grid'),
      // Riga inferiore: copyright + menu legali + Torna su
      W('e-div-block', { tag: 'div' }, ['container', 'footer-bottom'], [
        W('e-paragraph', { tag: 'p', paragraph: sc('[pizzuti_footer_copyright]') }, [], [], 'footer-copy'),
        W('e-div-block', { tag: 'div' }, ['pizzuti-footer-bottom-links'], [
          W('nav-menu', { menu_name: 'footer-legali', layout: 'horizontal', pointer: 'none', dropdown: 'none' }, [], [], 'nav-f-legali'),
          W('e-button', { text: 'Torna su', link: { destination: '#top', tag: 'a' } }, ['footer-top', 'pizzuti-ico-up'], [], 'footer-top'),
        ], 'footer-bottom-links'),
      ], 'footer-bottom'),
    ], 'site-footer'),
  ]);
}

function costruisciBarraMobile() {
  return serializzaAlbero([
    W('e-div-block', { tag: 'div' }, ['contact-bar'], [
      W('e-button', {
        text: 'Chiama',
        link: { destination: sc('[pizzuti_dato campo="telefono_href"]'), tag: 'a' },
      }, ['btn', 'btn-primary', 'pizzuti-ico-phone'], [], 'cb-chiama'),
      W('e-button', {
        text: 'WhatsApp',
        link: { destination: sc('[pizzuti_whatsapp_url]'), tag: 'a' },
      }, ['btn', 'btn-wa', 'pizzuti-ico-whatsapp'], [], 'cb-whatsapp'),
    ], 'contact-bar'),
  ]);
}

function costruisci404() {
  const linkUtili = [
    ['/servizi/controllo-udito/', 'Controllo dell’udito', 'Per sapere come senti oggi.'],
    ['/apparecchi-acustici/', 'Apparecchi acustici', 'Scelti su di te.'],
    ['/chi-siamo/', 'Il Centro e il Metodo', 'Chi sono e come lavoro.'],
    ['/contatti/', 'Contatti', 'Dove siamo e come raggiungerci.'],
  ].map(([href, h3, p], i) =>
    W('e-div-block', { tag: 'div' }, ['pizzuti-li'], [
      W('e-div-block', { tag: 'a', link: { destination: href, tag: 'a' } }, ['pizzuti-ico-arrow-right'], [
        W('e-heading', { tag: 'h3', title: h3 }, [], [], `nf-h3-${i + 1}`),
        W('e-paragraph', { tag: 'p', paragraph: p }, [], [], `nf-p-${i + 1}`),
      ], `nf-link-${i + 1}`),
    ], `nf-li-${i + 1}`)
  );

  return serializzaAlbero([
    W('e-div-block', { tag: 'div' }, ['page-root', 'inner'], [
      W('e-div-block', { tag: 'section' }, ['nf'], [
        W('e-div-block', { tag: 'div' }, ['container', 'nf-grid'], [
          W('e-div-block', { tag: 'div' }, ['nf-text'], [
            W('e-paragraph', { tag: 'p', paragraph: '4<span>0</span>4' }, ['nf-code'], [], 'nf-code'),
            W('e-heading', { tag: 'h1', title: 'Come? Questa pagina non l’ho sentita.' }, ['rise'], [], 'nf-h1'),
            W('e-paragraph', { tag: 'p', paragraph: 'Forse si è spostata, forse l’indirizzo era sbagliato, forse parlava troppo piano. Capita anche ai migliori. Ripetiamo insieme dall’inizio?' }, ['lead', 'rise', 'rise-2'], [], 'nf-lead'),
            W('e-div-block', { tag: 'div' }, ['btn-row', 'rise', 'rise-3'], [
              W('e-button', { text: 'Torna alla home', link: { destination: '/', tag: 'a' } }, ['btn', 'btn-primary', 'pizzuti-ico-arrow'], [], 'nf-home'),
              W('e-button', { text: sc('[pizzuti_chiama_label]'), link: { destination: sc('[pizzuti_dato campo="telefono_href"]'), tag: 'a' } }, ['btn', 'btn-secondary', 'pizzuti-ico-phone'], [], 'nf-tel'),
            ], 'nf-btns'),
          ], 'nf-text'),
          W('e-div-block', { tag: 'nav' }, ['nf-links'], [
            W('e-heading', { tag: 'h2', title: 'Magari cercavi una di queste' }, [], [], 'nf-links-h2'),
            W('e-div-block', { tag: 'div' }, ['link-rows', 'pizzuti-ul'], linkUtili, 'nf-link-rows'),
          ], 'nf-links'),
        ], 'nf-grid'),
      ], 'nf'),
    ], 'page-root'),
  ]);
}

const TEMPLATE = [
  { chiave: 'header', titolo: 'Header Pizzuti', tipo: 'header', condizioni: ['include/general'], build: costruisciHeader },
  { chiave: 'footer', titolo: 'Footer Pizzuti', tipo: 'footer', condizioni: ['include/general'], build: costruisciFooter },
  { chiave: 'barra_mobile', titolo: 'Barra mobile Chiama/WhatsApp', tipo: 'floating-buttons', condizioni: ['include/general'], build: costruisciBarraMobile },
  { chiave: 'errore_404', titolo: 'Errore 404 Pizzuti', tipo: 'error-404', condizioni: ['include/singular/not_found404'], build: costruisci404 },
];

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
  const compilati = TEMPLATE.map((t) => ({ ...t, out: t.build() }));
  const tutteClassi = new Set(compilati.flatMap((t) => t.out.classi));

  if (modo === 'piano') {
    console.log('=== PIANO FASE 3 — THEME BUILDER (offline, nessuna scrittura) ===');
    console.log(`Classi totali usate (${tutteClassi.size}):`, [...tutteClassi].join(', '));
    for (const t of compilati) {
      console.log(` - ${t.titolo} [${t.tipo}] condizioni=${JSON.stringify(t.condizioni)} -> ${t.out.elementi} elementi`);
    }
    return;
  }

  const el = await connetti('elementor');

  if (modo === 'rollback') {
    if (!fs.existsSync(statoFile)) throw new Error('Stato non trovato: ' + statoFile);
    const st = JSON.parse(fs.readFileSync(statoFile, 'utf8'));
    const ops = Object.values(st.template || {}).filter((x) => x.id).map((x) => ({ action: 'delete', post_id: x.id }));
    if (ops.length) {
      const r = await el.callJson('elementor-manage-site-parts', { operations: ops });
      await el.callJson('elementor-clear-cache', {});
      console.log('Rollback Fase 3 completato:', JSON.stringify(r));
    }
    return;
  }

  // --esegui
  await assicuraClassi(el, tutteClassi);
  const esistenti = await el.callJson('elementor-list-site-parts', {});
  const lista = esistenti.result || [];
  const stato = fs.existsSync(statoFile) ? JSON.parse(fs.readFileSync(statoFile, 'utf8')) : { template: {} };
  const backup = { timestamp: new Date().toISOString(), before: {} };

  for (const t of compilati) {
    let id = stato.template[t.chiave] && stato.template[t.chiave].id;
    const trovato = lista.find((x) => x.title === t.titolo && x.type === t.tipo) || (id ? lista.find((x) => (x.id || x.post_id) === id) : null);
    if (trovato) {
      id = trovato.id || trovato.post_id;
      console.log(`Riuso site part #${id}: ${t.titolo} [${t.tipo}]`);
    } else {
      const cr = await el.callJson('elementor-manage-site-parts', {
        operations: [{ action: 'create', type: t.tipo, title: t.titolo, conditions: t.condizioni }],
      });
      const r0 = (cr.results && cr.results[0]) || cr;
      id = r0.post_id || r0.id;
      if (!id) throw new Error(`Creazione site part fallita (${t.titolo}): ${JSON.stringify(cr).slice(0, 400)}`);
      console.log(`Creato site part IN BOZZA #${id}: ${t.titolo} [${t.tipo}]`);
    }

    backup.before[t.chiave] = await el.callJson('elementor-get-page-structure', { post_id: id }).catch(() => null);

    // Imposta condizioni (idempotente)
    await el.callJson('elementor-manage-site-parts', {
      operations: [{ action: 'update', post_id: id, conditions: t.condizioni }],
    });

    // Scrive la composizione (resta IN BOZZA salvo --pubblica esplicito)
    const comp = await el.callJson('elementor-build-composition', {
      post_id: id,
      mode: 'replace_children',
      parent_id: 'document',
      ...t.out.composizione,
    });
    if (pubblica) {
      await el.callJson('elementor-publish-document', { post_id: id });
    }
    const prev = await el.callJson('elementor-create-preview-link', { post_id: id }).catch(() => ({}));
    stato.template[t.chiave] = {
      id,
      titolo: t.titolo,
      tipo: t.tipo,
      stato: pubblica ? 'publish' : 'draft',
      condizioni: t.condizioni,
      elementi: t.out.elementi,
      undo_revision_id: comp.undo_revision_id || null,
      preview_url: prev.url || null,
    };
    console.log(`  -> #${id} scritto (${t.out.elementi} elementi, stato: ${pubblica ? 'publish' : 'draft'}, undo: ${comp.undo_revision_id || 'n/a'})`);
  }

  // Collega i 5 widget nav-menu in Header e Footer ai rispettivi menu WordPress tramite settings.menu
  const navIds = [stato.template.header.id, stato.template.footer.id].filter(Boolean);
  const navRes = collegaMenuWp(navIds);
  console.log('Menu WordPress collegati ai widget nav-menu:', JSON.stringify(navRes.data && navRes.data.return_value));

  await el.callJson('elementor-clear-cache', {});
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  fs.writeFileSync(statoFile, JSON.stringify(stato, null, 2));
  console.log('\n=== FASE 3: 4 TEMPLATE CREATI IN BOZZA (stato in tools/out/fase3-template.json) ===');
})().catch((e) => { console.error(e); process.exit(1); });
