// Le sei lenti di abbinamento e le funzioni di ricerca dei partner.
import { CATS, CLASSIC, FAM, FI, FOODS, LEVEL, MESI, NF, ORIG, SGROUP, SPIRITS, W, clamp, pk, r05 } from './core.js';
export function kcos(A,B){if(!A.n||!B.n)return 0;let s=0;const a=A.ar,b=B.ar;for(let i=0;i<NF;i++){if(!a[i])continue;for(let j=0;j<NF;j++){if(b[j]&&W[i][j])s+=a[i]*b[j]*W[i][j];}}return s/(A.n*B.n);}
export const famName=i=>FAM[i][1].toLowerCase();
export function listIt(arr){return arr.length<=1?arr.join(''):arr.slice(0,-1).join(', ')+' e '+arr[arr.length-1];}
export function monthsTxt(m){if(m.length>=12)return 'tutto l\'anno';if(m.length===1)return MESI[m[0]-1];return MESI[m[0]-1]+'–'+MESI[m[m.length-1]-1];}

// regole di bilanciamento: [chiave, tratto X, tratto Y, peso, tipo, testo]
export const tv=(I,k)=>k in I.t?I.t[k]:I.st[k];
export const RULES = [
  ['acido','g',1,'contrasto',(x,y)=>`${x} porta acidità, ${y} grassezza: l'acido taglia il grasso e pulisce il palato.`],
  ['salato','dolce',1,'contrasto',(x,y)=>`${x} porta sale, ${y} dolcezza: il sale esalta il dolce e lo rende meno stucchevole.`],
  ['amaro','dolce',0.9,'contrasto',(x,y)=>`${x} porta amaro, ${y} dolcezza: l'amaro dà profondità, il dolce lo addomestica.`],
  ['g','p',1,'contrasto',(x,y,Y)=>`${x} porta grassezza, ${y} ${Y.isSpirit?'calore alcolico':'piccantezza'}: il grasso ammorbidisce il bruciore.`],
  ['g','t',0.8,'contrasto',(x,y)=>`${x} porta grassezza, ${y} astringenza: il grasso arrotonda tannini e secchezza.`],
  ['acido','dolce',0.8,'contrasto',(x,y)=>`${x} porta acidità, ${y} dolcezza: è l'equilibrio di un sour.`],
  ['salato','amaro',0.8,'contrasto',(x,y)=>`${x} porta sale, ${y} amaro: il sale attenua la percezione dell'amaro.`],
  ['f','p',0.7,'contrasto',(x,y)=>`${x} porta freschezza, ${y} pungenza: il fresco calma il bruciore.`],
  ['dolce','p',0.7,'contrasto',(x,y,Y)=>`${x} porta dolcezza, ${y} ${Y.isSpirit?'calore alcolico':'pungenza'}: lo zucchero doma il piccante.`],
  ['acido','umami',0.6,'contrasto',(x,y)=>`${x} porta acidità, ${y} sapidità: l'acido ravviva e alleggerisce.`],
  ['umami','salato',1,'sinergia',(x,y)=>`L'umami di ${x} e il sale di ${y} si rinforzano: sapidità più lunga.`],
];
export const CLASH = [
  ['amaro',3,1.2,(x,y)=>`${x} e ${y} sono entrambi molto amari: rischio di durezza, serve un dolce o un grasso come ponte.`],
  ['acido',4,1.3,(x,y)=>`Doppia acidità forte (${x}, ${y}): bilancia con uno zucchero.`],
  ['p',3,1.2,(x,y)=>`Due ingredienti pungenti (${x}, ${y}): il bruciore si somma.`],
  ['salato',4,1.2,(x,y)=>`${x} e ${y} sono entrambi molto salati: rischio di eccesso di sale.`],
  ['t',3,1,(x,y)=>`Doppia astringenza: la bocca si asciuga.`],
];
export const CLF=[['mi','ff'],['mi','fl'],['mi','sd'],['fu','fl'],['fu','ff'],['ca','fl']];
export const CLADJ={mi:'marine',ff:'di frutta fresca',fl:'floreali',sd:'di spezie dolci',fu:'animali',ca:'carnose'};
export const FIX = {testa:'una scorza di agrumi o un\'erba fresca come garnish',cuore:'un frutto o un fiore',fondo:'una nota tostata, legnosa o un distillato invecchiato'};

