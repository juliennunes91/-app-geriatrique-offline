// ============================================================================
// Bootstrap audit V2 — N=30 000 prescriptions aléatoires, profils enrichis
// ============================================================================
// Détecte :
//   1. Doublons stricts d'alertes (même finding + même DCI cible)
//   2. Doublons intra-règle (DCI dupliquée dans tableau dcis)
//   3. Contradictions logiques (alertes opposées sur même paire)
//   4. Disparités sévérité ≥2 niveaux
//   5. Faux positifs scores composites
//   6. Faux négatifs sentinelles étendues (15+ patterns gériatriques)
//   7. Cohérence biologique (interactions K+, hypoglycémie, ototoxicité, etc.)
//
// Génère :
//   - Profils patient avec biologie réaliste (10 biomarqueurs)
//   - Données fonctionnelles (IMC, GIR, MMSE, chutes)
//   - Prescriptions phenotype-driven (30%) ou aléatoires uniformes (70%)
//   - Checkpoints tous les 100 iter avec agrégation findings uniques
// ============================================================================

const fs = require('fs');
const path = require('path');

const dbContent = fs.readFileSync(path.join(__dirname, 'geria_database.js'), 'utf-8');
const dbWrapped = dbContent + '\nmodule.exports = MASTER_DB;';
const tmp = path.join(__dirname, '.tmp_db.js');
fs.writeFileSync(tmp, dbWrapped);
const MASTER_DB = require(tmp);
fs.unlinkSync(tmp);

const scContent = fs.readFileSync(path.join(__dirname, 'composite_scores.js'), 'utf-8');
const scWrapped = scContent + '\nmodule.exports = { SCORE_DEFINITIONS, calculateCompositeScores };';
const tmpSc = path.join(__dirname, '.tmp_sc.js');
fs.writeFileSync(tmpSc, scWrapped);
const { SCORE_DEFINITIONS, calculateCompositeScores } = require(tmpSc);
fs.unlinkSync(tmpSc);

const MEDS = MASTER_DB.MEDICAMENTS;
console.log(`Loaded ${MEDS.length} medications, ${Object.keys(SCORE_DEFINITIONS).length} scores`);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return Math.random() * (max - min) + min; }
function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sampleN(arr, n) {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n && copy.length > 0; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
    }
    return out;
}
// Distribution gaussienne centrée μ écart σ, troncature [min, max]
function gaussian(mu, sigma, min, max) {
    const u1 = Math.random(), u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    let v = mu + z * sigma;
    if (min !== undefined && v < min) v = min;
    if (max !== undefined && v > max) v = max;
    return v;
}

const COMORB_POOL = ['HTA', 'DT2', 'FA', 'IC', 'IRC', 'BPCO', 'asthme', 'osteoporose',
    'depression', 'demence', 'Parkinson', 'epilepsie', 'PR', 'goutte', 'AVC',
    'cardiopathie_ischemique', 'denutrition', 'incontinence', 'glaucome', 'HBP',
    'cancer_solide', 'hepatopathie_chronique', 'syndrome_dysmetabolique', 'apnee_sommeil',
    'cirrhose', 'hypothyroidie', 'hyperthyroidie', 'syndrome_anxieux', 'chute_recente'];

