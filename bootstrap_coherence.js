// ============================================================================
// Bootstrap COHERENCE — N cas 100 % aléatoires, TOUS modules, mesures intrinsèques
// ============================================================================
// Diff vs robustness :
//   - Cas TOTALEMENT aléatoires (pas de phénotype biaisé)
//   - Tous paramètres = variables (12 biomarqueurs × 53 PAT × 546 DCI × age × sexe)
//   - Intègre detectBioSyndromes (moteur biologique des SYND_xxx)
//   - Aucun invariant prédéfini : mesures de COHÉRENCE INTRINSÈQUE seulement
//     (intégrité, déterminisme, monotonicité, distribution, couverture, doublons,
//      sources EBM, contradictions cross-module)
// ============================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = __dirname;

function loadModule(f, n) {
    const c = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    const tmp = path.join(ROOT, '.tmp_' + f);
    fs.writeFileSync(tmp, c + '\nmodule.exports = ' + n + ';');
    const m = require(tmp);
    fs.unlinkSync(tmp);
    return m;
}
const MASTER_DB = loadModule('geria_database.js', 'MASTER_DB');
const PATHOLOGY = loadModule('geria_pathology_rules_v3.js', 'PATHOLOGY_RULES_DB');
const RECOS = loadModule('geria_recos_final.js', 'GERIA_RECOS_DB');
global.MASTER_DB = MASTER_DB;
global.PATHOLOGY_RULES_DB = PATHOLOGY;
global.GERIA_RECOS_DB = RECOS;
global.performance = { now: () => Date.now() };
function loadAsGlobal(f, names) {
    const code = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    new Function(code + '\n' + names.map(n => 'global.' + n + '=' + n + ';').join('\n'))();
}
loadAsGlobal('drug_classes.js', ['DRUG_CLASSES', 'matchesDrugClass']);
loadAsGlobal('geria_engine_v2.js', ['GeriaEngineV2']);
loadAsGlobal('composite_scores.js', ['SCORE_DEFINITIONS', 'calculateCompositeScores']);

console.log(`Loaded ${MASTER_DB.MEDICAMENTS.length} meds | ${GERIA_RECOS_DB.EVITER.length} EVITER | ${GERIA_RECOS_DB.INITIER.length} INITIER | ${Object.keys(MASTER_DB.SYNDROMES).length} SYND`);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const randChoice = a => a[Math.floor(Math.random() * a.length)];
function sampleN(a, n) { const c = [...a], o = []; for (let i = 0; i < n && c.length; i++) o.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]); return o; }
function gaussian(mu, sg, mn, mx) {
    const u1 = Math.random(), u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.max(mn, Math.min(mx, mu + z * sg));
}

const ALL_PAT_CODES = Object.keys(MASTER_DB.PATHOLOGIES);
const MEDS = MASTER_DB.MEDICAMENTS;

