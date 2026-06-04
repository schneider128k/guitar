// Custom SVG fretboard renderer.
//
// Why custom (vs. fretboard.js rendering): we need a generous, first-class
// OPEN-STRING column with reliable click targets, full control over the look
// (graphite neck, metallic strings, inlays), and smooth reveal/hide for the
// Learn -> Quiz flow. Music theory still comes from FretboardSystem (music.js);
// this module is purely presentation + interaction.
//
// Public API (kept compatible with the rest of the app):
//   const fb = makeFretboard(el, { fretCount });
//   fb.on('click', ({ string, fret }) => { ... });
//   renderDots(fb, [{ string, fret, status, label }], { stagger });
//
// String numbering: 1 = high E (top row) ... 6 = low E (bottom row).

const SVGNS = 'http://www.w3.org/2000/svg';

const L = {
  stringGap: 40,
  topPad: 30,
  bottomPad: 34,
  labelW: 26, // tuning letters at far left
  openW: 60, // open-string column
  nutW: 9,
  fretW: 68,
  leftPad: 8,
  rightPad: 16,
  dotR: 16,
};

const OPEN_LABELS = ['E', 'B', 'G', 'D', 'A', 'E']; // strings 1..6 top->bottom
const SINGLE_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_MARKERS = [12, 24];

function geometry(fretCount) {
  const neckTop = L.topPad;
  const neckBottom = L.topPad + 5 * L.stringGap;
  const nutX = L.leftPad + L.labelW + L.openW;
  const fretsStart = nutX + L.nutW;
  const width = fretsStart + fretCount * L.fretW + L.rightPad;
  const height = neckBottom + L.bottomPad;

  const stringY = (s) => L.topPad + (s - 1) * L.stringGap;
  const dotX = (fret) =>
    fret === 0 ? L.leftPad + L.labelW + L.openW / 2 : fretsStart + (fret - 0.5) * L.fretW;
  const fretLineX = (fret) => fretsStart + fret * L.fretW;

  return { neckTop, neckBottom, nutX, fretsStart, width, height, stringY, dotX, fretLineX };
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of [].concat(children)) if (c) node.appendChild(c);
  return node;
}

function buildNeck(fretCount) {
  const g = geometry(fretCount);
  const svg = el('svg', {
    class: 'fb',
    viewBox: `0 0 ${g.width} ${g.height}`,
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
  });

  // Fingerboard panel
  svg.appendChild(
    el('rect', {
      class: 'fb-board',
      x: g.nutX,
      y: g.neckTop - 6,
      width: g.width - g.nutX - L.rightPad + 6,
      height: g.neckBottom - g.neckTop + 12,
      rx: 7,
    }),
  );

  // Inlays (single + double dots)
  const midY = (a, b) => (g.stringY(a) + g.stringY(b)) / 2;
  for (let f = 1; f <= fretCount; f++) {
    const cx = g.dotX(f);
    if (DOUBLE_MARKERS.includes(f)) {
      svg.appendChild(el('circle', { class: 'fb-inlay', cx, cy: midY(2, 3), r: 5 }));
      svg.appendChild(el('circle', { class: 'fb-inlay', cx, cy: midY(4, 5), r: 5 }));
    } else if (SINGLE_MARKERS.includes(f)) {
      svg.appendChild(el('circle', { class: 'fb-inlay', cx, cy: midY(3, 4), r: 5 }));
    }
  }

  // Fret wires
  for (let f = 1; f <= fretCount; f++) {
    svg.appendChild(
      el('line', {
        class: 'fb-fret',
        x1: g.fretLineX(f),
        y1: g.neckTop,
        x2: g.fretLineX(f),
        y2: g.neckBottom,
      }),
    );
  }

  // Nut
  svg.appendChild(
    el('rect', {
      class: 'fb-nut',
      x: g.nutX,
      y: g.neckTop - 6,
      width: L.nutW,
      height: g.neckBottom - g.neckTop + 12,
      rx: 2,
    }),
  );

  // Strings (thin -> thick from high E to low E)
  for (let s = 1; s <= 6; s++) {
    const y = g.stringY(s);
    svg.appendChild(
      el('line', {
        class: 'fb-string',
        x1: L.leftPad + L.labelW,
        y1: y,
        x2: g.width - L.rightPad,
        y2: y,
        'stroke-width': 1 + (s - 1) * 0.45,
      }),
    );
    // Tuning letter at far left
    const t = el('text', { class: 'fb-tuning', x: L.leftPad + 4, y: y + 4 });
    t.textContent = OPEN_LABELS[s - 1];
    svg.appendChild(t);
  }

  // Fret numbers (0 included)
  for (let f = 0; f <= fretCount; f++) {
    const t = el('text', { class: 'fb-fretnum', x: g.dotX(f), y: g.neckBottom + 22 });
    t.textContent = String(f);
    svg.appendChild(t);
  }

  // Click cells (one per string x fret, fret 0 = open). Transparent, on top.
  const cells = el('g', { class: 'fb-cells' });
  for (let s = 1; s <= 6; s++) {
    const y = g.stringY(s) - L.stringGap / 2;
    for (let f = 0; f <= fretCount; f++) {
      const x = f === 0 ? L.leftPad + L.labelW : g.fretsStart + (f - 1) * L.fretW;
      const w = f === 0 ? L.openW + L.nutW : L.fretW;
      const cell = el('rect', {
        class: 'fb-cell',
        x,
        y,
        width: w,
        height: L.stringGap,
        'data-string': s,
        'data-fret': f,
      });
      cells.appendChild(cell);
    }
  }
  svg.appendChild(cells);

  const dotsLayer = el('g', { class: 'fb-dots' });
  svg.appendChild(dotsLayer);

  return { svg, dotsLayer, geo: g };
}

