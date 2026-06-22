// CAGED Shapes explorer: pick a key + one of the 5 movable shapes, see the box.
import { makeFretboard, renderDots } from '../ui/fretboard.js';
import { createMarathonDrill } from '../drills/marathonDrill.js';
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
      <div id="cg-view">
        <h3 id="cg-title" class="scale-title"></h3>
        <div id="cg-board" class="board"></div>
        <p class="hint">The 5 CAGED shapes are movable: the same fingering pattern
          slides up the neck to play the scale in any key.</p>
        <button class="choice" id="cg-quiz-start" type="button">🎯 Quiz me on this shape</button>
      </div>
      <div id="cg-quiz" style="display:none"></div>
    </section>`;

  const keySel = container.querySelector('#cg-key');
  keySel.innerHTML = NOTE_NAMES.map(
    (n) => `<option value="${n}"${n === 'C' ? ' selected' : ''}>${n}</option>`,
  ).join('');

  const shapesEl = container.querySelector('#cg-shapes');
  const titleEl = container.querySelector('#cg-title');
  const boardEl = container.querySelector('#cg-board');
  const degreesChk = container.querySelector('#cg-degrees');
  const viewEl = container.querySelector('#cg-view');
  const quizEl = container.querySelector('#cg-quiz');
  const quizStartBtn = container.querySelector('#cg-quiz-start');

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

  function startQuiz() {
    const key = keySel.value;
    const box = cagedBox(key, shape);
    const pool = [...new Set(box.sort((a, b) => a.degree - b.degree).map((p) => p.note))];
    viewEl.style.display = 'none';
    quizEl.style.display = 'block';
    createMarathonDrill(quizEl, {
      pool,
      positions: box.map((p) => ({ string: p.string, fret: p.fret })),
      study: true,
      onStop: () => {
        quizEl.style.display = 'none';
        viewEl.style.display = 'block';
        show();
      },
    });
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
  quizStartBtn.addEventListener('click', startQuiz);
  show();
}
