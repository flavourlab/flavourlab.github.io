// Kit dell'interfaccia: helper senza stato, lingua visiva unica (verdetti, relazioni), bicchieri, radar, campo di ricerca.
import { CATS, SGROUP, TLABEL, norm } from '../domain/core.js';
import { verdict } from '../domain/scoring.js';

export const $=s=>document.querySelector(s);
export const $$=s=>[...document.querySelectorAll(s)];
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const tcol=k=>`var(--t-${k})`;
export const TOUCH=()=>matchMedia('(hover: none)').matches;
export const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export const num=v=>String(Math.round(v*10)/10).replace('.',',');
export const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
export const aD=n=>(/^[aA]/.test(n)?'ad ':'a ')+n;

// ---------- una sola scala per tutto il sito ----------
// Il punteggio /30 resta nei dettagli: in primo piano c'è una parola e un indicatore a quattro tacche, senza colore.
export const VERD={
  forte:{w:'Ottimo',n:4,t:'Da provare subito.'},
  promettente:{w:'Buono',n:3,t:'Funziona: va calibrato nelle dosi, o completato con un terzo ingrediente.'},
  rischioso:{w:'Azzardato',n:2,t:'Serve un ingrediente che faccia da ponte tra i due.'},
  sconsigliato:{w:'Da evitare',n:1,t:'Meglio di no, salvo un\'idea creativa precisa.'},
};
export function vOf(t){const k=verdict(t)[0];return {k,...VERD[k],score:t};}
export function meter(t,{big=false,word=true}={}){const v=vOf(t);
  return `<span class="meter${big?' big':''}" title="${num(t)} su 30" data-v="${v.k}"><span class="m-dots" aria-hidden="true">${[1,2,3,4].map(i=>`<i${i<=v.n?' class="on"':''}></i>`).join('')}</span>${word?`<span class="m-w">${v.w}</span>`:''}<span class="sr">, ${num(t)} su 30</span></span>`;}

// relazione tra due ingredienti, in parole semplici
export const REL={concordanza:{w:'Si somigliano',ic:'≈',d:'condividono profumi o si rinforzano a vicenda'},contrasto:{w:'Si bilanciano',ic:'⇄',d:'un gusto compensa l\'altro, come l\'acido con il grasso o il sale con il dolce'}};
export function relTag(r){const a=REL[r.type];return `<span class="rel ${r.type}" title="${esc(cap(a.d))}"><span aria-hidden="true">${a.ic}</span>${a.w}</span>`;}

// criteri del terzo ingrediente e struttura del trio, senza gergo
export const LENSP={piramide:['Completa i profumi','Il terzo porta le note che mancano: fresche, centrali o profonde.'],equilibrio:['Bilancia i gusti','Il terzo compensa dolce, acido, amaro, sale e umami della coppia.'],intensita:['Pareggia la forza','Il terzo ha un\'intensità vicina a entrambi, così nessuno copre gli altri.'],debole:['Rinforza la coppia','Il terzo lega bene con tutti e due e fa da ponte.']};
export const STRUCT={'Ponte aromatico':'Il terzo fa da ponte','Armonia':'Tutti e tre si somigliano','Contrasto':'Tutti e tre si bilanciano','Triangolo':'Base, complemento e accento'};
const LV={testa:'le note fresche',cuore:'le note centrali',fondo:'le note profonde'};
// gergo del metodo → parole semplici; i punteggi /30 diventano il verdetto
const n30=x=>parseFloat(String(x).replace(',','.'));
export const plain=s=>String(s)
  .replace(/\b(il|Il) (testa|cuore|fondo)\b/g,(m,a,l)=>(a==='Il'?cap(LV[l]):LV[l])).replace(/\bdel (testa|cuore|fondo)\b/g,(m,l)=>'del'+LV[l].slice(2))
  .replace(/concordanza,\s*(\d+(?:[.,]\d+)?)\/30/g,(m,x)=>`si somigliano (${vOf(n30(x)).w.toLowerCase()})`)
  .replace(/contrasto,\s*(\d+(?:[.,]\d+)?)\/30/g,(m,x)=>`si bilanciano (${vOf(n30(x)).w.toLowerCase()})`)
  .replace(/\(?(\d+(?:[.,]\d+)?)\/30\)?/g,(m,x)=>m.startsWith('(')?`(${vOf(n30(x)).w.toLowerCase()})`:vOf(n30(x)).w.toLowerCase());
