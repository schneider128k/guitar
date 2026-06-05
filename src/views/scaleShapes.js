// Guided mini-tour of the 5 major-scale (CAGED) shapes.
//
// Teaching order, built to remove the classic confusion one layer at a time:
//   1. The letters C-A-G-E-D ARE five open chords you already play (tap each).
//   2. Take one chord you know (open E).
//   3. Slide that same shape up the neck — it's now "movable" (a new chord).
//   4. A whole major scale is just those 5 shapes' worth of notes...
//   5-9. ...one window per shape, with the chord lit up inside it.
//   10. The windows overlap into one connected map.
//   11. Where to start.
// Consistent colour key throughout: amber = root, teal = other chord tones,
// faint = scale-only notes, outlined = note shared between two windows.
import { makeFretboard, renderDots } from '../ui/fretboard.js';
import { cagedBox, CAGED_BOXES, noteAt, noteShort } from '../music.js';

const KEY = 'C'; // fixed key keeps the tour concrete; the shapes are movable.

// The 5 OPEN chords you already know, as [string, fret] grips, with the chroma
// of their root note (C=0, D=2, E=4, G=7, A=9). These live at the nut.
const OPEN_CHORDS = {
  C: { grip: [[5, 3], [4, 2], [3, 0], [2, 1], [1, 0]], root: 0, tab: 'x32010' },
  A: { grip: [[5, 0], [4, 2], [3, 2], [2, 2], [1, 0]], root: 9, tab: 'x02220' },
  G: { grip: [[6, 3], [5, 2], [4, 0], [3, 0], [2, 0], [1, 3]], root: 7, tab: '320003' },
  E: { grip: [[6, 0], [5, 2], [4, 2], [3, 1], [2, 0], [1, 0]], root: 4, tab: '022100' },
  D: { grip: [[4, 0], [3, 2], [2, 3], [1, 2]], root: 2, tab: 'xx0232' },
};

// The same 5 grips moved up the neck so they all make a C major chord. Verified
// to be C/E/G chord tones sitting inside the matching scale box.
const CHORD_GRIPS = {
  C: [[5, 3], [4, 2], [3, 0], [2, 1], [1, 0]], // open C at the nut
  A: [[5, 3], [4, 5], [3, 5], [2, 5], [1, 3]], // open A barred at 3
  G: [[6, 8], [5, 7], [4, 5], [3, 5], [2, 5], [1, 8]], // open G slid to 5
  E: [[6, 8], [5, 10], [4, 10], [3, 9], [2, 8], [1, 8]], // open E barred at 8
  D: [[4, 10], [3, 12], [2, 13], [1, 12]], // open D slid to 10
};
const MOVED_NOTE = {
  C: 'right at the nut',
  A: 'moved up to the 3rd fret',
  G: 'moved up to the 5th fret',
  E: 'moved up to the 8th fret',
  D: 'moved up to the 10th fret',
};

function maxFretOf(dots) {
  return dots.reduce((m, d) => Math.max(m, d.fret), 0);
}

// A bare chord grip: root amber, other chord tones teal, note names on each.
// These major chords are spelled with sharps (A major = A C♯ E), so show the
// sharp glyph rather than the board layer's default flats (Db).
function chordDots(grip, rootChroma) {
  return grip.map(([s, f]) => {
    const n = noteAt(s, f);
    return { string: s, fret: f, status: n.chroma === rootChroma ? 'root' : 'chord', label: noteShort(n.note) };
  });
}

// The open E AND the same shape moved up to make a C — both on one neck, so the
// identical finger pattern is visible in two places ("movable").
function movableDemoDots() {
  return [
    ...chordDots(OPEN_CHORDS.E.grip, 4), // open E (root E)
    ...chordDots(CHORD_GRIPS.E, 0), // same shape up the neck → C (root C)
  ];
}

