---
name: Centro Acustico Pizzuti
description: Ascolto su misura. Il Dott. Pizzuti che accoglie, in blu inchiostro su fondi chiari, con la persona in foto a tutto campo come firma.
colors:
  blue: "#3a4f69"
  ink: "#0b1a2c"
  sky: "#b6cae4"
  sky-soft: "#e6edf7"
  paper: "#ffffff"
  paper-tint: "#f3f6fb"
  red: "#dd182d"
  red-deep: "#b9101f"
  blue-text: "#33485f"
typography:
  display:
    fontFamily: "Montserrat Variable, Montserrat, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2.5rem, 1.6rem + 4.4vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Montserrat Variable, Montserrat, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.7rem + 2.8vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Montserrat Variable, Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.35rem + 0.7vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Montserrat Variable, Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.2rem + 0.25vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "Montserrat Variable, Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.35rem + 0.7vw, 1.875rem)"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Montserrat Variable, Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "0.875rem"
  md: "1.25rem"
  pill: "999px"
spacing:
  gutter: "clamp(1.25rem, 5vw, 3rem)"
  section: "clamp(4rem, 9vw, 8rem)"
  measure: "62ch"
  row: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 1.6rem"
    height: "3.75rem"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 1.6rem"
    height: "3.75rem"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 1.1rem"
    height: "3.75rem"
  form-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "clamp(1.5rem, 4vw, 2.5rem)"
  panel:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    rounded: "2.25rem"
    padding: "clamp(2rem, 5vw, 4rem)"
---

# Design System: Centro Acustico Pizzuti

## Overview

**Creative North Star: "Lo studio del Dottore"**

Il sito è una persona che accoglie, non un catalogo di apparecchi. Inchiostro blu su fondi chiari, titoli pesanti e stretti in Montserrat, testo corrente da 20px o più, un solo colore caldo (il rosso) riservato a chi vuole chiamare. Densità bassa, molto respiro, una sola idea per sezione. Il sistema è pensato per un pubblico adulto e anziano da smartphone: contrasto alto, bersagli di tocco grandi, nessuna animazione che complichi.

La firma è la persona: foto reali a tutto fondo nelle aperture, niente motivi grafici inventati (le onde decorative e le cornici ad arco sono state tolte su richiesta del cliente). Le tre onde restano solo nel logo. La struttura alterna fondi a campo pieno (sei toni), impianti diversi e contenuti di forma diversa (righe con filetto, box, passi orizzontali, tessere aperte con filetto, pannelli, foto a tutta altezza), così ogni sezione si riconosce anche su desktop.

