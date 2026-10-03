// The constant: the computer, its address bar, its padlock, and the site inside it.
//
// This is the part that does NOT vary. The brief is one machine in many places, so the machine is
// written once here and the places are written one apiece in rooms/. Each page is still emitted as
// a single self-contained file — nothing is shared at runtime, there is no base stylesheet, and a
// room is free to restyle any of this. The sharing is at authoring time only, which is the
// opposite of the mistake that produced 128 recolours.

export const SITE_CSS = `
  .bar{display:flex;align-items:center;gap:12px;padding:10px 14px;
       background:var(--panel);border-bottom:1px solid var(--rule);}
  .lamps{display:flex;gap:7px;}
  .lamps i{width:11px;height:11px;border-radius:50%;background:var(--lamp-off);
           box-shadow:0 0 0 1px rgba(0,0,0,.07) inset;}
  .addr{flex:1;min-width:0;display:flex;align-items:center;gap:8px;
        background:var(--addr);border:1px solid var(--rule);border-radius:999px;
        padding:5px 13px;font-size:12.5px;color:var(--quiet);}
  .addr .host{color:var(--ink);font-weight:500;}
  .lock{display:inline-flex;align-items:center;justify-content:center;flex:none;
        width:19px;height:19px;border:0;border-radius:50%;background:none;cursor:pointer;
        color:var(--faint);
        transition:color var(--t) ease, background var(--t) ease, transform 70ms ease;}
  .lock:hover{color:var(--ink);background:var(--hover);}
  .lock:active{transform:scale(.9);}
  .lock[aria-pressed="true"]{color:var(--green);}

  nav{display:flex;gap:2px;padding:0 10px;background:var(--panel);
      border-bottom:1px solid var(--rule);overflow-x:auto;scrollbar-width:none;}
  nav::-webkit-scrollbar{display:none;}
  nav button{font:inherit;font-size:13px;cursor:pointer;background:none;border:0;color:var(--quiet);
             padding:10px 13px;border-bottom:2px solid transparent;white-space:nowrap;
             transition:color var(--t) ease, border-color var(--t) ease;}
  nav button:hover{color:var(--ink);}
  nav button[aria-current="page"]{color:var(--ink);border-bottom-color:var(--ink);}

  main{background:var(--page);padding:clamp(20px,3vw,38px);}
  .top{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(240px,.9fr);
       gap:clamp(18px,3vw,42px);align-items:start;}
  @media (max-width:800px){.top{grid-template-columns:minmax(0,1fr);}}

  h1{font-family:'Archivo',sans-serif;font-weight:700;letter-spacing:-.042em;
     font-size:clamp(36px,5.4vw,60px);line-height:.92;margin-bottom:.2em;text-wrap:balance;}
  .role{font-family:'Archivo',sans-serif;font-weight:500;font-size:clamp(15px,1.8vw,19px);
        color:var(--soft);max-width:33ch;letter-spacing:-.013em;margin-bottom:16px;text-wrap:pretty;}
  .body p{font-size:14.5px;color:var(--soft);max-width:60ch;margin-bottom:11px;text-wrap:pretty;}
  .body strong{color:var(--ink);font-weight:600;}
  .acts{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px;}
  .acts button{font:inherit;font-size:13.5px;font-weight:500;cursor:pointer;border-radius:8px;
               padding:9px 16px;border:1px solid var(--ink);background:var(--ink);color:var(--page);
               transition:opacity var(--t) ease, transform 70ms ease;}
  .acts button:hover{opacity:.86;}
  .acts button:active{transform:translateY(1px);}
  .acts .ghost{background:none;color:var(--ink);border-color:var(--rule);}
  .acts .ghost:hover{border-color:var(--ink);opacity:1;}

  .rail h2{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);
           margin-bottom:11px;}
  .entry{display:grid;grid-template-columns:60px minmax(0,1fr);gap:12px;padding:9px 0;
         align-items:baseline;border-top:1px solid var(--rule);}
  .entry .when{font-size:12px;color:var(--faint);font-variant-numeric:tabular-nums;
               display:flex;align-items:center;gap:6px;}
  .entry .mark{width:7px;height:7px;border-radius:50%;flex:none;}
  .entry[data-state="a"] .mark{background:var(--red);}
  .entry[data-state="b"] .mark{background:var(--green);}
  .entry[data-state="both"] .mark{background:linear-gradient(90deg,var(--red) 50%,var(--green) 50%);}
  .entry .what{font-size:14px;font-weight:600;letter-spacing:-.011em;}
  .entry .where{font-size:12.5px;color:var(--quiet);margin-top:1px;}

  .kit{margin-top:24px;border-top:1px solid var(--rule);padding-top:16px;
       display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:16px;}
  .kit dt{font-size:13px;font-weight:600;margin-bottom:5px;}
  .kit dd{display:flex;flex-wrap:wrap;gap:5px 10px;font-size:13px;color:var(--quiet);}

  .foot{display:flex;gap:16px;padding:10px 16px;background:var(--panel);
        border-top:1px solid var(--rule);font-size:12px;}
  .foot button{font:inherit;font-size:12px;background:none;border:0;cursor:pointer;color:var(--quiet);}
  .foot button:hover{color:var(--ink);}
`;

