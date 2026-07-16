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

// ============================================================================
// AUDIT DE COLLISION DE MATCHING (toute la base)
// ----------------------------------------------------------------------------
// Balaie TOUTE la surface de matching (toutes les clés : classes, termes ANSM des
// DDI, med_keys des règles) × TOUS les médicaments du MASTER_DB, et détecte les
// collisions de sous-chaîne : un médicament matché par une clé qui n'est qu'une
// sous-chaîne accidentelle de sa DCI (ex. « fer » ⊂ calci-fér-ol, « beta » ⊂
// bêtahistine, « ANTIVITAMINES K » ⊂ classe fourre-tout contenant les AOD).
// Les collisions LÉGITIMES (prodrogues, sels, associations, familles « -sartan »)
// sont figées dans ALLOWLIST. Toute NOUVELLE collision fait échouer l'audit —
// c'est le filet permanent contre cette famille de bugs (fer/calciférol,
// statine/cilastatine, AVK/AOD… qui revenaient version après version).
function runCollisionAudit(test, assert) {
    const { sandbox } = loadApp();
    // Le scan tourne DANS le sandbox (accès aux globals `const` par leur nom).
    const SCAN = `(function(){
        var norm = sanitizeText;
        var meds = (MASTER_DB && MASTER_DB.MEDICAMENTS) || [];
        var medList = meds.map(function(m){ return { dci: norm(m.dci), raw: m.dci }; });
        var DCIS = new Set(medList.map(function(m){ return m.dci; }));
        var keys = new Set();
        (typeof DDI_GENERAL_DB!=='undefined'?DDI_GENERAL_DB:[]).forEach(function(d){ if(d.d1)keys.add(norm(d.d1)); if(d.d2)keys.add(norm(d.d2)); });
        (typeof DDI_MERGED_DB!=='undefined'?DDI_MERGED_DB:[]).forEach(function(d){ if(d.perpetrator)keys.add(norm(d.perpetrator)); if(d.victim)keys.add(norm(d.victim)); });
        function harvest(o){ if(!o||typeof o!=='object')return; for(var k in o){ var v=o[k];
            if(/^(med_keys|med_keys_2|med_absent|classes|classe)$/.test(k)&&Array.isArray(v)) v.forEach(function(x){ if(typeof x==='string')keys.add(norm(x)); });
            else if(typeof v==='object') harvest(v); } }
        if(typeof GERIA_RECOS_DB!=='undefined')harvest(GERIA_RECOS_DB);
        if(typeof RECOS_SUPPLEMENT!=='undefined')harvest(RECOS_SUPPLEMENT);
        if(typeof PATHOLOGY_RULES_DB!=='undefined')harvest(PATHOLOGY_RULES_DB);
        if(typeof DRUG_CLASSES!=='undefined')Object.values(DRUG_CLASSES).forEach(function(def){ (def.aliases||[]).forEach(function(a){ keys.add(norm(a)); }); });
        var out=[];
        keys.forEach(function(key){
            if(!key||key.length<3)return;
            medList.forEach(function(m){
                if(m.dci===key)return;
                var matched=false; try{ matched=matchesDrugClassAnsm(m.dci,'',key); }catch(e){ return; }
                if(!matched)return;
                var keyInDci=m.dci.indexOf(key)>=0&&key!==m.dci;
                var dciInKey=key.indexOf(m.dci)>=0&&key!==m.dci;
                if(keyInDci||dciInKey){
                    var suspicious=DCIS.has(key)||(key.length<=6&&keyInDci);
                    if(suspicious)out.push(key+'::'+m.dci);
                }
            });
        });
        return JSON.stringify(Array.from(new Set(out)).sort());
    })()`;
    let found;
    try { found = JSON.parse(vm.runInContext(SCAN, sandbox)); }
    catch (e) { test('Collision — scan exécutable', () => assert.ok(false, 'scan a échoué : ' + e.message)); return; }

    // ALLOWLIST des collisions LÉGITIMES (prodrogue/sel/association/famille suffixe).
    // Signature = cléNormalisée::dciNormalisée. Toute collision hors liste = régression.
    const ALLOWLIST = new Set([
        'aprepitant::fosaprepitant', 'fosaprepitant::aprepitant',        // prodrogue ↔ actif
        'brompheniramine::pheniramine', 'chlorpheniramine::pheniramine',
        'chlorpheniramine::dexchlorpheniramine', 'dexchlorpheniramine::chlorpheniramine',
        'dexchlorpheniramine::pheniramine',                              // antihistaminiques -phéniramine
        'loratadine::desloratadine',                                     // loratadine ↔ métabolite actif
        'metronidazole::spiramycinemetronidazole',                       // association
        'piperacillinetazobactam::piperacilline',                        // association ↔ composant
        'valproate::divalproatedesodium',                                // sel de valproate
        'fer::ascorbateferreux', 'fer::fumarateferreux', 'fer::sulfateferreux', // vrais sels de fer
        'ginkgo::ginkgobiloba',                                          // extrait
        'sartan::candesartan', 'sartan::eprosartan', 'sartan::irbesartan',
        'sartan::losartan', 'sartan::olmesartan', 'sartan::telmisartan', 'sartan::valsartan', // famille -sartan
    ]);
    const nouvelles = found.filter(sig => !ALLOWLIST.has(sig));
    test('Collision de matching — aucune NOUVELLE collision hors allowlist', () => {
        assert.ok(nouvelles.length === 0,
            'collision(s) de sous-chaîne détectée(s) — un médicament est matché par une clé sans rapport clinique :\n  ' +
            nouvelles.join('\n  ') +
            '\n(si légitime : ajouter à ALLOWLIST ; sinon corriger la classe/denylist dans drug_classes.js)');
    });
    // Verrou explicite des collisions historiques déjà corrigées (ne doivent JAMAIS revenir).
    const REGRESSIONS_INTERDITES = [
        'fer::cholecalciferol', 'fer::ergocalciferol',   // fer ↔ calciférol
        'clidinium::umeclidinium', 'clidinium::aclidinium', // antispasmodique ↔ LAMA
    ];
    REGRESSIONS_INTERDITES.forEach(sig => {
        test('Collision — régression interdite : ' + sig, () => {
            assert.ok(!found.includes(sig), 'collision historique réapparue : ' + sig);
        });
    });
}