// ─── Génération cas 100 % aléatoires ──────────────────────────────────────────
function generateRandomCase(seen) {
    for (let tries = 0; tries < 5; tries++) {
        const age = Math.round(gaussian(78, 9, 60, 102));
        const sexe = randChoice(['H', 'F']);
        const poids = Math.round(gaussian(68, 14, 35, 130));
        const taille = Math.round(gaussian(167, 9, 140, 195));
        // Biologie : 12+ dimensions, distributions gériatriques élargies
        const bio = {
            BIO_001: +(gaussian(4.2, 0.7, 2.5, 7.5)).toFixed(2),    // K+
            BIO_002: Math.round(gaussian(138, 5, 115, 155)),          // Na
            BIO_003: Math.round(gaussian(95, 50, 40, 400)),          // Créat
            BIO_004: Math.round(gaussian(60, 25, 6, 115)),           // DFG
            BIO_005: +(gaussian(2.30, 0.15, 1.75, 3.00)).toFixed(2),// Ca corr
            BIO_006: +(gaussian(0.85, 0.20, 0.40, 1.50)).toFixed(2),// Mg
            BIO_007: +(gaussian(7, 3, 2, 25)).toFixed(1),            // Urée
            BIO_009: +(gaussian(12, 2.2, 5.0, 17.5)).toFixed(1),     // Hb
            BIO_010: Math.round(gaussian(220, 90, 15, 700)),         // Plaq
            BIO_013: Math.round(gaussian(28, 35, 8, 500)),           // ASAT
            BIO_014: Math.round(gaussian(28, 40, 8, 600)),           // ALAT
            BIO_018: Math.round(gaussian(120, 250, 30, 5000)),       // CPK
            BIO_019: +(gaussian(2.5, 3.5, 0.01, 40)).toFixed(2),     // TSH
            BIO_030: +(gaussian(1.4, 1.0, 0.8, 10)).toFixed(2),      // INR
            BIO_031: Math.round(gaussian(425, 40, 340, 620)),        // QTc
            BIO_036: +(gaussian(35, 8, 12, 55)).toFixed(0),          // Albumine
            BIO_037: +(gaussian(0.7, 0.4, 0.05, 3.5)).toFixed(2),    // Lithium
            BIO_040: +(gaussian(2.5, 1.5, 0.5, 12)).toFixed(1),      // HbA1c?
        };
        // Comorbidités : 0-10 PAT_xxx aléatoires
        const comorbs = sampleN(ALL_PAT_CODES, randInt(0, 10));
        // Prescription : 1-20 méds aléatoires uniformes
        const prescription = sampleN(MEDS, randInt(1, 20));

        const sig = crypto.createHash('sha1').update(JSON.stringify({
            age, sexe,
            b: Object.values(bio).map(v => Math.round(v * 100)).join(','),
            c: comorbs.sort().join(','),
            p: prescription.map(m => (m.dci || '').toLowerCase()).sort().join(',')
        })).digest('hex').slice(0, 16);
        if (seen.has(sig)) continue;
        seen.add(sig);
        return { age, sexe, poids, taille, bio, comorbs, prescription, _sig: sig };
    }
    return null;
}

// ─── Module bio : extrait de app_analysis.js (SYND_xxx) ───────────────────────
function detectBioSyndromes(cas) {
    const out = [];
    const bv = cas.bio;
    const push = (id, label, severity) => out.push({ id, label, severity });
    if (bv.BIO_013 > 135 || bv.BIO_014 > 105) push('SYND_001', 'Cytolyse hépatique (ASAT/ALAT > 3N)', 'warning');
    if (bv.BIO_018 > 850) push('SYND_002', 'Rhabdomyolyse (CPK > 5N)', 'danger');
    if (bv.BIO_031 >= 480) push('SYND_003', 'QTc allongé sévère (≥ 480 ms)', 'danger');
    else if (bv.BIO_031 >= 450) push('SYND_003', 'QTc allongé (450-479 ms)', 'warning');
    if (bv.BIO_010 > 0 && bv.BIO_010 < 50) push('SYND_004', 'Thrombopénie majeure (<50 G/L)', 'danger');
    else if (bv.BIO_010 > 0 && bv.BIO_010 < 100) push('SYND_004', 'Thrombopénie modérée (<100 G/L)', 'warning');
    const sexeH = cas.sexe === 'H';
    if (bv.BIO_009 < (sexeH ? 13 : 12)) push('SYND_005', 'Anémie', 'warning');
    if (bv.BIO_009 < (sexeH ? 11 : 10) && bv.BIO_004 < 45) push('SYND_039', 'Anémie rénale (Hb<11 + DFG<45)', 'warning');
    if (bv.BIO_007 > 0 && bv.BIO_003 > 0 && (bv.BIO_007 * 6.0 / (bv.BIO_003 / 88.4)) > 100) push('SYND_008', 'IR fonctionnelle (Urée/Créat > 100)', 'warning');
    if (bv.BIO_002 > 0 && bv.BIO_002 < 125) push('SYND_009', 'Hyponatrémie sévère (<125)', 'danger');
    else if (bv.BIO_002 > 0 && bv.BIO_002 < 130) push('SYND_009', 'Hyponatrémie modérée (<130)', 'warning');
    if (bv.BIO_001 > 6.0) push('SYND_010', 'Hyperkaliémie sévère (>6)', 'danger');
    else if (bv.BIO_001 > 5.0) push('SYND_010', 'Hyperkaliémie (>5)', 'warning');
    if (bv.BIO_001 > 0 && bv.BIO_001 < 3.0) push('SYND_011', 'Hypokaliémie sévère (<3)', 'danger');
    else if (bv.BIO_001 > 0 && bv.BIO_001 < 3.5) push('SYND_011', 'Hypokaliémie (<3.5)', 'warning');
    if (bv.BIO_019 < 0.1) push('SYND_012', 'Hyperthyroïdie (TSH <0.1)', 'warning');
    else if (bv.BIO_019 > 10) push('SYND_013', 'Hypothyroïdie (TSH >10)', 'warning');
    if (bv.BIO_030 > 5) push('SYND_014', 'INR sur-thérapeutique sévère (>5)', 'danger');
    else if (bv.BIO_030 > 4) push('SYND_014', 'INR sur-thérapeutique (>4)', 'warning');
    if (bv.BIO_037 > 1.2) push('SYND_015', 'Lithiémie toxique (>1.2)', 'danger');
    if (bv.BIO_005 > 2.65) push('SYND_016', 'Hypercalcémie (>2.65)', 'warning');
    else if (bv.BIO_005 < 2.10) push('SYND_017', 'Hypocalcémie (<2.10)', 'warning');
    if (bv.BIO_006 > 0 && bv.BIO_006 < 0.6) push('SYND_018', 'Hypomagnésémie (<0.6)', 'warning');
    if (bv.BIO_004 < 15) push('SYND_020', 'IRC terminale (DFG<15)', 'danger');
    else if (bv.BIO_004 < 30) push('SYND_020', 'IRC sévère (DFG<30)', 'warning');
    else if (bv.BIO_004 < 45) push('SYND_020', 'IRC modérée (DFG<45)', 'info');
    if (bv.BIO_036 < 30) push('SYND_021', 'Hypoalbuminémie (<30 g/L)', 'warning');
    return out;
}

