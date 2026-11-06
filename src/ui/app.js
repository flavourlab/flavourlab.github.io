// Interfaccia: ruota, Pairing Studio e Cocktail creator.
// ===== ICONE DEI BICCHIERI (tratto sottile) =====
// s = tratto del bicchiere, lq = liquido, ac = garnish/dettagli. --c è il colore mostrato al passaggio del mouse.
import { ALLERG, BYID, BYNAME, CATS, FAM, FOODS, ORIG, SGROUP, SPIRITS, TLABEL, TORDER, TYPELBL, norm } from '../domain/core.js';
import { S, howTo, listIt, monthsTxt, partnersOf, score, spiritsOf, trioSpirits, verdict } from '../domain/scoring.js';
import { TLENS, fmtN, lensReason, roles, spiritsForTrio, suggestThird, trio } from '../domain/trio.js';
import { ABV, BASES, BGROUPS, STY, abvOf, buildRecipe, coherence, fmt, styleFit, suggestBases } from '../domain/recipes.js';
const ROCKS='M11.5 13 L13 40.5 Q13.2 42 15 42 L33 42 Q34.8 42 35 40.5 L36.5 13';
const ROCKS_BASE='M13.1 38.5 L34.9 38.5';
const ROCKS_LIQ='M12.4 24 L35.6 24 L35 38.5 L13 38.5 Z';
const CUBE='M18 20 L28 18.5 L29.5 28.5 L19.5 30 Z';
const COUPE_BOWL='M7 14 L41 14 Q40.5 27 24 27 Q7.5 27 7 14 Z';
const COUPE_STEM='M24 27 L24 41 M17 41.5 L31 41.5';
const STEM_FOOT=(y0,y1)=>`M24 ${y0} L24 ${y1} M17.5 ${y1+0.5} L30.5 ${y1+0.5}`;
const GLASSES={
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
function glassSVG(id,size,label,on){
  const g=GLASSES[id];if(!g)return'';
  const lq=g.lq.map(([d,c])=>`<path class="lq" d="${d}" style="--c:${c}"/>`).join('');
  const ac=g.ac.map(([d,c,k])=>`<path class="ac ${k==='l'?'acl':'acf'}" d="${d}" style="--c:${c}"/>`).join('');
  const s=g.s.map(d=>`<path class="s" d="${d}"/>`).join('');
  return `<svg class="gl${on?' on':''}" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="${esc(label||'')}">${lq}${ac}${s}</svg>`;
}

let mainCombo=null;
// ===== INTERFACCIA =====
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATORD={};Object.keys(CATS).forEach((k,i)=>CATORD[k]=i);
const tcol=k=>`var(--t-${k})`;
const typeCol=t=>t==='contrasto'?'var(--contrast)':'var(--concord)';
function pol(r,a){const t=a*Math.PI/180;return [+(r*Math.cos(t)).toFixed(2),+(r*Math.sin(t)).toFixed(2)];}
function arcPath(r0,r1,a0,a1){if(a1-a0>=359.9)a1=a0+359.9;const L=(a1-a0)>180?1:0;const [x0,y0]=pol(r1,a0),[x1,y1]=pol(r1,a1),[x2,y2]=pol(r0,a1),[x3,y3]=pol(r0,a0);
  return `M${x0},${y0}A${r1},${r1} 0 ${L} 1 ${x1},${y1}L${x2},${y2}A${r0},${r0} 0 ${L} 0 ${x3},${y3}Z`;}
function trunc(s,n){return s.length>n?s.slice(0,n-1)+'…':s;}
function spread(nodes,gap){
  nodes.sort((x,y)=>x.a-y.a);const n=nodes.length;if(n<2)return;if(n*gap>360)gap=360/n;
  for(let it=0;it<300;it++){let moved=false;
    for(let i=0;i<n;i++){const p=nodes[i],q=nodes[(i+1)%n];let d=q.a-p.a;if(i===n-1)d+=360;
      if(d<gap-0.01){const push=(gap-d)/2;p.a-=push;q.a+=push;moved=true;}}
    if(!moved)break;}
}
function labelAt(r,a,text,cls,extra=''){
  const left=Math.cos(a*Math.PI/180)<-0.0001;
  return left?`<text class="${cls}" transform="rotate(${(a+180).toFixed(2)})" x="${-r}" y="4" text-anchor="end"${extra}>${text}</text>`
             :`<text class="${cls}" transform="rotate(${a.toFixed(2)})" x="${r}" y="4"${extra}>${text}</text>`;
}
const halo='paint-order:stroke;stroke:var(--surface);stroke-width:3.5px;stroke-linejoin:round';
function topFams(I,n=3){return I.ar.map((v,i)=>[v,i]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,n).map(x=>FAM[x[1]][1].toLowerCase());}
function dotsInt(n){return '●'.repeat(n)+'○'.repeat(5-n);}
function catOf(I){return I.isSpirit?SGROUP[I.grp][0]:CATS[I.cat][0];}

const state={sel:null,mode:'browse',zoom:null,filter:'all',A:null,B:null,parts:[],sps:[],trio:{}};

// ---------- combobox ----------
function makeCombo(host,{id,placeholder,source,onPick,keep}){
  host.innerHTML=`<input type="search" id="${id}" role="combobox" aria-expanded="false" aria-autocomplete="list" autocomplete="off" placeholder="${esc(placeholder)}"><div class="list" role="listbox" hidden></div>`;
  const inp=host.querySelector('input'),list=host.querySelector('.list');let opts=[],act=0;
  function show(){const q=norm(inp.value.trim());
    opts=source().filter(it=>!q||norm(it.name).includes(q)).sort((a,b)=>{const sa=norm(a.name).startsWith(q)?0:1,sb=norm(b.name).startsWith(q)?0:1;return sa-sb||a.name.localeCompare(b.name,'it');}).slice(0,60);
    list.innerHTML=opts.map((it,i)=>`<div class="opt" role="option" data-i="${i}" aria-selected="${i===act}"><span>${esc(it.name)}</span><small>${esc(it.isSpirit?SGROUP[it.grp][0]:CATS[it.cat][1]+' · '+TLABEL[it.dom])}</small></div>`).join('');
    list.hidden=!opts.length;inp.setAttribute('aria-expanded',String(!list.hidden));}
  function pick(it){if(!it)return;list.hidden=true;inp.setAttribute('aria-expanded','false');inp.value=keep?it.name:'';if(!keep)inp.blur();onPick(it);}
  inp.addEventListener('input',()=>{act=0;show();});
  inp.addEventListener('focus',()=>{if(keep)inp.select();act=0;show();});
  inp.addEventListener('blur',()=>setTimeout(()=>{list.hidden=true;inp.setAttribute('aria-expanded','false');},160));
  inp.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)show();act=Math.max(0,Math.min(opts.length-1,act+(e.key==='ArrowDown'?1:-1)));
      list.querySelectorAll('.opt').forEach((o,i)=>o.setAttribute('aria-selected',String(i===act)));list.children[act]?.scrollIntoView({block:'nearest'});}
    else if(e.key==='Enter'){e.preventDefault();pick(opts[act]);}
    else if(e.key==='Escape'){list.hidden=true;}
  });
  list.addEventListener('pointerdown',e=>{const o=e.target.closest('.opt');if(o){e.preventDefault();pick(opts[+o.dataset.i]);}});
  return {set(it){inp.value=it?it.name:'';}};
}

