// Flavour Lab · sezione «Capire»
// La scienza dietro il metodo: molecole delle diciotto famiglie di profumi, gusti, sensazioni in bocca,
// perché due ingredienti si abbinano e come calcola l'app. Legge il motore in sola lettura: nessun calcolo cambia.
// I testi stanno in data/scienza.json; le molecole di ogni famiglia sono quelle di data/families.json.
import SCI from '../../data/scienza.json';
import { AFF, BYID, BYNAME, CLASSIC, FAM, FI, FOODS, LEVEL, SPIRITS, TLABEL, TORDER, W, pk } from '../domain/core.js';
import { CLASH, CLF, CLADJ, RULES, S as score, kcos, listIt, tv } from '../domain/scoring.js';
import { PETALS, famLbl } from './visual.js';
import { $, esc, cap, num, mark, meter, relTag, makeCombo, tcol, calm } from './kit.js';

const LV = { testa: 'Note fresche', cuore: 'Note centrali', fondo: 'Note profonde' };
const LVW = { testa: 'testa', cuore: 'cuore', fondo: 'fondo' };
const LVD = { testa: 'le più volatili: arrivano per prime e svaniscono presto', cuore: 'volatilità intermedia: il corpo del profumo', fondo: 'le meno volatili: arrivano dopo e restano a lungo' };
const BOCCA = { g: 'grassezza', p: 'piccantezza', t: 'astringenza', f: 'freschezza' };
const famName = i => cap(famLbl(i));
const famFull = i => FAM[i][1];
const ruleKey = (a, b) => `${a}|${b}`;

export const CAPIRE_TOC = [['sci-sapore', 'Il sapore'], ['sci-coppie', 'Perché si abbinano'], ['sci-profumi', 'Profumi e molecole'], ['sci-gusti', 'I gusti'], ['sci-bocca', 'In bocca'], ['sci-metodo', 'Il metodo'], ['sci-fonti', 'Fonti']];

// ---------- stato ----------
const C = { fam: 'ag', A: null, B: null, built: false, ctx: null };
const PAIR_EX = [['Fragola', 'Basilico'], ['Pomodoro', 'Fragola'], ['Cioccolato fondente', 'Arancia'], ['Gorgonzola', 'Pera'], ['Ostrica', 'Cetriolo']]
  .map(p => p.map(n => BYNAME[n])).filter(p => p[0] && p[1]);

// ---------- testi fissi ----------
function tagLiv(k) { return `<span class="sci-ev sci-ev-${k}" title="${esc(SCI.livelli[k])}">${esc(SCI.livelli[k])}</span>`; }

function introHTML() {
  const cells = [
    ['Gusto', 'La lingua', 'Cinque qualità: dolce, acido, salato, amaro, umami. Recettori specifici nelle papille gustative.'],
    ['Olfatto', 'Il naso, anche dalla bocca', 'Le molecole volatili salgono al naso dalla gola mentre mastichiamo (olfatto retronasale). Da qui viene gran parte di ciò che chiamiamo «sapore».'],
    ['Chemestesi', 'Il nervo trigemino', 'Calore del peperoncino, fresco della menta, pizzicore della senape: recettori del dolore e della temperatura, non del gusto.'],
    ['Tatto', 'La bocca come superficie', 'Grassezza, astringenza, corpo, bollicine: sensazioni meccaniche che cambiano la percezione di tutto il resto.'],
  ];
  return `<section class="sci-sec" id="sci-sapore" aria-labelledby="sci-h-sapore">
    <div class="sci-h"><span class="sci-n">1</span><h2 id="sci-h-sapore">Il sapore nasce da quattro sensi</h2></div>
    <p class="sci-p">Quello che nel linguaggio comune chiamiamo «sapore» è una sintesi che il cervello costruisce a partire da segnali diversi. Con il naso chiuso molti alimenti diventano difficili da riconoscere: il gusto da solo distingue poche qualità, l'olfatto migliaia di sfumature.</p>
    <ol class="sci-four">${cells.map((c, i) => `<li><span class="sci-four-n">${i + 1}</span><b>${c[0]}</b><small>${c[1]}</small><p>${c[2]}</p></li>`).join('')}</ol>
    <p class="sci-p">Flavour Lab descrive ogni ingrediente proprio su questi assi: <b>cinque gusti</b>, <b>diciotto famiglie di profumi</b> e <b>quattro sensazioni in bocca</b>, tutti su una scala da 0 a 5.</p>
  </section>`;
}

