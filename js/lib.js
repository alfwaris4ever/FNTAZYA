/* فنتازيا: دوال وبيانات مشتركة تستخدمها أكثر من لعبة. تعديل أي شيء هنا يؤثر على عدة ألعاب. */
/* أسئلة: عدد الأسئلة يزيد من 5 إلى 10، والمؤقت يبدأ من الدرجة 9 ويقصر تدريجياً */
function quiz(root,c,{make}){
  const total=c.fi(5,10),tl=c.lv<8?0:Math.round(c.f(22,6));let q=0,score=0,left=0,lock=true;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">❓ <b class="qn">0</b> من ${total}</span><span class="pill">⭐ <b class="sc">0</b></span></div><div class="body"${tl?' style="bottom:36px"':''}><div class="quiz"><div class="q"></div><div class="choices"></div></div></div>${tl?'<div class="tbar" role="progressbar" aria-label="الوقت المتبقي"><i></i></div>':''}`;
  const $q=root.querySelector('.q'),$ch=root.querySelector('.choices'),bar=root.querySelector('.tbar'),fill=bar?.firstElementChild;
  const paint=()=>{const p=Math.max(0,left/(tl*1000));fill.style.width=(p*100)+'%';bar.classList.toggle('low',p<=.3)};
  let endAt=0;c.resumeFns.push(dt=>{endAt+=dt});if(tl)c.every(()=>{if(lock)return;left=endAt-performance.now();paint();if(left<=0)answer(null,false)},100);
  let cur;
  function answer(btn,ok){lock=true;
    if(ok){btn.classList.add('ok');score++;root.querySelector('.sc').textContent=score;sfx.good();cur.onOk?.()}
    else{btn?.classList.add('bad');sfx.bad();$ch.querySelector('[data-ok]').classList.add('ok')}
    cur.onAnswer?.($ch.querySelector('[data-ok]'));c.after(next,cur.delay||1100)}
  function next(){if(q>=total)return c.win(score*10,score===total?'كل إجاباتك صحيحة! 🌟':(total-score===1?'أخطأت في سؤال واحد':total-score===2?'أخطأت في سؤالين':`أخطأت في ${total-score} أسئلة`),{got:score,total,perfect:score===total,label:'إجابات صحيحة'});
    q++;root.querySelector('.qn').textContent=q;cur=make();$q.innerHTML=cur.q;$ch.innerHTML='';$ch.className='choices n'+cur.choices.length;
    shuffle(cur.choices).forEach(ch=>{const b=h(`<button class="choice"${ch.ok?' data-ok':''}>${ch.html}</button>`);b.onclick=()=>{if(!lock)answer(b,ch.ok)};$ch.append(b)});
    left=tl*1000;endAt=performance.now()+left;if(tl)paint();lock=false;cur.onShow?.()}
  next();
}
const COLORS=[['أحمر','#ef4444'],['أزرق','#3b82f6'],['أخضر','#22c55e'],['أصفر','#facc15'],['برتقالي','#f97316'],['بنفسجي','#a855f7'],['وردي','#ec4899'],['بني','#8b5a2b'],['أسود','#1f2937'],['رمادي','#9ca3af']];
/* ================= حزمة الألعاب الأشهر (مستوحاة من أكثر ألعاب بوكي لعباً) ================= */
const isTouch=()=>matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const EMF='"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
function emo(x,ch,X,Y,s,rot){x.save();x.translate(X,Y);if(rot)x.rotate(rot);x.font=`${s}px ${EMF}`;x.textAlign='center';x.textBaseline='middle';x.fillText(ch,0,s*.06);x.restore()}
function txt(x,t,X,Y,s,col='#1d2350'){x.save();x.font=`800 ${s}px system-ui,Tahoma,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=s/4;x.strokeStyle='#fff';x.strokeText(t,X,Y);x.fillStyle=col;x.fillText(t,X,Y);x.restore()}
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
const GKEYS=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD','KeyF','KeyX','KeyG','ShiftRight','Slash','Period']);
/* ساحة لعب بلوحة رسم ثابتة الأبعاد المنطقية، تتكيف مع أي شاشة */
function arena(root,c,o){
  root.innerHTML=`<div class="hud">${c.tag}${o.hud||''}</div><div class="body ar-body"${o.tbar?' style="bottom:36px"':''}><canvas class="ar-cv"></canvas></div>`;
  const body=root.querySelector('.ar-body'),cv=body.firstElementChild,x=cv.getContext('2d');
  const A={x,cv,root,W:o.W,H:o.H,sc:1,keys:new Set(),ptr:{x:o.W/2,y:o.H/2,down:false,on:false},alive:true,t:0,
    q:s=>root.querySelector(s),set(s,v){const e=root.querySelector(s);if(e)e.textContent=v}};
  A.size=()=>{const r=body.getBoundingClientRect();if(r.width<10||r.height<10)return;if(o.flex)A.H=Math.round(clamp(A.W*r.height/r.width,A.W*o.flex[0],A.W*o.flex[1]));
    A.sc=Math.min(r.width/A.W,r.height/A.H);const d=Math.min(2,devicePixelRatio||1);cv.style.width=A.W*A.sc+'px';cv.style.height=A.H*A.sc+'px';
    cv.width=Math.round(A.W*A.sc*d);cv.height=Math.round(A.H*A.sc*d);x.setTransform(A.sc*d,0,0,A.sc*d,0,0);o.onSize?.(A)};
  c.on(window,'resize',A.size);A.size();requestAnimationFrame(A.size);
  c.on(window,'keydown',e=>{if(!A.alive||c.paused)return;if(GKEYS.has(e.code))e.preventDefault();if(!A.keys.has(e.code)){A.keys.add(e.code);o.onKey?.(e.code)}});
  c.on(window,'keyup',e=>A.keys.delete(e.code));c.on(window,'blur',()=>A.keys.clear());
  const P=e=>{const r=cv.getBoundingClientRect();A.ptr.x=(e.clientX-r.left)/A.sc;A.ptr.y=(e.clientY-r.top)/A.sc};
  c.on(cv,'pointerdown',e=>{if(!A.alive||c.paused)return;P(e);A.ptr.down=A.ptr.on=true;try{cv.setPointerCapture(e.pointerId)}catch{}o.onDown?.(A.ptr)});
  c.on(cv,'pointermove',e=>{P(e)});
  const up=()=>{if(A.ptr.down){A.ptr.down=false;o.onUp?.(A.ptr)}};c.on(cv,'pointerup',up);c.on(cv,'pointercancel',up);
  if(o.pads&&isTouch()){const w=h('<div class="tpads"><div class="tp-l"></div><div class="tp-r"></div></div>');
    o.pads.forEach(p=>{const b=h(`<button class="tpad${p.big?' big':''}" aria-label="${p.a||''}">${p.l}</button>`);
      b.onpointerdown=e=>{e.preventDefault();b.classList.add('on');A.keys.add(p.k);o.onKey?.(p.k)};
      const u=()=>{b.classList.remove('on');A.keys.delete(p.k)};b.onpointerup=u;b.onpointerleave=u;b.onpointercancel=u;
      w.querySelector(p.side==='r'?'.tp-r':'.tp-l').append(b)});root.append(w)}
  A.k=(...ks)=>ks.some(k=>A.keys.has(k));
  A.loop=fn=>{let last=performance.now();const f=t=>{if(!A.alive||!cur||cur.c!==c)return;const dt=Math.min(.035,Math.max(0,(t-last)/1000));last=t;if(!c.paused){A.t+=dt;fn(dt)}requestAnimationFrame(f)};requestAnimationFrame(f)};
  A.win=(s,m,r)=>{if(!A.alive)return;A.alive=false;c.win(s,m,r)};A.lose=(m,r)=>{if(!A.alive)return;A.alive=false;c.lose(m,r)};
  return A}
/* زر وضع اللاعبَين */
const twoOn=()=>!!(curGame&&store.get('two:'+curGame.id,false));
const twoBtn=(solo='🤖 ضد الكمبيوتر')=>`<button class="pill two-btn" data-two title="اضغط للتبديل بين اللعب وحدك واللعب مع صديق">${twoOn()?'👥 لاعبان':solo} ⇄</button>`;
function bindTwo(root,c){const b=root.querySelector('[data-two]');if(b)b.onclick=()=>{store.set('two:'+curGame.id,!twoOn());startGame(curGame,c.run.diff,c.run.stage)}}
const DP1=[{k:'KeyA',l:'⬅️',side:'l'},{k:'KeyW',l:'⬆️',side:'l'},{k:'KeyS',l:'⬇️',side:'l'},{k:'KeyD',l:'➡️',side:'l'}];
const DP2=[{k:'ArrowLeft',l:'⬅️',side:'r'},{k:'ArrowUp',l:'⬆️',side:'r'},{k:'ArrowDown',l:'⬇️',side:'r'},{k:'ArrowRight',l:'➡️',side:'r'}];
const dirOf=(A,set)=>set===1?[(A.k('KeyD')?1:0)-(A.k('KeyA')?1:0),(A.k('KeyS')?1:0)-(A.k('KeyW')?1:0)]:set===2?[(A.k('ArrowRight')?1:0)-(A.k('ArrowLeft')?1:0),(A.k('ArrowDown')?1:0)-(A.k('ArrowUp')?1:0)]
  :[(A.k('ArrowRight','KeyD')?1:0)-(A.k('ArrowLeft','KeyA')?1:0),(A.k('ArrowDown','KeyS')?1:0)-(A.k('ArrowUp','KeyW')?1:0)];
/* ---------- سيارات: فيزياء سيارة من الأعلى ---------- */
function carMove(o,dt,thr,steer,vmax){o.v+=thr*(o.v*thr<0?900:560)*dt;o.v-=o.v*1.1*dt;o.v=clamp(o.v,-vmax*.45,vmax);o.a+=steer*3.2*dt*clamp(o.v/140,-1,1);o.x+=Math.cos(o.a)*o.v*dt;o.y+=Math.sin(o.a)*o.v*dt}
function steerTo(o,tx,ty){const d=angDiff(o.a,Math.atan2(ty-o.y,tx-o.x)),far=Math.hypot(tx-o.x,ty-o.y);if(far<14)return[0,0];
  if(Math.abs(d)>2.3&&far<150)return[-1,-clamp(d*3,-1,1)];return[Math.abs(d)>1.3?.45:1,clamp(d*3,-1,1)]}
function playerCar(A,o,cx=0,cy=0){if(A.ptr.down)return steerTo(o,A.ptr.x+cx,A.ptr.y+cy);return[(A.k('ArrowUp','KeyW')?1:0)-(A.k('ArrowDown','KeyS')?1:0),(A.k('ArrowRight','KeyD')?1:0)-(A.k('ArrowLeft','KeyA')?1:0)]}
function drawCar(x,o,col,deco){x.save();x.translate(o.x,o.y);x.rotate(o.a);x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.roundRect(-23,-12,52,30,9);x.fill();
  x.fillStyle='#222';[[-19,-18],[9,-18],[-19,14],[9,14]].forEach(([a,b])=>{x.beginPath();x.roundRect(a,b,12,5,2);x.fill()});
  x.fillStyle=col;x.beginPath();x.roundRect(-26,-15,52,30,10);x.fill();x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.roundRect(-22,-11,14,22,5);x.fill();
  x.fillStyle='#bfe3ff';x.beginPath();x.roundRect(3,-11,12,22,4);x.fill();x.fillStyle='#ffe066';x.fillRect(23,-12,3,6);x.fillRect(23,6,3,6);
  if(deco==='police'){const on=(performance.now()/180|0)%2;x.fillStyle=on?'#ef4444':'#3b82f6';x.fillRect(-8,-9,7,8);x.fillStyle=on?'#3b82f6':'#ef4444';x.fillRect(-8,1,7,8)}
  if(deco==='thief'){x.rotate(-o.a);emo(x,'💰',0,0,18)}x.restore()}
function hintTxt(A,x,t){if(A.t<4){x.globalAlpha=Math.min(1,4-A.t);txt(x,t,A.W/2,A.H-40,Math.min(26,A.W*1.5/t.length));x.globalAlpha=1}}
/* ---------- ألعاب لاعبَين (ضد الكمبيوتر أو لاعبان على نفس الجهاز) ---------- */
const P1K={l:'KeyA',r:'KeyD',u:'KeyW',d:'KeyS',a:'Space'},P2K={l:'ArrowLeft',r:'ArrowRight',u:'ArrowUp',d:'ArrowDown',a:'Slash'};
/* ---------- تلبيس وتجميل ---------- */
const PAL=[['أحمر','#ef4444'],['أزرق','#3b82f6'],['أخضر','#22c55e'],['أصفر','#facc15'],['وردي','#ec4899'],['بنفسجي','#a855f7'],['برتقالي','#f97316'],['أبيض','#f1f5f9'],['أسود','#1f2937'],['تركواز','#14b8a6']];
const HCOL=['#2b1b12','#6b3e1f','#c08a3e','#ec4899','#3b82f6','#a855f7'],SKINS=['#f8d5b8','#eab68f','#c68642','#8d5524'];
const D_OPT={'top.s':[['tee','👕 قصير'],['long','👚 طويل'],['hoodie','🧥 هودي'],['jacket','🧥 جاكيت']],'bot.s':[['pants','👖 بنطال'],['skirt','👗 تنورة'],['wide','👖 واسع']],
  'shoes.s':[['sneaker','👟 رياضي'],['boot','🥾 جزمة'],['sandal','🩴 صندل']],'hair.s':[['short','قصير'],['long','طويل'],['pony','ذيل حصان'],['curly','مجعّد'],['hijab','🧕 حجاب']],'acc':[['','بدون'],['👑','👑'],['🎀','🎀'],['👓','👓'],['🌸','🌸'],['🧢','🧢']]};
const ACC_POS={'👑':[100,50,40],'🎀':[136,64,30],'👓':[100,102,42],'🌸':[64,66,28],'🧢':[100,58,56]};
function doll(o,head){const sk=o.skin,hs=o['hair.s'],hc=o['hair.c'],ts=o['top.s'],tc=o['top.c'],bs=o['bot.s'],bc=o['bot.c'],ss=o['shoes.s'],sc=o['shoes.c'];
  let s=`<svg viewBox="${head?'38 24 124 150':'0 0 200 380'}" class="doll" xmlns="http://www.w3.org/2000/svg">`;
  if(hs==='long')s+=`<path d="M56 100 Q54 40 100 44 Q146 40 144 100 L150 ${o.cut?150:200} Q100 ${o.cut?160:215} 50 ${o.cut?150:200}Z" fill="${hc}"/>`;
  if(hs==='pony')s+=`<path d="M134 78 Q174 88 162 172 Q150 140 132 118Z" fill="${hc}"/>`;
  if(hs==='curly')for(const[a,b]of[[58,108],[58,136],[142,108],[142,136],[64,160],[136,160]])s+=`<circle cx="${a}" cy="${b}" r="16" fill="${hc}"/>`;
  if(hs==='hijab')s+=`<path d="M52 100 Q50 38 100 38 Q150 38 148 100 L162 196 Q100 214 38 196Z" fill="${hc}"/>`;
  if(!head){const long=ts!=='tee';
    s+=`<rect x="78" y="236" width="18" height="122" rx="8" fill="${sk}"/><rect x="104" y="236" width="18" height="122" rx="8" fill="${sk}"/>`;
    s+=bs==='skirt'?`<path d="M72 230 H128 L150 352 H50Z" fill="${bc}"/>`:bs==='wide'?`<path d="M70 230 H130 L142 352 H104 L100 282 L96 352 H58Z" fill="${bc}"/>`:`<path d="M70 230 H130 L127 352 H104 L100 268 L96 352 H73Z" fill="${bc}"/>`;
    s+=ss==='boot'?`<rect x="72" y="326" width="26" height="40" rx="7" fill="${sc}"/><rect x="102" y="326" width="26" height="40" rx="7" fill="${sc}"/>`
      :ss==='sandal'?`<rect x="70" y="358" width="30" height="8" rx="4" fill="${sc}"/><rect x="100" y="358" width="30" height="8" rx="4" fill="${sc}"/><rect x="78" y="348" width="14" height="7" rx="3" fill="${sc}"/><rect x="108" y="348" width="14" height="7" rx="3" fill="${sc}"/>`
      :`<rect x="67" y="348" width="33" height="18" rx="9" fill="${sc}"/><rect x="100" y="348" width="33" height="18" rx="9" fill="${sc}"/><rect x="69" y="360" width="29" height="5" rx="2" fill="#fff"/><rect x="102" y="360" width="29" height="5" rx="2" fill="#fff"/>`;
    for(const[x0,r]of[[46,8],[136,-8]])s+=`<g transform="rotate(${r} ${x0+9} 152)"><rect x="${x0}" y="150" width="18" height="96" rx="9" fill="${sk}"/><rect x="${x0-1}" y="148" width="20" height="${long?90:38}" rx="9" fill="${tc}"/></g>`;
    s+=`<path d="M60 152 Q100 136 140 152 L132 238 H68Z" fill="${tc}"/>`;
    if(ts==='hoodie')s+=`<path d="M78 146 Q100 174 122 146" stroke="rgba(0,0,0,.25)" stroke-width="5" fill="none"/><rect x="82" y="200" width="36" height="22" rx="7" fill="rgba(0,0,0,.14)"/>`;
    if(ts==='jacket')s+=`<line x1="100" y1="150" x2="100" y2="238" stroke="rgba(0,0,0,.3)" stroke-width="3"/><circle cx="107" cy="178" r="3.5" fill="#fff"/><circle cx="107" cy="204" r="3.5" fill="#fff"/><path d="M86 145 L100 172 L114 145Z" fill="rgba(255,255,255,.55)"/>`;
    if(ts==='tee')s+=`<path d="M86 146 Q100 160 114 146" stroke="rgba(0,0,0,.2)" stroke-width="3" fill="none"/>`;
    if(ts==='long')s+=`<rect x="68" y="226" width="64" height="8" fill="rgba(0,0,0,.12)"/>`}
  if(hs!=='hijab')s+=`<rect x="90" y="126" width="20" height="28" fill="${sk}"/>`;
  s+=`<circle cx="100" cy="98" r="40" fill="${sk}"/>`;
  s+=o.mask?`<circle cx="86" cy="99" r="9" fill="#86efac" stroke="#16a34a" stroke-width="3"/><circle cx="114" cy="99" r="9" fill="#86efac" stroke="#16a34a" stroke-width="3"/>`
    :`<circle cx="86" cy="100" r="5.5" fill="#1d2350"/><circle cx="114" cy="100" r="5.5" fill="#1d2350"/><circle cx="88" cy="98" r="1.8" fill="#fff"/><circle cx="116" cy="98" r="1.8" fill="#fff"/>`;
  s+=`<circle cx="75" cy="113" r="6" fill="#f9a8d4" opacity=".7"/><circle cx="125" cy="113" r="6" fill="#f9a8d4" opacity=".7"/><path d="M88 117 Q100 128 112 117" stroke="#b4235a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  if(hs==='short')s+=`<path d="M58 98 Q55 50 100 52 Q145 50 142 98 Q132 70 100 72 Q68 70 58 98Z" fill="${hc}"/>`;
  else if(hs==='hijab')s+=`<path d="M58 104 Q56 48 100 46 Q144 48 142 104 Q140 66 100 62 Q60 66 58 104Z" fill="${hc}"/><path d="M60 118 Q100 162 140 118 L148 156 Q100 180 52 156Z" fill="${hc}"/>`;
  else{s+=`<path d="M58 100 Q55 48 100 50 Q145 48 142 100 Q134 68 114 68 Q100 82 84 70 Q66 74 58 100Z" fill="${hc}"/>`;if(hs==='curly')for(const a of[66,82,100,118,134])s+=`<circle cx="${a}" cy="${a===100?50:56}" r="13" fill="${hc}"/>`}
  if(o.messy)s+=`<path d="M60 66 l9 -16 l7 13 l9 -18 l8 15 l10 -17 l8 14 l10 -16 l9 15" stroke="${hc}" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="M62 84 l-12 -8 M138 84 l12 -8" stroke="${hc}" stroke-width="6"/>`;
  const ap=ACC_POS[o.acc];if(ap)s+=`<text x="${ap[0]}" y="${ap[1]}" font-size="${ap[2]}" text-anchor="middle" dominant-baseline="middle">${o.acc}</text>`;
  if(o.bub)s+=[[70,50],[120,44],[140,80],[58,80],[96,36]].map(([a,b])=>`<text x="${a}" y="${b}" font-size="22" text-anchor="middle">🫧</text>`).join('');
  if(o.shine)s+=`<text x="146" y="44" font-size="24">✨</text>`;
  return s+'</svg>'}
