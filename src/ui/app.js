// Flavour Lab · interfaccia
// Un solo banco di lavoro attraversa le tre sezioni: in «Esplora» si scoprono gli ingredienti e si mettono sul banco,
// in «Abbina» si capisce se il banco sta in piedi, in «Crea» il banco diventa una ricetta.
// Ogni vista ha un indirizzo (#esplora/…, #abbina/…, #crea/…): si condivide e il tasto «indietro» funziona.
import { ALLERG, BYID, BYNAME, CATS, FAM, FOODS, ORIG, SBYNAME, SGROUP, SPIRITS, TLABEL, TORDER, W } from '../domain/core.js';
import { bar, owns, preferOwned, barLineHTML, openBar, openNotebook, noteAdd, openBancone, shareImage } from './tools.js';
import { homeHTML, moodHTML, MOODS, CLASSICS, classicTwists } from './home.js';
import { impronta, sharedFams, famLbl, catIcon, catIconOf, icon } from './visual.js';
import { S as score, howTo, listIt, monthsTxt, partnersOf, spiritsOf, trioSpirits, spec as specT } from '../domain/scoring.js';
import { TLENS, roles, spiritsForTrio, suggestThird, trio, lensReason } from '../domain/trio.js';
import { BASES, BGROUPS, STY, abvOf, buildRecipe, coherence, fmt, styleFit, suggestBases, autoStyleFor } from '../domain/recipes.js';
import SPINFO from '../../data/spirits-info.json';
import { $, $$, esc, tcol, TOUCH, calm, num, cap, aD, VERD, vOf, meter, REL, relTag, LENSP, STRUCT, plain, noChem, firstSentence, mark, kindOf, shortKind,
  pol, arcPath, trunc, spread, labelAt, wrapName, labelLines, radar, GLASSES, glassSVG, makeCombo, toast, copyText } from './kit.js';

const CATORD={};Object.keys(CATS).forEach((k,i)=>CATORD[k]=i);
const pairT=(a,b)=>a.isSpirit&&b.isSpirit?null:(a.isSpirit?score(b,a):score(a,b));
const topFams=(I,n=3)=>I.ar.map((v,i)=>[v,i]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,n).map(x=>FAM[x[1]][1].toLowerCase());
const dots=n=>'●'.repeat(n)+'○'.repeat(5-n);
const listY=a=>a.length<=1?a.join(''):a.slice(0,-1).join(', ')+' e '+a[a.length-1];

// ===================== stato =====================
const S={tab:'esplora',sel:null,mode:'browse',zoom:null,cat:null,filter:'all',egoAll:false,spAll:false,pAll:false,parts:[],sps:[],trio:{},lens:'debole'};
const CK={style:null,styleAuto:false,base:null,view:'classic',bgroup:'all',baseOpen:false,mixView:'gusti',classic:null};
const MAXB=5;
let bench=[];
try{bench=(JSON.parse(localStorage.getItem('flavourlab.bench')||'[]')||[]).map(id=>BYID[id]).filter(Boolean).slice(0,MAXB);}catch(e){bench=[];}
const saveBench=()=>{try{localStorage.setItem('flavourlab.bench',JSON.stringify(bench.map(I=>I.id)));}catch(e){}};
const onBench=I=>bench.includes(I);

// ===================== indirizzi e cronologia =====================
function hashFor(tab){
  if(tab==='esplora')return S.sel?`#esplora/${S.sel.id}`:'#esplora';
  const ids=bench.map(I=>I.id).join('+');
  if(tab==='abbina')return ids?`#abbina/${ids}`:'#abbina';
  let h=ids?`#crea/${ids}`:'#crea';
  if(ids&&((CK.style&&!CK.styleAuto)||CK.base))h+=`/${CK.style&&!CK.styleAuto?CK.style:'-'}`;
  if(ids&&CK.base)h+=`/${CK.base.id}`;
  return h;}
// in alcune anteprime (iframe isolati, file aperti in locale) la cronologia non si può scrivere: si ripiega sull'hash, e se anche quello è bloccato si va avanti senza indirizzo
let histOK=true;
function setHash(h,push){if(location.hash===h)return;if(histOK){try{history[push?'pushState':'replaceState'](null,'',h);return;}catch(e){histOK=false;}}
  try{location.hash=h;}catch(e){}}
function sync(push){setHash(hashFor(S.tab),push);}
function benchFromIds(s){const arr=s.split('+').map(id=>BYID[id]).filter(Boolean);const out=[];arr.forEach(I=>{if(!out.includes(I)&&out.length<MAXB)out.push(I);});bench=out;saveBench();}
function route(){
  const raw=decodeURIComponent(location.hash.slice(1));const [t,a,b,c]=raw.split('/');
  if(t==='abbina'||t==='verifica'){if(a)benchFromIds(a);show('abbina');return;}
  if(t==='crea'||t==='cocktail'){if(a)benchFromIds(a);
    if(b&&b!=='-'&&STY[b]){CK.style=b;CK.styleAuto=false;}else if(a&&!b){CK.styleAuto=true;}
    CK.base=c&&BYID[c]?BYID[c]:(a?null:CK.base);show('crea');return;}
  const id=t==='esplora'?a:t;const f=id&&BYID[id];
  if(f&&!f.isSpirit){if(f!==S.sel)select(f,{nav:false,keepMode:!!S.sel});}
  else if(t==='esplora'&&!a&&S.sel){S.sel=null;S.mode='browse';}
  show('esplora');}
addEventListener('popstate',route);addEventListener('hashchange',route);

// ===================== sezioni =====================
const TABS=['esplora','abbina','crea'];
function show(t,{push=false}={}){
  S.tab=t;
  TABS.forEach(k=>{$('#v-'+k).hidden=k!==t;const b=$('#tb-'+k);b.setAttribute('aria-selected',String(k===t));b.tabIndex=k===t?0:-1;});
  if(t==='esplora')renderEsplora();if(t==='abbina')renderAbbina();if(t==='crea')renderCrea();
  renderBenches();renderTray();sync(push);}
TABS.forEach(k=>$('#tb-'+k).addEventListener('click',()=>{if(S.tab===k)return;show(k,{push:true});scrollTo({top:0});}));
$('#tabbar').addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;const i=TABS.indexOf(S.tab);
  const nx=TABS[(i+(e.key==='ArrowRight'?1:TABS.length-1))%TABS.length];show(nx,{push:true});$('#tb-'+nx).focus();});
$('.brand').addEventListener('click',e=>{e.preventDefault();goHome();});
$('#share').addEventListener('click',()=>copyText(location.href,'Link copiato'));
// la bottigliera cambia le basi proposte e le etichette «ce l'hai»: si ridisegna la sezione aperta
function barChanged(){if(S.tab==='crea')renderCrea();if(S.tab==='esplora'&&S.sel)renderSpirits();}
$('#openBar').addEventListener('click',()=>openBar(barChanged));
$('#openNb').addEventListener('click',()=>openNotebook());
document.addEventListener('click',e=>{if(e.target.closest('[data-open-bar]'))openBar(barChanged);});
document.addEventListener('keydown',e=>{if(e.key!=='/'||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t.closest&&t.closest('input,textarea,select'))return;
  if(S.tab!=='esplora')show('esplora',{push:true});e.preventDefault();$('#q-main').focus();});

// ===================== banco =====================
function benchChanged(){saveBench();renderBenches();renderTray();
  if(S.tab==='abbina')renderAbbina();if(S.tab==='crea')renderCrea();if(S.tab==='esplora')refreshBenchMarks();sync(false);}
function benchAdd(I,{quiet=false}={}){if(onBench(I))return true;if(bench.length>=MAXB){toast('Il banco è pieno: togli un ingrediente');return false;}
  bench.push(I);if(!quiet)toast(`${I.name} è sul banco`);benchChanged();return true;}
function benchRemove(I){const i=bench.indexOf(I);if(i<0)return;bench.splice(i,1);if(CK.base===I)CK.base=null;benchChanged();}
function benchToggle(I){onBench(I)?benchRemove(I):benchAdd(I);}
function benchSet(arr){bench=arr.slice(0,MAXB);CK.base=null;CK.styleAuto=true;CK.style=null;benchChanged();}
// suggerimenti per il banco: 16 ingredienti (al massimo 3 per categoria, per varietà) e 6 alcolici, ordinati per il legame più debole con il banco
function benchSuggest(){if(!bench.length)return null;
  const rank=pool=>pool.filter(x=>!bench.includes(x)).map(x=>{const ts=bench.map(i=>pairT(i,x)).filter(Boolean).map(r=>r.total);const m=ts.length?Math.min(...ts):-1;return{x,m,k:x.isSpirit?specT(m,x):m};})
    .filter(o=>o.m>=14).sort((a,b)=>b.k-a.k);
  const per={};const foods=rank(FOODS).filter(o=>{per[o.x.cat]=(per[o.x.cat]||0)+1;return per[o.x.cat]<=3;}).slice(0,16).map(o=>o.x);
  const DASH=['Angostura',"Peychaud's",'Orange bitters'];// si usano a gocce: non sono «da bere»
  const sps=rank(SPIRITS.filter(x=>!DASH.includes(x.name))).slice(0,6).map(o=>o.x);
  const who=bench.length===1?aD(bench[0].name):'con il tuo banco';
  return {label:`Stanno bene ${who}`,items:foods.concat(sps),groups:[{label:`Ingredienti che stanno bene ${who}`,items:foods},{label:'Da bere',items:sps}]};}

const PAIR_EX=[['Gorgonzola','Pera'],['Fragola','Basilico'],['Cioccolato fondente','Arancia'],['Pomodoro','Fragola']].map(p=>p.map(n=>BYNAME[n])).filter(p=>p[0]&&p[1]);
const DRINK_EX=[['Fragola','Basilico'],['Pompelmo','Rosmarino'],['Caffè','Arancia'],['Cetriolo','Menta']].map(p=>p.map(n=>BYNAME[n])).filter(p=>p[0]&&p[1]);
const benchCombos={};
function renderBenches(){$$('[data-bench]').forEach(host=>{const ctx=host.dataset.bench;
  if(!host.dataset.ready){host.dataset.ready='1';
    host.innerHTML=`<div class="bench-h"><h2>Il tuo banco</h2><span class="tiny muted" data-count></span></div><ul class="bench-list" data-list></ul><div class="combo" data-add></div><div class="bench-ex" data-ex></div><div class="bench-foot" data-foot></div>`;
    benchCombos[ctx]=makeCombo(host.querySelector('[data-add]'),{id:'q-bench-'+ctx,label:'Aggiungi un ingrediente al banco',placeholder:'Aggiungi un alimento o un alcolico…',
      source:()=>FOODS.concat(SPIRITS).filter(x=>!bench.includes(x)),suggest:benchSuggest,
      onPick:f=>{if(benchAdd(f,{quiet:true})&&bench.length<MAXB)setTimeout(()=>benchCombos[ctx].focusQuiet(),0);}});
    host.addEventListener('click',e=>{const r=e.target.closest('[data-rm]');if(r){benchRemove(BYID[r.dataset.rm]);return;}
      const x=e.target.closest('[data-set]');if(x){benchSet(x.dataset.set.split('+').map(id=>BYID[id]));return;}
      if(e.target.closest('[data-clear]')){bench=[];CK.base=null;benchChanged();return;}
      if(e.target.closest('[data-go-crea]')){show('crea',{push:true});scrollTo({top:0});return;}
      if(e.target.closest('[data-go-abbina]')){show('abbina',{push:true});scrollTo({top:0});}});}
  const n=bench.length;
  host.querySelector('[data-count]').textContent=`${n} di ${MAXB}`;
  host.querySelector('[data-list]').innerHTML=bench.map(I=>`<li>${impronta(I,34,{label:false})}<span class="bi"><b>${esc(I.name)}${spInfo(I)}</b><small>${esc(shortKind(I))}</small></span><button type="button" class="x" data-rm="${I.id}" aria-label="Togli ${esc(I.name)} dal banco">×</button></li>`).join('')
    +(n<2?`<li class="ph" aria-hidden="true">${n?'Aggiungi almeno un altro ingrediente':'Il banco è vuoto'}</li>`:'');
  host.querySelector('[data-add]').hidden=n>=MAXB;
  const exs=ctx==='crea'?DRINK_EX:PAIR_EX;
  host.querySelector('[data-ex]').innerHTML=n?'':`<span class="tiny muted">Oppure parti da un esempio</span><div class="exs">${exs.map(p=>`<button type="button" class="ex" data-set="${p.map(I=>I.id).join('+')}">${mark(p[0])}${esc(p[0].name)} + ${esc(p[1].name)}</button>`).join('')}</div>`;
  host.querySelector('[data-foot]').innerHTML=n?`<button type="button" class="link tiny" data-clear>Svuota il banco</button>${ctx==='abbina'?`<button type="button" class="btn sm" data-go-crea>Crea un drink →</button>`:`<button type="button" class="btn sm" data-go-abbina>Analizza in Abbina →</button>`}`:'';
  host.querySelector('[data-foot]').hidden=!n;});}

// banco flottante in Esplora
function renderTray(){const t=$('#tray');if(S.tab!=='esplora'||!bench.length){t.hidden=true;return;}t.hidden=false;
  t.innerHTML=`<span class="tray-l">Banco</span><div class="tray-items">${bench.map(I=>`<span class="chip">${mark(I)}${esc(I.name)}<button type="button" class="x" data-rm="${I.id}" aria-label="Togli ${esc(I.name)} dal banco">×</button></span>`).join('')}</div>
  <div class="tray-acts"><button type="button" class="btn sm" data-tgo="abbina"${bench.length<2?' disabled title="Servono almeno due ingredienti"':''}>Abbina</button><button type="button" class="btn sm primary" data-tgo="crea">Crea un drink</button></div>`;}
$('#tray').addEventListener('click',e=>{const r=e.target.closest('[data-rm]');if(r){benchRemove(BYID[r.dataset.rm]);return;}
  const g=e.target.closest('[data-tgo]');if(g&&!g.disabled){show(g.dataset.tgo,{push:true});scrollTo({top:0});}});

