/* لعبة: G.devil (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 15) المستوى المخادع — مستوحاة من Level Devil */
G.devil=(root,c)=>{
  const two=twoOn(),W=1000,H=560,FY=470,PW=26,PH=36,G_=1700,SP=270,JV=640;let lives=c.lv<10?6:c.lv<20?5:4;const L0=lives;let deaths=0;
  const nT=c.fi(1,5),gaps=c.lv>=8?(c.lv>=18?2:1):0,idx=shuffle([3,4,5,6,7,8]);const statics=idx.slice(0,gaps),pool=['drop','spike','block','saw',...(c.lv>=5?['door']:[]),'drop','spike','block'];
  const traps=[];idx.slice(gaps,gaps+nT).forEach(i=>{let k=pool[rnd(0,pool.length-1)];if(k==='door'&&traps.some(t=>t.k==='door'))k='spike';traps.push({k,i})});
  const pads=isTouch()?(two?[{k:'KeyA',l:'⬅️',side:'l'},{k:'KeyD',l:'➡️',side:'l'},{k:'KeyW',l:'⬆️',side:'l'},{k:'ArrowLeft',l:'⬅️',side:'r'},{k:'ArrowRight',l:'➡️',side:'r'},{k:'ArrowUp',l:'⬆️',side:'r'}]
    :[{k:'ArrowLeft',l:'⬅️',side:'l',big:1},{k:'ArrowRight',l:'➡️',side:'l',big:1},{k:'ArrowUp',l:'⬆️',side:'r',big:1}]):null;
  const A=arena(root,c,{W,H,hud:`${two?'':`<span class="pill lv2">${'❤️'.repeat(lives)}</span>`}<span class="pill">💀 <b class="dd">0</b></span>${twoBtn('👤 لاعب واحد')}`,pads});bindTwo(root,c);
  let S;function build(){S={tiles:Array.from({length:10},(_,i)=>({i,x:i*100,y:FY,vy:0,gone:statics.includes(i),fall:false,spike:0})),blocks:[],saws:[],door:{x:910,y:FY-64,moved:false},armed:traps.map(t=>({...t,done:false}))}}
  build();const mkP=(e,col,K)=>({x:30,y:FY-PH,vx:0,vy:0,on:false,dead:0,e,col,K});
  const ps=two?[mkP('🙂','#2563eb',{l:'KeyA',r:'KeyD',u:['KeyW']}),mkP('😃','#ea580c',{l:'ArrowLeft',r:'ArrowRight',u:['ArrowUp']})]:[mkP('🙂','#2563eb',{l:['ArrowLeft','KeyA'],r:['ArrowRight','KeyD'],u:['ArrowUp','KeyW','Space']})];
  const ov=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  function trig(p){for(const t of S.armed){if(t.done)continue;const tl=S.tiles[t.i],cx=p.x+PW/2;
      if(t.k==='drop'&&cx>tl.x-28&&cx<tl.x+40){t.done=true;tl.fall=true}
      if(t.k==='spike'&&cx>tl.x-55&&cx<tl.x+100){t.done=true;tl.spike=.001}
      if(t.k==='block'&&cx>tl.x-30&&cx<tl.x+70){t.done=true;S.blocks.push({x:tl.x+20,y:-70,w:60,h:60,vy:0,land:false})}
      if(t.k==='saw'&&cx>tl.x-20){t.done=true;S.saws.push({x:W+30,y:FY-22,r:22,vx:-c.f(220,380)})}
      if(t.k==='door'&&p.x>S.door.x-170){t.done=true;S.door.moved=true;S.door.tx=[60,400,560][rnd(0,2)]}}}
  function die(p){if(p.dead)return;p.dead=.7;deaths++;A.set('.dd',deaths);sfx.bad();if(two)return;lives--;A.set('.lv2',lives?'❤️'.repeat(lives):'💔');if(!lives){A.alive&&c.after(()=>A.lose('نفدت المحاولات! تذكّر أماكن الفخاخ',{got:0,total:L0,label:'القلوب المتبقية'}),600)}}
  function respawn(p){p.dead=0;p.x=30;p.y=FY-PH;p.vx=p.vy=0;if(!two)build()}
  A.loop(dt=>{const x=A.x;
    for(const tl of S.tiles){if(tl.fall){tl.vy+=G_*dt;tl.y+=tl.vy*dt}if(tl.spike&&tl.spike<1)tl.spike=Math.min(1,tl.spike+dt*7)}
    for(const b of S.blocks)if(!b.land){b.vy+=G_*1.3*dt;b.y+=b.vy*dt;const tl=S.tiles[Math.floor((b.x+30)/100)];if(tl&&!tl.gone&&!tl.fall&&b.y+b.h>=tl.y){b.y=tl.y-b.h;b.land=true;beep(90,.15,'square',.08)}}
    S.saws.forEach(s=>s.x+=s.vx*dt);S.saws=S.saws.filter(s=>s.x>-60);
    if(S.door.moved&&S.door.tx!==undefined){S.door.x+=(S.door.tx-S.door.x)*Math.min(1,dt*9)}
    for(const p of ps){if(p.dead){p.dead-=dt;if(p.dead<=0&&(two||lives>0))respawn(p);continue}const K=p.K,k=a=>Array.isArray(a)?A.k(...a):A.k(a);
      p.vx=((k(K.r)?1:0)-(k(K.l)?1:0))*SP;if(p.on&&K.u.some(q=>A.k(q))){p.vy=-JV;p.on=false;beep(600,.05,'triangle',.06)}
      p.vy+=G_*dt;p.x=clamp(p.x+p.vx*dt,0,W-PW);
      for(const b of S.blocks)if(b.land&&ov({x:p.x,y:p.y,w:PW,h:PH},b)){p.x=p.vx>0?b.x-PW:b.x+b.w}
      const ny=p.y+p.vy*dt;p.on=false;
      if(p.vy>=0){for(const tl of S.tiles){if(tl.gone||tl.fall)continue;if(p.x+PW>tl.x+2&&p.x<tl.x+98&&p.y+PH<=tl.y+1&&ny+PH>=tl.y){p.y=tl.y-PH;p.vy=0;p.on=true}}
        for(const b of S.blocks)if(b.land&&p.x+PW>b.x&&p.x<b.x+b.w&&p.y+PH<=b.y+1&&ny+PH>=b.y){p.y=b.y-PH;p.vy=0;p.on=true}}
      if(!p.on)p.y=ny;trig(p);const me={x:p.x,y:p.y,w:PW,h:PH};
      if(p.y>H+40)die(p);for(const tl of S.tiles)if(tl.spike>.6&&!tl.gone&&p.on&&p.x+PW>tl.x+6&&p.x<tl.x+94&&Math.abs(p.y+PH-tl.y)<3)die(p);
      for(const b of S.blocks)if(!b.land&&ov(me,b))die(p);for(const s of S.saws)if(Math.hypot(p.x+PW/2-s.x,p.y+PH/2-s.y)<s.r+12)die(p);
      if(!p.dead&&ov(me,{x:S.door.x,y:S.door.y,w:44,h:64})){const i=ps.indexOf(p);sfx.win();
        return A.win(two?100:lives*25+50,two?`فاز ${i?'😃 اللاعب الثاني':'🙂 اللاعب الأول'}! 🚪`:'وصلت إلى الباب! 🚪',two?{got:1,total:1,perfect:true,label:'الوصول للباب'}:{got:lives,total:L0,perfect:true,label:'القلوب المتبقية'})}}
    x.fillStyle='#fde4c3';x.fillRect(0,0,W,H);x.fillStyle='#f6c992';x.fillRect(0,0,W,40);
    for(const tl of S.tiles){if(tl.gone||tl.y>H)continue;x.fillStyle='#7c2d12';x.fillRect(tl.x,tl.y,100,H-FY+10);x.fillStyle='#9a3412';x.fillRect(tl.x,tl.y,100,10);
      if(tl.spike){x.fillStyle='#1f2937';for(let k=0;k<5;k++){x.beginPath();x.moveTo(tl.x+k*20,tl.y);x.lineTo(tl.x+k*20+10,tl.y-22*tl.spike);x.lineTo(tl.x+k*20+20,tl.y);x.fill()}}}
    S.blocks.forEach(b=>{x.fillStyle='#44403c';x.fillRect(b.x,b.y,b.w,b.h);x.fillStyle='#57534e';x.fillRect(b.x+6,b.y+6,b.w-12,b.h-12)});
    S.saws.forEach(s=>{x.save();x.translate(s.x,s.y);x.rotate(A.t*-12);x.fillStyle='#374151';for(let k=0;k<8;k++){x.rotate(Math.PI/4);x.beginPath();x.moveTo(0,-s.r-6);x.lineTo(6,-s.r+4);x.lineTo(-6,-s.r+4);x.fill()}x.beginPath();x.arc(0,0,s.r,0,7);x.fill();x.restore()});
    const d=S.door;x.fillStyle='#1d2350';x.beginPath();x.roundRect(d.x,d.y,44,64,[22,22,0,0]);x.fill();x.fillStyle='#facc15';x.beginPath();x.arc(d.x+34,d.y+36,4,0,7);x.fill();
    for(const p of ps){if(p.dead){emo(x,'💥',p.x+PW/2,p.y+PH/2,50);continue}x.fillStyle=p.col;x.beginPath();x.roundRect(p.x,p.y,PW,PH,6);x.fill();emo(x,p.e,p.x+PW/2,p.y+12,22)}
    hintTxt(A,x,two?'👥 الأول: A D و W للقفز · الثاني: الأسهم':'وصّل المكعب للباب 🚪 · احذر… المستوى يخدعك!')});
};
