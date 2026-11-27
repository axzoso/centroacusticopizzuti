# Guida alla manutenzione del sito Centro Acustico Pizzuti

Questa guida è per chi gestisce il sito ogni giorno (o subentra nella manutenzione) senza dover leggere il codice. Si consulta anche da WordPress: menu **Centro Pizzuti → Guida**.

## Com'è fatto il sito

- **WordPress + tema Hello Elementor + Elementor 4 (widget atomici) + Elementor Pro**: pagine, header, footer, barra mobile Chiama/WhatsApp e pagina 404 sono costruiti con Elementor.
- **Plugin `pizzuti-core` (questo plugin)**: contiene grafica, caratteri locali, dati del Centro (telefono, indirizzo, orari, P.IVA, social, recensioni), SEO, dati strutturati, anti-spam e modalità prova dei moduli, ottimizzazione immagini e mappa a consenso. **Non disattivarlo: senza questo plugin il sito perde grafica, recapiti dinamici e protezioni.**

## Regole d'oro

- **I dati del Centro stanno in un solo posto**: per cambiare numero di telefono, WhatsApp, indirizzo, orari, P.IVA, social o recensioni vai in **Centro Pizzuti → Dati del Centro**. Header, footer, barra mobile, pagina Contatti e dati strutturati si aggiornano da soli.
- **Le classi nei widget Elementor sono solo etichette** (es. `container`, `sec-head`, `lead`, `home-hero`, `btn-primary`): lo stile vero arriva dal plugin. Non dare stile alle classi dal pannello di Elementor e lascia **vuoto** il CSS personalizzato del kit.
- **Piccoli ritocchi grafici**: usare **Centro Pizzuti → Stile → CSS aggiuntivo** (non modificare mai a mano `pizzuti.css`, che viene rigenerato).
- **Moduli di contatto**: il campo anti-spam **Honeypot** deve restare l'**ultimo** campo del modulo (la scheda **Stato** lo controlla in automatico).

## Operazioni comuni

### Aggiornare telefono, orari, indirizzo o recensioni
- Vai in **Centro Pizzuti → Dati del Centro**, aggiorna i campi e togli la spunta **"Dato di esempio"** man mano che inserisci i dati reali.
- Finché un campo resta marcato come esempio, la scheda **Stato** lo segnala in rosso e i dati strutturati `LocalBusiness` non vengono pubblicati su Google.
- Nella stessa scheda puoi accendere o spegnere le recensioni (**Mostra recensioni**).

### Modificare testi o immagini di una pagina
- Apri **Pagine**, clicca **Modifica con Elementor** sulla pagina desiderata e aggiorna testi o foto.
- Per le immagini usa foto luminose e nitide (almeno 1400 px di larghezza per le testate) e compila sempre il **Testo alternativo** nella Libreria media.

### SEO (titolo e descrizione per Google)
- Apri la pagina in **Pagine → Modifica** (editor WordPress, non Elementor): in fondo trovi il riquadro **SEO Pizzuti** con **Titolo SEO** (consigliato entro 60 caratteri) e **Descrizione SEO** (120-160 caratteri). Se lasciati vuoti, il plugin usa valori calcolati.
- Se in futuro si installa **Yoast SEO** (o Rank Math / AIOSEO), `pizzuti-core` si fa da parte in automatico per evitare duplicati e in **Centro Pizzuti → SEO** compare il pulsante **Copia in Yoast**.

### Moduli di contatto e prove
- Destinatario, oggetto e campi del modulo si cambiano aprendo la pagina **Contatti** (o la Home) in Elementor e selezionando il modulo.
- Per provare l'invio senza scrivere al cliente: **Centro Pizzuti → Moduli → Modalità prova**. Le email vengono intercettate e mostrate nel registro della stessa pagina. **Ricorda di spegnere la modalità prova** dopo il test.
- In produzione installare e configurare un plugin SMTP (es. WP Mail SMTP) per evitare che le richieste finiscano nello spam.

### Pubblicare una pagina in bozza o svuotare le cache
- Vai in **Centro Pizzuti → Manutenzione**: puoi svuotare in un clic la cache di Elementor e di WordPress, rigenerare i permalink e pubblicare le pagine in bozza.

## Aggiornare il plugin

- **Plugin → Aggiungi nuovo → Carica plugin** con il nuovo file `pizzuti-core.zip` (sostituisce la versione installata).
- Dopo l'aggiornamento vai in **Centro Pizzuti → Manutenzione → Svuota cache**, poi controlla **Centro Pizzuti → Stato**.

## Prima di andare online (checklist)

1. Sostituire tutti i **Dati del Centro** di esempio e togliere le spunte "esempio".
2. Far verificare da un consulente legale le pagine **Privacy Policy**, **Cookie Policy** e **Note legali**.
3. Configurare un **plugin SMTP** per l'invio affidabile delle email e un **banner cookie** per i contenuti di terze parti.
4. Spegnere la **Modalità prova** dei moduli (se accesa).
5. Disattivare **Scoraggia i motori di ricerca** in **Impostazioni → Lettura** solo sul dominio definitivo.
