# Decisioni tecniche — Fase 1 (Preparazione e prova tecnica)

**Data:** 2026-11-27 · **Ambiente verificato:** `https://dev1.minimalstudiodev.it/` (WordPress 7.1.5, Elementor 4.4.2, Elementor Pro 4.4.2 Expert, Novamira 2.0.0, Twenty Twenty-Five 1.5).
**Riferimento visivo:** build statica della sola proposta A (`mockup/dist/`, generata con `ASTRO_TELEMETRY_DISABLED=1 npm run build`). La proposta B è esclusa del tutto.

---

## 1. Verifica dei connettori MCP e CLI

### 1.1 Elementor MCP (ufficiale)
- **Endpoint verificato:** `https://dev1.minimalstudiodev.it/wp-json/elementor/mcp/` (HTTP Streamable JSON-RPC, protocollo `2025-03-26`, autenticazione Basic con la password applicazione dell'utente `minimalstudio`).
- **Nota sulla configurazione locale:** in `~/.gemini/config/mcp_config.json` la voce `centro-acustico-pizzuti-elementor` puntava inizialmente a `/wp-json/mcp/mcp-adapter-default-server` (che è l'alias legacy di **Novamira**, non l'MCP di Elementor). Il client `tools/mcp-client.js` ricava automaticamente `/wp-json/elementor/mcp/` dall'origine e usa la stessa Basic Auth senza salvare credenziali nel repository. Conviene comunque aggiornare l'URL in `mcp_config.json` (e per Novamira usare la CLI OAuth o `/wp-json/mcp/novamira`).
- **Strumenti disponibili (36):**
  - *Documenti e pagine:* `elementor-create-page`, `elementor-get-page-structure`, `elementor-update-page-settings`, `elementor-build-composition`, `elementor-manage-elements`, `elementor-create-preview-link`, `elementor-publish-document`, `elementor-manage-revisions`, `elementor-list-posts` (`per_page` max 25).
  - *Theme Builder e componenti:* `elementor-list-site-parts`, `elementor-manage-site-parts` (`header`, `footer`, `error-404`, `single-page`, `floating-buttons`, `popup`, `section`, ecc.), `elementor-list-components`, `elementor-manage-component`.
  - *Stile, classi e kit:* `elementor-manage-classes` (bulk fino a 50 operazioni `create`/`update`/`delete`), `elementor-reorder-classes`, `elementor-manage-global-variable`, `elementor-get-default-styles`, `elementor-manage-default-styles`.
  - *Media e icone:* `elementor-list-assets`, `elementor-upload-media` (da URL HTTPS), `elementor-request-media-upload` (token one-time per upload locale), `elementor-find-icons`.
  - *Schemi, risorse e sistema:* `elementor-list-widget-schemas`, `elementor-get-widget-schemas`, `elementor-list-resources`, `elementor-read-resource` (`elementor://global-classes`, `elementor://global-variables`, `elementor://dynamic-tags`, ecc.), `elementor-get-system-info`, `elementor-get-license-status`, `elementor-list-experiments`, `elementor-manage-experiments`, `elementor-clear-cache`, `elementor-enable-agent-ready`, `elementor-agent-ready-scan`, `elementor-list-form-submissions`, `elementor-manage-form-submissions`, `elementor-manage-woocommerce-settings`.
- **Formato dei widget:** **atomici Elementor 4 (V4)** (`atomic_editor.active = true`). Si costruiscono con `elementor-build-composition` passando `xml_structure` (tag atomici con `configuration-id` univoco), `element_config`, `classes` (riferimenti a etichette globali create prima con `elementor-manage-classes`), `mode: "replace_children" | "append"`, `dry_run`.
  - Widget atomici principali verificati: `e-div-block` (`tag`: `div|header|section|article|aside|footer|main|nav|a|button`, `link`), `e-heading` (`tag`, `title`, `link`), `e-paragraph` (`tag: p|span`, `paragraph`, `link`), `e-button` (`text`, `link`, `tag`), `e-image` (`image: { src: { id }, size }`), `e-svg`, `e-accordion` (con `e-accordion-item`, `header`, `title`, `content` e `faq_schema`), `e-form` (con `e-form-input`, `e-form-textarea`, `e-form-select`, `e-form-checkbox`, `e-form-honeypot`, `e-form-submit-button`, `e-form-success-message`, `e-form-error-message`).
- **Stato bozza vs pubblicazione:**
  - `elementor-create-page` crea **sempre in bozza** (`status: "draft"`).
  - `elementor-build-composition`, `elementor-manage-elements` e `elementor-update-page-settings` su documenti già pubblicati salvano in staging/autosave (`staged: true`) senza toccare la versione live; su bozze modificano la bozza.
  - La pubblicazione avviene **solo** con chiamata esplicita a `elementor-publish-document`.
  - Ogni scrittura restituisce `undo_revision_id`, ripristinabile con `elementor-manage-revisions`.
- **Classi globali "solo etichetta":** `css` è obbligatorio in `elementor-manage-classes`, quindi si usa una proprietà innocua (`--p: 0;`). Elementor genera un foglio per documento (`global-<id>-frontend-desktop.css`) contenente **solo** le classi usate in quella pagina.
- **Upload media:** `elementor-request-media-upload` restituisce un endpoint one-time con header `X-Elementor-Mcp-Upload-Token` che accetta **solo binario grezzo** (`Content-Type: application/octet-stream`, non multipart `FormData`) e salva il file come `mcp-upload.jpg` ignorando `Content-Disposition`. **Decisione per la Fase 2:** caricare le immagini della proposta A tramite REST WordPress standard (`/wp-json/wp/v2/media` con Basic Auth e `Content-Disposition`), così da preservare i nomi file SEO originali (`studio-ufficio.jpg`, `dottore-ritratto.jpg`, ecc.) e impostare `alt_text` direttamente.

### 1.2 Novamira CLI e MCP
- **Novamira CLI `@novamira/cli` `1.4.0`** autenticato via OAuth su profilo `dev1.minimalstudiodev.it` (token in Windows Credential Manager). `novamira doctor --site dev1.minimalstudiodev.it --json`: 18/19 controlli verdi (unico avviso locale Windows ACL su `cache.directory`, non bloccante).
- **88 abilities esposte** (incluse `core/*`, `novamira/*` — `execute-php`, `run-wp-cli`, `read-file`/`write-file`/`list-directory`, `create-upload-link` — e il bridge WP 7.1 verso `elementor/*`).
- **Approvazioni AI attive** su Novamira v2: le chiamate di scrittura/distruttive via Novamira richiedono il blocco `novamira_review` e, sopra la soglia configurata, conferma manuale in `Novamira > AI Activity`. Le operazioni di sola lettura (`core/get-site-info`, `novamira/list-directory`, `novamira/read-file`) girano subito senza conferme.

---

## 2. Censimento CSS e markup della proposta A (Astro → Elementor)

Dall'analisi completa di `mockup/src/` (esclusi `proposta-b/`, `components/b/`, `layouts/b/`, `styles/b.css`):

1. **Stili con ambito (`data-astro-cid-*`):** **0** in tutta la proposta A. Tutti gli stili provengono da `mockup/src/styles/base.css` (283 righe), `mockup/src/styles/sections.css` (237 righe) e un unico blocco `<style is:global>` in `mockup/src/pages/index.astro` (39 righe, tutto sotto `.home`).
2. **Prefisso e token (`tools/port-css.js`):**
   - `:root` → `body.pizzuti`; `html` → `html:has(body.pizzuti)`; `body` → `body.pizzuti`; `*`, `::selection`, `:focus-visible` → prefissati `body.pizzuti`.
   - Tutti gli altri selettori → `body.pizzuti .elementor <selettore>` (e `.js …` → `html.js body.pizzuti .elementor …`).
   - `.home` (usato da `index.astro` su `<body>`) viene applicato anche sul `e-div-block` radice della Home (`page-root home`), così `.home .home-hero h1` e tutte le regole della home funzionano identicamente sia sulle anteprime in bozza sia sulla front page pubblicata.
3. **Tag HTML della proposta A non ammessi da `e-div-block`:**
   - Tag censiti: `figure`, `figcaption`, `blockquote`, `dl`, `dt`, `dd`, `ul`, `ol`, `li`, `details`, `summary` (+ `form/input/select/textarea/label` gestiti da `e-form` di Elementor Pro in Fase 4).
   - Mappatura: `html2elementor.js` li rende come `e-div-block` (`tag: "div"`) con classe d'appoggio `pizzuti-<tag>` (es. `pizzuti-figure`, `pizzuti-blockquote`, `pizzuti-ul`, `pizzuti-ol`, `pizzuti-li`). `port-css.js` riscrive ogni selettore di tipo come `:is(tag, :where(.pizzuti-tag))`, mantenendo la **stessa specificità** del tag nudo. Per le FAQ (`details`/`summary`) si usa il widget nativo `e-accordion` (che emette `<details>/<summary>` reali).
4. **Stili inline nella proposta A (12 occorrenze totali):**
   - 7 `object-position` su `<img>` (`20% 40%`, `50% 50%`, `50% 40%`, `50% 45%`, `50% 12%`, `60% 50%`, `100% 40%`) → classi utility `pizzuti-obj-X-Y` in `tools/css/adattamenti.css` (già mappate in `html2elementor.js`).
   - 5 spaziature/allineamenti in `index.astro`, `apparecchi-acustici`, `prezzi`, `contatti` → classi utility dedicate in `adattamenti.css` al momento della Fase 4.
5. **Icone SVG (`mockup/src/components/Icon.astro`, 20 icone 24×24 stroke 2px):**
   - `e-button` non accetta `<svg>` figli; `e-svg` richiederebbe il caricamento di 20 file SVG in Libreria media.
   - **Decisione:** `html2elementor.js` riconosce il tracciato `<path d="...">` di `Icon.astro` e aggiunge la classe `pizzuti-ico-<nome>` (es. `pizzuti-ico-phone`, `pizzuti-ico-whatsapp`) al widget nativo `e-button` (o contenitore). `adattamenti.css` disegna l'icona con `::before` + `mask-image: url("data:image/svg+xml,...")` + `background-color: currentColor`. Vantaggi: pulsanti nativi modificabili in Elementor, eredità automatica del colore anche in `:hover`, zero file SVG in media, **0% di differenza pixel** verificato a 1440/390/320 px.
6. **Attributi non impostabili nei widget (`data-reveal`, `data-wipe`, `data-stagger`, `data-motivo`, `aria-*`, `role`):** gestiti in Fase 2 da `pizzuti.js` a partire dalle classi (esattamente come `artes-rev2.js`).

---

## 3. Che cosa aggiunge Elementor 4.4.2 al markup (osservato su bozza ID `40`)

Dall'ispezione reale di `https://dev1.minimalstudiodev.it/?elementor_preview_token=…` (`tools/out/parita/fase1-testata/dom-staging.json`):

1. **Wrapper e classi aggiunte:**
   - Radice documento: `<div data-elementor-type="wp-page" data-elementor-id="40" class="elementor elementor-40">`.
   - Ogni `e-div-block`: `elementor-element elementor-element-<hash> e-con e-atomic-element e-div-block-base e-default-<tag> <classi-globali>`.
   - Ogni widget foglia (`e-heading`, `e-paragraph`, `e-button`, `e-image`): **nessun div wrapper esterno** (HTML pulito!), classi `e-<tipo>-base e-default-<tag> <classi-globali>`.
   - `e-image` imposta `id="<attachment_id>"` (`id="13"`) ed emette `srcset` **senza attributo `sizes`** (e aggiunge `fetchpriority="high"` dal modulo Image Loading Optimization).
2. **Fogli CSS caricati da Elementor 4.4.2:**
   - `frontend.min.css`, `post-6.css` (kit), `post-40.css`, `base-desktop.css` (`.e-div-block-base { min-width:30px; padding:10px; display:block }`, ecc.), `base-mobile.css` (`@media(max-width:767px){ .e-grid-base { grid-template-columns: repeat(1, 1fr) } }`), `global-40-frontend-desktop.css` (solo le 26 classi usate nella pagina).
   - **2 richieste Google Fonts** (`Roboto` e `Roboto Slab`) emesse dal kit finché `google_font-enabled` è attivo → da spegnere in Fase 2.
3. **Interferenze del tema Twenty Twenty-Five:** `#global-styles-inline-css` e `#twentytwentyfive-style-inline-css` alterano peso/spaziatura dei pulsanti (`210px` invece di `211px`, `346px` invece di `348px`, `1,483%` diff a 1440px e `2,711%` sulla barra mobile). Con il tema rimosso (come farà `pizzuti-core` su Hello Elementor via `wp_dequeue_style`) la differenza scende a **`0,000%`**.

---

## 4. Esito della prova di conversione (bozza ID `40`)

- **CSS generato:** `node tools/port-css.js --out tools/out/pizzuti-prova.css` → `564` righe sorgente → `675` righe (`373` regole, `68` tag rimappati, `0` URL rotti, impronta `sha1 1b2e4d98f0`).
- **Conversione:** `node tools/prova-fase1.js --esegui` → `14` elementi atomici V4, `26` classi globali solo-etichetta, `0` avvisi di parsing, `0` avvisi di conversione, pagina creata **in bozza** (ID `40`).
- **Misura di parità (`node tools/verifica-fase1.js`):**

| Vista | Senza fogli tema (target `pizzuti-core`) | Con fogli Twenty Twenty-Five | Geometria (mockup vs staging) | Scroll X |
|---|---|---|---|---|
| **Hero `@1440px`** | `1440×719` vs `1440×719` (`Δh 0px`, **`0%` pixel diversi**) | `Δh 0px`, `1,483%` pixel diversi | H1 `640×255` (`76px`), CTA `211×61` e `348×61` identici | `0px` |
| **Hero `@390px`** | `390×659` vs `390×659` (`Δh 0px`, `5,154%` pixel diversi*) | `Δh 0px`, `7,616%` pixel diversi | H1 `350×134` (`40px`), CTA `350×60` identici | `0px` |
| **Barra contatti `@390px`** | `390×84` vs `390×84` (`Δh 0px`, **`0%` pixel diversi**) | `Δh 0px`, `2,711%` pixel diversi | Chiama `193×59`, WhatsApp `149×59` identici | `0px` |
| **Barra contatti `@320px`** | `320×84` vs `320×84` (`Δh 0px`, **`0%` pixel diversi**) | `Δh 0px`, `2,530%` pixel diversi | Chiama `154×59`, WhatsApp `118×59` identici | `0px` |

*\*Nota su Hero `@390px` (`5,154%`):* la geometria di tutti gli elementi è identica al pixel (`Δh 0px`, `Δw 0px`, H1 e bottoni identici). Lo scostamento residuo nasce da due cause verificate visivamente su `diff-hero@390.png`:
1. Elementor emette `srcset` senza `sizes`, quindi su 390px 1x Chrome scarica `mcp-upload-768x435.jpg` (ricompressa da GD e ingrandita per `object-fit: cover` su 659px di altezza) invece della `1414×801` originale → verrà risolto in Fase 2 da `pizzuti_optimize_elementor_images()` (stessa funzione di `artes-core` 1.0.2).
2. Nel mockup la hero sta sotto `<header>` con offset frazionario subpixel su `y` (sparisce quando l'header sarà presente in Fase 3).

**Esito Fase 1: VIA LIBERA** per la Fase 2 (plugin `pizzuti-core` 1.0.0 e caricamento media della proposta A), previa conferma delle azioni di ambiente.
