/* لعبة: G.bcount (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 4) عدّ سريع: كم عدد الأشياء التي ظهرت؟ */
const CNT=[['🍎','🍐'],['⭐','🌙'],['🐟','🐠'],['🎈','🪁'],['🚗','🚕']];
G.bcount=(root,c)=>brainRounds(root,c,{total:c.fi(5,10),label:'إجابات صحيحة',round(area,i,done){
  const[tg,dis]=CNT[rnd(0,CNT.length-1)],n=c.fi(3,13)+rnd(0,2),nd=c.lv<10?0:c.fi(0,6),flash=Math.round(c.f(2400,800));
  const pts=[];const place=()=>{for(let t=0;t<60;t++){const p=[rnd(8,92),rnd(10,88)];if(pts.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>13))return p}return[rnd(8,92),rnd(10,88)]};
  const items=[...Array(n)].map(()=>[tg,place()]).concat([...Array(nd)].map(()=>[dis,place()]));items.forEach(it=>pts.push(it[1]));
  area.innerHTML=`<div class="br-msg">كم ${tg} تراه؟ ركّز!</div><div class="cn-box">${items.map(([e,[x,y]])=>`<span style="left:${x}%;top:${y}%">${e}</span>`).join('')}</div><div class="cn-opts"></div>`;
  c.after(()=>{area.querySelector('.cn-box').classList.add('hide');area.querySelector('.br-msg').textContent=`كم ${tg} كان؟`;
    const s=new Set([n]);while(s.size<4){const v=n+rnd(-3,3);if(v>0)s.add(v)}const box=area.querySelector('.cn-opts');let ans=false;
    [...s].sort((a,b)=>a-b).forEach(v=>{const b=h(`<button class="choice">${v}</button>`);b.onclick=()=>{if(ans)return;ans=true;b.classList.add(v===n?'ok':'bad');if(v!==n)[...box.children].find(x=>+x.textContent===n).classList.add('ok');area.querySelector('.cn-box').classList.remove('hide');done(v===n)};box.append(b)})},flash)}});