// ---------- ruota: abbinamenti ----------
const R1a=72,R1b=128,RP=188,RS=388;
function renderEgo(){
  $('#wheel').setAttribute('viewBox','-540 -540 1080 1080');
  const A=state.sel,parts=state.parts,sps=state.sps;
  let h='';
  TORDER.forEach((k,i)=>{const a0=-90+i*72-36;h+=`<path d="${arcPath(R1b+4,RS-16,a0+0.6,a0+71.4)}" style="fill:${tcol(k)};opacity:.09"/>`;});
  h+=`<circle r="${RP}" style="fill:none;stroke:var(--line);stroke-dasharray:2 5"/><circle r="${RS}" style="fill:none;stroke:var(--line);stroke-dasharray:2 5"/>`;
  // anello 1: gusti
  TORDER.forEach((k,i)=>{const a0=-90+i*72-36;const v=A.t[k];
    h+=`<path d="${arcPath(R1a,R1b,a0+0.8,a0+71.2)}" style="fill:${tcol(k)};opacity:${(0.16+v*0.165).toFixed(2)}"/>`;
    const [x,y]=pol((R1a+R1b)/2,-90+i*72);
    h+=`<text x="${x}" y="${y-2}" text-anchor="middle" style="font-size:17px;font-weight:600;${halo}">${TLABEL[k]}</text><text x="${x}" y="${y+16}" text-anchor="middle" style="font-size:13.5px;font-family:var(--f-mono);${halo}">${v}/5</text>`;});
  // nodi abbinamento
  const groups={};parts.forEach(r=>(groups[r.B.dom]=groups[r.B.dom]||[]).push(r));
  const nodes=[];TORDER.forEach((k,i)=>{const g=groups[k]||[];g.forEach((r,j)=>nodes.push({r,a:-90+i*72-36+(j+0.5)*72/g.length}));});
  spread(nodes,7.2);
  const pos={};nodes.forEach(n=>pos[n.r.B.id]=n.a);
  // alcolici: angolo del partner con cui legano meglio
  const snodes=sps.map(rs=>{const best=state.trio[rs.B.id];const p=best?parts.find(x=>x.B===best):null;
    const a=p?pos[p.B.id]:-90+TORDER.indexOf(rs.B.dom)*72;return {rs,a,p};});
  spread(snodes,7);
  // collegamenti partner → alcolico
  let links='';snodes.forEach(s=>{if(!s.p)return;const ap=pos[s.p.B.id],as=s.a;const d=((as-ap+540)%360)-180;const mid=ap+d/2;
    const [x0,y0]=pol(RP+6,ap),[cx,cy]=pol((RP+RS)/2+30,mid),[x1,y1]=pol(RS-8,as);
    links+=`<path class="lk anim" data-p="${s.p.B.id}" data-s="${s.rs.B.id}" d="M${x0},${y0}Q${cx},${cy} ${x1},${y1}" style="fill:none;stroke:var(--spirit);stroke-width:1.3;opacity:.28"/>`;});
  h+=links;
  // raggi centro → partner
  nodes.forEach(n=>{const r=n.r;const [x0,y0]=pol(R1b+2,n.a),[x1,y1]=pol(RP-8,n.a);
    h+=`<line class="ray anim" data-p="${r.B.id}" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" style="stroke:${typeCol(r.type)};stroke-width:${(1.2+(r.total-14)/4).toFixed(1)};${r.type==='contrasto'?'stroke-dasharray:5 4;':''}opacity:.7"/>`;});
  // nodi partner
  nodes.forEach(n=>{const r=n.r;const [x,y]=pol(RP,n.a);const rad=(4+(r.total-14)/3).toFixed(1);
    h+=`<g class="node anim" data-id="${r.B.id}" data-kind="p" tabindex="0" role="button" aria-label="${esc(r.B.name)}, ${TYPELBL[r.type]}, ${r.total} su 30">
      <circle cx="${x}" cy="${y}" r="${+rad+3.5}" style="fill:var(--surface);stroke:${typeCol(r.type)};stroke-width:2;${r.type==='contrasto'?'stroke-dasharray:3 2':''}"/>
      <circle cx="${x}" cy="${y}" r="${rad}" style="fill:${tcol(r.B.dom)}"/>
      ${labelAt(RP+14,n.a,`${esc(trunc(r.B.name,16))}<tspan style="font-family:var(--f-mono);font-size:12.5px;fill:var(--muted)"> ${r.total}</tspan>`,'lbl')}</g>`;});
  // nodi alcolici
  snodes.forEach(s=>{const [x,y]=pol(RS,s.a);const B=s.rs.B;
    h+=`<g class="node anim" data-id="${B.id}" data-kind="s" tabindex="0" role="button" aria-label="${esc(B.name)}, ${s.rs.total} su 30">
      <rect x="${x-6}" y="${y-6}" width="12" height="12" transform="rotate(45 ${x} ${y})" style="fill:var(--spirit);stroke:var(--surface);stroke-width:2"/>
      ${labelAt(RS+14,s.a,esc(trunc(B.name,16)),'slbl')}</g>`;});
  // centro
  h+=`<circle r="64" style="fill:var(--surface);stroke:${tcol(A.dom)};stroke-width:2.5"/>`;
  const words=A.name.split(' ');const lines=[];words.forEach(w=>{if(lines.length&&(lines[lines.length-1]+' '+w).length<=12)lines[lines.length-1]+=' '+w;else lines.push(w);});
  const fs=lines.some(l=>l.length>10)?20:24;
  lines.slice(0,3).forEach((l,i)=>{h+=`<text text-anchor="middle" y="${(i-(Math.min(lines.length,3)-1)/2)*fs+4}" style="font-family:var(--f-display);font-size:${fs}px">${esc(l)}</text>`;});
  h+=`<text text-anchor="middle" y="${(Math.min(lines.length,3)/2)*fs+12}" style="font-size:10px;fill:var(--muted);font-family:var(--f-mono);letter-spacing:.06em">${TLABEL[A.dom].toUpperCase()}</text>`;
  $('#wheel').innerHTML=h;
  $('#wheelCap').textContent=`${TLABEL[A.dom]} › ${A.name} › ${parts.length} abbinamenti › ${sps.length} alcolici`;
  $('#wheelHint').textContent='Passa sopra un nodo per il motivo, clicca per aprirlo.';
  $('#legend').innerHTML=TORDER.map(k=>`<span><i style="width:10px;height:10px;border-radius:50%;background:${tcol(k)};display:inline-block"></i>${TLABEL[k]}</span>`).join('')+
    `<span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" style="stroke:var(--concord);stroke-width:2.5"/></svg>Concordanza</span>`+
    `<span><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" style="stroke:var(--contrast);stroke-width:2.5;stroke-dasharray:5 4"/></svg>Contrasto</span>`+
    `<span><svg width="12" height="12"><rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" style="fill:var(--spirit)"/></svg>Alcolico</span>`;
}

// ---------- ruota: esplora ----------
function runs(list,key){const out=[];list.forEach((it,i)=>{const k=key(it);const last=out[out.length-1];if(last&&last.k===k)last.e=i+1;else out.push({k,s:i,e:i+1,it});});return out;}
function renderBrowse(){
  const z=state.zoom;
  const list=FOODS.filter(f=>!z||f.dom===z).slice().sort((a,b)=>TORDER.indexOf(a.dom)-TORDER.indexOf(b.dom)||CATORD[a.cat]-CATORD[b.cat]||a.name.localeCompare(b.name,'it'));
  const N=list.length,step=360/N,ang=i=>-90+i*step;let h='';
  runs(list,f=>f.dom).forEach(rn=>{const a0=ang(rn.s),a1=ang(rn.e);
    h+=`<path class="node" data-t="${rn.k}" d="${arcPath(72,140,a0+0.4,a1-0.4)}" style="fill:${tcol(rn.k)};opacity:.85"><title>${TLABEL[rn.k]}</title></path>`;
    const span=a1-a0;if(span>14){const [x,y]=pol(106,(a0+a1)/2);h+=`<text x="${x}" y="${y+5}" text-anchor="middle" style="pointer-events:none;font-size:17px;font-weight:700;${halo}">${TLABEL[rn.k]}</text>`;}});
  let par=0;runs(list,f=>f.dom+'|'+f.cat).forEach(rn=>{const a0=ang(rn.s),a1=ang(rn.e);par++;const it=rn.it;
    h+=`<path class="node" data-t="${it.dom}" data-cat="${it.cat}" d="${arcPath(144,236,a0+0.25,a1-0.25)}" style="fill:${tcol(it.dom)};opacity:${par%2?.32:.5}"><title>${esc(CATS[it.cat][0])}</title></path>`;
    const span=a1-a0;if(span>=6.5)h+=`<g style="pointer-events:none">${labelAt(150,(a0+a1)/2,esc(trunc(CATS[it.cat][1],14)),'',` style="font-size:14px;${halo}"`)}</g>`;});
  const showL=step>=2.3,fs=Math.min(16.5,step*4.2).toFixed(1);
  $('#wheel').setAttribute('viewBox',showL?'-460 -460 920 920':'-300 -300 600 600');
  list.forEach((f,i)=>{const a0=ang(i),a1=ang(i+1),am=(a0+a1)/2;const on=f===state.sel;
    h+=`<g class="node" data-id="${f.id}" data-kind="b" tabindex="0" role="button" aria-label="${esc(f.name)}"><path d="${arcPath(240,280,a0+0.12,a1-0.12)}" style="fill:${tcol(f.dom)};opacity:${CATORD[f.cat]%2?.62:.9};${on?'stroke:var(--ink);stroke-width:2':''}"/>`+
      (showL?labelAt(288,am,esc(trunc(f.name,24)),'',` style="font-size:${fs}px;${on?'font-weight:700':''}"`):'')+`</g>`;});
  h+=`<circle r="64" class="node" data-t="${z?'__all':''}" style="fill:var(--surface);stroke:var(--line);stroke-width:1.5"/>`;
  if(z){h+=`<text text-anchor="middle" y="-4" style="pointer-events:none;font-family:var(--f-display);font-size:22px">${TLABEL[z]}</text><text text-anchor="middle" y="16" style="pointer-events:none;font-size:11px;fill:var(--muted)">${N} alimenti</text><text text-anchor="middle" y="34" style="pointer-events:none;font-size:11px;fill:var(--concord);font-weight:600">← tutti i gusti</text>`;}
  else h+=`<text text-anchor="middle" y="-2" style="pointer-events:none;font-family:var(--f-display);font-size:24px">${N}</text><text text-anchor="middle" y="16" style="pointer-events:none;font-size:11px;fill:var(--muted)">alimenti</text>`;
  $('#wheel').innerHTML=h;
  $('#wheelCap').textContent=z?`Gusto ${TLABEL[z]} › categorie › alimenti`:'Gusti › categorie › alimenti';
  $('#wheelHint').textContent=z?'Clicca un alimento per vederne gli abbinamenti.':'Clicca un gusto per ingrandirlo, o un alimento per aprirlo.';
  $('#legend').innerHTML=TORDER.map(k=>{const n=FOODS.filter(f=>f.dom===k).length;return `<span><i style="width:10px;height:10px;border-radius:50%;background:${tcol(k)};display:inline-block"></i>${TLABEL[k]} · ${n}</span>`;}).join('')+`<span>Anello interno: gusto dominante · medio: categoria · esterno: alimento</span>`;
}
function renderWheel(){if(!state.sel)state.mode='browse';state.mode==='ego'?renderEgo():renderBrowse();$('#mEgo').disabled=!state.sel;$('#mEgo').setAttribute('aria-pressed',String(state.mode==='ego'));$('#mBrowse').setAttribute('aria-pressed',String(state.mode==='browse'));}

