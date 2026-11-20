/* لعبة: G.bseen (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 15) هل رأيته؟ */
G.bseen=(root,c)=>{const k=c.fi(4,10),set=shuffle(EMO),seen=set.slice(0,k),others=set.slice(k);
  brainRounds(root,c,{total:c.fi(6,14),label:'إجابات صحيحة',round(area,i,done,api){
    const ask=()=>{const old=Math.random()<.5,it=old?seen[rnd(0,k-1)]:others[rnd(0,others.length-1)];area.innerHTML=`<div class="br-msg">هل كان هذا من الأشياء التي حفظتها؟</div><div class="nb-card">${it}</div>`;ynRow(area,old,done,api);tlim(c,area,c.f(6,2),done)};
    if(i===0){area.innerHTML=`<div class="br-msg">احفظ هذه الأشياء جيداً 👀</div><div class="nw-grid">${seen.map(e=>`<span class="nw-c">${e}</span>`).join('')}</div>`;c.after(ask,Math.round(c.f(5000,2600)+k*350))}else ask()}})};
