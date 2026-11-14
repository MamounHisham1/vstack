# Design

## World

**Merge Queue.** The site is a light, precise developer product: concrete-white ground, hairline rules, a dense skill table, and one black checkout band. It borrows the grammar of a pull-request queue and a good internal tool, not the costume of one. The install action is the product, so the hero is a working agent-install card rather than a decorative screenshot.

The previous dark gradient site and the card-catalog exploration are anti-references. This world is flat, quiet, and operational.

## Palette

| Role | Value | Use |
| --- | --- | --- |
| Ground | `#f4f5f2` | Page |
| Panel | `#ffffff` | Cards, commands, agent card |
| Ink | `#101318` | Headlines, primary buttons, dark band |
| Ink soft | `#2b3038` | Secondary body |
| Muted | `#5f6874` | Leads, labels, captions |
| Muted 2 | `#646d79` | Small metadata, placeholders |
| Line | `#dfe3e8` | Hairlines, card borders |
| Line 2 | `#eef0f2` | Inline code, quiet fills |
| Blue | `#2f5cff` | Links, accents, focus |
| Blue tint | `#eef2ff` | Tags, inline code, step numbers |
| Green | `#16794a` | “Ready” states, copied state |
| Green tint | `#e8f5ee` | Copied background |
| Dark command | `#1a1f27` | Commands on the dark band |
| Dark line | `#2a313b` | Command borders |

No gradients, no glassmorphism, no purple or teal, no glowing edges.

## Type

- **Display and body:** Manrope 400–800, self-hosted. Hero h1 `clamp(3rem, 5.4vw, 5.2rem)` at `0.95` line-height and `-0.05em` tracking. Section headings `clamp(2rem, 3.4vw, 3rem)`.
- **Data and controls:** JetBrains Mono 400/500/700, self-hosted. Commands, skill IDs, tags, labels, counts, nav, buttons.
- **Body:** 13–18px. Leads stay near 48–56ch; table copy stays near 60ch.
- **Fallback:** Helvetica Neue/Arial for Manrope; Consolas/SFMono for JetBrains Mono.
- **Self-hosted:** `docs/assets/fonts/` contains the latin WOFF2 subsets and the OFL licenses.

## Layout

- Wrap `min(100% - 48px, 1200px)`, 32px gutters below 720px.
- Sticky 64px top bar with a black square mark, wordmark, nav, and a black install button.
- Hero: two columns, copy left and agent-install card right, `minmax(380px, .95fr)` on the right. One column below 980px.
- “Works with” strip: a hairline band naming the supported agent families.
- Skills: a three-column table row (`44px / 1fr / 340px`) with hairline separators. One column below 720px.
- Manual install: a full-width black band with an intro and two equal columns; one column below 980px.
- Principles: four hairline-topped columns; two below 980px; one below 720px.
- Install page: hero plus agent card, then a 200px sticky “On this page” rail and a single content column. The rail becomes a chip row below 980px.
- `scroll-padding-top: 5.5rem` keeps every anchor below the sticky header.

## Components

- **Agent install card:** the hero’s primary object. Header “Agent install / install.md”, a visible `install.md` URL in a dark field, a copy button, the three-step detect → ask → install sequence, and a preview link. Reused in the install-page hero.
- **Skill row:** number, skill ID, tag, human name, short description, tags, exact command with copy, and a source link. Hover does not lift; the copy and source links are the actions.
- **Command block:** white surface with a 1px line and a mono command; copy button on the right. On the black band, the same block is `#1a1f27` with light copy.
- **Copy button:** 28px base, green copied state, label and aria-label restored after 1.5s, live-region announcement.
- **Manual install band:** black ground, two columns, one plugin command and one skill picker. The picker is a dark select; the command updates on change.
- **Install guide:** numbered steps, per-skill install rows, OpenCode slash commands, verification commands, and a definition-list FAQ.
- **Callout:** a light blue note with a 1px border and 8px radius. No thick side or top accent.
- **Closing band:** black ground, one sentence, copy-link and browse actions.

## Motion

- Hover states only: buttons darken, links turn blue, copy buttons show a green copied state.
- No entrance animations; content is visible by default.
- `prefers-reduced-motion` removes transitions.
- Copy is the one authored micro-interaction: the button changes state and the live region announces it.

## Accessibility

- Manrope and JetBrains Mono are self-hosted; no third-party font request.
- All key text pairs pass WCAG AA; small metadata uses the darker muted token.
- Visible 2px focus rings; blue on light surfaces, paper on dark surfaces.
- 44px hero actions and install cards; 32px copy buttons on mobile, 28px on desktop.
- Native buttons, labels on the search and picker, `aria-current` on the active install nav, and a `role="status"` live region for copy results.
- The skill table, install rows, and picker options are rendered at build time, so the five skills and commands remain readable without JavaScript.
- The install page’s FAQ uses a definition list; the steps are ordered lists.

## The install.md flow

The hero card makes one promise: copy the link, give it to your agent, and the agent handles the install. `docs/install.md` is a self-contained prompt, not a shell script. It:

1. detects installed agents with commands, config paths, and the skills CLI’s safe `--list` mode,
2. shows what it found and asks which agents should receive the skills,
3. waits for confirmation,
4. installs the Claude Code plugin or the skills CLI into the confirmed agents,
5. verifies and reports exactly what ran.

The site never claims to know the visitor’s agents. The agent does the detection; the site only provides the link and the manual fallback.

## Content rules

- Commands are exact and copyable. Never shorten `npx skills add MamounHisham1/vstack --skill <id> -y`.
- The install link is `https://mamounhisham1.github.io/vstack/install.md`.
- Do not invent agents, benchmarks, customers, or proof. The agent list comes from the skills CLI.
- “Skills that ship” is the voice anchor. Direct, technical, understated.
- The agent must ask before installing into an unconfirmed agent.

## Files

- `docs/index.html` — homepage; generated table rows and picker options between markers.
- `docs/install.html` — install guide; generated picker and per-skill rows between markers.
- `docs/install.md` — the agent prompt copied from the hero.
- `docs/assets/css/{fonts,base,site}.css`.
- `docs/assets/js/app.js` — copy, filter, picker, `/` shortcut.
- `docs/assets/fonts/` — Manrope and JetBrains Mono subsets plus OFL licenses.
- `scripts/build-skills-json.mjs` — reads `skills/*/SKILL.md`, writes `docs/data/skills.json`, injects rows and pickers.
- `docs/favicon.svg`.
