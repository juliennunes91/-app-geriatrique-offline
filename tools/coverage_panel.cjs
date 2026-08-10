// Outil de QA — couverture des règles par le panel de patients (golden-master).
//
// Mesure quelle proportion des règles de geria_recos_final.js est réellement
// exercée par le PANEL de tests_audit_extended.js, et dérive au besoin les
// patients manquants.
//
// Usage :
//   node tools/coverage_panel.cjs                 # rapport de couverture
//   node tools/coverage_panel.cjs --generate      # + dérive les patients manquants
//
// ─── DEUX PIÈGES À CONNAÎTRE (ils ont faussé la première mesure) ─────────────
//
// 1. NE JAMAIS MESURER LA COUVERTURE PAR LES TITRES. Le moteur fusionne et
//    réécrit les titres au rendu : EV_D01 et EV_D02 ressortent tous deux sous
//    « Antidépresseurs tricycliques chez le sujet âgé ». Une mesure par titre
//    sous-estime la couverture et fait croire à tort qu'une règle est muette.
//    Les identifiants, eux, survivent dans le HTML via maskGeriaAlert('id:…') :
//    c'est la seule base fiable.
//
// 2. CERTAINES RÈGLES SONT INDÉCLENCHABLES PAR CONSTRUCTION. checkRuleOptimized
//    (geria_engine_v2.js) rejette d'emblée `type: 'manual_review'` et
//    `type: 'duplication_check'`. Elles ne compteront jamais : on les exclut du
//    dénominateur au lieu de courir après.
//
// ─── COMMENT UN PATIENT SE DÉRIVE D'UNE RÈGLE ───────────────────────────────
// Chaque règle déclare ses conditions ; le patient s'en déduit mécaniquement :
//   med_keys           → une DCI réelle, par inversion EXACTE de matchesDrugClass
//                        sur MASTER_DB (ne jamais deviner un nom de molécule)
//   comorbs            → identifiants PAT_xxx tels quels
//   contexte_clinique  → case à cocher, via la table extraite d'app_analysis.js
//   bio / bio_strict   → identifiant de champ + valeur satisfaisant l'opérateur
//                        (analyzeCase accepte directement l'id du champ)
//   med_absent         → on part d'un patient vide, il suffit de ne rien ajouter

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RACINE = path.join(__dirname, '..');
const { analyzeCase, loadApp } = require(path.join(RACINE, 'oracle_harness'));

const GENERER = process.argv.includes('--generate');
const TABS = ['alertes-eviter', 'alertes-initier', 'alertes-bio', 'alertes-interact', 'alertes-suivi', 'alertes-usage'];
const lire = f => fs.readFileSync(path.join(RACINE, f), 'utf8');

// ── Règles ───────────────────────────────────────────────────────────────────
const recos = new Function(lire('geria_recos_final.js') +
    '\nreturn {GERIA_RECOS_DB, RECOS_SUPPLEMENT: typeof RECOS_SUPPLEMENT!=="undefined"?RECOS_SUPPLEMENT:[]};')();
const TOUTES = [
    ...(recos.GERIA_RECOS_DB.EVITER || []),
    ...(recos.GERIA_RECOS_DB.INITIER || []),
    ...(recos.RECOS_SUPPLEMENT || [])
];
const indeclenchable = r => {
    const c = r.condition || {};
    return c.type === 'manual_review' || c.type === 'duplication_check';
};
const DECLENCHABLES = TOUTES.filter(r => !indeclenchable(r));

// ── Panel courant ────────────────────────────────────────────────────────────
const srcPanel = lire('tests_audit_extended.js');
const PANEL = eval('(' + srcPanel.match(/const PANEL = \{[\s\S]*?\n\};/)[0]
    .replace('const PANEL = ', '').replace(/;\s*$/, '') + ')');

