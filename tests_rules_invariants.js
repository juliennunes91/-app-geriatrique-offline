// tests_rules_invariants.js — Linter d'invariants du corpus de règles.
//
// Audite TOUTES les règles évaluées par checkRuleOptimized (geria_engine_v2.js) :
//   GERIA_RECOS_DB.EVITER + INITIER (geria_recos_final.js)
//   RECOS_SUPPLEMENT ∪ RECOS_SUPPLEMENT_INTEGRATION (geria_integration_module.js)
// et les croise avec les dictionnaires réels (MASTER_DB.PATHOLOGIES / BIOLOGIE) et
// le routage de rendu (app_analysis.js). But : attraper la FAMILLE de bugs qui
// récidive (omission gatée sur présence, comorbidité/biologie inexistante, omission
// rendue dans « À éviter », clé médicament malformée, doublon, id en collision)
// au niveau du CORPUS, pas au cas par cas.
//
// Deux niveaux :
//   • Invariants DURS  → assertion : 0 violation sur les règles ACTIVES (hors
//     quarantaine). Toute régression future fait échouer `node tests.js`.
//   • Section AUDIT    → informative (console), ne fait jamais échouer : clés
//     malformées, doublons de signature, mismatch nom/bucket, violations sur les
//     règles en quarantaine.
//
// Usage : `node tests_rules_invariants.js` (standalone) ou intégré via tests.js.

const vm = require('vm');
const { loadApp } = require('./oracle_harness');

// Pathologies masquées du sélecteur (app_ui.js : PATHO_HIDDEN_FROM_PICKER).
// PAT_016 (diabète non précisé) reste clé canonique interne mais non proposée.
const HIDDEN_PATHOS = new Set(['PAT_016']);

// Baseline des références pendantes PRÉEXISTANTES tolérées (vide actuellement).
// Historique : EV_H03/EV_H09 référençaient PAT_054/PAT_055 (inexistants) ; ils
// ont été regatés sur contexte_clinique "arthrose" (case chkArthrose). Toute
// nouvelle référence pendante fait désormais échouer INV-H.
const BASELINE_DANGLING_COMORBS = new Set([]);

function extractCorpus() {
    const { sandbox } = loadApp();
    // « presenceDead » : une règle déclenchée sur PRÉSENCE est morte si un de ses
    // groupes med_keys/_2/_3 (AND) n'a AUCUNE clé résolvable (aucun médicament de la
    // base ne peut le satisfaire) — calculé en sandbox via matchesDrugClass.
    const helpers = `
        const __norm = s => (s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
        const __meds = MASTER_DB.MEDICAMENTS.map(m => ({ dci: __norm(m.dci), classe: __norm(m.classe) }));
        const __special = new Set(['antihypertenseur']);
        const __resolves = key => { const k = String(key).toLowerCase().replace(/[^a-z0-9]/g,''); return __special.has(k) || __meds.some(m => matchesDrugClass(m.dci, m.classe, k)); };
        const __presenceDead = c => { const g = [c.med_keys, c.med_keys_2, c.med_keys_3].filter(x => Array.isArray(x) && x.length); return g.length > 0 && g.some(grp => !grp.some(__resolves)); };
    `;
    const pick = `(r=>({id:r.id,ref_code:r.ref_code,severite:r.severite,titre:r.titre,message:r.message,condition:r.condition,presenceDead:__presenceDead(r.condition||{})}))`;
    const json = vm.runInContext(`(function(){${helpers} return JSON.stringify({
        pathoIds: Object.keys(MASTER_DB.PATHOLOGIES),
        bioIds: Object.keys(MASTER_DB.BIOLOGIE),
        eviter: GERIA_RECOS_DB.EVITER.map(${pick}),
        initier: GERIA_RECOS_DB.INITIER.map(${pick}),
        supplement: (function(){
            const ids = new Set(RECOS_SUPPLEMENT.map(r=>r.id));
            return RECOS_SUPPLEMENT
                .concat(RECOS_SUPPLEMENT_INTEGRATION.filter(r=>!ids.has(r.id)))
                .map(${pick});
        })(),
        quarantine: [...SUPPLEMENT_QUARANTINE]
    }); })()`, sandbox);
    const raw = JSON.parse(json);

    const bucketOf = { eviter: 'eviter', initier: 'initier', supplement: 'eviter' };
    const quar = new Set(raw.quarantine);
    const rules = [];
    for (const [set, arr] of [['eviter', raw.eviter], ['initier', raw.initier], ['supplement', raw.supplement]]) {
        arr.forEach(r => {
            const c = r.condition || {};
            rules.push({
                id: r.id, set, bucket: bucketOf[set], quarantined: quar.has(r.id),
                refCode: r.ref_code || '', severite: r.severite,
                hasTitre: !!r.titre, hasMessage: !!r.message,
                comorbs: [].concat(c.comorbs || [], c.comorbs_any || [], c.comorbs_absent || []),
                comorbsPositive: [].concat(c.comorbs || [], c.comorbs_any || []),
                bioCodes: Object.keys(c.bio || {}).concat(Object.keys(c.bio_any || {})),
                medKeys: [].concat(c.med_keys || [], c.med_keys_2 || [], c.med_keys_3 || []),
                medAbsent: (c.med_absent || []).slice(),
                hasMedKeys: !!(c.med_keys && c.med_keys.length),
                hasMedAbsent: !!(c.med_absent && c.med_absent.length),
                hasGate: !!(c.comorbs || c.comorbs_any || c.bio || c.bio_any || c.contexte_clinique || c.contexte_clinique_any || c.fragile || c.fragilite),
                bioStrict: !!c.bio_strict,
                condKeyCount: Object.keys(c).length,
                condType: c.type || null,
                presenceDead: !!r.presenceDead
            });
        });
    }
    return { rules, pathoIds: new Set(raw.pathoIds), bioIds: new Set(raw.bioIds) };
}

