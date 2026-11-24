/* لوحة الإدارة: تبويبا «الزيارات» و«الإعلانات» (يعتمد على app وtoken وesc وloginForm من admin.html) */
const ADM_CATS = { edu: 'تعليمية', brain: 'الذكاء', memory: 'الذاكرة', focus: 'التركيز', speed: 'السرعة', logic: 'المنطق', action: 'حركة وسرعة', classic: 'كلاسيكية', cars: 'سيارات', io: 'io', two: 'لاعبَين', puzzle: 'ألغاز', dress: 'تلبيس وتجميل' };
const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const ctr = (i, c) => (i ? ((c / i) * 100).toFixed(2) + '%' : '—');
async function admApi(a, body = {}) {
  const r = await fetch('api/index.php?a=' + a, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({ ok: false, error: 'الخادم لا يستجيب' }));
  if (!j.ok && (r.status === 401 || r.status === 403)) { loginForm('ادخل بحساب الإدارة'); throw new Error('auth'); }
  if (!j.ok) throw new Error(j.error || 'خطأ');
  return j;
}
function tabsBar(on) {
  return `<nav class="tabs">${[['', '👥 الأعضاء'], ['#traffic', '📈 الزيارات'], ['#ads', '📢 الإعلانات']].map(([h, t]) => `<a href="${h || '#'}" class="${on === h ? 'on' : ''}">${t}</a>`).join('')}</nav>`;
}
function barTable(title, rows, label = (v) => esc(v)) {
  const max = Math.max(1, ...rows.map((r) => +r.n));
  return `<div><h2>${title}</h2><table><tr><th></th><th>العدد</th><th></th></tr>${rows.map((r) => `<tr><td>${label(r.v)}</td><td>${fmt(r.n)}</td><td style="width:40%"><div class="bar" style="width:${(r.n / max) * 100}%"></div></td></tr>`).join('') || '<tr><td colspan=3>لا بيانات بعد</td></tr>'}</table></div>`;
}
function lineChart(daily) {
  if (!daily.length) return '<div class="msg">لا توجد زيارات مسجّلة بعد. تبدأ الأرقام بالظهور بعد أول زيارة.</div>';
  const W = 1000, H = 220, P = 30, max = Math.max(1, ...daily.map((d) => +d.views || 0));
  const x = (i) => P + (i * (W - 2 * P)) / Math.max(1, daily.length - 1), y = (v) => H - P - ((+v || 0) / max) * (H - 2 * P);
  const path = (k) => daily.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join('');
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:220px">
    <path d="${path('views')}" fill="none" stroke="#5b3cff" stroke-width="3"/><path d="${path('uv')}" fill="none" stroke="#ec4899" stroke-width="3"/>
    ${daily.map((d, i) => `<circle cx="${x(i)}" cy="${y(d.views)}" r="4" fill="#5b3cff"><title>${d.day}: ${d.views} مشاهدة، ${d.uv || 0} زائر</title></circle>`).join('')}
    <text x="${P}" y="18" font-size="14" fill="#64748b">${fmt(max)}</text></svg>
    <div class="legend"><span style="--c:#5b3cff">مشاهدات الصفحات</span><span style="--c:#ec4899">زوار فريدون</span><span style="color:#64748b">${daily[0].day} ← ${daily[daily.length - 1].day}</span></div></div>`;
}
const flag = (cc) => (/^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0))) + ' ' + cc : 'غير معروف');
async function loadTraffic(days = 30) {
  app.innerHTML = tabsBar('#traffic') + '<div class="msg">جاري التحميل…</div>';
  let j; try { j = await admApi('adm_traffic', { days }); } catch (e) { if (e.message !== 'auth') app.innerHTML = tabsBar('#traffic') + `<div class="msg">${esc(e.message)}</div>`; return; }
  const sum = (k) => j.daily.reduce((s, d) => s + (+d[k] || 0), 0), today = j.daily[j.daily.length - 1] || {};
  const gname = (id) => { const g = (window.ADM_GAMES || {})[id]; return esc(g || id); };
  app.innerHTML = tabsBar('#traffic') + `
  <div class="toolbar">الفترة: ${[7, 30, 90].map((d) => `<button class="sm${d === j.days ? ' on' : ''}" data-days="${d}">${d} يوماً</button>`).join('')}</div>
  <div class="cards"><div class="card"><b>${fmt(sum('uv'))}</b><span>زائر (مجموع الأيام)</span></div><div class="card"><b>${fmt(sum('views'))}</b><span>مشاهدة صفحة</span></div>
   <div class="card"><b>${fmt(today.uv)}</b><span>زوار اليوم</span></div><div class="card"><b>${sum('uv') ? (sum('views') / sum('uv')).toFixed(1) : '—'}</b><span>صفحة لكل زائر</span></div></div>
  ${lineChart(j.daily)}
  <div class="cols" style="margin-top:14px">${barTable('🎮 أكثر الألعاب زيارة', j.games, gname)}${barTable('🌍 الدول', j.countries, flag)}</div>
  <div class="cols" style="margin-top:14px">${barTable('📱 الأجهزة', j.devices)}${barTable('🔗 مصادر الزيارات', j.refs)}</div>
  <p class="note">🔒 الإحصاءات بلا كوكيز وبلا أي بيانات شخصية: الزائر يُعرَف ببصمة يومية مشفّرة تُحذف بعد يومين، ولا يُحفظ عنوان IP. الدولة تُستنتج من لغة الجهاز عند عدم توفرها من الخادم.</p>`;
  app.querySelectorAll('[data-days]').forEach((b) => (b.onclick = () => loadTraffic(+b.dataset.days)));
}

let ADM_ADS = null;
async function loadAds() {
  app.innerHTML = tabsBar('#ads') + '<div class="msg">جاري التحميل…</div>';
  try { ADM_ADS = await admApi('adm_ads'); } catch (e) { if (e.message !== 'auth') app.innerHTML = tabsBar('#ads') + `<div class="msg">${esc(e.message)}</div>`; return; }
  const j = ADM_ADS, live = j.campaigns.filter((c) => c.live).length;
  const ti = j.campaigns.reduce((s, c) => s + c.impr, 0), tc = j.campaigns.reduce((s, c) => s + c.clicks, 0);
  const slotName = Object.fromEntries(j.slots.map((s) => [s.slot, s.t]));
  app.innerHTML = tabsBar('#ads') + `
  <div class="cards"><div class="card"><b>${live}</b><span>حملة تعمل الآن</span></div><div class="card"><b>${j.campaigns.length}</b><span>كل الحملات</span></div>
   <div class="card"><b>${fmt(ti)}</b><span>مشاهدة فعلية</span></div><div class="card"><b>${fmt(tc)}</b><span>نقرة</span></div><div class="card"><b>${ctr(ti, tc)}</b><span>نسبة النقر CTR</span></div></div>
  <h2>🎯 حملات الرعاة المباشرين <button id="newC">➕ حملة جديدة</button></h2>
  <table><tr><th>الحملة</th><th>المعلن</th><th>المساحات</th><th>الفترة</th><th>الحالة</th><th>مشاهدات</th><th>نقرات</th><th>CTR</th><th>تحكم</th></tr>
  ${j.campaigns.map((c) => `<tr><td>${c.kind === 'image' && c.img ? `<img src="${esc(c.img)}" class="thumb" alt="">` : '🧩'} <b>${esc(c.name)}</b>${c.kind === 'image' ? `<div class="sub">${Object.entries(crOf(c)).map(([s, v]) => Object.keys(v).map((k) => ({ d: '💻', t: '📱', m: '📲' }[k])).join('')).join(' · ')}</div>` : ''}</td><td>${esc(c.advertiser)}</td>
    <td>${c.slots.split(',').map((s) => `<span class="chip">${esc(slotName[s] || s)}</span>`).join(' ')}${c.cats ? `<div class="sub">${c.cats.split(',').map((x) => ADM_CATS[x] || x).join('، ')}</div>` : ''}</td>
    <td class="sub">${c.start || 'فوراً'} ← ${c.end || 'مفتوحة'}${+c.max_impr ? `<br>حد ${fmt(c.max_impr)} مشاهدة` : ''}</td>
    <td>${c.status === 'paused' ? '⏸️ موقوفة' : c.live ? '🟢 تعمل' : '⚪ خارج الفترة/مكتملة'}</td><td>${fmt(c.impr)}</td><td>${fmt(c.clicks)}</td><td>${ctr(c.impr, c.clicks)}</td>
    <td style="white-space:nowrap"><button class="sm" data-edit="${c.id}" title="تعديل">✏️</button><button class="sm" data-toggle="${c.id}" title="${c.status === 'paused' ? 'تشغيل' : 'إيقاف'}">${c.status === 'paused' ? '▶️' : '⏸️'}</button><button class="sm" data-rep="${esc(c.report_token)}" title="نسخ رابط تقرير المعلن">📊</button><button class="sm del" data-del="${c.id}" title="حذف">🗑️</button></td></tr>`).join('') || '<tr><td colspan=9>لا توجد حملات بعد. أضف أول راعٍ من «حملة جديدة».</td></tr>'}</table>
  <p class="note">📊 زر التقرير ينسخ رابطاً خاصاً ترسله للمعلن ليتابع مشاهدات ونقرات حملته يومياً بدون حساب. الحملة تظهر بدل «أعلن هنا» أو الشبكة في المساحات التي تختارها.</p>

  <h2 style="margin-top:22px">🧱 المساحات الإعلانية</h2>
  <table><tr><th>المساحة</th><th>المقاس</th><th>عند عدم وجود حملة مباشرة</th><th>مشاهدات</th><th>نقرات</th><th></th></tr>
  ${j.slots.map((s) => `<tr><td><b>${esc(s.t)}</b></td><td dir="ltr" class="sub">${esc(s.size)}</td><td>${{ house: '📢 «أعلن هنا»', html: '🌐 كود شبكة إعلانية', off: '🚫 مخفية' }[s.mode]}</td><td>${fmt(s.i)}</td><td>${fmt(s.c)}</td><td><button class="sm" data-slot="${s.slot}">⚙️ إعداد</button></td></tr>`).join('')}</table>

  <h2 style="margin-top:22px">📄 ملف ads.txt</h2>
  <p class="note">تطلبه شبكات الإعلانات للتحقق من ملكية الموقع. الصق السطر الذي تعطيك إياه الشبكة واحفظ، وسيظهر على <a href="/ads.txt" target="_blank">fntazya.com/ads.txt</a></p>
  <textarea id="adstxt" dir="ltr" rows="4" placeholder="مثال: superawesome.tv, 12345, DIRECT">${esc(j.adstxt)}</textarea><button id="saveTxt" style="margin-top:6px">💾 حفظ ads.txt</button>`;
  app.querySelector('#newC').onclick = () => campaignForm();
  app.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => campaignForm(j.campaigns.find((c) => c.id == b.dataset.edit))));
  app.querySelectorAll('[data-toggle]').forEach((b) => (b.onclick = async () => { const c = j.campaigns.find((x) => x.id == b.dataset.toggle);
    await admApi('adm_ad_save', { ...c, creatives: crOf(c), slots: c.slots.split(','), cats: c.cats ? c.cats.split(',') : [], status: c.status === 'paused' ? 'active' : 'paused' }).catch((e) => alert(e.message)); loadAds(); }));
  app.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => { if (!confirm('حذف الحملة وكل إحصاءاتها نهائياً؟')) return; await admApi('adm_ad_del', { id: +b.dataset.del }).catch((e) => alert(e.message)); loadAds(); }));
  app.querySelectorAll('[data-rep]').forEach((b) => (b.onclick = async () => { const u = location.origin + '/ad-report.html?t=' + b.dataset.rep; try { await navigator.clipboard.writeText(u); b.textContent = '✅'; } catch (e) { prompt('رابط تقرير المعلن:', u); } }));
  app.querySelectorAll('[data-slot]').forEach((b) => (b.onclick = () => slotForm(j.slots.find((s) => s.slot === b.dataset.slot))));
  app.querySelector('#saveTxt').onclick = async (e) => { try { await admApi('adm_adstxt', { txt: app.querySelector('#adstxt').value }); e.target.textContent = '✅ تم الحفظ'; } catch (er) { alert(er.message); } };
}
function modal(html) {
  const d = document.createElement('div'); d.className = 'modal'; d.innerHTML = `<div class="modal-card">${html}</div>`;
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.remove(); });
  document.body.appendChild(d); return d;
}
const DEV_NAMES = { d: '💻 كمبيوتر', t: '📱 تابلت', m: '📲 جوال' };
function crOf(c) { // صور الحملة الحالية لكل مساحة وجهاز
  let cr = {}; try { cr = JSON.parse(c.creatives || '{}') || {}; } catch (e) {}
  for (const s of (c.slots || '').split(',').filter(Boolean)) if (!cr[s] && c.img) cr[s] = { d: c.img };
  return cr;
}
function campaignForm(c = {}) {
  const slots = (c.slots || '').split(','), cats = (c.cats || '').split(','), cur = crOf(c), pend = {};
  const d = modal(`<h2>${c.id ? '✏️ تعديل حملة' : '➕ حملة جديدة'}</h2><form id="cf" class="frm">
    <label>اسم الحملة<input name="name" value="${esc(c.name)}" placeholder="مثال: عروض العودة للمدارس"></label>
    <label>المعلن<input name="advertiser" value="${esc(c.advertiser)}" placeholder="اسم الشركة"></label>
    <fieldset class="full"><legend>المساحات</legend>${ADM_ADS.slots.map((s) => `<label class="ck"><input type="checkbox" name="slots" value="${s.slot}"${slots.includes(s.slot) ? ' checked' : ''}> ${esc(s.t)}</label>`).join('')}</fieldset>
    <fieldset class="full"><legend>استهداف التصنيفات (اتركها فارغة = كل الموقع)</legend>${Object.entries(ADM_CATS).map(([k, v]) => `<label class="ck"><input type="checkbox" name="cats" value="${k}"${cats.includes(k) ? ' checked' : ''}> ${v}</label>`).join('')}</fieldset>
    <label>نوع الإعلان<select name="kind"><option value="image"${c.kind !== 'html' ? ' selected' : ''}>صور بانر + رابط</option><option value="html"${c.kind === 'html' ? ' selected' : ''}>كود HTML من المعلن</option></select></label>
    <label>الأولوية (1-10)<input name="weight" type="number" min="1" max="10" value="${c.weight || 1}"></label>
    <div class="full k-image" id="crs"></div>
    <label class="full k-image">رابط المعلن (يفتح بعد بوابة الأهل)<input name="link" dir="ltr" value="${esc(c.link)}" placeholder="https://"></label>
    <label class="full k-image">نص بديل للصور<input name="alt" value="${esc(c.alt)}"></label>
    <label class="full k-html">كود الإعلان (يعمل داخل إطار معزول)<textarea name="html" dir="ltr" rows="5">${esc(c.html)}</textarea></label>
    <label>تاريخ البداية<input type="date" name="start" value="${esc(c.start)}"></label><label>تاريخ النهاية<input type="date" name="end" value="${esc(c.end)}"></label>
    <label>حد المشاهدات (0 = بلا حد)<input type="number" name="max_impr" min="0" value="${c.max_impr || 0}"></label>
    <label>الحالة<select name="status"><option value="active">🟢 تعمل</option><option value="paused"${c.status === 'paused' ? ' selected' : ''}>⏸️ موقوفة</option></select></label>
    <div class="full" id="cerr" style="color:#dc2626;font-weight:700"></div>
    <div class="full"><button type="submit">💾 حفظ الحملة</button> <button type="button" class="sm" data-close>إلغاء</button></div></form>`);
  const f = d.querySelector('#cf'), crs = d.querySelector('#crs');
  const val = (s, dv) => pend[s]?.[dv] ?? cur[s]?.[dv] ?? '';
  const check = (tile, w, h) => { // يقارن مقاس الصورة بالمقاس المطلوب
    const img = tile.querySelector('img'), info = tile.querySelector('.cr-info'); if (!img) { info.textContent = 'لا توجد صورة'; info.className = 'cr-info'; return; }
    const go = () => { const rw = img.naturalWidth, rh = img.naturalHeight; if (!rw) return;
      const ok = Math.abs(rw / rh - w / h) / (w / h) < 0.08, big = rw >= w;
      info.textContent = `${rw}×${rh} · ${ok ? (big ? '✅ مقاس مناسب' : '⚠️ النسبة صحيحة لكن الدقة منخفضة') : '⚠️ النسبة لا تطابق ' + w + '×' + h + ' وستظهر بشكل مختلف'}`;
      info.className = 'cr-info ' + (ok && big ? 'ok' : 'warn'); };
    img.complete ? go() : (img.onload = go);
  };
  const drawCr = () => {
    const sel = [...f.querySelectorAll('[name=slots]:checked')].map((x) => x.value);
    crs.innerHTML = sel.length ? '<h3 style="margin:4px 0">🖼️ صور الإعلان لكل مساحة ولكل جهاز</h3><p class="note" style="margin:0 0 8px">ارفع صورة بالمقاس المكتوب لكل جهاز. إذا لم ترفع صورة التابلت أو الجوال تُستخدم صورة الكمبيوتر (وقد تظهر صغيرة).</p>' + sel.map((s) => { const S = ADM_ADS.slots.find((x) => x.slot === s);
      return `<div class="cr-slot"><b>${esc(S.t)}</b><div class="cr-row">${Object.entries(S.dev).map(([dv, [w, h]]) => { const v = val(s, dv);
        return `<div class="cr-tile" data-s="${s}" data-d="${dv}" data-w="${w}" data-h="${h}"><div class="cr-h">${Object.keys(S.dev).length === 1 ? '🖥️📱 كل الأجهزة' : DEV_NAMES[dv]} <span dir="ltr">${w}×${h}</span></div>
          <div class="cr-prev" style="aspect-ratio:${w}/${h}">${v ? `<img src="${esc(v)}" alt="">` : '<span>اختر صورة</span>'}</div><div class="cr-info"></div>
          <div class="cr-act"><label class="sm-btn">📁 رفع<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden></label>${v ? '<button type="button" class="sm del" data-rm>🗑️</button>' : ''}</div></div>`; }).join('')}</div></div>`; }).join('') : '<p class="note">اختر المساحات أولاً لتظهر خانات الصور.</p>';
    crs.querySelectorAll('.cr-tile').forEach((t) => { const { s, d: dv, w, h } = t.dataset; check(t, +w, +h);
      t.querySelector('input[type=file]').onchange = (e) => { const fl = e.target.files[0]; if (!fl) return; if (fl.size > 1500000) { d.querySelector('#cerr').textContent = 'الحد الأقصى للصورة 1.5 ميغا'; return; }
        const r = new FileReader(); r.onload = () => { (pend[s] ||= {})[dv] = r.result; drawCr(); }; r.readAsDataURL(fl); };
      t.querySelector('[data-rm]')?.addEventListener('click', () => { (pend[s] ||= {})[dv] = ''; drawCr(); }); });
  };
  f.querySelectorAll('[name=slots]').forEach((x) => (x.onchange = drawCr)); drawCr();
  const sync = () => { const h = f.kind.value === 'html'; d.querySelectorAll('.k-image').forEach((x) => (x.hidden = h)); d.querySelectorAll('.k-html').forEach((x) => (x.hidden = !h)); };
  f.kind.onchange = sync; sync();
  f.onsubmit = async (e) => { e.preventDefault(); const fd = new FormData(f), sel = fd.getAll('slots'), creatives = {};
    for (const s of sel) { const S = ADM_ADS.slots.find((x) => x.slot === s); creatives[s] = {}; for (const dv of Object.keys(S.dev)) creatives[s][dv] = val(s, dv); }
    const body = { id: c.id || 0, name: fd.get('name'), advertiser: fd.get('advertiser'), slots: sel, cats: fd.getAll('cats'), kind: fd.get('kind'), weight: +fd.get('weight'),
      creatives, link: fd.get('link'), alt: fd.get('alt'), html: fd.get('html'), start: fd.get('start'), end: fd.get('end'), max_impr: +fd.get('max_impr'), status: fd.get('status') };
    const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = '⏳ جاري الحفظ…';
    try { await admApi('adm_ad_save', body); d.remove(); loadAds(); } catch (er) { d.querySelector('#cerr').textContent = er.message; btn.disabled = false; btn.textContent = '💾 حفظ الحملة'; } };
}
function slotForm(s) {
  const d = modal(`<h2>⚙️ ${esc(s.t)}</h2><p class="note">المقاس المقترح: <span dir="ltr">${esc(s.size)}</span>. الحملات المباشرة لها الأولوية دائماً، وهذا الإعداد يعمل عند عدم وجودها.</p>
    <form id="sf" class="frm"><label class="full">ماذا يظهر؟<select name="mode"><option value="house">📢 إعلان «أعلن هنا» يدعو المعلنين</option><option value="html">🌐 كود شبكة إعلانية (SuperAwesome، AdinPlay…)</option><option value="off">🚫 إخفاء المساحة</option></select></label>
    <label class="full k-net">كود الشبكة (يُلصق كما أرسلته الشبكة، ويعمل داخل إطار معزول لا يستطيع تحويل صفحة الطفل)<textarea name="html" dir="ltr" rows="7">${esc(s.html)}</textarea></label>
    <div class="full"><button type="submit">💾 حفظ</button> <button type="button" class="sm" data-close>إلغاء</button></div></form>`);
  const f = d.querySelector('#sf'); f.mode.value = s.mode; const sync = () => (d.querySelector('.k-net').hidden = f.mode.value !== 'html'); f.mode.onchange = sync; sync();
  f.onsubmit = async (e) => { e.preventDefault(); try { await admApi('adm_slot_save', { slot: s.slot, mode: f.mode.value, html: f.html.value }); d.remove(); loadAds(); } catch (er) { alert(er.message); } };
}
