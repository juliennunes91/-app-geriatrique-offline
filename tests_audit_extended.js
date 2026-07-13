// tests_audit_extended.js — Audits permanents étendus (garde-fous auto-maintenus).
//
// Complète le linter d'invariants (tests_rules_invariants.js : INV-A→O) et les
// tests de conformité par 7 modalités d'audit adversariales, chacune conçue pour
// attraper une FAMILLE de défauts au niveau du corpus/moteur, pas au cas par cas :
//
//   1. Golden-master snapshot   — fige la sortie de N patients archétypaux ; tout
//                                 diff futur devient une revue (intention vs régression).
//   2. Sécurité dure jamais recontextualisée — aucune règle QT/Parkinson/dysphagie/
//                                 torsade dans l'allowlist de recontextualisation (Bloc 2).
//   3. med_absent totalement mort — exemption « sauf si déjà sous X » inopérante.
//   4. Atteignabilité des contextes — un contexte lu par une règle doit être émettable.
//   5. Fuzzer anti-null/NaN      — patients aléatoires : aucun « null/NaN/undefined » rendu.
//   6. Vecteurs de scores        — entrées → score attendu (fige les formules).
//   7. Vocabulaire des sources + échappement XSS + monotonies.
//
// Baselines/allowlists : chaque audit PASSE sur l'état courant (le défaut résiduel
// connu est baseliné) et n'échoue que sur une NOUVELLE régression.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadApp, analyzeCase } = require('./oracle_harness');

