/* لعبة: G.racer (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 2) سباق الطريق السريع — مستوحاة من MR RACER */
G.racer=(root,c)=>{
  const W=480,H=800,goal=c.fi(500,2600),base=c.f(330,640),gapMs=c.f(1.15,.5),two=c.lv>=12?c.f(0,.45):0;let lives=c.lv<10?3:c.lv<20?2:1;const L0=lives;
  const A=arena(root,c,{W,H,hud:`<span class="pill">🏁 <b class="m">0</b> من ${goal} م</span><span class="pill lv2">${'❤️'.repeat(lives)}</span><span class="pill">🪙 <b class="co">0</b></span>`,
    pads:[{k:'ArrowLeft',l:'⬅️',side:'l',big:1},{k:'ArrowRight',l:'➡️',side:'r',big:1}]});
  const P={x:240,y:690,a:-Math.PI/2,v:0};let dist=0,coins=0,cars=[],items=[],inv=0,spawnT=0,scroll=0,shake=0;const lanes=[90,190,290,390],cols=['#f59e0b','#10b981','#a855f7','#ef4444','#0ea5e9','#f472b6'];
  function spawn(){const n=Math.random()<two?2:1,ls=shuffle([0,1,2,3]).slice(0,n);ls.forEach(l=>cars.push({x:lanes[l],y:-80,a:-Math.PI/2,sp:rnd(120,230),col:cols[rnd(0,5)]}));
    const free=[0,1,2,3].filter(l=>!ls.includes(l));if(Math.random()<.6){const l=free[rnd(0,free.length-1)];for(let k=0;k<3;k++)items.push({x:lanes[l],y:-80-k*70})}}
  A.loop(dt=>{const sp=base*(1+Math.min(.35,dist/goal*.35)),x=A.x;
    let vx=0;if(A.ptr.down)vx=clamp((A.ptr.x-P.x)*8,-700,700);else vx=((A.k('ArrowRight','KeyD')?1:0)-(A.k('ArrowLeft','KeyA')?1:0))*560;
    P.x=clamp(P.x+vx*dt,70,410);P.a=-Math.PI/2+vx/5000;dist+=sp*dt/9;scroll=(scroll+sp*dt)%80;inv=Math.max(0,inv-dt);shake=Math.max(0,shake-dt);
    spawnT-=dt;if(spawnT<=0){spawn();spawnT=gapMs*(.8+Math.random()*.4)}
    cars.forEach(o=>o.y+=(sp-o.sp)*dt);cars=cars.filter(o=>o.y<H+100);items.forEach(o=>o.y+=sp*dt);items=items.filter(o=>o.y<H+60&&!o.got);
    for(const o of cars)if(!inv&&Math.abs(o.x-P.x)<44&&Math.abs(o.y-P.y)<74){lives--;inv=1.6;shake=.35;sfx.bad();A.set('.lv2',lives?'❤️'.repeat(lives):'💔');o.y=H+200;
      if(!lives)return A.lose('اصطدمت بالسيارات!',{got:Math.floor(dist),total:goal,label:'المسافة (م)'})}
    for(const o of items)if(Math.abs(o.x-P.x)<46&&Math.abs(o.y-P.y)<56){o.got=1;coins++;A.set('.co',coins);beep(1200,.05,'triangle',.08)}
    A.set('.m',Math.min(goal,Math.floor(dist)));
    if(dist>=goal)return A.win(goal/10+coins*5+lives*20,`وصلت لخط النهاية! 🏁 وجمعت ${coins} عملة`,{got:goal,total:goal,perfect:true,label:'المسافة (م)'});
    x.save();if(shake)x.translate(rnd(-6,6),0);x.fillStyle='#5dbb63';x.fillRect(-10,0,W+20,H);x.fillStyle='#3f3f46';x.fillRect(40,0,400,H);x.fillStyle='#fff';x.fillRect(40,0,6,H);x.fillRect(434,0,6,H);
    for(let l=1;l<4;l++)for(let y=-80+scroll;y<H;y+=80)x.fillRect(40+l*100-3,y,6,40);
    for(let y=-80+scroll*1.2%80;y<H;y+=80){emo(x,'🌳',18,y,30);emo(x,'🌲',462,y+40,30)}
    items.forEach(o=>emo(x,'🪙',o.x,o.y,34));cars.forEach(o=>drawCar(x,o,o.col));if(!inv||(A.t*10|0)%2)drawCar(x,P,'#2563eb');
    if(goal-dist<300){const fy=P.y-(goal-dist)*9;for(let i=0;i<10;i++){x.fillStyle=i%2?'#111':'#fff';x.fillRect(40+i*40,fy,40,18)}}
    hintTxt(A,x,'⬅️ ➡️ أو اسحب لتتجنب السيارات');x.restore()});
};