// ─── Pipeline complet ─────────────────────────────────────────────────────────
function runFullPipeline(cas) {
    const result = { sig: cas._sig, errors: [] };
    try {
        result.scores = calculateCompositeScores(cas.prescription);
        const activeMeds = cas.prescription.map(m => ({ dci: m.dci, classe: m.classe || '', db_ref: m, label: m.dci }));
        const ctx = {
            activeMeds, activeComorbs: cas.comorbs,
            ageNum: cas.age, dfgNum: cas.bio.BIO_004,
            sexe: cas.sexe, poidsNum: cas.poids,
            bioK: cas.bio.BIO_001, bioNa: cas.bio.BIO_002,
            bioInr: cas.bio.BIO_030, bioQtc: cas.bio.BIO_031,
            bioHb: cas.bio.BIO_009, bioValues: cas.bio
        };
        result.engine = GeriaEngineV2.evaluer(ctx);
        result.bioSyndromes = detectBioSyndromes(cas);
        // DDI
        const ddi = [];
        const idx = new Map(cas.prescription.map(m => [(m.dci || '').toLowerCase(), m]));
        cas.prescription.forEach(m => {
            (m.ddi_interact_v2 || []).forEach(r => {
                (r.dcis || []).forEach(t => {
                    if (typeof t !== 'string') return;
                    const tm = idx.get(t.toLowerCase()); if (!tm || tm === m) return;
                    ddi.push({ src: m.dci, target: t, classe: r.classe || '', severite: r.severite || 'warning', commentaire: r.commentaire || '' });
                });
            });
        });
        result.ddi = ddi;
    } catch (e) {
        result.errors.push({ phase: 'pipeline', message: e.message, stack: (e.stack || '').slice(0, 200) });
    }
    return result;
}

// ─── Mesures de cohérence intrinsèques ────────────────────────────────────────
const VALID_SEVERITIES = new Set(['info', 'warning', 'danger']);

