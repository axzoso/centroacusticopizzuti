# Proposta B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Il lavoro visivo si fa con la skill `impeccable` (vedi Task 1, passo 1).

**Goal:** Una seconda veste grafica completa del sito Centro Acustico Pizzuti, sotto `/proposta-b/` nello stesso mockup Astro, ispirata ad AudioNova e Amplifon, con colori, font e testi Pizzuti.

**Architecture:**
- Pagine in `mockup/src/pages/proposta-b/`, layout in `mockup/src/layouts/b/` e componenti in `mockup/src/components/b/`.
- Un solo foglio di stile `mockup/src/styles/b.css` con token `--b-*`.
- I testi vengono da `mockup/src/copy/*.ts` e `mockup/src/config.ts`, senza modificarli. Ogni link interno passa da `bHref()`, che aggiunge il prefisso `/proposta-b`.
- Nessun file della proposta A viene modificato.

**Tech Stack:** Astro 5, CSS puro con custom properties, `@fontsource-variable/montserrat`, JS inline minimo (menu mobile, carosello, form, mappa). Test con `node --test` (Node 25 esegue TypeScript direttamente) e uno script di controllo sulla build.

**Spec:** `docs/superpowers/specs/2026-11-23-proposta-b-design.md`. Riferimenti visivi in `docs/superpowers/specs/riferimenti-proposta-b/` (1 = card a foto, 2 = testata sfumata, 3 = testata con box).

## Global Constraints

- Colori:
  - campo profondo `#0B1A2C`;
  - campo medio `#3A4F69`;
  - accento luminoso `#B6CAE4`;
  - fondo tenue `#E6EDF7`;
  - bianco `#FFFFFF`;
  - azione `#DD182D`, solo per Chiama e Prenota.
- Sul fondo chiaro contorni e frecce usano `#3A4F69`, non l'azzurro.
- Font: Montserrat. Titoli a peso 500-600, mai 700. Corpo 16px, testi secondari 14px.
- Forme: angoli circa 24px su card, foto e box. Bottoni a pillola alti circa 48px, in due versioni: pieno rosso (azione) e contorno luminoso con freccia (navigazione).
- Ombre leggere solo su box sovrapposti e menu.
- Ordine delle azioni: telefono, poi WhatsApp, poi form.
- Ordine delle sezioni: quello scritto nella spec (home "prima i servizi, come le catene"), non quello dei file di testo.
- Non modificare nessun file della proposta A: `pages/` fuori da `proposta-b/`, `components/*.astro`, `layouts/*.astro`, `styles/base.css`, `styles/sections.css`, `copy/*.ts`, `config.ts`.
- Non inventare prezzi, promesse, marchi o dati che non siano già nei testi.
- Niente logo, testo o foto di AudioNova o Amplifon: si prende il linguaggio, non i contenuti.
- Foto stock solo con licenza libera (Unsplash o Pexels), in `public/img/b/`, ciascuna in `public/img/CREDITS.md` con fonte, autore e URL.
- `noindex` su tutte le pagine B.
- Niente librerie JS. Rispettare `prefers-reduced-motion`.
- Il progetto non è un repository git: i passi "Commit" della skill sono sostituiti da "Checkpoint" (build verde più controllo).

## Review Focus

1. **Link della B che portano nella A.** Testi con percorsi assoluti (`/servizi/...`), `MapConsent` e `ContactForm` con `/cookie-policy/` scritto a mano. Atteso: ogni link interno di una pagina B resta in `/proposta-b/`, tranne il link esplicito "Vedi la proposta A". È coperto da `scripts/check-b.mjs` (Task 1), lanciato a ogni checkpoint.
2. **Testo sopra le foto illeggibile.** Una sfumatura troppo leggera, o una foto chiara sotto il titolo bianco. Atteso: il titolo bianco ha sempre sotto di sé il campo profondo ad almeno l'80% di opacità. Coperto dal controllo visivo del Task 8 a 1440 e 390.
3. **Scorrimento orizzontale a 390px.** Carosello, box sovrapposto, barra contatti. Atteso: nessuno scorrimento orizzontale della pagina. Il carosello scorre solo dentro sé stesso. Coperto dal Task 8 (`document.documentElement.scrollWidth <= 390`).
4. **Motivo del form non precompilato.** Link come `/proposta-b/contatti/?motivo=caro#form`. Atteso: il campo "Come posso aiutarti?" arriva già selezionato. Coperto dal Task 7, passo 4.
5. **Pagine con H1 multipli o mancanti, `[object Object]` negli orari.** È successo nella A. Atteso: un solo `<h1>` per pagina, nessun `[object Object]` né `undefined` visibile. Coperto da `scripts/check-b.mjs`.