/* ================= ألعاب جديدة: باكمان + الألعاب التي كانت «قريباً» ================= */
const fxPt=(A,X,Y)=>{const r=A.cv.getBoundingClientRect();FX.lastTap={x:r.left+X*A.sc,y:r.top+Y*A.sc,t:performance.now()}};
const PADS4=[{k:'ArrowLeft',l:'⬅️',side:'l'},{k:'ArrowRight',l:'➡️',side:'l'},{k:'ArrowUp',l:'⬆️',side:'r'},{k:'ArrowDown',l:'⬇️',side:'r'}];
const DIRK={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],KeyA:[-1,0],KeyD:[1,0],KeyW:[0,-1],KeyS:[0,1]};
function heartsPill(n){return n>0?'❤️'.repeat(n):'💔'}
/* ================= ألعاب الذاكرة والتركيز والذكاء (مستوحاة من فكرة تطبيقات تدريب الدماغ) ================= */
function brainRounds(root,c,{total,label,round,extra=''}){let i=0,ok=0,bad=0,onKey=null;const allow=c.lv<10?3:c.lv<20?2:1;
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">🎯 <b class="br-i">1</b> من ${total}</span><span class="pill">✅ <b class="br-ok">0</b></span><span class="pill">❌ <b class="br-bad">0</b> من ${allow}</span>${extra}</div><div class="body"><div class="br-area"></div></div>`;
  const area=root.querySelector('.br-area');c.on(window,'keydown',e=>{if(!c.paused&&onKey)onKey(e)});
  const api={setKey:f=>onKey=f};
  function next(){onKey=null;if(i>=total)return c.win(ok*10+(allow-bad)*15,ok===total?'تركيز خارق! 🧠':`أجبت ${ok} من ${total} صحيح`,{got:ok,total,perfect:ok===total,label});
    root.querySelector('.br-i').textContent=i+1;let fired=false;area.classList.remove('br-in');void area.offsetWidth;area.classList.add('br-in');
    round(area,i,res=>{if(fired)return;fired=true;onKey=null;if(res){ok++;sfx.good()}else{bad++;sfx.bad()}root.querySelector('.br-ok').textContent=ok;root.querySelector('.br-bad').textContent=bad;i++;
      if(bad>allow)return c.after(()=>c.lose('أخطاء كثيرة! ركّز أكثر وجرّب مرة ثانية',{got:ok,total,label}),900);c.after(next,res?700:1100)},api)}
  next()}
