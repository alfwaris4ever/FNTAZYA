/* لعبة: G.bpattern (ملف مستقل). أي دالة أو بيانات هنا خاصة بهذه اللعبة فقط. */
/* 9) أكمل النمط (مستوحاة من LogiLadder) */
G.bpattern=(root,c)=>brainRounds(root,c,{total:c.fi(6,12),label:'أنماط صحيحة',round(area,i,done,api){
  let seq,ans,opts,fmt=v=>v;
  if(c.lv<10||Math.random()<.35){const S=shuffle(['🔴','🔵','🟡','🟢','🟣','⭐','❤️','🔺']),u=[S[0],S[1],S[2]].slice(0,c.lv<4?2:3),pat=[[0,1],[0,1,2],[0,0,1],[0,1,1],[0,1,2,1]][rnd(0,c.lv<4?0:4)].map(k=>u[k%u.length]);
    seq=[...Array(c.lv<4?6:8)].map((_,k)=>pat[k%pat.length]);ans=seq[seq.length-1];opts=shuffle([...new Set([ans,...S.slice(0,4)])]).slice(0,4);if(!opts.includes(ans))opts[0]=ans;opts=shuffle(opts)}
  else{const s=rnd(1,9),t=c.lv<18?rnd(0,1):rnd(0,3);const st=rnd(2,c.lv<18?5:9),st2=rnd(1,4);
    seq=[...Array(6)].map((_,k)=>t===0?s+st*k:t===1?s+st*k*(k%2?1:1)+0:t===2?s*Math.pow(2,k):s+(k%2?st2:st)*Math.ceil(k/2)+(k%2?0:0));
    if(t===3){seq=[s];for(let k=1;k<6;k++)seq.push(seq[k-1]+(k%2?st:st2))}ans=seq[seq.length-1];opts=nearOpts(ans)}
  area.innerHTML=`<div class="br-msg">ما الذي يأتي بعد ذلك؟ 🧩</div><div class="pt-row" dir="ltr">${seq.slice(0,-1).map(v=>`<span>${v}</span>`).join('')}<span class="q">؟</span></div>`;
  chooseRow(area,opts,ans,done,api,fmt);tlim(c,area,c.f(20,8),done)}});
