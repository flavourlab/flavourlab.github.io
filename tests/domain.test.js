// Test del motore: dati coerenti, abbinamenti di riferimento e ricette sensate.
import { describe, it, expect } from 'vitest';
import { FOODS, SPIRITS, BYNAME, SBYNAME, CLASSIC, MISSING } from '../src/domain/core.js';
import { S, partnersOf, spiritsOf } from '../src/domain/scoring.js';
import { trio, suggestThird } from '../src/domain/trio.js';
import { STYLES, buildRecipe, styleFit, coherence, suggestBases, autoStyleFor } from '../src/domain/recipes.js';

const F = (n) => BYNAME[n];
const SP = (n) => SBYNAME[n];

describe('dati', () => {
  it('carica alimenti e alcolici', () => {
    expect(FOODS.length).toBeGreaterThan(300);
    expect(SPIRITS.length).toBeGreaterThan(90);
  });
  it('ogni abbinamento classico punta a voci esistenti', () => {
    expect(MISSING).toEqual([]);
    expect(CLASSIC.size).toBeGreaterThan(300);
  });
  it('ogni alimento ha un gusto dominante e un profilo aromatico', () => {
    for (const f of FOODS) {
      expect(f.dom).toBeTruthy();
      expect(f.ar).toHaveLength(18);
    }
  });
});

describe('punteggio delle coppie', () => {
  it.each([
    ['Pomodoro', 'Basilico'],
    ['Fragola', 'Basilico'],
    ['Parmigiano Reggiano', 'Aceto balsamico'],
    ['Pera', 'Gorgonzola'],
  ])('%s + %s è almeno promettente', (a, b) => {
    expect(S(F(a), F(b)).total).toBeGreaterThanOrEqual(17);
  });
  it('fragola e acciuga è sconsigliato', () => {
    expect(S(F('Fragola'), F('Acciuga')).total).toBeLessThan(12);
  });
  it('il punteggio resta tra 0 e 30', () => {
    for (const a of FOODS.slice(0, 40)) for (const b of FOODS.slice(40, 80)) {
      const t = S(a, b).total;
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(30);
    }
  });
  it('ogni alimento ha abbinamenti e alcolici', () => {
    expect(partnersOf(F('Fragola')).length).toBeGreaterThan(5);
    expect(spiritsOf(F('Fragola')).length).toBeGreaterThan(5);
  });
});

describe('trio', () => {
  it('calcola un punteggio su 30 e una struttura', () => {
    const t = trio(F('Parmigiano Reggiano'), F('Pera'), F('Noce'));
    expect(t.total).toBeLessThanOrEqual(30);
    expect(['Armonia', 'Contrasto', 'Triangolo', 'Ponte aromatico']).toContain(t.structure);
  });
  it('propone un terzo ingrediente per ogni lente', () => {
    for (const lens of ['piramide', 'equilibrio', 'intensita', 'debole']) {
      expect(suggestThird(F('Parmigiano Reggiano'), F('Ananas'), lens).length).toBeGreaterThan(0);
    }
  });
});

describe('cocktail creator', () => {
  const ins = ['Fragola', 'Basilico', 'Pepe'].map(F);

  it('non propone un Old Fashioned con il solo vermouth', () => {
    expect(styleFit(SP('Vermouth bianco'), 'oldfashioned').ok).toBe(false);
    expect(coherence(ins, 'oldfashioned', SP('Vermouth bianco')).block.length).toBeGreaterThan(0);
    expect(styleFit(SP('Bourbon'), 'oldfashioned').ok).toBe(true);
  });
  it('blocca gli ingredienti che non dialogano', () => {
    expect(coherence([F('Fragola'), F('Acciuga')], 'sour', null).block.length).toBeGreaterThan(0);
  });
  it('suggerisce solo basi adatte allo stile', () => {
    for (const st of STYLES) {
      for (const x of suggestBases(ins, st.id).slice(0, 5)) expect(styleFit(x.s, st.id).ok).toBe(true);
    }
  });
  it('genera ricette complete per ogni stile', () => {
    for (const st of STYLES) {
      const base = suggestBases(ins, st.id)[0]?.s;
      for (const mode of ['classic', 'lab']) {
        const R = buildRecipe(ins, st.id, mode, base);
        expect(R.spec.length).toBeGreaterThan(1);
        expect(R.method.length).toBeGreaterThan(2);
        expect(R.abv).toBeGreaterThan(2);
        expect(R.abv).toBeLessThan(40);
      }
    }
  });
});

describe('varietà delle proposte', () => {
  it('lo stile automatico cambia con il carattere degli ingredienti', () => {
    const pairs = [['Fragola', 'Basilico'], ['Caffè', 'Arancia'], ['Mango', 'Peperoncino'], ['Pera', 'Gorgonzola'], ['Cetriolo', 'Menta'], ['Limone', 'Basilico']];
    const styles = new Set(pairs.map(p => { const ins = p.map(F); return autoStyleFor(ins, suggestBases(ins, null)[0].s); }));
    expect(styles.size).toBeGreaterThanOrEqual(4);
  });
  it("l'amaro al carciofo non è il primo alcolico per quasi tutti", () => {
    const firsts = FOODS.filter((_, i) => i % 3 === 0).map(f => spiritsOf(f)[0].B.name);
    expect(firsts.filter(n => n === 'Amaro al carciofo').length / firsts.length).toBeLessThan(0.08);
  });
  it('lo stesso banco dà sempre la stessa ricetta', () => {
    const ins = ['Fragola', 'Basilico'].map(F);
    for (const mode of ['classic', 'lab']) {
      const a = buildRecipe(ins, 'sour', mode).spec.map(l => l.name).join('|');
      const b = buildRecipe(ins, 'sour', mode).spec.map(l => l.name).join('|');
      expect(a).toBe(b);
    }
  });
});
