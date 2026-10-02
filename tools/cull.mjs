// Retires the weakest pages and keeps the set from collapsing into twenty of the same page.
//
//   node tools/cull.mjs            # say what it would do
//   node tools/cull.mjs --apply    # do it
//   node tools/cull.mjs --apply -n 5
//
// Run `node tools/check.mjs` first — this reads pages/scores.json and does not measure anything
// itself.
//
// Culling by lowest score alone is the obvious thing and it is wrong: it rewards polish, and after
// a dozen rounds a loop that rewards polish converges on one page made twenty times. So the rule
// here is **cull the weaker member of the closest pair**. Near-duplicates are the defect that
// cannot be fixed by editing, so they go first; a page that is merely quiet but unlike anything
// else survives, which is the whole point of keeping twenty.
//
// Three guards, because an unattended loop that runs all night will otherwise eat something good:
//   - elitism      the top N by score are never cullable
//   - minimum age  nothing dies before it has been scored twice, so one flaky run cannot kill it
//   - pinned       anything listed in keep.json is permanent
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, rmSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const apply = process.argv.includes('--apply');
const N = Number(process.argv[process.argv.indexOf('-n') + 1]) || 5;
const ELITE = 3;
const MIN_AGE = 2;

const read = (p, fallback) => (existsSync(join(ROOT, p)) ? JSON.parse(readFileSync(join(ROOT, p), 'utf8')) : fallback);
const scores = read('pages/scores.json', null);
if (!scores) { console.error('no pages/scores.json — run tools/check.mjs first'); process.exit(2); }

const manifest = read('pages/manifest.json', []);
const state = read('pages/state.json', { round: 0, age: {} });
const pinned = new Set(read('keep.json', []));

state.round += 1;
for (const r of scores) state.age[r.slug] = (state.age[r.slug] || 0) + 1;

const byScore = [...scores].sort((a, b) => b.score - a.score);
const elite = new Set(byScore.slice(0, ELITE).map((r) => r.slug));

const why = (r) =>
  pinned.has(r.slug) ? 'pinned'
  : elite.has(r.slug) ? `top ${ELITE}`
  : (state.age[r.slug] || 0) < MIN_AGE ? `only scored ${state.age[r.slug]}x`
  : null;

const alive = new Map(scores.map((r) => [r.slug, r]));
const doomed = [];

// Pass 1 — anything that failed a gate is unfit and goes regardless of how it looks.
for (const r of byScore.slice().reverse()) {
  if (doomed.length >= N) break;
  if (r.fit) continue;
  const guard = pinned.has(r.slug) ? 'pinned' : null;   // unfit beats elitism and age; it is broken
  if (guard) continue;
  doomed.push({ ...r, reason: 'unfit: ' + [
    r.gates.a11y && `a11y ${r.gates.a11y}`,
    r.gates.a11yPhone && `a11y on a phone ${r.gates.a11yPhone}`,
    r.gates.errors && `${r.gates.errors} script errors`,
    (r.gates.overflow_chrome || r.gates.overflow_webkit) && 'overflows a phone',
    r.gates.motionRespected === false && 'ignores reduced-motion',
    ...r.fails,
  ].filter(Boolean).join(', ') });
  alive.delete(r.slug);
}

// Pass 2 — the weaker half of the closest surviving pair, repeatedly.
while (doomed.length < N) {
  let pair = null;
  for (const a of alive.values()) {
    for (const [slug, d] of Object.entries(a.dists || {})) {
      const b = alive.get(slug);
      if (!b || b.slug === a.slug) continue;
      if (!pair || d < pair.d) pair = { a, b, d };
    }
  }
  if (!pair) break;

  // of the pair, the one with the lower score dies — unless a guard saves it, in which case the
  // other one does, and if both are guarded the pair is left alone and we look at the next closest
  const [lo, hi] = pair.a.score <= pair.b.score ? [pair.a, pair.b] : [pair.b, pair.a];
  const pick = !why(lo) ? lo : !why(hi) ? hi : null;
  if (!pick) {
    // both protected: drop this pair out of consideration by severing the link
    delete pair.a.dists[pair.b.slug];
    delete pair.b.dists[pair.a.slug];
    continue;
  }
  const other = pick === lo ? hi : lo;
  doomed.push({ ...pick, reason: `too like ${other.slug} (distance ${pair.d}), and scored ${pick.score} to its ${other.score}` });
  alive.delete(pick.slug);
}

console.log(`round ${state.round} — ${scores.length} alive, retiring ${doomed.length}\n`);
for (const d of doomed) console.log(`  - ${d.slug.padEnd(14)} ${String(d.score).padStart(3)}  ${d.reason}`);
console.log('\n  kept:');
for (const r of byScore.filter((r) => alive.has(r.slug)))
  console.log(`    ${String(r.score).padStart(3)}  ${r.slug.padEnd(14)} unlike:${String(r.nearest).padStart(3)}  age ${state.age[r.slug]}${pinned.has(r.slug) ? '  [pinned]' : elite.has(r.slug) ? `  [top ${ELITE}]` : ''}`);

if (!apply) { console.log('\n(dry run — pass --apply to retire them)'); process.exit(0); }

mkdirSync(join(ROOT, 'attic'), { recursive: true });
mkdirSync(join(ROOT, 'log'), { recursive: true });
for (const d of doomed) {
  const from = join(ROOT, 'pages', d.slug);
  const to = join(ROOT, 'attic', `${String(state.round).padStart(2, '0')}-${d.slug}`);
  if (existsSync(from)) renameSync(from, to);
  rmSync(join(ROOT, 'shots', `${d.slug}.webp`), { force: true });
  delete state.age[d.slug];
  appendFileSync(join(ROOT, 'log/rounds.jsonl'),
    JSON.stringify({ round: state.round, at: new Date().toISOString(), slug: d.slug,
                     score: d.score, nearest: d.nearest, verdict: 'retired', reason: d.reason }) + '\n');
}
for (const r of byScore.filter((r) => alive.has(r.slug))) {
  appendFileSync(join(ROOT, 'log/rounds.jsonl'),
    JSON.stringify({ round: state.round, at: new Date().toISOString(), slug: r.slug,
                     score: r.score, nearest: r.nearest, age: state.age[r.slug], verdict: 'kept' }) + '\n');
}

const gone = new Set(doomed.map((d) => d.slug));
writeFileSync(join(ROOT, 'pages/manifest.json'),
  JSON.stringify(manifest.filter((m) => !gone.has(m.slug)), null, 2) + '\n');
writeFileSync(join(ROOT, 'pages/state.json'), JSON.stringify(state, null, 2) + '\n');
console.log(`\nretired ${doomed.length} to attic/ — recoverable there and in git, since the commit before this one has them.`);
