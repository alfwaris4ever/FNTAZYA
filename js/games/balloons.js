/* لعبة: G.balloons (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* فرقع البالونات التعليمية: لكل مرحلة من الـ30 مهمة، تتدرج من الألوان إلى الجمع والطرح ثم المضاعفات والمجموعات */
const BAL_COLORS=[['أحمر','#ef4444','#b91c1c'],['أزرق','#3b82f6','#1d4ed8'],['أخضر','#22c55e','#15803d'],['أصفر','#facc15','#ca8a04'],['بنفسجي','#a855f7','#7e22ce'],['برتقالي','#fb923c','#c2410c']];
const BAL_TASKS=(()=>{const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),C=k=>BAL_COLORS[k],anyC=()=>R(0,BAL_COLORS.length-1);
  const num=(lo,hi,col)=>()=>({t:String(R(lo,hi)),v:null,c:col??anyC()}),setV=o=>{o.v=+o.t;return o};
  const expr=(op,lo,hi,res)=>()=>{let a,b,v;do{a=R(lo,hi);b=R(lo,hi);if(op==='-'&&b>a)[a,b]=[b,a];if(op==='÷'){b=R(2,9);v=R(1,10);a=b*v}v=op==='+'?a+b:op==='-'?a-b:op==='×'?a*b:a/b}while(res&&!res(v));return{t:`${a} ${op} ${b}`,v,c:anyC()}};
  const mix=(...g)=>()=>g[R(0,g.length-1)]();
  const sumGroup=(k,target)=>ok=>{for(let t=0;t<300;t++){const a=[...Array(k)].map(()=>R(1,Math.min(9,target-1)));const s=a.reduce((x,y)=>x+y,0);if(ok?s===target:s!==target&&Math.abs(s-target)<=4)return a.map(String)}return [...Array(k)].fill('1')};
  const isPrime=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
  /* كل مهمة: نص للطفل، مولّد بالونات، وشرط البالون الصحيح. group: مجموعات من بالونات مربوطة، واحدة فقط صحيحة */
  return [
  /* ===== سهل 1-10 ===== */
  {q:'اختر البالونات التي عليها الرقم 5',gen:()=>setV(num(1,9)()),ok:o=>o.v===5,bias:.35,force:o=>{o.t='5';o.v=5}},
  {q:'اختر الأرقام الأصغر من 5',gen:()=>setV(num(1,9)()),ok:o=>o.v<5},
  {q:'اختر الأرقام الزوجية (2، 4، 6، 8)',gen:()=>setV(num(1,9)()),ok:o=>o.v%2===0},
  {q:'اختر الأرقام الفردية (1، 3، 5، 7، 9)',gen:()=>setV(num(1,9)()),ok:o=>o.v%2===1},
  {q:'اختر الأرقام الأكبر من 5',gen:()=>setV(num(1,9)()),ok:o=>o.v>5},
  {q:'اختر الرقم الذي يأتي بعد 6',gen:()=>setV(num(1,9)()),ok:o=>o.v===7,bias:.35,force:o=>{o.t='7';o.v=7}},
  {q:'اختر الجمع الذي ناتجه 5',gen:expr('+',1,4,v=>v<9),ok:o=>o.v===5,force:o=>{const a=R(1,4);o.v=5;o.t=`${a} + ${5-a}`}},
  {q:'اختر الجمع الذي ناتجه 6',gen:expr('+',1,5,v=>v<10),ok:o=>o.v===6,force:o=>{const a=R(1,5);o.v=6;o.t=`${a} + ${6-a}`}},
  {q:'اختر الجمع الذي ناتجه أقل من 6',gen:expr('+',1,6,v=>v<10),ok:o=>o.v<6},
  {q:'اختر الجمع الذي ناتجه 9',gen:expr('+',1,8,v=>v<=12),ok:o=>o.v===9,force:o=>{const a=R(1,8);o.v=9;o.t=`${a} + ${9-a}`}},
  /* ===== وسط 11-20 ===== */
  {q:'اختر الجمع الذي ناتجه 12',gen:expr('+',2,10),ok:o=>o.v===12,force:o=>{const a=R(3,9);o.v=12;o.t=`${a} + ${12-a}`}},
  {q:'اختر الطرح الذي ناتجه 3',gen:expr('-',1,10),ok:o=>o.v===3,force:o=>{const b=R(1,7);o.v=3;o.t=`${b+3} − ${b}`}},
  {q:'اختر الجمع الذي ناتجه أكبر من 15',gen:expr('+',3,12),ok:o=>o.v>15},
  {q:'اختر الطرح الذي ناتجه زوجي',gen:expr('-',2,15),ok:o=>o.v%2===0},
  {q:'اختر العملية التي ناتجها 10 (جمع أو طرح)',gen:mix(expr('+',1,12),expr('-',5,20)),ok:o=>o.v===10,force:o=>{if(Math.random()<.5){const a=R(2,8);o.t=`${a} + ${10-a}`}else{const b=R(2,9);o.t=`${b+10} − ${b}`}o.v=10}},
  {q:'اختر الأرقام بين 20 و 40',gen:()=>setV(num(5,60)()),ok:o=>o.v>20&&o.v<40},
  {q:'اختر الجمع الذي ناتجه 25',gen:expr('+',8,20),ok:o=>o.v===25,force:o=>{const a=R(8,17);o.v=25;o.t=`${a} + ${25-a}`}},
  {q:'اختر الطرح الذي ناتجه أقل من 5',gen:expr('-',3,20),ok:o=>o.v<5},
  {q:'اختر العشرات فقط (10، 20، 30 ...)',gen:()=>setV(num(5,99)()),ok:o=>o.v%10===0,force:o=>{o.v=R(1,9)*10;o.t=String(o.v)}},
  {q:'اختر العملية التي ناتجها 20',gen:mix(expr('+',5,18),expr('-',10,40)),ok:o=>o.v===20,force:o=>{if(Math.random()<.5){const a=R(4,16);o.t=`${a} + ${20-a}`}else{const b=R(3,15);o.t=`${b+20} − ${b}`}o.v=20}},
  /* ===== صعب 21-30 ===== */
  {q:'اختر مضاعفات العدد 3',gen:()=>setV(num(2,40)()),ok:o=>o.v%3===0},
  {q:'اختر مضاعفات العدد 5',gen:()=>setV(num(2,60)()),ok:o=>o.v%5===0},
  {q:'اختر الضرب الذي ناتجه 24',gen:expr('×',2,9),ok:o=>o.v===24,force:o=>{const p=[[3,8],[4,6],[6,4],[8,3],[2,12]][R(0,4)];o.v=24;o.t=`${p[0]} × ${p[1]}`}},
  {q:'اختر مضاعفات 4 أو 6',gen:()=>setV(num(2,50)()),ok:o=>o.v%4===0||o.v%6===0},
  {q:'اختر مجموعة البالونات الثلاثة التي مجموعها 10',group:sumGroup(3,10)},
  {q:'اختر القسمة التي ناتجها 4',gen:expr('÷'),ok:o=>o.v===4,force:o=>{const b=R(2,9);o.v=4;o.t=`${b*4} ÷ ${b}`}},
  {q:'اختر الأعداد الأولية (تقبل القسمة على 1 ونفسها فقط)',gen:()=>setV(num(2,30)()),ok:o=>isPrime(o.v)},
  {q:'اختر مجموعة البالونات الثلاثة التي مجموعها 15',group:sumGroup(3,15)},
  {q:'اختر الضرب أو القسمة التي ناتجها 6',gen:mix(expr('×',1,9),expr('÷')),ok:o=>o.v===6,force:o=>{if(Math.random()<.5){const p=[[2,3],[3,2],[1,6],[6,1]][R(0,3)];o.t=`${p[0]} × ${p[1]}`}else{const b=R(2,9);o.t=`${b*6} ÷ ${b}`}o.v=6}},
  {q:'اختر مجموعة البالونات الأربعة التي مجموعها 20',group:sumGroup(4,20)},
  ]})();
