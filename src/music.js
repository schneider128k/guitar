// Thin music-theory layer. The heavy lifting (note at a position, CAGED boxes)
// is delegated to fretboard.js's FretboardSystem so we have a single source of
// truth that matches what gets rendered on screen.
import { FretboardSystem, Systems } from '@moonwave99/fretboard.js';

export const STRINGS = [1, 2, 3, 4, 5, 6]; // 1 = high E, 6 = low E
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const system = new FretboardSystem({ fretCount: 24 });

/** Note at a board position → { chroma, note, octave }. */
export function noteAt(string, fret) {
  return system.getNoteAtPosition({ string, fret });
}

/** All { string, fret } positions of a pitch class (note letter) up to maxFret. */
export function findPositions(noteName, maxFret) {
  const out = [];
  for (const string of STRINGS) {
    for (let fret = 0; fret <= maxFret; fret++) {
      if (noteAt(string, fret).note === noteName) out.push({ string, fret });
    }
  }
  return out;
}

/** CAGED box positions for a key, marked in-box, with note + scale degree. */
export function cagedBox(root, boxLetter) {
  return system
    .getScale({ type: 'major', root, box: { system: Systems.CAGED, box: boxLetter } })
    .filter((p) => p.inBox)
    .map((p) => ({ string: p.string, fret: p.fret, note: p.note, degree: p.degree }));
}

export const CAGED_BOXES = ['C', 'A', 'G', 'E', 'D'];

/** Deterministic-ish helpers ------------------------------------------------ */
export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
