// Guided Path — a structured curriculum that sequences the note drills:
// naturals open position (to fret 5) first, then the full neck (to fret 12),
// then the two root strings (for barre & power chords), then sharps & flats.
// Each "Study every X" lesson runs a study (memorize) phase, then a quiz; the
// "Random …" lessons are no-study recall marathons. Progress and a daily streak
// persist in localStorage.
import { createFindDrill } from '../drills/findDrill.js';
import { createHalfStepsDrill } from '../drills/halfStepsDrill.js';
import { createMarathonDrill } from '../drills/marathonDrill.js';
import { ACCIDENTALS } from '../music.js';

const NATURALS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const S_THEORY = 'Music theory';
const S_NAT_OPEN = 'Naturals · Open position (frets 0–5)';
const S_NAT_NECK = 'Naturals · Full neck (frets 0–12)';
const S_ROOTS = 'Root strings · E & A · naturals (barre & power chords)';
const S_ACC_OPEN = 'Sharps & flats · Open position (frets 0–5)';
const S_ROOTS_ACC = 'Root strings · E & A · sharps & flats (barre & power chords)';
const S_ACC_NECK = 'Sharps & flats · Full neck (frets 0–12)';
const S_FINAL = 'Final exam · all 12 notes';

const PATH = [
  { id: 'th-half', type: 'halfsteps', section: S_THEORY, title: 'Half steps between the notes', sub: 'Start here' },

  // Naturals in open position — study each, then quiz.
  { id: 'o-C', note: 'C', maxFret: 5, section: S_NAT_OPEN, title: 'Memorize every C', sub: 'Memorize, then quiz' },
  { id: 'o-G', note: 'G', maxFret: 5, section: S_NAT_OPEN, title: 'Memorize every G', sub: 'Memorize, then quiz' },
  { id: 'o-D', note: 'D', maxFret: 5, section: S_NAT_OPEN, title: 'Memorize every D', sub: 'Memorize, then quiz' },
  { id: 'o-A', note: 'A', maxFret: 5, section: S_NAT_OPEN, title: 'Memorize every A', sub: 'Memorize, then quiz' },
  { id: 'o-E', note: 'E', maxFret: 5, section: S_NAT_OPEN, title: 'Memorize every E', sub: 'Memorize, then quiz' },
  { id: 'o-F', note: 'F', maxFret: 5, section: S_NAT_OPEN, title: 'Memorize every F', sub: 'Memorize, then quiz' },
  { id: 'o-B', note: 'B', maxFret: 5, section: S_NAT_OPEN, title: 'Memorize every B', sub: 'Memorize, then quiz' },
  { id: 'o-R', marathon: true, pool: 'naturals', maxFret: 5, section: S_NAT_OPEN, title: 'Quiz all naturals', sub: 'Exam mode — recall every note until you stop' },

  // The two root strings, across the whole neck — a focused ramp from open
  // position to the full neck (just 2 strings before all 6). Knowing these cold
  // is what lets you place barre and power chords anywhere on the neck.
  { id: 'r-E6', marathon: true, pool: 'naturals', maxFret: 12, strings: [6], stringsLabel: 'low E string (6th)', study: true, section: S_ROOTS, title: 'Memorize every natural on the low E string', sub: '6th string · study, then quiz · frets 0–12' },
  { id: 'r-A5', marathon: true, pool: 'naturals', maxFret: 12, strings: [5], stringsLabel: 'A string (5th)', study: true, section: S_ROOTS, title: 'Memorize every natural on the A string', sub: '5th string · study, then quiz · frets 0–12' },
  { id: 'r-R', marathon: true, pool: 'naturals', maxFret: 12, strings: [6, 5], stringsLabel: 'E & A strings', section: S_ROOTS, title: 'Quiz all naturals on the E & A strings', sub: 'Exam mode — quiz only, recall until you stop' },

  // The same naturals across the whole neck — now all six strings.
  { id: 'n-C', note: 'C', maxFret: 12, section: S_NAT_NECK, title: 'Memorize every C', sub: 'Memorize, then quiz' },
  { id: 'n-G', note: 'G', maxFret: 12, section: S_NAT_NECK, title: 'Memorize every G', sub: 'Memorize, then quiz' },
  { id: 'n-D', note: 'D', maxFret: 12, section: S_NAT_NECK, title: 'Memorize every D', sub: 'Memorize, then quiz' },
  { id: 'n-A', note: 'A', maxFret: 12, section: S_NAT_NECK, title: 'Memorize every A', sub: 'Memorize, then quiz' },
  { id: 'n-E', note: 'E', maxFret: 12, section: S_NAT_NECK, title: 'Memorize every E', sub: 'Memorize, then quiz' },
  { id: 'n-F', note: 'F', maxFret: 12, section: S_NAT_NECK, title: 'Memorize every F', sub: 'Memorize, then quiz' },
  { id: 'n-B', note: 'B', maxFret: 12, section: S_NAT_NECK, title: 'Memorize every B', sub: 'Memorize, then quiz' },
  { id: 'n-R', marathon: true, pool: 'naturals', maxFret: 12, section: S_NAT_NECK, title: 'Quiz all naturals', sub: 'Exam mode — recall every note until you stop' },

  // The 5 accidentals (each shown with both its sharp and flat name).
  { id: 'a-Cs', note: 'C#', maxFret: 5, section: S_ACC_OPEN, title: 'Memorize every C♯ / D♭', sub: 'Memorize, then quiz' },
  { id: 'a-Ds', note: 'D#', maxFret: 5, section: S_ACC_OPEN, title: 'Memorize every D♯ / E♭', sub: 'Memorize, then quiz' },
  { id: 'a-Fs', note: 'F#', maxFret: 5, section: S_ACC_OPEN, title: 'Memorize every F♯ / G♭', sub: 'Memorize, then quiz' },
  { id: 'a-Gs', note: 'G#', maxFret: 5, section: S_ACC_OPEN, title: 'Memorize every G♯ / A♭', sub: 'Memorize, then quiz' },
  { id: 'a-As', note: 'A#', maxFret: 5, section: S_ACC_OPEN, title: 'Memorize every A♯ / B♭', sub: 'Memorize, then quiz' },
  { id: 'a-R', marathon: true, pool: 'accidentals', maxFret: 5, section: S_ACC_OPEN, title: 'Quiz all sharps & flats', sub: 'Exam mode — recall every note until you stop' },

  // Same ramp as the naturals: the accidentals on the two root strings, where
  // sharp/flat barre & power chords (F♯5, B♭, E♭, …) take their roots.
  { id: 'ra-E6', marathon: true, pool: 'accidentals', maxFret: 12, strings: [6], stringsLabel: 'low E string (6th)', study: true, section: S_ROOTS_ACC, title: 'Memorize the sharps & flats on the low E string', sub: '6th string · study, then quiz · frets 0–12' },
  { id: 'ra-A5', marathon: true, pool: 'accidentals', maxFret: 12, strings: [5], stringsLabel: 'A string (5th)', study: true, section: S_ROOTS_ACC, title: 'Memorize the sharps & flats on the A string', sub: '5th string · study, then quiz · frets 0–12' },
  { id: 'ra-R', marathon: true, pool: 'accidentals', maxFret: 12, strings: [6, 5], stringsLabel: 'E & A strings', section: S_ROOTS_ACC, title: 'Quiz all sharps & flats on the E & A strings', sub: 'Exam mode — quiz only, recall until you stop' },

  // Sharps & flats across the whole neck.
  { id: 'an-Cs', note: 'C#', maxFret: 12, section: S_ACC_NECK, title: 'Memorize every C♯ / D♭', sub: 'Memorize, then quiz' },
  { id: 'an-Ds', note: 'D#', maxFret: 12, section: S_ACC_NECK, title: 'Memorize every D♯ / E♭', sub: 'Memorize, then quiz' },
  { id: 'an-Fs', note: 'F#', maxFret: 12, section: S_ACC_NECK, title: 'Memorize every F♯ / G♭', sub: 'Memorize, then quiz' },
  { id: 'an-Gs', note: 'G#', maxFret: 12, section: S_ACC_NECK, title: 'Memorize every G♯ / A♭', sub: 'Memorize, then quiz' },
  { id: 'an-As', note: 'A#', maxFret: 12, section: S_ACC_NECK, title: 'Memorize every A♯ / B♭', sub: 'Memorize, then quiz' },
  { id: 'an-R', marathon: true, pool: 'accidentals', maxFret: 12, section: S_ACC_NECK, title: 'Quiz all sharps & flats', sub: 'Exam mode — recall every note until you stop' },

  // The capstone — every note, naturals and accidentals together. Staged the
  // same way as the rest of the path: open position first, then the full neck.
  { id: 'final-5', marathon: true, pool: 'all', maxFret: 5, section: S_FINAL, title: '🎓 The ultimate test — to fret 5', sub: 'Every natural, sharp & flat in open position · recall until you stop' },
  { id: 'final-12', marathon: true, pool: 'all', maxFret: 12, section: S_FINAL, title: '🏆 The ultimate test — full neck', sub: 'Every natural, sharp & flat to fret 12 · recall until you stop' },
];

