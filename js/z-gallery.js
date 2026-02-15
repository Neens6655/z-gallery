/**
 * Z-Gallery V2 — Shared UI interactions
 * Navigation, filtering, cart, modals, accordion
 * Enhanced for ZIGNAL.ENGINE V2 features
 */

const ZGallery = (() => {

  // ── ARCHETYPE LABELS ──
  const ARCHETYPE_LABELS = {
    FREE_FORM: 'Free Form',
    GRID: 'Grid',
    REPETITION: 'Repetition',
    CONSTRUCTIVIST: 'Constructivist',
    COLOR_STUDY: 'Color Study',
    DOT_FIELD: 'Dot Field',
    ARABIAN_GEOMETRIC: 'Arabian Geometric'
  };

  // ── MOBILE NAV ──
  function initNav() {
    const btn = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    if (btn && nav) {
      btn.addEventListener('click', () => nav.classList.toggle('open'));
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => nav.classList.remove('open'));
      });
    }
  }

  // ── RENDER ART CARDS (Enhanced V2) ──
  function renderArtCards(container, works) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    container.innerHTML = '';

    works.forEach(work => {
      const card = document.createElement('a');
      card.className = 'art-card';
      card.href = `artwork.html?id=${work.id}`;

      const imgDiv = document.createElement('div');
      imgDiv.className = 'art-card-image';
      ZEngine.render(imgDiv, {
        archetype: work.archetype,
        palette: work.palette,
        seed: work.seed,
        density: work.density
      });

      // Hover overlay with archetype label
      const overlay = document.createElement('div');
      overlay.className = 'art-card-overlay';
      overlay.innerHTML = `<span class="art-card-overlay-label">${ARCHETYPE_LABELS[work.archetype] || work.archetype}</span>`;
      imgDiv.appendChild(overlay);

      const meta = document.createElement('div');
      meta.className = 'art-card-meta';
      meta.innerHTML = `
        <div class="art-card-title">${work.title}</div>
        <div class="art-card-info">
          <span class="era-badge">ERA ${work.era}</span>
          <span class="art-card-archetype">${ARCHETYPE_LABELS[work.archetype] || work.archetype}</span>
          <span>${work.year}</span>
        </div>
        <div class="art-card-bottom">
          <span class="art-card-price">From $${ZCatalog.BASE_PRICES.paper.small}</span>
          <span class="art-card-palette-dot" style="background:${(ZEngine.PALETTES[work.palette] || {}).colors?.[0] || '#1C1C1C'}" title="${work.palette}"></span>
        </div>
      `;

      card.appendChild(imgDiv);
      card.appendChild(meta);
      container.appendChild(card);
    });
  }

  // ── GALLERY FILTERING (V2 — with archetype filter + view toggle + empty state) ──
  function initGalleryFilters() {
    const container = document.querySelector('.gallery-grid');
    const countEl = document.querySelector('.gallery-count');
    const emptyEl = document.querySelector('.gallery-empty');
    if (!container) return;

    // Check URL params for pre-set filters
    const params = new URLSearchParams(window.location.search);
    let activeEra = params.get('era') || 'all';
    let activePalette = params.get('palette') || 'all';
    let activeArchetype = params.get('archetype') || 'all';

    // Set active pills from URL params
    function activatePill(group, value) {
      if (value !== 'all') {
        document.querySelectorAll(`.filter-pill[data-${group}]`).forEach(p => p.classList.remove('active'));
        const target = document.querySelector(`.filter-pill[data-${group}="${value}"]`);
        if (target) target.classList.add('active');
      }
    }
    activatePill('era', activeEra);
    activatePill('palette', activePalette);
    activatePill('archetype', activeArchetype);

    function applyFilters() {
      let works = [...ZCatalog.WORKS];
      if (activeEra !== 'all') works = works.filter(w => w.era === activeEra);
      if (activePalette !== 'all') works = works.filter(w => w.palette === activePalette);
      if (activeArchetype !== 'all') works = works.filter(w => w.archetype === activeArchetype);

      renderArtCards(container, works);

      // Update count
      if (countEl) {
        const eraLabel = activeEra !== 'all' ? ` in Era ${activeEra}` : ' across 7 eras';
        countEl.textContent = `${works.length} work${works.length !== 1 ? 's' : ''}${eraLabel}`;
      }

      // Show/hide empty state
      if (emptyEl) {
        emptyEl.style.display = works.length === 0 ? 'block' : 'none';
        container.style.display = works.length === 0 ? 'none' : '';
      }
    }

    // Filter pill click handlers
    function bindFilterGroup(group, setter) {
      document.querySelectorAll(`.filter-pill[data-${group}]`).forEach(pill => {
        pill.addEventListener('click', () => {
          document.querySelectorAll(`.filter-pill[data-${group}]`).forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          setter(pill.dataset[group]);
          applyFilters();
        });
      });
    }

    bindFilterGroup('era', v => { activeEra = v; });
    bindFilterGroup('palette', v => { activePalette = v; });
    bindFilterGroup('archetype', v => { activeArchetype = v; });

    // Clear filters button (empty state)
    const clearBtn = document.querySelector('.clear-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        activeEra = 'all';
        activePalette = 'all';
        activeArchetype = 'all';
        document.querySelectorAll('.filter-pill').forEach(p => {
          const isAll = p.dataset.era === 'all' || p.dataset.palette === 'all' || p.dataset.archetype === 'all';
          p.classList.toggle('active', isAll);
        });
        applyFilters();
      });
    }

    // View toggle (grid vs large)
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid) {
          galleryGrid.classList.toggle('grid-3', btn.dataset.view === 'grid');
          galleryGrid.classList.toggle('grid-2', btn.dataset.view === 'large');
          galleryGrid.classList.toggle('gallery-grid-large', btn.dataset.view === 'large');
        }
      });
    });

    applyFilters();
  }

  // ── ARTWORK DETAIL PAGE ──
  function initArtworkPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const work = ZCatalog.getById(id);
    if (!work) { document.body.innerHTML = '<p style="padding:64px;font-family:monospace;">Artwork not found.</p>'; return; }

    // Fill metadata
    const setEl = (sel, val) => { const e = document.querySelector(sel); if (e) e.innerHTML = val; };
    setEl('.artwork-title', work.title);
    setEl('.artwork-artist-line', `ZSIGNAL, ${work.year} &middot; Era ${work.era}: ${work.eraName}`);
    setEl('.artwork-description', work.description);
    setEl('.breadcrumb-era', `Era ${work.era}`);
    setEl('.breadcrumb-title', work.title);
    document.title = `${work.title} \u2014 ZSIGNAL Gallery`;

    // Update breadcrumb era link
    const eraLink = document.querySelector('.breadcrumb-era');
    if (eraLink) eraLink.href = `gallery.html?era=${work.era}`;

    // Render artwork
    const artContainer = document.querySelector('.artwork-image');
    if (artContainer) {
      ZEngine.render(artContainer, {
        archetype: work.archetype,
        palette: work.palette,
        seed: work.seed,
        density: work.density
      });
    }

    // Frame preview artwork
    const frameArt = document.querySelector('.frame-artwork');
    if (frameArt) {
      ZEngine.render(frameArt, {
        archetype: work.archetype,
        palette: work.palette,
        seed: work.seed,
        density: work.density
      });
    }

    // Technical details with V2 info
    setEl('.tech-archetype', `${ARCHETYPE_LABELS[work.archetype] || work.archetype}`);
    setEl('.tech-palette', work.palette);
    setEl('.tech-seed', work.seed);
    setEl('.tech-density', work.density);

    // Order state
    let state = { size: 'medium', material: 'paper', frame: 'none' };

    function updatePrice() {
      const price = ZCatalog.calcPrice(state.size, state.material, state.frame);
      setEl('.price-base', `$${price.base}`);
      setEl('.price-frame-val', price.frame > 0 ? `+$${price.frame}` : '\u2014');
      setEl('.price-total-val', `$${price.total}`);
      setEl('.order-btn-price', `$${price.total}`);
    }

    function updateFrame() {
      const preview = document.querySelector('.frame-preview');
      if (!preview) return;
      preview.className = 'frame-preview frame-' + state.frame;
    }

    // Selector click handlers
    document.querySelectorAll('.selector-option[data-size]').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.selector-option[data-size]').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        state.size = opt.dataset.size;
        updatePrice();
      });
    });
    document.querySelectorAll('.selector-option[data-material]').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.selector-option[data-material]').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        state.material = opt.dataset.material;
        updatePrice();
      });
    });
    document.querySelectorAll('.selector-option[data-frame]').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.selector-option[data-frame]').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        state.frame = opt.dataset.frame;
        updatePrice();
        updateFrame();
      });
    });

    // Set default active states
    document.querySelector('.selector-option[data-size="medium"]')?.classList.add('active');
    document.querySelector('.selector-option[data-material="paper"]')?.classList.add('active');
    document.querySelector('.selector-option[data-frame="none"]')?.classList.add('active');
    updatePrice();
    updateFrame();

    // Order button → modal
    const orderBtn = document.querySelector('.order-btn');
    const modal = document.querySelector('.modal-overlay');
    if (orderBtn && modal) {
      orderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const price = ZCatalog.calcPrice(state.size, state.material, state.frame);
        setEl('.modal-summary', `
          <strong>${work.title}</strong><br>
          ${ZCatalog.SIZE_LABELS[state.size]} &middot; ${ZCatalog.MATERIAL_LABELS[state.material]} &middot; ${ZCatalog.FRAME_LABELS[state.frame]}<br>
          Archetype: ${ARCHETYPE_LABELS[work.archetype]} &middot; Seed: ${work.seed}<br>
          Total: $${price.total}
        `);
        modal.classList.add('active');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.modal-close')) modal.classList.remove('active');
      });
    }

    // Related works
    const related = ZCatalog.getRelated(id, 3);
    const relatedGrid = document.querySelector('.related-grid');
    if (relatedGrid && related.length > 0) {
      renderArtCards(relatedGrid, related);
    }
  }

  // ── ACCORDION ──
  function initAccordions() {
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const wasOpen = item.classList.contains('open');
        item.closest('.accordion')?.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  // ── HERO ARTWORK ROTATION (V2 — with artwork caption) ──
  function initHeroRotation() {
    const heroArt = document.querySelector('#hero-art') || document.querySelector('.hero-art');
    if (!heroArt) return;

    const titleEl = document.querySelector('.hero-art-title');
    const eraEl = document.querySelector('.hero-art-era');

    const featured = [
      ZCatalog.WORKS[0],  // FREE_FORM
      ZCatalog.WORKS[5],  // GRID
      ZCatalog.WORKS[9],  // REPETITION
      ZCatalog.WORKS[14], // CONSTRUCTIVIST
      ZCatalog.WORKS[18], // COLOR_STUDY
      ZCatalog.WORKS[22], // DOT_FIELD
      ZCatalog.WORKS[26], // ARABIAN_GEOMETRIC
    ].filter(Boolean);

    let idx = 0;
    function showNext() {
      const work = featured[idx % featured.length];
      heroArt.style.opacity = '0';
      setTimeout(() => {
        ZEngine.render(heroArt, {
          archetype: work.archetype,
          palette: work.palette,
          seed: work.seed,
          density: work.density
        });
        heroArt.style.opacity = '1';
        // Update caption
        if (titleEl) titleEl.textContent = work.title;
        if (eraEl) eraEl.textContent = `Era ${work.era} \u2022 ${ARCHETYPE_LABELS[work.archetype] || work.archetype}`;
      }, 400);
      idx++;
    }

    heroArt.style.transition = 'opacity 400ms ease';
    showNext();
    setInterval(showNext, 5000);
  }

  // ── CURSOR-RESPONSIVE HERO ──
  // Mouse position over the hero art drives seed & density in real-time
  function initCursorHero() {
    const heroArt = document.querySelector('#hero-art') || document.querySelector('.hero-art');
    if (!heroArt) return;

    const titleEl = document.querySelector('.hero-art-title');
    const eraEl = document.querySelector('.hero-art-era');

    // Mark as interactive
    heroArt.classList.add('hero-art-interactive');

    const archetypes = ['FREE_FORM', 'GRID', 'REPETITION', 'CONSTRUCTIVIST', 'COLOR_STUDY', 'DOT_FIELD', 'ARABIAN_GEOMETRIC'];
    const palettes = ['ZSIGNAL', 'CLASSIC_BAUHAUS', 'WARM_EARTH', 'COOL_STEEL', 'CONSTRUCTIVIST', 'MONOCHROME', 'WARM_EARTH'];

    // Base seed — changes on click
    let baseSeed = 42718;
    let currentArchetypeIdx = 0;

    // Throttle renders
    let lastRender = 0;
    let rafId = null;
    let isHovering = false;
    let rotationInterval = null;

    // Initial render
    function renderWithParams(seed, density) {
      const archetype = archetypes[currentArchetypeIdx];
      const palette = palettes[currentArchetypeIdx];
      ZEngine.render(heroArt, { archetype, palette, seed, density });
      if (titleEl) titleEl.textContent = 'Interactive \u2022 Seed ' + seed;
      if (eraEl) eraEl.textContent = ARCHETYPE_LABELS[archetype] || archetype;
    }

    // Render initial state
    renderWithParams(baseSeed, 0.5);

    heroArt.addEventListener('mousemove', (e) => {
      if (rafId) return; // throttle via rAF

      rafId = requestAnimationFrame(() => {
        const rect = heroArt.getBoundingClientRect();
        const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        // X position modulates seed (subtle: +-50 from base)
        const seedOffset = Math.floor((normX - 0.5) * 100);
        const seed = baseSeed + seedOffset;

        // Y position modulates density (top=sparse 0.15, bottom=dense 0.85)
        const density = 0.15 + normY * 0.7;

        renderWithParams(seed, density);
        rafId = null;
      });
    });

    heroArt.addEventListener('mouseenter', () => {
      isHovering = true;
      // Stop auto-rotation while hovering
      if (rotationInterval) { clearInterval(rotationInterval); rotationInterval = null; }
    });

    heroArt.addEventListener('mouseleave', () => {
      isHovering = false;
      // Render the "resting" state
      renderWithParams(baseSeed, 0.5);
      // Restart rotation
      startRotation();
    });

    heroArt.addEventListener('click', () => {
      // Cycle archetype on click with flash transition
      heroArt.style.opacity = '0';
      setTimeout(() => {
        currentArchetypeIdx = (currentArchetypeIdx + 1) % archetypes.length;
        baseSeed = Math.floor(Math.random() * 99999);
        renderWithParams(baseSeed, 0.5);
        heroArt.style.opacity = '1';
      }, 300);
    });

    // Auto-rotate archetype every 6s when not hovering
    function startRotation() {
      if (rotationInterval) clearInterval(rotationInterval);
      rotationInterval = setInterval(() => {
        if (isHovering) return;
        heroArt.style.opacity = '0';
        setTimeout(() => {
          currentArchetypeIdx = (currentArchetypeIdx + 1) % archetypes.length;
          baseSeed = Math.floor(Math.random() * 99999);
          renderWithParams(baseSeed, 0.5);
          heroArt.style.opacity = '1';
        }, 350);
      }, 6000);
    }

    heroArt.style.transition = 'opacity 350ms ease';
    startRotation();
  }

  // ── ERA CARDS (Homepage) ──
  function renderEraCards() {
    document.querySelectorAll('.era-card-art[data-era]').forEach(artEl => {
      const eraKey = artEl.dataset.era;
      const works = ZCatalog.getByEra(eraKey);
      if (works.length > 0) {
        ZEngine.render(artEl, {
          archetype: works[0].archetype,
          palette: works[0].palette,
          seed: works[0].seed,
          density: works[0].density
        });
      }
    });
  }

  // ── TIMELINE ARTWORKS (Artist Page) ──
  function renderTimelineArt() {
    document.querySelectorAll('.timeline-art[data-era]').forEach(artEl => {
      const eraKey = artEl.dataset.era;
      const works = ZCatalog.getByEra(eraKey);
      if (works.length > 0) {
        ZEngine.render(artEl, {
          archetype: works[0].archetype,
          palette: works[0].palette,
          seed: works[0].seed,
          density: works[0].density
        });
      }
    });
  }

  // ── INTERACTIVE DEMO (About Page — V2 with density control + seed display) ──
  function initDemo() {
    const canvas = document.querySelector('.demo-canvas');
    if (!canvas) return;

    let demoArchetype = 'FREE_FORM';
    let demoPalette = 'ZSIGNAL';
    let demoDensity = 0.5;
    let demoSeed = Math.floor(Math.random() * 99999);

    const seedDisplay = document.querySelector('.demo-seed-value');
    const densitySlider = document.querySelector('.demo-density-slider');
    const densityValue = document.querySelector('.demo-density-value');

    function renderDemo() {
      ZEngine.render(canvas, {
        archetype: demoArchetype,
        palette: demoPalette,
        seed: demoSeed,
        density: demoDensity
      });
      if (seedDisplay) seedDisplay.textContent = demoSeed;
    }

    document.querySelectorAll('.demo-archetype').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.demo-archetype').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        demoArchetype = btn.dataset.archetype;
        demoSeed = Math.floor(Math.random() * 99999);
        renderDemo();
      });
    });

    document.querySelectorAll('.demo-palette').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.demo-palette').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        demoPalette = btn.dataset.palette;
        renderDemo();
      });
    });

    // Density slider
    if (densitySlider) {
      densitySlider.addEventListener('input', () => {
        demoDensity = parseFloat(densitySlider.value);
        if (densityValue) densityValue.textContent = demoDensity.toFixed(1);
        renderDemo();
      });
    }

    const regenerateBtn = document.querySelector('.demo-regenerate');
    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => {
        demoSeed = Math.floor(Math.random() * 99999);
        renderDemo();
      });
    }

    renderDemo();
  }

  // ── INIT ──
  function init() {
    initNav();
    initAccordions();
  }

  return {
    init, renderArtCards, initGalleryFilters, initArtworkPage,
    initHeroRotation, initCursorHero, renderEraCards, renderTimelineArt, initDemo,
    ARCHETYPE_LABELS
  };
})();

document.addEventListener('DOMContentLoaded', ZGallery.init);
