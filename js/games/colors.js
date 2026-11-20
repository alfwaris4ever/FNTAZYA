/* لعبة: G.colors (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
G.colors=(root,c)=>quiz(root,c,{make(){
  const pool=COLORS.slice(0,c.fi(4,10)),n=c.lv<3?2:c.lv<10?3:4,opts=shuffle(pool).slice(0,n),t=opts[0];
  if(c.lv>=18&&Math.random()<.5){const word=shuffle(COLORS.filter(x=>x!==t))[0];
    return{q:`<div class="stroop" style="color:${t[1]}">${word[0]}</div><div class="q-hint">ما لون الكتابة؟ (وليس الكلمة)</div>`,choices:opts.map(o=>({html:o[0],ok:o===t})),onOk:()=>speak(t[0])}}
  return{q:`<div class="blob" style="background:${t[1]}"></div><div class="q-hint">ما اسم هذا اللون؟</div>`,choices:opts.map(o=>({html:o[0],ok:o===t})),onOk:()=>speak(t[0])}}});
