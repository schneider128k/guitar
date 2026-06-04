// "Find every C up to fret 12" — click all positions of a target note.
import { makeFretboard, renderDots } from '../ui/fretboard.js';
import { noteAt, findPositions, randomItem } from '../music.js';

const NATURALS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const posKey = (p) => `${p.string}:${p.fret}`;

export function initFindNotes(container) {
  container.innerHTML = `
    <section class="view">
      <div class="controls">
        <label>Note:
          <select id="fn-note"></select>
        </label>
        <label>Up to fret:
          <select id="fn-maxfret">
            <option value="5">5</option>
            <option value="7">7</option>
            <option value="12" selected>12</option>
          </select>
        </label>
        <button id="fn-new" class="primary">New round</button>
        <span class="hint">Click every position of the note on the neck.</span>
      </div>
      <div id="fn-board" class="board"></div>
      <div id="fn-status" class="status"></div>
    </section>`;

  const noteSel = container.querySelector('#fn-note');
  noteSel.innerHTML =
    `<option value="random">🎲 Random</option>` +
    NATURALS.map((n) => `<option value="${n}">${n}</option>`).join('');

  const maxFretSel = container.querySelector('#fn-maxfret');
  const boardEl = container.querySelector('#fn-board');
  const statusEl = container.querySelector('#fn-status');

  let fb = null;
  let state = null;

  function buildBoard(maxFret) {
    boardEl.innerHTML = '';
    fb = makeFretboard(boardEl, { fretCount: maxFret });
    fb.on('click', onClick);
  }

  function render() {
    const dots = state.found.map((p) => ({
      ...p,
      status: 'found',
      label: state.target,
    }));
    if (state.lastWrong) dots.push({ ...state.lastWrong, status: 'wrong', label: '✗' });
    renderDots(fb, dots);
  }

  function updateStatus() {
    const total = state.answers.length;
    const n = state.found.length;
    if (state.done) {
      const secs = ((performance.now() - state.start) / 1000).toFixed(1);
      statusEl.innerHTML =
        `<strong class="ok">✓ Found all ${total} ${state.target}'s</strong> ` +
        `in ${secs}s with ${state.wrong} mistake${state.wrong === 1 ? '' : 's'}.`;
    } else {
      statusEl.innerHTML =
        `Find all <strong>${state.target}</strong>: ${n} / ${total} found · ` +
        `${state.wrong} mistake${state.wrong === 1 ? '' : 's'}`;
    }
  }

  function onClick(pos) {
    if (!state || state.done) return;
    const { string, fret } = pos;
    if (fret > state.maxFret) return;
    const hit = noteAt(string, fret).note === state.target;
    const key = posKey({ string, fret });

    if (hit && !state.foundKeys.has(key)) {
      state.foundKeys.add(key);
      state.found.push({ string, fret });
      state.lastWrong = null;
      if (state.found.length === state.answers.length) state.done = true;
    } else if (!hit) {
      state.wrong += 1;
      state.lastWrong = { string, fret };
      setTimeout(() => {
        if (state && state.lastWrong && posKey(state.lastWrong) === key) {
          state.lastWrong = null;
          render();
        }
      }, 600);
    }
    render();
    updateStatus();
  }

  function newRound() {
    const maxFret = parseInt(maxFretSel.value, 10);
    const target =
      noteSel.value === 'random' ? randomItem(NATURALS) : noteSel.value;
    buildBoard(maxFret);
    state = {
      target,
      maxFret,
      answers: findPositions(target, maxFret),
      found: [],
      foundKeys: new Set(),
      wrong: 0,
      lastWrong: null,
      done: false,
      start: performance.now(),
    };
    render();
    updateStatus();
  }

  container.querySelector('#fn-new').addEventListener('click', newRound);
  maxFretSel.addEventListener('change', newRound);
  newRound();
}
