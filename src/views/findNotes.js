// Find Notes tab — free-play wrapper around the shared Learn → Quiz drill.
import { createFindDrill } from '../drills/findDrill.js';

export function initFindNotes(container) {
  createFindDrill(container, { note: 'C', maxFret: 12, selectable: true });
}
