// Strumenti personali: bottigliera, quaderno, modalità bancone, immagine da condividere.
// Tutto resta nel browser (localStorage), come il banco: niente account, niente server.
import { SPIRITS, SGROUP, BYID } from '../domain/core.js';
import { fmt } from '../domain/recipes.js';
import { esc, glassSVG, GLASSES, toast, calm } from './kit.js';
import { impronta, icon } from './visual.js';

// ---------- archivio locale ----------
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ?? d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

// ---------- bottigliera ----------
export const bar = new Set(load('flavourlab.bar', []).filter(id => BYID[id]));
const saveBar = () => save('flavourlab.bar', [...bar]);
export const owns = B => !!B && bar.has(B.id);
// tra le basi proposte, la prima che hai in casa se non è molto peggiore della migliore
export function preferOwned(list) {
  if (!bar.size || !list.length) return list[0] || null;
  const top = list[0].mean ?? 0;
  return list.slice(0, 10).find(x => owns(x.s) && (x.mean ?? 0) >= top - 4) || list[0];
}
// cosa serve dalla bottigliera per una ricetta
export function barCheck(R) {
  const need = []; const seen = new Set();
  R.spec.forEach(l => { if (l.sp && !seen.has(l.sp.id)) { seen.add(l.sp.id); need.push(l.sp); } });
  [R.base, R.base2, ...(R.mods || [])].forEach(s => { if (s && s.isSpirit && !seen.has(s.id)) { seen.add(s.id); need.push(s); } });
  return { need, miss: need.filter(s => !owns(s)) };
}
export function barLineHTML(R) {
  const { need, miss } = barCheck(R);
  if (!need.length) return '';
  if (!bar.size) return `<p class="barline"><span>${icon('bottle', 16)}Dimmi cosa hai in casa e ti segno cosa manca.</span><button type="button" class="link" data-open-bar>La mia bottigliera</button></p>`;
  if (!miss.length) return `<p class="barline ok"><span>${icon('bottle', 16)}<b>Hai tutto</b> nella tua bottigliera.</span></p>`;
  return `<p class="barline miss"><span>${icon('bottle', 16)}Ti manca: <b>${miss.map(s => esc(s.name)).join(', ')}</b>.</span><button type="button" class="link" data-open-bar>Aggiorna la bottigliera</button></p>`;
}
const GORDER = Object.keys(SGROUP);
function barBody(q = '') {
  const n = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const qq = n(q.trim());
  return GORDER.map(g => {
    const list = SPIRITS.filter(s => s.grp === g && (!qq || n(s.name + ' ' + (s.ex || '')).includes(qq)));
    if (!list.length) return '';
    return `<fieldset class="bar-g"><legend>${esc(SGROUP[g][0])} <small>${list.filter(owns).length}/${list.length}</small></legend>
      <div class="bar-items">${list.map(s => `<label class="bar-it"><input type="checkbox" data-bar="${s.id}"${owns(s) ? ' checked' : ''}><span><b>${esc(s.name)}</b>${s.ex ? `<small>${esc(s.ex)}</small>` : ''}</span></label>`).join('')}</div></fieldset>`;
  }).join('') || `<p class="muted">Nessuna bottiglia per «${esc(q)}».</p>`;
}
export function openBar(onChange) {
  const d = sheet(`<div class="sh-h"><div><h2>La mia bottigliera</h2><p class="tiny muted">Segna le bottiglie che hai: in «Crea» scelgo prima quelle e ti dico cosa manca. Restano solo su questo dispositivo.</p></div>${closeBtn}</div>
    <div class="bar-tools"><input type="search" class="bar-q" placeholder="Filtra: gin, vermouth, amaro…" aria-label="Filtra le bottiglie"><span class="tiny muted" data-bar-count></span></div>
    <div class="bar-body">${barBody()}</div>`, 'Bottigliera');
  const count = () => { d.querySelector('[data-bar-count]').textContent = `${bar.size} ${bar.size === 1 ? 'bottiglia' : 'bottiglie'}`; };
  count();
  d.addEventListener('change', e => { const c = e.target.closest('[data-bar]'); if (!c) return; c.checked ? bar.add(c.dataset.bar) : bar.delete(c.dataset.bar); saveBar(); count(); onChange && onChange(); });
  d.querySelector('.bar-q').addEventListener('input', e => { d.querySelector('.bar-body').innerHTML = barBody(e.target.value); });
}

