/* فنتازيا: خلفية حيّة
   - 5 تدرجات لونية خفيفة، تتغير عشوائياً (بانتقال ناعم) كل ما يدخل الطفل لعبة أو تصنيف أو يرجع للرئيسية.
   - نقاط بيضاء متحركة بـ 5 أنماط حركة، يُختار النمط عشوائياً وبشكل مستقل عن التدرج.
   - تحترم إعداد «تقليل الحركة» في الجهاز، وتتوقف عند إخفاء التبويب، وتخفّ أثناء اللعب للحفاظ على الأداء. */
(() => {
  if (document.getElementById('fzbg')) return;
  const GRADS = [
    ['#cfe8ff', '#e4d8ff'], // سماوي وموف
    ['#fff4c2', '#d6f5c4'], // أصفر وتفاحي
    ['#ffdcec', '#ffe8cf'], // وردي وخوخي
    ['#d2f6ea', '#d3e8ff'], // نعناعي وسماوي
    ['#e8dcff', '#ffd9e8'], // ليلكي ووردي
  ];
  const css = document.createElement('style');
  css.textContent = `body{background:transparent!important;background-image:none!important}
#fzbg{position:fixed;inset:0;z-index:-2;pointer-events:none}
#fzbg i{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease}#fzbg i.on{opacity:1}
#fzdots{position:fixed;inset:0;z-index:-1;pointer-events:none;width:100%;height:100%}`;
  document.head.appendChild(css);
  const wrap = document.createElement('div'); wrap.id = 'fzbg'; wrap.innerHTML = '<i></i><i></i>';
  const cv = document.createElement('canvas'); cv.id = 'fzdots';
  const mount = () => { document.body.prepend(cv); document.body.prepend(wrap); };
  document.body ? mount() : addEventListener('DOMContentLoaded', mount);
  const layers = wrap.querySelectorAll('i'); let front = 0, gi = -1;
  const pick = (n, not) => { let k; do k = Math.floor(Math.random() * n); while (n > 1 && k === not); return k; };
  function setGrad() {
    gi = pick(GRADS.length, gi); const [a, b] = GRADS[gi], ang = [135, 160, 120, 200, 45][Math.floor(Math.random() * 5)];
    const nx = layers[1 - front]; nx.style.background = `linear-gradient(${ang}deg,${a},${b})`;
    nx.classList.add('on'); layers[front].classList.remove('on'); front = 1 - front;
  }

  /* ---------- النقاط ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const x = cv.getContext('2d'); let W = 0, H = 0, dots = [], mode = -1, t0 = performance.now();
  const GAP = 28;
  function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; build(); }
  function build() {
    dots = [];
    if (mode === 1 || mode === 4) { // نقاط حرّة: سابحة عشوائياً أو فقاعات صاعدة
      const n = Math.round((W * H) / 5200);
      for (let i = 0; i < n; i++) dots.push({ x: Math.random() * W, y: Math.random() * H, r: 1.4 + Math.random() * 2.2,
        vx: (Math.random() - .5) * .35, vy: mode === 4 ? -(.25 + Math.random() * .55) : (Math.random() - .5) * .35, p: Math.random() * 6.28 });
    } else for (let yy = GAP / 2; yy < H + GAP; yy += GAP) for (let xx = GAP / 2; xx < W + GAP; xx += GAP)
      dots.push({ x: xx, y: yy, p: Math.random() * 6.28, s: .6 + Math.random() * .8 });
  }
  function setMode() { mode = pick(5, mode); t0 = performance.now(); build(); }
  function draw(now) {
    const t = (now - t0) / 1000; x.clearRect(0, 0, W, H); x.fillStyle = '#fff';
    for (const d of dots) {
      let px = d.x, py = d.y, r = 2.2, a = .6;
      switch (mode) {
        case 0: { // نبض: موجة تكبير وتصغير تنتشر من المنتصف
          const dist = Math.hypot(d.x - W / 2, d.y - H / 2); const k = Math.sin(t * 2 - dist / 70); r = 1.4 + 1.3 * (k + 1) / 2; a = .45 + .3 * (k + 1) / 2; break; }
        case 1: // سباحة عشوائية
          d.x += d.vx + Math.sin(t + d.p) * .15; d.y += d.vy + Math.cos(t * .8 + d.p) * .15;
          if (d.x < -5) d.x = W + 5; if (d.x > W + 5) d.x = -5; if (d.y < -5) d.y = H + 5; if (d.y > H + 5) d.y = -5;
          px = d.x; py = d.y; r = d.r; a = .55; break;
        case 2: { // نجوم تلمع: كل نقطة تومض في وقتها
          const k = Math.max(0, Math.sin(t * 1.6 * d.s + d.p)); r = 1.2 + 2 * k; a = .3 + .55 * k; break; }
        case 3: // موجة بحر: النقاط تتمايل
          px = d.x + Math.sin(t * 1.4 + d.y / 60) * 6; py = d.y + Math.cos(t * 1.2 + d.x / 80) * 6; r = 2.1; a = .6; break;
        case 4: // فقاعات صاعدة
          d.y += d.vy; d.x += Math.sin(t * 1.5 + d.p) * .3; if (d.y < -6) { d.y = H + 6; d.x = Math.random() * W; }
          px = d.x; py = d.y; r = d.r; a = .5 + .2 * Math.sin(t + d.p); break;
      }
      x.globalAlpha = a; x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;
  }
  let last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    const playing = !document.getElementById('view-game')?.hidden && document.querySelector('#stage .game-area, #stage canvas:not(.fx)');
    if (now - last < (playing ? 66 : 33)) return; // 30 إطار، و15 أثناء اللعب
    last = now; draw(now);
  }

  const change = () => { setGrad(); if (!reduce) setMode(); };
  addEventListener('hashchange', change);
  addEventListener('resize', () => { clearTimeout(size.t); size.t = setTimeout(size, 150); });
  const start = () => { setGrad(); mode = reduce ? 0 : pick(5, -1); size();
    if (reduce) { x.fillStyle = '#fff'; x.globalAlpha = .6; for (const d of dots) { x.beginPath(); x.arc(d.x, d.y, 2, 0, 6.283); x.fill(); } }
    else requestAnimationFrame(loop); };
  document.body ? start() : addEventListener('DOMContentLoaded', start);
})();
