// Controlla i file in data/ prima della build: campi obbligatori, valori 0–5,
// codici di famiglie, categorie, origini e gruppi validi, abbinamenti classici esistenti.
import { readFileSync } from 'node:fs';

const load = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const foods = load('foods.json');
const spirits = load('spirits.json');
const families = load('families.json');
const categories = load('categories.json');
const origins = load('origins.json');
const groups = load('spirit-groups.json');
const classics = load('classics.json');

const errors = [];
const err = (msg) => errors.push(msg);
const FAMS = new Set(families.famiglie.map((f) => f.id));
const LEVELS = new Set(['testa', 'cuore', 'fondo']);
const TASTES = ['dolce', 'salato', 'acido', 'umami', 'amaro'];
const STRUCT = ['grassezza', 'piccantezza', 'astringenza', 'freschezza'];
const in05 = (v) => Number.isInteger(v) && v >= 0 && v <= 5;

families.famiglie.forEach((f) => { if (!LEVELS.has(f.livello)) err(`Famiglia ${f.id}: livello "${f.livello}" non valido`); });
families.affinita.forEach(([a, b]) => { if (!FAMS.has(a) || !FAMS.has(b)) err(`Affinità ${a}–${b}: famiglia sconosciuta`); });

function checkItem(it, kind) {
  const where = `${kind} "${it.nome}"`;
  if (!it.nome) err(`${kind} senza nome`);
  TASTES.forEach((k) => { if (!in05(it.gusti?.[k])) err(`${where}: gusto ${k} deve essere un intero da 0 a 5`); });
  STRUCT.forEach((k) => { if (!in05(it.struttura?.[k])) err(`${where}: struttura ${k} deve essere un intero da 0 a 5`); });
  if (!(Number.isInteger(it.intensita) && it.intensita >= 1 && it.intensita <= 5)) err(`${where}: intensita deve essere da 1 a 5`);
  if (it.origine && !(it.origine in origins)) err(`${where}: origine "${it.origine}" sconosciuta`);
  for (const [k, v] of Object.entries(it.aromi || {})) {
    if (!FAMS.has(k)) err(`${where}: famiglia aromatica "${k}" sconosciuta`);
    if (!in05(v)) err(`${where}: aroma ${k} deve essere un intero da 0 a 5`);
  }
}

const names = new Set();
foods.forEach((f) => {
  checkItem(f, 'Alimento');
  if (!(f.categoria in categories)) err(`Alimento "${f.nome}": categoria "${f.categoria}" sconosciuta`);
  if (f.stagione != null && !/^(1[0-2]|[1-9])-(1[0-2]|[1-9])$/.test(f.stagione)) err(`Alimento "${f.nome}": stagione "${f.stagione}" non valida (formato "mese-mese", es. "6-9")`);
  if (names.has(f.nome)) err(`Alimento "${f.nome}" duplicato`);
  names.add(f.nome);
});
const snames = new Set();
spirits.forEach((s) => {
  checkItem(s, 'Alcolico');
  if (!(s.gruppo in groups)) err(`Alcolico "${s.nome}": gruppo "${s.gruppo}" sconosciuto`);
  if (snames.has(s.nome)) err(`Alcolico "${s.nome}" duplicato`);
  snames.add(s.nome);
});
classics.alimenti.forEach((c) => { if (!names.has(c.a) || !names.has(c.b)) err(`Classico ${c.a} + ${c.b}: alimento non trovato`); });
classics.alcolici.forEach((c) => { if (!names.has(c.a) || !snames.has(c.b)) err(`Classico ${c.a} + ${c.b}: alimento o alcolico non trovato`); });

// sezione «Capire»: ogni famiglia ha il suo testo e le stesse molecole di families.json
const sci = load('scienza.json');
const famData = load('families.json').famiglie;
famData.forEach((f) => {
  const e = sci.famiglie[f.id];
  if (!e) { err(`Capire: manca il testo della famiglia "${f.id}"`); return; }
  const want = f.composti.split(',').map((x) => x.trim());
  const got = e.molecole.map((m) => m.n);
  if (want.join('|') !== got.join('|')) err(`Capire, famiglia "${f.id}": molecole ${got.join(', ')} diverse da families.json (${want.join(', ')})`);
});
Object.keys(sci.famiglie).forEach((k) => { if (!famData.some((f) => f.id === k)) err(`Capire: famiglia "${k}" inesistente`); });
Object.values(sci.regole).forEach((r) => { if (!(r.liv in sci.livelli)) err(`Capire: livello di evidenza "${r.liv}" sconosciuto`); });

if (errors.length) {
  console.error(`\n✗ Dati non validi (${errors.length} errori):\n` + errors.map((e) => '  - ' + e).join('\n') + '\n');
  process.exit(1);
}
console.log(`✓ Dati validi: ${foods.length} alimenti, ${spirits.length} alcolici, ${classics.alimenti.length + classics.alcolici.length} abbinamenti classici.`);
