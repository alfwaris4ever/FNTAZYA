/* لعبة: G.letters (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* الحروف العربية الـ28: [الحرف، اسم الحرف للنطق، الكلمة، الصورة] */
const LETTERS=[['أ','ألف','أرنب','🐰'],['ب','باء','بطة','🦆'],['ت','تاء','تفاحة','🍎'],['ث','ثاء','ثعلب','🦊'],['ج','جيم','جمل','🐫'],['ح','حاء','حصان','🐴'],['خ','خاء','خروف','🐑'],
 ['د','دال','دب','🐻'],['ذ','ذال','ذرة','🌽'],['ر','راء','روبوت','🤖'],['ز','زاي','زرافة','🦒'],['س','سين','سمكة','🐟'],['ش','شين','شمس','☀️'],['ص','صاد','صاروخ','🚀'],
 ['ض','ضاد','ضفدع','🐸'],['ط','طاء','طائرة','✈️'],['ظ','ظاء','ظرف','✉️'],['ع','عين','عنب','🍇'],['غ','غين','غزال','🦌'],['ف','فاء','فيل','🐘'],['ق','قاف','قطة','🐱'],
 ['ك','كاف','كلب','🐶'],['ل','لام','ليمون','🍋'],['م','ميم','موز','🍌'],['ن','نون','نحلة','🐝'],['هـ','هاء','هدية','🎁'],['و','واو','وردة','🌹'],['ي','ياء','يد','✋']];
G.letters=(root,c)=>{
  /* مجموعة دوّارة محفوظة: تمر على الحروف الـ28 كلها قبل أن يتكرر أي حرف، ولا يتكرر حرف داخل المرحلة نفسها */
  const KEY='deck:letters',used=new Set();let deck=store.get(KEY,[]).filter(i=>i>=0&&i<LETTERS.length);
  const draw=()=>{let i;do{if(!deck.length)deck=shuffle(LETTERS.map((_,k)=>k)).filter(k=>!used.has(k));i=deck.shift()}while(used.has(i));used.add(i);store.set(KEY,deck);return LETTERS[i]};
  quiz(root,c,{make(){
    const t=draw(),n=c.lv<3?2:c.lv<12?3:4,opts=[t,...shuffle(LETTERS.filter(x=>x!==t)).slice(0,n-1)];
    if(c.lv>=8&&Math.random()<.5)return{delay:2300,
      q:`<div class="big-pic">${t[3]}</div><div class="q-word">${t[2]}</div><div class="q-hint">بأي حرف يبدأ اسمها؟</div>`,
      choices:opts.map(o=>({html:`<span class="ltr-choice">${o[0]}</span>`,ok:o===t})),
      onAnswer:()=>{root.querySelector('.q-word')?.classList.add('show');speak(`${t[2]}. يبدأ بحرف ال${t[1]}`)}};
    return{delay:2300,
      q:`<div class="big-letter">${t[0]}</div><div class="q-hint">أي صورة تبدأ بحرف «${t[0]}»؟</div>`,
      choices:opts.map(o=>({html:`<span class="pic">${o[3]}</span><span class="cap">${o[2]}</span>`,ok:o===t})),
      onShow:()=>speak(`حرف ال${t[1]}`),
      onAnswer:okBtn=>{okBtn.classList.add('show-cap');speak(t[2])}}}});
};