/** Identifiants de règle réellement déclenchés par un cas patient. */
function idsDeclenches(cas) {
    const r = analyzeCase(cas);
    const s = new Set();
    Object.values(r._html || {}).forEach(h => {
        for (const m of String(h).matchAll(/maskGeriaAlert\('id:([^']+)'\)/g)) s.add(m[1]);
    });
    return s;
}

const vus = new Set();
Object.values(PANEL).forEach(c => idsDeclenches(c).forEach(x => vus.add(x)));
const couvertes = DECLENCHABLES.filter(r => vus.has(r.id));
const muettes = DECLENCHABLES.filter(r => !vus.has(r.id));

console.log('COUVERTURE DES RÈGLES PAR LE PANEL');
console.log('  patients du panel        :', Object.keys(PANEL).length);
console.log('  règles totales           :', TOUTES.length);
console.log('  indéclenchables (type)   :', TOUTES.length - DECLENCHABLES.length);
console.log('  déclenchables            :', DECLENCHABLES.length);
console.log('  COUVERTES                :', couvertes.length,
    `(${Math.round(100 * couvertes.length / DECLENCHABLES.length)} %)`);
console.log('  muettes                  :', muettes.length);
if (!GENERER) {
    if (muettes.length) {
        console.log('\nRègles muettes :');
        muettes.forEach(r => console.log('   ', r.id, '—', String(r.titre).slice(0, 62)));
        console.log('\n(relancer avec --generate pour dériver les patients manquants)');
    }
    process.exit(0);
}

// ── Dérivation ───────────────────────────────────────────────────────────────
const appSrc = lire('app_analysis.js');
const CTX2CHK = {};
for (const m of appSrc.matchAll(/isChecked\('([^']+)'\)[^\n]*?ctxClinique\.push\("([^"]+)"\)/g)) CTX2CHK[m[2]] = m[1];
const debut = appSrc.indexOf('const bioValues = {');
const BIO2INPUT = {};
for (const m of appSrc.slice(debut, debut + 3000).matchAll(/'(BIO_[0-9A-Za-z_]+)':\s*[_A-Za-z]*getBioVal\('([^']+)'\)/g)) BIO2INPUT[m[1]] = m[2];

const { sandbox } = loadApp();
/** Inversion exacte de matchesDrugClass : une clé de règle → une DCI de la base. */
function dciPourCle(cle) {
    return vm.runInContext(`(function(){
        var k=${JSON.stringify(cle)}.toLowerCase().replace(/[^a-z0-9]/g,'');
        for (var i=0;i<MASTER_DB.MEDICAMENTS.length;i++){
            var m=MASTER_DB.MEDICAMENTS[i];
            try { if (matchesDrugClass(sanitizeText(m.dci), sanitizeText(m.classe||''), k)) return m.dci; } catch(e){}
        }
        return null;
    })()`, sandbox);
}

const valeurPour = crit => {
    const c = Array.isArray(crit) ? crit[0] : crit;
    if (!c || typeof c.val !== 'number') return null;
    if (c.op === '<') return +(c.val - Math.max(1, c.val * 0.1)).toFixed(2);
    if (c.op === '>') return +(c.val + Math.max(1, c.val * 0.1)).toFixed(2);
    return c.val;                                   // <= et >= : la borne convient
};

function derive(regle) {
    const c = regle.condition || {};
    const p = { age: 82, sexe: 'F', meds: [], comorbs: [], flags: [], bio: {} };
    if (c.age_min) p.age = Math.max(p.age, c.age_min + 2);
    if (c.age_max) p.age = Math.min(p.age, c.age_max - 2);
    if (c.fragile) { p.flags.push('patientFragile'); p.cfs = 8; }
    (c.comorbs || []).forEach(x => p.comorbs.push(x));
    if (c.comorbs_any && c.comorbs_any.length) p.comorbs.push(c.comorbs_any[0]);

    for (const champ of ['med_keys', 'med_keys_2', 'med_keys_3']) {
        if (!c[champ] || !c[champ].length) continue;
        let dci = null;
        for (const k of c[champ]) { dci = dciPourCle(k); if (dci) break; }
        if (dci && !p.meds.includes(dci)) p.meds.push(dci);
    }
    [c.contexte_clinique].flat().filter(Boolean).forEach(ctx => {
        if (CTX2CHK[ctx]) p.flags.push(CTX2CHK[ctx]);
    });
    for (const champ of ['bio', 'bio_strict', 'bio_any']) {
        if (!c[champ]) continue;
        for (const [bid, crit] of Object.entries(c[champ])) {
            const input = BIO2INPUT[bid.split('_').slice(0, 2).join('_')] || BIO2INPUT[bid];
            const v = valeurPour(crit);
            if (input && v !== null) p.bio[input] = v;
        }
    }
    if (c.polypharmacie && c.seuil) {
        for (const d of ['Amlodipine', 'Atorvastatine', 'Pantoprazole', 'Paracetamol', 'Cholecalciferol', 'Bisoprolol']) {
            if (p.meds.length >= c.seuil) break;
            if (!p.meds.includes(d)) p.meds.push(d);
        }
    }
    if (c.qt_check && !p.meds.includes('Citalopram')) p.meds.push('Citalopram');

    // Exclusions : on est parti d'un patient vide, il suffit de retirer.
    (c.med_absent || []).forEach(k => { const d = dciPourCle(k); if (d) p.meds = p.meds.filter(x => x !== d); });
    (c.comorbs_absent || []).forEach(x => { p.comorbs = p.comorbs.filter(y => y !== x); });
    [c.contexte_clinique_absent].flat().filter(Boolean).forEach(ctx => {
        if (CTX2CHK[ctx]) p.flags = p.flags.filter(f => f !== CTX2CHK[ctx]);
    });
    if (!p.bio.patientDFG) p.bio.patientDFG = 60;

    const cas = { age: p.age, sexe: p.sexe, meds: p.meds, comorbs: p.comorbs, flags: p.flags, bio: p.bio };
    if (p.cfs) cas.cfs = p.cfs;
    return cas;
}

// 1) Un patient par règle muette, CONSERVÉ SEULEMENT S'IL LA DÉCLENCHE VRAIMENT
const derives = [];
let echecs = 0;
muettes.forEach(r => {
    const cas = derive(r);
    let ok = false;
    try { ok = idsDeclenches(cas).has(r.id); } catch (e) { /* cas invalide */ }
    if (ok) derives.push({ ids: [r.id], section: r.section || '?', cas }); else echecs++;
});

// 2) Fusion par paires d'une même section — uniquement si les DEUX règles tiennent
const parSection = {};
derives.forEach(d => (parSection[d.section] = parSection[d.section] || []).push(d));
const fusionnes = [];
for (const liste of Object.values(parSection)) {
    for (let i = 0; i < liste.length; i += 2) {
        const a = liste[i], b = liste[i + 1];
        if (!b) { fusionnes.push(a); continue; }
        const cas = {
            age: Math.max(a.cas.age, b.cas.age), sexe: a.cas.sexe,
            meds: [...new Set([...a.cas.meds, ...b.cas.meds])],
            comorbs: [...new Set([...a.cas.comorbs, ...b.cas.comorbs])],
            flags: [...new Set([...a.cas.flags, ...b.cas.flags])],
            bio: Object.assign({}, a.cas.bio, b.cas.bio)
        };
        if (a.cas.cfs || b.cas.cfs) cas.cfs = Math.max(a.cas.cfs || 0, b.cas.cfs || 0);
        const got = idsDeclenches(cas);
        if (got.has(a.ids[0]) && got.has(b.ids[0])) fusionnes.push({ ids: [...a.ids, ...b.ids], section: a.section, cas });
        else { fusionnes.push(a); fusionnes.push(b); }
    }
}

// 3) Minimisation : retirer tout dérivé dont l'apport est déjà assuré ailleurs
const nouveaux = {};
fusionnes.forEach(f => { nouveaux['cov_' + f.ids.join('_')] = f.cas; });
const sigI = {};
const TOUT = Object.assign({}, PANEL, nouveaux);
Object.entries(TOUT).forEach(([n, c]) => { sigI[n] = idsDeclenches(c); });
const union = noms => { const s = new Set(); noms.forEach(n => sigI[n].forEach(x => s.add(x))); return s; };
let retenus = Object.keys(TOUT);
const cible = union(retenus).size;
Object.keys(nouveaux).sort((a, b) => sigI[a].size - sigI[b].size).forEach(n => {
    const essai = retenus.filter(x => x !== n);
    if (union(essai).size === cible) retenus = essai;
});

const gardes = retenus.filter(n => nouveaux[n]);
const lignes = gardes.map(n => {
    const c = nouveaux[n], o = {};
    if (c.age) o.age = c.age;
    if (c.sexe) o.sexe = c.sexe;
    if (c.cfs) o.cfs = c.cfs;
    if (c.comorbs && c.comorbs.length) o.comorbs = c.comorbs;
    if (c.flags && c.flags.length) o.flags = c.flags;
    if (c.bio && Object.keys(c.bio).length) o.bio = c.bio;
    o.meds = c.meds || [];
    return `    '${n}': ${JSON.stringify(o)},`;
});
const sortie = path.join(RACINE, 'tools', 'coverage_panel_out.js');
fs.writeFileSync(sortie, lignes.join('\n') + '\n');

console.log('\nDÉRIVATION');
console.log('  dérivés vérifiés         :', derives.length, '| échecs :', echecs);
console.log('  après fusion par paires  :', fusionnes.length);
console.log('  après minimisation       :', gardes.length);
console.log('  couverture atteignable   :', union(retenus).size, 'identifiants');
console.log('\n→ ' + path.relative(RACINE, sortie));
console.log('  Coller ces lignes dans PANEL (tests_audit_extended.js), puis :');
console.log('    GOLDEN_UPDATE=1 node tests.js && node tests.js');
