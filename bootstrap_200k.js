// Bootstrap N=200 000 cas aléatoires UNIQUES (dédup hash), analyses agrégées.
// Optimisé : ne sérialise pas chaque cas (output JSON cappé à 200 MB max).
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
const CTX_POOL = ['chutes','alcool','bradycardie','constipation_chronique','denutrition','depression','dysphagie','hbp','hepatopathie','incontinence','risque_hemorragique','atcd_hemorragie','sepsis','sliding_scale','stenose_aortique','qt_long_congenital'];

function generateCase(seen) {
    for (let t = 0; t < 5; t++) {
        const age = Math.round(gaussian(78, 9, 60, 102));
        const sexe = randChoice(['H', 'F']);
        const poids = Math.round(gaussian(68, 14, 38, 130));
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
        const contexte_clinique = sampleN(CTX_POOL, randInt(0, 3));
        const prescription = sampleN(MEDS, randInt(1, 20));
        const sig = crypto.createHash('sha1').update(JSON.stringify({
            a: age, s: sexe, p: poids,
            b: Object.values(bio).map(v => Math.round(v * 100)).join(','),
            c: comorbs.sort().join(','),
            ctx: contexte_clinique.sort().join(','),
            m: prescription.map(m => (m.dci || '').toLowerCase()).sort().join(',')
        })).digest('hex').slice(0, 20);
        if (seen.has(sig)) continue;
        seen.add(sig);
        return { age, sexe, poids, bio, comorbs, contexte_clinique, prescription, _sig: sig };
    }
    return null;
}

function detectBio(cas) {
    const o = []; const b = cas.bio;
    const push = (id, sev) => o.push({ id, severity: sev });
    if (b.BIO_014 > 105) push('SYND_001', 'warning');
    if (b.BIO_018 > 850) push('SYND_002', 'danger');
    if (b.BIO_031 >= 480) push('SYND_003', 'danger'); else if (b.BIO_031 >= 450) push('SYND_003', 'warning');
    if (b.BIO_010 < 50) push('SYND_004', 'danger'); else if (b.BIO_010 < 100) push('SYND_004', 'warning');
    if (b.BIO_009 < (cas.sexe === 'H' ? 13 : 12)) push('SYND_005', 'warning');
    if (b.BIO_002 < 125) push('SYND_009', 'danger'); else if (b.BIO_002 < 130) push('SYND_009', 'warning');
    if (b.BIO_001 > 6.0) push('SYND_010', 'danger'); else if (b.BIO_001 > 5.0) push('SYND_010', 'warning');
    if (b.BIO_001 < 3.0) push('SYND_011', 'danger'); else if (b.BIO_001 < 3.5) push('SYND_011', 'warning');
    if (b.BIO_019 < 0.1) push('SYND_012', 'warning'); else if (b.BIO_019 > 10) push('SYND_013', 'warning');
    if (b.BIO_030 > 5) push('SYND_014', 'danger'); else if (b.BIO_030 > 4) push('SYND_014', 'warning');
    if (b.BIO_037 > 1.2) push('SYND_015', 'danger');
    if (b.BIO_004 < 15) push('SYND_020', 'danger'); else if (b.BIO_004 < 30) push('SYND_020', 'warning');
    if (b.BIO_036 < 30) push('SYND_021', 'warning');
    return o;
}

function runPipeline(cas) {
    const activeMeds = cas.prescription.map(m => ({ dci: m.dci, classe: m.classe || '', db_ref: m, label: m.dci }));
    const scores = calculateCompositeScores(cas.prescription, {
        inr: cas.bio.BIO_030, hb: cas.bio.BIO_009, plaq: cas.bio.BIO_010, dfg: cas.bio.BIO_004
    });
    const ctx = {
        activeMeds, activeComorbs: cas.comorbs,
        contexte_clinique: cas.contexte_clinique || [],
        ageNum: cas.age, dfgNum: cas.bio.BIO_004, sexe: cas.sexe, poidsNum: cas.poids,
        bioK: cas.bio.BIO_001, bioInr: cas.bio.BIO_030, bioQtc: cas.bio.BIO_031,
        bioValues: cas.bio
    };
    const eng = GeriaEngineV2.evaluer(ctx);
    const bio = detectBio(cas);
    const ddi = []; const idx = new Map(cas.prescription.map(m => [(m.dci || '').toLowerCase(), m]));
    const seenK = new Set();
    cas.prescription.forEach(m => {
        (m.ddi_interact_v2 || []).forEach(r => {
            (r.dcis || []).forEach(t => {
                if (typeof t !== 'string') return;
                const tm = idx.get(t.toLowerCase()); if (!tm || tm === m) return;
                const k = `${t.toLowerCase()}::${(r.classe || '').trim()}::${r.severite || 'warning'}`;
                if (seenK.has(k)) return; seenK.add(k);
                ddi.push({ src: m.dci, target: t, classe: r.classe || '', severite: r.severite || 'warning' });
            });
        });
    });
    return { scores, engine: eng, bio, ddi };
}

