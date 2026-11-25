/* فنتازيا: الكتالوج الرئيسي (التصنيفات وقائمة الألعاب) والواجهة والتنقل. يُحمَّل أخيراً. */
/* ---------- catalog ---------- */
const CATS={
  edu:{t:'ألعاب تعليمية',e:'📚',c:['#22c55e','#14b8a6']},
  brain:{t:'ذكاء وذاكرة',e:'🧠',c:['#8b5cf6','#ec4899']},
  action:{t:'حركة وسرعة',e:'⚡',c:['#f97316','#ef4444']},
  classic:{t:'ألعاب كلاسيكية',e:'🕹️',c:['#3b82f6','#06b6d4']},
  ...PACK_CATS,
  fav:{t:'المفضلة',e:'❤️',c:['#f43f5e','#fb7185']},
  recent:{t:'لعبت مؤخراً',e:'🕒',c:['#64748b','#94a3b8']},
};
const GAMES=[
 {id:'memory-animals',t:'ذاكرة الحيوانات',e:'🐼',cat:'brain',c:['#8b5cf6','#c084fc'],big:1,badge:'الأشهر',d:'اقلب البطاقات وابحث عن كل حيوانين متشابهين. كل مرحلة فيها بطاقات أكثر!',play:G.memory('animals')},
 {id:'balloons',t:'بالونات الأرقام',e:'🎈',cat:'edu',c:['#ff5f8f','#ffb36b'],big:1,d:'اقرأ المهمة واختر البالونات الصحيحة فقط: أرقام زوجية وفردية، جمع وطرح، ضرب وقسمة، ومجموعات مجموعها رقم معيّن. انتبه للقلوب!',play:G.balloons},
 {id:'letterballoons',t:'بالونات الحروف',e:'🔤',cat:'edu',c:['#a855f7','#38bdf8'],badge:'جديد',d:'اقرأ المهمة واختر البالونات الصحيحة: حروف بنقاط أو بدونها، كلمات تبدأ بحرف، الحروف الشمسية والقمرية، والمجموعة التي تكوّن كلمة. انتبه للقلوب!',play:G.letterballoons},
 {id:'letters',t:'حروفي العربية',e:'أ ب',cat:'edu',c:['#10b981','#84cc16'],big:1,badge:'جديد',d:'تعلّم الحروف العربية: اختر الصورة التي تبدأ بالحرف، أو الحرف الذي تبدأ به الصورة.',play:G.letters},
 {id:'math-add',t:'الجمع السريع',e:'➕',cat:'edu',c:['#0ea5e9','#22d3ee'],d:'حل مسائل الجمع، والأرقام تكبر مع كل مرحلة.',play:G.math('+')},
 {id:'snake',t:'الثعبان الجائع',e:'🐍',cat:'classic',c:['#16a34a','#4ade80'],big:1,d:'حرّك الثعبان ليأكل التفاح المطلوب، واحذر الجدار والصخور في المستويات الأصعب.',play:G.snake},
 {id:'ttt',t:'إكس أو',e:'⭕',cat:'classic',c:['#6366f1','#818cf8'],d:'العب إكس أو ضد الكمبيوتر، وفُز بجولتين لتنتقل للمرحلة التالية. الكمبيوتر يصبح أذكى!',play:G.ttt},
 {id:'whack',t:'اضرب الخلد',e:'🐹',cat:'action',c:['#a16207','#facc15'],big:1,d:'اضرب الخلد بسرعة واجمع النقاط المطلوبة، ولا تضرب القنبلة!',play:G.whack},
 {id:'colors',t:'تعلّم الألوان',e:'🎨',cat:'edu',c:['#f43f5e','#f59e0b'],d:'شاهد اللون واختر اسمه الصحيح بالعربية.',play:G.colors},
 {id:'simon',t:'تذكّر الألوان',e:'🚦',cat:'brain',c:['#0f766e','#2dd4bf'],d:'شاهد ترتيب الألوان ثم كرّره بنفس الترتيب.',play:G.simon},
 {id:'math-sub',t:'تحدي الطرح',e:'➖',cat:'edu',c:['#7c3aed','#a78bfa'],d:'تمرّن على الطرح بطريقة ممتعة.',play:G.math('-')},
 {id:'memory-fruits',t:'ذاكرة الفواكه',e:'🍓',cat:'brain',c:['#e11d48','#fb923c'],d:'لعبة ذاكرة بالفواكه اللذيذة.',play:G.memory('fruits')},
 {id:'math-mul',t:'جدول الضرب',e:'✖️',cat:'edu',c:['#2563eb','#60a5fa'],d:'احفظ جدول الضرب خطوة بخطوة، من جدول 2 حتى جدول 10.',play:G.math('x')},
 {id:'memory-space',t:'ذاكرة الفضاء',e:'🚀',cat:'brain',c:['#1e1b4b','#6d28d9'],badge:'تحدٍّ',d:'ذاكرة الفضاء: نسخة أصعب بكواكب وصواريخ أكثر.',play:G.memory('space',1)},
];
GAMES.push(...PACK_GAMES);
const BRAIN_NEW=[
 {id:'bmatrix',t:'مصفوفة الذاكرة',e:'🔲',cat:'brain',c:['#0d9488','#5eead4'],big:1,badge:'جديد',d:'تضيء بعض المربعات لثوانٍ ثم تنطفئ: المس نفس المربعات من ذاكرتك. المربعات والشبكة تكبر مع كل مرحلة!',play:G.bmatrix},
 {id:'bstroop',t:'ارتباك الألوان',e:'🌈',cat:'brain',c:['#dc2626','#2563eb'],badge:'جديد',d:'هل معنى الكلمة يطابق لون كتابتها؟ أجب بنعم أو لا بسرعة قبل انتهاء الوقت. تمرين قوي للتركيز!',play:G.bstroop},
 {id:'bmatch',t:'تطابق سريع',e:'⚡',cat:'brain',c:['#7c3aed','#facc15'],badge:'جديد',d:'هل الشكل الجديد يطابق الشكل السابق؟ وفي المستوى الصعب: يطابق الشكل قبل السابق!',play:G.bmatch},
 {id:'bcount',t:'عدّ خاطف',e:'🔢',cat:'brain',c:['#ea580c','#fde047'],badge:'جديد',d:'تظهر أشياء لثوانٍ قليلة ثم تختفي: كم كان عددها؟ وانتبه للأشياء المشابهة!',play:G.bcount},
 {id:'bcups',t:'أين الكرة؟',e:'🥤',cat:'brain',c:['#b91c1c','#fca5a5'],big:1,badge:'جديد',d:'تختبئ الكرة تحت كوب ثم تتبدّل الأكواب بسرعة: تتبّع الكوب الصحيح بعينك!',play:G.bcups},
 {id:'bodd',t:'الغريب بينهم',e:'🔍',cat:'brain',c:['#0284c7','#a5f3fc'],badge:'جديد',d:'كل الأشكال متشابهة إلا شكلاً واحداً: جده قبل انتهاء الوقت. الفرق يصغر مع المراحل!',play:G.bodd},
 {id:'bdigits',t:'تسلسل الأرقام',e:'🧮',cat:'brain',c:['#4338ca','#a5b4fc'],badge:'جديد',d:'تظهر الأرقام واحداً بعد الآخر: احفظها ثم اكتبها بنفس الترتيب. التسلسل يطول مع كل مرحلة!',play:G.bdigits},
 {id:'bschulte',t:'الأرقام بالترتيب',e:'🎯',cat:'brain',c:['#059669','#6ee7b7'],badge:'جديد',d:'المس الأرقام من 1 حتى النهاية بالترتيب وبأسرع وقت. تمرين ممتاز لسرعة النظر والتركيز!',play:G.bschulte}];
