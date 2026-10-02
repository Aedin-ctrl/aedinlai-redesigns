// Gates a page before it is allowed to live, and scores the survivors so a cull is a measurement
// rather than a taste call.
//
//   node tools/check.mjs            # check every page, write pages/scores.json
//   node tools/check.mjs <slug>     # check one
//
// A page that fails a GATE is unfit regardless of how it looks: accessibility violations, a
// horizontal scrollbar on a phone, a script error, or ignoring prefers-reduced-motion. Those are
// not matters of taste and nothing pretty earns its way past them.
import { chromium, webkit } from 'playwright-core';
import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { extname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AXE = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');
const only = process.argv[2];

const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript',
  '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2' };
const srv = createServer((req, res) => {
  let p = join(ROOT, decodeURI(req.url.split('?')[0]));
  try { if (statSync(p).isDirectory()) p = join(p, 'index.html'); } catch {}
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise((r) => srv.listen(0, r));
const BASE = `http://127.0.0.1:${srv.address().port}`;

const slugs = readdirSync(join(ROOT, 'pages'))
  .filter((d) => existsSync(join(ROOT, 'pages', d, 'index.html')))
  .filter((d) => !only || d === only);

function dirBytes(dir) {
  let n = 0;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const s = statSync(p);
    n += s.isDirectory() ? dirBytes(p) : s.size;
  }
  return n;
}

const chrome = await chromium.launch({ channel: 'chrome', headless: true });
const safari = await webkit.launch({ headless: true });
const results = [];

for (const slug of slugs) {
  const url = `${BASE}/pages/${slug}/`;
  const r = { slug, gates: {}, signals: {}, fails: [] };

  // ---- desktop pass: accessibility, errors, and the craft signals ----
  const page = await chrome.newPage({ viewport: { width: 1340, height: 900 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 35000 });
    await page.waitForTimeout(1800);
    await page.addScriptTag({ content: AXE });
    const a = await page.evaluate(async () => await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
    r.gates.a11y = a.violations.reduce((n, v) => n + v.nodes.length, 0);
    r.a11yDetail = a.violations.map((v) => `${v.id} x${v.nodes.length}`);

    // craft signals: things that correlate with a page having been thought about
    r.signals = await page.evaluate(() => {
      const css = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } });
      const text = css.map((x) => x.cssText).join('\n');
      const has = (re) => re.test(text);
      return {
        reducedMotion: /prefers-reduced-motion/.test(text),
        focusVisible: /:focus-visible/.test(text),
        customProps: new Set(text.match(/--[a-z0-9-]+\s*:/gi) || []).size,
        keyframes: css.filter((x) => x.type === 7 || x.constructor.name === 'CSSKeyframesRule').length,
        transitions: (text.match(/transition[^;]*;/g) || []).length,
        mediaQueries: new Set(text.match(/@media[^{]+/g) || []).size,
        interactive: document.querySelectorAll('button, a[href], input, [tabindex]').length,
        landmarks: document.querySelectorAll('header, nav, main, footer, section[aria-label], section[aria-labelledby]').length,
        headings: document.querySelectorAll('h1,h2,h3').length,
        svg: document.querySelectorAll('svg').length,
        canvas: document.querySelectorAll('canvas').length,
        textChars: document.body.innerText.replace(/\s+/g, ' ').length,
      };
    });

    // reduced motion must actually be honoured, not merely mentioned
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(600);
    r.gates.motionRespected = await page.evaluate(() => {
      const moving = [...document.querySelectorAll('*')].filter((el) => {
        const cs = getComputedStyle(el);
        const dur = parseFloat(cs.animationDuration) || 0;
        const play = cs.animationPlayState;
        return dur > 0.08 && play === 'running' && cs.animationIterationCount === 'infinite';
      });
      return moving.length === 0;
    });
    await page.emulateMedia({ reducedMotion: null });
  } catch (e) {
    r.fails.push('load: ' + e.message.slice(0, 70));
  }
  r.gates.errors = errs.length;
  r.errorDetail = errs.slice(0, 2);
  await page.close();

  // ---- phone pass, in both engines: overflow is the commonest real breakage ----
  for (const [engine, name] of [[chrome, 'chrome'], [safari, 'webkit']]) {
    const p2 = await engine.newPage({ viewport: { width: 390, height: 844 } });
    const e2 = [];
    p2.on('pageerror', (e) => e2.push(e.message));
    try {
      await p2.goto(url, { waitUntil: 'load', timeout: 35000 });
      await p2.waitForTimeout(1200);
      r.gates[`overflow_${name}`] = await p2.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth + 1);
      if (name === 'webkit') {
        await p2.addScriptTag({ content: AXE });
        const a2 = await p2.evaluate(async () => await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
        r.gates.a11yPhone = a2.violations.reduce((n, v) => n + v.nodes.length, 0);
      }
    } catch (e) { r.fails.push(`${name} phone: ` + e.message.slice(0, 60)); }
    if (e2.length) r.gates.errors += e2.length;
    await p2.close();
  }

  // ---- a thumbnail, which doubles as the distinctiveness measure ----
  const shot = await chrome.newPage({ viewport: { width: 1200, height: 800 } });
  try {
    await shot.goto(url, { waitUntil: 'load' });
    await shot.waitForTimeout(1600);
    const png = await shot.screenshot();
    await sharp(png).resize(600).webp({ quality: 74 }).toFile(join(ROOT, 'shots', `${slug}.webp`));
    // a tiny greyscale fingerprint: pages that look alike have close fingerprints
    r.fingerprint = [...(await sharp(png).greyscale().resize(16, 16, { fit: 'fill' }).raw().toBuffer())];
  } catch (e) { r.fails.push('shot: ' + e.message.slice(0, 50)); }
  await shot.close();

  r.bytes = dirBytes(join(ROOT, 'pages', slug));
  results.push(r);
}