const KEY_DONE = 'gp.completed';
const KEY_STREAK = 'gp.streak';
const today = () => new Date().toISOString().slice(0, 10);

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function initGuidedPath(container) {
  let completed = new Set(load(KEY_DONE, []));
  let stars = new Set(load('gp.stars', []));
  let streak = load(KEY_STREAK, { count: 0, last: null });

  function bumpStreak() {
    const t = today();
    if (streak.last === t) return; // already counted today
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    streak = { count: streak.last === yesterday ? streak.count + 1 : 1, last: t };
    save(KEY_STREAK, streak);
  }

  function currentIndex() {
    const i = PATH.findIndex((l) => !completed.has(l.id));
    return i === -1 ? PATH.length : i;
  }

  function renderList() {
    const cur = currentIndex();
    const done = completed.size;
    const pct = Math.round((done / PATH.length) * 100);
    const streakLine = streak.count > 0
      ? `<span class="gp-streak">🔥 ${streak.count}-day streak</span>`
      : `<span class="gp-streak gp-streak--off">Practice today to start a streak</span>`;

    container.innerHTML = `
      <section class="view gp">
        <div class="gp-head">
          <div>
            <h2 class="gp-title">Your path</h2>
            <p class="gp-sub">Start with how the notes are spaced, then learn the naturals — open position, then the whole neck — lock in the E &amp; A root strings for barre &amp; power chords, then the sharps &amp; flats — and finish with the ultimate test. Jump in anywhere.</p>
          </div>
          ${streakLine}
        </div>
        <div class="gp-progress"><div class="gp-progress-bar" style="width:${pct}%"></div></div>
        <p class="gp-count">${done} / ${PATH.length} lessons complete</p>
        ${
          cur >= PATH.length
            ? `<div class="gp-finished">🏆 You finished the path. Keep reviewing with the Find Notes &amp; Name the Note tabs!</div>`
            : ''
        }
        <ol class="gp-list">
          ${renderRows(cur)}
        </ol>
      </section>`;

    container.querySelectorAll('.gp-start').forEach((btn) =>
      btn.addEventListener('click', () => startLesson(+btn.dataset.i)),
    );
    container.querySelectorAll('.gp-redo').forEach((btn) =>
      btn.addEventListener('click', () => startLesson(+btn.dataset.i)),
    );
  }

  // Walk the path, emitting a section header whenever the section changes.
  // Every lesson is open — no locking — so the student can jump in anywhere.
  function renderRows(cur) {
    let lastSection = null;
    return PATH.map((l, i) => {
      let header = '';
      if (l.section !== lastSection) {
        header = `<li class="gp-section">${l.section}</li>`;
        lastSection = l.section;
      }
      return header + lessonRow(l, i, cur);
    }).join('');
  }

  function lessonRow(l, i, cur) {
    const isDone = completed.has(l.id);
    const isCurrent = i === cur;
    const star = stars.has(l.id) ? '⭐' : '✓';
    const cls = isDone ? 'done' : isCurrent ? 'current' : '';
    const action = isDone
      ? `<button class="ghost gp-redo" data-i="${i}">Redo</button>`
      : `<button class="primary gp-start" data-i="${i}">Start</button>`;
    const mark = isDone ? `<span class="gp-mark">${star}</span>` : `<span class="gp-num">${i + 1}</span>`;
    return `
      <li class="gp-item ${cls}">
        ${mark}
        <div class="gp-item-text">
          <span class="gp-item-title">${l.title}</span>
          <span class="gp-item-sub">${l.sub}</span>
        </div>
        ${action}
      </li>`;
  }

  function startLesson(i) {
    const lesson = PATH[i];
    container.innerHTML = `
      <section class="view gp-active">
        <button class="ghost gp-back">← Path</button>
        <p class="gp-lesson-label">Lesson ${i + 1} of ${PATH.length} · ${lesson.section}</p>
        <div class="gp-drill"></div>
      </section>`;
    container.querySelector('.gp-back').addEventListener('click', renderList);

    const onComplete = (result) => {
      completed.add(lesson.id);
      if (result.perfect) stars.add(lesson.id);
      save(KEY_DONE, [...completed]);
      save('gp.stars', [...stars]);
      bumpStreak();
    };
    const drillEl = container.querySelector('.gp-drill');

    if (lesson.type === 'halfsteps') {
      createHalfStepsDrill(drillEl, { onComplete, onContinue: renderList });
    } else if (lesson.marathon) {
      const pool =
        lesson.pool === 'naturals'
          ? NATURALS
          : lesson.pool === 'accidentals'
            ? ACCIDENTALS
            : [...NATURALS, ...ACCIDENTALS]; // 'all' — the ultimate test
      createMarathonDrill(drillEl, {
        pool,
        maxFret: lesson.maxFret,
        strings: lesson.strings,
        stringsLabel: lesson.stringsLabel,
        study: lesson.study,
        onComplete,
        onStop: renderList,
      });
    } else {
      createFindDrill(drillEl, {
        note: lesson.note,
        maxFret: lesson.maxFret,
        lessonTitle: lesson.title,
        lessonSub: lesson.sub,
        onComplete,
        onContinue: renderList,
      });
    }
  }

  renderList();
}
