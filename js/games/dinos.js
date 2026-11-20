/* لعبة: G.dinos (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- الديناصورات: اركض واقفز فوق العقبات ---- */
function drawDino(x,X,Y,t,air,col='#22c55e'){x.save();x.translate(X,Y);const g=x.createLinearGradient(0,-80,0,0);g.addColorStop(0,'#86efac');g.addColorStop(1,col);x.fillStyle=g;
  x.beginPath();x.moveTo(-46,-38);x.quadraticCurveTo(-70,-30,-78,-48);x.quadraticCurveTo(-60,-22,-40,-18);x.closePath();x.fill();
  x.beginPath();x.ellipse(-8,-36,36,24,0,0,7);x.fill();x.beginPath();x.ellipse(22,-66,22,17,-.2,0,7);x.fill();x.fillRect(10,-60,14,24);
  x.fillStyle='#fff';x.beginPath();x.arc(30,-71,6,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(32,-71,3,0,7);x.fill();
  x.strokeStyle=col;x.lineWidth=9;x.lineCap='round';const s=air?0:Math.sin(t*22)*9;x.beginPath();x.moveTo(-16,-16);x.lineTo(-16+s,0);x.moveTo(4,-16);x.lineTo(4-s,0);x.stroke();
  x.fillStyle='#fde047';for(let k=0;k<4;k++){x.beginPath();x.moveTo(-34+k*12,-58+k*1.5);x.lineTo(-28+k*12,-68);x.lineTo(-22+k*12,-58);x.fill()}x.restore()}
G.dinos=(root,c)=>{
  const W=1000,H=440,GY=360,goal=c.fi(300,1600),sp0=c.f(330,560),acc=c.f(4,14),gapMin=c.f(560,300);let sp=sp0,dist=0,vy=0,y=0,obs=[],nextX=700,clouds=[],eggs=0,lives=c.lv<10?2:1,inv=0;
  for(let k=0;k<5;k++)clouds.push({x:rnd(0,W),y:rnd(40,160),s:rnd(50,90)});
  const jump=()=>{if(y===0&&A.alive){vy=-860;beep(620,.06,'triangle',.07)}};
  const A=arena(root,c,{W,H,pads:[{k:'Space',l:'⬆️',side:'r',big:1}],hud:`<span class="pill">🏃 <b class="ds">0</b> من ${goal} م</span><span class="pill lv2">${heartsPill(lives)}</span>`,onDown:jump,onKey:k=>{if(k==='Space'||k==='ArrowUp'||k==='KeyW')jump()}});
  const res=()=>({got:Math.min(goal,Math.floor(dist)),total:goal,label:'المسافة (م)'});
  A.loop(dt=>{const x=A.x,t=A.t;sp+=acc*dt;dist+=sp*dt/10;A.set('.ds',Math.floor(dist));inv=Math.max(0,inv-dt);
    vy+=2300*dt;y=Math.min(0,y+vy*dt);if(y===0)vy=0;
    nextX-=sp*dt;if(nextX<W+50){const fly=c.lv>=12&&Math.random()<.25,egg=Math.random()<.35;obs.push({x:W+60,k:fly?'fly':Math.random()<.5?'cactus':'rock',egg});nextX=W+50+gapMin*(1+Math.random()*.9)}
    obs.forEach(o=>{o.x-=sp*dt;const ox=o.x,oy=o.k==='fly'?GY-120:GY-28,hit=Math.abs(ox-140)<(o.k==='rock'?40:34)&&(o.k==='fly'?(y<-40&&y>-170):(y>-56));
      if(o.egg&&!o.eg&&Math.abs(ox-140)<40&&y<-70){o.eg=1;eggs++;fxPt(A,ox,GY-150);sfx.good()}
      if(hit&&!inv&&!o.hit){o.hit=1;lives--;inv=1.2;A.set('.lv2',heartsPill(lives));sfx.bad();if(lives<=0)A.lose('اصطدمت بعقبة!',res())}});
    obs=obs.filter(o=>o.x>-80);
    if(dist>=goal)return A.win(Math.floor(dist)/5+eggs*20,'وصلت لنهاية الطريق! 🦖',{...res(),got:goal,perfect:true});
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fdba74');g.addColorStop(.6,'#fef3c7');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='rgba(255,255,255,.7)';clouds.forEach(cl=>{cl.x-=sp*dt*.15;if(cl.x<-120)cl.x=W+60;x.beginPath();x.arc(cl.x,cl.y,cl.s*.5,0,7);x.arc(cl.x+cl.s*.45,cl.y+5,cl.s*.4,0,7);x.fill()});
    x.fillStyle='#a16207';x.globalAlpha=.25;x.beginPath();x.moveTo(0,GY);for(let X=0;X<=W;X+=40)x.lineTo(X,GY-80-Math.sin((X+dist*3)*.006)*50);x.lineTo(W,GY);x.fill();x.globalAlpha=1;
    const gg=x.createLinearGradient(0,GY,0,H);gg.addColorStop(0,'#d97706');gg.addColorStop(1,'#92400e');x.fillStyle=gg;x.fillRect(0,GY,W,H-GY);
    x.fillStyle='rgba(0,0,0,.15)';for(let X=-((dist*10)%60);X<W;X+=60)x.fillRect(X,GY+18,24,5);
    obs.forEach(o=>{if(o.k==='fly')emo(x,'🦅',o.x,GY-120+Math.sin(t*8)*6,58);else emo(x,o.k==='cactus'?'🌵':'🪨',o.x,GY-28,o.k==='cactus'?64:54);if(o.egg&&!o.eg)emo(x,'🥚',o.x,GY-150,34)});
    x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(140,GY+2,40*(1+y/400),8,0,0,7);x.fill();
    x.globalAlpha=inv&&Math.sin(t*30)>0?.35:1;drawDino(x,150,GY+y,t,y<0);x.globalAlpha=1;
    hintTxt(A,x,'اضغط أو المس الشاشة لتقفز فوق الصبار والصخور، واجمع البيض 🥚')});
};
