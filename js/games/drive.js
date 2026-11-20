/* لعبة: G.drive (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 3+5) محرك القيادة الجانبية — القيادة المجنونة (Drive Mad) وتسلق التلال (Hill Climb Racing) */
G.drive=mode=>(root,c)=>{
  const hill=mode==='hill',W=1000,H=560,ST=10,GR=900,VM=hill?c.f(430,540):c.f(520,600),len=Math.round(c.f(hill?2600:2600,hill?7600:5800));
  const T=[],gapS=[];let y=380;const push=v=>T.push(v);
  const flat=n=>{for(let i=0;i<n;i+=ST)push(y)},slope=(n,dh)=>{const y0=y;for(let i=0;i<n;i+=ST)push(y0+dh*i/n);y=y0+dh},
    hump=(n,hh)=>{const y0=y;for(let i=0;i<n;i+=ST)push(y0-hh*(1-Math.cos(2*Math.PI*i/n))/2)},gap=n=>{gapS.push(T.length*ST);for(let i=0;i<n;i+=ST)push(NaN)};
  flat(500);const amp=c.f(40,hill?200:120);
  while(T.length*ST<len){const r=Math.random();
    if(hill){if(r<.5){const hh=rnd(amp*.4,amp)*(Math.random()<.7?1:-.6);hump(Math.max(rnd(400,900),Math.abs(hh)*4.5),hh)}else{const dh=clamp(rnd(-amp,amp),170-y,480-y);slope(Math.max(rnd(300,700),Math.abs(dh)*2.4),dh)}}
    else if(c.lv>=3&&r<c.f(.12,.38)){flat(300);slope(160,-rnd(30,55));gap(Math.round(c.f(60,165)/ST)*ST);y+=rnd(0,45);flat(220)}
    else if(r<.5){const hh=rnd(amp*.3,amp)*(Math.random()<.75?1:-.7);hump(Math.max(rnd(260,600),Math.abs(hh)*5),hh)}
    else if(r<.7&&c.lv>=5){for(let k=rnd(2,4);k--;){hump(70,c.f(12,28));flat(50)}}
    else{const dh=clamp(rnd(-amp,amp),170-y,480-y);slope(Math.max(rnd(200,400),Math.abs(dh)*2.8),dh)}}
  flat(700);const FIN=T.length*ST-500;
  const gr=X=>{const i=X/ST,i0=Math.floor(i);if(i0<0)return T[0];if(i0>=T.length-1)return T[T.length-1];const a=T[i0],b=T[i0+1];if(a!==a||b!==b)return 1e6;return a+(b-a)*(i-i0)};
  const pick=[];for(let X=600;X<FIN;X+=hill?rnd(110,170):rnd(160,260)){const g=gr(X);if(g<1e5)pick.push({x:X,y:g-45,k:'🪙'})}
  if(hill)for(let X=900;X<FIN;X+=rnd(800,1150)){let g=gr(X);if(g<1e5)pick.push({x:X,y:g-50,k:'⛽'})}
  let lives=c.lv<10?3:c.lv<20?2:1;const L0=lives,R=17,LEN=66;let w1,w2,fuel=100,coins=0,cp=120,camX=0,camY=0,acc=0,boom=0,still=0;
  function place(X){let s=X;while(gr(s)>1e5||gr(s+LEN)>1e5)s+=ST;w1={x:s,y:gr(s)-R-3};w2={x:s+LEN,y:gr(s+LEN)-R-3};[w1,w2].forEach(w=>{w.ox=w.x;w.oy=w.y})}
  place(120);camY=w1.y-H*.58;
  const res=()=>({got:Math.min(100,Math.floor(((w1.x+w2.x)/2-120)/(FIN-120)*100)),total:100,label:'نسبة الطريق %'});
  const A=arena(root,c,{W,H,hud:`<span class="pill">🏁 <b class="pr">0</b>%</span><span class="pill lv2">${'❤️'.repeat(lives)}</span>${hill?'<span class="pill">⛽ <b class="fu">100</b>%</span>':''}<span class="pill">🪙 <b class="co">0</b></span>`,
    pads:[{k:'ArrowLeft',l:'🛑',side:'l',big:1,a:'فرامل'},{k:'ArrowRight',l:'⛽',side:'r',big:1,a:'بنزين'}]});
  function collide(w){const g=gr(w.x);if(w.y+R<=g)return false;const pen=w.y+R-g;if(pen>38){w.x=w.ox;return false}
    const a4=gr(w.x-4),b4=gr(w.x+4),s=a4<1e5&&b4<1e5?(b4-a4)/8:a4<1e5?(g-a4)/4:b4<1e5?(b4-g)/4:0,n=Math.hypot(1,s),tx=1/n,ty=s/n;w.y=g-R;const vx=w.x-w.ox,vy=w.y-w.oy,vt=vx*tx+vy*ty;w.ox=w.x-tx*vt;w.oy=w.y-ty*vt;w.t=[tx,ty,vt];return true}
  function step(h,thr){for(const w of[w1,w2]){const vx=(w.x-w.ox)*.9995,vy=(w.y-w.oy)*.9995;w.ox=w.x;w.oy=w.y;w.x+=vx;w.y+=vy+GR*h*h;w.on=false}
    for(let it=0;it<3;it++){const dx=w2.x-w1.x,dy=w2.y-w1.y,d=Math.hypot(dx,dy)||1,k=(d-LEN)/d/2;w1.x+=dx*k;w1.y+=dy*k;w2.x-=dx*k;w2.y-=dy*k;if(collide(w1))w1.on=true;if(collide(w2))w2.on=true}
    const go=thr&&(!hill||fuel>0);
    for(const w of[w1,w2])if(w.on){const[tx,ty,vt]=w.t;if(go&&(thr>0?vt<VM*h:vt>-VM*.5*h)){const a=(thr>0?1400:-1100)*h*h;w.x+=tx*a;w.y+=ty*a}else if(!go){w.ox+=(w.x-w.ox)*.006;w.oy+=(w.y-w.oy)*.006}}
    if(!w1.on&&!w2.on){const mx=(w1.x+w2.x)/2,my=(w1.y+w2.y)/2,a0=Math.atan2(w2.y-w1.y,w2.x-w1.x),an=thr?-thr*1.8*h:-Math.sign(a0)*Math.min(Math.abs(a0),2*h),cs=Math.cos(an),sn=Math.sin(an);
      for(const w of[w1,w2])for(const[p,q]of[['x','y'],['ox','oy']]){const rx=w[p]-mx,ry=w[q]-my;w[p]=mx+rx*cs-ry*sn;w[q]=my+rx*sn+ry*cs}}}
  function crash(why){boom=1;sfx.bad();lives--;A.set('.lv2',lives?'❤️'.repeat(lives):'💔');if(!lives)return A.lose(why,res());c.after(()=>{place(cp);boom=0;fuel=100},900)}
  A.loop(dt=>{const x=A.x;
    let thr=(A.k('ArrowRight','KeyD','ArrowUp','KeyW')?1:0)-(A.k('ArrowLeft','KeyA','ArrowDown','KeyS')?1:0);if(A.ptr.down)thr=A.ptr.x>W/2?1:-1;
    if(!boom){acc+=dt;while(acc>=1/120){step(1/120,thr);acc-=1/120}
      const mx=(w1.x+w2.x)/2,my=(w1.y+w2.y)/2,dx=(w2.x-w1.x)/LEN,dy=(w2.y-w1.y)/LEN,hx=mx+dy*40,hy=my-dx*40;
      if(gr(hx)<hy+4&&gr(hx)<1e5)crash('انقلبت السيارة!');else if(my>1300)crash('سقطت في الحفرة!');
      if(hill&&thr){fuel=Math.max(0,fuel-dt*c.f(6,10.5));A.set('.fu',Math.round(fuel))}
      if(hill&&fuel<=0){still=Math.abs(w1.x-w1.ox)<.2?still+dt:0;if(still>1.2)return A.lose('نفد البنزين ⛽',res())}
      {const cd=Math.floor(mx/500)*500;if(cd>cp&&gr(cd)<1e5&&!gapS.some(g=>g>cd&&g<cd+520))cp=cd}
      for(const p of pick)if(!p.got&&Math.hypot(p.x-mx,p.y-my)<45){p.got=1;if(p.k==='⛽'){fuel=100;A.set('.fu',100);sfx.good()}else{coins++;A.set('.co',coins);beep(1200,.05,'triangle',.08)}}
      A.set('.pr',res().got);if(mx>=FIN)return A.win(coins*5+lives*30+100,`وصلت لخط النهاية! 🏁 وجمعت ${coins} عملة`,{got:100,total:100,perfect:true,label:'نسبة الطريق %'});
      camX=mx-W*.32;camY+=(my-H*.58-camY)*Math.min(1,dt*4)}
    const sky=x.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#7dd3fc');sky.addColorStop(1,'#e0f2fe');x.fillStyle=sky;x.fillRect(0,0,W,H);
    x.fillStyle='#b9d8a8';for(let i=-1;i<6;i++){const bx=i*260-(camX*.2%260);x.beginPath();x.arc(bx,H*.8,170,Math.PI,0);x.fill()}
    x.save();x.translate(-camX,-camY);const i0=Math.max(0,Math.floor(camX/ST)-1),i1=Math.min(T.length-1,Math.ceil((camX+W)/ST)+1),bot=camY+H+20;
    let run=camX<0?[[camX-20,T[0]]]:[];const flush=()=>{if(run.length>1){x.beginPath();x.moveTo(run[0][0],bot);run.forEach(([a,b])=>x.lineTo(a,b));x.lineTo(run[run.length-1][0],bot);x.closePath();x.fillStyle=hill?'#8b5a2b':'#a16207';x.fill();
      x.beginPath();run.forEach(([a,b],j)=>j?x.lineTo(a,b):x.moveTo(a,b));x.strokeStyle='#22c55e';x.lineWidth=12;x.lineJoin='round';x.stroke()}run=[]};
    for(let i=i0;i<=i1;i++){const v=T[i];if(v===v)run.push([i*ST,v]);else flush()}flush();
    for(let k=0;k<8;k++){x.fillStyle=k%2?'#111':'#fff';x.fillRect(FIN,gr(FIN)-150+k*16,14,16)}emo(x,'🏁',FIN+30,gr(FIN)-160,50);
    pick.forEach(p=>{if(!p.got&&p.x>camX-40&&p.x<camX+W+40)emo(x,p.k,p.x,p.y,p.k==='⛽'?40:30)});
    const mx=(w1.x+w2.x)/2,my=(w1.y+w2.y)/2,an=Math.atan2(w2.y-w1.y,w2.x-w1.x);x.save();x.translate(mx,my);x.rotate(an);
    x.fillStyle=hill?'#ef4444':'#f97316';x.beginPath();x.roundRect(-46,-30,92,24,8);x.fill();x.fillStyle='#fde68a';x.beginPath();x.roundRect(-14,-52,34,24,8);x.fill();emo(x,boom?'😵':'😃',2,-41,22);x.restore();
    for(const w of[w1,w2]){x.save();x.translate(w.x,w.y);x.rotate(w.x/R);x.fillStyle='#1f2937';x.beginPath();x.arc(0,0,R,0,7);x.fill();x.strokeStyle='#9ca3af';x.lineWidth=4;x.beginPath();x.moveTo(-R+5,0);x.lineTo(R-5,0);x.moveTo(0,-R+5);x.lineTo(0,R-5);x.stroke();x.restore()}
    if(boom)emo(x,'💥',mx,my-20,80);x.restore();
    hintTxt(A,x,isTouch()?'⛽ للتقدّم · 🛑 للرجوع وفي الهواء لتعديل السيارة':'➡️ للتقدّم · ⬅️ للرجوع · في الهواء لتعديل السيارة')});
};
