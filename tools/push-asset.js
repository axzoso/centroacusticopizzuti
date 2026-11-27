'use strict';
// Carica subito pizzuti.css / pizzuti.js sul server senza reinstallare tutto lo ZIP (giro veloce).
//   node tools/push-asset.js [pizzuti.css] [pizzuti.js]
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const dir = path.resolve(__dirname, '..', 'wp', 'pizzuti-core');
const outDir = path.join(__dirname, 'out');
const files = process.argv.slice(2).length ? process.argv.slice(2) : ['pizzuti.css', 'pizzuti.js'];

function nmRun(ability, payload) {
  fs.mkdirSync(outDir, { recursive: true });
  const tmp = path.join(outDir, '_nm-push.json');
  fs.writeFileSync(tmp, JSON.stringify(payload));
  try {
    const bin = process.platform === 'win32' ? 'novamira.cmd' : 'novamira';
    return JSON.parse(execFileSync(bin, ['--site', 'dev1.minimalstudiodev.it', 'run', ability, '--input', '@' + tmp, '--yes', '--json'], { encoding: 'utf8', shell: process.platform === 'win32' }));
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

(async () => {
  const reqId = 'push-' + Date.now().toString(36).slice(-5);
  for (const f of files) {
    const locale = path.join(dir, f);
    if (!fs.existsSync(locale)) { console.log('salto (non esiste):', f); continue; }
    const buf = fs.readFileSync(locale);
    const md5 = crypto.createHash('md5').update(buf).digest('hex');
    const up = nmRun('novamira/create-upload-link', {
      path: `wp-content/plugins/pizzuti-core/${f}`,
      overwrite: true,
      expires_in: 120,
      novamira_review: { attention: 3, summary: `Aggiorna ${f} nella cartella del plugin pizzuti-core.`, request_id: reqId },
    });
    const link = up.data;
    const tipo = f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'application/javascript' : 'application/octet-stream';
    const r = await fetch(link.upload_url, { method: 'PUT', headers: { [link.token_header]: link.upload_token, 'Content-Type': tipo }, body: buf });
    console.log(`${f}: HTTP ${r.status} (${buf.length} byte, md5 ${md5.slice(0, 10)})`);
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
