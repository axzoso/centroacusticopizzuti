# Piano di sviluppo WordPress — Centro Acustico Pizzuti

Istruzioni per l'agente (Antigravity) che porta su WordPress il mockup approvato. Il metodo è quello usato con successo sul sito ARTES
(repository locale `C:\Users\claan\Documents\github\artes`, da consultare e da cui copiare, **mai da modificare**).
Leggere tutto prima di iniziare. Lavorare in italiano: codice, commenti, documenti, messaggi.

---

## 0. Che cosa si porta su WordPress (e che cosa no)

**Solo la proposta A**, la prima sviluppata. La proposta B è stata **rifiutata dal cliente**: non va convertita, copiata o usata come
riferimento, nemmeno per singoli componenti.

| Proposta A — SI | Proposta B — NO (ignorare) |
|---|---|
| `mockup/src/pages/` tranne `proposta-b/` | `mockup/src/pages/proposta-b/` |
| `mockup/src/components/*.astro` | `mockup/src/components/b/` |
| `mockup/src/layouts/Base.astro`, `Page.astro` | `mockup/src/layouts/b/` |
| `mockup/src/styles/base.css`, `sections.css` | `mockup/src/styles/b.css` |
| `mockup/public/img/*.jpg/png` (non la sottocartella) | `mockup/public/img/b/` |
| `DESIGN.md`, `PRODUCT.md`, `src/copy/`, `src/config.ts` | `DESIGN-B.md`, `DESIGN-B.json`, `src/b/`, `scripts/check-b.mjs`, specifiche e piani "proposta-b" in `docs/superpowers/` |

Pagine della A (12): Home `/` · Il Centro `/chi-siamo/` · Apparecchi acustici `/apparecchi-acustici/` · Prezzi
`/apparecchi-acustici/prezzi/` · Servizi `/servizi/` · Controllo dell'udito `/servizi/controllo-udito/` · Riparazione e assistenza
`/servizi/riparazione-assistenza-apparecchi-acustici/` · Contatti `/contatti/` · Privacy `/privacy-policy/` · Cookie `/cookie-policy/` ·
Note legali `/note-legali/` · 404. **Gli indirizzi WordPress sono identici** a quelli del mockup.

Riferimento visivo = la build della A: `cd mockup && npm run build`, poi servire `mockup/dist/` (es. `npx serve dist -l 8765` oppure
`py -3 -m http.server 8765` dentro `dist`). È la **fonte di verità del design**: non modificare il mockup senza richiesta esplicita.

Documenti da leggere prima di iniziare: `PRODUCT.md`, `DESIGN.md`, `docs/avanzamento-sviluppo.md` (sezioni 2-6), `Proposta SiteMap
Pizzuti.docx.md`. Il brief è `Brief sito - Pizzuti.docx.md`. Sito **solo in italiano** (brief: "Multilingua: No").

---

## 1. Regole non negoziabili (lezioni di ARTES)

1. **Una fonte di verità per ogni cosa.** Design = build della A. Stile del sito = un CSS **generato** dal CSS del mockup dentro il
   plugin, mai scritto a mano. Contenuti = Elementor. Dati del Centro (telefono, indirizzo, orari, P.IVA, social) = **opzioni del
   plugin**, letti da header, footer, Contatti e dati strutturati tramite shortcode: mai scritti a mano in più punti.
2. **Il CSS personalizzato del kit Elementor resta vuoto.** Le classi globali di Elementor sono solo **etichette** (stessi nomi delle
   classi del mockup: `container`, `sec-head`, `lead`, `home-hero`…); lo stile vero arriva dal plugin. Gli adattamenti al markup di
   Elementor vanno in `tools/css/adattamenti.css`, con selettori `body.pizzuti .elementor …` e `:where()` per **non** battere le regole del
   mockup a parità di specificità (su ARTES questo errore è costato giorni).
3. **Prima la verifica, poi la modifica.** Ogni fase ha uno script che si vede fallire e poi passare. Nessun "fatto" senza l'output del
   comando nel messaggio.
4. **Ogni script che scrive sul sito** ha `--piano` (offline, mostra cosa farebbe), `--esegui` (con backup JSON in `tools/out/`) e
   `--rollback`; è idempotente. La pubblicazione è sempre opt-in (`--pubblica`): su ARTES una bozza di prova è finita online per errore.
