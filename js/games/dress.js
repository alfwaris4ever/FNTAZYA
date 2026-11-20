/* لعبة: G.dress (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
const KEYS9=['top.c','bot.c','shoes.c','hair.s','hair.c','acc','top.s','bot.s','shoes.s'],SLOT_OF=k=>k.split('.')[0],SLOT_T={top:'👕 القميص',bot:'👖 الأسفل',shoes:'👟 الحذاء',hair:'💇 الشعر',acc:'🎀 زينة'};
function randLook(cols){const p=a=>a[rnd(0,a.length-1)];return{skin:p(SKINS),'top.s':p(D_OPT['top.s'])[0],'top.c':p(cols),'bot.s':p(D_OPT['bot.s'])[0],'bot.c':p(cols),'shoes.s':p(D_OPT['shoes.s'])[0],'shoes.c':p(cols),'hair.s':p(D_OPT['hair.s'])[0],'hair.c':p(HCOL),acc:p(D_OPT.acc)[0]}}
/* 21+25) غرفة الأزياء (Vortella's Dress Up) وتذكّر الإطلالة (Anime Dress Up) */
G.dress=mem=>(root,c)=>{
  const nA=c.lv<10?3:c.lv<20?6:9,act=KEYS9.slice(0,nA),cols=shuffle(PAL.map(p=>p[1])).slice(0,c.fi(4,9)),tl=c.lv>=10?Math.round(c.f(80,40)):0;let peeks=mem?(c.lv<10?2:c.lv<20?1:0):0,hidden=false;
  const tgt=randLook(cols),me={...tgt};act.forEach(k=>{const opts=k.endsWith('.c')?(k==='hair.c'?HCOL:cols):D_OPT[k].map(o=>o[0]);let v;do{v=opts[rnd(0,opts.length-1)]}while(v===tgt[k]&&opts.length>1);me[k]=v});
  const slots=[...new Set(act.map(SLOT_OF))];let tab=slots[0];
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">👗 ${mem?'تذكّر الإطلالة وأعد تلبيسها':'لبّسها مثل الصورة'}</span></div><div class="body"${tl?' style="bottom:36px"':''}><div class="dr-wrap"><div class="dr-stage"><div class="dr-tg"><small>المطلوب</small><div class="dr-svg"></div><button class="dr-peek" hidden>👀 نظرة</button></div><div class="dr-me"></div></div><div class="dr-panel"><div class="dr-tabs"></div><div class="dr-opts"></div><button class="play-btn dr-done">✅ انتهيت</button></div></div></div>`;
  const q=s=>root.querySelector(s),wrap=q('.dr-wrap');
  function draw(){q('.dr-me').innerHTML=doll(me);q('.dr-svg').innerHTML=hidden?'<div class="dr-hid">❓</div>':doll(tgt);const pk=q('.dr-peek');pk.hidden=!(hidden&&peeks>0);pk.textContent=`👀 نظرة (${peeks})`;
    q('.dr-tabs').innerHTML=slots.map(s=>`<button class="dr-tab${s===tab?' sel':''}" data-s="${s}">${SLOT_T[s]}</button>`).join('');q('.dr-tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{tab=b.dataset.s;sfx.pop();draw()});
    const ks=act.filter(k=>SLOT_OF(k)===tab);q('.dr-opts').innerHTML=ks.map(k=>{const cl=k.endsWith('.c'),opts=cl?(k==='hair.c'?HCOL:cols).map(v=>[v,'']):D_OPT[k];
      return `<div class="dr-row">${opts.map(([v,l])=>`<button class="${cl?'dr-sw':'dr-st'}${me[k]===v?' sel':''}" data-k="${k}" data-v="${v}" ${cl?`style="background:${v}" aria-label="لون"`:''}>${cl?'':l}</button>`).join('')}</div>`}).join('');
    q('.dr-opts').querySelectorAll('button').forEach(b=>b.onclick=()=>{me[b.dataset.k]=b.dataset.v;beep(800,.04,'triangle',.07);draw()})}
  q('.dr-peek').onclick=()=>{if(peeks<=0)return;peeks--;hidden=false;draw();c.after(()=>{hidden=true;draw()},1800)};
  const check=()=>{const got=act.filter(k=>me[k]===tgt[k]).length,r={got,total:act.length,label:'القطع المطابقة',perfect:got===act.length};hidden=false;draw();
    got===act.length?c.win(got*10+(tb?Math.round(tb.left()):0),'إطلالة مطابقة تماماً! 👗✨',r):got>=act.length/2?c.win(got*10,'قريبة جداً! انظر للفروق',r):c.lose('الإطلالة مختلفة كثيراً',r)};
  q('.dr-done').onclick=check;
  function size(){const r=wrap.parentElement.getBoundingClientRect();wrap.classList.toggle('land',r.width>r.height*1.05)}c.on(window,'resize',size);size();
  if(mem){c.after(()=>{hidden=true;draw();toast('🙈 الآن أعد تلبيسها من ذاكرتك')},Math.round(c.f(7000,2600)))}
  const tb=tl?c.timeBar(root,tl,check):null;draw();
};
