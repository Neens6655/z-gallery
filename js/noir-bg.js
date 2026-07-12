/**
 * NOIR-BG — Living Generative Background
 * Silent, cinematic, infinite construction/deconstruction
 *
 * Geometric primitives assemble from void → hold → dissolve → reform
 * Color pulses through the 6 ZSIGNAL palettes
 * Depth layers create parallax spatial field
 */

const NoirBG = (() => {
  'use strict';

  const PALETTES = [
    ['#C04B3C', '#3A6EA5', '#D4A84B', '#6B7B3C'],  // ZSIGNAL
    ['#E63946', '#457B9D', '#F4D35E', '#E07A2F'],  // CLASSIC BAUHAUS
    ['#CC0000', '#1A1A1A', '#8B0000', '#CC0000'],  // CONSTRUCTIVIST
    ['#C67B5C', '#CC9933', '#6B7B3C', '#8B4513'],  // WARM EARTH
    ['#3A6EA5', '#5A6B7C', '#7B96A8', '#A0A8B0'],  // COOL STEEL
    ['#404040', '#707070', '#A0A0A0', '#D0D0D0'],  // MONOCHROME
  ];

  const SHAPES = ['rect', 'circle', 'triangle', 'line', 'cross', 'arc'];

  let canvas, ctx;
  let W, H;
  let particles = [];
  let currentPalette = 0;
  let palettePhase = 0;
  let flashIntensity = 0;
  let frameCount = 0;
  let animId = null;
  let mouseX = 0.5, mouseY = 0.5;
  let isReduced = false;

  // ── Seeded random ──
  let rngState = Date.now();
  function rng() {
    rngState = (rngState * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (rngState >>> 0) / 4294967296;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  // ── Particle ──
  function createParticle(forceNew) {
    const depth = 0.2 + rng() * 0.8; // 0.2 = far, 1.0 = near
    const size = (10 + rng() * 60) * depth;
    const palette = PALETTES[currentPalette];
    const color = palette[Math.floor(rng() * palette.length)];

    return {
      // Position
      x: rng() * W,
      y: rng() * H,
      targetX: rng() * W,
      targetY: rng() * H,

      // Form
      shape: SHAPES[Math.floor(rng() * SHAPES.length)],
      size: size,
      targetSize: size,
      rotation: rng() * Math.PI * 2,
      rotSpeed: (rng() - 0.5) * 0.008 * depth,

      // Color
      color: color,
      targetColor: color,
      alpha: 0,
      targetAlpha: 0.04 + rng() * 0.12 * depth,

      // Depth
      depth: depth,

      // Lifecycle
      phase: 'assembling', // assembling → holding → dissolving → dead
      life: 0,
      assembleTime: 60 + rng() * 120,
      holdTime: 200 + rng() * 400,
      dissolveTime: 80 + rng() * 160,
      age: 0,

      // Construction lines
      constructLines: Math.floor(rng() * 4),
      lineProgress: 0,
    };
  }

  function updateParticle(p) {
    p.age++;
    p.rotation += p.rotSpeed;

    // Parallax response to mouse
    const parallaxX = (mouseX - 0.5) * 30 * p.depth;
    const parallaxY = (mouseY - 0.5) * 20 * p.depth;

    switch (p.phase) {
      case 'assembling':
        p.life++;
        const assembleT = easeInOut(Math.min(p.life / p.assembleTime, 1));
        p.alpha = lerp(0, p.targetAlpha, assembleT);
        p.lineProgress = assembleT;
        p.size = lerp(0, p.targetSize, assembleT);
        if (p.life >= p.assembleTime) {
          p.phase = 'holding';
          p.life = 0;
        }
        break;

      case 'holding':
        p.life++;
        // Subtle breathing
        p.alpha = p.targetAlpha + Math.sin(p.life * 0.02) * 0.02;
        p.lineProgress = 1;
        if (p.life >= p.holdTime) {
          p.phase = 'dissolving';
          p.life = 0;
        }
        break;

      case 'dissolving':
        p.life++;
        const dissolveT = easeInOut(Math.min(p.life / p.dissolveTime, 1));
        p.alpha = lerp(p.targetAlpha, 0, dissolveT);
        p.size = lerp(p.targetSize, p.targetSize * 1.5, dissolveT);
        p.lineProgress = 1 - dissolveT;
        if (p.life >= p.dissolveTime) {
          p.phase = 'dead';
        }
        break;
    }

    // Drift
    p.x += (p.targetX - p.x) * 0.002 * p.depth + parallaxX * 0.01;
    p.y += (p.targetY - p.y) * 0.002 * p.depth + parallaxY * 0.01;
  }

  function drawParticle(p) {
    if (p.alpha <= 0.001) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha + flashIntensity * 0.08 * p.depth;

    const s = p.size;
    const half = s / 2;

    // Construction lines (scaffold before shape appears)
    if (p.constructLines > 0 && p.lineProgress > 0 && p.lineProgress < 1) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = p.alpha * 0.4;
      for (let i = 0; i < p.constructLines; i++) {
        const angle = (i / p.constructLines) * Math.PI;
        const len = s * 1.5 * p.lineProgress;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(angle) * len, -Math.sin(angle) * len);
        ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = p.alpha + flashIntensity * 0.08 * p.depth;
    }

    // Shape
    ctx.fillStyle = p.color;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;

    switch (p.shape) {
      case 'rect':
        ctx.fillRect(-half, -half, s, s);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, half, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -half);
        ctx.lineTo(half, half);
        ctx.lineTo(-half, half);
        ctx.closePath();
        ctx.fill();
        break;

      case 'line':
        ctx.lineWidth = 2 * p.depth;
        ctx.beginPath();
        ctx.moveTo(-s, 0);
        ctx.lineTo(s, 0);
        ctx.stroke();
        break;

      case 'cross':
        ctx.lineWidth = 2 * p.depth;
        ctx.beginPath();
        ctx.moveTo(-half, 0);
        ctx.lineTo(half, 0);
        ctx.moveTo(0, -half);
        ctx.lineTo(0, half);
        ctx.stroke();
        break;

      case 'arc':
        ctx.lineWidth = 2 * p.depth;
        ctx.beginPath();
        ctx.arc(0, 0, half, 0, Math.PI);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  // ── Flash system ──
  function updateFlash() {
    // Every ~8 seconds, do a subtle color flash
    if (frameCount % 480 === 0 && frameCount > 0) {
      flashIntensity = 0.6;
      // Cycle palette
      currentPalette = (currentPalette + 1) % PALETTES.length;
      // Retarget some particles with new palette colors
      const palette = PALETTES[currentPalette];
      particles.forEach(p => {
        if (rng() > 0.5) {
          p.targetColor = palette[Math.floor(rng() * palette.length)];
          p.color = p.targetColor;
        }
      });
    }
    flashIntensity *= 0.96;
  }

  // ── Main loop ──
  function tick() {
    frameCount++;
    ctx.clearRect(0, 0, W, H);

    // Flash overlay
    if (flashIntensity > 0.01) {
      const palette = PALETTES[currentPalette];
      const flashColor = palette[0];
      ctx.fillStyle = flashColor;
      ctx.globalAlpha = flashIntensity * 0.03;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    updateFlash();

    // Update + draw particles (back to front by depth)
    particles.sort((a, b) => a.depth - b.depth);
    particles.forEach(p => {
      updateParticle(p);
      drawParticle(p);
    });

    // Remove dead, spawn new
    particles = particles.filter(p => p.phase !== 'dead');

    // Maintain ~30-40 particles
    const targetCount = isReduced ? 10 : 35;
    while (particles.length < targetCount) {
      particles.push(createParticle(true));
    }

    animId = requestAnimationFrame(tick);
  }

  // ── Resize ──
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // ── Init ──
  function init() {
    canvas = document.getElementById('noir-bg');
    if (!canvas) return;

    // Check reduced motion
    isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      // Still render but much slower, fewer particles
      canvas.style.opacity = '0.3';
    }

    ctx = canvas.getContext('2d');
    resize();

    // Seed initial particles
    const initialCount = isReduced ? 10 : 35;
    for (let i = 0; i < initialCount; i++) {
      const p = createParticle(false);
      // Stagger initial phases
      p.life = Math.floor(rng() * p.assembleTime);
      if (rng() > 0.5) {
        p.phase = 'holding';
        p.alpha = p.targetAlpha;
        p.size = p.targetSize;
        p.lineProgress = 1;
      }
      particles.push(p);
    }

    // Mouse tracking for parallax
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / W;
      mouseY = e.clientY / H;
    }, { passive: true });

    window.addEventListener('resize', resize, { passive: true });

    tick();
  }

  function destroy() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, destroy };
})();
