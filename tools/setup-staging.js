'use strict';
// Impostazioni iniziali di staging (confermate dall'utente) + pulizia prova Fase 1:
//   - blog_public = 0 (noindex), permalink_structure = '/%postname%/', timezone_string = 'Europe/Rome'
//   - blogdescription = 'Ascolto su misura · Cosenza', elementor_google_font = '0'
//   - cestina bozza prova Fase 1 (ID 40) e post predefinito Hello world! (ID 1)
//   - elimina media temporaneo mcp-upload.jpg (ID 13)
//   - flush rewrite rules e cache Elementor
// Uso:
//   node tools/setup-staging.js --piano
//   node tools/setup-staging.js --esegui
//   node tools/setup-staging.js --rollback
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { risolviServer, connetti } = require('./mcp-client');

const outDir = path.join(__dirname, 'out');
const backupFile = path.join(outDir, 'setup-staging-backup.json');
const args = process.argv.slice(2);
const modo = args.includes('--esegui') ? 'esegui' : args.includes('--rollback') ? 'rollback' : 'piano';

const TARGET_OPZIONI = {
  blog_public: '0',
  permalink_structure: '/%postname%/',
  timezone_string: 'Europe/Rome',
  blogdescription: 'Ascolto su misura · Cosenza',
  elementor_google_font: '0',
};

function novamiraRun(ability, inputObj) {
  const tmp = path.join(outDir, '_nm-input.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(inputObj));
  try {
    const bin = process.platform === 'win32' ? 'novamira.cmd' : 'novamira';
    const out = execFileSync(bin, ['--site', 'dev1.minimalstudiodev.it', 'run', ability, '--input', '@' + tmp, '--yes', '--json'], { encoding: 'utf8', shell: process.platform === 'win32' });
    return JSON.parse(out);
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  if (modo === 'piano') {
    console.log('=== PIANO SETUP STAGING (offline) ===');
    console.log('Opzioni da impostare:', JSON.stringify(TARGET_OPZIONI, null, 2));
    console.log('Pulizia: cestina pagina bozza ID 40, cestina post ID 1 (Hello world!), rimuovi media temporaneo ID 13 (mcp-upload.jpg)');
    return;
  }

  const { auth, origin } = risolviServer('elementor');
  const wpFetch = async (ep, opts = {}) => {
    const r = await fetch(origin + ep, { ...opts, headers: { Authorization: auth, ...(opts.headers || {}) } });
    const txt = await r.text();
    return { ok: r.ok, status: r.status, body: txt };
  };

  if (modo === 'rollback') {
    if (!fs.existsSync(backupFile)) throw new Error('Backup non trovato: ' + backupFile);
    const bk = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const code = `
$prev = ${JSON.stringify(bk.opzioniPrima)};
foreach ($prev as $k => $v) {
  if ($v === null) { delete_option($k); } else { update_option($k, $v); }
}
flush_rewrite_rules(true);
return $prev;
`;
    const r = novamiraRun('novamira/execute-php', {
      code,
      novamira_review: { attention: 4, summary: 'Ripristina le opzioni WordPress di staging dal backup pre-Fase 2.', request_id: 'f2setup-rb' },
    });
    console.log('Rollback opzioni:', JSON.stringify(r.data || r));
    return;
  }

  // --esegui
  // 1. Legge e aggiorna le opzioni via PHP (una sola chiamata atomica con backup)
  const phpCode = `
$keys = ['blog_public', 'permalink_structure', 'timezone_string', 'blogdescription', 'elementor_google_font'];
$before = [];
foreach ($keys as $k) {
  $val = get_option($k, '__MISSING__');
  $before[$k] = ($val === '__MISSING__') ? null : $val;
}
update_option('blog_public', '0');
update_option('permalink_structure', '/%postname%/');
update_option('timezone_string', 'Europe/Rome');
update_option('blogdescription', 'Ascolto su misura · Cosenza');
update_option('elementor_google_font', '0');
flush_rewrite_rules(true);
if (class_exists('\\Elementor\\Plugin')) {
  \\Elementor\\Plugin::$instance->files_manager->clear_cache();
}
wp_cache_flush();
$after = [];
foreach ($keys as $k) { $after[$k] = get_option($k); }
return ['before' => $before, 'after' => $after, 'theme' => wp_get_theme()->get_stylesheet()];
`;
  const res = novamiraRun('novamira/execute-php', {
    code: phpCode,
    novamira_review: {
      attention: 4,
      summary: 'Imposta noindex, permalink /%postname%/, fuso Europe/Rome, motto e disattiva Google Fonts Elementor sullo staging.',
      request_id: 'f2setup',
    },
  });
  if (!res.ok || !res.data || !res.data.success) {
    console.error('Risposta Novamira:', JSON.stringify(res, null, 2));
    process.exit(1);
  }
  const rv = res.data.return_value;
  console.log('Opzioni aggiornate:', JSON.stringify(rv.after));

  // 2. Pulizia via WP REST (idempotente)
  const p40 = await wpFetch('/wp-json/wp/v2/pages/40', { method: 'DELETE' });
  console.log('Pagina prova #40 -> cestino:', p40.status);
  const p1 = await wpFetch('/wp-json/wp/v2/posts/1', { method: 'DELETE' });
  console.log('Post Hello world! #1 -> cestino:', p1.status);
  const m13 = await wpFetch('/wp-json/wp/v2/media/13?force=true', { method: 'DELETE' });
  console.log('Media temporaneo #13 (mcp-upload.jpg) -> eliminato:', m13.status);

  const el = await connetti('elementor');
  await el.callJson('elementor-clear-cache', {});

  fs.writeFileSync(backupFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    opzioniPrima: rv.before,
    opzioniDopo: rv.after,
    tema: rv.theme,
    pulizia: { page40: p40.status, post1: p1.status, media13: m13.status },
  }, null, 2));
  console.log('Setup staging completato. Backup in tools/out/setup-staging-backup.json');
})().catch((e) => { console.error(e); process.exit(1); });