---

## File Structure

```
mockup/
  scripts/check-b.mjs              controllo della build B (link, h1, pagine, testo rotto)
  src/b/link.ts                    bHref(): prefisso /proposta-b sui link interni
  src/b/link.test.ts               test di bHref
  src/styles/b.css                 token --b-*, base, bottoni, griglia, tutte le sezioni B
  src/layouts/b/BaseB.astro        <html>, head, TopBar, HeaderB, FooterB, MobileBarB, script reveal
  src/components/b/
    TopBar.astro  HeaderB.astro  FooterB.astro  MobileBarB.astro   struttura comune
    HeroFade.astro  PageHeaderBox.astro  LegalHeader.astro          testate
    ActionCards.astro  PhotoCards.astro  MethodCarousel.astro       contenuti
    SplitFeature.astro  Band.astro  ReviewsB.astro  FaqB.astro
    FormB.astro  MapB.astro  LegalB.astro                           copie B di form, mappa, pagina legale
    IconB.astro                                                     reexport di ../Icon.astro più icone nuove
  src/pages/proposta-b/            stesse 11 pagine della A (no 404)
  public/img/b/                    foto stock
```

---

### Task 1: Fondamenta (direzione, token, layout, link, controllo)

**Files:**
- Create: `mockup/src/b/link.ts`, `mockup/src/b/link.test.ts`, `mockup/scripts/check-b.mjs`, `mockup/src/styles/b.css`, `mockup/src/layouts/b/BaseB.astro`, `mockup/src/components/b/{TopBar,HeaderB,FooterB,MobileBarB,IconB}.astro`, `mockup/src/pages/proposta-b/index.astro` (segnaposto con un H1)
- Create: `.impeccable/surfaces/` brief per `mockup/src/pages/proposta-b/index.astro` (con lo strumento `surface-brief`)
- Modify: `mockup/package.json` (script `test:b`, `check:b`)

**Interfaces:**
- Produces:
  - `bHref(href: string): string`;
  - `BaseB` con props `{ title: string; description?: string; current?: string }` e uno slot di default;
  - classi CSS globali in `b.css`: `.b-container`, `.b-btn`, `.b-btn--red`, `.b-btn--line` (contorno luminoso su scuro), `.b-btn--line-dark` (contorno blu su chiaro), `.b-sec`, `.b-sec--soft`, `.b-sec--deep`, `.b-h2`, `.b-lead`, `.b-small`, attributo `data-reveal`;
  - `IconB` con prop `name`, che accetta i nomi di `Icon.astro` più `whatsapp-fill`, `ear`, `calendar`, `menu`, `close`, `chevron-left`, `chevron-right`.

- [ ] **Step 1: Registra la direzione con Impeccable.** Lancia `/Users/claudio/.claude/skills/impeccable/scripts/impeccable surface-brief write mockup/src/pages/proposta-b/index.astro <file>`, partendo dalla cartella principale del progetto. Il brief contiene il blocco `## Direction contract`:
  - THESIS: linguaggio delle catene (AudioNova/Amplifon) nei colori Pizzuti, prima i servizi;
  - OWN-WORLD: tabella colori e forme della spec;
  - STORY;
  - FIRST VIEWPORT: barra contatti profonda, menu bianco con Chiamami rosso, foto a destra che sfuma nel campo profondo a sinistra, H1 di `home.ts`, Chiamami e WhatsApp sopra la piega;
  - FORM: `direzione fissata dall'utente, seed: none (unavailable)`, code-led;
  - FINISH, con la riga verbatim di `new-work.md` §5.

  Poi leggi `/Users/claudio/.claude/skills/impeccable/reference/craft-floor.md` prima di scrivere UI.

