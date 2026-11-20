/* لعبة: G.math (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
const nearSet=(target,n)=>{const spread=Math.max(3,Math.round(target*.3)),s=new Set([target]);while(s.size<n){const w=target+rnd(-spread,spread);if(w>=0)s.add(w)}return[...s]};
G.math=op=>(root,c)=>quiz(root,c,{make(){
  const n=c.lv<4?3:4;let a,b,ans;
  if(op==='+'){const m=c.fi(5,100);a=rnd(1,m-1);b=rnd(1,m-a);ans=a+b}
  else if(op==='-'){const m=c.fi(5,100);a=rnd(2,m);b=rnd(1,a);ans=a-b}
  else{a=rnd(1,c.fi(2,10));b=rnd(1,c.lv<10?5:c.lv<20?10:12);ans=a*b}
  const sym={'+':'+','-':'−','x':'×'}[op];let text=`${a} ${sym} ${b} = ?`,target=ans;
  if(c.lv>=15&&Math.random()<.4){text=`${a} ${sym} ? = ${ans}`;target=b}
  return{q:`<div dir="ltr">${text}</div>`,choices:nearSet(target,n).map(v=>({html:v,ok:v===target}))}}});
