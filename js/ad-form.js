/* فنتازيا: أدوات مشتركة لنموذج الحملة الإعلانية (لوحة الإدارة + بوابة المعلنين)
   - قائمة المساحات تحت بعض، وبجانب كل مساحة زر «مشاهدة موقع الإعلان» يعرض لقطة للموقع على الجوال والتابلت والكمبيوتر
   - خانات رفع الصور لكل مساحة ولكل جهاز مع فحص المقاس */
const AdForm = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DEV = { m: '📲 جوال', t: '📱 تابلت', d: '💻 كمبيوتر' };
  const money = (v, cur) => `${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${cur || 'ر.س'}`;
  const fmt = (n) => Number(n || 0).toLocaleString('en-US');

  function css() {
    if (document.getElementById('adform-css')) return;
    const s = document.createElement('style'); s.id = 'adform-css';
    s.textContent = `
.af-slots{display:flex;flex-direction:column;gap:8px}
.af-slot{display:flex;align-items:center;gap:12px;padding:10px 12px;border:2px solid #e2e6ff;border-radius:14px;background:#fff;transition:.15s}
.af-slots label.af-l{flex:1;display:flex!important;flex-direction:row!important;align-items:center;gap:12px;cursor:pointer;margin:0;min-width:0}
.af-cr-act label.af-up{display:inline-block!important;flex-direction:row!important}
.af-slot:hover{border-color:#c7d2fe}.af-slot.on{border-color:#5b3cff;background:#f5f3ff}
.af-slot input{width:20px;height:20px;accent-color:#5b3cff;flex:none;margin:0}
.af-slot .af-m{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}.af-slot .af-m b{font-size:15px}.af-slot .af-m small{color:#64748b;font-size:12px}
.af-slot .af-p{font-size:12px;color:#5b3cff;font-weight:700;white-space:nowrap;text-align:end}
.af-eye{flex:none;font:inherit;font-weight:700;font-size:13px;border:0;border-radius:10px;padding:7px 12px;background:#eef1ff;color:#1d2350;cursor:pointer;white-space:nowrap}.af-eye:hover{background:#dfe4ff}
@media(max-width:560px){.af-slot{flex-wrap:wrap}.af-slots label.af-l{flex-wrap:wrap}.af-slot .af-p{width:100%;text-align:start;padding-inline-start:32px}.af-eye{width:100%}}
.af-pv{position:fixed;inset:0;z-index:100;background:rgba(15,23,42,.65);display:flex;align-items:center;justify-content:center;padding:16px}
.af-pv-c{background:#fff;border-radius:20px;padding:16px;width:min(980px,100%);max-height:94vh;display:flex;flex-direction:column;gap:10px}
.af-pv-h{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.af-pv-h h3{margin:0;flex:1;font-size:18px}
.af-tabs{display:flex;gap:6px}.af-tabs button{font:inherit;font-weight:700;border:0;border-radius:99px;padding:7px 14px;background:#eef1ff;color:#1d2350;cursor:pointer}.af-tabs button.on{background:#5b3cff;color:#fff}
.af-pv-x{font:inherit;border:0;background:#f1f5f9;border-radius:99px;width:36px;height:36px;font-size:18px;cursor:pointer}
.af-pv-img{flex:1;overflow:auto;background:#e2e8f0;border-radius:14px;display:flex;justify-content:center;align-items:flex-start;padding:12px;min-height:200px}
.af-pv-img img{max-width:100%;max-height:74vh;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);background:#fff}
.af-pv-n{color:#64748b;font-size:13px;margin:0}
.af-cr-slot{border:2px solid #eef1ff;border-radius:14px;padding:10px;margin-bottom:10px}.af-cr-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:8px}
.af-cr-tile{background:#f8fafc;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:6px}.af-cr-h{font-weight:700;font-size:13px;display:flex;justify-content:space-between;gap:6px}
.af-cr-prev{width:100%;max-height:150px;background:repeating-conic-gradient(#e2e8f0 0 25%,#fff 0 50%) 0 0/16px 16px;border:2px dashed #cbd5e1;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.af-cr-prev img{width:100%;height:100%;object-fit:contain}.af-cr-prev span{color:#94a3b8;font-size:12px;font-weight:700}
.af-cr-info{font-size:12px;color:#64748b;min-height:1.2em}.af-cr-info.ok{color:#16a34a}.af-cr-info.warn{color:#d97706}.af-cr-act{display:flex;gap:6px;align-items:center}
.af-up{background:#5b3cff;color:#fff;border-radius:10px;padding:5px 12px;font-weight:700;font-size:13px;cursor:pointer;display:inline-block}
.af-rm{font:inherit;border:0;background:#fee2e2;border-radius:10px;padding:5px 10px;cursor:pointer}
.af-q{background:#f5f3ff;border:2px solid #ddd6fe;border-radius:16px;padding:14px}.af-q table{width:100%;border-collapse:collapse;font-size:14px;background:transparent;box-shadow:none}
.af-q td{padding:5px 4px;border-bottom:1px dashed #ddd6fe}.af-q td:last-child{text-align:end;white-space:nowrap;font-weight:700}
.af-q .af-tot{font-size:20px;color:#5b3cff}.af-q .af-w{color:#b45309;font-size:13px;margin:6px 0 0}.af-q .af-e{color:#dc2626;font-weight:700}`;
    document.head.appendChild(s);
  }

  /* معاينة موقع الإعلان */
  function preview(slot, title, dev) {
    css();
    const d = document.createElement('div'); d.className = 'af-pv';
    d.innerHTML = `<div class="af-pv-c"><div class="af-pv-h"><h3>📍 ${esc(title)}</h3><div class="af-tabs">${Object.entries(DEV).map(([k, v]) => `<button type="button" data-d="${k}">${v}</button>`).join('')}</div><button type="button" class="af-pv-x" aria-label="إغلاق">✕</button></div>
      <div class="af-pv-img"><img alt=""></div><p class="af-pv-n">المكان المحدد بالإطار الأصفر هو موقع إعلانك. الصورة توضيحية من الموقع الحقيقي.</p></div>`;
    const img = d.querySelector('img');
    const show = (k) => { d.querySelectorAll('[data-d]').forEach((b) => b.classList.toggle('on', b.dataset.d === k)); img.src = `img/ad-spots/${slot}-${k}.jpg?v=3`; };
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('.af-pv-x')) d.remove(); const b = e.target.closest('[data-d]'); if (b) show(b.dataset.d); });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { d.remove(); document.removeEventListener('keydown', k); } });
    show(dev || (innerWidth <= 600 ? 'm' : innerWidth <= 1023 ? 't' : 'd'));
    document.body.appendChild(d);
  }

  /* قائمة المساحات: تحت بعض، مع السعر وزر المعاينة */
  function slotPicker(box, slots, selected, opt = {}) {
    css();
    const cur = opt.currency || 'ر.س';
    box.innerHTML = `<div class="af-slots">${slots.map((s) => `<div class="af-slot${selected.includes(s.slot) ? ' on' : ''}"><label class="af-l">
      <input type="checkbox" name="slots" value="${s.slot}"${selected.includes(s.slot) ? ' checked' : ''}>
      <span class="af-m"><b>${esc(s.t)}</b><small dir="rtl">${esc(s.size)}</small></span>
      ${opt.showPrice && s.price ? `<span class="af-p">${s.price.cpm_on ? `${money(s.price.cpm, cur)} / 1000 ظهور` : ''}${s.price.cpm_on && s.price.daily_on ? '<br>' : ''}${s.price.daily_on ? `${money(s.price.daily, cur)} / يوم حصري` : ''}</span>` : ''}</label>
      <button type="button" class="af-eye" data-pv="${s.slot}">👁️ مشاهدة موقع الإعلان</button></div>`).join('')}</div>`;
    box.querySelectorAll('[data-pv]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); preview(b.dataset.pv, slots.find((s) => s.slot === b.dataset.pv).t); }));
    box.querySelectorAll('input[name=slots]').forEach((i) => i.addEventListener('change', () => { i.closest('.af-slot').classList.toggle('on', i.checked); opt.onChange?.(); }));
    return () => [...box.querySelectorAll('input[name=slots]:checked')].map((x) => x.value);
  }

  /* خانات صور الإعلان لكل مساحة ولكل جهاز */
  function creatives(box, slots, getSel, cur, onErr) {
    css();
    const pend = {};
    const val = (s, dv) => pend[s]?.[dv] ?? cur[s]?.[dv] ?? '';
    const check = (tile, w, h) => {
      const img = tile.querySelector('img'), info = tile.querySelector('.af-cr-info');
      if (!img) { info.textContent = 'لا توجد صورة'; info.className = 'af-cr-info'; return; }
      const go = () => { const rw = img.naturalWidth, rh = img.naturalHeight; if (!rw) return;
        const ok = Math.abs(rw / rh - w / h) / (w / h) < 0.08, big = rw >= w;
        info.textContent = `${rw}×${rh} · ${ok ? (big ? '✅ مقاس مناسب' : '⚠️ النسبة صحيحة لكن الدقة منخفضة') : `⚠️ المطلوب ${w}×${h}، وستظهر الصورة بشكل مختلف`}`;
        info.className = 'af-cr-info ' + (ok && big ? 'ok' : 'warn'); };
      img.complete ? go() : (img.onload = go);
    };
    const draw = () => {
      const sel = getSel();
      box.innerHTML = sel.length ? '<p class="af-pv-n" style="margin:0 0 8px">ارفع صورة بالمقاس المكتوب لكل جهاز. إن لم ترفع صورة التابلت أو الجوال تُستخدم صورة الكمبيوتر وقد تظهر صغيرة.</p>' + sel.map((s) => { const S = slots.find((x) => x.slot === s);
        return `<div class="af-cr-slot"><b>${esc(S.t)}</b> <button type="button" class="af-eye" data-pv="${s}" style="margin-inline-start:6px;padding:3px 10px">👁️</button><div class="af-cr-row">${Object.entries(S.dev).map(([dv, [w, h]]) => { const v = val(s, dv);
          return `<div class="af-cr-tile" data-s="${s}" data-d="${dv}" data-w="${w}" data-h="${h}"><div class="af-cr-h"><span>${Object.keys(S.dev).length === 1 ? '🖥️📱 كل الأجهزة' : DEV[dv]}</span><span dir="ltr">${w}×${h}</span></div>
            <div class="af-cr-prev" style="aspect-ratio:${w}/${h}">${v ? `<img src="${esc(v)}" alt="">` : '<span>لم تُرفع صورة</span>'}</div><div class="af-cr-info"></div>
            <div class="af-cr-act"><label class="af-up">📁 ${v ? 'تغيير' : 'رفع صورة'}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden></label>${v ? '<button type="button" class="af-rm" data-rm>🗑️</button>' : ''}</div></div>`; }).join('')}</div></div>`; }).join('') : '<p class="af-pv-n">اختر المساحات أولاً لتظهر خانات الصور.</p>';
      box.querySelectorAll('[data-pv]').forEach((b) => (b.onclick = () => preview(b.dataset.pv, slots.find((x) => x.slot === b.dataset.pv).t)));
      box.querySelectorAll('.af-cr-tile').forEach((t) => { const { s, d: dv, w, h } = t.dataset; check(t, +w, +h);
        t.querySelector('input[type=file]').onchange = (e) => { const fl = e.target.files[0]; if (!fl) return; if (fl.size > 1500000) return onErr?.('الحد الأقصى للصورة 1.5 ميغا');
          const r = new FileReader(); r.onload = () => { (pend[s] ||= {})[dv] = r.result; draw(); }; r.readAsDataURL(fl); };
        t.querySelector('[data-rm]')?.addEventListener('click', () => { (pend[s] ||= {})[dv] = ''; draw(); }); });
    };
    draw();
    return { draw, value: () => { const o = {}; for (const s of getSel()) { const S = slots.find((x) => x.slot === s); o[s] = {}; for (const dv of Object.keys(S.dev)) o[s][dv] = val(s, dv); } return o; } };
  }

  /* عرض عرض السعر */
  function quoteHTML(q, err) {
    if (err) return `<div class="af-q"><div class="af-e">⚠️ ${esc(err)}</div></div>`;
    if (!q) return '';
    return `<div class="af-q"><b>💰 قيمة الحملة</b><table>${q.lines.map((l) => `<tr><td>${esc(l.t)}<br><small style="color:#64748b">${esc(l.desc)}</small></td><td>${money(l.cost, q.currency)}</td></tr>`).join('')}
      ${q.vatRate ? `<tr><td>ضريبة القيمة المضافة ${q.vatRate}%</td><td>${money(q.vat, q.currency)}</td></tr>` : ''}
      <tr><td><b>الإجمالي</b></td><td class="af-tot">${money(q.total, q.currency)}</td></tr></table>
      ${q.pricing === 'cpm' ? `<p class="af-pv-n" style="margin-top:6px">يُحسب الظهور فقط عندما يظهر نصف الإعلان على الشاشة لمدة ثانية. ${q.lines.some((l) => l.estDays) ? 'المدة المتوقعة حسب الزيارات الحالية: ' + q.lines.filter((l) => l.estDays).map((l) => `${esc(l.t.split(':')[0])} ${l.estDays} يوماً`).join('، ') : ''}</p>` : `<p class="af-pv-n" style="margin-top:6px">حجز حصري: إعلانك وحده في هذه المساحة طوال ${q.days} يوم.</p>`}
      ${(q.warnings || []).map((w) => `<p class="af-w">⚠️ ${esc(w)}</p>`).join('')}</div>`;
  }

  return { preview, slotPicker, creatives, quoteHTML, money, fmt, esc };
})();
