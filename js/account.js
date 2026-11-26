/* فنتازيا: حساب اللاعب (اختياري). اللعب متاح للجميع بدون حساب، والحساب يحفظ التقدّم على الخادم ويقترح ألعاباً مناسبة.
   يُحمَّل بعد app.js. لا يعمل الاتصال بالخادم عند فتح الملف محلياً (file://)، والموقع يبقى يعمل عادياً. */
const ACC={api:'api/index.php',online:location.protocol.startsWith('http'),
  get token(){try{return localStorage.getItem('fz:token')||''}catch{return ''}},
  set token(v){try{v?localStorage.setItem('fz:token',v):localStorage.removeItem('fz:token')}catch{}},
  get user(){try{return JSON.parse(localStorage.getItem('fz:user')||'null')}catch{return null}},
  set user(v){try{v?localStorage.setItem('fz:user',JSON.stringify(v)):localStorage.removeItem('fz:user')}catch{}},
  queue:[],syncT:0,applying:false};
const AVATARS=['🦁','🐼','🦊','🐯','🐨','🐸','🐵','🦄','🐲','🐙','🦖','🐧','🚀','⚽','🎮','👑'];

async function accCall(a,data={},auth=false){
  if(!ACC.online)throw new Error('الحساب يعمل على الموقع فقط');
  const r=await fetch(`${ACC.api}?a=${a}`,{method:'POST',headers:{'Content-Type':'application/json',...(auth&&ACC.token?{Authorization:'Bearer '+ACC.token}:{})},body:JSON.stringify(data)});
  let j;try{j=await r.json()}catch{throw new Error('الخادم لا يستجيب حالياً، جرّب بعد قليل')}
  if(r.status===401&&auth){ACC.token='';ACC.user=null;renderAccBtn()}
  if(!j.ok)throw new Error(j.error||'حدث خطأ');return j}

/* كل تقدّم اللاعب محفوظ في localStorage بمفاتيح تبدأ بـ marah: */
function localProgress(){const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('marah:')){try{o[k.slice(6)]=JSON.parse(localStorage.getItem(k))}catch{}}}}catch{}return o}
function applyProgress(p){let changed=false;ACC.applying=true;try{for(const[k,v]of Object.entries(p||{})){const cur=localStorage.getItem('marah:'+k),nv=JSON.stringify(v);if(cur!==nv){localStorage.setItem('marah:'+k,nv);changed=true}}}catch{}ACC.applying=false;return changed}

/* مزامنة تلقائية بعد أي حفظ، مع تأخير بسيط لتجميع التغييرات */
{const set0=store.set;store.set=function(k,v){set0.call(store,k,v);if(!ACC.applying&&ACC.token&&ACC.online){clearTimeout(ACC.syncT);ACC.syncT=setTimeout(accSync,2500)}}}
async function accSync(){if(!ACC.token)return;try{const j=await accCall('sync',{progress:localProgress()},true);ACC.user=j.user;applyProgress(j.progress)}catch(e){}}
function accLog(ev){if(!ACC.token||!ACC.online)return;ACC.queue.push({...ev,ts:Math.floor(Date.now()/1000)});clearTimeout(ACC.evT);ACC.evT=setTimeout(accFlush,3000)}
async function accFlush(){if(!ACC.queue.length||!ACC.token)return;const evs=ACC.queue.splice(0,50);try{await accCall('events',{events:evs},true)}catch(e){}}
addEventListener('pagehide',()=>{if(ACC.token&&ACC.online&&ACC.queue.length){try{navigator.sendBeacon(`${ACC.api}?a=events`,new Blob([JSON.stringify({token:ACC.token,events:ACC.queue})],{type:'application/json'}))}catch{}}});

