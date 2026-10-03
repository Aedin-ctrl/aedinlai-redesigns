export default {
  name: 'Rain on the window',
  idea: 'A grey afternoon behind the glass. Drops gather on the pane, run, and the light outside keeps shifting.',
  scheme: 'light',
  themeColor: '#aab4bd',
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23a3aeb8'/%3E%3Crect x='6' y='9' width='20' height='14' rx='2' fill='%23fbfbfc' stroke='%236d7a86'/%3E%3Cg stroke='%23dfe7ed' stroke-width='1.4' stroke-linecap='round'%3E%3Cpath d='M3 5l-1 5M29 4l-1 6M30 20l-1 5'/%3E%3C/g%3E%3C/svg%3E",

  properties: `  @property --day{syntax:'<percentage>';inherits:true;initial-value:30%;}`,

  tokens: `    --out:#8e9aa6; --out-far:#6d7a86; --glass:#aab4bd; --frame:#3f4850;
    --sill-h:clamp(54px,8vh,96px);`,

  css: `
  body{background:var(--glass);padding:clamp(16px,3vw,46px) clamp(12px,4vw,56px) 0;}
  .machine{margin-bottom:calc(var(--sill-h) + clamp(16px,3vh,40px));}

  /* ---- what is out there ----
     Three bands at three distances. The far one barely moves, the near one moves most, which is
     what makes it read as weather rather than as a gradient. */
  .out{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
       background:linear-gradient(to bottom, #c3ccd4, var(--out) 46%, var(--out-far));}
  .out span{position:absolute;inset:-22%;display:block;will-change:transform;}
  .out .sky{
    background:radial-gradient(58% 44% at var(--day) 6%, rgba(255,255,255,.62), transparent 66%);
    animation:weather 58s ease-in-out infinite alternate;
  }
  .out .hills{
    background:
      radial-gradient(70% 40% at 20% 92%, rgba(62,74,66,.46), transparent 64%),
      radial-gradient(60% 34% at 76% 96%, rgba(54,66,60,.4), transparent 66%);
    filter:blur(3px);
    animation:far-drift 74s ease-in-out infinite alternate;
  }
  .out .near{
    background:
      radial-gradient(34% 26% at 8% 86%, rgba(34,44,40,.5), transparent 62%),
      radial-gradient(28% 22% at 94% 90%, rgba(30,40,36,.46), transparent 64%);
    filter:blur(6px);
    animation:near-drift 41s ease-in-out infinite alternate;
  }
  @keyframes weather{from{--day:22%;}to{--day:44%;}}
  @keyframes far-drift{from{transform:translate3d(-1.2%,0,0)}to{transform:translate3d(1.4%,.6%,0)}}
  @keyframes near-drift{from{transform:translate3d(2%,0,0)}to{transform:translate3d(-2.4%,.8%,0)}}

  /* the rain itself: three sheets at three speeds, drawn as repeating gradients so it costs
     nothing and never needs a canvas */
  .rain{position:fixed;inset:-10%;z-index:1;pointer-events:none;opacity:.5;}
  .rain i{
    position:absolute;inset:0;display:block;
    background-image:repeating-linear-gradient(97deg,
      transparent 0 9px, rgba(255,255,255,.5) 9px 10px, transparent 10px 24px);
    animation:fall 1.4s linear infinite;
  }
  .rain i:nth-child(2){opacity:.6;animation-duration:2.1s;
    background-image:repeating-linear-gradient(95deg,
      transparent 0 16px, rgba(255,255,255,.38) 16px 17px, transparent 17px 38px);}
  .rain i:nth-child(3){opacity:.4;animation-duration:3s;
    background-image:repeating-linear-gradient(99deg,
      transparent 0 26px, rgba(255,255,255,.3) 26px 27px, transparent 27px 62px);}
  @keyframes fall{from{transform:translate3d(0,-12%,0)}to{transform:translate3d(-3%,12%,0)}}

  /* drops sitting on the glass in front of everything, each with its own slow run */
  .drops{position:fixed;inset:0;z-index:1;pointer-events:none;}
  .drops b{
    position:absolute;display:block;border-radius:50% 50% 52% 52%;
    background:radial-gradient(40% 36% at 36% 30%, rgba(255,255,255,.85), rgba(255,255,255,.1) 70%);
    box-shadow:0 1px 2px rgba(255,255,255,.3);
    animation:run var(--d,16s) linear infinite;
    animation-delay:var(--delay,0s);
  }
  @keyframes run{
    0%{transform:translateY(0) scaleY(1);opacity:0;}
    8%{opacity:.85;}
    70%{opacity:.85;}
    100%{transform:translateY(60vh) scaleY(1.5);opacity:0;}
  }

  /* the window frame, right at the edges of the viewport */
  .pane{position:fixed;inset:0;z-index:1;pointer-events:none;
        border:clamp(10px,2vw,22px) solid var(--frame);
        box-shadow:0 0 0 1px rgba(0,0,0,.35) inset, 0 0 90px rgba(20,26,30,.45) inset;}
  .pane::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:clamp(6px,1.1vw,13px);
                transform:translateX(-50%);background:var(--frame);opacity:.95;}

  /* the sill the machine stands on */
  .sill{position:fixed;left:0;right:0;bottom:0;height:var(--sill-h);z-index:4;pointer-events:none;
        background:linear-gradient(to bottom,#e8e4da,#cdc7ba 40%,#a9a296);
        box-shadow:0 -10px 24px -14px rgba(0,0,0,.5);
        border-top:1px solid #f3f0e8;}
  .sill::after{content:'';position:absolute;left:0;right:0;top:0;height:14px;
               background:linear-gradient(to bottom, rgba(0,0,0,.18), transparent);}

  /* a laptop rather than a monitor here: thinner, warmer bezel, sitting on the sill */
  .screen{
    background:#f2f1ee;border:1px solid #b6b2a9;border-radius:11px;
    box-shadow:0 1px 0 rgba(255,255,255,.9) inset, 0 0 0 5px #dedad1, 0 0 0 6px #9d988d,
               0 34px 56px -32px rgba(26,30,34,.85);
  }

  @media (prefers-reduced-motion:reduce){
    /* the weather stays — it simply stops. rain that cannot fall is drawn as streaks on the glass. */
    .rain i{opacity:.35;}
    .drops b{opacity:.7;}
    .out .sky{--day:34%;}
  }`,

  behind: `<div class="out" aria-hidden="true">
  <span class="sky"></span><span class="hills"></span><span class="near"></span>
</div>
<div class="rain" aria-hidden="true"><i></i><i></i><i></i></div>
<div class="drops" id="drops" aria-hidden="true"></div>
<div class="pane" aria-hidden="true"></div>`,

  front: `<div class="sill" aria-hidden="true"></div>`,

  script: `
(() => {
  // Twenty-odd drops, placed once from a seeded sequence so the page looks the same on every load
  // and a screenshot diff is not comparing noise.
  const host = document.getElementById('drops');
  let seed = 20260102;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 22; i++) {
    const b = document.createElement('b');
    const w = 3 + rnd() * 7;
    b.style.left = (rnd() * 98).toFixed(1) + '%';
    b.style.top = (-10 + rnd() * 50).toFixed(1) + '%';
    b.style.width = w.toFixed(1) + 'px';
    b.style.height = (w * 1.3).toFixed(1) + 'px';
    b.style.setProperty('--d', (11 + rnd() * 16).toFixed(1) + 's');
    b.style.setProperty('--delay', (-rnd() * 20).toFixed(1) + 's');
    host.append(b);
  }
})();`,
};
