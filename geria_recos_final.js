// ============================================================================
// 🏥 GERIA_RECOS_DB - Base Intégrée de Recommandations Gériatriques
// Version 1.0 - Mars 2026
// ============================================================================
// Sources intégrées :
//   1. STOPP/START v3 (Dalleur et al. 2025 - STOPP-STRAT modifié)
//   2. Beers Criteria 2023 (AGS)
//   3. FORTA Classification 2021 (Fit fOR The Aged)
//   4. PIM-Check (Tommelein et al.)
//   5. PRISCUS 2.0 (Holt et al. 2022)
//   6. EU(7)-PIM List (Renom-Guiteras et al.)
//   7. STOPPFrail v2 (Curtin et al. 2021)
//   8. REMEDIES (McIntosh et al.)
// ============================================================================
// Architecture :
//   - Chaque règle possède des conditions (médicaments, comorbidités, biologie)
//   - Les clés de matching utilisent les mêmes conventions que medMatchesAnsmTerm()
//   - Les identifiants PAT_xxx et BIO_xxx correspondent au MASTER_DB
// ============================================================================

const GERIA_RECOS_DB = {

    // Métadonnées des sources
    SOURCES: {
        "STOPP3":    { nom: "STOPP/START v3",       annee: 2025, ref: "Dalleur O. et al., Eur Geriatr Med 2025" },
        "BEERS":     { nom: "Beers Criteria",        annee: 2023, ref: "AGS Beers Criteria 2023 Update" },
        "FORTA":     { nom: "FORTA Classification",  annee: 2021, ref: "Pazan F. et Wehling M., Drugs Aging 2021" },
        "PIM_CHECK": { nom: "PIM-Check",             annee: 2016, ref: "Tommelein E. et al., Br J Clin Pharmacol 2016" },
        "PRISCUS":   { nom: "PRISCUS 2.0",           annee: 2022, ref: "Holt S. et al., Dtsch Arztebl Int 2022" },
        "EU7PIM":    { nom: "EU(7)-PIM List",        annee: 2015, ref: "Renom-Guiteras A. et al., Eur J Clin Pharmacol 2015" },
        "STOPPFRAIL":{ nom: "STOPPFrail v2",         annee: 2021, ref: "Curtin D. et al., Age Ageing 2021" },
        "REMEDIES":  { nom: "REMEDIES",              annee: 2020, ref: "McIntosh J. et al., Expert Opin Drug Saf 2020" }
    },

    // ========================================================================
    //  RÈGLES EVITER (STOPP / Beers / FORTA-D / PRISCUS / PIM-Check / STOPPFrail)
    // ========================================================================
    EVITER: [

        // ====================================================================
        // SECTION A : INDICATION GÉNÉRALE
        // ====================================================================
        {
            id: "EV_A01",
            sources: ["STOPP3"],
            ref_code: "STOPP3-A1",
            section: "Indication",
            titre: "Médicament sans indication clinique",
            message: "Tout médicament prescrit sans indication clinique clairement identifiée doit être réévalué.",
            severite: "warning",
            condition: { type: "manual_review" },
            alternatives: "Réévaluation complète de l'ordonnance"
        },
        {
            id: "EV_A02",
            sources: ["STOPP3"],
            ref_code: "STOPP3-A2",
            section: "Indication",
            titre: "Durée de traitement dépassée",
            message: "Tout médicament prescrit au-delà de la durée recommandée, quand celle-ci est définie, doit être réévalué.",
            severite: "warning",
            condition: { type: "manual_review" },
            alternatives: "Arrêt ou réévaluation périodique"
        },
        {
            id: "EV_A03",
            sources: ["STOPP3", "BEERS", "EU7PIM"],
            ref_code: "STOPP3-A3",
            section: "Indication",
            titre: "Duplication de classe thérapeutique",
            message: "Duplication de classe thérapeutique en usage quotidien régulier (≥ 2 AINS, ISRS, diurétiques de l'anse, IEC, anticoagulants, antipsychotiques, opioïdes). Risque de surdosage et d'effets indésirables cumulatifs.",
            severite: "danger",
            condition: { type: "duplication_check" },
            alternatives: "Optimiser la monothérapie avant d'ajouter un second agent de même classe"
        },

        // ====================================================================
        // SECTION B : CARDIOVASCULAIRE
        // ====================================================================
        {
            id: "EV_B01",
            sources: ["STOPP3", "FORTA", "BEERS"],
            ref_code: "STOPP3-B1",
            section: "Cardiovasculaire",
            titre: "Digoxine + IC à FE préservée (HFpEF)",
            message: "Digoxine pour IC à fraction d'éjection préservée : aucun bénéfice prouvé.",
            severite: "warning",
            condition: {
                med_keys: ["digoxine"],
                comorbs: ["PAT_003"]
            },
            alternatives: "Traitement étiologique de l'HFpEF"
        },
        {
            id: "EV_B02",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-B2",
            section: "Cardiovasculaire",
            titre: "Vérapamil/Diltiazem + IC FE réduite (NYHA III-IV)",
            message: "Vérapamil ou Diltiazem avec IC FE réduite (HFrEF) NYHA III-IV : risque d'aggravation de l'insuffisance cardiaque.",
            severite: "danger",
            condition: {
                med_keys: ["verapamil", "diltiazem"],
                comorbs: ["PAT_002"]
            },
            alternatives: "Bêtabloquant cardiosélectif (bisoprolol, carvédilol, nébivolol)"
        },
        {
            id: "EV_B03",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B3",
            section: "Cardiovasculaire",
            titre: "Bêtabloquant + Vérapamil/Diltiazem",
            message: "Association bêtabloquant et vérapamil ou diltiazem : risque de bloc auriculo-ventriculaire.",
            severite: "danger",
            condition: {
                med_keys: ["betabloquant"],
                med_keys_2: ["verapamil", "diltiazem"]
            },
            alternatives: "Monothérapie chronotrope négative"
        },
        {
            id: "EV_B04",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B4",
            section: "Cardiovasculaire",
            titre: "Bradycardisants + Bradycardie / BAV",
            message: "Médicaments bradycardisants (bêtabloquant, vérapamil, diltiazem, digoxine) avec bradycardie < 50/min, BAV II ou BAV complet : risque d'hypotension profonde, asystolie.",
            severite: "danger",
            condition: {
                med_keys: ["betabloquant", "verapamil", "diltiazem", "digoxine"],
                contexte_clinique: "bradycardie"
            },
            alternatives: "Réévaluation du traitement chronotrope négatif"
        },
        {
            id: "EV_B05",
            sources: ["STOPP3", "FORTA"],
            ref_code: "STOPP3-B5",
            section: "Cardiovasculaire",
            titre: "Bêtabloquant en monothérapie pour HTA simple",
            message: "Bêtabloquant en monothérapie pour HTA non compliquée (sans angor, anévrisme aortique) : pas de preuve d'efficacité suffisante en première intention.",
            severite: "warning",
            condition: {
                med_keys: ["betabloquant"],
                comorbs: ["PAT_005"],
                comorbs_absent: ["PAT_004", "PAT_002", "PAT_006"]
            },
            alternatives: "IEC/ARA2, inhibiteur calcique DHP, thiazidique"
        },
        {
            id: "EV_B06",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B6",
            section: "Cardiovasculaire",
            titre: "Amiodarone en 1ère intention (TSV)",
            message: "Amiodarone en première ligne pour les tachycardies supraventriculaires : effets indésirables majeurs (thyroïde, poumon, foie, neuropathie, photosensibilité).",
            severite: "warning",
            condition: {
                med_keys: ["amiodarone"],
                comorbs: ["PAT_006"]
            },
            alternatives: "Bêtabloquant, digoxine, vérapamil ou diltiazem selon contexte"
        },
        {
            id: "EV_B07",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B7",
            section: "Cardiovasculaire",
            titre: "Diurétique de l'anse en 1ère intention pour HTA",
            message: "Diurétique de l'anse en première intention pour l'HTA (sauf IC concomitante) : manque de données sur les résultats ; alternatives plus sûres et efficaces.",
            severite: "warning",
            condition: {
                med_keys: ["furosemide", "bumetanide"],
                comorbs: ["PAT_005"],
                comorbs_absent: ["PAT_001", "PAT_002", "PAT_003"]
            },
            alternatives: "Thiazidique/apparenté, IEC/ARA2, inhibiteur calcique"
        },
        {
            id: "EV_B08",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-B8",
            section: "Cardiovasculaire",
            titre: "Diurétique de l'anse pour œdèmes sans IC/IHC/IRC/syndrome néphrotique",
            message: "Diurétique de l'anse pour œdèmes des chevilles sans IC, insuffisance hépatique, syndrome néphrotique ou IRC. Surélévation des jambes et contention veineuse plus appropriées.",
            severite: "warning",
            condition: {
                med_keys: ["furosemide", "bumetanide"],
                comorbs_absent: ["PAT_001", "PAT_002", "PAT_003", "PAT_029"]
            },
            alternatives: "Surélévation des jambes, contention veineuse"
        },
        {
            id: "EV_B09",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B9",
            section: "Cardiovasculaire",
            titre: "Thiazidique + hypokaliémie / hyponatrémie / hypercalcémie / goutte",
            message: "Thiazidique avec hypokaliémie significative (K+ < 3.0), hyponatrémie (Na+ < 130), hypercalcémie (Ca corr > 2.65) ou antécédent de goutte. Risque d'aggravation de ces anomalies.",
            severite: "danger",
            condition: {
                med_keys: ["hydrochlorothiazide", "indapamide", "chlortalidone", "altizide"],
                bio: { "BIO_001": { op: "<", val: 3.0 } }
            },
            alternatives: "Réévaluation diurétique, correction ionique"
        },
        {
            id: "EV_B09b",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B9-Na",
            section: "Cardiovasculaire",
            titre: "Thiazidique + Hyponatrémie",
            message: "Thiazidique avec hyponatrémie significative (Na+ < 130 mmol/L) : risque d'aggravation.",
            severite: "danger",
            condition: {
                med_keys: ["hydrochlorothiazide", "indapamide", "chlortalidone", "altizide"],
                bio: { "BIO_002": { op: "<", val: 130 } }
            },
            alternatives: "Arrêt du thiazidique, correction de la natrémie"
        },
        {
            id: "EV_B10",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B10",
            section: "Cardiovasculaire",
            titre: "Diurétique de l'anse pour HTA + incontinence urinaire",
            message: "Diurétique de l'anse pour l'HTA avec incontinence urinaire concomitante : peut aggraver l'incontinence.",
            severite: "warning",
            condition: {
                med_keys: ["furosemide", "bumetanide"],
                comorbs: ["PAT_005"],
                contexte_clinique: "incontinence"
            },
            alternatives: "Autre classe antihypertensive"
        },
        {
            id: "EV_B11",
            sources: ["STOPP3", "BEERS", "PRISCUS"],
            ref_code: "STOPP3-B11",
            section: "Cardiovasculaire",
            titre: "Antihypertenseur central (méthyldopa, clonidine, moxonidine, rilménidine)",
            message: "Antihypertenseur d'action centrale : moins bien toléré chez le sujet âgé (sédation, hypotension orthostatique, dépression, bradycardie). PIM selon Beers/PRISCUS.",
            severite: "danger",
            condition: {
                med_keys: ["methyldopa", "clonidine", "moxonidine", "rilmenidine", "guanfacine"]
            },
            alternatives: "IEC/ARA2, inhibiteur calcique, thiazidique"
        },
        {
            id: "EV_B12",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B12",
            section: "Cardiovasculaire",
            titre: "IEC/ARA2 + Hyperkaliémie (K+ > 5.5)",
            message: "IEC ou ARA2 avec hyperkaliémie (K+ > 5.5 mmol/L) : risque d'hyperkaliémie dangereuse.",
            severite: "danger",
            condition: {
                med_keys: ["iec", "ara2"],
                bio: { "BIO_001": { op: ">", val: 5.5 } }
            },
            alternatives: "Arrêt ou réduction, correction kaliémie, chélateur du potassium"
        },
        {
            id: "EV_B13",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B13",
            section: "Cardiovasculaire",
            titre: "Anti-aldostérone + épargnant potassique sans surveillance K+",
            message: "Anti-aldostérone (spironolactone, éplérénone) avec IEC/ARA2/amiloride/triamtérène sans monitorage du K+ (< 6 mois) : risque d'hyperkaliémie dangereuse (K+ > 6.0).",
            severite: "danger",
            condition: {
                med_keys: ["spironolactone", "eplerenone", "aldactazine"],
                med_keys_2: ["iec", "ara2", "amiloride", "triamterene"]
            },
            alternatives: "Monitorage K+ régulier (< 1 semaine post-initiation puis mensuel)"
        },
        {
            id: "EV_B14",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B14",
            section: "Cardiovasculaire",
            titre: "IPDE5 + IC sévère ou dérivés nitrés",
            message: "Inhibiteur PDE5 (sildénafil, tadalafil, vardénafil) avec IC sévère (PAS < 90 mmHg) ou dérivés nitrés : risque de collapsus cardiovasculaire.",
            severite: "danger",
            condition: {
                med_keys: ["sildenafil", "tadalafil", "vardenafil", "avanafil"],
                comorbs: ["PAT_002"]
            },
            alternatives: "Contre-indication absolue de l'association"
        },
        {
            id: "EV_B15",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-B15",
            section: "Cardiovasculaire",
            titre: "Médicament allongeant le QTc + QTc déjà prolongé",
            message: "Médicament allongeant le QTc (quinolone, macrolide, ondansétron, citalopram > 20 mg/j, escitalopram > 10 mg/j, antidépresseur tricyclique, lithium, halopéridol, digoxine, antiarythmique Ia/III, phénothiazine, mirabégron) avec QTc prolongé (> 450 ms H / > 470 ms F) : risque de torsade de pointes.",
            severite: "danger",
            condition: {
                qt_check: true,
                bio: { "BIO_031": { op: ">", val: 450 } }
            },
            alternatives: "Choisir molécule sans effet sur le QTc, correction K+/Mg2+"
        },
        {
            id: "EV_B16",
            sources: ["STOPP3", "STOPPFRAIL"],
            ref_code: "STOPP3-B16",
            section: "Cardiovasculaire",
            titre: "Statine en prévention primaire ≥ 85 ans / fragile / espérance vie < 3 ans",
            message: "Statine en prévention cardiovasculaire primaire chez patient ≥ 85 ans avec fragilité établie ou espérance de vie < 3 ans : pas de preuve d'efficacité. STOPPFrail recommande l'arrêt.",
            severite: "warning",
            condition: {
                med_keys: ["statine", "atorvastatine", "rosuvastatine", "simvastatine", "pravastatine", "fluvastatine"],
                age_min: 85,
                fragile: true,
                comorbs_absent: ["PAT_004", "PAT_007", "PAT_008"]
            },
            alternatives: "Déprescription de la statine si prévention primaire"
        },
        {
            id: "EV_B17",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B17",
            section: "Cardiovasculaire",
            titre: "AINS au long cours + maladie vasculaire connue",
            message: "AINS systémique au long cours avec antécédent coronarien, cérébrovasculaire ou artériopathie : risque thrombotique majoré.",
            severite: "danger",
            condition: {
                med_keys: ["ains"],
                comorbs_any: ["PAT_004", "PAT_007", "PAT_008"]
            },
            alternatives: "Paracétamol, opioïdes faibles, topiques, réévaluation douleur"
        },
        {
            id: "EV_B18",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B18",
            section: "Cardiovasculaire",
            titre: "Antipsychotique au long cours + maladie vasculaire connue",
            message: "Antipsychotique au long cours avec antécédent coronarien, cérébrovasculaire ou artériopathie : risque thrombotique majoré.",
            severite: "danger",
            condition: {
                med_keys: ["antipsychotique"],
                comorbs_any: ["PAT_004", "PAT_007", "PAT_008"]
            },
            alternatives: "Réévaluer l'indication, réduire la dose, alternatives non pharmacologiques"
        },
        {
            id: "EV_B19",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B19",
            section: "Cardiovasculaire",
            titre: "AINS/Corticoïde + IC nécessitant diurétique de l'anse",
            message: "AINS ou corticoïde systémique avec IC nécessitant un diurétique de l'anse : risque d'exacerbation de l'IC.",
            severite: "danger",
            condition: {
                med_keys: ["ains", "corticoide"],
                comorbs_any: ["PAT_001", "PAT_002", "PAT_003"]
            },
            alternatives: "Paracétamol, corticothérapie locale, alternatives"
        },
        {
            id: "EV_B20",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B20",
            section: "Cardiovasculaire",
            titre: "Antihypertenseur (hors IEC/ARA2) + sténose aortique sévère symptomatique",
            message: "Antihypertenseur (sauf IEC et ARA2) avec sténose aortique sévère symptomatique : risque d'hypotension sévère, syncope.",
            severite: "danger",
            condition: {
                med_keys: ["antihypertenseur", "inhibiteur calcique", "betabloquant", "diuretique"],
                contexte_clinique: "stenose_aortique"
            },
            alternatives: "IEC/ARA2 avec titration prudente, évaluation cardiologique"
        },
        {
            id: "EV_B21",
            sources: ["STOPP3"],
            ref_code: "STOPP3-B21",
            section: "Cardiovasculaire",
            titre: "Digoxine en 1ère ligne pour FA (contrôle de fréquence > 3 mois)",
            message: "Digoxine en première intention pour le contrôle de la fréquence ventriculaire dans la FA au long cours (> 3 mois) : surmortalité documentée. Préférer un bêtabloquant cardiosélectif.",
            severite: "warning",
            condition: {
                med_keys: ["digoxine"],
                comorbs: ["PAT_006"]
            },
            alternatives: "Bisoprolol, métoprolol, nébivolol"
        },

        // ====================================================================
        // SECTION C : COAGULATION
        // ====================================================================
        {
            id: "EV_C01",
            sources: ["STOPP3"],
            ref_code: "STOPP3-C1",
            section: "Coagulation",
            titre: "Aspirine > 100 mg/j au long cours",
            message: "Aspirine au long cours à dose > 100 mg/j : pas de bénéfice supplémentaire, risque hémorragique majoré.",
            severite: "warning",
            condition: {
                med_keys: ["acide acetylsalicylique", "aspirine"],
                contexte_clinique: "dose_aspirine_elevee"
            },
            alternatives: "Réduire à 75-100 mg/j"
        },
        {
            id: "EV_C02",
            sources: ["STOPP3"],
            ref_code: "STOPP3-C2",
            section: "Coagulation",
            titre: "Antiagrégant/Anticoagulant + risque hémorragique significatif",
            message: "Antiagrégant ou anticoagulant avec risque hémorragique significatif (HTA sévère non contrôlée, diathèse hémorragique, saignement spontané récent).",
            severite: "danger",
            condition: {
                med_keys: ["anticoag", "antiagreg", "antiagregant"],
                contexte_clinique: "risque_hemorragique"
            },
            alternatives: "Réévaluer le rapport bénéfice/risque, contrôle tensionnel"
        },
        {
            id: "EV_C04",
            sources: ["STOPP3"],
            ref_code: "STOPP3-C4",
            section: "Coagulation",
            titre: "Antiagrégant + Anticoagulant dans FA (sans stent récent)",
            message: "Antiagrégant et anticoagulant simultanés en FA chronique, en l'absence de stent coronaire récent (< 12 mois) ou sténose coronaire sévère : pas de bénéfice ajouté, risque hémorragique.",
            severite: "danger",
            condition: {
                med_keys: ["antiagreg", "antiagregant", "acide acetylsalicylique", "clopidogrel"],
                med_keys_2: ["anticoag", "apixaban", "rivaroxaban", "dabigatran", "edoxaban", "acenocoumarol", "warfarine", "fluindione"]
            },
            alternatives: "Anticoagulant seul si FA sans stent récent"
        },
        {
            id: "EV_C06",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-C6",
            section: "Coagulation",
            titre: "Ticlopidine : à éviter en toute circonstance",
            message: "Ticlopidine à éviter en toute circonstance : le clopidogrel et le prasugrel ont une efficacité similaire avec un meilleur profil de sécurité.",
            severite: "danger",
            condition: {
                med_keys: ["ticlopidine"]
            },
            alternatives: "Clopidogrel, prasugrel, ticagrélor"
        },
        {
            id: "EV_C07",
            sources: ["STOPP3"],
            ref_code: "STOPP3-C7",
            section: "Coagulation",
            titre: "Antiagrégant seul en remplacement de l'anticoagulant dans la FA",
            message: "Antiagrégant comme alternative à l'anticoagulant pour la prévention de l'AVC dans la FA : aucune preuve d'efficacité.",
            severite: "danger",
            condition: {
                med_keys: ["antiagreg", "acide acetylsalicylique", "clopidogrel"],
                comorbs: ["PAT_006"],
                med_absent: ["anticoag", "apixaban", "rivaroxaban", "dabigatran", "edoxaban", "acenocoumarol", "warfarine", "fluindione"]
            },
            alternatives: "Anticoagulant oral (AOD préféré, ou AVK si CI)"
        },
        {
            id: "EV_C10",
            sources: ["STOPP3"],
            ref_code: "STOPP3-C10",
            section: "Coagulation",
            titre: "AINS + Anticoagulant",
            message: "AINS avec anticoagulant (AVK, AOD) : risque de saignement gastro-intestinal majeur.",
            severite: "danger",
            condition: {
                med_keys: ["ains"],
                med_keys_2: ["anticoag", "apixaban", "rivaroxaban", "dabigatran", "edoxaban", "acenocoumarol", "warfarine", "fluindione"]
            },
            alternatives: "Paracétamol, opioïdes faibles, topiques"
        },
        {
            id: "EV_C11",
            sources: ["STOPP3"],
            ref_code: "STOPP3-C11",
            section: "Coagulation",
            titre: "AVK en 1ère intention dans FA (sauf valve mécanique/sténose mitrale/ClCr < 15)",
            message: "AVK en première intention pour la FA (sauf valve mécanique, sténose mitrale modérée-sévère, ou ClCr < 15 ml/min) : les AOD sont aussi efficaces et plus sûrs.",
            severite: "warning",
            condition: {
                med_keys: ["acenocoumarol", "warfarine", "fluindione"],
                comorbs: ["PAT_006"]
            },
            alternatives: "AOD (apixaban, rivaroxaban, edoxaban, dabigatran)"
        },
        {
            id: "EV_C12",
            sources: ["STOPP3"],
            ref_code: "STOPP3-C12",
            section: "Coagulation",
            titre: "ISRS + Anticoagulant + antécédent hémorragique majeur",
            message: "ISRS avec anticoagulant et antécédent d'hémorragie majeure : l'effet antiplaquettaire des ISRS majore le risque hémorragique.",
            severite: "danger",
            condition: {
                med_keys: ["isrs", "citalopram", "escitalopram", "fluoxetine", "fluvoxamine", "paroxetine", "sertraline"],
                med_keys_2: ["anticoag", "apixaban", "rivaroxaban", "dabigatran", "edoxaban", "acenocoumarol", "warfarine", "fluindione"],
                contexte_clinique: "atcd_hemorragie"
            },
            alternatives: "Antidépresseur sans effet antiplaquettaire (mirtazapine, miansérine)"
        },
        {
            id: "EV_C13",
            sources: ["STOPP3"],
            ref_code: "STOPP3-C13",
            section: "Coagulation",
            titre: "Dabigatran + Diltiazem/Vérapamil",
            message: "Dabigatran avec diltiazem ou vérapamil : risque hémorragique par augmentation des taux de dabigatran.",
            severite: "danger",
            condition: {
                med_keys: ["dabigatran"],
                med_keys_2: ["diltiazem", "verapamil"]
            },
            alternatives: "Autre AOD (apixaban, rivaroxaban) ou autre antiarythmique"
        },
        {
            id: "EV_C14",
            sources: ["STOPP3"],
            ref_code: "STOPP3-C14",
            section: "Coagulation",
            titre: "AOD + inhibiteur P-gp",
            message: "AOD (apixaban, dabigatran, edoxaban, rivaroxaban) avec inhibiteur de la P-glycoprotéine (amiodarone, azithromycine, carvédilol, ciclosporine, dronédarone, itraconazole, kétoconazole, macrolides, quinine, tamoxifène, ticagrélor, vérapamil) : risque hémorragique par augmentation de l'exposition.",
            severite: "danger",
            condition: {
                med_keys: ["apixaban", "dabigatran", "edoxaban", "rivaroxaban"],
                med_keys_2: ["amiodarone", "azithromycine", "carvedilol", "ciclosporine", "dronedarone", "itraconazole", "ketoconazole", "clarithromycine", "erythromycine", "quinine", "tamoxifene", "ticagrelor", "verapamil"]
            },
            alternatives: "Évaluer le risque, adapter la dose de l'AOD, ou choisir un anticoagulant non substrat P-gp"
        },
        {
            id: "EV_C16",
            sources: ["STOPP3", "STOPPFRAIL"],
            ref_code: "STOPP3-C16",
            section: "Coagulation",
            titre: "Aspirine en prévention primaire cardiovasculaire",
            message: "Aspirine en prévention primaire cardiovasculaire : le rapport bénéfice/risque est défavorable chez le sujet âgé (risque hémorragique > bénéfice). STOPPFrail le confirme.",
            severite: "warning",
            condition: {
                med_keys: ["acide acetylsalicylique", "aspirine"],
                comorbs_absent: ["PAT_004", "PAT_007", "PAT_008"]
            },
            alternatives: "Arrêt de l'aspirine si prévention primaire pure"
        },

        // ====================================================================
        // SECTION D : SYSTÈME NERVEUX CENTRAL
        // ====================================================================
        {
            id: "EV_D01",
            sources: ["STOPP3", "BEERS", "PRISCUS", "FORTA"],
            ref_code: "STOPP3-D1",
            section: "SNC",
            titre: "Antidépresseur tricyclique + démence / glaucome / rétention urinaire / constipation / chutes / hypotension orthostatique",
            message: "Antidépresseur tricyclique avec démence, glaucome à angle fermé, troubles conductifs cardiaques, HBP avec symptômes urinaires, rétention urinaire, constipation chronique, chutes récentes ou hypotension orthostatique : risque d'aggravation. PIM selon Beers, PRISCUS et FORTA-D.",
            severite: "danger",
            condition: {
                med_keys: ["antidepresseur tricyclique", "amitriptyline", "clomipramine", "imipramine", "doxepine", "nortriptyline", "trimipramine", "maprotiline", "amoxapine", "dosulpine"],
                comorbs_any: ["PAT_010", "PAT_011", "PAT_012", "PAT_013", "PAT_009"]
            },
            alternatives: "ISRS (sertraline, escitalopram) ou mirtazapine"
        },
        {
            id: "EV_D02",
            sources: ["STOPP3", "BEERS", "PRISCUS"],
            ref_code: "STOPP3-D2",
            section: "SNC",
            titre: "Antidépresseur tricyclique en 1ère intention pour dépression majeure",
            message: "Initiation d'un tricyclique en première intention pour dépression majeure : plus d'effets indésirables que les ISRS/IRSN.",
            severite: "warning",
            condition: {
                med_keys: ["antidepresseur tricyclique", "amitriptyline", "clomipramine", "imipramine", "doxepine", "nortriptyline", "trimipramine"]
            },
            alternatives: "ISRS (sertraline, escitalopram, citalopram ≤ 20 mg) ou IRSN (venlafaxine, duloxétine)"
        },
        {
            id: "EV_D03",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D3",
            section: "SNC",
            titre: "IRSN + HTA sévère",
            message: "IRSN (venlafaxine, duloxétine) avec HTA sévère (PAS > 180 et/ou PAD > 105 mmHg) : risque d'aggravation de l'HTA.",
            severite: "danger",
            condition: {
                med_keys: ["venlafaxine", "duloxetine", "milnacipran", "desvenlafaxine"],
                comorbs: ["PAT_005"]
            },
            alternatives: "ISRS (sertraline, escitalopram) ou mirtazapine"
        },
        {
            id: "EV_D04",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D4",
            section: "SNC",
            titre: "Antipsychotique anticholinergique + HBP symptomatique",
            message: "Antipsychotique à effets anticholinergiques modérés à marqués (chlorpromazine, clozapine, flupenthixol, fluphénazine, lévomépromazine, olanzapine, pipotiazine, promazine, thioridazine) avec HBP symptomatique ou rétention urinaire : risque de rétention urinaire.",
            severite: "danger",
            condition: {
                med_keys: ["chlorpromazine", "clozapine", "flupenthixol", "olanzapine", "levomepromazine", "pipotiazine", "promazine", "thioridazine"],
                contexte_clinique: "hbp"
            },
            alternatives: "Antipsychotique à faible charge anticholinergique (aripiprazole, quétiapine faible dose)"
        },
        {
            id: "EV_D05",
            sources: ["STOPP3", "BEERS", "FORTA"],
            ref_code: "STOPP3-D5",
            section: "SNC",
            titre: "Antipsychotique pour SCPD > 3 mois sans réévaluation",
            message: "Antipsychotique pour symptômes comportementaux et psychologiques de la démence (SCPD) à dose inchangée > 3 mois sans réévaluation : risque d'effets extrapyramidaux, déclin cognitif, morbi-mortalité cardiovasculaire majorée.",
            severite: "danger",
            condition: {
                med_keys: ["antipsychotique"],
                comorbs_any: ["PAT_010", "PAT_011", "PAT_012", "PAT_013"]
            },
            alternatives: "Réévaluation à 3 mois, approche non pharmacologique (musicothérapie, Montessori, DICE), réduction progressive"
        },
        {
            id: "EV_D06",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D6",
            section: "SNC",
            titre: "ISRS + Hyponatrémie actuelle ou récente (Na+ < 130)",
            message: "ISRS avec hyponatrémie actuelle ou récente (Na+ < 130 mmol/L) : risque de SIADH et aggravation de l'hyponatrémie.",
            severite: "danger",
            condition: {
                med_keys: ["isrs", "citalopram", "escitalopram", "fluoxetine", "fluvoxamine", "paroxetine", "sertraline"],
                bio: { "BIO_002": { op: "<", val: 130 } }
            },
            alternatives: "Mirtazapine, miansérine (moins de risque d'hyponatrémie)"
        },
        {
            id: "EV_D08",
            sources: ["STOPP3", "BEERS", "PRISCUS", "EU7PIM", "FORTA", "PIM_CHECK", "STOPPFRAIL"],
            ref_code: "STOPP3-D8",
            section: "SNC",
            titre: "Benzodiazépine ≥ 4 semaines",
            message: "Benzodiazépine ≥ 4 semaines sans indication de prolongation : sédation prolongée, confusion, altération de l'équilibre, chutes, accidents de la route. PIM selon toutes les listes (Beers, PRISCUS, EU(7)-PIM, FORTA-D, PIM-Check, STOPPFrail). Sevrage progressif obligatoire.",
            severite: "danger",
            condition: {
                med_keys: ["benzodiazepine", "diazepam", "bromazepam", "lorazepam", "oxazepam", "alprazolam", "clorazepate", "prazepam", "nordazepam", "clobazam", "clonazepam", "nitrazepam", "lormetazepam", "temazepam", "midazolam"]
            },
            alternatives: "Sevrage progressif (réduction 25% toutes les 2-4 semaines), TCC insomnie, mélatonine LP si insomnie"
        },
        {
            id: "EV_D09",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D9",
            section: "SNC",
            titre: "Benzodiazépine pour agitation/SCPD dans la démence",
            message: "Benzodiazépine pour agitation comportementale ou symptômes non cognitifs de la démence : aucune preuve d'efficacité, risque de chutes et de sédation paradoxale.",
            severite: "danger",
            condition: {
                med_keys: ["benzodiazepine"],
                comorbs_any: ["PAT_010", "PAT_011", "PAT_012", "PAT_013"]
            },
            alternatives: "Approche non pharmacologique, trazodone faible dose si nécessaire"
        },
        {
            id: "EV_D10",
            sources: ["STOPP3", "BEERS", "PRISCUS"],
            ref_code: "STOPP3-D10",
            section: "SNC",
            titre: "Benzodiazépine ≥ 2 semaines pour insomnie",
            message: "Benzodiazépine ≥ 2 semaines pour insomnie : dépendance, chutes, fractures, accidents.",
            severite: "danger",
            condition: {
                med_keys: ["benzodiazepine"],
                comorbs: ["PAT_027"]
            },
            alternatives: "Hygiène du sommeil, TCC-I, mélatonine LP"
        },
        {
            id: "EV_D11",
            sources: ["STOPP3", "BEERS", "PRISCUS", "EU7PIM"],
            ref_code: "STOPP3-D11",
            section: "SNC",
            titre: "Hypnotique Z ≥ 2 semaines pour insomnie",
            message: "Z-drug (zolpidem, zopiclone, zaleplon) ≥ 2 semaines pour insomnie : chutes, fractures. PIM selon Beers, PRISCUS.",
            severite: "danger",
            condition: {
                med_keys: ["zolpidem", "zopiclone", "zaleplon"]
            },
            alternatives: "Hygiène du sommeil, TCC-I, mélatonine LP"
        },
        {
            id: "EV_D12",
            sources: ["STOPP3", "BEERS", "FORTA"],
            ref_code: "STOPP3-D12",
            section: "SNC",
            titre: "Antipsychotique (sauf clozapine, quétiapine) + Parkinson / Démence à corps de Lewy",
            message: "Antipsychotique (sauf clozapine et quétiapine) avec maladie de Parkinson ou démence à corps de Lewy : effets extrapyramidaux sévères, aggravation du syndrome parkinsonien.",
            severite: "danger",
            condition: {
                med_keys: ["antipsychotique", "haloperidol", "risperidone", "olanzapine", "aripiprazole", "amisulpride", "chlorpromazine", "levomepromazine", "cyamemazine"],
                comorbs_any: ["PAT_014", "PAT_012"]
            },
            alternatives: "Clozapine (sous surveillance NFS) ou quétiapine faible dose si indispensable"
        },
        {
            id: "EV_D13",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D13",
            section: "SNC",
            titre: "Anticholinergique correcteur des effets extrapyramidaux des antipsychotiques",
            message: "Anticholinergique (bipéridène, orphénadrine, procyclidine, trihexyphénidyle) pour corriger les effets extrapyramidaux des antipsychotiques : toxicité anticholinergique.",
            severite: "warning",
            condition: {
                med_keys: ["biperidene", "orphenadrine", "procyclidine", "trihexyphenidyle", "tropatepine"]
            },
            alternatives: "Réduire la dose de l'antipsychotique, changer pour un atypique"
        },
        {
            id: "EV_D14",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-D14",
            section: "SNC",
            titre: "Anticholinergique puissant + Démence ou Delirium",
            message: "Médicament à effet anticholinergique puissant (tricycliques, antipsychotiques type chlorpromazine/clozapine/thioridazine, antihistaminiques H1 1ère gén., antispasmodiques urinaires, hyoscine, procyclidine, benzatropine, tizanidine) avec démence ou delirium : exacerbation des troubles cognitifs.",
            severite: "danger",
            condition: {
                acb_check: true,
                comorbs_any: ["PAT_010", "PAT_011", "PAT_012", "PAT_013"]
            },
            alternatives: "Médicaments à faible charge anticholinergique"
        },
        {
            id: "EV_D15",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-D15",
            section: "SNC",
            titre: "Antipsychotique > 12 semaines pour SCPD (sauf sévérité extrême)",
            message: "Antipsychotique > 12 semaines pour symptômes non cognitifs de la démence (sauf si symptômes sévères et échec des autres traitements) : risque d'AVC, d'infarctus du myocarde.",
            severite: "danger",
            condition: {
                med_keys: ["antipsychotique"],
                comorbs_any: ["PAT_010", "PAT_011", "PAT_012", "PAT_013"]
            },
            alternatives: "Réévaluation à 12 semaines, réduction progressive, approche non pharmacologique"
        },
        {
            id: "EV_D16",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D16",
            section: "SNC",
            titre: "Antipsychotique comme hypnotique (sauf psychose ou SCPD)",
            message: "Antipsychotique utilisé comme hypnotique, sauf si le trouble du sommeil est lié à une psychose ou à des SCPD : confusion, hypotension, effets extrapyramidaux, chutes.",
            severite: "warning",
            condition: {
                med_keys: ["antipsychotique"],
                comorbs: ["PAT_027"],
                comorbs_absent: ["PAT_010", "PAT_011", "PAT_012", "PAT_015"]
            },
            alternatives: "Hygiène du sommeil, mélatonine LP, trazodone faible dose"
        },
        {
            id: "EV_D17",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D17",
            section: "SNC",
            titre: "Inhibiteur de l'acétylcholinestérase + bradycardie < 60 / BAV",
            message: "Inhibiteur de l'acétylcholinestérase (donépézil, rivastigmine, galantamine) avec bradycardie persistante (< 60/min), BAV ou syncopes inexpliquées récurrentes : risque de trouble conductif cardiaque, syncope et traumatisme.",
            severite: "danger",
            condition: {
                med_keys: ["donepezil", "rivastigmine", "galantamine"],
                contexte_clinique: "bradycardie"
            },
            alternatives: "Mémantine si indication, réévaluation du bénéfice"
        },
        {
            id: "EV_D18",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D18",
            section: "SNC",
            titre: "Inhibiteur acétylcholinestérase + bradycardisant",
            message: "Inhibiteur de l'acétylcholinestérase avec bêtabloquant, digoxine, diltiazem ou vérapamil : trouble de la conduction cardiaque, syncope.",
            severite: "danger",
            condition: {
                med_keys: ["donepezil", "rivastigmine", "galantamine"],
                med_keys_2: ["betabloquant", "digoxine", "diltiazem", "verapamil"]
            },
            alternatives: "Réévaluer la co-prescription, ECG de surveillance"
        },
        {
            id: "EV_D19",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D19",
            section: "SNC",
            titre: "Mémantine + antécédent d'épilepsie",
            message: "Mémantine avec antécédent de crise convulsive ou épilepsie active : risque d'abaissement du seuil épileptogène.",
            severite: "warning",
            condition: {
                med_keys: ["memantine"],
                comorbs: ["PAT_015"]
            },
            alternatives: "Réévaluer le bénéfice de la mémantine"
        },
        {
            id: "EV_D20",
            sources: ["STOPP3", "STOPPFRAIL"],
            ref_code: "STOPP3-D20",
            section: "SNC",
            titre: "Nootropique pour la démence (Ginkgo Biloba, piracétam...)",
            message: "Nootropiques (Ginkgo Biloba, piracétam, pramiracétam, phosphatidylsérine, modafinil, L-théanine, oméga-3, panax ginseng, rhodiola, créatine) pour la démence : aucune preuve d'efficacité. STOPPFrail recommande l'arrêt.",
            severite: "warning",
            condition: {
                med_keys: ["ginkgo", "piracetam", "pramiracetam"],
                comorbs_any: ["PAT_010", "PAT_011", "PAT_012", "PAT_013"]
            },
            alternatives: "Inhibiteurs de l'acétylcholinestérase ou mémantine si indication validée"
        },
        {
            id: "EV_D21",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D21",
            section: "SNC",
            titre: "Phénothiazine en 1ère intention (psychose/SCPD)",
            message: "Phénothiazine en première intention pour psychose ou SCPD : sédation, toxicité anticholinergique. Alternatives plus sûres existantes (exceptions : chlorpromazine pour hoquet, prochlorpérazine pour N/V/vertiges, lévomépromazine comme anti-émétique palliatif).",
            severite: "warning",
            condition: {
                med_keys: ["chlorpromazine", "levomepromazine", "cyamemazine", "propericiazine", "pipotiazine", "fluphenazine"]
            },
            alternatives: "Rispéridone faible dose (0.25-1 mg), quétiapine, aripiprazole"
        },
        {
            id: "EV_D22",
            sources: ["STOPP3"],
            ref_code: "STOPP3-D22",
            section: "SNC",
            titre: "Lévodopa/agoniste dopaminergique pour tremblement essentiel bénin",
            message: "Lévodopa ou agoniste dopaminergique pour tremblement essentiel bénin : aucune preuve d'efficacité.",
            severite: "warning",
            condition: {
                med_keys: ["levodopa", "ropinirole", "pramipexole", "rotigotine", "piribedil"],
                comorbs_absent: ["PAT_014"]
            },
            alternatives: "Propranolol, primidone"
        },
        {
            id: "EV_D24",
            sources: ["STOPP3", "BEERS", "PRISCUS", "EU7PIM"],
            ref_code: "STOPP3-D24",
            section: "SNC",
            titre: "Antihistaminique H1 1ère génération en 1ère intention (allergie/prurit)",
            message: "Antihistaminique H1 de 1ère génération en première intention pour allergie ou prurit : sédation, effets anticholinergiques. PIM selon Beers/PRISCUS. Des antihistaminiques non sédatifs sont disponibles.",
            severite: "danger",
            condition: {
                med_keys: ["antihistaminique H1 1ere generation", "hydroxyzine", "dexchlorpheniramine", "mequitazine", "promethazine", "alimemazine", "diphenhydramine", "chlorpheniramine", "brompheniramine", "doxylamine", "carbinoxamine", "cyproheptadine"]
            },
            alternatives: "Cétirizine, lévocétirizine, loratadine, desloratadine, bilastine, fexofénadine"
        },
        {
            id: "EV_D25",
            sources: ["STOPP3", "BEERS", "PRISCUS"],
            ref_code: "STOPP3-D25",
            section: "SNC",
            titre: "Antihistaminique H1 1ère génération pour insomnie",
            message: "Antihistaminique H1 de 1ère génération pour insomnie : risque élevé d'effets indésirables (sédation résiduelle, anticholinergisme, chutes). Z-drugs plus sûrs en cure courte.",
            severite: "danger",
            condition: {
                med_keys: ["hydroxyzine", "doxylamine", "diphenhydramine", "alimemazine", "promethazine"],
                comorbs: ["PAT_027"]
            },
            alternatives: "Hygiène du sommeil, mélatonine LP, Z-drug courte durée si indispensable"
        },

        // ====================================================================
        // SECTION E : SYSTÈME RÉNAL
        // ====================================================================
        {
            id: "EV_E01",
            sources: ["STOPP3"],
            ref_code: "STOPP3-E1",
            section: "Rénal",
            titre: "Digoxine ≥ 125 µg/j au long cours + DFG < 30",
            message: "Digoxine ≥ 125 µg/j au long cours (> 3 mois) avec DFG < 30 ml/min : risque de toxicité digitalique si taux plasmatique non monitoré.",
            severite: "danger",
            condition: {
                med_keys: ["digoxine"],
                bio: { "BIO_004": { op: "<", val: 30 } }
            },
            alternatives: "Réduire à 62.5 µg/j ou arrêt, dosage digoxinémie"
        },
        {
            id: "EV_E02",
            sources: ["STOPP3"],
            ref_code: "STOPP3-E2",
            section: "Rénal",
            titre: "Dabigatran + DFG < 30",
            message: "Dabigatran avec DFG < 30 ml/min : risque hémorragique majeur par accumulation.",
            severite: "danger",
            condition: {
                med_keys: ["dabigatran"],
                bio: { "BIO_004": { op: "<", val: 30 } }
            },
            alternatives: "Apixaban (dose réduite possible jusqu'à DFG 15), AVK"
        },
        {
            id: "EV_E03",
            sources: ["STOPP3"],
            ref_code: "STOPP3-E3",
            section: "Rénal",
            titre: "Anti-Xa (rivaroxaban, apixaban, edoxaban) + DFG < 15",
            message: "Inhibiteur du facteur Xa (rivaroxaban, apixaban, edoxaban) avec DFG < 15 ml/min : risque hémorragique.",
            severite: "danger",
            condition: {
                med_keys: ["rivaroxaban", "apixaban", "edoxaban"],
                bio: { "BIO_004": { op: "<", val: 15 } }
            },
            alternatives: "AVK avec monitorage INR rapproché"
        },
        {
            id: "EV_E04",
            sources: ["STOPP3", "BEERS", "PRISCUS"],
            ref_code: "STOPP3-E4",
            section: "Rénal",
            titre: "AINS + DFG < 50",
            message: "AINS avec DFG < 50 ml/min : risque de détérioration de la fonction rénale.",
            severite: "danger",
            condition: {
                med_keys: ["ains"],
                bio: { "BIO_004": { op: "<", val: 50 } }
            },
            alternatives: "Paracétamol, opioïdes faibles, topiques"
        },
        {
            id: "EV_E05",
            sources: ["STOPP3"],
            ref_code: "STOPP3-E5",
            section: "Rénal",
            titre: "Colchicine + DFG < 10",
            message: "Colchicine avec DFG < 10 ml/min : risque de toxicité sévère de la colchicine.",
            severite: "danger",
            condition: {
                med_keys: ["colchicine"],
                bio: { "BIO_004": { op: "<", val: 10 } }
            },
            alternatives: "Corticoïde oral ou intra-articulaire pour la goutte"
        },
        {
            id: "EV_E06",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-E6",
            section: "Rénal",
            titre: "Metformine + DFG < 30",
            message: "Metformine avec DFG < 30 ml/min : risque d'acidose lactique.",
            severite: "danger",
            condition: {
                med_keys: ["metformine"],
                bio: { "BIO_004": { op: "<", val: 30 } }
            },
            alternatives: "iDPP4 (linagliptine), iSGLT2 si DFG > 20, insuline"
        },
        {
            id: "EV_E07",
            sources: ["STOPP3"],
            ref_code: "STOPP3-E7",
            section: "Rénal",
            titre: "Anti-aldostérone + DFG < 30",
            message: "Anti-aldostérone (spironolactone, éplérénone) avec DFG < 30 : risque d'hyperkaliémie dangereuse.",
            severite: "danger",
            condition: {
                med_keys: ["spironolactone", "eplerenone", "aldactazine"],
                bio: { "BIO_004": { op: "<", val: 30 } }
            },
            alternatives: "Arrêt ou surveillance K+ très rapprochée"
        },
        {
            id: "EV_E08",
            sources: ["STOPP3"],
            ref_code: "STOPP3-E8",
            section: "Rénal",
            titre: "Nitrofurantoïne + DFG < 45",
            message: "Nitrofurantoïne avec DFG < 45 ml/min : risque de toxicité (neuropathie, pneumopathie).",
            severite: "danger",
            condition: {
                med_keys: ["nitrofurantoine"],
                bio: { "BIO_004": { op: "<", val: 45 } }
            },
            alternatives: "Fosfomycine-trométamol, pivmécillinam"
        },
        {
            id: "EV_E09",
            sources: ["STOPP3"],
            ref_code: "STOPP3-E9",
            section: "Rénal",
            titre: "Bisphosphonate + DFG < 30",
            message: "Bisphosphonate oral ou IV avec DFG < 30 ml/min : risque d'insuffisance rénale aiguë.",
            severite: "danger",
            condition: {
                med_keys: ["alendronate", "risedronate", "acide zoledronique", "acide zoldronique", "ibandronate"],
                bio: { "BIO_004": { op: "<", val: 30 } }
            },
            alternatives: "Dénosumab (pas de CI rénale), surveillance calcémie"
        },
        {
            id: "EV_E10",
            sources: ["STOPP3"],
            ref_code: "STOPP3-E10",
            section: "Rénal",
            titre: "Méthotrexate + DFG < 30",
            message: "Méthotrexate avec DFG < 30 ml/min : risque de toxicité sévère du méthotrexate.",
            severite: "danger",
            condition: {
                med_keys: ["methotrexate"],
                bio: { "BIO_004": { op: "<", val: 30 } }
            },
            alternatives: "Adaptation posologique ou alternatives selon indication"
        },

        // ====================================================================
        // SECTION F : GASTROINTESTINAL
        // ====================================================================
        {
            id: "EV_F01",
            sources: ["STOPP3"],
            ref_code: "STOPP3-F1",
            section: "Gastro",
            titre: "Prochlorpérazine/Métoclopramide + Parkinson",
            message: "Prochlorpérazine ou métoclopramide avec parkinsonisme : exacerbation des symptômes parkinsoniens (antagonisme dopaminergique).",
            severite: "danger",
            condition: {
                med_keys: ["metoclopramide", "prochlorperazine", "metopimazine"],
                comorbs: ["PAT_014"]
            },
            alternatives: "Dompéridone (si QTc normal), ondansétron"
        },
        {
            id: "EV_F02",
            sources: ["STOPP3", "BEERS", "STOPPFRAIL", "FORTA"],
            ref_code: "STOPP3-F2",
            section: "Gastro",
            titre: "IPP > 8 semaines à pleine dose pour ulcère non compliqué",
            message: "IPP > 8 semaines à pleine dose pour ulcère gastroduodénal non compliqué : réduction de dose ou arrêt habituellement indiqué. Maintien à demi-dose ou anti-H2 si besoin. Risque au long cours : fractures, C. difficile, hypomagnésémie, néphrite interstitielle.",
            severite: "warning",
            condition: {
                med_keys: ["omeprazole", "esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole", "ipp"]
            },
            alternatives: "Réduction de dose, passage à anti-H2, arrêt avec règles hygiéno-diététiques"
        },
        {
            id: "EV_F03",
            sources: ["STOPP3"],
            ref_code: "STOPP3-F3",
            section: "Gastro",
            titre: "Médicament constipant + constipation chronique",
            message: "Médicament constipant (anticholinergiques, fer oral, opioïdes, vérapamil, antiacides aluminiques) avec constipation chronique, quand des alternatives non constipantes existent.",
            severite: "warning",
            condition: {
                med_keys: ["verapamil", "fer oral", "opioid"],
                contexte_clinique: "constipation_chronique"
            },
            alternatives: "Laxatifs osmotiques si poursuite nécessaire, alternatives non constipantes"
        },
        {
            id: "EV_F05",
            sources: ["STOPP3"],
            ref_code: "STOPP3-F5",
            section: "Gastro",
            titre: "Corticoïde + antécédent d'ulcère ou œsophagite érosive (sans IPP)",
            message: "Corticoïde systémique avec antécédent d'ulcère ou d'œsophagite érosive, sans IPP co-prescrit : risque de rechute.",
            severite: "danger",
            condition: {
                med_keys: ["corticoide", "prednisone", "prednisolone", "methylprednisolone", "dexamethasone", "betamethasone", "hydrocortisone"],
                comorbs: ["PAT_021"],
                med_absent: ["ipp", "omeprazole", "esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole"]
            },
            alternatives: "Ajouter un IPP systématiquement"
        },
        {
            id: "EV_F07",
            sources: ["STOPP3"],
            ref_code: "STOPP3-F7",
            section: "Gastro",
            titre: "Antipsychotique + Dysphagie",
            message: "Antipsychotique avec dysphagie : risque de pneumopathie d'inhalation.",
            severite: "danger",
            condition: {
                med_keys: ["antipsychotique"],
                contexte_clinique: "dysphagie"
            },
            alternatives: "Réévaluer l'antipsychotique, textures modifiées, orthophoniste"
        },

        // ====================================================================
        // SECTION G : RESPIRATOIRE
        // ====================================================================
        {
            id: "EV_G01",
            sources: ["STOPP3"],
            ref_code: "STOPP3-G1",
            section: "Respiratoire",
            titre: "Théophylline en monothérapie pour BPCO",
            message: "Théophylline en monothérapie pour BPCO : alternatives plus sûres et efficaces. Index thérapeutique étroit, effets indésirables fréquents.",
            severite: "warning",
            condition: {
                med_keys: ["theophylline", "aminophylline"],
                comorbs: ["PAT_023"]
            },
            alternatives: "LAMA, LABA, ou association LAMA+LABA"
        },
        {
            id: "EV_G03",
            sources: ["STOPP3"],
            ref_code: "STOPP3-G3",
            section: "Respiratoire",
            titre: "LAMA + Glaucome à angle fermé / obstruction vésicale",
            message: "LAMA inhalé (tiotropium, aclidinium, uméclidinium, glycopyrronium) avec glaucome à angle fermé (exacerbation) ou obstruction vésicale (rétention urinaire).",
            severite: "danger",
            condition: {
                med_keys: ["tiotropium", "aclidinium", "umeclidinium", "glycopyrronium"]
            },
            alternatives: "LABA seul"
        },
        {
            id: "EV_G04",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-G4",
            section: "Respiratoire",
            titre: "Benzodiazépine + insuffisance respiratoire aiguë ou chronique",
            message: "Benzodiazépine avec insuffisance respiratoire aiguë ou chronique (pO2 < 8 kPa ± pCO2 > 6.5 kPa) : risque d'aggravation de l'insuffisance respiratoire.",
            severite: "danger",
            condition: {
                med_keys: ["benzodiazepine"],
                comorbs: ["PAT_023"]
            },
            alternatives: "Alternatives non sédatives, réévaluation anxiolytique"
        },

        // ====================================================================
        // SECTION H : MUSCULOSQUELETTIQUE
        // ====================================================================
        {
            id: "EV_H01",
            sources: ["STOPP3"],
            ref_code: "STOPP3-H1",
            section: "Musculo",
            titre: "AINS non-COX2 + antécédent d'ulcère/hémorragie GI (sans IPP)",
            message: "AINS non sélectif (non-COX2) avec antécédent d'ulcère ou d'hémorragie gastro-intestinale, sans IPP ou anti-H2 co-prescrit : risque de rechute.",
            severite: "danger",
            condition: {
                med_keys: ["ains"],
                comorbs: ["PAT_021"],
                med_absent: ["ipp", "omeprazole", "esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole"]
            },
            alternatives: "Paracétamol, AINS COX-2 + IPP, topiques"
        },
        {
            id: "EV_H02",
            sources: ["STOPP3"],
            ref_code: "STOPP3-H2",
            section: "Musculo",
            titre: "AINS + HTA sévère (PAS > 170 et/ou PAD > 100)",
            message: "AINS avec HTA sévère (PAS > 170 et/ou PAD > 100 mmHg de façon persistante) : exacerbation de l'HTA.",
            severite: "danger",
            condition: {
                med_keys: ["ains"],
                comorbs: ["PAT_005"]
            },
            alternatives: "Paracétamol, topiques, opioïdes faibles"
        },
        {
            id: "EV_H03",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-H3",
            section: "Musculo",
            titre: "AINS > 3 mois pour arthrose (paracétamol non essayé)",
            message: "AINS au long cours (> 3 mois) pour douleur d'arthrose quand le paracétamol n'a pas été essayé : les antalgiques simples sont préférables et habituellement aussi efficaces.",
            severite: "warning",
            condition: {
                med_keys: ["ains"]
            },
            alternatives: "Paracétamol, topiques AINS, kinésithérapie, infiltrations"
        },
        {
            id: "EV_H06",
            sources: ["STOPP3"],
            ref_code: "STOPP3-H6",
            section: "Musculo",
            titre: "AINS ou colchicine > 3 mois pour prévention goutte (sans inhibiteur xanthine-oxydase)",
            message: "AINS ou colchicine > 3 mois pour la prévention des crises de goutte, alors qu'un inhibiteur de la xanthine-oxydase n'est pas contre-indiqué.",
            severite: "warning",
            condition: {
                med_keys: ["ains", "colchicine"],
                comorbs: ["PAT_024"],
                med_absent: ["allopurinol", "febuxostat"]
            },
            alternatives: "Allopurinol ou fébuxostat en prévention"
        },
        {
            id: "EV_H07",
            sources: ["STOPP3"],
            ref_code: "STOPP3-H7",
            section: "Musculo",
            titre: "AINS + Corticoïde concomitant (rhumatisme)",
            message: "AINS avec corticoïde concomitant pour pathologie rhumatismale : risque élevé d'ulcère gastroduodénal.",
            severite: "danger",
            condition: {
                med_keys: ["ains"],
                med_keys_2: ["corticoide", "prednisone", "prednisolone", "methylprednisolone", "dexamethasone"]
            },
            alternatives: "Choisir l'un ou l'autre, ajouter un IPP si association inévitable"
        },
        {
            id: "EV_H09",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-H9",
            section: "Musculo",
            titre: "Opioïde au long cours pour arthrose",
            message: "Opioïde au long cours pour l'arthrose : manque de preuve d'efficacité, effets indésirables graves (chutes, constipation, confusion, dépendance).",
            severite: "warning",
            condition: {
                med_keys: ["opioid", "tramadol", "codeine", "morphine", "oxycodone", "fentanyl", "buprenorphine"]
            },
            alternatives: "Paracétamol, AINS topiques, duloxétine, kinésithérapie, infiltrations"
        },

        // ====================================================================
        // SECTION I : UROGENITAL
        // ====================================================================
        {
            id: "EV_I01",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-I1",
            section: "Urogénital",
            titre: "Antimuscarinique systémique + Démence",
            message: "Antimuscarinique systémique avec démence ou trouble cognitif chronique : confusion accrue, agitation. PIM selon Beers.",
            severite: "danger",
            condition: {
                med_keys: ["oxybutynine", "tolterodine", "solifenacine", "fesoterodine", "trospium", "flavoxate", "darifenacine"],
                comorbs_any: ["PAT_010", "PAT_011", "PAT_012", "PAT_013"]
            },
            alternatives: "Mirabégron (si pas d'HTA sévère), rééducation périnéale"
        },
        {
            id: "EV_I04",
            sources: ["STOPP3"],
            ref_code: "STOPP3-I4",
            section: "Urogénital",
            titre: "Antimuscarinique systémique + Constipation",
            message: "Antimuscarinique systémique avec constipation : exacerbation de la constipation.",
            severite: "warning",
            condition: {
                med_keys: ["oxybutynine", "tolterodine", "solifenacine", "fesoterodine", "trospium", "flavoxate", "darifenacine"],
                contexte_clinique: "constipation_chronique"
            },
            alternatives: "Mirabégron, rééducation périnéale, laxatifs si poursuite"
        },
        {
            id: "EV_I05",
            sources: ["STOPP3"],
            ref_code: "STOPP3-I5",
            section: "Urogénital",
            titre: "Alpha-1 bloquant (sauf silodosine) + hypotension orthostatique / syncope",
            message: "Alpha-1 bloquant (alfuzosine, doxazosine, indoramine, tamsulosine, térazosine) — sauf silodosine — avec hypotension orthostatique symptomatique ou antécédent de syncope : syncope récurrente.",
            severite: "danger",
            condition: {
                med_keys: ["alfuzosine", "doxazosine", "tamsulosine", "terazosine"],
                comorbs: ["PAT_009"]
            },
            alternatives: "Silodosine (plus urosélectif), inhibiteur 5-alpha-réductase"
        },
        {
            id: "EV_I06",
            sources: ["STOPP3"],
            ref_code: "STOPP3-I6",
            section: "Urogénital",
            titre: "Mirabégron + HTA sévère ou labile",
            message: "Mirabégron avec HTA sévère ou labile : exacerbation de l'HTA.",
            severite: "warning",
            condition: {
                med_keys: ["mirabegron"],
                comorbs: ["PAT_005"]
            },
            alternatives: "Rééducation périnéale, antimuscarinique si pas de CI"
        },
        {
            id: "EV_I08",
            sources: ["STOPP3"],
            ref_code: "STOPP3-I8",
            section: "Urogénital",
            titre: "Antibiotique pour bactériurie asymptomatique",
            message: "Antibiothérapie pour bactériurie asymptomatique : pas d'indication de traitement (sauf situations spécifiques : chirurgie urologique, grossesse).",
            severite: "warning",
            condition: { type: "manual_review" },
            alternatives: "Abstention thérapeutique"
        },

        // ====================================================================
        // SECTION J : ENDOCRINE
        // ====================================================================
        {
            id: "EV_J01",
            sources: ["STOPP3", "BEERS", "PRISCUS", "FORTA"],
            ref_code: "STOPP3-J1",
            section: "Endocrine",
            titre: "Sulfamide à longue demi-vie (glibenclamide, chlorpropamide, glimépiride)",
            message: "Sulfamide hypoglycémiant à longue demi-vie chez le diabétique de type 2 : risque d'hypoglycémie prolongée. PIM selon Beers, PRISCUS et FORTA-D.",
            severite: "danger",
            condition: {
                med_keys: ["glibenclamide", "chlorpropamide", "glimepiride"]
            },
            alternatives: "Gliclazide (demi-vie plus courte), iDPP4, iSGLT2, metformine"
        },
        {
            id: "EV_J02",
            sources: ["STOPP3"],
            ref_code: "STOPP3-J2",
            section: "Endocrine",
            titre: "Thiazolidinedione + IC",
            message: "Thiazolidinedione (rosiglitazone, pioglitazone) avec IC : exacerbation de l'insuffisance cardiaque (rétention hydrosodée).",
            severite: "danger",
            condition: {
                med_keys: ["pioglitazone", "rosiglitazone"],
                comorbs_any: ["PAT_001", "PAT_002", "PAT_003"]
            },
            alternatives: "Metformine, iDPP4, iSGLT2 (bénéfice cardiovasculaire)"
        },
        {
            id: "EV_J03",
            sources: ["STOPP3"],
            ref_code: "STOPP3-J3",
            section: "Endocrine",
            titre: "Bêtabloquant non cardiosélectif + Diabète avec hypoglycémies fréquentes",
            message: "Bêtabloquant non cardiosélectif (hors bisoprolol, nébivolol, métoprolol, carvédilol) avec diabète et hypoglycémies fréquentes : masquage des symptômes d'hypoglycémie.",
            severite: "danger",
            condition: {
                med_keys: ["propranolol", "nadolol", "sotalol", "pindolol", "timolol", "tertatolol", "labetalol"],
                comorbs: ["PAT_016"]
            },
            alternatives: "Bêtabloquant cardiosélectif (bisoprolol, nébivolol, métoprolol)"
        },
        {
            id: "EV_J04",
            sources: ["STOPP3"],
            ref_code: "STOPP3-J4",
            section: "Endocrine",
            titre: "iSGLT2 + Hypotension symptomatique",
            message: "Inhibiteur SGLT2 (canagliflozine, dapagliflozine, empagliflozine, ertugliflozine) avec hypotension symptomatique : exacerbation de l'hypotension (effet diurétique osmotique).",
            severite: "warning",
            condition: {
                med_keys: ["canagliflozin", "dapagliflozin", "empagliflozin", "ertugliflozin", "sglt2", "isglt2"],
                comorbs: ["PAT_009"]
            },
            alternatives: "Réduire les autres antihypertenseurs/diurétiques, hydratation"
        },
        {
            id: "EV_J09",
            sources: ["STOPP3"],
            ref_code: "STOPP3-J9",
            section: "Endocrine",
            titre: "Lévothyroxine pour hypothyroïdie infraclinique (TSH < 10)",
            message: "Lévothyroxine pour hypothyroïdie infraclinique (T4L normale, TSH élevée mais < 10 mUI/L) : aucune preuve de bénéfice, risque de thyrotoxicose iatrogène.",
            severite: "warning",
            condition: {
                med_keys: ["levothyroxine"]
            },
            alternatives: "Surveillance TSH semestrielle, traiter uniquement si TSH > 10 ou symptômes"
        },
        {
            id: "EV_J10",
            sources: ["STOPP3"],
            ref_code: "STOPP3-J10",
            section: "Endocrine",
            titre: "Desmopressine pour incontinence/pollakiurie",
            message: "Analogue de la vasopressine (desmopressine) pour incontinence urinaire ou pollakiurie : risque d'hyponatrémie symptomatique.",
            severite: "danger",
            condition: {
                med_keys: ["desmopressine"]
            },
            alternatives: "Rééducation périnéale, antimuscarinique, mirabégron"
        },

        // ====================================================================
        // SECTION K : RISQUE DE CHUTE
        // ====================================================================
        {
            id: "EV_K01",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-K1",
            section: "Chutes",
            titre: "Benzodiazépine chez patient chuteur",
            message: "Benzodiazépine chez patient avec antécédent de chutes : sédation diurne, altération du sensorium, déséquilibre.",
            severite: "danger",
            condition: {
                med_keys: ["benzodiazepine"],
                contexte_clinique: "chutes"
            },
            alternatives: "Sevrage progressif, TCC, mélatonine LP"
        },
        {
            id: "EV_K02",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-K2",
            section: "Chutes",
            titre: "Antipsychotique chez patient chuteur",
            message: "Antipsychotique chez patient avec antécédent de chutes : parkinsonisme, sédation.",
            severite: "danger",
            condition: {
                med_keys: ["antipsychotique"],
                contexte_clinique: "chutes"
            },
            alternatives: "Réévaluer l'indication, réduire la dose"
        },
        {
            id: "EV_K03",
            sources: ["STOPP3"],
            ref_code: "STOPP3-K3",
            section: "Chutes",
            titre: "Vasodilatateur chez patient chuteur / hypotension orthostatique",
            message: "Vasodilatateur chez patient chuteur ou avec hypotension orthostatique persistante (PAS ≥ 20 mmHg et/ou PAD ≥ 10 mmHg) : syncope, chutes.",
            severite: "danger",
            condition: {
                med_keys: ["vasodilatateur", "nifedipine", "amlodipine", "nicardipine", "lercanidipine", "felodipine"],
                comorbs: ["PAT_009"]
            },
            alternatives: "Réduire la dose, changer de classe, mesures non pharmacologiques"
        },
        {
            id: "EV_K04",
            sources: ["STOPP3"],
            ref_code: "STOPP3-K4",
            section: "Chutes",
            titre: "Z-drug chez patient chuteur",
            message: "Z-drug (zopiclone, zolpidem, zaleplon) chez patient avec antécédent de chutes : sédation diurne, ataxie.",
            severite: "danger",
            condition: {
                med_keys: ["zolpidem", "zopiclone", "zaleplon"],
                contexte_clinique: "chutes"
            },
            alternatives: "Hygiène du sommeil, mélatonine LP"
        },
        {
            id: "EV_K05",
            sources: ["STOPP3"],
            ref_code: "STOPP3-K5",
            section: "Chutes",
            titre: "Antiépileptique chez patient chuteur",
            message: "Antiépileptique chez patient chuteur : altération du sensorium et de la fonction cérébelleuse.",
            severite: "warning",
            condition: {
                med_keys: ["antiepileptique", "valproate", "carbamazepine", "phenytoine", "phenobarbital", "pregabaline", "gabapentine", "levetiracetam", "lamotrigine", "topiramate"],
                contexte_clinique: "chutes"
            },
            alternatives: "Réévaluer l'indication et la posologie"
        },
        {
            id: "EV_K06",
            sources: ["STOPP3", "BEERS", "PRISCUS"],
            ref_code: "STOPP3-K6",
            section: "Chutes",
            titre: "Antihistaminique H1 1ère gén. chez patient chuteur",
            message: "Antihistaminique H1 de 1ère génération chez patient chuteur : altération du sensorium.",
            severite: "danger",
            condition: {
                med_keys: ["hydroxyzine", "dexchlorpheniramine", "mequitazine", "promethazine", "alimemazine", "diphenhydramine", "chlorpheniramine", "doxylamine"],
                contexte_clinique: "chutes"
            },
            alternatives: "Antihistaminique H1 2ème génération (cétirizine, loratadine)"
        },
        {
            id: "EV_K07",
            sources: ["STOPP3"],
            ref_code: "STOPP3-K7",
            section: "Chutes",
            titre: "Opioïde chez patient chuteur",
            message: "Opioïde chez patient chuteur : altération du sensorium.",
            severite: "warning",
            condition: {
                med_keys: ["opioid", "tramadol", "codeine", "morphine", "oxycodone", "fentanyl"],
                contexte_clinique: "chutes"
            },
            alternatives: "Paracétamol, AINS topiques, approches non pharmacologiques"
        },
        {
            id: "EV_K08",
            sources: ["STOPP3"],
            ref_code: "STOPP3-K8",
            section: "Chutes",
            titre: "Antidépresseur chez patient chuteur",
            message: "Antidépresseur (toutes classes) chez patient chuteur : altération du sensorium.",
            severite: "warning",
            condition: {
                med_keys: ["antidepresseur", "isrs", "irsn", "mirtazapine", "venlafaxine", "duloxetine", "sertraline", "citalopram", "escitalopram", "fluoxetine", "paroxetine"],
                contexte_clinique: "chutes"
            },
            alternatives: "Réévaluer l'indication, psychothérapie si possible"
        },
        {
            id: "EV_K09",
            sources: ["STOPP3"],
            ref_code: "STOPP3-K9",
            section: "Chutes",
            titre: "Alpha-bloquant antihypertenseur chez patient chuteur",
            message: "Alpha-bloquant antihypertenseur chez patient chuteur : hypotension orthostatique.",
            severite: "danger",
            condition: {
                med_keys: ["doxazosine", "prazosine", "urapidil"],
                contexte_clinique: "chutes"
            },
            alternatives: "Autre classe antihypertensive"
        },
        {
            id: "EV_K10",
            sources: ["STOPP3"],
            ref_code: "STOPP3-K10",
            section: "Chutes",
            titre: "Alpha-bloquant prostatique (sauf silodosine) chez patient chuteur",
            message: "Alpha-bloquant pour symptômes prostatiques (sauf silodosine) chez patient chuteur : hypotension orthostatique.",
            severite: "danger",
            condition: {
                med_keys: ["alfuzosine", "tamsulosine", "terazosine"],
                contexte_clinique: "chutes"
            },
            alternatives: "Silodosine, inhibiteur 5-alpha-réductase"
        },
        {
            id: "EV_K12",
            sources: ["STOPP3"],
            ref_code: "STOPP3-K12",
            section: "Chutes",
            titre: "Antimuscarinique pour vessie hyperactive chez patient chuteur",
            message: "Antimuscarinique pour hyperactivité vésicale ou incontinence d'urgence chez patient chuteur : altération du sensorium.",
            severite: "warning",
            condition: {
                med_keys: ["oxybutynine", "tolterodine", "solifenacine", "fesoterodine", "trospium", "darifenacine"],
                contexte_clinique: "chutes"
            },
            alternatives: "Mirabégron, rééducation périnéale"
        },

        // ====================================================================
        // SECTION L : ANTALGIQUES
        // ====================================================================
        {
            id: "EV_L01",
            sources: ["STOPP3", "BEERS"],
            ref_code: "STOPP3-L1",
            section: "Antalgiques",
            titre: "Opioïde fort en 1ère intention pour douleur légère",
            message: "Opioïde fort (morphine, oxycodone, fentanyl, buprénorphine, méthadone, tramadol, péthidine) en première intention pour douleur légère : non-respect de l'échelle OMS.",
            severite: "danger",
            condition: {
                med_keys: ["morphine", "oxycodone", "fentanyl", "buprenorphine", "methadone", "tramadol", "pethidine"]
            },
            alternatives: "Paracétamol en premier, AINS si non CI, palier 2 avant palier 3"
        },
        {
            id: "EV_L02",
            sources: ["STOPP3"],
            ref_code: "STOPP3-L2",
            section: "Antalgiques",
            titre: "Opioïde quotidien régulier sans laxatif co-prescrit",
            message: "Opioïde en usage quotidien régulier (hors PRN) sans laxatif co-prescrit : constipation sévère prévisible.",
            severite: "warning",
            condition: {
                med_keys: ["morphine", "oxycodone", "fentanyl", "buprenorphine", "tramadol", "codeine"],
                med_absent: ["macrogol", "lactulose", "bisacodyl", "naloxone"]
            },
            alternatives: "Ajouter macrogol ou laxatif osmotique systématiquement"
        },
        {
            id: "EV_L05",
            sources: ["STOPP3"],
            ref_code: "STOPP3-L5",
            section: "Antalgiques",
            titre: "Gabapentinoïde pour douleur non neuropathique",
            message: "Gabapentinoïde (gabapentine, prégabaline) pour douleur non neuropathique : manque de preuve d'efficacité.",
            severite: "warning",
            condition: {
                med_keys: ["gabapentine", "pregabaline"]
            },
            alternatives: "Réserver aux douleurs neuropathiques documentées"
        },
        {
            id: "EV_L06",
            sources: ["STOPP3"],
            ref_code: "STOPP3-L6",
            section: "Antalgiques",
            titre: "Paracétamol ≥ 3 g/j + dénutrition (BMI < 18) ou hépatopathie",
            message: "Paracétamol ≥ 3 g/j avec dénutrition sévère (BMI < 18) ou hépatopathie chronique : risque d'hépatotoxicité. Réduire à 2 g/j max.",
            severite: "danger",
            condition: {
                med_keys: ["paracetamol"],
                contexte_clinique: "denutrition"
            },
            alternatives: "Paracétamol ≤ 2 g/j, alternatives antalgiques"
        },

        // ====================================================================
        // SECTION M : CHARGE ANTICHOLINERGIQUE
        // ====================================================================
        {
            id: "EV_M01",
            sources: ["STOPP3", "BEERS", "PRISCUS", "FORTA", "EU7PIM"],
            ref_code: "STOPP3-M1",
            section: "Anticholinergique",
            titre: "≥ 2 médicaments à effet anticholinergique concomitants",
            message: "Usage concomitant de ≥ 2 médicaments à propriétés anticholinergiques (antispasmodiques vésicaux/intestinaux, tricycliques, antihistaminiques H1 1ère gén., antipsychotiques) : toxicité anticholinergique cumulée (confusion, rétention urinaire, constipation, sécheresse buccale, tachycardie). PIM universel.",
            severite: "danger",
            condition: {
                acb_cumul: true,
                acb_seuil: 3
            },
            alternatives: "Réduire le nombre de médicaments anticholinergiques, choisir des alternatives à faible charge ACB"
        },

        // ====================================================================
        // BEERS SPÉCIFIQUES (non couverts par STOPP3)
        // ====================================================================
        {
            id: "EV_BEERS_01",
            sources: ["BEERS", "PRISCUS"],
            ref_code: "BEERS-SNC",
            section: "SNC",
            titre: "Méprobamate, barbituriques",
            message: "Méprobamate et barbituriques (sauf phénobarbital en épilepsie) : dépendance élevée, toxicité, index thérapeutique étroit. PIM absolu selon Beers et PRISCUS.",
            severite: "danger",
            condition: {
                med_keys: ["meprobamate", "phenobarbital", "barbiturique"]
            },
            alternatives: "Benzodiazépine courte durée si indispensable (lorazépam, oxazépam)"
        },
        {
            id: "EV_BEERS_02",
            sources: ["BEERS"],
            ref_code: "BEERS-ENDO",
            section: "Endocrine",
            titre: "Insuline sliding scale seule (sans basale)",
            message: "Insuline « sliding scale » seule (sans insuline basale) en gériatrie : risque de déséquilibre glycémique et d'hypoglycémie.",
            severite: "warning",
            condition: {
                med_keys: ["insuline"],
                contexte_clinique: "sliding_scale"
            },
            alternatives: "Schéma basal-bolus adapté, cibles HbA1c < 8% si fragile"
        },
        {
            id: "EV_BEERS_03",
            sources: ["BEERS", "PRISCUS", "EU7PIM"],
            ref_code: "BEERS-MUSC",
            section: "Musculo",
            titre: "Myorelaxants à éviter (méthocarbamol, tizanidine, baclofène systémique)",
            message: "Myorelaxants systémiques (méthocarbamol, tizanidine, baclofène oral à haute dose) : sédation, effets anticholinergiques, efficacité non prouvée à long terme. PIM selon Beers/PRISCUS.",
            severite: "warning",
            condition: {
                med_keys: ["methocarbamol", "tizanidine", "baclofene", "thiocolchicoside"]
            },
            alternatives: "Kinésithérapie, paracétamol, AINS topiques"
        },
        {
            id: "EV_BEERS_04",
            sources: ["BEERS", "PRISCUS"],
            ref_code: "BEERS-GI",
            section: "Gastro",
            titre: "Métoclopramide au long cours (> 12 semaines)",
            message: "Métoclopramide au long cours (> 12 semaines) : risque de dyskinésie tardive irréversible. PIM selon Beers/PRISCUS.",
            severite: "danger",
            condition: {
                med_keys: ["metoclopramide"]
            },
            alternatives: "Dompéridone (si QTc normal), ondansétron, mesures hygiéno-diététiques"
        },

        // ====================================================================
        // PRISCUS 2.0 SPÉCIFIQUES
        // ====================================================================
        {
            id: "EV_PRISC_01",
            sources: ["PRISCUS", "BEERS"],
            ref_code: "PRISCUS-CV",
            section: "Cardiovasculaire",
            titre: "Nifédipine à libération immédiate",
            message: "Nifédipine à libération immédiate : hypotension brutale, ischémie réflexe. PIM absolu selon PRISCUS et Beers.",
            severite: "danger",
            condition: {
                med_keys: ["nifedipine"]
            },
            alternatives: "Nifédipine LP ou autre inhibiteur calcique DHP LP (amlodipine, lercanidipine)"
        },
        {
            id: "EV_PRISC_02",
            sources: ["PRISCUS", "EU7PIM"],
            ref_code: "PRISCUS-SNC",
            section: "SNC",
            titre: "Flupentixol, fluphénazine, halopéridol > 2 mg/j",
            message: "Antipsychotiques de 1ère génération à dose élevée (halopéridol > 2 mg/j, flupentixol, fluphénazine) : risque élevé d'effets extrapyramidaux chez le sujet âgé. PIM PRISCUS.",
            severite: "danger",
            condition: {
                med_keys: ["flupentixol", "fluphenazine", "haloperidol"]
            },
            alternatives: "Quétiapine faible dose, aripiprazole, rispéridone ≤ 1 mg"
        },
        {
            id: "EV_PRISC_03",
            sources: ["PRISCUS", "BEERS"],
            ref_code: "PRISCUS-URO",
            section: "Urogénital",
            titre: "Oxybutynine (toutes formes)",
            message: "Oxybutynine : anticholinergique le plus à risque en gériatrie (passage BHE élevé, confusion, déclin cognitif). PIM absolu selon PRISCUS et Beers.",
            severite: "danger",
            condition: {
                med_keys: ["oxybutynine"]
            },
            alternatives: "Mirabégron, trospium (ne passe pas la BHE), rééducation périnéale"
        },

        // ====================================================================
        // STOPPFrail v2 SPÉCIFIQUES (patient fragile / fin de vie)
        // ====================================================================
        {
            id: "EV_SF01",
            sources: ["STOPPFRAIL"],
            ref_code: "STOPPFrail-1",
            section: "Prévention",
            titre: "Statine (patient fragile, espérance de vie limitée)",
            message: "STOPPFrail : Statine chez patient sévèrement fragile ou en fin de vie. La prévention primaire n'apporte pas de bénéfice à court terme. Envisager l'arrêt même en prévention secondaire si espérance de vie < 1-2 ans.",
            severite: "warning",
            condition: {
                med_keys: ["statine", "atorvastatine", "rosuvastatine", "simvastatine", "pravastatine"],
                fragile: true
            },
            alternatives: "Déprescription avec réévaluation"
        },
        {
            id: "EV_SF02",
            sources: ["STOPPFRAIL"],
            ref_code: "STOPPFrail-2",
            section: "Prévention",
            titre: "Antihypertenseur chez le très fragile",
            message: "STOPPFrail : Réévaluer les antihypertenseurs chez les patients très fragiles avec PAS < 120 mmHg ou hypotension orthostatique symptomatique. Cible PAS adaptée à la fragilité (< 150 voire < 160 mmHg).",
            severite: "warning",
            condition: {
                med_keys: ["antihypertenseur", "iec", "ara2", "inhibiteur calcique", "diuretique", "betabloquant"],
                fragile: true,
                comorbs: ["PAT_009"]
            },
            alternatives: "Réduction des doses, déprescription progressive"
        },
        {
            id: "EV_SF03",
            sources: ["STOPPFRAIL"],
            ref_code: "STOPPFrail-3",
            section: "Endocrine",
            titre: "Antidiabétique oral si HbA1c < 8% chez fragile",
            message: "STOPPFrail : Antidiabétiques oraux à réévaluer chez les patients très fragiles si HbA1c < 8%. Cibles glycémiques assouplies (HbA1c 7.5-8.5%). Risque d'hypoglycémie > bénéfice.",
            severite: "warning",
            condition: {
                med_keys: ["metformine", "gliclazide", "glibenclamide", "glimepiride", "sitagliptine", "vildagliptine", "saxagliptine", "linagliptine", "repaglinide"],
                fragile: true,
                bio: { "BIO_026": { op: "<", val: 8.0 } }
            },
            alternatives: "Assouplir les cibles, simplifier le schéma, déprescription prudente"
        },
        {
            id: "EV_SF04",
            sources: ["STOPPFRAIL"],
            ref_code: "STOPPFrail-4",
            section: "Prévention",
            titre: "Bisphosphonate / Dénosumab (espérance de vie < 2 ans)",
            message: "STOPPFrail : Anti-ostéoporotiques (bisphosphonates, dénosumab) chez patient avec espérance de vie estimée < 2 ans. Bénéfice sur les fractures non attendu à court terme.",
            severite: "warning",
            condition: {
                med_keys: ["alendronate", "risedronate", "acide zoledronique", "denosumab", "ibandronate"],
                fragile: true
            },
            alternatives: "Maintenir vitamine D + calcium, prévention des chutes"
        },
        {
            id: "EV_SF05",
            sources: ["STOPPFRAIL", "REMEDIES"],
            ref_code: "STOPPFrail-5",
            section: "Gastro",
            titre: "IPP au long cours sans indication claire chez fragile",
            message: "STOPPFrail / REMEDIES : IPP au long cours sans indication claire (pas d'ulcère, pas d'oesophagite, pas de Barrett, pas de double antiagrégation/anticoagulation) chez patient fragile. Réévaluer systématiquement.",
            severite: "warning",
            condition: {
                med_keys: ["omeprazole", "esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole", "ipp"],
                fragile: true
            },
            alternatives: "Arrêt progressif (demi-dose 2-4 semaines puis arrêt), anti-H2 si besoin"
        },
        {
            id: "EV_SF06",
            sources: ["STOPPFRAIL"],
            ref_code: "STOPPFrail-6",
            section: "SNC",
            titre: "Inhibiteur acétylcholinestérase / Mémantine si démence sévère (MMSE < 10)",
            message: "STOPPFrail : Inhibiteur de l'acétylcholinestérase ou mémantine si démence sévère (MMSE < 10 ou stade avancé) ou si pas de bénéfice observé. Envisager l'arrêt progressif.",
            severite: "warning",
            condition: {
                med_keys: ["donepezil", "rivastigmine", "galantamine", "memantine"],
                fragile: true,
                comorbs_any: ["PAT_010", "PAT_011", "PAT_012"]
            },
            alternatives: "Arrêt progressif avec surveillance, soins de support"
        },
        {
            id: "EV_SF07",
            sources: ["STOPPFRAIL"],
            ref_code: "STOPPFrail-7",
            section: "Prévention",
            titre: "Supplémentation en fer oral si pas d'anémie ferriprive documentée chez fragile",
            message: "STOPPFrail : Suppléments de fer oral chez patient fragile sans anémie ferriprive documentée. Effets indésirables GI fréquents (constipation, nausées).",
            severite: "warning",
            condition: {
                med_keys: ["fer", "fumarate ferreux", "sulfate ferreux", "ascorbate ferreux"],
                fragile: true
            },
            alternatives: "Vérifier ferritine/CST avant de supplémenter"
        },

        // ====================================================================
        // FORTA-D SPÉCIFIQUES (à éviter formellement)
        // ====================================================================
        {
            id: "EV_FORTA_01",
            sources: ["FORTA"],
            ref_code: "FORTA-D-DIPY",
            section: "Coagulation",
            titre: "Dipyridamole (FORTA-D)",
            message: "FORTA-D : Dipyridamole à éviter chez le sujet âgé (effets vasodilatateurs, céphalées, syncope). Bénéfice non démontré en prévention cardiovasculaire chez l'âgé.",
            severite: "warning",
            condition: {
                med_keys: ["dipyridamole"]
            },
            alternatives: "Clopidogrel, aspirine faible dose"
        },
        {
            id: "EV_FORTA_02",
            sources: ["FORTA"],
            ref_code: "FORTA-D-DIGI",
            section: "Cardiovasculaire",
            titre: "Digoxine dans l'IC (FORTA-D sauf FA)",
            message: "FORTA-D : Digoxine dans l'insuffisance cardiaque en rythme sinusal — rapport bénéfice/risque défavorable chez le sujet âgé.",
            severite: "warning",
            condition: {
                med_keys: ["digoxine"],
                comorbs_any: ["PAT_001", "PAT_002", "PAT_003"],
                comorbs_absent: ["PAT_006"]
            },
            alternatives: "Optimiser IEC/ARA2/ARNI, bêtabloquant, ARM, iSGLT2"
        },
        {
            id: "EV_FORTA_03",
            sources: ["FORTA", "BEERS", "PRISCUS"],
            ref_code: "FORTA-D-AMITRI",
            section: "SNC",
            titre: "Amitriptyline (FORTA-D)",
            message: "FORTA-D / Beers / PRISCUS : Amitriptyline — anticholinergique puissant (ACB=3), cardiotoxicité, sédation excessive. PIM absolu chez le sujet âgé.",
            severite: "danger",
            condition: {
                med_keys: ["amitriptyline"]
            },
            alternatives: "ISRS (sertraline, escitalopram), mirtazapine, duloxétine pour douleur neuropathique"
        },
        {
            id: "EV_FORTA_04",
            sources: ["FORTA", "BEERS"],
            ref_code: "FORTA-D-DOXEP",
            section: "SNC",
            titre: "Doxépine > 6 mg/j (FORTA-D)",
            message: "FORTA-D / Beers : Doxépine à dose > 6 mg/j — sédation excessive, effets anticholinergiques. Seule la doxépine ≤ 6 mg au coucher est acceptable pour l'insomnie.",
            severite: "danger",
            condition: {
                med_keys: ["doxepine"]
            },
            alternatives: "Doxépine ≤ 6 mg si insomnie, sinon ISRS"
        },

        // ====================================================================
        // PIM-CHECK SPÉCIFIQUES
        // ====================================================================
        {
            id: "EV_PIM_01",
            sources: ["PIM_CHECK"],
            ref_code: "PIM-Check-1",
            section: "Cardiovasculaire",
            titre: "Dronédarone + IC (PIM-Check)",
            message: "PIM-Check : Dronédarone avec insuffisance cardiaque — surmortalité démontrée (étude PALLAS). Contre-indication absolue.",
            severite: "danger",
            condition: {
                med_keys: ["dronedarone"],
                comorbs_any: ["PAT_001", "PAT_002", "PAT_003"]
            },
            alternatives: "Amiodarone (si nécessaire et sous surveillance) ou bêtabloquant"
        },
        {
            id: "EV_PIM_02",
            sources: ["PIM_CHECK", "PRISCUS"],
            ref_code: "PIM-Check-2",
            section: "Cardiovasculaire",
            titre: "Flécaïnide / Propafénone + cardiopathie structurelle",
            message: "PIM-Check / PRISCUS : Flécaïnide ou propafénone avec cardiopathie structurelle (IC, coronaropathie) : risque de proarythmie sévère.",
            severite: "danger",
            condition: {
                med_keys: ["flecainide", "propafenone"],
                comorbs_any: ["PAT_001", "PAT_002", "PAT_003", "PAT_004"]
            },
            alternatives: "Amiodarone, ablation de FA, contrôle de fréquence"
        },
        {
            id: "EV_PIM_03",
            sources: ["PIM_CHECK"],
            ref_code: "PIM-Check-3",
            section: "SNC",
            titre: "Citalopram > 20 mg/j chez le sujet âgé (PIM-Check)",
            message: "PIM-Check : Citalopram à dose > 20 mg/j chez le sujet > 65 ans — allongement dose-dépendant du QTc. Dose maximale : 20 mg/j.",
            severite: "danger",
            condition: {
                med_keys: ["citalopram"],
                age_min: 65
            },
            alternatives: "Citalopram ≤ 20 mg/j, sertraline, escitalopram ≤ 10 mg"
        },
        {
            id: "EV_PIM_04",
            sources: ["PIM_CHECK"],
            ref_code: "PIM-Check-4",
            section: "SNC",
            titre: "Escitalopram > 10 mg/j chez le sujet âgé (PIM-Check)",
            message: "PIM-Check : Escitalopram à dose > 10 mg/j chez le sujet > 65 ans — allongement dose-dépendant du QTc. Dose maximale : 10 mg/j.",
            severite: "danger",
            condition: {
                med_keys: ["escitalopram"],
                age_min: 65
            },
            alternatives: "Escitalopram ≤ 10 mg/j, sertraline"
        },

        // ====================================================================
        // REMEDIES SPÉCIFIQUES
        // ====================================================================
        {
            id: "EV_REM_01",
            sources: ["REMEDIES"],
            ref_code: "REMEDIES-1",
            section: "Prévention",
            titre: "Polypharmacie sans réévaluation (REMEDIES)",
            message: "REMEDIES : ≥ 5 médicaments — réévaluation systématique de chaque traitement chronique au moins 1 fois/an. Rechercher les prescriptions en cascade et les médicaments sans bénéfice attendu.",
            severite: "warning",
            condition: {
                polypharmacie: true,
                seuil: 5
            },
            alternatives: "Réévaluation globale (déprescription), outils STOPP/START"
        },
        {
            id: "EV_REM_02",
            sources: ["REMEDIES", "STOPPFRAIL"],
            ref_code: "REMEDIES-2",
            section: "Prévention",
            titre: "Supplément multivitamines sans carence documentée",
            message: "REMEDIES / STOPPFrail : Supplément multivitamines ou minéraux sans carence documentée — pas de bénéfice prouvé, risque d'interactions et de surdosage.",
            severite: "warning",
            condition: { type: "manual_review" },
            alternatives: "Dosages biologiques avant supplémentation"
        }
    ],

    // ========================================================================
    //  RÈGLES INITIER (START / Beers START / FORTA-A / REMEDIES)
    // ========================================================================
    INITIER: [

        // ====================================================================
        // SECTION A : INDICATION GÉNÉRALE
        // ====================================================================
        {
            id: "IN_A01",
            sources: ["STOPP3"],
            ref_code: "START3-A1",
            section: "Indication",
            titre: "Initier un médicament clairement indiqué",
            message: "Quand un médicament est clairement indiqué et approprié dans le contexte clinique, sans contre-indication claire, il doit être initié selon les recommandations posologiques.",
            severite: "info",
            condition: { type: "manual_review" },
            alternatives: ""
        },

        // ====================================================================
        // SECTION B : CARDIOVASCULAIRE
        // ====================================================================
        {
            id: "IN_B01",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-B1",
            section: "Cardiovasculaire",
            titre: "Antihypertenseur si PAS > 140 (ou > 150 si fragile)",
            message: "Initier un antihypertenseur pour PAS > 140 mmHg et/ou PAD > 90 mmHg, sauf si fragilité modérée-sévère (seuils relevés à 150/90 mmHg).",
            severite: "warning",
            condition: {
                comorbs: ["PAT_005"],
                med_absent: ["iec", "ara2", "inhibiteur calcique", "diuretique", "betabloquant", "antihypertenseur"]
            },
            alternatives: "IEC, ARA2, inhibiteur calcique DHP, thiazidique"
        },
        {
            id: "IN_B02",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-B2",
            section: "Cardiovasculaire",
            titre: "Statine en prévention secondaire (sauf fin de vie / fragile sévère)",
            message: "Statine en prévention secondaire cardiovasculaire (coronaropathie, AVC, AOMI), sauf si statut de fin de vie ou fragilité modérée-sévère établie.",
            severite: "warning",
            condition: {
                comorbs_any: ["PAT_004", "PAT_007", "PAT_008"],
                med_absent: ["statine", "atorvastatine", "rosuvastatine", "simvastatine", "pravastatine", "fluvastatine"]
            },
            alternatives: "Atorvastatine 20-40 mg, rosuvastatine 5-10 mg"
        },
        {
            id: "IN_B03",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-B3",
            section: "Cardiovasculaire",
            titre: "IEC en post-SCA / coronaropathie",
            message: "IEC pour coronaropathie ou post-syndrome coronarien aigu.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_004"],
                med_absent: ["iec", "ramipril", "perindopril", "enalapril", "lisinopril", "captopril"]
            },
            alternatives: "Ramipril 5-10 mg, périndopril 5-10 mg"
        },
        {
            id: "IN_B05",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-B5",
            section: "Cardiovasculaire",
            titre: "IEC (ou ARA2) pour HFrEF",
            message: "IEC (ou ARA2 si intolérance) pour IC à fraction d'éjection réduite (HFrEF) — pilier pronostique majeur.",
            severite: "danger",
            condition: {
                comorbs: ["PAT_002"],
                med_absent: ["iec", "ara2", "arni", "sacubitril"]
            },
            alternatives: "Ramipril, énalapril, périndopril, ou valsartan si CI IEC, ou sacubitril/valsartan"
        },
        {
            id: "IN_B06",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-B6",
            section: "Cardiovasculaire",
            titre: "Bêtabloquant cardiosélectif pour HFrEF stable",
            message: "Bêtabloquant cardiosélectif (bisoprolol, nébivolol, métoprolol, carvédilol) pour HFrEF stable — réduction de mortalité démontrée.",
            severite: "danger",
            condition: {
                comorbs: ["PAT_002"],
                med_absent: ["bisoprolol", "nebivolol", "metoprolol", "carvedilol"]
            },
            alternatives: "Bisoprolol 1.25→10 mg, carvédilol 3.125→25 mg, nébivolol 1.25→10 mg"
        },
        {
            id: "IN_B07",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-B7",
            section: "Cardiovasculaire",
            titre: "Anti-aldostérone (ARM) pour IC sans IRC sévère",
            message: "Anti-aldostérone (spironolactone, éplérénone) pour IC sans atteinte rénale sévère (DFG > 30) — pilier pronostique.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_002"],
                bio: { "BIO_004": { op: ">", val: 30 } },
                med_absent: ["spironolactone", "eplerenone", "aldactazine"]
            },
            alternatives: "Spironolactone 25 mg ou éplérénone 25 mg, avec monitorage K+"
        },
        {
            id: "IN_B08",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-B8",
            section: "Cardiovasculaire",
            titre: "iSGLT2 pour IC symptomatique (avec ou sans diabète)",
            message: "Inhibiteur SGLT2 (dapagliflozine, empagliflozine) pour IC symptomatique, avec ou sans FE réduite, indépendamment du diabète — bénéfice pronostique démontré.",
            severite: "warning",
            condition: {
                comorbs_any: ["PAT_001", "PAT_002", "PAT_003"],
                med_absent: ["dapagliflozin", "empagliflozin", "canagliflozin", "sglt2", "isglt2"]
            },
            alternatives: "Dapagliflozine 10 mg ou empagliflozine 10 mg"
        },
        {
            id: "IN_B09",
            sources: ["STOPP3"],
            ref_code: "START3-B9",
            section: "Cardiovasculaire",
            titre: "Sacubitril/Valsartan si HFrEF persistante sous IEC/ARA2 optimal",
            message: "Sacubitril/valsartan pour HFrEF avec symptômes persistants malgré IEC ou ARA2 à dose optimale — remplacement de l'IEC/ARA2.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_002"],
                med_absent: ["sacubitril"]
            },
            alternatives: "Sacubitril/valsartan (Entresto) 24/26 mg x2/j → titration"
        },
        {
            id: "IN_B10",
            sources: ["STOPP3"],
            ref_code: "START3-B10",
            section: "Cardiovasculaire",
            titre: "Bêtabloquant pour FA chronique (contrôle de fréquence)",
            message: "Bêtabloquant pour FA chronique avec fréquence ventriculaire non contrôlée.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_006"],
                med_absent: ["betabloquant", "bisoprolol", "metoprolol", "atenolol", "nebivolol"]
            },
            alternatives: "Bisoprolol 2.5-10 mg, métoprolol"
        },
        {
            id: "IN_B11",
            sources: ["STOPP3"],
            ref_code: "START3-B11",
            section: "Cardiovasculaire",
            titre: "Fer IV pour HFrEF symptomatique avec carence martiale",
            message: "Fer intraveineux pour HFrEF symptomatique avec carence martiale documentée (ferritine < 100 µg/L ou 100-299 avec CST < 20%).",
            severite: "warning",
            condition: {
                comorbs: ["PAT_002"],
                bio: { "BIO_020": { op: "<", val: 100 } }
            },
            alternatives: "Carboxymaltose ferrique IV (Ferinject)"
        },

        // ====================================================================
        // SECTION C : COAGULATION
        // ====================================================================
        {
            id: "IN_C01",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-C1",
            section: "Coagulation",
            titre: "Anticoagulant pour FA (chronique ou paroxystique)",
            message: "Anticoagulant (AOD préféré, AVK si CI) pour FA chronique ou paroxystique — prévention de l'AVC. CHA₂DS₂-VASc ≥ 2 chez l'homme, ≥ 3 chez la femme.",
            severite: "danger",
            condition: {
                comorbs: ["PAT_006"],
                med_absent: ["anticoag", "apixaban", "rivaroxaban", "dabigatran", "edoxaban", "acenocoumarol", "warfarine", "fluindione"]
            },
            alternatives: "Apixaban 5 mg x2 (ou 2.5 mg x2 si critères), rivaroxaban 20 mg, dabigatran, edoxaban"
        },
        {
            id: "IN_C02",
            sources: ["STOPP3"],
            ref_code: "START3-C2",
            section: "Coagulation",
            titre: "Antiagrégant pour maladie vasculaire",
            message: "Antiagrégant plaquettaire (aspirine, clopidogrel, prasugrel, ticagrélor) pour maladie coronarienne, cérébrovasculaire ou artériopathie périphérique.",
            severite: "warning",
            condition: {
                comorbs_any: ["PAT_004", "PAT_007", "PAT_008"],
                med_absent: ["antiagreg", "acide acetylsalicylique", "clopidogrel", "prasugrel", "ticagrelor"]
            },
            alternatives: "Aspirine 75-100 mg ou clopidogrel 75 mg"
        },

        // ====================================================================
        // SECTION D : SNC
        // ====================================================================
        {
            id: "IN_D01",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-D1",
            section: "SNC",
            titre: "L-DOPA ou agoniste dopaminergique pour Parkinson avec handicap fonctionnel",
            message: "L-DOPA ou agoniste dopaminergique pour maladie de Parkinson idiopathique avec handicap fonctionnel.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_014"],
                med_absent: ["levodopa", "ropinirole", "pramipexole", "rotigotine", "piribedil"]
            },
            alternatives: "L-DOPA + carbidopa/bensérazide, ou agoniste dopaminergique"
        },
        {
            id: "IN_D02",
            sources: ["STOPP3"],
            ref_code: "START3-D2",
            section: "SNC",
            titre: "Antidépresseur non tricyclique pour dépression majeure",
            message: "Antidépresseur non tricyclique pour dépression majeure caractérisée.",
            severite: "warning",
            condition: {
                contexte_clinique: "depression",
                med_absent: ["isrs", "sertraline", "citalopram", "escitalopram", "fluoxetine", "paroxetine", "venlafaxine", "duloxetine", "mirtazapine", "mianserine"]
            },
            alternatives: "Sertraline 25-50 mg, escitalopram 5-10 mg, mirtazapine 15-30 mg"
        },
        {
            id: "IN_D03",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-D3",
            section: "SNC",
            titre: "Inhibiteur acétylcholinestérase pour Alzheimer léger à modéré",
            message: "Inhibiteur de l'acétylcholinestérase (donépézil, rivastigmine, galantamine) pour maladie d'Alzheimer légère à modérée.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_011"],
                med_absent: ["donepezil", "rivastigmine", "galantamine"]
            },
            alternatives: "Donépézil 5→10 mg, rivastigmine patch, galantamine LP"
        },
        {
            id: "IN_D04",
            sources: ["STOPP3"],
            ref_code: "START3-D4",
            section: "SNC",
            titre: "Rivastigmine pour démence à corps de Lewy / Parkinson avec démence",
            message: "Rivastigmine pour démence à corps de Lewy ou démence associée à la maladie de Parkinson.",
            severite: "warning",
            condition: {
                comorbs_any: ["PAT_012"],
                med_absent: ["rivastigmine"]
            },
            alternatives: "Rivastigmine patch 4.6→9.5→13.3 mg/24h"
        },

        // ====================================================================
        // SECTION E : RÉNAL
        // ====================================================================
        {
            id: "IN_E01",
            sources: ["STOPP3"],
            ref_code: "START3-E1",
            section: "Rénal",
            titre: "1α-OH-cholécalciférol ou calcitriol si IRC sévère + hypocalcémie + hyperparathyroïdie secondaire",
            message: "Supplémentation en 1α-OH-cholécalciférol ou calcitriol pour IRC sévère (DFG < 30) avec hypocalcémie (Ca < 2.10) et hyperparathyroïdie secondaire associée.",
            severite: "warning",
            condition: {
                bio: { "BIO_004": { op: "<", val: 30 }, "BIO_005": { op: "<", val: 2.10 } },
                med_absent: ["alfacalcidol", "calcitriol"]
            },
            alternatives: "Alfacalcidol 0.25-1 µg/j ou calcitriol 0.25 µg/j"
        },
        {
            id: "IN_E04",
            sources: ["STOPP3"],
            ref_code: "START3-E4",
            section: "Rénal",
            titre: "IEC/ARA2 pour protéinurie dans la MRC",
            message: "IEC ou ARA2 pour protéinurie (albuminurie > 300 mg/24h) dans la maladie rénale chronique — néphroprotection.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_029"],
                med_absent: ["iec", "ara2"]
            },
            alternatives: "Ramipril, énalapril, ou valsartan, candésartan"
        },

        // ====================================================================
        // SECTION F : GASTROINTESTINAL
        // ====================================================================
        {
            id: "IN_F01",
            sources: ["STOPP3"],
            ref_code: "START3-F1",
            section: "Gastro",
            titre: "IPP pour RGO sévère ou sténose peptique",
            message: "IPP pour reflux gastro-œsophagien sévère ou sténose peptique de l'œsophage.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_021"],
                med_absent: ["ipp", "omeprazole", "esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole"]
            },
            alternatives: "Oméprazole 20 mg, ésoméprazole 20 mg, pantoprazole 20 mg"
        },
        {
            id: "IN_F02",
            sources: ["STOPP3"],
            ref_code: "START3-F2",
            section: "Gastro",
            titre: "IPP si aspirine faible dose + antécédent d'ulcère ou RGO",
            message: "IPP avec aspirine faible dose et antécédent d'ulcère gastroduodénal ou d'oesophagite de reflux.",
            severite: "warning",
            condition: {
                med_keys: ["acide acetylsalicylique", "aspirine"],
                comorbs: ["PAT_021"],
                med_absent: ["ipp", "omeprazole", "esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole"]
            },
            alternatives: "Oméprazole 20 mg, pantoprazole 20 mg"
        },
        {
            id: "IN_F03",
            sources: ["STOPP3"],
            ref_code: "START3-F3",
            section: "Gastro",
            titre: "IPP avec AINS (cure courte ou prolongée)",
            message: "IPP co-prescrit avec tout AINS, en cure courte (< 2 semaines) ou prolongée — gastroprotection.",
            severite: "warning",
            condition: {
                med_keys: ["ains"],
                med_absent: ["ipp", "omeprazole", "esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole"]
            },
            alternatives: "Oméprazole 20 mg, pantoprazole 20 mg"
        },
        {
            id: "IN_F05",
            sources: ["STOPP3"],
            ref_code: "START3-F5",
            section: "Gastro",
            titre: "Laxatif osmotique pour constipation chronique bénigne",
            message: "Laxatif osmotique (lactulose, macrogol, sorbitol) pour constipation chronique bénigne, idiopathique ou secondaire.",
            severite: "info",
            condition: {
                contexte_clinique: "constipation_chronique",
                med_absent: ["macrogol", "lactulose", "sorbitol"]
            },
            alternatives: "Macrogol (Movicol), lactulose"
        },

        // ====================================================================
        // SECTION G : RESPIRATOIRE
        // ====================================================================
        {
            id: "IN_G01",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-G1",
            section: "Respiratoire",
            titre: "LAMA ou LABA pour asthme/BPCO symptomatique (GOLD 1-2)",
            message: "LAMA (tiotropium, aclidinium, uméclidinium, glycopyrronium) ou LABA (formotérol, salmétérol, indacatérol, olodatérol) pour asthme chronique symptomatique ou BPCO GOLD 1-2.",
            severite: "warning",
            condition: {
                comorbs_any: ["PAT_022", "PAT_023"],
                med_absent: ["tiotropium", "aclidinium", "umeclidinium", "glycopyrronium", "formoterol", "salmeterol", "indacaterol", "olodaterol"]
            },
            alternatives: "Tiotropium (Spiriva), formotérol/salmétérol"
        },
        {
            id: "IN_G02",
            sources: ["STOPP3"],
            ref_code: "START3-G2",
            section: "Respiratoire",
            titre: "Corticoïde inhalé quotidien pour asthme modéré-sévère ou BPCO GOLD 3-4",
            message: "Corticoïde inhalé quotidien (béclométasone, budésonide, fluticasone, mométasone) pour asthme modéré-sévère ou BPCO GOLD 3-4 (VEMS < 50%) avec exacerbations répétées.",
            severite: "warning",
            condition: {
                comorbs_any: ["PAT_022", "PAT_023"],
                med_absent: ["beclometasone", "budesonide", "fluticasone", "mometasone", "corticoide inhale"]
            },
            alternatives: "Budésonide, fluticasone en association LABA"
        },

        // ====================================================================
        // SECTION H : MUSCULOSQUELETTIQUE
        // ====================================================================
        {
            id: "IN_H03",
            sources: ["STOPP3"],
            ref_code: "START3-H3",
            section: "Musculo",
            titre: "Vitamine D pour ostéoporose et/ou fracture de fragilité",
            message: "Supplémentation en vitamine D pour ostéoporose (T-score ≤ -2.5) et/ou antécédent de fracture de fragilité.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_025"],
                med_absent: ["cholecalciferol", "calcifediol", "vitamine d", "colecalciferol"]
            },
            alternatives: "Cholécalciférol 800-2000 UI/j ou calcifédiol"
        },
        {
            id: "IN_H04",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-H4",
            section: "Musculo",
            titre: "Anti-résorptif ou anabolique osseux pour ostéoporose",
            message: "Traitement anti-résorptif (bisphosphonate, dénosumab) ou anabolique (tériparatide) pour ostéoporose (T-score ≤ -2.5) et/ou fracture de fragilité antérieure, en l'absence de CI (espérance de vie < 1 an).",
            severite: "warning",
            condition: {
                comorbs: ["PAT_025"],
                med_absent: ["alendronate", "risedronate", "acide zoledronique", "denosumab", "teriparatide"]
            },
            alternatives: "Alendronate 70 mg/sem, risédronate 35 mg/sem, dénosumab 60 mg/6 mois"
        },
        {
            id: "IN_H05",
            sources: ["STOPP3"],
            ref_code: "START3-H5",
            section: "Musculo",
            titre: "Vitamine D pour carence confirmée (< 20 ng/mL) chez confiné / chuteur / ostéopénie",
            message: "Supplément de vitamine D pour carence confirmée (25-OH-D < 20 ng/mL, < 50 nmol/L) chez patient confiné, chuteur ou avec ostéopénie (T-score entre -1.0 et -2.5).",
            severite: "warning",
            condition: {
                bio: { "BIO_023": { op: "<", val: 20 } },
                med_absent: ["cholecalciferol", "calcifediol", "vitamine d", "colecalciferol"]
            },
            alternatives: "Cholécalciférol 800-4000 UI/j jusqu'à normalisation, puis 800-2000 UI/j"
        },
        {
            id: "IN_H08",
            sources: ["STOPP3"],
            ref_code: "START3-H8",
            section: "Musculo",
            titre: "Inhibiteur xanthine-oxydase pour goutte récidivante",
            message: "Inhibiteur de la xanthine-oxydase (allopurinol, fébuxostat) pour crises de goutte récidivantes.",
            severite: "warning",
            condition: {
                comorbs: ["PAT_024"],
                med_absent: ["allopurinol", "febuxostat"]
            },
            alternatives: "Allopurinol 100→300 mg (titration progressive), fébuxostat 80 mg"
        },
        {
            id: "IN_H09",
            sources: ["STOPP3"],
            ref_code: "START3-H9",
            section: "Musculo",
            titre: "Acide folique avec méthotrexate",
            message: "Supplément d'acide folique systématique quand méthotrexate en cours.",
            severite: "warning",
            condition: {
                med_keys: ["methotrexate"],
                med_absent: ["acide folique", "folinate", "folinique"]
            },
            alternatives: "Acide folique 5-10 mg/semaine (48h après MTX)"
        },

        // ====================================================================
        // SECTION I : UROGÉNITAL
        // ====================================================================
        {
            id: "IN_I01",
            sources: ["STOPP3"],
            ref_code: "START3-I1",
            section: "Urogénital",
            titre: "Alpha-1 bloquant sélectif pour HBP symptomatique",
            message: "Alpha-1 bloquant sélectif (tamsulosine, silodosine) pour troubles urinaires du bas appareil liés à l'HBP, quand la prostatectomie n'est pas nécessaire ou appropriée.",
            severite: "info",
            condition: {
                contexte_clinique: "hbp",
                med_absent: ["tamsulosine", "silodosine", "alfuzosine"]
            },
            alternatives: "Tamsulosine 0.4 mg, silodosine 4-8 mg"
        },

        // ====================================================================
        // SECTION J : ENDOCRINE
        // ====================================================================
        {
            id: "IN_J01",
            sources: ["STOPP3", "FORTA"],
            ref_code: "START3-J1",
            section: "Endocrine",
            titre: "IEC/ARA2 pour diabète avec protéinurie (sauf IRC sévère)",
            message: "IEC (ou ARA2 si intolérance) pour diabète avec protéinurie (> 30 mg/24h), sauf si IRC sévère (DFG < 30).",
            severite: "warning",
            condition: {
                comorbs: ["PAT_016"],
                bio: { "BIO_004": { op: ">", val: 30 } },
                med_absent: ["iec", "ara2"]
            },
            alternatives: "Ramipril, périndopril, ou valsartan, candésartan"
        },

        // ====================================================================
        // SECTION K : ANTALGIQUES
        // ====================================================================
        {
            id: "IN_K01",
            sources: ["STOPP3"],
            ref_code: "START3-K1",
            section: "Antalgiques",
            titre: "Opioïde fort pour douleur modérée-sévère non arthrosique",
            message: "Opioïde fort pour douleur modérée-sévère non arthrosique, quand paracétamol, AINS ou opioïdes faibles sont inappropriés ou insuffisants.",
            severite: "info",
            condition: { type: "manual_review" },
            alternatives: "Morphine orale LP, oxycodone LP, fentanyl transdermique"
        },
        {
            id: "IN_K02",
            sources: ["STOPP3"],
            ref_code: "START3-K2",
            section: "Antalgiques",
            titre: "Laxatif systématique avec opioïde quotidien",
            message: "Laxatif systématique prescrit avec tout opioïde en usage quotidien régulier (hors PRN).",
            severite: "warning",
            condition: {
                med_keys: ["morphine", "oxycodone", "fentanyl", "buprenorphine", "tramadol", "codeine"],
                med_absent: ["macrogol", "lactulose", "bisacodyl"]
            },
            alternatives: "Macrogol (Movicol) 1-3 sachets/j"
        },
        {
            id: "IN_K03",
            sources: ["STOPP3"],
            ref_code: "START3-K3",
            section: "Antalgiques",
            titre: "Patch de lidocaïne 5% pour douleur neuropathique localisée",
            message: "Patch de lidocaïne 5% pour douleur neuropathique localisée (ex : névralgies post-zostériennes).",
            severite: "info",
            condition: { type: "manual_review" },
            alternatives: "Versatis (lidocaïne 5%) 1-3 patchs/12h"
        },

        // ====================================================================
        // SECTION L : VACCINS
        // ====================================================================
        {
            id: "IN_L01",
            sources: ["STOPP3"],
            ref_code: "START3-L1",
            section: "Vaccins",
            titre: "Vaccin antigrippal annuel",
            message: "Vaccin antigrippal trivalent annuel recommandé systématiquement.",
            severite: "info",
            condition: { type: "manual_review" },
            alternatives: "Vaccin grippal haute dose (Efluelda) chez > 65 ans"
        },
        {
            id: "IN_L02",
            sources: ["STOPP3"],
            ref_code: "START3-L2",
            section: "Vaccins",
            titre: "Vaccin pneumococcique",
            message: "Vaccin pneumococcique au moins une fois selon les recommandations nationales.",
            severite: "info",
            condition: { type: "manual_review" },
            alternatives: "Prevenar 20 ou Prevenar 13 + Pneumovax selon calendrier"
        },
        {
            id: "IN_L03",
            sources: ["STOPP3"],
            ref_code: "START3-L3",
            section: "Vaccins",
            titre: "Vaccin zona (varicelle-zoster)",
            message: "Vaccin zona selon les recommandations nationales (Shingrix recommandé ≥ 65 ans).",
            severite: "info",
            condition: { type: "manual_review" },
            alternatives: "Shingrix (vaccin recombinant adjuvanté) 2 doses"
        }
    ]
};