- [ ] **Step 2: Scrivi il test di `bHref`** in `src/b/link.test.ts` con `node:test` e `assert.strictEqual`:
  - `bHref('/')` → `'/proposta-b/'`
  - `bHref('/servizi/controllo-udito/')` → `'/proposta-b/servizi/controllo-udito/'`
  - `bHref('/servizi/#auricolari')` → `'/proposta-b/servizi/#auricolari'`
  - `bHref('/contatti/?motivo=ssn#form')` → `'/proposta-b/contatti/?motivo=ssn#form'`
  - `bHref('#auricolari')` → `'#auricolari'`
  - `bHref('/proposta-b/contatti/')` → invariato
  - `bHref('tel:+390984123456')`, `bHref('https://wa.me/39')` e `bHref('mailto:a@b.it')` → invariati
  - `bHref('/img/x.jpg')` e `bHref('/logos/logo-color.png')` → invariati (asset)

- [ ] **Step 3: Esegui il test, deve fallire.** `cd mockup && node --test src/b/link.test.ts` → FAIL (modulo mancante).

- [ ] **Step 4: Implementa `bHref`** in `src/b/link.ts`. Solo sintassi TS cancellabile (niente `enum`), così Node lo esegue. Gli asset sono i percorsi che iniziano con `/img/`, `/logos/` o `/_astro/`.

- [ ] **Step 5: Esegui il test, deve passare.** Stesso comando → tutti PASS. Aggiungi a `package.json` `"test:b": "node --test src/b/link.test.ts"`.

- [ ] **Step 6: Scrivi `scripts/check-b.mjs`.** Lavora su `dist/proposta-b/**/index.html` dopo `astro build`. Esce con codice 1 e un elenco leggibile se:
  - manca una delle 11 pagine: `proposta-b/`, `chi-siamo/`, `apparecchi-acustici/`, `apparecchi-acustici/prezzi/`, `servizi/`, `servizi/controllo-udito/`, `servizi/riparazione-assistenza-apparecchi-acustici/`, `contatti/`, `privacy-policy/`, `cookie-policy/`, `note-legali/`;
  - una pagina non ha esattamente un `<h1`;
  - un `href="/..."` o `action="/..."` non inizia con `/proposta-b/`, `/img/`, `/logos/` o `/_astro/` e non sta su un elemento con `data-proposta-a`;
  - il testo contiene `[object Object]` o `>undefined<`;
  - manca `<meta name="robots" content="noindex"`.

  Aggiungi `"check:b": "astro build && node scripts/check-b.mjs"`. Con il solo segnaposto lo script deve fallire, perché mancano 10 pagine: verifica che fallisca per quel motivo.

- [ ] **Step 7: Scrivi `b.css` e la struttura comune.**
  - **Token.** In `:root` definisci `--b-deep`, `--b-mid`, `--b-glow`, `--b-soft`, `--b-white`, `--b-red`, `--b-red-deep` (`#B9101F`), `--b-radius: 1.5rem`, `--b-radius-sm: 1rem`, `--b-btn-h: 3rem`, `--b-font`. La scala: `--b-fs-sm` 14px, `--b-fs-body` 16px, `--b-fs-lead` circa 18-20px, `--b-fs-h3` circa 22-24px, `--b-fs-h2` clamp fino a circa 44px, `--b-fs-h1` clamp fino a circa 56px.
  - **`BaseB`.** Importa solo `b.css` (non `base.css`), mette `noindex` e un'etichetta del titolo `… · Proposta B`.
  - **Componenti.**
    - `TopBar` (campo profondo): pin+indirizzo, telefono, WhatsApp, Contatti; su mobile solo telefono e WhatsApp.
    - `HeaderB`: logo `/logos/logo-color.png`, voci da `NAV` passate in `bHref`, voce corrente con `aria-current`, bottone rosso "Chiamami" (`SITE.telefonoHref`), menu a tendina sotto 960px, fisso allo scorrimento.
    - `FooterB` (campo profondo): logo bianco, colonne `FOOTER`, contatti, `SITE.orari`, `SITE.social`, `LEGALI`, più `<a href="/" data-proposta-a>Vedi la proposta A</a>`.
    - `MobileBarB`: Chiama rosso e WhatsApp, fissa in basso sotto 720px.
  - **Segnaposto.** Il segnaposto `pages/proposta-b/index.astro` usa `BaseB`, con un H1 provvisorio.

