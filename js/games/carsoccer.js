/* لعبة: G.carsoccer (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 1) كرة السيارات — مستوحاة من Rocket Soccer Derby */
G.carsoccer=(root,c)=>{
  const W=1000,H=620,F=30,GT=230,GB=390,goal=c.fi(1,5),aiV=c.f(170,360),secs=Math.round(c.f(75,95));let pg=0,ag=0,freeze=0,msg='';
  const A=arena(root,c,{W,H,tbar:1,hud:`<span class="pill">🔵 <b class="pg">0</b> : <b class="ag">0</b> 🔴</span><span class="pill">🎯 سجّل ${goal}</span>`});
  const P={x:800,y:310,a:Math.PI,v:0},E={x:200,y:310,a:0,v:0},B={x:500,y:310,vx:0,vy:0,r:19};
  const reset=()=>{Object.assign(P,{x:800,y:310,a:Math.PI,v:0});Object.assign(E,{x:200,y:310,a:0,v:0});Object.assign(B,{x:500,y:310+rnd(-50,50),vx:0,vy:0})};
  const res=()=>({got:pg,total:goal,label:'أهدافك'});
  function hit(o){const dx=B.x-o.x,dy=B.y-o.y,d=Math.hypot(dx,dy)||1,R=B.r+25;if(d>=R)return;const nx=dx/d,ny=dy/d;B.x=o.x+nx*R;B.y=o.y+ny*R;
    const vx=Math.cos(o.a)*o.v,vy=Math.sin(o.a)*o.v,rel=(vx-B.vx)*nx+(vy-B.vy)*ny;if(rel>0){B.vx+=nx*rel*1.55;B.vy+=ny*rel*1.55;if(rel>60)beep(260,.05,'square',.06)}B.vx+=nx*30;B.vy+=ny*30}
  function wall(o){const m=F+20;if(o.x<m){o.x=m;o.v*=.4}if(o.x>W-m){o.x=W-m;o.v*=.4}if(o.y<m){o.y=m;o.v*=.4}if(o.y>H-m){o.y=H-m;o.v*=.4}}
  function sep(){const dx=E.x-P.x,dy=E.y-P.y,d=Math.hypot(dx,dy)||1;if(d<46){const k=(46-d)/2;P.x-=dx/d*k;P.y-=dy/d*k;E.x+=dx/d*k;E.y+=dy/d*k;P.v*=.8;E.v*=.8}}
  function score(me){me?pg++:ag++;A.set('.pg',pg);A.set('.ag',ag);me?sfx.good():sfx.bad();msg=me?'⚽ هدف رائع!':'😮 هدف للخصم';freeze=1.3;
    if(pg>=goal)return A.win(pg*20+Math.round(tb.left())*2,`سجّلت ${goal} ${goal>2?'أهداف':'هدف'}! ⚽`,{...res(),perfect:true});
    if(ag>=goal)return A.lose('الخصم سجّل أهدافه أولاً',res())}
  const tb=c.timeBar(root,secs,()=>{pg>ag?A.win(pg*20,'انتهى الوقت وأنت متقدّم 👏',res()):A.lose('انتهى الوقت',res())});
  function ai(dt){let dx=B.x-(W+30),dy=B.y-310,d=Math.hypot(dx,dy)||1,tx=B.x+dx/d*42,ty=B.y+dy/d*42;
    if(E.x>B.x+12){tx=B.x-95;ty=B.y+(E.y<B.y?-75:75)}const[t,s]=steerTo(E,tx,ty);carMove(E,dt,t,s,aiV)}
  function ball(dt){B.x+=B.vx*dt;B.y+=B.vy*dt;const f=Math.pow(.5,dt);B.vx*=f;B.vy*=f;const sp=Math.hypot(B.vx,B.vy);if(sp>900){B.vx*=900/sp;B.vy*=900/sp}
    if(B.y<F+B.r){B.y=F+B.r;B.vy=Math.abs(B.vy)*.8}if(B.y>H-F-B.r){B.y=H-F-B.r;B.vy=-Math.abs(B.vy)*.8}const inG=B.y>GT+B.r*.5&&B.y<GB-B.r*.5;
    if(!inG&&B.x<F+B.r){B.x=F+B.r;B.vx=Math.abs(B.vx)*.8}if(!inG&&B.x>W-F-B.r){B.x=W-F-B.r;B.vx=-Math.abs(B.vx)*.8}
    if(B.x<F-B.r)score(true);else if(B.x>W-F+B.r)score(false)}
  function draw(){const x=A.x;x.fillStyle='#3d9b47';x.fillRect(0,0,W,H);for(let i=0;i<10;i++){x.fillStyle=i%2?'#58b860':'#4caf55';x.fillRect(F+i*(W-2*F)/10,F,(W-2*F)/10,H-2*F)}
    x.strokeStyle='#fff';x.lineWidth=4;x.strokeRect(F,F,W-2*F,H-2*F);x.beginPath();x.moveTo(W/2,F);x.lineTo(W/2,H-F);x.stroke();x.beginPath();x.arc(W/2,H/2,70,0,7);x.stroke();
    x.fillStyle='rgba(239,68,68,.55)';x.fillRect(0,GT,F,GB-GT);x.fillStyle='rgba(59,130,246,.55)';x.fillRect(W-F,GT,F,GB-GT);
    x.fillStyle='#fff';[[F,GT],[F,GB],[W-F,GT],[W-F,GB]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,7,0,7);x.fill()});
    drawCar(x,E,'#ef4444');drawCar(x,P,'#2563eb');emo(x,'⚽',B.x,B.y,40,(B.x/B.r)%6.28);
    if(freeze>0)txt(x,msg,W/2,H/2,54,'#1d2350');hintTxt(A,x,'👆 اسحب بإصبعك أو استخدم الأسهم · سجّل في المرمى الأحمر')}
  A.loop(dt=>{if(freeze>0){freeze-=dt;if(freeze<=0)reset()}else{const[t,s]=playerCar(A,P);carMove(P,dt,t,s,340);ai(dt);wall(P);wall(E);sep();hit(P);hit(E);ball(dt)}draw()});
};
