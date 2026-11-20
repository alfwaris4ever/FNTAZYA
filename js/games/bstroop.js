/* لعبة: G.bstroop (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 2) ارتباك الألوان: هل معنى الكلمة يطابق لونها؟ */
G.bstroop=(root,c)=>{const C=COLORS.slice(0,c.fi(4,8)).filter(x=>x[0]!=='أسود');brainRounds(root,c,{total:c.fi(8,20),label:'إجابات صحيحة',round(area,i,done,api){
  const w=C[rnd(0,C.length-1)],match=Math.random()<.5,ink=match?w:shuffle(C.filter(x=>x!==w))[0],tl=c.f(6,1.7);
  area.innerHTML=`<div class="br-msg">هل معنى الكلمة يطابق لون كتابتها؟</div><div class="st-card"><span style="color:${ink[1]}">${w[0]}</span></div><div class="yn"><button class="yn-b yes">✔ نعم</button><button class="yn-b no">✖ لا</button></div>${timerBar(tl.toFixed(2))}`;
  let ans=false;const answer=y=>{if(ans)return;ans=true;const ok=y===match;area.querySelector(y?'.yes':'.no').classList.add(ok?'ok':'bad');done(ok)};
  area.querySelector('.yes').onclick=()=>answer(true);area.querySelector('.no').onclick=()=>answer(false);
  api.setKey(e=>{if(e.key==='ArrowRight'||e.key==='y')answer(true);if(e.key==='ArrowLeft'||e.key==='n')answer(false)});
  c.after(()=>{if(!ans){ans=true;area.querySelector('.br-msg').textContent='⏱️ انتهى الوقت!';done(false)}},tl*1000)}})};
