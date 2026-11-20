/* لعبة: G.bnames (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 19) الأسماء والوجوه (مستوحاة من Familiar Faces) */
const FACES=['👦','👧','👨','👩','👴','👵','🧔','🧕','👮','👷','🧑‍🍳','🧑‍🚀','🧑‍⚕️','🧑‍🎨','🧑‍🌾','🤴'],NAMES=['سارة','أحمد','ليان','خالد','نورة','فهد','ريم','سلمان','هند','ماجد','جود','يوسف','لمى','عمر','دانة','بدر'];
G.bnames=(root,c)=>{const k=c.fi(2,7),F=shuffle(FACES).slice(0,k),N=shuffle(NAMES).slice(0,k);
  brainRounds(root,c,{total:c.fi(4,10),label:'أسماء صحيحة',round(area,i,done,api){
    const ask=()=>{const j=rnd(0,k-1),opts=shuffle([N[j],...shuffle(N.filter((_,q)=>q!==j)).slice(0,Math.min(3,k-1))]);area.innerHTML=`<div class="br-msg">ما اسم هذا الشخص؟</div><div class="nb-card">${F[j]}</div>`;chooseRow(area,opts,N[j],done,api);tlim(c,area,c.f(8,3),done)};
    if(i===0){area.innerHTML=`<div class="br-msg">تعرّف على الأصدقاء واحفظ أسماءهم 👋</div><div class="fc-list">${F.map((f,j)=>`<div class="fc"><span>${f}</span><b>${N[j]}</b></div>`).join('')}</div>`;c.after(ask,Math.round(k*c.f(2200,1300)+1500))}else ask()}})};