- [ ] **Step 8: Checkpoint.** `npm run test:b` PASS. `npm run dev` e apri `http://localhost:4321/proposta-b/`: barra contatti, menu e footer visibili. `http://localhost:4321/` (A) identica a prima.

---

### Task 2: Foto stock

**Files:**
- Create: `mockup/public/img/b/*.jpg` (8-12 foto, 1600px lato lungo, JPEG qualità circa 80, con `sips`)
- Modify: `mockup/public/img/CREDITS.md` (sezione "Proposta B: foto stock")

**Interfaces:**
- Produces: questi nomi file, usati dai task successivi (riusabili su più pagine):
  - `coppia-tavola.jpg` (testata home: conversazione a tavola fra adulti);
  - `famiglia-nonno.jpg` (persona cara);
  - `conversazione-amici.jpg`;
  - `telefono-sorriso.jpg` (persona adulta al telefono);
  - `passeggiata-coppia.jpg`;
  - `ascolto-musica.jpg` (auricolari/musica);
  - `nuoto.jpg`;
  - `lavoro-rumore.jpg`;
  - `tv-famiglia.jpg`;
  - `orecchio-dettaglio.jpg` (orecchio con apparecchio).

- [ ] **Step 1: Cerca le foto** su Unsplash o Pexels: persone reali in momenti di vita, toni caldi o neutri che reggano una sfumatura blu, niente posa "da catalogo", nessun logo visibile. Verifica che ogni URL di download risponda prima di scaricare.
- [ ] **Step 2: Scarica e ottimizza.** Ogni file va in una cartella nuova e vuota nello scratchpad. Poi `sips -Z 1600 -s formatOptions 80` e copia con il nome previsto in `public/img/b/`.
- [ ] **Step 3: Aggiorna `CREDITS.md`** con una riga per foto: nome file, autore, fonte, URL della pagina, licenza.
- [ ] **Step 4: Checkpoint.** `ls public/img/b` mostra 10 file, ognuno sotto 400KB. Ognuno ha la sua riga in `CREDITS.md`.

---

### Task 3: Libreria di sezioni B

**Files:**
- Create: `mockup/src/components/b/{HeroFade,PageHeaderBox,LegalHeader,ActionCards,PhotoCards,MethodCarousel,SplitFeature,Band,ReviewsB,FaqB,FormB,MapB,LegalB}.astro`
- Modify: `mockup/src/styles/b.css` (una sezione di stile per componente, nello stesso ordine)
- Create: `mockup/src/pages/proposta-b/_libreria.astro`. Pagina di prova con ogni componente e dati presi dai `copy/`. I file con `_` non sono pagine in Astro: rinominala `libreria-b.astro` solo durante la prova e cancellala al checkpoint.

