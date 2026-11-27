# Stato del sito (staging) — aggiornato al 2026-11-27

Staging: `https://dev1.minimalstudiodev.it/` · Sito solo in italiano (`it_IT`), **solo proposta A** del mockup.

## Ambiente e versioni

| Componente | Valore attuale | Note |
|---|---|---|
| WordPress | `7.1.5` | Locale `it_IT`, multisito: No |
| Server / PHP / DB | Linux, LiteSpeed · PHP `8.3.37` · MariaDB `10.11.19` | Memory limit WP `40M` (PHP `512M`), max upload `64 MB`, GD e ZIP attivi |
| Tema attivo | **Hello Elementor `3.5.2`** | Fogli del tema disaccodati sul frontend da `pizzuti-core` |
| Elementor | `4.4.2` (attivo) | Editor atomico V4 **attivo**; Kit attivo **ID `6`** (CSS personalizzato **vuoto**) |
| Elementor Pro | `4.4.2` (attivo) | Licenza attiva, piano **Expert**; `theme_builder_v2` attivo |
| Novamira | `2.0.0` (attivo) | CLI `@novamira/cli` `1.4.0` autenticato via OAuth (profilo `dev1.minimalstudiodev.it`) |
| **`pizzuti-core`** | **`1.0.4` (attivo)** | Menu **Centro Pizzuti** (7 schede), riquadro **SEO Pizzuti**, `pizzuti.css` generato (`79 KB`, `sha1 20c6eebcf8`), `pizzuti.js` (toggle `.m-menu`, `body#top`, animazioni scroll, `?motivo=`, mappa a consenso con `mappa_embed_url` da `pizzuti_dati`), Montserrat Variable locale (`woff2`), icone favicon, 16 shortcode `[pizzuti_*]`, 5 posizioni menu registrate, supporto anteprima MCP `error-404`, anti-spam moduli (limite link), modalità prova invii, ottimizzazione `sizes`/`fetchpriority` |

## Impostazioni WordPress ed Elementor

| Impostazione | Stato attuale | Note |
|---|---|---|
| Indicizzazione (`blog_public`) | **`0` (`noindex, nofollow`)** | Corretto in staging; da rimuovere solo al lancio |
| Permalink | **`/%postname%/`** | Allineato agli URL del mockup |
| Fuso orario | **`Europe/Rome`** | — |
| Titolo / Motto | `Centro Acustico Pizzuti` / `Ascolto su misura · Cosenza` | — |
| Elementor Google Fonts | **Spento** (`elementor_google_font = 0` + filtro plugin) | Verificato: **0 richieste a Google Fonts** |
| Kit Elementor (`ID 6`) | CSS personalizzato **vuoto** · **187** classi globali "solo etichetta" (`--p: 0;`) · **0** variabili globali | — |
| Opzioni plugin `pizzuti-core` | `pizzuti_dati` (default `config.ts`, 7 campi ancora marcati `esempio`), `pizzuti_antispam_max_link` (`3`), `pizzuti_prova_invio` (`0`), `pizzuti_seo_schema` (`1`, sospeso finché restano campi esempio), `pizzuti_css_aggiuntivo` (`""`) | — |

## Menu WordPress (Aspetto → Menu)

