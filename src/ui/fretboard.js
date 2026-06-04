// Wrapper around @moonwave99/fretboard.js so the rest of the app speaks in
// plain { string, fret, ... } dots and never touches the library directly.
import { Fretboard } from '@moonwave99/fretboard.js';

const COLORS = {
  default: '#444',
  root: '#2e7d32',
  found: '#2e7d32',
  wrong: '#c62828',
  highlight: '#1565c0',
};

export function makeFretboard(el, { fretCount = 12, height = 200 } = {}) {
  const fb = new Fretboard({
    el,
    fretCount,
    height,
    width: 960,
    dotSize: 26,
    dotStrokeWidth: 2,
    dotStrokeColor: '#222',
    fretColor: '#bbb',
    stringColor: '#888',
    showFretNumbers: true,
    font: 'Helvetica, Arial, sans-serif',
  });
  fb.render();
  return fb;
}

/**
 * Render a set of dots. Each dot may carry:
 *   status: 'default' | 'root' | 'found' | 'wrong' | 'highlight'
 *   label:  text to show inside the dot (note name, degree, etc.)
 */
export function renderDots(fb, dots) {
  fb.setDots(dots).render();
  fb.style({
    fill: (d) => COLORS[d.status] || COLORS.default,
    text: (d) => d.label ?? '',
    fontFill: '#fff',
    fontSize: 12,
  });
  return fb;
}

export { COLORS };
