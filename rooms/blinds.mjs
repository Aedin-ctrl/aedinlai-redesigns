export default {
  name: 'Through the blinds',
  idea: 'Late morning. Sun through venetian blinds lays slow stripes across the wall and over the top of the screen.',
  scheme: 'light',
  themeColor: '#e4dccb',
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e8dfc9'/%3E%3Cg stroke='%23c2ae85' stroke-width='2'%3E%3Cpath d='M0 5h32M0 12h32M0 19h32M0 26h32'/%3E%3C/g%3E%3Crect x='8' y='11' width='16' height='11' rx='2' fill='%23fff' stroke='%238a7a58'/%3E%3C/svg%3E",

  properties: `  @property --sun{syntax:'<percentage>';inherits:true;initial-value:28%;}
  @property --tilt{syntax:'<angle>';inherits:true;initial-value:-9deg;}`,

  tokens: `    --wall:#e4dccb; --wall-lo:#cfc4ad; --warm:#ffe6b4;
    --desk-h:clamp(86px,14vh,150px);`,

  css: `
  body{background:var(--wall);padding:clamp(18px,3.4vw,52px) clamp(12px,4vw,58px) 0;}
  .machine{margin-bottom:calc(var(--desk-h) + clamp(14px,2.5vh,32px));}

  /* the wall: plaster, with the sun creeping across it over a minute */
  .room{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
        background:linear-gradient(165deg, #efe8d9, var(--wall) 42%, var(--wall-lo));}
  .room .plaster{
    position:absolute;inset:0;opacity:.5;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23p)' opacity='.2'/%3E%3C/svg%3E");
  }
  .room .sunpool{
    position:absolute;inset:-20%;
    background:radial-gradient(40% 50% at var(--sun) 10%, rgba(255,230,180,.5), transparent 64%);
    animation:creep 64s ease-in-out infinite alternate;
  }
  @keyframes creep{from{--sun:20%;}to{--sun:46%;}}

  /* ---- the blinds ----
     Stripes that sit over the wall AND over the machine, because light does not stop at the
     bezel. The slats open a little and close again, which changes the width of the light bands
     rather than merely sliding them. */
  /* The hard stripes fall on the WALL, behind the machine. Light landing on a screen does not
     make the screen harder to read, and axe cannot see a blend-mode layer sitting over text — so
     this is a contrast bug the gate would have passed. */
  .slats{
    position:fixed;inset:-30%;z-index:1;pointer-events:none;mix-blend-mode:multiply;opacity:.55;
    background:repeating-linear-gradient(var(--tilt),
      rgba(90,70,38,.46) 0 22px, rgba(255,246,228,0) 22px 64px);
    animation:open 58s ease-in-out infinite alternate, sway 29s ease-in-out infinite alternate;
  }
  /* the warm counterpart, added back where the light gets through */
  .slats-warm{
    position:fixed;inset:-30%;z-index:1;pointer-events:none;mix-blend-mode:screen;opacity:.45;
    background:repeating-linear-gradient(var(--tilt),
      rgba(255,228,170,0) 0 22px, rgba(255,228,170,.5) 30px 56px, rgba(255,228,170,0) 64px);
    animation:open 58s ease-in-out infinite alternate, sway 29s ease-in-out infinite alternate;
  }
  @keyframes open{from{--tilt:-11deg;}to{--tilt:-6.5deg;}}
  @keyframes sway{from{transform:translate3d(0,-1.4%,0)}to{transform:translate3d(0,1.4%,0)}}

  /* the same stripes again over the machine, at a sixth of the strength: enough that the light
     reads as continuous across the bezel, not enough to touch legibility */
  .slats-over{
    position:fixed;inset:-30%;z-index:3;pointer-events:none;mix-blend-mode:multiply;opacity:.09;
    background:repeating-linear-gradient(var(--tilt),
      rgba(90,70,38,.5) 0 22px, rgba(255,246,228,0) 22px 64px);
    animation:open 58s ease-in-out infinite alternate, sway 29s ease-in-out infinite alternate;
  }

  /* the cord, hanging at the left, swinging barely at all */
  .cord{position:fixed;left:clamp(16px,6vw,86px);top:0;z-index:4;pointer-events:none;
        width:30px;height:min(58vh,440px);transform-origin:50% 0;
        animation:swing 17s ease-in-out infinite alternate;}
  @keyframes swing{from{rotate:-.9deg}to{rotate:.9deg}}
  .cord path{fill:none;stroke:rgba(96,78,48,.5);stroke-width:1.6;}
  .cord circle{fill:rgba(96,78,48,.6);}

  /* the shelf it stands on */
  .shelf{position:fixed;left:0;right:0;bottom:0;height:var(--desk-h);z-index:4;pointer-events:none;
         background:linear-gradient(to bottom,#d9cdb2,#bfb193 36%,#9a8d72);
         border-top:1px solid #efe6d2;
         box-shadow:0 -12px 26px -16px rgba(60,44,20,.55);}
  .shelf::before{content:'';position:absolute;inset:0;opacity:.4;
    background:repeating-linear-gradient(92deg, rgba(90,70,40,.22) 0 1px, transparent 1px 9px);}
  /* the machine's own shadow, thrown onto the shelf away from the window */
  .shelf::after{content:'';position:absolute;left:50%;top:0;width:min(820px,84vw);height:56%;
    transform:translateX(-46%) skewX(-12deg);
    background:radial-gradient(ellipse at 50% 0%, rgba(74,56,26,.3), transparent 66%);
    filter:blur(9px);}

  /* a plant on the shelf, leaves turning a few degrees in the draught */
  .plant{position:fixed;right:clamp(14px,7vw,124px);bottom:calc(var(--desk-h) - 10px);z-index:5;
         width:clamp(58px,8vw,104px);pointer-events:none;transform-origin:50% 100%;
         animation:draught 23s ease-in-out infinite alternate;}
  @keyframes draught{from{rotate:-1.3deg}to{rotate:1.3deg}}
  .leaf{fill:#5f7a4e;}
  .leaf-2{fill:#50683f;}
  .pot{fill:#a8755a;}
  .pot-2{fill:#8d604a;}

  /* the machine: a pale, matt-bezel panel that the stripes fall across */
  .screen{
    background:#f7f6f3;border:1px solid #c9c2b2;border-radius:12px;
    box-shadow:0 1px 0 rgba(255,255,255,.95) inset, 0 0 0 5px #e6e0d2, 0 0 0 6px #b6ad99,
               0 30px 54px -30px rgba(70,54,26,.75);
  }

  @media (prefers-reduced-motion:reduce){
    /* the light stays where it fell — the stripes are the design, not an effect over it */
    .room .sunpool{--sun:32%;}
    .slats,.slats-warm,.slats-over{--tilt:-9deg;}
  }`,

  behind: `<div class="room" aria-hidden="true">
  <span class="plaster"></span><span class="sunpool"></span>
</div>
<div class="slats" aria-hidden="true"></div>
<div class="slats-warm" aria-hidden="true"></div>`,

  behindExtra: '',
  front: `<div class="slats-over" aria-hidden="true"></div>
<svg class="cord" viewBox="0 0 30 440" aria-hidden="true" preserveAspectRatio="none">
  <path d="M13 0v402"/><path d="M19 0v372"/>
  <circle cx="13" cy="408" r="4"/><circle cx="19" cy="378" r="4"/>
</svg>
<div class="shelf" aria-hidden="true"></div>
<svg class="plant" viewBox="0 0 100 120" aria-hidden="true">
  <path class="leaf" d="M50 74C34 66 24 48 30 30c16 2 26 20 20 44z"/>
  <path class="leaf-2" d="M50 74c16-8 26-26 20-44-16 2-26 20-20 44z"/>
  <path class="leaf" d="M50 76C38 70 22 70 14 58c14-8 30-2 36 18z"/>
  <path class="leaf-2" d="M50 76c12-6 28-6 36-18-14-8-30-2-36 18z"/>
  <path class="pot" d="M30 78h40l-6 36H36z"/>
  <path class="pot-2" d="M27 74h46v8H27z"/>
</svg>`,
};
