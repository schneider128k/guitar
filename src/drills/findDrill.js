// Reusable "Find Notes" Learn → Quiz drill.
// Used by the Find Notes tab (free play, with selectors) and by Guided Path
// (fixed note + fret, reports completion via onComplete / onContinue).
//
// opts:
//   note       : a natural-note letter, or 'random'
//   maxFret    : number
//   selectable : show note/fret selectors + free-play "new note" (Find Notes tab)
//   lessonTitle, lessonSub : labels shown in guided (non-selectable) mode
//   onComplete(result) : called once when a round is finished {note, mistakes, seconds, perfect}
//   onContinue()       : guided "Continue →" handler
import { makeFretboard, renderDots, clearDots } from '../ui/fretboard.js';
import { noteAt, findPositions, randomItem } from '../music.js';

const NATURALS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const posKey = (p) => `${p.string}:${p.fret}`;

export function createFindDrill(container, opts = {}) {
  const selectable = !!opts.selectable;

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
      <div class="js-done"></div>

      ${
        selectable
          ? `<div class="fn-controls">
               <label>Note <select class="js-note"></select></label>
               <label>Up to fret <select class="js-maxfret">
                 <option value="5">5</option><option value="7">7</option>
                 <option value="12" selected>12</option>
               </select></label>
             </div>`
          : ''
      }
    </section>`;

  const $ = (s) => container.querySelector(s);
  const badge = $('.js-badge');
  const hEl = $('.js-h');
  const subEl = $('.js-sub');
  const actionsEl = $('.js-actions');
  const pipsEl = $('.js-pips');
  const statsEl = $('.js-stats');
  const doneEl = $('.js-done');
  const boardEl = $('.js-board');
  const noteSel = $('.js-note');
  const maxFretSel = $('.js-maxfret');

  if (selectable) {
    noteSel.innerHTML =
      `<option value="random">🎲 Random</option>` +
      NATURALS.map((n) => `<option value="${n}">${n}</option>`).join('');
  }

  let fb = null;
  let boardFretCount = null;
  let state = null;

  function ensureBoard(maxFret) {
    if (boardFretCount === maxFret && fb) return;
    fb = makeFretboard(boardEl, { fretCount: maxFret });
    fb.on('click', onClick);
    boardFretCount = maxFret;
  }

  const targetDots = (status) =>
    state.targets.map((p) => ({ ...p, status, label: state.note }));

  function renderPips() {
    const total = state.targets.length;
    const n = state.found.size;
    pipsEl.innerHTML = Array.from(
      { length: total },
      (_, i) => `<span class="pip ${i < n ? 'on' : ''}"></span>`,
    ).join('');
  }

  function enterLearn() {
    state.phase = 'learn';
    state.found = new Set();
    state.wrong = 0;
    state.lastWrong = null;
    doneEl.innerHTML = '';
    badge.classList.remove('pulse');

    hEl.innerHTML = `Memorize every <span class="hl">${state.note}</span>`;
    subEl.textContent =
      `${state.targets.length} positions up to fret ${state.maxFret} · take your time`;
    actionsEl.innerHTML = `<button class="primary js-go">Quiz me →</button>`;
    $('.js-go').addEventListener('click', enterQuiz);

    clearDots(fb);
    renderDots(fb, targetDots('root'), { stagger: 45 });
    renderPips();
    statsEl.innerHTML = '';
  }

  function enterQuiz() {
    state.phase = 'quiz';
    state.found = new Set();
    state.wrong = 0;
    state.start = performance.now();
    badge.classList.add('pulse');

    hEl.innerHTML = `Find every <span class="hl">${state.note}</span>`;
    subEl.textContent = 'Click each one — open strings included.';
    actionsEl.innerHTML = `<button class="ghost js-peek">Study again</button>`;
    $('.js-peek').addEventListener('click', enterLearn);

    clearDots(fb);
    renderPips();
    updateStats();
  }

  function enterDone() {
    state.phase = 'done';
    badge.classList.remove('pulse');
    const seconds = +((performance.now() - state.start) / 1000).toFixed(1);
    const miss = state.wrong;
    const perfect = miss === 0;

    hEl.innerHTML = `All ${state.targets.length} found`;
    subEl.textContent = perfect ? 'Flawless run.' : 'Keep at it.';

    if (selectable) {
      actionsEl.innerHTML = `
        <button class="ghost js-again">Practice again</button>
        <button class="primary js-next">New note →</button>`;
      $('.js-again').addEventListener('click', () => startRound(state.note));
      $('.js-next').addEventListener('click', () => startRound('random'));
    } else {
      actionsEl.innerHTML = `
        <button class="ghost js-again">Try again</button>
        <button class="primary js-continue">Continue →</button>`;
      $('.js-again').addEventListener('click', () => startRound(opts.note));
      $('.js-continue').addEventListener('click', () => opts.onContinue && opts.onContinue());
    }

    renderDots(fb, targetDots('found'));
    renderPips();
    doneEl.innerHTML = `
      <div class="fn-done">
        <span class="big">${perfect ? '🎯 Perfect!' : '✓ Done!'}</span>
        &nbsp;Found all <strong>${state.targets.length}</strong> ${state.note}'s in
        <strong>${seconds}s</strong> with
        <strong>${miss}</strong> mistake${miss === 1 ? '' : 's'}.
      </div>`;

    if (opts.onComplete) {
      opts.onComplete({ note: state.note, mistakes: miss, seconds, perfect });
    }
  }

  function updateStats() {
    if (!state || state.phase !== 'quiz') return;
    const secs = ((performance.now() - state.start) / 1000).toFixed(0);
    statsEl.innerHTML =
      `<strong>${state.found.size}</strong> / ${state.targets.length} found · ` +
      `<strong>${state.wrong}</strong> miss${state.wrong === 1 ? '' : 'es'} · ${secs}s`;
  }

  function quizDots() {
    const dots = [...state.found].map((k) => {
      const [string, fret] = k.split(':').map(Number);
      return { string, fret, status: 'found', label: state.note };
    });
    if (state.lastWrong) dots.push({ ...state.lastWrong, status: 'wrong', label: '✗' });
    return dots;
  }

  function onClick(pos) {
    if (!state || state.phase !== 'quiz') return;
    const { string, fret } = pos;
    if (fret > state.maxFret) return;
    const key = posKey({ string, fret });
    const hit = noteAt(string, fret).note === state.note;

    if (hit && !state.found.has(key)) {
      state.found.add(key);
      state.lastWrong = null;
      renderDots(fb, quizDots());
      renderPips();
      updateStats();
      if (state.found.size === state.targets.length) enterDone();
    } else if (!hit) {
      state.wrong += 1;
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

  function startRound(noteChoice) {
    const maxFret = selectable ? parseInt(maxFretSel.value, 10) : opts.maxFret;
    const choice = noteChoice ?? opts.note;
    const note = choice === 'random' ? randomItem(NATURALS) : choice;
    ensureBoard(maxFret);
    badge.textContent = note;
    state = {
      note,
      maxFret,
      targets: findPositions(note, maxFret),
      found: new Set(),
      wrong: 0,
      lastWrong: null,
      phase: 'learn',
    };
    enterLearn();
  }

  if (selectable) {
    noteSel.addEventListener('change', () => startRound(noteSel.value));
    maxFretSel.addEventListener('change', () => {
      boardFretCount = null;
      startRound(noteSel.value);
    });
    startRound('C');
  } else {
    startRound(opts.note);
  }
}
