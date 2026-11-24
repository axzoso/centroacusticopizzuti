# Proposta B: seconda veste grafica del sito Centro Acustico Pizzuti

Data: 23 novembre 2026 · Stato: bozza da approvare · Riferimenti visivi: `riferimenti-proposta-b/`

## Perché

Al cliente va presentata una seconda proposta grafica accanto a quella già fatta (proposta A, "Il volto", su `/`). La B deve sembrare un sito diverso, ispirato ai siti delle grandi catene del settore: AudioNova (audionovaitalia.it) per primo, Amplifon (amplifon.com/it) come secondo riferimento. Il cliente sceglie tra le due. I testi, le sezioni della sitemap e i colori del brand restano quelli di Pizzuti: cambia solo la veste.

Successo: il cliente apre `/` e `/proposta-b/` e vede due siti completi, con la stessa sostanza e un carattere visivo nettamente diverso. La B deve risultare familiare a chi conosce i siti delle catene, ma con i colori Pizzuti.

## Obiettivi

- Tutte le pagine della sitemap in versione B sotto `/proposta-b/`, raggiungibili con lo stesso `npm run dev`.
- Linguaggio visivo preso dagli screenshot AudioNova forniti dall'utente (in `docs/superpowers/specs/riferimenti-proposta-b/`: 1 = card a foto, 2 = testata sfumata, 3 = testata con box) e dalle due home:
  - card grandi a foto con sfumatura nel colore pieno, titolo in basso e bottone a pillola con il contorno acceso;
  - testata con la foto che sfuma nel colore pieno;
  - testata delle pagine interne con un box bianco che si sovrappone alla foto;
  - barra contatti sottile sopra il menu;
  - card bianche con icona su un quadratino di colore;
  - metodo in carosello di card (Amplifon);
  - fascia di colore pieno con una frase e una freccia (Amplifon).