// ---------- radar ----------
function radar(labels,series,R,pad){
  const n=labels.length,V=R+pad;let h=`<svg viewBox="${-V} ${-R-22} ${2*V} ${2*R+44}" role="img">`;
  for(let l=1;l<=5;l++){h+=`<polygon points="${labels.map((_,i)=>pol(R*l/5,-90+i*360/n).join(',')).join(' ')}" style="fill:none;stroke:var(--line);stroke-width:${l===5?1.2:.7}"/>`;}
  labels.forEach((lb,i)=>{const a=-90+i*360/n;const [x,y]=pol(R,a);h+=`<line x1="0" y1="0" x2="${x}" y2="${y}" style="stroke:var(--line);stroke-width:.7"/>`;
    const [tx,ty]=pol(R+10,a);const c=Math.cos(a*Math.PI/180);const anc=Math.abs(c)<0.2?'middle':c>0?'start':'end';
    h+=`<text x="${tx}" y="${(ty+(Math.sin(a*Math.PI/180)>0.5?9:Math.sin(a*Math.PI/180)<-0.5?-2:4)).toFixed(1)}" text-anchor="${anc}" ${lb.c?`style="fill:${lb.c};font-weight:600"`:''}>${esc(lb.t)}</text>`;});
  series.forEach(s=>{const pts=s.v.map((v,i)=>pol(R*Math.max(v,0.15)/5,-90+i*360/n).join(',')).join(' ');
    h+=`<polygon points="${pts}" style="fill:${s.c};fill-opacity:${s.fo};stroke:${s.c};stroke-width:2;${s.dash?'stroke-dasharray:'+(s.dash===1?'4 3':s.dash):''}"/>`;});
  return h+'</svg>';
}
function renderRadars(A,B){
  const tl=TORDER.map(k=>({t:TLABEL[k],c:tcol(k)}));
  const ser1=[{v:TORDER.map(k=>A.t[k]),c:tcol(A.dom),fo:.22}],ser2=[{v:A.ar,c:'var(--ink)',fo:.12}];
  if(B){ser1.push({v:TORDER.map(k=>B.t[k]),c:B.isSpirit?'var(--spirit)':typeCol(S(A,B).type),fo:.08,dash:1});ser2.push({v:B.ar,c:B.isSpirit?'var(--spirit)':typeCol(S(A,B).type),fo:.08,dash:1});}
  return `<div class="radar"><span class="eyebrow">Gusti</span>${radar(tl,ser1,78,46)}</div><div class="radar"><span class="eyebrow">Famiglie aromatiche</span>${radar(FAM.map(f=>({t:f[2]})),ser2,96,72)}</div>`;
}

// ---------- scheda ----------
function renderProfile(){
  const A=state.sel;const sps=state.sps;
  if(!A){$('#profile').innerHTML=`<div class="p-head"><span class="eyebrow">Scheda alimento</span><h2>Nessun alimento selezionato</h2></div>
    <p class="muted">Cerca un alimento nella barra «Al centro della ruota», cliccane uno sulla ruota oppure premi «A caso».</p>
    <p class="muted">Qui compariranno i suoi gusti e aromi in un diagramma spider, la piramide testa–cuore–fondo, la struttura e gli alcolici con cui si abbina.</p>`;return;}
  const lv={testa:[],cuore:[],fondo:[]};A.ar.forEach((v,i)=>{if(v>=2)lv[FAM[i][3]].push(FAM[i][1].toLowerCase());});
  const st=[['grassezza',A.st.g],['piccantezza',A.st.p],['astringenza',A.st.t],['freschezza',A.st.f]].filter(x=>x[1]>0).map(x=>`${x[0]} ${x[1]}`).join(', ')||'nessuna sensazione rilevante';
  const top=A.ar.map((v,i)=>[v,i]).filter(x=>x[0]>=3).sort((a,b)=>b[0]-a[0]).slice(0,2).map(x=>FAM[x[1]][4]);
  const allerg=ALLERG[A.cat];
  const notes=[A.note,allerg&&!A.note.includes(allerg)?'allergene: '+allerg:''].filter(Boolean);
  const best=state.parts[0];
  $('#profile').innerHTML=`
  <div class="p-head">
    <span class="eyebrow">${esc(CATS[A.cat][0])}</span>
    <h2>${esc(A.name)}</h2>
    <div class="chips">
      <span class="chip"><i style="background:${tcol(A.dom)}"></i>${TLABEL[A.dom]}</span>
      <span class="chip">Intensità <span class="dots">${dotsInt(A.int)}</span></span>
      <span class="chip">${A.season?'Stagione '+monthsTxt(A.season):'Tutto l\'anno'}</span>
      ${A.o?`<span class="chip">${ORIG[A.o]}</span>`:''}
    </div>
    <p><b>Firma:</b> ${esc(topFams(A).join(' · ')||'neutro, solo gusto')}</p>
  </div>
  <dl class="kv">
    <dt>Testa</dt><dd>${lv.testa.join(', ')||'—'}</dd>
    <dt>Cuore</dt><dd>${lv.cuore.join(', ')||'—'}</dd>
    <dt>Fondo</dt><dd>${lv.fondo.join(', ')||'—'}</dd>
    <dt>Struttura</dt><dd>${st}</dd>
    ${top.length?`<dt>Composti</dt><dd class="muted">${esc(top.join('; '))}</dd>`:''}
    <dt>In miscelazione</dt><dd>${esc(CATS[A.cat][2])}</dd>
  </dl>
  <div class="radars" id="radars">${renderRadars(A,null)}</div>
  <p class="cmp" id="cmp">Passa su un abbinamento per sovrapporre il suo profilo${best?` (per esempio ${esc(best.B.name)})`:''}.</p>
  ${notes.length?`<p class="safety">${esc(notes.join(' · '))}</p>`:''}
  <div>
    <span class="eyebrow">Abbinamenti alcolici</span>
    <h3 style="margin:2px 0 6px">Da bere con ${esc(A.name)}</h3>
    <div class="sp-list">${sps.map(r=>spiritCard(A,r)).join('')}</div>
  </div>`;
}
function scoreBar(t,max=30){const [v]=verdict(t);const c=v==='forte'?'var(--ok)':v==='promettente'?'color-mix(in srgb,var(--ok) 55%,var(--warn))':v==='rischioso'?'var(--warn)':'var(--bad)';
  return `<span class="score"><span class="bar"><i style="width:${(t/max*100).toFixed(0)}%;background:${c}"></i></span>${t}/30</span>`;}
function badge(r){return `<span class="badge ${r.type}">${r.type==='contrasto'?'⇄':'≈'} ${TYPELBL[r.type]}</span>${r.mixed?`<span class="badge plus">+ ${r.type==='contrasto'?'concordanza':'contrasto'}</span>`:''}`;}
function spiritCard(A,r){const B=r.B;
  const trio=state.trio[B.id];
  return `<div class="sp" data-sid="${B.id}">
    <h4>${esc(B.name)} <small>· ${esc(B.ex?B.ex+' · ':'')}${esc(SGROUP[B.grp][0])}</small></h4>${scoreBar(r.total)}
    <p>${badge(r)} ${esc(r.summary)}</p>
    <p class="how"><b>Come:</b> ${esc(howTo(A,B))}${trio?` <b>Trio:</b> aggiungi ${esc(trio.name)}.`:''}</p></div>`;}

// ---------- abbinamenti alimentari ----------
function lensTable(r){return `<table class="lens"><tbody>${r.lens.map(l=>`<tr><td>${l.k}${info(l.k)}</td><td>${esc(l.why)}</td><td class="v">${l.v}/5</td></tr>`).join('')}</tbody></table>`;}
function testTxt(r){return r.type==='concordanza'?`Assaggia ${r.A.name} da solo, poi insieme a ${r.B.name}: se le note comuni si allungano senza confondersi, l'accordo regge.`
  :`Assaggia un boccone con entrambi: nessuno dei due deve prevalere. Se uno domina, riducilo e riprova.`;}