// ============================================================================
// NOTE: L'ancien moteur evaluerRecommandations() a été supprimé.
// Utiliser GeriaEngineV2.evaluer() (dans geria_engine_v2.js).
// ============================================================================

// ============================================================================
// 🏥 GERIA_RECOS_SUPPLEMENT - Dictionnaires PIM par molécule
// Version 1.0 - Mars 2026
// ============================================================================
// Ce fichier COMPLÈTE GERIA_RECOS_DB (ci-dessus) avec :
//   1. Dictionnaire PIM par DCI (PRISCUS 2.0 / FORTA / EU7-PIM / Beers / PIM-Check)
//   2. Règles conditionnelles additionnelles (RECOS_SUPPLEMENT)
//
// Structure PIM_DICT : chaque entrée est indexée par DCI (minuscule, sans accents)
//   - priscus: "PIM" | "PIM-B" (conditionnel) | null
//   - priscus_cond: condition pour PIM-B (ex: "> 8 semaines", "> 1200 mg/j")
//   - priscus_alt: alternatives proposées par PRISCUS
//   - forta: "A" (indispensable) | "B" (bénéfique) | "C" (discutable) | "D" (à éviter)
//   - forta_indication: indication pour laquelle la classification s'applique
//   - eu7pim: true | false
//   - eu7pim_cond: condition spécifique EU(7)-PIM
//   - beers: true | false
//   - beers_cond: condition Beers
//   - pimcheck: true | false
//   - pimcheck_detail: détail PIM-Check
//   - risque_principal: résumé du risque principal
// ============================================================================

