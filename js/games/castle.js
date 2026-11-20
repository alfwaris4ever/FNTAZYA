/* لعبة: G.castle (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- مغامرة القلعة: خذ المفتاح وادخل القلعة ---- */
function makeMaze(w,h){const V=Array.from({length:h},()=>Array(w).fill(false)),E=new Set(),st=[[0,0]];V[0][0]=true;
  while(st.length){const[x,y]=st[st.length-1],nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[x+a,y+b]).filter(([a,b])=>a>=0&&b>=0&&a<w&&b<h&&!V[b][a]);
    if(!nb.length){st.pop();continue}const[nx,ny]=nb[rnd(0,nb.length-1)];V[ny][nx]=true;E.add(`${x},${y}|${nx},${ny}`);E.add(`${nx},${ny}|${x},${y}`);st.push([nx,ny])}
  for(let k=0;k<Math.floor(w*h*.08);k++){const x=rnd(0,w-2),y=rnd(0,h-1);E.add(`${x},${y}|${x+1},${y}`);E.add(`${x+1},${y}|${x},${y}`)}return E}
G.castle=(root,c)=>{
  const w=c.fi(5,13),hh=Math.max(4,Math.round(w*.62)),E=makeMaze(w,hh),open=(a,b,dx,dy)=>E.has(`${a},${b}|${a+dx},${b+dy}`);
  const nG=c.lv<3?0:c.fi(1,5),gSp=c.f(1.6,3.4),secs=Math.round(w*hh*c.f(2.6,1.3)+15);let lives=c.lv<10?3:c.lv<20?2:1,hasKey=false,inv=0;
  const K={x:rnd(Math.floor(w/2),w-1),y:rnd(0,hh-1)},D={x:w-1,y:hh-1};if(K.x===D.x&&K.y===D.y)K.y=0;
  const P={x:0,y:0,tx:0,ty:0,nx:[0,0]};const ghosts=[...Array(nG)].map(()=>({x:rnd(2,w-1),y:rnd(1,hh-1),tx:0,ty:0,d:[0,0]}));ghosts.forEach(g=>{g.tx=g.x;g.ty=g.y});
  const CS=90,W=w*CS,H=hh*CS;let sw=null;
  const A=arena(root,c,{W,H,tbar:1,pads:PADS4,hud:`<span class="pill kp">🗝️ ابحث عن المفتاح</span><span class="pill lv2">${heartsPill(lives)}</span>`,
    onKey:k=>{if(DIRK[k])P.nx=DIRK[k]},onDown:p=>{sw={x:p.x,y:p.y}},onUp:p=>{if(!sw)return;const dx=p.x-sw.x,dy=p.y-sw.y;if(Math.hypot(dx,dy)>20)P.nx=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];else{const tx=Math.floor(p.x/CS),ty=Math.floor(p.y/CS),ddx=tx-P.tx,ddy=ty-P.ty;if(Math.abs(ddx)+Math.abs(ddy)===1)P.nx=[ddx,ddy]}sw=null}});
  const res=()=>({got:hasKey?1:0,total:2,label:'المهام (المفتاح والقلعة)'});
  const tb=c.timeBar(root,secs,()=>A.lose('انتهى الوقت!',res()));
  const step=(o,sp,dt)=>{const dx=o.tx-o.x,dy=o.ty-o.y,d=Math.hypot(dx,dy);if(d<1e-3){o.x=o.tx;o.y=o.ty;return true}const s=Math.min(d,sp*dt);o.x+=dx/d*s;o.y+=dy/d*s;return false};
  A.loop(dt=>{const x=A.x,t=A.t;inv=Math.max(0,inv-dt);
    if(step(P,4.2,dt)){const held=Object.entries(DIRK).find(([k])=>A.k(k));const d=held?held[1]:P.nx;if((d[0]||d[1])&&open(P.tx,P.ty,d[0],d[1])){P.tx+=d[0];P.ty+=d[1]}P.nx=[0,0]}
    if(!hasKey&&Math.hypot(P.x-K.x,P.y-K.y)<.4){hasKey=true;A.set('.kp','🗝️ معك المفتاح! اذهب للقلعة');fxPt(A,(K.x+.5)*CS,(K.y+.5)*CS);sfx.good()}
    if(hasKey&&Math.hypot(P.x-D.x,P.y-D.y)<.4)return A.win(200+Math.round(tb.left())*4+lives*50,'دخلت القلعة بأمان! 🏰',{got:2,total:2,perfect:true,label:'المهام (المفتاح والقلعة)'});
    ghosts.forEach(g=>{if(step(g,gSp,dt)){const op=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>open(g.tx,g.ty,d[0],d[1]));let o2=op.filter(d=>!(d[0]===-g.d[0]&&d[1]===-g.d[1]));if(!o2.length)o2=op;
        if(Math.random()<c.f(.15,.6))o2.sort((a,b)=>Math.hypot(g.tx+a[0]-P.tx,g.ty+a[1]-P.ty)-Math.hypot(g.tx+b[0]-P.tx,g.ty+b[1]-P.ty));const d=Math.random()<c.f(.15,.6)?o2[0]:o2[rnd(0,o2.length-1)];g.d=d;g.tx+=d[0];g.ty+=d[1]}
      if(!inv&&Math.hypot(g.x-P.x,g.y-P.y)<.55){lives--;inv=1.8;A.set('.lv2',heartsPill(lives));sfx.bad();if(lives<=0)A.lose('أمسكك الشبح! 👻',res())}});
    for(let j=0;j<hh;j++)for(let i=0;i<w;i++){x.fillStyle=(i+j)%2?'#4d7c3a':'#558a40';x.fillRect(i*CS,j*CS,CS,CS)}
    x.fillStyle='#6b7280';x.strokeStyle='#374151';x.lineWidth=2;const wallH=(X,Y,L)=>{const g=x.createLinearGradient(X,Y-7,X,Y+7);g.addColorStop(0,'#9ca3af');g.addColorStop(1,'#4b5563');x.fillStyle=g;x.fillRect(X-7,Y-7,L+14,14)},wallV=(X,Y,L)=>{const g=x.createLinearGradient(X-7,Y,X+7,Y);g.addColorStop(0,'#9ca3af');g.addColorStop(1,'#4b5563');x.fillStyle=g;x.fillRect(X-7,Y-7,14,L+14)};
    for(let j=0;j<hh;j++)for(let i=0;i<w;i++){if(!open(i,j,1,0))wallV((i+1)*CS,j*CS,CS);if(!open(i,j,0,1))wallH(i*CS,(j+1)*CS,CS)}
    wallH(0,0,W);wallV(0,0,H);wallH(0,H,W);wallV(W,0,H);
    emo(x,'🏰',(D.x+.5)*CS,(D.y+.5)*CS,CS*.75);if(!hasKey){x.globalAlpha=.5+Math.sin(t*6)*.3;x.fillStyle='#fde047';x.beginPath();x.arc((K.x+.5)*CS,(K.y+.5)*CS,CS*.38,0,7);x.fill();x.globalAlpha=1;emo(x,'🗝️',(K.x+.5)*CS,(K.y+.5)*CS,CS*.55)}
    ghosts.forEach(g=>emo(x,'👻',(g.x+.5)*CS,(g.y+.5)*CS+Math.sin(t*4+g.tx)*4,CS*.6));
    x.globalAlpha=inv&&Math.sin(t*30)>0?.35:1;emo(x,'🤴',(P.x+.5)*CS,(P.y+.5)*CS,CS*.65);x.globalAlpha=1;
    hintTxt(A,x,'خذ المفتاح 🗝️ ثم ادخل القلعة 🏰 وتجنّب الأشباح')});
};
