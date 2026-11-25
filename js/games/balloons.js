/* لعبة: G.balloons (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* فرقع البالونات التعليمية: لكل مرحلة من الـ30 مهمة، تتدرج من الألوان إلى الجمع والطرح ثم المضاعفات والمجموعات */
const BAL_COLORS=[['أحمر','#ef4444','#b91c1c'],['أزرق','#3b82f6','#1d4ed8'],['أخضر','#22c55e','#15803d'],['أصفر','#facc15','#ca8a04'],['بنفسجي','#a855f7','#7e22ce'],['برتقالي','#fb923c','#c2410c']];
const BAL_TASKS=(()=>{const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),C=k=>BAL_COLORS[k],anyC=()=>R(0,BAL_COLORS.length-1);
  const num=(lo,hi,col)=>()=>({t:String(R(lo,hi)),v:null,c:col??anyC()}),setV=o=>{o.v=+o.t;return o};
  const expr=(op,lo,hi,res)=>()=>{let a,b,v;do{a=R(lo,hi);b=R(lo,hi);if(op==='-'&&b>a)[a,b]=[b,a];if(op==='÷'){b=R(2,9);v=R(1,10);a=b*v}v=op==='+'?a+b:op==='-'?a-b:op==='×'?a*b:a/b}while(res&&!res(v));return{t:`${a} ${op} ${b}`,v,c:anyC()}};
  const mix=(...g)=>()=>g[R(0,g.length-1)]();
  const isPrime=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
  /* كل مهمة: نص للطفل، مولّد بالونات، وشرط البالون الصحيح. group: مجموعات من بالونات مربوطة، واحدة فقط صحيحة */
  return [
  /* ===== سهل 1-10 ===== */
  {q:'اضرب البالونات الحمراء 🔴',gen:()=>({t:'',c:anyC()}),ok:o=>o.c===0},
  {q:'اضرب البالونات الزرقاء 🔵',gen:()=>({t:'',c:anyC()}),ok:o=>o.c===1},
  {q:'اضرب البالونات التي عليها الرقم 5',gen:()=>setV(num(1,9)()),ok:o=>o.v===5,bias:.35,force:o=>{o.t='5';o.v=5}},
  {q:'اضرب الأرقام الزوجية (2، 4، 6، 8)',gen:()=>setV(num(1,9)()),ok:o=>o.v%2===0},
  {q:'اضرب الأرقام الفردية (1، 3، 5، 7، 9)',gen:()=>setV(num(1,9)()),ok:o=>o.v%2===1},
  {q:'اضرب الأرقام الأكبر من 5',gen:()=>setV(num(1,9)()),ok:o=>o.v>5},
  {q:'اضرب البالونات الخضراء التي عليها رقم زوجي',gen:()=>setV(num(1,9)()),ok:o=>o.c===2&&o.v%2===0,force:o=>{o.c=2;o.v=[2,4,6,8][R(0,3)];o.t=String(o.v)}},
  {q:'اضرب الجمع الذي ناتجه 6',gen:expr('+',1,5,v=>v<10),ok:o=>o.v===6,force:o=>{const a=R(1,5);o.v=6;o.t=`${a} + ${6-a}`}},
  {q:'اضرب الجمع الذي ناتجه أقل من 6',gen:expr('+',1,6,v=>v<10),ok:o=>o.v<6},
  {q:'اضرب الجمع الذي ناتجه 9',gen:expr('+',1,8,v=>v<=12),ok:o=>o.v===9,force:o=>{const a=R(1,8);o.v=9;o.t=`${a} + ${9-a}`}},
  /* ===== وسط 11-20 ===== */
  {q:'اضرب الجمع الذي ناتجه 12',gen:expr('+',2,10),ok:o=>o.v===12,force:o=>{const a=R(3,9);o.v=12;o.t=`${a} + ${12-a}`}},
  {q:'اضرب الطرح الذي ناتجه 3',gen:expr('-',1,10),ok:o=>o.v===3,force:o=>{const b=R(1,7);o.v=3;o.t=`${b+3} − ${b}`}},
  {q:'اضرب الجمع الذي ناتجه أكبر من 15',gen:expr('+',3,12),ok:o=>o.v>15},
  {q:'اضرب الطرح الذي ناتجه زوجي',gen:expr('-',2,15),ok:o=>o.v%2===0},
  {q:'اضرب العملية التي ناتجها 10 (جمع أو طرح)',gen:mix(expr('+',1,12),expr('-',5,20)),ok:o=>o.v===10,force:o=>{if(Math.random()<.5){const a=R(2,8);o.t=`${a} + ${10-a}`}else{const b=R(2,9);o.t=`${b+10} − ${b}`}o.v=10}},
  {q:'اضرب الأرقام بين 20 و 40',gen:()=>setV(num(5,60)()),ok:o=>o.v>20&&o.v<40},
  {q:'اضرب الجمع الذي ناتجه 25',gen:expr('+',8,20),ok:o=>o.v===25,force:o=>{const a=R(8,17);o.v=25;o.t=`${a} + ${25-a}`}},
  {q:'اضرب الطرح الذي ناتجه أقل من 5',gen:expr('-',3,20),ok:o=>o.v<5},
  {q:'اضرب العشرات فقط (10، 20، 30 ...)',gen:()=>setV(num(5,99)()),ok:o=>o.v%10===0,force:o=>{o.v=R(1,9)*10;o.t=String(o.v)}},
  {q:'اضرب العملية التي ناتجها 20',gen:mix(expr('+',5,18),expr('-',10,40)),ok:o=>o.v===20,force:o=>{if(Math.random()<.5){const a=R(4,16);o.t=`${a} + ${20-a}`}else{const b=R(3,15);o.t=`${b+20} − ${b}`}o.v=20}},
  /* ===== صعب 21-30 ===== */
  {q:'اضرب مضاعفات العدد 3',gen:()=>setV(num(2,40)()),ok:o=>o.v%3===0},
  {q:'اضرب مضاعفات العدد 5',gen:()=>setV(num(2,60)()),ok:o=>o.v%5===0},
  {q:'اضرب الضرب الذي ناتجه 24',gen:expr('×',2,9),ok:o=>o.v===24,force:o=>{const p=[[3,8],[4,6],[6,4],[8,3],[2,12]][R(0,4)];o.v=24;o.t=`${p[0]} × ${p[1]}`}},
  {q:'اضرب مضاعفات 4 أو 6',gen:()=>setV(num(2,50)()),ok:o=>o.v%4===0||o.v%6===0},
  {q:'اضرب مجموعة البالونات الثلاثة التي مجموعها 10',group:3,sum:10},
  {q:'اضرب القسمة التي ناتجها 4',gen:expr('÷'),ok:o=>o.v===4,force:o=>{const b=R(2,9);o.v=4;o.t=`${b*4} ÷ ${b}`}},
  {q:'اضرب الأعداد الأولية (تقبل القسمة على 1 ونفسها فقط)',gen:()=>setV(num(2,30)()),ok:o=>isPrime(o.v)},
  {q:'اضرب مجموعة البالونات الثلاثة التي مجموعها 15',group:3,sum:15},
  {q:'اضرب الضرب أو القسمة التي ناتجها 6',gen:mix(expr('×',1,9),expr('÷')),ok:o=>o.v===6,force:o=>{if(Math.random()<.5){const p=[[2,3],[3,2],[1,6],[6,1]][R(0,3)];o.t=`${p[0]} × ${p[1]}`}else{const b=R(2,9);o.t=`${b*6} ÷ ${b}`}o.v=6}},
  {q:'اضرب مجموعة البالونات الأربعة التي مجموعها 20',group:4,sum:20},
  ]})();
