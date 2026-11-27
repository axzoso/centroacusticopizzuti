'use strict';
// Sessione Chrome headless riutilizzabile (CDP, Node 22+, nessuna dipendenza).
// Adattato da artes/tools/rev2/cdp-session.js.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(fs.existsSync);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJson = (u) => new Promise((res, rej) => http.get(u, (r) => { let d = ''; r.on('data', (c) => { d += c; }); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej));

async function openBrowser(opts = {}) {
  if (!CHROME) throw new Error('Chrome non trovato');
  const { width = 1440, height = 900, mobile = false, noMotion = true } = opts;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pizzuti-cdp-'));
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=0', `--user-data-dir=${profile}`, `--window-size=${width},${height}`, 'about:blank'], { stdio: 'ignore' });
  let targets;
  let port = 0;
  for (let i = 0; i < 80 && !port; i++) {
    try { port = parseInt(fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0], 10) || 0; } catch {}
    if (!port) await sleep(250);
  }
  for (let i = 0; i < 80 && port; i++) {
    try { targets = await getJson(`http://127.0.0.1:${port}/json`); break; } catch { await sleep(250); }
  }
  if (!targets) { proc.kill(); throw new Error('Chrome non risponde'); }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const pending = new Map(); const waiters = []; const listeners = [];
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    else if (d.method) {
      for (const w of waiters.slice()) if (w.method === d.method) { waiters.splice(waiters.indexOf(w), 1); w.resolve(d.params); }
      for (const l of listeners) if (l.method === d.method) l.fn(d.params);
    }
  });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const waitEvent = (method, timeout = 30000) => new Promise((resolve) => { const w = { method, resolve }; waiters.push(w); setTimeout(() => { const k = waiters.indexOf(w); if (k >= 0) { waiters.splice(k, 1); resolve(null); } }, timeout); });
  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result && r.result.exceptionDetails) throw new Error('eval: ' + (r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description || r.result.exceptionDetails.text));
    return r.result.result.value;
  };

  await send('Page.enable'); await send('DOM.enable');
  const setViewport = (w, h) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  await setViewport(width, height);
  if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  if (noMotion) {
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: "(function(){function f(){if(document.getElementById('pizzuti-nomotion'))return;var t=document.head||document.documentElement;if(!t)return;var s=document.createElement('style');s.id='pizzuti-nomotion';s.textContent='*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}';t.appendChild(s);}if(document.head||document.documentElement)f();else document.addEventListener('DOMContentLoaded',f,{once:true});})();",
    });
  }

  const api = {
    send, evalJs, setViewport,
    on(method, fn) { listeners.push({ method, fn }); },
    async navigate(url, { settle = 1200 } = {}) {
      const loaded = waitEvent('Page.loadEventFired', 45000);
      await send('Page.navigate', { url });
      await loaded;
      try { await evalJs('document.fonts ? document.fonts.ready.then(() => 1) : 1'); } catch {}
      await sleep(settle);
    },
    async docHeight() { return evalJs('Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)'); },
    async screenshotViewport(file, { settle = 800 } = {}) {
      await setViewport(width, height);
      await sleep(settle);
      const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 } });
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
      return { width, height };
    },
    async screenshotFull(file, { settle = 1500 } = {}) {
      const h = await api.docHeight();
      await setViewport(width, Math.min(Math.max(h, height), 16000));
      await sleep(settle);
      const h2 = await api.docHeight();
      if (h2 !== h) { await setViewport(width, Math.min(Math.max(h2, height), 16000)); await sleep(600); }
      const hh = Math.min(await api.docHeight(), 16000);
      const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height: hh, scale: 1 } });
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
      await setViewport(width, height);
      return { height: hh };
    },
    async screenshotSelettore(sel, file, { settle = 1500, mantieniViewport = false } = {}) {
      if (!mantieniViewport) {
        const h = await api.docHeight();
        await setViewport(width, Math.min(Math.max(h, height), 16000));
      }
      await sleep(settle);
      const r = await evalJs(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const b = e.getBoundingClientRect(); return JSON.stringify({ x: Math.round(b.x + scrollX), y: Math.round(b.y + scrollY), w: Math.round(b.width), h: Math.round(b.height) }); })()`);
      if (!r) throw new Error('elemento non trovato: ' + sel);
      const { x, y, w, h: alt } = JSON.parse(r);
      const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x, y, width: w, height: alt, scale: 1 } });
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
      await setViewport(width, height);
      return { width: w, height: alt };
    },
    async close() { try { ws.close(); } catch {} proc.kill(); await sleep(200); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} },
  };
  return api;
}

module.exports = { openBrowser, sleep };
