/* لعبة: G.bsize (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 17) رتّب بالحجم */
G.bsize=(root,c)=>brainRounds(root,c,{total:c.fi(5,10),label:'ترتيبات صحيحة',round(area,i,done){
  const k=c.fi(3,6),step=c.f(16,5),e=EMO[rnd(0,EMO.length-1)],base=36,sizes=shuffle([...Array(k)].map((_,j)=>base+j*step));const order=[...sizes].sort((a,b)=>a-b);let t=0,f=false;
  area.innerHTML=`<div class="br-msg">المس من <u>الأصغر</u> إلى <u>الأكبر</u> 👆</div><div class="sz-row">${sizes.map(s=>`<button class="sz-b" data-s="${s}" style="font-size:${s}px">${e}</button>`).join('')}</div>`;
  area.querySelectorAll('.sz-b').forEach(b=>b.onclick=()=>{if(f||b.classList.contains('ok'))return;if(+b.dataset.s===order[t]){b.classList.add('ok');b.dataset.n=t+1;t++;beep(400+t*60,.05,'triangle',.07);if(t===k){f=true;done(true)}}else{f=true;b.classList.add('bad');done(false)}});tlim(c,area,c.f(12,4),done)}});
