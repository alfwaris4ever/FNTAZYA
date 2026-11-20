/* لعبة: G.bcode (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 12) فك الشفرة (رموز وأرقام) */
G.bcode=(root,c)=>{const k=c.fi(4,9),sym=shuffle(['🔺','⭐','🌙','❤️','🔷','🍀','☀️','⚡','🎵','🔔']).slice(0,k);
  brainRounds(root,c,{total:c.fi(8,20),label:'رموز صحيحة',round(area,i,done,api){const s=rnd(0,k-1);
    area.innerHTML=`<div class="cd-key" dir="ltr">${sym.map((e,j)=>`<span><b>${e}</b><i>${j+1}</i></span>`).join('')}</div><div class="br-msg">ما رقم هذا الرمز؟</div><div class="nb-card">${sym[s]}</div>`;
    chooseRow(area,[...Array(k)].map((_,j)=>j+1),s+1,done,api,v=>v,'digits');tlim(c,area,c.f(7,1.8),done)}})};