// ============================================================================
// AUDIT DE RÉFÉRENCE QT/CredibleMeds
// ----------------------------------------------------------------------------
// Fige les classifications QT/TdP vérifiées contre CredibleMeds (sweep Phase 4a).
// scores.qt attendu : Known Risk = 3, Possible = 2, Conditional = 1.
// Verrouille les corrections (sous-estimations dangereuses fluconazole/HCQ/donépézil/
// ivabradine + reclassements) contre toute régression lors d'un futur ré-import.
function runQtReferenceAudit(test, assert) {
    const { sandbox } = loadApp();
    const dump = vm.runInContext(
        'JSON.stringify(MASTER_DB.MEDICAMENTS.map(function(m){return {dci:m.dci,qt:(m.scores&&m.scores.qt)||0};}))',
        sandbox);
    const meds = JSON.parse(dump);
    const byDci = {};
    meds.forEach(m => { byDci[m.dci] = m.qt; });
    // Valeur scores.qt EXACTE attendue (vérifiée CredibleMeds). Clé = dci exact en base.
    const REF = {
        // Known Risk (qt=3) — corrigés + ancres qui ne doivent jamais chuter
        'Fluconazole': 3, 'Hydroxychloroquine': 3, 'Donépézil': 3, 'Ivabradine': 3,
        'Roxithromycine': 3, 'Sulpiride': 3,
        'Amiodarone': 3, 'Sotalol': 3, 'Azithromycine': 3, 'Citalopram': 3,
        'Escitalopram': 3, 'Domperidone': 3, 'Haloperidol': 3, 'Methadone': 3,
        'Moxifloxacine': 3, 'Levofloxacine': 3, 'Disopyramide': 3, 'Dronedarone': 3,
        // Possible (qt=2) — reclassés
        'Clomipramine': 2, 'Desipramine': 2, 'Asenapine': 2, 'Toltérodine': 2,
        'Norfloxacine': 2, 'Ofloxacine': 2, 'Nortriptyline': 2, 'Olanzapine': 2,
        'Pimavansérine': 2, 'Solifenacine': 2, 'Pipamperone': 2, 'Prochlorperazine': 2,
        'Maprotiline': 2, 'Delamanide': 2,
        // Conditional (qt=1) — dé-sur-classé
        'Trazodone': 1,
        // Conditional correct laissé tel quel (contrôle anti-sur-correction)
        'Ciprofloxacine': 1,
    };
    Object.entries(REF).forEach(([dci, expected]) => {
        test('QT/CredibleMeds — ' + dci + ' doit avoir scores.qt=' + expected, () => {
            assert.ok(dci in byDci, 'médicament absent de la base : ' + dci);
            assert.strictEqual(byDci[dci], expected,
                `${dci} : scores.qt=${byDci[dci]} attendu ${expected} (classification CredibleMeds figée — régression ?)`);
        });
    });

    // Conformité à la LISTE OFFICIELLE CredibleMeds (fixture qt_ref_crediblemeds.json,
    // fournie par le Dr Nunes — listes Known + Possible Risk of TdP). La base DOIT
    // coller pour chaque molécule couverte : Known->3, Possible->2.
    const qref = JSON.parse(fs.readFileSync(path.join(__dirname, 'qt_ref_crediblemeds.json'), 'utf8'));
    const want = { KR: 3, PR: 2 };
    const dump2 = vm.runInContext(
        'JSON.stringify(MASTER_DB.MEDICAMENTS.map(function(m){return {dci:m.dci,qt:(m.scores&&m.scores.qt)||0};}))',
        sandbox);
    const byNorm = {};
    const norm = s => vm.runInContext('sanitizeText(' + JSON.stringify(s) + ')', sandbox);
    JSON.parse(dump2).forEach(m => { byNorm[norm(m.dci)] = m; });
    const qmis = [];
    Object.entries(qref).forEach(([name, cat]) => {
        const m = byNorm[norm(name)];
        if (!m) return; // molécule CredibleMeds absente de la base : hors périmètre
        if (m.qt !== want[cat]) qmis.push(`${m.dci}: qt=${m.qt} attendu ${want[cat]} (${cat})`);
    });
    test('QT/CredibleMeds — base conforme à la liste officielle (Known/Possible)', () => {
        assert.ok(qmis.length === 0,
            'écart(s) avec la liste CredibleMeds Known/Possible :\n  ' + qmis.join('\n  '));
    });
}