// ===================== spiegazioni («i») =====================
const INFO={
  score:'Sei criteri da 0 a 5, per un massimo di 30. Ottimo da 24, buono da 17, azzardato da 10, sotto è da evitare.',
  'Ponte aromatico':'Quanto i due profili si sovrappongono sulle 18 famiglie di profumi, anche in modo indiretto (agrumi ed erbe, tostato e ossidativo).',
  'Bilanciamento di gusto':'Le regole classiche: l\'acido taglia il grasso, il sale esalta il dolce e attenua l\'amaro, l\'amaro dà profondità al dolce. Toglie punti quando due acidi o due amari forti si sommano.',
  'Intensità e peso':'Due ingredienti di forza simile dialogano alla pari; se la distanza è grande, il più delicato va in dose maggiore.',
  'Copertura piramide':'Note fresche (agrumi, erbe), centrali (frutta matura, fiori, spezie) e profonde (tostato, legno, vaniglia): una coppia che le copre tutte è più completa.',
  'Territorio e stagione':'Ciò che cresce insieme sta bene insieme: stessa stagione e stessa area d\'origine alzano il voto.',
  'Territorio':'Per gli alcolici conta solo l\'area d\'origine.',
  'Tradizione':'Se la coppia esiste già in cucina o al bancone vale il massimo: è una prova sul campo.',
  'Ponte aromatico medio':'La media del ponte aromatico delle tre coppie.',
  'Piramide':'Note fresche, centrali e profonde coperte dai tre insieme.',
  'Equilibrio di gusto':'Premia i gusti che si compensano, penalizza le somme (tre acidi, due amari forti).',
  'Intensità':'Quanto è vicina la forza dei tre: più è vicina, più dialogano alla pari.',
  'Anello debole':'Un trio vale quanto la sua coppia peggiore; il terzo ingrediente può fare da ponte.',
  'Tradizione e territorio':'Stagione, area d\'origine e tradizione delle tre coppie.',
  roles:'Base: il corpo (il più strutturato, o l\'alcolico). Accento: il più intenso, in piccola dose. Complemento: il terzo. Il rapporto è un punto di partenza da correggere all\'assaggio.',
};
function info(k,label){return INFO[k]?`<button type="button" class="info" data-info="${esc(k)}" aria-label="${esc('Spiegazione: '+(label||k))}">i</button>`:'';}
function spInfo(B){return B&&B.isSpirit&&SPINFO[B.name]?`<button type="button" class="info" data-spinfo="${B.id}" aria-label="${esc('Che cos\'è: '+B.name)}">i</button>`:'';}
const tip=$('#tip');let infoEl=null,infoAt=0;
function tipHTML(el){if(el.dataset.info)return INFO[el.dataset.info]?esc(INFO[el.dataset.info]):'';
  if(el.dataset.spinfo){const B=BYID[el.dataset.spinfo];return B?`<b>${esc(B.name)}</b><br>${esc(SPINFO[B.name]||'')}`:'';}
  const s=el.classList.contains('glass')&&STY[el.dataset.sty];if(!s)return'';
  const fit=styleFit(effBase(),el.dataset.sty);
  return `<b>${esc(s.name)}</b> · ${esc(s.fam)}<br>${esc(s.desc)}<br><span style="opacity:.75">Classici: ${esc(s.ex)}.</span>${fit.ok?'':`<br><b>Non adatto:</b> ${esc(fit.why)}.`}`;}
function placeTip(el){const r=el.getBoundingClientRect();const w=tip.offsetWidth,h=tip.offsetHeight;let x=r.left+r.width/2-w/2,y=r.bottom+8;
  if(y+h>innerHeight-8)y=r.top-h-8;x=Math.max(8,Math.min(innerWidth-w-8,x));tip.style.left=x+'px';tip.style.top=Math.max(8,y)+'px';}
function showInfo(el){const html=tipHTML(el);if(!html)return;if(infoEl!==el)infoAt=performance.now();infoEl=el;tip.innerHTML=html;tip.hidden=false;placeTip(el);}
function hideInfo(){if(!infoEl)return;infoEl=null;tip.hidden=true;}
const INFOSEL='.info[data-info],.info[data-spinfo],.glass[data-sty]';
document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const b=e.target.closest?.(INFOSEL);if(b)showInfo(b);});
document.addEventListener('pointerout',e=>{if(e.pointerType==='touch')return;const b=e.target.closest?.(INFOSEL);if(b&&!b.contains(e.relatedTarget))hideInfo();});
document.addEventListener('focusin',e=>{const b=e.target.closest?.(INFOSEL);if(b)showInfo(b);});
document.addEventListener('focusout',e=>{if(e.target.closest?.(INFOSEL))hideInfo();});
document.addEventListener('click',e=>{const b=e.target.closest?.('.info');if(b){e.preventDefault();e.stopPropagation();infoEl===b&&performance.now()-infoAt>400?hideInfo():showInfo(b);}else hideInfo();},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideInfo();});
addEventListener('scroll',()=>{if(infoEl)placeTip(infoEl);},{passive:true});
function showTip(html,e){tip.innerHTML=html;tip.hidden=false;moveTip(e);}
function moveTip(e){if(tip.hidden||!e||e.clientX==null||infoEl)return;const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+14,y=e.clientY+14;if(x+w>innerWidth-8)x=e.clientX-w-14;if(y+h>innerHeight-8)y=e.clientY-h-14;tip.style.left=Math.max(8,x)+'px';tip.style.top=Math.max(8,y)+'px';}
function hideTip(){if(!infoEl)tip.hidden=true;}

// ===================== ESPLORA =====================
const EXAMPLES=['Limone','Cioccolato fondente','Fragola','Basilico','Pomodoro'].map(n=>BYNAME[n]).filter(Boolean);
const DICE='<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" style="fill:none;stroke:currentColor;stroke-width:1.4"/><circle cx="5.2" cy="5.2" r="1.15" style="fill:currentColor"/><circle cx="8" cy="8" r="1.15" style="fill:currentColor"/><circle cx="10.8" cy="10.8" r="1.15" style="fill:currentColor"/></svg>';
$('#examples').innerHTML=`<span class="lbl">Prova</span>${EXAMPLES.map(f=>`<button type="button" class="ex" data-ex="${f.id}">${mark(f)}${esc(f.name)}</button>`).join('')}<button type="button" class="ex ex-rand" data-rand>${DICE}A caso</button>`;
$('#examples').addEventListener('click',e=>{const b=e.target.closest('[data-ex]');if(b){select(BYID[b.dataset.ex]);return;}
  if(e.target.closest('[data-rand]')){let f;do{f=FOODS[Math.floor(Math.random()*FOODS.length)];}while(f===S.sel);select(f);}});
const mainCombo=makeCombo($('#mainSearch'),{id:'q-main',placeholder:innerWidth<560?'Cerca un alimento':'Cerca un alimento: limone, miso, cardamomo…',source:()=>FOODS,keep:true,onPick:f=>{select(f);$('#q-main').blur();},
  onClear:()=>{if(S.sel)goHome();}});

function assignTrio(){const used={};S.trio={};
  S.sps.forEach(rs=>{let best=null,bv=-1;S.parts.forEach(p=>{const sp=score(p.B,rs.B).total;if(sp<15)return;const v=p.total+sp-2.5*(used[p.B.id]||0);if(v>bv){bv=v;best=p.B;}});
    if(best){S.trio[rs.B.id]=best;used[best.id]=(used[best.id]||0)+1;}});}
function select(f,{nav=true,keepMode=false}={}){S.sel=f;S.egoAll=false;S.spAll=false;S.pAll=false;S.filter='all';
  S.parts=partnersOf(f);S.sps=spiritsOf(f);assignTrio();
  if(!keepMode||S.mode!=='browse')S.mode='ego';if(S.mode==='browse'){S.zoom=f.dom;}
  mainCombo.set(f);
  if(nav){show('esplora',{push:true});const top=$('#exFood').getBoundingClientRect().top+scrollY-90;if(scrollY>top)scrollTo({top:Math.max(0,top),behavior:calm()?'auto':'smooth'});}}

function renderEsplora(){const A=S.sel;
  $('#v-esplora').classList.toggle('has-food',!!A);
  $('#home').hidden=!!A;$('#wheelTitle').hidden=!!A;
  if(!A&&!$('#home').dataset.ready){$('#home').innerHTML=homeHTML(drinkName);$('#home').dataset.ready='1';}
  $('#exHero').hidden=!!A;$('#exFood').hidden=!A;$('#pairs').hidden=!A;$('#spirits').hidden=!A;
  if(A)renderFood();renderWheel();renderSide();if(A){renderPairs();renderSpirits();}}
function refreshBenchMarks(){if(!S.sel)return;renderFood();renderPairs();renderSpirits();}
function benchBtn(I,label){const on=onBench(I);return `<button type="button" class="btn sm${on?' on-bench':''}" data-bench-t="${I.id}" aria-pressed="${on}">${on?'✓ Sul banco':`<span class="plus" aria-hidden="true">+</span>${label||'Banco'}`}</button>`;}

function renderFood(){const A=S.sel;const p=S.parts,sp=S.sps;
  const fams=topFams(A);
  const pt=p.slice(0,3).map(r=>`<b>${esc(r.B.name)}</b>`),st=sp.slice(0,2).map(r=>`<b>${esc(r.B.name)}</b>`);
  const sum=`${fams.length?`Sa di ${esc(listY(fams))}. `:''}${pt.length?`Sta bene soprattutto con ${listY(pt)}`:'Ha pochi abbinamenti forti'}${st.length?`; da bere, prova ${listY(st)}.`:'.'}`;
  const onB=onBench(A);
  $('#exFood').innerHTML=`<div>
      <div class="food-top"><button type="button" class="back" data-home><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg>Tutti gli alimenti</button>
      <nav class="crumbs" aria-label="Percorso"><button type="button" data-crumb="t">${TLABEL[A.dom]}</button><span aria-hidden="true">/</span><button type="button" data-crumb="c">${esc(CATS[A.cat][0])}</button></nav></div>
      <div class="fhead"><div><h1 class="fname">${esc(A.name)}</h1></div>${impronta(A,132,{cls:'ip-big'})}</div>
      <p class="fsum">${sum}</p>
      <div class="chips"><span class="chip">${catIcon(A,16)}${esc(CATS[A.cat][0])}</span><span class="chip">${mark(A)}Gusto ${TLABEL[A.dom].toLowerCase()}</span><span class="chip">Intensità <span aria-hidden="true">${dots(A.int)}</span><span class="sr">${A.int} su 5</span></span><span class="chip">${A.season?'Stagione: '+monthsTxt(A.season):'Tutto l\'anno'}</span>${A.o?`<span class="chip">${esc(ORIG[A.o])}</span>`:''}</div>
    </div>
    <div class="food-acts">
      <button type="button" class="btn${onB?'':' primary'}" data-bench-t="${A.id}" aria-pressed="${onB}">${onB?'✓ Sul banco':'<span class="plus" aria-hidden="true">+</span>Metti sul banco'}</button>
      <button type="button" class="btn" data-fgo="abbina">Abbina con…</button>
      <button type="button" class="btn" data-fgo="crea">Crea un drink</button>
    </div>`;}
