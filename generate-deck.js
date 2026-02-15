/**
 * ZSIGNAL Gallery — PowerPoint Deck Generator
 * Generates a .pptx using pptxgenjs with Z-Signal design tokens.
 *
 * Run: node generate-deck.js
 * Output: ZSIGNAL-Gallery-Deck.pptx
 */

const PptxGenJS = require("pptxgenjs");

// ── Z-SIGNAL TOKENS ──
const Z = {
  cream:     "F2E8D5",
  creamDark: "E8DCC8",
  charcoal:  "1C1C1C",
  brick:     "C04B3C",
  blue:      "3A6EA5",
  gold:      "D4A84B",
  olive:     "6B7B3C",
  white:     "FFFFFF",
  moon:      "9370DB",
  sniper:    "4169E1",
  surf:      "20B2AA",
  wave:      "DB7093",
  fontMono:  "IBM Plex Mono",
  fontSans:  "IBM Plex Sans",
};

const pptx = new PptxGenJS();
pptx.author = "ZSIGNAL";
pptx.company = "ZSIGNAL Gallery";
pptx.title = "ZSIGNAL Gallery — Pitch Deck";
pptx.subject = "Generative Bauhaus Art Gallery & Print Shop";

// 16:9 widescreen
pptx.layout = "LAYOUT_WIDE";

// ── HELPERS ──
function addLogo(slide) {
  // Gold square
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 0.35, w: 0.15, h: 0.15,
    fill: { color: Z.gold },
  });
  slide.addText("ZSIGNAL", {
    x: 0.72, y: 0.28, w: 2, h: 0.3,
    fontFace: Z.fontMono, fontSize: 10, bold: true,
    color: Z.charcoal, letterSpacing: 1,
  });
}

function addLogoDark(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 0.35, w: 0.15, h: 0.15,
    fill: { color: Z.gold },
  });
  slide.addText("ZSIGNAL", {
    x: 0.72, y: 0.28, w: 2, h: 0.3,
    fontFace: Z.fontMono, fontSize: 10, bold: true,
    color: Z.cream, letterSpacing: 1,
  });
}

