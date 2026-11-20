/* لعبة: G.headball (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 13) كرة الرؤوس — مستوحاة من Ragdoll Soccer و Football Legends */
G.headball=(root,c)=>{
  const two=twoOn(),W=1000,H=560,GY=500,BAR=330,GW=70,R=34,need=c.fi(2,5),aiS=c.f(170,330),react=c.f(.28,.05),secs=Math.round(c.f(80,95));let s1=0,s2=0,freeze=0,msg='';
  const pads=isTouch()?(two?[{k:'KeyA',l:'⬅️',side:'l'},{k:'KeyD',l:'➡️',side:'l'},{k:'KeyW',l:'⬆️',side:'l'},{k:'KeyS',l:'⚽',side:'l'},{k:'ArrowLeft',l:'⬅️',side:'r'},{k:'ArrowRight',l:'➡️',side:'r'},{k:'ArrowUp',l:'⬆️',side:'r'},{k:'ArrowDown',l:'⚽',side:'r'}]
    :[{k:'ArrowLeft',l:'⬅️',side:'l',big:1},{k:'ArrowRight',l:'➡️',side:'l',big:1},{k:'ArrowUp',l:'⬆️',side:'r',big:1},{k:'Space',l:'⚽',side:'r',big:1}]):null;
  const A=arena(root,c,{W,H,tbar:1,hud:`<span class="pill">😎 <b class="s1">0</b> : <b class="s2">0</b> ${two?'🤠':'🤖'}</span><span class="pill">🎯 ${need}</span>${twoBtn()}`,pads});bindTwo(root,c);
  const mk=(x,dir,e,col)=>({x,y:GY-R,vx:0,vy:0,dir,e,col,kick:0,on:true,th:0,ax:0});let P=mk(260,1,'😎','#2563eb'),Q=mk(740,-1,two?'🤠':'🤖','#dc2626');const B={x:500,y:200,vx:0,vy:0,r:20};
  const reset=()=>{P=mk(260,1,'😎','#2563eb');Q=mk(740,-1,two?'🤠':'🤖','#dc2626');Object.assign(B,{x:500,y:180,vx:rnd(-80,80),vy:0})};
  const res=()=>({got:two?Math.max(s1,s2):s1,total:need,label:two?'أهداف الفائز':'أهدافك'});
  c.timeBar(root,secs,()=>{if(two)return s1===s2?A.lose('تعادل! 🤝',res()):A.win(Math.max(s1,s2)*20,`فاز ${s1>s2?'😎 الأول':'🤠 الثاني'}!`,{...res(),perfect:true});s1>s2?A.win(s1*20,'انتهى الوقت وأنت متقدّم',res()):A.lose('انتهى الوقت',res())});
  function body(o,dt){o.vy+=1700*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.on=false;if(o.y>GY-R){o.y=GY-R;o.vy=0;o.on=true}o.x=clamp(o.x,GW+R,W-GW-R);o.kick=Math.max(0,o.kick-dt)}
  const jump=o=>{if(o.on){o.vy=-660;o.on=false}};const kick=o=>{if(o.kick<=0)o.kick=.22};
  function touch(o){const fx=o.x+o.dir*22,fy=o.y+R+2;for(const[cx,cy,rr,isF]of[[o.x,o.y,R,0],[fx,fy,15,1]]){const dx=B.x-cx,dy=B.y-cy,d=Math.hypot(dx,dy)||1;
      if(isF&&o.kick>0&&d<B.r+48){B.vx=o.dir*rnd(640,760);B.vy=-rnd(330,470);o.kick=0;beep(220,.07,'square',.08);continue}
      if(d<B.r+rr){const nx=dx/d,ny=dy/d;B.x=cx+nx*(B.r+rr);B.y=cy+ny*(B.r+rr);const rel=(B.vx-o.vx)*nx+(B.vy-o.vy)*ny;if(rel<0){B.vx-=1.7*rel*nx;B.vy-=1.7*rel*ny}B.vx+=o.vx*.35;B.vy+=Math.min(0,o.vy)*.4}}}
  function goal(left){left?s2++:s1++;A.set('.s1',s1);A.set('.s2',s2);msg=left?(two?'⚽ هدف للثاني!':'😮 هدف للخصم'):(two?'⚽ هدف للأول!':'⚽ هدف رائع!');!left||two?sfx.good():sfx.bad();freeze=1.3;
    if(s1>=need)return A.win(s1*20+20,two?'فاز 😎 اللاعب الأول!':`سجّلت ${need} أهداف! ⚽`,{...res(),perfect:true});
    if(s2>=need)return two?A.win(s2*20,'فاز 🤠 اللاعب الثاني!',{...res(),perfect:true}):A.lose('الخصم سجّل أهدافه أولاً',res())}
  function ball(dt){B.vy+=1000*dt;B.x+=B.vx*dt;B.y+=B.vy*dt;B.vx*=Math.pow(.8,dt);const sp=Math.hypot(B.vx,B.vy);if(sp>1100){B.vx*=1100/sp;B.vy*=1100/sp}
    if(B.y>GY-B.r){B.y=GY-B.r;B.vy=-Math.abs(B.vy)*.72;B.vx*=.97}if(B.y<B.r){B.y=B.r;B.vy=Math.abs(B.vy)}
    for(const[gx,s]of[[GW,1],[W-GW,-1]]){const inside=s>0?B.x<gx:B.x>gx;if(inside&&B.y<BAR&&B.y+B.r>BAR-6&&B.vy>0){B.y=BAR-6-B.r;B.vy=-Math.abs(B.vy)*.6}
      if(Math.abs(B.x-gx)<B.r&&B.y<BAR-6){B.vx=Math.abs(B.vx)*s*.8;B.x=gx+s*B.r}}
    if(B.x<B.r){B.x=B.r;B.vx=Math.abs(B.vx)*.5}if(B.x>W-B.r){B.x=W-B.r;B.vx=-Math.abs(B.vx)*.5}
    if(B.x<GW-B.r*.6&&B.y>BAR)goal(true);else if(B.x>W-GW+B.r*.6&&B.y>BAR)goal(false)}
  function ai(o,dt){o.th-=dt;if(o.th<=0){o.th=react;const behind=B.x>o.x-10;o.ax=behind?B.x+55:B.x+28;o.ax=clamp(o.ax,GW+R,W-GW-R)}
    const d=o.ax-o.x;o.vx=Math.abs(d)<8?0:Math.sign(d)*aiS;if(B.y<o.y-40&&Math.abs(B.x-o.x)<95&&Math.random()<c.f(.03,.12))jump(o);if(Math.abs(B.x-(o.x-22))<60&&B.y>o.y-10&&Math.random()<c.f(.05,.3))kick(o)}
  A.loop(dt=>{const x=A.x;if(freeze>0){freeze-=dt;if(freeze<=0)reset()}else{
      if(two){P.vx=((A.k('KeyD')?1:0)-(A.k('KeyA')?1:0))*330;if(A.k('KeyW'))jump(P);if(A.k('KeyS','Space'))kick(P);Q.vx=((A.k('ArrowRight')?1:0)-(A.k('ArrowLeft')?1:0))*330;if(A.k('ArrowUp'))jump(Q);if(A.k('ArrowDown','Slash'))kick(Q)}
      else{P.vx=((A.k('ArrowRight','KeyD')?1:0)-(A.k('ArrowLeft','KeyA')?1:0))*330;if(A.k('ArrowUp','KeyW'))jump(P);if(A.k('Space','ArrowDown','KeyS','KeyX'))kick(P);ai(Q,dt)}
      body(P,dt);body(Q,dt);touch(P);touch(Q);ball(dt)}
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#38bdf8');g.addColorStop(1,'#bae6fd');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='#64748b';x.fillRect(0,120,W,110);for(let i=0;i<60;i++){x.fillStyle=`hsl(${i*47%360} 70% 60%)`;x.beginPath();x.arc(10+i*17,140+(i%3)*26,8,0,7);x.fill()}
    x.fillStyle='#22c55e';x.fillRect(0,GY,W,H-GY);x.fillStyle='#16a34a';for(let i=0;i<W;i+=80)x.fillRect(i,GY,40,H-GY);
    for(const[gx,s]of[[0,1],[W,-1]]){x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=2;for(let k=0;k<GW;k+=12){x.beginPath();x.moveTo(gx+s*k,BAR);x.lineTo(gx+s*k,GY);x.stroke()}for(let k=BAR;k<GY;k+=14){x.beginPath();x.moveTo(gx,k);x.lineTo(gx+s*GW,k);x.stroke()}
      x.fillStyle='#fff';x.fillRect(s>0?0:W-GW,BAR-8,GW,8);x.fillRect(s>0?GW-6:W-GW,BAR-8,6,GY-BAR+8)}
    for(const o of[P,Q]){x.fillStyle=o.col;const fx=o.x+o.dir*(o.kick>0?34:16);x.beginPath();x.roundRect(fx-14,o.y+R-6,28,14,6);x.fill();x.beginPath();x.arc(o.x,o.y,R,0,7);x.fill();emo(x,o.e,o.x,o.y,R*1.75)}
    emo(x,'⚽',B.x,B.y,B.r*2.1,B.x/B.r);if(freeze>0)txt(x,msg,W/2,90,50);
    hintTxt(A,x,two?'👥 الأول: A D للحركة W قفز S ركل · الثاني: الأسهم و⬇️ ركل':'⬅️ ➡️ حركة · ⬆️ قفز · المسافة ركل')});
};
