/* لعبة: G.piano (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---- البيانو الصغير: المس البلاطات بالترتيب ---- */
const MELO=[[60,60,67,67,69,69,67,65,65,64,64,62,62,60,67,67,65,65,64,64,62,67,67,65,65,64,64,62,60,60,67,67,69,69,67,65,65,64,64,62,62,60],[60,62,64,60,60,62,64,60,64,65,67,64,65,67,67,69,67,65,64,60,67,69,67,65,64,60,60,55,60,60,55,60]];
function pianoNote(m){if(!sound.on)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const f=440*Math.pow(2,(m-69)/12),now=actx.currentTime,g=actx.createGain();g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.3,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+1.1);g.connect(actx.destination);
  [[1,'triangle',1],[2,'sine',.35],[3,'sine',.12]].forEach(([mul,ty,v])=>{const o=actx.createOscillator(),og=actx.createGain();o.type=ty;o.frequency.value=f*mul;og.gain.value=v;o.connect(og).connect(g);o.start(now);o.stop(now+1.2)})}catch(e){}}
G.piano=(root,c)=>{
  const L=4,goal=c.fi(14,60),spd=c.f(240,640),allow=c.lv<10?3:c.lv<20?1:0,mel=MELO[rnd(0,MELO.length-1)];let tiles=[],hits=0,mist=0,spawnY=0,ni=0,lastLane=-1,started=false;
  const A=arena(root,c,{W:600,H:900,flex:[1.05,1.8],hud:`<span class="pill">🎹 <b class="ht">0</b> من ${goal}</span><span class="pill">❌ <b class="ms">0</b> من ${allow}</span>`,
    onDown:p=>tap(Math.floor(p.x/(A.W/L))),onKey:k=>{const m={KeyD:0,KeyF:1,KeyJ:2,KeyK:3,Digit1:0,Digit2:1,Digit3:2,Digit4:3,ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3}[k];if(m!==undefined)tap(m)}});
  const res=()=>({got:hits,total:goal,label:'النغمات'});
  function addRow(y){let ln;do{ln=rnd(0,L-1)}while(ln===lastLane&&Math.random()<.7);lastLane=ln;tiles.push({ln,y,hit:false,i:ni++})}
  for(let k=0;k<6;k++)addRow(-k*230+200);
  function tap(ln){if(!A.alive||ln<0||ln>=L)return;const nxt=tiles.find(t=>!t.hit);if(!nxt)return;started=true;
    if(nxt.ln===ln&&nxt.y>-230){nxt.hit=true;hits++;A.set('.ht',hits);pianoNote(mel[(hits-1)%mel.length]);fxPt(A,(ln+.5)*A.W/L,nxt.y+110);if(hits%5===0)sfx.good();
      if(hits>=goal)A.win(hits*10+(allow-mist)*30,'عزفت اللحن كاملاً! 🎹',{got:goal,total:goal,perfect:true,label:'النغمات'})}
    else{mist++;A.set('.ms',mist);sfx.bad();if(mist>allow)A.lose('ضغطت على المكان الخطأ!',res())}}
  A.loop(dt=>{const x=A.x,W=A.W,H=A.H,lw=W/L;if(started){const v=spd*(1+hits/goal*.4);tiles.forEach(t=>t.y+=v*dt)}
    const top=Math.min(...tiles.map(t=>t.y));if(tiles.length<goal+2&&top>-230)addRow(top-230);
    const miss=tiles.find(t=>!t.hit&&t.y>H);if(miss){miss.hit=true;mist++;A.set('.ms',mist);sfx.bad();if(mist>allow)return A.lose('فاتتك نغمة!',res())}
    tiles=tiles.filter(t=>t.y<H+240);
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e1b4b');g.addColorStop(1,'#0f172a');x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let k=1;k<L;k++){x.fillStyle='rgba(255,255,255,.08)';x.fillRect(k*lw-1,0,2,H)}
    tiles.forEach(t=>{const tx=t.ln*lw+5,ty=t.y,th=220;if(t.hit){x.fillStyle='rgba(165,180,252,.18)';x.beginPath();x.roundRect(tx,ty,lw-10,th,14);x.fill();return}
      const gg=x.createLinearGradient(0,ty,0,ty+th);gg.addColorStop(0,'#312e81');gg.addColorStop(1,'#111827');x.fillStyle=gg;x.shadowColor='rgba(129,140,248,.6)';x.shadowBlur=t===tiles.find(q=>!q.hit)?22:0;
      x.beginPath();x.roundRect(tx,ty,lw-10,th,14);x.fill();x.shadowBlur=0;x.strokeStyle='rgba(165,180,252,.55)';x.lineWidth=2;x.stroke();
      if(t===tiles.find(q=>!q.hit))emo(x,'🎵',tx+(lw-10)/2,ty+th/2,40)});
    x.fillStyle='rgba(255,255,255,.06)';x.fillRect(0,H-120,W,120);
    if(!started)txt(x,'المس البلاطة المضيئة للبدء',W/2,H*.55,26,'#c7d2fe');
    hintTxt(A,x,'المس البلاطة الداكنة الأقرب للأسفل فقط، ولا تتركها تفوتك')});
};