5. **Niente credenziali nel repository**: né URL con password, né password applicazione, né token. Gli script le leggono dalla
   configurazione MCP locale o da un file locale ignorato da Git (§3). `tools/out/` è ignorata da Git, ma **nessuno strumento deve
   dipendere da file che stanno solo lì**.
6. **Niente contenuti inventati in produzione.** `config.ts` marca come `ESEMPIO` telefono, indirizzo, orari, P.IVA, social, prezzi: sul
   sito restano segnaposto riconoscibili, e la scheda Stato del plugin li segnala in rosso finché non sono sostituiti. Contenuti sanitari:
   nessuna promessa di risultato (vedi `PRODUCT.md`).
7. **Mobile vero**: verifiche a 1440 e 390 px (e 320 per la barra Chiama/WhatsApp), **0 px di scroll orizzontale**, emulazione di un
   telefono. Gli utenti sono adulti e anziani da smartphone: testi grandi come nel mockup, bersagli di tocco ampi.
8. **Mai** senza conferma dell'utente: cancellazioni definitive, cambi di impostazioni globali di WordPress, installazione o attivazione
   di plugin, pubblicazione di pagine, `git push`, commit non richiesti.
9. **Tracciare tutto**: ogni modifica a repo o WordPress va annotata in `docs/stato-sito.md` (ID, impostazioni: si sostituiscono le righe
   superate) e in `docs/diario.md` (voci di 5-10 righe con data). Aggiornare anche la sezione 6 di `docs/avanzamento-sviluppo.md`.

---

## 2. Ambiente WordPress

