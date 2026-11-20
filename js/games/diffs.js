/* لعبة: G.diffs (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 17) أوجد الفروق — مستوحاة من Spot the Differences */
const DTH=[['🐄','🐖','🐔','🐑','🐴','🌾','🚜','🐓','🦆','🌻','🐇','🥕'],['🐠','🐙','🦀','🐳','🐬','🦑','🐚','⭐','🪸','🐡','🦈','🐢'],['🚀','🪐','🌙','⭐','👽','🛸','☄️','🌍','🛰️','🌟','👨‍🚀','🔭'],['🍎','🍌','🍇','🍓','🍕','🍩','🧁','🍪','🍉','🥕','🧀','🍔'],['🧸','🪀','🎈','🪁','🚂','🎨','🧩','🎲','⚽','🛴','🎁','🪄']];
G.diffs=(root,c)=>{
  const cols=c.fi(3,6),rows=c.fi(3,5),n=cols*rows,K=Math.min(Math.floor(n/2.5),c.fi(3,8)),th=DTH[rnd(0,DTH.length-1)],secs=Math.round(c.f(75,45));let hearts=c.lv<10?5:3,found=0;
  const base=Array.from({length:n},()=>({e:th[rnd(0,th.length-1)],hue:rnd(0,7)*45,flip:false}));const diff=shuffle([...Array(n).keys()]).slice(0,K);
  const mod=base.map(o=>({...o}));diff.forEach(k=>{const types=['swap','gone',...(c.lv>=8?['color']:[]),...(c.lv>=16?['flip']:[])],t=types[rnd(0,types.length-1)];
    if(t==='swap'){let e;do{e=th[rnd(0,th.length-1)]}while(e===base[k].e);mod[k].e=e}else if(t==='gone')mod[k].e='';else if(t==='color')mod[k].hue=(base[k].hue+180)%360;else mod[k].flip=true});
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🔍 <b class="fd">0</b> من ${K}</span><span class="pill lv2">${'❤️'.repeat(hearts)}</span></div><div class="body" style="bottom:36px"><div class="df-wrap"><div class="df-p"></div><div class="df-p"></div></div></div>`;
  const wrap=root.querySelector('.df-wrap'),[pa,pb]=root.querySelectorAll('.df-p'),done=new Set();
  const res=()=>({got:found,total:K,label:'الفروق'});
  [[pa,base],[pb,mod]].forEach(([p,arr])=>{p.style.setProperty('--c',cols);p.style.setProperty('--r',rows);arr.forEach((o,k)=>{const el=h(`<button class="df-c" style="--h:${o.hue}"><span${o.flip?' style="transform:scaleX(-1)"':''}>${o.e}</span></button>`);el.onclick=()=>tap(k,el);p.append(el)})});
  function tap(k,el){if(done.has(k)||hearts<=0||found>=K)return;if(diff.includes(k)){done.add(k);found++;root.querySelector('.fd').textContent=found;sfx.good();pa.children[k].classList.add('found');pb.children[k].classList.add('found');
      if(found>=K)c.win(found*10+Math.round(tb.left())*3+hearts*5,'وجدت كل الفروق! 🔍',{...res(),perfect:true});return}
    hearts--;el.classList.add('miss');setTimeout(()=>el.classList.remove('miss'),450);sfx.bad();root.querySelector('.lv2').textContent=hearts?'❤️'.repeat(hearts):'💔';if(!hearts)c.lose('أخطأت كثيراً',res())}
  function size(){const r=wrap.parentElement.getBoundingClientRect(),land=r.width/r.height>(2*cols/rows)*.8;wrap.classList.toggle('land',land);
    const pw=land?Math.min((r.width-16)/2,(r.height-4)*cols/rows):Math.min(r.width-4,((r.height-16)/2)*cols/rows);wrap.style.setProperty('--pw',Math.floor(pw)+'px')}
  c.on(window,'resize',size);size();requestAnimationFrame(size);
  const tb=c.timeBar(root,secs,()=>found?c.win(found*10,'انتهى الوقت',res()):c.lose('انتهى الوقت',res()));
};