- Colori del brand nei ruoli dei colori AudioNova (scelta dell'utente):
  - blu profondo `#0B1A2C` → `#3A4F69` per i campi pieni e le sfumature su foto (il ruolo del verde scuro);
  - azzurro `#B6CAE4` per contorni, frecce e dettagli luminosi (il ruolo del verde acceso);
  - rosso `#DD182D` pieno solo per chiamare e prenotare.
- Montserrat, come da brandbook.

## Non obiettivi

- Nessuna modifica alla proposta A: pagine, componenti, `base.css` e `sections.css` restano come sono.
- Nessun cambio ai testi: la B legge `copy/*.ts` e `config.ts` così come sono.
- Nessuna 404 dedicata alla B: Astro ne ha una sola e resta quella di A.
- Nessun invio reale del form, nessun banner cookie: si fanno in WordPress, come per A.

## Anti-obiettivi (cose che farebbero fallire la B anche se "funziona")

- Che sembri la A ricolorata: stessa impaginazione, ritratto nell'arco, righe con filetto.
- Che copi AudioNova o Amplifon nei marchi, nei loghi, nei testi o nelle foto. Si prende il linguaggio, non i contenuti.
- Prodotto e tecnologia in primo piano rispetto alla persona: niente schede prodotto, niente prezzi o promesse non presenti nei testi.
- Il rosso usato come decorazione.

## Vincoli

- Pubblico: per la B l'utente ha tolto il vincolo di leggibilità per un pubblico anziano. Corpo del testo 16px, testi secondari fino a 14px, come AudioNova. Contrasti e zone di tocco seguono comunque il buon senso (testo leggibile sul fondo, bottoni cliccabili da telefono).
- Telefono prima di WhatsApp, WhatsApp prima del form (PRODUCT.md).
- Portabilità in WordPress/Elementor, come per A: colori, font e misure come variabili CSS, ogni sezione un componente autonomo, niente librerie JS pesanti.
- Link interni: i testi contengono percorsi assoluti di A (`/servizi/controllo-udito/` ecc.). Nella B vanno riscritti con il prefisso `/proposta-b`, con una funzione unica, così nessun link della B porta per sbaglio alla A. Fanno eccezione gli ancoraggi (`#auricolari`) e i link esterni.
- Foto: si possono aggiungere foto stock gratuite (Unsplash o Pexels, licenza libera) di persone e momenti di vita, scelta dell'utente. Vanno in `public/img/b/`, ciascuna segnata in `CREDITS.md` con fonte e autore. Il Dottore, lo studio e i prodotti restano foto reali del cliente (`public/img/`).
- `noindex` come in A.

## Approcci considerati

1. **Componenti e layout propri per la B, testi condivisi. Scelto dall'utente.**
   - Pagine in `pages/proposta-b/`, layout in `layouts/b/`, componenti in `components/b/`, stile in `styles/b.css`.
   - I testi vengono da `copy/*.ts` e `config.ts`.
   - Pro: le due proposte sono indipendenti, una correzione ai testi vale per entrambe, ognuna si porta in WordPress come set di sezioni a sé.
   - Contro: più file.
2. **Stesse pagine con un tema B attivato da CSS.** Scartato: l'impaginazione della B è troppo diversa e la B sarebbe sembrata la A ricolorata.
3. **Progetto separato con testi duplicati.** Scartato: l'utente ha scelto `/proposta-b/` nello stesso progetto, e due copie dei testi si disallineano.

## Il sistema visivo della B

### Colori (token in `styles/b.css`, con prefisso `--b-`)

| Ruolo | Valore | Uso |
|---|---|---|
| Campo profondo | `#0B1A2C` | barra contatti, card a foto, fasce piene, footer |
| Campo medio | `#3A4F69` | punto d'arrivo delle sfumature, stati hover |
| Accento luminoso | `#B6CAE4` | contorno dei bottoni a pillola su fondo scuro, frecce, quadratini delle icone, sottolineature |
| Fondo tenue | `#E6EDF7` | fondi chiari di sezione, sfumatura verso il bianco (come il verde chiaro sfumato di AudioNova) |
| Bianco | `#FFFFFF` | fondo principale, card bianche, box sovrapposti |
| Testo | `#0B1A2C` su chiaro, `#FFFFFF` su scuro |  |
| Azione | `#DD182D` pieno | solo Chiama e Prenota |

Le sfumature su foto vanno dal campo profondo opaco al trasparente, in diagonale o dal basso, come negli screenshot AudioNova. Su fondo chiaro i contorni e le frecce usano il blu `#3A4F69`, perché l'azzurro sul bianco non si legge.

### Tipografia

- Montserrat, ma con un tono diverso da A. Titoli a peso 500-600 (non 700), interlinea stretta, lettere leggermente ravvicinate, come i titoli "morbidi" di AudioNova.
- Titoli di sezione grandi e spesso centrati.
- Corpo 16px; testi delle card e note 14px.

### Forme

- Angoli molto arrotondati (circa 24px) su card, foto e box.
- Bottoni a pillola alti circa 48px, in due versioni:
  - pieno rosso (azione);
  - contorno luminoso con freccia (navigazione), il segno distintivo della B.
- Ombre leggere solo su box sovrapposti e menu.

### Pezzi ricorrenti (componenti in `components/b/`)

1. **Barra contatti** (campo profondo, sottile, in cima a ogni pagina). Indirizzo/dove siamo, telefono, WhatsApp, contatti, con icone. Su mobile si riduce a telefono e WhatsApp.
2. **Menu.** Bianco, con logo a sinistra, voci da `NAV` e bottone rosso "Chiamami" a destra. Diventa fisso allo scorrimento. Su mobile: menu a tendina.
3. **Testata sfumata (home).** Foto a destra che sfuma nel campo profondo a sinistra. Titolo, lead, bottone rosso Chiamami e bottone a contorno WhatsApp.
4. **Card azione.** Due o tre card bianche con icona su un quadratino colorato, titolo, testo e freccia (come "Prenota un controllo" / "Trova il centro" di AudioNova).
5. **Card a foto** (lo screenshot 1). Griglia "una grande + due impilate", oppure righe da due o tre. Ogni card ha foto, sfumatura dal basso, titolo, testo breve e bottone a contorno con freccia.
6. **Testata interna con box sovrapposto** (lo screenshot 3). Foto a tutta larghezza con velo blu e titolo. In basso un box bianco arrotondato che si sovrappone alla foto con il lead e i bottoni. I breadcrumb restano esclusi, come chiesto dal cliente per A.
7. **Carosello del metodo** (Amplifon). Card con numero, titolo e testo, scorrevoli in orizzontale (scroll-snap), con frecce avanti/indietro e un bottone a contorno a destra.
8. **Sezione divisa con foto** (come "Assistenza AudioNova"). Testo a sinistra con elenco puntato e bottone, foto arrotondate composte a destra.
9. **Fascia piena** (Amplifon). Rettangolo arrotondato a tutta larghezza del contenitore con una frase su una riga, una parola in grassetto e un link con freccia. Due varianti: campo profondo per i messaggi, rosso per l'invito a chiamare.
10. **Recensioni.** Card bianche su fondo tenue sfumato, con badge Google (dati da `RECENSIONI`, `SHOW_REVIEWS`).
11. **Domande frequenti.** Fisarmonica con righe bianche arrotondate e segno più/meno.
12. **Footer** (campo profondo). Logo, colonne da `FOOTER`, contatti, orari, social, riga legale.
13. **Barra mobile Chiama / WhatsApp.** Fissa in basso su mobile, nello stile B.
14. **Link alla proposta A.** Un'etichetta discreta in fondo al footer ("Vedi la proposta A"), per comodità durante la presentazione.

## Pagine e sezioni

Ogni pagina usa i testi del file indicato. L'ordine delle sezioni è quello scritto qui, non quello dei file di testo. L'utente ha scelto "prima i servizi, come le catene": la B segue l'ordine di AudioNova e Amplifon anche dove la A mette prima la persona.

**Home** `/proposta-b/` (`copy/home.ts`)
1. Testata sfumata: `h1`, `lead`, Chiamami, WhatsApp.
2. Card azione: Chiamami (telefono), Scrivimi su WhatsApp, Dove siamo (indirizzo e orari da `config`).
3. Servizi (`serviziTitolo`, `servizi`): card a foto, una grande (Apparecchi acustici) più le altre.
4. Metodo (`metodoTitolo`, `metodoLead`, `metodo`): carosello, con bottone "Il mio metodo" verso Il Centro.
5. Il Dottore: sezione divisa con la foto reale del Dottore, `citazione` e `citazioneFirma`, `plusTitolo`/`plusLead` e `plus` come elenco.
6. Fascia piena profonda: `caroTitolo` con `caroBtn` (al form con `?motivo=caro`).
7. Recensioni.
8. Contatti finali: `contattiTitolo`, `contattiLead`, fascia rossa o box con Chiama e WhatsApp, poi il form (`formTitolo`).

**Il Centro e il Metodo** `/proposta-b/chi-siamo/` (`copy/chi-siamo.ts`)
Testata con box sovrapposto (foto del Dottore o dello studio) → sezione divisa con `chi` e una foto reale → metodo in carosello (`passi`), o in griglia di card numerate se il carosello è già in home: scelta del builder → `principi` come card azione con icona → `vai` come card a foto → fascia finale.

**Apparecchi acustici** `/proposta-b/apparecchi-acustici/` (`copy/apparecchi.ts`)
Testata con box sovrapposto → `criteri` come card bianche con icona → `tipi` come card con foto di prodotto o di persone (card a foto) → `prova` come sezione divisa → `ssn` come fascia piena con bottoni → marchi in fila sobria → `prezzi` come fascia con link → FAQ → fascia finale.

**Prezzi** `/proposta-b/apparecchi-acustici/prezzi/` (`copy/prezzi.ts`)
Testata con box sovrapposto (con la nota "esempio" ben visibile) → `incide` come card bianche → `incluso` come elenco con spunte in una sezione divisa → `fasce` come tre card (la nota "esempio" resta) → `preventivo` + `ssn` come fascia → FAQ → fascia finale.

**Servizi** `/proposta-b/servizi/` (`copy/servizi.ts`, `SERV`)
Testata con box sovrapposto → `righe` come card a foto (griglia una grande + due, poi due) → `auricolari` come sezione divisa con `auricolariUsi` in card con icona → `nonSai` come fascia piena con link al controllo.

**Controllo dell'udito** `/proposta-b/servizi/controllo-udito/` (`CONTROLLO`)
Testata con box sovrapposto → `perchi` come elenco con spunte accanto a una foto → `vita` come passi numerati in fila (stesso stile del carosello, ma statici) → `porta` come fascia → FAQ → fascia finale.

**Riparazione e assistenza** `/proposta-b/servizi/riparazione-assistenza-apparecchi-acustici/` (`RIPARA`)
Testata con box sovrapposto → `casi` come card bianche con icona → `servizi` come sezione divisa con elenco e foto → `altro` come fascia piena → FAQ → fascia finale.

**Contatti** `/proposta-b/contatti/` (`copy/contatti.ts`)
Testata con box sovrapposto (il box contiene telefono, WhatsApp ed email in grande) → indirizzo e orari in due card bianche → form in un box bianco su fondo tenue → `come3` come card azione → mappa a consenso.

**Pagine legali** `/proposta-b/privacy-policy/`, `/cookie-policy/`, `/note-legali/` (`copy/legali.ts`)
Testata semplice (campo profondo con titolo) → testo su colonna leggibile. Riuso del contenuto di `LegalPage`, nello stile B.

## Decisioni già prese

- Strada 1: layout e componenti propri, testi condivisi.
- Tutte le pagine della sitemap.
- Ruoli dei colori come nella tabella sopra.
- Foto stock gratuite ammesse, dichiarate in `CREDITS.md`. L'utente lo ha confermato il 23/11 per la B. Le stock tolte da A il 17/11 erano state sostituite perché erano arrivate le foto reali, non perché il cliente le avesse rifiutate.
- Indirizzo `/proposta-b/`.
- Testi piccoli ammessi (14-16px); vincolo per il pubblico anziano tolto per la B.
- Costruzione direttamente in codice, senza bozzetti dipinti (in questa sessione non c'è la generazione di immagini).

## Lasciato al builder

- La scelta esatta delle foto stock: persone reali in momenti di vita (coppie, famiglie, conversazioni), niente foto palesemente "da catalogo". La luce e i toni devono reggere la sfumatura blu.
- Quali foto reali del cliente usare in quale sezione.
- Le icone di ogni card (dal set di `Icon.astro`, eventualmente esteso).
- Se riusare `ContactForm.astro` e `MapConsent.astro` restilizzandoli da `b.css`, o farne una copia in `components/b/`. Vincolo: non cambiare l'aspetto della A.
- Le animazioni: poche, nello spirito AudioNova (comparsa morbida, zoom leggero della foto all'hover delle card), con rispetto di `prefers-reduced-motion`.
- Il comportamento esatto a ogni larghezza, purché a 390px niente scorra in orizzontale e la barra Chiama/WhatsApp resti visibile.

## Dopo la costruzione

- Verifica su desktop (1440) e mobile (390) di ogni pagina B, e controllo che nessun link della B porti alla A.
- Aggiornamento di `docs/avanzamento-sviluppo.md` con la proposta B.
- Revisione finale con Impeccable e documentazione del sistema B. DESIGN.md oggi descrive la A: il sistema B va documentato in un file a sé (es. `DESIGN-B.md`), per non sovrascrivere quello della A finché il cliente non sceglie.
