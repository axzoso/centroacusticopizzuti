# Centro Acustico Pizzuti · Avanzamento sviluppo

Ultimo aggiornamento: 23 novembre 2026

Obiettivo attuale: completare tutto il sito in Astro, visibile con `npm run dev`, e farlo validare dal cliente. Il passaggio a WordPress (Elementor Pro, MCP, Novamira) viene dopo e non è ancora iniziato.

Legenda: ✅ fatto · 🟡 in corso · ⬜ da fare · ❓ bloccato da una decisione o da un contenuto

---

## 1. Come vedere il lavoro

```
cd mockup
npm run dev          # http://localhost:4321
npm run dev:rete     # stessa cosa, raggiungibile da altri dispositivi in rete (es. telefono)
```

Cartella di lavoro: `mockup/`. Documenti di riferimento nella cartella principale: `PRODUCT.md` (contesto prodotto), `DESIGN.md` (sistema di design), brief, sitemap e brandbook originali.

---

## 1b. Proposta B (seconda veste grafica)

Seconda proposta grafica di tutto il sito, da mostrare al cliente accanto alla A. Ispirata ad AudioNova e Amplifon (card a foto con sfumatura, testata con foto che sfuma nel blu, testate interne con box bianco sovrapposto, carosello del metodo, fasce piene), con colori, font e testi Pizzuti.

- Indirizzo: `http://localhost:4321/proposta-b/` (stesso `npm run dev`). Dal footer della B, "Vedi la proposta A" riporta a `/`.
- Pagine: tutte le 11 della A (home, Il Centro, Apparecchi, Prezzi, Servizi, Controllo, Riparazione, Contatti, 3 legali). La 404 resta unica.
- Testi condivisi con la A (`src/copy/`, `src/config.ts`): una correzione vale per entrambe.
- File della B: `src/pages/proposta-b/`, `src/components/b/`, `src/layouts/b/`, `src/styles/b.css`, `src/b/link.ts`. Nessun file della A è stato modificato.
- Foto stock (Unsplash) in `public/img/b/`, crediti in `public/img/CREDITS.md`.
- Controlli: `npm run test:b` (link interni), `npm run check:b` (build + 11 pagine, un H1, nessun link che esce dalla B, noindex).
- Documenti: spec `docs/superpowers/specs/2026-11-23-proposta-b-design.md`, piano `docs/superpowers/plans/2026-11-23-proposta-b.md`, sistema grafico `DESIGN-B.md`.

---

## 2. Pagine (dalla sitemap)

| Pagina | URL proposto | Stato | Note |
|---|---|---|---|
| Home | `/` | ✅ mockup validato | Versione "Il volto" scelta dall'utente. Mancano contenuti definitivi (vedi sezione 5). |
| Il Centro e il Metodo | `/chi-siamo/` | ✅ mockup pronto | Racconta il Dott. Pizzuti e il percorso. Esperienza dal 1999 del Dottore, non apertura del Centro. |
| Apparecchi acustici | `/apparecchi-acustici/` | ✅ mockup pronto | Tipologie, scelta, prova, personalizzazione. Niente catalogo. Sezione SSN dentro la pagina. |
| Servizi per l'udito | `/servizi/` | ✅ mockup pronto | Hub che porta alle due sottopagine. Sezione Auricolari su misura dentro la pagina. |
| Controllo dell'udito | `/servizi/controllo-udito/` | ✅ mockup pronto | Solo prestazioni confermate. |
| Riparazione e assistenza | `/servizi/riparazione-assistenza-apparecchi-acustici/` | ✅ mockup pronto | Per chi ha già un apparecchio. |
| Contatti | `/contatti/` | ✅ mockup pronto | Telefono, WhatsApp, recapiti, orari, mappa, form. |
| Prezzi (condizionata) | `/apparecchi-acustici/prezzi/` | ✅ mockup pronto (contenuti e cifre di esempio) | Si fa solo se ci sono informazioni concrete e verificabili su prezzi, criteri di costo, preventivo e servizi inclusi. |
| Pagine legali | `/privacy-policy/`, `/cookie-policy/`, `/note-legali/` | ✅ bozze di esempio | Testi modello da far verificare a un consulente legale/DPO. |
| Pagina 404 | `/404` | ✅ | "Come? Questa pagina non l'ho sentita." |

Totale pagine di lancio: 7 core, più privacy e cookie.

---

## 3. Elementi condivisi del sito