// ─── Aggregateurs ──────────────────────────────────────────────────────────────
const N = parseInt(process.env.N_ITER || '200000', 10);
const seen = new Set();
let processed = 0, errors = 0;
const distN = { eviter: [], initier: [], ddi: [], bio: [], danger: [], warning: [], info: [], complexity: [] };
const distByAge = { '60-69': {n:0, ev:0, dg:0}, '70-79': {n:0, ev:0, dg:0}, '80-89': {n:0, ev:0, dg:0}, '90+': {n:0, ev:0, dg:0} };
const distByMedsCount = new Map(); // n_meds → {n_cases, total_alerts, total_danger}
const evitFreq = new Map(), initFreq = new Map();
const ddiClassFreq = new Map(), ddiSevFreq = { danger: 0, warning: 0, info: 0 };
const scoreLevelDist = {}; // score → {none, low, moderate, high}
const bioFreq = new Map();
const comorbFreq = new Map();
const medFreq = new Map();
let casCalmePoly = 0, casDangerSimple = 0, casSansAlerte = 0, casMonstrueux = 0;
let casWithDangerEng = 0, casWithDangerDdi = 0, casWithDangerBio = 0;
const top20Complex = []; // garde top 20 outliers
const top20Calm = []; // polypharmacie sans danger
const coOccurrence = new Map(); // pair "id_A::id_B" → count

const t0 = Date.now();
const STATUS_EVERY = 5000;
console.log(`\nStart N=${N}, génération 100 % aléatoire avec contextes cliniques\n`);

