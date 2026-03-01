# TASKS: Z-Gallery — Deterministic Generative Art System

> Generated from PRD on Feb 15, 2026
> Source: docs/PRD.md

## Status

- **Current phase:** Phase 6 ✓ — Moving to Review
- **Completed:** 69 / 69
- **Blocked:** None

---

## Phase 1: Design System + Brand Foundation

> Checkpoint: Style guide page renders with all new design tokens + scarcity components applied

- [x] Run `/design landing-page` to generate modernized Bauhaus design spec (positioned as art system, not gallery)
- [x] Define updated CSS custom properties in `css/z-gallery.css` (colors, fonts, spacing, radii, shadows)
- [x] Update typography scale: headings (IBM Plex Mono), body (IBM Plex Sans), sizes, line heights, letter spacing
- [x] Define component styles: buttons (primary, secondary, ghost), cards, badges, form inputs
- [x] Define layout tokens: max-width, grid gaps, section padding, breakpoints (375px, 768px, 1024px, 1440px)
- [x] Write the manifesto copy (6 lines, poetic — themes: seeds as signatures, constraint as beauty, determinism as authenticity)
- [x] Design edition/scarcity UI components: mint counter badge ("7/30 claimed"), edition status indicator (Available/Limited/Claimed), claim button style
- [x] Design collection UI components: "My Collection" panel, saved seed card, email capture modal
- [x] Create `styleguide.html` showing all components: typography, colors, buttons, cards, badges, edition badges, collection UI, form inputs
- [x] **CHECKPOINT:** Open `styleguide.html` — all tokens render correctly, scarcity components look premium, manifesto typography is impactful

## Phase 2: Homepage + Navigation

> Depends on: Phase 1
> Checkpoint: Homepage loads, manifesto visible without scroll, featured artwork renders live, nav works on mobile + desktop

- [x] Redesign `index.html` layout: hero section with live-rendered featured SVG artwork
- [x] Add manifesto section immediately below hero (6 lines, oversized typography, centered)
- [x] Add featured limited drop section: one canonical work with edition counter ("Edition 7 of 30 — 23 remaining")
- [x] Add era highlights section (3-4 curated works with era labels)
- [x] Add CTAs: "Explore Gallery" and "Create in the Studio" prominently placed
- [x] Add social proof line: "X seeds claimed" (static number for v1, manually updated)
- [x] Add collector CTA section at bottom of page
- [x] Build responsive global nav — works at 375px+ (hamburger on mobile, inline on desktop)
- [x] Apply nav to all existing pages: `gallery.html`, `artwork.html`, `studio.html`, `artist.html`, `theory.html`, `pitch-deck.html`
- [x] Add footer: contact link, manifesto excerpt, social links placeholder
- [x] Add Open Graph meta tags to `index.html` (title, description, image)
- [x] **CHECKPOINT:** Homepage loads in <2s, hero artwork renders, manifesto visible without scrolling on desktop, nav works on mobile, OG tags validate at ogp.me

## Phase 3: Gallery Grid + Filtering + Edition Status

> Depends on: Phase 1, Phase 2
> Checkpoint: All 31 works display with edition badges, filters work, keyboard accessible, responsive

- [x] Create `data/editions.json` with edition data for all 31 canonical works (editionSize, claimed, seedHash, createdAt, status)
- [x] Build utility function in `js/z-gallery.js` to load and merge edition data with catalog data
- [x] Redesign `gallery.html` grid layout (responsive cards, 1-col mobile → 2-col tablet → 3-col desktop)
- [x] Build filter controls UI: era dropdown/chips, archetype selector, palette selector
- [x] Implement client-side filtering in `js/z-gallery.js` — grid updates without page reload (<300ms)
- [x] Each card renders: live SVG thumbnail via ZEngine, title, era label, archetype badge, edition status badge ("7/30 claimed")
- [x] Add card hover state: subtle scale/shadow animation
- [x] Add smooth entrance animations for cards (fade-in on filter change)
- [x] Implement keyboard navigation: tab through cards, Enter to open detail
- [x] Add "No results" state when filters match zero works
- [x] **CHECKPOINT:** All 31 works render as cards with edition badges, every filter combination works, tab + Enter navigates gallery

## Phase 4: Artwork Detail + Remix Lineage

> Depends on: Phase 1, Phase 2, Phase 3
> Checkpoint: Every artwork renders its detail page with full metadata, edition status, remix section, and working inquiry form

