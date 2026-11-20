/* لعبة: G.bmore (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 5) أيهما أكثر؟ (مستوحاة من Splitting Seeds) */
G.bmore=(root,c)=>brainRounds(root,c,{total:c.fi(8,16),label:'إجابات صحيحة',round(area,i,done,api){
  const base=c.fi(4,16)+rnd(0,4),diff=Math.max(1,Math.round(base*c.f(.6,.08))),e=EMO[rnd(0,EMO.length-1)],L=Math.random()<.5,a=L?base+diff:base,b=L?base:base+diff;
  const box=(n,k)=>{const P=[];const pl=()=>{for(let t=0;t<40;t++){const p=[rnd(8,92),rnd(10,90)];if(P.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>11)){P.push(p);return p}}const p=[rnd(8,92),rnd(10,90)];P.push(p);return p};
    return `<button class="mr-box" data-k="${k}">${[...Array(n)].map(()=>{const[x,y]=pl();return `<span style="left:${x}%;top:${y}%;font-size:${c.lv>=15?rnd(70,120):100}%">${e}</span>`}).join('')}</button>`};
  area.innerHTML=`<div class="br-msg">أي صندوق فيه ${e} أكثر؟ (لا تعدّ، قدّر بسرعة!)</div><div class="mr-wrap" dir="ltr">${box(a,0)}${box(b,1)}</div>`;
  const ansK=a>b?0:1;let fired=false;const pick=k=>{if(fired)return;fired=true;area.querySelector(`.mr-box[data-k="${k}"]`).classList.add(k===ansK?'ok':'bad');done(k===ansK)};
  area.querySelectorAll('.mr-box').forEach(b2=>b2.onclick=()=>pick(+b2.dataset.k));api.setKey(e2=>{if(e2.key==='ArrowLeft')pick(0);if(e2.key==='ArrowRight')pick(1)});tlim(c,area,c.f(6,2),done)}});
