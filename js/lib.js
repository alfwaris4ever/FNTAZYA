/* فنتازيا: دوال وبيانات مشتركة تستخدمها أكثر من لعبة. تعديل أي شيء هنا يؤثر على عدة ألعاب. */
/* أسئلة: عدد الأسئلة يزيد من 5 إلى 10، والمؤقت يبدأ من الدرجة 9 ويقصر تدريجياً */
/* ---------- أسئلة الاختيار على شكل سباق سيارات: السؤال فوق، وكل إجابة لوحة فوق مسار، واللاعب يوجّه السيارة لمسار الإجابة قبل وصول اللوحات ---------- */
/* secs (اختياري): وقت كل سؤال بالثواني. بدونه: سهل 5، وسط 4، صعب 3 ثواني */
/* بيئات السباق: الإسفلت ثابت (رمادي غامق) في كل البيئات، والمتغير هو السماء والأرض والخلفية وما على جانبي الطريق */
const DRV_ENVS=[
  {n:'صحراء',sky:['#4f9de8','#fde7a8'],g:['#f0cb80','#e3b562'],far:'dunes',fc:['#e7b65f','#d39a45'],pole:'marker',curb:'#f97316',near:['🌵','🪨','🌾','🌵'],big:['🌴','🌴','🐪','🌵','🏜️','🌴','🐫']},
  {n:'مدينة',sky:['#3b82f6','#cfe3ff'],g:['#cfd6df','#b8c1cc'],far:'city',fc:['#93a4bd','#6b7c96'],pole:'lamp',curb:'#3b82f6',near:['🌳','🌷','🚏','🌳'],big:['🏢','🏬','🏫','🏨','🏦','🏪','🏥','🏢']},
  {n:'غابة',sky:['#4aa3df','#d8f3dc'],g:['#5cc46a','#46ad55'],far:'hills',fc:['#2f8f4e','#1f6e3b'],pole:'marker',curb:'#16a34a',near:['🍄','🌿','🪨','🌼'],big:['🌳','🌲','🌲','🌳','🦌','🏕️','🌲']},
  {n:'شاطئ',sky:['#22a6e8','#e0f4ff'],g:['#fbe3a0','#f5d27e'],far:'sea',fc:['#0ea5e9','#0369a1'],pole:'lamp',curb:'#06b6d4',near:['🐚','🦀','🌺','🐚'],big:['🌴','⛱️','🌴','🏖️','🌴','⛱️']},
  {n:'ثلج',sky:['#7cc4f2','#f0f9ff'],g:['#f8fafc','#e5edf5'],far:'mountains',fc:['#a8b8cc','#7d8fa8'],pole:'marker',curb:'#60a5fa',near:['❄️','🪨','🌨️'],big:['⛄','🌲','🌲','🏠','🦌','🌲','⛄']},
  {n:'مزرعة',sky:['#4fb3ef','#eefcf0'],g:['#a7d65a','#93c44a'],far:'hills',fc:['#6aa834','#4d8a22'],pole:'fence',curb:'#eab308',near:['🌻','🌾','🌷','🌼'],big:['🐄','🐑','🚜','🏡','🌳','🐓','🐴','🌻']},
  {n:'أرض الحلوى',sky:['#f472b6','#fde7f3'],g:['#fbd0e6','#f8b8d8'],far:'hills',fc:['#f08cc4','#d9589f'],pole:'candy',curb:'#ec4899',near:['🍬','🍭','🍬','🍩'],big:['🧁','🍭','🍦','🎂','🍩','🍫','🍭']},
  {n:'خريف',sky:['#f59e5b','#fff1d6'],g:['#e9a55c','#dc914a'],far:'mountains',fc:['#b45f3a','#8c4328'],pole:'fence',curb:'#dc2626',near:['🍂','🍁','🍄','🍂'],big:['🍁','🌳','🎃','🏡','🦊','🍁']},
];
const DRV_CARS=['#ef4444','#3b82f6','#facc15','#22c55e','#f97316','#a855f7','#ec4899','#f1f5f9'];
/* صور الإيموجي تُرسم مرة واحدة ثم تُنسخ كصورة في كل إطار (أسرع بكثير من رسم النص كل مرة) */
const DRV_SPR=new Map();const drvSpr=e=>{let s=DRV_SPR.get(e);if(!s){s=document.createElement('canvas');s.width=s.height=160;const k=s.getContext('2d');k.font='120px serif';k.textAlign='center';k.textBaseline='middle';k.fillText(e,80,84);DRV_SPR.set(e,s)}return s};
/* أصوات السباق مولّدة بالكامل داخل اللعبة (بلا ملفات): محرك بتغيير نمر، صوت الطريق، بوري، وصوت تغيير المسار */
function drvAudio(){if(!sound.on)return null;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();actx.resume?.()}catch(e){return null}
  const A=actx,now=()=>A.currentTime,out=A.createGain();out.gain.value=0;out.connect(A.destination);
  const o1=A.createOscillator(),o2=A.createOscillator(),lp=A.createBiquadFilter(),eg=A.createGain();o1.type='sawtooth';o2.type='square';lp.type='lowpass';lp.Q.value=4;eg.gain.value=.05;const o2g=A.createGain();o2g.gain.value=.45;
  o1.connect(lp);o2.connect(o2g).connect(lp);lp.connect(eg).connect(out);
  const nb=A.createBuffer(1,A.sampleRate*2,A.sampleRate),ch=nb.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;
  const ns=A.createBufferSource();ns.buffer=nb;ns.loop=true;const bp=A.createBiquadFilter();bp.type='bandpass';bp.frequency.value=380;bp.Q.value=.6;const rg=A.createGain();rg.gain.value=.03;ns.connect(bp).connect(rg).connect(out);
  o1.start();o2.start();ns.start();out.gain.setTargetAtTime(1,now(),.3);
  let gear=1,rpm=.3,stopped=false;
  const burst=(f,d,v,type='highpass')=>{const s=A.createBufferSource();s.buffer=nb;const fl=A.createBiquadFilter();fl.type=type;fl.frequency.value=f;const g=A.createGain();g.gain.setValueAtTime(v,now());g.gain.exponentialRampToValueAtTime(.001,now()+d);s.connect(fl).connect(g).connect(A.destination);s.start();s.stop(now()+d)};
  const api={
    update(dt,on){if(stopped)return;out.gain.setTargetAtTime(on?1:0,now(),.08);if(!on)return;
      /* المحرك يرفع الدورات ثم يغيّر النمرة، حتى النمرة الخامسة ثم يثبت مع تموج خفيف */
      if(gear<5){rpm+=dt*(.55/gear);if(rpm>=1){gear++;rpm=.55;api.shift()}}else rpm=.78+Math.sin(now()*1.7)*.04;
      const f=38+rpm*70+gear*6;o1.frequency.setTargetAtTime(f,now(),.05);o2.frequency.setTargetAtTime(f/2,now(),.05);lp.frequency.setTargetAtTime(380+rpm*1100,now(),.05)},
    shift(){eg.gain.cancelScheduledValues(now());eg.gain.setValueAtTime(.05,now());eg.gain.linearRampToValueAtTime(.012,now()+.06);eg.gain.linearRampToValueAtTime(.05,now()+.22);burst(2500,.05,.05)},
    horn(n=2){if(!sound.on)return;for(let i=0;i<n;i++){const t=now()+i*.22;[392,494].forEach(fq=>{const o=A.createOscillator(),g=A.createGain(),f2=A.createBiquadFilter();o.type='square';o.frequency.value=fq;f2.type='lowpass';f2.frequency.value=1800;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.02);g.gain.setValueAtTime(.05,t+.14);g.gain.linearRampToValueAtTime(0,t+.17);o.connect(f2).connect(g).connect(A.destination);o.start(t);o.stop(t+.2)})}},
    whoosh(){if(sound.on)burst(900,.18,.06,'bandpass')},
    stop(){if(stopped)return;stopped=true;out.gain.setTargetAtTime(0,now(),.05);setTimeout(()=>{try{o1.stop();o2.stop();ns.stop();out.disconnect()}catch(e){}},400)}};
  return api}