const PIM_DICT = {

    // ========================================================================
    // SYSTÈME NERVEUX CENTRAL — Antipsychotiques
    // ========================================================================
    "haloperidol": {
        priscus: "PIM-B", priscus_cond: "> 2 mg/j ou > 6 semaines", priscus_alt: "Rispéridone ≤ 2 mg courte durée, quétiapine",
        forta: "C", forta_indication: "Delirium/SCPD",
        eu7pim: true, eu7pim_cond: "Utilisation au long cours",
        beers: true, beers_cond: "Antipsychotique en général chez âgé",
        pimcheck: true, pimcheck_detail: "Dose max 2 mg/j gériatrie",
        risque_principal: "Effets extrapyramidaux, QTc, sédation, chutes"
    },
    "risperidone": {
        priscus: "PIM-B", priscus_cond: "> 2 mg/j ou > 6 semaines", priscus_alt: "Quétiapine faible dose",
        forta: "C", forta_indication: "SCPD",
        eu7pim: true, eu7pim_cond: "> 6 semaines pour SCPD",
        beers: true, beers_cond: "Antipsychotique chez âgé",
        pimcheck: true, pimcheck_detail: "Max 6 semaines pour SCPD, max 2 mg/j",
        risque_principal: "AVC, mortalité, EPS, chutes"
    },
    "olanzapine": {
        priscus: "PIM", priscus_alt: "Quétiapine, aripiprazole",
        forta: "D", forta_indication: "SCPD",
        eu7pim: true, beers: true,
        pimcheck: true, pimcheck_detail: "Syndrome métabolique, sédation marquée",
        risque_principal: "Sédation, prise de poids, syndrome métabolique, AVC"
    },
    "clozapine": {
        priscus: "PIM", priscus_alt: "Quétiapine",
        forta: "B", forta_indication: "Psychose dans Parkinson uniquement",
        eu7pim: true, beers: true,
        risque_principal: "Agranulocytose, sédation, métabolique, myocardite"
    },
    "chlorpromazine": {
        priscus: "PIM", priscus_alt: "Rispéridone courte durée, quétiapine",
        forta: "D", forta_indication: "Toute indication chez âgé",
        eu7pim: true, beers: true,
        risque_principal: "Sédation majeure, hypotension, anticholinergique, QTc"
    },
    "levomepromazine": {
        priscus: "PIM", priscus_alt: "Quétiapine, exception antiémétique palliatif",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Sédation profonde, hypotension, anticholinergique"
    },
    "cyamemazine": {
        priscus: "PIM", priscus_alt: "Quétiapine faible dose",
        eu7pim: true, beers: true,
        risque_principal: "Phénothiazine : sédation, QTc, EPS"
    },
    "aripiprazole": {
        priscus: null, forta: "B", forta_indication: "Psychose chez âgé (meilleur profil métabolique)",
        eu7pim: false, beers: true, beers_cond: "Antipsychotique sauf schizophrénie/bipolaire",
        risque_principal: "Akathisie, insomnie"
    },
    "amisulpride": {
        priscus: "PIM-B", priscus_cond: "> 400 mg/j", priscus_alt: "Rispéridone faible dose",
        eu7pim: true, beers: true,
        risque_principal: "Hyperprolactinémie, EPS, QTc"
    },
    "flupentixol": {
        priscus: "PIM", priscus_alt: "Rispéridone ≤ 2 mg, aripiprazole",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "EPS sévères, sédation, QTc"
    },
    "fluphenazine": {
        priscus: "PIM", priscus_alt: "Rispéridone courte durée",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "EPS sévères, dyskinésie tardive"
    },
    "pipotiazine": {
        priscus: "PIM", eu7pim: true, beers: true,
        risque_principal: "EPS, sédation prolongée (forme LP)"
    },
    "propericiazine": {
        priscus: "PIM", eu7pim: true,
        risque_principal: "Phénothiazine : anticholinergique, sédation"
    },
    "pimozide": {
        priscus: "PIM", eu7pim: true, beers: true,
        risque_principal: "QTc majeur, EPS, interactions CYP"
    },
    "sulpiride": {
        priscus: "PIM-B", priscus_cond: "> 200 mg/j",
        eu7pim: true, risque_principal: "Hyperprolactinémie, EPS"
    },
    "tiapride": {
        priscus: null, forta: "C", forta_indication: "Agitation/SCPD",
        eu7pim: true, eu7pim_cond: "> 4 semaines",
        risque_principal: "Sédation, EPS modérés"
    },

    // ========================================================================
    // SNC — Benzodiazépines & hypnotiques
    // ========================================================================
    "diazepam": {
        priscus: "PIM", priscus_alt: "Lorazépam, oxazépam (courte durée)",
        forta: "D", eu7pim: true, beers: true,
        pimcheck: true, pimcheck_detail: "Demi-vie très longue (>100h avec métabolites)",
        risque_principal: "Sédation prolongée, accumulation, chutes, dépendance"
    },
    "bromazepam": {
        priscus: "PIM", priscus_alt: "Lorazépam courte durée",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Sédation, chutes, dépendance"
    },
    "alprazolam": {
        priscus: "PIM", priscus_alt: "Lorazépam, oxazépam",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Anxiolytique puissant mais dépendance rapide, rebond anxieux"
    },
    "lorazepam": {
        priscus: "PIM-B", priscus_cond: "> 2 mg/j ou > 4 semaines", priscus_alt: "Oxazépam si possible",
        forta: "C", forta_indication: "Anxiété aiguë",
        eu7pim: true, eu7pim_cond: "> 4 semaines", beers: true,
        risque_principal: "Sédation, chutes, dépendance (mais pas de métabolites actifs)"
    },
    "oxazepam": {
        priscus: "PIM-B", priscus_cond: "> 60 mg/j ou > 4 semaines",
        priscus_alt: "Mesures non pharmacologiques",
        forta: "C", eu7pim: true, eu7pim_cond: "> 4 semaines", beers: true,
        risque_principal: "Chutes, dépendance (mais profil PK favorable : pas de CYP)"
    },
    "clorazepate": {
        priscus: "PIM", priscus_alt: "Oxazépam, lorazépam",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Demi-vie très longue, accumulation"
    },
    "prazepam": {
        priscus: "PIM", priscus_alt: "Oxazépam",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Prodrogue du nordazépam, demi-vie longue"
    },
    "nordazepam": {
        priscus: "PIM", forta: "D", eu7pim: true, beers: true,
        risque_principal: "Demi-vie > 60h, accumulation"
    },
    "nitrazepam": {
        priscus: "PIM", forta: "D", eu7pim: true, beers: true,
        risque_principal: "Hypnotique longue durée, sédation résiduelle"
    },
    "clobazam": {
        priscus: "PIM-B", priscus_cond: "Sauf épilepsie",
        eu7pim: true, beers: true,
        risque_principal: "Sédation, métabolites actifs"
    },
    "clonazepam": {
        priscus: "PIM-B", priscus_cond: "Sauf épilepsie",
        eu7pim: true, beers: true,
        risque_principal: "Demi-vie longue, sédation"
    },
    "midazolam": {
        priscus: "PIM-B", priscus_cond: "Sauf sédation procédurale",
        beers: true, risque_principal: "Sédation profonde, dépression respiratoire"
    },
    "lormetazepam": {
        priscus: "PIM-B", priscus_cond: "> 0.5 mg/j ou > 4 semaines",
        eu7pim: true, beers: true,
        risque_principal: "Sédation, chutes"
    },
    "zolpidem": {
        priscus: "PIM-B", priscus_cond: "> 5 mg/j ou > 2 semaines",
        priscus_alt: "Mélatonine LP, hygiène du sommeil",
        forta: "D", eu7pim: true, beers: true, pimcheck: true,
        risque_principal: "Chutes nocturnes, comportements complexes, amnésie"
    },
    "zopiclone": {
        priscus: "PIM-B", priscus_cond: "> 3.75 mg/j ou > 2 semaines",
        priscus_alt: "Mélatonine LP",
        forta: "D", eu7pim: true, beers: true, pimcheck: true,
        risque_principal: "Chutes, sédation résiduelle, goût métallique"
    },

    // ========================================================================
    // SNC — Antidépresseurs
    // ========================================================================
    "amitriptyline": {
        priscus: "PIM", priscus_alt: "Sertraline, mirtazapine, escitalopram",
        forta: "D", eu7pim: true, beers: true, pimcheck: true,
        risque_principal: "ACB=3, cardiotoxicité, sédation, hypotension orthostatique"
    },
    "clomipramine": {
        priscus: "PIM", priscus_alt: "ISRS, duloxétine (si douleur)",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "ACB=3, QTc, convulsions"
    },
    "imipramine": {
        priscus: "PIM", priscus_alt: "ISRS",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "ACB=3, cardiotoxicité"
    },
    "doxepine": {
        priscus: "PIM-B", priscus_cond: "> 6 mg/j (≤ 6 mg acceptable pour insomnie)",
        forta: "D", forta_indication: "Sauf doxépine ≤ 6 mg insomnie",
        eu7pim: true, beers: true, beers_cond: "> 6 mg/j",
        risque_principal: "Sédation, anticholinergique à haute dose"
    },
    "trimipramine": {
        priscus: "PIM", priscus_alt: "Mirtazapine si insomnie, ISRS",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "ACB élevé, sédation"
    },
    "nortriptyline": {
        priscus: "PIM", priscus_alt: "ISRS, duloxétine",
        forta: "C", forta_indication: "Douleur neuropathique (C car amine secondaire, moins ACB)",
        eu7pim: true, beers: true,
        risque_principal: "Moins ACB que amines tertiaires mais cardiotoxicité"
    },
    "maprotiline": {
        priscus: "PIM", priscus_alt: "ISRS, mirtazapine",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Convulsions, anticholinergique, cardiotoxicité"
    },
    "dosulpine": {
        priscus: "PIM", eu7pim: true, beers: true,
        risque_principal: "Le plus toxique en surdosage des tricycliques"
    },
    "citalopram": {
        priscus: "PIM-B", priscus_cond: "> 20 mg/j chez > 65 ans",
        priscus_alt: "Citalopram ≤ 20 mg, sertraline, escitalopram ≤ 10 mg",
        forta: "B", forta_indication: "Dépression (à dose correcte)",
        pimcheck: true, pimcheck_detail: "Max 20 mg/j : allongement QTc dose-dépendant",
        risque_principal: "QTc dose-dépendant > 20 mg/j"
    },
    "escitalopram": {
        priscus: "PIM-B", priscus_cond: "> 10 mg/j chez > 65 ans",
        priscus_alt: "Escitalopram ≤ 10 mg, sertraline",
        forta: "B", forta_indication: "Dépression (à dose correcte)",
        pimcheck: true, pimcheck_detail: "Max 10 mg/j : allongement QTc",
        risque_principal: "QTc dose-dépendant > 10 mg/j"
    },
    "sertraline": {
        priscus: "PIM-B", priscus_cond: "> 100 mg/j",
        forta: "A", forta_indication: "Dépression — ISRS de référence en gériatrie",
        pimcheck: false, risque_principal: "Hyponatrémie, troubles GI"
    },
    "fluoxetine": {
        priscus: "PIM", priscus_alt: "Sertraline, escitalopram",
        forta: "C", eu7pim: true, beers: true,
        risque_principal: "Demi-vie très longue (norfluoxétine ~14j), interactions CYP2D6"
    },
    "paroxetine": {
        priscus: "PIM", priscus_alt: "Sertraline, escitalopram",
        forta: "C", forta_indication: "Dépression (ACB le plus élevé des ISRS)",
        eu7pim: true, beers: true,
        pimcheck: true, pimcheck_detail: "ISRS le plus anticholinergique",
        risque_principal: "Anticholinergique (ACB=2-3), syndrome de sevrage marqué"
    },
    "fluvoxamine": {
        priscus: "PIM-B", priscus_cond: "> 100 mg/j",
        eu7pim: true, risque_principal: "Interactions CYP1A2 majeures"
    },
    "mirtazapine": {
        priscus: null, forta: "A", forta_indication: "Dépression avec insomnie/perte poids",
        eu7pim: false, beers: false,
        risque_principal: "Prise de poids, sédation (peut être bénéfique si dénutrition/insomnie)"
    },
    "venlafaxine": {
        priscus: null, priscus_cond: "Ambiguë (95% CI inclut 3)",
        forta: "B", forta_indication: "Dépression",
        pimcheck: true, pimcheck_detail: "Surveillance TA (effet noradrénergique dose-dépendant)",
        risque_principal: "HTA dose-dépendante, syndrome de sevrage"
    },
    "duloxetine": {
        priscus: null, priscus_cond: "Ambiguë",
        forta: "B", forta_indication: "Dépression + douleur neuropathique",
        risque_principal: "Nausées, HTA, hépatotoxicité rare"
    },
    "mianserine": {
        priscus: null, forta: "B", forta_indication: "Dépression chez âgé (peu ACB)",
        risque_principal: "Somnolence, agranulocytose rare"
    },
    "agomelatine": {
        priscus: null, forta: "C",
        risque_principal: "Hépatotoxicité (surveillance transaminases), peu de données gériatriques"
    },

    // ========================================================================
    // SNC — Antiépileptiques
    // ========================================================================
    "phenobarbital": {
        priscus: "PIM", priscus_alt: "Lamotrigine, lévétiracétam",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Sédation, induction enzymatique majeure, dépendance"
    },
    "phenytoine": {
        priscus: "PIM", priscus_alt: "Lamotrigine, lévétiracétam",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Cinétique non linéaire, induction, toxicité SNC"
    },
    "carbamazepine": {
        priscus: "PIM-B", priscus_cond: "Si alternatives disponibles",
        priscus_alt: "Lamotrigine, lévétiracétam, valproate",
        forta: "C", eu7pim: true, beers: true,
        risque_principal: "SIADH, induction enzymatique, leucopénie, ataxie"
    },
    "valproate": {
        priscus: "PIM-B", priscus_cond: "Tremblement, prise poids, hépatotoxicité",
        forta: "C", eu7pim: false,
        risque_principal: "Tremblement, prise de poids, thrombopénie, hépatotoxicité"
    },
    "gabapentine": {
        priscus: "PIM-B", priscus_cond: "> 1800 mg/j ou si DFG < 60 sans adaptation",
        forta: "B", forta_indication: "Douleur neuropathique",
        risque_principal: "Sédation, vertiges, œdèmes, abus potentiel"
    },
    "pregabaline": {
        priscus: null, priscus_cond: "Ambiguë",
        forta: "B", forta_indication: "Douleur neuropathique, anxiété généralisée",
        beers: true, beers_cond: "Risque de chutes",
        risque_principal: "Sédation, vertiges, prise de poids, abus potentiel"
    },
    "lamotrigine": {
        priscus: null, forta: "A", forta_indication: "Épilepsie chez âgé (1er choix)",
        risque_principal: "Syndrome de Stevens-Johnson (titration lente), interactions"
    },
    "levetiracetam": {
        priscus: null, forta: "A", forta_indication: "Épilepsie chez âgé (1er choix)",
        risque_principal: "Irritabilité, troubles du comportement (rare)"
    },

    // ========================================================================
    // SNC — Anticholinergiques
    // ========================================================================
    "hydroxyzine": {
        priscus: "PIM", priscus_alt: "Cétirizine, lévocétirizine",
        forta: "D", eu7pim: true, beers: true, pimcheck: true,
        risque_principal: "Anticholinergique, sédation, QTc"
    },
    "dexchlorpheniramine": {
        priscus: "PIM", priscus_alt: "Antihistaminique 2ème gén.",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Anticholinergique, sédation"
    },
    "promethazine": {
        priscus: "PIM", forta: "D", eu7pim: true, beers: true,
        risque_principal: "Forte charge anticholinergique, sédation"
    },
    "diphenhydramine": {
        priscus: "PIM", forta: "D", eu7pim: true, beers: true,
        risque_principal: "ACB=3, sédation, confusion"
    },
    "doxylamine": {
        priscus: "PIM", priscus_alt: "Mélatonine LP",
        eu7pim: true, beers: true,
        risque_principal: "Sédation, anticholinergique"
    },
    "mequitazine": {
        priscus: "PIM", eu7pim: true,
        risque_principal: "Anticholinergique, QTc"
    },

    // ========================================================================
    // UROGÉNITAL — Antimuscariniques vésicaux
    // ========================================================================
    "oxybutynine": {
        priscus: "PIM", priscus_alt: "Mirabégron, trospium, rééducation périnéale",
        forta: "D", eu7pim: true, beers: true, pimcheck: true,
        risque_principal: "PIM absolu : passage BHE maximal, déclin cognitif, confusion (ACB=3)"
    },
    "tolterodine": {
        priscus: "PIM-B", priscus_cond: "Forme LI PIM, forme LP acceptée",
        priscus_alt: "Trospium, mirabégron",
        forta: "C", eu7pim: true, beers: true,
        risque_principal: "Anticholinergique, sécheresse buccale, constipation"
    },
    "solifenacine": {
        priscus: "PIM-B", priscus_cond: "> 5 mg/j",
        forta: "C", eu7pim: true, beers: true,
        risque_principal: "Anticholinergique, constipation, QTc"
    },
    "fesoterodine": {
        priscus: "PIM-B", priscus_cond: "> 4 mg/j",
        forta: "C", eu7pim: true, beers: true,
        risque_principal: "Anticholinergique (métabolite actif = toltérodine)"
    },
    "darifenacine": {
        priscus: "PIM", forta: "D", eu7pim: true, beers: true,
        risque_principal: "Anticholinergique sélectif M3 mais passage BHE"
    },
    "trospium": {
        priscus: null, forta: "B", forta_indication: "Hyperactivité vésicale (ne passe pas la BHE)",
        eu7pim: false, beers: false,
        risque_principal: "Constipation, sécheresse buccale (mais PAS de passage BHE)"
    },
    "mirabegron": {
        priscus: null, forta: "B", forta_indication: "Hyperactivité vésicale (agoniste β3, pas ACB)",
        eu7pim: false, beers: false,
        risque_principal: "HTA, tachycardie, IU (rare)"
    },
    "flavoxate": {
        priscus: "PIM", eu7pim: true, beers: true,
        risque_principal: "Anticholinergique, efficacité non démontrée"
    },

    // ========================================================================
    // CARDIOVASCULAIRE
    // ========================================================================
    "digoxine": {
        priscus: "PIM-B", priscus_cond: "> 0.125 mg/j ou sans monitorage",
        priscus_alt: "Bêtabloquant cardiosélectif pour contrôle fréquence",
        forta: "C", forta_indication: "FA (contrôle fréquence en 2ème intention)",
        eu7pim: true, eu7pim_cond: "> 0.125 mg/j", beers: true, beers_cond: "1ère intention FA, > 0.125 mg/j",
        pimcheck: true, pimcheck_detail: "Index thérapeutique étroit, dosage digoxinémie",
        risque_principal: "Intoxication digitalique (IRA, hypoK, interactions), mortalité FA"
    },
    "amiodarone": {
        priscus: null, priscus_cond: "Ambiguë",
        forta: "C", forta_indication: "FA (toxicité thyroïde/poumon/foie/neuro/peau)",
        eu7pim: true, beers: true, beers_cond: "1ère intention FA",
        pimcheck: true, pimcheck_detail: "Thyroïde, poumon, foie, interactions multiples",
        risque_principal: "Thyrotoxicose, fibrose pulmonaire, hépatotoxicité, neuropathie, QTc"
    },
    "dronedarone": {
        priscus: "PIM", priscus_alt: "Bêtabloquant, amiodarone sous surveillance",
        eu7pim: true, pimcheck: true,
        risque_principal: "CI en IC (surmortalité PALLAS), hépatotoxicité"
    },
    "flecainide": {
        priscus: "PIM", priscus_alt: "Bêtabloquant, amiodarone",
        eu7pim: true, pimcheck: true,
        risque_principal: "Proarythmie si cardiopathie structurelle"
    },
    "propafenone": {
        priscus: "PIM-B", priscus_cond: "Au long cours",
        priscus_alt: "Bêtabloquant, amiodarone",
        eu7pim: true, risque_principal: "Proarythmie, bêtablocage"
    },
    "nifedipine": {
        priscus: "PIM-B", priscus_cond: "Forme LI PIM absolu, LP acceptable",
        priscus_alt: "Amlodipine, lercanidipine (LP)",
        forta: "C", forta_indication: "HTA (forme LI à proscrire)",
        eu7pim: true, eu7pim_cond: "Libération immédiate", beers: true,
        risque_principal: "Forme LI : hypotension brutale, ischémie réflexe"
    },
    "methyldopa": {
        priscus: "PIM", priscus_alt: "IEC, ARA2, ICa DHP",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Sédation, dépression, bradycardie, hépatotoxicité"
    },
    "clonidine": {
        priscus: "PIM", priscus_alt: "IEC, ARA2, ICa",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Sédation, rebond hypertensif à l'arrêt, bradycardie"
    },
    "moxonidine": {
        priscus: "PIM", priscus_alt: "IEC, ARA2, ICa",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Sédation, hypotension orthostatique"
    },
    "rilmenidine": {
        priscus: "PIM", priscus_alt: "IEC, ARA2, ICa",
        forta: "D", eu7pim: true,
        risque_principal: "Antihypertenseur central, sédation"
    },
    "doxazosine": {
        priscus: "PIM-B", priscus_cond: "Comme antihypertenseur (OK pour HBP à faible dose)",
        forta: "D", forta_indication: "HTA",
        eu7pim: true, beers: true, beers_cond: "Comme antihypertenseur",
        risque_principal: "Hypotension orthostatique, chutes, incontinence"
    },
    "prazosine": {
        priscus: "PIM", priscus_alt: "IEC, ARA2",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Hypotension orthostatique sévère"
    },
    "dipyridamole": {
        priscus: "PIM", priscus_alt: "Clopidogrel, aspirine",
        forta: "D", eu7pim: true,
        risque_principal: "Vasodilatation, céphalées, syncope"
    },
    "ticlopidine": {
        priscus: "PIM", priscus_alt: "Clopidogrel",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Agranulocytose, PTT, hépatotoxicité"
    },
    "prasugrel": {
        priscus: "PIM", priscus_alt: "Clopidogrel, ticagrélor",
        eu7pim: true, beers: true, beers_cond: "> 75 ans",
        risque_principal: "Risque hémorragique majoré chez > 75 ans"
    },

    // ========================================================================
    // ENDOCRINE — Antidiabétiques
    // ========================================================================
    "glibenclamide": {
        priscus: "PIM", priscus_alt: "Gliclazide, metformine, iDPP4",
        forta: "D", eu7pim: true, beers: true, pimcheck: true,
        risque_principal: "Hypoglycémie prolongée (demi-vie longue), surtout si IRC"
    },
    "glimepiride": {
        priscus: "PIM", priscus_alt: "Gliclazide, metformine, iDPP4",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Hypoglycémie prolongée"
    },
    "gliclazide": {
        priscus: "PIM-B", priscus_cond: "Risque d'hypoglycémie mais demi-vie plus courte",
        forta: "C", forta_indication: "DT2 (si metformine insuffisante, ≤ 60 mg LM)",
        risque_principal: "Hypoglycémie (mais moindre que glibenclamide)"
    },
    "pioglitazone": {
        priscus: "PIM", priscus_alt: "Metformine, iDPP4, iSGLT2",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "IC, fractures, cancer vessie"
    },
    "acarbose": {
        priscus: "PIM", priscus_alt: "iDPP4, metformine",
        forta: "D", eu7pim: true,
        risque_principal: "Flatulences, diarrhée, mauvaise tolérance"
    },
    "metformine": {
        priscus: null, forta: "A", forta_indication: "DT2 — 1er choix (si DFG > 30)",
        risque_principal: "Acidose lactique si DFG < 30, troubles GI"
    },
    "sitagliptine": {
        priscus: null, forta: "A", forta_indication: "DT2 chez âgé (bonne tolérance)",
        risque_principal: "Peu d'EI, adaptation rénale"
    },
    "linagliptine": {
        priscus: null, forta: "A", forta_indication: "DT2 — pas d'adaptation rénale",
        risque_principal: "Très bonne tolérance, pas d'ajustement rénal"
    },
    "empagliflozin": {
        priscus: null, forta: "A", forta_indication: "DT2 + IC ou MRC — bénéfice cardiovasculaire",
        risque_principal: "Infections génitales, déshydratation, acidocétose rare"
    },
    "dapagliflozin": {
        priscus: null, forta: "A", forta_indication: "DT2 + IC ou MRC",
        risque_principal: "Infections génitales, déshydratation"
    },
    "repaglinide": {
        priscus: "PIM-B", priscus_cond: "Hypoglycémie possible (mais demi-vie courte)",
        forta: "C", eu7pim: true,
        risque_principal: "Hypoglycémie (moins que sulfamides)"
    },
    "insuline": {
        priscus: null, forta: "A", forta_indication: "DT2 si nécessaire (schéma simplifié)",
        beers: true, beers_cond: "Sliding scale seule (sans basale) = PIM",
        risque_principal: "Hypoglycémie (cibles assouplies si fragile)"
    },

    // ========================================================================
    // GASTRO — IPP
    // ========================================================================
    "omeprazole": {
        priscus: "PIM-B", priscus_cond: "> 8 semaines sans indication claire",
        priscus_alt: "Demi-dose, anti-H2, arrêt progressif",
        forta: "C", forta_indication: "Gastroprotection (C si > 8 sem sans indication)",
        eu7pim: true, eu7pim_cond: "> 8 semaines",
        beers: true, beers_cond: "> 8 semaines sans indication",
        pimcheck: true, pimcheck_detail: "Réévaluer > 8 sem : fractures, C.diff, hypoMg, néphrite",
        risque_principal: "Long cours : fractures, C. difficile, hypoMg, néphrite interstitielle, B12"
    },
    "esomeprazole": {
        priscus: "PIM-B", priscus_cond: "> 8 semaines sans indication claire",
        priscus_alt: "Demi-dose, anti-H2",
        forta: "C", forta_indication: "Idem oméprazole",
        eu7pim: true, eu7pim_cond: "> 8 semaines", beers: true,
        risque_principal: "Idem oméprazole"
    },
    "lansoprazole": {
        priscus: "PIM-B", priscus_cond: "> 8 semaines",
        eu7pim: true, eu7pim_cond: "> 8 semaines", beers: true,
        risque_principal: "Idem IPP"
    },
    "pantoprazole": {
        priscus: "PIM-B", priscus_cond: "> 8 semaines",
        eu7pim: true, eu7pim_cond: "> 8 semaines", beers: true,
        risque_principal: "Idem IPP"
    },
    "rabeprazole": {
        priscus: "PIM-B", priscus_cond: "> 8 semaines",
        eu7pim: true, eu7pim_cond: "> 8 semaines", beers: true,
        risque_principal: "Idem IPP"
    },

    // ========================================================================
    // GASTRO — Antiémétiques / Prokinétiques
    // ========================================================================
    "metoclopramide": {
        priscus: "PIM", priscus_alt: "Dompéridone (si QTc N), ondansétron",
        forta: "D", eu7pim: true, beers: true, pimcheck: true,
        risque_principal: "Dyskinésie tardive, EPS, syndrome parkinsonien"
    },
    "domperidone": {
        priscus: "PIM-B", priscus_cond: "> 30 mg/j ou > 1 semaine",
        priscus_alt: "Ondansétron",
        eu7pim: true, pimcheck: true, pimcheck_detail: "QTc, max 30 mg/j, max 1 semaine",
        risque_principal: "Allongement QTc, mort subite"
    },
    "metopimazine": {
        priscus: "PIM", eu7pim: true,
        risque_principal: "Phénothiazine, QTc, EPS"
    },

    // ========================================================================
    // AINS — Classification détaillée
    // ========================================================================
    "ibuprofene": {
        priscus: "PIM-B", priscus_cond: "> 1200 mg/j ou > 7 jours sans IPP",
        priscus_alt: "Paracétamol, AINS topiques",
        forta: "C", forta_indication: "Douleur (courte durée + IPP)",
        eu7pim: true, eu7pim_cond: "Long cours", beers: true,
        risque_principal: "Rénal, GI, cardiovasculaire"
    },
    "naproxene": {
        priscus: "PIM-B", priscus_cond: "> 500 mg/j ou > 7 jours sans IPP",
        forta: "C", eu7pim: true, beers: true,
        risque_principal: "GI (meilleur profil CV que autres AINS mais GI)"
    },
    "diclofenac": {
        priscus: "PIM-B", priscus_cond: "> 75 mg/j ou > 7 jours sans IPP",
        forta: "D", forta_indication: "Risque CV le plus élevé des AINS non sélectifs",
        eu7pim: true, beers: true, pimcheck: true,
        risque_principal: "Risque cardiovasculaire élevé, rénal, GI"
    },
    "piroxicam": {
        priscus: "PIM", priscus_alt: "Ibuprofène courte durée + IPP",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Demi-vie > 50h, accumulation, GI++"
    },
    "meloxicam": {
        priscus: "PIM-B", priscus_cond: "Dose minimale, courte durée",
        forta: "C", eu7pim: true,
        risque_principal: "Rénal, GI, cardiovasculaire"
    },
    "ketoprofene": {
        priscus: "PIM-B", priscus_cond: "> 7 jours sans IPP",
        eu7pim: true, beers: true,
        risque_principal: "GI, rénal, photosensibilité"
    },
    "celecoxib": {
        priscus: "PIM-B", priscus_cond: "> 200 mg/j ou > 7 jours",
        priscus_alt: "Paracétamol, topiques",
        forta: "C", eu7pim: true, beers: true,
        risque_principal: "Risque cardiovasculaire, moins GI mais pas nul"
    },
    "etoricoxib": {
        priscus: "PIM-B", priscus_cond: "> 60 mg/j",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "HTA, risque CV, rétention hydrosodée"
    },
    "indometacine": {
        priscus: "PIM", priscus_alt: "Paracétamol, colchicine (goutte)",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "Effets centraux fréquents (céphalées, vertiges), GI, rénal"
    },

    // ========================================================================
    // MUSCULOSQUELETTIQUE
    // ========================================================================
    "thiocolchicoside": {
        priscus: "PIM", priscus_alt: "Kinésithérapie, paracétamol",
        eu7pim: true, beers: true, beers_cond: "Myorelaxant",
        risque_principal: "Sédation, convulsions, peu de preuves d'efficacité"
    },
    "methocarbamol": {
        priscus: "PIM", priscus_alt: "Kinésithérapie",
        eu7pim: true, beers: true,
        risque_principal: "Sédation, anticholinergique"
    },
    "baclofene": {
        priscus: "PIM-B", priscus_cond: "> 30 mg/j ou dose non réduite si IRC",
        beers: true, risque_principal: "Sédation, syndrome de sevrage si arrêt brutal, confusion"
    },
    "tizanidine": {
        priscus: "PIM", priscus_alt: "Baclofène faible dose si nécessaire",
        eu7pim: true, beers: true,
        risque_principal: "Sédation, hypotension, hépatotoxicité, QTc"
    },

    // ========================================================================
    // ANTALGIQUES OPIOÏDES — Classification FORTA/PRISCUS
    // ========================================================================
    "tramadol": {
        priscus: "PIM-B", priscus_cond: "> 150 mg/j ou sans adaptation rénale",
        forta: "C", forta_indication: "Douleur modérée",
        eu7pim: true, beers: true, beers_cond: "Risque de convulsions, syndrome sérotoninergique",
        pimcheck: true, pimcheck_detail: "Convulsions, SIADH, interactions",
        risque_principal: "Convulsions, SIADH, syndrome sérotoninergique, nausées"
    },
    "codeine": {
        priscus: "PIM-B", priscus_cond: "Métaboliseurs ultra-rapides CYP2D6",
        forta: "C", eu7pim: true,
        risque_principal: "Constipation, sédation, variabilité CYP2D6"
    },
    "morphine": {
        priscus: null, forta: "A", forta_indication: "Douleur sévère (opioïde de référence)",
        risque_principal: "Accumulation métabolite M6G si IRC → préférer oxycodone"
    },
    "oxycodone": {
        priscus: null, forta: "A", forta_indication: "Douleur sévère (pas de métabolites actifs rénaux)",
        risque_principal: "Constipation, sédation"
    },
    "fentanyl": {
        priscus: null, forta: "A", forta_indication: "Douleur sévère transdermique",
        risque_principal: "Dépression respiratoire, accumulation si fièvre/cachexi"
    },
    "buprenorphine": {
        priscus: null, forta: "A", forta_indication: "Douleur sévère (effet plafond, sûr en IRC)",
        risque_principal: "Nausées, constipation (mais profil sécurité favorable)"
    },
    "pethidine": {
        priscus: "PIM", priscus_alt: "Morphine, oxycodone",
        forta: "D", eu7pim: true, beers: true,
        risque_principal: "PIM absolu : métabolite neurotoxique (norpéthidine), convulsions"
    },

    // ========================================================================
    // DIVERS
    // ========================================================================
    "theophylline": {
        priscus: "PIM-B", priscus_cond: "Index thérapeutique étroit, interactions multiples",
        forta: "D", forta_indication: "BPCO (alternatives plus sûres)",
        eu7pim: true, beers: true,
        risque_principal: "Index thérapeutique étroit, arythmies, convulsions, interactions"
    },
    "nitrofurantoine": {
        priscus: null, priscus_cond: "Ambiguë",
        forta: "C", forta_indication: "IU basse (OK si DFG > 45)",
        beers: true, beers_cond: "ClCr < 30 ou long cours (neuropathie, fibrose pulmonaire)",
        risque_principal: "Neuropathie, fibrose pulmonaire si long cours"
    },
    "colchicine": {
        priscus: null, priscus_cond: "Ambiguë",
        forta: "C", eu7pim: true, eu7pim_cond: "CI si DFG < 10",
        risque_principal: "Index thérapeutique étroit, diarrhée, myopathie si IRC"
    },
    "spironolactone": {
        priscus: "PIM-B", priscus_cond: "> 25 mg/j sans monitorage K+",
        forta: "A", forta_indication: "IC (ARM à dose ≤ 25 mg avec surveillance K+)",
        pimcheck: true, pimcheck_detail: "Surveillance K+ obligatoire",
        risque_principal: "Hyperkaliémie, gynécomastie"
    },
    "furosemide": {
        priscus: null, forta: "A", forta_indication: "IC congestive",
        pimcheck: true, pimcheck_detail: "Surveillance ionogramme, DFG",
        risque_principal: "Déshydratation, hypoK, hypoNa, hyperuricémie"
    },
    "alendronate": {
        priscus: null, forta: "A", forta_indication: "Ostéoporose (1er choix)",
        risque_principal: "Œsophagite (prise debout), ostéonécrose mâchoire (rare, long cours)"
    },
    "denosumab": {
        priscus: null, forta: "A", forta_indication: "Ostéoporose (si CI bisphosphonates ou IRC)",
        risque_principal: "Hypocalcémie, rebond fracturaire à l'arrêt"
    },
    "allopurinol": {
        priscus: null, forta: "A", forta_indication: "Goutte (titration progressive)",
        risque_principal: "DRESS syndrome (titration lente 100 mg → dose cible)"
    },
    "meprobamate": {
        priscus: "PIM", forta: "D", eu7pim: true, beers: true,
        risque_principal: "PIM absolu : dépendance, toxicité, surdosage"
    },
    "pentoxifylline": {
        priscus: "PIM", priscus_alt: "Exercice physique, revascularisation",
        forta: "D", eu7pim: true,
        risque_principal: "Efficacité non prouvée en AOMI, vertiges, nausées"
    }
};

