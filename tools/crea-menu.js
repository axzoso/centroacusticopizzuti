'use strict';
// Crea (in modo idempotente) i menu di WordPress dalla configurazione della proposta A (mockup/src/config.ts):
//   - Menu principale (header desktop: NAV)
//   - Menu mobile (header mobile: Home + NAV)
//   - Footer Il Centro (FOOTER[0])
//   - Footer Servizi (FOOTER[1])
//   - Footer Legali (LEGALI)
// Uso:
//   node tools/crea-menu.js --piano
//   node tools/crea-menu.js --esegui
//   node tools/crea-menu.js --rollback
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const outDir = path.join(__dirname, 'out');
const backupFile = path.join(outDir, 'menu-backup.json');
const args = process.argv.slice(2);
const modo = args.includes('--esegui') ? 'esegui' : args.includes('--rollback') ? 'rollback' : 'piano';

const MENU = [
  {
    nome: 'Menu principale',
    slug: 'menu-principale',
    voci: [
      { label: 'Il Centro', href: '/chi-siamo/' },
      { label: 'Apparecchi acustici', href: '/apparecchi-acustici/' },
      { label: 'Servizi', href: '/servizi/' },
      { label: 'Contatti', href: '/contatti/' },
    ],
  },
  {
    nome: 'Menu mobile',
    slug: 'menu-mobile',
    voci: [
      { label: 'Home', href: '/' },
      { label: 'Il Centro', href: '/chi-siamo/' },
      { label: 'Apparecchi acustici', href: '/apparecchi-acustici/' },
      { label: 'Servizi', href: '/servizi/' },
      { label: 'Contatti', href: '/contatti/' },
    ],
  },
  {
    nome: 'Footer Il Centro',
    slug: 'footer-il-centro',
    voci: [
      { label: 'Home', href: '/' },
      { label: 'Il Centro e il Metodo', href: '/chi-siamo/' },
      { label: 'Apparecchi acustici', href: '/apparecchi-acustici/' },
      { label: 'Prezzi', href: '/apparecchi-acustici/prezzi/' },
      { label: 'Contatti', href: '/contatti/' },
    ],
  },
  {
    nome: 'Footer Servizi',
    slug: 'footer-servizi',
    voci: [
      { label: 'Tutti i servizi', href: '/servizi/' },
      { label: 'Controllo dell’udito', href: '/servizi/controllo-udito/' },
      { label: 'Riparazione e assistenza', href: '/servizi/riparazione-assistenza-apparecchi-acustici/' },
      { label: 'Auricolari su misura', href: '/servizi/#auricolari' },
    ],
  },
  {
    nome: 'Footer Legali',
    slug: 'footer-legali',
    voci: [
      { label: 'Privacy Policy', href: '/privacy-policy/' },
      { label: 'Cookie Policy', href: '/cookie-policy/' },
      { label: 'Note legali', href: '/note-legali/' },
    ],
  },
];

function nmPhp(code, summary, reqId) {
  fs.mkdirSync(outDir, { recursive: true });
  const tmp = path.join(outDir, '_nm-menu.json');
  fs.writeFileSync(tmp, JSON.stringify({ code, novamira_review: { attention: 3, summary, request_id: reqId } }));
  try {
    const out = execFileSync('novamira.cmd', ['--site', 'dev1.minimalstudiodev.it', 'run', 'novamira/execute-php', '--input', '@' + tmp, '--yes', '--json'], { encoding: 'utf8', shell: true });
    return JSON.parse(out);
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

if (modo === 'piano') {
  console.log('=== PIANO CREAZIONE MENU WORDPRESS (offline) ===');
  for (const m of MENU) {
    console.log(` - ${m.nome} (${m.slug}): ${m.voci.map((v) => `${v.label} -> ${v.href}`).join(' | ')}`);
  }
  process.exit(0);
}

if (modo === 'rollback') {
  if (!fs.existsSync(backupFile)) { console.error('Backup non trovato'); process.exit(1); }
  const bk = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  const code = `$ids = ${JSON.stringify(bk.creati || [])}; foreach ($ids as $id) { wp_delete_nav_menu((int)$id); } return $ids;`;
  const r = nmPhp(code, 'Rimuove i menu WordPress creati in Fase 3.', 'f3menu-rb');
  console.log('Rollback menu:', JSON.stringify(r.data && r.data.return_value));
  process.exit(0);
}

const code = `
$specs = json_decode(${JSON.stringify(JSON.stringify(MENU))}, true);
$out = [];
$creati = [];
foreach ($specs as $m) {
  $obj = wp_get_nav_menu_object($m['slug']);
  if (!$obj) { $obj = wp_get_nav_menu_object($m['nome']); }
  if ($obj) {
    $mid = (int) $obj->term_id;
    $vecchi = wp_get_nav_menu_items($mid);
    if (is_array($vecchi)) {
      foreach ($vecchi as $vi) { wp_delete_post((int) $vi->ID, true); }
    }
  } else {
    $mid = wp_create_nav_menu($m['nome']);
    if (is_wp_error($mid)) { return ['error' => $mid->get_error_message()]; }
    $creati[] = (int) $mid;
  }
  $pos = 1;
  foreach ($m['voci'] as $v) {
    wp_update_nav_menu_item($mid, 0, [
      'menu-item-title' => $v['label'],
      'menu-item-url' => $v['href'],
      'menu-item-type' => 'custom',
      'menu-item-status' => 'publish',
      'menu-item-position' => $pos++,
    ]);
  }
  $obj2 = wp_get_nav_menu_object($mid);
  $out[$m['slug']] = ['id' => (int) $mid, 'name' => $obj2 ? $obj2->name : $m['nome'], 'slug' => $obj2 ? $obj2->slug : $m['slug'], 'count' => count($m['voci'])];
}
return ['menus' => $out, 'creati' => $creati];
`;
const r = nmPhp(code, 'Crea i 5 menu WordPress per header e footer (Menu principale, Menu mobile, Footer Il Centro, Footer Servizi, Footer Legali).', 'f3menu');
if (!r.ok || !r.data || !r.data.success) {
  console.error('Errore:', JSON.stringify(r, null, 2));
  process.exit(1);
}
fs.writeFileSync(backupFile, JSON.stringify({ timestamp: new Date().toISOString(), ...r.data.return_value }, null, 2));
console.log('Menu WordPress pronti:', JSON.stringify(r.data.return_value.menus, null, 2));