export function score(A,B){
  // 1. ponte aromatico
  const c=kcos(A,B);
  const bridge=r05(clamp((c-0.08)/0.55*5));
  const shared=[];for(let i=0;i<NF;i++){const m=Math.min(A.ar[i],B.ar[i]);if(m>=2)shared.push([i,m]);}
  shared.sort((x,y)=>y[1]-x[1]);
  let why1,bridgeTxt='';
  if(shared.length){const names=shared.slice(0,3).map(s=>famName(s[0]));why1=`In comune: ${listIt(names)} (${FAM[shared[0][0]][4]}).`;
    bridgeTxt=names.length>1?`Condividono note di ${listIt(names)}: l'uno amplifica l'altro. Legame più forte: ${names[0]} (${FAM[shared[0][0]][4]}).`:`Condividono note di ${names[0]} (${FAM[shared[0][0]][4]}): l'uno amplifica l'altro.`;}
  else{let best=null;for(let i=0;i<NF;i++){if(A.ar[i]<2)continue;for(let j=0;j<NF;j++){if(i===j||B.ar[j]<2||!W[i][j])continue;const p=A.ar[i]*B.ar[j];if(!best||p>best[2])best=[i,j,p];}}
    if(best){why1=`Ponte indiretto: ${famName(best[0])} ↔ ${famName(best[1])}.`;bridgeTxt=`Ponte indiretto: le note di ${famName(best[0])} di ${A.name} si legano a quelle di ${famName(best[1])} di ${B.name}.`;}
    else why1='Nessuna famiglia aromatica in comune.';}
  // 2. bilanciamento
  const pos=[],clashes=[];
  for(const [X,Y] of [[A,B],[B,A]]){for(const [kx,ky,w,kind,txt] of RULES){const v=Math.min(tv(X,kx),tv(Y,ky))*w;if(v>=2)pos.push({v,kind,txt:txt(X.name,Y.name,Y)});}}
  if(A.t.umami>=3&&B.t.umami>=3){pos.push({v:Math.min(A.t.umami,B.t.umami)*0.8,kind:'sinergia',txt:`Sinergia umami tra ${A.name} e ${B.name}: glutammato e nucleotidi moltiplicano la sapidità.`});}
  for(const [k,th,w,txt] of CLASH){const a=tv(A,k),b=tv(B,k);if(a>=th&&b>=th)clashes.push({v:(Math.min(a,b)-th+1)*w,txt:txt(A.name,B.name)});}
  // stridore aromatico: famiglie che si respingono (salvo abbinamenti classici)
  let aroSum=0;
  if(!CLASSIC.has(pk(A,B))){let aro=null,sum=0;for(const [fx,fy] of CLF)for(const [P,Q] of [[A,B],[B,A]]){const v=Math.min(P.ar[FI[fx]],Q.ar[FI[fy]]);if(v>=2){sum+=v;if(!aro||v>aro.v)aro={v,P,Q,fx,fy};}}
    aroSum=sum;if(aro)clashes.push({v:sum*0.6,txt:`Le note ${CLADJ[aro.fx]} di ${aro.P.name} stridono con quelle ${CLADJ[aro.fy]} di ${aro.Q.name}.`});}
  const seen=new Set();const P=pos.sort((x,y)=>y.v-x.v).filter(p=>{if(seen.has(p.txt))return false;seen.add(p.txt);return true;});
  const clashSum=clashes.reduce((s,c)=>s+c.v,0);
  const balRaw=(P[0]?.v||0)+0.5*(P[1]?.v||0)-clashSum;
  const balance=r05(clamp(balRaw));
  const CP=P.filter(p=>p.kind==='contrasto');const SP=P.filter(p=>p.kind==='sinergia');
  const contrastV=clamp((CP[0]?.v||0)+0.4*(CP[1]?.v||0));
  const synergyV=SP[0]?.v||0;
  const why2=clashes.length?clashes[0].txt:(P[0]?P[0].txt:'Gusti neutri tra loro: nessun contrasto né sinergia evidente.');
  // 3. intensità
  const d=Math.abs(A.int-B.int);const inten=r05(clamp(5-d*1.25));
  const strong=A.int>=B.int?A:B,weak=strong===A?B:A;
  const why3=d===0?'Intensità simili: dialogano alla pari.':d===1?'Intensità vicine.':`${strong.name} è più intenso: ${weak.name} va in dose maggiore${d>=3?', o rischia di sparire':''}.`;
  // 4. piramide
  const cov={};let nlev=0;const missing=[];
  for(const lv of ['testa','cuore','fondo']){let s=0;for(const i of LEVEL[lv])s+=Math.max(A.ar[i],B.ar[i]);cov[lv]=s;if(s>=3)nlev++;else missing.push(lv);}
  const pyr=r05(Math.max(0,[0,2,3.5,5][nlev]-aroSum*0.3));
  const why4=aroSum>=3?`I livelli ci sono, ma le note si respingono invece di sostenersi.`:missing.length?`Coprono ${['nessun livello','un livello','due livelli','tre livelli'][nlev]}; manca ${missing.join(' e ')}: aggiungi ${missing.map(m=>FIX[m]).join(', oppure ')}.`:'Testa, cuore e fondo sono tutti coperti.';
  // 5. territorio e stagione
  let terr,why5;
  if(A.isSpirit||B.isSpirit){if(A.o&&A.o===B.o){terr=4.5;why5=`Stessa area d'origine (${ORIG[A.o]}).`;}else{terr=2.5;why5='Aree d\'origine diverse: un incontro tra mondi.';}}
  else{
    if(A.season&&B.season){const ov=A.season.filter(m=>B.season.includes(m));if(ov.length){terr=5;why5=`Stessa stagione (${monthsTxt(ov)}).`;}else{terr=1.5;why5='Stagioni diverse: uno dei due andrà usato conservato (sciroppo, essiccato, infuso).';}}
    else if(A.season||B.season){terr=3;const s=(A.season||B.season);why5=`Uno dei due è stagionale (${monthsTxt(s)}), l'altro sempre disponibile.`;}
    else{terr=2.5;why5='Entrambi disponibili tutto l\'anno.';}
    if(A.o&&A.o===B.o){terr=Math.min(5,terr+1.5);why5+=` Stessa area d'origine (${ORIG[A.o]}).`;}
  }
  // 6. tradizione
  const key=pk(A,B);let trad,why6,classic=null;
  if(CLASSIC.has(key)){trad=5;classic=CLASSIC.get(key);why6=classic?`Classico: ${classic}.`:'Abbinamento consolidato nella tradizione.';}
  else if(A.o&&A.o===B.o&&bridge>=3){trad=3;why6='Nessun classico noto, ma stessa area e note comuni: plausibile.';}
  else{trad=1.5;why6='Nessuna tradizione nota: terreno da esplorare, decide l\'assaggio.';}
  const lens=[
    {k:'Ponte aromatico',v:bridge,why:why1},
    {k:'Bilanciamento di gusto',v:balance,why:why2},
    {k:'Intensità e peso',v:inten,why:why3},
    {k:'Copertura piramide',v:pyr,why:why4},
    {k:A.isSpirit||B.isSpirit?'Territorio':'Territorio e stagione',v:terr,why:why5},
    {k:'Tradizione',v:trad,why:why6},
  ];
  const total=r05(lens.reduce((s,l)=>s+l.v,0));
  const concordV=Math.max(bridge,synergyV*0.9);
  const type=(contrastV>concordV&&contrastV>=2)?'contrasto':'concordanza';
  const other=type==='contrasto'?concordV:contrastV;
  const mixed=other>=3;
  // sintesi
  const s=[];
  const cTxt=CP[0]?.txt, sTxt=SP[0]?.txt;
  if(type==='concordanza'){if(bridgeTxt&&bridge>=1.5)s.push(bridgeTxt);if(synergyV>=2&&sTxt)s.push(sTxt);if(cTxt&&contrastV>=2.5)s.push('In più: '+cTxt);}
  else{s.push(cTxt);if(bridgeTxt&&bridge>=2)s.push(bridgeTxt);}
  if(!s.length)s.push(bridgeTxt||why2);
  if(clashes.length)s.push('Attenzione: '+clashes[0].txt.replace(/^(Le|Doppia|Due) /,m=>m.toLowerCase()));
  if(d>=3)s.push(why3);
  if(classic)s.push(`Classico: ${classic}.`);
  return {A,B,lens,total,type,mixed,summary:s.slice(0,4).join(' '),classic:CLASSIC.has(key),missing,ratioTxt:ratio(A,B),bridge,contrastV};
}
export function ratio(A,B){const d=A.int-B.int;if(d>=2)return `Parti da 1 parte di ${A.name} e ${d+1} di ${B.name}.`;if(d<=-2)return `Parti da ${1-d} parti di ${A.name} e 1 di ${B.name}.`;return 'Parti uguali, poi correggi all\'assaggio.';}
export function verdict(t){if(t>=24)return['forte','Abbinamento forte, da provare subito.'];if(t>=17)return['promettente','Promettente: va calibrato in dose o con un terzo ingrediente.'];if(t>=10)return['rischioso','Rischioso: serve un ingrediente ponte.'];return['sconsigliato','Sconsigliato, salvo un\'intenzione creativa dichiarata.'];}