| ID | Slug | Nome | Voci | Usato da |
|---|---|---|---|---|
| `3` | `menu-principale` | Menu principale | 4 (Il Centro, Apparecchi acustici, Servizi, Contatti) | Header `#122` (desktop) |
| `4` | `menu-mobile` | Menu mobile | 5 (Home + 4 voci principali) | Header `#122` (pannello mobile `.m-menu`) |
| `5` | `footer-il-centro` | Footer Il Centro | 5 (Home, Il Centro e il Metodo, Apparecchi acustici, Prezzi, Contatti) | Footer `#125` (col. 2) |
| `6` | `footer-servizi` | Footer Servizi | 4 (Tutti i servizi, Controllo dell'udito, Riparazione e assistenza, Auricolari su misura) | Footer `#125` (col. 3) |
| `7` | `footer-legali` | Footer Legali | 3 (Privacy Policy, Cookie Policy, Note legali) | Footer `#125` (riga inferiore) |

## Template Theme Builder (Elementor Pro)

| ID | Titolo | Tipo Theme Builder | Stato | Condizione di visualizzazione | Note |
|---|---|---|---|---|---|
| `122` | Header Pizzuti | `header` | **`publish`** | `include/general` | 11 elementi, 2 widget `nav-menu` (`menu-principale`, `menu-mobile`), CTA telefono dinamica |
| `125` | Footer Pizzuti | `footer` | **`publish`** | `include/general` | 50 elementi, 3 widget `nav-menu` (`footer-il-centro`, `footer-servizi`, `footer-legali`), contatti/orari/social/copyright da `[pizzuti_*]` |
| `128` | Barra mobile Chiama/WhatsApp | `floating-buttons` | **`publish`** | `include/general` | 3 elementi (Chiama + WhatsApp dinamici da `[pizzuti_*]`, visibile `<900px`, `display: none` su desktop) |
| `133` | Errore 404 Pizzuti | `error-404` | **`publish`** | `include/singular/not_found404` | 29 elementi, testo 404 + CTA Home/Chiama dinamica + 4 link utili |

## Pagine e articoli (11 pagine proposta A in bozza; la 12ª è il template 404 `#133`)

| ID | Titolo | Percorso atteso | Parent | Stato | Elementi | Note |
|---|---|---|---|---|---|---|
| `254` | Home | `/` | — | `draft` | 153 | Include modulo `e-form` (honeypot ultimo) e recensioni; da impostare come `page_on_front` alla pubblicazione |
| `268` | Il Centro e il Metodo | `/chi-siamo/` | — | `draft` | 88 | — |
| `274` | Apparecchi acustici | `/apparecchi-acustici/` | — | `draft` | 141 | 5 FAQ `e-accordion` (`FAQPage` JSON-LD attivo) |
| `280` | Prezzi | `/apparecchi-acustici/prezzi/` | `#274` | `draft` | 105 | 3 FAQ `e-accordion` (`FAQPage` JSON-LD attivo) |
| `286` | Servizi | `/servizi/` | — | `draft` | 79 | — |
| `292` | Controllo dell’udito | `/servizi/controllo-udito/` | `#286` | `draft` | 96 | 4 FAQ `e-accordion` (`FAQPage` JSON-LD attivo) |
| `298` | Riparazione e assistenza | `/servizi/riparazione-assistenza-apparecchi-acustici/` | `#286` | `draft` | 97 | 3 FAQ `e-accordion` (`FAQPage` JSON-LD attivo) |
| `304` | Contatti | `/contatti/` | — | `draft` | 107 | Include modulo `e-form` (honeypot ultimo) e mappa Google a consenso |
| `3` | Privacy Policy | `/privacy-policy/` | — | `draft` | 76 | Bozza predefinita WP convertita in Elementor V4 (testo bozza da validare prima del lancio) |
| `315` | Cookie Policy | `/cookie-policy/` | — | `draft` | 42 | Testo bozza da validare prima del lancio |
| `321` | Note legali | `/note-legali/` | — | `draft` | 48 | Testo bozza da validare prima del lancio |

*Nel cestino (recuperabili):* pagina di prova Fase 1 `#40` (`[Prova Fase 1] Testata Home`), post predefinito `#1` (`Hello world!`).

## Libreria media (19 immagini — **tutte le foto sono placeholder non definitive** da sostituire con quelle approvate prima della produzione; mappa in `tools/css/immagini.json`)

| ID | File (`wp-content/uploads/2026/11/`) | Alt |
|---|---|---|
| `45` | `studio-ufficio.jpg` | Il Dott. Pasqualino Pizzuti alla scrivania del suo studio |
| `46` | `dottore-ritratto.jpg` | Ritratto del Dott. Pasqualino Pizzuti, audioprotesista a Cosenza |
| `47` | `dottore-studio.jpg` | Il Dott. Pizzuti alla sua scrivania nel Centro |
| `48` | `dottore-apparecchio.jpg` | Il Dott. Pizzuti mostra un apparecchio acustico |
| `49` | `regolazione-orecchio.jpg` | Regolazione di un apparecchio acustico durante una visita |
| `50` | `visita-audiogramma.jpg` | Il Dott. Pizzuti mostra a una paziente l’esito del controllo sul monitor |
| `51` | `vetrina-centro.jpg` | L’ingresso del Centro Acustico Pizzuti, con il Dott. Pizzuti sulla porta |
| `52` | `apparecchi-quaderno-rosso.jpg` | Apparecchi acustici e custodia su una scrivania |
| `53` | `apparecchio-mano-arancio.jpg` | Una mano apre la custodia di un apparecchio acustico |
| `54` | `auricolari-su-misura.jpg` | Due auricolari su misura, uno blu e uno rosso |
| `55` | `prova-mani-custodia.jpg` | Due mani estraggono un apparecchio acustico dalla custodia |
| `56` | `familiare-supporto.jpg` | Un giovane accompagna un familiare anziano durante la prova di un apparecchio |
| `57` | `senior-apparecchio.jpg` | Un uomo con un apparecchio acustico durante una conversazione |
| `136` | `nonno-nipote.jpg` | Un nonno sorridente con il nipotino in braccio (placeholder per Controllo dell'udito) |
| `137` | `telefono-sorriso.jpg` | Una signora sorride al telefono (placeholder per Contatti) |
| `58` | `badge-google.png` | Valutazione Google 5.0 su 5 |
| `59` | `logo-color.png` | Centro Acustico Pizzuti |
| `60` | `logo-white.png` | Centro Acustico Pizzuti |
| `61` | `mark-color.png` | Simbolo Centro Acustico Pizzuti |

*Media rimosso:* `#13` (`mcp-upload.jpg` temporaneo della Fase 1).

## Backup e tracciamento

- Backup JSON in `tools/out/` (non versionato): `prova-fase1-backup.json`, `import-media-backup.json`, `pizzuti-core.zip`, `menu-backup.json`, `fase3-backup.json`, `fase3-template.json`, `fase4-backup.json`, `fase4-pagine.json`, `parita/fase4/riepilogo-fase4.json`.
- Novamira journal `group_id`: `760f93789035334fcc6663a3c792507a` (staging Fase 2), `f757423e8720c2f6ad60e0e70c9e5993` (menu WP in `#122`/`#125`), `89c9ff5189176053159da7ad1ad125b9` (`_elementor_edit_mode=builder` su `#3`).
