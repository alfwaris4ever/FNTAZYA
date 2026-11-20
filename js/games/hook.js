/* لعبة: G.hook (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 8) الحبل المتأرجح — مستوحاة من Stickman Hook */
G.hook=(root,c)=>{
  const W=1000,H=560,GR=1300,L=c.fi(2600,7200),gapH=c.f(230,390),secs=Math.round(L/c.f(170,265)+8),FL=515;
  const hooks=[];for(let X=380;X<L-60;X+=gapH*(.8+Math.random()*.4))hooks.push({x:X,y:rnd(70,c.lv<10?190:240)});
  /* أرض الشوك: أول 10% آمنة، ثم شوك متقطع حتى 80%، وآخر 20% قبل العلم كلها شوك */
  const spk=[];{let X=L*.1;while(X<L*.8-60){const len=c.f(150,330)*(.8+Math.random()*.5),e=Math.min(X+len,L*.8);spk.push([X,e]);X=e+c.f(260,120)*(.8+Math.random()*.5)}
    if(spk.length&&spk[spk.length-1][1]>L*.8-130)spk[spk.length-1][1]=L+60;else spk.push([L*.8,L+60]);}
  const onSpike=X=>spk.some(([a,b])=>X>a&&X<b);let dead=false;
  const p={x:100,y:260,ox:99,oy:262};let rope=null,acc=0,camX=0,trail=[];
  const A=arena(root,c,{W,H,tbar:1,hud:`<span class="pill">🏁 <b class="pr">0</b>%</span>`,onDown:()=>grab(),onUp:()=>rel(),onKey:k=>{if(k==='Space'||k==='ArrowUp'||k==='KeyW')grab()}});
  const res=()=>({got:Math.min(100,Math.floor(p.x/L*100)),total:100,label:'نسبة الطريق %'});
  const tb=c.timeBar(root,secs,()=>A.lose('انتهى الوقت',res()));
  function cand(){let best=null,bd=1e9;for(const k of hooks){const d=Math.hypot(k.x-p.x,k.y-p.y);if(k.x>p.x-60&&d<430){const s=d-(k.x-p.x)*.4;if(s<bd){bd=s;best=k}}}return best}
  function grab(){if(rope||!A.alive)return;const k=cand();if(!k)return;rope={k,len:Math.max(60,Math.hypot(k.x-p.x,k.y-p.y)*.95)};beep(700,.05,'triangle',.08)}
  function rel(){if(!rope)return;rope=null;const vx=p.x-p.ox,vy=p.y-p.oy;p.ox-=vx*.08;p.oy-=Math.max(0,-vy)*.06}
  function step(h){const vx=(p.x-p.ox)*.999,vy=(p.y-p.oy)*.999;p.ox=p.x;p.oy=p.y;p.x+=vx;p.y+=vy+GR*h*h;
    if(rope){const dx=p.x-rope.k.x,dy=p.y-rope.k.y,d=Math.hypot(dx,dy);if(d>rope.len){p.x=rope.k.x+dx/d*rope.len;p.y=rope.k.y+dy/d*rope.len}
      const tx=-dy/d,ty=dx/d,v=(p.x-p.ox)*tx+(p.y-p.oy)*ty,s=Math.sign(v)||1;if(Math.abs(v)<1000*h){p.x+=tx*s*420*h*h;p.y+=ty*s*420*h*h}}
    if(p.y>FL){if(onSpike(p.x)){dead=true;p.y=FL;return}const v=p.y-p.oy;p.y=FL;p.oy=FL+Math.max(Math.abs(v)*.8,700*h);p.ox=p.x-(p.x-p.ox)*.75;beep(300,.06,'sine',.08)}if(p.y<15){p.y=15;p.oy=Math.min(p.oy,15)}if(p.x<20){p.x=20;p.ox=Math.min(p.ox,20)}}
  A.loop(dt=>{const x=A.x;if(!A.ptr.down&&!A.k('Space','ArrowUp','KeyW')&&rope)rel();
    acc+=dt;while(acc>=1/120&&!dead){step(1/120);acc-=1/120}A.set('.pr',res().got);
    if(dead){sfx.bad();return A.lose('لمست الشوك! 🌵 تعلّق بالحلقات ولا تنزل على الأرض الشائكة',res())}
    if(p.x>=L)return A.win(100+Math.round(tb.left())*4,'وصلت لخط النهاية! 🏁',{got:100,total:100,perfect:true,label:'نسبة الطريق %'});
    camX+=(p.x-W*.35-camX)*Math.min(1,dt*5);trail.push([p.x,p.y]);if(trail.length>18)trail.shift();
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#a78bfa');g.addColorStop(1,'#fbcfe8');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='rgba(255,255,255,.5)';for(let i=-1;i<7;i++){const bx=i*200-(camX*.3%200);x.beginPath();x.arc(bx,120+(i%3)*40,30,0,7);x.arc(bx+30,110+(i%3)*40,36,0,7);x.fill()}
    x.save();x.translate(-camX,0);const cd=rope?null:cand();
    x.fillStyle='#22c55e';x.fillRect(camX-10,FL+12,W+20,H);x.fillStyle='#f472b6';for(let X=Math.floor(camX/60)*60;X<camX+W+60;X+=60)if(!onSpike(X+15))x.fillRect(X,FL+12,30,8);
    spk.forEach(([a,b])=>{if(b<camX-30||a>camX+W+30)return;x.fillStyle='#57534e';x.fillRect(a,FL+10,b-a,H);x.lineWidth=2;x.strokeStyle='#334155';
      for(let s=a;s<b-2;s+=24){const e=Math.min(s+24,b),m=(s+e)/2;const gg=x.createLinearGradient(0,FL-14,0,FL+12);gg.addColorStop(0,'#f1f5f9');gg.addColorStop(1,'#64748b');x.fillStyle=gg;
        x.beginPath();x.moveTo(s,FL+12);x.lineTo(m,FL-14);x.lineTo(e,FL+12);x.closePath();x.fill();x.stroke()}});
    hooks.forEach(k=>{if(k.x<camX-40||k.x>camX+W+40)return;x.lineWidth=7;x.strokeStyle=k===cd?'#facc15':k===rope?.k?'#22c55e':'#fff';x.beginPath();x.arc(k.x,k.y,15,0,7);x.stroke()});
    for(let k=0;k<8;k++){x.fillStyle=k%2?'#111':'#fff';x.fillRect(L,FL-160+k*20,16,20)}emo(x,'🏁',L+34,FL-170,50);
    x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=4;x.beginPath();trail.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();
    if(rope){x.strokeStyle='#1d2350';x.lineWidth=3;x.beginPath();x.moveTo(rope.k.x,rope.k.y);x.lineTo(p.x,p.y);x.stroke()}
    const an=Math.atan2(p.y-p.oy,p.x-p.ox);x.save();x.translate(p.x,p.y);x.rotate(an);x.strokeStyle='#1d2350';x.lineWidth=5;x.lineCap='round';
    x.beginPath();x.moveTo(-14,0);x.lineTo(10,0);x.moveTo(-14,0);x.lineTo(-28,-9);x.moveTo(-14,0);x.lineTo(-28,9);x.moveTo(4,0);x.lineTo(-4,-12);x.moveTo(4,0);x.lineTo(-4,12);x.stroke();
    x.fillStyle='#1d2350';x.beginPath();x.arc(19,0,9,0,7);x.fill();x.restore();x.restore();
    hintTxt(A,x,isTouch()?'المس مطوّلاً لتمسك الحلقة واتركها لتطير. الشوك يقتل! ⚠️':'اضغط مطوّلاً (المسافة أو الفأرة) لتمسك الحلقة واتركها لتطير. الشوك يقتل! ⚠️')});
};
