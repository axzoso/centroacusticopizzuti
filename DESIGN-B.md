---
name: Centro Acustico Pizzuti · Proposta B
description: Chain-style hearing-care site (AudioNova/Amplifon layout language) dressed in Pizzuti colors; mockup under /proposta-b/.
colors:
  deep: "#0b1a2c"
  mid: "#3a4f69"
  glow: "#b6cae4"
  soft: "#e6edf7"
  white: "#ffffff"
  red: "#dd182d"
  red-deep: "#b9101f"
  text-soft: "#4a5b70"
  on-deep-soft: "#c9d6e8"
  line: "#d5dfec"
typography:
  display:
    fontFamily: "'Montserrat Variable', 'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.125rem, 1.5rem + 2.9vw, 3.625rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Montserrat Variable', 'Montserrat', system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 1.45rem + 1.9vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Montserrat Variable', 'Montserrat', system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.15rem + 0.45vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "'Montserrat Variable', 'Montserrat', system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "'Montserrat Variable', 'Montserrat', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "'Montserrat Variable', 'Montserrat', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Montserrat Variable', 'Montserrat', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  section: "clamp(4rem, 8vw, 7rem)"
  container: "80rem"
  grid-gap: "1.25rem"
  card-pad: "1.75rem"
components:
  button-call:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 1.5rem"
    height: "48px"
  button-call-hover:
    backgroundColor: "{colors.red-deep}"
  button-line-on-deep:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    height: "48px"
  button-line-on-deep-hover:
    backgroundColor: "{colors.glow}"
    textColor: "{colors.deep}"
  button-line-on-light:
    backgroundColor: "transparent"
    textColor: "{colors.deep}"
    rounded: "{rounded.pill}"
    height: "48px"
  button-line-on-light-hover:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.white}"
  button-white:
    backgroundColor: "{colors.white}"
    textColor: "{colors.deep}"
    rounded: "{rounded.pill}"
    height: "48px"
  action-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.deep}"
    rounded: "{rounded.lg}"
    padding: "1.75rem"
  photo-card:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "clamp(1.5rem, 3vw, 2.25rem)"
  method-step:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.deep}"
    rounded: "{rounded.lg}"
    padding: "1.75rem"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.deep}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1rem"
    height: "52px"
  nav-link-active:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.deep}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 0.9rem"
---

# Design System: Centro Acustico Pizzuti · Proposta B

Scope: only the `/proposta-b/` mockup (`mockup/src/styles/b.css`, `components/b/`, `layouts/b/`, `pages/proposta-b/`). Proposal A is documented separately in `DESIGN.md`; nothing here applies to it.

## Overview

**Creative North Star: "The Chain Storefront, in Pizzuti Blue"**

B borrows the layout grammar of the big hearing-care chains (AudioNova first, Amplifon second): services first, large rounded photo cards that dissolve into a solid colour field, a slim contact bar, pill buttons with an arrow, a swipeable method carousel, full-width rounded bands. Only the language is borrowed. No third-party logos, copy, or photos appear anywhere; all copy comes from the shared `copy/*.ts`, and the colours are Pizzuti's.