// A whole scale box (the shape to memorize) with its chord coloured in: chord
// roots amber, other chord tones teal, the rest of the scale full-size graphite
// — all the same size so the shape reads clearly. The translated open-chord
// FINGER shape (notes that were fretted in the open chord) gets a ring that
// FLASHES for ~2s then fades — a quick pointer, nothing persistent.
function gripBoxDots(shape) {
  const grip = new Set(CHORD_GRIPS[shape].map(([s, f]) => `${s}:${f}`));
  const openStrings = new Set(
    OPEN_CHORDS[shape].grip.filter(([, f]) => f === 0).map(([s]) => s),
  );
  const scale = [];
  const chord = [];
  for (const p of cagedBox(KEY, shape)) {
    if (grip.has(`${p.string}:${p.fret}`)) {
      chord.push({
        string: p.string,
        fret: p.fret,
        status: p.degree === 1 ? 'root' : 'chord',
        label: p.note,
        ring: !openStrings.has(p.string), // flash only the moved finger shape
      });
    } else {
      scale.push({ string: p.string, fret: p.fret, status: 'default', label: '' });
    }
  }
  return [...scale, ...chord]; // scale reveals first, then the chord flashes
}

// Every C-major note the 5 boxes cover — "the whole scale at once".
function fullScaleDots() {
  const all = new Map();
  for (const sh of CAGED_BOXES)
    for (const p of cagedBox(KEY, sh)) all.set(`${p.string}:${p.fret}`, p);
  return [...all.values()].map((p) => ({
    string: p.string,
    fret: p.fret,
    status: p.degree === 1 ? 'root' : 'default',
    label: p.note,
  }));
}

// Two neighbouring boxes overlaid: A = amber, B = teal, both = outlined.
function overlapDots(shapeA, shapeB) {
  const map = new Map();
  for (const p of cagedBox(KEY, shapeA)) map.set(`${p.string}:${p.fret}`, { p, side: 'a' });
  for (const p of cagedBox(KEY, shapeB)) {
    const k = `${p.string}:${p.fret}`;
    if (map.has(k)) map.get(k).side = 'both';
    else map.set(k, { p, side: 'b' });
  }
  return [...map.values()].map(({ p, side }) => ({
    string: p.string,
    fret: p.fret,
    status: side === 'both' ? 'shared' : side === 'a' ? 'shape-a' : 'shape-b',
    label: '',
  }));
}