function analyseCoherence(cas, res, coherenceLog) {
    if (res.errors.length > 0) { coherenceLog.pipelineErrors++; return; }

    // 1. Intégrité structurelle
    [...(res.engine.eviter || []), ...(res.engine.initier || [])].forEach(a => {
        if (!a.titre || typeof a.titre !== 'string' || a.titre.length < 2) coherenceLog.missingTitre++;
        if (a.severite && !VALID_SEVERITIES.has(a.severite)) coherenceLog.invalidSeverity++;
    });
    res.ddi.forEach(a => {
        if (!VALID_SEVERITIES.has(a.severite)) coherenceLog.invalidSeverity++;
        if (!a.classe) coherenceLog.missingClasseDDI++;
    });
    res.bioSyndromes.forEach(s => {
        if (!VALID_SEVERITIES.has(s.severity)) coherenceLog.invalidSeverity++;
    });

    // 2. Scores composites : NaN, négatifs, > max
    Object.entries(res.scores || {}).forEach(([k, s]) => {
        if (typeof s.total !== 'number' || Number.isNaN(s.total)) coherenceLog.scoreNaN++;
        if (s.total < 0) coherenceLog.scoreNegative++;
        if (s.total > 50) coherenceLog.scoreTooHigh++;
        const sum = (s.contributors || []).reduce((a, c) => a + (Number(c.points) || 0), 0);
        if (sum !== s.total) coherenceLog.scoreSumMismatch++;
    });

    // 3. Contradiction intra-cas : un méd à la fois 'eviter' (CI absolue) ET 'initier'
    const ciDcis = new Set();
    (res.engine.eviter || []).forEach(a => {
        if (a.gravite && /CONTRE-INDICATION|ABSOLUE/i.test(String(a.gravite))) {
            (a.med_keys || []).forEach(k => ciDcis.add(k.toLowerCase()));
        }
    });
    (res.engine.initier || []).forEach(a => {
        (a.med_keys_to_initiate || []).forEach(k => {
            if (ciDcis.has(k.toLowerCase())) coherenceLog.contradictionEviterInitier++;
        });
    });

    // 4. Doublons visibles dans alertes engine (même titre 2+ fois)
    const seenTitres = new Map();
    [...(res.engine.eviter || []), ...(res.engine.initier || [])].forEach(a => {
        const k = (a.titre || '').slice(0, 100);
        seenTitres.set(k, (seenTitres.get(k) || 0) + 1);
    });
    seenTitres.forEach(n => { if (n > 1) coherenceLog.duplicateAlerts += (n - 1); });

    // 5. Doublons DDI sur même paire (src, target, classe, severite)
    const seenDdi = new Set();
    res.ddi.forEach(a => {
        const k = `${a.src}::${a.target}::${a.classe}::${a.severite}`;
        if (seenDdi.has(k)) coherenceLog.duplicateDDI++;
        else seenDdi.add(k);
    });

    // 6. Source EBM sur alertes danger
    (res.engine.eviter || []).forEach(a => {
        if (a.severite === 'danger' && (!a.sources_label || a.sources_label.length < 3)) coherenceLog.dangerNoSource++;
    });

    // 7. Cohérence cross-module : si syndrome bio QTc et méd QT (qt≥2) → DDI QT attendu
    const hasBioQT = res.bioSyndromes.some(s => s.id === 'SYND_003');
    if (hasBioQT) {
        const medsQT = cas.prescription.filter(m => (m.scores?.qt || 0) >= 2);
        if (medsQT.length >= 2 && !res.ddi.some(a => /QT|torsade/i.test(a.classe + a.commentaire))) {
            coherenceLog.crossModuleQT++;
        }
    }
    // Cohérence : si syndrome bio Hypokaliémie + diurétique de l'anse présent → alerte DDI ou eviter
    const hasHypoK = res.bioSyndromes.some(s => s.id === 'SYND_011');
    const hasFuro = cas.prescription.some(m => /^(furosemide|torasemide|bumetanide)$/i.test(m.dci || ''));
    if (hasHypoK && hasFuro && !res.ddi.some(a => /hypokali|K\+|kali/i.test(a.classe + a.commentaire))) {
        // pas une violation forcément, on ne le compte pas — c'est une heuristique douce
    }

    // 8. Distribution : compteurs
    coherenceLog.distEvit.push((res.engine.eviter || []).length);
    coherenceLog.distInit.push((res.engine.initier || []).length);
    coherenceLog.distDdi.push(res.ddi.length);
    coherenceLog.distBio.push(res.bioSyndromes.length);
    if ((res.engine.eviter || []).some(a => a.severite === 'danger')) coherenceLog.casWithDanger++;
    if (res.ddi.some(a => a.severite === 'danger')) coherenceLog.casDDIDanger++;
    if (res.bioSyndromes.some(s => s.severity === 'danger')) coherenceLog.casBioDanger++;

    // 9. Couverture : enregistrer les IDs de règles activées
    (res.engine.eviter || []).forEach(a => coherenceLog.coverEviter.add(a.id));
    (res.engine.initier || []).forEach(a => coherenceLog.coverInitier.add(a.id));
    res.bioSyndromes.forEach(s => coherenceLog.coverBio.add(s.id));
}