function renderPairs(){
  $('#pairs').hidden=!state.sel;if(!state.sel)return;
  const A=state.sel;$('#pairsTitle').textContent=`Con cosa si sposa ${A.name}`;
  const list=state.parts.filter(r=>state.filter==='all'||r.type===state.filter);
  document.querySelectorAll('#pairs .seg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.f===state.filter)));
  $('#pairGrid').innerHTML=list.length?list.map(r=>`<article class="card" data-pid="${r.B.id}">
    <div class="card-top"><div><h3>${esc(r.B.name)}</h3><span class="cat"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${tcol(r.B.dom)};margin-right:5px"></i>${esc(CATS[r.B.cat][0])}</span></div>${scoreBar(r.total)}</div>
    <div class="chips">${badge(r)}</div>
    <p class="sum">${esc(r.summary)}</p>
    <details><summary>Le sei lenti, dosi e test</summary>${lensTable(r)}<p class="tiny" style="margin-top:8px"><b>Rapporto:</b> ${esc(r.ratioTxt)}</p><p class="tiny"><b>Test rapido:</b> ${esc(testTxt(r))}</p></details>
    <div class="acts"><button class="link" data-open="${r.B.id}">Apri ${esc(r.B.name)} →</button><button class="link" data-check="${r.B.id}">Verifica la coppia</button></div>
  </article>`).join(''):`<p class="muted">Nessun abbinamento di questo tipo sopra la soglia.</p>`;
}

// ---------- verifica ----------
function renderPairOut(){
  const A=state.A,B=state.B;if(!A||!B||A===B)return;
  const r=S(A,B);const [v,vt]=verdict(r.total);const vc=v==='forte'?'var(--ok)':v==='promettente'?'var(--ok)':v==='rischioso'?'var(--warn)':'var(--bad)';
  const trio=B.isSpirit?[]:trioSpirits(A,B,3);
  $('#checkOut').innerHTML=`
    <div class="verdict"><span class="big">${r.total}<small>/30</small></span><div><div class="vtag" style="color:${vc}">${v}${info('score','punteggio')}</div><div class="chips" style="margin-top:4px">${badge(r)}${info('type','concordanza e contrasto')}</div></div></div>
    <div style="margin:10px 0 4px"><div class="scale"><i></i><i></i><i></i><i></i><b style="left:calc(${(r.total/30*100).toFixed(1)}% - 1.5px)"></b></div><div class="scale-l"><span>0</span><span>10</span><span>17</span><span>24</span><span>30</span></div></div>
    <p style="margin:8px 0"><b>${esc(A.name)} + ${esc(B.name)}.</b> ${esc(vt)} ${esc(r.summary)}</p>
    ${lensTable(r)}
    <p class="tiny" style="margin-top:10px"><b>Rapporto di partenza:</b> ${esc(r.ratioTxt)}</p>
    <p class="tiny"><b>Test rapido:</b> ${esc(testTxt(r))}</p>
    ${B.isSpirit?`<p class="tiny"><b>Come usarlo:</b> ${esc(howTo(A,B))}</p>`:''}
    ${r.total<24?`<p class="tiny" style="margin-top:12px">Coppia sotto 24: a sinistra trovi il terzo ingrediente che la completa.</p>`:''}
    ${trio.length?`<div style="margin-top:14px"><span class="eyebrow">Alcolici adatti a entrambi</span><div class="list-inline" style="margin-top:6px">${trio.map(x=>`<span class="chip">${esc(x.s.name)} <span class="muted" style="font-family:var(--f-mono)">${x.a} · ${x.b}</span></span>`).join('')}</div></div>`:''}`;
}

// ---------- metodo ----------
const INFO={
  'Ponte aromatico':'Quanto i due profili si sovrappongono sulle 18 famiglie aromatiche. Conta anche il ponte indiretto tra famiglie affini (agrumato ed erbe, tostato e ossidativo, lattico e tostato). È la lente della concordanza.',
  'Bilanciamento di gusto':'Le regole classiche: l\'acido taglia il grasso, il sale esalta il dolce e attenua l\'amaro, l\'amaro dà profondità al dolce, il grasso ammorbidisce piccante e tannino. Include la sinergia umami. Toglie punti quando due amari, due acidi o due piccanti forti si sommano.',
  'Intensità e peso':'Due ingredienti di forza simile dialogano alla pari. Se la distanza è grande, il più delicato va in dose maggiore o rischia di sparire.',
  'Copertura piramide':'Testa (agrumi, erbe, verde, frutta fresca), cuore (frutta matura, fiori, spezie pungenti, resine) e fondo (tostato, legno, vaniglia, lattico, carnoso). Una coppia che copre tutti e tre i livelli è più completa.',
  'Territorio e stagione':'Ciò che cresce insieme sta bene insieme: stessa stagione e stessa area d\'origine alzano il voto.',
  'Territorio':'Per gli alcolici conta solo l\'area d\'origine: stessa area, voto più alto.',
  'Tradizione':'Se l\'abbinamento esiste in cucina o al bancone vale 5: è una prova sul campo, non un vincolo. Senza tradizione nota il voto resta basso, ma decide il resto del punteggio.',
  'Ponte aromatico medio':'La media del ponte aromatico delle tre coppie del trio.',
  'Piramide':'Testa, cuore e fondo coperti dai tre ingredienti insieme. Mezzo punto in più se ognuno guida un livello diverso.',
  'Equilibrio di gusto':'I cinque gusti del trio: premia i contrasti che si compensano e le sinergie, penalizza le somme (tre acidi, due amari forti). Mezzo punto in più se il trio copre almeno tre gusti.',
  'Intensità':'Distanza tra l\'ingrediente più forte e il più delicato del trio: più è piccola, più i tre dialogano alla pari.',
  'Anello debole':'Un trio vale quanto la sua coppia peggiore. Se il terzo ingrediente lega bene con i due della coppia debole fa da ponte e alza il voto.',
  'Tradizione e territorio':'Media di stagione, area d\'origine e tradizione delle tre coppie.',
  score:'Somma di sei lenti da 0 a 5. 24–30 forte, da provare subito · 17–23 promettente, va calibrato in dose o con un terzo ingrediente · 10–16 rischioso, serve un ingrediente ponte · sotto 10 sconsigliato.',
  type:'Concordanza: i due condividono famiglie aromatiche o si rinforzano (sinergia umami). Contrasto: un gusto bilancia l\'altro (acido contro grasso, sale contro dolce). Vince il più forte; se anche l\'altro supera 3 il badge lo segnala con «+».',
  structure:'Armonia: tre coppie in concordanza. Contrasto: tre coppie in contrasto. Triangolo: base, complemento e accento, con coppie dei due tipi. Ponte aromatico: il terzo ingrediente unisce una coppia che da sola dialoga poco.',
  third:'Per la lente scelta provo ogni alimento come terzo ingrediente e ordino i risultati: a parità di voto della lente vince il punteggio del trio. Al massimo due proposte per categoria.',
  roles:'Base: il corpo del trio (il più strutturato, o l\'alcolico). Accento: il più intenso o pungente, in piccola dose. Complemento: quello che resta. Il rapporto è un punto di partenza da correggere all\'assaggio.',
  spirits:'Alcolici ordinati per il loro abbinamento peggiore con i tre ingredienti: così nessuno dei tre resta scoperto.',
};
function info(k,label){const t=INFO[k];if(!t)return'';return `<button type="button" class="info" data-info="${esc(k)}" aria-label="${esc('Spiegazione: '+(label||k))}">i</button>`;}
function renderMethod(){
  $('#lensCards').innerHTML=`
  <div class="mcol"><h4>Il profilo</h4><p>Ogni alimento ha i cinque gusti, la struttura (grassezza, piccantezza, astringenza, freschezza) e diciotto famiglie aromatiche, tutto da 0 a 5. Il gusto più alto decide il settore della ruota. Sono alimenti gli ingredienti singoli, anche trasformati (pop-corn, miso); i piatti restano fuori.</p></div>
  <div class="mcol"><h4>Concordanza e contrasto</h4><p><span class="mline"><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" style="stroke:var(--concord);stroke-width:2.5"/></svg><b>Concordanza</b></span> i due condividono note aromatiche o si rinforzano.</p><p><span class="mline"><svg width="26" height="8"><line x1="0" y1="4" x2="26" y2="4" style="stroke:var(--contrast);stroke-width:2.5;stroke-dasharray:5 4"/></svg><b>Contrasto</b></span> un gusto bilancia l'altro: acido contro grasso, sale contro dolce.</p></div>
  <div class="mcol"><h4>Il punteggio</h4><div class="scale"><i></i><i></i><i></i><i></i></div><div class="scale-l"><span>0</span><span>10</span><span>17</span><span>24</span><span>30</span></div><p>Sei lenti da 0 a 5. <b>24–30</b> forte, <b>17–23</b> promettente, <b>10–16</b> rischioso, sotto 10 sconsigliato. Passa sulle <span class="info static">i</span> per la spiegazione di ogni lente.</p></div>`;
}

// ---------- tooltip e interazioni ----------
let infoEl=null;
function tipHTML(el){if(el.dataset.info)return INFO[el.dataset.info]?esc(INFO[el.dataset.info]):'';
  const s=el.classList.contains('glass')&&STY[el.dataset.sty];if(!s)return'';
  const fit=styleFit(effBaseFor(el.dataset.sty),el.dataset.sty);
  return `<b>${esc(s.name)}</b> · ${esc(s.fam)}<br>${esc(s.desc)}<br><span style="opacity:.72">Classici: ${esc(s.ex)}.</span>${fit.ok?'':`<br><b>Non adatto:</b> ${esc(fit.why)}.`}`;}
function showInfo(el){const html=tipHTML(el);if(!html)return;infoEl=el;tip.innerHTML=html;tip.hidden=false;tip.classList.add('infotip');
  const r=el.getBoundingClientRect();const w=tip.offsetWidth,h=tip.offsetHeight;let x=r.left+r.width/2-w/2,y=r.bottom+8;
  if(y+h>innerHeight-8)y=r.top-h-8;x=Math.max(8,Math.min(innerWidth-w-8,x));tip.style.left=x+'px';tip.style.top=Math.max(8,y)+'px';}
function hideInfo(){if(!infoEl)return;infoEl=null;tip.hidden=true;tip.classList.remove('infotip');}
document.addEventListener('pointerover',e=>{const b=e.target.closest&&e.target.closest('.info[data-info],.glass[data-sty]');if(b)showInfo(b);});
document.addEventListener('pointerout',e=>{const b=e.target.closest&&e.target.closest('.info[data-info],.glass[data-sty]');if(b&&!b.contains(e.relatedTarget))hideInfo();});
document.addEventListener('focusin',e=>{const b=e.target.closest&&e.target.closest('.info[data-info],.glass[data-sty]');if(b)showInfo(b);});
document.addEventListener('focusout',e=>{if(e.target.closest&&e.target.closest('.info[data-info],.glass[data-sty]'))hideInfo();});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.info[data-info]');if(b){e.preventDefault();e.stopPropagation();infoEl===b?hideInfo():showInfo(b);}else hideInfo();},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideInfo();});
window.addEventListener('scroll',()=>{if(infoEl)showInfo(infoEl);},{passive:true});
const tip=$('#tip');
function showTip(html,e){tip.innerHTML=html;tip.hidden=false;moveTip(e);}
function moveTip(e){if(tip.hidden||!e||e.clientX==null)return;const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+14,y=e.clientY+14;if(x+w>innerWidth-8)x=e.clientX-w-14;if(y+h>innerHeight-8)y=e.clientY-h-14;tip.style.left=Math.max(8,x)+'px';tip.style.top=Math.max(8,y)+'px';}
function hideTip(){tip.hidden=true;}
function highlight(id,kind){
  const svg=$('#wheel');svg.querySelectorAll('.hl').forEach(n=>n.classList.remove('hl'));svg.querySelectorAll('.anim').forEach(n=>n.classList.remove('dim'));
  document.querySelectorAll('.sp.hl,.card.hl').forEach(n=>n.classList.remove('hl'));
  if(!state.sel)return;
  if(!id){$('#radars')&&($('#radars').innerHTML=renderRadars(state.sel,null));const c=$('#cmp');if(c)c.innerHTML='Passa su un abbinamento per sovrapporre il suo profilo.';return;}
  const keep=new Set([id]);svg.querySelectorAll('.lk').forEach(l=>{if(l.dataset.p===id||l.dataset.s===id){keep.add(l.dataset.p);keep.add(l.dataset.s);}});
  svg.querySelectorAll('.anim').forEach(n=>{const k=n.dataset.id||n.dataset.p;const isLk=n.classList.contains('lk');
    const on=isLk?(n.dataset.p===id||n.dataset.s===id):keep.has(k);if(!on)n.classList.add('dim');else if(isLk)n.style.opacity=.9;});
  svg.querySelector(`[data-id="${id}"]`)?.classList.add('hl');
  const B=BYID[id];if(B&&state.mode==='ego'){$('#radars').innerHTML=renderRadars(state.sel,B);const r=S(state.sel,B);
    $('#cmp').innerHTML=`Confronto con <b>${esc(B.name)}</b> (tratteggio) · ${TYPELBL[r.type].toLowerCase()} · ${r.total}/30`;
    if(kind==='s')document.querySelector(`.sp[data-sid="${id}"]`)?.classList.add('hl');else document.querySelector(`.card[data-pid="${id}"]`)?.classList.add('hl');}
}
function resetLinks(){$('#wheel').querySelectorAll('.lk').forEach(l=>l.style.opacity=.28);}
const wheel=$('#wheel');
wheel.addEventListener('pointerover',e=>{const g=e.target.closest('[data-id],[data-t]');if(!g)return;
  if(g.dataset.id){const B=BYID[g.dataset.id];
    if(state.mode==='ego'){const r=S(state.sel,B);highlight(B.id,g.dataset.kind);
      showTip(`<b>${esc(B.name)}</b> · ${TYPELBL[r.type]} · ${r.total}/30<br>${esc(r.summary.split(/(?<=\.)\s/)[0])}`,e);}
    else showTip(`<b>${esc(B.name)}</b><br>${esc(CATS[B.cat][0])} · ${TLABEL[B.dom]}<br>Firma: ${esc(topFams(B).join(', ')||'—')}`,e);}
  else if(g.dataset.cat)showTip(`<b>${esc(CATS[g.dataset.cat][0])}</b>`,e);
});
wheel.addEventListener('pointermove',moveTip);
wheel.addEventListener('pointerout',e=>{const g=e.target.closest('[data-id],[data-t]');if(!g)return;if(g.contains(e.relatedTarget))return;hideTip();if(state.mode==='ego'){resetLinks();highlight(null);}});
function activate(g){if(!g)return;
  if(g.dataset.id){const B=BYID[g.dataset.id];hideTip();
    if(B.isSpirit){const c=document.querySelector(`.sp[data-sid="${B.id}"]`);if(c){c.scrollIntoView({block:'nearest',behavior:'smooth'});c.classList.add('hl');}}
    else{state.mode='ego';select(B);}}
  else if(g.dataset.t!==undefined){const t=g.dataset.t;state.zoom=(t==='__all'||!t||state.zoom===t)?null:t;hideTip();renderWheel();}}
wheel.addEventListener('click',e=>activate(e.target.closest('[data-id],[data-t]')));
wheel.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const g=e.target.closest('[data-id]');if(g){e.preventDefault();activate(g);}}});
wheel.addEventListener('focusin',e=>{const g=e.target.closest('[data-id]');if(g&&state.mode==='ego')highlight(g.dataset.id,g.dataset.kind);});

