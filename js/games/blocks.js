/* لعبة: G.blocks (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* ---------- ألغاز ---------- */
/* 16+20) مكعبات 10×10 (1010 Deluxe) وانفجار المكعبات (Blocky Blast) */
/* القطع: 9 صغيرة، ثم 10 رباعية (مربع، T، Z وS أفقي وعمودي، L، J، خط 4)، ثم الكبيرة. حرف Z يظهر من أول مرحلة */
const BSH=[[[0,0]],[[0,0],[1,0]],[[0,0],[0,1]],[[0,0],[1,0],[0,1]],[[0,0],[1,0],[1,1]],[[1,0],[0,1],[1,1]],[[0,0],[0,1],[1,1]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2]],
  [[0,0],[1,0],[0,1],[1,1]],[[0,0],[1,0],[2,0],[1,1]],[[0,0],[1,0],[1,1],[2,1]],[[1,0],[2,0],[0,1],[1,1]],[[1,0],[1,1],[0,1],[0,2]],[[0,0],[0,1],[1,1],[1,2]],[[0,0],[0,1],[0,2],[1,2]],[[1,0],[1,1],[1,2],[0,2]],
  [[0,0],[1,0],[2,0],[3,0]],[[0,0],[0,1],[0,2],[0,3]],[[0,0],[1,0],[2,0],[0,1],[0,2]],[[0,0],[1,0],[2,0],[2,1],[2,2]],[[0,0],[1,0],[2,0],[3,0],[4,0]],[[0,0],[0,1],[0,2],[0,3],[0,4]],
  [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]]];
