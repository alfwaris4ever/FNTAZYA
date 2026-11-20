/* لعبة: G.sea (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- عالم البحار: اجمع الكنوز وتجنّب أسماك القرش ---- */
G.sea=(root,c)=>{
  const W=1000,H=600,goal=c.fi(8,34),nSh=c.fi(1,6),shSp=c.f(110,300),secs=40;let pts=0,lives=c.lv<10?3:c.lv<20?2:1,inv=0,face=1,items=[],sharks=[],bub=[],spT=0;
  const P={x:200,y:300};
  const A=arena(root,c,{W,H,tbar:1,pads:PADS4,hud:`<span class="pill">🐚 <b class="pt">0</b> من ${goal}</span><span class="pill lv2">${heartsPill(lives)}</span>`});
  const res=()=>({got:Math.min(pts,goal),total:goal,label:'الكنوز'});
  const tb=c.timeBar(root,secs,()=>A.lose('انتهى الوقت!',res()));
  const newShark=()=>{const l=Math.random()<.5;return{x:l?-80:W+80,y:rnd(90,H-90),v:(l?1:-1)*shSp*(.8+Math.random()*.4),w:Math.random()*6}};
  for(let i=0;i<nSh;i++){const s=newShark();s.x=rnd(400,W-60);sharks.push(s)}
  for(let i=0;i<18;i++)bub.push({x:rnd(0,W),y:rnd(0,H),r:rnd(2,6),v:rnd(20,50)});
  A.loop(dt=>{const x=A.x,t=A.t;spT-=dt;if(spT<=0&&items.length<6){spT=c.f(.9,1.3);const big=Math.random()<.22;items.push({x:rnd(60,W-60),y:rnd(80,H-60),e:big?'⭐':'🐚',v:big?3:1,a:0})}
    const[dx,dy]=dirOf(A);let mx=0,my=0;if(dx||dy){const d=Math.hypot(dx,dy);mx=dx/d;my=dy/d}else if(A.ptr.down){const ddx=A.ptr.x-P.x,ddy=A.ptr.y-P.y,d=Math.hypot(ddx,ddy);if(d>8){mx=ddx/d;my=ddy/d}}
    P.x=clamp(P.x+mx*300*dt,40,W-40);P.y=clamp(P.y+my*300*dt,50,H-40);if(mx)face=mx>0?1:-1;inv=Math.max(0,inv-dt);
    items.forEach(it=>{it.a+=dt;if(Math.hypot(it.x-P.x,it.y-P.y)<46){it.got=1;pts+=it.v;A.set('.pt',pts);fxPt(A,it.x,it.y);sfx.good()}});items=items.filter(it=>!it.got);
    if(pts>=goal)return A.win(pts*10+Math.round(tb.left())*3,'جمعت كل الكنوز! 🐚',{...res(),perfect:true});
    sharks.forEach(s=>{s.x+=s.v*dt;s.w+=dt;s.y+=Math.sin(s.w*2)*30*dt;if((s.v>0&&s.x>W+100)||(s.v<0&&s.x<-100))Object.assign(s,newShark());
      if(!inv&&Math.hypot(s.x-P.x,s.y-P.y)<52){lives--;inv=1.6;A.set('.lv2',heartsPill(lives));sfx.bad();if(lives<=0)A.lose('أمسكك القرش! 🦈',res())}});
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0ea5e9');g.addColorStop(.55,'#0369a1');g.addColorStop(1,'#0c2d5a');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.save();x.globalAlpha=.12;x.fillStyle='#fff';for(let k=0;k<5;k++){const rx=(k*230+t*20)%(W+200)-100;x.beginPath();x.moveTo(rx,0);x.lineTo(rx+90,0);x.lineTo(rx+240,H);x.lineTo(rx+150,H);x.fill()}x.restore();
    x.fillStyle='#c2a16a';x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=50)x.lineTo(X,H-26-Math.sin(X*.02)*10);x.lineTo(W,H);x.fill();
    for(let k=0;k<9;k++){const sx=60+k*115,sh=60+(k%3)*25;x.strokeStyle=k%2?'#22c55e':'#15803d';x.lineWidth=8;x.lineCap='round';x.beginPath();x.moveTo(sx,H-20);x.quadraticCurveTo(sx+Math.sin(t*2+k)*18,H-20-sh/2,sx+Math.sin(t*2+k+1)*10,H-20-sh);x.stroke()}
    bub.forEach(b=>{b.y-=b.v*dt;if(b.y<-10){b.y=H+10;b.x=rnd(0,W)}x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=1.5;x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.stroke()});
    items.forEach(it=>{x.globalAlpha=.35;x.fillStyle='#fff7c2';x.beginPath();x.arc(it.x,it.y,26+Math.sin(it.a*5)*4,0,7);x.fill();x.globalAlpha=1;emo(x,it.e,it.x,it.y+Math.sin(it.a*3)*4,it.v>1?44:38)});
    sharks.forEach(s=>{x.save();x.translate(s.x,s.y);if(s.v>0)x.scale(-1,1);emo(x,'🦈',0,0,70);x.restore()});
    x.save();x.translate(P.x,P.y);if(face>0)x.scale(-1,1);x.globalAlpha=inv&&Math.sin(t*30)>0?.35:1;emo(x,'🐠',0,0,60);x.restore();
    hintTxt(A,x,'حرّك السمكة بالأسهم أو بإصبعك: اجمع الأصداف والنجوم وابتعد عن القرش')});
};