// ─── Génération de profil patient avec biologie complète ──────────────────────
function generatePatient() {
    const age = Math.round(gaussian(78, 9, 60, 102));
    const sexe = randChoice(['H', 'F']);
    // Biologie réaliste (distributions gériatriques)
    const dfg = Math.round(gaussian(60, 22, 8, 110));
    const creat = Math.round(gaussian(95, 35, 50, 350));  // µmol/L
    const k = +(gaussian(4.2, 0.5, 2.8, 6.5)).toFixed(2);  // mmol/L
    const na = Math.round(gaussian(138, 4, 120, 150));     // mmol/L
    const ca_corr = +(gaussian(2.30, 0.12, 1.80, 2.90)).toFixed(2);  // mmol/L corrigé albumine
    const inr = +(gaussian(1.5, 1.0, 0.9, 8.0)).toFixed(2);  // élargi pour stress AVK
    const plaq = Math.round(gaussian(220, 70, 30, 600));   // 10³/µL
    const hb = +(gaussian(12.5, 1.8, 6.0, 17.0)).toFixed(1);  // g/dL
    const hba1c = +(gaussian(6.8, 1.2, 4.5, 12.5)).toFixed(1);  // %
    const alat = Math.round(gaussian(28, 18, 8, 250));     // UI/L
    const asat = Math.round(gaussian(26, 16, 8, 200));     // UI/L
    const tsh = +(gaussian(2.5, 2.0, 0.05, 25)).toFixed(2); // mUI/L
    const qtc = Math.round(gaussian(420, 30, 350, 580));   // ms
    // Données fonctionnelles
    const poids = Math.round(gaussian(68, 14, 35, 130));
    const taille = Math.round(gaussian(167, 9, 140, 195));
    const imc = +(poids / Math.pow(taille / 100, 2)).toFixed(1);
    const gir = randChoice([1, 2, 3, 4, 5, 6]);  // 1=dépendant total, 6=autonome
    const mmse = Math.round(gaussian(24, 5, 0, 30));
    const chutesAn = randChoice([0, 0, 0, 1, 1, 2, 3, 5]);  // pondéré faible
    const esperanceVie = age >= 90 ? randInt(1, 5) : age >= 80 ? randInt(3, 12) : randInt(5, 20);
    return {
        age, sexe,
        bio: { dfg, creat, k, na, ca_corr, inr, plaq, hb, hba1c, alat, asat, tsh, qtc },
        fonc: { poids, taille, imc, gir, mmse, chutesAn, esperanceVie },
        comorbidites: sampleN(COMORB_POOL, randInt(0, 8)),
        fragile: age >= 85 || gir <= 3 || imc < 21 || hb < 11 || Math.random() < 0.3,
        polyMed: Math.random() < 0.6  // probabilité d'avoir une polymédication réaliste
    };
}

// ─── Phénotypes thérapeutiques (clusters réalistes) ───────────────────────────
const PHENOTYPES = {
    cardio_complet: ['Apixaban', 'Bisoprolol', 'Ramipril', 'Furosemide', 'Atorvastatine', 'Spironolactone'],
    hta_diur: ['Amlodipine', 'Hydrochlorothiazide', 'Ramipril', 'Atorvastatine'],
    fa_avk: ['Warfarine', 'Bisoprolol', 'Digoxine', 'Furosemide'],
    diab_type2: ['Metformine', 'Gliclazide', 'Empagliflozin', 'Atorvastatine', 'Ramipril'],
    insuffisance_renale: ['Furosemide', 'Spironolactone', 'Bicarbonate de sodium', 'Sevelamer'],
    depression_demence: ['Sertraline', 'Donepezil', 'Memantine', 'Trazodone'],
    douleur_chronique: ['Tramadol', 'Paracetamol', 'Pregabaline', 'Amitriptyline'],
    bpco_severe: ['Tiotropium', 'Salbutamol', 'Prednisone', 'Furosemide'],
    parkinson_avance: ['Levodopa-carbidopa', 'Rasagiline', 'Amantadine', 'Quetiapine'],
    triple_whammy: ['Ramipril', 'Hydrochlorothiazide', 'Ibuprofene'],  // piège volontaire
    palliatif_polymed: ['Morphine', 'Haloperidol', 'Midazolam', 'Hyoscine butylbromide'],
    chute_iatrogene: ['Zopiclone', 'Oxazepam', 'Mirtazapine', 'Furosemide', 'Bisoprolol']
};

function generatePrescription(patient) {
    // 30% phénotype-driven, 70% uniforme aléatoire
    const usePhenotype = Math.random() < 0.30;
    let baseDcis = [];
    if (usePhenotype) {
        const phenoKey = randChoice(Object.keys(PHENOTYPES));
        baseDcis = PHENOTYPES[phenoKey];
    }
    const baseMeds = baseDcis
        .map(dci => MEDS.find(m => (m.dci || '').toLowerCase() === dci.toLowerCase()))
        .filter(Boolean);

    // Ajouter quelques médicaments aléatoires
    const nRandom = patient.polyMed ? randInt(2, 12) : randInt(1, 6);
    const remaining = MEDS.filter(m => !baseMeds.includes(m));
    const randomMeds = sampleN(remaining, nRandom);

    return [...baseMeds, ...randomMeds];
}