const BCOL=['#ef4444','#f97316','#facc15','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];
G.blocks=mode=>(root,c)=>{
  /* 1010: المرحلة 1 من السهل = 3 صفوف، وتزيد حتى 30 صفاً في المرحلة 10 من الصعب. الوقت يتغير حسب المرحلة */
  const blast=mode==='blast',N=blast?8:10,goal=blast?c.fi(120,950):Math.round(3+27*c.lv/(LEVELS-1)),pool=Math.round(c.f(19,BSH.length)),pre=c.lv<6?0:c.f(0,.18),
    secs=Math.round(blast?goal*c.f(.6,.3)+30:goal*c.f(30,14)+25);
  let B=Array.from({length:N},()=>Array(N).fill(null)),tray=[],sel=-1,cur={x:0,y:0},score=0,lines=0,combo=0,drag=null;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill bk-goal">${blast?'⭐ النقاط':'🧱 مسحت'} <b class="sc">0</b> من <b>${goal}</b>${blast?'':` ${goal>10?'صفاً':'صفوف'}`}</span></div><div class="body" style="bottom:36px"><div class="bk-wrap"><div class="bk-board" style="--n:${N}"></div><div class="bk-tray"></div></div></div>`;
  const board=root.querySelector('.bk-board'),trayEl=root.querySelector('.bk-tray'),wrap=root.querySelector('.bk-wrap'),sc=root.querySelector('.sc');
  for(let j=0;j<N;j++)for(let i=0;i<N;i++)board.append(h(`<div class="bk-c" data-i="${i}" data-j="${j}"></div>`));const cells=[...board.children];
  if(pre)for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(Math.random()<pre&&i!==j)B[j][i]='#94a3b8';
  for(let j=0;j<N;j++){if(B[j].every(Boolean))B[j][0]=null}for(let i=0;i<N;i++){if(B.every(r=>r[i]))B[0][i]=null}
  const dims=s=>[Math.max(...s.map(p=>p[0]))+1,Math.max(...s.map(p=>p[1]))+1];
  const fits=(s,ax,ay)=>s.every(([a,b])=>{const i=ax+a,j=ay+b;return i>=0&&j>=0&&i<N&&j<N&&!B[j][i]});
  const anyFit=s=>{for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(fits(s,i,j))return true;return false};
  function deal(){tray=[0,1,2].map(()=>{let s;do{s=BSH[rnd(0,pool-1)]}while(c.lv<4&&s.length>4);return{s,col:BCOL[rnd(0,BCOL.length-1)],used:false}});if(!tray.some(t=>anyFit(t.s)))tray[0]={s:BSH[0],col:BCOL[0],used:false}}
  function paint(prev){cells.forEach((el,k)=>{const i=k%N,j=k/N|0;el.style.background=B[j][i]||'';el.className='bk-c'+(B[j][i]?' f':'')});
    if(prev){const[s,ax,ay,col]=prev,ok=fits(s,ax,ay);s.forEach(([a,b])=>{const i=ax+a,j=ay+b;if(i>=0&&j>=0&&i<N&&j<N){const el=cells[j*N+i];el.classList.add(ok?'pv':'pvbad');if(ok)el.style.background=col}})}}
  function renderTray(){trayEl.innerHTML='';tray.forEach((t,k)=>{const[w,hh]=dims(t.s),el=h(`<button class="bk-p${t.used?' used':''}${k===sel?' sel':''}" aria-label="قطعة ${k+1}" style="--w:${w};--h:${hh}"></button>`);
      if(!t.used){const fit=anyFit(t.s);if(!fit)el.classList.add('nofit');t.s.forEach(([a,b])=>{const d=h('<i></i>');d.style.gridColumn=a+1;d.style.gridRow=b+1;d.style.background=t.col;el.append(d)})}
      el.onpointerdown=e=>startDrag(e,k);trayEl.append(el)})}
  function size(){const r=wrap.parentElement.getBoundingClientRect(),land=r.width>r.height*1.15;wrap.classList.toggle('land',land);
    const bs=Math.floor(land?Math.min(r.height-8,r.width*.62):Math.min(r.width-8,r.height-Math.min(150,r.height*.26)-14));wrap.style.setProperty('--bs',Math.max(160,bs)+'px')}
  c.on(window,'resize',size);requestAnimationFrame(size);size();
  function cellAt(X,Y){const r=board.getBoundingClientRect();return[Math.floor((X-r.left)/r.width*N),Math.floor((Y-r.top)/r.height*N)]}
  const anchor=(k,X,Y)=>{const[w,hh]=dims(tray[k].s),[i,j]=cellAt(X,Y);return[i-Math.floor((w-1)/2),j-Math.floor((hh-1)/2)]};
  function startDrag(e,k){if(tray[k].used||!cur)return;e.preventDefault();const lift=e.pointerType==='touch'?70:0,X0=e.clientX,Y0=e.clientY;let moved=false;
    const gh=trayEl.children[k].cloneNode(true);gh.className='bk-p bk-ghost';const cs=board.getBoundingClientRect().width/N;gh.style.setProperty('--cs',cs+'px');document.body.append(gh);
    const mvF=ev=>{if(Math.hypot(ev.clientX-X0,ev.clientY-Y0)>8)moved=true;gh.style.left=ev.clientX+'px';gh.style.top=(ev.clientY-lift)+'px';const[ax,ay]=anchor(k,ev.clientX,ev.clientY-lift);paint([tray[k].s,ax,ay,tray[k].col])};
    const upF=ev=>{window.removeEventListener('pointermove',mvF);window.removeEventListener('pointerup',upF);gh.remove();
      if(!moved){sel=sel===k?-1:k;sfx.pop();renderTray();paint();return}const[ax,ay]=anchor(k,ev.clientX,ev.clientY-lift);place(k,ax,ay)||paint()};
    mvF(e);gh.style.left=e.clientX+'px';gh.style.top=(e.clientY-lift)+'px';window.addEventListener('pointermove',mvF);window.addEventListener('pointerup',upF);drag={mvF,upF}}
  c.on(board,'pointermove',e=>{if(sel<0||e.pointerType==='touch')return;const[ax,ay]=anchor(sel,e.clientX,e.clientY);cur={x:ax,y:ay};paint([tray[sel].s,ax,ay,tray[sel].col])});
  c.on(board,'pointerdown',e=>{if(sel<0)return;const[ax,ay]=anchor(sel,e.clientX,e.clientY);if(!place(sel,ax,ay)){paint([tray[sel].s,ax,ay,tray[sel].col]);sfx.bad()}});
  c.on(window,'keydown',e=>{if(c.paused||!cur)return;const d=e.code.match(/^Digit([123])$/);if(d){sel=+d[1]-1;if(tray[sel].used)sel=-1;renderTray();if(sel>=0)paint([tray[sel].s,cur.x,cur.y,tray[sel].col]);return}
    if(sel<0){if(/^Arrow/.test(e.code)){sel=tray.findIndex(t=>!t.used);renderTray()}else return}
    const mv={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.code];if(mv){e.preventDefault();cur.x=clamp(cur.x+mv[0],-2,N-1);cur.y=clamp(cur.y+mv[1],-2,N-1);paint([tray[sel].s,cur.x,cur.y,tray[sel].col])}
    else if(e.code==='Space'){e.preventDefault();if(!place(sel,cur.x,cur.y))sfx.bad()}});
  c.on(window,'pointercancel',()=>{});
  const res=()=>blast?{got:Math.min(score,goal),total:goal,label:'النقاط'}:{got:Math.min(lines,goal),total:goal,label:'الصفوف المكتملة'};
  function place(k,ax,ay){const t=tray[k];if(!t||t.used||!fits(t.s,ax,ay))return false;t.s.forEach(([a,b])=>B[ay+b][ax+a]=t.col);t.used=true;sel=-1;score+=t.s.length;beep(500,.05,'triangle',.08);
    const rows=[],cols=[];for(let j=0;j<N;j++)if(B[j].every(Boolean))rows.push(j);for(let i=0;i<N;i++)if(B.every(r=>r[i]))cols.push(i);const n=rows.length+cols.length;
    if(n){combo++;lines+=n;score+=n*10*n+(combo>1?combo*5:0);const clr=[];rows.forEach(j=>{for(let i=0;i<N;i++)clr.push([i,j])});cols.forEach(i=>{for(let j=0;j<N;j++)clr.push([i,j])});
      clr.forEach(([i,j])=>{cells[j*N+i].classList.add('pop')});c.after(()=>{clr.forEach(([i,j])=>B[j][i]=null);paint();after()},230);sfx.good();if(combo>1)toast(`🔥 كومبو ×${combo}`)}else{combo=0;paint();after()}
    sc.textContent=blast?score:lines;renderTray();return true}
  function after(){if(tray.every(t=>t.used))deal();sc.textContent=blast?score:lines;renderTray();if((blast?score:lines)>=goal)return c.win(score,blast?'جمعت النقاط المطلوبة! 💥':'أكملت كل الصفوف المطلوبة! 🧱',{...res(),perfect:true});
    if(!tray.some(t=>!t.used&&anyFit(t.s))){c.after(()=>((blast?score:lines)>=goal*.5?c.win(score,'لا مكان لأي قطعة',res()):c.lose('لا مكان لأي قطعة!',res())),500)}}
  const tb=c.timeBar(root,secs,()=>{const v=blast?score:lines;v>=goal*.5?c.win(score,'انتهى الوقت ⏰',res()):c.lose('انتهى الوقت ⏰',res())});
  deal();renderTray();paint();
};
