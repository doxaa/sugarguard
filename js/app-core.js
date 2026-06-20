/* ============================================================
   SugarGuard — app logic
   All data stored in-memory (resets on reload in this preview).
   Estimates only — not blood-glucose readings.
============================================================ */

/* ---------- Nigerian + common food database ----------
   GI = glycemic index (estimate), carbs = g per typical serving,
   GL = (GI * carbs)/100, serving = friendly portion label.        */
const FOODS = [
  {n:"Jollof rice",e:"🍚",gi:73,carbs:48,serve:"1 medium plate",cat:"swallow/rice",speed:"heavy",pair:"Add grilled chicken or fish and a side of vegetables to slow the spike.",portion:"Keep to one cupped-hand of rice; fill half the plate with salad or veg.",time:"Best at lunch when you'll move afterwards — avoid late at night."},
  {n:"White rice",e:"🍚",gi:72,carbs:45,serve:"1 medium plate",cat:"swallow/rice",speed:"heavy",pair:"Pair with beans, vegetables and protein to lower the overall load.",portion:"Swap a third of the rice for beans to cut the load.",time:"Earlier in the day; take a short walk after."},
  {n:"Fried rice",e:"🍛",gi:68,carbs:46,serve:"1 medium plate",cat:"swallow/rice",speed:"heavy",pair:"The veg and protein help — still keep the portion moderate.",portion:"One cupped-hand serving; load up on the mixed vegetables.",time:"Lunch is ideal."},
  {n:"Pounded yam",e:"🥔",gi:84,carbs:50,serve:"2 fist-size pieces",cat:"swallow/rice",speed:"heavy",pair:"Eat with egusi or vegetable soup rich in protein and oil to slow digestion.",portion:"One fist-size wrap instead of two.",time:"Midday meal; not close to bedtime."},
  {n:"Garri / Eba",e:"🟡",gi:81,carbs:49,serve:"2 fist-size pieces",cat:"swallow/rice",speed:"heavy",pair:"Soup with plenty of vegetables and protein reduces the spike.",portion:"Smaller wrap; more soup, more vegetables.",time:"Daytime; follow with light activity."},
  {n:"Fufu",e:"⚪",gi:80,carbs:48,serve:"2 fist-size pieces",cat:"swallow/rice",speed:"heavy",pair:"Best with a protein-rich, vegetable-heavy soup.",portion:"One wrap; pair with leafy soup.",time:"Lunch rather than dinner."},
  {n:"Amala",e:"🟤",gi:70,carbs:46,serve:"2 fist-size pieces",cat:"swallow/rice",speed:"heavy",pair:"Ewedu + gbegiri + protein balances it nicely.",portion:"Moderate wrap; generous soup.",time:"Midday."},
  {n:"Semo (semolina)",e:"⚪",gi:74,carbs:47,serve:"2 fist-size pieces",cat:"swallow/rice",speed:"heavy",pair:"Vegetable soup with fish or meat.",portion:"One wrap is plenty.",time:"Daytime."},
  {n:"Beans (cooked)",e:"🫘",gi:40,carbs:35,serve:"1 medium bowl",cat:"protein/legume",speed:"moderate",pair:"Great alone; add plantain in moderation.",portion:"A full bowl is fine — beans are slow-release.",time:"Any meal — a smart choice."},
  {n:"Moi moi",e:"🟠",gi:43,carbs:22,serve:"1 wrap",cat:"protein/legume",speed:"moderate",pair:"Lovely with pap, but watch the pap portion.",portion:"1–2 wraps as a protein side.",time:"Breakfast or lunch."},
  {n:"Akara",e:"🟤",gi:48,carbs:18,serve:"4 balls",cat:"protein/legume",speed:"moderate",pair:"Pair with pap or bread sparingly.",portion:"3–4 balls; go easy on the oil.",time:"Breakfast."},
  {n:"Plantain (ripe, fried)",e:"🍌",gi:67,carbs:38,serve:"6 slices",cat:"starchy",speed:"moderate",pair:"Eat with beans or eggs to balance.",portion:"4–5 slices; grilled/boiled is gentler than fried.",time:"Daytime."},
  {n:"Boiled yam",e:"🍠",gi:65,carbs:42,serve:"3 slices",cat:"starchy",speed:"moderate",pair:"Egg sauce or vegetable sauce works well.",portion:"2–3 slices with a protein sauce.",time:"Breakfast or lunch."},
  {n:"Pap / Akamu",e:"🥣",gi:66,carbs:30,serve:"1 bowl",cat:"starchy",speed:"fast",pair:"Always pair with moi moi or akara for protein.",portion:"One bowl; avoid adding extra sugar.",time:"Breakfast."},
  {n:"Bread (white)",e:"🍞",gi:71,carbs:25,serve:"2 slices",cat:"starchy",speed:"fast",pair:"Add egg, avocado or beans for protein.",portion:"2 slices; wholemeal is gentler.",time:"Breakfast."},
  {n:"Noodles (instant)",e:"🍜",gi:69,carbs:40,serve:"1 pack",cat:"starchy",speed:"fast",pair:"Add egg and vegetables to slow it down.",portion:"One pack with added veg + protein.",time:"Lunch; not late night."},
  {n:"Egusi soup",e:"🥘",gi:25,carbs:8,serve:"1 bowl",cat:"soup",speed:"slow",pair:"Pairs with any swallow — keep the swallow small.",portion:"Generous — it's mostly protein, veg and oil.",time:"With lunch."},
  {n:"Ogbono soup",e:"🥘",gi:24,carbs:7,serve:"1 bowl",cat:"soup",speed:"slow",pair:"Low impact on its own; mind the swallow portion.",portion:"Enjoy freely; watch the swallow.",time:"Lunch."},
  {n:"Afang soup",e:"🥬",gi:22,carbs:6,serve:"1 bowl",cat:"soup",speed:"slow",pair:"Vegetable-rich and low GL.",portion:"Generous portion is fine.",time:"Any meal."},
  {n:"Okra soup",e:"🥬",gi:20,carbs:6,serve:"1 bowl",cat:"soup",speed:"slow",pair:"Low impact, very gentle.",portion:"Enjoy freely.",time:"Any meal."},
  {n:"Vegetable soup",e:"🥬",gi:18,carbs:6,serve:"1 bowl",cat:"soup",speed:"slow",pair:"Excellent low-GL choice.",portion:"Generous.",time:"Any meal."},
  {n:"Pepper soup",e:"🍲",gi:15,carbs:5,serve:"1 bowl",cat:"soup",speed:"slow",pair:"Great light, low-impact meal.",portion:"Enjoy freely.",time:"Dinner-friendly."},
  {n:"Suya",e:"🍢",gi:12,carbs:4,serve:"1 stick",cat:"protein",speed:"slow",pair:"Pair with onions, tomato and pepper, not bread.",portion:"1–2 sticks as a protein snack.",time:"Any time."},
  {n:"Meat pie",e:"🥟",gi:58,carbs:34,serve:"1 pie",cat:"snack",speed:"moderate",pair:"Pair with unsweetened tea, not a soft drink.",portion:"One as an occasional treat.",time:"Daytime snack."},
  {n:"Puff puff",e:"🟤",gi:75,carbs:33,serve:"4 balls",cat:"snack",speed:"fast",pair:"Eat with protein; avoid alongside sugary drinks.",portion:"2–3 balls occasionally.",time:"Daytime treat."},
  {n:"Chin chin",e:"🟫",gi:64,carbs:30,serve:"1 handful",cat:"snack",speed:"moderate",pair:"Small handful with tea.",portion:"A small handful, not a bowl.",time:"Occasional snack."},
  {n:"Zobo (unsweetened)",e:"🍷",gi:8,carbs:3,serve:"1 glass",cat:"drink",speed:"slow",pair:"Lovely low-sugar drink if unsweetened.",portion:"Skip added sugar to keep it low.",time:"Any time."},
  {n:"Kunu",e:"🥛",gi:60,carbs:22,serve:"1 glass",cat:"drink",speed:"fast",pair:"Watch portion; can spike quickly.",portion:"Small glass; avoid extra sugar.",time:"Daytime."},
  {n:"Malt drink",e:"🍺",gi:72,carbs:43,serve:"1 bottle",cat:"drink",speed:"fast",pair:"High sugar — treat as an occasional indulgence.",portion:"Half a bottle, or choose a low-sugar option.",time:"Rarely; with activity."},
  {n:"Soft drink (cola)",e:"🥤",gi:63,carbs:39,serve:"1 can",cat:"drink",speed:"fast",pair:"Swap for water, zobo or sparkling water.",portion:"Best avoided; choose sugar-free if needed.",time:"Avoid on an empty stomach."},
  {n:"Garden egg",e:"🍆",gi:15,carbs:5,serve:"3 pieces",cat:"veg",speed:"slow",pair:"Perfect low-GL snack with groundnut.",portion:"Enjoy freely.",time:"Any time."}
];

const speedAlert = {
  fast:{label:"Fast carbs",mins:45,msg:"may reach its estimated sugar peak in about 30–60 minutes"},
  moderate:{label:"Moderate carbs",mins:90,msg:"may reach its estimated sugar peak in about 1–2 hours"},
  heavy:{label:"Heavy meal",mins:150,msg:"may reach its estimated sugar peak in about 2–3 hours"},
  slow:{label:"Slow / low impact",mins:120,msg:"has a gentle, slow sugar impact"}
};

function glBand(gl){
  if(gl<=10)return{label:"Low",color:"var(--green)",bg:"var(--mint)",emoji:"🟢"};
  if(gl<=19)return{label:"Moderate",color:"var(--orange)",bg:"#fff7ed",emoji:"🟠"};
  return{label:"High",color:"var(--red)",bg:"#fef2f2",emoji:"🔴"};
}

