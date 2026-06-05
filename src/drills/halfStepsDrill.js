// Quick theory primer: how many half steps sit between consecutive natural
// notes. Teaches that on a guitar 1 fret = 1 half step, and that E→F and B→C
// are the only natural half steps — the foundation for finding notes on the
// fretboard. Mirrors the Find drill's Learn → Quiz → Done shape and reports
// completion via onComplete({ mistakes, perfect }) / onContinue().

// [from, to, half-steps between them]
const PAIRS = [
  ['C', 'D', 2], ['D', 'E', 2], ['E', 'F', 1], ['F', 'G', 2],
  ['G', 'A', 2], ['A', 'B', 2], ['B', 'C', 1],
];

export function createHalfStepsDrill(container, opts = {}) {
  container.innerHTML = `
    <section class="view fn">
      <header class="fn-hero">
        <div class="fn-target">
          <div class="fn-badge">½</div>
          <div class="fn-prompt">
            <h2 class="js-h"></h2>
            <p class="fn-sub js-sub"></p>
          </div>
        </div>
        <div class="fn-actions js-actions"></div>
      </header>

      <div class="js-body"></div>

      <div class="fn-foot">
        <div class="pips js-pips"></div>
        <div class="fn-stats js-stats"></div>
      </div>
      <div class="status js-status"></div>
      <div class="js-done"></div>
    </section>`;

  const $ = (s) => container.querySelector(s);
  const hEl = $('.js-h');
  const subEl = $('.js-sub');
  const actionsEl = $('.js-actions');
  const bodyEl = $('.js-body');
  const pipsEl = $('.js-pips');
  const statsEl = $('.js-stats');
  const statusEl = $('.js-status');
  const doneEl = $('.js-done');

  let i = 0; // current question index
  let wrong = 0;
  let locked = false; // true while feedback for the current answer is showing

  function renderPips() {
    pipsEl.innerHTML = PAIRS.map(
      (_, k) => `<span class="pip ${k < i ? 'on' : ''}"></span>`,
    ).join('');
  }

  // The natural-note row with the gaps between them; half steps shown in amber.
  function scaleDiagram() {
    let html = '<div class="hs-scale">';
    PAIRS.forEach(([a, b, gap], k) => {
      html += `<span class="hs-note">${a}</span>`;
      html += `<span class="hs-gap ${gap === 1 ? 'hs-gap--half' : ''}"><b>${gap}</b></span>`;
      if (k === PAIRS.length - 1) html += `<span class="hs-note">${b}</span>`;
    });
    return html + '</div>';
  }

  function enterLearn() {
    hEl.textContent = 'Half steps & whole steps';
    subEl.textContent = 'The spacing between the natural notes.';
    actionsEl.innerHTML = `<button class="primary js-go">Quiz me →</button>`;
    $('.js-go').addEventListener('click', enterQuiz);
    statusEl.innerHTML = '';
    statsEl.innerHTML = '';
    pipsEl.innerHTML = '';
    doneEl.innerHTML = '';
    bodyEl.innerHTML = `
      <div class="board hs-teach">
        <p>On a guitar, <strong>one fret = one half step</strong>. Stepping from
        one natural note to the next is usually <strong>2 half steps</strong> (a
        whole step) — except <strong>E→F</strong> and <strong>B→C</strong>, which
        are only <strong>1 half step</strong>. That's why there's no sharp or flat
        between them.</p>
        ${scaleDiagram()}
        <p class="hs-legend"><span class="hs-key"></span> = half step (1 fret)</p>
      </div>`;
  }

  function enterQuiz() {
    i = 0;
    wrong = 0;
    doneEl.innerHTML = '';
    actionsEl.innerHTML = `<button class="ghost js-peek">Study again</button>`;
    $('.js-peek').addEventListener('click', enterLearn);
    askQuestion();
  }

  function askQuestion() {
    locked = false;
    const [a, b] = PAIRS[i];
    hEl.innerHTML = `How many half steps from <span class="hl">${a}</span> to <span class="hl">${b}</span>?`;
    subEl.textContent = 'Tap your answer.';
    statusEl.innerHTML = '';
    statsEl.innerHTML = `Question <strong>${i + 1}</strong> / ${PAIRS.length}`;
    renderPips();
    bodyEl.innerHTML = `
      <div class="hs-pair">
        <div class="fn-badge hs-n">${a}</div>
        <span class="hs-arrow">→</span>
        <div class="fn-badge hs-n">${b}</div>
      </div>
      <div class="choices hs-choices">
        <button class="choice" data-v="1">1 · half step</button>
        <button class="choice" data-v="2">2 · whole step</button>
      </div>`;
    bodyEl.querySelectorAll('.choice').forEach((btn) =>
      btn.addEventListener('click', () => answer(+btn.dataset.v, btn)),
    );
  }

  function answer(value, btn) {
    if (locked) return;
    locked = true;
    const [a, b, gap] = PAIRS[i];
    const correct = value === gap;
    bodyEl.querySelectorAll('.choice').forEach((el) => {
      el.disabled = true;
      if (+el.dataset.v === gap) el.classList.add('correct');
    });
    if (!correct) {
      btn.classList.add('incorrect');
      wrong += 1;
    }
    const word = gap === 1 ? 'a half step' : 'a whole step (2 half steps)';
    statusEl.innerHTML = correct
      ? `<span class="ok">Right!</span> ${a}→${b} is ${word}.`
      : `<span class="bad">Not quite.</span> ${a}→${b} is ${word}.`;
    i += 1;
    renderPips();
    setTimeout(() => (i < PAIRS.length ? askQuestion() : enterDone()), correct ? 800 : 1300);
  }

  function enterDone() {
    const perfect = wrong === 0;
    hEl.textContent = perfect ? 'Nailed it!' : 'Lesson complete';
    subEl.textContent = 'You know the spacing now.';
    statusEl.innerHTML = '';
    statsEl.innerHTML = '';
    bodyEl.innerHTML = '';
    renderPips();
    actionsEl.innerHTML = `
      <button class="ghost js-again">Try again</button>
      <button class="primary js-continue">Continue →</button>`;
    $('.js-again').addEventListener('click', enterQuiz);
    $('.js-continue').addEventListener('click', () => opts.onContinue && opts.onContinue());
    doneEl.innerHTML = `
      <div class="fn-done">
        <span class="big">${perfect ? '🎯 Perfect!' : '✓ Done!'}</span>
        &nbsp;${perfect ? 'No mistakes.' : `${wrong} mistake${wrong === 1 ? '' : 's'}.`}
        Remember: <strong>E→F</strong> and <strong>B→C</strong> are the only
        natural half steps — every other step is a whole step.
      </div>`;
    if (opts.onComplete) opts.onComplete({ mistakes: wrong, perfect });
  }

  enterLearn();
}