// ============================================================================
// 🔍 RÈGLES ADDITIONNELLES CONDITIONNELLES (PIM-Check / REMEDIES / EU7-PIM)
// ============================================================================

const RECOS_SUPPLEMENT = [

    // PIM-Check — Règles de co-prescription et monitoring
    {
        id: "SUP_PIMC_01", sources: ["PIM_CHECK"],
        titre: "Corticoïde systémique > 3 mois sans bilan ostéoporose",
        message: "PIM-Check : Corticothérapie systémique > 3 mois sans évaluation du risque fracturaire ni traitement préventif (vitamine D + calcium + bisphosphonate si T-score ≤ -1.5).",
        severite: "warning",
        condition: { med_keys: ["corticoide", "prednisone", "prednisolone", "methylprednisolone", "dexamethasone"], med_absent: ["alendronate", "risedronate", "acide zoledronique", "denosumab", "cholecalciferol", "vitamine d"] }
    },
    {
        id: "SUP_PIMC_02", sources: ["PIM_CHECK"],
        titre: "Diurétique sans ionogramme de surveillance",
        message: "PIM-Check : Tout diurétique au long cours nécessite un ionogramme de surveillance (K+, Na+, créatinine) au minimum tous les 6 mois.",
        severite: "warning",
        condition: { med_keys: ["diuretique", "furosemide", "bumetanide", "hydrochlorothiazide", "indapamide", "spironolactone"] }
    },
    {
        id: "SUP_PIMC_03", sources: ["PIM_CHECK"],
        titre: "Lithium sans monitorage régulier",
        message: "PIM-Check : Lithium nécessite monitorage régulier : lithiémie, créatinine/DFG, TSH, calcémie tous les 3-6 mois.",
        severite: "warning",
        condition: { med_keys: ["lithium"] }
    },
    {
        id: "SUP_PIMC_04", sources: ["PIM_CHECK"],
        titre: "Méthotrexate sans supplémentation en acide folique",
        message: "PIM-Check : Méthotrexate sans acide folique co-prescrit — risque de toxicité hématologique et mucite.",
        severite: "danger",
        condition: { med_keys: ["methotrexate"], med_absent: ["acide folique", "folinate"] }
    },
    {
        id: "SUP_PIMC_05", sources: ["PIM_CHECK"],
        titre: "AVK sans surveillance INR régulière documentée",
        message: "PIM-Check : AVK nécessite un INR régulier (tous les 8-28 jours selon stabilité).",
        severite: "warning",
        condition: { med_keys: ["acenocoumarol", "warfarine", "fluindione"] }
    },
    {
        id: "SUP_PIMC_06", sources: ["PIM_CHECK"],
        titre: "Inhibiteur acétylcholinestérase sans ECG de référence",
        message: "PIM-Check : IAChE (donépézil, rivastigmine, galantamine) — ECG de référence recommandé avant initiation (risque de bradycardie, BAV).",
        severite: "warning",
        condition: { med_keys: ["donepezil", "rivastigmine", "galantamine"] }
    },
    {
        id: "SUP_PIMC_07", sources: ["PIM_CHECK"],
        titre: "Antiarythmique classe I/III sans ECG régulier",
        message: "PIM-Check : Antiarythmiques classe I (flécaïnide, propafénone) et III (amiodarone, dronédarone, sotalol) : ECG avec mesure QTc au minimum tous les 6 mois.",
        severite: "warning",
        condition: { med_keys: ["flecainide", "propafenone", "amiodarone", "dronedarone", "sotalol"] }
    },
    {
        id: "SUP_PIMC_08", sources: ["PIM_CHECK"],
        titre: "Triple association IEC/ARA2 + diurétique + AINS",
        message: "PIM-Check : Triple association IEC/ARA2 + diurétique + AINS = « triple whammy » — risque élevé d'IRA.",
        severite: "danger",
        condition: { med_keys: ["iec", "ara2"], med_keys_2: ["ains"] }
    },
    {
        id: "SUP_PIMC_09", sources: ["PIM_CHECK"],
        titre: "Anticoagulant + antiagrégant sans indication documentée de double thérapie",
        message: "PIM-Check : Association anticoagulant + antiagrégant — risque hémorragique majeur. Justification de la double thérapie nécessaire (stent récent ?).",
        severite: "danger",
        condition: { med_keys: ["anticoag", "apixaban", "rivaroxaban", "dabigatran", "edoxaban", "acenocoumarol", "warfarine", "fluindione"], med_keys_2: ["antiagreg", "acide acetylsalicylique", "clopidogrel"] }
    },
    {
        id: "SUP_PIMC_10", sources: ["PIM_CHECK"],
        titre: "IEC/ARA2 sans contrôle créatinine/K+ post-initiation",
        message: "PIM-Check : IEC ou ARA2 — contrôle créatinine et K+ recommandé dans les 7-14 jours après initiation ou changement de dose.",
        severite: "warning",
        condition: { med_keys: ["iec", "ara2"] }
    },
    {
        id: "SUP_PIMC_11", sources: ["PIM_CHECK"],
        titre: "Clozapine sans NFS hebdomadaire",
        message: "PIM-Check : Clozapine — NFS obligatoire (hebdomadaire pendant 18 semaines, puis mensuelle) pour dépistage agranulocytose.",
        severite: "danger",
        condition: { med_keys: ["clozapine"] }
    },
    {
        id: "SUP_PIMC_12", sources: ["PIM_CHECK"],
        titre: "Statine haute dose chez > 75 ans sans réévaluation",
        message: "PIM-Check : Statine haute intensité (atorvastatine > 40 mg, rosuvastatine > 20 mg) chez > 75 ans — réévaluer le rapport bénéfice/risque. Risque musculaire accru.",
        severite: "warning",
        condition: { med_keys: ["atorvastatine", "rosuvastatine"], age_min: 75 }
    },

    // REMEDIES — Déprescription et rationalisation
    {
        id: "SUP_REM_01", sources: ["REMEDIES"],
        titre: "Fer oral au long cours sans vérification de la réponse",
        message: "REMEDIES : Fer oral au long cours (> 3 mois) — vérifier NFS et ferritine pour confirmer la réponse. Arrêter si ferritine normalisée.",
        severite: "warning",
        condition: { med_keys: ["fer", "fumarate ferreux", "sulfate ferreux", "ascorbate ferreux"] }
    },
    {
        id: "SUP_REM_02", sources: ["REMEDIES"],
        titre: "Supplémentation calcique > 1000 mg/j",
        message: "REMEDIES : Supplémentation calcique > 1000 mg/j — risque cardiovasculaire discuté. Favoriser l'apport alimentaire. Max 500-600 mg/j en supplément.",
        severite: "warning",
        condition: { med_keys: ["carbonate de calcium", "calcium"] }
    },
    {
        id: "SUP_REM_03", sources: ["REMEDIES", "STOPPFRAIL"],
        titre: "Médicament anti-Alzheimer si démence sévère sans bénéfice observé",
        message: "REMEDIES / STOPPFrail : IAChE ou mémantine si démence sévère (MMSE < 10) ou absence de bénéfice observé depuis ≥ 6 mois — envisager arrêt progressif.",
        severite: "warning",
        condition: { med_keys: ["donepezil", "rivastigmine", "galantamine", "memantine"], fragile: true }
    },
    {
        id: "SUP_REM_04", sources: ["REMEDIES"],
        titre: "Laxatif stimulant au long cours",
        message: "REMEDIES : Laxatif stimulant (bisacodyl, séné, picosulfate) au long cours — préférer laxatif osmotique (macrogol, lactulose). Stimulants réservés au court terme.",
        severite: "warning",
        condition: { med_keys: ["bisacodyl", "sene"] }
    },
    {
        id: "SUP_REM_05", sources: ["REMEDIES"],
        titre: "Antispasmodique GI au long cours",
        message: "REMEDIES : Antispasmodique GI (mébévérine, alvérine, phloroglucinol, trimébutine) au long cours — efficacité non démontrée en continu. Réévaluer périodiquement.",
        severite: "info",
        condition: { med_keys: ["mebeverine", "alverine", "phloroglucinol", "trimebutine"] }
    },
    {
        id: "SUP_REM_06", sources: ["REMEDIES", "STOPPFRAIL"],
        titre: "Supplémentation multivitamines sans carence documentée",
        message: "REMEDIES / STOPPFrail : Multivitamines/minéraux sans carence biologique documentée — pas de bénéfice prouvé, risque d'interactions.",
        severite: "info",
        condition: { type: "manual_review" }
    },
    {
        id: "SUP_REM_07", sources: ["REMEDIES"],
        titre: "Anti-vertigineux au long cours (bétahistine, méclizine)",
        message: "REMEDIES : Anti-vertigineux (bétahistine, méclizine, flunarizine, cinnarizine) au long cours — efficacité limitée au-delà de la crise, effets sédatifs.",
        severite: "warning",
        condition: { med_keys: ["betahistine", "meclizine", "flunarizine", "cinnarizine"] }
    },
    {
        id: "SUP_REM_08", sources: ["REMEDIES", "EU7PIM"],
        titre: "Vasodilatateurs cérébraux/périphériques (efficacité non prouvée)",
        message: "REMEDIES / EU(7)-PIM : Vasodilatateurs cérébraux/périphériques (pentoxifylline, ginkgo biloba, piracétam, vinpocétine, naftidrofuryl) — efficacité non prouvée, effets indésirables.",
        severite: "warning",
        condition: { med_keys: ["pentoxifylline", "ginkgo", "piracetam", "naftidrofuryl", "nicergoline"] }
    },
    {
        id: "SUP_REM_09", sources: ["REMEDIES"],
        titre: "Double anticoagulation non justifiée",
        message: "REMEDIES : Deux anticoagulants simultanés (ex: AOD + HBPM) sans justification claire (relais, ponctuel post-opératoire).",
        severite: "danger",
        condition: { type: "manual_review" }
    },
    {
        id: "SUP_REM_10", sources: ["REMEDIES"],
        titre: "Réévaluation annuelle de chaque traitement chronique",
        message: "REMEDIES : Chaque médicament chronique doit être réévalué au minimum 1 fois/an. Pour chaque molécule, se poser la question : l'indication est-elle toujours présente ? Le bénéfice justifie-t-il les risques ?",
        severite: "info",
        condition: { polypharmacie: true, seuil: 5 }
    },

    // EU(7)-PIM supplémentaires — molécules spécifiques
    {
        id: "SUP_EU7_01", sources: ["EU7PIM"],
        titre: "Cinnarizine / Flunarizine",
        message: "EU(7)-PIM : Cinnarizine et flunarizine — risque de parkinsonisme, dépression, prise de poids. Durée maximale recommandée : 4-8 semaines.",
        severite: "warning",
        condition: { med_keys: ["cinnarizine", "flunarizine"] }
    },
    {
        id: "SUP_EU7_02", sources: ["EU7PIM", "PRISCUS"],
        titre: "Dimenhydrinate (antiémétique)",
        message: "EU(7)-PIM / PRISCUS : Dimenhydrinate — antihistaminique H1 sédatif (ACB élevé). Préférer ondansétron.",
        severite: "warning",
        condition: { med_keys: ["dimenhydrinate"] }
    },
    {
        id: "SUP_EU7_03", sources: ["EU7PIM"],
        titre: "Scopolamine (antiémétique)",
        message: "EU(7)-PIM : Scopolamine — anticholinergique puissant (ACB=3). Risque de confusion, rétention urinaire, glaucome.",
        severite: "danger",
        condition: { med_keys: ["scopolamine", "hyoscine"] }
    },
    {
        id: "SUP_EU7_04", sources: ["EU7PIM", "PRISCUS"],
        titre: "Mébévérine au long cours",
        message: "EU(7)-PIM / PRISCUS : Mébévérine au long cours — efficacité non prouvée en continu. Alternatives : mesures hygiéno-diététiques, psyllium.",
        severite: "info",
        condition: { med_keys: ["mebeverine"] }
    },
    {
        id: "SUP_EU7_05", sources: ["EU7PIM", "PRISCUS"],
        titre: "Loperamide > 3 jours ou > 12 mg/j",
        message: "EU(7)-PIM / PRISCUS : Lopéramide > 3 jours ou > 12 mg/j — risque de mégacôlon toxique, rétention fécale. Réserver à l'usage ponctuel.",
        severite: "warning",
        condition: { med_keys: ["loperamide"] }
    },
    {
        id: "SUP_EU7_06", sources: ["EU7PIM"],
        titre: "Antacides contenant aluminium",
        message: "EU(7)-PIM : Antacides contenant aluminium (phosphalugel, maalox) — constipation, hypophosphatémie, encéphalopathie si usage prolongé ou IRC.",
        severite: "warning",
        condition: { med_keys: ["aluminium", "phosphalugel"] }
    },
    {
        id: "SUP_EU7_07", sources: ["EU7PIM", "PRISCUS"],
        titre: "Paraffine liquide (laxatif)",
        message: "EU(7)-PIM / PRISCUS : Paraffine liquide — risque de pneumopathie lipidique par aspiration, malabsorption vitamines liposolubles.",
        severite: "warning",
        condition: { med_keys: ["paraffine"] }
    },

    // ========================================================================
    // Interactions manquantes intégrées depuis GERIA_DB (Beers 2023 / REMEDIES)
    // ========================================================================
    {
        id: "SUP_INT_001", sources: ["BEERS"],
        titre: "Lithium + IEC/ARA2 : surveiller lithémie",
        message: "Beers 2023 : Les IEC/ARA2 modifient la volémie et réduisent la clairance rénale du lithium → risque de toxicité (marge thérapeutique étroite). Surveiller la lithémie de façon rapprochée.",
        severite: "warning",
        condition: { med_keys: ["lithium"], med_keys_2: ["iec", "ara2"] }
    },
    {
        id: "SUP_INT_002", sources: ["BEERS", "EU7PIM"],
        titre: "Phénytoïne + Cotrimoxazole : risque de toxicité",
        message: "Beers/EU(7)-PIM : Le TMP-SMX inhibe le métabolisme de la phénytoïne → surdosage (nystagmus, ataxie, convulsions). Éviter l'association ou doser la phénytoïnémie.",
        severite: "danger",
        condition: { med_keys: ["phenytoine"], med_keys_2: ["cotrimoxazole", "trimethoprime", "sulfamethoxazole"] }
    },
    {
        id: "SUP_INT_003", sources: ["BEERS"],
        titre: "Théophylline + Fluoroquinolones : toxicité théophylline",
        message: "Beers 2023 : Les fluoroquinolones (ciprofloxacine, norfloxacine) inhibent le métabolisme hépatique de la théophylline → risque de surdosage (tachycardie, convulsions). Éviter l'association.",
        severite: "danger",
        condition: { med_keys: ["theophylline"], med_keys_2: ["ciprofloxacine", "norfloxacine", "levofloxacine", "ofloxacine", "moxifloxacine"] }
    },
    {
        id: "SUP_INT_004", sources: ["BEERS"],
        titre: "AVK + Amiodarone : surveiller INR étroitement",
        message: "Beers 2023 : L'amiodarone inhibe le métabolisme des AVK (CYP2C9) → risque hémorragique majeur. Réduire la dose d'AVK de 30-50% et contrôler l'INR 2×/semaine pendant 4-6 semaines.",
        severite: "danger",
        condition: { med_keys: ["warfarine", "fluindione", "acenocoumarol", "avk"], med_keys_2: ["amiodarone"] }
    },
    {
        id: "SUP_INT_005", sources: ["BEERS"],
        titre: "Alpha-bloquant HTA + Diurétique de l'anse (femme)",
        message: "Beers 2023 : Association alpha-bloquant antihypertenseur + diurétique de l'anse : risque d'incontinence urinaire aggravée chez la femme âgée.",
        severite: "warning",
        condition: { med_keys: ["doxazosine", "prazosine", "terazosine", "urapidil"], med_keys_2: ["furosemide", "bumetanide"] }
    },
    {
        id: "SUP_INT_006", sources: ["REMEDIES"],
        titre: "Colchicine + Macrolide : CONTRE-INDICATION ABSOLUE",
        message: "REMEDIES I-19 : Colchicine + macrolide (sauf spiramycine) = surdosage potentiellement fatal : pancytopénie, défaillance multiviscérale. URGENCE : changer l'antibiotique.",
        severite: "danger",
        condition: { med_keys: ["colchicine"], med_keys_2: ["clarithromycine", "erythromycine", "azithromycine", "roxithromycine", "josamycine"] }
    },
    {
        id: "SUP_INT_007", sources: ["REMEDIES"],
        titre: "IEC/ARA2 + Cotrimoxazole : hyperkaliémie sévère",
        message: "REMEDIES I-9/I-10 : L'association IEC/ARA2 + cotrimoxazole (ou sels de potassium) expose à une hyperkaliémie sévère, potentiellement létale. Surveillance kaliémie impérative.",
        severite: "danger",
        condition: { med_keys: ["iec", "ara2"], med_keys_2: ["cotrimoxazole", "trimethoprime", "sulfamethoxazole"] }
    },
    {
        id: "SUP_INT_008", sources: ["REMEDIES"],
        titre: "Bêtabloquant + Inhibiteur acétylcholinestérase : bradycardie",
        message: "REMEDIES I-1 : L'association bêtabloquant + IAChE (donépézil, rivastigmine, galantamine) expose à un risque de trouble de conduction, bradycardie excessive et syncope. ECG de surveillance recommandé.",
        severite: "warning",
        condition: { med_keys: ["betabloquant"], med_keys_2: ["donepezil", "rivastigmine", "galantamine"] }
    },
    {
        id: "SUP_INT_009", sources: ["BEERS"],
        titre: "AVK + ISRS : surveillance INR",
        message: "Beers 2023 : Les ISRS inhibent la recapture plaquettaire et interfèrent avec le métabolisme des AVK → risque hémorragique accru. Surveillance INR recommandée.",
        severite: "warning",
        condition: { med_keys: ["warfarine", "fluindione", "acenocoumarol", "avk"], med_keys_2: ["isrs", "citalopram", "escitalopram", "sertraline", "paroxetine", "fluoxetine"] }
    },
    {
        id: "SUP_INT_010", sources: ["BEERS"],
        titre: "Digoxine + Amiodarone : surveiller digoxinémie",
        message: "Beers 2023 : L'amiodarone inhibe le transport rénal (P-gp) de la digoxine → accumulation et toxicité digitalique. Réduire la dose de digoxine de 50% et doser la digoxinémie.",
        severite: "danger",
        condition: { med_keys: ["digoxine"], med_keys_2: ["amiodarone"] }
    },
    {
        id: "SUP_INT_011", sources: ["BEERS"],
        titre: "Inhibiteur calcique non-DHP + Bêtabloquant : trouble conductif",
        message: "Beers 2023 : L'association vérapamil ou diltiazem + bêtabloquant expose au risque de BAV, bradycardie sévère, insuffisance cardiaque aiguë. À éviter sauf indication spécifique.",
        severite: "danger",
        condition: { med_keys: ["verapamil", "diltiazem"], med_keys_2: ["betabloquant"] }
    }
];