$('#mEgo').addEventListener('click',()=>{if(!state.sel)return;state.mode='ego';renderWheel();});
$('#mBrowse').addEventListener('click',()=>{state.mode='browse';state.zoom=state.sel?state.sel.dom:null;renderWheel();});
$('#rand').addEventListener('click',()=>{let f;do{f=FOODS[Math.floor(Math.random()*FOODS.length)];}while(f===state.sel);state.mode='ego';select(f);});
document.querySelectorAll('#pairs .seg button').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.f;renderPairs();}));
$('#pairGrid').addEventListener('click',e=>{const o=e.target.closest('[data-open]'),c=e.target.closest('[data-check]');
  if(o){select(BYID[o.dataset.open]);window.scrollTo({top:0,behavior:'smooth'});}
  if(c){state.A=state.sel;state.B=BYID[c.dataset.check];state.C=null;if(typeof comboC!=='undefined'&&comboC)comboC.set(null);comboA.set(state.A);comboB.set(state.B);renderCheck();showTab('verifica');window.scrollTo({top:0});}});

function assignTrio(){const used={};state.trio={};
  state.sps.forEach(rs=>{let best=null,bv=-1;state.parts.forEach(p=>{const sp=S(p.B,rs.B).total;if(sp<15)return;const v=p.total+sp-2.5*(used[p.B.id]||0);if(v>bv){bv=v;best=p.B;}});
    if(best){state.trio[rs.B.id]=best;used[best.id]=(used[best.id]||0)+1;}});}
function select(f,fromHash){state.sel=f;state.parts=partnersOf(f);state.sps=spiritsOf(f);assignTrio();if(state.mode==='browse')state.zoom=f.dom;
  renderWheel();renderProfile();renderPairs();if(mainCombo)mainCombo.set(f);
  if(!fromHash){showTab('ruota',true);if(location.hash!=='#'+f.id){try{history.replaceState(null,'','#'+f.id);}catch(e){location.hash=f.id;}}}}

mainCombo=makeCombo($('#mainSearch'),{id:'q-main',placeholder:`Cerca tra ${FOODS.length} alimenti…`,source:()=>FOODS,keep:true,onPick:f=>{state.mode='ego';select(f);$('#q-main').blur();}});
mainCombo.set(state.sel);
$('#q-main').addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==$('#q-main'))mainCombo.set(state.sel);},200));
document.addEventListener('keydown',e=>{if(e.key!=='/'||e.ctrlKey||e.metaKey)return;const t=e.target;if(t.closest&&t.closest('input,textarea,select'))return;if($('#tab-ruota').hidden)return;e.preventDefault();$('#q-main').focus();});
const comboA=makeCombo($('#cA'),{id:'q-a',placeholder:'Alimento A',source:()=>FOODS,keep:true,onPick:f=>{state.A=f;renderCheck();}});
const comboB=makeCombo($('#cB'),{id:'q-b',placeholder:'Alimento o alcolico B',source:()=>FOODS.concat(SPIRITS),keep:true,onPick:f=>{state.B=f;renderCheck();}});
comboA.set(state.A);comboB.set(state.B);
$('#stats').textContent=`${FOODS.length} alimenti · ${Object.keys(CATS).length} categorie · ${SPIRITS.length} alcolici`;
renderMethod();
if(state.sel)select(state.sel,true);else{renderWheel();renderProfile();renderPairs();}


// ===== PAIRING STUDIO: TRIO =====
var TCOL=['var(--ink)','var(--accent)','var(--spirit)'];
var TDASH=[0,1,'1.5 2.5'];
state.C=null;state.lens='piramide';
// ---- triangolo ----
function triangleSVG(t){
  const P=[[180,46],[62,236],[298,236]];const [A,B,C]=t.T;const E=[[0,1],[0,2],[1,2]];
  let h=`<svg class="tri" viewBox="0 0 360 290" role="img" aria-label="Triangolo del trio">`;
  E.forEach(([i,j],k)=>{const p=t.P[k];const w=(1.5+Math.max(0,p.total-10)/3.5).toFixed(1);const weak=k===t.wi&&!t.isBridge&&p.total<17;
    h+=`<line x1="${P[i][0]}" y1="${P[i][1]}" x2="${P[j][0]}" y2="${P[j][1]}" style="stroke:${weak?'var(--warn)':typeCol(p.type)};stroke-width:${w};${p.type==='contrasto'?'stroke-dasharray:7 5;':''}stroke-linecap:round"/>`;});
  E.forEach(([i,j],k)=>{const p=t.P[k];const mx=(P[i][0]+P[j][0])/2,my=(P[i][1]+P[j][1])/2;const cx=180,cy=172;const dx=mx-cx,dy=my-cy,L=Math.hypot(dx,dy)||1;const lx=mx+dx/L*16,ly=my+dy/L*16;
    h+=`<g><rect x="${lx-25}" y="${ly-12}" width="50" height="24" rx="12" style="fill:var(--surface);stroke:var(--line)"/><text x="${lx}" y="${ly+4.5}" text-anchor="middle" style="font-family:var(--f-mono);font-size:12.5px;fill:var(--ink)">${fmtN(p.total)}</text></g>`;});
  t.T.forEach((I,i)=>{const [x,y]=P[i];const ty=i===0?y-20:y+30;
    h+=`<circle cx="${x}" cy="${y}" r="11" style="fill:${TCOL[i]};stroke:var(--surface);stroke-width:3"/><text x="${x}" y="${ty}" text-anchor="middle" style="font-size:14px;font-weight:600;fill:var(--ink)">${esc(trunc(I.name,20))}</text>`;});
  h+=`<text x="180" y="166" text-anchor="middle" style="font-family:var(--f-display);font-size:19px;fill:var(--ink)">${t.structure}</text><text x="180" y="184" text-anchor="middle" style="font-family:var(--f-mono);font-size:10px;letter-spacing:.08em;fill:var(--muted)">STRUTTURA</text>`;
  return h+'</svg>';
}
function triCap(){return `<p class="tiny muted tricap"><span><svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" style="stroke:var(--concord);stroke-width:2.5"/></svg>concordanza</span><span><svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" style="stroke:var(--contrast);stroke-width:2.5;stroke-dasharray:5 4"/></svg>contrasto</span><span>spessore = punteggio</span></p>`;}

