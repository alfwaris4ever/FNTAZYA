/* لعبة: G.snake (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 10 أرضيات فاتحة ومبهجة تتبدّل مع كل مرحلة: [فاتح، أغمق قليلاً] */
const SNAKE_FLOORS=[['#e0f2fe','#bae6fd'],['#fce7f3','#fbcfe8'],['#dcfce7','#bbf7d0'],['#ede9fe','#ddd6fe'],['#ffedd5','#fed7aa'],['#fef9c3','#fef08a'],['#ccfbf1','#99f6e4'],['#ffe4e6','#fecdd3'],['#fae8ff','#f5d0fe'],['#ecfccb','#d9f99d']];
/* الجوائز: تفاحة 1 (دائماً موجودة)، برتقالة 2 (تختفي بعد مدة)، موزة 3 (تتحرك ولا تختفي)، عنبة 4 (تتحرك وتختفي) */
const SNAKE_PRIZES={apple:{e:'🍎',v:1},orange:{e:'🍊',v:2,life:6500},banana:{e:'🍌',v:3,move:3},grape:{e:'🍇',v:4,life:5500,move:2}};
G.snake=(root,c)=>{
  const N=c.fi(12,18),speed=Math.round(c.f(250,95)),goal=Math.round(c.f(6,32)),nRocks=c.lv<5?0:c.fi(-2,14),easy=c.lv<6;
  const FL=SNAKE_FLOORS[(c.run.stage-1)%SNAKE_FLOORS.length];
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">⭐ <b class="sc">0</b> من ${goal}</span><span class="pill hint">👆 اضغط سهماً للبدء</span></div><div class="body snake-body"><canvas></canvas><div class="dpad"><button data-d="u">⬆️</button><button data-d="l">⬅️</button><button data-d="d">⬇️</button><button data-d="r">➡️</button></div></div>`;
  const body=root.querySelector('.body'),cv=root.querySelector('canvas'),x=cv.getContext('2d'),dpad=root.querySelector('.dpad');
  const coarse=matchMedia('(pointer:coarse)').matches;if(!coarse)dpad.hidden=true;
  const my=N>>1;let started=false,dead=false,u=20,sn=[{x:3,y:my},{x:2,y:my},{x:1,y:my}],old=sn.map(p=>({...p})),dir={x:1,y:0},nd=dir,score=0,tick=0,lastStep=performance.now();
  const occ=(p,arr)=>arr.some(s=>s.x===p.x&&s.y===p.y);
  const rocks=[];while(rocks.length<nRocks){const p={x:rnd(1,N-2),y:rnd(1,N-2)};if(Math.abs(p.y-my)>1&&!occ(p,rocks))rocks.push(p)}
  /* البوابات: زوج يسار/يمين بنفس الصفوف، وزوج أعلى/أسفل بنفس الأعمدة، حتى يكون العبور صحيحاً */
  const gate=k=>({k,open:false,a:0,b:-1,until:0,warn:false});const gH=gate('h'),gV=gate('v');
  const stepsOf=ms=>Math.max(4,Math.round(ms/speed));
  function cycleGate(g,first){if(g.open&&!first){g.open=false;g.until=tick+stepsOf(rnd(easy?1500:2500,easy?3500:6000))}
    else{g.open=true;g.a=0;g.b=N-1; /* البوابة تفتح كامل الجنبين دائماً */g.until=tick+stepsOf(rnd(easy?6000:4000,easy?10000:8000))}}
  cycleGate(gH,true);cycleGate(gV,true);if(!easy&&Math.random()<.5){gV.open=false}
  const inGate=(g,i)=>g.open&&i>=g.a&&i<=g.b;
  /* الجوائز */
  let prizes=[],pops=[];
  const freeCell=()=>{let p,n=0;do{p={x:rnd(0,N-1),y:rnd(0,N-1)};n++}while(n<400&&(occ(p,sn)||occ(p,rocks)||occ(p,prizes)||Math.abs(p.x-sn[0].x)+Math.abs(p.y-sn[0].y)<2));return p};
  function addPrize(type){const P=SNAKE_PRIZES[type],p=freeCell();const o={...p,px:p.x,py:p.y,type,born:tick,mt:tick};if(P.life)o.die=tick+stepsOf(P.life);if(P.move){const h=Math.random()<.5;o.vx=h?(Math.random()<.5?1:-1):0;o.vy=h?0:(Math.random()<.5?1:-1)}prizes.push(o)}
  addPrize('apple');
  const has=t=>prizes.some(p=>p.type===t);
  function spawn(){if(!has('apple'))addPrize('apple');
    if(!has('orange')&&Math.random()<1/45)addPrize('orange');
    if(!has('banana')&&Math.random()<1/70)addPrize('banana');
    if(!has('grape')&&Math.random()<(c.lv<3?1/150:1/100))addPrize('grape')}
  function movePrizes(){for(const p of prizes){const P=SNAKE_PRIZES[p.type];if(!P.move||(tick-p.mt)%P.move)continue;
      p.px=p.x;p.py=p.y;p.mt2=performance.now();let nx=p.x+p.vx,ny=p.y+p.vy;const bad=q=>q.x<0||q.y<0||q.x>=N||q.y>=N||occ(q,rocks)||occ(q,sn.slice(1))||prizes.some(o=>o!==p&&o.x===q.x&&o.y===q.y);
      if(bad({x:nx,y:ny})){p.vx=-p.vx;p.vy=-p.vy;nx=p.x+p.vx;ny=p.y+p.vy;if(bad({x:nx,y:ny}))continue}p.x=nx;p.y=ny}}
  function eat(){const hd=sn[0],i=prizes.findIndex(p=>p.x===hd.x&&p.y===hd.y);if(i<0)return false;const p=prizes[i],v=SNAKE_PRIZES[p.type].v;prizes.splice(i,1);
    score+=v;root.querySelector('.sc').textContent=Math.min(score,goal);pops.push({x:p.x,y:p.y,t:'+'+v,t0:performance.now(),col:['#16a34a','#ea580c','#ca8a04','#7c3aed'][v-1]});
    {const cr=cv.getBoundingClientRect(),q=cr.width/N;FX.lastTap={x:cr.left+(p.x+.5)*q,y:cr.top+(p.y+.5)*q,t:performance.now()}}v>1?sfx.good():beep(880,.08,'triangle',.12);
    if(score>=goal){dead=true;render();c.win(score*10,'جمعت كل النقاط! 🍎',{got:goal,total:goal,perfect:true,label:'النقاط'});return 'won'}return true}
  function size(){const r=body.getBoundingClientRect();const wide=r.width>r.height*1.3;body.style.flexDirection=wide?'row':'column';
    const s=Math.max(160,Math.floor(Math.min(r.width-(coarse&&wide?200:0),r.height-(coarse&&!wide?136:0))));
    const dpr=devicePixelRatio||1;cv.style.width=cv.style.height=s+'px';cv.width=cv.height=Math.round(s*dpr);u=cv.width/N;render()}
  const lerp=(a,b,t)=>a+(b-a)*t;
  function render(){const B=N*u,now=performance.now(),t=started?Math.min(1,(now-lastStep)/speed):1;
    /* الأرضية */
    x.fillStyle=FL[1];x.fillRect(0,0,B,B);x.fillStyle=FL[0];for(let i=0;i<N;i++)for(let j=0;j<N;j++)if((i+j)%2)x.fillRect(i*u,j*u,u,u);
    const vg=x.createRadialGradient(B/2,B/2,B*.35,B/2,B/2,B*.78);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.07)');x.fillStyle=vg;x.fillRect(0,0,B,B);
    /* الحجارة: مربع رمادي غامق عليه X */
    rocks.forEach(r=>{const p=u*.08,X0=r.x*u+p,Y0=r.y*u+p,w=u-2*p;x.fillStyle='#374151';x.beginPath();x.roundRect(X0,Y0,w,w,u*.14);x.fill();x.strokeStyle='#9ca3af';x.lineWidth=u*.11;x.lineCap='round';
      x.beginPath();x.moveTo(X0+w*.26,Y0+w*.26);x.lineTo(X0+w*.74,Y0+w*.74);x.moveTo(X0+w*.74,Y0+w*.26);x.lineTo(X0+w*.26,Y0+w*.74);x.stroke()});
    /* البوابات على الحدود الأربعة */
    const T=u*.16;for(const g of [gH,gV]){const warn=g.open&&g.until-tick<=stepsOf(1400)&&Math.floor(now/180)%2;
      for(let i=0;i<N;i++){const op=inGate(g,i);x.fillStyle=op?(warn?'rgba(250,204,21,.95)':'rgba(34,211,238,.95)'):'#1e293b';
        if(g.k==='h'){x.fillRect(0,i*u,T,u);x.fillRect(B-T,i*u,T,u)}else{x.fillRect(i*u,0,u,T);x.fillRect(i*u,B-T,u,T)}}
      if(g.open){x.save();x.shadowColor='#22d3ee';x.shadowBlur=u*.6;x.fillStyle='rgba(34,211,238,.35)';const a=g.a*u,l=(g.b-g.a+1)*u;
        if(g.k==='h'){x.fillRect(0,a,T*1.6,l);x.fillRect(B-T*1.6,a,T*1.6,l)}else{x.fillRect(a,0,l,T*1.6);x.fillRect(a,B-T*1.6,l,T*1.6)}x.restore()}}
    /* الجوائز */
    x.textAlign='center';x.textBaseline='middle';
    for(const p of prizes){const P=SNAKE_PRIZES[p.type];const mt=P.move&&p.mt2?Math.min(1,(now-p.mt2)/(speed*P.move)):1;const px=(lerp(p.px,p.x,mt)+.5)*u,py=(lerp(p.py,p.y,mt)+.5)*u;
      if(p.die&&p.die-tick<=stepsOf(1800)&&Math.floor(now/150)%2)continue;
      const pul=1+Math.sin(now/180+p.x)*.08,gl=x.createRadialGradient(px,py,0,px,py,u*.85);gl.addColorStop(0,'rgba(255,240,150,.75)');gl.addColorStop(1,'rgba(255,240,150,0)');
      x.fillStyle=gl;x.beginPath();x.arc(px,py,u*.85*pul,0,7);x.fill();x.font=`${u*.88*pul}px serif`;x.fillText(P.e,px,py+u*.05);
      if(P.v>1){x.font=`800 ${u*.34}px system-ui,sans-serif`;x.lineWidth=u*.08;x.strokeStyle='#fff';x.strokeText(P.v,px+u*.34,py-u*.32);x.fillStyle='#1d2350';x.fillText(P.v,px+u*.34,py-u*.32)}}
    /* الثعبان بحركة انسيابية بين الخانات */
    /* كل خانة تنزلق من مكانها القديم لمكانها الجديد، مع نقاط الزوايا، فيبقى طول الثعبان ثابتاً بلا وميض */
    const L=sn.length,ctr=p=>[(p.x+.5)*u,(p.y+.5)*u],pos=[];
    for(let i=0;i<L;i++){const n2=sn[i],o=old[Math.min(i,old.length-1)],dx=n2.x-o.x,dy=n2.y-o.y,ox=Math.abs(dx)>1?n2.x+Math.sign(dx):o.x,oy=Math.abs(dy)>1?n2.y+Math.sign(dy):o.y;
      pos.push([(lerp(ox,n2.x,t)+.5)*u,(lerp(oy,n2.y,t)+.5)*u])}
    const pts=[pos[0]];for(let i=1;i<L;i++){pts.push(ctr(sn[i]));pts.push(pos[i])}
    x.lineCap='round';x.lineJoin='round';
    const path=(ox,oy)=>{x.beginPath();pts.forEach(([a,b2],i)=>{if(i&&Math.hypot(a-pts[i-1][0],b2-pts[i-1][1])>u*1.6)x.moveTo(a+ox,b2+oy);else i?x.lineTo(a+ox,b2+oy):x.moveTo(a+ox,b2+oy)});x.stroke()};
    x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=u*.8;path(0,u*.1);
    const sg=x.createRadialGradient(pts[0][0],pts[0][1],0,pts[0][0],pts[0][1],Math.max(u*2,L*u*.9));sg.addColorStop(0,'#7c3aed');sg.addColorStop(1,'#db2777');x.strokeStyle=sg;x.lineWidth=u*.78;path(0,0);
    x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=u*.26;path(-u*.08,-u*.1);
    const [hx,hy]=pts[0],hg=x.createRadialGradient(hx-u*.15,hy-u*.18,u*.05,hx,hy,u*.55);hg.addColorStop(0,'#c4b5fd');hg.addColorStop(1,'#5b21b6');x.fillStyle=hg;x.beginPath();x.arc(hx,hy,u*.5,0,7);x.fill();
    const ex=-dir.y,ey=dir.x;[1,-1].forEach(sgn=>{const cx=hx+dir.x*u*.16+ex*sgn*u*.2,cy=hy+dir.y*u*.16+ey*sgn*u*.2;x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,u*.15,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(cx+dir.x*u*.05,cy+dir.y*u*.05,u*.075,0,7);x.fill()});
    /* أرقام النقاط تطلع لفوق وتختفي */
    pops=pops.filter(p=>now-p.t0<900);for(const p of pops){const k=(now-p.t0)/900;x.globalAlpha=1-k;x.font=`800 ${u*.7}px system-ui,sans-serif`;x.lineWidth=u*.14;x.strokeStyle='#fff';
      const px=(p.x+.5)*u,py=(p.y+.5)*u-k*u*1.4;x.strokeText(p.t,px,py);x.fillStyle=p.col;x.fillText(p.t,px,py);x.globalAlpha=1}}
  function turn(dx,dy){if(!started){started=true;lastStep=performance.now();root.querySelector('.hint').textContent='🌀 البوابات الزرقاء تفتح وتقفل: اعبر منها فقط'}if(dx===-dir.x&&dy===-dir.y)return;nd={x:dx,y:dy}}
  function crash(msg){sfx.bad();dead=true;c.lose(msg,{got:Math.min(score,goal),total:goal,label:'النقاط'})}
  function step(){if(!started||dead)return;tick++;old=sn.map(p=>({...p}));dir=nd;let hd={x:sn[0].x+dir.x,y:sn[0].y+dir.y};
    for(const g of [gH,gV])if(tick>=g.until)cycleGate(g);
    if(hd.x<0||hd.x>=N){if(!inGate(gH,hd.y))return crash('اصطدم الثعبان بالجدار! البوابة كانت مقفلة');hd.x=(hd.x+N)%N}
    if(hd.y<0||hd.y>=N){if(!inGate(gV,hd.x))return crash('اصطدم الثعبان بالجدار! البوابة كانت مقفلة');hd.y=(hd.y+N)%N}
    if(occ(hd,sn.slice(0,-1))||occ(hd,rocks))return crash('اصطدم الثعبان!');
    sn.unshift(hd);lastStep=performance.now();const e=eat();if(e==='won')return;if(!e)sn.pop();
    prizes=prizes.filter(p=>!p.die||tick<p.die);movePrizes();const e2=eat();if(e2==='won')return;if(e2)sn.push({...sn[sn.length-1]});spawn()}
  const K={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
  c.on(window,'keydown',e=>{const m=K[e.key];if(m){e.preventDefault();turn(...m)}});
  const D={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};dpad.querySelectorAll('button').forEach(b=>b.onpointerdown=e=>{e.preventDefault();turn(...D[b.dataset.d])});
  let sx0,sy0;c.on(cv,'pointerdown',e=>{sx0=e.clientX;sy0=e.clientY});
  c.on(cv,'pointerup',e=>{const dx=e.clientX-sx0,dy=e.clientY-sy0;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;Math.abs(dx)>Math.abs(dy)?turn(Math.sign(dx),0):turn(0,Math.sign(dy))});
  c.on(window,'resize',size);requestAnimationFrame(size);c.every(step,speed);
  (function loop(){if(dead||!cv.isConnected)return;if(!c.paused)render();requestAnimationFrame(loop)})();
};