| Elemento | Stato | Note |
|---|---|---|
| Token di design (colori, font, scala tipografica) | ✅ | In `mockup/src/styles/base.css`, descritti in `DESIGN.md`. |
| Header con menu | ✅ | Voci da `NAV` in `config.ts`, pagina corrente evidenziata. |
| Footer completo | ✅ | Brand e social, colonne Il Centro e Servizi, contatti, orari in colonna, riga legale con Privacy, Cookie, Note legali. |
| Barra fissa mobile Chiama / WhatsApp | ✅ | |
| Form di contatto | 🟡 | Mockup (non invia). Link all'informativa privacy nel consenso; motivo precompilato dai link (`?motivo=ssn`, `auricolari`, `preventivo`, `assistenza`, `caro`). Invio reale da fare in WordPress. |
| Sezione recensioni | ✅ | Visibile con testimonianze inventate (`SHOW_REVIEWS`, `RECENSIONI` in `config.ts`). |
| Breadcrumb | rimossi | Su richiesta del cliente. |
| Libreria di sezioni | ✅ | `styles/sections.css`, `Section.astro`, `PageHero.astro` (arch, bleed, center, wide), `CtaBand`, `Faq`. Toni di sfondo, impianti (split, center, wide, feature, statement) e contenuti (elenco, box, passi orizzontali, tessere ad arco, pannello, chip) alternati pagina per pagina. |
| Animazioni | ✅ | Poche: comparsa allo scroll con sfalsamento, svelatura delle foto grandi, hover dei box. Rispettano `prefers-reduced-motion`. |
| Mappa | ✅ | Si carica solo dopo il clic (consenso cookie), con link "Apri in Google Maps". |

---

## 4. Requisiti trasversali (da sitemap e brief)

- ✅ Un solo H1 per pagina, gerarchia dei titoli senza salti, title e description unici (title accorciati sotto i 60 caratteri), alt su tutte le immagini, nessun link interno rotto (verificato sulla build).
- ⬜ Collegamenti interni secondo la tabella della sitemap.
- ✅ Mobile: verificate tutte le pagine a 390px, nessuno scorrimento orizzontale. Contrasti calcolati (minimo 4,5:1 per il testo piccolo).
- ⬜ Dati strutturati LocalBusiness, solo con dati verificati.
- ⬜ Contenuti sanitari senza promesse di risultato non dimostrabili.
- ⬜ Toni: il Dottore parla in prima persona e dà del "tu".
- ✅ Accessibilità (verifiche automatiche): reflow a 320px e zoom 200% senza scorrimento orizzontale, ordine di tabulazione logico, nessun link o bottone senza nome, nessun `tabindex`, link esterni annunciati come "nuova scheda". Da fare a mano prima della pubblicazione: prova reale con VoiceOver/TalkBack.
- ⬜ Banner cookie con consenso (da fare in WordPress con un plugin dedicato).
- ⬜ Rimuovere `noindex` solo al momento della pubblicazione.

---

## 5. Contenuti e decisioni aperte (servono dal cliente)

| Cosa | Stato |
|---|---|
| Numero di telefono, indirizzo, orari | ✅ per ora esempi inventati (`config.ts`), da sostituire |
| Foto reali del Dott. Pizzuti, dello studio, delle visite | ✅ inserite dalla cartella `Foto/` (13 ottimizzate in `mockup/public/img/`). Da verificare i diritti sulle immagini dei produttori (Signia, Bernafon) |
| Testi definitivi, soprattutto la citazione e il racconto del Dottore | ❓ oggi proposta di copy |
| Servizi (Auricolari su misura, Contributi SSN) | ✅ confermati dal cliente. Da togliere i tag "da confermare" dalla home |
| Marchi | 🟡 Signia e Bernafon (dalle foto fornite): da completare |
| Priorità tra telefono, WhatsApp e form | ❓ ipotesi del brief: telefono, WhatsApp, form |
| Pagina Prezzi | ✅ da fare con contenuti inventati di esempio |
| Testimonianze | ✅ due recensioni Google reali dagli screenshot forniti, con il badge 5.0; da confermare l'uso con nome abbreviato |
| Dominio, hosting, Google Business Profile, Search Console, GA4 | ❓ dal brief: dominio e hosting esistono; GA4 e Search Console no |

---

## 6. Preparazione a WordPress (solo predisposizione, nessuno sviluppo ora)

Regole da rispettare mentre si sviluppa in Astro, così il passaggio dopo sarà più diretto:

- Colori, font e misure restano variabili CSS in `:root` (diventeranno `theme.json`). Nessun valore sparso nelle pagine.
- Ogni sezione è un blocco autonomo con la propria struttura (diventerà un template o un widget in Elementor Pro).
- I testi stanno in un file separato (`mockup/src/copy/` (un file per pagina)), non dentro il markup.
- Nessuna libreria JavaScript pesante: solo il minimo, così si replica facilmente in WordPress.
- Immagini in `mockup/public/img/` con crediti in `CREDITS.md`.

Stato dell'ambiente WordPress (aggiornato 2026-11-27, Fase 4 completata in bozza — solo proposta A):