// ---- render ----
function renderLensPick(){
  $('#lensPick').innerHTML=`<span class="eyebrow">Lente del trio</span><div class="lensbar" role="group" aria-label="Lente del trio">${TLENS.map(l=>`<button type="button" data-lens="${l[0]}" aria-pressed="${state.lens===l[0]}">${l[1]}</button>`).join('')}</div><p class="tiny muted">${TLENS.find(l=>l[0]===state.lens)[2]}</p>`;
}
function renderSuggest(){
  const A=state.A,B=state.B;const host=$('#thirdSug');
  if(!A||!B||A===B){host.innerHTML='';return;}
  const L=TLENS.find(l=>l[0]===state.lens);const list=suggestThird(A,B,state.lens);
  host.innerHTML=`<span class="eyebrow">Terzo ingrediente consigliato · ${L[1]} ${info('third','terzo ingrediente')}</span><ul class="sug">${list.map(x=>`<li><button type="button" data-setc="${x.C.id}" class="${state.C===x.C?'on':''}"><i style="background:${tcol(x.C.dom)}"></i><span class="sg-n"><b>${esc(x.C.name)}</b><small>${esc(lensReason(state.lens,A,B,x.C,x.t))}</small></span><span class="sg-s"><b>${fmtN(x.lv)}</b><em>/5</em><small>trio ${fmtN(x.t.total)}</small></span></button></li>`).join('')}</ul>`;
}
function renderSide(){
  const A=state.A,B=state.B,C=state.C;if(!A||!B){$('#checkSide').innerHTML='';return;}
  const T=[A,B,C].filter(Boolean);
  const ser=T.map((I,i)=>({v:I.ar,c:TCOL[i],fo:i===0?0.12:0.06,dash:TDASH[i]}));
  $('#checkSide').innerHTML=`<div class="radar"><span class="eyebrow">Famiglie aromatiche</span>${radar(FAM.map(f=>({t:f[2]})),ser,96,72)}</div>
    <p class="tiny legend3">${T.map((I,i)=>`<span><svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" style="stroke:${TCOL[i]};stroke-width:2.5;${TDASH[i]?`stroke-dasharray:${TDASH[i]===1?'4 3':TDASH[i]}`:''}"/></svg>${esc(I.name)}</span>`).join('')}</p>`;
}
function renderTrioOut(){
  const t=trio(state.A,state.B,state.C);const [v,vt]=verdict(t.total);const vc=v==='forte'||v==='promettente'?'var(--ok)':v==='rischioso'?'var(--warn)':'var(--bad)';
  const r=t.roles;const sp=spiritsForTrio(t.T);
  const best=t.P.map((p,i)=>({p,i})).sort((a,b)=>b.p.total-a.p.total)[0];
  const sel=t.rows.find(x=>x.k===state.lens);
  $('#checkOut').innerHTML=`
    <div class="trio-top">
      <div>
        <div class="verdict"><span class="big">${fmtN(t.total)}<small>/30</small></span><div><div class="vtag" style="color:${vc}">${v}${info('score','punteggio')}</div><div class="chips" style="margin-top:4px"><span class="chip">${t.structure}</span>${info('structure','struttura')}</div></div></div>
        <div style="margin:10px 0 4px"><div class="scale"><i></i><i></i><i></i><i></i><b style="left:calc(${(t.total/30*100).toFixed(1)}% - 1.5px)"></b></div><div class="scale-l"><span>0</span><span>10</span><span>17</span><span>24</span><span>30</span></div></div>
        <p style="margin:10px 0 0"><b>${esc(t.T.map(I=>I.name).join(' + '))}.</b> ${esc(vt)} La coppia più forte è ${esc(best.p.A.name)} + ${esc(best.p.B.name)} (${fmtN(best.p.total)}, ${TYPELBL[best.p.type].toLowerCase()}).</p>
        <p class="lensfocus"><b>${esc(sel.n)} · ${fmtN(sel.v)}/5.</b> ${esc(sel.why)}</p>
      </div>
      <div>${triangleSVG(t)}${triCap()}</div>
    </div>
    <table class="lens tlens"><tbody>${t.rows.map(x=>`<tr class="${x.k===state.lens?'sel':''}"><td>${x.n}${info(x.n)}</td><td>${esc(x.why)}</td><td class="v">${fmtN(x.v)}/5</td></tr>`).join('')}</tbody></table>
    <div class="trio-roles">
      <div><span class="eyebrow">Ruoli e dosi ${info('roles','ruoli e dosi')}</span><p class="tiny" style="margin-top:4px"><b>Base:</b> ${esc(r.base.name)} · <b>Complemento:</b> ${esc(r.comp.name)} · <b>Accento:</b> ${esc(r.accent.name)}</p><p class="tiny">Rapporto di partenza ${r.ratio}, in peso o in volume, poi correggi all'assaggio.</p></div>
      <div><span class="eyebrow">Da bere con il trio ${info('spirits','alcolici del trio')}</span><div class="list-inline" style="margin-top:6px">${sp.map(x=>`<span class="chip">${esc(x.s.name)} <span class="muted" style="font-family:var(--f-mono)">${fmtN(x.m)}</span></span>`).join('')}</div></div>
    </div>
    <details class="pairs3"><summary>Le tre coppie</summary>${t.P.map(p=>`<div class="p3"><b>${esc(p.A.name)} + ${esc(p.B.name)}</b> ${scoreBar(p.total)} ${badge(p)}<p class="tiny">${esc(p.summary)}</p></div>`).join('')}</details>`;
}
function renderCheck(){
  const A=state.A,B=state.B,C=state.C;
  if(!$('#lensPick'))return;
  renderLensPick();
  if(!A||!B||A===B){$('#checkOut').innerHTML='<p class="muted">Scegli almeno due ingredienti diversi.</p>';$('#checkSide').innerHTML='';$('#thirdSug').innerHTML='';return;}
  if(C&&(C===A||C===B))state.C=null;
  renderSuggest();renderSide();
  if(state.C)renderTrioOut();else renderPairOut();
  $('#cClear').hidden=!state.C;
}
var comboC=makeCombo($('#cC'),{id:'q-c',placeholder:'Terzo ingrediente (facoltativo)',source:()=>FOODS.concat(SPIRITS),keep:true,onPick:f=>{state.C=f;renderCheck();}});
$('#cClear').addEventListener('click',()=>{state.C=null;comboC.set(null);renderCheck();});
$('#lensPick').addEventListener('click',e=>{const b=e.target.closest('[data-lens]');if(!b)return;state.lens=b.dataset.lens;renderCheck();});
$('#thirdSug').addEventListener('click',e=>{const b=e.target.closest('[data-setc]');if(!b)return;state.C=BYID[b.dataset.setc];comboC.set(state.C);renderCheck();});
renderCheck();

// ===== TAB E INTERFACCIA DEL COCKTAIL CREATOR =====
const TABS=['ruota','verifica','cocktail'];
function showTab(t,silent){
  TABS.forEach(k=>{$('#tab-'+k).hidden=k!==t;const b=$('#tb-'+k);b.setAttribute('aria-selected',String(k===t));b.tabIndex=k===t?0:-1;});
  $('#ruotaTools').hidden=t!=='ruota';
  if(!silent){const h=t==='ruota'?(state.sel?'#'+state.sel.id:''):'#'+t;if(location.hash!==h){try{history.replaceState(null,'',h||location.pathname+location.search);}catch(e){location.hash=h;}}}
  if(t==='cocktail')renderCocktail();
}
TABS.forEach(k=>$('#tb-'+k).addEventListener('click',()=>{showTab(k);window.scrollTo({top:0});}));
$('#tabbar').addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;const cur=TABS.findIndex(k=>$('#tb-'+k).getAttribute('aria-selected')==='true');
  const nx=TABS[(cur+(e.key==='ArrowRight'?1:TABS.length-1))%TABS.length];showTab(nx);$('#tb-'+nx).focus();});