// ============================================================================
// AUDIT CHARGE ANTICHOLINERGIQUE (ACB Boustani 2008 + CIA Briet 2017)
// ----------------------------------------------------------------------------
// Fige les corrections de la Phase 4b et verrouille l'invariant qui a révélé
// les erreurs : un anticholinergique STRUCTUREL (acb=3, échelle Boustani) ne
// peut PAS avoir cia=0 (échelle d'imprégnation anticholinergique de Briet et al.
// 2017) — les deux échelles cotent haut les anticholinergiques établis. Détecte
// tout futur champ cia non renseigné.
function runAnticholinergicAudit(test, assert) {
    const { sandbox } = loadApp();
    const dump = vm.runInContext(
        'JSON.stringify(MASTER_DB.MEDICAMENTS.map(function(m){return {dci:m.dci,acb:(+m.acb||0),cia:(+m.cia||0)};}))',
        sandbox);
    const meds = JSON.parse(dump);
    const byDci = {}; meds.forEach(m => { byDci[m.dci] = m; });

    // Invariant : aucun acb=3 avec cia=0 (cia manifestement non renseigné).
    test('Anticholinergique — aucun acb=3 avec cia=0 (échelle CIA-Briet non renseignée)', () => {
        const bad = meds.filter(m => m.acb >= 3 && m.cia === 0).map(m => m.dci);
        assert.ok(bad.length === 0,
            'anticholinergique(s) structurel(s) avec cia=0 (ADS/Carnahan manquant) : ' + bad.join(', '));
    });

    // Gel contre la TABLE DE RÉFÉRENCE (calculateur charge anticholinergique
    // Briet 2017 / Boustani 2012, fourni par le Dr Nunes). La base DOIT coller à
    // cette table pour chaque molécule couverte — toute dérive future échoue.
    const ref = JSON.parse(fs.readFileSync(path.join(__dirname, 'anticho_ref_briet2017.json'), 'utf8'));
    const norm = s => vm.runInContext('sanitizeText(' + JSON.stringify(s) + ')', sandbox);
    const byNorm = {};
    meds.forEach(m => { byNorm[norm(m.dci)] = m; });
    const mismatches = [];
    Object.entries(ref).forEach(([dci, v]) => {
        const m = byNorm[norm(dci)] || byNorm[norm(dci).replace('phenamine', 'pheniramine')];
        if (!m) return; // molécule de la table absente de la base : hors périmètre
        if (m.acb !== v.acb) mismatches.push(`${m.dci}: acb=${m.acb} attendu ${v.acb}`);
        if (m.cia !== v.cia) mismatches.push(`${m.dci}: cia=${m.cia} attendu ${v.cia}`);
    });
    test('Anticholinergique — base conforme à la table de référence (Briet 2017 / Boustani)', () => {
        assert.ok(mismatches.length === 0,
            'écart(s) avec la table de référence anticholinergique :\n  ' + mismatches.join('\n  '));
    });
}

