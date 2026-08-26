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
    'BPCO': { age: 76, sexe: 'M', dfg: 58, comorbs: ['PAT_023', 'PAT_003'], flags: ['chkTabac'], meds: ['Tiotropium'] },
    'anticholinergique_charge': { age: 83, sexe: 'F', dfg: 60, meds: ['Oxybutynine', 'Amitriptyline', 'Hydroxyzine'] },
    'normal_temoin': { age: 78, sexe: 'M', dfg: 80, meds: ['Amlodipine'] },

    // ── Patients de COUVERTURE (dérivés automatiquement) ─────────────────────
    // Les 25 archétypes ci-dessus n'exerçaient que 70 des 247 règles
    // déclenchables (28 %). Ces cas sont dérivés mécaniquement des conditions
    // déclarées par les règles restées muettes (med_keys résolues via
    // matchesDrugClass, comorbidités, contextes ← cases à cocher, seuils bio),
    // puis VÉRIFIÉS : chacun déclenche réellement la ou les règles visées,
    // contrôlé par l'identifiant de règle et non par le titre — le moteur
    // fusionne et réécrit les titres au rendu.
    // Le nom encode les règles ciblées : cov_<ID>[_<ID2>].
    // Panel minimisé : tout dérivé dont la contribution était déjà assurée
    // ailleurs a été retiré. Couverture obtenue : 235/247 (95 %).
    'cov_EV_B01_EV_B02': {"age":82,"sexe":"F","comorbs":["PAT_003","PAT_002"],"bio":{"patientDFG":60},"meds":["Digoxine","Verapamil"]},
    'cov_EV_B05': {"age":82,"sexe":"F","comorbs":["PAT_005"],"bio":{"patientDFG":60},"meds":["Acebutolol"]},
    'cov_EV_B06': {"age":82,"sexe":"F","comorbs":["PAT_006"],"bio":{"patientDFG":60},"meds":["Amiodarone"]},
    'cov_EV_B07_EV_B09': {"age":82,"sexe":"F","comorbs":["PAT_005"],"bio":{"patientDFG":60,"patientK":2},"meds":["Furosemide","Hydrochlorothiazide"]},
    'cov_EV_B09b_EV_B10': {"age":82,"sexe":"F","comorbs":["PAT_005"],"flags":["chkIncontinence"],"bio":{"patientNa":117,"patientDFG":60},"meds":["Hydrochlorothiazide","Furosemide"]},
    'cov_EV_B11_EV_B13': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Methyldopa","Spironolactone","Benazepril"]},
    'cov_EV_B14_EV_B17': {"age":82,"sexe":"F","comorbs":["PAT_002","PAT_004"],"bio":{"patientDFG":60},"meds":["Sildenafil","Celecoxib"]},
    'cov_EV_B19_EV_B20': {"age":82,"sexe":"F","comorbs":["PAT_002"],"flags":["chkStenoseAortique"],"bio":{"patientDFG":60},"meds":["Celecoxib","Altizide"]},
    'cov_EV_B22_EV_PRISC_01': {"age":82,"sexe":"F","bio":{"patientK":2.5,"bioMg":-0.3,"patientDFG":60},"meds":["Digoxine","Nifedipine"]},
    'cov_EV_FORTA_02_EV_PIM_01': {"age":82,"sexe":"F","comorbs":["PAT_002"],"bio":{"patientDFG":60},"meds":["Digoxine","Dronedarone"]},
    'cov_EV_PIM_02_EV_N05': {"age":82,"sexe":"F","comorbs":["PAT_002"],"flags":["chkLqts"],"bio":{"patientDFG":60},"meds":["Flecainide","Citalopram"]},
    'cov_EV_N08_EV_N09': {"age":82,"sexe":"F","flags":["chkBrady","chkArret"],"bio":{"patientDFG":60},"meds":["Acebutolol","Digoxine","Verapamil"]},
    'cov_IN_M01': {"age":82,"sexe":"F","comorbs":["PAT_036"],"bio":{"patientDFG":60},"meds":[]},
    'cov_EV_C01_EV_C02': {"age":82,"sexe":"F","flags":["chkAspirineForte","chkSaignement"],"bio":{"patientDFG":60},"meds":["Acide acetylsalicylique","Acenocoumarol"]},
    'cov_EV_C06_EV_C10': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Ticlopidine","Celecoxib","Acenocoumarol"]},
    'cov_EV_C11_EV_C13': {"age":82,"sexe":"F","comorbs":["PAT_006"],"bio":{"patientDFG":60},"meds":["Acenocoumarol","Dabigatran","Diltiazem"]},
    'cov_EV_C14_EV_C17': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Apixaban","Amiodarone","Ginkgo biloba","Acenocoumarol"]},
    'cov_EV_FORTA_01': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Dipyridamole"]},
    // EV_D03 vise l'HTA SEVERE : la case « HTA non controlee » est desormais requise,
    // sans quoi la regle annoncait une hypertension severe jamais constatee.
    'cov_EV_D01_EV_D03': {"age":82,"sexe":"F","comorbs":["PAT_010","PAT_005"],"flags":["chkHtaNonControlee"],"bio":{"patientDFG":60},"meds":["Amitriptyline","Venlafaxine"]},
    'cov_EV_D04_EV_D06': {"age":82,"sexe":"F","flags":["chkHbp"],"bio":{"patientDFG":60,"patientNa":117},"meds":["Chlorpromazine","Citalopram"]},
    'cov_EV_D09_EV_D10': {"age":82,"sexe":"F","comorbs":["PAT_010","PAT_027"],"bio":{"patientDFG":60},"meds":["Alprazolam"]},
    'cov_EV_D11_EV_D16': {"age":82,"sexe":"F","comorbs":["PAT_027"],"bio":{"patientDFG":60},"meds":["Zolpidem","Amisulpride"]},
    'cov_EV_D17_EV_D18': {"age":82,"sexe":"F","flags":["chkBrady"],"bio":{"patientDFG":60},"meds":["Donépézil","Acebutolol"]},
    'cov_EV_D19_EV_D20': {"age":82,"sexe":"F","comorbs":["PAT_015","PAT_010"],"bio":{"patientDFG":60},"meds":["Memantine","Ginkgo biloba"]},
    'cov_EV_D21_EV_D22': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Chlorpromazine","Levodopa"]},
    'cov_EV_D25_EV_BEERS_01': {"age":82,"sexe":"F","comorbs":["PAT_027"],"bio":{"patientDFG":60},"meds":["Hydroxyzine","Meprobamate"]},
    'cov_EV_SF06': {"age":82,"sexe":"F","cfs":8,"comorbs":["PAT_010"],"flags":["patientFragile"],"bio":{"patientDFG":60},"meds":["Donépézil"]},
    'cov_EV_FORTA_04': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Doxepine"]},
    'cov_IN_D01_IN_D02': {"age":82,"sexe":"F","comorbs":["PAT_014"],"flags":["chkDepression"],"bio":{"patientDFG":60},"meds":[]},
    'cov_IN_D03_IN_D05': {"age":82,"sexe":"F","comorbs":["PAT_011","PAT_044"],"bio":{"patientDFG":60},"meds":[]},
    'cov_IN_D06_IN_J04': {"age":82,"sexe":"F","comorbs":["PAT_051","PAT_015"],"bio":{"patientDFG":60},"meds":[]},
    'cov_EV_E02_EV_E03': {"age":82,"sexe":"F","bio":{"patientDFG":13.5},"meds":["Dabigatran","Rivaroxaban"]},
    'cov_EV_E05': {"age":82,"sexe":"F","bio":{"patientDFG":9},"meds":["Colchicine"]},
    'cov_EV_E06': {"age":82,"sexe":"F","bio":{"patientDFG":27},"meds":["Metformine"]},
    'cov_EV_E07': {"age":82,"sexe":"F","bio":{"patientDFG":27},"meds":["Spironolactone"]},
    'cov_EV_E08': {"age":82,"sexe":"F","bio":{"patientDFG":40.5},"meds":["Nitrofurantoine"]},
    'cov_EV_E09_EV_E10': {"age":82,"sexe":"F","bio":{"patientDFG":27},"meds":["Alendronate","Methotrexate"]},
    'cov_IN_E01_IN_E03': {"age":82,"sexe":"F","comorbs":["PAT_029"],"bio":{"patientDFG":27,"bioCa":1.1,"bioHb":9},"meds":[]},
    'cov_IN_E04': {"age":82,"sexe":"F","comorbs":["PAT_029"],"bio":{"bioAlbuminurie":330,"patientDFG":60},"meds":[]},
    'cov_EV_F01_EV_F02': {"age":82,"sexe":"F","comorbs":["PAT_014"],"bio":{"patientDFG":60},"meds":["Metoclopramide","Omeprazole"]},
    'cov_EV_F03_EV_F05': {"age":82,"sexe":"F","comorbs":["PAT_021"],"flags":["chkConstipation"],"bio":{"patientDFG":60},"meds":["Verapamil","Beclometasone"]},
    'cov_EV_F07_EV_BEERS_04': {"age":82,"sexe":"F","flags":["chkDysphagie"],"bio":{"patientDFG":60},"meds":["Amisulpride","Metoclopramide"]},
    'cov_IN_F01_IN_F02': {"age":82,"sexe":"F","comorbs":["PAT_021"],"bio":{"patientDFG":60},"meds":["Acide acetylsalicylique"]},
    'cov_EV_G01_EV_G02': {"age":82,"sexe":"F","comorbs":["PAT_023"],"bio":{"patientDFG":60},"meds":["Aminophylline"]},
    'cov_EV_G03_EV_G04': {"age":82,"sexe":"F","comorbs":["PAT_033","PAT_023"],"bio":{"patientDFG":60},"meds":["Tiotropium","Alprazolam"]},
    'cov_EV_H01_EV_H03': {"age":82,"sexe":"F","comorbs":["PAT_021"],"flags":["chkArthrose"],"bio":{"patientDFG":60},"meds":["Celecoxib"]},
    'cov_EV_H06_EV_H07': {"age":82,"sexe":"F","comorbs":["PAT_024"],"bio":{"patientDFG":60},"meds":["Celecoxib","Beclometasone"]},
    'cov_EV_H09_EV_BEERS_03': {"age":82,"sexe":"F","flags":["chkArthrose"],"bio":{"patientDFG":60},"meds":["Buprenorphine","Methocarbamol"]},
    'cov_EV_I04_EV_I05': {"age":82,"sexe":"F","comorbs":["PAT_009"],"flags":["chkConstipation"],"bio":{"patientDFG":60},"meds":["Oxybutynine","Alfuzosine"]},
    'cov_EV_I06_IN_I01': {"age":82,"sexe":"F","comorbs":["PAT_005"],"flags":["chkHbp"],"bio":{"patientDFG":60},"meds":["Mirabegron"]},
    'cov_EV_J02_EV_J03': {"age":82,"sexe":"F","comorbs":["PAT_002","PAT_016"],"bio":{"patientDFG":60},"meds":["Pioglitazone","Propranolol"]},
    'cov_EV_J04_EV_J09': {"age":82,"sexe":"F","comorbs":["PAT_009"],"bio":{"patientDFG":60,"bioTsh":4},"meds":["Canagliflozin","Levothyroxine"]},
    'cov_EV_J10_EV_BEERS_02': {"age":82,"sexe":"F","flags":["chkInsulineSlidingScale"],"bio":{"patientDFG":60},"meds":["Desmopressine","Insuline aspart"]},
    'cov_EV_SF03_IN_J01': {"age":82,"sexe":"F","cfs":8,"comorbs":["PAT_016"],"flags":["patientFragile"],"bio":{"bioHba1c":7,"patientDFG":33,"bioAlbuminurie":33},"meds":["Metformine"]},
    'cov_IN_J02_IN_J03': {"age":82,"sexe":"F","comorbs":["PAT_017","PAT_018"],"bio":{"patientDFG":60},"meds":[]},
    'cov_EV_K03_EV_K04': {"age":82,"sexe":"F","comorbs":["PAT_009"],"flags":["chkChutes"],"bio":{"patientDFG":60},"meds":["Hydralazine","Zolpidem"]},
    'cov_EV_K05_EV_K06': {"age":82,"sexe":"F","flags":["chkChutes"],"bio":{"patientDFG":60},"meds":["Carbamazepine","Hydroxyzine"]},
    'cov_EV_K07_EV_K09': {"age":82,"sexe":"F","flags":["chkChutes"],"bio":{"patientDFG":60},"meds":["Buprenorphine","Doxazosine"]},
    'cov_EV_K10_EV_K12': {"age":82,"sexe":"F","flags":["chkChutes"],"bio":{"patientDFG":60},"meds":["Alfuzosine","Oxybutynine"]},
    'cov_EV_L05_EV_L06': {"age":82,"sexe":"F","flags":["chkAnorexie"],"bio":{"patientDFG":60},"meds":["Gabapentine","Nefopam"]},
    'cov_EV_SF01_EV_SF02': {"age":82,"sexe":"F","cfs":8,"comorbs":["PAT_009"],"flags":["patientFragile"],"bio":{"patientDFG":60},"meds":["Atorvastatine","Altizide"]},
    'cov_EV_SF07': {"age":82,"sexe":"F","cfs":8,"flags":["patientFragile"],"bio":{"patientDFG":60},"meds":["Fumarate ferreux"]},
    'cov_EV_SYND_043_EV_SYND_043b': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Tramadol","Citalopram","Linezolide"]},
    'cov_EV_SYND_044_EV_SYND_045': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Diazepam","Morphine","Celecoxib","Benazepril","Altizide"]},
    'cov_EV_SFGG_AD_02_EV_SFGG_AD_04': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Sertraline","Venlafaxine","Mianserine"]},
    'cov_EV_SFGG_AD_05_EV_SFGG_AD_06': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Agomelatine","Tianeptine"]},
    'cov_EV_SFGG_AD_07': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Sertraline","Ibuprofene"]},
    'cov_EV_SYND_049': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Prednisone"]},
    'cov_EV_N04': {"age":82,"sexe":"F","flags":["chkAlcool"],"bio":{"patientDFG":60},"meds":["Methotrexate"]},
    'cov_EV_N06_EV_N07': {"age":82,"sexe":"F","flags":["chkSepsis"],"bio":{"patientDFG":60},"meds":["Methotrexate","Celecoxib"]},
    'cov_SUP_PIMC_05_SUP_PIMC_06': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Acenocoumarol","Donépézil"]},
    'cov_SUP_PIMC_12_SUP_REM_01': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Atorvastatine","Ascorbate ferreux"]},
    'cov_SUP_REM_02_SUP_REM_03': {"age":82,"sexe":"F","cfs":8,"flags":["patientFragile"],"bio":{"patientDFG":60},"meds":["Carbonate de calcium","Donépézil"]},
    'cov_SUP_REM_04_SUP_REM_05': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Bisacodyl","Mebeverine"]},
    'cov_SUP_REM_07_SUP_REM_08': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Betahistine","Pentoxifylline"]},
    'cov_SUP_EU7_03_SUP_EU7_05': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Scopolamine","Loperamide"]},
    'cov_SUP_EU7_06_SUP_EU7_07': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Sucralfate","Paraffine"]},
    'cov_SUP_INT_001_SUP_INT_002': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Lithium","Benazepril","Phenytoine","Cotrimoxazole"]},
    'cov_SUP_INT_003_SUP_INT_004': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Aminophylline","Ciprofloxacine","Warfarine","Amiodarone"]},
    'cov_SUP_INT_005_SUP_INT_006': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Doxazosine","Furosemide","Colchicine","Clarithromycine"]},
    'cov_SUP_INT_009_SUP_INT_010': {"age":82,"sexe":"F","bio":{"patientDFG":60},"meds":["Warfarine","Citalopram","Digoxine","Amiodarone"]},
    // Regles gatees sur un contexte issu d'une PRECISION de saisie : l'outil de
    // couverture derive les contextes des cases a cocher et ne peut pas les produire.
    'cov_SUP_PEG_01': {"age":84,"sexe":"F","bio":{"patientDFG":60},"meds":["Macrogol","Furosemide"],"precisions":{"Macrogol":{"indication_peg":"preparation"}}},
    'cov_SUP_MTX_01': {"age":84,"sexe":"F","bio":{"patientDFG":60},"meds":["Methotrexate"],"precisions":{"Methotrexate":{"mtx_schema":"haute"}}}
};
// Onglets figés par le golden-master. `alertes-scores` et `alertes-synthese` ont été
// AJOUTÉS après avoir constaté qu'ils échappaient totalement au filet : la correction de
// la charge anticholinergique des voies inhalées ne produisait AUCUNE dérive, alors
// qu'elle changeait le score ACB de 2 à 0 sur plusieurs patients. Ces deux onglets
// portent les scores composites chiffrés (PIM global, CHA₂DS₂-VA, HAS-BLED, ORBIT,
// DOACscore, RISQ-PATH, Tisdale, ACB) et le verdict global du dossier.
// `alertes-guidelines` n'y figure pas volontairement : son contenu dépend des
// comorbidités et non de l'ordonnance, il serait redondant d'un patient à l'autre.
// Il est protégé par un instrument dédié — voir runPathologyRulesAudit.
const TABS_SIG = ['alertes-eviter', 'alertes-initier', 'alertes-bio', 'alertes-interact',
    'alertes-suivi', 'alertes-usage', 'alertes-scores', 'alertes-synthese'];

