---
name: Klai Chumchon
description: Community problem reporting and tracking, a plum stage around a calm bone workspace.
colors:
  plum: "#2c1338"
  heather: "#412a4c"
  magenta: "#e57cd8"
  bone: "#fefbfa"
  canvas-wash: "#f8f1f2"
  silver: "#d5d0d7"
  bubblegum: "#f7d8f3"
  blush: "#fdeae2"
  petal: "#fcf1f8"
  mauve: "#6b5a74"
  amber-accent: "#ffde91"
  status-pending: "#ef4444"
  status-in-progress: "#f59e0b"
  status-resolved: "#22c55e"
  status-pending-ink: "#9b1c1c"
  status-in-progress-ink: "#7c4a03"
  status-resolved-ink: "#166534"
  error: "#c53030"
  success: "#15803d"
  night-base: "#2a1536"
  night-canvas: "#1f0e29"
  night-line: "#4a3556"
  night-text: "#f3e9f3"
  night-secondary: "#4a2d57"
typography:
  display:
    fontFamily: "Prompt, Noto Sans Thai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Prompt, Noto Sans Thai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Prompt, Noto Sans Thai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, Noto Sans Thai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  body-lead:
    fontFamily: "Inter, Noto Sans Thai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, Noto Sans Thai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  box: "10px"
  field: "10px"
  button: "26px"
  pill: "200px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  card: "20px"
  lg: "24px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.magenta}"
    textColor: "{colors.plum}"
    rounded: "{rounded.button}"
    height: "40px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.bubblegum}"
    textColor: "{colors.plum}"
    rounded: "{rounded.button}"
    height: "40px"
  button-stage-solid:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.plum}"
    rounded: "{rounded.button}"
    height: "48px"
  button-stage-solid-hover:
    backgroundColor: "{colors.blush}"
  button-nav-cta:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.plum}"
    rounded: "{rounded.pill}"
  button-nav-cta-hover:
    backgroundColor: "{colors.bubblegum}"
  nav-item-active:
    backgroundColor: "{colors.bubblegum}"
    textColor: "{colors.plum}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.heather}"
    rounded: "{rounded.box}"
    padding: "{spacing.card}"
  input:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.heather}"
    rounded: "{rounded.field}"
    height: "40px"
  status-pill-pending:
    textColor: "{colors.status-pending-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  status-pill-in-progress:
    textColor: "{colors.status-in-progress-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  status-pill-resolved:
    textColor: "{colors.status-resolved-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
---

# Design System: Klai Chumchon

## Overview

**Creative North Star: "The Plum Stage and the Shared Ledger"**

