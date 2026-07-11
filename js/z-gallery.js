/**
 * Z-Gallery V2 — Shared UI interactions
 * Navigation, filtering, cart, modals, accordion
 * Enhanced for ZIGNAL.ENGINE V2 features + Edition System
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

  // ── EDITION DATA CACHE ──
  let _editionsCache = null;

  // ── GALLERY OBSERVER (reused across filter changes) ──
  let _galleryObserver = null;

  /**
   * Load edition data from data/editions.json and merge with catalog works.
   * Returns a map of { id: editionData }.
   */
  async function loadEditions() {
    if (_editionsCache) return _editionsCache;
    try {
      const resp = await fetch('data/editions.json');
      if (!resp.ok) throw new Error('Failed to load editions');
      const data = await resp.json();
      _editionsCache = {};
      data.editions.forEach(ed => { _editionsCache[ed.id] = ed; });
      return _editionsCache;
    } catch (e) {
      console.warn('Edition data not available:', e.message);
      _editionsCache = {};
      return _editionsCache;
    }
  }

  /**
   * Get edition data for a work by id.
   * Returns { editionSize, claimed, seedHash, createdAt, status } or null.
   */
  function getEdition(id) {
    if (!_editionsCache) return null;
    return _editionsCache[id] || null;
  }

  /**
   * Get merged works — catalog works with edition data attached.
   */
  async function getMergedWorks() {
    const editions = await loadEditions();
    return ZCatalog.WORKS.map(work => {
      const ed = editions[work.id];
      return {
        ...work,
        editionSize: ed ? ed.editionSize : 30,
        claimed: ed ? ed.claimed : 0,
        seedHash: ed ? ed.seedHash : null,
        editionStatus: ed ? ed.status : 'available',
        createdAt: ed ? ed.createdAt : null
      };
    });
  }

  /**
   * Build edition badge HTML for a work's edition data.
   */
  function editionBadgeHTML(status, claimed, editionSize) {
    const remaining = editionSize - claimed;
    const urgent = status === 'limited' && remaining <= 5;
    const labels = {
      available: `${remaining} of ${editionSize} available`,
      limited: `${remaining} of ${editionSize} remaining`,
      claimed: 'Fully claimed'
    };
    const badgeClass = `edition-badge edition-badge-${status}${urgent ? ' edition-badge-urgent' : ''}`;
    return `<span class="${badgeClass}">${labels[status] || labels.available}</span>`;
  }

  // ── MOBILE NAV ──
  function initNav() {
    const btn = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    if (btn && nav) {
      btn.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // ── RENDER ART CARDS (V4 — with edition badges, entrance animation, lazy loading, a11y) ──
  function renderArtCards(container, works, options = {}) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    container.innerHTML = '';

    const animate = options.animate !== false;
    const lazy = options.lazy !== false;

    // Disconnect previous observer to prevent memory leaks
    if (_galleryObserver) {
      _galleryObserver.disconnect();
      _galleryObserver = null;
    }

    // Lazy-load observer: renders SVG only when card enters viewport
    let observer = null;
    if (lazy && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const imgDiv = entry.target;
            const data = JSON.parse(imgDiv.dataset.renderParams || '{}');
            if (data.archetype) {
              ZEngine.render(imgDiv, data);
              // Add alt text to rendered SVG
              const svg = imgDiv.querySelector('svg');
              if (svg) {
                svg.setAttribute('role', 'img');
                svg.setAttribute('aria-label', `Generative ${ARCHETYPE_LABELS[data.archetype] || data.archetype} artwork in ${data.palette} palette`);
              }
            }
            observer.unobserve(imgDiv);
          }
        });
      }, { rootMargin: '200px' });
      _galleryObserver = observer;
    }

    works.forEach((work, i) => {
      const card = document.createElement('a');
      card.className = 'art-card z-tilt';
      if (animate) card.classList.add('art-card-enter');
      card.href = `artwork.html?id=${work.id}`;
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', `${work.title} — Era ${work.era}, ${ARCHETYPE_LABELS[work.archetype] || work.archetype}`);

      // Stagger animation delay
      if (animate) {
        card.style.animationDelay = `${i * 50}ms`;
      }

      const imgDiv = document.createElement('div');
      imgDiv.className = 'art-card-image';

      if (observer && i >= 6) {
        // Lazy: store params, let observer render later
        imgDiv.dataset.renderParams = JSON.stringify({
          archetype: work.archetype,
          palette: work.palette,
          seed: work.seed,
          density: work.density
        });
        observer.observe(imgDiv);
      } else {
        // Eager: render immediately (first 6 cards always visible)
        ZEngine.render(imgDiv, {
          archetype: work.archetype,
          palette: work.palette,
          seed: work.seed,
          density: work.density
        });
        // Add alt text to rendered SVG
        const svg = imgDiv.querySelector('svg');
        if (svg) {
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', `Generative ${ARCHETYPE_LABELS[work.archetype] || work.archetype} artwork in ${work.palette} palette`);
        }
      }

      // Hover overlay with archetype label
      const overlay = document.createElement('div');
      overlay.className = 'art-card-overlay';
      overlay.innerHTML = `<span class="art-card-overlay-label">${ARCHETYPE_LABELS[work.archetype] || work.archetype}</span>`;
      imgDiv.appendChild(overlay);

      // Edition status
      const edStatus = work.editionStatus || 'available';
      const edClaimed = work.claimed || 0;
      const edSize = work.editionSize || 30;

      const meta = document.createElement('div');
      const edPct = Math.min((edClaimed / edSize) * 100, 100).toFixed(1);
      const edFillClass = edStatus === 'limited' ? 'limited' : edStatus === 'claimed' ? 'claimed' : '';
      const startingPrice = (typeof ZCatalog !== 'undefined' && ZCatalog.BASE_PRICES)
        ? ZCatalog.BASE_PRICES.paper.small
        : 89;

      meta.className = 'art-card-meta';
      meta.innerHTML = `
        <div class="art-card-title">${work.title}</div>
        <div class="art-card-info">
          <span class="era-badge">ERA ${work.era}</span>
          <span class="art-card-archetype">${ARCHETYPE_LABELS[work.archetype] || work.archetype}</span>
        </div>
        <div class="art-card-bottom">
          <div>
            ${editionBadgeHTML(edStatus, edClaimed, edSize)}
            <div class="edition-progress"><div class="edition-progress-fill ${edFillClass}" style="width:${edPct}%"></div></div>
          </div>
          <div class="art-card-price-tag"><span class="art-card-price-from">from</span>$${startingPrice}</div>
        </div>
      `;

      card.appendChild(imgDiv);
      card.appendChild(meta);
      container.appendChild(card);
    });
  }

  // ── GALLERY FILTERING (V3 — with editions, entrance animations, keyboard nav) ──
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

    // Merged works cache
    let mergedWorks = [];

    // Set active chips from URL params
    function activateChip(group, value) {
      if (value !== 'all') {
        document.querySelectorAll(`.filter-chip[data-${group}]`).forEach(p => p.classList.remove('active'));
        const target = document.querySelector(`.filter-chip[data-${group}="${value}"]`);
        if (target) target.classList.add('active');
      }
    }
    activateChip('era', activeEra);
    activateChip('palette', activePalette);
    activateChip('archetype', activeArchetype);

    function applyFilters() {
      let works = [...mergedWorks];
      if (activeEra !== 'all') works = works.filter(w => w.era === activeEra);
      if (activePalette !== 'all') works = works.filter(w => w.palette === activePalette);
      if (activeArchetype !== 'all') works = works.filter(w => w.archetype === activeArchetype);

      renderArtCards(container, works, { animate: true });

      // Update count
      if (countEl) {
        const eraLabel = activeEra !== 'all' ? ` in Era ${activeEra}` : ' across 7 eras';
        countEl.textContent = `${works.length} work${works.length !== 1 ? 's' : ''}${eraLabel}`;
      }

      // Show/hide empty state
      if (emptyEl) {
        emptyEl.style.display = works.length === 0 ? 'flex' : 'none';
        container.style.display = works.length === 0 ? 'none' : '';
      }

      // Update URL without reload
      const url = new URL(window.location);
      if (activeEra !== 'all') url.searchParams.set('era', activeEra);
      else url.searchParams.delete('era');
      if (activePalette !== 'all') url.searchParams.set('palette', activePalette);
      else url.searchParams.delete('palette');
      if (activeArchetype !== 'all') url.searchParams.set('archetype', activeArchetype);
      else url.searchParams.delete('archetype');
      history.replaceState(null, '', url.toString());
    }

    // Filter chip click handlers
    function bindFilterGroup(group, setter) {
      document.querySelectorAll(`.filter-chip[data-${group}]`).forEach(chip => {
        chip.addEventListener('click', () => {
          document.querySelectorAll(`.filter-chip[data-${group}]`).forEach(p => {
            p.classList.remove('active');
            p.setAttribute('aria-pressed', 'false');
          });
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
          setter(chip.dataset[group]);
          applyFilters();
        });

        // Keyboard: Enter/Space to activate
        chip.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            chip.click();
          }
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
        document.querySelectorAll('.filter-chip').forEach(p => {
          const isAll = p.dataset.era === 'all' || p.dataset.palette === 'all' || p.dataset.archetype === 'all';
          p.classList.toggle('active', isAll);
          p.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        applyFilters();
      });
    }

    // Keyboard navigation for gallery cards
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const focused = document.activeElement;
        if (focused && focused.classList.contains('art-card z-tilt')) {
          e.preventDefault();
          focused.click();
        }
      }
    });

    // Load editions then render
    getMergedWorks().then(works => {
      mergedWorks = works;
      applyFilters();
    });
  }

  // ── ACCORDION ──
  function initAccordions() {
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const wasOpen = item.classList.contains('open');
        // Close all items and reset aria-expanded
        item.closest('.accordion')?.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('open');
          const t = i.querySelector('.accordion-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
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
  function initCursorHero() {
    const heroArt = document.querySelector('#hero-art') || document.querySelector('.hero-art');
    if (!heroArt) return;

    const titleEl = document.querySelector('.hero-art-title');
    const eraEl = document.querySelector('.hero-art-era');

    heroArt.classList.add('hero-art-interactive');

    const archetypes = ['FREE_FORM', 'GRID', 'REPETITION', 'CONSTRUCTIVIST', 'COLOR_STUDY', 'DOT_FIELD', 'ARABIAN_GEOMETRIC'];
    const palettes = ['ZSIGNAL', 'CLASSIC_BAUHAUS', 'WARM_EARTH', 'COOL_STEEL', 'CONSTRUCTIVIST', 'MONOCHROME', 'WARM_EARTH'];

    let baseSeed = 42718;
    let currentArchetypeIdx = 0;

    let rafId = null;
    let isHovering = false;
    let rotationInterval = null;

    function renderWithParams(seed, density) {
      const archetype = archetypes[currentArchetypeIdx];
      const palette = palettes[currentArchetypeIdx];
      ZEngine.render(heroArt, { archetype, palette, seed, density });
      if (titleEl) titleEl.textContent = 'Interactive \u2022 Seed ' + seed;
      if (eraEl) eraEl.textContent = ARCHETYPE_LABELS[archetype] || archetype;
    }

    renderWithParams(baseSeed, 0.5);

    heroArt.addEventListener('mousemove', (e) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const rect = heroArt.getBoundingClientRect();
        const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        const seedOffset = Math.floor((normX - 0.5) * 100);
        const seed = baseSeed + seedOffset;
        const density = 0.15 + normY * 0.7;
        renderWithParams(seed, density);
        rafId = null;
      });
    });

    heroArt.addEventListener('mouseenter', () => {
      isHovering = true;
      if (rotationInterval) { clearInterval(rotationInterval); rotationInterval = null; }
    });

    heroArt.addEventListener('mouseleave', () => {
      isHovering = false;
      renderWithParams(baseSeed, 0.5);
      startRotation();
    });

    heroArt.addEventListener('click', () => {
      heroArt.style.opacity = '0';
      setTimeout(() => {
        currentArchetypeIdx = (currentArchetypeIdx + 1) % archetypes.length;
        baseSeed = Math.floor(Math.random() * 99999);
        renderWithParams(baseSeed, 0.5);
        heroArt.style.opacity = '1';
      }, 300);
    });

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

  // ── INTERACTIVE DEMO (About Page) ──
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

  // ── CURSOR PAINTING MODE ──────────────────────────────────────────
  function initCursorPainting() {
    if (document.getElementById('cursor-paint-overlay')) return; // guard double-init

    // Overlay (captures mouse, renders nodes)
    const overlay = document.createElement('div');
    overlay.className = 'cursor-paint-overlay';
    overlay.id = 'cursor-paint-overlay';
    document.body.appendChild(overlay);

    // Toast
    const toast = document.createElement('div');
    toast.className = 'cursor-paint-toast';
    toast.id = 'cursor-paint-toast';
    toast.innerHTML = 'Moholy-Nagy composed by telephone.<br>You compose by cursor.&nbsp;&nbsp;Press <kbd style="opacity:0.6">ESC</kbd> to exit.';
    document.body.appendChild(toast);

    // Exit button
    const exitBtn = document.createElement('button');
    exitBtn.className = 'cursor-paint-exit';
    exitBtn.id = 'cursor-paint-exit';
    exitBtn.textContent = '\u00D7 EXIT PAINT MODE';
    document.body.appendChild(exitBtn);

    const ARCHETYPES = ['FREE_FORM', 'DOT_FIELD', 'GRID', 'REPETITION', 'CONSTRUCTIVIST', 'COLOR_STUDY', 'ARABIAN_GEOMETRIC'];
    const PALETTES   = ['ZSIGNAL', 'CLASSIC_BAUHAUS', 'CONSTRUCTIVIST', 'WARM_EARTH', 'COOL_STEEL'];
    const MAX_NODES  = 60;
    const MIN_DIST   = 30;
    let active = false;
    let lastX = -9999, lastY = -9999;
    const nodes = [];

    function activate() {
      active = true;
      overlay.classList.add('active');
      toast.classList.add('visible');
      exitBtn.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 5000);
    }

    function deactivate() {
      active = false;
      overlay.classList.remove('active');
      toast.classList.remove('visible');
      exitBtn.classList.remove('visible');
    }

    function spawnNode(x, y) {
      const seed     = Math.round(x / 30) * 1000 + Math.round(y / 30);
      const archetype = ARCHETYPES[Math.abs(seed) % ARCHETYPES.length];
      const palette   = PALETTES[Math.abs(seed >> 3) % PALETTES.length];

      const node = document.createElement('div');
      node.className = 'cursor-paint-node';
      node.style.left = x + 'px';
      node.style.top  = y + 'px';

      if (typeof ZEngine !== 'undefined' && ZEngine.renderToString) {
        node.innerHTML = ZEngine.renderToString({ archetype, palette, seed, density: 0.62, width: 64, height: 64 });
      }

      overlay.appendChild(node);
      requestAnimationFrame(() => node.classList.add('visible'));
      nodes.push(node);

      // FIFO: remove oldest when over limit
      if (nodes.length > MAX_NODES) {
        const old = nodes.shift();
        old.classList.remove('visible');
        setTimeout(() => { if (old.parentNode) old.parentNode.removeChild(old); }, 350);
      }
    }

    overlay.addEventListener('mousemove', e => {
      if (!active) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DIST) return;
      lastX = e.clientX; lastY = e.clientY;
      spawnNode(e.clientX, e.clientY);
    });

    exitBtn.addEventListener('click', deactivate);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && active) { deactivate(); return; }
      if ((e.shiftKey && e.key === 'P') || (e.shiftKey && e.key === 'p')) {
        e.preventDefault();
        if (active) deactivate(); else activate();
      }
    });
  }

  // ── INIT ──
  function init() {
    initNav();
    initAccordions();
    initCursorPainting();
  }

  return {
    init, renderArtCards, initGalleryFilters,
    initHeroRotation, initCursorHero, renderEraCards, renderTimelineArt, initDemo,
    ARCHETYPE_LABELS, loadEditions, getEdition, getMergedWorks, editionBadgeHTML,
    initCursorPainting
  };
})();

document.addEventListener('DOMContentLoaded', ZGallery.init);