function goHome(){S.sel=null;S.mode='browse';S.zoom=null;S.cat=null;mainCombo.set(null);show('esplora',{push:true});scrollTo({top:0,behavior:calm()?'auto':'smooth'});}
$('#exFood').addEventListener('click',e=>{const A=S.sel;if(!A)return;if(e.target.closest('[data-home]')){goHome();return;}
  const c=e.target.closest('[data-crumb]');if(c){const k=c.dataset.crumb;S.mode='browse';S.zoom=k==='all'?null:A.dom;S.cat=k==='c'?A.dom+'|'+A.cat:null;if(k==='all'){S.sel=null;show('esplora',{push:true});}else renderEsplora();$('#wheelbox').scrollIntoView({block:'start',behavior:calm()?'auto':'smooth'});return;}
  const g=e.target.closest('[data-fgo]');if(!g)return;
  if(g.dataset.fgo==='abbina'){benchAdd(A,{quiet:true});show('abbina',{push:true});scrollTo({top:0});if(bench.length<2)setTimeout(()=>$('#q-bench-abbina')?.focus(),60);}
  else{if(!bench.length)benchSet([A,...S.parts.slice(0,2).map(r=>r.B)]);else benchAdd(A,{quiet:true});show('crea',{push:true});scrollTo({top:0});}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-bench-t]');if(!b)return;benchToggle(BYID[b.dataset.benchT]);});

// ---------- prima pagina: drink del giorno, stagione, voglie, classici ----------
// porta il banco in «Crea» con uno stile proposto; se con la base scelta lo stile non regge, decide il metodo
function openDrink(arr,sty,low){bench=arr.slice(0,MAXB);saveBench();CK.base=null;CK.classic=null;CK.view=low?'low':'classic';CK.style=null;CK.styleAuto=true;
  const b=effBase();if(sty&&STY[sty]&&styleFit(b,sty).ok&&!coherence(bench,sty,b).block.length){CK.style=sty;CK.styleAuto=false;}
  show('crea',{push:true});scrollTo({top:0});}
function openClassic(c){CK.classic=c;CK.style=c.sty;CK.styleAuto=false;CK.base=SBYNAME[c.base]||null;CK.view='classic';show('crea',{push:true});scrollTo({top:0});}
$('#home').addEventListener('click',e=>{const o=e.target.closest('[data-home-open]');if(o){select(BYID[o.dataset.homeOpen]);return;}
  const d=e.target.closest('[data-home-drink]');if(d){openDrink(d.dataset.homeDrink.split('+').map(id=>BYID[id]).filter(Boolean),d.dataset.sty,!!d.dataset.low);return;}
  const m=e.target.closest('[data-mood]');if(m){const on=m.getAttribute('aria-pressed')==='true';$$('#home [data-mood]').forEach(b=>b.setAttribute('aria-pressed','false'));const out=$('#moodOut');
    if(on){out.hidden=true;return;}m.setAttribute('aria-pressed','true');out.innerHTML=moodHTML(MOODS.find(x=>x.id===m.dataset.mood));out.hidden=false;return;}
  const c=e.target.closest('[data-classic]');if(c)openClassic(CLASSICS[+c.dataset.classic]);});

// ---------- scheda laterale: profilo, oppure indice delle categorie ----------
function renderSide(){const el=$('#side');
  if(S.mode==='browse'||!S.sel){el.innerHTML=catIndex();return;}
  const A=S.sel;
  const fams=A.ar.map((v,i)=>[v,i]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,5).filter((x,k)=>k<3||x[0]>=2);
  const lv={testa:[],cuore:[],fondo:[]};A.ar.forEach((v,i)=>{if(v>=2)lv[FAM[i][3]].push(FAM[i][1].toLowerCase());});
  const st=[['grassezza',A.st.g],['piccantezza',A.st.p],['astringenza',A.st.t],['freschezza',A.st.f]].filter(x=>x[1]>0).map(x=>`${x[0]} ${x[1]}/5`).join(', ')||'nessuna sensazione rilevante';
  const allerg=ALLERG[A.cat];const notes=[A.note,allerg&&!A.note.includes(allerg)?'Allergene: '+allerg:''].filter(Boolean);
  el.innerHTML=`<section class="panel" aria-labelledby="h-prof"><h2 id="h-prof">La sua impronta</h2>
    <div class="ip-read">${impronta(A,176)}<p class="tiny muted">Al centro il gusto prevalente, nell'anello i cinque gusti, intorno i profumi: <b>in alto a destra le note fresche</b>, in basso le centrali, a sinistra le profonde. Più lungo il tratto, più forte la nota.</p></div>
    <h3 class="side-h3">I suoi profumi</h3>
    ${fams.length?`<ul class="fbars">${fams.map(([v,i])=>`<li><span>${esc(FAM[i][1])}</span><span class="bar" role="img" aria-label="${v} su 5"><i style="width:${v/5*100}%"></i></span></li>`).join('')}</ul>`:'<p class="muted">Profumo neutro: conta soprattutto il gusto.</p>'}
    <p class="tiny"><b>Al bancone:</b> ${esc(CATS[A.cat][2])}.</p>
    ${notes.length?`<p class="safety">${esc(notes.join(' · '))}</p>`:''}
    <details class="more-d" id="radarBox"><summary>Profilo completo: gusti e profumi</summary>
      <div class="radars" id="radars">${renderRadars(A,null)}</div>
      <p class="cmp" id="cmp">${TOUCH()?'Tocca un abbinamento della ruota per sovrapporne il profilo.':'Passa su un abbinamento della ruota per sovrapporne il profilo.'}</p></details>
    <details class="more-d"><summary>Note fresche, centrali e profonde</summary>
      <dl class="kv"><dt>Note fresche</dt><dd>${lv.testa.join(', ')||'—'}</dd><dt>Note centrali</dt><dd>${lv.cuore.join(', ')||'—'}</dd><dt>Note profonde</dt><dd>${lv.fondo.join(', ')||'—'}</dd><dt>In bocca</dt><dd>${st}</dd></dl>
    </details></section>`;fitRadars($('#side'));$('#radarBox').addEventListener('toggle',()=>fitRadars($('#side')));}
// i radar scalano con la colonna: le etichette restano a 12 px reali
function fitRadars(root){(root||document).querySelectorAll('.radar svg').forEach(svg=>{const vb=svg.viewBox.baseVal;const w=svg.getBoundingClientRect().width;if(vb&&w)svg.style.setProperty('--rfs',(12*vb.width/w).toFixed(2)+'px');});}
function renderRadars(A,B){
  const tl=TORDER.map(k=>({t:TLABEL[k],c:tcol(k)}));
  const s1=[{v:TORDER.map(k=>A.t[k]),c:'var(--ink)',fo:.12}],s2=[{v:A.ar,c:'var(--ink)',fo:.1}];
  if(B){s1.push({v:TORDER.map(k=>B.t[k]),c:'var(--muted)',fo:.06,dash:'4 3'});s2.push({v:B.ar,c:'var(--muted)',fo:.06,dash:'4 3'});}
  return `<div class="radar"><span class="tiny muted">Gusti</span>${radar(tl,s1,78,46)}</div><div class="radar"><span class="tiny muted">Profumi</span>${radar(FAM.map(f=>({t:f[2]})),s2,96,72)}</div>`;}
// indice testuale: ogni gusto con le sue categorie; complementa la ruota e su telefono ne fa le veci
function catIndex(){const z=S.zoom;const groups=TORDER.filter(k=>!z||k===z);
  const html=groups.map(k=>{const fs=FOODS.filter(f=>f.dom===k);const cats={};fs.forEach(f=>cats[f.cat]=(cats[f.cat]||0)+1);
    let keys=Object.keys(cats).sort((a,b)=>CATORD[a]-CATORD[b]);const extra=z?0:Math.max(0,keys.length-5);
    if(!z)keys=keys.slice().sort((a,b)=>cats[b]-cats[a]).slice(0,5);
    return `<div class="cidx-g"><h3><button type="button" class="cz" data-zoom="${k}">${mark({dom:k})}${TLABEL[k]}</button> <small>${fs.length} alimenti</small></h3><ul>${keys.map(c=>{const ck=k+'|'+c;return `<li><button type="button" data-cat="${ck}" aria-pressed="${S.cat===ck}">${esc(CATS[c][1])} <small>${cats[c]}</small></button></li>`;}).join('')}${extra?`<li><button type="button" class="more-c" data-zoom="${k}">+${extra} altre</button></li>`:''}</ul></div>`;}).join('');
  return `<section class="panel" aria-labelledby="h-idx"><h2 id="h-idx">${z?'Categorie · '+TLABEL[z].toLowerCase():'Tutte le categorie'}</h2>${catList()}<div class="cidx">${html}</div>${z?`<button type="button" class="link tiny" data-cat-all>Mostra tutti i gusti</button>`:''}</section>`;}
function catList(){if(!S.cat)return'';const [t,c]=S.cat.split('|');const fs=FOODS.filter(f=>f.cat===c&&f.dom===t).sort((a,b)=>a.name.localeCompare(b.name,'it'));
  return `<div class="catlist"><div class="catlist-h"><h3>${esc(CATS[c][0])}</h3><span class="tiny muted">${fs.length} ${fs.length===1?'alimento':'alimenti'}</span><button type="button" class="link tiny" data-cat-close>Chiudi</button></div>
    <ul>${fs.map(f=>`<li><button type="button" data-open="${f.id}">${mark(f)}${esc(f.name)}</button></li>`).join('')}</ul></div>`;}
$('#side').addEventListener('click',e=>{const zb=e.target.closest('[data-zoom]');if(zb){S.zoom=zb.dataset.zoom;S.cat=null;S.mode='browse';renderWheel();renderSide();return;}
  const c=e.target.closest('[data-cat]');if(c){const ck=c.dataset.cat;S.cat=S.cat===ck?null:ck;S.zoom=ck.split('|')[0];S.mode='browse';renderWheel();renderSide();return;}
  if(e.target.closest('[data-cat-close]')){S.cat=null;renderWheel();renderSide();return;}
  if(e.target.closest('[data-cat-all]')){S.zoom=null;S.cat=null;renderWheel();renderSide();return;}
  const o=e.target.closest('[data-open]');if(o){S.cat=null;select(BYID[o.dataset.open]);}});

// ---------- liste ----------
function why2(r){const s=String(r.summary).split(/(?<=\.)\s+/).filter(Boolean);return s;}
// una riga che cambia davvero da carta a carta: le famiglie di profumi in comune (o il ponte tra due famiglie);
// per i contrasti resta la frase, che parla di gusti ed è già specifica
function famsLine(A,B){const sh=sharedFams(A,B).slice(0,3);
  if(sh.length)return `<p class="c-fams"><span class="muted">In comune</span> ${sh.map(i=>`<b>${esc(famLbl(i))}</b>`).join('<span class="dot" aria-hidden="true">·</span>')}</p>`;
  let best=null;for(let i=0;i<FAM.length;i++){if(A.ar[i]<2)continue;for(let j=0;j<FAM.length;j++){if(i===j||B.ar[j]<2||!W[i][j])continue;const p=A.ar[i]*B.ar[j];if(!best||p>best[2])best=[i,j,p];}}
  return best?`<p class="c-fams"><span class="muted">Si legano</span> <b>${esc(famLbl(best[0]))}</b><span class="dot" aria-hidden="true">↔</span><span class="sr"> con </span><b>${esc(famLbl(best[1]))}</b></p>`:'';}
function cardLine(r){const fl=r.type==='concordanza'?famsLine(r.A,r.B):'';return fl||`<p class="c-why">${esc(noChem(firstSentence(r.summary)))}</p>`;}
function cardWhy(r){return (r.type==='concordanza'&&famsLine(r.A,r.B)?why2(r):why2(r).slice(1)).map(s=>`<p>${esc(plain(s))}</p>`).join('');}
const ownTag=B=>owns(B)?`<span class="rel own">Ce l'hai</span>`:'';
const classicTag=r=>r.classic?`<span class="rel classic" title="Coppia della tradizione, in cucina o al bancone">Classico</span>`:'';
function cardTop(r,nameHTML,kindHTML){return `<div class="c-top"><div class="c-id">${impronta(r.B,46,{hi:sharedFams(r.A,r.B),label:false})}<div><h3 class="c-name">${nameHTML}</h3><span class="c-kind">${kindHTML}</span></div></div>${meter(r.total)}</div>
    <div class="c-tags">${relTag(r)}${classicTag(r)}${ownTag(r.B)}</div>`;}
function pairCard(r){const B=r.B;
  return `<article class="card" data-pid="${B.id}">
    ${cardTop(r,`<button type="button" class="nm" data-open="${B.id}">${esc(B.name)}</button>`,`${catIcon(B,14)}${esc(CATS[B.cat][0])}`)}
    ${cardLine(r)}
    <details><summary>Perché, dosi e una prova veloce</summary>${cardWhy(r)}<p><b>Rapporto:</b> ${esc(r.ratioTxt)}</p><p><b>Prova:</b> ${esc(testTxt(r))}</p><p class="tiny muted">Punteggio ${num(r.total)} su 30 ${info('score','punteggio')}</p></details>
    <div class="c-acts">${benchBtn(B)}<button type="button" class="btn sm ghost" data-open="${B.id}">Apri →</button></div>
  </article>`;}
function testTxt(r){return r.type==='concordanza'?`assaggia ${r.A.name} da solo, poi insieme a ${r.B.name}: se i profumi in comune si allungano senza confondersi, funziona.`
  :`un boccone con entrambi: nessuno dei due deve prevalere. Se uno copre l'altro, riducilo e riprova.`;}
function spiritCard(r){const B=r.B,A=S.sel;const t=S.trio[B.id];const how=SGROUP[B.grp][1];
  return `<article class="card sp" data-sid="${B.id}">
    ${cardTop(r,`${esc(B.name)}${spInfo(B)}`,`${catIcon(B,14)}${esc((B.ex?B.ex+' · ':'')+SGROUP[B.grp][0])}`)}
    ${cardLine(r)}
    <p class="tiny"><b>Come:</b> ${esc(cap(how))}.${t?` Con un terzo: <b>${esc(t.name)}</b>.`:''}</p>
    <details><summary>Perché e come prepararlo</summary>${cardWhy(r)}<p>${esc(howTo(A,B))}</p><p class="tiny muted">Punteggio ${num(r.total)} su 30 ${info('score','punteggio')}</p></details>
    <div class="c-acts">${benchBtn(B)}<button type="button" class="btn sm ghost" data-mkck="${B.id}">Crea un drink →</button></div>
  </article>`;}
function moreBtn(sel,total,shown,all){const b=$(sel);b.hidden=total<=6;b.textContent=all?'Mostra meno':`Mostra altri ${total-shown}`;b.setAttribute('aria-expanded',String(!!all));}
function renderPairs(){const A=S.sel;$('#pairsTitle').textContent=`Con cosa si abbina`;
  const list=S.parts.filter(r=>S.filter==='all'||(S.filter==='classic'?r.classic:r.type===S.filter));
  const cb=$('#pairs .seg [data-f="classic"]');if(cb)cb.hidden=!S.parts.some(r=>r.classic);
  $$('#pairs .seg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.f===S.filter)));
  const shown=S.pAll?list:list.slice(0,6);
  $('#pairGrid').innerHTML=list.length?shown.map(pairCard).join(''):`<p class="muted">Nessun abbinamento di questo tipo per ${esc(A.name)}.</p>`;
  moreBtn('#pairMore',list.length,shown.length,S.pAll);}
function renderSpirits(){const A=S.sel;$('#spTitle').textContent=`Da bere con ${A.name}`;
  const shown=S.spAll?S.sps:S.sps.slice(0,6);$('#spTrack').innerHTML=shown.map(spiritCard).join('');moreBtn('#spMore',S.sps.length,shown.length,S.spAll);}
$$('#pairs .seg button').forEach(b=>b.addEventListener('click',()=>{S.filter=b.dataset.f;S.pAll=false;renderPairs();}));
$('#pairMore').addEventListener('click',()=>{S.pAll=!S.pAll;renderPairs();});
$('#spMore').addEventListener('click',()=>{S.spAll=!S.spAll;renderSpirits();});
$('#pairGrid').addEventListener('click',e=>{const o=e.target.closest('[data-open]');if(o)select(BYID[o.dataset.open]);});
$('#spTrack').addEventListener('click',e=>{const b=e.target.closest('[data-mkck]');if(!b||!S.sel)return;benchAdd(S.sel,{quiet:true});CK.base=BYID[b.dataset.mkck];CK.styleAuto=true;show('crea',{push:true});scrollTo({top:0});});

// ===================== RUOTA =====================
const wheel=$('#wheel');
function minU(vb){const w=wheel.getBoundingClientRect().width||Math.min(760,innerWidth-64);return 12*vb/w;}
const R1a=72,R1b=128,RP=188,RS=388;
const relStroke=t=>t==='contrasto'?'stroke-dasharray:6 5;':'';
function renderEgo(){
  const showL=minU(1080)<=26,VB=showL?540:410;
  wheel.setAttribute('viewBox',`${-VB} ${-VB} ${2*VB} ${2*VB}`);
  const A=S.sel,parts=S.egoAll?S.parts:S.parts.slice(0,10),sps=S.egoAll?S.sps:S.sps.slice(0,5);
  let h='';
  TORDER.forEach((k,i)=>{const a0=-90+i*72-36;h+=`<path d="${arcPath(R1b+4,RS-16,a0+0.6,a0+71.4)}" style="fill:${tcol(k)};opacity:.08"/>`;});
  h+=`<circle r="${RP}" style="fill:none;stroke:var(--line2);stroke-dasharray:2 6"/><circle r="${RS}" style="fill:none;stroke:var(--line2);stroke-dasharray:2 6"/>`;
  const mu=minU(2*VB),fT=Math.max(17,mu),fP=Math.max(16,mu),fS=Math.max(14.5,mu);
  TORDER.forEach((k,i)=>{const a0=-90+i*72-36;const v=A.t[k];
    h+=`<path d="${arcPath(R1a,R1b,a0+0.8,a0+71.2)}" style="fill:${tcol(k)};opacity:${(0.18+v*0.164).toFixed(2)}"/>`;
    const [x,y]=pol((R1a+R1b)/2,-90+i*72);
    h+=showL?`<text class="wl" x="${x}" y="${y-2}" text-anchor="middle" style="font-size:${fT}px;font-weight:700">${TLABEL[k]}</text><text class="wl" x="${x}" y="${y+fT-1}" text-anchor="middle" style="font-size:${Math.max(13.5,mu)}px;font-family:var(--f-mono);font-weight:500">${v}/5</text>`
      :`<text class="wl" x="${x}" y="${y+fT*.35}" text-anchor="middle" style="font-size:${fT}px;font-weight:700">${TLABEL[k]}</text>`;});
  const groups={};parts.forEach(r=>(groups[r.B.dom]=groups[r.B.dom]||[]).push(r));
  const nodes=[];TORDER.forEach((k,i)=>{const g=groups[k]||[];g.forEach((r,j)=>nodes.push({r,a:-90+i*72-36+(j+0.5)*72/g.length}));});
  spread(nodes,7.2);const pos={};nodes.forEach(n=>pos[n.r.B.id]=n.a);
  const snodes=sps.map(rs=>{const best=S.trio[rs.B.id];const p=best?parts.find(x=>x.B===best):null;return {rs,a:p?pos[p.B.id]:-90+TORDER.indexOf(rs.B.dom)*72,p};});
  spread(snodes,7);
  snodes.forEach(s=>{if(!s.p)return;const ap=pos[s.p.B.id],as=s.a;const d=((as-ap+540)%360)-180;const mid=ap+d/2;
    const [x0,y0]=pol(RP+6,ap),[cx,cy]=pol((RP+RS)/2+30,mid),[x1,y1]=pol(RS-8,as);
    h+=`<path class="lk anim" data-p="${s.p.B.id}" data-s="${s.rs.B.id}" d="M${x0},${y0}Q${cx},${cy} ${x1},${y1}" style="fill:none;stroke:var(--muted);stroke-width:1.2;opacity:.3"/>`;});
  nodes.forEach(n=>{const r=n.r;const [x0,y0]=pol(R1b+2,n.a),[x1,y1]=pol(RP-8,n.a);
    h+=`<line class="ray anim" data-p="${r.B.id}" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" style="stroke:var(--ink);stroke-width:${(1+(r.total-14)/4.5).toFixed(1)};${relStroke(r.type)}opacity:.55"/>`;});
  nodes.forEach(n=>{const r=n.r;const [x,y]=pol(RP,n.a);const rad=(4+(r.total-14)/3).toFixed(1);const v=vOf(r.total);
    h+=`<g class="node anim" data-id="${r.B.id}" data-kind="p" data-nav tabindex="-1" role="button" aria-label="${esc(r.B.name)}: ${v.w}, ${REL[r.type].w.toLowerCase()}">
      <circle cx="${x}" cy="${y}" r="${+rad+3.5}" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.8;${r.type==='contrasto'?'stroke-dasharray:3 2':''}"/>
      <circle cx="${x}" cy="${y}" r="${rad}" style="fill:${tcol(r.B.dom)}"/>
      <title>${esc(r.B.name)}</title>${showL?labelLines(RP+14,n.a,wrapName(r.B.name,Math.floor((RS-RP-34)/(0.55*fP)),nodes.length<=12),'lbl halo',fP,` style="font-size:${fP.toFixed(1)}px"`):''}</g>`;});
  snodes.forEach(s=>{const [x,y]=pol(RS,s.a);const B=s.rs.B;const v=vOf(s.rs.total);
    h+=`<g class="node anim" data-id="${B.id}" data-kind="s" data-nav tabindex="-1" role="button" aria-label="${esc(B.name)}, da bere: ${v.w}">
      <rect x="${x-6.5}" y="${y-6.5}" width="13" height="13" transform="rotate(45 ${x} ${y})" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>
      <title>${esc(B.name)}</title>${showL?labelLines(RS+16,s.a,wrapName(B.name,Math.floor((540-RS-20)/(0.55*fS)),snodes.length<=6),'slbl halo',fS,` style="font-size:${fS.toFixed(1)}px"`):''}</g>`;});
  h+=`<circle r="64" style="fill:var(--surface);stroke:${tcol(A.dom)};stroke-width:2.5"/>`;
  const words=A.name.split(' ');const lines=[];words.forEach(w=>{if(lines.length&&(lines[lines.length-1]+' '+w).length<=12)lines[lines.length-1]+=' '+w;else lines.push(w);});
  const fs=Math.max(lines.some(l=>l.length>10)?20:24,mu);
  if(showL)lines.slice(0,3).forEach((l,i)=>{h+=`<text text-anchor="middle" y="${(i-(Math.min(lines.length,3)-1)/2)*fs+fs*.32}" style="font-family:var(--f-display);font-size:${fs*1.1}px">${esc(l)}</text>`;});
  wheel.innerHTML=h;
  const more=S.parts.length>parts.length||S.sps.length>sps.length;
  $('#wheelCap').textContent=S.egoAll||!more?`${parts.length} abbinamenti e ${sps.length} alcolici`:`I migliori ${parts.length} abbinamenti e ${sps.length} alcolici · più vicini al centro, più è forte il legame`;
  const ea=$('#egoAll');ea.hidden=!(more||S.egoAll);ea.textContent=S.egoAll?'Mostra solo i migliori':`Mostra tutti (${S.parts.length} + ${S.sps.length})`;
  $('#wheelHint').textContent=TOUCH()?'Tocca un punto per il motivo, di nuovo per aprirlo.':'Passa su un punto per il motivo, clicca per aprirlo.';
  $('#legend').innerHTML=TORDER.map(k=>`<span><i class="mk" style="background:${tcol(k)}"></i>${TLABEL[k]}</span>`).join('')+
    `<span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" style="stroke:var(--ink);stroke-width:2"/></svg>Si somigliano</span>`+
    `<span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:6 5"/></svg>Si bilanciano</span>`+
    `<span><i class="mk sp"></i>Da bere</span>`;}

function runs(list,key){const out=[];list.forEach((it,i)=>{const k=key(it);const last=out[out.length-1];if(last&&last.k===k)last.e=i+1;else out.push({k,s:i,e:i+1,it});});return out;}
const BW={vb:500,hub:64,t0:72,t1:128,c0:134,cOut:470,cMid:282,f0:288,f1:470};
const BWN={vb:500,hub:116,t0:124,t1:186,c0:192,cOut:470,cMid:340,f0:346,f1:470};
let lastZoom;
function labelMid(r,a,text,extra,fs){const left=Math.cos(a*Math.PI/180)<-0.0001,rot=(left?a+180:a).toFixed(2),x=left?-r:r;
  if(Array.isArray(text))return `<text transform="rotate(${rot})" text-anchor="middle"${extra}><tspan x="${x}" y="${(-fs*0.18).toFixed(1)}">${esc(text[0])}</tspan><tspan x="${x}" y="${(fs*0.92).toFixed(1)}">${esc(text[1])}</tspan></text>`;
  return `<text transform="rotate(${rot})" x="${x}" y="${(fs*0.35).toFixed(1)}" text-anchor="middle"${extra}>${text}</text>`;}
function radLabel(r0,r1,a,span,name,fs,extra=''){const room=r1-r0-14,cw=0.56*fs,arc=r=>r*span*Math.PI/180;const one=name.length*cw;
  if(one<=room){const rin=(r0+r1)/2-one/2;if(arc(rin)>=fs*1.05)return labelMid((r0+r1)/2,a,esc(name),extra,fs);}
  const two=wrapName(name,Math.floor(room/cw),true);
  if(two.length===2&&!two[1].endsWith('…')){const w=Math.max(two[0].length,two[1].length)*cw,rin=(r0+r1)/2-w/2;if(arc(rin)>=fs*2.2)return labelMid((r0+r1)/2,a,two,extra,fs);}
  return '';}
function renderBrowse(){
  const z=S.zoom,B=minU(1000)>28?BWN:BW,narrow=B===BWN;
  const list=FOODS.filter(f=>!z||f.dom===z).slice().sort((a,b)=>TORDER.indexOf(a.dom)-TORDER.indexOf(b.dom)||CATORD[a.cat]-CATORD[b.cat]||a.name.localeCompare(b.name,'it'));
  const SEC=k=>-126+TORDER.indexOf(k)*72;
  const N=list.length,A0=[],A1=[];let h='',tl='';
  if(z){const st=360/N;list.forEach((f,i)=>{A0.push(SEC(z)+i*st);A1.push(SEC(z)+(i+1)*st);});}
  else{const cnt={},seen={};list.forEach(f=>cnt[f.dom]=(cnt[f.dom]||0)+1);list.forEach(f=>{const j=seen[f.dom]=(seen[f.dom]||0),st=72/cnt[f.dom];seen[f.dom]++;A0.push(SEC(f.dom)+j*st);A1.push(SEC(f.dom)+(j+1)*st);});}
  wheel.setAttribute('viewBox',`${-B.vb} ${-B.vb} ${2*B.vb} ${2*B.vb}`);
  const mu=minU(2*B.vb),fT=Math.max(17,mu),fL=Math.max(14,mu),f1=Math.max(12,mu);
  const sep='stroke:var(--surface);stroke-width:1.5;stroke-linejoin:round';const lbl=` class="wl" style="pointer-events:none;font-size:${fL.toFixed(1)}px"`;
  TORDER.forEach(k=>{const a0=SEC(k),a1=a0+72,n=FOODS.filter(f=>f.dom===k).length,on=!z||z===k;
    h+=`<path class="node" data-t="${k}" data-nav tabindex="-1" role="button" aria-label="Gusto ${TLABEL[k]}, ${n} alimenti${z===k?', torna a tutti i gusti':''}" d="${arcPath(B.t0,B.t1,a0,a1)}" style="fill:${tcol(k)};fill-opacity:${on?1:.28};${sep}"><title>${TLABEL[k]}</title></path>`;
    const [x,y]=pol((B.t0+B.t1)/2,a0+36);tl+=`<text class="wl" x="${x}" y="${(y+fT*.35).toFixed(1)}" text-anchor="middle" style="pointer-events:none;font-size:${fT.toFixed(1)}px;font-weight:700;${on?'':'opacity:.6'}">${TLABEL[k]}</text>`;});
  const c1=z?B.cMid:B.cOut;let par=0;
  runs(list,f=>f.dom+'|'+f.cat).forEach(rn=>{const a0=A0[rn.s],a1=A1[rn.e-1];par++;const it=rn.it;const ck=it.dom+'|'+it.cat,on=S.cat===ck,n=rn.e-rn.s;
    h+=`<path class="node" data-t="${it.dom}" data-cat="${ck}" data-nav tabindex="-1" role="button" aria-label="${esc(CATS[it.cat][0])}, ${n} ${n===1?'alimento':'alimenti'}" d="${arcPath(B.c0,c1,a0,a1)}" style="fill:${tcol(it.dom)};fill-opacity:${on?.95:par%2?.42:.6};${sep}${on?';stroke:var(--ink);stroke-width:2.5':''}"><title>${esc(CATS[it.cat][0])}</title></path>`;
    h+=radLabel(B.c0,c1,(a0+a1)/2,a1-a0,CATS[it.cat][1],fL,lbl);});
  if(z)list.forEach((f,i)=>{const a0=A0[i],a1=A1[i],am=(a0+a1)/2;const on=f===S.sel;
    h+=`<g class="node" data-id="${f.id}" data-kind="b" data-nav tabindex="-1" role="button" aria-label="${esc(f.name)}"><title>${esc(f.name)}</title><path d="${arcPath(B.f0,B.f1,a0,a1)}" style="fill:${tcol(f.dom)};fill-opacity:${CATORD[f.cat]%2?.5:.7};${sep}${on?';stroke:var(--ink);stroke-width:2.5':''}"/>`+
      radLabel(B.f0,B.f1,am,a1-a0,f.name,fL,` class="wl" style="pointer-events:none;font-size:${fL.toFixed(1)}px;${on?'font-weight:700;':''}"`)+`</g>`;});
  h+=`<circle r="${B.hub}" class="node hub" data-t="${z?'__all':''}" style="fill:var(--surface);stroke:var(--line2);stroke-width:1.5${z?';cursor:pointer':''}"><title>${z?'Torna a tutti i gusti':''}</title></circle>`;
  const fH=narrow?f1*1.25:Math.max(24,mu*1.5);
  if(z&&narrow)h+=`<text text-anchor="middle" y="${(f1*0.35).toFixed(1)}" style="pointer-events:none;font-size:${f1.toFixed(1)}px;text-decoration:underline">↩ tutti</text>`;
  else if(z)h+=`<text text-anchor="middle" y="${(-f1*0.9).toFixed(1)}" style="pointer-events:none;font-family:var(--f-display);font-size:${(fH*1.15).toFixed(1)}px">${TLABEL[z]}</text><text text-anchor="middle" y="${(f1*0.9).toFixed(1)}" style="pointer-events:none;font-size:${f1.toFixed(1)}px;fill:var(--muted)">${N} alimenti</text><text text-anchor="middle" y="${(f1*2.6).toFixed(1)}" style="pointer-events:none;font-size:${f1.toFixed(1)}px;text-decoration:underline">↩ tutti</text>`;
  else h+=`<text text-anchor="middle" y="${(fH*0.2).toFixed(1)}" style="pointer-events:none;font-family:var(--f-display);font-size:${(fH*1.2).toFixed(1)}px">${N}</text><text text-anchor="middle" y="${(fH*0.2+f1*1.6).toFixed(1)}" style="pointer-events:none;font-size:${f1.toFixed(1)}px;fill:var(--muted)">alimenti</text>`;
  h+=tl;
  const anim=lastZoom!==undefined&&lastZoom!==z;lastZoom=z;
  wheel.innerHTML=`<g class="wz${anim?' anim':''}">${h}</g>`;
  $('#egoAll').hidden=true;
  $('#wheelCap').textContent=z?`${TLABEL[z]}: dal centro, categorie e alimenti`:'Dal centro: gusto prevalente e categorie';
  const tap=TOUCH()?'Tocca':'Clicca';
  $('#wheelHint').textContent=z?`${tap} una categoria o un alimento; il centro torna a tutti i gusti.`:`${tap} un gusto per ingrandirlo, una categoria per l'elenco.`;
  $('#legend').innerHTML=TORDER.map(k=>`<span><i class="mk" style="background:${tcol(k)}"></i>${TLABEL[k]} · ${FOODS.filter(f=>f.dom===k).length}</span>`).join('');}

function renderWheel(){hidePeek();if(!S.sel&&S.mode==='ego')S.mode='browse';S.mode==='ego'?renderEgo():renderBrowse();rove();
  $('#wheelMode').hidden=!S.sel;$('#mEgo').setAttribute('aria-pressed',String(S.mode==='ego'));$('#mBrowse').setAttribute('aria-pressed',String(S.mode==='browse'));
  $('#wheelbox').setAttribute('aria-label',S.mode==='ego'?`Ruota degli abbinamenti di ${S.sel.name}`:'Ruota dei gusti e delle categorie');}
let rzT;addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{fitRadars();stickRecipe();if(S.tab==='esplora')renderWheel();if(S.tab==='crea'&&$('#ckMixBox').open)$('#ckMix').innerHTML=mixProfile();},150);});
$('#mEgo').addEventListener('click',()=>{if(!S.sel)return;S.mode='ego';S.cat=null;renderWheel();renderSide();});
$('#mBrowse').addEventListener('click',()=>{S.mode='browse';S.zoom=S.sel?S.sel.dom:null;S.cat=S.sel?S.sel.dom+'|'+S.sel.cat:null;renderWheel();renderSide();});
$('#egoAll').addEventListener('click',()=>{S.egoAll=!S.egoAll;renderWheel();});

