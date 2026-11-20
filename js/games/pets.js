/* لعبة: G.pets (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
const TWO_HINT='👥 الأول: W A S D · الثاني: الأسهم';
/* 11) حديقة الحيوانات — مستوحاة من Pets Park */
G.pets=(root,c)=>{
  const two=twoOn(),W=1000,H=620,goal=c.fi(5,15),aiS=c.f(130,250),react=c.f(.8,.15),secs=Math.round(c.f(60,75));let s1=0,s2=0,treats=[],tT=0,pops=[];
  const trees=[];for(let i=0;i<c.fi(3,8);i++){let t;do{t={x:rnd(200,800),y:rnd(90,H-90),r:rnd(26,38)}}while(trees.some(o=>Math.hypot(o.x-t.x,o.y-t.y)<110));trees.push(t)}
  const A=arena(root,c,{W,H,tbar:1,hud:`<span class="pill">🐶 <b class="s1">0</b> : <b class="s2">0</b> ${two?'🐱':'🤖'}</span><span class="pill">🎯 ${goal}</span>${twoBtn()}`,pads:two?[...DP1,...DP2]:null});bindTwo(root,c);
  const P={x:120,y:H/2,e:'🐶'},Q={x:W-120,y:H/2,e:two?'🐱':'🐱',tx:W/2,ty:H/2,th:0};
  const res=()=>({got:Math.min(goal,two?Math.max(s1,s2):s1),total:goal,label:two?'نقاط الفائز':'نقاطك'});
  const finish=()=>{if(two)return s1===s2?A.lose('تعادل! 🤝',res()):A.win(Math.max(s1,s2)*10,`فاز ${s1>s2?'🐶 الكلب (الأول)':'🐱 القطة (الثاني)'}! 🎉`,{...res(),perfect:true});
    s1>s2?A.win(s1*10,'انتهى الوقت وأنت متقدّم',res()):A.lose('انتهى الوقت',res())};
  c.timeBar(root,secs,finish);
  function mv(o,dx,dy,sp,dt){const d=Math.hypot(dx,dy);if(d<1)return;o.x+=dx/d*sp*dt;o.y+=dy/d*sp*dt;for(const t of trees){const ex=o.x-t.x,ey=o.y-t.y,ed=Math.hypot(ex,ey);if(ed<t.r+22){o.x=t.x+ex/ed*(t.r+22);o.y=t.y+ey/ed*(t.r+22)}}o.x=clamp(o.x,25,W-25);o.y=clamp(o.y,25,H-25)}
  A.loop(dt=>{const x=A.x;tT-=dt;if(tT<=0&&treats.length<3){tT=rnd(5,12)/10;let t;do{t={x:rnd(60,W-60),y:rnd(60,H-60),e:['🍖','🦴','🍪','🧀','🍗','🐟'][rnd(0,5)]}}while(trees.some(o=>Math.hypot(o.x-t.x,o.y-t.y)<o.r+30));treats.push(t)}
    if(two){const[a,b]=dirOf(A,1);mv(P,a,b,250,dt);const[c2,d2]=dirOf(A,2);mv(Q,c2,d2,250,dt)}
    else{const[a,b]=dirOf(A);if(a||b)mv(P,a,b,250,dt);else if(A.ptr.down)mv(P,A.ptr.x-P.x,A.ptr.y-P.y,Math.min(250,Math.hypot(A.ptr.x-P.x,A.ptr.y-P.y)*8),dt);
      Q.th-=dt;if(Q.th<=0){Q.th=react;let best=null,bs=1e9;for(const t of treats){const dq=Math.hypot(t.x-Q.x,t.y-Q.y),dp=Math.hypot(t.x-P.x,t.y-P.y);const s=dq-(c.lv>=12&&dp<dq*.6?400:0)*-1;if(s<bs){bs=s;best=t}}if(best){Q.tx=best.x;Q.ty=best.y}}
      mv(Q,Q.tx-Q.x,Q.ty-Q.y,aiS,dt)}
    for(const[o,k]of[[P,1],[Q,2]])treats=treats.filter(t=>{if(Math.hypot(t.x-o.x,t.y-o.y)<40){k===1?s1++:s2++;pops.push({x:t.x,y:t.y,a:1,c:k===1?'#2563eb':'#ea580c'});k===1||two?sfx.good():beep(300,.08,'sine',.06);return false}return true});
    A.set('.s1',s1);A.set('.s2',s2);if(s1>=goal||s2>=goal){if(two)return finish();return s1>=goal?A.win(s1*10+30,'جمعت كل الحلوى أولاً! 🐶',{...res(),perfect:true}):A.lose('سبقك الكمبيوتر!',res())}
    x.fillStyle='#86efac';x.fillRect(0,0,W,H);x.fillStyle='#bbf7d0';for(let i=0;i<14;i++)for(let j=0;j<9;j++)if((i+j)%2)x.fillRect(i*75,j*72,75,72);
    trees.forEach(t=>emo(x,'🌳',t.x,t.y-6,t.r*2.4));treats.forEach(t=>emo(x,t.e,t.x,t.y+Math.sin(A.t*5+t.x)*3,40));
    x.fillStyle='rgba(37,99,235,.3)';x.beginPath();x.arc(P.x,P.y,30,0,7);x.fill();emo(x,'🐶',P.x,P.y,52);x.fillStyle='rgba(234,88,12,.3)';x.beginPath();x.arc(Q.x,Q.y,30,0,7);x.fill();emo(x,'🐱',Q.x,Q.y,52);
    pops=pops.filter(p=>(p.a-=dt*1.4)>0);pops.forEach(p=>{x.globalAlpha=p.a;txt(x,'+1',p.x,p.y-(1-p.a)*40,28,p.c);x.globalAlpha=1});
    hintTxt(A,x,two?TWO_HINT:'اجمع الحلوى قبل القطة 🐱 · الأسهم أو اسحب بإصبعك')});
};
