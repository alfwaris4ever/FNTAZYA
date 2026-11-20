/* لعبة: G.memory (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
const MEM={animals:['🐶','🐱','🐰','🦊','🐼','🐸','🐵','🦁','🐯','🐨','🐷','🐮'],fruits:['🍎','🍌','🍇','🍓','🍉','🍍','🥝','🍒','🍑','🥭','🍋','🍐'],space:['🚀','🌍','🌙','⭐','🪐','☄️','👽','🛸','🌞','🔭','👨‍🚀','🌌']};
const MEMGRID={3:[3,2],4:[4,2],6:[4,3],8:[4,4],10:[5,4],12:[6,4]};
G.memory=(theme,boost=0)=>(root,c)=>{
  const L=Math.min(LEVELS-1,c.lv+boost),tt=L/(LEVELS-1),lerp=(a,b)=>a+(b-a)*tt;
  const n=[3,4,6,8,10,12][Math.min(5,Math.floor(tt*6))],[cols,rows]=MEMGRID[n],set=shuffle(MEM[theme]).slice(0,n);
  const peek=Math.max(0,Math.round(lerp(3000,-600))),back=Math.round(lerp(1200,450)),limit=L>=10?Math.round(n*lerp(3.6,2.1)):0;
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
  if(peek>0){cards.forEach(b=>b.classList.add('flip'));c.after(()=>{cards.forEach(b=>b.classList.remove('flip'));lock=false},peek)}else lock=false;
};