function highlight(id,kind){
  wheel.querySelectorAll('.hl').forEach(n=>n.classList.remove('hl'));wheel.querySelectorAll('.anim').forEach(n=>n.classList.remove('dim'));
  $$('.card.hl').forEach(n=>n.classList.remove('hl'));
  if(!S.sel)return;
  if(!id){const r=$('#radars');if(r){r.innerHTML=renderRadars(S.sel,null);fitRadars(r);}const c=$('#cmp');if(c)c.textContent='Passa su un abbinamento della ruota per sovrapporne il profilo.';return;}
  const keep=new Set([id]);wheel.querySelectorAll('.lk').forEach(l=>{if(l.dataset.p===id||l.dataset.s===id){keep.add(l.dataset.p);keep.add(l.dataset.s);}});
  wheel.querySelectorAll('.anim').forEach(n=>{const k=n.dataset.id||n.dataset.p;const isLk=n.classList.contains('lk');const on=isLk?(n.dataset.p===id||n.dataset.s===id):keep.has(k);if(!on)n.classList.add('dim');else if(isLk)n.style.opacity=.9;});
  wheel.querySelector(`[data-id="${id}"]`)?.classList.add('hl');
  const B=BYID[id];if(B&&S.mode==='ego'){const r=$('#radars');if(r){r.innerHTML=renderRadars(S.sel,B);fitRadars(r);}const c=$('#cmp');if(c)c.innerHTML=`Tratteggio: <b>${esc(B.name)}</b> · ${vOf(score(S.sel,B).total).w.toLowerCase()}`;
    (kind==='s'?$(`.card[data-sid="${id}"]`):$(`.card[data-pid="${id}"]`))?.classList.add('hl');}}
