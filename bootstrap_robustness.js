// ============================================================================
// Bootstrap ROBUSTESSE — N cas cliniques UNIQUES, pipeline complet, invariants
// ============================================================================
// Différent de bootstrap_audit.js :
//   - Audit_v4 : applique des détecteurs STATIQUES sur la base (cohérence base)
//   - Robustness : exécute le PIPELINE COMPLET (GeriaEngineV2 + scores + DDI)
//     sur chaque cas et vérifie des INVARIANTS CLINIQUES.
//
// Chaque cas est UNIQUE (hash signature dans Set → dédup).
// Variations : age × sexe × bio (10 dim) × comorbids × prescription phénotype.
// ============================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;

// ─── Charger fichiers JS comme modules (avec wrapping) ─────────────────────────
function loadModule(filename, exportName) {
    const code = fs.readFileSync(path.join(ROOT, filename), 'utf-8');
    const wrapped = code + `\nmodule.exports = ${exportName};`;
    const tmp = path.join(ROOT, `.tmp_${filename}`);
    fs.writeFileSync(tmp, wrapped);
    const mod = require(tmp);
    fs.unlinkSync(tmp);
    return mod;
}

const MASTER_DB = loadModule('geria_database.js', 'MASTER_DB');
const PATHOLOGY_RULES = loadModule('geria_pathology_rules_v3.js', 'PATHOLOGY_RULES_DB');
const GERIA_RECOS_DB = loadModule('geria_recos_final.js', 'GERIA_RECOS_DB');

// Stub minimal global pour GeriaEngineV2 (qui utilise performance, console)
global.GERIA_RECOS_DB = GERIA_RECOS_DB;
global.PATHOLOGY_RULES_DB = PATHOLOGY_RULES;
global.MASTER_DB = MASTER_DB;
global.performance = { now: () => Date.now() };

// Charger comme global via Function (les const top-level ne deviennent pas global en eval)
function loadAsGlobal(filename, exportNames) {
    const code = fs.readFileSync(path.join(ROOT, filename), 'utf-8');
    const assignments = exportNames.map(n => `global.${n} = ${n};`).join('\n');
    const fn = new Function(code + '\n' + assignments);
    fn();
}

loadAsGlobal('drug_classes.js', ['DRUG_CLASSES', 'matchesDrugClass']);
loadAsGlobal('geria_engine_v2.js', ['GeriaEngineV2']);
loadAsGlobal('composite_scores.js', ['SCORE_DEFINITIONS', 'calculateCompositeScores']);

console.log(`Loaded ${MASTER_DB.MEDICAMENTS.length} meds | ${GERIA_RECOS_DB.EVITER.length} EVITER | ${GERIA_RECOS_DB.INITIER.length} INITIER`);