// ─── Détecteurs (identiques V1 — éprouvés) ────────────────────────────────────
function detectDDIDuplicates(prescription) {
    const findings = [];
    const seen = {};
    prescription.forEach(med => {
        const ddi = med.ddi_interact_v2 || [];
        ddi.forEach(rule => {
            const cls = (rule.classe || '').trim();
            if (!cls) return;
            const key = `${med.dci}::${cls}`;
            seen[key] = (seen[key] || 0) + 1;
        });
    });
    Object.entries(seen).forEach(([k, count]) => {
        if (count > 1) findings.push({ type: 'ddi_dup_intra_med', key: k, count });
    });
    return findings;
}

function detectCrossDDIDuplicates(prescription) {
    const findings = [];
    const triggered = new Map();
    prescription.forEach(med => {
        const ddi = med.ddi_interact_v2 || [];
        ddi.forEach(rule => {
            const dcis = (rule.dcis || []).filter(x => typeof x === 'string');
            dcis.forEach(target => {
                const targetMed = prescription.find(m => (m.dci || '').toLowerCase() === target.toLowerCase());
                if (!targetMed) return;
                const key = `${med.dci.toLowerCase()}->${target.toLowerCase()}`;
                if (!triggered.has(key)) triggered.set(key, []);
                triggered.get(key).push({ classe: rule.classe, severite: rule.severite, commentaire: rule.commentaire });
            });
        });
    });
    triggered.forEach((rules, key) => {
        if (rules.length > 1) {
            const uniqClasses = new Set(rules.map(r => r.classe));
            if (uniqClasses.size < rules.length) {
                findings.push({ type: 'ddi_dup_cross', key, rules });
            }
        }
    });
    return findings;
}

// NEW: doublons intra-règle (DCI dupliquée dans le tableau dcis)
function detectIntraRuleDupes(prescription) {
    const findings = [];
    prescription.forEach(med => {
        (med.ddi_interact_v2 || []).forEach(rule => {
            const dcis = (rule.dcis || []).filter(x => typeof x === 'string').map(s => s.toLowerCase());
            const seen = new Set();
            const dups = new Set();
            dcis.forEach(d => { if (seen.has(d)) dups.add(d); seen.add(d); });
            if (dups.size > 0) {
                findings.push({
                    type: 'intra_rule_dup', src: med.dci, classe: rule.classe,
                    duplicates: Array.from(dups)
                });
            }
        });
    });
    return findings;
}

const MIN_COMMENT_LEN = 60;
const MIN_SOURCES_IDENTICAL = 3;
const COMMENT_KEY_SLICE = 80;

// Utilitaire : pré-indexe la prescription DCI→med (lowercase) une fois, puis
// itère sur tous les triplets (source, règle, cible) avec la cible déjà
// résolue. Élimine le prescription.find linéaire en triple boucle (O(n³)→O(n²)).
function iterateMatchedDDI(prescription, callback) {
    const dciIndex = new Map();
    prescription.forEach(m => dciIndex.set((m.dci || '').toLowerCase(), m));
    for (const med of prescription) {
        const rules = med.ddi_interact_v2 || [];
        for (const rule of rules) {
            const dcis = rule.dcis || [];
            for (const t of dcis) {
                if (typeof t !== 'string') continue;
                const targetLc = t.toLowerCase();
                const targetMed = dciIndex.get(targetLc);
                if (!targetMed) continue;
                callback(med, rule, t, targetLc, targetMed);
            }
        }
    }
}

