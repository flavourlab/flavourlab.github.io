// Generatore di ricette: stili, preparazioni, garnish e coerenza base-stile.
import { ALLERG, BYNAME, FAM, FI, SBYNAME, SPIRITS, TYPELBL, r05 } from './core.js';
import { S, bridgesFor, listIt } from './scoring.js';
import { roles } from './trio.js';
export const STYLES = [
  {id:'oldfashioned',name:'Old Fashioned',fam:'Stirred · on the rocks',desc:'Distillato in primo piano, ammorbidito da poco zucchero e da un bitter.',ex:'Old Fashioned, Sazerac, Oaxaca Old Fashioned',
    base:60,acid:0,sweet:7.5,bitters:2,dil:0.22,roles:['infuse','fatwash','milkwash','sweet','season','garnish','smoke'],
    glass:'Tumbler basso (rocks), raffreddato',ice:'un cubo grande trasparente'},
  {id:'martini',name:'Martini e Manhattan',fam:'Stirred · servito up',desc:'Distillato e vino aromatizzato, mescolati e serviti freddissimi senza ghiaccio.',ex:'Dry Martini, Manhattan, Vesper, Martinez',
    base:50,mod:25,acid:0,sweet:0,bitters:1,dil:0.25,roles:['infuse','fatwash','milkwash','modinfuse','sweet','season','garnish','smoke'],
    glass:'Coppetta o Nick & Nora ghiacciata',ice:'nessuno nel bicchiere'},
  {id:'negroni',name:'Negroni e Boulevardier',fam:'Stirred · tre parti uguali',desc:'Distillato, bitter e vermouth in parti uguali: amaro, dolce e alcol in equilibrio.',ex:'Negroni, Boulevardier, Old Pal, Cardinale',
    base:30,mod:30,mod2:30,acid:0,sweet:0,dil:0.22,roles:['infuse','fatwash','milkwash','modinfuse','sweet','season','garnish','smoke'],
    glass:'Tumbler basso (rocks)',ice:'un cubo grande trasparente'},
  {id:'sour',name:'Sour e Daisy',fam:'Shaken · servito up',desc:'Distillato, agrume e dolce. Con un liquore al posto dello sciroppo diventa un Daisy.',ex:'Daiquiri, Margarita, Gimlet, Sidecar',
    base:50,acid:25,sweet:20,dil:0.30,roles:['infuse','fatwash','milkwash','acid','sweet','muddle','season','garnish','smoke'],
    glass:'Coppa ghiacciata',ice:'nessuno nel bicchiere'},
  {id:'sour_albume',name:'Sour con albume',fam:'Dry shake · coppa con schiuma',desc:'Sour con albume (o acquafaba): texture setosa e una schiuma che porta gli aromi.',ex:'Whiskey Sour, Pisco Sour, Clover Club, White Lady',
    base:50,acid:25,sweet:20,texture:'albume',dil:0.32,roles:['infuse','fatwash','milkwash','acid','sweet','muddle','texture','season','garnish'],
    glass:'Coppa ghiacciata',ice:'nessuno nel bicchiere'},
  {id:'collins',name:'Collins e Fizz',fam:'Shaken · allungato con soda',desc:'Un sour allungato con acqua gassata: dissetante, lungo, aromatico.',ex:'Tom Collins, Gin Fizz, Ramos Gin Fizz',
    base:45,acid:25,sweet:20,length:70,dil:0.28,roles:['infuse','fatwash','milkwash','acid','sweet','muddle','texture','season','length','garnish'],
    glass:'Tumbler alto (Collins)',ice:'cubi pieni fino al bordo'},
  {id:'highball',name:'Highball e Buck',fam:'Built · long con mixer',desc:'Distillato e mixer gassato, costruiti nel bicchiere. Pulizia e carbonica.',ex:'Gin Tonic, Paloma, Moscow Mule, Whisky Highball',
    base:45,acid:10,acidOpt:true,sweet:10,sweetOpt:true,length:130,dil:0.10,roles:['infuse','fatwash','milkwash','acid','sweet','season','length','garnish'],
    glass:'Tumbler alto o calice da gin tonic',ice:'cubi o colonna di ghiaccio trasparente'},
  {id:'julep',name:'Julep e Smash',fam:'Pestato · ghiaccio tritato',desc:'Erbe o frutta pestate, distillato e tanto ghiaccio tritato: fresco e profumato.',ex:'Mint Julep, Whiskey Smash, Mojito, Caipirinha',
    base:60,acid:10,acidOpt:true,sweet:12.5,dil:0.35,roles:['infuse','fatwash','muddle','sweet','acid','season','garnish'],
    glass:'Julep cup o tumbler basso',ice:'ghiaccio tritato a cupola'},
  {id:'flip',name:'Flip e Cream',fam:'Shaken · tuorlo o panna',desc:'Morbidi e da fine pasto: un tuorlo intero o la panna danno corpo e rotondità.',ex:'Brandy Flip, Alexander, Grasshopper',
    base:45,mod:15,acid:0,sweet:15,texture:'tuorlo',dil:0.30,roles:['infuse','fatwash','modinfuse','sweet','texture','season','garnish'],
    glass:'Coppa piccola o calice',ice:'nessuno nel bicchiere'},
  {id:'spritz',name:'Spritz e Americano',fam:'Built · calice con bollicine',desc:'Aperitivo a bassa gradazione: un bitter o un vino aromatizzato, bollicine e soda.',ex:'Spritz, Hugo, Americano, Bicicletta',
    base:0,mod:60,acid:10,acidOpt:true,sweet:10,sweetOpt:true,length:120,dil:0.10,roles:['modinfuse','acid','sweet','season','length','garnish'],
    glass:'Calice da vino ampio',ice:'cubi'},
  {id:'royale',name:'Royale',fam:'Shaken · colmato col metodo classico',desc:'Un sour corto colmato con bollicine secche: festoso, teso, elegante.',ex:'French 75, Air Mail, Seelbach',
    base:30,acid:15,sweet:15,length:60,dil:0.26,roles:['infuse','fatwash','milkwash','acid','sweet','muddle','season','garnish'],
    glass:'Flûte o coppa',ice:'nessuno nel bicchiere'},
  {id:'tiki',name:'Tiki e Swizzle',fam:'Più basi · spezie · ghiaccio tritato',desc:'Due basi, agrume, sciroppi speziati e liquore: esotico, stratificato, generoso.',ex:'Mai Tai, Zombie, Queen\'s Park Swizzle',
    base:60,split:true,mod:15,acid:25,sweet:15,bitters:2,dil:0.35,roles:['infuse','fatwash','acid','sweet','muddle','season','garnish'],
    glass:'Tiki mug o tumbler alto',ice:'ghiaccio tritato'},
  {id:'milkpunch',name:'Milk Punch chiarificato',fam:'Batch · chiarificato col latte',desc:'Il cocktail acido caglia il latte e ne esce limpido, setoso e stabile per settimane.',ex:'English Milk Punch, Clarified Piña Colada',
    base:45,acid:25,sweet:25,dil:0.15,clar:30,roles:['infuse','fatwash','acid','sweet','clarify','season','garnish'],
    glass:'Tumbler basso',ice:'un cubo grande trasparente'},
];
export const STY={};STYLES.forEach(s=>STY[s.id]=s);
export const PREFB={
  oldfashioned:['Bourbon','Rye whiskey','Rum invecchiato','Cognac','Mezcal','Tequila añejo','Scotch malt','Calvados','Armagnac','Whisky giapponese','Amaro siciliano','Amaro alpino','Sotol','Batavia arrack'],
  martini:['Gin London Dry','Gin contemporaneo','Vodka','Rye whiskey','Bourbon','Genever','Tequila blanco','Vermouth dry','Vermouth bianco','Sherry fino','Gin Old Tom'],
  negroni:['Gin London Dry','Gin contemporaneo','Bourbon','Rye whiskey','Mezcal','Rum invecchiato','Tequila añejo','Bitter rosso','Vermouth rosso','Aperitivo','Amaro al carciofo','Bitter bianco','Vino chinato'],
  sour:['Gin London Dry','Gin contemporaneo','Rum bianco','Tequila blanco','Pisco','Bourbon','Cognac','Mezcal','Cachaça','Rhum agricole','Amaretto','Bitter rosso','Sherry oloroso','Liquore di albicocca','Licor 43','Pastis'],
  sour_albume:['Bourbon','Pisco','Gin London Dry','Gin contemporaneo','Rye whiskey','Scotch malt','Calvados','Cognac','Tequila blanco','Amaretto','Bitter rosso','Aperitivo','Irish whiskey','Licor 43'],
  collins:['Gin London Dry','Gin contemporaneo','Vodka','Tequila blanco','Rum bianco','Bourbon','Pisco','Vermouth bianco','Liquore di sambuco','Gin Old Tom'],
  highball:['Gin London Dry','Gin contemporaneo','Vodka','Tequila blanco','Scotch malt','Whisky giapponese','Rum bianco','Mezcal','Shochu','Bitter rosso','Aperitivo','Vermouth bianco','Fernet','Amaro siciliano','Sherry fino','Pastis','Ouzo e raki','Soju','Bitter bianco','Amer Picon','Irish whiskey'],
  julep:['Bourbon','Rye whiskey','Rum bianco','Cognac','Cachaça','Rhum agricole','Gin London Dry','Sherry oloroso','Porto tawny','Pastis'],
  flip:['Cognac','Armagnac','Rum invecchiato','Bourbon','Calvados','Brandy de Jerez','Porto ruby','Pedro Ximénez','Marsala','Sherry oloroso','Crema di whisky','Licor 43'],
  royale:['Gin London Dry','Gin contemporaneo','Cognac','Calvados','Rum invecchiato','Bourbon','Liquore di sambuco','Aperitivo'],
  tiki:['Rum giamaicano','Rum invecchiato','Rum bianco','Rhum agricole','Cachaça','Falernum','Batavia arrack'],
  milkpunch:['Rum invecchiato','Cognac','Bourbon','Rum giamaicano','Gin London Dry','Rhum agricole','Vermouth rosso','Batavia arrack'],
  spritz:['Aperitivo','Bitter rosso','Vermouth bianco','Liquore di sambuco','Quinquina','Amaro al carciofo','Sherry fino','Bitter bianco','Vino chinato']};
