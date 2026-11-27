'use strict';
// Verifica Fase 2 (sola lettura): controlla scheda Stato, rendering di tutte e 7 le schede admin,
// tutti gli shortcode di pizzuti-core e l'HTML del frontend di staging.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const outDir = path.join(__dirname, 'out');
fs.mkdirSync(outDir, { recursive: true });
const tmp = path.join(outDir, '_verify-f2.json');

const php = `
require_once ABSPATH . 'wp-admin/includes/template.php';
require_once WP_PLUGIN_DIR . '/pizzuti-core/admin/pizzuti-admin.php';
wp_set_current_user(1);
$controlli = pizzuti_admin_controlli();
$tabs = [];
ob_start(); pizzuti_admin_scheda_stato(); $tabs['stato'] = strlen(ob_get_clean());
ob_start(); pizzuti_admin_scheda_dati(); $tabs['dati'] = strlen(ob_get_clean());
ob_start(); pizzuti_admin_scheda_seo(); $tabs['seo'] = strlen(ob_get_clean());
ob_start(); pizzuti_admin_scheda_moduli(); $tabs['moduli'] = strlen(ob_get_clean());
ob_start(); pizzuti_admin_scheda_stile(); $tabs['stile'] = strlen(ob_get_clean());
ob_start(); pizzuti_admin_scheda_manutenzione(); $tabs['manutenzione'] = strlen(ob_get_clean());
ob_start(); pizzuti_admin_scheda_guida(); $tabs['guida'] = strlen(ob_get_clean());
$sc = [
  'dato_tel' => do_shortcode('[pizzuti_dato campo="telefono"]'),
  'tel' => do_shortcode('[pizzuti_tel]'),
  'wa' => do_shortcode('[pizzuti_whatsapp]'),
  'orari_inline' => do_shortcode('[pizzuti_orari formato="inline"]'),
  'indirizzo' => do_shortcode('[pizzuti_indirizzo link="1"]'),
  'social_len' => strlen(do_shortcode('[pizzuti_social]')),
  'recensioni_len' => strlen(do_shortcode('[pizzuti_recensioni]')),
  'mappa_len' => strlen(do_shortcode('[pizzuti_mappa]')),
  'anno' => do_shortcode('[pizzuti_anno]'),
];
return ['controlli' => $controlli, 'tabs_bytes' => $tabs, 'shortcodes' => $sc];
`;

(async () => {
  fs.writeFileSync(tmp, JSON.stringify({
    code: php,
    novamira_review: { attention: 1, summary: 'Verifica sola lettura dei controlli Stato, delle 7 schede admin e degli shortcode di pizzuti-core.', request_id: 'f2ver' },
  }));
  let j;
  try {
    const out = execFileSync('novamira.cmd', ['--site', 'dev1.minimalstudiodev.it', 'run', 'novamira/execute-php', '--input', '@' + tmp, '--yes', '--json'], { encoding: 'utf8', shell: true });
    j = JSON.parse(out);
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }

  console.log('=== VERIFICA PLUGIN PIZZUTI-CORE 1.0.0 ===');
  console.log('PHP errors:', JSON.stringify(j.data.errors));
  if (!j.data.success || !j.data.return_value) {
    console.error('PHP fallito:', JSON.stringify(j.data, null, 2));
    process.exit(1);
  }
  console.log('\nControlli scheda Stato:');
  let koNonEsempio = 0;
  for (const r of j.data.return_value.controlli) {
    const txt = r[2].replace(/<[^>]+>/g, '');
    console.log(`  [${r[1].toUpperCase()}] ${r[0]}: ${txt}`);
    if (r[1] === 'ko' && !/esempio/i.test(r[0])) koNonEsempio++;
  }
  console.log('\n7 schede admin (byte HTML resi):', JSON.stringify(j.data.return_value.tabs_bytes));
  console.log('Shortcode verificati:', JSON.stringify(j.data.return_value.shortcodes));

  const html = await (await fetch('https://dev1.minimalstudiodev.it/')).text();
  const checks = {
    noindex: /noindex/i.test(html),
    body_pizzuti: /<body[^>]*\bpizzuti\b/.test(html),
    preload_woff2: /montserrat-latin-wght-normal\.woff2/.test(html),
    pizzuti_css: /pizzuti-core\/pizzuti\.css/.test(html),
    pizzuti_js: /pizzuti-core\/pizzuti\.js/.test(html),
    favicon: /pizzuti-core\/icone\/favicon\.ico/.test(html),
    hello_css_removed: !/hello-elementor\/assets\/css/.test(html),
    zero_google_fonts: !/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html),
    localbusiness_suppressed_while_example: !/LocalBusiness/.test(html),
  };
  console.log('\nFrontend checks:', JSON.stringify(checks));
  if (koNonEsempio > 0 || (j.data.errors && j.data.errors.length > 0) || Object.values(checks).some((v) => !v)) {
    process.exit(1);
  }
})().catch((e) => { console.error(e); process.exit(1); });
