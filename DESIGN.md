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

<!-- impeccable:design-map -->
Name: Centro Acustico Pizzuti
Colors: primary: blue #3a4f69; secondary: sky #b6cae4; tertiary: red #dd182d; neutral: paper #ffffff; primary: ink #0b1a2c; secondary: sky-soft #e6edf7; tertiary: red-deep #b9101f (+2 more in the sidecar)
Fonts: Montserrat Variable (display, headline, title, body, lead, label)
Spacing: gutter clamp(1.25rem, 5vw, 3rem), section clamp(4rem, 9vw, 8rem), measure 62ch, row 1.5rem
Radius: sm 0.875rem, md 1.25rem, pill 999px
North Star: "Lo studio del Dottore"
Rules:
- The Un Solo Rosso Rule. Il rosso (#dd182d) segnala dove si contatta il Centro (più tre accenti di percorso: contatori del metodo, numeri dei passi, freccia dei box).
- The Fondi Piani Rule. Le sezioni cambiano per campo pieno, non per gradienti (eccezioni: velatura sulle foto di apertura e tono `fade` sky→sky-soft delle testate senza foto).
- The Venti Pixel Rule. Nessun testo corrente sotto 1.25rem, nemmeno dentro box, tessere e passi; `--step--1` (1rem) solo per etichette, note, footer.
- The Peso Non Dimensione Rule. Titolo e corpo si distinguono per peso e scala; il tracking si stringe man mano che il titolo cresce (da -0.02em a -0.04em).
- The Niente Ombre Rule. Nessuna ombra decorativa.
Don't:
- Don't usare ombre decorative o gradienti; non mettere due sezioni di box una dopo l'altra.
- Don't introdurre un secondo carattere o un colore fuori dalla palette del brandbook.
- Don't impostare testo corrente sotto 1.25rem.
- Don't usare il rosso per decorazione o per elementi senza azione di contatto, fuori dai tre accenti di percorso.
Do:
- Do usare `red` solo per telefono, WhatsApp e CTA di contatto, più i tre accenti di percorso (contatori del metodo, numeri dei passi, freccia dei box).
- Do mantenere corpo a `--step-0` (20px+) e bersagli di tocco da 3.5-3.75rem.
- Do alternare tono, impianto e contenuto tra sezioni consecutive.
- Do ridefinire per pagina solo `--bg`, `--fg-soft`, `--line`.
- Do rispettare prefers-reduced-motion: niente comparse, svelature né sollevamenti.
- Do dichiarare i dati di esempio (telefono, indirizzo, orari, P.IVA) in `config.ts`.
Map: Foto/
Map: mockup/public/img/
Full: .impeccable/design-full.md (read a section when you need its detail)