export const LOWB=['Vermouth bianco','Vermouth dry','Sherry fino','Sherry oloroso','Quinquina','Porto tawny','Marsala','Amaro siciliano'];
export const ABV={bia:40,inv:43,liq:28,ama:28,ver:17,vin:15,bir:5,sak:15};
export const ABVX={'Chartreuse verde':55,'Chartreuse gialla':43,'Fernet':39,'Assenzio':60,'Maraschino':32,'Triple sec':40,'Grand Marnier':40,'Bénédictine':40,'Strega':40,'Galliano':42,'Drambuie':40,'Limoncello':30,'Bitter rosso':25,'Aperitivo':11,'Angostura':44,'Orange bitters':40,"Peychaud's":35,'Pedro Ximénez':17,'Porto tawny':20,'Porto ruby':20,'Madeira':19,'Marsala':18,'Sherry fino':15,'Sherry oloroso':18,'Champagne':12,'Prosecco':11,'Rum giamaicano':50,'Scotch torbato':46,'Vodka':40,'Mezcal':45,'Cachaça':40,'Baijiu':52,'Shochu':25,'Sake':15,'Umeshu':12,'Genever':38,'Crème de cassis':16,'Crème de violette':20,'Liquore di sambuco':20,'Amaretto':28,'Liquore al caffè':25,'Falernum':11,'Pimento dram':28,'Sloe gin':26,'Cherry Heering':24,'Mirto':30,'Génépy':40,'Nocino':40,'Pastis':45,'Sambuca':40,'Ouzo e raki':40,'Sotol':42,'Soju':17,'Batavia arrack':50,'Irish whiskey':40,'Gin Old Tom':42,'Bitter bianco':20,'Amer Picon':18,'Licor 43':31,'Amaro alle erbe':35,'Liquore di albicocca':24,'Crema di whisky':17,'Vino chinato':16};
export const abvOf=s=>(ABVX[s.name]??ABV[s.grp])/100;
export const SHAKEN=['sour','sour_albume','collins','julep','flip','royale','tiki','milkpunch'];
export const fmt=v=>(Math.round(v*10)/10).toString().replace('.',',');
export const has=(st,r)=>st.roles.includes(r);
export const lc=s=>s.charAt(0).toLowerCase()+s.slice(1);

export const PUNGENT=['Rafano','Wasabi','Peperoncino','Senape','Pepe di Sichuan','Cubebe','Pepe lungo','Nasturzio','Ravanello','Aglio','Cipolla','Scalogno','Porro','Erba cipollina','Aglio orsino'];
export const JUICY=['Limone','Lime','Arancia','Mandarino','Pompelmo','Bergamotto','Yuzu','Arancia amara'];
export const LIQDAIRY=['Latte','Kefir','Yogurt','Latticello','Panna acida'];
export const FRUIT=['pom','dru','bos','tro','mel'];
export const VEG=['fog','ste','cuc','sol','cru','rad','leg'];

// --- preferenze di ruolo per ingrediente ---
export function prefs(I,lab){
  const c=I.cat,n=I.name;
  if(n==='Albume'||n==='Tuorlo')return['texture'];
  if(n==='Panna')return lab?['fatwash','texture']:['texture','fatwash'];
  if(LIQDAIRY.includes(n))return['clarify','milkwash','texture'];
  if(n==='Tofu')return['clarify','milkwash'];
  if(n==='Cece'||n==='Fagiolo')return['texture','infuse'];
  if(n==='Zenzero')return lab?['sweet','infuse']:['sweet','infuse'];
  if(n==='Pepe')return lab?['infuse','sweet']:['sweet','infuse'];
  if(n==='Aglio nero'||n==='Chipotle')return['infuse','season'];
  if(n==='Peperoncino')return lab?['infuse','season']:['season','infuse'];
  if(PUNGENT.includes(n))return['season','infuse'];
  if(n==='Miso'||n==='Gochujang')return['sweet','season'];
  if(n==='Matcha'||n==='Cascara')return['sweet','infuse'];
  if(n==='Aceto balsamico')return['season','acid'];
  if(n==='Fumo di legno')return['smoke'];
  if(n==='Bottarga'||n==='Caviale')return['garnish','season'];
  if(n==='Katsuobushi')return['infuse','season'];
  if(n==='Bresaola')return['infuse'];
  if(c==='agr')return JUICY.includes(n)&&n!=='Arancia amara'?['acid','sweet','garnish']:['sweet','infuse','garnish'];
  if(FRUIT.includes(c))return lab?['sweet','infuse','muddle']:['muddle','sweet','infuse'];
  if(VEG.includes(c))return lab?['sweet','infuse']:['muddle','sweet','infuse'];
  if(c==='sec')return['infuse','sweet'];
  if(['gus','cer','for'].includes(c))return lab?(I.st.g>=4||n==='Pop-corn'?['fatwash','infuse','sweet']:['infuse','sweet']):['sweet','infuse'];
  if(c==='all')return['season','infuse'];
  if(c==='fun')return lab&&n.startsWith('Tartufo')?['fatwash','infuse']:['infuse'];
  if(c==='alg')return['season','infuse'];
  if(c==='erb')return lab?['sweet','infuse','garnish']:['muddle','sweet','garnish'];
  if(c==='spe')return lab?['infuse','sweet']:['sweet','infuse'];
  if(c==='bot')return['season','infuse'];
  if(c==='fio')return lab?['infuse','sweet','garnish']:['sweet','garnish','infuse'];
  if(c==='lat')return['fatwash'];
  if(['ffr','crf','crl','dur','blu','fpa'].includes(c))return['fatwash'];
  if(['car','sel','salu','gra'].includes(c))return I.st.g>=2?['fatwash']:['infuse'];
  if(['pes','cro','itt','bro','cfe','sali','con','vfe'].includes(c))return['season','garnish'];
  if(c==='mie'||c==='dol')return['sweet'];
  if(c==='cac')return n==='Fave di cacao'?['infuse','sweet']:(lab?['fatwash','sweet']:['sweet','infuse']);
  if(c==='caf')return['infuse','sweet'];
  if(c==='tea')return['infuse','sweet'];
  if(c==='ace')return['acid','season'];
  if(c==='aci')return['acid','season'];
  if(c==='bfe')return['length','acid'];
  if(c==='aff')return['smoke'];
  return['infuse'];
}

// --- parametri di infusione ---
export function infP(I){const c=I.cat,n=I.name;
  if(c==='erb')return{T:50,t:'45 min',cold:'1–2 h',q:'15 g di foglie'};
  if(c==='fio')return{T:50,t:'45 min',cold:'2–6 h',q:n==='Lavanda'?'2 g di fiori':'8 g di fiori'};
  if(c==='agr')return{T:50,t:'1 h',cold:'12 h',q:'le scorze di 2 frutti, senza albedo'};
  if(c==='tea')return{T:50,t:'30 min',cold:'1–2 h',q:'10 g di tè'};
  if(c==='caf')return{T:55,t:'1 h',cold:'12 h',q:'40 g di caffè macinato grosso'};
  if(c==='cac')return{T:60,t:'1 h 30',cold:'24 h',q:'40 g di fave tostate e frantumate'};
  if(c==='spe'){const pot=I.ar.some(v=>v>=5)||I.int>=5;return{T:60,t:'1 h',cold:'12–24 h',q:pot?'4 g, tostati e schiacciati':'8 g, tostati e schiacciati'};}
  if(c==='bot')return{T:60,t:'1 h',cold:'24–48 h',q:'5 g'};
  if(['gus','cer'].includes(c))return{T:60,t:'2 h',cold:'48 h',q:'120 g, tostati in forno a 160 °C per 8–10 min',pre:true};
  if(c==='for')return{T:60,t:'1 h',cold:'24 h',q:n==='Pop-corn'?'40 g di pop-corn senza sale':'100 g, sbriciolati e tostati'};
  if(c==='sec')return{T:60,t:'2 h',cold:'48 h',q:'150 g, a pezzi'};
  if(c==='fun')return{T:60,t:'2 h',cold:'48 h',q:n.startsWith('Tartufo')?'8 g a lamelle':'15 g secchi o 150 g freschi'};
  if(c==='alg')return{T:60,t:'1 h',cold:'24 h',q:'10 g'};
  if(c==='all')return{T:55,t:'1 h',cold:'24 h',q:n==='Aglio nero'?'3 spicchi':'20 g'};
  if(c==='itt')return{T:55,t:'30 min',cold:'24 h',q:'5 g'};
  if(n==='Peperoncino'||n==='Chipotle')return{T:50,t:'20–40 min (assaggia ogni 10 min)',cold:'2–6 h',q:'1 frutto aperto, senza semi'};
  if(n==='Pepe')return{T:60,t:'45 min',cold:'6 h',q:'6 g di grani schiacciati'};
  if(['car','sel','salu'].includes(c))return{T:55,t:'2 h',cold:'48 h',q:'60 g a pezzi'};
  if(FRUIT.includes(c)||VEG.includes(c))return{T:55,t:'2 h',cold:'24–48 h',q:'200 g, a pezzi'};
  return{T:55,t:'1 h',cold:'24 h',q:'50 g'};
}