/* تسجيل الأحداث + عدّاد المراحل المكتملة للزائر (لإظهار رسالة التشجيع) */
{const sd=stageDone,go=gameOver,og=openGame;
  window.stageDone=function(g,run,score,msg,res){const r=sd.apply(this,arguments);try{accLog({kind:'stage',game:g.id,cat:g.cat,diff:run.diff,stage:run.stage,ok:!!res?.perfect,got:res?.got,total:res?.total,score});
      if(!ACC.token){const n=store.get('acc:wins',0)+1;store.set('acc:wins',n);if(n===3||(n>3&&n%8===0))setTimeout(()=>accNudge(),2200)}}catch(e){}return r};
  window.gameOver=function(g,run,msg,res){const r=go.apply(this,arguments);try{accLog({kind:'lose',game:g.id,cat:g.cat,diff:run.diff,stage:run.stage,ok:false,got:res?.got,total:res?.total})}catch(e){}return r};
  window.openGame=function(g){const r=og.apply(this,arguments);try{accLog({kind:'play',game:g.id,cat:g.cat})}catch(e){}return r}}

/* ---------- الاقتراحات: حسب التصنيفات التي يلعبها أكثر ---------- */
function playedIds(){const p=localProgress(),s=new Set(Array.isArray(p.recent)?p.recent:[]);for(const k of Object.keys(p)){const m=k.match(/^(?:unl|fin|best|tut):([\w-]+)/);if(m)s.add(m[1])}return [...s].filter(id=>GAMES.some(g=>g.id===id))}
function catScores(){const sc={};for(const id of playedIds()){const g=GAMES.find(x=>x.id===id);sc[g.cat]=(sc[g.cat]||0)+1+progressOf(id)/5}return sc}
function progressOf(id){let n=0;for(let d=0;d<DIFFS.length;d++)n+=progress(id,d);return n}
function recommended(n=6){const played=new Set(playedIds()),sc=catScores(),cats=Object.keys(sc).sort((a,b)=>sc[b]-sc[a]);if(!cats.length)return[];
  const pool=GAMES.filter(g=>!played.has(g.id));const out=[];for(const c of cats)for(const g of pool)if(g.cat===c&&out.length<n&&!out.includes(g))out.push(g);
  for(const g of pool)if(out.length<n&&!out.includes(g))out.push(g);return out}
function topCatName(){const sc=catScores(),k=Object.keys(sc).sort((a,b)=>sc[b]-sc[a])[0];return k&&CATS[k]?CATS[k]:null}

/* على الصفحة الرئيسية: تُقدَّم الألعاب المقترحة إلى أول الشبكة بشارة «يناسبك» */
{const sh=showHome;window.showHome=function(cat){const r=sh.apply(this,arguments);try{if(!cat)markRecommended()}catch(e){}return r}}
function markRecommended(){const recs=recommended(4);if(!recs.length)return;const grid=$('#grid'),anchor=grid.querySelector('.cat-bar')||grid.querySelector('.logo-card');let after=anchor;
  for(const g of recs){const t=grid.querySelector(`a.tile[href="#/play/${g.id}"]`);if(!t)continue;t.querySelector('.badge')?.remove();t.querySelector('.rec-ribbon')?.remove();t.insertAdjacentHTML('beforeend','<span class="rec-ribbon" aria-label="يناسبك"><b>يناسبك ⭐</b></span>');after.after(t);after=t}}

/* ---------- الواجهة ---------- */
function renderAccBtn(){let b=$('#accBtn');if(!b){const box=$('.logo-actions');if(!box)return;b=h('<button class="icon-btn acc-btn" id="accBtn"></button>');box.append(b);b.onclick=()=>ACC.token?openDashboard():openAuth()}
  const u=ACC.user;b.textContent=ACC.token&&u?u.avatar:'👤';b.title=ACC.token&&u?`حسابي: ${u.name}`:'سجّل لتحفظ تقدّمك';b.setAttribute('aria-label',b.title);b.classList.toggle('in',!!ACC.token)}
