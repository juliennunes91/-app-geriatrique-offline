// Génère 12 cas pivots variés et les passe dans le pipeline complet.
// Output : test_cases/expert_cases.json + screenshots via Playwright.
// Profils ciblés (mais cas eux-mêmes randomisés pour rester réalistes) :
//   - polypharmacie ≥ 12 méds + chute
//   - IRC sévère DFG < 30
//   - QTc allongé + 3+ méds QT
//   - INR sur-thérapeutique + AVK + AINS
//   - Triple whammy
//   - Démence + antipsychotique
//   - Hyperkaliémie + RAASi + spironolactone
//   - Syndrome sérotoninergique potentiel
//   - Anémie sévère + AVK
//   - DT2 fragile + sulfamide + cotrimoxazole
//   - Patient simple (1-2 méds) pour cas contrôle
//   - Patient palliatif (morphine + benzo + scopolamine)
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
function loadModule(f, n) {
    const c = fs.readFileSync(path.join(ROOT, '..', f), 'utf-8');
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
    const code = fs.readFileSync(path.join(ROOT, '..', f), 'utf-8');
    new Function(code + '\n' + names.map(n => 'global.' + n + '=' + n + ';').join('\n'))();
}
loadAsGlobal('drug_classes.js', ['matchesDrugClass']);
loadAsGlobal('geria_engine_v2.js', ['GeriaEngineV2']);
loadAsGlobal('composite_scores.js', ['calculateCompositeScores']);

