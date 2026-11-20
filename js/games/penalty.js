/* لعبة: G.penalty (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 14) ركلات الترجيح — مستوحاة من Football Legends */
G.penalty=(root,c)=>{
  const W=900,H=600,GL=180,GR=720,GT=110,GB=330,kicks=5,ax=c.f(200,300),ay=c.f(80,125),wsp=c.f(1.6,3.4),skill=c.f(.25,.6),fly=c.f(1.05,.55),hint=c.lv<10?1:c.lv<20?.35:.2;
  let pg=0,ag=0,n=0,phase='shoot',t=0,ball={x:450,y:520},shot=null,keep={x:450,dive:1},dive=null,msg='',msgT=0,hist=[];
  const A=arena(root,c,{W,H,hud:`<span class="pill">⚽ أنت <b class="pg">0</b> : <b class="ag">0</b> 🤖</span><span class="pill">🔄 <b class="kn">1</b> من ${kicks}</span>`,onDown:p=>tap(p),onKey:k=>key(k)});
  const zoneOf=X=>X<GL+(GR-GL)/3?0:X<GL+(GR-GL)*2/3?1:2,zx=z=>GL+(GR-GL)*(z+.5)/3;
  const res=()=>({got:pg,total:kicks,label:'أهدافك'});
  function cross(){return{x:450+ax*Math.sin(t*wsp),y:(GT+GB)/2+ay*Math.sin(t*wsp*1.37+1)}}
  function tap(p){if(phase==='shoot'&&!shot)shoot();else if(phase==='save'&&shot&&dive===null)dive=zoneOf(p.x)}
  function key(k){if(phase==='shoot'&&!shot&&(k==='Space'||k==='ArrowUp'||k==='KeyW'))shoot();else if(phase==='save'&&shot&&dive===null){if(k==='ArrowLeft'||k==='KeyA')dive=0;else if(k==='ArrowRight'||k==='KeyD')dive=2;else if(k==='ArrowDown'||k==='Space'||k==='KeyS'||k==='ArrowUp')dive=1}}
  function shoot(){const tg=cross();shot={tg,t:0,dur:.5};const z=zoneOf(tg.x),guess=Math.random()<skill?z:rnd(0,2);keep.dive=guess;beep(220,.08,'square',.08)}
  function aiShot(){const z=rnd(0,2);shot={tg:{x:zx(z)+rnd(-50,50),y:rnd(GT+30,GB-30)},t:-(c.f(1.2,.8)),dur:fly,z};dive=null}
  function result(text,good){msg=text;msgT=1.4;good?sfx.good():sfx.bad()}
  function nextPhase(){shot=null;ball={x:450,y:520};keep={x:450,dive:1};dive=null;
    if(phase==='shoot'){phase='save';aiShot()}else{phase='shoot';n++;
      const done=n>=kicks&&pg!==ag||n>=kicks+3;if(done||(n<kicks&&(pg>ag+(kicks-n)||ag>pg+(kicks-n)))){return pg>ag?A.win(pg*20,`فزت بركلات الترجيح ${pg} - ${ag} 🏆`,{...res(),perfect:true}):pg===ag?A.win(pg*10,'تعادل!',res()):A.lose(`خسرت ${pg} - ${ag}`,res())}
      A.set('.kn',Math.min(n+1,kicks))}t=0}
  A.loop(dt=>{const x=A.x;t+=dt;if(msgT>0){msgT-=dt;if(msgT<=0)nextPhase()}
    else if(shot){shot.t+=dt;if(shot.t>=0){const k=Math.min(1,shot.t/shot.dur);ball={x:450+(shot.tg.x-450)*k,y:520+(shot.tg.y-520)*k-Math.sin(k*Math.PI)*60};
        if(phase==='shoot')keep.x=450+(zx(keep.dive)-450)*Math.min(1,k*1.6);else if(dive!==null)keep.x=450+(zx(dive)-450)*Math.min(1,k*2);
        if(k>=1){const tg=shot.tg,inG=tg.x>GL+10&&tg.x<GR-10&&tg.y>GT+10&&tg.y<GB;
          if(phase==='shoot'){const saved=inG&&keep.dive===zoneOf(tg.x);if(!inG)result('😬 خارج المرمى!',false);else if(saved)result('🧤 صدّها الحارس!',false);else{pg++;A.set('.pg',pg);result('⚽ هدف!',true)}hist.push(inG&&!saved?1:0)}
          else{const saved=dive===shot.z;if(saved)result('🧤 صدّة رائعة!',true);else{ag++;A.set('.ag',ag);result(dive===null?'⏰ تأخرت في القفز!':'😮 هدف للخصم',false)}}}}}
    x.fillStyle='#22c55e';x.fillRect(0,0,W,H);x.fillStyle='#64748b';x.fillRect(0,0,W,80);for(let i=0;i<50;i++){x.fillStyle=`hsl(${i*53%360} 70% 60%)`;x.beginPath();x.arc(9+i*18,22+(i%3)*20,8,0,7);x.fill()}
    x.fillStyle='#16a34a';for(let i=0;i<W;i+=90)x.fillRect(i,80,45,H);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(GL,GT,GR-GL,GB-GT);
    x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1.5;for(let X=GL;X<GR;X+=20){x.beginPath();x.moveTo(X,GT);x.lineTo(X,GB);x.stroke()}for(let Y=GT;Y<GB;Y+=20){x.beginPath();x.moveTo(GL,Y);x.lineTo(GR,Y);x.stroke()}
    x.strokeStyle='#fff';x.lineWidth=10;x.beginPath();x.moveTo(GL,GB);x.lineTo(GL,GT);x.lineTo(GR,GT);x.lineTo(GR,GB);x.stroke();x.lineWidth=4;x.beginPath();x.moveTo(120,GB);x.lineTo(780,GB);x.stroke();
    if(phase==='save'&&!msgT){x.fillStyle='rgba(255,255,255,.12)';for(let z=0;z<3;z++)if(z===1)x.fillRect(GL+(GR-GL)/3,GT,(GR-GL)/3,GB-GT)}
    const kp=phase==='shoot'?'🤖':'🧤';x.fillStyle=phase==='shoot'?'#ef4444':'#2563eb';x.beginPath();x.roundRect(keep.x-40,GB-90,80,90,20);x.fill();emo(x,phase==='shoot'?'🤖':'😎',keep.x,GB-110,56);emo(x,'🧤',keep.x-48,GB-70,30);emo(x,'🧤',keep.x+48,GB-70,30);
    if(phase==='save'){emo(x,'🤖',450,560,60);if(shot&&shot.t<0&&shot.t>-hint-.0&&shot.t>-(hint)){const hx=zx(shot.z);x.globalAlpha=.85;emo(x,'👉',450+(hx-450)*.35,470,40,hx<450?Math.PI:hx>450+40?0:-Math.PI/2);x.globalAlpha=1}}
    emo(x,'⚽',ball.x,ball.y,phase==='shoot'?44:44-(shot&&shot.t>0?Math.min(1,shot.t/shot.dur)*14:0));
    if(phase==='shoot'&&!shot&&!msgT){const cr=cross();x.strokeStyle='#ef4444';x.lineWidth=4;x.beginPath();x.arc(cr.x,cr.y,20,0,7);x.moveTo(cr.x-30,cr.y);x.lineTo(cr.x+30,cr.y);x.moveTo(cr.x,cr.y-30);x.lineTo(cr.x,cr.y+30);x.stroke();
      txt(x,isTouch()?'👆 المس الشاشة لتسدد عندما يكون الهدف في مكان جيد':'اضغط المسافة أو انقر لتسدد',450,410,22)}
    if(phase==='save'&&shot&&dive===null&&!msgT)txt(x,isTouch()?'👆 المس جهة القفز: يسار · وسط · يمين':'⬅️ يسار · ⬇️ وسط · ➡️ يمين',450,410,22);
    x.font='26px '+EMF;hist.forEach((v,i)=>emo(x,v?'✅':'❌',30+i*34,110,26));if(msgT>0)txt(x,msg,450,300,52)});
};
