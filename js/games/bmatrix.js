/* لعبة: G.bmatrix (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 1) مصفوفة الذاكرة: احفظ المربعات المضيئة */
G.bmatrix=(root,c)=>brainRounds(root,c,{total:c.fi(5,10),label:'جولات صحيحة',round(area,i,done){
  const n=c.lv<6?3:c.lv<14?4:c.lv<23?5:6,k=Math.min(n*n-2,c.fi(3,11)+Math.floor(i/4)),show=Math.round(c.f(1700,850)+k*90),cells=shuffle([...Array(n*n).keys()]).slice(0,k);
  area.innerHTML=`<div class="br-msg">احفظ أماكن المربعات المضيئة 👀</div><div class="mx" style="--n:${n}">${[...Array(n*n)].map((_,j)=>`<button class="mx-c${cells.includes(j)?' on':''}" data-j="${j}" aria-label="مربع"></button>`).join('')}</div>`;
  const msg=area.querySelector('.br-msg');let found=0,over=false,live=false;
  c.after(()=>{area.querySelectorAll('.mx-c.on').forEach(e=>e.classList.remove('on'));msg.textContent=`المس المربعات الـ${k} 👆`;live=true},show);
  area.querySelectorAll('.mx-c').forEach(b=>b.onclick=()=>{if(!live||over||b.classList.contains('hit'))return;const j=+b.dataset.j;
    if(cells.includes(j)){b.classList.add('hit');found++;beep(480+found*60,.05,'triangle',.07);if(found===k){over=true;done(true)}}
    else{b.classList.add('miss');over=true;area.querySelectorAll('.mx-c').forEach(e=>{if(cells.includes(+e.dataset.j)&&!e.classList.contains('hit'))e.classList.add('reveal')});done(false)}})}});