A deep plum stage frames the app: the sticky header, the home hero band and the footer are all the same plum (#2c1338) surface, and everything between them is a calm, warm bone workspace. The community's problems sit on that workspace as one honest ledger of flat, hairline-bordered cards. The world is a user-pinned, Toggl-Track-style system: soft confectionery pills (Bubblegum, Blush) against plum, a single hot Magenta used sparingly, and generous 26px button curves.

The system is flat and quiet on purpose. Colour carries meaning, not decoration: red, amber and green belong only to report status and appear identically on map pins, status pills and the hero counts, so a resident reads status at a glance anywhere in the app. Everything else is plum, heather, bone and silver, with Magenta rationed to one element per screen.

Density is that of an operational tool: standard app shell, 3-column card grids on desktop, a single column on phones. The only Persuade-leaning moment is the home hero, where the headline carries the signature Magenta italic emphasis phrase on plum.

**Key Characteristics:**
- Plum stage (header, hero, footer) around a Bone canvas.
- Flat surfaces with 1px Silver hairlines; no shadows at rest.
- Pills everywhere a choice or state is shown: active nav, nav CTA, status, counts.
- One Magenta element per screen; italic Magenta emphasis lives only on plum.
- Status colours are a reserved vocabulary shared by pins, pills and counts.
- Thai-first type: Prompt display, Inter with Noto Sans Thai for body.

## Colors

A plum-and-bone palette with soft pink pills, one rationed Magenta, and a reserved traffic-light vocabulary for status.

### Primary
- **Magenta** (#e57cd8): The single loudest element on a screen. On light pages it is the primary submit/action button (`btn-primary`, plum text on Magenta). On the home hero it is the italic emphasis phrase in the headline. Never both on one screen, never as body text on Bone (its contrast on Bone is too low).

### Secondary
- **Bubblegum Wash** (#f7d8f3): Secondary buttons (search, bookmarked star), the active nav pill on the plum header, the avatar chip, and text selection.
- **Blush** (#fdeae2): The header "report a problem" CTA pill, the logo pin and "Chumchon" wordmark tint, footer column headings, and the hover state of Bone buttons on the stage.
- **Petal** (#fcf1f8): Hover fill for category tiles.

### Tertiary
- **Status Red** (#ef4444), **Status Amber** (#f59e0b), **Status Green** (#22c55e): Pending, in progress, resolved. Used solid for map pins and the dot in hero counts and popups; used as a tinted fill (14-20% alpha) with a deep ink for status pills: Pending ink (#9b1c1c), In-progress ink (#7c4a03), Resolved ink (#166534). In dark mode the pill inks lighten to #fca5a5, #fcd34d and #86efac.
- **Amber Accent** (#ffde91): The theme accent slot; not a status colour and not used for status.

### Neutral
- **Plum** (#2c1338): The stage surface (header, hero, footer), the text on Magenta/Bubblegum/Blush fills, and the focus ring on light surfaces.
- **Heather** (#412a4c): All text on the canvas, headings included; secondary text is Heather at 80% and 70% opacity rather than a separate grey.
- **Bone** (#fefbfa): The canvas and every card, form and dropdown panel; also text on the stage.
- **Canvas Wash** (#f8f1f2): Image placeholders and secondary fills behind media.
- **Silver** (#d5d0d7): The 1px hairline on cards, inputs, dropdowns and outlined buttons.
- **Dusty Mauve** (#6b5a74): The info slot (staff role badge).
- **Night set**: dark mode (`klai-night`) swaps the canvas to #1f0e29/#2a1536, hairlines to #4a3556, text to #f3e9f3 and secondary buttons to #4a2d57. Magenta and the status hues keep their roles.

### Named Rules
**The One Magenta Rule.** Each screen gets exactly one Magenta element: the primary action button, or on the plum hero the emphasis phrase. If a screen already has a Magenta button, no other Magenta appears.

**The Reserved Signal Rule.** Red, amber and green mean report status and nothing else. Category icons, priority and decoration never use them; the same hue marks a status on the pin, the pill and the count.

**The Opacity Not Grey Rule.** Secondary text is Heather (or Bone on the stage) at reduced opacity (80%, 75%, 70%), never a new grey.

## Typography

**Display Font:** Prompt (with Noto Sans Thai, system sans)
**Body Font:** Inter (with Noto Sans Thai, system sans)

**Character:** Prompt is the Thai-capable geometric stand-in for the pinned system's GT Haptik; its italic carries the emphasis move. Inter keeps Latin and numerals crisp while Noto Sans Thai renders the Thai copy, since neither GT Haptik nor Inter covers Thai.

### Hierarchy
- **Display** (600, 2.25rem to 3rem, 1.15): The home hero headline on plum only, in Bone, with one italic Magenta emphasis phrase (500 weight).
- **Headline** (700, 1.5rem, up to 1.875rem on detail/about at sm+): Page titles (h1) on the canvas; section titles (h2) use the same size at 600.
- **Title** (600, 1rem, 1.375): Report card titles, clamped to two lines.
- **Body** (400, 0.875rem, 1.5): Card descriptions, metadata, footer copy. Lead paragraphs on the hero step up to 1.125rem at 1.625, max width about 28rem.
- **Label** (600, 0.8125rem): Status pills; metadata rows use 13px at 400. Form labels are 500 weight body size.

All headings share a -0.01em tracking. Tables and counts use tabular numerals. No uppercase, no letterspaced labels.

### Named Rules
**The Plum-Only Italic Rule.** The italic Magenta emphasis is used only on the plum stage, where it has enough contrast. Canvas headings stay upright Heather.

## Layout

A standard app shell: sticky plum navbar, a centred content column capped at 72rem (max-w-6xl) with 16px side gutters and 24px top/bottom padding, and a plum footer with a three-column grid (one column on phones). The home hero breaks out to full viewport width as a plum band, with a five-column grid on large screens (two columns of copy, three of live map) and 40-56px vertical padding.

Rhythm: 48px between home sections; 12px gaps in the six-up category grid; 16px gaps in the report-card grid (1, 2, then 3 columns at sm and lg). Cards pad 20px internally with 12px between rows. Navigation collapses to a hamburger dropdown below lg; the header CTA collapses to an icon-only pill below sm.

## Elevation & Depth

Flat by default. The theme sets depth to 0 and buttons explicitly drop their shadow; depth comes from the plum/bone tonal contrast and 1px hairlines. On the stage, nested surfaces (hero map frame, count pills) use translucent white fills (6-8%) with a 15% white border instead of shadows.

### Shadow Vocabulary
- **Floating panel** (`box-shadow: 0 8px 24px rgba(44,19,56,0.12)`): Only for a floating results panel that overlays content (the place-search results list). Navbar dropdown menus currently rely on a Silver border alone.

### Named Rules
**The Flat Ledger Rule.** Cards, buttons, inputs and pills never cast shadows. A hover state changes the border (Silver to Heather at 40%) or the fill, not the elevation.

## Shapes

Three radii, each with a job: 10px for boxes (cards, modals, alerts, dropdowns, the hero map frame) and fields (inputs, selects, textareas); 26px for buttons; 200px full pills for selectors, badges, status pills, nav items, counts and icon buttons. Borders are 1px throughout. Status pills lead with an 8px round dot in their ink colour.

## Components

### Buttons
Soft, confident capsules with 500-weight labels and no shadow.
- **Shape:** Generously rounded (26px); square and circle icon buttons become full pills (200px).
- **Primary:** Magenta fill, Plum text. The one Magenta element on light screens (form submit, login, status change).
- **Secondary:** Bubblegum fill, Plum text (search, bookmarked state).
- **Outline / Ghost on canvas:** Transparent with a Silver border; border deepens to Heather 40% on hover ("view details").
- **On the stage:** Solid Bone with Plum text, Blush on hover (hero "report a problem"); outline with Bone at 60% border and Bone text, inverting to Bone fill on hover (hero map, header login). Ghost icon buttons on plum hover to white at 10%.
- **Focus:** 2px Plum outline at 2px offset on light surfaces; Magenta outline on the stage and in dark mode.

### Chips
- **Status pill:** Full pill, 13px semibold, 2px by 10px padding, tinted status fill with deep status ink and a leading dot. The canonical way status appears in lists and detail.
- **Count pill (stage):** Translucent white fill, 15% white border, solid status dot, Bone label and a larger tabular number.
- **Role badge:** Small DaisyUI badge; ghost for citizen, Dusty Mauve for staff, Bubblegum for admin.
- **Priority:** Not a chip. High priority is semibold text with a flame icon; others are Heather 70% text, so priority never competes with status colour.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** Bone (night base in dark mode).
- **Shadow Strategy:** None (see Elevation & Depth).
- **Border:** 1px Silver; hover to Heather 40% on report cards, Heather plus Petal fill on category tiles.
- **Internal Padding:** 20px on report cards, 16px on category tiles; images sit in a 144px-tall top figure on Canvas Wash.

### Inputs / Fields
- **Style:** Bordered, 10px radius, Bone fill, Silver border, 500-weight labels above.
- **Focus:** The global Plum focus ring.
- **Error:** Error-red border and a small error line below; the map picker takes a 2px error ring.

### Navigation
Plum sticky header with a hairline (white 10%) bottom border. Wordmark in Prompt: "Klai" semibold Bone, "Chumchon" regular Blush, with a Blush pin icon. Desktop items are pills: inactive Bone 80% text with white-10% hover, active Bubblegum fill with Plum text. The right side holds a theme toggle, the Blush "report" CTA pill, and login or the Bubblegum avatar chip. On mobile the menu is a Bone dropdown panel with a Silver border and a Bubblegum active row.

### Category Icon
Monochrome line icons (Lucide) at Heather 70%, 16px inline and 30px on category tiles. Never tinted with a status colour.

### Map Pins
Solid status-coloured pins (red, amber, green) matching the status pill of the same report; the map sits inside a 10px frame.

## Do's and Don'ts

### Do:
- **Do** put the header, the home hero band and the footer on the Plum stage (#2c1338), and everything else on Bone (#fefbfa).
- **Do** keep exactly one Magenta element per screen: the primary button, or the italic emphasis phrase on the plum hero.
- **Do** show status as a tinted pill with a dot, and use the same hue for its map pin and count.
- **Do** use 10px for cards and inputs, 26px for buttons and 200px for pills.
- **Do** use Bubblegum or Blush pills for active navigation, secondary actions and the nav CTA.
- **Do** separate surfaces with 1px Silver hairlines and express hover through border or fill changes.
- **Do** use Prompt for headings and Inter with Noto Sans Thai for body so Thai renders correctly.

### Don't:
- **Don't** use red, amber or green for anything other than report status (not categories, not priority, not decoration).
- **Don't** set Magenta text or the italic emphasis on Bone; it lacks contrast there.
- **Don't** add shadows to cards, buttons, inputs or pills; the only shadow is the floating overlay panel.
- **Don't** tint category icons; they stay monochrome Heather.
- **Don't** introduce new greys for secondary text; use Heather or Bone at reduced opacity.
- **Don't** substitute GT Haptik or Inter alone for headings or Thai copy; they lack Thai glyphs.
