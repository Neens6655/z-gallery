/* ═══════════════════════════════════════════════════════════════
   ZGNAL MOTION ENGINE v1.0
   Unified interactive pattern controller
   Patterns: 75 available, budget: 3 per page
   
   Implements from foundations/09-interactive-patterns.md:
   #1  Spotlight Cursor    #7  Stagger Grid Reveal
   #2  Border Beam         #9  Scroll-Linked Parallax
   #11 Scroll Progress     #14 Reveal Fade-Up
   #24 3D Card Tilt        #27 Character Scramble
   #28 Word-by-Word Split  #38 Clip-Path Reveal
   #39 Gold Border Hover
   
   All patterns respect prefers-reduced-motion: reduce
   ═══════════════════════════════════════════════════════════════ */

const ZSMotion = (() => {
  'use strict';

  // ── Motion Detection ──
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Utility ──
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // ══════════════════════════════════════════════
  // #14 — REVEAL FADE-UP (IntersectionObserver)
  // ══════════════════════════════════════════════
  function initReveal() {
    if (isReduced) {
      // Immediately show everything
      document.querySelectorAll('[data-reveal]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('zs-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('[data-reveal]').forEach(el => {
      observer.observe(el);
    });
  }

  // ══════════════════════════════════════════════
  // #7 — STAGGER GRID REVEAL
  // ══════════════════════════════════════════════
  function initStaggerGrid() {
    if (isReduced) return;

    const grids = document.querySelectorAll('[data-stagger-grid]');

    grids.forEach(grid => {
      const staggerMs = parseInt(grid.dataset.staggerMs || '80', 10);
      const children = grid.querySelectorAll(':scope > *');

      children.forEach(child => child.classList.add('zs-stagger-child'));

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();

          children.forEach((child, i) => {
            setTimeout(() => {
              child.classList.add('zs-stagger-visible');
            }, i * staggerMs);
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(grid);
    });
  }

  // ══════════════════════════════════════════════
  // #1 — SPOTLIGHT CURSOR (Gold Tint)
  // ══════════════════════════════════════════════
  function initSpotlight() {
    if (isReduced) return;
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    document.querySelectorAll('[data-spotlight]').forEach(section => {
      section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        section.style.setProperty('--zs-spot-x', x + 'px');
        section.style.setProperty('--zs-spot-y', y + 'px');
      });

      section.addEventListener('mouseleave', () => {
        section.style.removeProperty('--zs-spot-x');
        section.style.removeProperty('--zs-spot-y');
      });
    });
  }

  // ══════════════════════════════════════════════
  // #24 — 3D CARD TILT (Scroll-Linked)
  // ══════════════════════════════════════════════
  function initTiltCards() {
    if (isReduced) return;

    const containers = document.querySelectorAll('.zs-tilt-container');
    const cards = [];
    const MAX_TILT = 12; // degrees

    containers.forEach(container => {
      container.querySelectorAll('.zs-tilt-card').forEach(card => {
        cards.push({ el: card, active: false });
      });
    });

    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const card = cards.find(c => c.el === entry.target);
          if (card) card.active = entry.isIntersecting;
        });
      },
      { rootMargin: '100px' }
    );

    cards.forEach(c => observer.observe(c.el));

    function tick() {
      let count = 0;
      for (const card of cards) {
        if (!card.active || count >= 30) continue;
        count++;

        const rect = card.el.getBoundingClientRect();
        const vpH = window.innerHeight;
        const progress = 1 - (rect.top + rect.height) / (vpH + rect.height);
        const clamped = clamp(progress, 0, 1);

        const rotateY = clamped < 0.5
          ? lerp(-MAX_TILT, 0, clamped / 0.5)
          : lerp(0, MAX_TILT, (clamped - 0.5) / 0.5);

        card.el.style.transform = `rotateY(${rotateY.toFixed(2)}deg)`;
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ══════════════════════════════════════════════
  // #11 — SCROLL PROGRESS BAR
  // ══════════════════════════════════════════════
  function initScrollProgress() {
    // CSS handles this via animation-timeline: scroll()
    // This is a JS fallback for browsers without support
    const bar = document.querySelector('.zs-scroll-progress');
    if (!bar) return;

    // Check if CSS scroll-driven animations are supported
    if (CSS.supports && CSS.supports('animation-timeline', 'scroll()')) {
      return; // CSS handles it
    }

    // JS fallback
    function updateProgress() {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollMax > 0 ? (window.scrollY / scrollMax) : 0;
      bar.style.transform = `scaleX(${progress})`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ══════════════════════════════════════════════
  // SCROLL DIRECTION (Nav Hide/Show)
  // ══════════════════════════════════════════════
  function initScrollDirection() {
    if (isReduced) return;

    const nav = document.querySelector('.header');
    if (!nav) return;

    const HYSTERESIS = 8; // px
    let lastY = window.scrollY;
    let accumulator = 0;
    let direction = 'idle';
    let pending = false;

    nav.style.transition = 'transform 300ms ease, background-color 300ms ease';

    window.addEventListener('scroll', () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const y = window.scrollY;
        const diff = y - lastY;
        accumulator += diff;
        lastY = y;

        // Don't hide nav when near top
        if (y < 100) {
          nav.style.transform = 'translateY(0)';
          direction = 'idle';
          accumulator = 0;
          return;
        }

        if (accumulator > HYSTERESIS && direction !== 'down') {
          direction = 'down';
          accumulator = 0;
          nav.style.transform = 'translateY(-100%)';
        } else if (accumulator < -HYSTERESIS && direction !== 'up') {
          direction = 'up';
          accumulator = 0;
          nav.style.transform = 'translateY(0)';
        }
      });
    }, { passive: true });
  }

  // ══════════════════════════════════════════════
  // #27 — CHARACTER SCRAMBLE
  // ══════════════════════════════════════════════
  function initCharacterScramble() {
    if (isReduced) return;

    document.querySelectorAll('[data-scramble]').forEach(el => {
      const original = el.textContent;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
      let iteration = 0;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();

          const interval = setInterval(() => {
            el.textContent = original
              .split('')
              .map((letter, idx) => {
                if (idx < iteration) return original[idx];
                return chars[Math.floor(Math.random() * chars.length)];
              })
              .join('');

            if (iteration >= original.length) {
              clearInterval(interval);
            }
            iteration += 1 / 2;
          }, 30);
        },
        { threshold: 0.5 }
      );

      observer.observe(el);
    });
  }

  // ══════════════════════════════════════════════
  // #28 — WORD-BY-WORD SPLIT REVEAL
  // ══════════════════════════════════════════════
  function initWordSplit() {
    if (isReduced) return;

    document.querySelectorAll('[data-word-split]').forEach(el => {
      const text = el.textContent.trim();
      const words = text.split(/\s+/);
      el.innerHTML = '';

      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'zs-word';
        span.style.transitionDelay = (i * 60) + 'ms';
        span.textContent = word;
        el.appendChild(span);
        // Add space after each word except last
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          el.classList.add('zs-words-visible');
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
    });
  }

  // ══════════════════════════════════════════════
  // #2 — BORDER BEAM
  // ══════════════════════════════════════════════
  function initBorderBeam() {
    if (isReduced) return;
    // CSS-only via @property conic-gradient rotation
    // Just add the class — CSS handles the animation
    document.querySelectorAll('[data-border-beam]').forEach(el => {
      el.classList.add('zs-border-beam-active');
    });
  }

  // ══════════════════════════════════════════════
  // #38 — CLIP-PATH REVEAL (Circle Wipe)
  // ══════════════════════════════════════════════
  function initClipReveal() {
    if (isReduced) {
      document.querySelectorAll('[data-clip-reveal]').forEach(el => {
        el.style.clipPath = 'none';
      });
      return;
    }

    document.querySelectorAll('[data-clip-reveal]').forEach(el => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          el.classList.add('zs-clip-revealed');
        },
        { threshold: 0.2 }
      );

      observer.observe(el);
    });
  }

  // ══════════════════════════════════════════════
  // VIEW TRANSITIONS (Cross-Page)
  // ══════════════════════════════════════════════
  function initViewTransitions() {
    if (isReduced) return;
    if (!document.startViewTransition) return;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      try {
        const url = new URL(link.href, location.origin);
        if (url.origin !== location.origin) return;
        // Only intercept .html links
        if (!url.pathname.endsWith('.html') && url.pathname !== '/') return;
      } catch { return; }

      e.preventDefault();

      document.startViewTransition(() => {
        window.location.href = link.href;
      });
    });
  }

  // ══════════════════════════════════════════════
  // INIT — Call on DOMContentLoaded
  // ══════════════════════════════════════════════
  function init() {
    initReveal();
    initStaggerGrid();
    initSpotlight();
    initTiltCards();
    initScrollProgress();
    initScrollDirection();
    initCharacterScramble();
    initWordSplit();
    initBorderBeam();
    initClipReveal();
    initViewTransitions();
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, isReduced };
})();