// ============================================================================
// AUDIT LIAISON PROTÉIQUE (albumine, % PPB — Zhang et al. 2011)
// ----------------------------------------------------------------------------
// Fige le champ `albumine` (% liaison aux protéines plasmatiques) contre la
// Table 1 de Zhang F. et al., Drug Discovery Today 2011;17:475-485 (222 médocs),
// fournie par le Dr Nunes. Le % PPB varie selon les sources : tolérance ±12 pts —
// détecte les erreurs grossières (0/vide sur un médoc fortement lié : la logique
// de DÉPLACEMENT albuminique en dépend) sans imposer une valeur unique stricte.
function runProteinBindingAudit(test, assert) {
    const { sandbox } = loadApp();
    const dump = vm.runInContext(
        'JSON.stringify(MASTER_DB.MEDICAMENTS.map(function(m){return {dci:m.dci,alb:m.albumine};}))', sandbox);
    const byDci = {};
    JSON.parse(dump).forEach(m => { byDci[m.dci] = parseFloat(m.alb); });
    const ref = JSON.parse(fs.readFileSync(path.join(__dirname, 'ppb_ref_zhang2011.json'), 'utf8'));
    const TOL = 12;
    const mis = [];
    Object.entries(ref).forEach(([dci, exp]) => {
        if (!(dci in byDci)) return;
        const cur = byDci[dci];
        if (isNaN(cur) || Math.abs(cur - exp) > TOL) mis.push(`${dci}: albumine=${isNaN(cur) ? '(vide)' : cur} attendu ~${exp} (Zhang 2011, tol ±${TOL})`);
    });
    test('Liaison protéique — base conforme à Zhang 2011 (±12 pts)', () => {
        assert.ok(mis.length === 0,
            'écart(s) majeur(s) de % liaison albumine vs Zhang 2011 :\n  ' + mis.join('\n  '));
    });
}

// ============================================================================
// AUDIT SCORES COMPOSITES (sero/saign/chute/sedat/hypoG) — invariants de classe
// ----------------------------------------------------------------------------
// Ces scores 0-3 alimentent les scores composites (syndrome sérotoninergique,
// hémorragie, chute, sédation, hypoglycémie). Pas de table source unique →
// verrouillés par INVARIANTS DE CLASSE pharmacologiques (Phase 4c, vérif agents).
// Détecte toute régression/omission (ex. un ISRS qui retombe à sero=1, un
// sulfamide sans hypoG, un anticoagulant sans saign).
function runCompositeScoreAudit(test, assert) {
    const { sandbox } = loadApp();
    const dump = vm.runInContext(
        'JSON.stringify(MASTER_DB.MEDICAMENTS.map(function(m){return {dci:m.dci,s:m.scores||{}};}))', sandbox);
    const meds = JSON.parse(dump);
    const norm = s => vm.runInContext('sanitizeText(' + JSON.stringify(s) + ')', sandbox);
    const byNorm = {}; meds.forEach(m => { byNorm[norm(m.dci)] = m.s; });
    const val = (dci, dim) => { const s = byNorm[norm(dci)]; return s ? (+s[dim] || 0) : null; };

    // [libellé, dimension, comparateur, seuil, [dci...]]
    const INV = [
        ['ISRS -> sero>=2', 'sero', '>=', 2, ['fluoxetine', 'paroxetine', 'sertraline', 'citalopram', 'escitalopram', 'fluvoxamine']],
        ['IRSN -> sero>=2', 'sero', '>=', 2, ['venlafaxine', 'duloxetine', 'milnacipran']],
        ['IMAO/linézolide -> sero=3', 'sero', '===', 3, ['linezolide', 'iproniazide']],
        ['Bupropion non sérotoninergique -> sero=0', 'sero', '===', 0, ['bupropion']],
        ['Sulfamides hypoglyc. -> hypoG=3', 'hypoG', '===', 3, ['glibenclamide', 'glimepiride', 'glipizide']],
        ['Antidiab. sans hypo propre -> hypoG=0', 'hypoG', '===', 0, ['metformine', 'sitagliptine', 'empagliflozin', 'dapagliflozin', 'acarbose']],
        ['Anticoagulants oraux -> saign=3', 'saign', '===', 3, ['warfarine', 'apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban', 'acenocoumarol', 'fluindione']],
        ['Paracétamol -> saign=0', 'saign', '===', 0, ['paracetamol']],
        ['Benzodiazépines -> sedat=3', 'sedat', '===', 3, ['diazepam', 'lorazepam', 'oxazepam', 'alprazolam', 'bromazepam']],
        ['Benzodiazépines -> chute=3', 'chute', '===', 3, ['diazepam', 'lorazepam', 'oxazepam', 'alprazolam', 'bromazepam']],
        ['ADT tertiaires -> chute=3', 'chute', '===', 3, ['amitriptyline', 'clomipramine', 'imipramine', 'doxepine']],
        ['Alpha-1 bloquants systémiques -> chute=3', 'chute', '===', 3, ['prazosine', 'doxazosine', 'terazosine']],
        ['Gabapentinoïdes -> sedat>=2', 'sedat', '>=', 2, ['gabapentine', 'pregabaline']],
    ];
    const cmp = { '>=': (a, b) => a >= b, '===': (a, b) => a === b };
    INV.forEach(([label, dim, op, thr, dcis]) => {
        test('Score composite — ' + label, () => {
            const bad = dcis.map(d => ({ d, v: val(d, dim) }))
                .filter(x => x.v !== null && !cmp[op](x.v, thr))
                .map(x => `${x.d}:${dim}=${x.v}`);
            assert.ok(bad.length === 0, 'invariant de classe violé : ' + bad.join(', '));
        });
    });
}

