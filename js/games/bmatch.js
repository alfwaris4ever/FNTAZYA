/* لعبة: G.bmatch (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 3) تطابق سريع: هل الشكل مثل الذي قبله؟ */
const NB=['🔺','🟦','⭐','🟢','❤️','🔷','🟨','🌙','🟣','🍀'];
G.bmatch=(root,c)=>{const back=c.lv<16?1:2,total=c.fi(8,18),pool=NB.slice(0,c.fi(3,8)),seq=[];
  for(let k=0;k<total+back;k++)seq.push(k>=back&&Math.random()<.45?seq[k-back]:pool[rnd(0,pool.length-1)]);
  const q=back===1?'هل يطابق الشكل السابق؟':'هل يطابق الشكل قبل السابق؟';
  brainRounds(root,c,{total,label:'إجابات صحيحة',round(area,i,done,api){
    const show=(item,txt)=>{area.innerHTML=`<div class="br-msg">${txt}</div><div class="nb-card">${item}</div><div class="yn"><button class="yn-b yes">✔ نعم</button><button class="yn-b no">✖ لا</button></div>`};
    const ask=()=>{show(seq[i+back],q);const match=seq[i+back]===seq[i];let ans=false;
      const answer=y=>{if(ans)return;ans=true;area.querySelector(y?'.yes':'.no').classList.add(y===match?'ok':'bad');done(y===match)};
      area.querySelector('.yes').onclick=()=>answer(true);area.querySelector('.no').onclick=()=>answer(false);
      api.setKey(e=>{if(e.key==='ArrowRight')answer(true);if(e.key==='ArrowLeft')answer(false)});
      /* شريط الوقت لكل سؤال: سهل 5 ثوانٍ، وسط 4، صعب 3. انتهاء الوقت يُحسب خطأ ويُظهر الإجابة الصحيحة */
      const T=[5,4,3][c.run.diff]||5;area.append(h(timerBar(T.toFixed(2))));c.after(()=>{if(ans)return;ans=true;area.querySelector(match?'.yes':'.no')?.classList.add('ok');area.querySelector('.br-msg').textContent='انتهى الوقت ⏰';done(false)},T*1000)};
    if(i===0){let k=0;const pre=()=>{if(k>=back)return ask();show(seq[k],'احفظ هذا الشكل 👀');area.querySelectorAll('.yn-b').forEach(b=>b.disabled=true);k++;c.after(pre,1300)};pre()}else ask()}})};