// ============================================================================
// 🔧 FONCTIONS D'ÉVALUATION COMPLÉMENTAIRES
// ============================================================================

/**
 * Recherche le statut PIM d'une DCI dans le dictionnaire.
 * @param {string} dci - DCI du médicament
 * @returns {Object|null} entrée PIM ou null
 */
function getPimStatus(dci) {
    if (!dci) return null;
    const key = dci.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '');
    
    for (const [dictKey, entry] of Object.entries(PIM_DICT)) {
        const normalizedDictKey = dictKey.replace(/[^a-z0-9]/g, '');
        if (key.includes(normalizedDictKey) || normalizedDictKey.includes(key)) {
            return { dci_matched: dictKey, ...entry };
        }
    }
    return null;
}

/**
 * Génère un badge HTML de classification PIM pour un médicament donné.
 */
function renderPimBadges(dci) {
    const pim = getPimStatus(dci);
    if (!pim) return '';
    
    let badges = [];
    
    if (pim.priscus === "PIM") badges.push('<span class="badge bg-danger">PRISCUS PIM</span>');
    else if (pim.priscus === "PIM-B") badges.push(`<span class="badge bg-warning text-dark" title="${pim.priscus_cond || ''}">PRISCUS PIM-B</span>`);
    
    if (pim.forta === "D") badges.push('<span class="badge bg-danger">FORTA-D</span>');
    else if (pim.forta === "C") badges.push('<span class="badge bg-warning text-dark">FORTA-C</span>');
    else if (pim.forta === "B") badges.push('<span class="badge bg-info">FORTA-B</span>');
    else if (pim.forta === "A") badges.push('<span class="badge bg-success">FORTA-A</span>');
    
    if (pim.eu7pim) badges.push('<span class="badge bg-secondary">EU7-PIM</span>');
    if (pim.beers) badges.push('<span class="badge bg-dark">Beers</span>');
    if (pim.pimcheck) badges.push('<span class="badge bg-primary">PIM-Check</span>');
    
    if (badges.length === 0) return '';
    return `<div class="mt-1">${badges.join(' ')}</div>`;
}

