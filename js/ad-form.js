/* فنتازيا: أدوات مشتركة لنموذج الحملة الإعلانية (لوحة الإدارة + بوابة المعلنين)
   - قائمة المساحات تحت بعض، وبجانب كل مساحة زر «مشاهدة موقع الإعلان» يعرض لقطة للموقع على الجوال والتابلت والكمبيوتر
   - خانات رفع الصور لكل مساحة ولكل جهاز مع فحص المقاس */
const AdForm = (() => {
  const SCALE = 2; // الصورة المطلوبة بضعف مقاس العرض لتكون حادة على الشاشات عالية الدقة
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
.af-cr-info{font-size:12px;color:#64748b;min-height:1.2em}.af-cr-info.ok{color:#16a34a}.af-cr-info.warn{color:#d97706}.af-cr-info.bad{color:#dc2626;font-weight:700;background:#fee2e2;border-radius:8px;padding:5px 7px;line-height:1.6}.af-cr-act{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.af-tpl{font:inherit;font-weight:700;font-size:13px;border:2px solid #5b3cff;background:#fff;color:#5b3cff;border-radius:10px;padding:3px 10px;cursor:pointer}.af-tpl:hover{background:#f5f3ff}
.af-up{background:#5b3cff;color:#fff;border-radius:10px;padding:5px 12px;font-weight:700;font-size:13px;cursor:pointer;display:inline-block}
.af-rm{font:inherit;border:0;background:#fee2e2;border-radius:10px;padding:5px 10px;cursor:pointer}
.af-cats{display:flex;flex-wrap:wrap;gap:6px}.af-cats label.af-chk{display:inline-flex!important;flex-direction:row!important;align-items:center;gap:6px;padding:6px 12px;border:2px solid #e2e6ff;border-radius:99px;font-weight:600;font-size:14px;cursor:pointer;margin:0}
.af-cats label.af-chk:has(input:checked){border-color:#5b3cff;background:#f5f3ff}.af-cats .af-all{border-color:#c7d2fe}.af-cats input{accent-color:#5b3cff;width:16px;height:16px;margin:0}
.af-cal{border:2px solid #e2e6ff;border-radius:16px;padding:12px;background:#fff}.af-cal-h{display:flex;align-items:center;gap:8px;margin-bottom:8px}.af-cal-h button{font:inherit;font-size:22px;border:0;background:#eef1ff;border-radius:10px;width:38px;height:34px;cursor:pointer}
.af-cal-t{flex:1;text-align:center;font-weight:700;color:#5b3cff}.af-cal-m{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media(max-width:640px){.af-cal-m{grid-template-columns:1fr}.af-cal-m>div:nth-child(2){display:none}}
.af-cal-m b{display:block;text-align:center;margin-bottom:6px}.af-cal-g{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}.af-cal-g i{font-style:normal;text-align:center;color:#94a3b8;font-size:12px;font-weight:700}
.af-cal-g button{font:inherit;font-size:13px;border:0;border-radius:8px;padding:7px 0;background:#f8fafc;cursor:pointer}.af-cal-g button:hover:not(:disabled){background:#e0e7ff}.af-cal-g button:disabled{color:#cbd5e1;cursor:not-allowed;background:transparent}
.af-cal-g button.bk{background:#fee2e2;color:#dc2626;text-decoration:line-through}.af-cal-g button.on{background:#ddd6fe}.af-cal-g button.edge{background:#5b3cff;color:#fff;font-weight:700}
.af-cal-f{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#64748b;margin-top:8px;align-items:center}.af-cal-f .lg{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px}.lg.bk{background:#fee2e2;border:1px solid #dc2626}.lg.on{background:#5b3cff}
.af-cal-v{margin-inline-start:auto;font-weight:700;color:#1d2350}.af-cal-e{color:#dc2626;font-weight:700;font-size:13px;margin-top:6px}
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

  /* فحص ملف الصورة قبل الرفع: المقاس الفعلي ونظام الألوان (CMYK مرفوض) */
  async function inspect(file) {
    const buf = new Uint8Array(await file.arrayBuffer());
    const u16 = (i) => (buf[i] << 8) | buf[i + 1], u32 = (i) => ((buf[i] << 24) | (buf[i + 1] << 16) | (buf[i + 2] << 8) | buf[i + 3]) >>> 0;
    let type = '', w = 0, h = 0, cmyk = false;
    if (buf[0] === 0x89 && buf[1] === 0x50) { type = 'PNG'; w = u32(16); h = u32(20); }
    else if (buf[0] === 0xff && buf[1] === 0xd8) { type = 'JPG';
      for (let i = 2; i < buf.length - 9;) { if (buf[i] !== 0xff) { i++; continue; } const m = buf[i + 1];
        if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) { h = u16(i + 5); w = u16(i + 7); cmyk = buf[i + 9] === 4; break; }
        if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; } i += 2 + u16(i + 2); } }
    else if (buf[0] === 0x47 && buf[1] === 0x49) type = 'GIF';
    else if (buf[8] === 0x57 && buf[9] === 0x45) type = 'WEBP';
    if (!type) return { err: 'صيغة غير مدعومة. استخدم PNG أو JPG أو WEBP أو GIF' };
    if (!w || !h) { const url = URL.createObjectURL(file); try { const im = new Image(); im.src = url; await im.decode(); w = im.naturalWidth; h = im.naturalHeight; } catch (e) { return { err: 'تعذّرت قراءة الصورة' }; } finally { URL.revokeObjectURL(url); } }
    return { type, w, h, cmyk };
  }

  /* نموذج جاهز بالمقاس الصحيح (بضعف مقاس العرض) يحمّله المصمم ويصمم عليه */
  function template(slotTitle, devName, w, h, fname) {
    const k = SCALE, W = w * k, H = h * k;
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
    for (let i = 0; i <= Math.max(W, H); i += 10 * k) { x.strokeStyle = i % (50 * k) ? '#f1f4ff' : '#dfe5ff'; x.lineWidth = 1; x.beginPath(); x.moveTo(i + 0.5, 0); x.lineTo(i + 0.5, H); x.moveTo(0, i + 0.5); x.lineTo(W, i + 0.5); x.stroke(); }
    // المنطقة الآمنة (الحواف تُقص بانحناء الزوايا)
    x.strokeStyle = '#94a3b8'; x.lineWidth = k; x.beginPath(); x.roundRect ? x.roundRect(k / 2, k / 2, W - k, H - k, 14 * k) : x.rect(k / 2, k / 2, W - k, H - k); x.stroke();
    // مكان شارة «إعلان» (أعلى اليمين) لا تضع فيها نصاً مهماً
    x.fillStyle = 'rgba(239,68,68,.16)'; x.strokeStyle = '#ef4444'; x.lineWidth = k; x.fillRect(W - 52 * k, 4 * k, 48 * k, 20 * k); x.strokeRect(W - 52 * k, 4 * k, 48 * k, 20 * k);
    x.fillStyle = '#b91c1c'; x.font = `bold ${11 * k}px Tahoma, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'rtl'; x.fillText('إعلان', W - 28 * k, 14.5 * k);
    // النصوص: نموذج إعلان فنتازيا ← موقع الإعلان ← الجهاز ← المقاس ← الشروط
    const lines = [['نموذج إعلان فنتازيا', '#5b3cff', 'bold', 1], [slotTitle, '#1d2350', 'bold', 1.05], [devName, '#1d2350', '', 0.9], [`${W} × ${H} px`, '#ec4899', 'bold', 1], ['RGB · PNG أو JPG · حتى 1.5MB · أبعد النصوص المهمة عن الحواف', '#64748b', '', 0.62]];
    const avail = H - 24 * k, tot = lines.reduce((s, l) => s + l[3] * 1.22, 0), f = Math.min(avail / tot, W * 0.045, 30 * k);
    let y = H / 2 - (tot * f) / 2;
    lines.forEach(([t, col, wt, sc], i) => { const z = f * sc; x.font = `${wt} ${z}px Tahoma, sans-serif`; x.fillStyle = col; x.direction = i === 3 ? 'ltr' : 'rtl'; y += (z * 1.22) / 2; x.fillText(t, W / 2, y, W - 120 * k); y += (z * 1.22) / 2; });
    c.toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = fname; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
  }

  /* خانات صور الإعلان لكل مساحة ولكل جهاز */
  function creatives(box, slots, getSel, cur, onErr) {
    css();
    const pend = {}, msgs = {};
    const val = (s, dv) => pend[s]?.[dv] ?? cur[s]?.[dv] ?? '';
    const check = (tile, w, h) => {
      const img = tile.querySelector('img'), info = tile.querySelector('.af-cr-info'), m = msgs[tile.dataset.s + tile.dataset.d];
      if (m) { info.textContent = m; info.className = 'af-cr-info bad'; return; }
      if (!img) { info.textContent = 'لم تُرفع صورة'; info.className = 'af-cr-info'; return; }
      const go = () => { const rw = img.naturalWidth, rh = img.naturalHeight; if (!rw) return; const ok = Math.abs(rw - w * SCALE) <= 5 && Math.abs(rh - h * SCALE) <= 5;
        info.textContent = `${rw}×${rh} · ${ok ? '✅ مقاس صحيح' : '⚠️ مقاس مختلف عن المطلوب'}`; info.className = 'af-cr-info ' + (ok ? 'ok' : 'warn'); };
      img.complete ? go() : (img.onload = go);
    };
    const draw = () => {
      const sel = getSel();
      box.innerHTML = sel.length ? '<p class="af-pv-n" style="margin:0 0 8px">حمّل النموذج ⬇️ وصمّم عليه، ثم ارفع الصورة بنفس المقاس بالضبط (يُقبل فرق 5 بكسل فقط) وبألوان RGB. إن لم ترفع صورة التابلت أو الجوال تُستخدم صورة الكمبيوتر وقد تظهر صغيرة.</p>' + sel.map((s) => { const S = slots.find((x) => x.slot === s);
        return `<div class="af-cr-slot"><b>${esc(S.t)}</b> <button type="button" class="af-eye" data-pv="${s}" style="margin-inline-start:6px;padding:3px 10px">👁️</button><div class="af-cr-row">${Object.entries(S.dev).map(([dv, [w, h]]) => { const v = val(s, dv);
          return `<div class="af-cr-tile" data-s="${s}" data-d="${dv}" data-w="${w}" data-h="${h}"><div class="af-cr-h"><span>${Object.keys(S.dev).length === 1 ? '🖥️📱 كل الأجهزة' : DEV[dv]}</span><span dir="ltr">${w * SCALE}×${h * SCALE}</span></div>
            <div class="af-cr-prev" style="aspect-ratio:${w}/${h}">${v ? `<img src="${esc(v)}" alt="">` : '<span>لم تُرفع صورة</span>'}</div><div class="af-cr-info"></div>
            <div class="af-cr-act"><button type="button" class="af-tpl" data-tpl title="تحميل نموذج فارغ بالمقاس الصحيح للتصميم عليه">⬇️ تحميل النموذج</button><label class="af-up">📁 ${v ? 'تغيير' : 'رفع صورة'}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden></label>${v ? '<button type="button" class="af-rm" data-rm>🗑️</button>' : ''}</div></div>`; }).join('')}</div></div>`; }).join('') : '<p class="af-pv-n">اختر المساحات أولاً لتظهر خانات الصور.</p>';
      box.querySelectorAll('[data-pv]').forEach((b) => (b.onclick = () => preview(b.dataset.pv, slots.find((x) => x.slot === b.dataset.pv).t)));
      box.querySelectorAll('.af-cr-tile').forEach((t) => { const { s, d: dv, w, h } = t.dataset, key = s + dv, S = slots.find((x) => x.slot === s); check(t, +w, +h);
        t.querySelector('[data-tpl]').onclick = () => template(S.t, Object.keys(S.dev).length === 1 ? 'كل الأجهزة' : DEV[dv].replace(/^\S+\s/, ''), +w, +h, `${slots.findIndex((x) => x.slot === s) + 1}-${s}-${dv}-${w * SCALE}x${h * SCALE}.png`);
        t.querySelector('input[type=file]').onchange = async (e) => { const fl = e.target.files[0]; e.target.value = ''; if (!fl) return;
          const bad = (m) => { msgs[key] = '⛔ ' + m; onErr?.(`${S.t} (${DEV[dv] || ''}): ${m}`); draw(); };
          if (fl.size > 1500000) return bad('حجم الملف أكبر من 1.5 ميغا');
          const r = await inspect(fl); if (r.err) return bad(r.err);
          if (r.cmyk) return bad('الصورة بألوان CMYK (للطباعة). احفظها بألوان RGB');
          if (Math.abs(r.w - w * SCALE) > 5 || Math.abs(r.h - h * SCALE) > 5) return bad(`المقاس ${r.w}×${r.h} غير صحيح، المطلوب ${w * SCALE}×${h * SCALE} بكسل. حمّل النموذج وصمّم عليه`);
          delete msgs[key]; onErr?.('');
          const fr = new FileReader(); fr.onload = () => { (pend[s] ||= {})[dv] = fr.result; draw(); }; fr.readAsDataURL(fl); };
        t.querySelector('[data-rm]')?.addEventListener('click', () => { (pend[s] ||= {})[dv] = ''; delete msgs[key]; draw(); }); });
    };
    draw();
    return { draw, value: () => { const o = {}; for (const s of getSel()) { const S = slots.find((x) => x.slot === s); o[s] = {}; for (const dv of Object.keys(S.dev)) o[s][dv] = val(s, dv); } return o; } };
  }

  /* استهداف الأقسام: أول خيار «الكل» */
  function catsPicker(box, cats, selected) {
    css();
    const sel = (selected || []).filter(Boolean), all = !sel.length;
    box.innerHTML = `<div class="af-cats"><label class="af-chk af-all"><input type="checkbox" data-all${all ? ' checked' : ''}> <b>الكل</b></label>${Object.entries(cats).map(([k, v]) => `<label class="af-chk"><input type="checkbox" name="cats" value="${k}"${all || sel.includes(k) ? ' checked' : ''}> ${esc(v)}</label>`).join('')}</div>`;
    const allB = box.querySelector('[data-all]'), items = [...box.querySelectorAll('input[name=cats]')];
    allB.onchange = () => items.forEach((i) => (i.checked = allB.checked));
    items.forEach((i) => (i.onchange = () => (allB.checked = items.every((x) => x.checked))));
    return () => { const c = items.filter((i) => i.checked).map((i) => i.value); return c.length === items.length ? [] : c.length ? c : null; }; // [] = كل الموقع، null = لا شيء
  }

  /* تقويم الحجز: الأيام المحجوزة حصرياً تظهر ممنوعة ولا يمكن اختيارها */
  const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const iso = (d) => d.toISOString().slice(0, 10), addD = (s, n) => iso(new Date(Date.parse(s + 'T00:00:00Z') + n * 864e5));
  function calendar(box, o) {
    css();
    const st = { mode: o.mode || 'range', min: o.min, booked: o.booked || [], start: o.start || '', end: o.end || '', view: (o.start || o.min).slice(0, 7), msg: '' };
    const isBooked = (d) => st.booked.some(([a, b]) => d >= a && d <= b);
    const draw = () => {
      const [Y, M] = st.view.split('-').map(Number), months = [0, 1].map((i) => new Date(Date.UTC(Y, M - 1 + i, 1)));
      box.innerHTML = `<div class="af-cal"><div class="af-cal-h"><button type="button" data-nav="-1" aria-label="الشهر السابق">›</button><span class="af-cal-t">${st.mode === 'range' ? (st.start && !st.end ? 'اختر يوم النهاية' : 'اختر يوم البداية ثم يوم النهاية') : 'اختر يوم بداية الحملة'}</span><button type="button" data-nav="1" aria-label="الشهر التالي">‹</button></div>
        <div class="af-cal-m">${months.map((m) => { const y = m.getUTCFullYear(), mo = m.getUTCMonth(), first = new Date(Date.UTC(y, mo, 1)).getUTCDay(), n = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
          let cells = ''; for (let i = 0; i < first; i++) cells += '<span></span>';
          for (let d = 1; d <= n; d++) { const ds = iso(new Date(Date.UTC(y, mo, d))), past = ds < st.min, bk = isBooked(ds);
            const inR = st.start && (ds === st.start || (st.end && ds >= st.start && ds <= st.end));
            cells += `<button type="button" data-d="${ds}" class="${bk ? 'bk' : ''}${inR ? ' on' : ''}${ds === st.start || ds === st.end ? ' edge' : ''}"${past || bk ? ' disabled' : ''} title="${bk ? 'محجوز حصرياً لمعلن آخر' : ''}">${d}</button>`; }
          return `<div><b>${MONTHS[mo]} ${y}</b><div class="af-cal-g"><i>ح</i><i>ن</i><i>ث</i><i>ر</i><i>خ</i><i>ج</i><i>س</i>${cells}</div></div>`; }).join('')}</div>
        <div class="af-cal-f"><span><i class="lg bk"></i> محجوز حصرياً</span><span><i class="lg on"></i> اختيارك</span><span class="af-cal-v">${st.start ? (st.mode === 'range' ? `من ${st.start}${st.end ? ` إلى ${st.end}` : ''}` : `البداية: ${st.start}`) : ''}</span></div>${st.msg ? `<div class="af-cal-e">${esc(st.msg)}</div>` : ''}</div>`;
      box.querySelectorAll('[data-nav]').forEach((b) => (b.onclick = () => { const d = new Date(Date.UTC(Y, M - 1 + +b.dataset.nav, 1)); st.view = iso(d).slice(0, 7); st.msg = ''; draw(); }));
      box.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => { const d = b.dataset.d; st.msg = '';
        if (st.mode === 'single') { st.start = d; st.end = ''; }
        else if (!st.start || st.end || d < st.start) { st.start = d; st.end = ''; }
        else { let x = st.start, clash = false; while (x <= d) { if (isBooked(x)) { clash = true; break; } x = addD(x, 1); }
          if (clash) { st.msg = 'الفترة تتقاطع مع أيام محجوزة حصرياً. اختر فترة بلا أيام حمراء'; st.start = d; st.end = ''; } else st.end = d; }
        draw(); o.onChange?.({ start: st.start, end: st.end }); }));
    };
    draw();
    return { get: () => ({ start: st.start, end: st.end }), set: (p) => { Object.assign(st, p); if (st.start && isBooked(st.start)) { st.start = ''; st.end = ''; } if (st.mode === 'single') st.end = ''; draw(); } };
  }

  /* عرض عرض السعر */
  function quoteHTML(q, err) {
    if (err) return `<div class="af-q"><div class="af-e">⚠️ ${esc(err)}</div></div>`;
    if (!q) return '';
    return `<div class="af-q"><b>💰 قيمة الحملة</b><table>${q.lines.map((l) => `<tr><td>${esc(l.t)}<br><small style="color:#64748b">${esc(l.desc)}</small></td><td>${money(l.cost, q.currency)}</td></tr>`).join('')}
      ${q.vatRate ? `<tr><td>ضريبة القيمة المضافة ${q.vatRate}%</td><td>${money(q.vat, q.currency)}</td></tr>` : ''}
      <tr><td><b>الإجمالي</b></td><td class="af-tot">${money(q.total, q.currency)}</td></tr></table>
      ${q.pricing === 'cpm' ? `<p class="af-pv-n" style="margin-top:6px">يُحسب الظهور فقط عندما يظهر نص الإعلان على الشاشة لمدة ثانية. ${q.lines.some((l) => l.estDays) ? 'المدة المتوقعة حسب الزيارات الحالية: ' + q.lines.filter((l) => l.estDays).map((l) => `${esc(l.t.split(':')[0])} ${l.estDays} يوماً`).join('، ') : ''}</p>` : `<p class="af-pv-n" style="margin-top:6px">حجز حصري: إعلانك وحده في هذه المساحة طوال ${q.days} يوم.</p>`}
      ${(q.warnings || []).map((w) => `<p class="af-w">⚠️ ${esc(w)}</p>`).join('')}</div>`;
  }

  return { preview, slotPicker, creatives, quoteHTML, money, fmt, esc, inspect, template, catsPicker, calendar };
})();
