/* لعبة: G.bee (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- النحلة النشيطة: طِر بين الأزهار ---- */
function drawBee(x,X,Y,ang,t){x.save();x.translate(X,Y);x.rotate(ang);x.fillStyle='rgba(255,255,255,.75)';const fl=Math.sin(t*50)*.35;
  x.beginPath();x.ellipse(-6,-22,14,9,-.6+fl,0,7);x.fill();x.beginPath();x.ellipse(8,-22,14,9,.6-fl,0,7);x.fill();
  const g=x.createRadialGradient(-6,-8,3,0,0,30);g.addColorStop(0,'#fff59d');g.addColorStop(1,'#f59e0b');x.fillStyle=g;x.beginPath();x.ellipse(0,0,28,20,0,0,7);x.fill();
  x.save();x.beginPath();x.ellipse(0,0,28,20,0,0,7);x.clip();x.fillStyle='#1f2937';[-12,0,12].forEach(s=>x.fillRect(s-3,-22,6,44));x.restore();
  x.fillStyle='#fff';x.beginPath();x.arc(19,-6,7,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(21,-6,3.5,0,7);x.fill();x.fillStyle='#1f2937';x.beginPath();x.moveTo(-28,0);x.lineTo(-38,-3);x.lineTo(-28,5);x.fill();x.restore()}
G.bee=(root,c)=>{
  const W=1000,H=600,goal=c.fi(5,26),gap=c.f(270,165),sp=c.f(190,330),space=c.f(420,300);let y=280,vy=0,gates=[],nextX=W+60,passed=0,honey=0,lives=c.lv<10?3:c.lv<20?2:1,inv=0,started=false;
  const flap=()=>{if(!A.alive)return;started=true;vy=-430;beep(760,.04,'triangle',.05)};
  const A=arena(root,c,{W,H,pads:[{k:'Space',l:'⬆️',side:'r',big:1}],hud:`<span class="pill">🌼 <b class="gp">0</b> من ${goal}</span><span class="pill lv2">${heartsPill(lives)}</span>`,onDown:flap,onKey:k=>{if(k==='Space'||k==='ArrowUp'||k==='KeyW')flap()}});
  const res=()=>({got:passed,total:goal,label:'الممرات'});
  A.loop(dt=>{const x=A.x,t=A.t;inv=Math.max(0,inv-dt);
    if(started){vy+=1250*dt;y+=vy*dt;nextX-=sp*dt;if(nextX<W+60){const cy=rnd(Math.round(110+gap/2),Math.round(H-90-gap/2));gates.push({x:W+80,cy,h:Math.random()<.6});nextX=W+60+space}
      gates.forEach(g=>{g.x-=sp*dt;if(!g.p&&g.x<200){g.p=1;passed++;A.set('.gp',passed);beep(880,.05,'sine',.07)}
        if(g.h&&!g.hg&&Math.hypot(g.x-210,g.cy-y)<40){g.hg=1;honey++;fxPt(A,g.x,g.cy);sfx.good()}
        if(!inv&&Math.abs(g.x-210)<48&&(y<g.cy-gap/2+18||y>g.cy+gap/2-18)){inv=1.4;lives--;A.set('.lv2',heartsPill(lives));sfx.bad();vy=-200;if(lives<=0)A.lose('اصطدمت بالزهرة!',res())}});
      gates=gates.filter(g=>g.x>-100);
      if(y>H-60||y<20){if(!inv){inv=1.2;lives--;A.set('.lv2',heartsPill(lives));sfx.bad();if(lives<=0)return A.lose('سقطت النحلة!',res())}y=clamp(y,20,H-60);vy=y>=H-60?-380:120}
      if(passed>=goal)return A.win(passed*20+honey*15,'وصلت للخلية! 🐝',{got:goal,total:goal,perfect:true,label:'الممرات'})}
    else y=280+Math.sin(t*3)*14;
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#7dd3fc');g.addColorStop(1,'#e0f2fe');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='#86efac';x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=50)x.lineTo(X,H-40-Math.sin((X+t*sp*.3)*.01)*16);x.lineTo(W,H);x.fill();
    gates.forEach(g=>{const top=g.cy-gap/2,bot=g.cy+gap/2;const st=x.createLinearGradient(g.x-18,0,g.x+18,0);st.addColorStop(0,'#15803d');st.addColorStop(.5,'#4ade80');st.addColorStop(1,'#15803d');x.fillStyle=st;
      x.fillRect(g.x-16,0,32,top-30);x.fillRect(g.x-16,bot+30,32,H-bot);emo(x,'🌸',g.x,top-24,72);emo(x,'🌻',g.x,bot+26,72);if(g.h&&!g.hg)emo(x,'🍯',g.x,g.cy,40)});
    x.globalAlpha=inv&&Math.sin(t*30)>0?.35:1;drawBee(x,210,y,clamp(vy/900,-.5,.6),t);x.globalAlpha=1;
    if(!started)txt(x,'اضغط لتبدأ الطيران',W/2,H*.5,34,'#1d4ed8');
    hintTxt(A,x,'اضغط لترفرف النحلة وتطير بين الأزهار، واجمع العسل 🍯')});
};