const drvShade=(hex,a)=>{const v=parseInt(hex.slice(1),16),f=u=>Math.max(0,Math.min(255,Math.round(a<0?u*(1+a):u+(255-u)*a)));return '#'+[(v>>16)&255,(v>>8)&255,v&255].map(f).map(u=>u.toString(16).padStart(2,'0')).join('')};
function quiz(root,c,{make,secs}){
  const total=c.fi(5,10),driveT=secs!=null?secs:[5,4,3][c.run.diff],ENV=DRV_ENVS[rnd(0,DRV_ENVS.length-1)],CAR=DRV_CARS[rnd(0,DRV_CARS.length-1)];
  /* عالم ثلاثي الأبعاد مبسّط: R نصف عرض الطريق، d بُعد الشيء عن الكاميرا، والسيارة عند d=1. الطريق يتحرك بسرعة ثابتة طول اللعبة */
  const R=1,DS=16,DF=70,DA=1.4,V=(DS-DA)/driveT,DK=8.5,GH=1.05;
  let q=0,score=0,lock=true,cur=null,n=3,lane=1,carX=null,signs=[],dead=false,t0=performance.now(),res=null,shake=0,S=0,gw=null,g=0,last=null,ansAt=0,G=null,geoN=0,bw=100;const au=drvAudio();
  root.innerHTML=`<style>
    .drv-cv{position:absolute;inset:0;width:100%;height:100%;display:block}
    .drv-q{position:absolute;top:calc(var(--hud,58px) + 2px);left:50%;translate:-50% 0;z-index:4;background:#fff;color:#1d2350;border-radius:22px;padding:6px 18px 8px;text-align:center;box-shadow:0 6px 0 rgba(29,35,80,.18),0 10px 24px rgba(0,0,0,.12);max-width:92%;min-width:min(260px,80%);font:800 clamp(24px,7cqmin,46px) system-ui,Tahoma,sans-serif;line-height:1.2}
    .drv-q .big-pic,.drv-q .big-letter{font-size:clamp(40px,11cqmin,84px);line-height:1.05;color:#5b3cff}.drv-q .q-hint{font-size:clamp(14px,3.6cqmin,21px);color:#555b85;margin-top:2px}
    .drv-q .blob{width:clamp(46px,12cqmin,86px);height:clamp(46px,12cqmin,86px);margin:2px auto}.drv-q .stroop{font-size:clamp(34px,9cqmin,64px)}.drv-q .q-word{font-size:clamp(16px,4cqmin,24px)}
    #stage .drv-q,#stage .drv-q *{color:#1d2350!important;text-shadow:none!important;opacity:1!important}#stage .drv-q .big-letter,#stage .drv-q .big-pic{color:#5b3cff!important}#stage .drv-q .q-hint{color:#555b85!important}
    #stage .hud .pill{background:rgba(29,35,80,.78)!important;color:#fff!important}#stage .hud .pill b{color:#facc15!important}
    .drv-signs{position:absolute;inset:0;z-index:3;pointer-events:none}
    .drv-sign{position:absolute;left:0;top:0;transform-origin:50% 0;will-change:transform,opacity;pointer-events:auto;cursor:pointer;background:linear-gradient(#1fa855,#11793a);color:#fff;border:3px solid #fff;border-radius:12px;box-shadow:0 0 0 2px #0b5a2b,0 6px 12px rgba(0,0,0,.3);display:grid;place-items:center;text-align:center;font-weight:900;line-height:1.1;padding:.25em .2em;overflow:hidden;text-shadow:0 2px 0 rgba(0,0,0,.25)}
    .drv-sign::after{content:"⬇";display:block;font-size:.55em;opacity:.9}
    .drv-sign .pic{font-size:1.5em;line-height:1}.drv-sign .cap{display:none;font-size:.55em}.drv-sign.show-cap .cap{display:block}.drv-sign .ltr-choice{font-size:1.3em}
    .drv-sign.mine{outline:4px solid #facc15;outline-offset:2px}
    .drv-sign.ok{background:linear-gradient(#4ade80,#16a34a);outline:5px solid #fff}.drv-sign.bad{background:linear-gradient(#f87171,#b91c1c);outline:5px solid #fecaca}
  </style><canvas class="drv-cv"></canvas><div class="drv-signs"></div><div class="hud">${c.tag}<span class="pill">❓ <b class="qn">0</b> من ${total}</span><span class="pill">⭐ <b class="sc">0</b></span></div><div class="drv-q"></div><div class="tbar" role="progressbar" aria-label="الوقت المتبقي"><i></i></div>`;
  const cv=root.querySelector('.drv-cv'),x=cv.getContext('2d'),$q=root.querySelector('.drv-q'),$s=root.querySelector('.drv-signs'),bar=root.querySelector('.tbar'),fill=bar.firstElementChild;
  let W=0,H=0,dpr=1;const size=()=>{const r=root.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);geoN=0;signBase()};size();c.on(window,'resize',size);
  /* مقاس اللوحات الأساسي يُحسب مرة لكل سؤال، والحركة بعدها بالتحريك والتكبير فقط (سلس وخفيف على الجهاز) */
  function signBase(){if(!signs.length)return;bw=Math.max(40,W*.94/n-8);signs.forEach(s=>{const el=s.el,Lc=[...el.textContent.trim()].length||2;el.style.width=bw+'px';el.style.minHeight=(bw*.42)+'px';el.style.fontSize=Math.max(12,Math.min(46,bw*.2,bw/(Math.max(2,Lc)*.62)))+'px'})}
  const geo=()=>{const qb=$q.getBoundingClientRect(),rr=root.getBoundingClientRect(),qB=qb.bottom-rr.top,hy=Math.max(H*.3,qB+H*.1),yc=H-30-Math.min(50,H*.06),hw=Math.min(W*.5,(yc-hy)*2.1);return{hy,yc,hw,qB}};
  const Py=d=>G.hy+(G.yc-G.hy)/d,Ps=d=>G.hw/d,PX=(X,d)=>W/2+X*G.hw/d,LXw=i=>-R+2*R*(i+.5)/n;
  const quad=(Xa,Xb,da,db)=>{const ya=Py(da),yb=Py(db),sa=Ps(da),sb=Ps(db);x.beginPath();x.moveTo(W/2+Xa*sa,ya);x.lineTo(W/2+Xb*sa,ya);x.lineTo(W/2+Xb*sb,yb);x.lineTo(W/2+Xa*sb,yb);x.closePath();x.fill()};
  const dB=()=>Math.max(.2,(G.yc-G.hy)/(H-G.hy+4));
  /* شرائح تتكرر على طول الطريق (خطوط المسارات، الرصيف، أشرطة الأرض) وكلها تتحرك مع نفس S فتبقى متطابقة */
  const strips=(per,len,cb)=>{const b=dB();for(let k=Math.floor((S+b)/per)-1;;k++){let d0=k*per-S,d1=d0+len;if(d0>DF)break;d0=Math.max(d0,b);d1=Math.min(d1,DF);if(d1>d0)cb(d0,d1,k)}};
  /* الخلفية البعيدة ثابتة لكل لعبة */
  const seed=[...Array(40)].map(()=>Math.random());
  const clouds=[...Array(5)].map(()=>({x:Math.random(),y:.15+Math.random()*.5,s:.6+Math.random()*.7,v:.004+Math.random()*.006}));
  /* أشياء جانبي الطريق: كبيرة بعيدة (أشجار، بيوت، حيوانات) وصغيرة قريبة من الرصيف */
  const objs=[];const spawn=(o,w)=>{const side=Math.random()<.5?-1:1,bg=Math.random()<.62;o.w=w;o.X=side*(bg?R+.75+Math.random()*2.8:R+.42+Math.random()*.45);o.e=bg?ENV.big[rnd(0,ENV.big.length-1)]:ENV.near[rnd(0,ENV.near.length-1)];o.k=bg?.95+Math.random()*.7:.38+Math.random()*.2;return o};
  for(let i=0;i<40;i++)objs.push(spawn({},.6+Math.random()*48));
  function setLane(i){if(lock&&g>=1)return;const nl=Math.max(0,Math.min(n-1,i));if(nl!==lane&&cur)au?.whoosh();lane=nl;signs.forEach((s,k)=>s.el.classList.toggle('mine',k===lane))}
  c.on(window,'keydown',e=>{if(c.paused)return;if(e.key==='ArrowLeft'||e.key==='a'){e.preventDefault();setLane(lane-1)}else if(e.key==='ArrowRight'||e.key==='d'){e.preventDefault();setLane(lane+1)}
    else{const d=parseInt(e.key,10);if(d>=1&&d<=n){e.preventDefault();setLane(d-1)}}});
  let sx=null;c.on(cv,'pointerdown',e=>{sx=e.clientX});c.on(cv,'pointerup',e=>{if(sx==null)return;const dx=e.clientX-sx,r=cv.getBoundingClientRect();sx=null;
    if(Math.abs(dx)>25)setLane(lane+(dx>0?1:-1));else setLane(lane+(e.clientX-r.left<carX?-1:1))});
  function answer(i){lock=true;ansAt=performance.now();const s=signs[i],ok=!!s?.ok,okS=signs.find(z=>z.ok);
    if(ok){s.el.classList.add('ok');score++;root.querySelector('.sc').textContent=score;sfx.good();cur.onOk?.();res={t:'+1',col:'#16a34a',a:performance.now()}}
    else{s?.el.classList.add('bad');okS?.el.classList.add('ok');sfx.bad();au?.horn(1);shake=.5;res={t:'✗',col:'#dc2626',a:performance.now()}}
    cur.onAnswer?.(okS?.el);c.after(next,cur.delay||1300)}
  /* السؤال التالي: البوابة الجديدة تظهر من بعيد والطريق مستمر بلا توقف، والسيارة تبقى في مسارها */
  function next(){if(q>=total){dead=true;au?.stop();return c.win(score*10,score===total?'كل إجاباتك صحيحة! 🌟':(total-score===1?'أخطأت في سؤال واحد':total-score===2?'أخطأت في سؤالين':`أخطأت في ${total-score} أسئلة`),{got:score,total,perfect:score===total,label:'إجابات صحيحة'})}
    q++;root.querySelector('.qn').textContent=q;cur=make();$q.innerHTML=cur.q;const ch=shuffle(cur.choices),pn=n;n=ch.length;$s.innerHTML='';
    signs=ch.map((o,k)=>{const el=h(`<div class="drv-sign"${o.ok?' data-ok':''}>${o.html}</div>`);el.onpointerdown=e=>{e.stopPropagation();setLane(k)};el.style.display='none';$s.append(el);return{el,ok:o.ok}});
    signBase();geoN=0;if(q===1||n!==pn)lane=Math.floor((n-1)/2);else lane=Math.min(lane,n-1);setLane(lane);if(q===1)au?.horn(2);gw=S+DS;g=0;res=null;lock=false;ansAt=0;cur.onShow?.()}
  /* سيارة رياضية من الخلف: عريضة ومنخفضة، جناح خلفي، شريط إضاءة خلفي، خطوط سباق، ناشر هواء وأربع عوادم */
  const STR=['#f1f5f9','#facc15'].includes(CAR)?'#1f2937':'#ffffff';
  function car(X,Yb,s,t,tilt){x.save();x.translate(X+(shake>0?Math.sin(t*60)*6*shake:0),Yb+Math.sin(t*22)*.5);x.scale(s,s);x.rotate(tilt);
    const body=x.createLinearGradient(0,-82,0,-8);body.addColorStop(0,drvShade(CAR,.4));body.addColorStop(.45,CAR);body.addColorStop(1,drvShade(CAR,-.35));
    x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(0,0,86,10,0,0,7);x.fill();
    /* الإطارات العريضة */
    x.fillStyle='#0b0f17';x.beginPath();x.roundRect(-78,-30,28,30,7);x.roundRect(50,-30,28,30,7);x.fill();x.strokeStyle='#2b3240';x.lineWidth=2;for(const sx of[-64,64])for(let i=-24;i<-2;i+=6){x.beginPath();x.moveTo(sx-10,i);x.lineTo(sx+10,i);x.stroke()}
    /* الجسم السفلي: أعرض من تحت وأكتاف منحنية */
    x.fillStyle=body;x.beginPath();x.moveTo(-74,-14);x.lineTo(-76,-40);x.quadraticCurveTo(-74,-58,-56,-62);x.lineTo(56,-62);x.quadraticCurveTo(74,-58,76,-40);x.lineTo(74,-14);x.quadraticCurveTo(72,-8,64,-8);x.lineTo(-64,-8);x.quadraticCurveTo(-72,-8,-74,-14);x.closePath();x.fill();
    /* المقصورة المنخفضة المائلة */
    x.fillStyle=drvShade(CAR,-.12);x.beginPath();x.moveTo(-46,-60);x.quadraticCurveTo(-40,-84,-24,-88);x.lineTo(24,-88);x.quadraticCurveTo(40,-84,46,-60);x.closePath();x.fill();
    const gl=x.createLinearGradient(0,-86,0,-62);gl.addColorStop(0,'#0f172a');gl.addColorStop(1,'#3b6ea5');x.fillStyle=gl;x.beginPath();x.moveTo(-38,-63);x.quadraticCurveTo(-33,-80,-21,-83);x.lineTo(21,-83);x.quadraticCurveTo(33,-80,38,-63);x.closePath();x.fill();
    x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.moveTo(-20,-82);x.lineTo(-11,-82);x.lineTo(-24,-64);x.lineTo(-32,-64);x.closePath();x.fill();
    /* خطوط السباق */
    x.fillStyle=STR;x.globalAlpha=.9;x.fillRect(-15,-88,9,26);x.fillRect(6,-88,9,26);x.fillRect(-15,-60,9,22);x.fillRect(6,-60,9,22);x.globalAlpha=1;
    /* الجناح الخلفي */
    x.fillStyle='#111827';x.fillRect(-44,-74,5,14);x.fillRect(39,-74,5,14);x.beginPath();x.roundRect(-70,-80,140,8,3);x.fill();x.fillStyle='#374151';x.fillRect(-70,-80,140,2);x.fillStyle='#111827';x.fillRect(-72,-84,6,16);x.fillRect(66,-84,6,16);
    /* شريط الإضاءة الخلفي */
    x.save();x.shadowColor='#ff2a2a';x.shadowBlur=14;x.fillStyle='#ef4444';x.beginPath();x.roundRect(-70,-52,140,7,3);x.fill();x.restore();x.fillStyle='#fecaca';x.fillRect(-66,-50,22,3);x.fillRect(44,-50,22,3);
    x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1.5;x.beginPath();x.moveTo(-60,-38);x.lineTo(60,-38);x.stroke();
    /* ناشر الهواء والعوادم */
    x.fillStyle='#111827';x.beginPath();x.roundRect(-62,-24,124,16,5);x.fill();x.strokeStyle='#374151';x.lineWidth=2;for(let i=-36;i<=36;i+=12){x.beginPath();x.moveTo(i,-22);x.lineTo(i,-10);x.stroke()}
    for(const ex of[-50,-38,38,50]){x.fillStyle='#cbd5e1';x.beginPath();x.arc(ex,-14,5,0,7);x.fill();x.fillStyle='#0b0f17';x.beginPath();x.arc(ex,-14,3,0,7);x.fill()}
    x.restore()}
  /* الخلفية البعيدة: كثبان، تلال، جبال بقمم ثلجية، مباني المدينة، أو البحر */
  function drawFar(){const hy=G.hy,f=ENV.far,c1=ENV.fc[0],c2=ENV.fc[1];
    if(f==='sea'){const sg=x.createLinearGradient(0,hy,0,hy+H*.06);sg.addColorStop(0,c2);sg.addColorStop(1,c1);x.fillStyle=sg;x.fillRect(0,hy-H*.012,W,H*.07);
      x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1.5;for(let i=0;i<14;i++){const yy=hy+seed[i]*H*.05,xx=((seed[i+14]*W+(performance.now()-t0)*.01*(i%3+1))%(W+40))-20;x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+14+seed[i]*20,yy);x.stroke()}return}
    if(f==='city'){for(let L=0;L<2;L++){for(let i=0;i<20;i++){x.fillStyle=L?c2:c1;const bw=W/16*(.7+seed[i]*.6),bx=(i/20)*W*1.1-W*.05+(L?W*.03:0),bh=H*(.05+seed[(i+L*7)%40]*.12)*(L?.8:1.1);x.fillRect(bx,hy-bh,bw,bh+2);
      if(L){x.fillStyle='rgba(255,248,200,.55)';for(let r=hy-bh+5;r<hy-4;r+=9)for(let cc=bx+4;cc<bx+bw-5;cc+=8)x.fillRect(cc,r,3,4)}}}return}
    for(let L=0;L<2;L++){x.fillStyle=L?c2:c1;x.beginPath();x.moveTo(0,hy+2);
      if(f==='mountains'){const k=L?6:5,hs=[];for(let i=0;i<=k;i++){const px=i/k*W,ph=H*(.07+seed[i+L*9]*.1)*(L?.75:1);hs.push([px,ph]);x.lineTo(px-W/k/2,hy-ph*.25);x.lineTo(px,hy-ph)}x.lineTo(W,hy+2);x.fill();
        x.fillStyle='rgba(255,255,255,.85)';hs.forEach(([px,ph])=>{x.beginPath();x.moveTo(px,hy-ph);x.lineTo(px-ph*.28,hy-ph*.72);x.lineTo(px+ph*.28,hy-ph*.72);x.fill()});continue}
      const amp=f==='dunes'?.05:.07;for(let i=0;i<=48;i++){const px=i/48*W,ph=H*amp*(L?.7:1)*(.55+.45*Math.sin(i*.35+seed[L]*9)+.25*Math.sin(i*.9+seed[L+2]*7));x.lineTo(px,hy-Math.max(4,ph))}x.lineTo(W,hy+2);x.fill()}}
  /* أعمدة على جانبي الطريق حسب البيئة: أعمدة إنارة، علامات طريق، سياج خشبي، عصي حلوى */
  function drawPole(X,d,side){const s=Ps(d),px=PX(X,d),py=Py(d),t=ENV.pole;if(s<2)return;
    if(t==='lamp'){x.fillStyle='#64748b';x.fillRect(px-.035*s,py-2.1*s,.07*s,2.1*s);x.fillRect(Math.min(px,px-side*.45*s),py-2.1*s,.45*s,.06*s);x.save();x.shadowColor='#fde68a';x.shadowBlur=Math.min(20,.4*s);x.fillStyle='#fef3c7';x.beginPath();x.ellipse(px-side*.42*s,py-2.02*s,.12*s,.06*s,0,0,7);x.fill();x.restore();return}
    if(t==='marker'){x.fillStyle='#f8fafc';x.fillRect(px-.04*s,py-.5*s,.08*s,.5*s);x.fillStyle='#f97316';x.fillRect(px-.04*s,py-.44*s,.08*s,.1*s);return}
    if(t==='candy'){const hh=.9*s,seg=6;for(let i=0;i<seg;i++){x.fillStyle=i%2?'#fff':'#ef4444';x.fillRect(px-.05*s,py-hh+i*hh/seg,.1*s,hh/seg+1)}x.strokeStyle='#ef4444';x.lineWidth=.1*s;x.beginPath();x.arc(px-side*.12*s,py-hh,.12*s,0,Math.PI,true);x.stroke();return}
    x.fillStyle='#8b5a2b';x.fillRect(px-.04*s,py-.55*s,.08*s,.55*s)}
  function drawObj(o,d){const s=Ps(d),px=PX(o.X,d),py=Py(d),fs=Math.min(H*.7,o.k*s);if(fs<4)return;x.globalAlpha=Math.max(0,Math.min(1,(46-d)/8));
    x.fillStyle='rgba(0,0,0,.16)';x.beginPath();x.ellipse(px,py,fs*.32,fs*.07,0,0,7);x.fill();const D=fs*1.333;x.drawImage(drvSpr(o.e),px-D/2,py-D/2-fs*.5+fs*.05,D,D);x.globalAlpha=1}
  function drawGantry(d){const s=Ps(d),hgt=GH,Xo=R+.24;for(const sd of[-1,1]){const px=PX(sd*Xo,d);x.fillStyle='#4b5563';x.fillRect(px-.05*s,Py(d)-hgt*s,.1*s,hgt*s);x.fillStyle='#6b7280';x.fillRect(px-.05*s,Py(d)-hgt*s,.03*s,hgt*s)}
    x.fillStyle='#4b5563';x.fillRect(PX(-Xo,d),Py(d)-hgt*s,2*Xo*s,.09*s);x.fillStyle='#6b7280';x.fillRect(PX(-Xo,d),Py(d)-hgt*s,2*Xo*s,.03*s)}
  (function loop(){if(dead||!cv.isConnected){au?.stop();return}requestAnimationFrame(loop);if(c.paused){last=null;au?.update(0,false);return}const now=performance.now(),dt=Math.min(.05,(now-(last||now))/1000);last=now;const t=(now-t0)/1000;
    au?.update(dt,sound.on&&!document.hidden);if(!G||geoN--<=0){G=geo();geoN=30}S+=V*dt;shake=Math.max(0,shake-dt);const b=dB();
    const gd=gw==null?null:gw-S;if(gd!=null){g=Math.max(0,Math.min(1,1-(gd-DA)/(DS-DA)));if(!lock&&cur&&gd<=DA)answer(lane)}
    const p=lock?0:1-g;fill.style.width=(p*100)+'%';bar.classList.toggle('low',p<=.3&&!lock);
    x.setTransform(dpr,0,0,dpr,0,0);
    /* السماء والشمس والغيوم */
    const sk=x.createLinearGradient(0,0,0,G.hy);sk.addColorStop(0,ENV.sky[0]);sk.addColorStop(1,ENV.sky[1]);x.fillStyle=sk;x.fillRect(0,0,W,G.hy+2);
    const sunX=W*.85,sunY=G.hy*.42,sr=Math.min(W,H)*.05,sg=x.createRadialGradient(sunX,sunY,sr*.3,sunX,sunY,sr*3.2);sg.addColorStop(0,'rgba(255,250,210,.95)');sg.addColorStop(.3,'rgba(255,236,150,.45)');sg.addColorStop(1,'rgba(255,236,150,0)');x.fillStyle=sg;x.fillRect(sunX-sr*3.2,sunY-sr*3.2,sr*6.4,sr*6.4);x.fillStyle='#fff7c2';x.beginPath();x.arc(sunX,sunY,sr,0,7);x.fill();
    x.fillStyle='rgba(255,255,255,.88)';clouds.forEach(cl=>{cl.x=(cl.x+cl.v*dt)%1.3;const cx=cl.x*(W+200)-100,cy=G.hy*cl.y,r=Math.min(W,H)*.03*cl.s;x.beginPath();x.arc(cx,cy,r,0,7);x.arc(cx+r*1.1,cy-r*.45,r*1.25,0,7);x.arc(cx+r*2.3,cy,r*.95,0,7);x.rect(cx,cy,r*2.3,r*.95);x.fill()});
    drawFar();
    /* الأرض مع أشرطة خفيفة تعطي إحساس السرعة */
    const gr=x.createLinearGradient(0,G.hy,0,H);gr.addColorStop(0,ENV.g[0]);gr.addColorStop(1,ENV.g[1]);x.fillStyle=gr;x.fillRect(0,G.hy,W,H-G.hy);
    x.fillStyle='rgba(0,0,0,.045)';strips(6,3,(d0,d1)=>{const ya=Py(d0),yb=Py(d1);x.fillRect(0,yb,W,ya-yb)});
    /* الطريق: إسفلت رمادي غامق ثابت، يمتد من الأفق إلى أسفل الشاشة، وكل خطوطه بنفس سرعة الحركة */
    const rg=x.createLinearGradient(0,G.hy,0,H);rg.addColorStop(0,'#4a505a');rg.addColorStop(.2,'#33373e');rg.addColorStop(1,'#1f2227');x.fillStyle=rg;quad(-R*1.16,R*1.16,b,DF);
    x.fillStyle='#f8fafc';quad(-R*1.16,-R,b,DF);quad(R,R*1.16,b,DF);x.fillStyle=ENV.curb;strips(1.2,.6,(d0,d1)=>{quad(-R*1.16,-R,d0,d1);quad(R,R*1.16,d0,d1)});
    x.fillStyle='#fff';quad(-R+.03,-R+.075,b,DF);quad(R-.075,R-.03,b,DF);
    x.fillStyle='#fff';for(let i=1;i<n;i++){const X=-R+2*R*i/n;strips(2.4,1.2,(d0,d1)=>quad(X-.022,X+.022,d0,d1))}
    /* ضباب خفيف عند الأفق */
    const hzY=Py(7),hz=x.createLinearGradient(0,G.hy-2,0,hzY);hz.addColorStop(0,ENV.sky[1]+'cc');hz.addColorStop(1,ENV.sky[1]+'00');x.fillStyle=hz;x.fillRect(0,G.hy-2,W,hzY-G.hy+2);
    /* الأعمدة والأشياء الجانبية والبوابة مرتّبة من البعيد للقريب */
    const L=[];objs.forEach(o=>{let d=o.w-S;if(d<b-.6){spawn(o,S+42+Math.random()*14);d=o.w-S}L.push({d,f:()=>drawObj(o,d)})});
    const pp=ENV.pole==='fence'?2.2:ENV.pole==='lamp'?7:4.5;for(let k=Math.floor((S+b)/pp);k*pp-S<40;k++){const d=k*pp-S;if(d<b)continue;for(const sd of[-1,1])L.push({d,f:()=>drawPole(sd*(R+.36),d,sd)})}
    if(ENV.pole==='fence')L.push({d:41,f:()=>{x.strokeStyle='#a0703f';x.lineWidth=2;for(const sd of[-1,1])for(const hh of[.42,.22]){x.beginPath();let st=false;for(let k=Math.floor((S+b)/pp)-1;k*pp-S<40;k++){const d=k*pp-S;if(d<b)continue;const s=Ps(d),px=PX(sd*(R+.36),d),py=Py(d)-hh*s;if(!st){x.moveTo(px,py);st=true}else x.lineTo(px,py)}x.stroke()}}});
    if(gd!=null&&gd>b&&gd<DF)L.push({d:gd,f:()=>drawGantry(gd)});
    L.sort((a,z)=>z.d-a.d).forEach(o=>o.f());
    /* اللوحات: واضحة من البداية تحت السؤال، ثم تنزل وتثبت على البوابة فوق مساراتها مع الاقتراب */
    if(cur&&lock&&ansAt){const k=(performance.now()-ansAt)/1000;signs.forEach(s=>s.el.style.opacity=Math.max(0,Math.min(1,(1.25-k)/.35)))}
    else if(cur&&gd!=null){const s=Ps(gd),slot=W*.94/n,k2=Math.max(0,Math.min(1,(DK-gd)/(DK-DA-.6))),e=k2*k2*(3-2*k2),lanePx=2*R*s/n,beamY=Py(gd)-GH*s+.09*s,top0=G.qB+8;
      signs.forEach((sg2,k)=>{const el=sg2.el,sw=(slot-8)+(Math.min(lanePx*.9,slot*1.3)-(slot-8))*e,cx=W*.03+slot*(k+.5)+(PX(LXw(k),gd)-W*.03-slot*(k+.5))*e,ty=top0+(beamY-top0)*e;
        if(el.style.display)el.style.display='';el.style.transform=`translate3d(${(cx-bw/2).toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${(sw/bw).toFixed(4)})`;el.style.opacity=1})}
    else signs.forEach(s=>s.el.style.display='none');
    const tx=PX(LXw(lane),1);carX=carX==null?tx:carX+(tx-carX)*Math.min(1,dt*9);const cw=Math.min(2*R*G.hw/n*.7,W*.32,220);car(carX,G.yc,cw/150,t,(tx-carX)/W*.5);
    if(res){const k=(now-res.a)/900;if(k<1){x.globalAlpha=1-k;x.font=`900 ${Math.round(H*.09)}px system-ui`;x.textAlign='center';x.textBaseline='middle';x.lineWidth=6;x.strokeStyle='#fff';x.strokeText(res.t,carX,G.yc-cw*.9-k*60);x.fillStyle=res.col;x.fillText(res.t,carX,G.yc-cw*.9-k*60);x.globalAlpha=1}}
  })();
  requestAnimationFrame(()=>{size();next()});
}
const COLORS=[['أحمر','#ef4444'],['أزرق','#3b82f6'],['أخضر','#22c55e'],['أصفر','#facc15'],['برتقالي','#f97316'],['بنفسجي','#a855f7'],['وردي','#ec4899'],['بني','#8b5a2b'],['أسود','#1f2937'],['رمادي','#9ca3af']];
/* ================= حزمة الألعاب الأشهر (مستوحاة من أكثر ألعاب بوكي لعباً) ================= */
const isTouch=()=>matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const EMF='"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
function emo(x,ch,X,Y,s,rot){x.save();x.translate(X,Y);if(rot)x.rotate(rot);x.font=`${s}px ${EMF}`;x.textAlign='center';x.textBaseline='middle';x.fillText(ch,0,s*.06);x.restore()}
function txt(x,t,X,Y,s,col='#1d2350'){x.save();x.font=`800 ${s}px system-ui,Tahoma,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=s/4;x.strokeStyle='#fff';x.strokeText(t,X,Y);x.fillStyle=col;x.fillText(t,X,Y);x.restore()}
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
const GKEYS=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD','KeyF','KeyX','KeyG','ShiftRight','Slash','Period']);
/* ساحة لعب بلوحة رسم ثابتة الأبعاد المنطقية، تتكيف مع أي شاشة */
function arena(root,c,o){
  root.innerHTML=`<div class="hud">${c.tag}${o.hud||''}</div><div class="body ar-body"${o.tbar?' style="bottom:36px"':''}><canvas class="ar-cv"></canvas></div>`;
  const body=root.querySelector('.ar-body'),cv=body.firstElementChild,x=cv.getContext('2d');
  const A={x,cv,root,W:o.W,H:o.H,sc:1,keys:new Set(),ptr:{x:o.W/2,y:o.H/2,down:false,on:false},alive:true,t:0,
    q:s=>root.querySelector(s),set(s,v){const e=root.querySelector(s);if(e)e.textContent=v}};
  A.size=()=>{const r=body.getBoundingClientRect();if(r.width<10||r.height<10)return;if(o.flex)A.H=Math.round(clamp(A.W*r.height/r.width,A.W*o.flex[0],A.W*o.flex[1]));
    A.sc=Math.min(r.width/A.W,r.height/A.H);const d=Math.min(2,devicePixelRatio||1);cv.style.width=A.W*A.sc+'px';cv.style.height=A.H*A.sc+'px';
    cv.width=Math.round(A.W*A.sc*d);cv.height=Math.round(A.H*A.sc*d);x.setTransform(A.sc*d,0,0,A.sc*d,0,0);o.onSize?.(A)};
  c.on(window,'resize',A.size);A.size();requestAnimationFrame(A.size);
  c.on(window,'keydown',e=>{if(!A.alive||c.paused)return;if(GKEYS.has(e.code))e.preventDefault();if(!A.keys.has(e.code)){A.keys.add(e.code);o.onKey?.(e.code)}});
  c.on(window,'keyup',e=>A.keys.delete(e.code));c.on(window,'blur',()=>A.keys.clear());
  const P=e=>{const r=cv.getBoundingClientRect();A.ptr.x=(e.clientX-r.left)/A.sc;A.ptr.y=(e.clientY-r.top)/A.sc};
  c.on(cv,'pointerdown',e=>{if(!A.alive||c.paused)return;P(e);A.ptr.down=A.ptr.on=true;try{cv.setPointerCapture(e.pointerId)}catch{}o.onDown?.(A.ptr)});
  c.on(cv,'pointermove',e=>{P(e)});
  const up=()=>{if(A.ptr.down){A.ptr.down=false;o.onUp?.(A.ptr)}};c.on(cv,'pointerup',up);c.on(cv,'pointercancel',up);
  if(o.pads&&isTouch()){const w=h('<div class="tpads"><div class="tp-l"></div><div class="tp-r"></div></div>');
    o.pads.forEach(p=>{const b=h(`<button class="tpad${p.big?' big':''}" aria-label="${p.a||''}">${p.l}</button>`);
      b.onpointerdown=e=>{e.preventDefault();b.classList.add('on');A.keys.add(p.k);o.onKey?.(p.k)};
      const u=()=>{b.classList.remove('on');A.keys.delete(p.k)};b.onpointerup=u;b.onpointerleave=u;b.onpointercancel=u;
      w.querySelector(p.side==='r'?'.tp-r':'.tp-l').append(b)});root.append(w)}
  A.k=(...ks)=>ks.some(k=>A.keys.has(k));
  A.loop=fn=>{let last=performance.now();const f=t=>{if(!A.alive||!cur||cur.c!==c)return;const dt=Math.min(.035,Math.max(0,(t-last)/1000));last=t;if(!c.paused){A.t+=dt;fn(dt)}requestAnimationFrame(f)};requestAnimationFrame(f)};
  A.win=(s,m,r)=>{if(!A.alive)return;A.alive=false;c.win(s,m,r)};A.lose=(m,r)=>{if(!A.alive)return;A.alive=false;c.lose(m,r)};
  return A}
/* زر وضع اللاعبَين */
const twoOn=()=>!!(curGame&&store.get('two:'+curGame.id,false));
const twoBtn=(solo='🤖 ضد الكمبيوتر')=>`<button class="pill two-btn" data-two title="اضغط للتبديل بين اللعب وحدك واللعب مع صديق">${twoOn()?'👥 لاعبان':solo} ⇄</button>`;
function bindTwo(root,c){const b=root.querySelector('[data-two]');if(b)b.onclick=()=>{store.set('two:'+curGame.id,!twoOn());startGame(curGame,c.run.diff,c.run.stage)}}
const DP1=[{k:'KeyA',l:'⬅️',side:'l'},{k:'KeyW',l:'⬆️',side:'l'},{k:'KeyS',l:'⬇️',side:'l'},{k:'KeyD',l:'➡️',side:'l'}];
const DP2=[{k:'ArrowLeft',l:'⬅️',side:'r'},{k:'ArrowUp',l:'⬆️',side:'r'},{k:'ArrowDown',l:'⬇️',side:'r'},{k:'ArrowRight',l:'➡️',side:'r'}];
const dirOf=(A,set)=>set===1?[(A.k('KeyD')?1:0)-(A.k('KeyA')?1:0),(A.k('KeyS')?1:0)-(A.k('KeyW')?1:0)]:set===2?[(A.k('ArrowRight')?1:0)-(A.k('ArrowLeft')?1:0),(A.k('ArrowDown')?1:0)-(A.k('ArrowUp')?1:0)]
  :[(A.k('ArrowRight','KeyD')?1:0)-(A.k('ArrowLeft','KeyA')?1:0),(A.k('ArrowDown','KeyS')?1:0)-(A.k('ArrowUp','KeyW')?1:0)];
/* ---------- سيارات: فيزياء سيارة من الأعلى ---------- */
function carMove(o,dt,thr,steer,vmax){o.v+=thr*(o.v*thr<0?900:560)*dt;o.v-=o.v*1.1*dt;o.v=clamp(o.v,-vmax*.45,vmax);o.a+=steer*3.2*dt*clamp(o.v/140,-1,1);o.x+=Math.cos(o.a)*o.v*dt;o.y+=Math.sin(o.a)*o.v*dt}
function steerTo(o,tx,ty){const d=angDiff(o.a,Math.atan2(ty-o.y,tx-o.x)),far=Math.hypot(tx-o.x,ty-o.y);if(far<14)return[0,0];
  if(Math.abs(d)>2.3&&far<150)return[-1,-clamp(d*3,-1,1)];return[Math.abs(d)>1.3?.45:1,clamp(d*3,-1,1)]}
function playerCar(A,o,cx=0,cy=0){if(A.ptr.down)return steerTo(o,A.ptr.x+cx,A.ptr.y+cy);return[(A.k('ArrowUp','KeyW')?1:0)-(A.k('ArrowDown','KeyS')?1:0),(A.k('ArrowRight','KeyD')?1:0)-(A.k('ArrowLeft','KeyA')?1:0)]}
function drawCar(x,o,col,deco){x.save();x.translate(o.x,o.y);x.rotate(o.a);x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.roundRect(-23,-12,52,30,9);x.fill();
  x.fillStyle='#222';[[-19,-18],[9,-18],[-19,14],[9,14]].forEach(([a,b])=>{x.beginPath();x.roundRect(a,b,12,5,2);x.fill()});
  x.fillStyle=col;x.beginPath();x.roundRect(-26,-15,52,30,10);x.fill();x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.roundRect(-22,-11,14,22,5);x.fill();
  x.fillStyle='#bfe3ff';x.beginPath();x.roundRect(3,-11,12,22,4);x.fill();x.fillStyle='#ffe066';x.fillRect(23,-12,3,6);x.fillRect(23,6,3,6);
  if(deco==='police'){const on=(performance.now()/180|0)%2;x.fillStyle=on?'#ef4444':'#3b82f6';x.fillRect(-8,-9,7,8);x.fillStyle=on?'#3b82f6':'#ef4444';x.fillRect(-8,1,7,8)}
  if(deco==='thief'){x.rotate(-o.a);emo(x,'💰',0,0,18)}x.restore()}
function hintTxt(A,x,t){if(A.t<4){x.globalAlpha=Math.min(1,4-A.t);txt(x,t,A.W/2,A.H-40,Math.min(26,A.W*1.5/t.length));x.globalAlpha=1}}
/* ---------- ألعاب لاعبَين (ضد الكمبيوتر أو لاعبان على نفس الجهاز) ---------- */
const P1K={l:'KeyA',r:'KeyD',u:'KeyW',d:'KeyS',a:'Space'},P2K={l:'ArrowLeft',r:'ArrowRight',u:'ArrowUp',d:'ArrowDown',a:'Slash'};
/* ---------- تلبيس وتجميل ---------- */
const PAL=[['أحمر','#ef4444'],['أزرق','#3b82f6'],['أخضر','#22c55e'],['أصفر','#facc15'],['وردي','#ec4899'],['بنفسجي','#a855f7'],['برتقالي','#f97316'],['أبيض','#f1f5f9'],['أسود','#1f2937'],['تركواز','#14b8a6']];
const HCOL=['#2b1b12','#6b3e1f','#c08a3e','#ec4899','#3b82f6','#a855f7'],SKINS=['#f8d5b8','#eab68f','#c68642','#8d5524'];
const D_OPT={'top.s':[['tee','👕 قصير'],['long','👚 طويل'],['hoodie','🧥 هودي'],['jacket','🧥 جاكيت']],'bot.s':[['pants','👖 بنطال'],['skirt','👗 تنورة'],['wide','👖 واسع']],
  'shoes.s':[['sneaker','👟 رياضي'],['boot','🥾 جزمة'],['sandal','🩴 صندل']],'hair.s':[['short','قصير'],['long','طويل'],['pony','ذيل حصان'],['curly','مجعّد'],['hijab','🧕 حجاب']],'acc':[['','بدون'],['👑','👑'],['🎀','🎀'],['👓','👓'],['🌸','🌸'],['🧢','🧢']]};
const ACC_POS={'👑':[100,50,40],'🎀':[136,64,30],'👓':[100,102,42],'🌸':[64,66,28],'🧢':[100,58,56]};
function doll(o,head){const sk=o.skin,hs=o['hair.s'],hc=o['hair.c'],ts=o['top.s'],tc=o['top.c'],bs=o['bot.s'],bc=o['bot.c'],ss=o['shoes.s'],sc=o['shoes.c'];
  let s=`<svg viewBox="${head?'38 24 124 150':'0 0 200 380'}" class="doll" xmlns="http://www.w3.org/2000/svg">`;
  if(hs==='long')s+=`<path d="M56 100 Q54 40 100 44 Q146 40 144 100 L150 ${o.cut?150:200} Q100 ${o.cut?160:215} 50 ${o.cut?150:200}Z" fill="${hc}"/>`;
  if(hs==='pony')s+=`<path d="M134 78 Q174 88 162 172 Q150 140 132 118Z" fill="${hc}"/>`;
  if(hs==='curly')for(const[a,b]of[[58,108],[58,136],[142,108],[142,136],[64,160],[136,160]])s+=`<circle cx="${a}" cy="${b}" r="16" fill="${hc}"/>`;
  if(hs==='hijab')s+=`<path d="M52 100 Q50 38 100 38 Q150 38 148 100 L162 196 Q100 214 38 196Z" fill="${hc}"/>`;
  if(!head){const long=ts!=='tee';
    s+=`<rect x="78" y="236" width="18" height="122" rx="8" fill="${sk}"/><rect x="104" y="236" width="18" height="122" rx="8" fill="${sk}"/>`;
    s+=bs==='skirt'?`<path d="M72 230 H128 L150 352 H50Z" fill="${bc}"/>`:bs==='wide'?`<path d="M70 230 H130 L142 352 H104 L100 282 L96 352 H58Z" fill="${bc}"/>`:`<path d="M70 230 H130 L127 352 H104 L100 268 L96 352 H73Z" fill="${bc}"/>`;
    s+=ss==='boot'?`<rect x="72" y="326" width="26" height="40" rx="7" fill="${sc}"/><rect x="102" y="326" width="26" height="40" rx="7" fill="${sc}"/>`
      :ss==='sandal'?`<rect x="70" y="358" width="30" height="8" rx="4" fill="${sc}"/><rect x="100" y="358" width="30" height="8" rx="4" fill="${sc}"/><rect x="78" y="348" width="14" height="7" rx="3" fill="${sc}"/><rect x="108" y="348" width="14" height="7" rx="3" fill="${sc}"/>`
      :`<rect x="67" y="348" width="33" height="18" rx="9" fill="${sc}"/><rect x="100" y="348" width="33" height="18" rx="9" fill="${sc}"/><rect x="69" y="360" width="29" height="5" rx="2" fill="#fff"/><rect x="102" y="360" width="29" height="5" rx="2" fill="#fff"/>`;
    for(const[x0,r]of[[46,8],[136,-8]])s+=`<g transform="rotate(${r} ${x0+9} 152)"><rect x="${x0}" y="150" width="18" height="96" rx="9" fill="${sk}"/><rect x="${x0-1}" y="148" width="20" height="${long?90:38}" rx="9" fill="${tc}"/></g>`;
    s+=`<path d="M60 152 Q100 136 140 152 L132 238 H68Z" fill="${tc}"/>`;
    if(ts==='hoodie')s+=`<path d="M78 146 Q100 174 122 146" stroke="rgba(0,0,0,.25)" stroke-width="5" fill="none"/><rect x="82" y="200" width="36" height="22" rx="7" fill="rgba(0,0,0,.14)"/>`;
    if(ts==='jacket')s+=`<line x1="100" y1="150" x2="100" y2="238" stroke="rgba(0,0,0,.3)" stroke-width="3"/><circle cx="107" cy="178" r="3.5" fill="#fff"/><circle cx="107" cy="204" r="3.5" fill="#fff"/><path d="M86 145 L100 172 L114 145Z" fill="rgba(255,255,255,.55)"/>`;
    if(ts==='tee')s+=`<path d="M86 146 Q100 160 114 146" stroke="rgba(0,0,0,.2)" stroke-width="3" fill="none"/>`;
    if(ts==='long')s+=`<rect x="68" y="226" width="64" height="8" fill="rgba(0,0,0,.12)"/>`}
  if(hs!=='hijab')s+=`<rect x="90" y="126" width="20" height="28" fill="${sk}"/>`;
  s+=`<circle cx="100" cy="98" r="40" fill="${sk}"/>`;
  s+=o.mask?`<circle cx="86" cy="99" r="9" fill="#86efac" stroke="#16a34a" stroke-width="3"/><circle cx="114" cy="99" r="9" fill="#86efac" stroke="#16a34a" stroke-width="3"/>`
    :`<circle cx="86" cy="100" r="5.5" fill="#1d2350"/><circle cx="114" cy="100" r="5.5" fill="#1d2350"/><circle cx="88" cy="98" r="1.8" fill="#fff"/><circle cx="116" cy="98" r="1.8" fill="#fff"/>`;
  s+=`<circle cx="75" cy="113" r="6" fill="#f9a8d4" opacity=".7"/><circle cx="125" cy="113" r="6" fill="#f9a8d4" opacity=".7"/><path d="M88 117 Q100 128 112 117" stroke="#b4235a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  if(hs==='short')s+=`<path d="M58 98 Q55 50 100 52 Q145 50 142 98 Q132 70 100 72 Q68 70 58 98Z" fill="${hc}"/>`;
  else if(hs==='hijab')s+=`<path d="M58 104 Q56 48 100 46 Q144 48 142 104 Q140 66 100 62 Q60 66 58 104Z" fill="${hc}"/><path d="M60 118 Q100 162 140 118 L148 156 Q100 180 52 156Z" fill="${hc}"/>`;
  else{s+=`<path d="M58 100 Q55 48 100 50 Q145 48 142 100 Q134 68 114 68 Q100 82 84 70 Q66 74 58 100Z" fill="${hc}"/>`;if(hs==='curly')for(const a of[66,82,100,118,134])s+=`<circle cx="${a}" cy="${a===100?50:56}" r="13" fill="${hc}"/>`}
  if(o.messy)s+=`<path d="M60 66 l9 -16 l7 13 l9 -18 l8 15 l10 -17 l8 14 l10 -16 l9 15" stroke="${hc}" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="M62 84 l-12 -8 M138 84 l12 -8" stroke="${hc}" stroke-width="6"/>`;
  const ap=ACC_POS[o.acc];if(ap)s+=`<text x="${ap[0]}" y="${ap[1]}" font-size="${ap[2]}" text-anchor="middle" dominant-baseline="middle">${o.acc}</text>`;
  if(o.bub)s+=[[70,50],[120,44],[140,80],[58,80],[96,36]].map(([a,b])=>`<text x="${a}" y="${b}" font-size="22" text-anchor="middle">🫧</text>`).join('');
  if(o.shine)s+=`<text x="146" y="44" font-size="24">✨</text>`;
  return s+'</svg>'}