/**
 * Génère un résumé PIM détaillé pour la fiche d'un médicament.
 */
function renderPimDetail(dci) {
    const pim = getPimStatus(dci);
    if (!pim) return '';
    
    let html = `<div class="card border-warning mb-2"><div class="card-body p-2">`;
    html += `<strong>📋 Classification PIM multi-sources</strong>${renderPimBadges(dci)}<br>`;
    
    if (pim.risque_principal) html += `<small class="text-danger">⚠️ ${pim.risque_principal}</small><br>`;
    if (pim.priscus_cond) html += `<small class="text-muted">PRISCUS : ${pim.priscus_cond}</small><br>`;
    if (pim.priscus_alt) html += `<small class="text-success">💡 Alternative PRISCUS : ${pim.priscus_alt}</small><br>`;
    if (pim.forta_indication) html += `<small class="text-info">FORTA : ${pim.forta_indication}</small><br>`;
    if (pim.pimcheck_detail) html += `<small class="text-primary">PIM-Check : ${pim.pimcheck_detail}</small><br>`;
    if (pim.beers_cond) html += `<small class="text-dark">Beers : ${pim.beers_cond}</small><br>`;
    
    html += `</div></div>`;
    return html;
}
// ============================================================================
// 🔗 GERIA_CROSS_REF - Table de Correspondances Croisées Inter-Sources
// Version 1.0 - Mars 2026
// ============================================================================
// Ce fichier crée des GROUPES de règles cliniquement équivalentes,
// permettant d'afficher UNE SEULE alerte fusionnée (au lieu de doublons)
// avec TOUTES les sources qui la supportent.
// ============================================================================