Il sistema nasce dalla Home "Il volto" (validata dall'utente), centrata sulla persona del Dott. Pizzuti: fondo bianco, il Dottore nel suo studio in una foto a tutto fondo nell'apertura. Il blocco `:root` di base.css è la base comune; la pagina ridefinisce solo `--bg`, `--fg-soft`, `--line`.

**Key Characteristics:**
- Palette del brandbook (blu, inchiostro, azzurro) più un rosso solo per i contatti.
- Montserrat Variable ovunque; scala fluida; corpo minimo 20px.
- Bottoni a pillola alti 60px (3.75rem), con bordo da 3px.
- Libreria di sezioni (`styles/sections.css`, `Section.astro`, `PageHero.astro`): tono x impianto x contenuto, alternati pagina per pagina; nessuna ombra decorativa.
- Foto a tutto fondo come firma; nessun motivo decorativo di linee né cornice ad arco.
- Poche animazioni: ingresso `rise` nelle testate, comparsa allo scroll con sfalsamento (`data-reveal`, `data-stagger`), svelatura delle foto grandi (`data-wipe`), sollevamento dei box cliccabili. Tutto disattivato con prefers-reduced-motion.

## Colors

Una palette fredda e profonda (blu, inchiostro, azzurro cielo) su carta chiara, con un solo accento caldo.

### Primary
- **Blu del logo** (`blue`): colore principale del brandbook; bordi dei campi, tratti, icone secondarie, filetti (via `--line`, al 22-28% di opacità).
- **Inchiostro profondo** (`ink`): testo, titoli, bordi dei bottoni secondari, fascia "dichiarazione" e footer a fondo pieno, focus ring.

### Secondary
- **Azzurro luce** (`sky`): campo di luce (hero), selezione del testo.
- **Azzurro tenue** (`sky-soft`): fondi di sezione, hover delle righe, messaggio di invio.

### Tertiary
- **Rosso contatto** (`red`): solo azioni di contatto (Chiama, header CTA) e i tre accenti di percorso (contatori del metodo in home, numeri dei passi, freccia dei box cliccabili). Hover `red-deep`. Le icone di accento sono `blue`, `sky` sui fondi scuri.
- **Rosso profondo** (`red-deep`): hover del bottone primario e bordo dell'avviso "bozza" nelle pagine legali.

### Neutral
- **Carta** (`paper`, bianco): campi e pannelli su fondo colorato.
- **Azzurro carta** (`paper-tint`, `#f3f6fb`): azzurro tenue schiarito col bianco, tono `tint` delle sezioni. Ha sostituito il crema `#f7f3ec`, che non era un colore del brandbook.
- **Blu testo** (`blue-text`): testo secondario (`--fg-soft`) più scuro del blu del logo per il contrasto su bianco e azzurri chiari. È definito in `:root` come `--blue-text` ed è il `--fg-soft` di base di tutte le pagine.

### Named Rules
**The Un Solo Rosso Rule.** Il rosso (#dd182d) segnala dove si contatta il Centro. Bottone primario e CTA in header sono rossi; le sole altre eccezioni sono tre accenti di percorso: i contatori del metodo in home, i numeri dei passi orizzontali e la freccia dei box cliccabili. Tutto il resto (icone di accento, spunte, sottolineature) è blu e inchiostro, azzurro sui fondi scuri. La sua rarità è la funzione.

**The Fondi Piani Rule.** Le sezioni cambiano per campo pieno, non per gradienti (due sole sfumature ammesse: la velatura d'inchiostro sulle foto di apertura, che è un trattamento della foto, e il tono `fade` delle testate senza foto, da `sky` a `sky-soft` a 120°, solo con colori del brand). Toni disponibili: `white`, `soft` (sky-soft), `tint` (paper-tint), `sky`, `blue`, `ink`. Due sezioni consecutive non hanno mai lo stesso tono; `blue` e `ink` non si toccano.

## Typography

**Display Font:** Montserrat Variable (con Montserrat, system-ui, sans-serif)
**Body Font:** Montserrat Variable
**Label Font:** Montserrat Variable

**Character:** Un solo carattere geometrico e aperto, in pesi molto diversi: titoli 700-800 stretti e compatti, corpo 400-500 generoso. La gerarchia nasce dal peso e dalla scala, non da un secondo carattere.

### Hierarchy
- **Display** (700, `--step-4` 2.5-5.25rem, 1.12): h1. La home lo ridefinisce localmente (fino a 4.75rem) con tracking più stretto (-0.035em).
- **Headline** (700, `--step-3` 2.25-4rem, 1.12): h2.
- **Title** (700, `--step-1` 1.5-1.875rem, 1.25): h3, righe servizio e metodo.
- **Body** (400, `--step-0` 1.25-1.375rem, 1.6): testo corrente, misura massima 62ch.
- **Lead** (500, `--step-1`, 1.45): sottotitolo sotto l'h1, colore `fg-soft`.
- **Label** (600-700, `--step--1` 1-1.0625rem): navigazione, note, didascalie, footer.

### Named Rules
**The Venti Pixel Rule.** Nessun testo corrente sotto 1.25rem, nemmeno dentro box, tessere e passi; `--step--1` (1rem) solo per etichette, note, footer.

**The Peso Non Dimensione Rule.** Titolo e corpo si distinguono per peso e scala; il tracking si stringe man mano che il titolo cresce (da -0.02em a -0.04em).

## Layout

Contenitore centrato `min(100% - 2*gutter, 76rem)`; gutter fluido 1.25-3rem. Ritmo verticale tra sezioni `--space-section` (4-8rem). Interni delle sezioni a griglia con `gap` da 1.5 a 5rem; due colonne dai 900-960px, colonna singola sotto. Pensato mobile first: sotto i 900px compare la barra contatti fissa in basso (telefono e WhatsApp) e il menu `details`; da 900px la navigazione e la CTA telefono passano nell'header. Ogni sezione combina tre scelte (vedi Components > Libreria di sezioni). Impianti: `split` (titolo a sinistra fisso, contenuto a destra), `center` (titolo centrato, contenuto sotto), `wide` (titolo e lead affiancati, contenuto sotto), `feature` (foto a tutta altezza fino al bordo dello schermo, testo accanto; `.rev` la inverte), `banner` (foto a tutta larghezza). Testate interne: `photo` (quando c'è una foto, che copre tutta la sezione), `center`, `left` (titolo e testo a sinistra sul tono `fade`, sfumatura da `sky` a `sky-soft`, come in Chi siamo), `wide`. Regola: nella stessa pagina non ripetere lo stesso impianto due volte di seguito. Le griglie usano `minmax(0, 1fr)` perché testi lunghi (email) non allarghino la pagina su mobile.

## Elevation & Depth

Sistema piatto. La profondità arriva da campi di colore pieni, filetti e bordi (2-3px), non da ombre. Unica ombra presente nella build: quella della barra contatti mobile (`0 -8px 24px -12px rgb(11 26 44 / .25)`), registrata come scostamento da non estendere (vedi chiusura). Gli stati (hover) cambiano colore di fondo in 0.18s; solo i box cliccabili si sollevano di 6px con bordo `ink`, senza ombra.

### Named Rules
**The Niente Ombre Rule.** Nessuna ombra decorativa. Separare con un filetto, un bordo o un cambio di campo.

## Shapes

Tre famiglie: la pillola (999px) per bottoni, chip e link di menu; il raggio morbido per contenitori e campi (`--radius` 1.25rem per foto e mappe, 1.75rem per box e recensioni, 2.25rem per pannelli; `--radius-sm` 0.875rem per campi, menu, messaggi); nessuna sommità ad arco su foto e tessere: la forma ricordava una lapide ed è stata tolta. Il numero del metodo è un cerchio da 3.5rem.

## Components

### Buttons
- **Shape:** pillola (999px), altezza minima 3.75rem, bordo 3px, testo 700 a `--step-0`, icona 1.5rem.
- **Primary:** fondo `red`, testo bianco, per contatto (Chiama). Hover `red-deep`.
- **Secondary:** trasparente, testo e bordo `ink`; hover a fondo `ink` e testo bianco. Su fondi scuri (`.on-dark`) invertito in bianco.
- **WhatsApp (barra mobile):** bianco con bordo `ink`.
- **Focus:** contorno 3px `ink` con offset 3px (bianco su scuro). Transizione 0.18s ease-out.

### Navigazione
Header con logo (link alla home), quattro voci da `NAV` in `config.ts` (Il Centro, Apparecchi acustici, Servizi, Contatti) con la pagina corrente sottolineata (`aria-current`), CTA telefono a pillola. Mobile: pulsante `Menu` a pillola con pannello bordato 2px. Nessun breadcrumb. Footer su `ink`: logo e social, colonne Il Centro e Servizi, Contatti, Orari, riga legale (Privacy, Cookie, Note legali, Torna su).

### Barra contatti mobile
Fissa in basso sotto i 900px: griglia `minmax(0,1.3fr)`/`minmax(0,1fr)` (regge fino a 320px), Chiama (rosso) e WhatsApp (bianco, bordo ink), fondo bianco con filetto superiore.

### Libreria di sezioni (contenuti)
- **Righe** (`.big-rows`, `.method-list`, `.check-list`): elenchi con filetto; il metodo in home ha il contatore in cerchio rosso (l'ultimo `ink`).
- **Box** (`.cards.c3/.c4`, `.card`): raggio 1.75rem, fondo bianco o `sky-soft` secondo il tono; `a.card` ha la freccia in cerchio rosso in basso a destra; `.hero-card` (fondo `blue`) e `.span2` per evidenziare il primo. Per servizi, tipi, criteri, orari.
- **Passi orizzontali** (`.steps.c3/.c4`): numero grande `01` in rosso (in `sky` su fondi scuri) sopra un filetto da 3px. Per percorsi e sequenze.
- **Tessere** (`.tiles`, `.tile`): voci aperte senza contenitore, filetto superiore da 2px (`--line`, bianco al 35% sui fondi scuri), icona in cerchio da 3.5rem, testo allineato a sinistra. Per i plus e gli usi.
- **Apertura con foto** (`PageHero` con `image`, home `.ph-photo`): la foto copre tutta la sezione, il testo bianco siede sul lato velato d'inchiostro (`rev` lo porta a destra); su mobile il testo scende in basso e la velatura sale dal fondo. Senza foto restano gli impianti `center`, `left` e `wide`.
- **Pannello** (`.panel`, `.panel.sky`): blocco arrotondato 2.25rem a fondo `blue` (o `sky` con `.panel.sky`), padding clamp(2rem, 5vw, 4rem), con testo e azioni affiancati. Per le chiamate all'azione intermedie.
- **Chip** (`.chips`): pillole bianche con spunta rossa. Per i "quando ha senso".
- **Domande frequenti** (`.faq`): `details` nativi su due colonne da 900px (`.one` per una colonna).
- **Fascia finale** (`CtaBand`): `ink`, telefono, WhatsApp, come raggiungerci.

### Form
Campi alti 3.75rem, fondo bianco, bordo 2px `blue`, raggio `--radius-sm`, etichetta 700 a `--step-0`, casella di consenso 1.75rem. Il box del form (`form-panel`: `.form-box`, `.home-formbox`) è bianco, raggio `--radius` (1.25rem), padding clamp(1.5rem, 4vw, 2.5rem), testo secondario `blue-text`; siede su una sezione `ink`.

### Fotografia
Solo foto reali del Centro (cartella `Foto/`, ottimizzate in `mockup/public/img/`): il Dottore, lo studio, la visita, la vetrina, prodotti in mano. Ogni foto compare una sola volta per pagina; le foto di apertura coprono tutta la sezione. Alt descrittivi, nessuna foto stock.

### Mappa
`MapConsent.astro`: la mappa Google si carica solo dopo un clic (cookie di terze parti), con link alternativo "Apri in Google Maps". In WordPress lo gestirà il plugin di consenso.

### Niente motivi decorativi
Nessuna linea, arco od onda come sfondo delle sezioni: dove serve carattere si usa una foto. Le tre onde compaiono solo dentro il logo.

## Do's and Don'ts

### Do:
- **Do** usare `red` solo per telefono, WhatsApp e CTA di contatto, più i tre accenti di percorso (contatori del metodo, numeri dei passi, freccia dei box).
- **Do** mantenere corpo a `--step-0` (20px+) e bersagli di tocco da 3.5-3.75rem.
- **Do** alternare tono, impianto e contenuto tra sezioni consecutive.
- **Do** ridefinire per pagina solo `--bg`, `--fg-soft`, `--line`.
- **Do** rispettare prefers-reduced-motion: niente comparse, svelature né sollevamenti.
- **Do** dichiarare i dati di esempio (telefono, indirizzo, orari, P.IVA) in `config.ts`.

### Don't:
- **Don't** usare ombre decorative o gradienti; non mettere due sezioni di box una dopo l'altra.
- **Don't** introdurre un secondo carattere o un colore fuori dalla palette del brandbook.
- **Don't** impostare testo corrente sotto 1.25rem.
- **Don't** usare il rosso per decorazione o per elementi senza azione di contatto, fuori dai tre accenti di percorso.

## Porting a WordPress

I token sono già variabili CSS: `--blue`, `--ink`, `--sky`, `--sky-soft`, `--paper`, `--paper-tint`, `--red`, `--red-deep` diventano `settings.color.palette` in theme.json; `--step--1` ... `--step-4` diventano `settings.typography.fontSizes` (valori fluidi con clamp); `--gutter`, `--space-section`, `--measure` diventano `settings.spacing` / `layout.contentSize` (76rem). `--bg`, `--fg`, `--fg-soft`, `--line` restano variabili di stile per variante o per blocco.
