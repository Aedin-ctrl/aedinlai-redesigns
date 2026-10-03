export default {
  name: 'In the greenhouse',
  idea: 'Glass overhead and leaves pressing in. Dappled green light moves across everything, slowly.',
  scheme: 'light',
  themeColor: '#dfe8da',
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23dbe6d4'/%3E%3Cpath d='M2 30C2 16 10 6 22 2c2 14-6 26-20 28z' fill='%236f9459' opacity='.8'/%3E%3Crect x='9' y='11' width='17' height='12' rx='2' fill='%23fff' stroke='%23587046'/%3E%3C/svg%3E",

  properties: `  @property --dapple{syntax:'<percentage>';inherits:true;initial-value:40%;}`,

  tokens: `    --glass:#dfe8da; --glass-lo:#c3d2bc; --leaf:#5f8049; --leaf-dk:#3f5a30;
    --slab-h:clamp(74px,12vh,132px);`,

  css: `
  body{background:var(--glass);padding:clamp(18px,3.4vw,52px) clamp(12px,4vw,56px) 0;}
  .machine{margin-bottom:calc(var(--slab-h) + clamp(14px,2.5vh,34px));}

  /* ---- the house ----
     Light coming down through glass and foliage: a warm pool that wanders, plus the shadow of
     the glazing bars across everything. */
  .house{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
         background:linear-gradient(172deg,#eef4ea,var(--glass) 44%,var(--glass-lo));}
  .house .sun{
    position:absolute;inset:-20%;
    background:
      radial-gradient(36% 40% at var(--dapple) 6%, rgba(255,250,214,.62), transparent 64%),
      radial-gradient(44% 38% at 78% 88%, rgba(130,170,110,.26), transparent 68%);
    animation:wander 56s ease-in-out infinite alternate;
  }
  @keyframes wander{from{--dapple:28%;transform:translate3d(-1.4%,-1%,0) scale(1);}
                    to{--dapple:56%;transform:translate3d(1.6%,1.2%,0) scale(1.05);}}
  /* glazing bars: a pitched roof seen from underneath */
  .house .bars{
    position:absolute;inset:-10%;opacity:.3;
    background:
      repeating-linear-gradient(74deg, rgba(70,90,56,.5) 0 2px, transparent 2px 64px),
      repeating-linear-gradient(-74deg, rgba(70,90,56,.34) 0 2px, transparent 2px 92px);
  }
  /* condensation on the glass, barely there */
  .house .mist{
    position:absolute;inset:0;opacity:.4;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23m)' opacity='.1'/%3E%3C/svg%3E");
  }

  /* ---- foliage pressing in at the corners ----
     Two masses, each turning a degree or so on its own cycle, so the frame of leaves is never
     quite still but never distracting either. */
  .fronds{position:fixed;inset:0;z-index:1;pointer-events:none;}
  .fronds svg{position:absolute;}
  .fronds .tl{top:-3%;left:-5%;width:clamp(180px,30vw,420px);transform-origin:12% 8%;
              animation:lean-a 34s ease-in-out infinite alternate;}
  .fronds .br{bottom:-4%;right:-6%;width:clamp(200px,33vw,460px);transform-origin:88% 92%;
              animation:lean-b 41s ease-in-out infinite alternate;}
  .fronds .tr{top:-6%;right:-4%;width:clamp(140px,22vw,300px);transform-origin:90% 6%;
              animation:lean-b 27s ease-in-out infinite alternate;}
  @keyframes lean-a{from{rotate:-1.6deg;}to{rotate:1.4deg;}}
  @keyframes lean-b{from{rotate:1.5deg;}to{rotate:-1.3deg;}}
  .lf{fill:var(--leaf);opacity:.86;}
  .lf-d{fill:var(--leaf-dk);opacity:.8;}
  .lf-v{fill:none;stroke:rgba(240,250,232,.4);stroke-width:1.6;}

  /* dappled shadow thrown over the machine, which is what sells it sitting in here */
  .dapple{
    position:fixed;inset:-20%;z-index:3;pointer-events:none;mix-blend-mode:multiply;opacity:.3;
    background:
      radial-gradient(14% 12% at 22% 18%, rgba(50,70,40,.9), transparent 70%),
      radial-gradient(10% 16% at 66% 12%, rgba(50,70,40,.8), transparent 72%),
      radial-gradient(18% 10% at 84% 46%, rgba(50,70,40,.75), transparent 72%),
      radial-gradient(12% 14% at 36% 72%, rgba(50,70,40,.8), transparent 72%),
      radial-gradient(9% 11% at 54% 38%, rgba(50,70,40,.7), transparent 74%);
    animation:shift 44s ease-in-out infinite alternate;
  }
  @keyframes shift{from{transform:translate3d(-1.8%,-1.2%,0) scale(1);}
                   to{transform:translate3d(2%,1.4%,0) scale(1.06);}}

  /* the potting slab it stands on */
  .slab{position:fixed;left:0;right:0;bottom:0;height:var(--slab-h);z-index:4;pointer-events:none;
        background:linear-gradient(to bottom,#cfcabb,#b3ad9e 38%,#8e8878);
        border-top:1px solid #e6e2d6;
        box-shadow:0 -12px 26px -16px rgba(40,50,34,.55);}
  .slab::before{content:'';position:absolute;inset:0;opacity:.42;
    background:repeating-linear-gradient(90deg, rgba(60,70,50,.2) 0 1px, transparent 1px 38px),
               repeating-linear-gradient(0deg, rgba(60,70,50,.16) 0 1px, transparent 1px 30px);}
  .slab::after{content:'';position:absolute;left:50%;top:0;width:min(820px,86vw);height:60%;
    transform:translateX(-50%);
    background:radial-gradient(ellipse at 50% 0%, rgba(50,64,40,.26), transparent 66%);
    filter:blur(8px);}

  /* a watering can and a seed tray, on the slab beside the machine */
  .kit-objs{position:fixed;left:0;right:0;bottom:0;height:var(--slab-h);z-index:5;pointer-events:none;}
  .kit-objs svg{position:absolute;bottom:clamp(8px,1.8vh,22px);}
  .can{left:clamp(12px,6vw,104px);width:clamp(54px,7.4vw,106px);}
  .tray{right:clamp(12px,6vw,104px);width:clamp(62px,9vw,128px);}
  .mt{fill:#8c9aa0;stroke:#5d686d;stroke-width:1.6;stroke-linejoin:round;}
  .mt-2{fill:#73818a;}
  .soil{fill:#4d3a2a;}
  .sprout{fill:none;stroke:#5f8049;stroke-width:2;stroke-linecap:round;}

  /* the machine: a pale green-grey bezel that belongs in here */
  .screen{
    background:#f6f8f4;border:1px solid #adbba6;border-radius:12px;
    box-shadow:0 1px 0 rgba(255,255,255,.95) inset, 0 0 0 5px #dde5d8, 0 0 0 6px #94a68c,
               0 30px 54px -30px rgba(38,52,32,.7);
  }

  @media (prefers-reduced-motion:reduce){
    /* the dapple stays where it fell; leaves stay leaning. none of it is an effect bolted on top. */
    .house .sun{--dapple:40%;}
  }`,

  behind: `<div class="house" aria-hidden="true">
  <span class="sun"></span><span class="bars"></span><span class="mist"></span>
</div>
<div class="fronds" aria-hidden="true">
  <svg class="tl" viewBox="0 0 300 220">
    <path class="lf-d" d="M-10 0c70 6 126 46 152 104C96 108 34 72-10 24z"/>
    <path class="lf" d="M12 -14c58 30 94 86 98 152-48-36-86-92-98-152z"/>
    <path class="lf-v" d="M14 -8c40 42 72 94 90 146"/>
    <path class="lf-d" d="M92 -20c38 44 54 104 46 162-28-52-40-112-46-162z"/>
  </svg>
  <svg class="tr" viewBox="0 0 220 180">
    <path class="lf" d="M230 -12c-56 18-96 62-112 118 48-22 92-66 112-118z"/>
    <path class="lf-d" d="M236 36c-46 6-86 36-108 78 44 2 88-28 108-78z"/>
    <path class="lf-v" d="M228 -6c-40 36-72 82-88 128"/>
  </svg>
  <svg class="br" viewBox="0 0 320 240">
    <path class="lf-d" d="M330 250c-74-8-134-50-162-112 60 4 126 44 162 112z"/>
    <path class="lf" d="M306 258c-62-32-100-92-104-162 52 38 92 98 104 162z"/>
    <path class="lf-v" d="M304 252c-42-46-76-100-96-154"/>
    <path class="lf-d" d="M224 262c-40-46-58-110-50-172 30 54 44 118 50 172z"/>
  </svg>
</div>`,

  front: `<div class="dapple" aria-hidden="true"></div>
<div class="slab" aria-hidden="true"></div>
<div class="kit-objs" aria-hidden="true">
  <svg class="can" viewBox="0 0 106 86">
    <path class="mt" d="M18 32h46v38a10 10 0 0 1-10 10H28a10 10 0 0 1-10-10z"/>
    <path class="mt-2" d="M18 32h46v9H18z"/>
    <path class="mt" d="M64 40l28-22 10 6-32 28z"/>
    <path class="mt" d="M28 32c0-9 7-14 13-14s13 5 13 14"/>
  </svg>
  <svg class="tray" viewBox="0 0 128 70">
    <path class="mt" d="M8 26h112l-8 38H16z"/>
    <path class="soil" d="M16 32h96l-5 26H21z"/>
    <path class="sprout" d="M36 50v-12M36 42c-6-2-8-7-7-11M36 44c6-3 7-8 6-12"/>
    <path class="sprout" d="M64 52v-14M64 44c-6-2-8-7-7-11M64 46c6-3 7-8 6-12"/>
    <path class="sprout" d="M92 50v-11M92 43c-5-2-7-6-6-10"/>
  </svg>
</div>`,
};
