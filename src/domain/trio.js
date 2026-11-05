// Analisi del trio: lenti, ruoli e terzo ingrediente consigliato.
import { FAM, FOODS, LEVEL, SPIRITS, TK, clamp, r05 } from './core.js';
import { CLASH, FIX, RULES, S, listIt, ratio, tv } from './scoring.js';
export var TLENS=[
  ['piramide','Piramide','Testa, cuore e fondo coperti dai tre insieme: il terzo ingrediente consigliato è quello che completa i livelli mancanti.'],
  ['equilibrio','Equilibrio','I cinque gusti del trio: premia i contrasti che si compensano e penalizza le somme (tre acidi, due amari forti).'],
  ['intensita','Intensità','Nessuno dei tre deve coprire gli altri: il terzo ingrediente consigliato ha una forza compatibile con entrambi.'],
  ['debole','Anello debole','Un trio vale quanto la sua coppia peggiore. Il terzo ingrediente consigliato lega bene con tutti e due, e può fare da ponte.'],
];
export var LVS=['testa','cuore','fondo'];
export var FRUITC=['pom','dru','bos','tro','mel','sec'];

export function pairS(x,y){return x.isSpirit&&!y.isSpirit?S(y,x):S(x,y);}
export function lvSum(I,lv){let s=0;for(const i of LEVEL[lv])s+=I.ar[i];return s;}
export function lvTop(I,lv){let b=0,bi=-1;for(const i of LEVEL[lv])if(I.ar[i]>b){b=I.ar[i];bi=i;}return bi>=0?FAM[bi][1].toLowerCase():null;}
export function coverage(list){const cov={};for(const lv of LVS){let s=0;for(const i of LEVEL[lv])s+=Math.max(...list.map(I=>I.ar[i]));cov[lv]=s;}return cov;}