export const cache=new Map();
export function S(A,B){const k=A.id+'>'+B.id;let r=cache.get(k);if(!r){r=score(A,B);cache.set(k,r);}return r;}

export function partnersOf(A,max=18){
  const all=FOODS.filter(f=>f!==A&&f.cat!==A.cat).map(f=>S(A,f)).filter(r=>r.total>=14).sort((x,y)=>y.total-x.total||y.bridge-x.bridge);
  const per={},out=[];for(const r of all){per[r.B.cat]=(per[r.B.cat]||0)+1;if(per[r.B.cat]>2)continue;out.push(r);if(out.length>=max)break;}
  return out;
}
export function spiritsOf(A,max=10){
  const all=SPIRITS.map(s=>S(A,s)).sort((x,y)=>y.total-x.total);
  const per={},out=[];for(const r of all){per[r.B.grp]=(per[r.B.grp]||0)+1;if(per[r.B.grp]>3)continue;out.push(r);if(out.length>=max)break;}
  return out;
}
export function bridgesFor(A,B,n=3){
  return FOODS.filter(c=>c!==A&&c!==B&&!c.isSpirit).map(c=>{const a=S(A,c).total,b=B.isSpirit?S(c,B).total:S(B,c).total;return {c,m:Math.min(a,b),a,b};}).sort((x,y)=>y.m-x.m).slice(0,n);
}
export function trioSpirits(A,B,n=3){
  return SPIRITS.filter(s=>s!==B).map(s=>{const a=S(A,s).total,b=S(B,s).total;return{s,m:Math.min(a,b),a,b};}).sort((x,y)=>y.m-x.m).slice(0,n);
}
export function howTo(A,sp){return `${CATS[A.cat][2].charAt(0).toUpperCase()+CATS[A.cat][2].slice(1)}. Struttura di partenza: ${SGROUP[sp.grp][1]}.`;}
