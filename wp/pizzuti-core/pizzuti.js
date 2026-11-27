/* Centro Acustico Pizzuti — comportamento lato browser (vanilla JS, zero dipendenze).
   Gestisce:
   1. Attributi ARIA/ruoli non impostabili nei widget atomici Elementor V4
   2. Voce di menu attiva (header desktop e menu mobile)
   3. Menu mobile (<details class="m-menu"> o fallback pulsante)
   4. Comparsa allo scroll (data-reveal, data-wipe, data-stagger) nel rispetto di prefers-reduced-motion
   5. Precompilazione motivo nel modulo Contatti (?motivo=... e link data-motivo / classi pizzuti-motivo-*)
   6. Mappa Google a consenso (caricamento iframe solo dopo il clic) */
(function () {
  'use strict';

  var dati = window.PizzutiDati || {};
  var i18n = dati.i18n || {};
  var ridotto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function normPath(p) {
    if (!p) return '/';
    try { p = new URL(p, location.origin).pathname; } catch (e) {}
    return p.replace(/\/+$/, '') || '/';
  }

  /* 1. Decorazione attributi ARIA / data-* dalle classi */
  function decora() {
    if (document.body && !document.body.id) document.body.id = 'top';
    document.querySelectorAll('.contact-bar').forEach(function (el) {
      if (!el.hasAttribute('role')) el.setAttribute('role', 'region');
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', i18n.contatti_rapidi || 'Contatti rapidi');
    });
    document.querySelectorAll('.site-header .brand').forEach(function (a) {
      if (!a.hasAttribute('aria-label')) a.setAttribute('aria-label', 'Centro Acustico Pizzuti, home');
    });
    document.querySelectorAll('.site-header nav').forEach(function (nav) {
      if (!nav.hasAttribute('aria-label')) {
        nav.setAttribute('aria-label', nav.closest('.m-menu') ? (i18n.nav_mobile || 'Principale (mobile)') : (i18n.nav_principale || 'Principale'));
      }
    });
    document.querySelectorAll('.footer-social a.pizzuti-ico-facebook').forEach(function (a) {
      if (!a.hasAttribute('aria-label')) a.setAttribute('aria-label', 'Facebook (si apre in una nuova scheda)');
      a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
    });
    document.querySelectorAll('.footer-social a.pizzuti-ico-instagram').forEach(function (a) {
      if (!a.hasAttribute('aria-label')) a.setAttribute('aria-label', 'Instagram (si apre in una nuova scheda)');
      a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
    });
    document.querySelectorAll('.nf-code').forEach(function (el) { el.setAttribute('aria-hidden', 'true'); });
    document.querySelectorAll('.pizzuti-reveal').forEach(function (el) {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
    });
    document.querySelectorAll('.pizzuti-wipe').forEach(function (el) {
      if (!el.hasAttribute('data-wipe')) el.setAttribute('data-wipe', '');
    });
    document.querySelectorAll('.pizzuti-stagger').forEach(function (el) {
      if (!el.hasAttribute('data-stagger')) el.setAttribute('data-stagger', '');
    });
    document.querySelectorAll('[class*="pizzuti-motivo-"]').forEach(function (el) {
      var m = /pizzuti-motivo-([a-z0-9_-]+)/i.exec(el.className || '');
      if (m && !el.hasAttribute('data-motivo')) el.setAttribute('data-motivo', m[1]);
    });
  }

  /* 2. Voce di menu attiva */
  function marcaAttivo(percorsoForzato) {
    var cur = normPath(percorsoForzato || location.pathname);
    document.querySelectorAll('.site-header nav a, .m-menu nav a, .m-menu .m-menu-nav a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var target = normPath(href);
      if (target === cur && (target !== '/' || cur === '/')) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  /* 3. Menu mobile: <button class="m-menu-summary"> apre/chiude .m-menu; chiudi fuori o Esc */
  function initMenuMobile() {
    document.querySelectorAll('.m-menu-summary').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var wrap = btn.closest('.m-menu');
        if (!wrap) return;
        var open = wrap.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    document.addEventListener('click', function (e) {
      document.querySelectorAll('details.m-menu[open]').forEach(function (d) {
        if (!d.contains(e.target) || (e.target.closest && e.target.closest('nav a'))) d.removeAttribute('open');
      });
      document.querySelectorAll('.m-menu.is-open').forEach(function (w) {
        if (!w.contains(e.target) || (e.target.closest && e.target.closest('a'))) {
          w.classList.remove('is-open');
          var b = w.querySelector('.m-menu-summary');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('details.m-menu[open]').forEach(function (d) { d.removeAttribute('open'); });
        document.querySelectorAll('.m-menu.is-open').forEach(function (w) {
          w.classList.remove('is-open');
          var b = w.querySelector('.m-menu-summary');
          if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); }
        });
      }
    });
  }

  /* 4. Animazioni allo scroll (identiche a mockup/src/layouts/Base.astro) */
  function initReveal() {
    var els = [].slice.call(document.querySelectorAll('[data-reveal],[data-wipe]'));
    [].slice.call(document.querySelectorAll('[data-stagger]')).forEach(function (g) {
      [].slice.call(g.children).forEach(function (c, i) {
        c.setAttribute('data-reveal', '');
        c.style.setProperty('--i', i);
        els.push(c);
      });
    });
    if (!els.length) return;
    if (ridotto || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* 5. Precompilazione motivo modulo Contatti (?motivo=ssn|auricolari|preventivo|assistenza|caro|controllo|altro) */
  function initMotivo() {
    var motivi = dati.motivi || {};
    function trovaSelect() {
      return document.querySelector('select[name*="motivo"], select#f-motivo, .pizzuti-form-motivo select, select.pizzuti-form-motivo');
    }
    function applica(codice) {
      if (!codice) return;
      var sel = trovaSelect();
      if (!sel) return;
      var chiave = String(codice).toLowerCase().trim();
      var etichetta = motivi[chiave] || '';
      for (var i = 0; i < sel.options.length; i++) {
        var opt = sel.options[i];
        var v = (opt.value || '').toLowerCase().trim();
        var t = (opt.textContent || '').toLowerCase().trim();
        if (v === chiave || (etichetta && (v === etichetta.toLowerCase() || t === etichetta.toLowerCase())) || t.indexOf(chiave) !== -1) {
          sel.selectedIndex = i;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    }
    try {
      var q = new URLSearchParams(location.search).get('motivo');
      if (q) applica(q);
    } catch (e) {}
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-motivo]');
      if (a) applica(a.getAttribute('data-motivo'));
    });
  }

  /* 6. Mappa Google a consenso */
  function initMappa() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.map-consent-load');
      if (!b) return;
      var w = b.closest('.map-consent');
      if (!w) return;
      var src = w.getAttribute('data-src') || dati.mappa_embed_url;
      if (!src) return;
      var f = document.createElement('iframe');
      f.src = src;
      f.title = i18n.mappa_titolo || 'Mappa: come raggiungere il Centro Acustico Pizzuti';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      w.innerHTML = '';
      w.appendChild(f);
      f.focus();
    });
  }

  function avvia() {
    decora();
    marcaAttivo();
    initMenuMobile();
    initReveal();
    initMotivo();
    initMappa();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', avvia);
  } else {
    avvia();
  }

  window.Pizzuti = { marcaAttivo: marcaAttivo };
})();
