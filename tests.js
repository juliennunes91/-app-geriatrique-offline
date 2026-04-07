// tests.js — Tests unitaires GeriaAssist (Node.js standalone, aucune dépendance)
// Usage: node tests.js

const assert = require('assert');
let passed = 0, failed = 0;

function test(name, fn) {
    try { fn(); passed++; console.log(`  ✅ ${name}`); }
    catch(e) { failed++; console.log(`  ❌ ${name}: ${e.message}`); }
}

// ============================================================================
// 1. SANITIZE TEXT
// ============================================================================
console.log('\n🧪 sanitizeText');

// Simulate sanitizeText from app_core.js
const sanitizeText = (() => {
    const _cache = new Map();
    return str => {
        if (!str) return "";
        const k = String(str);
        let v = _cache.get(k);
        if (v !== undefined) return v;
        v = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
        _cache.set(k, v);
        if (_cache.size > 5000) _cache.clear();
        return v;
    };
})();

test('empty string → ""', () => assert.strictEqual(sanitizeText(''), ''));
test('null → ""', () => assert.strictEqual(sanitizeText(null), ''));
test('undefined → ""', () => assert.strictEqual(sanitizeText(undefined), ''));
test('Amoxicilline → amoxicilline', () => assert.strictEqual(sanitizeText('Amoxicilline'), 'amoxicilline'));
test('Ibuprofène → ibuprofene', () => assert.strictEqual(sanitizeText('Ibuprofène'), 'ibuprofene'));
test('Acide acétylsalicylique → acideacetylsalicylique', () => assert.strictEqual(sanitizeText('Acide acétylsalicylique'), 'acideacetylsalicylique'));
test('removes special chars', () => assert.strictEqual(sanitizeText('A-B_C (D)'), 'abcd'));
test('cache works (same result on 2nd call)', () => {
    sanitizeText('TestCache123');
    assert.strictEqual(sanitizeText('TestCache123'), 'testcache123');
});

// ============================================================================
// 2. ESCAPE HTML
// ============================================================================
console.log('\n🧪 escapeHtml');

