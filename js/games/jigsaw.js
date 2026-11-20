/* لعبة: G.jigsaw (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
const TSRC=id=>(window.__T||{})[id]||`thumbs/${id}.webp`;
/* ---- ألغاز الصور: رتّب القطع لتكتمل الصورة ---- */
G.jigsaw=(root,c)=>{
  const n=c.lv<5?2:c.lv<13?3:c.lv<23?4:5,N=n*n,secs=Math.round(({2:45,3:85,4:140,5:200})[n]*c.f(1.2,.85));
  const pics=GAMES.map(g=>g.id).filter(id=>id!=='jigsaw'),pic=pics[rnd(0,pics.length-1)],src=TSRC(pic);
  let T;do{T=shuffle([...Array(N).keys()])}while(T.every((v,i)=>v===i));let sel=-1,moves=0,best=0;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🧩 <b class="ok">0</b> من ${N}</span><span class="pill">🔁 <b class="mv">0</b></span></div><div class="body" style="bottom:36px"><div class="jg-wrap"><div class="jg-board" style="--n:${n}"></div><div class="jg-prev"><img src="${src}" alt="الصورة"><span>الصورة كاملة</span></div></div></div>`;
  const board=root.querySelector('.jg-board');const correct=()=>T.filter((v,i)=>v===i).length;
  function render(){board.innerHTML='';T.forEach((v,i)=>{const r=Math.floor(v/n),cc=v%n,el=h(`<button class="jg-t${v===i?' ok':''}${i===sel?' sel':''}" aria-label="قطعة"></button>`);
      el.style.backgroundImage=`url(${src})`;el.style.backgroundSize=`${n*100}% ${n*100}%`;el.style.backgroundPosition=`${n>1?cc/(n-1)*100:0}% ${n>1?r/(n-1)*100:0}%`;el.onclick=()=>pick(i);board.append(el)});
    root.querySelector('.ok').textContent=correct();root.querySelector('.mv').textContent=moves}
  function pick(i){if(sel<0){sel=i;sfx.pop();return render()}if(sel===i){sel=-1;return render()}
    const before=correct();[T[sel],T[i]]=[T[i],T[sel]];sel=-1;moves++;render();const now=correct();
    if(now>before)sfx.good();else beep(600,.05,'triangle',.07);
    if(now===N)c.after(()=>c.win(N*20+Math.round(tb.left())*3,`رتّبت الصورة في ${moves} نقلة! 🧩`,{got:N,total:N,perfect:true,label:'القطع'}),500)}
  const tb=c.timeBar(root,secs,()=>c.lose('انتهى الوقت!',{got:correct(),total:N,label:'القطع'}));
  render();
};
