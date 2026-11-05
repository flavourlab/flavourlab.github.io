# Flavour Lab

Profili aromatici degli alimenti, un metodo per abbinarli e un generatore di cocktail, pensati da un punto di vista di miscelazione.

L'app ha tre sezioni:

- **Ruota degli abbinamenti**: scegli un alimento. Al centro trovi i suoi cinque gusti (dolce, acido, amaro, umami, salato), intorno gli alimenti con cui si sposa, per concordanza o per contrasto, e all'esterno gli alcolici adatti. Accanto c'è la scheda dell'alimento con i diagrammi spider di gusti e aromi.
- **Pairing Studio**: verifica una coppia o un trio di ingredienti, anche con un alcolico. Il punteggio su 30 somma sei lenti di valutazione. Con due ingredienti scegli una lente (piramide, equilibrio, intensità, anello debole) e l'app ti consiglia il terzo ingrediente.
- **Cocktail creator**: da 1 a 5 ingredienti, una base suggerita per vicinanza aromatica e uno stile di drink. Ottieni una ricetta da bancone, una da laboratorio (roner, fat-wash, acidi corretti) e, quando la base è forte, una a bassa gradazione. Le combinazioni che non reggono non diventano ricette.

Contenuto attuale: 352 alimenti in 53 categorie, 105 alcolici, 340 abbinamenti classici, 13 stili di drink.

> I profili (valori da 0 a 5) sono stime sensoriali, non misure di laboratorio. Sono un punto di partenza da verificare e correggere all'assaggio.

---

## Indice