export const firstSentence=t=>(String(t).match(/^.*?[.!?](\s|$)/)||[t])[0].trim();

// pallino del gusto per gli alimenti, rombo per gli alcolici
export const mark=I=>I.isSpirit?`<i class="mk sp" aria-hidden="true"></i>`:`<i class="mk" style="background:${tcol(I.dom)}" aria-hidden="true"></i>`;
export const kindOf=I=>I.isSpirit?SGROUP[I.grp][0]:CATS[I.cat][0];
export const shortKind=I=>I.isSpirit?SGROUP[I.grp][0]:CATS[I.cat][1];

// ---------- geometria SVG ----------
export function pol(r,a){const t=a*Math.PI/180;return [+(r*Math.cos(t)).toFixed(2),+(r*Math.sin(t)).toFixed(2)];}
export function arcPath(r0,r1,a0,a1){if(a1-a0>=359.9)a1=a0+359.9;const L=(a1-a0)>180?1:0;const [x0,y0]=pol(r1,a0),[x1,y1]=pol(r1,a1),[x2,y2]=pol(r0,a1),[x3,y3]=pol(r0,a0);
  return `M${x0},${y0}A${r1},${r1} 0 ${L} 1 ${x1},${y1}L${x2},${y2}A${r0},${r0} 0 ${L} 0 ${x3},${y3}Z`;}
export const trunc=(s,n)=>s.length>n?s.slice(0,n-1)+'…':s;
export function spread(nodes,gap){
  nodes.sort((x,y)=>x.a-y.a);const n=nodes.length;if(n<2)return;if(n*gap>360)gap=360/n;
  for(let it=0;it<300;it++){let moved=false;
    for(let i=0;i<n;i++){const p=nodes[i],q=nodes[(i+1)%n];let d=q.a-p.a;if(i===n-1)d+=360;
      if(d<gap-0.01){const push=(gap-d)/2;p.a-=push;q.a+=push;moved=true;}}
    if(!moved)break;}
}
export function labelAt(r,a,text,cls,extra=''){
  const left=Math.cos(a*Math.PI/180)<-0.0001;
  return left?`<text class="${cls}" transform="rotate(${(a+180).toFixed(2)})" x="${-r}" y="4" text-anchor="end"${extra}>${text}</text>`
             :`<text class="${cls}" transform="rotate(${a.toFixed(2)})" x="${r}" y="4"${extra}>${text}</text>`;
}
export function wrapName(name,max,two){if(name.length<=max)return[name];if(!two)return[trunc(name,max)];
  const w=name.split(' ');let a='';while(w.length&&(a?a+' '+w[0]:w[0]).length<=max)a=a?a+' '+w.shift():w.shift();
  if(!a)return[trunc(name,max)];const b=w.join(' ');return [a,trunc(b,max)];}
export function labelLines(r,a,lines,cls,fs,extra=''){if(lines.length<2)return labelAt(r,a,esc(lines[0]),cls,extra);
  const left=Math.cos(a*Math.PI/180)<-0.0001;const x=left?-r:r;const y0=(-fs*0.15).toFixed(1),y1=(fs*0.95).toFixed(1);
  return `<text class="${cls}" transform="rotate(${(left?a+180:a).toFixed(2)})"${left?' text-anchor="end"':''}${extra}><tspan x="${x}" y="${y0}">${esc(lines[0])}</tspan><tspan x="${x}" y="${y1}">${esc(lines[1])}</tspan></text>`;}

