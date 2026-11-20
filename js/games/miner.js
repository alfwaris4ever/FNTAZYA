/* لعبة: G.miner (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---------- ألعاب io ---------- */
/* 6) عالم المكعبات — مستوحاة من MineFun.io */
G.miner=(root,c)=>{
  const CO=12,RO=46,U=50,W=CO*U,goal=c.fi(3,12),lava=c.lv<4?0:c.f(.0,.09),stone=c.f(.15,.4),secs=Math.round(c.f(80,70));
  const M=[];for(let r=0;r<RO;r++){M.push([]);for(let q=0;q<CO;q++){let v=r<3?0:r===3?7:1;if(r>4){const d=r/RO;if(Math.random()<stone+d*.25)v=2;if(r>14&&Math.random()<d*.35)v=3;if(r>6&&Math.random()<lava*(.5+d))v=5}M[r].push(v)}}
  const HP={1:1,2:2,3:3,7:1,4:2};let gems=0,placed=0;while(placed<goal+4){const r=rnd(6,RO-2),q=rnd(0,CO-1);if(M[r][q]!==4){M[r][q]=4;placed++}}
  const hp=M.map(row=>row.map(v=>HP[v]||0));const P={q:6,r:2},lv0=c.lv<10?3:c.lv<20?2:1;let lives=lv0,cd=0,fall=0,camY=0,hurt=0,fx=[],hold=0;
  const A=arena(root,c,{W,H:W,flex:[.6,1.9],tbar:1,hud:`<span class="pill">💎 <b class="gm">0</b> من ${goal}</span><span class="pill lv2">${'❤️'.repeat(lives)}</span>`,
    pads:[{k:'ArrowLeft',l:'⬅️',side:'l',big:1},{k:'ArrowRight',l:'➡️',side:'l',big:1},{k:'ArrowUp',l:'⬆️',side:'r',big:1},{k:'ArrowDown',l:'⬇️',side:'r',big:1}],
    onKey:k=>{const m={ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0],ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1]}[k];if(m){cd=0;act(...m)}},
    onDown:p=>{const px=P.q*U+U/2,py=P.r*U+U/2-camY,dx=p.x-px,dy=p.y-py;if(Math.max(Math.abs(dx),Math.abs(dy))<U*.5)return;act(...(Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)]))}});
  const res=()=>({got:gems,total:goal,label:'الجواهر'});
  const tb=c.timeBar(root,secs,()=>{gems?A.win(gems*10,'انتهى الوقت',res()):A.lose('انتهى الوقت',res())});
  const at=(q,r)=>q<0||q>=CO||r>=RO?9:r<0?0:M[r][q];
  function act(dq,dr){if(!A.alive||cd>0)return;cd=.16;const q=P.q+dq,r=P.r+dr,v=at(q,r);if(v===9||r<0)return;
    if(v===0||v===6){if(dr<0&&at(P.q,P.r)!==6&&at(P.q,P.r+1)===0)return;if(dr<0){M[P.r][P.q]=6}P.q=q;P.r=r;beep(500,.03,'triangle',.05);return}
    if(v===5){hit();return}
    hp[r][q]--;fx.push({q,r,t:.25});beep(v===2||v===3?220:330,.06,'square',.06);if(hp[r][q]<=0){if(v===4){gems++;A.set('.gm',gems);sfx.good();if(gems>=goal)return A.win(gems*10+Math.round(tb.left())*2,'جمعت كل الجواهر! 💎',{...res(),perfect:true})}M[r][q]=0}}
  function hit(){if(hurt>0)return;hurt=1;lives--;sfx.bad();A.set('.lv2',lives?'❤️'.repeat(lives):'💔');if(!lives)A.lose('لمست الحمم!',res())}
  const COL={1:['#a0522d','#8b4513'],2:['#9ca3af','#6b7280'],3:['#475569','#334155'],4:['#a0522d','#8b4513'],7:['#4ade80','#a0522d'],5:['#f97316','#dc2626']};
  A.loop(dt=>{const x=A.x;cd=Math.max(0,cd-dt);hurt=Math.max(0,hurt-dt);
    const[dx,dy]=dirOf(A);if((dx||dy)&&(hold+=dt)>.3)act(...(dx?[dx,0]:[0,dy]));if(!dx&&!dy)hold=0;
    fall+=dt;if(fall>.13){fall=0;const b=at(P.q,P.r+1);if((b===0)&&at(P.q,P.r)!==6){P.r++}}
    for(const[a,b]of[[0,1],[1,0],[-1,0],[0,-1]])if(at(P.q+a,P.r+b)===5&&Math.random()<.02)hit();
    camY+=(P.r*U-A.H*.4-camY)*Math.min(1,dt*6);camY=clamp(camY,-U,RO*U-A.H);
    const g=x.createLinearGradient(0,-camY,0,4*U-camY);g.addColorStop(0,'#7dd3fc');g.addColorStop(1,'#bae6fd');x.fillStyle='#3b2412';x.fillRect(0,0,W,A.H);x.fillStyle=g;x.fillRect(0,-camY-500,W,4*U+500);
    const r0=Math.max(0,Math.floor(camY/U)),r1=Math.min(RO-1,Math.ceil((camY+A.H)/U));
    for(let r=r0;r<=r1;r++)for(let q=0;q<CO;q++){const v=M[r][q],X=q*U,Y=r*U-camY;if(!v)continue;if(v===6){emo(x,'🪜',X+U/2,Y+U/2,U*.8);continue}
      const[a,b]=COL[v];x.fillStyle=b;x.fillRect(X,Y,U,U);x.fillStyle=a;x.fillRect(X+3,Y+3,U-6,v===7?14:U-6);if(v===7){x.fillStyle=b;x.fillRect(X+3,Y+17,U-6,U-20)}
      if(v===4)emo(x,'💎',X+U/2,Y+U/2,U*.62);if(v===5){x.fillStyle='rgba(255,230,0,'+(.4+.3*Math.sin(A.t*6+q))+')';x.fillRect(X+8,Y+8,U-16,U-16)}
      if(v===2||v===3){x.fillStyle='rgba(0,0,0,.18)';x.fillRect(X+10,Y+12,10,8);x.fillRect(X+28,Y+28,12,9)}
      const mh=HP[v]||1;if(hp[r][q]<mh){x.strokeStyle='#111';x.lineWidth=3;x.beginPath();x.moveTo(X+10,Y+10);x.lineTo(X+U/2,Y+U/2);x.lineTo(X+U-12,Y+18);x.stroke()}}
    fx=fx.filter(f=>(f.t-=dt)>0);fx.forEach(f=>emo(x,'💥',f.q*U+U/2,f.r*U+U/2-camY,U*.6*f.t*4));
    emo(x,hurt>0&&(A.t*12|0)%2?'😣':'⛏️',P.q*U+U/2+12,P.r*U+U/2-camY-8,U*.45);emo(x,'🧑',P.q*U+U/2,P.r*U+U/2-camY+4,U*.8);
    hintTxt(A,x,'احفر بالأسهم أو المس المربع المجاور · ابحث عن 💎 وتجنّب 🔥')});
};
