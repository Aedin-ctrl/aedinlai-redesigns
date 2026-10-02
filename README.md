# aedinlai.com — design variations

One hundred and twenty-eight skins for one layout, switchable from the buttons at the top, or browsable as thumbnails on [the gallery page](https://www.aedinlai.com/aedinlai-redesigns/gallery.html). **Every link is inert** — this is
a place to look at directions, not a working copy of the site.

**Live:** https://www.aedinlai.com/aedinlai-redesigns/

The chosen skin is in the address bar, so a link points at a specific one —
`?skin=blueprint` — which is how you look at it on a phone after picking it on a laptop.

## The skins

Each is drawn from something in the subject's own world rather than a stock palette, because that is
where a design that isn't interchangeable with anyone else's comes from — fencing, data centres, the
bench, the arcade, the lab. `skins/manifest.json` is the current list; the gallery page shows them
all at a glance and filters by light or dark.

Colour is **reserved for state** in all of them. It never tints a heading and never appears as
decoration. The two signal colours come from épée, the one weapon where both lights can come on at
once — which is also a fair description of working where hardware and software have to agree.

## Two families

**Reserved** — the original idea: near-monochrome, with two signal colours held back for state and
never used as decoration.

**Rich** (`--rich: on`) — colour used throughout on a white base: traffic-light window lamps, a
gradient wash, a gradient rule under the name, a different hue per rail row and per skill group,
coloured chips, a coloured tab strip and a coloured edge down the window. Sixteen so far —
*spectrum, playroom, citrus, reef, studio, ribbon, bazaar, meridian, orchard, confetti, atlas,
glasshouse, signal-mix, pastel-lab, kiosk, aurora-light*.

Rich skins declare six accents (`c: [...]`). The generator derives two further variants of each,
because neither can be judged by eye:

- `--cN-ink` — the accent pushed until it clears AA **against the tints of itself it will sit on**.
  A chip sits on 13% of its own accent, a rail row on 7%. Checking against the plain white surface
  said 4.6 while the real background measured 4.27, and eight skins shipped under the line.
- `--c5-solid` — darkened until white text on it passes, for the filled button. Tinting the text
  toward the background instead gave 2.39:1.

## Tokens a skin can set

Beyond colour, a skin sets higher-order tokens and the layout responds — no new selectors, no
markup changes. All three use container style queries:

| token | values |
|---|---|
| `--density` | `compact` · `regular` · `spacious` |
| `--frame` | `flat` · `raised` · `etched` |
| `--layout` | `standard` (rail right) · `mirrored` (rail left) · `stacked` (single column) |

Plus `--radius`, `--rule-w`, `--display`, `--display-w`, `--display-track` and `--texture`. That is
why switching skins reads as a different design rather than a recolour.

## Adding another

Add an entry to `SKINS` in `build-skins.mjs`, then:

```sh
npm install                 # once
npm run skins               # writes skins/*.css and the manifest
python3 -m http.server 8931 # then, in another shell:
node make-thumbs.mjs        # refreshes the gallery thumbnails
```

That writes `skins/<id>.css` and updates `skins/manifest.json`; the page builds its buttons from the
manifest, so there is no code to change.

**The build enforces contrast so you cannot get it wrong.** Each skin names three surfaces and three
text greys, and the generator walks each grey until it clears WCAG AA against the *worst* of the
three. Around half of the hundred needed correcting. This is deliberate: the same mistake — a grey that passes
against the panel and fails against the page behind it — was made three times by eye in a single day
before the build started checking it.

## What changed from the live site

- The **browser-window frame is kept**. It is the memorable idea.
- **`01 / 02 / 03 / 04` is gone.** Those entries are not a sequence, they have dates. The rail now
  carries the year, which is information rather than decoration.
- **The ALL-CAPS labels are gone** (`HIGHLIGHTS`, `PROGRAMMING`, `HARDWARE & CAD`, `TOOLS`).
- **State marks are positional as well as coloured**, because red/green alone is the worst possible
  pair for colourblindness — a scoring box uses left/right position too.
- Display type varies per skin, so a switch is legible at a glance rather than a recolour.

## Browser support, measured rather than assumed

Checked in WebKit 26.6 as well as Chrome, because a phone means Safari:

| | Chrome | WebKit |
|---|---|---|
| Container **style** queries (`--density`, `--frame`) | yes | **yes** |
| Anchor positioning (the sliding selection indicator) | yes | **yes** |
| View transitions (the skin switch) | yes | **yes** |
| `light-dark()`, `color-mix()` | yes | **yes** |
| Container **scroll-state** queries (picker condensing when stuck) | yes | **no** |

Only the last one is missing, and it degrades to a sticky picker at full height — which is why it
was built as an enhancement rather than a dependency. All 48 skins are clean in WebKit at phone
width, with no overflow and no script errors.

## Checked

Every skin is checked against WCAG 2.0/2.1 A and AA at desktop and phone widths, with no horizontal
overflow and no script errors — 384 combinations at the time of writing (Chrome desktop and phone, WebKit phone), and the check is re-run
whenever skins are added.

Switching uses the **View Transitions API** where the browser has it, and falls back to an instant
swap where it doesn't. It is the only motion on the page, and it answers a click rather than playing
at you on load. `prefers-reduced-motion` turns it off.

Fonts are self-hosted and subsetted — no external requests at all.
