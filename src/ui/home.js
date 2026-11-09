// Prima pagina: più porte d'ingresso oltre alla ricerca.
// «Drink del giorno» e «Di stagione» cambiano col calendario; «Che voglia hai?» parte da un desiderio;
// «Rifai un classico» parte da un drink famoso. Tutti i calcoli usano le funzioni di dominio esistenti.
import { FOODS, FI, MESI, SBYNAME, TLABEL } from '../domain/core.js';
import { S as score, partnersOf } from '../domain/scoring.js';
import { STY, buildRecipe, coherence, styleFit, suggestBases, fmt } from '../domain/recipes.js';
import { esc, glassSVG } from './kit.js';
import { impronta, catIcon, famLbl } from './visual.js';

const MESE = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const VERSATILE = ['sour', 'highball', 'collins', 'spritz', 'negroni', 'oldfashioned', 'julep', 'martini', 'royale', 'sour_albume', 'flip'];
// ingredienti tecnici che non hanno senso come proposta di stagione o di desiderio
const SKIP = new Set(['aci', 'sali', 'dol', 'gra', 'bro', 'aff']);

const a = (I, k) => I.ar[FI[k]] || 0;
export const MOODS = [
  { id: 'fresco', w: 'Fresco e agrumato', sty: 'collins', f: I => a(I, 'ag') * 1.2 + a(I, 'er') + a(I, 've') * .8 + a(I, 'ff') * .8 + I.t.acido * .8 },
  { id: 'amaro', w: 'Amaro e secco', sty: 'negroni', f: I => I.t.amaro * 2 + a(I, 're') + a(I, 'er') * .5 - I.t.dolce * .5 },
  { id: 'morbido', w: 'Morbido e goloso', sty: 'flip', f: I => I.t.dolce * 1.2 + a(I, 'ft') + a(I, 'la') * 1.2 + a(I, 'sd') + a(I, 'to') * .6 },
  { id: 'fumo', w: 'Affumicato e tostato', sty: 'oldfashioned', f: I => a(I, 'af') * 2 + a(I, 'to') * 1.2 + a(I, 'te') * .6 },
  { id: 'spezie', w: 'Speziato', sty: 'tiki', f: I => a(I, 'sd') * 1.3 + a(I, 'sp') * 1.5 },
  { id: 'fiori', w: 'Floreale', sty: 'royale', f: I => a(I, 'fl') * 2 + a(I, 'ff') * .8 },
  { id: 'leggero', w: 'Leggero, poco alcol', sty: 'spritz', low: true, f: I => a(I, 'ff') + a(I, 'ag') + I.st.f * 1.2 + I.t.acido * .5 - I.int * .3 },
];
export const CLASSICS = [
  { w: 'Negroni', sty: 'negroni', base: 'Gin London Dry' },
  { w: 'Old Fashioned', sty: 'oldfashioned', base: 'Bourbon' },
  { w: 'Whisky Sour', sty: 'sour', base: 'Bourbon' },
  { w: 'Dry Martini', sty: 'martini', base: 'Gin London Dry' },
  { w: 'Spritz', sty: 'spritz', base: 'Aperitivo' },
  { w: 'Mojito', sty: 'julep', base: 'Rum bianco' },
  { w: 'Moscow Mule', sty: 'highball', base: 'Vodka' },
  { w: 'Tom Collins', sty: 'collins', base: 'Gin London Dry' },
].filter(c => STY[c.sty] && SBYNAME[c.base]);

// ingredienti che stanno bene con la base tipica di un classico: proposte per «il tuo Negroni con…»
export function classicTwists(c, n = 6) {
  const B = SBYNAME[c.base];
  return FOODS.filter(f => !SKIP.has(f.cat)).map(f => ({ f, t: score(f, B).total })).sort((x, y) => y.t - x.t).slice(0, n).map(x => x.f);
}

const today = () => { const d = new Date(); return { m: d.getMonth() + 1, day: Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5), y: d.getFullYear() }; };
export function seasonal(n = 10) {
  const { m, day } = today();
  const list = FOODS.filter(f => f.season && f.season.length <= 6 && f.season.includes(m) && !SKIP.has(f.cat))
    .sort((x, y) => x.season.length - y.season.length || y.int - x.int);
  // ruota l'ordine ogni giorno, così la riga cambia anche dentro lo stesso mese
  const k = list.length ? day % list.length : 0;
  return list.slice(k).concat(list.slice(0, k)).slice(0, n);
}
export function moodFoods(mood, n = 8) {
  return FOODS.filter(f => !SKIP.has(f.cat)).map(f => ({ f, v: mood.f(f) })).sort((x, y) => y.v - x.v).slice(0, n).map(x => x.f);
}
// stile che regge con una base data, nell'ordine dei più versatili
export function fittingStyle(ins, base, prefer) {
  const order = prefer ? [prefer, ...VERSATILE.filter(x => x !== prefer)] : VERSATILE;
  return order.find(id => STY[id] && styleFit(base, id).ok && !coherence(ins, id, base).block.length) || null;
}
// drink del giorno: un ingrediente di stagione e il suo compagno migliore, scelti in base alla data
const DRINKY = new Set(['agr', 'pom', 'dru', 'bos', 'tro', 'mel', 'sec', 'gus', 'erb', 'spe', 'bot', 'fio', 'mie', 'tea', 'caf', 'cac']);
export function drinkOfDay(drinkName) {
  const { day, m } = today();
  // al bancone si parte volentieri da frutta, erbe, fiori e spezie: prima quelli di stagione, poi quelli di tutto l'anno
  const pool = FOODS.filter(f => DRINKY.has(f.cat) && f.season && f.season.includes(m) && f.season.length <= 8);
  if (pool.length < 5) pool.push(...FOODS.filter(f => DRINKY.has(f.cat) && !pool.includes(f)));
  for (let k = 0; k < pool.length; k++) {
    const A = pool[(day + k) % pool.length];
    const B = partnersOf(A).map(r => r.B).find(x => !x.isSpirit && DRINKY.has(x.cat)) || partnersOf(A).map(r => r.B).find(x => !x.isSpirit && !SKIP.has(x.cat));
    if (!B) continue;
    const ins = [A, B]; const base = suggestBases(ins, null)[0]?.s; if (!base) continue;
    const sty = fittingStyle(ins, base); if (!sty) continue;
    const R = buildRecipe(ins, sty, 'classic', base);
    return { ins, sty, R, name: drinkName(R, ins) };
  }
  return null;
}