**Interfaces:**
- Consumes: `bHref`, `BaseB`, `IconB`, le classi `.b-*` (Task 1), le foto (Task 2).
- Produces (props esatte):
  - `HeroFade { titolo: string; lead: string; image: string; imageAlt: string; imagePos?: string }` + slot per i bottoni. Foto a destra (circa 60% della larghezza su desktop) con `linear-gradient(90deg, var(--b-deep) 35%, transparent 75%)`. Su mobile: foto sopra, sfumatura dal basso, testo sotto su campo profondo. Rif. screenshot 2.
  - `PageHeaderBox { titolo: string; lead: string; image: string; imageAlt: string; imagePos?: string; note?: string }` + slot per i bottoni nel box. Foto a tutta larghezza (circa 420px desktop, 300px mobile) con velo `color-mix(var(--b-deep) 70%)`, H1 bianco. Il box bianco arrotondato, con ombra leggera, sale sulla foto di circa 96px. Rif. screenshot 3.
  - `LegalHeader { titolo: string; aggiornato: string }`.
  - `ActionCards { items: { titolo: string; testo: string; href: string; icona: string }[]; titolo?: string; cols?: 2 | 3 | 4 }`. Card bianche con bordo sottile, icona su un quadratino `--b-glow` di 48px, freccia blu in basso a destra. Tutta la card è un link (`href` passato in `bHref`).
  - `PhotoCards { items: { titolo: string; testo?: string; href: string; image: string; imageAlt: string; cta: string }[]; layout: 'bento' | 'row' }`. Con `bento`: la prima card è alta a sinistra, le due successive impilate a destra, le altre in fila sotto, a 2 colonne. Ogni card ha foto in `object-fit: cover`, `linear-gradient(0deg, var(--b-deep) 0 35%, transparent 85%)`, titolo bianco in basso a sinistra e bottone `.b-btn--line` con freccia (a tutta larghezza nella card grande, a destra nelle piccole). Zoom della foto 1.04 all'hover. Rif. screenshot 1.
  - `MethodCarousel { titolo: string; lead?: string; passi: { titolo: string; testo: string }[]; cta?: { label: string; href: string }; statico?: boolean }`. Card con numero grande in `--b-mid` e fondo `--b-soft`, larghe circa 300px. Contenitore `overflow-x: auto; scroll-snap-type: x mandatory`. Frecce circolari prima/dopo, che scorrono di una card con `scrollBy`. Con `statico` diventa una griglia senza frecce.
  - `SplitFeature { titolo: string; lead?: string; punti?: string[]; image: string; imageAlt: string; image2?: string; image2Alt?: string; reverse?: boolean; tone?: 'white' | 'soft' | 'deep' }` + slot per bottoni e testo extra. Con `image2` le due foto sono arrotondate e sfalsate in altezza, come "Assistenza AudioNova".
  - `Band { testo: string; enfasi?: string; link: { label: string; href: string }; tone: 'deep' | 'red' }`. `enfasi` è la parte di `testo` resa in grassetto.
  - `ReviewsB { titolo?: string }`. Usa `SHOW_REVIEWS`, `RECENSIONI`, `/img/badge-google.png`.
  - `FaqB { titolo: string; items: { q: string; a: string }[] }`. Righe `<details>` bianche e arrotondate, `plus` ruotato a 45° quando la riga è aperta.
  - `FormB { titolo: string }`. Stessa logica e stessi motivi di `ContactForm.astro` (copiati), link privacy `bHref('/privacy-policy/')`, `id="form"` sul contenitore.
  - `MapB`. Stessa logica di `MapConsent.astro`, con link `bHref('/cookie-policy/')`.
  - `LegalB`. Stesse props di `LegalPage.astro` (`title, description, h1, aggiornato, sezioni`), dentro `BaseB`.

- [ ] **Step 1: Scrivi i componenti e gli stili** in quest'ordine: testate, card, carosello, split, fascia, recensioni, FAQ, form, mappa, legale. Per i dettagli visivi aperti segui `craft-floor.md` e gli screenshot in `riferimenti-proposta-b/`.
- [ ] **Step 2: Monta la pagina di prova** `libreria-b.astro` con ogni componente e dati reali presi dai `copy/`.
- [ ] **Step 3: Controlla a 1440 e a 390** con il browser. Il titolo bianco deve sempre stare su almeno l'80% di campo profondo. Lo scorrimento orizzontale della pagina deve essere nullo (`document.documentElement.scrollWidth` uguale alla larghezza). Il carosello deve scorrere con le frecce e con il dito.
- [ ] **Step 4: Checkpoint.** Cancella `libreria-b.astro`. `npm run test:b` PASS, `astro build` senza errori.

---

### Task 4: Home B

**Files:**
- Modify: `mockup/src/pages/proposta-b/index.astro`

