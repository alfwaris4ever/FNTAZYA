/* لعبة: G.balloons (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
G.balloons=(root,c)=>{
  const rise=c.f(9,3.5),spawnMs=Math.round(c.f(850,400)),goal=c.fi(8,34),bomb=c.lv<6?0:c.f(-.02,.24),scale=c.f(1.3,.78);
  let score=0;
  root.innerHTML=`<div class="sky"><span class="cloud" style="top:12%">☁️</span><span class="cloud" style="top:40%;animation-delay:-14s">☁️</span></div><div class="hud">${c.tag}<span class="pill">🎈 <b class="sc">0</b> من ${goal}</span>${bomb>0?'<span class="pill">💣 تجنّب القنابل</span>':''}</div>`;
  const sky=root.querySelector('.sky'),sc=root.querySelector('.sc');
  function spawn(){const r=Math.random(),kind=r<bomb?'bomb':r<bomb+.12?'star':'bal';const b=h(`<button class="bal" aria-label="بالون">${{bomb:'💣',star:'⭐',bal:'🎈'}[kind]}</button>`);
    b.style.left=rnd(8,92)+'%';b.style.setProperty('--d',(rise*(.85+Math.random()*.3)).toFixed(2)+'s');b.style.fontSize=`clamp(${46*scale}px,${15*scale}cqmin,${100*scale}px)`;
    if(kind==='bal')b.style.filter=`hue-rotate(${rnd(0,360)}deg)`;
    b.onpointerdown=()=>{if(b.classList.contains('pop'))return;b.classList.add('pop');setTimeout(()=>b.remove(),220);
      if(kind==='bomb'){score=Math.max(0,score-3);sfx.bad()}else{score+=kind==='star'?3:1;kind==='star'?sfx.good():sfx.pop()}
      sc.textContent=score;if(score>=goal)c.win(score*5+Math.round(tb.left())*3,'جمعت كل النقاط المطلوبة!',{got:goal,total:goal,perfect:true,label:'النقاط'})};
    b.addEventListener('animationend',e=>{if(e.animationName==='rise')b.remove()});sky.append(b)}
  spawn();c.every(spawn,spawnMs);
  const tb=c.timeBar(root,30,()=>c.lose('انتهى الوقت!',{got:score,total:goal,label:'النقاط'}));
};
