/* لعبة: G.pacman (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- باكمان ---- */
G.pacman=(root,c)=>{
  const MAP=['#####################','#o........#........o#','#.##.###.#.#.###.##.#','#...................#','#.##.#.#######.#.##.#','#....#....#....#....#','####.### #G# ###.####','#...... GGGGG ......#','####.#.#######.#.####','#.........#.........#','#.##.###.#.#.###.##.#','#o.#......P......#.o#','#.##.#.#######.#.##.#','#....#....#....#....#','#####################'];
  const TS=40,CW=21,RH=15,W=CW*TS,H=RH*TS,wall=(i,j)=>{const r=MAP[j];return !r||r[i]===undefined||r[i]==='#'};
  const dots=new Set(),power=new Set();MAP.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='.'||ch==='o')dots.add(i+','+j);if(ch==='o')power.add(i+','+j)}));
  const total=dots.size,gN=Math.min(4,1+Math.floor(c.lv/7)),pSp=c.f(5,6.6),gSp=c.f(2.6,6.1),smart=c.f(.3,.92),frT=c.f(9,3.5);
  let eaten=0,score=0,lives=c.lv<10?3:c.lv<20?2:1,ready=1.4,waka=0,sw=null;
  const P={x:10,y:11,d:[0,0],nx:[0,0]};const GS=[[10,7],[9,7],[11,7],[10,6]],GC=['#ef4444','#f472b6','#22d3ee','#fb923c'];
  const ghosts=[...Array(gN)].map((_,k)=>({x:GS[k][0],y:GS[k][1],d:[0,-1],col:GC[k],hx:GS[k][0],hy:GS[k][1],delay:1+k*2.2,fr:false,dead:false}));
  const A=arena(root,c,{W,H,pads:PADS4,hud:`<span class="pill">🟡 <b class="dt">0</b> من ${total}</span><span class="pill lv2">${heartsPill(lives)}</span>`,
    onKey:k=>{if(DIRK[k])P.nx=DIRK[k]},onDown:p=>{sw={x:p.x,y:p.y}},onUp:p=>{if(!sw)return;const dx=p.x-sw.x,dy=p.y-sw.y;if(Math.hypot(dx,dy)>20)P.nx=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];sw=null}});
  const res=()=>({got:eaten,total,label:'النقاط'});
  function move(o,sp,dt,choose){let rem=sp*dt,guard=0;
    while(rem>1e-6&&guard++<6){const cx=Math.round(o.x),cy=Math.round(o.y);
      if(Math.abs(o.x-cx)<1e-4&&Math.abs(o.y-cy)<1e-4){o.x=cx;o.y=cy;choose(o,cx,cy);if(!o.d[0]&&!o.d[1])return;if(wall(cx+o.d[0],cy+o.d[1])){o.d=[0,0];return}}
      const tx=o.d[0]>0?Math.floor(o.x+1e-6)+1:o.d[0]<0?Math.ceil(o.x-1e-6)-1:o.x,ty=o.d[1]>0?Math.floor(o.y+1e-6)+1:o.d[1]<0?Math.ceil(o.y-1e-6)-1:o.y;
      const dist=Math.abs(tx-o.x)+Math.abs(ty-o.y);if(rem<dist){o.x+=o.d[0]*rem;o.y+=o.d[1]*rem;rem=0}else{o.x=tx;o.y=ty;rem-=dist}}}
  const pacChoose=(o,cx,cy)=>{if(!wall(cx+P.nx[0],cy+P.nx[1]))o.d=[...P.nx]};
  function ghostChoose(g,cx,cy){const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>!wall(cx+d[0],cy+d[1]));let o2=opts.filter(d=>!(d[0]===-g.d[0]&&d[1]===-g.d[1]));if(!o2.length)o2=opts;
    let tx=P.x,ty=P.y,mode=Math.random()<smart?'chase':'rand';if(g.dead){tx=g.hx;ty=g.hy;mode='chase'}else if(g.fr){mode=Math.random()<.85?'flee':'rand'}
    if(mode==='rand'){g.d=o2[rnd(0,o2.length-1)];return}
    o2.sort((a,b)=>{const da=Math.hypot(cx+a[0]-tx,cy+a[1]-ty),db=Math.hypot(cx+b[0]-tx,cy+b[1]-ty);return mode==='flee'?db-da:da-db});g.d=o2[0]}
  function resetPos(){P.x=10;P.y=11;P.d=[0,0];P.nx=[0,0];ghosts.forEach((g,k)=>{g.x=g.hx;g.y=g.hy;g.d=[0,-1];g.delay=1+k*1.5;g.fr=false;g.dead=false});ready=1.2}
  // رسم المتاهة مرة واحدة
  const mz=document.createElement('canvas');mz.width=W;mz.height=H;{const m=mz.getContext('2d');m.fillStyle='#070b24';m.fillRect(0,0,W,H);
    for(let j=0;j<RH;j++)for(let i=0;i<CW;i++)if(wall(i,j)){const g=m.createLinearGradient(i*TS,j*TS,i*TS,j*TS+TS);g.addColorStop(0,'#3b5bfd');g.addColorStop(1,'#1e2fa8');m.fillStyle=g;m.beginPath();m.roundRect(i*TS+3,j*TS+3,TS-6,TS-6,9);m.fill();
      m.strokeStyle='rgba(147,197,253,.65)';m.lineWidth=2;m.stroke()}}
  let ft=0;
  A.loop(dt=>{const x=A.x;ft+=dt;
    if(ready>0)ready-=dt;else{
      if(P.nx[0]===-P.d[0]&&P.nx[1]===-P.d[1]&&(P.nx[0]||P.nx[1]))P.d=[...P.nx];
      move(P,pSp,dt,pacChoose);
      const key=Math.round(P.x)+','+Math.round(P.y);if(dots.has(key)&&Math.hypot(P.x-Math.round(P.x),P.y-Math.round(P.y))<.35){dots.delete(key);eaten++;score+=10;A.set('.dt',eaten);waka^=1;beep(waka?520:390,.05,'square',.05);
        if(power.has(key)){score+=40;ghosts.forEach(g=>{if(!g.dead)g.fr=true});ft=0;fxPt(A,(Math.round(P.x)+.5)*TS,(Math.round(P.y)+.5)*TS);sfx.good()}
        if(!dots.size)return A.win(score+lives*100,'أكلت كل النقاط! 🟡',{got:total,total,perfect:true,label:'النقاط'})}
      if(ghosts.some(g=>g.fr)&&ft>frT)ghosts.forEach(g=>g.fr=false);
      for(const g of ghosts){if(g.delay>0){g.delay-=dt;continue}move(g,g.dead?9:g.fr?gSp*.55:gSp,dt,ghostChoose);
        if(g.dead&&Math.abs(g.x-g.hx)<.1&&Math.abs(g.y-g.hy)<.1){g.dead=false;g.fr=false;g.delay=1}
        if(!g.dead&&Math.hypot(g.x-P.x,g.y-P.y)<.65){
          if(g.fr){g.dead=true;g.fr=false;score+=200;fxPt(A,(g.x+.5)*TS,(g.y+.5)*TS);sfx.good()}
          else{lives--;A.set('.lv2',heartsPill(lives));sfx.bad();if(lives<=0)return A.lose('أمسكك الشبح! 👻',res());resetPos();break}}}}
    x.drawImage(mz,0,0,W,H);
    const t=performance.now()/1000;
    for(const k of dots){const[i,j]=k.split(',').map(Number),cx=(i+.5)*TS,cy=(j+.5)*TS;
      if(power.has(k)){const r=9+Math.sin(t*6)*2.5,g=x.createRadialGradient(cx,cy,0,cx,cy,r*2);g.addColorStop(0,'#fff7c2');g.addColorStop(.5,'#fde047');g.addColorStop(1,'rgba(253,224,71,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r*2,0,7);x.fill()}
      else{x.fillStyle='#fde68a';x.beginPath();x.arc(cx,cy,4,0,7);x.fill()}}
    // باكمان
    const px=(P.x+.5)*TS,py=(P.y+.5)*TS,ang=P.d[0]||P.d[1]?Math.atan2(P.d[1],P.d[0]):0,mo=(Math.sin(t*16)+1)/2*.42+.04;
    const pg=x.createRadialGradient(px-6,py-8,2,px,py,18);pg.addColorStop(0,'#fff59d');pg.addColorStop(1,'#facc15');x.fillStyle=pg;x.shadowColor='rgba(250,204,21,.6)';x.shadowBlur=14;
    x.beginPath();x.moveTo(px,py);x.arc(px,py,17,ang+mo*Math.PI,ang-mo*Math.PI+Math.PI*2);x.closePath();x.fill();x.shadowBlur=0;
    // الأشباح
    for(const g of ghosts){const gx=(g.x+.5)*TS,gy=(g.y+.5)*TS;
      if(!g.dead){const blink=g.fr&&ft>frT-2&&Math.sin(t*20)>0;const col=g.fr?(blink?'#e0e7ff':'#2563eb'):g.col;const gg=x.createLinearGradient(gx,gy-17,gx,gy+17);gg.addColorStop(0,'#ffffff55');gg.addColorStop(.25,col);gg.addColorStop(1,col);
        x.fillStyle=gg;x.beginPath();x.arc(gx,gy-2,16,Math.PI,0);x.lineTo(gx+16,gy+15);for(let k=0;k<4;k++){const wx=gx+16-(k+.5)*8;x.lineTo(wx,gy+(k%2?15:10)+Math.sin(t*12+k)*2)}x.lineTo(gx-16,gy+15);x.closePath();x.fill()}
      if(!g.fr||g.dead){[-6,6].forEach(o=>{x.fillStyle='#fff';x.beginPath();x.ellipse(gx+o,gy-4,4.5,6,0,0,7);x.fill();x.fillStyle='#1e3a8a';x.beginPath();x.arc(gx+o+g.d[0]*2,gy-4+g.d[1]*2.5,2.5,0,7);x.fill()})}
      else{x.fillStyle='#fff';[-5,5].forEach(o=>{x.fillRect(gx+o-2,gy-6,4,4)})}}
    if(ready>0)txt(x,'استعد!',W/2,(7.5)*TS,44,'#facc15');
    hintTxt(A,x,'كُل كل النقاط وتجنّب الأشباح. الكرة الكبيرة تجعل الأشباح خائفة!')});
};