/* ---------- App state ---------- */
let S = {
  user:{name:"",email:"",age:32,gender:"Female",weight:70,height:168,country:"Nigeria",
        goal:"Glucose awareness",health:"Unsure",activity:1.4,wake:"06:30",sleep:"22:30",
        naija:"Yes",fav:"",waterPref:"auto",waterInterval:90,sound:"beep",premium:false},
  sub:{status:'free',plan:null,expires:null,reference:null}, // status: free | active | grace | expired
  water:{ml:0,goal:2000,last:Date.now()},
  meals:[],            // {id,type,foods:[food],gl,time}
  sleepHrs:null,
  exercise:[],         // {type,mins}
  glHistory:[2,6,4,9,7,3], // last 6 days, today appended live
  alerts:[],
  reminderTimer:null,
  subTimer:null
};

let currentScreen='onb', onbStep=0, selectedFoods=[], scanResult=null, selectedPlan='monthly';

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const el=(h)=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild;};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2600);}
function greetWord(){const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";}
function todayGL(){return S.meals.reduce((a,m)=>a+m.gl,0);}
function fmtL(ml){return (ml/1000).toFixed(ml%1000===0?0:1)+" L";}

/* beep using WebAudio so no audio file needed */
function beep(kind){
  if(S.user.sound==='silent'){if(navigator.vibrate)navigator.vibrate([120,60,120]);return;}
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const notes = kind==='chime'?[880,1175,1568]:[660,880];
    notes.forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type=kind==='chime'?'sine':'triangle';o.frequency.value=f;
      o.connect(g);g.connect(ctx.destination);
      const t=ctx.currentTime+i*0.16;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.18,t+.03);
      g.gain.exponentialRampToValueAtTime(.0001,t+.4);
      o.start(t);o.stop(t+.42);
    });
    if(navigator.vibrate)navigator.vibrate(80);
  }catch(e){}
}

/* ============================================================
   SUBSCRIPTION ENGINE  (server-backed, can't be faked locally)
   - applySubscription() runs after server verification
   - refreshSubscription() re-checks the server (on load + daily)
   - subscription gates premium and drives renewal reminders/cutoff
============================================================ */
const DAY=86400000;
function fmtDate(ts){if(!ts)return'—';const d=new Date(ts);return d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});}
function daysLeft(){return S.sub.expires?Math.ceil((S.sub.expires-Date.now())/DAY):0;}

function applySubscription(sub){
  // sub = {plan, expires(ms epoch), reference, status}
  S.sub.plan=sub.plan; S.sub.expires=sub.expires; S.sub.reference=sub.reference||S.sub.reference;
  evaluateSubscription();
  saveLocal();
}

function evaluateSubscription(){
  if(!S.sub.expires){S.sub.status='free';S.user.premium=false;return;}
  const left=daysLeft();
  if(left>0){S.sub.status='active';S.user.premium=true;}
  else if(left>-3){S.sub.status='grace';S.user.premium=true;} // 3-day grace while Paystack retries
  else{S.sub.status='expired';S.user.premium=false;}
}

/* re-check with server so a cleared browser can't grant premium,
   and an expired/cancelled sub is enforced even if local says active */
async function refreshSubscription(){
  if(!S.user.email)return;
  try{
    const r=await fetch(CONFIG.API_BASE+'/subscription-status?email='+encodeURIComponent(S.user.email));
    if(!r.ok)return;
    const data=await r.json();
    if(data&&data.found){
      S.sub.plan=data.plan; S.sub.expires=data.expires; S.sub.reference=data.reference;
    }else{
      S.sub.expires=null; S.sub.plan=null;
    }
    evaluateSubscription();
    saveLocal();
    if(currentScreen==='home')renderHome();
  }catch(e){/* offline: fall back to last known local state */}
}

/* renewal reminders + cutoff messaging */
function startSubscriptionWatch(){
  if(S.subTimer)clearInterval(S.subTimer);
  checkRenewalReminder();
  S.subTimer=setInterval(checkRenewalReminder, 6*60*60*1000); // every 6h
}
function checkRenewalReminder(){
  evaluateSubscription();
  if(S.sub.status==='free')return;
  const left=daysLeft();
  const todayKey=new Date().toDateString();
  if(S._subNotified===todayKey)return; // once a day max

  if(S.sub.status==='active' && left<=3 && left>0){
    S._subNotified=todayKey;
    const msg=`Your ${S.sub.plan} subscription renews in ${left} day${left>1?'s':''} (${fmtDate(S.sub.expires)}). Keep your card active to stay Premium.`;
    notify('Subscription reminder ⭐',msg);
    S.alerts.push({title:'Subscription renews soon ⭐',body:msg,level:'mod'});
    if(currentScreen==='home')renderHome();
  }
  if(S.sub.status==='grace'){
    S._subNotified=todayKey;
    const msg=`Your subscription expired on ${fmtDate(S.sub.expires)}. We're retrying your payment — update your card to avoid losing Premium.`;
    notify('Action needed ⚠️',msg);
    S.alerts.push({title:'Renew to keep Premium ⚠️',body:msg,level:'high'});
    if(currentScreen==='home')renderHome();
  }
  if(S.sub.status==='expired' && S._wasPremium){
    S._wasPremium=false;
    S.alerts.push({title:'Premium ended',body:'Your subscription has ended. You\u2019re now on the Free plan (3 checks/day). Renew anytime to unlock everything again.',level:'mod'});
    if(currentScreen==='home')renderHome();
  }
  if(S.user.premium)S._wasPremium=true;
}

/* lightweight local cache so the app remembers the email/last state between visits.
   This is a CONVENIENCE cache only — the server remains the source of truth. */
function saveLocal(){
  try{localStorage.setItem('sg_state',JSON.stringify({
    user:S.user,sub:S.sub,water:S.water,meals:S.meals,sleepHrs:S.sleepHrs,
    exercise:S.exercise,glHistory:S.glHistory,onboarded:true
  }));}catch(e){}
}
function loadLocal(){
  try{
    const raw=localStorage.getItem('sg_state');if(!raw)return false;
    const d=JSON.parse(raw);
    Object.assign(S.user,d.user||{});
    Object.assign(S.sub,d.sub||{});
    Object.assign(S.water,d.water||{});
    S.meals=d.meals||[];S.sleepHrs=d.sleepHrs??null;S.exercise=d.exercise||[];
    if(d.glHistory)S.glHistory=d.glHistory;
    evaluateSubscription();
    return d.onboarded===true;
  }catch(e){return false;}
}

/* ============================================================
   ONBOARDING FLOW
============================================================ */
function onbNext(){
  // capture per step
  if(onbStep===1){
    S.user.name=$('#i_name').value.trim()||"";
    if($('#i_email'))S.user.email=$('#i_email').value.trim().toLowerCase()||S.user.email;
    S.user.age=+$('#i_age').value||S.user.age;
    S.user.gender=$('#i_gender').value||S.user.gender;
    S.user.weight=+$('#i_weight').value||S.user.weight;
    S.user.height=+$('#i_height').value||S.user.height;
    S.user.country=$('#i_country').value;
  }
  if(onbStep===2){
    const g=document.querySelector('#goalChips .sel');if(g)S.user.goal=g.dataset.v;
    const h=document.querySelector('#healthChips .sel');if(h)S.user.health=h.dataset.v;
  }
  if(onbStep===3){
    S.user.activity=+$('#i_activity').value;
    S.user.wake=$('#i_wake').value;S.user.sleep=$('#i_sleep').value;
    S.user.naija=$('#i_naija').value;S.user.fav=$('#i_fav').value.trim();
  }
  if(onbStep===4){
    S.user.waterPref=$('#i_waterpref').value;
    S.user.waterInterval=+$('#i_waterint').value;
    S.user.sound=$('#i_sound').value;
  }
  onbStep++;
  document.querySelectorAll('.onb-step').forEach(s=>s.classList.toggle('show',+s.dataset.step===onbStep));
  $('.onb-wrap').scrollTop=0;
}

// chip single-select
document.addEventListener('click',e=>{
  const c=e.target.closest('#goalChips .chip,#healthChips .chip');
  if(c){c.parentElement.querySelectorAll('.chip').forEach(x=>x.classList.remove('sel'));c.classList.add('sel');}
});

function calcWaterGoal(){
  if(S.user.waterPref!=='auto')return +S.user.waterPref;
  // base 35ml/kg, adjust for activity, gender, age, goal
  let ml=S.user.weight*35;
  ml*=(0.85+ (S.user.activity-1.2)*0.25);
  if(S.user.gender==='Male')ml*=1.05;
  if(S.user.age>55)ml*=0.95;
  if(/hydration|fitness|weight/i.test(S.user.goal))ml*=1.1;
  return Math.round(ml/250)*250;
}

function finishOnb(){
  if(!$('#agreeTog').classList.contains('on')){toast("Please confirm you understand the estimates note.");return;}
  S.water.goal=calcWaterGoal();
  // seed a sample meal so dashboard isn't empty
  if(S.meals.length===0){
    addMeal('lunch',[FOODS.find(f=>f.n==='Jollof rice')],false);
  }
  $('#bottomNav').style.display='flex';
  go('home');
  startReminders();
  startSubscriptionWatch();
  if(S.user.email)refreshSubscription();
  saveLocal();
  setTimeout(()=>askNotify(),1200);
}

function loadDemo(){
  S.user.name="Glory";S.user.goal="Glucose awareness";S.user.health="Pre-diabetic";
  S.water.goal=2000;S.water.ml=1500;
  addMeal('lunch',[FOODS.find(f=>f.n==='Jollof rice')],false);
  addMeal('dinner',[FOODS.find(f=>f.n==='Pepper soup')],false);
  S.sleepHrs=7.5;S.exercise=[{type:'Walking',mins:25}];
  $('#bottomNav').style.display='flex';
  go('home');startReminders();startSubscriptionWatch();
}

/* boot: resume a returning user straight to the dashboard */
function boot(){
  const onboarded=loadLocal();
  if(onboarded){
    $('#bottomNav').style.display='flex';
    go('home');
    startReminders();
    startSubscriptionWatch();
    if(S.user.email)refreshSubscription(); // re-validate premium against server
  }
}

function askNotify(){
  if(!('Notification'in window))return;
  if(Notification.permission==='default')Notification.requestPermission();
}
function notify(title,body){
  if('Notification'in window&&Notification.permission==='granted'){
    try{new Notification(title,{body,icon:''});}catch(e){}
  }
  beep(S.user.sound);
}

