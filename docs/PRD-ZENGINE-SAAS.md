# PRD: ZEngine SaaS — Deterministic Visual Infrastructure for Indie SaaS

> Status: FUTURE (Phase 2 — after Z-Gallery ships)
> Prerequisite: Z-Gallery v1 must be complete and proving the engine works
> Generated: Feb 15, 2026

## Relationship to Z-Gallery

Z-Gallery (the collectible art system) is Phase 1. It proves:
- The engine works (deterministic, fast, cross-browser)
- The visual output is impressive (attracts attention)
- The system thinking is sound (seeds, archetypes, palettes)

ZEngine SaaS is Phase 2. It takes the proven engine and packages it for a new audience:
- Indie SaaS founders who need unique visuals
- Programmatic use cases (APIs, embeds, OG images)
- Recurring revenue ($29–$199/mo tiers)

The gallery becomes the showcase; the SaaS becomes the business.

---

## Product Overview

**Product Name:** ZEngine

**Category:** Niche SaaS — Deterministic Visual Infrastructure for Indie SaaS

**Positioning:** ZEngine instantly generates a reproducible, system-driven visual identity for your SaaS — without hiring a designer.

## Problem

Indie SaaS founders face:
- Generic UI visuals
- Overused stock illustrations
- Expensive branding agencies
- Inconsistent design across pages
- No system behind their visuals
- No scalable visual layer tied to data

They want something unique, systematic, fast, and programmable. There is no lightweight visual infrastructure tool built specifically for indie SaaS.

## Target User

**Primary Persona:** Indie SaaS founder / solo developer

**Characteristics:**
- Technical or semi-technical
- Limited budget
- Building MVP or early product
- Needs differentiation
- Values speed over aesthetics perfection
- Comfortable with JSON / basic config

## Core Value Proposition

ZEngine generates:
- Deterministic hero backgrounds
- Pattern systems
- SVG illustrations
- Open Graph images
- User avatar visual system
- Dynamic seeded visuals

All derived from:
- A single brand configuration
- Reproducible seed logic
- Exportable config file

## Core Features (MVP Scope)

### Brand System Generator

**Input:**
- Brand name
- 2–3 brand colors
- Archetype selection
- Mood slider
- Optional seed

**Output:**
- Master seed
- Deterministic archetype config
- Pattern library
- 3 hero backgrounds
- 3 dashboard visuals
- Avatar system
- OG image template
- Exportable SVG bundle

### Deterministic Engine

- Same config = same output
- URL encoded seed system
- JSON export of full visual config
- Reproducible across devices

### Export System

Users can export:
- Raw SVG
- Optimized SVG
- PNG (web resolution)
- Brand config JSON
- OG image ready-to-upload
- Embed script snippet

### Visual Preview Console

Interactive dashboard showing:
- Hero preview
- Pattern preview
- Avatar grid
- Social preview
- Dark mode / light mode toggle

Must render under 500ms.

### Save & Account System (Lean)

Phase 1:
- Email-based login
- Store brand configs
- Version history (lightweight)

No complex backend required initially — Turso or simple serverless DB.

## Monetization Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 1 brand system, low-res export, watermark, limited archetypes |
| Solo | $29/mo | Unlimited brands, full SVG export, no watermark, commercial usage |
| Growth | $79/mo | Team sharing, OG auto-generator, avatar API, limited API access |
| Agency | $199/mo | White-label export, client management, priority rendering, no attribution |

**Revenue goal:** 200 users at $49 avg = $9k–12k MRR within 12 months

## Non-Goals (Critical)

Do NOT build:
- NFT integration
- Marketplace
- Blockchain minting
- Overly artistic storytelling
- Complex CMS
- Payment checkout for prints

Stay focused on SaaS visual systems.

## UX Requirements

- Render <500ms
- Homepage load <2s
- SVG generation <500ms
- 3–5 main controls only
- No overwhelming sliders
- Guided wizard style onboarding

## Key Differentiators

1. Deterministic (not AI randomness)
2. Seed-based reproducibility
3. System-driven output (not single images)
4. SaaS-specific visual packs
5. Programmable via API

## API Roadmap (Phase 2 of SaaS)

```
GET /generate?seed=abc123&type=hero
```

Use cases:
- Dynamic dashboards
- Personalized user visuals
- Seed-based identity layers

Rate limits tied to plan.

## Distribution Strategy

**Primary Channels:**
- Indie Hackers
- Twitter/X
- Product Hunt
- SaaS founder communities
- Webflow community

**Content Strategy:**
- "How to build a visual system as a solo founder"
- "Why deterministic design beats AI randomness"
- Case studies of SaaS using ZEngine

No paid ads initially.

## Growth Loops

1. Export → Attribution link → New user
2. User-based avatar generation → Shared publicly
3. Public showcase of SaaS using ZEngine

## Tech Stack Considerations (Future)

This will require upgrades from the Z-Gallery vanilla stack:
- **Auth:** Clerk or email-based (no accounts in gallery, needed for SaaS)
- **Database:** Turso (brand configs, version history, usage tracking)
- **Payments:** Stripe (subscription tiers)
- **API:** Edge functions (Netlify/Vercel) or lightweight Node server
- **Export:** Server-side SVG → PNG conversion (Sharp or similar)

These decisions will be made when Phase 2 kicks off via `/prd` for the SaaS product.
