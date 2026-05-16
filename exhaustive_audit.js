// ============================================================================
// Audit exhaustif — TOUTES les paires de la base (complément au bootstrap)
// ============================================================================
const fs = require('fs');
const path = require('path');

const dbContent = fs.readFileSync(path.join(__dirname, 'geria_database.js'), 'utf-8');
const dbWrapped = dbContent + '\nmodule.exports = MASTER_DB;';
const tmp = path.join(__dirname, '.tmp_db.js');
fs.writeFileSync(tmp, dbWrapped);
const MASTER_DB = require(tmp);
fs.unlinkSync(tmp);

const MEDS = MASTER_DB.MEDICAMENTS;
const SEV_RANK = { 'info': 0, 'warning': 1, 'danger': 2 };

// Construire l'index: pour chaque (src_dci, target_dci), lister toutes les règles
const directionalIndex = new Map();  // "src->target" → [rules]
MEDS.forEach(med => {
    (med.ddi_interact_v2 || []).forEach(rule => {
        (rule.dcis || []).filter(x => typeof x === 'string').forEach(target => {
            const key = `${med.dci.toLowerCase()}->${target.toLowerCase()}`;
            if (!directionalIndex.has(key)) directionalIndex.set(key, []);
            directionalIndex.get(key).push({ src: med.dci, target, classe: rule.classe, severite: rule.severite, commentaire: rule.commentaire });
        });
    });
});

console.log(`Index construit : ${directionalIndex.size} relations directionnelles`);

// Aberrations à détecter
const aberrations = {
    severity_disparity_2: [],  // gap = 2 (info vs danger)
    severity_disparity_1: [],  // gap = 1 (info vs warning ou warning vs danger)
    severity_contradiction: [], // même classe, sévérité ≠ (rare mais existe)
    asymetry_pair: [],          // A→B existe, B→A absent (pas forcément un bug mais notable)
    self_reference: [],         // A→A
    target_not_in_db: [],       // target non présent dans MEDICAMENTS
    target_invalid: []          // target = objet/array au lieu de string
};

// 1. Self-references
MEDS.forEach(med => {
    (med.ddi_interact_v2 || []).forEach(rule => {
        (rule.dcis || []).forEach(t => {
            if (typeof t !== 'string') {
                aberrations.target_invalid.push({ src: med.dci, classe: rule.classe, target_type: typeof t });
                return;
            }
            if (t.toLowerCase() === med.dci.toLowerCase()) {
                aberrations.self_reference.push({ dci: med.dci, classe: rule.classe });
            }
        });
    });
});

// 2. Targets inconnus
const dbDcis = new Set(MEDS.map(m => (m.dci || '').toLowerCase()));
MEDS.forEach(med => {
    (med.ddi_interact_v2 || []).forEach(rule => {
        (rule.dcis || []).filter(x => typeof x === 'string').forEach(target => {
            const tlc = target.toLowerCase();
            if (!dbDcis.has(tlc)) {
                aberrations.target_not_in_db.push({ src: med.dci, target, classe: rule.classe });
            }
        });
    });
});

// 3. Disparités de sévérité (A↔B)
const checked = new Set();
directionalIndex.forEach((rulesAB, keyAB) => {
    const [a, b] = keyAB.split('->');
    if (a === b) return;
    const pairId = [a, b].sort().join('<->');
    if (checked.has(pairId)) return;
    checked.add(pairId);

    const reverse = `${b}->${a}`;
    const rulesBA = directionalIndex.get(reverse);
    if (!rulesBA) {
        // Asymétrie unidirectionnelle
        aberrations.asymetry_pair.push({ pair: pairId, direction: `${a}→${b} only`, n_rules: rulesAB.length });
        return;
    }

    // Comparer sévérités max
    const maxA = Math.max(...rulesAB.map(r => SEV_RANK[r.severite] ?? 0));
    const maxB = Math.max(...rulesBA.map(r => SEV_RANK[r.severite] ?? 0));
    const gap = Math.abs(maxA - maxB);

    if (gap === 2) {
        aberrations.severity_disparity_2.push({
            pair: pairId,
            aToB: rulesAB.map(r => ({ classe: r.classe, severite: r.severite })),
            bToA: rulesBA.map(r => ({ classe: r.classe, severite: r.severite })),
            gap
        });
    } else if (gap === 1) {
        aberrations.severity_disparity_1.push({
            pair: pairId,
            aToB_max: maxA,
            bToA_max: maxB,
            aToB: rulesAB.map(r => ({ classe: r.classe, severite: r.severite })),
            bToA: rulesBA.map(r => ({ classe: r.classe, severite: r.severite })),
            gap
        });
    }
});

// ─── Synthèse ────────────────────────────────────────────────────────────────
const counts = Object.fromEntries(Object.entries(aberrations).map(([k, v]) => [k, v.length]));
console.log('\n=== Aberrations exhaustives ===');
console.log(JSON.stringify(counts, null, 2));

fs.writeFileSync('audit_reports/G_exhaustive_findings.json', JSON.stringify({
    date: new Date().toISOString(),
    counts,
    aberrations
}, null, 2));
console.log('\nDétail écrit dans audit_reports/G_exhaustive_findings.json');