GAMES.splice(1,0,...BRAIN_NEW);
const BRAIN2=[{id:'bflank',t:'سرب الطيور',e:'🐦',cat:'brain',c:['#4338ca','#a5b4fc'],big:1,badge:'جديد',d:'ركّز على الطائر في منتصف السرب فقط وتجاهل الطيور حوله: إلى أين يتجه؟',play:G.bflank},
{id:'bdrops',t:'قطرات الحساب',e:'💧',cat:'brain',c:['#0369a1','#7dd3fc'],badge:'جديد',d:'حلّ المسائل داخل القطرات قبل أن تسقط في الماء! اكتب الجواب بسرعة.',play:G.bdrops},
{id:'bleaf',t:'الأوراق الذكية',e:'🍃',cat:'brain',c:['#15803d','#fdba74'],badge:'جديد',d:'الأوراق الخضراء: إلى أين تشير؟ والبرتقالية: إلى أين تتحرك؟ بدّل تفكيرك بسرعة!',play:G.bleaf},
{id:'brot',t:'الدوران الذهني',e:'🔄',cat:'brain',c:['#be185d','#93c5fd'],badge:'جديد',d:'هل الشكل الثاني هو نفس الأول بعد تدويره، أم مقلوب كالمرآة؟ دوّره في عقلك!',play:G.brot},
{id:'bmore',t:'أيهما أكثر؟',e:'⚖️',cat:'brain',c:['#b45309','#fde68a'],badge:'جديد',d:'قدّر بسرعة: أي صندوق فيه أشياء أكثر؟ لا وقت للعدّ!',play:G.bmore},
{id:'bsort',t:'الفرز السريع',e:'🧺',cat:'brain',c:['#047857','#a7f3d0'],badge:'جديد',d:'صنّف كل شيء إلى السلة الصحيحة بأسرع ما يمكن.',play:G.bsort},
{id:'bnew',t:'ما الجديد؟',e:'🆕',cat:'brain',c:['#7c3aed','#f0abfc'],big:1,badge:'جديد',d:'احفظ الأشياء، ثم اكتشف الشيء الجديد الذي ظهر بينها.',play:G.bnew},
{id:'btreasure',t:'كنوز البحر',e:'🐚',cat:'brain',c:['#0e7490','#67e8f9'],badge:'جديد',d:'اختر كنزاً لم تختره من قبل… الكنوز تتحرك بعد كل اختيار! تحدٍّ قوي للذاكرة العاملة.',play:G.btreasure},
{id:'bpattern',t:'أكمل النمط',e:'🧩',cat:'brain',c:['#9333ea','#fbcfe8'],badge:'جديد',d:'اكتشف القاعدة وأكمل التسلسل: أشكال وألوان وأرقام.',play:G.bpattern},
{id:'bscale',t:'الميزان',e:'⚖️',cat:'brain',c:['#a16207','#fef08a'],badge:'جديد',d:'استنتج من الموازين: كم ثمرة تساوي الأخرى؟ تمرين منطق ممتع.',play:G.bscale},
{id:'bfrog',t:'قفزات الضفدع',e:'🐸',cat:'brain',c:['#16a34a','#bbf7d0'],badge:'جديد',d:'تابع الضفدع وهو يقفز بين أوراق اللوتس، ثم أعد نفس المسار بالترتيب.',play:G.bfrog},
{id:'bcode',t:'فك الشفرة',e:'🔐',cat:'brain',c:['#1e3a8a','#facc15'],badge:'جديد',d:'لكل رمز رقم: انظر للمفتاح وأجب بسرعة عن رقم الرمز.',play:G.bcode},
{id:'bgo',t:'اضغط عند الأخضر',e:'🟢',cat:'brain',c:['#15803d','#ef4444'],big:1,badge:'جديد',d:'اضغط فقط عندما تظهر النجمة الخضراء، ولا تضغط على اليد الحمراء! تمرين ضبط النفس.',play:G.bgo},
{id:'bshadow',t:'الظل المطابق',e:'👤',cat:'brain',c:['#334155','#cbd5e1'],badge:'جديد',d:'أي ظل يطابق الشكل الملوّن؟',play:G.bshadow},
{id:'bseen',t:'هل رأيته؟',e:'📸',cat:'brain',c:['#c026d3','#f5d0fe'],badge:'جديد',d:'احفظ مجموعة أشياء، ثم أجب: هل هذا الشيء كان منها؟',play:G.bseen},
{id:'bchain',t:'سلسلة الحساب',e:'🔗',cat:'brain',c:['#0f766e','#99f6e4'],badge:'جديد',d:'تظهر العمليات واحدة بعد الأخرى: احسبها في رأسك وقل النتيجة النهائية.',play:G.bchain},
{id:'bsize',t:'رتّب بالحجم',e:'📏',cat:'brain',c:['#ea580c','#fed7aa'],badge:'جديد',d:'المس الأشياء من الأصغر إلى الأكبر. الفروق تصغر مع المراحل!',play:G.bsize},
{id:'bshift',t:'تبديل المهام',e:'🔀',cat:'brain',c:['#2563eb','#f9a8d4'],badge:'جديد',d:'إذا ظهرت البطاقة في الأعلى: هل العدد زوجي؟ وفي الأسفل: هل الحيوان يطير؟',play:G.bshift},
{id:'bnames',t:'الأسماء والوجوه',e:'🧑‍🤝‍🧑',cat:'brain',c:['#b91c1c','#fecaca'],big:1,badge:'جديد',d:'تعرّف على الأصدقاء واحفظ أسماءهم، ثم تذكّر اسم كل واحد.',play:G.bnames},
{id:'breact',t:'سرعة رد الفعل',e:'⚡',cat:'brain',c:['#facc15','#1e293b'],badge:'جديد',d:'انتظر حتى يصير الزر أخضر ثم اضغط بأسرع ما يمكن. هل أنت أسرع من البرق؟',play:G.breact}];
GAMES.push(...BRAIN2);
GAMES.unshift({id:'pacman',t:'باكمان',e:'🟡',cat:'classic',c:['#facc15','#1e3a8a'],big:1,badge:'جديد',d:'تحرّك في المتاهة وكُل كل النقاط، وتجنّب الأشباح! الكرة الكبيرة تجعل الأشباح خائفة فتقدر تأكلها.',play:G.pacman});
GAMES.push(
 {id:'jigsaw',t:'ألغاز الصور',e:'🧩',cat:'puzzle',c:['#f59e0b','#fde047'],d:'رتّب قطع الصورة المبعثرة: المس قطعتين لتبدّل مكانهما حتى تكتمل الصورة قبل انتهاء الوقت.',play:G.jigsaw},
 {id:'coloring',t:'دفتر التلوين',e:'🖍️',cat:'edu',c:['#ec4899','#f9a8d4'],d:'لوّن بالأرقام: اختر اللون ثم المس المربعات التي تحمل رقمه حتى تظهر الصورة.',play:G.coloring},
 {id:'sea',t:'عالم البحار',e:'🐠',cat:'action',c:['#0284c7','#67e8f9'],d:'سبّح السمكة في البحر واجمع الأصداف والنجوم، وابتعد عن أسماك القرش!',play:G.sea},
 {id:'dinos',t:'الديناصورات',e:'🦖',cat:'action',c:['#65a30d','#bef264'],d:'اركض مع الديناصور واقفز فوق الصبار والصخور، واجمع البيض حتى تصل لنهاية الطريق.',play:G.dinos},
 {id:'piano',t:'البيانو الصغير',e:'🎹',cat:'edu',c:['#334155','#94a3b8'],d:'المس البلاطات الداكنة بالترتيب لتعزف لحناً جميلاً، ولا تترك أي بلاطة تفوتك!',play:G.piano},
 {id:'kitchen',t:'مطبخ الصغار',e:'🍕',cat:'brain',c:['#ea580c','#fdba74'],d:'حضّر البيتزا كما يطلبها كل زبون بعدد الإضافات الصحيح، ثم قدّمها قبل انتهاء الوقت.',play:G.kitchen},
 {id:'castle',t:'مغامرة القلعة',e:'🏰',cat:'classic',c:['#7c3aed','#c4b5fd'],d:'تجوّل في المتاهة وخذ المفتاح ثم ادخل القلعة، واحذر الأشباح التي تتجوّل!',play:G.castle},
 {id:'bee',t:'النحلة النشيطة',e:'🐝',cat:'action',c:['#ca8a04','#fde68a'],d:'اضغط لتطير النحلة بين الأزهار دون أن تصطدم، واجمع العسل في طريقك.',play:G.bee});
const SOON=[];

const favs=new Set(store.get('favs',[]));
const recent=()=>store.get('recent',[]);
const THUMB=id=>`<img class="thumb" src="thumbs/${id}.webp" alt="" loading="lazy" decoding="async" draggable="false" onerror="this.parentElement.classList.remove('has-img');this.remove()">`;
const tile=(g,small)=>`<a class="tile has-img ${g.big&&!small?'big':''}" href="#/play/${g.id}" style="--c1:${g.c[0]};--c2:${g.c[1]}" aria-label="${g.t}">${THUMB(g.id)}<span class="emo">${g.e}</span><span class="name">${g.t}</span>${g.badge&&!small?`<span class="badge">${g.badge}</span>`:''}</a>`;
const soonTile=(s,i)=>`<button class="tile soon has-img" data-soon style="--c1:${s[2][0]};--c2:${s[2][1]}" aria-label="${s[1]} قريباً">${THUMB('soon-'+i)}<span class="emo">${s[0]}</span><span class="name">${s[1]}</span><span class="badge">قريباً</span></button>`;