// ─── Génération de cas cliniques uniques ──────────────────────────────────────
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sampleN(arr, n) {
    const copy = [...arr]; const out = [];
    for (let i = 0; i < n && copy.length > 0; i++) {
        out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
}
function gaussian(mu, sigma, min, max) {
    const u1 = Math.random(), u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    let v = mu + z * sigma;
    return Math.max(min, Math.min(max, v));
}

// Mapping comorbidité humaine → code PAT_xxx (utilisé par l'engine)
const COMORB_TO_PAT = {
    'HTA': 'PAT_005', 'FA': 'PAT_006', 'AVC': 'PAT_008',
    'IC': 'PAT_002', 'cardiopathie_ischemique': 'PAT_004',
    'demence': 'PAT_010', 'Parkinson': 'PAT_014', 'epilepsie': 'PAT_015',
    'DT2': 'PAT_016b', 'hypothyroidie': 'PAT_017', 'hyperthyroidie': 'PAT_018',
    'cancer_solide': 'PAT_020', 'asthme': 'PAT_022', 'BPCO': 'PAT_023',
    'goutte': 'PAT_024', 'osteoporose': 'PAT_025',
    'IRC': 'PAT_029', 'denutrition': 'PAT_037', 'incontinence': 'PAT_039',
    'glaucome': 'PAT_033', 'depression': 'PAT_032',
    'PR': 'PAT_055', 'chute_recente': 'PAT_009', 'HBP': 'PAT_040',
    'douleur_chronique': 'PAT_054'
};
const COMORB_POOL = Object.keys(COMORB_TO_PAT);

// Phénotypes cliniques réalistes (variations légères pour différenciation)
const PHENOTYPES = [
    { name: 'IC_HFrEF',     comorbs: ['IC','HTA','cardiopathie_ischemique'], meds_base: ['Bisoprolol','Ramipril','Furosemide','Spironolactone'] },
    { name: 'FA_anticoag',  comorbs: ['FA','HTA'],                          meds_base: ['Apixaban','Bisoprolol','Furosemide'] },
    { name: 'DT2_complic',  comorbs: ['DT2','HTA','IRC'],                   meds_base: ['Metformine','Empagliflozin','Atorvastatine','Ramipril'] },
    { name: 'BPCO_severe',  comorbs: ['BPCO','HTA'],                        meds_base: ['Tiotropium','Salbutamol','Prednisone'] },
    { name: 'Depression',   comorbs: ['depression','HTA'],                  meds_base: ['Sertraline','Mirtazapine','Trazodone'] },
    { name: 'Demence_aLB',  comorbs: ['demence','depression'],              meds_base: ['Donepezil','Memantine','Quetiapine'] },
    { name: 'Douleur_chron',comorbs: ['douleur_chronique','depression'],    meds_base: ['Tramadol','Paracetamol','Pregabaline'] },
    { name: 'Parkinson',    comorbs: ['Parkinson','depression'],            meds_base: ['Levodopa-carbidopa','Rasagiline'] },
    { name: 'Triple_whammy',comorbs: ['HTA','douleur_chronique'],           meds_base: ['Ramipril','Hydrochlorothiazide','Ibuprofene'] },
    { name: 'Chute_iatro',  comorbs: ['HTA','chute_recente','depression'],  meds_base: ['Zopiclone','Oxazepam','Mirtazapine','Furosemide','Bisoprolol'] },
    { name: 'QT_long',      comorbs: ['FA','depression'],                   meds_base: ['Citalopram','Clarithromycine','Ondansetron','Bisoprolol'] },
    { name: 'Hyperkaliemie',comorbs: ['IC','DT2','IRC'],                    meds_base: ['Ramipril','Spironolactone','Ibuprofene'] },
    { name: 'Hypoglyc',     comorbs: ['DT2','denutrition'],                 meds_base: ['Glibenclamide','Cotrimoxazole','Ramipril'] },
    { name: 'AVK_AINS',     comorbs: ['FA','PR'],                           meds_base: ['Warfarine','Ibuprofene','Aspirine'] },
    { name: 'Sero_sd',      comorbs: ['depression','douleur_chronique'],    meds_base: ['Sertraline','Tramadol','Linezolide'] },
    { name: 'IRC_severe',   comorbs: ['IRC','DT2','HTA'],                   meds_base: ['Metformine','Spironolactone','Gabapentine'] },
    { name: 'Palliatif',    comorbs: ['cancer_solide'],                     meds_base: ['Morphine','Haloperidol','Midazolam','Hyoscine butylbromide'] }
];

function generateUniqueClinicalCase(seenSigs, maxRetries = 10) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const phenotype = randChoice(PHENOTYPES);
        const age = Math.round(gaussian(78, 9, 60, 102));
        const sexe = randChoice(['H', 'F']);
        const dfg = Math.round(gaussian(60, 22, 8, 110));
        const k = +(gaussian(4.2, 0.6, 2.8, 7.0)).toFixed(2);
        const na = Math.round(gaussian(138, 4, 118, 152));
        const inr = +(gaussian(1.4, 0.9, 0.9, 8.5)).toFixed(2);
        const qtc = Math.round(gaussian(420, 35, 350, 600));
        const plaq = Math.round(gaussian(220, 80, 25, 700));
        const hb = +(gaussian(12.0, 2.0, 5.5, 17.0)).toFixed(1);
        const hba1c = +(gaussian(6.8, 1.4, 4.5, 13.5)).toFixed(1);
        const alat = Math.round(gaussian(30, 25, 8, 350));
        const tsh = +(gaussian(2.5, 2.5, 0.02, 30)).toFixed(2);
        const albumine_sg = Math.round(gaussian(36, 6, 18, 50));
        const mg = +(gaussian(0.85, 0.18, 0.4, 1.4)).toFixed(2);
        const lithium = phenotype.name === 'Depression' && Math.random() < 0.3
            ? +(gaussian(0.7, 0.4, 0.2, 2.5)).toFixed(2) : 0;

        // Comorbidités : base phénotype + 0-3 supp aléatoires
        const comorbs = [...phenotype.comorbs];
        const extras = sampleN(COMORB_POOL.filter(c => !comorbs.includes(c)), randInt(0, 4));
        comorbs.push(...extras);

        // Prescription : base phénotype + 1-8 méds aléatoires complémentaires
        const baseMeds = phenotype.meds_base
            .map(dci => MASTER_DB.MEDICAMENTS.find(m => (m.dci || '').toLowerCase() === dci.toLowerCase()))
            .filter(Boolean);
        const nExtra = randInt(1, 8);
        const otherMeds = MASTER_DB.MEDICAMENTS.filter(m => !baseMeds.includes(m));
        const extraMeds = sampleN(otherMeds, nExtra);
        const prescription = [...baseMeds, ...extraMeds];

        const cas = {
            phenotype: phenotype.name, age, sexe,
            bio: { dfg, k, na, inr, qtc, plaq, hb, hba1c, alat, tsh, albumine_sg, mg, lithium },
            comorbs,
            prescription: prescription.map(m => m.dci)
        };
        // Signature unique : âge + bio quantifié + comorbs triés + DCIs triées
        const sig = crypto.createHash('sha1').update(JSON.stringify({
            a: cas.age, s: cas.sexe,
            b: Object.values(cas.bio).map(v => Math.round(v * 10)).join(','),
            c: cas.comorbs.sort().join(','),
            p: cas.prescription.map(d => d.toLowerCase()).sort().join(',')
        })).digest('hex').slice(0, 16);
        if (seenSigs.has(sig)) continue;
        seenSigs.add(sig);
        cas._sig = sig;
        cas._prescription_objs = prescription;
        return cas;
    }
    return null;
}

