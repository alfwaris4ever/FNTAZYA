/* لعبة: G.snap (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 22) تحدي الموضة — مستوحاة من SnapStyle Dress Up */
const THEMES=[['🏖️','الشاطئ','b'],['❄️','الثلج','s'],['🎉','الحفلة','p'],['⚽','الرياضة','r'],['🏫','المدرسة','m'],['🌧️','المطر','w']];
const SNAP={head:[['👒','b'],['🧢','rm w'],['🎩','p'],['👑','p'],['🧣','s'],['🎓','m'],['🥽','s'],['⛑️','w'],['🕶️','b']],body:[['🩳','br'],['👕','rbm'],['🧥','sw'],['👗','p'],['👔','mp'],['🥋','r'],['👘','p'],['🦺','w']],
  feet:[['🩴','b'],['🥾','sw'],['👟','rm'],['👠','p'],['🥿','mp'],['🧦','s']],extra:[['☂️','w'],['🧤','s'],['🎒','m'],['⚽','r'],['🎁','p'],['🏐','b'],['🎈','p'],['🏀','r'],['📚','m'],['⛄','s'],['🌂','w'],['🐚','b']]};
const SNAP_T={head:'🎩 الرأس',body:'👕 الملابس',feet:'👟 القدم',extra:'🎒 إضافة'};
G.snap=(root,c)=>{
  const R=c.fi(2,5),nO=c.fi(3,5),tl=c.lv>=10?Math.round(R*c.f(26,13)):0;let r=0,got=0,pick={},opts={},theme,lock=false;const total=R*4,themes=shuffle(THEMES);
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">📸 <b class="rn">1</b> من ${R}</span><span class="pill">⭐ <b class="gt">0</b> من ${total}</span></div><div class="body"${tl?' style="bottom:36px"':''}><div class="sn-wrap"><div class="sn-model"></div><div class="sn-panel"><div class="sn-theme"></div><div class="sn-slots"></div><button class="play-btn sn-go">📸 صوّر الإطلالة</button></div></div></div>`;
  const q=s=>root.querySelector(s),wrap=q('.sn-wrap');
  function round(){theme=themes[r%themes.length];pick={};for(const s in SNAP){const good=shuffle(SNAP[s].filter(i=>i[1].includes(theme[2]))).slice(0,rnd(1,2)),bad=shuffle(SNAP[s].filter(i=>!i[1].includes(theme[2])));opts[s]=shuffle([...good,...bad.slice(0,nO-good.length)])}
    q('.rn').textContent=r+1;q('.sn-theme').innerHTML=`<span>${theme[0]}</span> المناسبة: <b>${theme[1]}</b>`;lock=false;draw()}
  function draw(mark){q('.sn-model').innerHTML=`<div class="sn-head">${pick.head||'⬜'}</div><div class="sn-face">🙂</div><div class="sn-body">${pick.body||'⬜'}</div><div class="sn-feet">${pick.feet||'⬜'}</div><div class="sn-extra">${pick.extra||''}</div>`;
    q('.sn-slots').innerHTML=Object.keys(SNAP).map(s=>`<div class="sn-row"><small>${SNAP_T[s]}</small><div>${opts[s].map(([e,t])=>`<button class="sn-i${pick[s]===e?' sel':''}${mark&&pick[s]===e?(t.includes(theme[2])?' good':' bad'):''}" data-s="${s}" data-e="${e}">${e}</button>`).join('')}</div></div>`).join('');
    q('.sn-slots').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(lock)return;pick[b.dataset.s]=b.dataset.e;beep(800,.04,'triangle',.07);draw()})}
  const res=()=>({got,total,label:'القطع المناسبة'});
  q('.sn-go').onclick=()=>{if(lock)return;if(Object.keys(SNAP).some(s=>!pick[s])){toast('اختر قطعة من كل صف 👆');sfx.bad();return}lock=true;
    const ok=Object.keys(SNAP).filter(s=>SNAP[s].find(i=>i[0]===pick[s])[1].includes(theme[2])).length;got+=ok;q('.gt').textContent=got;ok===4?sfx.good():sfx.bad();draw(true);
    c.after(()=>{r++;if(r>=R)return got===total?c.win(got*10,'كل إطلالاتك مثالية! 📸✨',{...res(),perfect:true}):got>=total/2?c.win(got*10,'إطلالات جميلة!',res()):c.lose('الإطلالات لم تناسب المناسبات',res());round()},1300)};
  function size(){const rr=wrap.parentElement.getBoundingClientRect();wrap.classList.toggle('land',rr.width>rr.height*1.05)}c.on(window,'resize',size);size();
  if(tl)c.timeBar(root,tl,()=>got>=total/2?c.win(got*10,'انتهى الوقت',res()):c.lose('انتهى الوقت',res()));round();
};