/* تقسيم قسم الذكاء إلى أقسام فرعية */
const BRAIN_SUBS=['mem','focus','speed','logic'];
const BRAIN_MAP={mem:['memory-animals','memory-fruits','memory-space','simon','bmatrix','bmatch','bdigits','bnew','btreasure','bfrog','bseen','bnames','dress-memory'],
  focus:['bstroop','bodd','bcups','bflank','bleaf','bgo','bshadow','bcount','kitchen','diffs','bshift'],
  speed:['bschulte','breact','bsort','bmore','bcode','bsize'],
  logic:['bpattern','bscale','brot','bchain','bdrops','brainq']};
{const sub={mem:{t:'ذاكرة',e:'🧠',c:['#8b5cf6','#c084fc']},focus:{t:'تركيز وانتباه',e:'🎯',c:['#0284c7','#22d3ee']},speed:{t:'سرعة',e:'⏱️',c:['#f59e0b','#ef4444']},logic:{t:'منطق وحساب',e:'🧩',c:['#059669','#84cc16']}};
  const ent=Object.entries(CATS);for(const k in CATS)delete CATS[k];
  for(const[k,v]of ent){if(k==='brain'){CATS.brain={...v,t:'كل ألعاب الذكاء',e:'💡'};Object.assign(CATS,sub)}else CATS[k]=v}
  const rev={};for(const[s,ids]of Object.entries(BRAIN_MAP))ids.forEach(id=>rev[id]=s);
  GAMES.forEach(g=>{if(rev[g.id])g.cat=rev[g.id];else if(g.cat==='brain')g.cat='logic'})}
/* شريط التصنيفات أعلى الصفحة بجانب الشعار (صفّان كحد أقصى) */
$('#cats').innerHTML=Object.entries(CATS).filter(([k])=>!BRAIN_SUBS.includes(k)).map(([k,v])=>`<a class="cat-chip" data-k="${k}" href="#/cat/${k}" style="--c1:${v.c[0]};--c2:${v.c[1]}"><span>${v.e}</span>${v.t}</a>`).join('');
function fitCats(){const b=$('#cats');if(!b||b.offsetParent===null)return;b.style.setProperty('--cr',1);b.classList.remove('two');
  if(new Set([...b.children].map(c=>c.offsetTop)).size>2)b.classList.add('two');const gs=getComputedStyle(b.parentElement),cell=parseFloat(gs.gridAutoRows)||94;b.style.setProperty('--cr',b.scrollHeight>cell+2?2:1)}
addEventListener('resize',fitCats);

/* ---------- views ---------- */
let cur=null,curGame=null;
function showHome(cat){
  $('#view-game').hidden=true;$('#view-home').hidden=false;
  const grid=$('#grid');grid.querySelectorAll(':scope>:not(.logo-card):not(.cat-bar)').forEach(n=>n.remove());$('#cats').querySelectorAll('.cat-chip').forEach(a=>a.classList.toggle('on',!!cat&&(a.dataset.k===cat||(BRAIN_SUBS.includes(cat)&&a.dataset.k==='brain'))));requestAnimationFrame(fitCats);
  let list=GAMES,head='';
  if(cat&&CATS[cat]){const C=CATS[cat];
    list=cat==='fav'?GAMES.filter(g=>favs.has(g.id)):cat==='recent'?recent().map(id=>GAMES.find(g=>g.id===id)).filter(Boolean):GAMES.filter(g=>cat==='brain'?BRAIN_SUBS.includes(g.cat):g.cat===cat);
    head=`<div class="cat-head" style="--c1:${C.c[0]};--c2:${C.c[1]}"><span>${C.e}</span><div><h1>${C.t}</h1><small>${list.length} ${list.length===1?'لعبة':'ألعاب'}</small></div></div>`;
    /* أقسام الذكاء: صف ثابت الترتيب والأحجام، والقسم الحالي مميّز بإطار، والألعاب تحته */
    if(cat==='brain'||BRAIN_SUBS.includes(cat))head=`<div class="sub-row" role="tablist" aria-label="أقسام ألعاب الذكاء">${['brain',...BRAIN_SUBS].map(k=>{const S=CATS[k],n=k==='brain'?GAMES.filter(g=>BRAIN_SUBS.includes(g.cat)).length:GAMES.filter(g=>g.cat===k).length;return `<a class="cat-tile sub-tile${k===cat?' on':''}"${k===cat?' aria-current="page"':''} href="#/cat/${k}" style="--c1:${S.c[0]};--c2:${S.c[1]}"><span>${S.e}</span><div>${S.t}<small>${n} لعبة</small></div></a>`}).join('')}</div>`;
    if(!list.length)head+=`<div class="empty">${cat==='fav'?'اضغط 🤍 داخل أي لعبة لإضافتها هنا':'لا توجد ألعاب هنا بعد'}</div>`;
    document.title=`${C.t} | فنتازيا`;
  }else document.title='فنتازيا | ألعاب أطفال مجانية بالعربي';
  grid.insertAdjacentHTML('beforeend',head+list.map(g=>tile(g,!!cat)).join('')+(cat?'':SOON.map(soonTile).join('')));
  grid.querySelector('.sub-row .sub-tile.on')?.scrollIntoView({block:'nearest',inline:'center'});
  scrollTo(0,0);
}
function renderInfo(g){const C=CATS[g.cat];
  const prog=DIFFS.map((D,i)=>`<span class="chip">${D.e} ${D.t}: ${progress(g.id,i)}/${STAGES}${isDone(g.id,i)?' 🏆':''}</span>`).join('');
  $('#gInfo').innerHTML=`<h2>${g.e.length<4?g.e:''} ${g.t}</h2><div class="chips"><a class="chip" href="#/cat/${g.cat}">${C.e} ${C.t}</a>${prog}</div><p>${g.d}</p><p class="levels-note">🎚️ ثلاثة مستويات، في كل مستوى ${STAGES} مراحل (${LEVELS} درجة صعوبة متدرجة). أكمل المرحلة بعلامة كاملة لتفتح التي بعدها، ويُحفظ تقدّمك تلقائياً.</p>`}
function openGame(g){
  curGame=g;$('#stage').style.setProperty('--bgimg',`url(thumbs/${g.id}.webp)`);$('#view-home').hidden=true;$('#view-game').hidden=false;
  document.title=`${g.t} | العب مجاناً على فنتازيا`;$('#gTitle').textContent=g.t;renderInfo(g);
  const rel=[...GAMES.filter(x=>x.id!==g.id&&x.cat===g.cat),...shuffle(GAMES.filter(x=>x.id!==g.id&&x.cat!==g.cat))].slice(0,9);
  $('#related').innerHTML=rel.map(x=>tile(x,true)).join('');
  updateFav();store.set('recent',[g.id,...recent().filter(i=>i!==g.id)].slice(0,12));
  showStart(g);scrollTo(0,0);
}

