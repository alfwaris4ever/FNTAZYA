/* لعبة: G.boom (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 12) معركة البالونات المائية — مستوحاة من Temple of Boom */
G.boom=(root,c)=>{
  const two=twoOn(),CW=13,CH=11,U=50,W=CW*U,H=CH*U,need=c.fi(1,3),skill=c.f(.35,.95),aiSp=c.f(3.2,5);let s1=0,s2=0,M,bombs,flames,items,freeze=0,msg='';
  const pads=isTouch()?(two?[...DP1,{k:'Space',l:'🎈',side:'l'},...DP2,{k:'Slash',l:'🎈',side:'r'}]:[{k:'ArrowLeft',l:'⬅️',side:'l'},{k:'ArrowUp',l:'⬆️',side:'l'},{k:'ArrowDown',l:'⬇️',side:'l'},{k:'ArrowRight',l:'➡️',side:'l'},{k:'Space',l:'🎈',side:'r',big:1}]):null;
  const A=arena(root,c,{W,H,hud:`<span class="pill">🐻 <b class="s1">0</b> : <b class="s2">0</b> ${two?'🐰':'🤖'}</span><span class="pill">🎯 ${need}</span>${twoBtn()}`,pads,onKey:k=>{if(two){if(k==='Space'||k==='KeyF')drop(P);if(k==='Slash'||k==='Period'||k==='ShiftRight'||k==='Enter')drop(Q)}else if(k==='Space'||k==='Enter'||k==='KeyX')drop(P)}});bindTwo(root,c);
  let P,Q;const mkP=(cx,cy,e)=>({cx,cy,x:cx,y:cy,tx:cx,ty:cy,range:2,max:1,e,th:0});
  function round(){M=[];for(let j=0;j<CH;j++){M.push([]);for(let i=0;i<CW;i++){let v=(i===0||j===0||i===CW-1||j===CH-1||(i%2===0&&j%2===0))?1:0;
      if(!v&&Math.random()<c.f(.45,.68)&&!((i<3&&j<3)||(i>CW-4&&j>CH-4)))v=2;M[j].push(v)}}
    bombs=[];flames=[];items=[];P=mkP(1,1,'🐻');Q=mkP(CW-2,CH-2,two?'🐰':'🤖')}
  round();
  const bombAt=(i,j)=>bombs.find(b=>b.i===i&&b.j===j);
  const free=(i,j)=>M[j]&&M[j][i]===0&&!bombAt(i,j);
  function drop(o){if(freeze||!A.alive)return;const i=Math.round(o.x),j=Math.round(o.y);if(bombAt(i,j)||bombs.filter(b=>b.o===o).length>=o.max)return;bombs.push({i,j,t:2.2,o,r:o.range});beep(400,.05,'triangle',.08)}
  function cells(b,grid=M,bs=bombs){const out=[[b.i,b.j]];for(const[a,d]of[[1,0],[-1,0],[0,1],[0,-1]])for(let k=1;k<=b.r;k++){const i=b.i+a*k,j=b.j+d*k,v=grid[j][i];if(v===1)break;out.push([i,j]);if(v===2)break}return out}
  function explode(b){bombs=bombs.filter(q=>q!==b);const cs=cells(b);flames.push({cs,t:.5});beep(120,.25,'sawtooth',.1);
    for(const[i,j]of cs){if(M[j][i]===2){M[j][i]=0;if(Math.random()<.3)items.push({i,j,k:Math.random()<.5?'🔥':'🎈'})}const ch=bombAt(i,j);if(ch)ch.t=Math.min(ch.t,.05)}}
  function danger(extra){const D={};const bs=extra?[...bombs,extra]:bombs;for(const b of bs)for(const[i,j]of cells(b))D[i+','+j]=Math.min(D[i+','+j]??9,b.t);for(const f of flames)for(const[i,j]of f.cs)D[i+','+j]=0;return D}
  function bfs(si,sj,goalFn,D,maxD=40){const seen=new Set([si+','+sj]),q=[[si,sj,null,0]];while(q.length){const[i,j,first,d]=q.shift();if(d>0&&goalFn(i,j))return first;if(d>=maxD)continue;
      for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+a,nj=j+b,k=ni+','+nj;if(seen.has(k)||!free(ni,nj))continue;if(D&&D[k]!==undefined&&D[k]<(d+1)/aiSp+.35)continue;seen.add(k);q.push([ni,nj,first||[ni,nj],d+1])}}return null}
  function ai(o,dt){if(o.x!==o.tx||o.y!==o.ty)return;o.th-=dt;if(o.th>0)return;o.th=.05;const i=o.tx,j=o.ty,D=danger();let go=null;
    if(D[i+','+j]!==undefined){go=bfs(i,j,(a,b)=>D[a+','+b]===undefined,D,12);if(!go)go=bfs(i,j,(a,b)=>D[a+','+b]===undefined,null,12)}
    else{const pi=Math.round(P.x),pj=Math.round(P.y),inLine=(pi===i&&Math.abs(pj-j)<=o.range)||(pj===j&&Math.abs(pi-i)<=o.range),nearCrate=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>M[j+b][i+a]===2);
      if((inLine||nearCrate)&&bombs.filter(b=>b.o===o).length<o.max&&Math.random()<skill){const nb={i,j,t:2.2,r:o.range},D2=danger(nb);if(bfs(i,j,(a,b)=>D2[a+','+b]===undefined,D2,6)){drop(o);o.th=.15;return}}
      if(Math.random()<(1-skill)*.25){o.th=.4;return}
      go=bfs(i,j,(a,b)=>a===pi&&b===pj,D)||bfs(i,j,(a,b)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([x2,y2])=>M[b+y2]&&M[b+y2][a+x2]===2),D)}
    if(go){o.tx=go[0];o.ty=go[1]}}
  function walk(o,dx,dy,sp,dt){if(o.x===o.tx&&o.y===o.ty&&(dx||dy)){const ni=o.tx+(dx?dx:0),nj=o.ty+(dx?0:dy);if(free(ni,nj)){o.tx=ni;o.ty=nj}}
    const ddx=o.tx-o.x,ddy=o.ty-o.y,d=Math.hypot(ddx,ddy);if(d>0){const s=Math.min(d,sp*dt);o.x+=ddx/d*s;o.y+=ddy/d*s;if(Math.hypot(o.tx-o.x,o.ty-o.y)<.001){o.x=o.tx;o.y=o.ty}}
    const it=items.find(q=>q.i===Math.round(o.x)&&q.j===Math.round(o.y));if(it){items=items.filter(q=>q!==it);it.k==='🔥'?o.range++:o.max++;if(o===P||two)sfx.good()}}
  const res=()=>({got:two?Math.max(s1,s2):s1,total:need,label:two?'نقاط الفائز':'نقاطك'});
  function hit(){const inF=o=>flames.some(f=>f.cs.some(([i,j])=>i===Math.round(o.x)&&j===Math.round(o.y)));const a=inF(P),b=inF(Q);if(!a&&!b)return;
    if(a&&!b)s2++;if(b&&!a)s1++;A.set('.s1',s1);A.set('.s2',s2);msg=a&&b?'💦 تعادل!':(b?(two?'💦 نقطة للأول 🐻':'💦 أصبت الخصم!'):(two?'💦 نقطة للثاني 🐰':'💦 تبلّلت!'));(b&&!a)||two?sfx.good():sfx.bad();freeze=1.6;
    if(s1>=need)return A.win(s1*30,two?'فاز 🐻 اللاعب الأول!':'فزت بالمعركة! 🎈',{...res(),perfect:true});
    if(s2>=need)return two?A.win(s2*30,'فاز 🐰 اللاعب الثاني!',{...res(),perfect:true}):A.lose('الكمبيوتر فاز بالمعركة',res())}
  A.loop(dt=>{const x=A.x;if(freeze>0){freeze-=dt;if(freeze<=0)round()}else{
      if(two){const[a,b]=dirOf(A,1);walk(P,a,b,5,dt);const[c2,d2]=dirOf(A,2);walk(Q,c2,d2,5,dt)}else{const[a,b]=dirOf(A);walk(P,a,b,5,dt);ai(Q,dt);walk(Q,0,0,aiSp,dt)}
      bombs.forEach(b=>b.t-=dt);bombs.filter(b=>b.t<=0).forEach(explode);flames=flames.filter(f=>(f.t-=dt)>0);hit()}
    for(let j=0;j<CH;j++)for(let i=0;i<CW;i++){const v=M[j][i],X=i*U,Y=j*U;x.fillStyle=(i+j)%2?'#bef264':'#a3e635';x.fillRect(X,Y,U,U);
      if(v===1){x.fillStyle='#57534e';x.fillRect(X,Y,U,U);x.fillStyle='#78716c';x.fillRect(X+4,Y+4,U-8,U-12)}else if(v===2)emo(x,'📦',X+U/2,Y+U/2,U*.85)}
    items.forEach(q=>emo(x,q.k,q.i*U+U/2,q.j*U+U/2,U*.6));
    bombs.forEach(b=>{const s=1+Math.sin(b.t*14)*.08;x.fillStyle='#38bdf8';x.beginPath();x.arc(b.i*U+U/2,b.j*U+U/2+2,U*.36*s,0,7);x.fill();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(b.i*U+U/2-6,b.j*U+U/2-6,5,0,7);x.fill()});
    flames.forEach(f=>f.cs.forEach(([i,j])=>{x.fillStyle='rgba(56,189,248,.7)';x.fillRect(i*U+3,j*U+3,U-6,U-6);emo(x,'💦',i*U+U/2,j*U+U/2,U*.6)}));
    for(const o of[P,Q])emo(x,o.e,o.x*U+U/2,o.y*U+U/2,U*.85);if(freeze>0)txt(x,msg,W/2,H/2,40);
    hintTxt(A,x,two?'👥 الأول: WASD + المسافة · الثاني: الأسهم + /':'تحرّك بالأسهم وضع بالوناً بالمسافة 🎈')});
};