const CROSS_REF_GROUPS = [

    // ========================================================================
    // GROUPE 1 : BENZODIAZÉPINES — Toutes situations confondues
    // ========================================================================
    {
        group_id: "GRP_BZD_GENERAL",
        theme: "Benzodiazépines chez le sujet âgé",
        description: "Regroupement de toutes les règles ciblant les BZD dans différents contextes (durée, insomnie, SCPD, chutes, insuffisance respiratoire). Chaque contexte reste distinct mais partage le même socle multi-sources.",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "EU7PIM", "FORTA", "PIM_CHECK", "STOPPFRAIL"],
        rule_ids: ["EV_D08", "EV_D09", "EV_D10", "EV_G04", "EV_K01", "EV_K04"],
        pim_dict_keys: ["diazepam", "bromazepam", "alprazolam", "lorazepam", "oxazepam", "clorazepate", "prazepam", "nordazepam", "nitrazepam", "clobazam", "clonazepam", "lormetazepam", "zolpidem", "zopiclone"],
        fusion_strategy: "distinct_context",  // garder les règles séparées mais afficher les sources fusionnées
        note: "Chaque règle a un contexte clinique différent (durée, insomnie, SCPD, chutes, IR). On garde les conditions distinctes mais on affiche le support multi-sources complet sur chacune."
    },

    // ========================================================================
    // GROUPE 2 : ANTIDÉPRESSEURS TRICYCLIQUES
    // ========================================================================
    {
        group_id: "GRP_TCA",
        theme: "Antidépresseurs tricycliques chez le sujet âgé",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "FORTA", "EU7PIM"],
        rule_ids: ["EV_D01", "EV_D02", "EV_FORTA_03", "EV_FORTA_04"],
        pim_dict_keys: ["amitriptyline", "clomipramine", "imipramine", "doxepine", "trimipramine", "nortriptyline", "maprotiline", "dosulpine"],
        fusion_strategy: "merge_display",  // fusionner en une alerte unique si mêmes meds détectés
        note: "EV_D01 (TCA + comorbidités) et EV_D02 (TCA en 1ère intention) couvrent des contextes différents. EV_FORTA_03/04 sont des cas particuliers (amitriptyline, doxépine) — à absorber dans l'alerte TCA générale avec mention spécifique."
    },

    // ========================================================================
    // GROUPE 3 : ANTIPSYCHOTIQUES + DÉMENCE / SCPD
    // ========================================================================
    {
        group_id: "GRP_AP_DEMENCE",
        theme: "Antipsychotiques dans la démence / SCPD",
        merged_sources: ["STOPP3", "BEERS", "FORTA", "PRISCUS", "EU7PIM"],
        rule_ids: ["EV_D05", "EV_D12", "EV_D15", "EV_D16", "EV_D21", "EV_B18", "EV_K02", "EV_PRISC_02"],
        pim_dict_keys: ["haloperidol", "risperidone", "olanzapine", "chlorpromazine", "levomepromazine", "cyamemazine", "flupentixol", "fluphenazine", "pipotiazine", "amisulpride", "aripiprazole", "pimozide"],
        fusion_strategy: "distinct_context",
        note: "Contextes distincts : D5=SCPD>3m, D12=Parkinson/DCL, D15=SCPD>12sem, D16=hypnotique, D21=phénothiazine 1ère ligne, B18=maladie vasculaire, K2=chutes. Garder séparés mais enrichir les sources."
    },

    // ========================================================================
    // GROUPE 4 : ANTIHISTAMINIQUES H1 1ère GÉNÉRATION
    // ========================================================================
    {
        group_id: "GRP_ANTIH1_1G",
        theme: "Antihistaminiques H1 1ère génération",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "EU7PIM", "FORTA"],
        rule_ids: ["EV_D24", "EV_D25", "EV_K06"],
        pim_dict_keys: ["hydroxyzine", "dexchlorpheniramine", "promethazine", "diphenhydramine", "doxylamine", "mequitazine", "alimemazine", "chlorpheniramine", "brompheniramine", "carbinoxamine", "cyproheptadine"],
        fusion_strategy: "distinct_context",
        note: "D24=allergie/prurit, D25=insomnie, K6=chutes. Contextes différents, même classe."
    },

    // ========================================================================
    // GROUPE 5 : DIGOXINE — Toutes situations
    // ========================================================================
    {
        group_id: "GRP_DIGOXINE",
        theme: "Digoxine chez le sujet âgé",
        merged_sources: ["STOPP3", "BEERS", "FORTA", "PRISCUS", "EU7PIM", "PIM_CHECK"],
        rule_ids: ["EV_B01", "EV_B04", "EV_B21", "EV_E01", "EV_FORTA_02"],
        pim_dict_keys: ["digoxine"],
        fusion_strategy: "distinct_context",
        note: "B1=HFpEF, B4=bradycardie, B21=FA 1ère ligne, E1=IRC, FORTA_02=IC sans FA. Fusionner sources sur la fiche digoxine, garder contextes distincts."
    },

    // ========================================================================
    // GROUPE 6 : IPP AU LONG COURS
    // ========================================================================
    {
        group_id: "GRP_IPP",
        theme: "IPP au long cours (> 8 semaines)",
        merged_sources: ["STOPP3", "BEERS", "FORTA", "STOPPFRAIL", "REMEDIES", "PRISCUS", "EU7PIM", "PIM_CHECK"],
        rule_ids: ["EV_F02", "EV_SF05"],
        pim_dict_keys: ["omeprazole", "esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole"],
        fusion_strategy: "merge_display",
        note: "F02 et SF05 ciblent exactement le même problème (IPP > 8 sem sans indication). Fusionner en une seule alerte avec toutes les sources."
    },

    // ========================================================================
    // GROUPE 7 : SULFAMIDES HYPOGLYCÉMIANTS À LONGUE DEMI-VIE
    // ========================================================================
    {
        group_id: "GRP_SULFA_HYPO",
        theme: "Sulfamides hypoglycémiants à longue demi-vie",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "FORTA", "EU7PIM", "PIM_CHECK"],
        rule_ids: ["EV_J01"],
        pim_dict_keys: ["glibenclamide", "glimepiride", "gliclazide"],
        fusion_strategy: "merge_display",
        note: "Toutes les sources convergent. Le PIM_DICT ajoute la granularité par molécule (gliclazide = PIM-B conditionnel vs glibenclamide = PIM absolu)."
    },

    // ========================================================================
    // GROUPE 8 : AINS — Toutes situations
    // ========================================================================
    {
        group_id: "GRP_AINS",
        theme: "AINS chez le sujet âgé",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "FORTA", "EU7PIM", "PIM_CHECK"],
        rule_ids: ["EV_B17", "EV_B19", "EV_C10", "EV_E04", "EV_H01", "EV_H02", "EV_H03", "EV_H07", "EV_H09", "SUP_PIMC_08"],
        pim_dict_keys: ["ibuprofene", "naproxene", "diclofenac", "piroxicam", "meloxicam", "ketoprofene", "celecoxib", "etoricoxib", "indometacine"],
        fusion_strategy: "distinct_context",
        note: "Nombreux contextes : B17=vasculaire, B19=IC, C10=anticoag, E4=IRC, H1=UGD, H2=HTA sévère, H3>3m, H7+corticoïde, H9=arthrose opioïde, PIMC_08=triple whammy. PRISCUS 2.0 apporte la granularité dose/durée par molécule."
    },

    // ========================================================================
    // GROUPE 9 : ANTIMUSCARINIQUES VÉSICAUX
    // ========================================================================
    {
        group_id: "GRP_ANTIMUSC",
        theme: "Antimuscariniques vésicaux",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "FORTA", "EU7PIM"],
        rule_ids: ["EV_I01", "EV_I04", "EV_K12", "EV_PRISC_03"],
        pim_dict_keys: ["oxybutynine", "tolterodine", "solifenacine", "fesoterodine", "darifenacine", "trospium", "flavoxate"],
        fusion_strategy: "distinct_context",
        note: "I1=démence, I4=constipation, K12=chutes, PRISC_03=oxybutynine spécifique. Le PIM_DICT différencie le trospium (FORTA-B, pas PIM) du reste."
    },

    // ========================================================================
    // GROUPE 10 : STATINES — Déprescription chez fragile
    // ========================================================================
    {
        group_id: "GRP_STATINE_DEPRESC",
        theme: "Statines en prévention primaire / patient fragile",
        merged_sources: ["STOPP3", "STOPPFRAIL", "PIM_CHECK"],
        rule_ids: ["EV_B16", "EV_SF01", "SUP_PIMC_12"],
        pim_dict_keys: ["atorvastatine", "rosuvastatine", "simvastatine", "pravastatine", "fluvastatine"],
        fusion_strategy: "merge_display",
        note: "B16, SF01 et PIMC_12 convergent. Fusionner en une alerte unique : 'Réévaluer la statine si prévention primaire, fragilité ou > 85 ans'."
    },

    // ========================================================================
    // GROUPE 11 : INHIBITEURS ACÉTYLCHOLINESTÉRASE / MÉMANTINE
    // ========================================================================
    {
        group_id: "GRP_IACHE",
        theme: "IAChE / Mémantine — Surveillance et déprescription",
        merged_sources: ["STOPP3", "FORTA", "STOPPFRAIL", "REMEDIES", "PIM_CHECK"],
        rule_ids: ["EV_D17", "EV_D18", "EV_D19", "EV_SF06", "SUP_PIMC_06", "SUP_REM_03"],
        pim_dict_keys: ["donepezil", "rivastigmine", "galantamine", "memantine"],
        fusion_strategy: "distinct_context",
        note: "D17=bradycardie, D18=bradycardisant, D19=épilepsie, SF06=démence sévère, PIMC_06=ECG, REM_03=sans bénéfice. Contextes différents mais toutes les sources se complètent."
    },

    // ========================================================================
    // GROUPE 12 : ANTIHYPERTENSEURS CENTRAUX
    // ========================================================================
    {
        group_id: "GRP_ANTIHTA_CENTRAL",
        theme: "Antihypertenseurs d'action centrale",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "EU7PIM", "FORTA"],
        rule_ids: ["EV_B11"],
        pim_dict_keys: ["methyldopa", "clonidine", "moxonidine", "rilmenidine"],
        fusion_strategy: "merge_display",
        note: "Consensus universel toutes sources. PIM_DICT fournit les alternatives par molécule."
    },

    // ========================================================================
    // GROUPE 13 : ANTICOAGULATION — FA et risque hémorragique
    // ========================================================================
    {
        group_id: "GRP_ANTICOAG_FA",
        theme: "Anticoagulation dans la FA — choix et associations",
        merged_sources: ["STOPP3", "BEERS", "PIM_CHECK"],
        rule_ids: ["EV_C04", "EV_C07", "EV_C10", "EV_C11", "EV_C12", "EV_C13", "EV_C14", "SUP_PIMC_09"],
        pim_dict_keys: ["ticlopidine", "prasugrel", "dipyridamole", "digoxine", "amiodarone"],
        fusion_strategy: "distinct_context",
        note: "Règles d'association anticoag+AAP (C4, PIMC_09), choix AVK vs AOD (C11), ISRS+anticoag (C12), dabigatran+diltiazem (C13), AOD+Pgp (C14). Garder distincts."
    },

    // ========================================================================
    // GROUPE 14 : NOOTROPIQUES / VASODILATATEURS CÉRÉBRAUX
    // ========================================================================
    {
        group_id: "GRP_NOOTROP",
        theme: "Nootropiques et vasodilatateurs cérébraux (efficacité non prouvée)",
        merged_sources: ["STOPP3", "STOPPFRAIL", "REMEDIES", "EU7PIM"],
        rule_ids: ["EV_D20", "SUP_REM_08"],
        pim_dict_keys: ["pentoxifylline", "piracetam", "nicergoline"],
        fusion_strategy: "merge_display",
        note: "D20 et REM_08 couvrent le même sujet. Fusionner en une alerte unique."
    },

    // ========================================================================
    // GROUPE 15 : FER ORAL — Déprescription
    // ========================================================================
    {
        group_id: "GRP_FER",
        theme: "Fer oral — Indication et durée",
        merged_sources: ["STOPPFRAIL", "REMEDIES"],
        rule_ids: ["EV_SF07", "SUP_REM_01"],
        pim_dict_keys: [],
        fusion_strategy: "merge_display",
        note: "SF07 et REM_01 convergent. Fusionner : 'Fer oral sans carence documentée ou > 3 mois sans vérification'."
    },

    // ========================================================================
    // GROUPE 16 : OPIOÏDES — Toutes situations
    // ========================================================================
    {
        group_id: "GRP_OPIOID",
        theme: "Opioïdes chez le sujet âgé",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "FORTA", "EU7PIM"],
        rule_ids: ["EV_L01", "EV_L02", "EV_H09", "EV_K07"],
        pim_dict_keys: ["tramadol", "codeine", "morphine", "oxycodone", "fentanyl", "buprenorphine", "pethidine"],
        fusion_strategy: "distinct_context",
        note: "L1=1ère intention douleur légère, L2=sans laxatif, H9=arthrose, K7=chutes. FORTA différencie les molécules (péthidine=D, morphine/oxycodone/buprénorphine=A)."
    },

    // ========================================================================
    // GROUPE 17 : ANTISPASMODIQUES GI
    // ========================================================================
    {
        group_id: "GRP_ANTISPAS_GI",
        theme: "Antispasmodiques GI au long cours",
        merged_sources: ["REMEDIES", "EU7PIM", "PRISCUS"],
        rule_ids: ["SUP_REM_05", "SUP_EU7_04"],
        pim_dict_keys: ["mebeverine"],
        fusion_strategy: "merge_display",
        note: "Fusionner REM_05 et EU7_04 : 'Antispasmodiques GI au long cours — efficacité non prouvée en continu'."
    },

    // ========================================================================
    // GROUPE 18 : MÉTOCLOPRAMIDE / ANTIÉMÉTIQUES PROKINÉTIQUES
    // ========================================================================
    {
        group_id: "GRP_PROCINET",
        theme: "Métoclopramide et prokinétiques",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "EU7PIM", "FORTA", "PIM_CHECK"],
        rule_ids: ["EV_F01", "EV_BEERS_04"],
        pim_dict_keys: ["metoclopramide", "domperidone", "metopimazine"],
        fusion_strategy: "merge_display",
        note: "F01 (Parkinson) et BEERS_04 (long cours) se complètent. PIM_DICT donne la granularité : domperidone=PIM-B conditionnel (dose/durée)."
    },

    // ========================================================================
    // GROUPE 19 : IC FE RÉDUITE — Piliers thérapeutiques (START)
    // ========================================================================
    {
        group_id: "GRP_IC_START",
        theme: "Omissions thérapeutiques dans l'IC FE réduite",
        merged_sources: ["STOPP3", "FORTA"],
        rule_ids: ["IN_B05", "IN_B06", "IN_B07", "IN_B08", "IN_B09", "IN_B11"],
        pim_dict_keys: ["spironolactone", "empagliflozin", "dapagliflozin"],
        fusion_strategy: "merge_display",
        note: "Les 4 piliers IC (IEC/ARA2/ARNI, BB, ARM, iSGLT2) + fer IV. STOPP3 et FORTA convergent totalement. Afficher comme un seul bloc 'piliers pronostiques'."
    },

    // ========================================================================
    // GROUPE 20 : ANTIDIABÉTIQUES FRAGILE (STOPPFrail / REMEDIES)
    // ========================================================================
    {
        group_id: "GRP_DT2_FRAGILE",
        theme: "Antidiabétiques — Cibles assouplies chez le fragile",
        merged_sources: ["STOPPFRAIL", "BEERS", "PRISCUS", "FORTA"],
        rule_ids: ["EV_SF03", "EV_J01", "EV_J03"],
        pim_dict_keys: ["glibenclamide", "glimepiride", "gliclazide", "pioglitazone", "acarbose", "repaglinide"],
        fusion_strategy: "distinct_context",
        note: "SF03=HbA1c<8% fragile, J01=sulfamide longue demi-vie, J03=BB non sélectif+hypo. Complémentaires."
    },

    // ========================================================================
    // GROUPE 21 : DIURÉTIQUES — Surveillance et indication
    // ========================================================================
    {
        group_id: "GRP_DIURET",
        theme: "Diurétiques — Indication, surveillance, risques ioniques",
        merged_sources: ["STOPP3", "BEERS", "PIM_CHECK"],
        rule_ids: ["EV_B07", "EV_B08", "EV_B09", "EV_B09b", "EV_B10", "SUP_PIMC_02"],
        pim_dict_keys: ["furosemide"],
        fusion_strategy: "distinct_context",
        note: "B7=1ère intention HTA, B8=œdèmes sans IC, B9/9b=dyskaliémie/Na, B10=incontinence, PIMC_02=iono surveillance. Chaque contexte reste distinct."
    },

    // ========================================================================
    // GROUPE 22 : MYORELAXANTS
    // ========================================================================
    {
        group_id: "GRP_MYORELAX",
        theme: "Myorelaxants chez le sujet âgé",
        merged_sources: ["BEERS", "PRISCUS", "EU7PIM"],
        rule_ids: ["EV_BEERS_03"],
        pim_dict_keys: ["thiocolchicoside", "methocarbamol", "baclofene", "tizanidine"],
        fusion_strategy: "merge_display",
        note: "PIM universel selon Beers/PRISCUS. PIM_DICT donne la granularité (baclofène=PIM-B conditionnel)."
    },

    // ========================================================================
    // GROUPE 23 : Z-DRUGS (chevauchement avec BZD)
    // ========================================================================
    {
        group_id: "GRP_ZDRUG",
        theme: "Z-drugs (zolpidem, zopiclone)",
        merged_sources: ["STOPP3", "BEERS", "PRISCUS", "EU7PIM", "FORTA", "PIM_CHECK"],
        rule_ids: ["EV_D11", "EV_K04"],
        pim_dict_keys: ["zolpidem", "zopiclone"],
        fusion_strategy: "distinct_context",
        note: "D11=≥2 sem insomnie, K4=chutes. Lié au GRP_BZD_GENERAL mais classe distincte."
    },

    // ========================================================================
    // GROUPE 24 : ISRS — Doses et risques
    // ========================================================================
    {
        group_id: "GRP_ISRS",
        theme: "ISRS — Doses maximales et hyponatrémie",
        merged_sources: ["STOPP3", "PIM_CHECK", "PRISCUS", "FORTA"],
        rule_ids: ["EV_D06", "EV_C12", "EV_PIM_03", "EV_PIM_04"],
        pim_dict_keys: ["citalopram", "escitalopram", "fluoxetine", "paroxetine", "sertraline", "fluvoxamine"],
        fusion_strategy: "distinct_context",
        note: "D6=hypoNa, C12=ISRS+anticoag+hémorragie, PIM03=citalopram>20mg, PIM04=escitalopram>10mg. Complémentaires."
    },

    // ========================================================================
    // GROUPE 25 : ANTIARYTHMIQUES CLASSE I/III
    // ========================================================================
    {
        group_id: "GRP_ANTIARYTHM",
        theme: "Antiarythmiques classe I et III",
        merged_sources: ["STOPP3", "PRISCUS", "EU7PIM", "PIM_CHECK"],
        rule_ids: ["EV_B06", "EV_PIM_01", "EV_PIM_02", "SUP_PIMC_07"],
        pim_dict_keys: ["amiodarone", "dronedarone", "flecainide", "propafenone"],
        fusion_strategy: "distinct_context",
        note: "B6=amiodarone 1ère ligne, PIM01=dronédarone+IC, PIM02=flécaïnide+cardiopathie, PIMC07=ECG surveillance."
    }
];