/* محرّك مشترك بين «بالونات الأرقام» و«بالونات الحروف» */
function balloonQuiz(TASKS,opt={}){return(root,c)=>{
  const task=TASKS[Math.min(TASKS.length-1,c.run.diff*10+c.run.stage-1)],diff=c.run.diff,rtl=!!opt.rtl;
  /* المستوى السهل: وقت أطول وبالونات أبطأ. القلوب: سهل 5، وسط 4، صعب 3 */
  const rise=diff===0?c.f(12,10):c.f(10,6),spawnMs=Math.round(diff===0?1050:c.f(950,620)),goal=task.group?c.fi(3,5):c.fi(6,12),scale=c.f(1.15,.9),secs=[60,48,45][diff]+(task.group?8:0);
  let score=0,wrong=0,lives=[5,4,3][diff];
  root.innerHTML=`<div class="sky"><span class="cloud" style="top:12%">☁️</span><span class="cloud" style="top:40%;animation-delay:-14s">☁️</span></div><div class="hud">${c.tag}<span class="pill">✅ <b class="sc">0</b> من ${goal}</span><span class="pill lv2">${heartsPill(lives)}</span></div>
    <div class="bal-task" style="position:absolute;top:calc(var(--hud,58px) + 4px);left:50%;translate:-50% 0;z-index:4;background:#fff;color:#1d2350;border-radius:18px;padding:8px 16px;font-weight:800;font-size:clamp(15px,4.2cqmin,24px);box-shadow:0 5px 0 rgba(29,35,80,.15);text-align:center;max-width:94%;pointer-events:none">🎯 ${task.q}</div>`;
  const sky=root.querySelector('.sky'),sc=root.querySelector('.sc');
  setTimeout(()=>speak(task.q.replace(/[^\u0600-\u06FF0-9 ،()]/g,'')),300);
  const res=()=>({got:Math.min(score,goal),total:goal,label:'إجابات صحيحة'});
  const balHTML=(o,sz)=>{const[,c1,c2]=BAL_COLORS[o.c];const L=[...o.t].length,fs=o.pic?.5:L>5?.2:L>3?.24:L>2?.28:.4;
    return `<span style="position:relative;display:block;width:${sz}px;height:${sz*1.18}px;border-radius:50% 50% 47% 47%/55% 55% 45% 45%;background:radial-gradient(circle at 32% 28%,#ffffffcc 0 7%,transparent 8%),radial-gradient(circle at 40% 35%,${c1},${c2});box-shadow:inset -6px -8px 0 rgba(0,0,0,.12);display:grid;place-items:center;color:#fff;font:900 ${Math.round(sz*fs)}px system-ui,Tahoma,sans-serif;direction:${rtl?'rtl':'ltr'};text-shadow:0 2px 0 rgba(0,0,0,.3);white-space:nowrap">${o.t}</span><span style="display:block;width:2px;height:${sz*.5}px;margin:0 auto;background:#64748b"></span>`};
  const burstTxt=(b,txt,col)=>{const r=b.getBoundingClientRect(),s=root.getBoundingClientRect(),m=h(`<div style="position:absolute;left:${r.left-s.left+r.width/2}px;top:${r.top-s.top+r.height*.3}px;translate:-50% 0;z-index:5;font:900 clamp(22px,6cqmin,40px) system-ui,sans-serif;color:${col};-webkit-text-stroke:2px #fff;paint-order:stroke;direction:ltr;pointer-events:none;transition:transform .8s ease-out,opacity .8s">${txt}</div>`);root.append(m);requestAnimationFrame(()=>{m.style.transform='translateY(-70px)';m.style.opacity='0'});setTimeout(()=>m.remove(),850)};
  function hit(b,ok){if(b.classList.contains('pop'))return;b.classList.add('pop');setTimeout(()=>b.remove(),220);
    if(ok){score++;burstTxt(b,'+1','#16a34a');sfx.good()}else{wrong++;lives--;A_lives();burstTxt(b,'💔','#dc2626');sfx.bad();b.closest('.sky')&&(sky.style.boxShadow='inset 0 0 0 6px #ef4444',setTimeout(()=>sky.style.boxShadow='',250))}
    if(lives<=0)return c.lose('انتهت القلوب! اقرأ المهمة جيداً 💔',res());sc.textContent=score;if(score>=goal)c.win(score*10+Math.round(tb.left())*3,wrong?`أحسنت! أخطأت ${wrong} ${wrong>2?'مرات':'مرة'} فقط`:'كل ضرباتك صحيحة! 🎯',{got:goal,total:goal,perfect:true,label:'إجابات صحيحة'})}
  let lastX=[];function freeX(){let x,n=0;do{x=rnd(8,92);n++}while(n<30&&lastX.some(v=>Math.abs(v-x)<14));lastX=[x,...lastX].slice(0,3);return x}
  function A_lives(){root.querySelector('.lv2').innerHTML=heartsPill(lives)}
  function launch(b,leftPct,d){b.style.left=leftPct+'%';b.style.setProperty('--d',d.toFixed(2)+'s');b.style.fontSize='16px';b.addEventListener('animationend',e=>{if(e.animationName==='rise')b.remove()});sky.append(b)}
  const SZ=()=>Math.round(Math.max(56,Math.min(110,root.clientHeight*.13))*scale);
  function spawnOne(){let o,wantOk=Math.random()<(task.bias||.42),n=0;do{o=task.gen();n++}while(n<40&&!!task.ok(o)!==wantOk);if(wantOk&&!task.ok(o)&&task.force)task.force(o);
    const b=h(`<button class="bal" aria-label="بالون ${o.t}">${balHTML(o,SZ())}</button>`);b.onpointerdown=()=>hit(b,!!task.ok(o));launch(b,freeX(),rise*(.85+Math.random()*.3))}
  /* المجموعات: 2-3 مجموعات معاً، واحدة فقط مجموعها مطلوب */
  function spawnGroups(){const nG=rnd(2,3),good=rnd(0,nG-1),d=rise*1.15,sz=Math.round(SZ()*(task.gsz||.78)),xs=nG===2?[28,72]:[18,50,82];
    for(let g=0;g<nG;g++){const ns=task.group(g===good),b=h(`<button class="bal" aria-label="مجموعة بالونات" style="display:flex;gap:2px;align-items:flex-start;direction:${rtl?'rtl':'ltr'}">${ns.map(v=>`<span>${balHTML({t:v,c:rnd(0,BAL_COLORS.length-1)},sz)}</span>`).join('')}</button>`);
      b.onpointerdown=()=>hit(b,g===good);launch(b,xs[g],d)}}
  if(task.group){spawnGroups();c.every(spawnGroups,Math.round(rise*1000*.55))}else{spawnOne();c.every(spawnOne,spawnMs)}
  const tb=c.timeBar(root,secs,()=>score>=goal*.6?c.win(score*10,'انتهى الوقت',res()):c.lose('انتهى الوقت!',res()));
}}
G.balloons=balloonQuiz(BAL_TASKS);

