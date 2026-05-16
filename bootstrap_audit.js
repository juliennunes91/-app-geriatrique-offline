// ============================================================================
// Bootstrap audit — 100 prescriptions aléatoires pour détecter aberrations
// ============================================================================
// Détecte :
//   1. Doublons stricts d'alertes (même finding + même DCI cible)
//   2. Contradictions logiques (alertes opposées sur même med)
//   3. Faux positifs scores composites (score > 0 sans contributeur)
//   4. Faux négatifs sentinelles (combinaisons à risque connu non détectées)
// ============================================================================

const fs = require('fs');
const path = require('path');

// ─── Charger MASTER_DB ─────────────────────────────────────────────────────────
const dbContent = fs.readFileSync(path.join(__dirname, 'geria_database.js'), 'utf-8');
const dbWrapped = dbContent + '\nmodule.exports = MASTER_DB;';
const tmp = path.join(__dirname, '.tmp_db.js');
fs.writeFileSync(tmp, dbWrapped);
const MASTER_DB = require(tmp);
fs.unlinkSync(tmp);

// ─── Charger composite_scores (calculateCompositeScores) ──────────────────────
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

// ─── Génération d'une prescription aléatoire ──────────────────────────────────
const COMORB_POOL = ['HTA', 'DT2', 'FA', 'IC', 'IRC', 'BPCO', 'asthme', 'osteoporose',
    'depression', 'demence', 'Parkinson', 'epilepsie', 'PR', 'goutte', 'AVC',
    'cardiopathie_ischemique', 'denutrition', 'incontinence', 'glaucome', 'HBP'];

function generatePatient() {
    return {
        age: randInt(60, 100),
        sexe: randChoice(['H', 'F']),
        dfg: randInt(15, 120),
        poids: randInt(45, 95),
        comorbidites: sampleN(COMORB_POOL, randInt(0, 6)),
        fragile: Math.random() < 0.4
    };
}

function generatePrescription() {
    const n = randInt(3, 20);
    return sampleN(MEDS, n);
}

// ─── Détection d'aberrations ──────────────────────────────────────────────────

// 1. Doublons DDI — même classe DDI mentionnée 2× sur la même prescription
function detectDDIDuplicates(prescription) {
    const findings = [];
    const seen = {};  // key: "{src_dci}::{target_class}" → count
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

// 1b. Doublons inter-med — même paire (médA → classe) avec médB de cette classe dans l'ordo
function detectCrossDDIDuplicates(prescription) {
    const findings = [];
    const triggered = new Map(); // "{src}->{target}" → [rules...]
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
            // multiple rules trigger same A->B interaction — potential dup
            const uniqClasses = new Set(rules.map(r => r.classe));
            if (uniqClasses.size < rules.length) {
                findings.push({ type: 'ddi_dup_cross', key, rules });
            }
        }
    });
    return findings;
}

// 2. Contradictions logiques — sévérités opposées sur même paire A↔B
function detectContradictions(prescription) {
    const findings = [];
    const pairs = new Map();  // "{a}<->{b}" → [{src, severite}]
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
        // contradiction si "info" coexiste avec "danger" sur la même paire
        if (severities.has('info') && severities.has('danger')) {
            findings.push({ type: 'severite_contradiction', pair: key, entries });
        }
    });
    return findings;
}

// 3. Faux positifs scores composites
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
        // Cohérence somme: total = somme des points contributeurs
        const sum = r.contributors.reduce((s, c) => s + (Number(c.points) || 0), 0);
        if (sum !== r.total) {
            findings.push({ type: 'score_sum_mismatch', score: k, total: r.total, computed_sum: sum });
        }
    });
    return { findings, scores };
}

// 3b. Doublons DCI dans la prescription (médicament en double)
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

// 3c. Disparité de sévérité (B→A vs A→B avec ≥2 niveaux d'écart)
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
    // Pour chaque paire ordonnée, comparer A→B max severity vs B→A max severity
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
                type: 'severity_disparity',
                pair: pairId,
                aToB_max: rules,
                bToA_max: pairs.get(reverse),
                gap: Math.abs(maxA - maxB)
            });
        }
    });
    return findings;
}

