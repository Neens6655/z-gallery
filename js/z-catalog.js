/**
 * ZSIGNAL Artwork Catalog
 * 26 deterministic artworks across 6 eras.
 * Each seed produces a unique, reproducible composition.
 */

const ZCatalog = (() => {
  const ERAS = {
    I:   { name: 'Organic Abstraction',  year: '2018',          archetype: 'FREE_FORM' },
    II:  { name: 'Systematic Order',     year: '2019',          archetype: 'GRID' },
    III: { name: 'Visual Music',         year: '2020',          archetype: 'REPETITION' },
    IV:  { name: 'Dynamic Tension',      year: '2021',          archetype: 'CONSTRUCTIVIST' },
    V:   { name: 'Color Dialogues',      year: '2022',          archetype: 'COLOR_STUDY' },
    VI:  { name: 'Data Landscapes',      year: '2023\u20132025', archetype: 'DOT_FIELD' },
    VII: { name: 'Sacred Geometry',      year: '2025\u2013present', archetype: 'ARABIAN_GEOMETRIC' }
  };

  const WORKS = [
    // ── ERA I: Organic Abstraction (FREE_FORM) ──
    { id: 'ff-001', title: 'Telephone Composition No. 3', year: 2018, era: 'I', palette: 'ZSIGNAL', seed: 31417, density: 0.5,
      description: 'A meditation on asymmetric balance. Overlapping planes of brick and blue create spatial tension, anchored by a luminous gold focal point\u2014a signal emerging from structured chaos.' },
    { id: 'ff-002', title: 'Flush Edge Study', year: 2018, era: 'I', palette: 'CLASSIC_BAUHAUS', seed: 62831, density: 0.6,
      description: 'Shapes pressed flush against the canvas edge dissolve the boundary between composition and frame. The gold circle persists as a navigational beacon.' },
    { id: 'ff-003', title: 'Counter-Weight in Terracotta', year: 2018, era: 'I', palette: 'WARM_EARTH', seed: 17320, density: 0.45,
      description: 'Earth tones anchor this composition in material warmth. A lone triangle in the lower register acts as gravitational counterpoint to the dominant plane above.' },
    { id: 'ff-004', title: 'Overlap Protocol', year: 2018, era: 'I', palette: 'ZSIGNAL', seed: 51413, density: 0.7,
      description: 'Dense layering of geometric planes explores the threshold between clarity and complexity. Striped blocks add rhythmic texture to the overlapping fields.' },
    { id: 'ff-005', title: 'Chromatic Anchor', year: 2018, era: 'I', palette: 'WARM_EARTH', seed: 27183, density: 0.3,
      description: 'Sparse placement reveals the power of a single dominant form. Ochre and olive planes hover against cream, with the gold circle grounding the composition.' },

    // ── ERA II: Systematic Order (GRID) ──
    { id: 'gr-001', title: 'Modular Field No. 7', year: 2019, era: 'II', palette: 'ZSIGNAL', seed: 41421, density: 0.5,
      description: 'A 4\u00d74 grid of geometric cells demonstrates the beauty of systematic constraint. Each cell contains a single primitive\u2014no two adjacent cells share a shape.' },
    { id: 'gr-002', title: 'Cell Variations in Steel', year: 2019, era: 'II', palette: 'COOL_STEEL', seed: 73205, density: 0.6,
      description: 'Cool blue-grey tones populate a modular grid. Split cells and outline variants create visual rhythm within strict structural order.' },
    { id: 'gr-003', title: 'Featured Cell Study', year: 2019, era: 'II', palette: 'CLASSIC_BAUHAUS', seed: 22360, density: 0.7,
      description: 'A golden 2\u00d72 featured cell disrupts the grid\u2019s regularity, demanding attention like a signal amid noise. Classic Bauhaus primaries fill the remaining cells.' },
    { id: 'gr-004', title: 'Dense Lattice', year: 2019, era: 'II', palette: 'ZSIGNAL', seed: 14142, density: 0.85,
      description: 'A 5\u00d75 grid with zero gutter creates a dense mosaic of interlocking shapes. The composition approaches textile pattern while maintaining geometric rigor.' },

    // ── ERA III: Visual Music (REPETITION) ──
    { id: 'rp-001', title: 'Linear Crescendo', year: 2020, era: 'III', palette: 'ZSIGNAL', seed: 16180, density: 0.5,
      description: 'Circles march in a horizontal procession, growing from whisper to shout. A dark anchor block at the canvas edge provides the downbeat.' },
    { id: 'rp-002', title: 'Wave Function No. 2', year: 2020, era: 'III', palette: 'WARM_EARTH', seed: 33166, density: 0.6,
      description: 'Shapes ride a sinusoidal path across the canvas, their sizes modulated by crescendo. Earth tones evoke the organic rhythm of landscape.' },
    { id: 'rp-003', title: 'Radial Fugue', year: 2020, era: 'III', palette: 'ZSIGNAL', seed: 69315, density: 0.65,
      description: 'Elements orbit a central axis in a circular arrangement, each voice entering at a different scale. Multiple layers create contrapuntal depth.' },
    { id: 'rp-004', title: 'Stacked Sequence in Grey', year: 2020, era: 'III', palette: 'MONOCHROME', seed: 43429, density: 0.4,
      description: 'A vertical column of shapes descends like a musical staff. Monochrome values create a study in rhythm through value alone, stripped of hue.' },
    { id: 'rp-005', title: 'Accelerando', year: 2020, era: 'III', palette: 'WARM_EARTH', seed: 57721, density: 0.8,
      description: 'Spacing decreases as size increases\u2014a visual acceleration toward a climactic density. The composition captures the urgency of tempo change.' },

    // ── ERA IV: Dynamic Tension (CONSTRUCTIVIST) ──
    { id: 'cn-001', title: 'Red Wedge No. 4', year: 2021, era: 'IV', palette: 'CONSTRUCTIVIST', seed: 26535, density: 0.5,
      description: 'Diagonal lines slice the white field with surgical precision. A red wedge drives into the composition\u2019s intersection point, channeling Lissitzky\u2019s revolutionary energy.' },
    { id: 'cn-002', title: 'Intersection Study', year: 2021, era: 'IV', palette: 'CONSTRUCTIVIST', seed: 84197, density: 0.6,
      description: 'Three lines at distinct angles create a web of tensions. Shapes emerge at crossing points like sparks from collision.' },
    { id: 'cn-003', title: 'Negative Space Manifesto', year: 2021, era: 'IV', palette: 'CONSTRUCTIVIST', seed: 50288, density: 0.3,
      description: 'The white field dominates. Minimal elements\u2014two lines, one wedge\u2014prove that dynamic energy requires not fullness, but strategic absence.' },
    { id: 'cn-004', title: 'Angular Momentum', year: 2021, era: 'IV', palette: 'CONSTRUCTIVIST', seed: 71828, density: 0.7,
      description: 'Dense diagonal intersections create a vortex of angular energy. Red and black elements cluster at collision points, suggesting explosive force.' },

    // ── ERA V: Color Dialogues (COLOR_STUDY) ──
    { id: 'cs-001', title: 'Homage to the Square: Signal', year: 2022, era: 'V', palette: 'CLASSIC_BAUHAUS', seed: 36787, density: 0.5,
      description: 'Nested squares shift subtly off-center via golden ratio displacement. Each ring\u2019s color creates a dialogue with its neighbors\u2014warm against cool, dark against light.' },
    { id: 'cs-002', title: 'Concentric Dialogue in Earth', year: 2022, era: 'V', palette: 'WARM_EARTH', seed: 94459, density: 0.55,
      description: 'Circles nest within circles. Terracotta, ochre, and olive rings demonstrate simultaneous contrast\u2014each color transformed by its adjacent neighbor.' },
    { id: 'cs-003', title: 'Chromatic Depth', year: 2022, era: 'V', palette: 'COOL_STEEL', seed: 23026, density: 0.45,
      description: 'Cool steel-blue rings recede into depth while silver advances. The composition creates an illusion of three-dimensional space through color interaction alone.' },
    { id: 'cs-004', title: 'Offset Meditation', year: 2022, era: 'V', palette: 'CLASSIC_BAUHAUS', seed: 60944, density: 0.65,
      description: 'The golden ratio offsets each nested form slightly, creating an asymmetric study of color relationships. Red, blue, and yellow engage in a primary color dialogue.' },

    // ── ERA VI: Data Landscapes (DOT_FIELD) ──
    { id: 'df-001', title: 'Field Study No. 1', year: 2023, era: 'VI', palette: 'ZSIGNAL', seed: 48432, density: 0.5,
      description: 'A grid of points is disrupted by geometric overlays. Dots within the overlay shapes transform\u2014changing color, size, or vanishing\u2014creating a data landscape from pure geometry.' },
    { id: 'df-002', title: 'Signal Detection', year: 2024, era: 'VI', palette: 'COOL_STEEL', seed: 77245, density: 0.7,
      description: 'Dense dot fields rendered in steel blue. Bold geometric shapes emerge as overlays, their boundaries defined by the transformation of underlying points.' },
    { id: 'df-003', title: 'Masked Grid in Monochrome', year: 2024, era: 'VI', palette: 'MONOCHROME', seed: 30258, density: 0.6,
      description: 'Black points on cream. Where overlay shapes intersect the grid, dots vanish\u2014creating negative-space figures from the systematic field.' },
    { id: 'df-004', title: 'Dense Emergence', year: 2025, era: 'VI', palette: 'ZSIGNAL', seed: 86602, density: 0.85,
      description: 'A 16\u00d716 point grid at maximum density. Overlapping geometric overlays create complex interactions\u2014some dots glow gold, others disappear, mapping signal from noise.' },

    // \u2500\u2500 ERA VII: Sacred Geometry (ARABIAN_GEOMETRIC) \u2500\u2500
    { id: 'ag-001', title: 'Alhambra Study No. 1', year: 2025, era: 'VII', palette: 'WARM_EARTH', seed: 19937, density: 0.6,
      description: 'A twelve-fold star tessellation inspired by the zellige tilework of the Alhambra. Concentric star layers in terracotta and ochre radiate from a central gold rosette, with girih lines extending to the canvas edges.' },
    { id: 'ag-002', title: 'Girih Field in Steel', year: 2025, era: 'VII', palette: 'COOL_STEEL', seed: 44721, density: 0.5,
      description: 'Interlocking six-pointed stars tile the canvas in a hexagonal grid, their cool blue-grey forms creating an infinite pattern. A central medallion anchors the composition in the tradition of Isfahan\u2019s Darb-e Imam shrine.' },
    { id: 'ag-003', title: 'Muqarnas Dome', year: 2026, era: 'VII', palette: 'ZSIGNAL', seed: 58309, density: 0.65,
      description: 'Concentric rings of geometric elements rotate with eight-fold symmetry, evoking the stalactite vaulting of Islamic architecture. Kites, triangles, and circles spiral outward from a gold central rosette.' },
    { id: 'ag-004', title: 'Infinite Lattice', year: 2026, era: 'VII', palette: 'CLASSIC_BAUHAUS', seed: 83205, density: 0.4,
      description: 'A sparse girih tile field rendered in Bauhaus primaries. The collision of Islamic geometric tradition with European modernism reveals their shared devotion to pure geometric abstraction.' },
    { id: 'ag-005', title: 'Star and Polygon in Monochrome', year: 2026, era: 'VII', palette: 'MONOCHROME', seed: 15443, density: 0.75,
      description: 'A dense star tessellation stripped to pure value. Without color, the mathematical structure of the pattern becomes the sole subject\u2014an exercise in geometric purity across civilizations.' }
  ];

  // Attach archetype from era
  WORKS.forEach(w => { w.archetype = ERAS[w.era].archetype; w.eraName = ERAS[w.era].name; });

  // Price matrices
  const BASE_PRICES = {
    paper:   { small: 89, medium: 159, large: 249, xl: 349 },
    canvas:  { small: 119, medium: 199, large: 299, xl: 419 },
    acrylic: { small: 149, medium: 249, large: 379, xl: 499 }
  };

  const FRAME_PRICES = {
    none:  { small: 0,  medium: 0,  large: 0,  xl: 0 },
    black: { small: 25, medium: 45, large: 65, xl: 85 },
    white: { small: 25, medium: 45, large: 65, xl: 85 },
    oak:   { small: 35, medium: 55, large: 79, xl: 99 },
    gold:  { small: 45, medium: 69, large: 95, xl: 119 }
  };

  const SIZE_LABELS = {
    small: '8\u00d710\u2033',
    medium: '16\u00d720\u2033',
    large: '24\u00d736\u2033',
    xl: '30\u00d740\u2033'
  };

  const FRAME_LABELS = {
    none: 'No Frame',
    black: 'Black',
    white: 'White',
    oak: 'Natural Oak',
    gold: 'Gold'
  };

  const MATERIAL_LABELS = {
    paper: 'Fine Art Paper',
    canvas: 'Canvas',
    acrylic: 'Acrylic'
  };

  function getById(id) {
    return WORKS.find(w => w.id === id) || null;
  }

  function getByEra(era) {
    return WORKS.filter(w => w.era === era);
  }

  function getByPalette(palette) {
    return WORKS.filter(w => w.palette === palette);
  }

  function getRelated(id, limit = 3) {
    const work = getById(id);
    if (!work) return [];
    return WORKS.filter(w => w.id !== id && w.era === work.era).slice(0, limit);
  }

  function calcPrice(size, material, frame) {
    const base = BASE_PRICES[material]?.[size] || 0;
    const frameP = FRAME_PRICES[frame]?.[size] || 0;
    return { base, frame: frameP, total: base + frameP };
  }

  return {
    ERAS, WORKS, BASE_PRICES, FRAME_PRICES,
    SIZE_LABELS, FRAME_LABELS, MATERIAL_LABELS,
    getById, getByEra, getByPalette, getRelated, calcPrice
  };
})();