**Interfaces:**
- Consumes: componenti del Task 3. `COPY` da `copy/home.ts`, `SITE` da `config.ts`.

- [ ] **Step 1: Componi la home** nell'ordine della spec:
  1. `HeroFade`: `COPY.h1`, `COPY.lead`, `coppia-tavola.jpg`, bottoni `COPY.chiama` (rosso, telefono) e `COPY.whatsapp` (contorno).
  2. `ActionCards` a 3 colonne:
     - Chiamami → `SITE.telefonoHref`, icona `phone`, testo `SITE.telefonoVisibile`;
     - Scrivimi su WhatsApp → `SITE.whatsappHref`, icona `whatsapp`;
     - Dove siamo → `/contatti/`, icona `pin`, testo `SITE.indirizzo`.
  3. Servizi: `COPY.serviziTitolo` e `PhotoCards` con `layout="bento"`. Ordine: Apparecchi acustici (grande, foto reale `senior-apparecchio.jpg`), Controllo dell'udito (`visita-audiogramma.jpg`), Riparazione e assistenza (`regolazione-orecchio.jpg`), Auricolari su misura (`auricolari-su-misura.jpg`), Contributi SSN (`famiglia-nonno.jpg`). Il bottone si chiama "Scopri di più" in tutte le card.
  4. `MethodCarousel`: `COPY.metodoTitolo`, `COPY.metodoLead`, `COPY.metodo`, cta "Il mio metodo" → `/chi-siamo/#metodo`.
  5. `SplitFeature`, `tone="soft"`:
     - `COPY.plusTitolo` come titolo e `COPY.plusLead` come lead;
     - `COPY.plus` come punti (titolo in grassetto e testo);
     - `COPY.citazione` e `COPY.citazioneFirma` in un blocco citazione;
     - foto `dottore-ritratto.jpg` e `dottore-studio.jpg`.
  6. `Band tone="deep"`: `testo={COPY.caroTitolo}`, link `COPY.caroBtn` → `/contatti/?motivo=caro#form`.
  7. `ReviewsB`.
  8. Contatti: `Band tone="red"` con `testo={COPY.contattiTitolo}` e link "Chiama ora" → `SITE.telefonoHref`. Poi `COPY.contattiLead` e `FormB titolo={COPY.formTitolo}`.
- [ ] **Step 2: Controlla a 1440 e 390.** La prima schermata deve mostrare H1, Chiamami e WhatsApp sopra la piega a entrambe le larghezze.
- [ ] **Step 3: Checkpoint.** `npm run test:b` PASS, `astro build` OK.

---

### Task 5: Il Centro, Apparecchi acustici, Prezzi

**Files:**
- Create: `mockup/src/pages/proposta-b/chi-siamo/index.astro`, `.../apparecchi-acustici/index.astro`, `.../apparecchi-acustici/prezzi/index.astro`

**Interfaces:**
- Consumes: componenti del Task 3. `CHI`, `APP`, `PREZ`, `MARCHI`, `SITE`.

- [ ] **Step 1: Il Centro** (`CHI`):
  - `PageHeaderBox` con `dottore-studio.jpg` e bottoni Chiamami e WhatsApp;
  - `SplitFeature` con `chiTitolo` e i paragrafi di `chi`, foto `dottore-ritratto.jpg`;
  - `MethodCarousel statico` con `id="metodo"`, `metodoTitolo`, `metodoLead`, `passi` (statico, perché il carosello è già in home);
  - `ActionCards` per `principi`, icone `chat`, `user`, `check`, `heart`;
  - `PhotoCards layout="row"` per `vai` (foto `visita-audiogramma.jpg`, `senior-apparecchio.jpg`, `regolazione-orecchio.jpg`);
  - `Band tone="red"` "Chiamami: ne parliamo." → telefono.