// ---------- radar ----------
export function radar(labels,series,R,pad){
  const n=labels.length,V=R+pad;let h=`<svg viewBox="${-V} ${-R-22} ${2*V} ${2*R+44}" role="img" aria-hidden="true">`;
  for(let l=1;l<=5;l++){h+=`<polygon points="${labels.map((_,i)=>pol(R*l/5,-90+i*360/n).join(',')).join(' ')}" class="rg${l===5?' out':''}"/>`;}
  labels.forEach((lb,i)=>{const a=-90+i*360/n;const [x,y]=pol(R,a);h+=`<line x1="0" y1="0" x2="${x}" y2="${y}" class="rg"/>`;
    const [tx,ty]=pol(R+10,a);const c=Math.cos(a*Math.PI/180);const anc=Math.abs(c)<0.2?'middle':c>0?'start':'end';
    h+=`<text x="${tx}" y="${(ty+(Math.sin(a*Math.PI/180)>0.5?9:Math.sin(a*Math.PI/180)<-0.5?-2:4)).toFixed(1)}" text-anchor="${anc}" ${lb.c?`style="fill:${lb.c};font-weight:600"`:''}>${esc(lb.t)}</text>`;});
  series.forEach(s=>{const pts=s.v.map((v,i)=>pol(R*Math.max(v,0.15)/5,-90+i*360/n).join(',')).join(' ');
    h+=`<polygon points="${pts}" style="fill:${s.c};fill-opacity:${s.fo};stroke:${s.c};stroke-width:2;stroke-linejoin:round;${s.dash?'stroke-dasharray:'+s.dash:''}"/>`;});
  return h+'</svg>';
}

