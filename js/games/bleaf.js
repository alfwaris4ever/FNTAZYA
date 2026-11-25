/* لعبة: G.bleaf (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 3) الأوراق الذكية (مستوحاة من Ebb and Flow): أوراق بعدة ألوان، لكل لون إشارة وحركة خاصة، والسؤال عن اللون المكتوب به */
const LF_COLS=[['#4ade80','#86efac','#16a34a'],['#fb923c','#fdba74','#ea580c'],['#60a5fa','#93c5fd','#2563eb'],['#c084fc','#d8b4fe','#9333ea'],['#facc15','#fde68a','#ca8a04']];
G.bleaf=(root,c)=>{const four=c.lv>=14,nc=c.lv<10?3:c.lv<20?4:5;brainRounds(root,c,{total:c.fi(8,18),label:'إجابات صحيحة',round(area,i,done,api){
  const nd=four?4:2,cols=shuffle([...LF_COLS]).slice(0,nc),ang=k=>Math.atan2(LDIR[k][1],LDIR[k][0])*180/Math.PI,point=Math.random()<.5,tl=c.f(7,2.2);
  const groups=cols.map((col,g)=>({col,pt:rnd(0,nd-1),mv:rnd(0,nd-1),cnt:g===0?rnd(2,3):rnd(1,2)})),T=groups[0],ans=point?T.pt:T.mv;
  area.innerHTML=`<div class="br-msg"><span style="font-size:1.9em;font-weight:900;color:${T.col[0]}">${point?'إشارة':'حركة'}</span></div><div class="lf-box">${groups.map(G2=>`<div class="lf-move" style="--mx:${LDIR[G2.mv][0]*70}px;--my:${LDIR[G2.mv][1]*45}px">${[...Array(G2.cnt)].map(()=>`<span class="lf" style="background:linear-gradient(135deg,${G2.col[1]},${G2.col[2]});left:${rnd(12,85)}%;top:${rnd(15,80)}%"><i style="transform:rotate(${ang(G2.pt)}deg)">➜</i></span>`).join('')}</div>`).join('')}</div>`;
  dirButtons(area,nd,ans,done,api);tlim(c,area,tl,done)}})};
