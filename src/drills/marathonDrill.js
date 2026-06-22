// Marathon recall drill — an endless, random-note quiz.
//
// Used by Guided Path's "Random naturals" / "Random sharps & flats" lessons and
// the single-string root drills (low E / A strings, for barre & power chords).
//
// Each round shuffles the whole pool and quizzes every note in it (no
// replacement), so every note — including the ones a random-with-replacement
// picker would routinely skip — is guaranteed to come up. When a round finishes
// it rolls straight into a fresh one; the student keeps going until they press
// Stop. The lesson is marked complete the first time a full round is cleared.
//
// opts:
//   pool         : array of note names to draw from (naturals or accidentals)
//   maxFret      : number (ignored when `positions` is given — derived from it instead)
//   strings      : optional array of string numbers to restrict to (e.g. [6] low E,
//                  [5] A, [6, 5] both). Clicks off these strings are ignored.
//   stringsLabel : optional human label for the restriction (e.g. 'low E string')
//   positions    : optional explicit [{string,fret}] to restrict to instead of
//                  strings/maxFret — e.g. one CAGED box's note positions, so the
//                  student practices "find this note inside this shape" rather
//                  than anywhere on the neck.
//   study        : optional — show a "memorize the whole map" screen before quizzing
//   onComplete(result) : called once, when the first full round is finished {perfect}
//   onStop()           : "Stop — back to path" handler
import { makeFretboard, renderDots, clearDots } from '../ui/fretboard.js';
import {
  noteAt,
  findPositions,
  shuffle,
  toSharp,
  noteShort,
  noteLabel,
  chromaOf,
} from '../music.js';

const posKey = (p) => `${p.string}:${p.fret}`;