// ─── Test déterminisme : double pass sur sample de 200 cas ────────────────────
function testDeterminism(samples) {
    let mismatches = 0;
    samples.forEach(cas => {
        const r1 = runFullPipeline(cas);
        const r2 = runFullPipeline(cas);
        const sig1 = JSON.stringify({
            e: (r1.engine?.eviter || []).map(a => a.id).sort(),
            i: (r1.engine?.initier || []).map(a => a.id).sort(),
            d: r1.ddi.map(d => d.src + '->' + d.target).sort(),
            b: r1.bioSyndromes.map(s => s.id).sort(),
            sc: r1.scores ? Object.entries(r1.scores).map(([k, v]) => [k, v.total]) : []
        });
        const sig2 = JSON.stringify({
            e: (r2.engine?.eviter || []).map(a => a.id).sort(),
            i: (r2.engine?.initier || []).map(a => a.id).sort(),
            d: r2.ddi.map(d => d.src + '->' + d.target).sort(),
            b: r2.bioSyndromes.map(s => s.id).sort(),
            sc: r2.scores ? Object.entries(r2.scores).map(([k, v]) => [k, v.total]) : []
        });
        if (sig1 !== sig2) mismatches++;
    });
    return { tested: samples.length, mismatches };
}

// ─── Test monotonicité : ajouter méd ACB → score ACB ≥ ────────────────────────
function testMonotonicityACB(samples) {
    let violations = 0, tested = 0;
    const acbMeds = MEDS.filter(m => (m.acb || 0) >= 2);
    samples.forEach(cas => {
        if (acbMeds.length === 0) return;
        tested++;
        const extra = randChoice(acbMeds);
        if (cas.prescription.includes(extra)) return;
        const r1 = runFullPipeline(cas);
        const cas2 = { ...cas, prescription: [...cas.prescription, extra] };
        const r2 = runFullPipeline(cas2);
        const s1 = r1.scores?.acb?.total || 0;
        const s2 = r2.scores?.acb?.total || 0;
        if (s2 < s1) violations++;
    });
    return { tested, violations };
}

// ─── Boucle bootstrap ─────────────────────────────────────────────────────────
const N_ITER = parseInt(process.env.N_ITER || '100000', 10);
const seen = new Set();
const log = {
    pipelineErrors: 0,
    missingTitre: 0, invalidSeverity: 0, missingClasseDDI: 0,
    scoreNaN: 0, scoreNegative: 0, scoreTooHigh: 0, scoreSumMismatch: 0,
    contradictionEviterInitier: 0,
    duplicateAlerts: 0, duplicateDDI: 0,
    dangerNoSource: 0,
    crossModuleQT: 0,
    casWithDanger: 0, casDDIDanger: 0, casBioDanger: 0,
    distEvit: [], distInit: [], distDdi: [], distBio: [],
    coverEviter: new Set(), coverInitier: new Set(), coverBio: new Set()
};
const sampleForExtraTests = [];
let processed = 0;
const t0 = Date.now();
console.log(`\nStart: N=${N_ITER}, génération 100 % aléatoire (sans phénotype biaisé)\n`);

