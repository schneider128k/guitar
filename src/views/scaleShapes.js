// Guided mini-tour of the 5 major-scale (CAGED) shapes.
//
// The whole point is the "click": a major scale is ONE set of notes seen
// through 5 overlapping windows, and each window is framed around a chord shape
// you already know — C, A, G, E, D. Crucially these are movable chord GRIPS
// (the open-chord fingerings, barred and slid up the neck), not the open chords
// sitting at the nut. So instead of asking you to picture them, each step LIGHTS
// UP the actual chord inside its scale box.
import { makeFretboard, renderDots } from '../ui/fretboard.js';
import { cagedBox, CAGED_BOXES, noteAt } from '../music.js';

const KEY = 'C'; // fixed key keeps the tour concrete; the shapes are movable.

// The 5 CAGED chord grips that make a C, as [string, fret]. Each is one of the
// open-chord fingerings transposed up the neck so its root lands on C. Verified
// to be C/E/G chord tones sitting inside the matching scale box.
const CHORD_GRIPS = {
  C: [[5, 3], [4, 2], [3, 0], [2, 1], [1, 0]], // open C (x32010), at the nut
  A: [[5, 3], [4, 5], [3, 5], [2, 5], [1, 3]], // open A barred at 3 (x35553)
  G: [[6, 8], [5, 7], [4, 5], [3, 5], [2, 5], [1, 8]], // open G slid to 5 (8-7-5-5-5-8)
  E: [[6, 8], [5, 10], [4, 10], [3, 9], [2, 8], [1, 8]], // open E barred at 8
  D: [[4, 10], [3, 12], [2, 13], [1, 12]], // open D slid to 10 (xx-10-12-13-12)
};
const OPEN_E = [[6, 0], [5, 2], [4, 2], [3, 1], [2, 0], [1, 0]]; // the open E chord you know

// Plain-tab strings shown in the captions, so you can play the open chord too.
const OPEN_TAB = { C: 'x32010', A: 'x02220', G: '320003', E: '022100', D: 'xx0232' };
const BARRE_NOTE = {
  C: 'right at the nut',
  A: 'barred at the 3rd fret',
  G: 'slid up to the 5th fret',
  E: 'barred at the 8th fret',
  D: 'slid up to the 10th fret',
};

function maxFretOf(dots) {
  return dots.reduce((m, d) => Math.max(m, d.fret), 0);
}

// A scale box with its chord grip lit up: roots amber, the grip's other chord
// tones teal, and the rest of the scale faint (graphite, unlabelled) around it.
function gripBoxDots(shape) {
  const grip = new Set(CHORD_GRIPS[shape].map(([s, f]) => `${s}:${f}`));
  return cagedBox(KEY, shape).map((p) => {
    const inGrip = grip.has(`${p.string}:${p.fret}`);
    return {
      string: p.string,
      fret: p.fret,
      status: inGrip ? (p.degree === 1 ? 'root' : 'chord') : 'default',
      label: inGrip ? p.note : '',
    };
  });
}

// The same E shape twice: open E at the nut (teal) and that grip barred up the
// neck to make a C (amber) — the "movable" idea in one picture.
function movableDemoDots() {
  const dots = OPEN_E.map(([s, f]) => ({
    string: s,
    fret: f,
    status: 'shape-b',
    label: noteAt(s, f).note,
  }));
  for (const [s, f] of CHORD_GRIPS.E) {
    dots.push({ string: s, fret: f, status: 'shape-a', label: noteAt(s, f).note });
  }
  return dots;
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

// Two neighbouring boxes overlaid so the overlap is obvious: A = amber,
// B = teal, notes in BOTH get an outlined "shared" dot.
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
  const STEPS = [
    {
      title: 'It’s one scale, seen 5 ways',
      body: `A major scale is just <strong>7 notes</strong> that repeat up the whole
        neck — for C major: C D E F G A B. Here’s <em>every</em> one of them at
        once 👇 Overwhelming, right? So we don’t learn it as a blur. We slice the
        neck into <strong>5 windows</strong>, and each window is built around a
        chord shape you already know — <strong>C, A, G, E, D</strong>. That’s the
        “CAGED” system: five chords give five scale shapes.`,
      dots: fullScaleDots,
    },
    {
      title: 'First: a “shape” is a movable chord',
      body: `The names C-A-G-E-D are five chord <strong>shapes</strong> — the finger
        grips you know as open chords. The magic: keep the grip, slide it up the
        neck, barre with your index finger, and it becomes a new chord. Here’s the
        same <strong>E shape</strong> twice — your open <strong>E</strong> at the
        nut (teal), and that exact grip barred at the 8th fret, now a
        <strong>C</strong> (amber). So you won’t have to picture anything: every
        step below <strong>lights up the chord inside the shape</strong>.`,
      dots: movableDemoDots,
    },
    ...CAGED_BOXES.map((shape, i) => ({
      title: `Shape ${i + 1} of 5 — the ${shape} shape`,
      body:
        shape === 'C'
          ? `The bold dots are the <strong>C chord</strong> — your open C grip
             (<code>${OPEN_TAB.C}</code>), right at the nut. <strong>Amber</strong> =
             the roots (the C’s), <strong>teal</strong> = the chord’s other notes.
             The faint dots are the rest of the C-major scale wrapping around the
             grip you already play.`
          : `The bold dots are your open <strong>${shape}</strong> grip
             (<code>${OPEN_TAB[shape]}</code>) <strong>${BARRE_NOTE[shape]}</strong>,
             which makes a C. That’s the “${shape} shape” — same fingers as the open
             chord, just moved up. Amber = roots, teal = the other chord tones, and
             the faint dots are the scale around it.${
               shape === 'E'
                 ? ' (An F barre chord is this same shape at the 1st fret.) This one’s the most useful — its root is on the low-E string.'
                 : ''
             }`,
      dots: () => gripBoxDots(shape),
    })),
    {
      title: 'They lock into one map',
      body: `The five always appear in the <strong>same order</strong> up the neck —
        <strong>C → A → G → E → D</strong>, then C again at the 12th fret — and
        neighbours <strong>overlap</strong>. Here the C shape (amber) and the next
        one, the A shape (teal), meet: the outlined notes belong to <em>both</em>.
        The end of one window <em>is</em> the start of the next, so it’s really
        <strong>one connected map</strong>, not five islands.`,
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
  const boardEl = $('.js-board');
  const bodyEl = $('.js-body');
  const backBtn = $('.js-back');
  const nextBtn = $('.js-next');
  const pipsEl = $('.js-pips');

  function render() {
    const step = STEPS[i];
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