function accModal(html){$('.acc-ov')?.remove();const ov=h(`<div class="acc-ov" role="dialog" aria-modal="true"><div class="acc-card"><button class="acc-x" aria-label="إغلاق">✕</button>${html}</div></div>`);
  ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('.acc-x'))ov.remove()});document.body.append(ov);return ov}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function accNudge(){if(ACC.token||$('.acc-ov')||!ACC.online)return;const last=store.get('acc:nudged',0);if(Date.now()-last<3*86400e3)return;store.set('acc:nudged',Date.now());
  const ov=accModal(`<div class="acc-hero">⭐</div><h2>أحسنت! تقدّمك رائع</h2><p>اعمل حساباً <b>مجانياً</b> في 10 ثوانٍ لتحفظ مراحلك وتكمل من أي جهاز، وتحصل على ألعاب مقترحة تناسبك.</p>
    <div class="acc-perks"><span>💾 حفظ المراحل</span><span>📱 العب من أي جهاز</span><span>✨ ألعاب تناسبك</span></div>
    <div class="acc-btns"><button class="play-btn" data-go>👤 اعمل حسابي</button><button class="play-btn alt" data-later>لاحقاً</button></div><small class="acc-note">الحساب اختياري، واللعب بدون حساب متاح دائماً.</small>`);
  ov.querySelector('[data-go]').onclick=()=>openAuth();ov.querySelector('[data-later]').onclick=()=>ov.remove();centerOnStage(ov)}
/* على الكمبيوتر: نضع النافذة في منتصف شاشة اللعبة (طولاً وعرضاً) بدل منتصف الصفحة */
function centerOnStage(ov){const st=$('#stage'),vg=$('#view-game');if(!st||!vg||vg.hidden)return;
  const fit=()=>{if(!ov.isConnected)return removeEventListener('resize',fit);
    if(innerWidth<1024){ov.style.padding='';return}
    const r=st.getBoundingClientRect(),t=Math.max(14,r.top),b=Math.max(14,innerHeight-Math.min(innerHeight,r.bottom)),l=Math.max(14,r.left),rt=Math.max(14,innerWidth-r.right);
    if(innerHeight-t-b<ov.querySelector('.acc-card').offsetHeight+10){ov.style.padding='';return} // شاشة اللعبة أقصر من النافذة: نعود لمنتصف الصفحة
    ov.style.padding=`${t}px ${rt}px ${b}px ${l}px`};
  fit();addEventListener('resize',fit)}

