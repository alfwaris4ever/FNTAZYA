/* لعبة: G.planenumbers و G.planeletters (ملف مستقل). أي دالة أو بيانات هنا خاصة بهاتين اللعبتين فقط. */
/* طائرة الأرقام وطائرة الحروف: نفس مهام بالونات الأرقام والحروف (BAL_TASKS و LB_TASKS من balloons.js، للقراءة فقط دون أي تعديل عليها)،
   لكن الإجابات مكتوبة على سحب تطير نحوك، وتوجّه الطائرة لتصطدم بالسحب الصحيحة وتتجنّب الخاطئة */
const PL_LAST={};
const PL_SPR=new Map();const plSpr=e=>{let s=PL_SPR.get(e);if(!s){s=document.createElement('canvas');s.width=s.height=160;const k=s.getContext('2d');k.font='120px serif';k.textAlign='center';k.textBaseline='middle';k.fillText(e,80,84);PL_SPR.set(e,s)}return s};
function planeAudio(){if(!sound.on)return null;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();actx.resume?.()}catch(e){return null}
  const A=actx,out=A.createGain();out.gain.value=0;out.connect(A.destination);
  const o=A.createOscillator(),lp=A.createBiquadFilter(),am=A.createGain(),lfo=A.createOscillator(),lg=A.createGain();o.type='sawtooth';o.frequency.value=82;lp.type='lowpass';lp.frequency.value=520;am.gain.value=.035;
  lfo.frequency.value=22;lg.gain.value=.015;lfo.connect(lg).connect(am.gain);o.connect(lp).connect(am).connect(out);o.start();lfo.start();out.gain.setTargetAtTime(1,A.currentTime,.4);let st=false;
  return{set(on,pitch){if(st)return;out.gain.setTargetAtTime(on?1:0,A.currentTime,.1);o.frequency.setTargetAtTime(78+pitch*16,A.currentTime,.15)},stop(){if(st)return;st=true;out.gain.setTargetAtTime(0,A.currentTime,.05);setTimeout(()=>{try{o.stop();lfo.stop();out.disconnect()}catch(e){}},400)}}}