- [x] Create `data/remixes.json` (empty array initially, structure: `[{ id, parentId, childIds, createdAt }]`)
- [x] Redesign `artwork.html` layout: large SVG rendering (centered, responsive)
- [x] Display metadata: title, era, archetype, palette, seed, density, seed hash (computed client-side)
- [x] Display edition status prominently: "Edition: 7 of 30 claimed" with status badge
- [x] Add "Request Print" button — opens Netlify Form (captures: email, seed ID, size preference)
- [x] Add "Remix this artwork" button — links to `studio.html?remix=[id]&archetype=X&palette=Y&seed=Z&density=D`
- [x] Build "Remix Lineage" section: shows parent artwork (if remix) and child remixes (if any) with thumbnail + link
- [x] Build "Related Works" section: 3-4 works from same era or archetype (using `ZCatalog.getRelated()`)
- [x] Add share button: copy artwork URL to clipboard with confirmation toast
- [x] Add OG meta tags per artwork (dynamic title + description based on URL params)
- [x] Add "Back to Gallery" link (preserves last filter state via URL params if available)
- [x] Add "collector interest count" display: "X collectors interested" (static for v1)
- [x] **CHECKPOINT:** Pick 5 random artworks — each renders detail page correctly with edition status, remix section, Request Print form, and Related Works

## Phase 5: Interactive Studio + Claiming + My Collection

> Depends on: Phase 1, Phase 2
> Checkpoint: All 7 archetypes render, all 6 palettes work, claim flow works end-to-end, collection persists, remix entry works

- [x] Redesign `studio.html` layout: large preview area + control panel sidebar (or below on mobile)
- [x] Build archetype selector (7 options with visual icons or labels)
- [x] Build palette selector (6 options with color swatches)
- [x] Build seed input (text field + "Randomize" button)
- [x] Build density slider (range input with live value display)
- [x] Wire all controls to ZEngine.render() — SVG regenerates on any parameter change
- [x] Add "Random Combination" button — picks random archetype + palette + seed
- [x] Add "Claim this seed" button — opens email capture modal, shows "Limited to 10 prints"
- [x] Implement claim flow: email capture → save to LocalStorage collection → show confirmation → submit to Netlify Forms
- [x] Handle remix entry: detect `?remix=[id]` param, pre-load parent parameters, show "Remixing: [Parent Title]" context banner
- [x] Display current configuration as shareable URL (`?archetype=X&palette=Y&seed=Z&density=D`)
- [x] Build "My Collection" panel: collapsible sidebar/drawer showing all claimed/saved seeds with live SVG thumbnails
- [x] Implement collection persistence in LocalStorage (`z-gallery-collection` key)
- [x] Add brief help text for first-time users ("Choose a style, pick colors, adjust density — then claim your creation")
- [x] **CHECKPOINT:** Every archetype + palette combo renders, claim flow captures email and saves to collection, collection persists across sessions, URL params load correct config, remix entry from artwork page pre-loads parameters

## Phase 6: Polish + Accessibility + Distribution Readiness

> Depends on: All previous phases
> Checkpoint: All success criteria from PRD pass

- [x] Add contact CTA: Netlify Form or mailto link, reachable from every page in <=2 clicks
- [x] Accessibility audit: add alt text to all SVG artworks (descriptive: "Generative [archetype] artwork in [palette] palette")
- [x] Add ARIA labels to interactive controls (filters, sliders, nav toggle, claim buttons, collection panel)
- [x] Add visible focus states for keyboard navigation (all interactive elements)
- [x] Verify color contrast meets WCAG AA (4.5:1 for text)
- [x] Performance: lazy-load off-screen artwork SVGs in gallery grid
- [x] Add meta descriptions to all pages (SEO-optimized: "generative SVG art", "deterministic art generator", etc.)
- [x] Add JSON-LD structured data for artworks (VisualArtwork schema)
- [x] Generate sitemap.xml
- [x] Cross-browser test: Chrome, Firefox, Safari
- [x] Responsive final check: 375px (iPhone SE), 768px (tablet), 1024px (laptop), 1440px (desktop)
- [x] Redesign `theory.html` with new design tokens + philosophy content (why deterministic art matters)
- [x] Redesign `artist.html` with new design tokens
- [x] Add social sharing meta for remix chains (OG tags showing original → remix lineage)
- [x] **CHECKPOINT:** Lighthouse performance >= 85, accessibility >= 90, all 17 success criteria pass

---

## Notes for AI Agent

- Execute tasks in order within each phase
- Commit after each completed task
- Do not modify `z-engine.js` — the rendering engine is sacred, DO NOT CHANGE
- Do not modify the catalog data structure in `z-catalog.js` — only extend with new fields if needed
- Keep all styles in `css/z-gallery.css` — no additional CSS files
- Keep everything vanilla JS — no frameworks, no build tools
- New data files go in `data/` directory: `editions.json`, `remixes.json`
- Seed hashing is computed client-side (simple deterministic hash of archetype+palette+seed+density)
- Collection data uses LocalStorage key: `z-gallery-collection`
- All forms use Netlify Forms (add `data-netlify="true"` attribute)
- If a task is unclear, check the PRD — do not guess
- If blocked, mark the task and move to the next unblocked task
- Update this file as you complete tasks (check the boxes)

## Learnings & Surprises

> Update this section during execution with anything unexpected

- (none yet)
