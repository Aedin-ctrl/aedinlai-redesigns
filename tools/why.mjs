import { chromium, webkit } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
const ROOT = '/Users/aedinlai/Desktop/aedinlai-redesigns';
const AXE = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');
const T = { '.html':'text/html','.woff2':'font/woff2','.json':'application/json' };
const srv = createServer((q,s)=>{let p=join(ROOT,decodeURI(q.url.split('?')[0]));
  try{if(statSync(p).isDirectory())p=join(p,'index.html');}catch{}
  if(!existsSync(p)){s.writeHead(404);return s.end();}
  s.writeHead(200,{'Content-Type':T[extname(p)]||'application/octet-stream'});s.end(readFileSync(p));});
await new Promise(r=>srv.listen(0,r));
const B=`http://127.0.0.1:${srv.address().port}`;
const br = await (process.env.ENGINE === 'webkit' ? webkit : chromium).launch(
  process.env.ENGINE === 'webkit' ? { headless:true } : { channel:'chrome', headless:true });
for (const slug of process.argv.slice(2)) {
  const pg = await br.newPage({ viewport:{width:390,height:844} });
  await pg.goto(`${B}/pages/${slug}/`, { waitUntil:'load' });
  await pg.waitForTimeout(1200);
  await pg.addScriptTag({ content: AXE });
  const a = await pg.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
  console.log('###', slug);
  for (const v of a.violations) for (const n of v.nodes)
    console.log(' ', v.id, '|', n.target.join(' '), '|', (n.failureSummary||'').split('\n').slice(0,3).join(' / '));
  const ov = await pg.evaluate(()=>{
    const out=[]; const w=document.documentElement.clientWidth;
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.right > w + 1 || r.left < -1) out.push(`${el.tagName.toLowerCase()}.${el.className||''} L${r.left.toFixed(0)} R${r.right.toFixed(0)}`);
    }
    return { w, scrollW: document.documentElement.scrollWidth, out: out.slice(0,8) };
  });
  console.log('  overflow:', JSON.stringify(ov));
  await pg.close();
}
await br.close(); srv.close();