function pairIntroHTML() {
  return `<div class="sci-cards3">
      <div><h3><span aria-hidden="true">≈</span> Si somigliano</h3><p>Ingredienti che condividono famiglie di profumi tendono a rinforzarsi a vicenda. È l'ipotesi dei composti condivisi, resa popolare dallo chef Heston Blumenthal e dalla società Foodpairing.</p></div>
      <div><h3><span aria-hidden="true">⇄</span> Si bilanciano</h3><p>Un gusto ne compensa un altro: l'acido con il dolce, il sale con l'amaro, il grasso con il piccante. Qui contano le interazioni tra i gusti e le sensazioni in bocca.</p></div>
      <div><h3><span aria-hidden="true">△</span> Si completano</h3><p>Un abbinamento è più ricco quando copre note fresche, centrali e profonde, e quando le intensità sono comparabili: nessuno dei due copre l'altro.</p></div>
    </div>
    <details class="sci-more"><summary>Che cosa dicono gli studi sull'ipotesi dei composti condivisi</summary>
      <p>Nel 2011 Ahn e colleghi hanno analizzato circa 56.000 ricette e i composti aromatici di 381 ingredienti. Le cucine nordamericana ed europea occidentale tendono ad accostare ingredienti che condividono molti composti; quelle dell'Asia orientale, al contrario, tendono a evitarlo. La somiglianza chimica è quindi una tendenza di alcune tradizioni, non una legge universale.</p>
      <p>C'è anche un limite chimico: una molecola conta solo se la sua concentrazione supera la soglia di percezione. Due ingredienti possono condividere una molecola che in uno dei due è presente in tracce non percepibili. Per questo Flavour Lab ragiona per famiglie percepite, non per elenchi di molecole, e affianca alla somiglianza il bilanciamento dei gusti, la struttura e la tradizione.</p>
    </details>`;
}

function famSectionHTML() {
  return `<section class="sci-sec" id="sci-profumi" aria-labelledby="sci-h-profumi">
    <div class="sci-h"><span class="sci-n">3</span><h2 id="sci-h-profumi">Le diciotto famiglie di profumi</h2></div>
    <p class="sci-p">Un alimento contiene da decine a centinaia di molecole volatili, ma solo alcune superano la soglia di percezione e ne definiscono il carattere. Flavour Lab le raggruppa in diciotto famiglie, ordinate come nella profumeria in <b>note fresche</b>, <b>centrali</b> e <b>profonde</b> secondo la loro volatilità. Le linee collegano le famiglie che il metodo considera <b>affini</b>: si richiamano anche senza molecole in comune.</p>
    <div class="sci-fam">
      <div class="sci-netbox"><svg class="sci-net" id="sciNet" viewBox="-300 -262 600 524" role="group" aria-label="Le diciotto famiglie di profumi e le loro affinità"></svg>
        <p class="tiny muted sci-netcap">Scegli una famiglia: si accendono le affini. Frecce per spostarsi, Invio per scegliere.</p></div>
      <div class="sci-famchips" id="sciChips"></div>
      <article class="panel sci-famcard" id="sciFam" aria-live="polite"></article>
    </div>
  </section>`;
}

function tasteSectionHTML() {
  const rules = [['acido', 'g'], ['acido', 'dolce'], ['amaro', 'dolce'], ['salato', 'dolce'], ['salato', 'amaro'], ['umami', 'salato'], ['acido', 'umami'], ['g', 'p'], ['dolce', 'p'], ['f', 'p'], ['g', 't']];
  const nm = k => (TLABEL[k] || cap(BOCCA[k] || k));
  return `<section class="sci-sec" id="sci-gusti" aria-labelledby="sci-h-gusti">
    <div class="sci-h"><span class="sci-n">4</span><h2 id="sci-h-gusti">I cinque gusti</h2></div>
    <p class="sci-p">Il gusto si percepisce con cellule specializzate raccolte nelle papille della lingua e del palato. Ognuna delle cinque qualità ha un proprio meccanismo di riconoscimento.</p>
    <div class="sci-tastes">${TORDER.map(k => { const g = SCI.gusti[k]; return `<article class="sci-taste" style="--tc:${tcol(k)}"><h3>${mark({ dom: k })}${TLABEL[k]}</h3>
      <dl><dt>Che cosa lo provoca</dt><dd>${esc(g.stimolo)}</dd><dt>Come lo riconosciamo</dt><dd>${esc(g.recettore)}</dd><dt>A che cosa serve in un abbinamento</dt><dd>${esc(g.ruolo)}</dd></dl></article>`; }).join('')}</div>
    <h3 class="sci-h3" id="sci-interazioni">Come interagiscono</h3>
    <p class="sci-p">Due gusti nella stessa bocca non si sommano semplicemente: spesso uno attenua o esalta l'altro. Queste sono le interazioni che Flavour Lab usa per giudicare l'equilibrio, con il grado di solidità di ciascuna.</p>
    <p class="sci-legend">${Object.keys(SCI.livelli).map(tagLiv).join('')}</p>
    <ul class="sci-rules">${rules.map(([a, b]) => { const r = SCI.regole[ruleKey(a, b)]; return `<li><b>${esc(nm(a))} <span aria-hidden="true">×</span><span class="sr">e</span> ${esc(nm(b).toLowerCase())}</b>${tagLiv(r.liv)}<p>${esc(r.t)}</p></li>`; }).join('')}
      <li><b>Glutammato <span aria-hidden="true">×</span><span class="sr">e</span> nucleotidi</b>${tagLiv(SCI.regole.sinergia.liv)}<p>${esc(SCI.regole.sinergia.t)}</p></li>
      <li><b>Due tratti uguali e forti</b>${tagLiv(SCI.regole.somma.liv)}<p>${esc(SCI.regole.somma.t)}</p></li>
      <li><b>Profumi che si respingono</b>${tagLiv(SCI.regole.stridore.liv)}<p>${esc(SCI.regole.stridore.t)}</p></li></ul>
  </section>`;
}

