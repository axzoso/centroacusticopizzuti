# tools/ — strumenti di conversione, rilascio e verifica WordPress

Script Node 22+ senza dipendenze, Python (Pillow) e PowerShell adattati da `artes/tools/`.
Nessuna credenziale nel repository: `tools/mcp-client.js` legge URL e credenziali da
`~/.gemini/config/mcp_config.json` o da `tools/.mcp-locale.json` (ignorato da Git).
Backup, ZIP e schermate vanno in `tools/out/` (ignorata da Git).

## Comandi disponibili

| Comando | A cosa serve |
|---|---|
| `node tools/port-css.js [--out ...]` | **Genera** `wp/pizzuti-core/pizzuti.css` da `mockup/src/styles/base.css` + `sections.css` + `<style is:global>` proposta A + `tools/css/reset.css` + `tools/css/adattamenti.css` |
| `.\tools\install-plugin.ps1 [-SoloZip]` | Controlla `php -l`, impacchetta `wp/pizzuti-core/` in `tools/out/pizzuti-core.zip` (barre `/`), carica, installa/attiva su staging, verifica versione e svuota cache |
| `node tools/push-asset.js [pizzuti.css] [pizzuti.js]` | Giro veloce su CSS/JS del plugin senza reinstallare lo ZIP |
| `py -3 tools/favicon.py` | Genera `wp/pizzuti-core/icone/{favicon.ico,apple-touch-icon.png,icona-512.png}` da `mockup/public/logos/mark-color.png` |
| `node tools/import-media.js --piano\|--esegui\|--rollback` | Carica in Libreria media le 17 immagini della proposta A con nomi file SEO e alt e aggiorna `tools/css/immagini.json` |
| `node tools/setup-staging.js --piano\|--esegui\|--rollback` | Impostazioni di staging (`noindex`, permalink, fuso, Google Fonts Elementor) + pulizia prova Fase 1 |
| `node tools/verifica-font.js [url…]` | Verifica 0 richieste a Google Fonts e caricamento locale di Montserrat Variable |
| `node tools/verifica-fase2.js` | Verifica sola lettura di scheda Stato, 7 schede admin, 9 shortcode e frontend |
| `node tools/crea-menu.js --piano\|--esegui\|--rollback` | Crea i 5 menu WordPress nativi (`menu-principale`, `menu-mobile`, `footer-il-centro`, `footer-servizi`, `footer-legali`) |
| `node tools/costruisci-fase3.js --piano\|--esegui\|--rollback` | Crea/aggiorna i 4 template Theme Builder Elementor Pro **in bozza** (`header`, `footer`, `floating-buttons`, `error-404`) e collega i 5 `nav-menu` ai menu WP |
| `node tools/verifica-fase3.js` | Verifica di parità dei 4 template Fase 3 in bozza (1440/390/320 px), menu mobile interattivo, voce attiva, 0 Google Fonts, 0px scroll X |
| `node tools/costruisci-fase4.js --piano\|--esegui\|--rollback [--solo ...]` | Crea/aggiorna le 11 pagine WordPress della proposta A **in bozza** (100% atomiche V4, gerarchia URL e meta SEO dal mockup) |
| `node tools/verifica-fase4.js [--solo ...]` | Verifica parità (1440 e 390 px), H1, SEO title/desc, immagini, FAQPage JSON-LD, 0 Google Fonts e 0px scroll X sulle 11 pagine in bozza |
| `node tools/collaudo-modulo.js` | Collaudo end-to-end dei moduli `e-form` di Contatti e Home in modalità prova (`?motivo=`, invio, honeypot, anti-spam 4 link) |
| `node tools/parita.js <nome> <url-mockup> <url-staging\|@id>` | Confronto pixel a pixel, Δ altezza e scroll orizzontale (1440, 390, 320 px) |
| `node tools/affianca.js <nome> <larghezza> <y0> <y1> [--diff]` | Affianca gli screenshot di `parita.js` |
