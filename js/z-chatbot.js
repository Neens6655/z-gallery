/**
 * ZSIGNAL Floating Art Historian Chatbot
 * Injects FAB button + chat panel into every page.
 */
(function () {
  'use strict';

  // ── KNOWLEDGE BASE ──────────────────────────────────────────
  const KB = {
    bauhaus: 'The Bauhaus school (1919–1933) unified art, craft, and technology. ZSIGNAL draws directly from its masters: Moholy-Nagy\'s spatial planes (FREE_FORM), Mondrian\'s grids (GRID), Klee\'s rhythmic compositions (REPETITION), Lissitzky\'s constructivist energy (CONSTRUCTIVIST), and Albers\' color interaction studies (COLOR_STUDY). Each archetype is a computational tribute to these pioneers.',
    'era i': 'Era I: Organic Abstraction (2018) explores overlapping transparent planes inspired by Moholy-Nagy\'s photograms and telephone paintings. Shapes extend boldly beyond canvas edges, creating spatial depth through overlap and transparency.',
    'era ii': 'Era II: Systematic Order (2019) is rooted in Mondrian\'s asymmetric grids and Kandinsky\'s floating rectangles. Thick black dividing lines create cells of varying proportion.',
    'era iii': 'Era III: Visual Music (2020) translates musical concepts into visual rhythm. Inspired by Paul Klee\'s "Rhythmisches" and Bridget Riley\'s optical art.',
    'era iv': 'Era IV: Dynamic Tension (2021) channels El Lissitzky\'s revolutionary constructivism. The red wedge drives into the composition\'s intersection point.',
    'era v': 'Era V: Color Dialogues (2022) is a computational homage to Josef Albers\' "Homage to the Square" series. Nested squares with color chosen for maximum interaction.',
    'era vi': 'Era VI: Data Landscapes (2023–2025) merges Herbert Bayer\'s experiments with Victor Vasarely\'s optical effects. Mathematical dot grids modulate to create form and depth.',
    'era vii': 'Era VII: Sacred Geometry (2025–present) introduces Islamic geometric art into the ZSIGNAL vocabulary. Radial symmetry, star tessellations, and muqarnas patterns.',
    engine: 'The ZSIGNAL engine generates SVG compositions using a seeded pseudo-random number generator (mulberry32). Each artwork is defined by four parameters: archetype, palette, seed, and density. Same inputs always produce the same output — deterministic art.',
    lissitzky: 'El Lissitzky (1890–1941) was a Russian artist who pioneered constructivist graphic design. His "Beat the Whites with the Red Wedge" (1920) is one of the most iconic political posters.',
    albers: 'Josef Albers (1888–1976) spent 25 years creating his "Homage to the Square" series — hundreds of paintings exploring how colors interact when placed next to each other.',
    'moholy-nagy': 'Moholy-Nagy (1895–1946) created compositions by telephone — giving precise instructions to a sign painter. ZSIGNAL operates on the same principle.',
    klee: 'Paul Klee (1879–1940) treated visual composition like music, with rhythm, tempo, and counterpoint. His "Rhythmisches" (1930) uses colored rectangles in wave-like patterns.',
    mondrian: 'Piet Mondrian (1872–1944) reduced painting to essentials: horizontal and vertical lines, primary colors, and white.',
    palette: 'ZSIGNAL offers 6 palettes: ZSIGNAL (gold & cream), CLASSIC_BAUHAUS (red/blue/yellow), CONSTRUCTIVIST (red & black), WARM_EARTH (terracotta), COOL_STEEL (blue-grey), and MONOCHROME. Each references a different tradition.',
    islamic: 'Islamic geometric art, spanning 1400+ years, is based on compass-and-straightedge construction. Radial symmetry, star-and-polygon tessellations, and infinite tiling logic.',
    seed: 'A seed is a number that determines every aspect of the artwork. Same seed + same parameters = identical artwork every time. Seeds are signatures — unique, verifiable, permanent.',
    collect: 'Every canonical work has 30 limited editions. Studio creations are limited to 10 prints each. Claim a seed to add it to your collection.',
    remix: 'Remixing lets you take an existing artwork\'s parameters and modify them in the studio. The remix lineage shows the evolution from original to derivative.',
  };

  function findResponse(q) {
    const lower = q.toLowerCase();
    for (const [key, val] of Object.entries(KB)) {
      if (lower.includes(key)) return val;
    }
    // Try catalog works if ZCatalog is available
    if (typeof ZCatalog !== 'undefined' && ZCatalog.WORKS) {
      const matchedWork = ZCatalog.WORKS.find(w =>
        lower.includes(w.title.toLowerCase()) || lower.includes(w.id)
      );
      if (matchedWork) {
        return `"${matchedWork.title}" (${matchedWork.year}, Era ${matchedWork.era}: ${matchedWork.eraName}) — ${matchedWork.description}`;
      }
      const eraMatch = lower.match(/era\s*(i{1,3}v?|vi{0,2}|[1-7])/i);
      if (eraMatch) {
        const eraMap = { '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI', '7': 'VII' };
        const eraKey = eraMap[eraMatch[1]] || eraMatch[1].toUpperCase();
        const eraInfo = ZCatalog.ERAS && ZCatalog.ERAS[eraKey];
        if (eraInfo) return KB['era ' + eraKey.toLowerCase()] || `Era ${eraKey}: ${eraInfo.name} (${eraInfo.year}) uses the ${eraInfo.archetype} archetype.`;
      }
    }
    if (lower.includes('how') && lower.includes('work')) return KB.engine;
    if (lower.includes('color') || lower.includes('colour')) return KB.palette;
    if (lower.includes('print') || lower.includes('buy') || lower.includes('order')) return KB.collect;
    if (lower.includes('geometric') || lower.includes('arabian') || lower.includes('islamic')) return KB.islamic;
    if (lower.includes('sacred')) return KB['era vii'];
    if (lower.includes('seed')) return KB.seed;
    if (lower.includes('remix') || lower.includes('fork')) return KB.remix;
    if (lower.includes('collect')) return KB.collect;
    return 'I can discuss any of the 7 eras, the 31 artworks, the artists who inspired them (Moholy-Nagy, Mondrian, Klee, Lissitzky, Albers), seeds, remixing, or how the engine works. Try asking about a specific era or artist!';
  }

  // ── INJECT HTML ─────────────────────────────────────────────
  function init() {
    // Don't inject twice
    if (document.getElementById('z-chatbot-fab')) return;

    const fab = document.createElement('button');
    fab.id = 'z-chatbot-fab';
    fab.className = 'z-fab';
    fab.setAttribute('aria-label', 'Ask the ZSIGNAL Art Historian');
    fab.setAttribute('title', 'Ask the Art Historian');
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
      <span class="z-fab-badge" aria-hidden="true"></span>
    `;

    const panel = document.createElement('div');
    panel.id = 'z-chatbot-panel';
    panel.className = 'z-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'ZSIGNAL Art Historian Chat');
    panel.innerHTML = `
      <div class="z-chat-header">
        <span>ZSIGNAL ART HISTORIAN</span>
        <button class="z-chat-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="z-chat-messages" id="z-fab-messages" aria-live="polite" aria-label="Chat messages">
        <div class="z-chat-msg bot">Ask me about any artwork, era, or artist in the ZSIGNAL collection. What would you like to know?</div>
      </div>
      <div class="z-chat-suggestions">
        <button class="z-chat-suggestion" data-q="What is the Bauhaus influence?">Bauhaus</button>
        <button class="z-chat-suggestion" data-q="Tell me about Era VII Sacred Geometry">Sacred Geometry</button>
        <button class="z-chat-suggestion" data-q="How does the engine generate art?">How it works</button>
        <button class="z-chat-suggestion" data-q="What makes Albers color studies special?">Albers &amp; Color</button>
      </div>
      <div class="z-chat-input-row">
        <input type="text" class="z-chat-input" id="z-fab-input" placeholder="Ask anything about the art..." autocomplete="off" aria-label="Ask the art historian">
        <button class="z-chat-send" id="z-fab-send">ASK</button>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // ── WIRE TOGGLE ──────────────────────────────────────────
    fab.addEventListener('click', () => {
      const isOpen = panel.classList.contains('open');
      panel.classList.toggle('open', !isOpen);
      fab.classList.toggle('open', !isOpen);
      fab.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        setTimeout(() => panel.querySelector('.z-chat-input').focus(), 50);
      }
    });

    panel.querySelector('.z-chat-close').addEventListener('click', () => {
      panel.classList.remove('open');
      fab.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
      fab.focus();
    });

    // Close on Escape
    panel.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        panel.classList.remove('open');
        fab.classList.remove('open');
        fab.setAttribute('aria-expanded', 'false');
        fab.focus();
      }
    });

    // ── CHAT LOGIC ───────────────────────────────────────────
    const msgs = panel.querySelector('#z-fab-messages');
    const input = panel.querySelector('#z-fab-input');
    const send = panel.querySelector('#z-fab-send');

    function addMsg(text, isUser) {
      const m = document.createElement('div');
      m.className = 'z-chat-msg ' + (isUser ? 'user' : 'bot');
      m.textContent = text;
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function handleChat() {
      const q = input.value.trim();
      if (!q) return;
      addMsg(q, true);
      input.value = '';

      const typing = document.createElement('div');
      typing.className = 'z-chat-msg typing';
      typing.textContent = 'Thinking...';
      msgs.appendChild(typing);
      msgs.scrollTop = msgs.scrollHeight;

      setTimeout(() => {
        typing.remove();
        addMsg(findResponse(q), false);
      }, 500 + Math.random() * 700);
    }

    send.addEventListener('click', handleChat);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleChat(); });

    panel.querySelectorAll('.z-chat-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.q;
        handleChat();
      });
    });
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
