import './style.css';
import { randomQuote } from './quotes.js';
import { initFindNotes } from './views/findNotes.js';
import { initNameNote } from './views/nameNote.js';
import { initOpenScales } from './views/openScales.js';
import { initCagedShapes } from './views/cagedShapes.js';

const VIEWS = {
  find: initFindNotes,
  name: initNameNote,
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
activate('find');

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
