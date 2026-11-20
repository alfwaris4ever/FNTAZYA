/* لعبة: G.btreasure (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 8) كنوز البحر (مستوحاة من Tidal Treasures) */
G.btreasure=(root,c)=>{const N=c.fi(4,13),allow=c.lv<10?2:c.lv<20?1:0,items=shuffle(['🐚','🦀','⭐','🐠','🐙','🦑','💎','🪸','🐡','🦞','🐢','🦭','🧜','⚓','🏺']).slice(0,N);let got=new Set(),mist=0;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">💎 <b class="gt">0</b> من ${N}</span><span class="pill">❌ <b class="ms">0</b> من ${allow}</span></div><div class="body"><div class="br-area"><div class="br-msg">اختر كنزاً <u>لم تختره من قبل</u> 🧠</div><div class="tr-pool"></div></div></div>`;
  const pool=root.querySelector('.tr-pool');
  function lay(){pool.innerHTML='';const P=[];shuffle(items).forEach(e=>{let p;for(let t=0;t<50;t++){p=[rnd(8,92),rnd(12,88)];if(P.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>14))break}P.push(p);
    const b=h(`<button class="tr-it" style="left:${p[0]}%;top:${p[1]}%">${e}</button>`);b.onclick=()=>pick(e,b);pool.append(b)})}
  function pick(e,b){if(got.has(e)){mist++;root.querySelector('.ms').textContent=mist;b.classList.add('bad');sfx.bad();if(mist>allow)return c.lose('اخترت كنزاً مكرراً كثيراً!',{got:got.size,total:N,label:'الكنوز'});return}
    got.add(e);root.querySelector('.gt').textContent=got.size;b.classList.add('ok');sfx.good();
    if(got.size===N)return c.after(()=>c.win(N*15+(allow-mist)*20,'جمعت كل الكنوز بدون تكرار! 💎',{got:N,total:N,perfect:mist===0,label:'الكنوز'}),500);
    pool.classList.add('tide');c.after(()=>{pool.classList.remove('tide');lay()},450)}
  lay()};