Density is that of a contemporary commercial site: 16px body, 14px secondary text (accepted by the user for B, which drops A's older-reader legibility constraint while keeping readable contrast and phone-sized tap targets). Headings are soft and tight (600, negative tracking), never heavy. Depth comes from photos fading into the deep field plus light, diffuse shadows on things that sit on top of other things.

**Key Characteristics:**
- Photo-to-deep fades: hero, inner-page header, photo cards and photo band all dissolve a real or stock photo into solid `deep`.
- Very rounded geometry (24px) on cards, photos, boxes and bands; pills (999px) on every button and nav item.
- 48px pill buttons; navigation buttons carry a trailing arrow that nudges 4px on hover.
- Red is an action colour only, never decoration.
- Card grids alternate with plain ruled row lists so pages do not become walls of cards.

## Colors

A two-tone blue world (deep navy field, pale sky light) on white, with a single red reserved for calling.

### Primary
- **Deep Field** (`deep`): the solid field of the contact bar, hero, inner-header veil, photo cards, bands, first method step, footer; also primary text on light.
- **Slate Mid** (`mid`): where deep gradients arrive (radial in the deep band), outlines and arrows on light backgrounds, hover borders, focus ring on light, step numbers.

### Secondary
- **Sky Glow** (`glow`): the light on dark. Outline of pill buttons on deep, arrows and icons on deep, icon tiles and check dots on light, focus ring on deep, hover fill of outline buttons, footer column titles.

### Tertiary
- **Call Red** (`red`, hover `red-deep`): filled Chiama / Chiamami / Prenota chiamando buttons, the header CTA, the "Richiamami" submit, the red band inviting a call, form-validation borders.

### Neutral
- **White** (`white`): main page ground, white cards, overlapping boxes, form box.
- **Mist** (`soft`): soft section grounds (flat, or a white-to-mist vertical gradient), method steps, active nav pill, FAQ icon discs, legal TOC.
- **Ink Soft** (`text-soft`): secondary text on white (about 7:1).
- **On-Deep Soft** (`on-deep-soft`): secondary text on deep fields.
- **Hairline** (`line`): 1px borders of white cards, FAQ rows, row lists, inputs (1.5px).

### Named Rules
**The Red Means Call Rule.** Red fills only buttons and bands whose action is calling or booking by phone. If the action is navigation, WhatsApp, or reading more, it is an outline or white pill.

**The Glow Lives on Deep Rule.** Sky glow is legible only on deep. On white, outlines and arrows switch to `mid` (`button-line-on-light`); glow appears on light only as a filled tile behind a deep icon.

## Typography

**Display / Body Font:** Montserrat Variable (fallback Montserrat, system-ui, Segoe UI, sans-serif). One family throughout.

**Character:** soft, compact, commercial. Weight 600 for headings (never 700+), 500 for nav and step numbers, tight leading and slight negative tracking.

### Hierarchy
- **Display** (600, fluid 34-58px, 1.08, -0.025em): page H1 in hero and inner headers, max about 22ch.
- **Headline** (600, fluid 30-44px, 1.15): section titles, often centered.
- **Title** (600, fluid 20-24px, 1.25): card and step titles; big photo card up to 32px.
- **Lead** (400, fluid 17-20px, 1.55, max 60ch): intro paragraphs; `text-soft` on light, `on-deep-soft` on deep.
- **Body** (400, 16px, 1.6): running text, max about 62-68ch.
- **Small** (400, 14px, 1.55): card copy, notes, contact bar, footer, labels.
- **Label** (600, 15px): buttons and nav.
- Band statement: 400 with one `<strong>` phrase at 600, fluid 21-30px (40px with photo).

### Named Rules
**The 14px Floor Rule.** Nothing smaller than 14px (`small`). Body stays 16px.

## Layout

Container 80rem with fluid gutter; sections pad `section` vertically (60% for tight bands). Grids use a 1.25rem gap. Section heads are left or centered, or a row with title left and an outline pill right (stacks under 720px). Photo cards use a bento (one large spanning two rows, 1.15fr/1fr) or auto-fit rows of 16rem minimum; action cards 2-4 columns, collapsing to a horizontal icon-title-arrow row under 600px. Split sections are 1fr/1fr text plus photo, optionally a duo of photos (large plus a bordered smaller overlap). Breakpoints in use: 420, 560, 600, 720, 760, 820, 860, 960, 1024, 1100px. Under 960px the nav becomes a menu-button dropdown; under 720px a fixed bottom bar offers Chiama (red) and WhatsApp (outline). Mobile heroes put the photo on top fading down into the deep text block.

## Elevation & Depth

Mostly flat; depth comes from photo-to-deep gradients and tonal grounds. Two diffuse navy shadows, used only for things that overlap or lift.

### Shadow Vocabulary
- **Overlap** (`0 18px 40px -18px rgba(11,26,44,0.35)`): inner-header white box, form box, overlapping duo photo.
- **Lift** (`0 6px 18px -8px rgba(11,26,44,0.25)`): stuck header, review cards, quote card, open FAQ row, hovered link card.

### Named Rules
**The Fade Not Frame Rule.** Photos on deep never get a border or hard edge; they dissolve into `deep` through a gradient (sideways on desktop, upward on mobile and in photo cards).

## Shapes

Large radius 24px on cards, photos, bands, form box, map, header box; 16px on FAQ rows, quote, legal TOC, mobile nav items; 12px on inputs, icon tiles, form messages. Pills (999px) for every button, nav item and brand chip; circles for carousel arrows, social links, FAQ toggles and check dots. Borders are 1px hairlines; outline buttons use 2px.

## Components

### Buttons
- **Shape:** pill, minimum 48px high (46px in the mobile bar), 15px/600, icon 18px.
- **Call:** red fill, white text, phone icon leading; hover `red-deep`.
- **Outline on deep:** 2px glow border, white text; hover fills glow with deep text.
- **Outline on light:** 2px `mid` border, deep text; hover fills deep with white text.
- **White:** on the red band only.
- Navigation buttons end with an arrow that slides 4px on hover. Text links in `mid`, 600, with an arrow.

### Cards / Containers
- **Action card:** white, hairline border, 24px radius, 48px glow tile with deep 22px stroke icon, title, 14px text, `mid` arrow bottom-right; link cards lift 3px with `mid` border on hover.
- **Photo card:** photo on deep with an upward scrim (deep opaque to transparent by 90%), title and 14px text bottom, outline-on-deep pill; hover zooms photo 1.05 and fills the pill glow. Whole card is clickable.
- **Review card:** white, lift shadow, large glow quote mark, Google badge above the grid.

### Inputs / Fields
1.5px hairline, 12px radius, 52px high, 14px/600 labels; hover and focus switch border to `mid`, focus adds a 4px glow halo. Invalid after submit: red border.

### Navigation
Slim deep contact bar (40px, 14px, glow icons). White sticky header (76px), logo left, centered pill nav (active and hover in `soft`), red Chiamami right; gains the lift shadow when stuck. Deep footer, five columns, glow column titles, circular outline social links.

### Hero (signature)
Deep field, photo on the right 64% fading leftward into deep; H1, lead, Call + outline-on-deep WhatsApp. Photo settles from scale 1.07, text rises in staggered.

### Inner Header with Overlapping Box (signature)
Full-width photo under a deep veil with the H1, then a white 24px box with the overlap shadow rising over the photo's bottom edge, holding the lead, optional note and the action pills.

### Band (signature)
Rounded full-container band with one statement sentence, a bold phrase and an arrow pill. Deep variant uses a radial `mid`-to-`deep` gradient; red variant only for calling; photo variant places a photo on the right 58% fading into deep (photo on top on mobile).

### Method Carousel
Scroll-snap track of 20rem `soft` steps with large `mid` numbers, the first step inverted to deep with glow number; circular prev/next arrows in the section head. A static grid variant (3-4 columns) is used where the carousel already appeared.

### Row List
Ruled definition list (title | text, optionally numbered 01, 02 in `mid`), one or two columns, hairlines top and bottom. Used instead of a card grid when content is just name plus explanation.

## Do's and Don'ts

### Do:
- **Do** fade every photo on deep into the solid field; no hard photo edges on deep.
- **Do** keep red for call/book actions; WhatsApp and navigation are outline pills.
- **Do** use `glow` for outlines and arrows on deep and `mid` on light.
- **Do** alternate card grids with row lists, split sections and bands.
- **Do** use the client's real photos for the Doctor, the studio and products; stock (Unsplash, credited in `mockup/public/img/CREDITS.md`, stored in `mockup/public/img/b/`) only for lifestyle moments.

### Don't:
- **Don't** use any chain's logos, wording or photos; only the layout language is borrowed.
- **Don't** use generated images.
- **Don't** set text below 14px or headings above weight 600.
- **Don't** put shadows on resting flat cards; shadows mark overlap or lift.
- **Don't** reproduce proposal A's signature devices (portrait in an arch, heavy 700+ titles); ruled row lists are fine as an occasional alternative to cards, not as the page's main structure.