// Cible les clés structurellement malformées (et non les tokens de classe
// légitimes comme « ara2 », « sglt2 », ni les noms multi-mots « carbonate de
// calcium ») : conjonction joignant plusieurs médicaments, posologie embarquée,
// tokens collés (double espace), ou clé à 4+ mots.
const looksMalformedKey = s => {
    const str = String(s).trim();
    return / ou | et /i.test(str)
        || /\s{2,}/.test(s)
        || (/\d/.test(str) && /\s/.test(str))
        || str.split(/\s+/).length >= 4;
};

function runRuleInvariantTests(test, assert) {
    console.log('\n🧪 Invariants du corpus de règles (linter)');
    const { rules, pathoIds, bioIds } = extractCorpus();
    const active = rules.filter(r => !r.quarantined);
    const fmt = a => a.length ? '\n      - ' + a.join('\n      - ') : '';

    // ---- INVARIANTS DURS (0 violation attendue sur règles actives) ----

    test('INV-A — id unique sur tout le corpus', () => {
        const ids = rules.map(r => r.id);
        const dups = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
        assert.strictEqual(dups.length, 0, `ids dupliqués: ${dups.join(', ')}`);
    });

    test('INV-B — tout code bio référencé existe dans MASTER_DB.BIOLOGIE', () => {
        const bad = [];
        active.forEach(r => r.bioCodes.forEach(b => { if (!bioIds.has(b)) bad.push(`${r.id}:${b}`); }));
        assert.strictEqual(bad.length, 0, `codes bio inexistants:${fmt(bad)}`);
    });

    test('INV-C — toute règle START/INITIER détecte une omission (med_absent), pas une présence', () => {
        const bad = active.filter(r =>
            (r.set === 'initier' || /^START/i.test(r.refCode)) && r.hasMedKeys && !r.hasMedAbsent
        ).map(r => `${r.id} (ref=${r.refCode})`);
        assert.strictEqual(bad.length, 0, `omissions gatées sur présence:${fmt(bad)}`);
    });

    test('INV-D — aucune règle START active rendue dans le bucket « À éviter »', () => {
        const bad = active.filter(r => /^START/i.test(r.refCode) && r.bucket === 'eviter')
            .map(r => `${r.id} (${r.set}, ref=${r.refCode})`);
        assert.strictEqual(bad.length, 0, `omissions START routées en « éviter »:${fmt(bad)}`);
    });

    test('INV-E — règle INITIER avec critère bio doit avoir bio_strict (sinon déclenche bio manquante)', () => {
        const bad = active.filter(r => r.set === 'initier' && r.bioCodes.length && !r.bioStrict)
            .map(r => r.id);
        assert.strictEqual(bad.length, 0, `INITIER bio sans bio_strict:${fmt(bad)}`);
    });

    test('INV-F — aucune règle active sans condition exploitable', () => {
        const bad = active.filter(r => r.condKeyCount === 0 && !r.condType).map(r => r.id);
        assert.strictEqual(bad.length, 0, `conditions vides:${fmt(bad)}`);
    });

    test('INV-G — champs requis présents (condition + severite + titre)', () => {
        const bad = active.filter(r => !r.severite || !r.hasTitre).map(r => r.id);
        assert.strictEqual(bad.length, 0, `champs manquants:${fmt(bad)}`);
    });

    test('INV-H — toute comorbidité référencée existe (hors baseline pendante connue)', () => {
        const bad = [];
        active.forEach(r => r.comorbs.forEach(p => {
            const key = `${r.id}:${p}`;
            if (!pathoIds.has(p) && !BASELINE_DANGLING_COMORBS.has(key)) bad.push(key);
        }));
        assert.strictEqual(bad.length, 0, `comorbidités inexistantes (nouvelles):${fmt(bad)}`);
    });

    // ---- SECTION AUDIT (informative — ne fait jamais échouer la suite) ----
    const auditLines = [];
    const audit = (label, items) => {
        auditLines.push(`  • ${label}: ${items.length}` + (items.length ? fmt(items.slice(0, 30)) : ''));
    };

    // Clés médicament structurellement suspectes (mots concaténés / conjonctions / chiffres)
    const malformed = [];
    rules.forEach(r => [...r.medKeys, ...r.medAbsent].forEach(k => {
        if (looksMalformedKey(k)) malformed.push(`${r.id}${r.quarantined ? ' [Q]' : ''} :: "${k}"`);
    }));
    audit('Clés médicament suspectes (à revoir)', malformed);

    // Règles ACTIVES mortes par médicament : un groupe med_keys/_2/_3 (AND) dont
    // aucune clé ne correspond à un médicament de la base → ne peut jamais déclencher
    // (clé malformée OU médicament cible absent de MASTER_DB.MEDICAMENTS).
    const presenceDead = active.filter(r => r.presenceDead).map(r => `${r.id} (${r.set}) — ${r.medKeys.slice(0, 3).join(', ')}`);
    audit('Règles actives mortes par médicament (aucune med_keys résolvable)', presenceDead);

    // Omissions (med_absent) rendues dans « éviter » — légitime si co-prescription protectrice
    const omissionInEviter = active.filter(r => r.hasMedAbsent && r.bucket === 'eviter').map(r => `${r.id} (${r.set})`);
    audit('med_absent rendu en « éviter » (vérifier intention)', omissionInEviter);

    // Mismatch convention de nommage vs bucket
    const nameBucketMismatch = active.filter(r =>
        (/^IN_/.test(r.id) && r.bucket === 'eviter') || (/^EV_/.test(r.id) && r.bucket === 'initier')
    ).map(r => `${r.id} → ${r.bucket}`);
    audit('Mismatch préfixe id / bucket de rendu', nameBucketMismatch);

    // Doublons de signature (comorbs + med_absent identiques) parmi les règles actives d'omission
    const bySig = {};
    active.filter(r => r.hasMedAbsent).forEach(r => {
        const sig = JSON.stringify([r.comorbsPositive.slice().sort(), r.medAbsent.slice().sort()]);
        (bySig[sig] = bySig[sig] || []).push(r.id);
    });
    const dups = Object.values(bySig).filter(ids => ids.length > 1).map(ids => ids.join(' == '));
    audit('Doublons de signature (comorbs+med_absent)', dups);

    // Violations sur règles EN QUARANTAINE (rappel : non rendues, donc non bloquantes)
    const quarPathoMiss = [];
    rules.filter(r => r.quarantined).forEach(r => r.comorbs.forEach(p => { if (!pathoIds.has(p)) quarPathoMiss.push(`${r.id}:${p}`); }));
    audit('Quarantaine — comorbidités inexistantes', quarPathoMiss);

    console.log('\n  📋 AUDIT (informatif, non bloquant) :');
    console.log(auditLines.join('\n'));
    console.log('');
}

module.exports = { runRuleInvariantTests, extractCorpus };

// Exécution standalone
if (require.main === module) {
    const assert = require('assert');
    let passed = 0, failed = 0;
    const test = (name, fn) => {
        try { fn(); passed++; console.log(`  ✅ ${name}`); }
        catch (e) { failed++; console.log(`  ❌ ${name}: ${e.message}`); }
    };
    runRuleInvariantTests(test, assert);
    console.log(`${'='.repeat(50)}`);
    console.log(`Invariants: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(50));
    process.exit(failed > 0 ? 1 : 0);
}
