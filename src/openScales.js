// One-octave open-position major scales for the five "first" guitar keys.
// Positions are the standard textbook fingerings; each note carries its letter
// name + octave so the notation renderer can spell it correctly. These keys all
// use sharps, so sharp spelling is correct throughout.
//
// { string (1=high E .. 6=low E), fret, note, octave }

export const OPEN_SCALES = {
  C: [
    { string: 5, fret: 3, note: 'C', octave: 3 },
    { string: 4, fret: 0, note: 'D', octave: 3 },
    { string: 4, fret: 2, note: 'E', octave: 3 },
    { string: 4, fret: 3, note: 'F', octave: 3 },
    { string: 3, fret: 0, note: 'G', octave: 3 },
    { string: 3, fret: 2, note: 'A', octave: 3 },
    { string: 2, fret: 0, note: 'B', octave: 3 },
    { string: 2, fret: 1, note: 'C', octave: 4 },
  ],
  G: [
    { string: 6, fret: 3, note: 'G', octave: 2 },
    { string: 5, fret: 0, note: 'A', octave: 2 },
    { string: 5, fret: 2, note: 'B', octave: 2 },
    { string: 5, fret: 3, note: 'C', octave: 3 },
    { string: 4, fret: 0, note: 'D', octave: 3 },
    { string: 4, fret: 2, note: 'E', octave: 3 },
    { string: 4, fret: 4, note: 'F#', octave: 3 },
    { string: 3, fret: 0, note: 'G', octave: 3 },
  ],
  D: [
    { string: 4, fret: 0, note: 'D', octave: 3 },
    { string: 4, fret: 2, note: 'E', octave: 3 },
    { string: 4, fret: 4, note: 'F#', octave: 3 },
    { string: 3, fret: 0, note: 'G', octave: 3 },
    { string: 3, fret: 2, note: 'A', octave: 3 },
    { string: 2, fret: 0, note: 'B', octave: 3 },
    { string: 2, fret: 2, note: 'C#', octave: 4 },
    { string: 2, fret: 3, note: 'D', octave: 4 },
  ],
  A: [
    { string: 5, fret: 0, note: 'A', octave: 2 },
    { string: 5, fret: 2, note: 'B', octave: 2 },
    { string: 5, fret: 4, note: 'C#', octave: 3 },
    { string: 4, fret: 0, note: 'D', octave: 3 },
    { string: 4, fret: 2, note: 'E', octave: 3 },
    { string: 4, fret: 4, note: 'F#', octave: 3 },
    { string: 3, fret: 1, note: 'G#', octave: 3 },
    { string: 3, fret: 2, note: 'A', octave: 3 },
  ],
  E: [
    { string: 6, fret: 0, note: 'E', octave: 2 },
    { string: 6, fret: 2, note: 'F#', octave: 2 },
    { string: 6, fret: 4, note: 'G#', octave: 2 },
    { string: 5, fret: 0, note: 'A', octave: 2 },
    { string: 5, fret: 2, note: 'B', octave: 2 },
    { string: 5, fret: 4, note: 'C#', octave: 3 },
    { string: 4, fret: 1, note: 'D#', octave: 3 },
    { string: 4, fret: 2, note: 'E', octave: 3 },
  ],
};

export const OPEN_KEYS = ['C', 'G', 'D', 'A', 'E'];