const timerBar=(sec)=>`<div class="br-tm" style="--t:${sec}s"><i></i></div>`;
/* ================= حزمة الذكاء 2: 20 لعبة تدريب دماغ إضافية ================= */
function ynRow(area,match,done,api){const d=h(`<div class="yn"><button class="yn-b yes">✔ نعم</button><button class="yn-b no">✖ لا</button></div>`);area.append(d);let a=false;
  const ans=y=>{if(a)return;a=true;d.querySelector(y?'.yes':'.no').classList.add(y===match?'ok':'bad');done(y===match)};
  d.querySelector('.yes').onclick=()=>ans(true);d.querySelector('.no').onclick=()=>ans(false);api&&api.setKey(e=>{if(e.key==='ArrowRight')ans(true);if(e.key==='ArrowLeft')ans(false)})}
function chooseRow(area,vals,ans,done,api,fmt=v=>v,cls=''){const box=h(`<div class="ch-row ${cls}"></div>`);area.append(box);let a=false;
  const pick=k=>{if(a)return;a=true;const ok=vals[k]===ans;box.children[k].classList.add(ok?'ok':'bad');if(!ok)box.children[vals.indexOf(ans)]?.classList.add('ok');done(ok)};
  vals.forEach((v,k)=>{const b=h(`<button class="choice">${fmt(v)}</button>`);b.onclick=()=>pick(k);box.append(b)});api&&api.setKey(e=>{const n=+e.key;if(n>=1&&n<=vals.length)pick(n-1)});return box}
