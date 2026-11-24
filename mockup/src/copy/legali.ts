// Testi legali: BOZZE DI ESEMPIO, da far verificare a un consulente legale / DPO.
import { SITE } from '../config';
const titolare = `${SITE.societa}, ${SITE.indirizzo}, ${SITE.partitaIva}, email ${SITE.email}, telefono ${SITE.telefonoVisibile}`;
const AGG = '17 novembre 2026';

export const PRIVACY = {
  title: 'Privacy Policy · Centro Acustico Pizzuti',
  description: 'Informativa sul trattamento dei dati personali raccolti tramite il sito del Centro Acustico Pizzuti di Cosenza.',
  h1: 'Privacy Policy', crumb: 'Privacy Policy', aggiornato: AGG,
  sezioni: [
    { titolo: 'Titolare del trattamento', testo: [`Il titolare del trattamento è ${titolare}.`, 'Per esercitare i tuoi diritti o chiedere informazioni sul trattamento puoi scrivere all’indirizzo email indicato.'] },
    { titolo: 'Quali dati raccogliamo', testo: ['Attraverso il sito possiamo trattare:', ['dati che inserisci nel modulo di contatto: nome, numero di telefono, motivo della richiesta ed eventuale messaggio;', 'dati che ci invii scrivendoci via email o WhatsApp;', 'dati di navigazione (indirizzo IP, browser, pagine visitate), raccolti in forma tecnica o, previo consenso, tramite cookie di analisi.'], 'Ti chiediamo di non inserire nel modulo informazioni sulla tua salute non necessarie: ne parleremo di persona.'] },
    { titolo: 'Perché trattiamo i tuoi dati e su quale base', testo: [['rispondere alla tua richiesta e ricontattarti: base giuridica, misure precontrattuali e il tuo consenso;', 'adempiere a obblighi di legge: base giuridica, obbligo legale;', 'analizzare in forma aggregata l’uso del sito: base giuridica, il tuo consenso (cookie di analisi);', 'garantire la sicurezza del sito: legittimo interesse del titolare.']] },
    { titolo: 'Per quanto tempo li conserviamo', testo: ['I dati del modulo di contatto sono conservati per il tempo necessario a gestire la tua richiesta e, in ogni caso, non oltre 12 mesi, salvo che da essa nasca un rapporto con il Centro. I dati di analisi sono conservati secondo i tempi descritti nella Cookie Policy.'] },
    { titolo: 'A chi comunichiamo i dati', testo: ['I dati non sono diffusi. Possono essere trattati da fornitori che ci aiutano a gestire il sito (hosting, manutenzione, strumenti di analisi), nominati responsabili del trattamento, e da soggetti a cui siamo tenuti a comunicarli per legge.', 'Non trasferiamo i dati fuori dallo Spazio Economico Europeo, salvo quanto descritto nella Cookie Policy per gli strumenti di terze parti, con le garanzie previste dalla normativa.'] },
    { titolo: 'I tuoi diritti', testo: ['Puoi chiedere in ogni momento:', ['l’accesso ai tuoi dati e una copia;', 'la rettifica o la cancellazione;', 'la limitazione o l’opposizione al trattamento;', 'la portabilità dei dati;', 'la revoca del consenso, senza effetto sul trattamento già avvenuto.'], 'Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).'] },
    { titolo: 'Modifiche a questa informativa', testo: ['Possiamo aggiornare questa informativa. La data in alto indica l’ultima revisione.'] },
  ],
};

export const COOKIE = {
  title: 'Cookie Policy · Centro Acustico Pizzuti',
  description: 'Informazioni sui cookie utilizzati dal sito del Centro Acustico Pizzuti e su come gestire le tue preferenze.',
  h1: 'Cookie Policy', crumb: 'Cookie Policy', aggiornato: AGG,
  sezioni: [
    { titolo: 'Cosa sono i cookie', testo: ['I cookie sono piccoli file di testo che il sito salva sul tuo dispositivo per farlo funzionare, ricordare le tue scelte o misurare come viene usato.'] },
    { titolo: 'Cookie tecnici', testo: ['Sono necessari al funzionamento del sito e non richiedono il tuo consenso. Servono, ad esempio, a ricordare le tue preferenze sui cookie.'] },
    { titolo: 'Cookie di analisi', testo: ['Se acconsenti, usiamo uno strumento di analisi (esempio: Google Analytics 4 con IP anonimizzato) per capire quali pagine sono più utili. I dati sono aggregati.', 'Durata massima di conservazione: 14 mesi (esempio).'] },
    { titolo: 'Servizi di terze parti', testo: ['Alcune pagine possono incorporare contenuti di terzi, come la mappa di Google Maps. Questi servizi possono installare propri cookie, che vengono caricati solo dopo il tuo consenso.'] },
    { titolo: 'Come gestire le tue preferenze', testo: ['Puoi modificare o revocare il consenso in ogni momento dal pannello delle preferenze sui cookie del sito. Puoi anche bloccare o cancellare i cookie dalle impostazioni del tuo browser: Chrome, Firefox, Safari ed Edge spiegano come farlo nelle rispettive guide.'] },
    { titolo: 'Titolare e contatti', testo: [`Il titolare è ${titolare}. Per altre informazioni consulta la nostra Privacy Policy.`] },
  ],
};

export const NOTE = {
  title: 'Note legali · Centro Acustico Pizzuti',
  description: 'Note legali e dati identificativi del Centro Acustico Pizzuti di Cosenza.',
  h1: 'Note legali', crumb: 'Note legali', aggiornato: AGG,
  sezioni: [
    { titolo: 'Chi siamo', testo: [`Il sito è gestito da ${titolare}.`, 'Sede, partita IVA e contatti sono quelli indicati sopra (dati di esempio da sostituire con quelli reali, inclusi eventuale numero REA e PEC).'] },
    { titolo: 'Natura informativa dei contenuti', testo: ['I contenuti del sito hanno scopo informativo e non sostituiscono il parere di un medico. Per qualsiasi problema di udito, ti invitiamo a rivolgerti a uno specialista.', 'I dispositivi medici descritti vanno usati secondo le istruzioni d’uso. I prezzi e le condizioni indicati sono indicativi.'] },
    { titolo: 'Proprietà intellettuale', testo: ['Testi, grafica, logo e immagini del sito sono di proprietà del titolare o utilizzati con licenza. Non possono essere riprodotti senza autorizzazione. Le fotografie di repertorio sono tratte da Pexels, con licenza che ne consente l’uso.'] },
    { titolo: 'Link a siti esterni', testo: ['Il sito può contenere link a siti di terzi. Non siamo responsabili dei loro contenuti né delle loro politiche sulla privacy.'] },
    { titolo: 'Responsabilità', testo: ['Ci impegniamo a mantenere il sito corretto e aggiornato, ma non possiamo garantirne l’assenza di errori o interruzioni.'] },
    { titolo: 'Legge applicabile', testo: ['Il sito è regolato dalla legge italiana. Per ogni controversia è competente il foro del luogo di residenza o domicilio del consumatore, se in Italia.'] },
    { titolo: 'Privacy e cookie', testo: ['Trovi le informazioni sul trattamento dei dati nella Privacy Policy e quelle sui cookie nella Cookie Policy.'] },
  ],
};
