/* لعبة: G.bleaf (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 3) الأوراق الذكية (مستوحاة من Ebb and Flow) */
G.bleaf=(root,c)=>{const four=c.lv>=14;brainRounds(root,c,{total:c.fi(8,18),label:'إجابات صحيحة',round(area,i,done,api){
  const nd=four?4:2,pt=rnd(0,nd-1),mv=rnd(0,nd-1),green=Math.random()<.5,ans=green?pt:mv,tl=c.f(7,2.2),ang=k=>Math.atan2(LDIR[k][1],LDIR[k][0])*180/Math.PI;
  area.innerHTML=`<div class="br-msg"><span style="font-size:1.9em;font-weight:900;color:${green?'#4ade80':'#fb923c'}">${green?'إشارة':'حركة'}</span></div><div class="lf-box"><div class="lf-move" style="--mx:${LDIR[mv][0]*70}px;--my:${LDIR[mv][1]*45}px">${[...Array(c.fi(3,8))].map(()=>`<span class="lf ${green?'g':'o'}" style="left:${rnd(12,80)}%;top:${rnd(15,75)}%"><i style="transform:rotate(${ang(pt)}deg)">➜</i></span>`).join('')}</div></div>`;
  dirButtons(area,nd,ans,done,api);tlim(c,area,tl,done)}})};
