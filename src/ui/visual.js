// Linguaggio visivo della revisione 3: impronta aromatica e icone delle categorie.
// Tutto è calcolato dai dati esistenti; nessun valore di dominio cambia.
import { FAM, TORDER, TLABEL, CATS } from '../domain/core.js';

// ---------- impronta aromatica ----------
// Al centro il gusto prevalente; un anello con i cinque gusti; intorno diciotto petali, uno per famiglia di profumi.
// I petali sono ordinati per livello: note fresche in alto a destra, centrali in basso, profonde a sinistra.
// Così due ingredienti simili hanno forme simili, e le famiglie in comune si possono accendere.
const LVORD = ['testa', 'cuore', 'fondo'];
export const PETALS = LVORD.flatMap(lv => FAM.map((f, i) => [f, i]).filter(([f]) => f[3] === lv).map(([, i]) => i));
const GAP = 7; // gradi tra un livello e l'altro
const STEP = (360 - GAP * 3) / PETALS.length;
function petalAngle(k) { const lv = FAM[PETALS[k]][3]; return -90 + GAP / 2 + LVORD.indexOf(lv) * GAP + k * STEP + STEP / 2; }
const P = (r, a) => { const t = a * Math.PI / 180; return [+(r * Math.cos(t)).toFixed(2), +(r * Math.sin(t)).toFixed(2)]; };
function arc(r0, r1, a0, a1) {
  const [x0, y0] = P(r1, a0), [x1, y1] = P(r1, a1), [x2, y2] = P(r0, a1), [x3, y3] = P(r0, a0); const L = a1 - a0 > 180 ? 1 : 0;
  return `M${x0},${y0}A${r1},${r1} 0 ${L} 1 ${x1},${y1}L${x2},${y2}A${r0},${r0} 0 ${L} 0 ${x3},${y3}Z`;
}
// famiglie in comune (stessa soglia usata nelle spiegazioni: almeno 2 su 5 in entrambi)
export function sharedFams(A, B, th = 2) { const out = []; for (let i = 0; i < FAM.length; i++) { const m = Math.min(A.ar[i], B.ar[i]); if (m >= th) out.push([i, m]); } return out.sort((x, y) => y[1] - x[1]).map(x => x[0]); }
export const famLbl = i => FAM[i][1].toLowerCase().replace('verde/erbaceo', 'verde').replace(/\/.*$/, '');

export function impronta(I, size = 40, { hi = null, label = true, cls = '' } = {}) {
  if (!I) return '';
  const hiSet = hi ? new Set(hi) : null;
  let h = '';
  // gusti
  TORDER.forEach((k, i) => {
    const a0 = -90 - 36 + i * 72 + 2, a1 = a0 + 68; const v = I.t[k] || 0;
    h += `<path d="${arc(13.5, 21, a0, a1)}" style="fill:var(--t-${k});opacity:${(0.12 + v * 0.176).toFixed(2)}"/>`;
  });
  // profumi
  PETALS.forEach((fi, k) => {
    const v = I.ar[fi] || 0; const a = petalAngle(k);
    if (!v) { const [x, y] = P(26, a); h += `<circle cx="${x}" cy="${y}" r="1.1" class="ip-z"/>`; return; }
    const [x0, y0] = P(25, a), [x1, y1] = P(25 + v * 4.4, a);
    const on = hiSet && hiSet.has(fi);
    h += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" class="ip-p${on ? ' on' : ''}${hiSet && !on ? ' off' : ''}"/>`;
  });
  h += I.isSpirit
    ? `<rect x="-6.5" y="-6.5" width="13" height="13" rx="1.5" transform="rotate(45)" class="ip-sp"/>`
    : `<circle r="8.5" style="fill:var(--t-${I.dom})"/>`;
  const fams = I.ar.map((v, i) => [v, i]).filter(x => x[0] >= 2).sort((a, b) => b[0] - a[0]).slice(0, 3).map(x => famLbl(x[1]));
  const aria = label ? ` role="img" aria-label="${I.isSpirit ? '' : `Gusto ${TLABEL[I.dom].toLowerCase()}`}${fams.length ? (I.isSpirit ? 'Sa di ' : ', sa di ') + fams.join(', ') : ''}"` : ' aria-hidden="true"';
  return `<svg class="ip ${cls}" width="${size}" height="${size}" viewBox="-50 -50 100 100"${aria}>${h}</svg>`;
}