// --- preparazioni ---
export function prepSweet(I,lab,st){const n=I.name,c=I.cat;
  if(c==='agr'){
    if(lab)return{label:`Oleo saccharum di ${lc(n)} al roner`,steps:[`Ricava le scorze di 3 frutti senza albedo e mettile sottovuoto con 100 g di zucchero.`,`Roner a 50 °C per 1 h: gli oli essenziali si sciolgono nello zucchero senza cuocere.`,`Aggiungi 50 ml di acqua tiepida, massaggia il sacchetto e filtra fine.`]};
    return{label:`Oleo saccharum di ${lc(n)}`,steps:[`Ricava le scorze di 3 frutti senza albedo.`,`Coprile con 100 g di zucchero, pestale appena e lascia riposare 2–4 h.`,`Sciogli con 50 ml di acqua tiepida (o di succo) e filtra.`]};}
  if(n==='Zucchero bianco')return{label:st.id==='oldfashioned'?'Sciroppo semplice 2:1':'Sciroppo semplice 1:1',steps:null};
  if(n==='Zucchero integrale')return{label:'Sciroppo di zucchero integrale 2:1',steps:[`Sciogli 200 g di zucchero integrale in 100 ml di acqua calda e raffredda.`]};
  if(n==='Agave')return{label:'Nettare d\'agave diluito 2:1',steps:[`Mescola 2 parti di nettare d'agave e 1 parte d'acqua.`]};
  if(n==='Sciroppo d\'acero')return{label:'Sciroppo d\'acero',steps:null};
  if(n==='Melassa')return{label:'Sciroppo alla melassa',steps:[`Sciogli 1 cucchiaio di melassa in 150 ml di sciroppo 2:1 di zucchero integrale.`]};
  if(n==='Caramello')return{label:'Sciroppo di caramello',steps:[`Carammella a secco 200 g di zucchero fino al colore ambrato.`,`Togli dal fuoco e versa piano 200 ml di acqua calda (attenzione agli schizzi); mescola fino a scioglimento.`]};
  if(n==='Malto d\'orzo')return{label:'Sciroppo di malto 1:1',steps:[`Sciogli il malto in pari peso d'acqua tiepida.`]};
  if(c==='mie')return{label:`Sciroppo di ${lc(n)} 3:1`,steps:[`Sciogli 3 parti di miele in 1 parte di acqua calda e raffredda.`]};
  if(n==='Miso'||n==='Gochujang')return{label:`Sciroppo al ${lc(n)}`,steps:[`Sciogli ${n==='Miso'?'20 g di miso':'10 g di gochujang'} in 250 ml di sciroppo 1:1 tiepido.`,`Filtra fine e conserva in frigo.`]};
  if(n==='Zenzero')return lab?{label:'Sciroppo di zenzero al roner',steps:[`Affetta 150 g di zenzero e mettilo sottovuoto con 250 g di zucchero e 150 ml d'acqua.`,`Roner a 70 °C per 1 h.`,`Raffredda, filtra e aggiungi 2 g di acido citrico per tenere viva la pungenza.`]}
    :{label:'Sciroppo di zenzero fresco',steps:[`Grattugia o centrifuga 200 g di zenzero e spremi il succo in una garza.`,`Mescola succo e zucchero 1:1 a freddo fino a scioglimento.`]};
  if(n==='Matcha')return{label:'Sciroppo al matcha',steps:[`Setaccia 4 g di matcha e sbattilo con 30 ml di acqua a 75 °C.`,`Unisci a 200 ml di sciroppo 1:1; agita prima dell'uso.`]};
  if(FRUIT.includes(c)||VEG.includes(c)){
    const veg=VEG.includes(c);
    if(lab){const acid=I.t.acido>=3;return{label:`Cordial di ${lc(n)} al roner`,steps:[`Metti sottovuoto 300 g di ${lc(n)} pulito e a pezzi con 150 g di zucchero.`,`Roner a 55 °C per 2 h: estrai l'aroma fresco senza cuocere.`,`Raffredda in acqua e ghiaccio, filtra premendo e pesa il liquido.`,`Per ogni 500 g di liquido porta lo zucchero a 300 g totali e aggiungi ${acid?'4 g di acido citrico e 2 g di malico (il frutto è già acido)':'8 g di acido citrico e 4 g di malico'}.`,`Mescola a freddo fino a scioglimento; si conserva 2 settimane in frigo.`]};}
    if(veg)return{label:`Cordial di ${lc(n)}`,steps:[`Centrifuga ${lc(n)} e filtra: ti servono 250 ml di estratto.`,`Sciogli a freddo 250 g di zucchero e 3 g di acido citrico; usa entro 3 giorni.`]};
    return{label:`Sciroppo di ${lc(n)} a freddo`,steps:[`Taglia 250 g di ${lc(n)} a pezzi.`,`Copri con 250 g di zucchero, schiaccia appena e lascia macerare 12 h in frigo.`,`Filtra premendo con un cucchiaio; dura una settimana in frigo.`]};}
  if(c==='erb'){
    if(lab)return{label:`Sciroppo di ${lc(n)} al roner`,steps:[`Metti sottovuoto 15 g di foglie con 250 ml di sciroppo 1:1.`,`Roner a 55 °C per 1 h, poi subito in acqua e ghiaccio.`,`Filtra fine; 1 g di acido ascorbico (vitamina C) fissa il colore, se lo hai.`]};
    return{label:`Sciroppo verde di ${lc(n)}`,steps:[`Sbollenta 30 g di foglie per 10 s e raffreddale in acqua e ghiaccio.`,`Frullale 30 s con 250 ml di sciroppo 1:1 freddo.`,`Filtra con un colino fine; usa entro 3 giorni, poi il verde vira.`]};}
  if(c==='fio'){const q=n==='Lavanda'?'2 g':'10 g';
    if(lab)return{label:`Sciroppo di ${lc(n)} al roner`,steps:[`Metti sottovuoto ${q} di fiori con 250 ml di sciroppo 1:1.`,`Roner a 50 °C per 45 min, raffredda in acqua e ghiaccio e filtra.`]};
    return{label:`Sciroppo di ${lc(n)}`,steps:[`Metti ${q} di fiori in 250 ml di sciroppo 1:1 freddo.`,`Lascia in infusione 12 h in frigo${n==='Lavanda'?' (la lavanda bastano 2 h: assaggia)':''} e filtra.`]};}
  if(c==='spe'||c==='sec'||c==='bot'){const q=c==='sec'?'100 g a pezzi':'10 g tostati in padella per 1 min';
    if(lab)return{label:`Sciroppo di ${lc(n)} al roner`,steps:[`Metti sottovuoto ${q} di ${lc(n)} con 250 g di zucchero e 250 ml d'acqua.`,`Roner a 80 °C per 1 h, raffredda e filtra.`]};
    return{label:`Sciroppo di ${lc(n)}`,steps:[`Unisci ${q} di ${lc(n)} a 250 ml d'acqua e 250 g di zucchero.`,`Sobbolli 5 min, lascia in infusione 30 min a fuoco spento e filtra.`]};}
  if(c==='gus'||c==='cer'||c==='for'){const orz=c==='gus';
    return{label:orz?`Orzata di ${lc(n)}`:`Sciroppo tostato di ${lc(n)}`,steps:[`Tosta 100 g di ${lc(n)} in forno a 160 °C per 8–10 min.`,`Frulla con 300 ml d'acqua${lab?' e passa sottovuoto in roner a 60 °C per 1 h':' e lascia riposare 1 h'}.`,`Filtra in un'étamine strizzando bene; per ogni 100 ml aggiungi 100 g di zucchero.`,orz?`Profuma con 1 goccia di acqua di fiori d'arancio (facoltativa).`:`Conserva in frigo fino a 5 giorni.`]};}
  if(c==='tea')return{label:`Sciroppo di ${lc(n)}`,steps:[lab?`Metti sottovuoto 10 g di tè con 250 ml d'acqua; roner a 70 °C per 30 min.`:`Infondi 10 g di tè in 250 ml d'acqua a 80 °C (95 °C per tè nero e rooibos) per 4 min.`,`Filtra e sciogli 250 g di zucchero.`]};
  if(c==='caf')return{label:n==='Cascara'?'Sciroppo di cascara':'Sciroppo al caffè',steps:[n==='Cascara'?`Infondi 30 g di cascara in 250 ml d'acqua a 90 °C per 8 min e filtra.`:`Prepara un cold brew: 50 g di caffè macinato grosso in 250 ml d'acqua per 12 h, poi filtra.`,`Sciogli 250 g di zucchero a freddo.`]};
  if(c==='cac')return{label:`Sciroppo di ${lc(n)}`,steps:[`Sciogli 40 g di ${lc(n)} (o 25 g di cacao amaro) in 250 ml d'acqua calda con 250 g di zucchero.`,`Sobbolli 3 min e filtra fine.`]};
  return{label:`Sciroppo di ${lc(n)}`,steps:[`Infondi ${lc(n)} in 250 ml di sciroppo 1:1 caldo per 30 min e filtra.`]};
}
export function prepAcid(I,lab){const n=I.name,c=I.cat;
  if(c==='agr'){
    if(!lab)return{label:`Succo di ${lc(n)}`,steps:null,note:'spremuto al momento e filtrato'};
    if(['Limone','Lime','Yuzu','Bergamotto'].includes(n))return{label:`Oleo-citrato di ${lc(n)}`,steps:[`Ricava le scorze di 4 frutti senza albedo e coprile con 30 g di acido citrico e 15 g di acido malico.`,`Lascia riposare 1 h: l'acido estrae gli oli dalle scorze.`,`Aggiungi 700 ml d'acqua, frulla 30 s e filtra fine.`,`Ottieni un acido intorno al 6%, come un succo, limpido e stabile una settimana in frigo.`]};
    return{label:`Succo di ${lc(n)} corretto`,steps:[`Spremi e filtra fine.`,`Per ogni 100 ml aggiungi ${n==='Pompelmo'?'2 g di acido citrico e 1 g di malico':'3 g di acido citrico e 2 g di malico'}: arriva all'acidità del lime.`]};}
  if(n==='Acido citrico')return{label:'Soluzione di acido citrico al 6%',steps:[`Sciogli 60 g di acido citrico in 940 ml d'acqua: acidità tipo limone, limpida e senza ossidazione.`]};
  if(n==='Acido malico')return{label:'Soluzione di acido malico al 6%',steps:[`Sciogli 60 g di acido malico in 940 ml d'acqua: acidità verde, da mela croccante.`]};
  if(n==='Acido lattico')return{label:'Soluzione di acido lattico al 5%',steps:[`Diluisci l'acido lattico in acqua fino al 5%: acidità morbida, quasi da yogurt.`]};
  if(n==='Verjus')return{label:'Verjus',steps:null,note:'filtrato'};
  if(c==='ace')return{label:n,steps:null,cap:10};
  if(c==='bfe')return{label:n,steps:null,cap:30};
  // frutta o verdura usata come acido (solo laboratorio)
  return{label:`Succo di ${lc(n)} corretto a lime`,steps:[`Centrifuga o frulla ${lc(n)} e filtra fine.`,`Per ogni 100 ml aggiungi 4 g di acido citrico e 2 g di acido malico.`,`Mescola fino a scioglimento; usa in giornata.`]};
}
export function prepSeason(I,lab,st){const n=I.name,c=I.cat;const stirred=['oldfashioned','martini','negroni'].includes(st.id);
  if(c==='sali')return{label:`Soluzione salina di ${lc(n)} al 20%`,qty:'4 gocce',steps:[`Sciogli 20 g di ${lc(n)} in 80 ml d'acqua calda e versa in un contagocce.`]};
  if(['Salsa di soia','Salsa Worcestershire','Salsa piccante'].includes(n))return{label:n,qty:'2 dash',steps:null};
  if(n==='Colatura di alici')return{label:n,qty:'1 goccia',steps:null};
  if(n==='Estratto di lievito'||n==='Miso'||n==='Gochujang')return{label:`Soluzione di ${lc(n)}`,qty:'1 barspoon',steps:[`Sciogli 10 g di ${lc(n)} in 50 ml di acqua calda e filtra.`]};
  if(c==='alg'&&lab)return{label:`Acqua salina di ${lc(n)}`,qty:'5 gocce',steps:[`Metti sottovuoto 10 g di ${lc(n)} con 500 ml d'acqua; roner a 60 °C per 1 h.`,`Filtra e sciogli 50 g di sale: è un concentrato di sapidità marina.`]};
  if(c==='vfe'){if(n==='Umeboshi')return{label:'Purea di umeboshi',qty:'1 barspoon',steps:[`Snocciola 1 umeboshi e frullalo con 20 ml d'acqua.`]};
    return{label:`Salamoia di ${lc(n)}`,qty:stirred?'5 ml':'7,5 ml',ml:stirred?5:7.5,steps:[`Filtra la salamoia del barattolo con un colino fine.`]};}
  if(['Ostrica','Cozza','Riccio di mare'].includes(n))return{label:`Acqua di ${lc(n)}`,qty:'5 ml',ml:5,steps:[`Raccogli l'acqua di mare di ${lc(n)} freschissimi all'apertura e filtrala in un filtro di carta. Tienila in frigo e usala in giornata.`]};
  if(c==='pes'||c==='cro')return{label:`Brodo chiarificato di ${lc(n)}`,qty:'15 ml',ml:15,steps:[`Tosta 5 min ritagli, lische o carapaci di ${lc(n)}, copri con 300 ml d'acqua e sobbolli 20 min.`,`Filtra con filtro di carta, sala al 2% e raffredda.`]};
  if(c==='bro')return{label:`${n} chiarificato`,qty:'15 ml',ml:15,steps:[`Prepara un ${lc(n)} leggero e passalo in filtro di carta.`,`Sala al 2% e servilo freddo.`]};
  if(c==='con')return{label:n,qty:'1 barspoon',steps:null};
  if(c==='ace')return{label:n,qty:'1 barspoon',steps:null};
  if(c==='aci')return{label:`Soluzione di ${lc(n)} al 6%`,qty:'2 ml',ml:2,steps:[`Sciogli 6 g di ${lc(n)} in 94 ml d'acqua: un tocco di luce senza aggiungere succo.`]};
  if(c==='itt')return{label:`Tintura di ${lc(n)}`,qty:'3 gocce',steps:[`Metti ${n==='Acciuga'?'2 filetti':'5 g'} di ${lc(n)} in 100 ml di vodka.`,`Lascia in infusione 48 h, filtra in un contagocce e conserva in frigo.`]};
  const q=c==='bot'?'5 g':n==='Peperoncino'?'2 frutti aperti':['Rafano','Wasabi'].includes(n)?'20 g grattugiati':c==='alg'?'10 g':'15 g';
  const t=['Rafano','Wasabi','Peperoncino'].includes(n)?'24 h':c==='bot'?'72 h':'48 h';
  return{label:`Tintura di ${lc(n)}`,qty:'3 gocce',steps:[`Metti ${q} di ${lc(n)} in 100 ml di vodka (meglio se a 60%).`,`Lascia in infusione ${t}, filtra in un contagocce.`]};
}
export function fatSrc(I,lab){const n=I.name,c=I.cat;
  if(n==='Burro')return'100 g di burro fuso';
  if(n==='Burro nocciola')return'100 g di burro cotto in padella fino al colore nocciola';
  if(n==='Ghee')return'80 g di ghee fuso';
  if(n==='Panna')return'150 g di panna';
  if(n==='Mascarpone'||n==='Ricotta')return`100 g di ${lc(n)} e 50 g di burro, sciolti a 50 °C`;
  if(n==='Olio extravergine')return'60 ml di olio extravergine';
  if(c==='gra')return`30 ml di ${lc(n)}`;
  if(['ffr','crf','crl','dur','blu','fpa'].includes(c))return`100 g di burro e 60 g di ${lc(n)} a pezzi, scaldati a 60 °C ${lab?'nel roner per 1 h in sacchetto':'a bagnomaria per 20 min'} e filtrati`;
  if(n.startsWith('Tartufo'))return`100 g di burro con 10 g di ${lc(n)} a lamelle, a 60 °C per 30 min`;
  if(n==='Lardo')return'80 g di lardo fuso a fuoco basso';
  if(['car','sel','salu'].includes(c))return`60 g di grasso fuso di ${lc(n)} (rosola 200 g a fuoco basso e raccogli il grasso)`;
  if(n==='Pop-corn')return'60 g di burro fuso con 30 g di pop-corn appena scoppiati';
  if(c==='gus')return`80 g di pasta pura di ${lc(n)} (100%)`;
  if(c==='cac')return`60 g di ${lc(n)} fuso a bagnomaria`;
  return`80 g di ${lc(n)}`;
}