// 4. Faux négatifs sentinelles — combinaisons à risque qui DOIVENT être flaggées
const SENTINELS = [
    {
        name: 'Triple_serotoninergique',
        condition: (presc) => {
            const seroCount = presc.filter(m => (m.scores?.sero || 0) >= 1).length;
            return seroCount >= 3;
        },
        expected: (scores) => scores.sero.level === 'moderate' || scores.sero.level === 'high'
    },
    {
        name: 'Triple_whammy_IRA',
        condition: (presc) => {
            const isIEC = m => /^(ramipril|enalapril|captopril|lisinopril|perindopril|benazepril|fosinopril|trandolapril|quinapril|cilazapril|imidapril)$/i.test(m.dci);
            const isARA2 = m => /^(losartan|valsartan|candesartan|irbesartan|olmesartan|telmisartan|eprosartan|azilsartan)$/i.test(m.dci);
            const isDiur = m => /furosemide|torasemide|bumetanide|indapamide|hydrochlorothiazide|chlortalidone|spironolactone/i.test(m.dci);
            const isAINS = m => /ibuprofen|ketoprofen|diclofenac|naproxen|piroxicam|meloxicam|celecoxib|etoricoxib|indomethacin/i.test(m.dci);
            const hasIECARA = presc.some(m => isIEC(m) || isARA2(m));
            const hasDiur = presc.some(isDiur);
            const hasAINS = presc.some(isAINS);
            return hasIECARA && hasDiur && hasAINS;
        },
        expected: (scores, presc) => {
            // doit déclencher au moins une alerte DDI 'danger' ou warning
            return presc.some(m => (m.ddi_interact_v2 || []).some(r =>
                /triple.whammy|IRA|insuf.*r[eé]nale aigu/i.test(r.classe + ' ' + (r.commentaire || ''))
            ));
        }
    },
    {
        name: 'AVK_AINS_combination',
        condition: (presc) => {
            const isAVK = m => /warfarin|fluindione|acenocoumarol|coumadine/i.test(m.dci);
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
            // glibenclamide doit avoir hypoG=3 (Beers PIM absolu)
            return gli && (gli.scores?.hypoG || 0) >= 3;
        }
    },
    {
        name: 'ACB_high_cumulation',
        condition: (presc) => presc.filter(m => (m.acb || 0) >= 2).length >= 2,
        expected: (scores) => scores.acb.level === 'high' || scores.acb.level === 'moderate'
    }
];

function detectFalseNegatives(prescription, scores) {
    const findings = [];
    SENTINELS.forEach(s => {
        if (s.condition(prescription)) {
            if (!s.expected(scores, prescription)) {
                findings.push({
                    type: 'sentinel_false_negative',
                    sentinel: s.name,
                    n_meds: prescription.length,
                    dcis: prescription.map(m => m.dci).slice(0, 10)
                });
            }
        }
    });
    return findings;
}

// ─── Boucle bootstrap ─────────────────────────────────────────────────────────
const N_ITERATIONS = 500;
const SEED_INFO = { date: new Date().toISOString(), N: N_ITERATIONS };
const allFindings = {
    ddi_dup_intra_med: [],
    ddi_dup_cross: [],
    severite_contradiction: [],
    severity_disparity: [],
    score_total_no_contrib: [],
    score_contrib_no_total: [],
    score_sum_mismatch: [],
    duplicate_dci_in_prescription: [],
    sentinel_false_negative: []
};

const iterationLog = [];

for (let i = 0; i < N_ITERATIONS; i++) {
    const patient = generatePatient();
    const prescription = generatePrescription();
    const iter = {
        id: i + 1,
        patient,
        n_meds: prescription.length,
        dcis: prescription.map(m => m.dci),
        findings: []
    };

    // Run all detection functions
    const f1 = detectDDIDuplicates(prescription);
    const f2 = detectCrossDDIDuplicates(prescription);
    const f3 = detectContradictions(prescription);
    const { findings: f4, scores } = detectFalsePositives(prescription);
    const f5 = detectFalseNegatives(prescription, scores);
    const f6 = detectDoubleDCI(prescription);
    const f7 = detectSeverityDisparity(prescription);

    [...f1, ...f2, ...f3, ...f4, ...f5, ...f6, ...f7].forEach(f => {
        iter.findings.push(f);
        if (allFindings[f.type]) allFindings[f.type].push({ iter: i + 1, ...f });
    });

    iterationLog.push(iter);
}

// ─── Synthèse ─────────────────────────────────────────────────────────────────
const summary = {
    ...SEED_INFO,
    counts: Object.fromEntries(Object.entries(allFindings).map(([k, v]) => [k, v.length])),
    iterations_with_findings: iterationLog.filter(i => i.findings.length > 0).length,
    iterations_clean: iterationLog.filter(i => i.findings.length === 0).length,
    avg_findings_per_iter: iterationLog.reduce((s, i) => s + i.findings.length, 0) / N_ITERATIONS
};

console.log('\n=== Synthèse ===');
console.log(JSON.stringify(summary, null, 2));

// Dump détaillé
const out = {
    summary,
    findings: allFindings,
    sample_iterations: iterationLog.slice(0, 10)
};
fs.writeFileSync('audit_reports/G_bootstrap_findings.json', JSON.stringify(out, null, 2));
console.log('\nDétails écrits dans audit_reports/G_bootstrap_findings.json');
