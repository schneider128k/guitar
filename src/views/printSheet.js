// Print Sheet: a printable (or iPad-annotatable) worksheet pairing standard
// notation with one CAGED scale box, for practicing "which fret/string plays
// this notated pitch" in both directions. Designed for window.print() ->
// Save as PDF -> mark up by hand (Notability/GoodNotes/Markup).
import { makeFretboard, renderDots } from '../ui/fretboard.js';
import { renderStaffOnly } from '../ui/notation.js';
import { boxScaleSequence, CAGED_BOXES, NOTE_NAMES } from '../music.js';

export function initPrintSheet(container) {
  container.innerHTML = `
    <section class="view">
      <div class="controls no-print">
        <label>Key:
          <select id="ps-key"></select>
        </label>
        <span>Shape:</span>
        <div id="ps-shapes" class="key-buttons"></div>
        <button class="choice" id="ps-print" type="button">🖨️ Print / Save as PDF</button>
      </div>
      <p class="hint no-print">Pick a key and shape, then print (or "Save as PDF" on iPad
        Safari) and mark it up by hand. Write the note name directly below each note on the
        staff (that's the reading practice). The fretboard box is blank — write the note name
        inside each circle (that's the fretboard practice); dashed circles are the one or two
        notes just outside the box that connect to the next shape.</p>

      <div class="worksheet">
        <h3 id="ps-title" class="scale-title"></h3>

        <h4 class="sub">Ascending — write the note name below each note</h4>
        <div id="ps-asc" class="notation"></div>

        <h4 class="sub">Descending — write the note name below each note</h4>
        <div id="ps-desc" class="notation"></div>

        <h4 class="sub">Fretboard — write the note name in each circle</h4>
        <div id="ps-board" class="board"></div>
      </div>
    </section>`;

  const keySel = container.querySelector('#ps-key');
  keySel.innerHTML = NOTE_NAMES.map(
    (n) => `<option value="${n}"${n === 'C' ? ' selected' : ''}>${n}</option>`,
  ).join('');

  const shapesEl = container.querySelector('#ps-shapes');
  const titleEl = container.querySelector('#ps-title');
  const ascEl = container.querySelector('#ps-asc');
  const descEl = container.querySelector('#ps-desc');
  const boardEl = container.querySelector('#ps-board');
  const printBtn = container.querySelector('#ps-print');

  let shape = 'A';

  function show() {
    const key = keySel.value;
    const seq = boxScaleSequence(key, shape);
    const maxFret = Math.max(...seq.map((n) => n.fret));

    titleEl.textContent = `${key} major — Shape ${shape} (CAGED) practice sheet`;

    renderStaffOnly(ascEl, seq);

    const desc = [...seq].reverse();
    renderStaffOnly(descEl, desc);

    const fb = makeFretboard(boardEl, { fretCount: maxFret + 1 });
    const dots = seq.map((n) => ({
      string: n.string,
      fret: n.fret,
      status: n.extension ? 'extra' : 'blank',
      r: 19,
      label: '',
    }));
    renderDots(fb, dots);

    [...shapesEl.children].forEach((b) => b.classList.toggle('active', b.dataset.shape === shape));
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
  printBtn.addEventListener('click', () => window.print());

  show();
}
