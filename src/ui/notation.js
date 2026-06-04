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
} from 'vexflow';

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

  const staveNotes = notes.map((n) => {
    const letter = n.note[0].toLowerCase();
    const acc = n.note.length > 1 ? n.note.slice(1) : null;
    const sn = new StaveNote({
      keys: [`${letter}${acc ?? ''}/${n.octave}`],
      duration: 'q',
    });
    if (acc) sn.addModifier(new Accidental(acc), 0);
    return sn;
  });

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
