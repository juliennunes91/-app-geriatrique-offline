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
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Utilisation avec prudence — données limitées. Pas de réduction systématique mais surveillance clinique renforcée.", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Coagulopathie cliniquement significative et risque hémorragique.", ci: true, reduire: false }
    },
    "rivaroxaban": {
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Coagulopathie avec risque hémorragique cliniquement significatif.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "dabigatran": {
        A: { msg: "Pas d'adaptation (élimination rénale prédominante)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale). Prudence si coagulopathie associée.", ci: false, reduire: false },
        C: { msg: "Non recommandé — Données insuffisantes. Coagulopathie probable.", ci: false, reduire: true }
    },
    "edoxaban": {
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation nécessaire (données limitées, prudence)", ci: false, reduire: false },
        C: { msg: "Non recommandé — Pas de données.", ci: false, reduire: true }
    },
    "acenocoumarol": {
        A: { msg: "Sensibilité accrue — INR plus fréquent, titration prudente", ci: false, reduire: true },
        B: { msg: "Sensibilité très accrue — Réduction de dose, INR 2x/semaine minimum", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Synthèse des facteurs de coagulation effondrée, risque hémorragique majeur.", ci: true, reduire: false }
    },
    "warfarine": {
        A: { msg: "Sensibilité accrue — INR plus fréquent", ci: false, reduire: true },
        B: { msg: "Sensibilité très accrue — Réduction de dose, surveillance INR rapprochée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Coagulopathie hépatique.", ci: true, reduire: false }
    },
    "fluindione": {
        A: { msg: "Sensibilité accrue aux AVK — INR rapproché", ci: false, reduire: true },
        B: { msg: "Réduction de dose nécessaire — INR rapproché", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // ANTIAGRÉGANTS
    // ========================================================================
    "clopidogrel": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Le clopidogrel est une prodrogue métabolisée par le foie (CYP2C19). Activité potentiellement réduite.", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Coagulopathie hépatique + risque hémorragique. Métabolisation compromise.", ci: true, reduire: false }
    },

    // ========================================================================
    // CARDIOVASCULAIRE
    // ========================================================================
    "amiodarone": {
        A: { msg: "Prudence — Hépatotoxicité intrinsèque, bilan hépatique rapproché", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité intrinsèque majeure sur foie déjà atteint.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "atorvastatine": {
        A: { msg: "Dose réduite recommandée (10-20 mg). Bilan hépatique avant et à 3 mois.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Transaminases > 3N ou maladie hépatique active.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "rosuvastatine": {
        A: { msg: "Dose réduite (5-10 mg). Bilan hépatique de surveillance.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Maladie hépatique active.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "simvastatine": {
        A: { msg: "Dose réduite (10-20 mg max). Bilan hépatique rapproché.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Maladie hépatique active.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "pravastatine": {
        A: { msg: "Dose réduite (10-20 mg). Statine hydrophile, moins hépatotoxique.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Maladie hépatique active.", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "losartan": {
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Réduire la dose initiale à 25 mg/j (prodrogue : métabolisme hépatique CYP2C9/3A4)", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données insuffisantes, métabolisation compromise.", ci: false, reduire: true }
    },
    "carvedilol": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Biodisponibilité augmentée. Débuter à faible dose.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "propranolol": {
        A: { msg: "Biodisponibilité augmentée — Réduire de 50%", ci: false, reduire: true },
        B: { msg: "Biodisponibilité très augmentée — Réduire de 50-75%. Surveillance FC/TA.", ci: false, reduire: true },
        C: { msg: "Utilisation très prudente — Dose minimale. Risque d'accumulation majeur.", ci: false, reduire: true }
    },
    "amlodipine": {
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Débuter à 2.5 mg/j — Demi-vie prolongée en IHC", ci: false, reduire: true },
        C: { msg: "Débuter à 2.5 mg/j — Titration très prudente", ci: false, reduire: true }
    },
    "nifedipine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Métabolisme hépatique CYP3A4, biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "Non recommandé — Accumulation", ci: false, reduire: true }
    },
    "diltiazem": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduction de dose — Biodisponibilité augmentée (CYP3A4)", ci: false, reduire: true },
        C: { msg: "Éviter si possible — Risque d'accumulation", ci: false, reduire: true }
    },
    "verapamil": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire dose de 50% — Biodisponibilité orale très augmentée (fort effet de premier passage)", ci: false, reduire: true },
        C: { msg: "Réduire dose de 70-80% — Surveillance rapprochée", ci: false, reduire: true }
    },
    "digoxine": {
        A: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale), mais attention à l'hypoalbuminémie → fraction libre augmentée", ci: false, reduire: false },
        C: { msg: "Prudence — Hypoalbuminémie majeure augmente la fraction libre. Dosage digoxinémie libre si possible.", ci: false, reduire: true }
    },

    // ========================================================================
    // ANTIDIABÉTIQUES
    // ========================================================================
    "metformine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Non recommandée — Risque d'acidose lactique accru (métabolisme lactate hépatique altéré)", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque majeur d'acidose lactique", ci: true, reduire: false }
    },
    "glibenclamide": {
        A: { msg: "Prudence — Risque d'hypoglycémie augmenté (gluconéogenèse réduite)", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Risque majeur d'hypoglycémie prolongée", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "gliclazide": {
        A: { msg: "Prudence — Surveillance glycémique renforcée", ci: false, reduire: true },
        B: { msg: "Non recommandé — Risque d'hypoglycémie accru", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque d'hypoglycémie sévère", ci: true, reduire: false }
    },
    "glimepiride": {
        A: { msg: "Prudence — Surveillance glycémique", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Risque d'hypoglycémie prolongée", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "sitagliptine": {
        A: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        C: { msg: "Données insuffisantes — Non recommandé", ci: false, reduire: true }
    },
    "linagliptine": {
        A: { msg: "Pas d'adaptation (élimination biliaire/intestinale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation nécessaire (données limitées)", ci: false, reduire: false }
    },
    "empagliflozin": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation, exposition augmentée mais cliniquement non significative", ci: false, reduire: false },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },
    "dapagliflozin": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation", ci: false, reduire: false },
        C: { msg: "Débuter à 5 mg — Données limitées, exposition augmentée", ci: false, reduire: true }
    },
    "pioglitazone": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité documentée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité", ci: true, reduire: false }
    },
    "repaglinide": {
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Prudence — Réduction de dose, surveillance glycémique", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // SNC — Antidépresseurs
    // ========================================================================
    "sertraline": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose ou allonger l'intervalle. Débuter à 25 mg.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ (RCP)", ci: true, reduire: false }
    },
    "citalopram": {
        A: { msg: "Pas d'adaptation (max 20 mg/j si > 65 ans)", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j — Clairance réduite de 37%", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },
    "escitalopram": {
        A: { msg: "Pas d'adaptation (max 10 mg/j si > 65 ans)", ci: false, reduire: false },
        B: { msg: "Dose max 10 mg/j — Débuter à 5 mg/j", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "paroxetine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j — Concentrations augmentées", ci: false, reduire: true },
        C: { msg: "Dose max 20 mg/j, débuter à 10 mg — Prudence extrême", ci: false, reduire: true }
    },
    "fluoxetine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire dose ou allonger l'intervalle — Demi-vie très longue (norfluoxétine aggravée)", ci: false, reduire: true },
        C: { msg: "Non recommandé — Accumulation majeure", ci: false, reduire: true }
    },
    "mirtazapine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Clairance réduite de ~35% — Prudence, débuter à 15 mg", ci: false, reduire: true },
        C: { msg: "Clairance réduite de ~35% — Dose minimale, surveillance rapprochée", ci: false, reduire: true }
    },
    "venlafaxine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose de 50%", ci: false, reduire: true },
        C: { msg: "Réduire la dose de 50% ou plus — Prudence extrême", ci: false, reduire: true }
    },
    "duloxetine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ (RCP — hépatotoxicité documentée)", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "amitriptyline": {
        A: { msg: "Prudence — Métabolisme hépatique. Réduction de dose recommandée.", ci: false, reduire: true },
        B: { msg: "Réduction significative de dose — Accumulation", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque d'accumulation et cardiotoxicité", ci: true, reduire: false }
    },

    // ========================================================================
    // SNC — Benzodiazépines & Hypnotiques
    // ========================================================================
    "lorazepam": {
        A: { msg: "Pas d'adaptation (glucuroconjugaison, pas de CYP)", ci: false, reduire: false },
        B: { msg: "BZD de choix en IHC — Glucuroconjugaison préservée. Réduire quand même de 50%.", ci: false, reduire: true },
        C: { msg: "Réduire de 50% minimum — Sédation prolongée possible malgré glucuroconjugaison.", ci: false, reduire: true }
    },
    "oxazepam": {
        A: { msg: "Pas d'adaptation (glucuroconjugaison, pas de CYP)", ci: false, reduire: false },
        B: { msg: "BZD de choix en IHC — Pas de métabolites actifs. Réduire la dose.", ci: false, reduire: true },
        C: { msg: "Réduire de 50% — Demi-vie peut être prolongée", ci: false, reduire: true }
    },
    "diazepam": {
        A: { msg: "Prudence — Demi-vie déjà longue", ci: false, reduire: true },
        B: { msg: "ÉVITER — Demi-vie très prolongée (>100h), métabolites actifs accumulés", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Accumulation majeure, coma possible", ci: true, reduire: false }
    },
    "alprazolam": {
        A: { msg: "Prudence — Métabolisme CYP3A4", ci: false, reduire: true },
        B: { msg: "Réduire de 50% — Demi-vie prolongée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Accumulation", ci: true, reduire: false }
    },
    "zolpidem": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 5 mg — Biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "zopiclone": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 3.75 mg — Biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque d'encéphalopathie hépatique", ci: true, reduire: false }
    },

    // ========================================================================
    // SNC — Antipsychotiques
    // ========================================================================
    "haloperidol": {
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Réduire la dose de 50% — Métabolisme hépatique CYP3A4/2D6", ci: false, reduire: true },
        C: { msg: "Non recommandé — Risque d'accumulation et d'encéphalopathie", ci: false, reduire: true }
    },
    "risperidone": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à dose réduite — Fraction libre augmentée", ci: false, reduire: true },
        C: { msg: "Données insuffisantes — Non recommandé", ci: false, reduire: true }
    },
    "quetiapine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 25 mg/j — Clairance réduite de 30%", ci: false, reduire: true },
        C: { msg: "Débuter à 25 mg/j — Titration très lente", ci: false, reduire: true }
    },
    "olanzapine": {
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Débuter à 5 mg — Prudence", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "aripiprazole": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation nécessaire", ci: false, reduire: false },
        C: { msg: "Données insuffisantes", ci: false, reduire: false }
    },

    // ========================================================================
    // SNC — Antiépileptiques
    // ========================================================================
    "levetiracetam": {
        A: { msg: "Pas d'adaptation (élimination rénale prédominante)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        C: { msg: "Réduire de 50% la dose si atteinte hépatique sévère avec atteinte rénale associée", ci: false, reduire: true }
    },
    "lamotrigine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose initiale et d'entretien de 50%", ci: false, reduire: true },
        C: { msg: "Réduire la dose initiale et d'entretien de 75%", ci: false, reduire: true }
    },
    "valproate": {
        A: { msg: "Prudence — Hépatotoxicité intrinsèque. Bilan hépatique rapproché.", ci: false, reduire: true },
        B: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité dose-dépendante majeure", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "carbamazepine": {
        A: { msg: "Prudence — Métabolisme hépatique CYP3A4, inducteur. Bilan hépatique.", ci: false, reduire: false },
        B: { msg: "Non recommandé — Hépatotoxicité, métabolisme altéré", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "phenytoine": {
        A: { msg: "Dosage plasmatique obligatoire — Fraction libre augmentée si hypoalbuminémie", ci: false, reduire: true },
        B: { msg: "Dosage de la fraction libre obligatoire — Très forte liaison albumine. Toxicité à doses thérapeutiques.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Cinétique imprévisible", ci: true, reduire: false }
    },
    "gabapentine": {
        A: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false }
    },
    "pregabaline": {
        A: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false },
        C: { msg: "Pas d'adaptation (élimination rénale)", ci: false, reduire: false }
    },

    // ========================================================================
    // ANTALGIQUES
    // ========================================================================
    "paracetamol": {
        A: { msg: "Dose max 3 g/j (au lieu de 4 g)", ci: false, reduire: true },
        B: { msg: "Dose max 2 g/j — Risque d'hépatotoxicité accru. Espacement ≥ 8h.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque d'insuffisance hépatique aiguë sur chronique (ACLF)", ci: true, reduire: false }
    },
    "tramadol": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire dose et allonger intervalle (12h). Formes LP 50 mg max.", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Métabolisme altéré, risque de convulsions", ci: true, reduire: false }
    },
    "codeine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire dose — Prodrogue (CYP2D6), métabolisation variable", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Encéphalopathie hépatique", ci: true, reduire: false }
    },
    "morphine": {
        A: { msg: "Prudence — Biodisponibilité orale augmentée (premier passage réduit)", ci: false, reduire: true },
        B: { msg: "Réduire la dose de 50% minimum — Biodisponibilité doublée, demi-vie prolongée", ci: false, reduire: true },
        C: { msg: "Utilisation très prudente — Dose minimale, espacement maximal. Risque d'encéphalopathie hépatique.", ci: false, reduire: true }
    },
    "oxycodone": {
        A: { msg: "Débuter à dose réduite (2.5-5 mg)", ci: false, reduire: true },
        B: { msg: "Réduire la dose de 50-75% — AUC augmentée de 95%", ci: false, reduire: true },
        C: { msg: "Non recommandé — Accumulation majeure, risque de dépression respiratoire", ci: false, reduire: true }
    },
    "fentanyl": {
        A: { msg: "Pas d'adaptation habituelle (transdermique)", ci: false, reduire: false },
        B: { msg: "Réduire dose de 50% — Clairance diminuée", ci: false, reduire: true },
        C: { msg: "Non recommandé — Accumulation imprévisible", ci: false, reduire: true }
    },

    // ========================================================================
    // ANTI-INFECTIEUX
    // ========================================================================
    "metronidazole": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Réduire la dose de 50% — Demi-vie prolongée (CYP2A6/réductases hépatiques)", ci: false, reduire: true },
        C: { msg: "Réduire la dose de 50% minimum — Risque neurotoxicité accru", ci: false, reduire: true }
    },
    "fluconazole": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Hépatotoxicité possible, bilan hépatique rapproché", ci: false, reduire: false },
        C: { msg: "Prudence extrême — Hépatotoxicité. Utiliser uniquement si bénéfice > risque.", ci: false, reduire: true }
    },

    // ========================================================================
    // GASTRO — IPP
    // ========================================================================
    "omeprazole": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j — Biodisponibilité augmentée", ci: false, reduire: true },
        C: { msg: "Dose max 10-20 mg/j — Prudence", ci: false, reduire: true }
    },
    "esomeprazole": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j", ci: false, reduire: true },
        C: { msg: "Dose max 20 mg/j — Non dépasser", ci: false, reduire: true }
    },
    "lansoprazole": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 15 mg/j — Clairance réduite", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "pantoprazole": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 20 mg/j", ci: false, reduire: true },
        C: { msg: "Dose max 20 mg/j — Un jour sur deux si sévère", ci: false, reduire: true }
    },

    // ========================================================================
    // UROGÉNITAL
    // ========================================================================
    "tamsulosine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (données limitées)", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ (RCP)", ci: true, reduire: false }
    },
    "silodosine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation (données limitées)", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Non étudié", ci: true, reduire: false }
    },
    "solifenacine": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 5 mg/j", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // ENDOCRINE — Thyroïde
    // ========================================================================
    "levothyroxine": {
        A: { msg: "Pas d'adaptation — Absorption digestive, pas de métabolisme hépatique de 1er passage", ci: false, reduire: false },
        B: { msg: "Pas d'adaptation habituelle — Mais TBG peut varier, surveillance TSH renforcée", ci: false, reduire: false },
        C: { msg: "Surveillance TSH renforcée — TBG diminuée → fraction libre augmentée", ci: false, reduire: false }
    },
    "thiamazole": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Hépatotoxicité cholestatique possible. Bilan hépatique rapproché.", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité", ci: true, reduire: false }
    },
    "carbimazole": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Prudence — Prodrogue du thiamazole, hépatotoxicité", ci: false, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },

    // ========================================================================
    // ANTI-GOUTTEUX
    // ========================================================================
    "allopurinol": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 100 mg — Titration prudente, bilan hépatique", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données limitées, hépatotoxicité possible", ci: false, reduire: true }
    },
    "febuxostat": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Dose max 80 mg/j — Prudence", ci: false, reduire: true },
        C: { msg: "Non recommandé — Données insuffisantes", ci: false, reduire: true }
    },
    "colchicine": {
        A: { msg: "Pas d'adaptation habituelle", ci: false, reduire: false },
        B: { msg: "Réduire la dose — Surveillance rapprochée", ci: false, reduire: true },
        C: { msg: "CONTRE-INDIQUÉ — Risque de toxicité sévère", ci: true, reduire: false }
    },

    // ========================================================================
    // DIVERS
    // ========================================================================
    "methotrexate": {
        A: { msg: "Prudence — Bilan hépatique avant et mensuel", ci: false, reduire: false },
        B: { msg: "CONTRE-INDIQUÉ — Hépatotoxicité cumulative + fibrose hépatique", ci: true, reduire: false },
        C: { msg: "CONTRE-INDIQUÉ", ci: true, reduire: false }
    },
    "azathioprine": {
        A: { msg: "Prudence — Bilan hépatique rapproché", ci: false, reduire: false },
        B: { msg: "Réduire la dose — Hépatotoxicité dose-dépendante", ci: false, reduire: true },
        C: { msg: "Non recommandé", ci: false, reduire: true }
    },
    "spironolactone": {
        A: { msg: "Pas d'adaptation (utilisée dans l'ascite cirrhotique)", ci: false, reduire: false },
        B: { msg: "Dose initiale 50-100 mg/j pour ascite — Surveillance K+", ci: false, reduire: false },
        C: { msg: "Dose initiale 100 mg/j pour ascite — Prudence hyperkaliémie + encéphalopathie", ci: false, reduire: false }
    },
    "furosemide": {
        A: { msg: "Pas d'adaptation", ci: false, reduire: false },
        B: { msg: "Débuter à 20-40 mg/j — Surveillance ionogramme rapprochée, risque d'encéphalopathie hépatique", ci: false, reduire: true },
        C: { msg: "Débuter à 20 mg/j — Association spironolactone. Risque d'encéphalopathie hépatique si diurèse trop rapide.", ci: false, reduire: true }
    }
};