export function homeHTML(drinkName) {
  const { m } = today(); const dd = drinkOfDay(drinkName); const ss = seasonal(9);
  const day = dd ? `<article class="dod">
      <div class="dod-gl">${glassSVG(dd.sty, 104, STY[dd.sty].name, true)}</div>
      <div class="dod-b"><p class="eyebrow">Il drink di oggi</p><h3 class="dod-n">${esc(dd.name)}</h3>
        <p class="tiny muted">${esc(STY[dd.sty].name)} · ~${fmt(dd.R.abv)}% vol · con ${esc(dd.ins[0].name)} di stagione</p>
        <ul class="dod-spec">${dd.R.spec.slice(0, 5).map(l => `<li><span class="q">${l.drop ? '—' : fmt(l.ml) + ' ml'}</span>${esc(l.name)}</li>`).join('')}</ul>
        <div class="dod-acts"><button type="button" class="btn primary" data-home-drink="${dd.ins.map(I => I.id).join('+')}" data-sty="${dd.sty}">Preparalo</button><button type="button" class="btn ghost" data-home-open="${dd.ins[0].id}">Scopri ${esc(dd.ins[0].name)}</button></div></div>
    </article>` : '';
  const season = ss.length ? `<section class="hs" aria-labelledby="h-season"><h3 class="hs-h" id="h-season">Di stagione a ${MESE[m - 1]}</h3>
      <div class="seasonal">${ss.map(f => `<button type="button" class="sea" data-home-open="${f.id}">${impronta(f, 40, { label: false })}<span><b>${esc(f.name)}</b><small>${catIcon(f, 13)}${esc(TLABEL[f.dom].toLowerCase())}</small></span></button>`).join('')}</div></section>` : '';
  return `<div class="home-top">${day}${season}</div>
    <section class="hs" aria-labelledby="h-mood"><h3 class="hs-h" id="h-mood">Che voglia hai?</h3>
      <div class="moods" role="group" aria-label="Scegli un desiderio">${MOODS.map(x => `<button type="button" class="mood" data-mood="${x.id}" aria-pressed="false">${esc(x.w)}</button>`).join('')}</div>
      <div class="mood-out" id="moodOut" aria-live="polite" hidden></div></section>
    <section class="hs" aria-labelledby="h-cls"><h3 class="hs-h" id="h-cls">Rifai un classico, con quello che hai</h3>
      <div class="classics">${CLASSICS.map((c, i) => `<button type="button" class="cls" data-classic="${i}">${glassSVG(c.sty, 44, '')}<span>${esc(c.w)}</span></button>`).join('')}</div></section>`;
}

export function moodHTML(mood) {
  const fs = moodFoods(mood, 8);
  const ideas = fs.slice(0, 3).map(A => { const B = partnersOf(A).map(r => r.B).find(x => !x.isSpirit && !fs.slice(0, 3).includes(x) && !SKIP.has(x.cat)); return B ? [A, B] : null; }).filter(Boolean);
  const top = fs[0]; const fam = top ? top.ar.map((v, i) => [v, i]).sort((x, y) => y[0] - x[0])[0] : null;
  return `<p class="tiny muted">Gli ingredienti che più ${mood.id === 'leggero' ? 'si prestano a un drink leggero' : `sanno di «${esc(mood.w.toLowerCase())}»`}${fam && mood.id !== 'leggero' && mood.id !== 'amaro' && mood.id !== 'morbido' ? `, come ${esc(top.name)} (${esc(famLbl(fam[1]))})` : ''}. Toccane uno per esplorarlo.</p>
    <div class="mood-foods">${fs.map(f => `<button type="button" class="ex" data-home-open="${f.id}">${catIcon(f, 15)}${esc(f.name)}</button>`).join('')}</div>
    ${ideas.length ? `<p class="tiny muted">Oppure parti da una coppia, già pronta in un drink:</p><div class="mood-ideas">${ideas.map(p => `<button type="button" class="btn" data-home-drink="${p.map(I => I.id).join('+')}" data-sty="${mood.sty}"${mood.low ? ' data-low="1"' : ''}>${esc(p[0].name)} + ${esc(p[1].name)} →</button>`).join('')}</div>` : ''}`;
}
export { MESE, MESI };
