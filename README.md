# aedinlai.com — design variations

Ten skins for one layout, switchable from the buttons at the top. **Every link is inert** — this is
a place to look at directions, not a working copy of the site.

**Live:** https://aedin-ctrl.github.io/aedinlai-redesigns/

The chosen skin is in the address bar, so a link points at a specific one —
`?skin=blueprint` — which is how you look at it on a phone after picking it on a laptop.

## The ten

Each is drawn from something in the subject's own world rather than a stock palette, because that is
where a design that isn't interchangeable with anyone else's comes from.

| | from |
|---|---|
| **Piste** | a fencing strip: cool steel, and the scoring lights |
| **Cold aisle** | a data-centre rack at 18°C |
| **Cabinet** | the arcade machine, built from nothing |
| **Blueprint** | cyanotype: white rules on engineering blue |
| **Solder mask** | a board before assembly: mask green, gold pads |
| **Oscilloscope** | two traces on a graticule |
| **Anodised** | machined aluminium, dyed at the edges |
| **Lab book** | graph paper, pencil, and a blue pen |
| **Control room** | amber, so your eyes stay dark-adapted |
| **Lamé** | the metallic jacket: everything is a conductor |

Colour is **reserved for state** in all of them. It never tints a heading and never appears as
decoration. The two signal colours come from épée, the one weapon where both lights can come on at
once — which is also a fair description of working where hardware and software have to agree.

## Adding an eleventh

Add an entry to `SKINS` in `build-skins.mjs`, then:

```sh
npm install        # once, for colorjs.io
npm run skins
```

That writes `skins/<id>.css` and updates `skins/manifest.json`; the page builds its buttons from the
manifest, so there is no code to change.

**The build enforces contrast so you cannot get it wrong.** Each skin names three surfaces and three
text greys, and the generator walks each grey until it clears WCAG AA against the *worst* of the
three. Three of the ten needed correcting. This is deliberate: the same mistake — a grey that passes
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

## Checked

All 30 combinations — ten skins across desktop, tablet and phone — are clean against WCAG 2.0/2.1
A and AA, with no horizontal overflow and no script errors.

Switching uses the **View Transitions API** where the browser has it, and falls back to an instant
swap where it doesn't. It is the only motion on the page, and it answers a click rather than playing
at you on load. `prefers-reduced-motion` turns it off.

Fonts are self-hosted and subsetted — no external requests at all.
