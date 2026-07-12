# Architecture Plan: ZSIGNAL Gallery V2 (YZA Voku Replicate)
Task type: new-feature | Risk: low | Estimated files: 6 new

## Context
Replicate the yzavoku.com design for the existing z-gallery project. Four new HTML pages with a gallery-noir aesthetic (pure black/white/red) that renders the existing 31 deterministic SVG artworks via ZEngine. No frameworks — vanilla HTML/CSS/JS matching the existing stack. All new files (v2 suffix) sit alongside existing pages without breaking them.

## Existing Landscape
- **Stack**: Static HTML, vanilla CSS/JS, no build tools, Vercel deploy
- **Engine**: `ZEngine.render(target, { archetype, palette, seed, density })` — deterministic SVG (DO NOT MODIFY)
- **Catalog**: `ZCatalog.WORKS` — 31 works, 7 eras, metadata (id, title, year, era, palette, seed, density, description)
- **Gallery UI**: `ZGallery` IIFE — loadEditions(), getMergedWorks(), initNav(), filter logic
- **Canvas**: 560x560 SVG units
- **Patterns**: IIFE modules, `defer` script loading, no external frameworks

## Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Routing | Multi-page HTML (4 separate files) | Matches existing pattern, no JS router needed, better SEO |
| Project detail navigation | URL params (`?id=ff-001`) on `artwork-v2.html` | Simple, bookmarkable, no SPA complexity |
| Orbit layout | JS-computed inline styles (trigonometry) | CSS can't position N items on an ellipse; JS sets `transform` on load |
| SVG lazy rendering | IntersectionObserver in `gallery-noir.js` | 31 SVGs are heavy — render only when visible |
| Orbit animation | CSS `@keyframes rotate` on container + counter-rotate on children | Smooth 120s rotation, GPU-accelerated |
| Styling | Single new CSS file `gallery-noir.css` | Keeps existing styles untouched, clean separation |
| Prev/Next on detail | JS reads `ZCatalog.WORKS` array, finds current index | Simple, no server needed |

## File Map

### New Files
```
z-gallery/
├── index-v2.html         → Homepage: orbit + center nav + marquee
├── archive-v2.html       → Archive: numbered 3-col grid + filters + footer
├── artwork-v2.html       → Project detail: full-viewport SVG + floating nav
├── info-v2.html           → Info & Contact: two-col bio + giant ZS + red gradient
├── css/gallery-noir.css   → All V2 styles (gallery-noir design system)
└── js/gallery-noir.js     → Orbit engine, marquee, lazy render, keyboard nav, filters
```

### Existing Files (UNCHANGED)
- `js/z-engine.js` — DO NOT MODIFY
- `js/z-catalog.js` — read-only (ZCatalog.WORKS, ERAS)
- `js/z-gallery.js` — may import loadEditions() for edition badges (optional)
- `css/tokens.css` — not used by V2 (gallery-noir.css is self-contained)
- `data/editions.json` — read for edition status badges

## Data Flow

```
                    ┌─────────────┐
                    │ z-catalog.js│  31 WORKS metadata
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │ index-v2  │   │archive-v2 │   │artwork-v2 │
    │ (orbit)   │   │ (grid)    │   │ (detail)  │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │                │                │
          ▼                ▼                ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ ZEngine   │   │ ZEngine   │   │ ZEngine   │
    │ .render() │   │ .render() │   │ .render() │
    │ 28 thumbs │   │ 31 cards  │   │ 1 full    │
    │ (70x70)   │   │ (lazy)    │   │ (viewport)│
    └───────────┘   └───────────┘   └───────────┘

    gallery-noir.js orchestrates all rendering + interactions
```

## Build Sequence

### Phase 1: Foundation (CSS + JS scaffold)
- [ ] Create `css/gallery-noir.css` with all custom properties, reset, typography, nav, responsive breakpoints
- [ ] Create `js/gallery-noir.js` IIFE scaffold with module sections: orbit, archive, detail, marquee, nav
- [ ] Checkpoint: CSS loads, JS console-logs "GalleryNoir ready"

### Phase 2: Homepage (index-v2.html)
- [ ] Build HTML structure: black viewport, orbit container, center nav, marquee strip
- [ ] Implement orbit positioning in JS: loop 28 works, compute (x,y) on ellipse via `cos(angle)*rx, sin(angle)*ry`
- [ ] Render 28 thumbnail SVGs (70x70) via ZEngine into orbit slots
- [ ] Add CSS orbit rotation animation (120s) + counter-rotation on thumbnails
- [ ] Build marquee with duplicated title text for seamless scroll
- [ ] Add `prefers-reduced-motion` fallbacks (stop rotation + marquee)
- [ ] Checkpoint: Homepage loads with rotating orbit of 28 live SVG thumbnails