// V3 fusionné : alerte UI dupliquée + cascade de sévérités sur même cible
// (info+warning+danger venant de sources différentes). Une seule passe.
function detectVisualAlertDupAndCascade(prescription) {
    const findings = [];
    const emitted = new Map();    // "target::classe::severite" → [sources]
    const targetSev = new Map();  // target → Set(severites)
    iterateMatchedDDI(prescription, (med, rule, target, targetLc) => {
        const key = `${targetLc}::${(rule.classe || '').trim()}::${rule.severite || 'unknown'}`;
        if (!emitted.has(key)) emitted.set(key, []);
        emitted.get(key).push(med.dci);
        if (!targetSev.has(targetLc)) targetSev.set(targetLc, new Set());
        targetSev.get(targetLc).add(rule.severite);
    });
    emitted.forEach((sources, key) => {
        const uniqSources = Array.from(new Set(sources.map(s => s.toLowerCase())));
        if (uniqSources.length >= 2) {
            findings.push({ type: 'visual_alert_dup', key, sources: uniqSources });
        }
    });
    targetSev.forEach((sevs, target) => {
        if (sevs.has('info') && sevs.has('warning') && sevs.has('danger')) {
            findings.push({ type: 'severity_cascade', target, severites: Array.from(sevs) });
        }
    });
    return findings;
}

// V3 : commentaires strictement identiques entre 3+ médicaments différents
// (copier-coller cross-méd). Filtre strict via MIN_COMMENT_LEN + MIN_SOURCES_IDENTICAL
// pour éviter les phrases génériques légitimes ("Syndrome sérotoninergique").
function detectIdenticalComments(prescription) {
    const findings = [];
    const sigMap = new Map();
    for (const med of prescription) {
        for (const rule of (med.ddi_interact_v2 || [])) {
            const com = (rule.commentaire || '').trim();
            if (com.length < MIN_COMMENT_LEN) continue;
            if (!sigMap.has(com)) sigMap.set(com, []);
            sigMap.get(com).push({ src: med.dci, classe: rule.classe, severite: rule.severite });
        }
    }
    sigMap.forEach((entries, com) => {
        const uniqSrc = new Set(entries.map(e => e.src.toLowerCase()));
        if (uniqSrc.size >= MIN_SOURCES_IDENTICAL) {
            findings.push({
                type: 'identical_comment_cross', commentaire: com.slice(0, COMMENT_KEY_SLICE),
                sources: Array.from(uniqSrc), n: entries.length
            });
        }
    });
    return findings;
}

function detectContradictions(prescription) {
    const findings = [];
    const pairs = new Map();
    prescription.forEach(med => {
        const ddi = med.ddi_interact_v2 || [];
        ddi.forEach(rule => {
            (rule.dcis || []).filter(x => typeof x === 'string').forEach(target => {
                const targetMed = prescription.find(m => (m.dci || '').toLowerCase() === target.toLowerCase());
                if (!targetMed) return;
                const a = med.dci.toLowerCase();
                const b = target.toLowerCase();
                const pairKey = [a, b].sort().join('<->');
                if (!pairs.has(pairKey)) pairs.set(pairKey, []);
                pairs.get(pairKey).push({ src: med.dci, severite: rule.severite, classe: rule.classe, commentaire: rule.commentaire });
            });
        });
    });
    pairs.forEach((entries, key) => {
        if (entries.length < 2) return;
        const severities = new Set(entries.map(e => e.severite));
        if (severities.has('info') && severities.has('danger')) {
            findings.push({ type: 'severite_contradiction', pair: key, entries });
        }
    });
    return findings;
}

function detectFalsePositives(prescription) {
    const findings = [];
    const scores = calculateCompositeScores(prescription);
    Object.entries(scores).forEach(([k, r]) => {
        if (r.total > 0 && r.contributors.length === 0) {
            findings.push({ type: 'score_total_no_contrib', score: k, total: r.total });
        }
        if (r.total === 0 && r.contributors.length > 0) {
            findings.push({ type: 'score_contrib_no_total', score: k, n_contrib: r.contributors.length });
        }
        const sum = r.contributors.reduce((s, c) => s + (Number(c.points) || 0), 0);
        if (sum !== r.total) {
            findings.push({ type: 'score_sum_mismatch', score: k, total: r.total, computed_sum: sum });
        }
    });
    return { findings, scores };
}

function detectDoubleDCI(prescription) {
    const findings = [];
    const seen = new Set();
    prescription.forEach(m => {
        const k = (m.dci || '').toLowerCase();
        if (seen.has(k)) findings.push({ type: 'duplicate_dci_in_prescription', dci: m.dci });
        seen.add(k);
    });
    return findings;
}

