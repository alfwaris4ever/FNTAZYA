/* لعبة: G.steal (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 7) جامع المخلوقات — مستوحاة من Steal a Brainrot */
G.steal=(root,c)=>{
  const W=1000,H=620,belt=c.f(55,115),rv=c.f(140,265),steal=c.lv>=8,secs=30;
  const KINDS=[['🐸',1],['🐢',1],['🦆',1],['🐌',1],['🦖',2],['🐙',2],['🦩',2],['🦄',5],['🐲',5]];let coins=0,rc=0,mobs=[],spT=0,pops=[],cool=0;
  const P={x:120,y:310,carry:null},E={x:880,y:310,carry:null,tx:880,ty:310,th:0};
  const A=arena(root,c,{W,H,tbar:1,hud:`<span class="pill score-me">🧒 أنت: <b class="co">0</b></span><span class="pill score-op">🦹 الخصم: <b class="rc">0</b></span>`});
  const res=()=>({got:coins,total:rc,vs:true,label:'نقاطك مقابل نقاط الخصم'});
  const tb=c.timeBar(root,secs,()=>{coins>rc?A.win(coins*5+(coins-rc)*3,`فزت بفارق ${coins-rc} ${coins-rc===1?'نقطة':'نقاط'} 🏆`,{...res(),perfect:true}):A.lose(coins===rc?'تعادل! تقدّم ولو بنقطة واحدة لتفوز':`الخصم جمع نقاطاً أكثر بفارق ${rc-coins}`,res())});
  function mv(o,tx,ty,sp,dt){const dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy);if(d<3)return;const s=Math.min(d,sp*dt*(o.carry?1-o.carry[1]*.05:1));o.x+=dx/d*s;o.y+=dy/d*s;o.x=clamp(o.x,25,W-25);o.y=clamp(o.y,25,H-25)}
  const pop=(x,y,t,col)=>pops.push({x,y,t,col,a:1});
  A.loop(dt=>{const x=A.x;cool=Math.max(0,cool-dt);spT-=dt;if(spT<=0){spT=c.f(1.1,.75);const r=Math.random(),k=r<.55?KINDS[rnd(0,3)]:r<.88?KINDS[rnd(4,6)]:KINDS[rnd(7,8)];mobs.push({x:500+rnd(-25,25),y:-30,k})}
    mobs.forEach(m=>m.y+=belt*dt);mobs=mobs.filter(m=>m.y<H+40&&!m.gone);
    const[dx,dy]=dirOf(A);if(dx||dy){const d=Math.hypot(dx,dy);mv(P,P.x+dx/d*100,P.y+dy/d*100,270,dt)}else if(A.ptr.down)mv(P,A.ptr.x,A.ptr.y,270,dt);
    // الذكاء الاصطناعي
    E.th-=dt;if(E.th<=0){E.th=c.f(.6,.15);if(E.carry){E.tx=900;E.ty=clamp(E.y,60,H-60)}else if(steal&&P.carry&&Math.hypot(P.x-E.x,P.y-E.y)<260){E.tx=P.x;E.ty=P.y}
      else{let best=null,bs=-1;mobs.forEach(m=>{const s=m.k[1]/(Math.hypot(m.x-E.x,m.y+belt*.8-E.y)+80);if(s>bs&&m.y<H-60){bs=s;best=m}});if(best){E.tx=best.x;E.ty=best.y+belt*.6}else{E.tx=600;E.ty=310}}}
    mv(E,E.tx,E.ty,rv,dt);
    for(const o of[P,E])if(!o.carry)for(const m of mobs)if(!m.gone&&Math.hypot(m.x-o.x,m.y-o.y)<42){m.gone=1;o.carry=m.k;if(o===P)sfx.pop();break}
    if(!cool&&Math.hypot(P.x-E.x,P.y-E.y)<46){if(!P.carry&&E.carry){P.carry=E.carry;E.carry=null;cool=1.2;sfx.good();pop(P.x,P.y-50,'استرجعتها!','#2563eb')}
      else if(steal&&P.carry&&!E.carry){E.carry=P.carry;P.carry=null;cool=1.2;sfx.bad();pop(P.x,P.y-50,'سرقها!','#dc2626')}}
    if(P.carry&&P.x<150){coins+=P.carry[1];pop(P.x,P.y-50,'+'+P.carry[1],'#16a34a');P.carry=null;A.set('.co',coins);sfx.good();}
    if(E.carry&&E.x>850){rc+=E.carry[1];pop(E.x,E.y-50,'+'+E.carry[1],'#dc2626');E.carry=null;A.set('.rc',rc)}
    x.fillStyle='#bbf7d0';x.fillRect(0,0,W,H);x.fillStyle='#93c5fd';x.fillRect(0,0,150,H);x.fillStyle='#fca5a5';x.fillRect(W-150,0,150,H);
    emo(x,'🏠',75,60,56);emo(x,'🏚️',W-75,60,56);txt(x,'قاعدتك',75,120,22,'#1d4ed8');txt(x,'الخصم',W-75,120,22,'#b91c1c');txt(x,'الرصيد',75,175,18,'#1d4ed8');txt(x,String(coins),75,225,58,'#1d4ed8');txt(x,'الرصيد',W-75,175,18,'#b91c1c');txt(x,String(rc),W-75,225,58,'#b91c1c');
    x.fillStyle='#57534e';x.fillRect(440,0,120,H);x.fillStyle='#78716c';for(let yy=(A.t*belt)%40-40;yy<H;yy+=40)x.fillRect(440,yy,120,6);
    const VC={1:'#16a34a',2:'#7c3aed',5:'#ca8a04'};mobs.forEach(m=>{emo(x,m.k[0],m.x,m.y,44);txt(x,m.k[1]===5?'⭐5':String(m.k[1]),m.x+24,m.y-20,m.k[1]===5?18:16,VC[m.k[1]])});
    for(const[o,e,col]of[[P,'🧒','#2563eb'],[E,'🦹','#dc2626']]){x.fillStyle=col;x.globalAlpha=.25;x.beginPath();x.arc(o.x,o.y,30,0,7);x.fill();x.globalAlpha=1;emo(x,e,o.x,o.y,46);if(o.carry){emo(x,o.carry[0],o.x,o.y-44,34);txt(x,'+'+o.carry[1],o.x+26,o.y-60,16,VC[o.carry[1]])}}
    pops=pops.filter(p=>(p.a-=dt*.9)>0);pops.forEach(p=>{x.globalAlpha=p.a;txt(x,p.t,p.x,p.y-(1-p.a)*40,26,p.col);x.globalAlpha=1});
    hintTxt(A,x,'سباق 30 ثانية: أوصل المخلوقات لبيتك، وكل مخلوق له قيمته (1 أو 2 أو ⭐5)')});
};
