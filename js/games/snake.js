/* لعبة: G.snake (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
G.snake=(root,c)=>{
  const N=c.fi(12,18),speed=Math.round(c.f(250,95)),goal=c.fi(4,16),nRocks=c.lv<5?0:c.fi(-2,14),wrap=c.lv<6;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🍎 <b class="sc">0</b> من ${goal}</span><span class="pill hint">👆 اضغط سهماً للبدء</span></div><div class="body snake-body"><canvas></canvas><div class="dpad"><button data-d="u">⬆️</button><button data-d="l">⬅️</button><button data-d="d">⬇️</button><button data-d="r">➡️</button></div></div>`;
  const body=root.querySelector('.body'),cv=root.querySelector('canvas'),x=cv.getContext('2d'),dpad=root.querySelector('.dpad');
  const coarse=matchMedia('(pointer:coarse)').matches;if(!coarse)dpad.hidden=true;
  const my=N>>1;let started=false,u=20,sn=[{x:3,y:my},{x:2,y:my},{x:1,y:my}],dir={x:1,y:0},nd=dir,score=0;
  const occ=(p,arr)=>arr.some(s=>s.x===p.x&&s.y===p.y);
  const rocks=[];while(rocks.length<nRocks){const p={x:rnd(1,N-2),y:rnd(1,N-2)};if(Math.abs(p.y-my)>1&&!occ(p,rocks))rocks.push(p)}
  let food=place();
  function place(){let p;do{p={x:rnd(0,N-1),y:rnd(0,N-1)}}while(occ(p,sn)||occ(p,rocks));return p}
  function size(){const r=body.getBoundingClientRect();const wide=r.width>r.height*1.3;body.style.flexDirection=wide?'row':'column';
    const s=Math.max(160,Math.floor(Math.min(r.width-(coarse&&wide?200:0),r.height-(coarse&&!wide?136:0))));
    const dpr=devicePixelRatio||1;cv.style.width=cv.style.height=s+'px';cv.width=cv.height=Math.round(s*dpr);u=cv.width/N;draw()}
  function draw(){const B=N*u;const bg=x.createLinearGradient(0,0,B,B);bg.addColorStop(0,'#2f9e5b');bg.addColorStop(1,'#1f7a45');x.fillStyle=bg;x.fillRect(0,0,B,B);
    for(let i=0;i<N;i++)for(let j=0;j<N;j++)if((i+j)%2){x.fillStyle='rgba(255,255,255,.06)';x.fillRect(i*u,j*u,u,u)}
    const vg=x.createRadialGradient(B/2,B/2,B*.3,B/2,B/2,B*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.28)');x.fillStyle=vg;x.fillRect(0,0,B,B);
    x.font=`${u*.85}px serif`;x.textAlign='center';x.textBaseline='middle';
    rocks.forEach(r=>{x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(r.x*u+u/2,r.y*u+u*.85,u*.38,u*.12,0,0,7);x.fill();x.fillText('🪨',r.x*u+u/2,r.y*u+u/2+u*.05)});
    const fx0=food.x*u+u/2,fy0=food.y*u+u/2,pul=1+Math.sin(performance.now()/180)*.08,gl=x.createRadialGradient(fx0,fy0,0,fx0,fy0,u*.9);gl.addColorStop(0,'rgba(255,230,120,.7)');gl.addColorStop(1,'rgba(255,230,120,0)');
    x.fillStyle=gl;x.beginPath();x.arc(fx0,fy0,u*.9*pul,0,7);x.fill();x.font=`${u*.9*pul}px serif`;x.fillText('🍎',fx0,fy0+u*.05);
    const P=sn.map(s=>[s.x*u+u/2,s.y*u+u/2]);x.lineCap='round';x.lineJoin='round';
    const path=(ox,oy)=>{x.beginPath();P.forEach(([a,b2],i)=>{if(i&&Math.hypot(a-P[i-1][0],b2-P[i-1][1])>u*1.5)x.moveTo(a+ox,b2+oy);else i?x.lineTo(a+ox,b2+oy):x.moveTo(a+ox,b2+oy)});x.stroke()};
    x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=u*.8;path(0,u*.1);
    const sg=x.createLinearGradient(P[0][0],P[0][1],P[P.length-1][0],P[P.length-1][1]);sg.addColorStop(0,'#7c3aed');sg.addColorStop(1,'#db2777');x.strokeStyle=sg;x.lineWidth=u*.78;path(0,0);
    x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=u*.26;path(-u*.08,-u*.1);
    const [hx,hy]=P[0],hg=x.createRadialGradient(hx-u*.15,hy-u*.18,u*.05,hx,hy,u*.55);hg.addColorStop(0,'#c4b5fd');hg.addColorStop(1,'#5b21b6');x.fillStyle=hg;x.beginPath();x.arc(hx,hy,u*.5,0,7);x.fill();
    const ex=-dir.y,ey=dir.x;[[1],[-1]].forEach(([sgn])=>{const cx=hx+dir.x*u*.16+ex*sgn*u*.2,cy=hy+dir.y*u*.16+ey*sgn*u*.2;x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,u*.15,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(cx+dir.x*u*.05,cy+dir.y*u*.05,u*.075,0,7);x.fill()})}
  function turn(dx,dy){if(!started){started=true;root.querySelector('.hint').textContent=wrap?'🌀 تستطيع العبور من الجدار':'⚠️ احذر الجدار والصخور'}if(dx===-dir.x&&dy===-dir.y)return;nd={x:dx,y:dy}}
  function step(){if(!started)return;dir=nd;let hd={x:sn[0].x+dir.x,y:sn[0].y+dir.y};
    if(wrap)hd={x:(hd.x+N)%N,y:(hd.y+N)%N};
    if(hd.x<0||hd.y<0||hd.x>=N||hd.y>=N||occ(hd,sn)||occ(hd,rocks)){sfx.bad();return c.lose('اصطدم الثعبان!',{got:score,total:goal,label:'التفاح'})}
    sn.unshift(hd);if(hd.x===food.x&&hd.y===food.y){score++;root.querySelector('.sc').textContent=score;{const cr=cv.getBoundingClientRect(),q=cr.width/N;FX.lastTap={x:cr.left+(food.x+.5)*q,y:cr.top+(food.y+.5)*q,t:performance.now()}}sfx.good();
      if(score>=goal){draw();return c.win(score*10,'أكلت كل التفاح! 🍎',{got:score,total:goal,perfect:true,label:'التفاح'})}food=place()}else sn.pop();draw()}
  const K={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
  c.on(window,'keydown',e=>{const m=K[e.key];if(m){e.preventDefault();turn(...m)}});
  const D={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};dpad.querySelectorAll('button').forEach(b=>b.onpointerdown=e=>{e.preventDefault();turn(...D[b.dataset.d])});
  let sx0,sy0;c.on(cv,'pointerdown',e=>{sx0=e.clientX;sy0=e.clientY});
  c.on(cv,'pointerup',e=>{const dx=e.clientX-sx0,dy=e.clientY-sy0;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;Math.abs(dx)>Math.abs(dy)?turn(Math.sign(dx),0):turn(0,Math.sign(dy))});
  c.on(window,'resize',size);requestAnimationFrame(size);c.every(step,speed);c.every(()=>{if(!started)draw()},120);
};
