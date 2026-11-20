/* لعبة: G.bshift (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 18) تبديل المهام (مستوحاة من Brain Shift) */
const FLY=['🦅','🐦','🦋','🐝','🦉','🦜','🕊️'],NOFLY=['🐢','🐄','🐶','🐍','🐘','🐌','🐟'];
G.bshift=(root,c)=>brainRounds(root,c,{total:c.fi(8,18),label:'إجابات صحيحة',round(area,i,done,api){
  const top=Math.random()<.5,num=rnd(1,9),fly=Math.random()<.5,an=fly?FLY[rnd(0,6)]:NOFLY[rnd(0,6)],match=top?num%2===0:fly;
  area.innerHTML=`<div class="sh-frame"><div class="sh-half t${top?' act':''}"><small>أعلى: هل العدد <b>زوجي</b>؟</small>${top?`<div class="sh-card">${num} ${an}</div>`:''}</div><div class="sh-half b${top?'':' act'}"><small>أسفل: هل الحيوان <b>يطير</b>؟</small>${top?'':`<div class="sh-card">${num} ${an}</div>`}</div></div>`;
  ynRow(area,match,done,api);tlim(c,area,c.f(7,2),done)}});