function mouthSectionHTML() {
  return `<section class="sci-sec" id="sci-bocca" aria-labelledby="sci-h-bocca">
    <div class="sci-h"><span class="sci-n">5</span><h2 id="sci-h-bocca">Oltre il gusto: le sensazioni in bocca</h2></div>
    <p class="sci-p">Quattro sensazioni non appartengono né al gusto né all'olfatto, ma cambiano profondamente il modo in cui percepiamo un abbinamento.</p>
    <div class="sci-mouth">${['g', 'p', 't', 'f'].map(k => { const b = SCI.bocca[k]; return `<article><h3>${esc(b.nome)}</h3><p>${esc(b.t)}</p></article>`; }).join('')}</div>
  </section>`;
}

function methodSectionHTML() {
  const lenses = [
    ['Ponte aromatico', 'Ogni ingrediente è un elenco di diciotto valori, uno per famiglia. Si calcola quanto i due elenchi puntano nella stessa direzione (somiglianza del coseno), contando le famiglie affini al 45% di una famiglia in comune; il risultato si riporta su una scala da 0 a 5.'],
    ['Bilanciamento di gusto', 'Si cercano le interazioni descritte sopra: conta la più forte, più metà della seconda. Si sottraggono le somme di tratti forti e i profumi che si respingono.'],
    ['Intensità e peso', 'Parte da 5 e perde 1,25 punti per ogni grado di differenza di intensità tra i due ingredienti.'],
    ['Copertura della piramide', 'Un livello (fresche, centrali, profonde) è coperto quando la somma dei valori più alti dei due ingredienti arriva almeno a 3. Nessun livello vale 0, uno 2, due 3,5, tre 5.'],
    ['Territorio e stagione', 'Stessa stagione 5, stagioni diverse 1,5, uno solo stagionale 3; la stessa area d\'origine aggiunge 1,5 punti.'],
    ['Tradizione', '5 se la coppia è tra gli abbinamenti classici della cucina o del bancone, 3 se è plausibile per area e profumi, 1,5 negli altri casi.'],
  ];
  const limits = [
    ['Sono stime, non misure', 'I valori da 0 a 5 sono valutazioni sensoriali ricavate dalla letteratura, non risultati di analisi strumentali come la gascromatografia-olfattometria.'],
    ['Una famiglia non è una molecola', 'Due ingredienti «agrumati» possono condividere la famiglia senza condividere le stesse molecole. Le famiglie semplificano una chimica molto più varia.'],
    ['Conta la soglia, non la presenza', 'L\'impatto di una molecola dipende dal rapporto tra la sua concentrazione e la soglia di percezione: molte molecole presenti non si sentono affatto.'],
    ['La preparazione cambia tutto', 'Cottura, temperatura, alcol, grasso e diluizione modificano quali molecole si liberano e in che misura. Il profilo descrive l\'ingrediente crudo o nella sua forma più comune.'],
    ['Ogni palato è diverso', 'Varianti genetiche dei recettori, come quelle per alcuni amari o per l\'odore del coriandolo, ed esperienza culturale cambiano ciò che una persona percepisce e apprezza.'],
    ['Il punteggio è una sintesi', 'Pesi e soglie sono scelte del metodo, verificate sugli abbinamenti classici e su quelli notoriamente difficili. Indicano dove guardare; l\'ultima parola spetta all\'assaggio.'],
  ];
  return `<section class="sci-sec" id="sci-metodo" aria-labelledby="sci-h-metodo">
    <div class="sci-h"><span class="sci-n">6</span><h2 id="sci-h-metodo">Come calcola Flavour Lab, e i suoi limiti</h2></div>
    <p class="sci-p">Il giudizio di una coppia somma sei criteri, ciascuno da 0 a 5, per un massimo di 30. Da 24 il giudizio è <b>ottimo</b>, da 17 <b>buono</b>, da 10 <b>azzardato</b>, sotto <b>da evitare</b>.</p>
    <ol class="sci-lenses">${lenses.map(l => `<li><b>${esc(l[0])}</b><p>${esc(l[1])}</p></li>`).join('')}</ol>
    <h3 class="sci-h3">Che cosa il metodo non può dire</h3>
    <ul class="sci-limits">${limits.map(l => `<li><b>${esc(l[0])}</b><p>${esc(l[1])}</p></li>`).join('')}</ul>
  </section>`;
}