// ============================================================================
// 🔧 FONCTIONS DE FUSION D'ALERTES
// ============================================================================

/**
 * Enrichit les sources d'une règle avec les sources croisées du groupe.
 * Retourne la règle enrichie (sources + related_rules).
 */
function enrichRuleWithCrossRef(rule) {
    const group = CROSS_REF_GROUPS.find(g => g.rule_ids.includes(rule.id));
    if (!group) return rule;
    
    return {
        ...rule,
        cross_ref_group: group.group_id,
        cross_ref_theme: group.theme,
        all_sources: [...new Set([...rule.sources, ...group.merged_sources])],
        related_rules: group.rule_ids.filter(id => id !== rule.id),
        pim_dict_keys: group.pim_dict_keys || [],
        fusion_strategy: group.fusion_strategy
    };
}

/**
 * Filtre les alertes pour éviter les doublons de même groupe en mode merge_display.
 * Garde uniquement la première règle du groupe et y agrège toutes les infos.
 */
function deduplicateAlerts(alerts) {
    const seen = new Set();
    const result = [];
    
    alerts.forEach(alert => {
        const enriched = enrichRuleWithCrossRef(alert);
        
        if (enriched.fusion_strategy === "merge_display" && enriched.cross_ref_group) {
            if (seen.has(enriched.cross_ref_group)) return; // déjà affiché
            seen.add(enriched.cross_ref_group);
            
            // Trouver toutes les alertes du même groupe pour enrichir le message
            const groupAlerts = alerts.filter(a => {
                const e = enrichRuleWithCrossRef(a);
                return e.cross_ref_group === enriched.cross_ref_group;
            });
            
            // Fusionner les messages
            const allSources = [...new Set(groupAlerts.flatMap(a => enrichRuleWithCrossRef(a).all_sources || a.sources))];
            const allMessages = groupAlerts.map(a => a.message);
            const allAlternatives = [...new Set(groupAlerts.map(a => a.alternatives).filter(Boolean))];
            
            result.push({
                ...enriched,
                sources: allSources,
                sources_label: allSources.map(s => GERIA_RECOS_DB.SOURCES[s] ? GERIA_RECOS_DB.SOURCES[s].nom : s).join(' | '),
                message: allMessages[0], // message principal
                complementary_messages: allMessages.slice(1),
                alternatives: allAlternatives.join(' — '),
                merged: true,
                merged_count: groupAlerts.length
            });
        } else {
            // Mode distinct_context : enrichir les sources mais garder séparé
            result.push({
                ...enriched,
                sources: enriched.all_sources || enriched.sources,
                sources_label: (enriched.all_sources || enriched.sources)
                    .map(s => GERIA_RECOS_DB.SOURCES[s] ? GERIA_RECOS_DB.SOURCES[s].nom : s).join(' | ')
            });
        }
    });
    
    return result;
}

/**
 * Génère le rendu HTML enrichi avec badges PIM_DICT pour les alertes EVITER.
 */
function renderAlertesEviterEnriched(alertes) {
    const deduped = deduplicateAlerts(alertes);
    
    if (!deduped || deduped.length === 0) {
        return '<div class="alert alert-light">Aucune prescription inappropriée détectée.</div>';
    }
    
    return deduped.map(a => {
        const cls = a.severite === 'danger' ? 'danger alert-stopp' : 'warning';
        const icon = a.severite === 'danger' ? '🛑' : '⚠️';
        const mergeNote = a.merged ? `<small class="text-muted">(${a.merged_count} critères convergents fusionnés)</small>` : '';
        
        // Badges PIM par molécule (via PIM_DICT)
        let pimBadgesHtml = '';
        if (a.pim_dict_keys && a.pim_dict_keys.length > 0 && typeof renderPimBadges === 'function') {
            // Rechercher quels meds du patient sont dans le groupe
            const matchedDcis = a.pim_dict_keys.filter(k => {
                if (typeof activeMeds !== 'undefined') {
                    return activeMeds.some(m => m.dci && m.dci.toLowerCase().includes(k));
                }
                return false;
            });
            pimBadgesHtml = matchedDcis.map(d => renderPimBadges(d)).join('');
        }
        
        return `<div class="alert alert-${cls} shadow-sm">
            <strong>${icon} ${a.titre}</strong>
            <span class="badge bg-secondary float-end" style="font-size:0.7em;">${a.sources_label}</span>
            ${mergeNote}
            <br>${a.message}
            ${a.complementary_messages && a.complementary_messages.length > 0 ? 
                `<div class="mt-1 small text-muted">${a.complementary_messages.map(m => `• ${m}`).join('<br>')}</div>` : ''}
            ${pimBadgesHtml}
            ${a.alternatives ? `<br><em class="text-success small">💡 ${a.alternatives}</em>` : ''}
        </div>`;
    }).join('');
}

// ============================================================================
// 📊 STATISTIQUES DE COUVERTURE
// ============================================================================
const CROSS_REF_STATS = {
    total_groups: CROSS_REF_GROUPS.length,
    total_rules_grouped: [...new Set(CROSS_REF_GROUPS.flatMap(g => g.rule_ids))].length,
    total_pim_dict_linked: [...new Set(CROSS_REF_GROUPS.flatMap(g => g.pim_dict_keys))].length,
    merge_display_groups: CROSS_REF_GROUPS.filter(g => g.fusion_strategy === "merge_display").length,
    distinct_context_groups: CROSS_REF_GROUPS.filter(g => g.fusion_strategy === "distinct_context").length,
    sources_covered: [...new Set(CROSS_REF_GROUPS.flatMap(g => g.merged_sources))]
};
