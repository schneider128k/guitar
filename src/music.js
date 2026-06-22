// Thin music-theory layer. The heavy lifting (note at a position, CAGED boxes)
// is delegated to fretboard.js's FretboardSystem so we have a single source of
// truth that matches what gets rendered on screen.
import { FretboardSystem, Systems } from '@moonwave99/fretboard.js';

export const STRINGS = [1, 2, 3, 4, 5, 6]; // 1 = high E, 6 = low E
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// The 5 accidental pitch classes, named the way the board layer spells them (sharps).
export const ACCIDENTALS = ['C#', 'D#', 'F#', 'G#', 'A#'];

// Enharmonic spelling. The note layer is sharps-only, so to support flats we map
// each flat spelling to the sharp the board actually returns, and vice versa for
// building the dual "C♯ / D♭" labels learners should recognize.
const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
const SHARP_TO_FLAT = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

/** Normalize any spelling (e.g. 'Gb') to the sharp spelling the board uses ('F#'). */
export function toSharp(name) {
  return FLAT_TO_SHARP[name] || name;
}

/** Short display glyph for a note, e.g. 'C#' → 'C♯'. Naturals pass through. */
export function noteShort(name) {
  return toSharp(name).replace('#', '♯');
}

/** Pretty dual label, e.g. 'C#' → 'C♯ / D♭'. Naturals pass through unchanged. */
export function noteLabel(name) {
  const sharp = toSharp(name);
  const flat = SHARP_TO_FLAT[sharp];
  return flat ? `${sharp.replace('#', '♯')} / ${flat.replace('b', '♭')}` : sharp;
}

const system = new FretboardSystem({ fretCount: 24 });

/** Note at a board position → { chroma, note, octave }. */
export function noteAt(string, fret) {
  return system.getNoteAtPosition({ string, fret });
}

/** Pitch-class number (0–11) for any note spelling, e.g. 'C#'/'Db' → 1. */
export function chromaOf(name) {
  return NOTE_NAMES.indexOf(toSharp(name));
}

/**
 * All { string, fret } positions of a pitch class up to maxFret. Matched by
 * chroma, not name, because the board layer spells accidentals as flats
 * (e.g. 'Db') while we accept either spelling.
 */
export function findPositions(noteName, maxFret) {
  const chroma = chromaOf(noteName);
  const out = [];
  for (const string of STRINGS) {
    for (let fret = 0; fret <= maxFret; fret++) {
      if (noteAt(string, fret).chroma === chroma) out.push({ string, fret });
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

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];

/** Pitch-class set (chroma numbers) of a major scale, e.g. 'C' -> {0,2,4,5,7,9,11}. */
export function majorScaleChromas(root) {
  const rootChroma = chromaOf(root);
  return new Set(MAJOR_STEPS.map((step) => (rootChroma + step) % 12));
}

/**
 * The full playable scale line for one CAGED box: every box note plus the
 * one-fret extension on each side of the box that's still a scale tone (the
 * "reach for it, you already know it" notes just outside the box), merged,
 * deduped by pitch (box position preferred over extension), sorted low to
 * high. Each entry: { string, fret, note, octave, degree, extension }.
 */
export function boxScaleSequence(root, boxLetter) {
  const box = cagedBox(root, boxLetter);
  const scaleChromas = majorScaleChromas(root);
  const minFret = Math.min(...box.map((p) => p.fret));
  const maxFret = Math.max(...box.map((p) => p.fret));

  const byPitch = new Map(); // pitch -> entry, box entries inserted first so they win
  const pitchOf = (string, fret) => {
    const n = noteAt(string, fret);
    return { pitch: n.octave * 12 + n.chroma, note: n.note, octave: n.octave };
  };

  for (const p of box) {
    const { pitch, note, octave } = pitchOf(p.string, p.fret);
    byPitch.set(pitch, { string: p.string, fret: p.fret, note, octave, degree: p.degree, extension: false });
  }
  for (const string of STRINGS) {
    for (const fret of [minFret - 1, maxFret + 1]) {
      if (fret < 0) continue;
      const n = noteAt(string, fret);
      if (!scaleChromas.has(n.chroma)) continue;
      const { pitch, note, octave } = pitchOf(string, fret);
      if (!byPitch.has(pitch)) {
        byPitch.set(pitch, { string, fret, note, octave, degree: null, extension: true });
      }
    }
  }

  return [...byPitch.entries()].sort((a, b) => a[0] - b[0]).map(([, entry]) => entry);
}

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