// 12 cas pivots construits manuellement (médicament + biologie + comorbids cohérents)
const PIVOTS = [
    {
        id: 'P01', label: 'Polypharmacie + chute',
        age: 88, sexe: 'F', poids: 52, taille: 156,
        bio: { dfg: 42, k: 4.0, na: 135, hb: 11.0, inr: 1.1, qtc: 455, plaq: 215, alat: 22, tsh: 3.5, vit_d: 8, ca_corr: 2.15, albumine_sg: 28, mg: 0.7 },
        comorbs: ['PAT_005','PAT_032','PAT_025','PAT_009','PAT_039'],
        meds: ['Zopiclone','Oxazepam','Mirtazapine','Furosemide','Bisoprolol','Tramadol','Oxybutynine','Ramipril','Pantoprazole','Atorvastatine','Paracetamol','Alendronate']
    },
    {
        id: 'P02', label: 'IRC sévère DFG=12 + 6 méds néphro',
        age: 91, sexe: 'F', poids: 48, taille: 154,
        bio: { dfg: 12, creat: 320, k: 5.4, na: 132, hb: 9.2, hba1c: 7.8, inr: 1.0, qtc: 465, plaq: 168, uree: 22, phos: 1.85, ca_corr: 2.05, albumine_sg: 27 },
        comorbs: ['PAT_029','PAT_016b','PAT_005','PAT_037','PAT_025'],
        meds: ['Metformine','Spironolactone','Gabapentine','Furosemide','Bisoprolol','Atorvastatine']
    },
    {
        id: 'P03', label: 'QTc 510 + 3 méd QT-prolongateurs',
        age: 79, sexe: 'M', poids: 72,
        bio: { dfg: 65, k: 3.4, na: 138, hb: 12.8, inr: 1.0, qtc: 510, plaq: 240, mg: 0.55, albumine_sg: 36 },
        comorbs: ['PAT_006','PAT_032'],
        meds: ['Clarithromycine','Citalopram','Ondansetron','Domperidone','Bisoprolol']
    },
    {
        id: 'P04', label: 'INR 4.2 + Warfarine + Amiodarone',
        age: 76, sexe: 'F', poids: 65,
        bio: { dfg: 55, k: 4.2, hb: 9.5, inr: 4.2, qtc: 478, plaq: 180, alat: 35, tsh: 4.5, albumine_sg: 32 },
        comorbs: ['PAT_006','PAT_005','PAT_002','PAT_008','PAT_009'],
        meds: ['Warfarine','Amiodarone','Aspirine','Bisoprolol','Furosemide','Spironolactone']
    },
    {
        id: 'P05', label: 'Triple whammy + douleur',
        age: 78, sexe: 'M', poids: 82,
        bio: { dfg: 45, k: 4.6, na: 138, hb: 13.2, hba1c: 7.1, inr: 1.0, qtc: 432, alat: 28, albumine_sg: 35 },
        comorbs: ['PAT_005','PAT_016b','PAT_004','PAT_055'],
        meds: ['Ramipril','Hydrochlorothiazide','Ibuprofene','Metformine','Bisoprolol','Atorvastatine']
    },
    {
        id: 'P06', label: 'Démence DCL + quétiapine + ACB',
        age: 84, sexe: 'F', poids: 58,
        bio: { dfg: 38, k: 4.1, na: 133, hb: 11.2, inr: 1.0, qtc: 470, plaq: 220, tsh: 3.0, albumine_sg: 30 },
        comorbs: ['PAT_012','PAT_032','PAT_005','PAT_039'],
        meds: ['Quetiapine','Donepezil','Memantine','Mirtazapine','Oxybutynine','Furosemide','Pantoprazole']
    },
    {
        id: 'P07', label: 'Hyperkaliémie + RAASi + spironolactone + AINS',
        age: 80, sexe: 'F', poids: 70,
        bio: { dfg: 32, k: 5.8, na: 139, hb: 10.5, hba1c: 7.5, inr: 1.0, qtc: 470, alat: 30, albumine_sg: 33 },
        comorbs: ['PAT_002','PAT_016b','PAT_005','PAT_025'],
        meds: ['Ramipril','Spironolactone','Ibuprofene','Furosemide','Atorvastatine','Empagliflozin']
    },
    {
        id: 'P08', label: 'Syndrome sérotoninergique potentiel',
        age: 71, sexe: 'M', poids: 78,
        bio: { dfg: 72, k: 4.1, na: 137, hb: 14.0, inr: 1.0, qtc: 472, cpk: 350, temp: 38.2 },
        comorbs: ['PAT_032','PAT_054','PAT_044'],
        meds: ['Sertraline','Tramadol','Linezolide','Mirtazapine','Trazodone']
    },
    {
        id: 'P09', label: 'Anémie sévère + AOD + chute',
        age: 87, sexe: 'F', poids: 50,
        bio: { dfg: 36, k: 4.3, hb: 7.5, inr: 1.2, qtc: 460, plaq: 95, alat: 45, fer: 5, cst: 8, albumine_sg: 29 },
        comorbs: ['PAT_006','PAT_008','PAT_005','PAT_025','PAT_009','PAT_037'],
        meds: ['Apixaban','Clopidogrel','Aspirine','Pantoprazole','Bisoprolol','Furosemide']
    },
    {
        id: 'P10', label: 'DT2 fragile + sulfamide + cotrimoxazole',
        age: 89, sexe: 'M', poids: 62,
        bio: { dfg: 38, k: 4.4, na: 138, hb: 11.8, hba1c: 6.2, inr: 1.1, qtc: 440, gly: 0.6 },
        comorbs: ['PAT_016b','PAT_005','PAT_010','PAT_037'],
        meds: ['Glibenclamide','Cotrimoxazole','Ramipril','Atorvastatine','Donepezil']
    },
    {
        id: 'P11', label: 'Cas simple (3 méds) — contrôle',
        age: 72, sexe: 'M', poids: 76,
        bio: { dfg: 85, k: 4.0, na: 140, hb: 14.0, hba1c: 6.0, inr: 1.0, qtc: 410, albumine_sg: 40 },
        comorbs: ['PAT_005','PAT_019'],
        meds: ['Amlodipine','Atorvastatine','Aspirine']
    },
    {
        id: 'P12', label: 'Soins palliatifs polymed',
        age: 82, sexe: 'F', poids: 45,
        bio: { dfg: 40, k: 3.6, na: 134, hb: 9.0, inr: 1.1, qtc: 465, plaq: 130, albumine_sg: 24 },
        comorbs: ['PAT_020','PAT_030','PAT_037','PAT_054'],
        meds: ['Morphine','Haloperidol','Midazolam','Scopolamine','Paracetamol','Pantoprazole']
    }
];