for (let i = 0; i < N; i++) {
    const cas = generateCase(seen);
    if (!cas) continue;
    let r;
    try { r = runPipeline(cas); } catch (e) { errors++; continue; }
    processed++;

    const nEv = (r.engine.eviter || []).length;
    const nIn = (r.engine.initier || []).length;
    const nDd = r.ddi.length;
    const nBi = r.bio.length;
    const allSev = [
        ...(r.engine.eviter || []).map(a => a.severite),
        ...(r.engine.initier || []).map(a => a.severite || 'warning'),
        ...r.ddi.map(a => a.severite),
        ...r.bio.map(a => a.severity)
    ];
    const dg = allSev.filter(s => s === 'danger').length;
    const wn = allSev.filter(s => s === 'warning').length;
    const nf = allSev.filter(s => s === 'info').length;
    const complexity = dg * 3 + wn * 1.5 + nf * 0.5;

    distN.eviter.push(nEv); distN.initier.push(nIn); distN.ddi.push(nDd); distN.bio.push(nBi);
    distN.danger.push(dg); distN.warning.push(wn); distN.info.push(nf); distN.complexity.push(complexity);

    if (cas.age < 70) { distByAge['60-69'].n++; distByAge['60-69'].ev += nEv; distByAge['60-69'].dg += dg; }
    else if (cas.age < 80) { distByAge['70-79'].n++; distByAge['70-79'].ev += nEv; distByAge['70-79'].dg += dg; }
    else if (cas.age < 90) { distByAge['80-89'].n++; distByAge['80-89'].ev += nEv; distByAge['80-89'].dg += dg; }
    else { distByAge['90+'].n++; distByAge['90+'].ev += nEv; distByAge['90+'].dg += dg; }

    const nmKey = cas.prescription.length;
    const slot = distByMedsCount.get(nmKey) || { n: 0, totAlert: 0, totDanger: 0 };
    slot.n++; slot.totAlert += allSev.length; slot.totDanger += dg;
    distByMedsCount.set(nmKey, slot);

    (r.engine.eviter || []).forEach(a => evitFreq.set(a.id, (evitFreq.get(a.id) || 0) + 1));
    (r.engine.initier || []).forEach(a => initFreq.set(a.id, (initFreq.get(a.id) || 0) + 1));
    r.ddi.forEach(d => {
        const k = `${d.classe}::${d.severite}`;
        ddiClassFreq.set(k, (ddiClassFreq.get(k) || 0) + 1);
        ddiSevFreq[d.severite] = (ddiSevFreq[d.severite] || 0) + 1;
    });
    r.bio.forEach(b => bioFreq.set(b.id, (bioFreq.get(b.id) || 0) + 1));
    cas.comorbs.forEach(c => comorbFreq.set(c, (comorbFreq.get(c) || 0) + 1));
    cas.prescription.forEach(m => medFreq.set(m.dci, (medFreq.get(m.dci) || 0) + 1));

    Object.entries(r.scores || {}).forEach(([k, s]) => {
        if (!scoreLevelDist[k]) scoreLevelDist[k] = { none: 0, minimal: 0, low: 0, moderate: 0, high: 0 };
        scoreLevelDist[k][s.level || 'none']++;
    });

    if (dg >= 1) casWithDangerEng++;
    if (r.ddi.some(d => d.severite === 'danger')) casWithDangerDdi++;
    if (r.bio.some(b => b.severity === 'danger')) casWithDangerBio++;
    if (cas.prescription.length >= 10 && dg === 0) casCalmePoly++;
    if (cas.prescription.length <= 4 && dg >= 2) casDangerSimple++;
    if (dg === 0 && wn === 0) casSansAlerte++;
    if (complexity > 60) casMonstrueux++;

    if (top20Complex.length < 20 || complexity > top20Complex[top20Complex.length-1].complexity) {
        top20Complex.push({
            sig: cas._sig,
            age: cas.age, sexe: cas.sexe, dfg: cas.bio.BIO_004, k: cas.bio.BIO_001,
            inr: cas.bio.BIO_030, qtc: cas.bio.BIO_031,
            nMeds: cas.prescription.length,
            meds: cas.prescription.map(m => m.dci).slice(0, 14),
            comorbs: cas.comorbs,
            ctx: cas.contexte_clinique,
            complexity, nEv, nDd, nBi, dg, wn, nf,
            topDanger: [...(r.engine.eviter || []).filter(a => a.severite === 'danger').slice(0, 3).map(a => a.id+':'+a.titre.slice(0,60)),
                        ...r.ddi.filter(a => a.severite === 'danger').slice(0, 3).map(d => `DDI ${d.src.toUpperCase()}↔${d.target.toUpperCase()}: ${d.classe.slice(0, 60)}`)]
        });
        top20Complex.sort((a, b) => b.complexity - a.complexity);
        if (top20Complex.length > 20) top20Complex.length = 20;
    }
    if (cas.prescription.length >= 10 && dg === 0 && top20Calm.length < 20) {
        top20Calm.push({
            sig: cas._sig,
            age: cas.age, sexe: cas.sexe, dfg: cas.bio.BIO_004,
            nMeds: cas.prescription.length, meds: cas.prescription.map(m => m.dci).slice(0, 14),
            comorbs: cas.comorbs,
            nEv, nDd, nBi
        });
    }

    // Co-occurrences danger EVITER (top patterns)
    const dangerIds = (r.engine.eviter || []).filter(a => a.severite === 'danger').map(a => a.id);
    for (let a = 0; a < dangerIds.length; a++) {
        for (let b = a + 1; b < dangerIds.length; b++) {
            const k = [dangerIds[a], dangerIds[b]].sort().join('::');
            coOccurrence.set(k, (coOccurrence.get(k) || 0) + 1);
        }
    }

    if ((i + 1) % STATUS_EVERY === 0) {
        process.stdout.write(`\r  ${i+1}/${N} (${((Date.now()-t0)/1000).toFixed(0)}s, ${processed} ok, unique ${seen.size})`);
    }
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
console.log(`\n\nDone ${processed}/${N} cases in ${elapsed}s (${(processed/elapsed).toFixed(1)} cases/s), errors=${errors}\n`);

function quant(arr, q) { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length * q)]; }
function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }
function arrMax(a) { let m = -Infinity; for (let i = 0; i < a.length; i++) if (a[i] > m) m = a[i]; return m; }