- [ ] **Step 2: Apparecchi** (`APP`):
  - `PageHeaderBox` con `senior-apparecchio.jpg`; bottoni Chiamami e "I tipi di apparecchio" → `#tipi`;
  - `ActionCards cols={3}` per `criteri` (senza link: renderle come card non cliccabili con la prop `href` vuota, che dà un `<div>`);
  - `PhotoCards layout="row"` con `id="tipi"` per `tipi`, usando le foto reali di prodotto (`apparecchio-mano-arancio.jpg`, `apparecchi-quaderno-rosso.jpg`, `dottore-apparecchio.jpg`, `orecchio-dettaglio.jpg`), con cta "Chiedimi se fa per te" → `/contatti/?motivo=controllo#form`;
  - `SplitFeature` per `prova` con `prova-mani-custodia.jpg`, link `provaLink` → `/chi-siamo/#metodo`;
  - `Band tone="deep"` con `id="ssn"` e `ssnTitolo`, link "Scrivimi" → `/contatti/?motivo=ssn#form`, con `ssnTesto` subito sotto;
  - marchi in fila sobria con `marchiNota`;
  - `Band` per `prezziTitolo` → `/apparecchi-acustici/prezzi/`;
  - `FaqB`;
  - `Band tone="red"` finale.
- [ ] **Step 3: Prezzi** (`PREZ`):
  - `PageHeaderBox` con `note={PREZ.esempioNota}` visibile nel box;
  - `ActionCards` per `incide` (non cliccabili);
  - `SplitFeature` per `incluso` con spunte;
  - tre card per `fasce`, con `fasceTitolo` che contiene già "(esempio)";
  - `Band` con `preventivo`, poi `ssn`;
  - `FaqB`;
  - `Band tone="red"` con link al form `?motivo=preventivo`.
- [ ] **Step 4: Checkpoint.** Controllo a 1440 e 390 delle tre pagine. `npm run test:b` PASS, `astro build` OK.

---

### Task 6: Servizi, Controllo dell'udito, Riparazione e assistenza

**Files:**
- Create: `mockup/src/pages/proposta-b/servizi/index.astro`, `.../servizi/controllo-udito/index.astro`, `.../servizi/riparazione-assistenza-apparecchi-acustici/index.astro`

**Interfaces:**
- Consumes: componenti del Task 3. `SERV`, `CONTROLLO`, `RIPARA`, `SITE`.

- [ ] **Step 1: Servizi** (`SERV`):
  - `PageHeaderBox` con `vetrina-centro.jpg`;
  - `PhotoCards layout="bento"` per `righe`, con le stesse foto della home e `famiglia-nonno.jpg` per SSN;
  - `SplitFeature` con `id="auricolari"`: `auricolariTitolo`, paragrafi `auricolari`, foto `auricolari-su-misura.jpg` e `ascolto-musica.jpg`;
  - `ActionCards cols={4}` per `auricolariUsi`, icone `shield`, `drop`, `moon`, `music`, ciascuna con link a `/contatti/?motivo=auricolari#form`;
  - `Band tone="deep"` con `nonSaiTitolo` e link "Prenota un controllo" → `/servizi/controllo-udito/`, e `nonSai` come testo sotto.
- [ ] **Step 2: Controllo** (`CONTROLLO`):
  - `PageHeaderBox` con `visita-audiogramma.jpg`;
  - `SplitFeature` con `perchiTitolo` e `perchi` come punti con spunta, foto `tv-famiglia.jpg`;
  - `MethodCarousel statico` per `vita`;
  - `SplitFeature tone="soft"` per `porta` con `famiglia-nonno.jpg`;
  - `FaqB`;
  - `Band tone="red"`.
- [ ] **Step 3: Riparazione** (`RIPARA`):
  - `PageHeaderBox` con `regolazione-orecchio.jpg`;
  - `ActionCards cols={3}` per `casi` (non cliccabili), con icone a scelta dal set;
  - `SplitFeature` per `servizi` con `dottore-apparecchio.jpg`;
  - `Band tone="deep"` per `altroTitolo` e `altro`, con link al form `?motivo=assistenza`;
  - `FaqB`;
  - `Band tone="red"`.
- [ ] **Step 4: Checkpoint.** Controllo a 1440 e 390. `npm run test:b` PASS, `astro build` OK.

---

### Task 7: Contatti e pagine legali

