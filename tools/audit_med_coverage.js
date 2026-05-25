// Outil de QA (#7) — audit de couverture de la base de médicaments.
// Vérifie quels DCI d'une liste de référence sont absents de MASTER_DB (un médicament
// absent ne peut générer aucune alerte, quelle que soit la qualité des règles).
//
// Usage :
//   node tools/audit_med_coverage.js                 # liste de référence intégrée
//   node tools/audit_med_coverage.js Atorvastatine Ranolazine Quinine   # DCI ad hoc
//
// Recherche par DCI + princeps (insensible casse/accents), comme l'autocomplétion.

const path = require('path');
const { loadApp } = require(path.join(__dirname, '..', 'oracle_harness'));
const vm = require('vm');
const { sandbox } = loadApp();

// Liste de référence : molécules fréquentes en gériatrie / médecine interne, par classe.
const REFERENCE = {
  'Cardio': ['Bisoprolol','Aténolol','Ramipril','Périndopril','Losartan','Valsartan','Amlodipine','Furosémide','Spironolactone','Hydrochlorothiazide','Indapamide','Digoxine','Amiodarone','Dronédarone','Flécaïnide','Sotalol','Ivabradine','Ranolazine','Nicorandil','Trinitrine','Isosorbide'],
  'Anticoag/antiagr': ['Warfarine','Acénocoumarol','Apixaban','Rivaroxaban','Dabigatran','Édoxaban','Énoxaparine','Tinzaparine','Acide acétylsalicylique','Clopidogrel','Ticagrélor'],
  'Diabéto': ['Metformine','Gliclazide','Glibenclamide','Sitagliptine','Dapagliflozine','Empagliflozine','Sémaglutide','Insuline glargine','Pioglitazone'],
  'SNC/psy': ['Sertraline','Paroxétine','Citalopram','Escitalopram','Venlafaxine','Duloxétine','Mirtazapine','Amitriptyline','Lithium','Halopéridol','Rispéridone','Olanzapine','Quétiapine','Clozapine','Diazépam','Lorazépam','Zopiclone','Zolpidem','Bupropion','Varénicline'],
  'Neuro': ['Lévodopa','Pramipexole','Rasagiline','Sélégiline','Carbamazépine','Valproate','Lamotrigine','Phénytoïne','Lévétiracétam','Topiramate','Gabapentine','Prégabaline','Trihexyphénidyle'],
  'Antalg/rhumato': ['Paracétamol','Ibuprofène','Naproxène','Diclofénac','Kétoprofène','Célécoxib','Morphine','Oxycodone','Fentanyl','Tramadol','Codéine','Buprénorphine','Néfopam','Colchicine','Allopurinol','Fébuxostat','Méthotrexate'],
  'Os': ['Alendronate','Risédronate','Acide zolédronique','Dénosumab','Tériparatide','Raloxifène','Cholécalciférol','Calcium'],
  'Infectieux': ['Amoxicilline','Ciprofloxacine','Lévofloxacine','Nitrofurantoïne','Cotrimoxazole','Gentamicine','Vancomycine','Métronidazole','Clarithromycine','Azithromycine','Rifampicine','Fluconazole','Aciclovir','Valaciclovir','Hydroxychloroquine'],
  'Gastro/pneumo': ['Oméprazole','Pantoprazole','Ésoméprazole','Cimétidine','Métoclopramide','Dompéridone','Ondansétron','Lopéramide','Salbutamol','Tiotropium','Théophylline','Montélukast','Budésonide'],
  'Endoc/uro/divers': ['Lévothyroxine','Carbimazole','Prednisone','Prednisolone','Hydrocortisone','Tamoxifène','Ciclosporine','Tacrolimus','Oxybutynine','Toltérodine','Solifénacine','Tamsulosine','Desmopressine','Sildénafil','Quinine','Ginkgo','Millepertuis','Pseudoéphédrine','Mélatonine','Sulfate ferreux','Phytoménadione']
};

const sanitize = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const exists = dci => {
  const q = sanitize(dci);
  if (!q) return false;
  const code = `(function(){var q=${JSON.stringify(q)};return MASTER_DB.MEDICAMENTS.some(function(m){var d=(m.dci||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]/g,'');var p=(m.princeps||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]/g,'');return d===q||(d.length>3&&(d.indexOf(q)>=0||q.indexOf(d)>=0))||(p.length>3&&p.indexOf(q)>=0);});})()`;
  return vm.runInContext(code, sandbox);
};

const argv = process.argv.slice(2);
let groups;
if (argv.length) groups = { 'Ad hoc': argv };
else groups = REFERENCE;

let total = 0, present = 0;
const absents = [];
for (const [cat, list] of Object.entries(groups)) {
  const miss = [];
  list.forEach(dci => { total++; if (exists(dci)) present++; else { miss.push(dci); absents.push(dci); } });
  if (miss.length) console.log(`⚠ ${cat} : absents → ${miss.join(', ')}`);
  else console.log(`✓ ${cat} : couverture complète (${list.length})`);
}
console.log(`\n===== Couverture base : ${present}/${total} (${Math.round(present / total * 100)}%) =====`);
if (absents.length) console.log(`Médicaments absents (${absents.length}) : ${absents.join(', ')}`);
process.exit(0);
