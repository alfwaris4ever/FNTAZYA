/* لعبة: G.ttt (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
G.ttt=(root,c)=>{
  const rand=Math.max(0,c.f(.65,-.05)),smart=c.lv>=8,need=c.lv<20?2:3,compStarts=c.lv>=12;let b=Array(9).fill(''),busy=false,sx=0,so=0,round=1;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">😀 ❌ <b class="sx">0</b> من ${need}</span><span class="pill">🤖 ⭕ <b class="so">0</b></span><span class="pill msg">دورك!</span></div><div class="body"><div class="ttt"></div></div>`;
  const grid=root.querySelector('.ttt'),msg=t=>root.querySelector('.msg').textContent=t;
  const cells=[...Array(9)].map((_,i)=>{const d=h(`<button class="cell" aria-label="خانة ${i+1}"></button>`);d.onclick=()=>move(i);grid.append(d);return d});
  const WL=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const line=(bb,p)=>WL.find(l=>l.every(i=>bb[i]===p));
  const empt=bb=>bb.map((v,i)=>v?-1:i).filter(i=>i>=0);
  function mm(bb,p){if(line(bb,'o'))return{s:10};if(line(bb,'x'))return{s:-10};const e=empt(bb);if(!e.length)return{s:0};let best=null;
    for(const i of e){bb[i]=p;const s=mm(bb,p==='o'?'x':'o').s*.9;bb[i]='';if(!best||(p==='o'?s>best.s:s<best.s))best={s,i}}return best}
  function ai(){const e=empt(b);if(Math.random()<rand)return e[rnd(0,e.length-1)];if(smart)return mm(b,'o').i;
    for(const p of['o','x'])for(const i of e){b[i]=p;const w=line(b,p);b[i]='';if(w)return i}return !b[4]?4:e[rnd(0,e.length-1)]}
  const put=(i,p)=>{b[i]=p;cells[i].textContent=p==='x'?'❌':'⭕';cells[i].classList.add('on')};
  function check(){
    for(const p of['x','o']){const l=line(b,p);if(l){l.forEach(i=>cells[i].classList.add('win'));
      if(p==='x'){sx++;root.querySelector('.sx').textContent=sx;sfx.good();msg('🎉 فزت بالجولة!')}else{so++;root.querySelector('.so').textContent=so;sfx.bad();msg('🤖 فاز الكمبيوتر')}
      return roundOver()}}
    if(!empt(b).length){msg('🤝 تعادل');return roundOver()}return false}
  function roundOver(){busy=true;c.after(()=>{
    if(sx===need)return c.win(sx*15+(need-so)*10,'فزت على الكمبيوتر! 🏆',{got:sx,total:need,perfect:true,label:'جولات الفوز'});
    if(so===need)return c.lose(`الكمبيوتر فاز بـ ${need} جولات`,{got:sx,total:need,label:'جولات الفوز'});
    b=Array(9).fill('');cells.forEach(x=>{x.textContent='';x.className='cell'});round++;
    if(compStarts&&round%2===0){msg('🤖 يبدأ...');c.after(()=>{put(ai(),'o');busy=false;msg('دورك!')},500)}else{busy=false;msg('دورك!')}},1300);return true}
  function move(i){if(busy||b[i])return;put(i,'x');sfx.pop();if(check())return;busy=true;msg('🤖 يفكر...');
    c.after(()=>{put(ai(),'o');beep(420,.08);busy=false;if(!check())msg('دورك!')},550)}
};