function detectSeverityDisparity(prescription) {
    const findings = [];
    const SEV_RANK = { 'info': 0, 'warning': 1, 'danger': 2 };
    const pairs = new Map();
    prescription.forEach(med => {
        const ddi = med.ddi_interact_v2 || [];
        ddi.forEach(rule => {
            (rule.dcis || []).filter(x => typeof x === 'string').forEach(target => {
                const tMed = prescription.find(m => (m.dci || '').toLowerCase() === target.toLowerCase());
                if (!tMed) return;
                const a = med.dci.toLowerCase();
                const b = target.toLowerCase();
                if (a === b) return;
                const dirKey = `${a}->${b}`;
                if (!pairs.has(dirKey)) pairs.set(dirKey, []);
                pairs.get(dirKey).push({ severite: rule.severite, classe: rule.classe });
            });
        });
    });
    const seen = new Set();
    pairs.forEach((rules, key) => {
        const [a, b] = key.split('->');
        const reverse = `${b}->${a}`;
        const pairId = [a, b].sort().join('<->');
        if (seen.has(pairId)) return;
        seen.add(pairId);
        if (!pairs.has(reverse)) return;
        const maxA = Math.max(...rules.map(r => SEV_RANK[r.severite] ?? 0));
        const maxB = Math.max(...pairs.get(reverse).map(r => SEV_RANK[r.severite] ?? 0));
        if (Math.abs(maxA - maxB) >= 2) {
            findings.push({
                type: 'severity_disparity', pair: pairId,
                aToB_max: rules, bToA_max: pairs.get(reverse), gap: Math.abs(maxA - maxB)
            });
        }
    });
    return findings;
}

