'use strict';
// Client MCP minimo (HTTP JSON-RPC) per i connettori di staging, in Node 22+ senza dipendenze.
// Adattato da artes/tools/rev2/mcp-client.js. Legge URL e credenziali dalla configurazione MCP locale
// di Antigravity (~/.gemini/config/mcp_config.json) o da tools/.mcp-locale.json (ignorato da Git).
// Nessuna credenziale nel repository, nessuna credenziale stampata.
//
//   const { connetti } = require('./mcp-client');
//   const el = await connetti('elementor');           // https://dev1.minimalstudiodev.it/wp-json/elementor/mcp/
//   const r = await el.callJson('elementor-list-site-parts', {});
const fs = require('fs');
const os = require('os');
const path = require('path');

function leggiConfig() {
  const locale = path.join(__dirname, '.mcp-locale.json');
  if (fs.existsSync(locale)) {
    return JSON.parse(fs.readFileSync(locale, 'utf8'));
  }
  const agy = path.join(os.homedir(), '.gemini', 'config', 'mcp_config.json');
  if (fs.existsSync(agy)) {
    return JSON.parse(fs.readFileSync(agy, 'utf8'));
  }
  throw new Error('Configurazione MCP non trovata né in tools/.mcp-locale.json né in ~/.gemini/config/mcp_config.json');
}

function risolviServer(server) {
  const cfg = leggiConfig();
  const s = cfg.mcpServers || cfg;
  const voce = s['centro-acustico-pizzuti-elementor'];
  if (!voce || !voce.url || !voce.headers || !voce.headers.Authorization) {
    throw new Error('Voce centro-acustico-pizzuti-elementor non trovata o incompleta nella configurazione MCP');
  }
  const origin = new URL(voce.url).origin;
  const auth = voce.headers.Authorization;
  if (server === 'elementor') {
    return { url: origin + '/wp-json/elementor/mcp/', auth, origin };
  }
  if (server === 'novamira') {
    const nv = s['centro-acustico-pizzuti-novamira'] || voce;
    return { url: nv.url, auth: nv.headers.Authorization, origin };
  }
  throw new Error('Server MCP sconosciuto: ' + server);
}

async function connetti(server) {
  const { url, auth, origin } = risolviServer(server);
  const base = { Authorization: auth, Accept: 'application/json, text/event-stream', 'Content-Type': 'application/json' };
  const post = async (body, extra = {}) => {
    const r = await fetch(url, { method: 'POST', headers: { ...base, ...extra }, body: JSON.stringify(body) });
    return { status: r.status, headers: r.headers, text: await r.text() };
  };
  const leggi = (t) => {
    const m = /data:\s*(\{.*\})/s.exec(t);
    return JSON.parse(m ? m[1] : t);
  };
  const init = await post({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'pizzuti-tools', version: '1' } },
  });
  if (init.status !== 200) throw new Error(`initialize fallita (HTTP ${init.status})`);
  const ij = leggi(init.text);
  if (!ij.result) throw new Error('initialize fallita: ' + init.text.slice(0, 200));
  const sess = {
    'Mcp-Session-Id': init.headers.get('mcp-session-id') || '',
    'MCP-Protocol-Version': ij.result.protocolVersion,
  };
  await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, sess);
  let id = 10;
  const api = {
    origin,
    url,
    serverInfo: ij.result.serverInfo,
    async listTools() {
      const r = await post({ jsonrpc: '2.0', id: ++id, method: 'tools/list', params: {} }, sess);
      const j = leggi(r.text);
      return (j.result && j.result.tools) || [];
    },
    async call(tool, args = {}) {
      const r = await post({ jsonrpc: '2.0', id: ++id, method: 'tools/call', params: { name: tool, arguments: args } }, sess);
      const j = leggi(r.text);
      if (j.error) throw new Error(`${tool}: ${JSON.stringify(j.error).slice(0, 400)}`);
      const txt = (j.result.content || []).map((c) => c.text).join('\n');
      if (j.result && j.result.isError) throw new Error(`${tool}: ${txt.slice(0, 400)}`);
      return txt;
    },
    async callJson(tool, args = {}) {
      const t = await api.call(tool, args);
      try { return JSON.parse(t); } catch { return t; }
    },
  };
  return api;
}

module.exports = { connetti, risolviServer };
