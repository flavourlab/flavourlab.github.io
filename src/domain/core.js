// Costanti, dati e oggetti di base. Nessuna dipendenza dal DOM.
import foodsData from '../../data/foods.json';
import spiritsData from '../../data/spirits.json';
import familiesData from '../../data/families.json';
import categoriesData from '../../data/categories.json';
import originsData from '../../data/origins.json';
import groupsData from '../../data/spirit-groups.json';
import classicsData from '../../data/classics.json';

export const FAM = familiesData.famiglie.map(f=>[f.id,f.nome,f.breve,f.livello,f.composti]);
export const AFF = familiesData.affinita;
export const ORIG = originsData;
export const CATS = Object.fromEntries(Object.entries(categoriesData).map(([k,v])=>[k,[v.nome,v.breve,v.estrazione]]));
export const ALLERG = Object.fromEntries(Object.entries(categoriesData).filter(([,v])=>v.allergene).map(([k,v])=>[k,v.allergene]));
export const SGROUP = Object.fromEntries(Object.entries(groupsData).map(([k,v])=>[k,[v.nome,v.struttura]]));

export const TYPELBL = {concordanza:'Concordanza',contrasto:'Contrasto'};
export const TK = ['dolce','salato','acido','umami','amaro'];           // ordine nei dati
export const TORDER = ['dolce','acido','amaro','umami','salato'];       // ordine sulla ruota
export const TLABEL = {dolce:'Dolce',salato:'Salato',acido:'Acido',umami:'Umami',amaro:'Amaro'};
export const TIE = ['umami','salato','acido','amaro','dolce'];
export const MESI = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
export const FI = {}; FAM.forEach((f,i)=>FI[f[0]]=i);
export const NF = FAM.length;
export const W = Array.from({length:NF},(_,i)=>Array.from({length:NF},(_,j)=>i===j?1:0));
AFF.forEach(([a,b])=>{W[FI[a]][FI[b]]=0.45;W[FI[b]][FI[a]]=0.45;});
export const LEVEL = {testa:[],cuore:[],fondo:[]}; FAM.forEach((f,i)=>LEVEL[f[3]].push(i));

export const clamp=(v,a=0,b=5)=>Math.max(a,Math.min(b,v));
export const r05=v=>Math.round(v*2)/2;
export const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

export function dominant(t){let best=null;for(const k of TIE){if(best===null||t[k]>t[best])best=k;}return best;}
export function selfNorm(v){let s=0;for(let i=0;i<NF;i++){if(!v[i])continue;for(let j=0;j<NF;j++){if(v[j]&&W[i][j])s+=v[i]*v[j]*W[i][j];}}return Math.sqrt(s);}

export const toItem=(o,isSpirit)=>{const t={...o.gusti};const s=o.struttura;
  const ar=FAM.map(f=>o.aromi[f[0]]||0);
  const it={name:o.nome,cat:o.categoria||null,grp:o.gruppo||null,ex:o.esempi||'',t,st:{g:s.grassezza,p:s.piccantezza,t:s.astringenza,f:s.freschezza},int:o.intensita,season:isSpirit?null:parseSeason(o.stagione),o:o.origine||'',ar,note:o.nota||'',isSpirit};
  it.id=(isSpirit?'s-':'')+slug(it.name);it.dom=dominant(it.t);it.n=selfNorm(it.ar);return it;};
export function parseSeason(s){if(!s)return null;const [a,b]=s.split('-').map(Number);const m=[];let x=a;for(let i=0;i<12;i++){m.push(x);if(x===b)break;x=x%12+1;}return m;}
export const FOODS = foodsData.map(o=>toItem(o,false));
export const SPIRITS = spiritsData.map(o=>toItem(o,true));
export const BYNAME = {}; FOODS.forEach(f=>BYNAME[f.name]=f);
export const SBYNAME = {}; SPIRITS.forEach(s=>SBYNAME[s.name]=s);
export const BYID = {}; FOODS.forEach(f=>BYID[f.id]=f); SPIRITS.forEach(s=>BYID[s.id]=s);

export const CLASSIC = new Map();
export function pk(A,B){return A.id<B.id?A.id+'|'+B.id:B.id+'|'+A.id;}
export const MISSING=[];
for(const [list,isSp] of [[classicsData.alimenti,false],[classicsData.alcolici,true]])for(const c of list){const A=BYNAME[c.a],B=isSp?SBYNAME[c.b]:BYNAME[c.b];if(!A||!B){MISSING.push(c);continue;}CLASSIC.set(pk(A,B),c.nota||'');}

