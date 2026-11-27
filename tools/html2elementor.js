'use strict';
// Converte nodi HTML della build Astro (proposta A) in composizioni per elementor-build-composition
// (XML + element_config + classes). Adattato da artes/tools/rev2/html2elementor.js.
const { classi, testo } = require('./html-parse');

// Mappa path SVG -> nome icona (da mockup/src/components/Icon.astro)
const ICONE_PATH = {
  'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z': 'phone',
  'M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.5L3 21zM9 8.5c0 3.5 3 6.5 6.500 6.500l1-1.500-2-1-1 .8a4.500 4.500 0 0 1-2-2l.8-1-1-2L9 8.500z': 'whatsapp',
  'M12 21s7-6 7-11.500a7 7 0 1 0-14 0C5 15 12 21 12 21zM12 12a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5z': 'pin',
  'M4 12h15M13 6l6 6-6 6': 'arrow',
  'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2': 'clock',
  'M4 5h16v14H4zM4 7l8 6 8-6': 'mail',
  'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.500 6.500h.01': 'instagram',
  'M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z': 'facebook',
  'M12 20V5M6 11l6-6 6 6': 'up',
  'M5 12l5 5 9-10': 'check',
  'M12 5v14M5 12h14': 'plus',
  'M12 20s-8-5-8-11a4.500 4.500 0 0 1 8-2.500A4.500 4.500 0 0 1 20 9c0 6-8 11-8 11z': 'heart',
  'M4 5h16v11H9l-5 4V5z': 'chat',
  'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0': 'user',
  'M20 11a8 8 0 1 0-2.300 6M20 4v7h-7': 'refresh',
  'M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6l8-3z': 'shield',
  'M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z': 'drop',
  'M20 14.500A8 8 0 1 1 9.500 4a6.500 6.500 0 0 0 10.500 10.500z': 'moon',
  'M9 18V6l11-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z': 'music',
  'M9 11a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7zM2.500 20a6.500 6.500 0 0 1 13 0M16.500 4.200a3.500 3.500 0 0 1 0 6.600M18 14a6.500 6.500 0 0 1 3.500 6': 'users',
};

const INLINE = new Set(['span', 'strong', 'b', 'em', 'i', 'small', 'sup', 'sub', 'u', 's', 'del', 'abbr', 'mark', 'code', 'time', 'wbr', 'br', 'a']);
const FORMATTAZIONE = new Set(['strong', 'b', 'em', 'i', 'sup', 'sub', 'u', 's', 'del', 'br', 'a', 'span']);
const TAG_BLOCCO = new Set(['div', 'header', 'section', 'article', 'aside', 'footer', 'main', 'nav']);
const TESTO_TAG = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd', 'summary', 'span', 'strong', 'em', 'b', 'i', 'small', 'button', 'label', 'blockquote', 'figcaption']);
const TAG_IN_CLASSE = {
  dl: 'pizzuti-dl', dt: 'pizzuti-dt', dd: 'pizzuti-dd',
  ul: 'pizzuti-ul', ol: 'pizzuti-ol', li: 'pizzuti-li',
  figure: 'pizzuti-figure', figcaption: 'pizzuti-figcaption', blockquote: 'pizzuti-blockquote',
  small: 'pizzuti-small', strong: 'pizzuti-strong', em: 'pizzuti-em', b: 'pizzuti-b', i: 'pizzuti-i', p: 'pizzuti-p',
};

const STILI_INLINE = {
  'margin-bottom:clamp(2.5rem,5vw,4rem)': 'pizzuti-mb-sec',
  'margin-bottom:clamp(2.5rem,5vw,4rem);text-align:center;justify-items:center;margin-inline:auto;max-width:44rem': 'pizzuti-head-center',
  'text-align:center;margin:1.5remauto0': 'pizzuti-note-center',
  'color:var(--sky)': 'pizzuti-sky',
  'margin-top:2rem': 'pizzuti-mt-2',
};

