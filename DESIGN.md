# Design

## World

**The Card Catalog.** vstack is presented as a working library card catalog for agent skills: olive steel drawers, manila cards, brass label holders, red index tabs, rubber stamps, and typewritten commands. The metaphor is functional, not decorative: every skill is a card, every card has a call number, and the install command is what you copy off the card. The interface stays quiet enough to read; the catalog furniture earns its place by organizing the five skills, not by hiding them.

The old dark gradient site is the anti-reference. This world is light, printed, and physical.

## Palette

| Role | Value | Use |
| --- | --- | --- |
| Paper | `#e9e1cf` | Page ground |
| Card | `#f3ecdb` | Cards, panels, search slip |
| Highlight paper | `#fbf7ec` | Buttons, command text on dark |
| Ink | `#1c1b17` | Headlines, body, rules |
| Ink soft | `#343229` | Secondary body |
| Muted | `#5f5a4c` | Labels, captions, secondary copy |
| Rule | `#c9bfa9` | Hairlines |
| Rule strong | `#a89c83` | Borders, tags |
| Steel | `#3d4a3a` | Drawer fronts |
| Steel deep | `#2e382c` | Checkout panel, dark command blocks |
| Steel light | `#4a5745` | Drawer highlights |
| Brass | `#a9854f` | Label holders, checkout tag |
| Brass light | `#c9a86a` | Label highlights |
| Vermilion | `#b13721` | Tabs, stamps, primary action, accents |
| Vermilion bright | `#cf482e` | Primary hover only |
| Green | `#2f5d43` | Copied state |

No gradients as atmosphere. The only gradients are the metal/brass material of the drawers and label plates. No purple, no teal, no glass.

## Type

- **Display:** Archivo variable, 800 weight, uppercase. The hero is `clamp(3.4rem, 7.4vw, 6.4rem)` at `0.82` line-height and `-0.04em` tracking. Section headings use the same face at `clamp(2.1rem, 4.4vw, 3.55rem)`.
- **Body:** Archivo 400. Leads are 17–18px; card copy is 14–15px; body measure stays under 66ch.
- **Labels and commands:** Courier Prime 400/700. Used for commands, card IDs, call numbers, metadata, nav, buttons, and form labels. Monospace is for data and controls, not the whole page.
- **Fallback:** Arial Narrow / Helvetica Neue / Arial for display, Courier New for mono.
- **Self-hosted:** `docs/assets/fonts/` contains the latin WOFF2 subsets and the OFL licenses. No Google Fonts request.

## Grid and rhythm

- Wrap: `min(100% - 2 * gutter, 1180px)`, gutter `clamp(1.1rem, 4vw, 2.5rem)`.
- Hero: two columns at desktop (`1.02fr / 0.98fr`), one column below 900px.
- Catalog: three columns at desktop, two below 1080px, one below 700px. The first card spans two columns and carries the live install command.
- Sections: `clamp(3.5rem, 7vw, 6rem)` vertical padding, separated by a 1px ink rule.
- Section head: a 190px label column plus the heading, collapsing to one column below 820px.
- Cards lift 4px on hover with a soft shadow and a hard offset; the tab stays attached.
- Space above a heading is always larger than the space below it.

## Materials and shape

- 1px ink borders, 2px radius, hard offset shadows on tabs, buttons, and drawers, soft paper shadows on cards.
- Paper grain: a single fixed SVG turbulence layer at 13% multiply, never intercepting clicks.
- Card red margin line, red top tab, and a rotated “OPEN” stamp on the hero card.
- Brass label plates on the steel drawers; the checkout panel wears a brass “CHECKOUT DESK” tag.
- No rounded pill cards, no glassmorphism, no gradient text, no icon tiles.

## Components

- **Header:** sticky paper bar, red `v` stamp mark, mono wordmark and “Catalog no. 01” sublabel, mono nav, hard-shadow install button. The nav collapses to the brand and install button below 560px.
- **Hero card:** the product itself. A real manila card with the `v-build` card, a visible install command, a copy button, and metadata. The card overlaps an open drawer; four closed drawers with brass labels sit beneath.
- **Catalog card:** red number tab, `vstack / skill card` header, skill ID in mono, human name in display, clamped description, tags, `Open card` and `Copy install` actions. The first card is the featured two-column card with a command block.
- **Search slip:** paper slip with a small label, mono input, `/` hint, and a live count. Empty state offers a clear action.
- **Checkout panel:** deep steel ground, two columns. The left installs the plugin; the right lets the visitor pick one skill and updates the command. Both commands copy.
- **Reference notes:** four top-ruled notes, no numbering; the accent rules carry the eye.
- **Install page:** compact hero, sticky “On this card” nav (chips on mobile), path choice, plugin steps, per-skill rows, OpenCode commands, verify, and FAQ.
- **Dialog:** native `<dialog>` with a paper card, red tab, close button, metadata, command, and source links. Backdrop click and Escape close; focus returns to the opener.
- **Callouts:** paper ground with a 1px border and a 3px top rule. No thick side tabs.

## Motion

- One authored moment: the dialog card rises and settles in 190ms.
- Hover: cards lift 4px; buttons shift 1px with a deeper hard shadow; tabs and copy buttons change ink/background.
- The page itself does not animate in. Content is visible by default.
- `prefers-reduced-motion: reduce` removes transitions and animation.

## Accessibility

- All key text pairs pass WCAG AA; the red accent was darkened to `#b13721` to clear 4.5:1 on paper.
- Skip link, visible 2px focus rings, 44px controls, native dialog focus management, keyboard `/` shortcut, and an `aria-live` result count.
- The catalog is rendered as static HTML at build time; all five cards and commands remain readable without JavaScript.
- The generated card markup and dialog content are escaped; the only innerHTML writes use escaped command strings.
- Decorative drawer fronts, stamps, and tabs are `aria-hidden`; the hero card and all actions stay accessible.
- The install page uses a semantic nav, ordered steps, definition-list FAQ, and real headings.

## Content rules

- Commands are exact and copyable. Never shorten `npx skills add MamounHisham1/vstack --skill <id> -y`.
- Show the command, not a claim about the command.
- Keep the five real skills and their real descriptions. Do not invent benchmarks, customers, testimonials, or pricing.
- “Skills that ship” is the voice anchor. Direct, technical, understated.
- The card catalog is the only metaphor; do not add a second visual world.

## Files

- `docs/index.html` — homepage; generated card and picker blocks between markers.
- `docs/install.html` — install guide; generated per-skill block between markers.
- `docs/assets/css/fonts.css` — self-hosted font faces.
- `docs/assets/css/tokens.css` — palette, type, base, noise, scrollbars.
- `docs/assets/css/site.css` — layout, header, hero, drawers, checkout, notes, install page, footer.
- `docs/assets/css/catalog.css` — search, cards, empty state, dialog.
- `docs/assets/js/app.js` — search, `/` shortcut, copy, picker, native dialog.
- `scripts/build-skills-json.mjs` — reads `skills/*/SKILL.md`, writes `docs/data/skills.json`, injects cards, picker options, and install rows.
- `docs/assets/fonts/` — WOFF2 subsets and OFL license texts.
