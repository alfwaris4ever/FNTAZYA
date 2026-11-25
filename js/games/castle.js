/* لعبة: G.castle (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- مغامرة القلعة: خذ المفتاح وادخل القلعة ---- */
/* متاهة بلا طرق مسدودة (braid): كل خانة لها مخرجان على الأقل، فيبقى دائماً طريق للهروب من الشبح */
function makeMaze(w,h){const V=Array.from({length:h},()=>Array(w).fill(false)),E=new Set(),st=[[0,0]];V[0][0]=true;
  const link=(a,b,c2,d)=>{E.add(`${a},${b}|${c2},${d}`);E.add(`${c2},${d}|${a},${b}`)};
  while(st.length){const[x,y]=st[st.length-1],nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[x+a,y+b]).filter(([a,b])=>a>=0&&b>=0&&a<w&&b<h&&!V[b][a]);
    if(!nb.length){st.pop();continue}const[nx,ny]=nb[rnd(0,nb.length-1)];V[ny][nx]=true;link(x,y,nx,ny);st.push([nx,ny])}
  const deg=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>E.has(`${x},${y}|${x+a},${y+b}`)).length;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(deg(x,y)<2){const cl=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[x+a,y+b]).filter(([a,b])=>a>=0&&b>=0&&a<w&&b<h&&!E.has(`${x},${y}|${a},${b}`));
    if(cl.length){cl.sort((p,q)=>deg(...p)-deg(...q));const[a,b]=cl[0];link(x,y,a,b)}}
  for(let k=0;k<Math.floor(w*h*.06);k++){const x=rnd(0,w-2),y=rnd(0,h-1);link(x,y,x+1,y)}return E}