function sourcesHTML() {
  const groups = [...new Set(SCI.fonti.map(f => f.g))];
  return `<section class="sci-sec" id="sci-fonti" aria-labelledby="sci-h-fonti">
    <div class="sci-h"><span class="sci-n">7</span><h2 id="sci-h-fonti">Fonti</h2></div>
    <p class="sci-p">I testi di questa sezione sintetizzano le fonti su cui è costruito il metodo e alcuni studi di riferimento sulla percezione del gusto. I dati di Flavour Lab non sono copiati da queste opere.</p>
    <div class="sci-src">${groups.map(g => `<div><h3>${esc(g)}</h3><ul>${SCI.fonti.filter(f => f.g === g).map(f => `<li><span>${esc(f.a)}</span>, <cite>${esc(f.t)}</cite>. ${esc(f.x)}.</li>`).join('')}</ul></div>`).join('')}</div>
  </section>`;
}

// ---------- rete delle famiglie ----------
const GAP = 12, STEP = (360 - GAP * 3) / PETALS.length, LVORD = ['testa', 'cuore', 'fondo'];
const angOf = k => { const lv = FAM[PETALS[k]][3]; return -90 + GAP / 2 + LVORD.indexOf(lv) * GAP + k * STEP + STEP / 2; };
const P = (r, a) => { const t = a * Math.PI / 180; return [+(r * Math.cos(t)).toFixed(1), +(r * Math.sin(t)).toFixed(1)]; };
const NR = 150;
const ANG = {}; PETALS.forEach((fi, k) => ANG[fi] = angOf(k));
const neigh = i => AFF.filter(([a, b]) => FI[a] === i || FI[b] === i).map(([a, b]) => FI[a] === i ? FI[b] : FI[a]);

function netSVG() {
  const sel = FI[C.fam], nb = new Set(neigh(sel));
  let h = '';
  // archi dei tre livelli
  LVORD.forEach(lv => {
    const ks = PETALS.map((fi, k) => [fi, k]).filter(([fi]) => FAM[fi][3] === lv).map(x => x[1]);
    const a0 = angOf(ks[0]) - STEP / 2 + 1, a1 = angOf(ks[ks.length - 1]) + STEP / 2 - 1, r = NR + 22;
    const [x0, y0] = P(r, a0), [x1, y1] = P(r, a1);
    h += `<path d="M${x0},${y0}A${r},${r} 0 0 1 ${x1},${y1}" class="sci-lv"/>`;
    const am = (a0 + a1) / 2, [lx, ly] = P(NR - 40, am);
    h += `<text class="sci-lvt" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle">${LV[lv].replace('Note ', '')}</text>`;
  });
  AFF.forEach(([a, b]) => {
    const i = FI[a], j = FI[b]; const on = i === sel || j === sel;
    const [x0, y0] = P(NR, ANG[i]), [x1, y1] = P(NR, ANG[j]); const cx = (x0 + x1) * 0.3, cy = (y0 + y1) * 0.3;
    h += `<path d="M${x0},${y0}Q${cx},${cy} ${x1},${y1}" class="sci-edge${on ? ' on' : ''}"/>`;
  });
  PETALS.forEach(i => {
    const a = ANG[i], [x, y] = P(NR, a), [lx, ly] = P(NR + 16, a);
    const c = Math.cos(a * Math.PI / 180), sn = Math.sin(a * Math.PI / 180), anc = Math.abs(c) < 0.04 ? 'middle' : c > 0 ? 'start' : 'end';
    const dy = Math.abs(c) < 0.35 ? (sn > 0 ? 16 : -8) : 5;
    const cls = i === sel ? ' sel' : nb.has(i) ? ' nb' : '';
    h += `<g class="sci-node${cls}" data-fam="${FAM[i][0]}" tabindex="${i === sel ? 0 : -1}" role="button" aria-pressed="${i === sel}" aria-label="${esc(famFull(i))}, ${LV[FAM[i][3]].toLowerCase()}">
      <circle cx="${x}" cy="${y}" r="16" class="hit"/><circle cx="${x}" cy="${y}" r="${i === sel ? 9 : 7}"/>
      <text x="${lx}" y="${ly + dy}" text-anchor="${anc}">${esc(famName(i))}</text></g>`;
  });
  return h;
}