function signaturePatient(c) {
    const r = analyzeCase(c);
    const sig = {};
    TABS_SIG.forEach(t => {
        // La SÉVÉRITÉ est capturée avec le titre. Sans elle, un changement de gradation
        // reste invisible — c'était exactement le défaut de DUPLICATE_WATCH, qui codait
        // `warning` en dur pour toutes les classes de doublon sans que rien ne l'attrape.
        sig[t] = [...new Set((r[t] || [])
            .map(a => (a && a.severity ? a.severity : '?') + ' | ' + normTitre(a.titre))
            .filter(x => !/\| *$/.test(x)))].sort();
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
            'ESC', 'ESC_HTN_2024', 'ESC_HF', 'ESC_AF', 'ESMO', 'ACR', 'IOF', 'ICI', 'ERC', 'ATA 2014/ETA 2013', 'ATA 2016/ETA 2018', 'ILAE 2022',
            'SFGG_SF3PA_SFPC_2026',
            // Ajouts 2026 : omissions iSGLT2 (IN_E05), sevrage tabagique BPCO (IN_G03),
            // thiamine dans le trouble de l'usage de l'alcool (IN_N01).
            'ADA', 'NICE', 'EFNS']);
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
        // Association fixe : l'ARNI CONTIENT du valsartan — une règle visant les ARA2
        // doit bien s'appliquer à l'Entresto.
        'valsartan::sacubitrilvalsartan',
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
        // Ciprofloxacine : figée à 1 par une session antérieure, mais la LISTE
        // OFFICIELLE CredibleMeds fournie par le Dr Nunes la donne en Known Risk
        // (comme moxifloxacine et lévofloxacine). L'ancien appariement du test de
        // conformité, strictement anglais, sautait « Ciprofloxacine » et masquait
        // l'écart. La liste officielle fait foi → 3.
        'Ciprofloxacine': 3,
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
    // Appariement FR ↔ EN : la référence est en anglais (« Ciprofloxacin »), la
    // base en français (« Ciprofloxacine »). Un appariement strict sautait
    // SILENCIEUSEMENT 17 molécules — dont la ciprofloxacine (Known Risk classée
    // conditionnelle) et le dextrométhorphane (Possible Risk invisible). On
    // génère donc les variantes de graphie usuelles.
    const variants = (s) => {
        const b = norm(s); const out = new Set([b]);
        if (b.endsWith('e')) out.add(b.slice(0, -1)); else out.add(b + 'e');
        [['ine', 'in'], ['ene', 'en'], ['ide', 'id']].forEach(([fr, en]) => {
            if (b.endsWith(fr)) out.add(b.slice(0, -fr.length) + en);
        });
        return [...out];
    };
    JSON.parse(dump2).forEach(m => { variants(m.dci).forEach(v => { if (!byNorm[v]) byNorm[v] = m; }); });
    const qmis = [];
    Object.entries(qref).forEach(([name, cat]) => {
        let m = null;
        for (const v of variants(name)) { if (byNorm[v]) { m = byNorm[v]; break; } }
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

// ============================================================================
// RÉSOLUTION DES CLÉS DE RÈGLE — audit de collision par LIBELLÉ DE CLASSE
// ----------------------------------------------------------------------------
// `runCollisionAudit` appelle le matcheur avec `classe = ''` : il ne voit donc que
// les collisions de DCI (citalopram ⊂ escitalopram) et JAMAIS celles qui passent par
// le libellé de classe — or ce sont elles qui ont produit les faux positifs les plus
// coûteux : « paracetamol » ⊂ la classe du NÉFOPAM (« alternative paracétamol »),
// « calcique » ⊂ « … déficit calcique » (carbonate de calcium reconnu inhibiteur
// calcique ET antihypertenseur), « statine » ⊂ cila-STATINE, « fer » ⊂ calci-FÉR-ol.
//
// Cet audit fige, pour CHAQUE clé réellement employée par le corpus de règles, la
// liste des médicaments qu'elle résout — avec le vrai `classe`. Toute dérive
// (nouvelle molécule qui élargit une clé par accident) devient un échec de test.
// ============================================================================
// RECOMMANDATIONS PAR PATHOLOGIE — golden dédié
// ----------------------------------------------------------------------------
// L'onglet « guidelines » n'est pas dans le golden-master des patients : son contenu
// dépend des COMORBIDITÉS et non de l'ordonnance, il serait donc répété à l'identique
// d'un patient à l'autre. Il est figé ici, par PATHOLOGIE — représentation compacte et
// sans redondance, qui protège directement geria_pathology_rules_v3.js.
// Motivation concrète : l'ajout des agents stimulant l'érythropoïèse aux traitements
// de la MRC (PAT_029) n'a été détecté par AUCUN test.
function runPathologyRulesAudit(test, assert) {
    const { sandbox } = loadApp();
    const current = JSON.parse(vm.runInContext(`(function(){
        if (typeof PATHOLOGY_RULES_DB === 'undefined') return '{}';
        var out = {};
        for (var id in PATHOLOGY_RULES_DB) {
            var p = PATHOLOGY_RULES_DB[id] || {}, t = p.TRAITEMENTS || {};
            var classes = function(l){ return (l || []).map(function(x){ return x.classe || x.terme || '?'; }).sort(); };
            out[id] = {
                nom: p.NOM || '',
                initier: classes(t.INITIER),
                eviter: classes(t.EVITER),
                reference: p.REFERENCE || '',
                nb_sources: (p.SOURCES_EBM || []).length
            };
        }
        return JSON.stringify(out);
    })()`, sandbox));

    const goldenPath = path.join(__dirname, 'pathology_rules_golden.json');
    if (!fs.existsSync(goldenPath) || process.env.GOLDEN_UPDATE === '1') {
        fs.writeFileSync(goldenPath, JSON.stringify(current, null, 1));
        console.log('  ℹ️  Golden des règles par pathologie ' + (process.env.GOLDEN_UPDATE === '1' ? 'RÉGÉNÉRÉ' : 'CRÉÉ'));
        return;
    }
    const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
    const ids = new Set([...Object.keys(golden), ...Object.keys(current)]);
    ids.forEach(id => {
        test('Règles par pathologie — ' + id, () => {
            const g = golden[id], c = current[id];
            if (!g) return assert.ok(false, 'pathologie AJOUTÉE : ' + id + ' (' + (c.nom || '') + ')');
            if (!c) return assert.ok(false, 'pathologie SUPPRIMÉE : ' + id + ' (' + (g.nom || '') + ')');
            const diff = [];
            ['initier', 'eviter'].forEach(k => {
                const a = new Set(g[k] || []), b = new Set(c[k] || []);
                [...b].filter(x => !a.has(x)).forEach(x => diff.push('+' + k + ': ' + x));
                [...a].filter(x => !b.has(x)).forEach(x => diff.push('-' + k + ': ' + x));
            });
            if (g.reference !== c.reference) diff.push('référence : « ' + g.reference + ' » → « ' + c.reference + ' »');
            if (g.nb_sources !== c.nb_sources) diff.push('sources EBM : ' + g.nb_sources + ' → ' + c.nb_sources);
            assert.ok(diff.length === 0,
                (c.nom || id) + ' — contenu modifié (si voulu : GOLDEN_UPDATE=1) :\n  ' + diff.join('\n  '));
        });
    });
}

// ============================================================================
// RECHERCHE DE L'AUTOCOMPLÉTION — pas de correspondance à cheval sur deux mots
// ----------------------------------------------------------------------------
// Signalé en usage : taper « ains » dans le champ médicaments proposait le FENTANYL.
// Cause : le champ `princeps` est une LISTE de noms commerciaux, concaténée AVANT
// normalisation. « Effentora, Instanyl » devenait « effentorainstanyl », qui contient
// « ains ». Même famille que les collisions de sous-chaîne du moteur : une
// normalisation qui supprime les séparateurs, puis un match par sous-chaîne.
// Le même défaut existait côté comorbidités (« fa » remontait le syndrome coronarien).
function runAutocompleteAudit(test, assert) {
    const { sandbox } = loadApp();
    vm.runInContext('initUI()', sandbox);
    const cherche = (fn, q) => JSON.parse(vm.runInContext(
        `JSON.stringify(${fn}(${JSON.stringify(q)}).map(function(x){return x.display}))`, sandbox));

    test('Autocomplétion — « ains » ne propose aucun opioïde (jointure de princeps)', () => {
        const r = cherche('searchMedList', 'ains');
        assert.ok(!r.some(d => /fentanyl|morphine|oxycodone/i.test(d)),
            '« ains » remonte un opioïde : ' + r.join(', '));
    });
    test('Autocomplétion — les recherches légitimes fonctionnent toujours', () => {
        assert.ok(cherche('searchMedList', 'durogesic').includes('Fentanyl'), 'princeps Durogesic → Fentanyl');
        assert.ok(cherche('searchMedList', 'instanyl').includes('Fentanyl'), 'princeps Instanyl → Fentanyl');
        assert.ok(cherche('searchMedList', 'doliprane').includes('Paracetamol'), 'princeps Doliprane → Paracétamol');
        assert.ok(cherche('searchMedList', 'amlo').includes('Amlodipine'), 'préfixe de DCI');
    });
    test('Autocomplétion — une classe thérapeutique est cherchable', () => {
        // Taper « AINS » ou « IPP » doit lister la classe, APRÈS les molécules dont le nom
        // correspond — sinon une recherche précise se noie dans sa propre classe.
        const ains = cherche('searchMedList', 'ains');
        assert.ok(ains.length >= 10, '« ains » doit lister la classe : ' + ains.length + ' résultat(s)');
        assert.ok(ains.includes('Ibuprofene') && ains.includes('Diclofenac'), '« ains » → AINS attendus');
        assert.ok(cherche('searchMedList', 'ipp').includes('Omeprazole'), '« ipp » → IPP');
        assert.strictEqual(cherche('searchMedList', 'diclofenac')[0], 'Diclofenac', 'la molécule nommée reste en tête');
    });
    test('Autocomplétion — une requête courte matche en début de mot', () => {
        // « fa » ne doit pas remonter une pathologie via « in-FA-rctus ».
        const r = cherche('searchComorbList', 'fa');
        assert.ok(!r.some(d => /coronarien/i.test(d)), '« fa » remonte le syndrome coronarien : ' + r.join(', '));
        assert.ok(r.some(d => /Fibrillation/i.test(d)), '« fa » doit toujours remonter la fibrillation atriale');
        assert.ok(cherche('searchComorbList', 'diab').some(d => /Diabète/i.test(d)), '« diab » → diabète');
    });
}

// ============================================================================
// QUATRE INVARIANTS ISSUS DE L'AUDIT CROISÉ DES 106 DOSSIERS
// ----------------------------------------------------------------------------
// Ces quatre familles de défaut expliquaient à elles seules l'essentiel des
// divergences relevées. Un audit ponctuel les trouve une fois ; un invariant les
// empêche de revenir — y compris de la main de celui qui corrige. Deux fois pendant
// ce chantier, un test automatique a rattrapé ce qu'une relecture avait laissé passer.
// ============================================================================

// ─── 1. Le TITRE d'une règle doit être cohérent avec sa CONDITION ────────────
// Sept défauts d'une même famille avaient été trouvés à la main : EV_SF02b annonçait
// « sous antihypertenseur » et se déclenchait sur les ISRS ; EV_C04 affirmait « dans FA »
// sans aucune condition de comorbidité ; EV_L01 disait « pour douleur légère » sans
// vérifier la sévérité ; EV_D08 nommait « benzodiazépine » des Z-drugs ; EV_SYND_051
// annonçait « ≥ 2 médicaments » et se déclenchait dès un seul.
// Le linter compare le terrain NOMMÉ dans le titre au terrain réellement VÉRIFIÉ par la
// condition (comorbidités résolues en clair, contextes, fragilité, âge, biologie).
const TITRE_TERRAIN = [
    [/fibrillation|\bFA\b/i, /fibrillation|\bFA\b/i],
    [/diabèt/i, /diabèt/i],
    [/insuffisance cardiaque|HFrEF|FEVG réduite/i, /insuffisance cardiaque|HFrEF|HFpEF/i],
    [/ulcère|ulcere/i, /ulcère|ulcere|gastro-duod/i],
    [/glaucome/i, /glaucome/i],
    // « anti-Alzheimer » nomme la CLASSE DU MEDICAMENT, pas le terrain du patient :
    // le lookbehind evite ce faux positif (cf. SUP_REM_03).
    [/démence|demence|(?<!anti-)alzheimer/i, /démence|demence|alzheimer|cognitif/i],
    [/BPCO/i, /BPCO/i],
    [/cirrhose|hépatopathie/i, /cirrhose|hépatopathie|hepatique/i],
    [/parkinson/i, /parkinson/i],
    [/asthme/i, /asthme/i],
    [/ostéoporose|osteoporose/i, /ostéoporose|osteoporose/i],
    [/\bHBP\b/i, /HBP|prostat/i],
    [/épilepsie|epilepsie/i, /épilepsie|epilepsie/i],
    [/chuteur|chutes/i, /chute/i],
    [/dysphagie/i, /dysphagie/i],
    [/constipation/i, /constipation/i],
    [/délirium|delirium/i, /delirium|démence/i],
    [/alcool/i, /alcool/i],
    [/tabac|fumeur/i, /tabac/i],
    [/sepsis/i, /sepsis/i],
    [/rétention urinaire/i, /retention|HBP/i],
];
// Le terrain n'est un PRÉREQUIS que s'il suit un marqueur de condition. « Risque de
// délirium » énonce une conséquence, pas un prérequis — d'où ce filtre.
const TITRE_PRECONDITION = /(chez|si\b|avec|en cas de|dans (la|le|l')|sous|\+)\s/i;
const TITRE_COMPTE = ['acb_cumul', 'acb_seuil', 'acb_fort_min', 'qt_check', 'med_keys_2', 'med_keys_3'];

// Cas RELUS et acceptés. Toute NOUVELLE entrée doit être arbitrée, pas ajoutée d'office.
const TITRE_ALLOWLIST = new Map([
    ['EV_K03',       'Titre « chuteur / hypotension orthostatique » : les deux termes sont alternatifs et la comorbidité PAT_009 (hypotension orthostatique) est bien vérifiée.'],
    ['EV_L06',       'Titre « dénutrition OU hépatopathie » : la dénutrition est vérifiée, la branche hépatique reste à câbler — écart connu, sans sur-déclenchement.'],
    ['EV_SYND_047b', 'Le délirium est la CONSÉQUENCE annoncée, pas un prérequis ; la condition vérifie l\'âge et la charge anticholinergique forte.'],
    ['EV_N02',       'La base modélise « hépatopathie » sans granularité « cirrhose sévère » : la condition est plus large que le titre, non l\'inverse.'],
]);

function runTitreConditionAudit(test, assert) {
    const { sandbox } = loadApp();
    const regles = JSON.parse(vm.runInContext(`(function(){ var out=[];
        function scan(o){ if(!o||typeof o!=='object')return;
          if(o.id&&o.condition&&o.titre){
            var c=o.condition, voc=[];
            ['comorbs','comorbs_any','comorbs_absent'].forEach(function(k){ (c[k]||[]).forEach(function(p){
              voc.push(((MASTER_DB.PATHOLOGIES[p]||{}).NOM_STANDARD)||p); }); });
            ['contexte_clinique','contexte_clinique_any','contexte_clinique_absent'].forEach(function(k){
              var v=c[k]; if(typeof v==='string')voc.push(v);
              else if(Array.isArray(v))v.forEach(function(x){voc.push(x)}); });
            if(c.fragilite||c.fragile||c.frailty_exclude) voc.push('fragile fragilite');
            if(c.bio||c.bio_any) voc.push('BIOLOGIE');
            if(c.age_min||c.age_max) voc.push('AGE');
            out.push({id:o.id, titre:o.titre, voc:voc.join(' | '), cles:Object.keys(c)});
          }
          for(var k in o) if(typeof o[k]==='object') scan(o[k]); }
        if(typeof GERIA_RECOS_DB!=='undefined')scan(GERIA_RECOS_DB);
        if(typeof RECOS_SUPPLEMENT!=='undefined')scan(RECOS_SUPPLEMENT);
        return JSON.stringify(out); })()`, sandbox));

    const ecarts = [];
    regles.forEach(r => {
        if (/≥\s*\d+\s*(médicament|medicament|classe)/i.test(r.titre)
            && !r.cles.some(k => TITRE_COMPTE.includes(k))) {
            ecarts.push(r.id + ' : le titre annonce un NOMBRE de médicaments sans mécanisme de comptage — « ' + r.titre + ' »');
            return;
        }
        if (!TITRE_PRECONDITION.test(r.titre)) return;
        for (const [dansTitre, attendu] of TITRE_TERRAIN) {
            if (!dansTitre.test(r.titre)) continue;
            if (!attendu.test(r.voc)) {
                ecarts.push(r.id + ' : le titre affirme un terrain que la condition ne vérifie pas — « '
                    + r.titre + ' » / condition vérifie : ' + (r.voc || '(rien)'));
            }
            break;
        }
    });
    const nouveaux = ecarts.filter(e => !TITRE_ALLOWLIST.has(e.split(' :')[0]));
    test('Titre ↔ condition — aucune règle n\'affirme un terrain non vérifié', () => {
        assert.ok(nouveaux.length === 0,
            'règle(s) dont le titre promet plus que la condition (arbitrer, puis documenter dans TITRE_ALLOWLIST) :\n  '
            + nouveaux.join('\n  '));
    });
}

// ─── 2. Un garde-fou `med_absent` dont AUCUNE clé ne résout est inopérant ────
// C'était le défaut d'IN_E03 : les agents stimulant l'érythropoïèse n'étant pas en base,
// la règle ne pouvait pas voir un patient DÉJÀ traité et proposait d'en initier un.
// Plus fort que l'invariant général « aucune clé morte » : ici c'est la LISTE ENTIÈRE
// qui doit résoudre au moins un médicament, sinon la protection n'existe pas.
function runMedAbsentOperantAudit(test, assert) {
    const { sandbox } = loadApp();
    const morts = JSON.parse(vm.runInContext(`(function(){
        var meds=MASTER_DB.MEDICAMENTS.map(function(m){return {d:sanitizeText(m.dci),c:sanitizeText(m.classe||'')}});
        function resout(k){ var kk=sanitizeText(k);
          return meds.some(function(m){ try{ return matchesDrugClass(m.d,m.c,kk); }catch(e){ return false; } }); }
        var out=[];
        function scan(o){ if(!o||typeof o!=='object')return;
          if(o.id&&o.condition&&Array.isArray(o.condition.med_absent)&&o.condition.med_absent.length
             && !o.condition.med_absent.some(resout))
            out.push(o.id+' (med_absent : '+o.condition.med_absent.join(', ')+')');
          for(var k in o) if(typeof o[k]==='object') scan(o[k]); }
        if(typeof GERIA_RECOS_DB!=='undefined')scan(GERIA_RECOS_DB);
        if(typeof RECOS_SUPPLEMENT!=='undefined')scan(RECOS_SUPPLEMENT);
        return JSON.stringify(out); })()`, sandbox));
    test('Garde-fou med_absent — aucune règle ne peut recommander un traitement déjà prescrit', () => {
        assert.ok(morts.length === 0,
            'règle(s) dont AUCUNE clé med_absent ne résout : le garde-fou est inopérant, la règle propose '
            + 'd\'initier un traitement que le patient reçoit peut-être déjà.\n  ' + morts.join('\n  '));
    });
}

// ─── 3. Un libellé de classe ne doit pas faire capter une AUTRE molécule ────
// Trois des collisions de ce chantier ont été créées en RÉDIGEANT des libellés :
// « à distinguer des PAMORA » sur la naloxone, « dérivé PEGylé de la naloxone » sur le
// naloxégol, « alternative paracétamol » sur le néfopam. L'audit ne signale pas la simple
// mention d'une molécule voisine — fréquente et légitime — mais uniquement les cas où
// cette mention provoque une VRAIE fausse correspondance.
const LIBELLE_ALLOWLIST = new Set([
    // Formes ou sels d'une même substance, ou analogues de la même classe : tolérés.
    'Calcitriol::Alfacalcidol', 'Cholecalciferol::Alfacalcidol', 'Cholecalciferol::Calcifediol',
    'Cholecalciferol::Calcitriol', 'Calcitriol::Cholecalciferol',
    'Theophylline::Aminophylline',            // l'aminophylline EST de la théophylline salifiée
    'Diphenhydramine::Dimenhydrinate',        // le dimenhydrinate CONTIENT de la diphenhydramine
    'Sulfate ferreux::Fumarate ferreux',      // deux sels ferreux
    'Valproate::Valpromide',                  // deux sels de valproate
    'Latanoprost::Bimatoprost', 'Latanoprost::Travoprost', 'Brinzolamide::Dorzolamide',
    'Alendronate::Ibandronate', 'Risedronate::Ibandronate',
    'Salbutamol::Terbutaline', 'Captopril::Zofenopril', 'Lactulose::Lactitol',
    // Écarts CONNUS et assumés : molécules distinctes, même indication.
    'Allopurinol::Febuxostat', 'Lactulose::Macrogol',
    'Guaifenesine::Methocarbamol',
    'Carbonate de calcium::Alginate de sodium / bicarbonate',
]);
function runLibelleClasseAudit(test, assert) {
    const { sandbox } = loadApp();
    const paires = JSON.parse(vm.runInContext(`(function(){
        var meds=MASTER_DB.MEDICAMENTS.map(function(m){return {dci:m.dci,d:sanitizeText(m.dci),c:sanitizeText(m.classe||'')}});
        var out=[];
        meds.forEach(function(a){ meds.forEach(function(b){
          if(a===b || b.d.length<6) return;
          if(a.c.indexOf(b.d)<0) return;   // le libellé de A ne cite pas B
          if(a.d.indexOf(b.d)>=0) return;  // association fixe ou sel : le nom est dans la DCI
          var faux=false; try{ faux = matchesDrugClass(a.d,a.c,b.d); }catch(e){}
          if(faux) out.push(b.dci+'::'+a.dci);
        }); });
        return JSON.stringify(out); })()`, sandbox));
    const nouveaux = [...new Set(paires)].filter(p => !LIBELLE_ALLOWLIST.has(p));
    test('Libellé de classe — aucune NOUVELLE fausse correspondance', () => {
        assert.ok(nouveaux.length === 0,
            'un libellé de classe cite une molécule d\'une autre classe ET la fait capter par cette clé.\n'
            + 'Reformuler le libellé, ou ajouter à LIBELLE_ALLOWLIST si l\'analogie est légitime :\n  '
            + nouveaux.map(p => { const [cle, capte] = p.split('::');
                return 'la clé « ' + cle + ' » capte ' + capte; }).join('\n  '));
    });
}

// ─── 4. Aucun chemin de rendu ne code une couleur de sévérité en dur ────────
// DUPLICATE_WATCH écrivait `alert-warning` en dur pour TOUTES les classes de doublon :
// un doublon d'anticoagulants curatifs, qui est un never event, était gradué exactement
// comme un doublon de statines, et sortait du bloc « Action immédiate ». Le rendu
// court-circuitait le scoring. Cet audit est un cliquet : le nombre d'occurrences ne
// doit pas augmenter sans justification.
// warning 17 → 18 : encart NT-proBNP élevé SANS insuffisance cardiaque codée. Ce n'est
// pas une alerte issue d'une table (SYND_029 garde la sienne) mais un texte rédigé sur
// place — au même titre que l'insuffisance en vitamine D et les stades KDIGO juste
// au-dessus dans le fichier. Sa couleur ne court-circuite donc aucun scoring.
const COULEURS_EN_DUR_ATTENDUES = { danger: 8, warning: 18, info: 8 };
function runCouleurCodeeEnDurAudit(test, assert) {
    const src = fs.readFileSync(path.join(__dirname, 'app_analysis.js'), 'utf8');
    ['danger', 'warning', 'info'].forEach(niveau => {
        const n = (src.match(new RegExp('alert alert-' + niveau, 'g')) || []).length;
        test('Rendu — couleurs « ' + niveau +' » codées en dur (cliquet)', () => {
            assert.ok(n <= COULEURS_EN_DUR_ATTENDUES[niveau],
                n + ' occurrences de `alert-' + niveau + '` codées en dur dans app_analysis.js, contre '
                + COULEURS_EN_DUR_ATTENDUES[niveau] + ' attendues. Toute alerte issue d\'une TABLE de données '
                + 'doit tirer sa couleur de la sévérité de son entrée, pas d\'un littéral — sans quoi le rendu '
                + 'court-circuite le scoring (cf. DUPLICATE_WATCH).');
        });
    });
}

// ─── 5. Un commentaire d'interaction n'affirme pas une association non prescrite ──
// Une entrée `ddi_interact_v2` est affichée dès qu'UNE de ses `dcis` est présente,
// mais son `commentaire` est unique. Cinq entrées « Antipsychotiques » portaient un
// commentaire propre à la CLOZAPINE (« Miansérine + Clozapine : agranulocytose »,
// « Diazépam + Clozapine : collapsus mortel ») : un patient sous rispéridone lisait
// une phrase parlant d'un médicament qu'il ne prend pas. Le remède est de SCINDER
// l'entrée, pas de retirer l'information : la molécule citée obtient sa propre
// entrée avec sa propre `dcis`.
// N'alerte que sur une CONJONCTION explicite (« hôte + X » ou « X + hôte »), pas
// sur la simple citation d'un membre à titre d'exemple ou de référence.
const DDI_CONJONCTION_ALLOWLIST = new Set([
    // Citation d'une étude nommant le bras testé — l'information reste vraie
    // pour toute la classe, la molécule n'est nommée que comme source.
    'Gabapentine::morphine',      // Gomes BMJ 2017, bras « morphine + gabapentine »
    // Hedges explicites (« notamment », « NB : ») : la phrase se donne elle-même
    // comme un cas particulier, elle n'affirme pas l'association.
    'Lithium::haloperidol',       // « notamment Halopéridol + Lithium »
    'Mirtazapine::venlafaxine',   // « NB : … California Rocket Fuel »
    // Liste réduite à des sels de la molécule citée : la conjonction est vraie
    // pour tous les membres.
    'Topiramate::valproate',      // dcis = valproate + divalproex
]);
function runDdiCommentaireConjonctionAudit(test, assert) {
    const { sandbox } = loadApp();
    // NB : surtout PAS sanitizeText ici — il supprime le « + », donc la conjonction
    // ne pourrait jamais matcher et l'audit ne détecterait plus rien (défaut constaté
    // à la validation par mutation). On normalise accents et casse en gardant la
    // ponctuation qui porte le sens.
    const trouves = JSON.parse(vm.runInContext(`(function(){
        var out=[];
        function norm(s){ return String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase(); }
        MASTER_DB.MEDICAMENTS.forEach(function(m){
            var host = norm(m.dci);
            (m.ddi_interact_v2||[]).forEach(function(e){
                if(!Array.isArray(e.dcis) || e.dcis.length < 2) return;
                var txt = norm(e.commentaire||'');
                e.dcis.map(norm).filter(function(d){return d.length>5;}).forEach(function(d){
                    var re = new RegExp('(' + host + '[a-z]*\\\\s*\\\\+\\\\s*' + d + ')|(' + d + '\\\\s*\\\\+\\\\s*' + host + ')');
                    if(re.test(txt)) out.push(m.dci + '::' + d);
                });
            });
        });
        return JSON.stringify(out); })()`, sandbox));
    const nouveaux = [...new Set(trouves)].filter(p => !DDI_CONJONCTION_ALLOWLIST.has(p));
    test('Interactions — aucun commentaire n\'affirme une association non prescrite', () => {
        assert.ok(nouveaux.length === 0,
            'le commentaire d\'une entrée `ddi_interact_v2` affirme une association « A + B » alors que\n'
            + 'l\'entrée se déclenche pour d\'autres molécules que B — le patient lit une phrase citant un\n'
            + 'médicament qu\'il ne prend pas. SCINDER l\'entrée (donner à B sa propre `dcis`), ou ajouter\n'
            + 'à DDI_CONJONCTION_ALLOWLIST si la phrase se donne explicitement comme un cas particulier :\n  '
            + nouveaux.map(p => { const [hote, cite] = p.split('::');
                return 'entrée de « ' + hote +' » : commentaire affirmant l\'association avec « ' + cite + ' »'; }).join('\n  '));
    });
}

function runRuleKeyResolutionAudit(test, assert) {
    const { sandbox } = loadApp();
    const current = JSON.parse(vm.runInContext(`(function(){
        var keys = new Set();
        function harvest(o){ if(!o||typeof o!=='object')return; for(var k in o){ var v=o[k];
            if(/^(med_keys|med_keys_2|med_keys_3|med_absent)$/.test(k)&&Array.isArray(v))
                v.forEach(function(x){ if(typeof x==='string'&&x.trim())keys.add(sanitizeText(x)); });
            else if(typeof v==='object') harvest(v); } }
        if(typeof GERIA_RECOS_DB!=='undefined')harvest(GERIA_RECOS_DB);
        if(typeof RECOS_SUPPLEMENT!=='undefined')harvest(RECOS_SUPPLEMENT);
        var meds = MASTER_DB.MEDICAMENTS.map(function(m){
            return {dci:m.dci, ndci:sanitizeText(m.dci), nclasse:sanitizeText(m.classe||'')}; });
        var res = {};
        Array.from(keys).sort().forEach(function(key){
            var hit = [];
            meds.forEach(function(m){
                try { if (matchesDrugClass(m.ndci, m.nclasse, key)) hit.push(m.dci); } catch(e){}
            });
            res[key] = hit.sort();
        });
        return JSON.stringify(res);
    })()`, sandbox));
    const goldenPath = path.join(__dirname, 'rule_keys_golden.json');
    if (!fs.existsSync(goldenPath) || process.env.GOLDEN_UPDATE === '1') {
        fs.writeFileSync(goldenPath, JSON.stringify(current, null, 1));
        console.log('  ℹ️  Golden de résolution des clés de règle ' + (process.env.GOLDEN_UPDATE === '1' ? 'RÉGÉNÉRÉ' : 'CRÉÉ'));
        return;
    }
    const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
    const keys = new Set([...Object.keys(golden), ...Object.keys(current)]);
    keys.forEach(key => {
        test('Résolution de clé — ' + key, () => {
            const g = new Set(golden[key] || []), c = new Set(current[key] || []);
            const diff = [...c].filter(x => !g.has(x)).map(x => '+' + x)
                .concat([...g].filter(x => !c.has(x)).map(x => '-' + x));
            assert.ok(diff.length === 0,
                'la clé ne résout plus les mêmes médicaments (si voulu : GOLDEN_UPDATE=1) : ' + diff.join(', '));
        });
    });
    // Invariant permanent : une clé qui ne résout AUCUN médicament est morte.
    // (Les règles concernées doivent être corrigées ou mises en quarantaine explicite.)
    const mortes = Object.keys(current).filter(k => current[k].length === 0);
    test('Résolution de clé — aucune clé morte hors quarantaine', () => {
        const horsQuarantaine = mortes.filter(k => !CLES_MORTES_CONNUES.has(k));
        assert.ok(horsQuarantaine.length === 0,
            'clés ne résolvant aucun médicament : ' + horsQuarantaine.join(', '));
    });
}

// Clés mortes CONNUES et assumées : elles appartiennent à des règles déjà placées en
// SUPPLEMENT_QUARANTINE (app_analysis.js), dont l'état clinique déclencheur n'est pas
// modélisé (H. pylori actif, hypoxémie, oxygénothérapie, traitement antérieur arrêté,
// vaccination) ou dont le concept est couvert par une règle native. Elles ne doivent
// pas faire échouer l'audit, mais toute clé morte NOUVELLE doit le faire.
const CLES_MORTES_CONNUES = new Set([
    // ------------------------------------------------------------------------
    // MOLÉCULES ABSENTES DE MASTER_DB — la clé est CORRECTE, c'est la base qui est
    // incomplète. Elles restent inertes tant que la molécule n'est pas saisie ; si
    // l'utilisateur la tape en texte libre, le repli `dci.includes(key)` la reconnaît.
    // Les ajouter suppose la procédure complète de CLAUDE.md (§ « Ajout d'un
    // médicament ») : entrée MASTER_DB exhaustive, classe, interactions, surveillance.
    // Ne PAS les retirer d'ici sans avoir ajouté la molécule pour de bon.
    //
    // (a) Molécules NON COMMERCIALISÉES EN FRANCE ou retirées du marché — pour
    //     celles-là, corriger la RÈGLE en retirant la clé serait plus honnête que
    //     d'ajouter une molécule que le prescripteur ne peut pas prescrire.
    'cytisine',                               // sevrage tabagique — vente interdite en France
    'rosiglitazone',                          // EV_J02 — retirée du marché UE en 2010
    'chlorpropamide',                         // EV_J01 — non commercialisé en France
    'temazepam', 'eszopiclone',               // EV_D08 / EV_SYND_044 — non commercialisés en France
    'avanafil', 'vardenafil',                 // EV_B14 — IPDE5 (sildénafil et tadalafil sont en base)
    'ferrique',                               // SUP_REM_01 — sels ferriques ; seul le maltol ferrique
                                              //   existe par voie orale, sans commercialisation
                                              //   française retrouvée. Les sels FERREUX sont en base.
    'phosphalugel',                           // SUP_EU7_06 — nom commercial ; la molécule
                                              //   (phosphate d'aluminium) EST en base : corriger la clé
    //
    // (b) Molécules réelles, périphériques, non encore saisies
    'guanfacine', 'tertatolol',               // EV_B11 / EV_J03
    'josamycine',                             // SUP_INT_006 — macrolide
    'procyclidine', 'pramiracetam',           // EV_D13 / EV_D20
    'quinine',                                // EV_C14 (la base ne contient que la quinidine)
    'folinate',                               // IN_H09 / SUP_PIMC_04 — synonyme de l'acide folinique,
                                              //   qui EST en base depuis son ajout : la clé 'folinique'
                                              //   résout, 'folinate' reste à rattacher comme alias
    'aclidinium',                             // EV_G03 — la clé paraissait vivante uniquement parce
                                              //   qu'elle captait à tort le CLIDINIUM (antispasmodique) ;
                                              //   la séparation des classes LAMA a révélé qu'elle
                                              //   était morte depuis toujours
    //
    // (c) Artefacts d'import CSV dans des règles NON quarantainées
    'tripletherapieouquadritherapie',         // SUP_START_030 — H. pylori non modélisé
    'o2concentrateur15hj',                    // SUP_START_033 — oxygénothérapie non modélisée
    'thscombineoraloupatch',                  // SUP_STOP_051  — doublon de SUP_STOP_049
    'covid19marnousousunite',                 // SUP_START_059 — vaccination non modélisée
    'ketoprofenegel', 'ibuprofenetopique',    // SUP_CAUT_073 — formes topiques non distinguées
]);

// ============================================================================
// INTÉGRITÉ STRUCTURELLE DES BASES D'INTERACTIONS (Phase 3)
// ----------------------------------------------------------------------------
// Le thésaurus ANSM (ddi_general) est un export officiel : on ne vérifie pas son
// contenu contre la littérature (circulaire) mais son INTÉGRITÉ DE TRANSCRIPTION —
// et on la FIGE : couleur valide, cohérence libellé↔couleur, pas d'auto-paire,
// pas de description vide. Attrape toute entrée malformée ajoutée au fil de l'eau.
function runDdiIntegrityAudit(test, assert) {
    const { sandbox } = loadApp();
    const gen = JSON.parse(vm.runInContext('JSON.stringify(typeof DDI_GENERAL_DB!=="undefined"?DDI_GENERAL_DB:[])', sandbox));
    const merged = JSON.parse(vm.runInContext('JSON.stringify(typeof DDI_MERGED_DB!=="undefined"?DDI_MERGED_DB:[])', sandbox));
    const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').trim();
    const okColor = { danger: 1, warning: 1, info: 1 };

    test('ANSM — couleurs valides (danger/warning/info)', () => {
        const bad = gen.filter(d => d.couleur && !okColor[d.couleur]).map(d => d.d1 + '+' + d.d2);
        assert.ok(bad.length === 0, 'couleur invalide : ' + bad.slice(0, 10).join(', '));
    });
    test('ANSM — cohérence libellé de gravité ↔ couleur', () => {
        const bad = [];
        gen.forEach(d => (d.details || []).forEach(dt => {
            const l = norm(dt.level);
            let exp = null;
            if (/majeure|contreindication|deconseillee/.test(l)) exp = 'danger';
            else if (/surveillance|precaution|prendre en compte/.test(l)) exp = 'warning';
            if (exp && dt.couleur && dt.couleur !== exp) bad.push(`${d.d1}+${d.d2}:"${dt.level}"=${dt.couleur}≠${exp}`);
        }));
        assert.ok(bad.length === 0, bad.slice(0, 10).join(' | '));
    });
    test('ANSM — pas d\'auto-paire (d1==d2) ni d1/d2 manquant', () => {
        const bad = gen.filter(d => !d.d1 || !d.d2 || norm(d.d1) === norm(d.d2)).map((d, i) => (d.d1 || '?') + '+' + (d.d2 || '?'));
        assert.ok(bad.length === 0, bad.slice(0, 10).join(', '));
    });
    test('ANSM — aucune description vide', () => {
        const bad = [];
        gen.forEach(d => (d.details || []).forEach(dt => { if (!dt.desc || !String(dt.desc).trim()) bad.push(d.d1 + '+' + d.d2); }));
        assert.ok(bad.length === 0, bad.slice(0, 10).join(', '));
    });
    test('DDI PK (merged) — pas d\'auto-paire ni auc_ratio négatif', () => {
        const nm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const bad = merged.filter(d => (nm(d.perpetrator) && nm(d.perpetrator) === nm(d.victim)) || (d.auc_ratio != null && d.auc_ratio < 0))
            .map(d => d.perpetrator + '+' + d.victim);
        assert.ok(bad.length === 0, bad.slice(0, 10).join(', '));
    });
}

// ============================================================================
// COMPLÉTUDE POSOLOGIE (poso_ger / poso_ren) — Phase 4e
// ----------------------------------------------------------------------------
// Pas de base synthétique unique pour les adaptations gér./rénales (éparpillées
// RCP/KDIGO). À défaut de fixture, on FIGE la COMPLÉTUDE : chaque médoc doit avoir
// poso_ger ET poso_ren non vides, et un médoc à élimination rénale doit mentionner
// une adaptation (seuil DFG) OU dire explicitement « pas d'ajustement ».
function runPosologyCompletenessAudit(test, assert) {
    const { sandbox } = loadApp();
    const meds = JSON.parse(vm.runInContext(
        'JSON.stringify(MASTER_DB.MEDICAMENTS.map(function(m){return {dci:m.dci,classe:m.classe,pg:m.poso_ger,pr:m.poso_ren};}))', sandbox));
    test('Posologie — poso_ger et poso_ren jamais vides', () => {
        const bad = meds.filter(m => !m.pg || !String(m.pg).trim() || !m.pr || !String(m.pr).trim()).map(m => m.dci);
        assert.ok(bad.length === 0, 'poso vide : ' + bad.slice(0, 15).join(', '));
    });
    // Un médoc à élimination rénale notoire doit adresser le rénal (seuil OU « pas d'ajustement »).
    const RENAL = /aod|anti-xa|dabigatran|apixaban|rivaroxaban|edoxaban|metformin|gliptin|digoxin|lithium|colchicin|allopurinol|aminoglycos|gentamic|amikac|vancomyc|nitrofuranto|acyclovir|aciclovir|valaciclovir|gabapentin|pregabalin|sotalol|atenolol/i;
    const ADDR = /dfg|clcr|clairance|ml\/min|dialyse|insuffisance r[eé]nale|adapter|r[eé]duire|contre-indi|pas d.ajustement|elimination biliaire/i;
    test('Posologie — médocs à élimination rénale adressent le rénal', () => {
        const bad = meds.filter(m => RENAL.test(m.dci + ' ' + m.classe) && !ADDR.test(String(m.pr))).map(m => m.dci);
        assert.ok(bad.length === 0, 'élimination rénale sans mention d\'adaptation : ' + bad.join(', '));
    });
}

module.exports = { runExtendedAudits, runExtendedAudits2, runCollisionAudit, runQtReferenceAudit, runAnticholinergicAudit, runProteinBindingAudit, runCompositeScoreAudit, runClassMembershipAudit, runRuleKeyResolutionAudit, runPathologyRulesAudit, runAutocompleteAudit, runTitreConditionAudit, runMedAbsentOperantAudit, runLibelleClasseAudit, runCouleurCodeeEnDurAudit, runDdiCommentaireConjonctionAudit, runDdiIntegrityAudit, runPosologyCompletenessAudit, PANEL, signaturePatient };
