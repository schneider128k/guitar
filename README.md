# 🎸 Guitar Trainer

An interactive web app for learning the guitar fretboard, major scales, and
movable CAGED shapes. Built with [Vite](https://vitejs.dev/),
[fretboard.js](https://github.com/moonwave99/fretboard.js) for neck diagrams,
and [VexFlow](https://www.vexflow.com/) for standard notation + TAB.

**Live site:** https://schneider128k.github.io/guitar/

## Current prototype

| Tab | What it does |
| --- | --- |
| **Find Notes** | Click every position of a target note (e.g. all C's) up to a chosen fret. Scored with mistakes + time. |
| **Name the Note** | A position is highlighted; pick its name from four choices. |
| **Open-Position Scales** | Browse the five first-position major scales (C, G, D, A, E) as fretboard + notation + TAB. |
| **CAGED Shapes** | Explore the 5 movable major-scale shapes in any key; toggle note names / scale degrees. |

## Roadmap ideas

- 🎤 **Play-the-note mode** — detect pitch from the mic (Web Audio + pitch
  detection) so you can answer by playing instead of clicking.
- Scale quizzes (identify the key / complete the scale).
- 3-notes-per-string shapes; chords.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

Deployment is automated: pushing to `main` triggers
`.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.
