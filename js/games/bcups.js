/* لعبة: G.bcups (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 5) أين الكرة؟ تتبّع الكوب */
G.bcups=(root,c)=>brainRounds(root,c,{total:c.fi(4,8),label:'جولات صحيحة',round(area,i,done){
  const m=c.lv<8?3:c.lv<18?4:5,swaps=c.fi(3,14)+Math.floor(i/2),dur=Math.round(c.f(650,230)),ball=rnd(0,m-1),pos=[...Array(m).keys()];
  area.innerHTML=`<div class="br-msg">انتبه للكوب الذي فيه الكرة ⚽</div><div class="cp-area" style="--m:${m}">${pos.map(k=>`<button class="cp-cup" data-k="${k}" aria-label="كوب"><span class="cp-c"></span>${k===ball?'<span class="cp-ball"></span>':''}</button>`).join('')}</div>`;
  const cups=[...area.querySelectorAll('.cp-cup')];const setPos=()=>cups.forEach((cp,k)=>{cp.style.left=`calc(${(pos[k]+.5)*100/m}% )`});cups.forEach(cp=>cp.style.transitionDuration=dur+'ms');setPos();
  cups[ball].classList.add('up');let live=false;
  c.after(()=>{cups[ball].classList.remove('up');let s=0;const sw=()=>{if(s>=swaps){live=true;area.querySelector('.br-msg').textContent='أين الكرة؟ 👆';return}
      const a=rnd(0,m-1);let b;do{b=rnd(0,m-1)}while(b===a);const ka=pos.indexOf(a),kb=pos.indexOf(b);pos[ka]=b;pos[kb]=a;cups[ka].classList.add('lift');cups[kb].classList.add('dip');setPos();beep(300+s*20,.03,'sine',.04);
      c.after(()=>{cups[ka].classList.remove('lift');cups[kb].classList.remove('dip');s++;sw()},dur+40)};sw()},1300);
  cups.forEach((cp,k)=>cp.onclick=()=>{if(!live)return;live=false;cp.classList.add('up');if(k!==ball)c.after(()=>cups[ball].classList.add('up'),350);done(k===ball)})}});
