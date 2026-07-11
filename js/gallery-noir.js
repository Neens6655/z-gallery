/**
 * GALLERY-NOIR — Cinematic UI Engine
 * ZSIGNAL Gallery V2 | yzavoku.com replicate
 *
 * Modules: Orbit, Archive, Detail, Marquee, Nav, Filters
 * Dependencies: ZEngine (render), ZCatalog (WORKS, ERAS)
 */

const GalleryNoir = (() => {
  'use strict';

  // ── CONFIG ──
  const ORBIT_COUNT = 20;
  const LAZY_MARGIN = '300px';
  const MOBILE_BREAKPOINT = 768;

  // ── UTILS ──
  function qs(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
  function isMobile() { return window.innerWidth < MOBILE_BREAKPOINT; }

  // Get URL param
  function param(key) {
    return new URLSearchParams(location.search).get(key);
  }

  // ══════════════════════════════════════════════
  //  ORBIT — Homepage circular layout
  // ══════════════════════════════════════════════

  function initOrbit() {
    const container = qs('.gn-orbit');
    if (!container) return;

    const works = ZCatalog.WORKS.slice(0, ORBIT_COUNT);
    const count = works.length;

    function positionThumbs() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Responsive orbit radii
      let rx, ry;
      if (vw < 768) {
        rx = vw * 0.37;
        ry = vh * 0.33;
      } else if (vw < 1024) {
        rx = vw * 0.35;
        ry = vh * 0.31;
      } else {
        rx = vw * 0.34;
        ry = vh * 0.33;
      }

      const thumbs = qsa('.gn-orbit__thumb', container);
      thumbs.forEach((thumb, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * rx;
        const y = Math.sin(angle) * ry;
        thumb.style.left = `${x}px`;
        thumb.style.top = `${y}px`;
        thumb.style.marginLeft = `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gn-thumb-size')) / 2}px`;
        thumb.style.marginTop = `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gn-thumb-size')) / 2}px`;
      });
    }

    // Create thumbnail elements
    works.forEach((work, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'gn-orbit__thumb';
      // Staggered entrance: each thumb fades in with delay
      thumb.style.animationDelay = `${300 + i * 60}ms`;

      const inner = document.createElement('div');
      inner.className = 'gn-orbit__thumb-inner';

      // Render SVG
      const artTarget = document.createElement('div');
      artTarget.style.width = '100%';
      artTarget.style.height = '100%';
      inner.appendChild(artTarget);

      // Tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'gn-orbit__tooltip';
      tooltip.textContent = work.title;

      thumb.appendChild(inner);
      thumb.appendChild(tooltip);
      container.appendChild(thumb);

      // Click → detail
      thumb.addEventListener('click', () => {
        window.location.href = `artwork-v2.html?id=${work.id}`;
      });

      // Render the SVG artwork
      try {
        ZEngine.render(artTarget, {
          archetype: work.archetype,
          palette: work.palette,
          seed: work.seed,
          density: work.density
        });
      } catch (e) {
        console.warn(`Failed to render orbit thumb ${work.id}:`, e);
      }
    });

    positionThumbs();

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(positionThumbs, 150);
    });
  }

  // ══════════════════════════════════════════════
  //  MARQUEE — Scrolling titles
  // ══════════════════════════════════════════════

  function initMarquee() {
    const track = qs('.gn-marquee__track');
    if (!track) return;

    // Build title string with dot separators
    const titles = ZCatalog.WORKS.map(w => w.title);
    let html = '';
    titles.forEach(t => {
      html += `<span class="gn-marquee__text">${t}</span><span class="gn-marquee__dot"></span>`;
    });
    // Duplicate for seamless loop
    track.innerHTML = html + html;
  }

  // ══════════════════════════════════════════════
  //  ARCHIVE — Grid + Filters + Lazy Render
  // ══════════════════════════════════════════════

  let archiveObserver = null;
  let currentFilter = 'all';

  function initArchive() {
    const grid = qs('.gn-grid');
    if (!grid) return;

    renderArchiveGrid(grid, ZCatalog.WORKS);
    initArchiveFilters(grid);
    initArchiveLazyReveal();
  }

  function renderArchiveGrid(grid, works) {
    grid.innerHTML = '';

    works.forEach((work, i) => {
      const card = document.createElement('a');
      card.className = 'gn-card';
      card.setAttribute('role', 'listitem');
      card.href = `artwork-v2.html?id=${work.id}`;
      card.dataset.era = work.era;
      card.dataset.archetype = work.archetype;
      card.dataset.palette = work.palette;
      card.dataset.index = i;

      // Art container (lazy rendered)
      const art = document.createElement('div');
      art.className = 'gn-card__art';
      art.dataset.archetype = work.archetype;
      art.dataset.palette = work.palette;
      art.dataset.seed = work.seed;
      art.dataset.density = work.density;

      // Number
      const num = document.createElement('div');
      num.className = 'gn-card__number';
      // Global index from full catalog
      const globalIndex = ZCatalog.WORKS.indexOf(work) + 1;
      num.textContent = globalIndex;

      // Info overlay
      const info = document.createElement('div');
      info.className = 'gn-card__info';
      info.innerHTML = `
        <div class="gn-card__title">${work.title}</div>
        <div class="gn-card__era">Era ${work.era} — ${work.eraName}</div>
      `;

      card.appendChild(art);
      card.appendChild(num);
      card.appendChild(info);
      grid.appendChild(card);
    });

    // Init lazy SVG rendering
    initArchiveLazyRender();
  }

  function initArchiveLazyRender() {
    // Disconnect previous observer
    if (archiveObserver) archiveObserver.disconnect();

    archiveObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.rendered) {
          const { archetype, palette, seed, density } = entry.target.dataset;
          try {
            ZEngine.render(entry.target, {
              archetype,
              palette,
              seed: parseInt(seed),
              density: parseFloat(density)
            });
            entry.target.dataset.rendered = 'true';
          } catch (e) {
            console.warn('Failed to render card:', e);
          }
        }
      });
    }, { rootMargin: LAZY_MARGIN });

    qsa('.gn-card__art').forEach(art => {
      archiveObserver.observe(art);
    });
  }

  function initArchiveLazyReveal() {
    // Persistent observer that keeps watching — cards reveal as they scroll into view
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('gn-card--visible')) {
          const rect = entry.target.getBoundingClientRect();
          const col = Math.round((rect.left / window.innerWidth) * 3);
          const stagger = col * 70;
          setTimeout(() => {
            entry.target.classList.add('gn-card--visible');
          }, stagger);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px 0px', threshold: 0.01 });

    // Delay adding the animate class so first-paint cards appear instantly
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        qsa('.gn-card').forEach(card => {
          card.classList.add('gn-card--animate');
          revealObserver.observe(card);
        });
      });
    });
  }

  function initArchiveFilters(grid) {
    const chips = qsa('.gn-filter-chip');
    if (!chips.length) return;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        // Update active state
        chips.forEach(c => c.classList.remove('gn-filter-chip--active'));
        chip.classList.add('gn-filter-chip--active');

        const filter = chip.dataset.filter;
        const filterType = chip.dataset.filterType || 'era';
        currentFilter = filter;

        let filtered;
        if (filter === 'all') {
          filtered = ZCatalog.WORKS;
        } else if (filterType === 'era') {
          filtered = ZCatalog.WORKS.filter(w => w.era === filter);
        } else if (filterType === 'archetype') {
          filtered = ZCatalog.WORKS.filter(w => w.archetype === filter);
        }

        renderArchiveGrid(grid, filtered);
        initArchiveLazyReveal();
      });
    });
  }

  // ══════════════════════════════════════════════
  //  DETAIL — Immersive artwork view
  // ══════════════════════════════════════════════

  let currentWorkIndex = 0;

  function initDetail() {
    const canvas = qs('.gn-detail__canvas');
    if (!canvas) return;

    const workId = param('id');
    if (!workId) {
      // Default to first work
      navigateToWork(ZCatalog.WORKS[0].id);
      return;
    }

    const work = ZCatalog.getById(workId);
    if (!work) {
      window.location.href = 'archive-v2.html';
      return;
    }

    currentWorkIndex = ZCatalog.WORKS.findIndex(w => w.id === workId);
    renderDetailWork(work, canvas);
    updateDetailNav(work);
    initDetailKeyboard();
  }

  function renderDetailWork(work, canvas) {
    canvas.innerHTML = '';
    canvas.classList.remove('gn-detail__canvas--exiting');

    try {
      ZEngine.render(canvas, {
        archetype: work.archetype,
        palette: work.palette,
        seed: work.seed,
        density: work.density
      });
    } catch (e) {
      console.warn('Failed to render detail:', e);
    }

    // Reset entrance animation
    canvas.style.animation = 'none';
    canvas.offsetHeight; // trigger reflow
    canvas.style.animation = '';
  }

  function updateDetailNav(work) {
    const titleEl = qs('#nav-title');
    if (titleEl) titleEl.textContent = work.title;

    // Update hidden h1 and page title for a11y + SEO
    const h1 = qs('#detail-heading');
    if (h1) h1.textContent = work.title + ' — ZSIGNAL Gallery';
    document.title = work.title + ' — ZSIGNAL Gallery';

    // Update metadata panel
    updateDetailPanel(work);

    // Update prev/next hrefs
    const allWorks = ZCatalog.WORKS;
    const prev = allWorks[(currentWorkIndex - 1 + allWorks.length) % allWorks.length];
    const next = allWorks[(currentWorkIndex + 1) % allWorks.length];

    const prevBtn = qs('[data-action="prev"]');
    const nextBtn = qs('[data-action="next"]');
    if (prevBtn) prevBtn.dataset.id = prev.id;
    if (nextBtn) nextBtn.dataset.id = next.id;
  }

  function navigateToWork(workId) {
    const canvas = qs('.gn-detail__canvas');
    if (!canvas) return;

    // Cinematic exit animation
    canvas.classList.add('gn-detail__canvas--exiting');

    setTimeout(() => {
      const work = ZCatalog.getById(workId);
      if (!work) return;

      currentWorkIndex = ZCatalog.WORKS.findIndex(w => w.id === workId);

      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('id', workId);
      history.pushState({}, '', url);

      renderDetailWork(work, canvas);
      updateDetailNav(work);
    }, 350); // match exit animation duration
  }

  function initDetailKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = ZCatalog.WORKS[(currentWorkIndex - 1 + ZCatalog.WORKS.length) % ZCatalog.WORKS.length];
        navigateToWork(prev.id);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = ZCatalog.WORKS[(currentWorkIndex + 1) % ZCatalog.WORKS.length];
        navigateToWork(next.id);
      } else if (e.key === 'Escape') {
        window.location.href = 'archive-v2.html';
      }
    });
  }

  // ── Detail Panel ──

  function updateDetailPanel(work) {
    const globalIdx = ZCatalog.WORKS.indexOf(work) + 1;
    const set = (id, val) => { const el = qs('#' + id); if (el) el.textContent = val; };

    set('panel-number', globalIdx);
    set('panel-title', work.title);
    set('panel-era', 'Era ' + work.era + ' — ' + work.eraName);
    set('panel-year', work.year);
    set('panel-desc', work.description);
    set('panel-archetype', work.archetype.replace('_', ' '));
    set('panel-palette', work.palette.replace('_', ' '));
    set('panel-seed', work.seed);
    set('panel-density', work.density);
  }

  function initDetailPanel() {
    const panel = qs('#detail-panel');
    if (!panel) return;

    document.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');
      if (!action) return;

      if (action.dataset.action === 'toggle-panel') {
        panel.classList.toggle('gn-detail__panel--open');
      }
      if (action.dataset.action === 'close-panel') {
        panel.classList.remove('gn-detail__panel--open');
      }
    });

    // Close panel on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('gn-detail__panel--open')) {
        panel.classList.remove('gn-detail__panel--open');
        e.stopPropagation(); // Don't also navigate back to archive
      }
    });
  }

  // Detail nav button clicks
  function initDetailNavButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      if (action === 'prev' || action === 'next') {
        e.preventDefault();
        const workId = btn.dataset.id;
        if (workId) navigateToWork(workId);
      }
    });
  }

  // ══════════════════════════════════════════════
  //  MOBILE NAV
  // ══════════════════════════════════════════════

  function initMobileNav() {
    const hamburger = qs('.gn-hamburger');
    const overlay = qs('.gn-mobile-nav');
    if (!hamburger || !overlay) return;

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('gn-hamburger--open');
      overlay.classList.toggle('gn-mobile-nav--open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    qsa('.gn-mobile-nav__link', overlay).forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('gn-hamburger--open');
        overlay.classList.remove('gn-mobile-nav--open');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('gn-mobile-nav--open')) {
        hamburger.classList.remove('gn-hamburger--open');
        overlay.classList.remove('gn-mobile-nav--open');
        document.body.style.overflow = '';
      }
    });
  }

  // ══════════════════════════════════════════════
  //  TOUCH SWIPE (Detail page)
  // ══════════════════════════════════════════════

  function initTouchSwipe() {
    if (!qs('.gn-detail')) return;

    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      // Only trigger on horizontal swipe (>80px, angle < 30deg)
      if (Math.abs(dx) > 80 && Math.abs(dy) < Math.abs(dx) * 0.5) {
        if (dx > 0) {
          // Swipe right → prev
          const prev = ZCatalog.WORKS[(currentWorkIndex - 1 + ZCatalog.WORKS.length) % ZCatalog.WORKS.length];
          navigateToWork(prev.id);
        } else {
          // Swipe left → next
          const next = ZCatalog.WORKS[(currentWorkIndex + 1) % ZCatalog.WORKS.length];
          navigateToWork(next.id);
        }
      }
    }, { passive: true });
  }

  // ══════════════════════════════════════════════
  //  ARTIST PAGE — Eras grid + featured art
  // ══════════════════════════════════════════════

  const ERA_DESCRIPTIONS = {
    I: 'Overlapping geometric planes explore asymmetric balance, inspired by Moholy-Nagy\'s light and transparency experiments.',
    II: 'Modular grids demonstrate the beauty of systematic constraint, drawing from Mondrian\'s asymmetric compositions.',
    III: 'Rhythmic patterns and visual crescendos reference Paul Klee\'s musical paintings and Bridget Riley\'s optical progressions.',
    IV: 'Diagonal tension and revolutionary energy channel El Lissitzky\'s constructivist propaganda posters.',
    V: 'Nested shapes in chromatic dialogue pay homage to Josef Albers\' lifelong investigation of color interaction.',
    VI: 'Point grids disrupted by geometric overlays map signal from noise, inspired by Bayer and Vasarely.',
    VII: 'Star tessellations and girih tiles bring Islamic geometric tradition into conversation with European modernism.'
  };

  function initArtist() {
    const erasGrid = qs('#eras-grid');
    if (!erasGrid) return;

    // Render hero art (large, subtle background)
    const heroArt = qs('#hero-art');
    if (heroArt) {
      const featured = ZCatalog.WORKS[Math.floor(Math.random() * ZCatalog.WORKS.length)];
      try {
        ZEngine.render(heroArt, {
          archetype: featured.archetype,
          palette: featured.palette,
          seed: featured.seed,
          density: featured.density
        });
      } catch (e) { /* silent */ }
    }

    // Render philosophy art
    const philArt = qs('#philosophy-art');
    if (philArt) {
      const philWork = ZCatalog.WORKS.find(w => w.archetype === 'COLOR_STUDY') || ZCatalog.WORKS[0];
      try {
        ZEngine.render(philArt, {
          archetype: philWork.archetype,
          palette: philWork.palette,
          seed: philWork.seed,
          density: philWork.density
        });
      } catch (e) { /* silent */ }
    }

    // Build era cards
    const eras = ZCatalog.ERAS;
    Object.keys(eras).forEach(eraKey => {
      const era = eras[eraKey];
      const eraWorks = ZCatalog.WORKS.filter(w => w.era === eraKey);
      const representative = eraWorks[0];
      if (!representative) return;

      const card = document.createElement('div');
      card.className = 'gn-artist__era-card';

      // Art preview
      const artDiv = document.createElement('div');
      artDiv.className = 'gn-artist__era-art';
      card.appendChild(artDiv);

      // Era label
      const numEl = document.createElement('div');
      numEl.className = 'gn-artist__era-number';
      numEl.textContent = 'ERA ' + eraKey + ' — ' + era.year;
      card.appendChild(numEl);

      // Name
      const nameEl = document.createElement('div');
      nameEl.className = 'gn-artist__era-name';
      nameEl.textContent = era.name;
      card.appendChild(nameEl);

      // Archetype
      const archEl = document.createElement('div');
      archEl.className = 'gn-artist__era-archetype';
      archEl.textContent = era.archetype.replace('_', ' ');
      card.appendChild(archEl);

      // Description
      const descEl = document.createElement('div');
      descEl.className = 'gn-artist__era-desc';
      descEl.textContent = ERA_DESCRIPTIONS[eraKey] || '';
      card.appendChild(descEl);

      // Link
      const linkEl = document.createElement('a');
      linkEl.className = 'gn-artist__era-link';
      linkEl.href = 'archive-v2.html';
      linkEl.textContent = 'View ' + eraWorks.length + ' works';
      card.appendChild(linkEl);

      erasGrid.appendChild(card);

      // Lazy render the art
      try {
        ZEngine.render(artDiv, {
          archetype: representative.archetype,
          palette: representative.palette,
          seed: representative.seed,
          density: representative.density
        });
      } catch (e) { /* silent */ }
    });
  }

  // ══════════════════════════════════════════════
  //  CUSTOM CURSOR — Cinematic agency feel
  // ══════════════════════════════════════════════

  function initCursor() {
    const cursor = qs('.gn-cursor');
    if (!cursor || !window.matchMedia('(hover: hover)').matches) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursor.classList.contains('gn-cursor--visible')) {
        cursor.classList.add('gn-cursor--visible');
      }
    }, { passive: true });

    // Smooth follow with lerp
    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    // Expand on interactive elements
    const hoverTargets = 'a, button, .gn-card, .gn-orbit__thumb, .gn-filter-chip';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.add('gn-cursor--hover');
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.remove('gn-cursor--hover');
      }
    }, { passive: true });

    // Click shrink
    document.addEventListener('mousedown', () => {
      cursor.classList.add('gn-cursor--click');
    }, { passive: true });
    document.addEventListener('mouseup', () => {
      cursor.classList.remove('gn-cursor--click');
    }, { passive: true });

    // Hide when mouse leaves window
    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('gn-cursor--visible');
    }, { passive: true });
  }

  // ══════════════════════════════════════════════
  //  PAGE TRANSITIONS — cinematic link navigation
  // ══════════════════════════════════════════════

  function initPageTransitions() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      // Only intercept local page links
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;

      e.preventDefault();
      const page = qs('.gn-page');
      if (page) {
        page.classList.add('gn-page--exiting');
        setTimeout(() => {
          window.location.href = href;
        }, 350);
      } else {
        window.location.href = href;
      }
    });
  }

  // ══════════════════════════════════════════════
  //  INIT — Page router
  // ══════════════════════════════════════════════

  function init() {
    // Detect current page and init appropriate modules
    if (qs('.gn-orbit')) {
      initOrbit();
      initMarquee();
    }

    if (qs('.gn-grid')) {
      initArchive();
    }

    if (qs('.gn-detail')) {
      initDetail();
      initDetailNavButtons();
      initDetailPanel();
      initTouchSwipe();
    }

    if (qs('.gn-artist')) {
      initArtist();
    }

    // Global
    initMobileNav();
    initCursor();
    initPageTransitions();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    init,
    navigateToWork,
    initOrbit,
    initArchive,
    initDetail
  };
})();
