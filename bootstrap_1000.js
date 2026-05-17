// ============================================================================
// Bootstrap 1000 cas aléatoires — analyse fine cas-par-cas
// ============================================================================
// Différent de bootstrap_coherence.js (100k stats agrégées) et expert_review (12
// cas manuels) : 1000 cas aléatoires complets, chacun analysé individuellement
// pour détecter outliers, patterns émergents, cas atypiques.
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

console.log(`Loaded ${MASTER_DB.MEDICAMENTS.length} meds | ${GERIA_RECOS_DB.EVITER.length} EVITER | ${GERIA_RECOS_DB.INITIER.length} INITIER`);

// ─── Helpers aléatoires ───────────────────────────────────────────────────────
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const randChoice = a => a[Math.floor(Math.random() * a.length)];
function sampleN(a, n) { const c = [...a], o = []; for (let i = 0; i < n && c.length; i++) o.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]); return o; }
function gaussian(mu, sg, mn, mx) {
    const u1 = Math.random(), u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.max(mn, Math.min(mx, mu + z * sg));
}

const ALL_PAT = Object.keys(MASTER_DB.PATHOLOGIES);
const MEDS = MASTER_DB.MEDICAMENTS;

function generateCase(seen) {
    for (let t = 0; t < 5; t++) {
        const age = Math.round(gaussian(78, 9, 60, 102));
        const sexe = randChoice(['H', 'F']);
        const poids = Math.round(gaussian(68, 14, 38, 130));
        const taille = Math.round(gaussian(167, 9, 142, 195));
        const bio = {
            BIO_001: +(gaussian(4.2, 0.7, 2.5, 7.5)).toFixed(2),
            BIO_002: Math.round(gaussian(138, 5, 115, 155)),
            BIO_003: Math.round(gaussian(95, 50, 40, 400)),
            BIO_004: Math.round(gaussian(60, 25, 6, 115)),
            BIO_005: +(gaussian(2.30, 0.15, 1.75, 3.00)).toFixed(2),
            BIO_006: +(gaussian(0.85, 0.20, 0.40, 1.50)).toFixed(2),
            BIO_007: +(gaussian(7, 3, 2, 25)).toFixed(1),
            BIO_009: +(gaussian(12, 2.2, 5.0, 17.5)).toFixed(1),
            BIO_010: Math.round(gaussian(220, 90, 15, 700)),
            BIO_013: Math.round(gaussian(28, 35, 8, 500)),
            BIO_014: Math.round(gaussian(28, 40, 8, 600)),
            BIO_018: Math.round(gaussian(120, 250, 30, 5000)),
            BIO_019: +(gaussian(2.5, 3.5, 0.01, 40)).toFixed(2),
            BIO_030: +(gaussian(1.4, 1.0, 0.8, 10)).toFixed(2),
            BIO_031: Math.round(gaussian(425, 40, 340, 620)),
            BIO_036: +(gaussian(35, 8, 12, 55)).toFixed(0),
            BIO_037: +(gaussian(0.7, 0.4, 0.05, 3.5)).toFixed(2),
            BIO_040: +(gaussian(2.5, 1.5, 0.5, 12)).toFixed(1)
        };
        const comorbs = sampleN(ALL_PAT, randInt(0, 10));
        const prescription = sampleN(MEDS, randInt(1, 20));
        const sig = crypto.createHash('sha1').update(JSON.stringify({
            a: age, s: sexe,
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

// Détecteur bio syndromes (subset du moteur principal)
function detectBio(cas) {
    const o = []; const b = cas.bio;
    const push = (id, label, sev) => o.push({ id, label, severity: sev });
    if (b.BIO_014 > 105) push('SYND_001', 'Cytolyse hépatique', 'warning');
    if (b.BIO_018 > 850) push('SYND_002', 'Rhabdomyolyse', 'danger');
    if (b.BIO_031 >= 480) push('SYND_003', 'QTc allongé sévère', 'danger');
    else if (b.BIO_031 >= 450) push('SYND_003', 'QTc allongé', 'warning');
    if (b.BIO_010 < 50) push('SYND_004', 'Thrombopénie majeure', 'danger');
    else if (b.BIO_010 < 100) push('SYND_004', 'Thrombopénie modérée', 'warning');
    if (b.BIO_009 < (cas.sexe === 'H' ? 13 : 12)) push('SYND_005', 'Anémie', 'warning');
    if (b.BIO_002 < 125) push('SYND_009', 'Hyponatrémie sévère', 'danger');
    else if (b.BIO_002 < 130) push('SYND_009', 'Hyponatrémie', 'warning');
    if (b.BIO_001 > 6.0) push('SYND_010', 'Hyperkaliémie sévère', 'danger');
    else if (b.BIO_001 > 5.0) push('SYND_010', 'Hyperkaliémie', 'warning');
    if (b.BIO_001 < 3.0) push('SYND_011', 'Hypokaliémie sévère', 'danger');
    else if (b.BIO_001 < 3.5) push('SYND_011', 'Hypokaliémie', 'warning');
    if (b.BIO_019 < 0.1) push('SYND_012', 'Hyperthyroïdie', 'warning');
    else if (b.BIO_019 > 10) push('SYND_013', 'Hypothyroïdie', 'warning');
    if (b.BIO_030 > 5) push('SYND_014', 'INR sur-thérapeutique sévère', 'danger');
    else if (b.BIO_030 > 4) push('SYND_014', 'INR sur-thérapeutique', 'warning');
    if (b.BIO_037 > 1.2) push('SYND_015', 'Lithiémie toxique', 'danger');
    if (b.BIO_004 < 15) push('SYND_020', 'IRC terminale', 'danger');
    else if (b.BIO_004 < 30) push('SYND_020', 'IRC sévère', 'warning');
    if (b.BIO_036 < 30) push('SYND_021', 'Hypoalbuminémie', 'warning');
    return o;
}

function runPipeline(cas) {
    const out = { sig: cas._sig, errors: [] };
    try {
        const activeMeds = cas.prescription.map(m => ({ dci: m.dci, classe: m.classe || '', db_ref: m, label: m.dci }));
        out.scores = calculateCompositeScores(cas.prescription, {
            inr: cas.bio.BIO_030, hb: cas.bio.BIO_009, plaq: cas.bio.BIO_010, dfg: cas.bio.BIO_004
        });
        const ctx = {
            activeMeds, activeComorbs: cas.comorbs,
            ageNum: cas.age, dfgNum: cas.bio.BIO_004,
            sexe: cas.sexe, poidsNum: cas.poids,
            bioK: cas.bio.BIO_001, bioInr: cas.bio.BIO_030, bioQtc: cas.bio.BIO_031,
            bioValues: cas.bio
        };
        out.engine = GeriaEngineV2.evaluer(ctx);
        out.bio = detectBio(cas);
        // DDI dédupliqué
        const ddi = []; const idx = new Map(cas.prescription.map(m => [(m.dci || '').toLowerCase(), m]));
        const seenK = new Set();
        cas.prescription.forEach(m => {
            (m.ddi_interact_v2 || []).forEach(r => {
                (r.dcis || []).forEach(t => {
                    if (typeof t !== 'string') return;
                    const tm = idx.get(t.toLowerCase()); if (!tm || tm === m) return;
                    const k = `${t.toLowerCase()}::${(r.classe || '').trim()}::${r.severite || 'warning'}`;
                    if (seenK.has(k)) return; seenK.add(k);
                    ddi.push({ src: m.dci, target: t, classe: r.classe || '', severite: r.severite || 'warning', commentaire: r.commentaire || '' });
                });
            });
        });
        out.ddi = ddi;
    } catch (e) { out.errors.push(e.message); }
    return out;
}

// ─── Boucle 1000 cas ──────────────────────────────────────────────────────────
const N = 1000;
const seen = new Set();
const cases = [];
const t0 = Date.now();
for (let i = 0; i < N; i++) {
    const cas = generateCase(seen);
    if (!cas) continue;
    const r = runPipeline(cas);
    if (r.errors.length > 0) continue;
    // Index "complexité clinique" : danger×3 + warning×1.5 + info×0.5
    const allAlerts = [
        ...(r.engine.eviter || []).map(a => ({ sev: a.severite, src: 'eviter' })),
        ...(r.engine.initier || []).map(a => ({ sev: a.severite || 'warning', src: 'initier' })),
        ...r.ddi.map(a => ({ sev: a.severite, src: 'ddi' })),
        ...r.bio.map(a => ({ sev: a.severity, src: 'bio' }))
    ];
    const dangerN = allAlerts.filter(a => a.sev === 'danger').length;
    const warningN = allAlerts.filter(a => a.sev === 'warning').length;
    const infoN = allAlerts.filter(a => a.sev === 'info').length;
    const complexity = dangerN * 3 + warningN * 1.5 + infoN * 0.5;
    // Sources EBM uniques (pour évaluer richesse documentaire)
    const sources = new Set();
    (r.engine.eviter || []).forEach(a => (a.sources || []).forEach(s => sources.add(s)));
    cases.push({
        cas, output: r,
        metrics: {
            nEvit: (r.engine.eviter || []).length,
            nInit: (r.engine.initier || []).length,
            nDdi: r.ddi.length,
            nBio: r.bio.length,
            danger: dangerN, warning: warningN, info: infoN,
            complexity,
            sources: sources.size,
            scoreMax: Math.max(0, ...Object.values(r.scores || {}).map(s => s.total))
        }
    });
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
console.log(`\nProcessed ${cases.length} cases in ${elapsed}s (${(cases.length/elapsed).toFixed(1)} cases/s)\n`);

// ─── Analyse fine ─────────────────────────────────────────────────────────────
function p(arr, q) { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length * q)]; }
function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }

const mEvit = cases.map(c => c.metrics.nEvit);
const mInit = cases.map(c => c.metrics.nInit);
const mDdi  = cases.map(c => c.metrics.nDdi);
const mBio  = cases.map(c => c.metrics.nBio);
const mDg   = cases.map(c => c.metrics.danger);
const mCx   = cases.map(c => c.metrics.complexity);
const mSrc  = cases.map(c => c.metrics.sources);

// Outliers
const byComplex = [...cases].sort((a, b) => b.metrics.complexity - a.metrics.complexity);
const top10Complex = byComplex.slice(0, 10);
const bottom10 = byComplex.slice(-10).reverse();
const calmPoly = cases.filter(c => c.cas.prescription.length >= 10 && c.metrics.danger === 0);
const dangerSimple = cases.filter(c => c.cas.prescription.length <= 4 && c.metrics.danger >= 2);
const noAlert = cases.filter(c => c.metrics.danger === 0 && c.metrics.warning === 0);
const monstrous = cases.filter(c => c.metrics.complexity > 60);

// Couverture règles activées
const allEvitIds = new Set(); const allInitIds = new Set();
cases.forEach(c => {
    (c.output.engine.eviter || []).forEach(a => allEvitIds.add(a.id));
    (c.output.engine.initier || []).forEach(a => allInitIds.add(a.id));
});
const evitTotal = GERIA_RECOS_DB.EVITER.length;
const initTotal = GERIA_RECOS_DB.INITIER.length;
const evitNonActiv = GERIA_RECOS_DB.EVITER.filter(r => !allEvitIds.has(r.id)).map(r => r.id);
const initNonActiv = GERIA_RECOS_DB.INITIER.filter(r => !allInitIds.has(r.id)).map(r => r.id);

// Top règles déclenchées (couverture inverse)
const evitFreq = new Map();
cases.forEach(c => (c.output.engine.eviter || []).forEach(a => evitFreq.set(a.id, (evitFreq.get(a.id) || 0) + 1)));
const topEvit = [...evitFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
const ddiFreq = new Map();
cases.forEach(c => c.output.ddi.forEach(d => {
    const k = `${d.classe}::${d.severite}`;
    ddiFreq.set(k, (ddiFreq.get(k) || 0) + 1);
}));
const topDdi = [...ddiFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

// Profils démographiques
const ageDist = { '60-69': 0, '70-79': 0, '80-89': 0, '90+': 0 };
cases.forEach(c => {
    const a = c.cas.age;
    if (a < 70) ageDist['60-69']++;
    else if (a < 80) ageDist['70-79']++;
    else if (a < 90) ageDist['80-89']++;
    else ageDist['90+']++;
});

const summary = {
    N: cases.length, elapsed_s: +elapsed,
    distribution: {
        n_eviter:  { mean: +mean(mEvit).toFixed(2),  p50: p(mEvit, 0.5),  p90: p(mEvit, 0.9),  p99: p(mEvit, 0.99) },
        n_initier: { mean: +mean(mInit).toFixed(2),  p50: p(mInit, 0.5),  p90: p(mInit, 0.9),  p99: p(mInit, 0.99) },
        n_ddi:     { mean: +mean(mDdi).toFixed(2),   p50: p(mDdi, 0.5),   p90: p(mDdi, 0.9),   p99: p(mDdi, 0.99) },
        n_bio:     { mean: +mean(mBio).toFixed(2),   p50: p(mBio, 0.5),   p90: p(mBio, 0.9),   p99: p(mBio, 0.99) },
        n_danger:  { mean: +mean(mDg).toFixed(2),    p50: p(mDg, 0.5),    p90: p(mDg, 0.9),    p99: p(mDg, 0.99) },
        complexity:{ mean: +mean(mCx).toFixed(2),    p50: p(mCx, 0.5),    p90: p(mCx, 0.9),    p99: p(mCx, 0.99) },
        sources_uniques: { mean: +mean(mSrc).toFixed(2), p50: p(mSrc, 0.5) }
    },
    demo: ageDist,
    outliers: {
        cas_calmes_polymed: calmPoly.length,
        cas_danger_simple: dangerSimple.length,
        cas_sans_alerte: noAlert.length,
        cas_monstrueux: monstrous.length
    },
    coverage: {
        eviter_activated: allEvitIds.size,
        eviter_total: evitTotal,
        eviter_pct: +(100 * allEvitIds.size / evitTotal).toFixed(1),
        initier_activated: allInitIds.size,
        initier_total: initTotal,
        initier_pct: +(100 * allInitIds.size / initTotal).toFixed(1)
    },
    top_evit_rules: topEvit,
    top_ddi_classes: topDdi,
    eviter_jamais_activees: evitNonActiv,
    initier_jamais_activees: initNonActiv,
    sample_top10_complex: top10Complex.map(c => ({
        sig: c.cas._sig.slice(0, 10),
        age: c.cas.age, sexe: c.cas.sexe,
        nMeds: c.cas.prescription.length,
        meds: c.cas.prescription.slice(0, 8).map(m => m.dci),
        dfg: c.cas.bio.BIO_004, k: c.cas.bio.BIO_001, inr: c.cas.bio.BIO_030,
        complexity: c.metrics.complexity,
        n_alerts: { eviter: c.metrics.nEvit, ddi: c.metrics.nDdi, bio: c.metrics.nBio },
        top_engine: (c.output.engine.eviter || []).slice(0, 3).map(a => `${a.severite}|${a.id}|${a.titre.slice(0, 60)}`)
    }))
};

console.log('=== Synthèse ===');
console.log(JSON.stringify(summary, null, 2));

fs.writeFileSync('audit_reports/G_bootstrap1000_findings.json', JSON.stringify({
    summary,
    full_cases: cases.map(c => ({
        sig: c.cas._sig,
        age: c.cas.age, sexe: c.cas.sexe, poids: c.cas.poids,
        bio: c.cas.bio,
        comorbs: c.cas.comorbs,
        prescription: c.cas.prescription.map(m => m.dci),
        metrics: c.metrics
    }))
}, null, 2));
console.log('\nDétails dans audit_reports/G_bootstrap1000_findings.json');