// ─── Pipeline simulé : engine + scores + DDI ──────────────────────────────────
function runPipeline(cas) {
    const out = { cas: cas._sig, errors: [], outputs: {} };
    try {
        // 1. Composite scores
        out.outputs.scores = calculateCompositeScores(cas._prescription_objs);

        // 2. GeriaEngineV2 (STOPP/START/Beers/FORTA)
        const activeMeds = cas._prescription_objs.map(m => ({
            dci: m.dci, classe: m.classe || '', db_ref: m, label: m.dci
        }));
        // Convertir comorbs humaines → codes PAT (que l'engine matche)
        const activeComorbsPAT = cas.comorbs.map(c => COMORB_TO_PAT[c]).filter(Boolean);
        const ctx = {
            activeMeds,
            activeComorbs: activeComorbsPAT,
            ageNum: cas.age,
            dfgNum: cas.bio.dfg,
            sexe: cas.sexe,
            poidsNum: 70,
            bioK: cas.bio.k,
            bioNa: cas.bio.na,
            bioInr: cas.bio.inr,
            bioQtc: cas.bio.qtc,
            bioHb: cas.bio.hb,
            bioHba1c: cas.bio.hba1c,
            // bioValues : indispensable pour que les règles avec condition.bio
            // (ex: Metformine+DFG<30, Anti-aldostérone+DFG<30) se déclenchent.
            bioValues: {
                BIO_001: cas.bio.k,
                BIO_002: cas.bio.na,
                BIO_004: cas.bio.dfg,
                BIO_006: cas.bio.mg,
                BIO_009: cas.bio.hb,
                BIO_010: cas.bio.plaq,
                BIO_014: cas.bio.alat,
                BIO_019: cas.bio.tsh,
                BIO_030: cas.bio.inr,
                BIO_044: cas.bio.qtc
            }
        };
        out.outputs.engine = GeriaEngineV2.evaluer(ctx);

        // 3. DDI v2 manuel (simulation : on iterate ddi_interact_v2 sur les méds actifs)
        const ddiAlerts = []; // [{ src, target, classe, severite, commentaire }]
        const dciIndex = new Map(cas._prescription_objs.map(m => [(m.dci || '').toLowerCase(), m]));
        cas._prescription_objs.forEach(med => {
            (med.ddi_interact_v2 || []).forEach(rule => {
                (rule.dcis || []).forEach(target => {
                    if (typeof target !== 'string') return;
                    const tLow = target.toLowerCase();
                    const tMed = dciIndex.get(tLow);
                    if (!tMed) return;
                    if (tMed === med) return; // self-guard
                    ddiAlerts.push({
                        src: med.dci, target,
                        classe: rule.classe || '',
                        severite: rule.severite || 'warning',
                        commentaire: rule.commentaire || ''
                    });
                });
            });
        });
        out.outputs.ddi = ddiAlerts;
    } catch (e) {
        out.errors.push({ phase: 'pipeline', message: e.message, stack: (e.stack || '').slice(0, 300) });
    }
    return out;
}

