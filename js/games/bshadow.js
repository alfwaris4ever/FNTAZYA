/* لعبة: G.bshadow (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 14) الظل المطابق */
const SHP=['🐘','🦒','🐪','🦏','🐄','🐎','🐇','🐿️','🦔','🐢','🦀','🐙','🦋','🐝','🐞','🦖','🦕','🐬','🐳','🦈','🐓','🦆','🦉','🐧','🐈','🐕','🦌','🐫'];
G.bshadow=(root,c)=>brainRounds(root,c,{total:c.fi(6,14),label:'إجابات صحيحة',round(area,i,done,api){
  const n=c.lv<8?3:c.lv<18?4:5,o=shuffle(SHP).slice(0,n),t=o[0],flip=c.lv>=20;
  area.innerHTML=`<div class="br-msg">أي ظل يطابق هذا الشكل؟</div><div class="nb-card">${t}</div>`;
  const row=chooseRow(area,shuffle(o),t,done,api,v=>`<span class="shd"${flip&&Math.random()<.5?' style="transform:scaleX(-1)"':''}>${v}</span>`,'shadows');tlim(c,area,c.f(9,3),done)}});