/* ============================================================
   NAVIGATION
============================================================ */
function go(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
  currentScreen=id;
  // nav highlight
  const navMap={home:'home',meal:'meal',fooddb:'meal',water:'water',coaching:'coaching',
                more:'more',profile:'more',reports:'more',disclaimer:'more',premium:'more',
                sleep:'home',exercise:'home',scan:'meal'};
  document.querySelectorAll('.nav button[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===navMap[id]));
  // render
  ({home:renderHome,meal:renderMeal,scan:renderScan,water:renderWater,sleep:renderSleep,
    exercise:renderExercise,coaching:renderChat,reports:renderReports,premium:renderPremium,
    more:renderMore,profile:renderProfile,disclaimer:renderDisc,fooddb:renderDB}[id]||(()=>{}))();
  const sc=document.querySelector('#'+id+' .scroll');if(sc)sc.scrollTop=0;
}

/* ============================================================
   HOME DASHBOARD
============================================================ */
function ring(value,max,size,stroke,color,track){
  const r=(size-stroke)/2,c=2*Math.PI*r,pct=Math.min(value/max,1),off=c*(1-pct);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${track||'var(--line)'}" stroke-width="${stroke}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
  </svg>`;
}

function renderHome(){
  const gl=todayGL(),band=glBand(gl);
  const hist=[...S.glHistory,gl];
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Today'];
  const maxH=Math.max(20,...hist);
  const avg=Math.round(hist.reduce((a,b)=>a+b,0)/hist.length);
  const waterPct=Math.round(S.water.ml/S.water.goal*100);

  const bars=hist.map((v,i)=>{
    const b=glBand(v);
    return `<div class="b"><div class="bar" style="height:${Math.max(4,v/maxH*100)}%;background:${b.color};${i===6?'box-shadow:0 0 0 2px '+b.bg:''}"></div><div class="bl">${days[i]}</div></div>`;
  }).join('');

  $('#homeScroll').innerHTML = `
    <div style="padding-top:calc(14px + env(safe-area-inset-top));display:flex;justify-content:space-between;align-items:flex-start">
      <div><div class="greet">${greetWord()},</div><div style="font-size:24px;font-weight:800;font-family:Sora;letter-spacing:-.02em">${S.user.name||'Friend'} 👋</div></div>
      <button onclick="go('profile')" class="avatar" style="width:46px;height:46px;border-radius:15px;font-size:18px">${(S.user.name||'S')[0].toUpperCase()}</button>
    </div>

    ${S.alerts.length?`<div style="margin-top:16px">${S.alerts.slice(-1).map(alertCardHTML).join('')}</div>`:''}

    <!-- GL hero card -->
    <div class="card" style="margin-top:16px;background:linear-gradient(135deg,#fff, ${band.bg})">
      <div class="ringwrap">
        <div class="ring">
          ${ring(Math.min(gl,30),30,128,13,band.color,'var(--mint)')}
          <div class="mid"><div class="v" style="color:${band.color}">${gl}</div><div class="l">Daily GL</div></div>
        </div>
        <div style="flex:1">
          <div class="eyebrow">Estimated glycemic load</div>
          <div style="font-size:17px;font-weight:700;margin:4px 0 8px">Today's sugar impact</div>
          <span class="statuspill" style="background:${band.bg};color:${band.color}">${band.emoji} ${band.label}</span>
          <div style="font-size:12.5px;color:var(--muted);margin-top:10px">${S.meals.length} meal${S.meals.length!==1?'s':''} logged today</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-primary btn-sm" style="flex:1" onclick="go('meal')">＋ Log Meal</button>
        <button class="btn btn-teal btn-sm" style="flex:1" onclick="go('scan')">📷 Scan Food</button>
        <button class="btn btn-ghost btn-sm" style="flex:1;color:var(--teal)" onclick="quickWater()">💧 Water</button>
      </div>
    </div>

    <!-- trend -->
    <div class="card" style="margin-top:14px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-weight:700;font-size:15px">7-Day GL Trend</div>
        <div style="font-size:12px;color:var(--muted)">Avg <b style="color:var(--ink)">${avg}</b></div>
      </div>
      <div class="bars">${bars}</div>
      <div style="display:flex;gap:14px;margin-top:12px;font-size:10.5px;color:var(--muted);flex-wrap:wrap">
        <span>🟢 Low ≤10</span><span>🟠 Moderate 11–19</span><span>🔴 High ≥20</span>
      </div>
    </div>

    <!-- tiles -->
    <div class="tiles" style="margin-top:14px">
      <button class="tile" style="text-align:left" onclick="go('water')">
        <div class="ic" style="background:#e0f2fe;color:#0284c7">💧</div>
        <div class="tl">Water</div><div class="tv">${S.water.ml} <small>/ ${S.water.goal}ml</small></div>
        <div style="height:6px;border-radius:6px;background:var(--line);margin-top:8px;overflow:hidden"><div style="height:100%;width:${waterPct}%;background:linear-gradient(90deg,#0284c7,#38bdf8)"></div></div>
      </button>
      <button class="tile" style="text-align:left" onclick="go('sleep')">
        <div class="ic" style="background:#ede9fe;color:#7c3aed">🌙</div>
        <div class="tl">Sleep</div><div class="tv">${S.sleepHrs?S.sleepHrs+' <small>hrs</small>':'<small>Log tonight</small>'}</div>
      </button>
      <button class="tile" style="text-align:left" onclick="go('exercise')">
        <div class="ic" style="background:#ffedd5;color:#ea580c">🏃</div>
        <div class="tl">Exercise</div><div class="tv">${S.exercise.reduce((a,e)=>a+e.mins,0)||0} <small>min</small></div>
      </button>
      <button class="tile" style="text-align:left" onclick="go('coaching')">
        <div class="ic" style="background:var(--mint);color:var(--teal)">💬</div>
        <div class="tl">AI Coaching</div><div class="tv" style="font-size:14px">Ask anything</div>
      </button>
    </div>

    <!-- meals -->
    <div class="sectitle">Today's Meals <a onclick="go('meal')">Log meal ›</a></div>
    ${S.meals.length?S.meals.map(mealRowHTML).join(''):'<div class="card flat" style="text-align:center;color:var(--muted);font-size:13.5px;padding:24px">No meals yet today.<br>Tap “Log Meal” to estimate your first one.</div>'}

    <!-- premium -->
    <button class="card" style="margin-top:16px;width:100%;text-align:left;background:linear-gradient(135deg,var(--green),#0b3d28);color:#fff;border:none" onclick="go('premium')">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="font-size:30px">⭐</div>
        <div style="flex:1"><div style="font-weight:700;font-size:16px">Upgrade to Premium</div><div style="font-size:12.5px;color:#bfe9d6;margin-top:2px">AI meal plans, coaching, reports & unlimited checks</div></div>
        <div style="font-size:22px">›</div>
      </div>
    </button>

    <div class="disc green" style="margin-top:16px">
      <span>🛡️</span>
      <span>SugarGuard is not a medical device and does not measure blood glucose. All figures are estimates from food data — not a CGM or blood reading. Follow your doctor's advice. <a onclick="go('disclaimer')" style="color:var(--green);font-weight:700;text-decoration:underline">Read full disclaimer</a></span>
    </div>
    <div style="height:8px"></div>
  `;
}

function mealRowHTML(m){
  const b=glBand(m.gl),names=m.foods.map(f=>f.n).join(', ');
  return `<div class="food" onclick="openMealDetail('${m.id}')">
    <div class="fic">${m.foods[0].e}</div>
    <div style="flex:1"><div class="fn" style="text-transform:capitalize">${m.type} · ${m.foods.length} item${m.foods.length>1?'s':''}</div><div class="fm">${names}</div></div>
    <div class="gltag" style="background:${b.bg};color:${b.color}">GL ${m.gl}</div>
  </div>`;
}

function alertCardHTML(a){
  const c=a.level==='high'?{bg:'#fef2f2',col:'var(--red)',ic:'🔴'}:a.level==='mod'?{bg:'#fff7ed',col:'var(--orange)',ic:'🟠'}:{bg:'var(--mint)',col:'var(--green)',ic:'🟢'};
  return `<div class="alertcard" style="background:${c.bg}">
    <div class="ai-ic" style="background:#fff;color:${c.col}">${c.ic}</div>
    <div style="flex:1"><div style="font-weight:700;font-size:13.5px;color:${c.col}">${a.title}</div><div style="font-size:12.5px;color:var(--muted);margin-top:3px;line-height:1.4">${a.body}</div></div>
  </div>`;
}

/* ============================================================
   MEAL CALCULATOR + FOOD SELECTION
============================================================ */
function renderMeal(){
  const naijaFirst = /yes|sometimes/i.test(S.user.naija);
  const list = naijaFirst ? FOODS : FOODS;
  $('#mealScroll').innerHTML = `
    <div style="padding-top:14px"></div>
    <div class="disc green"><span>ℹ️</span><span>Pick the foods in your meal to see an <b>estimated</b> glycemic load, sugar-impact level and smart advice. These are estimates, not blood readings.</span></div>

    <div class="seg" style="margin-top:16px" id="mealTypeSeg">
      ${['breakfast','lunch','dinner','snack'].map((t,i)=>`<button class="${i===1?'on':''}" data-t="${t}" onclick="pickMealType(this)" style="text-transform:capitalize">${t}</button>`).join('')}
    </div>

    <div class="search"><span>🔍</span><input id="foodSearch" placeholder="Search foods… e.g. jollof, beans, swallow" oninput="filterFoods(this.value)"></div>
    <button class="btn btn-line btn-sm" style="width:100%;margin-bottom:14px" onclick="go('fooddb')">📖 Browse full Nigerian food database ›</button>

    <div id="selectedBar"></div>
    <div id="foodGrid"></div>
    <div style="height:90px"></div>
  `;
  selectedFoods=[];window._mealType='lunch';
  renderFoodGrid(FOODS);
  renderSelectedBar();
}
function pickMealType(b){b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');window._mealType=b.dataset.t;}
function filterFoods(q){
  q=q.toLowerCase();
  renderFoodGrid(FOODS.filter(f=>f.n.toLowerCase().includes(q)||f.cat.includes(q)));
}
function renderFoodGrid(list){
  $('#foodGrid').innerHTML=list.map(f=>{
    const gl=Math.round(f.gi*f.carbs/100),b=glBand(gl),sel=selectedFoods.includes(f);
    return `<div class="food" style="${sel?'outline:2px solid var(--teal)':''}" onclick="toggleFood('${f.n}')">
      <div class="fic">${f.e}</div>
      <div style="flex:1"><div class="fn">${f.n}</div><div class="fm">GI ${f.gi} · ${f.carbs}g carbs · ${f.serve}</div></div>
      <div class="gltag" style="background:${b.bg};color:${b.color}">GL ${gl}</div>
      <div style="width:26px;text-align:center;font-size:20px;color:var(--teal)">${sel?'✓':'＋'}</div>
    </div>`;
  }).join('');
}
function toggleFood(n){
  const f=FOODS.find(x=>x.n===n);const i=selectedFoods.indexOf(f);
  if(i>-1)selectedFoods.splice(i,1);else selectedFoods.push(f);
  renderFoodGrid(FOODS.filter(x=>{const q=($('#foodSearch')||{}).value||'';return x.n.toLowerCase().includes(q.toLowerCase())||x.cat.includes(q.toLowerCase());}));
  renderSelectedBar();
}
function renderSelectedBar(){
  const bar=$('#selectedBar');if(!bar)return;
  if(!selectedFoods.length){bar.innerHTML='';return;}
  const gl=selectedFoods.reduce((a,f)=>a+Math.round(f.gi*f.carbs/100),0),b=glBand(gl);
  bar.innerHTML=`<div class="card" style="position:sticky;top:0;z-index:3;margin-bottom:14px;background:linear-gradient(135deg,#fff,${b.bg})">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="eyebrow">Estimated meal load</div><div style="font-size:13px;color:var(--muted);margin-top:2px">${selectedFoods.length} item${selectedFoods.length>1?'s':''} selected</div></div>
      <div style="text-align:right"><div style="font-size:30px;font-weight:800;font-family:Sora;color:${b.color}">${gl}</div><span class="statuspill" style="background:${b.bg};color:${b.color};font-size:11px">${b.emoji} ${b.label}</span></div>
    </div>
    <button class="btn btn-primary btn-sm" style="width:100%;margin-top:12px" onclick="confirmLogMeal()">Log ${window._mealType} & set sugar-impact alert</button>
  </div>`;
}

function freeChecksLeft(){
  if(S.user.premium)return Infinity;
  const today=new Date().toDateString();
  const used=(S._checks&&S._checks.d===today)?S._checks.n:0;
  return 3-used;
}
function useCheck(){
  const today=new Date().toDateString();
  if(!S._checks||S._checks.d!==today)S._checks={d:today,n:0};
  S._checks.n++;
}

function confirmLogMeal(){
  if(!selectedFoods.length){toast("Select at least one food.");return;}
  if(freeChecksLeft()<=0){toast("You've used your 3 free checks today.");go('premium');return;}
  useCheck();
  addMeal(window._mealType,[...selectedFoods],true);
  selectedFoods=[];
  toast("Meal logged — sugar-impact alert set ⏰");
  go('home');
}

function addMeal(type,foods,withAlert){
  const gl=foods.reduce((a,f)=>a+Math.round(f.gi*f.carbs/100),0);
  const id='m'+Date.now()+Math.random().toString(36).slice(2,5);
  const meal={id,type,foods,gl,time:Date.now()};
  S.meals.push(meal);
  if(withAlert)scheduleMealAlert(meal);
  saveLocal();
}

/* digestion / sugar impact alert */
function scheduleMealAlert(meal){
  const b=glBand(meal.gl);
  // pick slowest food's speed = dominant timing
  const order={fast:1,moderate:2,heavy:3,slow:2};
  const dominant=meal.foods.reduce((a,f)=>order[f.speed]>order[a.speed]?f:a,meal.foods[0]);
  const sp=speedAlert[dominant.speed];
  const level=b.label==='High'?'high':b.label==='Moderate'?'mod':'low';
  // immediate confirmation alert
  S.alerts.push({title:`${meal.type[0].toUpperCase()+meal.type.slice(1)} logged · est. GL ${meal.gl}`,
    body:`This ${sp.label.toLowerCase()} meal ${sp.msg}. ${level==='high'?'High estimated load — a smaller portion next time helps.':level==='mod'?'Consider a short walk afterwards.':'Nice — a gentle choice.'}`,
    level});
  // schedule the peak alert (sped up for preview: 1 min ~ demo; uses real mins value as seconds*? -> use shortened)
  const previewMs = Math.min(sp.mins,8)*1000; // demo: compressed so you can see it
  clearTimeout(meal._t);
  meal._t=setTimeout(()=>{
    const msg = level==='high'
      ? `Your ${meal.type} may be reaching its estimated peak sugar impact now. A light walk or some water can help.`
      : `Your ${meal.type} may be reaching its estimated peak impact now.`;
    S.alerts.push({title:'Estimated sugar-impact peak ⏰',body:msg,level});
    notify('SugarGuard',msg);
    if(currentScreen==='home')renderHome();
  },previewMs);
}

function openMealDetail(id){
  const m=S.meals.find(x=>x.id===id);if(!m)return;
  const b=glBand(m.gl);
  const foodCards=m.foods.map(f=>{
    const gl=Math.round(f.gi*f.carbs/100),fb=glBand(gl);
    return `<div class="card flat" style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><div class="fic">${f.e}</div><div style="flex:1"><div class="fn">${f.n}</div><div class="fm">${f.serve}</div></div><div class="gltag" style="background:${fb.bg};color:${fb.color}">GL ${gl}</div></div>
      <div class="kv"><span class="k">Glycemic Index</span><span class="v">${f.gi}</span></div>
      <div class="kv"><span class="k">Carbohydrate</span><span class="v">${f.carbs} g</span></div>
      <div class="kv"><span class="k">Glycemic Load</span><span class="v" style="color:${fb.color}">${gl} · ${fb.label}</span></div>
      <div class="kv"><span class="k">Best time to eat</span><span class="v" style="font-size:12.5px;max-width:55%;text-align:right">${f.time}</span></div>
      <div class="adv"><span>🍽️</span><span><b>Portion:</b> ${f.portion}</span></div>
      <div class="adv" style="margin-top:8px"><span>🤝</span><span><b>Pairing:</b> ${f.pair}</span></div>
    </div>`;
  }).join('');
  openSheet(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div><div class="eyebrow">${m.type}</div><h2 style="font-size:22px">Estimated impact</h2></div>
      <div style="text-align:right"><div style="font-size:34px;font-weight:800;font-family:Sora;color:${b.color}">${m.gl}</div><span class="statuspill" style="background:${b.bg};color:${b.color}">${b.emoji} ${b.label}</span></div>
    </div>
    ${foodCards}
    <div class="disc" style="margin-top:6px"><span>⚠️</span><span>Estimated from food data, not a blood-glucose reading.</span></div>
    <button class="btn btn-line btn-sm" style="width:100%;margin-top:14px" onclick="deleteMeal('${m.id}')">Remove this meal</button>
  `);
}
function deleteMeal(id){S.meals=S.meals.filter(m=>m.id!==id);closeSheet();go('home');toast("Meal removed.");}

