'use strict';
// Collaudo end-to-end dei moduli e-form (Home e Contatti in bozza) SENZA spedire email:
// - Accende pizzuti_prova_invio (intercetta wp_mail e salva in pizzuti_prova_invio_log)
// - Verifica precompilazione ?motivo=auricolari e ?motivo=ssn
// - Invia il modulo da Chrome headless in 3 scenari:
//   1. Invio normale -> esito successo, 1 email intercettata
//   2. Honeypot compilato (bot) -> rifiutato, 0 email
//   3. Messaggio con 4 link (anti-spam pizzuti-core) -> rifiutato, 0 email
// - Spegne SEMPRE pizzuti_prova_invio nel finally.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { openBrowser, sleep } = require('./cdp-session');
const { connetti } = require('./mcp-client');

const outDir = path.join(__dirname, 'out');
const statoFile = path.join(outDir, 'fase4-pagine.json');

function nvPhp(code, summary, reqId) {
  const tmp = path.join(outDir, `_nm-${reqId}.json`);
  fs.writeFileSync(tmp, JSON.stringify({ code, novamira_review: { attention: 2, summary, request_id: reqId } }));
  try {
    const out = execFileSync('novamira.cmd', ['--site', 'dev1.minimalstudiodev.it', 'run', 'novamira/execute-php', '--input', '@' + tmp, '--yes', '--json'], { encoding: 'utf8', shell: true });
    const j = JSON.parse(out);
    if (!j.ok || !j.data || !j.data.success) throw new Error(`Novamira PHP fallito: ${out.slice(0, 400)}`);
    return j.data.return_value;
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

async function provaInvio(url, { motivoQuery = null, honeypot = false, messaggio }) {
  const b = await openBrowser({ width: 1440, height: 1000, mobile: false });
  try {
    const u = new URL(url);
    if (motivoQuery) u.searchParams.set('motivo', motivoQuery);
    await b.navigate(u.toString(), { settle: 900 });

    const motivoSelezionato = await b.evalJs(`(() => {
      const s = document.querySelector('select[name*="motivo"], .pizzuti-form-motivo select, select.pizzuti-form-motivo');
      return s ? s.options[s.selectedIndex].textContent.trim() : null;
    })()`);

    await b.evalJs(`(() => {
      const set = (el, v) => { if (!el) throw new Error('campo mancante'); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
      const form = document.querySelector('form.form');
      if (!form) throw new Error('form.form non trovato');
      set(form.querySelector('input[type="text"]'), 'Mario Rossi Collaudo');
      set(form.querySelector('input[type="tel"]'), '0984 999 888');
      set(form.querySelector('textarea'), ${JSON.stringify(messaggio)});
      const cb = form.querySelector('input[type="checkbox"]');
      if (cb && !cb.checked) cb.click();
      ${honeypot ? "const hp = form.querySelector('.e-form-honeypot input, input[tabindex=\"-1\"]'); if (!hp) throw new Error('honeypot non trovato'); set(hp, 'http://bot.example');" : ''}
      return 1;
    })()`);

    await b.evalJs("document.querySelector('form.form button[type=\"submit\"], form.form [type=\"submit\"]').click(); 1");

    let stato = 'nessuna risposta';
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      stato = await b.evalJs(`(() => {
        const f = document.querySelector('form.form');
        if (!f) return '';
        if (f.classList.contains('form-state-success')) return 'successo';
        if (f.classList.contains('form-state-error')) return 'errore';
        return '';
      })()`) || stato;
      if (stato === 'successo' || stato === 'errore') break;
    }
    return { stato, motivoSelezionato };
  } finally {
    await b.close();
  }
}

(async () => {
  const st = JSON.parse(fs.readFileSync(statoFile, 'utf8')).pagine;
  const el = await connetti('elementor');
  const target = [
    { chiave: 'contatti', id: st.contatti.id, motivoQuery: 'auricolari', attesoMotivo: 'auricolari' },
    { chiave: 'home', id: st.home.id, motivoQuery: 'ssn', attesoMotivo: 'SSN' },
  ];

  nvPhp("update_option('pizzuti_prova_invio', 1, false); update_option('pizzuti_prova_invio_log', [], false); return 1;", 'Accende modalità prova invii per collaudo moduli Fase 4.', 'mod-on');
  let ko = 0;
  try {
    for (const t of target) {
      const prev = await el.callJson('elementor-create-preview-link', { post_id: t.id });
      const casi = [
        { nome: `invio normale (?motivo=${t.motivoQuery})`, opz: { motivoQuery: t.motivoQuery, messaggio: 'Richiesta di collaudo in modalità prova (nessuna email reale).' }, atteso: 'successo', emailAttese: 1 },
        { nome: 'honeypot compilato (bot)', opz: { honeypot: true, messaggio: 'Messaggio di prova bot.' }, atteso: 'errore', emailAttese: 0 },
        { nome: 'anti-spam 4 link', opz: { messaggio: 'http://a.example http://b.example http://c.example www.d.example' }, atteso: 'errore', emailAttese: 0 },
      ];
      for (const c of casi) {
        const prima = nvPhp("return count((array) get_option('pizzuti_prova_invio_log', []));", 'Legge log invii prima del test.', 'mod-log1');
        const r = await provaInvio(prev.url, c.opz);
        await sleep(1200);
        const log = nvPhp("return array_values((array) get_option('pizzuti_prova_invio_log', []));", 'Legge log invii dopo il test.', 'mod-log2');
        const nuove = log.slice(prima);
        const motivoOk = !c.opz.motivoQuery || (r.motivoSelezionato && r.motivoSelezionato.toLowerCase().includes(t.attesoMotivo.toLowerCase()));
        const ok = r.stato === c.atteso && nuove.length === c.emailAttese && motivoOk;
        if (!ok) ko++;
        console.log(`${ok ? 'OK  ' : 'FAIL'} ${t.chiave} (#${t.id}) — ${c.nome}: esito="${r.stato}" (atteso ${c.atteso}); email=${nuove.length} (attese ${c.emailAttese})${c.opz.motivoQuery ? `; motivo="${r.motivoSelezionato}"` : ''}`);
        for (const n of nuove) {
          console.log(`       to=${JSON.stringify(n.to)} | subject=${n.subject} | msg=${String(n.message || '').replace(/\s+/g, ' ').slice(0, 180)}`);
        }
      }
    }
  } finally {
    nvPhp("update_option('pizzuti_prova_invio', 0, false); update_option('pizzuti_prova_invio_log', [], false); return 1;", 'Spegne modalità prova invii e pulisce log dopo collaudo Fase 4.', 'mod-off');
    console.log('\nModalità prova invii spenta e log pulito.');
  }
  process.exit(ko ? 1 : 0);
})().catch((e) => {
  console.error(e);
  try { nvPhp("update_option('pizzuti_prova_invio', 0, false); return 1;", 'Spegne modalità prova invii dopo errore.', 'mod-err-off'); } catch {}
  process.exit(2);
});
