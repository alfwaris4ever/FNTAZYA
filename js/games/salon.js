/* لعبة: G.salon (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 24) صالون التجميل — مستوحاة من Beauty Salon */
const TOOLS=[['wash','🧴','غسيل'],['comb','🪮','تمشيط'],['dry','💨','تجفيف'],['color','🎨','صبغ'],['acc','🎀','زينة'],['mask','🥒','قناع'],['cut','✂️','قص']];
G.salon=(root,c)=>{
  const nC=c.fi(2,4),pool=TOOLS.slice(0,c.lv<10?5:7),tl=c.lv>=10?Math.round(nC*c.f(30,14)):0;let ci=0,step=0,miss=0,done=0,total=0,order,look,picker=null;
  const custs=[...Array(nC)].map(()=>{let st=shuffle(pool).slice(0,c.fi(2,5)).map(t=>({t:t[0],e:t[1],n:t[2]}));const w=st.findIndex(s=>s.t==='wash'),d=st.findIndex(s=>s.t==='dry');if(w>=0&&d>=0&&d<w)[st[w],st[d]]=[st[d],st[w]];
    st.forEach(s=>{if(s.t==='color')s.v=HCOL[rnd(2,5)];if(s.t==='acc')s.v=['👑','🎀','🌸','👓'][rnd(0,3)]});total+=st.length;return st});
  root.innerHTML=`<div class="hud">${c.tag}<span class="pill">💇 <b class="cn">1</b> من ${nC}</span><span class="pill">❌ <b class="ms">0</b></span></div><div class="body"${tl?' style="bottom:36px"':''}><div class="sl-wrap"><div class="sl-chair"><div class="sl-doll"></div></div><div class="sl-side"><div class="sl-order"></div><div class="sl-tools"></div><div class="sl-pick"></div></div></div></div>`;
  const q=s=>root.querySelector(s),wrap=q('.sl-wrap');
  function newC(){order=custs[ci];step=0;look={skin:SKINS[rnd(0,3)],'hair.s':['long','pony','curly','short'][rnd(0,3)],'hair.c':HCOL[rnd(0,2)],messy:true,acc:'',cut:false};q('.cn').textContent=ci+1;draw()}
  function draw(){q('.sl-doll').innerHTML=doll(look,true);
    q('.sl-order').innerHTML=`<small>طلب الزبونة</small><div>${order.map((s,k)=>`<span class="sl-st${k<step?' ok':k===step?' now':''}">${s.e}${s.v?(s.t==='color'?`<i style="background:${s.v}"></i>`:`<b>${s.v}</b>`):''}</span>`).join('<em>←</em>')}</div>`;
    q('.sl-tools').innerHTML=pool.map(([t,e,n],k)=>`<button class="sl-tool" data-t="${t}"><span>${e}</span><small>${n}</small></button>`).join('');
    q('.sl-tools').querySelectorAll('button').forEach(b=>b.onclick=()=>use(b.dataset.t,b));
    q('.sl-pick').innerHTML=picker?`<small>${picker==='color'?'اختر اللون':'اختر الزينة'}</small><div>${(picker==='color'?HCOL.slice(2):['👑','🎀','🌸','👓']).map(v=>`<button class="sl-pv" data-v="${v}" ${picker==='color'?`style="background:${v}"`:''}>${picker==='color'?'':v}</button>`).join('')}</div>`:'';
    q('.sl-pick').querySelectorAll('button').forEach(b=>b.onclick=()=>choose(b.dataset.v,b))}
  const res=()=>({got:Math.max(0,done-miss),total,label:'خطوات صحيحة'});
  function wrong(el){miss++;q('.ms').textContent=miss;sfx.bad();el?.classList.add('shake');setTimeout(()=>el?.classList.remove('shake'),400)}
  function use(t,el){if(picker||step>=order.length)return;const s=order[step];if(!s||s.t!==t)return wrong(el);if(t==='color'||t==='acc'){picker=t;sfx.pop();return draw()}apply(s)}
  function choose(v,el){const s=order[step];if(!picker||!s)return;if(v!==s.v)return wrong(el);picker=null;apply(s)}
  function apply(s){if(s.t==='wash'){look.bub=true}if(s.t==='dry'){look.bub=false}if(s.t==='comb')look.messy=false;if(s.t==='color')look['hair.c']=s.v;if(s.t==='acc')look.acc=s.v;if(s.t==='mask')look.mask=true;if(s.t==='cut'){look.cut=true;if(look['hair.s']==='long')look['hair.s']='short'}
    step++;done++;sfx.good();if(step>=order.length){look.mask=false;look.bub=false;look.messy=false;look.shine=true;draw();c.after(()=>{ci++;if(ci>=nC)return miss===0?c.win(total*10,'كل الزبونات سعيدات! 💇‍♀️✨',{...res(),perfect:true}):c.win(Math.max(0,total*10-miss*10),`أخطأت ${miss} ${miss>2?'مرات':'مرة'}`,res());newC()},1100)}else draw()}
  c.on(window,'keydown',e=>{if(c.paused)return;const d=e.code.match(/^Digit(\d)$/);if(!d)return;const k=+d[1]-1;if(picker){const b=q('.sl-pick').querySelectorAll('button')[k];b?.click()}else{const b=q('.sl-tools').querySelectorAll('button')[k];b?.click()}});
  function size(){const r=wrap.parentElement.getBoundingClientRect();wrap.classList.toggle('land',r.width>r.height*1.05)}c.on(window,'resize',size);size();
  if(tl)c.timeBar(root,tl,()=>done>=total/2?c.win(done*10,'انتهى الوقت',res()):c.lose('انتهى الوقت',res()));newC();
};
