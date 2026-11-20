/* لعبة: G.bflank (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 1) اتجاه السهم (مستوحاة من Lost in Migration) */
G.bflank=(root,c)=>brainRounds(root,c,{total:c.fi(8,18),label:'إجابات صحيحة',round(area,i,done,api){
  const d=rnd(0,1),cg=Math.random()<c.f(.75,.3),n=c.lv<10?3:5,mid=(n-1)/2,tl=c.f(5,1.4);
  area.innerHTML=`<div class="br-msg">إلى أين يشير السهم في المنتصف؟</div><div class="fl-row" dir="ltr" style="transform:translate(${rnd(-30,30)}px,${rnd(-20,20)}px)">${[...Array(n)].map((_,k)=>`<span class="fl-a${k===mid?' mid':''}">${LDIR[k===mid||cg?d:1-d][2]}</span>`).join('')}</div>`;
  dirButtons(area,2,d,done,api);tlim(c,area,tl,done)}});