function planeQuiz(TASKS,opt={}){return(root,c)=>{
  const idx=Math.min(TASKS.length-1,c.run.diff*10+c.run.stage-1),key=(opt.id||'')+':'+idx,diff=c.run.diff,rtl=!!opt.rtl;
  let task;for(let n=0;n<12;n++){task=TASKS[idx]();if(task.q!==PL_LAST[key])break}PL_LAST[key]=task.q;
  /* نفس الهدف والقلوب والوقت في لعبة البالونات: القلوب سهل 5، وسط 4، صعب 3 */
  const goal=task.group?c.fi(3,5):c.fi(6,12),secs=[60,55,55][diff]+(task.group?8:0);
  let score=0,wrong=0,lives=[5,4,3][diff],started=false,over=false,tb=null,au=null;
  root.innerHTML=`<canvas class="pl-cv" style="position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none"></canvas>
    <div class="hud">${c.tag}<span class="pill">✅ <b class="sc">0</b> من ${goal}</span><span class="pill lv2">${heartsPill(lives)}</span></div>
    <style>#stage .pl-hud-fix .pill{background:rgba(29,35,80,.78)!important;color:#fff!important}</style>
    <div class="pl-task" style="position:absolute;top:calc(var(--hud,58px) + 4px);left:50%;translate:-50% 0;z-index:4;background:#fff;color:#1d2350;border-radius:18px;padding:8px 16px;font-weight:800;font-size:clamp(15px,4.2cqmin,24px);box-shadow:0 5px 0 rgba(29,35,80,.15);text-align:center;max-width:94%;pointer-events:none" hidden>🎯 ${task.q}</div>
    <div class="overlay pl-intro" style="z-index:6"><div class="ov-card" style="max-width:min(92%,560px)"><div class="ov-emo">✈️</div><h2 style="font-size:clamp(22px,6.5cqmin,40px);line-height:1.45;margin:6px 0 14px">${task.q}</h2><p>⬆️⬇️ وجّه الطائرة نحو السحب الصحيحة وتجنّب الخاطئة</p><p>✅ المطلوب ${goal} ${task.group?'مجموعات':'إجابات'} صحيحة · ${'❤️'.repeat(lives)} لكل خطأ قلب</p><div class="ov-btns"><button class="play-btn pl-go">▶ ابدأ</button></div></div></div>`;
  root.querySelector('.hud').classList.add('pl-hud-fix');
  const cv=root.querySelector('.pl-cv'),x=cv.getContext('2d'),sc=root.querySelector('.sc'),intro=root.querySelector('.pl-intro'),$task=root.querySelector('.pl-task');
  setTimeout(()=>speak(task.q.replace(/[^\u0600-\u06FF0-9 ،()+×÷−_-]/g,'')),300);
  let W=0,H=0,dpr=1,top=80,bot=400;
  const size=()=>{const r=root.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);const rr=root.getBoundingClientRect(),tb2=(started?$task:root.querySelector('.hud')).getBoundingClientRect();top=tb2.bottom-rr.top+10;bot=H*.86};
  size();c.on(window,'resize',size);
  const res=()=>({got:Math.min(score,goal),total:goal,label:'إجابات صحيحة'});
  /* الطائرة: تتحرك للأعلى والأسفل بالأسهم أو W/S، أو بالسحب/اللمس على الشاشة */
  let py=.5,ty=.5,vy=0,inv=0,shake=0,keyU=false,keyD=false;
  c.on(window,'keydown',e=>{if(!started&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();start();return}
    if(['ArrowUp','w','W'].includes(e.key)){keyU=true;e.preventDefault()}else if(['ArrowDown','s','S'].includes(e.key)){keyD=true;e.preventDefault()}});
  c.on(window,'keyup',e=>{if(['ArrowUp','w','W'].includes(e.key))keyU=false;else if(['ArrowDown','s','S'].includes(e.key))keyD=false});
  let drag=false;const toY=e=>{const r=cv.getBoundingClientRect();ty=Math.max(0,Math.min(1,(e.clientY-r.top-top)/Math.max(1,bot-top)))};
  c.on(cv,'pointerdown',e=>{drag=true;toY(e)});c.on(cv,'pointermove',e=>{if(drag||e.pointerType==='mouse')toY(e)});c.on(window,'pointerup',()=>drag=false);
  /* السحب: كل سحابة تحمل إجابة (رقم، عملية، حرف، كلمة، صورة) أو مجموعة */
  const clouds=[],fx=[];let lastLanes=[],spawnT=0;
  const NL=()=>task.group?3:4,laneY=i=>(i+.5)/NL();
  const freeLane=()=>{let l,n=0;do{l=rnd(0,NL()-1);n++}while(n<20&&lastLanes.includes(l));lastLanes=[l,...lastLanes].slice(0,task.group?0:2);return l};
  function spawnOne(){let o,wantOk=Math.random()<(task.bias||.42),n=0;do{o=task.gen();n++}while(n<40&&!!task.ok(o)!==wantOk);if(wantOk&&!task.ok(o)&&task.force)task.force(o);
    clouds.push({x:W+120,y:laneY(freeLane()),o,ok:!!task.ok(o),items:null,a:1,dead:false,wob:Math.random()*6})}
  function spawnGroups(){const nG=rnd(2,3),good=rnd(0,nG-1),ls=shuffle([0,1,2]).slice(0,nG);
    for(let g=0;g<nG;g++)clouds.push({x:W+140,y:laneY(ls[g]),o:null,items:task.group(g===good),ok:g===good,a:1,dead:false,wob:Math.random()*6})}
  const cloudH=()=>Math.max(40,Math.min(92,W*.15,(bot-top)/NL()*(task.group?.6:.68)));
  function cloudSize(cl){const ch=cloudH();if(cl.items){const cs=ch*.62;return[Math.max(ch*1.8,cl.items.length*(cs+6)+ch*.6),ch]}
    const t=cl.o.t,L=[...t].length,fs=cl.o.pic?ch*.62:ch*(L>5?.3:L>3?.36:.46);x.font=`900 ${fs}px system-ui,Tahoma,sans-serif`;const tw=cl.o.pic?fs:x.measureText(t).width;cl.fs=fs;return[Math.max(ch*1.7,tw+ch*.9),ch]}
  function drawCloud(cl,X,Y,w,h){x.save();x.globalAlpha=cl.a;x.translate(X,Y);if(cl.pop){const k=1+cl.pop*.4;x.scale(k,k)}
    x.fillStyle='rgba(40,70,120,.12)';x.beginPath();x.ellipse(0,h*.46,w*.46,h*.12,0,0,7);x.fill();
    const g=x.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#dbe9f7');x.fillStyle=g;x.beginPath();
    const r=h*.36,ci=(cx,cy,rr)=>{x.moveTo(cx+rr,cy);x.arc(cx,cy,rr,0,7)};ci(-w/2+r,h*.08,r);ci(w/2-r,h*.08,r);ci(-w*.18,-h*.12,h*.42);ci(w*.16,-h*.18,h*.46);x.rect(-w/2+r,-h*.1,w-2*r,h*.1+r+h*.08-0.5);x.fill();
    x.textAlign='center';x.textBaseline='middle';
    if(cl.items){const cs=h*.62,n=cl.items.length,tot=n*(cs+6)-6;cl.items.forEach((v,i)=>{const k=rtl?n-1-i:i,cx=-tot/2+cs/2+k*(cs+6),col=BAL_COLORS[(i+cl.wob|0)%BAL_COLORS.length];x.fillStyle=col[1];x.beginPath();x.arc(cx,h*.02,cs/2,0,7);x.fill();x.fillStyle='#fff';x.font=`900 ${cs*.5}px system-ui,Tahoma,sans-serif`;x.fillText(v,cx,h*.04)})}
    else if(cl.o.pic){const D=cl.fs*1.333;x.drawImage(plSpr(cl.o.t),-D/2,-D/2+h*.03,D,D)}
    else{x.direction=rtl?'rtl':'ltr';x.font=`900 ${cl.fs}px system-ui,Tahoma,sans-serif`;x.fillStyle='#1d2350';x.fillText(rtl?cl.o.t:'\u2066'+cl.o.t+'\u2069',0,h*.05)}
    if(cl.mark){x.font=`${h*.7}px serif`;x.fillText(cl.mark,w*.42,-h*.5)}
    x.restore()}
  /* طائرة مروحية حمراء بطيّار، تميل مع الحركة */
  function drawPlane(X,Y,s,t){x.save();x.translate(X+(shake>0?Math.sin(t*70)*5*shake:0),Y);x.rotate(Math.max(-.35,Math.min(.35,vy*.5)));x.scale(s,s);if(inv>0&&Math.floor(t*12)%2)x.globalAlpha=.45;
    x.fillStyle='#b91c1c';x.beginPath();x.moveTo(-58,-6);x.lineTo(-70,-30);x.lineTo(-56,-30);x.lineTo(-40,-6);x.fill();
    x.fillStyle='#991b1b';x.beginPath();x.ellipse(-8,10,34,7,-.08,0,7);x.fill();
    const bd=x.createLinearGradient(0,-22,0,22);bd.addColorStop(0,'#f87171');bd.addColorStop(.5,'#dc2626');bd.addColorStop(1,'#991b1b');x.fillStyle=bd;x.beginPath();x.moveTo(-64,-2);x.quadraticCurveTo(-30,-22,26,-16);x.quadraticCurveTo(46,-12,48,0);x.quadraticCurveTo(46,14,26,16);x.quadraticCurveTo(-30,20,-64,4);x.closePath();x.fill();
    x.fillStyle='#fff';x.fillRect(-40,-3,60,6);x.fillStyle='#e5e7eb';x.beginPath();x.arc(48,0,7,0,7);x.fill();
    x.fillStyle='#ef4444';x.beginPath();x.ellipse(-4,-2,30,8,-.1,0,7);x.fill();x.fillStyle='#fca5a5';x.fillRect(-30,-6,40,3);
    x.fillStyle='#fde68a';x.beginPath();x.arc(4,-24,9,0,7);x.fill();x.fillStyle='#7c2d12';x.beginPath();x.arc(4,-27,9,Math.PI,0);x.fill();x.fillStyle='#1e293b';x.fillRect(-4,-27,16,5);x.fillStyle='#93c5fd';x.fillRect(8,-26,4,3);
    x.fillStyle='rgba(191,227,255,.85)';x.beginPath();x.moveTo(14,-15);x.quadraticCurveTo(18,-30,8,-34);x.lineTo(8,-15);x.fill();
    x.strokeStyle='#374151';x.lineWidth=2.5;x.beginPath();x.moveTo(10,16);x.lineTo(14,30);x.moveTo(26,15);x.lineTo(22,30);x.stroke();x.fillStyle='#111827';x.beginPath();x.arc(14,31,5,0,7);x.arc(22,31,5,0,7);x.fill();
    const pr=Math.abs(Math.sin(t*40));x.fillStyle='rgba(55,65,81,.65)';x.beginPath();x.ellipse(54,0,3,26*pr+4,0,0,7);x.fill();x.fillStyle='#4b5563';x.beginPath();x.arc(54,0,4,0,7);x.fill();
    x.restore()}
  /* الخلفية: سماء وشمس وجبال ومدينة وتلال بأشجار، كل طبقة تتحرك بسرعة مختلفة */
  const seed=[...Array(60)].map(()=>Math.random()),bgC=[...Array(6)].map(()=>({x:Math.random(),y:.08+Math.random()*.3,s:.5+Math.random()*.8}));
  let scroll=0;
  function drawBg(t){const sk=x.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#3d8fe0');sk.addColorStop(.6,'#a9d4fb');sk.addColorStop(1,'#d9efff');x.fillStyle=sk;x.fillRect(0,0,W,H);
    const sx=W*.62,sy=H*.22,sr=Math.min(W,H)*.06,sg=x.createRadialGradient(sx,sy,sr*.3,sx,sy,sr*3.4);sg.addColorStop(0,'rgba(255,252,220,.95)');sg.addColorStop(.3,'rgba(255,245,180,.4)');sg.addColorStop(1,'rgba(255,245,180,0)');x.fillStyle=sg;x.fillRect(sx-sr*3.4,sy-sr*3.4,sr*6.8,sr*6.8);x.fillStyle='#fffbe0';x.beginPath();x.arc(sx,sy,sr,0,7);x.fill();
    x.fillStyle='rgba(255,255,255,.7)';bgC.forEach(b=>{const X=((b.x*W*1.4-scroll*.08)%(W*1.4)+W*1.4)%(W*1.4)-W*.2,Y=H*b.y,r=Math.min(W,H)*.025*b.s;x.beginPath();x.arc(X,Y,r,0,7);x.arc(X+r*1.2,Y-r*.5,r*1.3,0,7);x.arc(X+r*2.5,Y,r,0,7);x.rect(X,Y,r*2.5,r);x.fill()});
    const gy=H*.86;
    /* جبال بعيدة */
    x.fillStyle='#9db8d6';x.beginPath();x.moveTo(0,gy);const mw=W*.28,mo=(scroll*.12)%mw;for(let i=-1;i<W/mw+2;i++){const k=(i+Math.floor(scroll*.12/mw))%60,mx=i*mw-mo;x.lineTo(mx+mw*.5,gy-H*(.18+seed[(k+60)%60]*.1));x.lineTo(mx+mw,gy-H*.08)}x.lineTo(W,gy);x.fill();
    /* مدينة */
    const bw=W*.07,bo=(scroll*.25)%bw,b0=Math.floor(scroll*.25/bw);for(let i=-1;i<W/bw+2;i++){const k=((i+b0)%60+60)%60,bh=H*(.1+seed[k]*.16),bx=i*bw-bo;x.fillStyle=seed[(k+7)%60]>.5?'#dbe7f5':'#c6d6ea';x.fillRect(bx+2,gy-H*.06-bh,bw-4,bh+H*.06);x.fillStyle='rgba(120,150,190,.35)';for(let r=gy-H*.06-bh+6;r<gy-H*.06-4;r+=9)for(let cx=bx+6;cx<bx+bw-8;cx+=8)x.fillRect(cx,r,4,4)}
    /* تلال خضراء بأشجار */
    x.fillStyle='#7cc86b';x.beginPath();x.moveTo(0,H);for(let i=0;i<=40;i++){const X=i/40*W,ph=Math.sin((X+scroll*.5)*.006)*H*.025+Math.sin((X+scroll*.5)*.017)*H*.012;x.lineTo(X,gy-H*.04+ph)}x.lineTo(W,H);x.fill();
    const tw=W*.11,to=(scroll*.5)%tw,t0=Math.floor(scroll*.5/tw);for(let i=-1;i<W/tw+2;i++){const k=((i+t0)%60+60)%60,tx=i*tw-to+seed[k]*tw*.6,ty2=gy-H*.035+Math.sin((tx+scroll*.5)*.006)*H*.025,r=H*(.018+seed[(k+3)%60]*.016);
      x.fillStyle='#7c4a1e';x.fillRect(tx-2,ty2-r*.4,4,r*1.2);x.fillStyle=seed[(k+11)%60]>.5?'#2f9e44':'#3fb34f';x.beginPath();x.arc(tx,ty2-r,r,0,7);x.fill()}
    x.fillStyle='#5fb34e';x.fillRect(0,gy+H*.02,W,H);x.fillStyle='rgba(255,255,255,.25)';const fo=(scroll*.9)%40;for(let X=-fo;X<W;X+=40)x.fillRect(X,gy+H*.05+((X/40|0)%3)*6,10,2)}
  function addFx(X,Y,txt,col){fx.push({X,Y,txt,col,a:performance.now()})}
  function hitCloud(cl,X,Y){cl.dead=true;cl.pop=.01;
    if(cl.ok){score++;sc.textContent=score;cl.mark='✅';addFx(X,Y,'+1','#16a34a');sfx.good()}
    else{wrong++;lives--;root.querySelector('.lv2').innerHTML=heartsPill(lives);cl.mark='❌';addFx(X,Y,'💔','#dc2626');sfx.bad();inv=.9;shake=.5}
    if(lives<=0){over=true;au?.stop();return c.lose('انتهت القلوب! اقرأ المهمة جيداً 💔',res())}
    if(score>=goal){over=true;au?.stop();c.win(score*10+Math.round(tb.left())*3,wrong?`أحسنت! أخطأت ${wrong} ${wrong>2?'مرات':'مرة'} فقط`:'كل اختياراتك صحيحة! 🎯',{got:goal,total:goal,perfect:true,label:'إجابات صحيحة'})}}
  let last=null;const t00=performance.now();
  (function loop(){if(!cv.isConnected){au?.stop();return}requestAnimationFrame(loop);const now=performance.now(),t=(now-t00)/1000;if(c.paused){last=null;au?.set(false,0);return}const dt=Math.min(.05,(now-(last||now))/1000);last=now;
    const sp=Math.max(W/5.2,130);scroll+=sp*dt;
    if(started&&!over){au?.set(sound.on&&!document.hidden,-vy);if(keyU)ty=Math.max(0,ty-dt*1.3);if(keyD)ty=Math.min(1,ty+dt*1.3);
      const npy=py+(ty-py)*Math.min(1,dt*7);vy=(npy-py)/Math.max(dt,.001);py=npy;
      spawnT-=dt;if(spawnT<=0){if(task.group){spawnGroups();spawnT=Math.max(2.6,(cloudH()*3.4+60)/sp)}else{spawnOne();spawnT=Math.max(1.15,(cloudH()*2.2+30)/sp)}}}
    inv=Math.max(0,inv-dt);shake=Math.max(0,shake-dt);
    x.setTransform(dpr,0,0,dpr,0,0);drawBg(t);
    const PX=W*.18,PY=top+py*(bot-top),ps=Math.max(.5,Math.min(1.25,(bot-top)/360,W/560));
    for(const cl of clouds){if(!cl.dead||cl.pop)cl.x-=sp*dt*(cl.dead?.3:1);const[w,h]=cloudSize(cl),Y=top+cl.y*(bot-top)+Math.sin(t*1.5+cl.wob)*4;
      if(!cl.dead&&started&&!over&&Math.abs(cl.x-PX)<w*.42+40*ps&&Math.abs(Y-PY)<h*.3+14*ps)hitCloud(cl,cl.x,Y);
      if(cl.dead){cl.pop+=dt*2.2;cl.a=Math.max(0,1-cl.pop)}
      drawCloud(cl,cl.x,Y,w,h)}
    for(let i=clouds.length-1;i>=0;i--)if(clouds[i].x<-200||clouds[i].a<=0)clouds.splice(i,1);
    drawPlane(PX,PY,ps,t);
    for(let i=fx.length-1;i>=0;i--){const f=fx[i],k=(now-f.a)/900;if(k>=1){fx.splice(i,1);continue}x.globalAlpha=1-k;x.font=`900 ${Math.round(Math.min(W,H)*.08)}px system-ui`;x.textAlign='center';x.textBaseline='middle';x.lineWidth=6;x.strokeStyle='#fff';x.strokeText(f.txt,f.X,f.Y-50-k*60);x.fillStyle=f.col;x.fillText(f.txt,f.X,f.Y-50-k*60);x.globalAlpha=1}
  })();
  /* شاشة السؤال أولاً، ثم تبدأ اللعبة بالضغط على «ابدأ» أو Enter */
  function start(){if(started)return;started=true;intro.remove();$task.hidden=false;size();sfx.pop();au=planeAudio();
    tb=c.timeBar(root,secs,()=>{over=true;au?.stop();score>=goal*.6?c.win(score*10,'انتهى الوقت',res()):c.lose('انتهى الوقت!',res())})}
  root.querySelector('.pl-go').onclick=start;
}}
G.planenumbers=planeQuiz(BAL_TASKS,{id:'pnum'});
G.planeletters=planeQuiz(LB_TASKS,{rtl:true,id:'plet'});