const escapeHtml = str => {
    if (!str) return "";
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

test('empty → ""', () => assert.strictEqual(escapeHtml(''), ''));
test('null → ""', () => assert.strictEqual(escapeHtml(null), ''));
test('no special chars', () => assert.strictEqual(escapeHtml('hello'), 'hello'));
test('escapes <script>', () => assert.strictEqual(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;'));
test('escapes quotes', () => assert.strictEqual(escapeHtml('"test" & \'value\''), '&quot;test&quot; &amp; &#39;value&#39;'));
test('preserves accents', () => assert.strictEqual(escapeHtml('Ibuprofène'), 'Ibuprofène'));

// ============================================================================
// 3. DFG CALCULATIONS
// ============================================================================
console.log('\n🧪 Calcul DFG (Cockcroft-Gault & CKD-EPI)');

function calculerDFG_test(age, poids, creat, sexe) {
    if (age <= 0 || creat <= 0) return { cg: 0, ckdepi: 0 };
    if (age < 18 || age > 120) return { cg: 0, ckdepi: 0 };
    if (creat > 2000) return { cg: 0, ckdepi: 0 };
    let scrMgDl = creat / 88.4;
    let kappa = (sexe === 'F') ? 0.7 : 0.9;
    let alpha = (sexe === 'F') ? -0.241 : -0.302;
    let min = Math.min(scrMgDl / kappa, 1);
    let max = Math.max(scrMgDl / kappa, 1);
    let ckdepi = 142 * Math.pow(min, alpha) * Math.pow(max, -1.200) * Math.pow(0.9938, age) * (sexe === 'F' ? 1.012 : 1);
    let cg = 0;
    if (poids > 0) {
        let constante = (sexe === 'M') ? 1.23 : 1.04;
        cg = ((140 - age) * poids * constante) / creat;
    }
    return { cg: Math.round(cg), ckdepi: Math.round(ckdepi) };
}

test('80F 60kg creat=80 → CG ~49', () => {
    let r = calculerDFG_test(80, 60, 80, 'F');
    assert.ok(r.cg >= 45 && r.cg <= 55, `CG=${r.cg}`);
});
test('80M 70kg creat=100 → CG ~52', () => {
    let r = calculerDFG_test(80, 70, 100, 'M');
    assert.ok(r.cg >= 48 && r.cg <= 56, `CG=${r.cg}`);
});
test('CKD-EPI 80F creat=80 → plausible', () => {
    let r = calculerDFG_test(80, 60, 80, 'F');
    assert.ok(r.ckdepi > 30 && r.ckdepi < 100, `CKD-EPI=${r.ckdepi}`);
});
test('edge: age=18 → valid', () => {
    let r = calculerDFG_test(18, 70, 80, 'M');
    assert.ok(r.cg > 0 && r.ckdepi > 0);
});
test('edge: age=120 → valid', () => {
    let r = calculerDFG_test(120, 50, 100, 'F');
    assert.ok(r.cg > 0);
});
test('edge: age=121 → returns 0', () => {
    let r = calculerDFG_test(121, 50, 100, 'F');
    assert.strictEqual(r.cg, 0);
});
test('edge: creat=2001 → returns 0', () => {
    let r = calculerDFG_test(80, 60, 2001, 'F');
    assert.strictEqual(r.cg, 0);
});
test('edge: no weight → CG=0, CKD-EPI valid', () => {
    let r = calculerDFG_test(80, 0, 80, 'F');
    assert.strictEqual(r.cg, 0);
    assert.ok(r.ckdepi > 0);
});

// ============================================================================
// 4. SCORE CHA2DS2-VASc
// ============================================================================
console.log('\n🧪 Score CHA₂DS₂-VASc');

function calcCHA2DS2(age, sexe, comorbs) {
    let score = 0;
    if (age >= 75) score += 2;
    else if (age >= 65) score += 1;
    if (sexe === 'F') score += 1;
    if (comorbs.some(c => ['PAT_001','PAT_002','PAT_003'].includes(c))) score += 1; // IC
    if (comorbs.includes('PAT_005')) score += 1; // HTA
    if (comorbs.includes('PAT_016')) score += 1; // Diabète
    if (comorbs.includes('PAT_008')) score += 2; // AVC
    if (comorbs.some(c => ['PAT_004','PAT_007'].includes(c))) score += 1; // Vasc
    return score;
}

test('80F pas de comorbidité → 3 (age75+2, F+1)', () => assert.strictEqual(calcCHA2DS2(80, 'F', []), 3));
test('60M pas de comorbidité → 0', () => assert.strictEqual(calcCHA2DS2(60, 'M', []), 0));
test('70M HTA+diabète → 3 (age65+1, HTA+1, diab+1)', () => assert.strictEqual(calcCHA2DS2(70, 'M', ['PAT_005', 'PAT_016']), 3));
test('80M AVC → 4 (age75+2, AVC+2)', () => assert.strictEqual(calcCHA2DS2(80, 'M', ['PAT_008']), 4));
test('85F IC+HTA+AVC+diabète+vasc → 9 (max)', () => assert.strictEqual(calcCHA2DS2(85, 'F', ['PAT_001','PAT_005','PAT_008','PAT_016','PAT_004']), 9));
test('65M → 1 (age65+1)', () => assert.strictEqual(calcCHA2DS2(65, 'M', []), 1));
test('74M → 1 (age>=65)', () => assert.strictEqual(calcCHA2DS2(74, 'M', []), 1));
test('64M → 0 (age<65)', () => assert.strictEqual(calcCHA2DS2(64, 'M', []), 0));

// ============================================================================
// 5. SCORE HAS-BLED (partiel)
// ============================================================================
console.log('\n🧪 Score HAS-BLED (partiel)');

function calcHASBLED(age, dfg, hasAVC, hasAINS) {
    let score = 0;
    if (dfg > 0 && dfg < 50) score += 1;
    if (hasAVC) score += 1;
    if (age > 65) score += 1;
    if (hasAINS) score += 1;
    return score;
}

test('80 ans DFG 30 AVC → 3 (IRC+AVC+age)', () => assert.strictEqual(calcHASBLED(80, 30, true, false), 3));
test('60 ans DFG 80 pas AVC → 0', () => assert.strictEqual(calcHASBLED(60, 80, false, false), 0));
test('70 ans DFG 45 AINS → 3', () => assert.strictEqual(calcHASBLED(70, 45, false, true), 3));

// ============================================================================
// 6. SCORES_CONFIG THRESHOLDS
// ============================================================================
console.log('\n🧪 SCORES_CONFIG seuils');

const SCORES_CONFIG = {
    CHA2DS2: { seuils: { haut: 2 } },
    HAS_BLED: { seuils: { modere: 1, haut: 3 } },
    ORBIT: { seuils: { modere: 3, haut: 4 } },
    RISQ_PATH: { seuils: { modere: 5, haut: 10 } },
    TISDALE: { seuils: { modere: 7, haut: 11 } },
    BIO: { anemia_M: 13, anemia_F: 12, hypoK: 3.5, hypoCa: 2.15, irc_has: 50, irc_orbit: 60, irc_severe: 30, qtc_prolonge: 450 },
    AGE: { cha_75: 75, cha_65: 65, has_65: 65, orbit_75: 75, risq_65: 65, tisdale_68: 68 }
};

test('CHA2DS2 haut = 2', () => assert.strictEqual(SCORES_CONFIG.CHA2DS2.seuils.haut, 2));
test('HAS_BLED haut = 3', () => assert.strictEqual(SCORES_CONFIG.HAS_BLED.seuils.haut, 3));
test('ORBIT modere = 3', () => assert.strictEqual(SCORES_CONFIG.ORBIT.seuils.modere, 3));
test('TISDALE haut = 11', () => assert.strictEqual(SCORES_CONFIG.TISDALE.seuils.haut, 11));
test('Bio anemia M = 13', () => assert.strictEqual(SCORES_CONFIG.BIO.anemia_M, 13));
test('Bio hypoK = 3.5', () => assert.strictEqual(SCORES_CONFIG.BIO.hypoK, 3.5));
test('Age CHA 75 = 75', () => assert.strictEqual(SCORES_CONFIG.AGE.cha_75, 75));

// ============================================================================
// 7. BIO SYNDROME THRESHOLDS
// ============================================================================
console.log('\n🧪 Seuils biologiques syndromes');

function checkBioThreshold(name, value, threshold, op) {
    if (value <= 0) return false;
    if (op === '<') return value < threshold;
    if (op === '>') return value > threshold;
    if (op === '>=') return value >= threshold;
    if (op === '<=') return value <= threshold;
    return false;
}

test('Hyponatrémie Na=128 < 130', () => assert.ok(checkBioThreshold('Na', 128, 130, '<')));
test('Hyponatrémie Na=135 non', () => assert.ok(!checkBioThreshold('Na', 135, 130, '<')));
test('Hyperkaliémie K=5.5 > 5.0', () => assert.ok(checkBioThreshold('K', 5.5, 5.0, '>')));
test('Hypokaliémie K=3.2 < 3.5', () => assert.ok(checkBioThreshold('K', 3.2, 3.5, '<')));
test('QTc allongé 470 >= 450', () => assert.ok(checkBioThreshold('QTc', 470, 450, '>=')));
test('QTc normal 430 < 450', () => assert.ok(!checkBioThreshold('QTc', 430, 450, '>=')));
test('IRC sévère DFG=25 < 30', () => assert.ok(checkBioThreshold('DFG', 25, 30, '<')));
test('Valeur 0 → false (non renseigné)', () => assert.ok(!checkBioThreshold('K', 0, 3.5, '<')));

// ============================================================================
// 8. CHILD-PUGH SCORING
// ============================================================================
console.log('\n🧪 Score Child-Pugh');

function childPughClass(bili, alb, tp, ascite, enceph) {
    let score = bili + alb + tp + ascite + enceph;
    if (score <= 6) return 'A';
    if (score <= 9) return 'B';
    return 'C';
}

test('Score 5 → A', () => assert.strictEqual(childPughClass(1, 1, 1, 1, 1), 'A'));
test('Score 6 → A', () => assert.strictEqual(childPughClass(2, 1, 1, 1, 1), 'A'));
test('Score 7 → B', () => assert.strictEqual(childPughClass(2, 2, 1, 1, 1), 'B'));
test('Score 9 → B', () => assert.strictEqual(childPughClass(2, 2, 2, 2, 1), 'B'));
test('Score 10 → C', () => assert.strictEqual(childPughClass(2, 2, 2, 2, 2), 'C'));
test('Score 15 → C', () => assert.strictEqual(childPughClass(3, 3, 3, 3, 3), 'C'));

// ============================================================================
// 9. DRUG CLASS MATCHING (index inversé)
// ============================================================================
console.log('\n🧪 matchesDrugClass (index inversé)');

// Load drug_classes.js via Function constructor to get const-scoped vars
const fs = require('fs');
const _dcCode = fs.readFileSync(__dirname + '/drug_classes.js', 'utf8');
const _dcFn = new Function('sanitizeText', _dcCode + '\nreturn {DRUG_CLASSES, _ALIAS_EXACT_INDEX, matchesDrugClass, matchesDrugClassAnsm};');
const _dc = _dcFn(sanitizeText);
const matchesDrugClass = _dc.matchesDrugClass;
const matchesDrugClassAnsm = _dc.matchesDrugClassAnsm;

test('ibuprofene → ains: true', () => assert.ok(matchesDrugClass('ibuprofene', '', 'ains')));
test('bisoprolol → betabloquant: true', () => assert.ok(matchesDrugClass('bisoprolol', '', 'betabloquant')));
test('apixaban → anticoag: true', () => assert.ok(matchesDrugClass('apixaban', '', 'anticoag')));
test('ramipril → iec (suffix pril): true', () => assert.ok(matchesDrugClass('ramipril', '', 'iec')));
test('losartan → ara2 (suffix sartan): true', () => assert.ok(matchesDrugClass('losartan', '', 'ara2')));
test('amlodipine → inhibiteurcalcique: true', () => assert.ok(matchesDrugClass('amlodipine', '', 'inhibiteurcalcique')));
test('paracetamol → ains: false', () => assert.ok(!matchesDrugClass('paracetamol', '', 'ains')));
test('bisoprolol → antihypertenseur: true (composite)', () => assert.ok(matchesDrugClass('bisoprolol', '', 'antihypertenseur')));
test('amlodipine → antihypertenseur: true (composite)', () => assert.ok(matchesDrugClass('amlodipine', '', 'antihypertenseur')));
test('omeprazole → ipp: true', () => assert.ok(matchesDrugClass('omeprazole', '', 'ipp')));
test('haloperidol → antipsychotique: true', () => assert.ok(matchesDrugClass('haloperidol', '', 'antipsychotique')));
test('morphine → opioid: true', () => assert.ok(matchesDrugClass('morphine', '', 'opioid')));
test('diazepam → benzodiazepine: true', () => assert.ok(matchesDrugClass('diazepam', '', 'benzodiazepine')));
test('digoxine → digitalique: true', () => assert.ok(matchesDrugClass('digoxine', '', 'digitalique')));
test('metformine → antidiabetique: true', () => assert.ok(matchesDrugClass('metformine', '', 'antidiabetique')));

// ANSM variant (pluriel, accents)
test('ANSM: ibuprofene → antiinflammatoires: true', () => assert.ok(matchesDrugClassAnsm('ibuprofene', '', 'antiinflammatoires')));
test('ANSM: bisoprolol → betabloquants: true', () => assert.ok(matchesDrugClassAnsm('bisoprolol', '', 'betabloquants')));
test('ANSM: furosemide → diuretiques: true', () => assert.ok(matchesDrugClassAnsm('furosemide', '', 'diuretiques')));

// ============================================================================
// 10. FREQUENCY SCORING (suivi bio)
// ============================================================================
console.log('\n🧪 Fréquences suivi biologique');

const _FREQ_PRIORITY_T = { 'hebdomadaire': 1, '/semaine': 1, 'mensuel': 3, '/mois': 3, '/1-3m': 4, 'trimestriel': 5, '/3m': 5, '/3 mois': 5, 'semestriel': 7, '/6m': 7, '/6 mois': 7, 'annuel': 10, '/an': 10, '/12m': 10 };
function getFreqScoreTest(f) {
    if (!f) return 99;
    let fl = f.toLowerCase();
    for (const [k, v] of Object.entries(_FREQ_PRIORITY_T)) { if (fl.includes(k)) return v; }
    return 8;
}

test('hebdomadaire = 1', () => assert.strictEqual(getFreqScoreTest('hebdomadaire'), 1));
test('mensuel = 3', () => assert.strictEqual(getFreqScoreTest('NFS (mensuel)'), 3));
test('trimestriel = 5', () => assert.strictEqual(getFreqScoreTest('/3 mois'), 5));
test('annuel = 10', () => assert.strictEqual(getFreqScoreTest('Annuel'), 10));
test('vide = 99', () => assert.strictEqual(getFreqScoreTest(''), 99));

// ============================================================================
// RESULTS
// ============================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`Tests: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
