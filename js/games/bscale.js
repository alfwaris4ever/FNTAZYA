/* لعبة: G.bscale (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 10) الميزان */
const SCF=['🍎','🍐','🍓','🍊','🍋','🍇','🍌','🍒'];
G.bscale=(root,c)=>brainRounds(root,c,{total:c.fi(5,10),label:'إجابات صحيحة',round(area,i,done,api){
  const F=shuffle(SCF),two=c.lv>=10,n=rnd(2,c.lv<5?3:4),m=rnd(2,3),k=c.lv<5?1:rnd(1,3);
  const eq=(a,b,cnt)=>`<div class="sc-eq"><span class="pan">${a}</span><span class="bal">⚖️</span><span class="pan">${b.repeat(cnt)}</span></div>`;
  let html=eq(F[0],F[1],n),ans=n*k,q=`${F[0].repeat(k)} = ؟ ${F[1]}`;if(two){html+=eq(F[1],F[2],m);ans=n*m*k;q=`${F[0].repeat(k)} = ؟ ${F[2]}`}
  area.innerHTML=`<div class="br-msg">انظر للميزان واستنتج ⚖️</div><div class="sc-box">${html}</div><div class="sc-q" dir="ltr">${q}</div>`;
  chooseRow(area,nearOpts(ans,4,1),ans,done,api);tlim(c,area,c.f(22,9),done)}});
