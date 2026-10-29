#!/usr/bin/env node
// tools/build_ddi_pk.cjs — génère ddi_pk.js, la base des interactions
// pharmacocinétiques (rapports d'AUC) lue par l'onglet « AUC ».
//
//   node tools/build_ddi_pk.cjs            (régénère ddi_pk.js)
//   node tools/build_ddi_pk.cjs --rapport  (n'écrit rien, liste les noms non appariés)
//
// Deux sources, deux natures, jamais confondues à l'affichage :
//   1. tools/data/pk_mesures.json — rapports d'AUC MESURÉS chez l'homme (étude
//      publiée, RCP). Source éditable à la main : c'est là qu'on ajoute une valeur.
//   2. tools/vendor/ddi_predictor/auc_ratios_2026-10.csv — rapports PRÉDITS par
//      DDI-Predictor (M. Tod, modèle in vivo des CYP), extraction complète
//      280 substrats × 170 interacteurs. Fichier brut, ne pas éditer.
//
// Les noms anglais de DDI-Predictor sont appariés aux DCI de MASTER_DB par égalité
// EXACTE après normalisation (jamais par sous-chaîne : « citalopram » est contenu
// dans « escitalopram »). Un nom sans DCI en base n'est pas importé.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = path.resolve(__dirname, '..');
const CSV = path.join(RACINE, 'tools/vendor/ddi_predictor/auc_ratios_2026-10.csv');
const MESURES = path.join(RACINE, 'tools/data/pk_mesures.json');
const SORTIE = path.join(RACINE, 'ddi_pk.js');

// Seuils FDA (Clinical Drug Interaction Studies, 2020) — ceux de l'extraction.
// Une prédiction n'est retenue que si elle atteint au moins l'effet MODÉRÉ :
// c'est le seuil à partir duquel DDI-Predictor lui-même juge qu'une adaptation de
// dose peut être requise (remarque R7). L'effet faible serait du bruit à l'échelle
// d'une ordonnance gériatrique.
const SEUIL_HAUSSE = 2, SEUIL_BAISSE = 0.5;

const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');

function chargerDcis() {
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(RACINE, 'geria_database.js'), 'utf8')
        + ';this.__M = MASTER_DB.MEDICAMENTS.map(m => m.dci);', ctx);
    const parNorm = new Map();
    ctx.__M.forEach(d => { const k = norm(d); if (!parNorm.has(k)) parNorm.set(k, d); });
    return parNorm;
}

// Noms anglais (ou abrégés) dont la forme française n'est pas « nom + e ».
// Une entrée peut désigner PLUSIEURS DCI de la base : le valproate de
// DDI-Predictor est l'exposition à l'acide valproïque, que donnent aussi le
// divalproate et le valpromide (prodrogue).
const ALIAS = {
    glibenglyburide: ['Glibenclamide'],
    colchicin: ['Colchicine'],
    torsemide: ['Torasemide'],
    zuclopentixol: ['Zuclopenthixol'],
    oxcarbazepin: ['Oxcarbazepine'],
    rifampicin: ['Rifampicine'], rifampin: ['Rifampicine'],
    indomethacin: ['Indometacine'],
    stjohnswort: ['Millepertuis'],
    valproate: ['Valproate', 'Divalproate de sodium', 'Valpromide'],
    estradiolvalerate: ['Estradiol'],
    chlorpheniramine: ['Chlorpheniramine'],
};
// Interacteurs qui ne sont pas des médicaments saisissables mais un CONTEXTE.
const CONTEXTES = { tobacco: 'tabac' };