**Files:**
- Create: `mockup/src/pages/proposta-b/contatti/index.astro`, `.../privacy-policy/index.astro`, `.../cookie-policy/index.astro`, `.../note-legali/index.astro`

**Interfaces:**
- Consumes: `PageHeaderBox`, `ActionCards`, `FormB`, `MapB`, `LegalB`. `CONT`, `PRIVACY`, `COOKIE`, `NOTE` da `copy/legali.ts`, `SITE`.

- [ ] **Step 1: Contatti** (`CONT`):
  - `PageHeaderBox` con `vetrina-centro.jpg`. Nel box, `SITE.telefonoVisibile` grande con bottone rosso, WhatsApp e `SITE.email`;
  - due card bianche affiancate: "Dove trovarmi" (`SITE.indirizzo`) e "Orari" (`SITE.orari` come righe `giorni` / `ore`, poi `orariNota`);
  - `FormB titolo={CONT.formTitolo}` in un box bianco su `--b-soft`;
  - `ActionCards` per `come3`, con `comeLead` sopra;
  - `MapB`, poi il bottone `mappaBtn`.
- [ ] **Step 2: Pagine legali.** Ognuna è `<LegalB {...C} />` con il testo corrispondente.
- [ ] **Step 3: Esegui il controllo completo.** `npm run check:b` → PASS: 11 pagine, un H1 ciascuna, nessun link verso la A tranne `data-proposta-a`, nessun testo rotto, `noindex` presente.
- [ ] **Step 4: Verifica la precompilazione del motivo** con il browser: `/proposta-b/contatti/?motivo=caro#form` → il menu "Come posso aiutarti?" mostra "Cerco aiuto per una persona cara". Ripeti con `ssn` e `auricolari`.
- [ ] **Step 5: Checkpoint.** `npm run check:b` PASS.

---

### Task 8: Verifica finale, revisione Impeccable, documentazione

**Files:**
- Create: `.impeccable/review/b-*.png` (catture), `DESIGN-B.md` (dal documentatore Impeccable)
- Modify: `docs/avanzamento-sviluppo.md` (sezione Proposta B e riga nel registro)

- [ ] **Step 1: Cattura le pagine.** Per ognuna delle 11 pagine B, una cattura a tutta pagina a 1440 e a 390, con le animazioni d'ingresso già completate. Su ognuna verifica che `document.documentElement.scrollWidth <= window.innerWidth`.
- [ ] **Step 2: Lancia il rilevatore.** `/Users/claudio/.claude/skills/impeccable/scripts/impeccable detect --json` sui file `components/b/`, `styles/b.css` e `pages/proposta-b/`. Correggi i problemi meccanici.
- [ ] **Step 3: Lancia il revisore finale** `impeccable-finish-reviewer`, secondo `new-work.md` §7. Gli passi:
  - la richiesta originale e le risposte dell'utente (tutto il sito, blu pieno + azzurro acceso, stock sì, `/proposta-b/`, testi 14px ok, prima i servizi);
  - il direction contract;
  - le catture;
  - gli screenshot in `riferimenti-proposta-b/` come riferimento critico (code-led, nessuna comp approvata);
  - il percorso di `craft-floor.md`;
  - i risultati del rilevatore.

  Agisci sul verdetto (ship/fix/rebuild/recapture), al massimo due giri.
- [ ] **Step 4: Lancia il documentatore** `impeccable-documenter`. Deve scrivere il sistema B in `DESIGN-B.md`, non in `DESIGN.md`, che resta quello della A. Lancia `impeccable embed-prompt --scan public/img/b` e registra l'origine di ogni foto.
- [ ] **Step 5: Aggiorna `docs/avanzamento-sviluppo.md`** con:
  - come aprire la B (`/proposta-b/`);
  - le pagine fatte;
  - i comandi `npm run test:b` e `npm run check:b`;
  - una riga datata 23/11/2026 nel registro.
- [ ] **Step 6: Checkpoint finale.** `npm run test:b` e `npm run check:b` PASS. La home della A su `/` è invariata rispetto alla cattura iniziale.