const sc = (shortcode) => ({ name: 'shortcode', settings: { shortcode } });
const sp = (s) => s.replace(/\s+/g, ' ');
const decodifica = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
const frazione = (s) => s.replace(/"/g, '&quot;');

function riconosciIcona(svgNode) {
  if (!svgNode || svgNode.tipo !== 'el' || svgNode.tag !== 'svg') return null;
  const p = svgNode.figli.find((f) => f.tipo === 'el' && f.tag === 'path');
  if (!p || !p.attr.d) return null;
  return ICONE_PATH[p.attr.d] || null;
}

function classeStileInline(n, avvisi, file) {
  const st = n.attr && n.attr.style;
  if (!st) return [];
  const norm = st.replace(/\s+/g, '').replace(/;$/, '');
  const m = /^object-position:(\d+)%(\d+)%$/i.exec(norm);
  if (m) return [`pizzuti-obj-${m[1]}-${m[2]}`];
  if (STILI_INLINE[norm]) return [STILI_INLINE[norm]];
  avvisi.push(`${file}: stile inline non mappato <${n.tag} style="${st}">`);
  return [];
}

function classiDataAttr(n) {
  const out = [];
  const a = n.attr || {};
  if (a['data-reveal'] !== undefined) out.push('pizzuti-reveal');
  if (a['data-wipe'] !== undefined) out.push('pizzuti-wipe');
  if (a['data-stagger'] !== undefined) out.push('pizzuti-stagger');
  if (a['data-motivo']) out.push('pizzuti-motivo-' + String(a['data-motivo']).replace(/[^a-z0-9_-]/gi, ''));
  return out;
}

function destinazioneDinamica(dest) {
  if (!dest) return dest;
  if (dest === 'tel:+390984123456') return sc('[pizzuti_dato campo="telefono_href"]');
  if (/^https:\/\/wa\.me\/390984123456/i.test(dest)) return sc('[pizzuti_whatsapp_url]');
  if (dest === 'mailto:info@centroacusticopizzuti.it') return sc('[pizzuti_mailto]');
  if (/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/i.test(dest)) return sc('[pizzuti_dato campo="mappa_url"]');
  return dest;
}

function testoDinamico(txt) {
  const t = String(txt || '').trim();
  if (t === '0984 123 456') return sc('[pizzuti_dato campo="telefono"]');
  if (t === 'Chiamami: 0984 123 456') return sc('[pizzuti_chiama_label]');
  if (t === 'info@centroacusticopizzuti.it') return sc('[pizzuti_dato campo="email"]');
  if (t === 'Via Roma 45, 87100 Cosenza (CS)') return sc('[pizzuti_dato campo="indirizzo"]');
  return txt;
}

function converti(nodiIn, opzioni = {}) {
  const file = opzioni.file || '';
  const media = opzioni.media || {};
  const avvisi = []; const stat = {};
  const conta = (k) => { stat[k] = (stat[k] || 0) + 1; };
  let contatore = 0;
  const nuovoId = (base) => { const b = String(base || 'el').replace(/[^\w\- ]/g, '').trim().slice(0, 40) || 'el'; contatore++; return `${b} ${contatore}`; };

  const significativi = (n) => n.figli.filter((f) => f.tipo === 'el' || (f.tipo === 'testo' && f.testo.trim() !== ''));
  const frasale = (n) => n.tipo === 'testo' || n.tipo === 'commento' || (n.tipo === 'el' && INLINE.has(n.tag) && n.figli.every(frasale));
  const haClasseOId = (n) => classi(n).length > 0 || (n.attr.id !== undefined);

  function inlineSemplice(n, inFlusso = true) {
    if (n.tipo !== 'el') return true;
    if (haClasseOId(n) || !FORMATTAZIONE.has(n.tag)) return false;
    if (n.tag === 'span' && !inFlusso) return false;
    return n.figli.every((f) => inlineSemplice(f, true));
  }
  function soloTesto(n) {
    const k = significativi(n);
    if (!k.length) return false;
    const flusso = TESTO_TAG.has(n.tag);
    if (!k.every((f) => f.tipo === 'testo' || (frasale(f) && f.tag !== undefined && FORMATTAZIONE.has(f.tag) && inlineSemplice(f, flusso)))) return false;
    if (flusso) return true;
    return k.some((f) => f.tipo === 'testo') || k.length === 1;
  }
  function htmlTesto(n) {
    const out = [];
    for (const f of n.figli) {
      if (f.tipo === 'testo') { out.push(f.testo); continue; }
      if (f.tipo !== 'el') continue;
      if (f.tag === 'svg') continue;
      const dentro = htmlTesto(f);
      if (f.tag === 'br') { out.push('<br>'); continue; }
      if (f.tag === 'a') { out.push(f.attr.href ? `<a href="${frazione(decodifica(f.attr.href))}">${dentro}</a>` : dentro); continue; }
      out.push(`<${f.tag}>${dentro}</${f.tag}>`);
    }
    return out.join('');
  }

  const W = (tipo, cfg, cls, figli, nome) => ({ tipo, cfg: cfg || {}, cls: [...new Set(cls || [])], figli: figli || [], nome });
  const tagContenitore = (n) => (TAG_BLOCCO.has(n.tag) ? n.tag : 'div');
  const extraClasse = (n) => [
    ...(TAG_IN_CLASSE[n.tag] ? [TAG_IN_CLASSE[n.tag]] : []),
    ...classeStileInline(n, avvisi, file),
    ...classiDataAttr(n),
  ];
  const cssid = (cfg, n) => { if (n.attr && n.attr.id !== undefined) cfg._cssid = n.attr.id; return cfg; };

  function attributiPersi(n) {
    if (n.tag === 'svg' || n.tag === 'path') return;
    for (const k of Object.keys(n.attr || {})) {
      if (['class', 'href', 'src', 'alt', 'id', 'style'].includes(k)) continue;
      if (k.startsWith('data-') || k.startsWith('aria-') || ['role', 'type', 'target', 'rel', 'loading', 'width', 'height', 'decoding', 'fetchpriority', 'focusable', 'novalidate', 'for', 'name', 'autocomplete', 'inputmode', 'required', 'hidden'].includes(k)) {
        stat['attr:' + k.replace(/-.*/, '-*')] = (stat['attr:' + k.replace(/-.*/, '-*')] || 0) + 1;
        continue;
      }
      avvisi.push(`${file}: attributo non gestito <${n.tag} ${k}="${n.attr[k]}">`);
    }
  }

  function paragrafoDaRun(nodi) {
    const t = sp(htmlTesto({ figli: nodi }));
    if (t.trim() === '') return null;
    return W('e-paragraph', { paragraph: testoDinamico(t), tag: 'span' }, ['pizzuti-t'], [], 'testo');
  }

  function figliWidget(n, figliForzati) {
    const out = []; let run = [];
    const chiudiRun = () => { if (run.length) { const w = paragrafoDaRun(run); if (w) out.push(w); run = []; } };
    const ks = (figliForzati || n.figli).filter((f) => f.tipo !== 'commento');
    const testoVero = ks.some((f) => f.tipo === 'testo' && f.testo.trim() !== '');
    for (const f of ks) {
      if (f.tipo === 'testo') { if (f.testo.trim() === '' && !testoVero) continue; run.push(f); continue; }
      if (testoVero && frasale(f) && inlineSemplice(f, TESTO_TAG.has(n.tag))) { run.push(f); continue; }
      chiudiRun();
      out.push(...elemento(f));
    }
    chiudiRun();
    return out;
  }

  function costruisciModulo(n) {
    conta('e-form');
    const idPrefix = file.includes('contatti') ? 'ct' : 'hm';
    const optMotivi = [
      'Vorrei prenotare un controllo dell’udito',
      'Cerco aiuto per una persona cara',
      'Ho già un apparecchio e mi serve assistenza',
      'Vorrei informazioni sui contributi SSN',
      'Vorrei informazioni sugli auricolari su misura',
      'Vorrei un preventivo',
      'Altro',
    ];
    const fNome = W('e-div-block', { tag: 'div' }, ['field'], [
      W('e-form-label', { tag: 'label', text: 'Il tuo nome', 'input-id': `${idPrefix}-nome` }, [], [], 'lbl-nome'),
      W('e-form-input', {
        _cssid: `${idPrefix}-nome`, type: 'text', required: true, autocomplete: true,
        'webmcp-param-description': 'Nome della persona che richiede di essere richiamata.',
      }, [], [], 'in-nome'),
    ], 'field-nome');

    const fTel = W('e-div-block', { tag: 'div' }, ['field'], [
      W('e-form-label', { tag: 'label', text: 'Numero di telefono', 'input-id': `${idPrefix}-tel` }, [], [], 'lbl-tel'),
      W('e-form-input', {
        _cssid: `${idPrefix}-tel`, type: 'tel', required: true, autocomplete: true,
        'webmcp-param-description': 'Numero di telefono su cui essere richiamati dal Centro.',
      }, [], [], 'in-tel'),
      W('e-paragraph', { tag: 'span', paragraph: 'Ti richiamo io.' }, ['hint'], [], 'hint-tel'),
    ], 'field-tel');

    const fMotivo = W('e-div-block', { tag: 'div' }, ['field'], [
      W('e-form-label', { tag: 'label', text: 'Come posso aiutarti?', 'input-id': `${idPrefix}-motivo` }, [], [], 'lbl-motivo'),
      W('e-form-select', {
        _cssid: `${idPrefix}-motivo`, name: 'motivo',
        options: optMotivi.map((v) => ({ key: v, value: v })),
        required: false, 'has-default-value': true, value: optMotivi[0],
        'webmcp-param-description': 'Motivo della richiesta di contatto.',
      }, ['pizzuti-form-motivo'], [], 'in-motivo'),
    ], 'field-motivo');

    const fMsg = W('e-div-block', { tag: 'div' }, ['field'], [
      W('e-form-label', { tag: 'label', text: 'Un messaggio, se vuoi <span class="hint">(facoltativo)</span>', 'input-id': `${idPrefix}-msg` }, [], [], 'lbl-msg'),
      W('e-form-textarea', {
        _cssid: `${idPrefix}-msg`, rows: 4, required: false, resizable: true,
        'webmcp-param-description': 'Messaggio facoltativo per il Centro.',
      }, [], [], 'in-msg'),
    ], 'field-msg');

    const fPrivacy = W('e-div-block', { tag: 'div' }, ['check'], [
      W('e-form-checkbox', {
        _cssid: `${idPrefix}-privacy`, name: 'privacy', value: 'accetto',
        required: true, 'has-default-value': false, checked: false,
        'webmcp-param-description': 'Consenso obbligatorio al trattamento dei dati personali.',
      }, [], [], 'in-privacy'),
      W('e-form-label', {
        tag: 'label', 'input-id': `${idPrefix}-privacy`,
        text: 'Ho letto l’<a href="/privacy-policy/" target="_blank" rel="noopener">informativa sulla privacy</a> e acconsento al trattamento dei miei dati per essere ricontattato.',
      }, [], [], 'lbl-privacy'),
    ], 'field-privacy');

    const submit = W('e-form-submit-button', { text: 'Richiamami', tag: 'button' }, ['btn', 'btn-primary'], [], 'btn-invia');
    const note = W('e-paragraph', { tag: 'p', paragraph: 'Preferisci parlare subito? Chiamami o scrivimi su WhatsApp: è più veloce.' }, ['form-note'], [], 'form-note');
    const okMsg = W('e-form-success-message', {}, ['form-sent', 'pizzuti-form-ok'], [
      W('e-paragraph', { tag: 'p', paragraph: 'Grazie! La richiesta è stata inviata: ti richiamo appena posso.' }, [], [], 'msg-ok-t'),
    ], 'msg-ok');
    const errMsg = W('e-form-error-message', {}, ['form-sent', 'pizzuti-form-err'], [
      W('e-paragraph', { tag: 'p', paragraph: 'Non siamo riusciti a inviare la richiesta. Riprova fra poco oppure chiamami o scrivimi su WhatsApp.' }, [], [], 'msg-err-t'),
    ], 'msg-err');
    // Honeypot SEMPRE ultimo figlio del modulo (requisito §4.2 / scheda Stato).
    const honeypot = W('e-form-honeypot', {}, [], [], 'honeypot');

    return [W('e-form', cssid({
      'form-name': file.includes('contatti') ? 'Richiesta ricontatto (Contatti)' : 'Richiesta ricontatto (Home)',
      'actions-after-submit': ['email'],
      email: {
        to: ['info@centroacusticopizzuti.it'],
        subject: 'Nuova richiesta di ricontatto dal sito',
        message: '[all-fields]',
        'send-as': 'html',
        'from-name': 'Centro Acustico Pizzuti',
      },
    }, n), [...classi(n), ...classiDataAttr(n)], [
      fNome, fTel, fMotivo, fMsg, fPrivacy, submit, note, okMsg, errMsg, honeypot,
    ], 'contact-form')];
  }

  function linkAutonomo(n) {
    const cl = classi(n);
    const destRaw = n.attr.href !== undefined ? decodifica(n.attr.href) : null;
    const dest = destinazioneDinamica(destRaw);
    const link = dest === null ? undefined : { destination: dest, tag: 'a' };
    const extra = [...classiDataAttr(n), ...classeStileInline(n, avvisi, file)];

    // <a class="btn ..."> con icona SVG prima o dopo il testo -> e-button
    if (cl.includes('btn')) {
      const sig = significativi(n);
      const icone = [];
      const testoNodi = [];
      let soloIconeETesto = true;
      let vistoTesto = false;
      for (const f of sig) {
        if (f.tipo === 'el' && f.tag === 'svg') {
          const ico = riconosciIcona(f);
          if (ico) icone.push((vistoTesto ? 'pizzuti-ico-after-' : 'pizzuti-ico-') + ico);
          else { soloIconeETesto = false; avvisi.push(`${file}: SVG non riconosciuto in .btn`); }
        } else if (f.tipo === 'testo' || (frasale(f) && inlineSemplice(f, true))) {
          if (f.tipo !== 'testo' || f.testo.trim() !== '') vistoTesto = true;
          testoNodi.push(f);
        } else {
          soloIconeETesto = false;
        }
      }
      if (soloIconeETesto) {
        conta('e-button');
        const txt = sp(htmlTesto({ figli: testoNodi })).trim();
        return [W('e-button', cssid({ text: testoDinamico(txt), ...(link ? { link } : {}) }, n), [...cl, ...extra, ...icone], [], 'bottone')];
      }
      // .btn con <span> classati (es. .cta-num o .visually-hidden): usa e-div-block[a] portando l'icona SVG su ::before/::after
      const iconeCls = [];
      let vistoTxt = false;
      const senzaSvg = [];
      for (const f of n.figli) {
        if (f.tipo === 'el' && f.tag === 'svg') {
          const ico = riconosciIcona(f);
          if (ico) { iconeCls.push((vistoTxt ? 'pizzuti-ico-after-' : 'pizzuti-ico-') + ico); continue; }
        }
        if ((f.tipo === 'testo' && f.testo.trim() !== '') || (f.tipo === 'el' && f.tag !== 'svg')) vistoTxt = true;
        senzaSvg.push(f);
      }
      if (iconeCls.length) {
        conta('e-div-block[a.btn]');
        return [W('e-div-block', cssid({ tag: 'a', ...(link ? { link } : {}) }, n), [...cl, ...extra, ...iconeCls], figliWidget(n, senzaSvg), 'bottone-rich')];
      }
    }

    // Link dentro .link-rows con freccia SVG finale -> pizzuti-ico-arrow-right
    const sig = significativi(n);
    const ultimo = sig[sig.length - 1];
    if (ultimo && ultimo.tipo === 'el' && ultimo.tag === 'svg' && riconosciIcona(ultimo) === 'arrow') {
      conta('e-div-block[a]');
      const senzaSvg = n.figli.filter((f) => f !== ultimo);
      return [W('e-div-block', cssid({ tag: 'a', ...(link ? { link } : {}) }, n), [...cl, ...extra, 'pizzuti-ico-arrow-right'], figliWidget(n, senzaSvg), 'link-row')];
    }

    conta('e-div-block[a]');
    const figli = soloTesto(n)
      ? [W('e-paragraph', { paragraph: testoDinamico(sp(htmlTesto(n)).trim()), tag: 'span' }, ['pizzuti-t'], [], 'testo')]
      : figliWidget(n);
    return [W('e-div-block', cssid({ tag: 'a', ...(link ? { link } : {}) }, n), [...cl, ...extra], figli, 'link ' + sp(testo(n)).trim().slice(0, 28))];
  }

  function elemento(n) {
    if (!n || n.tipo !== 'el') return [];
    attributiPersi(n);
    const tag = n.tag;
    const cl = classi(n);
    if (['script', 'style', 'link', 'meta', 'noscript'].includes(tag)) return [];

    // 1. Form contatti -> e-form nativo Elementor Pro (con honeypot ultimo)
    if (tag === 'form') return costruisciModulo(n);

    // 2. Mappa a consenso (.map-consent-box con <svg pin/> iniziale) -> 100% atomico V4
    if (tag === 'div' && cl.includes('map-consent-box')) {
      const sig = significativi(n);
      if (sig.length && sig[0].tipo === 'el' && sig[0].tag === 'svg') {
        const ico = riconosciIcona(sig[0]);
        if (ico) {
          conta('map-box+ico:' + ico);
          const rest = n.figli.filter((f) => f !== sig[0]);
          return [W('e-div-block', cssid({ tag: 'div' }, n), [...cl, ...classiDataAttr(n), 'pizzuti-ico-' + ico], figliWidget(n, rest), 'map-consent-box')];
        }
      }
    }

    // 4. FAQ (.faq con <details>/<summary>) -> e-accordion nativo Elementor V4 con faq_schema: true
    if (tag === 'div' && cl.includes('faq') && significativi(n).some((f) => f.tipo === 'el' && f.tag === 'details')) {
      const items = [];
      for (const d of significativi(n)) {
        if (d.tipo !== 'el' || d.tag !== 'details') continue;
        attributiPersi(d);
        const sum = d.figli.find((f) => f.tipo === 'el' && f.tag === 'summary');
        const corpoNodi = d.figli.filter((f) => f !== sum && f.tipo !== 'commento');
        const titoloTesto = sum ? sp(htmlTesto(sum)).trim() : '';
        const titleWidget = W('e-accordion-item-title', {}, [], [
          W('e-paragraph', { paragraph: titoloTesto, tag: 'span' }, ['pizzuti-t'], [], 'domanda'),
        ], 'titolo');
        const headerWidget = W('e-accordion-item-header', {}, [], [titleWidget], 'summary');
        const contentWidget = W('e-accordion-item-content', {}, [], figliWidget({ tag: 'div', figli: corpoNodi, attr: {} }), 'risposta');
        items.push(W('e-accordion-item', cssid({}, d), [...classi(d), ...classiDataAttr(d)], [headerWidget, contentWidget], 'faq-item'));
      }
      conta('e-accordion');
      return [W('e-accordion', cssid({
        default_state: 'all_collapsed', max_expanded: 'multiple', show_icon: false, faq_schema: true,
      }, n), [...cl, ...classiDataAttr(n)], items, 'faq')];
    }

    // 5. Titoli h1..h6 (conserva <span> interni per .h1-righe)
    if (/^h[1-6]$/.test(tag)) {
      conta('e-heading');
      return [W('e-heading', cssid({ tag, title: sp(htmlTesto(n)).trim() }, n), [...cl, ...extraClasse(n)], [], tag)];
    }

    // 6. Immagini
    if (tag === 'img') {
      const src = n.attr.src;
      const m = media[src] || media[src && src.replace(/^\//, '')];
      if (!m || !m.id) { avvisi.push(`${file}: immagine non in mappa media: ${src}`); return []; }
      conta('e-image');
      return [W('e-image', cssid({ image: { src: { id: m.id }, size: 'full' } }, n), [...cl, ...extraClasse(n)], [], 'immagine')];
    }

    // 7. Contenitori solo-icona (.tile-ico, .card-num)
    if ((cl.includes('tile-ico') || cl.includes('card-num')) && significativi(n).length === 1 && significativi(n)[0].tag === 'svg') {
      const ico = riconosciIcona(significativi(n)[0]);
      if (ico) {
        conta('ico:' + ico);
        return [W('e-div-block', cssid({ tag: 'div' }, n), [...cl, ...classiDataAttr(n), 'pizzuti-ico-' + ico], [], 'ico-' + ico)];
      }
    }

    // 8. <li> con icona SVG iniziale (.chip, .home-where li, .contact-list li, .check-list li)
    if (tag === 'li') {
      const sig = significativi(n);
      if (sig.length && sig[0].tipo === 'el' && sig[0].tag === 'svg') {
        const ico = riconosciIcona(sig[0]);
        if (ico) {
          conta('li+ico:' + ico);
          const rest = n.figli.filter((f) => f !== sig[0]);
          const cls = [...cl, ...extraClasse(n), 'pizzuti-ico-' + ico];
          return [W('e-div-block', cssid({ tag: 'div' }, n), cls, figliWidget(n, rest), 'li-' + ico)];
        }
      }
    }

    // 9. SVG isolato residuo
    if (tag === 'svg') {
      const ico = riconosciIcona(n);
      if (ico) {
        conta('svg:' + ico);
        return [W('e-div-block', { tag: 'div' }, ['pizzuti-ico-' + ico], [], 'svg-' + ico)];
      }
      avvisi.push(`${file}: SVG non riconosciuto`);
      return [];
    }

    if (tag === 'p') {
      if (soloTesto(n)) {
        conta('e-paragraph');
        return [W('e-paragraph', cssid({ paragraph: testoDinamico(sp(htmlTesto(n)).trim()), tag: 'p' }, n), [...cl, ...classeStileInline(n, avvisi, file), ...classiDataAttr(n)], [], 'p')];
      }
      conta('p->div');
      return [W('e-div-block', cssid({ tag: 'div' }, n), [...cl, ...extraClasse(n)], figliWidget(n), 'p')];
    }
    if (tag === 'a') return linkAutonomo(n);
    if (tag === 'button') {
      if (soloTesto(n)) { conta('e-button'); return [W('e-button', cssid({ text: sp(testo(n)).trim(), tag: 'button' }, n), [...cl, ...classiDataAttr(n)], [], 'bottone')]; }
      conta('button-contenitore');
      return [W('e-div-block', cssid({ tag: 'button' }, n), [...cl, ...classiDataAttr(n)], figliWidget(n), 'button')];
    }
    if (INLINE.has(tag)) {
      conta('e-paragraph');
      const cls = [...cl, ...extraClasse(n)];
      if (soloTesto(n) || !significativi(n).length) return [W('e-paragraph', cssid({ paragraph: testoDinamico(sp(htmlTesto(n))), tag: 'span' }, n), cls, [], tag)];
      return [W('e-div-block', cssid({ tag: 'div' }, n), cls, figliWidget(n), tag)];
    }

    const cls = [...cl, ...extraClasse(n)];
    const tg = tagContenitore(n);
    if (tag !== tg && !TAG_IN_CLASSE[tag]) avvisi.push(`${file}: <${tag}> reso come div senza classe di appoggio`);
    conta('e-div-block');
    if (soloTesto(n)) {
      return [W('e-div-block', cssid({ tag: tg }, n), cls, [
        W('e-paragraph', { paragraph: testoDinamico(sp(htmlTesto(n)).trim()), tag: 'span' }, ['pizzuti-t'], [], 'testo'),
      ], tag)];
    }
    return [W('e-div-block', cssid({ tag: tg }, n), cls, figliWidget(n), tag)];
  }

  const lista = Array.isArray(nodiIn) ? nodiIn : [nodiIn];
  let alberi = lista.flatMap(elemento);
  if (opzioni.radice) {
    alberi = [W('e-div-block', cssid({ tag: opzioni.radice.tag || 'div' }, { attr: opzioni.radice.id ? { id: opzioni.radice.id } : {} }), opzioni.radice.classi || [], alberi, 'radice')];
  }

  const element_config = {}; const classes = {}; const tutteClassi = new Set();
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  function xml(w) {
    const id = nuovoId(w.cls[0] || w.nome);
    if (Object.keys(w.cfg).length) element_config[id] = w.cfg;
    if (w.cls.length) {
      classes[id] = [...new Set(w.cls)];
      classes[id].forEach((c) => tutteClassi.add(c));
    }
    const inner = w.figli.map(xml).join('');
    return `<${w.tipo} configuration-id="${esc(id)}">${inner}</${w.tipo}>`;
  }
  const xml_structure = alberi.map(xml).join('');
  return { composizione: { xml_structure, element_config, classes }, classiUsate: [...tutteClassi], avvisi: [...new Set(avvisi)], statistiche: stat, elementi: contatore };
}

module.exports = { converti, ICONE_PATH };
