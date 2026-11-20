/* فنتازيا: الأساس المشترك (أدوات عامة، الصوت، المستويات والمراحل، سياق اللعبة). يُحمَّل أولاً. */
/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const h=s=>{const t=document.createElement('template');t.innerHTML=s.trim();return t.content.firstElementChild};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem('marah:'+k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem('marah:'+k,JSON.stringify(v))}catch{}}};
function toast(msg){document.querySelector('.toast')?.remove();const t=h(`<div class="toast">${msg}</div>`);document.body.append(t);setTimeout(()=>t.remove(),1800)}

/* ---------- sound ---------- */
const sound={on:store.get('sound',true)};let actx;
function beep(f=600,d=.12,type='sine',v=.15){if(!sound.on)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+d);o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+d)}catch(e){}}
const sfx={good(){beep(660,.1);setTimeout(()=>beep(880,.15),90)},bad(){beep(170,.25,'square',.07)},pop(){beep(900,.06,'triangle')},win(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.2),i*120))}};
let arVoice=null;const pickVoice=()=>{const v=speechSynthesis.getVoices();arVoice=v.find(x=>/^ar[-_]SA/i.test(x.lang))||v.find(x=>/^ar/i.test(x.lang))||null};
if('speechSynthesis' in window){pickVoice();speechSynthesis.addEventListener?.('voiceschanged',pickVoice)}
function speak(w){if(!sound.on||!('speechSynthesis' in window))return;const u=new SpeechSynthesisUtterance(w);u.lang='ar-SA';if(arVoice)u.voice=arVoice;u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}

/* ---------- difficulty & stages ---------- */
const DIFFS=[
  {t:'سهل',e:'🌱',a:'#4ade80',b:'#16a34a',s:'#0f7a35'},
  {t:'وسط',e:'🔥',a:'#fdba74',b:'#f97316',s:'#c2410c'},
  {t:'صعب',e:'🚀',a:'#f87171',b:'#dc2626',s:'#991b1b'},
];
const STAGES=10, LEVELS=DIFFS.length*STAGES; /* 30 درجة صعوبة متصلة: سهل 1-10، وسط 11-20، صعب 21-30 */
const unl=(id,d)=>store.get(`unl:${id}:${d}`,1);          // أعلى مرحلة مفتوحة
const isDone=(id,d)=>store.get(`fin:${id}:${d}`,false);   // أنهى المرحلة 10 بعلامة كاملة
const progress=(id,d)=>isDone(id,d)?STAGES:unl(id,d)-1;    // عدد المراحل المكتملة

/* ---------- game context (auto cleanup + pause) ---------- */
function makeCtx(g,run){const T=[],I=[],L=[];const D=DIFFS[run.diff],lv=run.diff*STAGES+run.stage-1,t=lv/(LEVELS-1);let over=false;
  const c={run,lv,t,f:(a,b)=>a+(b-a)*t,fi:(a,b)=>Math.round(a+(b-a)*t),paused:false,resumeFns:[],
  tag:run.practice?'':`<button class="pill lvl" data-lvl title="المستوى والمراحل" aria-label="تغيير المستوى أو المرحلة" style="--a:${D.a};--b:${D.b}">${D.e} ${D.t} · مرحلة ${run.stage}/${STAGES} <span class="chev">▾</span></button>`,
  every(f,ms){const id=setInterval(()=>{if(!c.paused)f()},ms);I.push(id);return id},
  after(f,ms){const run2=()=>{if(c.paused){T.push(setTimeout(run2,150));return}f()};const id=setTimeout(run2,ms);T.push(id);return id},
  on(t2,e,f,o){t2.addEventListener(e,f,o);L.push([t2,e,f,o])},
  timeBar(root,sec,onEnd){const bar=h('<div class="tbar" role="progressbar" aria-label="الوقت المتبقي"><i></i></div>');root.append(bar);const fill=bar.firstElementChild;
    let end=performance.now()+sec*1000;c.resumeFns.push(dt=>{end+=dt});const left=()=>Math.max(0,(end-performance.now())/1000);
    c.every(()=>{const p=left()/sec;fill.style.width=(p*100)+'%';bar.classList.toggle('low',p<=.3);if(p<=0)onEnd()},100);return{left}},
  pause(){if(c.paused)return;c.paused=true;c._ps=performance.now();$('#stage').classList.add('paused')},
  resume(){if(!c.paused)return;c.paused=false;$('#stage').classList.remove('paused');const dt=performance.now()-c._ps;c.resumeFns.forEach(f=>f(dt))},
  clear(){T.forEach(clearTimeout);I.forEach(clearInterval);L.forEach(([t2,e,f,o])=>t2.removeEventListener(e,f,o));T.length=I.length=L.length=0},
  win(score,msg,res){if(over)return;over=true;c.clear();if(run.practice)return practiceEnded(g,run,'win');stageDone(g,run,Math.max(0,Math.round(score)),msg,res)},
  lose(msg,res){if(over)return;over=true;c.clear();if(run.practice)return practiceEnded(g,run,'lose');gameOver(g,run,msg,res)}};
  return c}
function fitHud(){const st=$('#stage'),hd=st.querySelector('.hud');st.style.setProperty('--hud',(hd?hd.offsetHeight+18:58)+'px')}

/* ---------- GAMES (كل لعبة تتدرج مع c.t من 0 إلى 1 عبر 30 درجة) ---------- */
const G={};
