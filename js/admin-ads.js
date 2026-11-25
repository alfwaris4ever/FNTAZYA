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
const crOf = (c) => { let cr = {}; try { cr = JSON.parse(c.creatives || '{}') || {}; } catch (e) {} for (const s of (c.slots || '').split(',').filter(Boolean)) if (!cr[s] && c.img) cr[s] = { d: c.img }; return cr; };
const STATUS = { pending: '⏳ بانتظار المراجعة', awaiting: '💳 بانتظار السداد', active: '🟢 تعمل', paused: '⏸️ موقوفة', rejected: '❌ مرفوضة', ended: '⏹️ موقوفة نهائياً' };
function campStatus(c) { if (c.status === 'active' && !c.live) return '⚪ منتهية / خارج الفترة'; return STATUS[c.status] || c.status; }
function pkgText(c) { return c.ctype === 'filler' ? 'رديف' : c.pricing === 'daily' ? `حصري ${c.start} ← ${c.end}` : `${fmt(c.max_impr)} ظهور${c.start ? ` من ${c.start}` : ''}`; }
function thumbs(c) { return c.kind === 'image' ? Object.values(crOf(c)).map((v) => { const u = v.d || v.t || v.m; return u ? `<img src="${esc(u)}" class="thumb" alt="">` : ''; }).join('') : '🧩'; }