const summary = {
    N, processed, unique: seen.size, errors,
    elapsed_s: +elapsed,
    cases_per_sec: +(processed / elapsed).toFixed(1),
    distribution: Object.fromEntries(Object.entries(distN).map(([k, v]) => [k, {
        mean: +mean(v).toFixed(2), p25: quant(v, 0.25), p50: quant(v, 0.5),
        p75: quant(v, 0.75), p90: quant(v, 0.9), p95: quant(v, 0.95),
        p99: quant(v, 0.99), max: arrMax(v)
    }])),
    pct: {
        with_danger_eng: +(100 * casWithDangerEng / processed).toFixed(2),
        with_danger_ddi: +(100 * casWithDangerDdi / processed).toFixed(2),
        with_danger_bio: +(100 * casWithDangerBio / processed).toFixed(2),
        sans_alerte: +(100 * casSansAlerte / processed).toFixed(3),
        monstrueux: +(100 * casMonstrueux / processed).toFixed(2),
        calme_polymed: +(100 * casCalmePoly / processed).toFixed(2),
        danger_simple: +(100 * casDangerSimple / processed).toFixed(2)
    },
    age_strata: Object.fromEntries(Object.entries(distByAge).map(([k, v]) => [k, {
        n: v.n, mean_eviter: +(v.ev / Math.max(1, v.n)).toFixed(2), mean_danger: +(v.dg / Math.max(1, v.n)).toFixed(2)
    }])),
    by_med_count: [...distByMedsCount.entries()].sort((a, b) => a[0] - b[0]).map(([n, v]) => ({
        n_meds: n, n_cases: v.n,
        mean_alerts: +(v.totAlert / v.n).toFixed(2),
        mean_danger: +(v.totDanger / v.n).toFixed(2)
    })),
    coverage: {
        eviter_activated: evitFreq.size,
        eviter_total: GERIA_RECOS_DB.EVITER.length,
        eviter_pct: +(100 * evitFreq.size / GERIA_RECOS_DB.EVITER.length).toFixed(1),
        initier_activated: initFreq.size,
        initier_total: GERIA_RECOS_DB.INITIER.length,
        initier_pct: +(100 * initFreq.size / GERIA_RECOS_DB.INITIER.length).toFixed(1),
        ddi_classes_distinct: ddiClassFreq.size,
        bio_syndromes_activated: bioFreq.size
    },
    severity_dist_ddi: ddiSevFreq,
    score_level_dist: scoreLevelDist,
    top_eviter: [...evitFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30),
    top_initier: [...initFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20),
    top_ddi_classes: [...ddiClassFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30),
    top_bio_syndromes: [...bioFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20),
    top_comorbs: [...comorbFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20),
    top_meds_freq: [...medFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30),
    eviter_jamais: GERIA_RECOS_DB.EVITER.filter(r => !evitFreq.has(r.id)).map(r => r.id),
    initier_jamais: GERIA_RECOS_DB.INITIER.filter(r => !initFreq.has(r.id)).map(r => r.id),
    top_cooccurrence_danger: [...coOccurrence.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20),
    sample_top20_complex: top20Complex,
    sample_top20_calm: top20Calm
};

fs.writeFileSync('audit_reports/G_bootstrap200k_findings.json', JSON.stringify(summary, null, 2));
console.log('=== Aperçu ===');
console.log('processed='+processed+' unique='+seen.size+' errors='+errors);
console.log('coverage EVITER: '+summary.coverage.eviter_pct+'%, INITIER: '+summary.coverage.initier_pct+'%');
console.log('% cas danger engine: '+summary.pct.with_danger_eng+'%, sans alerte: '+summary.pct.sans_alerte+'%');
console.log('complexity p50/p90/p99: '+summary.distribution.complexity.p50+'/'+summary.distribution.complexity.p90+'/'+summary.distribution.complexity.p99);
console.log('Top 10 EVITER:');
summary.top_eviter.slice(0, 10).forEach(([id, n]) => console.log('  '+n+'x '+id));
console.log('\nDétails dans audit_reports/G_bootstrap200k_findings.json');