/* ============================================================
   FOOD DATABASE PAGE
============================================================ */
function renderDB(){
  const cats=[...new Set(FOODS.map(f=>f.cat))];
  $('#dbScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    <div class="search"><span>🔍</span><input placeholder="Search Nigerian & common foods…" oninput="filterDB(this.value)"></div>
    <div id="dbGrid"></div><div style="height:20px"></div>`;
  filterDB('');
}
function filterDB(q){
  q=q.toLowerCase();
  const list=FOODS.filter(f=>f.n.toLowerCase().includes(q)||f.cat.includes(q));
  $('#dbGrid').innerHTML=list.map(f=>{
    const gl=Math.round(f.gi*f.carbs/100),b=glBand(gl);
    return `<div class="food" onclick="openFoodDetail('${f.n}')">
      <div class="fic">${f.e}</div>
      <div style="flex:1"><div class="fn">${f.n}</div><div class="fm">GI ${f.gi} · ${f.carbs}g · ${f.serve}</div></div>
      <div class="gltag" style="background:${b.bg};color:${b.color}">GL ${gl}</div></div>`;
  }).join('')||'<div class="card flat" style="text-align:center;color:var(--muted);padding:24px">No match found.</div>';
}
function openFoodDetail(n){
  const f=FOODS.find(x=>x.n===n);const gl=Math.round(f.gi*f.carbs/100),b=glBand(gl);
  const sp=speedAlert[f.speed];
  openSheet(`
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div class="fic" style="width:60px;height:60px;font-size:30px">${f.e}</div>
      <div style="flex:1"><h2 style="font-size:22px">${f.n}</h2><div style="font-size:13px;color:var(--muted);margin-top:2px;text-transform:capitalize">${f.cat} · ${f.serve}</div></div>
    </div>
    <div class="card" style="background:linear-gradient(135deg,#fff,${b.bg});margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div class="eyebrow">Estimated glycemic load</div><span class="statuspill" style="background:${b.bg};color:${b.color};margin-top:6px">${b.emoji} ${b.label} impact</span></div>
        <div style="font-size:40px;font-weight:800;font-family:Sora;color:${b.color}">${gl}</div>
      </div>
    </div>
    <div class="kv"><span class="k">Glycemic Index</span><span class="v">${f.gi}</span></div>
    <div class="kv"><span class="k">Carbohydrate portion</span><span class="v">${f.carbs} g</span></div>
    <div class="kv"><span class="k">Sugar impact level</span><span class="v" style="color:${b.color}">${b.label}</span></div>
    <div class="kv"><span class="k">Digestion speed</span><span class="v">${sp.label}</span></div>
    <div class="kv"><span class="k">Best time to eat</span><span class="v" style="font-size:12.5px;max-width:55%;text-align:right">${f.time}</span></div>
    <div class="adv" style="margin-top:12px"><span>🍽️</span><span><b>Better portion:</b> ${f.portion}</span></div>
    <div class="adv" style="margin-top:8px"><span>🤝</span><span><b>Food pairing:</b> ${f.pair}</span></div>
    <div class="adv" style="margin-top:8px"><span>⏰</span><span><b>After eating:</b> this meal ${sp.msg}.</span></div>
    <button class="btn btn-primary btn-sm" style="width:100%;margin-top:16px" onclick="quickAdd('${f.n}')">＋ Add to a meal</button>
  `);
}
function quickAdd(n){selectedFoods=[FOODS.find(f=>f.n===n)];window._mealType='lunch';closeSheet();go('meal');setTimeout(renderSelectedBar,50);toast(n+" added — choose meal type & log.");}

/* ============================================================
   WATER TRACKER + reminder logic
============================================================ */
function renderWater(){
  const pct=Math.min(S.water.ml/S.water.goal,1),pctR=Math.round(pct*100);
  const remaining=Math.max(0,S.water.goal-S.water.ml);
  const msg = pct>=1?"🎉 Goal reached! Beautifully hydrated.":pct>=.75?"Almost there — one more glass!":pct>=.5?"Halfway. Keep sipping 💪":pct>=.25?"Good start. Stay steady.":"Let's begin — your body will thank you.";
  $('#waterSub').textContent=`Goal ${fmtL(S.water.goal)} · tailored to your profile`;
  $('#waterScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    <div class="card" style="text-align:center;background:linear-gradient(180deg,#fff,#f0f9ff)">
      <div class="bigring">
        ${ring(S.water.ml,S.water.goal,200,18,'url(#wg)','#e0f2fe')}
        <svg width="0" height="0"><defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs></svg>
        <div class="mid">
          <div style="font-size:42px;font-weight:800;font-family:Sora;color:#0284c7">${pctR}%</div>
          <div style="font-size:13px;color:var(--muted);font-weight:600">${fmtL(S.water.ml)} / ${fmtL(S.water.goal)}</div>
        </div>
      </div>
      <div style="font-size:14px;font-weight:600;color:#0369a1;margin-top:8px">${msg}</div>
      <div style="font-size:12.5px;color:var(--muted);margin-top:4px">${remaining>0?fmtL(remaining)+' to go today':'Daily goal complete'}</div>
    </div>

    <div class="wq">
      <button onclick="addWater(250)">+250<br><small style="font-weight:500;color:var(--muted)">ml</small></button>
      <button onclick="addWater(500)">+500<br><small style="font-weight:500;color:var(--muted)">ml</small></button>
      <button onclick="addWater(750)">+750<br><small style="font-weight:500;color:var(--muted)">ml</small></button>
    </div>
    <button class="btn btn-line btn-sm" style="width:100%;margin-top:12px" onclick="resetWater()">Reset today</button>

    <div class="card" style="margin-top:16px">
      <div style="font-weight:700;font-size:15px;margin-bottom:4px">Smart reminders 🔔</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.5">${S.user.waterInterval?`We'll ${S.user.sound==='silent'?'vibrate':S.user.sound==='chime'?'chime':'beep'} every <b style="color:var(--ink)">${S.user.waterInterval>=60?(S.user.waterInterval/60)+(S.user.waterInterval===60?' hour':' hours'):S.user.waterInterval+' min'}</b> if you haven't logged water — between your wake (${S.user.wake}) and sleep (${S.user.sleep}) times.`:'Reminders are off. Turn them on in Profile.'}</div>
      <button class="btn btn-teal btn-sm" style="width:100%;margin-top:12px" onclick="testBeep()">▶ Test reminder sound</button>
    </div>

    <div class="card flat" style="margin-top:14px">
      <div style="font-weight:700;font-size:14px;margin-bottom:8px">How we set your goal</div>
      <div class="kv"><span class="k">Body weight</span><span class="v">${S.user.weight} kg</span></div>
      <div class="kv"><span class="k">Activity level</span><span class="v">${({1.2:'Mostly sitting',1.4:'Lightly active',1.6:'Active',1.8:'Very active'})[S.user.activity]||'—'}</span></div>
      <div class="kv"><span class="k">Goal focus</span><span class="v">${S.user.goal}</span></div>
      <div class="kv"><span class="k">Daily target</span><span class="v" style="color:#0284c7">${fmtL(S.water.goal)}</span></div>
    </div>
    <div class="disc green" style="margin-top:14px"><span>💡</span><span>Hot weather or exercise? Tap the quick-add buttons more often. Adjust your goal anytime in Profile.</span></div>
    <div style="height:8px"></div>
  `;
}
function addWater(ml){
  S.water.ml=Math.min(S.water.goal*1.5,S.water.ml+ml);
  S.water.last=Date.now();
  beep(S.user.sound==='silent'?'silent':'chime');
  if(S.water.ml>=S.water.goal&&!S.water._done){S.water._done=true;notify('SugarGuard 💧','You reached your water goal today. Well done!');}
  renderWater();saveLocal();
}
function quickWater(){addWater(250);toast("+250ml logged 💧");}
function resetWater(){S.water.ml=0;S.water._done=false;S.water.last=Date.now();renderWater();}
function testBeep(){beep(S.user.sound);toast("That's your reminder sound 🔔");}

/* reminder engine */
function startReminders(){
  if(S.reminderTimer)clearInterval(S.reminderTimer);
  S.reminderTimer=setInterval(()=>{
    if(!S.user.waterInterval)return;
    const now=new Date(),hh=now.getHours()+now.getMinutes()/60;
    const wake=parseTime(S.user.wake),sleep=parseTime(S.user.sleep);
    const awake = sleep>wake ? (hh>=wake&&hh<=sleep) : (hh>=wake||hh<=sleep);
    if(!awake)return;
    const since=(Date.now()-S.water.last)/60000;
    if(since>=S.user.waterInterval && S.water.ml<S.water.goal){
      S.water.last=Date.now();
      notify('Time to drink water 💧',`Tap +250ml to stay on track for your ${fmtL(S.water.goal)} goal.`);
      if(currentScreen==='home'){S.alerts.push({title:'Hydration reminder 💧',body:"It's time for some water — tap the water tile to log it.",level:'low'});renderHome();}
    }
  },20000); // checks frequently in preview
}
function parseTime(t){const[h,m]=(t||'06:30').split(':').map(Number);return h+m/60;}

/* ============================================================
   FOOD PHOTO SCANNER  (estimate only — clearly labelled)
============================================================ */
function renderScan(){
  $('#scanScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    <div class="disc"><span>📷</span><span>The scanner gives an <b>AI food-recognition estimate</b> from your photo. It identifies likely foods and estimates glycemic load — it does <b>not</b> measure blood sugar.</span></div>
    <img id="scanImg" class="scanpreview">
    <label class="scanbox" id="scanBox" style="margin-top:14px">
      <input type="file" accept="image/*" capture="environment" style="display:none" onchange="handleScan(event)">
      <div style="font-size:42px">📸</div>
      <div style="font-weight:700;font-size:16px;color:var(--green)">Take or upload a food photo</div>
      <div style="font-size:13px;color:var(--muted);max-width:240px">Point at your plate. We'll estimate the foods and their sugar impact.</div>
      <div class="btn btn-teal btn-sm" style="margin-top:4px;pointer-events:none">Choose photo</div>
    </label>
    <div id="scanOut" style="margin-top:16px"></div>
    <div style="height:20px"></div>
  `;
}
function handleScan(e){
  const file=e.target.files[0];if(!file)return;
  const url=URL.createObjectURL(file);
  const img=$('#scanImg');img.src=url;img.style.display='block';
  $('#scanBox').style.display='none';
  $('#scanOut').innerHTML=`<div class="card"><div class="scanning"><span class="spin"></span> Analysing your photo… recognising foods</div></div>`;
  // simulated recognition: pick 1-2 plausible foods (demo). Real build = vision API.
  setTimeout(()=>{
    const guesses=[FOODS[Math.floor(Math.random()*8)]];
    if(Math.random()>.5)guesses.push(FOODS.find(f=>f.cat==='soup'));
    const gl=guesses.reduce((a,f)=>a+Math.round(f.gi*f.carbs/100),0),b=glBand(gl);
    selectedFoods=guesses;window._mealType='lunch';
    $('#scanOut').innerHTML=`
      <div class="card" style="background:linear-gradient(135deg,#fff,${b.bg})">
        <div class="eyebrow">AI food-recognition estimate</div>
        <div style="font-size:13px;color:var(--muted);margin:4px 0 12px">Likely foods detected — confirm or edit below.</div>
        ${guesses.map(f=>{const g=Math.round(f.gi*f.carbs/100),fb=glBand(g);return `<div class="food" style="margin-bottom:8px"><div class="fic">${f.e}</div><div style="flex:1"><div class="fn">${f.n} <span style="font-size:11px;color:var(--muted);font-weight:500">~${60+Math.floor(Math.random()*30)}% match</span></div><div class="fm">GI ${f.gi} · ${f.carbs}g</div></div><div class="gltag" style="background:${fb.bg};color:${fb.color}">GL ${g}</div></div>`;}).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:12px;border-top:1px solid var(--line)">
          <div style="font-weight:700">Estimated meal load</div>
          <div style="font-size:26px;font-weight:800;font-family:Sora;color:${b.color}">${gl} <span class="statuspill" style="font-size:11px;background:${b.bg};color:${b.color}">${b.label}</span></div>
        </div>
        <button class="btn btn-primary btn-sm" style="width:100%;margin-top:14px" onclick="confirmLogMeal()">Confirm & log this meal</button>
        <button class="btn btn-line btn-sm" style="width:100%;margin-top:8px" onclick="go('meal')">Edit foods manually</button>
      </div>
      <div class="disc" style="margin-top:12px"><span>⚠️</span><span>Photo estimates are approximate. For accuracy, confirm the foods and portions.</span></div>`;
    beep(S.user.sound);
  },1800);
}

/* ============================================================
   SLEEP + EXERCISE
============================================================ */
function renderSleep(){
  $('#sleepScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    <div class="card" style="text-align:center;background:linear-gradient(180deg,#fff,#f5f3ff)">
      <div style="font-size:40px">🌙</div>
      <div style="font-size:42px;font-weight:800;font-family:Sora;color:#7c3aed;margin-top:4px">${S.sleepHrs??'—'}<small style="font-size:16px;color:var(--muted)"> hrs</small></div>
      <div style="font-size:13px;color:var(--muted)">${S.sleepHrs?(S.sleepHrs>=7?'Great rest supports steadier glucose 💜':'A little short — aim for 7–9 hrs'):'Log last night’s sleep'}</div>
    </div>
    <div class="card" style="margin-top:14px">
      <div style="font-weight:700;margin-bottom:12px">How many hours did you sleep?</div>
      <div class="chips">${[5,6,6.5,7,7.5,8,8.5,9].map(h=>`<button class="chip" style="border-color:var(--line);color:var(--ink);${S.sleepHrs===h?'background:var(--mint);border-color:var(--teal);color:var(--green)':''}" onclick="setSleep(${h})">${h} hrs</button>`).join('')}</div>
    </div>
    <div class="disc green" style="margin-top:14px"><span>💜</span><span>Your wake/sleep times (${S.user.wake} – ${S.user.sleep}) also guide your reminder window so we never beep while you sleep.</span></div>
  `;
}
function setSleep(h){S.sleepHrs=h;renderSleep();toast(h+" hrs logged 🌙");saveLocal();}

function renderExercise(){
  const total=S.exercise.reduce((a,e)=>a+e.mins,0);
  $('#exScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    <div class="card" style="text-align:center;background:linear-gradient(180deg,#fff,#fff7ed)">
      <div style="font-size:40px">🏃</div>
      <div style="font-size:42px;font-weight:800;font-family:Sora;color:#ea580c;margin-top:4px">${total}<small style="font-size:16px;color:var(--muted)"> min today</small></div>
      <div style="font-size:13px;color:var(--muted)">${total>=30?'Movement helps lower sugar spikes 🔥':'A short walk after meals helps a lot'}</div>
    </div>
    <div class="card" style="margin-top:14px">
      <div style="font-weight:700;margin-bottom:12px">Log an activity</div>
      ${[['Walking','🚶',15],['Brisk walk','🏃',20],['Jogging','🏃‍♂️',30],['Home workout','💪',25],['Cycling','🚴',30],['Dancing','💃',20]].map(([n,e,m])=>`<button class="food" style="width:100%;text-align:left;border:none" onclick="addEx('${n}',${m})"><div class="fic">${e}</div><div style="flex:1"><div class="fn">${n}</div><div class="fm">+${m} min</div></div><div style="font-size:20px;color:var(--orange)">＋</div></button>`).join('')}
    </div>
    ${S.exercise.length?`<div class="sectitle">Today's activity</div>${S.exercise.map((e,i)=>`<div class="food"><div class="fic" style="background:#fff7ed">🏃</div><div style="flex:1"><div class="fn">${e.type}</div><div class="fm">${e.mins} min</div></div><button onclick="rmEx(${i})" style="color:var(--muted);font-size:18px">✕</button></div>`).join('')}`:''}
    <div style="height:8px"></div>
  `;
}
function addEx(t,m){S.exercise.push({type:t,mins:m});beep('chime');renderExercise();toast(t+" logged 🏃");saveLocal();}
function rmEx(i){S.exercise.splice(i,1);renderExercise();}

/* ============================================================
   AI COACHING (rule-based, goal-aware)
============================================================ */
let chatLog=[];
function renderChat(){
  if(!chatLog.length){
    chatLog.push({role:'ai',text:`Hi ${S.user.name||'there'} 👋 I'm your SugarGuard coach. Your goal is <b>${S.user.goal}</b>. Ask me about any food, portion, or how to lower a sugar spike. I share estimates and general guidance — not medical advice.`});
  }
  $('#chatScroll').innerHTML=`<div class="chat">${chatLog.map(m=>`<div class="msg ${m.role==='ai'?'ai':'me'}">${m.text}</div>`).join('')}
    <div class="chipsuggest">
      <button onclick="askSuggest('Is jollof rice okay for me?')">Is jollof rice okay?</button>
      <button onclick="askSuggest('How do I lower a sugar spike?')">Lower a spike</button>
      <button onclick="askSuggest('What should I eat tonight?')">Dinner idea</button>
      <button onclick="askSuggest('How much water should I drink?')">Water goal</button>
    </div></div>`;
  const sc=$('#chatScroll');sc.scrollTop=sc.scrollHeight;
}
function askSuggest(q){$('#chatInput').value=q;sendChat();}
function sendChat(){
  const inp=$('#chatInput'),q=inp.value.trim();if(!q)return;
  chatLog.push({role:'me',text:q});inp.value='';
  renderChat();
  setTimeout(()=>{chatLog.push({role:'ai',text:coachReply(q)});renderChat();},500);
}
function coachReply(q){
  const t=q.toLowerCase();
  const prem = S.user.premium?'':'<br><br>💡 <b>Premium</b> unlocks a full personalised meal plan built around your goal, age and gender.';
  // food lookup
  const found=FOODS.find(f=>t.includes(f.n.toLowerCase().split(' ')[0])&&f.n.length>3);
  if(found){const gl=Math.round(found.gi*found.carbs/100),b=glBand(gl);
    return `<b>${found.n}</b> has an estimated GL of <b>${gl} (${b.label})</b>. ${found.pair} ${found.portion} Best time: ${found.time.toLowerCase()}`;}
  if(/spike|lower|reduce/.test(t))return `To soften an estimated sugar spike: 1) Eat protein and vegetables <i>before</i> the starch. 2) Keep swallow/rice to one cupped-hand portion. 3) Take a 10–15 min walk after eating. 4) Drink water with your meal. 5) Add fibre like vegetables or beans.${prem}`;
  if(/water|drink|hydrat/.test(t))return `Your tailored water goal is <b>${fmtL(S.water.goal)}/day</b>, based on your weight (${S.user.weight}kg), activity and goal. You're at ${fmtL(S.water.ml)} so far. I'll ${S.user.sound==='silent'?'vibrate':'beep'} to remind you every ${S.user.waterInterval} min while you're awake.`;
  if(/dinner|tonight|eat|meal|breakfast|lunch/.test(t)){
    const low=FOODS.filter(f=>Math.round(f.gi*f.carbs/100)<=10).slice(0,3).map(f=>f.n).join(', ');
    return `For a gentle evening meal aligned with <b>${S.user.goal}</b>, try low-impact options like ${low}. Pair any swallow with a vegetable-rich soup and grilled protein, and keep the portion modest.${prem}`;}
  if(/diabet|sugar|glucose/.test(t))return `SugarGuard helps you spot which foods give a higher <i>estimated</i> sugar impact so you can choose smaller portions, better pairings and good timing. It can't diagnose or measure blood sugar — please keep following your doctor's guidance and any meter/CGM they recommend.`;
  if(/weight|lose|loss/.test(t))return `For weight goals: focus on lower-GL meals (beans, vegetable soups, lean protein), watch swallow/rice portions, stay hydrated, and move after meals. Small steady changes beat drastic ones.${prem}`;
  return `Good question! I can estimate any food's sugar impact, suggest portions and pairings, and help you hit your <b>${S.user.goal}</b> goal. Try naming a food (e.g. "amala", "beans", "puff puff") or ask how to lower a spike.${prem}`;
}

/* ============================================================
   REPORTS
============================================================ */
function renderReports(){
  const hist=[...S.glHistory,todayGL()];
  const avg=Math.round(hist.reduce((a,b)=>a+b,0)/hist.length);
  const high=hist.filter(v=>v>=20).length, days=['Sun','Mon','Tue','Wed','Thu','Fri','Today'];
  const maxH=Math.max(20,...hist);
  $('#reportsScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    ${!S.user.premium?`<div class="card" style="background:linear-gradient(135deg,var(--green),#0b3d28);color:#fff;border:none"><div style="font-weight:700;font-size:16px">📄 Weekly PDF report</div><div style="font-size:13px;color:#bfe9d6;margin:6px 0 12px">Premium members get a beautiful weekly report — GL trends, hydration, sleep and tailored tips — exportable as PDF.</div><button class="btn btn-teal btn-sm" style="width:100%" onclick="go('premium')">Unlock with Premium</button></div>`:''}
    <div class="card" style="margin-top:14px">
      <div style="font-weight:700;font-size:15px;margin-bottom:10px">This week at a glance</div>
      <div class="tiles">
        <div class="tile flat" style="box-shadow:none;border:1px solid var(--line)"><div class="tl">Avg daily GL</div><div class="tv" style="color:${glBand(avg).color}">${avg} · ${glBand(avg).label}</div></div>
        <div class="tile flat" style="box-shadow:none;border:1px solid var(--line)"><div class="tl">High-GL days</div><div class="tv">${high}</div></div>
        <div class="tile flat" style="box-shadow:none;border:1px solid var(--line)"><div class="tl">Avg water</div><div class="tv">${fmtL(S.water.goal-200)}</div></div>
        <div class="tile flat" style="box-shadow:none;border:1px solid var(--line)"><div class="tl">Avg sleep</div><div class="tv">${S.sleepHrs||7} hrs</div></div>
      </div>
      <div class="bars" style="margin-top:16px">${hist.map((v,i)=>`<div class="b"><div class="bar" style="height:${Math.max(4,v/maxH*100)}%;background:${glBand(v).color}"></div><div class="bl">${days[i]}</div></div>`).join('')}</div>
    </div>
    <div class="card" style="margin-top:14px">
      <div style="font-weight:700;margin-bottom:8px">Coach's note 💬</div>
      <div style="font-size:13.5px;color:var(--muted);line-height:1.55">Your average sugar impact this week is <b style="color:${glBand(avg).color}">${glBand(avg).label.toLowerCase()}</b>. ${avg>15?'Try smaller swallow/rice portions and a short walk after heavy meals.':'Nicely balanced — keep pairing starches with protein and vegetables.'} Aim to hit your ${fmtL(S.water.goal)} water goal daily.</div>
    </div>
    <button class="btn btn-line btn-sm" style="width:100%;margin-top:14px" onclick="exportData()">⬇ Export my data (JSON)</button>
    <div style="height:8px"></div>
  `;
}
function exportData(){
  if(!S.user.premium){toast("Data export is a Premium feature.");go('premium');return;}
  const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sugarguard-data.json';a.click();
  toast("Exported ✓");
}

/* ============================================================
   PREMIUM + PAYSTACK
============================================================ */
function subStatusCard(){
  if(S.sub.status==='active'||S.sub.status==='grace'){
    const left=daysLeft();
    const warn=S.sub.status==='grace'||left<=3;
    return `<div class="card" style="margin-top:14px;border:1.5px solid ${warn?'#fed7aa':'var(--mint-2)'};background:${warn?'#fff7ed':'var(--mint)'}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div class="eyebrow" style="color:${warn?'var(--orange)':'var(--teal)'}">${S.sub.status==='grace'?'Payment retrying':'Active subscription'}</div>
        <div style="font-weight:700;font-size:16px;margin-top:2px">⭐ ${S.sub.plan?S.sub.plan[0].toUpperCase()+S.sub.plan.slice(1):'Premium'}</div></div>
        <div style="text-align:right"><div style="font-size:12px;color:var(--muted)">${left>0?'Renews in':'Expired'}</div><div style="font-weight:800;font-family:Sora;color:${warn?'var(--orange)':'var(--green)'}">${left>0?left+' day'+(left>1?'s':''):fmtDate(S.sub.expires)}</div></div>
      </div>
      <div style="font-size:12.5px;color:var(--muted);margin-top:10px">${S.sub.status==='grace'?'Update your card to keep Premium — access pauses if payment isn\u2019t completed.':'Next charge on '+fmtDate(S.sub.expires)+'. Cancel anytime from your Paystack receipt email.'}</div>
    </div>`;
  }
  if(S.sub.status==='expired'){
    return `<div class="card" style="margin-top:14px;border:1.5px solid #fecaca;background:#fef2f2">
      <div class="eyebrow" style="color:var(--red)">Subscription ended</div>
      <div style="font-size:13px;color:var(--muted);margin-top:6px">Your Premium ended on ${fmtDate(S.sub.expires)}. You're on the Free plan (3 checks/day). Renew below to unlock everything again.</div>
    </div>`;
  }
  return '';
}
const PLANS={monthly:{label:'Monthly',price:'₦4,500',sub:'per month',amount:450000},
             yearly:{label:'Yearly',price:'₦20,000',sub:'per year · save 63%',amount:2000000}};
function renderPremium(){
  $('#premiumScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    <div class="card" style="text-align:center;background:linear-gradient(160deg,var(--green),#0b3d28);color:#fff;border:none">
      <div style="font-size:40px">⭐</div>
      <div style="font-size:22px;font-weight:800;font-family:Sora;margin-top:4px">SugarGuard Premium</div>
      <div style="font-size:13.5px;color:#bfe9d6;margin-top:6px">Your full health picture, tailored to your goal, age & gender.</div>
    </div>
    ${subStatusCard()}

    ${[['🍽️','Personalised AI meal plan','Nigerian-friendly, goal & age aware'],
       ['🩺','Diabetes-aware suggestions','Lower-GL swaps for your foods'],
       ['💧','Hydration schedule','Smart beeps timed to your day'],
       ['📄','Weekly PDF report','GL, water, sleep & tips'],
       ['♾️','Unlimited meal checks','No daily limit'],
       ['💬','AI coaching chat','Ask anything, anytime'],
       ['⬇️','Export your data','Own your numbers']
     ].map(([e,t,d])=>`<div class="feat" style="margin-top:14px"><div style="font-size:20px">${e}</div><div><b>${t}</b><br><span style="color:var(--muted)">${d}</span></div></div>`).join('')}

    <div class="sectitle">Choose your plan</div>
    <div class="plan ${selectedPlan==='yearly'?'sel':''}" onclick="selPlan('yearly')">
      <div class="badge">BEST VALUE</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end"><div><h3>Yearly</h3><div style="font-size:12.5px;color:var(--muted)">Save 63% vs monthly</div></div><div class="price">₦20,000<small>/yr</small></div></div>
    </div>
    <div class="plan ${selectedPlan==='monthly'?'sel':''}" onclick="selPlan('monthly')">
      <div style="display:flex;justify-content:space-between;align-items:flex-end"><div><h3>Monthly</h3><div style="font-size:12.5px;color:var(--muted)">Cancel anytime</div></div><div class="price">₦4,500<small>/mo</small></div></div>
    </div>
    <div class="plan" style="border-style:dashed">
      <div style="display:flex;justify-content:space-between;align-items:flex-end"><div><h3>Free</h3><div style="font-size:12.5px;color:var(--muted)">3 checks/day · basic water & GL</div></div><div class="price" style="font-size:20px;color:var(--muted)">₦0</div></div>
    </div>

    <button class="btn btn-primary" style="margin-top:16px" onclick="payNow()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
      Pay ${PLANS[selectedPlan].price} with Paystack
    </button>
    <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;font-size:11.5px;color:var(--muted)">🔒 Secured by Paystack · Cards, Bank, USSD & Transfer</div>
    <div class="disc green" style="margin-top:16px"><span>ℹ️</span><span>Premium adds guidance and convenience features. It remains a wellness tool — not a medical device — and does not measure blood glucose.</span></div>
    <div style="height:8px"></div>
  `;
}
function selPlan(p){selectedPlan=p;renderPremium();}
function payNow(){
  openSheet(`
    <div style="text-align:center;padding:6px 0">
      <div style="width:54px;height:54px;border-radius:16px;background:#011b33;display:grid;place-items:center;margin:0 auto 14px;color:#3bb75e;font-weight:800;font-family:Sora;font-size:22px">P</div>
      <h2 style="font-size:20px">Paystack Checkout</h2>
      <div style="font-size:13px;color:var(--muted);margin-top:4px">SugarGuard ${PLANS[selectedPlan].label} · ${PLANS[selectedPlan].price}</div>
    </div>
    <div class="field" style="margin-top:14px"><label style="color:var(--muted)">Email for receipt & account</label><input id="pay_email" type="email" placeholder="you@email.com" style="background:#fff;border:1.5px solid var(--line);color:var(--ink)" value="${S.user.email||''}"></div>
    <div class="card flat" style="margin:6px 0 14px">
      <div class="kv"><span class="k">Plan</span><span class="v">${PLANS[selectedPlan].label}</span></div>
      <div class="kv"><span class="k">Total today</span><span class="v" style="color:var(--green)">${PLANS[selectedPlan].price}</span></div>
      <div class="kv"><span class="k">Renews</span><span class="v">${selectedPlan==='yearly'?'Yearly':'Monthly'}</span></div>
    </div>
    <button class="btn btn-primary" id="payBtn" onclick="startPaystack()">Pay ${PLANS[selectedPlan].price} with Paystack</button>
    <button class="btn btn-line btn-sm" style="width:100%;margin-top:10px" onclick="closeSheet()">Cancel</button>
    <div style="font-size:11px;color:var(--muted);text-align:center;margin-top:12px;line-height:1.5">🔒 You'll be charged securely by Paystack. Your subscription is verified on our server and renews automatically. Cancel anytime.</div>
  `);
}

/* Real Paystack inline checkout -> server verification */
function startPaystack(){
  const email=($('#pay_email').value||'').trim();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){toast("Enter a valid email address.");return;}
  S.user.email=email;
  if(typeof PaystackPop==='undefined'||!CONFIG.PAYSTACK_PUBLIC_KEY||CONFIG.PAYSTACK_PUBLIC_KEY.includes('REPLACE')){
    toast("Paystack key not set yet. Add your public key in js/config.js.");
    return;
  }
  const plan=PLANS[selectedPlan];
  const ref='SG-'+selectedPlan.toUpperCase()+'-'+Date.now();
  const handler=PaystackPop.setup({
    key:CONFIG.PAYSTACK_PUBLIC_KEY,
    email:email,
    amount:plan.amount,           // in kobo
    currency:'NGN',
    ref:ref,
    metadata:{plan:selectedPlan,custom_fields:[{display_name:"Plan",variable_name:"plan",value:plan.label}]},
    onClose:function(){toast("Payment window closed.");},
    callback:function(resp){ verifyPayment(resp.reference); }
  });
  handler.openIframe();
}

async function verifyPayment(reference){
  const panel=$('#sheetPanel');
  if(panel)panel.innerHTML=`<div style="text-align:center;padding:40px 0"><div class="spin" style="width:40px;height:40px;margin:0 auto 18px;border-width:4px"></div><div style="font-weight:600">Confirming your payment…</div><div style="font-size:12px;color:var(--muted);margin-top:6px">Verifying securely with Paystack</div></div>`;
  try{
    const r=await fetch(CONFIG.API_BASE+'/verify-payment',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({reference,email:S.user.email,plan:selectedPlan})
    });
    const data=await r.json();
    if(data.success&&data.subscription){
      applySubscription(data.subscription);
      paymentSuccessUI();
    }else{
      throw new Error(data.message||'Verification failed');
    }
  }catch(e){
    if(panel)panel.innerHTML=`<div style="text-align:center;padding:30px 0">
      <div style="width:64px;height:64px;border-radius:50%;background:#fef2f2;display:grid;place-items:center;margin:0 auto 16px;font-size:30px">⚠️</div>
      <h2 style="font-size:20px">We couldn't confirm payment</h2>
      <div style="font-size:13px;color:var(--muted);margin:8px auto 18px;max-width:280px">If you were charged, it will activate shortly. Contact support with reference if needed.</div>
      <button class="btn btn-line btn-sm" style="width:100%" onclick="closeSheet()">Close</button></div>`;
  }
}

function paymentSuccessUI(){
  const panel=$('#sheetPanel');
  if(panel)panel.innerHTML=`<div style="text-align:center;padding:30px 0">
    <div style="width:70px;height:70px;border-radius:50%;background:var(--mint);display:grid;place-items:center;margin:0 auto 16px;font-size:34px">✅</div>
    <h2 style="font-size:22px">You're Premium! 🎉</h2>
    <div style="font-size:13.5px;color:var(--muted);margin:8px auto 20px;max-width:260px">Active until <b style="color:var(--green)">${fmtDate(S.sub.expires)}</b>. We'll remind you before it renews.</div>
    <button class="btn btn-primary" onclick="closeSheet();go('home')">Start exploring</button></div>`;
  beep('chime');
}

/* ============================================================
   MORE / PROFILE / DISCLAIMER
============================================================ */
function renderMore(){
  $('#moreScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    <div class="card" style="display:flex;align-items:center;gap:14px">
      <div class="avatar">${(S.user.name||'S')[0].toUpperCase()}</div>
      <div style="flex:1"><div style="font-weight:700;font-size:17px">${S.user.name||'SugarGuard user'}</div><div style="font-size:12.5px;color:var(--muted)">${S.user.goal} · ${S.user.health}</div>
      <span class="statuspill" style="background:${S.user.premium?'var(--mint)':'#fff7ed'};color:${S.user.premium?'var(--green)':'var(--orange)'};margin-top:6px;font-size:11px">${S.user.premium?'⭐ Premium':'Free plan'}</span></div>
    </div>
    <div class="card" style="margin-top:14px;padding:6px 18px">
      ${[['👤','Profile & Goals','profile'],['📊','Reports','reports'],['⭐','Premium','premium'],['📖','Nigerian Food Database','fooddb'],['🛡️','Medical Disclaimer','disclaimer']].map(([e,t,p])=>`<button class="profrow" style="width:100%;text-align:left;border:none;background:none" onclick="go('${p}')"><div class="pic">${e}</div><div style="flex:1;font-weight:600;font-size:14.5px">${t}</div><div style="color:var(--muted);font-size:18px">›</div></button>`).join('')}
    </div>
    <div class="card" style="margin-top:14px;padding:6px 18px">
      <div class="profrow"><div class="pic">🔔</div><div style="flex:1"><div style="font-weight:600;font-size:14.5px">Water reminders</div><div style="font-size:12px;color:var(--muted)">${S.user.waterInterval?'Every '+S.user.waterInterval+' min':'Off'}</div></div><div class="toggle ${S.user.waterInterval?'on':''}" onclick="toggleReminders(this)"></div></div>
      <div class="profrow" style="border:none"><div class="pic">📶</div><div style="flex:1"><div style="font-weight:600;font-size:14.5px">Connect CGM / wearable</div><div style="font-size:12px;color:var(--muted)">Show real sensor readings (coming soon)</div></div><div style="color:var(--muted);font-size:12px;font-weight:600">Soon</div></div>
    </div>
    <div class="disc green" style="margin-top:14px"><span>📶</span><span>No sensor connected. All readings shown are <b>estimates</b> from food data. Connect a certified CGM/wearable later to see real glucose readings, labelled separately.</span></div>
    <button class="btn btn-line btn-sm" style="width:100%;margin-top:14px" onclick="restart()">Restart onboarding</button>
    <div style="text-align:center;font-size:11px;color:var(--muted);margin-top:16px">SugarGuard · wellness & awareness · v1.0</div>
    <div style="height:8px"></div>
  `;
}
function toggleReminders(elm){
  elm.classList.toggle('on');
  S.user.waterInterval=elm.classList.contains('on')?90:0;
  toast(S.user.waterInterval?'Reminders on 🔔':'Reminders off');
}

function renderProfile(){
  $('#profileScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    <div class="card">
      <div class="field" style="margin-bottom:12px"><label style="color:var(--muted)">Name</label><input id="p_name" value="${S.user.name}" style="background:#fff;border:1.5px solid var(--line);color:var(--ink)"></div>
      <div class="row2"><div class="field"><label style="color:var(--muted)">Age</label><input id="p_age" type="number" value="${S.user.age}" style="background:#fff;border:1.5px solid var(--line);color:var(--ink)"></div>
      <div class="field"><label style="color:var(--muted)">Weight (kg)</label><input id="p_weight" type="number" value="${S.user.weight}" style="background:#fff;border:1.5px solid var(--line);color:var(--ink)"></div></div>
      <div class="field" style="margin-bottom:12px"><label style="color:var(--muted)">Goal</label><select id="p_goal" style="background:#fff;border:1.5px solid var(--line);color:var(--ink)">${['Diabetes awareness','Glucose awareness','Weight loss','Hydration','Healthy eating','Fitness','Pregnancy wellness','Family nutrition'].map(g=>`<option ${g===S.user.goal?'selected':''}>${g}</option>`).join('')}</select></div>
      <div class="field" style="margin-bottom:12px"><label style="color:var(--muted)">Health status</label><select id="p_health" style="background:#fff;border:1.5px solid var(--line);color:var(--ink)">${['Diabetic','Pre-diabetic','Not diabetic','Unsure'].map(h=>`<option ${h===S.user.health?'selected':''}>${h}</option>`).join('')}</select></div>
      <div class="row2"><div class="field"><label style="color:var(--muted)">Wake</label><input id="p_wake" type="time" value="${S.user.wake}" style="background:#fff;border:1.5px solid var(--line);color:var(--ink)"></div>
      <div class="field"><label style="color:var(--muted)">Sleep</label><input id="p_sleep" type="time" value="${S.user.sleep}" style="background:#fff;border:1.5px solid var(--line);color:var(--ink)"></div></div>
      <div class="field" style="margin-bottom:0"><label style="color:var(--muted)">Reminder sound</label><select id="p_sound" style="background:#fff;border:1.5px solid var(--line);color:var(--ink)">${[['beep','Soft beep 🔔'],['chime','Chime ✨'],['silent','Vibrate / silent']].map(([v,l])=>`<option value="${v}" ${v===S.user.sound?'selected':''}>${l}</option>`).join('')}</select></div>
    </div>
    <button class="btn btn-primary" style="margin-top:14px" onclick="saveProfile()">Save changes</button>
    <div style="height:8px"></div>
  `;
}
function saveProfile(){
  S.user.name=$('#p_name').value.trim()||S.user.name;
  S.user.age=+$('#p_age').value||S.user.age;
  S.user.weight=+$('#p_weight').value||S.user.weight;
  S.user.goal=$('#p_goal').value;S.user.health=$('#p_health').value;
  S.user.wake=$('#p_wake').value;S.user.sleep=$('#p_sleep').value;S.user.sound=$('#p_sound').value;
  S.water.goal=calcWaterGoal();
  saveLocal();
  toast("Saved ✓");go('more');
}

function renderDisc(){
  $('#discScroll').innerHTML=`
    <div style="padding-top:14px"></div>
    <div class="card">
      <div style="width:56px;height:56px;border-radius:16px;background:var(--mint);display:grid;place-items:center;font-size:28px;margin-bottom:14px">🛡️</div>
      <h2 style="font-size:20px;margin-bottom:10px">Important: please read</h2>
      <div style="font-size:14px;line-height:1.65;color:var(--ink)">
        <p><b>SugarGuard is a wellness and awareness tool, not a medical device.</b></p>
        <p style="margin-top:12px;color:var(--muted)">It does <b>not</b> diagnose diabetes or any condition, and it does <b>not</b> replace a doctor, blood glucose meter, CGM, or certified wearable sensor.</p>
        <p style="margin-top:12px;color:var(--muted)">Your phone <b>cannot</b> measure real blood glucose by touching your skin. Any figure you see in this app is an <b>estimate</b> calculated from each food's glycemic index, your stated portion, timing and the details you enter.</p>
        <p style="margin-top:12px;color:var(--muted)">Estimated sugar-impact "peak" alerts are general timing guides based on food type — not a reading of your actual blood sugar.</p>
        <p style="margin-top:12px;color:var(--muted)">If you connect a certified CGM or wearable in future, real sensor readings will be shown <b>separately and clearly labelled</b> as device readings.</p>
        <p style="margin-top:12px;color:var(--muted)">Always follow your doctor's guidance for diagnosis, medication, diet and any health decision. If you feel unwell, seek medical care.</p>
      </div>
    </div>
    <div class="disc" style="margin-top:14px"><span>⚠️</span><span>Never change medication or treatment based on SugarGuard estimates.</span></div>
    <div style="height:8px"></div>
  `;
}

function restart(){
  if(S.reminderTimer)clearInterval(S.reminderTimer);
  if(S.subTimer)clearInterval(S.subTimer);
  try{localStorage.removeItem('sg_state');}catch(e){}
  location.reload();
}

/* ============================================================
   SHEET + INIT
============================================================ */
function openSheet(html){$('#sheetPanel').innerHTML='<div class="grab"></div>'+html;$('#sheet').classList.add('show');}
function closeSheet(){$('#sheet').classList.remove('show');}

// register a tiny service worker for installable PWA (inline)
if('serviceWorker'in navigator){
  const sw=`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('fetch',()=>{});`;
  const url=URL.createObjectURL(new Blob([sw],{type:'text/javascript'}));
  navigator.serviceWorker.register(url).catch(()=>{});
}

// expose for inline handlers
Object.assign(window,{onbNext,loadDemo,finishOnb,go,quickWater,pickMealType,filterFoods,toggleFood,
  confirmLogMeal,openMealDetail,deleteMeal,filterDB,openFoodDetail,quickAdd,addWater,quickWater,
  resetWater,testBeep,handleScan,setSleep,addEx,rmEx,sendChat,askSuggest,exportData,selPlan,payNow,
  startPaystack,verifyPayment,toggleReminders,saveProfile,restart,closeSheet});

// boot on load
if(document.readyState!=='loading')boot();else document.addEventListener('DOMContentLoaded',boot);
