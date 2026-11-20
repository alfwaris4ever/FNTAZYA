/* لعبة: G.hole (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 10) الثقب الجائع — مستوحاة من Hole.io */
G.hole=(root,c)=>{
  const W=1000,H=650,TIERS=[['🌼',9],['🪨',10],['🍎',9],['🗑️',13],['🛴',15],['🚲',18],['🌳',25],['🚗',27],['🛻',31],['🚌',38],['🏠',46],['🏢',58]];
  const N=c.fi(42,70),rival=c.lv>=10,secs=Math.round(c.f(65,55));let objs=[],eaten=0;
  for(let i=0;i<N;i++){const t=TIERS[Math.min(TIERS.length-1,Math.floor(Math.pow(Math.random(),1.5)*TIERS.length))];let o,tries=0;
    do{o={x:rnd(40,W-40),y:rnd(40,H-40),e:t[0],s:t[1],f:0}}while(tries++<30&&objs.some(q=>Math.hypot(q.x-o.x,q.y-o.y)<q.s+o.s+6));objs.push(o)}
  const goal=Math.round(N*c.f(.4,.75));
  const P={x:150,y:H/2,r:24,col:'#2563eb'},E={x:W-150,y:H/2,r:24,col:'#dc2626',tx:W/2,ty:H/2,th:0,dead:!rival};
  const A=arena(root,c,{W,H,tbar:1,hud:`<span class="pill">🕳️ <b class="et">0</b> من ${goal}</span>${rival?'<span class="pill">🔴 احذر الثقب الأحمر الكبير</span>':''}`});
  const res=()=>({got:Math.min(eaten,goal),total:goal,label:'الأشياء المبتلعة'});
  const tb=c.timeBar(root,secs,()=>{eaten>=goal*.5?A.win(eaten*5,'انتهى الوقت',res()):A.lose('انتهى الوقت',res())});
  function mv(o,tx,ty,dt){const sp=230+o.r*.9,dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy);if(d<3)return;const s=Math.min(d,sp*dt);o.x=clamp(o.x+dx/d*s,o.r*.6,W-o.r*.6);o.y=clamp(o.y+dy/d*s,o.r*.6,H-o.r*.6)}
  function eat(hl){for(const o of objs)if(!o.f&&o.s<hl.r*.92&&Math.hypot(o.x-hl.x,o.y-hl.y)<hl.r-o.s*.35){o.f=.001;o.by=hl}}
  A.loop(dt=>{const x=A.x;const[dx,dy]=dirOf(A);if(dx||dy)mv(P,P.x+dx*100,P.y+dy*100,dt);else if(A.ptr.down)mv(P,A.ptr.x,A.ptr.y,dt);
    if(!E.dead){E.th-=dt;if(E.th<=0){E.th=c.f(.5,.2);let best=null,bs=-1;for(const o of objs)if(!o.f&&o.s<E.r*.9){const s=o.s/(Math.hypot(o.x-E.x,o.y-E.y)+60);if(s>bs){bs=s;best=o}}
        if(E.r>P.r*1.2&&Math.hypot(P.x-E.x,P.y-E.y)<300){E.tx=P.x;E.ty=P.y}else if(best){E.tx=best.x;E.ty=best.y}}mv(E,E.tx,E.ty,dt*c.f(.6,.95));eat(E)}
    eat(P);
    for(const o of objs)if(o.f&&o.f<1){o.f+=dt*3.5;if(o.f>=1){o.f=1;const hl=o.by;hl.r=Math.sqrt(hl.r*hl.r+o.s*o.s*.32);if(hl===P){eaten++;A.set('.et',eaten);beep(300+o.s*10,.07,'sine',.1)}}}
    if(!E.dead){const d=Math.hypot(P.x-E.x,P.y-E.y);if(E.r>P.r*1.15&&d<E.r-P.r*.4)return(sfx.bad(),A.lose('ابتلعك الثقب الأحمر!',res()));if(P.r>E.r*1.15&&d<P.r-E.r*.4){E.dead=1;eaten+=3;A.set('.et',eaten);sfx.good()}}
    if(eaten>=goal)return A.win(eaten*5+Math.round(tb.left())*2,'ابتلعت كل المطلوب! 🕳️',{...res(),perfect:true});
    x.fillStyle='#a3e635';x.fillRect(0,0,W,H);x.fillStyle='#d4d4d8';for(let g=0;g<W;g+=200)x.fillRect(g+90,0,26,H);for(let g=0;g<H;g+=200)x.fillRect(0,g+90,W,26);
    const holes=[P,...(E.dead?[]:[E])];holes.forEach(hl=>{x.fillStyle='#0b0b14';x.beginPath();x.ellipse(hl.x,hl.y,hl.r,hl.r*.86,0,0,7);x.fill();x.strokeStyle=hl.col;x.lineWidth=5;x.stroke()});
    objs.forEach(o=>{if(o.f>=1)return;const k=1-o.f,X=o.f?o.x+(o.by.x-o.x)*o.f:o.x,Y=o.f?o.y+(o.by.y-o.y)*o.f:o.y;emo(x,o.e,X,Y,o.s*2*Math.max(.05,k))});
    holes.forEach(hl=>txt(x,Math.round(hl.r),hl.x,hl.y-hl.r-14,18,hl.col));hintTxt(A,x,'حرّك الثقب وابتلع الأشياء الأصغر منه لتكبر')});
};
