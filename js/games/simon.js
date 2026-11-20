/* لعبة: G.simon (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
G.simon=(root,c)=>{
  /* سهل: 4 مربعات (2×2)، وسط: 9 (3×3)، صعب: 12 (4×3). لكل مربع لون ونغمة ورمز مختلف */
  const ALL=[['#ef4444',262,'●'],['#22c55e',294,'▲'],['#3b82f6',330,'■'],['#facc15',392,'★'],['#a855f7',440,'♥'],['#f97316',523,'◆'],['#ec4899',587,'✿'],['#06b6d4',659,'☀'],['#84cc16',784,'♣'],['#8b5a2b',880,'☾'],['#1e3a8a',1047,'♠'],['#64748b',1175,'✚']];
  const LAY=[[2,2],[3,3],[4,3]][c.run.diff],P=ALL.slice(0,LAY[0]*LAY[1]);{const r=root.getBoundingClientRect();if(LAY[0]!==LAY[1]&&r.height>r.width*1.1)LAY.reverse()}
  const goal=c.fi(3,11),sp=Math.round(c.f(900,330));let lives=c.lv<10?2:c.lv<20?1:0,seq=[],i=0,busy=true;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🧠 <b class="lv">0</b> من ${goal}</span>${lives?`<span class="pill lives">${'❤️'.repeat(lives)}</span>`:''}<span class="pill msg">👀 شاهد</span></div><div class="body"><div class="simon${P.length===4?' four':''}" style="--cols:${LAY[0]};--rows:${LAY[1]}"></div></div>`;
  const msg=t=>root.querySelector('.msg').textContent=t,wrap=root.querySelector('.simon');
  const pads=P.map(([col,,sym],k)=>{const d=h(`<button class="pad" style="background:${col}" aria-label="لون ${k+1}"><span>${sym}</span></button>`);d.onclick=()=>press(k);wrap.append(d);return d});
  function flash(k){pads[k].classList.add('lit');beep(P[k][1],.3,'sine',.2);c.after(()=>pads[k].classList.remove('lit'),Math.min(380,sp*.6))}
  function play(){i=0;busy=true;msg('👀 شاهد');seq.forEach((k,j)=>c.after(()=>flash(k),700+j*sp));c.after(()=>{busy=false;msg('👆 دورك!')},700+seq.length*sp)}
  function next(){seq.push(rnd(0,P.length-1));root.querySelector('.lv').textContent=seq.length;play()}
  function press(k){if(busy)return;flash(k);
    if(k!==seq[i]){sfx.bad();busy=true;
      if(lives>0){lives--;const lp=root.querySelector('.lives');if(lp)lp.textContent=lives?'❤️'.repeat(lives):'💔';msg('حاول مجدداً');return c.after(play,900)}
      return c.after(()=>c.lose('أخطأت في الترتيب',{got:seq.length-1,total:goal,label:'الألوان'}),400)}
    i++;if(i===seq.length){busy=true;msg('👏 رائع!');
      if(seq.length>=goal)return c.after(()=>c.win(goal*10+lives*10,`تذكّرت ${goal} ألوان متتالية!`,{got:goal,total:goal,perfect:true,label:'الألوان'}),700);c.after(next,900)}}
  next();
};
