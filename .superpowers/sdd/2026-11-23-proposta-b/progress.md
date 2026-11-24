# SDD ledger — plan: docs/superpowers/plans/2026-11-23-proposta-b.md
Setup: Ruling: niente worktree/git (la cartella non è un repo) — lavoro in place, checkpoint = build+check — se serve rollback, i file B sono tutti nuovi e isolati (cancellabili), A non viene toccata.
Pre-flight: T3 consuma bHref/BaseB/IconB/.b-* da T1 e foto da T2; T4-7 consumano props T3 — nessun conflitto (definiti nello stesso piano).
Task 1: complete (test:b 2/2 PASS; check:b fallisce solo per le 10 pagine mancanti come atteso; struttura verificata a 1559px)
Task 2: Ruling: 7 foto stock invece di 10, nomi diversi dal piano (coppia-tavola, caffe-conversazione, nonno-nipote, abbraccio-nonna, telefono-sorriso, amici-risata, videochiamata-coppia) — ricerca Unsplash lenta (API bloccata), e orecchio/prodotti/auricolari sono già coperti dalle foto reali del cliente; nuoto/musica/lavoro restano icone — costo: qualche foto riusata su più pagine.
Task 2: complete (7 file in public/img/b, 1600px, ≤320KB, crediti in CREDITS.md)
Task 3: Ruling: niente pagina libreria-b separata — i componenti si verificano direttamente sulle pagine reali, a 1559px e 390 (iframe in public/__mobile.html, da cancellare a fine lavori) — costo: nessuno, stesse verifiche.
Task 3: complete (13 componenti B + stili; home verificata desktop/mobile, scrollWidth=390)
Task 4: complete (home B nell'ordine della spec; verificata desktop e 390)
Task 5: complete (chi-siamo, apparecchi, prezzi; verificate a 1559px; header chi-siamo su studio-ufficio.jpg perché dottore-studio è troppo piccola per una testata larga)
Task 6: complete (servizi, controllo-udito, riparazione)
Task 7: complete (contatti + 3 legali; check:b OK 11 pagine; motivo caro/ssn/auricolari precompilati; scrollWidth 390 su tutte le 11 pagine)
Task 8: Ruling: catture mobile 390 via iframe (__mobile.html) ritagliate, perché Chrome non scende sotto ~500px — costo: nessuno, viewport effettivo 390.
Task 8: Ruling: breadcrumb (proposto dal revisore) non adottato — il cliente li ha tolti dalla sitemap — costo: navigazione di ritorno solo dal menu.
Task 8: Ruling: sostituite foto su indicazione del revisore (Endoauricolari→auricolari-su-misura; inset home/chi-siamo→dottore-apparecchio; testata contatti→b/telefono-sorriso; testata servizi→familiare-supporto) — costo: la foto auricolari compare due volte.
Task 8: Ruling: griglie di icon-card riformate in RowList/SplitFeature (apparecchi criteri, prezzi incide, riparazione casi/servizi, chi-siamo principi); restano striscia contatti home e 4 card auricolari (link reali) — costo: nessuno.
Task 8: Ruling: niente embed-prompt — nessuna immagine generata, provenienza foto in public/img/CREDITS.md — costo: nessuno.
Task 8: complete (finish review: fix → verdict pass 8/8 resolved, disposition ship; check:b OK 11 pagine; test:b 2/2)
Final: minor (deferred): foto auricolari-su-misura usata due volte (Endoauricolari e Auricolari su misura).
Final: Ruling: .b-hint del form portato da 13 a 14px — rispetta la soglia minima 14px decisa dall'utente — costo: nessuno.
Final: minor (deferred): colori fissi fuori dai token per box errore del form e nota bozza legali.
Final: minor (deferred): foto prodotto di produttori (Signia, Bernafon) da far confermare al cliente prima della pubblicazione.