// ─── Invariants cliniques : assertions DOIT contenir ──────────────────────────
const INVARIANTS = [
    {
        name: 'Triple_whammy_detected',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            const hasIEC = dcis.some(d => /^(ramipril|enalapril|captopril|lisinopril|perindopril|benazepril|fosinopril|trandolapril|quinapril)$/.test(d));
            const hasARA = dcis.some(d => /^(losartan|valsartan|candesartan|irbesartan|olmesartan|telmisartan)$/.test(d));
            const hasDiur = dcis.some(d => /^(furosemide|torasemide|bumetanide|hydrochlorothiazide|indapamide|chlortalidone)$/.test(d));
            const hasAINS = dcis.some(d => /^(ibuprofene|ketoprofene|diclofenac|naproxen|piroxicam|meloxicam|celecoxib|etoricoxib|indomethacin)$/.test(d));
            return (hasIEC || hasARA) && hasDiur && hasAINS;
        },
        check: (out) => out.outputs.ddi.some(a => /triple.whammy|IRA|insuf.*r[eé]nal/i.test(a.classe + ' ' + a.commentaire))
    },
    {
        name: 'Metformine_IRC_CI',
        applies: (cas) => cas.bio.dfg < 30 && cas.prescription.some(d => /^metformine$/i.test(d)),
        check: (out) => out.outputs.engine.eviter && out.outputs.engine.eviter.some(a =>
            /metformine|acidose lactique/i.test((a.titre || '') + ' ' + (a.message || '')))
    },
    {
        name: 'Spironolactone_IRC_CI',
        applies: (cas) => cas.bio.dfg < 30 && cas.prescription.some(d => /^spironolactone$/i.test(d)),
        check: (out) => out.outputs.engine.eviter && out.outputs.engine.eviter.some(a =>
            /spironolactone|anti-aldost|MRA|hyperkali/i.test((a.titre || '') + ' ' + (a.message || '')))
    },
    {
        name: 'Glibenclamide_Beers_PIM',
        applies: (cas) => cas.prescription.some(d => /^(glibenclamide|glyburide)$/i.test(d)),
        check: (out) => out.outputs.engine.eviter && out.outputs.engine.eviter.some(a =>
            /glibenclamide|glyburide|sulfamide|Beers/i.test((a.titre || '') + ' ' + (a.message || '')))
    },
    {
        name: 'Sero_syndrome_ISRS_tramadol',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            const isrs = ['citalopram','escitalopram','fluoxetine','paroxetine','sertraline','fluvoxamine'];
            return dcis.some(d => isrs.includes(d)) && dcis.includes('tramadol');
        },
        check: (out) => out.outputs.ddi.some(a => /s[eé]rotonin/i.test(a.classe + ' ' + a.commentaire) && a.severite === 'danger')
    },
    {
        name: 'Sero_syndrome_Linezolide_ISRS',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            const sero = ['citalopram','escitalopram','fluoxetine','paroxetine','sertraline','venlafaxine','duloxetine','tramadol'];
            return dcis.includes('linezolide') && dcis.some(d => sero.includes(d));
        },
        check: (out) => out.outputs.ddi.some(a => /linezolide|IMAO|s[eé]rotonin/i.test(a.classe + ' ' + a.commentaire) && a.severite === 'danger')
    },
    {
        name: 'AVK_AINS_bleeding',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            const avk = ['warfarine','fluindione','acenocoumarol'];
            const ains = ['ibuprofene','ketoprofene','diclofenac','naproxen','piroxicam','meloxicam','celecoxib','etoricoxib'];
            return dcis.some(d => avk.includes(d)) && dcis.some(d => ains.includes(d));
        },
        check: (out) => out.outputs.ddi.some(a => /saign|h[eé]morrag|AVK.*AINS|AINS.*AVK/i.test(a.classe + ' ' + a.commentaire))
    },
    {
        name: 'BZD_doublon',
        applies: (cas) => {
            const bzds = ['diazepam','clonazepam','lorazepam','oxazepam','bromazepam','alprazolam','zolpidem','zopiclone','midazolam','nitrazepam'];
            const dcis = cas.prescription.map(d => d.toLowerCase());
            return dcis.filter(d => bzds.includes(d)).length >= 2;
        },
        check: (out) => out.outputs.engine.eviter && out.outputs.engine.eviter.some(a =>
            /BZD|benzodiaz|doublon/i.test((a.titre || '') + ' ' + (a.message || '')))
    },
    {
        name: 'ACB_high_cumul',
        applies: (cas) => {
            const acbSum = cas._prescription_objs.reduce((s, m) => s + (m.acb || 0), 0);
            return acbSum >= 4;
        },
        check: (out) => (out.outputs.scores.acb && out.outputs.scores.acb.total >= 3) ||
            (out.outputs.engine.eviter && out.outputs.engine.eviter.some(a => /ACB|anticholin/i.test((a.titre || '') + ' ' + (a.message || ''))))
    },
    {
        name: 'QT_double_alerte',
        applies: (cas) => {
            const qtSum = cas._prescription_objs.filter(m => (m.scores?.qt || 0) >= 2).length;
            return qtSum >= 2;
        },
        check: (out) => (out.outputs.scores.qt && out.outputs.scores.qt.total >= 3) ||
            out.outputs.ddi.some(a => /QT|torsade/i.test(a.classe + ' ' + a.commentaire))
    },
    {
        name: 'Saignement_double_AC',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            const ac = ['warfarine','fluindione','acenocoumarol','apixaban','rivaroxaban','edoxaban','dabigatran','enoxaparine','tinzaparine'];
            const ap = ['aspirine','clopidogrel','prasugrel','ticagrelor','dipyridamole'];
            return (dcis.filter(d => ac.includes(d)).length + dcis.filter(d => ap.includes(d)).length) >= 3;
        },
        check: (out) => (out.outputs.scores.saign && out.outputs.scores.saign.total >= 5)
    },
    {
        name: 'Hypoglyc_sulfamide_cotrimoxazole',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            return dcis.includes('cotrimoxazole') && dcis.some(d => /^(glibenclamide|gliclazide|glimepiride|glipizide)$/.test(d));
        },
        check: (out) => out.outputs.ddi.some(a => /hypogly|sulfamide|cotrimox/i.test(a.classe + ' ' + a.commentaire))
    },
    {
        name: 'Digoxine_clarithromycine',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            return dcis.includes('digoxine') && /^(clarithromycine|erythromycine)$/i.test(dcis.find(d => /clar|eryth/.test(d)) || '');
        },
        check: (out) => out.outputs.ddi.some(a => /digoxin|P-gp|macrolide/i.test(a.classe + ' ' + a.commentaire) && a.severite === 'danger')
    },
    {
        name: 'Lithium_AINS_toxicity',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            const ains = ['ibuprofene','ketoprofene','diclofenac','naproxen','piroxicam','meloxicam'];
            return dcis.includes('lithium') && dcis.some(d => ains.includes(d));
        },
        check: (out) => out.outputs.ddi.some(a => /lithium|lithi[eé]m|toxic/i.test(a.classe + ' ' + a.commentaire))
    },
    {
        name: 'INR_high_AVK',
        applies: (cas) => cas.bio.inr >= 4 && cas.prescription.some(d => /^(warfarine|fluindione|acenocoumarol)$/i.test(d)),
        check: (out) => (out.outputs.scores.saign && out.outputs.scores.saign.total >= 4) ||
            (out.outputs.engine.eviter && out.outputs.engine.eviter.some(a => /INR|surdosage|saign/i.test((a.titre || '') + ' ' + (a.message || ''))))
    },
    {
        name: 'CYP3A4_strong_inh_statin',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            const inh = ['clarithromycine','erythromycine','itraconazole','ketoconazole','voriconazole','posaconazole','ritonavir'];
            const stat = ['simvastatine','atorvastatine','lovastatine'];
            return dcis.some(d => inh.includes(d)) && dcis.some(d => stat.includes(d));
        },
        check: (out) => out.outputs.ddi.some(a => /CYP3A4|statine|rhabdo/i.test(a.classe + ' ' + a.commentaire))
    },
    {
        name: 'AntiPS_Demence_blackbox',
        applies: (cas) => {
            if (!cas.comorbs.includes('demence')) return false;
            const dcis = cas.prescription.map(d => d.toLowerCase());
            const aps = ['risperidone','olanzapine','quetiapine','aripiprazole','haloperidol','chlorpromazine'];
            return dcis.some(d => aps.includes(d));
        },
        check: (out) => out.outputs.engine.eviter && out.outputs.engine.eviter.some(a =>
            /d[eé]mence|psychos|antipsychot|surmortalit/i.test((a.titre || '') + ' ' + (a.message || '')))
    },
    {
        name: 'BB_FA_bradycardie',
        applies: (cas) => {
            const dcis = cas.prescription.map(d => d.toLowerCase());
            const bbs = ['bisoprolol','metoprolol','atenolol','nebivolol','carvedilol','sotalol'];
            return dcis.includes('digoxine') && dcis.some(d => bbs.includes(d));
        },
        check: (out) => out.outputs.ddi.some(a => /bradycard|bloc.*AV|inotrope/i.test(a.classe + ' ' + a.commentaire))
    }
];

