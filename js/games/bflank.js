/* لعبة: G.bflank (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 1) سرب الطيور (مبنية على اختبار Flanker مثل Lost in Migration): اتجاه الطائر في منتصف السرب مع تجاهل البقية */
const fbPick=a=>a[Math.floor(Math.random()*a.length)];
const FB_ROT=[0,180,-90,90];
const fbBird=(k,s)=>`<svg viewBox="-50 -50 100 100" width="${s}" height="${s}" style="position:absolute;left:0;top:0;transform:translate(-50%,-50%) rotate(${FB_ROT[k]}deg);overflow:visible;filter:drop-shadow(0 4px 3px rgba(0,0,0,.25))"><path d="M-30 0 L-46 -14 L-40 0 L-46 14 Z" fill="#1d4ed8"/><path d="M4 -8 C-6 -30 -24 -44 -34 -40 C-26 -28 -18 -16 -12 -6 Z M4 8 C-6 30 -24 44 -34 40 C-26 28 -18 16 -12 6 Z" fill="#2563eb"/><ellipse cx="-6" cy="0" rx="28" ry="14" fill="#3b82f6"/><circle cx="20" cy="0" r="14" fill="#60a5fa"/><path d="M31 -7 L50 0 L31 7 Z" fill="#f97316"/><circle cx="24" cy="-6" r="3.4" fill="#fff"/><circle cx="25" cy="-6" r="1.8" fill="#0f172a"/><circle cx="24" cy="6" r="3.4" fill="#fff"/><circle cx="25" cy="6" r="1.8" fill="#0f172a"/></svg>`;
const FB_FORMS=[[[-2,0],[-1,0],[1,0],[2,0]],[[0,-2],[0,-1],[0,1],[0,2]],[[-1,0],[1,0],[0,-1],[0,1]],[[-1,-1],[1,-1],[-1,1],[1,1]]];/* بلا شكل V: رأس الـV ليس «منتصفاً» واضحاً للطفل */
const FB_BIG=[[[-2,0],[-1,0],[1,0],[2,0],[0,-1],[0,1],[0,-2],[0,2]],[[-1,-1],[1,-1],[-1,1],[1,1],[-2,0],[2,0],[0,-2],[0,2]],[[-1,0],[-2,0],[1,0],[2,0],[-1,-1],[1,-1],[-1,1],[1,1]]];
G.bflank=(root,c)=>{const tier=c.lv<10?0:c.lv<20?1:2;brainRounds(root,c,{total:c.fi(8,18),label:'إجابات صحيحة',round(area,i,done,api){
  const d=rnd(0,3),same=Math.random()<.4,fd=same?d:fbPick([0,1,2,3].filter(x=>x!==d)),rev=tier===2&&Math.random()<.35,ans=rev?[1,0,3,2][d]:d,tl=[c.f(5.5,3.5),c.f(4,2.6),c.f(3.6,2.2)][tier];
  const form=tier===2?fbPick(FB_BIG):fbPick(FB_FORMS),sz=tier===2?44:52,gap=sz*1.05,mv=tier>0;
  area.innerHTML=`<div class="br-msg">${rev?'<span style="font-size:1.5em;font-weight:900;color:#f87171">عكس!</span> اختر <u>عكس</u> اتجاه الطائر في المنتصف':'إلى أين يتّجه الطائر في <u>المنتصف</u>؟'}</div>
   <div class="fb-sky" style="position:relative;width:min(84cqw,560px);height:min(42cqh,300px);border-radius:24px;overflow:hidden;background:${rev?'linear-gradient(#fecaca,#f87171)':'linear-gradient(#bae6fd,#e0f2fe)'};box-shadow:inset 0 0 0 3px rgba(255,255,255,.35)">
    <span style="position:absolute;left:12%;top:16%;font-size:34px;opacity:.85">☁️</span><span style="position:absolute;right:10%;bottom:12%;font-size:28px;opacity:.7">☁️</span>
    <div class="fb-flock" style="position:absolute;left:50%;top:50%;transition:transform ${tl}s linear">${[[0,0],...form].map(([x,y],j)=>`<div class="fb-b" style="position:absolute">${fbBird(j===0?d:fd,sz)}</div>`).join('')}</div></div>`;
  /* مكان عشوائي للسرب داخل السماء بحيث لا يخرج منها، ومع الحركة يبقى داخلها أيضاً */
  const fl=area.querySelector('.fb-flock'),sky=area.querySelector('.fb-sky'),W=sky.clientWidth,H=sky.clientHeight,all=[[0,0],...form],pad=sz*.6;
  const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  /* المسافة بين الطيور تصغر إذا كان السرب أكبر من السماء، حتى لا يخرج أي طائر */
  const g2=Math.min(gap,(W-2*pad)/Math.max(1,x1-x0),(H-2*pad)/Math.max(1,y1-y0));[...fl.children].forEach((e,j)=>{e.style.left=all[j][0]*g2+'px';e.style.top=all[j][1]*g2+'px'});
  /* مكان عشوائي للسرب داخل السماء، ومع الحركة يبقى داخلها */
  const place=(L,lo0,hi0)=>{let lo=pad-lo0*g2,hi=L-pad-hi0*g2;const dm=mv?Math.min(Math.max(0,hi-lo)*.6,90):0,dd=dm*(Math.random()<.5?-1:1);lo+=Math.max(0,-dd);hi-=Math.max(0,dd);return hi>lo?[lo+Math.random()*(hi-lo),dd]:[(pad-lo0*g2+L-pad-hi0*g2)/2,0]};
  const [cx,dx]=place(W,x0,x1),[cy,dy]=place(H,y0,y1);fl.style.left=cx+'px';fl.style.top=cy+'px';if(dx||dy)requestAnimationFrame(()=>requestAnimationFrame(()=>fl.style.transform=`translate(${dx}px,${dy}px)`));
  dirButtons(area,4,ans,done,api);tlim(c,area,tl,done)}})};