// ---------- icone delle categorie (24×24, tratto) ----------
const IC = {
  citrus: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16z M12 6.5v11 M7.2 9.2l9.6 5.6 M7.2 14.8l9.6-5.6',
  apple: 'M12 7.5c-2-1.6-6.5-1.2-6.5 3.8 0 4.2 3 8.7 6.5 8.7s6.5-4.5 6.5-8.7c0-5-4.5-5.4-6.5-3.8z M12 7.5c0-2.1.9-3.6 2.4-4.2 M12.6 5.6c1.6-1.1 3.4-.6 3.9.6-1.4.8-2.8.6-3.9-.6z',
  berry: 'M9 11.3a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 1 0 0-6.4z M15 11.3a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 1 0 0-6.4z M12 6.2a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 1 0 0-6.4z M12 6.2V3.5',
  pineapple: 'M12 9.2c2.6 0 4.6 2.6 4.6 5.9S14.6 21 12 21s-4.6-2.6-4.6-5.9S9.4 9.2 12 9.2z M12 9.2 9.3 3.6 M12 9.2V2.8 M12 9.2l2.7-5.6 M9.2 12.4l5.6 5.6 M14.8 12.4l-5.6 5.6',
  grapes: 'M9 8.6a2 2 0 1 0 0 4a2 2 0 1 0 0-4z M13 8.6a2 2 0 1 0 0 4a2 2 0 1 0 0-4z M17 8.6a2 2 0 1 0 0 4a2 2 0 1 0 0-4z M11 12.2a2 2 0 1 0 0 4a2 2 0 1 0 0-4z M15 12.2a2 2 0 1 0 0 4a2 2 0 1 0 0-4z M13 15.8a2 2 0 1 0 0 4a2 2 0 1 0 0-4z M13 8.6c0-2.4 1-4 3-5',
  dried: 'M6 16c-2-3 0-8 4-10s8-1 9 2-1 8-5 10-6 1-8-2z M9 9c1 2 1 4 0 6 M13 8c1 2 1 5-.5 8',
  nut: 'M12 5.5c3.4 0 6 3.1 6 7s-2.6 7-6 7-6-3.1-6-7 2.6-7 6-7z M12 5.5v14 M9 10c1 .9 1 2.2 0 3.1 M15 10c-1 .9-1 2.2 0 3.1 M9 15c1 .7 1 1.6 0 2.2 M15 15c-1 .7-1 1.6 0 2.2',
  leaf: 'M5 19C5 9.5 10.5 4.5 19 5c.6 8.5-4.4 14-14 14z M5 19l9-9 M9.5 14.5h3.2 M11.5 12.5V9.7',
  herb: 'M12 21V4.5 M12 9c-3 0-4.3-2-4.3-4.2 3 0 4.3 2 4.3 4.2z M12 9c3 0 4.3-2 4.3-4.2-3 0-4.3 2-4.3 4.2z M12 15c-3 0-4.3-2-4.3-4.2 3 0 4.3 2 4.3 4.2z M12 15c3 0 4.3-2 4.3-4.2-3 0-4.3 2-4.3 4.2z',
  carrot: 'M7.5 8.5h9L12 21z M12 8.5V3.8 M12 6.3 9.4 3.8 M12 6.3l2.6-2.5 M9.8 12h2.4 M10.8 15.5h1.8',
  sprout: 'M12 21V11 M12 13.5c-4 0-6-3-6-6.3 4 0 6 3 6 6.3z M12 11c0-4 2-6.3 6-6.3 0 4-2 6.3-6 6.3z M8 21h8',
  garlic: 'M12 3.5c0 3-6 5.7-6 11a6 5.5 0 0 0 12 0c0-5.3-6-8-6-11z M12 8.5V20 M9.2 11.5c-.2 3.8.8 6.6 2.8 8.5 M14.8 11.5c.2 3.8-.8 6.6-2.8 8.5',
  broccoli: 'M7.8 13.2a3 3 0 1 1 .9-5.8 3.6 3.6 0 0 1 6.6-.5 3 3 0 1 1 .9 6.3z M10 13.2l.9 7.8h2.2l.9-7.8 M12 13.2v3',
  tomato: 'M12 7.8a7 7 0 1 0 0 14a7 7 0 1 0 0-14z M8.8 8.5 12 10l3.2-1.5 M12 10V4.5 M10.3 5.2 12 4.5l1.7.7',
  zucchini: 'M5.2 17.8c-1.6-1.6 0-4.6 3.2-7.6S15 5 18 4.6c2-.2 2.6 1.4 1.6 3.1-1 1.9-3.6 4.6-6.6 7.2s-6.2 4.5-7.8 2.9z M17.4 4.8l1.7-1.6 M8.5 14.5l3.5-3 M11 16l3-2.5',
  pod: 'M4 16.5c3-1 6-6 10-8.3s6.3-2 6.3.2-3 6-8 8.1-8.3 2.2-8.3 0z M9.3 13.6a1.6 1.6 0 1 0 0 .1z M12.9 11.3a1.6 1.6 0 1 0 0 .1z M16.4 9.3a1.6 1.6 0 1 0 0 .1z',
  mushroom: 'M4 12.5a8 7.5 0 0 1 16 0z M9.5 12.5v6a2.5 2 0 0 0 5 0v-6 M9 7.5h.01 M14.5 8.5h.01',
  seaweed: 'M7 21c-2-4 2-6.2 0-10s2-6 0-8 M12.5 21c-2-4 2-6.2 0-10s2-6 0-8 M18 21c-1.6-3 1.4-5 0-8.4',
  star: 'M12 3.5l1.6 5.2 5.2-1.6-3.6 4 3.6 4-5.2-1.6L12 20.5l-1.6-5.2-5.2 1.6 3.6-4-3.6-4 5.2 1.6z M12 10.6a1.4 1.4 0 1 0 0 2.8a1.4 1.4 0 1 0 0-2.8z',
  juniper: 'M12 21V7.5 M12 12.5 7.8 9.4 M12 16l4.2-3.1 M12 9.5l3.2-3.2 M7.8 7.4a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6z M16.3 11.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6z M15.3 3.7a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6z',
  flower: 'M12 9.6a2.4 2.4 0 1 0 0 4.8a2.4 2.4 0 1 0 0-4.8z M12 9.6c-1.8-1.8-1.8-5 0-6 1.8 1 1.8 4.2 0 6z M14.3 11.3c1.1-2.3 4.1-3.3 5.4-1.6-1 1.8-4 2.6-5.4 1.6z M13.4 14c2.5.5 4.4 3 3.3 4.8-2-.2-3.8-2.6-3.3-4.8z M10.6 14c.5 2.2-1.3 4.6-3.3 4.8-1.1-1.8.8-4.3 3.3-4.8z M9.7 11.3c-1.4 1-4.4.2-5.4-1.6 1.3-1.7 4.3-.7 5.4 1.6z',
  wheat: 'M12 21V5.5 M12 9.5c-2-.5-3.1-2.1-3.1-4.2 2 .5 3.1 2.1 3.1 4.2z M12 9.5c2-.5 3.1-2.1 3.1-4.2-2 .5-3.1 2.1-3.1 4.2z M12 13.5c-2-.5-3.1-2.1-3.1-4.2 2 .5 3.1 2.1 3.1 4.2z M12 13.5c2-.5 3.1-2.1 3.1-4.2-2 .5-3.1 2.1-3.1 4.2z M12 17.5c-2-.5-3.1-2.1-3.1-4.2 2 .5 3.1 2.1 3.1 4.2z M12 17.5c2-.5 3.1-2.1 3.1-4.2-2 .5-3.1 2.1-3.1 4.2z',
  bread: 'M4 13a8 5 0 0 1 16 0v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z M8 10.6l1.2 2.2 M11.6 9.8l1.2 2.2 M15.2 10.6l1.2 2.2',
  milk: 'M9 3h6 M10 3v3l-3 4v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V10l-3-4V3 M7 13.5h10',
  cheese: 'M3 15 16 7l5 4v7H3z M3 15h18 M8 16.5a1 1 0 1 0 0 .1z M14 16.6a1.1 1.1 0 1 0 0 .1z M17 12.4a1 1 0 1 0 0 .1z',
  egg: 'M12 3c-4 0-7 6-7 11a7 7 0 0 0 14 0c0-5-3-11-7-11z',
  drumstick: 'M15 3.5a5.5 5.5 0 0 1 3.9 9.4c-1.5 1.5-3.8 1.9-5.7 1.1l-3.5 3.5a2 2 0 1 1-2.6-2.7l3.4-3.4c-.8-1.9-.4-4.2 1.1-5.7A5.5 5.5 0 0 1 15 3.5z',
  salame: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16z M9 9.5a1 1 0 1 0 0 .1z M14.2 8.6a.9.9 0 1 0 0 .1z M15.2 14a1 1 0 1 0 0 .1z M9.8 15a.9.9 0 1 0 0 .1z M12.2 12a.7.7 0 1 0 0 .1z',
  fish: 'M5 12c3-4 6.5-6 10-6s5.5 3 6 6c-.5 3-2.5 6-6 6s-7-2-10-6z M5 12 2 8.5v7z M16.5 10.7h.01',
  shell: 'M12 20 4 9.5a8 8 0 0 1 16 0z M12 20 8.3 6.6 M12 20V4.5 M12 20l3.7-13.4 M9.5 20.5h5',
  honey: 'M12 3l7 4v8l-7 4-7-4V7z M12 11v4.5 M12 17.5h.01',
  cubes: 'M5 12h6v6H5z M13 12h6v6h-6z M9 5.5h6v6H9z',
  drop: 'M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z M9 14.5a3 3 0 0 0 2.5 3',
  cacao: 'M12 3c4 2 6 6 6 9s-2 7-6 9c-4-2-6-6-6-9s2-7 6-9z M12 3v18 M8.7 6.2c-1 3.9-1 7.7 0 11.6 M15.3 6.2c1 3.9 1 7.7 0 11.6',
  bean: 'M7 17.4c-3-3-2-8.2 2-11.4s8.4-3.8 10-1-1 8.2-5 11.4-5 4-7 1z M7.8 16.4c2-2 3-4 4-6s3-4 5.2-5',
  cup: 'M5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z M17 10.8h1.4a2.1 2.1 0 0 1 0 4.2H17 M9 3c-1 1.5 1 2 0 3.5 M13 3c-1 1.5 1 2 0 3.5 M6 21.5h10',
  cruet: 'M10 3h4 M10.5 3v4L8 10v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9l-2.5-3V3 M8 13.5h8',
  jar: 'M8 3.5h8v2.5H8z M6 9a2.5 2.5 0 0 1 2-3h8a2.5 2.5 0 0 1 2 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z M10.2 11c-1 3-1 5.8.8 8 M13.8 11c1 3 1 5.8-.8 8',
  flask: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3 M7.3 15h9.4',
  salt: 'M8 9h8l-1.2 11H9.2z M8 9a4 4 0 0 1 8 0 M11 5.6h.01 M13 6.4h.01 M12 4.4h.01',
  bowl: 'M3 11h18a9 7 0 0 1-18 0z M8 3c-1 2 1 3 0 5 M12 3c-1 2 1 3 0 5 M16 3c-1 2 1 3 0 5 M9 21h6',
  smoke: 'M8 21c-3-3 0-6 0-9s-2-5 0-8 M13 21c-3-3 0-6 0-9s-2-5 0-8 M18 21c-2.2-2.2 0-4.4 0-6.6',
  bottle: 'M10 2.5h4v3.5l1.6 2.6V20a2 2 0 0 1-2 2h-3.2a2 2 0 0 1-2-2V8.6L10 6z M8.4 12.5h7.2',
};
export const CATICON = {
  agr: 'citrus', pom: 'apple', dru: 'apple', bos: 'berry', tro: 'pineapple', mel: 'grapes', sec: 'dried', gus: 'nut',
  fog: 'leaf', rad: 'carrot', all: 'garlic', cru: 'broccoli', sol: 'tomato', cuc: 'zucchini', ste: 'sprout', leg: 'pod',
  fun: 'mushroom', alg: 'seaweed', erb: 'herb', spe: 'star', bot: 'juniper', fio: 'flower', cer: 'wheat', for: 'bread',
  lat: 'milk', ffr: 'cheese', crf: 'cheese', crl: 'cheese', dur: 'cheese', blu: 'cheese', fpa: 'cheese', uov: 'egg',
  car: 'drumstick', sel: 'drumstick', salu: 'salame', pes: 'fish', cro: 'shell', itt: 'fish', mie: 'honey', gra: 'drop',
  dol: 'cubes', cac: 'cacao', caf: 'bean', tea: 'cup', ace: 'cruet', cfe: 'cruet', vfe: 'jar', bfe: 'cup', aci: 'flask',
  sali: 'salt', con: 'jar', bro: 'bowl', aff: 'smoke',
};
export function icon(name, size = 18, cls = '') {
  const d = IC[name]; if (!d) return '';
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
}
export const catIcon = (I, size = 18) => icon(I.isSpirit ? 'bottle' : (CATICON[I.cat] || 'leaf'), size);
export const catIconOf = (cat, size = 18) => icon(CATICON[cat] || 'leaf', size);
export const ICONS = IC;
export { CATS };