// --- scelta automatica tramite il motore di abbinamento ---
export function bestOf(names,foods,isSp,extra,excl=[]){
  let best=null,bv=-1;
  for(const nm of names){const cand=isSp?SBYNAME[nm]:BYNAME[nm];if(!cand||foods.includes(cand)||excl.includes(cand))continue;
    const pool=foods.concat(extra||[]).filter(x=>x!==cand);if(!pool.length){if(!best)best=cand;continue;}
    const sc=pool.map(f=>f.isSpirit&&cand.isSpirit?12:S(f.isSpirit?cand:f,f.isSpirit?f:cand).total);
    const v=sc.reduce((a,b)=>a+b,0)/sc.length+0.4*Math.min(...sc);if(v>bv){bv=v;best=cand;}}
  return best;
}
export function rankBases(foods,exclude=[],styleId){
  const pref=PREFB[styleId]||[];
  const cands=SPIRITS.filter(s=>(s.grp==='bia'||s.grp==='inv')&&!exclude.includes(s));
  return cands.map(s=>{const sc=foods.length?foods.map(f=>S(f,s).total):[15];const pi=pref.indexOf(s.name);
    return{s,v:sc.reduce((a,b)=>a+b,0)/sc.length+0.4*Math.min(...sc)+(pi>=0?4-pi*0.25:-4)};}).sort((a,b)=>b.v-a.v).map(x=>x.s);
}