export function initScaleShapes(container) {
  let openChordShape = 'C'; // which open chord the interactive first step shows

  const STEPS = [
    {
      title: 'The 5 shapes are 5 chords you already know',
      body: `“CAGED” is just a word spelled from five open chords you can already
        play: <strong>C, A, G, E, D</strong> (all major). That’s the whole meaning
        of the letters — five of the first chords every beginner learns. Tap each
        to see the chord you know. <em>Amber = the root, teal = the chord’s other
        notes.</em>`,
      controls: (el) => {
        el.innerHTML =
          `<div class="key-buttons">` +
          CAGED_BOXES.map(
            (s) =>
              `<button class="choice ss-chordbtn ${s === openChordShape ? 'active' : ''}" data-s="${s}">${s}</button>`,
          ).join('') +
          `</div><span class="ss-chordname">Open ${openChordShape} major (<code>${OPEN_CHORDS[openChordShape].tab}</code>)</span>`;
        el.querySelectorAll('.ss-chordbtn').forEach((b) =>
          b.addEventListener('click', () => {
            openChordShape = b.dataset.s;
            render();
          }),
        );
      },
      dots: () => chordDots(OPEN_CHORDS[openChordShape].grip, OPEN_CHORDS[openChordShape].root),
    },
    {
      title: 'Step 1 — take a chord you know',
      body: `Here’s the open <strong>E chord</strong> — nothing new, you play this
        already. The amber dot is its root (E); the teal dots are the other chord
        tones. Just keep this shape in your eye for the next step.`,
      dots: () => chordDots(OPEN_CHORDS.E.grip, 4),
    },
    {
      title: 'Step 2 — slide it up: now it’s “movable”',
      body: `Now barre that <em>exact same</em> finger pattern with your index finger
        and slide it up the neck. Down at the nut it’s an <strong>E</strong>; up at
        the 8th fret the identical shape rings a <strong>C</strong>. Same shape,
        new chord — that’s why we still call it “the E shape” even when it’s playing
        a C. <em>The letter names your hand’s shape, not the chord you hear.</em>`,
      dots: movableDemoDots,
    },
    {
      title: 'So a major scale is just those 5 shapes',
      body: `Each of the five chord shapes carries a chunk of the major scale around
        it. Stack all five up the neck and you get <em>every</em> note of C major
        (C D E F G A B), shown here. Overwhelming as one blob — so we learn it
        <strong>one shape at a time</strong>.`,
      dots: fullScaleDots,
    },
    ...CAGED_BOXES.map((shape, i) => {
      const intro =
        shape === 'C'
          ? `The notes that <strong>flash</strong> are the <strong>C chord</strong>
             finger shape — your open C grip (<code>${OPEN_CHORDS.C.tab}</code>),
             right at the nut.`
          : `The notes that <strong>flash</strong> are your open
             <strong>${shape}</strong> grip (<code>${OPEN_CHORDS[shape].tab}</code>)
             <strong>${MOVED_NOTE[shape]}</strong> to make a C — the open-chord finger
             shape, moved up.`;
      const extra =
        shape === 'E'
          ? ' (It’s the shape behind an F barre chord.) Most useful one — root on the low-E string.'
          : '';
      return {
        title: `Shape ${i + 1} of 5 — the ${shape} shape`,
        body: `${intro} The grey dots are the rest of the C-major scale — the full shape to memorize.${extra}`,
        dots: () => gripBoxDots(shape),
      };
    }),
    {
      title: 'They lock into one map',
      body: `The five always appear in the <strong>same order</strong> up the neck —
        <strong>C → A → G → E → D</strong>, then C again at the 12th fret — and
        neighbours <strong>overlap</strong>. Here the C shape (amber) and the next
        one, the A shape (teal), meet: the outlined notes belong to <em>both</em>.
        The end of one window <em>is</em> the start of the next — one connected map,
        not five islands.`,
      dots: () => overlapDots('C', 'A'),
    },
    {
      title: 'Where to start (don’t cram all 5)',
      body: `Begin with the <strong>E shape</strong> (lit up here) and the
        <strong>A shape</strong>. Their roots live on the low-E and A strings — the
        same anchors as your most common barre chords and the first pentatonic box
        most players learn. Nail those two, then add G, C and D to join up the
        neck. Want other keys? Every shape is movable — try them in the
        <strong>CAGED Shapes</strong> tab.`,
      dots: () => gripBoxDots('E'),
    },
  ];

  let i = 0;

  container.innerHTML = `
    <section class="view ss">
      <div class="ss-head">
        <h2 class="ss-title">The 5 major-scale shapes</h2>
        <p class="ss-sub">A quick guided tour — why there are five, and how they click together. (In C major.)</p>
      </div>
      <div class="gp-progress"><div class="gp-progress-bar js-bar"></div></div>
      <p class="ss-step js-step"></p>

      <h3 class="ss-lesson-title js-title"></h3>
      <div class="ss-controls js-controls"></div>
      <div class="board ss-board js-board"></div>
      <div class="ss-note js-body"></div>

      <div class="ss-nav">
        <button class="ghost js-back">← Back</button>
        <span class="ss-pips js-pips"></span>
        <button class="primary js-next">Next →</button>
      </div>
    </section>`;

  const $ = (s) => container.querySelector(s);
  const barEl = $('.js-bar');
  const stepEl = $('.js-step');
  const titleEl = $('.js-title');
  const controlsEl = $('.js-controls');
  const boardEl = $('.js-board');
  const bodyEl = $('.js-body');
  const backBtn = $('.js-back');
  const nextBtn = $('.js-next');
  const pipsEl = $('.js-pips');

  function render() {
    const step = STEPS[i];
    if (step.controls) step.controls(controlsEl);
    else controlsEl.innerHTML = '';

    const dots = step.dots();
    const fb = makeFretboard(boardEl, { fretCount: Math.max(5, maxFretOf(dots) + 1) });
    renderDots(fb, dots, { stagger: 22 });

    barEl.style.width = `${((i + 1) / STEPS.length) * 100}%`;
    stepEl.textContent = `Step ${i + 1} of ${STEPS.length}`;
    titleEl.textContent = step.title;
    bodyEl.innerHTML = step.body;
    pipsEl.innerHTML = STEPS.map(
      (_, k) => `<span class="pip ${k <= i ? 'on' : ''}"></span>`,
    ).join('');

    backBtn.disabled = i === 0;
    nextBtn.textContent = i === STEPS.length - 1 ? 'Start over' : 'Next →';
  }

  backBtn.addEventListener('click', () => {
    if (i > 0) i--;
    render();
  });
  nextBtn.addEventListener('click', () => {
    i = i === STEPS.length - 1 ? 0 : i + 1;
    render();
  });

  render();
}
