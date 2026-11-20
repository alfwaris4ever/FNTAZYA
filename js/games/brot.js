/* لعبة: G.brot (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 4) الدوران الذهني (مستوحاة من Rotation Matrix) */
const rotG=(g,n)=>{const r=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)r.push(g[(n-1-x)*n+y]);return r},mirG=(g,n)=>{const r=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)r.push(g[y*n+(n-1-x)]);return r};
G.brot=(root,c)=>brainRounds(root,c,{total:c.fi(6,14),label:'إجابات صحيحة',round(area,i,done,api){
  const n=c.lv<12?3:4;let g;const eq=(a,b)=>a.every((v,k)=>v===b[k]);
  do{g=[...Array(n*n)].map(()=>Math.random()<.45?1:0)}while(g.filter(Boolean).length<3||(()=>{let r=g;for(let k=0;k<4;k++){if(eq(r,mirG(g,n)))return true;r=rotG(r,n)}return false})());
  let b=g;for(let k=0,t=rnd(1,3);k<t;k++)b=rotG(b,n);const same=Math.random()<.5;if(!same)b=mirG(b,n);
  const grid=(x,col)=>`<div class="rt-g" style="--n:${n}">${x.map(v=>`<i${v?` style="background:${col}"`:''}></i>`).join('')}</div>`;
  area.innerHTML=`<div class="br-msg">هل الشكل الثاني هو نفس الأول بعد تدويره؟ (وليس مقلوباً كالمرآة)</div><div class="rt-wrap" dir="ltr">${grid(g,'#f472b6')}<span>↻</span>${grid(b,'#60a5fa')}</div>`;
  ynRow(area,same,done,api);tlim(c,area,c.f(14,5),done)}});
