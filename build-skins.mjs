// Generates skins/*.css and skins/manifest.json.
//
// Each skin names its surfaces and its two signal colours; this script then walks the three text
// greys until they clear WCAG AA against *every* surface in that skin. Doing it here rather than by
// hand is the point: the same mistake (a grey that passes on the panel and fails on the ground) has
// been made three times by eye today, and it cannot happen if the build enforces it.
//
//   node build-skins.mjs
import Color from 'colorjs.io';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const AA = 4.5;

const SKINS = [
  { id:'piste', name:'Piste', note:'A fencing strip: cool steel, and the scoring lights',
    ground:'#dfe3e8', bezel:'#eef1f4', panel:'#f7f9fa', ink:'#14181f',
    soft:'#4a535f', quiet:'#6b7480', rule:'#c3cad2', ruleFirm:'#9aa4b0',
    sigA:'#a60c25', sigB:'#00663a', scheme:'light' },

  { id:'cold-aisle', name:'Cold aisle', note:'A data-centre rack at 18°C',
    ground:'#070a0e', bezel:'#11161d', panel:'#141a22', ink:'#e8eef5',
    soft:'#aab6c4', quiet:'#8794a4', rule:'#222b36', ruleFirm:'#36424f',
    sigA:'#4fd1e0', sigB:'#f0b429', scheme:'dark' },

  { id:'cabinet', name:'Cabinet', note:'The arcade machine, built from nothing',
    ground:'#120c0f', bezel:'#1d1317', panel:'#23171c', ink:'#f6ece0',
    soft:'#cdb6a4', quiet:'#a8907f', rule:'#3a262e', ruleFirm:'#54373f',
    sigA:'#ffa52b', sigB:'#ff6b7a', scheme:'dark',
    display:"'BricolageG', sans-serif", displayW:800, track:'-.03em' },

  { id:'blueprint', name:'Blueprint', note:'Cyanotype: white rules on engineering blue',
    ground:'#0d2a52', bezel:'#123466', panel:'#163c74', ink:'#eef4ff',
    soft:'#bcd0ec', quiet:'#9fb8dc', rule:'#245089', ruleFirm:'#3a67a4',
    sigA:'#ffd166', sigB:'#ff8f6b', scheme:'dark', radius:'4px',
    texture:'repeating-linear-gradient(0deg, rgba(255,255,255,.045) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px 28px)' },

  { id:'solder-mask', name:'Solder mask', note:'A board before assembly: mask green, gold pads',
    ground:'#06281d', bezel:'#0a3527', panel:'#0d3f2e', ink:'#e9f6ef',
    soft:'#aed4c2', quiet:'#8fbfa9', rule:'#17543f', ruleFirm:'#1f6b51', scheme:'dark',
    sigA:'#e8b948', sigB:'#7fd4b0', radius:'3px' },

  { id:'oscilloscope', name:'Oscilloscope', note:'Two traces on a graticule',
    ground:'#06100c', bezel:'#0a1813', panel:'#0d1f18', ink:'#e6fbef',
    soft:'#a7d7bd', quiet:'#86bfa2', rule:'#15352a', ruleFirm:'#1d4a3a', scheme:'dark',
    sigA:'#7ef7b0', sigB:'#ffe066', radius:'2px',
    texture:'repeating-linear-gradient(0deg, rgba(126,247,176,.05) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(126,247,176,.05) 0 1px, transparent 1px 32px)' },

  { id:'anodised', name:'Anodised', note:'Machined aluminium, dyed at the edges',
    ground:'#d7d4cf', bezel:'#e8e6e2', panel:'#f2f1ee', ink:'#1b1a18',
    soft:'#4e4b46', quiet:'#6e6a64', rule:'#c0bcb5', ruleFirm:'#9c978f', scheme:'light',
    sigA:'#1f6f8b', sigB:'#c1620f', radius:'6px' },

  { id:'lab-book', name:'Lab book', note:'Graph paper, pencil, and a blue pen',
    ground:'#eee9dd', bezel:'#f6f2e9', panel:'#fbf8f1', ink:'#201d17', scheme:'light',
    soft:'#4d473b', quiet:'#6d6557', rule:'#d6cfbe', ruleFirm:'#b3a992',
    sigA:'#1d4ed8', sigB:'#9a3412', radius:'3px',
    display:"'InstrumentS', Georgia, serif", displayW:400, track:'-.01em',
    texture:'repeating-linear-gradient(0deg, rgba(120,105,70,.07) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(120,105,70,.07) 0 1px, transparent 1px 24px)' },

  { id:'control-room', name:'Control room', note:'Amber, so your eyes stay dark-adapted',
    ground:'#0b0906', bezel:'#15110a', panel:'#1b150c', ink:'#ffdfae', scheme:'dark',
    soft:'#d3ae76', quiet:'#b2905d', rule:'#2e2413', ruleFirm:'#45361d',
    sigA:'#ffb020', sigB:'#9bd1ff', radius:'5px',
    display:"'PlexMono', ui-monospace, monospace", displayW:600, track:'-.02em' },

  { id:'lame', name:'Lamé', note:'The metallic jacket: everything is a conductor',
    ground:'#c9ccd1', bezel:'#dcdfe3', panel:'#e9ebee', ink:'#101317', scheme:'light',
    soft:'#434a53', quiet:'#5f6771', rule:'#b0b5bc', ruleFirm:'#8d939b',
    sigA:'#8c0b22', sigB:'#005c33', radius:'16px', ruleW:'2px',
    display:"'SpaceG', sans-serif", displayW:700, track:'-.04em' },
];