// --- costruzione di una ricetta ---
export function buildRecipe(inputs,styleId,mode,baseOverride){
  const st=STY[styleId],lab=mode==='lab',low=mode==='low';
  const foods=inputs.filter(i=>!i.isSpirit),sps=inputs.filter(i=>i.isSpirit);
  const R={st,mode,preps:[],spec:[],notes:[],used:[],skipped:[],garn:[],season:[],infuse:[],fats:[],milk:null,smoke:false,clar:null};
  // basi
  let base=null,base2=null,mods=[],liqSweet=null,lengthSp=null;
  const isDist=x=>x.grp==='bia'||x.grp==='inv';
  const baseSp=sps.filter(isDist);
  if(low){base=bestOf(LOWB,foods,true);}
  else if(baseOverride)base=baseOverride;
  else if(baseSp.length)base=baseSp[0];
  if(!base)base=suggestBases(foods,st.id)[0]?.s||rankBases(foods,[],st.id)[0];
  if(!low){const others=baseSp.filter(x=>x!==base);if(others.length)base2=others[0];}
  if(st.split&&!base2)base2=low?bestOf(LOWB,foods,true,[],[base]):rankBases(foods,[base],st.id)[0];
  sps.filter(x=>!isDist(x)&&x!==base).forEach(x=>{
    if((x.grp==='vin'&&['Champagne','Prosecco'].includes(x.name))||x.grp==='bir'){if(st.length&&!lengthSp)lengthSp=x;else mods.push(x);}
    else if(x.grp==='liq'&&st.sweet&&!['martini','negroni','spritz'].includes(st.id)&&!liqSweet)liqSweet=x;
    else mods.push(x);});
  const bRole=!base?null:isDist(base)?'dist':base.grp==='ama'?'bitter':base.grp==='ver'?'vermouth':'altro';
  const spritzBase=st.id==='spritz'?base:null;
  if(!st.base)base=null;
  const pickDist=()=>rankBases(foods,[base,base2].filter(Boolean),st.id)[0];
  const BITTERS=['Bitter rosso','Aperitivo','Amaro al carciofo','Amaro alpino','Bitter alla genziana','Amaro al rabarbaro','Amaro siciliano'];
  const VERMS=['Vermouth rosso','Vermouth bianco','Vermouth dry','Quinquina','Sherry oloroso','Porto tawny'];
  // modificatori di stile
  const modSlots=[];
  if(st.id==='martini'){
    if(bRole==='vermouth')modSlots.push({ml:st.mod,s:mods.find(isDist)||bestOf(['Gin London Dry','Gin contemporaneo','Vodka','Genever','Rye whiskey'],foods,true,[base],[base])});
    else modSlots.push({ml:st.mod,s:mods.shift()||bestOf(['Vermouth dry','Vermouth bianco','Quinquina','Sherry fino','Sherry oloroso'],foods,true,base?[base]:[],[base])});}
  if(st.id==='negroni'){
    const fill=(test,list)=>{const m=mods.find(test);if(m){mods=mods.filter(x=>x!==m);return m;}return list?bestOf(list,foods,true,[],[base]):pickDist();};
    if(bRole==='bitter'){modSlots.push({ml:st.mod,s:fill(isDist,null)});modSlots.push({ml:st.mod2,s:fill(x=>x.grp==='ver',VERMS)});}
    else if(bRole==='vermouth'){modSlots.push({ml:st.mod,s:fill(isDist,null)});modSlots.push({ml:st.mod2,s:fill(x=>x.grp==='ama',BITTERS)});}
    else{modSlots.push({ml:st.mod,s:fill(x=>x.grp==='ama',BITTERS)});modSlots.push({ml:st.mod2,s:fill(x=>x.grp==='ver',VERMS)});}}
  if(st.id==='flip')modSlots.push({ml:st.mod,s:mods.shift()||bestOf(['Porto ruby','Porto tawny','Pedro Ximénez','Marsala','Madeira','Amaretto','Liquore al caffè','Crème de cacao','Liquore di nocciola'],foods,true,[],[base])});
  if(st.id==='spritz'){const AP=['Aperitivo','Bitter rosso','Vermouth bianco','Liquore di sambuco','Quinquina','Amaro al carciofo','Sherry fino'];
    if(spritzBase&&isDist(spritzBase)){modSlots.push({ml:30,s:spritzBase});modSlots.push({ml:30,s:mods.shift()||bestOf(AP,foods,true)});}
    else modSlots.push({ml:st.mod,s:spritzBase||mods.shift()||bestOf(AP,foods,true)});}
  if(st.id==='tiki')modSlots.push({ml:st.mod,s:liqSweet||mods.shift()||bestOf(['Falernum','Pimento dram','Triple sec','Maraschino','Grand Marnier','Amaretto'],foods,true)});
  if(st.id==='tiki'&&liqSweet)liqSweet=null;
  mods.forEach(m=>modSlots.push({ml:st.id==='oldfashioned'?10:15,s:m,extra:true}));
  // assegnazione ruoli agli alimenti
  const roles={acid:[],sweet:[],muddle:[],texture:[],length:[]};const acidJuice=new Set();
  const STIRRED=['oldfashioned','martini','negroni'].includes(st.id);
  foods.forEach(I=>{let pl=prefs(I,lab);if(STIRRED&&pl.includes('infuse')&&!['mie','dol','agr','spe','gus','cer','for','caf','cac','tea'].includes(I.cat))pl=['infuse',...pl.filter(x=>x!=='infuse')];
    let r=pl.find(x=>has(st,x)||(x==='infuse'&&has(st,'modinfuse')));
    if(r==='clarify'&&!has(st,'clarify'))r=has(st,'milkwash')?'milkwash':null;
    if(!r){if(I.cat==='uov'||LIQDAIRY.includes(I.name)){R.skipped.push(I);return;}r=has(st,'infuse')||has(st,'modinfuse')?'infuse':'garnish';}
    if(r==='milkwash'&&R.milk){R.skipped.push(I);return;}
    if(r==='infuse')R.infuse.push(I);else if(r==='fatwash')R.fats.push(I);else if(r==='milkwash')R.milk=I;else if(r==='clarify')R.clar=I;
    else if(r==='season')R.season.push(I);else if(r==='garnish')R.garn.push(I);else if(r==='smoke')R.smoke=I;else roles[r].push(I);});
  // laboratorio: frutta come acido se manca l'agrume
  if(lab&&st.acid&&!st.acidOpt&&!roles.acid.length){const f=roles.sweet.find(I=>FRUIT.includes(I.cat)||VEG.includes(I.cat))||roles.muddle.find(I=>FRUIT.includes(I.cat));
    if(f){roles.sweet=roles.sweet.filter(x=>x!==f);roles.muddle=roles.muddle.filter(x=>x!==f);roles.acid.push(f);acidJuice.add(f);}}
  // se il budget di zucchero è piccolo, gli ingredienti aromatici passano nella base, così non spariscono
  {const bud=(st.sweet||0)-(roles.muddle.length?5:0)-(base&&!isDist(base)&&st.base?base.t.dolce*2.5*(st.base/50):0);
   if(!lab&&bud<10&&(has(st,'infuse')||has(st,'modinfuse'))&&roles.sweet.length){const mv=roles.sweet.filter(I=>FRUIT.includes(I.cat)||VEG.includes(I.cat)||['erb','spe','fio','sec'].includes(I.cat));
     if(bud>=5&&mv.length===roles.sweet.length)mv.pop();mv.forEach(I=>{roles.sweet=roles.sweet.filter(x=>x!==I);R.infuse.push(I);});}}
  // quantità
  const lines=[];let alc=0,liq=0;
  const add=(ml,name,o={})=>{lines.push({ml,name,...o});if(!o.post&&!o.drop)liq+=ml;if(o.abv)alc+=ml*o.abv;};
  // base (con infusioni e fat-wash)
  const infTarget=st.base?base:(modSlots[0]&&modSlots[0].s);
  let tName=infTarget?infTarget.name:'';const treat=[];
  if(R.fats.length)treat.push(`fat-washed con ${listIt(R.fats.map(f=>lc(f.name)))}`);
  if(R.milk)treat.push(`milk-washed con ${lc(R.milk.name)}`);
  if(R.infuse.length)treat.push(`infuso ${lab?'al roner ':''}con ${listIt(R.infuse.map(i=>lc(i.name)))}`);
  const tLabel=tName+(treat.length?' '+treat.join(' e '):'');
  if(st.base){
    if(base2&&st.split){add(st.base/2,tLabel,{abv:abvOf(base),sp:base});add(st.base/2,base2.name,{abv:abvOf(base2),sp:base2});}
    else if(base2){add(st.base*0.67,tLabel,{abv:abvOf(base),sp:base});add(st.base*0.33,base2.name,{abv:abvOf(base2),sp:base2});}
    else add(st.base,tLabel,{abv:abvOf(base),sp:base});}
  modSlots.forEach((m,i)=>{if(!m.s)return;add(m.ml,(!st.base&&i===0)?tLabel:m.s.name,{abv:abvOf(m.s),sp:m.s});});
  // prep: fat-wash, milk-wash, infusione
  if(R.fats.length&&infTarget){const CHE=['ffr','crf','crl','dur','blu','fpa'];const F=R.fats;
    R.preps.push({title:`Fat-wash: ${infTarget.name} con ${listIt(F.map(f=>lc(f.name)))}`,steps:(lab&&F.some(f=>CHE.includes(f.cat)||f.name.startsWith('Tartufo')))?
    [`In un sacchetto sottovuoto metti 700 ml di ${infTarget.name} con ${listIt(F.map(f=>CHE.includes(f.cat)?`100 g di burro e 60 g di ${lc(f.name)} a pezzi`:f.name.startsWith('Tartufo')?`100 g di burro e 10 g di ${lc(f.name)} a lamelle`:fatSrc(f,lab)))}.`,`Roner a 55 °C per 2 h: il grasso si scioglie e trattiene gli aromi.`,`Versa in un contenitore largo e metti in congelatore per 12 h.`,`Rompi il disco di grasso e filtra con filtro di carta. Conserva in frigo, consuma entro 2 settimane.`]
    :[`Prepara il grasso: ${F.map(f=>fatSrc(f,lab)).join('; ')}.`,`Versalo ancora liquido in 700 ml di ${infTarget.name} in un contenitore largo e agita bene.`,`Lascia 2 h a temperatura ambiente, agitando ogni 30 min.`,`Congelatore per 12 h: il grasso si solidifica in superficie${F.some(f=>f.cat==='gra')?' (gli oli restano in parte liquidi: separali con un imbuto separatore o una siringa)':''}.`,`Rompi lo strato di grasso e filtra con filtro di carta. Conserva in frigo, consuma entro 2 settimane.`]});}
  if(R.milk&&infTarget)R.preps.push({title:`Milk-wash di ${infTarget.name}`,steps:[`Versa 400 ml di ${infTarget.name}${R.fats.length?' (già lavato)':''} in 100 ml di ${R.milk.name==='Tofu'?'latte di soia':lc(R.milk.name)} freddo: sempre l'alcol nel latte, mai il contrario.`,`Aggiungi 2 g di acido citrico sciolti in 10 ml d'acqua: il latte caglia.`,`Riposa 30 min in frigo senza mescolare.`,`Filtra con filtro di carta, ripassando le prime colature torbide: il distillato esce limpido, rotondo e più morbido.`]});
  if(R.infuse.length&&infTarget){
    if(lab){const ps=R.infuse.map(infP);const T=Math.min(...ps.map(p=>p.T));const longest=ps.map(p=>p.t).sort((a,b)=>parseFloat(b)-parseFloat(a))[0];
      const pre=R.infuse.filter((I,i)=>ps[i].pre);
      R.preps.push({title:`Infusione al roner di ${infTarget.name}`,steps:[...(pre.length?[`Tosta ${listIt(pre.map(i=>lc(i.name)))} in forno a 160 °C per 8–10 min.`]:[]),
        `In un sacchetto sottovuoto metti 500 ml di ${infTarget.name}${R.fats.length||R.milk?' già lavato':''} con ${listIt(R.infuse.map((I,i)=>`${ps[i].q.replace(/, tostati.*$/,'')} di ${lc(I.name)}`))}.`,
        `Sigilla bene e cuoci a ${T} °C per ${R.infuse.length>1?'il tempo più lungo tra gli ingredienti, '+longest:longest}. Con l'alcol non superare i 60 °C: il sacchetto si gonfia e l'aroma evapora.`,
        `Raffredda subito in acqua e ghiaccio per 15 min.`,`Filtra con chinois e filtro di carta; conserva in frigo.`]});}
    else{const ps=R.infuse.map(infP);
      R.preps.push({title:`Infusione a freddo di ${infTarget.name}`,steps:[`In un barattolo metti 500 ml di ${infTarget.name} con ${listIt(R.infuse.map((I,i)=>`${ps[i].q} di ${lc(I.name)}`))}.`,
        ...R.infuse.map((I,i)=>`${I.name}: ${ps[i].cold} (assaggia: le note amare arrivano per ultime).`),`Filtra con colino fine e filtro di carta. Se gli ingredienti hanno tempi diversi, toglili uno alla volta.`]});}}
  // acido
  if(st.acid){let left=st.acid;const parts=[];
    const weakA=!lab&&roles.acid.length&&roles.acid.every(I=>I.cat==='agr'&&I.t.acido<4);
    roles.acid.forEach(I=>{const p=acidJuice.has(I)?prepAcid({...I,cat:'xx'},lab):prepAcid(I,lab);const share=Math.min(p.cap||99,(weakA?st.acid*0.5:st.acid)/roles.acid.length);parts.push({I,p,ml:share});left-=share;});
    if(left>=5&&(!st.acidOpt||weakA)){const d=bestOf(['Limone','Lime','Verjus'],foods,false,base?[base]:[]);const p=prepAcid(d,lab);parts.push({I:d,p,ml:left,auto:true});}
    parts.forEach(x=>{add(x.ml,x.p.label+(x.p.note?` (${x.p.note})`:''),{auto:x.auto});if(x.p.steps)R.preps.push({title:x.p.label,steps:x.p.steps});});}
  // dolce
  if(st.sweet){let tot=st.sweet;if(roles.muddle.length)tot-=5;if(st.id==='oldfashioned'&&roles.sweet.length>1)tot=10;
    if(base&&!isDist(base))tot-=base.t.dolce*2.5*(st.base/50);
    if(tot<2.5)tot=0;if(roles.sweet.length)tot=Math.max(tot,lab&&roles.sweet.some(I=>FRUIT.includes(I.cat)||VEG.includes(I.cat))?10:5);
    const parts=[];
    if(liqSweet){parts.push({label:liqSweet.name,ml:Math.min(15,tot+5),abv:abvOf(liqSweet)});tot=Math.max(0,tot-12.5);}
    if(roles.sweet.length>=2){const p=prepCombo(roles.sweet,lab);parts.push({label:p.label,ml:tot,combo:p});}
    else roles.sweet.forEach(I=>parts.push({I,ml:tot}));
    if(!roles.sweet.length&&!liqSweet&&!st.sweetOpt&&tot>0){
      const pick=bestOf(['Zucchero bianco','Zucchero integrale','Agave','Miele di acacia','Sciroppo d\'acero'],foods,false,base?[base]:[]);parts.push({I:pick,ml:tot,auto:true});}
    parts.forEach(x=>{if(x.combo){add(x.ml,x.label);R.preps.push({title:x.label,steps:x.combo.steps});return;}if(x.label){add(x.ml,x.label,{abv:x.abv});return;}const p=prepSweet(x.I,lab,st);add(x.ml,p.label,{auto:x.auto});if(p.steps&&!R.preps.some(q=>q.title===p.label))R.preps.push({title:p.label,steps:p.steps});});}
  else if(roles.sweet.length>=2){const p=prepCombo(roles.sweet,lab);add(st.id==='negroni'?5:7.5,p.label);R.preps.push({title:p.label,steps:p.steps});}
  else roles.sweet.forEach(I=>{const p=prepSweet(I,lab,st);add(st.id==='negroni'?5:7.5,p.label);if(p.steps)R.preps.push({title:p.label,steps:p.steps});});
  // texture
  let texture=null;
  if(st.texture||roles.texture.length){const I=roles.texture[0];
    const kind=I?I.name:(st.texture==='albume'?'Albume':'Tuorlo');
    if(kind==='Albume'){add(25,lab?'Albume (o 20 ml di acquafaba)':'Albume fresco');texture='albume';}
    else if(kind==='Tuorlo'){add(20,'1 tuorlo');texture='tuorlo';}
    else if(kind==='Panna'){add(30,'Panna fresca');texture='panna';}
    else if(kind==='Cece'||kind==='Fagiolo'){add(25,`Acquafaba di ${lc(kind)}`);texture='albume';R.preps.push({title:`Acquafaba di ${lc(kind)}`,steps:[`Usa il liquido di cottura di ${lc(kind)} (anche in barattolo, senza sale).`,`Se è poco denso riducilo di un terzo sul fuoco e raffredda: deve montare come un albume.`]});}
    else if(LIQDAIRY.includes(kind)){add(30,kind);texture='panna';}}
  // muddle
  roles.muddle.forEach(I=>{const q=I.cat==='erb'?'8–10 foglie':FRUIT.includes(I.cat)?'3–4 pezzi (circa 40 g)':'3 fette';lines.push({ml:0,name:`${q} di ${lc(I.name)}, da pestare`,drop:true});});
  // condimenti e bitter
  R.season.forEach(I=>{const p=prepSeason(I,lab,st);if(p.ml)add(p.ml,p.label);else lines.push({ml:0,name:`${p.qty} di ${lc(p.label)}`,drop:true});if(p.steps)R.preps.push({title:p.label,steps:p.steps});});
  if(st.bitters&&!low){const b=bestOf(['Angostura',"Peychaud's",'Orange bitters'],foods,true,base?[base]:[]);lines.push({ml:0,name:`${st.bitters} dash di ${b.name}`,drop:true});}
  // allungo
  let lengthLbl=null;
  if(st.length){const lp=roles.length[0];
    if(st.id==='spritz'||st.id==='royale'){const bub=lengthSp||bestOf(lab?['Champagne','Prosecco','Sidro']:['Prosecco','Champagne','Sidro'],foods,true);
      const bml=st.id==='spritz'?90:60;lines.push({ml:bml,name:bub.name,post:true,abv:abvOf(bub)});alc+=bml*abvOf(bub);
      if(st.id==='spritz'){lines.push({ml:30,name:lp?lp.name:'Soda',post:true});}lengthLbl=bub.name;}
    else{let mix=lp?lp.name:(lengthSp?lengthSp.name:null);
      if(!mix){const pro=FAM.map((_,i)=>foods.reduce((s,f)=>s+f.ar[i],0));const spicy=pro[FI.sp]+pro[FI.sd];const bitter=pro[FI.ag]+pro[FI.re]+(base&&/Gin|Genever/.test(base.name)?6:0);
        mix=base&&['Pastis','Ouzo e raki','Assenzio'].includes(base.name)&&st.id==='highball'?'Acqua fredda':base&&st.id==='highball'&&(base.grp==='ver'||FORT.includes(base.name))?'Acqua tonica':base&&st.id==='highball'&&base.grp==='ama'?'Soda':st.id==='collins'?'Soda':spicy>=6||foods.some(f=>f.name==='Zenzero')?'Ginger beer':bitter>=6?'Acqua tonica':'Soda';}
      const ml=st.length;lines.push({ml,name:mix,post:true,abv:lengthSp?abvOf(lengthSp):0});if(lengthSp)alc+=ml*abvOf(lengthSp);lengthLbl=mix;}}
  // chiarificazione (milk punch)
  if(st.id==='milkpunch'){const m=R.clar||BYNAME['Latte'];R.clarName=m.name==='Tofu'?'latte di soia':lc(m.name);liq+=0;}
  // garnish
  let garn=R.garn.map(I=>garnTxt(I));
  if(!garn.length){const g=pickGarnish(foods,R,st,lab,base);garn=[g.txt];if(g.prep)R.preps.push(g.prep);}
  if(roles.muddle.some(I=>I.cat==='erb')&&st.id==='julep')garn.unshift(`Bouquet abbondante di ${lc(roles.muddle.find(I=>I.cat==='erb').name)}`);
  // statistiche
  const dil=st.dil;const post=lines.filter(l=>l.post).reduce((s,l)=>s+l.ml,0);
  const vol=liq*(1+dil)+post;const abv=vol?alc/vol*100:0;
  R.spec=lines;R.vol=Math.round(vol);R.abv=abv;R.garnish=garn;R.base=base;R.base2=base2;R.texture=texture;R.lengthLbl=lengthLbl;R.foods=foods;R.mods=modSlots.map(m=>m.s).filter(Boolean);
  R.method=methodSteps(R,st,lab);
  R.why=whyTxt(R,foods,base||R.mods[0]);
  R.warn=warnings(R,inputs,lab,texture);
  return R;
}
export function garnTxt(I,st){const n=I.name,c=I.cat;
  if(c==='agr')return`Scorza di ${lc(n)}: spremi gli oli sul drink e appoggiala sul bordo`;
  if(c==='erb')return`Rametto o foglia di ${lc(n)}, battuto sul palmo per liberare l'aroma`;
  if(c==='fio')return`${n} fresco o essiccato, appoggiato sulla superficie`;
  if(c==='spe')return`${n} macinato o grattugiato al momento sulla superficie`;
  if(c==='vfe')return`${n} su stecco`;
  if(n==='Bottarga')return'Bottarga grattugiata su metà bordo';
  if(n==='Caviale')return'Un cucchiaino di caviale servito a parte';
  if(c==='sali')return`Mezzo bordo di ${lc(n)}`;
  if(FRUIT.includes(c))return`Fetta o spicchio di ${lc(n)}`;
  return`${n} in accompagnamento`;
}
export function methodSteps(R,st,lab){const s=[];const hasMud=R.spec.some(l=>/da pestare/.test(l.name));const smoke=R.smoke;
  const chill=`Raffredda il bicchiere (${lc(st.glass)}) in congelatore o con ghiaccio e acqua.`;
  if(smoke)s.push(`Affumica il bicchiere capovolto su trucioli di legno accesi (ciliegio, melo o quercia) per 10–15 s, o usa una pistola affumicatrice.`);
  switch(st.id){
    case 'oldfashioned':s.push(`Versa tutti gli ingredienti in un mixing glass con ghiaccio a cubi.`,`Mescola con il bar spoon per 20–25 s, finché il vetro esterno si appanna.`,`Filtra con lo strainer nel tumbler sul cubo grande.`);break;
    case 'martini':s.push(chill,`Versa gli ingredienti nel mixing glass pieno di ghiaccio duro.`,`Mescola 30 s: il drink deve arrivare intorno a −5 °C.`,`Filtra nel bicchiere ghiacciato, senza ghiaccio.`);break;
    case 'negroni':s.push(`Versa le tre parti nel mixing glass con ghiaccio.`,`Mescola 20 s e filtra nel tumbler sul cubo grande.`);break;
    case 'sour':s.push(chill,...(hasMud?[`Pesta delicatamente nello shaker gli ingredienti indicati, senza ridurli in poltiglia.`]:[]),`Versa il resto nello shaker, riempi di ghiaccio e agita con forza per 12 s.`,`Doppia filtrazione (strainer e colino fine) nella coppa.`);break;
    case 'sour_albume':s.push(chill,...(hasMud?[`Pesta delicatamente nello shaker gli ingredienti indicati.`]:[]),`Versa tutto nello shaker senza ghiaccio e fai un dry shake di 10 s per montare la schiuma.`,`Aggiungi ghiaccio e agita altri 12 s.`,`Doppia filtrazione nella coppa; lascia assestare la schiuma 20 s.`,`Se vuoi, disegna 3 gocce di bitter sulla schiuma.`);break;
    case 'collins':if(lab)s.push(`Versione da laboratorio: prepara in batch tutto tranne la soda, aggiungi 40 ml d'acqua per dose e filtra fine.`,`Raffredda il batch a 0 °C e carbonalo in un sifone (2 cariche di CO₂) o in un carbonatore.`,`Versa nel tumbler alto con ghiaccio, inclinando il bicchiere per non perdere bollicine.`);
      else s.push(...(hasMud?[`Pesta delicatamente nello shaker gli ingredienti indicati.`]:[]),...(R.texture?[`Dry shake di 10 s senza ghiaccio per montare la texture.`]:[]),`Agita con ghiaccio per 10 s.`,`Filtra nel tumbler alto pieno di ghiaccio e colma con ${lc(R.lengthLbl||'soda')} fredda.`,`Una sola mescolata dal basso verso l'alto.`);break;
    case 'highball':if(lab)s.push(`Versione da laboratorio: unisci base, eventuali cordial e acido con il mixer in una bottiglia e raffredda a 0 °C.`,`Ricarbona con un sifone o un carbonatore: bollicine più fini e più persistenti.`,`Versa nel bicchiere su ghiaccio trasparente inclinandolo.`);
      else s.push(`Riempi il bicchiere di ghiaccio e scola l'acqua di fusione.`,`Versa base e gli altri ingredienti, mescola 3 s per raffreddare.`,`Colma con ${lc(R.lengthLbl||'il mixer')} freddo versandolo lungo il bar spoon.`,`Una sola mescolata dal basso verso l'alto.`);break;
    case 'julep':s.push(`Pesta delicatamente nel bicchiere ${hasMud?'gli ingredienti indicati':'lo sciroppo'} con lo sciroppo.`,`Aggiungi la base e riempi a metà di ghiaccio tritato.`,`Mescola con swizzle stick o bar spoon finché il bicchiere brina.`,`Completa con ghiaccio tritato a cupola.`);break;
    case 'flip':s.push(chill,`Versa tutto nello shaker senza ghiaccio e fai un dry shake di 10 s.`,`Aggiungi ghiaccio e agita con forza per 15 s.`,`Doppia filtrazione nel bicchiere.`);break;
    case 'spritz':s.push(`Riempi il calice di ghiaccio.`,`Versa prima le bollicine, poi l'aperitivo e gli altri ingredienti: si mescolano da soli.`,`Completa con la soda e una mescolata leggera.`);break;
    case 'royale':s.push(chill,...(hasMud?[`Pesta delicatamente nello shaker gli ingredienti indicati.`]:[]),`Agita con ghiaccio per 8 s.`,`Doppia filtrazione nel bicchiere e colma con ${R.lengthLbl} ben freddo.`);break;
    case 'tiki':s.push(`Versa tutto nello shaker con una manciata di ghiaccio tritato e fai un whip shake breve (5 s).`,`Versa senza filtrare nel bicchiere e completa con ghiaccio tritato.`,`Mescola con lo swizzle stick, ruotandolo tra le mani, finché il bicchiere brina.`);break;
    case 'milkpunch':s.push(`Prepara in batch almeno 10 dosi: unisci tutti gli ingredienti tranne il latte.`,`Scalda appena il ${R.clarName} (30 ml per dose) a 40 °C e versaci sopra il mix acido, lentamente: il latte caglia subito.`,`Lascia riposare 30 min senza mescolare.`,`Filtra con filtro di carta; ripassa le prime colature torbide finché esce limpido (anche 2–3 h).`,`Imbottiglia e conserva in frigo fino a 2 mesi. Per servire, mescola 70 ml sul cubo grande per 10 s.`);break;
  }
  s.push(`Guarnisci: ${lc(R.garnish[0])}.`);
  return s;
}
export function whyTxt(R,foods,base){const out=[];
  const pairs=[];for(let i=0;i<foods.length;i++)for(let j=i+1;j<foods.length;j++)pairs.push(S(foods[i],foods[j]));
  pairs.sort((a,b)=>b.total-a.total);
  pairs.slice(0,2).forEach(p=>out.push(`${p.A.name} + ${p.B.name}: ${TYPELBL[p.type].toLowerCase()}, ${p.total}/30. ${p.summary.split(/(?<=\.)\s/)[0]}`));
  if(base&&foods.length){const bs=foods.map(f=>S(f,base)).sort((a,b)=>b.total-a.total)[0];out.push(`${base.name} con ${bs.A.name}: ${bs.total}/30. ${bs.summary.split(/(?<=\.)\s/)[0]}`);}
  const weak=pairs.filter(p=>p.total<14);
  weak.slice(0,1).forEach(p=>{const br=bridgesFor(p.A,p.B,1)[0];out.push(`${p.A.name} e ${p.B.name} dialogano poco (${p.total}/30)${br?`: ${br.c.name} fa da ponte`:''}.`);});
  return out;
}
export function warnings(R,inputs,lab,texture){const w=new Set();
  inputs.forEach(I=>{if(I.note)w.add(`${I.name}: ${I.note}.`);const a=ALLERG[I.cat];if(a)w.add(`Allergeni: ${a} (${I.name}).`);});
  if(texture==='albume'||texture==='tuorlo')w.add('Uova crude: freschissime e da filiera controllata, o pastorizzate.');
  if(R.fats.length)w.add('Fat-wash: filtra bene, conserva in frigo e consuma entro 2 settimane.');
  if(lab&&R.preps.some(p=>/roner/i.test(p.title+p.steps.join(' '))))w.add('Roner con alcol: sacchetti di qualità, ben sigillati, mai oltre 60 °C.');
  R.skipped.forEach(I=>w.add(`${I.name} non si adatta a questo stile: prova Sour con albume, Flip o Milk Punch.`));
  return [...w];
}