// ─── SENTINELLES ÉTENDUES (15 patterns gériatriques) ──────────────────────────
const SENTINELS = [
    {
        name: 'Triple_serotoninergique',
        condition: (presc) => presc.filter(m => (m.scores?.sero || 0) >= 1).length >= 3,
        expected: (scores) => scores.sero.level === 'moderate' || scores.sero.level === 'high'
    },
    {
        name: 'Triple_whammy_IRA',
        condition: (presc) => {
            const isIEC = m => /^(ramipril|enalapril|captopril|lisinopril|perindopril|benazepril|fosinopril|trandolapril|quinapril)$/i.test(m.dci);
            const isARA2 = m => /^(losartan|valsartan|candesartan|irbesartan|olmesartan|telmisartan)$/i.test(m.dci);
            const isDiur = m => /furosemide|torasemide|bumetanide|indapamide|hydrochlorothiazide|chlortalidone/i.test(m.dci);
            const isAINS = m => /ibuprofen|ketoprofen|diclofenac|naproxen|piroxicam|meloxicam|celecoxib|etoricoxib|indomethacin/i.test(m.dci);
            return (presc.some(isIEC) || presc.some(isARA2)) && presc.some(isDiur) && presc.some(isAINS);
        },
        expected: (scores, presc) => presc.some(m => (m.ddi_interact_v2 || []).some(r =>
            /triple.whammy|IRA|insuf.*r[eé]nale aigu/i.test(r.classe + ' ' + (r.commentaire || ''))
        ))
    },
    {
        name: 'AVK_AINS_combination',
        condition: (presc) => {
            const isAVK = m => /warfarin|fluindione|acenocoumarol/i.test(m.dci);
            const isAINS = m => /ibuprofen|ketoprofen|diclofenac|naproxen|piroxicam|meloxicam|celecoxib|etoricoxib/i.test(m.dci);
            return presc.some(isAVK) && presc.some(isAINS);
        },
        expected: (scores) => scores.saign.total >= 4
    },
    {
        name: 'Beers_glibenclamide_present',
        condition: (presc) => presc.some(m => /glibenclamide|glyburide/i.test(m.dci || '')),
        expected: (scores, presc) => {
            const gli = presc.find(m => /glibenclamide|glyburide/i.test(m.dci || ''));
            return gli && (gli.scores?.hypoG || 0) >= 3;
        }
    },
    {
        name: 'ACB_high_cumulation',
        condition: (presc) => presc.filter(m => (m.acb || 0) >= 2).length >= 2,
        expected: (scores) => scores.acb.level === 'high' || scores.acb.level === 'moderate'
    },
    // NEW
    {
        name: 'QT_double_prolongation',
        condition: (presc) => presc.filter(m => (m.scores?.qt || 0) >= 2).length >= 2,
        expected: (scores) => scores.qt.total >= 4
    },
    {
        name: 'Hyperkaliemiants_triple',
        condition: (presc) => {
            const isHyperK = m => /^(spironolactone|eplerenone|amiloride|triamterene|ramipril|enalapril|perindopril|losartan|valsartan|candesartan|trimethoprime)$/i.test(m.dci);
            return presc.filter(isHyperK).length >= 3;
        },
        // Pas de score composite hyperK validé (cf litt. KDIGO 2024) — on vérifie qu'au moins une alerte DDI K+ se déclenche
        expected: (scores, presc) => presc.some(m => (m.ddi_interact_v2 || []).some(r =>
            /hyperkali|kali[eé]mie|K\+|potassium/i.test(r.classe + ' ' + (r.commentaire || ''))
        ))
    },
    {
        name: 'Triple_anticoagulant_antiplaq',
        condition: (presc) => {
            const isAC = m => /apixaban|rivaroxaban|edoxaban|dabigatran|warfarin|fluindione|acenocoumarol|enoxaparine|tinzaparine/i.test(m.dci);
            const isAP = m => /aspirin|clopidogrel|prasugrel|ticagrelor|dipyridamole/i.test(m.dci);
            const acCount = presc.filter(isAC).length;
            const apCount = presc.filter(isAP).length;
            return (acCount >= 1 && apCount >= 2) || acCount >= 2;
        },
        expected: (scores) => scores.saign.total >= 5
    },
    {
        name: 'BZD_opioide_chute',
        condition: (presc) => {
            const isBZD = m => /alprazolam|bromazepam|clonazepam|diazepam|lorazepam|oxazepam|temazepam|zolpidem|zopiclone|midazolam/i.test(m.dci);
            const isOpioide = m => /morphine|oxycodone|fentanyl|tramadol|codeine|hydromorphone|tapentadol|buprenorphine/i.test(m.dci);
            return presc.some(isBZD) && presc.some(isOpioide);
        },
        expected: (scores) => (scores.sedat?.total || 0) >= 3 || scores.acb.total >= 2
    },
    {
        name: 'Nephrotoxiques_triple',
        condition: (presc) => {
            const isNephro = m => /gentamicine|amikacine|tobramycine|vancomycine|ibuprofen|ketoprofen|diclofenac|naproxen|piroxicam|ramipril|enalapril|losartan|valsartan|candesartan|furosemide|hydrochlorothiazide|ciclosporine|tacrolimus/i.test(m.dci);
            return presc.filter(isNephro).length >= 3;
        },
        // Pas de score composite Néphrotoxicité validé (DBI = anticholinergique+sédatif seulement) — on vérifie alerte DDI néphro
        expected: (scores, presc) => presc.some(m => (m.ddi_interact_v2 || []).some(r =>
            /n[eé]phrotox|IRA|insuf.*r[eé]nal|triple.whammy|tubulopathie/i.test(r.classe + ' ' + (r.commentaire || ''))
        ))
    },
    {
        name: 'Beers_BZD_longue_demi_vie',
        condition: (presc) => presc.some(m => /diazepam|chlordiazepoxide|flurazepam|nitrazepam/i.test(m.dci || '')),
        expected: (scores, presc) => {
            const bzd = presc.find(m => /diazepam|chlordiazepoxide|flurazepam|nitrazepam/i.test(m.dci || ''));
            return bzd && ((bzd.scores?.chutes || 0) >= 2 || (bzd.scores?.sedat || 0) >= 2);
        }
    },
    {
        name: 'Antimuscariniques_uro_AChE',
        condition: (presc) => {
            const isAntimusc = m => /oxybutynine|tolterodine|solifenacine|fesoterodine|trospium|darifenacine/i.test(m.dci);
            const isAChE = m => /donepezil|rivastigmine|galantamine/i.test(m.dci);
            return presc.some(isAntimusc) && presc.some(isAChE);
        },
        expected: (scores, presc) => presc.some(m => (m.ddi_interact_v2 || []).some(r =>
            /antagonisme|achie|cholinerg/i.test(r.classe + (r.commentaire || ''))
        ))
    },
    {
        name: 'CYP3A4_inhibiteur_statine',
        condition: (presc) => {
            const isInh3A4 = m => /clarithromycine|erythromycine|telithromycine|ketoconazole|itraconazole|voriconazole|posaconazole|ritonavir|cobicistat|diltiazem|verapamil/i.test(m.dci);
            const isStat3A4 = m => /simvastatine|atorvastatine|lovastatine/i.test(m.dci);
            return presc.some(isInh3A4) && presc.some(isStat3A4);
        },
        expected: (scores, presc) => presc.some(m => (m.ddi_interact_v2 || []).some(r =>
            /statine|rhabdomyo|CYP3A4|atorvastatine|simvastatine/i.test(r.classe + (r.commentaire || ''))
        ))
    },
    {
        name: 'Digoxine_hypokali_diuretique',
        condition: (presc) => {
            const hasDigox = presc.some(m => /digoxine/i.test(m.dci));
            const hasDiur = presc.some(m => /furosemide|torasemide|bumetanide|hydrochlorothiazide|indapamide/i.test(m.dci));
            return hasDigox && hasDiur;
        },
        expected: (scores, presc) => presc.some(m => (m.ddi_interact_v2 || []).some(r =>
            /digoxine|hypokali/i.test(r.classe + (r.commentaire || ''))
        ))
    },
    {
        name: 'Macrolides_QT_polypharma',
        condition: (presc) => {
            const isMacro = m => /clarithromycine|erythromycine|azithromycine|telithromycine/i.test(m.dci);
            const hasQT = presc.some(m => (m.scores?.qt || 0) >= 2);
            return presc.some(isMacro) && hasQT;
        },
        expected: (scores) => scores.qt.total >= 3
    }
];

