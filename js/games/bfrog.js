/* لعبة: G.bfrog (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 11) قفزات الضفدع (مستوحاة من Follow That Frog) */
G.bfrog=(root,c)=>brainRounds(root,c,{total:c.fi(4,8),label:'مسارات صحيحة',round(area,i,done){
  const n=c.lv<8?3:c.lv<18?4:5,L=c.fi(3,9)+(i>2?1:0),sp=Math.round(c.f(850,420));const path=[];let last=-1;for(let k=0;k<L;k++){let p;do{p=rnd(0,n*n-1)}while(p===last);path.push(p);last=p}
  area.innerHTML=`<div class="br-msg">تابع قفزات الضفدع 🐸</div><div class="fr-grid" style="--n:${n}">${[...Array(n*n)].map((_,j)=>`<button class="fr-p" data-j="${j}"></button>`).join('')}</div>`;
  const pads=[...area.querySelectorAll('.fr-p')];let k=0,live=false,t=0;
  const hop=()=>{pads.forEach(p=>p.textContent='');if(k>=L){live=true;area.querySelector('.br-msg').textContent='أعد نفس القفزات بالترتيب 👆';return}pads[path[k]].textContent='🐸';pads[path[k]].classList.remove('jmp');void pads[path[k]].offsetWidth;pads[path[k]].classList.add('jmp');beep(380+k*40,.07,'sine',.08);k++;c.after(hop,sp)};c.after(hop,500);
  pads.forEach(p=>p.onclick=()=>{if(!live)return;const j=+p.dataset.j;if(j===path[t]){t++;p.classList.add('hit');setTimeout(()=>p.classList.remove('hit'),250);beep(500+t*40,.05,'triangle',.07);if(t===L){live=false;done(true)}}else{live=false;p.classList.add('bad');pads[path[t]].classList.add('reveal');done(false)}})}});