function chipsHTML() {
  const sel = FI[C.fam];
  return LVORD.map(lv => `<div class="sci-chg"><span class="tiny muted">${LV[lv]}</span><div>${LEVEL[lv].map(i => `<button type="button" class="ex" data-fam="${FAM[i][0]}" aria-pressed="${i === sel}">${esc(famName(i))}</button>`).join('')}</div></div>`).join('');
}

function topItems(i, pool, n, th = 3) { return pool.filter(x => x.ar[i] >= th).sort((a, b) => b.ar[i] - a.ar[i] || a.name.localeCompare(b.name, 'it')).slice(0, n); }

function famCardHTML() {
  const i = FI[C.fam], f = FAM[i], e = SCI.famiglie[f[0]];
  const foods = topItems(i, FOODS, 10), sps = topItems(i, SPIRITS, 5);
  const nb = neigh(i);
  return `<p class="sci-kick">${LV[f[3]]} · ${LVW[f[3]]} <span class="muted">— ${LVD[f[3]]}</span></p>
    <h3 class="sci-famname">${esc(f[1])}</h3>
    <p class="sci-lead">${esc(e.sintesi)}</p>
    <h4>Le molecole principali</h4>
    <dl class="sci-mol">${e.molecole.map(m => `<div><dt>${esc(cap(m.n))}</dt><dd>${esc(m.t)}</dd></div>`).join('')}</dl>
    <h4>Come si forma</h4><p>${esc(e.origine)}</p>
    <h4>Al bancone</h4><p>${esc(e.pratica)}</p>
    ${e.nota ? `<p class="sci-note"><b>Nota.</b> ${esc(e.nota)}</p>` : ''}
    <h4>Dove si trova</h4>
    ${foods.length ? `<div class="sci-where">${foods.map(x => `<button type="button" class="ex" data-open-food="${x.id}">${mark(x)}${esc(x.name)}<small>${x.ar[i]}/5</small></button>`).join('')}</div>` : '<p class="muted">Nessun alimento la esprime in modo marcato.</p>'}
    ${sps.length ? `<p class="tiny muted sci-sp">Da bere: ${sps.map(x => esc(x.name)).join(', ')}.</p>` : ''}
    <h4>Famiglie affini</h4>
    <div class="sci-where">${nb.map(j => `<button type="button" class="ex" data-fam="${FAM[j][0]}">${esc(famName(j))}</button>`).join('')}</div>
    <p class="tiny muted">Nel calcolo della somiglianza una famiglia affine vale il 45% di una famiglia in comune.</p>`;
}

function renderFam({ focusNet = false } = {}) {
  const net = $('#sciNet'); net.innerHTML = netSVG();
  $('#sciChips').innerHTML = chipsHTML();
  $('#sciFam').innerHTML = famCardHTML();
  if (focusNet) net.querySelector('.sci-node.sel')?.focus();
}

// ---------- analisi di una coppia ----------
function triggered(A, B) {
  const out = [], seen = new Set();
  for (const [X, Y] of [[A, B], [B, A]]) for (const [kx, ky, w, , txt] of RULES) {
    const v = Math.min(tv(X, kx), tv(Y, ky)) * w; const t = txt(X.name, Y.name, Y);
    if (v >= 2 && !seen.has(t)) { seen.add(t); out.push({ v, t, r: SCI.regole[ruleKey(kx, ky)] }); }
  }
  if (A.t.umami >= 3 && B.t.umami >= 3) out.push({ v: Math.min(A.t.umami, B.t.umami) * 0.8, t: `Sinergia umami tra ${A.name} e ${B.name}.`, r: SCI.regole.sinergia });
  out.sort((x, y) => y.v - x.v);
  const bad = [];
  for (const [k, th, , txt] of CLASH) if (tv(A, k) >= th && tv(B, k) >= th) bad.push({ t: txt(A.name, B.name), r: SCI.regole.somma });
  if (!CLASSIC.has(pk(A, B))) {
    let best = null; for (const [fx, fy] of CLF) for (const [X, Y] of [[A, B], [B, A]]) { const v = Math.min(X.ar[FI[fx]], Y.ar[FI[fy]]); if (v >= 2 && (!best || v > best.v)) best = { v, X, Y, fx, fy }; }
    if (best) bad.push({ t: `Le note ${CLADJ[best.fx]} di ${best.X.name} e quelle ${CLADJ[best.fy]} di ${best.Y.name} tendono a respingersi.`, r: SCI.regole.stridore });
  }
  return { good: out.slice(0, 4), bad };
}