### Phase 3: Archive (archive-v2.html)
- [ ] Build HTML structure: sticky nav, filter chips row, 3-col grid, footer
- [ ] Populate grid from `ZCatalog.WORKS` (31 items) with number + title overlays
- [ ] Implement IntersectionObserver lazy rendering (render SVG only when card enters viewport)
- [ ] Build filter system: era chips (I-VII + All), click filters grid
- [ ] Add hover effects (scale + title slide-up reveal)
- [ ] Wire card click → navigate to `artwork-v2.html?id={work.id}`
- [ ] Build footer with two-column bio text
- [ ] Checkpoint: Archive shows 31 numbered artworks, filters work, clicking opens detail

### Phase 4: Project Detail (artwork-v2.html)
- [ ] Build HTML structure: full-viewport canvas, floating bottom nav bar
- [ ] Read `?id=` param, find work in ZCatalog, render full-resolution SVG
- [ ] Build floating nav: home link, title display, prev/next, close, archive, info
- [ ] Implement prev/next navigation (update URL param + re-render)
- [ ] Add keyboard navigation (ArrowLeft, ArrowRight, Escape)
- [ ] Checkpoint: Can navigate through all 31 works via prev/next and keyboard

### Phase 5: Info & Contact (info-v2.html)
- [ ] Build HTML structure: two-column bio text, centered nav, giant ZS typography, red gradient
- [ ] Style giant "ZS" as CSS text with `font-size: clamp(200px, 30vw, 600px)`, near-invisible on black
- [ ] Add red-to-black gradient at bottom via CSS `background: linear-gradient(...)`
- [ ] Checkpoint: Info page renders with dramatic ZS typography and red gradient

### Phase 6: Polish & Responsive
- [ ] Test all 4 pages at 1440px, 768px, 375px
- [ ] Mobile: orbit reduces to 16 thumbs, smaller radius
- [ ] Mobile: archive switches to 1-col
- [ ] Mobile: hamburger nav overlay
- [ ] Add smooth page transitions via `opacity` fade on `DOMContentLoaded`
- [ ] Verify `prefers-reduced-motion` on all animations
- [ ] Checkpoint: All pages work across breakpoints, animations respect user preference

## Technical Details

### Orbit Positioning Algorithm
```js
const THUMB_COUNT = 28;
const works = ZCatalog.WORKS.slice(0, THUMB_COUNT);
works.forEach((work, i) => {
  const angle = (i / THUMB_COUNT) * Math.PI * 2 - Math.PI / 2; // start from top
  const x = Math.cos(angle) * rx; // rx from CSS var
  const y = Math.sin(angle) * ry; // ry from CSS var
  thumb.style.transform = `translate(${x}px, ${y}px)`;
});
```

### Lazy SVG Rendering
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.rendered) {
      const { archetype, palette, seed, density } = entry.target.dataset;
      ZEngine.render(entry.target, { archetype, palette, seed: +seed, density: +density });
      entry.target.dataset.rendered = 'true';
    }
  });
}, { rootMargin: '200px' }); // pre-render 200px before visible
```

### URL-based Detail Navigation
```js
const params = new URLSearchParams(location.search);
const workId = params.get('id');
const work = ZCatalog.getById(workId);
const allWorks = ZCatalog.WORKS;
const idx = allWorks.findIndex(w => w.id === workId);
const prevWork = allWorks[(idx - 1 + allWorks.length) % allWorks.length];
const nextWork = allWorks[(idx + 1) % allWorks.length];
```

## Risks & Mitigations
- **31 SVG renders on archive page**: Mitigated by IntersectionObserver lazy loading — only renders ~6 visible cards
- **Orbit thumbnail size**: 28 simultaneous SVG renders at 70x70 — test performance, may need to pre-render to `<canvas>` or use placeholder images if too slow
- **CSS counter-rotation jitter**: Test across browsers — may need `will-change: transform` on thumbnails
- **Mobile orbit legibility**: At 45x45px, SVG detail is lost — acceptable as abstract thumbnails

## Out of Scope
- Video/audio playback (YZA Voku has video projects — we only have SVGs)
- Scene generator / Flux AI integration
- Edition purchasing / e-commerce
- Chatbot
- Modifying existing V1 pages
- SEO optimization
- Cookie consent