await chrome.close();
await safari.close();
srv.close();

// ---- distinctiveness: how far is this page from the nearest other page? ----
const dist = (a, b) => {
  if (!a || !b) return 999;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s / a.length);
};
for (const r of results) {
  const others = results.filter((o) => o !== r && o.fingerprint);
  r.nearest = others.length
    ? Math.round(Math.min(...others.map((o) => dist(r.fingerprint, o.fingerprint))))
    : 99;
  delete r.fingerprint;
}

// ---- score ----
// Gates are pass/fail and make a page unfit. Everything else is a weighted signal. Distinctiveness
// is weighted heavily on purpose: a cull that only rewards polish converges on twenty of the same
// page, which is the failure this whole exercise is trying to avoid.
for (const r of results) {
  const g = r.gates;
  r.fit = !r.fails.length && !g.a11y && !g.a11yPhone && !g.errors
    && !g.overflow_chrome && !g.overflow_webkit && g.motionRespected !== false;
  const s = r.signals || {};
  r.score = Math.round(
    (r.fit ? 40 : 0)
    + Math.min(22, r.nearest * 1.1)                       // unlike its siblings
    + Math.min(10, (s.keyframes || 0) * 1.6)              // has motion of its own
    + Math.min(8, (s.customProps || 0) * 0.22)            // has a system behind it
    + Math.min(7, (s.interactive || 0) * 0.5)             // is actually usable
    + (s.focusVisible ? 4 : 0)
    + (s.reducedMotion ? 4 : 0)
    + Math.min(5, (s.landmarks || 0) * 1.2)
    + Math.min(4, (s.svg || 0) * 0.8)
    - Math.max(0, (r.bytes - 120000) / 60000)             // weight is a cost, past ~120 KB
  );
}

results.sort((a, b) => b.score - a.score);
writeFileSync(join(ROOT, 'pages/scores.json'), JSON.stringify(results, null, 2) + '\n');

for (const r of results) {
  const why = r.fit ? '' : `  UNFIT: ${[
    r.gates.a11y && `a11y ${r.gates.a11y}`,
    r.gates.a11yPhone && `a11yPhone ${r.gates.a11yPhone}`,
    r.gates.errors && `errors ${r.gates.errors}`,
    r.gates.overflow_chrome && 'overflow',
    r.gates.overflow_webkit && 'overflow-webkit',
    r.gates.motionRespected === false && 'ignores reduced-motion',
    ...r.fails,
  ].filter(Boolean).join(', ')}`;
  console.log(`  ${String(r.score).padStart(3)}  ${r.slug.padEnd(22)} unlike:${String(r.nearest).padStart(3)} ${(r.bytes/1024).toFixed(0).padStart(4)}KB${why}`);
}
console.log(`\n${results.filter((r) => r.fit).length}/${results.length} fit`);
