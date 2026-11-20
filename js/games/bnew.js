/* لعبة: G.bnew (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 7) ما الجديد؟ */
G.bnew=(root,c)=>brainRounds(root,c,{total:c.fi(5,10),label:'إجابات صحيحة',round(area,i,done){
  const k=c.fi(3,10)+(i>3?1:0),set=shuffle(EMO).slice(0,k+1),nw=set[k],show=Math.round(c.f(3200,1600)+k*180);
  const grid=list=>`<div class="nw-grid">${list.map(e=>`<button class="nw-c">${e}</button>`).join('')}</div>`;
  area.innerHTML=`<div class="br-msg">احفظ هذه الأشياء 👀</div>${grid(shuffle(set.slice(0,k)))}`;
  c.after(()=>{area.innerHTML=`<div class="br-msg">ما الشيء الجديد الذي ظهر؟ 🆕</div>${grid(shuffle(set))}`;let f=false;
    area.querySelectorAll('.nw-c').forEach(b=>b.onclick=()=>{if(f)return;f=true;const ok=b.textContent===nw;b.classList.add(ok?'ok':'bad');if(!ok)[...area.querySelectorAll('.nw-c')].find(x=>x.textContent===nw).classList.add('ok');done(ok)})},show)}});