/* شاشة المستويات والمراحل: تُستخدم في البداية وداخل اللعبة (مع إيقاف مؤقت) */
function levelsCard(g,picker){
  let d=store.get('diff:'+g.id,0);
  const card=h(`<div class="ov-card lv-card"><div class="lv-head"><span class="lv-emo">${picker?'🎚️':g.e}</span><h2>${picker?'المستويات والمراحل':g.t}</h2></div>${picker?'':`<p>${g.d}</p>`}<div class="diffs tabs"></div><div class="map"></div><div class="ov-btns"></div><div class="next-hint">🔓 أكمل المرحلة بعلامة كاملة لتفتح التي بعدها</div></div>`);
  function render(){const D=DIFFS[d],u=unl(g.id,d),done=isDone(g.id,d),cont=done?1:u;
    card.querySelector('.tabs').innerHTML=DIFFS.map((X,i)=>`<button class="diff-btn${i===d?' sel':''}" data-i="${i}" style="--a:${X.a};--b:${X.b};--s:${X.s}"><span class="de">${X.e}</span><b>${X.t}</b><small>${isDone(g.id,i)?'🏆 ':''}${progress(g.id,i)}/${STAGES}</small></button>`).join('');
    card.querySelector('.map').innerHTML=`<div class="stages" style="--a:${D.a};--b:${D.b};--s:${D.s}">${Array.from({length:STAGES},(_,i)=>{const s=i+1,ok=s<u||(s===STAGES&&done),open=s<=u,nx=s===u&&!done;
      return `<button class="stg${ok?' ok':''}${open?'':' locked'}${nx?' next':''}" data-s="${s}"${open?'':' aria-disabled="true"'} aria-label="المرحلة ${s}${open?'':' (مقفلة)'}">${open?`<b>${s}</b>${ok?'<i>⭐</i>':''}`:'🔒'}</button>`}).join('')}</div>`;
    card.querySelector('.ov-btns').innerHTML=`<button class="play-btn go" style="background:linear-gradient(${D.a},${D.b});box-shadow:0 6px 0 ${D.s}">▶ ${done?'العب من المرحلة 1':u===1?'ابدأ المرحلة 1':'تابع من المرحلة '+u}</button>${picker?'<button class="play-btn alt" data-act="resume">↩ متابعة اللعب</button>':''}<button class="play-btn alt tut-btn">🎓 ${tutDone(g.id)?'أعد التدريب':'التدريب'}</button>`;
    card.querySelector('.tut-btn').onclick=()=>{practice=null;startPractice(g,{diff:d,stage:cont})};
    card.querySelectorAll('.tabs .diff-btn').forEach(b=>b.onclick=()=>{d=+b.dataset.i;store.set('diff:'+g.id,d);sfx.pop();render()});
    card.querySelectorAll('.stg:not(.locked)').forEach(b=>b.onclick=()=>startGame(g,d,+b.dataset.s));
    card.querySelectorAll('.stg.locked').forEach(b=>b.onclick=()=>{toast('🔒 أكمل المرحلة السابقة بعلامة كاملة');sfx.bad()});
    card.querySelector('.go').onclick=()=>startGame(g,d,cont)}
  render();return card}
function showStart(g){stopGame();const st=$('#stage');st.innerHTML='';
  const ov=h(`<div class="overlay start" style="--c1:${g.c[0]};--c2:${g.c[1]}"></div>`);ov.append(levelsCard(g,false));st.append(ov)}
function openLevelPicker(){if(!cur||$('#stage .picker'))return;const{g,c}=cur;c.pause();
  const ov=h(`<div class="overlay picker"></div>`);const card=levelsCard(g,true);ov.append(card);
  card.querySelector('[data-act=resume]').onclick=()=>{ov.remove();c.resume()};$('#stage').append(ov)}
function startGame(g,diff=0,stage=1){if(!tutDone(g.id))return startPractice(g,{diff,stage});stopGame();store.set('diff:'+g.id,diff);const st=$('#stage');st.innerHTML='';st.classList.remove('paused');
  const c=makeCtx(g,{diff,stage});cur={g,c};beep(1,.01);g.play(st,c);fitHud()}
function stopGame(keep){cur?.c.clear();cur=null;$('#stage').classList.remove('paused');if(!keep&&typeof clearPracticeTimers==='function'){clearPracticeTimers();practice=null;$('#stageWrap').classList.remove('practicing')}}
/* ---------- وضع التدريب: أول مرة يفتح فيها اللاعب أي لعبة ---------- */
const HOW={
 'car-soccer':['🚙 حرّك سيارتك بالأسهم أو بالسحب على الشاشة','⚽ ادفع الكرة الكبيرة نحو المرمى الأحمر','🥅 سجّل قبل أن يسجّل الخصم في مرماك'],
 'racer':['🏎️ حرّك السيارة يميناً ويساراً بالأسهم أو باللمس','🚗 تجنّب السيارات الأخرى','🪙 اجمع العملات حتى تصل لخط النهاية'],
 'drive-mad':['➡️ اضغط للأمام لتسير و⬅️ للخلف لتتوازن','⛰️ لا تسرع كثيراً فوق القفزات حتى لا تنقلب','🏁 وصّل الشاحنة لخط النهاية'],
 'police':['🚓 قُد سيارة الشرطة بالأسهم أو بالسحب','🦹 اقترب من سيارة اللص لتمسكه','⏱️ أمسك اللصوص قبل انتهاء الوقت'],
 'hill-climb':['➡️ اضغط للأمام لتتسلّق و⬅️ للفرملة','⛽ اجمع البنزين قبل أن ينفد','🪙 العملات تزيد نقاطك'],
 'miner':['⛏️ احفر بالأسهم أو بلمس المكعب بجانبك','💎 ابحث عن الجواهر المخبأة','🔥 ابتعد عن الحمم'],
 'steal':['🧒 حرّك شخصيتك بالأسهم أو بالسحب','🦄 خذ مخلوقاً من الحزام وأوصله لبيتك الأزرق','⭐ المخلوقات الذهبية قيمتها 5، ومن يجمع أكثر يفوز'],
 'hook':['👆 اضغط مطوّلاً لتمسك الحلقة الأقرب','🕊️ اترك لتطير للأمام','🌵 لا تنزل على الشوك! تنقّل بين الحلقات'],
 'worms':['🐛 وجّه دودتك بالماوس أو بإصبعك','🍬 كُل النقاط الملونة لتكبر','💥 لا تصطدم بجسم دودة أخرى'],
 'hole':['🕳️ حرّك الثقب بالسحب أو بالأسهم','🚗 ابتلع الأشياء الأصغر منه لتكبر','🏢 كلما كبرت ابتلعت أشياء أكبر'],
 'pets':['🐶 حرّك حيوانك بالأسهم أو بالسحب','🍬 اجمع الحلوى قبل منافسك','🏆 من يجمع أكثر يفوز'],
 'boom':['🎈 ضع بالوناً مائياً بالزر أو بالمسافة','💦 ابتعد قبل أن ينفجر','🎯 بلّل خصمك لتربح'],
 'headball':['⬅️➡️ تحرّك بالأسهم','⬆️ اقفز لتضرب الكرة برأسك','⚽ سجّل في مرمى الخصم'],
 'penalty':['🎯 اختر مكان التسديد واضغط لتسدّد','🧤 عند الحراسة اقفز في اتجاه الكرة','🥅 سجّل أكثر من الخصم'],
 'devil':['⬅️➡️ تحرّك بالأسهم و⬆️ للقفز','😈 الأرض قد تسقط والأشواك تظهر فجأة','🧠 تذكّر الفخاخ ووصّل المكعب للباب'],
 'blocks10':['🧱 اسحب القطعة إلى اللوحة','➖ أكمل صفاً أو عموداً ليختفي','🎯 اجمع النقاط المطلوبة'],
 'diffs':['👀 قارن الصورتين جيداً','👆 المس مكان الاختلاف','⏱️ أوجد كل الفروق قبل انتهاء الوقت'],
 'sort':['👆 المس أنبوباً لتأخذ الكرة العليا','🧪 المس أنبوباً آخر لتضعها فوق كرة بنفس اللون','🌈 اجعل كل أنبوب بلون واحد'],
 'brainq':['💡 اقرأ السؤال جيداً','🤔 بعض الأسئلة فيها خدعة','👆 اختر الإجابة الصحيحة'],
 'blast':['🧩 اسحب القطع إلى اللوحة','💥 أكمل صفاً أو عموداً ليفجّره','🔥 الكومبو يضاعف نقاطك'],
 'dressup':['👀 انظر للإطلالة المطلوبة','👗 اختر القميص والبنطال والحذاء والشعر','✅ طابق الصورة تماماً'],
 'snapstyle':['🏖️ انظر إلى المناسبة المطلوبة','👗 اختر الملابس المناسبة لها','📸 صوّر الإطلالة'],
 'runway':['⬅️➡️ حرّكي العارضة على المنصة','👗 اجمعي الملابس باللون المطلوب فقط','🚫 تجنّبي الألوان الأخرى'],
 'salon':['📋 انظر إلى طلب الزبونة','✂️ نفّذ الخطوات بالترتيب: غسيل، تمشيط، صبغ، زينة','😊 اجعلها سعيدة'],
 'dress-memory':['👀 احفظ الإطلالة قبل أن تختفي','👗 أعد تلبيس الشخصية من ذاكرتك','✅ كل قطعة صحيحة تزيد نقاطك'],
 'memory-animals':['👆 اقلب بطاقتين','🐼 إذا تشابهتا تبقيان مفتوحتين','🧠 تذكّر أماكن البطاقات وجد كل الأزواج'],
 'memory-fruits':['👆 اقلب بطاقتين','🍓 إذا تشابهتا تبقيان مفتوحتين','🧠 تذكّر الأماكن وجد كل الأزواج'],
 'memory-space':['👆 اقلب بطاقتين','🚀 إذا تشابهتا تبقيان مفتوحتين','🧠 تذكّر الأماكن وجد كل الأزواج'],
 'balloons':['🎯 اقرأ المهمة المكتوبة أعلى الشاشة','👆 اختر البالونات التي تناسب المهمة فقط','💔 كل بالون خطأ يُنقص قلباً'],
 'letterballoons':['🎯 اقرأ المهمة المكتوبة أعلى الشاشة','👆 اختر البالونات التي فيها الحرف أو الكلمة المطلوبة','💔 كل بالون خطأ يُنقص قلباً'],
 'letters':['🔊 اسمع الحرف وانظر إليه','👆 اختر الصورة التي تبدأ بهذا الحرف','📖 بعد الإجابة تسمع اسم الصورة'],
 'math-add':['➕ اقرأ المسألة','👆 اختر الناتج الصحيح','⭐ كل إجابة صحيحة نقطة'],
 'math-sub':['➖ اقرأ المسألة','👆 اختر الناتج الصحيح','⭐ كل إجابة صحيحة نقطة'],
 'math-mul':['✖️ اقرأ المسألة','👆 اختر الناتج الصحيح','⭐ كل إجابة صحيحة نقطة'],
 'snake':['⬆️⬇️⬅️➡️ وجّه الثعبان بالأسهم أو بالسحب','🍎 كُل التفاح ليكبر','⚠️ لا تصطدم بنفسك'],
 'ttt':['❌ أنت تلعب بالإكس','👆 المس خانة فارغة لتضع علامتك','🏆 كوّن صفاً من 3 قبل الكمبيوتر'],
 'whack':['🐹 المس الخلد عندما يخرج','⚡ كن سريعاً قبل أن يختفي','💣 لا تضرب القنبلة'],
 'colors':['🎨 انظر إلى اللون','👆 اختر اسمه الصحيح','🔊 تسمع اسم اللون عند الإجابة الصحيحة'],
 'simon':['👀 شاهد الألوان وهي تضيء','👆 اضغط عليها بنفس الترتيب','➕ كل جولة يُضاف لون جديد'],
};
const PRACTICE_SECS=25;
const tutDone=id=>store.get('tut:'+id,false);
let practice=null;
function practiceTips(g){const st=$('#stage'),tips=HOW[g.id]||[g.d];
  const bub=h(`<div class="coach" role="status"><div class="coach-txt"></div><div class="coach-dots">${tips.map(()=>'<i></i>').join('')}</div><button class="coach-skip">تخطّي التدريب ⏭</button></div>`);
  st.append(bub);let i=0;const show=()=>{bub.querySelector('.coach-txt').textContent=tips[i];bub.querySelectorAll('.coach-dots i').forEach((d,k)=>d.classList.toggle('on',k===i));bub.classList.remove('pop');void bub.offsetWidth;bub.classList.add('pop')};
  show();const id=setInterval(()=>{i=(i+1)%tips.length;show()},4200);practice.timers.push(id);
  bub.querySelector('.coach-skip').onclick=()=>finishPractice(true);
  if(!practice.spoke){practice.spoke=true;setTimeout(()=>speak('تدريب. '+tips[0].replace(/[^\u0600-\u06FF\s،.]/g,'')),400)}}