1. [Requisiti](#requisiti)
2. [Avvio in locale](#avvio-in-locale)
3. [Build in locale](#build-in-locale)
4. [Test e validazione dei dati](#test-e-validazione-dei-dati)
5. [Caricare il progetto su GitHub](#caricare-il-progetto-su-github)
6. [Mettere il sito online](#mettere-il-sito-online)
7. [Struttura del progetto](#struttura-del-progetto)
8. [Modificare e aggiungere i dati](#modificare-e-aggiungere-i-dati)
9. [Come funziona il metodo](#come-funziona-il-metodo)
10. [Licenza](#licenza)

---

## Requisiti

- **Node.js 20 LTS** o successivo (minimo 18.18). Scaricalo da <https://nodejs.org>: con Node arriva anche `npm`.
- **Git**, per caricare il progetto su GitHub: <https://git-scm.com>. In alternativa puoi usare GitHub Desktop: <https://desktop.github.com>.

Per controllare che siano installati, apri il terminale e digita:

```bash
node --version
npm --version
git --version
```

## Avvio in locale

Dalla cartella del progetto:

```bash
npm install      # solo la prima volta: scarica Vite e Vitest
npm run dev      # avvia il server di sviluppo
```

Apri <http://localhost:5173>. Ogni modifica al codice o ai dati si vede subito nel browser.

## Build in locale

```bash
npm run build    # valida i dati e crea il sito pronto nella cartella dist/
npm run preview  # serve la build su http://localhost:4173 per controllarla
```

`dist/` contiene un sito statico: un `index.html`, un file CSS, un file JavaScript e l'icona. Puoi copiarlo su qualunque hosting.

Il file `dist/index.html` non funziona se lo apri con un doppio clic, perché i browser bloccano gli script dei moduli aperti da `file://`. Per vederlo usa `npm run preview` oppure un server statico qualsiasi, per esempio `npx serve dist`.

## Test e validazione dei dati

```bash
npm run validate   # controlla i file in data/
npm test           # esegue i test del motore
npm run test:watch # rilancia i test a ogni modifica
```

- **La validazione** blocca la build se un file di dati ha un errore: valore fuori scala, famiglia aromatica inesistente, categoria sbagliata, abbinamento classico che cita un alimento mancante. Il messaggio indica la voce da correggere.
- **I test** controllano che il metodo resti sensato anche quando si ritoccano pesi e profili:
  - i classici (pomodoro e basilico, Parmigiano e balsamico) devono superare 17/30;
  - le coppie strane (fragola e acciuga) devono restare sotto 12;
  - un Old Fashioned con il solo vermouth non deve mai essere proposto;
  - ogni stile deve produrre una ricetta completa.

## Caricare il progetto su GitHub

1. Crea un account su <https://github.com> se non lo hai.
2. In alto a destra clicca **+ → New repository**. Dai un nome, per esempio `flavour-lab`, scegli **Public** e **non** aggiungere README, .gitignore o licenza: ci sono già. Clicca **Create repository**.
3. Nel terminale, dalla cartella del progetto:

   ```bash
   git init -b main          # salta questo passaggio se la cartella ha già .git
   git add .
   git commit -m "Prima versione di Flavour Lab"
   git remote add origin https://github.com/TUO-UTENTE/flavour-lab.git
   git push -u origin main
   ```

   Sostituisci `TUO-UTENTE` con il tuo nome utente GitHub. Al primo `push` GitHub ti chiede di accedere: segui le istruzioni a schermo, che di solito aprono il browser.

**Con GitHub Desktop**: *File → Add local repository*, scegli la cartella, poi *Publish repository*.

Non caricare i file trascinandoli nella pagina web di GitHub: macOS e Windows nascondono le cartelle che iniziano con un punto, e la cartella `.github` con il deploy automatico andrebbe persa.

## Mettere il sito online

L'app è un sito statico: non ha server né database. Per pubblicarla basta un hosting di file statici. Molti sono gratuiti e includono già HTTPS.

### Opzione A: GitHub Pages (consigliata, gratuita)

Il progetto contiene già il workflow `.github/workflows/deploy.yml`, che a ogni push sul branch `main` esegue test e build e pubblica `dist/`.

1. Carica il progetto su GitHub (sezione precedente).
2. Nel repository vai su **Settings → Pages**.
3. In **Build and deployment → Source** scegli **GitHub Actions**.
4. Vai nella scheda **Actions**: il workflow *Deploy su GitHub Pages* parte da solo al push successivo. Se è già passato, aprilo e clicca **Run workflow**.
5. Dopo uno o due minuti il sito è online su:

   ```
   https://TUO-UTENTE.github.io/flavour-lab/
   ```

Da quel momento ogni `git push` su `main` aggiorna il sito. Se un test fallisce o un dato non è valido, il deploy si ferma e il sito online resta alla versione precedente.

Con un account gratuito, GitHub Pages pubblica solo i repository pubblici.

### Opzione B: Netlify, Cloudflare Pages o Vercel

Tutti e tre hanno un piano gratuito e si collegano al repository GitHub:

1. Accedi al servizio con il tuo account GitHub e scegli **Import / New project** dal repository `flavour-lab`.
2. Imposta:
   - **Build command**: `npm run build`
   - **Output / publish directory**: `dist`
   - **Node version**: 20 (se richiesta)
3. Conferma. Ogni push pubblica una nuova versione e ogni pull request riceve un'anteprima.

Puoi anche trascinare la cartella `dist/` nella pagina *Deploys* di Netlify per una pubblicazione manuale, senza collegare GitHub.

### Dominio personalizzato (facoltativo)

Per un indirizzo tipo `flavourlab.it`:

1. Acquista il dominio da un registrar (Aruba, Register.it, OVH, Cloudflare, Namecheap…).
2. **GitHub Pages**: in *Settings → Pages → Custom domain* scrivi il dominio. Poi, nel pannello DNS del registrar:
   - per un sottodominio (`www.flavourlab.it`), aggiungi un record `CNAME` che punta a `TUO-UTENTE.github.io`;
   - per il dominio principale, aggiungi i record `A` indicati nella guida ufficiale: <https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site>.

   Quando il DNS è attivo, spunta **Enforce HTTPS**.
3. **Netlify, Cloudflare, Vercel**: dalla sezione *Domains* del progetto aggiungi il dominio e segui le istruzioni DNS mostrate.

La propagazione del DNS può richiedere da pochi minuti a 24 ore.

## Struttura del progetto

```
flavour-lab/
├─ data/                    # la conoscenza, in JSON: si modifica senza toccare il codice
│  ├─ foods.json            # alimenti: gusti, struttura, intensità, stagione, origine, aromi
│  ├─ spirits.json          # alcolici e basi
│  ├─ families.json         # 18 famiglie aromatiche, livello della piramide, affinità
│  ├─ categories.json       # 53 categorie con tecnica di estrazione e allergeni
│  ├─ classics.json         # abbinamenti della tradizione (cucina e bancone)
│  ├─ origins.json          # aree d'origine
│  └─ spirit-groups.json    # gruppi di alcolici e struttura di drink consigliata
├─ src/
│  ├─ domain/               # il motore: JavaScript puro, nessuna dipendenza dal browser
│  │  ├─ core.js            # costanti, caricamento e normalizzazione dei dati
│  │  ├─ scoring.js         # le sei lenti, stridore aromatico, partner e alcolici
│  │  ├─ trio.js            # analisi del trio, ruoli, terzo ingrediente consigliato
│  │  └─ recipes.js         # stili, preparazioni, garnish, coerenza base-stile
│  ├─ ui/app.js             # interfaccia: ruota, Pairing Studio, Cocktail creator, icone 8-bit
│  ├─ styles/main.css       # stili, token colore, tema chiaro e scuro
│  └─ main.js               # punto di ingresso
├─ public/favicon.svg
├─ scripts/validate-data.mjs
├─ tests/domain.test.js
├─ .github/workflows/       # deploy.yml (GitHub Pages) e ci.yml (controlli sulle pull request)
├─ index.html
├─ vite.config.js
└─ package.json
```

Il motore (`src/domain/`) è separato dall'interfaccia: si può testare da solo e riusare, per esempio in un'app mobile o in un'API.

## Modificare e aggiungere i dati

Tutti i valori sono interi da **0** (assente) a **5** (massimo). Dopo ogni modifica lancia `npm run validate`, o semplicemente `npm run dev`, e controlla il risultato nell'app.

### Un alimento (`data/foods.json`)

```json
{
  "nome": "Pimento",
  "categoria": "spe",
  "gusti": {"dolce": 1, "salato": 0, "acido": 0, "umami": 0, "amaro": 2},
  "struttura": {"grassezza": 0, "piccantezza": 2, "astringenza": 0, "freschezza": 0},
  "intensita": 4,
  "stagione": null,
  "origine": "T",
  "aromi": {"sd": 5, "sp": 2},
  "nota": "facoltativa: avvertenze di sicurezza o allergeni"
}
```

| Campo | Significato |
|---|---|
| `nome` | Nome visualizzato. Deve essere unico: è anche la chiave usata negli abbinamenti classici. |
| `categoria` | Codice della categoria, vedi `data/categories.json` (es. `agr` agrumi, `spe` spezie, `dur` formaggi a pasta dura). |
| `gusti` | Intensità di dolce, salato, acido, umami e amaro. Il gusto più alto decide il settore della ruota. |
| `struttura` | Grassezza, piccantezza, astringenza, freschezza (mentolato). |
| `intensita` | Forza complessiva, da 1 a 5. |
| `stagione` | Mesi di disponibilità nell'emisfero nord, formato `"inizio-fine"` (es. `"6-9"`, `"11-2"`), oppure `null`. |
| `origine` | Area d'origine, vedi `data/origins.json` (`M` Mediterraneo, `N` Europa centro-nord, `A` Asia orientale, `I` India e Medio Oriente, `L` Americhe, `T` Tropici), oppure `null`. |
| `aromi` | Solo le famiglie presenti, con il loro codice (vedi sotto). |
| `nota` | Facoltativa: tossicità, allergeni, limiti di legge. Compare nella scheda e nelle ricette. |

**Codici delle famiglie aromatiche**:

| Codice | Famiglia | Codice | Famiglia |
|---|---|---|---|
| `ag` | agrumato | `te` | legnoso/terroso |
| `ff` | fruttato fresco | `to` | tostato/caramellato |
| `ft` | fruttato maturo | `af` | affumicato |
| `fl` | floreale | `la` | lattico/burroso |
| `ve` | verde/erbaceo | `ca` | carnoso/brodoso |
| `er` | erbe aromatiche | `fu` | funky/animale |
| `sd` | speziato dolce | `fe` | fermentato/acetico |
| `sp` | speziato pungente | `ox` | ossidativo/nocciolato |
| `re` | resinoso/balsamico | `mi` | minerale/marino |

### Un alcolico (`data/spirits.json`)

Stessi campi di un alimento, senza `categoria` e `stagione`, più:

- `esempi`: marche o tipologie di riferimento (es. `"Campari"`), oppure `null`;
- `gruppo`: `bia` distillati bianchi, `inv` invecchiati, `liq` liquori, `ama` amari e bitter, `ver` vermouth e quinquina, `vin` vini e fortificati, `bir` birre e sidro, `sak` sake.

La gradazione usata nelle ricette sta in `src/domain/recipes.js` (oggetto `ABVX`). Per un nuovo alcolico con una gradazione diversa dalla media del suo gruppo, aggiungila lì.

### Un abbinamento classico (`data/classics.json`)

```json
{"a": "Pomodoro", "b": "Basilico", "nota": "la coppia simbolo del Mediterraneo"}
```

- `alimenti` raccoglie le coppie tra alimenti, `alcolici` le coppie alimento + alcolico (in `b` va il nome dell'alcolico).
- La nota è facoltativa: se c'è, compare come esempio, per esempio il nome del cocktail.
- Un classico vale 5 nella lente «Tradizione» ed è escluso dal controllo sugli aromi che si respingono.

### Stili di drink e regole

Gli stili, le dosi di partenza, i bicchieri, le basi tipiche (`PREFB`) e le regole su quale base regge quale stile (`styleFit`) sono in `src/domain/recipes.js`.

## Come funziona il metodo

**Le sei lenti di una coppia** (da 0 a 5 ciascuna, totale su 30):

1. **Ponte aromatico**: quanto i due profili si sovrappongono sulle 18 famiglie, contando anche le famiglie affini.
2. **Bilanciamento di gusto**: le regole classiche. L'acido taglia il grasso, il sale esalta il dolce, l'amaro dà profondità al dolce, il grasso ammorbidisce il piccante; conta anche la sinergia umami. Toglie punti quando due gusti forti si sommano o quando gli aromi si respingono (note marine o animali contro frutta fresca e fiori).
3. **Intensità e peso**: due ingredienti di forza simile dialogano alla pari.
4. **Copertura della piramide**: testa, cuore e fondo.
5. **Territorio e stagione**: ciò che cresce insieme sta bene insieme.
6. **Tradizione**: l'abbinamento esiste in cucina o al bancone.

**Fasce del punteggio**: da 24 a 30 forte; da 17 a 23 promettente; da 10 a 16 rischioso, serve un ingrediente ponte; sotto 10 sconsigliato.

**Concordanza o contrasto**: concordanza quando i due condividono note o si rinforzano; contrasto quando un gusto bilancia l'altro.

**Trio**: ponte medio, piramide dei tre insieme, equilibrio, intensità, anello debole (la coppia peggiore, con un bonus se il terzo fa da ponte) e tradizione.

**Riferimenti** da cui vengono le idee del metodo: *The Flavor Bible* (Page e Dornenburg), *The Flavour Thesaurus* (Segnit), il lavoro di Foodpairing sui composti condivisi, lo studio *Flavor network and the principles of food pairing* (Ahn et al., Scientific Reports, 2011), *On Food and Cooking* (McGee), *Liquid Intelligence* (Arnold), *Cocktail Codex* (Death & Co) e *The Drunken Botanist* (Stewart). I dati non sono copiati da queste fonti.

**Sicurezza**: le avvertenze su ingredienti regolati (tujone, cumarina, amigdalina, noce moscata), allergeni, uova crude, fat-wash e roner con alcol sono indicative. Per i limiti di legge fanno fede il Reg. CE 1334/2008, il Reg. UE 1169/2011 e le schede dei fornitori.

## Licenza

Il codice è distribuito con licenza [MIT](LICENSE).

Per i dati in `data/` puoi scegliere una licenza aperta diversa, per esempio Creative Commons BY-SA 4.0, se vuoi che chi li riusa citi la fonte e condivida le modifiche. In quel caso aggiungi un file `data/LICENSE`. Se un giorno importi dati da altri database, come FlavorDB, controlla prima la loro licenza.