const tlim=(c,area,sec,done)=>{area.append(h(timerBar(sec.toFixed(2))));c.after(()=>done(false),sec*1000)};
const nearOpts=(ans,n=4,lo=0)=>{const s=new Set([ans]);let g=0;while(s.size<n&&g++<200){const v=ans+rnd(-Math.max(3,Math.round(ans*.3)),Math.max(3,Math.round(ans*.3)));if(v>=lo)s.add(v)}return shuffle([...s])};
const EMO=['🍎','🍌','🍇','🍓','🍉','🍍','🥝','🍒','🐶','🐱','🐰','🦊','🐼','🐸','🐵','🦁','🐯','🐨','🚗','🚀','⚽','🎈','🎁','🌟','🌙','☀️','🌈','🍦','🍩','🧸','🎨','🎸','📚','⏰','🔑','🌻','🍄','🐢','🐙','🦋'];
const LDIR=[[1,0,'➡️'],[-1,0,'⬅️'],[0,-1,'⬆️'],[0,1,'⬇️']],KDIR={ArrowRight:0,ArrowLeft:1,ArrowUp:2,ArrowDown:3};
function dirButtons(area,n,ansIdx,done,api){const box=h(`<div class="dir-btns n${n}" dir="ltr"></div>`);area.append(box);let a=false;const order=n===2?[1,0]:[1,2,3,0];
  const pick=k=>{if(a)return;a=true;box.querySelector(`[data-k="${k}"]`).classList.add(k===ansIdx?'ok':'bad');if(k!==ansIdx)box.querySelector(`[data-k="${ansIdx}"]`)?.classList.add('ok');done(k===ansIdx)};
  order.forEach(k=>{const b=h(`<button class="yn-b dir" data-k="${k}">${LDIR[k][2]}</button>`);b.onclick=()=>pick(k);box.append(b)});api.setKey(e=>{const k=KDIR[e.key];if(k!==undefined&&(n===4||k<2))pick(k)})}
