/* لعبة: G.worms (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 9) الدودة الجائعة io — مستوحاة من Snake vs Worms */
G.worms=(root,c)=>{
  const RAD=1100,goal=c.fi(25,85),nAI=c.fi(3,10),aiS=c.f(105,165),secs=Math.round(c.f(85,95)),COLS=['#f472b6','#facc15','#fb923c','#a78bfa','#2dd4bf','#f87171','#4ade80','#60a5fa','#e879f9','#fbbf24'];
  let food=[],worms=[],camX=0,camY=0,mode='k';
  const A=arena(root,c,{W:1000,H:620,flex:[.5,1.9],tbar:1,hud:`<span class="pill">🐛 <b class="ln">10</b> من ${goal}</span>`});
  const addFood=(x,y,v=1)=>food.push({x,y,v,col:`hsl(${rnd(0,360)} 90% 60%)`});
  const rp=()=>{const a=Math.random()*6.28,r=Math.sqrt(Math.random())*(RAD-80);return[Math.cos(a)*r,Math.sin(a)*r]};
  for(let i=0;i<280;i++)addFood(...rp());
  function mk(ai,len,col){let[x,y]=rp();if(!ai){x=0;y=0}else while(Math.hypot(x-(P?.pts[0].x||0),y-(P?.pts[0].y||0))<500)[x,y]=rp();
    const a=Math.random()*6.28,pts=[];for(let i=0;i<len;i++)pts.push({x:x-Math.cos(a)*i*7,y:y-Math.sin(a)*i*7});return{pts,len,a,ai,col,sp:ai?aiS*(.85+Math.random()*.3):165,th:0,ta:a}}
  let P=null;P=mk(false,10,'#3b82f6');worms.push(P);for(let i=0;i<nAI;i++)worms.push(mk(true,rnd(8,c.fi(12,48)),COLS[i]));
  const rad=w=>7+Math.min(9,w.len*.07);
  const res=()=>({got:Math.min(goal,Math.floor(P.len)),total:goal,label:'طول الدودة'});
  const tb=c.timeBar(root,secs,()=>{P.len>=goal*.5?A.win(P.len,'انتهى الوقت',res()):A.lose('انتهى الوقت',res())});
  c.on(A.cv,'pointermove',e=>{mode='p'});
  function kill(w){for(let i=0;i<w.pts.length;i+=2)addFood(w.pts[i].x+rnd(-6,6),w.pts[i].y+rnd(-6,6),2);w.dead=1;if(w===P){sfx.bad();return A.lose('اصطدمت بدودة أخرى!',res())}
    beep(900,.08,'triangle',.08);c.after(()=>{const n=mk(true,rnd(8,c.fi(12,40)),w.col);Object.assign(w,n,{dead:0})},3000)}
  function think(w){const hd=w.pts[0],r=rad(w);let ta=w.ta;let best=null,bd=1e9;for(const f of food){const d=(f.x-hd.x)**2+(f.y-hd.y)**2;if(d<bd){bd=d;best=f}}if(best)ta=Math.atan2(best.y-hd.y,best.x-hd.x);
    const ph=P.pts[0];if(c.lv>=12&&!P.dead&&w.len>P.len&&Math.hypot(ph.x-hd.x,ph.y-hd.y)<300)ta=Math.atan2(ph.y+Math.sin(P.a)*90-hd.y,ph.x+Math.cos(P.a)*90-hd.x);
    const ax=hd.x+Math.cos(w.a)*70,ay=hd.y+Math.sin(w.a)*70;let danger=Math.hypot(ax,ay)>RAD-40;
    if(!danger)for(const o of worms){if(o===w||o.dead)continue;for(let i=0;i<o.pts.length;i+=2){const q=o.pts[i];if(Math.abs(q.x-ax)<34&&Math.abs(q.y-ay)<34){danger=true;break}}if(danger)break}
    if(danger&&Math.random()<c.f(.6,.97))ta=w.a+(Math.random()<.5?1.6:-1.6);w.ta=ta}
  A.loop(dt=>{const x=A.x,W=A.W,H=A.H;
    const[dx]=dirOf(A);if(dx){mode='k';P.a+=dx*3.4*dt}else if(mode==='p'||A.ptr.down)P.ta=Math.atan2(A.ptr.y-H/2,A.ptr.x-W/2);
    for(const w of worms){if(w.dead)continue;if(w.ai){w.th-=dt;if(w.th<=0){w.th=.18;think(w)}}if(w.ai||mode!=='k'){const d=angDiff(w.a,w.ta);w.a+=clamp(d,-3.6*dt,3.6*dt)}
      const hd=w.pts[0],nh={x:hd.x+Math.cos(w.a)*w.sp*dt,y:hd.y+Math.sin(w.a)*w.sp*dt};
      if(Math.hypot(nh.x-w.pts[1].x,nh.y-w.pts[1].y)>=7){w.pts.unshift(nh)}else w.pts[0]=nh;while(w.pts.length>Math.floor(w.len))w.pts.pop();
      if(Math.hypot(nh.x,nh.y)>RAD-rad(w)){if(w===P)return kill(w);w.a+=Math.PI;w.ta=w.a}
      const r=rad(w);food=food.filter(f=>{if(Math.abs(f.x-nh.x)<r+8&&Math.abs(f.y-nh.y)<r+8){w.len+=f.v*.5;if(w===P)beep(1100,.03,'triangle',.05);return false}return true})}
    while(food.length<260)addFood(...rp());
    for(const w of worms){if(w.dead)continue;const hd=w.pts[0],r=rad(w);for(const o of worms){if(o===w||o.dead)continue;const ro=rad(o);let hit=false;for(let i=1;i<o.pts.length;i++){const q=o.pts[i];if(Math.abs(q.x-hd.x)<r*.6+ro&&Math.abs(q.y-hd.y)<r*.6+ro&&Math.hypot(q.x-hd.x,q.y-hd.y)<r*.6+ro){hit=true;break}}if(hit){kill(w);break}}if(!A.alive)return}
    A.set('.ln',Math.floor(P.len));if(P.len>=goal)return A.win(P.len+Math.round(tb.left())*2,'دودتك صارت عملاقة! 🐛',{...res(),perfect:true});
    camX=P.pts[0].x-W/2;camY=P.pts[0].y-H/2;x.fillStyle='#1e1b4b';x.fillRect(0,0,W,H);x.save();x.translate(-camX,-camY);
    x.fillStyle='#312e81';x.beginPath();x.arc(0,0,RAD,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.06)';x.lineWidth=2;
    for(let g=Math.floor(camX/60)*60;g<camX+W;g+=60){x.beginPath();x.moveTo(g,camY);x.lineTo(g,camY+H);x.stroke()}for(let g=Math.floor(camY/60)*60;g<camY+H;g+=60){x.beginPath();x.moveTo(camX,g);x.lineTo(camX+W,g);x.stroke()}
    x.strokeStyle='#ef4444';x.lineWidth=10;x.beginPath();x.arc(0,0,RAD,0,7);x.stroke();
    food.forEach(f=>{if(f.x<camX-10||f.x>camX+W+10||f.y<camY-10||f.y>camY+H+10)return;x.fillStyle=f.col;x.beginPath();x.arc(f.x,f.y,f.v>1?7:5,0,7);x.fill()});
    for(const w of worms){if(w.dead)continue;const r=rad(w);for(let i=w.pts.length-1;i>=0;i--){const q=w.pts[i];if(q.x<camX-30||q.x>camX+W+30||q.y<camY-30||q.y>camY+H+30)continue;x.fillStyle=i%4<2?w.col:'#fff';x.globalAlpha=i%4<2?1:.85;x.beginPath();x.arc(q.x,q.y,r,0,7);x.fill()}x.globalAlpha=1;
      const hd=w.pts[0];x.fillStyle=w.col;x.beginPath();x.arc(hd.x,hd.y,r*1.1,0,7);x.fill();for(const s of[-1,1]){const ex=hd.x+Math.cos(w.a+s*.6)*r*.6,ey=hd.y+Math.sin(w.a+s*.6)*r*.6;x.fillStyle='#fff';x.beginPath();x.arc(ex,ey,r*.38,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(ex+Math.cos(w.a)*2,ey+Math.sin(w.a)*2,r*.18,0,7);x.fill()}}
    x.restore();hintTxt(A,x,'حرّك الفأرة أو إصبعك لتوجّه الدودة · لا تصطدم بالديدان الأخرى')});
};
