// Guided mini-tour of the 5 major-scale (CAGED) shapes.
//
// The whole point is the "click": a major scale is ONE set of notes seen
// through 5 overlapping windows, and each window is framed around a chord shape
// you already know — C, A, G, E, D. The tour shows the full scale first, then
// each shape, then how they lock into one connected map, then where to start.
import { makeFretboard, renderDots } from '../ui/fretboard.js';
import { cagedBox, CAGED_BOXES } from '../music.js';

const KEY = 'C'; // fixed key keeps the tour concrete; the shapes are movable.

// Roots-of-each-shape, in plain string names, for the captions.
const SHAPE_ROOTS = {
  C: 'the A and B strings',
  A: 'the A and G strings',
  G: 'the low-E, G and high-E strings',
  E: 'the low-E, D and high-E strings',
  D: 'the D and B strings',
};

function maxFretOf(dots) {
  return dots.reduce((m, d) => Math.max(m, d.fret), 0);
}

function boxDots(shape, { label = 'note' } = {}) {
  return cagedBox(KEY, shape).map((p) => ({
    string: p.string,
    fret: p.fret,
    status: p.degree === 1 ? 'root' : 'default',
    label: label === 'note' ? p.note : '',
  }));
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
        neck into <strong>5 windows</strong> — and here’s the trick that makes
        them stick: <strong>each window is built around a chord shape you already
        know</strong>. Five chords — <strong>C, A, G, E, D</strong> — give five
        scale shapes. That’s the “CAGED” system.`,
      dots: fullScaleDots,
    },
    ...CAGED_BOXES.map((shape, i) => ({
      title: `Shape ${i + 1} of 5 — the ${shape} shape`,
      body: `This window wraps around the open <strong>${shape} chord</strong>. The
        root notes (the C’s, in amber) sit on <strong>${SHAPE_ROOTS[shape]}</strong>.
        Picture the chord, then the scale notes fall right around your fingers.
        Slide the entire shape up the neck and it plays a different key — that’s
        what “movable” means.`,
      dots: () => boxDots(shape),
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
      body: `Begin with the <strong>E shape</strong> (shown) and the
        <strong>A shape</strong>. Their roots live on the low-E and A strings — the
        same anchors as your most common barre chords and the first pentatonic box
        most players learn. Nail those two, then add G, C and D to join up the
        neck. Want other keys? Every shape is movable — try them in the
        <strong>CAGED Shapes</strong> tab.`,
      dots: () => boxDots('E'),
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