function detectFalseNegatives(prescription, scores) {
    const findings = [];
    SENTINELS.forEach(s => {
        if (s.condition(prescription)) {
            if (!s.expected(scores, prescription)) {
                findings.push({
                    type: 'sentinel_false_negative', sentinel: s.name,
                    n_meds: prescription.length,
                    dcis: prescription.map(m => m.dci).slice(0, 12)
                });
            }
        }
    });
    return findings;
}

// ─── BOUCLE BOOTSTRAP N=30 000 avec CHECKPOINTS ───────────────────────────────
const N_ITERATIONS = 30000;
const CHECKPOINT_EVERY = 100;
const SEED_INFO = { date: new Date().toISOString(), N: N_ITERATIONS, checkpoint: CHECKPOINT_EVERY };
const allFindings = {
    ddi_dup_intra_med: [], ddi_dup_cross: [], intra_rule_dup: [],
    severite_contradiction: [], severity_disparity: [],
    score_total_no_contrib: [], score_contrib_no_total: [], score_sum_mismatch: [],
    duplicate_dci_in_prescription: [], sentinel_false_negative: [],
    visual_alert_dup: [], identical_comment_cross: [], severity_cascade: []
};

// Tracking unique findings (clé canonique → premier iter d'apparition)
const uniqueFindings = new Map();
const checkpointLog = [];

function canonicalKey(f) {
    switch (f.type) {
        case 'ddi_dup_intra_med': return `${f.type}::${f.key}`;
        case 'ddi_dup_cross': return `${f.type}::${f.key}`;
        case 'intra_rule_dup': return `${f.type}::${f.src}::${f.classe}::${(f.duplicates || []).join(',')}`;
        case 'severite_contradiction': return `${f.type}::${f.pair}`;
        case 'severity_disparity': return `${f.type}::${f.pair}::${f.gap}`;
        case 'score_total_no_contrib': return `${f.type}::${f.score}`;
        case 'score_contrib_no_total': return `${f.type}::${f.score}`;
        case 'score_sum_mismatch': return `${f.type}::${f.score}`;
        case 'duplicate_dci_in_prescription': return `${f.type}::${(f.dci || '').toLowerCase()}`;
        case 'sentinel_false_negative': return `${f.type}::${f.sentinel}`;
        case 'visual_alert_dup': return `${f.type}::${f.key}`;
        case 'identical_comment_cross': return `${f.type}::${(f.commentaire || '').slice(0, COMMENT_KEY_SLICE)}`;
        case 'severity_cascade': return `${f.type}::${f.target}`;
        default: return JSON.stringify(f).slice(0, 200);
    }
}

