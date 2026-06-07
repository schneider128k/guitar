import { chromium } from 'playwright';
const URL = process.env.SMOKE_URL || 'http://localhost:4173/guitar/';
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const out = {};

// Helper: open a lesson by its visible title text.
async function startByTitle(title) {
  const li = page.locator('.gp-item', { hasText: title }).first();
  await li.locator('button').click();
  await page.waitForTimeout(300);
}

await page.click('.tab[data-view="guided"]');
await page.waitForTimeout(300);

// Section headers present and distinct
out.sections = await page.locator('.gp-section').allInnerTexts();

// No lesson is locked anymore
out.lockIcons = await page.locator('.gp-lock').count();
out.startButtons = await page.locator('.gp-item .gp-start, .gp-item .gp-redo').count();
out.totalItems = await page.locator('.gp-item').count();

// ---- Random naturals marathon: no study phase, A appears over a round -------
await startByTitle('Quiz all naturals');
out.marathonHasStudyBtn = await page.locator('.gp-drill .js-go').count(); // expect 0
out.marathonHasStop = await page.locator('.gp-drill .js-stop').count(); // expect 1
out.marathonFirstHeader = await page.locator('.gp-drill .js-h').innerText();

// Auto-solve one full round by clicking the correct cells for the current note,
// recording which note letters we were quizzed on (badge text).
const seen = new Set();
for (let step = 0; step < 12; step++) {
  const banner = await page.locator('.gp-drill .fn-done').count();
  if (banner) break; // round complete banner
  const badge = (await page.locator('.gp-drill .js-badge').innerText()).trim();
  seen.add(badge);
  // Find all cells whose note matches by brute force: click every cell, the
  // drill ignores wrong picks (counts a miss) but we want correctness, so
  // instead read targets from pip count and click known positions via the
  // board's data. Simplest: click all fret cells on all strings 0..12; correct
  // ones register, wrong ones flash. To avoid huge miss counts, we click only
  // until pips fill.
  const pipsTotal = await page.locator('.gp-drill .pip').count();
  const cells = await page.locator('.gp-drill .fb-cell').elementHandles();
  let filled = 0;
  for (const cell of cells) {
    if (filled >= pipsTotal) break;
    await cell.click();
    filled = await page.locator('.gp-drill .pip.on').count();
  }
  await page.waitForTimeout(950); // advance flash / round banner
}
out.notesSeenInRound = [...seen].sort().join('');
out.sawA = seen.has('A');

// Stop returns to the path
await page.locator('.gp-drill .js-stop').click();
await page.waitForTimeout(300);
out.backToPath = await page.locator('.gp-list').count();

// ---- Single-string E lesson: has a study screen, dots only on string 6 ------
await startByTitle('Memorize every natural on the low E string');
out.eHasStudyBtn = await page.locator('.gp-drill .js-go').count(); // expect 1
const studyStrings = await page.locator('.gp-drill .fb-dot-g').evaluateAll((nodes) => nodes.length);
out.eStudyDotCount = studyStrings;
// All study dots should sit on the low E row (string 6). Check by y-position:
out.eStudyHeader = await page.locator('.gp-drill .js-h').innerText();
await page.click('.gp-drill .js-go');
await page.waitForTimeout(300);
out.eQuizHeader = await page.locator('.gp-drill .js-h').innerText();
await page.locator('.gp-drill .js-stop').click();
await page.waitForTimeout(200);

// ---- Hide string names toggle ----------------------------------------------
out.tuningVisibleBefore = await page.locator('.fb-tuning').first().isVisible().catch(() => false);
await page.click('#toggle-tuning');
await page.waitForTimeout(150);
out.bodyHideClass = await page.evaluate(() => document.body.classList.contains('hide-tuning'));
out.toggleLabel = await page.locator('#toggle-tuning').innerText();
out.tuningVisibleAfter = await page.locator('.fb-tuning').first().isVisible().catch(() => false);

console.log('REPORT', JSON.stringify(out, null, 2));
console.log('ERRORS', errors.length ? JSON.stringify(errors, null, 2) : 'none');
await browser.close();
process.exit(errors.length ? 1 : 0);