// ---------- finestra (dialog nativo: Esc chiude, il focus resta dentro) ----------
const closeBtn = `<button type="button" class="sh-x" data-close aria-label="Chiudi">×</button>`;
export function sheet(html, label, cls = '') {
  const d = document.createElement('dialog'); d.className = 'sheet-d ' + cls; d.setAttribute('aria-label', label);
  d.innerHTML = `<div class="sh-in">${html}</div>`; document.body.appendChild(d);
  d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  d.addEventListener('close', () => { d.dispatchEvent(new Event('gone')); d.remove(); });
  if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  return d;
}

// ---------- quaderno ----------
export let notes = load('flavourlab.quaderno', []);
const saveNotes = () => save('flavourlab.quaderno', notes);
export const RATE = [['rifare', 'Da rifare'], ['correggere', 'Da correggere'], ['no', 'Non mi è piaciuto']];
export function noteAdd(entry) {
  const ex = notes.find(n => n.hash === entry.hash);
  if (ex) { toast('È già nel quaderno'); return ex; }
  const n = { id: Date.now().toString(36), at: new Date().toISOString(), note: '', rating: '', ...entry };
  notes.unshift(n); saveNotes(); toast('Salvato nel quaderno'); return n;
}
const dateTxt = s => new Date(s).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
function noteItem(n) {
  return `<li class="nb-it" data-nid="${n.id}">
    <div class="nb-top">${n.sty && GLASSES[n.sty] ? glassSVG(n.sty, 40, '', true) : `<span class="nb-k">${icon('pod', 22)}</span>`}
      <div class="nb-t"><b>${esc(n.title)}</b><small>${esc(n.sub || '')} · ${dateTxt(n.at)}</small></div>
      <a class="btn sm" href="${esc(n.hash)}" data-nb-open>Apri</a></div>
    <div class="nb-rate" role="group" aria-label="Com'era?"><span class="tiny muted">Com'era?</span>${RATE.map(([k, w]) => `<button type="button" data-rate="${k}" aria-pressed="${n.rating === k}">${w}</button>`).join('')}</div>
    <label class="sr" for="nb-${n.id}">Note su ${esc(n.title)}</label><textarea id="nb-${n.id}" rows="2" placeholder="Note: dosi corrette, con chi l'hai bevuto, cosa cambiare…" data-note>${esc(n.note || '')}</textarea>
    <button type="button" class="link tiny" data-nb-del>Togli dal quaderno</button></li>`;
}
export function openNotebook(focusId) {
  const body = () => notes.length ? `<ul class="nb">${notes.map(noteItem).join('')}</ul>`
    : `<div class="empty"><h2>Il quaderno è vuoto</h2><p class="muted">Salva un drink da «Crea» o una coppia da «Abbina»: qui ritrovi la ricetta, le tue note e com'era.</p></div>`;
  const d = sheet(`<div class="sh-h"><div><h2>Il mio quaderno</h2><p class="tiny muted">Drink e coppie che hai salvato, con le tue note. Solo su questo dispositivo.</p></div>${closeBtn}</div><div class="nb-body">${body()}</div>`, 'Quaderno');
  const it = id => notes.find(n => n.id === id);
  d.addEventListener('click', e => {
    const li = e.target.closest('[data-nid]'); if (!li) return; const n = it(li.dataset.nid);
    const r = e.target.closest('[data-rate]'); if (r) { n.rating = n.rating === r.dataset.rate ? '' : r.dataset.rate; saveNotes(); li.querySelectorAll('[data-rate]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.rate === n.rating))); return; }
    if (e.target.closest('[data-nb-del]')) { notes = notes.filter(x => x !== n); saveNotes(); d.querySelector('.nb-body').innerHTML = body(); return; }
    if (e.target.closest('[data-nb-open]')) d.close();
  });
  d.addEventListener('input', e => { const t = e.target.closest('[data-note]'); if (!t) return; const n = it(t.closest('[data-nid]').dataset.nid); n.note = t.value; saveNotes(); });
  if (focusId) setTimeout(() => d.querySelector(`[data-nid="${focusId}"] [data-rate]`)?.focus(), 30);
}

// ---------- modalità bancone ----------
const OZ = 29.57;
const qty = (ml, n, unit) => unit === 'oz' ? (Math.round(ml * n / OZ * 4) / 4).toString().replace('.', ',') + ' oz' : fmt(ml * n) + ' ml';
const secs = s => { const m = String(s).match(/(\d+)\s*(?:s|sec|secondi)\b/); return m ? +m[1] : 0; };
export function openBancone(R, name, { onDone } = {}) {
  let n = 1, unit = 'ml', i = 0, lock = null, tm = null;
  const steps = [...R.preps.map(p => ({ t: `Prima: ${p.title}`, d: p.steps.join(' ') })), ...R.method.map((s, k) => ({ t: `Passo ${k + 1}`, d: s }))];
  const d = sheet(`<div class="bc"><div class="sh-h"><div class="bc-id">${glassSVG(R.st.id, 56, R.st.name, true)}<div><h2>${esc(name)}</h2><p class="tiny muted">${esc(R.st.glass)} · ghiaccio: ${esc(R.st.ice)}</p></div></div>${closeBtn}</div>
    <div class="bc-ctl"><div class="seg" role="group" aria-label="Quanti drink">${[1, 2, 4, 6].map(k => `<button type="button" data-n="${k}" aria-pressed="${k === 1}">${k} ${k === 1 ? 'drink' : 'drink'}</button>`).join('')}</div>
      <div class="seg" role="group" aria-label="Unità"><button type="button" data-u="ml" aria-pressed="true">ml</button><button type="button" data-u="oz" aria-pressed="false">oz</button></div></div>
    <ul class="bc-ing" data-ing></ul>
    <div class="bc-step" aria-live="polite" data-step></div>
    <div class="bc-nav"><button type="button" class="btn" data-prev>← Indietro</button><span class="tiny muted" data-pos></span><button type="button" class="btn primary" data-next>Avanti →</button></div></div>`, 'Modalità bancone', 'bancone');
  const ing = () => { d.querySelector('[data-ing]').innerHTML = R.spec.map((l, k) => `<li><label><input type="checkbox"><span class="q">${l.drop ? '—' : qty(l.ml, n, unit)}</span><span>${esc(l.name)}${l.post ? ' <small>per colmare</small>' : ''}</span></label></li>`).join('') + `<li class="garn"><span class="q">+</span><span>${esc(R.garnish[0])}</span></li>`; };
  const step = () => {
    clearInterval(tm); const s = steps[i]; const t = secs(s.d);
    d.querySelector('[data-step]').innerHTML = `<p class="bc-t">${esc(s.t)}</p><p class="bc-d">${esc(s.d)}</p>${t ? `<button type="button" class="btn bc-timer" data-timer="${t}">Avvia il timer: ${t} secondi</button>` : ''}`;
    d.querySelector('[data-pos]').textContent = `${i + 1} di ${steps.length}`;
    d.querySelector('[data-prev]').disabled = i === 0;
    const nx = d.querySelector('[data-next]'); nx.textContent = i === steps.length - 1 ? 'Fatto ✓' : 'Avanti →';
  };
  ing(); step();
  d.addEventListener('click', e => {
    const b = e.target.closest('[data-n]'); if (b) { n = +b.dataset.n; d.querySelectorAll('[data-n]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); ing(); return; }
    const u = e.target.closest('[data-u]'); if (u) { unit = u.dataset.u; d.querySelectorAll('[data-u]').forEach(x => x.setAttribute('aria-pressed', String(x === u))); ing(); return; }
    if (e.target.closest('[data-prev]')) { i = Math.max(0, i - 1); step(); return; }
    if (e.target.closest('[data-next]')) { if (i < steps.length - 1) { i++; step(); } else { d.close(); onDone && onDone(); } return; }
    const tb = e.target.closest('[data-timer]'); if (tb) {
      let left = +tb.dataset.timer; clearInterval(tm); tb.disabled = true;
      const tick = () => { tb.textContent = left > 0 ? `${left}…` : 'Basta così ✓'; if (left <= 0) { clearInterval(tm); try { navigator.vibrate && navigator.vibrate([120, 60, 120]); } catch (_) { } } left--; };
      tick(); tm = setInterval(tick, 1000);
    }
  });
  d.addEventListener('keydown', e => { if (e.target.closest('input,textarea')) return; if (e.key === 'ArrowRight') d.querySelector('[data-next]').click(); if (e.key === 'ArrowLeft' && i > 0) d.querySelector('[data-prev]').click(); });
  // lo schermo resta acceso mentre prepari
  (async () => { try { if ('wakeLock' in navigator) lock = await navigator.wakeLock.request('screen'); } catch (_) { } })();
  d.addEventListener('gone', () => { clearInterval(tm); try { lock && lock.release(); } catch (_) { } });
}

// ---------- immagine da condividere ----------
// SVG con i colori risolti: il canvas non conosce le variabili CSS della pagina
function solid(svg, w, h) {
  const cs = getComputedStyle(document.documentElement);
  const v = k => cs.getPropertyValue(k).trim() || '#000';
  const out = svg.replace(/var\((--[a-z0-9-]+)\)/g, (m, k) => v(k)).replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" `)
    .replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)
    .replace(/(<svg[^>]*>)/, `$1<style>.ip-p{stroke:#18171A;stroke-width:4.4;stroke-linecap:round;opacity:.82}.ip-p.on{stroke:#8E1B2C;opacity:1}.ip-z{fill:#D0C5B2}.ip-sp{fill:#FFFDF9;stroke:#18171A;stroke-width:3}
      .s{fill:none;stroke:#18171A;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.lq{fill:var(--c);fill-opacity:.9}.acf{fill:var(--c);stroke:#18171A;stroke-width:1}.acl{fill:none;stroke:var(--c);stroke-width:2;stroke-linecap:round}</style>`);
  // --c dei bicchieri è nello style inline: lo risolvo a mano
  return out.replace(/style="--c:([^"]+)"/g, (m, c) => `style="--c:${c}" fill="${c}"`).replace(/var\(--c\)/g, 'currentColor');
}
const img = src => new Promise((ok, ko) => { const im = new Image(); im.onload = () => ok(im); im.onerror = ko; im.src = src; });
const svgURL = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
function wrap(ctx, text, maxW) { const w = text.split(' '); const lines = []; let cur = ''; w.forEach(x => { const t = cur ? cur + ' ' + x : x; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = x; } else cur = t; }); if (cur) lines.push(cur); return lines; }
export async function shareImage(R, name, foods) {
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  try { await Promise.all([document.fonts.load('400 80px Fraunces'), document.fonts.load('500 30px Geist'), document.fonts.load('400 26px "Geist Mono"')]); } catch (_) { }
  g.fillStyle = '#F4EFE5'; g.fillRect(0, 0, W, H);
  const grd = g.createRadialGradient(140, 120, 20, 140, 120, 760); grd.addColorStop(0, '#F3E3E4'); grd.addColorStop(1, 'rgba(243,227,228,0)'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
  // bicchiere con i suoi colori (il liquido si colora con --c)
  const gs = glassSVG(R.st.id, 48, '', true).replace(/<path class="(lq|ac acf|ac acl)" d="([^"]+)" style="--c:([^"]+)"\/>/g, (m, k, d, col) =>
    k === 'lq' ? `<path d="${d}" fill="${col}" fill-opacity=".9"/>` : k === 'ac acf' ? `<path d="${d}" fill="${col}" stroke="#18171A" stroke-width="1"/>` : `<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`)
    .replace(/<path class="s" d="([^"]+)"\/>/g, '<path d="$1" fill="none" stroke="#18171A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>')
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/width="48" height="48"/, 'width="300" height="300"');
  try { g.drawImage(await img(svgURL(gs)), 80, 90, 300, 300); } catch (_) { }
  g.fillStyle = '#8E1B2C'; g.font = '600 24px Geist, sans-serif'; g.fillText('FLAVOUR LAB · RICETTA', 420, 150);
  g.fillStyle = '#18171A'; g.font = '400 76px Fraunces, Georgia, serif';
  const tl = wrap(g, name, 580); tl.slice(0, 3).forEach((l, k) => g.fillText(l, 420, 236 + k * 80));
  g.fillStyle = '#6C665E'; g.font = '400 28px Geist, sans-serif'; g.fillText(`${R.st.name} · ~${fmt(R.abv)}% vol · ${R.vol} ml`, 420, 236 + Math.min(tl.length, 3) * 80 + 6);
  // ricetta
  let y = 500; g.strokeStyle = '#D0C5B2'; g.lineWidth = 2; g.beginPath(); g.moveTo(80, y - 40); g.lineTo(W - 80, y - 40); g.stroke();
  R.spec.slice(0, 7).forEach(l => {
    g.fillStyle = '#6C665E'; g.font = '400 30px "Geist Mono", monospace'; g.fillText(l.drop ? '—' : `${fmt(l.ml)} ml`, 80, y);
    g.fillStyle = '#18171A'; g.font = '400 34px Geist, sans-serif'; const ls = wrap(g, l.name, 700); ls.slice(0, 2).forEach((x, k) => g.fillText(x, 280, y + k * 42)); y += 42 * Math.min(ls.length, 2) + 26;
  });
  g.fillStyle = '#3B3733'; g.font = 'italic 400 32px Fraunces, Georgia, serif'; wrap(g, 'Guarnizione: ' + R.garnish[0], W - 160).slice(0, 2).forEach((x, k) => g.fillText(x, 80, y + 10 + k * 40));
  // impronte degli ingredienti
  const fs = foods.filter(f => !f.isSpirit).slice(0, 4); let x = 80;
  const sz = fs.length > 3 ? 170 : 210, gap = (W - 160) / Math.max(fs.length, 1);
  g.textAlign = 'center';
  for (const f of fs) { const cx = x + gap / 2; try { g.drawImage(await img(svgURL(solid(impronta(f, 100, { label: false }), sz, sz))), cx - sz / 2, H - 150 - sz - 50, sz, sz); } catch (_) { }
    g.fillStyle = '#18171A'; g.font = '500 26px Geist, sans-serif'; g.fillText(f.name.length > 18 ? f.name.slice(0, 17) + '…' : f.name, cx, H - 140); x += gap; }
  g.textAlign = 'left';
  g.fillStyle = '#6C665E'; g.font = '400 24px Geist, sans-serif'; g.textAlign = 'right'; g.fillText('flavourlab.github.io', W - 80, H - 60);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const fname = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png';
  const file = new File([blob], fname, { type: 'image/png' });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name, text: location.href }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast('Immagine scaricata');
}
export { calm };