export const SITE_HTML = `
    <div class="bar">
      <div class="lamps" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="addr">
        <button type="button" class="lock" id="lock" aria-pressed="false" aria-label="Site information">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.4" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2"/>
            <path id="shackle" d="M8 11V7a4 4 0 0 1 8 0v4"/>
          </svg>
        </button>
        <span><span class="host">aedinlai.com</span></span>
      </div>
    </div>

    <nav aria-label="Sections">
      <button type="button" aria-current="page">general</button>
      <button type="button">projects</button>
      <button type="button">resume</button>
      <button type="button">news</button>
      <button type="button">contact</button>
    </nav>

    <main>
      <div class="top">
        <div>
          <h1>Aedin Lai</h1>
          <p class="role">Electrical &amp; computer engineering, where the hardware and the software
            have to agree.</p>
          <div class="body">
            <p>I build the measuring end of things — <strong>instrumentation that has to be
              right</strong>, and the software that makes sense of what it reads. Recent work runs
              from data centre infrastructure to research hardware for a neurology study, by way of
              an arcade machine built from nothing.</p>
            <p>I fence épée for Northeastern, which is the only weapon where both lights can come on
              at once. That turns out to be a reasonable description of the work as well.</p>
          </div>
          <div class="acts">
            <button type="button">See the work</button>
            <button type="button" class="ghost">Get in touch</button>
          </div>
        </div>

        <section class="rail" aria-label="Recent work">
          <h2>Where I've been</h2>
          <div class="entry" data-state="a">
            <span class="when"><i class="mark"></i>2025</span>
            <div><div class="what">Data Center Infrastructure Intern</div>
              <div class="where">SingleStore — scaled a private cloud from 160 to over 300 VMs</div></div>
          </div>
          <div class="entry" data-state="b">
            <span class="when"><i class="mark"></i>2025</span>
            <div><div class="what">Co-authored research published in JAMA</div>
              <div class="where">Yale School of Medicine, PEACE Foundation</div></div>
          </div>
          <div class="entry" data-state="both">
            <span class="when"><i class="mark"></i>2021–25</span>
            <div><div class="what">USA Fencing A25, All-American</div>
              <div class="where">#103 national, #122 global</div></div>
          </div>
          <div class="entry" data-state="both">
            <span class="when"><i class="mark"></i>2026</span>
            <div><div class="what">Captain, Northeastern Club Fencing</div>
              <div class="where">Leading the team into the national championship</div></div>
          </div>
        </section>
      </div>

      <dl class="kit">
        <div><dt>Writing code</dt>
          <dd><span>Python</span><span>Java</span><span>C#</span><span>SQL</span><span>MATLAB</span><span>JavaScript</span></dd></div>
        <div><dt>Building hardware</dt>
          <dd><span>Raspberry Pi</span><span>Embedded systems</span><span>Sensor integration</span><span>SolidWorks</span></dd></div>
        <div><dt>Everything else</dt>
          <dd><span>Git</span><span>Linux</span><span>Pandas</span><span>VS Code</span></dd></div>
      </dl>
    </main>

    <div class="foot">
      <button type="button">Privacy</button>
      <button type="button">Terms</button>
    </div>`;

// The padlock is how the real site opens its secret panel, so on every page it is a real control
// with real state rather than a picture of one. The lean is one rAF that stops scheduling when the
// pointer stops, and never runs at all under reduced motion.
export const SITE_JS = `
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let want = [0, 0], have = [0, 0], raf = 0;
  function tick() {
    const dx = want[0] - have[0], dy = want[1] - have[1];
    have[0] += dx * 0.08; have[1] += dy * 0.08;
    root.style.setProperty('--px', have[0].toFixed(4));
    root.style.setProperty('--py', have[1].toFixed(4));
    raf = (Math.abs(dx) > 0.002 || Math.abs(dy) > 0.002) ? requestAnimationFrame(tick) : 0;
  }
  addEventListener('pointermove', (e) => {
    if (reduce.matches) return;
    want = [(e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1];
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  addEventListener('pointerleave', () => { want = [0, 0]; if (!raf) raf = requestAnimationFrame(tick); });

  const lock = document.getElementById('lock');
  const shackle = document.getElementById('shackle');
  lock.addEventListener('click', () => {
    const open = lock.getAttribute('aria-pressed') !== 'true';
    lock.setAttribute('aria-pressed', String(open));
    lock.setAttribute('aria-label', open ? 'Site information, open' : 'Site information');
    shackle.setAttribute('d', open ? 'M8 11V7a4 4 0 0 1 7.9-.8' : 'M8 11V7a4 4 0 0 1 8 0v4');
  });
})();`;