export function createMarathonDrill(container, opts = {}) {
  const pool = opts.pool;
  const positions = opts.positions || null;
  const maxFret = positions ? Math.max(...positions.map((p) => p.fret)) : opts.maxFret;
  const strings = opts.strings || null;
  const onText = opts.stringsLabel ? ` on the <span class="hl">${opts.stringsLabel}</span>` : '';

  container.innerHTML = `
    <section class="view fn">
      <header class="fn-hero">
        <div class="fn-target">
          <div class="fn-badge js-badge">C</div>
          <div class="fn-prompt">
            <h2 class="js-h"></h2>
            <p class="fn-sub js-sub"></p>
          </div>
        </div>
        <div class="fn-actions js-actions"></div>
      </header>

      <div class="board js-board"></div>

      <div class="fn-foot">
        <div class="pips js-pips"></div>
        <div class="fn-stats js-stats"></div>
      </div>
      <div class="js-banner"></div>
    </section>`;

  const $ = (s) => container.querySelector(s);
  const badge = $('.js-badge');
  const hEl = $('.js-h');
  const subEl = $('.js-sub');
  const actionsEl = $('.js-actions');
  const pipsEl = $('.js-pips');
  const statsEl = $('.js-stats');
  const bannerEl = $('.js-banner');
  const boardEl = $('.js-board');

  const fb = makeFretboard(boardEl, { fretCount: maxFret });
  fb.on('click', onClick);

  let phase = 'study'; // 'study' | 'quiz' | 'round-done'
  let cycle = []; // shuffled queue of pool notes for the current round
  let cycleIndex = 0; // which note within the round
  let roundsCompleted = 0;
  let totalMistakes = 0; // misses across the whole session
  let roundMistakes = 0; // misses within the current round (drives "perfect")
  let reportedDone = false; // onComplete fires only on the first cleared round
  let advancing = false; // ignore clicks during the between-note flash
  let stopped = false; // guards queued timers after the student leaves
  let state = null; // current note's quiz state

  // The Stop button is always present — this drill has no natural end.
  function renderActions(extraHtml = '') {
    actionsEl.innerHTML =
      extraHtml + `<button class="ghost js-stop">■ Stop — back to path</button>`;
    $('.js-stop').addEventListener('click', () => {
      stopped = true;
      if (opts.onStop) opts.onStop();
    });
    const go = $('.js-go');
    if (go) go.addEventListener('click', startRound);
  }

  function targetsFor(note) {
    if (positions) {
      const chroma = chromaOf(toSharp(note));
      return positions.filter((p) => noteAt(p.string, p.fret).chroma === chroma);
    }
    let t = findPositions(note, maxFret);
    if (strings) t = t.filter((p) => strings.includes(p.string));
    return t;
  }

  // Optional study screen — show the whole note map for this string(s) at once.
  function enterStudy() {
    phase = 'study';
    badge.classList.remove('pulse');
    badge.textContent = '♪';
    hEl.innerHTML = `Study the natural notes${onText}`;
    subEl.textContent = 'Memorize where each one sits, then quiz yourself.';
    const dots = [];
    for (const n of pool) {
      const note = toSharp(n);
      for (const p of targetsFor(note)) dots.push({ ...p, status: 'root', label: noteShort(note) });
    }
    clearDots(fb);
    renderDots(fb, dots, { stagger: 35 });
    pipsEl.innerHTML = '';
    statsEl.innerHTML = '';
    bannerEl.innerHTML = '';
    renderActions(`<button class="primary js-go">Quiz me →</button>`);
  }

  function startRound() {
    if (stopped) return;
    cycle = shuffle(pool);
    cycleIndex = 0;
    roundMistakes = 0;
    renderActions();
    nextNote();
  }

  function nextNote() {
    if (stopped) return;
    phase = 'quiz';
    advancing = false;
    bannerEl.innerHTML = '';
    const note = toSharp(cycle[cycleIndex]); // canonical sharp for matching
    badge.textContent = noteShort(note);
    badge.classList.add('pulse');
    state = {
      chroma: chromaOf(note),
      short: noteShort(note),
      label: noteLabel(note),
      targets: targetsFor(note),
      found: new Set(),
      lastWrong: null,
    };
    hEl.innerHTML = `Find every <span class="hl">${state.label}</span>${onText}`;
    subEl.textContent = 'No peeking — recall from memory. Open strings included.';
    clearDots(fb);
    renderPips();
    updateStats();
  }

  function renderPips() {
    const total = state.targets.length;
    const n = state.found.size;
    pipsEl.innerHTML = Array.from(
      { length: total },
      (_, i) => `<span class="pip ${i < n ? 'on' : ''}"></span>`,
    ).join('');
  }

  function updateStats() {
    statsEl.innerHTML =
      `Round <strong>${roundsCompleted + 1}</strong> · note <strong>${cycleIndex + 1}</strong>/${pool.length} · ` +
      `<strong>${state.found.size}</strong>/${state.targets.length} found · ` +
      `<strong>${totalMistakes}</strong> miss${totalMistakes === 1 ? '' : 'es'}`;
  }

  function quizDots() {
    const dots = [...state.found].map((k) => {
      const [string, fret] = k.split(':').map(Number);
      return { string, fret, status: 'found', label: state.short };
    });
    if (state.lastWrong) dots.push({ ...state.lastWrong, status: 'wrong', label: '✗' });
    return dots;
  }

  function onClick(pos) {
    if (phase !== 'quiz' || !state || advancing || stopped) return;
    const { string, fret } = pos;
    if (fret > maxFret) return;
    if (positions && !positions.some((p) => p.string === string && p.fret === fret)) return;
    if (!positions && strings && !strings.includes(string)) return;
    const key = posKey({ string, fret });
    const hit = noteAt(string, fret).chroma === state.chroma;

    if (hit && !state.found.has(key)) {
      state.found.add(key);
      state.lastWrong = null;
      renderDots(fb, quizDots());
      renderPips();
      updateStats();
      if (state.found.size === state.targets.length) noteComplete();
    } else if (!hit) {
      totalMistakes += 1;
      roundMistakes += 1;
      state.lastWrong = { string, fret };
      renderDots(fb, quizDots());
      updateStats();
      setTimeout(() => {
        if (state && state.lastWrong && posKey(state.lastWrong) === key) {
          state.lastWrong = null;
          renderDots(fb, quizDots());
        }
      }, 650);
    }
  }

  function noteComplete() {
    advancing = true;
    badge.classList.remove('pulse');
    badge.classList.add('hit');
    setTimeout(() => badge.classList.remove('hit'), 500);
    cycleIndex += 1;
    if (cycleIndex >= pool.length) {
      roundComplete();
    } else {
      bannerEl.innerHTML = `<div class="mara-flash">✓ ${state.label} — next note…</div>`;
      setTimeout(nextNote, 900);
    }
  }

  function roundComplete() {
    phase = 'round-done';
    roundsCompleted += 1;
    const perfectRound = roundMistakes === 0;
    if (!reportedDone) {
      reportedDone = true;
      if (opts.onComplete) opts.onComplete({ perfect: perfectRound });
    }
    badge.classList.remove('pulse');
    clearDots(fb);
    hEl.innerHTML = `Round ${roundsCompleted} complete`;
    subEl.textContent = `All ${pool.length} recalled${perfectRound ? ' — flawless!' : ''}. Next round starting…`;
    bannerEl.innerHTML = `
      <div class="fn-done">
        <span class="big">🏁 Round ${roundsCompleted} done!</span>
        &nbsp;You recalled all <strong>${pool.length}</strong> notes${perfectRound ? ' with no mistakes' : ''}.
        Keep going, or press <strong>Stop</strong> when you're ready.
      </div>`;
    setTimeout(startRound, 1600);
  }

  if (opts.study) enterStudy();
  else {
    renderActions();
    startRound();
  }
}
