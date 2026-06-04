import './style.css';
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