wheel.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const g=e.target.closest('[data-id],[data-t]');if(!g)return;
  if(g.dataset.id){const B=BYID[g.dataset.id];
    if(S.mode==='ego'){const r=score(S.sel,B);highlight(B.id,g.dataset.kind);showTip(`<b>${esc(B.name)}</b> · ${vOf(r.total).w} · ${REL[r.type].w.toLowerCase()}<br>${esc(noChem(firstSentence(r.summary)))}`,e);}
    else showTip(`<b>${esc(B.name)}</b><br>${esc(CATS[B.cat][0])}<br>Sa di ${esc(topFams(B).join(', ')||'—')}`,e);}
  else if(g.dataset.cat){const [t,c]=g.dataset.cat.split('|');showTip(`<b>${esc(CATS[c][0])}</b> · ${TLABEL[t].toLowerCase()}`,e);}});
wheel.addEventListener('pointermove',moveTip);
wheel.addEventListener('pointerout',e=>{if(e.pointerType==='touch')return;const g=e.target.closest('[data-id],[data-t]');if(!g||g.contains(e.relatedTarget))return;hideTip();
  if(S.mode==='ego'){wheel.querySelectorAll('.lk').forEach(l=>l.style.opacity=.3);highlight(null);}});
function activate(g){if(!g)return;
  if(g.dataset.id){const B=BYID[g.dataset.id];hideTip();
    if(B.isSpirit){if(!$(`.card[data-sid="${B.id}"]`)){S.spAll=true;renderSpirits();}const c=$(`.card[data-sid="${B.id}"]`);if(c){c.scrollIntoView({block:'center',behavior:calm()?'auto':'smooth'});c.classList.add('hl');}}
    else select(B);}
  else if(g.dataset.cat){S.cat=S.cat===g.dataset.cat?null:g.dataset.cat;S.zoom=S.zoom||g.dataset.t;hideTip();renderWheel();renderSide();}
  else if(g.dataset.t!==undefined){const t=g.dataset.t;S.cat=null;S.zoom=(t==='__all'||!t||S.zoom===t)?null:t;hideTip();renderWheel();renderSide();}}
let lastPT='mouse',peekId=null;
wheel.addEventListener('pointerdown',e=>{lastPT=e.pointerType||'mouse';});
function peekHTML(id){const B=BYID[id];if(!B)return'';
  if(S.mode==='ego'&&S.sel){const r=score(S.sel,B);
    return `<div class="pk-t"><b>${esc(B.name)}</b><span class="tiny muted">${esc(kindOf(B))}</span></div><div>${meter(r.total)} ${relTag(r)}</div><p class="tiny">${esc(noChem(firstSentence(r.summary)))}</p>
      <div class="pk-acts"><button type="button" class="btn sm primary" data-peek-open="${B.id}">${B.isSpirit?'Vedi come berlo':'Apri '+esc(B.name)}</button>${benchBtn(B)}</div>`;}
  return `<div class="pk-t"><b>${esc(B.name)}</b><span class="tiny muted">${esc(CATS[B.cat][0])}</span></div><p class="tiny">Sa di ${esc(topFams(B).join(', ')||'—')}</p>
    <div class="pk-acts"><button type="button" class="btn sm primary" data-peek-open="${B.id}">Apri ${esc(B.name)}</button>${benchBtn(B)}</div>`;}
function showPeek(id,kind){peekId=id;const el=$('#wheelPeek');el.innerHTML=peekHTML(id);el.hidden=false;
  if(S.mode==='ego')highlight(id,kind);else{wheel.querySelectorAll('.hl').forEach(n=>n.classList.remove('hl'));wheel.querySelector(`[data-id="${id}"]`)?.classList.add('hl');}}
function hidePeek(){peekId=null;const el=$('#wheelPeek');el.hidden=true;el.innerHTML='';}
$('#wheelPeek').addEventListener('click',e=>{const b=e.target.closest('[data-peek-open]');if(!b)return;const g=wheel.querySelector(`[data-id="${b.dataset.peekOpen}"]`);hidePeek();activate(g);});
wheel.addEventListener('click',e=>{const g=e.target.closest('[data-id],[data-t]');if(!g)return;
  if(lastPT==='touch'&&g.dataset.id&&peekId!==g.dataset.id){showPeek(g.dataset.id,g.dataset.kind);return;}hidePeek();activate(g);});
function rove(){const ns=[...wheel.querySelectorAll('[data-nav]')];if(!ns.length)return;
  const cur=(S.sel&&wheel.querySelector(`[data-nav][data-id="${S.sel.id}"]`))||(S.cat&&wheel.querySelector(`[data-nav][data-cat="${S.cat}"]`))||ns[0];
  ns.forEach(n=>n.setAttribute('tabindex',n===cur?'0':'-1'));}
wheel.addEventListener('keydown',e=>{const g=e.target.closest('[data-nav]');if(!g)return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();const id=g.dataset.id,cat=g.dataset.cat,t=g.dataset.t;activate(g);
    const back=(id&&wheel.querySelector(`[data-nav][data-id="${id}"]`))||(cat&&wheel.querySelector(`[data-nav][data-cat="${cat}"]`))||(t&&wheel.querySelector(`[data-nav][data-t="${t}"]:not([data-cat])`))||wheel.querySelector('[data-nav][tabindex="0"]');
    if(back&&S.tab==='esplora'){wheel.querySelectorAll('[data-nav]').forEach(n=>n.setAttribute('tabindex',n===back?'0':'-1'));back.focus();}return;}
  const ns=[...wheel.querySelectorAll('[data-nav]')];const i=ns.indexOf(g);let j=-1;
  if(e.key==='ArrowRight'||e.key==='ArrowDown')j=(i+1)%ns.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')j=(i-1+ns.length)%ns.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=ns.length-1;else return;
  e.preventDefault();g.setAttribute('tabindex','-1');ns[j].setAttribute('tabindex','0');ns[j].focus();});
wheel.addEventListener('focusin',e=>{const g=e.target.closest('[data-id]');if(g&&S.mode==='ego')highlight(g.dataset.id,g.dataset.kind);});

