/* لعبة: G.balloons و G.letterballoons (ملف مستقل). أي دالة أو بيانات هنا خاصة بهاتين اللعبتين فقط. */
/* بالونات الأرقام وبالونات الحروف: لكل مرحلة من الـ30 نوع مهمة ثابت، لكن الرقم أو الحرف المطلوب يتغيّر في كل محاولة */
const BAL_COLORS=[['أحمر','#ef4444','#b91c1c'],['أزرق','#3b82f6','#1d4ed8'],['أخضر','#22c55e','#15803d'],['أصفر','#facc15','#ca8a04'],['بنفسجي','#a855f7','#7e22ce'],['برتقالي','#fb923c','#c2410c']];
const balR=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),balP=a=>a[balR(0,a.length-1)],balC=()=>balR(0,BAL_COLORS.length-1);

/* ===== أدوات الأرقام ===== */
const bNum=(lo,hi)=>()=>{const v=balR(lo,hi);return{t:String(v),v,c:balC()}};
const bExpr=(op,lo,hi,res)=>()=>{let a,b,v;do{a=balR(lo,hi);b=balR(lo,hi);if(op==='-'&&b>a)[a,b]=[b,a];if(op==='÷'){b=balR(2,9);v=balR(1,10);a=b*v}
  v=op==='+'?a+b:op==='-'?a-b:op==='×'?a*b:a/b}while(res&&!res(v));return{t:`${a} ${op==='-'?'−':op} ${b}`,v,c:balC()}};
const bMix=(...g)=>()=>g[balR(0,g.length-1)]();
const bSum=(v,lo=1)=>{const a=balR(lo,v-lo);return `${a} + ${v-a}`},bSub=(v,hi=12)=>{const b=balR(1,hi);return `${v+b} − ${b}`};
const bMul=v=>{const ps=[];for(let a=2;a<=12;a++)if(v%a===0&&v/a<=12&&v/a>=1)ps.push([a,v/a]);const p=balP(ps.length?ps:[[1,v]]);return `${p[0]} × ${p[1]}`};
const bDiv=v=>{const b=balR(2,9);return `${b*v} ÷ ${b}`};
const isPrime=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
const sumGroup=(k,target)=>ok=>{for(let t=0;t<300;t++){const a=[...Array(k)].map(()=>balR(1,Math.min(9,target-1)));const s=a.reduce((x,y)=>x+y,0);if(ok?s===target:s!==target&&Math.abs(s-target)<=4)return a.map(String)}return [...Array(k)].fill('1')};
/* مهمة «اختر الناتج = X»: X عشوائي في كل محاولة */
const eqTask=(label,gen,make,pick)=>()=>{const X=pick();return{q:label(X),gen,ok:o=>o.v===X,force:o=>{o.v=X;o.t=make(X)}}};

