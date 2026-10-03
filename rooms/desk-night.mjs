export default {
  name: 'Desk at night',
  idea: 'On a desk, late. A lamp off to one side, the screen throwing its light back onto the wood, a mug going cold.',
  scheme: 'dark',
  themeColor: '#14110d',
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='5' fill='%231d1812'/%3E%3Crect x='6' y='8' width='20' height='14' rx='2' fill='%23f4f1ea'/%3E%3Crect x='13' y='23' width='6' height='2' fill='%238a7a60'/%3E%3C/svg%3E",

  properties: `  @property --lamp{syntax:'<percentage>';inherits:true;initial-value:40%;}
  @property --glow{syntax:'<number>';inherits:true;initial-value:1;}`,

  tokens: `    --room:#14110d; --wood:#2a2017; --wood-hi:#3a2c1f;
    --desk-h:clamp(120px,19vh,200px);`,

  css: `
  body{background:var(--room);padding:clamp(16px,3vw,44px) clamp(12px,4vw,58px) 0;}
  .machine{margin-bottom:calc(var(--desk-h) + clamp(14px,2vh,30px));}

  /* the wall, with a lamp off to the upper left whose warmth drifts across it */
  .room{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
  .room .wall{
    position:absolute;inset:-18%;
    background:
      radial-gradient(42% 46% at var(--lamp) 4%, rgba(255,215,160,.22), transparent 62%),
      radial-gradient(70% 60% at 50% 120%, rgba(255,215,160,.07), transparent 70%),
      repeating-linear-gradient(97deg, rgba(0,0,0,.2) 0 2px, transparent 2px 9px);
    animation:lamp-drift 46s ease-in-out infinite alternate;
  }
  @keyframes lamp-drift{from{--lamp:34%;transform:translate3d(-1.2%,-.8%,0) scale(1);}
                        to{--lamp:46%;transform:translate3d(1.4%,1%,0) scale(1.05);}}

  /* the cable leaving the back of the machine, clipped by the room so it cannot run off-screen */
  .cable{position:absolute;left:50%;bottom:0;width:min(520px,70vw);transform:translateX(-18%);}
  .cable path{fill:none;stroke:#0d0a07;stroke-width:5;stroke-linecap:round;opacity:.75;}
  .cable .hi{stroke:rgba(255,220,180,.16);stroke-width:1.4;}

  /* the board it stands on, lit by its own screen */
  .desk{
    position:fixed;left:0;right:0;bottom:0;height:var(--desk-h);z-index:0;pointer-events:none;
    background:
      linear-gradient(to bottom, rgba(0,0,0,.5), transparent 24%),
      radial-gradient(60% 150% at 50% 0%, rgba(230,235,245,calc(.1 * var(--glow))), transparent 62%),
      linear-gradient(to bottom, var(--wood-hi), var(--wood) 42%, #1d160f);
    border-top:1px solid rgba(255,220,180,.17);
  }
  .desk::before{
    content:'';position:absolute;inset:0;opacity:.45;
    background:repeating-linear-gradient(91deg,
      rgba(0,0,0,.26) 0 1px, transparent 1px 7px, rgba(255,230,195,.05) 7px 8px, transparent 8px 19px);
  }
  .desk::after{
    content:'';position:absolute;left:50%;top:-6px;width:min(880px,86vw);height:70%;
    transform:translateX(-50%);
    background:radial-gradient(ellipse at 50% 0%, rgba(214,226,244,calc(.17 * var(--glow))), transparent 68%);
    filter:blur(10px);animation:flicker 7s ease-in-out infinite alternate;
  }
  @keyframes flicker{from{--glow:.88}to{--glow:1.1}}

  .things{position:fixed;left:0;right:0;bottom:0;height:var(--desk-h);z-index:1;pointer-events:none;}
  .things svg{position:absolute;bottom:clamp(10px,2.4vh,28px);}
  .mug{left:clamp(14px,8vw,138px);width:clamp(46px,6.4vw,76px);}
  .pad{right:clamp(14px,7vw,120px);width:clamp(78px,12vw,168px);}
  .obj{fill:none;stroke:rgba(255,226,186,.42);stroke-width:1.5;stroke-linecap:round;}
  .obj-d{fill:rgba(12,9,6,.62);}
  .steam{fill:none;stroke:rgba(255,232,200,.3);stroke-width:1.3;stroke-linecap:round;
         opacity:0;animation:steam 9s ease-in-out infinite;}
  .steam:nth-of-type(2){animation-delay:-4.2s;}
  @keyframes steam{0%{opacity:0;transform:translateY(2px) scaleY(.9);}
                   35%{opacity:.75;}100%{opacity:0;transform:translateY(-16px) scaleY(1.25);}}

  /* the machine itself: a monitor, thick-bodied, on a stand */
  .screen{
    background:#e9e9ea;border:1px solid #c2c2c5;border-radius:13px;
    box-shadow:0 1px 0 rgba(255,255,255,.95) inset, 0 0 0 6px #d7d7da, 0 0 0 7px #a9a9ad,
               0 42px 60px -34px rgba(0,0,0,.95), 0 0 120px -28px rgba(205,220,245,.4);
  }
  .stand{position:relative;z-index:2;width:min(930px,100%);margin:-2px auto 0;
         display:grid;place-items:center;}
  .stand i{display:block;width:clamp(70px,9vw,104px);height:clamp(14px,2.4vh,26px);
           background:linear-gradient(to bottom,#c8c8cc,#8e8e93);
           clip-path:polygon(22% 0,78% 0,100% 100%,0 100%);}
  .stand b{display:block;width:clamp(150px,20vw,230px);height:7px;border-radius:0 0 5px 5px;
           background:linear-gradient(to bottom,#b4b4b9,#7c7c81);
           box-shadow:0 10px 22px -8px rgba(0,0,0,.9);}

  @media (prefers-reduced-motion:reduce){
    .room .wall{--lamp:40%;}
    .steam{opacity:.5;}
  }`,

  behind: `<div class="room" aria-hidden="true">
  <span class="wall"></span>
  <svg class="cable" viewBox="0 0 520 150">
    <path d="M250 0c0 46-34 58-78 74s-96 30-96 76"/>
    <path class="hi" d="M250 4c0 44-33 56-77 72s-95 30-95 74"/>
  </svg>
</div>`,

  front: `<div class="stand" aria-hidden="true"><i></i><b></b></div>
<div class="desk" aria-hidden="true"></div>
<div class="things" aria-hidden="true">
  <svg class="mug" viewBox="0 0 64 70">
    <path class="steam" d="M26 20c-5-7 5-10 0-17"/>
    <path class="steam" d="M38 20c5-7-5-10 0-17"/>
    <path class="obj-d" d="M12 30h36v26a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8z"/>
    <path class="obj" d="M12 30h36v26a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8z"/>
    <path class="obj" d="M48 36h5a7 7 0 0 1 0 14h-5"/>
  </svg>
  <svg class="pad" viewBox="0 0 140 62">
    <path class="obj-d" d="M6 14h116l12 40H18z"/>
    <path class="obj" d="M6 14h116l12 40H18z"/>
    <path class="obj" d="M22 26h92M26 36h84M30 46h60" opacity=".55"/>
  </svg>
</div>`,
};
