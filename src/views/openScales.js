// Open-Position Scales explorer: fretboard + standard notation + TAB, synced.
import { makeFretboard, renderDots } from '../ui/fretboard.js';
import { renderNotation } from '../ui/notation.js';
import { OPEN_SCALES, OPEN_KEYS } from '../openScales.js';

export function initOpenScales(container) {
  container.innerHTML = `
    <section class="view">
      <div class="controls">
        <span>Key:</span>
        <div id="os-keys" class="key-buttons"></div>
      </div>
      <h3 id="os-title" class="scale-title"></h3>
      <div id="os-board" class="board"></div>
      <h4 class="sub">Notation &amp; TAB</h4>
      <div id="os-notation" class="notation"></div>
    </section>`;

  const keysEl = container.querySelector('#os-keys');
  const titleEl = container.querySelector('#os-title');
  const boardEl = container.querySelector('#os-board');
  const notationEl = container.querySelector('#os-notation');

  const fb = makeFretboard(boardEl, { fretCount: 5 });
  let current = 'C';

  function show(key) {
    current = key;
    const notes = OPEN_SCALES[key];
    titleEl.textContent = `${key} major scale — open position`;

    const dots = notes.map((n) => ({
      string: n.string,
      fret: n.fret,
      status: n.note === key ? 'root' : 'default',
      label: n.note,
    }));
    renderDots(fb, dots);
    renderNotation(notationEl, notes);

    [...keysEl.children].forEach((b) =>
      b.classList.toggle('active', b.dataset.key === key),
    );
  }

  for (const key of OPEN_KEYS) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.dataset.key = key;
    btn.textContent = key;
    btn.addEventListener('click', () => show(key));
    keysEl.appendChild(btn);
  }

  show(current);
}
