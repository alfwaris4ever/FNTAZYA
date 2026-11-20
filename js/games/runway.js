/* لعبة: G.runway (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 23) عرض الأزياء — مستوحاة من Super Dress */
G.runway=(root,c)=>{
  const W=480,H=800,N=c.fi(8,20),sp=c.f(250,470),cols=shuffle(PAL.slice(0,7)).slice(0,c.lv<10?2:3),tc=cols[0],CL=['👗','👚','👒','👠','👜','🧣','🎀','👟'];
  let lane=1,px=240,rows=[],spawned=0,got=0,bad=0,t=0,fx=[];const lanes=[110,240,370];
  const A=arena(root,c,{W,H,hud:`<span class="pill">🎯 اجمع اللون <b style="color:${tc[1]}">${tc[0]}</b></span><span class="pill">✅ <b class="gt">0</b> من ${N}</span><span class="pill">❌ <b class="bd">0</b></span>`,
    onDown:p=>{lane=clamp(lane+(p.x<W/2?-1:1),0,2);beep(600,.03,'triangle',.05)},onKey:k=>{if(k==='ArrowLeft'||k==='KeyA')lane=Math.max(0,lane-1);if(k==='ArrowRight'||k==='KeyD')lane=Math.min(2,lane+1)}});
  const res=()=>({got,total:N,label:`قطع باللون ${tc[0]}`});
  A.loop(dt=>{const x=A.x;t+=dt;px+=(lanes[lane]-px)*Math.min(1,dt*14);
    if(spawned<N&&(!rows.length||rows[rows.length-1].y>220)){const tl=rnd(0,2),others=shuffle([0,1,2].filter(l=>l!==tl)).slice(0,c.lv<6?1:rnd(1,2));
      rows.push({y:-60,items:[{l:tl,col:tc,e:CL[rnd(0,7)]},...others.map(l=>({l,col:cols[rnd(1,cols.length-1)],e:CL[rnd(0,7)]}))]});spawned++}
    rows.forEach(r=>{r.y+=sp*dt;if(!r.done&&r.y>640){r.done=1;const it=r.items.find(i=>i.l===lane);if(it){if(it.col===tc){got++;sfx.good();fx.push({t:1,s:'✨'})}else{bad++;sfx.bad();fx.push({t:1,s:'❌'})}it.hit=1;A.set('.gt',got);A.set('.bd',bad)}}});
    rows=rows.filter(r=>r.y<H+80);
    if(spawned>=N&&!rows.length)return got===N&&bad===0?A.win(got*10,'إطلالة مثالية على المنصة! 💃✨',{...res(),perfect:true}):got>=N*.6?A.win(got*10-bad*5,`جمعت ${got} وأخطأت في ${bad}`,res()):A.lose('إطلالة غير مكتملة',res());
    x.fillStyle='#fdf2f8';x.fillRect(0,0,W,H);x.fillStyle='#fbcfe8';x.fillRect(40,0,400,H);x.fillStyle='#f9a8d4';for(let y=(t*sp)%100-100;y<H;y+=100){x.fillRect(172,y,6,50);x.fillRect(302,y,6,50)}
    for(let y=(t*sp*.9)%120-120;y<H;y+=120){emo(x,'💡',18,y,22);emo(x,'💡',462,y+60,22)}
    rows.forEach(r=>r.items.forEach(it=>{if(it.hit)return;x.fillStyle=it.col[1];x.beginPath();x.arc(lanes[it.l],r.y,40,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=5;x.stroke();emo(x,it.e,lanes[it.l],r.y,40)}));
    const k=got/N;x.fillStyle=tc[1];x.globalAlpha=.25+k*.75;x.beginPath();x.moveTo(px-30,690);x.lineTo(px+30,690);x.lineTo(px+44,760);x.lineTo(px-44,760);x.fill();x.globalAlpha=1;emo(x,'👧',px,660,70);
    fx=fx.filter(f=>(f.t-=dt*1.5)>0);fx.forEach(f=>emo(x,f.s,px,600-(1-f.t)*60,40*f.t+10));
    hintTxt(A,x,isTouch()?'المس يمين أو يسار الشاشة لتغيّر المسار':'⬅️ ➡️ لتغيير المسار')});
};
