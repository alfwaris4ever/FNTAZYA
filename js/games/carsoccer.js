/* لعبة: G.carsoccer (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 1) كرة السيارات — مستوحاة من Rocket Soccer Derby: تيربو، قفزة، وسادات تيربو، صدمات، ومؤثرات أهداف */
function csCheer(){if(!sound.on)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const A=actx,n=A.sampleRate*1.6,b=A.createBuffer(1,n,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n)*(.6+.4*Math.sin(i/A.sampleRate*38));
  const s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=1100;f.Q.value=.5;g.gain.value=.22;s.connect(f).connect(g).connect(A.destination);s.start()}catch(e){}}
function csWhoosh(v=.05){if(!sound.on)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const A=actx,n=A.sampleRate*.35,b=A.createBuffer(1,n,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);
  const s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=700;g.gain.value=v;s.connect(f).connect(g).connect(A.destination);s.start()}catch(e){}}
G.carsoccer=(root,c)=>{
  const W=1000,H=620,F=34,GT=228,GB=392,goal=c.fi(1,5),aiV=c.f(200,330),aiSmart=c.f(.25,.9),secs=Math.round(c.f(80,100));
  let pg=0,ag=0,freeze=0,msg='',count=3.2,shake=0;
  const A=arena(root,c,{W,H,tbar:1,hud:`<span class="pill">🔵 <b class="pg">0</b> : <b class="ag">0</b> 🔴</span><span class="pill">🎯 سجّل ${goal}</span>`,
    onKey:k=>{if(k==='Space')jump(P)},
    pads:[{k:'Space',l:'⤴️',side:'r',a:'قفزة'},{k:'ShiftLeft',l:'🔥',side:'r',big:1,a:'تيربو'}]});
  /* z: ارتفاع السيارة أثناء القفزة، boost: عداد التيربو، spin: دوران بعد صدمة قوية */
  const mk=(x,a,col)=>({x,y:310,a,v:0,z:0,jt:0,boost:60,boosting:false,spin:0,col});
  const P=mk(800,Math.PI,'#2563eb'),E=mk(200,0,'#ef4444'),B={x:500,y:310,z:0,vx:0,vy:0,vz:0,r:20,rot:0};
  const PADS=[[500,95],[500,525],[300,310],[700,310]].map(([x,y])=>({x,y,t:0}));
  const parts=[],trail=[];
  const reset=()=>{Object.assign(P,mk(800,Math.PI,'#2563eb'),{boost:Math.max(P.boost,50)});Object.assign(E,mk(200,0,'#ef4444'),{boost:Math.max(E.boost,50)});Object.assign(B,{x:500,y:310+rnd(-40,40),z:0,vx:0,vy:0,vz:0});trail.length=0;count=3.2};
  const res=()=>({got:pg,total:goal,label:'أهدافك'});
  const puff=(x,y,col,n,sp,life=.6,sz=6)=>{for(let i=0;i<n;i++){const a=Math.random()*6.28,s=sp*(.3+Math.random()*.7);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:life*(.6+Math.random()*.4),l:life,col,sz:sz*(.6+Math.random()*.8)})}};
  function jump(o){if(o.z>0||freeze>0||count>0)return;o.jt=.6;if(o===P){beep(420,.08,'triangle',.07);setTimeout(()=>beep(620,.08,'triangle',.06),60)}}
  function carStep(o,dt,thr,steer,vmax,wantBoost){
    if(o.spin>0){o.spin-=dt;o.a+=dt*9;o.v*=Math.pow(.2,dt);o.x+=Math.cos(o.a)*o.v*dt*.3;o.y+=Math.sin(o.a)*o.v*dt*.3;return}
    o.boosting=wantBoost&&o.boost>0&&thr>=0;if(o.boosting){o.boost=Math.max(0,o.boost-48*dt);thr=1}else o.boost=Math.min(100,o.boost+7*dt);
    carMove(o,dt,thr,steer,o.boosting?vmax*1.6:vmax);if(o.boosting)o.v=Math.min(vmax*1.6,o.v+700*dt);
    if(o.jt>0){o.jt-=dt;o.z=Math.sin(Math.PI*(1-Math.max(0,o.jt)/.6))}else o.z=0;
    if(o.boosting&&Math.random()<.9)puff(o.x-Math.cos(o.a)*30,o.y-Math.sin(o.a)*30,Math.random()<.5?'#fb923c':'#facc15',1,60,.35,7);
    else if(Math.abs(o.v)>180&&Math.random()<.25)puff(o.x-Math.cos(o.a)*26,o.y-Math.sin(o.a)*26,'rgba(255,255,255,.7)',1,25,.5,5)}
  /* ضرب الكرة: الضربة وأنت قافز أو بالتيربو أقوى بكثير وترفع الكرة في الهواء */
  function hit(o){if(B.z>40+o.z*60)return;const dx=B.x-o.x,dy=B.y-o.y,d=Math.hypot(dx,dy)||1,R=B.r+26;if(d>=R)return;const nx=dx/d,ny=dy/d;B.x=o.x+nx*R;B.y=o.y+ny*R;
    const vx=Math.cos(o.a)*o.v,vy=Math.sin(o.a)*o.v,rel=(vx-B.vx)*nx+(vy-B.vy)*ny,pow=1.6+(o.z>.25?1.1:0)+(o.boosting?.5:0);
    if(rel>0){B.vx+=nx*rel*pow;B.vy+=ny*rel*pow;B.vz+=rel*(o.z>.25?.9:.25);const strong=rel*pow>700;
      puff(B.x,B.y,strong?'#fde047':'#fff',strong?14:5,strong?260:120,.4,strong?6:4);if(strong){shake=Math.max(shake,.35);beep(150,.1,'square',.09)}else if(rel>60)beep(260,.05,'square',.06)}
    B.vx+=nx*30;B.vy+=ny*30}
  function wall(o){const m=F+20;if(o.x<m){o.x=m;o.v*=.4}if(o.x>W-m){o.x=W-m;o.v*=.4}if(o.y<m){o.y=m;o.v*=.4}if(o.y>H-m){o.y=H-m;o.v*=.4}}
  /* تصادم السيارتين: إذا كانت إحداهما بالتيربو تدفع الأخرى وتلفّها */
  function bump(){if(Math.abs(P.z-E.z)>.5)return;const dx=E.x-P.x,dy=E.y-P.y,d=Math.hypot(dx,dy)||1;if(d>=48)return;const k=(48-d)/2,nx=dx/d,ny=dy/d;P.x-=nx*k;P.y-=ny*k;E.x+=nx*k;E.y+=ny*k;
    const sp=Math.abs(P.v)+Math.abs(E.v);if(sp>380&&(P.boosting||E.boosting)){const vic=P.boosting&&!E.boosting?E:E.boosting&&!P.boosting?P:(Math.abs(P.v)>Math.abs(E.v)?E:P),src=vic===E?P:E;
      vic.spin=.7;vic.v=Math.abs(src.v)*.8;vic.a=Math.atan2(vic.y-src.y,vic.x-src.x);shake=.4;puff((P.x+E.x)/2,(P.y+E.y)/2,'#fde047',16,260,.45,6);beep(110,.15,'sawtooth',.08)}else{P.v*=.7;E.v*=.7}}
  function pads(dt){PADS.forEach(p=>{if(p.t>0){p.t-=dt;return}[P,E].forEach(o=>{if(p.t<=0&&Math.hypot(o.x-p.x,o.y-p.y)<34&&o.z<.3){o.boost=Math.min(100,o.boost+45);p.t=6;if(o===P)beep(880,.08,'triangle',.06);puff(p.x,p.y,'#facc15',10,140,.4,5)}})})}
  function score(me){me?pg++:ag++;A.set('.pg',pg);A.set('.ag',ag);if(me){sfx.good();csCheer()}else sfx.bad();msg=me?'⚽ هدف!':'😮 هدف للخصم';freeze=1.8;shake=.7;
    const gx=me?F:W-F;for(let i=0;i<60;i++){const a=Math.random()*6.28,s=150+Math.random()*450;parts.push({x:gx,y:B.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:1.2,l:1.2,col:['#ef4444','#facc15','#22c55e','#3b82f6','#ec4899','#fff'][i%6],sz:7,conf:1})}
    if(pg>=goal)return A.win(pg*20+Math.round(tb.left())*2,`سجّلت ${goal} ${goal>2?'أهداف':'هدف'}! ⚽`,{...res(),perfect:true});
    if(ag>=goal)return A.lose('الخصم سجّل أهدافه أولاً',res())}
  const tb=c.timeBar(root,secs,()=>{pg>ag?A.win(pg*20,'انتهى الوقت وأنت متقدّم 👏',res()):A.lose('انتهى الوقت',res())});
  /* الخصم: يلتف خلف الكرة ويدفعها نحو مرماك، ويستخدم التيربو والقفز أكثر كلما صعب المستوى */
  function ai(dt){let dx=B.x-(W+30),dy=B.y-310,d=Math.hypot(dx,dy)||1,tx=B.x+dx/d*44,ty=B.y+dy/d*44;
    if(E.x>B.x+12){tx=B.x-100;ty=B.y+(E.y<B.y?-80:80)}
    if(B.x>W*.62&&B.vx>0&&Math.random()<aiSmart){/* يدافع: يرجع ويقطع الطريق على الكرة */}
    const[t,s]=steerTo(E,tx,ty),far=Math.hypot(B.x-E.x,B.y-E.y),aligned=Math.abs(angDiff(E.a,Math.atan2(ty-E.y,tx-E.x)))<.35;
    const wantB=aligned&&far>180&&E.boost>20&&Math.random()<aiSmart*.9;
    if(far<90&&aligned&&E.x<B.x&&Math.random()<aiSmart*dt*3)jump(E);
    carStep(E,dt,t,s,aiV,wantB)}
  function ball(dt){B.x+=B.vx*dt;B.y+=B.vy*dt;B.vz-=900*dt;B.z+=B.vz*dt;if(B.z<0){B.z=0;if(B.vz<-120){B.vz=-B.vz*.45;beep(200,.04,'sine',.05)}else B.vz=0}
    const f=Math.pow(B.z>0?.85:.5,dt);B.vx*=f;B.vy*=f;const sp=Math.hypot(B.vx,B.vy);if(sp>1100){B.vx*=1100/sp;B.vy*=1100/sp}B.rot+=sp*dt/B.r;
    if(sp>420){trail.push({x:B.x,y:B.y-B.z,t:.25});}
    if(B.y<F+B.r){B.y=F+B.r;B.vy=Math.abs(B.vy)*.8}if(B.y>H-F-B.r){B.y=H-F-B.r;B.vy=-Math.abs(B.vy)*.8}const inG=B.y>GT+B.r*.5&&B.y<GB-B.r*.5&&B.z<90;
    if(!inG&&B.x<F+B.r){B.x=F+B.r;B.vx=Math.abs(B.vx)*.8}if(!inG&&B.x>W-F-B.r){B.x=W-F-B.r;B.vx=-Math.abs(B.vx)*.8}
    if(B.x<F-B.r)score(true);else if(B.x>W-F+B.r)score(false)}
  function carDraw(o){const x=A.x,s=1+o.z*.4;x.save();x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(o.x+o.z*14,o.y+o.z*18,30*s*.9,18*s*.9,o.a,0,7);x.fill();x.restore();
    x.save();x.translate(o.x,o.y-o.z*26);x.rotate(o.a);x.scale(s,s);
    if(o.boosting){const fl=14+Math.random()*12;const g=x.createLinearGradient(-28,0,-28-fl,0);g.addColorStop(0,'#fde047');g.addColorStop(.5,'#fb923c');g.addColorStop(1,'rgba(239,68,68,0)');x.fillStyle=g;x.beginPath();x.moveTo(-26,-8);x.lineTo(-28-fl,0);x.lineTo(-26,8);x.fill()}
    x.fillStyle='#111827';[[-20,-19],[10,-19],[-20,14],[10,14]].forEach(([a,b])=>{x.beginPath();x.roundRect(a,b,13,6,2);x.fill()});
    const bg=x.createLinearGradient(0,-16,0,16);bg.addColorStop(0,drvShade(o.col,.3));bg.addColorStop(1,drvShade(o.col,-.25));x.fillStyle=bg;x.beginPath();x.roundRect(-27,-16,56,32,11);x.fill();
    x.fillStyle='rgba(255,255,255,.9)';x.fillRect(-27,-3,56,6);x.fillStyle='#0f172a';x.beginPath();x.roundRect(4,-12,13,24,4);x.fill();x.fillStyle='rgba(191,227,255,.6)';x.fillRect(7,-10,3,20);
    x.fillStyle='#1f2937';x.fillRect(-27,-14,5,28);x.fillStyle='#fde68a';x.fillRect(26,-13,3,6);x.fillRect(26,7,3,6);x.restore()}
  function draw(){const x=A.x;x.save();if(shake>0)x.translate((Math.random()-.5)*16*shake,(Math.random()-.5)*16*shake);
    /* مدرجات وجمهور */
    x.fillStyle='#1e293b';x.fillRect(-20,-20,W+40,H+40);for(let i=0;i<120;i++){const t=i/120,px=t*W,on=(Math.sin(A.t*6+i)>.6)&&freeze>0?-4:0;x.fillStyle=['#f87171','#60a5fa','#facc15','#4ade80','#f472b6','#e2e8f0'][i%6];x.beginPath();x.arc(px+8,10+on,5,0,7);x.arc(px+3,H-10+on,5,0,7);x.fill()}
    x.fillStyle='#3d9b47';x.fillRect(F-6,F-6,W-2*F+12,H-2*F+12);for(let i=0;i<10;i++){x.fillStyle=i%2?'#5cbc64':'#4caf55';x.fillRect(F+i*(W-2*F)/10,F,(W-2*F)/10,H-2*F)}
    x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=4;x.strokeRect(F,F,W-2*F,H-2*F);x.beginPath();x.moveTo(W/2,F);x.lineTo(W/2,H-F);x.stroke();x.beginPath();x.arc(W/2,H/2,70,0,7);x.stroke();
    x.strokeRect(F,GT-60,90,GB-GT+120);x.strokeRect(W-F-90,GT-60,90,GB-GT+120);
    /* المرميان بشبكة */
    [[0,'#ef4444'],[W-F,'#3b82f6']].forEach(([gx,col])=>{x.fillStyle=col+'aa';x.fillRect(gx,GT,F,GB-GT);x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1;for(let yy=GT;yy<=GB;yy+=12){x.beginPath();x.moveTo(gx,yy);x.lineTo(gx+F,yy);x.stroke()}for(let xx=gx;xx<=gx+F;xx+=10){x.beginPath();x.moveTo(xx,GT);x.lineTo(xx,GB);x.stroke()}
      x.save();x.shadowColor=col;x.shadowBlur=18;x.fillStyle='#fff';[[gx+(gx?0:F),GT],[gx+(gx?0:F),GB]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,8,0,7);x.fill()});x.restore()});
    /* وسادات التيربو */
    PADS.forEach(p=>{const on=p.t<=0;x.save();x.globalAlpha=on?1:.35;if(on){x.shadowColor='#facc15';x.shadowBlur=16+Math.sin(A.t*6)*6}x.fillStyle=on?'#facc15':'#94a3b8';x.beginPath();x.arc(p.x,p.y,22,0,7);x.fill();x.restore();emo(x,'⚡',p.x,p.y,24)});
    /* أثر الكرة والجزيئات */
    trail.forEach(t=>{x.globalAlpha=Math.max(0,t.t/.25)*.5;x.fillStyle='#fff';x.beginPath();x.arc(t.x,t.y,B.r*.8,0,7);x.fill()});x.globalAlpha=1;
    parts.forEach(p=>{x.globalAlpha=Math.max(0,p.t/p.l);x.fillStyle=p.col;if(p.conf)x.fillRect(p.x,p.y,p.sz,p.sz*.5);else{x.beginPath();x.arc(p.x,p.y,p.sz*(p.t/p.l+.3),0,7);x.fill()}});x.globalAlpha=1;
    /* الترتيب: الظلال والسيارات والكرة (الأعلى يُرسم أخيراً) */
    const items=[{z:P.z*26,f:()=>carDraw(P)},{z:E.z*26,f:()=>carDraw(E)},{z:B.z,f:()=>{x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(B.x+B.z*.25,B.y+B.z*.35,B.r*(1-Math.min(.5,B.z/300)),B.r*.5,0,0,7);x.fill();x.fillStyle='#000';emo(x,'⚽',B.x,B.y-B.z,40*(1+B.z/260),B.rot%6.28)}}];
    items.sort((a,b)=>a.z-b.z).forEach(i=>i.f());
    x.restore();
    /* عداد التيربو */
    x.fillStyle='rgba(15,23,42,.75)';x.beginPath();x.roundRect(14,H-44,190,30,15);x.fill();const bg=x.createLinearGradient(20,0,200,0);bg.addColorStop(0,'#f97316');bg.addColorStop(1,'#facc15');x.fillStyle=bg;x.beginPath();x.roundRect(48,H-37,150*P.boost/100,16,8);x.fill();emo(x,'🔥',31,H-29,20);
    if(count>0)txt(x,count>1.2?String(Math.ceil(count-1.2)):'انطلق!',W/2,H/2,count>1.2?110:80,'#1d2350');
    if(freeze>0)txt(x,msg,W/2,H/2,80,msg.includes('للخصم')?'#dc2626':'#16a34a');
    hintTxt(A,x,'الأسهم للقيادة · Shift تيربو 🔥 · Space قفزة ⤴️ · سجّل في المرمى الأحمر')}
  let lastCount=4;
  A.loop(dt=>{shake=Math.max(0,shake-dt*1.6);
    parts.forEach(p=>{p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.2,dt);p.vy*=Math.pow(.2,dt);if(p.conf)p.vy+=300*dt});for(let i=parts.length-1;i>=0;i--)if(parts[i].t<=0)parts.splice(i,1);
    trail.forEach(t=>t.t-=dt);while(trail.length&&trail[0].t<=0)trail.shift();
    if(freeze>0){freeze-=dt;if(freeze<=0)reset()}
    else if(count>0){count-=dt;const cc=Math.ceil(count-1.2);if(cc!==lastCount&&cc>=0){lastCount=cc;beep(cc>0?520:880,.12,'triangle',.08)}}
    else{const[t,s]=playerCar(A,P),wb=A.k('ShiftLeft','ShiftRight','KeyX');if(wb&&!P.boosting&&P.boost>5)csWhoosh();carStep(P,dt,t,s,340,wb);ai(dt);wall(P);wall(E);bump();pads(dt);hit(P);hit(E);ball(dt)}
    draw()});
};