function startPractice(g,target){
  if(!practice||practice.g!==g)practice={g,target,attempts:0,t0:performance.now(),timers:[]};
  practice.attempts++;stopGame(true);const st=$('#stage');st.innerHTML='';st.classList.remove('paused');
  const c=makeCtx(g,{diff:0,stage:1,practice:true});cur={g,c};beep(1,.01);g.play(st,c);fitHud();
  $('#stageWrap').classList.add('practicing');practiceTips(g);
  const left=PRACTICE_SECS*1000-(performance.now()-practice.t0);
  practice.timers.push(setTimeout(()=>{if(cur&&cur.c.run.practice)finishPractice(false)},Math.max(6000,left)))}
function practiceEnded(g,run,kind){ // من داخل اللعبة: فوز أو خسارة أثناء التدريب
  if(!practice)return;const el=(performance.now()-practice.t0)/1000;
  if(kind==='lose'&&practice.attempts<3&&el<PRACTICE_SECS){toast('ولا يهمك، هذا تدريب 😊 جرّب مرة ثانية');setTimeout(()=>{if(practice)startPractice(g,practice.target)},900);return}
  finishPractice(false)}
function clearPracticeTimers(){if(practice){practice.timers.forEach(t=>{clearTimeout(t);clearInterval(t)});practice.timers=[]}}
function finishPractice(skipped){if(!practice)return;const{g,target}=practice;clearPracticeTimers();
  if(cur&&cur.c.run.practice){cur.c.clear()}
  $('#stage .coach')?.remove();
  if(skipped){endPracticeMode();return beginReal(g,target)}
  sfx.win();setTimeout(()=>speak('أحسنت! يلا نبدأ اللعب'),200);
  overlayCard(`<div class="ov-emo">🎓</div><h2>أحسنت! فهمت الطريقة 👏</h2><p>انتهى التدريب، يلا نبدأ اللعب الحقيقي!</p><div class="ov-btns"><button class="play-btn" data-act="go">▶ يلا نبدأ اللعب</button><button class="play-btn" data-act="again">🔁 تدريب مرة ثانية</button></div>`,
    {go:()=>{endPracticeMode();beginReal(g,target)},again:()=>{practice=null;startPractice(g,target)}})}
function endPracticeMode(){clearPracticeTimers();$('#stageWrap').classList.remove('practicing');}
function beginReal(g,target){store.set('tut:'+g.id,true);practice=null;startGame(g,target.diff,target.stage)}


/* بطاقات النتيجة مع تنقل بالأسهم و Enter */
function overlayCard(html,acts){const ov=h(`<div class="overlay result-ov"><div class="ov-card kbnav">${html}<div class="kb-hint">⌨️ الأسهم للتنقل · Enter للاختيار</div></div></div>`);
  ov.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>acts[b.dataset.act]());$('#stage').append(ov);
  [...ov.querySelectorAll('.ov-btns .play-btn')].forEach((b,i)=>b.addEventListener('pointermove',()=>{if(ov._sel!==i)kbSel(ov,i)}));kbSel(ov,0);return ov}
function kbSel(ov,i){const btns=[...ov.querySelectorAll('.ov-btns .play-btn')];if(!btns.length)return;i=(i+btns.length)%btns.length;ov._sel=i;btns.forEach((b,j)=>b.classList.toggle('kb-sel',j===i))}
document.addEventListener('keydown',e=>{const k=e.key,ov=[...document.querySelectorAll('#stage .result-ov')].pop();
  if(!ov){if(k==='Enter'){const go=[...document.querySelectorAll('#stage .lv-card .go')].pop();if(go){e.preventDefault();go.click()}}return}
  if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(k)){e.preventDefault();e.stopImmediatePropagation();kbSel(ov,(ov._sel||0)+(k==='ArrowDown'||k==='ArrowLeft'?1:-1));beep(700,.04,'triangle',.08)}
  else if(k==='Enter'||k===' '){e.preventDefault();e.stopImmediatePropagation();ov.querySelectorAll('.ov-btns .play-btn')[ov._sel||0]?.click()}},true);
const resultHTML=(res,cls)=>res?`<div class="result ${cls}${res.vs?' vs':''}"><b>${res.got}</b><span>${res.vs?'مقابل':'من'}</span><b>${res.total}</b></div><div class="result-label">${res.label||''}</div>`:'';
const starsHTML=s=>`<div class="stars">${'⭐'.repeat(s)}<span class="dim">${'⭐'.repeat(3-s)}</span></div>`;

