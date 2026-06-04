import './style.css';
import { randomQuote } from './quotes.js';
import { initGuidedPath } from './views/guidedPath.js';
import { initFindNotes } from './views/findNotes.js';
import { initNameNote } from './views/nameNote.js';
import { initPlay } from './views/play.js';
import { initOpenScales } from './views/openScales.js';
import { initCagedShapes } from './views/cagedShapes.js';

const VIEWS = {
  guided: initGuidedPath,
  find: initFindNotes,
  name: initNameNote,
  play: initPlay,
  open: initOpenScales,
  caged: initCagedShapes,
};

const app = document.getElementById('app');
const tabs = [...document.querySelectorAll('.tab')];
const initialised = new Set();
const panels = {};

function activate(name) {
  // Lazily build a view's panel the first time it's shown. Fretboards need a
  // visible (non-zero-width) container, so we only init on first activation.
  if (!initialised.has(name)) {
    const panel = document.createElement('div');
    panel.className = 'panel';
    app.appendChild(panel);
    panels[name] = panel;
    VIEWS[name](panel);
    initialised.add(name);
  }
  for (const [n, panel] of Object.entries(panels)) {
    panel.style.display = n === name ? 'block' : 'none';
  }
  tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.view === name)));
}

tabs.forEach((tab) => tab.addEventListener('click', () => activate(tab.dataset.view)));
activate('guided');

// A different guitarist's words each visit.
const q = randomQuote();
document.getElementById('epigraph').innerHTML =
  `<blockquote>“${q.text}”</blockquote><figcaption>— ${q.who}</figcaption>`;

// Neck skin — applied globally via a body class, remembered across visits.
const SKINS = ['studio', 'acoustic', 'electric', 'metal'];
const skinButtons = [...document.querySelectorAll('.skin')];

function applySkin(skin) {
  if (!SKINS.includes(skin)) skin = 'studio';
  SKINS.forEach((s) => document.body.classList.toggle(`skin-${s}`, s === skin));
  skinButtons.forEach((b) => b.classList.toggle('active', b.dataset.skin === skin));
  try {
    localStorage.setItem('neckSkin', skin);
  } catch {}
}

skinButtons.forEach((b) => b.addEventListener('click', () => applySkin(b.dataset.skin)));

let savedSkin = 'studio';
try {
  savedSkin = localStorage.getItem('neckSkin') || 'studio';
} catch {}
applySkin(savedSkin);

// Splash: show the key art for a few seconds, then reveal the app (click skips).
const splash = document.getElementById('splash');
if (splash) {
  // A random battle cry on each load — keeps the Ghosts 'n Goblins vibe fresh.
  const SPLASH_PHRASES = [
    '⚡ Summoning the riff…',
    '⚔️ Sharpening the note…',
    '🎸 Tuning up for battle…',
    '🔥 Charging the power chord…',
    '👻 Banishing the C-note goblin…',
    '🛡️ Restoring the cursed fretboard…',
    '⚡ Stringing up the flying-V…',
    '🤘 Loading the shred…',
  ];
  const msg = splash.querySelector('.splash-msg');
  if (msg) msg.textContent = SPLASH_PHRASES[Math.floor(Math.random() * SPLASH_PHRASES.length)];

  const dismiss = () => splash.classList.add('hide');
  const timer = setTimeout(dismiss, 3200);
  splash.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
}
