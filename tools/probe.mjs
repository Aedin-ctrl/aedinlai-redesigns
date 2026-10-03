import { chromium } from 'playwright-core';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';
const ROOT='/Users/aedinlai/Desktop/aedinlai-redesigns';
const T={'.html':'text/html','.woff2':'font/woff2','.json':'application/json'};
const srv=createServer((q,s)=>{let p=join(ROOT,decodeURI(q.url.split('?')[0]));
 try{if(statSync(p).isDirectory())p=join(p,'index.html');}catch{}
 if(!existsSync(p)){s.writeHead(404);return s.end();}
 s.writeHead(200,{'Content-Type':T[extname(p)]||'application/octet-stream'});s.end(readFileSync(p));});
await new Promise(r=>srv.listen(0,r));
const br=await chromium.launch({channel:'chrome',headless:true});
const pg=await br.newPage({viewport:{width:390,height:844}});
await pg.goto(`http://127.0.0.1:${srv.address().port}/pages/${process.argv[2]}/`,{waitUntil:'load'});
await pg.waitForTimeout(1500);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const b=document.body, cs=getComputedStyle(b);
  const m=document.querySelector('.machine');
  return { innerW:innerWidth, docScrollW:document.documentElement.scrollWidth,
    bodyScrollW:b.scrollWidth, bodyClientW:b.clientWidth, bodyPad:cs.paddingLeft,
    bodyDisplay:cs.display,
    machine:m?{w:m.getBoundingClientRect().width, cssW:getComputedStyle(m).width}:null,
    over:[...document.querySelectorAll('body > *')].map(e=>{
      const r=e.getBoundingClientRect(); const c=getComputedStyle(e);
      return `${e.tagName}.${e.className} pos:${c.position} L${r.left.toFixed(0)} R${r.right.toFixed(0)}`;})};
}),null,1));
await br.close();srv.close();