G.balloons=(root,c)=>{
  const task=BAL_TASKS[Math.min(BAL_TASKS.length-1,c.run.diff*10+c.run.stage-1)];
  const rise=c.f(10,6),spawnMs=Math.round(c.f(950,620)),goal=task.group?c.fi(3,5):c.fi(6,12),scale=c.f(1.15,.9),secs=task.group?45:Math.round(c.f(35,40));
  let score=0,wrong=0;
  root.innerHTML=`<div class="sky"><span class="cloud" style="top:12%">☁️</span><span class="cloud" style="top:40%;animation-delay:-14s">☁️</span></div><div class="hud">${c.tag}<span class="pill">✅ <b class="sc">0</b> من ${goal}</span></div>
    <div class="bal-task" style="position:absolute;top:calc(var(--hud,58px) + 4px);left:50%;translate:-50% 0;z-index:4;background:#fff;color:#1d2350;border-radius:18px;padding:8px 16px;font-weight:800;font-size:clamp(15px,4.2cqmin,24px);box-shadow:0 5px 0 rgba(29,35,80,.15);text-align:center;max-width:94%;pointer-events:none">🎯 ${task.q}</div>`;
  const sky=root.querySelector('.sky'),sc=root.querySelector('.sc');
  setTimeout(()=>speak(task.q.replace(/[^\u0600-\u06FF0-9 ،()]/g,'')),300);
  const res=()=>({got:Math.min(score,goal),total:goal,label:'إجابات صحيحة'});
  const balHTML=(o,sz)=>{const[,c1,c2]=BAL_COLORS[o.c];const fs=o.t.length>5?.22:o.t.length>2?.28:.38;
    return `<span style="position:relative;display:block;width:${sz}px;height:${sz*1.18}px;border-radius:50% 50% 47% 47%/55% 55% 45% 45%;background:radial-gradient(circle at 32% 28%,#ffffffcc 0 7%,transparent 8%),radial-gradient(circle at 40% 35%,${c1},${c2});box-shadow:inset -6px -8px 0 rgba(0,0,0,.12);display:grid;place-items:center;color:#fff;font:900 ${Math.round(sz*fs)}px system-ui,sans-serif;direction:ltr;text-shadow:0 2px 0 rgba(0,0,0,.3);white-space:nowrap">${o.t}</span><span style="display:block;width:2px;height:${sz*.5}px;margin:0 auto;background:#64748b"></span>`};
  const burstTxt=(b,txt,col)=>{const r=b.getBoundingClientRect(),s=root.getBoundingClientRect(),m=h(`<div style="position:absolute;left:${r.left-s.left+r.width/2}px;top:${r.top-s.top+r.height*.3}px;translate:-50% 0;z-index:5;font:900 clamp(22px,6cqmin,40px) system-ui,sans-serif;color:${col};-webkit-text-stroke:2px #fff;paint-order:stroke;direction:ltr;pointer-events:none;transition:transform .8s ease-out,opacity .8s">${txt}</div>`);root.append(m);requestAnimationFrame(()=>{m.style.transform='translateY(-70px)';m.style.opacity='0'});setTimeout(()=>m.remove(),850)};
  function hit(b,ok){if(b.classList.contains('pop'))return;b.classList.add('pop');setTimeout(()=>b.remove(),220);
    if(ok){score++;burstTxt(b,'+1','#16a34a');sfx.good()}else{wrong++;score=Math.max(0,score-1);burstTxt(b,'✗','#dc2626');sfx.bad();b.closest('.sky')&&(sky.style.boxShadow='inset 0 0 0 6px #ef4444',setTimeout(()=>sky.style.boxShadow='',250))}
    sc.textContent=score;if(score>=goal)c.win(score*10+Math.round(tb.left())*3,wrong?`أحسنت! أخطأت ${wrong} ${wrong>2?'مرات':'مرة'} فقط`:'كل ضرباتك صحيحة! 🎯',{got:goal,total:goal,perfect:true,label:'إجابات صحيحة'})}
  let lastX=[];function freeX(){let x,n=0;do{x=rnd(8,92);n++}while(n<30&&lastX.some(v=>Math.abs(v-x)<14));lastX=[x,...lastX].slice(0,3);return x}
  function launch(b,leftPct,d){b.style.left=leftPct+'%';b.style.setProperty('--d',d.toFixed(2)+'s');b.style.fontSize='16px';b.addEventListener('animationend',e=>{if(e.animationName==='rise')b.remove()});sky.append(b)}
  const SZ=()=>Math.round(Math.max(56,Math.min(110,root.clientHeight*.13))*scale);
  function spawnOne(){let o,wantOk=Math.random()<(task.bias||.42),n=0;do{o=task.gen();n++}while(n<40&&!!task.ok(o)!==wantOk);if(wantOk&&!task.ok(o)&&task.force)task.force(o);
    const b=h(`<button class="bal" aria-label="بالون ${o.t}">${balHTML(o,SZ())}</button>`);b.onpointerdown=()=>hit(b,!!task.ok(o));launch(b,freeX(),rise*(.85+Math.random()*.3))}
  /* المجموعات: 2-3 مجموعات معاً، واحدة فقط مجموعها مطلوب */
  function groupNums(target,k,ok){for(let t=0;t<200;t++){const a=[...Array(k)].map(()=>rnd(1,Math.min(9,target-1)));const s=a.reduce((x,y)=>x+y,0);if(ok?s===target:s!==target&&Math.abs(s-target)<=4)return a}return[...Array(k)].fill(1)}
  function spawnGroups(){const nG=rnd(2,3),good=rnd(0,nG-1),d=rise*1.15,sz=Math.round(SZ()*.78),xs=nG===2?[28,72]:[18,50,82];
    for(let g=0;g<nG;g++){const ns=groupNums(task.sum,task.group,g===good),b=h(`<button class="bal" aria-label="مجموعة بالونات" style="display:flex;gap:2px;align-items:flex-start">${ns.map(v=>`<span>${balHTML({t:String(v),c:rnd(0,BAL_COLORS.length-1)},sz)}</span>`).join('')}</button>`);
      b.onpointerdown=()=>hit(b,g===good);launch(b,xs[g],d)}}
  if(task.group){spawnGroups();c.every(spawnGroups,Math.round(rise*1000*.55))}else{spawnOne();c.every(spawnOne,spawnMs)}
  const tb=c.timeBar(root,secs,()=>score>=goal*.6?c.win(score*10,'انتهى الوقت',res()):c.lose('انتهى الوقت!',res()));
};
