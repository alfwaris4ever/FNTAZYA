/* فنتازيا: زر «للأعلى» أسفل يسار الشاشة، يظهر في أي صفحة طويلة بعد النزول، ويرجع لأعلى الصفحة مباشرة */
(() => {
  if (document.getElementById('toTop')) return;
  const st = document.createElement('style');
  st.textContent = `#toTop{position:fixed;left:16px;bottom:16px;z-index:250;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;width:54px;height:54px;border:0;border-radius:50%;
    background:linear-gradient(135deg,#5b3cff,#ec4899);color:#fff;font:800 11px/1.1 inherit;font-family:inherit;cursor:pointer;box-shadow:0 8px 20px rgba(91,60,255,.4);
    opacity:0;transform:translateY(16px) scale(.8);pointer-events:none;transition:.25s}
  #toTop b{font-size:20px;line-height:1}#toTop.on{opacity:1;transform:none;pointer-events:auto}#toTop:hover{filter:brightness(1.1)}
  #toTop:focus-visible{outline:3px solid #facc15;outline-offset:3px}
  @media print{#toTop{display:none}}`;
  document.head.appendChild(st);
  const b = document.createElement('button');
  b.id = 'toTop'; b.type = 'button'; b.title = 'للأعلى'; b.setAttribute('aria-label', 'الرجوع لأعلى الصفحة');
  b.innerHTML = '<b>↑</b>للأعلى';
  b.onclick = () => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const add = () => document.body.appendChild(b);
  document.body ? add() : addEventListener('DOMContentLoaded', add);
  let raf = 0;
  const upd = () => { raf = 0; const long = document.documentElement.scrollHeight > innerHeight * 1.5; b.classList.toggle('on', long && scrollY > Math.min(400, innerHeight * 0.6)); };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
  addEventListener('resize', upd); setTimeout(upd, 500);
})();