// --- suggerimento del distillato di base per vicinanza organolettica ---
export const NOBASE=['Angostura',"Peychaud's",'Orange bitters','Champagne','Prosecco','Bianco aromatico','Sauvignon blanc','Rosso tannico','Rosso leggero'];
export const BASES=SPIRITS.filter(s=>s.grp!=='bir'&&!NOBASE.includes(s.name));
export const BGROUPS=[['dist','Distillati',s=>s.grp==='bia'||s.grp==='inv'],['ama','Amari e bitter',s=>s.grp==='ama'],['ver','Vermouth e vini',s=>s.grp==='ver'||s.grp==='vin'||s.grp==='sak'],['liq','Liquori',s=>s.grp==='liq']];
export function suggestBases(foods,styleId,group){
  if(!foods.length)return[];
  const pref=PREFB[styleId]||[];
  let pool=styleId==='spritz'?BASES.filter(s=>!(s.grp==='bia'||s.grp==='inv')):BASES;
  if(group&&group!=='all'){const g=BGROUPS.find(x=>x[0]===group);pool=pool.filter(g[2]);}
  pool=pool.filter(s=>styleFit(s,styleId).ok);
  return pool.map(s=>{
    const per=foods.map(f=>({f,r:S(f,s)}));const sc=per.map(p=>p.r.total);
    const mean=sc.reduce((a,b)=>a+b,0)/sc.length,mn=Math.min(...sc);
    const ov=FAM.map((_,i)=>[i,foods.reduce((t,f)=>t+Math.min(f.ar[i],s.ar[i]),0)]).filter(x=>x[1]>=2).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>FAM[x[0]][1].toLowerCase());
    const best=per.slice().sort((a,b)=>b.r.total-a.r.total)[0];
    const fit=pref.includes(s.name),dist=s.grp==='bia'||s.grp==='inv';
    return{s,mean:r05(mean),rank:mean+0.4*mn+(fit?2:0)+(!dist&&!['spritz','highball','negroni'].includes(styleId)?-3:0)+(!dist&&s.t.dolce>=4&&styleId!=='flip'?-3:0),per,ov,best,fit};
  }).sort((a,b)=>b.rank-a.rank);
}

