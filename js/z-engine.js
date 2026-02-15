/**
 * ZIGNAL.ENGINE V2 — Generative Bauhaus Art Engine
 *
 * Master References per Archetype:
 *   FREE_FORM     → László Moholy-Nagy: "A 19" (1927), "Composition" (1924)
 *   GRID          → Piet Mondrian: "Composition II" (1930), Kandinsky: "Thirteen Rectangles"
 *   REPETITION    → Paul Klee: "Rhythmisches" (1930), Bridget Riley: "Movement in Squares"
 *   CONSTRUCTIVIST → El Lissitzky: "Beat the Whites with the Red Wedge" (1920)
 *   COLOR_STUDY   → Josef Albers: "Homage to the Square" series (1950-1976)
 *   DOT_FIELD     → Herbert Bayer: typographic experiments, Victor Vasarely: planetary folklore
 *
 * Each composer now produces gallery-quality SVG compositions that faithfully
 * reference the visual language, proportions, and compositional strategies
 * of its master artist.
 */

const ZEngine = (() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CANVAS = 560;

  // ── SEEDED PRNG (mulberry32) ──
  function createRng(seed) {
    let s = seed | 0;
    return () => {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ── PALETTES ──
  const PALETTES = {
    ZSIGNAL: {
      colors: ['#C04B3C', '#3A6EA5', '#D4A84B', '#6B7B3C', '#1C1C1C'],
      bg: '#F2E8D5', charcoal: '#1C1C1C'
    },
    CLASSIC_BAUHAUS: {
      colors: ['#E63946', '#457B9D', '#F4D35E', '#1D1D1D', '#E07A2F'],
      bg: '#F0E6D3', charcoal: '#1D1D1D'
    },
    CONSTRUCTIVIST: {
      colors: ['#CC0000', '#1A1A1A', '#CC0000', '#8B0000'],
      bg: '#F5F0E8', charcoal: '#000000'
    },
    WARM_EARTH: {
      colors: ['#C67B5C', '#CC9933', '#6B7B3C', '#8B4513', '#1C1C1C'],
      bg: '#F2E8D5', charcoal: '#1C1C1C'
    },
    COOL_STEEL: {
      colors: ['#3A6EA5', '#5A6B7C', '#7B96A8', '#A0A8B0', '#1C1C1C'],
      bg: '#E8ECF0', charcoal: '#1C1C1C'
    },
    MONOCHROME: {
      colors: ['#1C1C1C', '#404040', '#707070', '#A0A0A0', '#D0D0D0'],
      bg: '#F2E8D5', charcoal: '#1C1C1C'
    }
  };

  // ── SVG HELPERS ──
  function el(tag, attrs) {
    const e = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }

  function group(attrs = {}) {
    return el('g', attrs);
  }

  // ── ADVANCED SVG DEFS — Filters, Gradients, Textures ──
  // These create gallery-quality visual richness using pure SVG
  function addDefs(svg, seed, palette) {
    const defs = el('defs', {});
    const uid = `z${seed}`; // Unique prefix for this artwork

    // 1. PAPER TEXTURE — visible fine-art grain
    const turbulence = el('feTurbulence', {
      type: 'fractalNoise', baseFrequency: '0.55', numOctaves: '4',
      stitchTiles: 'stitch', result: 'noise', seed: seed % 1000
    });
    const colorMatrix = el('feColorMatrix', {
      type: 'saturate', values: '0', in: 'noise', result: 'mono'
    });
    const blend = el('feBlend', {
      in: 'SourceGraphic', in2: 'mono', mode: 'multiply', result: 'tex'
    });
    const composite = el('feComposite', {
      in: 'tex', in2: 'SourceAlpha', operator: 'in'
    });
    const paperFilter = el('filter', { id: `${uid}-paper`, x: '0', y: '0', width: '100%', height: '100%' });
    paperFilter.appendChild(turbulence);
    paperFilter.appendChild(colorMatrix);
    paperFilter.appendChild(blend);
    paperFilter.appendChild(composite);
    defs.appendChild(paperFilter);

    // 2. SOFT SHADOW — depth for overlapping shapes
    const shadowFilter = el('filter', { id: `${uid}-shadow`, x: '-10%', y: '-10%', width: '130%', height: '130%' });
    shadowFilter.appendChild(el('feOffset', { dx: '2', dy: '3', in: 'SourceAlpha', result: 'offset' }));
    shadowFilter.appendChild(el('feGaussianBlur', { in: 'offset', stdDeviation: '5', result: 'blur' }));
    shadowFilter.appendChild(el('feFlood', { 'flood-color': 'rgba(0,0,0,0.06)', result: 'flood' }));
    shadowFilter.appendChild(el('feComposite', { in: 'flood', in2: 'blur', operator: 'in', result: 'shadow' }));
    const feMerge = el('feMerge', {});
    feMerge.appendChild(el('feMergeNode', { in: 'shadow' }));
    feMerge.appendChild(el('feMergeNode', { in: 'SourceGraphic' }));
    shadowFilter.appendChild(feMerge);
    defs.appendChild(shadowFilter);

    // 3. DEEP SHADOW — stronger depth for hero elements
    const deepShadow = el('filter', { id: `${uid}-deep-shadow`, x: '-15%', y: '-15%', width: '140%', height: '140%' });
    deepShadow.appendChild(el('feOffset', { dx: '4', dy: '6', in: 'SourceAlpha', result: 'offset' }));
    deepShadow.appendChild(el('feGaussianBlur', { in: 'offset', stdDeviation: '8', result: 'blur' }));
    deepShadow.appendChild(el('feFlood', { 'flood-color': 'rgba(0,0,0,0.08)', result: 'flood' }));
    deepShadow.appendChild(el('feComposite', { in: 'flood', in2: 'blur', operator: 'in', result: 'shadow' }));
    const deepMerge = el('feMerge', {});
    deepMerge.appendChild(el('feMergeNode', { in: 'shadow' }));
    deepMerge.appendChild(el('feMergeNode', { in: 'SourceGraphic' }));
    deepShadow.appendChild(deepMerge);
    defs.appendChild(deepShadow);

    // 4. VIGNETTE — darkened edges for gallery-quality framing
    const vigGrad = el('radialGradient', { id: `${uid}-vignette`, cx: '50%', cy: '50%', r: '70%' });
    vigGrad.appendChild(el('stop', { offset: '0%', 'stop-color': 'transparent' }));
    vigGrad.appendChild(el('stop', { offset: '70%', 'stop-color': 'transparent' }));
    vigGrad.appendChild(el('stop', { offset: '100%', 'stop-color': 'rgba(0,0,0,0.04)' }));
    defs.appendChild(vigGrad);

    // 5. PALETTE-AWARE GRADIENTS — warm glow, cool sheen, depth fade
    if (palette) {
      const c = palette.colors;
      // Warm gradient (first color to gold)
      const warmGrad = el('linearGradient', { id: `${uid}-warm`, x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
      warmGrad.appendChild(el('stop', { offset: '0%', 'stop-color': c[0] || '#C04B3C' }));
      warmGrad.appendChild(el('stop', { offset: '100%', 'stop-color': '#D4A84B' }));
      defs.appendChild(warmGrad);

      // Cool gradient (second color fading)
      const coolGrad = el('linearGradient', { id: `${uid}-cool`, x1: '0%', y1: '100%', x2: '100%', y2: '0%' });
      coolGrad.appendChild(el('stop', { offset: '0%', 'stop-color': c[1] || '#3A6EA5' }));
      coolGrad.appendChild(el('stop', { offset: '100%', 'stop-color': c[2] || '#D4A84B', 'stop-opacity': '0.7' }));
      defs.appendChild(coolGrad);

      // Depth gradient (charcoal to transparent — for atmospheric perspective)
      const depthGrad = el('linearGradient', { id: `${uid}-depth`, x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
      depthGrad.appendChild(el('stop', { offset: '0%', 'stop-color': palette.charcoal, 'stop-opacity': '0.01' }));
      depthGrad.appendChild(el('stop', { offset: '100%', 'stop-color': palette.charcoal, 'stop-opacity': '0.05' }));
      defs.appendChild(depthGrad);

      // Radial glow (for focal gold elements)
      const glowGrad = el('radialGradient', { id: `${uid}-glow`, cx: '50%', cy: '50%', r: '50%' });
      glowGrad.appendChild(el('stop', { offset: '0%', 'stop-color': '#D4A84B' }));
      glowGrad.appendChild(el('stop', { offset: '60%', 'stop-color': '#D4A84B', 'stop-opacity': '0.6' }));
      glowGrad.appendChild(el('stop', { offset: '100%', 'stop-color': '#D4A84B', 'stop-opacity': '0' }));
      defs.appendChild(glowGrad);
    }

    svg.appendChild(defs);
    return uid;
  }

  // ── COMPOSITION HELPERS ──
  // Golden ratio anchor points for aesthetically balanced placement
  const PHI = 1.618033988749895;
  const PHI_INV = 1 / PHI; // 0.618...

  // Returns golden-ratio grid points within the canvas
  function goldenPoints() {
    const C = CANVAS;
    return {
      // Rule of thirds intersections (approximates golden ratio)
      tl: { x: C * PHI_INV * PHI_INV, y: C * PHI_INV * PHI_INV },  // ~0.236
      tr: { x: C * PHI_INV, y: C * PHI_INV * PHI_INV },             // ~0.618, ~0.236
      bl: { x: C * PHI_INV * PHI_INV, y: C * PHI_INV },             // ~0.236, ~0.618
      br: { x: C * PHI_INV, y: C * PHI_INV },                       // ~0.618, ~0.618
      center: { x: C / 2, y: C / 2 },
      // Strong anchor positions
      leftThird: C * PHI_INV * PHI_INV,
      rightThird: C * PHI_INV,
      topThird: C * PHI_INV * PHI_INV,
      bottomThird: C * PHI_INV
    };
  }

  // Pick harmonious color pairs from a palette (never identical adjacent)
  function harmonicColors(rng, colors, count) {
    const result = [];
    const pool = shuffled(rng, colors);
    for (let i = 0; i < count; i++) {
      result.push(pool[i % pool.length]);
    }
    return result;
  }

  // Apply shadow filter to an SVG element
  function withShadow(element, uid) {
    element.setAttribute('filter', `url(#${uid}-shadow)`);
    return element;
  }

  function withDeepShadow(element, uid) {
    element.setAttribute('filter', `url(#${uid}-deep-shadow)`);
    return element;
  }

  // ── ENHANCED SHAPE PRIMITIVES ──
  const Shapes = {
    rect(x, y, w, h, fill, opacity = 1) {
      return el('rect', { x, y, width: w, height: h, fill, opacity });
    },

    rectOutline(x, y, w, h, stroke, sw = 2, opacity = 1) {
      return el('rect', { x, y, width: w, height: h, fill: 'none', stroke, 'stroke-width': sw, opacity });
    },

    circle(cx, cy, r, fill, opacity = 1) {
      return el('circle', { cx, cy, r, fill, opacity });
    },

    circleOutline(cx, cy, r, stroke, sw = 2, opacity = 1) {
      return el('circle', { cx, cy, r, fill: 'none', stroke, 'stroke-width': sw, opacity });
    },

    semicircle(cx, cy, r, rotation, fill, opacity = 1) {
      const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`;
      return el('path', { d, fill, opacity, transform: `rotate(${rotation} ${cx} ${cy})` });
    },

    triangle(cx, cy, size, rotation, fill, opacity = 1) {
      const h = size * Math.sqrt(3) / 2;
      const points = `${cx},${cy - h * 2 / 3} ${cx - size / 2},${cy + h / 3} ${cx + size / 2},${cy + h / 3}`;
      return el('polygon', { points, fill, opacity, transform: `rotate(${rotation} ${cx} ${cy})` });
    },

    // Dramatic wedge — sharp isosceles triangle like Lissitzky
    wedge(cx, cy, width, height, rotation, fill, opacity = 1) {
      const points = `${cx},${cy - height / 2} ${cx - width / 2},${cy + height / 2} ${cx + width / 2},${cy + height / 2}`;
      return el('polygon', { points, fill, opacity, transform: `rotate(${rotation} ${cx} ${cy})` });
    },

    quarterCircle(cx, cy, r, corner, fill, opacity = 1) {
      const paths = {
        tl: `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`,
        tr: `M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`,
        br: `M ${cx} ${cy} L ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx - r} ${cy} Z`,
        bl: `M ${cx} ${cy} L ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r} Z`,
      };
      return el('path', { d: paths[corner], fill, opacity });
    },

    // Mondrian-style thick black dividers
    thickLine(x1, y1, x2, y2, color, width = 4) {
      return el('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': width, 'stroke-linecap': 'butt' });
    },

    thinLine(x1, y1, x2, y2, color, width = 2) {
      return el('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': width });
    },

    // Diagonal line spanning full canvas
    diagonalLine(angle, cx, cy, color, width = 1.5) {
      const rad = angle * Math.PI / 180;
      const len = CANVAS * 1.5;
      return el('line', {
        x1: cx - Math.cos(rad) * len, y1: cy - Math.sin(rad) * len,
        x2: cx + Math.cos(rad) * len, y2: cy + Math.sin(rad) * len,
        stroke: color, 'stroke-width': width
      });
    },

    stripeBlock(x, y, w, h, direction, color, gap = 10, strokeW = 2) {
      const g = el('g', { opacity: '0.35' });
      if (direction === 'vertical') {
        for (let px = x; px <= x + w; px += gap)
          g.appendChild(el('line', { x1: px, y1: y, x2: px, y2: y + h, stroke: color, 'stroke-width': strokeW }));
      } else {
        for (let py = y; py <= y + h; py += gap)
          g.appendChild(el('line', { x1: x, y1: py, x2: x + w, y2: py, stroke: color, 'stroke-width': strokeW }));
      }
      return g;
    },

    // Crosshatch pattern fill
    crosshatch(x, y, w, h, color, gap = 8, sw = 1, opacity = 0.2) {
      const g = el('g', { opacity });
      for (let d = -Math.max(w, h); d <= Math.max(w, h); d += gap) {
        const lx1 = Math.max(x, x + d);
        const ly1 = Math.max(y, y + (d < 0 ? -d : 0));
        const lx2 = Math.min(x + w, x + d + h);
        const ly2 = Math.min(y + h, y + (d > 0 ? w - d : w));
        if (lx1 < x + w && ly1 < y + h) {
          g.appendChild(el('line', { x1: x + d, y1: y, x2: x + d + h, y2: y + h, stroke: color, 'stroke-width': sw }));
        }
      }
      return g;
    },

    dot(cx, cy, r, fill, opacity = 1) {
      return el('circle', { cx, cy, r, fill, opacity });
    },

    concentricRing(cx, cy, r, stroke, sw = 2, opacity = 1) {
      return el('circle', { cx, cy, r, fill: 'none', stroke, 'stroke-width': sw, opacity });
    },

    arcSegment(cx, cy, r, startDeg, endDeg, color, sw = 3) {
      const toRad = d => d * Math.PI / 180;
      const x1 = cx + r * Math.cos(toRad(startDeg));
      const y1 = cy + r * Math.sin(toRad(startDeg));
      const x2 = cx + r * Math.cos(toRad(endDeg));
      const y2 = cy + r * Math.sin(toRad(endDeg));
      const large = (endDeg - startDeg) > 180 ? 1 : 0;
      return el('path', { d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, fill: 'none', stroke: color, 'stroke-width': sw });
    },

    cross(cx, cy, size, color, sw = 3) {
      const g = el('g', {});
      g.appendChild(el('line', { x1: cx - size, y1: cy, x2: cx + size, y2: cy, stroke: color, 'stroke-width': sw }));
      g.appendChild(el('line', { x1: cx, y1: cy - size, x2: cx, y2: cy + size, stroke: color, 'stroke-width': sw }));
      return g;
    },

    // Trapezoid — useful for perspective and constructivist compositions
    trapezoid(cx, cy, topW, bottomW, h, rotation, fill, opacity = 1) {
      const points = [
        `${cx - topW / 2},${cy - h / 2}`,
        `${cx + topW / 2},${cy - h / 2}`,
        `${cx + bottomW / 2},${cy + h / 2}`,
        `${cx - bottomW / 2},${cy + h / 2}`
      ].join(' ');
      return el('polygon', { points, fill, opacity, transform: `rotate(${rotation} ${cx} ${cy})` });
    },

    // Rotated rectangle (parallelogram-like)
    rotatedRect(cx, cy, w, h, angle, fill, opacity = 1) {
      return el('rect', {
        x: cx - w / 2, y: cy - h / 2, width: w, height: h,
        fill, opacity, transform: `rotate(${angle} ${cx} ${cy})`
      });
    },

    // Bar — long thin rectangle, common in constructivist works
    bar(cx, cy, length, thickness, angle, fill, opacity = 1) {
      return el('rect', {
        x: cx - length / 2, y: cy - thickness / 2, width: length, height: thickness,
        fill, opacity, transform: `rotate(${angle} ${cx} ${cy})`
      });
    }
  };

  // ── UTILITY ──
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function range(rng, min, max) { return min + rng() * (max - min); }
  function rangeInt(rng, min, max) { return Math.floor(range(rng, min, max + 1)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function shuffled(rng, arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ══════════════════════════════════════════════════════════════
  //  SIMPLEX NOISE 2D — Seeded, deterministic organic variation
  //  Used for: flow fields, edge perturbation, color jitter,
  //  hatching line wobble, density modulation
  // ══════════════════════════════════════════════════════════════
  function createNoise2D(rng) {
    // Generate permutation table from seeded RNG
    const perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    // 2D simplex gradients (12 directions)
    const GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1],
                  [1,1],[-1,1],[1,-1],[-1,-1]];
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    return function noise2D(x, y) {
      const s = (x + y) * F2;
      const i = Math.floor(x + s);
      const j = Math.floor(y + s);
      const t = (i + j) * G2;
      const X0 = i - t, Y0 = j - t;
      const x0 = x - X0, y0 = y - Y0;

      let i1, j1;
      if (x0 > y0) { i1 = 1; j1 = 0; }
      else { i1 = 0; j1 = 1; }

      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;

      let n0 = 0, n1 = 0, n2 = 0;
      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 > 0) {
        t0 *= t0;
        const g = GRAD[perm[ii + perm[jj]] % 12];
        n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
      }
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 > 0) {
        t1 *= t1;
        const g = GRAD[perm[ii + i1 + perm[jj + j1]] % 12];
        n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
      }
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 > 0) {
        t2 *= t2;
        const g = GRAD[perm[ii + 1 + perm[jj + 1]] % 12];
        n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
      }
      return 70 * (n0 + n1 + n2); // Range: -1 to 1
    };
  }

  // ══════════════════════════════════════════════════════════════
  //  WEIGHTED COLOR SELECTION — Probabilistic, not uniform random
  //  Primary colors appear more often, gold is rare and special
  // ══════════════════════════════════════════════════════════════
  function weightedPick(rng, colors, weights) {
    if (!weights) {
      // Default weights: first color 35%, second 25%, third 20%, rest split remaining
      weights = colors.map((_, i) => i === 0 ? 0.35 : i === 1 ? 0.25 : i === 2 ? 0.2 : 0.2 / Math.max(1, colors.length - 3));
    }
    const total = weights.reduce((s, w) => s + w, 0);
    let r = rng() * total;
    for (let i = 0; i < colors.length; i++) {
      r -= weights[i];
      if (r <= 0) return colors[i];
    }
    return colors[colors.length - 1];
  }

  // Spatial color — color influenced by position (warm top-left, cool bottom-right)
  function spatialColor(rng, colors, x, y, C) {
    const nx = x / C, ny = y / C;
    const warmBias = (1 - nx) * (1 - ny); // Top-left = warm
    const coolBias = nx * ny;              // Bottom-right = cool
    const weights = colors.map((_, i) => {
      if (i === 0) return 0.2 + warmBias * 0.3;
      if (i === 1) return 0.2 + coolBias * 0.3;
      return 0.15 + rng() * 0.1;
    });
    return weightedPick(rng, colors, weights);
  }

  // ══════════════════════════════════════════════════════════════
  //  COLLISION-AWARE PLACEMENT — Spatial hash grid
  //  Shapes can query neighbors before placement
  // ══════════════════════════════════════════════════════════════
  function createSpatialGrid(canvasSize, cellSize) {
    const cols = Math.ceil(canvasSize / cellSize);
    const grid = {};

    function key(cx, cy) { return `${cx},${cy}`; }

    function insert(bounds) {
      // bounds: { x, y, w, h } or { cx, cy, r }
      let x1, y1, x2, y2;
      if (bounds.r !== undefined) {
        x1 = bounds.cx - bounds.r; y1 = bounds.cy - bounds.r;
        x2 = bounds.cx + bounds.r; y2 = bounds.cy + bounds.r;
      } else {
        x1 = bounds.x; y1 = bounds.y;
        x2 = bounds.x + bounds.w; y2 = bounds.y + bounds.h;
      }
      const c1 = Math.floor(x1 / cellSize), r1 = Math.floor(y1 / cellSize);
      const c2 = Math.floor(x2 / cellSize), r2 = Math.floor(y2 / cellSize);
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const k = key(c, r);
          if (!grid[k]) grid[k] = [];
          grid[k].push(bounds);
        }
      }
    }

    function query(bounds) {
      let x1, y1, x2, y2;
      if (bounds.r !== undefined) {
        x1 = bounds.cx - bounds.r; y1 = bounds.cy - bounds.r;
        x2 = bounds.cx + bounds.r; y2 = bounds.cy + bounds.r;
      } else {
        x1 = bounds.x; y1 = bounds.y;
        x2 = bounds.x + bounds.w; y2 = bounds.y + bounds.h;
      }
      const c1 = Math.floor(x1 / cellSize), r1 = Math.floor(y1 / cellSize);
      const c2 = Math.floor(x2 / cellSize), r2 = Math.floor(y2 / cellSize);
      const results = new Set();
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const items = grid[key(c, r)];
          if (items) items.forEach(b => results.add(b));
        }
      }
      return Array.from(results);
    }

    function density(x, y, radius) {
      const nearby = query({ cx: x, cy: y, r: radius });
      return nearby.length;
    }

    return { insert, query, density };
  }

  // ══════════════════════════════════════════════════════════════
  //  ORGANIC EDGE PERTURBATION — Wobble shape outlines with noise
  // ══════════════════════════════════════════════════════════════

  // Add noise perturbation to a rectangle, returning an organic polygon
  function organicRect(x, y, w, h, noise, rng, amplitude = 3) {
    const steps = 12; // Points per side
    const points = [];
    const ns = 0.02; // Noise scale
    const seed = rng() * 100;

    // Top edge
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x + w * t;
      const py = y + noise(px * ns + seed, y * ns) * amplitude;
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    // Right edge
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const px = x + w + noise((x + w) * ns, (y + h * t) * ns + seed) * amplitude;
      const py = y + h * t;
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    // Bottom edge (reversed)
    for (let i = steps - 1; i >= 0; i--) {
      const t = i / steps;
      const px = x + w * t;
      const py = y + h + noise(px * ns + seed, (y + h) * ns + 50) * amplitude;
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    // Left edge (reversed)
    for (let i = steps - 1; i >= 1; i--) {
      const t = i / steps;
      const px = x + noise(x * ns + 50, (y + h * t) * ns + seed) * amplitude;
      const py = y + h * t;
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }

    return points.join(' ');
  }

  // Organic circle — circle with noise perturbation on radius
  function organicCirclePath(cx, cy, r, noise, rng, amplitude = 2.5) {
    const steps = 32;
    const ns = 0.03;
    const seed = rng() * 100;
    const points = [];

    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const noiseVal = noise(Math.cos(angle) * 2 + seed, Math.sin(angle) * 2 + seed * 0.7);
      const rr = r + noiseVal * amplitude;
      points.push(`${(cx + Math.cos(angle) * rr).toFixed(1)},${(cy + Math.sin(angle) * rr).toFixed(1)}`);
    }

    return points.join(' ');
  }

  // ══════════════════════════════════════════════════════════════
  //  ENHANCED SHAPE FACTORY — Solid fills with subtle organic edges
  //  Composers call these instead of raw Shapes for gallery-quality output
  // ══════════════════════════════════════════════════════════════
  function createArtShapes(noise, rng, uid) {
    const artShapes = {
      // Solid rectangle with subtle organic edge
      rect(x, y, w, h, fill, opacity = 0.85) {
        const g = el('g', {});
        // Subtle organic edge halo
        const edgePts = organicRect(x, y, w, h, noise, rng, clamp(w * 0.008, 0.8, 2.5));
        g.appendChild(el('polygon', {
          points: edgePts, fill, opacity: opacity * 0.12, stroke: 'none'
        }));
        // Solid fill rectangle
        g.appendChild(el('rect', { x, y, width: w, height: h, fill, opacity }));
        return g;
      },

      // Solid circle with subtle organic edge
      circle(cx, cy, r, fill, opacity = 0.85) {
        const g = el('g', {});
        // Organic edge halo
        const edgePts = organicCirclePath(cx, cy, r, noise, rng, clamp(r * 0.025, 0.5, 2));
        g.appendChild(el('polygon', {
          points: edgePts, fill, opacity: opacity * 0.12, stroke: 'none'
        }));
        // Solid fill circle
        g.appendChild(el('circle', { cx, cy, r, fill, opacity }));
        return g;
      },

      // Solid triangle
      triangle(cx, cy, size, rotation, fill, opacity = 0.85) {
        const h = size * Math.sqrt(3) / 2;
        const pts = [
          [cx, cy - h * 2 / 3],
          [cx - size / 2, cy + h / 3],
          [cx + size / 2, cy + h / 3]
        ];
        const rad = rotation * Math.PI / 180;
        const rotPts = pts.map(([px, py]) => {
          const dx = px - cx, dy = py - cy;
          return [cx + dx * Math.cos(rad) - dy * Math.sin(rad),
                  cy + dx * Math.sin(rad) + dy * Math.cos(rad)];
        });
        const ptsStr = rotPts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
        return el('polygon', { points: ptsStr, fill, opacity });
      },

      // Solid wedge
      wedge(cx, cy, width, height, rotation, fill, opacity = 0.85) {
        const pts = [
          [cx, cy - height / 2],
          [cx - width / 2, cy + height / 2],
          [cx + width / 2, cy + height / 2]
        ];
        const rad = rotation * Math.PI / 180;
        const rotPts = pts.map(([px, py]) => {
          const dx = px - cx, dy = py - cy;
          return [cx + dx * Math.cos(rad) - dy * Math.sin(rad),
                  cy + dx * Math.sin(rad) + dy * Math.cos(rad)];
        });
        const ptsStr = rotPts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
        return el('polygon', { points: ptsStr, fill, opacity });
      },

      // Semicircle with solid fill
      semicircle(cx, cy, r, rotation, fill, opacity = 0.85) {
        const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`;
        return el('path', { d, fill, opacity, transform: `rotate(${rotation} ${cx} ${cy})` });
      },

      // Bar (long thin rectangle) with solid fill
      bar(cx, cy, length, thickness, angle, fill, opacity = 0.85) {
        return artShapes.rect(
          cx - length / 2, cy - thickness / 2,
          length, thickness, fill, opacity
        );
      }
    };

    return artShapes;
  }

  // ══════════════════════════════════════════════════════════════
  //  COMPOSER: FREE_FORM
  //  Reference: Moholy-Nagy "A 19" (1927), "Composition" (1924)
  //
  //  Key characteristics:
  //  - Large overlapping transparent planes with clear hierarchy
  //  - Shapes extend boldly beyond canvas edges
  //  - Strong diagonal energy even in rectangular forms
  //  - Floating circles as focal/gravitational points
  //  - Transparency and overlap create optical depth
  //  - Maximum 4-5 major shapes, purposeful placement
  //  - Industrial precision meets painterly space
  // ══════════════════════════════════════════════════════════════
  function composeFreeForm(svg, palette, rng, density, uid) {
    const C = CANVAS;
    const colors = palette.colors;
    const bg = palette.bg;
    const gp = goldenPoints();
    const noise = createNoise2D(rng);
    const art = createArtShapes(noise, rng, uid);
    const grid = createSpatialGrid(C, 80);

    svg.appendChild(Shapes.rect(0, 0, C, C, bg));

    // ── COMPOSABLE FEATURES (5 independent axes) ──
    const strategy = rangeInt(rng, 0, 4);  // 5 strategies
    const hasTexture = density > 0.35 && rng() > 0.3;
    const hasConnectors = density > 0.3 && rng() > 0.4;
    const hasMicroAccents = rng() > 0.35;
    const hatchDensity = lerp(4.5, 2.5, density); // Denser hatching at higher density

    if (strategy === 0) {
      // === OVERLAPPING PLANES (A 19 style) ===
      const p1W = range(rng, C * 0.52, C * 0.68);
      const p1H = range(rng, C * 0.58, C * 0.72);
      const p1X = range(rng, -p1W * 0.12, C * 0.08);
      const p1Y = range(rng, -p1H * 0.08, C * 0.12);
      const p1Color = weightedPick(rng, colors);
      svg.appendChild(withShadow(art.rect(p1X, p1Y, p1W, p1H, p1Color, 0.82), uid));
      grid.insert({ x: p1X, y: p1Y, w: p1W, h: p1H });

      const p2W = range(rng, C * 0.38, C * 0.52);
      const p2H = range(rng, C * 0.42, C * 0.58);
      const p2X = p1X + p1W * range(rng, 0.2, 0.4);
      const p2Y = p1Y + p1H * range(rng, 0.15, 0.35);
      const p2Color = spatialColor(rng, colors, p2X, p2Y, C);
      svg.appendChild(withShadow(art.rect(p2X, p2Y, p2W, p2H, p2Color, 0.68), uid));
      grid.insert({ x: p2X, y: p2Y, w: p2W, h: p2H });

      if (density > 0.3) {
        const p3W = range(rng, C * 0.18, C * 0.28);
        const p3H = range(rng, C * 0.22, C * 0.32);
        const p3X = rng() > 0.5 ? gp.rightThird : range(rng, -p3W * 0.2, C * 0.05);
        const p3Y = rng() > 0.5 ? gp.bottomThird : range(rng, C * 0.05, gp.topThird);
        svg.appendChild(art.rect(p3X, p3Y, p3W, p3H, palette.charcoal, 0.72));
      }

      // THE GOLD SIGNAL
      const fcR = range(rng, C * 0.07, C * 0.13);
      const fcX = lerp(p1X + p1W / 2, p2X + p2W / 2, range(rng, 0.35, 0.65));
      const fcY = lerp(p1Y + p1H / 2, p2Y + p2H / 2, range(rng, 0.35, 0.65));
      svg.appendChild(Shapes.circle(fcX, fcY, fcR * 1.8, `url(#${uid}-glow)`, 0.5));
      svg.appendChild(withDeepShadow(art.circle(fcX, fcY, fcR, '#D4A84B', 0.9), uid));

      // Counter-weight
      const cwX = fcX > C / 2 ? gp.tl.x + range(rng, -20, 20) : gp.tr.x + range(rng, -20, 20);
      const cwY = fcY > C / 2 ? gp.tl.y + range(rng, -20, 20) : gp.bl.y + range(rng, -20, 20);
      const cwSize = range(rng, C * 0.06, C * 0.1);
      if (rng() > 0.5) {
        svg.appendChild(art.triangle(cwX, cwY, cwSize * 1.8, rangeInt(rng, 0, 3) * 90, palette.charcoal, 0.85));
      } else {
        svg.appendChild(art.circle(cwX, cwY, cwSize * 0.5, colors[2] || palette.charcoal, 0.75));
      }

      if (hasConnectors) {
        svg.appendChild(Shapes.thinLine(p1X, p1Y + p1H, p2X + p2W, p2Y, palette.charcoal, 0.8));
        svg.appendChild(Shapes.thinLine(fcX, fcY, cwX, cwY, palette.charcoal, 0.5));
      }

    } else if (strategy === 1) {
      // === EDGE-ANCHORED MASSES (TP 4 style) ===
      const anchorLeft = rng() > 0.5;
      const domW = range(rng, C * 0.42, C * 0.58);
      const domH = range(rng, C * 0.55, C * 0.75);
      const domX = anchorLeft ? -domW * range(rng, 0.08, 0.18) : C - domW * range(rng, 0.82, 0.92);
      const domY = range(rng, -domH * 0.05, C * 0.1);
      svg.appendChild(withDeepShadow(art.rect(domX, domY, domW, domH, weightedPick(rng, colors), 0.88), uid));
      grid.insert({ x: domX, y: domY, w: domW, h: domH });

      const secW = range(rng, C * 0.28, C * 0.38);
      const secH = range(rng, C * 0.32, C * 0.48);
      const secX = anchorLeft ? domX + domW - secW * range(rng, 0.15, 0.3) : domX - secW * range(rng, 0.55, 0.75);
      const secY = domY + domH * range(rng, 0.25, 0.45);
      svg.appendChild(withShadow(art.rect(secX, secY, secW, secH, spatialColor(rng, colors, secX, secY, C), 0.72), uid));

      // Organic counterpoint
      const arcR = range(rng, C * 0.14, C * 0.2);
      if (rng() > 0.5) {
        const arcX = anchorLeft ? C : 0;
        const arcY = range(rng, C * 0.35, C * 0.65);
        svg.appendChild(withShadow(
          art.semicircle(arcX, arcY, arcR, anchorLeft ? 90 : 270, colors[2] || '#D4A84B', 0.75),
          uid
        ));
      } else {
        const corner = anchorLeft ? pick(rng, ['tr', 'br']) : pick(rng, ['tl', 'bl']);
        const arcX = corner.includes('l') ? 0 : C;
        const arcY = corner.includes('t') ? 0 : C;
        svg.appendChild(Shapes.quarterCircle(arcX, arcY, arcR * 1.6, corner, colors[2] || '#D4A84B', 0.65));
      }

      // THE GOLD SIGNAL
      const fcR = range(rng, C * 0.06, C * 0.1);
      const fcX = anchorLeft ? gp.br.x : gp.bl.x;
      const fcY = gp.br.y + range(rng, -30, 30);
      svg.appendChild(Shapes.circle(fcX, fcY, fcR * 1.6, `url(#${uid}-glow)`, 0.4));
      svg.appendChild(withDeepShadow(art.circle(fcX, fcY, fcR, '#D4A84B', 0.9), uid));

      if (hasTexture) {
        const stW = range(rng, 35, 55);
        const stH = range(rng, 120, 200);
        const stX = anchorLeft ? domX + domW + range(rng, 25, 50) : domX - stW - range(rng, 25, 50);
        const stY = range(rng, C * 0.15, C * 0.4);
        svg.appendChild(Shapes.stripeBlock(stX, stY, stW, stH, rng() > 0.5 ? 'vertical' : 'horizontal', palette.charcoal, 8, 1.5));
      }

      const smSize = range(rng, C * 0.04, C * 0.07);
      const smX = anchorLeft ? range(rng, C * 0.72, C * 0.88) : range(rng, C * 0.08, C * 0.22);
      const smY = range(rng, C * 0.72, C * 0.88);
      svg.appendChild(art.rect(smX, smY, smSize, smSize * range(rng, 1.2, 2), palette.charcoal, 0.65));

    } else if (strategy === 2) {
      // === DIAGONAL TENSION (Moholy-Nagy photogram style) ===
      const bigR = range(rng, C * 0.2, C * 0.26);
      const bigX = gp.tl.x + range(rng, 30, 80);
      const bigY = gp.tl.y + range(rng, 40, 100);
      svg.appendChild(withDeepShadow(art.circle(bigX, bigY, bigR, weightedPick(rng, colors), 0.72), uid));
      grid.insert({ cx: bigX, cy: bigY, r: bigR });

      svg.appendChild(Shapes.circleOutline(bigX, bigY, bigR * range(rng, 1.25, 1.5), palette.charcoal, 1.5, 0.25));

      const secR = range(rng, C * 0.1, C * 0.16);
      const secX = bigX + bigR * range(rng, 0.4, 0.7);
      const secY = bigY + bigR * range(rng, -0.3, 0.3);
      svg.appendChild(withShadow(art.circle(secX, secY, secR, spatialColor(rng, colors, secX, secY, C), 0.55), uid));

      const barAngle = range(rng, 30, 55) * (rng() > 0.5 ? 1 : -1);
      const barLen = range(rng, C * 0.55, C * 0.75);
      const barThick = range(rng, C * 0.04, C * 0.07);
      svg.appendChild(withShadow(
        art.bar(gp.center.x, gp.bottomThird, barLen, barThick, barAngle, palette.charcoal, 0.78),
        uid
      ));

      const fW = range(rng, C * 0.14, C * 0.22);
      const fH = range(rng, C * 0.18, C * 0.28);
      const fX = gp.br.x + range(rng, -20, 40);
      const fY = gp.br.y + range(rng, -40, 10);
      svg.appendChild(withShadow(art.rect(fX - fW / 2, fY - fH / 2, fW, fH, colors[2] || '#D4A84B', 0.6), uid));

      const fcR = range(rng, C * 0.05, C * 0.08);
      const fcX = bigX + bigR * 0.45;
      const fcY = bigY - bigR * 0.25;
      svg.appendChild(Shapes.circle(fcX, fcY, fcR * 1.6, `url(#${uid}-glow)`, 0.45));
      svg.appendChild(withDeepShadow(art.circle(fcX, fcY, fcR, '#D4A84B', 0.9), uid));

      if (hasConnectors) {
        svg.appendChild(Shapes.thinLine(bigX, bigY + bigR, fX, fY, palette.charcoal, 0.7));
      }

    } else if (strategy === 3) {
      // === NEW: FLOATING ARCHIPELAGO — scattered islands with spatial awareness ===
      const islandCount = rangeInt(rng, 4, 7);
      const shapes = [];

      for (let i = 0; i < islandCount; i++) {
        // Find position with low collision density
        let bestX, bestY, bestDens = Infinity;
        for (let attempt = 0; attempt < 8; attempt++) {
          const tx = range(rng, C * 0.05, C * 0.85);
          const ty = range(rng, C * 0.05, C * 0.85);
          const d = grid.density(tx, ty, 80);
          if (d < bestDens) { bestX = tx; bestY = ty; bestDens = d; }
        }

        const size = range(rng, C * 0.08, C * 0.22) * (1 - i * 0.08);
        const color = spatialColor(rng, colors, bestX, bestY, C);
        const shapeType = pick(rng, ['rect', 'circle', 'triangle']);

        if (shapeType === 'rect') {
          const w = size * range(rng, 0.8, 1.5);
          const h = size * range(rng, 0.8, 1.5);
          svg.appendChild(withShadow(art.rect(bestX, bestY, w, h, color, range(rng, 0.6, 0.9)), uid));
          grid.insert({ x: bestX, y: bestY, w, h });
        } else if (shapeType === 'circle') {
          const r = size / 2;
          svg.appendChild(withShadow(art.circle(bestX + r, bestY + r, r, color, range(rng, 0.6, 0.9)), uid));
          grid.insert({ cx: bestX + r, cy: bestY + r, r });
        } else {
          svg.appendChild(art.triangle(bestX + size / 2, bestY + size / 2, size, range(rng, 0, 360), color, range(rng, 0.6, 0.9)));
          grid.insert({ x: bestX, y: bestY, w: size, h: size });
        }
      }

      // Gold signal at composition centroid
      const fcR = range(rng, C * 0.06, C * 0.1);
      svg.appendChild(Shapes.circle(gp.center.x, gp.center.y, fcR * 1.8, `url(#${uid}-glow)`, 0.5));
      svg.appendChild(withDeepShadow(art.circle(gp.center.x, gp.center.y, fcR, '#D4A84B', 0.9), uid));

    } else {
      // === NEW: LAYERED DEPTH — Atmospheric perspective with size/opacity gradient ===
      const layerCount = rangeInt(rng, 3, 5);

      for (let layer = 0; layer < layerCount; layer++) {
        const t = layer / (layerCount - 1);
        const layerOp = lerp(0.3, 0.9, t);
        const layerScale = lerp(0.6, 1.0, t);
        const color = colors[layer % colors.length];

        const w = range(rng, C * 0.2, C * 0.45) * layerScale;
        const h = range(rng, C * 0.25, C * 0.5) * layerScale;
        const x = range(rng, -w * 0.1, C * 0.5);
        const y = range(rng, C * t * 0.3, C * (0.2 + t * 0.5));

        if (rng() > 0.4) {
          svg.appendChild(withShadow(art.rect(x, y, w, h, color, layerOp), uid));
        } else {
          svg.appendChild(withShadow(art.circle(x + w / 2, y + h / 2, Math.min(w, h) / 2, color, layerOp), uid));
        }
      }

      // Foreground gold signal
      const fcR = range(rng, C * 0.07, C * 0.12);
      const fcX = gp.br.x + range(rng, -30, 30);
      const fcY = gp.br.y + range(rng, -30, 30);
      svg.appendChild(Shapes.circle(fcX, fcY, fcR * 1.8, `url(#${uid}-glow)`, 0.5));
      svg.appendChild(withDeepShadow(art.circle(fcX, fcY, fcR, '#D4A84B', 0.9), uid));

      // Charcoal accent bar
      const barLen = range(rng, C * 0.3, C * 0.5);
      const barThick = range(rng, C * 0.02, C * 0.04);
      svg.appendChild(art.bar(range(rng, C * 0.2, C * 0.6), range(rng, C * 0.1, C * 0.3),
        barLen, barThick, range(rng, -15, 15), palette.charcoal, 0.7));
    }

    // ── UNIVERSAL MICRO-ACCENTS (noise-driven) ──
    if (hasMicroAccents) {
      const accentCount = rangeInt(rng, 2, 5);
      for (let i = 0; i < accentCount; i++) {
        const ax = range(rng, C * 0.05, C * 0.95);
        const ay = range(rng, C * 0.05, C * 0.95);
        // Only place if area is sparse
        if (grid.density(ax, ay, 50) < 2) {
          const ar = range(rng, 2, 5);
          const aColor = noise(ax * 0.01, ay * 0.01) > 0 ? palette.charcoal : '#D4A84B';
          svg.appendChild(Shapes.dot(ax, ay, ar, aColor, range(rng, 0.3, 0.6)));
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  COMPOSER: GRID
  //  Reference: Mondrian "Composition with Red Blue Yellow" (1930)
  //             Kandinsky "Thirteen Rectangles" (1930)
  //
  //  Key characteristics:
  //  - Asymmetric grid with varied cell sizes (NOT uniform!)
  //  - Thick black divider lines (Mondrian's signature)
  //  - Most cells white/cream, a few bold primary colors
  //  - Strong emphasis on proportion and balance
  //  - Cells can be tall/narrow or wide/short
  //  - Clear hierarchy: 1-3 color cells, rest neutral
  // ══════════════════════════════════════════════════════════════
  function composeGrid(svg, palette, rng, density, uid) {
    const C = CANVAS;
    const colors = palette.colors;
    const bg = palette.bg;
    const lineColor = palette.charcoal;
    const lineW = density > 0.7 ? 5 : density > 0.4 ? 4 : 3;
    const noise = createNoise2D(rng);
    const art = createArtShapes(noise, rng, uid);

    svg.appendChild(Shapes.rect(0, 0, C, C, bg));

    const strategy = rangeInt(rng, 0, 2);

    if (strategy === 0) {
      // === MONDRIAN STYLE — Asymmetric rectangles with thick black lines ===

      // Generate 3-5 vertical divisions (non-uniform)
      const vCount = rangeInt(rng, 3, 5);
      const vLines = [0];
      for (let i = 0; i < vCount; i++) {
        const prev = vLines[vLines.length - 1];
        const remaining = C - prev;
        const minGap = C * 0.1;
        const maxGap = remaining - minGap * (vCount - i);
        vLines.push(prev + range(rng, minGap, Math.max(minGap + 1, maxGap)));
      }
      vLines.push(C);

      // Generate 3-4 horizontal divisions (non-uniform)
      const hCount = rangeInt(rng, 2, 4);
      const hLines = [0];
      for (let i = 0; i < hCount; i++) {
        const prev = hLines[hLines.length - 1];
        const remaining = C - prev;
        const minGap = C * 0.1;
        const maxGap = remaining - minGap * (hCount - i);
        hLines.push(prev + range(rng, minGap, Math.max(minGap + 1, maxGap)));
      }
      hLines.push(C);

      // Create cells and decide which get color
      const cells = [];
      for (let r = 0; r < hLines.length - 1; r++) {
        for (let c = 0; c < vLines.length - 1; c++) {
          cells.push({
            x: vLines[c], y: hLines[r],
            w: vLines[c + 1] - vLines[c],
            h: hLines[r + 1] - hLines[r],
            area: (vLines[c + 1] - vLines[c]) * (hLines[r + 1] - hLines[r])
          });
        }
      }

      // Sort by area descending — larger cells more likely to get color
      const sorted = [...cells].sort((a, b) => b.area - a.area);
      const colorCount = rangeInt(rng, 2, Math.min(4, Math.floor(2 + density * 3)));
      const coloredCells = new Set();

      // Assign colors — prefer larger cells, ensure variety
      const assignedColors = shuffled(rng, colors).slice(0, colorCount);
      for (let i = 0; i < colorCount && i < sorted.length; i++) {
        const cellIdx = cells.indexOf(sorted[i]);
        coloredCells.add(cellIdx);
        cells[cellIdx].fill = assignedColors[i];
      }

      // One cell should be gold (the signature accent)
      if (sorted.length > colorCount) {
        const goldIdx = cells.indexOf(sorted[rangeInt(rng, 1, Math.min(4, sorted.length - 1))]);
        if (!coloredCells.has(goldIdx)) {
          coloredCells.add(goldIdx);
          cells[goldIdx].fill = '#D4A84B';
        }
      }

      // Draw filled cells with hatched fills and shadow for depth
      cells.forEach(cell => {
        if (cell.fill) {
          svg.appendChild(withShadow(art.rect(cell.x, cell.y, cell.w, cell.h, cell.fill, 0.85), uid));
        }
      });

      // Draw thick black grid lines on top
      for (let i = 1; i < vLines.length - 1; i++) {
        svg.appendChild(Shapes.thickLine(vLines[i], 0, vLines[i], C, lineColor, lineW));
      }
      for (let i = 1; i < hLines.length - 1; i++) {
        svg.appendChild(Shapes.thickLine(0, hLines[i], C, hLines[i], lineColor, lineW));
      }

      // Outer border
      svg.appendChild(Shapes.rectOutline(0, 0, C, C, lineColor, lineW));

    } else if (strategy === 1) {
      // === KANDINSKY "THIRTEEN RECTANGLES" STYLE ===
      // Floating colored rectangles at various angles on neutral ground

      const rectCount = rangeInt(rng, 7, 13);
      const rects = [];

      // Generate rectangles with weighted color and intentional placement
      for (let i = 0; i < rectCount; i++) {
        const w = range(rng, C * 0.08, C * 0.25);
        const h = range(rng, C * 0.06, C * 0.2);
        const x = range(rng, C * 0.05, C * 0.85);
        const y = range(rng, C * 0.05, C * 0.85);
        const angle = range(rng, -35, 35);
        const color = spatialColor(rng, colors, x, y, C);
        const opacity = range(rng, 0.65, 1.0);

        rects.push({ x, y, w, h, angle, color, opacity });
      }

      // Sort by size (larger behind)
      rects.sort((a, b) => (b.w * b.h) - (a.w * a.h));

      rects.forEach(r => {
        svg.appendChild(withShadow(art.rect(r.x, r.y, r.w, r.h, r.color, r.opacity, r.angle), uid));
      });

      // Add a few circles for contrast — hatched fills
      const circleCount = rangeInt(rng, 1, 3);
      for (let i = 0; i < circleCount; i++) {
        const cr = range(rng, C * 0.03, C * 0.08);
        const cx = range(rng, C * 0.1, C * 0.9);
        const cy = range(rng, C * 0.1, C * 0.9);
        if (i === 0) {
          svg.appendChild(Shapes.circle(cx, cy, cr * 1.8, `url(#${uid}-glow)`, 0.4));
          svg.appendChild(withDeepShadow(art.circle(cx, cy, cr, '#D4A84B', 0.9), uid));
        } else {
          svg.appendChild(withShadow(art.circle(cx, cy, cr, weightedPick(rng, colors), range(rng, 0.6, 0.9)), uid));
        }
      }

    } else {
      // === MIXED GEOMETRY GRID — Systematic but varied cell content ===

      const n = density > 0.7 ? 5 : density > 0.4 ? 4 : 3;
      const margin = 20;
      const gutter = 6;
      const cellSize = (C - margin * 2 - gutter * (n - 1)) / n;

      // Draw cells with shapes
      const shapeTypes = ['circle', 'semicircle', 'triangle', 'rect', 'quarter', 'empty'];
      let prevShape = '';

      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const x = margin + c * (cellSize + gutter);
          const y = margin + r * (cellSize + gutter);
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;

          // Cell background — subtle border
          svg.appendChild(Shapes.rectOutline(x, y, cellSize, cellSize, palette.charcoal, 1, 0.15));

          // Pick shape — avoid repeating adjacent
          let avail = shapeTypes.filter(s => s !== prevShape);
          const shape = pick(rng, avail);
          prevShape = shape;

          const color = spatialColor(rng, colors, cx, cy, C);
          const innerR = cellSize * 0.38;
          const innerS = cellSize * 0.7;
          const isFilled = rng() > 0.3;

          switch (shape) {
            case 'circle':
              if (isFilled) {
                svg.appendChild(art.circle(cx, cy, innerR, color, 0.85));
              } else {
                svg.appendChild(Shapes.circleOutline(cx, cy, innerR, color, 2));
              }
              break;
            case 'semicircle':
              svg.appendChild(art.semicircle(cx, cy, innerR, pick(rng, [0, 90, 180, 270]), color, 0.85));
              break;
            case 'triangle':
              svg.appendChild(art.triangle(cx, cy, innerS, pick(rng, [0, 60, 120, 180, 240, 300]), color, 0.85));
              break;
            case 'rect':
              if (rng() < 0.3) {
                svg.appendChild(art.rect(x + (cellSize - innerS) / 2, y + (cellSize - innerS) / 2, innerS / 2, innerS, color, 0.85));
                svg.appendChild(art.rect(x + (cellSize - innerS) / 2 + innerS / 2, y + (cellSize - innerS) / 2, innerS / 2, innerS, weightedPick(rng, colors), 0.7));
              } else {
                svg.appendChild(art.rect(x + (cellSize - innerS) / 2, y + (cellSize - innerS) / 2, innerS, innerS, color, 0.85));
              }
              break;
            case 'quarter':
              svg.appendChild(Shapes.quarterCircle(
                pick(rng, [x, x + cellSize]),
                pick(rng, [y, y + cellSize]),
                cellSize * 0.8,
                pick(rng, ['tl', 'tr', 'bl', 'br']),
                color, 0.8
              ));
              break;
            case 'empty':
              break;
          }
        }
      }

      // Gold accent — one prominent circle overlaid with glow + hatching
      const goldR = cellSize * 0.4;
      const goldX = margin + rangeInt(rng, 0, n - 1) * (cellSize + gutter) + cellSize / 2;
      const goldY = margin + rangeInt(rng, 0, n - 1) * (cellSize + gutter) + cellSize / 2;
      svg.appendChild(Shapes.circle(goldX, goldY, goldR * 1.6, `url(#${uid}-glow)`, 0.35));
      svg.appendChild(withDeepShadow(art.circle(goldX, goldY, goldR, '#D4A84B', 0.85), uid));
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  COMPOSER: REPETITION
  //  Reference: Paul Klee "Rhythmisches" (1930)
  //             Bridget Riley "Movement in Squares" (1961)
  //             Anni Albers textile patterns
  //
  //  Key characteristics:
  //  - Strong rhythmic structure — like musical notation
  //  - Gradual progressions in size, color, or spacing
  //  - Visible system/pattern with subtle variations
  //  - Color used structurally, not decoratively
  //  - Grid-based rhythm with organic modulation
  //  - Optical vibration through repetition
  // ══════════════════════════════════════════════════════════════
  function composeRepetition(svg, palette, rng, density, uid) {
    const C = CANVAS;
    const colors = palette.colors;
    const bg = palette.bg;
    const noise = createNoise2D(rng);
    const art = createArtShapes(noise, rng, uid);

    svg.appendChild(Shapes.rect(0, 0, C, C, bg));

    const strategy = rangeInt(rng, 0, 3);

    if (strategy === 0) {
      // === KLEE "RHYTHMISCHES" STYLE ===
      // Horizontal bands of rectangles with color rhythm

      const rows = rangeInt(rng, 4, 8);
      const cols = rangeInt(rng, 6, 12);
      const margin = 30;
      const gutter = 3;
      const cellW = (C - margin * 2 - gutter * (cols - 1)) / cols;
      const cellH = (C - margin * 2 - gutter * (rows - 1)) / rows;

      // Create a rhythm pattern — which cells are filled vs bg
      for (let r = 0; r < rows; r++) {
        // Each row has its own rhythm offset
        const rowOffset = rng() * Math.PI * 2;
        const rowFreq = range(rng, 0.3, 0.8);

        for (let c = 0; c < cols; c++) {
          const x = margin + c * (cellW + gutter);
          const y = margin + r * (cellH + gutter);

          // Rhythmic probability — creates wave-like fill patterns
          const rhythm = Math.sin(c * rowFreq + rowOffset);
          const fillChance = 0.3 + rhythm * 0.35 + density * 0.2;

          if (rng() < fillChance) {
            // Pick color based on position — spatial color gradient
            const color = spatialColor(rng, colors, x, y, C);
            const opacity = range(rng, 0.6, 1.0);
            svg.appendChild(art.rect(x, y, cellW, cellH, color, opacity));
          }
        }
      }

      // Signature gold bar — horizontal emphasis with hatched glow
      const goldRow = rangeInt(rng, 1, rows - 2);
      const goldStartCol = rangeInt(rng, 0, Math.floor(cols / 3));
      const goldEndCol = rangeInt(rng, Math.floor(cols * 2 / 3), cols - 1);
      for (let c = goldStartCol; c <= goldEndCol; c++) {
        const x = margin + c * (cellW + gutter);
        const y = margin + goldRow * (cellH + gutter);
        svg.appendChild(withShadow(art.rect(x, y, cellW, cellH, '#D4A84B', 0.85), uid));
      }

    } else if (strategy === 1) {
      // === RILEY "MOVEMENT IN SQUARES" STYLE ===
      // Size progression creating optical movement

      const count = rangeInt(rng, 8, 16);
      const isVertical = rng() > 0.5;
      const margin = 40;
      const totalLen = C - margin * 2;

      // Shape spacing — denser in the middle for optical effect
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);

        // Size modulation — creates "pinch" effect
        const sizeModulation = 1 - 0.6 * Math.pow(Math.sin(t * Math.PI), 2) * density;
        const baseSize = totalLen / count * 0.85;
        const size = baseSize * sizeModulation;

        // Position
        const pos = margin + t * totalLen;
        const x = isVertical ? C / 2 - size / 2 : pos - size / 2;
        const y = isVertical ? pos - size / 2 : C / 2 - size / 2;

        // Alternating colors for optical vibration — hatched fills
        const colorIdx = i % 2 === 0 ? 0 : Math.min(colors.length - 1, 1);
        svg.appendChild(withShadow(art.rect(x, y, size, size, colors[colorIdx], range(rng, 0.75, 1.0)), uid));
      }

      // Accent — a single gold circle with hatched fill
      const accentX = isVertical ? range(rng, C * 0.15, C * 0.35) : C / 2;
      const accentY = isVertical ? C / 2 : range(rng, C * 0.15, C * 0.35);
      const acR = range(rng, C * 0.04, C * 0.08);
      svg.appendChild(Shapes.circle(accentX, accentY, acR * 1.6, `url(#${uid}-glow)`, 0.4));
      svg.appendChild(withDeepShadow(art.circle(accentX, accentY, acR, '#D4A84B', 0.9), uid));

    } else if (strategy === 2) {
      // === WAVE PROCESSION ===
      // Elements riding a sine wave with crescendo

      const count = rangeInt(rng, 8, 18);
      const amplitude = range(rng, C * 0.12, C * 0.25);
      const frequency = range(rng, 1.5, 3.5);
      const baseSize = range(rng, 8, 20);
      const crescendo = range(rng, 0.5, 2.0);
      const shapeType = pick(rng, ['circle', 'rect', 'triangle', 'semicircle']);

      // Anchor — large shape providing compositional weight
      const anchorSide = rng() > 0.5;
      const anchorW = range(rng, C * 0.12, C * 0.22);
      const anchorH = range(rng, C * 0.3, C * 0.55);
      const anchorX = anchorSide ? C - anchorW - 10 : 10;
      const anchorY = rng() > 0.5 ? C - anchorH : 0;
      svg.appendChild(withDeepShadow(art.rect(anchorX, anchorY, anchorW, anchorH, palette.charcoal, 0.75), uid));

      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const size = baseSize + baseSize * crescendo * t;
        const x = 40 + t * (C - 80);
        const y = C / 2 + Math.sin(t * Math.PI * frequency) * amplitude;
        const color = spatialColor(rng, colors, x, y, C);
        const opacity = range(rng, 0.6, 1.0);

        switch (shapeType) {
          case 'circle':
            svg.appendChild(art.circle(x, y, size, color, opacity));
            break;
          case 'rect':
            svg.appendChild(art.rect(x - size, y - size, size * 2, size * 2, color, opacity));
            break;
          case 'triangle':
            svg.appendChild(art.triangle(x, y, size * 2, range(rng, -15, 15), color, opacity));
            break;
          case 'semicircle':
            svg.appendChild(art.semicircle(x, y, size, pick(rng, [0, 90, 180, 270]), color, opacity));
            break;
        }
      }

      // Gold accent at the wave's peak with glow
      const peakT = 0.25 / frequency;
      const peakX = 40 + peakT * (C - 80);
      const peakY = C / 2 - amplitude;
      const peakR = range(rng, C * 0.03, C * 0.06);
      svg.appendChild(Shapes.circle(peakX, peakY, peakR * 1.6, `url(#${uid}-glow)`, 0.4));
      svg.appendChild(withDeepShadow(art.circle(peakX, peakY, peakR, '#D4A84B', 0.9), uid));

    } else {
      // === RADIAL RHYTHM ===
      // Concentric or spiral arrangement

      const rings = rangeInt(rng, 3, 6);
      const elementsPerRing = rangeInt(rng, 4, 10);
      const maxR = C * 0.4;
      const shapeType = pick(rng, ['circle', 'rect', 'triangle']);

      for (let ring = 0; ring < rings; ring++) {
        const ringR = maxR * (ring + 1) / rings;
        const ringSize = range(rng, 6, 15) * (1 + ring * 0.3);
        const ringColor = colors[ring % colors.length];
        const elements = elementsPerRing + ring * 2;
        const startAngle = ring * range(rng, 10, 30); // Offset each ring

        for (let i = 0; i < elements; i++) {
          const angle = startAngle + (i / elements) * Math.PI * 2;
          const x = C / 2 + Math.cos(angle) * ringR;
          const y = C / 2 + Math.sin(angle) * ringR;
          const opacity = range(rng, 0.5, 0.9);

          switch (shapeType) {
            case 'circle':
              svg.appendChild(art.circle(x, y, ringSize, ringColor, opacity));
              break;
            case 'rect':
              svg.appendChild(art.rect(x - ringSize, y - ringSize, ringSize * 2, ringSize * 2, ringColor, opacity, angle * 180 / Math.PI));
              break;
            case 'triangle':
              svg.appendChild(art.triangle(x, y, ringSize * 2, angle * 180 / Math.PI, ringColor, opacity));
              break;
          }
        }
      }

      // Center focal — gold with glow and hatching
      const centerR = range(rng, C * 0.04, C * 0.08);
      svg.appendChild(Shapes.circle(C / 2, C / 2, centerR * 1.8, `url(#${uid}-glow)`, 0.45));
      svg.appendChild(withDeepShadow(art.circle(C / 2, C / 2, centerR, '#D4A84B', 0.9), uid));

      // Ring outlines for structure
      if (density > 0.4) {
        for (let ring = 0; ring < rings; ring++) {
          const ringR = maxR * (ring + 1) / rings;
          svg.appendChild(Shapes.circleOutline(C / 2, C / 2, ringR, palette.charcoal, 0.5, 0.12));
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  COMPOSER: CONSTRUCTIVIST
  //  Reference: El Lissitzky "Beat the Whites with the Red Wedge" (1920)
  //             Rodchenko geometric compositions
  //             Malevich "Suprematist Composition" (1916)
  //
  //  Key characteristics:
  //  - DRAMATIC diagonal energy — everything points, drives, thrusts
  //  - Red wedge/triangle is THE signature element
  //  - Severe restriction to red, black, white only
  //  - Geometric forms feel like they're in motion
  //  - Strong negative space — white as active element
  //  - Political poster energy — bold, graphic, urgent
  //  - Thin lines create force vectors, not decoration
  // ══════════════════════════════════════════════════════════════
  function composeConstructivist(svg, palette, rng, density, uid) {
    const C = CANVAS;
    const red = palette.colors[0];
    const black = palette.colors[1] || palette.charcoal;
    const bg = palette.bg;
    const noise = createNoise2D(rng);
    const art = createArtShapes(noise, rng, uid);

    svg.appendChild(Shapes.rect(0, 0, C, C, bg));

    const strategy = rangeInt(rng, 0, 2);

    if (strategy === 0) {
      // === LISSITZKY "RED WEDGE" STYLE ===
      const wedgeCX = range(rng, C * 0.3, C * 0.5);
      const wedgeCY = range(rng, C * 0.3, C * 0.55);
      const wedgeW = range(rng, C * 0.22, C * 0.35);
      const wedgeH = range(rng, C * 0.32, C * 0.5);
      const wedgeAngle = range(rng, -60, -20);
      svg.appendChild(withDeepShadow(art.wedge(wedgeCX, wedgeCY, wedgeW, wedgeH, wedgeAngle, red, 0.95), uid));

      const circR = range(rng, C * 0.15, C * 0.25);
      const circX = wedgeCX + Math.cos(wedgeAngle * Math.PI / 180) * C * range(rng, 0.15, 0.3);
      const circY = wedgeCY + Math.sin(wedgeAngle * Math.PI / 180) * C * range(rng, 0.15, 0.3);
      svg.appendChild(withShadow(art.circle(circX, circY, circR, black, 0.8), uid));

      // Force lines — emanating from the wedge
      const lineCount = rangeInt(rng, 3, 6);
      for (let i = 0; i < lineCount; i++) {
        const lAngle = wedgeAngle + range(rng, -25, 25);
        const lRad = lAngle * Math.PI / 180;
        const lx = wedgeCX + range(rng, -30, 30);
        const ly = wedgeCY + range(rng, -30, 30);
        const lLen = range(rng, C * 0.3, C * 0.8);
        const lw = range(rng, 0.5, 2);
        svg.appendChild(Shapes.thinLine(
          lx, ly,
          lx + Math.cos(lRad) * lLen,
          ly + Math.sin(lRad) * lLen,
          black, lw
        ));
      }

      // Small geometric fragments — shattered by the force, hatched
      const fragCount = rangeInt(rng, 2, 5);
      for (let i = 0; i < fragCount; i++) {
        const fSize = range(rng, C * 0.03, C * 0.08);
        const fAngle = wedgeAngle + range(rng, -40, 40);
        const dist = range(rng, C * 0.2, C * 0.4);
        const fx = wedgeCX + Math.cos(fAngle * Math.PI / 180) * dist;
        const fy = wedgeCY + Math.sin(fAngle * Math.PI / 180) * dist;
        const fColor = rng() > 0.6 ? red : black;

        if (rng() > 0.5) {
          svg.appendChild(art.rect(fx - fSize / 2, fy - fSize / 2, fSize, fSize * range(rng, 1, 2.5), fColor, range(rng, 0.5, 0.9), range(rng, -45, 45)));
        } else {
          svg.appendChild(art.triangle(fx, fy, fSize * 1.5, range(rng, 0, 360), fColor, range(rng, 0.5, 0.9)));
        }
      }

      if (density > 0.4) {
        const acSize = range(rng, C * 0.03, C * 0.06);
        const acX = rng() > 0.5 ? range(rng, C * 0.05, C * 0.2) : range(rng, C * 0.75, C * 0.95);
        const acY = range(rng, C * 0.05, C * 0.3);
        svg.appendChild(art.rect(acX, acY, acSize, acSize * 2, red, 0.7));
      }

    } else if (strategy === 1) {
      // === MALEVICH SUPREMATIST STYLE ===
      // Floating geometric forms in dynamic arrangement

      // Large tilted rectangle — primary mass with hatched fill
      const mainW = range(rng, C * 0.25, C * 0.4);
      const mainH = range(rng, C * 0.08, C * 0.15);
      const mainAngle = range(rng, 20, 55) * (rng() > 0.5 ? 1 : -1);
      const mainX = range(rng, C * 0.25, C * 0.55);
      const mainY = range(rng, C * 0.3, C * 0.5);
      svg.appendChild(withDeepShadow(art.rect(mainX - mainW / 2, mainY - mainH / 2, mainW, mainH, black, 0.9, mainAngle), uid));

      // Cross/plus element
      const crossSize = range(rng, C * 0.08, C * 0.15);
      const crossX = mainX + range(rng, -C * 0.15, C * 0.15);
      const crossY = mainY + range(rng, -C * 0.2, -C * 0.1);
      svg.appendChild(Shapes.cross(crossX, crossY, crossSize, red, 4));

      // Red bar — hatched dynamic diagonal
      const barW = range(rng, C * 0.35, C * 0.55);
      const barH = range(rng, C * 0.04, C * 0.08);
      const barAngle = mainAngle + range(rng, 30, 60);
      const barX = range(rng, C * 0.35, C * 0.6);
      const barY = range(rng, C * 0.45, C * 0.7);
      svg.appendChild(withDeepShadow(art.bar(barX, barY, barW, barH, barAngle, red, 0.85), uid));

      // Small triangle — hatched
      const triSize = range(rng, C * 0.06, C * 0.12);
      const triX = range(rng, C * 0.6, C * 0.85);
      const triY = range(rng, C * 0.15, C * 0.4);
      svg.appendChild(art.triangle(triX, triY, triSize, range(rng, 0, 360), black, 0.7));

      // Small circle — hatched
      const smR = range(rng, C * 0.02, C * 0.05);
      svg.appendChild(art.circle(
        range(rng, C * 0.1, C * 0.3),
        range(rng, C * 0.6, C * 0.85),
        smR, red, 0.8
      ));

      // Thin construction lines
      if (density > 0.3) {
        for (let i = 0; i < 2; i++) {
          const la = range(rng, 10, 80) * (rng() > 0.5 ? 1 : -1);
          svg.appendChild(Shapes.diagonalLine(la, range(rng, C * 0.2, C * 0.8), range(rng, C * 0.2, C * 0.8), black, 0.5));
        }
      }

    } else {
      // === CONSTRUCTIVIST POSTER STYLE ===
      // Bold geometric composition with dramatic angles

      // Background division — diagonal split
      const splitAngle = range(rng, 25, 65);
      const splitRad = splitAngle * Math.PI / 180;
      const splitPoints = [];

      // Create a diagonal division of the canvas
      if (rng() > 0.5) {
        const bigR = range(rng, C * 0.2, C * 0.35);
        const bigX = range(rng, C * 0.3, C * 0.6);
        const bigY = range(rng, C * 0.35, C * 0.65);
        svg.appendChild(withShadow(art.circle(bigX, bigY, bigR, black, 0.15), uid));
        svg.appendChild(Shapes.circleOutline(bigX, bigY, bigR, black, 2, 0.5));

        const wedgeW = range(rng, C * 0.15, C * 0.25);
        const wedgeH = range(rng, C * 0.25, C * 0.45);
        svg.appendChild(withDeepShadow(art.wedge(bigX, bigY, wedgeW, wedgeH, range(rng, -70, -20), red, 0.9), uid));
      } else {
        const rectW = range(rng, C * 0.3, C * 0.5);
        const rectH = range(rng, C * 0.25, C * 0.4);
        const rectX = range(rng, C * 0.25, C * 0.5) - rectW / 2;
        const rectY = range(rng, C * 0.35, C * 0.55) - rectH / 2;
        svg.appendChild(withShadow(art.rect(rectX, rectY, rectW, rectH, black, 0.2), uid));
        svg.appendChild(Shapes.rectOutline(rectX, rectY, rectW, rectH, black, 2, 0.6));

        const wedgeW = range(rng, C * 0.18, C * 0.3);
        const wedgeH = range(rng, C * 0.25, C * 0.4);
        svg.appendChild(withDeepShadow(art.wedge(rectX + rectW * 0.4, rectY + rectH * 0.3, wedgeW, wedgeH, range(rng, -80, -30), red, 0.9), uid));
      }

      // Force lines
      const lineCount = rangeInt(rng, 3, 7);
      for (let i = 0; i < lineCount; i++) {
        const la = range(rng, 10, 80) * (rng() > 0.5 ? 1 : -1);
        const lx = range(rng, C * 0.1, C * 0.9);
        const ly = range(rng, C * 0.1, C * 0.9);
        svg.appendChild(Shapes.diagonalLine(la, lx, ly, black, range(rng, 0.3, 1.5)));
      }

      // Small accent shapes — hatched
      const accents = rangeInt(rng, 1, 3);
      for (let i = 0; i < accents; i++) {
        const aSize = range(rng, C * 0.03, C * 0.07);
        const ax = range(rng, C * 0.05, C * 0.95);
        const ay = range(rng, C * 0.05, C * 0.95);
        const aColor = rng() > 0.5 ? red : black;
        svg.appendChild(art.rect(ax, ay, aSize, aSize * range(rng, 0.5, 2), aColor, range(rng, 0.4, 0.8), range(rng, 0, 360)));
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  COMPOSER: COLOR_STUDY
  //  Reference: Josef Albers "Homage to the Square" series (1950-1976)
  //
  //  Key characteristics:
  //  - Nested squares (ALWAYS squares for Albers)
  //  - Bottom-weighted: inner squares sit lower, NOT centered
  //  - 3-4 nested squares is the classic formula
  //  - Color interaction is THE subject — simultaneous contrast
  //  - Each color selected for maximum interaction with neighbors
  //  - Perfectly flat, no texture, no lines, pure color
  //  - Proportional system based on the canvas unit
  //  - Meditative, contemplative quality
  // ══════════════════════════════════════════════════════════════
  function composeColorStudy(svg, palette, rng, density, uid) {
    const C = CANVAS;
    const allColors = [palette.bg, ...palette.colors];
    const bg = palette.bg;
    const noise = createNoise2D(rng);
    const art = createArtShapes(noise, rng, uid);

    svg.appendChild(Shapes.rect(0, 0, C, C, bg));

    const strategy = rangeInt(rng, 0, 2);

    if (strategy === 0 || strategy === 1) {
      // === ALBERS "HOMAGE TO THE SQUARE" — THE CLASSIC ===
      // Nested squares, bottom-weighted (Albers' signature offset)

      const useSquares = strategy === 0;
      const ringCount = rangeInt(rng, 3, 5);

      // Albers proportional system:
      // Outermost is the canvas itself (bg color)
      // Each inner square reduces by a fixed unit and drops downward

      const unit = C / (ringCount * 2 + 3); // Proportional unit

      // Select colors for maximum contrast between adjacent rings
      const ringColors = [];
      const available = shuffled(rng, allColors);
      for (let i = 0; i < ringCount; i++) {
        ringColors.push(available[i % available.length]);
      }

      // Draw rings from outside in
      for (let i = 0; i < ringCount; i++) {
        const inset = unit * (i + 1);
        const sideInset = inset * range(rng, 1.0, 1.3); // Slightly more side inset
        const topInset = inset * range(rng, 0.8, 1.1); // Less top inset
        const bottomInset = inset * range(rng, 1.3, 1.8); // MORE bottom inset (Albers signature)

        const x = sideInset;
        const y = topInset;
        const w = C - sideInset * 2;
        const h = C - topInset - bottomInset;

        if (w <= 0 || h <= 0) continue;

        if (useSquares) {
          // True Albers — hatched squares with bottom offset
          const size = Math.min(w, h);
          const sx = (C - size) / 2;
          const sy = topInset + (C - topInset - bottomInset - size) / 2;
          svg.appendChild(withShadow(art.rect(sx, sy, size, size, ringColors[i], 0.85), uid));
        } else {
          // Circles variant — hatched concentric with subtle offset
          const r = Math.min(w, h) / 2;
          const cx = C / 2 + (i > 0 ? range(rng, -unit * 0.3, unit * 0.3) : 0);
          const cy = C / 2 + unit * i * 0.15;
          svg.appendChild(withShadow(art.circle(cx, cy, r, ringColors[i], 0.85), uid));
        }
      }

      // Innermost "jewel" — hatched, the most vivid color
      const innerInset = unit * (ringCount + 1);
      const innerSize = C - innerInset * 2.5;
      if (innerSize > 20) {
        const innerColor = weightedPick(rng, palette.colors.filter(c => !ringColors.includes(c)).concat(['#D4A84B']));
        if (useSquares) {
          const ix = (C - innerSize) / 2;
          const iy = innerInset * 0.7 + (C - innerInset * 2.5 - innerSize) / 2;
          svg.appendChild(withDeepShadow(art.rect(ix, iy, innerSize, innerSize, innerColor, 0.9), uid));
        } else {
          svg.appendChild(withDeepShadow(art.circle(C / 2, C / 2 + unit * ringCount * 0.15, innerSize / 2, innerColor, 0.9), uid));
        }
      }

    } else {
      // === COLOR INTERACTION STUDY — Side by side ===
      // Two or three color fields meeting, exploring simultaneous contrast
      // Inspired by Albers' color theory exercises

      const divisions = rangeInt(rng, 2, 3);
      const isVertical = rng() > 0.5;
      const fieldColors = shuffled(rng, palette.colors).slice(0, divisions);
      const fieldWidth = C / divisions;

      // Draw color fields — hatched for painterly quality
      for (let i = 0; i < divisions; i++) {
        if (isVertical) {
          svg.appendChild(art.rect(i * fieldWidth, 0, fieldWidth, C, fieldColors[i], 0.85));
        } else {
          svg.appendChild(art.rect(0, i * fieldWidth, C, fieldWidth, fieldColors[i], 0.85));
        }
      }

      // Place identical small squares — Albers' simultaneous contrast
      const squareSize = range(rng, C * 0.1, C * 0.18);
      const squareColor = weightedPick(rng, ['#D4A84B', palette.charcoal, palette.bg]);

      for (let i = 0; i < divisions; i++) {
        if (isVertical) {
          const sx = i * fieldWidth + (fieldWidth - squareSize) / 2;
          const sy = (C - squareSize) / 2;
          svg.appendChild(art.rect(sx, sy, squareSize, squareSize, squareColor, 0.9));
        } else {
          const sx = (C - squareSize) / 2;
          const sy = i * fieldWidth + (fieldWidth - squareSize) / 2;
          svg.appendChild(art.rect(sx, sy, squareSize, squareSize, squareColor, 0.9));
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  COMPOSER: DOT_FIELD
  //  Reference: Herbert Bayer typographic experiments
  //             Victor Vasarely "Planetary Folklore" (1964)
  //             Ben Day dots / halftone effects
  //
  //  Key characteristics:
  //  - Precise mathematical dot grid
  //  - Dots modulate in size to create form/depth
  //  - Bold geometric overlays create figure-ground tension
  //  - Gradient effects through dot size variation
  //  - Clean, technological aesthetic
  //  - Optical mixing — dots create perceived tones
  // ══════════════════════════════════════════════════════════════
  function composeDotField(svg, palette, rng, density, uid) {
    const C = CANVAS;
    const colors = palette.colors;
    const bg = palette.bg;
    const noise = createNoise2D(rng);
    const art = createArtShapes(noise, rng, uid);

    svg.appendChild(Shapes.rect(0, 0, C, C, bg));

    const strategy = rangeInt(rng, 0, 2);

    if (strategy === 0) {
      // === VASARELY SPHERE EFFECT ===
      // Dots create a bulging/receding spherical form

      const gridN = rangeInt(rng, 10, Math.floor(10 + density * 8));
      const spacing = C / (gridN + 1);
      const minDotR = 1;
      const maxDotR = spacing * 0.42;
      const sphereCX = range(rng, C * 0.3, C * 0.7);
      const sphereCY = range(rng, C * 0.3, C * 0.7);
      const sphereR = range(rng, C * 0.2, C * 0.38);
      const bulge = rng() > 0.5; // Bulge out or recede in

      for (let r = 0; r < gridN; r++) {
        for (let c = 0; c < gridN; c++) {
          const dx = spacing + c * spacing;
          const dy = spacing + r * spacing;

          // Distance from sphere center (normalized)
          const dist = Math.sqrt((dx - sphereCX) ** 2 + (dy - sphereCY) ** 2);
          const normDist = clamp(dist / sphereR, 0, 1);

          let dotR;
          let dotColor = palette.charcoal;
          let dotOp = 0.8;

          if (dist < sphereR) {
            // Inside sphere
            if (bulge) {
              // Size increases toward center (convex effect)
              dotR = lerp(maxDotR, minDotR, normDist * normDist);
            } else {
              // Size decreases toward center (concave effect)
              dotR = lerp(minDotR, maxDotR, normDist * normDist);
            }
            // Color shifts inside sphere
            const colorT = normDist;
            dotColor = colorT < 0.5 ? colors[0] : palette.charcoal;
            dotOp = lerp(1.0, 0.5, normDist);
          } else {
            // Outside sphere — uniform small dots
            dotR = minDotR + (maxDotR - minDotR) * 0.15;
            dotOp = 0.4;
          }

          // Add subtle noise perturbation to dot positions
          const noiseX = noise(dx * 0.02, dy * 0.02) * 2;
          const noiseY = noise(dx * 0.02 + 50, dy * 0.02 + 50) * 2;
          svg.appendChild(Shapes.dot(dx + noiseX, dy + noiseY, dotR, dotColor, dotOp));
        }
      }

      // Gold accent — highlight on the sphere with glow
      const highlightAngle = range(rng, -60, -30) * Math.PI / 180;
      const hlX = sphereCX + Math.cos(highlightAngle) * sphereR * 0.4;
      const hlY = sphereCY + Math.sin(highlightAngle) * sphereR * 0.4;
      svg.appendChild(Shapes.circle(hlX, hlY, sphereR * 0.22, `url(#${uid}-glow)`, 0.5));
      svg.appendChild(art.circle(hlX, hlY, sphereR * 0.12, '#D4A84B', 0.7));

    } else if (strategy === 1) {
      // === BAYER TYPOGRAPHIC GRID ===
      // Clean dot grid with bold geometric overlays and masking

      const gridN = rangeInt(rng, 10, Math.floor(10 + density * 6));
      const spacing = C / (gridN + 1);
      const baseDotR = range(rng, 2, 4);

      // Define overlay shapes first
      const overlayCount = rangeInt(rng, 1, 3);
      const overlays = [];
      for (let i = 0; i < overlayCount; i++) {
        const type = pick(rng, ['rect', 'circle', 'triangle', 'bar']);
        const ox = range(rng, C * 0.15, C * 0.65);
        const oy = range(rng, C * 0.15, C * 0.65);
        const oSize = range(rng, C * 0.15, C * 0.3);
        overlays.push({
          type, x: ox, y: oy, size: oSize,
          color: pick(rng, colors),
          angle: range(rng, -30, 30)
        });
      }

      // Function to check if point is inside an overlay
      function isInsideOverlay(px, py) {
        for (const ov of overlays) {
          if (ov.type === 'circle') {
            if (Math.sqrt((px - ov.x) ** 2 + (py - ov.y) ** 2) < ov.size) return true;
          } else {
            if (px > ov.x - ov.size / 2 && px < ov.x + ov.size / 2 &&
              py > ov.y - ov.size / 2 && py < ov.y + ov.size / 2) return true;
          }
        }
        return false;
      }

      // Masking mode
      const maskMode = pick(rng, ['disappear', 'gold', 'enlarge', 'outline']);

      // Draw dot grid
      for (let r = 0; r < gridN; r++) {
        for (let c = 0; c < gridN; c++) {
          const dx = spacing + c * spacing;
          const dy = spacing + r * spacing;
          const inside = isInsideOverlay(dx, dy);

          if (inside && maskMode === 'disappear') continue;

          let dotR = baseDotR;
          let dotColor = palette.charcoal;
          let dotOp = 0.5;

          if (inside) {
            switch (maskMode) {
              case 'gold':
                dotColor = '#D4A84B';
                dotOp = 0.9;
                break;
              case 'enlarge':
                dotR = baseDotR * 3;
                dotOp = 0.7;
                break;
              case 'outline':
                svg.appendChild(Shapes.circleOutline(dx, dy, baseDotR * 2, palette.charcoal, 1, 0.6));
                continue;
            }
          }

          // Noise perturbation for organic feel
          const nxB = noise(dx * 0.018, dy * 0.018) * 1.5;
          const nyB = noise(dx * 0.018 + 40, dy * 0.018 + 40) * 1.5;
          svg.appendChild(Shapes.dot(dx + nxB, dy + nyB, dotR, dotColor, dotOp));
        }
      }

      // Draw overlay shapes with hatched fills, transparency and shadows
      for (const ov of overlays) {
        switch (ov.type) {
          case 'rect':
            svg.appendChild(withShadow(art.rect(ov.x - ov.size / 2, ov.y - ov.size / 2, ov.size, ov.size, ov.color, 0.6, ov.angle), uid));
            break;
          case 'circle':
            svg.appendChild(withShadow(art.circle(ov.x, ov.y, ov.size, ov.color, 0.55), uid));
            break;
          case 'triangle':
            svg.appendChild(withShadow(art.triangle(ov.x, ov.y, ov.size * 1.3, ov.angle, ov.color, 0.6), uid));
            break;
          case 'bar':
            svg.appendChild(withShadow(art.bar(ov.x, ov.y, ov.size * 2.5, ov.size * 0.3, ov.angle, ov.color, 0.6), uid));
            break;
        }
      }

    } else {
      // === GRADIENT FIELD — Dots create a tonal landscape ===
      // Size and opacity gradients create "terrain"

      const gridN = rangeInt(rng, 12, Math.floor(12 + density * 6));
      const spacing = C / (gridN + 1);
      const maxDotR = spacing * 0.4;

      // Gradient direction
      const gradAngle = range(rng, 0, Math.PI * 2);
      const gradCos = Math.cos(gradAngle);
      const gradSin = Math.sin(gradAngle);

      // Secondary gradient (perpendicular color shift)
      const perpCos = Math.cos(gradAngle + Math.PI / 2);
      const perpSin = Math.sin(gradAngle + Math.PI / 2);

      for (let r = 0; r < gridN; r++) {
        for (let c = 0; c < gridN; c++) {
          const dx = spacing + c * spacing;
          const dy = spacing + r * spacing;

          // Normalized position along gradient
          const normX = (dx - C / 2) / (C / 2);
          const normY = (dy - C / 2) / (C / 2);
          const gradT = clamp((normX * gradCos + normY * gradSin + 1) / 2, 0, 1);
          const perpT = clamp((normX * perpCos + normY * perpSin + 1) / 2, 0, 1);

          // Size varies with gradient
          const dotR = lerp(maxDotR * 0.15, maxDotR, gradT);

          // Color varies perpendicular to size gradient
          const colorIdx = Math.floor(perpT * (colors.length - 1));
          const dotColor = colors[clamp(colorIdx, 0, colors.length - 1)];
          const dotOp = lerp(0.3, 0.9, gradT);

          // Add noise perturbation to gradient dots
          const noiseX = noise(dx * 0.015, dy * 0.015) * 1.5;
          const noiseY = noise(dx * 0.015 + 30, dy * 0.015 + 30) * 1.5;
          svg.appendChild(Shapes.dot(dx + noiseX, dy + noiseY, dotR, dotColor, dotOp));
        }
      }

      // Bold geometric overlay — hatched
      const ovType = pick(rng, ['rect', 'circle', 'triangle']);
      const ovX = range(rng, C * 0.25, C * 0.6);
      const ovY = range(rng, C * 0.25, C * 0.6);
      const ovSize = range(rng, C * 0.12, C * 0.25);
      const ovColor = '#D4A84B';

      switch (ovType) {
        case 'rect':
          svg.appendChild(withDeepShadow(art.rect(ovX - ovSize / 2, ovY - ovSize / 2, ovSize, ovSize, ovColor, 0.7), uid));
          svg.appendChild(Shapes.rectOutline(ovX - ovSize / 2, ovY - ovSize / 2, ovSize, ovSize, palette.charcoal, 2, 0.5));
          break;
        case 'circle':
          svg.appendChild(Shapes.circle(ovX, ovY, ovSize * 0.7, `url(#${uid}-glow)`, 0.4));
          svg.appendChild(withDeepShadow(art.circle(ovX, ovY, ovSize / 2, ovColor, 0.7), uid));
          svg.appendChild(Shapes.circleOutline(ovX, ovY, ovSize / 2, palette.charcoal, 2, 0.5));
          break;
        case 'triangle':
          svg.appendChild(withDeepShadow(art.triangle(ovX, ovY, ovSize, range(rng, 0, 360), ovColor, 0.7), uid));
          break;
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  COMPOSER: ARABIAN_GEOMETRIC
  //  Reference: Alhambra zellige tilework, Islamic geometric patterns
  //             Girih tiles (Darb-e Imam shrine, Isfahan)
  //             Muqarnas vaulting geometry
  //
  //  Key characteristics:
  //  - Radial symmetry (6-fold, 8-fold, 12-fold rotational)
  //  - Interlocking star-and-polygon tessellations
  //  - Infinite pattern logic — shapes tile seamlessly
  //  - No figural representation — pure geometric abstraction
  //  - Layered complexity: primary stars, secondary polygons, tertiary infill
  //  - Line-based construction (girih lines) with colored fill zones
  //  - Mathematical precision rooted in compass-and-straightedge
  // ══════════════════════════════════════════════════════════════
  function composeArabianGeometric(svg, palette, rng, density, uid) {
    const C = CANVAS;
    const colors = palette.colors;
    const bg = palette.bg;
    const noise = createNoise2D(rng);
    const art = createArtShapes(noise, rng, uid);

    svg.appendChild(Shapes.rect(0, 0, C, C, bg));

    // Helper: draw a star polygon with n points
    function starPolygon(cx, cy, outerR, innerR, n, rotation = 0) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a1 = rotation + (i / n) * Math.PI * 2 - Math.PI / 2;
        const a2 = rotation + ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
        pts.push(`${cx + Math.cos(a1) * outerR},${cy + Math.sin(a1) * outerR}`);
        pts.push(`${cx + Math.cos(a2) * innerR},${cy + Math.sin(a2) * innerR}`);
      }
      return pts.join(' ');
    }

    // Helper: draw a regular polygon
    function regularPolygon(cx, cy, r, n, rotation = 0) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = rotation + (i / n) * Math.PI * 2 - Math.PI / 2;
        pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
      }
      return pts.join(' ');
    }

    const strategy = rangeInt(rng, 0, 2);

    if (strategy === 0) {
      // === STAR TESSELLATION (Alhambra style) ===
      // Dense concentric star geometry with interstitial kite fills

      const foldCount = pick(rng, [8, 10, 12]);
      const cx = C / 2;
      const cy = C / 2;
      const outerR = C * 0.44;

      // Background circle — subtle dome boundary
      svg.appendChild(Shapes.circle(cx, cy, outerR * 1.08, palette.charcoal, 0.04));

      // Four concentric star layers
      const layers = [
        { r: outerR, indent: 0.42, color: colors[0], op: 0.2, sw: 1.5 },
        { r: outerR * 0.72, indent: 0.38, color: colors[1], op: 0.35, sw: 1.2 },
        { r: outerR * 0.48, indent: 0.4, color: colors[2] || colors[0], op: 0.5, sw: 1 },
        { r: outerR * 0.28, indent: 0.45, color: '#D4A84B', op: 0.7, sw: 1.5 },
      ];

      layers.forEach((layer, li) => {
        const innerR = layer.r * layer.indent;
        // Filled star
        svg.appendChild(el('polygon', {
          points: starPolygon(cx, cy, layer.r, innerR, foldCount),
          fill: layer.color,
          opacity: layer.op,
          stroke: palette.charcoal,
          'stroke-width': layer.sw,
          'stroke-opacity': 0.6
        }));

        // Connecting ring between layers
        if (li < layers.length - 1) {
          svg.appendChild(Shapes.circleOutline(cx, cy, layer.r * 0.85, palette.charcoal, 0.8, 0.2));
        }
      });

      // Girih lines — radiating structural lines
      for (let i = 0; i < foldCount; i++) {
        const a = (i / foldCount) * Math.PI * 2 - Math.PI / 2;
        svg.appendChild(Shapes.thinLine(
          cx + Math.cos(a) * outerR * 0.2, cy + Math.sin(a) * outerR * 0.2,
          cx + Math.cos(a) * C * 0.62, cy + Math.sin(a) * C * 0.62,
          palette.charcoal, 0.7
        ));

        // Secondary lines between primary lines
        const a2 = ((i + 0.5) / foldCount) * Math.PI * 2 - Math.PI / 2;
        svg.appendChild(Shapes.thinLine(
          cx + Math.cos(a2) * outerR * 0.35, cy + Math.sin(a2) * outerR * 0.35,
          cx + Math.cos(a2) * outerR, cy + Math.sin(a2) * outerR,
          palette.charcoal, 0.4
        ));
      }

      // Kite fills between star points (interstitial geometry)
      for (let i = 0; i < foldCount; i++) {
        const a1 = (i / foldCount) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / foldCount) * Math.PI * 2 - Math.PI / 2;
        const aMid = (a1 + a2) / 2;

        // Outer kite between star points
        const kx1 = cx + Math.cos(a1) * outerR;
        const ky1 = cy + Math.sin(a1) * outerR;
        const kx2 = cx + Math.cos(aMid) * outerR * 1.15;
        const ky2 = cy + Math.sin(aMid) * outerR * 1.15;
        const kx3 = cx + Math.cos(a2) * outerR;
        const ky3 = cy + Math.sin(a2) * outerR;
        const kx4 = cx + Math.cos(aMid) * outerR * 0.7;
        const ky4 = cy + Math.sin(aMid) * outerR * 0.7;

        svg.appendChild(el('polygon', {
          points: `${kx1},${ky1} ${kx2},${ky2} ${kx3},${ky3} ${kx4},${ky4}`,
          fill: colors[(i + 2) % colors.length],
          opacity: 0.18,
          stroke: palette.charcoal,
          'stroke-width': 0.6,
          'stroke-opacity': 0.4
        }));
      }

      // Rosette dots at star points
      for (let i = 0; i < foldCount; i++) {
        const a = (i / foldCount) * Math.PI * 2 - Math.PI / 2;
        const rx = cx + Math.cos(a) * outerR;
        const ry = cy + Math.sin(a) * outerR;
        svg.appendChild(Shapes.circle(rx, ry, C * 0.018, '#D4A84B', 0.75));
      }

      // Corner ornaments — quarter-stars
      if (density > 0.35) {
        const cR = C * 0.14;
        [[0, 0], [C, 0], [0, C], [C, C]].forEach(([px, py], idx) => {
          svg.appendChild(Shapes.quarterCircle(px, py, cR, ['tl', 'tr', 'bl', 'br'][idx], colors[idx % colors.length], 0.2));
          svg.appendChild(Shapes.circleOutline(px, py, cR, palette.charcoal, 1, 0.3));
        });
      }

      // Center jewel — gold with hatched fill and glow
      const jewelR = range(rng, C * 0.04, C * 0.06);
      svg.appendChild(Shapes.circle(cx, cy, jewelR * 2, `url(#${uid}-glow)`, 0.45));
      svg.appendChild(withDeepShadow(art.circle(cx, cy, jewelR, '#D4A84B', 0.9), uid));

      // Outer border frame
      const b = C * 0.025;
      svg.appendChild(Shapes.rectOutline(b, b, C - b * 2, C - b * 2, palette.charcoal, 2, 0.35));

    } else if (strategy === 1) {
      // === GIRIH TILE FIELD (Isfahan style) ===
      // Dense tessellation of star-and-hexagon tiles with colored fills

      const tileSize = range(rng, C * 0.1, C * 0.16);
      const cols = Math.ceil(C / tileSize) + 2;
      const rows = Math.ceil(C / (tileSize * 0.866)) + 2;
      const baseAngle = rng() * Math.PI;
      const innerRatio = range(rng, 0.38, 0.48);

      // Draw star-hexagon tiles across the field
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const tcx = c * tileSize + (r % 2 === 0 ? 0 : tileSize / 2);
          const tcy = r * tileSize * 0.866;

          const starR = tileSize * 0.44;
          const innerStarR = starR * innerRatio;

          // Colored star fill
          const colorIdx = ((r + c) % colors.length + colors.length) % colors.length;
          svg.appendChild(el('polygon', {
            points: starPolygon(tcx, tcy, starR, innerStarR, 6, baseAngle),
            fill: colors[colorIdx],
            opacity: range(rng, 0.15, 0.35),
            stroke: palette.charcoal,
            'stroke-width': 0.8,
            'stroke-opacity': 0.5
          }));

          // Inner hexagon — creates the tile's center
          if (density > 0.25) {
            const hexR = innerStarR * 0.85;
            svg.appendChild(el('polygon', {
              points: regularPolygon(tcx, tcy, hexR, 6, baseAngle + Math.PI / 6),
              fill: colors[(colorIdx + 2) % colors.length],
              opacity: 0.12,
              stroke: palette.charcoal,
              'stroke-width': 0.4,
              'stroke-opacity': 0.35
            }));
          }

          // Tiny center dot
          if (density > 0.4) {
            svg.appendChild(Shapes.dot(tcx, tcy, 1.5, palette.charcoal, 0.3));
          }
        }
      }

      // Central medallion — elevated with shadow
      const medR = C * range(rng, 0.2, 0.26);
      const mx = C / 2;
      const my = C / 2;

      // Medallion background
      svg.appendChild(withShadow(Shapes.circle(mx, my, medR, bg, 0.85), uid));
      svg.appendChild(Shapes.circleOutline(mx, my, medR, palette.charcoal, 2.5, 0.55));
      svg.appendChild(Shapes.circleOutline(mx, my, medR * 0.88, palette.charcoal, 1, 0.3));

      // Medallion inner star
      const medFold = pick(rng, [8, 10, 12]);
      svg.appendChild(el('polygon', {
        points: starPolygon(mx, my, medR * 0.75, medR * 0.35, medFold),
        fill: colors[0],
        opacity: 0.25,
        stroke: palette.charcoal,
        'stroke-width': 1.2,
        'stroke-opacity': 0.5
      }));
      svg.appendChild(el('polygon', {
        points: starPolygon(mx, my, medR * 0.45, medR * 0.22, medFold),
        fill: '#D4A84B',
        opacity: 0.4,
        stroke: palette.charcoal,
        'stroke-width': 1,
        'stroke-opacity': 0.4
      }));

      // Center jewel — hatched
      svg.appendChild(Shapes.circle(mx, my, medR * 0.1, `url(#${uid}-glow)`, 0.5));
      svg.appendChild(withDeepShadow(art.circle(mx, my, medR * 0.06, '#D4A84B', 0.9), uid));

      // Border frame — double-line
      const b = C * 0.028;
      svg.appendChild(Shapes.rectOutline(b, b, C - b * 2, C - b * 2, palette.charcoal, 2, 0.4));
      svg.appendChild(Shapes.rectOutline(b * 2, b * 2, C - b * 4, C - b * 4, palette.charcoal, 1, 0.2));

    } else {
      // === MUQARNAS RADIAL (Dome pattern) ===
      // Concentric rings of geometric elements with rotational symmetry

      const cx = C / 2;
      const cy = C / 2;
      const foldCount = pick(rng, [8, 10, 12]);
      const ringCount = rangeInt(rng, 4, 6);

      // Dome boundary — subtle tinted background
      const domeR = C * 0.46;
      svg.appendChild(Shapes.circle(cx, cy, domeR, palette.charcoal, 0.05));
      svg.appendChild(Shapes.circleOutline(cx, cy, domeR, palette.charcoal, 2, 0.45));

      // Concentric rings with rotational elements
      for (let ring = ringCount - 1; ring >= 0; ring--) {
        const ringR = domeR * (ring + 1) / (ringCount + 0.5);
        const prevR = ring > 0 ? domeR * ring / (ringCount + 0.5) : 0;
        const elemCount = foldCount * (ring === 0 ? 1 : ring + 1);
        const bandWidth = ringR - prevR;
        const elemSize = bandWidth * range(rng, 0.32, 0.5);
        const ringColor = colors[ring % colors.length];
        const rotOffset = ring * (Math.PI / foldCount);

        // Ring outline
        svg.appendChild(Shapes.circleOutline(cx, cy, ringR, palette.charcoal, 1, 0.22));

        // Elements around the ring
        for (let i = 0; i < elemCount; i++) {
          const angle = rotOffset + (i / elemCount) * Math.PI * 2;
          const elemR = (ringR + prevR) / 2;
          const ex = cx + Math.cos(angle) * elemR;
          const ey = cy + Math.sin(angle) * elemR;

          const shapeChoice = (ring + i) % 4;
          const elemOp = range(rng, 0.3, 0.65);

          if (shapeChoice === 0) {
            // Kite/diamond pointing outward
            svg.appendChild(Shapes.rotatedRect(ex, ey, elemSize * 0.7, elemSize * 1.5, angle * 180 / Math.PI, ringColor, elemOp));
          } else if (shapeChoice === 1) {
            // Small triangle pointing outward
            svg.appendChild(Shapes.triangle(ex, ey, elemSize * 0.9, angle * 180 / Math.PI + 90, ringColor, elemOp));
          } else if (shapeChoice === 2) {
            // Circle
            svg.appendChild(Shapes.circle(ex, ey, elemSize * 0.35, ringColor, elemOp));
          } else {
            // Tiny star
            svg.appendChild(el('polygon', {
              points: starPolygon(ex, ey, elemSize * 0.5, elemSize * 0.2, 6, angle),
              fill: ringColor,
              opacity: elemOp,
              stroke: palette.charcoal,
              'stroke-width': 0.4,
              'stroke-opacity': 0.3
            }));
          }
        }
      }

      // Girih lines — radiating spokes
      for (let i = 0; i < foldCount; i++) {
        const a = (i / foldCount) * Math.PI * 2;
        svg.appendChild(Shapes.thinLine(
          cx + Math.cos(a) * domeR * 0.12, cy + Math.sin(a) * domeR * 0.12,
          cx + Math.cos(a) * domeR, cy + Math.sin(a) * domeR,
          palette.charcoal, 0.7
        ));
      }

      // Central rosette — gold star with glow and hatching
      const roseR = domeR * 0.13;
      svg.appendChild(Shapes.circle(cx, cy, roseR * 2.2, `url(#${uid}-glow)`, 0.4));
      svg.appendChild(withDeepShadow(art.circle(cx, cy, roseR, '#D4A84B', 0.85), uid));

      // Inner star at center
      const innerStarR = roseR * 1.8;
      svg.appendChild(el('polygon', {
        points: starPolygon(cx, cy, innerStarR, innerStarR * 0.42, foldCount),
        fill: 'none',
        stroke: palette.charcoal,
        'stroke-width': 1.5,
        opacity: 0.55
      }));

      // Spandrel corners (triangular fills)
      if (density > 0.3) {
        const sp = C * 0.16;
        const spColor = colors[colors.length - 1] || palette.charcoal;
        svg.appendChild(el('polygon', { points: `0,0 ${sp},0 0,${sp}`, fill: spColor, opacity: 0.12 }));
        svg.appendChild(el('polygon', { points: `${C},0 ${C - sp},0 ${C},${sp}`, fill: spColor, opacity: 0.12 }));
        svg.appendChild(el('polygon', { points: `0,${C} ${sp},${C} 0,${C - sp}`, fill: spColor, opacity: 0.12 }));
        svg.appendChild(el('polygon', { points: `${C},${C} ${C - sp},${C} ${C},${C - sp}`, fill: spColor, opacity: 0.12 }));
      }
    }
  }

  // ── COMPOSER DISPATCH ──
  const COMPOSERS = {
    FREE_FORM: composeFreeForm,
    GRID: composeGrid,
    REPETITION: composeRepetition,
    CONSTRUCTIVIST: composeConstructivist,
    COLOR_STUDY: composeColorStudy,
    DOT_FIELD: composeDotField,
    ARABIAN_GEOMETRIC: composeArabianGeometric
  };

  // ── PUBLIC API ──
  function render(container, options) {
    const { archetype, palette: paletteName, seed, density = 0.5 } = options;
    const palette = PALETTES[paletteName] || PALETTES.ZSIGNAL;
    const composer = COMPOSERS[archetype];
    if (!composer) { console.error('Unknown archetype:', archetype); return null; }

    const rng = createRng(seed);
    const svg = el('svg', {
      viewBox: `0 0 ${CANVAS} ${CANVAS}`,
      xmlns: SVG_NS,
      'shape-rendering': 'geometricPrecision'
    });

    // Add filter defs for texture/shadow effects (palette-aware gradients)
    const uid = addDefs(svg, seed, palette);

    // Run composer with uid for filter references
    composer(svg, palette, rng, density, uid);

    // Atmospheric depth gradient — subtle darkening toward bottom
    svg.appendChild(el('rect', {
      x: 0, y: 0, width: CANVAS, height: CANVAS,
      fill: `url(#${uid}-depth)`, opacity: '1'
    }));

    // Vignette — darkened edges for gallery-quality framing
    svg.appendChild(el('rect', {
      x: 0, y: 0, width: CANVAS, height: CANVAS,
      fill: `url(#${uid}-vignette)`, opacity: '1'
    }));

    // Paper texture overlay — subtle grain for fine-art print feel
    svg.appendChild(el('rect', {
      x: 0, y: 0, width: CANVAS, height: CANVAS,
      fill: 'transparent', filter: `url(#${uid}-paper)`, opacity: '0.07'
    }));

    if (typeof container === 'string') container = document.querySelector(container);
    if (container) {
      container.innerHTML = '';
      container.appendChild(svg);
    }
    return svg;
  }

  function renderToString(options) {
    const temp = document.createElement('div');
    const svg = render(temp, options);
    return temp.innerHTML;
  }

  // ── ANIMATED GENESIS RENDER ──
  // Cinematic build animation — elements fly/scale/rotate into position.
  // Returns a controller: { play(), stop(), isPlaying }
  function renderAnimated(container, options, animOptions = {}) {
    const {
      delayPerElement = 90,
      initialDelay = 400,
      easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
      onComplete = null
    } = animOptions;

    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return null;

    const { archetype, palette: paletteName, seed, density = 0.5 } = options;
    const palette = PALETTES[paletteName] || PALETTES.ZSIGNAL;
    const composer = COMPOSERS[archetype];
    if (!composer) return null;

    const rng = createRng(seed);
    const svg = el('svg', {
      viewBox: `0 0 ${CANVAS} ${CANVAS}`,
      xmlns: SVG_NS,
      'shape-rendering': 'geometricPrecision'
    });
    const uid = addDefs(svg, seed, palette);
    composer(svg, palette, rng, density, uid);

    // Collect children (skip defs and bg rect)
    const allChildren = Array.from(svg.children);
    const defsEl = allChildren.find(c => c.tagName === 'defs');
    const bgRect = allChildren.find(c => c.tagName === 'rect' && c === svg.children[1]);
    const shapeElements = allChildren.filter(c => c !== defsEl && c !== bgRect);

    // Seeded RNG for animation variety (so each artwork gets consistent animation)
    const animRng = createRng(seed + 7777);

    // Assign each element a dramatic entry animation
    const entryStyles = ['scale-up', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'rotate-in', 'zoom-pop'];

    shapeElements.forEach((shape, i) => {
      const style = entryStyles[Math.floor(animRng() * entryStyles.length)];
      const dur = 550 + Math.floor(animRng() * 250); // 550-800ms
      shape.style.transformOrigin = 'center center';
      shape.style.transformBox = 'fill-box';
      shape.style.transition = `opacity ${dur}ms ${easing}, transform ${dur}ms ${easing}`;
      shape._entryStyle = style;
      shape._dur = dur;

      // Set initial hidden state based on entry type
      shape.style.opacity = '0';
      switch (style) {
        case 'scale-up':
          shape.style.transform = 'scale(0.3)'; break;
        case 'slide-left':
          shape.style.transform = 'translateX(-80px)'; break;
        case 'slide-right':
          shape.style.transform = 'translateX(80px)'; break;
        case 'slide-up':
          shape.style.transform = 'translateY(-60px)'; break;
        case 'slide-down':
          shape.style.transform = 'translateY(60px)'; break;
        case 'rotate-in':
          shape.style.transform = 'scale(0.5) rotate(-45deg)'; break;
        case 'zoom-pop':
          shape.style.transform = 'scale(1.6)'; break;
      }
    });

    // Finishing overlays
    const depthOverlay = el('rect', {
      x: 0, y: 0, width: CANVAS, height: CANVAS,
      fill: `url(#${uid}-depth)`, opacity: '0'
    });
    depthOverlay.style.transition = `opacity 1000ms ${easing}`;
    svg.appendChild(depthOverlay);

    const vigOverlay = el('rect', {
      x: 0, y: 0, width: CANVAS, height: CANVAS,
      fill: `url(#${uid}-vignette)`, opacity: '0'
    });
    vigOverlay.style.transition = `opacity 1000ms ${easing}`;
    svg.appendChild(vigOverlay);

    const texOverlay = el('rect', {
      x: 0, y: 0, width: CANVAS, height: CANVAS,
      fill: 'transparent', filter: `url(#${uid}-paper)`, opacity: '0'
    });
    texOverlay.style.transition = `opacity 1000ms ${easing}`;
    svg.appendChild(texOverlay);

    // Mount SVG
    container.innerHTML = '';
    container.appendChild(svg);

    let timeouts = [];
    let playing = false;

    function play() {
      stop();
      playing = true;

      // Reset all elements to hidden
      shapeElements.forEach(shape => {
        shape.style.opacity = '0';
        switch (shape._entryStyle) {
          case 'scale-up': shape.style.transform = 'scale(0.3)'; break;
          case 'slide-left': shape.style.transform = 'translateX(-80px)'; break;
          case 'slide-right': shape.style.transform = 'translateX(80px)'; break;
          case 'slide-up': shape.style.transform = 'translateY(-60px)'; break;
          case 'slide-down': shape.style.transform = 'translateY(60px)'; break;
          case 'rotate-in': shape.style.transform = 'scale(0.5) rotate(-45deg)'; break;
          case 'zoom-pop': shape.style.transform = 'scale(1.6)'; break;
        }
      });
      depthOverlay.style.opacity = '0';
      vigOverlay.style.opacity = '0';
      texOverlay.style.opacity = '0';

      // Stagger reveal with varied timing
      shapeElements.forEach((shape, i) => {
        const t = setTimeout(() => {
          if (!playing) return;
          shape.style.opacity = '';
          shape.style.transform = 'scale(1) rotate(0deg) translateX(0) translateY(0)';
          setTimeout(() => {
            shape.style.opacity = shape.getAttribute('opacity') || '';
            shape.style.transform = '';
          }, shape._dur + 50);
        }, initialDelay + i * delayPerElement);
        timeouts.push(t);
      });

      // Final polish overlays
      const finalT = setTimeout(() => {
        if (!playing) return;
        depthOverlay.style.opacity = '1';
        vigOverlay.style.opacity = '1';
        texOverlay.style.opacity = '0.07';
        playing = false;
        if (onComplete) onComplete();
      }, initialDelay + shapeElements.length * delayPerElement + 400);
      timeouts.push(finalT);
    }

    function stop() {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      playing = false;
    }

    function reveal() {
      stop();
      shapeElements.forEach(shape => {
        shape.style.opacity = shape.getAttribute('opacity') || '';
        shape.style.transform = '';
      });
      depthOverlay.style.opacity = '1';
      vigOverlay.style.opacity = '1';
      texOverlay.style.opacity = '0.07';
    }

    return { play, stop, reveal, isPlaying: () => playing, elementCount: shapeElements.length };
  }

  return { render, renderToString, renderAnimated, PALETTES, COMPOSERS, Shapes };
})();
