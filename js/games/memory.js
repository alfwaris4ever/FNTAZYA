/* لعبة: G.memory (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
const MEM={animals:['🐶','🐱','🐰','🦊','🐼','🐸','🐵','🦁','🐯','🐨','🐷','🐮'],fruits:['🍎','🍌','🍇','🍓','🍉','🍍','🥝','🍒','🍑','🥭','🍋','🍐'],space:['🚀','🌍','🌙','⭐','🪐','☄️','👽','🛸','🌞','🔭','👨‍🚀','🌌']};
const MEMGRID={3:[3,2],4:[4,2],6:[4,3],8:[4,4],10:[5,4],12:[6,4]};
G.memory=(theme,boost=0)=>(root,c)=>{
  const L=Math.min(LEVELS-1,c.lv+boost),tt=L/(LEVELS-1),lerp=(a,b)=>a+(b-a)*tt;
  const n=[3,4,6,8,10,12][Math.min(5,Math.floor(tt*6))],[cols,rows]=MEMGRID[n],set=shuffle(MEM[theme]).slice(0,n);
  /* لعبة تذكر وليست سباقاً: البطاقات تظهر مكشوفة بلا وقت، والطفل يضغط «ابدأ الآن» متى ما حفظ أماكنها. وبطاقتا الخطأ تبقيان ظاهرتين وقتاً كافياً */
  const back=Math.round(lerp(1300,900)),limit=L>=10?Math.round(n*lerp(3.6,2.1)):0;
  let open=[],done=0,moves=0,lock=true;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🔁 <b class="mv">0</b>${limit?` من ${limit}`:''}</span><span class="pill">✅ <b class="dn">0</b> من ${n}</span></div><div class="body"><div class="mem-grid" style="--cols:${cols};--rows:${rows}"></div></div>`;
  const grid=root.querySelector('.mem-grid'),mv=root.querySelector('.mv'),dn=root.querySelector('.dn');
  const cards=shuffle([...set,...set]).map(e=>{
    const b=h(`<button class="mem-card" data-e="${e}" aria-label="بطاقة"><span class="f">★</span><span class="bk">${e}</span></button>`);
    b.onclick=()=>{if(lock||b.classList.contains('flip'))return;sfx.pop();b.classList.add('flip');open.push(b);
      if(open.length<2)return;moves++;mv.textContent=moves;const[a,d]=open;open=[];
      if(a.dataset.e===d.dataset.e){a.classList.add('ok');d.classList.add('ok');done++;dn.textContent=done;sfx.good();
        if(done===n)return c.after(()=>c.win(n*10+Math.max(0,(limit||n*3)-moves)*2,`وجدت كل الأزواج (عدد الحركات: ${moves})`,{got:n,total:n,perfect:true,label:'الأزواج'}),500)}
      else{lock=true;c.after(()=>{a.classList.remove('flip');d.classList.remove('flip');lock=false},back)}
      if(limit&&moves>=limit&&done<n)c.after(()=>c.lose('انتهت الحركات!',{got:done,total:n,label:'الأزواج'}),600)};
    grid.append(b);return b});
  cards.forEach(b=>b.classList.add('flip'));
  const go=h(`<div class="mem-go" style="position:absolute;left:50%;bottom:clamp(10px,3cqmin,22px);translate:-50% 0;z-index:5;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none"><div style="background:rgba(29,35,80,.85);color:#fff;border-radius:14px;padding:6px 14px;font-weight:800;font-size:clamp(13px,3.4cqmin,18px)">👀 احفظ أماكن الصور، ثم اضغط «ابدأ الآن»</div><button class="play-btn" style="pointer-events:auto">▶ ابدأ الآن</button></div>`);root.append(go);grid.style.width='min(96cqw,calc((100cqh - var(--hud,58px) - 16px - clamp(100px,22cqmin,130px)) * var(--cols) / var(--rows)))';grid.style.marginBottom='clamp(100px,22cqmin,130px)';
  let begun=false;const begin=()=>{if(begun)return;begun=true;go.remove();grid.style.width='';grid.style.marginBottom='';sfx.pop();cards.forEach(b=>b.classList.remove('flip'));c.after(()=>{lock=false},350)};
  go.querySelector('button').onclick=begin;c.on(window,'keydown',e=>{if(!begun&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();begin()}});
};
