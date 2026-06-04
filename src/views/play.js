// Play tab — "play the note" by ear/hand. The app names a note; you play it on
// the guitar (any octave) and the mic confirms it. Showcases real-time pitch
// detection; works in Safari on iPhone/iPad (tap Start to grant mic + open audio).
//
// Audio gives a pitch CLASS, not a fret position, so the target is "play a G
// anywhere" — which is exactly what audio can verify honestly.
import { createPitchListener } from '../audio/pitch.js';
import { randomItem } from '../music.js';

const NATURALS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const HOLD_MS = 200; // how long the right pitch must sustain to count

export function initPlay(container) {
  container.innerHTML = `
    <section class="view play">
      <div class="fn-target">
        <div class="fn-badge js-badge">G</div>
        <div class="fn-prompt">
          <h2>Play&nbsp;<span class="hl js-name">G</span></h2>
          <p class="fn-sub">on your guitar — any octave</p>
        </div>
        <span class="score js-score"></span>
      </div>

      <div class="play-panel js-panel">
        <button class="primary js-start">🎤 Start microphone</button>
        <p class="hint js-hint">Tap to allow mic access. On iPhone/iPad, use Safari.</p>
      </div>

      <div class="play-live js-live" hidden>
        <div class="tuner">
          <div class="tuner-track">
            <span class="tuner-tick" style="left:0%"></span>
            <span class="tuner-tick tuner-tick--c" style="left:50%"></span>
            <span class="tuner-tick" style="left:100%"></span>
            <span class="tuner-needle js-needle"></span>
          </div>
          <div class="tuner-labels"><span>♭ flat</span><span>in tune</span><span>sharp ♯</span></div>
        </div>
        <div class="play-heard">Heard <strong class="js-heard">—</strong><span class="js-cents"></span></div>
        <button class="ghost js-stop">Stop mic</button>
      </div>

      <div class="status js-status"></div>
    </section>`;

  const $ = (s) => container.querySelector(s);
  const sectionEl = $('.play');
  const badge = $('.js-badge');
  const nameEl = $('.js-name');
  const scoreEl = $('.js-score');
  const panel = $('.js-panel');
  const startBtn = $('.js-start');
  const hint = $('.js-hint');
  const live = $('.js-live');
  const needle = $('.js-needle');
  const heard = $('.js-heard');
  const centsEl = $('.js-cents');
  const statusEl = $('.js-status');

  let target = 'G';
  let correct = 0;
  let total = 0;
  let heldSince = 0;
  let matching = false;
  let locked = false;

  const PC_OF = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

  function nextTarget() {
    target = randomItem(NATURALS);
    badge.textContent = target;
    nameEl.textContent = target;
    matching = false;
    locked = false;
  }

  function setScore() {
    scoreEl.textContent = total ? `${correct} / ${total}` : '';
  }

  function registerHit() {
    locked = true;
    correct += 1;
    total += 1;
    setScore();
    badge.classList.add('hit');
    statusEl.innerHTML = `<span class="ok">✓ Yes — that's ${target}!</span>`;
    setTimeout(() => {
      badge.classList.remove('hit');
      statusEl.innerHTML = '';
      nextTarget();
    }, 750);
  }

  const listener = createPitchListener({
    onUpdate: (info) => {
      // Auto-stop if the user navigated away from this tab.
      if (sectionEl.offsetParent === null) {
        doStop();
        return;
      }
      if (!info) {
        heard.textContent = '—';
        centsEl.textContent = '';
        needle.style.left = '50%';
        needle.classList.remove('in-tune');
        matching = false;
        return;
      }
      heard.textContent = `${info.note}${info.octave}`;
      const c = Math.max(-50, Math.min(50, info.cents));
      needle.style.left = `${50 + c}%`;
      const inTune = Math.abs(info.cents) <= 12;
      needle.classList.toggle('in-tune', inTune);
      centsEl.textContent = ` · ${info.cents > 0 ? '+' : ''}${info.cents}¢`;

      if (locked) return;
      if (info.pc === PC_OF[target]) {
        if (!matching) {
          matching = true;
          heldSince = performance.now();
        } else if (performance.now() - heldSince >= HOLD_MS) {
          registerHit();
        }
      } else {
        matching = false;
      }
    },
    onError: (err) => {
      const denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      hint.innerHTML = denied
        ? '🚫 Mic access was blocked. Allow microphone for this site in your browser settings, then tap again.'
        : `Couldn't start the mic (${err?.name || 'error'}). Make sure a microphone is available.`;
      startBtn.disabled = false;
      startBtn.textContent = '🎤 Start microphone';
    },
  });

  function doStop() {
    listener.stop();
    live.hidden = true;
    panel.hidden = false;
    startBtn.disabled = false;
    startBtn.textContent = '🎤 Start microphone';
    statusEl.innerHTML = '';
  }

  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.textContent = 'Starting…';
    hint.textContent = 'Allow microphone access when prompted…';
    const ok = await listener.start();
    if (ok) {
      panel.hidden = true;
      live.hidden = false;
      correct = 0;
      total = 0;
      setScore();
      nextTarget();
      statusEl.innerHTML = '';
    }
  });

  $('.js-stop').addEventListener('click', doStop);

  nextTarget();
}