// ---------- bicchieri (tratto sottile; --c è il colore del drink al passaggio del mouse) ----------
const ROCKS='M11.5 13 L13 40.5 Q13.2 42 15 42 L33 42 Q34.8 42 35 40.5 L36.5 13',ROCKS_BASE='M13.1 38.5 L34.9 38.5',ROCKS_LIQ='M12.4 24 L35.6 24 L35 38.5 L13 38.5 Z',CUBE='M18 20 L28 18.5 L29.5 28.5 L19.5 30 Z';
const COUPE_BOWL='M7 14 L41 14 Q40.5 27 24 27 Q7.5 27 7 14 Z',COUPE_STEM='M24 27 L24 41 M17 41.5 L31 41.5';
const STEM_FOOT=(y0,y1)=>`M24 ${y0} L24 ${y1} M17.5 ${y1+0.5} L30.5 ${y1+0.5}`;
export const GLASSES={
  oldfashioned:{s:[ROCKS,ROCKS_BASE],lq:[[ROCKS_LIQ,'#C98A2E']],ac:[[CUBE,'#DCEBF0','f'],['M30 9.5 Q34 8 37.5 11.5 Q35.5 13 33 12.2','#E58A2E','f']]},
  martini:{s:['M7 11 L41 11 L24 28 Z',STEM_FOOT(28,41)],lq:[['M10.5 14 L37.5 14 L24 27 Z','#DCE4D6']],ac:[['M29 4 L21.5 19','#8B5A2B','l'],['M21.6 18.6 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0','#6F8A2A','f']]},
  negroni:{s:[ROCKS,ROCKS_BASE],lq:[[ROCKS_LIQ,'#B23A2A']],ac:[[CUBE,'#E7C9C2','f'],['M28 13 A6 6 0 0 1 40 13 Z','#E8892E','f']]},
  sour:{s:[COUPE_BOWL,COUPE_STEM],lq:[['M9.3 17 L38.7 17 Q37 25.5 24 25.5 Q11 25.5 9.3 17 Z','#E3CF74']],ac:[['M33 14 m-4 0 a4 4 0 0 1 8 0 Z','#9DBA4A','f']]},
  sour_albume:{s:[COUPE_BOWL,COUPE_STEM],lq:[['M9.3 19 L38.7 19 Q37 25.5 24 25.5 Q11 25.5 9.3 19 Z','#E3CF74'],['M7.6 15.5 L40.4 15.5 L39.4 19 L8.6 19 Z','#F3ECDD']],ac:[['M18 17.2 m-0.9 0 a0.9 0.9 0 1 0 1.8 0 a0.9 0.9 0 1 0 -1.8 0 M24 17.2 m-0.9 0 a0.9 0.9 0 1 0 1.8 0 a0.9 0.9 0 1 0 -1.8 0 M30 17.2 m-0.9 0 a0.9 0.9 0 1 0 1.8 0 a0.9 0.9 0 1 0 -1.8 0','#9E2B2B','f']]},
  collins:{s:['M15.5 5 L16.5 42 L31.5 42 L32.5 5','M16.4 39 L31.6 39'],lq:[['M15.8 12 L32.2 12 L31.6 39 L16.4 39 Z','#E9DE9A']],ac:[['M29.5 1.5 L25.5 37','#C9737D','l'],['M19 20 h6 v6 h-6 Z M21 29 h6 v6 h-6 Z','#E4F0F3','f']]},
  highball:{s:['M12.5 9 L13.5 42 L34.5 42 L35.5 9','M13.4 39 L34.6 39'],lq:[['M12.8 15 L35.2 15 L34.6 39 L13.4 39 Z','#D6E7EA']],ac:[['M29 9 Q33 4 38 7.5 L33 12 Z','#9DBA4A','f'],['M19 22 h7 v7 h-7 Z M23 30 h7 v7 h-7 Z','#F2F7F8','f']]},
  julep:{s:['M12 15 L14.5 41.5 L33.5 41.5 L36 15 Z','M12 15 L36 15'],lq:[['M12.6 21 L35.4 21 L33.6 40 L14.4 40 Z','#C3CBCE']],ac:[['M12 15 Q24 4 36 15 Z','#EEF4F6','f'],['M22 9 Q18 3 23 1.5 Q25 6 22 9 Z M25 9.5 Q29 4 32 7 Q29.5 10 25 9.5 Z','#4E9A5B','f']]},
  flip:{s:['M14 11 Q13.5 26 24 27.5 Q34.5 26 34 11 Z',STEM_FOOT(27.5,41)],lq:[['M14.1 15 L33.9 15 Q33.4 25 24 26 Q14.6 25 14.1 15 Z','#E2CFA6']],ac:[['M19 13 m-0.8 0 a0.8 0.8 0 1 0 1.6 0 a0.8 0.8 0 1 0 -1.6 0 M24 12.4 m-0.8 0 a0.8 0.8 0 1 0 1.6 0 a0.8 0.8 0 1 0 -1.6 0 M28.5 13.2 m-0.8 0 a0.8 0.8 0 1 0 1.6 0 a0.8 0.8 0 1 0 -1.6 0','#8B5A2B','f']]},
  spritz:{s:['M13 6 Q10.5 25 24 28 Q37.5 25 35 6 Z',STEM_FOOT(28,42)],lq:[['M11.9 15 L36.1 15 Q36 24.5 24 26.8 Q12 24.5 11.9 15 Z','#E36A2E']],ac:[['M20 20 m-4.5 0 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0','#F4B04A','f']]},
  royale:{s:['M19 3 L18.6 25 Q19 30.5 24 30.5 Q29 30.5 29.4 25 L29 3',STEM_FOOT(30.5,42)],lq:[['M18.8 9 L29.2 9 L29.3 25 Q29 29.5 24 29.5 Q19 29.5 18.7 25 Z','#E3C15E']],ac:[['M22 14 m-0.7 0 a0.7 0.7 0 1 0 1.4 0 a0.7 0.7 0 1 0 -1.4 0 M25.5 19 m-0.7 0 a0.7 0.7 0 1 0 1.4 0 a0.7 0.7 0 1 0 -1.4 0 M22.5 24 m-0.7 0 a0.7 0.7 0 1 0 1.4 0 a0.7 0.7 0 1 0 -1.4 0','#FFF8E0','f']]},
  tiki:{s:['M14 10 L14 40 Q14 42 16 42 L32 42 Q34 42 34 40 L34 10','M18.5 19 L22 19 M26 19 L29.5 19 M24 21 L24 26 M19 31 Q24 35 29 31'],lq:[['M14.6 12 L33.4 12 L33.4 40 Q33.4 41.4 32 41.4 L16 41.4 Q14.6 41.4 14.6 40 Z','#A9683A']],ac:[['M20 8 L31 3 L29 9 Z','#C9737D','f'],['M26.5 6 L28 13','#8B5A2B','l']]},
  milkpunch:{s:[ROCKS,ROCKS_BASE],lq:[[ROCKS_LIQ,'#EFE3B8']],ac:[[CUBE,'#F7FAFB','f'],['M30.5 9 Q35 9.5 37 13.5','#E9C93A','l']]},
};
export function glassSVG(id,size,label,on){
  const g=GLASSES[id];if(!g)return'';
  const lq=g.lq.map(([d,c])=>`<path class="lq" d="${d}" style="--c:${c}"/>`).join('');
  const ac=g.ac.map(([d,c,k])=>`<path class="ac ${k==='l'?'acl':'acf'}" d="${d}" style="--c:${c}"/>`).join('');
  const s=g.s.map(d=>`<path class="s" d="${d}"/>`).join('');
  return `<svg class="gl${on?' on':''}" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="${esc(label||'')}">${lq}${ac}${s}</svg>`;
}

