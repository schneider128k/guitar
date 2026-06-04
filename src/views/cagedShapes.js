// CAGED Shapes explorer: pick a key + one of the 5 movable shapes, see the box.
import { makeFretboard, renderDots } from '../ui/fretboard.js';
import { cagedBox, CAGED_BOXES, NOTE_NAMES } from '../music.js';

export function initCagedShapes(container) {
  container.innerHTML = `
    <section class="view">
      <div class="controls">
        <label>Key:
          <select id="cg-key"></select>
        </label>
        <span>Shape:</span>
        <div id="cg-shapes" class="key-buttons"></div>
        <label class="toggle">
          <input type="checkbox" id="cg-degrees" /> Show degrees
        </label>
      </div>
      <h3 id="cg-title" class="scale-title"></h3>
      <div id="cg-board" class="board"></div>
      <p class="hint">The 5 CAGED shapes are movable: the same fingering pattern
        slides up the neck to play the scale in any key.</p>
    </section>`;

  const keySel = container.querySelector('#cg-key');
  keySel.innerHTML = NOTE_NAMES.map(
    (n) => `<option value="${n}"${n === 'C' ? ' selected' : ''}>${n}</option>`,
  ).join('');

  const shapesEl = container.querySelector('#cg-shapes');
  const titleEl = container.querySelector('#cg-title');
  const boardEl = container.querySelector('#cg-board');
  const degreesChk = container.querySelector('#cg-degrees');

  let shape = 'C';

  function show() {
    const key = keySel.value;
    const box = cagedBox(key, shape);
    const maxFret = box.reduce((m, p) => Math.max(m, p.fret), 0);

    boardEl.innerHTML = '';
    const fb = makeFretboard(boardEl, { fretCount: Math.max(5, maxFret + 1) });

    const dots = box.map((p) => ({
      string: p.string,
      fret: p.fret,
      status: p.degree === 1 ? 'root' : 'default',
      label: degreesChk.checked ? String(p.degree) : p.note,
    }));
    renderDots(fb, dots);

    titleEl.textContent = `${key} major — ${shape} shape (CAGED)`;
    [...shapesEl.children].forEach((b) =>
      b.classList.toggle('active', b.dataset.shape === shape),
    );
  }

  for (const letter of CAGED_BOXES) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.dataset.shape = letter;
    btn.textContent = letter;
    btn.addEventListener('click', () => {
      shape = letter;
      show();
    });
    shapesEl.appendChild(btn);
  }

  keySel.addEventListener('change', show);
  degreesChk.addEventListener('change', show);
  show();
}