/* 10 أرضيات فاتحة ومبهجة (مثل الثعبان) تتبدّل مع كل مرحلة */
const CASTLE_FLOORS=[['#e0f2fe','#bae6fd'],['#fce7f3','#fbcfe8'],['#dcfce7','#bbf7d0'],['#ede9fe','#ddd6fe'],['#ffedd5','#fed7aa'],['#fef9c3','#fef08a'],['#ccfbf1','#99f6e4'],['#ffe4e6','#fecdd3'],['#fae8ff','#f5d0fe'],['#ecfccb','#d9f99d']];
G.castle=(root,c)=>{
  const w=c.fi(5,13),hh=Math.max(4,Math.round(w*.62)),E=makeMaze(w,hh),open=(a,b,dx,dy)=>E.has(`${a},${b}|${a+dx},${b+dy}`);
  const nG=c.lv<3?0:c.fi(1,5),gSp=c.f(1.6,3.4),secs=Math.round(w*hh*c.f(2.6,1.3)+15),FL=CASTLE_FLOORS[(c.run.stage-1)%CASTLE_FLOORS.length];
  const diff=c.run.diff,POWER=6;let lives=c.lv<10?3:c.lv<20?2:1,hasKey=false,inv=0,power=0,nextJump=20;
  const K={x:rnd(Math.floor(w/2),w-1),y:rnd(0,hh-1)},D={x:w-1,y:hh-1,tx:w-1,ty:hh-1,d:[0,0]};if(K.x===D.x&&K.y===D.y)K.y=0;
  const P={x:0,y:0,tx:0,ty:0,dir:[0,0],nx:[0,0]};const ghosts=[...Array(nG)].map(()=>({x:rnd(2,w-1),y:rnd(1,hh-1),tx:0,ty:0,d:[0,0]}));ghosts.forEach(g=>{g.tx=g.x;g.ty=g.y});
  /* الجواهر 💎: تخلي الأشباح شفافة ولا تأكل الأمير لمدة قصيرة */
  const taken=new Set([`0,0`,`${K.x},${K.y}`,`${D.x},${D.y}`,...ghosts.map(g=>`${g.x},${g.y}`)]),gems=[];
  for(let k=0;k<(nG?Math.min(4,1+Math.ceil(nG/2)):0);k++){let p,n=0;do{p={x:rnd(0,w-1),y:rnd(0,hh-1)};n++}while(n<200&&taken.has(`${p.x},${p.y}`));taken.add(`${p.x},${p.y}`);gems.push(p)}
  const CS=90,W=w*CS,H=hh*CS;let sw=null;
  /* الحركة: يستمر الأمير في اتجاهه حتى يضغط اتجاهاً آخر أو يصطدم بحاجز، والاتجاه المعاكس ينفّذ فوراً */
  const setDir=d=>{if(!d||!(d[0]||d[1]))return;const moving=P.x!==P.tx||P.y!==P.ty;
    if(moving&&d[0]===-P.dir[0]&&d[1]===-P.dir[1]){P.tx-=P.dir[0];P.ty-=P.dir[1];P.dir=d;P.nx=[0,0];return}P.nx=d};
  const A=arena(root,c,{W,H,tbar:1,pads:PADS4,hud:`<span class="pill kp">🗝️ ابحث عن المفتاح</span>${gems.length?'<span class="pill pw" hidden>💎 <b class="pwt">0</b></span>':''}<span class="pill lv2">${heartsPill(lives)}</span>`,
    onKey:k=>{if(DIRK[k])setDir(DIRK[k])},onDown:p=>{sw={x:p.x,y:p.y}},onUp:p=>{if(!sw)return;const dx=p.x-sw.x,dy=p.y-sw.y;if(Math.hypot(dx,dy)>20)setDir(Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)]);else{const tx=Math.floor(p.x/CS),ty=Math.floor(p.y/CS),ddx=tx-P.tx,ddy=ty-P.ty;if(Math.abs(ddx)+Math.abs(ddy)===1)setDir([ddx,ddy])}sw=null}});
  const res=()=>({got:hasKey?1:0,total:2,label:'المهام (المفتاح والقلعة)'});
  const tb=c.timeBar(root,secs,()=>A.lose('انتهى الوقت!',res()));
  const step=(o,sp,dt)=>{const dx=o.tx-o.x,dy=o.ty-o.y,d=Math.hypot(dx,dy);if(d<1e-3){o.x=o.tx;o.y=o.ty;return true}const s=Math.min(d,sp*dt);o.x+=dx/d*s;o.y+=dy/d*s;return false};
  function moveCastle(){let p,n=0;do{p={x:rnd(0,w-1),y:rnd(0,hh-1)};n++}while(n<200&&(Math.abs(p.x-P.tx)+Math.abs(p.y-P.ty)<3||(p.x===K.x&&p.y===K.y)));D.x=D.tx=p.x;D.y=D.ty=p.y;sfx.pop()}
  const castleSeen=t=>{if(diff<2)return true;const left=nextJump-t;return left>2||((2-left)%.4)<.2};
  A.loop(dt=>{const x=A.x,t=A.t;inv=Math.max(0,inv-dt);
    if(power>0){power=Math.max(0,power-dt);A.set('.pwt',Math.ceil(power));if(!power)A.q('.pw').hidden=true}
    if(step(P,4.2,dt)){const held=Object.entries(DIRK).find(([k])=>A.k(k));if(held&&(held[1][0]!==P.dir[0]||held[1][1]!==P.dir[1]))P.nx=held[1];
      if((P.nx[0]||P.nx[1])&&open(P.tx,P.ty,P.nx[0],P.nx[1])){P.dir=P.nx;P.nx=[0,0]}
      if((P.dir[0]||P.dir[1])&&open(P.tx,P.ty,P.dir[0],P.dir[1])){P.tx+=P.dir[0];P.ty+=P.dir[1]}}
    for(let i=gems.length-1;i>=0;i--){const g=gems[i];if(Math.hypot(P.x-g.x,P.y-g.y)<.4){gems.splice(i,1);power=POWER;A.q('.pw').hidden=false;fxPt(A,(g.x+.5)*CS,(g.y+.5)*CS);sfx.good()}}
    if(!hasKey&&Math.hypot(P.x-K.x,P.y-K.y)<.4){hasKey=true;A.set('.kp','🗝️ معك المفتاح! اذهب للقلعة');fxPt(A,(K.x+.5)*CS,(K.y+.5)*CS);sfx.good()}
    /* المستوى المتوسط: القلعة تتحرك أفقياً وعمودياً. الصعب: تقفز لمكان جديد كل 20 ثانية بعد 5 ومضات */
    if(diff===1&&step(D,.7,dt)){const op=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>open(D.tx,D.ty,d[0],d[1])&&!(D.tx+d[0]===K.x&&D.ty+d[1]===K.y));let o2=op.filter(d=>!(d[0]===-D.d[0]&&d[1]===-D.d[1]));if(!o2.length)o2=op;if(o2.length){const d=o2[rnd(0,o2.length-1)];D.d=d;D.tx+=d[0];D.ty+=d[1]}}
    if(diff===2&&t>=nextJump){moveCastle();nextJump=t+20}
    if(hasKey&&Math.hypot(P.x-D.x,P.y-D.y)<.45)return A.win(200+Math.round(tb.left())*4+lives*50,'دخلت القلعة بأمان! 🏰',{got:2,total:2,perfect:true,label:'المهام (المفتاح والقلعة)'});
    ghosts.forEach(g=>{if(step(g,gSp,dt)){const op=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>open(g.tx,g.ty,d[0],d[1]));let o2=op.filter(d=>!(d[0]===-g.d[0]&&d[1]===-g.d[1]));if(!o2.length)o2=op;
        if(Math.random()<c.f(.15,.6))o2.sort((a,b)=>Math.hypot(g.tx+a[0]-P.tx,g.ty+a[1]-P.ty)-Math.hypot(g.tx+b[0]-P.tx,g.ty+b[1]-P.ty));const d=Math.random()<c.f(.15,.6)?o2[0]:o2[rnd(0,o2.length-1)];g.d=d;g.tx+=d[0];g.ty+=d[1]}
      if(!inv&&!power&&Math.hypot(g.x-P.x,g.y-P.y)<.55){lives--;inv=1.8;A.set('.lv2',heartsPill(lives));sfx.bad();if(lives<=0)A.lose('أمسكك الشبح! 👻',res())}});
    /* الأرضية */
    for(let j=0;j<hh;j++)for(let i=0;i<w;i++){x.fillStyle=(i+j)%2?FL[1]:FL[0];x.fillRect(i*CS,j*CS,CS,CS)}
    /* الجدران: خطوط متصلة بأطراف مدوّرة */
    x.lineCap='round';x.lineJoin='round';x.beginPath();
    for(let j=0;j<hh;j++)for(let i=0;i<w;i++){if(i<w-1&&!open(i,j,1,0)){x.moveTo((i+1)*CS,j*CS);x.lineTo((i+1)*CS,(j+1)*CS)}if(j<hh-1&&!open(i,j,0,1)){x.moveTo(i*CS,(j+1)*CS);x.lineTo((i+1)*CS,(j+1)*CS)}}
    x.rect(0,0,W,H);x.strokeStyle='rgba(30,27,75,.22)';x.lineWidth=18;x.save();x.translate(0,3);x.stroke();x.restore();
    x.strokeStyle='#6d5bd0';x.lineWidth=14;x.stroke();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=4;x.save();x.translate(-1.5,-2);x.stroke();x.restore();
    /* القلعة والمفتاح والجواهر */
    if(castleSeen(t))emo(x,'🏰',(D.x+.5)*CS,(D.y+.5)*CS,CS*.75);
    if(!hasKey){x.globalAlpha=.5+Math.sin(t*6)*.3;x.fillStyle='#fde047';x.beginPath();x.arc((K.x+.5)*CS,(K.y+.5)*CS,CS*.38,0,7);x.fill();x.globalAlpha=1;emo(x,'🗝️',(K.x+.5)*CS,(K.y+.5)*CS,CS*.55)}
    gems.forEach(g=>{x.globalAlpha=.45+Math.sin(t*5+g.x)*.25;x.fillStyle='#a5f3fc';x.beginPath();x.arc((g.x+.5)*CS,(g.y+.5)*CS,CS*.32,0,7);x.fill();x.globalAlpha=1;emo(x,'💎',(g.x+.5)*CS,(g.y+.5)*CS+Math.sin(t*3+g.y)*3,CS*.45)});
    const ghostA=power?(power<1.5&&Math.sin(t*25)>0?.75:.28):1;
    ghosts.forEach(g=>{x.globalAlpha=ghostA;emo(x,'👻',(g.x+.5)*CS,(g.y+.5)*CS+Math.sin(t*4+g.tx)*4,CS*.6);x.globalAlpha=1});
    x.globalAlpha=inv&&Math.sin(t*30)>0?.35:1;emo(x,'🤴',(P.x+.5)*CS,(P.y+.5)*CS,CS*.65);x.globalAlpha=1;
    hintTxt(A,x,gems.length?'خذ المفتاح 🗝️ ثم ادخل القلعة 🏰 · الجوهرة 💎 تجعل الأشباح شفافة':'خذ المفتاح 🗝️ ثم ادخل القلعة 🏰 وتجنّب الأشباح')});
};