/* كل عنصر دالة تُنشئ المهمة من جديد في كل محاولة */
const BAL_TASKS=[
  /* ===== سهل 1-10 ===== */
  ()=>{const X=balR(1,9);return{q:`اختر البالونات التي عليها الرقم ${X}`,gen:bNum(1,9),ok:o=>o.v===X,bias:.35,force:o=>{o.v=X;o.t=String(X)}}},
  ()=>{const X=balR(4,7);return{q:`اختر الأرقام الأصغر من ${X}`,gen:bNum(1,9),ok:o=>o.v<X}},
  ()=>balP([{q:'اختر الأرقام الزوجية (2، 4، 6، 8)',gen:bNum(1,9),ok:o=>o.v%2===0},{q:'اختر الأرقام الزوجية (2، 4، 6، 8، 10)',gen:bNum(1,10),ok:o=>o.v%2===0}]),
  ()=>balP([{q:'اختر الأرقام الفردية (1، 3، 5، 7، 9)',gen:bNum(1,9),ok:o=>o.v%2===1},{q:'اختر الأرقام الفردية (1، 3، 5، 7، 9، 11)',gen:bNum(1,12),ok:o=>o.v%2===1}]),
  ()=>{const X=balR(3,6);return{q:`اختر الأرقام الأكبر من ${X}`,gen:bNum(1,9),ok:o=>o.v>X}},
  ()=>{const X=balR(2,8),Y=X+1;return{q:`اختر الرقم الذي يأتي بعد ${X}`,gen:bNum(1,9),ok:o=>o.v===Y,bias:.35,force:o=>{o.v=Y;o.t=String(Y)}}},
  eqTask(X=>`اختر الجمع الذي ناتجه ${X}`,bExpr('+',1,5,v=>v<10),X=>bSum(X),()=>balR(4,6)),
  eqTask(X=>`اختر الجمع الذي ناتجه ${X}`,bExpr('+',1,6,v=>v<11),X=>bSum(X),()=>balR(6,8)),
  ()=>{const X=balR(5,8);return{q:`اختر الجمع الذي ناتجه أقل من ${X}`,gen:bExpr('+',1,6,v=>v<12),ok:o=>o.v<X,force:o=>{o.v=balR(2,X-1);o.t=bSum(o.v)}}},
  eqTask(X=>`اختر الجمع الذي ناتجه ${X}`,bExpr('+',1,8,v=>v<=12),X=>bSum(X),()=>balR(8,10)),
  /* ===== وسط 11-20 ===== */
  eqTask(X=>`اختر الجمع الذي ناتجه ${X}`,bExpr('+',2,10),X=>bSum(X,2),()=>balR(11,15)),
  eqTask(X=>`اختر الطرح الذي ناتجه ${X}`,bExpr('-',1,10),X=>bSub(X,7),()=>balR(2,6)),
  ()=>{const X=balR(13,16);return{q:`اختر الجمع الذي ناتجه أكبر من ${X}`,gen:bExpr('+',3,12),ok:o=>o.v>X}},
  ()=>balP([{q:'اختر الطرح الذي ناتجه زوجي',gen:bExpr('-',2,15),ok:o=>o.v%2===0},{q:'اختر الطرح الذي ناتجه فردي',gen:bExpr('-',2,15),ok:o=>o.v%2===1}]),
  eqTask(X=>`اختر العملية التي ناتجها ${X} (جمع أو طرح)`,bMix(bExpr('+',1,12),bExpr('-',5,20)),X=>Math.random()<.5?bSum(X):bSub(X,9),()=>balR(8,12)),
  ()=>{const a=balP([10,20,30]),b=a+20;return{q:`اختر الأرقام بين ${a} و ${b}`,gen:bNum(Math.max(1,a-15),b+15),ok:o=>o.v>a&&o.v<b}},
  eqTask(X=>`اختر الجمع الذي ناتجه ${X}`,bExpr('+',8,20),X=>bSum(X,8),()=>balR(21,28)),
  ()=>{const X=balR(4,6);return{q:`اختر الطرح الذي ناتجه أقل من ${X}`,gen:bExpr('-',3,20),ok:o=>o.v<X}},
  ()=>balP([{q:'اختر العشرات فقط (10، 20، 30 ...)',gen:bNum(5,99),ok:o=>o.v%10===0,force:o=>{o.v=balR(1,9)*10;o.t=String(o.v)}},{q:'اختر الأرقام التي آحادها 5 (5، 15، 25 ...)',gen:bNum(1,99),ok:o=>o.v%10===5,force:o=>{o.v=balR(0,9)*10+5;o.t=String(o.v)}}]),
  eqTask(X=>`اختر العملية التي ناتجها ${X}`,bMix(bExpr('+',5,18),bExpr('-',10,40)),X=>Math.random()<.5?bSum(X,4):bSub(X,15),()=>balR(15,25)),
  /* ===== صعب 21-30 ===== */
  ()=>{const X=balR(3,4);return{q:`اختر مضاعفات العدد ${X}`,gen:bNum(2,40),ok:o=>o.v%X===0}},
  ()=>{const X=balP([5,6]);return{q:`اختر مضاعفات العدد ${X}`,gen:bNum(2,60),ok:o=>o.v%X===0}},
  eqTask(X=>`اختر الضرب الذي ناتجه ${X}`,bExpr('×',2,9),X=>bMul(X),()=>balP([12,16,18,20,24,30,36])),
  ()=>{const[a,b]=balP([[4,6],[3,5],[4,7],[5,6]]);return{q:`اختر مضاعفات ${a} أو ${b}`,gen:bNum(2,50),ok:o=>o.v%a===0||o.v%b===0}},
  ()=>{const X=balR(9,12);return{q:`اختر مجموعة البالونات الثلاثة التي مجموعها ${X}`,group:sumGroup(3,X)}},
  eqTask(X=>`اختر القسمة التي ناتجها ${X}`,bExpr('÷'),X=>bDiv(X),()=>balR(3,8)),
  ()=>balP([{q:'اختر الأعداد الأولية (تقبل القسمة على 1 ونفسها فقط)',gen:bNum(2,30),ok:o=>isPrime(o.v)},{q:'اختر الأعداد الأولية الأكبر من 10',gen:bNum(5,40),ok:o=>o.v>10&&isPrime(o.v),force:o=>{o.v=balP([11,13,17,19,23,29,31,37]);o.t=String(o.v)}}]),
  ()=>{const X=balR(13,17);return{q:`اختر مجموعة البالونات الثلاثة التي مجموعها ${X}`,group:sumGroup(3,X)}},
  eqTask(X=>`اختر الضرب أو القسمة التي ناتجها ${X}`,bMix(bExpr('×',1,9),bExpr('÷')),X=>Math.random()<.5?bMul(X):bDiv(X),()=>balP([4,6,8,9,12])),
  ()=>{const X=balR(18,24);return{q:`اختر مجموعة البالونات الأربعة التي مجموعها ${X}`,group:sumGroup(4,X),gsz:.68}},
];

