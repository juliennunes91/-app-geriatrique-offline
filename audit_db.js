// audit_db.js — Audit structurel de la base GeriaAssist
// Phase 1 : invariants déterministes (cohérence interne, sans validation EBM clinique)
// Usage : node audit_db.js                  → rapport stdout
//         node audit_db.js --md > REPORT.md → rapport markdown
//         node audit_db.js --json           → sortie JSON brute
// Aucun side effect : lecture seule des .js, pas d'écriture, pas de réseau.

'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const argv = process.argv.slice(2);
const FORMAT = argv.includes('--json') ? 'json' : 'md';

// ─── 1. CHARGEMENT DES FICHIERS ─────────────────────────────────────────────
const ROOT = __dirname;
const FILES = [
    'geria_database.js',
    'drug_classes.js',
    'geria_pathology_rules_v3.js',
    'geria_recos_final.js',
    'ddi_general.js',
    'ddi_merged_V2.js'
];
const sandbox = { console, Map, Set, Array, Object, JSON, RegExp, Math, Date,
    Number, String, Boolean, Symbol, Error, TypeError, Promise, globalThis: null };
vm.createContext(sandbox);
sandbox.globalThis = sandbox;

// Transform top-level `const|let NAME = ` → `var NAME = ` so that vm.runInContext
// exposes those declarations as properties of the sandbox object (var is captured,
// const/let stay block-scoped).
function transformTopLevelConsts(src) {
    return src.replace(/^(const|let)\s+([A-Z_][A-Za-z0-9_]*)\s*=/gm, 'var $2 =');
}

for (const f of FILES) {
    const full = path.join(ROOT, f);
    if (!fs.existsSync(full)) {
        console.error(`Fichier introuvable: ${f}`);
        process.exit(1);
    }
    let src = fs.readFileSync(full, 'utf8');
    src = transformTopLevelConsts(src);
    try {
        vm.runInContext(src, sandbox, { filename: f });
    } catch (e) {
        console.error(`Erreur de chargement ${f}: ${e.message}`);
        process.exit(1);
    }
}

const {
    MASTER_DB,
    PATHOLOGY_RULES_DB,
    PATHO_SYNDROME_MAP,
    PATHO_MED_INTERDITS,
    DRUG_CLASSES,
    GERIA_RECOS_DB,
    RECOS_SUPPLEMENT,
    DDI_GENERAL_DB,
    DDI_MERGED_DB
} = sandbox;

// ─── 2. INDEX & HELPERS ─────────────────────────────────────────────────────
const allBioIds = new Set(Object.keys(MASTER_DB.BIOLOGIE));
const allPathIds = new Set(Object.keys(MASTER_DB.PATHOLOGIES));
const allSyndIds = new Set(Object.keys(MASTER_DB.SYNDROMES));

const sanitize = s => (s || '').toString().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

// Garde les espaces — pour matching par mot avec \b
const sanitizeWS = s => (s || '').toString().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();

const allDcis = new Set();
const dciToClass = new Map();
MASTER_DB.MEDICAMENTS.forEach(m => {
    const k = sanitize(m.dci);
    if (k) { allDcis.add(k); dciToClass.set(k, m.classe || ''); }
});

const findings = [];
const counts = { error: 0, warning: 0, info: 0 };
function add(category, severity, code, msg, ctx) {
    findings.push({ category, severity, code, msg, ctx });
    counts[severity]++;
}

// Matching par mot entier (\b) — évite les faux positifs type "phARMacocinetique" ou "demiVIE Courte"→"iec"
const cHas = (cl, ...kws) => {
    const c = sanitizeWS(cl);
    return kws.some(kw => {
        const k = sanitizeWS(kw);
        if (!k) return false;
        // Si plusieurs mots → recherche en sous-séquence avec frontières
        const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp('\\b' + escaped + '\\b').test(c);
    });
};

const splitIds = s => (s || '').toString().split(/[,\s]+/).filter(Boolean);

// ─── 3. AUDIT MEDICAMENTS ───────────────────────────────────────────────────
const dciSeen = new Map();
const REQUIRED_MED_FIELDS = ['dci', 'classe', 'poso_hab'];

