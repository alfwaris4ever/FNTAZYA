/* لعبة: G.whack (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
G.whack=(root,c)=>{
  const iv=Math.round(c.f(1200,480)),goal=c.fi(5,20),bomb=c.lv<6?0:c.f(-.05,.32),dbl=c.f(0,.4),secs=Math.round(c.f(30,24));
  let score=0;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">⭐ <b class="sc">0</b> من ${goal}</span>${bomb>0?'<span class="pill" style="background:#ef4444;color:#fff">💣 لا تضربها! −2</span>':''}</div><div class="body" style="bottom:36px"><div class="holes"></div></div>`;
  const wrap=root.querySelector('.holes'),sc=root.querySelector('.sc');
  const holes=[...Array(9)].map(()=>{const d=h(`<div class="hole"><div class="mole">🐹</div></div>`);
    d.onpointerdown=()=>{if(!d.classList.contains('up'))return;d.classList.replace('up','hit');
      if(d.dataset.k==='bomb'){score-=2;sfx.bad();sc.textContent=score;sc.style.color='#ef4444';setTimeout(()=>sc.style.color=score<0?'#ef4444':'',500);minus(d);return}
      score++;sc.textContent=score;sc.style.color=score<0?'#ef4444':'';sfx.good();if(score>=goal)c.win(score*10+Math.round(tb.left())*3,'ضربت كل الخُلد المطلوب!',{got:score,total:goal,perfect:true,label:'الضربات'})};
    wrap.append(d);return d});
  /* القنبلة حمراء واضحة: دائرة حمراء متوهجة خلفها، وضربها ينقص نقطتين ويطلع «-2» */
  function minus(d){const m=h('<div style="position:absolute;left:0;right:0;top:18%;text-align:center;font:900 min(9cqmin,52px) system-ui,sans-serif;color:#fff;-webkit-text-stroke:3px #dc2626;paint-order:stroke;direction:ltr;pointer-events:none;transition:transform .8s ease-out,opacity .8s">-2</div>');d.append(m);
    d.style.boxShadow='0 0 0 6px #ef4444,0 10px 24px rgba(0,0,0,.35)';requestAnimationFrame(()=>{m.style.transform='translateY(-60%)';m.style.opacity='0'});setTimeout(()=>{m.remove();d.style.boxShadow=''},800)}
  const BOMB_CSS='background:radial-gradient(circle at 50% 46%,#fecaca 0 8%,#ef4444 9% 34%,#b91c1c 35% 41%,transparent 42%);filter:sepia(1) saturate(8) hue-rotate(-25deg) brightness(1.05) drop-shadow(0 0 12px #ef4444)';
  function pop(hl){const isB=Math.random()<bomb;hl.dataset.k=isB?'bomb':'mole';const m=hl.firstElementChild;m.textContent=isB?'💣':'🐹';m.style.cssText=isB?BOMB_CSS:'';hl.classList.add('up')}
  c.every(()=>{holes.forEach(x=>x.classList.remove('up','hit'));const s=shuffle(holes);pop(s[0]);if(Math.random()<dbl)pop(s[1])},iv);
  const tb=c.timeBar(root,secs,()=>c.lose('انتهى الوقت!',{got:score,total:goal,label:'الضربات'}));
};