function butterfly(A, B) {
  const rows = FAM.map((f, i) => ({ i, a: A.ar[i], b: B.ar[i] })).filter(r => r.a >= 2 || r.b >= 2)
    .sort((x, y) => Math.min(y.a, y.b) - Math.min(x.a, x.b) || (y.a + y.b) - (x.a + x.b));
  if (!rows.length) return '<p class="muted">Profumi poco marcati in entrambi: la coppia si regge sul gusto.</p>';
  return `<div class="sci-bf" role="table" aria-label="Famiglie di profumi a confronto">
    <div class="sci-bf-h" role="row"><span role="columnheader">${esc(A.name)}</span><span role="columnheader">Famiglia</span><span role="columnheader">${esc(B.name)}</span></div>
    ${rows.map(r => { const sh = r.a >= 2 && r.b >= 2; return `<div class="sci-bf-r${sh ? ' sh' : ''}" role="row">
      <span class="l" role="cell"><i style="width:${r.a * 20}%"></i><span class="sr">${r.a} su 5</span></span>
      <button type="button" role="cell" class="sci-bf-n" data-fam="${FAM[r.i][0]}" title="${esc(FAM[r.i][4])}">${esc(famName(r.i))}${sh ? '<span class="sci-bf-s">in comune</span>' : ''}</button>
      <span class="r" role="cell"><i style="width:${r.b * 20}%"></i><span class="sr">${r.b} su 5</span></span></div>`; }).join('')}</div>`;
}

function aromaText(A, B) {
  const sh = FAM.map((f, i) => [i, Math.min(A.ar[i], B.ar[i])]).filter(x => x[1] >= 2).sort((x, y) => y[1] - x[1]).map(x => x[0]);
  if (sh.length) return `<p>Hanno in comune ${sh.length === 1 ? 'una famiglia' : sh.length + ' famiglie'} di profumi. ${sh.slice(0, 3).map(i => `<b>${esc(famName(i))}</b>: ${esc(FAM[i][4])}`).join('; ')}. Quando due ingredienti portano le stesse molecole, o molecole dallo stesso carattere, il profumo comune si rafforza e i due sembrano parte di un'unica idea.</p>`;
  const br = []; for (let i = 0; i < FAM.length; i++) { if (A.ar[i] < 2) continue; for (let j = 0; j < FAM.length; j++) { if (i === j || B.ar[j] < 2 || !W[i][j]) continue; br.push([i, j, A.ar[i] * B.ar[j]]); } }
  br.sort((x, y) => y[2] - x[2]);
  if (br.length) return `<p>Nessuna famiglia in comune, ma un <b>ponte indiretto</b>: ${br.slice(0, 2).map(([i, j]) => `${esc(famLbl(i))} di ${esc(A.name)} con ${esc(famLbl(j))} di ${esc(B.name)}`).join('; ')}. Sono famiglie che il metodo considera affini: si richiamano senza condividere le stesse molecole.</p>`;
  return '<p>Nessuna famiglia in comune e nessuna affinità tra le loro note principali: se stanno bene insieme, è per il gusto.</p>';
}

function pyramidHTML(A, B) {
  return `<div class="sci-pyr">${LVORD.map(lv => { let s = 0; for (const i of LEVEL[lv]) s += Math.max(A.ar[i], B.ar[i]); const ok = s >= 3; const w = Math.min(100, s / 10 * 100);
    return `<div class="sci-pyr-r${ok ? ' ok' : ''}"><span>${LV[lv]}</span><span class="bar" role="img" aria-label="${ok ? 'coperte' : 'scoperte'}"><i style="width:${w}%"></i></span><b>${ok ? 'coperte' : 'scoperte'}</b></div>`; }).join('')}</div>`;
}