MASTER_DB.MEDICAMENTS.forEach((m, i) => {
    const ctx = `MED[${i}] ${m.dci || '<sans DCI>'}`;

    // 3.1 Champs obligatoires
    REQUIRED_MED_FIELDS.forEach(f => {
        if (!m[f]) add('MED', 'error', 'STR-MED-001', `Champ obligatoire manquant: ${f}`, ctx);
    });

    // 3.2 Doublons DCI
    const k = sanitize(m.dci);
    if (k) {
        if (dciSeen.has(k)) add('MED', 'error', 'STR-MED-002',
            `DCI dupliquée (premier index = ${dciSeen.get(k)})`, ctx);
        else dciSeen.set(k, i);
    }

    // 3.3 bio_cible : références valides
    if (Array.isArray(m.bio_cible)) {
        m.bio_cible.forEach(b => {
            if (!allBioIds.has(b)) add('MED', 'error', 'STR-MED-003',
                `bio_cible référence ${b} inexistant`, ctx);
        });
        // Doublons internes
        const seen = new Set();
        m.bio_cible.forEach(b => {
            if (seen.has(b)) add('MED', 'warning', 'STR-MED-004',
                `bio_cible contient ${b} en doublon`, ctx);
            seen.add(b);
        });
    }

    // 3.4 INVARIANTS PAR CLASSE PHARMACOLOGIQUE
    const cl = m.classe || '';
    const bc = Array.isArray(m.bio_cible) ? m.bio_cible : [];

    // HBPM / héparine de bas poids moléculaire
    if (cHas(cl, 'HBPM', 'heparine de bas poids')) {
        if (bc.includes('BIO_030')) add('MED', 'error', 'STR-CLASS-HBPM-INR',
            `HBPM avec BIO_030 (INR) en bio_cible — INR ne s'applique PAS aux HBPM (= AVK uniquement)`, ctx);
        ['BIO_009', 'BIO_010', 'BIO_003'].forEach(b => {
            if (!bc.includes(b)) add('MED', 'warning', 'STR-CLASS-HBPM-MISSING',
                `HBPM sans ${b} (${MASTER_DB.BIOLOGIE[b]?.NOM_STANDARD}) — surveillance attendue (Hb/plaquettes/créat)`, ctx);
        });
    }

    // AVK / antivitamine K
    if (cHas(cl, 'AVK', 'antivitamine')) {
        if (!bc.includes('BIO_030')) add('MED', 'error', 'STR-CLASS-AVK-INR',
            `AVK sans BIO_030 (INR) — INR obligatoire`, ctx);
    }

    // AOD / anticoagulants oraux directs
    if (cHas(cl, 'AOD', 'anti-Xa', 'anti Xa', 'antiXa', 'anti-IIa', 'inhibiteur direct')) {
        if (bc.includes('BIO_030')) add('MED', 'warning', 'STR-CLASS-AOD-INR',
            `AOD avec BIO_030 (INR) — INR non utile pour AOD (inhibiteurs directs Xa/IIa)`, ctx);
    }

    // Statine
    if (cHas(cl, 'statine')) {
        if (!bc.includes('BIO_018')) add('MED', 'warning', 'STR-CLASS-STAT-CPK',
            `Statine sans BIO_018 (CPK) — surveillance CPK recommandée si symptômes musculaires`, ctx);
        if (!bc.includes('BIO_013') && !bc.includes('BIO_014')) add('MED', 'warning', 'STR-CLASS-STAT-HEP',
            `Statine sans transaminases (BIO_013/014) en bio_cible`, ctx);
    }

    // IEC / ARA2
    if (cHas(cl, 'IEC', 'ARA2', 'ARA II', 'sartan', 'inhibiteur conversion')) {
        if (!bc.includes('BIO_001')) add('MED', 'warning', 'STR-CLASS-IEC-K',
            `IEC/ARA2 sans BIO_001 (K+) — risque hyperkaliémie, surveillance obligatoire`, ctx);
        if (!bc.includes('BIO_003')) add('MED', 'warning', 'STR-CLASS-IEC-CR',
            `IEC/ARA2 sans BIO_003 (créat) — surveillance fonction rénale obligatoire`, ctx);
    }

    // ARNI (sacubitril/valsartan)
    if (cHas(cl, 'ARNI') || /sacubitril/i.test(m.dci || '')) {
        ['BIO_001', 'BIO_003'].forEach(b => {
            if (!bc.includes(b)) add('MED', 'warning', 'STR-CLASS-ARNI',
                `ARNI sans ${b} (${MASTER_DB.BIOLOGIE[b]?.NOM_STANDARD})`, ctx);
        });
    }

    // ARM (spironolactone, éplérénone, finérénone)
    if (cHas(cl, 'ARM', 'antagoniste minéralocorticoide', 'antialdosterone')
        || /spironolactone|eplerenone|finerenone/i.test(m.dci || '')) {
        if (!bc.includes('BIO_001')) add('MED', 'warning', 'STR-CLASS-ARM-K',
            `ARM sans BIO_001 (K+) — risque hyperkaliémie sévère, surveillance impérative`, ctx);
    }

    // Diurétique de l'anse / thiazidique
    if (cHas(cl, 'diuretique', 'thiazidique', 'furosemide', 'bumetanide')) {
        ['BIO_001', 'BIO_002', 'BIO_003'].forEach(b => {
            if (!bc.includes(b)) add('MED', 'warning', 'STR-CLASS-DIUR',
                `Diurétique sans ${b} (${MASTER_DB.BIOLOGIE[b]?.NOM_STANDARD})`, ctx);
        });
    }

    // Lithium
    if (/lithium/i.test(m.dci || '') || cHas(cl, 'lithium')) {
        if (!bc.includes('BIO_029')) add('MED', 'error', 'STR-CLASS-LI',
            `Lithium sans BIO_029 (lithiémie) — monitorage strict obligatoire (marge thérapeutique étroite)`, ctx);
    }

    // Digoxine
    if (/digoxine|digitoxine/i.test(m.dci || '')) {
        if (!bc.includes('BIO_044')) add('MED', 'warning', 'STR-CLASS-DIG',
            `Digoxine sans BIO_044 (digoxinémie) en bio_cible`, ctx);
    }

    // Amiodarone
    if (/amiodarone/i.test(m.dci || '')) {
        ['BIO_019', 'BIO_013', 'BIO_014', 'BIO_031'].forEach(b => {
            if (!bc.includes(b)) add('MED', 'info', 'STR-CLASS-AMIOD',
                `Amiodarone sans ${b} (${MASTER_DB.BIOLOGIE[b]?.NOM_STANDARD}) — TSH/transaminases/QTc recommandés`, ctx);
        });
    }

    // Aminoside / vancomycine
    if (cHas(cl, 'aminoside') || /vancomycine|amikacine|gentamicine|tobramycine/i.test(m.dci || '')) {
        if (!bc.includes('BIO_003')) add('MED', 'warning', 'STR-CLASS-AMINO',
            `Aminoside/vanco sans BIO_003 (créat) — néphrotoxique`, ctx);
    }

    // Anti-arythmique classe I/III (QT)
    if (cHas(cl, 'anti-arythmique', 'antiarythmique')
        || /sotalol|flecainide|propafenone|disopyramide|dronedarone/i.test(m.dci || '')) {
        if (!bc.includes('BIO_031')) add('MED', 'info', 'STR-CLASS-QT',
            `Anti-arythmique sans BIO_031 (QTc) en bio_cible`, ctx);
    }

    // Antipsychotique typique (QT)
    if (cHas(cl, 'antipsychotique', 'neuroleptique')
        && !cHas(cl, 'pas de QT')) {
        if (m.qt_risque && /eleve|élevé|fort|haut/i.test(m.qt_risque) && !bc.includes('BIO_031')) {
            add('MED', 'info', 'STR-CLASS-APS-QT',
                `Antipsychotique à risque QT élevé sans BIO_031`, ctx);
        }
    }

    // Carbamazépine, valproate (hépato + NFS)
    if (/carbamazepine|valproate|valproique|phenytoine/i.test(m.dci || '')) {
        if (!bc.includes('BIO_013') && !bc.includes('BIO_014')) {
            add('MED', 'warning', 'STR-CLASS-AED-HEP',
                `Antiépileptique sans transaminases en bio_cible`, ctx);
        }
    }

    // Methotrexate
    if (/methotrexate|metothrexate/i.test(m.dci || '')) {
        ['BIO_009', 'BIO_010', 'BIO_011', 'BIO_013', 'BIO_014', 'BIO_003'].forEach(b => {
            if (!bc.includes(b)) add('MED', 'warning', 'STR-CLASS-MTX',
                `Méthotrexate sans ${b} (${MASTER_DB.BIOLOGIE[b]?.NOM_STANDARD})`, ctx);
        });
    }

    // Clozapine
    if (/clozapine/i.test(m.dci || '')) {
        if (!bc.includes('BIO_011') && !bc.includes('BIO_012')) add('MED', 'error', 'STR-CLASS-CLOZ',
            `Clozapine sans BIO_011 (leucocytes) ni BIO_012 (PNN) — agranulocytose, NFS hebdomadaire obligatoire`, ctx);
    }

    // 3.5 COHÉRENCE TEXTUELLE notes/suivi ↔ bio_cible
    const txt = (m.notes_cliniques || '') + ' || ' + (m.suivi_initial || '') + ' || ' + (m.suivi_periodique || '') + ' || ' + (m.alerte_clinique || '');
    if (/\bINR\b/i.test(txt) && !bc.includes('BIO_030')
        && !cHas(cl, 'HBPM', 'heparine de bas poids')) {
        add('MED', 'warning', 'STR-MED-COH-INR',
            `Texte mentionne "INR" mais BIO_030 absent de bio_cible`, ctx);
    }
    if (/\bCPK\b|rhabdomyolyse|myalgi/i.test(txt) && !bc.includes('BIO_018')) {
        add('MED', 'info', 'STR-MED-COH-CPK',
            `Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent`, ctx);
    }
    if (/lithi[eé]mie/i.test(txt) && !bc.includes('BIO_029')) {
        add('MED', 'warning', 'STR-MED-COH-LI',
            `Texte mentionne lithiémie mais BIO_029 absent`, ctx);
    }
    if (/QTc?/i.test(txt) && !bc.includes('BIO_031')) {
        add('MED', 'info', 'STR-MED-COH-QT',
            `Texte mentionne QT/QTc mais BIO_031 absent`, ctx);
    }
    if (/digoxin[eé]mie/i.test(txt) && !bc.includes('BIO_044')) {
        add('MED', 'warning', 'STR-MED-COH-DIG',
            `Texte mentionne digoxinémie mais BIO_044 absent`, ctx);
    }

    // 3.6 Format poso_ren
    if (m.poso_ren && !/DFG|cl[a-z]*\s*cr|clairance|ajustement|dose|pas\s*d['e]/i.test(m.poso_ren)) {
        add('MED', 'info', 'STR-MED-POSREN',
            `poso_ren ne mentionne ni DFG/Cl créat/ajustement: "${m.poso_ren.slice(0, 80)}"`, ctx);
    }

    // 3.7 ACB score 0/1/2/3
    if (m.acb !== undefined && m.acb !== '' && ![0, 1, 2, 3].includes(Number(m.acb))) {
        add('MED', 'warning', 'STR-MED-ACB',
            `ACB invalide: ${m.acb} (attendu 0/1/2/3)`, ctx);
    }

    // 3.8 ddi_interact_v2 cohérence
    if (Array.isArray(m.ddi_interact_v2)) {
        m.ddi_interact_v2.forEach((di, j) => {
            if (!di.classe && !di.dcis) add('MED', 'warning', 'STR-MED-DDI-1',
                `ddi_interact_v2[${j}] sans classe ni dcis`, ctx);
            if (di.severite && !['danger', 'warning', 'info', 'critique', 'majeur'].includes(di.severite)) {
                add('MED', 'info', 'STR-MED-DDI-2',
                    `ddi_interact_v2[${j}] severite="${di.severite}" non standard`, ctx);
            }
        });
    }
});

// ─── 4. AUDIT BIOLOGIE ──────────────────────────────────────────────────────
const loincSeen = new Map();
Object.entries(MASTER_DB.BIOLOGIE).forEach(([id, b]) => {
    const ctx = `BIO ${id}`;
    if (id !== b.ID_BIO) add('BIO', 'error', 'STR-BIO-001',
        `Clé "${id}" ≠ ID_BIO "${b.ID_BIO}"`, ctx);
    if (!b.NOM_STANDARD) add('BIO', 'error', 'STR-BIO-002', `NOM_STANDARD manquant`, ctx);
    if (!b.UNITE) add('BIO', 'warning', 'STR-BIO-003', `UNITE manquant`, ctx);
    if (b.LOINC) {
        if (loincSeen.has(b.LOINC)) add('BIO', 'warning', 'STR-BIO-004',
            `LOINC "${b.LOINC}" dupliqué (déjà dans ${loincSeen.get(b.LOINC)})`, ctx);
        else loincSeen.set(b.LOINC, id);
    }
});

// ─── 5. AUDIT PATHOLOGIES (MASTER_DB.PATHOLOGIES) ───────────────────────────
Object.entries(MASTER_DB.PATHOLOGIES).forEach(([id, p]) => {
    const ctx = `PAT ${id} (${p.NOM_STANDARD || '?'})`;
    if (id !== p.ID_PATHO) add('PATH', 'error', 'STR-PATH-001',
        `Clé "${id}" ≠ ID_PATHO "${p.ID_PATHO}"`, ctx);
    if (!p.CIM_10) add('PATH', 'warning', 'STR-PATH-002', `CIM_10 manquant`, ctx);
    if (!p.CATEGORIE) add('PATH', 'warning', 'STR-PATH-003', `CATEGORIE manquant`, ctx);
    splitIds(p.BIO_SURVEILLANCE).forEach(b => {
        if (!allBioIds.has(b)) add('PATH', 'error', 'STR-PATH-004',
            `BIO_SURVEILLANCE référence ${b} inexistant`, ctx);
    });
    splitIds(p.SYND_RISQUE).forEach(s => {
        if (!allSyndIds.has(s)) add('PATH', 'error', 'STR-PATH-005',
            `SYND_RISQUE référence ${s} inexistant`, ctx);
    });
    if (!PATHOLOGY_RULES_DB[id]) {
        add('PATH', 'warning', 'STR-PATH-006',
            `Pas d'entrée correspondante dans PATHOLOGY_RULES_DB`, ctx);
    } else {
        const r = PATHOLOGY_RULES_DB[id];
        if (r.NOM && p.NOM_STANDARD && sanitize(r.NOM) !== sanitize(p.NOM_STANDARD)) {
            add('PATH', 'info', 'STR-PATH-007',
                `Diverge NOM: rules="${r.NOM}" / master="${p.NOM_STANDARD}"`, ctx);
        }
    }
});

// ─── 6. PATHOLOGY_RULES_DB ─────────────────────────────────────────────────
Object.keys(PATHOLOGY_RULES_DB).forEach(id => {
    if (!allPathIds.has(id)) {
        add('PATH', 'warning', 'STR-PATH-008',
            `PATHOLOGY_RULES_DB.${id} sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)`,
            `RULES ${id}`);
    }
    const r = PATHOLOGY_RULES_DB[id];
    if (r.BIOLOGIE) {
        if (Array.isArray(r.BIOLOGIE.SURVEILLANCE_CIBLE)) {
            r.BIOLOGIE.SURVEILLANCE_CIBLE.forEach(item => {
                if (typeof item === 'string' && !allBioIds.has(item)) {
                    add('PATH', 'error', 'STR-RULES-BIO',
                        `BIOLOGIE.SURVEILLANCE_CIBLE référence ${item} inexistant`, `RULES ${id}`);
                }
            });
        }
        if (Array.isArray(r.BIOLOGIE.REGLES)) {
            r.BIOLOGIE.REGLES.forEach((reg, i) => {
                if (reg.bio && !allBioIds.has(reg.bio)) add('PATH', 'error', 'STR-RULES-BIO-2',
                    `BIOLOGIE.REGLES[${i}].bio=${reg.bio} inexistant`, `RULES ${id}`);
                if (reg.syndrome && !allSyndIds.has(reg.syndrome)) add('PATH', 'warning', 'STR-RULES-SYND',
                    `BIOLOGIE.REGLES[${i}].syndrome=${reg.syndrome} inexistant`, `RULES ${id}`);
            });
        }
    }
});

// ─── 7. PATHO_SYNDROME_MAP ─────────────────────────────────────────────────
Object.entries(PATHO_SYNDROME_MAP).forEach(([id, syndromes]) => {
    if (!allPathIds.has(id) && !PATHOLOGY_RULES_DB[id]) {
        add('PATH', 'warning', 'STR-PMAP-1',
            `PATHO_SYNDROME_MAP.${id} référence un PAT inexistant`, `MAP ${id}`);
    }
    syndromes.forEach(s => {
        if (!allSyndIds.has(s)) add('PATH', 'error', 'STR-PMAP-2',
            `${id} → ${s} (syndrome inexistant)`, `MAP ${id}`);
    });
});
allPathIds.forEach(id => {
    if (!PATHO_SYNDROME_MAP[id]) {
        add('PATH', 'info', 'STR-PMAP-3',
            `Pas d'entrée PATHO_SYNDROME_MAP pour ${id}`, `PAT ${id}`);
    }
});

// ─── 8. SYNDROMES ──────────────────────────────────────────────────────────
Object.entries(MASTER_DB.SYNDROMES).forEach(([id, s]) => {
    const ctx = `SYND ${id} (${s.NOM_SYNDROME || '?'})`;
    if (id !== s.ID_SYNDROME) add('SYND', 'error', 'STR-SYND-001',
        `Clé "${id}" ≠ ID_SYNDROME "${s.ID_SYNDROME}"`, ctx);
    if (!s.NOM_SYNDROME) add('SYND', 'error', 'STR-SYND-002', `NOM_SYNDROME manquant`, ctx);
    if (!s.GRAVITE) add('SYND', 'warning', 'STR-SYND-003', `GRAVITE manquant`, ctx);
    splitIds(s.BIO_CIBLE).forEach(b => {
        if (!allBioIds.has(b)) add('SYND', 'error', 'STR-SYND-004',
            `BIO_CIBLE référence ${b} inexistant`, ctx);
    });
    splitIds(s.ID_PATHO_ASSOC).forEach(p => {
        if (!allPathIds.has(p)) add('SYND', 'warning', 'STR-SYND-005',
            `ID_PATHO_ASSOC ${p} inexistant`, ctx);
    });
    // BIO_SECONDAIRE peut contenir des annotations entre parenthèses → on extrait juste les IDs
    const sec = (s.BIO_SECONDAIRE || '').match(/BIO_\d+/g) || [];
    sec.forEach(b => {
        if (!allBioIds.has(b)) add('SYND', 'warning', 'STR-SYND-006',
            `BIO_SECONDAIRE référence ${b} inexistant`, ctx);
    });
});

// ─── 9. PATHO_MED_INTERDITS (post-merge V2/V3/V4) ──────────────────────────
Object.entries(PATHO_MED_INTERDITS).forEach(([id, rules]) => {
    if (!allPathIds.has(id) && !PATHOLOGY_RULES_DB[id]) {
        add('PATH', 'warning', 'STR-PMI-1',
            `PATHO_MED_INTERDITS.${id} ne correspond à aucun PAT`, `PMI ${id}`);
    }
    rules.forEach((r, i) => {
        if (!r.terme) add('PATH', 'error', 'STR-PMI-2',
            `Règle #${i} sans 'terme'`, `PMI ${id}`);
        if (!r.gravite) add('PATH', 'warning', 'STR-PMI-3',
            `Règle "${r.terme || '#' + i}" sans 'gravite'`, `PMI ${id}`);
        if (!r.raison) add('PATH', 'warning', 'STR-PMI-4',
            `Règle "${r.terme || '#' + i}" sans 'raison'`, `PMI ${id}`);
    });
});

// ─── 10. RECOS (STOPP/START/Beers/SUPPLEMENT) ──────────────────────────────
const recosSets = [];
if (GERIA_RECOS_DB) {
    ['STOPP', 'START', 'BEERS', 'STOPP_FRAIL', 'PRISCUS', 'FORTA'].forEach(k => {
        if (Array.isArray(GERIA_RECOS_DB[k])) recosSets.push({ name: k, items: GERIA_RECOS_DB[k] });
    });
}
if (Array.isArray(RECOS_SUPPLEMENT)) recosSets.push({ name: 'SUPPLEMENT', items: RECOS_SUPPLEMENT });

const recoIdSeen = new Map();
recosSets.forEach(set => {
    set.items.forEach(r => {
        const ctx = `RECO ${set.name}/${r.id || '<sans id>'}`;
        if (!r.id) add('RECO', 'error', 'STR-RECO-001', `id manquant`, ctx);
        else if (recoIdSeen.has(r.id)) add('RECO', 'warning', 'STR-RECO-002',
            `id ${r.id} dupliqué (déjà dans ${recoIdSeen.get(r.id)})`, ctx);
        else recoIdSeen.set(r.id, set.name);
        if (!r.titre && !r.message) add('RECO', 'warning', 'STR-RECO-003',
            `ni titre ni message`, ctx);
        const patho = r.condition?.patho;
        if (patho) {
            (Array.isArray(patho) ? patho : [patho]).forEach(p => {
                if (!allPathIds.has(p)) add('RECO', 'warning', 'STR-RECO-004',
                    `condition.patho=${p} inexistant`, ctx);
            });
        }
    });
});

// ─── 11. DDI ───────────────────────────────────────────────────────────────
if (Array.isArray(DDI_GENERAL_DB)) {
    DDI_GENERAL_DB.forEach((d, i) => {
        const ctx = `DDI_GENERAL[${i}] ${d.d1}↔${d.d2}`;
        if (!d.d1 || !d.d2) add('DDI', 'error', 'STR-DDI-001',
            `d1 ou d2 manquant`, ctx);
        if (!d.couleur) add('DDI', 'info', 'STR-DDI-002',
            `couleur (sévérité) manquante`, ctx);
    });
}

// ─── 12. SORTIE ────────────────────────────────────────────────────────────
if (FORMAT === 'json') {
    process.stdout.write(JSON.stringify({ counts, findings }, null, 2));
    process.exit(0);
}

const NL = '\n';
const sevLabel = s => s === 'error' ? '[ERR]' : s === 'warning' ? '[WRN]' : '[INF]';
let out = '';
out += `# Audit structurel — base GeriaAssist${NL}`;
out += `Date : ${new Date().toISOString()}${NL}${NL}`;
out += `## Synthèse${NL}`;
out += `- Médicaments scannés : **${MASTER_DB.MEDICAMENTS.length}**${NL}`;
out += `- Biologies : **${allBioIds.size}**${NL}`;
out += `- Pathologies : **${allPathIds.size}** (master) / **${Object.keys(PATHOLOGY_RULES_DB).length}** (rules)${NL}`;
out += `- Syndromes : **${allSyndIds.size}**${NL}`;
out += `- Erreurs : **${counts.error}** | Avertissements : **${counts.warning}** | Infos : **${counts.info}**${NL}`;
out += `- Total findings : **${findings.length}**${NL}${NL}`;

const byCat = {};
findings.forEach(f => { (byCat[f.category] ||= []).push(f); });

// Tri par sévérité (error → warning → info) puis par code
const sevRank = { error: 0, warning: 1, info: 2 };
for (const cat of Object.keys(byCat)) {
    byCat[cat].sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || a.code.localeCompare(b.code));
}

for (const [cat, items] of Object.entries(byCat)) {
    out += `${NL}## ${cat} (${items.length})${NL}${NL}`;
    items.forEach((f, i) => {
        out += `${i + 1}. ${sevLabel(f.severity)} **[${f.code}]** ${f.ctx}${NL}`;
        out += `   - ${f.msg}${NL}`;
    });
}

process.stdout.write(out);