// Normalisation d'un titre d'alerte : retire icônes/compteurs, décode entités,
// compacte les espaces → signature stable et lisible.
function normTitre(t) {
    return String(t || '')
        .replace(/&#39;/g, "'").replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
        .replace(/^[\s\u{1F300}-\u{1FAFF}←-➿️🔴🟠🔵🟢⚠️🚨💡⚕️�]+/u, '')
        .replace(/\s*\(\d+\)\s*$/, '')
        .replace(/\s+/g, ' ').trim();
}

// ── Panel de patients archétypaux (golden-master + réutilisé par d'autres audits)
const PANEL = {
    'geriatrique_polymed_STOPP': { age: 84, sexe: 'F', dfg: 28, poids: 55, comorbs: ['PAT_006', 'PAT_016b', 'PAT_005', 'PAT_032', 'PAT_025'], flags: ['chkChutes'], meds: ['Digoxine', 'Glibenclamide', 'Diazepam', 'Amitriptyline', 'Ibuprofene', 'Acide acetylsalicylique'] },
    'schizo_chronique_haldol': { age: 72, sexe: 'M', dfg: 65, comorbs: ['PAT_004'], flags: ['chkSchizoChronique', 'chkChutes'], bio: { psyOnsetAge: '24' }, meds: ['Haloperidol', 'Tropatepine'] },
    'bipolaire_lithium': { age: 78, sexe: 'F', dfg: 48, flags: ['chkBipolaireI'], bio: { psyOnsetAge: '30' }, meds: ['Lithium', 'Hydrochlorothiazide', 'Ibuprofene'] },
    'clozapine_fumeur': { age: 68, sexe: 'M', dfg: 75, flags: ['chkSchizoChronique', 'chkTabac', 'chkConstipation'], bio: { psyOnsetAge: '25' }, meds: ['Clozapine'] },
    'depression_recurrente': { age: 81, sexe: 'F', dfg: 60, flags: ['chkDepressionRecurrente', 'chkChutes'], bio: { psyOnsetAge: '50', na: 132 }, meds: ['Sertraline'] },
    'vloslp_tardif': { age: 79, sexe: 'F', dfg: 70, comorbs: ['PAT_004'], flags: ['chkSchizoChronique', 'chkChutes'], bio: { psyOnsetAge: '74' }, meds: ['Risperidone'] },
    'IC_HFrEF': { age: 80, sexe: 'M', dfg: 45, comorbs: ['PAT_002'], meds: ['Bisoprolol', 'Furosemide'] },
    'FA_non_anticoagulee': { age: 83, sexe: 'F', dfg: 55, comorbs: ['PAT_006'], meds: ['Acide acetylsalicylique'] },
    'diabete_IRC': { age: 77, sexe: 'M', dfg: 32, comorbs: ['PAT_016b', 'PAT_029'], meds: ['Metformine', 'Gliclazide'] },
    'palliatif_fragile': { age: 88, sexe: 'F', dfg: 40, cfs: 8, flags: ['patientFragile', 'chkPalliatif'], comorbs: ['PAT_025'], meds: ['Atorvastatine', 'Alendronate'] },
    'hepatopathie': { age: 74, sexe: 'M', dfg: 70, flags: ['chkFoie'], meds: ['Paracetamol', 'Diazepam'] },
    'demence_SCPD': { age: 85, sexe: 'F', dfg: 60, comorbs: ['PAT_010'], flags: ['chkSpcAgitation'], meds: ['Risperidone', 'Oxybutynine'] },
    'parkinson_psychose': { age: 79, sexe: 'M', dfg: 62, comorbs: ['PAT_012'], meds: ['Haloperidol'] },
    'anticoag_antiagr': { age: 82, sexe: 'M', dfg: 50, comorbs: ['PAT_006', 'PAT_004'], meds: ['Apixaban', 'Clopidogrel'] },
    'QT_polypharmacie': { age: 80, sexe: 'F', dfg: 55, bio: { qtc: 480, patientK: 3.1 }, meds: ['Citalopram', 'Amiodarone', 'Haloperidol'] },
    'iono_severe': { age: 84, sexe: 'F', dfg: 38, bio: { patientNa: 124, patientK: 5.8, bioChlore: 93 }, meds: ['Furosemide', 'Ramipril'] },
    'vitamine_D_seule': { age: 80, sexe: 'F', dfg: 65, meds: ['Cholecalciferol'] },
    'antibio_cilastatine': { age: 86, sexe: 'M', dfg: 55, flags: ['patientFragile'], cfs: 7, meds: ['Imipenem + cilastatine'] },
    'usage_alcool': { age: 70, sexe: 'M', dfg: 70, flags: ['chkUsageAlcool'], bio: { psyOnsetAge: '35' }, meds: ['Diazepam'] },
    'LAI_depot': { age: 75, sexe: 'M', dfg: 68, flags: ['chkSchizoChronique', 'chkAntipsyLAI'], bio: { psyOnsetAge: '28' }, meds: ['Paliperidone'] },
    'sujet_jeune_psy': { age: 34, sexe: 'F', dfg: 110, meds: ['Valproate', 'Olanzapine'] },
    'osteoporose_omission': { age: 82, sexe: 'F', dfg: 60, comorbs: ['PAT_025'], meds: [] },
    'BPCO': { age: 76, sexe: 'M', dfg: 58, comorbs: ['PAT_003'], flags: ['chkTabac'], meds: ['Tiotropium'] },
    'anticholinergique_charge': { age: 83, sexe: 'F', dfg: 60, meds: ['Oxybutynine', 'Amitriptyline', 'Hydroxyzine'] },
    'normal_temoin': { age: 78, sexe: 'M', dfg: 80, meds: ['Amlodipine'] }
};
const TABS_SIG = ['alertes-eviter', 'alertes-initier', 'alertes-bio', 'alertes-interact', 'alertes-suivi', 'alertes-usage'];

function signaturePatient(c) {
    const r = analyzeCase(c);
    const sig = {};
    TABS_SIG.forEach(t => {
        sig[t] = [...new Set((r[t] || []).map(a => normTitre(a.titre)).filter(Boolean))].sort();
    });
    return sig;
}

function runExtendedAudits(test, assert) {
    console.log('\n🛡️  Audits permanents étendus');
    const { sandbox } = loadApp();

    // ═══ 1. GOLDEN-MASTER SNAPSHOT ═══════════════════════════════════════════
    const goldenPath = path.join(__dirname, 'tests_golden_master.json');
    const current = {};
    Object.entries(PANEL).forEach(([name, c]) => { current[name] = signaturePatient(c); });
    if (!fs.existsSync(goldenPath) || process.env.GOLDEN_UPDATE === '1') {
        fs.writeFileSync(goldenPath, JSON.stringify(current, null, 1));
        console.log('  ℹ️  Baseline golden-master ' + (process.env.GOLDEN_UPDATE === '1' ? 'RÉGÉNÉRÉE' : 'CRÉÉE') + ' (' + Object.keys(PANEL).length + ' patients)');
    } else {
        const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
        Object.keys(PANEL).forEach(name => {
            test('Golden-master — ' + name, () => {
                const diffs = [];
                const g = golden[name] || {}, cu = current[name] || {};
                TABS_SIG.forEach(t => {
                    const gs = new Set(g[t] || []), cs = new Set(cu[t] || []);
                    (cu[t] || []).forEach(x => { if (!gs.has(x)) diffs.push('+[' + t + '] ' + x); });
                    (g[t] || []).forEach(x => { if (!cs.has(x)) diffs.push('-[' + t + '] ' + x); });
                });
                assert.strictEqual(diffs.length, 0,
                    'sortie modifiée (si voulu : GOLDEN_UPDATE=1 node tests.js) :\n      ' + diffs.join('\n      '));
            });
        });
    }

    // ═══ 2. SÉCURITÉ DURE JAMAIS RECONTEXTUALISÉE ════════════════════════════
    // Aucune règle de sécurité « dure » (QT/torsade, Parkinson/DCL, dysphagie,
    // syndrome malin, dépression respiratoire) ne doit figurer dans l'allowlist
    // de recontextualisation psychiatrique (Bloc 2) — elle serait « ramollie ».
    test('SÉCURITÉ — aucune règle dure dans l\'allowlist de recontextualisation', () => {
        const info = vm.runInContext(`(function(){
            const allow = (typeof RECONTEXTE_PSY_RULES!=='undefined') ? Object.keys(RECONTEXTE_PSY_RULES) : [];
            const byId = {};
            [].concat(GERIA_RECOS_DB.EVITER, GERIA_RECOS_DB.INITIER, RECOS_SUPPLEMENT).forEach(r=>{ if(r.id) byId[r.id]=r; });
            // Sécurité DURE = la finalité 1re de la règle est une CI absolue non
            // recontextualisable : allongement QT/torsade, antagonisme Parkinson/DCL,
            // dysphagie (inhalation), syndrome malin. On matche le TITRE (finalité),
            // pas le message (qui cite des mécanismes incidents type bradycardie).
            const HARD=/\\bQT\\b|torsade|parkinson|corps de lewy|\\bDCL\\b|dysphagie|syndrome malin/i;
            const bad = allow.filter(id => { const r=byId[id]; if(!r) return false; return HARD.test(r.titre||''); });
            return JSON.stringify(bad);
        })()`, sandbox);
        const bad = JSON.parse(info);
        assert.strictEqual(bad.length, 0, 'règles de sécurité dure recontextualisées (INTERDIT) : ' + bad.join(', '));
    });

    // ═══ 3. med_absent TOTALEMENT MORT (exemption inopérante) ════════════════
    // Baseline : IN_E03 (ESA non présents en base — moot car non saisissables).
    const MED_ABSENT_DEAD_BASELINE = new Set(['IN_E03']);
    test('EXEMPTION — aucune NOUVELLE règle à med_absent totalement mort', () => {
        const dead = JSON.parse(vm.runInContext(`(function(){
            const norm=s=>(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
            const resolves=k=>MASTER_DB.MEDICAMENTS.some(m=>matchesDrugClass(norm(m.dci),norm(m.classe||''),norm(k)));
            const out=[]; const scan=arr=>(arr||[]).forEach(r=>{const c=r.condition||r;const a=c.med_absent||[];if(a.length&&!a.some(resolves))out.push(r.id);});
            scan(GERIA_RECOS_DB.EVITER);scan(GERIA_RECOS_DB.INITIER);scan(RECOS_SUPPLEMENT);
            if(typeof RECOS_SUPPLEMENT_INTEGRATION!=='undefined')scan(RECOS_SUPPLEMENT_INTEGRATION);
            return JSON.stringify(out);
        })()`, sandbox));
        const nouveaux = dead.filter(id => !MED_ABSENT_DEAD_BASELINE.has(id));
        assert.strictEqual(nouveaux.length, 0, 'exemptions med_absent devenues inopérantes : ' + nouveaux.join(', '));
    });

    // ═══ 4. ATTEIGNABILITÉ DES CONTEXTES (robuste à l'indirection) ═══════════
    // Tout contexte lu par une règle (contexte_clinique[_any|_absent]) doit
    // apparaître comme littéral quelque part dans app_analysis.js (émettable).
    test('ATTEIGNABILITÉ — tout contexte lu par une règle est émettable', () => {
        const analysisSrc = fs.readFileSync(path.join(__dirname, 'app_analysis.js'), 'utf8');
        const litt = new Set([...analysisSrc.matchAll(/["'`]([a-z][a-z0-9_]{2,})["'`]/g)].map(m => m[1]));
        const consommes = JSON.parse(vm.runInContext(`(function(){
            const s=new Set(); const scan=arr=>(arr||[]).forEach(r=>{const c=r.condition||r;
              ['contexte_clinique','contexte_clinique_any','contexte_clinique_absent'].forEach(f=>{const v=c[f];
                if(typeof v==='string')s.add(v); else if(Array.isArray(v))v.forEach(x=>s.add(x));});});
            scan(GERIA_RECOS_DB.EVITER);scan(GERIA_RECOS_DB.INITIER);scan(RECOS_SUPPLEMENT);
            if(typeof RECOS_SUPPLEMENT_INTEGRATION!=='undefined')scan(RECOS_SUPPLEMENT_INTEGRATION);
            return JSON.stringify([...s]);
        })()`, sandbox));
        const inatteignables = consommes.filter(c => !litt.has(c));
        assert.strictEqual(inatteignables.length, 0, 'contextes lus mais jamais émis (règles inatteignables) : ' + inatteignables.join(', '));
    });

    // ═══ 5. FUZZER ANTI-null/NaN/undefined ══════════════════════════════════
    // Générateur déterministe (LCG) : aucun littéral parasite ne doit être rendu.
    test('FUZZER — aucun « null/NaN/undefined » rendu sur 150 patients aléatoires', () => {
        let seed = 123456789;
        const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
        const pick = arr => arr[Math.floor(rand() * arr.length)];
        const MEDS = ['Warfarine', 'Apixaban', 'Digoxine', 'Amiodarone', 'Bisoprolol', 'Furosemide', 'Ramipril', 'Amlodipine', 'Metformine', 'Gliclazide', 'Insuline glargine', 'Atorvastatine', 'Omeprazole', 'Ibuprofene', 'Paracetamol', 'Tramadol', 'Diazepam', 'Zopiclone', 'Sertraline', 'Amitriptyline', 'Haloperidol', 'Risperidone', 'Clozapine', 'Lithium', 'Valproate', 'Oxybutynine', 'Levothyroxine', 'Alendronate', 'Cholecalciferol', 'Spironolactone', 'Imipenem + cilastatine'];
        const PATS = ['PAT_002', 'PAT_003', 'PAT_004', 'PAT_005', 'PAT_006', 'PAT_010', 'PAT_012', 'PAT_016b', 'PAT_025', 'PAT_029'];
        const FLAGS = ['chkChutes', 'patientFragile', 'chkTabac', 'chkAlcool', 'chkPalliatif', 'chkFoie', 'chkConstipation', 'chkSchizoChronique', 'chkBipolaireI', 'chkDepressionRecurrente'];
        const BIOS = ['patientK', 'patientNa', 'bioChlore', 'qtc', 'hb', 'inr', 'bioCa', 'bioTsh'];
        const TABS = ['alertes-eviter', 'alertes-initier', 'alertes-bio', 'alertes-interact', 'alertes-usage', 'alertes-suivi', 'alertes-synthese', 'alertes-scores'];
        const parasites = [];
        for (let i = 0; i < 150; i++) {
            const nMed = 1 + Math.floor(rand() * 6);
            const meds = []; for (let j = 0; j < nMed; j++) meds.push(pick(MEDS));
            const c = { age: 60 + Math.floor(rand() * 40), sexe: rand() < 0.5 ? 'M' : 'F', dfg: 10 + Math.floor(rand() * 90), meds, comorbs: [], flags: [], bio: {} };
            if (rand() < 0.7) c.comorbs.push(pick(PATS));
            if (rand() < 0.5) c.comorbs.push(pick(PATS));
            if (rand() < 0.6) c.flags.push(pick(FLAGS));
            if (rand() < 0.4) c.flags.push(pick(FLAGS));
            const b = pick(BIOS); c.bio[b] = 1 + Math.floor(rand() * 200) / 10;
            let r; try { r = analyzeCase(c); } catch (e) { parasites.push('CRASH#' + i + ': ' + e.message); continue; }
            TABS.forEach(t => {
                const html = (r._html && r._html[t]) || '';
                // « null/NaN/undefined » en tant que TEXTE affiché (hors attributs/classes)
                if (/>\s*(null|NaN|undefined)\s*</.test(html) || /:\s*(NaN|undefined)(?![a-zA-Z])/.test(html) || /\b(undefinedmg|nullml|NaN ng)/.test(html)) {
                    parasites.push('#' + i + ' [' + t + '] meds=' + meds.join('+'));
                }
            });
        }
        assert.strictEqual(parasites.length, 0, 'littéraux parasites rendus :\n      ' + parasites.slice(0, 15).join('\n      '));
    });

    // ═══ 6. VECTEURS DE SCORES (fige les formules) ═══════════════════════════
    const scoreOf = (r, re) => { const a = (r['alertes-scores'] || []).map(x => x.titre).join(' '); const m = a.match(re); return m ? parseInt(m[1], 10) : null; };
    const VECTEURS = [
        // [label, cas, regex score, attendu]
        ['CHA₂DS₂-VA F84 FA+HTA+DT2 = 4', { age: 84, sexe: 'F', dfg: 50, comorbs: ['PAT_006', 'PAT_005', 'PAT_016b'], meds: [] }, /CHA.{0,14}: (\d+)/, 4],
        ['CHA₂DS₂-VA H66 FA seule = 1', { age: 66, sexe: 'M', dfg: 80, comorbs: ['PAT_006'], meds: [] }, /CHA.{0,14}: (\d+)/, 1],
        ['CHA₂DS₂-VA F90 FA+AVC = 4 (âge2+AVC2, sans-sexe)', { age: 90, sexe: 'F', dfg: 60, comorbs: ['PAT_006', 'PAT_008'], meds: [] }, /CHA.{0,14}: (\d+)/, 4],
        ['CHA₂DS₂-VA F90 FA+AVC+HTA = 5', { age: 90, sexe: 'F', dfg: 60, comorbs: ['PAT_006', 'PAT_008', 'PAT_005'], meds: [] }, /CHA.{0,14}: (\d+)/, 5],
        ['HAS-BLED F84 HTA+IRC = 2', { age: 84, sexe: 'F', dfg: 40, comorbs: ['PAT_006', 'PAT_005'], meds: [] }, /HAS-BLED : (\d+)/, 2],
    ];
    VECTEURS.forEach(([label, c, re, exp]) => {
        test('Score vecteur — ' + label, () => {
            const got = scoreOf(analyzeCase(c), re);
            assert.strictEqual(got, exp, label + ' : obtenu ' + got);
        });
    });

    // ═══ 7a. VOCABULAIRE DES SOURCES ════════════════════════════════════════
    test('SOURCES — tout tag source appartient au vocabulaire connu', () => {
        // Vocabulaire des sources autorisées (guidelines, agences, sociétés savantes,
        // bases QT). Étendre ICI lors d'un ajout légitime — le test attrape alors les
        // typos (« STPOP », « BERS »…). Liste calée sur le corpus réel.
        const KNOWN = new Set(['STOPP3', 'STOPP', 'START', 'BEERS', 'FORTA', 'PRISCUS', 'EU7PIM', 'STOPPFRAIL', 'REMEDIES', 'PIM_CHECK',
            'Pharmacovigilance', 'ANSM', 'EMA', 'FDA', 'HAS', 'Maudsley', 'CANMAT', 'KDIGO', 'GOLD', 'SFGG', 'CredibleMeds',
            'ESC', 'ESC_HTN_2024', 'ESC_HF', 'ESC_AF', 'ESMO', 'ACR', 'IOF', 'ICI', 'ERC', 'ETA/ATA 2023', 'ILAE 2022',
            'SFGG_SF3PA_SFPC_2026']);
        const bad = JSON.parse(vm.runInContext(`(function(){
            const out=new Set(); const scan=arr=>(arr||[]).forEach(r=>(r.sources||[]).forEach(s=>out.add(s)));
            scan(GERIA_RECOS_DB.EVITER);scan(GERIA_RECOS_DB.INITIER);scan(RECOS_SUPPLEMENT);
            return JSON.stringify([...out]);
        })()`, sandbox)).filter(s => !KNOWN.has(s));
        assert.strictEqual(bad.length, 0, 'sources hors vocabulaire (typo ?) : ' + bad.join(', '));
    });

    // ═══ 7b. ÉCHAPPEMENT XSS (nom patient dérivé de l'utilisateur) ═══════════
    test('XSS — un nom patient malveillant n\'est pas rendu brut', () => {
        const payload = '<img src=x onerror=alert(1)>';
        // patientNom passé via le fallback bio (id = clé) du harness.
        const r = analyzeCase({ age: 80, sexe: 'F', dfg: 50, bio: { patientNom: payload }, comorbs: ['PAT_006'], meds: ['Warfarine'] });
        const allHtml = Object.values(r._html || {}).join(' ');
        assert.ok(!allHtml.includes(payload), 'nom patient rendu sans échappement (faille XSS)');
    });

    // ═══ 7c. MONOTONIE dose→risque (une dose plus haute ne retire pas un danger)
    test('MONOTONIE — digoxine forte dose ne perd pas l\'alerte toxicité', () => {
        const base = { age: 80, sexe: 'F', dfg: 25, comorbs: [], meds: ['Digoxine'] };
        const ev = c => (analyzeCase(c)['alertes-eviter'] || []).some(a => /Digoxine.*DFG|Digoxine ≥ 125/i.test(a.titre));
        assert.ok(ev(base), 'digoxine + DFG<30 doit signaler la toxicité (référence)');
    });
}

// ════════════════════════════════════════════════════════════════════════════
// AUDITS ÉTENDUS — 2e vague (monotonies, cohérence, unités, idempotence)
// ════════════════════════════════════════════════════════════════════════════
function runExtendedAudits2(test, assert) {
    console.log('\n🛡️  Audits permanents étendus (vague 2)');
    const { sandbox } = loadApp();
    const evTitres = c => (analyzeCase(c)['alertes-eviter'] || []).map(a => a.titre);
    const bioHtml = c => analyzeCase(c)._html['alertes-bio'] || '';

    // ── 8. MONOTONIE DE GRADATION : sévérité non-décroissante quand la bio s'aggrave
    const sevNatremie = html => (/alert-danger|alert-stopp/.test(html) && /natr/i.test(html)) ? 3 : (/alert-warning/.test(html) && /natr/i.test(html)) ? 2 : (/natr/i.test(html) ? 1 : 0);
    test('MONOTONIE-grad — hyponatrémie : sévérité non-décroissante (135→118)', () => {
        const seq = [135, 133, 130, 126, 120, 118].map(v => sevNatremie(bioHtml({ age: 80, sexe: 'F', dfg: 60, bio: { patientNa: v } })));
        for (let i = 1; i < seq.length; i++) assert.ok(seq[i] >= seq[i - 1], `rupture de monotonie Na à l'index ${i} : ${JSON.stringify(seq)}`);
    });
    const sevK = html => (/alert-danger|alert-stopp/.test(html) && /kali[ée]mie/i.test(html)) ? 3 : (/alert-warning/.test(html) && /kali/i.test(html)) ? 2 : (/kali/i.test(html) ? 1 : 0);
    test('MONOTONIE-grad — hyperkaliémie : sévérité non-décroissante (5.0→7.0)', () => {
        const seq = [5.0, 5.5, 6.0, 6.5, 7.0].map(v => sevK(bioHtml({ age: 80, sexe: 'F', dfg: 40, bio: { patientK: v } })));
        for (let i = 1; i < seq.length; i++) assert.ok(seq[i] >= seq[i - 1], `rupture monotonie K : ${JSON.stringify(seq)}`);
    });

    // ── 9. MONOTONIE DE DÉPRESCRIPTION : retirer un médicament n'AJOUTE pas d'alerte
    //    « éviter » le concernant (une déprescription ne doit jamais aggraver son propre profil).
    const depTest = (label, medsAvant, medRetire, motif) => test('MONOTONIE-dep — ' + label, () => {
        const base = { age: 82, sexe: 'F', dfg: 45, comorbs: ['PAT_006'] };
        const avant = new Set(evTitres({ ...base, meds: medsAvant }));
        const apres = new Set(evTitres({ ...base, meds: medsAvant.filter(m => m !== medRetire) }));
        const apparues = [...apres].filter(t => !avant.has(t) && motif.test(t));
        assert.strictEqual(apparues.length, 0, `retirer ${medRetire} fait apparaître : ${apparues.join(' | ')}`);
    });
    depTest('retrait AINS', ['Warfarine', 'Ibuprofene', 'Digoxine'], 'Ibuprofene', /AINS|ibupro/i);
    depTest('retrait BZD', ['Diazepam', 'Sertraline'], 'Diazepam', /benzodiaz|diazepam/i);

    // ── 10. AUTO-CONTRADICTION DE CONDITION (règle jamais déclenchable)
    test('COHÉRENCE — aucune règle avec comorbs ∩ comorbs_absent ou ctx ∩ ctx_absent', () => {
        const bad = JSON.parse(vm.runInContext(`(function(){
            const inter=(a,b)=>(a||[]).filter(x=>(b||[]).includes(x));
            const out=[]; const scan=arr=>(arr||[]).forEach(r=>{const c=r.condition||r;
              if(inter(c.comorbs,c.comorbs_absent).length)out.push(r.id+':comorbs');
              const ctx=[].concat(c.contexte_clinique?[c.contexte_clinique]:[],c.contexte_clinique_any||[]);
              if(inter(ctx,c.contexte_clinique_absent).length)out.push(r.id+':ctx');});
            scan(GERIA_RECOS_DB.EVITER);scan(GERIA_RECOS_DB.INITIER);scan(RECOS_SUPPLEMENT);
            if(typeof RECOS_SUPPLEMENT_INTEGRATION!=='undefined')scan(RECOS_SUPPLEMENT_INTEGRATION);
            return JSON.stringify(out);
        })()`, sandbox));
        assert.strictEqual(bad.length, 0, 'règles auto-contradictoires : ' + bad.join(', '));
    });

    // ── 11. SATURATION / SIGNAL-BRUIT : plafond d'alertes « danger » par patient réaliste.
    //    Baseline courante = 11 (patient polymédiqué STOPP délibéré). Seuil d'alarme 18 :
    //    au-delà, suspicion d'explosion de règles (fatigue d'alerte).
    test('SATURATION — ≤ 18 alertes « danger » sur les patients du panel', () => {
        let max = 0, worst = '';
        Object.entries(PANEL).forEach(([n, c]) => {
            const nd = ((analyzeCase(c)._html['alertes-eviter'] || '').match(/alert-danger|alert-stopp/g) || []).length;
            if (nd > max) { max = nd; worst = n; }
        });
        assert.ok(max <= 18, `explosion d'alertes danger (${max}) sur ${worst} — vérifier une régression de spécificité`);
    });

    // ── 12. ROUND-TRIP DES UNITÉS BIO : une valeur et son équivalent dans l'autre
    //    unité doivent produire la MÊME interprétation clinique.
    const hasVitD = c => /Vitamine D|vitamine d/i.test(bioHtml(c));
    test('UNITÉS — vitamine D : 8 ng/mL ≡ 20 nmol/L (même alerte carence)', () => {
        const a = hasVitD({ age: 80, sexe: 'F', dfg: 60, bio: { bioVitD: 8, bioVitDUnit: 'ng/mL' } });
        const b = hasVitD({ age: 80, sexe: 'F', dfg: 60, bio: { bioVitD: 20, bioVitDUnit: 'nmol/L' } });
        assert.strictEqual(a, b, `incohérence de conversion vitD (ng/mL=${a} vs nmol/L=${b})`);
    });
    const hasB12 = c => /B12|cobalamin/i.test(bioHtml(c));
    test('UNITÉS — B12 : 100 pmol/L ≡ 135 ng/L (même interprétation)', () => {
        const a = hasB12({ age: 80, sexe: 'F', dfg: 60, bio: { bioB12: 100, bioB12Unit: 'pmol/L' } });
        const b = hasB12({ age: 80, sexe: 'F', dfg: 60, bio: { bioB12: 135, bioB12Unit: 'ng/L' } });
        assert.strictEqual(a, b, `incohérence de conversion B12 (pmol/L=${a} vs ng/L=${b})`);
    });

    // ── 11bis. DÉCOUVERTE — conseil drug-spécifique non protégé dans les conduites.
    //    Audit GÉNÉRIQUE (≠ liste codée en dur) : scanne TOUTES les CONDUITE_IMMEDIATE
    //    des syndromes ; pour chaque verbe d'action (arrêt/adapter/suspendre…) suivi
    //    d'une molécule NOMMÉE (DCI réel, hors termes de classe), vérifie que la clause
    //    est couverte par le filtre de pertinence (CONDUITE_CLAUSES_CONDITIONNELLES lu
    //    dans app_analysis.js). Toute conduite conseillant d'arrêter un médicament
    //    spécifique — affichable sans ce médicament — est signalée. Aurait trouvé
    //    seule les cas héparine/amiodarone/AVK/metformine (auto-test intégré).
    test('DÉCOUVERTE — aucun conseil drug-spécifique non protégé dans les conduites', () => {
        const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
        const src = fs.readFileSync(path.join(__dirname, 'app_analysis.js'), 'utf8');
        const bloc = (src.match(/CONDUITE_CLAUSES_CONDITIONNELLES\s*=\s*\[([\s\S]*?)\];/) || [, ''])[1];
        const gated = [...bloc.matchAll(/clause:\s*\/(.+?)\/([a-z]*)/g)].map(m => new RegExp(m[1], m[2]));
        const dciSet = new Set(JSON.parse(vm.runInContext('JSON.stringify(MASTER_DB.MEDICAMENTS.map(m=>m.dci))', sandbox)).map(norm).filter(d => d.length > 4));
        const syndromes = JSON.parse(vm.runInContext('JSON.stringify(Object.entries(MASTER_DB.SYNDROMES).map(([id,s])=>[id,s.NOM_SYNDROME,s.CONDUITE_IMMEDIATE||""]))', sandbox));
        const CLASSES = /\b(AINS|IEC|ARA2|sartan|diur[ée]tique|b[êe]tabloquant|anticoagulant|antiagr[ée]gant|corticoïde|statine|sulfamide|insuline|benzodiaz|antipsychotique|neuroleptique|opio[iï]de|antid[ée]presseur|s[ée]rotoninergique|\bIPP\b|digitalique|thiazidique|[ée]pargneur|glinide|antidiab[ée]tique|kayexalate|patiromer|glucose|vitamine|n[ée]phrotoxique|suspect)/i;
        const SPECIFIQUES = ['heparine', 'avk', 'amiodarone'];
        const ACTION = /(arr[êe]t|adapter|suspendre|d[ée]prescrire|r[ée][ée]valu|r[ée]duire|diminuer|stopper)/i;
        const flags = [];
        syndromes.forEach(([id, nom, conduite]) => {
            conduite.split(/[.,](?![^(]*\))/).forEach(seg => {
                const mA = seg.match(ACTION); if (!mA || CLASSES.test(seg)) return;
                const after = norm(seg.slice(mA.index));
                const spec = after.split(/[^a-z0-9]+/).filter(t => t.length > 4).find(t => dciSet.has(t) || SPECIFIQUES.includes(t));
                if (spec && !gated.some(re => re.test(seg))) flags.push(`${id} « ${seg.trim().slice(0, 50)} » [${spec}]`);
            });
        });
        assert.strictEqual(flags.length, 0, 'conseil « arrêter X » affichable sans X prescrit (ajouter une clause à CONDUITE_CLAUSES_CONDITIONNELLES) :\n      ' + flags.join('\n      '));
    });

    // ── 12bis. COHÉRENCE GUIDELINE : une pathologie ne doit pas PROPOSER (INITIER)
    //    un médicament qu'elle liste par ailleurs dans ses INTERDITS (PATHO_MED_INTERDITS).
    //    Baseline : PAT_032 propose clomipramine « 4e ligne réfractaire » tout en la
    //    déclarant à éviter — tension clinique connue et assumée (TCA de dernier
    //    recours). Toute NOUVELLE contradiction propose∩interdit fait échouer.
    const PROPOSE_INTERDIT_BASELINE = new Set(['PAT_032::clomipramine']);
    test('COHÉRENCE-guideline — aucune NOUVELLE pathologie propose ∩ interdit', () => {
        const viol = JSON.parse(vm.runInContext(`(function(){
            if(typeof PATHOLOGY_RULES_DB==='undefined'||typeof PATHO_MED_INTERDITS==='undefined') return '[]';
            const norm=s=>(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
            const out=[];
            Object.keys(PATHOLOGY_RULES_DB).forEach(pat=>{
              const interdits=(PATHO_MED_INTERDITS[pat]||[]).map(i=>norm(i.terme)).filter(x=>x.length>4);
              if(!interdits.length)return;
              ((PATHOLOGY_RULES_DB[pat].TRAITEMENTS&&PATHOLOGY_RULES_DB[pat].TRAITEMENTS.INITIER)||[]).forEach(t=>{
                const prop=norm(t.classe||t.molecule||''); if(prop.length<=4)return;
                interdits.forEach(i=>{ if(prop.includes(i)||i.includes(prop)) out.push(pat+'::'+i); });
              });
            });
            return JSON.stringify([...new Set(out)]);
        })()`, sandbox));
        const nouveaux = viol.filter(v => !PROPOSE_INTERDIT_BASELINE.has(v));
        assert.strictEqual(nouveaux.length, 0, 'pathologie proposant un médicament interdit : ' + nouveaux.join(', '));
    });

    // ── 12ter. CONFORMITÉ SEUILS — LITTÉRATURE (ancrage externe des seuils numériques)
    //    Chaque seuil est cité et testé À LA BORNE (juste au-dessus déclenche, juste
    //    en dessous ne déclenche pas). Fige les valeurs contre toute dérive et
    //    documente leur provenance. Toute borne cassée = écart avec la littérature.
    const evSet = c => new Set((analyzeCase(c)['alertes-eviter'] || []).map(a => a.titre));
    const doseCase = (dci, dose, extra) => ({ age: 80, sexe: 'F', dfg: 70, meds: [dci], precisions: { [dci]: { dose } }, ...(extra || {}) });
    // [libellé+source, cas déclencheur, cas non-déclencheur, motif attendu]
    const SEUILS = [
        ['Digoxine > 125 µg/j + IR (Beers 2023 / STOPP-B12)',
            { age: 80, sexe: 'F', dfg: 25, meds: ['Digoxine'], precisions: { Digoxine: { dose: 250 } } },
            { age: 80, sexe: 'F', dfg: 25, meds: ['Digoxine'], precisions: { Digoxine: { dose: 100 } } }, /Digoxine/i],
        ['Citalopram > 20 mg/j sujet âgé, QT (FDA 2011 / ANSM)',
            doseCase('Citalopram', 25), doseCase('Citalopram', 15), /citalopram|QT|torsade|allonge/i],
        ['Escitalopram > 10 mg/j sujet âgé, QT (FDA / ANSM)',
            doseCase('Escitalopram', 15), doseCase('Escitalopram', 8), /escitalopram|QT|torsade|allonge/i],
        ['Aspirine > 100 mg/j au long cours (STOPP v2 C1)',
            doseCase('Acide acetylsalicylique', 300), doseCase('Acide acetylsalicylique', 75), /aspirine|prévention|acide/i],
        ['AINS + DFG < 50 (STOPP)',
            { age: 80, sexe: 'F', dfg: 45, meds: ['Ibuprofene'] }, { age: 80, sexe: 'F', dfg: 55, meds: ['Ibuprofene'] }, /AINS \+ DFG/i],
        ['Nitrofurantoïne + DFG < 45 (STOPP v3 E8 / MHRA 2015 / BNF)',
            { age: 80, sexe: 'F', dfg: 40, meds: ['Nitrofurantoine'] }, { age: 80, sexe: 'F', dfg: 55, meds: ['Nitrofurantoine'] }, /Nitrofuranto/i],
        // Seuils rénaux STOPP/START v3 (section E) — vérifiés contre PMC10447584 (audit littérature 2026).
        ['Metformine + DFG < 30 (STOPP v3 E6 / Beers 2023)',
            { age: 80, sexe: 'F', dfg: 25, meds: ['Metformine'] }, { age: 80, sexe: 'F', dfg: 40, meds: ['Metformine'] }, /Metformine.*DFG|acidose/i],
        ['Dabigatran + DFG < 30 (STOPP v3 E2)',
            { age: 80, sexe: 'F', dfg: 25, meds: ['Dabigatran'] }, { age: 80, sexe: 'F', dfg: 40, meds: ['Dabigatran'] }, /Dabigatran/i],
        ['Anti-Xa (rivaroxaban/apixaban/edoxaban) + DFG < 15 (STOPP v3 E3)',
            { age: 80, sexe: 'F', dfg: 12, meds: ['Apixaban'] }, { age: 80, sexe: 'F', dfg: 25, meds: ['Apixaban'] }, /Anti-Xa|apixaban|rivaroxaban/i],
        ['Colchicine + DFG < 10 (STOPP v3 E5)',
            { age: 80, sexe: 'F', dfg: 8, meds: ['Colchicine'] }, { age: 80, sexe: 'F', dfg: 20, meds: ['Colchicine'] }, /Colchicine/i],
    ];
    // Test du DELTA : franchir le seuil doit AJOUTER une alerte spécifique (matchant
    // le motif) absente sous le seuil — robuste aux alertes de fond partagées (une
    // digoxine/un ISRS restent flaggés pour d'autres raisons quelle que soit la dose).
    SEUILS.forEach(([label, casPos, casNeg, motif]) => {
        test('Seuil littérature — ' + label, () => {
            const pos = evSet(casPos), neg = evSet(casNeg);
            const ajoutees = [...pos].filter(t => !neg.has(t) && motif.test(t));
            assert.ok(ajoutees.length > 0, `franchir le seuil doit ajouter une alerte spécifique (motif ${motif}). Au-dessus: ${[...pos].filter(t=>motif.test(t)).join(' | ')||'aucune'}`);
        });
    });

    // Borne « statine haute intensité » (AHA/ACC 2018 : atorvastatine 40-80 mg,
    // rosuvastatine 20-40 mg). SUP_PIMC_12 doit s'ARMER À la borne (atorva 40,
    // rosuva 20) chez > 75 ans, et rester désarmée en dessous (atorva 20, rosuva 10).
    // Régression du bug d'attribution : « > 40 / > 20 » excluait à tort 40 et 20 mg.
    const statineHauteDose = c => {
        const h = analyzeCase(c)._html || {};
        return Object.values(h).some(html => /Statine haute (dose|intensité)/i.test(html || ''));
    };
    const statCase = (dci, dose) => ({ age: 80, sexe: 'F', dfg: 70, meds: [dci], precisions: { [dci]: { dose } } });
    [
        ['Atorvastatine 40 mg = haute intensité → armée', statCase('Atorvastatine', 40), true],
        ['Atorvastatine 20 mg = modérée → désarmée', statCase('Atorvastatine', 20), false],
        ['Rosuvastatine 20 mg = haute intensité → armée', statCase('Rosuvastatine', 20), true],
        ['Rosuvastatine 10 mg = modérée → désarmée', statCase('Rosuvastatine', 10), false],
    ].forEach(([label, cas, attendu]) => {
        test('Borne statine haute intensité — ' + label, () => {
            assert.strictEqual(statineHauteDose(cas), attendu,
                `SUP_PIMC_12 devrait ${attendu ? 'se déclencher' : 'rester silencieuse'} pour ce cas`);
        });
    });

    // ── 12b. GARDE ANTI-RÉFÉRENCE-FANTÔME : fige les corrections d'attribution issues
    //    de l'audit littérature (fiches pathologie). Un guideline cité doit exister ;
    //    ces motifs précis ont été identifiés comme faux et corrigés → interdits de retour.
    const pathoSrc = fs.readFileSync(path.join(__dirname, 'geria_pathology_rules_v3.js'), 'utf8');
    const REFS_FANTOMES = [
        ['ESC 2024 Dyslipidaemia', /ESC\s*2024\s*Dyslipidaemia/i, 'la guideline ESC/EAS dyslipidémies est 2019, pas 2024'],
        ['ACP 2024 (insomnie)', /ACP\s*2024/i, 'la guideline ACP insomnie chronique est 2016, pas 2024'],
        ['Midodrine HTO cotée classe I', /Midodrine[^\n]*§5\.4,\s*IB\b/i, 'ESC 2018 : midodrine dans l\'HTO = IIaB, jamais classe I'],
    ];
    REFS_FANTOMES.forEach(([label, re, why]) => {
        test('Référence fantôme absente — ' + label, () => {
            assert.ok(!re.test(pathoSrc), `référence erronée réapparue (${why})`);
        });
    });

    // ── 12c. NON-CONTAMINATION DE CLASSE dans les interactions (DDI).
    //    Beaucoup d'interactions ANSM sont spécifiques d'une famille (« ANTIVITAMINES K »
    //    → ↑INR avec paracétamol/miconazole) et ne concernent PAS la famille sœur (AOD).
    //    Fusionner AVK et AOD faisait matcher un AOD (apixaban) sur le terme « ANTIVITAMINES K »,
    //    produisant un message trompeur mentionnant les AVK/INR sur un patient qui n'en prend pas.
    //    Cette garde vérifie END-TO-END qu'aucune famille ne « fuit » sur la famille sœur.
    const interactHtml = c => (analyzeCase(c)._html['alertes-interact'] || '');
    const RE_AVK = /antivitamine\s*K|\bAVK\b|\bINR\b/i;
    const RE_AOD = /\bAOD\b|anticoagulant oral direct|apixaban|rivaroxaban|dabigatran|edoxaban/i;
    const AVK_PARTNERS = ['Paracetamol', 'Miconazole']; // partenaires à interaction AVK-spécifique
    // (a) un AOD seul + partenaire AVK-spécifique ne doit JAMAIS afficher un message AVK/INR
    ['Apixaban', 'Rivaroxaban', 'Dabigatran', 'Edoxaban'].forEach(aod => {
        AVK_PARTNERS.forEach(partner => {
            test(`Non-contamination AVK→AOD — ${aod} + ${partner} n'évoque pas les AVK/INR`, () => {
                const h = interactHtml({ age: 80, sexe: 'F', dfg: 70, meds: [aod, partner] });
                assert.ok(!RE_AVK.test(h),
                    `${aod} + ${partner} affiche à tort un message AVK/INR : ${(h.match(RE_AVK) || [''])[0]}`);
            });
        });
    });
    // (b) contrôle positif : un AVK + paracétamol DOIT bien déclencher l'interaction (sinon
    //    la garde (a) passerait trivialement en cas de matching cassé).
    test('Non-contamination — contrôle positif : Warfarine + Paracetamol évoque bien l\'INR', () => {
        const h = interactHtml({ age: 80, sexe: 'F', dfg: 70, meds: ['Warfarine', 'Paracetamol'] });
        assert.ok(RE_AVK.test(h), 'Warfarine + Paracetamol devrait afficher l\'interaction AVK/INR (matching AVK cassé ?)');
    });
    // NB : on ne teste PAS « warfarine ne cite jamais AOD » car les cartes ANSM
    // combinées (« AMIODARONE ↔ AVK / AOD ») nomment légitimement les deux familles
    // dans leur libellé explicatif — c'est du texte, pas une fuite de matching.
    // La vraie classe de bug (une interaction AVK-spécifique qui SE DÉCLENCHE sur un
    // AOD absent d'AVK) est verrouillée par les gardes (a) ci-dessus.

    // ── 13. IDEMPOTENCE DES PRÉCISIONS : préciser un médicament ne doit changer que
    //    SES propres alertes, jamais celles d'un co-prescrit sans rapport.
    test('IDEMPOTENCE — préciser la durée d\'un cortico n\'altère pas les alertes AVK', () => {
        const base = { age: 80, sexe: 'F', dfg: 55, comorbs: ['PAT_006'], meds: ['Prednisone', 'Warfarine'] };
        const avkAlerts = c => new Set((analyzeCase(c)['alertes-eviter'] || []).map(a => a.titre).filter(t => /AVK|warfarine|INR|anticoag/i.test(t)));
        const sans = avkAlerts(base);
        const avec = avkAlerts({ ...base, precisions: { Prednisone: { duree: 'courte' } } });
        const diff = [...sans].filter(t => !avec.has(t)).concat([...avec].filter(t => !sans.has(t)));
        assert.strictEqual(diff.length, 0, 'la précision cortico a modifié des alertes AVK : ' + diff.join(' | '));
    });

    // ── 14. PERTINENCE DES CONSEILS DRUG-SPÉCIFIQUES CONDITIONNELS
    //    Un conseil de conduite spécifique d'un médicament (« arrêt héparine si TIH »)
    //    ne doit apparaître QUE si ce médicament est prescrit. Verrouille le
    //    mécanisme _conduitePertinente (bug thrombopénie/héparine).
    //    Data-driven sur les 4 différentiels : chacun ne doit apparaître QUE si le
    //    médicament est prescrit (verrouille toute la classe, pas juste l'héparine).
    [
        { label: 'héparine/TIH (thrombopénie)', bio: { plaq: 120 }, med: 'Enoxaparine', motif: /h[ée]parine|\bTIH\b/i },
        { label: 'amiodarone (TSH basse)', bio: { bioTsh: 0.01 }, med: 'Amiodarone', motif: /amiodarone/i },
        { label: 'dose AVK (INR haut)', bio: { bioInr: 6 }, med: 'Warfarine', motif: /adapter dose avk|dose AVK/i },
        { label: 'metformine (lactate haut)', bio: { dfg: 25, bioLact: 5 }, med: 'Metformine', motif: /arr[êe]t metformine/i },
    ].forEach(({ label, bio, med, motif }) => {
        const base = { age: 80, sexe: 'F', dfg: bio.dfg || 60, bio };
        test('PERTINENCE — ' + label + ' : absent SANS le médicament', () =>
            assert.ok(!motif.test(bioHtml(base)), 'conseil drug-spécifique affiché sans le médicament'));
        test('PERTINENCE — ' + label + ' : présent AVEC le médicament', () =>
            assert.ok(motif.test(bioHtml({ ...base, meds: [med] })), 'conseil drug-spécifique perdu alors que le médicament est prescrit'));
    });
}

module.exports = { runExtendedAudits, runExtendedAudits2, PANEL, signaturePatient };