function pairOutHTML() {
  const A = C.A, B = C.B;
  if (!A || !B) return `<p class="muted">Scegli due ingredienti per vedere che cosa li lega.</p>`;
  if (A === B) return `<p class="muted">Scegli due ingredienti diversi.</p>`;
  const both = A.isSpirit && B.isSpirit;
  const r = both ? null : (A.isSpirit ? score(B, A) : score(A, B));
  const sim = kcos(A, B);
  const T = both ? { good: [], bad: [] } : triggered(r.A, r.B);
  const lens = r ? r.lens : [];
  return `<div class="sci-po-h">
      <p class="v-names">${mark(A)}<b>${esc(A.name)}</b><span aria-hidden="true">+</span>${mark(B)}<b>${esc(B.name)}</b></p>
      ${r ? `<div class="sci-po-v">${meter(r.total)}${relTag(r)}${r.classic ? '<span class="chip">Coppia classica</span>' : ''}</div>` : '<p class="tiny muted">Due alcolici tra loro non ricevono un giudizio: qui ne confronto solo i profumi.</p>'}
    </div>
    <div class="sci-po-g">
      <section><h4>1 · I profumi</h4>${butterfly(A, B)}${aromaText(A, B)}
        <p class="tiny muted">Somiglianza aromatica calcolata: ${num(Math.round(sim * 100) / 100)} su 1 (0 = nessuna nota in comune, 1 = profili identici).</p></section>
      <section><h4>2 · Il gusto e la bocca</h4>
        ${T.good.length ? `<ul class="sci-trig">${T.good.map(x => `<li><p><b>${esc(x.t)}</b></p><p class="tiny">${esc(x.r.t)}</p>${tagLiv(x.r.liv)}</li>`).join('')}</ul>` : '<p class="muted">Nessuna interazione di gusto marcata: la coppia si regge soprattutto sui profumi.</p>'}
        ${T.bad.length ? `<h5>Attenzione</h5><ul class="sci-trig bad">${T.bad.map(x => `<li><p><b>${esc(x.t)}</b></p><p class="tiny">${esc(x.r.t)}</p>${tagLiv(x.r.liv)}</li>`).join('')}</ul>` : ''}</section>
      <section><h4>3 · Struttura e forza</h4>${pyramidHTML(A, B)}
        <p class="tiny">Intensità: ${esc(A.name)} ${A.int}/5, ${esc(B.name)} ${B.int}/5. ${Math.abs(A.int - B.int) >= 2 ? 'La differenza è ampia: il più delicato va usato in dose maggiore.' : 'Forze comparabili: dialogano alla pari.'}</p></section>
      ${r ? `<section><h4>4 · Il contesto</h4><p>${esc(lens[4].why)} ${esc(lens[5].why)}</p></section>` : ''}
    </div>
    ${r ? `<div class="sci-po-f"><button type="button" class="btn sm" data-sci-abbina>Vedi dosi e terzo ingrediente in Abbina →</button></div>` : ''}`;
}

function renderPair() {
  $('#sciPairOut').innerHTML = pairOutHTML();
  if (C.A && C.B) { C.view = 'c'; C.ctx?.changed?.(); }
}