function openAuth(mode='new'){if(!ACC.online)return toast('الحساب يعمل على الموقع fntazya.com');let av=AVATARS[0];
  const ov=accModal(`<div class="acc-tabs"><button data-m="new">✨ حساب جديد</button><button data-m="in">🔑 عندي حساب</button></div><form class="acc-form" novalidate>
    <label class="f-new">اسم البطل (يظهر في اللعبة)<input name="name" maxlength="20" placeholder="مثلاً: سارة الذكية" autocomplete="nickname"></label>
    <div class="f-new"><span class="acc-lbl">اختر صورتك</span><div class="av-pick">${AVATARS.map((a,i)=>`<button type="button" class="av${i?'':' on'}" data-a="${a}">${a}</button>`).join('')}</div></div>
    <label>بريد ولي الأمر<input name="email" type="email" inputmode="email" dir="ltr" placeholder="name@example.com" autocomplete="email" required></label>
    <label><span class="f-new">اختر رمزاً من 4 أرقام</span><span class="f-in">الرمز (4 أرقام)</span><input name="pin" inputmode="numeric" pattern="\\d{4}" maxlength="4" dir="ltr" class="pin" placeholder="••••" autocomplete="off" required></label>
    <label class="f-new chk"><input type="checkbox" name="marketing"> أرغب (ولي الأمر) باستلام جديد الألعاب على البريد</label>
    <div class="acc-err" role="alert"></div>
    <button class="play-btn acc-submit" type="submit"></button>
    <button type="button" class="acc-link f-in" data-forgot>نسيت الرمز؟</button>
    <small class="acc-note">🔒 البريد لولي الأمر، ونستخدمه فقط لحفظ التقدّم واقتراح الألعاب، ولا نشاركه مع أحد. لا نرسل رسائل تأكيد.</small></form>`);
  const f=ov.querySelector('form'),err=ov.querySelector('.acc-err');
  const setMode=m=>{mode=m;ov.querySelectorAll('.acc-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));ov.querySelectorAll('.f-new').forEach(e=>e.hidden=m!=='new');ov.querySelectorAll('.f-in').forEach(e=>e.hidden=m!=='in');
    f.querySelector('.acc-submit').textContent=m==='new'?'💾 احفظ تقدّمي':'▶ دخول';err.textContent=''};
  ov.querySelectorAll('.acc-tabs button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));setMode(mode);
  ov.querySelectorAll('.av').forEach(b=>b.onclick=()=>{av=b.dataset.a;ov.querySelectorAll('.av').forEach(x=>x.classList.toggle('on',x===b))});
  f.pin.addEventListener('input',()=>{f.pin.value=f.pin.value.replace(/\D/g,'').slice(0,4)});
  ov.querySelector('[data-forgot]').onclick=async()=>{const email=f.email.value.trim();if(!email)return err.textContent='اكتب البريد أولاً';
    try{await accCall('forgot',{email});err.className='acc-err good';err.textContent='إذا كان البريد مسجّلاً فسيصله رمز جديد خلال دقائق (افحص الرسائل غير المرغوبة).'}catch(e){err.className='acc-err';err.textContent=e.message}};
  f.onsubmit=async e=>{e.preventDefault();err.className='acc-err';err.textContent='';const email=f.email.value.trim(),pin=f.pin.value;
    if(!/^\S+@\S+\.\S+$/.test(email))return err.textContent='اكتب بريداً صحيحاً';if(!/^\d{4}$/.test(pin))return err.textContent='الرمز لازم يكون 4 أرقام';
    const btn=f.querySelector('.acc-submit');btn.disabled=true;
    try{const j=mode==='new'?await accCall('register',{email,pin,name:f.name.value,avatar:av,marketing:f.marketing.checked,progress:localProgress()}):await accCall('login',{email,pin,progress:localProgress()});
      ACC.token=j.token;ACC.user=j.user;applyProgress(j.progress);ov.remove();sfx.win?.();toast(mode==='new'?`أهلاً ${esc(j.user.name)}! تقدّمك صار محفوظاً 💾`:`أهلاً بعودتك يا ${esc(j.user.name)} 👋`);
      setTimeout(()=>location.reload(),900)}
    catch(e2){err.textContent=e2.message;btn.disabled=false}};
  setTimeout(()=>f.querySelector(mode==='new'?'[name=name]':'[name=email]')?.focus(),60)}

function openDashboard(){const u=ACC.user||{};let stars=0,stages=0,trophies=0;const per=[];
  for(const g of GAMES){let p=0;for(let d=0;d<DIFFS.length;d++){const n=progress(g.id,d);p+=n;if(isDone(g.id,d))trophies++}if(p){per.push([g,p]);stages+=p}}
  stars=stages*3;const sc=catScores(),tot=Object.values(sc).reduce((a,b)=>a+b,0)||1,cats=Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const recent=(store.get('recent',[])||[]).map(id=>GAMES.find(g=>g.id===id)).filter(Boolean).slice(0,6),recs=recommended(6),tc=topCatName();
  const mini=g=>`<a class="acc-g" href="#/play/${g.id}"><img src="thumbs/${g.id}.webp" alt="" loading="lazy" onerror="this.remove()"><span>${esc(g.t)}</span></a>`;
  const ov=accModal(`<div class="acc-me"><span class="acc-av">${esc(u.avatar||'🦁')}</span><div><h2>${esc(u.name||'بطل فنتازيا')}</h2><small dir="ltr">${esc(u.email||'')}</small></div></div>
    <div class="acc-stats"><div><b>${stages}</b><span>مرحلة مكتملة</span></div><div><b>⭐ ${stars}</b><span>نجمة</span></div><div><b>🏆 ${trophies}</b><span>مستوى كامل</span></div><div><b>${per.length}</b><span>لعبة جرّبتها</span></div></div>
    ${recent.length?`<h3>▶ كمّل من حيث وقفت</h3><div class="acc-row">${recent.map(mini).join('')}</div>`:''}
    ${cats.length?`<h3>💪 نقاط قوتك</h3><div class="acc-bars">${cats.map(([k,v])=>`<div><span>${CATS[k]?.e||''} ${esc(CATS[k]?.t||k)}</span><i style="--w:${Math.round(v/tot*100)}%;--c1:${CATS[k]?.c[0]||'#6366f1'};--c2:${CATS[k]?.c[1]||'#a5b4fc'}"></i></div>`).join('')}</div>`:''}
    ${recs.length?`<h3>✨ مقترحة لك${tc?` لأنك تحب ${esc(tc.t)}`:''}</h3><div class="acc-row">${recs.map(mini).join('')}</div>`:''}
    <label class="acc-mk"><input type="checkbox" data-mk${u.marketing?' checked':''}> 📬 استلام جديد الألعاب على بريد ولي الأمر</label>
    <div class="acc-btns small">${u.admin?'<a class="play-btn" href="admin.html">📊 لوحة الإدارة</a>':''}${u.advertiser?'<a class="play-btn" href="advertiser.html">📢 بوابة المعلنين</a>':''}<button class="play-btn alt" data-pin>🔑 تغيير الرمز</button><button class="play-btn alt" data-out>🚪 خروج</button></div>
    <button class="acc-link danger" data-del>حذف الحساب وبياناته</button>`);
  ov.querySelectorAll('.acc-g').forEach(a=>a.addEventListener('click',()=>ov.remove()));
  ov.querySelector('[data-out]').onclick=async()=>{await accFlush();try{await accCall('logout',{},true)}catch{}ACC.token='';ACC.user=null;ov.remove();renderAccBtn();toast('سجّلت الخروج. تقدّمك محفوظ في حسابك 👋')};
  ov.querySelector('[data-mk]').onchange=async e=>{try{const j=await accCall('update',{name:u.name,avatar:u.avatar,marketing:e.target.checked},true);ACC.user=j.user;toast(e.target.checked?'تم التفعيل 📬':'تم إيقاف الرسائل')}catch(er){e.target.checked=!e.target.checked;toast(er.message)}};
  ov.querySelector('[data-pin]').onclick=async()=>{const p=prompt('اكتب الرمز الجديد (4 أرقام)');if(p==null)return;if(!/^\d{4}$/.test(p.trim()))return toast('الرمز لازم يكون 4 أرقام');try{await accCall('setpin',{pin:p.trim()},true);toast('تم تغيير الرمز 🔑')}catch(e){toast(e.message)}};
  ov.querySelector('[data-del]').onclick=async()=>{if(!confirm('متأكد؟ سيُحذف الحساب وكل بياناته من الخادم (يبقى التقدّم على هذا الجهاز فقط).'))return;try{await accCall('delete',{},true);ACC.token='';ACC.user=null;ov.remove();renderAccBtn();toast('تم حذف الحساب')}catch(e){toast(e.message)}}}

/* شريط صغير أعلى الصفحة للزائر بعد أن يلعب قليلاً */
function accBanner(){if(ACC.token||!ACC.online||store.get('acc:wins',0)<1||store.get('acc:bannerX',0)>Date.now()||$('.acc-banner'))return;
  const b=h(`<div class="acc-banner"><span>💾 تقدّمك محفوظ على هذا الجهاز فقط. <b>اعمل حساباً مجانياً</b> لتحفظه وتكمل من أي جهاز (اختياري).</span><button class="acc-b-go">اعمل حسابي</button><button class="acc-b-x" aria-label="إخفاء">✕</button></div>`);
  b.querySelector('.acc-b-go').onclick=()=>openAuth();b.querySelector('.acc-b-x').onclick=()=>{store.set('acc:bannerX',Date.now()+7*86400e3);b.remove()};$('#view-home')?.prepend(b)}

renderAccBtn();accBanner();try{if(!location.hash||location.hash==='#/')markRecommended()}catch(e){}
if(ACC.token&&ACC.online)accCall('sync',{progress:localProgress()},true).then(j=>{ACC.user=j.user;renderAccBtn();if(applyProgress(j.progress)&&!cur)route()}).catch(()=>{});