function stageDone(g,run,score,msg,res){const{diff,stage}=run,D=DIFFS[diff],perfect=!!res?.perfect,ratio=res?res.got/res.total:1;
  const bk=`best:${g.id}:${diff}:${stage}`;if(score>store.get(bk,0))store.set(bk,score);
  let unlockedNow=false;
  if(perfect){if(stage===STAGES){unlockedNow=!isDone(g.id,diff);store.set(`fin:${g.id}:${diff}`,true)}
    else if(unl(g.id,diff)<=stage){store.set(`unl:${g.id}:${diff}`,stage+1);unlockedNow=true}
    celebrate()}else sfx.good();
  renderInfo(g);
  const nextOpen=stage<STAGES&&unl(g.id,diff)>stage;
  if(perfect&&stage===STAGES){const N=DIFFS[diff+1];
    if(N){store.set('diff:'+g.id,diff+1);let n=6,tmr;
      const go=()=>{clearInterval(tmr);startGame(g,diff+1,1)};
      const ov=overlayCard(`<div class="ov-emo">🏆</div>${starsHTML(3)}<h2>${cheer('top')}</h2><div class="sub-h">🏆 أنهيت مستوى «${D.t}» كاملاً!</div>
        <div class="lvlup" style="--a:${N.a};--b:${N.b};--s:${N.s}"><div class="lvlup-k">⬆️ انتقلت إلى المستوى التالي</div><div class="lvlup-n">${N.e} مستوى ${N.t}</div><div class="lvlup-s">يبدأ من المرحلة 1 من ${STAGES}</div></div>
        <div class="ov-btns"><button class="play-btn" data-act="up">▶ ابدأ مستوى ${N.t} <span class="cd">(${n})</span></button><button class="play-btn" data-act="map">🗺️ المراحل</button></div>`,
        {up:go,map:()=>{clearInterval(tmr);showStart(g)}});
      setTimeout(()=>speak(`انتقلت إلى مستوى ${N.t}`),1600);
      tmr=setInterval(()=>{if(!ov.isConnected)return clearInterval(tmr);n--;const cd=ov.querySelector('.cd');if(cd)cd.textContent=`(${n})`;if(n<=0)go()},1000);
      const stop=()=>{clearInterval(tmr);const cd=ov.querySelector('.cd');if(cd)cd.textContent=''};ov.querySelector('[data-act=map]').addEventListener('pointermove',stop);
      const ak=e=>{if(!ov.isConnected)return document.removeEventListener('keydown',ak);if(e.key.startsWith('Arrow'))stop()};document.addEventListener('keydown',ak);return ov}
    return overlayCard(`<div class="ov-emo">👑</div>${starsHTML(3)}<h2>${cheer('top')}</h2><div class="sub-h">👑 أنهيت كل المستويات! أنت بطل «${g.t}»</div>${resultHTML(res,'ok')}<p>${msg}<br>أكملت المستويات الثلاثة بكل مراحلها الثلاثين 🎉</p><div class="ov-btns"><button class="play-btn" data-act="map">🗺️ المراحل</button><button class="play-btn" data-act="again">🔁 العب الصعب من جديد</button></div>`,
      {map:()=>showStart(g),again:()=>startGame(g,diff,1)})}
  if(perfect)
    return overlayCard(`<div class="ov-emo">🤩</div>${starsHTML(3)}<h2>${cheer('top')}</h2><div class="sub-h">✅ علامة كاملة · أنهيت المرحلة ${stage}</div>${resultHTML(res,'ok')}<p>${msg}${unlockedNow?`<br>🔓 فُتحت المرحلة ${stage+1}`:''}</p><div class="ov-btns"><button class="play-btn" data-act="next">▶ المرحلة ${stage+1}</button><button class="play-btn" data-act="retry">🔁 أعد المرحلة ${stage}</button><button class="play-btn" data-act="map">🗺️ المراحل</button></div>`,
      {next:()=>startGame(g,diff,stage+1),retry:()=>startGame(g,diff,stage),map:()=>showStart(g)});
  const s=ratio>=.8?2:1;
  overlayCard(`<div class="ov-emo">${s===2?'👍':'🙂'}</div>${starsHTML(s)}<h2>${cheer(s===2?'near':'low')}</h2>${resultHTML(res,'mid')}<p>${msg}<br>${nextOpen?'المرحلة التالية مفتوحة لك من قبل':`تحتاج علامة كاملة (${res.total} من ${res.total}) لفتح المرحلة ${stage+1} 🔒`}</p><div class="ov-btns"><button class="play-btn" data-act="retry">🔁 أعد المرحلة ${stage}</button>${nextOpen?`<button class="play-btn" data-act="next">▶ المرحلة ${stage+1}</button>`:''}<button class="play-btn" data-act="map">🗺️ المراحل</button></div>`,
    {retry:()=>startGame(g,diff,stage),next:()=>startGame(g,diff,stage+1),map:()=>showStart(g)})}
function gameOver(g,run,msg,res){sfx.bad();const D=DIFFS[run.diff];
  overlayCard(`<div class="ov-emo">💪</div><h2>${cheer(res&&res.got/res.total>=.6?'near':'low')}</h2>${resultHTML(res,'bad')}<p>${msg}<br>${D.e} ${D.t} · المرحلة ${run.stage} من ${STAGES}</p><div class="ov-btns"><button class="play-btn" data-act="retry">🔁 أعد المرحلة ${run.stage}</button><button class="play-btn" data-act="map">🗺️ المراحل</button></div>`,
    {retry:()=>startGame(g,run.diff,run.stage),map:()=>showStart(g)})}