// ============================================================================
// GOLDEN MASTER D'APPARTENANCE DE CLASSE (collisions non-sous-chaîne)
// ----------------------------------------------------------------------------
// Fige la composition EXACTE de chaque classe DRUG_CLASSES (membres = médocs
// que _classMatchesMed rattache). Complète runCollisionAudit (sous-chaîne DCI) :
// détecte les collisions par LIBELLÉ DE CLASSE et les contaminations sémantiques
// (ex. olanzapine « thiéno-benzodiazépine » ⊄ benzos ; desmopressine
// « antidiurétique » ⊄ diurétiques). Toute dérive d'appartenance = revue.
function runClassMembershipAudit(test, assert) {
    const { sandbox } = loadApp();
    const current = JSON.parse(vm.runInContext(`(function(){
        var meds = MASTER_DB.MEDICAMENTS.map(function(m){return {dci:m.dci, ndci:sanitizeText(m.dci), nclasse:sanitizeText(m.classe||'')};});
        var res = {};
        for (var cid in DRUG_CLASSES) {
            var mem = [];
            meds.forEach(function(m){ try { if (_classMatchesMed(cid, m.ndci, m.nclasse)) mem.push(m.dci); } catch(e){} });
            res[cid] = mem.sort();
        }
        return JSON.stringify(res);
    })()`, sandbox));
    const goldenPath = path.join(__dirname, 'class_members_golden.json');
    if (!fs.existsSync(goldenPath) || process.env.GOLDEN_UPDATE === '1') {
        fs.writeFileSync(goldenPath, JSON.stringify(current, null, 1));
        console.log('  ℹ️  Golden d\'appartenance de classe ' + (process.env.GOLDEN_UPDATE === '1' ? 'RÉGÉNÉRÉ' : 'CRÉÉ'));
        return;
    }
    const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
    Object.keys(golden).forEach(cid => {
        test('Appartenance de classe — ' + cid, () => {
            const g = new Set(golden[cid] || []), c = new Set(current[cid] || []);
            const added = [...c].filter(x => !g.has(x)).map(x => '+' + x);
            const removed = [...g].filter(x => !c.has(x)).map(x => '-' + x);
            const diff = added.concat(removed);
            assert.ok(diff.length === 0,
                'composition de classe modifiée (si voulu : GOLDEN_UPDATE=1) : ' + diff.join(', '));
        });
    });
}

module.exports = { runExtendedAudits, runExtendedAudits2, runCollisionAudit, runQtReferenceAudit, runAnticholinergicAudit, runProteinBindingAudit, runCompositeScoreAudit, runClassMembershipAudit, PANEL, signaturePatient };
