/* لعبة: G.bgo (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 13) اضغط عند الأخضر (Go / No-Go) */
G.bgo=(root,c)=>brainRounds(root,c,{total:c.fi(10,22),label:'ردود صحيحة',round(area,i,done,api){
  const go=Math.random()<.62,win=Math.round(c.f(1700,560));
  area.innerHTML=`<div class="br-msg">اضغط فقط عندما ترى ⭐ الخضراء… ولا تضغط على ✋ الحمراء!</div><button class="go-btn wait">…</button>`;
  const b=area.querySelector('.go-btn');let shown=false,f=false;
  const tap=()=>{if(f)return;if(!shown){return}f=true;b.classList.add(go?'ok':'bad');done(go)};b.onpointerdown=tap;api.setKey(e=>{if(e.code==='Space'||e.key==='Enter')tap()});
  c.after(()=>{shown=true;b.classList.remove('wait');b.classList.add(go?'g':'r');b.textContent=go?'⭐':'✋';c.after(()=>{if(f)return;f=true;b.classList.add(go?'bad':'ok');done(!go)},win)},rnd(350,1100))}});