// ---------- campo di ricerca con menù ----------
// suggest(): a campo vuoto, gli elementi da proporre per primi; poi tutti dalla A alla Z
export function makeCombo(host,{id,placeholder,source,onPick,keep,onClear,suggest,label}){
  host.innerHTML=`<input type="search" id="${id}" role="combobox" aria-expanded="false" aria-autocomplete="list" autocomplete="off" placeholder="${esc(placeholder)}"${label?` aria-label="${esc(label)}"`:''}><div class="list" role="listbox" hidden></div>`;
  const inp=host.querySelector('input'),list=host.querySelector('.list');let opts=[],act=0,cur=null,quiet=false;
  const optH=(it,i)=>`<div class="opt" role="option" data-i="${i}" aria-selected="${i===act}">${mark(it)}<span>${esc(it.name)}</span><small>${esc(it.isSpirit?SGROUP[it.grp][0]:CATS[it.cat][1]+' · '+TLABEL[it.dom].toLowerCase())}</small></div>`;
  function show(){const q=norm(inp.value.trim());const src=source();
    const sug=!q&&suggest?(suggest()||{items:[]}):{items:[]};const top=sug.items.filter(it=>src.includes(it)).slice(0,8);
    const rest=src.filter(it=>!top.includes(it)&&(!q||norm(it.name).includes(q))).sort((a,b)=>{const sa=norm(a.name).startsWith(q)?0:1,sb=norm(b.name).startsWith(q)?0:1;return sa-sb||a.name.localeCompare(b.name,'it');}).slice(0,top.length?200:60);
    opts=top.concat(rest);
    list.innerHTML=top.length?`<div class="lgrp" role="presentation">${esc(sug.label)}</div>${top.map(optH).join('')}<div class="lgrp" role="presentation">Tutti, dalla A alla Z</div>${rest.map((it,i)=>optH(it,i+top.length)).join('')}`:(opts.length?opts.map(optH).join(''):'');
    if(!opts.length&&q){list.innerHTML=`<div class="lgrp none" role="presentation">Nessun risultato per «${esc(inp.value.trim())}»</div>`;}
    list.scrollTop=0;list.hidden=!opts.length&&!q;inp.setAttribute('aria-expanded',String(!list.hidden));}
  const close=()=>{list.hidden=true;inp.setAttribute('aria-expanded','false');};
  function pick(it){if(!it)return;cur=keep?it:null;close();inp.value=keep?it.name:'';if(!keep)inp.blur();onPick(it);}
  inp.addEventListener('input',()=>{act=0;if(keep&&onClear&&cur&&!inp.value.trim()){cur=null;onClear();}show();});
  inp.addEventListener('focus',()=>{if(keep)inp.select();act=0;if(quiet){quiet=false;return;}show();});
  inp.addEventListener('click',()=>{if(list.hidden){act=0;show();}});
  inp.addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement===inp)return;close();if(keep)inp.value=cur?cur.name:'';},160));
  inp.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)show();act=Math.max(0,Math.min(opts.length-1,act+(e.key==='ArrowDown'?1:-1)));
      const os=list.querySelectorAll('.opt');os.forEach((o,i)=>o.setAttribute('aria-selected',String(i===act)));os[act]?.scrollIntoView({block:'nearest'});}
    else if(e.key==='Enter'){e.preventDefault();pick(opts[act]);}
    else if(e.key==='Escape'){close();}
  });
  list.addEventListener('pointerdown',e=>{const o=e.target.closest('.opt');if(o){e.preventDefault();pick(opts[+o.dataset.i]);}});
  return {input:inp,set(it){cur=keep?(it||null):null;inp.value=it?it.name:'';},
    focusQuiet(){quiet=true;inp.focus();quiet=false;}};
}

// ---------- copia e avvisi ----------
export function toast(msg){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),2200);}
export async function copyText(text,ok='Copiato'){
  try{await navigator.clipboard.writeText(text);toast(ok);}
  catch(e){const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
    let done=false;try{done=document.execCommand('copy');}catch(_){}ta.remove();toast(done?ok:'Copia non riuscita: seleziona il testo a mano');}
}
