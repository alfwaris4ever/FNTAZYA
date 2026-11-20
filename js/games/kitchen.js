/* لعبة: G.kitchen (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- مطبخ الصغار: حضّر البيتزا حسب الطلب ---- */
const TOPS=['🍅','🧀','🍄','🫒','🌶️','🍍','🌽','🧅'];
G.kitchen=(root,c)=>{
  const orders=c.fi(3,8),kinds=Math.min(TOPS.length,c.fi(2,6)),maxCnt=c.fi(2,4),secs=Math.round(orders*c.f(26,12)+6);let done=0,mist=0,order,pz={};
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🍕 <b class="od">0</b> من ${orders}</span><span class="pill">❌ <b class="ms">0</b></span></div>
  <div class="body" style="bottom:36px"><div class="kt-wrap"><div class="kt-order"><div class="kt-cust">🧒</div><div class="kt-bub"></div></div><div class="kt-pizza"><div class="kt-base"></div></div><div class="kt-tops"></div>
  <div class="kt-acts"><button class="play-btn alt kt-clear">🗑️ من جديد</button><button class="play-btn kt-serve">🍽️ قدّم</button></div></div></div>`;
  const bub=root.querySelector('.kt-bub'),base=root.querySelector('.kt-base'),cust=root.querySelector('.kt-cust');
  const pool=TOPS.slice(0,Math.max(kinds+1,Math.min(TOPS.length,kinds+2)));
  function newOrder(){order={};const ks=shuffle(pool).slice(0,rnd(Math.max(1,kinds-2),kinds));ks.forEach(k=>order[k]=rnd(1,maxCnt));pz={};base.innerHTML='';cust.textContent=['🧒','👧','👦','🧑','👩'][rnd(0,4)];renderOrder()}
  function renderOrder(){bub.innerHTML=Object.entries(order).map(([k,n])=>`<span class="kt-it${(pz[k]||0)===n?' ok':''}">${k}<b>×${n}</b><i>${pz[k]||0}</i></span>`).join('')}
  pool.forEach(k=>{const b=h(`<button class="kt-tb">${k}</button>`);b.onclick=()=>{pz[k]=(pz[k]||0)+1;const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*38;const s=h(`<span class="kt-top">${k}</span>`);s.style.left=50+Math.cos(a)*r+'%';s.style.top=50+Math.sin(a)*r+'%';base.append(s);beep(560,.04,'triangle',.06);renderOrder()};root.querySelector('.kt-tops').append(b)});
  root.querySelector('.kt-clear').onclick=()=>{pz={};base.innerHTML='';renderOrder();sfx.pop()};
  root.querySelector('.kt-serve').onclick=()=>{const ok=Object.keys({...order,...pz}).every(k=>(order[k]||0)===(pz[k]||0));
    if(ok){done++;root.querySelector('.od').textContent=done;sfx.good();cust.textContent='😋';if(done>=orders)return c.after(()=>c.win(done*40+Math.round(tb.left())*2-mist*10,mist?'جهّزت كل الطلبات!':'كل الطلبات صحيحة! 👨‍🍳',{got:orders-Math.min(orders,mist),total:orders,perfect:mist===0,label:'طلبات بدون أخطاء'}),600);c.after(newOrder,700)}
    else{mist++;root.querySelector('.ms').textContent=mist;sfx.bad();cust.textContent='🤨';c.after(()=>cust.textContent='🧒',700)}};
  const tb=c.timeBar(root,secs,()=>c.lose('انتهى الوقت!',{got:done,total:orders,label:'الطلبات'}));
  newOrder();
};
