/* فنتازيا: نظام الإعلانات + إحصاءات الزيارات.
   كل شيء يُدار من لوحة الإدارة (admin.html ← تبويب «الإعلانات»)، ولا حاجة لتعديل هذا الملف:
   - حملات الرعاة المباشرين (صورة + رابط، أو كود HTML) مع جدولة واستهداف بالتصنيف وحد للمشاهدات.
   - كل مساحة يمكن ربطها بكود شبكة إعلانية (يُعرض داخل iframe معزول) أو «أعلن هنا» أو إخفاؤها.
   قواعد الأمان للأطفال:
   - لا إعلانات أثناء اللعب، وكل إعلان عليه كلمة «إعلان».
   - الخروج من الموقع عبر إعلان مباشر يمر ببوابة الأهل (سؤال حسابي بسيط).
   - كود الشبكات يعمل داخل iframe معزول (sandbox) لا يستطيع تحويل صفحة الطفل ولا قراءة بيانات الموقع.
   - المشاهدة تُحسب فقط عند ظهور 50% من الإعلان لمدة ثانية (معيار IAB).
   - الإحصاءات بلا كوكيز وبلا أي بيانات شخصية. */
(() => {
  const API = 'api/index.php';
  const SIZES = { home_top: 'wide', game_below: 'wide', game_side: 'box', between: 'mini' };
  const BETWEEN_EVERY = 3;
  const HOUSE = [
    { e: '📢', t: 'أعلن هنا', s: 'أوصل علامتك لآلاف العائلات العربية وأطفالهم' },
    { e: '🧸', t: 'مساحة لعلامتك التجارية', s: 'إعلانات آمنة ومراجعة يدوياً، مناسبة للأطفال' },
    { e: '🎮', t: 'لعبة برعايتك', s: 'نصمم لعبة تحمل اسم منتجك ويلعبها الأطفال' },
  ];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const local = location.protocol === 'blob:' || location.protocol === 'file:' || /^(localhost|127\.)/.test(location.hostname);
  const beacon = (a, data) => { if (local) return; try { const u = `${API}?a=${a}`, b = JSON.stringify(data); if (!(navigator.sendBeacon && navigator.sendBeacon(u, new Blob([b], { type: 'text/plain' })))) fetch(u, { method: 'POST', body: b, keepalive: true }).catch(() => {}); } catch (e) {} };

  /* ---------- إحصاءات الزيارات ---------- */
  let lastHit = '', firstHit = true;
  function hit(p) {
    if (p === lastHit) return; lastHit = p;
    let r = ''; if (firstHit) { try { r = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {} firstHit = false; }
    beacon('hit', { p, w: innerWidth, l: navigator.language || '', r });
  }

  /* ---------- جلب الإعلانات ---------- */
  let pageKeys = []; // المعلنون الظاهرون في الصفحة الحالية (لا يتكرر المعلن في الصفحة)
  async function fetchSlots(slots, cat) {
    if (!local) try {
      const r = await fetch(`${API}?a=ads&s=${slots.join(',')}&c=${encodeURIComponent(cat || '')}&x=${pageKeys.join(',')}&w=${innerWidth}`, { cache: 'no-store' });
      const j = await r.json(); if (j.ok) { for (const s of Object.values(j.slots)) if (s.k) pageKeys.push(s.k); return j.slots; }
    } catch (e) {}
    return Object.fromEntries(slots.map((s) => [s, { type: s === 'between' ? 'off' : 'house' }])); // الخادم لا يستجيب: «أعلن هنا»
  }

  /* ---------- قياس المشاهدة الفعلية ---------- */
  let queue = [], flushT;
  const flush = () => { clearTimeout(flushT); if (queue.length) { beacon('adev', { ev: queue }); queue = []; } };
  addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => {
    for (const en of ents) {
      const el = en.target;
      if (en.isIntersecting && en.intersectionRatio >= 0.5) {
        if (!el._vt) el._vt = setTimeout(() => { io.unobserve(el); if (!document.hidden && el.isConnected) { queue.push({ c: +el.dataset.cid, s: el.dataset.slot, d: el.dataset.dev || '' }); clearTimeout(flushT); flushT = setTimeout(flush, 3000); } }, 1000);
      } else { clearTimeout(el._vt); el._vt = 0; }
    }
  }, { threshold: [0, 0.5] }) : null;

  /* ---------- بوابة الأهل ---------- */
  function parentGate(url) {
    const a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 6), ans = a * b;
    const opts = [...new Set([ans, ans + a, ans - b, ans + 2])].sort(() => Math.random() - 0.5);
    const d = document.createElement('div'); d.className = 'pgate'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = `<div class="pgate-card"><div class="pgate-e">👨‍👩‍👧</div><h3>هذا الإعلان يفتح موقعاً آخر</h3><p>اطلب من أحد والديك اختيار الإجابة الصحيحة:</p><div class="pgate-q">${a} × ${b} = ؟</div>
      <div class="pgate-o">${opts.map((o) => `<button type="button" data-v="${o}">${o}</button>`).join('')}</div><button type="button" class="pgate-x">إلغاء</button></div>`;
    const close = () => { d.remove(); document.removeEventListener('keydown', key); };
    const key = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key);
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('.pgate-x')) return close();
      const btn = e.target.closest('[data-v]'); if (!btn) return;
      if (+btn.dataset.v === ans) { close(); window.open(url, '_blank', 'noopener'); }
      else { btn.classList.add('wrong'); d.querySelector('.pgate-q').textContent = 'إجابة غير صحيحة'; d.querySelectorAll('[data-v]').forEach((x) => (x.disabled = true)); setTimeout(close, 1000); }
    });
    document.body.appendChild(d); d.querySelector('[data-v]').focus();
  }

  /* ---------- رسم الإعلان ---------- */
  function frameFor(html, size) {
    const f = document.createElement('iframe');
    f.className = 'fz-sp-frame'; f.title = 'إعلان'; f.loading = 'lazy'; f.setAttribute('scrolling', 'no');
    f.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
    f.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;min-height:100%}img{max-width:100%;height:auto}</style></head><body>${html}</body></html>`;
    f.style.height = size === 'box' ? '250px' : size === 'mini' ? '100px' : '90px';
    return f;
  }
  function build(slot, ad) {
    if (!ad || ad.type === 'off') return null;
    const size = SIZES[slot], el = document.createElement('div');
    el.className = `fz-sp fz-sp-${size}`; el.dataset.slot = slot;
    el.innerHTML = '<span class="fz-sp-tag">إعلان</span>';
    if (ad.type === 'image' && ad.img) {
      el.dataset.cid = ad.cid;
      // صورة لكل جهاز: جوال (600px فأقل)، تابلت (حتى 1023px)، كمبيوتر
      el.classList.add('has-img'); if (!ad.img_t) el.classList.add('no-t'); if (!ad.img_m) el.classList.add('no-m');
      const src = (u, mq) => (u ? `<source media="${mq}" srcset="${esc(u)}">` : '');
      el.insertAdjacentHTML('beforeend', `<a class="fz-sp-img" href="${esc(ad.click || '#')}" rel="sponsored noopener nofollow"><picture>${src(ad.img_m, '(max-width:600px)')}${src(ad.img_t, '(max-width:1023px)')}<img src="${esc(ad.img)}" alt="${esc(ad.alt || 'إعلان')}" decoding="async"></picture></a>`);
      // أي صورة تظهر فعلاً على هذا الجهاز (لإحصاء كل صورة على حدة)
      el.dataset.dev = ad.img_m && innerWidth <= 600 ? 'm' : ad.img_t && innerWidth <= 1023 ? 't' : 'd';
      el.querySelector('.fz-sp-img').prepend(el.querySelector('.fz-sp-tag'));
      el.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); if (!ad.click) return; let u = ad.click + '&d=' + el.dataset.dev; try { u = new URL(ad.click, location.href).href; } catch (er) {} parentGate(u); });
      io?.observe(el);
    } else if ((ad.type === 'html' || ad.type === 'network') && ad.html) {
      if (ad.cid) { el.dataset.cid = ad.cid; io?.observe(el); }
      el.classList.add('fz-sp-net'); el.appendChild(frameFor(ad.html, size));
    } else {
      const h = HOUSE[Math.floor(Math.random() * HOUSE.length)];
      el.insertAdjacentHTML('beforeend', `<a class="fz-sp-house" href="advertise.html"><span class="fz-sp-e">${h.e}</span><span class="fz-sp-t"><b>${h.t}</b><small>${h.s}</small></span><span class="fz-sp-cta">اعرف أكثر ←</span></a>`);
    }
    return el;
  }
  function place(slot, ad, where, pos = 'afterend') {
    document.querySelectorAll(`.fz-sp[data-slot="${slot}"]`).forEach((n) => n.remove());
    const el = where && build(slot, ad); if (el) where.insertAdjacentElement(pos, el);
  }

  /* ---------- ربط الصفحات ---------- */
  let seq = 0;
  async function onHome(cat) {
    hit(cat ? 'cat:' + cat : 'home'); pageKeys = [];
    const my = ++seq, s = await fetchSlots(['home_top'], cat); if (my !== seq) return;
    place('home_top', s.home_top, document.querySelector('#grid'), 'afterbegin');
  }
  async function onGame(g) {
    hit('game:' + g.id); pageKeys = [];
    const my = ++seq, s = await fetchSlots(['game_below', 'game_side'], g.cat); if (my !== seq) return;
    place('game_below', s.game_below, document.querySelector('#stageWrap'));
    place('game_side', s.game_side, document.querySelector('.related h3'), 'beforebegin');
  }
  let results = +sessionStorage.getItem('fz:results') || 0;
  async function onResult(ov, g) {
    sessionStorage.setItem('fz:results', ++results);
    if (results % BETWEEN_EVERY) return;
    if (!ov || !ov.querySelector) { const all = document.querySelectorAll('#stage .result-ov'); ov = all[all.length - 1]; }
    if (!ov) return;
    const s = await fetchSlots(['between'], g?.cat);
    if (!ov.isConnected) return;
    const btns = ov.querySelector('.ov-btns'); if (btns) place('between', s.between, btns);
  }

  const sh = showHome; window.showHome = function (cat) { const r = sh.apply(this, arguments); try { onHome(cat); } catch (e) {} return r; };
  const og = openGame; window.openGame = function (g) { const r = og.apply(this, arguments); try { onGame(g); } catch (e) {} return r; };
  const sd = stageDone; window.stageDone = function (g) { const r = sd.apply(this, arguments); try { onResult(r, g); } catch (e) {} return r; };
  const go = gameOver; window.gameOver = function (g) { const r = go.apply(this, arguments); try { onResult(r, g); } catch (e) {} return r; };
  try { route(); } catch (e) {}
})();
