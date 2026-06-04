// Find Notes — a two-phase "Learn → Quiz" drill.
//
//   LEARN : every target note is revealed on the neck. Study it.
//   QUIZ  : the notes vanish; click every position from memory.
//   DONE  : score + time + mistakes, then practise again or pick a new note.
//
// Open strings (fret 0) are first-class: they live in their own column on the
// neck and are fully clickable.
import { makeFretboard, renderDots, clearDots } from '../ui/fretboard.js';
import { noteAt, findPositions, randomItem } from '../music.js';

const NATURALS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const posKey = (p) => `${p.string}:${p.fret}`;

export function initFindNotes(container) {
  container.innerHTML = `
    <section class="view fn">
      <header class="fn-hero">
        <div class="fn-target">
          <div class="fn-badge" id="fn-badge">C</div>
          <div class="fn-prompt">
            <h2 id="fn-h"></h2>
            <p class="fn-sub" id="fn-sub"></p>
          </div>
        </div>
        <div class="fn-actions" id="fn-actions"></div>
      </header>

      <div id="fn-board" class="board"></div>

      <div class="fn-foot">
        <div class="pips" id="fn-pips"></div>
        <div class="fn-stats" id="fn-stats"></div>
      </div>
      <div id="fn-done"></div>

      <div class="fn-controls">
        <label>Note
          <select id="fn-note"></select>
        </label>
        <label>Up to fret
          <select id="fn-maxfret">
            <option value="5">5</option>
            <option value="7">7</option>
            <option value="12" selected>12</option>
          </select>
        </label>
      </div>
    </section>`;

  const $ = (sel) => container.querySelector(sel);
  const badge = $('#fn-badge');
  const hEl = $('#fn-h');
  const subEl = $('#fn-sub');
  const actionsEl = $('#fn-actions');
  const pipsEl = $('#fn-pips');
  const statsEl = $('#fn-stats');
  const doneEl = $('#fn-done');
  const boardEl = $('#fn-board');
  const noteSel = $('#fn-note');
  const maxFretSel = $('#fn-maxfret');

  noteSel.innerHTML =
    `<option value="random">🎲 Random</option>` +
    NATURALS.map((n) => `<option value="${n}">${n}</option>`).join('');

  let fb = null;
  let boardFretCount = null;
  let state = null;

  function ensureBoard(maxFret) {
    if (boardFretCount === maxFret && fb) return;
    fb = makeFretboard(boardEl, { fretCount: maxFret });
    fb.on('click', onClick);
    boardFretCount = maxFret;
  }

  function targetDots(status) {
    return state.targets.map((p) => ({ ...p, status, label: state.note }));
  }

  function renderPips() {
    const total = state.targets.length;
    const n = state.found.size;
    pipsEl.innerHTML = Array.from(
      { length: total },
      (_, i) => `<span class="pip ${i < n ? 'on' : ''}"></span>`,
    ).join('');
  }

  // ---- phases --------------------------------------------------------------
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
    actionsEl.innerHTML = `<button class="primary" id="fn-go">Quiz me →</button>`;
    $('#fn-go').addEventListener('click', enterQuiz);

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
    subEl.textContent = `Click each one — open strings included.`;
    actionsEl.innerHTML = `<button class="ghost" id="fn-peek">Study again</button>`;
    $('#fn-peek').addEventListener('click', enterLearn);

    clearDots(fb);
    renderPips();
    updateStats();
  }

  function enterDone() {
    state.phase = 'done';
    badge.classList.remove('pulse');
    const secs = ((performance.now() - state.start) / 1000).toFixed(1);
    const miss = state.wrong;
    const perfect = miss === 0;

    hEl.innerHTML = `All ${state.targets.length} found`;
    subEl.textContent = perfect ? 'Flawless run.' : 'Keep at it.';
    actionsEl.innerHTML = `
      <button class="ghost" id="fn-again">Practice again</button>
      <button class="primary" id="fn-next">New note →</button>`;
    $('#fn-again').addEventListener('click', () => startRound(state.note));
    $('#fn-next').addEventListener('click', () => startRound('random'));

    // celebratory: light them all amber
    renderDots(fb, targetDots('found'));
    renderPips();
    doneEl.innerHTML = `
      <div class="fn-done">
        <span class="big">${perfect ? '🎯 Perfect!' : '✓ Done!'}</span>
        &nbsp;Found all <strong>${state.targets.length}</strong> ${state.note}'s in
        <strong>${secs}s</strong> with
        <strong>${miss}</strong> mistake${miss === 1 ? '' : 's'}.
      </div>`;
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

  // ---- round setup ---------------------------------------------------------
  function startRound(noteChoice) {
    const maxFret = parseInt(maxFretSel.value, 10);
    const note = noteChoice === 'random' ? randomItem(NATURALS) : noteChoice;
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

  noteSel.addEventListener('change', () => startRound(noteSel.value));
  maxFretSel.addEventListener('change', () => {
    boardFretCount = null; // force rebuild at new size
    startRound(noteSel.value);
  });

  startRound('C');
}