- ✅ Staging configurato su `https://dev1.minimalstudiodev.it/` (WordPress 7.1.5, PHP 8.3.37, tema **Hello Elementor 3.5.2**, Elementor + Pro 4.4.2 Expert V4, Novamira 2.0.0, `noindex` attivo, permalink `/%postname%/`, fuso `Europe/Rome`, Google Fonts Elementor spenti).
- ✅ Plugin **`pizzuti-core` 1.0.4** installato e attivo: CSS generato da `tools/port-css.js` (`sha1 20c6eebcf8`), Montserrat Variable servito in locale (**0 richieste a Google Fonts**), favicon dal logo, 16 shortcode Dati del Centro, 5 posizioni menu, SEO + compatibilità Yoast, anti-spam e modalità prova moduli, menu **Centro Pizzuti** (7 schede, Stato tutta verde/gialla tranne i 7 dati "esempio").
- ✅ Libreria media popolata con **19 immagini placeholder** (`#45`–`#61`, `#136`–`#137`, mappa in `tools/css/immagini.json`, da sostituire con le foto definitive approvate prima della produzione).
- ✅ Fase 3 **pubblicata**: 5 menu WordPress (`#3`–`#7`) + 4 template Theme Builder Elementor Pro (`#122` Header, `#125` Footer, `#128` Barra mobile, `#133` Errore 404).
- ✅ Fase 4 completata **in bozza** (in attesa di conferma per pubblicazione e `page_on_front`): tutte le **11 pagine WordPress** della proposta A (`#254`, `#268`, `#274`, `#280`, `#286`, `#292`, `#298`, `#304`, `#3`, `#315`, `#321`), 100% atomiche V4, moduli `e-form` di Home e Contatti collaudati (6/6 scenari verdi, honeypot ultimo campo), FAQ `e-accordion` con `FAQPage` JSON-LD, 11/11 verificate per parità/SEO/salute.
- ⬜ Fase 5: pubblicazione in staging (con conferma), impostazione Home statica e verifiche finali su URL reali (link interni, contenuti, salute, consegna staging).

---

## 7. Prossimi passi

1. Revisione mobile di tutte le pagine, SEO e accessibilità.
3. Validazione del cliente.
4. Revisione finale su desktop e mobile e validazione del cliente.
5. Solo dopo: piano di sviluppo su WordPress.

---

## 8. Registro delle modifiche

| Data | Cosa |
|---|---|
| 2026-11-17 | Quattro mockup della home (A1, A2, C1, C2). Scelta A2. |
| 2026-11-17 | Copy della home in prima persona con "tu"; esperienza dal 1999 attribuita al Dottore; sezione del percorso in due colonne; foto stock al posto dei segnaposto. |
| 2026-11-17 | Layout comune pagine interne, footer completo, pagine Il Centro e il Metodo e Apparecchi acustici. Dati di esempio in `config.ts`. |
| 2026-11-17 | Footer riordinato (tolta colonna Apparecchi, orari in linea). Pagine Servizi, Controllo dell'udito, Riparazione e assistenza, Contatti, Prezzi. Home collegata, tag "da confermare" rimossi. |
| 2026-11-17 | Pagine Privacy Policy, Cookie Policy, Note legali (bozze) e pagina 404. |
| 2026-11-17 | Rimossi i breadcrumb. Nuova libreria di sezioni con più toni, impianti e contenuti per distinguere i blocchi su desktop; animazioni leggere allo scroll. Tutte le pagine riorganizzate. |
| 2026-11-17 | Inserite le foto reali del cliente (ritratto, studio, visita, prodotti, vetrina) al posto delle foto stock; recensioni Google reali; marchi Signia e Bernafon. |
| 2026-11-17 | Revisione pagine: corretto "[object Object]" negli orari della home, overflow orizzontale in Contatti su mobile, onda sovrapposta al testo nella fascia finale, bottone Chiama troppo lungo su mobile, contrasto di testi su tessere e box scuri, title troppo lunghi. |
| 2026-11-17 | Corretti: foto con svelatura che non comparivano mai (sezione vuota in Il Centro, testate di Apparecchi e Servizi); testo delle sezioni con foto a bordo non allineato al contenitore; sezioni "titolo a sinistra" finite in colonna singola su desktop; box da 4 di larghezze diverse. Verificato scorrendo le pagine come un utente (desktop 1440 e mobile 390). |
| 2026-11-17 | Controlli finali: form con motivi precompilati e link alla privacy, mappa a consenso, sezione "Come arrivare" completata, social non più a `#`, barra mobile corretta a 320px, testi di box/tessere/passi portati a 20px, griglie da 5 box senza buchi, meta Open Graph, CSS inutilizzato rimosso, `DESIGN.md` aggiornato al sistema attuale. |
| 2026-11-17 | Pulizia del progetto: resta solo la home A2. Creati `PRODUCT.md`, `DESIGN.md` e questo documento. |
| 2026-11-23 | Proposta B: seconda veste grafica completa (11 pagine) sotto `/proposta-b/`, ispirata ad AudioNova/Amplifon, testi condivisi con la A. |
