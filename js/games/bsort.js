/* لعبة: G.bsort (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 6) الفرز السريع (مستوحاة من Must Sort) */
const SORTS=[[['بحري 🌊',['🐟','🐙','🦀','🐬','🐳','🦈','🐚','🦑']],['بري 🌳',['🐄','🐘','🦁','🐪','🐎','🐇','🦒','🐿️']]],[['فاكهة 🍓',['🍎','🍌','🍇','🍓','🍍','🍑','🍉','🍒']],['خضار 🥕',['🥕','🥦','🌽','🥒','🍆','🧅','🥔','🫑']]],
  [['يطير 🕊️',['🦅','🐦','🦋','🐝','🦉','🦜','✈️','🚁']],['لا يطير 🐢',['🐢','🐄','🐶','🐍','🚗','🐘','🐌','🚲']]],[['حار ☀️',['🔥','☀️','🌶️','☕','🌋','🍲']],['بارد ❄️',['❄️','🧊','⛄','🍦','🐧','🥶']]]];
G.bsort=(root,c)=>{const S=SORTS[rnd(0,SORTS.length-1)];brainRounds(root,c,{total:c.fi(10,22),label:'تصنيفات صحيحة',round(area,i,done,api){
  const side=rnd(0,1),it=S[side][1][rnd(0,S[side][1].length-1)];
  area.innerHTML=`<div class="br-msg">إلى أي سلة ينتمي؟</div><div class="srt" dir="ltr"><button class="srt-b" data-k="1">⬅️ ${S[1][0]}</button><div class="nb-card srt-c">${it}</div><button class="srt-b" data-k="0">${S[0][0]} ➡️</button></div>`;
  let f=false;const pick=k=>{if(f)return;f=true;area.querySelector(`.srt-b[data-k="${k}"]`).classList.add(k===side?'ok':'bad');area.querySelector('.srt-c').classList.add(k?'go-l':'go-r');done(k===side)};
  area.querySelectorAll('.srt-b').forEach(b=>b.onclick=()=>pick(+b.dataset.k));api.setKey(e=>{if(e.key==='ArrowLeft')pick(1);if(e.key==='ArrowRight')pick(0)});tlim(c,area,c.f(5,1.3),done)}})};
