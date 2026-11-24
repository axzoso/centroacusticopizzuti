// Dati del Centro. TUTTO CIÒ CHE È MARCATO "ESEMPIO" È UN SEGNAPOSTO INVENTATO
// per la validazione: va sostituito con i dati reali prima della pubblicazione.
export const SITE = {
  nome: 'Centro Acustico Pizzuti',
  dottore: 'Dott. Pasqualino Pizzuti',
  citta: 'Cosenza',
  // ESEMPIO
  telefonoVisibile: '0984 123 456',
  telefonoHref: 'tel:+390984123456',
  whatsappHref: 'https://wa.me/390984123456?text=Buongiorno%2C%20vorrei%20prenotare%20un%20controllo%20dell%27udito.',
  email: 'info@centroacusticopizzuti.it',
  indirizzo: 'Via Roma 45, 87100 Cosenza (CS)',
  mappaQuery: 'Via Roma 45, 87100 Cosenza',
  orari: [
    { giorni: 'Lunedì – Venerdì', ore: '9:00 – 13:00 · 16:00 – 19:30' },
    { giorni: 'Sabato', ore: '9:00 – 13:00' },
    { giorni: 'Domenica', ore: 'Chiuso' },
  ],
  societa: 'Centro Acustico Pizzuti di Pasqualino Pizzuti',
  partitaIva: 'P.IVA 00000000000',
  social: [
    // ESEMPIO: sostituire con le pagine reali del Centro
    { nome: 'Facebook', icona: 'facebook', href: 'https://www.facebook.com/' },
    { nome: 'Instagram', icona: 'instagram', href: 'https://www.instagram.com/' },
  ],
};

// Menu principale (dalla sitemap: Home | Il Centro | Apparecchi acustici | Servizi | Contatti)
export const NAV = [
  { label: 'Il Centro', href: '/chi-siamo/' },
  { label: 'Apparecchi acustici', href: '/apparecchi-acustici/' },
  { label: 'Servizi', href: '/servizi/' },
  { label: 'Contatti', href: '/contatti/' },
];

// Colonne del footer
export const FOOTER = [
  {
    titolo: 'Il Centro',
    voci: [
      { label: 'Home', href: '/' },
      { label: 'Il Centro e il Metodo', href: '/chi-siamo/' },
      { label: 'Apparecchi acustici', href: '/apparecchi-acustici/' },
      { label: 'Prezzi', href: '/apparecchi-acustici/prezzi/' },
      { label: 'Contatti', href: '/contatti/' },
    ],
  },
  {
    titolo: 'Servizi',
    voci: [
      { label: 'Tutti i servizi', href: '/servizi/' },
      { label: 'Controllo dell’udito', href: '/servizi/controllo-udito/' },
      { label: 'Riparazione e assistenza', href: '/servizi/riparazione-assistenza-apparecchi-acustici/' },
      { label: 'Auricolari su misura', href: '/servizi/#auricolari' },
    ],
  },
];

// Pagine obbligatorie per legge (da sviluppare dopo le pagine della sitemap)
export const LEGALI = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Cookie Policy', href: '/cookie-policy/' },
  { label: 'Note legali', href: '/note-legali/' },
];

// Recensioni Google reali fornite dal cliente (da confermare l'uso con nome abbreviato).
export const SHOW_REVIEWS = true;
export const RECENSIONI = [
  { testo: 'Pienamente soddisfatto del lavoro svolto dal Dott. Pizzuti, che con professionalità, gentilezza e pazienza ha individuato e risolto il problema dell’udito a mia madre. Consiglio di affidarsi con fiducia alla sua persona. Inoltre disponibilissimo al post vendita.', nome: 'Fulvio C.', luogo: 'recensione su Google' },
  { testo: 'Professionalità e cortesia sono elementi a dir poco distintivi. Disponibilità assoluta, ma soprattutto partecipazione alle problematiche che si hanno e che solo chi le ha può conoscere.', nome: 'Giancarlo M.', luogo: 'recensione su Google' },
];

// Marchi trattati (dalle foto fornite dal cliente): da confermare l'elenco completo.
export const MARCHI = ['Signia', 'Bernafon'];
