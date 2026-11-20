/* لعبة: G.bdigits (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 7) تسلسل الأرقام: احفظ الأرقام وأعد كتابتها */
G.bdigits=(root,c)=>brainRounds(root,c,{total:c.fi(4,8),label:'جولات صحيحة',round(area,i,done,api){
  const L=c.fi(3,9)+(i>=Math.ceil(c.fi(4,8)/2)?1:0),sp=Math.round(c.f(1000,520)),seq=[...Array(L)].map(()=>rnd(0,9));let typed=[],live=false;
  area.innerHTML=`<div class="br-msg">احفظ الأرقام بالترتيب 👀</div><div class="dg-show" dir="ltr"></div><div class="dg-in" dir="ltr">${seq.map(()=>'<i></i>').join('')}</div><div class="dg-pad" dir="ltr">${[1,2,3,4,5,6,7,8,9,'⌫',0,'✔'].map(v=>`<button class="dg-k" data-v="${v}">${v}</button>`).join('')}</div>`;
  const showEl=area.querySelector('.dg-show'),slots=[...area.querySelectorAll('.dg-in i')];let k=0;
  const nextDigit=()=>{if(k>=L){showEl.textContent='؟';live=true;area.querySelector('.br-msg').textContent='اكتب الأرقام بنفس الترتيب ⌨️';return}showEl.textContent=seq[k];showEl.classList.remove('pop');void showEl.offsetWidth;showEl.classList.add('pop');beep(400+seq[k]*40,.08,'sine',.08);k++;c.after(()=>{showEl.textContent='';c.after(nextDigit,150)},sp)};c.after(nextDigit,600);
  const press=v=>{if(!live)return;if(v==='⌫'){typed.pop()}else if(v==='✔'){if(typed.length===L)check();return}else if(typed.length<L){typed.push(+v);beep(600,.03,'triangle',.05)}
    slots.forEach((s,j)=>s.textContent=typed[j]??'');if(typed.length===L)check()};
  const check=()=>{live=false;const ok=typed.every((v,j)=>v===seq[j]);slots.forEach((s,j)=>s.classList.add(typed[j]===seq[j]?'ok':'bad'));if(!ok)showEl.textContent=seq.join(' ');done(ok)};
  area.querySelectorAll('.dg-k').forEach(b=>b.onclick=()=>press(b.dataset.v));
  api.setKey(e=>{if(/^[0-9]$/.test(e.key))press(e.key);else if(e.key==='Backspace')press('⌫');else if(e.key==='Enter')press('✔')})}});