Staging: `<URL STAGING>` (da chiedere all'utente se non è nella configurazione MCP), **noindex** dal primo minuto (`blog_public = 0`).
Stack: WordPress + tema **Hello Elementor** + **Elementor** + **Elementor Pro** + **Novamira**. Niente JetEngine e niente WPML (non
servono: nessun tipo di contenuto personalizzato, una sola lingua). Plugin aggiuntivi solo con conferma: banner cookie (la mappa e i
contenuti di terzi lo richiedono), SMTP in produzione, backup.

### Connettori MCP
- **Elementor** (MCP ufficiale di Elementor): endpoint `https://<staging>/wp-json/elementor/mcp/`, autenticazione Basic con una password
  applicazione di WordPress. Serve a creare e modificare documenti Elementor (pagine, template del Theme Builder, classi globali).
- **Novamira**: via `npx -y @automattic/mcp-wordpress-remote@latest` con variabili `WP_API_URL`, `WP_API_USERNAME`, `WP_API_PASSWORD`.
  Lo strumento chiave è `mcp-adapter-execute-ability` con `ability_name: "novamira/execute-php"` e `parameters: { code }`: il codice PHP
  va **senza** `<?php` iniziale e restituisce il valore con `return`; l'output è troncato (prevedere un limite alzabile). Ha anche WP-CLI
  e upload di file (installazione dello ZIP del plugin).
- Se gli strumenti MCP non sono disponibili come strumenti nativi dell'agente, usare un **client Node** (vedi §3): su ARTES è stata la
  via più affidabile, una sessione per molte chiamate.
- Sola lettura = niente `update_*`, `delete_*`, `wp_insert_*`, `flush` nelle chiamate PHP.
- Dopo ogni scrittura via MCP svuotare le cache (CSS di Elementor + cache di WordPress), altrimenti si verifica la versione vecchia.

---

## 3. Struttura del repository da creare

```
wp/pizzuti-core/            plugin del sito (§4)
tools/
  README.md                 elenco comandi
  mcp-client.js             client MCP (da artes/tools/rev2/mcp-client.js)
  mcp.ps1, php.ps1, flush.php, install-plugin.ps1   (da artes/tools/)
  port-css.js               genera wp/pizzuti-core/pizzuti.css (§5)
  css/reset.css, css/adattamenti.css, css/immagini.json
  html2elementor.js, html-parse.js, cdp-session.js   (conversione e Chrome headless)
  verifiche: parita.js, png-diff.js, affianca.js, geometria.js, salute-pagine.js, verifica-seo.js,
             collaudo-redirect.js, collaudo-modulo.js, verifica-font.js, controllo-link.js
  out/                      ignorata da Git: backup, schermate, ZIP
docs/
  piano-wordpress.md        questo file
  stato-sito.md             ID di pagine e template, opzioni, impostazioni (creare)
  diario.md                 cronaca breve (creare)
  decisioni.md              decisioni tecniche della fase 1 (creare)
```

Tutti i file sotto `tools/` vengono da `C:\Users\claan\Documents\github\artes\tools\` e `tools\rev2\`: **copiarli e adattarli**
(nomi `artes`→`pizzuti`, classe del body `rev2`→`pizzuti`, URL di dev3 → staging, tolta la logica WPML/JetEngine). Il client di ARTES
legge le credenziali da `~/.claude.json` (server `artes-elementor` e `novamira-dev3-minimalstud`): qui va adattato per leggerle dalla
configurazione MCP di Antigravity o da `tools/.mcp-locale.json` (aggiungerlo a `.gitignore` **prima** di crearlo). Mai stampare le
credenziali nell'output.

Aggiungere a `.gitignore`: `tools/out/`, `tools/.mcp-locale.json`, `mockup/dist/`.

---

## 4. Il plugin `pizzuti-core` (versione di partenza 1.0.0)

Stessa architettura di `artes-core` 1.0.4 (`C:\Users\claan\Documents\github\artes\wp\artes-core\`: leggere `artes-core.php`,
`admin/artes-admin.php`, `LEGGIMI-MANUTENZIONE.md`). Si parte **vuoti** e si porta solo ciò che serve qui. Prefisso di funzioni, opzioni,
meta e shortcode: `pizzuti_` / `_pizzuti_`. Slug del menu: `pizzuti`.

```
wp/pizzuti-core/
  pizzuti-core.php          logica; intestazione con Version e costante PIZZUTI_CORE_VERSION
  admin/pizzuti-admin.php   menu di amministrazione e riquadro SEO negli editor
  pizzuti.css               GENERATO da tools/port-css.js (mai a mano)
  pizzuti.js                comportamento (menu mobile, FAQ, comparsa allo scroll, mappa a consenso…), scritto a mano
  fonts/                    Montserrat variabile woff2 (latin + latin-ext) + fonts.css
  icone/                    favicon, apple-touch-icon, icona 512 ricavate dal simbolo del logo (loghi/)
  LEGGIMI-MANUTENZIONE.md   guida per chi subentra, mostrata nella scheda Guida
```

### 4.1 Funzioni (in ordine di necessità)
1. **Caricamento** di `pizzuti.css` e `pizzuti.js` con `filemtime` come versione; classe `pizzuti` sul `<body>`; `fonts.css` con
   `preload` del file latin principale. **Zero richieste a Google Fonts** (anche da Elementor: disattivarne i Google Fonts).
2. **Dati del Centro** (opzione unica `pizzuti_dati`), modificabili dalla scheda omonima: nome, dottore, società, P.IVA, indirizzo,
   città, link Google Maps, telefono (visibile + `tel:`), WhatsApp (numero + testo precompilato), email, orari (righe giorni/ore),
   social (nome, URL), marchi trattati, interruttore **"mostra recensioni"** (come `SHOW_REVIEWS`) ed elenco recensioni. Valori iniziali
   = `mockup/src/config.ts`, con indicatore "esempio" per i campi marcati `ESEMPIO`. Shortcode:
   `[pizzuti_dato campo="telefono"]`, `[pizzuti_tel]` (link), `[pizzuti_whatsapp]` (link), `[pizzuti_orari]`, `[pizzuti_indirizzo]`,
   `[pizzuti_social]`, `[pizzuti_recensioni]`, `[pizzuti_anno]`. Header, footer, barra mobile e Contatti usano **solo** questi.
3. **SEO** (come ARTES): title e meta description per pagina nel riquadro "SEO Pizzuti" dell'editor (meta `_pizzuti_seo_title`,
   `_pizzuti_seo_description`), calcolati se vuoti; valori iniziali = quelli del mockup (title già sotto i 60 caratteri). Open Graph come
   nel mockup. **Dati strutturati `LocalBusiness`** (o sottotipo adatto) generati dai Dati del Centro, **solo** se nessun campo è ancora
   "esempio". Le FAQ del mockup (Apparecchi, Prezzi, Servizi) in JSON-LD `FAQPage` generate dal plugin, non scritte a mano. Se è attivo
   Yoast / Rank Math / AIOSEO il plugin si fa da parte da solo (niente title, description, OG, JSON-LD) e la scheda SEO mostra il pulsante
   **"Copia in Yoast"** (non sovrascrive campi già compilati).
4. **Moduli** (modulo Contatti di Elementor Pro):
   - anti-spam: campo **Honeypot come ULTIMO campo** del modulo (se sta prima del campo allegati, Elementor perde gli allegati senza
     errori) + limite di link per messaggio (opzione `pizzuti_antispam_max_link`, predefinito 3);
   - **modalità prova** (`pizzuti_prova_invio`): intercetta `pre_wp_mail`, non spedisce e registra le ultime 10 email
     (`pizzuti_prova_invio_log`) per collaudare senza scrivere al cliente;
   - **motivo precompilato** dal parametro `?motivo=` (valori del mockup: `ssn`, `auricolari`, `preventivo`, `assistenza`, `caro`),
     come `artes_form_preselection_data()`; consenso privacy con link a `/privacy-policy/`.
5. **Immagini**: `sizes` corretti per contesto, `loading="lazy"` fuori dalla prima schermata, `fetchpriority="high"` **solo**
   sull'immagine principale della pagina (codice ARTES 1.0.2-1.0.3: `artes_optimize_elementor_images()` sul filtro
   `elementor/frontend/the_content`; Elementor emette `srcset` senza `sizes` e il suo modulo LCP può duplicare `fetchpriority`).
6. **Mappa a consenso**: come `MapConsent.astro`, l'iframe di Google Maps si carica solo dopo il clic, con link "Apri in Google Maps".
7. **Pagina 404** nel design system, **redirect 301** gestiti dal plugin (indirizzi del vecchio sito, se l'utente li fornisce), **icone
   del sito** dal logo (script `favicon.py` di ARTES).
8. Catalogo dei testi `pizzuti_t( 'Testo', 'chiave' )` per le frasi che il plugin stampa (pronto per eventuali traduzioni future).

### 4.2 Menu di amministrazione "Centro Pizzuti"
Voce di primo livello (`add_menu_page`, capacità `manage_options`, icona dashicons, posizione 3) con schede `?tab=`, salvataggi via
`admin-post.php` con nonce, messaggi di conferma, stile minimo dentro la pagina (modello: `admin/artes-admin.php`).

| Scheda | Contenuto |
|---|---|
| **Stato** | Controlli verde/rosso/giallo: caratteri locali presenti, CSS generato presente (con peso), CSS del kit Elementor vuoto, noindex (giallo in staging, deve sparire in produzione), plugin SMTP attivo, modalità prova spenta, **honeypot ultimo campo** in ogni modulo, **Dati del Centro ancora "esempio"** (rosso), pagine legali ancora in bozza di esempio, plugin cookie attivo, Yoast attivo. Sotto: tabella dei template del Theme Builder (nome, ID, tipo, stato, condizioni, link "Modifica con Elementor") |
| **Dati del Centro** | Il modulo del §4.1 punto 2, con l'elenco degli shortcode disponibili |
| **SEO** | Stato del plugin SEO esterno + "Copia in Yoast"; spiegazione del riquadro "SEO Pizzuti" e dei valori calcolati; interruttore dati strutturati |
| **Moduli** | Link massimi, modalità prova, svuota registro, tabella delle email intercettate, dove si cambiano destinatario e campi |
| **Stile** | Come è fatto lo stile (CSS generato, classi = etichette, kit vuoto) + textarea **CSS aggiuntivo** (`pizzuti_css_aggiuntivo`, caricato dopo il CSS del sito) |
| **Manutenzione** | Svuota cache (Elementor + WordPress), rigenera permalink, elenco delle pagine in bozza con "Pubblica", istruzioni per aggiornare il plugin |
| **Guida** | `LEGGIMI-MANUTENZIONE.md` reso in HTML (scritta per il cliente o per chi subentra, non per sviluppatori) |

### 4.3 Rilascio
- Versione aumentata a **ogni** modifica (intestazione + costante) e annotata nel diario.
- `tools/install-plugin.ps1` (solo da PowerShell): ZIP con barre `/` (non `Compress-Archive`, che su ARTES produceva barre rovesciate)
  in `tools/out/pizzuti-core.zip`, upload, installazione via WP-CLI con sostituzione, verifica della versione attiva, svuota cache.
  In produzione si carica lo stesso ZIP.
- `node tools/push-asset.js pizzuti.css|pizzuti.js` per il giro veloce su CSS/JS senza reinstallare.
- `php -l` su ogni file PHP prima di impacchettare.

---

## 5. Stile: dal mockup al CSS del plugin

- `tools/port-css.js` (da `artes/tools/rev2/port-css.js`) genera `wp/pizzuti-core/pizzuti.css` concatenando: `tools/css/reset.css`
  (azzera i margini e gli stili di Hello Elementor/Elementor che interferiscono) + `mockup/src/styles/base.css` + `sections.css` +
  gli stili `<style is:global>` delle pagine Astro della A (es. `pages/index.astro`) + `tools/css/adattamenti.css`. Prefissa i selettori
  con `body.pizzuti` dove serve, riscrive gli `url()` delle immagini verso la Libreria media con la mappa versionata
  `tools/css/immagini.json` e **si ferma con errore** se ne manca una. Intestazione con impronta del contenuto (non l'hash del commit).
- Prima di scrivere il convertitore, **censire** gli stili che dipendono dal markup di Astro: selettori su tag nudi (es.
  `.home .home-hero h1`), eventuali stili con ambito (`data-astro-cid-*`), `:root` e token. Annotare in `docs/decisioni.md` come vengono
  mappati sul markup di Elementor (classe sul widget, `adattamenti.css`).
- Token di `DESIGN.md` (colori, tipografia, spaziature) = variabili CSS in `:root`; **non** duplicarli nei colori/caratteri globali del
  kit Elementor (il kit resta neutro).
- Animazioni: comparsa allo scroll, svelatura delle foto, hover dei box come nel mockup, rispettando `prefers-reduced-motion`; il
  JavaScript del mockup diventa `pizzuti.js` (nessuna libreria).

---

## 6. Fasi di lavoro

### Fase 1 — Preparazione e prova tecnica (prima di costruire pagine)
1. Verificare i due connettori: elencare gli strumenti dell'MCP di Elementor e annotare in `docs/decisioni.md` che cosa crea
   (documenti, template, classi globali, variabili), in che formato (JSON di Elementor: widget **atomici** di Elementor 4 o classici?),
   se pubblica o salva in bozza.
2. Leggere su staging versioni di WordPress, tema, Elementor, Elementor Pro, Novamira, impostazioni di permalink e lettura.
   Scriverle in `docs/stato-sito.md`.
3. **Prova di conversione** con la sola testata della home (hero + barra contatti): costruirla in una pagina di prova **in bozza** via
   MCP, caricare un primo CSS generato, misurare la parità a pixel con la build del mockup. Annotare che cosa Elementor aggiunge al markup
   (contenitori, classi, attributi): diventa la base di `adattamenti.css` e del convertitore. Poi cestinare la pagina di prova (con
   conferma).

### Fase 2 — Plugin e stile
Plugin 1.0.0 con le funzioni 1-4 del §4.1 e il menu completo; `port-css.js`; caratteri locali; installazione; scheda Stato tutta
verde/gialla tranne i dati "esempio". Media: caricare in Libreria le immagini della A (`mockup/public/img/` senza `b/`, `mockup/public/logos/`)
con alt dal mockup; creare la mappa `tools/css/immagini.json`.

### Fase 3 — Header, footer e template
Theme Builder di Elementor Pro: **Header** (logo, menu da `NAV` come menu di WordPress, telefono/CTA), **Footer** (colonne da `FOOTER`,
contatti e orari da shortcode, legali, anno da shortcode), **barra mobile Chiama/WhatsApp**, **404**. Tutti in bozza fino alla verifica,
condizioni impostate (`include/general`), pubblicazione solo con conferma. Markup identico in tutte le pagine.

### Fase 4 — Pagine
Le 12 pagine del §0, una alla volta, convertite dalla build della A con il metodo di ARTES (`html2elementor.js`: HTML della sezione →
JSON di Elementor con le stesse classi; testi presi dal mockup, cioè da `src/copy/`). Ogni pagina nasce **in bozza**, con title e
description SEO compilati. Per ognuna, prima di passare alla successiva: parità a pixel a 1440 e 390, salute, SEO. Dopo la conversione le
pagine si modificano **in Elementor**: gli script di costruzione non si rilanciano su pagine già pubblicate o ritoccate a mano.
Modulo Contatti: Elementor Pro Form con i campi del mockup, motivo precompilato, consenso privacy, **Honeypot ultimo**; collaudo con
`collaudo-modulo.js` in modalità prova.

### Fase 5 — Verifiche complete e consegna in staging
Tutte le verifiche del §7 verdi; `LEGGIMI-MANUTENZIONE.md` scritta; `docs/stato-sito.md` con tutti gli ID; voce di diario. Pubblicazione
delle pagine solo dopo conferma dell'utente.

### Fase 6 — Pre-lancio (decisioni del cliente, non anticipare)
Dati reali al posto degli esempi (la scheda Stato deve diventare verde), testi legali verificati da un consulente, banner cookie,
dominio definitivo, SMTP (WP Mail SMTP), `/favicon.ico` in radice, togliere noindex, sitemap, Search Console, Google Business Profile con
gli stessi dati del sito, backup completo.

---

## 7. Verifiche (dopo ogni modifica al sito)

Script Node 22 senza dipendenze + Chrome headless (`cdp-session.js`), copiati da ARTES e adattati. Escono con codice 1 se qualcosa non
va. Riportare sempre l'output.

| Comando | Controlla |
|---|---|
| `node tools/parita.js <nome> http://localhost:8765/<percorso>/ https://<staging>/<percorso>/` | % di pixel diversi, Δ altezza, scroll orizzontale, elemento che differisce (1440 e 390) |
| `node tools/salute-pagine.js <percorsi…>` | un solo H1, title presente, immagini rotte, errori console, richieste 4xx/5xx, scroll orizzontale a 1440/390/320 |
| `node tools/verifica-seo.js` | 12 pagine: HTTP 200, title e description attesi e unici, H1, alt |
| `node tools/controllo-link.js` | link interni (nessun 404, nessun link verso `/proposta-b/`) |
| `node tools/collaudo-redirect.js` | 301 previsti, 404 corretta, bozze non raggiungibili |
| `node tools/collaudo-modulo.js` | invio reale del modulo **senza email** (modalità prova), honeypot, anti-spam, motivo precompilato |
| `node tools/verifica-font.js` | 0 richieste a Google Fonts |
| nuovo: `node tools/verifica-contenuti.js` | segnaposto "ESEMPIO" o "[da fornire]" ancora presenti, recapiti uguali in header/footer/contatti, anno corrente, nessun riferimento alla proposta B |

Obiettivi: parità con Δ altezza ≈ 0 e differenze solo di antialiasing; 0 px di scroll orizzontale; 0 errori console; contrasti AA
(già calcolati nel mockup: non peggiorarli); home leggera (su ARTES 620 KB a 1440).

---

## 8. Insidie note (da ARTES)

- **Windows**: gli script `.ps1` si lanciano da PowerShell. In Git Bash gli argomenti che iniziano con `/` diventano percorsi
  (`MSYS_NO_PATHCONV=1`) e le barre rovesciate in heredoc e `sed` si perdono: file con regex o apici si scrivono con gli strumenti di
  scrittura di file, poi `php -l` / `node --check`.
- PHP via Novamira: niente `<?php`, si usa `return`; output troncato; JSON grandi → scriverli su file sul server o paginare.
- Cache: dopo ogni scrittura via MCP svuotare la cache CSS di Elementor, altrimenti la verifica guarda la versione vecchia.
- Elementor: `srcset` senza `sizes`, `fetchpriority` duplicato dal modulo di ottimizzazione, wrapper aggiuntivi attorno ai widget, stili
  predefiniti del kit (colori e caratteri globali): neutralizzarli in `reset.css`, non con `!important` sparsi.
- Honeypot prima del campo allegati = allegati persi senza errori (la scheda Stato lo controlla).
- Link di anteprima delle bozze: firmati e a scadenza, generarli al momento.
- File generati: niente hash del commit nell'intestazione (cambia a ogni commit), usare l'impronta del contenuto.

---

## 9. Come riferire all'utente

Alla fine di ogni fase: cosa è stato fatto, ID creati, output delle verifiche (numeri, non "tutto ok"), cosa resta, decisioni che servono.
Chiedere conferma prima di: installare o attivare plugin, pubblicare, cancellare, cambiare impostazioni globali, fare commit o push.