const CK={ings:[],style:null,base:null,view:'classic',bgroup:'all'};
function styleShort(R){const st=R.st,b=R.base?R.base.name:'';
  switch(st.id){case 'oldfashioned':return'Old Fashioned';case 'martini':return R.base&&R.base.grp==='ver'?'Reverse Martini':/Gin|Vodka|Genever/.test(b)?'Martini':'Manhattan';
    case 'negroni':return /Bourbon|Rye|Scotch|whisky/i.test(b)?'Boulevardier':'Negroni';case 'sour':return R.spec.some(l=>l.sp&&l.sp.grp==='liq')?'Daisy':'Sour';
    case 'sour_albume':return'Sour';case 'collins':return R.texture?'Fizz':'Collins';case 'highball':return R.lengthLbl==='Ginger beer'?'Buck':'Highball';
    case 'julep':return R.spec.some(l=>/menta/.test(l.name))?'Julep':'Smash';case 'flip':return R.texture==='panna'?'Cream':'Flip';
    case 'spritz':return'Spritz';case 'royale':return'Royale';case 'tiki':return'Swizzle';case 'milkpunch':return'Milk Punch';}}
function drinkName(R,inputs){const fs=inputs.filter(i=>!i.isSpirit).map(i=>i.name.replace(/\s*\(.*\)/,''));const nm=fs.slice(0,2).join(' & ')||inputs[0]?.name||'';return `${nm} ${styleShort(R)}`;}
const MODELBL={classic:'Classica',lab:'Laboratorio',low:'A bassa gradazione'};
const MODEDESC={classic:'Tecniche da bancone: succhi freschi, sciroppi, infusioni a freddo, pestato.',lab:'Roner, fat-wash, acidi corretti con citrico e malico, carbonazione.',low:'Stessa idea con un vino aromatizzato o fortificato come base.'};


const SHELVES=[['Stirred',['oldfashioned','martini','negroni']],['Shaken',['sour','sour_albume','flip','royale']],['Lunghi e costruiti',['collins','highball','spritz','julep']],['Speciali',['tiki','milkpunch']]];
const MODEICON={classic:'Bancone',lab:'Roner e acidi',low:'Low ABV'};
const ckFoods=()=>CK.ings.filter(i=>!i.isSpirit);
const ingBase=()=>CK.ings.find(i=>i.isSpirit&&(i.grp==='bia'||i.grp==='inv'))||null;
function effBaseFor(id){return CK.base||ingBase()||null;}
function effBase(){return CK.base||ingBase()||suggestBases(ckFoods(),CK.style)[0]?.s||null;}

function genRecipes(){const ins=CK.ings;if(!ins.length||!CK.style)return[];
  const st=STY[CK.style];const b=effBase();const out=[buildRecipe(ins,CK.style,'classic',b),buildRecipe(ins,CK.style,'lab',b)];
  if(st.base&&st.id!=='milkpunch'&&(!b||abvOf(b)>0.25))out.push(buildRecipe(ins,CK.style,'low',null));return out;}

