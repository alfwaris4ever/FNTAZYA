/* لعبة: G.police (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 4) مطاردة الشرطة — مستوحاة من Blacktop Police Chase */
G.police=(root,c)=>{
  const W=1000,H=640,RD=100,need=c.fi(2,8),thV=c.f(140,300),secs=Math.round(c.f(70,85)),maxOn=c.lv<8?1:c.lv<18?2:3;let caught=0;
  const BW=(W-RD*5)/4,BH=(H-RD*4)/3,blocks=[],nx=[],ny=[];for(let i=0;i<5;i++)nx.push(RD/2+i*(BW+RD));for(let j=0;j<4;j++)ny.push(RD/2+j*(BH+RD));
  const BE=['🏢','🏠','🏬','🏫','🏥','🏪','🌳','🏦','⛲','🏡','🏨','🌲'];
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)blocks.push({x:RD+i*(BW+RD),y:RD+j*(BH+RD),w:BW,h:BH,e:BE[rnd(0,BE.length-1)]});
  const A=arena(root,c,{W,H,tbar:1,hud:`<span class="pill">🚓 <b class="cg">0</b> من ${need}</span><span class="pill">💰 امسك اللصوص</span>`});
  const P={x:nx[2],y:ny[3],a:-Math.PI/2,v:0};let thieves=[],spawned=0;
  function spawn(){const far=[];for(let i=0;i<5;i++)for(let j=0;j<4;j++)if(Math.hypot(nx[i]-P.x,ny[j]-P.y)>380)far.push([i,j]);const[i,j]=far[rnd(0,far.length-1)];
    thieves.push({i,j,ti:i,tj:j,x:nx[i],y:ny[j],a:0,v:thV,t:1});spawned++}
  function nextNode(o){const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[o.i+a,o.j+b]).filter(([a,b])=>a>=0&&a<5&&b>=0&&b<4);
    const sc=opts.map(([a,b])=>Math.hypot(nx[a]-P.x,ny[b]-P.y)+Math.random()*c.f(380,90));const k=sc.indexOf(Math.max(...sc));[o.ti,o.tj]=opts[k]}
  function moveT(o,dt){const tx=nx[o.ti],ty=ny[o.tj],d=Math.hypot(tx-o.x,ty-o.y);if(d<4){o.i=o.ti;o.j=o.tj;nextNode(o);return}
    const s=Math.min(d,o.v*dt);o.x+=(tx-o.x)/d*s;o.y+=(ty-o.y)/d*s;o.a=Math.atan2(ty-o.y,tx-o.x)}
  function blockHit(o){for(const b of blocks){const px=clamp(o.x,b.x,b.x+b.w),py=clamp(o.y,b.y,b.y+b.h),dx=o.x-px,dy=o.y-py,d=Math.hypot(dx,dy);
      if(d<20){if(d===0){o.y=b.y-20;continue}o.x=px+dx/d*20;o.y=py+dy/d*20;o.v*=.55}}o.x=clamp(o.x,20,W-20);o.y=clamp(o.y,20,H-20)}
  const res=()=>({got:caught,total:need,label:'اللصوص'});
  const tb=c.timeBar(root,secs,()=>{caught?A.win(caught*15,'انتهى الوقت',res()):A.lose('هرب اللصوص!',res())});
  A.loop(dt=>{const x=A.x;while(thieves.length<maxOn&&spawned<need)spawn();
    const[t,s]=playerCar(A,P);carMove(P,dt,t,s,330);blockHit(P);thieves.forEach(o=>moveT(o,dt));
    for(const o of thieves)if(!o.c&&Math.hypot(o.x-P.x,o.y-P.y)<44){o.c=1;caught++;A.set('.cg',caught);sfx.good();
      if(caught>=need)return A.win(caught*15+Math.round(tb.left())*3,'أمسكت كل اللصوص! 🚓',{...res(),perfect:true})}
    thieves=thieves.filter(o=>!o.c);
    x.fillStyle='#4b5563';x.fillRect(0,0,W,H);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=3;x.setLineDash([22,18]);
    nx.forEach(v=>{x.beginPath();x.moveTo(v,0);x.lineTo(v,H);x.stroke()});ny.forEach(v=>{x.beginPath();x.moveTo(0,v);x.lineTo(W,v);x.stroke()});x.setLineDash([]);
    blocks.forEach(b=>{x.fillStyle='#d6d3d1';x.beginPath();x.roundRect(b.x-6,b.y-6,b.w+12,b.h+12,10);x.fill();x.fillStyle='#86c46d';x.beginPath();x.roundRect(b.x,b.y,b.w,b.h,8);x.fill();emo(x,b.e,b.x+b.w/2,b.y+b.h/2,Math.min(b.h,b.w)*.7)});
    thieves.forEach(o=>drawCar(x,o,'#111827','thief'));drawCar(x,P,'#f8fafc','police');hintTxt(A,x,'👆 اسحب نحو اللص أو استخدم الأسهم')});
};
