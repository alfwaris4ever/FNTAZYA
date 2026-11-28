/* فنتازيا: فوتر موحّد لكل صفحات الموقع
   - أبيض بحافة علوية من طبقتين تموّج ناعم متحرك (بلا زوايا ولا مثلثات)، مع توهّج ناعم متحرك.
   - يلتصق دائماً بأسفل الشاشة في الصفحات القصيرة، فلا يبقى فراغ تحته. */
(() => {
  if (document.getElementById('fzFoot')) return;
  const LINKS = [
    ['advertise.html', '📢', 'أعلن معنا'],
    ['advertiser.html', '🔑', 'دخول المعلنين'],
    ['faq.html', '❓', 'الأسئلة الشائعة'],
    ['privacy.html', '🛡️', 'مركز الخصوصية'],
  ];
  const here = location.pathname.split('/').pop() || 'index.html';
  const st = document.createElement('style');
  st.textContent = `
#fzFoot{padding:0!important;margin-inline:0!important;text-align:start;font-weight:400;font-size:16px;background:none;position:relative;margin-top:70px;color:#1d2350;font-family:inherit;isolation:isolate;clear:both}
#fzFoot .ff-edge{position:absolute;left:0;right:0;top:-58px;height:60px;overflow:hidden;pointer-events:none}
#fzFoot .ff-edge svg{position:absolute;bottom:0;left:0;width:200%;height:100%;animation:ffWave 14s linear infinite}
#fzFoot .ff-edge svg.b{opacity:.55;animation-duration:22s;animation-direction:reverse;bottom:6px}
@keyframes ffWave{to{transform:translateX(-50%)}}
#fzFoot .ff-body{position:relative;background:#fff;padding:26px 20px 22px;box-shadow:0 -1px 0 rgba(91,60,255,.04)}
#fzFoot .ff-shard{position:absolute;top:-10px;inset-inline-start:18%;width:220px;height:140px;border-radius:50%;background:radial-gradient(closest-side,rgba(91,60,255,.10),rgba(236,72,153,.05) 60%,transparent);
  filter:blur(8px);animation:ffShard 8s ease-in-out infinite;pointer-events:none;z-index:-1}
@keyframes ffShard{0%,100%{transform:translateX(0);opacity:.7}50%{transform:translateX(-40px);opacity:1}}
/* على الشاشات الصغيرة نمدّ الموجة أكثر حتى تبقى ناعمة ولا تنضغط */
@media(max-width:1023px){#fzFoot .ff-edge svg{width:400%}}
@media(max-width:600px){#fzFoot .ff-edge svg{width:700%}}
#fzFoot .ff-in{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}
#fzFoot .ff-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#5b3cff;font-weight:800;font-size:24px}
#fzFoot .ff-brand img{width:44px;height:44px;border-radius:13px;animation:ffBob 3.2s ease-in-out infinite}
#fzFoot .ff-brand small{display:block;font-size:12px;color:#64748b;font-weight:700;margin-top:-2px}
@keyframes ffBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-4px) rotate(-6deg)}}
#fzFoot nav{display:flex;flex-wrap:wrap;gap:8px}
#fzFoot nav a{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:99px;background:#f5f3ff;color:#1d2350;text-decoration:none;font-weight:800;font-size:14px;transition:.2s}
#fzFoot nav a:hover{background:#5b3cff;color:#fff;transform:translateY(-2px)}
#fzFoot nav a.on{background:#ede9fe;color:#5b3cff;box-shadow:inset 0 0 0 2px #c4b5fd}
#fzFoot .ff-copy{max-width:1200px;margin:16px auto 0;padding-top:14px;border-top:1px dashed #e2e6ff;text-align:center;color:#64748b;font-weight:600;font-size:13px;line-height:1.8}
@media(max-width:700px){#fzFoot .ff-in{flex-direction:column;text-align:center}#fzFoot nav{justify-content:center}#fzFoot nav a{font-size:13px;padding:7px 12px}#fzFoot .ff-shard{inset-inline-start:60%}}
@media(prefers-reduced-motion:reduce){#fzFoot .ff-edge svg,#fzFoot .ff-shard,#fzFoot .ff-brand img{animation:none}}
@media print{#fzFoot{display:none}}`;
  document.head.appendChild(st);
  const wave = (cls, d) => `<svg class="${cls}" viewBox="0 0 2880 60" preserveAspectRatio="none" aria-hidden="true"><path fill="#fff" d="${d}"/></svg>`;
  // طبقتان من موجة ناعمة (منحنيات فقط)، كل منهما تتكرر مرتين لتتحرك بلا انقطاع
  const smooth = (y, amp, step) => { let d = `M0 60 L0 ${y} C${step / 3} ${y - amp} ${(2 * step) / 3} ${y - amp} ${step} ${y}`; let up = false;
    for (let x = 2 * step; x <= 2880; x += step) { d += ` S${x - step / 3} ${up ? y - amp : y + amp} ${x} ${y}`; up = !up; } return d + ' L2880 60 Z'; };
  const pathA = smooth(32, 12, 360);
  const pathB = smooth(36, 16, 720); // الدورة تقسم 1440 حتى تتكرر الحركة بلا قفزة
  const f = document.createElement('footer'); f.id = 'fzFoot'; f.setAttribute('role', 'contentinfo');
  f.innerHTML = `<div class="ff-edge">${wave('b', pathB)}${wave('a', pathA)}</div><div class="ff-body"><span class="ff-shard"></span>
    <div class="ff-in"><a class="ff-brand" href="./"><img src="icon-192.png" alt=""><span>فنتازيا<small>لعبة ومعلومة</small></span></a>
    <nav aria-label="روابط الموقع">${LINKS.map(([h, e, t]) => `<a href="${h}"${here === h ? ' class="on" aria-current="page"' : ''}><span aria-hidden="true">${e}</span>${t}</a>`).join('')}</nav></div>
    <div class="ff-copy">© فنتازيا 2026 · ألعاب آمنة وتعليمية للأطفال · تعمل على الجوال والتابلت والكمبيوتر</div></div>`;
  /* إلصاق الفوتر بأسفل الشاشة إذا كانت الصفحة قصيرة */
  const fit = () => {
    f.style.marginTop = '70px';
    const gap = innerHeight - (f.getBoundingClientRect().bottom + scrollY);
    if (gap > 0) f.style.marginTop = 70 + gap + 'px';
  };
  const mount = () => {
    document.querySelectorAll('body > footer:not(#fzFoot), p.footer').forEach((n) => n.remove()); // الفوتر القديم
    document.body.appendChild(f); fit();
    let t; const later = () => { clearTimeout(t); t = setTimeout(fit, 60); };
    addEventListener('resize', later); addEventListener('hashchange', () => setTimeout(fit, 120));
    if ('ResizeObserver' in window) new ResizeObserver(later).observe(document.body);
  };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', mount) : mount();
})();
