/* فنتازيا: المساحات الإعلانية.
   كل مساحة تُدار من ADS_CONFIG أدناه بدون لمس بقية الكود:
   - type:'house'   إعلان داخلي يدعو المعلنين («أعلن هنا») — الوضع الافتراضي الآن.
   - type:'direct'  راعٍ مباشر: {img, link, alt} (صورة بانر ورابط المعلن).
   - type:'html'    كود شبكة إعلانية (SuperAwesome / AdinPlay ...) يُلصق كما هو.
   - type:'off'     إخفاء المساحة.
   القواعد: لا إعلانات داخل منطقة اللعب، كل إعلان عليه كلمة «إعلان»، والروابط sponsored. */
const ADS_CONFIG={
  home_top:   {type:'house',size:'wide'},   // الرئيسية: تحت شريط التصنيفات
  game_below: {type:'house',size:'wide'},   // صفحة اللعبة: تحت منطقة اللعب
  game_side:  {type:'house',size:'box'},    // صفحة اللعبة: أعلى «ألعاب قد تعجبك»
  between:    {type:'off',every:3},         // بين المراحل (يُفعَّل عند ربط شبكة إعلانات)
};
const HOUSE=[
  {e:'📢',t:'أعلن هنا',s:'أوصل علامتك لآلاف العائلات العربية وأطفالهم'},
  {e:'🧸',t:'مساحة لعلامتك التجارية',s:'إعلانات آمنة ومراجعة يدوياً، مناسبة للأطفال'},
  {e:'🎮',t:'لعبة برعايتك',s:'نصمم لعبة تحمل اسم منتجك ويلعبها الأطفال'},
];
function adHTML(slot){const c=ADS_CONFIG[slot];if(!c||c.type==='off')return '';
  let inner='';
  if(c.type==='direct'&&c.img)inner=`<a href="${c.link}" target="_blank" rel="sponsored noopener nofollow"><img src="${c.img}" alt="${c.alt||'إعلان'}" loading="lazy"></a>`;
  else if(c.type==='html')inner=c.html||'';
  else{const h0=HOUSE[Math.floor(Math.random()*HOUSE.length)];
    inner=`<a class="ad-house" href="advertise.html"><span class="ad-e">${h0.e}</span><span class="ad-t"><b>${h0.t}</b><small>${h0.s}</small></span><span class="ad-cta">اعرف أكثر ←</span></a>`}
  return `<div class="ad-slot ad-${c.size||'wide'}" data-slot="${slot}"><span class="ad-label">إعلان</span>${inner}</div>`}
function placeAd(slot,where,pos='afterend'){if(!where)return;document.querySelector(`.ad-slot[data-slot="${slot}"]`)?.remove();const html=adHTML(slot);if(html)where.insertAdjacentHTML(pos,html)}

{const sh=showHome;window.showHome=function(cat){const r=sh.apply(this,arguments);try{placeAd('home_top',$('#cats'))}catch(e){}return r}}
{const og=openGame;window.openGame=function(g){const r=og.apply(this,arguments);try{placeAd('game_below',$('#stageWrap'));placeAd('game_side',$('.related h3'),'beforebegin')}catch(e){}return r}}
try{route()}catch(e){}