const t0 = Date.now();
console.log(`\nStarting bootstrap N=${N_ITERATIONS} (checkpoint every ${CHECKPOINT_EVERY})...`);

for (let i = 0; i < N_ITERATIONS; i++) {
    const patient = generatePatient();
    const prescription = generatePrescription(patient);

    const f1 = detectDDIDuplicates(prescription);
    const f2 = detectCrossDDIDuplicates(prescription);
    const f3 = detectContradictions(prescription);
    const { findings: f4, scores } = detectFalsePositives(prescription);
    const f5 = detectFalseNegatives(prescription, scores);
    const f6 = detectDoubleDCI(prescription);
    const f7 = detectSeverityDisparity(prescription);
    const f8 = detectIntraRuleDupes(prescription);
    const f9 = detectVisualAlertDupAndCascade(prescription);
    const f10 = detectIdenticalComments(prescription);

    [...f1, ...f2, ...f3, ...f4, ...f5, ...f6, ...f7, ...f8, ...f9, ...f10].forEach(f => {
        if (allFindings[f.type]) allFindings[f.type].push({ iter: i + 1, ...f });
        const ck = canonicalKey(f);
        if (!uniqueFindings.has(ck)) {
            uniqueFindings.set(ck, {
                first_iter: i + 1, type: f.type, key: ck, sample: f,
                patient_snapshot: { age: patient.age, dfg: patient.bio.dfg, k: patient.bio.k, qtc: patient.bio.qtc, mmse: patient.fonc.mmse },
                count: 1
            });
        } else {
            uniqueFindings.get(ck).count++;
        }
    });

    // Checkpoint
    if ((i + 1) % CHECKPOINT_EVERY === 0) {
        const totalFindings = Object.values(allFindings).reduce((s, arr) => s + arr.length, 0);
        checkpointLog.push({
            iter: i + 1,
            elapsed_s: ((Date.now() - t0) / 1000).toFixed(2),
            unique_findings_so_far: uniqueFindings.size,
            total_findings_so_far: totalFindings,
            counts: Object.fromEntries(Object.entries(allFindings).map(([k, v]) => [k, v.length]))
        });
    }
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
console.log(`\nCompleted in ${elapsed}s.`);

// ─── Synthèse finale ──────────────────────────────────────────────────────────
const summary = {
    ...SEED_INFO,
    elapsed_s: elapsed,
    counts: Object.fromEntries(Object.entries(allFindings).map(([k, v]) => [k, v.length])),
    unique_findings: uniqueFindings.size,
    sentinels_tested: SENTINELS.length,
    checkpoints: checkpointLog.length
};

console.log('\n=== Synthèse N=30 000 ===');
console.log(JSON.stringify(summary, null, 2));

const out = {
    summary,
    unique_findings: Array.from(uniqueFindings.values()).sort((a, b) => b.count - a.count),
    findings: allFindings,
    checkpoints: checkpointLog,
    sentinels: SENTINELS.map(s => s.name),
    phenotypes: Object.keys(PHENOTYPES)
};
fs.writeFileSync('audit_reports/G_bootstrap_findings.json', JSON.stringify(out, null, 2));
console.log('\nDétails dans audit_reports/G_bootstrap_findings.json');
console.log(`Unique findings: ${uniqueFindings.size}`);
console.log('Top unique findings:');
Array.from(uniqueFindings.values()).sort((a, b) => b.count - a.count).slice(0, 15).forEach(f => {
    console.log(`  [${f.count}x] ${f.key}`);
});