// « Warfarin S », « Fesoterodine a.m. », « Ibrutinib (fasten) », « Ritonavir 200-400 mg/d »
function decomposer(nom) {
    let n = String(nom).trim(), variante = '', dose = '';
    const mDose = n.match(/^(St John's wort|Grapefruit juice)\s*(.*)$/i) || n.match(/^(.*?)\s+(\d.*)$/);
    if (mDose) { n = mDose[1].trim(); dose = mDose[2].trim(); }
    const mRepas = n.match(/^(.*?)\s*\((with food|fasten)\)$/);
    if (mRepas) { n = mRepas[1]; variante = mRepas[2] === 'fasten' ? 'à jeun' : 'avec repas'; }
    const mAm = n.match(/^(.*?)\s+a\.m\.$/);
    if (mAm) { n = mAm[1]; variante = 'fraction active'; }
    const mEn = n.match(/^(.*?)\s+(R|S|RS|RR|SS)$/);
    if (mEn) { n = mEn[1]; variante = mEn[2] === 'RS' ? 'racémique' : 'énantiomère ' + mEn[2]; }
    n = n.replace(/\/r$/, '');
    if (/^tobacco$/i.test(n)) dose = dose.replace(/\s*\/d$/, ' cigarettes/d');
    return { base: n, variante, dose: traduireDose(dose) };
}
function traduireDose(d) {
    return d.replace(/mg\/d\b/g, 'mg/j').replace(/g\/d\b/g, 'g/j').replace(/\/d\b/g, '/j')
        .replace(/\bbid\b/g, '×2/j').replace(/\(with hyperforin dose ([<>]) 1 mg\/d\)/, 'hyperforine $1 1 mg/j')
        .replace(/Dbl Strength/, 'double concentration').replace(/Reg Strength/, 'concentration standard');
}

function resoudre(base, parNorm) {
    const k = norm(base);
    if (CONTEXTES[k]) return { contexte: CONTEXTES[k], dcis: [] };
    if (ALIAS[k]) return { dcis: ALIAS[k].filter(d => parNorm.has(norm(d))).map(d => parNorm.get(norm(d))) };
    for (const c of [k, k + 'e', k.replace(/in$/, 'ine')]) if (parNorm.has(c)) return { dcis: [parNorm.get(c)] };
    return { dcis: [] };
}

const REMARQUES = {
    R1: 'promédicament : rapport exprimé sur le métabolite actif',
    R2: 'métabolites actifs (compensation possible)',
    R3: 'transporteurs impliqués : prédiction moins sûre',
    R4: 'dose selon la surface corporelle',
    R5: 'interaction possible via le pH gastrique',
    R6: "déplacement de liaison à l'AAG",
    R7: 'marge thérapeutique étroite',
    R8: 'cinétique non linéaire : suivi thérapeutique recommandé',
    R9: "demi-vie > 48 h : l'effet met plusieurs jours à s'installer",
    R10: "demi-vie très longue de l'interacteur : effet et retour à l'état de base en plusieurs semaines",
    R11: 'inhibiteur irréversible du CYP3A4 : retour à l\'activité basale en 8 jours',
    R12: 'inhibiteur irréversible du CYP2D6 : retour à l\'activité basale en 8 jours',
    R13: 'cinétique non linéaire (fixation érythrocytaire)',
    R14: 'fraction active = molécule mère + métabolite actif',
};
const codes = s => String(s || '').split(/;\s*/).filter(c => /^R\d+$/.test(c));

function lirePredictions(parNorm) {
    const lignes = fs.readFileSync(CSV, 'utf8').split('\n').slice(1).filter(Boolean);
    const nonApparies = { substrat: new Set(), interacteur: new Set() };
    // Choix de la variante du substrat : la fraction active ou le racémique quand le
    // site les fournit (c'est ce que le patient reçoit), sinon chaque variante.
    const variantesParSubstrat = new Map();
    const brut = [];
    for (const l of lignes) {
        const [s, i, auc, p5, p95, rs, ri] = l.split(';');
        if (auc === '') continue; // non calculé par le site
        const S = decomposer(s), I = decomposer(i);
        const rS = resoudre(S.base, parNorm), rI = resoudre(I.base, parNorm);
        if (!rS.dcis.length) { nonApparies.substrat.add(S.base); continue; }
        if (!rI.dcis.length && !rI.contexte) { nonApparies.interacteur.add(I.base); continue; }
        if (!variantesParSubstrat.has(S.base)) variantesParSubstrat.set(S.base, new Set());
        variantesParSubstrat.get(S.base).add(S.variante);
        brut.push({ S, I, rS, rI, auc: +auc, p5: +p5, p95: +p95, rem: [...codes(rs), ...codes(ri)] });
    }
    const variantePreferee = base => {
        const v = variantesParSubstrat.get(base);
        if (v.has('fraction active')) return 'fraction active';
        if (v.has('racémique')) return 'racémique';
        return null; // toutes
    };
    const garde = brut.filter(r => { const p = variantePreferee(r.S.base); return p === null || r.S.variante === p; });
    // Un couple (substrat, variante, interacteur) est retenu si UNE de ses doses
    // franchit le seuil ; toutes ses doses sont alors gardées, pour que le lecteur
    // voie la dépendance à la dose (fluconazole 100, 200, 400 mg/j).
    const cle = r => [r.S.base, r.S.variante, r.I.base].join('|');
    // Le tabac fait exception : il n'a pas sa propre carte mais complète l'encart
    // « Interaction tabac », qui existe déjà ; l'effet faible y donne l'ordre de
    // grandeur (clozapine ×0,76) d'une induction que l'encart affirme sans chiffre.
    const franchit = r => r.rI.contexte ? (r.auc <= 0.8 || r.auc >= 1.25)
        : (r.auc >= SEUIL_HAUSSE || r.auc <= SEUIL_BAISSE);
    const retenus = new Set(garde.filter(franchit).map(cle));
    const sortie = [];
    for (const r of garde.filter(x => retenus.has(cle(x)))) {
        for (const s of r.rS.dcis) {
            const cibles = r.rI.contexte ? [{ ctx: r.rI.contexte }] : r.rI.dcis.map(d => ({ dci: d }));
            for (const c of cibles) {
                if (c.dci === s) continue;
                const e = { s, auc: r.auc, p5: r.p5, p95: r.p95, n: 'predit', src: 'DDIP' };
                if (c.dci) e.i = c.dci; else e.ctx = c.ctx;
                if (r.I.dose) e.dose = r.I.dose;
                if (r.S.variante && variantePreferee(r.S.base) === null && variantesParSubstrat.get(r.S.base).size > 1) e.var = r.S.variante;
                if (r.rem.length) e.rem = r.rem;
                sortie.push(e);
            }
        }
    }
    return { sortie, nonApparies };
}

function lireMesures(parNorm) {
    const M = JSON.parse(fs.readFileSync(MESURES, 'utf8'));
    return M.entrees.map(e => {
        for (const k of ['s', 'i']) if (!parNorm.has(norm(e[k]))) throw new Error(`pk_mesures.json : DCI inconnue de MASTER_DB « ${e[k]} »`);
        const o = { s: parNorm.get(norm(e.s)), i: parNorm.get(norm(e.i)), auc: e.auc, n: e.n, src: e.src };
        if (e.mecanisme) o.mec = e.mecanisme;
        if (e.ref) o.ref = e.ref;
        return o;
    });
}

function main() {
    const parNorm = chargerDcis();
    const { sortie: pred, nonApparies } = lirePredictions(parNorm);
    if (process.argv.includes('--rapport')) {
        console.log('Substrats non appariés :', [...nonApparies.substrat].sort().join(', '));
        console.log('Interacteurs non appariés :', [...nonApparies.interacteur].sort().join(', '));
        return;
    }
    const mes = lireMesures(parNorm);
    const tri = (a, b) => (a.s + '|' + (a.i || a.ctx)).localeCompare(b.s + '|' + (b.i || b.ctx), 'fr');
    const db = [...mes, ...pred].sort(tri);
    const sources = JSON.parse(fs.readFileSync(MESURES, 'utf8')).sources;
    const txt = `// ddi_pk.js — GÉNÉRÉ par tools/build_ddi_pk.cjs : ne pas éditer à la main.
// Rapports d'AUC (exposition du substrat avec / sans l'interacteur), lus par l'onglet AUC.
//   s   : substrat (DCI MASTER_DB)      i   : interacteur (DCI MASTER_DB)
//   ctx : interacteur qui est un contexte clinique (tabac), à la place de i
//   n   : 'mesure' (étude chez l'homme, RCP — référence dans ref) | 'non_source'
//         (valeur héritée sans référence traçable) | 'predit' (modèle DDI-Predictor)
//   p5/p95 : intervalle interindividuel de la prédiction ; dose : dose de l'interacteur
//   var : variante du substrat (énantiomère, prise à jeun) ; rem : remarques du site
// ${mes.length} valeurs mesurées ou héritées, ${pred.length} prédictions (seuil ≥ ${SEUIL_HAUSSE} ou ≤ ${SEUIL_BAISSE}).
const DDI_PK_SOURCES = ${JSON.stringify(sources, null, 1)};
const DDI_PK_REMARQUES = ${JSON.stringify(REMARQUES, null, 1)};
const DDI_PK_DB = [
${db.map(e => JSON.stringify(e)).join(',\n')}
];
`;
    if (process.argv.includes('--verifier')) {
        // Appelé par tests.js : ddi_pk.js doit être exactement ce que donnent ses sources.
        const actuel = fs.existsSync(SORTIE) ? fs.readFileSync(SORTIE, 'utf8') : '';
        if (actuel !== txt) { console.error('ddi_pk.js ne correspond plus à ses sources : relancer node tools/build_ddi_pk.cjs'); process.exit(1); }
        console.log('ddi_pk.js à jour');
        return;
    }
    fs.writeFileSync(SORTIE, txt);
    console.log(`ddi_pk.js : ${mes.length} mesurées/héritées +${pred.length} prédites = ${db.length} entrées, ${(txt.length / 1024).toFixed(0)} Ko`);
}

if (require.main === module) main();
module.exports = { decomposer, resoudre, norm, chargerDcis };