async function loadAds() {
  app.innerHTML = tabsBar('#ads') + '<div class="msg">جاري التحميل…</div>';
  try { ADM_ADS = await admApi('adm_ads'); } catch (e) { if (e.message !== 'auth') app.innerHTML = tabsBar('#ads') + `<div class="msg">${esc(e.message)}</div>`; return; }
  const j = ADM_ADS, S = j.settings, cur = S.currency, slotName = Object.fromEntries(j.slots.map((s) => [s.slot, s.t]));
  const pending = j.campaigns.filter((c) => c.status === 'pending' || c.status === 'awaiting'), paid = j.campaigns.filter((c) => c.ctype !== 'filler' && !['pending', 'awaiting'].includes(c.status)), fill = j.campaigns.filter((c) => c.ctype === 'filler');
  const rev = paid.filter((c) => c.status !== 'rejected').reduce((s, c) => s + +c.price, 0);
  const ti = paid.reduce((s, c) => s + c.impr, 0), tc = paid.reduce((s, c) => s + c.clicks, 0);
  const slotsCell = (c) => c.slots.split(',').map((s) => `<span class="chip">${esc(slotName[s] || s)}</span>`).join(' ') + (c.cats ? `<div class="sub">${c.cats.split(',').map((x) => ADM_CATS[x] || x).join('، ')}</div>` : '');
  const advCell = (c) => `${esc(c.advertiser)}${c.adv_email ? `<div class="sub" dir="ltr"><a href="mailto:${esc(c.adv_email)}">${esc(c.adv_email)}</a> ${esc(c.adv_phone || '')}</div>` : ''}`;
  app.innerHTML = tabsBar('#ads') + `
  <div class="cards"><div class="card"><b>${pending.filter((c) => c.status === 'pending').length}</b><span>بانتظار المراجعة</span></div><div class="card"><b>${pending.filter((c) => c.status === 'awaiting').length}</b><span>بانتظار السداد</span></div><div class="card"><b>${paid.filter((c) => c.live).length}</b><span>حملة مدفوعة تعمل</span></div>
   <div class="card"><b>${AdForm.money(rev, cur)}</b><span>قيمة الحملات المعتمدة</span></div><div class="card"><b>${fmt(ti)}</b><span>ظهور مدفوع</span></div><div class="card"><b>${ctr(ti, tc)}</b><span>نسبة النقر CTR</span></div><div class="card"><b>${j.advertisers}</b><span>حساب معلن</span></div></div>

  <h2>⏳ حملات بانتظار المراجعة أو السداد (${pending.length})</h2>
  <table><tr><th>الحملة</th><th>المعلن</th><th>المساحات</th><th>الباقة</th><th>القيمة</th><th>الحالة</th><th>تحكم</th></tr>
  ${pending.map((c) => `<tr><td>${thumbs(c)} <b>${esc(c.name)}</b><div class="sub">${new Date(c.created * 1000).toLocaleDateString('ar-SA-u-nu-latn')}</div></td><td>${advCell(c)}</td><td>${slotsCell(c)}</td><td class="sub">${pkgText(c)}</td><td><b>${AdForm.money(c.price, cur)}</b></td><td>${STATUS[c.status]}${c.invoice_no ? `<div class="sub">فاتورة ${esc(c.invoice_no)}</div>` : ''}</td>
    <td style="white-space:nowrap"><button class="sm" data-edit="${c.id}" title="مراجعة الإعلان">👁️</button>${c.status === 'pending' ? `<button class="sm" data-ok="${c.id}" title="قبول الإعلان وإرسال الفاتورة للمعلن">✅ قبول وإرسال الفاتورة</button>` : `<a class="sm" style="text-decoration:none;padding:5px 8px;border-radius:10px;background:#eef1ff;color:#1d2350" href="invoice.html?t=${esc(c.report_token)}" target="_blank" title="الفاتورة">📄</a><button class="sm" data-paid="${c.id}" title="وصل السداد: تفعيل الحملة">💰 تم السداد وتفعيل</button>`}<button class="sm del" data-no="${c.id}" title="رفض مع ذكر السبب">❌</button></td></tr>`).join('') || '<tr><td colspan=7>لا توجد طلبات جديدة</td></tr>'}</table>
  <p class="note">المسار: المعلن ينشئ حملته من <a href="advertiser.html" target="_blank">بوابة المعلنين</a> ← تراجعها وتضغط «✅ قبول وإرسال الفاتورة» فتصله فاتورة إلكترونية ← بعد وصول السداد تضغط «💰 تم السداد وتفعيل» فتبدأ الحملة ويصله رابط التقرير. وعند الرفض يصله السبب ويعدّل حملته ويعيد إرسالها.</p>

  <h2 style="margin-top:22px">🎯 حملات المعلنين <button id="newC">➕ حملة يدوية</button></h2>
  <table><tr><th>الحملة</th><th>المعلن</th><th>المساحات</th><th>الباقة</th><th>القيمة</th><th>الرصيد المتبقي</th><th>الحالة</th><th>ظهور</th><th>نقرات</th><th>CTR</th><th>تحكم</th></tr>
  ${paid.map((c) => `<tr><td>${thumbs(c)} <b>${esc(c.name)}</b></td><td>${advCell(c)}</td><td>${slotsCell(c)}</td><td class="sub">${pkgText(c)}${c.pricing === 'cpm' && +c.max_impr ? `<div class="pbar"><i style="width:${Math.min(100, (c.impr / c.max_impr) * 100)}%"></i></div>` : ''}</td><td>${AdForm.money(c.price, cur)}</td><td>${c.bal?.paid ? (c.status === 'ended' ? `<span class="sub">مسترد ${AdForm.money(c.bal.refund, cur)}</span>` : `<b>${AdForm.money(c.bal.remaining, cur)}</b><div class="sub">مستهلك ${AdForm.money(c.bal.consumed, cur)}</div>`) : '—'}</td>
    <td>${campStatus(c)}${c.note ? `<div class="sub">${esc(c.note)}</div>` : ''}</td><td>${fmt(c.impr)}</td><td>${fmt(c.clicks)}</td><td>${ctr(c.impr, c.clicks)}</td>
    <td style="white-space:nowrap"><button class="sm" data-edit="${c.id}" title="تعديل">✏️</button>${['active', 'paused'].includes(c.status) ? `<button class="sm" data-toggle="${c.id}" title="${c.status === 'paused' ? 'تشغيل' : 'إيقاف'}">${c.status === 'paused' ? '▶️' : '⏸️'}</button>` : ''}${['active', 'paused'].includes(c.status) && c.bal?.paid ? `<button class="sm" data-end="${c.id}" title="إيقاف نهائي وإرجاع الرصيد المتبقي">⏹️</button>` : ''}<button class="sm" data-rep="${esc(c.report_token)}" title="نسخ رابط تقرير المعلن">📊</button><button class="sm del" data-del="${c.id}" title="حذف">🗑️</button></td></tr>`).join('') || '<tr><td colspan=11>لا توجد حملات بعد</td></tr>'}</table>

  <h2 style="margin-top:22px">🧩 الإعلانات الرديفة <button id="newF">➕ إعلان رديف</button></h2>
  <p class="note">إعلانات الموقع نفسه بأقل أولوية: تظهر فقط حين لا يوجد معلن متاح للمساحة، أو حين يكون المعلن نفسه ظاهراً في مساحة أخرى بالصفحة. لا يمكن حذفها، ويمكن تعديلها أو إيقافها.</p>
  <table><tr><th>الإعلان</th><th>المساحات</th><th>الحالة</th><th>ظهور</th><th>نقرات</th><th>تحكم</th></tr>
  ${fill.map((c) => `<tr><td>${thumbs(c)} <b>${esc(c.name)}</b></td><td>${slotsCell(c)}</td><td>${campStatus(c)}</td><td>${fmt(c.impr)}</td><td>${fmt(c.clicks)}</td>
    <td style="white-space:nowrap"><button class="sm" data-edit="${c.id}" title="تعديل">✏️</button><button class="sm" data-toggle="${c.id}" title="${c.status === 'paused' ? 'تشغيل' : 'إيقاف'}">${c.status === 'paused' ? '▶️' : '⏸️'}</button></td></tr>`).join('') || '<tr><td colspan=6>لا توجد إعلانات رديفة</td></tr>'}</table>

  <h2 style="margin-top:22px">💰 الأسعار</h2>
  <form id="pf"><table><tr><th>المساحة</th><th>متوسط الظهور اليومي</th><th>سعر 1000 ظهور (CPM)</th><th>سعر اليوم الحصري</th><th>المقترح حسب الزيارات</th></tr>
  ${j.slots.map((s) => { const sug = s.avg ? Math.max(1, Math.round((s.avg * s.price.cpm) / 1000 * 1.3)) : 0;
    return `<tr><td><b>${esc(s.t)}</b> <button type="button" class="sm" data-pv="${s.slot}">👁️</button></td><td>${fmt(s.avg)}</td>
    <td><label class="pin"><input type="checkbox" name="${s.slot}.cpm_on"${s.price.cpm_on ? ' checked' : ''}> <input type="number" step="0.5" min="0" name="${s.slot}.cpm" value="${s.price.cpm}"> ${esc(cur)}</label></td>
    <td><label class="pin"><input type="checkbox" name="${s.slot}.daily_on"${s.price.daily_on ? ' checked' : ''}> <input type="number" step="5" min="0" name="${s.slot}.daily" value="${s.price.daily}"> ${esc(cur)}</label></td>
    <td class="sub">${sug ? `اليوم الحصري ≈ ${AdForm.money(sug, cur)}<br>(${fmt(s.avg)} ظهور × CPM + 30% علاوة الحصرية)` : 'يظهر بعد تجمّع بيانات الزيارات'}</td></tr>`; }).join('')}</table>
  <div class="frm" style="margin-top:12px"><label>العملة<input name="currency" value="${esc(S.currency)}"></label><label>ضريبة القيمة المضافة %<input type="number" min="0" max="30" name="vat" value="${esc(S.vat)}"></label>
   <label>أقل عدد مرات ظهور للحملة<input type="number" min="1000" step="1000" name="min_impr" value="${esc(S.min_impr)}"></label><label>أقل مدة للحجز الحصري (أيام)<input type="number" min="1" name="min_days" value="${esc(S.min_days)}"></label>
   <label>اسم البائع في الفاتورة<input name="seller_name" value="${esc(S.seller_name)}"></label><label>السجل التجاري / وثيقة العمل الحر<input name="seller_cr" value="${esc(S.seller_cr)}"></label>
   <label>الرقم الضريبي (إن وُجد)<input name="seller_vat" value="${esc(S.seller_vat)}"></label><label>مهلة سداد الفاتورة (أيام)<input type="number" min="1" name="invoice_days" value="${esc(S.invoice_days)}"></label>
   <label class="full">عنوان البائع<input name="seller_address" value="${esc(S.seller_address)}"></label>
   <label class="full">بيانات السداد في الفاتورة (اسم البنك، الآيبان، اسم المستفيد…)<textarea name="pay_info" rows="3">${esc(S.pay_info)}</textarea></label></div>
  <p class="note">✔️ المربع بجانب السعر = الباقة متاحة للبيع في هذه المساحة. ضع ضريبة القيمة المضافة 0 إذا لم تكن مسجّلاً في الضريبة.</p>
  <button type="submit">💾 حفظ الأسعار</button> <span id="pmsg" class="note"></span></form>

  <h2 style="margin-top:22px">🧱 المساحات وشبكات الإعلانات</h2>
  <table><tr><th>المساحة</th><th>المقاسات</th><th>عند عدم وجود معلن</th><th>ظهور</th><th>نقرات</th><th></th></tr>
  ${j.slots.map((s) => `<tr><td><b>${esc(s.t)}</b></td><td class="sub">${esc(s.size)}</td><td>${{ house: '🧩 الرديف ثم «أعلن هنا»', html: '🌐 كود شبكة إعلانية', off: '🧩 الرديف ثم إخفاء' }[s.mode]}</td><td>${fmt(s.i)}</td><td>${fmt(s.c)}</td><td><button class="sm" data-slot="${s.slot}">⚙️ إعداد</button></td></tr>`).join('')}</table>

  <h2 style="margin-top:22px">📄 ملف ads.txt</h2>
  <p class="note">تطلبه شبكات الإعلانات للتحقق من ملكية الموقع. الصق السطر الذي تعطيك إياه الشبكة واحفظ، وسيظهر على <a href="/ads.txt" target="_blank">fntazya.com/ads.txt</a></p>
  <textarea id="adstxt" dir="ltr" rows="4" placeholder="مثال: superawesome.tv, 12345, DIRECT">${esc(j.adstxt)}</textarea><button id="saveTxt" style="margin-top:6px">💾 حفظ ads.txt</button>`;

  const find = (id) => j.campaigns.find((c) => c.id == id);
  app.querySelector('#newC').onclick = () => campaignForm({ ctype: 'paid' });
  app.querySelector('#newF').onclick = () => campaignForm({ ctype: 'filler' });
  app.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => campaignForm(find(b.dataset.edit))));
  app.querySelectorAll('[data-pv]').forEach((b) => (b.onclick = () => AdForm.preview(b.dataset.pv, slotName[b.dataset.pv])));
  app.querySelectorAll('[data-toggle]').forEach((b) => (b.onclick = async () => { const c = find(b.dataset.toggle); await admApi('adm_ad_status', { id: c.id, status: c.status === 'paused' ? 'active' : 'paused' }).catch((e) => alert(e.message)); loadAds(); }));
  app.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => { if (!confirm('حذف الحملة وكل إحصاءاتها نهائياً؟')) return; await admApi('adm_ad_del', { id: +b.dataset.del }).catch((e) => alert(e.message)); loadAds(); }));
  app.querySelectorAll('[data-ok]').forEach((b) => (b.onclick = async () => { const c = find(b.dataset.ok); if (!confirm(`قبول إعلان «${c.advertiser}» وإرسال فاتورة بقيمة ${AdForm.money(c.price, cur)}؟`)) return;
    await admApi('adm_ad_decide', { id: c.id, decision: 'approve' }).catch((e) => alert(e.message)); loadAds(); }));
  app.querySelectorAll('[data-paid]').forEach((b) => (b.onclick = async () => { const c = find(b.dataset.paid); if (!confirm(`تأكيد وصول سداد ${AdForm.money(c.price, cur)} من «${c.advertiser}» (فاتورة ${c.invoice_no}) وتفعيل الحملة؟`)) return;
    await admApi('adm_ad_decide', { id: c.id, decision: 'paid' }).catch((e) => alert(e.message)); loadAds(); }));
  app.querySelectorAll('[data-no]').forEach((b) => (b.onclick = async () => { const note = prompt('سبب الرفض (يصل للمعلن ليعدّل حملته):', ''); if (note === null) return;
    await admApi('adm_ad_decide', { id: +b.dataset.no, decision: 'reject', note }).catch((e) => alert(e.message)); loadAds(); }));
  app.querySelectorAll('[data-end]').forEach((b) => (b.onclick = async () => { const c = find(b.dataset.end);
    const v = prompt(`إيقاف حملة «${c.name}» نهائياً.\nالمستهلك: ${AdForm.money(c.bal.consumed, cur)}\nالمبلغ المسترد للمعلن (يمكنك تعديله):`, c.bal.remaining); if (v === null) return;
    const note = prompt('ملاحظة تصل للمعلن (اختياري):', '') ?? '';
    try { const r = await admApi('adm_ad_end', { id: c.id, refund: v, note }); alert(`تم إيقاف الحملة. المبلغ المسترد: ${AdForm.money(r.refund, cur)}`); } catch (e) { alert(e.message); } loadAds(); }));
  app.querySelectorAll('[data-rep]').forEach((b) => (b.onclick = async () => { const u = location.origin + '/ad-report.html?t=' + b.dataset.rep; try { await navigator.clipboard.writeText(u); b.textContent = '✅'; } catch (e) { prompt('رابط تقرير المعلن:', u); } }));
  app.querySelectorAll('[data-slot]').forEach((b) => (b.onclick = () => slotForm(j.slots.find((s) => s.slot === b.dataset.slot))));
  app.querySelector('#saveTxt').onclick = async (e) => { try { await admApi('adm_adstxt', { txt: app.querySelector('#adstxt').value }); e.target.textContent = '✅ تم الحفظ'; } catch (er) { alert(er.message); } };
  app.querySelector('#pf').onsubmit = async (e) => { e.preventDefault(); const f = e.target, pricing = {};
    for (const s of j.slots) pricing[s.slot] = { cpm: f[`${s.slot}.cpm`].value, daily: f[`${s.slot}.daily`].value, cpm_on: f[`${s.slot}.cpm_on`].checked, daily_on: f[`${s.slot}.daily_on`].checked };
    const settings = Object.fromEntries(['currency', 'vat', 'min_impr', 'min_days', 'pay_info', 'seller_name', 'seller_cr', 'seller_vat', 'seller_address', 'invoice_days'].map((k) => [k, f[k].value]));
    try { await admApi('adm_pricing_save', { pricing, settings }); app.querySelector('#pmsg').textContent = '✅ تم حفظ الأسعار'; } catch (er) { alert(er.message); } };
}
function modal(html) {
  const d = document.createElement('div'); d.className = 'modal'; d.innerHTML = `<div class="modal-card">${html}</div>`;
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.remove(); });
  document.body.appendChild(d); return d;
}
function campaignForm(c = {}) {
  const filler = c.ctype === 'filler', cats = (c.cats || '').split(','), cur = ADM_ADS.settings.currency;
  const d = modal(`<h2>${filler ? '🧩 ' + (c.id ? 'تعديل إعلان رديف' : 'إعلان رديف جديد') : c.status === 'pending' ? '👁️ مراجعة حملة معلن' : c.id ? '✏️ تعديل حملة' : '➕ حملة يدوية'}</h2><form id="cf" class="frm">
    <label>اسم الحملة<input name="name" value="${esc(c.name)}" placeholder="مثال: عروض العودة للمدارس"></label>
    ${filler ? '<label>النوع<input value="إعلان رديف (أقل أولوية)" disabled></label>' : `<label>المعلن<input name="advertiser" value="${esc(c.advertiser)}" placeholder="اسم الشركة"></label>`}
    <div class="full"><b>المساحات</b><div id="slotsBox" style="margin-top:6px"></div></div>
    <div class="full"><b>الأقسام التي يظهر فيها</b><div id="catsBox" style="margin-top:6px"></div></div>
    <label>نوع الإعلان<select name="kind"><option value="image"${c.kind !== 'html' ? ' selected' : ''}>صور بانر + رابط</option><option value="html"${c.kind === 'html' ? ' selected' : ''}>كود HTML</option></select></label>
    <label>${filler ? 'الوزن بين الإعلانات الرديفة (1-10)' : 'الأولوية (1-10)'}<input name="weight" type="number" min="1" max="10" value="${c.weight || 1}"></label>
    <div class="full k-image" id="crs"></div>
    <label class="full k-image">رابط الإعلان (يفتح بعد بوابة الأهل)<input name="link" dir="ltr" value="${esc(c.link)}" placeholder="https://"></label>
    <label class="full k-image">نص بديل للصور<input name="alt" value="${esc(c.alt)}"></label>
    <label class="full k-html">كود الإعلان (يعمل داخل إطار معزول)<textarea name="html" dir="ltr" rows="5">${esc(c.html)}</textarea></label>
    ${filler ? '' : `<fieldset class="full"><legend>الباقة</legend>
      <label class="ck"><input type="radio" name="pricing" value="cpm"${c.pricing !== 'daily' ? ' checked' : ''}> مرات ظهور (تناوب مع المعلنين)</label>
      <label class="ck"><input type="radio" name="pricing" value="daily"${c.pricing === 'daily' ? ' checked' : ''}> حجز حصري بالأيام</label>
      <div class="frm" style="margin-top:8px"><label class="k-cpm">عدد مرات الظهور لكل مساحة<input type="number" min="0" step="1000" name="max_impr" value="${c.max_impr || 10000}"></label>
      <label>تاريخ البداية<input type="date" name="start" value="${esc(c.start)}"></label><label class="k-daily">تاريخ النهاية<input type="date" name="end" value="${esc(c.end)}"></label>
      <label>القيمة (${esc(cur)}) <small>فارغ = حسب الأسعار</small><input type="number" step="0.01" min="0" name="price" value="${c.id ? esc(c.price) : ''}"></label></div>
      <div id="qbox" style="margin-top:8px"></div></fieldset>`}
    <label>الحالة<select name="status">${(filler ? ['active', 'paused'] : ['pending', 'awaiting'].includes(c.status) ? [c.status, 'active', 'paused'] : ['active', 'paused']).map((s) => `<option value="${s}"${c.status === s ? ' selected' : ''}>${STATUS[s]}</option>`).join('')}</select></label>
    <div class="full" id="cerr" style="color:#dc2626;font-weight:700"></div>
    <div class="full"><button type="submit">💾 حفظ</button> <button type="button" class="sm" data-close>إلغاء</button></div></form>`);
  const f = d.querySelector('#cf'), err = (m) => (d.querySelector('#cerr').textContent = m || '');
  const getSel = AdForm.slotPicker(d.querySelector('#slotsBox'), ADM_ADS.slots, (c.slots || '').split(','), { showPrice: !filler, currency: cur, onChange: () => { cr.draw(); quote(); } });
  const cr = AdForm.creatives(d.querySelector('#crs'), ADM_ADS.slots, getSel, crOf(c), err);
  const getCats = AdForm.catsPicker(d.querySelector('#catsBox'), ADM_CATS, cats);
  let qt; const quote = () => { if (filler) return; clearTimeout(qt); qt = setTimeout(async () => { const p = f.pricing.value;
    d.querySelectorAll('.k-cpm').forEach((x) => (x.hidden = p !== 'cpm')); d.querySelectorAll('.k-daily').forEach((x) => (x.hidden = p !== 'daily'));
    try { const r = await admApi('adm_quote', { id: c.id || 0, slots: getSel(), pricing: p, start: f.start.value, end: p === 'daily' ? f.end.value : '', impr: +f.max_impr.value }); d.querySelector('#qbox').innerHTML = AdForm.quoteHTML(r.quote); }
    catch (e) { d.querySelector('#qbox').innerHTML = AdForm.quoteHTML(null, e.message); } }, 250); };
  if (!filler) { f.querySelectorAll('[name=pricing],[name=start],[name=end],[name=max_impr]').forEach((x) => x.addEventListener('input', quote)); quote(); }
  const sync = () => { const h = f.kind.value === 'html'; d.querySelectorAll('.k-image').forEach((x) => (x.hidden = h)); d.querySelectorAll('.k-html').forEach((x) => (x.hidden = !h)); };
  f.kind.onchange = sync; sync();
  f.onsubmit = async (e) => { e.preventDefault(); err(); const fd = new FormData(f);
    const body = { id: c.id || 0, ctype: filler ? 'filler' : 'paid', name: fd.get('name'), advertiser: fd.get('advertiser'), slots: getSel(), cats: getCats() || [], kind: fd.get('kind'), weight: +fd.get('weight'),
      creatives: cr.value(), link: fd.get('link'), alt: fd.get('alt'), html: fd.get('html'), status: fd.get('status'),
      pricing: fd.get('pricing') || 'cpm', start: fd.get('start') || '', end: fd.get('pricing') === 'daily' ? fd.get('end') || '' : '', max_impr: +(fd.get('max_impr') || 0), price: fd.get('price') ?? '' };
    const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = '⏳ جاري الحفظ…';
    try { await admApi('adm_ad_save', body); d.remove(); loadAds(); } catch (er) { err(er.message); btn.disabled = false; btn.textContent = '💾 حفظ'; } };
}
function slotForm(s) {
  const d = modal(`<h2>⚙️ ${esc(s.t)}</h2><p class="note">ترتيب الظهور: المعلنون المدفوعون أولاً، ثم كود الشبكة (إن وُجد)، ثم الإعلانات الرديفة، ثم ما تختاره هنا.</p>
    <form id="sf" class="frm"><label class="full">عند عدم وجود معلن<select name="mode"><option value="house">🧩 الإعلانات الرديفة، وإن لم توجد «أعلن هنا»</option><option value="html">🌐 كود شبكة إعلانية (SuperAwesome، AdinPlay…)</option><option value="off">🧩 الإعلانات الرديفة، وإن لم توجد تُخفى المساحة</option></select></label>
    <label class="full k-net">كود الشبكة (يُلصق كما أرسلته الشبكة، ويعمل داخل إطار معزول لا يستطيع تحويل صفحة الطفل)<textarea name="html" dir="ltr" rows="7">${esc(s.html)}</textarea></label>
    <div class="full"><button type="submit">💾 حفظ</button> <button type="button" class="sm" data-close>إلغاء</button></div></form>`);
  const f = d.querySelector('#sf'); f.mode.value = s.mode; const sync = () => (d.querySelector('.k-net').hidden = f.mode.value !== 'html'); f.mode.onchange = sync; sync();
  f.onsubmit = async (e) => { e.preventDefault(); try { await admApi('adm_slot_save', { slot: s.slot, mode: f.mode.value, html: f.html.value }); d.remove(); loadAds(); } catch (er) { alert(er.message); } };
}
