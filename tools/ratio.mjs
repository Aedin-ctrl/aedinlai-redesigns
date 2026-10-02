// Contrast, at authoring time rather than from a failing gate.
//
//   node tools/ratio.mjs "#69717e" "#eceef0"        # what is it?
//   node tools/ratio.mjs --fix "#69717e" "#eceef0"  # nearest value that clears AA
//
// The target is 4.6, not 4.5: axe measures from composited pixels and has landed a hundredth or
// two below a calculated 4.51 more than once. The margin costs nothing and settles it.
import Color from 'colorjs.io';

const TARGET = 4.6;
const ratio = (a, b) => {
  const L = (c) => new Color(c).to('srgb').coords
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const [x, y] = [L(a), L(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const fix = process.argv[2] === '--fix';
const [fg, bg] = process.argv.slice(fix ? 3 : 2);
if (!fg || !bg) { console.error('usage: ratio.mjs [--fix] <foreground> <background>'); process.exit(2); }

const now = ratio(fg, bg);
if (!fix) {
  console.log(`${now.toFixed(2)}:1  ${now >= TARGET ? 'ok' : now >= 4.5 ? 'thin — under the 4.6 margin' : 'FAILS AA'}`);
  process.exit(now >= 4.5 ? 0 : 1);
}

// Walk lightness toward whichever end is further from the background, in OKLCH so hue holds.
const bgLight = ratio('#fff', bg) < ratio('#000', bg);
const c = new Color(fg).to('oklch');
for (let i = 0; i <= 100; i++) {
  c.l = Math.max(0, Math.min(1, new Color(fg).to('oklch').l + (bgLight ? -1 : 1) * i * 0.004));
  const hexed = c.to('srgb').toString({ format: 'hex' });
  if (ratio(hexed, bg) >= TARGET) {
    console.log(`${fg} -> ${hexed}   ${ratio(hexed, bg).toFixed(2)}:1 on ${bg}`);
    process.exit(0);
  }
}
console.error(`no value on this hue clears ${TARGET}:1 against ${bg}`);
process.exit(1);