/* ===== أدوات الحروف ===== */
const LB_WORDS=[['أسد','🦁'],['فيل','🐘'],['قطة','🐱'],['كلب','🐶'],['بطة','🦆'],['جمل','🐫'],['حصان','🐴'],['سمكة','🐟'],['نمر','🐯'],['دب','🐻'],['أرنب','🐰'],['زرافة','🦒'],['قرد','🐵'],['ديك','🐓'],['فراشة','🦋'],['تفاحة','🍎'],['موز','🍌'],['عنب','🍇'],['برتقال','🍊'],['بطيخ','🍉'],['ليمون','🍋'],['كتاب','📖'],['قلم','✏️'],['باب','🚪'],['شمس','☀️'],['قمر','🌙'],['نجمة','⭐'],['بيت','🏠'],['سيارة','🚗'],['طائرة','✈️'],['كرة','⚽'],['شجرة','🌳'],['وردة','🌹'],['ماء','💧'],['خبز','🍞'],['حليب','🥛'],['قارب','⛵'],['فأر','🐭'],['ثعلب','🦊'],['ضفدع','🐸'],['شاي','🍵'],['غزال','🦌'],['خروف','🐑'],['صقر','🦅'],['مفتاح','🔑'],['ساعة','⌚'],['جبل','⛰️'],['ورقة','🍃'],['سلحفاة','🐢'],['حمار','🫏'],['مطر','🌧️'],['دجاجة','🐔'],['جزر','🥕'],['تمر','🌴']];
const LB_ANIMALS=new Set(['أسد','فيل','قطة','كلب','بطة','جمل','حصان','سمكة','نمر','دب','أرنب','زرافة','قرد','ديك','فراشة','فأر','ثعلب','ضفدع','غزال','خروف','صقر','سلحفاة','حمار','دجاجة']);
const LB_AB='ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split(''),lbNorm=s=>s.replace(/^[أإآ]/,'ا'),lbFirst=w=>lbNorm(w)[0],lbLast=w=>w[w.length-1];
const LB_NAME={'ا':'الألف','ب':'الباء','ت':'التاء','ث':'الثاء','ج':'الجيم','ح':'الحاء','خ':'الخاء','د':'الدال','ذ':'الذال','ر':'الراء','ز':'الزاي','س':'السين','ش':'الشين','ص':'الصاد','ض':'الضاد','ط':'الطاء','ظ':'الظاء','ع':'العين','غ':'الغين','ف':'الفاء','ق':'القاف','ك':'الكاف','ل':'اللام','م':'الميم','ن':'النون','ه':'الهاء','و':'الواو','ي':'الياء'};
const DOT1=new Set('بجخذزضظغفن'),DOT2=new Set('تقي'),DOT3=new Set('ثش'),DOT0=new Set('احدرسصطعكلمهو');
const SUN=new Set('تثدذرزسشصضطظلن'),MOON=new Set('ابجحخعغفقكمهوي');
const lbLetter=(pool=LB_AB)=>()=>({t:balP(pool),c:balC()}),lbWord=(pool=LB_WORDS)=>()=>{const w=balP(pool);return{t:w[0],w:w[0],c:balC()}},lbPic=(pool=LB_WORDS)=>()=>{const w=balP(pool);return{t:w[1],w:w[0],pic:1,c:balC()}};
const lbStarts=(L,pool=LB_WORDS)=>pool.filter(w=>lbFirst(w[0])===L),lbEnds=L=>LB_WORDS.filter(w=>lbLast(w[0])===L);
const lbLetterWith=f=>{const ok=LB_AB.filter(L=>f(L).length>=2);return balP(ok)};
const PLUR=[['كتب','كتاب'],['أقلام','قلم'],['أبواب','باب'],['بيوت','بيت'],['نجوم','نجمة'],['أشجار','شجرة'],['ورود','وردة'],['أولاد','ولد'],['سيارات','سيارة'],['كرات','كرة'],['أسود','أسد'],['كلاب','كلب'],['قطط','قطة'],['جبال','جبل']];
const OPP=[['كبير','صغير'],['طويل','قصير'],['ساخن','بارد'],['فوق','تحت'],['سريع','بطيء'],['نهار','ليل'],['سعيد','حزين'],['قريب','بعيد'],['أبيض','أسود'],['جديد','قديم'],['ثقيل','خفيف']];
const lbScramble=w=>{const a=[...w];for(let t=0;t<20;t++){const b=[...a].sort(()=>Math.random()-.5);if(b.join('')!==w)return b}return a.reverse()};
const W3=LB_WORDS.map(w=>w[0]).filter(w=>[...w].length===3),W4=LB_WORDS.map(w=>w[0]).filter(w=>[...w].length===4);
const lbWordGroup=pool=>ok=>ok?[...balP(pool)]:lbScramble(balP(pool));
const lbIs=(L,q)=>({q,gen:lbLetter(),ok:o=>o.t===L,bias:.35,force:o=>{o.t=L}});
/* الحرف الناقص: نختار كلمة وموضعاً لا يناسبه إلا حرف واحد (مثل «_ ط ة» تصلح لقطة وبطة فنتجنّبها) */
const lbMiss=()=>{const C=W3.filter(x=>!/[أإآ]/.test(x));for(let t=0;t<60;t++){const w=balP(C),i=balR(0,2),pat=[...w].map((ch,k)=>k===i?null:ch);
    const fits=C.filter(o=>[...o].every((ch,k)=>pat[k]===null||pat[k]===ch)).map(o=>[...o][i]);if(new Set(fits).size===1)return lbIs([...w][i],`اختر الحرف الناقص: ${pat.map(ch=>ch||'_').join(' ')}`)}return lbIs('ل','اختر الحرف الناقص: ق _ م')};

