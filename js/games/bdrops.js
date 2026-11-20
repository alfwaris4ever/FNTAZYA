/* لعبة: G.bdrops (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 2) قطرات الحساب (مستوحاة من Raindrops) */
G.bdrops=(root,c)=>{const goal=c.fi(6,20),fall=c.f(14,5.5),gapT=c.f(4.4,1.7),allow=c.lv<10?3:c.lv<20?2:1,ops=c.lv<8?['+']:c.lv<18?['+','−']:['+','−','×'],mx=c.fi(5,20);
  let solved=0,miss=0,drops=[],typed='',spT=.3;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">💧 <b class="sv">0</b> من ${goal}</span><span class="pill">❌ <b class="ms">0</b> من ${allow}</span></div><div class="body"><div class="rd-wrap"><div class="rd-sky"></div><div class="rd-water"></div><div class="rd-in" dir="ltr">؟</div><div class="dg-pad rd-pad" dir="ltr">${[1,2,3,4,5,6,7,8,9,'⌫',0,'C'].map(v=>`<button class="dg-k" data-v="${v}">${v}</button>`).join('')}</div></div></div>`;
  const sky=root.querySelector('.rd-sky'),inp=root.querySelector('.rd-in');
  function spawn(){const op=ops[rnd(0,ops.length-1)];let a,b,ans;if(op==='+'){a=rnd(1,mx);b=rnd(1,mx);ans=a+b}else if(op==='−'){a=rnd(2,mx+5);b=rnd(1,a);ans=a-b}else{a=rnd(2,6);b=rnd(2,6);ans=a*b}
    const el=h(`<div class="rd-drop" dir="ltr">${a} ${op} ${b}</div>`);el.style.left=rnd(8,72)+'%';sky.append(el);drops.push({el,ans,y:0})}
  c.every(()=>{spT-=.05;if(spT<=0&&drops.length<(c.lv<10?2:3)){spawn();spT=gapT}
    drops.forEach(d=>{d.y+=.05/fall;d.el.style.top=`calc(${d.y*100}% - ${d.y*50}px)`;if(d.y>=1&&!d.gone){d.gone=1;d.el.classList.add('splash');setTimeout(()=>d.el.remove(),300);miss++;root.querySelector('.ms').textContent=miss;sfx.bad();
      if(miss>allow)c.lose('سقطت قطرات كثيرة في الماء!',{got:solved,total:goal,label:'المسائل'})}});drops=drops.filter(d=>!d.gone)},50);
  const press=v=>{if(v==='C'){typed=''}else if(v==='⌫'){typed=typed.slice(0,-1)}else{typed+=v;beep(620,.03,'triangle',.05)}inp.textContent=typed||'؟';
    const hit=drops.find(d=>!d.gone&&String(d.ans)===typed);if(hit){hit.gone=1;const r=hit.el.getBoundingClientRect();FX.lastTap={x:r.left+r.width/2,y:r.top+r.height/2,t:performance.now()};hit.el.classList.add('pop');setTimeout(()=>hit.el.remove(),250);
      solved++;root.querySelector('.sv').textContent=solved;typed='';inp.textContent='؟';sfx.good();if(solved>=goal)c.after(()=>c.win(solved*15+(allow-miss)*20,'حللت كل القطرات! 💧',{got:goal,total:goal,perfect:miss===0,label:'مسائل بدون سقوط'}),300)}
    else if(typed&&!drops.some(d=>!d.gone&&String(d.ans).startsWith(typed))){inp.classList.remove('bad');void inp.offsetWidth;inp.classList.add('bad');typed=''}};
  root.querySelectorAll('.dg-k').forEach(b=>b.onclick=()=>press(b.dataset.v));c.on(window,'keydown',e=>{if(c.paused)return;if(/^[0-9]$/.test(e.key))press(e.key);else if(e.key==='Backspace')press('⌫')})};