/* ================= ألعاب جديدة: باكمان + الألعاب التي كانت «قريباً» ================= */
const fxPt=(A,X,Y)=>{const r=A.cv.getBoundingClientRect();FX.lastTap={x:r.left+X*A.sc,y:r.top+Y*A.sc,t:performance.now()}};
const PADS4=[{k:'ArrowLeft',l:'⬅️',side:'l'},{k:'ArrowRight',l:'➡️',side:'l'},{k:'ArrowUp',l:'⬆️',side:'r'},{k:'ArrowDown',l:'⬇️',side:'r'}];
const DIRK={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],KeyA:[-1,0],KeyD:[1,0],KeyW:[0,-1],KeyS:[0,1]};
function heartsPill(n){return n>0?'❤️'.repeat(n):'💔'}
/* ================= ألعاب الذاكرة والتركيز والذكاء (مستوحاة من فكرة تطبيقات تدريب الدماغ) ================= */
function brainRounds(root,c,{total,label,round,extra=''}){let i=0,ok=0,bad=0,onKey=null;const allow=c.lv<10?3:c.lv<20?2:1;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🎯 <b class="br-i">1</b> من ${total}</span><span class="pill">✅ <b class="br-ok">0</b></span><span class="pill">❌ <b class="br-bad">0</b> من ${allow}</span>${extra}</div><div class="body"><div class="br-area"></div></div>`;
  const area=root.querySelector('.br-area');c.on(window,'keydown',e=>{if(!c.paused&&onKey)onKey(e)});
  const api={setKey:f=>onKey=f};
  function next(){onKey=null;if(i>=total)return c.win(ok*10+(allow-bad)*15,ok===total?'تركيز خارق! 🧠':`أجبت ${ok} من ${total} صحيح`,{got:ok,total,perfect:ok===total,label});
    root.querySelector('.br-i').textContent=i+1;let fired=false;area.classList.remove('br-in');void area.offsetWidth;area.classList.add('br-in');
    round(area,i,res=>{if(fired)return;fired=true;onKey=null;if(res){ok++;sfx.good()}else{bad++;sfx.bad()}root.querySelector('.br-ok').textContent=ok;root.querySelector('.br-bad').textContent=bad;i++;
      if(bad>allow)return c.after(()=>c.lose('أخطاء كثيرة! ركّز أكثر وجرّب مرة ثانية',{got:ok,total,label}),900);c.after(next,res?700:1100)},api)}
  next()}
const timerBar=(sec)=>`<div class="br-tm" style="--t:${sec}s"><i></i></div>`;
/* ================= حزمة الذكاء 2: 20 لعبة تدريب دماغ إضافية ================= */
function ynRow(area,match,done,api){const d=h(`<div class="yn"><button class="yn-b yes">✔ نعم</button><button class="yn-b no">✖ لا</button></div>`);area.append(d);let a=false;
  const ans=y=>{if(a)return;a=true;d.querySelector(y?'.yes':'.no').classList.add(y===match?'ok':'bad');done(y===match)};
  d.querySelector('.yes').onclick=()=>ans(true);d.querySelector('.no').onclick=()=>ans(false);api&&api.setKey(e=>{if(e.key==='ArrowRight')ans(true);if(e.key==='ArrowLeft')ans(false)})}
function chooseRow(area,vals,ans,done,api,fmt=v=>v,cls=''){const box=h(`<div class="ch-row ${cls}"></div>`);area.append(box);let a=false;
  const pick=k=>{if(a)return;a=true;const ok=vals[k]===ans;box.children[k].classList.add(ok?'ok':'bad');if(!ok)box.children[vals.indexOf(ans)]?.classList.add('ok');done(ok)};
  vals.forEach((v,k)=>{const b=h(`<button class="choice">${fmt(v)}</button>`);b.onclick=()=>pick(k);box.append(b)});api&&api.setKey(e=>{const n=+e.key;if(n>=1&&n<=vals.length)pick(n-1)});return box}
const tlim=(c,area,sec,done)=>{area.append(h(timerBar(sec.toFixed(2))));c.after(()=>done(false),sec*1000)};
const nearOpts=(ans,n=4,lo=0)=>{const s=new Set([ans]);let g=0;while(s.size<n&&g++<200){const v=ans+rnd(-Math.max(3,Math.round(ans*.3)),Math.max(3,Math.round(ans*.3)));if(v>=lo)s.add(v)}return shuffle([...s])};
const EMO=['🍎','🍌','🍇','🍓','🍉','🍍','🥝','🍒','🐶','🐱','🐰','🦊','🐼','🐸','🐵','🦁','🐯','🐨','🚗','🚀','⚽','🎈','🎁','🌟','🌙','☀️','🌈','🍦','🍩','🧸','🎨','🎸','📚','⏰','🔑','🌻','🍄','🐢','🐙','🦋'];
const LDIR=[[1,0,'➡️'],[-1,0,'⬅️'],[0,-1,'⬆️'],[0,1,'⬇️']],KDIR={ArrowRight:0,ArrowLeft:1,ArrowUp:2,ArrowDown:3};
function dirButtons(area,n,ansIdx,done,api){const box=h(`<div class="dir-btns n${n}" dir="ltr"></div>`);area.append(box);let a=false;const order=n===2?[1,0]:[1,2,3,0];
  const pick=k=>{if(a)return;a=true;box.querySelector(`[data-k="${k}"]`).classList.add(k===ansIdx?'ok':'bad');if(k!==ansIdx)box.querySelector(`[data-k="${ansIdx}"]`)?.classList.add('ok');done(k===ansIdx)};
  order.forEach(k=>{const b=h(`<button class="yn-b dir" data-k="${k}" aria-label="${['يمين','يسار','أعلى','أسفل'][k]}"><svg viewBox="0 0 24 24" width="1.7em" height="1.7em" style="display:block;margin:auto;transform:rotate(${[0,180,-90,90][k]}deg)"><path d="M3 12h14M12 5l7 7-7 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`);b.onclick=()=>pick(k);box.append(b)});api.setKey(e=>{const k=KDIR[e.key];if(k!==undefined&&(n===4||k<2))pick(k)})}
