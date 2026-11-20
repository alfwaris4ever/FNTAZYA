/* لعبة: G.bodd (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 6) الغريب بينهم: جد الشكل المختلف */
const ODD=[['🐶','🍎'],['⭐','🌙'],['🚗','✈️'],['🍎','🍅'],['🐶','🐱'],['😀','😃'],['🙂','🙃'],['🌲','🌳'],['🐻','🐼'],['🚗','🚙'],['🐟','🐠'],['🔵','🟣'],['😺','😸'],['🕐','🕑']];
G.bodd=(root,c)=>brainRounds(root,c,{total:c.fi(5,10),label:'إجابات صحيحة',round(area,i,done){
  const n=c.lv<5?3:c.lv<12?4:c.lv<20?5:c.lv<26?6:7,pi=Math.min(ODD.length-1,Math.floor(c.t*(ODD.length-2))+rnd(0,1)),pr=shuffle(ODD[pi]),odd=rnd(0,n*n-1),tl=c.f(12,4);
  area.innerHTML=`<div class="br-msg">جد الشكل المختلف 🔍</div><div class="od-grid" style="--n:${n}">${[...Array(n*n)].map((_,j)=>`<button class="od-c" data-j="${j}">${j===odd?pr[1]:pr[0]}</button>`).join('')}</div>${timerBar(tl.toFixed(1))}`;
  let ans=false;area.querySelectorAll('.od-c').forEach(b=>b.onclick=()=>{if(ans)return;ans=true;const ok=+b.dataset.j===odd;b.classList.add(ok?'ok':'bad');if(!ok)area.querySelector(`.od-c[data-j="${odd}"]`).classList.add('ok');done(ok)});
  c.after(()=>{if(!ans){ans=true;area.querySelector(`.od-c[data-j="${odd}"]`).classList.add('ok');done(false)}},tl*1000)}});