export function trio(A,B,C){
  const T=[A,B,C];const pairs=[[A,B],[A,C],[B,C]];const P=pairs.map(([x,y])=>pairS(x,y));
  // ponte medio e tradizione
  const ponte=r05(P.reduce((s,p)=>s+p.lens[0].v,0)/3);
  const trad=r05(P.reduce((s,p)=>s+(p.lens[4].v+p.lens[5].v)/2,0)/3);
  // piramide
  const cov=coverage(T);const covered=LVS.filter(lv=>cov[lv]>=3);
  const leaders={};LVS.forEach(lv=>{let b=null,bv=0;T.forEach(I=>{const v=lvSum(I,lv);if(v>bv){bv=v;b=I;}});leaders[lv]=b;});
  const distinct=new Set(covered.map(lv=>leaders[lv])).size;
  const pir=r05(clamp([0,1.5,3,4.5][covered.length]+(covered.length===3&&distinct===3?0.5:0)));
  const missing=LVS.filter(lv=>!covered.includes(lv));
  const pirTxt=LVS.map(lv=>covered.includes(lv)?`${lv.charAt(0).toUpperCase()+lv.slice(1)}: ${leaders[lv].name} (${lvTop(leaders[lv],lv)})`:`${lv.charAt(0).toUpperCase()+lv.slice(1)}: manca`).join(' · ')+(missing.length?`. Aggiungi ${missing.map(m=>FIX[m]).join(', oppure ')}.`:distinct===3?'. Ognuno guida un livello diverso.':'.');
  // equilibrio
  const pos=[],seen=new Set();
  for(const X of T)for(const Y of T){if(X===Y)continue;for(const [kx,ky,w,kind,txt] of RULES){const v=Math.min(tv(X,kx),tv(Y,ky))*w;if(v>=2){const t=txt(X.name,Y.name,Y);if(!seen.has(t)){seen.add(t);pos.push({v,t,who:[X,Y]});}}}}
  pairs.forEach(([x,y])=>{if(x.t.umami>=3&&y.t.umami>=3){const t=`Sinergia umami tra ${x.name} e ${y.name}.`;pos.push({v:Math.min(x.t.umami,y.t.umami)*0.8,t,who:[x,y]});}});
  pos.sort((a,b)=>b.v-a.v);
  let clash=0;const clashT=[];
  for(const [k,th,w] of CLASH){const hi=T.filter(I=>tv(I,k)>=th);if(hi.length>=2){const vals=hi.map(I=>tv(I,k)).sort((a,b)=>b-a);clash+=(vals[1]-th+1)*w*(hi.length===3?1.5:1);
    const lbl={amaro:'amari',acido:'acidi',p:'pungenti',salato:'salati',t:'astringenti'}[k];clashT.push(`${listIt(hi.map(I=>I.name))} sono ${hi.length===2?'entrambi':'tutti'} ${lbl}: la sensazione si somma.`);}}
  const spectrum=TK.filter(k=>Math.max(...T.map(I=>I.t[k]))>=2).length;
  const eqRaw=(pos[0]?.v||0)+0.5*(pos[1]?.v||0)+0.25*(pos[2]?.v||0)-clash+(spectrum>=3?0.5:0);const eq=r05(clamp(eqRaw));
  const eqTxt=(clashT[0]?'Attenzione: '+clashT[0]+' ':'')+(pos[0]?pos[0].t:'Gusti neutri tra loro.')+(spectrum>=3?` Coprono ${spectrum} gusti su 5.`:'');
  // intensità
  const ints=T.map(I=>I.int);const d=Math.max(...ints)-Math.min(...ints);const inten=r05(clamp(5-d*1.25));
  const strong=T.reduce((a,b)=>b.int>a.int?b:a),weak=T.reduce((a,b)=>b.int<a.int?b:a);
  const intTxt=d<=1?`Intensità allineate (${T.map(I=>I.name+' '+I.int).join(', ')}): dialogano alla pari.`:`${strong.name} (${strong.int}) è il più forte: ${weak.name} (${weak.int}) va in dose maggiore${d>=3?', o sparisce':''}.`;
  // anello debole
  const idx=[0,1,2].sort((a,b)=>P[a].total-P[b].total);const wi=idx[0];const m=P[wi].total;
  const [wx,wy]=pairs[wi];const wz=T.find(I=>I!==wx&&I!==wy);
  const zx=pairS(wx,wz).total,zy=pairS(wy,wz).total;
  const isBridge=m<20&&zx>=m+2&&zy>=m+2;
  const debRaw=(m-8)/16*5+(isBridge?1:0);const deb=r05(clamp(debRaw));
  const debTxt=`Coppia più debole: ${wx.name} + ${wy.name} (${fmtN(m)}/30).`+(isBridge?` ${wz.name} fa da ponte: ${fmtN(zx)} con ${wx.name} e ${fmtN(zy)} con ${wy.name}.`:m>=20?' Tutte le coppie reggono da sole.':' Nessuno dei tre fa da ponte: valuta di sostituirne uno.');
  const lens={piramide:pir,equilibrio:eq,intensita:inten,debole:deb};
  const raw={piramide:pir+Object.values(cov).reduce((a,b)=>a+Math.min(b,8),0)/60,equilibrio:eqRaw,intensita:inten-Math.abs(C.int-(A.int+B.int)/2)*0.1,debole:Math.min(pairS(A,C).total,pairS(B,C).total)+0.2*m};
  const rows=[
    {k:'ponte',n:'Ponte aromatico medio',v:ponte,why:`Media delle tre coppie: ${P.map((p,i)=>pairs[i].map(x=>x.name.split(' ')[0]).join('–')+' '+p.lens[0].v).join(', ')}.`},
    {k:'piramide',n:'Piramide',v:pir,why:pirTxt},
    {k:'equilibrio',n:'Equilibrio di gusto',v:eq,why:eqTxt},
    {k:'intensita',n:'Intensità',v:inten,why:intTxt},
    {k:'debole',n:'Anello debole',v:deb,why:debTxt},
    {k:'trad',n:'Tradizione e territorio',v:trad,why:P.some(p=>p.classic)?`Coppie classiche: ${P.filter(p=>p.classic).map(p=>p.A.name+' + '+p.B.name).join(', ')}.`:'Nessuna coppia classica: terreno da esplorare.'},
  ];
  const total=r05(rows.reduce((s,r)=>s+r.v,0));
  const conc=P.filter(p=>p.type==='concordanza').length;
  const structure=isBridge?'Ponte aromatico':conc===3?'Armonia':conc===0?'Contrasto':'Triangolo';
  return {T,P,pairs,rows,lens,raw,total,structure,wi,isBridge,wz,missing,cov,leaders,pos,roles:roles(T)};
}
export function fmtN(v){return String(v).replace('.',',');}
export function roles(T){
  const acc=I=>I.int+(I.st.p>=2?2:0)+(I.t.amaro>=3?1.5:0)+(I.t.salato>=3?1.5:0)+(['spe','bot','sali','itt','cfe','erb','fio','aff'].includes(I.cat)?1.5:0)-(I.isSpirit?6:0);
  const accent=T.slice().sort((a,b)=>acc(b)-acc(a))[0];
  const rest=T.filter(I=>I!==accent);
  const body=I=>(I.isSpirit?10:0)+I.st.g+I.t.dolce+I.t.umami+(FRUITC.includes(I.cat)?1.5:0)+I.int*0.5;
  const [base,comp]=rest.sort((a,b)=>body(b)-body(a));
  const ra=accent.int>=5?'0,5':'1',rc=comp.int>=base.int+2?'1,5':'2';
  return {base,comp,accent,ratio:`3 : ${rc} : ${ra}`};
}
export function lensReason(lens,A,B,C,t){
  if(lens==='piramide'){const before=coverage([A,B]);const add=LVS.filter(lv=>before[lv]<3&&t.cov[lv]>=3);
    if(add.length)return `Porta ${add.map(lv=>`il ${lv} (${lvTop(C,lv)||'—'})`).join(' e ')}`;
    const own=LVS.filter(lv=>t.leaders[lv]===C);return own.length?`Guida il ${own[0]} (${lvTop(C,own[0])})`:'Rinforza i livelli già coperti';}
  if(lens==='equilibrio'){const p=t.pos.find(x=>x.who.includes(C));return p?p.t:'Non sbilancia i gusti';}
  if(lens==='intensita')return `Intensità ${C.int}, con ${A.name} ${A.int} e ${B.name} ${B.int}`;
  return `${fmtN(pairS(A,C).total)} con ${A.name} · ${fmtN(pairS(B,C).total)} con ${B.name}`;
}
export function suggestThird(A,B,lens,n=6){
  const out=[],per={};
  const cands=FOODS.filter(f=>f!==A&&f!==B).map(C=>{const t=trio(A,B,C);return{C,t,lv:t.lens[lens],rw:t.raw[lens]};}).sort((a,b)=>b.rw-a.rw||b.t.total-a.t.total);
  for(const x of cands){per[x.C.cat]=(per[x.C.cat]||0)+1;if(per[x.C.cat]>2)continue;out.push(x);if(out.length>=n)break;}
  return out;
}
export function spiritsForTrio(T,n=4){return SPIRITS.map(s=>{const sc=T.filter(x=>!x.isSpirit).map(f=>S(f,s).total);return{s,m:Math.min(...sc),avg:sc.reduce((a,b)=>a+b,0)/sc.length};}).filter(x=>!T.includes(x.s)).sort((a,b)=>b.m-a.m||b.avg-a.avg).slice(0,n);}

