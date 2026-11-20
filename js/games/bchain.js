/* لعبة: G.bchain (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 16) سلسلة الحساب (مستوحاة من Chain Reaction) */
G.bchain=(root,c)=>brainRounds(root,c,{total:c.fi(4,9),label:'نتائج صحيحة',round(area,i,done,api){
  const steps=c.fi(2,6),sp=Math.round(c.f(1700,800));let v=rnd(2,9);const ops=[];for(let k=0;k<steps;k++){const t=c.lv>=16&&Math.random()<.25&&v<=10?'×2':Math.random()<.5||v<3?'+':'−';
    if(t==='×2'){ops.push('× 2');v*=2}else if(t==='+'){const a=rnd(1,c.lv<10?5:9);ops.push('+ '+a);v+=a}else{const a=rnd(1,Math.min(v-1,c.lv<10?5:9));ops.push('− '+a);v-=a}}
  const start=ops.reduce((acc,o)=>acc,0);area.innerHTML=`<div class="br-msg">احسب في رأسك 🧠</div><div class="nb-card ch-card" dir="ltr"></div>`;const card=area.querySelector('.ch-card');
  let s0=v;ops.slice().reverse().forEach(o=>{const[op,num]=o.split(' ');s0=op==='+'?s0-+num:op==='−'?s0+ +num:s0/2});
  const seq=[String(s0),...ops];let k=0;const nx=()=>{if(k>=seq.length){card.textContent='= ؟';area.querySelector('.br-msg').textContent='ما النتيجة؟';chooseRow(area,nearOpts(v,4,0),v,done,api);return}card.textContent=seq[k];card.classList.remove('pop');void card.offsetWidth;card.classList.add('pop');beep(450+k*40,.05,'sine',.06);k++;c.after(nx,sp)};nx()}});