const hex = (c) => c.to('srgb').toString({ format: 'hex' });

// Walk a text colour away from the surfaces until it clears AA against the worst of them.
function fix(start, surfaces, dark) {
  let c = new Color(start);
  const worst = () => Math.min(...surfaces.map((s) => c.contrast(s, 'WCAG21')));
  let guard = 0;
  while (worst() < AA && guard++ < 200) {
    c = c.set('hsl.l', (l) => Math.max(0, Math.min(100, l + (dark ? 0.6 : -0.6))));
  }
  return { hex: hex(c), ratio: worst(), moved: hex(c).toLowerCase() !== String(start).toLowerCase() };
}

const manifest = [];
for (const s of SKINS) {
  const surfaces = [s.ground, s.bezel, s.panel];
  const dark = s.scheme === 'dark';
  const ink = fix(s.ink, surfaces, dark);
  const soft = fix(s.soft, surfaces, dark);
  const quiet = fix(s.quiet, surfaces, dark);

  const note = [ink, soft, quiet].some((x) => x.moved)
    ? `/* adjusted for contrast: ${[['ink',ink],['soft',soft],['quiet',quiet]]
        .filter(([,x]) => x.moved).map(([n,x]) => `${n}->${x.hex}`).join(', ')} */\n`
    : '';

  const css = `/* ${s.name} — ${s.note}
   Worst-case contrast against this skin's three surfaces:
   ink ${ink.ratio.toFixed(2)}:1, soft ${soft.ratio.toFixed(2)}:1, quiet ${quiet.ratio.toFixed(2)}:1 (AA needs 4.5)
   Generated by build-skins.mjs — edit the palette there, not here. */
${note}:root{
  --ground:${s.ground}; --bezel:${s.bezel}; --panel:${s.panel};
  --ink:${ink.hex}; --soft:${soft.hex}; --quiet:${quiet.hex};
  --rule:${s.rule}; --rule-firm:${s.ruleFirm};
  --sigA:${s.sigA}; --sigB:${s.sigB};
  --scheme:${s.scheme};
  --radius:${s.radius || '12px'};
  --rule-w:${s.ruleW || '1px'};
  --display:${s.display || "'Archivo', sans-serif"};
  --display-w:${s.displayW || 700};
  --display-track:${s.track || '-.045em'};
  --texture:${s.texture ? s.texture : 'none'};
}
`;
  writeFileSync(join(HERE, 'skins', `${s.id}.css`), css);
  manifest.push({ id: s.id, name: s.name, note: s.note });
  const flag = [ink, soft, quiet].some((x) => x.moved) ? ' (corrected)' : '';
  console.log(`  ${s.name.padEnd(14)} ink ${ink.ratio.toFixed(2)}  soft ${soft.ratio.toFixed(2)}  quiet ${quiet.ratio.toFixed(2)}${flag}`);
}

writeFileSync(join(HERE, 'skins', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${manifest.length} skins written.`);
