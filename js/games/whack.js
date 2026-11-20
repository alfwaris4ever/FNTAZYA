/* لعبة: G.whack (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
G.whack=(root,c)=>{
  const iv=Math.round(c.f(1200,480)),goal=c.fi(5,20),bomb=c.lv<6?0:c.f(-.05,.32),dbl=c.f(0,.4),secs=Math.round(c.f(30,24));
  let score=0;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">⭐ <b class="sc">0</b> من ${goal}</span>${bomb>0?'<span class="pill">💣 لا تضربها!</span>':''}</div><div class="body" style="bottom:36px"><div class="holes"></div></div>`;
  const wrap=root.querySelector('.holes'),sc=root.querySelector('.sc');
  const holes=[...Array(9)].map(()=>{const d=h(`<div class="hole"><div class="mole">🐹</div></div>`);
    d.onpointerdown=()=>{if(!d.classList.contains('up'))return;d.classList.replace('up','hit');
      if(d.dataset.k==='bomb'){score=Math.max(0,score-2);sfx.bad();sc.textContent=score;return}
      score++;sc.textContent=score;sfx.good();if(score>=goal)c.win(score*10+Math.round(tb.left())*3,'ضربت كل الخُلد المطلوب!',{got:score,total:goal,perfect:true,label:'الضربات'})};
    wrap.append(d);return d});
  function pop(hl){const isB=Math.random()<bomb;hl.dataset.k=isB?'bomb':'mole';hl.firstElementChild.textContent=isB?'💣':'🐹';hl.classList.add('up')}
  c.every(()=>{holes.forEach(x=>x.classList.remove('up','hit'));const s=shuffle(holes);pop(s[0]);if(Math.random()<dbl)pop(s[1])},iv);
  const tb=c.timeBar(root,secs,()=>c.lose('انتهى الوقت!',{got:score,total:goal,label:'الضربات'}));
};
