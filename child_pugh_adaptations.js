// ============================================================================
// CHILD_PUGH_ADAPTATIONS — Adaptations posologiques hépatiques par DCI
// Version 1.0 — Mars 2026
// ============================================================================
// Sources : RCP/SmPC, EASL 2024, UpToDate, Vidal, Thériaque
// Structure : clé = DCI normalisée (minuscules, sans accents)
//   A : { msg, ci (bool), reduire (bool) }
//   B : { msg, ci (bool), reduire (bool) }
//   C : { msg, ci (bool), reduire (bool) }
// ci = contre-indication absolue ; reduire = adaptation posologique requise
// ============================================================================

const CHILD_PUGH_ADAPTATIONS = {

    // ========================================================================
    // ANTICOAGULANTS
    // ========================================================================
    "apixaban": {
        src: "RCP Eliquis | EHRA 2021",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Utilisation avec prudence — données limitées. Pas de réduction systématique mais surveillance clinique renforcée.", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Coagulopathie cliniquement significative et risque hémorragique.", ci: true, reduire: false }
    },
    "rivaroxaban": {
        src: "RCP Xarelto | EHRA 2021",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Coagulopathie avec risque hémorragique cliniquement significatif.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "dabigatran": {
        src: "RCP Pradaxa | EHRA 2021",
        A: { msg: "Pas d'adaptation (élimination rénale prédominante)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale). Prudence si coagulopathie associée.", ci: false, reduire: false },
        C: { msg: "Non recommandé — Données insuffisantes. Coagulopathie probable.", ci: false, reduire: true }
    },
    "edoxaban": {
        src: "RCP Lixiana | EHRA 2021",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation nécessaire (données limitées, prudence)", ci: false, reduire: false },
        C: { msg: "Non recommandé — Pas de données.", ci: false, reduire: true }
    },
    "acenocoumarol": {
        src: "RCP Sintrom",
        A: { msg: "Sensibilité accrue — INR plus fréquent, titration prudente", ci: false, reduire: true },
        B: { msg: "Sensibilité très accrue — Réduction de dose, INR 2x/semaine minimum", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Synthèse des facteurs de coagulation effondrée, risque hémorragique majeur.", ci: true, reduire: false }
    },
    "warfarine": {
        src: "RCP Coumadine",
        A: { msg: "Sensibilité accrue — INR plus fréquent", ci: false, reduire: true },
        B: { msg: "Sensibilité très accrue — Réduction de dose, surveillance INR rapprochée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Coagulopathie hépatique.", ci: true, reduire: false }
    },
    "fluindione": {
        src: "RCP Préviscan | ANSM 2018",
        A: { msg: "Sensibilité accrue aux AVK — INR rapproché", ci: false, reduire: true },
        B: { msg: "Réduction de dose nécessaire — INR rapproché", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // ANTIAGRÉGANTS
    // ========================================================================
    "clopidogrel": {
        src: "RCP Plavix",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Le clopidogrel est une prodrogue métabolisée par le foie (CYP2C19). Activité potentiellement réduite.", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Coagulopathie hépatique + risque hémorragique. Métabolisation compromise.", ci: true, reduire: false }
    },

    // ========================================================================
    // CARDIOVASCULAIRE
    // ========================================================================
    "amiodarone": {
        src: "RCP Cordarone",
        A: { msg: "Prudence — Hépatotoxicité intrinsèque, bilan hépatique rapproché", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité intrinsèque majeure sur foie déjà atteint.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "atorvastatine": {
        src: "RCP | ESC/EAS 2019",
        A: { msg: "Dose réduite recommandée (10-20 mg). Bilan hépatique avant et à 3 mois.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Transaminases > 3N ou maladie hépatique active.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "rosuvastatine": {
        src: "RCP | ESC/EAS 2019",
        A: { msg: "Dose réduite (5-10 mg). Bilan hépatique de surveillance.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Maladie hépatique active.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "simvastatine": {
        src: "RCP | ESC/EAS 2019",
        A: { msg: "Dose réduite (10-20 mg max). Bilan hépatique rapproché.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Maladie hépatique active.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "pravastatine": {
        src: "RCP | ESC/EAS 2019",
        A: { msg: "Dose réduite (10-20 mg). Statine hydrophile, moins hépatotoxique.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Maladie hépatique active.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "losartan": {
        src: "RCP Cozaar",
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Réduire la dose initiale à 25 mg/j (prodrogue : métabolisme hépatique CYP2C9/3A4)", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données insuffisantes, métabolisation compromise.", ci: false, reduire: true }
    },
    "carvedilol": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Biodisponibilité augmentée. Débuter à faible dose.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "propranolol": {
        src: "RCP",
        A: { msg: "Biodisponibilité augmentée — Réduire de 50%", ci: false, reduire: true },
        B: { msg: "Biodisponibilité très augmentée — Réduire de 50-75%. Surveillance FC/TA.", ci: false, reduire: true },
        C: { msg: "Utilisation très prudente — Dose minimale. Risque d'accumulation majeur.", ci: false, reduire: true }
    },
    "amlodipine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Débuter à 2.5 mg/j — Demi-vie prolongée en IHC", ci: false, reduire: true },
        C: { msg: "Débuter à 2.5 mg/j — Titration très prudente", ci: false, reduire: true }
    },
    "nifedipine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Métabolisme hépatique CYP3A4, biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "Non recommandé — Accumulation", ci: false, reduire: true }
    },
    "diltiazem": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Biodisponibilité augmentée (CYP3A4)", ci: false, reduire: true },
        C: { msg: "Éviter si possible — Risque d'accumulation", ci: false, reduire: true }
    },
    "verapamil": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire dose de 50% — Biodisponibilité orale très augmentée (fort effet de premier passage)", ci: false, reduire: true },
        C: { msg: "Réduire dose de 70-80% — Surveillance rapprochée", ci: false, reduire: true }
    },
    "digoxine": {
        src: "RCP Digoxine | ESC HF 2023",
        A: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale), mais attention à l'hypoalbuminémie → fraction libre augmentée", ci: false, reduire: false },
        C: { msg: "Prudence — Hypoalbuminémie majeure augmente la fraction libre. Dosage digoxinémie libre si possible.", ci: false, reduire: true }
    },

    // ========================================================================
    // ANTIDIABÉTIQUES
    // ========================================================================
    "metformine": {
        src: "RCP Glucophage | ADA/EASD 2022",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Non recommandée — Risque d'acidose lactique accru (métabolisme lactate hépatique altéré)", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque majeur d'acidose lactique", ci: true, reduire: false }
    },
    "glibenclamide": {
        src: "RCP",
        A: { msg: "Prudence — Risque d'hypoglycémie augmenté (gluconéogenèse réduite)", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Risque majeur d'hypoglycémie prolongée", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "gliclazide": {
        src: "RCP Diamicron",
        A: { msg: "Prudence — Surveillance glycémique renforcée", ci: false, reduire: true },
        B: { msg: "Non recommandé — Risque d'hypoglycémie accru", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque d'hypoglycémie sévère", ci: true, reduire: false }
    },
    "glimepiride": {
        src: "RCP Amarel",
        A: { msg: "Prudence — Surveillance glycémique", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Risque d'hypoglycémie prolongée", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "sitagliptine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        C: { msg: "Données insuffisantes — Non recommandé", ci: false, reduire: true }
    },
    "linagliptine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation (élimination biliaire/intestinale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation nécessaire (données limitées)", ci: false, reduire: false }
    },
    "empagliflozin": {
        src: "RCP | ESC HF 2023",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation, exposition augmentée mais cliniquement non significative", ci: false, reduire: false },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },
    "dapagliflozin": {
        src: "RCP | ESC HF 2023",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation", ci: false, reduire: false },
        C: { msg: "Débuter à 5 mg — Données limitées, exposition augmentée", ci: false, reduire: true }
    },
    "pioglitazone": {
        src: "RCP Actos",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité documentée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité", ci: true, reduire: false }
    },
    "repaglinide": {
        src: "RCP NovoNorm",
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Prudence — Réduction de dose, surveillance glycémique", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // SNC — Antidépresseurs
    // ========================================================================
    "sertraline": {
        src: "RCP | NICE Depression 2022",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose ou allonger l'intervalle. Débuter à 25 mg.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ (RCP)", ci: true, reduire: false }
    },
    "citalopram": {
        src: "RCP | NICE Depression 2022",
        A: { msg: "Pas d'adaptation (max 20 mg/j si > 65 ans)", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j — Clairance réduite de 37%", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },
    "escitalopram": {
        src: "RCP | NICE Depression 2022",
        A: { msg: "Pas d'adaptation (max 10 mg/j si > 65 ans)", ci: false, reduire: false },
        B: { msg: "Dose max 10 mg/j — Débuter à 5 mg/j", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "paroxetine": {
        src: "RCP | NICE Depression 2022",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j — Concentrations augmentées", ci: false, reduire: true },
        C: { msg: "Dose max 20 mg/j, débuter à 10 mg — Prudence extrême", ci: false, reduire: true }
    },
    "fluoxetine": {
        src: "RCP | NICE Depression 2022",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire dose ou allonger l'intervalle — Demi-vie très longue (norfluoxétine aggravée)", ci: false, reduire: true },
        C: { msg: "Non recommandé — Accumulation majeure", ci: false, reduire: true }
    },
    "mirtazapine": {
        src: "RCP | NICE Depression 2022",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Clairance réduite de ~35% — Prudence, débuter à 15 mg", ci: false, reduire: true },
        C: { msg: "Clairance réduite de ~35% — Dose minimale, surveillance rapprochée", ci: false, reduire: true }
    },
    "venlafaxine": {
        src: "RCP | NICE Depression 2022",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose de 50%", ci: false, reduire: true },
        C: { msg: "Réduire la dose de 50% ou plus — Prudence extrême", ci: false, reduire: true }
    },
    "duloxetine": {
        src: "RCP | NICE Depression 2022",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ (RCP — hépatotoxicité documentée)", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "amitriptyline": {
        src: "RCP | NICE Depression 2022",
        A: { msg: "Prudence — Métabolisme hépatique. Réduction de dose recommandée.", ci: false, reduire: true },
        B: { msg: "Réduction significative de dose — Accumulation", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque d'accumulation et cardiotoxicité", ci: true, reduire: false }
    },

    // ========================================================================
    // SNC — Benzodiazépines & Hypnotiques
    // ========================================================================
    "lorazepam": {
        src: "RCP | HAS 2015 BZD",
        A: { msg: "Pas d'adaptation (glucuroconjugaison, pas de CYP)", ci: false, reduire: false },
        B: { msg: "BZD de choix en IHC — Glucuroconjugaison préservée. Réduire quand même de 50%.", ci: false, reduire: true },
        C: { msg: "Réduire de 50% minimum — Sédation prolongée possible malgré glucuroconjugaison.", ci: false, reduire: true }
    },
    "oxazepam": {
        src: "RCP | HAS 2015 BZD",
        A: { msg: "Pas d'adaptation (glucuroconjugaison, pas de CYP)", ci: false, reduire: false },
        B: { msg: "BZD de choix en IHC — Pas de métabolites actifs. Réduire la dose.", ci: false, reduire: true },
        C: { msg: "Réduire de 50% — Demi-vie peut être prolongée", ci: false, reduire: true }
    },
    "diazepam": {
        src: "RCP | HAS 2015 BZD",
        A: { msg: "Prudence — Demi-vie déjà longue", ci: false, reduire: true },
        B: { msg: "ÉVITER — Demi-vie très prolongée (>100h), métabolites actifs accumulés", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Accumulation majeure, coma possible", ci: true, reduire: false }
    },
    "alprazolam": {
        src: "RCP | HAS 2015 BZD",
        A: { msg: "Prudence — Métabolisme CYP3A4", ci: false, reduire: true },
        B: { msg: "Réduire de 50% — Demi-vie prolongée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Accumulation", ci: true, reduire: false }
    },
    "zolpidem": {
        src: "RCP | HAS 2015 BZD",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 5 mg — Biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "zopiclone": {
        src: "RCP | HAS 2015 BZD",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 3.75 mg — Biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque d'encéphalopathie hépatique", ci: true, reduire: false }
    },

    // ========================================================================
    // SNC — Antipsychotiques
    // ========================================================================
    "haloperidol": {
        src: "RCP | NICE Psychosis 2014",
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Réduire la dose de 50% — Métabolisme hépatique CYP3A4/2D6", ci: false, reduire: true },
        C: { msg: "Non recommandé — Risque d'accumulation et d'encéphalopathie", ci: false, reduire: true }
    },
    "risperidone": {
        src: "RCP | NICE Psychosis 2014",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à dose réduite — Fraction libre augmentée", ci: false, reduire: true },
        C: { msg: "Données insuffisantes — Non recommandé", ci: false, reduire: true }
    },
    "quetiapine": {
        src: "RCP | NICE Psychosis 2014",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 25 mg/j — Clairance réduite de 30%", ci: false, reduire: true },
        C: { msg: "Débuter à 25 mg/j — Titration très lente", ci: false, reduire: true }
    },
    "olanzapine": {
        src: "RCP | NICE Psychosis 2014",
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Débuter à 5 mg — Prudence", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "aripiprazole": {
        src: "RCP | NICE Psychosis 2014",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        C: { msg: "Données insuffisantes", ci: false, reduire: false }
    },

    // ========================================================================
    // SNC — Antiépileptiques
    // ========================================================================
    "levetiracetam": {
        src: "RCP | NICE Epilepsy 2022",
        A: { msg: "Pas d'adaptation (élimination rénale prédominante)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        C: { msg: "Réduire de 50% la dose si atteinte hépatique sévère avec atteinte rénale associée", ci: false, reduire: true }
    },
    "lamotrigine": {
        src: "RCP | NICE Epilepsy 2022",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose initiale et d'entretien de 50%", ci: false, reduire: true },
        C: { msg: "Réduire la dose initiale et d'entretien de 75%", ci: false, reduire: true }
    },
    "valproate": {
        src: "RCP | NICE Epilepsy 2022",
        A: { msg: "Prudence — Hépatotoxicité intrinsèque. Bilan hépatique rapproché.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité dose-dépendante majeure", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "carbamazepine": {
        src: "RCP | NICE Epilepsy 2022",
        A: { msg: "Prudence — Métabolisme hépatique CYP3A4, inducteur. Bilan hépatique.", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité, métabolisme altéré", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "phenytoine": {
        src: "RCP | NICE Epilepsy 2022",
        A: { msg: "Dosage plasmatique obligatoire — Fraction libre augmentée si hypoalbuminémie", ci: false, reduire: true },
        B: { msg: "Dosage de la fraction libre obligatoire — Très forte liaison albumine. Toxicité à doses thérapeutiques.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Cinétique imprévisible", ci: true, reduire: false }
    },
    "gabapentine": {
        src: "RCP | NICE Epilepsy 2022",
        A: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false }
    },
    "pregabaline": {
        src: "RCP | NICE Epilepsy 2022",
        A: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false }
    },

    // ========================================================================
    // ANTALGIQUES
    // ========================================================================
    "paracetamol": {
        src: "RCP | HAS 2022",
        A: { msg: "Dose max 3 g/j (au lieu de 4 g)", ci: false, reduire: true },
        B: { msg: "Dose max 2 g/j — Risque d'hépatotoxicité accru. Espacement ≥ 8h.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque d'insuffisance hépatique aiguë sur chronique (ACLF)", ci: true, reduire: false }
    },
    "tramadol": {
        src: "RCP | SFETD 2020",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire dose et allonger intervalle (12h). Formes LP 50 mg max.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Métabolisme altéré, risque de convulsions", ci: true, reduire: false }
    },
    "codeine": {
        src: "RCP | SFETD 2020",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire dose — Prodrogue (CYP2D6), métabolisation variable", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Encéphalopathie hépatique", ci: true, reduire: false }
    },
    "morphine": {
        src: "RCP | SFETD 2020",
        A: { msg: "Prudence — Biodisponibilité orale augmentée (premier passage réduit)", ci: false, reduire: true },
        B: { msg: "Réduire la dose de 50% minimum — Biodisponibilité doublée, demi-vie prolongée", ci: false, reduire: true },
        C: { msg: "Utilisation très prudente — Dose minimale, espacement maximal. Risque d'encéphalopathie hépatique.", ci: false, reduire: true }
    },
    "oxycodone": {
        src: "RCP | SFETD 2020",
        A: { msg: "Débuter à dose réduite (2.5-5 mg)", ci: false, reduire: true },
        B: { msg: "Réduire la dose de 50-75% — AUC augmentée de 95%", ci: false, reduire: true },
        C: { msg: "Non recommandé — Accumulation majeure, risque de dépression respiratoire", ci: false, reduire: true }
    },
    "fentanyl": {
        src: "RCP | SFETD 2020",
        A: { msg: "Pas d'adaptation habituelle (transdermique)", ci: false, reduire: false },
        B: { msg: "Réduire dose de 50% — Clairance diminuée", ci: false, reduire: true },
        C: { msg: "Non recommandé — Accumulation imprévisible", ci: false, reduire: true }
    },

    // ========================================================================
    // ANTI-INFECTIEUX
    // ========================================================================
    "metronidazole": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose de 50% — Demi-vie prolongée (CYP2A6/réductases hépatiques)", ci: false, reduire: true },
        C: { msg: "Réduire la dose de 50% minimum — Risque neurotoxicité accru", ci: false, reduire: true }
    },
    "fluconazole": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Hépatotoxicité possible, bilan hépatique rapproché", ci: false, reduire: false },
        C: { msg: "Prudence extrême — Hépatotoxicité. Utiliser uniquement si bénéfice > risque.", ci: false, reduire: true }
    },

    // ========================================================================
    // GASTRO — IPP
    // ========================================================================
    "omeprazole": {
        src: "RCP | SNFGE 2018",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j — Biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "Dose max 10-20 mg/j — Prudence", ci: false, reduire: true }
    },
    "esomeprazole": {
        src: "RCP | SNFGE 2018",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j", ci: false, reduire: true },
        C: { msg: "Dose max 20 mg/j — Non dépasser", ci: false, reduire: true }
    },
    "lansoprazole": {
        src: "RCP | SNFGE 2018",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 15 mg/j — Clairance réduite", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "pantoprazole": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j", ci: false, reduire: true },
        C: { msg: "Dose max 20 mg/j — Un jour sur deux si sévère", ci: false, reduire: true }
    },

    // ========================================================================
    // UROGÉNITAL
    // ========================================================================
    "tamsulosine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (données limitées)", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ (RCP)", ci: true, reduire: false }
    },
    "silodosine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (données limitées)", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Non étudié", ci: true, reduire: false }
    },
    "solifenacine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 5 mg/j", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // ENDOCRINE — Thyroïde
    // ========================================================================
    "levothyroxine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation — Absorption digestive, pas de métabolisme hépatique de 1er passage", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation habituelle — Mais TBG peut varier, surveillance TSH renforcée", ci: false, reduire: false },
        C: { msg: "Surveillance TSH renforcée — TBG diminuée → fraction libre augmentée", ci: false, reduire: false }
    },
    "thiamazole": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Hépatotoxicité cholestatique possible. Bilan hépatique rapproché.", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité", ci: true, reduire: false }
    },
    "carbimazole": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Prodrogue du thiamazole, hépatotoxicité", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // ANTI-GOUTTEUX
    // ========================================================================
    "allopurinol": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 100 mg — Titration prudente, bilan hépatique", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données limitées, hépatotoxicité possible", ci: false, reduire: true }
    },
    "febuxostat": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 80 mg/j — Prudence", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },
    "colchicine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Réduire la dose — Surveillance rapprochée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque de toxicité sévère", ci: true, reduire: false }
    },

    // ========================================================================
    // DIVERS
    // ========================================================================
    "methotrexate": {
        src: "RCP",
        A: { msg: "Prudence — Bilan hépatique avant et mensuel", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité cumulative + fibrose hépatique", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "azathioprine": {
        src: "RCP",
        A: { msg: "Prudence — Bilan hépatique rapproché", ci: false, reduire: false },
        B: { msg: "Réduire la dose — Hépatotoxicité dose-dépendante", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "spironolactone": {
        src: "RCP | ESC HF 2023",
        A: { msg: "Pas d'adaptation (utilisée dans l'ascite cirrhotique)", ci: false, reduire: false },
        B: { msg: "Dose initiale 50-100 mg/j pour ascite — Surveillance K+", ci: false, reduire: false },
        C: { msg: "Dose initiale 100 mg/j pour ascite — Prudence hyperkaliémie + encéphalopathie", ci: false, reduire: false }
    },
    "furosemide": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 20-40 mg/j — Surveillance ionogramme rapprochée, risque d'encéphalopathie hépatique", ci: false, reduire: true },
        C: { msg: "Débuter à 20 mg/j — Association spironolactone. Risque d'encéphalopathie hépatique si diurèse trop rapide.", ci: false, reduire: true }
    },

    // ========================================================================
    // IEC (Inhibiteurs de l'Enzyme de Conversion)
    // ========================================================================
    "ramipril": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation habituelle (élimination rénale prédominante)", ci: false, reduire: false },
        C: { msg: "Prudence — Données limitées. Surveiller TA et K+.", ci: false, reduire: false }
    },
    "perindopril": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation — Élimination rénale. Prudence TA.", ci: false, reduire: false }
    },
    "enalapril": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prodrogue (énalaprilat) — Conversion hépatique. Prudence si IHC sévère.", ci: false, reduire: false },
        C: { msg: "Prodrogue — Conversion hépatique potentiellement réduite. Préférer un IEC non prodrogue (lisinopril, captopril).", ci: false, reduire: true }
    },
    "lisinopril": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (pas de métabolisme hépatique, pas de prodrogue)", ci: false, reduire: false },
        C: { msg: "IEC de choix en IHC — Pas de métabolisme hépatique.", ci: false, reduire: false }
    },
    "captopril": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (pas de prodrogue)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation. Surveiller TA.", ci: false, reduire: false }
    },

    // ========================================================================
    // ARA2 (Antagonistes des Récepteurs de l'Angiotensine II)
    // ========================================================================
    "valsartan": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 80 mg/j — Biodisponibilité doublée en IHC", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ (cholestase biliaire)", ci: true, reduire: false }
    },
    "candesartan": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 4 mg/j — Prudence (prodrogue, métabolisme hépatique)", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ (cholestase biliaire sévère)", ci: true, reduire: false }
    },
    "irbesartan": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation habituelle (données limitées)", ci: false, reduire: false },
        C: { msg: "Prudence — Données insuffisantes", ci: false, reduire: false }
    },
    "telmisartan": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 40 mg/j — Excrétion biliaire, accumulation possible", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Obstruction biliaire", ci: true, reduire: false }
    },
    "olmesartan": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j — Prudence", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },

    // ========================================================================
    // BÊTABLOQUANTS COURANTS (manquants)
    // ========================================================================
    "bisoprolol": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation habituelle — 50% élimination rénale", ci: false, reduire: false },
        C: { msg: "Débuter à dose faible — Demi-vie peut être prolongée", ci: false, reduire: true }
    },
    "metoprolol": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose — Biodisponibilité augmentée (fort premier passage hépatique CYP2D6)", ci: false, reduire: true },
        C: { msg: "Réduire de 50% minimum — Biodisponibilité très augmentée", ci: false, reduire: true }
    },
    "nebivolol": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Métabolisme hépatique CYP2D6. Débuter à 1.25 mg.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ (RCP)", ci: true, reduire: false }
    },
    "atenolol": {
        src: "RCP",
        A: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale prédominante)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation rénale. Mais prudence hémodynamique.", ci: false, reduire: false }
    },
    "sotalol": {
        src: "RCP",
        A: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale prédominante)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation — Mais prudence QTc en IHC (hypokaliémie).", ci: false, reduire: false }
    },
    "acebutolol": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Métabolisme hépatique", ci: false, reduire: true },
        C: { msg: "Prudence — Réduction de dose", ci: false, reduire: true }
    },

    // ========================================================================
    // ANTIBIOTIQUES COURANTS
    // ========================================================================
    "amoxicilline": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation — Mais surveiller bilan hépatique si association acide clavulanique", ci: false, reduire: false }
    },
    "azithromycine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Hépatotoxicité possible. Bilan hépatique.", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité documentée, métabolisation hépatique", ci: true, reduire: false }
    },
    "clarithromycine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Métabolisme hépatique CYP3A4, interactions multiples", ci: false, reduire: false },
        C: { msg: "Non recommandé — Hépatotoxicité, accumulation. Préférer azithromycine (si CP B) ou autre classe.", ci: false, reduire: true }
    },
    "ciprofloxacine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation habituelle (double élimination rénale/hépatique)", ci: false, reduire: false },
        C: { msg: "Prudence — Réduire si IRC associée", ci: false, reduire: false }
    },
    "levofloxacine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale prédominante)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation", ci: false, reduire: false }
    },
    "doxycycline": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Excrétion biliaire. Pas de réduction de dose systématique.", ci: false, reduire: false },
        C: { msg: "Prudence — Demi-vie peut être prolongée si excrétion biliaire réduite", ci: false, reduire: false }
    },
    "rifampicine": {
        src: "RCP",
        A: { msg: "Prudence — Hépatotoxicité intrinsèque. Bilan hépatique à J0, J15, M1.", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité majeure sur foie atteint", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité sévère", ci: true, reduire: false }
    },
    "isoniazide": {
        src: "RCP",
        A: { msg: "Prudence — Hépatotoxicité dose-dépendante. Bilan hépatique rapproché.", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité majeure (acétylation hépatique)", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // ANTIFONGIQUES
    // ========================================================================
    "itraconazole": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Métabolisme hépatique CYP3A4 extensif. Bilan hépatique rapproché.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité, accumulation", ci: true, reduire: false }
    },
    "ketoconazole": {
        src: "RCP",
        A: { msg: "Prudence — Hépatotoxicité intrinsèque", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité sévère documentée", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "voriconazole": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose de charge standard, dose d'entretien réduite de 50%", ci: false, reduire: true },
        C: { msg: "Dose d'entretien réduite de 50% — Surveillance rapprochée taux plasmatiques", ci: false, reduire: true }
    },

    // ========================================================================
    // CORTICOÏDES
    // ========================================================================
    "prednisone": {
        src: "RCP",
        A: { msg: "Prodrogue (→ prednisolone) — Conversion hépatique normalement préservée", ci: false, reduire: false },
        B: { msg: "Prudence — Conversion en prednisolone peut être réduite. Préférer prednisolone directement.", ci: false, reduire: true },
        C: { msg: "Préférer prednisolone (métabolite actif direct) — Conversion de la prednisone altérée", ci: false, reduire: true }
    },
    "prednisolone": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (forme active). Mais surveillance glycémie/TA.", ci: false, reduire: false },
        C: { msg: "Forme active préférée en IHC. Surveillance rapprochée.", ci: false, reduire: false }
    },
    "methylprednisolone": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Métabolisme hépatique CYP3A4", ci: false, reduire: false },
        C: { msg: "Prudence — Clairance peut être réduite", ci: false, reduire: true }
    },
    "dexamethasone": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Métabolisme CYP3A4", ci: false, reduire: false },
        C: { msg: "Prudence — Clearance réduite", ci: false, reduire: true }
    },
    "hydrocortisone": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (métabolisme peu CYP-dépendant)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false }
    },

    // ========================================================================
    // ANTIPSYCHOTIQUES MANQUANTS
    // ========================================================================
    "chlorpromazine": {
        src: "RCP",
        A: { msg: "Prudence — Fort métabolisme hépatique", ci: false, reduire: true },
        B: { msg: "Réduire de 50% — Risque d'accumulation, cholestase iatrogène", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité (cholestase), coma hépatique", ci: true, reduire: false }
    },
    "clozapine": {
        src: "RCP",
        A: { msg: "Prudence — Bilan hépatique rapproché", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité, agranulocytose, métabolisme CYP1A2/3A4 altéré", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "levomepromazine": {
        src: "RCP",
        A: { msg: "Prudence — Métabolisme hépatique extensif", ci: false, reduire: true },
        B: { msg: "Réduire significativement — Accumulation, sédation prolongée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque de coma", ci: true, reduire: false }
    },
    "cyamemazine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose — Phénothiazine, métabolisme hépatique", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "amisulpride": {
        src: "RCP",
        A: { msg: "Pas d'adaptation (élimination rénale prédominante)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation (élimination rénale). Données limitées.", ci: false, reduire: false }
    },

    // ========================================================================
    // BENZODIAZÉPINES MANQUANTES
    // ========================================================================
    "bromazepam": {
        src: "RCP",
        A: { msg: "Prudence — CYP3A4", ci: false, reduire: true },
        B: { msg: "Réduire de 50% — Préférer lorazépam ou oxazépam", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Préférer lorazépam ou oxazépam", ci: true, reduire: false }
    },
    "clorazepate": {
        src: "RCP",
        A: { msg: "Prudence — Prodrogue → nordazépam (demi-vie longue)", ci: false, reduire: true },
        B: { msg: "ÉVITER — Demi-vie très prolongée, accumulation", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Préférer lorazépam ou oxazépam", ci: true, reduire: false }
    },
    "prazepam": {
        src: "RCP",
        A: { msg: "Prudence — Prodrogue du nordazépam", ci: false, reduire: true },
        B: { msg: "ÉVITER — Accumulation (nordazépam > 60h)", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "clonazepam": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose — CYP3A4, demi-vie prolongée", ci: false, reduire: true },
        C: { msg: "Réduire dose significativement", ci: false, reduire: true }
    },
    "clobazam": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j — Métabolite actif (N-desméthylclobazam) accumulable", ci: false, reduire: true },
        C: { msg: "Dose max 10 mg/j — Titration très lente", ci: false, reduire: true }
    },

    // ========================================================================
    // DIURÉTIQUES MANQUANTS
    // ========================================================================
    "hydrochlorothiazide": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Risque d'encéphalopathie hépatique (alcalose hypokaliémique)", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque majeur d'encéphalopathie hépatique", ci: true, reduire: false }
    },
    "indapamide": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Risque d'encéphalopathie si hypokaliémie", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Encéphalopathie hépatique", ci: true, reduire: false }
    },
    "bumetanide": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 0.5-1 mg — Comme furosémide, risque encéphalopathie", ci: false, reduire: true },
        C: { msg: "Débuter à 0.5 mg — Prudence extrême", ci: false, reduire: true }
    },

    // ========================================================================
    // ANTI-ANGINEUX / ANTIARYTHMIQUES MANQUANTS
    // ========================================================================
    "flecainide": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose — Métabolisme hépatique CYP2D6", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "dronedarone": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Hépatotoxicité documentée, bilan hépatique rapproché", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité sévère", ci: true, reduire: false }
    },

    // ========================================================================
    // ANTIÉMÉTIQUES MANQUANTS
    // ========================================================================
    "metoclopramide": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose de 50% — Biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "Réduire de 50% minimum", ci: false, reduire: true }
    },
    "domperidone": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Métabolisme hépatique CYP3A4, risque QTc accru", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "ondansetron": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 8 mg/j — Clairance réduite de 50%", ci: false, reduire: true },
        C: { msg: "Dose max 8 mg/j", ci: false, reduire: true }
    },

    // ========================================================================
    // IMMUNOSUPPRESSEURS / ANTIRHUMATISMAUX
    // ========================================================================
    "ciclosporine": {
        src: "RCP",
        A: { msg: "Prudence — Métabolisme hépatique CYP3A4. Dosage taux résiduel.", ci: false, reduire: false },
        B: { msg: "Réduction de dose probable — Taux résiduels augmentés", ci: false, reduire: true },
        C: { msg: "Non recommandé — Néphrotoxicité + hépatotoxicité combinées", ci: false, reduire: true }
    },
    "hydroxychloroquine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation habituelle (longue demi-vie tissulaire, peu de métabolisme hépatique de 1er passage)", ci: false, reduire: false },
        C: { msg: "Prudence — Données limitées", ci: false, reduire: false }
    },
    "leflunomide": {
        src: "RCP",
        A: { msg: "Prudence — Hépatotoxicité documentée. Bilan hépatique mensuel.", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ (RCP) — Hépatotoxicité sévère", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // ANTICOAGULANTS INJECTABLES
    // ========================================================================
    "enoxaparine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Risque hémorragique accru si coagulopathie. Anti-Xa si disponible.", ci: false, reduire: false },
        C: { msg: "Prudence extrême — Coagulopathie hépatique. Surveillance anti-Xa.", ci: false, reduire: true }
    },

    // ========================================================================
    // ANTIDIABÉTIQUES MANQUANTS
    // ========================================================================
    "vildagliptine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité documentée (élévation transaminases)", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité", ci: true, reduire: false }
    },
    "saxagliptine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (CYP3A4 mais faible impact)", ci: false, reduire: false },
        C: { msg: "Données insuffisantes — Non recommandé", ci: false, reduire: true }
    },
    "canagliflozin": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation", ci: false, reduire: false },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },
    "liraglutide": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation — Pas de métabolisme hépatique (dégradation peptidique)", ci: false, reduire: false },
        C: { msg: "Prudence — Données limitées mais pas de métabolisme hépatique", ci: false, reduire: false }
    },
    "semaglutide": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (dégradation peptidique, pas de CYP)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation — Données limitées", ci: false, reduire: false }
    },
    "acarbose": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité possible", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Cirrhose avec troubles digestifs", ci: true, reduire: false }
    },

    // ========================================================================
    // AJOUT v1.2 — AINS / COXIBS (hépatotoxicité connue)
    // ========================================================================
    "diclofenac": {
        src: "RCP",
        A: { msg: "Prudence — Surveillance transaminases. Préférer paracétamol.", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité idiosyncrasique + métabolisme CYP2C9 diminué", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité et risque hémorragique digestif", ci: true, reduire: false }
    },
    "indometacine": {
        src: "RCP",
        A: { msg: "Prudence — Surveillance hépatique", ci: false, reduire: false },
        B: { msg: "Non recommandé — Risque hémorragique GI + métabolisme diminué", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "ketoprofene": {
        src: "RCP",
        A: { msg: "Prudence — Préférer paracétamol", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité + risque GI", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "naproxene": {
        src: "RCP",
        A: { msg: "Prudence — Surveillance hépatique", ci: false, reduire: false },
        B: { msg: "Non recommandé — Métabolisme CYP diminué, accumulation possible", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "meloxicam": {
        src: "RCP",
        A: { msg: "Pas d'adaptation — Surveillance hépatique", ci: false, reduire: false },
        B: { msg: "Non recommandé — Réduction clearance hépatique", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Insuffisance hépatique sévère", ci: true, reduire: false }
    },
    "piroxicam": {
        src: "RCP",
        A: { msg: "Prudence — Surveillance transaminases", ci: false, reduire: false },
        B: { msg: "Non recommandé — Demi-vie prolongée, hépatotoxicité", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "celecoxib": {
        src: "RCP",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Réduire de 50% — CYP2C9, accumulation significative", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Insuffisance hépatique sévère", ci: true, reduire: false }
    },
    "etoricoxib": {
        src: "RCP",
        A: { msg: "Dose max 60 mg/j", ci: false, reduire: true },
        B: { msg: "Dose max 30 mg/j (si indispensable)", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // OPIOÏDES manquants
    // ========================================================================
    "buprenorphine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Métabolisme CYP3A4 diminué, surveillance sédation", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Accumulation majeure, dépression respiratoire", ci: true, reduire: false }
    },
    "pethidine": {
        src: "RCP",
        A: { msg: "Prudence — Accumulation norpéthidine possible", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Accumulation toxique de norpéthidine (convulsions)", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // ANTIARYTHMIQUE manquant
    // ========================================================================
    "propafenone": {
        src: "RCP",
        A: { msg: "Réduction de dose ~50% — CYP2D6/CYP3A4, biodisponibilité accrue", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Biodisponibilité x3-7, risque proarythmique majeur", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // DIVERS HIGH PRIORITY
    // ========================================================================
    "theophylline": {
        src: "RCP",
        A: { msg: "Surveillance taux plasmatiques rapprochée", ci: false, reduire: true },
        B: { msg: "Réduction 50% — Clairance très diminuée, dosage plasmatique obligatoire", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Clairance quasi nulle, toxicité prévisible", ci: true, reduire: false }
    },
    "methyldopa": {
        src: "RCP",
        A: { msg: "Prudence — Surveillance hépatique (hépatite auto-immune rapportée)", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité significative + métabolisme diminué", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Hépatopathie active", ci: true, reduire: false }
    },
    "clonidine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation — 50% hépatique, 50% rénal", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Clairance diminuée, risque hypotension", ci: false, reduire: true },
        C: { msg: "Réduction importante — Surveillance stricte TA + FC", ci: false, reduire: true }
    },
    "mirabegron": {
        src: "RCP",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Dose max 25 mg/j (au lieu de 50 mg)", ci: false, reduire: true },
        C: { msg: "Non recommandé — Pas de données", ci: false, reduire: true }
    },
    "rabeprazole": {
        src: "RCP",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Prudence — Pas de données spécifiques, surveillance", ci: false, reduire: false },
        C: { msg: "Non recommandé — Données insuffisantes en IH sévère", ci: false, reduire: true }
    },

    // ========================================================================
    // AJOUT v1.2 — MEDIUM PRIORITY : PSYCHOTROPES
    // ========================================================================
    "agomelatine": {
        src: "RCP",
        A: { msg: "Surveillance ALAT/ASAT avant et pendant traitement", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité, transaminases > 3N", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "clomipramine": {
        src: "RCP",
        A: { msg: "Prudence — Surveillance hépatique", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Métabolisme CYP diminué, effet anticholinergique accru", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Accumulation majeure", ci: true, reduire: false }
    },
    "dosulpine": {
        src: "RCP",
        A: { msg: "Prudence", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Métabolisme hépatique diminué", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "doxepine": {
        src: "RCP",
        A: { msg: "Prudence — Surveillance sédation", ci: false, reduire: false },
        B: { msg: "Réduction de dose significative — Premier passage hépatique diminué", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "imipramine": {
        src: "RCP",
        A: { msg: "Surveillance hépatique", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Métabolisme CYP1A2/2D6 diminué", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Accumulation, risque cardiaque", ci: true, reduire: false }
    },
    "nortriptyline": {
        src: "RCP",
        A: { msg: "Prudence — Dosage plasmatique recommandé", ci: false, reduire: false },
        B: { msg: "Réduction 50% — Dosage plasmatique obligatoire", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "maprotiline": {
        src: "RCP",
        A: { msg: "Prudence", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Métabolisme CYP2D6 diminué", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "mianserine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Clairance diminuée", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "fluvoxamine": {
        src: "RCP",
        A: { msg: "Prudence — Inhibiteur CYP1A2/2C19", ci: false, reduire: false },
        B: { msg: "Débuter à dose réduite — Clairance diminuée de 30%", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Accumulation significative", ci: true, reduire: false }
    },

    // ========================================================================
    // MEDIUM : BENZODIAZÉPINES manquantes
    // ========================================================================
    "lormetazepam": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Glucuronidation diminuée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Encéphalopathie hépatique", ci: true, reduire: false }
    },
    "midazolam": {
        src: "RCP",
        A: { msg: "Prudence — CYP3A4", ci: false, reduire: false },
        B: { msg: "Réduction de dose importante — Biodisponibilité x2, clairance diminuée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque coma, encéphalopathie", ci: true, reduire: false }
    },
    "nitrazepam": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Demi-vie prolongée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Encéphalopathie hépatique", ci: true, reduire: false }
    },
    "nordazepam": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduction — Demi-vie très prolongée (métabolisme oxydatif)", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // MEDIUM : ANTIPSYCHOTIQUES manquants
    // ========================================================================
    "flupentixol": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Métabolisme hépatique diminué", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "fluphenazine": {
        src: "RCP",
        A: { msg: "Prudence", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Métabolisme CYP2D6", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "pimozide": {
        src: "RCP",
        A: { msg: "Prudence — CYP3A4, surveillance QTc", ci: false, reduire: false },
        B: { msg: "Réduction 50% — Allongement QTc accru", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — QTc, risque torsade de pointes", ci: true, reduire: false }
    },
    "pipotiazine": {
        src: "RCP",
        A: { msg: "Prudence", ci: false, reduire: false },
        B: { msg: "Réduction de dose", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "propericiazine": {
        src: "RCP",
        A: { msg: "Prudence — Métabolisme hépatique", ci: false, reduire: false },
        B: { msg: "Réduction de dose", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // MEDIUM : ANTICHOLINERGIQUES / URINAIRES
    // ========================================================================
    "darifenacine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 7.5 mg/j — CYP2D6/3A4 diminué", ci: false, reduire: true },
        C: { msg: "Non recommandé — Pas de données", ci: false, reduire: true }
    },
    "fesoterodine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 4 mg/j — CYP2D6/3A4", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "oxybutynine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Premier passage hépatique altéré", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "tolterodine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 2 mg/j — CYP2D6", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },

    // ========================================================================
    // MEDIUM : ANTIHISTAMINIQUES à métabolisme hépatique
    // ========================================================================
    "hydroxyzine": {
        src: "RCP",
        A: { msg: "Prudence — Réduire de 33% (métabolisme CYP3A4)", ci: false, reduire: true },
        B: { msg: "Réduire de 50% — Sédation et anticholinergique majorés", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Encéphalopathie hépatique", ci: true, reduire: false }
    },
    "dexchlorpheniramine": {
        src: "RCP",
        A: { msg: "Prudence — Sédation accrue", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Métabolisme diminué", ci: false, reduire: true },
        C: { msg: "Non recommandé — Effet sédatif majeur", ci: false, reduire: true }
    },
    "diphenhydramine": {
        src: "RCP",
        A: { msg: "Prudence — Sédation", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Effet anticholinergique accru", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Encéphalopathie", ci: true, reduire: false }
    },
    "promethazine": {
        src: "RCP",
        A: { msg: "Prudence — Métabolisme hépatique", ci: false, reduire: false },
        B: { msg: "Non recommandé — Sédation/anticholinergique majeurs", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "doxylamine": {
        src: "RCP",
        A: { msg: "Prudence", ci: false, reduire: false },
        B: { msg: "Non recommandé — Métabolisme diminué, somnolence excessive", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // MEDIUM : DIVERS
    // ========================================================================
    "doxazosine": {
        src: "RCP",
        A: { msg: "Prudence — Métabolisme CYP3A4", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Biodisponibilité augmentée, hypotension", ci: false, reduire: true },
        C: { msg: "Non recommandé — Pas de données", ci: false, reduire: true }
    },
    "prazosine": {
        src: "RCP",
        A: { msg: "Prudence", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Clairance diminuée, hypotension", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "dipyridamole": {
        src: "RCP",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Prudence — Glucuronidation hépatique", ci: false, reduire: false },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },
    "prasugrel": {
        src: "RCP",
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Prudence — Pas de réduction nécessaire mais risque hémorragique accru", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Coagulopathie, risque hémorragique majeur", ci: true, reduire: false }
    },
    "baclofene": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à dose réduite — Métabolisme partiellement hépatique", ci: false, reduire: true },
        C: { msg: "Non recommandé — Encéphalopathie hépatique possible", ci: false, reduire: true }
    },
    "pentoxifylline": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "Réduction importante — Surveillance hémorragique", ci: false, reduire: true }
    },
    "phenobarbital": {
        src: "RCP",
        A: { msg: "Prudence — Inducteur enzymatique CYP", ci: false, reduire: true },
        B: { msg: "Réduction de dose — Demi-vie prolongée, sédation majeure", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Encéphalopathie hépatique, accumulation", ci: true, reduire: false }
    },
    "nitrofurantoine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation — Élimination rénale", ci: false, reduire: false },
        B: { msg: "Prudence — Hépatotoxicité idiosyncrasique rare", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Hépatite cholestatique rapportée", ci: true, reduire: false }
    },
    "insuline": {
        src: "RCP",
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Réduction possible — Néoglucogenèse diminuée, risque hypoglycémie", ci: false, reduire: true },
        C: { msg: "Réduction importante — Hypoglycémies fréquentes, surveillance glycémique rapprochée", ci: false, reduire: true }
    },
    "metopimazine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Métabolisme hépatique", ci: false, reduire: false },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "moxonidine": {
        src: "RCP",
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "Non recommandé — Hypotension sévère", ci: false, reduire: true }
    }
};
