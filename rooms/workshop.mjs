export default {
  name: 'On the bench',
  idea: 'A workshop: pegboard behind, tools hung in silhouette, a strip light overhead and dust in the air.',
  scheme: 'dark',
  themeColor: '#1b2026',
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231f252c'/%3E%3Cg fill='%232b333c'%3E%3Ccircle cx='6' cy='6' r='1.4'/%3E%3Ccircle cx='14' cy='6' r='1.4'/%3E%3Ccircle cx='22' cy='6' r='1.4'/%3E%3Ccircle cx='6' cy='14' r='1.4'/%3E%3C/g%3E%3Crect x='7' y='12' width='18' height='12' rx='2' fill='%23f0f2f4'/%3E%3C/svg%3E",

  properties: `  @property --tube{syntax:'<number>';inherits:true;initial-value:1;}`,

  tokens: `    --shop:#1b2026; --board:#242b33; --peg:#2f3842; --steel:#9aa6b2;
    --bench-h:clamp(104px,17vh,180px);`,

  css: `
  body{background:var(--shop);padding:clamp(16px,3vw,46px) clamp(12px,4vw,56px) 0;}
  .machine{margin-bottom:calc(var(--bench-h) + clamp(14px,2.4vh,32px));}

  /* ---- pegboard ----
     A real grid of holes rather than a texture, so the tools can hang off it convincingly. */
  .shop{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
        background:linear-gradient(175deg,#2a333c,var(--board) 38%,#161b21);}
  .shop .holes{
    position:absolute;inset:0;
    background-image:radial-gradient(circle at center, #11161b 1.6px, transparent 1.7px);
    background-size:26px 26px;opacity:.75;
  }
  /* the strip light overhead: a long warm-white band that hums a little */
  .shop .tube{
    position:absolute;inset:-14% -14% auto;height:34%;
    background:radial-gradient(64% 100% at 50% 0%,
      rgba(226,240,255,calc(.3 * var(--tube))), transparent 72%);
    animation:hum 5.5s ease-in-out infinite alternate;
  }
  @keyframes hum{from{--tube:.86}to{--tube:1.08}}
  .shop .fitting{
    position:absolute;top:clamp(6px,2vh,22px);left:50%;transform:translateX(-50%);
    width:min(620px,74vw);height:11px;border-radius:3px;
    background:linear-gradient(to bottom,#d7dee6,#8e99a4);
    box-shadow:0 10px 40px rgba(214,232,255,.35), 0 2px 0 rgba(0,0,0,.5);
  }

  /* dust, caught in the light. Six motes, slow, and nowhere near the text. */
  .motes{position:fixed;inset:0;z-index:1;pointer-events:none;}
  .motes i{position:absolute;display:block;width:3px;height:3px;border-radius:50%;
           background:rgba(226,240,255,.55);
           animation:float var(--d,26s) linear infinite;animation-delay:var(--delay,0s);}
  @keyframes float{
    0%{transform:translate3d(0,0,0);opacity:0;}
    12%{opacity:.7;}
    88%{opacity:.7;}
    100%{transform:translate3d(var(--dx,20px),-42vh,0);opacity:0;}
  }

  /* tools hung on the board, in silhouette */
  .tools{position:fixed;inset:0;z-index:1;pointer-events:none;}
  .tools svg{position:absolute;}
  .tools .t1{left:clamp(10px,5vw,76px);top:clamp(52px,13vh,120px);width:clamp(30px,3.6vw,52px);}
  .tools .t2{left:clamp(10px,9vw,142px);top:clamp(40px,10vh,94px);width:clamp(26px,3vw,42px);}
  .tools .t3{right:clamp(10px,5vw,76px);top:clamp(46px,12vh,110px);width:clamp(34px,4.2vw,60px);}
  .tools .t4{right:clamp(10px,10vw,160px);top:clamp(64px,15vh,134px);width:clamp(24px,2.8vw,40px);}
  .tl{fill:#141a20;stroke:rgba(154,166,178,.44);stroke-width:1.5;stroke-linejoin:round;}
  .tl-hi{fill:none;stroke:rgba(200,216,232,.3);stroke-width:1.2;}

  /* the bench: a thick scarred top with a steel edge */
  .bench{position:fixed;left:0;right:0;bottom:0;height:var(--bench-h);z-index:4;pointer-events:none;
         background:linear-gradient(to bottom,#4a3d2e,#392f24 30%,#241d16);
         border-top:3px solid #6e7a86;
         box-shadow:0 -14px 30px -18px rgba(0,0,0,.9);}
  .bench::before{content:'';position:absolute;inset:0;opacity:.5;
    background:repeating-linear-gradient(93deg, rgba(0,0,0,.3) 0 1px, transparent 1px 11px,
      rgba(255,228,190,.05) 11px 12px, transparent 12px 27px);}
  .bench::after{content:'';position:absolute;left:50%;top:0;width:min(840px,86vw);height:62%;
    transform:translateX(-50%);
    background:radial-gradient(ellipse at 50% 0%, rgba(222,236,255,.16), transparent 68%);
    filter:blur(9px);}

  /* a vice bolted to the near edge */
  .vice{position:fixed;left:clamp(8px,4vw,70px);bottom:calc(var(--bench-h) - 14px);z-index:5;
        width:clamp(50px,7vw,96px);pointer-events:none;}
  .vc{fill:#2a333c;stroke:rgba(154,166,178,.5);stroke-width:1.6;}
  .vc-2{fill:#39434e;}

  /* the machine: an industrial panel, dark bezel, rubber feet */
  .screen{
    background:#dfe3e7;border:1px solid #6d7681;border-radius:8px;
    box-shadow:0 1px 0 rgba(255,255,255,.7) inset, 0 0 0 7px #2b333c, 0 0 0 8px #525c67,
               0 0 0 9px #1a2026, 0 34px 54px -30px rgba(0,0,0,.95),
               0 0 120px -30px rgba(214,236,255,.35);
  }
  .feet{position:relative;z-index:2;width:min(930px,100%);margin:-3px auto 0;
        display:flex;justify-content:space-between;padding:0 clamp(26px,5vw,70px);}
  .feet i{display:block;width:clamp(26px,3.4vw,46px);height:9px;border-radius:0 0 4px 4px;
          background:linear-gradient(to bottom,#1a2026,#0c0f13);
          box-shadow:0 9px 18px -6px rgba(0,0,0,.95);}

  @media (prefers-reduced-motion:reduce){
    .shop .tube{--tube:1;}
    .motes i{opacity:.55;}
  }`,

  behind: `<div class="shop" aria-hidden="true">
  <span class="holes"></span><span class="tube"></span><span class="fitting"></span>
</div>
<div class="motes" id="motes" aria-hidden="true"></div>
<div class="tools" aria-hidden="true">
  <svg class="t1" viewBox="0 0 52 110"><path class="tl" d="M26 6a7 7 0 0 1 7 7v12H19V13a7 7 0 0 1 7-7z"/><path class="tl" d="M21 25h10v74l-5 7-5-7z"/><path class="tl-hi" d="M26 32v58"/></svg>
  <svg class="t2" viewBox="0 0 42 96"><path class="tl" d="M10 4h22v18l-6 6v60a5 5 0 0 1-10 0V28l-6-6z"/><path class="tl-hi" d="M21 30v54"/></svg>
  <svg class="t3" viewBox="0 0 60 104"><path class="tl" d="M30 4c9 0 16 6 16 13 0 5-3 8-7 11v62a9 9 0 0 1-18 0V28c-4-3-7-6-7-11C14 10 21 4 30 4z"/><path class="tl-hi" d="M30 34v52"/></svg>
  <svg class="t4" viewBox="0 0 40 90"><path class="tl" d="M14 4h12v22l8 10v42a8 8 0 0 1-16 0V36l-8-10V4z" /><path class="tl-hi" d="M20 40v40"/></svg>
</div>`,

  front: `<div class="feet" aria-hidden="true"><i></i><i></i></div>
<div class="bench" aria-hidden="true"></div>
<svg class="vice" viewBox="0 0 96 70" aria-hidden="true">
  <path class="vc" d="M8 20h30v30H8z"/><path class="vc-2" d="M38 26h20v18H38z"/>
  <path class="vc" d="M58 20h30v30H58z"/><path class="vc" d="M20 50h56v14H20z"/>
  <path class="vc-2" d="M44 6h8v16h-8z"/>
</svg>`,

  script: `
(() => {
  // Six motes, placed from a fixed seed so the page is identical on every load and a screenshot
  // diff compares design rather than noise.
  const host = document.getElementById('motes');
  let seed = 48271;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 6; i++) {
    const m = document.createElement('i');
    m.style.left = (6 + rnd() * 88).toFixed(1) + '%';
    m.style.top = (46 + rnd() * 40).toFixed(1) + '%';
    m.style.setProperty('--d', (22 + rnd() * 22).toFixed(1) + 's');
    m.style.setProperty('--delay', (-rnd() * 30).toFixed(1) + 's');
    m.style.setProperty('--dx', ((rnd() - 0.5) * 90).toFixed(0) + 'px');
    host.append(m);
  }
})();`,
};