// ─── Boucle bootstrap ─────────────────────────────────────────────────────────
const N_ITERATIONS = parseInt(process.env.N_ITER || '30000', 10);
const seenSigs = new Set();
const violationsByInvariant = {};
INVARIANTS.forEach(inv => violationsByInvariant[inv.name] = { applies: 0, violations: 0, samples: [] });
const errorsCount = { pipeline: 0 };
let casesProcessed = 0;

const t0 = Date.now();
console.log(`\nStart: N=${N_ITERATIONS} invariants=${INVARIANTS.length}\n`);

for (let i = 0; i < N_ITERATIONS; i++) {
    const cas = generateUniqueClinicalCase(seenSigs);
    if (!cas) continue;
    const out = runPipeline(cas);
    if (out.errors.length > 0) {
        errorsCount.pipeline++;
        continue;
    }
    casesProcessed++;
    INVARIANTS.forEach(inv => {
        if (!inv.applies(cas)) return;
        violationsByInvariant[inv.name].applies++;
        try {
            const ok = inv.check(out);
            if (!ok) {
                violationsByInvariant[inv.name].violations++;
                if (violationsByInvariant[inv.name].samples.length < 5) {
                    violationsByInvariant[inv.name].samples.push({
                        sig: cas._sig,
                        phenotype: cas.phenotype,
                        age: cas.age, dfg: cas.bio.dfg, k: cas.bio.k, inr: cas.bio.inr,
                        prescription: cas.prescription.slice(0, 12)
                    });
                }
            }
        } catch (e) {
            // check threw : compté comme violation
            violationsByInvariant[inv.name].violations++;
        }
    });
    if ((i + 1) % 1000 === 0) {
        process.stdout.write(`\r  ${i+1}/${N_ITERATIONS} (${((Date.now()-t0)/1000).toFixed(1)}s, ${casesProcessed} ok, ${seenSigs.size} unique)`);
    }
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);

