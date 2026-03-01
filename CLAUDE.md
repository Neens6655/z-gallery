# Z-Gallery

ZSIGNAL — A deterministic generative art system where every artwork is a limited, seed-signed artifact that can be collected, remixed, and evolved. 31 canonical works across 7 eras, built on Bauhaus and Islamic geometric principles.

## Architecture

Static HTML site (no framework, no build step). All art is rendered client-side as SVG via `ZEngine`.

```
index.html          — Homepage (hero, manifesto, featured drop, era highlights, chatbot)
gallery.html        — Filterable gallery grid (31 works with edition badges)
artwork.html        — Single artwork detail + print request + remix
studio.html         — Interactive playground + seed claiming + personal collection
artist.html         — Artist biography + timeline
theory.html         — Philosophy, master artists, rules, interactive demo, FAQ
pitch-deck.html     — Browser-based pitch deck
styleguide.html     — Design system reference
css/z-gallery.css   — All styles (single file, CSS custom properties)
js/z-engine.js      — ZIGNAL.ENGINE V2 — SVG generative art engine (DO NOT MODIFY)
js/z-catalog.js     — Artwork catalog (31 works, 7 eras, metadata)
js/z-gallery.js     — Shared UI (nav, cards, filters, accordions, modals, demos)
data/editions.json  — Edition data (sizes, claimed counts, seed hashes, statuses)
sitemap.xml         — SEO sitemap
docs/PRD.md         — Product requirements document
docs/TASKS.md       — Implementation task list (69/69 complete)
```

## Key Concepts

- **Archetypes:** FREE_FORM, GRID, REPETITION, CONSTRUCTIVIST, COLOR_STUDY, DOT_FIELD, ARABIAN_GEOMETRIC
- **Palettes:** ZSIGNAL, CLASSIC_BAUHAUS, CONSTRUCTIVIST, WARM_EARTH, COOL_STEEL, MONOCHROME
- **Deterministic rendering:** Same (archetype, palette, seed, density) → same SVG output
- **Edition system:** Each canonical work has a fixed edition size (10–30). Editions track claimed/available status.
- **Collection:** Users save claimed seeds to localStorage (`z-gallery-collection` key)
- **Remixing:** Artwork parameters carry forward to Studio via URL params (`?remix=id&a=&p=&s=&d=`)
- **Canvas size:** 560×560 SVG units

## Design Tokens (WCAG AA Compliant)

- **Fonts:** IBM Plex Mono (headings/code), IBM Plex Sans (body)
- **Colors:**
  - Cream `#F2E8D5` (background)
  - Charcoal `#1C1C1C` (text)
  - Gold `#D4A84B` (decorative, dark backgrounds, borders, focus rings)
  - Gold Dark `#8A6A20` (text on cream — WCAG AA compliant)
  - Brick `#A84235` (accent)
  - Blue `#2E5F94` (links)
  - Olive `#566832` (accent)
- **Style:** Bauhaus-inspired, 2px borders, 0 border-radius, terminal shadow (6px offset)
- **Touch targets:** Minimum 44×44px for all interactive elements

## Critical Rules

- **DO NOT MODIFY** `js/z-engine.js` — it is the deterministic rendering engine
- All rendering goes through `ZEngine.render(target, { archetype, palette, seed, density })`
- Catalog data lives in `z-catalog.js` — add new works there
- Edition data lives in `data/editions.json` — update claimed counts there
- Keep all styles in the single `z-gallery.css` file
- No external JS frameworks — vanilla JS only
- IIFE pattern for all modules (ZEngine, ZCatalog, ZGallery)
- Gold text on cream backgrounds must use `--z-gold-dark` (not `--z-gold`)
- Forms use Netlify Forms (`data-netlify="true"`) with fetch POST submission
- Chatbot uses a local keyword-matching knowledge base (no API calls)

## Development

- No build tools — open HTML files directly or use any static server
- `npx http-server -p 8765` for local development
- `node generate-deck.js` to regenerate the PPTX pitch deck
- Only dependency: `pptxgenjs` (for deck generation only)

## Deployment

- **Platform:** Netlify (recommended) or any static host
- **Forms:** Netlify Forms handles print requests and seed claims (no backend needed)
- **No env vars required** — everything is client-side
- **Build command:** None (static site)
- **Publish directory:** `.` (root)

## Accessibility

- Skip links on all pages
- `<main id="main-content">` landmark on all pages
- `aria-expanded` on accordion triggers and hamburger menu
- `aria-pressed` on filter chips
- `role="list"` / `role="listitem"` on gallery grid
- `aria-label` on all SVG artworks, chatbot input, form controls
- `aria-live="polite"` on chatbot messages
- Escape key dismisses modals
- All scripts use `defer` attribute