// Pipeline complet
function runPipeline(cas) {
    const result = { id: cas.id, errors: [] };
    try {
        const prescriptionObjs = cas.meds
            .map(d => MASTER_DB.MEDICAMENTS.find(m => (m.dci || '').toLowerCase() === d.toLowerCase()))
            .filter(Boolean);
        const activeMeds = prescriptionObjs.map(m => ({ dci: m.dci, classe: m.classe || '', db_ref: m, label: m.dci }));
        result.scores = calculateCompositeScores(prescriptionObjs, cas.bio);
        // bioValues mapping
        const bv = {
            BIO_001: cas.bio.k, BIO_002: cas.bio.na, BIO_003: cas.bio.creat, BIO_004: cas.bio.dfg,
            BIO_005: cas.bio.ca_corr, BIO_006: cas.bio.mg, BIO_007: cas.bio.uree, BIO_009: cas.bio.hb,
            BIO_010: cas.bio.plaq, BIO_013: cas.bio.asat, BIO_014: cas.bio.alat, BIO_018: cas.bio.cpk,
            BIO_019: cas.bio.tsh, BIO_030: cas.bio.inr, BIO_031: cas.bio.qtc, BIO_036: cas.bio.albumine_sg,
            BIO_037: cas.bio.lithium, BIO_040: cas.bio.hba1c
        };
        const ctx = {
            activeMeds, activeComorbs: cas.comorbs,
            ageNum: cas.age, dfgNum: cas.bio.dfg, sexe: cas.sexe, poidsNum: cas.poids || 70,
            bioK: cas.bio.k, bioNa: cas.bio.na, bioInr: cas.bio.inr, bioQtc: cas.bio.qtc,
            bioHb: cas.bio.hb, bioValues: bv
        };
        result.engine = GeriaEngineV2.evaluer(ctx);
        // DDI
        const ddi = [];
        const idx = new Map(prescriptionObjs.map(m => [(m.dci || '').toLowerCase(), m]));
        prescriptionObjs.forEach(m => {
            (m.ddi_interact_v2 || []).forEach(r => {
                (r.dcis || []).forEach(t => {
                    if (typeof t !== 'string') return;
                    const tm = idx.get(t.toLowerCase()); if (!tm || tm === m) return;
                    ddi.push({ src: m.dci, target: t, classe: r.classe || '', severite: r.severite || 'warning', commentaire: r.commentaire || '' });
                });
            });
        });
        // Dédupliquer pour reflet UI
        const seen = new Set();
        result.ddi = ddi.filter(a => {
            const k = `${a.target.toLowerCase()}::${a.classe}::${a.severite}`;
            if (seen.has(k)) return false; seen.add(k); return true;
        });
    } catch (e) {
        result.errors.push({ message: e.message });
    }
    return result;
}

const reports = [];
for (const cas of PIVOTS) {
    const r = runPipeline(cas);
    reports.push({ cas, output: r });
}

fs.writeFileSync(path.join(ROOT, 'expert_cases.json'), JSON.stringify(PIVOTS, null, 2));
fs.writeFileSync(path.join(ROOT, 'expert_outputs.json'), JSON.stringify(reports, null, 2));

// Rapport texte lisible
let txt = '';
reports.forEach(({ cas, output }) => {
    txt += `\n${'='.repeat(78)}\n${cas.id} — ${cas.label}\n${'='.repeat(78)}\n`;
    txt += `Patient: ${cas.age} ans, ${cas.sexe}, ${cas.poids||'-'} kg\n`;
    txt += `Bio: DFG=${cas.bio.dfg} | K=${cas.bio.k||'-'} | Na=${cas.bio.na||'-'} | Hb=${cas.bio.hb||'-'} | INR=${cas.bio.inr||'-'} | QTc=${cas.bio.qtc||'-'}\n`;
    txt += `Comorbidités: ${cas.comorbs.join(', ')}\n`;
    txt += `Prescription (${cas.meds.length}): ${cas.meds.join(', ')}\n\n`;
    txt += `--- ENGINE EVITER (${(output.engine?.eviter||[]).length}) ---\n`;
    (output.engine?.eviter || []).forEach(a => {
        txt += `  [${a.severite}|score=${a.score}] ${a.id}: ${a.titre}\n      ${(a.message||'').slice(0,140)}\n`;
    });
    txt += `\n--- ENGINE INITIER (${(output.engine?.initier||[]).length}) ---\n`;
    (output.engine?.initier || []).forEach(a => {
        txt += `  [${a.severite||'-'}|score=${a.score}] ${a.id}: ${a.titre}\n`;
    });
    txt += `\n--- DDI (${output.ddi.length}) ---\n`;
    output.ddi.forEach(d => {
        txt += `  [${d.severite}] ${d.src.toUpperCase()} ↔ ${d.target.toUpperCase()} — ${d.classe}\n`;
    });
    txt += `\n--- SCORES COMPOSITES ---\n`;
    Object.entries(output.scores || {}).forEach(([k, v]) => {
        if (v.total > 0) txt += `  ${k.padEnd(8)}: ${v.total} (${v.level || '-'})\n`;
    });
});
fs.writeFileSync(path.join(ROOT, 'expert_report.txt'), txt);
console.log(`Generated ${reports.length} pivot cases.`);
console.log('Files: test_cases/expert_cases.json, expert_outputs.json, expert_report.txt');
