/* لعبة: G.coloring (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- دفتر التلوين: لوّن بالأرقام ---- */
const PIX=[
 {pal:{r:'#ef4444',w:'#fecaca'},m:['.rr...rr.','rrrr.rrrr','rwrrrrrrr','rrrrrrrrr','.rrrrrrr.','..rrrrr..','...rrr...','....r....']},
 {pal:{y:'#facc15',k:'#1f2937',o:'#fb923c'},m:['..yyyyy..','.yyyyyyy.','yykyyykyy','yykyyykyy','yoyyyyyoy','ykyyyyyky','yykkkkkyy','.yyyyyyy.','..yyyyy..']},
 {pal:{r:'#dc2626',w:'#ffffff',c:'#fde68a'},m:['...rrr...','.rrwrrrr.','rrwwrrwrr','rrrrrrwwr','rwrrrrrrr','.rrrrrrr.','...ccc...','...ccc...','..ccccc..']},
 {pal:{p:'#f472b6',w:'#fdf2f8',c:'#f59e0b',d:'#92400e'},m:['..ppp..','.ppwpp.','ppppppp','ppppwpp','ccccccc','.cdcdc.','.ccccc.','..cdc..','..ccc..','...c...']},
 {pal:{r:'#b91c1c',y:'#fde047',b:'#38bdf8',d:'#78350f'},m:['....r....','...rrr...','..rrrrr..','.rrrrrrr.','rrrrrrrrr','.yyyyyyy.','.ybbyddy.','.ybbyddy.','.yyyyddy.']},
 {pal:{g:'#16a34a',l:'#4ade80',t:'#92400e',r:'#ef4444'},m:['...ggg...','..gglgg..','.ggrgggg.','gglggggrg','ggggglggg','.grggggg.','..ggggg..','....t....','....t....','...ttt...']},
 {pal:{o:'#f97316',w:'#ffffff',k:'#111827',b:'#0ea5e9'},m:['....bb....','...oooo...','.oowoooo.b','oooowookob','oooowoooob','.oowoooo.b','...oooo...','....bb....']},
 {pal:{s:'#fde047',o:'#f97316',b:'#60a5fa',w:'#e0f2fe'},m:['bbbbbbbbbbb','bbbbsssbbbb','bbbsssssbbb','bbbsssssbww','bbbbsssbwww','bbbbbbbbbbb','wwbbbbbbbbb','wwwbbbbbbbb','oooooooooooo'.slice(0,11),'ooooooooooo']},
];
G.coloring=(root,c)=>{
  const idx=Math.min(PIX.length-1,Math.floor(c.t*PIX.length)),S=PIX[(idx+rnd(0,1))%PIX.length],keys=Object.keys(S.pal),R=S.m.length,C=Math.max(...S.m.map(r=>r.length));
  const allow=c.lv<10?5:c.lv<20?3:1;let sel=0,mist=0,done=0,painting=false;const need=[];
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🖍️ <b class="dn">0</b> من <b class="tt">0</b></span><span class="pill">❌ <b class="ms">0</b> من ${allow}</span></div><div class="body"${c.lv>=12?' style="bottom:36px"':''}><div class="cl-wrap"><div class="cl-board" style="--c:${C};--r:${R}"></div><div class="cl-pal"></div></div></div>`;
  const board=root.querySelector('.cl-board'),pal=root.querySelector('.cl-pal');
  for(let j=0;j<R;j++)for(let i=0;i<C;i++){const ch=S.m[j][i]||'.',k=keys.indexOf(ch),el=h(`<div class="cl-c${k<0?' bg':''}">${k<0?'':k+1}</div>`);el.dataset.k=k;if(k>=0)need.push(el);
    const paint=()=>{if(k<0||el.classList.contains('f'))return;if(k===sel){el.classList.add('f');el.style.background=S.pal[ch];el.textContent='';done++;root.querySelector('.dn').textContent=done;beep(500+done%8*40,.04,'triangle',.06);
        if(!need.some(e=>+e.dataset.k===k&&!e.classList.contains('f'))){sfx.good();pal.children[k].classList.add('done')}
        if(done===need.length)c.after(()=>c.win(need.length*5+(allow-mist)*20,'لوّنت الصورة كاملة! 🎨',{got:need.length,total:need.length,perfect:true,label:'المربعات'}),400)}
      else{el.classList.remove('bad');void el.offsetWidth;el.classList.add('bad');mist++;root.querySelector('.ms').textContent=mist;sfx.bad();painting=false;if(mist>allow)c.after(()=>c.lose('أخطاء كثيرة! انتبه لرقم اللون',{got:done,total:need.length,label:'المربعات'}),300)}};
    el.onpointerdown=e=>{e.preventDefault();painting=true;paint()};el.onpointerenter=()=>{if(painting)paint()};board.append(el)}
  c.on(window,'pointerup',()=>painting=false);
  root.querySelector('.tt').textContent=need.length;
  keys.forEach((k,i)=>{const b=h(`<button class="cl-sw${i===0?' sel':''}" style="--sw:${S.pal[k]}"><b>${i+1}</b></button>`);b.onclick=()=>{sel=i;pal.querySelectorAll('.cl-sw').forEach((x,j)=>x.classList.toggle('sel',j===i));sfx.pop()};pal.append(b)});
  c.on(window,'keydown',e=>{const d=e.code.match(/^Digit(\d)$/);if(d&&+d[1]>=1&&+d[1]<=keys.length)pal.children[+d[1]-1].click()});
  if(c.lv>=12)c.timeBar(root,Math.round(need.length*c.f(3.2,1.4)+8),()=>c.lose('انتهى الوقت!',{got:done,total:need.length,label:'المربعات'}));
};
