// VexFlow wrapper: render a list of notes as standard notation + TAB, stacked.
import {
  Renderer,
  Stave,
  StaveNote,
  TabStave,
  TabNote,
  Voice,
  Formatter,
  Accidental,
  Annotation,
} from 'vexflow';

function buildStaveNotes(notes, { annotate, octaveShift = 0 } = {}) {
  return notes.map((n, i) => {
    const letter = n.note[0].toLowerCase();
    const acc = n.note.length > 1 ? n.note.slice(1) : null;
    const sn = new StaveNote({
      keys: [`${letter}${acc ?? ''}/${n.octave + octaveShift}`],
      duration: 'q',
    });
    if (acc) sn.addModifier(new Accidental(acc), 0);
    if (annotate) sn.addModifier(new Annotation(String(i + 1)).setVerticalJustification(3), 0);
    return sn;
  });
}

/**
 * notes: [{ string, fret, note ('F#'), octave }]
 * Renders a treble staff and a TAB staff into `el`.
 */
export function renderNotation(el, notes) {
  el.innerHTML = '';
  const width = 70 + notes.length * 46;
  const renderer = new Renderer(el, Renderer.Backends.SVG);
  renderer.resize(width, 260);
  const ctx = renderer.getContext();

  const stave = new Stave(10, 0, width - 20).addClef('treble');
  stave.setContext(ctx).draw();

  const tab = new TabStave(10, 120, width - 20).addClef('tab');
  tab.setContext(ctx).draw();

  const staveNotes = buildStaveNotes(notes);

  const tabNotes = notes.map(
    (n) => new TabNote({ positions: [{ str: n.string, fret: n.fret }], duration: 'q' }),
  );

  const makeVoice = (tickables) => {
    const v = new Voice({ numBeats: notes.length, beatValue: 4 }).setStrict(false);
    v.addTickables(tickables);
    return v;
  };

  const voice = makeVoice(staveNotes);
  const tabVoice = makeVoice(tabNotes);

  new Formatter().joinVoices([voice]).joinVoices([tabVoice]).format([voice, tabVoice], width - 80);
  voice.draw(ctx, stave);
  tabVoice.draw(ctx, tab);
}

/**
 * Standard notation ONLY (no TAB, so the answer isn't given away), with a
 * small index number directly below each note and blank room below that for
 * the student to write the note name by hand. notes: [{ note, octave }].
 *
 * Pitches are shifted up one octave from their true sounding pitch — the
 * standard guitar-notation convention (treble clef, sounds 8vb) — since
 * writing the true octave puts the low strings 5-7 ledger lines below the
 * staff, which is what made the original sheet hard to read.
 */
export function renderStaffOnly(el, notes) {
  el.innerHTML = '';
  const width = 70 + notes.length * 46;
  const renderer = new Renderer(el, Renderer.Backends.SVG);
  renderer.resize(width, 190);
  const ctx = renderer.getContext();

  const stave = new Stave(10, 10, width - 20).addClef('treble');
  stave.setContext(ctx).draw();

  const staveNotes = buildStaveNotes(notes, { annotate: true, octaveShift: 1 });
  const voice = new Voice({ numBeats: notes.length, beatValue: 4 }).setStrict(false);
  voice.addTickables(staveNotes);

  new Formatter().joinVoices([voice]).format([voice], width - 80);
  voice.draw(ctx, stave);
  return renderer;
}
