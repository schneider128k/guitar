// Guided Path — a structured curriculum that sequences Find-Note drills:
// open position (to fret 5) first, then the full neck (to fret 12). Progress
// and a daily streak persist in localStorage.
import { createFindDrill } from '../drills/findDrill.js';

const PATH = [
  { id: 'o-C', note: 'C', maxFret: 5, title: 'Find every C', sub: 'Open position · to fret 5' },
  { id: 'o-G', note: 'G', maxFret: 5, title: 'Find every G', sub: 'Open position · to fret 5' },
  { id: 'o-D', note: 'D', maxFret: 5, title: 'Find every D', sub: 'Open position · to fret 5' },
  { id: 'o-A', note: 'A', maxFret: 5, title: 'Find every A', sub: 'Open position · to fret 5' },
  { id: 'o-E', note: 'E', maxFret: 5, title: 'Find every E', sub: 'Open position · to fret 5' },
  { id: 'o-F', note: 'F', maxFret: 5, title: 'Find every F', sub: 'Open position · to fret 5' },
  { id: 'o-B', note: 'B', maxFret: 5, title: 'Find every B', sub: 'Open position · to fret 5' },
  { id: 'o-R', note: 'random', maxFret: 5, title: 'Random naturals', sub: 'Open position · to fret 5' },
  { id: 'n-C', note: 'C', maxFret: 12, title: 'Find every C', sub: 'Full neck · to fret 12' },
  { id: 'n-G', note: 'G', maxFret: 12, title: 'Find every G', sub: 'Full neck · to fret 12' },
  { id: 'n-E', note: 'E', maxFret: 12, title: 'Find every E', sub: 'Full neck · to fret 12' },
  { id: 'n-A', note: 'A', maxFret: 12, title: 'Find every A', sub: 'Full neck · to fret 12' },
  { id: 'n-R', note: 'random', maxFret: 12, title: 'Random naturals', sub: 'Full neck · to fret 12' },
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
            <p class="gp-sub">Learn the natural notes — open position first, then the whole neck.</p>
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
          ${PATH.map((l, i) => lessonRow(l, i, cur)).join('')}
        </ol>
      </section>`;

    container.querySelectorAll('.gp-start').forEach((btn) =>
      btn.addEventListener('click', () => startLesson(+btn.dataset.i)),
    );
    container.querySelectorAll('.gp-redo').forEach((btn) =>
      btn.addEventListener('click', () => startLesson(+btn.dataset.i)),
    );
  }

  function lessonRow(l, i, cur) {
    const isDone = completed.has(l.id);
    const isCurrent = i === cur;
    const locked = i > cur;
    const star = stars.has(l.id) ? '⭐' : '✓';
    const cls = isDone ? 'done' : isCurrent ? 'current' : 'locked';
    const action = isCurrent
      ? `<button class="primary gp-start" data-i="${i}">Start</button>`
      : isDone
        ? `<button class="ghost gp-redo" data-i="${i}">Redo</button>`
        : `<span class="gp-lock">🔒</span>`;
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
        <p class="gp-lesson-label">Lesson ${i + 1} of ${PATH.length} · ${lesson.sub}</p>
        <div class="gp-drill"></div>
      </section>`;
    container.querySelector('.gp-back').addEventListener('click', renderList);

    createFindDrill(container.querySelector('.gp-drill'), {
      note: lesson.note,
      maxFret: lesson.maxFret,
      lessonTitle: lesson.title,
      lessonSub: lesson.sub,
      onComplete: (result) => {
        completed.add(lesson.id);
        if (result.perfect) stars.add(lesson.id);
        save(KEY_DONE, [...completed]);
        save('gp.stars', [...stars]);
        bumpStreak();
      },
      onContinue: renderList,
    });
  }

  renderList();
}
