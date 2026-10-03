// Writes one self-contained page per room.
//
//   node tools/build-rooms.mjs            # all rooms
//   node tools/build-rooms.mjs desk-night # one
//
// Every page it emits is a single standalone file with no shared stylesheet and no shared script.
// The sharing is at authoring time only. That distinction is the whole lesson of the 128 skins:
// a shared stylesheet can only vary colour, so it produced 128 recolours; a shared *authoring*
// template with a hand-written world per page can vary anything the world wants, including
// overriding the machine itself.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SITE_CSS, SITE_HTML, SITE_JS } from './device.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2);

const BASE_TOKENS = `
    /* the machine. these are the real site's colours and rooms rarely touch them. */
    --page:#fdfdfd; --panel:#f6f6f7; --addr:#fff; --hover:#eeeef1;
    --ink:#101114; --soft:#3f434b; --quiet:#53585f; --faint:#62666d;
    --rule:#e2e2e5; --lamp-off:#dcdce0; --red:#a8102a; --green:#00603a;
    --t:140ms; --ease:cubic-bezier(.22,1,.36,1);`;

const SHELL_CSS = `
  *{box-sizing:border-box;margin:0;padding:0;}
  html{-webkit-text-size-adjust:100%;}
  body{
    font-family:'Inter',system-ui,sans-serif;line-height:1.55;color:var(--ink);
    min-height:100svh;overflow-x:hidden;
    /* minmax(0,1fr) matters: an auto grid column resolves a child's 100% against the column, and
       an auto column sized from max-content can come out WIDER than the viewport. */
    display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:1fr auto;
    align-items:center;
  }
  .machine{
    position:relative;z-index:2;width:min(930px,100%);margin:0 auto;justify-self:center;
    transform:translate3d(calc(var(--px,0) * -4px), calc(var(--py,0) * -4px), 0);
    animation:settle .9s var(--ease) both;
  }
  @keyframes settle{from{opacity:0;transform:translateY(14px) scale(.99);}to{opacity:1;}}
  .screen{position:relative;overflow:hidden;will-change:rotate, translate;
          animation:breathe 24s ease-in-out infinite alternate;}
  /* rotate and translate are their own properties, so the float composes with the pointer lean
     on .machine instead of fighting it for the transform declaration */
  @keyframes breathe{from{rotate:-.18deg;translate:0 -3px;}to{rotate:.18deg;translate:0 3px;}}

  :focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:5px;}
  ::selection{background:var(--green);color:#fff;}

  @media (prefers-reduced-motion:reduce){
    *,*::before,*::after{animation:none !important;transition:none !important;}
    .machine{transform:none;}
  }`;

const FONTS = {
  Archivo: "@font-face{font-family:'Archivo';src:url('../../fonts/Archivo-latin.woff2') format('woff2');font-weight:100 900;font-display:swap;}",
  Inter: "@font-face{font-family:'Inter';src:url('../../fonts/Inter-latin.woff2') format('woff2');font-weight:100 900;font-display:swap;}",
  IBMPlexMono: "@font-face{font-family:'IBMPlexMono';src:url('../../fonts/IBMPlexMono-latin.woff2') format('woff2');font-weight:100 700;font-display:swap;}",
  SpaceGrotesk: "@font-face{font-family:'SpaceGrotesk';src:url('../../fonts/SpaceGrotesk-latin.woff2') format('woff2');font-weight:300 700;font-display:swap;}",
  InstrumentSerif: "@font-face{font-family:'InstrumentSerif';src:url('../../fonts/InstrumentSerif-latin.woff2') format('woff2');font-weight:400;font-display:swap;}",
  BricolageGrotesque: "@font-face{font-family:'BricolageGrotesque';src:url('../../fonts/BricolageGrotesque-latin.woff2') format('woff2');font-weight:200 800;font-display:swap;}",
};

function page(room) {
  const fonts = [...new Set(['Archivo', 'Inter', ...(room.fonts || [])])].map((f) => FONTS[f]).join('\n  ');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aedin Lai — ${room.name.toLowerCase()}</title>
<meta name="description" content="${room.idea.replace(/"/g, '&quot;')}">
<meta name="color-scheme" content="${room.scheme || 'light'}">
<meta name="theme-color" content="${room.themeColor}">
<link rel="icon" href="${room.icon}">
<style>
  ${fonts}
${room.properties || ''}
  :root{${BASE_TOKENS}
${room.tokens}
  }
${SHELL_CSS}

  /* ================= ${room.name} ================= */
${room.css}

  /* ================= the site inside it ================= */
${SITE_CSS}
</style>
</head>
<body>
${room.behind || ''}
<div class="machine" id="machine">
  <div class="screen" id="screen">
${SITE_HTML}
  </div>
</div>
${room.front || ''}
<script>${SITE_JS}
${room.script || ''}
</script>
</body>
</html>
`;
}

const dir = join(ROOT, 'rooms');
const files = readdirSync(dir).filter((f) => f.endsWith('.mjs'))
  .filter((f) => !only.length || only.includes(f.replace('.mjs', '')));

const manifest = [];
for (const f of files) {
  const slug = f.replace('.mjs', '');
  const room = (await import(pathToFileURL(join(dir, f)).href)).default;
  mkdirSync(join(ROOT, 'pages', slug), { recursive: true });
  writeFileSync(join(ROOT, 'pages', slug, 'index.html'), page(room));
  manifest.push({ slug, name: room.name, idea: room.idea });
  console.log(`  wrote pages/${slug}/index.html`);
}

// merge into the manifest rather than replacing it, so hand-written pages survive a room build
const path = join(ROOT, 'pages/manifest.json');
const existing = JSON.parse(readFileSync(path, 'utf8'));
const merged = [...existing.filter((m) => !manifest.some((n) => n.slug === m.slug)), ...manifest];
writeFileSync(path, JSON.stringify(merged, null, 2) + '\n');
console.log(`\n${merged.length} pages in the manifest`);