const LB_TASKS=[
  /* ===== سهل 1-10 ===== */
  ()=>{const L=balP('بتجدرسمن'.split(''));return lbIs(L,`اختر حرف ${LB_NAME[L]} «${L}»`)},
  ()=>{const L=balP('حخصطعفقكلهو'.split(''));return lbIs(L,`اختر حرف ${LB_NAME[L]} «${L}»`)},
  ()=>({q:'اختر الحروف التي فيها نقطة واحدة',gen:lbLetter(),ok:o=>DOT1.has(o.t)}),
  ()=>({q:'اختر الحروف التي ليس فيها نقاط',gen:lbLetter(),ok:o=>DOT0.has(o.t)}),
  ()=>balP([{q:'اختر الحروف التي فيها نقطتان',gen:lbLetter(),ok:o=>DOT2.has(o.t),force:o=>{o.t=balP([...DOT2])}},{q:'اختر الحروف التي فيها ثلاث نقاط',gen:lbLetter(),ok:o=>DOT3.has(o.t),force:o=>{o.t=balP([...DOT3])}}]),
  ()=>{const i=balR(0,LB_AB.length-2),L=LB_AB[i+1];return lbIs(L,`اختر الحرف الذي يأتي بعد «${LB_AB[i]}»`)},
  ()=>{const i=balR(1,LB_AB.length-1),L=LB_AB[i-1];return lbIs(L,`اختر الحرف الذي يأتي قبل «${LB_AB[i]}»`)},
  ()=>{const L=lbLetterWith(lbStarts);return{q:`اختر الكلمات التي تبدأ بحرف «${L}»`,gen:lbWord(),ok:o=>lbFirst(o.w)===L,force:o=>{o.w=o.t=balP(lbStarts(L))[0]}}},
  ()=>{const L=lbLetterWith(lbStarts);return{q:`اختر الصور التي يبدأ اسمها بحرف «${L}»`,gen:lbPic(),ok:o=>lbFirst(o.w)===L,force:o=>{const w=balP(lbStarts(L));o.w=w[0];o.t=w[1]}}},
  ()=>{const L=balP(['ة','ب','ر','ل']);return{q:`اختر الكلمات التي تنتهي بحرف «${L}»`,gen:lbWord(),ok:o=>lbLast(o.w)===L,force:o=>{o.w=o.t=balP(lbEnds(L))[0]}}},
  /* ===== وسط 11-20 ===== */
  ()=>{const w=balP(LB_WORDS)[0],L=[...w][0];return lbIs(L,`اختر أول حرف في كلمة «${w}»`)},
  ()=>{const L=lbLetterWith(l=>lbStarts(l));return{q:`اختر الكلمات التي تبدأ بحرف «${L}»`,gen:lbWord(),ok:o=>lbFirst(o.w)===L,force:o=>{o.w=o.t=balP(lbStarts(L))[0]}}},
  ()=>{const L=balP(['ر','ل','م','ب','ن']);return{q:`اختر الكلمات التي فيها حرف «${L}»`,gen:lbWord(),ok:o=>o.w.includes(L),force:o=>{o.w=o.t=balP(LB_WORDS.filter(w=>w[0].includes(L)))[0]}}},
  lbMiss,
  ()=>{const n=balP([3,4]);return{q:`اختر الكلمات المكوّنة من ${n} حروف`,gen:lbWord(),ok:o=>[...o.w].length===n}},
  ()=>{const g=balP([['ج','جحخ'],['ب','بتث'],['د','دذ'],['س','سش'],['ص','صض'],['ط','طظ'],['ع','عغ']]);return{q:`اختر الحروف التي تشبه «${g[0]}» في شكلها`,gen:lbLetter(),ok:o=>g[1].includes(o.t),force:o=>{o.t=balP([...g[1]])}}},
  ()=>{const L=balP(['ب','ر','ل','ة']);return{q:`اختر الكلمات التي تنتهي بحرف «${L}»`,gen:lbWord(),ok:o=>lbLast(o.w)===L,force:o=>{o.w=o.t=balP(lbEnds(L))[0]}}},
  ()=>{const AN=LB_WORDS.filter(w=>LB_ANIMALS.has(w[0])),L=lbLetterWith(l=>lbStarts(l,AN));return{q:`اختر صور الحيوانات التي يبدأ اسمها بحرف «${L}»`,gen:lbPic(),ok:o=>lbFirst(o.w)===L&&LB_ANIMALS.has(o.w),force:o=>{const w=balP(lbStarts(L,AN));o.w=w[0];o.t=w[1]}}},
  ()=>{const w=balP(LB_WORDS.filter(x=>lbLast(x[0])!=='ة'))[0],L=lbLast(w);return lbIs(L,`اختر آخر حرف في كلمة «${w}»`)},
  lbMiss,
  /* ===== صعب 21-30 ===== */
  ()=>({q:'اختر الحروف الشمسية (تُدغم معها «ال» مثل الشمس)',gen:lbLetter(),ok:o=>SUN.has(o.t)}),
  ()=>({q:'اختر الحروف القمرية (تُنطق معها لام «ال» مثل القمر)',gen:lbLetter(),ok:o=>MOON.has(o.t)}),
  ()=>balP([{q:'اختر الكلمات التي بصيغة الجمع',gen:()=>{const p=balP(PLUR),pl=Math.random()<.5;return{t:p[pl?0:1],pl,c:balC()}},ok:o=>o.pl},{q:'اختر الكلمات التي بصيغة المفرد',gen:()=>{const p=balP(PLUR),pl=Math.random()<.5;return{t:p[pl?0:1],pl,c:balC()}},ok:o=>!o.pl}]),
  ()=>{const[w,a]=balP(OPP),others=OPP.flat().filter(x=>x!==a&&x!==w);return{q:`اختر عكس كلمة «${w}»`,gen:()=>({t:balP(others),c:balC()}),ok:o=>o.t===a,bias:.35,force:o=>{o.t=a}}},
  ()=>({q:'اختر المجموعة التي تكوّن كلمة من 3 حروف بالترتيب الصحيح',group:lbWordGroup(W3)}),
  ()=>({q:'اختر حروف العلة (ا، و، ي)',gen:lbLetter(),ok:o=>'اوي'.includes(o.t),force:o=>{o.t=balP(['ا','و','ي'])}}),
  ()=>balP([{q:'اختر أسماء الحيوانات فقط',gen:lbWord(),ok:o=>LB_ANIMALS.has(o.w)},{q:'اختر الأشياء التي ليست حيوانات',gen:lbWord(),ok:o=>!LB_ANIMALS.has(o.w)}]),
  ()=>({q:'اختر المجموعة التي تكوّن كلمة من 4 حروف بالترتيب الصحيح',group:lbWordGroup(W4),gsz:.68}),
  ()=>{const[a,w]=balP(OPP),others=OPP.flat().filter(x=>x!==a&&x!==w);return{q:`اختر عكس كلمة «${w}»`,gen:()=>({t:balP(others),c:balC()}),ok:o=>o.t===a,bias:.35,force:o=>{o.t=a}}},
  ()=>({q:'اختر المجموعة التي تكوّن اسم حيوان بالترتيب الصحيح',group:lbWordGroup([...LB_ANIMALS].filter(w=>[...w].length<=4))}),
];