// ---------- montaggio ----------
function build() {
  if (C.built) return; C.built = true;
  const host = $('#capireBody');
  host.innerHTML = `<nav class="sci-toc" aria-label="In questa pagina">${CAPIRE_TOC.map(([id, l]) => `<a href="#${id}" data-sci-toc="${id}">${l}</a>`).join('')}</nav>` + introHTML()
    + `<section class="sci-sec" id="sci-coppie" aria-labelledby="sci-h-coppie">
        <div class="sci-h"><span class="sci-n">2</span><h2 id="sci-h-coppie">Perché due ingredienti stanno bene insieme</h2></div>
        <p class="sci-p">Gli abbinamenti riusciti seguono tre logiche, spesso presenti insieme.</p>
        ${pairIntroHTML()}
        <div class="panel sci-pair" id="sciPair">
          <div class="sci-pair-h"><h3>Analizza una coppia</h3><p class="tiny muted">Scegli due ingredienti: vedi le famiglie e le molecole che li legano, le interazioni di gusto e i punti deboli.</p></div>
          <div class="sci-pick"><div class="combo" id="sciA"></div><span class="pf-plus" aria-hidden="true">+</span><div class="combo" id="sciB"></div></div>
          <div class="sci-ex"><span class="tiny muted">Esempi</span>${PAIR_EX.map(p => `<button type="button" class="ex" data-sci-ex="${p[0].id}+${p[1].id}">${esc(p[0].name)} + ${esc(p[1].name)}</button>`).join('')}</div>
          <div id="sciPairOut" aria-live="polite"></div>
        </div>
      </section>`
    + famSectionHTML() + tasteSectionHTML() + mouthSectionHTML() + methodSectionHTML() + sourcesHTML();
  const all = () => FOODS.concat(SPIRITS);
  C.ca = makeCombo($('#sciA'), { id: 'q-sci-a', label: 'Primo ingrediente', placeholder: 'Primo ingrediente', source: all, keep: true, onPick: x => { C.A = x; renderPair(); } });
  C.cb = makeCombo($('#sciB'), { id: 'q-sci-b', label: 'Secondo ingrediente', placeholder: 'Secondo ingrediente', source: all, keep: true, onPick: x => { C.B = x; renderPair(); } });

  host.addEventListener('click', e => {
    const f = e.target.closest('[data-fam]'); if (f) {
      const inNet = !!e.target.closest('#sciNet'), inChips = !!e.target.closest('#sciChips'), inCard = !!e.target.closest('#sciFam');
      C.fam = f.dataset.fam; C.view = 'f'; renderFam({ focusNet: inNet && e.detail === 0 }); C.ctx?.changed?.();
      if (inChips || inCard) scrollToEl($('#sciFam')); else if (!inNet) scrollToEl($('#sci-profumi'));
      return; }
    const o = e.target.closest('[data-open-food]'); if (o) { C.ctx?.openFood?.(BYID[o.dataset.openFood]); return; }
    const x = e.target.closest('[data-sci-ex]'); if (x) { const [a, b] = x.dataset.sciEx.split('+').map(id => BYID[id]); setPair(a, b); return; }
    if (e.target.closest('[data-sci-abbina]')) { C.ctx?.openAbbina?.(C.A, C.B); return; }
    const t = e.target.closest('[data-sci-toc]'); if (t) { e.preventDefault(); scrollToEl($('#' + t.dataset.sciToc)); }
  });
  host.addEventListener('keydown', e => {
    const g = e.target.closest('.sci-node'); if (!g) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); C.fam = g.dataset.fam; C.view = 'f'; renderFam({ focusNet: true }); C.ctx?.changed?.(); return; }
    const ord = PETALS.map(i => FAM[i][0]); const k = ord.indexOf(g.dataset.fam); let j = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (k + 1) % ord.length; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (k - 1 + ord.length) % ord.length;
    else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = ord.length - 1; else return;
    e.preventDefault(); const net = $('#sciNet'); net.querySelectorAll('.sci-node').forEach(n => n.setAttribute('tabindex', '-1'));
    const nx = net.querySelector(`[data-fam="${ord[j]}"]`); nx.setAttribute('tabindex', '0'); nx.focus();
  });
}
// l'indice della pagina resta in alto: si scorre fin sotto il suo bordo
function scrollToEl(el) { if (!el) return; const toc = document.querySelector('.sci-toc'); const off = (toc ? toc.getBoundingClientRect().height + parseFloat(getComputedStyle(toc).top || 64) : 84) + 12; const top = el.getBoundingClientRect().top + scrollY - off; scrollTo({ top: Math.max(0, top), behavior: calm() ? 'auto' : 'smooth' }); }

function setPair(a, b, { quiet = false } = {}) { C.A = a || null; C.B = b || null; C.ca?.set(C.A); C.cb?.set(C.B); if (!quiet) renderPair(); }

// ---------- interfaccia verso app.js ----------
export function initCapire(ctx) { C.ctx = ctx; }
export function capireHash() {
  if (C.view === 'c' && C.A && C.B) return `#capire/c/${C.A.id}+${C.B.id}`;
  if (C.view === 'f') return `#capire/f/${C.fam}`;
  return '#capire';
}
// percorso: [] · ['f', id] · ['c', 'a+b']
export function routeCapire(a, b) {
  if (a === 'f' && b && FI[b] != null) { C.fam = b; C.view = 'f'; C.goto = 'sci-profumi'; }
  else if (a === 'c' && b) { const [x, y] = b.split('+').map(id => BYID[id]); if (x && y) { C.pend = [x, y]; C.view = 'c'; C.goto = 'sciPair'; } }
  else { C.view = null; }
}
export function renderCapire({ bench = [] } = {}) {
  build();
  if (C.pend) { setPair(C.pend[0], C.pend[1], { quiet: true }); C.pend = null; }
  else if (!C.A || !C.B) { const d = bench.length >= 2 ? bench.slice(0, 2) : PAIR_EX[0]; setPair(d[0], d[1], { quiet: true }); }
  renderFam(); $('#sciPairOut').innerHTML = pairOutHTML();
  if (C.goto) { const id = C.goto; C.goto = null; requestAnimationFrame(() => scrollToEl($('#' + id))); }
}
export function capireView(v) { C.view = v; }
