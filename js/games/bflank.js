/* لعبة: G.bflank (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 1) اتجاه السهم (مستوحاة من Lost in Migration): أسهم حمراء وسهم أصفر مميز، والاتجاهات الأربعة */
const FL_ROT=[0,180,-90,90];
const flTile=(k,yel)=>`<span class="fl-a" style="width:clamp(54px,13cqmin,84px);aspect-ratio:1;border-radius:22%;display:grid;place-items:center;font-size:inherit;background:linear-gradient(160deg,${yel?'#fde047,#eab308':'#f87171,#dc2626'});box-shadow:0 6px 0 ${yel?'#a16207':'#991b1b'},0 10px 16px rgba(0,0,0,.35)${yel?',0 0 22px rgba(253,224,71,.65)':''};transform:translateY(${rnd(-14,14)}px)"><svg viewBox="0 0 24 24" width="66%" height="66%" style="transform:rotate(${FL_ROT[k]}deg)"><path d="M3 12h14M12 5l7 7-7 7" fill="none" stroke="${yel?'#1e1b4b':'#fff'}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
G.bflank=(root,c)=>brainRounds(root,c,{total:c.fi(8,18),label:'إجابات صحيحة',round(area,i,done,api){
  const n=c.lv<10?3:c.lv<20?4:5,y=rnd(0,n-1),d=rnd(0,3),tl=c.f(5,1.6);
  /* الحمر: اتجاهات مختلفة (ليست كلها اتجاهاً واحداً)، والأصفر قد يشبه أحدها أو يختلف */
  let reds;do{reds=[...Array(n-1)].map(()=>rnd(0,3))}while(new Set(reds).size<2);
  let r=0;const dirs=[...Array(n)].map((_,k)=>k===y?d:reds[r++]);
  area.innerHTML=`<div class="br-msg">إلى أين يتّجه السهم <span style="color:#fde047">المميّز</span>؟</div><div class="fl-row" dir="ltr" style="gap:min(2.4cqmin,16px);padding:16px 0;transform:translate(${rnd(-30,30)}px,${rnd(-12,12)}px)">${dirs.map((k,j)=>flTile(k,j===y)).join('')}</div>`;
  dirButtons(area,4,d,done,api);tlim(c,area,tl,done)}});
