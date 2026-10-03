export default {
  name: 'In the salle',
  idea: 'A fencing hall after hours. The piste runs away under the screen and a scoring box stands on the floor beside it, still live.',
  scheme: 'dark',
  themeColor: '#15171c',
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23181b21'/%3E%3Crect x='7' y='7' width='18' height='12' rx='2' fill='%23f2f3f5'/%3E%3Ccircle cx='11' cy='26' r='3.4' fill='%23a8102a'/%3E%3Ccircle cx='21' cy='26' r='3.4' fill='%2300603a'/%3E%3C/svg%3E",

  properties: `  @property --house{syntax:'<number>';inherits:true;initial-value:1;}`,

  tokens: `    --hall:#15171c; --hall-lo:#0e1014; --floor:#2b2f39; --strip:#3d4350;
    --floor-h:clamp(150px,24vh,250px);`,

  css: `
  body{background:var(--hall);padding:clamp(16px,3vw,44px) clamp(12px,4vw,56px) 0;}
  .machine{margin-bottom:calc(var(--floor-h) + clamp(10px,1.6vh,24px));}

  /* ---- the hall ----
     High ceiling, two banks of lights that take about a minute to go round, and a far wall you
     can only just make out. */
  .hall{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
        background:linear-gradient(178deg,#232833,var(--hall) 44%,var(--hall-lo));}
  .hall .lights{
    position:absolute;inset:-18%;
    background:
      radial-gradient(26% 22% at 22% 2%, rgba(226,236,255,calc(.19 * var(--house))), transparent 68%),
      radial-gradient(24% 20% at 74% 0%, rgba(226,236,255,calc(.15 * var(--house))), transparent 68%);
    animation:house-lights 51s ease-in-out infinite alternate;
  }
  @keyframes house-lights{from{--house:.82;transform:translate3d(-1.2%,0,0);}
                          to{--house:1.12;transform:translate3d(1.4%,.5%,0);}}
  /* the far wall: a run of lockers, barely lit */
  .hall .lockers{
    position:absolute;left:0;right:0;bottom:calc(var(--floor-h) - 1px);height:clamp(60px,11vh,120px);
    background:
      repeating-linear-gradient(90deg, rgba(0,0,0,.4) 0 1px, transparent 1px 46px),
      linear-gradient(to bottom, rgba(42,48,60,.5), rgba(28,32,40,.8));
    opacity:.6;
  }

  /* ---- the piste, running away under the machine ----
     Centre line, two en-garde lines and the warning lines, in the right places, with the strip
     narrowing as it goes back. */
  .piste{position:fixed;left:0;right:0;bottom:0;height:var(--floor-h);z-index:1;pointer-events:none;
         background:linear-gradient(to bottom,#1d212a,var(--floor) 30%,#232833);
         border-top:1px solid rgba(190,205,230,.14);}
  .piste svg{position:absolute;inset:0;width:100%;height:100%;}
  .ps{fill:none;stroke:rgba(206,218,238,.4);stroke-width:1.4;}
  .ps-w{fill:none;stroke:rgba(206,218,238,.24);stroke-width:1.2;stroke-dasharray:7 6;}
  .ps-f{fill:rgba(61,67,80,.55);}
  /* the glow the screen throws down onto the strip */
  .piste::after{content:'';position:absolute;left:50%;top:0;width:min(840px,86vw);height:70%;
    transform:translateX(-50%);
    background:radial-gradient(ellipse at 50% 0%, rgba(206,222,255,.16), transparent 66%);
    filter:blur(10px);}

  /* ---- the scoring box, standing on the floor ----
     Épée is the one weapon where both lamps can light at once, so both can. The box runs its own
     bout on a loop: a left touch, a right touch, then a double. */
  .props{position:fixed;left:0;right:0;bottom:0;height:var(--floor-h);z-index:2;
         pointer-events:none;}
  .props svg{position:absolute;bottom:clamp(8px,2vh,26px);}
  .box{left:clamp(10px,5vw,96px);width:clamp(86px,11vw,160px);}
  .bx{fill:#191d25;stroke:rgba(150,164,186,.5);stroke-width:2;stroke-linejoin:round;}
  .bx-2{fill:#232935;}
  .bulb-l,.bulb-r{transition:fill .1s linear;}
  .bulb-l{fill:#2e333d;animation:lamp-l 11s steps(1) infinite;}
  .bulb-r{fill:#2e333d;animation:lamp-r 11s steps(1) infinite;}
  .halo-l,.halo-r{fill:transparent;animation:halo-l 11s steps(1) infinite;}
  .halo-r{animation-name:halo-r;}
  @keyframes lamp-l{0%,10%{fill:#a8102a;}11%,45%{fill:#2e333d;}
                    72%,82%{fill:#a8102a;}83%,100%{fill:#2e333d;}}
  @keyframes lamp-r{0%,36%{fill:#2e333d;}37%,47%{fill:#00603a;}48%,71%{fill:#2e333d;}
                    72%,82%{fill:#00603a;}83%,100%{fill:#2e333d;}}
  @keyframes halo-l{0%,10%{fill:rgba(168,16,42,.22);}11%,71%{fill:transparent;}
                    72%,82%{fill:rgba(168,16,42,.22);}83%,100%{fill:transparent;}}
  @keyframes halo-r{0%,36%{fill:transparent;}37%,47%{fill:rgba(0,96,58,.22);}
                    48%,71%{fill:transparent;}72%,82%{fill:rgba(0,96,58,.22);}83%,100%{fill:transparent;}}

  /* a bag and a blade leaning against the wall on the other side */
  .bag{right:clamp(10px,5vw,96px);width:clamp(78px,10vw,150px);}
  .bg{fill:#1d222b;stroke:rgba(150,164,186,.4);stroke-width:1.8;stroke-linejoin:round;}
  .bg-2{fill:#262d38;}
  .blade{fill:none;stroke:rgba(178,192,214,.55);stroke-width:1.8;stroke-linecap:round;}

  /* the machine: a dark-bezel panel on a low stand, as a timing display would be */
  .screen{
    background:#e8eaee;border:1px solid #666e7c;border-radius:10px;
    box-shadow:0 1px 0 rgba(255,255,255,.8) inset, 0 0 0 6px #262c36, 0 0 0 7px #4d5663,
               0 38px 58px -32px rgba(0,0,0,.95), 0 0 130px -30px rgba(200,220,255,.4);
  }
  .post{position:relative;z-index:2;width:min(930px,100%);margin:-2px auto 0;
        display:grid;place-items:center;}
  .post i{display:block;width:clamp(12px,1.6vw,20px);height:clamp(16px,2.6vh,30px);
          background:linear-gradient(to bottom,#4d5663,#262c36);}
  .post b{display:block;width:clamp(120px,16vw,200px);height:8px;border-radius:3px;
          background:linear-gradient(to bottom,#39414e,#1b2028);
          box-shadow:0 12px 24px -8px rgba(0,0,0,.95);}

  @media (prefers-reduced-motion:reduce){
    /* the box stops running its bout and simply rests on a double, which is the épée case */
    .hall .lights{--house:1;}
    .bulb-l{fill:#a8102a !important;} .bulb-r{fill:#00603a !important;}
    .halo-l{fill:rgba(168,16,42,.22) !important;} .halo-r{fill:rgba(0,96,58,.22) !important;}
  }`,

  behind: `<div class="hall" aria-hidden="true">
  <span class="lights"></span><span class="lockers"></span>
</div>`,

  front: `<div class="post" aria-hidden="true"><i></i><b></b></div>
<div class="piste" aria-hidden="true">
  <svg viewBox="0 0 1000 250" preserveAspectRatio="none">
    <path class="ps-f" d="M250 0h500l180 250H70z"/>
    <path class="ps" d="M250 0h500l180 250H70z"/>
    <path class="ps" d="M500 0v250"/>
    <path class="ps" d="M420 0L390 250M580 0l30 250"/>
    <path class="ps-w" d="M310 0L228 250M690 0l82 250"/>
  </svg>
</div>
<div class="props" aria-hidden="true">
<svg class="box" viewBox="0 0 186 120">
  <circle class="halo-l" cx="48" cy="44" r="34"/>
  <circle class="halo-r" cx="138" cy="44" r="34"/>
  <path class="bx" d="M10 14h166v74a10 10 0 0 1-10 10H20a10 10 0 0 1-10-10z"/>
  <circle class="bulb-l" cx="48" cy="44" r="20"/>
  <circle class="bulb-r" cx="138" cy="44" r="20"/>
  <path class="bx-2" d="M64 76h58v12H64z"/>
  <path class="bx" d="M64 76h58v12H64z"/>
  <path class="bx" d="M60 98v14M126 98v14"/>
</svg>
<svg class="bag" viewBox="0 0 172 130">
  <path class="blade" d="M150 6L98 118"/>
  <path class="blade" d="M92 116h14"/>
  <path class="bg-2" d="M14 52h130v56a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z"/>
  <path class="bg" d="M14 52h130v56a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z"/>
  <path class="bg" d="M44 52V38a12 12 0 0 1 12-12h46a12 12 0 0 1 12 12v14"/>
  <path class="bg" d="M14 78h130"/>
</svg>
</div>`,
};
