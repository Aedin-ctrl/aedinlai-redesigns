export default {
  name: 'Deep',
  idea: 'Nothing holding it up. Three fields of colour drift past at three depths and the edges of the frame dissolve into them.',
  scheme: 'light',
  themeColor: '#e9ecf1',
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23dfe4ec'/%3E%3Ccircle cx='9' cy='11' r='7' fill='%233d5a8c' opacity='.35'/%3E%3Ccircle cx='23' cy='21' r='8' fill='%232f7a63' opacity='.3'/%3E%3Crect x='7' y='10' width='18' height='13' rx='2.5' fill='%23fff' stroke='%236b7686'/%3E%3C/svg%3E",

  tokens: `    --space:#e9ecf1; --a:#3d5a8c; --b:#2f7a63; --c:#8a5a3c;`,

  css: `
  body{background:var(--space);place-items:center;
       padding:clamp(14px,4vw,60px);grid-template-rows:1fr;}

  /* ---- three depths ----
     Each layer drifts on its own cycle and shifts a different amount under the pointer. That
     difference is the depth; without it this is just a moving picture. The far layer travels
     about 2% of the viewport over 54 seconds, which you only notice if it stops. */
  .deep{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
  .deep span{position:absolute;inset:-25%;display:block;will-change:transform;}
  .deep .far{
    background:
      radial-gradient(34% 30% at 22% 26%, rgba(61,90,140,.26), transparent 70%),
      radial-gradient(30% 28% at 78% 68%, rgba(47,122,99,.22), transparent 70%);
    filter:blur(50px);
    transform:translate3d(calc(var(--px,0) * 7px), calc(var(--py,0) * 7px), 0);
    animation:far 54s ease-in-out infinite alternate;
  }
  .deep .mid{
    background:
      radial-gradient(22% 20% at 62% 22%, rgba(138,90,60,.22), transparent 72%),
      radial-gradient(26% 24% at 30% 74%, rgba(61,90,140,.2), transparent 72%);
    filter:blur(34px);
    transform:translate3d(calc(var(--px,0) * 15px), calc(var(--py,0) * 15px), 0);
    animation:mid 37s ease-in-out infinite alternate;
  }
  .deep .near{
    background:repeating-linear-gradient(72deg, rgba(20,23,29,.045) 0 1px, transparent 1px 26px);
    transform:translate3d(calc(var(--px,0) * 26px), calc(var(--py,0) * 26px), 0);
    animation:near 29s ease-in-out infinite alternate;
  }
  @keyframes far{from{translate:-1.6% -1%;scale:1}  to{translate:1.8% 1.2%;scale:1.07}}
  @keyframes mid{from{translate:1.4% .8%;scale:1.05} to{translate:-1.6% -1.1%;scale:1}}
  @keyframes near{from{translate:-.8% -.5%}          to{translate:.9% .6%}}

  /* the machine: no stand, no desk. Its edges are feathered with a mask so the frame dissolves
     into whatever is behind it instead of being pasted on top. */
  .machine{margin-bottom:0;}
  .screen{
    background:#fdfdfe;border:1px solid #b9c1cc;border-radius:16px;
    box-shadow:0 1px 0 rgba(255,255,255,.9) inset, 0 40px 80px -46px rgba(20,23,29,.6);
  }
  .machine::after{
    content:'';position:absolute;inset:calc(-1 * clamp(6px,2.4vw,26px));z-index:-1;
    border-radius:34px;pointer-events:none;background:var(--space);
    -webkit-mask-image:radial-gradient(closest-side, transparent 58%, #000 100%);
    mask-image:radial-gradient(closest-side, transparent 58%, #000 100%);
    opacity:.85;
  }

  @media (prefers-reduced-motion:reduce){
    /* the depth stays — it holds still rather than the page going blank */
    .deep .far{translate:.6% .4%;scale:1.03;}
    .deep .mid{translate:-.5% -.3%;scale:1.02;}
  }`,

  behind: `<div class="deep" aria-hidden="true">
  <span class="far"></span><span class="mid"></span><span class="near"></span>
</div>`,

  script: `
(() => {
  // On a phone there is no pointer, so the tilt of the device does the same job where it is offered.
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  addEventListener('deviceorientation', (e) => {
    if (reduce.matches || e.gamma == null || e.beta == null) return;
    const root = document.documentElement;
    root.style.setProperty('--px', (Math.max(-30, Math.min(30, e.gamma)) / 30).toFixed(3));
    root.style.setProperty('--py', (Math.max(-30, Math.min(30, e.beta - 40)) / 30).toFixed(3));
  }, { passive: true });
})();`,
};