function addSlideNum(slide, num, total, dark = false) {
  slide.addText(`${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x: 11.5, y: 7.0, w: 1.5, h: 0.3,
    fontFace: Z.fontMono, fontSize: 9, color: dark ? "555555" : "AAAAAA",
    align: "right",
  });
}

function addLabel(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x || 0.8, y: opts.y || 1.0, w: opts.w || 4, h: 0.3,
    fontFace: Z.fontMono, fontSize: 10, bold: true,
    color: Z.gold, letterSpacing: 2,
  });
}

// Bauhaus geometric shapes (decorative)
function addBauhausAccent(slide, variant = "default") {
  if (variant === "right-panel") {
    // Large brick rectangle
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 8.0, y: 0.0, w: 5.33, h: 5.0,
      fill: { color: Z.brick },
    });
    // Blue rectangle overlapping
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 7.2, y: 1.5, w: 3.0, h: 4.0,
      fill: { color: Z.blue }, transparency: 15,
    });
    // Gold circle (focal)
    slide.addShape(pptx.shapes.OVAL, {
      x: 9.0, y: 2.8, w: 1.6, h: 1.6,
      fill: { color: Z.gold },
    });
    // Charcoal triangle (counter-weight)
    slide.addShape(pptx.shapes.RIGHT_TRIANGLE, {
      x: 7.5, y: 5.5, w: 2.0, h: 2.0,
      fill: { color: Z.charcoal },
    });
    // Olive semi-circle
    slide.addShape(pptx.shapes.OVAL, {
      x: 10.5, y: -0.5, w: 1.6, h: 1.6,
      fill: { color: Z.olive }, transparency: 40,
    });
  } else if (variant === "bottom-strip") {
    // A series of growing circles
    const colors = [Z.gold, Z.charcoal, Z.gold, Z.charcoal, Z.gold, Z.charcoal];
    for (let i = 0; i < 6; i++) {
      const size = 0.3 + i * 0.12;
      slide.addShape(pptx.shapes.OVAL, {
        x: 1.5 + i * 2.0, y: 6.8 - size / 2,
        w: size, h: size,
        fill: { color: colors[i] }, transparency: 85,
      });
    }
  } else if (variant === "grid-bg") {
    // Subtle grid pattern
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        if (Math.random() > 0.6) {
          slide.addShape(pptx.shapes.RECTANGLE, {
            x: 0.5 + c * 2.1, y: 0.5 + r * 1.8, w: 1.8, h: 1.5,
            fill: { color: Z.creamDark }, transparency: 70,
            line: { color: Z.charcoal, width: 0.5, dashType: "solid" },
          });
        }
      }
    }
  } else if (variant === "closing-center") {
    // Concentric squares (COLOR_STUDY)
    const cColors = [Z.brick, Z.blue, Z.gold, Z.olive, Z.charcoal];
    for (let i = 0; i < 5; i++) {
      const size = 3.0 - i * 0.5;
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: (13.33 - size) / 2, y: (7.5 - size) / 2 - 0.3,
        w: size, h: size,
        fill: { color: cColors[i] }, transparency: i === 4 ? 0 : 10,
      });
    }
  }
}

const TOTAL = 8;

// ══════════════════════════════════════════
//  SLIDE 1 — TITLE
// ══════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { color: Z.cream };

  // Art zone: right panel
  addBauhausAccent(slide, "right-panel");

  // Label
  slide.addText("GENERATIVE ART \u00D7 E-COMMERCE", {
    x: 0.8, y: 1.2, w: 6, h: 0.3,
    fontFace: Z.fontMono, fontSize: 10, bold: true,
    color: Z.gold, letterSpacing: 2,
  });

  // Title
  slide.addText("ZSIGNAL\nGallery", {
    x: 0.8, y: 1.7, w: 6, h: 2.5,
    fontFace: Z.fontMono, fontSize: 54, bold: true,
    color: Z.charcoal, lineSpacing: 58,
  });

  // Subtitle
  slide.addText("A platform where algorithmically generated Bauhaus art meets museum-quality framed prints. Browse. Customize. Own.", {
    x: 0.8, y: 4.3, w: 5.5, h: 1.2,
    fontFace: Z.fontSans, fontSize: 18, color: "555555",
    lineSpacing: 28,
  });

  // Date
  slide.addText("February 2026  \u00B7  Seed Round", {
    x: 0.8, y: 5.8, w: 4, h: 0.3,
    fontFace: Z.fontMono, fontSize: 11, color: "999999",
    letterSpacing: 2,
  });

  // Gold square logo
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8, y: 6.4, w: 0.2, h: 0.2,
    fill: { color: Z.gold },
  });

  addSlideNum(slide, 1, TOTAL);
})();

// ══════════════════════════════════════════
//  SLIDE 2 — PROBLEM
// ══════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { color: Z.charcoal };

  addLogoDark(slide);
  addLabel(slide, "THE PROBLEM", { y: 1.0 });

  slide.addText("Wall art is either\nmass-produced or inaccessible", {
    x: 0.8, y: 1.5, w: 10, h: 1.6,
    fontFace: Z.fontMono, fontSize: 36, bold: true,
    color: Z.cream, lineSpacing: 42,
  });

  const problems = [
    "Big-box retailers sell identical prints to millions. No uniqueness, no story, no craft.",
    "Original fine art is gatekept by galleries, priced for collectors, and intimidating to new buyers.",
    "Generative art lives on screens. There\u2019s no easy path from algorithm to wall.",
    "Customization (size, frame, material) is fragmented across multiple vendors.",
  ];

  problems.forEach((p, i) => {
    // Gold bullet square
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.8, y: 3.5 + i * 0.85, w: 0.15, h: 0.15,
      fill: { color: Z.gold },
    });
    slide.addText(p, {
      x: 1.15, y: 3.35 + i * 0.85, w: 9, h: 0.7,
      fontFace: Z.fontSans, fontSize: 16, color: "AAAAAA",
      lineSpacing: 22,
    });
  });

  addSlideNum(slide, 2, TOTAL, true);
})();

// ══════════════════════════════════════════
//  SLIDE 3 — SOLUTION
// ══════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { color: Z.cream };

  addLogo(slide);
  addLabel(slide, "THE SOLUTION");

  slide.addText("Art generated by code.\nPrinted by craftsmen.\nDelivered to your door.", {
    x: 0.8, y: 1.5, w: 10, h: 2.0,
    fontFace: Z.fontMono, fontSize: 34, bold: true,
    color: Z.charcoal, lineSpacing: 42,
  });

  // 3 feature cards
  const features = [
    { pip: Z.gold,     title: "Generative Engine",    desc: "6 composition archetypes, 6 palettes, deterministic seeds. Every piece is unique and reproducible." },
    { pip: Z.charcoal, title: "Print Customization",  desc: "4 sizes, 5 frame styles, 3 materials. Live price calculator and frame preview before you order." },
    { pip: Z.olive,    title: "Museum Quality",        desc: "310gsm Hahnem\u00FChle paper, gallery canvas, or acrylic face mount. Free worldwide shipping." },
  ];

  features.forEach((f, i) => {
    const x = 0.8 + i * 3.9;
    const y = 4.0;

    // Card border
    slide.addShape(pptx.shapes.RECTANGLE, {
      x, y, w: 3.6, h: 2.8,
      fill: { color: Z.cream },
      line: { color: Z.charcoal, width: 1.5 },
      shadow: { type: "outer", blur: 0, offset: 4, angle: 135, color: "1C1C1C", opacity: 0.12 },
    });

    // Color pip
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.3, y: y + 0.3, w: 0.3, h: 0.3,
      fill: { color: f.pip },
    });

    // Title
    slide.addText(f.title, {
      x: x + 0.3, y: y + 0.8, w: 3.0, h: 0.4,
      fontFace: Z.fontMono, fontSize: 15, bold: true, color: Z.charcoal,
    });

    // Desc
    slide.addText(f.desc, {
      x: x + 0.3, y: y + 1.3, w: 3.0, h: 1.2,
      fontFace: Z.fontSans, fontSize: 12, color: "666666", lineSpacing: 18,
    });
  });

  addSlideNum(slide, 3, TOTAL);
})();

// ══════════════════════════════════════════
//  SLIDE 4 — THE ART (6 Eras)
// ══════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { color: Z.cream };

  addLogo(slide);
  addLabel(slide, "THE ART");

  slide.addText("Six eras of computational Bauhaus", {
    x: 0.8, y: 1.5, w: 10, h: 0.8,
    fontFace: Z.fontMono, fontSize: 34, bold: true, color: Z.charcoal,
  });

  slide.addText("Each era is a distinct archetype\u2014a compositional algorithm rooted in a Bauhaus master\u2019s philosophy. Every artwork is generated live in the browser from a deterministic seed.", {
    x: 0.8, y: 2.4, w: 8, h: 0.8,
    fontFace: Z.fontSans, fontSize: 14, color: "666666", lineSpacing: 20,
  });

  // 6 era cards in a row
  const eras = [
    { n: "I",   name: "Free Form",      year: "2018",   color: Z.brick },
    { n: "II",  name: "Grid",            year: "2019",   color: Z.blue },
    { n: "III", name: "Repetition",      year: "2020",   color: Z.gold },
    { n: "IV",  name: "Constructivist",  year: "2021",   color: Z.charcoal },
    { n: "V",   name: "Color Study",     year: "2022",   color: Z.olive },
    { n: "VI",  name: "Dot Field",       year: "2023+",  color: Z.moon },
  ];

  eras.forEach((era, i) => {
    const x = 0.8 + i * 1.95;
    const y = 3.6;

    // Era art placeholder (colored rectangle with shapes)
    slide.addShape(pptx.shapes.RECTANGLE, {
      x, y, w: 1.7, h: 1.7,
      fill: { color: Z.creamDark },
      line: { color: Z.charcoal, width: 1.5 },
    });

    // Inner shape representing the archetype
    if (i === 0) { // FREE_FORM: overlapping rects
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: x + 0.2, y: y + 0.2, w: 1.0, h: 0.8, fill: { color: era.color }, transparency: 10,
      });
      slide.addShape(pptx.shapes.OVAL, {
        x: x + 0.6, y: y + 0.7, w: 0.5, h: 0.5, fill: { color: Z.gold },
      });
    } else if (i === 1) { // GRID: 2x2
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
        const shapes = [Z.brick, Z.blue, Z.gold, Z.olive];
        slide.addShape(r + c === 1 ? pptx.shapes.OVAL : pptx.shapes.RECTANGLE, {
          x: x + 0.25 + c * 0.6, y: y + 0.25 + r * 0.6, w: 0.5, h: 0.5,
          fill: { color: shapes[r * 2 + c] },
        });
      }
    } else if (i === 2) { // REPETITION: row of growing circles
      for (let j = 0; j < 5; j++) {
        const s = 0.15 + j * 0.05;
        slide.addShape(pptx.shapes.OVAL, {
          x: x + 0.15 + j * 0.3, y: y + 0.85 - s / 2, w: s, h: s,
          fill: { color: j % 2 === 0 ? Z.gold : Z.charcoal },
        });
      }
    } else if (i === 3) { // CONSTRUCTIVIST: diagonal line + triangle
      slide.addShape(pptx.shapes.LINE, {
        x: x + 0.2, y: y + 0.2, w: 1.3, h: 1.3,
        line: { color: Z.charcoal, width: 1.5 },
      });
      slide.addShape(pptx.shapes.RIGHT_TRIANGLE, {
        x: x + 0.5, y: y + 0.5, w: 0.7, h: 0.7,
        fill: { color: "CC0000" },
      });
    } else if (i === 4) { // COLOR_STUDY: nested squares
      const cs = [Z.brick, Z.blue, Z.gold];
      for (let j = 0; j < 3; j++) {
        const sz = 1.3 - j * 0.35;
        slide.addShape(pptx.shapes.RECTANGLE, {
          x: x + (1.7 - sz) / 2, y: y + (1.7 - sz) / 2, w: sz, h: sz,
          fill: { color: cs[j] },
        });
      }
    } else { // DOT_FIELD: grid of dots + overlay
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        slide.addShape(pptx.shapes.OVAL, {
          x: x + 0.2 + c * 0.28, y: y + 0.2 + r * 0.28, w: 0.1, h: 0.1,
          fill: { color: Z.charcoal }, transparency: 50,
        });
      }
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: x + 0.4, y: y + 0.5, w: 0.8, h: 0.7,
        fill: { color: Z.blue }, transparency: 30,
      });
    }

    // Era number
    slide.addText(era.n, {
      x, y: y + 1.85, w: 1.7, h: 0.35,
      fontFace: Z.fontMono, fontSize: 12, bold: true,
      color: Z.charcoal, align: "center",
    });
    // Era name
    slide.addText(era.name, {
      x, y: y + 2.15, w: 1.7, h: 0.3,
      fontFace: Z.fontMono, fontSize: 9,
      color: "888888", align: "center",
    });
    // Year
    slide.addText(era.year, {
      x, y: y + 2.4, w: 1.7, h: 0.25,
      fontFace: Z.fontMono, fontSize: 8,
      color: "AAAAAA", align: "center",
    });
  });

  addSlideNum(slide, 4, TOTAL);
})();

// ══════════════════════════════════════════
//  SLIDE 5 — PRODUCT
// ══════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { color: Z.cream };

  addLogo(slide);

  // Left: art placeholder (COLOR_STUDY style)
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8, y: 1.0, w: 5.0, h: 5.0,
    fill: { color: Z.creamDark },
    line: { color: Z.charcoal, width: 1.5 },
    shadow: { type: "outer", blur: 0, offset: 4, angle: 135, color: "1C1C1C", opacity: 0.12 },
  });
  // Nested concentric squares
  const csColors = [Z.brick, Z.blue, Z.gold, Z.olive, Z.charcoal];
  for (let i = 0; i < 5; i++) {
    const sz = 4.2 - i * 0.75;
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.8 + (5.0 - sz) / 2, y: 1.0 + (5.0 - sz) / 2, w: sz, h: sz,
      fill: { color: csColors[i] },
    });
  }

  // Right: content
  addLabel(slide, "THE PRODUCT", { x: 6.5 });

  slide.addText("Browse \u2192 Customize \u2192 Own", {
    x: 6.5, y: 1.5, w: 6, h: 0.8,
    fontFace: Z.fontMono, fontSize: 30, bold: true, color: Z.charcoal,
  });

  const bullets = [
    ["Gallery", "26 works, filterable by era and palette"],
    ["Detail page", "Full artwork with live frame preview"],
    ["Size selector", '8\u00D710" to 30\u00D740"'],
    ["Frame options", "Black, White, Oak, Gold, or unframed"],
    ["Material", "Fine art paper, canvas, acrylic"],
    ["Instant pricing", "$89\u2013$619 per piece"],
  ];

  bullets.forEach((b, i) => {
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 6.5, y: 2.65 + i * 0.65, w: 0.15, h: 0.15,
      fill: { color: Z.gold },
    });
    slide.addText([
      { text: b[0], options: { bold: true, fontFace: Z.fontSans, fontSize: 14, color: Z.charcoal } },
      { text: ` \u2014 ${b[1]}`, options: { fontFace: Z.fontSans, fontSize: 14, color: "666666" } },
    ], {
      x: 6.85, y: 2.5 + i * 0.65, w: 5.5, h: 0.5,
    });
  });

  addSlideNum(slide, 5, TOTAL);
})();

// ══════════════════════════════════════════
//  SLIDE 6 — TRACTION
// ══════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { color: Z.cream };

  addLogo(slide);
  addLabel(slide, "TRACTION");

  slide.addText("Early signals", {
    x: 0.8, y: 1.5, w: 8, h: 0.8,
    fontFace: Z.fontMono, fontSize: 36, bold: true, color: Z.charcoal,
  });

  // 4 stat cards
  const stats = [
    { num: "26",  label: "ARTWORKS LIVE",     color: Z.gold },
    { num: "6",   label: "COMPOSITION ERAS",  color: Z.charcoal },
    { num: "5",   label: "PAGES SHIPPED",     color: Z.gold },
    { num: "\u221E", label: "POSSIBLE SEEDS", color: Z.charcoal },
  ];

  stats.forEach((s, i) => {
    const x = 0.8 + i * 2.95;
    const y = 2.8;

    slide.addShape(pptx.shapes.RECTANGLE, {
      x, y, w: 2.7, h: 2.0,
      fill: { color: Z.cream },
      line: { color: Z.charcoal, width: 1.5 },
      shadow: { type: "outer", blur: 0, offset: 4, angle: 135, color: "1C1C1C", opacity: 0.12 },
    });

    slide.addText(s.num, {
      x, y: y + 0.2, w: 2.7, h: 1.0,
      fontFace: Z.fontMono, fontSize: 44, bold: true,
      color: s.color, align: "center",
    });

    slide.addText(s.label, {
      x, y: y + 1.3, w: 2.7, h: 0.4,
      fontFace: Z.fontMono, fontSize: 9,
      color: "999999", align: "center", letterSpacing: 2,
    });
  });

  slide.addText("Full platform built: generative engine, gallery with filtering, artwork detail with print ordering, artist biography, and interactive composition demo. Zero dependencies, pure HTML/CSS/JS.", {
    x: 0.8, y: 5.4, w: 10, h: 1.0,
    fontFace: Z.fontSans, fontSize: 15, color: "666666", lineSpacing: 22,
  });

  addSlideNum(slide, 6, TOTAL);
})();

// ══════════════════════════════════════════
//  SLIDE 7 — REVENUE MODEL
// ══════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { color: Z.cream };

  addLogo(slide);
  addLabel(slide, "REVENUE MODEL");

  slide.addText("Print-on-demand margins\nat art-gallery prices", {
    x: 0.8, y: 1.5, w: 10, h: 1.2,
    fontFace: Z.fontMono, fontSize: 30, bold: true,
    color: Z.charcoal, lineSpacing: 36,
  });

  // Price table
  const tableRows = [
    [{ text: "", options: { fill: { color: Z.charcoal } } },
     { text: "SMALL", options: { bold: true, color: "FFFFFF", fill: { color: Z.charcoal }, fontFace: Z.fontMono, fontSize: 9 } },
     { text: "MEDIUM", options: { bold: true, color: "FFFFFF", fill: { color: Z.charcoal }, fontFace: Z.fontMono, fontSize: 9 } },
     { text: "LARGE", options: { bold: true, color: "FFFFFF", fill: { color: Z.charcoal }, fontFace: Z.fontMono, fontSize: 9 } },
     { text: "XL", options: { bold: true, color: "FFFFFF", fill: { color: Z.charcoal }, fontFace: Z.fontMono, fontSize: 9 } }],
    [{ text: "Fine Art Paper", options: { bold: true } }, { text: "$89" }, { text: "$159" }, { text: "$249" }, { text: "$349" }],
    [{ text: "Canvas", options: { bold: true } }, { text: "$119" }, { text: "$199" }, { text: "$299" }, { text: "$419" }],
    [{ text: "Acrylic", options: { bold: true } }, { text: "$149" }, { text: "$249" }, { text: "$379" }, { text: "$499" }],
    [{ text: "Frame Add-on", options: { bold: true } },
     { text: "+$25\u201345", options: { color: Z.gold } },
     { text: "+$45\u201369", options: { color: Z.gold } },
     { text: "+$65\u201395", options: { color: Z.gold } },
     { text: "+$85\u2013119", options: { color: Z.gold } }],
  ];

  slide.addTable(tableRows, {
    x: 0.8, y: 3.0, w: 10.0,
    fontFace: Z.fontMono, fontSize: 12,
    color: Z.charcoal,
    border: { type: "solid", pt: 1, color: Z.charcoal },
    colW: [2.8, 1.8, 1.8, 1.8, 1.8],
    rowH: [0.45, 0.45, 0.45, 0.45, 0.45],
    align: "center",
    valign: "middle",
  });

  // Margin bullets
  const marginBullets = [
    "60\u201370% gross margin on prints (print-on-demand fulfillment)",
    "Frame upsell adds $25\u2013$119 per order at 80%+ margin",
    "Expansion: unlimited seeds \u2192 custom compositions \u2192 subscription tiers",
  ];

  marginBullets.forEach((b, i) => {
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.8, y: 5.7 + i * 0.55, w: 0.15, h: 0.15,
      fill: { color: Z.gold },
    });
    slide.addText(b, {
      x: 1.15, y: 5.55 + i * 0.55, w: 9, h: 0.5,
      fontFace: Z.fontSans, fontSize: 14, color: "555555",
    });
  });

  addSlideNum(slide, 7, TOTAL);
})();

// ══════════════════════════════════════════
//  SLIDE 8 — CLOSING
// ══════════════════════════════════════════
(() => {
  const slide = pptx.addSlide();
  slide.background = { color: Z.cream };

  addLogo(slide);

  // Concentric shapes (COLOR_STUDY, centered)
  addBauhausAccent(slide, "closing-center");

  // Thank you text over the art
  slide.addText("THANK YOU", {
    x: 0, y: 1.0, w: 13.33, h: 0.4,
    fontFace: Z.fontMono, fontSize: 11, bold: true,
    color: Z.gold, align: "center", letterSpacing: 3,
  });

  slide.addText("The algorithm is the brush.\nThe print is the canvas.\nThe wall is the gallery.", {
    x: 2, y: 4.5, w: 9.33, h: 1.8,
    fontFace: Z.fontMono, fontSize: 28, bold: true,
    color: Z.cream, align: "center", lineSpacing: 36,
  });

  // Contact
  slide.addText("zsignal.gallery  \u00B7  hello@zsignal.art", {
    x: 0, y: 6.5, w: 13.33, h: 0.35,
    fontFace: Z.fontMono, fontSize: 12, color: "888888", align: "center",
  });

  // Gold square + Built with
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 5.65, y: 6.95, w: 0.13, h: 0.13,
    fill: { color: Z.gold },
  });
  slide.addText("Built with ZIGNAL.ENGINE", {
    x: 5.85, y: 6.88, w: 3, h: 0.3,
    fontFace: Z.fontMono, fontSize: 9, color: "AAAAAA",
  });

  addSlideNum(slide, 8, TOTAL);
})();

// ── EXPORT ──
const outputPath = "ZSIGNAL-Gallery-Deck.pptx";
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log(`\n  Done. Created: ${outputPath}\n`);
}).catch(err => {
  console.error("Error:", err);
});