// ===================== ABBINA =====================
const analysable=()=>{const fs=bench.filter(I=>!I.isSpirit),sp=bench.filter(I=>I.isSpirit);return fs.concat(sp);};
const legendLine=(i)=>['','stroke-dasharray:6 4','stroke-dasharray:1.5 3.5'][i];
function figRadar(T){const ser=T.map((I,i)=>({v:I.ar,c:i===0?'var(--ink)':i===1?'var(--ink2)':'var(--muted)',fo:i===0?.1:.04,dash:['','6 4','1.5 3.5'][i]}));
  return `<div class="radar"><span class="tiny muted">Profumi a confronto</span>${radar(FAM.map(f=>({t:f[2]})),ser,96,72)}</div>
    <p class="flegend">${T.map((I,i)=>`<span><svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" style="stroke:${i===0?'var(--ink)':i===1?'var(--ink2)':'var(--muted)'};stroke-width:2.2;${legendLine(i)}"/></svg>${esc(I.name)}</span>`).join('')}</p>`;}
// due impronte affiancate: si accendono le famiglie di profumi che i due ingredienti condividono
function pairFig(A,B){const sh=sharedFams(A,B);
  return `<div class="pairfig">${impronta(A,124,{hi:sh})}<span class="pf-plus" aria-hidden="true">+</span>${impronta(B,124,{hi:sh})}</div>
    <p class="pf-cap">${sh.length?`<span class="muted">In comune</span> ${sh.slice(0,4).map(i=>`<b>${esc(famLbl(i))}</b>`).join('<span class="dot" aria-hidden="true">·</span>')}`:'<span class="muted">Nessuna famiglia di profumi in comune: stanno insieme per il gusto.</span>'}</p>
    <p class="flegend"><span>${esc(A.name)}</span><span>${esc(B.name)}</span></p>`;}
function names(T){return `<p class="v-names">${T.map(I=>`${mark(I)}<b>${esc(I.name)}</b>`).join('<span aria-hidden="true">+</span>')}</p>`;}
// Abbina ha sempre la stessa impaginazione, da 2 a 5 ingredienti: giudizio con figura, perché, come usarli,
// coppia per coppia, cosa aggiungere, dettagli. Cambia il contenuto delle sezioni, non la loro posizione.
function renderAbbina(){const out=$('#pbOut');const T=analysable();const n=T.length;
  if(n<2){out.innerHTML=`<div class="empty"><h2>${n?`E con ${esc(T[0].name)}, cosa?`:'Il banco è vuoto'}</h2><p class="muted">${n?'Aggiungi un secondo ingrediente: nel campo trovi per primi quelli che gli stanno meglio.':'Aggiungi due ingredienti dal banco qui accanto, oppure parti da una coppia classica:'}</p>
    <div class="pairex">${PAIR_EX.map(p=>`<button type="button" class="ex" data-set="${p.map(I=>I.id).join('+')}">${mark(p[0])}${esc(p[0].name)} + ${esc(p[1].name)}</button>`).join('')}</div></div>`;return;}
  const P=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)P.push({i,j,a:T[i],b:T[j],r:pairT(T[i],T[j])});
  const V=P.filter(p=>p.r);const foods=T.filter(I=>!I.isSpirit);
  const weak=V.slice().sort((x,y)=>x.r.total-y.r.total)[0],best=V.slice().sort((x,y)=>y.r.total-x.r.total)[0];
  let total=null,sub='',tags='',fig='',why=[],how='',details='';
  if(!V.length){sub='Due alcolici tra loro non si giudicano: aggiungi un alimento per vedere come stanno insieme.';}
  else if(n===2){const r=V[0].r,[A,B]=[V[0].a,V[0].b];total=r.total;sub=vOf(total).t;
    tags=relTag(r)+(r.classic?'<span class="chip">Coppia classica</span>':'');fig=pairFig(A,B);
    why=String(r.summary).split(/(?<=\.)\s+/).filter(Boolean);
    const tri=B.isSpirit?[]:trioSpirits(A,B,4);
    how=`<div><h3>Dosi di partenza</h3><p>${esc(r.ratioTxt)}</p><p class="tiny muted" style="margin-top:6px"><b>Prova veloce:</b> ${esc(testTxt(r))}</p></div>
      <div><h3>${B.isSpirit?'Al bancone':'Da bere con tutti e due'}</h3>${B.isSpirit?`<p>${esc(howTo(A,B))}</p>`:spiritChips(tri.map(x=>x.s))}</div>`;
    details=`<p class="scoreline">Punteggio ${num(total)} su 30 ${info('score','punteggio')}</p>${lensTable(r)}<div class="figs-d">${figRadar([A,B])}</div>`;}
  else if(n===3&&foods.length>=2){const t=trio(T[0],T[1],T[2]);total=t.total;const r=t.roles;const tw=t.P[t.wi];
    sub=vOf(total).t.replace(/, o completato con un terzo ingrediente\./,'.');tags=`<span class="chip">${esc(STRUCT[t.structure]||t.structure)}</span>`;fig=triangleSVG(t);
    why=[`La coppia più forte è ${best.a.name} + ${best.b.name}: ${vOf(best.r.total).w.toLowerCase()}, ${REL[best.r.type].w.toLowerCase()}.`,
      t.isBridge?`${t.wz.name} fa da ponte tra ${tw.A.name} e ${tw.B.name}, che da soli dialogano poco.`:tw.total<17?`Il punto debole è ${tw.A.name} + ${tw.B.name}: valuta di sostituirne uno.`:'Tutte e tre le coppie reggono anche da sole.',
      t.rows.find(x=>x.k==='equilibrio').why,t.rows.find(x=>x.k==='intensita').why];
    how=rolesHow(r,3)+`<div><h3>Da bere con tutti e tre</h3>${spiritChips(spiritsForTrio(t.T).map(x=>x.s))}</div>`;
    details=`<p class="scoreline">Punteggio ${num(total)} su 30 ${info('score','punteggio')}</p><table class="lens"><tbody>${t.rows.map(x=>`<tr><td>${esc(x.n)}${info(x.n)}</td><td>${esc(plain(x.why))}</td><td class="v">${num(x.v)}/5</td></tr>`).join('')}</tbody></table>`;}
  else{total=Math.round(V.reduce((a,p)=>a+p.r.total,0)/V.length*2)/2;
    sub=`${BENCHT[vOf(total).k]} È la media delle ${V.length} coppie.`;
    tags=`<span class="chip">${n} ingredienti</span>`;fig=netSVG(T,P);
    const drop=dropSuggestion(T);const tastes=new Set(foods.map(I=>I.dom)).size;
    why=[`La coppia più forte è ${best.a.name} + ${best.b.name}: ${vOf(best.r.total).w.toLowerCase()}.`,
      `La più debole è ${weak.a.name} + ${weak.b.name}: ${vOf(weak.r.total).w.toLowerCase()}. Un banco regge quanto il suo legame più fragile.`,
      drop&&vOf(drop.m).n>vOf(weak.r.total).n?`Senza ${drop.I.name} la coppia più debole diventa ${vOf(drop.m).w.toLowerCase()}.`:'Togliere un solo ingrediente non cambierebbe il giudizio della coppia più debole.',
      foods.length?`Gli alimenti coprono ${tastes} ${tastes===1?'gusto':'gusti'} su 5${tastes>=3?': un profilo ampio, da dosare con cura.':'.'}`:''].filter(Boolean);
    how=(foods.length>=3?rolesHow(roles(foods),n):`<div><h3>Dosi di partenza</h3><p>Parti dall'ingrediente più strutturato e aggiungi gli altri in dosi piccole, assaggiando a ogni passo.</p></div>`)+`<div><h3>Da bere con tutto il banco</h3>${spiritChips(foods.length?spiritsForTrio(T).map(x=>x.s):[])}</div>`;
    details=`<p class="scoreline">Media ${num(total)} su 30 ${info('score','punteggio')}</p><table class="lens"><tbody>${V.map(p=>`<tr><td>${esc(p.a.name)} + ${esc(p.b.name)}</td><td>${REL[p.r.type].w}</td><td class="v">${num(p.r.total)}/30</td></tr>`).join('')}</tbody></table>`;}
  const add=(n===2&&V.length&&!T[1].isSpirit)?thirdHTML(T[0],T[1]):addHTML();
  // il perché sta nel giudizio, sotto la frase: niente riquadro quasi vuoto; con due ingredienti la tabella delle coppie ripeterebbe il giudizio
  out.innerHTML=`<article class="panel verdict">
      <div>${names(T)}${total!=null?meter(total,{big:true}):''}<p class="v-sub">${esc(sub)}</p><div class="v-tags">${tags}</div>
        <div class="v-why"><h2 class="r-h">Perché</h2>${why.length?`<ul class="why">${why.map(s=>`<li>${esc(noChem(plain(s)))}</li>`).join('')}</ul>`:'<p class="add-empty">Serve almeno un alimento.</p>'}</div></div>
      <figure class="figs" style="margin:0">${fig}</figure></article>
    <section class="howto" aria-label="Come usarli">${how||'<div><h3>Dosi</h3><p class="add-empty">—</p></div><div><h3>Da bere</h3><p class="add-empty">—</p></div>'}</section>
    ${n>2?`<section class="panel r-sec"><h2 class="r-h">Coppia per coppia</h2>${matrixHTML(T,weak)}</section>`:''}
    ${add}
    <details class="panel more-d"><summary>Come si arriva al giudizio</summary>${details||'<p class="add-empty">Nessun punteggio: servono un alimento e un altro ingrediente.</p>'}</details>
    <div class="r-cta"><button type="button" class="btn" data-save-pair>Salva nel quaderno</button><button type="button" class="btn primary" data-go-crea>Crea un drink con questi ingredienti →</button></div>`;
  fitRadars($('#pbOut'));}
const spiritChips=list=>list.length?`<div class="chips">${list.map(s=>`<span class="chip">${mark(s)}${esc(s.name)}${spInfo(s)}</span>`).join('')}</div>`:'<p class="add-empty">Nessun alcolico adatto a tutti.</p>';
const BENCHT={forte:'Il banco sta in piedi: da provare.',promettente:'Funziona nel complesso: dosa con cura le coppie più deboli.',rischioso:'Alcune coppie dialogano poco: togli un ingrediente o aggiungine uno che faccia da ponte.',sconsigliato:'Troppe coppie in conflitto: riparti da due o tre ingredienti.'};
function rolesHow(r,n){return `<div><h3>Ruoli e dosi ${info('roles','ruoli e dosi')}</h3><p><b>${esc(r.base.name)}</b> come base, <b>${esc(r.comp.name)}</b> come complemento, <b>${esc(r.accent.name)}</b> come accento${n>3?'; gli altri in piccole dosi':''}. Parti da ${esc(r.ratio)} e correggi all'assaggio.</p></div>`;}
function dropSuggestion(T){let drop=null;T.forEach((I,k)=>{const rest=T.filter((_,q)=>q!==k);let m=99;
  for(let i=0;i<rest.length;i++)for(let j=i+1;j<rest.length;j++){const r=pairT(rest[i],rest[j]);if(r)m=Math.min(m,r.total);}
  if(m<99&&(!drop||m>drop.m))drop={I,m};});return drop;}
// metà sotto la diagonale: ogni coppia una volta sola
function matrixHTML(T,weak){const n=T.length;if(n===2){const r=pairT(T[0],T[1]);
    return `<div class="matrix-w"><table class="matrix"><tbody><tr><th scope="row">${esc(T[0].name)} + ${esc(T[1].name)}</th><td${r?'':' class="na"'}>${r?meter(r.total):'non si giudica'}</td></tr></tbody></table></div>`;}
  const cols=T.slice(0,n-1),rows=T.slice(1);
  return `<div class="matrix-w"><table class="matrix"><thead><tr><td class="blank"></td>${cols.map(I=>`<th scope="col"><span>${esc(I.name)}</span></th>`).join('')}</tr></thead><tbody>
    ${rows.map((I,ri)=>{const i=ri+1;return `<tr><th scope="row">${esc(I.name)}</th>${cols.map((J,j)=>{if(j>=i)return '<td class="blank"></td>';const r=pairT(I,J);
      if(!r)return '<td class="na">—</td>';const w=weak&&((weak.a===I&&weak.b===J)||(weak.a===J&&weak.b===I));return `<td${w?' class="weak" title="La coppia più debole"':''}>${meter(r.total)}</td>`;}).join('')}</tr>`;}).join('')}
  </tbody></table></div>${weak&&n>2?`<p class="tiny muted">Il riquadro evidenziato è la coppia più debole.</p>`:''}`;}
