/* لعبة: G.sort (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 18) فرز الألوان — مستوحاة من Water Color Sort */
const SCOL=['#ef4444','#3b82f6','#22c55e','#facc15','#a855f7','#f97316','#ec4899','#14b8a6','#8b5a2b','#1e293b'];
G.sort=(root,c)=>{
  const n=c.fi(3,9),cap=4,empties=2;let T,hist=[],sel=-1,cur=0,moves=0;
  do{const balls=shuffle([...Array(n)].flatMap((_,i)=>Array(cap).fill(i)));T=[...Array(n)].map((_,i)=>balls.slice(i*cap,i*cap+cap));}while(T.some(t=>t.every(v=>v===t[0])));
  for(let i=0;i<empties;i++)T.push([]);
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🧪 <b class="mv">0</b> نقلة</span><span class="pill">✅ <b class="dn">0</b> من ${n}</span><button class="pill two-btn" data-undo>↩️ تراجع</button></div><div class="body"><div class="st-wrap"></div></div>`;
  const wrap=root.querySelector('.st-wrap');root.querySelector('[data-undo]').onclick=()=>{if(!hist.length)return;T=hist.pop();sel=-1;moves++;render();sfx.pop()};
  const solved=t=>t.length===cap&&t.every(v=>v===t[0]);const doneN=()=>T.filter(solved).length;
  const res=()=>({got:doneN(),total:n,label:'الأنابيب المرتبة'});
  function render(){wrap.innerHTML='';T.forEach((t,k)=>{const el=h(`<button class="st-t${k===sel?' sel':''}${k===cur&&kbd?' kb':''}${solved(t)?' ok':''}" aria-label="أنبوب ${k+1}"></button>`);
      t.forEach((v,j)=>{const b=h(`<i style="--c:${SCOL[v]}"></i>`);if(k===sel&&j===t.length-1)b.classList.add('up');if(k===dropK&&j>=t.length-dropN)b.classList.add('drop');el.append(b)});el.onclick=()=>pick(k);wrap.append(el)});
    root.querySelector('.mv').textContent=moves;root.querySelector('.dn').textContent=doneN();const per=Math.ceil(T.length/(T.length>7?2:1));wrap.style.setProperty('--per',per);wrap.style.setProperty('--rows',T.length>7?2:1)}
  let kbd=false,dropK=-1,dropN=0;
  function pick(k){if(sel<0){if(!T[k].length)return;sel=k;sfx.pop();return render()}if(k===sel){sel=-1;return render()}
    const a=T[sel],b=T[k],top=a[a.length-1];if(b.length>=cap||(b.length&&b[b.length-1]!==top)){sfx.bad();sel=-1;return render()}
    hist.push(T.map(t=>[...t]));if(hist.length>30)hist.shift();const b0=b.length;while(a.length&&a[a.length-1]===top&&b.length<cap)b.push(a.pop());moves++;sel=-1;beep(700,.06,'sine',.1);dropK=k;dropN=b.length-b0;render();dropK=-1;
    if(solved(b))sfx.good();if(T.every(t=>!t.length||solved(t)))c.after(()=>c.win(Math.max(10,200-moves*3),`رتّبت كل الألوان في ${moves} نقلة! 🧪`,{got:n,total:n,perfect:true,label:'الأنابيب المرتبة'}),400)}
  c.on(window,'keydown',e=>{if(c.paused)return;const m={ArrowLeft:-1,ArrowRight:1,ArrowUp:-1,ArrowDown:1}[e.code];if(m){e.preventDefault();kbd=true;cur=(cur+m+T.length)%T.length;render()}else if(e.code==='Space'){e.preventDefault();kbd=true;pick(cur)}
    else{const d=e.code.match(/^Digit(\d)$/);if(d){const k=(+d[1]||10)-1;if(k<T.length){cur=k;pick(k)}}}});
  render();
};