console.log(`\n\n=== Synthèse robustesse N=${N_ITERATIONS} (${elapsed}s) ===`);
console.log(`Cases processed: ${casesProcessed} | Unique sigs: ${seenSigs.size} | Pipeline errors: ${errorsCount.pipeline}\n`);
console.log('Invariant'.padEnd(40) + ' | applies | violations | %');
console.log('-'.repeat(75));
const rows = [];
Object.entries(violationsByInvariant).forEach(([name, v]) => {
    const pct = v.applies > 0 ? (v.violations / v.applies * 100).toFixed(1) : '—';
    console.log(name.padEnd(40) + ' | ' + String(v.applies).padStart(7) + ' | ' + String(v.violations).padStart(10) + ' | ' + (pct + '%').padStart(7));
    rows.push({ name, applies: v.applies, violations: v.violations, pct });
});

const out = {
    summary: { N: N_ITERATIONS, elapsed_s: elapsed, casesProcessed, uniqueSigs: seenSigs.size, pipelineErrors: errorsCount.pipeline, invariants: INVARIANTS.length },
    rows,
    samples: violationsByInvariant
};
fs.writeFileSync('audit_reports/G_robustness_findings.json', JSON.stringify(out, null, 2));
console.log('\nDétails dans audit_reports/G_robustness_findings.json');