// da 4 ingredienti: rete delle coppie (spessore = forza, tratteggio = si bilanciano)
function netSVG(T,P){const n=T.length,cx=180,cy=150,R=88;const pos=T.map((_,i)=>pol(R,-90+i*360/n).map((v,k)=>v+(k?cy:cx)));
  let h=`<svg class="net" viewBox="0 0 360 300" role="img" aria-label="Le coppie del banco: lo spessore delle linee indica la forza del legame">`;
  P.forEach(p=>{if(!p.r)return;const [x1,y1]=pos[p.i],[x2,y2]=pos[p.j];const w=(1+Math.max(0,p.r.total-10)/4).toFixed(1);const fr=p.r.total<17;
    h+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--ink);stroke-opacity:${fr?.3:.8};stroke-width:${w};${p.r.type==='contrasto'?'stroke-dasharray:7 5;':''}stroke-linecap:round"/>`;});
  T.forEach((I,i)=>{const [x,y]=pos[i];const a=-90+i*360/n;const [lx,ly]=pol(R+28,a).map((v,k)=>v+(k?cy:cx));const c=Math.cos(a*Math.PI/180);
    h+=I.isSpirit?`<rect x="${x-8}" y="${y-8}" width="16" height="16" transform="rotate(45 ${x} ${y})" style="fill:var(--surface);stroke:var(--ink);stroke-width:2.2"/>`:`<circle cx="${x}" cy="${y}" r="10" style="fill:${tcol(I.dom)};stroke:var(--surface);stroke-width:3"/>`;
    const ln=wrapName(I.name,11,true),anc=Math.abs(c)<.3?'middle':c>0?'start':'end',y0=ly+5-(ln.length-1)*8;
    h+=`<text text-anchor="${anc}" style="font-size:13.5px;font-weight:600;fill:var(--ink)">${ln.map((l,k)=>`<tspan x="${lx.toFixed(1)}" y="${(y0+k*16).toFixed(1)}">${esc(l)}</tspan>`).join('')}</text>`;});
  return h+`</svg><p class="flegend"><span><svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" style="stroke:var(--ink);stroke-width:2.2"/></svg>si somigliano</span><span><svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" style="stroke:var(--ink);stroke-width:2.2;stroke-dasharray:6 5"/></svg>si bilanciano</span><span>più spessa, più forte</span></p>`;}
// cosa aggiungere quando il banco ha già tre o più ingredienti
function addHTML(){const full=bench.length>=MAXB;const sg=full?null:benchSuggest();const items=sg?sg.groups[0].items.slice(0,6).concat(sg.groups[1].items.slice(0,2)):[];
  return `<section class="panel r-sec add-s" aria-labelledby="h-add"><div class="r-sec-h"><h2 class="r-h" id="h-add">${full?'Il banco è pieno':'Aggiungi un ingrediente'}</h2></div>
    ${full?'<p class="add-empty">Cinque ingredienti al massimo: togline uno per provarne un altro. La tabella qui sopra ti dice quale pesa di più.</p>'
      :`<p class="tiny muted">Quelli che stanno meglio con tutto il banco.</p><ul class="sug">${items.map(C=>{const ts=bench.map(i=>pairT(i,C)).filter(Boolean).map(r=>r.total);const m=Math.min(...ts);
        return `<li>${impronta(C,40,{label:false})}<span class="sg"><b>${esc(C.name)}</b><small>Con il banco, al peggio: ${vOf(m).w.toLowerCase()}</small></span>${benchBtn(C,'Aggiungi')}</li>`;}).join('')}</ul>`}</section>`;}
$('#pbOut').addEventListener('click',e=>{const x=e.target.closest('[data-set]');if(x){benchSet(x.dataset.set.split('+').map(id=>BYID[id]));return;}
  if(e.target.closest('[data-go-crea]')){show('crea',{push:true});scrollTo({top:0});return;}
  const l=e.target.closest('[data-lens]');if(l){S.lens=l.dataset.lens;renderAbbina();return;}
  const pg=e.target.closest('[data-sugp]');if(pg){SUGP.page+=+pg.dataset.sugp;renderAbbina();$(`#pbOut [data-sugp="${pg.dataset.sugp}"]:not([disabled])`)?.focus();return;}
  const rm=e.target.closest('[data-drop]');if(rm){benchRemove(BYID[rm.dataset.drop]);return;}
  if(e.target.closest('[data-save-pair]')){const T=analysable();const ts=T.map(I=>I.name);noteAdd({kind:'coppia',title:ts.join(' + '),sub:$('#pbOut .meter .m-w')?.textContent||'Abbinamento',hash:location.hash});}});

function lensTable(r){return `<table class="lens"><tbody>${r.lens.map(l=>`<tr><td>${esc(l.k)}${info(l.k)}</td><td>${esc(plain(l.why))}</td><td class="v">${num(l.v)}/5</td></tr>`).join('')}</tbody></table>`;}
// UX-40: si parte dal criterio che dà le proposte più affidabili (lega bene con tutti e due); gli altri restano a un tocco
const LENSORD=['debole','piramide','equilibrio','intensita'].filter(k=>TLENS.some(l=>l[0]===k));
const SUG_N=24,SUG_PER=6,SUGP={key:'',list:[],page:0};
function thirdHTML(A,B){
  const key=A.id+'|'+B.id+'|'+S.lens;if(SUGP.key!==key){SUGP.key=key;SUGP.list=suggestThird(A,B,S.lens,SUG_N);SUGP.page=0;}
  const list=SUGP.list,pages=Math.max(1,Math.ceil(list.length/SUG_PER));SUGP.page=Math.max(0,Math.min(SUGP.page,pages-1));
  const from=SUGP.page*SUG_PER,shown=list.slice(from,from+SUG_PER);
  const full=bench.length>=MAXB;
  return `<section class="panel r-sec add-s" aria-labelledby="h-third"><div class="r-sec-h"><h2 class="r-h" id="h-third">Aggiungi un terzo ingrediente</h2>
      ${pages>1?`<div class="pager" role="group" aria-label="Altre proposte"><button type="button" data-sugp="-1" aria-label="Proposte precedenti"${SUGP.page?'':' disabled'}>‹</button><span aria-live="polite">${from+1}–${from+shown.length} di ${list.length}</span><button type="button" data-sugp="1" aria-label="Altre proposte"${SUGP.page<pages-1?'':' disabled'}>›</button></div>`:''}</div>
    <div class="lensbar" role="group" aria-label="Che cosa deve fare il terzo ingrediente">${LENSORD.map(k=>`<button type="button" data-lens="${k}" aria-pressed="${S.lens===k}">${LENSP[k][0]}</button>`).join('')}</div>
    <p class="tiny muted">${LENSP[S.lens][1]}</p>
    <ul class="sug">${shown.map(x=>`<li>${impronta(x.C,40,{label:false})}<span class="sg"><b>${esc(x.C.name)}</b><small>${esc(plain(lensReason(S.lens,A,B,x.C,x.t)))}</small></span>${full?'':benchBtn(x.C,'Aggiungi')}</li>`).join('')}</ul></section>`;}
function triangleSVG(t){const P=[[180,46],[62,236],[298,236]];const E=[[0,1],[0,2],[1,2]];
  let h=`<svg class="tri" viewBox="0 0 360 290" role="img" aria-label="Le tre coppie del trio: lo spessore delle linee indica la forza del legame">`;
  E.forEach(([i,j],k)=>{const p=t.P[k];const w=(1.4+Math.max(0,p.total-10)/3.6).toFixed(1);const weak=k===t.wi&&!t.isBridge&&p.total<17;
    h+=`<line x1="${P[i][0]}" y1="${P[i][1]}" x2="${P[j][0]}" y2="${P[j][1]}" style="stroke:var(--ink);stroke-opacity:${weak?.35:.85};stroke-width:${w};${p.type==='contrasto'?'stroke-dasharray:8 6;':''}stroke-linecap:round"/>`;});
  E.forEach(([i,j],k)=>{const p=t.P[k];const mx=(P[i][0]+P[j][0])/2,my=(P[i][1]+P[j][1])/2;const dx=mx-180,dy=my-172,L=Math.hypot(dx,dy)||1;const lx=mx+dx/L*18,ly=my+dy/L*18;const vv=vOf(p.total);
    h+=`<g><rect x="${lx-40}" y="${ly-12}" width="80" height="24" rx="12" style="fill:var(--surface);stroke:var(--line2)"/><text x="${lx}" y="${ly+4.5}" text-anchor="middle" style="font-size:12.5px;font-weight:600;fill:var(--ink)">${vv.w}</text></g>`;});
  t.T.forEach((I,i)=>{const [x,y]=P[i];const ty=i===0?y-20:y+32;
    h+=I.isSpirit?`<rect x="${x-9}" y="${y-9}" width="18" height="18" transform="rotate(45 ${x} ${y})" style="fill:var(--surface);stroke:var(--ink);stroke-width:2.5"/>`:`<circle cx="${x}" cy="${y}" r="11" style="fill:${tcol(I.dom)};stroke:var(--surface);stroke-width:3"/>`;
    h+=`<text x="${x}" y="${ty}" text-anchor="middle" style="font-size:14px;font-weight:600;fill:var(--ink)">${esc(trunc(I.name,22))}</text>`;});
  return h+'</svg><p class="flegend"><span><svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" style="stroke:var(--ink);stroke-width:2.2"/></svg>si somigliano</span><span><svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" style="stroke:var(--ink);stroke-width:2.2;stroke-dasharray:6 5"/></svg>si bilanciano</span></p>';}
// ---------- il metodo, in breve ----------
$('#methodBody').innerHTML=`
  <div><h3>Il profilo di ogni ingrediente</h3><p>Cinque gusti, la sensazione in bocca (grasso, piccante, astringente, fresco) e diciotto famiglie di profumi, tutto da 0 a 5. Il gusto più alto decide il posto nella ruota.</p></div>
  <div><h3>Due modi di stare bene insieme</h3><p><b>≈ Si somigliano:</b> condividono profumi o si rinforzano, come pomodoro e basilico.</p><p><b>⇄ Si bilanciano:</b> un gusto compensa l'altro, come il sale con il dolce o l'acido con il grasso.</p></div>
  <div><h3>Il giudizio</h3><p>Sei criteri da 0 a 5: profumi in comune, equilibrio dei gusti, intensità, note fresche-centrali-profonde, stagione e territorio, tradizione. La somma diventa una parola: ottimo, buono, azzardato, da evitare. Il numero esatto è sempre nei dettagli.</p></div>`;

// ===================== CREA =====================
const MODELBL={classic:'Classica',lab:'Laboratorio',low:'Leggera'};
const MODEDESC={classic:'Tecniche da bancone: succhi freschi, sciroppi, infusioni a freddo, pestato.',lab:'Roner, fat-wash, acidi corretti con citrico e malico, carbonazione.',low:'La stessa idea con meno alcol: un vino aromatizzato o fortificato come base.'};
const SHELVES=[['Mescolati',['oldfashioned','martini','negroni']],['Shakerati',['sour','sour_albume','flip','royale']],['Lunghi',['collins','highball','spritz','julep']],['Speciali',['tiki','milkpunch']]];
const STY_VERSATILE=['sour','highball','collins','spritz','negroni','oldfashioned','julep','martini','royale','sour_albume','flip','tiki','milkpunch'];
const ckFoods=()=>bench.filter(i=>!i.isSpirit);
const ingBase=()=>bench.find(i=>i.isSpirit&&(i.grp==='bia'||i.grp==='inv'))||null;
// con la bottigliera compilata, tra le basi proposte vince la prima che hai (se non è molto peggiore)
function effBase(){return CK.base||ingBase()||preferOwned(suggestBases(ckFoods(),CK.style))?.s||null;}
// lo stile proposto nasce dal carattere del banco (fresco, amaro, tostato, cremoso, tropicale, floreale…), non da un ordine fisso
function autoStyle(){const fs=ckFoods();const b0=CK.base||ingBase()||preferOwned(suggestBases(fs,null))?.s||null;if(!b0)return null;
  return autoStyleFor(bench,b0)||STY_VERSATILE.find(id=>STY[id]&&styleFit(b0,id).ok)||null;}
function styleShort(R){const st=R.st,b=R.base?R.base.name:'';
  switch(st.id){case 'oldfashioned':return'Old Fashioned';case 'martini':return R.base&&R.base.grp==='ver'?'Reverse Martini':/Gin|Vodka|Genever/.test(b)?'Martini':'Manhattan';
    case 'negroni':return /Bourbon|Rye|Scotch|whisky/i.test(b)?'Boulevardier':'Negroni';case 'sour':return R.spec.some(l=>l.sp&&l.sp.grp==='liq')?'Daisy':'Sour';
    case 'sour_albume':return'Sour';case 'collins':return R.texture?'Fizz':'Collins';case 'highball':return R.lengthLbl==='Ginger beer'?'Buck':'Highball';
    case 'julep':return R.spec.some(l=>/menta/.test(l.name))?'Julep':'Smash';case 'flip':return R.texture==='panna'?'Cream':'Flip';
    case 'spritz':return'Spritz';case 'royale':return'Royale';case 'tiki':return'Swizzle';case 'milkpunch':return'Milk Punch';}}
function drinkName(R,inputs){const fs=inputs.filter(i=>!i.isSpirit).map(i=>i.name.replace(/\s*\(.*\)/,''));const nm=fs.slice(0,2).join(' & ')||inputs[0]?.name||'';return `${nm} ${styleShort(R)}`;}
function genRecipes(){if(!bench.length||!CK.style)return[];const st=STY[CK.style];const b=effBase();
  const out=[buildRecipe(bench,CK.style,'classic',b),buildRecipe(bench,CK.style,'lab',b)];
  if(st.base&&st.id!=='milkpunch'&&(!b||abvOf(b)>0.25))out.push(buildRecipe(bench,CK.style,'low',null));return out;}

function renderCrea(){
  if(!bench.length){if(CK.styleAuto){CK.style=null;}}
  else if(!CK.style||CK.styleAuto){CK.style=autoStyle();CK.styleAuto=!!CK.style;}
  renderBaseCtl();renderGlasses();if($('#ckMixBox').open)$('#ckMix').innerHTML=mixProfile();$('#ckMixBox').hidden=!ckFoods().length;renderRecipe();}
$('#ckMixBox').addEventListener('toggle',()=>{if($('#ckMixBox').open)$('#ckMix').innerHTML=mixProfile();});

function renderBaseCtl(){const host=$('#ckBase');const fs=ckFoods();const eb=effBase();const ib=ingBase();
  if(!bench.length){host.innerHTML=CK.base?`<div class="bline"><span class="tiny muted">Del classico</span><b>${esc(CK.base.name)}${spInfo(CK.base)}</b></div>`:'<p class="tiny muted">La scelgo io appena metti un ingrediente sul banco.</p>';return;}
  if(!eb){host.innerHTML='<p class="tiny muted">Nessuna base adatta: prova con un altro ingrediente.</p>';return;}
  const sug=suggestBases(fs,CK.style);const ex=sug.find(x=>x.s===eb);
  const lbl=CK.base?'Scelta da te':ib?'Dal tuo banco':owns(eb)?'Ce l\'hai':'Consigliata';
  let h=`<div class="bline"><span class="tiny muted">${lbl}</span><b>${esc(eb.name)}${spInfo(eb)}</b>${fs.length?`<button type="button" class="link" data-bopen aria-expanded="${!!CK.baseOpen}">${CK.baseOpen?'Chiudi':'Cambia'}</button>`:''}${ex&&ex.ov.length?`<span class="bl-w">Profumi in comune: ${esc(listIt(ex.ov))}</span>`:''}</div>`;
  if(CK.baseOpen&&fs.length){const groups=[['all','Tutte']].concat(BGROUPS.map(g=>[g[0],g[1]])).filter(g=>g[0]==='all'||suggestBases(fs,CK.style,g[0]).length);
    const list=suggestBases(fs,CK.style,CK.bgroup).slice(0,5);if(eb&&!list.some(x=>x.s===eb)){const e=sug.find(x=>x.s===eb);if(e)list.push(e);}
    h+=`<div class="bopts"><div class="bfilter" role="group" aria-label="Tipo di base">${groups.map(g=>`<button type="button" data-bg="${g[0]}" aria-pressed="${CK.bgroup===g[0]}">${g[1]}</button>`).join('')}</div>
      <ul class="blist">${list.map(x=>`<li><button type="button" data-base="${x.s.id}" aria-pressed="${x.s===eb}"><span class="bt"><b>${esc(x.s.name)}${owns(x.s)?' <span class="own">ce l\'hai</span>':''}</b>${meter(x.mean)}</span><small>${esc(x.ov.length?'Profumi in comune: '+listIt(x.ov):'Lega per contrasto più che per somiglianza')}${x.fit?' · tipica di questo stile':''}</small></button></li>`).join('')}</ul>
      <label class="tiny muted" for="ckBaseSel">Oppure scegli tra tutte</label>
      <select id="ckBaseSel" class="sel"><option value="">${ib&&!CK.base?'Dal tuo banco: '+esc(ib.name):'Consigliata'+(sug[0]?': '+esc(sug[0].s.name):'')}</option>${BGROUPS.map(([g,l,fn])=>`<optgroup label="${l}">${BASES.filter(fn).map(s=>`<option value="${s.id}"${CK.base===s?' selected':''}>${esc(s.name)}${styleFit(s,CK.style).ok?'':' · non adatta allo stile'}</option>`).join('')}</optgroup>`).join('')}</select>
      ${CK.base?'<button type="button" class="link tiny" data-breset>Torna alla consigliata</button>':''}</div>`;}
  host.innerHTML=h;}
$('#ckBase').addEventListener('click',e=>{if(e.target.closest('[data-bopen]')){CK.baseOpen=!CK.baseOpen;renderBaseCtl();return;}
  const g=e.target.closest('[data-bg]');if(g){CK.bgroup=g.dataset.bg;renderBaseCtl();return;}
  if(e.target.closest('[data-breset]')){CK.base=null;renderCrea();sync(false);return;}
  const b=e.target.closest('[data-base]');if(b){const s=BYID[b.dataset.base];const auto=ingBase()||suggestBases(ckFoods(),CK.style)[0]?.s;CK.base=s===auto?null:s;renderCrea();sync(false);}});
$('#ckBase').addEventListener('change',e=>{if(e.target.id!=='ckBaseSel')return;CK.base=BYID[e.target.value]||null;renderCrea();sync(false);});

let glPT='mouse',glPeek=null;
function renderGlasses(){glPeek=null;$('#ckGlassPeek').hidden=true;const eb=effBase();
  $('#ckGlass').innerHTML=SHELVES.map(([lbl,ids])=>`<div class="shelf"><span class="shelf-l">${lbl}</span><div class="shelf-row" style="--n:${ids.length}">${ids.filter(id=>STY[id]).map(id=>{const s=STY[id];const fit=styleFit(eb,id);const on=id===CK.style;
    return `<button type="button" class="glass${fit.ok?'':' nofit'}" data-sty="${id}" style="--gc:${GLASSES[id]?.lq[0][1]||'transparent'}" aria-pressed="${on}" aria-label="${esc(s.name)}${fit.ok?'':', non adatto alla base'}${on&&CK.styleAuto?', scelto per te':''}">${on&&CK.styleAuto?'<span class="tag" aria-hidden="true">per te</span>':''}${glassSVG(id,48,'')}<span>${esc(s.name)}</span></button>`;}).join('')}</div></div>`).join('');}
$('#ckGlass').addEventListener('pointerdown',e=>{glPT=e.pointerType||'mouse';});
$('#ckGlass').addEventListener('click',e=>{const b=e.target.closest('[data-sty]');if(!b)return;
  if(glPT==='touch'&&glPeek!==b.dataset.sty&&b.dataset.sty!==CK.style){glPeek=b.dataset.sty;const el=$('#ckGlassPeek');
    el.innerHTML=`<p class="tiny">${tipHTML(b)}</p><div class="pk-acts"><button type="button" class="btn sm primary" data-pick-sty="${b.dataset.sty}">Scegli ${esc(STY[b.dataset.sty].name)}</button></div>`;el.hidden=false;
    $$('#ckGlass .glass').forEach(x=>x.classList.toggle('peeked',x===b));return;}
  CK.style=b.dataset.sty;CK.styleAuto=false;CK.classic=null;hideInfo();renderCrea();sync(false);});
$('#ckGlassPeek').addEventListener('click',e=>{const b=e.target.closest('[data-pick-sty]');if(!b)return;CK.style=b.dataset.pickSty;CK.styleAuto=false;renderCrea();sync(false);});

function mixProfile(){const fs=ckFoods();if(!fs.length)return'';
  const g=CK.mixView!=='aromi';const labels=g?TORDER.map(k=>({t:TLABEL[k],c:tcol(k)})):FAM.map(f=>({t:f[2]}));
  const val=I=>g?TORDER.map(k=>I.t[k]):I.ar;const mix=g?TORDER.map(k=>Math.max(...fs.map(f=>f.t[k]))):FAM.map((_,i)=>Math.max(...fs.map(f=>f.ar[i])));
  const ser=[{v:mix,c:'var(--ink)',fo:.12}].concat(fs.length>1?fs.map((f,i)=>({v:val(f),c:'var(--muted)',fo:0,dash:['4 3','1.5 3','8 4','2 2','6 2 2 2'][i]})):[]);
  const w=$('#ckMix').clientWidth||320,vbw=g?2*(118+52):2*(112+76);
  return `<div class="mix-h"><div class="seg" role="group" aria-label="Profilo da mostrare"><button type="button" data-mv="gusti" aria-pressed="${g}">Gusti</button><button type="button" data-mv="aromi" aria-pressed="${!g}">Profumi</button></div></div>
    <div class="mixradar" style="--rfs:${(13*vbw/Math.max(240,w)).toFixed(2)}px">${g?radar(labels,ser,118,52):radar(labels,ser,112,76)}</div>
    <p class="tiny muted">${fs.length>1?'La forma piena è il banco intero; i tratteggi i singoli ingredienti.':'Profilo di '+esc(fs[0].name)+'.'}</p>`;}
$('#ckMix').addEventListener('click',e=>{const b=e.target.closest('[data-mv]');if(!b)return;CK.mixView=b.dataset.mv;$('#ckMix').innerHTML=mixProfile();});

function recipeText(R){const L=[drinkName(R,bench),`${R.st.name} · ${MODELBL[R.mode]} · ${R.vol} ml · ~${fmt(R.abv)}% vol`,'',
  ...R.spec.map(l=>`${l.drop?'—':fmt(l.ml)+' ml'}  ${l.name}${l.post?' (per colmare)':''}`),'',`Garnish: ${R.garnish[0]}`,'',
  ...(R.preps.length?['Mise en place',...R.preps.flatMap(p=>[`· ${p.title}`,...p.steps.map(s=>'  '+s)]),'']:[]),
  'Preparazione',...R.method.map((s,i)=>`${i+1}. ${s}`),'',location.href];return L.join('\n');}
function renderRecipe(){const out=$('#ckOut');
  if(!bench.length&&CK.classic&&CK.style===CK.classic.sty){const c=CK.classic;
    out.innerHTML=`<div class="empty classic-empty"><div class="ce-h">${glassSVG(c.sty,72,'')}<h2>Il tuo ${esc(c.w)}, con…</h2></div><p class="muted">Aggiungi al banco l'ingrediente che vuoi metterci dentro: tengo lo stile del ${esc(c.w)} e una base ${esc(CK.base?CK.base.name:'classica')}, e adatto la ricetta. Stanno bene con questa base:</p>
      <div class="pairex">${classicTwists(c).map(f=>`<button type="button" class="ex" data-goadd="${f.id}">${catIcon(f,15)}${esc(f.name)}</button>`).join('')}</div></div>`;return;}
  if(!bench.length){out.innerHTML=`<div class="empty"><h2>La ricetta comparirà qui</h2><p class="muted">Metti sul banco da uno a cinque ingredienti: scelgo io base e bicchiere, tu cambi quello che vuoi.</p><div class="pairex">${DRINK_EX.map(p=>`<button type="button" class="ex" data-set="${p.map(I=>I.id).join('+')}">${mark(p[0])}${esc(p[0].name)} + ${esc(p[1].name)}</button>`).join('')}</div></div>`;return;}
  const rs=genRecipes();
  if(!rs.length){out.innerHTML=`<div class="empty"><h2>Scegli un bicchiere</h2><p class="muted">Con questi ingredienti non trovo uno stile adatto: scegline uno a sinistra.</p></div>`;return;}
  const coh=coherence(bench,CK.style,effBase());
  if(coh.block.length){out.innerHTML=`<div class="nogo"><div>${glassSVG(CK.style,72,'')}</div><div><h2>Così non regge</h2><ul>${coh.block.map(b=>`<li>${esc(b.txt)}</li>`).join('')}</ul>
      ${coh.block.some(b=>b.k==='style')&&coh.altStyles.length?`<p class="tiny muted">Con ${esc(effBase().name)} funzionano meglio:</p><div class="alts">${coh.altStyles.map(s=>`<button type="button" class="btn sm" data-gosty="${s.id}">${esc(s.name)}</button>`).join('')}</div>`:''}
      ${coh.block.some(b=>b.k!=='pair')&&coh.altBases.length?`<p class="tiny muted">Oppure tieni lo stile e cambia base:</p><div class="alts">${coh.altBases.map(s=>`<button type="button" class="btn sm" data-gobase="${s.id}">${esc(s.name)}</button>`).join('')}</div>`:''}
      ${coh.bridges.length&&bench.length<MAXB?`<p class="tiny muted">Oppure aggiungi un ingrediente ponte:</p><div class="alts">${coh.bridges.map(c=>`<button type="button" class="btn sm" data-goadd="${c.id}">+ ${esc(c.name)}</button>`).join('')}</div>`:''}</div></div>`;return;}
  if(!rs.some(r=>r.mode===CK.view))CK.view='classic';
  const R=rs.find(r=>r.mode===CK.view);const baseTxt=[R.base?R.base.name:R.mods[0]?.name,R.base2?.name].filter(Boolean).join(' + ');
  const spec=R.spec.map(l=>`<li${l.auto?' class="auto"':''}><span class="q">${l.drop?'—':fmt(l.ml)+'<em> ml</em>'}</span><span>${esc(l.name)}${l.post?'<small>per colmare</small>':''}${l.auto?'<small>aggiunto dal metodo</small>':''}</span></li>`).join('')
    +(R.st.id==='milkpunch'?`<li><span class="q">${R.st.clar}<em> ml</em></span><span>${esc(R.clarName)}<small>per chiarificare, non resta nel drink</small></span></li>`:'');
  const warns=[...(coh.warn||[]),...R.warn];
  out.innerHTML=`<article class="sheet" aria-labelledby="dname">
    <div class="sheet-hero">${glassSVG(R.st.id,96,R.st.name,true)}<div><h2 class="dname" id="dname">${esc(drinkName(R,bench))}</h2><p class="dmeta">${esc(R.st.name)} · base ${esc(baseTxt)}</p>
      <div class="sheet-acts"><button type="button" class="btn sm primary" data-bancone>Preparalo</button><button type="button" class="btn sm" data-save-drink>Salva</button><button type="button" class="btn sm" data-share-img>Immagine</button><button type="button" class="btn sm ghost" data-copy-recipe>Copia la ricetta</button><button type="button" class="btn sm ghost" data-copy-link>Copia il link</button></div></div></div>
    <div class="versions"><div class="versions-h"><h3 id="vers-h">Scegli la versione</h3><span class="tiny muted">${rs.length===3?'tre modi':'due modi'} di fare lo stesso drink</span></div>
      <div class="vers" role="radiogroup" aria-labelledby="vers-h">${rs.map(r=>`<button type="button" role="radio" data-view="${r.mode}" aria-checked="${r.mode===CK.view}" tabindex="${r.mode===CK.view?0:-1}"><b>${MODELBL[r.mode]}</b><small>${esc(MODEDESC[r.mode])}</small><span class="vm">~${fmt(r.abv)}% vol · ${r.vol} ml</span></button>`).join('')}</div></div>
    <dl class="rstats"><div><dt>Volume</dt><dd>${R.vol} ml</dd></div><div><dt>Alcol</dt><dd>~${fmt(R.abv)}%</dd></div><div><dt>Bicchiere</dt><dd>${esc(R.st.glass)}</dd></div><div><dt>Ghiaccio</dt><dd>${esc(R.st.ice)}</dd></div></dl>
    <div class="sheet-b">
      <div><section><h3>Ricetta</h3><ul class="spec">${spec}</ul>${barLineHTML(R)}</section><section><h3>Guarnizione</h3><p>${esc(cap(R.garnish[0]))}.</p></section></div>
      <div>${R.preps.length?`<section><h3>Da preparare prima</h3>${R.preps.map((p,i)=>`<details class="prep"${i<1?' open':''}><summary>${esc(p.title)}</summary><ol>${p.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details>`).join('')}</section>`:''}
        <section><h3>Preparazione</h3><ol class="steps">${R.method.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
        ${R.why.length?`<section><h3>Perché funziona</h3><ul class="why">${R.why.map(s=>`<li>${esc(plain(s))}</li>`).join('')}</ul></section>`:''}
        ${warns.length?`<section><p class="safety">${warns.map(esc).join(' ')}</p></section>`:''}</div>
    </div>
  </article>`;
  renderRecipe.R=R;stickRecipe();}
// la ricetta resta in vista mentre scegli a sinistra; se è più alta dello schermo scorre con la pagina e si ferma quando se ne vede il fondo
function stickRecipe(){const el=$('#ckOut');if(!el)return;if(innerWidth<961||S.tab!=='crea'){el.style.top='';return;}
  requestAnimationFrame(()=>{const h=el.offsetHeight;el.style.top=Math.min(84,innerHeight-h-16)+'px';});}
$('#ckOut').addEventListener('keydown',e=>{const b=e.target.closest('.vers [role=radio]');if(!b||!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key))return;e.preventDefault();
  const bs=[...b.parentNode.children];const i=bs.indexOf(b);const nx=bs[(i+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:bs.length-1))%bs.length];CK.view=nx.dataset.view;renderRecipe();$(`#ckOut [data-view="${CK.view}"]`)?.focus();});
