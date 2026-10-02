// Renders every skin and writes a small webp thumbnail for gallery.html.
// Run after adding skins:  node make-thumbs.mjs   (needs the local server on 8931)
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:8931';
const skins = JSON.parse(readFileSync(join(HERE, 'skins/manifest.json'), 'utf8'));

const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const s of skins) {
  const page = await b.newPage({ viewport: { width: 1200, height: 820 } });
  await page.goto(`${BASE}/?skin=${s.id}`, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  // hide the picker so the thumbnail shows the design, not the chrome around it
  await page.evaluate(() => { const p = document.getElementById('picker'); if (p) p.style.visibility = 'hidden'; });
  await page.waitForTimeout(120);
  const png = await page.screenshot({ clip: { x: 0, y: 150, width: 1200, height: 670 } });
  await sharp(png).resize(560).webp({ quality: 72 }).toFile(join(HERE, 'thumbs', `${s.id}.webp`));
  await page.close();
}
await b.close();
console.log(`${skins.length} thumbnails written`);
