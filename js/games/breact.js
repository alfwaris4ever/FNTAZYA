/* لعبة: G.breact (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 20) سرعة رد الفعل */
G.breact=(root,c)=>{const lim=Math.round(c.f(950,380));brainRounds(root,c,{total:c.fi(5,9),label:'ردود سريعة',extra:`<span class="pill">⏱️ الهدف: أقل من ${lim} ملّي ث</span>`,round(area,i,done,api){
  area.innerHTML=`<div class="br-msg">انتظر حتى يصير الزر أخضر… ثم اضغط بأسرع ما يمكن!</div><button class="go-btn wait rx">انتظر…</button><div class="rx-ms"></div>`;
  const b=area.querySelector('.go-btn'),ms=area.querySelector('.rx-ms');let t0=0,f=false;
  const tap=()=>{if(f)return;f=true;if(!t0){b.classList.add('bad');b.textContent='مبكّر! ✋';return done(false)}const rt=Math.round(performance.now()-t0);ms.textContent=`${rt} ملّي ثانية ${rt<=lim?'⚡':'🐢'}`;b.classList.add(rt<=lim?'ok':'bad');done(rt<=lim)};
  b.onpointerdown=tap;api.setKey(e=>{if(e.code==='Space'||e.key==='Enter')tap()});
  c.after(()=>{if(f)return;t0=performance.now();b.classList.remove('wait');b.classList.add('g');b.textContent='الآن! 👆';c.after(()=>{if(!f){f=true;b.classList.add('bad');done(false)}},2000)},rnd(900,2600))}})};