/* ---------- celebration fountain ---------- */
function fountainSound(){if(!sound.on)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const A=actx,now=A.currentTime+.02;
  const noise=dur=>{const b=A.createBuffer(1,Math.ceil(A.sampleRate*dur),A.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=A.createBufferSource();s.buffer=b;return s};
  const n=noise(1.2),f=A.createBiquadFilter(),g=A.createGain();f.type='bandpass';f.Q.value=1.4;f.frequency.setValueAtTime(250,now);f.frequency.exponentialRampToValueAtTime(3800,now+.6);
  g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(.35,now+.3);g.gain.exponentialRampToValueAtTime(.001,now+1.1);n.connect(f).connect(g).connect(A.destination);n.start(now);n.stop(now+1.2);
  const o=A.createOscillator(),og=A.createGain();o.type='sine';o.frequency.setValueAtTime(170,now+.55);o.frequency.exponentialRampToValueAtTime(38,now+1.1);
  og.gain.setValueAtTime(.001,now+.5);og.gain.exponentialRampToValueAtTime(.55,now+.56);og.gain.exponentialRampToValueAtTime(.001,now+1.15);o.connect(og).connect(A.destination);o.start(now+.5);o.stop(now+1.2);
  for(let i=0;i<22;i++){const t=now+.55+Math.random()*1.0,c=noise(.05),cf=A.createBiquadFilter(),cg=A.createGain();cf.type='highpass';cf.frequency.value=1800+Math.random()*4500;
    cg.gain.setValueAtTime(.06+Math.random()*.22,t);cg.gain.exponentialRampToValueAtTime(.001,t+.045);c.connect(cf).connect(cg).connect(A.destination);c.start(t);c.stop(t+.05)}
  [1047,1319,1568,2093,1568,2637].forEach((fr,i)=>{const t=now+.75+i*.09,so=A.createOscillator(),sg=A.createGain();so.type='triangle';so.frequency.value=fr;
    sg.gain.setValueAtTime(.11,t);sg.gain.exponentialRampToValueAtTime(.001,t+.35);so.connect(sg).connect(A.destination);so.start(t);so.stop(t+.4)});
}catch(e){}}
/* نافورة واحدة خفيفة وسريعة (حركة مبنية على الوقت الفعلي، ودقة رسم محدودة للأداء) */
function fountain(){const st=$('#stage');st.querySelector('.fx')?.remove();const cv=document.createElement('canvas');cv.className='fx';st.append(cv);
  const r=st.getBoundingClientRect(),W=r.width,H=r.height,dpr=Math.min(1.5,devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);const x=cv.getContext('2d');
  const cols=['#ff4f9a','#ffcf3f','#4ade80','#38bdf8','#a78bfa','#fb923c','#f43f5e'],emo=['⭐','🎉','💖','✨'],P=[],G=.62,sz=Math.max(7,Math.min(W,H)/50),vmax=Math.sqrt(2*G*H*.92);
  for(let i=0;i<110;i++){const a=-Math.PI/2+(Math.random()-.5)*.95,v=vmax*(.6+Math.random()*.4);
    P.push({x:W/2+(Math.random()-.5)*18,y:H+8,vx:Math.cos(a)*v,vy:Math.sin(a)*v,rot:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[i%cols.length],s:sz*(.7+Math.random()*.7),sh:i%3,e:i%14===0?emo[(i/14|0)%emo.length]:null})}
  const t0=performance.now(),DUR=2300;let last=t0;
  (function loop(t){const k=Math.min(3,(t-last)/16.7);last=t;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);
    x.globalAlpha=Math.max(0,Math.min(1,(DUR-(t-t0))/500));let alive=0;
    for(const p of P){p.vy+=G*k;p.x+=p.vx*k;p.y+=p.vy*k;p.rot+=p.vr*k;if(p.y>H+30&&p.vy>0)continue;alive++;
      const cs=Math.cos(p.rot)*dpr,sn=Math.sin(p.rot)*dpr;x.setTransform(cs,sn,-sn,cs,p.x*dpr,p.y*dpr);
      if(p.e){x.font=`${p.s*2}px serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(p.e,0,0)}
      else{x.fillStyle=p.c;if(p.sh===0)x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);else{x.beginPath();if(p.sh===1)x.arc(0,0,p.s/2.4,0,7);else{x.moveTo(0,-p.s/2);x.lineTo(p.s/2,p.s/2);x.lineTo(-p.s/2,p.s/2)}x.fill()}}}
    if(t-t0<DUR&&alive&&cv.isConnected)requestAnimationFrame(loop);else cv.remove()})(t0)}
/* عبارات تحفيزية باللهجة البيضاء */
const CHEERS={
  top:['أبدااااع! 🤩','يا سلااام عليك! 👏','كفو والله! 💪','وحش! ما شاء الله 🔥','أسطورة! 🌟','ذيب! ما يوقفك شي 🐺','رهيييب! 🎉','فنّان! كمّل كذا 🏆','بطل! ولا غلطة 😎'],
  near:['باقي شوي! جرّب مرة ثانية 💪','قرّبت مرة! حاول كمان 🔥','ما بقى إلا القليل! 👌','شوية تركيز وتجيبها كاملة! 🎯','كنت قريب! يلا مرة ثانية 🚀'],
  low:['ولا يهمك، جرّب مرة ثانية 😊','عادي، كلنا نتعلّم! يلا كمان مرة 💪','المرة الجاية أحلى! 🌈','لا تستسلم، تقدر عليها! ⭐']};
function cheer(kind){const s=CHEERS[kind][rnd(0,CHEERS[kind].length-1)];
  setTimeout(()=>speak(s.replace(/[^\u0600-\u06FF\s!،]/g,'').replace(/(.)\1{2,}/g,'$1$1')),kind==='top'?900:300);return s}
function celebrate(){fountainSound();fountain()}
function updateFav(){const on=curGame&&favs.has(curGame.id);$('#favBtn').textContent=on?'❤️':'🤍';$('#favBtn').classList.toggle('on',on)}
function updateSound(){$('#soundBtn').textContent=sound.on?'🔊':'🔇'}

/* ---------- search ---------- */
const norm=s=>s.replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase();
function openSearch(){$('#search').hidden=false;$('#q').value='';renderSearch();setTimeout(()=>$('#q').focus(),50)}
function closeSearch(){$('#search').hidden=true}
function renderSearch(){const q=norm($('#q').value.trim());
  const list=q?GAMES.filter(g=>norm(g.t+' '+g.d+' '+CATS[g.cat].t).includes(q)):GAMES;
  $('#sHint').textContent=q?(list.length?`${list.length} نتيجة`:'لم نجد ألعاباً بهذا الاسم 🙈'):'كل الألعاب';
  $('#results').innerHTML=list.map(g=>tile(g,true)).join('')}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  if(e.target.closest('[data-soon]'))toast('قريباً جداً! 🚧');
  if(e.target.closest('[data-open-search]'))openSearch();
  if(e.target.closest('#search .tile'))closeSearch();
});
$('#search').addEventListener('click',e=>{if(e.target.id==='search')closeSearch()});
$('#closeSearch').onclick=closeSearch;$('#q').oninput=renderSearch;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();if(e.key==='/'&&$('#search').hidden&&!$('#view-home').hidden){e.preventDefault();openSearch()}});
$('#restartBtn').onclick=()=>{if(!curGame)return;cur?startGame(curGame,cur.c.run.diff,cur.c.run.stage):showStart(curGame)};
addEventListener('resize',()=>{if(cur)fitHud()});
$('#favBtn').onclick=()=>{if(!curGame)return;favs.has(curGame.id)?(favs.delete(curGame.id),toast('أُزيلت من المفضلة')):(favs.add(curGame.id),toast('أُضيفت إلى المفضلة ❤️'));store.set('favs',[...favs]);updateFav()};
$('#soundBtn').onclick=()=>{sound.on=!sound.on;store.set('sound',sound.on);updateSound()};
const isFs=()=>!!document.fullscreenElement||$('#stageWrap').classList.contains('pseudo-fs');
function exitFs(){const w=$('#stageWrap');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});if(w.classList.contains('pseudo-fs')){w.classList.remove('pseudo-fs');document.body.style.overflow='';dispatchEvent(new Event('resize'))}}
function enterFs(){const w=$('#stageWrap');(w.requestFullscreen?w.requestFullscreen():Promise.reject()).catch(()=>{w.classList.add('pseudo-fs');document.body.style.overflow='hidden';dispatchEvent(new Event('resize'))})}
$('#fsBtn').onclick=()=>isFs()?exitFs():enterFs();
$('#fsExit').onclick=exitFs;
$('#stage').addEventListener('click',e=>{if(e.target.closest('[data-lvl]'))openLevelPicker()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#stageWrap').classList.contains('pseudo-fs'))exitFs()});
addEventListener('hashchange',()=>{if(isFs())exitFs()});

function route(){stopGame();closeSearch();const hs=location.hash;let m;
  if((m=hs.match(/^#\/play\/([\w-]+)/))){const g=GAMES.find(x=>x.id===m[1]);if(g)return openGame(g)}
  m=hs.match(/^#\/cat\/(\w+)/);curGame=null;showHome(m?.[1])}
/* حركة الأيقونات: ميلان ثلاثي الأبعاد يتبع الماوس، ونبضة ولمعة عند اللمس قبل فتح اللعبة */
let lastPtr='mouse';
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const t=e.target.closest?.('.tile.has-img');if(!t)return;const r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
  t.style.setProperty('--ry',(px*12).toFixed(2)+'deg');t.style.setProperty('--rx',(-py*12).toFixed(2)+'deg')},{passive:true});
document.addEventListener('pointerout',e=>{const t=e.target.closest?.('.tile.has-img');if(t&&!t.contains(e.relatedTarget)){t.style.removeProperty('--rx');t.style.removeProperty('--ry')}});
document.addEventListener('pointerdown',e=>{lastPtr=e.pointerType;if(e.pointerType==='mouse')return;const t=e.target.closest?.('.tile.has-img');if(!t)return;t.classList.remove('tap');void t.offsetWidth;t.classList.add('tap');setTimeout(()=>t.classList.remove('tap'),600)},{passive:true});
document.addEventListener('click',e=>{const t=e.target.closest?.('a.tile.has-img');if(!t||lastPtr==='mouse'||t.dataset.go)return;e.preventDefault();t.dataset.go=1;beep(880,.05,'triangle',.06);
  setTimeout(()=>{delete t.dataset.go;location.hash=t.getAttribute('href')},230)},true);
/* ---------- مؤثرات احترافية مشتركة: لمعات عند النجاح واهتزاز عند الخطأ ---------- */
const FX={cv:null,ps:[],run:false,lastTap:null,
  layer(){const st=$('#stage');if(!this.cv||!this.cv.isConnected){this.cv=document.createElement('canvas');this.cv.className='fx-layer';st.append(this.cv)}
    const r=st.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);const w=Math.round(r.width*d),hh=Math.round(r.height*d);
    if(this.cv.width!==w||this.cv.height!==hh){this.cv.width=w;this.cv.height=hh}this.d=d;this.rect=r;return this.cv},
  burst(x,y,big){this.layer();const cols=['#fde047','#ffffff','#a7f3d0','#f9a8d4','#93c5fd','#fcd34d'],n=big?34:20;
    this.ps.push({ring:1,x,y,t:0,life:.45,r0:6,r1:big?110:70});
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(big?260:180)*(.45+Math.random()*.75);
      this.ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,t:0,life:.55+Math.random()*.45,s:(big?9:7)*(.6+Math.random()*.8),c:cols[i%cols.length],rot:Math.random()*3,star:i%3!==0})}
    if(!this.run){this.run=true;let last=performance.now();const f=t=>{const dt=Math.min(.05,(t-last)/1000);last=t;this.step(dt);if(this.ps.length&&this.cv&&this.cv.isConnected)requestAnimationFrame(f);else{this.run=false;this.ps=[];if(this.cv)this.cv.getContext('2d').clearRect(0,0,this.cv.width,this.cv.height)}};requestAnimationFrame(f)}},
  step(dt){const x=this.cv.getContext('2d'),d=this.d;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,this.cv.width,this.cv.height);x.setTransform(d,0,0,d,0,0);x.globalCompositeOperation='lighter';
    this.ps=this.ps.filter(p=>(p.t+=dt)<p.life);
    for(const p of this.ps){const k=p.t/p.life,al=1-k;
      if(p.ring){x.globalAlpha=al*.8;x.strokeStyle='#fff7c2';x.lineWidth=4*(1-k)+1;x.beginPath();x.arc(p.x,p.y,p.r0+(p.r1-p.r0)*Math.sqrt(k),0,7);x.stroke();continue}
      p.vy+=380*dt;p.vx*=.98;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*6;const s=p.s*(1-k*.5);x.globalAlpha=al;x.fillStyle=p.c;
      x.save();x.translate(p.x,p.y);x.rotate(p.rot);
      if(p.star){x.beginPath();for(let j=0;j<8;j++){const rr=j%2?s*.32:s;const aa=j*Math.PI/4;x.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr)}x.closePath();x.fill()}
      else{x.beginPath();x.arc(0,0,s*.45,0,7);x.fill()}x.restore()}
    x.globalAlpha=1;x.globalCompositeOperation='source-over'},
  at(big){const st=$('#stage');if(!st||!cur)return;const r=st.getBoundingClientRect();let x=r.width/2,y=r.height/2;
    const lt=this.lastTap;if(lt&&performance.now()-lt.t<1500){x=lt.x-r.left;y=lt.y-r.top}
    this.burst(x,y,big)},
  bad(){const w=$('#stageWrap');w.classList.remove('hit-bad');void w.offsetWidth;w.classList.add('hit-bad');setTimeout(()=>w.classList.remove('hit-bad'),360)}};
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('#stage'))FX.lastTap={x:e.clientX,y:e.clientY,t:performance.now()}},true);
{const g0=sfx.good,b0=sfx.bad;sfx.good=function(){g0.apply(this,arguments);try{if(cur)FX.at()}catch(e){}};sfx.bad=function(){b0.apply(this,arguments);try{if(cur)FX.bad()}catch(e){}}}
Object.assign(HOW,{"bflank":["🐦 انظر للطائر في منتصف السرب فقط","🙈 تجاهل الطيور حوله","🔴 إذا احمرّت السماء: اختر عكس اتجاهه"],"bdrops":["💧 حل المسألة داخل القطرة","⌨️ اكتب الجواب بالأزرار أو الكيبورد","🌊 لا تتركها تسقط في الماء"],"bleaf":["🎨 انظر للون الكلمة وتابع أوراق هذا اللون فقط","👉 «إشارة»: إلى أين تشير؟ «حركة»: إلى أين تتحرك؟","⚡ أجب بسرعة"],"brot":["🔄 دوّر الشكل الأول في عقلك","✔ نعم إذا كان نفسه بعد التدوير","✖ لا إذا كان مقلوباً كالمرآة"],"bmore":["👀 انظر للصندوقين","⚖️ اختر الذي فيه أكثر","⚡ لا تعدّ، قدّر بسرعة"],"bsort":["🧺 انظر للشيء في المنتصف","⬅️➡️ أرسله للسلة الصحيحة","⚡ كن سريعاً"],"bnew":["👀 احفظ الأشياء","🆕 بعدها يظهر شيء جديد","👆 المس الشيء الجديد"],"btreasure":["🐚 اختر كنزاً","🔄 الكنوز تتحرك بعد كل اختيار","🧠 لا تختر نفس الكنز مرتين"],"bpattern":["🔎 اكتشف القاعدة","🧩 ما الذي يأتي بعدها؟","👆 اختر الجواب"],"bscale":["⚖️ انظر للموازين","🍎 كل ثمرة تساوي عدداً من الأخرى","🧮 استنتج الجواب"],"bfrog":["🐸 تابع قفزات الضفدع","🧠 احفظ الترتيب","👆 أعد نفس القفزات"],"bcode":["🔐 انظر لمفتاح الرموز في الأعلى","🔢 كل رمز له رقم","⚡ اختر رقم الرمز بسرعة"],"bgo":["⭐ اضغط عند النجمة الخضراء","✋ لا تضغط عند اليد الحمراء","⚡ كن سريعاً ومنتبهاً"],"bshadow":["👀 انظر للشكل الملوّن","👤 جد ظله المطابق","⏱️ قبل انتهاء الوقت"],"bseen":["📸 احفظ الأشياء","❓ بعدها يُسأل عن شيء","✔ نعم إذا كان منها"],"bchain":["🔢 ابدأ بالرقم الأول","➕➖ طبّق العمليات في رأسك","✅ اختر النتيجة النهائية"],"bsize":["📏 انظر للأحجام","👆 المس من الأصغر للأكبر","⏱️ قبل انتهاء الوقت"],"bshift":["⬆️ في الأعلى: هل العدد زوجي؟","⬇️ في الأسفل: هل الحيوان يطير؟","🔀 انتبه لمكان البطاقة"],"bnames":["👋 احفظ اسم كل صديق","🧑 يظهر وجه","👆 اختر اسمه الصحيح"],"breact":["⏳ انتظر حتى يصير الزر أخضر","👆 اضغط بأسرع ما يمكن","✋ لا تضغط قبل الأخضر"]});
Object.assign(HOW,{
 'bmatrix':['👀 احفظ أماكن المربعات المضيئة','👆 بعد ما تنطفئ، المس نفس المربعات','❌ لمسة خاطئة تنهي الجولة'],
 'bstroop':['🎨 انظر للكلمة ولون كتابتها','✔ نعم إذا كان المعنى مثل اللون، ✖ لا إذا اختلف','⚡ أجب بسرعة قبل انتهاء الشريط'],
 'bmatch':['👀 احفظ الشكل الذي يظهر','✔ نعم إذا كان الشكل الجديد مثل السابق','✖ لا إذا كان مختلفاً'],
 'bcount':['👀 انظر للأشياء بسرعة','🔢 تختفي بعد ثوانٍ','👆 اختر العدد الصحيح'],
 'bcups':['⚽ انتبه لمكان الكرة','🔄 تابع الكوب وهو يتحرك','👆 المس الكوب الذي فيه الكرة'],
 'bodd':['🔍 كل الأشكال متشابهة إلا واحداً','👆 المس الشكل المختلف','⏱️ قبل انتهاء الوقت'],
 'bdigits':['👀 احفظ الأرقام وهي تظهر','⌨️ اكتبها بنفس الترتيب','✔ الأرقام تزيد كل مرحلة'],
 'bschulte':['1️⃣ المس الرقم 1 ثم 2 ثم 3...','⚡ بأسرع وقت','❌ لا تلمس رقماً خارج الترتيب'],
 'pacman':['⬆️⬇️⬅️➡️ حرّك باكمان بالأسهم أو بالسحب','🟡 كُل كل النقاط في المتاهة','👻 تجنّب الأشباح، والكرة الكبيرة تجعلها خائفة'],
 'jigsaw':['👆 المس قطعة ثم قطعة أخرى لتبدّلهما','🖼️ انظر للصورة الكاملة بجانب اللوحة','⏱️ أكمل الصورة قبل انتهاء الوقت'],
 'coloring':['🎨 اختر لوناً من الأسفل','👆 المس المربعات التي تحمل نفس الرقم','🖍️ تقدر تسحب إصبعك لتلوّن بسرعة'],
 'sea':['🐠 حرّك السمكة بالأسهم أو بإصبعك','🐚 اجمع الأصداف، والنجمة تساوي 3','🦈 ابتعد عن أسماك القرش'],
 'dinos':['👆 اضغط لتقفز','🌵 اقفز فوق الصبار والصخور','🥚 اجمع البيض وأنت تقفز'],
 'piano':['🎵 المس البلاطة الداكنة الأقرب للأسفل','🎹 كل لمسة صحيحة تعزف نغمة','⚠️ لا تترك البلاطة تفوتك'],
 'kitchen':['🧾 اقرأ طلب الزبون','🍅 أضف كل إضافة بالعدد المطلوب','🍽️ اضغط قدّم عندما تجهز'],
 'castle':['⬆️⬇️⬅️➡️ تحرّك في المتاهة','🗝️ خذ المفتاح أولاً','🏰 ثم ادخل القلعة وتجنّب الأشباح'],
 'bee':['👆 اضغط لترفرف النحلة','🌸 مرّ بين الأزهار دون أن تصطدم','🍯 اجمع العسل في طريقك']});
addEventListener('hashchange',route);updateSound();route();