// --- sciroppo o cordial unico con più ingredienti ---
export function prepCombo(list,lab){
  const F=list.filter(I=>FRUIT.includes(I.cat)||VEG.includes(I.cat)||I.cat==='sec'),H=list.filter(I=>I.cat==='erb'||I.cat==='fio'||I.cat==='tea'),P=list.filter(I=>!F.includes(I)&&!H.includes(I));
  const names=listIt(list.map(I=>lc(I.name)));const q=I=>I.cat==='spe'||I.cat==='bot'?(I.int>=5?'3 g':'6 g'):I.cat==='erb'?'15 g':I.cat==='fio'?(I.name==='Lavanda'?'2 g':'8 g'):I.cat==='tea'?'8 g':I.cat==='agr'?'le scorze di 2 frutti':I.cat==='sec'?'100 g':'200 g';
  const steps=[];
  if(lab){const T=P.some(I=>['spe','bot','gus','cer','caf','cac'].includes(I.cat))?60:55;
    if(P.some(I=>I.cat==='spe'))steps.push(`Tosta in padella per 1 min ${listIt(P.filter(I=>I.cat==='spe').map(I=>lc(I.name)))} e schiaccia appena.`);
    steps.push(`In un sacchetto sottovuoto metti ${list.map(I=>`${q(I)} di ${lc(I.name)}`).join(', ')}, 200 g di zucchero e ${F.length?'50':'200'} ml d'acqua.`);
    steps.push(`Roner a ${T} °C per ${F.length?'2 h':'1 h'}: estrai frutta, erbe e spezie insieme senza cuocere.`);
    steps.push(`Raffredda in acqua e ghiaccio, filtra con un'étamine strizzando e pesa il liquido.`);
    steps.push(`Per ogni 500 g aggiungi ${F.some(I=>I.t.acido>=3)?'3 g di acido citrico e 2 g di malico':'6 g di acido citrico e 3 g di malico'}: il cordial resta vivo e dura 2 settimane in frigo.`);
    return{label:`Cordial al roner di ${names}`,steps};}
  if(P.length)steps.push(`Sobbolli ${P.map(I=>`${q(I)} di ${lc(I.name)}`).join(' e ')} in 200 ml d'acqua per 5 min${P.some(I=>I.cat==='spe')?' (tosta prima le spezie in padella per 1 min)':''}, poi sciogli 200 g di zucchero e lascia intiepidire.`);
  if(F.length)steps.push(`Taglia ${F.map(I=>`${q(I)} di ${lc(I.name)}`).join(' e ')} e copri con ${P.length?'lo sciroppo tiepido':'200 g di zucchero'}; lascia macerare 12 h in frigo.`);
  if(H.length)steps.push(`${F.length||P.length?'Nelle ultime 2 h aggiungi':'Infondi in 250 ml di sciroppo 1:1 freddo per 12 h'} ${H.map(I=>`${q(I)} di ${lc(I.name)}`).join(' e ')}, appena strappati.`);
  steps.push(`Filtra premendo con un cucchiaio; dura 5 giorni in frigo.`);
  return{label:`Sciroppo di ${names}`,steps};
}
// --- garnish meno scontati ---
export const UPS=['martini','sour','sour_albume','flip','royale'];
export function garnIdeas(I,lab,st){const n=lc(I.name),c=I.cat;const up=UPS.includes(st.id);const o=[];
  if(c==='agr'){o.push({txt:`Twist di scorza di ${n}: spremi gli oli sul drink e scartala`});if(lab)o.push({txt:`Ruota di ${n} disidratata`,prep:{title:`Ruote di ${n} disidratate`,steps:[`Affetta ${n} a 2 mm, disponi su carta forno e asciuga a 60 °C per 6–8 h (o in essiccatore).`,`Conserva in un barattolo con gel di silice.`]}});}
  if(c==='erb'){if(lab)o.push({txt:`Tre gocce di olio di ${n} sulla superficie`,prep:{title:`Olio verde di ${n}`,steps:[`Sbollenta 30 g di foglie per 10 s e raffreddale in acqua e ghiaccio; asciugale bene.`,`Frulla con 100 ml di olio di semi per 2 min, fino a 60 °C.`,`Filtra con un filtro di carta e conserva in frigo in un contagocce.`]}});
    const rocks=['oldfashioned','negroni','milkpunch'].includes(st.id);o.push({txt:up?`Una foglia di ${n} galleggiante, battuta sul palmo`:rocks?`Foglia di ${n} battuta sul palmo e appoggiata sul cubo di ghiaccio`:`Cima di ${n} battuta sul palmo e infilata accanto alla cannuccia`});}
  if(FRUIT.includes(c)&&c!=='sec'){if(lab)o.push({txt:`Polvere di ${n} su metà bordo`,prep:{title:`Polvere di ${n}`,steps:[`Affetta ${n} sottile e disidrata a 60 °C per 8–10 h, finché è croccante.`,`Frulla e setaccia; inumidisci metà bordo con una scorza d'agrume e passalo nella polvere.`]}});
    o.push({txt:up?`Mezza ${n} sul bordo, tagliata a ventaglio`:`Fetta di ${n} appoggiata sul ghiaccio`});}
  if(c==='spe'||c==='bot'){o.push({txt:`Mezzo bordo di zucchero al ${n}`,prep:{title:`Zucchero al ${n}`,steps:[`Frulla 50 g di zucchero semolato con 2 g di ${n} tostato, fino a una sabbia fine.`,`Inumidisci metà bordo con una scorza di limone e passalo nello zucchero.`]}});
    if(lab)o.push({txt:`Nebulizza la tintura di ${n} sopra il drink (2 spruzzi con l'atomizzatore)`,prep:{title:`Tintura di ${n} da nebulizzare`,steps:[`Metti 10 g di ${n} schiacciato in 100 ml di vodka a 60%.`,`Lascia 48 h, filtra e versa in un atomizzatore.`]}});}
  if(c==='fio'){o.push({txt:`Petali di ${n} sulla superficie`});if(lab)o.push({txt:`Spruzzo di acqua di ${n} sul bicchiere`});}
  if(['dur','fpa'].includes(c))o.push({txt:`Cialda croccante di ${n} sul bordo`,prep:{title:`Cialda di ${n}`,steps:[`Distribuisci 20 g di ${n} grattugiato in un disco sottile in una padella antiaderente calda.`,`Cuoci 1–2 min finché è dorato, stacca e lascia raffreddare su un mattarello per curvarlo.`]}});
  if(c==='salu')o.push({txt:`Chip di ${n} croccante su stecco`,prep:{title:`Chip di ${n}`,steps:[`Affetta ${n} sottilissimo, cuoci in forno a 180 °C per 8–10 min tra due fogli di carta forno.`,`Lascia raffreddare su carta assorbente.`]}});
  if(c==='gus'||c==='cer')o.push({txt:`${I.name} tostato e tritato su metà bordo`});
  if(c==='cac'||c==='caf')o.push({txt:lab?`${I.name} in polvere spolverato con uno stencil sulla schiuma`:`${I.name} grattugiato finissimo`});
  if(c==='mie')o.push({txt:`Goccia di ${n} su una foglia di salvia o un cracker accanto al drink`});
  return o;
}
export function pickGarnish(foods,R,st,lab,base){
  const used=new Set(R.preps.map(p=>p.title));const pri=I=>(['agr','erb','fio'].includes(I.cat)?3:0)+(R.fats.includes(I)?1:0);
  if(st.id==='flip'&&!lab)return{txt:'Noce moscata grattugiata al momento'};
  const ideas=[];foods.slice().sort((a,b)=>pri(b)-pri(a)).forEach(I=>garnIdeas(I,lab,st).forEach(x=>{if(!(x.prep&&used.has(x.prep.title)))ideas.push(x);}));
  const auto=bestOf(['Arancia amara','Bergamotto','Pompelmo','Limone','Lime','Shiso','Rosmarino','Timo','Salvia','Menta'],foods,false,base?[base]:[]);
  if(auto)garnIdeas(auto,lab,st).slice(0,1).forEach(x=>ideas.push(x));
  if(!ideas.length)return{txt:garnTxt(auto,st)};
  const k=(STYLES.indexOf(st)+(lab?1:0))%Math.min(ideas.length,4);
  return ideas[k];
}
// --- coerenza: base adatta allo stile e ingredienti che dialogano ---
export const ANISE=['Assenzio','Pastis','Ouzo e raki','Sambuca'];
export const FORT=['Sherry fino','Sherry oloroso','Pedro Ximénez','Porto tawny','Porto ruby','Madeira','Marsala','Sauternes'];
export const NEUTRAL=['Vodka','Soju','Shochu'];
export function styleFit(b,id){if(!b)return{ok:true};
  const g=b.grp,n=b.name,abv=abvOf(b),pct=Math.round(abv*100),dist=g==='bia'||g==='inv';const OK={ok:true};const no=why=>({ok:false,why});const st=STY[id].name;
  if(ANISE.includes(n)){const okS=n==='Sambuca'?['highball','flip']:['highball','julep','sour','sour_albume','collins','royale'];return okS.includes(id)?OK:no(`${n} è un anice intenso: come base regge solo allungato, in un sour o sul ghiaccio tritato, non in un ${st}`);}
  switch(id){
    case 'oldfashioned':if(dist&&NEUTRAL.includes(n))return no(`${n} è troppo neutra per un Old Fashioned: zucchero e bitter non hanno niente da esaltare`);
      if(dist||(g==='ama'&&abv>=0.25)||(g==='liq'&&abv>=0.40))return OK;
      return no(`${n} (${pct}%) è troppo leggero o dolce per reggere da solo un Old Fashioned: serve una base di almeno 25–40% che sostenga zucchero e bitter`);
    case 'martini':if(dist||g==='ver'||['Sherry fino','Sherry oloroso','Madeira','Sake'].includes(n))return OK;
      return no(`Il Martini è secco e tagliente: ${n} è troppo ${g==='liq'||g==='vin'?'dolce':'amaro'} come base. Usalo come modificatore o in un Negroni`);
    case 'negroni':if(dist||g==='ama'||g==='ver')return OK;return no(`Il Negroni vuole distillato, bitter e vermouth: ${n} non copre nessuno dei tre ruoli`);
    case 'julep':if((dist&&!NEUTRAL.includes(n))||FORT.includes(n)||(g==='ama'&&abv>=0.28))return OK;return no(`Nel Julep la base deve reggere molto ghiaccio tritato: ${n} si diluisce fino a sparire`);
    case 'flip':if((dist&&!NEUTRAL.includes(n))||FORT.includes(n)||g==='liq'||(g==='ama'&&abv>=0.28))return OK;return no(`Il Flip vuole una base con corpo (brandy, rum, whisky, porto, sherry, un liquore): ${n} si perde sotto il tuorlo`);
    case 'royale':if(FORT.includes(n)||g==='sak')return no(`${n} appesantisce le bollicine: per un Royale meglio un distillato, un liquore o un aperitivo`);return OK;
    case 'tiki':if(dist&&!NEUTRAL.includes(n))return OK;return no(`Il Tiki si regge su basi distillate robuste (rum, agave, whisky): ${n} sparisce tra spezie, agrumi e ghiaccio tritato`);
    case 'milkpunch':if(dist||g==='ama'||g==='ver')return OK;return no(`${n} non regge la chiarificazione col latte: serve un distillato, un amaro o un vermouth`);
    default:return OK;}
}
export function coherence(ins,styleId,base){
  const foods=ins.filter(i=>!i.isSpirit);const block=[],warn=[],bridges=[];
  const f=styleFit(base,styleId);if(!f.ok)block.push({k:'style',txt:f.why+'.'});
  for(let i=0;i<foods.length;i++)for(let j=i+1;j<foods.length;j++){const r=S(foods[i],foods[j]);
    if(r.total<12){const br=bridgesFor(foods[i],foods[j],1)[0];block.push({k:'pair',txt:`${foods[i].name} e ${foods[j].name} non dialogano (${fmt(r.total)}/30). ${r.summary.split(/(?<=\.)\s/).find(s=>/stridono|Attenzione|entrambi/.test(s))||''}`.trim(),rm:[foods[i],foods[j]]});if(br)bridges.push(br.c);}
    else if(r.total<14)warn.push(`${foods[i].name} e ${foods[j].name} dialogano poco (${fmt(r.total)}/30): calibra le dosi.`);}
  if(base&&f.ok)foods.forEach(x=>{const r=S(x,base).total;if(r<11.5)block.push({k:'base',txt:`${base.name} non lega con ${x.name} (${fmt(r)}/30).`});else if(r<13)warn.push(`${base.name} e ${x.name} legano poco (${fmt(r)}/30).`);});
  const pref=PREFB;
  const altStyles=STYLES.filter(s=>s.id!==styleId&&styleFit(base,s.id).ok).sort((a,b)=>((pref[b.id]||[]).includes(base?.name)?1:0)-((pref[a.id]||[]).includes(base?.name)?1:0)).slice(0,4);
  const altBases=suggestBases(foods,styleId).filter(x=>x.s!==base).slice(0,3).map(x=>x.s);
  return{block,warn,altStyles,altBases,bridges:[...new Set(bridges)].slice(0,3)};
}