$('#ckOut').addEventListener('click',e=>{const x=e.target.closest('[data-set]');if(x){benchSet(x.dataset.set.split('+').map(id=>BYID[id]));return;}
  const v=e.target.closest('[data-view]');if(v){CK.view=v.dataset.view;renderRecipe();$(`#ckOut [data-view="${CK.view}"]`)?.focus();return;}
  const s=e.target.closest('[data-gosty]');if(s){CK.style=s.dataset.gosty;CK.styleAuto=false;renderCrea();sync(false);return;}
  const g=e.target.closest('[data-gobase]');if(g){CK.base=BYID[g.dataset.gobase];renderCrea();sync(false);return;}
  const a=e.target.closest('[data-goadd]');if(a){benchAdd(BYID[a.dataset.goadd]);return;}
  if(e.target.closest('[data-bancone]')&&renderRecipe.R){const R=renderRecipe.R,nm=drinkName(R,bench),h=location.hash;
    openBancone(R,nm,{onDone:()=>{const n=noteAdd({kind:'drink',title:nm,sub:`${R.st.name} · base ${R.base?R.base.name:''}`,hash:h,sty:R.st.id});openNotebook(n.id);}});return;}
  if(e.target.closest('[data-save-drink]')&&renderRecipe.R){const R=renderRecipe.R;noteAdd({kind:'drink',title:drinkName(R,bench),sub:`${R.st.name} · ${MODELBL[R.mode].toLowerCase()} · base ${R.base?R.base.name:''}`,hash:location.hash,sty:R.st.id});return;}
  if(e.target.closest('[data-share-img]')&&renderRecipe.R){shareImage(renderRecipe.R,drinkName(renderRecipe.R,bench),bench);return;}
  if(e.target.closest('[data-copy-recipe]')&&renderRecipe.R){copyText(recipeText(renderRecipe.R),'Ricetta copiata');return;}
  if(e.target.closest('[data-copy-link]'))copyText(location.href,'Link copiato');});

// ===================== avvio =====================
$('.kicker').textContent=`${FOODS.length} alimenti · ${SPIRITS.length} alcolici · un metodo per abbinarli`;
if(!location.hash)setHash('#esplora',false);
route();
