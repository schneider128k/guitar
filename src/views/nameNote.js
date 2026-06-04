// "Name the Note": one dot is shown, pick its name from four choices.
import { makeFretboard, renderDots } from '../ui/fretboard.js';
import { noteAt, NOTE_NAMES, randomItem, shuffle } from '../music.js';

const MAX_FRET = 12;

export function initNameNote(container) {
  container.innerHTML = `
    <section class="view">
      <div class="controls">
        <button id="nn-new" class="primary">New note</button>
        <span class="hint">Which note is highlighted?</span>
        <span class="score" id="nn-score"></span>
      </div>
      <div id="nn-board" class="board"></div>
      <div id="nn-choices" class="choices"></div>
      <div id="nn-status" class="status"></div>
    </section>`;

  const boardEl = container.querySelector('#nn-board');
  const choicesEl = container.querySelector('#nn-choices');
  const statusEl = container.querySelector('#nn-status');
  const scoreEl = container.querySelector('#nn-score');

  const fb = makeFretboard(boardEl, { fretCount: MAX_FRET });
  let target = null;
  let answered = false;
  let correctCount = 0;
  let totalCount = 0;

  function makeChoices(answer) {
    const distractors = shuffle(NOTE_NAMES.filter((n) => n !== answer)).slice(0, 3);
    return shuffle([answer, ...distractors]);
  }

  function showQuestion() {
    answered = false;
    const string = 1 + Math.floor(Math.random() * 6);
    const fret = Math.floor(Math.random() * (MAX_FRET + 1));
    const note = noteAt(string, fret).note;
    target = { string, fret, note };

    renderDots(fb, [{ string, fret, status: 'highlight', label: '?' }]);
    statusEl.textContent = '';
    choicesEl.innerHTML = '';
    for (const choice of makeChoices(note)) {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.textContent = choice;
      btn.addEventListener('click', () => answer(choice, btn));
      choicesEl.appendChild(btn);
    }
  }

  function answer(choice, btn) {
    if (answered) return;
    answered = true;
    totalCount += 1;
    const correct = choice === target.note;
    if (correct) correctCount += 1;

    renderDots(fb, [
      { string: target.string, fret: target.fret, status: correct ? 'found' : 'wrong', label: target.note },
    ]);

    [...choicesEl.children].forEach((b) => {
      b.disabled = true;
      if (b.textContent === target.note) b.classList.add('correct');
      else if (b === btn) b.classList.add('incorrect');
    });

    statusEl.innerHTML = correct
      ? `<span class="ok">✓ Correct!</span>`
      : `<span class="bad">✗ That was ${target.note}.</span>`;
    scoreEl.textContent = `Score: ${correctCount} / ${totalCount}`;
  }

  container.querySelector('#nn-new').addEventListener('click', showQuestion);
  showQuestion();
}
