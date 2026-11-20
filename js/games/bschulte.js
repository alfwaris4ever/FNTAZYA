/* لعبة: G.bschulte (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 8) الأرقام بالترتيب: المس من 1 حتى النهاية بأسرع وقت */
G.bschulte=(root,c)=>{
  const N=c.lv<8?9:c.lv<18?16:25,n=Math.sqrt(N),secs=Math.round(N*c.f(3.4,1.25)+4),allow=c.lv<10?3:c.lv<20?1:0;let nx=1,mist=0;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🔢 التالي: <b class="sc-n">1</b></span><span class="pill">❌ <b class="sc-m">0</b> من ${allow}</span></div><div class="body" style="bottom:36px"><div class="sc-grid" style="--n:${n}"></div></div>`;
  const g=root.querySelector('.sc-grid'),cols=['#f472b6','#60a5fa','#34d399','#fbbf24','#a78bfa','#f87171'];
  shuffle([...Array(N)].map((_,k)=>k+1)).forEach(v=>{const b=h(`<button class="sc-c" style="--h:${cols[v%cols.length]};--fs:${c.lv>=20?rnd(70,110)/100:1}">${v}</button>`);
    b.onclick=()=>{if(b.classList.contains('done'))return;if(v===nx){b.classList.add('done');nx++;root.querySelector('.sc-n').textContent=Math.min(nx,N);beep(400+nx*15,.05,'triangle',.07);
        if(nx>N)c.after(()=>c.win(N*10+Math.round(tb.left())*4,mist?'أنهيت الجدول!':'بدون ولا غلطة! سرعة خارقة ⚡',{got:N-Math.min(N,mist),total:N,perfect:mist===0,label:'لمسات صحيحة'}),300);else if(nx%5===1)sfx.good()}
      else{mist++;root.querySelector('.sc-m').textContent=mist;b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad');sfx.bad();if(mist>allow)c.lose('ضغطت أرقاماً خاطئة كثيرة',{got:nx-1,total:N,label:'الأرقام'})}};g.append(b)});
  const tb=c.timeBar(root,secs,()=>c.lose('انتهى الوقت!',{got:nx-1,total:N,label:'الأرقام'}));
};