for (let i = 0; i < N_ITER; i++) {
    const cas = generateRandomCase(seen);
    if (!cas) continue;
    const res = runFullPipeline(cas);
    analyseCoherence(cas, res, log);
    processed++;
    if (sampleForExtraTests.length < 200 && Math.random() < 0.01) sampleForExtraTests.push(cas);
    if ((i + 1) % 5000 === 0) {
        process.stdout.write(`\r  ${i+1}/${N_ITER} (${((Date.now()-t0)/1000).toFixed(1)}s, ${processed} ok)`);
    }
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
console.log(`\n\nElapsed: ${elapsed}s, ${processed} cases, ${seen.size} unique\n`);

// Tests additionnels
console.log('=== Test déterminisme (200 cas re-runnés 2× chacun) ===');
const det = testDeterminism(sampleForExtraTests);
console.log(`  Tested: ${det.tested}, Mismatches: ${det.mismatches}`);

console.log('\n=== Test monotonicité ACB (ajout méd ACB ≥ 2 → score ↑) ===');
const mono = testMonotonicityACB(sampleForExtraTests);
console.log(`  Tested: ${mono.tested}, Violations (score baisse): ${mono.violations}`);

// Stats distribution
function quantile(arr, q) {
    if (arr.length === 0) return 0;
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length * q)];
}
function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

const stats = {
    cases_processed: processed,
    unique_sigs: seen.size,
    pipeline_errors: log.pipelineErrors,
    elapsed_s: +elapsed,
    cases_per_sec: +(processed / elapsed).toFixed(1),
    integrity: {
        missing_titre: log.missingTitre,
        invalid_severity: log.invalidSeverity,
        missing_classe_ddi: log.missingClasseDDI,
        score_NaN: log.scoreNaN,
        score_negative: log.scoreNegative,
        score_too_high: log.scoreTooHigh,
        score_sum_mismatch: log.scoreSumMismatch
    },
    contradictions: {
        eviter_AND_initier_same_med: log.contradictionEviterInitier,
        cross_module_QT_missing_DDI: log.crossModuleQT
    },
    duplicates: {
        alerts_engine: log.duplicateAlerts,
        ddi_pairs: log.duplicateDDI
    },
    sources: {
        danger_no_ebm_source: log.dangerNoSource
    },
    distribution: {
        alerts_eviter:  { mean: +mean(log.distEvit).toFixed(2),  p50: quantile(log.distEvit, 0.5),  p95: quantile(log.distEvit, 0.95) },
        alerts_initier: { mean: +mean(log.distInit).toFixed(2),  p50: quantile(log.distInit, 0.5),  p95: quantile(log.distInit, 0.95) },
        alerts_ddi:     { mean: +mean(log.distDdi).toFixed(2),   p50: quantile(log.distDdi, 0.5),   p95: quantile(log.distDdi, 0.95) },
        alerts_bio:     { mean: +mean(log.distBio).toFixed(2),   p50: quantile(log.distBio, 0.5),   p95: quantile(log.distBio, 0.95) },
        pct_with_danger_engine: +(100 * log.casWithDanger / processed).toFixed(1),
        pct_with_danger_ddi:    +(100 * log.casDDIDanger / processed).toFixed(1),
        pct_with_danger_bio:    +(100 * log.casBioDanger / processed).toFixed(1)
    },
    coverage: {
        eviter_rules_activated: log.coverEviter.size,
        eviter_rules_total: GERIA_RECOS_DB.EVITER.length,
        eviter_pct: +(100 * log.coverEviter.size / GERIA_RECOS_DB.EVITER.length).toFixed(1),
        initier_rules_activated: log.coverInitier.size,
        initier_rules_total: GERIA_RECOS_DB.INITIER.length,
        initier_pct: +(100 * log.coverInitier.size / GERIA_RECOS_DB.INITIER.length).toFixed(1),
        bio_syndromes_activated: log.coverBio.size,
        bio_syndromes_total: Object.keys(MASTER_DB.SYNDROMES).length,
        bio_pct: +(100 * log.coverBio.size / Object.keys(MASTER_DB.SYNDROMES).length).toFixed(1)
    },
    determinism: det,
    monotonicity_ACB: mono
};

console.log('\n=== COHERENCE REPORT ===');
console.log(JSON.stringify(stats, null, 2));

fs.writeFileSync('audit_reports/G_coherence_findings.json', JSON.stringify(stats, null, 2));
console.log('\nDétails dans audit_reports/G_coherence_findings.json');
