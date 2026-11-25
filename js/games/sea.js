/* لعبة: G.sea (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- عالم البحار: اجمع الكنوز وتجنّب أسماك القرش ---- */
G.sea=(root,c)=>{
  const W=1000,H=600,goal=c.fi(8,34),nSh=c.fi(1,6),shSp=c.f(110,300),secs=40;let pts=0,lives=c.lv<10?3:c.lv<20?2:1,inv=0,face=1,items=[],sharks=[],bub=[],spT=0;
  const P={x:200,y:300};let pops=[];
  /* الكائنات: صدفة +1 ثابتة تنتظر، نجمة +2 تتحرك، سمكة ذهبية +3 تتحرك وتختفي، سلطعون أحمر -1، سمكة منتفخة برتقالية -2 */
  const KIND={shell:{e:'🐚',v:1,s:38},star:{e:'⭐',v:2,s:42,sp:70},gold:{e:'🐟',v:3,s:44,sp:150,life:6},crab:{e:'🦀',v:-1,s:42,sp:45,life:9,warn:'#ef4444'},puff:{e:'🐡',v:-2,s:44,sp:60,life:9,warn:'#f97316'}};
  const pickKind=()=>{const r=Math.random();return r<.42?'shell':r<.64?'star':r<.74?'gold':r<.88?'crab':'puff'};
  const A=arena(root,c,{W,H,tbar:1,pads:PADS4,hud:`<span class="pill">⭐ <b class="pt">0</b> من ${goal}</span><span class="pill lv2">${heartsPill(lives)}</span>`});
  const res=()=>({got:Math.min(pts,goal),total:goal,label:'النقاط'});
  const tb=c.timeBar(root,secs,()=>A.lose('انتهى الوقت!',res()));
  const newShark=()=>{const l=Math.random()<.5;return{x:l?-80:W+80,y:rnd(90,H-90),v:(l?1:-1)*shSp*(.8+Math.random()*.4),w:Math.random()*6}};
  for(let i=0;i<nSh;i++){const s=newShark();s.x=rnd(400,W-60);sharks.push(s)}
  for(let i=0;i<18;i++)bub.push({x:rnd(0,W),y:rnd(0,H),r:rnd(2,6),v:rnd(20,50)});
  A.loop(dt=>{const x=A.x,t=A.t;spT-=dt;if(spT<=0&&items.length<7){spT=c.f(.9,1.3);const k=pickKind(),K=KIND[k],an=Math.random()*6.28;let p,n=0;do{p={x:rnd(60,W-60),y:rnd(80,H-70)};n++}while(n<30&&Math.hypot(p.x-P.x,p.y-P.y)<160);
      items.push({...p,k,...K,a:0,vx:K.sp?Math.cos(an)*K.sp:0,vy:K.sp?Math.sin(an)*K.sp*.6:0})}
    const[dx,dy]=dirOf(A);let mx=0,my=0;if(dx||dy){const d=Math.hypot(dx,dy);mx=dx/d;my=dy/d}else if(A.ptr.down){const ddx=A.ptr.x-P.x,ddy=A.ptr.y-P.y,d=Math.hypot(ddx,ddy);if(d>8){mx=ddx/d;my=ddy/d}}
    P.x=clamp(P.x+mx*300*dt,40,W-40);P.y=clamp(P.y+my*300*dt,50,H-40);if(mx)face=mx>0?1:-1;inv=Math.max(0,inv-dt);
    const pop=(X,Y,txt,col)=>pops.push({x:X,y:Y,t:txt,col,a:0});
    items.forEach(it=>{it.a+=dt;if(it.sp){it.x+=it.vx*dt;it.y+=it.vy*dt;if(it.x<50||it.x>W-50)it.vx=-it.vx;if(it.y<70||it.y>H-70)it.vy=-it.vy;it.x=clamp(it.x,50,W-50);it.y=clamp(it.y,70,H-70)}
      if(it.life&&it.a>it.life){it.got=1;return}
      if(Math.hypot(it.x-P.x,it.y-P.y)<46){it.got=1;pts=Math.max(0,pts+it.v);A.set('.pt',Math.min(pts,goal));if(it.v>0){pop(it.x,it.y,'+'+it.v,'#facc15');fxPt(A,it.x,it.y);sfx.good()}else{pop(it.x,it.y,String(it.v),it.warn);sfx.bad()}}});items=items.filter(it=>!it.got);
    if(pts>=goal)return A.win(pts*10+Math.round(tb.left())*3,'جمعت كل النقاط! ⭐',{...res(),perfect:true});
    sharks.forEach(s=>{items.forEach(it=>{if(!it.got&&it.v>0&&Math.hypot(it.x-s.x,it.y-s.y)<50){it.got=1;pop(it.x,it.y,'🦈 أكلها!','#e2e8f0')}});items=items.filter(it=>!it.got);s.x+=s.v*dt;s.w+=dt;s.y+=Math.sin(s.w*2)*30*dt;if((s.v>0&&s.x>W+100)||(s.v<0&&s.x<-100))Object.assign(s,newShark());
      if(!inv&&Math.hypot(s.x-P.x,s.y-P.y)<52){lives--;inv=1.6;A.set('.lv2',heartsPill(lives));sfx.bad();if(lives<=0)A.lose('أمسكك القرش! 🦈',res())}});
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0ea5e9');g.addColorStop(.55,'#0369a1');g.addColorStop(1,'#0c2d5a');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.save();x.globalAlpha=.12;x.fillStyle='#fff';for(let k=0;k<5;k++){const rx=(k*230+t*20)%(W+200)-100;x.beginPath();x.moveTo(rx,0);x.lineTo(rx+90,0);x.lineTo(rx+240,H);x.lineTo(rx+150,H);x.fill()}x.restore();
    x.fillStyle='#c2a16a';x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=50)x.lineTo(X,H-26-Math.sin(X*.02)*10);x.lineTo(W,H);x.fill();
    for(let k=0;k<9;k++){const sx=60+k*115,sh=60+(k%3)*25;x.strokeStyle=k%2?'#22c55e':'#15803d';x.lineWidth=8;x.lineCap='round';x.beginPath();x.moveTo(sx,H-20);x.quadraticCurveTo(sx+Math.sin(t*2+k)*18,H-20-sh/2,sx+Math.sin(t*2+k+1)*10,H-20-sh);x.stroke()}
    bub.forEach(b=>{b.y-=b.v*dt;if(b.y<-10){b.y=H+10;b.x=rnd(0,W)}x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=1.5;x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.stroke()});
    items.forEach(it=>{if(it.life&&it.life-it.a<1.5&&Math.sin(it.a*25)>0)return;const bad=it.v<0;x.globalAlpha=bad?.5:.35;x.fillStyle=bad?it.warn:'#fff7c2';x.beginPath();x.arc(it.x,it.y,26+Math.sin(it.a*5)*4,0,7);x.fill();x.globalAlpha=1;
      if(bad){x.strokeStyle=it.warn;x.lineWidth=3;x.beginPath();x.arc(it.x,it.y,30,0,7);x.stroke()}
      x.save();x.translate(it.x,it.y+Math.sin(it.a*3)*4);if(it.vx>0&&it.k!=='star')x.scale(-1,1);emo(x,it.e,0,0,it.s);x.restore();
      x.direction='ltr';x.font='800 16px system-ui,sans-serif';x.textAlign='center';x.lineWidth=4;x.strokeStyle='#fff';const lb=(it.v>0?'+':'')+it.v;x.strokeText(lb,it.x+22,it.y-22);x.fillStyle=bad?it.warn:'#16a34a';x.fillText(lb,it.x+22,it.y-22)});
    sharks.forEach(s=>{x.save();x.translate(s.x,s.y);if(s.v>0)x.scale(-1,1);emo(x,'🦈',0,0,70);x.restore()});
    x.save();x.translate(P.x,P.y);if(face>0)x.scale(-1,1);x.globalAlpha=inv&&Math.sin(t*30)>0?.35:1;emo(x,'🐠',0,0,60);x.restore();
    x.direction='ltr';pops=pops.filter(p=>(p.a+=dt)<1);pops.forEach(p=>{x.globalAlpha=1-p.a;txt(x,p.t,p.x,p.y-p.a*60,30,p.col);x.globalAlpha=1});
    x.direction='inherit';hintTxt(A,x,'اجمع 🐚+1 ⭐+2 🐟+3 قبل القرش · احذر 🦀-1 و🐡-2')});
};