// ---- 1. ingredienti ----
function mixProfile(){const fs=ckFoods();if(!fs.length)return'';
  const ar=FAM.map((_,i)=>Math.max(...fs.map(f=>f.ar[i])));const top=ar.map((v,i)=>[v,i]).filter(x=>x[0]>=3).sort((a,b)=>b[0]-a[0]).slice(0,4).map(x=>FAM[x[1]][1].toLowerCase());
  const g=CK.mixView!=='aromi';
  const labels=g?TORDER.map(k=>({t:TLABEL[k],c:tcol(k)})):FAM.map(f=>({t:f[2]}));
  const val=I=>g?TORDER.map(k=>I.t[k]):I.ar;
  const mix=g?TORDER.map(k=>Math.max(...fs.map(f=>f.t[k]))):ar;
  const PAL=['var(--accent)','var(--spirit)','var(--t-amaro)','var(--t-salato)','var(--t-dolce)'];
  const ser=[{v:mix,c:'var(--ink)',fo:.14}].concat(fs.length>1?fs.map((f,i)=>({v:val(f),c:PAL[i],fo:0,dash:'3 3'})):[]);
  return `<div class="mix"><div class="mix-h"><span class="eyebrow">Profilo del mix</span><div class="seg mini" role="group" aria-label="Profilo da mostrare"><button type="button" data-mv="gusti" aria-pressed="${g}">Gusti</button><button type="button" data-mv="aromi" aria-pressed="${!g}">Aromi</button></div></div>
    <div class="mixradar">${g?radar(labels,ser,70,44):radar(labels,ser,82,66)}</div>
    <p class="tiny muted legend3">${fs.length>1?`<span><svg width="18" height="10"><rect x="1" y="1" width="16" height="8" style="fill:var(--ink);fill-opacity:.18;stroke:var(--ink)"/></svg>Mix</span>`+fs.map((f,i)=>`<span><svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" style="stroke:${PAL[i]};stroke-width:2;stroke-dasharray:3 3"/></svg>${esc(f.name)}</span>`).join(''):'Profilo di '+esc(fs[0].name)+'.'}</p>
    <p class="tiny">${top.length?'Sa di '+esc(listIt(top)):'Profilo aromatico delicato'}.</p></div>`;}
function renderIngs(){
  const host=$('#ckIngs');
  host.innerHTML=CK.ings.map((it,i)=>`<li class="ing"><i style="background:${it.isSpirit?'var(--spirit)':tcol(it.dom)}"></i><span><b>${esc(it.name)}</b><small>${esc(it.isSpirit?SGROUP[it.grp][0]:CATS[it.cat][1])}</small></span><button type="button" class="x" data-rm="${i}" aria-label="Rimuovi ${esc(it.name)}">×</button></li>`).join('')
    +Array.from({length:5-CK.ings.length},()=>`<li class="ing empty" aria-hidden="true"></li>`).join('');
  $('#ckCount').textContent=`${CK.ings.length} di 5`;
  $('#ckAddWrap').hidden=CK.ings.length>=5;
  $('#ckMix').innerHTML=mixProfile();
}
$('#ckMix').addEventListener('click',e=>{const b=e.target.closest('[data-mv]');if(!b)return;CK.mixView=b.dataset.mv;$('#ckMix').innerHTML=mixProfile();});
$('#ckIngs').addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(!b)return;CK.ings.splice(+b.dataset.rm,1);renderCocktail();});
makeCombo($('#ckAdd'),{id:'q-ck-add',placeholder:'Aggiungi un alimento o un alcolico…',source:()=>FOODS.concat(SPIRITS).filter(x=>!CK.ings.includes(x)),
  onPick:f=>{if(CK.ings.length>=5||CK.ings.includes(f))return;CK.ings.push(f);renderCocktail();if(CK.ings.length<5)setTimeout(()=>$('#q-ck-add')?.focus(),0);}});

// ---- 2. base ----
function renderBase(){
  const st=STY[CK.style],host=$('#ckBaseBox');const fs=ckFoods();
  const sug=suggestBases(fs,CK.style);const eb=effBase();const ib=ingBase();
  const mixAr=FAM.map((_,i)=>fs.length?Math.max(...fs.map(f=>f.ar[i])):0);const fsug=suggestBases(fs,CK.style,CK.bgroup);const top=fsug.slice(0,3);
  if(eb&&!top.some(x=>x.s===eb)){const e=sug.find(x=>x.s===eb);if(e)top.push(e);}
  const card=(x,i)=>{const on=x.s===eb;const auto=!CK.base&&!ib&&i===0;
    const lab=x.s===CK.base?'Scelto da te':x.s===ib&&!CK.base?'Dai tuoi ingredienti':i===0?'Consigliato':`${i+1}° per vicinanza`;
    return `<button type="button" class="bcard${on?' on':''}" data-base="${x.s.id}" aria-pressed="${on}">
      <span class="btag${i===0?' first':''}">${lab}</span>
      <b>${esc(x.s.name)}</b><small>${esc((x.s.ex?x.s.ex+' · ':'')+SGROUP[x.s.grp][0])}</small>
      <span class="bmeter"><span class="bar"><i style="width:${(x.mean/30*100).toFixed(0)}%"></i></span><span class="num">${fmt(x.mean)}<em>/30</em></span></span>
      <span class="bwhy">${x.ov.length?'Ponte: '+esc(listIt(x.ov)):'Contrasto più che affinità'}</span>
      ${x.fit?`<span class="bfit">Tipico dello stile</span>`:''}
      <span class="bnote">Lega meglio con ${esc(x.best.f.name)}: ${esc(TYPELBL[x.best.r.type].toLowerCase())}.</span>
      <div class="bradar" aria-hidden="true">${radar(FAM.map(()=>({t:''})),[{v:mixAr,c:'var(--muted)',fo:.12},{v:x.s.ar,c:'var(--spirit)',fo:.28}],56,4)}</div>
      <ul class="bper" aria-label="Punteggio con ogni ingrediente">${x.per.map(p=>`<li><span>${esc(p.f.name)}</span><span class="bar"><i style="width:${(p.r.total/30*100).toFixed(0)}%"></i></span><b>${fmt(p.r.total)}</b></li>`).join('')}</ul>
    </button>`;};
  const chips=`<div class="bfilter" role="group" aria-label="Tipo di base">${[['all','Tutte']].concat(BGROUPS.map(g=>[g[0],g[1]])).filter(g=>g[0]==='all'||suggestBases(fs.length?fs:[FOODS[0]],CK.style,g[0]).length).map(g=>`<button type="button" data-bg="${g[0]}" aria-pressed="${CK.bgroup===g[0]}">${g[1]}</button>`).join('')}</div>`;
  host.innerHTML=fs.length?chips+`<div class="bcards">${top.map(x=>card(x,sug.findIndex(y=>y.s===x.s))).join('')}</div>`
    :`<p class="note">Aggiungi almeno un alimento: il suggerimento confronta il profilo di ogni base (distillati, amari, vermouth, liquori) con quello degli ingredienti.</p>`;
  const sel=$('#ckBase');
  sel.innerHTML=`<option value="">${ib&&!CK.base?'Dai tuoi ingredienti: '+esc(ib.name):'Consigliato'+(sug[0]?': '+esc(sug[0].s.name):'')}</option>`+
    BGROUPS.map(([g,l,fn])=>`<optgroup label="${l}">${BASES.filter(fn).filter(s=>CK.style!=='spritz'||!(s.grp==='bia'||s.grp==='inv')||true).map(s=>{const x=sug.find(y=>y.s===s);const ok=styleFit(s,CK.style).ok;return `<option value="${s.id}"${CK.base===s?' selected':''}>${esc(s.name)}${x?' · '+fmt(x.mean)+'/30':''}${ok?'':' · non adatto allo stile'}</option>`;}).join('')}</optgroup>`).join('');
  $('#ckReset').hidden=!CK.base;
}
$('#ckBaseBox').addEventListener('click',e=>{const g=e.target.closest('[data-bg]');if(g){CK.bgroup=g.dataset.bg;renderBase();return;}const b=e.target.closest('[data-base]');if(!b)return;const s=BYID[b.dataset.base];
  const sug=suggestBases(ckFoods(),CK.style);const auto=ingBase()||sug[0]?.s;CK.base=s===auto?null:s;renderCocktail();});
$('#ckBase').addEventListener('change',e=>{CK.base=BYID[e.target.value]||null;renderCocktail();});
$('#ckReset').addEventListener('click',()=>{CK.base=null;renderCocktail();});

// ---- 3. stile ----
function renderStyles(){
  $('#ckStyles').innerHTML=SHELVES.map(([lbl,ids])=>`<div class="shelf"><span class="shelf-l">${lbl}</span><div class="shelf-row">${ids.map(id=>{const s=STY[id];
    const fit=styleFit(effBaseFor(id),id);
    return `<button type="button" class="glass${fit.ok?'':' nofit'}" data-sty="${id}" aria-pressed="${id===CK.style}" aria-description="${esc(s.fam+'. '+s.desc+(fit.ok?'':' Non adatto: '+fit.why))}">${fit.ok?'':'<i class="nf" aria-hidden="true">×</i>'}${glassSVG(id,56,s.name)}<span>${esc(s.name)}</span></button>`;}).join('')}</div></div>`).join('');
  const st=STY[CK.style];
}
$('#ckStyles').addEventListener('click',e=>{const b=e.target.closest('[data-sty]');if(!b)return;CK.style=b.dataset.sty;renderCocktail();});

// ---- 4. ricette ----
function sheet(R,ins){
  const spec=R.spec.map(l=>`<li${l.auto?' class="auto"':''}><span class="q">${l.drop?'—':fmt(l.ml)+'<em> ml</em>'}</span><span>${esc(l.name)}${l.post?'<small>per colmare</small>':''}${l.auto?'<small>scelto dal metodo</small>':''}</span></li>`).join('')
    +(R.st.id==='milkpunch'?`<li><span class="q">${R.st.clar}<em> ml</em></span><span>${esc(R.clarName)}<small>per chiarificare, non resta nel drink</small></span></li>`:'');
  const baseTxt=[R.base?R.base.name:R.mods[0]?.name,R.base2?.name].filter(Boolean).join(' + ');
  return `<article class="sheet">
    <div class="sheet-l">
      <div class="hero"><div class="hero-ic">${glassSVG(R.st.id,104,R.st.name,true)}</div>
        <div><span class="rtag ${R.mode}">${MODELBL[R.mode]}</span><h3>${esc(drinkName(R,ins))}</h3><p class="tiny muted">${esc(R.st.name)} · ${esc(baseTxt)}</p></div></div>
      <dl class="rstats"><div><dt>Volume</dt><dd>${R.vol} ml</dd></div><div><dt>Alcol</dt><dd>~${fmt(R.abv)}%</dd></div><div><dt>Bicchiere</dt><dd>${esc(R.st.glass)}</dd></div><div><dt>Ghiaccio</dt><dd>${esc(R.st.ice)}</dd></div></dl>
      <div><h4>Ricetta</h4><ul class="spec">${spec}</ul></div>
      <div><h4>Garnish</h4><p class="tiny">${esc(R.garnish[0])}.</p></div>
    </div>
    <div class="sheet-r">
      ${R.preps.length?`<div><h4>Mise en place · ${R.preps.length} ${R.preps.length>1?'preparazioni':'preparazione'}</h4><div class="preps">${R.preps.map((p,i)=>`<details class="prep"${i<2?' open':''}><summary>${esc(p.title)}</summary><ol>${p.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details>`).join('')}</div></div>`:''}
      <div><h4>Preparazione</h4><ol class="steps">${R.method.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>
      ${R.why.length?`<div><h4>Perché funziona</h4><ul class="why">${R.why.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>`:''}
      ${R.coh&&R.coh.length?`<p class="safety"><b>Da calibrare:</b> ${R.coh.map(esc).join(' ')}</p>`:''}
      ${R.warn.length?`<p class="safety">${R.warn.map(esc).join(' ')}</p>`:''}
    </div></article>`;
}
function renderRecipes(){
  const ins=CK.ings;const rs=genRecipes();
  if(!rs.length){$('#ckVerTitle').textContent='Le tue ricette';$('#ckOut').innerHTML=`<p class="note">${!ins.length&&!CK.style?'Aggiungi almeno un ingrediente e scegli uno stile: qui compariranno le ricette.':!ins.length?'Aggiungi almeno un ingrediente per vedere le ricette.':'Scegli uno stile del drink per vedere le ricette.'}</p>`;return;}
  const coh=coherence(ins,CK.style,effBase());
  if(coh.block.length){$('#ckVerTitle').textContent='Questa combinazione non regge';
    $('#ckOut').innerHTML=`<div class="nogo"><div class="nogo-ic">${glassSVG(CK.style,72,'')}</div><div class="nogo-b">
      <h3>Meglio non servirla</h3><ul>${coh.block.map(b=>`<li>${esc(b.txt)}</li>`).join('')}</ul>
      ${coh.block.some(b=>b.k==='style')&&coh.altStyles.length?`<p class="tiny muted">Con ${esc(effBase().name)} funzionano meglio questi stili:</p><div class="list-inline">${coh.altStyles.map(s=>`<button type="button" class="btn" data-gosty="${s.id}">${esc(s.name)}</button>`).join('')}</div>`:''}
      ${coh.block.some(b=>b.k!=='pair')&&coh.altBases.length?`<p class="tiny muted">Oppure tieni lo stile ${esc(STY[CK.style].name)} e cambia base:</p><div class="list-inline">${coh.altBases.map(s=>`<button type="button" class="btn" data-gobase="${s.id}">${esc(s.name)}</button>`).join('')}</div>`:''}
      ${coh.bridges.length&&CK.ings.length<5?`<p class="tiny muted">Aggiungi un ingrediente ponte:</p><div class="list-inline">${coh.bridges.map(c=>`<button type="button" class="btn" data-goadd="${c.id}">+ ${esc(c.name)}</button>`).join('')}</div>`:''}
    </div></div>`;return;}
  if(!rs.some(r=>r.mode===CK.view))CK.view='classic';
  $('#ckVerTitle').textContent=`${['','Una versione','Due versioni','Tre versioni'][rs.length]}, stessa idea`;
  const R=rs.find(r=>r.mode===CK.view);R.coh=coh.warn;
  $('#ckOut').innerHTML=`<div class="tickets" role="tablist" aria-label="Versioni della ricetta">${rs.map(r=>`<button type="button" role="tab" class="ticket ${r.mode}" data-view="${r.mode}" aria-selected="${r.mode===CK.view}">
      <span class="rtag ${r.mode}">${MODELBL[r.mode]}</span><b>${esc(drinkName(r,ins))}</b><span class="tk-m">${esc(r.base?r.base.name:r.mods[0]?.name||'')} · ~${fmt(r.abv)}% · ${r.vol} ml</span><span class="tk-d">${esc(MODEDESC[r.mode])}</span></button>`).join('')}</div>${sheet(R,ins)}`;
}
$('#ckOut').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b){CK.view=b.dataset.view;renderRecipes();return;}
  const s=e.target.closest('[data-gosty]');if(s){CK.style=s.dataset.gosty;renderCocktail();return;}
  const g=e.target.closest('[data-gobase]');if(g){CK.base=BYID[g.dataset.gobase];renderCocktail();return;}
  const a=e.target.closest('[data-goadd]');if(a&&CK.ings.length<5){CK.ings.push(BYID[a.dataset.goadd]);renderCocktail();}});
$('#ckFromWheel').addEventListener('click',()=>{if(!state.sel){showTab('ruota');$('#q-main').focus();return;}const p=state.parts.slice(0,2).map(r=>r.B);CK.ings=[state.sel,...p];CK.base=null;renderCocktail();});

function renderCocktail(){renderIngs();renderBase();renderStyles();renderRecipes();}

function route(){const h=location.hash.slice(1);if(h==='verifica'||h==='cocktail'){showTab(h,true);return;}
  showTab('ruota',true);const f=BYID[h];if(f&&!f.isSpirit&&f!==state.sel)select(f,true);}
window.addEventListener('hashchange',route);
route();