/* ===== بالونات الحروف: 30 مهمة عن الحروف العربية ===== */
const LB_WORDS=[['أسد','🦁'],['فيل','🐘'],['قطة','🐱'],['كلب','🐶'],['بطة','🦆'],['جمل','🐫'],['حصان','🐴'],['سمكة','🐟'],['نمر','🐯'],['دب','🐻'],['أرنب','🐰'],['زرافة','🦒'],['قرد','🐵'],['ديك','🐓'],['فراشة','🦋'],['تفاحة','🍎'],['موز','🍌'],['عنب','🍇'],['برتقال','🍊'],['بطيخ','🍉'],['ليمون','🍋'],['كتاب','📖'],['قلم','✏️'],['باب','🚪'],['شمس','☀️'],['قمر','🌙'],['نجمة','⭐'],['بيت','🏠'],['سيارة','🚗'],['طائرة','✈️'],['كرة','⚽'],['شجرة','🌳'],['وردة','🌹'],['ماء','💧'],['خبز','🍞'],['حليب','🥛'],['قارب','⛵'],['فأر','🐭'],['ثعلب','🦊'],['ضفدع','🐸'],['شاي','🍵'],['غزال','🦌'],['خروف','🐑'],['صقر','🦅'],['مفتاح','🔑'],['ساعة','⌚'],['جبل','⛰️'],['ورقة','🍃']];
const LB_ANIMALS=new Set(['أسد','فيل','قطة','كلب','بطة','جمل','حصان','سمكة','نمر','دب','أرنب','زرافة','قرد','ديك','فراشة','فأر','ثعلب','ضفدع','غزال','خروف','صقر']);
const LB_TASKS=(()=>{const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),P=a=>a[R(0,a.length-1)],anyC=()=>R(0,BAL_COLORS.length-1);
  const AB='ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split(''),norm=s=>s.replace(/^[أإآ]/,'ا'),first=w=>norm(w)[0],last=w=>w[w.length-1];
  const DOT1=new Set('بجخذزضظغفن'),DOT2=new Set('تقي'),DOT3=new Set('ثش'),DOT0=new Set('احدرسصطعكلمهو');
  const SUN=new Set('تثدذرزسشصضطظلن'),MOON=new Set('ابجحخعغفقكمهوي');
  const letter=(pool=AB)=>()=>({t:P(pool),c:anyC()}),word=(pool=LB_WORDS)=>()=>{const w=P(pool);return{t:w[0],w:w[0],c:anyC()}},pic=(pool=LB_WORDS)=>()=>{const w=P(pool);return{t:w[1],w:w[0],pic:1,c:anyC()}};
  const PLUR=[['كتب','كتاب'],['أقلام','قلم'],['أبواب','باب'],['بيوت','بيت'],['نجوم','نجمة'],['أشجار','شجرة'],['ورود','وردة'],['أولاد','ولد'],['سيارات','سيارة'],['كرات','كرة'],['أسود','أسد'],['كلاب','كلب'],['قطط','قطة'],['جبال','جبل']];
  const scramble=w=>{const a=[...w];for(let t=0;t<20;t++){const b=[...a].sort(()=>Math.random()-.5);if(b.join('')!==w)return b}return a.reverse()};
  const W3=LB_WORDS.map(w=>w[0]).filter(w=>[...w].length===3),W4=LB_WORDS.map(w=>w[0]).filter(w=>[...w].length===4);
  const wordGroup=pool=>ok=>ok?[...P(pool)]:scramble(P(pool));
  return [
  /* ===== سهل 1-10 ===== */
  {q:'اختر حرف الباء «ب»',gen:letter(),ok:o=>o.t==='ب',bias:.35,force:o=>{o.t='ب'}},
  {q:'اختر حرف السين «س»',gen:letter(),ok:o=>o.t==='س',bias:.35,force:o=>{o.t='س'}},
  {q:'اختر الحروف التي فيها نقطة واحدة',gen:letter(),ok:o=>DOT1.has(o.t)},
  {q:'اختر الحروف التي ليس فيها نقاط',gen:letter(),ok:o=>DOT0.has(o.t)},
  {q:'اختر الحروف التي فيها نقطتان',gen:letter(),ok:o=>DOT2.has(o.t),force:o=>{o.t=P([...DOT2])}},
  {q:'اختر الحروف التي فيها ثلاث نقاط',gen:letter(),ok:o=>DOT3.has(o.t),force:o=>{o.t=P([...DOT3])}},
  {q:'اختر الحرف الذي يأتي بعد «ب»',gen:letter('ابتثجحخدذرز'.split('')),ok:o=>o.t==='ت',bias:.35,force:o=>{o.t='ت'}},
  {q:'اختر الكلمات التي تبدأ بحرف «ق»',gen:word(),ok:o=>first(o.w)==='ق',force:o=>{o.w=o.t=P(LB_WORDS.filter(w=>first(w[0])==='ق'))[0]}},
  {q:'اختر الصور التي يبدأ اسمها بحرف «ب»',gen:pic(),ok:o=>first(o.w)==='ب',force:o=>{const w=P(LB_WORDS.filter(w=>first(w[0])==='ب'));o.w=w[0];o.t=w[1]}},
  {q:'اختر الكلمات التي تنتهي بحرف «ة»',gen:word(),ok:o=>last(o.w)==='ة'},
  /* ===== وسط 11-20 ===== */
  {q:'اختر أول حرف في كلمة «فيل»',gen:letter(),ok:o=>o.t==='ف',bias:.35,force:o=>{o.t='ف'}},
  {q:'اختر الكلمات التي تبدأ بحرف «ش»',gen:word(),ok:o=>first(o.w)==='ش',force:o=>{o.w=o.t=P(['شمس','شجرة','شاي'])}},
  {q:'اختر الكلمات التي فيها حرف «ر»',gen:word(),ok:o=>o.w.includes('ر')},
  {q:'اختر الحرف الناقص: ق _ م',gen:letter(),ok:o=>o.t==='ل',bias:.35,force:o=>{o.t='ل'}},
  {q:'اختر الكلمات المكوّنة من 3 حروف',gen:word(),ok:o=>[...o.w].length===3},
  {q:'اختر الحروف التي تشبه «ج» في شكلها',gen:letter(),ok:o=>'جحخ'.includes(o.t),force:o=>{o.t=P(['ج','ح','خ'])}},
  {q:'اختر الكلمات التي تنتهي بحرف «ب»',gen:word(),ok:o=>last(o.w)==='ب',force:o=>{o.w=o.t=P(['كتاب','باب','دب','عنب','ثعلب','قارب','خروف'].filter(w=>last(w)==='ب'))}},
  {q:'اختر صور الحيوانات التي يبدأ اسمها بحرف «ف»',gen:pic(),ok:o=>first(o.w)==='ف'&&LB_ANIMALS.has(o.w),force:o=>{const w=P(LB_WORDS.filter(w=>first(w[0])==='ف'&&LB_ANIMALS.has(w[0])));o.w=w[0];o.t=w[1]}},
  {q:'اختر آخر حرف في كلمة «كتاب»',gen:letter(),ok:o=>o.t==='ب',bias:.35,force:o=>{o.t='ب'}},
  {q:'اختر الكلمات المكوّنة من 4 حروف',gen:word(),ok:o=>[...o.w].length===4},
  /* ===== صعب 21-30 ===== */
  {q:'اختر الحروف الشمسية (تُدغم معها «ال» مثل الشمس)',gen:letter(),ok:o=>SUN.has(o.t)},
  {q:'اختر الحروف القمرية (تُنطق معها لام «ال» مثل القمر)',gen:letter(),ok:o=>MOON.has(o.t)},
  {q:'اختر الكلمات التي بصيغة الجمع',gen:()=>{const p=P(PLUR),pl=Math.random()<.5;return{t:p[pl?0:1],w:p[pl?0:1],pl,c:anyC()}},ok:o=>o.pl},
  {q:'اختر عكس كلمة «كبير»',gen:()=>({t:P(['صغير','طويل','قصير','سريع','بطيء','بارد','ساخن','سعيد','حزين']),c:anyC()}),ok:o=>o.t==='صغير',bias:.35,force:o=>{o.t='صغير'}},
  {q:'اختر المجموعة التي تكوّن كلمة من 3 حروف بالترتيب الصحيح',group:wordGroup(W3)},
  {q:'اختر حروف العلة (ا، و، ي)',gen:letter(),ok:o=>'اوي'.includes(o.t),force:o=>{o.t=P(['ا','و','ي'])}},
  {q:'اختر أسماء الحيوانات فقط',gen:word(),ok:o=>LB_ANIMALS.has(o.w)},
  {q:'اختر المجموعة التي تكوّن كلمة من 4 حروف بالترتيب الصحيح',group:wordGroup(W4),gsz:.68},
  {q:'اختر عكس كلمة «طويل»',gen:()=>({t:P(['قصير','كبير','صغير','بعيد','قريب','نهار','ليل','فوق','تحت']),c:anyC()}),ok:o=>o.t==='قصير',bias:.35,force:o=>{o.t='قصير'}},
  {q:'اختر المجموعة التي تكوّن اسم حيوان بالترتيب الصحيح',group:wordGroup([...LB_ANIMALS].filter(w=>[...w].length<=4))},
  ]})();
G.letterballoons=balloonQuiz(LB_TASKS,{rtl:true});