export function makeFretboard(rootEl, { fretCount = 12 } = {}) {
  rootEl.innerHTML = '';
  const { svg, dotsLayer, geo } = buildNeck(fretCount);
  rootEl.appendChild(svg);

  const fb = {
    rootEl,
    svg,
    dotsLayer,
    geo,
    fretCount,
    nodes: new Map(), // key -> { group, dot, text, status, label }
  };

  fb.on = (eventName, handler) => {
    svg.addEventListener(eventName, (e) => {
      const cell = e.target.closest('.fb-cell');
      if (!cell) return;
      handler(
        { string: +cell.dataset.string, fret: +cell.dataset.fret },
        e,
      );
    });
    return fb;
  };

  return fb;
}

const keyOf = (d) => `${d.string}:${d.fret}`;

/**
 * Diff-render dots so existing ones don't re-animate on every update.
 * dots: [{ string, fret, status, label }]
 * opts.stagger: ms of incremental delay applied to newly added dots.
 */
export function renderDots(fb, dots, { stagger = 0 } = {}) {
  const desired = new Map(dots.map((d) => [keyOf(d), d]));

  // Remove stale
  for (const [key, entry] of fb.nodes) {
    if (!desired.has(key)) {
      entry.group.remove();
      fb.nodes.delete(key);
    }
  }

  let added = 0;
  for (const [key, d] of desired) {
    const cx = fb.geo.dotX(d.fret);
    const cy = fb.geo.stringY(d.string);
    const existing = fb.nodes.get(key);

    if (existing) {
      if (existing.status !== d.status) {
        existing.dot.setAttribute('class', `fb-dot is-${d.status}`);
        existing.status = d.status;
      }
      if (existing.label !== (d.label ?? '')) {
        existing.text.textContent = d.label ?? '';
        existing.label = d.label ?? '';
      }
      continue;
    }

    const group = el('g', { class: 'fb-dot-g' });
    if (stagger) group.style.animationDelay = `${added * stagger}ms`;
    const dot = el('circle', { class: `fb-dot is-${d.status}`, cx, cy, r: L.dotR });
    const text = el('text', { class: 'fb-dot-label', x: cx, y: cy + 5 });
    text.textContent = d.label ?? '';
    group.appendChild(dot);
    group.appendChild(text);
    fb.dotsLayer.appendChild(group);
    fb.nodes.set(key, { group, dot, text, status: d.status, label: d.label ?? '' });
    added++;
  }
  return fb;
}

/** Remove every dot. */
export function clearDots(fb) {
  for (const [, entry] of fb.nodes) entry.group.remove();
  fb.nodes.clear();
}