/* ===== محرّك مشترك ===== */
const BAL_LAST={};/* آخر سؤال لكل مرحلة، حتى لا يتكرر نفس السؤال عند الإعادة */
function balloonQuiz(TASKS,opt={}){return(root,c)=>{
  const idx=Math.min(TASKS.length-1,c.run.diff*10+c.run.stage-1),key=(opt.id||'')+':'+idx,diff=c.run.diff,rtl=!!opt.rtl;
  let task;for(let n=0;n<12;n++){task=TASKS[idx]();if(task.q!==BAL_LAST[key])break}BAL_LAST[key]=task.q;
  /* نفس سرعة البالونات في كل المستويات (سرعة السهل)، والصعوبة في الأسئلة فقط. القلوب: سهل 5، وسط 4، صعب 3 */
  const rise=12,spawnMs=1050,goal=task.group?c.fi(3,5):c.fi(6,12),scale=1.1,secs=[60,55,55][diff]+(task.group?8:0);
  let score=0,wrong=0,lives=[5,4,3][diff],started=false,tb=null;
  root.innerHTML=`<div class="sky"><span class="cloud" style="top:12%">☁️</span><span class="cloud" style="top:40%;animation-delay:-14s">☁️</span></div><div class="hud">${c.tag}<span class="pill">✅ <b class="sc">0</b> من ${goal}</span><span class="pill lv2">${heartsPill(lives)}</span></div>
    <div class="bal-task" style="position:absolute;top:calc(var(--hud,58px) + 4px);left:50%;translate:-50% 0;z-index:4;background:#fff;color:#1d2350;border-radius:18px;padding:8px 16px;font-weight:800;font-size:clamp(15px,4.2cqmin,24px);box-shadow:0 5px 0 rgba(29,35,80,.15);text-align:center;max-width:94%;pointer-events:none" hidden>🎯 ${task.q}</div>
    <div class="overlay bal-intro" style="z-index:6"><div class="ov-card" style="max-width:min(92%,560px)"><div class="ov-emo">🎯</div><h2 style="font-size:clamp(22px,6.5cqmin,40px);line-height:1.45;margin:6px 0 14px">${task.q}</h2><p>✅ المطلوب ${goal} ${task.group?'مجموعات':'إجابات'} صحيحة · ${'❤️'.repeat(lives)} لكل خطأ قلب</p><div class="ov-btns"><button class="play-btn bal-go">▶ ابدأ</button></div></div></div>`;
  const sky=root.querySelector('.sky'),sc=root.querySelector('.sc'),intro=root.querySelector('.bal-intro');
  setTimeout(()=>speak(task.q.replace(/[^\u0600-\u06FF0-9 ،()+×÷−_-]/g,'')),300);
  const res=()=>({got:Math.min(score,goal),total:goal,label:'إجابات صحيحة'});
  const balHTML=(o,sz)=>{const[,c1,c2]=BAL_COLORS[o.c];const L=[...o.t].length,fs=o.pic?.5:L>5?.2:L>3?.24:L>2?.28:.4;
    return `<span style="position:relative;display:block;width:${sz}px;height:${sz*1.18}px;border-radius:50% 50% 47% 47%/55% 55% 45% 45%;background:radial-gradient(circle at 32% 28%,#ffffffcc 0 7%,transparent 8%),radial-gradient(circle at 40% 35%,${c1},${c2});box-shadow:inset -6px -8px 0 rgba(0,0,0,.12);display:grid;place-items:center;color:#fff;font:900 ${Math.round(sz*fs)}px system-ui,Tahoma,sans-serif;direction:${rtl?'rtl':'ltr'};text-shadow:0 2px 0 rgba(0,0,0,.3);white-space:nowrap">${o.t}</span><span style="display:block;width:2px;height:${sz*.5}px;margin:0 auto;background:#64748b"></span>`};
  const burstTxt=(b,txt,col)=>{const r=b.getBoundingClientRect(),s=root.getBoundingClientRect(),m=h(`<div style="position:absolute;left:${r.left-s.left+r.width/2}px;top:${r.top-s.top+r.height*.3}px;translate:-50% 0;z-index:5;font:900 clamp(22px,6cqmin,40px) system-ui,sans-serif;color:${col};-webkit-text-stroke:2px #fff;paint-order:stroke;direction:ltr;pointer-events:none;transition:transform .8s ease-out,opacity .8s">${txt}</div>`);root.append(m);requestAnimationFrame(()=>{m.style.transform='translateY(-70px)';m.style.opacity='0'});setTimeout(()=>m.remove(),850)};
  function A_lives(){root.querySelector('.lv2').innerHTML=heartsPill(lives)}
  function hit(b,ok){if(b.classList.contains('pop'))return;b.classList.add('pop');setTimeout(()=>b.remove(),220);
    if(ok){score++;burstTxt(b,'+1','#16a34a');sfx.good()}else{wrong++;lives--;A_lives();burstTxt(b,'💔','#dc2626');sfx.bad();sky.style.boxShadow='inset 0 0 0 6px #ef4444';setTimeout(()=>sky.style.boxShadow='',250)}
    if(lives<=0)return c.lose('انتهت القلوب! اقرأ المهمة جيداً 💔',res());sc.textContent=score;if(score>=goal)c.win(score*10+Math.round(tb.left())*3,wrong?`أحسنت! أخطأت ${wrong} ${wrong>2?'مرات':'مرة'} فقط`:'كل اختياراتك صحيحة! 🎯',{got:goal,total:goal,perfect:true,label:'إجابات صحيحة'})}
  let lastX=[];function freeX(){let x,n=0;do{x=rnd(8,92);n++}while(n<30&&lastX.some(v=>Math.abs(v-x)<14));lastX=[x,...lastX].slice(0,3);return x}
  function launch(b,leftPct,d){b.style.left=leftPct+'%';b.style.setProperty('--d',d.toFixed(2)+'s');b.style.fontSize='16px';b.addEventListener('animationend',e=>{if(e.animationName==='rise')b.remove()});sky.append(b)}
  const SZ=()=>Math.round(Math.max(56,Math.min(110,root.clientHeight*.13))*scale);
  function spawnOne(){let o,wantOk=Math.random()<(task.bias||.42),n=0;do{o=task.gen();n++}while(n<40&&!!task.ok(o)!==wantOk);if(wantOk&&!task.ok(o)&&task.force)task.force(o);
    const b=h(`<button class="bal" aria-label="بالون ${o.t}">${balHTML(o,SZ())}</button>`);b.onpointerdown=()=>hit(b,!!task.ok(o));launch(b,freeX(),rise*(.85+Math.random()*.3))}
  /* المجموعات: 2-3 مجموعات معاً، واحدة فقط صحيحة */
  function spawnGroups(){const nG=rnd(2,3),good=rnd(0,nG-1),d=rise*1.15,sz=Math.round(SZ()*(task.gsz||.78)),xs=nG===2?[28,72]:[18,50,82];
    for(let g=0;g<nG;g++){const ns=task.group(g===good),b=h(`<button class="bal" aria-label="مجموعة بالونات" style="display:flex;gap:2px;align-items:flex-start;direction:${rtl?'rtl':'ltr'}">${ns.map(v=>`<span>${balHTML({t:v,c:rnd(0,BAL_COLORS.length-1)},sz)}</span>`).join('')}</button>`);
      b.onpointerdown=()=>hit(b,g===good);launch(b,xs[g],d)}}
  /* شاشة السؤال أولاً، ثم تبدأ اللعبة بالضغط على «ابدأ» أو Enter */
  function start(){if(started)return;started=true;intro.remove();root.querySelector('.bal-task').hidden=false;sfx.pop();
    if(task.group){spawnGroups();c.every(spawnGroups,Math.round(rise*1000*.55))}else{spawnOne();c.every(spawnOne,spawnMs)}
    tb=c.timeBar(root,secs,()=>score>=goal*.6?c.win(score*10,'انتهى الوقت',res()):c.lose('انتهى الوقت!',res()))}
  root.querySelector('.bal-go').onclick=start;
  c.on(window,'keydown',e=>{if(!started&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();start()}});
}}
G.balloons=balloonQuiz(BAL_TASKS,{id:'num'});
G.letterballoons=balloonQuiz(LB_TASKS,{rtl:true,id:'let'});
