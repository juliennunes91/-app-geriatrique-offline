// ═══════════════════════════════════════════════════════════════════════════════
// 📋 PATHOLOGY_RULES_DB — Module de Règles Pharmaco-Biologiques par Pathologie
// ═══════════════════════════════════════════════════════════════════════════════
// Version : 3.0 — Mars 2026 (Fusionné + Sourcé)
// Auteur  : Module IA — Interniste / Multi-spécialiste EBM
// But     : Intégration logiciel d'aide à la décision pharmaco-médicale
// Codage  : Compatible MASTER_DB (BIO_xxx, PAT_xxx, SYND_xxx)
// ═══════════════════════════════════════════════════════════════════════════════
//
// CONVENTION DE SOURÇAGE :
//   Chaque recommandation porte un champ "source" au format court :
//     "[GUIDELINE_KEY] [Section/Rec], [Class/Grade]"
//   La table GUIDELINE_INDEX ci-dessous fournit la référence complète.
//
// ═══════════════════════════════════════════════════════════════════════════════

const GUIDELINE_INDEX = {
    "ESC_HF_2021":      { ref: "McDonagh TA et al. Eur Heart J 2022;43:4368. ESC Guidelines for acute and chronic HF 2021" },
    "ESC_HF_2023":      { ref: "McDonagh TA et al. Eur Heart J 2023;44:3627. 2023 Focused Update HF" },
    "ACC_HF_2022":      { ref: "Heidenreich PA et al. Circulation 2022;145:e895. AHA/ACC/HFSA Guideline for HF Management" },
    "ACC_HFrEF_2024":   { ref: "Maddox TM et al. JACC 2024;83:1444. ACC ECDP for HFrEF 2024" },
    "ESC_AF_2024":      { ref: "Van Gelder IC et al. Eur Heart J 2024;45:3314. ESC Guidelines for AF 2024" },
    "ESC_PAD_2024":     { ref: "Mazzolai L et al. Eur Heart J 2024;45:3538. ESC Guidelines for PAD/Aortic diseases 2024" },
    "ESC_HTN_2024":     { ref: "ESC/ESH Guidelines for HTN 2024 (update 2018: Williams B et al. Eur Heart J 2018;39:3021)" },
    "ESC_DYSLIP_2019":  { ref: "Mach F et al. Eur Heart J 2020;41:111. ESC/EAS Dyslipidaemia Guidelines 2019 (update 2024 pending)" },
    "ESC_CCS_2019":     { ref: "Knuuti J et al. Eur Heart J 2020;41:407. ESC Guidelines for CCS 2019" },
    "ESC_SYNCOPE_2018": { ref: "Brignole M et al. Eur Heart J 2018;39:1883. ESC Guidelines for Syncope 2018" },
    "ADA_2025":         { ref: "ADA Standards of Care in Diabetes 2025. Diabetes Care 2025;48(Suppl 1)" },
    "ADA_2026":         { ref: "ADA Standards of Care in Diabetes 2026. Diabetes Care 2026;49(Suppl 1)" },
    "KDIGO_CKD_2024":   { ref: "KDIGO 2024 CKD Guideline. Kidney Int 2024;105(4S)" },
    "GOLD_2024":        { ref: "GOLD 2024. Global Strategy for Prevention, Diagnosis and Management of COPD 2024" },
    "GINA_2024":        { ref: "GINA 2024. Global Strategy for Asthma Management and Prevention 2024" },
    "EULAR_GOUT_2023":  { ref: "Richette P et al. Ann Rheum Dis 2023. EULAR Updated Gout Recommendations" },
    "ACR_GOUT_2020":    { ref: "FitzGerald JD et al. Arthritis Care Res 2020;72:744. ACR Gout Guideline 2020" },
    "IOF_OSTEO_2024":   { ref: "IOF/ESCEO 2024. European Guidance for Osteoporosis Management" },
    "ILAE_2024":        { ref: "ILAE Treatment Guidelines 2024 (Updated from Epilepsia 2018;59:1442)" },
    "MDS_EBM_2025":     { ref: "Bie RM et al. Mov Disord 2025. MDS EBM Review: Motor Fluctuations" },
    "DGN_PD_2024":      { ref: "Höglinger GU et al. Neurol Res Pract 2024;6:30. German PD Guidelines 2024" },
    "EAN_MDS_2022":     { ref: "Deuschl G et al. Mov Disord 2022;37:1049. EAN/MDS-ES Guideline Invasive Therapies PD" },
    "EAN_DEMENTIA_2023": { ref: "EAN Guidelines on Cognitive Disorders 2023 (Update)" },
    "MCKeith_DLB_2023": { ref: "McKeith IG et al. Neurology 2023. DLB Consortium 4th Report" },
    "ETA_THYROID_2023": { ref: "ETA 2023. European Thyroid Association Guidelines" },
    "ATA_THYROID_2024": { ref: "ATA Guidelines for Thyroid Disease Management (Updated 2024)" },
    "STOPP_START_V3":   { ref: "O'Mahony D et al. Age Ageing 2023;52:afad192. STOPP/START criteria v3" },
    "BEERS_2023":       { ref: "AGS 2023 Beers Criteria. J Am Geriatr Soc 2023;71:2052" },
    "SPILF_IU_2024":    { ref: "SPILF 2024. Recommandations Infections Urinaires Communautaires" },
    "ESGE_2024":        { ref: "ESGE 2024. European Society of Gastrointestinal Endoscopy Guidelines" },
    "SFAP_2024":        { ref: "SFAP 2024. Recommandations de Soins Palliatifs" },
    "EAPC_2023":        { ref: "EAPC 2023. European Association for Palliative Care White Paper" },
    "ESC_CARDIO_ONCO":  { ref: "Lyon AR et al. Eur Heart J 2022;43:4229. ESC Cardio-Oncology Guidelines 2022" },
    "ESMO_2024":        { ref: "ESMO Clinical Practice Guidelines 2024" },
    "HAS_FR":           { ref: "Haute Autorité de Santé (France) — Recommandations en vigueur" },
    "COMPASS":          { ref: "Eikelboom JW et al. N Engl J Med 2017;377:1319. COMPASS Trial" },
    "VOYAGER_PAD":      { ref: "Bonaca MP et al. N Engl J Med 2020;382:1994. VOYAGER PAD Trial" },
    "PARADIGM_HF":      { ref: "McMurray JJV et al. N Engl J Med 2014;371:993. PARADIGM-HF" },
    "DAPA_HF":          { ref: "McMurray JJV et al. N Engl J Med 2019;381:1995. DAPA-HF" },
    "EMPEROR_REDUCED":  { ref: "Packer M et al. N Engl J Med 2020;383:1413. EMPEROR-Reduced" },
    "EMPEROR_PRESERVED":{ ref: "Anker SD et al. N Engl J Med 2021;385:1451. EMPEROR-Preserved" },
    "DELIVER":          { ref: "Solomon SD et al. N Engl J Med 2022;387:1089. DELIVER" },
    "STRONG_HF":        { ref: "Mebazaa A et al. Lancet 2022;400:1938. STRONG-HF" },
    "FIDELIO_DKD":      { ref: "Bakris GL et al. N Engl J Med 2020;383:2219. FIDELIO-DKD" },
    "FIGARO_DKD":       { ref: "Pitt B et al. N Engl J Med 2021;385:2252. FIGARO-DKD" },
    "FLOW":             { ref: "Perkovic V et al. N Engl J Med 2024;391:109. FLOW (Semaglutide in CKD)" },
    "CHANCE":           { ref: "Wang Y et al. N Engl J Med 2013;369:11. CHANCE Trial" },
    "POINT":            { ref: "Johnston SC et al. N Engl J Med 2018;379:215. POINT Trial" },
    "SPARCL":           { ref: "Amarenco P et al. N Engl J Med 2006;355:549. SPARCL" },
    "SPRINT":           { ref: "SPRINT Research Group. N Engl J Med 2015;373:2103. SPRINT" },
    "TRUST":            { ref: "Stott DJ et al. N Engl J Med 2017;376:2534. TRUST Trial" },
    "STEP_HFpEF":       { ref: "Kosiborod MN et al. N Engl J Med 2023;389:1069. STEP-HFpEF" },
    "FRAIL_AF":         { ref: "Joosten LPT et al. Circulation 2024;149:1011. FRAIL-AF" },
    "PATHWAY_2":        { ref: "Williams B et al. Lancet 2015;386:2059. PATHWAY-2" },
    "DIAMOND":          { ref: "Butler J et al. N Engl J Med 2024;390:1455. DIAMOND (Patiromer in HFrEF)" },
    "CLEAR_OUTCOMES":   { ref: "Nissen SE et al. N Engl J Med 2023;388:1353. CLEAR Outcomes (Bempedoic Acid)" },
    "IMPACT":           { ref: "Rabe KF et al. N Engl J Med 2020;383:35. IMPACT (Triple therapy COPD)" },
    "ETHOS":            { ref: "Rabe KF et al. N Engl J Med 2020;383:35. ETHOS (Triple therapy COPD)" }
};


/**
 * EV_DEPRESCRIPTION — Tableau de référence des seuils d'espérance de vie (EV) et de
 * fragilité au-delà desquels une classe thérapeutique doit être déprescrite ou ne plus
 * être initiée chez le sujet âgé (STOPPFrail v2 / Curtin 2021 / Lavan 2017 / SFAP 2024 /
 * EAPC 2023). Exploitable par le moteur (helper `shouldDeprescribe(medClass, ctx)`)
 * pour pondérer les règles START et générer des suggestions de déprescription.
 *
 * Convention :
 *   - ev_min_mois : EV minimale au-dessous de laquelle la classe n'a plus de bénéfice
 *   - cfs_max     : Clinical Frailty Scale au-delà de laquelle la classe est à déprescrire
 *   - mmse_min    : MMSE en deçà duquel la classe est à déprescrire (démence)
 *   - condition   : sous-conditions cliniques (prévention 1° vs 2°, etc.)
 */
const EV_DEPRESCRIPTION = {
    "STATINE_PREVENTION_PRIMAIRE": {
        classes: ["statine"],
        ev_min_mois: null,           // pas de bénéfice démontré en 1° au-delà de 75 ans fragile
        cfs_max: 6,                  // CFS ≥ 7 → déprescrire
        condition: "Prévention primaire — pas d'ATCD CV documenté",
        ref: "STOPPFrail v2 SF01 ; STAREE 2024 ; SCORE2-OP",
        action: "Déprescription si EV < 1 an ou CFS ≥ 7 ou ≥ 85 ans sans ATCD CV"
    },
    "STATINE_PREVENTION_SECONDAIRE": {
        classes: ["statine"],
        ev_min_mois: 12,             // bénéfice CV à ≥ 12 mois
        cfs_max: 7,
        condition: "Prévention secondaire (post-IDM, AVC, AOMI documentés)",
        ref: "STOPPFrail v2 ; ESC 2024 Dyslipidaemia",
        action: "Déprescription si EV < 12 mois ou CFS ≥ 8 (fin de vie)"
    },
    "ANTIAGREGANT_PREVENTION_PRIMAIRE": {
        classes: ["aspirine", "clopidogrel"],
        ev_min_mois: null,
        cfs_max: 5,
        condition: "Prévention primaire — pas d'ATCD CV/cérébrovasculaire/AOMI",
        ref: "ASPREE 2018 NEJM ; ESC 2021 CV Prevention",
        action: "Déprescription quasi systématique si > 70 ans en prévention 1° (rapport bénéfice/saignement défavorable)"
    },
    "BISPHOSPHONATE": {
        classes: ["bisphosphonate", "alendronate", "risedronate", "acide zoledronique", "denosumab"],
        ev_min_mois: 12,             // bénéfice fracturaire à 12-24 mois
        cfs_max: 7,
        condition: "Prévention fracturaire post-DMO (T-score ≤ -2.5 ou fracture sévère)",
        ref: "STOPPFrail v2 SF04 ; ASBMR 2022",
        action: "Déprescription si EV < 12-24 mois. Attention : dénosumab nécessite un relais bisphosphonate à l'arrêt (rebond fracturaire)"
    },
    "ANTIDIABETIQUE_INTENSIF": {
        classes: ["sulfamide", "glinide", "insuline rapide", "insuline mix"],
        ev_min_mois: null,
        cfs_max: 7,
        hba1c_max: 7.0,              // si déjà à cible basse → sur-traitement
        condition: "Sur-traitement si HbA1c < 7 % chez complexe ou < 7.5 % chez très fragile",
        ref: "STOPPFrail v2 SF03 ; ADA 2025 §13.5 ; EASD 2022",
        action: "Déprescription sulfamide en priorité, simplification schéma insuline, cible HbA1c assouplie 7-8 % (complexe) ou 7.5-8.5 % (très fragile)"
    },
    "IACHE_MEMANTINE": {
        classes: ["donepezil", "rivastigmine", "galantamine", "memantine"],
        ev_min_mois: 6,
        mmse_min: 10,                // déprescrire si MMSE < 10 (démence sévère)
        cfs_max: 7,
        condition: "Démence : déprescription progressive si pas de bénéfice ou stade très avancé",
        ref: "STOPPFrail v2 SF06 ; HAS 2018",
        action: "Arrêt progressif sur 4-6 sem, surveillance comportementale ; reprise possible si décompensation"
    },
    "IPP_LONG_COURS": {
        classes: ["ipp", "omeprazole", "esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole"],
        ev_min_mois: null,
        cfs_max: 7,
        condition: "Pas d'indication active (RGO sévère, ulcère récent, Barrett, double antiagrégation/anticoagulation)",
        ref: "STOPPFrail v2 SF05 ; REMEDIES",
        action: "Déprescription progressive (demi-dose 2-4 sem puis arrêt)"
    },
    "ANTIHYPERTENSEUR_TRES_FRAGILE": {
        classes: ["iec", "ara2", "diuretique", "betabloquant", "inhibiteur calcique", "alpha-bloquant"],
        ev_min_mois: null,
        cfs_max: 7,
        pas_max: 120,                // déprescription si PAS < 120 chez fragile
        condition: "Très fragile (CFS ≥ 7) ET PAS < 120 OU hypotension orthostatique symptomatique",
        ref: "STOPPFrail v2 SF02 ; ESC 2024 HTN §6.5",
        action: "Réduction de dose ou arrêt de l'antihypertenseur le plus iatrogène (alpha-bloquant > diurétique > IEC/ARA2 > BB > IC). Cible PAS 140-150 chez ≥ 80 fragile"
    },
    "ANTICOAGULANT_FA_TRES_FRAGILE": {
        classes: ["aod", "apixaban", "rivaroxaban", "edoxaban", "dabigatran", "avk", "warfarine", "fluindione"],
        ev_min_mois: 6,
        cfs_max: 8,
        condition: "FA + très fragile + risque hémorragique majeur (HAS-BLED ≥ 4 + chutes répétées + démence sévère)",
        ref: "FRAIL-AF 2023 NEJM ; ESC 2024 AF §5",
        action: "Discussion individualisée : maintenir AOD à dose réduite si possible. Arrêt si EV < 6 mois ou hémorragie majeure récidivante. AVK déconseillés (FRAIL-AF)"
    }
};


const PATHOLOGY_RULES_DB = {

    // PAT_001 (IC Globale générique) supprimée — chevauchait PAT_002/PAT_003.
    // Le phénotype d'IC doit être précisé (FEVG réduite vs préservée).


    "PAT_002": {
        ID: "PAT_002",
        NOM: "Insuffisance Cardiaque FE Réduite (HFrEF)",
        REFERENCE: "ESC 2021 + 2023 Update | ACC ECDP 2024 | PARADIGM-HF | DAPA-HF | EMPEROR-Reduced",
        SOURCES_EBM: {
                  "INITIER": {
                            "Quadrithérapie": "ESC_HF_2021 Rec Table 1, IA + STRONG-HF",
                            "Vericiguat": "ESC_HF_2021 §5.4.3, IIbB + VICTORIA",
                            "Ivabradine": "ESC_HF_2021 §5.4.2, IIaB + SHIFT",
                            "Hydralazine": "ESC_HF_2021 §5.4.4, IIaB + A-HeFT",
                            "Fer IV": "ESC_HF_2023 Rec Table 5, IA/IIaA"
                  },
                  "EVITER": {
                            "AINS": "ESC_HF_2021 §5.12 + STOPP H2",
                            "Diltiazem": "STOPP H4",
                            "Dronedarone": "ANDROMEDA",
                            "Moxonidine": "MOXCON"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Quadrithérapie fondamentale (4 piliers)",
                    composants: [
                        { rang: 1, classe: "IEC/ARA2 ou ARNI (Sacubitril-Valsartan)", niveau: "IA", note: "ARNI préféré si toléré (PARADIGM-HF). Switch IEC→ARNI après 36h de washout." },
                        { rang: 2, classe: "Bêtabloquant (Bisoprolol, Carvédilol, Nébivolol, Métoprolol succinate)", niveau: "IA", note: "Initier à faible dose, titrer toutes les 2 semaines. CI si FC < 50 ou BAV 2-3." },
                        { rang: 3, classe: "ARM (Spironolactone ou Éplérénone)", niveau: "IA", note: "Si K+ < 5.0 et DFG > 30. Éplérénone si gynécomastie sous spironolactone." },
                        { rang: 4, classe: "iSGLT2 (Dapagliflozine ou Empagliflozine)", niveau: "IA", note: "Bénéfice indépendant du diabète. Peut être initié en premier. Initier si DFG ≥ 20 mL/min et poursuivre même si DFG descend < 20 en cours de traitement (KDIGO 2024 + DAPA-HF/EMPEROR-Reduced ; bénéfice cardio-rénal maintenu). Ne pas initier si DFG < 20." }
                    ],
                    indication: "TOUS les patients HFrEF (FEVG ≤ 40%) symptomatiques (NYHA II-IV)",
                    strategie: "Initiation rapide et simultanée des 4 piliers (STRONG-HF : high-intensity care dans les 2 semaines post-hospitalisation)"
                },
                {
                    classe: "Vericiguat",
                    indication: "Post-décompensation récente malgré quadrithérapie optimale",
                    condition: "NYHA II-IV, FEVG < 45%, BNP élevé, événement IC récent",
                    niveau_preuve: "IIbB",
                    bio_pre_requis: ["BIO_028"]
                },
                {
                    classe: "Ivabradine",
                    indication: "Si FC ≥ 70 bpm en rythme sinusal malgré bêtabloquant à dose maximale tolérée",
                    condition: "Rythme sinusal uniquement",
                    niveau_preuve: "IIaB"
                },
                {
                    classe: "Hydralazine + Dinitrate d'isosorbide",
                    indication: "Si intolérance IEC/ARA2/ARNI (ex : toux, angiœdème, hyperkaliémie)",
                    niveau_preuve: "IIaB"
                },
                {
                    classe: "Fer IV (Carboxymaltose ferrique ou Dérisomaltose ferrique)",
                    indication: "Carence martiale (Ferritine < 100 OU Ferritine 100-299 + CST < 20%)",
                    condition: "Avec ou sans anémie",
                    niveau_preuve: "IA",
                    note: "Réduction hospitalisations IC (méta-analyses). Réévaluer tous les 3-6 mois."
                }
            ],
            EVITER: [
                { classe: "AINS", raison: "CI absolue — rétention hydrosodée, décompensation, néphrotoxicité", gravite: "CONTRE-INDICATION" },
                { classe: "Diltiazem / Vérapamil", raison: "Inotrope négatif → aggravation IC", gravite: "CONTRE-INDICATION" },
                { classe: "Dronedarone", raison: "Surmortalité dans HFrEF (ANDROMEDA)", gravite: "CONTRE-INDICATION" },
                { classe: "Moxonidine", raison: "Surmortalité (MOXCON)", gravite: "CONTRE-INDICATION" },
                { classe: "Thiazolidinediones", raison: "Rétention hydrosodée", gravite: "CONTRE-INDICATION" },
                { classe: "Triple blocage SRAA (IEC + ARA2 + ARM)", raison: "Hyperkaliémie et IRA", gravite: "CONTRE-INDICATION" },
                { classe: "Saxagliptine, Alogliptine", raison: "Signal d'augmentation hospitalisation IC", gravite: "DECONSEILLE" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_028", "BIO_034", "BIO_001", "BIO_002", "BIO_003", "BIO_004", "BIO_009", "BIO_020"],
            REGLES: [
                {
                    bio: "BIO_028",
                    nom: "NT-proBNP",
                    seuils: {
                        objectif: { note: "Réduction > 30% sous traitement = bon pronostic" },
                        alerte: { min: 1000, note: "Considérer intensification traitement" },
                        critique: { min: 5000, note: "Décompensation — hospitalisation probable" }
                    },
                    frequence: "À chaque titration, puis trimestriel si stable"
                },
                {
                    bio: "BIO_020",
                    nom: "Ferritine",
                    seuils: {
                        carence: { max: 100, action: "Fer IV indiqué (Class I)" },
                        carence_relative: { condition: "100-299 + CST < 20%", action: "Fer IV indiqué" }
                    },
                    frequence: "Tous les 3-6 mois",
                    bio_associee: "BIO_009"
                }
            ],
            TITRATION_MONITORING: {
                description: "Stratégie STRONG-HF : réévaluation clinique + biologique rapprochée post-hospitalisation",
                schema: [
                    { timing: "J1-J3 post-sortie", bio: ["BIO_001", "BIO_002", "BIO_003"], action: "Contrôle iono-rénal" },
                    { timing: "J7", bio: ["BIO_001", "BIO_003", "BIO_028"], action: "Première titration si toléré" },
                    { timing: "J14", bio: ["BIO_001", "BIO_003"], action: "Deuxième titration" },
                    { timing: "M1", bio: ["BIO_001", "BIO_002", "BIO_003", "BIO_028"], action: "Bilan complet, 3ème titration" },
                    { timing: "M3", bio: ["BIO_001", "BIO_003", "BIO_028", "BIO_020"], action: "Bilan trimestriel" },
                    { timing: "M6", bio: ["BIO_001", "BIO_003", "BIO_009", "BIO_019", "BIO_020", "BIO_028"], action: "Bilan semestriel complet" }
                ]
            }
        },

        INTERACTIONS_CRITIQUES: [
            {
                combinaison: ["ARNI (Sacubitril-Valsartan)", "IEC"],
                risque: "Angiœdème potentiellement fatal",
                conduite: "JAMAIS en co-prescription. Washout IEC ≥ 36h avant introduction ARNI.",
                gravite: "CONTRE-INDICATION ABSOLUE"
            },
            {
                combinaison: ["IEC ou ARA2 ou ARNI", "ARM", "Triméthoprime"],
                risque: "Hyperkaliémie sévère",
                surveillance: "BIO_001 à J3-J5 si introduction triméthoprime",
                conduite: "Éviter si possible, sinon monitoring K+ rapproché"
            }
        ],

        DECOMPENSATION_BIO: {
            syndrome_principal: "SYND_029",
            triggers: [
                { bio: "BIO_028", condition: "> 1800 pg/mL (>75 ans) ou > 900 (50-75)", action: "Majorer furosémide, bilan complet, avis cardio" },
                { bio: "BIO_034", condition: "Élévation significative troponine hs", action: "Rechercher SCA surajouté, myocardite" },
                { bio: "BIO_001", condition: "> 5.5", action: "Réduire/suspendre ARM" },
                { bio: "BIO_002", condition: "< 130", action: "Restriction hydrique, adapter diurétiques" }
            ]
        }
    },

    "PAT_003": {
        ID: "PAT_003",
        NOM: "Insuffisance Cardiaque FE Préservée (HFpEF)",
        REFERENCE: "ESC 2023 Update | EMPEROR-Preserved | DELIVER | TOPCAT",
        SOURCES_EBM: {
                  "INITIER": {
                            "iSGLT2": "ESC_HF_2023 Rec Table 2, IA + EMPEROR-Preserved + DELIVER",
                            "Diurétique": "ESC_HF_2021 §5.3, IC",
                            "ARM": "ESC_HF_2021 §6.2, IIbB + TOPCAT",
                            "GLP-1": "STEP_HFpEF, IIaB"
                  },
                  "EVITER": {
                            "AINS": "ESC_HF_2021 §5.12 + STOPP_START_V3 H2"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "iSGLT2 (Dapagliflozine, Empagliflozine)",
                    indication: "Recommandé pour réduire les hospitalisations pour IC (Class I, LOE A - ESC 2023)",
                    condition: "DFG ≥ 20 mL/min pour initiation ; poursuivre même si DFG descend < 20 en cours de traitement (KDIGO 2024 — bénéfice cardio-rénal maintenu)",
                    note: "EMPEROR-Preserved + DELIVER : bénéfice confirmé sur tout le spectre FEVG > 40%",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Diurétiques",
                    indication: "Symptomatique — soulagement de la congestion",
                    niveau_preuve: "IC"
                },
                {
                    classe: "ARM (Spironolactone)",
                    indication: "Peut être considéré (TOPCAT : bénéfice en sous-groupe Americas)",
                    niveau_preuve: "IIbB",
                    condition: "Si K+ < 5.0 et DFG > 30"
                },
                {
                    classe: "GLP-1 RA (Sémaglutide)",
                    indication: "En cas d'obésité + HFpEF (STEP-HFpEF : amélioration symptômes et capacité fonctionnelle)",
                    condition: "IMC ≥ 30 + HFpEF",
                    niveau_preuve: "IIaB"
                }
            ],
            EVITER: [
                { classe: "AINS", raison: "Rétention hydrosodée", gravite: "CONTRE-INDICATION" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_028", "BIO_001", "BIO_002", "BIO_003", "BIO_004", "BIO_035"],
            REGLES: [
                {
                    bio: "BIO_028",
                    nom: "NT-proBNP",
                    seuils: {
                        diagnostic: { note: "Seuils identiques à IC globale, mais plus souvent proche des limites" },
                        suivi: { note: "Valeur pronostique moins bien établie que dans HFrEF" }
                    },
                    frequence: "Semestriel si stable"
                },
                {
                    bio: "BIO_035",
                    nom: "Albumine",
                    seuils: {
                        bas: { max: 30, note: "Facteur pronostique péjoratif dans HFpEF" }
                    },
                    frequence: "Semestriel"
                }
            ]
        },

        COMORBIDITES_CLES: [
            { patho: "PAT_005", note: "HTA : traitement agressif recommandé (PAS < 130 si toléré)" },
            { patho: "PAT_006", note: "FA : fréquente dans HFpEF, contrôle rythme/fréquence" },
            { patho: "PAT_016", note: "Diabète : iSGLT2 en première intention" },
            { patho: "PAT_029", note: "MRC : iSGLT2 double bénéfice cardio-rénal" }
        ],

        DECOMPENSATION_BIO: {
            syndrome_principal: "SYND_029",
            triggers: [
                { bio: "BIO_028", condition: "Élévation significative", action: "Optimiser traitement congestif" },
                { bio: "BIO_003", condition: "Hausse > 30%", action: "Adapter diurétiques, rechercher cause" }
            ]
        }
    },

    "PAT_004": {
        ID: "PAT_004",
        NOM: "Syndrome Coronarien Chronique (SCC)",
        REFERENCE: "ESC 2024 CCS Guidelines | ESC 2019 CCS | COMPASS | ISCHEMIA",
        SOURCES_EBM: {
                  "INITIER": {
                            "Antiagrégant": "ESC_CCS_2019 §5.1, IA",
                            "Statine": "ESC_DYSLIP_2019 §6.1, IA",
                            "IEC": "ESC_CCS_2019 §5.3, IA",
                            "Bêtabloquant": "ESC_CCS_2019 §5.2, IA post-IDM",
                            "Rivaroxaban": "COMPASS, IIaB"
                  },
                  "EVITER": {
                            "DAPT": "ESC_CCS_2019 §5.1 — pas au-delà de 12 mois post-stent",
                            "AINS": "ESC_CCS_2019 §5.5 + STOPP_START_V3"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Antiagrégant plaquettaire",
                    dci_exemples: ["Aspirine 75-100 mg/j", "Clopidogrel si intolérance aspirine"],
                    indication: "Tous les patients SCC (Class I)",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Statine haute intensité",
                    dci_exemples: ["Atorvastatine 40-80mg", "Rosuvastatine 20-40mg"],
                    indication: "Cible LDL < 1.4 mmol/L (< 0.55 g/L) ET réduction ≥ 50% du LDL basal",
                    niveau_preuve: "IA",
                    bio_cible: "BIO_027"
                },
                {
                    classe: "IEC ou ARA2",
                    indication: "Si HTA, diabète, IC ou DFG < 60",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Bêtabloquant cardiosélectif",
                    dci_exemples: ["Bisoprolol 1.25-10 mg/j", "Métoprolol succinate 12.5-200 mg/j", "Nébivolol 2.5-10 mg/j"],
                    indication: "Si post-infarctus récent ou angor résiduel ou FEVG ≤ 40%",
                    note: "Bénéfice pronostique post-IDM remis en question chez patients sans dysfonction VG (ABYSS trial). Éviter aténolol (hydrophile, moindre cardiosélectivité — STOPP/START v3). Carvédilol alternatif si HFrEF associée (PAT_002).",
                    niveau_preuve: "IA post-IDM, IIb si pas d'IC"
                },
                {
                    classe: "Rivaroxaban 2.5 mg x2/j + Aspirine (Stratégie COMPASS)",
                    indication: "Considérer si haut risque athéromateux (polyvasculaire, diabète) sans haut risque hémorragique",
                    condition: "HAS-BLED acceptable",
                    note: "⚠️ Stratégie DISTINCTE de l'anticoagulation FA : dose vasculaire 2.5 mg x 2 (COMPASS/VOYAGER-PAD) vs dose anticoagulante 20 mg/j (PAT_006 FA). Ne pas confondre — cf. PAT_006 pour dose FA.",
                    niveau_preuve: "IIaB"
                },
                {
                    classe: "GLP-1 RA (Sémaglutide, Liraglutide, Dulaglutide)",
                    indication: "DT2 associé + coronaropathie stable — réduction MACE (ESC 2024 CCS §5.4 ; ADA 2025 §10.3). Choisir un GLP-1 avec bénéfice CV prouvé (sémaglutide/LEADER, liraglutide/LEADER, dulaglutide/REWIND).",
                    condition: "DT2 concomitant (PAT_016b)",
                    note: "Bénéfice MACE additionnel indépendant de l'HbA1c. Bénéfice pondéral associé. Ne pas cumuler avec DPP-4.",
                    niveau_preuve: "IA"
                }
            ],
            EVITER: [
                { classe: "DAPT > 12 mois post-stent", raison: "Risque hémorragique sans bénéfice prouvé au-delà de 12 mois chez la plupart des patients", gravite: "EVALUATION INDIVIDUELLE" },
                { classe: "AINS au long cours", raison: "Risque thrombotique CV + hémorragique digestif", gravite: "CONTRE-INDICATION RELATIVE" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_027", "BIO_025", "BIO_026", "BIO_003", "BIO_004", "BIO_009", "BIO_018", "BIO_034"],
            REGLES: [
                {
                    bio: "BIO_027",
                    nom: "Bilan Lipidique (LDL-C)",
                    seuils: {
                        cible: { max_mmol: 1.4, max_gL: 0.55, note: "Cible LDL-C < 1.4 mmol/L (0.55 g/L) pour prévention secondaire" },
                        tres_haut_risque: { max_mmol: 1.0, note: "Si événement récidivant dans les 2 ans sous statine max : LDL < 1.0 mmol/L" }
                    },
                    frequence: "6-8 semaines après introduction/modification, puis annuel"
                },
                {
                    bio: "BIO_018",
                    nom: "CPK",
                    seuils: {
                        alerte: { min: 850, note: "Rechercher rhabdomyolyse si statine (surtout + fibrate ou macrolide)" }
                    },
                    frequence: "À l'instauration de la statine, puis si myalgies",
                    syndrome_declenche: "SYND_002"
                }
            ]
        },

        DECOMPENSATION_BIO: {
            syndrome_principal: "SYND_036",
            triggers: [
                { bio: "BIO_034", condition: "Élévation troponine hs", action: "Rechercher SCA, avis cardiologique urgent" },
                { bio: "BIO_027", condition: "LDL > 1.8 mmol/L sous traitement", action: "Intensifier statine ou ajouter Ézétimibe / anti-PCSK9" }
            ]
        }
    },

    "PAT_005": {
        ID: "PAT_005",
        NOM: "Hypertension Artérielle (HTA)",
        REFERENCE: "ESC 2024 HTN | ESC 2018 HTN | SPRINT | STEP",
        SOURCES_EBM: {
                  "INITIER": {
                            "Combinaison": "ESC_HTN_2024 §7.2, IA",
                            "Trithérapie": "ESC_HTN_2024 §7.3, IA",
                            "Spironolactone": "PATHWAY-2, IB"
                  },
                  "EVITER": {
                            "IEC + ARA2": "ONTARGET — Yusuf S et al. NEJM 2008;358:1547",
                            "Alpha-bloquants": "ALLHAT — JAMA 2000;283:1967",
                            "AINS": "ESC_HTN_2024 + STOPP_START_V3 B12"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Combinaison à dose fixe en première intention",
                    composants: ["IEC ou ARA2", "Inhibiteur Calcique (Amlodipine) ou Thiazidique-like (Indapamide)"],
                    indication: "Bithérapie d'emblée recommandée pour la majorité des patients (Class I, LOE A)",
                    exception: "Monothérapie acceptable si HTA grade 1 + faible risque CV, ou sujet très âgé/fragile",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Trithérapie si HTA résistante",
                    composants: ["IEC ou ARA2", "ICa (Amlodipine)", "Thiazidique-like (Indapamide ou Chlorthalidone)"],
                    condition: "TA non contrôlée sous bithérapie à dose optimale",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Spironolactone 25-50 mg",
                    indication: "HTA résistante confirmée (4ème ligne - PATHWAY-2)",
                    condition: "Si K+ < 4.5 et DFG > 45",
                    note: "Seuils d'initiation plus stricts qu'en HFrEF/HFpEF/MRC (K+ < 5.0 / DFG > 30) car l'HTA n'est pas une indication vitale pour un ARM : on cherche ici à maximiser la marge de sécurité. Si le patient a une co-indication (HFrEF, MRC albuminurique), c'est le seuil de l'indication PRIMAIRE qui prévaut (K+ < 5.0 / DFG > 30) et la spironolactone s'intègre dans la quadrithérapie, pas comme 4ème antihypertenseur.",
                    niveau_preuve: "IB"
                }
            ],
            CIBLES: {
                general: { PAS: "120-130 mmHg si toléré", PAD: "70-80 mmHg", note: "Adulte < 75 ans (SPRINT / STEP / ESC 2024)" },
                sujet_age_75_79: { PAS: "130-139 mmHg", PAD: "70-80 mmHg", note: "Cible individualisée — vérifier orthostatisme à chaque consultation (HYVET / SPRINT-Senior / ESC 2024)" },
                sujet_age_80_robuste: { PAS: "130-139 mmHg si bien toléré", PAD: "70-80 mmHg", note: "≥ 80 ans robuste (G8 > 14 ou CFS ≤ 4) — viser 130-139 si pas d'OH ni chute (ESC 2024 §6.5, IIaB)" },
                sujet_age_80_fragile: { PAS: "140-150 mmHg", PAD: "< 90 mmHg", note: "≥ 80 ans fragile (G8 ≤ 10 ou CFS ≥ 5 ou EHPAD) — cible HYVET, ne pas viser < 130 (ESC 2024 §6.5, IIIB)" },
                seuil_deprescription: { PAS_couche: "< 120 mmHg", PAS_debout: "< 110 mmHg ou chute orthostatique > 20 mmHg", note: "Déprescrire l'antihypertenseur le plus récent ou plus iatrogène si symptômes (vertige, chute, syncope) — STOPPFrail v2" },
                diabetique: { PAS: "< 130 mmHg si toléré, sinon 130-139", note: "ADA 2025 §10.1 — éviter PAS < 120 chez âgé fragile" },
                mrc: { PAS: "< 120 mmHg si protéinurie ≥ A2 et tolérance", note: "KDIGO 2024 — assouplir à 130-139 si DFG < 30 ou âge ≥ 80 fragile" }
            },
            EVITER: [
                { classe: "IEC + ARA2 simultanément", raison: "Pas de bénéfice additionnel, risque hyperkaliémie + IRA (ONTARGET)", gravite: "CONTRE-INDICATION" },
                { classe: "AINS au long cours", raison: "Antagonise l'effet antihypertenseur, néphrotoxicité", gravite: "DECONSEILLE" },
                { classe: "Alpha-bloquants en monothérapie", raison: "Pas de réduction mortalité CV (ALLHAT). Risque hypotension orthostatique.", gravite: "DECONSEILLE sauf indication prostatique" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_001", "BIO_002", "BIO_003", "BIO_004", "BIO_025", "BIO_026", "BIO_027"],
            REGLES: [
                {
                    bio: "BIO_001",
                    nom: "Kaliémie",
                    frequence: "Avant traitement, J7-J14 après introduction IEC/ARA2/thiazidique, puis trimestriel x2, puis semestriel",
                    syndromes: ["SYND_010", "SYND_011"]
                },
                {
                    bio: "BIO_003",
                    nom: "Créatinine / DFG",
                    frequence: "Avant traitement, J14 après IEC/ARA2, puis semestriel",
                    seuils: {
                        hausse_acceptable: { delta_pct: 20, note: "Hausse ≤ 20% tolérable après IEC/ARA2" },
                        hausse_alerte: { delta_pct: 30, note: "Hausse > 30% → rechercher sténose artère rénale" }
                    }
                }
            ]
        },

        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_001", condition: "K+ > 5.5 sous IEC/ARA2 isolé", action: "Vérifier observance, régime, suspendre supplémentation K+ et/ou diurétique épargneur, contrôler à 48-72h. Réduire dose IEC/ARA2 si K+ > 5.5 confirmé. Arrêter si K+ > 6.0 ou ECG. (KDIGO 2024 Module Hyperkalemia §3)" },
                { bio: "BIO_001", condition: "K+ > 5.5 sous spironolactone/éplérénone (ARM stéroïdien)", action: "ARM stéroïdien moins tolérant : réduire de moitié si K+ 5.5-6.0, ARRÊTER si K+ > 6.0 ou symptomatique. Surveillance K+/créat à J7. (RALES, EMPHASIS-HF, ESC 2023 HF §5.4)" },
                { bio: "BIO_001", condition: "K+ > 5.5 sous finerenone (ARM non stéroïdien)", action: "Finerenone tolère mieux : poursuivre si K+ 4.8-5.5 (contrôle 4 sem), suspendre si K+ > 5.5 jusqu'à K+ ≤ 5.0, reprendre à demi-dose. ARRÊT définitif si K+ > 6.0 récidivant. (FIDELIO-DKD/FIGARO-DKD ; KDIGO 2024)" },
                { bio: "BIO_001", condition: "K+ > 6.0 quel que soit le RAASi", action: "URGENCE : ECG (ondes T pointues, QRS larges), gluconate Ca IV si signes ECG, insuline-glucose, salbutamol nébulisé, résine échangeuse (patiromer, SZC) ou hémodialyse. Arrêt RAASi. (KDIGO 2024 §3.4)" },
                { bio: "BIO_002", condition: "Na+ < 130 sous thiazidique", action: "Réduire ou arrêter thiazidique, rechercher SIADH/déplétion, ne pas corriger > 8 mmol/L/24h (risque myélinolyse pontine)", syndrome: "SYND_009" },
                { bio: "BIO_004", condition: "Chute DFGe > 25% en < 3 mois", action: "Rechercher sténose artère rénale, NTA iatrogène (AINS, produit de contraste), adapter posologie ; tolérer hausse créat ≤ 30% post-IEC/ARA2 sans arrêt (RAASi-IRA débat)" }
            ]
        }
    },

    "PAT_006": {
        ID: "PAT_006",
        NOM: "Fibrillation Atriale (FA)",
        REFERENCE: "ESC 2024 AF-CARE | FRAIL-AF | RE-LY | ARISTOTLE | ROCKET-AF | ENGAGE-AF",
        SOURCES_EBM: {
                  "INITIER": {
                            "DOAC": "ESC_AF_2024 §5.2, IA",
                            "Amiodarone": "ESC_AF_2024 §6.2, IA"
                  },
                  "EVITER": {
                            "Dronedarone": "ANDROMEDA + PALLAS",
                            "AOD+Antiagrégant": "ESC_AF_2024 §5.3, IIIB"
                  }
        },

        TRAITEMENTS: {
            ANTICOAGULATION: {
                indication: "Tous les patients FA avec CHA₂DS₂-VA ≥ 2 (≥ 1 acceptable selon profil — discussion bénéfice/risque individualisée). ESC 2024 AF-CARE supprime le critère sexe (le S de CHA₂DS₂-VASc disparaît, devient CHA₂DS₂-VA), seuil unifié homme/femme. CHA₂DS₂-VA = IC, HTA, Âge ≥ 75 (2 pts), Diabète, AVC/AIT/TE (2 pts), Maladie Vasculaire, Âge 65-74.",
                premiere_ligne: {
                    classe: "AOD (DOAC)",
                    dci_exemples: ["Apixaban", "Dabigatran", "Edoxaban", "Rivaroxaban"],
                    note: "Préférés aux AVK sauf valve mécanique ou sténose mitrale modérée-sévère (Class I, LOE A)",
                    regle_dose: "NE PAS réduire la dose sans critères spécifiques au DOAC (sous-dosage = AVC évitable)"
                },
                regles_specifiques_doac: [
                    {
                        dci: "Apixaban",
                        dose_pleine: "5 mg x2/j",
                        dose_reduite: "2.5 mg x2/j si ≥ 2 critères : âge ≥ 80, poids ≤ 60kg, créatinine ≥ 133 µmol/L",
                        ci_dfg: "< 15 mL/min (attention AMM européenne : prudence 15-25)"
                    },
                    {
                        dci: "Rivaroxaban",
                        dose_pleine: "20 mg/j au repas",
                        dose_reduite: "15 mg/j si DFG 15-49 mL/min",
                        ci_dfg: "< 15 mL/min"
                    },
                    {
                        dci: "Dabigatran",
                        dose_pleine: "150 mg x2/j",
                        dose_reduite: "110 mg x2/j si ≥ 80 ans OU prise de vérapamil OU risque hémorragique élevé",
                        ci_dfg: "< 30 mL/min"
                    },
                    {
                        dci: "Edoxaban",
                        dose_pleine: "60 mg/j",
                        dose_reduite: "30 mg/j si DFG 15-50 OU poids ≤ 60kg OU inhibiteur P-gp",
                        ci_dfg: "< 15 mL/min",
                        note: "Éviter si DFG > 95 (efficacité réduite)"
                    }
                ],
                avk: {
                    indication: "Valve mécanique, sténose mitrale modérée-sévère, OU patient > 75 ans bien équilibré sous AVK et TTR > 70% (FRAIL-AF — ESC 2024)",
                    cible_inr: "2.0-3.0 (sauf valve mécanique : 2.5-3.5)",
                    bio_suivi: "BIO_030"
                },
                regles_esc_2024: [
                    "Ne PAS combiner anticoagulant + antiagrégant pour la prévention AVC seul (sauf SCA/stent récent < 12 mois)",
                    "Ne PAS switcher entre DOAC sans raison claire",
                    "Anticoagulation recommandée même si FA paroxystique",
                    "Anticoagulation 4 semaines post-cardioversion même si CHA₂DS₂-VA = 0",
                    "CMH + FA : anticoagulation systématique quel que soit le score"
                ]
            },
            CONTROLE_FREQUENCE: {
                premiere_ligne: ["Bêtabloquant cardiosélectif (Bisoprolol, Métoprolol succinate, Nébivolol)", "Diltiazem", "Vérapamil (si FEVG > 40%)", "Digoxine"],
                cible_fc: "< 110 bpm au repos (stratégie lenient - RACE II)",
                cible_fc_strict: "< 80 bpm si symptômes persistants",
                notes: [
                    "BB cardiosélectifs de référence en FA + sujet âgé : bisoprolol, métoprolol succinate, nébivolol. Carvédilol accepté si HFrEF associée. Éviter aténolol (hydrophile, moindre efficacité — STOPP/START v3). Sotalol réservé au contrôle du rythme avec surveillance QTc.",
                    "Diltiazem/Vérapamil CI si FEVG ≤ 40%",
                    "Digoxine : dose faible (digoxinémie cible 0.5-0.9 ng/mL chez ≥ 70 ans — DIG trial Rathore 2003), prudence chez le sujet âgé",
                    "Association bêtabloquant + diltiazem : risque bradycardie sévère"
                ]
            },
            CONTROLE_RYTHME: {
                antiarythmiques: [
                    { dci: "Amiodarone", indication: "Maintien du rythme sinusal, tous les patients y compris IC", note: "Toxicité thyroïdienne, pulmonaire, hépatique. Suivi TSH/BH/Rx thorax semestriel.", bio: ["BIO_019", "BIO_013", "BIO_014", "BIO_031"] },
                    { dci: "Flécaïnide", indication: "Si pas de cardiopathie structurelle", ci: "IC, cardiopathie ischémique, HVG significative" },
                    { dci: "Sotalol", indication: "Alternative si pas d'IC sévère", note: "Surveillance QTc obligatoire", bio: ["BIO_031", "BIO_001"] }
                ]
            },
            EVITER: [
                { classe: "Dronedarone", condition: "IC avec FEVG ≤ 40% ou FA permanente", raison: "Surmortalité (ANDROMEDA, PALLAS)", gravite: "CONTRE-INDICATION" },
                { classe: "AOD + Antiagrégant", condition: "Sauf si SCA/stent récent (< 12 mois)", raison: "Risque hémorragique accru sans bénéfice (ESC 2024)", gravite: "DECONSEILLE" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_031", "BIO_030", "BIO_019", "BIO_001", "BIO_003", "BIO_004", "BIO_009", "BIO_013", "BIO_014", "BIO_044"],
            REGLES: [
                {
                    bio: "BIO_031",
                    nom: "QTc",
                    seuils: {
                        alerte: { min_h: 450, min_f: 460, note: "Réévaluer médicaments allongeant le QT" },
                        critique: { min: 500, note: "Arrêt immédiat du médicament suspect, avis cardio" }
                    },
                    frequence: "Avant et après introduction antiarythmique, puis semestriel sous amiodarone",
                    syndrome_declenche: "SYND_003"
                },
                {
                    bio: "BIO_044",
                    nom: "Digoxinémie",
                    frequence: "Dosage 6-8 h après prise, à ≥ 7 jours de toute modification de dose ou de DFG. Annuel si DFG stable, trimestriel si DFG < 45 ou poly-médication.",
                    seuils: {
                        cible_geriatrique: { min: 0.5, max: 0.9, note: "Cible 0.5-0.9 ng/mL chez ≥ 70 ans (DIG trial post-hoc Rathore 2003 NEJM ; ESC 2024 AF §6.2)" },
                        alerte: { min: 1.0, note: "Digoxinémie > 1 ng/mL = sur-dosage chez âgé → réduire dose (passer à 0.0625-0.125 mg/j ou espacer la prise)" },
                        toxique: { min: 1.5, note: "Toxicité digitalique probable (anorexie, nausées, vision jaune, BAV, ESV) → arrêt immédiat, surveillance ECG/K+/Mg, antidote (Fab) si troubles du rythme graves" }
                    },
                    facteurs_aggravants: ["Hypokaliémie", "Hypomagnésémie", "Hypercalcémie", "Hypothyroïdie", "Insuffisance rénale aiguë", "Inhibiteur P-gp (amiodarone, vérapamil, clarithromycine)"],
                    syndrome_declenche: "SYND_003"
                },
                {
                    bio: "BIO_030",
                    nom: "INR",
                    seuils: {
                        cible: { min: 2.0, max: 3.0 },
                        supra: { min: 4.0, action: "Adapter dose AVK, Vitamine K si > 5 sans saignement" },
                        critique: { min: 8.0, action: "PPSB + Vitamine K IV si saignement" }
                    },
                    frequence: "Tous les 8-28 jours sous AVK selon stabilité",
                    syndrome_declenche: "SYND_027"
                },
                {
                    bio: "BIO_019",
                    nom: "TSH",
                    frequence: "Tous les 6 mois sous amiodarone (risque hypo/hyperthyroïdie)",
                    syndromes: ["SYND_012", "SYND_013"]
                },
                {
                    bio: "BIO_003",
                    nom: "Créatinine/DFG",
                    frequence: "Annuel minimum, plus fréquent si DOAC et DFG borderline. Réévaluer dose DOAC si variation DFG.",
                    note: "Fréquence suivi DFG sous DOAC : DFG/10 en mois (ex: DFG 40 → tous les 4 mois)"
                }
            ]
        },

        SCORES: {
            CHA2DS2_VA: {
                composants: [
                    { item: "IC", points: 1, patho: ["PAT_002", "PAT_003"] },
                    { item: "HTA", points: 1, patho: "PAT_005" },
                    { item: "Âge ≥ 75", points: 2 },
                    { item: "Diabète", points: 1, patho: "PAT_016" },
                    { item: "AVC/AIT", points: 2, patho: "PAT_008" },
                    { item: "Maladie vasculaire", points: 1, patho: ["PAT_004", "PAT_007"] },
                    { item: "Âge 65-74", points: 1 }
                ],
                seuils: {
                    anticoag_recommandee: { min: 1, note: "Homme ≥ 1 ou Femme ≥ 2 → AOD recommandé (ESC 2024)" },
                    haut_risque: { min: 4, note: "Risque élevé — dose pleine obligatoire" }
                },
                note: "ESC 2024 : le sexe féminin n'est plus comptabilisé dans le score (CHA₂DS₂-VA remplace CHA₂DS₂-VASc) mais reste un modificateur de risque"
            },
            HAS_BLED: {
                composants: [
                    { item: "HTA non contrôlée", points: 1 },
                    { item: "IRC (DFG < 60) ou dialyse", points: 1, bio: "BIO_004" },
                    { item: "Hépatopathie", points: 1 },
                    { item: "AVC", points: 1, patho: "PAT_008" },
                    { item: "Saignement antérieur", points: 1 },
                    { item: "INR labile (si AVK)", points: 1 },
                    { item: "Âge > 65", points: 1 },
                    { item: "Médicaments (AINS, antiagrégant)", points: 1 },
                    { item: "Alcool", points: 1 }
                ],
                note: "Score élevé ≥ 3 → ne PAS arrêter l'anticoagulation mais corriger les facteurs modifiables"
            }
        },

        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_031", condition: "QTc ≥ 500 ms", action: "Arrêt antiarythmique, scope, avis cardio", syndrome: "SYND_003" },
                { bio: "BIO_030", condition: "INR > 5", action: "Vitamine K per os, adapter dose AVK", syndrome: "SYND_027" },
                { bio: "BIO_019", condition: "TSH effondrée < 0.1 sous amiodarone", action: "Avis endocrino urgent, thiamazole ± corticoïdes", syndrome: "SYND_012" },
                { bio: "BIO_009", condition: "Chute Hb > 2 g/dL sous anticoagulant", action: "Rechercher saignement, endoscopie, arrêt AOD si hémorragie grave + antidote spécifique" },
                { bio: "BIO_044", condition: "Digoxinémie > 0.9 ng/mL chez ≥ 70 ans", action: "Réduire dose digoxine (passer à 0.0625-0.125 mg/j ou espacer la prise) — cible 0.5-0.9 ng/mL en gériatrie (DIG trial post-hoc Rathore 2003 NEJM)", syndrome: "SYND_003" },
                { bio: "BIO_044", condition: "Digoxinémie > 1.5 ng/mL OU symptômes (anorexie, vision jaune, BAV, ESV)", action: "ARRÊT immédiat digoxine, ECG, kaliémie/magnésémie, antidote (Fab anti-digoxine) si trouble du rythme grave ou K+ > 5.5", syndrome: "SYND_003" }
            ]
        }
    },

    "PAT_007": {
        ID: "PAT_007",
        NOM: "Artériopathie Oblitérante (AOMI)",
        REFERENCE: "ESC 2024 PAAD | COMPASS | VOYAGER-PAD | EUCLID",
        SOURCES_EBM: {
                  "INITIER": {
                            "Monothérapie antiagrégante": "ESC_PAD_2024 §8.2, IA",
                            "Rivaroxaban": "ESC_PAD_2024 §8.2, IIaA + COMPASS + VOYAGER_PAD",
                            "Statine": "ESC_PAD_2024 §8.1, IA",
                            "IEC": "ESC_PAD_2024 §8.1, IA",
                            "iSGLT2": "ADA_2025 §9.4 + KDIGO_CKD_2024",
                            "Exercice": "ESC_PAD_2024 §8.3, IA"
                  },
                  "EVITER": {
                            "DAPT": "ESC_PAD_2024 §8.2 + CHARISMA",
                            "Anticoagulation": "WAVE trial — Anand SS et al. NEJM 2006;354:1706",
                            "Bêtabloquants": "ESC_PAD_2024 §8.1 — pas de CI absolue"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Monothérapie antiagrégante",
                    dci_exemples: ["Aspirine 75-100 mg/j", "Clopidogrel 75 mg/j"],
                    indication: "Tous les patients AOMI symptomatiques (claudication, ischémie critique)",
                    note: "Clopidogrel préféré si maladie polyvasculaire (CAPRIE)",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Rivaroxaban 2.5mg x2/j + Aspirine 100 mg/j (stratégie COMPASS)",
                    indication: "AOMI à haut risque ischémique ET faible risque hémorragique (IIa/A ESC 2024)",
                    condition: "Pas de saignement actif, pas d'anticoagulation curative, HAS-BLED acceptable",
                    contre_indications: ["DFG < 15", "Hépatopathie sévère", "Coagulopathie"],
                    note: "COMPASS : réduction 24% MACE + 46% MALE. VOYAGER-PAD : post-revascularisation.",
                    niveau_preuve: "IIaA",
                    bio_pre_requis: ["BIO_003", "BIO_004", "BIO_009"]
                },
                {
                    classe: "Statine haute intensité",
                    dci_exemples: ["Atorvastatine 40-80 mg", "Rosuvastatine 20-40 mg"],
                    indication: "Cible LDL < 1.4 mmol/L (< 0.55 g/L) ET réduction ≥ 50% du basal",
                    note: "AOMI = très haut risque CV. Considérer ajout ézétimibe/anti-PCSK9 si cible non atteinte.",
                    niveau_preuve: "IA",
                    bio_cible: "BIO_027"
                },
                {
                    classe: "IEC ou ARA2",
                    indication: "Recommandé pour prévention CV globale dans AOMI (Class I si HTA ou diabète, IIa sinon)",
                    niveau_preuve: "IA"
                },
                {
                    classe: "iSGLT2",
                    indication: "Si diabète et/ou IC associée — double bénéfice cardio-rénal",
                    condition: "DFG ≥ 20 mL/min",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Programme d'exercice supervisé",
                    indication: "Recommandé chez tous les patients AOMI symptomatiques (Class I, LOE A ESC 2024)",
                    note: "Amélioration périmètre de marche supérieure aux traitements endovasculaires dans la claudication"
                }
            ],
            EVITER: [
                { classe: "DAPT (Aspirine + Clopidogrel) au long cours", raison: "Pas de bénéfice prouvé vs monothérapie en AOMI stable, risque hémorragique accru (CHARISMA)", gravite: "DECONSEILLE sauf post-revascularisation récente (1-6 mois)" },
                { classe: "Anticoagulation curative seule sans antiagrégant", raison: "WAVE trial : pas de bénéfice, plus de saignements", gravite: "DECONSEILLE" },
                { classe: "Bêtabloquants non sélectifs", raison: "Risque théorique d'aggravation claudication (non confirmé dans méta-analyses récentes — ESC 2024 : pas de CI absolue). Note cohérence inter-pathos : les BB cardiosélectifs (bisoprolol, métoprolol succinate, nébivolol, carvédilol) validés en HFrEF (PAT_002 IA) restent recommandés et ne sont PAS concernés par cette prudence — la restriction vise uniquement propranolol/sotalol/nadolol.", gravite: "PRUDENCE, ne pas contre-indiquer si indication cardiaque" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_027", "BIO_025", "BIO_026", "BIO_003", "BIO_004", "BIO_009", "BIO_008", "BIO_026"],
            REGLES: [
                {
                    bio: "BIO_027",
                    nom: "Bilan Lipidique (LDL-C)",
                    seuils: {
                        cible: { max_mmol: 1.4, max_gL: 0.55, note: "Très haut risque CV (AOMI = équivalent coronarien)" },
                        echec: { min_mmol: 1.8, action: "Ajouter ézétimibe puis anti-PCSK9" }
                    },
                    frequence: "6-8 semaines post-introduction statine, puis annuel"
                },
                {
                    bio: "BIO_009",
                    nom: "Hémoglobine",
                    seuils: {
                        alerte: { max: 10, note: "Anémie aggrave ischémie de membre" },
                        saignement: { delta: -2, note: "Chute > 2 g/dL sous antithrombotique → rechercher saignement" }
                    },
                    frequence: "Semestriel, plus fréquent si antithrombotique",
                    syndrome: "SYND_005"
                },
                {
                    bio: "BIO_026",
                    nom: "HbA1c",
                    seuils: { cible: { max: 7.0, note: "Contrôle glycémique = ralentit progression AOMI" } },
                    frequence: "Trimestriel si diabétique"
                },
                {
                    bio: "BIO_003",
                    nom: "Créatinine/DFG",
                    frequence: "Semestriel (dépistage MRC associée, adaptation rivaroxaban)",
                    note: "AOMI + MRC = très haut risque. DFG < 15 : CI rivaroxaban."
                },
                {
                    bio: "BIO_008",
                    nom: "Uricémie",
                    frequence: "Annuel",
                    note: "Hyperuricémie = facteur de risque vasculaire indépendant"
                }
            ]
        },

        INTERACTIONS_CRITIQUES: [
            {
                combinaison: ["Rivaroxaban 2.5mg x2/j", "AINS"],
                risque: "Hémorragie digestive majeure",
                conduite: "CONTRE-INDICATION AINS si stratégie COMPASS"
            },
            {
                combinaison: ["Rivaroxaban 2.5mg x2/j", "Inhibiteur puissant CYP3A4 + P-gp (Kétoconazole, Ritonavir)"],
                risque: "Surdosage rivaroxaban",
                conduite: "Éviter association ou adapter"
            }
        ],

        DECOMPENSATION_BIO: {
            syndrome_principal: "SYND_027",
            triggers: [
                { bio: "BIO_009", condition: "Chute Hb > 2 g/dL", action: "Rechercher saignement (digestif, autre). Arrêt antithrombotique si hémorragie grave." },
                { bio: "BIO_027", condition: "LDL > 1.8 mmol/L sous statine max", action: "Ajouter ézétimibe ± anti-PCSK9" },
                { bio: "BIO_004", condition: "DFG < 30", action: "Arrêter rivaroxaban si stratégie COMPASS. Revoir posologies." },
                { bio: "BIO_024", condition: "CRP > 50 + douleur membre", action: "Rechercher ischémie aiguë, infection de plaie, ostéite" }
            ]
        },

        DIAGNOSTIC: {
            IPS: {
                normal: { min: 0.91, max: 1.30 },
                aomi_legere: { min: 0.70, max: 0.90 },
                aomi_moderee: { min: 0.40, max: 0.69 },
                aomi_severe: { max: 0.40, note: "Ischémie critique probable" },
                mediacalcose: { min: 1.40, note: "Faussement élevé (diabète, IRC) → recourir TcPO2 ou IPS orteil" }
            }
        }
    },

    "PAT_008": {
        ID: "PAT_008",
        NOM: "Accident Vasculaire Cérébral (AVC/AIT)",
        REFERENCE: "ESO 2024 | AHA/ASA 2024 | ESC 2024 AF | CHANCE | POINT | THALES | SPARCL",
        SOURCES_EBM: {
                  "INITIER": {
                            "DAPT courte": "CHANCE + POINT, IA",
                            "AOD": "ESC_AF_2024 §5.2, IA",
                            "Statine": "SPARCL + ESC_DYSLIP_2019, IA",
                            "Antihypertenseur": "PROGRESS + ESC_HTN_2024, IA",
                            "iSGLT2": "ADA_2025 §9.4 + KDIGO_CKD_2024"
                  },
                  "EVITER": {
                            "AOD + Antiagrégant": "ESC_AF_2024 §5.3, IIIB",
                            "AINS": "ESC_HTN_2024 + STOPP_START_V3",
                            "Switch DOAC": "ESC_AF_2024 §5.2"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "DAPT courte durée (AIT/AVC mineur non cardio-embolique)",
                    protocole: "Aspirine + Clopidogrel 21 jours (CHANCE/POINT), puis Clopidogrel seul",
                    condition: "NIHSS ≤ 3 (AVC mineur) ou AIT à haut risque (ABCD2 ≥ 4). Début < 24h.",
                    note: "Ticagrélor + Aspirine 30j (THALES) = alternative si intolérance clopidogrel",
                    niveau_preuve: "IA"
                },
                {
                    classe: "AOD (si FA documentée)",
                    indication: "Prévention secondaire AVC cardio-embolique — voir PAT_006 pour doses DOAC",
                    timing: "Règle 1-3-6-12j : AIT=J1, AVC mineur=J3, AVC modéré=J6, AVC sévère=J12 (après exclusion transformation hémorragique par imagerie)",
                    note: "Ne PAS switcher entre DOAC sans raison claire (ESC 2024). Ne PAS ajouter antiagrégant.",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Statine haute intensité",
                    indication: "Cible LDL < 1.4 mmol/L — prévention secondaire (SPARCL : atorvastatine 80mg)",
                    note: "Si récidive d'événement athérothrombotique dans les 2 ans sous statine haute intensité à dose max tolérée : cible LDL < 1.0 mmol/L (ajout ézétimibe puis anti-PCSK9) — ESC 2019/2024 Dyslipidaemia §6.",
                    niveau_preuve: "IA",
                    bio_cible: "BIO_027"
                },
                {
                    classe: "Antihypertenseur",
                    indication: "PAS cible < 130/80 mmHg en prévention secondaire (après phase aiguë > 72h)",
                    protocole_phase_aigue: "Ne pas traiter si PAS < 220 (AVC ischémique non thrombolysé). Si thrombolyse : PAS < 185/110.",
                    note: "IEC ou ARA2 + ICa ou thiazidique = combinaison recommandée (PROGRESS)",
                    niveau_preuve: "IA"
                },
                {
                    classe: "iSGLT2",
                    indication: "Si diabète et/ou IC et/ou MRC associée — bénéfice cardio-rénal additionnel",
                    niveau_preuve: "IA si comorbidité cardiométabolique"
                }
            ],
            EVITER: [
                { classe: "AOD + Antiagrégant au long cours", raison: "Risque hémorragique accru sans bénéfice sur récidive AVC (ESC 2024)", gravite: "DECONSEILLE" },
                { classe: "AINS", raison: "Risque CV + hémorragique", gravite: "DECONSEILLE" },
                { classe: "Switch DOAC sans raison", raison: "ESC 2024 : ne pas changer de DOAC ni passer de DOAC à AVK sans indication claire", gravite: "DECONSEILLE" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_027", "BIO_025", "BIO_026", "BIO_003", "BIO_004", "BIO_009", "BIO_030", "BIO_019"],
            REGLES: [
                {
                    bio: "BIO_027",
                    nom: "Bilan Lipidique (LDL-C)",
                    seuils: {
                        cible: { max_mmol: 1.4, note: "Prévention secondaire AVC athérothrombotique" },
                        cible_recidive: { max_mmol: 1.0, note: "Si récidive d'événement athérothrombotique dans les 2 ans sous statine haute intensité à dose max tolérée — ESC 2019/2024 Dyslipidaemia §6" }
                    },
                    frequence: "6-8 semaines post-introduction, puis annuel"
                },
                {
                    bio: "BIO_025",
                    nom: "Glycémie à jeun",
                    seuils: { alerte: { min: 7.0, note: "Dépistage diabète post-AVC si pas connu" } },
                    frequence: "Systématique en phase aiguë, puis GAJ + HbA1c si anormal"
                },
                {
                    bio: "BIO_019",
                    nom: "TSH",
                    frequence: "Bilan étiologique AVC (FA thyrotoxique, athérome accéléré)",
                    note: "Systématique dans bilan étiologique initial"
                },
                {
                    bio: "BIO_009",
                    nom: "Hémoglobine",
                    frequence: "Phase aiguë puis semestriel sous antithrombotique",
                    seuils: { alerte: { max: 10, note: "Anémie aggrave ischémie cérébrale" } },
                    syndrome: "SYND_005"
                },
                {
                    bio: "BIO_003",
                    nom: "Créatinine/DFG",
                    frequence: "Phase aiguë (adaptation doses) puis semestriel",
                    note: "Adaptation dose DOAC selon DFG. Réévaluer annuellement."
                }
            ]
        },

        INTERACTIONS_CRITIQUES: [
            {
                combinaison: ["AOD", "Antiagrégant"],
                risque: "Hémorragie intracrânienne",
                conduite: "Ne PAS associer sauf SCA/stent récent (< 12 mois) — durée la plus courte possible"
            },
            {
                combinaison: ["Statine haute dose", "Macrolide (Clarithromycine)"],
                risque: "Rhabdomyolyse (inhibition CYP3A4)",
                conduite: "Préférer azithromycine ou suspendre statine",
                syndrome: "SYND_002"
            }
        ],

        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_030", condition: "INR > 5 sous AVK", action: "Vitamine K per os, adapter dose", syndrome: "SYND_027" },
                { bio: "BIO_009", condition: "Chute Hb > 2 g/dL sous AOD", action: "Rechercher saignement, envisager antidote (idarucizumab/andexanet)" },
                { bio: "BIO_027", condition: "LDL > 1.8 mmol/L", action: "Intensifier hypolipémiant" },
                { bio: "BIO_025", condition: "Hyperglycémie > 10 mmol/L en phase aiguë", action: "Insuline IV si AVC aigu, cible 7.8-10 mmol/L" }
            ]
        }
    },

    "PAT_009": {
        ID: "PAT_009",
        NOM: "Hypotension Orthostatique",
        REFERENCE: "ESC 2018 Syncope | Consensus gériatrique 2023 | STOPP/START v3",
        SOURCES_EBM: {
                  "INITIER": {
                            "Midodrine": "ESC_SYNCOPE_2018 §5.4, IB",
                            "Fludrocortisone": "ESC_SYNCOPE_2018 §5.4, IIaC",
                            "Mesures non pharmacologiques": "ESC_SYNCOPE_2018 §5.4, IC"
                  },
                  "EVITER": {
                            "Alpha-bloquants": "STOPP_START_V3 K1 + ESC_SYNCOPE_2018 §5.3",
                            "Diurétiques": "STOPP_START_V3 B10 + ESC_SYNCOPE_2018",
                            "Antihypertenseurs": "STOPP_START_V3 B6",
                            "Antidépresseurs tricycliques": "BEERS_2023 + STOPP_START_V3 D4"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                { classe: "Mesures non pharmacologiques", indication: "PREMIÈRE INTENTION SYSTÉMATIQUE", composants: ["Hydratation ≥ 1.5-2L/j", "Apport sodé 6-10 g/j (sauf IC)", "Bas de contention classe II", "Surélévation tête de lit 10-20°", "Exercices de contre-pression (handgrip, croiser les jambes)"], niveau_preuve: "IC" },
                { classe: "Midodrine 2.5-10 mg x3/j", indication: "Si mesures non pharmacologiques insuffisantes", ci: ["HTA supine sévère (> 180 systolique)", "IC", "Rétention urinaire", "Phéochromocytome"], note: "Dernière prise avant 18h (HTA supine nocturne)", niveau_preuve: "IB" },
                { classe: "Fludrocortisone 50-200 µg/j", indication: "Alternative ou complément à midodrine", ci: ["IC", "HTA sévère"], note: "Surveillance K+ (hypokaliémie), poids (rétention)", bio_suivi: ["BIO_001", "BIO_002"], niveau_preuve: "IIaC" },
                { classe: "Dompéridone 10 mg x3/j", indication: "Si nausées/gastroparésie associée (Parkinson)", note: "Surveillance QTc (ECG avant et après 1 semaine)", bio_suivi: ["BIO_031"] },
                { classe: "Droxidopa (si disponible)", indication: "Hypotension orthostatique neurogène (Parkinson, AMS)", note: "Non disponible en France en 2026" }
            ],
            EVITER: [
                { classe: "Alpha-bloquants (Tamsulosine, Alfuzosine, Doxazosine, Prazosine)", raison: "Hypotension orthostatique majeure (effet alpha-1)", gravite: "EVITER", ref_stopp: "STOPP K1" },
                { classe: "Antidépresseurs tricycliques (Amitriptyline, Clomipramine, Imipramine, Doxépine)", raison: "Effet hypotenseur alpha-bloquant + anticholinergique → chutes", gravite: "DECONSEILLE", ref_stopp: "STOPP D4 ; Beers 2023" },
                { classe: "Diurétiques (surdosage ou non indiqués)", raison: "Hypovolémie aggravante", gravite: "PRUDENCE — réévaluer indication", ref_stopp: "STOPP B10" },
                { classe: "Antihypertenseurs (si PAS < 120 mmHg debout)", raison: "Sur-traitement antihypertenseur — TA cible plus permissive chez âgé orthostatique", gravite: "DEPRESCRIRE le plus hypotenseur en premier", ref_stopp: "STOPP B6" },
                { classe: "Neuroleptiques classiques (Halopéridol, Chlorpromazine, Lévomépromazine)", raison: "Alpha-bloquant + extrapyramidal → chutes, surmortalité", gravite: "PRUDENCE — préférer quétiapine basse dose si nécessaire", ref_stopp: "Beers 2023" },
                { classe: "Dérivés nitrés (Trinitrine, Isosorbide)", raison: "Vasodilatation systémique aggravant l'orthostatisme", gravite: "REEVALUER l'indication" },
                { classe: "Agonistes dopaminergiques (Pramipexole, Ropinirole)", raison: "Hypotension orthostatique iatrogène (Parkinson) — réduire si possible, compenser par lévodopa", gravite: "PRUDENCE" },
                { classe: "Opioïdes forts", raison: "Hypotension + sédation + chutes", gravite: "PRUDENCE — réduire dose, hydratation, paliers 1-2 si possible" },
                { classe: "Benzodiazépines / Z-drugs", raison: "Sédation + hypotension + chutes", gravite: "EVITER — sevrage progressif", ref_stopp: "STOPP K1, K2 ; Beers 2023" }
            ],
            DEPRESCRIPTION: {
                description: "ÉTAPE CLÉ : Rechercher et réduire/arrêter les médicaments aggravants AVANT toute introduction de traitement spécifique de l'hypotension orthostatique",
                classes_en_cause: [
                    { classe: "Alpha-bloquants (Tamsulosine, Alfuzosine, Doxazosine)", action: "Arrêter ou réduire dose. Envisager Dutastéride si indication prostatique." },
                    { classe: "Diurétiques (surdosage ou non nécessaires)", action: "Réduire dose, surtout furosémide et thiazidiques" },
                    { classe: "Antihypertenseurs (PAS < 120 mmHg debout)", action: "Déprescrire le plus hypotenseur en premier" },
                    { classe: "Antidépresseurs tricycliques", action: "Switch vers ISRS ou ISRSN (moins hypotenseur)" },
                    { classe: "Neuroleptiques / Antipsychotiques", action: "Réduire si possible, préférer quétiapine low-dose" },
                    { classe: "Agonistes dopaminergiques (Parkinson)", action: "Réduire si possible, compenser par lévodopa" },
                    { classe: "Dérivés nitrés", action: "Réévaluer indication" },
                    { classe: "Opioïdes", action: "Réduire dose, hydratation" },
                    { classe: "Benzodiazépines", action: "Sevrage progressif" }
                ],
                strategie: "Déprescrire par paliers de 2 semaines. Réévaluer TA debout/couché (3 min) après chaque modification."
            }
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_001", "BIO_002", "BIO_003", "BIO_019", "BIO_025", "BIO_009"],
            REGLES: [
                { bio: "BIO_002", nom: "Natrémie", seuils: { bas: { max: 130, note: "Hyponatrémie = cause fréquente (thiazidiques, ISRS)" } }, frequence: "Mensuel lors des ajustements, puis trimestriel", syndrome: "SYND_009" },
                { bio: "BIO_001", nom: "Kaliémie", seuils: { bas: { max: 3.5, note: "Hypokaliémie sous fludrocortisone" } }, frequence: "J7-J14 après introduction fludrocortisone, puis mensuel x3", syndrome: "SYND_011" },
                { bio: "BIO_019", nom: "TSH", note: "Exclure hypothyroïdie (cause traitable) et insuffisance surrénale", frequence: "Bilan étiologique initial" },
                { bio: "BIO_025", nom: "Glycémie", note: "Hypoglycémie post-prandiale = diagnostic différentiel", frequence: "Bilan initial" },
                { bio: "BIO_009", nom: "Hémoglobine", seuils: { bas: { max: 10, note: "Anémie aggrave l'hypotension orthostatique" } }, frequence: "Bilan initial puis semestriel" }
            ]
        },

        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_002", condition: "< 125 mmol/L", action: "Arrêter thiazidique/ISRS suspect, restriction hydrique si SIADH", syndrome: "SYND_009" },
                { bio: "BIO_001", condition: "< 3.0 mmol/L sous fludrocortisone", action: "Supplémenter K+, adapter fludrocortisone", syndrome: "SYND_011" },
                { bio: "BIO_009", condition: "< 8 g/dL", action: "Transfusion à discuter, recherche étiologique" }
            ]
        }
    },

    "PAT_010": {
        ID: "PAT_010",
        NOM: "Syndrome Démentiel (Générique)",
        REFERENCE: "EAN/EFNS 2023 | Beers 2023 | STOPP/START v3",
        SOURCES_EBM: {
                  "INITIER": {
                            "IAChE": "EAN_DEMENTIA_2023 §4.1, Grade A",
                            "Mémantine": "EAN_DEMENTIA_2023 §4.2, Grade A"
                  },
                  "EVITER": {
                            "Anticholinergiques": "STOPP D1-D5 + Beers 2023",
                            "BZD": "STOPP D5 + Beers 2023",
                            "Antipsychotiques": "STOPP D3 + FDA Black Box",
                            "Oxybutynine": "STOPP D1 + Beers 2023"
                  }
        },

        TRAITEMENTS: {
            PRINCIPES: [
                { note: "DÉMARCHE SYSTÉMATIQUE en 5 étapes : (1) Confirmation diagnostique (MMSE, MoCA, IRM, biomarqueurs CSF/PET-amyloïde si Alzheimer suspecté). (2) EXCLUSION DES ÉTIOLOGIES RÉVERSIBLES : hypothyroïdie (TSH), carence B12 (BIO_021), syphilis/HIV, hématome sous-dural (TDM), dépression masquée gériatrique, iatrogénie (anticholinergiques, BZD, opioïdes, ATC), troubles métaboliques (Na+, glycémie). (3) PRÉFÉRER PATHOLOGIE SPÉCIFIQUE pour règles dédiées : PAT_011 Alzheimer, PAT_012 DCL, PAT_013 DFT, PAT_041 vasculaire, PAT_042 mixte. (4) BPSD (Behavioral and Psychological Symptoms of Dementia) : interventions NON MÉDICAMENTEUSES en 1ère intention TOUJOURS (PEC environnementale, accompagnement aidant, repérage causes somatiques douleur/IU/constipation). Médicaments réservés aux situations de danger pour le patient/entourage ou souffrance majeure. (5) CHARGE ANTICHOLINERGIQUE (ACB cumulé) à minimiser systématiquement — ré-évaluer toute prescription contributive." }
            ],
            INITIER: [
                {
                    classe: "Inhibiteur de l'Acétylcholinestérase (IAChE)",
                    dci_exemples: ["Donépézil 5-10 mg/j", "Rivastigmine patch 4.6-9.5-13.3 mg/24h", "Galantamine LP 8-16-24 mg/j"],
                    indication: "Démence légère à modérée (MMSE 10-26) de type Alzheimer, mixte, ou Corps de Lewy",
                    titration: "Augmentation progressive toutes les 4 semaines. Donépézil : 5→10 mg. Rivastigmine patch : 4.6→9.5→13.3.",
                    effets_indesirables: "Nausées, diarrhée, bradycardie, syncope, incontinence urinaire",
                    surveillance_cardiaque: "ECG avant introduction (rechercher BAV, bradycardie < 50). Contrôle FC mensuel pendant titration.",
                    ci: ["BAV 2-3 non appareillé", "Bradycardie < 50 bpm", "Asthme sévère non contrôlé"],
                    bio_suivi: ["BIO_031"],
                    niveau_preuve: "IA"
                },
                {
                    classe: "Mémantine 5-10-15-20 mg/j",
                    indication: "Stade modéré à sévère (MMSE < 20), seul ou + IAChE",
                    titration: "5 mg/sem d'augmentation sur 4 semaines",
                    ci: ["DFG < 30 mL/min (réduire dose à 10 mg max si 15-30)"],
                    bio_suivi: ["BIO_003", "BIO_004"],
                    niveau_preuve: "IA"
                }
            ],
            EVITER: [
                { classe: "Anticholinergiques (Score ACB ≥ 1)", raison: "Antagonise directement l'IAChE, aggravation cognitive dose-dépendante", gravite: "CONTRE-INDICATION PHARMACOLOGIQUE", ref_stopp: "STOPP D1-D5", note: "Vérifier ACB de CHAQUE médicament" },
                { classe: "Benzodiazépines", raison: "Sédation, chutes, aggravation cognitive, dépendance", gravite: "DECONSEILLE", ref_stopp: "STOPP D5" },
                { classe: "Antipsychotiques > 12 semaines", raison: "Surmortalité x1.7, AVC x2, déclin cognitif accéléré. Black Box Warning FDA.", gravite: "DECONSEILLE sauf SPCD sévères", ref_stopp: "STOPP D3", note: "Réévaluation obligatoire à 6-12 semaines. Sevrage progressif." },
                { classe: "Antihistaminiques H1 sédatifs (Hydroxyzine, Doxylamine, Prométhazine)", raison: "ACB élevé (2-3), sédation, confusion", gravite: "CONTRE-INDICATION" },
                { classe: "Opioïdes à forte dose", raison: "Sédation, confusion, chutes, constipation", gravite: "PRUDENCE — dose minimale efficace" },
                { classe: "Antispasmodiques urinaires anticholinergiques (Oxybutynine)", raison: "ACB 3, aggravation cognitive significative", gravite: "CONTRE-INDICATION", alternative: "Mirabégron (agoniste β3)" }
            ],
            REEVALUATION: {
                description: "Réévaluer l'indication IAChE tous les 6-12 mois",
                criteres_arret: [
                    "MMSE < 10 et déclin rapide (stade sévère terminal)",
                    "Effets indésirables invalidants (bradycardie symptomatique, chutes, diarrhée incoercible)",
                    "Refus du patient/tuteur",
                    "Entrée en soins palliatifs"
                ],
                note: "Arrêt progressif sur 4 semaines (risque de détérioration rapide à l'arrêt brutal)"
            }
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_021", "BIO_022", "BIO_009", "BIO_002", "BIO_025", "BIO_023", "BIO_005", "BIO_031"],
            BILAN_ETIOLOGIQUE: {
                description: "Bilan biologique de démence réversible — OBLIGATOIRE au diagnostic",
                parametres: [
                    { bio: "BIO_019", raison: "Hypothyroïdie = cause réversible" },
                    { bio: "BIO_021", raison: "Carence B12 = cause réversible (dégénérescence combinée)" },
                    { bio: "BIO_022", raison: "Carence folates" },
                    { bio: "BIO_005", raison: "Hypercalcémie (hyperparathyroïdie)" },
                    { bio: "BIO_002", raison: "Hyponatrémie chronique (confusion chronique)" },
                    { bio: "BIO_025", raison: "Hypoglycémie récurrente" },
                    { bio: "BIO_009", raison: "Anémie profonde" },
                    { bio: "BIO_023", raison: "Carence vitamine D (association cognitive)" },
                    { bio: "BIO_003", raison: "Insuffisance rénale (encéphalopathie urémique)" },
                    { bio: "BIO_013", raison: "Hépatopathie (encéphalopathie hépatique)" }
                ]
            },
            REGLES: [
                { bio: "BIO_031", nom: "QTc/ECG", frequence: "Avant IAChE, puis annuel", note: "IAChE = risque bradycardie. CI si BAV 2-3 ou FC < 50.", seuils: { alerte: { fc_min: 50, note: "Bradycardie → réduire ou arrêter IAChE" } } },
                { bio: "BIO_019", frequence: "Annuel", note: "Dépistage hypothyroïdie (aggrave cognition)" },
                { bio: "BIO_021", frequence: "Annuel", note: "Carence B12 fréquente chez le sujet âgé" },
                { bio: "BIO_002", frequence: "Trimestriel si diurétique ou ISRS", note: "Hyponatrémie chronique = confusion", syndrome: "SYND_009" }
            ]
        },

        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_002", condition: "< 125 mmol/L", action: "Rechercher SIADH iatrogène (ISRS, AE), adapter", syndrome: "SYND_009" },
                { bio: "BIO_019", condition: "TSH > 10 + confusion", action: "Introduction lévothyroxine prudente", syndrome: "SYND_013" },
                { bio: "BIO_021", condition: "B12 < 150 pmol/L", action: "Supplémentation B12 IM (1000 µg/j x7, puis hebdomadaire, puis mensuel)" },
                { bio: "BIO_005", condition: "Ca > 2.65 mmol/L + confusion", action: "Hydratation, rechercher hyperparathyroïdie/néoplasie", syndrome: "SYND_021" }
            ]
        }
    },

    "PAT_011": {
        ID: "PAT_011",
        NOM: "Maladie d'Alzheimer",
        REFERENCE: "EAN 2023 | NIA-AA 2024 | HAS 2024 | CLARITY-AD (Lecanemab NEJM 2023) | TRAILBLAZER-ALZ 2 (Donanemab JAMA 2023) | EMA 2024",
        SOURCES_EBM: {
                  "INITIER": {
                            "Donépézil": "EAN_DEMENTIA_2023 §4.1, A",
                            "Rivastigmine": "EAN_DEMENTIA_2023 §4.1, A",
                            "Galantamine": "EAN_DEMENTIA_2023 §4.1, A",
                            "Mémantine": "EAN_DEMENTIA_2023 §4.2, A",
                            "Anti-amyloïdes (Lecanemab, Donanemab)": "FDA 2023-2024 + EMA 2024 — accès très restreint, NON remboursés en France 2025"
                  },
                  "EVITER": {
                            "Anticholinergiques": "STOPP_START_V3 D1 + BEERS_2023",
                            "Antipsychotiques": "STOPP_START_V3 D3 + FDA Black Box Warning 2005"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Donépézil 5→10 mg/j", indication: "Stade léger à modéré (MMSE 10-26)", titration: "5 mg x 4 semaines puis 10 mg", surveillance: "ECG (bradycardie), poids, transit", niveau_preuve: "IA" },
                { classe: "Rivastigmine patch 4.6→9.5→13.3 mg/24h", indication: "Alternative, meilleur profil digestif en patch", note: "Préféré si problème d'observance ou nausées sous oral" },
                { classe: "Galantamine LP 8→16→24 mg/j", indication: "Alternative, peut bénéficier composante vasculaire", note: "CI si DFG < 9" },
                { classe: "Mémantine 5→10→15→20 mg/j", indication: "Stade modéré à sévère (MMSE < 20)", note: "Association IAChE + mémantine = bénéfice additif (Tariot 2004)", ci_dfg: "Dose max 10 mg si DFG < 30", niveau_preuve: "IA" },
                { classe: "Anti-amyloïdes (Lecanemab/Leqembi, Donanemab/Kisunla)", indication: "Maladie d'Alzheimer légère ou MCI Alzheimer (biomarqueurs amyloïdes positifs CSF/PET-amyloïde)", note: "Indication très restreinte. APOE4 hétérozygote ou non-porteur préféré (homozygotes : risque ARIA majeur). IRM cérébrales périodiques pour ARIA-E/H (œdème, microhémorragies). Équipe spécialisée. NON REMBOURSÉS en France au 2025 (accès sous ATU/RTU). Bénéfice clinique modeste (CDR-SB Δ -0.45 dans CLARITY-AD vs placebo). Mention pour information.", niveau_preuve: "B (CLARITY-AD, TRAILBLAZER-ALZ 2)", ci: ["APOE4 homozygote (risque ARIA)", "Anticoagulation thérapeutique", "ATCD AVC hémorragique", "Microhémorragies multiples (> 4) à l'IRM"] }
            ],
            EVITER: [
                { classe: "Anticholinergiques (ACB ≥ 1)", raison: "Antagonise directement l'IAChE prescrit", gravite: "CONTRE-INDICATION PHARMACOLOGIQUE" },
                { classe: "Antipsychotiques > 12 semaines", raison: "Surmortalité, AVC. Utilisation exceptionnelle si SPCD sévères.", gravite: "DECONSEILLE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_021", "BIO_009", "BIO_002", "BIO_025", "BIO_031", "BIO_003"],
            REGLES: [
                { bio: "BIO_031", frequence: "ECG avant IAChE, à 1 mois, puis annuel", note: "Bradycardie, BAV" },
                { bio: "BIO_019", frequence: "Annuel" },
                { bio: "BIO_021", frequence: "Annuel" },
                { bio: "BIO_003", frequence: "Semestriel si mémantine (élimination rénale)" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_031", condition: "FC < 50 bpm sous IAChE", action: "Réduire dose ou arrêter IAChE. ECG complet." },
                { bio: "BIO_002", condition: "< 125", action: "Rechercher SIADH iatrogène", syndrome: "SYND_009" }
            ]
        }
    },

    "PAT_012": {
        ID: "PAT_012",
        NOM: "Démence à Corps de Lewy (DCL)",
        REFERENCE: "McKeith 2023 DLB Consortium | McKeith Neurology 2017 | EAN 2023 | NICE DLB 2018 | Watts Aging Ment Health 2022",
        SOURCES_EBM: {
            "INITIER": {
                "Rivastigmine": "McKeith DLB 2023 §5.1, A — niveau 2 (NICE)",
                "Donépézil": "NICE DLB 2018 — niveau 1 (hallucinations)",
                "Mémantine": "NICE DLB 2018 — niveau 2 (adjuvant ou alternative)"
            },
            "EVITER": {
                "Neuroleptiques classiques": "McKeith 2017 + DLB 2023 §5.3 — CI absolue (sensibilité neuroleptique sévère)",
                "Clozapine": "Watts 2022 Aging Ment Health — coma documenté en DCL",
                "Anticholinergiques": "McKeith 2023 — aggravent hallucinations et confusion"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Sensibilité neuroleptique majeure (30-50% des patients DCL — risque SNM, rigidité, coma, décès). ÉPUISER les options non-antipsychotiques avant tout AP. Quétiapine uniquement si indispensable, à dose minimale, titration lente, surveillance motrice étroite." }
            ],
            INITIER: [
                { classe: "Rivastigmine (patch 4.6-9.5 mg/24h ou PO 3-12 mg/j)", indication: "1ère intention — bénéfice cognitif + neuropsychiatrique (hallucinations)", note: "Patch préféré chez sujet âgé (meilleure tolérance digestive vs PO)", niveau_preuve: "A — niveau 2 NICE" },
                { classe: "Donépézil (5-10 mg/j)", indication: "Alternative — hallucinations visuelles ++ | bénéfice cognitif. Niveau 1 NICE pour hallucinations.", niveau_preuve: "1" },
                { classe: "Mémantine (5-20 mg/j)", indication: "Adjuvant aux IAChE (stade modéré-sévère) ou alternative si IAChE non toléré", niveau_preuve: "2" },
                { classe: "Quétiapine 6.25-50 mg/j (faible dose)", indication: "Psychose/agitation sévère réfractaire aux IAChE uniquement", note: "SEUL antipsychotique relativement toléré dans DCL (moindre risque extrapyramidal). Titration très lente. Arrêt immédiat si aggravation motrice. Surveillance QTc.", niveau_preuve: "C" }
            ],
            EVITER: [
                { classe: "Neuroleptiques classiques (Halopéridol, Chlorpromazine, Lévomépromazine)", raison: "Hypersensibilité neuroleptique sévère = critère diagnostique DCL. Risque SNM, rigidité, coma, décès.", gravite: "CONTRE-INDICATION ABSOLUE", ref_stopp: "STOPP K1" },
                { classe: "Clozapine", raison: "Cas documentés de coma après dose unique en DCL (Watts 2022). Risque >> bénéfice.", gravite: "CONTRE-INDICATION" },
                { classe: "Rispéridone, Olanzapine", raison: "Syndrome extrapyramidal sévère, sédation, aggravation parkinsonienne", gravite: "CONTRE-INDICATION FORTE / DECONSEILLE" },
                { classe: "Anticholinergiques (bipéridène, trihexyphénidyle, oxybutynine, ATC)", raison: "Aggravent hallucinations, confusion et déficit cognitif", gravite: "CONTRE-INDICATION" },
                { classe: "Métoclopramide, Dompéridone (forte dose)", raison: "Antagoniste D2 → syndrome parkinsonien aggravé", gravite: "CONTRE-INDICATION" },
                { classe: "Benzodiazépines / Z-drugs", raison: "Sensibilité accrue, chutes, confusion, sédation paradoxale", gravite: "EVITER", ref_stopp: "STOPP K1, K2 ; Beers 2023" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_009", "BIO_002", "BIO_031"],
            REGLES: [
                { bio: "BIO_031", nom: "QTc", note: "Surveillance QTc si quétiapine (effet allongement QT). ECG avant et 1 mois après introduction.", syndrome: "SYND_003" },
                { bio: "BIO_002", nom: "Natrémie", note: "Hyponatrémie sous IAChE (rare) ou si IAChE associé à ISRS", syndrome: "SYND_009" },
                { bio: "BIO_019", nom: "TSH", note: "Bilan étiologique initial (exclure pseudodémence hypothyroïdienne)" }
            ]
        }
    },

    "PAT_013": {
        ID: "PAT_013",
        NOM: "Démence Fronto-Temporale (DFT)",
        REFERENCE: "FTD Consortium 2023 | International FTD Research Symposium 2024 | AFTD Expert Recommendations | Lebert 2004 (trazodone) | ALBA-FTD trial | STOPP/START v3 | Beers 2023",
        SOURCES_EBM: {
                  "INITIER": {
                            "ISRS / Trazodone": "FTD Consortium 2023 §4, C ; Lebert 2004 (trazodone hyperphagie/compulsions)",
                            "Quétiapine basse dose": "FTD Consortium 2023 §5 — alternative aux antipsychotiques classiques si agitation/psychose réfractaire",
                            "Mesures non pharmacologiques": "AFTD 2024 — orthophonie, accompagnement aidant, PEC environnementale"
                  },
                  "EVITER": {
                            "IAChE": "FTD Consortium 2023, B — pas de déficit cholinergique",
                            "Antipsychotiques classiques": "FTD Consortium 2023 + Beers 2023 — sensibilité extrapyramidale",
                            "Benzodiazépines": "STOPP K1 — chutes/confusion",
                            "Mémantine": "ALBA-FTD trial — pas de bénéfice démontré sauf forme mixte Alzheimer"
                  }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "DFT = pas de traitement modificateur de la maladie. Stratégie symptomatique des troubles comportementaux (désinhibition, apathie, compulsions, hyperphagie) + accompagnement non pharmacologique. Différencier DFT comportementale (bvFTD) vs aphasie primaire progressive (APP, agrammatique/sémantique). Toujours préférer mesures non médicamenteuses + faibles doses si médicaments." },
                { note: "Recherche systématique de la composante surajoutée (souvent dégénérescence motoneuronale type SLA-DFT, ou superposition Alzheimer dans 10-15%) — ces composantes guident le traitement." }
            ],
            INITIER: [
                { classe: "Mesures non pharmacologiques", indication: "PREMIÈRE INTENTION SYSTÉMATIQUE", composants: ["Orthophonie (APP)", "Accompagnement aidant (formation aux comportements DFT)", "PEC environnementale (sécurisation, simplification routine)", "Soutien psychologique aidant", "Plateformes d'accompagnement DFT spécialisées"], niveau_preuve: "C" },
                { classe: "ISRS (Sertraline 25-100 mg, Citalopram 10-20 mg, Escitalopram 5-10 mg)", indication: "Troubles comportementaux (désinhibition, compulsions, apathie, irritabilité)", note: "Démarrer faible dose, titration lente. Surveiller hyponatrémie (BIO_002), allongement QT (citalopram > 20 mg/j à éviter chez âgé).", niveau_preuve: "C" },
                { classe: "Trazodone 50-150 mg/j (au coucher)", indication: "Hyperphagie, compulsions alimentaires, agitation vespérale, troubles du sommeil", note: "Lebert 2004 — efficacité démontrée sur compulsions DFT. Surveiller hypotension orthostatique. Bonne tolérance gériatrique vs ISRS.", niveau_preuve: "B" },
                { classe: "Quétiapine très basse dose (12.5-25 mg)", indication: "Agitation/psychose réfractaire AUX ISRS — uniquement après échec des autres mesures", note: "Préférer quétiapine aux antipsychotiques classiques (moins d'effets extrapyramidaux). Surveiller QT, sédation, chutes. Réévaluer à 4-6 semaines, désescalader si possible.", ci: ["Allongement QT documenté", "DCL associée (sensibilité neuroleptique)"], niveau_preuve: "C" },
                { classe: "Mémantine (controverse)", indication: "Forme mixte DFT + Alzheimer documentée uniquement", note: "ALBA-FTD trial négatif sur bvFTD pure. Pas indiquée dans DFT pure.", niveau_preuve: "C — non recommandée en DFT pure" }
            ],
            EVITER: [
                { classe: "IAChE (Donépézil, Rivastigmine, Galantamine)", raison: "Pas de déficit cholinergique dans DFT — risque d'aggravation comportementale (désinhibition accrue)", gravite: "DECONSEILLE" },
                { classe: "Antipsychotiques classiques (Halopéridol, Chlorpromazine, Lévomépromazine)", raison: "Sensibilité extrapyramidale accrue, sédation, chutes, surmortalité (Beers 2023)", gravite: "DECONSEILLE" },
                { classe: "Antipsychotiques à fort effet anticholinergique (Olanzapine, Quétiapine forte dose)", raison: "Aggravation cognitive + chutes. Si nécessaire : quétiapine 12.5-25 mg max.", gravite: "PRUDENCE EXTREME" },
                { classe: "Benzodiazépines / Z-drugs (Zolpidem, Zopiclone)", raison: "Sensibilité accrue chez DFT — chutes, confusion, désinhibition paradoxale", gravite: "EVITER", ref_stopp: "STOPP K1, K2 ; Beers 2023" },
                { classe: "Opioïdes forts", raison: "Sédation, chutes, confusion — privilégier paliers 1-2", gravite: "PRUDENCE" },
                { classe: "Anticholinergiques (oxybutynine, tolterodine, ATC)", raison: "Aggravation cognitive et comportementale", gravite: "EVITER", ref_stopp: "Beers 2023 ; STOPP B6, D4" },
                { classe: "Valproate (Dépakine)", raison: "Études contradictoires sur bvFTD ; effets indésirables (hépatotoxicité, thrombopénie, hyperammoniémie) chez âgé", gravite: "PRUDENCE — réservé aux formes très agressives non contrôlées" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_009", "BIO_002", "BIO_013", "BIO_014", "BIO_031"],
            REGLES: [
                { bio: "BIO_002", nom: "Natrémie", frequence: "À 1 mois post-introduction ISRS, puis trimestrielle", seuils: { bas: { max: 130, note: "Hyponatrémie sous ISRS (SIADH) — fréquente chez sujet âgé. Si < 130 : arrêt ISRS, switch trazodone." } }, syndrome: "SYND_009" },
                { bio: "BIO_019", nom: "TSH", frequence: "Bilan étiologique initial (exclure pseudodémence hypothyroïdienne)", note: "Hypothyroïdie peut mimer DFT (apathie, ralentissement)" },
                { bio: "BIO_009", nom: "Hémoglobine", frequence: "Annuel", note: "Anémie aggrave fatigue et apathie — corriger si < 11 g/dL" },
                { bio: "BIO_013", nom: "ASAT", frequence: "Si valproate introduit (mensuel x3 puis trimestriel)", note: "Hépatotoxicité valproate", syndrome: "SYND_001" },
                { bio: "BIO_031", nom: "QTc", frequence: "Avant et 1 mois après introduction quétiapine ou citalopram > 20 mg/j", note: "Allongement QT — surveillance ECG", syndrome: "SYND_003" }
            ]
        }
    },

    "PAT_014": {
        ID: "PAT_014",
        NOM: "Maladie de Parkinson",
        REFERENCE: "MDS EBM 2025 | DGN/EAN 2024 | NICE 2024",
        SOURCES_EBM: {
                  "INITIER": {
                            "Lévodopa": "DGN_PD_2024 §3.1, A + MDS_EBM_2025",
                            "Agonistes DA": "DGN_PD_2024 §3.2, A",
                            "IMAO-B": "DGN_PD_2024 §3.3, A",
                            "iCOMT": "MDS_EBM_2025 Opicapone: Efficacious",
                            "Clozapine": "DGN_PD_2024 §4.3, A"
                  },
                  "EVITER": {
                            "Neuroleptiques classiques": "DGN_PD_2024 §4.3 CI",
                            "Métoclopramide": "DGN_PD_2024 §4.3 CI",
                            "IMAO-B+Péthidine": "DGN_PD_2024 §3.3 CI absolue"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Lévodopa + inhibiteur DDC",
                    dci_exemples: ["Lévodopa/Bensérazide (Modopar)", "Lévodopa/Carbidopa (Sinemet)"],
                    indication: "Traitement le plus efficace. PREMIÈRE INTENTION chez le sujet > 65-70 ans.",
                    posologie: "Débuter 50/12.5 mg x3/j, augmenter par paliers de 50 mg/sem",
                    note: "Absorption diminuée par protéines (espacer repas). Fractionnement doses en 4-6 prises/j si fluctuations.",
                    interactions_absorption: ["IPP (↓ absorption)", "Fer (espacer 2h)", "Repas protéinés (compétition AA)"],
                    niveau_preuve: "IA"
                },
                {
                    classe: "Agonistes dopaminergiques non ergotés",
                    dci_exemples: ["Ropinirole LP 2-24 mg/j", "Pramipexole LP 0.26-3.15 mg/j", "Rotigotine patch 2-16 mg/24h"],
                    indication: "Sujet < 65-70 ans en première intention OU adjuvant à lévodopa",
                    effets_indesirables: "TCI (jeu pathologique, hypersexualité, achats compulsifs) chez 15-40%. Somnolence diurne. Hallucinations.",
                    surveillance: "Évaluer TCI à CHAQUE consultation (questionnaire QUIP). Somnolence diurne excessive.",
                    ci_geriatrie: "Prudence chez > 70 ans : confusion, hallucinations, TCI, hypotension orthostatique",
                    niveau_preuve: "IA"
                },
                {
                    classe: "IMAO-B",
                    dci_exemples: ["Rasagiline 1 mg/j", "Safinamide 50-100 mg/j"],
                    indication: "Monothérapie précoce OU adjuvant à lévodopa pour fluctuations motrices",
                    interactions: "IMAO-B + ISRS/IRSN = risque syndrome sérotoninergique (rare mais grave). IMAO-B + tramadol/péthidine = CI absolue.",
                    niveau_preuve: "IB"
                },
                {
                    classe: "Inhibiteur COMT",
                    dci_exemples: ["Opicapone 50 mg/j (1 prise)", "Entacapone 200 mg (à chaque prise de lévodopa)"],
                    indication: "Fluctuations motrices — allonge l'action de chaque dose de lévodopa",
                    note: "Opicapone = 1 prise/j, meilleure observance. Coloration urines (entacapone).",
                    bio_suivi: ["BIO_013", "BIO_014"],
                    niveau_preuve: "IA (opicapone MDS 2025 : efficacious)"
                },
                {
                    classe: "Amantadine 100-300 mg/j",
                    indication: "Dyskinésies sous lévodopa",
                    ci: ["DFG < 30 (accumulation)", "Confusion", "Psychose"],
                    note: "Arrêt progressif obligatoire (rebond parkinsonien, syndrome malin-like)",
                    bio_suivi: ["BIO_003"]
                },
                {
                    classe: "Clozapine 6.25-50 mg/j",
                    indication: "Psychose/hallucinations résistantes si IAChE insuffisant",
                    note: "SEUL antipsychotique avec preuve d'efficacité dans psychose parkinsonienne. NFS OBLIGATOIRE (agranulocytose).",
                    bio_suivi: ["BIO_012", "BIO_011"],
                    surveillance: "NFS hebdomadaire x18 semaines, puis mensuel à vie",
                    niveau_preuve: "IB"
                }
            ],
            EVITER: [
                { classe: "Neuroleptiques classiques (Halopéridol, Chlorpromazine, Lévomépromazine)", raison: "Anti-D2 → aggravation sévère du parkinsonisme, syndrome malin", gravite: "CONTRE-INDICATION ABSOLUE" },
                { classe: "Métoclopramide, Métopimazine", raison: "Anti-D2 central → syndrome parkinsonien", gravite: "CONTRE-INDICATION ABSOLUE", alternative: "Dompéridone 10 mg x3/j (anti-D2 périphérique uniquement, surveillance QTc)" },
                { classe: "Neuroleptiques atypiques sauf Clozapine et Quétiapine", raison: "Risque extrapyramidal", gravite: "DECONSEILLE" },
                { classe: "Antidépresseurs tricycliques", raison: "Anticholinergique + hypotension orthostatique + confusion", gravite: "DECONSEILLE" },
                { classe: "Anticholinergiques (Trihexyphénidyle)", raison: "Confusion, hallucinations chez le sujet âgé. À réserver au tremblement résistant du sujet jeune.", gravite: "DECONSEILLE en gériatrie" },
                { classe: "IMAO-B + Péthidine/Tramadol", raison: "Syndrome sérotoninergique", gravite: "CONTRE-INDICATION ABSOLUE" },
                { classe: "Réserpine, Tétrabénazine", raison: "Déplétion dopaminergique → aggravation", gravite: "CONTRE-INDICATION" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_001", "BIO_002", "BIO_003", "BIO_009", "BIO_019", "BIO_025", "BIO_031", "BIO_012"],
            REGLES: [
                { bio: "BIO_002", nom: "Natrémie", frequence: "Trimestriel", note: "SIADH iatrogène fréquent (ISRS, AE, âge)", syndrome: "SYND_009" },
                { bio: "BIO_025", nom: "Glycémie", frequence: "Annuel", note: "Surveiller sous agonistes DA (rare dysrégulation)" },
                { bio: "BIO_009", nom: "Hémoglobine", frequence: "Semestriel", note: "Anémie aggrave asthénie et hypotension orthostatique" },
                { bio: "BIO_031", nom: "ECG/QTc", frequence: "Avant dompéridone, puis annuel", note: "Dompéridone allonge QTc. CI si QTc > 450 ms." },
                { bio: "BIO_012", nom: "PNN", frequence: "Hebdomadaire x18 sem, puis mensuel si clozapine", note: "Agranulocytose 1-2%. Arrêt si PNN < 1.5 G/L.", syndrome: "SYND_014" },
                { bio: "BIO_013", nom: "ASAT", frequence: "Semestriel si tolcapone/entacapone", note: "Hépatotoxicité rare sous iCOMT (surtout tolcapone)", syndrome: "SYND_001" },
                { bio: "BIO_003", nom: "Créatinine/DFG", frequence: "Semestriel", note: "Adaptation amantadine (CI si DFG < 30), mémantine si démence associée" }
            ]
        },

        INTERACTIONS_CRITIQUES: [
            {
                combinaison: ["IMAO-B (Rasagiline, Safinamide)", "ISRS/IRSN (Sertraline, Venlafaxine)"],
                risque: "Syndrome sérotoninergique (rare)",
                conduite: "Association possible sous surveillance stricte. Éviter fluoxétine et fluvoxamine."
            },
            {
                combinaison: ["IMAO-B", "Péthidine ou Tramadol"],
                risque: "Syndrome sérotoninergique GRAVE",
                conduite: "CONTRE-INDICATION ABSOLUE"
            },
            {
                combinaison: ["Lévodopa", "Fer oral"],
                risque: "Chélation → réduction absorption lévodopa de 50%",
                conduite: "Espacer de ≥ 2 heures"
            },
            {
                combinaison: ["Dompéridone", "Médicament allongeant QT"],
                risque: "Torsades de pointes",
                conduite: "ECG avant et surveillance QTc",
                syndrome: "SYND_003"
            }
        ],

        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_012", condition: "PNN < 1.5 G/L sous clozapine", action: "Contrôle immédiat. Si PNN < 1.0 → arrêt clozapine définitif", syndrome: "SYND_014" },
                { bio: "BIO_002", condition: "< 125 mmol/L", action: "Rechercher SIADH, adapter traitement", syndrome: "SYND_009" },
                { bio: "BIO_013", condition: "> 3N sous iCOMT", action: "Arrêt tolcapone/entacapone, bilan hépatique complet", syndrome: "SYND_001" },
                { bio: "BIO_031", condition: "QTc > 500 ms", action: "Arrêt dompéridone et tout médicament QT", syndrome: "SYND_003" }
            ]
        },

        SITUATIONS_SPECIALES: {
            crise_akinetique: {
                description: "Urgence neurologique : akinésie complète, rigidité, fièvre, rhabdomyolyse",
                conduite: "NE JAMAIS arrêter brutalement la lévodopa. Apomorphine SC en urgence. Réhydratation. CPK + créatinine.",
                bio_urgence: ["BIO_018", "BIO_003", "BIO_001"]
            },
            hypotension_orthostatique: {
                prevalence: "30-50% des patients Parkinson",
                conduite: "Voir PAT_009. Réduire agonistes DA en premier. Fludrocortisone ou midodrine."
            }
        }
    },

    "PAT_015": {
        ID: "PAT_015",
        NOM: "Épilepsie",
        REFERENCE: "ILAE 2024 | HAS 2023 | EAN 2024",
        SOURCES_EBM: {
                  "INITIER": {
                            "Lévétiracétam": "ILAE_2024 §3.1, A",
                            "Lamotrigine": "ILAE_2024 §3.1, A",
                            "Lacosamide": "ILAE_2024 §3.2, B"
                  },
                  "EVITER": {
                            "Phénytoïne": "ILAE_2024 + Beers 2023",
                            "Phénobarbital": "Beers 2023"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Lévétiracétam", indication: "Première intention focale et généralisée, bon profil gériatrique", note: "Pas d'interaction CYP, ajustement rénal" },
                { classe: "Lamotrigine", indication: "Première intention focale et généralisée", note: "Titration lente obligatoire (risque Stevens-Johnson)" },
                { classe: "Lacosamide", indication: "Épilepsie focale", note: "Bon profil gériatrique, attention PR (ECG)" }
            ],
            EVITER: [
                { classe: "Phénytoïne", raison: "Index thérapeutique étroit, cinétique non linéaire, inducteur enzymatique (interactions multiples), ostéoporose", gravite: "DECONSEILLE en gériatrie" },
                { classe: "Phénobarbital", raison: "Sédation majeure, inducteur enzymatique, dépendance", gravite: "DECONSEILLE" },
                { classe: "Carbamazépine", raison: "Inducteur enzymatique majeur (CYP3A4), hyponatrémie, interactions multiples", gravite: "PRUDENCE, préférer alternatives" },
                { classe: "Valproate", raison: "Hépatotoxicité, thrombopénie, tremblement, prise de poids. CI chez femme en âge de procréer.", gravite: "PRUDENCE en gériatrie" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_002", "BIO_009", "BIO_010", "BIO_013", "BIO_014", "BIO_021", "BIO_023"],
            REGLES: [
                { bio: "BIO_002", frequence: "Tous les 3-6 mois sous CBZ/OXC", note: "Risque hyponatrémie (SIADH)", syndrome: "SYND_009" },
                { bio: "BIO_013", frequence: "Semestriel sous valproate", note: "Hépatotoxicité", syndrome: "SYND_001" },
                { bio: "BIO_010", frequence: "Semestriel sous valproate", note: "Thrombopénie dose-dépendante" },
                { bio: "BIO_023", frequence: "Annuel sous inducteurs", note: "Carence Vit D accélérée sous phénytoïne/CBZ/phéno" },
                { bio: "BIO_021", frequence: "Annuel", note: "Carence B12 si antiépileptique au long cours" }
            ]
        }
    },

    // PAT_016 — umbrella "Diabète non précisé" : conservé pour rétrocompatibilité.
    // Les règles spécifiques sont dans PAT_016a (DT1) et PAT_016b (DT2). Si un type
    // précis est sélectionné par le clinicien, le moteur (COMORB_GENERIC_OVERRIDES)
    // supprime PAT_016 du calcul pour éviter les doublons.
    "PAT_016": {
        ID: "PAT_016",
        NOM: "Diabète (type non précisé)",
        REFERENCE: "ADA Standards 2025-2026 | ESC 2023 | KDIGO 2024 | EASD 2024",
        NOTE: "Umbrella — préférer PAT_016a (DT1) ou PAT_016b (DT2) pour des recommandations ciblées.",
        SOURCES_EBM: {
                  "INITIER": {
                            "Prise en charge spécialisée": "ADA_2025 §13.14 — DT1 vs DT2 ont des prises en charge distinctes"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Préciser le type de diabète (DT1 vs DT2) — prises en charge distinctes",
                    indication: "DT1 : insulinothérapie basale-bolus OBLIGATOIRE (déficit absolu d'insuline). DT2 : metformine en 1ʳᵉ intention, puis iSGLT2 / GLP-1 RA selon le profil cardio-rénal.",
                    note: "Sélectionner « Diabète de type 1 » (DT1) ou « Diabète de type 2 » (DT2) pour des recommandations ciblées : cibles HbA1c, schémas thérapeutiques et surveillance biologique détaillés.",
                    ref: "ADA 2025 §13.14"
                },
                {
                    classe: "iSGLT2 (Dapagliflozine, Empagliflozine) — si DT2 + maladie CV / rénale / insuffisance cardiaque",
                    indication: "Bénéfice cardio-rénal indépendant de l'équilibre glycémique (DAPA-HF, DAPA-CKD, EMPA-REG OUTCOME).",
                    note: "Réservé au DT2. En DT1 : uniquement en cadre spécialisé (risque d'acidocétose euglycémique — FDA warning 2015).",
                    niveau_preuve: "IA",
                    ref: "ESC 2023 | KDIGO 2024"
                },
                {
                    classe: "GLP-1 RA (Sémaglutide, Dulaglutide, Liraglutide) — si DT2 + surpoids ou maladie CV",
                    indication: "Réduction des MACE chez le DT2 à haut risque CV (REWIND, LEADER, SUSTAIN-6) ; perte de poids.",
                    note: "Réservé au DT2. Surveiller la perte de poids chez le sujet âgé fragile/sarcopénique. Inefficace en DT1 (ne remplace pas l'insuline).",
                    niveau_preuve: "IA",
                    ref: "ESC 2024 | ADA 2025 §10.3"
                }
            ],
            CIBLES_HBA1C: {
                general: { max: 7.0, note: "Adulte non âgé, sans risque d'hypoglycémie" },
                sujet_age_robuste: { min: 7.0, max: 7.5, note: "Sujet âgé robuste" },
                sujet_age_complexe: { min: 7.0, max: 8.0, note: "Santé intermédiaire (≥ 2 IADL altérées) — HbA1c < 7 % = sur-traitement (ADA 2025 §13.5)" },
                sujet_age_tres_fragile: { min: 7.5, max: 8.5, note: "Santé très complexe (EHPAD, cognition sévère) — HbA1c < 7.5 % = sur-traitement, hypoglycémies majeures" },
                fin_de_vie: { note: "Pas de cible stricte — éviter symptômes hyperglycémiques et hypoglycémies" },
                ref: "ADA 2025 Standards of Care §13 — Older Adults (Table 13.1) | EASD 2022 older adults"
            }
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_025", "BIO_026", "BIO_003", "BIO_004"],
            REGLES: [
                { bio: "BIO_026", nom: "HbA1c", frequence: "Trimestriel à semestriel selon stabilité", note: "Voir PAT_016a (DT1) ou PAT_016b (DT2) pour cibles détaillées" },
                { bio: "BIO_025", nom: "Glycémie", note: "Voir PAT_016a/PAT_016b pour seuils décompensation" }
            ]
        }
    },

    // PAT_016a — Diabète de type 1
    // Référentiel : ADA 2025 Standards of Care §9.6 + §13 (Older Adults) ;
    // ISPAD Clinical Practice Consensus Guidelines 2022 ; SFD 2023 ; EASD 2022 (older adults with T1D).
    "PAT_016a": {
        ID: "PAT_016a",
        NOM: "Diabète de type 1",
        REFERENCE: "ADA Standards 2025-2026 §9.6+§13 | ISPAD 2022 | SFD 2023 | EASD 2022 older adults T1D",
        SOURCES_EBM: {
                  "INITIER": {
                            "Insuline basale-bolus": "ADA_2025 §9.6, A — seul traitement validé en DT1",
                            "Pompe à insuline + CGM": "ADA_2025 §7.10 + Battelino Diabetes Care 2019 — Time-in-Range cible 70%",
                            "Hybrid closed-loop (AID)": "ADA_2025 §7.16, IA — réduit hypoglycémies et améliore TIR chez ≥ 65 ans (Boughton Lancet Healthy Longev 2022)"
                  },
                  "EVITER": {
                            "Metformine / iSGLT2 / GLP-1 en monothérapie": "ADA_2025 §9.6 — ne remplacent PAS l'insuline en DT1",
                            "iSGLT2 sans surveillance cétose": "FDA DKA warning 2015 + ADA_2025 §9.6 — risque DKA euglycémique",
                            "Arrêt brusque de l'insuline": "ISPAD 2022 — risque acidocétose diabétique en 12-24h",
                            "Sulfamides / Glinides": "ADA_2025 §9.6 — inefficaces en DT1 (déficit absolu d'insuline)"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Insuline basale (analogue lent : Glargine U100/U300, Détémir, Dégludec)",
                    indication: "Couverture basale obligatoire en DT1 — même en période de jeûne",
                    note: "Chez le sujet âgé : privilégier Glargine U300 ou Dégludec (variabilité moindre → hypoglycémies réduites). Débuter 0.2-0.3 U/kg/j, titrer sur glycémie à jeun.",
                    bio_suivi: ["BIO_025", "BIO_026"],
                    niveau_preuve: "IA"
                },
                {
                    classe: "Insuline prandiale (analogue rapide : Aspart, Lispro, Glulisine, FiAsp)",
                    indication: "Bolus à chaque repas, adapté aux glucides (insulin:carb ratio) et à la glycémie préprandiale",
                    note: "Schéma basal-bolus standard. Chez le sujet âgé avec troubles cognitifs : simplifier (doses fixes aux repas) si calcul de glucides non faisable.",
                    bio_suivi: ["BIO_025"],
                    niveau_preuve: "IA"
                },
                {
                    classe: "Pompe à insuline + CGM (ou AID hybride)",
                    indication: "DT1 avec HbA1c hors cible, hypoglycémies sévères/non ressenties, ou variabilité glycémique importante",
                    note: "Cible Time-in-Range ≥ 70 % (70-180 mg/dL) ; Time-below-Range < 4 %. Chez ≥ 65 ans : cibles assouplies (TIR ≥ 50 %, TBR < 1 %).",
                    bio_suivi: ["BIO_025", "BIO_026"],
                    niveau_preuve: "IA (Boughton 2022, Bergenstal 2022)"
                },
                {
                    classe: "Éducation thérapeutique (ETP) + glucagon d'urgence (nasal ou IM)",
                    indication: "Tous patients DT1, à renouveler — surtout chez aidants familiaux en gériatrie",
                    note: "Glucagon nasal (Baqsimi) recommandé si accès IV difficile ; kit à jour, date de péremption vérifiée.",
                    niveau_preuve: "A (ADA 2025 §6)"
                }
            ],
            CIBLES_HBA1C: {
                adulte_jeune: { max: 7.0, note: "Adulte DT1 sans hypoglycémies sévères (ADA §6.5)" },
                sujet_age_robuste: { min: 7.0, max: 7.5, note: "DT1 âgé robuste — éviter hypoglycémies" },
                sujet_age_complexe: { min: 7.5, max: 8.0, note: "Comorbidités multiples, cognition altérée — HbA1c < 7.5 % = sur-traitement DT1 âgé" },
                sujet_age_tres_fragile: { min: 8.0, max: 8.5, note: "Très fragile — éviter hypoglycémies +++ (priorité absolue) — HbA1c < 8 % = sur-traitement" },
                fin_de_vie: { note: "Insuline basale seule à dose minimale pour éviter cétose ; pas de cible glycémique stricte" },
                ref: "ADA 2025 Standards §13.14 + EASD 2022 older adults T1D"
            },
            EVITER: [
                { classe: "Arrêt de l'insuline basale", raison: "Acidocétose diabétique en 12-24h (déficit absolu)", gravite: "CONTRE-INDICATION ABSOLUE", ref: "ISPAD 2022" },
                { classe: "Metformine / sulfamides / glinides en monothérapie", raison: "Inefficaces en DT1 (ne substituent pas l'insuline)", gravite: "CONTRE-INDICATION", ref: "ADA 2025 §9.6" },
                { classe: "iSGLT2 en DT1 sans cadre spécialisé + éducation cétose", raison: "Risque acidocétose euglycémique (FDA warning 2015)", gravite: "PRUDENCE / ÉVITER en gériatrie", ref: "ADA 2025 §9.6" },
                { classe: "Bêta-bloquant non cardiosélectif", raison: "Masque symptômes d'hypoglycémie (tachycardie, tremblements)", gravite: "PRUDENCE", ref: "STOPP3-J3" },
                { classe: "Objectif HbA1c < 7 % chez DT1 âgé fragile", raison: "Risque hypoglycémie sévère > bénéfice micro-vasculaire", gravite: "DÉPRESCRIRE", ref: "ADA 2025 Table 13.1" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_025", "BIO_026", "BIO_003", "BIO_004", "BIO_006", "BIO_019"],
            REGLES: [
                {
                    bio: "BIO_026",
                    nom: "HbA1c",
                    frequence: "Tous les 3 mois (DT1 → surveillance plus rapprochée qu'en DT2)",
                    seuils: {
                        objectif: { note: "Individualisé (voir CIBLES_HBA1C)" },
                        alerte_haute: { min: 9.0, note: "Intensifier schéma insulinique / envisager CGM ou pompe" },
                        alerte_basse: { max: 6.5, note: "Sur-traitement en gériatrie → relâcher les cibles, surveiller hypoglycémies" }
                    }
                },
                {
                    bio: "BIO_025",
                    nom: "Glycémie capillaire / CGM",
                    seuils: {
                        hypoglycemie: { max: 3.9, action: "Resucrage 15g glucides, recontrôle à 15 min", syndrome: "SYND_017" },
                        hypoglycemie_severe: { max: 2.5, action: "Glucagon IM/nasal, G30% IV si coma, urgence", syndrome: "SYND_017" },
                        hyperglycemie_severe: { min: 15, action: "Bolus correctif + recherche cétonurie/cétonémie", syndrome: "SYND_018" },
                        cetoacidose: { min: 20, note: "+ cétonémie ≥ 3 mmol/L ou cétonurie ≥ ++ → urgence DKA", action: "Hospitalisation, insuline IV + hydratation", syndrome: "SYND_018" }
                    }
                },
                {
                    bio: "BIO_019",
                    nom: "TSH",
                    frequence: "Annuel (DT1 → association fréquente avec thyroïdite auto-immune)",
                    note: "ADA 2025 §4.7 — dépister hypothyroïdie/hyperthyroïdie à la découverte puis annuellement"
                },
                {
                    bio: "BIO_003",
                    nom: "Créatinine/DFG + albuminurie",
                    frequence: "Annuel minimum ; trimestriel si DFG < 60 ou albuminurie présente",
                    note: "Rechercher néphropathie diabétique dès 5 ans d'évolution"
                }
            ]
        },

        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_025", condition: "< 3.9 mmol/L", action: "Resucrage 15g glucides rapides, recontrôle 15 min, revoir schéma insulinique", syndrome: "SYND_017" },
                { bio: "BIO_025", condition: "≥ 15 mmol/L + cétonémie ≥ 0.6 mmol/L", action: "Bolus correctif, hydratation, surveillance rapprochée ; hospitaliser si cétonémie ≥ 3", syndrome: "SYND_018" },
                { bio: "BIO_025", condition: "Coma hypoglycémique", action: "Glucagon 1 mg IM/nasal immédiat OU G30% 30 mL IV ; si récurrent → reconsidérer doses, CGM, AID", syndrome: "SYND_017" },
                { bio: "BIO_006", condition: "Hypokaliémie pendant DKA", action: "Supplémenter K avant reprise insuline", syndrome: "SYND_018" }
            ]
        }
    },

    // PAT_016b — Diabète de type 2 (bloc historique de PAT_016)
    "PAT_016b": {
        ID: "PAT_016b",
        NOM: "Diabète de type 2",
        REFERENCE: "ADA Standards 2025-2026 | ESC 2023 | KDIGO 2024 | EASD 2024",
        SOURCES_EBM: {
                  "INITIER": {
                            "Metformine": "ADA_2025 §9.4, A",
                            "iSGLT2": "ADA_2025 §9.4 + KDIGO_2024 §3.3, IA",
                            "GLP-1 RA": "ADA_2025 §9.4, IA + FLOW",
                            "Finerenone": "KDIGO_2024 §3.8 + FIDELIO + FIGARO, IA"
                  },
                  "EVITER": {
                            "Sulfamides": "STOPP J1 + Beers 2023",
                            "Pioglitazone": "ADA_2025 §9.4 CI si IC"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Metformine",
                    indication: "Première ligne glycémique si DFG ≥ 30 mL/min",
                    note: "Réduire dose si DFG 30-45. Arrêter si DFG < 30. Arrêt transitoire avant iode, anesthésie.",
                    bio_suivi: ["BIO_003", "BIO_004", "BIO_021"],
                    niveau_preuve: "IA"
                },
                {
                    classe: "iSGLT2 (Empagliflozine, Dapagliflozine, Canagliflozine)",
                    indication: "Si MCV établie, IC, ou MRC — INDÉPENDAMMENT de l'HbA1c (ADA 2025)",
                    note: "Bénéfice cardio-rénal prouvé. Initier même si HbA1c à cible. DFG ≥ 20 mL/min pour initiation.",
                    bio_suivi: ["BIO_003", "BIO_004", "BIO_001"],
                    niveau_preuve: "IA"
                },
                {
                    classe: "GLP-1 RA (Sémaglutide, Liraglutide, Dulaglutide)",
                    indication: "Si MCV établie ou haut risque CV — INDÉPENDAMMENT de l'HbA1c (ADA 2025)",
                    note: "Bénéfice MACE + rénoprotection (FLOW : sémaglutide). Bénéfice pondéral.",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Finerenone (ARM non stéroïdien)",
                    indication: "DT2 + MRC avec albuminurie + déjà sous IEC/ARA2 à dose max",
                    note: "FIDELIO-DKD / FIGARO-DKD : réduction événements rénaux et CV. Surveillance K+ obligatoire.",
                    bio_suivi: ["BIO_001", "BIO_003"],
                    niveau_preuve: "IA (KDIGO 2024)"
                }
            ],
            CIBLES_HBA1C: {
                general: { max: 7.0, note: "Adulte non âgé, sans risque d'hypoglycémie" },
                sujet_age_robuste: { min: 7.0, max: 7.5, note: "Sujet âgé en bonne santé (peu de comorbidités, fonctions cognitives et autonomie préservées)" },
                sujet_age_complexe: { min: 7.0, max: 8.0, note: "Santé intermédiaire/complexe (comorbidités multiples, ≥ 2 IADL altérées, ou troubles cognitifs légers-modérés) — HbA1c < 7 % = sur-traitement (ADA 2025 §13.5)" },
                sujet_age_tres_fragile: { min: 7.5, max: 8.5, note: "Santé très complexe (EHPAD, pathologie chronique terminale, troubles cognitifs modérés-sévères, ≥ 2 ADL altérées) — HbA1c < 7.5 % = sur-traitement, hypoglycémies majeures" },
                fin_de_vie: { note: "Pas de cible stricte — éviter l'hyperglycémie symptomatique et toute hypoglycémie" },
                ref: "ADA 2025 Standards of Care §13 — Older Adults (Table 13.1) | EASD 2022 older adults"
            },
            EVITER: [
                { classe: "Sulfamides hypoglycémiants (Glibenclamide)", raison: "Risque hypoglycémie prolongée majeur chez le sujet âgé", gravite: "CONTRE-INDICATION en gériatrie", ref_stopp: "STOPP J1", ref_beers: "AGS 2023" },
                { classe: "Glinides (Répaglinide) au long cours chez le très âgé", raison: "Risque hypoglycémie", gravite: "PRUDENCE" },
                { classe: "Pioglitazone", raison: "IC, fractures, cancer vessie", condition: "CI si IC, ostéoporose", gravite: "PRUDENCE" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_025", "BIO_026", "BIO_003", "BIO_004", "BIO_027", "BIO_021", "BIO_009"],
            REGLES: [
                {
                    bio: "BIO_026",
                    nom: "HbA1c",
                    frequence: "Tous les 3-6 mois selon stabilité",
                    seuils: {
                        objectif: { note: "Individualisé (voir CIBLES_HBA1C)" },
                        alerte_haute: { min: 9.0, note: "Considérer insuline ou intensification" },
                        alerte_basse_complexe: { max: 7.0, note: "HbA1c < 7 % chez sujet âgé complexe = sur-traitement → déprescrire sulfamide/insuline (ADA 2025 §13.5)" },
                        alerte_basse_fragile: { max: 7.5, note: "HbA1c < 7.5 % chez sujet âgé très fragile = sur-traitement majeur → arrêter sulfamide, réduire insuline (EASD 2022)" },
                        alerte_basse_critique: { max: 6.0, note: "HbA1c < 6 % chez âgé = risque hypoglycémie sévère, déprescription urgente quel que soit le profil" }
                    }
                },
                {
                    bio: "BIO_025",
                    nom: "Glycémie à jeun",
                    seuils: {
                        hypoglycemie: { max: 3.9, action: "Resucrage, réévaluer traitement", syndrome: "SYND_017" },
                        hypoglycemie_severe: { max: 2.5, action: "G30% IV, glucagon, urgence", syndrome: "SYND_017" },
                        hyperglycemie_severe: { min: 20, action: "Insuline rapide, rechercher DKA/HHS", syndrome: "SYND_018" }
                    }
                },
                {
                    bio: "BIO_003",
                    nom: "Créatinine/DFG",
                    frequence: "Semestriel si DFG stable, trimestriel si DFG < 45 ou après changement thérapeutique"
                },
                {
                    bio: "BIO_021",
                    nom: "Vitamine B12",
                    frequence: "Annuel si metformine au long cours (malabsorption B12)",
                    syndrome: "SYND_007"
                }
            ]
        },

        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_025", condition: "< 3.9 mmol/L", action: "Resucrage, adapter sulfamide/insuline", syndrome: "SYND_017" },
                { bio: "BIO_025", condition: "> 20 mmol/L", action: "Insuline, hydratation, rechercher cétose", syndrome: "SYND_018" },
                { bio: "BIO_004", condition: "Chute rapide DFG", action: "Rechercher cause (déshydratation, AINS, obstruction), adapter médicaments" }
            ]
        }
    },

    "PAT_017": {
        ID: "PAT_017",
        NOM: "Hypothyroïdie",
        REFERENCE: "ETA 2023 | ATA 2024 | TRUST trial",
        SOURCES_EBM: {
                  "INITIER": {
                            "Lévothyroxine": "ETA_THYROID_2023 §3.1, A + TRUST"
                  },
                  "EVITER": {
                            "Surdosage LT4": "ETA_THYROID_2023 §3.4 + ATA_THYROID_2024",
                            "Traitement subclinique": "TRUST — Stott DJ et al. NEJM 2017;376:2534"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Lévothyroxine",
                    posologie_adulte: "1.6 µg/kg/j (dose cible théorique)",
                    posologie_geriatrique: "Débuter 25 µg/j (12.5 µg si coronarien, IC, ou > 80 ans)",
                    titration: "Paliers de 12.5-25 µg toutes les 6-8 semaines selon TSH",
                    cible_tsh: {
                        general: "0.5-4.0 mUI/L",
                        sujet_age_75: "1.0-5.0 mUI/L",
                        sujet_age_80: "1.0-6.0 mUI/L (TSH cible UNE FOIS le traitement décidé — voir critères ci-dessous)",
                        decision_traiter_age_80: "Hypothyroïdie patente (TSH > 10 mUI/L) ou symptômes (myxœdème, ralentissement, dyslipidémie sévère) : DÉBUTER LT4 12.5-25 µg/j. TSH 4-10 asymptomatique chez > 80 ans : NE PAS TRAITER (TRUST 2017 NEJM Stott — pas de bénéfice fonctionnel ni QoL ; risque FA et ostéoporose). TSH 7-10 récidivante avec symptômes : essai LT4 12.5 µg avec réévaluation à 6 mois."
                    },
                    administration: "À jeun, 30-60 min avant le petit-déjeuner. OU au coucher ≥ 3h après dernier repas.",
                    interactions_absorption: [
                        { medicament: "IPP (Oméprazole)", effet: "↓ absorption 30-40%", conduite: "Augmenter dose LT4 ou espacer 4h" },
                        { medicament: "Fer oral", effet: "Chélation", conduite: "Espacer ≥ 4h" },
                        { medicament: "Calcium / Carbonate de calcium", effet: "Chélation", conduite: "Espacer ≥ 4h" },
                        { medicament: "Cholestyramine / Colestipol", effet: "Liaison intestinale", conduite: "Espacer ≥ 4-6h" },
                        { medicament: "Sucralfate", effet: "↓ absorption", conduite: "Espacer ≥ 2h" },
                        { medicament: "Café", effet: "↓ absorption 30%", conduite: "Prendre LT4 30 min avant café" }
                    ],
                    interactions_metabolisme: [
                        { medicament: "Inducteurs CYP (Phénytoïne, Carbamazépine, Rifampicine, Phénobarbital)", effet: "↑ clairance LT4 → besoin dose accrue", conduite: "Contrôle TSH à 6 semaines" },
                        { medicament: "Œstrogènes (THS)", effet: "↑ TBG → besoin dose accrue", conduite: "Contrôle TSH à 6-8 semaines" }
                    ],
                    niveau_preuve: "IA"
                }
            ],
            EVITER: [
                { classe: "Surdosage LT4 (TSH < 0.4)", raison: "FA, ostéoporose, angor, agitation — sur-traitement gériatrique fréquent", gravite: "RISQUE IMPORTANT chez le sujet âgé — réduire dose LT4" },
                { classe: "Traitement hypothyroïdie subclinique chez > 80 ans si TSH 4-10", raison: "TRUST 2017 NEJM (Stott) : pas de bénéfice fonctionnel ni QoL chez ≥ 80 ans, risque FA + ostéoporose", gravite: "NE PAS TRAITER sauf symptômes francs ou TSH > 10 confirmée" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_027", "BIO_018", "BIO_009"],
            REGLES: [
                {
                    bio: "BIO_019",
                    nom: "TSH",
                    frequence: "6-8 semaines après CHAQUE modification de dose. Puis semestriel si stable.",
                    seuils: {
                        cible_general: { min: 0.5, max: 4.0 },
                        cible_age: { min: 1.0, max: 6.0, note: "> 80 ans" },
                        surdosage: { max: 0.1, action: "Réduire LT4, ECG (rechercher FA)", syndrome: "SYND_012" },
                        sous_dosage: { min: 10, action: "Augmenter LT4 de 25 µg" },
                        coma_myxoedeme: { min: 50, condition: "+ confusion/hypothermie", action: "Urgence réanimation, LT4 IV", syndrome: "SYND_013" }
                    }
                },
                { bio: "BIO_027", frequence: "6 mois après normalisation TSH", note: "Dyslipidémie résolutive si hypothyroïdie corrigée" },
                { bio: "BIO_009", frequence: "Annuel", note: "Anémie macrocytaire associée (Biermer)" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_019", condition: "TSH < 0.1 + palpitations", action: "Réduire LT4, ECG, rechercher FA", syndrome: "SYND_012" },
                { bio: "BIO_019", condition: "TSH > 10 malgré traitement", action: "Vérifier observance, interactions médicamenteuses, absorption" },
                { bio: "BIO_019", condition: "TSH > 50 + troubles conscience", action: "Coma myxœdémateux → réanimation", syndrome: "SYND_013" }
            ]
        }
    },

    "PAT_018": {
        ID: "PAT_018",
        NOM: "Hyperthyroïdie",
        REFERENCE: "ETA 2023 | ATA | ESC 2024 (FA)",
        SOURCES_EBM: {
                  "INITIER": {
                            "Thiamazole": "ETA_THYROID_2023 §4.1, A",
                            "PTU": "ATA_THYROID_2024 — 1er trimestre grossesse uniquement",
                            "Bêtabloquant": "ETA_THYROID_2023 §4.2, IC"
                  },
                  "EVITER": {
                            "Amiodarone": "ESC_AF_2024 §6.2 + ETA_THYROID_2023 §5",
                            "Lithium": "ATA_THYROID_2024 §5.3"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Thiamazole (Thyrozol) 10-40 mg/j OU Carbimazole (Néo-Mercazole) 15-60 mg/j", indication: "Maladie de Basedow, adénome toxique en attente chirurgie/IRA", titration: "Dose d'attaque x 4-6 semaines, puis entretien 5-15 mg/j", duree: "12-18 mois dans Basedow, puis tentative d'arrêt", niveau_preuve: "IA" },
                { classe: "Propylthiouracile (PTU) 300-600 mg/j", indication: "UNIQUEMENT si : T1 grossesse OU allergie thiamazole/carbimazole OU tempête thyroïdienne", note: "Hépatotoxicité grave → pas de traitement au long cours" },
                { classe: "Bêtabloquant (Propranolol 40-120 mg/j OU Aténolol 50-100 mg/j OU Bisoprolol 2.5-10 mg/j en alternative gériatrique)", indication: "Contrôle symptomatique (tachycardie, tremblements, anxiété)", note: "Propranolol inhibe aussi la conversion T4→T3 (double bénéfice) mais son caractère lipophile + non sélectif le rend moins maniable chez l'âgé (confusion, bronchospasme, hypotension). Chez ≥ 75 ans, privilégier bisoprolol cardiosélectif (moins de chutes, meilleure tolérance) — accepter la perte de l'effet anti-conversion T4→T3. Aténolol : hydrophile, moindre cardiosélectivité, déconseillé chez l'âgé (STOPP/START v3).", niveau_preuve: "IC" },
                { classe: "Lugol / Iode en pré-opératoire", indication: "10-14j avant thyroïdectomie pour réduire la vascularisation" }
            ],
            EVITER: [
                { classe: "Amiodarone si ATCD thyroïdien", raison: "Thyréotoxicose type 1 ou 2", gravite: "PRUDENCE — discussion cardio/endocrino" },
                { classe: "Lithium", raison: "Peut masquer puis démasquer thyrotoxicose", gravite: "SURVEILLANCE renforcée TSH" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_011", "BIO_012", "BIO_013", "BIO_014", "BIO_031"],
            REGLES: [
                { bio: "BIO_019", frequence: "Toutes les 4-6 semaines sous ATS × 3 mois, puis trimestriel", seuils: { cible: "TSH normale (peut rester basse longtemps, doser aussi FT4)", tempete: { condition: "TSH < 0.01 + FT4 > 50 + fièvre + tachycardie", action: "URGENCE VITALE — réanimation" }, syndrome: "SYND_019" } },
                {
                    bio: "BIO_012",
                    nom: "PNN",
                    frequence: "Avant ATS, puis toutes les 2-4 semaines × 3 mois, puis si fièvre/angine",
                    seuils: { critique: { max: 0.5, action: "Arrêt ATS immédiat, hospitalisation, ATB large spectre si fièvre" } },
                    note: "Agranulocytose : 0.1-0.5% sous thiamazole/carbimazole. Patient DOIT consulter en urgence si fièvre/angine.",
                    syndrome: "SYND_014"
                },
                { bio: "BIO_013", frequence: "Avant ATS, puis mensuel × 3 mois, puis trimestriel", seuils: { alerte: "> 3N → arrêt ATS, avis hépato" }, syndrome: "SYND_001" },
                { bio: "BIO_031", frequence: "Si FA + hyperthyroïdie", note: "FA thyrotoxique = anticoagulation selon CHA₂DS₂-VA + correction thyroïdienne", syndrome: "SYND_003" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_019", condition: "TSH < 0.01 + FT4 > 50 + signes systémiques", action: "Tempête thyroïdienne → réa, propranolol IV, PTU forte dose, Lugol, corticoïdes", syndrome: "SYND_019" },
                { bio: "BIO_012", condition: "PNN < 0.5 G/L", action: "ARRÊT ATS, NE JAMAIS réintroduire (ni même changer d'ATS)", syndrome: "SYND_014" },
                { bio: "BIO_013", condition: "> 5N", action: "Arrêt ATS, bilan hépatique complet", syndrome: "SYND_001" }
            ]
        }
    },

    "PAT_019": {
        ID: "PAT_019",
        NOM: "Dyslipidémie",
        REFERENCE: "ESC 2024 Dyslipidaemia | ESC 2021 CVD Prevention",
        SOURCES_EBM: {
                  "INITIER": {
                            "Statine": "ESC_DYSLIP_2019 §6.1, IA",
                            "Ézétimibe": "ESC_DYSLIP_2019 §6.2, IB",
                            "Anti-PCSK9": "ESC_DYSLIP_2019 §6.3, IA",
                            "Bempédoïque": "CLEAR Outcomes, IIaB"
                  },
                  "EVITER": {
                            "Gemfibrozil+Statine": "ESC_DYSLIP_2019 §6.5, CI"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Statine haute intensité", dci_exemples: ["Atorvastatine 40-80 mg", "Rosuvastatine 20-40 mg"], cibles_ldl: { tres_haut_risque: { max: 1.4, note: "mmol/L ET ≥ 50% de réduction" }, haut_risque: { max: 1.8 }, risque_modere: { max: 2.6 } }, niveau_preuve: "IA" },
                { classe: "Ézétimibe 10 mg/j", indication: "Ajout si cible non atteinte sous statine max", niveau_preuve: "IB" },
                { classe: "Anti-PCSK9 (Evolocumab 140 mg/2sem, Alirocumab 75-150 mg/2sem)", indication: "Si cible non atteinte sous statine + ézétimibe", niveau_preuve: "IA" },
                { classe: "Acide bempédoïque 180 mg/j", indication: "Intolérance aux statines confirmée", note: "CLEAR Outcomes : réduction MACE", niveau_preuve: "IIaB" },
                { classe: "Inclisiran 284 mg SC (J1, J90, puis /6 mois)", indication: "Non-atteinte cible ou observance difficile (injection semestrielle)", niveau_preuve: "IIaB" },
                { classe: "Fénofibrate 145-200 mg/j", indication: "Hypertriglycéridémie > 5.6 mmol/L (risque pancréatite)", note: "Seul fibrate associable aux statines. Pas de gemfibrozil.", bio_suivi: ["BIO_003", "BIO_018"] }
            ],
            EVITER: [
                { classe: "Gemfibrozil + Statine", raison: "Rhabdomyolyse par inhibition glucuronidation", gravite: "CONTRE-INDICATION ABSOLUE" },
                { classe: "Arrêt statine en prévention secondaire sans raison", raison: "Augmentation mortalité CV démontrée", gravite: "DECONSEILLE sauf intolérance vraie ou fin de vie" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_027", "BIO_013", "BIO_014", "BIO_018", "BIO_025", "BIO_019", "BIO_036"],
            REGLES: [
                { bio: "BIO_027", frequence: "6-8 sem post-introduction, puis annuel" },
                { bio: "BIO_013", frequence: "Avant statine, puis si myalgies ou > 6 mois", seuils: { alerte: "> 3N → arrêt statine" }, syndrome: "SYND_001" },
                { bio: "BIO_018", frequence: "Si myalgies sous statine", seuils: { alerte: "> 4-5N → arrêt statine", critique: "> 10N → rhabdomyolyse, hydratation urgente" }, syndrome: "SYND_002" },
                { bio: "BIO_025", frequence: "Annuel sous statine haute dose (signal hyperglycémie)" },
                { bio: "BIO_019", frequence: "Bilan initial (exclure hypothyroïdie = cause dyslipidémie)" },
                { bio: "BIO_036", frequence: "Si TG > 10 mmol/L", note: "Lipasémie = dépistage pancréatite aiguë" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_018", condition: "> 10N (> 1700 UI/L) sous statine", action: "Arrêt immédiat statine + fibrate. Hydratation massive. Surveillance rénale.", syndrome: "SYND_002" },
                { bio: "BIO_013", condition: "> 5N sous statine", action: "Arrêt statine, bilan étiologique complet", syndrome: "SYND_001" },
                { bio: "BIO_027", condition: "TG > 10 mmol/L", action: "Fénofibrate en urgence, rechercher pancréatite (lipase)", syndrome: "SYND_030" },
                { bio: "BIO_036", condition: "Lipasémie > 3N + douleurs abdominales", action: "Pancréatite aiguë — hospitalisation, jeûne, perfusion" }
            ]
        }
    },

    "PAT_020": {
        ID: "PAT_020",
        NOM: "Cancer / Tumeur solide",
        REFERENCE: "ESMO 2024 | ASCO 2024 | MASCC | ESC Cardio-Onco 2022",
        SOURCES_EBM: {
                  "INITIER": {
                            "Anthracyclines": "ESC_CARDIO_ONCO §5.1",
                            "Immunothérapie": "ESMO_2024 + ESC_CARDIO_ONCO §6"
                  }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Traitement spécifique onco = hors scope. Ce module se focalise sur la surveillance biologique des toxicités et les interactions médicamenteuses." }
            ],
            SURVEILLANCE_TOXICITE: [
                {
                    classe: "Chimiothérapie cytotoxique (générique)",
                    bio: ["BIO_009", "BIO_010", "BIO_011", "BIO_012"],
                    schema: "NFS avant chaque cure. Nadir PNN attendu J7-J14.",
                    risque: "Cytopénie → neutropénie fébrile, anémie, thrombopénie",
                    syndromes: ["SYND_005", "SYND_004", "SYND_014"],
                    conduite_neutropenie_febrile: "PNN < 0.5 + fièvre ≥ 38.3°C → ATB large spectre DANS L'HEURE (pipéracilline-tazobactam ou méropénème). G-CSF si indiqué."
                },
                {
                    classe: "Anthracyclines (Doxorubicine, Épirubicine)",
                    bio: ["BIO_034", "BIO_028"],
                    risque: "Cardiotoxicité dose-cumulative (dose max doxo = 450-550 mg/m²)",
                    schema: "ETT avant, à mi-traitement, en fin, et annuel × 5 ans. Troponine + BNP à chaque cycle.",
                    syndrome: "SYND_029",
                    conduite: "Chute FEVG > 10% ou FEVG < 50% → arrêt anthracyclines, IEC + bêtabloquant cardioprotecteur"
                },
                {
                    classe: "Immunothérapie (anti-PD1/PDL1 : Pembrolizumab, Nivolumab ; anti-CTLA4 : Ipilimumab)",
                    bio: ["BIO_019", "BIO_013", "BIO_014", "BIO_018", "BIO_025", "BIO_003", "BIO_036"],
                    risque: "Toxicité immune multi-organe : thyroïdite (TSH), hépatite (ASAT/ALAT), myosite (CPK), diabète auto-immun (glycémie/DKA), néphrite (créatinine), pancréatite (lipase)",
                    schema: "TSH + bilan hépatique + créatinine + glycémie AVANT chaque cure",
                    syndromes: ["SYND_012", "SYND_013", "SYND_001", "SYND_002", "SYND_018"],
                    conduite_grade3: "Corticoïdes 1-2 mg/kg prednisone, suspension immunothérapie"
                },
                {
                    classe: "Anti-VEGF (Bévacizumab, Sunitinib, Sorafénib)",
                    bio: ["BIO_003", "BIO_010"],
                    risque: "HTA, protéinurie, néphrotoxicité, thrombopénie, saignement",
                    schema: "TA + bandelette urinaire avant chaque cure. Créatinine mensuelle."
                },
                {
                    classe: "Thérapie ciblée anti-HER2 (Trastuzumab)",
                    bio: ["BIO_028", "BIO_034"],
                    risque: "Cardiotoxicité (réversible si détection précoce)",
                    schema: "ETT/FEVG tous les 3 mois pendant traitement"
                }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_010", "BIO_011", "BIO_012", "BIO_013", "BIO_014", "BIO_018", "BIO_019", "BIO_024", "BIO_025", "BIO_028", "BIO_032", "BIO_034", "BIO_035", "BIO_036"],
            REGLES: [
                { bio: "BIO_012", frequence: "Avant chaque cure, nadir J7-J14", seuils: { alerte: { max: 1.0, note: "Neutropénie grade 3" }, critique: { max: 0.5, note: "PNN < 0.5 → neutropénie fébrile si fièvre. ATB urgente." } }, syndrome: "SYND_014" },
                { bio: "BIO_010", frequence: "Avant chaque cure", seuils: { alerte: { max: 50, note: "Report cure si < 50 G/L" }, critique: { max: 20, note: "Transfusion CPA" } }, syndrome: "SYND_004" },
                { bio: "BIO_035", frequence: "Mensuel", note: "Albumine < 30 = mauvais pronostic, adaptation doses", syndrome: "SYND_033" },
                { bio: "BIO_019", frequence: "Avant chaque cure immunothérapie", note: "Thyroïdite immune (10-20%)", syndromes: ["SYND_012", "SYND_013"] },
                { bio: "BIO_034", frequence: "Avant et pendant anthracyclines/trastuzumab", note: "Élévation précoce = cardiotoxicité subclinique" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_012", condition: "< 0.5 + fièvre", action: "Neutropénie fébrile → ATB large spectre en 1h, hémocultures, G-CSF", syndrome: "SYND_014" },
                { bio: "BIO_019", condition: "TSH < 0.1 sous immunothérapie", action: "Thyroïdite immune → bêtabloquant, thiamazole si thyrotoxicose", syndrome: "SYND_012" },
                { bio: "BIO_013", condition: "> 5N sous immunothérapie", action: "Hépatite immune grade 3 → corticoïdes 1-2 mg/kg, suspension IO", syndrome: "SYND_001" },
                { bio: "BIO_025", condition: "> 15 mmol/L + cétose sous immunothérapie", action: "Diabète fulminant auto-immun → insuline urgente", syndrome: "SYND_018" },
                { bio: "BIO_028", condition: "NT-proBNP > 500 + chute FEVG sous anthracycline", action: "Arrêt anthracycline, IEC + BB cardioprotecteur", syndrome: "SYND_029" }
            ]
        }
    },

    "PAT_021": {
        ID: "PAT_021",
        NOM: "Ulcère Gastro-Duodénal (UGD)",
        REFERENCE: "ESGE 2024 | HAS | ACG 2024",
        SOURCES_EBM: {
                  "INITIER": {
                            "IPP": "ESGE_2024 §3.1, A",
                            "H. pylori": "ESGE_2024 §3.2, A"
                  },
                  "EVITER": {
                            "AINS": "STOPP F2",
                            "IPP long cours": "STOPP F1"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "IPP (Oméprazole 20-40mg, Pantoprazole 40mg, Ésoméprazole 40mg)", indication: "UGD actif : 4-8 semaines", note: "Demi-dose si prévention sous antithrombotique", niveau_preuve: "IA" },
                { classe: "Éradication H. pylori", indication: "Si HP+ (test respiration ou biopsie)", protocole: "Quadrithérapie bismuthée 10-14j (IPP + Bismuth + Métronidazole + Tétracycline) OU concomitante (IPP + Amoxicilline + Clarithromycine + Métronidazole) 14j", controle: "Test respiration ≥ 4 semaines post-ATB et ≥ 2 semaines post-IPP" }
            ],
            GASTROPROTECTION: {
                indications: [
                    "AINS + âge > 65 ans",
                    "AINS + antiagrégant ou anticoagulant",
                    "AINS + ATCD UGD ou hémorragie digestive",
                    "Antiagrégant + anticoagulant (double antithrombotique)",
                    "Corticoïdes + AINS"
                ],
                ref: "STOPP F1 : réévaluer systématiquement la poursuite IPP au-delà de 8 semaines"
            },
            EVITER: [
                { classe: "AINS", raison: "Récidive ulcéreuse, saignement digestif", gravite: "CONTRE-INDICATION si UGD actif ou récent < 3 mois" },
                { classe: "IPP > 8 semaines sans indication documentée", raison: "HypoMg, fractures ostéoporotiques, C. difficile, carence B12/Fe, pneumopathie, néphrite interstitielle", gravite: "DEPRESCRIRE — essayer step-down (demi-dose → à la demande → arrêt)", ref_stopp: "STOPP F1" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_020", "BIO_006", "BIO_021", "BIO_005"],
            REGLES: [
                { bio: "BIO_009", frequence: "Si saignement aigu → urgent, puis semestriel si antithrombotique", syndrome: "SYND_005" },
                { bio: "BIO_020", frequence: "Si anémie ferriprive récurrente", syndrome: "SYND_006" },
                { bio: "BIO_006", frequence: "Si IPP > 6 mois", seuils: { bas: { max: 0.75, note: "Arrêter IPP ou supplémenter Mg" } }, syndrome: "SYND_022" },
                { bio: "BIO_021", frequence: "Si IPP > 12 mois", note: "Malabsorption B12 (achlorhydrie)", syndrome: "SYND_007" },
                { bio: "BIO_005", frequence: "Annuel si IPP > 12 mois", note: "Hypocalcémie indirecte (via hypoMg)" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_009", condition: "Chute > 2 g/dL + méléna/hématémèse", action: "Urgence hémorragique — endoscopie < 24h, arrêt AINS/antithrombotique, IPP IV", syndrome: "SYND_005" },
                { bio: "BIO_006", condition: "< 0.5 mmol/L sous IPP", action: "Arrêt IPP, supplémenter Mg sulfate IV si symptômes, puis Mg per os", syndrome: "SYND_022" }
            ]
        }
    },

    "PAT_022": {
        ID: "PAT_022",
        NOM: "Asthme",
        REFERENCE: "GINA 2024 | SPLF 2021 (Asthme adulte) | HAS 2018 (Asthme adulte) | ERS/ATS 2020 (Severe Asthma) | Beers 2023 | STOPP/START v3",
        SOURCES_EBM: {
                  "INITIER": {
                            "CSI-Formotérol": "GINA_2024 Fig 3.1 Track 1"
                  },
                  "EVITER": {
                            "BB non sélectifs": "GINA_2024 §3.5 + Beers 2023",
                            "SABA seul": "GINA_2024 §3.1"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Track 1 (préféré GINA 2024) : CSI-Formotérol à la demande ET en fond", paliers: [
                    { step: 1, traitement: "CSI-formotérol faible dose à la demande seul" },
                    { step: 2, traitement: "CSI-formotérol faible dose quotidien + à la demande (MART)" },
                    { step: 3, traitement: "CSI-formotérol dose moyenne quotidien + à la demande" },
                    { step: 4, traitement: "CSI-formotérol dose moyenne + ajout LAMA (tiotropium)" },
                    { step: 5, traitement: "Biothérapie (anti-IgE, anti-IL5, anti-IL4R, anti-TSLP) + haute dose CSI" }
                ], note: "GINA 2024 élimine le SABA seul comme traitement de secours. Toujours associer CSI." },
                { classe: "Track 2 (alternative) : CSI + SABA de secours", note: "Si contre-indication formotérol ou préférence patient" }
            ],
            EVITER: [
                { classe: "Bêtabloquants non cardiosélectifs (Propranolol, Sotalol, Nadolol, Timolol)", raison: "Bronchospasme — CI absolue dans l'asthme", gravite: "CONTRE-INDICATION ABSOLUE", note: "BB cardiosélectifs (bisoprolol, nébivolol) = utilisables avec prudence si indication cardiaque forte (IC, post-IDM)" },
                { classe: "SABA seul sans CSI", raison: "GINA 2024 : augmente risque exacerbation sévère et décès", gravite: "OBSOLETE" },
                { classe: "AINS / Aspirine", raison: "Bronchospasme chez 5-10% asthmatiques (maladie de Widal/Samter)", gravite: "PRUDENCE — interroger ATCD" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_001", "BIO_009"],
            REGLES: [
                { bio: "BIO_001", note: "Hypokaliémie sous β2-agonistes à forte dose ± corticoïdes systémiques", frequence: "À chaque exacerbation sévère sous nébulisation", syndrome: "SYND_011" },
                { bio: "BIO_009", frequence: "Annuel (corticothérapie orale chronique → polyglobulie/anémie)" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_001", condition: "< 3.0 mmol/L sous nébulisations salbutamol", action: "Supplémenter K+ IV, scope cardiaque", syndrome: "SYND_011" }
            ]
        }
    },

    "PAT_023": {
        ID: "PAT_023",
        NOM: "BPCO",
        REFERENCE: "GOLD 2024 | SPLF 2023 (BPCO) | HAS 2014 BPCO | ERS/ATS 2017 | IMPACT trial | ETHOS trial | Beers 2023 | STOPP/START v3",
        SOURCES_EBM: {
                  "INITIER": {
                            "LAMA": "GOLD_2024 §3.4, A",
                            "Trithérapie": "GOLD_2024 + IMPACT + ETHOS, A",
                            "Azithromycine": "GOLD_2024 §3.6, B"
                  },
                  "EVITER": {
                            "CSI seul": "GOLD_2024 §3.4",
                            "BZD/Opioïdes": "GOLD_2024 §3.7 + Beers 2023"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Classification GOLD ABE et traitement initial",
                    groupes: [
                        { groupe: "A", critere: "Peu symptomatique + 0-1 exacerbation modérée", traitement: "Bronchodilatateur (LAMA ou LABA)" },
                        { groupe: "B", critere: "Symptomatique (mMRC ≥ 2 ou CAT ≥ 10) + 0-1 exacerbation", traitement: "LAMA + LABA" },
                        { groupe: "E", critere: "≥ 2 exacerbations modérées ou ≥ 1 hospitalisation", traitement: "LAMA + LABA ± CSI si Eo ≥ 300/µL" }
                    ]
                },
                { classe: "Trithérapie (LAMA + LABA + CSI)", indication: "Eo ≥ 300/µL et/ou ≥ 2 exacerbations modérées ou 1 hospitalisation/an", note: "IMPACT/ETHOS : réduction mortalité toutes causes sous trithérapie (NNT ~100 sur 1 an)", niveau_preuve: "IA" },
                { classe: "Azithromycine 250 mg/j ou 500 mg x3/sem", indication: "Prévention exacerbations chez ex-fumeur, après optimisation inhalateurs", ci: ["QTc allongé", "Insuffisance hépatique"], bio_suivi: ["BIO_031", "BIO_013"], note: "ECG avant, audiogramme annuel (ototoxicité)" },
                { classe: "Roflumilast 500 µg/j", indication: "BPCO sévère + phénotype exacerbateur + bronchite chronique malgré trithérapie", ci: ["Dépression sévère", "Poids < 60 kg"], note: "Effets indésirables : diarrhée, perte de poids, dépression" }
            ],
            EVITER: [
                { classe: "CSI seul (sans LABA)", raison: "Pas d'indication en monothérapie dans la BPCO", gravite: "ERREUR THERAPEUTIQUE" },
                { classe: "Benzodiazépines / Opioïdes", raison: "Dépression respiratoire, risque vital si BPCO sévère (VEMS < 50%)", gravite: "PRUDENCE EXTREME", note: "Exception : soins palliatifs, morphine faible dose pour dyspnée réfractaire" },
                { classe: "BB non cardiosélectifs", raison: "Bronchospasme (CI relative, moins stricte que dans asthme)", gravite: "PRUDENCE", note: "BB cardiosélectifs (bisoprolol) = tolérés et bénéfiques si IC associée" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_024", "BIO_011", "BIO_001", "BIO_013", "BIO_031"],
            REGLES: [
                { bio: "BIO_009", frequence: "Annuel", seuils: { haut: { min: 18, note: "Polyglobulie si hypoxémie chronique → discuter OLD + saignée" }, bas: { max: 12, note: "Anémie = facteur d'aggravation de la dyspnée" } } },
                { bio: "BIO_024", frequence: "Lors de chaque exacerbation", note: "CRP guide l'indication d'antibiothérapie (CRP > 20 mg/L = probable infection bactérienne)", syndrome: "SYND_023" },
                { bio: "BIO_001", frequence: "Si exacerbation sous nébulisations β2-agonistes + corticoïdes", syndrome: "SYND_011" },
                { bio: "BIO_013", frequence: "Trimestriel si azithromycine au long cours", note: "Hépatotoxicité rare", syndrome: "SYND_001" },
                { bio: "BIO_031", frequence: "Avant azithromycine/roflumilast + si association QT", syndrome: "SYND_003" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_024", condition: "CRP > 100 + purulence + dyspnée", action: "Exacerbation infectieuse sévère → ATB (amoxicilline-acide clav ou lévofloxacine) + corticoïdes systémiques 5j", syndrome: "SYND_023" },
                { bio: "BIO_001", condition: "< 3.0 sous nébulisations", action: "Supplémenter K+ IV, monitoring cardiaque", syndrome: "SYND_011" }
            ]
        }
    },

    "PAT_024": {
        ID: "PAT_024",
        NOM: "Goutte",
        REFERENCE: "EULAR 2023 | ACR 2020 | HAS",
        SOURCES_EBM: {
                  "INITIER": {
                            "Colchicine": "EULAR_2023 §4.1, A",
                            "Allopurinol": "EULAR_2023 §4.3, IA",
                            "Fébuxostat": "EULAR_2023 §4.3, IIaB + CARES"
                  },
                  "EVITER": {
                            "Diurétiques": "EULAR_GOUT_2023 §3.2 + ACR_GOUT_2020",
                            "Aspirine faible dose": "EULAR_GOUT_2023 §3.2"
                  }
        },
        TRAITEMENTS: {
            CRISE_AIGUE: [
                { classe: "Colchicine 0.5-1 mg (J1 : 1mg puis 0.5mg 1h après, puis 0.5mg/j)", indication: "Crise < 12h", note: "Adapter si DFG < 30 : réduire dose. CI si DFG < 10.", bio_suivi: ["BIO_003", "BIO_004"] },
                { classe: "AINS courte durée (3-5j max)", indication: "Si pas de CI (IC, IRC, UGD)", gravite_si_ci: "CI si PAT_002/PAT_003 ou DFG < 30" },
                { classe: "Corticoïdes (Prednisolone 30-35 mg/j x 3-5j)", indication: "Si CI colchicine + AINS" },
                { classe: "Infiltration intra-articulaire corticoïdes", indication: "Mono-arthrite accessible" }
            ],
            TRAITEMENT_FOND: [
                {
                    classe: "Allopurinol",
                    indication: "≥ 2 crises/an, tophus, arthropathie, lithiase urique, MRC stade 3+",
                    posologie: "Débuter 100 mg/j (50 mg si DFG < 30), titrer par paliers de 100 mg/mois",
                    cible: "Uricémie < 360 µmol/L (< 300 si tophus)",
                    note: "Initier sous couverture colchicine 0.5 mg/j pendant 3-6 mois",
                    bio_suivi: ["BIO_008", "BIO_003", "BIO_004"],
                    niveau_preuve: "IA"
                },
                { classe: "Fébuxostat", indication: "Intolérance allopurinol (allergie, rash)", note: "Prudence CV (CARES trial). Préférer allopurinol en première intention.", niveau_preuve: "IIaB" }
            ],
            EVITER: [
                { classe: "Diurétiques thiazidiques / de l'anse", raison: "Augmentent uricémie, déclenchent crises", gravite: "PRUDENCE — adapter hypouricémiant" },
                { classe: "Aspirine faible dose", raison: "Augmente uricémie (mais ne pas arrêter si indication CV)", gravite: "INFORMATION" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_008", "BIO_003", "BIO_004"],
            REGLES: [
                {
                    bio: "BIO_008",
                    nom: "Uricémie",
                    frequence: "Tous les 1-3 mois pendant titration, puis semestriel",
                    seuils: {
                        cible: { max: 360, note: "µmol/L — cible standard" },
                        cible_tophus: { max: 300, note: "µmol/L si tophus" },
                        seuil_crise: { min: 420, note: "µmol/L — discuter traitement de fond" }
                    },
                    syndrome: "SYND_016"
                }
            ]
        }
    },

    "PAT_025": {
        ID: "PAT_025",
        NOM: "Ostéoporose",
        REFERENCE: "IOF/ESCEO 2024 | NOGG 2024 | HAS 2024",
        SOURCES_EBM: {
                  "INITIER": {
                            "Bisphosphonates": "IOF_OSTEO_2024 §5.1, A",
                            "Dénosumab": "IOF_OSTEO_2024 §5.2, A",
                            "Tériparatide": "IOF_OSTEO_2024 §5.3, A",
                            "Vitamine D": "IOF_OSTEO_2024 §4, A"
                  },
                  "EVITER": {
                            "Corticoïdes": "IOF_OSTEO_2024 §6 + ACR Glucocorticoid-Induced OP 2022"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Bisphosphonates (Alendronate 70 mg/sem, Risédronate 35 mg/sem, Zolédronate 5 mg/an IV)", indication: "Première intention si T-score ≤ -2.5 ou fracture de fragilité", note: "Supplémenter en Ca (si apport < 1g/j) + Vit D avant", bio_suivi: ["BIO_005", "BIO_023", "BIO_003"] },
                { classe: "Dénosumab 60 mg SC /6 mois", indication: "Si intolérance BP ou DFG < 30", note: "REBOND à l'arrêt → relais bisphosphonate obligatoire. Risque hypocalcémie.", bio_suivi: ["BIO_005", "BIO_023"] },
                { classe: "Tériparatide / Romosozumab", indication: "Ostéoporose sévère (fractures multiples, T-score < -3)", condition: "20-24 mois max, puis relais bisphosphonate" },
                { classe: "Vitamine D + Calcium", indication: "Systématique en association avec tout traitement anti-ostéoporotique", bio_suivi: ["BIO_023", "BIO_005"] }
            ],
            EVITER: [
                { classe: "Corticoïdes au long cours", raison: "Ostéoporose cortisonique — prévention par bisphosphonate si corticothérapie > 3 mois", gravite: "SURVEILLANCE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_023", "BIO_005", "BIO_016", "BIO_003", "BIO_004"],
            REGLES: [
                { bio: "BIO_023", frequence: "Avant traitement, puis annuel", seuils: { cible: { min: 30, note: "ng/mL — objectif ≥ 30" }, carence: { max: 10, note: "Charge Vit D 100 000 UI/sem x4" } }, syndrome: "SYND_025" },
                { bio: "BIO_005", frequence: "Avant et 2-4 semaines après introduction dénosumab/BP IV", seuils: { alerte: { max: 2.0, note: "Corriger AVANT traitement" } }, syndrome: "SYND_020" }
            ]
        }
    },

    "PAT_026": {
        ID: "PAT_026",
        NOM: "Infection Urinaire",
        REFERENCE: "SPILF 2024 | IDSA 2024 | HAS",
        SOURCES_EBM: {
                  "INITIER": {
                            "Fosfomycine": "SPILF_2024 §2.1, A"
                  },
                  "EVITER": {
                            "FQ 1ère intention": "SPILF_2024 §2.3 + ANSM 2024",
                            "ATB bactériurie asymptomatique": "SPILF_2024 §1.2"
                  }
        },
        TRAITEMENTS: {
            CYSTITE_SIMPLE: [
                { classe: "Fosfomycine-trométamol 3g dose unique", indication: "Première intention", note: "Pas d'adaptation rénale", niveau_preuve: "IA" },
                { classe: "Pivmécillinam 400mg x2/j x 5j", indication: "Deuxième intention", note: "Pas de résistance croisée avec BL classiques" },
                { classe: "Nitrofurantoïne 100mg x3/j x 5j", indication: "Troisième intention", ci: ["DFG < 40 (France)", "Hépatopathie", "Usage > 14j (pneumopathie interstitielle, hépatotoxicité)"] }
            ],
            CYSTITE_A_RISQUE_COMPLICATION: {
                facteurs: ["Homme", "Grossesse", "Anomalie urologique", "DFG < 30", "Immunodépression"],
                traitement: "Après ECBU : adapter à l'antibiogramme. En probabiliste : Nitrofurantoïne 7j ou céfixime 7j"
            },
            PYELONEPHRITE: {
                probabiliste: "Ceftriaxone 1g IV/j OU Ciprofloxacine 500 mg x2/j PO (si pas de FQ dans les 6 mois)",
                duree: "7-10j (14j si compliquée)",
                adaptation: "À l'antibiogramme dès J2-J3"
            },
            EVITER: [
                { classe: "Fluoroquinolones en première intention cystite simple", raison: "EI graves : tendinopathie, neuropathie, rupture aortique, C. difficile, sélection résistances", gravite: "DECONSEILLE en première intention", ref: "ANSM 2024, EMA 2019" },
                { classe: "ATB si bactériurie asymptomatique", raison: "Pas de traitement sauf grossesse ou pré-geste urologique", gravite: "INUTILE — sélection résistances", note: "Fréquent chez le sujet âgé institutionnalisé : NE PAS TRAITER" },
                { classe: "Nitrofurantoïne au long cours (> 14j)", raison: "Pneumopathie interstitielle, hépatotoxicité", gravite: "CONTRE-INDICATION" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_011", "BIO_012", "BIO_024", "BIO_032", "BIO_003", "BIO_004"],
            REGLES: [
                { bio: "BIO_024", frequence: "À la présentation puis J3", note: "CRP guide la gravité", seuils: { pyelonephrite: { min: 20 }, severe: { min: 100 } }, syndrome: "SYND_023" },
                { bio: "BIO_032", frequence: "Si suspicion pyélonéphrite/sepsis", seuils: { sepsis: { min: 2, note: "PCT > 2 → probable infection bactérienne systémique" }, choc: { min: 10, note: "Choc septique" } }, syndrome: "SYND_024" },
                { bio: "BIO_003", frequence: "Systématique (adaptation ATB au DFG)", note: "Fosfomycine = pas d'adaptation. Nitrofurantoïne CI si DFG < 40. FQ : adapter si DFG < 30." },
                { bio: "BIO_011", frequence: "Si sepsis ou immunodépression", note: "Leucocytose ou leucopénie = marqueur de gravité" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_032", condition: "PCT > 2 + défaillance organe", action: "Sepsis — ATB IV urgente, remplissage, lactates", syndrome: "SYND_024" },
                { bio: "BIO_003", condition: "Hausse créatinine > 50%", action: "IRA sur pyélonéphrite → échographie (rechercher obstruction), hydratation" }
            ]
        }
    },

    "PAT_027": {
        ID: "PAT_027",
        NOM: "Insomnie",
        REFERENCE: "ESRS 2023 | ACP 2024 | Beers 2023 | STOPP/START v3",
        SOURCES_EBM: {
                  "INITIER": {
                            "TCC-I": "ACP 2024 §3.1, A"
                  },
                  "EVITER": {
                            "BZD": "STOPP D5 + Beers 2023"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "TCC-I (Thérapie Cognitivo-Comportementale de l'Insomnie)", indication: "PREMIÈRE INTENTION — avant tout traitement pharmacologique", niveau_preuve: "IA" },
                { classe: "Mélatonine LP 2 mg", indication: "Si TCC-I insuffisante, sujet ≥ 55 ans", note: "Faible effet, bon profil de sécurité" },
                { classe: "Trazodone 25-50 mg", indication: "Insomnie + symptômes dépressifs", note: "Pas de données solides sur l'insomnie pure" }
            ],
            EVITER: [
                { classe: "Benzodiazépines", raison: "Sédation résiduelle, chutes, confusion, dépendance, aggravation apnées du sommeil", gravite: "DECONSEILLE chez le sujet âgé", ref_stopp: "STOPP D5", ref_beers: "AGS 2023", note: "Si déjà en cours > 4 semaines : sevrage progressif sur 4-8 semaines" },
                { classe: "Benzodiazépines apparentées (Zolpidem, Zopiclone)", raison: "Mêmes risques que BZD : chutes, confusion, dépendance", gravite: "DECONSEILLE chez le sujet âgé" },
                { classe: "Antihistaminiques H1 sédatifs (Hydroxyzine, Doxylamine)", raison: "Charge anticholinergique élevée, confusion, rétention urinaire", gravite: "DECONSEILLE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019"],
            REGLES: [
                { bio: "BIO_019", note: "Exclure dysthyroïdie (insomnie d'hyperthyroïdie)" }
            ]
        }
    },

    "PAT_028": {
        ID: "PAT_028",
        NOM: "Vertiges",
        REFERENCE: "Bárány Society 2023 | HAS",
        SOURCES_EBM: {
                  "INITIER": {
                            "Manoeuvre Epley": "Bárány Society 2023 §3.1, A",
                            "Bétahistine": "Cochrane Review 2011 + HAS_FR"
                  },
                  "EVITER": {
                            "Antivertigineux": "STOPP_START_V3 + HAS_FR — pas d'indication > 3-5 jours",
                            "Benzodiazépines": "STOPP_START_V3 D5 + BEERS_2023"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Manœuvre de repositionnement (Epley/Sémont)", indication: "VPPB : première intention" },
                { classe: "Bétahistine 24-48 mg/j", indication: "Maladie de Ménière", note: "Efficacité débattue" }
            ],
            EVITER: [
                { classe: "Antivertigineux au long cours (Acétylleucine, Méclozine)", raison: "Retardent la compensation vestibulaire, sédation", gravite: "DECONSEILLE > 3-5 jours" },
                { classe: "Benzodiazépines", raison: "Sédation, chutes, retardent compensation", gravite: "DECONSEILLE > 48h" }
            ],
            DEPRESCRIPTION: {
                description: "Rechercher iatrogénie : antihypertenseurs (hypoTA), antiépileptiques, opioïdes, BZD, neuroleptiques"
            }
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_002", "BIO_019", "BIO_009"],
            REGLES: [
                { bio: "BIO_002", note: "Hyponatrémie = cause fréquente de vertiges chez le sujet âgé" },
                { bio: "BIO_009", note: "Anémie sévère peut mimer des vertiges" }
            ]
        }
    },

    "PAT_029": {
        ID: "PAT_029",
        NOM: "Maladie Rénale Chronique (MRC)",
        REFERENCE: "KDIGO 2024 | ESC 2023 | ADA 2025",
        SOURCES_EBM: {
                  "INITIER": {
                            "IEC/ARA2": "KDIGO_2024 §3.1, IA",
                            "iSGLT2": "KDIGO_2024 §3.3, IA",
                            "Finerenone": "KDIGO_2024 §3.8 + FIDELIO + FIGARO, IA",
                            "GLP-1 RA": "KDIGO_2024 §3.9, IB + FLOW",
                            "Statine": "KDIGO_2024 §3.10, IA"
                  },
                  "EVITER": {
                            "AINS": "KDIGO_CKD_2024 §4.1",
                            "IEC + ARA2": "ONTARGET + KDIGO_CKD_2024 — pas de double blocage SRAA",
                            "Metformine": "ADA_2025 §9.4 — CI si DFG < 30 mL/min"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "IEC ou ARA2",
                    indication: "Si albuminurie ou HTA. Première ligne protectrice rénale.",
                    note: "Ne PAS arrêter si hausse créatinine ≤ 30% après introduction. Ne PAS arrêter si K+ < 5.5 (utiliser chélateurs K+).",
                    niveau_preuve: "IA"
                },
                {
                    classe: "iSGLT2",
                    indication: "Tous les patients MRC avec albuminurie (ACR ≥ 200 mg/g) — AVEC ou SANS diabète (KDIGO 2024)",
                    note: "Initier si DFG ≥ 20 mL/min. Poursuivre même si DFG descend < 20 en cours de traitement. Bénéfice cardio-rénal indépendant de la glycémie.",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Finerenone (ARM non stéroïdien)",
                    indication: "DT2 + MRC avec albuminurie résiduelle sous IEC/ARA2 max + iSGLT2",
                    note: "Surveillance K+ rapprochée (J7, M1, trimestriel). K+ < 5.0 pour initier.",
                    bio_suivi: ["BIO_001", "BIO_003"],
                    niveau_preuve: "IA (KDIGO 2024)"
                },
                {
                    classe: "GLP-1 RA (Sémaglutide)",
                    indication: "DT2 + MRC — bénéfice rénal prouvé (FLOW trial)",
                    niveau_preuve: "IB"
                },
                {
                    classe: "Statine",
                    indication: "Prévention CV dans MRC non dialysé (KDIGO : ne pas initier si dialysé)",
                    niveau_preuve: "IA"
                }
            ],
            NEPHROTOXIN_STEWARDSHIP: {
                description: "KDIGO 2024 : programme de vigilance néphrotoxiques",
                regles: [
                    "Éviter AINS (CI si DFG < 30, prudence extrême si 30-60)",
                    "Éviter aminosides (sauf si pas d'alternative et courte durée)",
                    "Éviter produits de contraste iodés si DFG < 30 (ou prémédication + hydratation)",
                    "Adapter posologie de TOUS les médicaments éliminés par voie rénale",
                    "Éducation patient : 'sick day rules' — arrêter temporairement IEC/ARA2, iSGLT2, metformine, diurétiques en cas de déshydratation/fièvre/gastroentérite"
                ],
                sick_day_rules: ["IEC/ARA2", "iSGLT2", "Metformine", "Diurétiques", "AINS"],
                note: "Reprendre dès que patient hydraté et stable"
            },
            EVITER: [
                { classe: "AINS", raison: "Néphrotoxicité directe", gravite: "CONTRE-INDICATION si DFG < 30" },
                { classe: "Metformine si DFG < 30", raison: "Acidose lactique", gravite: "CONTRE-INDICATION" },
                { classe: "IEC + ARA2 simultanément", raison: "Pas de bénéfice, risque IRA + hyperK", gravite: "CONTRE-INDICATION" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_003", "BIO_004", "BIO_001", "BIO_002", "BIO_005", "BIO_009", "BIO_023", "BIO_008", "BIO_035"],
            REGLES: [
                {
                    bio: "BIO_004",
                    nom: "DFG",
                    frequence: "Selon stade : G1-G2 annuel, G3a semestriel, G3b trimestriel, G4-G5 mensuel à trimestriel",
                    seuils: {
                        stade_3a: { min: 45, max: 59 },
                        stade_3b: { min: 30, max: 44 },
                        stade_4: { min: 15, max: 29, note: "Avis néphrologue systématique" },
                        stade_5: { max: 15, note: "Préparation dialyse/transplantation" }
                    },
                    syndrome: "SYND_015"
                },
                {
                    bio: "BIO_001",
                    nom: "Kaliémie",
                    frequence: "J7-J14 après introduction/modification IEC-ARA2-finerenone, puis selon stade DFG",
                    note: "Chélateurs K+ (Patiromer, SZC) pour maintenir SRAA/ARM",
                    syndrome: "SYND_010"
                },
                { bio: "BIO_005", frequence: "Trimestriel si DFG < 45", note: "Trouble phospho-calcique (PTH si besoin)" },
                { bio: "BIO_023", frequence: "Semestriel", note: "Carence Vit D fréquente dans MRC", syndrome: "SYND_025" },
                { bio: "BIO_009", frequence: "Trimestriel si DFG < 45", note: "Anémie de l'IRC — EPO si Hb < 10 g/dL et après correction carence martiale" }
            ]
        },

        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_004", condition: "Chute DFG > 25% en < 3 mois", action: "Rechercher : déshydratation, obstruction, médicament néphrotoxique, sténose artère rénale" },
                { bio: "BIO_001", condition: "> 6.0", action: "Arrêt ARM/finerenone, chélateur K+, ECG", syndrome: "SYND_010" },
                { bio: "BIO_005", condition: "< 2.0 mmol/L", action: "Supplémenter Ca + Vit D, PTH", syndrome: "SYND_020" }
            ]
        }
    },

    "PAT_030": {
        ID: "PAT_030",
        NOM: "Soins Palliatifs",
        REFERENCE: "SFAP 2024 | EAPC 2023 | NICE End of Life 2024",
        SOURCES_EBM: {
                  "INITIER": {
                            "Déprescription": "SFAP_2024 + EAPC_2023",
                            "Morphine": "SFAP_2024 §3.1 + EAPC_2023 §4",
                            "Anxiolytiques": "SFAP_2024 §3.3"
                  },
                  "EVITER": {
                            "Statines": "SFAP_2024 + EAPC_2023 — aucun bénéfice en fin de vie",
                            "Bisphosphonates": "EAPC_2023 — bénéfice à ≥ 6 mois",
                            "Antihypertenseurs": "SFAP_2024 — si PAS < 110 ou pronostic < 3 mois",
                            "Hypoglycémiants": "ADA_2025 Older Adults + SFAP_2024",
                            "Anticoagulants": "EAPC_2023 — réévaluer bénéfice/risque"
                  }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Objectif unique = CONFORT. Chaque médicament doit justifier son maintien par un bénéfice symptomatique immédiat." }
            ],
            DEPRESCRIPTION: {
                a_arreter_systematiquement: [
                    { classe: "Statines", raison: "Aucun bénéfice en fin de vie. Arrêt bien toléré." },
                    { classe: "Bisphosphonates", raison: "Bénéfice à ≥ 6 mois, inutile si pronostic court" },
                    { classe: "Vitamines (D, B12, fer PO)", raison: "Sauf carence symptomatique (asthénie invalidante répondant au traitement)" },
                    { classe: "Antihypertenseurs", raison: "Si PAS < 110 ou pronostic < 3 mois (risque chute/malaise > bénéfice)" },
                    { classe: "Hypoglycémiants (sulfamides, metformine)", raison: "Relâcher cible glycémique, éviter UNIQUEMENT l'hyperglycémie symptomatique (polyurie, confusion)" },
                    { classe: "Anticoagulants (prévention primaire)", raison: "Réévaluer bénéfice/risque (saignement > prévention)" },
                    { classe: "Antidépresseurs si pas de bénéfice perçu", raison: "Sevrage progressif" }
                ],
                a_conserver: [
                    { classe: "Morphine/Opioïdes", indication: "Douleur, dyspnée réfractaire. Titration progressive. Pas de plafond de dose si bien toléré." },
                    { classe: "Antiémétiques (Métoclopramide, Ondansétron, Halopéridol low-dose)", indication: "Nausées" },
                    { classe: "Anxiolytiques (Midazolam SC)", indication: "Anxiété, agitation terminale" },
                    { classe: "Scopolamine butylbromide 20-60 mg/j SC", indication: "Encombrements bronchiques terminaux" },
                    { classe: "Corticoïdes (Dexaméthasone 4-8 mg/j)", indication: "Dyspnée, anorexie, HTIC, occlusion, douleur inflammatoire" },
                    { classe: "Laxatifs", indication: "Systématique si opioïdes" },
                    { classe: "IPP", indication: "Si saignement digestif actif ou GERD symptomatique. Sinon arrêter." },
                    { classe: "Antiépileptique (si épilepsie active)", indication: "Maintenir pour éviter crises. Voie SC (midazolam) ou rectale si PO impossible." }
                ]
            },
            EVITER: [
                { classe: "Statines", raison: "Aucun bénéfice en fin de vie (espérance < 6-12 mois) ; arrêt bien toléré (Kutner 2015 JAMA Intern Med)", gravite: "DEPRESCRIRE" },
                { classe: "Bisphosphonates", raison: "Bénéfice à ≥ 6 mois — inutile si pronostic court", gravite: "DEPRESCRIRE" },
                { classe: "Antihypertenseurs (si PAS < 110 ou pronostic < 3 mois)", raison: "Risque chute/malaise > bénéfice", gravite: "DEPRESCRIRE" },
                { classe: "Hypoglycémiants (sulfamides, metformine, insuline basale fortes doses)", raison: "Cible glycémique relâchée, éviter UNIQUEMENT hyperglycémie symptomatique. Risque hypoglycémie majeur en fin de vie.", gravite: "REEVALUER — relâcher cible" },
                { classe: "Anticoagulants en prévention primaire (FA sans ATCD AVC)", raison: "Saignement > prévention en fin de vie", gravite: "REEVALUER bénéfice/risque" },
                { classe: "Antidépresseurs si pas de bénéfice perçu", raison: "Sevrage progressif", gravite: "DEPRESCRIRE" },
                { classe: "Vitamines (D, B12, fer PO) sans carence symptomatique", raison: "Pas de bénéfice symptomatique immédiat", gravite: "DEPRESCRIRE" },
                { classe: "Béta-bloquants (si pas d'IC/post-IDM aigu)", raison: "Évaluer bénéfice symptomatique vs risque chute/bradycardie", gravite: "REEVALUER" },
                { classe: "IPP au long cours sans saignement actif/GERD symptomatique", raison: "Pas de bénéfice symptomatique en fin de vie", gravite: "DEPRESCRIRE" }
            ],
            HYDRATATION: {
                note: "Hydratation en fin de vie : débat éthique. Hypodermoclyse 500-1000 mL/24h peut soulager soif/confusion par déshydratation. À discuter avec patient/famille."
            }
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_025", "BIO_035", "BIO_005"],
            REGLES: [
                { note: "PRINCIPE : bilans biologiques NON systématiques en fin de vie. Ne prélever QUE si le résultat modifie la prise en charge de CONFORT." },
                { bio: "BIO_005", note: "Hypercalcémie maligne = cause traitable de confusion en fin de vie. Doser si confusion + cancer connu.", syndrome: "SYND_021" },
                { bio: "BIO_025", note: "Glycémie capillaire si diabète connu et symptômes. Cible 5-15 mmol/L (pas de cible stricte)." },
                { bio: "BIO_009", note: "Hb si symptôme répondant potentiellement à une transfusion (dyspnée d'effort, tachycardie)" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_005", condition: "> 3.0 mmol/L + confusion en contexte cancer", action: "Discuter hydratation + bisphosphonate IV SI amélioration confort attendue", syndrome: "SYND_021" },
                { bio: "BIO_025", condition: "< 3.0 mmol/L", action: "Resucrage si conscient, G10% SC/IV si inconscient. Arrêter insuline/sulfamide.", syndrome: "SYND_017" }
            ]
        }
    },

    "PAT_031": {
        ID: "PAT_031",
        NOM: "Fragilité / Sénescence",
        REFERENCE: "STOPP/START v3 (2023) | Beers 2023 | NICE Multimorbidity 2024 | Consensus Gériatrique International",
        SOURCES_EBM: {
                  "INITIER": {
                            "Déprescription": "STOPP_START_V3 + BEERS_2023 + NICE Multimorbidity 2024"
                  },
                  "EVITER": {
                            "Benzodiazépines": "STOPP_START_V3 D5 + BEERS_2023",
                            "IPP": "STOPP_START_V3 F1",
                            "Statines": "Contexte fragile / palliatif — discuter arrêt",
                            "Antihypertenseurs": "STOPP_START_V3 B6",
                            "Sulfamides": "ADA_2025 Older Adults + STOPP_START_V3 J1",
                            "Anticholinergiques": "STOPP_START_V3 D1-D5 + BEERS_2023",
                            "Antipsychotiques": "STOPP_START_V3 D3 + FDA Black Box"
                  }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Déprescription = acte thérapeutique chez le sujet fragile. La polymédication (≥ 5 médicaments) augmente le risque iatrogène de façon exponentielle." }
            ],
            DEPRESCRIPTION_CIBLES: [
                { classe: "Benzodiazépines", action: "Sevrage progressif sur 4-8 semaines si > 4 semaines de traitement", ref: "STOPP D5" },
                { classe: "IPP > 8 semaines sans indication claire", action: "Réduction progressive puis arrêt", ref: "STOPP F1" },
                { classe: "Statines", action: "Discuter arrêt si espérance de vie < 2-3 ans et pas d'événement CV récent", ref: "Contexte fragile/palliatif" },
                { classe: "Antihypertenseurs", action: "Déprescrire si PAS < 120 ou symptômes (vertiges, chutes)", ref: "STOPP B6" },
                { classe: "Hypoglycémiants (sulfamides)", action: "Déprescrire en priorité. Cible HbA1c individualisée : < 8% (complexe) ou < 8.5% (très fragile)", ref: "ADA 2025 §13 Older Adults" },
                { classe: "Anticholinergiques (ACB ≥ 3)", action: "Réduire charge anticholinergique totale", ref: "STOPP D1-D5" },
                { classe: "Antipsychotiques > 12 semaines", action: "Réévaluer indication, sevrage progressif", ref: "STOPP D3" }
            ],
            SURVEILLANCE_GERIATRIQUE: {
                scores: ["CFS (Clinical Frailty Scale)", "Score ACB", "Score CIA", "Tisdale (risque QTc)"],
                bio_cible: ["BIO_009", "BIO_023", "BIO_035", "BIO_025", "BIO_003"],
                regles: [
                    { bio: "BIO_035", note: "Albumine < 30 g/L = dénutrition sévère, adapter posologie médicaments à forte liaison protéique", syndrome: "SYND_033" },
                    { bio: "BIO_023", note: "Carence Vit D quasi-universelle chez le sujet âgé. Supplémenter systématiquement.", syndrome: "SYND_025" },
                    { bio: "BIO_009", note: "Anémie fréquente et souvent multifactorielle (carence Fe, B12, inflammation, IRC)" },
                    { bio: "BIO_025", note: "Cible glycémique assouplie. Éviter hypoglycémie en priorité." }
                ]
            },
            EVITER: [
                { classe: "Benzodiazépines / Z-drugs", raison: "Chutes, confusion, dépendance — STOPP D5 + Beers 2023. Sevrage progressif obligatoire si > 4 sem.", gravite: "EVITER", ref_stopp: "STOPP D5 ; Beers 2023" },
                { classe: "IPP > 8 semaines sans indication claire", raison: "HypoMg, fractures, C. difficile, B12, néphrite interstitielle — STOPP F1", gravite: "DEPRESCRIRE", ref_stopp: "STOPP F1" },
                { classe: "Statines (espérance de vie < 2-3 ans, prévention primaire)", raison: "Bénéfice CV non démontré chez sujet fragile/EHPAD ; effets secondaires (myalgies, asthénie, troubles cognitifs) impactant la qualité de vie", gravite: "REEVALUER — discuter arrêt en concertation" },
                { classe: "Antihypertenseurs (si PAS < 120 mmHg ou vertiges/chutes)", raison: "Sur-traitement antihypertenseur — TA cible plus permissive chez fragile (PAS < 150 acceptable)", gravite: "DEPRESCRIRE le plus hypotenseur en premier", ref_stopp: "STOPP B6" },
                { classe: "Sulfamides hypoglycémiants (Glibenclamide, Glimépiride, Glipizide, Gliclazide)", raison: "Risque hypoglycémie sévère majeur chez sujet âgé fragile — Glibenclamide formellement à éviter (Beers 2023, STOPP J1). Préférer iDPP4, GLP-1, iSGLT2 ou metformine si DFG > 30.", gravite: "EVITER", ref_stopp: "Beers 2023 ; STOPP J1 ; ADA 2025 §13" },
                { classe: "Anticholinergiques (ACB cumulé ≥ 3)", raison: "Charge anticholinergique = ↓ cognition, sécheresse, rétention urinaire, chutes, confusion. Réduire score ACB total.", gravite: "REDUIRE LA CHARGE TOTALE", ref_stopp: "STOPP D1-D5 ; Beers 2023" },
                { classe: "Antipsychotiques > 12 semaines", raison: "Risque AVC + surmortalité chez patients âgés (FDA Black Box). Sevrage progressif si possible.", gravite: "REEVALUER", ref_stopp: "STOPP D3 ; Beers 2023 ; FDA Black Box" },
                { classe: "AINS au long cours", raison: "UGD, IRA, HTA, IC — fortement déconseillés chez fragile", gravite: "EVITER", ref_stopp: "STOPP F2 ; Beers 2023" },
                { classe: "Opioïdes forts en chronique sans réévaluation", raison: "Sédation, chutes, constipation, dépression respiratoire", gravite: "REEVALUER régulièrement (durée minimale efficace)" },
                { classe: "Bisphosphonates (espérance < 1-2 ans)", raison: "Bénéfice anti-fracturaire à ≥ 1-2 ans — discuter arrêt si pronostic court ou intolérance", gravite: "REEVALUER" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_023", "BIO_035", "BIO_025", "BIO_003", "BIO_004", "BIO_019", "BIO_021"],
            REGLES: [
                { bio: "BIO_035", frequence: "Trimestriel si dénutrition connue", syndrome: "SYND_033" },
                { bio: "BIO_023", frequence: "Semestriel", syndrome: "SYND_025" },
                { bio: "BIO_021", frequence: "Annuel" }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PAT_032 → Dépression
    // ═══════════════════════════════════════════════════════════════════════════
    "PAT_032": {
        ID: "PAT_032",
        NOM: "Dépression (sujet âgé / Late-Life Depression)",
        REFERENCE: "Houix M et al. SFGG/SF3PA/SFPC consensus Eur Psychiatry 2026 (DOI 10.1192/j.eurpsy.2026.12206) | NICE CG90 2022 | APA 2023 | STOPP/START v3 | Beers 2023 | CANMAT 2016",
        SOURCES_EBM: {
            "INITIER": {
                "ISRS sertraline 1ère intention": "SFGG/SF3PA/SFPC 2026 item 11 — meilleur rapport bénéfice/risque",
                "ISRS citalopram/escitalopram": "SFGG/SF3PA/SFPC 2026 item 11 + Kok & Reynolds JAMA 2017",
                "Mirtazapine 1ère ligne (orexigène/insomnie)": "SFGG/SF3PA/SFPC 2026 item 12 — alternative ISRS si dénutrition ou insomnie",
                "IRSN venlafaxine/duloxétine 2e ligne": "SFGG/SF3PA/SFPC 2026 item 13 — si échec ISRS/mirtazapine, hors HTA non contrôlée",
                "Vortioxétine 2e-3e ligne": "SFGG/SF3PA/SFPC 2026 item 47 — bénéfice cognitif (Katona 2012, FOCUS, Moon 2023, VESPA 2024)"
            },
            "EVITER": {
                "Tricycliques 1ère ligne (sauf clomipramine 4e ligne)": "SFGG/SF3PA/SFPC 2026 items 9 + 55 + STOPP D1 + Beers 2023 + PRISCUS",
                "Paroxétine (ACB élevé)": "SFGG/SF3PA/SFPC 2026 items 14 + 40 + Beers 2023",
                "Citalopram > 20 mg / Escitalopram > 10 mg si arythmie/QT/hypoK+": "SFGG/SF3PA/SFPC 2026 item 30 + ANSM 2011",
                "Miansérine (préférer mirtazapine)": "SFGG/SF3PA/SFPC 2026 item 10 — alerte ANSM agranulocytose, hépatite, sédation, convulsions",
                "Agomélatine ≥ 75 ans": "SFGG/SF3PA/SFPC 2026 — RCP Valdoxan 2025 (manque de données + hépatotoxicité)",
                "Tianeptine": "SFGG/SF3PA/SFPC 2026 — risque dépendance (PSUSA EMA 2019)",
                "IMAO (sauf 4e ligne hospitalière)": "SFGG/SF3PA/SFPC 2026 + Beers 2023",
                "Benzodiazépines pour dépression": "SFGG/SF3PA/SFPC 2026 + STOPP D5",
                "Combinaison 2 ISRS / 2 IRSN / ISRS+IRSN / ISRS-IRSN+IMAO/TCA": "SFGG/SF3PA/SFPC 2026 item 50",
                "Combinaison 3 antidépresseurs": "SFGG/SF3PA/SFPC 2026 item 49 — JAMAIS"
            }
        },
        TRAITEMENTS: {
            FRAMEWORK_PRESCRIPTION: {
                note: "AVANT toute prescription d'antidépresseur chez ≥ 75 ans (ou ≥ 65 ans + ≥ 3 comorbidités) — SFGG/SF3PA/SFPC 2026 items 1-8 :",
                checklist: [
                    "1. Comorbidités CV : ECG de référence (arythmie, QT prolongé), TA debout/couché",
                    "2. Recherche signes de trouble neurocognitif (plainte mnésique, perte autonomie)",
                    "3. Revue médicaments : ACB cumulatif, sédatifs, QT-allongeurs, anticoagulants/antiagrégants, tramadol, inducteurs/inhibiteurs CYP (table HUG)",
                    "4. Médicaments dépressogènes : corticoïdes, antirétroviraux, antipaludéens, hormonothérapie, immunothérapie — alternatives ou ↓ dose",
                    "5. Cause organique : SAOS, hypothyroïdie, hypercortisolisme, neurologique, auto-immun, addiction",
                    "6. Comorbidités : hyponatrémie < 130, glaucome angle fermé, rétention urinaire, saignement récent < 1 mois",
                    "7. IRC (DFG < 60) ou hépatopathie (cirrhose, hépatite)",
                    "8. Risque de chutes : chute < 6 mois, test de marche"
                ]
            },
            PRINCIPES: [
                { note: "Algorithme stepped-care (SFGG/SF3PA/SFPC 2026) : 1) ISRS sertraline → 2) si échec, IRSN ou mirtazapine → 3) si partiel, ISRS/IRSN+mirtazapine ou vortioxétine → 4) augmentation aripiprazole/lithium/quétiapine/lamotrigine → 5) ECT (gold standard si sévère/résistant)" },
                { note: "Initier à 25-50 % de la dose cible, augmenter toutes les 1-2 sem ; cible thérapeutique à atteindre en 4-12 sem (item 17). Réévaluer dose à 4 puis 12 sem." },
                { note: "Doses MAX RCP (item 18) : sertraline 200 / escitalopram 10 / citalopram 20 / fluvoxamine 300 / duloxétine 120 / venlafaxine 300 / milnacipran 100 / mirtazapine 45 / miansérine 90 / vortioxétine 20 mg/j." },
                { note: "Surveillance clinique tolérance + efficacité : 1-3 mois jusqu'à stabilité puis 3-6 mois (items 19-20)." },
                { note: "Durée minimale (item 24) : 1er épisode = 1 an post-rémission ; 2e = 2 ans ; ≥ 3e = 3 ans à vie." },
                { note: "Arrêt : décroissance 25 % de la dose initiale sur 2-5 sem (item 25). Demi-vie < 24 h (venlafaxine, duloxétine, paroxétine) = risque syndrome d'arrêt." }
            ],
            INITIER: [
                { classe: "Sertraline (ISRS — 1ère intention)", posologie: "25-50 mg/j initiation, max 200 mg/j", note: "Meilleur rapport bénéfice/risque chez âgé (Kok & Reynolds JAMA 2017). Profil QT favorable.", ref: "SFGG/SF3PA/SFPC 2026 item 11", niveau_preuve: "A" },
                { classe: "Citalopram / Escitalopram (ISRS — alternatives 1ère intention)", posologie: "Citalopram 10-20 mg/j (max 20) ; Escitalopram 5-10 mg/j (max 10)", note: "Surveillance ECG si âgé/cardiopathie (Risk_KR CredibleMeds). CI si arythmie, QT prolongé, hypokaliémie.", ref: "SFGG/SF3PA/SFPC 2026 items 11 + 30", niveau_preuve: "A" },
                { classe: "Mirtazapine (NaSSA — 1ère ligne si insomnie/dénutrition)", posologie: "15 mg/j initiation (au coucher), titration vers 30-45 mg/j", note: "Effet orexigène + sédatif utile chez le sujet âgé dénutri ou insomniaque. Moins de SIADH que ISRS/IRSN.", ref: "SFGG/SF3PA/SFPC 2026 items 12 + 45", niveau_preuve: "A" },
                { classe: "IRSN (Venlafaxine, Duloxétine, Milnacipran) — 2e ligne", posologie: "Venlafaxine 37.5-75 mg/j initiation (max 300, surveillance TA si > 150 mg/j) ; Duloxétine 30-60 mg/j (max 120)", note: "À envisager après échec ISRS/mirtazapine. CI si HTA non contrôlée. Vigilance niveau anxiété initial. Préférer duloxétine si arythmie ou QT à risque (item 59).", ref: "SFGG/SF3PA/SFPC 2026 items 13 + 28", niveau_preuve: "A" },
                { classe: "Vortioxétine (multimodal 5-HT)", posologie: "5 mg/j initiation puis 10 mg/j à 1-2 sem, max 20 mg/j", note: "Bénéfice cognitif démontré (Katona 2012 FOCUS). Indication 2e-3e ligne après échec ISRS/IRSN. Profil QT favorable.", ref: "SFGG/SF3PA/SFPC 2026 item 47", niveau_preuve: "B" },
                { classe: "Combinaison ISRS/IRSN + Mirtazapine (« California Rocket Fuel »)", posologie: "Selon doses individuelles", note: "Stratégie 2e ligne après échec de 2 monothérapies. ACCEPTÉE par consensus (item 51, Stahl 2007).", ref: "SFGG/SF3PA/SFPC 2026 item 51", niveau_preuve: "B" },
                { classe: "Augmentation par antipsychotique atypique (3e-4e ligne)", posologie: "Aripiprazole 1-5 mg/j (max 10) en 1ère intention OU Quétiapine 50-150 mg/j en 2e (tolérance moindre)", note: "Sur échec/résistance, courte durée + surveillance EPS, métabolisme, QT, mortalité chez dément. OPTIMUM trial : aripiprazole > switch bupropion (rémission 28.9 % vs 19.3 %).", ref: "SFGG/SF3PA/SFPC 2026 item 52", niveau_preuve: "B" },
                { classe: "Augmentation par lithium (3e ligne)", posologie: "Lithiémie résiduelle cible 0.4-0.6 mmol/L (≠ 0.4-0.8 du Lithium en monothérapie)", note: "Si DFG > 60 (sauf accord néphro), hauts taux de récidive suicidaire, ATCD réponse familiale au lithium, suspicion bipolaire.", ref: "SFGG/SF3PA/SFPC 2026 item 53", niveau_preuve: "B" },
                { classe: "Lamotrigine (3e-4e ligne, hors AMM)", posologie: "Titration 25 mg/sem, surveillance toxidermie", note: "Si suspicion de spectre bipolaire atténué, échec aripiprazole/lithium ou CI.", ref: "SFGG/SF3PA/SFPC 2026 item 54", niveau_preuve: "C" },
                { classe: "Clomipramine (4e ligne — usage hospitalier)", posologie: "Initiation 10 mg/j, montée jusqu'à 75 mg/j max", note: "Réservée si neurocognitif et CV stables. Sous supervision spécialisée.", ref: "SFGG/SF3PA/SFPC 2026 item 55", niveau_preuve: "C" },
                { classe: "ECT (gold standard pour résistance ou sévérité)", indication: "Échec 4 lignes OU dépression sévère avec risque vital (dénutrition, suicidalité, escarres), perte d'autonomie, comorbidité neurodégénérative, idées délirantes, catatonie", ref: "SFGG/SF3PA/SFPC 2026 item 56 + CANMAT 2016", niveau_preuve: "A" },
                { classe: "rTMS (Stimulation magnétique transcrânienne)", indication: "Échec 2 lignes OU CI/intolérance aux antidépresseurs (sauf crise suicidaire / symptômes psychotiques où ECT prime)", ref: "SFGG/SF3PA/SFPC 2026 item 57", niveau_preuve: "B" },
                { classe: "Psychothérapie / TCC", indication: "Dépression légère à modérée — 1ère ligne non médicamenteuse (NICE)", note: "Ne pas négliger en complément du traitement médicamenteux." }
            ],
            EVITER: [
                { classe: "Tricycliques en 1ère ligne", raison: "ACB élevé, QT, hypotension orthostatique, chutes, confusion", gravite: "DECONSEILLE 1ère ligne", ref: "SFGG/SF3PA/SFPC 2026 item 9 + STOPP D1 + Beers 2023 + PRISCUS" },
                { classe: "Paroxétine", raison: "ACB=3 (anticholinergique fort), inhibiteur CYP2D6 puissant, sevrage difficile", gravite: "EVITER", ref: "SFGG/SF3PA/SFPC 2026 items 14 + 40", note: "Préférer sertraline ou escitalopram" },
                { classe: "Miansérine", raison: "Alerte ANSM (sédation, agranulocytose, hépatite, convulsions). Niveau de preuve moindre que mirtazapine en gériatrie.", gravite: "DECONSEILLE — préférer mirtazapine", ref: "SFGG/SF3PA/SFPC 2026 item 10" },
                { classe: "Agomélatine", raison: "RCP Valdoxan : manque de données chez ≥ 75 ans + hépatotoxicité grave (BH M0, M3, M6, M12)", gravite: "EVITER ≥ 75 ans", ref: "SFGG/SF3PA/SFPC 2026 + EMA 2025" },
                { classe: "Tianeptine", raison: "Risque de dépendance documenté (EMA PSUSA 2019)", gravite: "EVITER chez âgé", ref: "SFGG/SF3PA/SFPC 2026 + EMA 2019" },
                { classe: "IMAO non sélectifs (phénelzine, tranylcypromine, iproniazide)", raison: "Interactions alimentaires (tyramine = crise HTA) et médicamenteuses dangereuses (sérotoninergique)", gravite: "DECONSEILLE sauf 4e ligne hospitalière", ref: "Beers 2023 + SFGG/SF3PA/SFPC 2026" },
                { classe: "Benzodiazépines pour la dépression", raison: "Pas d'indication dans la dépression — chutes, dépendance, troubles cognitifs", gravite: "DECONSEILLE", ref: "STOPP D5 + SFGG/SF3PA/SFPC 2026" },
                { classe: "Combinaison 2 ISRS / 2 IRSN / ISRS+IRSN / ISRS-IRSN+IMAO/TCA", raison: "Syndrome sérotoninergique, redondance pharmacologique", gravite: "CONTRE-INDICATION", ref: "SFGG/SF3PA/SFPC 2026 item 50" },
                { classe: "Combinaison de 3 antidépresseurs", raison: "Aucune indication validée", gravite: "CONTRE-INDICATION ABSOLUE", ref: "SFGG/SF3PA/SFPC 2026 item 49" },
                { classe: "Tramadol + ISRS/IRSN/TCA", raison: "Syndrome sérotoninergique (Phase 8 SYND_043) — réévaluer indication antalgique", gravite: "EVITER, ÉDUCATION patient si maintenu (diarrhée, tachycardie, sueurs, tremblements, confusion)", ref: "SFGG/SF3PA/SFPC 2026 item 42" },
                { classe: "AINS + ISRS/IRSN/Vortioxétine", raison: "Risque hémorragique additif (digestif et général)", gravite: "EVITER, éducation patient", ref: "SFGG/SF3PA/SFPC 2026 item 44" },
                { classe: "ISRS/IRSN/Vortioxétine en cas de saignement récent (< 1 mois, surtout digestif)", raison: "Risque hémorragique", gravite: "PREFERER mirtazapine (1ère intention) ou IRSN (2e)", ref: "SFGG/SF3PA/SFPC 2026 item 45" },
                { classe: "Antidépresseur à ACB élevé si plainte cognitive précoce ou MCI", raison: "Aggravation cognitive, démence iatrogène (Zheng 2021 méta-analyse)", gravite: "SWITCH vers ACB faible (sertraline, escitalopram, mirtazapine)", ref: "SFGG/SF3PA/SFPC 2026 item 33" }
            ],
            ADAPTATIONS_RENALES: {
                source: "SFGG/SF3PA/SFPC 2026 items 34-37",
                modere_30_60: "Paroxétine 10 mg/j init puis lente titration ; Milnacipran ≤ 50 mg/j",
                severe_15_30_irsn: "Pas de duloxétine ; venlafaxine max 187.5 mg/j ; milnacipran max 25 mg/j",
                severe_15_30_isrs: "Préférer sertraline / escitalopram / citalopram à dose minimale, titration très progressive. Si fluoxétine/fluvoxamine/paroxétine déjà en place, maintenir mêmes doses sous surveillance.",
                mirtazapine: "Initier 15 mg/j et augmenter très lentement selon tolérance",
                terminale_15: "Idem sévère ; dosage plasmatique si escalade nécessaire"
            },
            ADAPTATIONS_HEPATIQUES: {
                source: "SFGG/SF3PA/SFPC 2026 items 38-39 + EMA 2025 + EMA 2019",
                ci_absolue: ["Agomélatine (hépatotoxicité)", "Duloxétine (insuffisance hépatique)", "Miansérine (hépatite)"],
                preferes: ["Fluoxétine à demi-dose", "Citalopram à demi-dose", "Milnacipran sans ajustement"],
                seuils_ci: "Transaminases > 3 × LSN ou TP < 50 % → arrêt agomélatine/duloxétine/miansérine"
            }
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_002", "BIO_001", "BIO_019", "BIO_003", "BIO_031", "BIO_009", "BIO_013", "BIO_014"],
            REGLES: [
                {
                    bio: "BIO_002",
                    nom: "Natrémie",
                    frequence: "Avant introduction puis J7-J14, M1, trimestriel × 1 an si antidépresseur sérotoninergique (SFGG/SF3PA/SFPC 2026 items 15-16)",
                    note: "SIADH iatrogène 5-40 % sous ISRS/IRSN/Vortioxétine chez ≥ 65 ans. Si Na < 130 sous ISRS/IRSN : revoir thiazidique/IEC/laxatifs co-prescrits + considérer mirtazapine (moindre risque SIADH).",
                    seuils: {
                        alerte: { max: 135, action: "Surveiller ionogramme à J7 ; si baisse progressive → déprescription progressive ou switch mirtazapine" },
                        critique: { max: 130, action: "SIADH iatrogène : arrêter ISRS progressivement, restriction hydrique 800-1000 mL/j, éviter correction > 8 mmol/L/24h (myélinolyse pontine)" }
                    },
                    syndrome_declenche: "SYND_009"
                },
                { bio: "BIO_001", nom: "Kaliémie", frequence: "Avant introduction citalopram/escitalopram (CI si hypoK+ < 3.5 — item 30) ; annuelle ensuite si pas de diurétique" },
                { bio: "BIO_019", frequence: "Annuel (TSH pour exclure cause thyroïdienne — item 5)" },
                { bio: "BIO_003", nom: "Créatinine/DFG", frequence: "Avant introduction puis annuel — item 7", note: "Adapter posologie selon DFG (items 34-37)" },
                { bio: "BIO_013", nom: "ASAT/ALAT", frequence: "Avant introduction agomélatine/duloxétine puis M3, M6, M12 ; à la demande pour autres antidépresseurs", note: "Si > 3N ou TP < 50 % → arrêt agomélatine/duloxétine/miansérine (item 38)" },
                {
                    bio: "BIO_031",
                    nom: "QTc",
                    frequence: "ECG de référence avant prescription (item 1) ; recontrôle à J7 si arythmie/QT borderline ou prolongé (item 31)",
                    note: "CI si arythmie, QT prolongé, hypokaliémie : pas de TCA, citalopram, escitalopram (item 30). Préférer sertraline ou mirtazapine (item 29).",
                    seuils: { alerte: { min: 470, action: "Réduire dose" }, critique: { min: 500, action: "Arrêt + switch sertraline/mirtazapine + scope" } },
                    syndrome_declenche: "SYND_051"
                },
                { bio: "BIO_009", nom: "NFS", frequence: "Avant miansérine ; en urgence si fièvre/angine sous miansérine (item 21 — risque agranulocytose ANSM)" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_002", condition: "< 130 mmol/L sous ISRS/IRSN/Vortioxétine", action: "Arrêt progressif sérotoninergique, restriction hydrique, switch vers mirtazapine (moindre risque SIADH — item 16)", syndrome: "SYND_009" },
                { bio: "BIO_031", condition: "QTc ≥ 500 ms sous citalopram/escitalopram/TCA", action: "Arrêt immédiat + scope + bilan K+/Mg + switch sertraline/mirtazapine", syndrome: "SYND_051" },
                { bio: "BIO_013", condition: "Transaminases > 3 × LSN sous agomélatine/duloxétine/miansérine", action: "Arrêt immédiat, bilan hépatique de contrôle, switch antidépresseur à faible extraction hépatique (fluoxétine ou citalopram à demi-dose) — item 38", syndrome: "SYND_001" },
                { bio: "BIO_009", condition: "PNN < 1.5 G/L sous miansérine + fièvre/angine", action: "ARRÊT immédiat miansérine, hospitalisation si PNN < 0.5, ATB large spectre si fièvre — item 21 + ANSM", syndrome: "SYND_014" }
            ]
        },
        STRATEGIE_RESISTANCE: {
            source: "SFGG/SF3PA/SFPC 2026 items 47-57",
            etape_1: "ISRS sertraline (ou citalopram/escitalopram) à dose efficace × 4-12 sem",
            etape_2: "Si échec : switch vers IRSN (venlafaxine ou duloxétine) ou mirtazapine — item 13/12",
            etape_3a: "Si réponse partielle après 2 monothérapies : combinaison ISRS/IRSN + mirtazapine (item 51) OU vortioxétine (item 47)",
            etape_3b: "Si toujours résistant : augmentation par aripiprazole 1-5 mg/j (1ère intention — OPTIMUM trial) OU quétiapine 50-150 mg/j (2e)",
            etape_4: "Échec ou CI antipsychotique : lithium 0.4-0.6 mmol/L (item 53) OU lamotrigine off-label si suspicion bipolaire (item 54)",
            etape_5_hospitalier: "Clomipramine ≤ 75 mg/j (item 55) — uniquement hospitalier",
            etape_ultime: "ECT (gold standard) — item 56. Alternative rTMS si pas de crise suicidaire/psychose — item 57"
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PAT_033 → Glaucome à angle fermé
    // ═══════════════════════════════════════════════════════════════════════════
    "PAT_033": {
        ID: "PAT_033",
        NOM: "Glaucome à angle fermé",
        REFERENCE: "AAO Preferred Practice Pattern 2024 | EGS Guidelines 2024 | STOPP/START v3",
        SOURCES_EBM: {
            "INITIER": {
                "Iridotomie laser": "AAO_PPP_2024 (traitement curatif de référence)",
                "Bêtabloquant topique": "EGS_2024 §4.2",
                "Analogue prostaglandines": "EGS_2024 §4.3",
                "Inhibiteur anhydrase carbonique topique": "EGS_2024 §4.4",
                "Alpha2-agoniste topique": "EGS_2024 §4.5",
                "Pilocarpine": "AAO_PPP_2024 (crise aiguë)",
                "Acétazolamide PO/IV": "AAO_PPP_2024 (crise aiguë)"
            },
            "EVITER": {
                "Anticholinergiques": "STOPP_START_V3 D1 + BEERS_2023",
                "LAMA inhalés": "STOPP_START_V3 G3",
                "Tricycliques": "STOPP_START_V3 D1",
                "Antihistaminiques H1": "BEERS_2023"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Urgence ophtalmologique en cas de crise aiguë (douleur oculaire, vision trouble, halos, nausées). Traitement définitif = iridotomie laser périphérique (YAG) ± chirurgie (iridectomie, phacoexérèse). Contre-indication absolue des anticholinergiques systémiques (risque de crise aiguë de fermeture). Collyres myotiques (pilocarpine) autorisés voire recommandés en aigu." }
            ],
            INITIER: [
                { classe: "Iridotomie laser périphérique (YAG)", indication: "Traitement curatif de référence du glaucome à angle fermé et prophylaxie de l'œil adelphe", niveau_preuve: "A", ref: "AAO PPP 2024" },
                { classe: "Collyre bêtabloquant (timolol 0.25-0.5%)", posologie: "1 goutte x2/j", indication: "1re ligne hypotonisante chronique — attention absorption systémique (bradycardie, bronchospasme)", ref: "EGS 2024" },
                { classe: "Analogue prostaglandines (latanoprost, bimatoprost, travoprost)", posologie: "1 goutte le soir", indication: "Hypotonisant puissant — 1re ligne souvent préférée chez le sujet âgé (pas d'absorption systémique significative)", ref: "EGS 2024" },
                { classe: "Inhibiteur anhydrase carbonique topique (dorzolamide, brinzolamide)", posologie: "1 goutte x2-3/j", indication: "Association ou 2e ligne", ref: "EGS 2024" },
                { classe: "Alpha2-agoniste topique (brimonidine)", posologie: "1 goutte x2/j", indication: "Association — CI chez le sujet très âgé (somnolence, hypoTA)", ref: "EGS 2024" },
                { classe: "Pilocarpine collyre 1-2%", posologie: "1 goutte x3-4/j en aigu", indication: "CRISE AIGUË : myotique → lève le bloc pupillaire avant iridotomie", ref: "AAO PPP 2024" },
                { classe: "Acétazolamide (Diamox) PO/IV", posologie: "500 mg IV en aigu, puis 250 mg x2-4/j PO", indication: "CRISE AIGUË — inhibiteur anhydrase carbonique systémique (attention K+, acidose, lithiase)", ref: "AAO PPP 2024" },
                { classe: "Mannitol 20% IV", posologie: "1-2 g/kg IV lente", indication: "CRISE AIGUË réfractaire (osmotique) — prudence chez IC, IRC", ref: "AAO PPP 2024" }
            ],
            EVITER: [
                { classe: "Anticholinergiques systémiques (oxybutynine, trospium, solifenacine, toltérodine)", raison: "Mydriase → crise de fermeture de l'angle", ref: "STOPP D1", gravite: "CONTRE-INDICATION" },
                { classe: "Antidépresseurs tricycliques", raison: "Effets anticholinergiques → mydriase", ref: "STOPP D1", gravite: "CONTRE-INDICATION" },
                { classe: "LAMA inhalés (tiotropium, aclidinium)", raison: "Effets anticholinergiques à dose systémique", ref: "STOPP G3", gravite: "A EVITER" },
                { classe: "Antihistaminiques H1 1ère gén (hydroxyzine, dexchlorphéniramine)", raison: "Effets anticholinergiques", ref: "Beers 2023", gravite: "A EVITER" },
                { classe: "Antispasmodiques (atropine, scopolamine, butylscopolamine)", raison: "Anticholinergiques puissants", ref: "Beers 2023", gravite: "CONTRE-INDICATION" },
                { classe: "Ipratropium nébulisé", raison: "Contact oculaire direct → crise glaucome", ref: "AAO PPP", gravite: "A EVITER" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: [],
            REGLES: []
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PAT_034 → Hépatopathie chronique / Cirrhose
    // ═══════════════════════════════════════════════════════════════════════════
    "PAT_034": {
        ID: "PAT_034",
        NOM: "Hépatopathie chronique / Cirrhose",
        REFERENCE: "EASL Clinical Practice Guidelines 2024 | AASLD Practice Guidance 2023 | Verbeeck 2008 Liver Disease Pharmacokinetics",
        SOURCES_EBM: {
            "EVITER": {
                "Paracétamol > 2g": "EASL 2024 + Verbeeck 2008",
                "AINS": "EASL 2024 (CI dans cirrhose)",
                "Méthotrexate": "EASL 2024",
                "Statines (Child-Pugh C)": "EASL 2024"
            },
            "INITIER": {
                "Lactulose": "EASL Encéphalopathie hépatique 2024",
                "Rifaximine": "EASL 2024 prévention secondaire EH"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Child-Pugh A : peu d'adaptations. Child-Pugh B : réduire doses médicaments hépatiques. Child-Pugh C : CI de nombreux médicaments. Privilégier élimination rénale." }
            ],
            EVITER: [
                { classe: "AINS (tous)", raison: "Risque hémorragique digestif, décompensation rénale, ascite", ref: "EASL 2024" },
                { classe: "Paracétamol > 2 g/j", raison: "Hépatotoxicité dose-dépendante (seuil abaissé)", ref: "EASL 2024" },
                { classe: "Méthotrexate", raison: "Hépatotoxicité directe, fibrose hépatique", ref: "EASL 2024" },
                { classe: "Statines si Child-Pugh C", raison: "Métabolisme hépatique, risque d'hépatite", ref: "EASL 2024" },
                { classe: "Benzodiazépines (surtout si encéphalopathie)", raison: "Sédation prolongée, encéphalopathie", ref: "AASLD 2023" },
                { classe: "Opioïdes", raison: "Métabolisme hépatique ralenti, encéphalopathie", ref: "AASLD 2023" },
                { classe: "Amiodarone", raison: "Hépatotoxicité cumulative", ref: "Verbeeck 2008" },
                { classe: "Valproate", raison: "Hépatotoxicité idiosyncrasique", ref: "ILAE 2024" }
            ],
            INITIER: [
                { classe: "Lactulose", posologie: "15-30 mL x3/j (objectif 2-3 selles/j)", ref: "EASL EH" },
                { classe: "Rifaximine", posologie: "550 mg x2/j (prévention secondaire encéphalopathie)", ref: "EASL 2024" },
                { classe: "Spironolactone + Furosémide", posologie: "Ratio 100/40 pour ascite", ref: "EASL Ascite 2024" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_013", "BIO_014", "BIO_015", "BIO_016", "BIO_017", "BIO_035", "BIO_030", "BIO_009"],
            REGLES: [
                { bio: "BIO_013", frequence: "Hebdomadaire si Child-Pugh B/C", syndrome: "SYND_001" },
                { bio: "BIO_014", frequence: "Hebdomadaire si Child-Pugh B/C", syndrome: "SYND_001" },
                { bio: "BIO_030", frequence: "Hebdomadaire (TP/INR — reflet fonction hépatique)" },
                { bio: "BIO_035", frequence: "Mensuel (albumine — score Child-Pugh)", syndrome: "SYND_033" },
                { bio: "BIO_009", frequence: "Mensuel (NFS — hypersplénisme)" }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PAT_035 → Bradycardie
    // ═══════════════════════════════════════════════════════════════════════════
    "PAT_035": {
        ID: "PAT_035",
        NOM: "Bradycardie",
        REFERENCE: "ESC Guidelines for Cardiac Pacing 2021 | ACLS 2020 (AHA) | STOPP/START v3",
        SOURCES_EBM: {
            "INITIER": {
                "Mesures non pharmacologiques (déprescription bradycardisants, correction iono, exclusion étio)": "ESC Pacing 2021 §6, IB",
                "Atropine 0.5 mg IV": "ACLS 2020 + ESC Pacing 2021 §6.1 — bradycardie symptomatique aiguë",
                "Isoprénaline IV": "ESC Pacing 2021 §6.1, IIaC — si échec atropine, en attente PM temporaire",
                "Pacemaker (temporaire/définitif)": "ESC Pacing 2021 §7-8, IA — BAV 2-3, dysfonction sinusale symptomatique"
            },
            "EVITER": {
                "Bêtabloquants": "STOPP_START_V3 B4",
                "Vérapamil/Diltiazem": "STOPP_START_V3 B4",
                "Digoxine": "STOPP_START_V3 B4",
                "Ivabradine": "ESC Pacing 2021",
                "Anticholinestérasiques": "STOPP_START_V3 D18"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Bradycardie sévère (< 45/min) ou symptomatique : réévaluer TOUS les chronotropes négatifs. Éviter association de ≥ 2 bradycardisants." },
                { note: "Démarche systématique : (1) gravité ? FC < 40, instabilité hémodynamique, BAV 2 Mobitz II/3 → urgence ; (2) cause iatrogène ? réversible (arrêt + atropine) ; (3) cause organique ? bilan (TSH, K+, Mg++, ECG, écho) ; (4) symptômes ? syncope/lipothymie/asthénie/IC → indication PM ; (5) DCL/Parkinson + IAChE = surveillance ECG rapprochée." }
            ],
            INITIER: [
                { classe: "Mesures non pharmacologiques systématiques", indication: "PREMIÈRE INTENTION (cause iatrogène = la plus fréquente)", composants: ["Déprescription des chronotropes négatifs (cf. EVITER) — souvent suffisant", "Correction des troubles ioniques (hyperkaliémie, hypomagnésémie, hypocalcémie)", "Exclusion d'une hypothyroïdie (TSH systématique)", "Exclusion d'une hypothermie", "Recherche d'une étiologie infectieuse/ischémique/inflammatoire", "ECG et monitoring si bradycardie < 45 ou symptomatique"], niveau_preuve: "IB" },
                { classe: "Atropine 0.5 mg IV (bolus, répétable jusqu'à 3 mg)", indication: "Bradycardie symptomatique aiguë (TA basse, conscience altérée, signes d'instabilité)", note: "Effet transitoire (5-10 min). En attente d'une cause réversible ou d'un pacemaker. CI relative en cas de BAV 2 Mobitz II ou BAV 3 (effet paradoxal possible).", niveau_preuve: "IB" },
                { classe: "Isoprénaline 0.02-0.06 µg/kg/min IV (en USIC)", indication: "Échec atropine, en attente PM temporaire", note: "Béta-agoniste pur — surveillance scope, ischémie. Préférer pacemaker dès que possible.", niveau_preuve: "IIaC" },
                { classe: "Pacemaker temporaire (sonde transveineuse) puis définitif", indication: "BAV 2 Mobitz II / BAV 3 / BAV 1 + bloc bifasciculaire / Dysfonction sinusale symptomatique / Bradycardie iatrogène irréversible (ex. amiodarone non substituable)", note: "ESC Pacing 2021 Class I. Chez sujet âgé : balance bénéfice/risque (espérance de vie, fragilité, complications procédurales) à discuter en équipe.", niveau_preuve: "IA" }
            ],
            EVITER: [
                { classe: "Bêtabloquants", raison: "Chronotrope négatif — aggravation bradycardie", ref: "STOPP B4" },
                { classe: "Vérapamil, Diltiazem", raison: "Chronotrope négatif — risque BAV complet", ref: "STOPP B4" },
                { classe: "Digoxine", raison: "Chronotrope négatif — BAV", ref: "STOPP B4" },
                { classe: "Ivabradine", raison: "Effet bradycardisant direct (If)", ref: "ESC Pacing 2021" },
                { classe: "Donépézil, Rivastigmine, Galantamine", raison: "Effet vagomimétique → bradycardie", ref: "STOPP D18" },
                { classe: "Amiodarone", raison: "Bradycardie sinusale, BAV", ref: "ESC AF 2024" },
                { classe: "Clonidine, Méthyldopa", raison: "Effet sympatholytique central → bradycardie", ref: "STOPP B11" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_001", "BIO_005", "BIO_031"],
            REGLES: [
                { bio: "BIO_001", frequence: "Ionogramme (hyperkaliémie aggrave bradycardie)" },
                { bio: "BIO_031", frequence: "ECG systématique si chronotrope négatif", syndrome: "SYND_003" }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PAT_036 → Maladie thromboembolique veineuse (MTEV)
    // ═══════════════════════════════════════════════════════════════════════════
    "PAT_036": {
        ID: "PAT_036",
        NOM: "Maladie thromboembolique veineuse (MTEV)",
        REFERENCE: "ESC Guidelines for PE/DVT 2024 | ASH VTE Guidelines 2023 | ACCP Antithrombotic Guidelines 2024 | HOKUSAI-VTE | RE-COVER",
        SOURCES_EBM: {
            "INITIER": {
                "AOD (apixaban, rivaroxaban)": "ESC PE 2024 + ASH 2023 — 1ère intention, initiables d'emblée sans relais HBPM",
                "AOD (edoxaban, dabigatran)": "ESC PE 2024 + ASH 2023 — nécessitent 5 jours d'HBPM curative préalable (HOKUSAI-VTE, RE-COVER)",
                "HBPM (enoxaparine, tinzaparine)": "ASH 2023 — 1ère intention si cancer actif, ou si CI AOD",
                "AVK (warfarine, acénocoumarol)": "ESC PE 2024 — alternative si CI AOD, après HBPM ≥ 5j et INR ≥ 2"
            },
            "EVITER": {
                "AINS": "ESC PE 2024 — risque hémorragique majoré sous anticoagulation",
                "Œstrogènes": "ESC PE 2024 — CI absolue si ATCD MTEV"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "AOD en 1ère intention (apixaban, rivaroxaban initiables d'emblée ; edoxaban, dabigatran après 5j HBPM). HBPM si cancer actif ou CI AOD. AVK si CI AOD et pas d'option HBPM long cours." },
                { note: "DURÉE DE TRAITEMENT : ≥ 3 mois minimum. Prolongation selon facteur déclenchant : (1) MTEV provoquée par chirurgie/immobilisation transitoire = 3 mois suffisent. (2) MTEV provoquée par facteur persistant non chirurgical (cancer actif, MICI, alitement chronique) = tant que le facteur persiste. (3) MTEV non provoquée (idiopathique) = 3 mois puis évaluation ; récidive = anticoagulation à durée indéfinie. (4) Première EP idiopathique > 65 ans = favoriser long cours (HERDOO2, DASH score). (5) Cancer actif = tant que le cancer évolue (HBPM > AOD si tumeur GI/urothéliale per Kraaijpoel CARAVAGGIO). (6) Récidive sous anticoagulant = changer de classe + long cours." },
                { note: "Sujet âgé : risque hémorragique accru, mais bénéfice de l'anticoagulation prolongée souvent supérieur si MTEV non provoquée. HAS-BLED ≥ 3 → réévaluation systématique mais NON arrêt automatique." }
            ],
            INITIER: [
                { classe: "AOD (apixaban, rivaroxaban) — initiation d'emblée", posologie: "Apixaban : 10 mg x2/j J1-J7 puis 5 mg x2/j (2.5 mg x2/j en prévention secondaire après 6 mois). Rivaroxaban : 15 mg x2/j J1-J21 puis 20 mg/j (10 mg/j en prévention secondaire après 6 mois).", ref: "ESC PE 2024 ; AMPLIFY ; EINSTEIN" },
                { classe: "AOD (edoxaban, dabigatran) — après 5j HBPM préalable", posologie: "Edoxaban : 60 mg/j (30 mg/j si DFG 15-50 ou poids ≤ 60 kg ou inhibiteur P-gp). Dabigatran : 150 mg x2/j (110 mg x2/j si ≥ 80 ans, vérapamil, ou HAS-BLED ≥ 3).", ref: "HOKUSAI-VTE ; RE-COVER" },
                { classe: "HBPM curative (enoxaparine, tinzaparine) — cancer actif ou CI AOD", posologie: "Enoxaparine 100 UI/kg x2/j (1 mg/kg x2/j) ou Tinzaparine 175 UI/kg/j en 1 injection. Cancer : préférer Tinzaparine (CARAVAGGIO comparable à apixaban hors GI/urothélial).", ref: "ASH 2023 Cancer VTE ; CLOT" },
                { classe: "AVK (warfarine, acénocoumarol) — si CI AOD et HBPM long cours non envisageable", posologie: "Initiation après HBPM ≥ 5 j ; INR cible 2-3 ; chevauchement HBPM + AVK jusqu'à INR ≥ 2 sur 2 prélèvements consécutifs.", ref: "ESC PE 2024" }
            ],
            TRANSITIONS: {
                HBPM_vers_AOD: [
                    { dci: "Apixaban", schema: "Initiable d'emblée (10 mg x2/j x 7j puis 5 mg x2/j) — pas de relais HBPM nécessaire." },
                    { dci: "Rivaroxaban", schema: "Initiable d'emblée (15 mg x2/j x 21j puis 20 mg/j) — pas de relais HBPM nécessaire." },
                    { dci: "Edoxaban", schema: "Après 5 jours d'HBPM curative préalable obligatoire (HOKUSAI-VTE). Arrêt HBPM 12-24 h avant 1ère prise edoxaban." },
                    { dci: "Dabigatran", schema: "Après 5 jours d'HBPM curative préalable obligatoire (RE-COVER). Arrêt HBPM 0-2 h avant 1ère prise dabigatran." }
                ],
                HBPM_vers_AVK: { schema: "Chevauchement HBPM + AVK ≥ 5 jours ET INR ≥ 2 sur 2 prélèvements consécutifs avant arrêt HBPM. Initier AVK J1 (le même jour que HBPM)." },
                AOD_vers_AVK: { schema: "Spécifique selon AOD — Apixaban/Rivaroxaban : prendre AOD jusqu'à INR ≥ 2 puis arrêter, INR à dater de J-2 du switch. Dabigatran : commencer AVK 1-3 j avant arrêt selon DFG (3 j si DFG ≥ 50, 2 j si 30-50). Edoxaban : commencer AVK + 1 demi-dose edoxaban (30 mg) jusqu'à INR ≥ 2." },
                AVK_vers_AOD: { schema: "Arrêter AVK et initier AOD lorsque INR < 2 (apixaban, rivaroxaban) ou ≤ 2.5 (dabigatran, edoxaban)." }
            },
            EVITER: [
                { classe: "AINS", raison: "Risque hémorragique majoré sous anticoagulation", ref: "ESC PE 2024" },
                { classe: "Œstrogènes (contraceptifs, THS)", raison: "CI absolue si ATCD MTEV", ref: "ESC PE 2024" },
                { classe: "Tamoxifène", raison: "Risque thrombogène", ref: "ESC PE 2024" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_003", "BIO_004", "BIO_009", "BIO_010"],
            REGLES: [
                { bio: "BIO_003", frequence: "Créatinine avant AOD/HBPM, puis trimestrielle (clearance — ajustement dose)" },
                { bio: "BIO_009", frequence: "Hb avant introduction puis si suspicion saignement" },
                { bio: "BIO_010", frequence: "Plaquettes 2x/sem (J5-J21) sous HBPM ou HNF — TIH" },
                { bio: "BIO_030", frequence: "INR 2x/sem puis mensuel UNIQUEMENT si AVK choisi (CI AOD ou pas d'option HBPM long cours). Pas de surveillance INR pour AOD ou HBPM seuls." }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PAT_037 → Sarcopénie
    // ═══════════════════════════════════════════════════════════════════════════
    "PAT_037": {
        ID: "PAT_037",
        NOM: "Sarcopénie",
        REFERENCE: "EWGSOP2 2019 | ICFSR 2022 | HAS Dénutrition 2021",
        SOURCES_EBM: {
            "INITIER": {
                "Exercice résistance": "EWGSOP2 2019 (niveau A — seule intervention prouvée)",
                "Protéines": "ESPEN 2019 (1.0-1.2 g/kg/j, 1.2-1.5 si dénutri)",
                "Vitamine D": "EWGSOP2 2019 (supplémentation si carence)"
            },
            "EVITER": {
                "Corticoïdes": "EWGSOP2 2019 (catabolisme protéique)",
                "Statines": "ICFSR 2022 (myopathie — réévaluer bénéfice/risque)"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "La sarcopénie est un syndrome gériatrique associé à un risque de chutes, fractures, dépendance et mortalité. L'exercice physique adapté (résistance) est la seule intervention ayant un niveau de preuve élevé." }
            ],
            INITIER: [
                { classe: "Exercice physique en résistance", indication: "Programme supervisé 2-3x/sem, adaptation gériatrique. Seule intervention prouvée (niveau A).", niveau_preuve: "A", ref: "EWGSOP2 2019" },
                { classe: "Apports protéiques optimisés", indication: "1.0-1.2 g/kg/j (1.2-1.5 si dénutrition). CNO hyperprotidiques si apports PO insuffisants.", niveau_preuve: "B", ref: "ESPEN 2019" },
                { classe: "Vitamine D (cholécalciférol)", indication: "800-1000 UI/j si carence documentée ou âge > 70 ans.", niveau_preuve: "B", ref: "EWGSOP2 2019" },
                { classe: "Leucine / HMB", indication: "Supplémentation en leucine (3g/repas) ou HMB 3g/j — bénéfice modeste sur masse musculaire.", niveau_preuve: "C", ref: "ICFSR 2022" }
            ],
            EVITER: [
                { classe: "Corticoïdes systémiques au long cours", raison: "Catabolisme protéique musculaire, aggravation sarcopénie", gravite: "DECONSEILLE", ref_stopp: "EWGSOP2" },
                { classe: "Repos strict prolongé", raison: "Perte de 1-3% de masse musculaire par jour d'alitement", gravite: "PRECAUTION" },
                { classe: "Restriction calorique/protéique", raison: "Aggrave la sarcopénie — maintenir les apports même si surpoids", gravite: "PRECAUTION" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_035", "BIO_023", "BIO_018", "BIO_024"],
            REGLES: [
                { bio: "BIO_035", frequence: "Albumine trimestrielle (marqueur nutritionnel lent)", syndrome: "SYND_033" },
                { bio: "BIO_023", frequence: "Vitamine D semestrielle", syndrome: "SYND_025" },
                { bio: "BIO_018", frequence: "CPK si myalgies sous statine" },
                { bio: "BIO_024", frequence: "CRP (la sarcopénie s'aggrave en inflammation)" }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PAT_038 → Dysphagie / Troubles de déglutition
    // ═══════════════════════════════════════════════════════════════════════════
    "PAT_038": {
        ID: "PAT_038",
        NOM: "Dysphagie / Troubles de déglutition",
        REFERENCE: "ESSD 2021 | ESPEN Dysphagia 2022 | HAS Fausses routes 2020",
        SOURCES_EBM: {
            "INITIER": {
                "Adaptation textures": "ESSD/IDDSI 2019 (niveau B)",
                "Rééducation orthophonique": "ESSD 2021 (niveau B)"
            },
            "EVITER": {
                "Formes sèches/gélules volumineuses": "ESPEN Dysphagia 2022",
                "Sédatifs": "HAS 2020 (aggravation réflexe déglutition)"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "La dysphagie en gériatrie augmente le risque de pneumopathie d'inhalation, dénutrition et déshydratation. Adapter les formes galéniques et textures alimentaires. Évaluation orthophonique systématique." }
            ],
            INITIER: [
                { classe: "Évaluation orthophonique", indication: "Bilan de déglutition systématique (test de l'eau). Rééducation si possible.", niveau_preuve: "B", ref: "ESSD 2021" },
                { classe: "Adaptation des textures (IDDSI)", indication: "Alimentation texture modifiée (mixé, haché). Eau gélifiée si fausses routes aux liquides.", ref: "IDDSI 2019" },
                { classe: "CNO si dénutrition associée", indication: "Texture adaptée (crèmes enrichies), fractionnement des repas.", ref: "ESPEN 2022" },
                { classe: "Adaptation galénique des médicaments", indication: "Formes liquides, orodispersibles, ou écrasables. Vérifier la liste des médicaments écrasables.", ref: "SFPC 2023" }
            ],
            EVITER: [
                { classe: "Antipsychotiques", raison: "Altèrent le réflexe de déglutition — risque de pneumopathie d'inhalation", gravite: "DECONSEILLE sauf indication psychiatrique majeure", ref_stopp: "STOPP v3" },
                { classe: "Benzodiazépines / Sédatifs", raison: "Sédation → diminution des réflexes protecteurs des voies aériennes", gravite: "PRUDENCE" },
                { classe: "Anticholinergiques", raison: "Sécheresse buccale aggravant la dysphagie, xérostomie", gravite: "PRUDENCE" },
                { classe: "Formes LP / gastro-résistantes non écrasables", raison: "Ne pas écraser les formes à libération prolongée — risque de dose-dumping", gravite: "PRECAUTION" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_035", "BIO_024", "BIO_002", "BIO_009"],
            REGLES: [
                { bio: "BIO_035", frequence: "Albumine mensuelle (risque dénutrition)", syndrome: "SYND_033" },
                { bio: "BIO_024", frequence: "CRP si suspicion pneumopathie d'inhalation" },
                { bio: "BIO_002", frequence: "Natrémie (risque déshydratation)" },
                { bio: "BIO_009", frequence: "NFS (anémie carentielle si dénutrition)" }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PAT_039 → Incontinence urinaire
    // ═══════════════════════════════════════════════════════════════════════════
    "PAT_039": {
        ID: "PAT_039",
        NOM: "Incontinence urinaire",
        REFERENCE: "ICI/ICS 2023 | EAU Urinary Incontinence 2024 | NICE UI 2019 | Beers 2023",
        SOURCES_EBM: {
            "INITIER": {
                "Rééducation périnéale": "EAU 2024 (1ère intention, niveau A)",
                "Mirabégron": "EAU 2024 (si anticholinergiques CI)"
            },
            "EVITER": {
                "Oxybutynine": "Beers 2023 + STOPP v3 (ACB 3, passage BHE élevé)",
                "Diurétiques de l'anse": "STOPP v3 B10 (aggravation incontinence)"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "L'incontinence urinaire chez le sujet âgé est multifactorielle. Toujours rechercher les causes iatrogènes (diurétiques, alpha-bloquants, BZD, ISRS). Les mesures non pharmacologiques sont la 1ère ligne de traitement." }
            ],
            INITIER: [
                { classe: "Rééducation périnéale (kinésithérapie)", indication: "1ère intention dans l'incontinence d'effort et mixte. Efficace chez la femme et l'homme.", niveau_preuve: "A", ref: "EAU 2024" },
                { classe: "Mictions programmées (prompted voiding)", indication: "Efficace dans l'incontinence fonctionnelle du sujet âgé dépendant.", niveau_preuve: "B", ref: "ICI 2023" },
                { classe: "Mirabégron (agoniste β3)", indication: "Alternative aux anticholinergiques si vessie hyperactive. Pas de charge anticholinergique. CI si HTA non contrôlée.", niveau_preuve: "A", ref: "EAU 2024", dci_exemples: ["mirabegron"] },
                { classe: "Duloxétine (si incontinence d'effort)", indication: "Efficacité modeste, EI fréquents (nausées). Option si chirurgie refusée ou CI.", niveau_preuve: "B", ref: "EAU 2024", condition: "Incontinence d'effort isolée" }
            ],
            EVITER: [
                { classe: "Oxybutynine", raison: "ACB 3, passage BHE élevé → confusion, déclin cognitif chez le sujet âgé. PIM absolu en gériatrie.", gravite: "CONTRE-INDICATION gériatrique", ref_stopp: "STOPP H2 / Beers 2023" },
                { classe: "Solifénacine, Toltérodine, Fésotérodine", raison: "Anticholinergiques — charge cognitive, sécheresse buccale, constipation, rétention. Préférer mirabégron.", gravite: "DECONSEILLE si alternatives disponibles", ref_stopp: "Beers 2023" },
                { classe: "Diurétiques de l'anse (furosémide, bumétanide) pour HTA", raison: "Aggravent l'incontinence par augmentation du volume urinaire. Switch vers thiazidique si possible.", gravite: "DECONSEILLE si HTA seule indication", ref_stopp: "STOPP v3 B10" },
                { classe: "Alpha-bloquants (si hypotension associée)", raison: "Tamsulosine/alfuzosine : hypotension orthostatique + aggravation incontinence d'effort chez la femme", gravite: "PRUDENCE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_003", "BIO_004", "BIO_002"],
            REGLES: [
                { bio: "BIO_003", frequence: "Créatinine (recherche obstacle si rétention)", syndrome: "SYND_015" },
                { bio: "BIO_004", frequence: "DFG (adapter diurétiques)" },
                { bio: "BIO_002", frequence: "Natrémie (si diurétiques associés)" }
            ]
        }
    },

    "PAT_041": {
        ID: "PAT_041",
        NOM: "Démence vasculaire",
        REFERENCE: "HAS 2018 MNC | O'Brien Lancet Neurol 2015 | ESH/ESC 2023",
        SOURCES_EBM: {
            "INITIER": {
                "Contrôle FDRCV": "HAS 2018 — pilier du traitement",
                "Donépézil": "HAS 2018 — bénéfice modeste (grade B)",
                "Galantamine": "HAS 2018 — démence vasculaire + composante Alzheimer"
            },
            "EVITER": {
                "Antipsychotiques": "Surmortalité CV démontrée (Schneider 2005)"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Contrôle strict des FDRCV (HTA cible <140/90 adapté à la fragilité, LDL, diabète, AVK/AOD si FA, antiagrégation). IAChE bénéfice modeste." }
            ],
            INITIER: [
                { classe: "Donépézil (5-10 mg/j)", indication: "Bénéfice cognitif modeste", niveau_preuve: "B" },
                { classe: "Galantamine (16-24 mg/j LP)", indication: "Formes mixtes vasculaire + Alzheimer", niveau_preuve: "B" },
                { classe: "Antihypertenseurs", indication: "Cible TA selon CFS/fragilité (SPRINT-MIND vs fragilité)", niveau_preuve: "A" },
                { classe: "Statine", indication: "Prévention secondaire post-AVC", niveau_preuve: "A" }
            ],
            EVITER: [
                { classe: "Antipsychotiques au long cours", raison: "↑ mortalité CV et AVC (Schneider 2005, FDA black box)", gravite: "DECONSEILLE", ref_stopp: "STOPP K1" },
                { classe: "Benzodiazépines au long cours", raison: "Chutes, aggravation cognitive", gravite: "DECONSEILLE", ref_stopp: "STOPP B7" }
            ]
        },
        BIOLOGIE: { SURVEILLANCE_CIBLE: [], REGLES: [] }
    },
    "PAT_042": {
        ID: "PAT_042",
        NOM: "Démence mixte (Alzheimer + vasculaire)",
        REFERENCE: "HAS 2018 MNC | Kalaria Lancet Neurol 2016 | NICE Dementia 2018 | STOPP/START v3 | Beers 2023",
        SOURCES_EBM: {
            "INITIER": {
                "IAChE": "HAS 2018 — indication MA + vasculaire",
                "Mémantine": "HAS 2018 — stade modéré à sévère",
                "Contrôle FDRCV": "Kalaria 2016 — prévention aggravation vasculaire"
            },
            "EVITER": {
                "Antipsychotiques": "Schneider 2005 + FDA Black Box",
                "Anticholinergiques": "STOPP D1-D5 + Beers 2023",
                "Benzodiazépines": "STOPP D5 + Beers 2023"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Démence mixte = cumul des contraintes Alzheimer + vasculaire. Double surveillance : antagonisme IAChE par anticholinergiques + risque hémorragique sous antithrombotiques (CI relative à dépister)." }
            ],
            INITIER: [
                { classe: "Donépézil / Galantamine / Rivastigmine", indication: "Stade léger à modéré (MMSE 10-26)", niveau_preuve: "B" },
                { classe: "Mémantine (5-20 mg/j)", indication: "Stade modéré à sévère (MMSE ≤ 19)", note: "Association IAChE + mémantine = bénéfice additif", niveau_preuve: "B" },
                { classe: "Contrôle FDRCV (HTA, LDL, diabète, AAP/AOD selon indication FA/AVC)", indication: "Prévention aggravation vasculaire — TA cible 130-140/80-85, LDL < 1.0 g/L si AVC, AAP en post-AVC", niveau_preuve: "A" }
            ],
            EVITER: [
                { classe: "Anticholinergiques (ACB cumulé ≥ 3)", raison: "Antagonise directement l'IAChE + aggravation cognitive — double risque en démence mixte", gravite: "EVITER", ref_stopp: "STOPP D1-D5 ; Beers 2023" },
                { classe: "Antipsychotiques classiques au long cours", raison: "↑ mortalité CV et AVC (FDA Black Box) — risque doublé en démence vasculaire", gravite: "DECONSEILLE", ref_stopp: "STOPP K1, D3 ; Beers 2023" },
                { classe: "Benzodiazépines / Z-drugs", raison: "Chutes, confusion, dépendance — sensibilité accrue en démence", gravite: "EVITER", ref_stopp: "STOPP D5 ; Beers 2023" },
                { classe: "Opioïdes forts au long cours", raison: "Sédation, chutes, confusion — préférer paliers 1-2", gravite: "PRUDENCE" },
                { classe: "AINS au long cours", raison: "Risque hémorragique (si AAP associé) + IRA + HTA — fortement déconseillés", gravite: "EVITER", ref_stopp: "STOPP F2" },
                { classe: "Statines à très haute dose si pas de bénéfice CV démontré", raison: "Tolérance cognitive controversée à fortes doses (myalgies, asthénie). Dose-effect prouvé en prévention secondaire post-AVC.", gravite: "PRUDENCE — adapter selon tolérance" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_009", "BIO_021", "BIO_031", "BIO_003", "BIO_027"],
            REGLES: [
                { bio: "BIO_031", nom: "QTc", frequence: "ECG avant IAChE, à 1 mois, puis annuel", note: "Bradycardie sous IAChE" },
                { bio: "BIO_019", nom: "TSH", frequence: "Bilan étiologique initial (exclure pseudodémence) + annuel" },
                { bio: "BIO_021", nom: "B12", frequence: "Bilan étiologique + annuel (carence aggrave cognition)" },
                { bio: "BIO_027", nom: "Bilan lipidique", frequence: "Annuel — cible LDL < 1.0 g/L si ATCD AVC ischémique" }
            ]
        }
    },
    "PAT_043": {
        ID: "PAT_043",
        NOM: "Trouble neurocognitif léger (MCI) / MBI",
        REFERENCE: "Petersen Neurology 2018 | Ismail MBI-C 2017 | SFGG 2024",
        SOURCES_EBM: {
            "INITIER": { "Intervention non médicamenteuse": "Petersen 2018 — activité physique aérobie (niveau B)" },
            "EVITER": { "IAChE dans MCI": "Petersen 2018 — absence de bénéfice démontré, non recommandé hors essai" }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "MCI : pas d'indication aux IAChE (HAS/AAN). MBI = marqueur de risque de conversion vers démence, justifie surveillance rapprochée." }
            ],
            INITIER: [
                { classe: "Activité physique aérobie régulière", indication: "Réduction du risque de conversion", niveau_preuve: "B" },
                { classe: "Stimulation cognitive", indication: "Bénéfice fonctionnel", niveau_preuve: "C" },
                { classe: "Correction des facteurs modifiables (sommeil, audition, dépression, polymédication)", indication: "Prévention", niveau_preuve: "B" }
            ],
            EVITER: [
                { classe: "IAChE et Mémantine", raison: "Aucun bénéfice démontré dans le MCI (Petersen 2018)", gravite: "DECONSEILLE" },
                { classe: "Anticholinergiques (score ACB ≥ 2)", raison: "Aggravation cognitive documentée", gravite: "EVITER" }
            ]
        },
        BIOLOGIE: { SURVEILLANCE_CIBLE: [], REGLES: [] }
    },
    "PAT_044": {
        ID: "PAT_044",
        NOM: "Trouble anxieux généralisé (TAG) du sujet âgé",
        REFERENCE: "WFSBP 2023 | APA 2020 | SFGG 2024",
        SOURCES_EBM: {
            "INITIER": {
                "ISRS (escitalopram, sertraline)": "WFSBP 2023 — 1ère intention",
                "IRSN (duloxétine, venlafaxine)": "WFSBP 2023 — 2e intention",
                "TCC": "APA 2020 — 1ère intention non médicamenteuse"
            },
            "EVITER": { "Benzodiazépines au long cours": "STOPP B7 — chutes, dépendance, troubles cognitifs" }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "DÉMARCHE DIAGNOSTIQUE : (1) Différenciation TAG vs dépression masquée gériatrique (anhédonie/anhédonisme/symptômes somatiques peuvent dominer chez âgé) — comorbidité fréquente dans 50-60% des TAG du sujet âgé. (2) Différenciation TAG vs anxiété de démence débutante (MoCA < 26 + comportements répétitifs) — le TAG isolé sans déficit cognitif n'apparaît rarement après 65 ans pour la première fois. (3) Exclusion d'une CAUSE ORGANIQUE : hyperthyroïdie (TSH), phéochromocytome (rare), syndrome de sevrage BZD/OH, hypoglycémie répétée, iatrogénie (corticoïdes, β-agonistes, théophylline). (4) Échelles validées : GAD-7 (dépistage), HAM-A (sévérité), GDS-15 (dépression associée). (5) TCC en 1ère intention (efficacité ≥ médicamenteuse en gériatrie, AASM 2020)." },
                { note: "PHARMACOTHÉRAPIE : Démarrer ISRS à demi-dose habituelle puis titration lente (4 semaines entre paliers). Délai d'action 4-6 semaines. Réévaluer à 3 mois ; durée minimale 12 mois après rémission. ÉVITER absolument BZD au long cours et hydroxyzine — substitution progressive si déjà installées." }
            ],
            INITIER: [
                { classe: "Escitalopram (5-10 mg/j)", indication: "1ère intention", titration: "Démarrer 5 mg, augmenter à 4 semaines", surveillance_cardiaque: "QTc (dose max 10 mg chez > 65 ans)", niveau_preuve: "A" },
                { classe: "Sertraline (25-100 mg/j)", indication: "Alternative ISRS (profil QT favorable)", niveau_preuve: "A" },
                { classe: "Duloxétine (30-60 mg/j)", indication: "TAG + douleur neuropathique", niveau_preuve: "A" },
                { classe: "Buspirone (10-30 mg/j)", indication: "Alternative non sédative", niveau_preuve: "B" },
                { classe: "TCC / relaxation", indication: "1ère ligne avant pharmaco", niveau_preuve: "A" }
            ],
            EVITER: [
                { classe: "Benzodiazépines > 4 semaines", raison: "Chutes, dépendance, aggravation cognitive", gravite: "DECONSEILLE", ref_stopp: "STOPP B7" },
                { classe: "Hydroxyzine au long cours", raison: "Anticholinergique + QT long", gravite: "EVITER" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_002", "BIO_019", "BIO_031"],
            REGLES: [
                { bio: "BIO_002", nom: "Natrémie", seuils: { bas: { max: 130, note: "Hyponatrémie sous ISRS/IRSN (SIADH) — fréquente chez sujet âgé. Si < 130 : arrêt ISRS, switch buspirone ou autre classe." } }, frequence: "Avant introduction ISRS puis à 1 mois (pic SIADH), puis trimestrielle si stable", syndrome: "SYND_009" },
                { bio: "BIO_019", nom: "TSH", frequence: "Bilan étiologique initial systématique", note: "Exclure hyperthyroïdie (cause d'anxiété traitable). TSH < 0.4 + symptômes anxiété → bilan thyroïdien complet" },
                { bio: "BIO_031", nom: "QTc", frequence: "ECG avant escitalopram > 10 mg/j ou citalopram > 20 mg/j (à éviter chez âgé), à 1 mois, puis annuel", note: "Allongement QT dose-dépendant — adapter dose ou switch sertraline (profil QT favorable)", syndrome: "SYND_003" }
            ]
        }
    },
    "PAT_045": {
        ID: "PAT_045",
        NOM: "Psychose tardive (VLOSLP) / schizophrénie tardive",
        REFERENCE: "Howard Lancet Psychiatry 2018 | SFGG 2024 | Reinhardt & Cohen AJGP 2015",
        SOURCES_EBM: {
            "INITIER": {
                "Antipsychotiques atypiques à faible dose": "Howard 2018 — rispéridone, aripiprazole, olanzapine",
                "Évaluation cause secondaire": "SFGG 2024 — démence, iatrogène, sensoriel, somatique"
            },
            "EVITER": {
                "Halopéridol à dose non gériatrique": "Effets extrapyramidaux majeurs",
                "Clozapine en 1ère intention": "Risque agranulocytose, hypotension"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Éliminer une cause organique (delirium, démence, iatrogène, sensorielle). Dose ≤ 1/4 de la dose adulte. Titration très lente (« start low, go slow »)." }
            ],
            INITIER: [
                { classe: "Rispéridone (0.25-2 mg/j)", indication: "1ère intention — psychose non-DCL", surveillance_cardiaque: "QTc, TA", niveau_preuve: "B" },
                { classe: "Aripiprazole (2-10 mg/j)", indication: "Profil métabolique favorable", niveau_preuve: "B" },
                { classe: "Olanzapine (2.5-7.5 mg/j)", indication: "Si sédation recherchée, attention au syndrome métabolique", niveau_preuve: "B" },
                { classe: "Quétiapine (12.5-100 mg/j)", indication: "DCL/Parkinson associé", niveau_preuve: "C" }
            ],
            EVITER: [
                { classe: "Halopéridol > 1 mg/j", raison: "Effets extrapyramidaux, QT long, sédation", gravite: "EVITER" },
                { classe: "Chlorpromazine", raison: "Anticholinergique, hypotension orthostatique, QT", gravite: "EVITER" }
            ]
        },
        BIOLOGIE: { SURVEILLANCE_CIBLE: [{param: "Glycémie / HbA1c / bilan lipidique", cible: "Baseline + 3 mois", note: "Syndrome métabolique sous AP atypiques"}], REGLES: [] }
    },
    "PAT_046": {
        ID: "PAT_046",
        NOM: "Trouble bipolaire du sujet âgé",
        REFERENCE: "CANMAT 2018 | Sajatovic AJGP 2015 | SFGG 2024",
        SOURCES_EBM: {
            "INITIER": {
                "Lithium (0.4-0.8 mmol/L cible sujet âgé)": "CANMAT 2018 — 1ère ligne",
                "Valproate": "CANMAT 2018 — alternative",
                "Lamotrigine": "CANMAT 2018 — dépression bipolaire"
            },
            "EVITER": { "Carbamazépine": "Inducteur enzymatique, hyponatrémie, interactions ++" }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Lithiémie cible 0.4-0.8 mmol/L chez le sujet âgé (vs 0.6-1.0 chez adulte). Surveillance rénale et thyroïdienne trimestrielle." }
            ],
            INITIER: [
                { classe: "Lithium", indication: "Maintien, efficacité anti-suicide", titration: "150-300 mg/j initial, dosage à J5", bio_suivi: "Lithiémie, créatinine, TSH, Ca++", niveau_preuve: "A" },
                { classe: "Valproate (500-1500 mg/j)", indication: "Manie mixte ou CI au lithium", bio_suivi: "NFS, ASAT/ALAT, ammoniémie si confusion", niveau_preuve: "B" },
                { classe: "Lamotrigine (25-200 mg/j)", indication: "Dépression bipolaire, maintien", titration: "Très lente (risque Stevens-Johnson)", niveau_preuve: "A" },
                { classe: "Quétiapine (50-300 mg/j)", indication: "Manie ou dépression bipolaire", niveau_preuve: "A" }
            ],
            EVITER: [
                { classe: "Antidépresseurs en monothérapie", raison: "Risque de virage maniaque", gravite: "DECONSEILLE" },
                { classe: "Carbamazépine", raison: "Inducteur enzymatique puissant, SIADH, interactions multiples", gravite: "EVITER" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_029", "BIO_019", "BIO_003", "BIO_005"],
            REGLES: [
                { bio: "BIO_029", nom: "Lithiémie", frequence: "À J5 de toute modification de dose, puis trimestrielle si stable. Mensuelle si DFG borderline ou polymédication.", seuils: { cible_geriatrique: { min: 0.4, max: 0.8, note: "Cible âgé 0.4-0.8 mmol/L (vs 0.6-1.0 adulte) — meilleure tolérance, efficacité préservée (Sajatovic 2015)" }, alerte: { min: 1.0, note: "Surdosage : tremblements, troubles digestifs, somnolence — réduire dose 25-50%" }, toxique: { min: 1.5, note: "Toxicité aiguë : confusion, ataxie, fasciculations, troubles ECG — arrêt + hydratation IV + dialyse si > 2.5 ou symptômes graves" } }, syndrome: "SYND_028" },
                { bio: "BIO_019", nom: "TSH", frequence: "Avant introduction lithium, puis semestrielle (annuelle si stable)", note: "Hypothyroïdie sous lithium (10-30%) — supplémenter LT4, ne pas arrêter lithium si efficace" },
                { bio: "BIO_003", nom: "Créatinine/DFG", frequence: "Trimestrielle sous lithium (mensuelle si DFG < 60 ou diurétiques associés)", note: "Néphrotoxicité lithium (diabète insipide, IRC). DFG < 30 = relais nécessaire (valproate, lamotrigine)" },
                { bio: "BIO_005", nom: "Calcémie", frequence: "Annuelle sous lithium", note: "Hypercalcémie/hyperparathyroïdie sous lithium long cours (10-15%)" }
            ]
        }
    },
    "PAT_047": {
        ID: "PAT_047",
        NOM: "Catatonie",
        REFERENCE: "Rasmussen Neuropsychobiology 2016 | Sienaert BMC Psychiatry 2014",
        SOURCES_EBM: {
            "INITIER": {
                "Lorazépam test (1-2 mg IV/IM)": "Rasmussen 2016 — test diagnostique et thérapeutique",
                "ECT": "Sienaert 2014 — catatonie sévère/maligne, réponse rapide"
            },
            "EVITER": { "Antipsychotiques typiques": "Risque de syndrome malin (SNM) et aggravation" }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Urgence diagnostique (Bush-Francis Catatonia Rating Scale). Arrêter tout antipsychotique suspect. Lorazépam test en 1ère intention." }
            ],
            INITIER: [
                { classe: "Lorazépam (1-2 mg IV/IM, répétable)", indication: "Test diagnostique puis traitement", niveau_preuve: "A" },
                { classe: "ECT", indication: "Catatonie maligne, échec lorazépam à 48-72h", niveau_preuve: "A" },
                { classe: "Support symptomatique (hydratation, prévention MTEV, nutrition)", indication: "Systématique", niveau_preuve: "A" }
            ],
            EVITER: [
                { classe: "Antipsychotiques typiques", raison: "Syndrome malin des neuroleptiques, aggravation catatonie", gravite: "CONTRE-INDICATION" }
            ]
        },
        BIOLOGIE: { SURVEILLANCE_CIBLE: [{param: "CPK, Na, K, créatinine, température", cible: "Quotidien en phase aiguë", note: "Dépister catatonie maligne (CPK↑, hyperthermie, rhabdomyolyse)"}], REGLES: [] }
    },
    "PAT_048": {
        ID: "PAT_048",
        NOM: "Syndrome confusionnel (delirium)",
        REFERENCE: "HAS 2009 confusion âgée | NICE CG103 2023 | SFGG 2024",
        SOURCES_EBM: {
            "INITIER": {
                "Mesures non pharmacologiques (HELP)": "NICE 2023 — 1ère intention",
                "Halopéridol faible dose": "NICE 2023 — agitation sévère uniquement, dernier recours"
            },
            "EVITER": {
                "Benzodiazépines sauf sevrage OH/BZD": "Aggravent le delirium",
                "Anticholinergiques": "Précipitent et aggravent le delirium"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Chercher et traiter la cause (iatrogène, infection, globe, fécalome, douleur, sevrage, AVC, désordre métabolique). Mesures non pharmacologiques en 1ère intention. Pas d'antipsychotique prophylactique." }
            ],
            INITIER: [
                { classe: "Mesures HELP (réorientation, hydratation, mobilisation, appareillage sensoriel, sommeil)", indication: "1ère intention", niveau_preuve: "A" },
                { classe: "Halopéridol (0.25-0.5 mg PO/IM, max 2 mg/24h)", indication: "Agitation sévère avec danger, après échec non-pharmaco", surveillance_cardiaque: "QTc, pas si Parkinson/DCL", niveau_preuve: "B" },
                { classe: "Rispéridone (0.25-0.5 mg) ou Olanzapine (2.5-5 mg)", indication: "Alternative à halopéridol", niveau_preuve: "C" },
                { classe: "Quétiapine (12.5-25 mg)", indication: "Delirium sur DCL/Parkinson", niveau_preuve: "C" }
            ],
            EVITER: [
                { classe: "Benzodiazépines (sauf sevrage OH/BZD)", raison: "Aggravent le delirium, sédation paradoxale", gravite: "EVITER", ref_stopp: "STOPP B7" },
                { classe: "Anticholinergiques (score ACB ≥ 2)", raison: "Précipitent le delirium", gravite: "EVITER" },
                { classe: "Contention physique au long cours", raison: "Aggrave agitation, risque de blessure", gravite: "EVITER" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_001", "BIO_002", "BIO_003", "BIO_005", "BIO_009", "BIO_024", "BIO_025"],
            REGLES: [
                { bio: "BIO_002", nom: "Natrémie", seuils: { bas: { max: 130, note: "Hyponatrémie = cause fréquente de delirium chez âgé (thiazidiques, ISRS, carbamazépine, ICV — SIADH). Si < 125 : urgence (correction prudente max 8 mmol/L/24h)" } }, frequence: "Bilan initial systématique + à chaque épisode confusionnel", syndrome: "SYND_009" },
                { bio: "BIO_001", nom: "Kaliémie", seuils: { bas: { max: 3.0, note: "Hypokaliémie sévère → confusion, troubles du rythme — corriger" }, haut: { min: 5.5, note: "Hyperkaliémie → confusion, troubles du rythme" } }, frequence: "Bilan initial", syndrome: "SYND_011" },
                { bio: "BIO_003", nom: "Créatinine", frequence: "Bilan initial (IRA fonctionnelle = cause fréquente, déshydratation)", note: "Si créat ↑ vs base → adapter doses des médicaments rénaux + hydratation" },
                { bio: "BIO_005", nom: "Calcémie", seuils: { haut: { min: 2.6, note: "Hypercalcémie maligne ou primitive = cause traitable de confusion" }, bas: { max: 2.0, note: "Hypocalcémie symptomatique (tétanie, confusion)" } }, frequence: "Bilan initial", syndrome: "SYND_021" },
                { bio: "BIO_025", nom: "Glycémie", seuils: { bas: { max: 3.5, note: "Hypoglycémie (sulfamides, insuline) = urgence — resucrage + arrêt hypoglycémiant" }, haut: { min: 15, note: "Hyperglycémie majeure / cétoacidose / DKD" } }, frequence: "Capillaire systématique + veineux si anomalie", syndrome: "SYND_017" },
                { bio: "BIO_009", nom: "Hb", seuils: { bas: { max: 8, note: "Anémie sévère → confusion par hypoxie cérébrale — discuter transfusion" } }, frequence: "Bilan initial", syndrome: "SYND_005" },
                { bio: "BIO_024", nom: "CRP", seuils: { haut: { min: 50, note: "Syndrome inflammatoire → rechercher infection occulte (urine, poumon, peau, intra-abdo)" } }, frequence: "Bilan initial systématique", syndrome: "SYND_023" }
            ]
        }
    },
    "PAT_049": {
        ID: "PAT_049",
        NOM: "Insomnie chronique du sujet âgé",
        REFERENCE: "AASM 2021 | HAS 2006 sommeil | SFGG 2024",
        SOURCES_EBM: {
            "INITIER": {
                "TCC-I": "AASM 2021 — 1ère intention",
                "Mélatonine LP (2 mg)": "AASM 2021 — ≥55 ans, 1-2h avant coucher"
            },
            "EVITER": { "BZD et apparentés (zopiclone, zolpidem)": "STOPP B7 — chutes, dépendance" }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "TCC-I = gold standard. Éviter hypnotiques BZD/apparentés au long cours (max 4 semaines si indispensable)." }
            ],
            INITIER: [
                { classe: "TCC-I", indication: "1ère ligne", niveau_preuve: "A" },
                { classe: "Hygiène du sommeil", indication: "Systématique", niveau_preuve: "A" },
                { classe: "Mélatonine LP (2 mg)", indication: "≥ 55 ans, max 13 semaines", niveau_preuve: "B" },
                { classe: "Daridorexant (25-50 mg)", indication: "Antagoniste orexines — alternative", niveau_preuve: "B" }
            ],
            EVITER: [
                { classe: "Zopiclone / Zolpidem > 4 semaines", raison: "Chutes, dépendance, troubles mnésiques", gravite: "DECONSEILLE", ref_stopp: "STOPP B7" },
                { classe: "BZD à demi-vie longue (diazépam, flunitrazépam)", raison: "Accumulation, chutes", gravite: "EVITER", ref_stopp: "STOPP B1" },
                { classe: "Antihistaminiques H1 (hydroxyzine, doxylamine)", raison: "Anticholinergiques, sédation résiduelle", gravite: "EVITER", ref_beers: "Beers 2023" },
                { classe: "Trazodone > 50 mg en 1ère intention", raison: "Preuves faibles au long cours", gravite: "PRUDENCE" }
            ]
        },
        BIOLOGIE: { SURVEILLANCE_CIBLE: [], REGLES: [] }
    },
    "PAT_050": {
        ID: "PAT_050",
        NOM: "Trouble comportemental en sommeil paradoxal (TCSP)",
        REFERENCE: "AASM 2023 RBD | Schenck Sleep 2013 | SFGG 2024",
        SOURCES_EBM: {
            "INITIER": {
                "Mélatonine LI (3-12 mg)": "AASM 2023 — 1ère intention (sécurité supérieure au clonazépam)",
                "Clonazépam (0.25-0.5 mg)": "AASM 2023 — 2e intention"
            },
            "EVITER": { "Antidépresseurs sérotoninergiques (ISRS, IRSN, TCA)": "Peuvent induire/aggraver TCSP" }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Sécuriser la chambre (matelas au sol, dégager objets). Prodrome fréquent de synucléinopathie (Parkinson, DCL) — surveillance neurologique." }
            ],
            INITIER: [
                { classe: "Mélatonine LI à forte dose (3-12 mg au coucher)", indication: "1ère intention", niveau_preuve: "B" },
                { classe: "Clonazépam (0.25-0.5 mg au coucher, max 1 mg)", indication: "2e intention — attention chutes, confusion", niveau_preuve: "B" },
                { classe: "Aménagement de la chambre", indication: "Systématique", niveau_preuve: "A" }
            ],
            EVITER: [
                { classe: "ISRS/IRSN/TCA (sauf indication psychiatrique forte)", raison: "Induisent ou aggravent le TCSP", gravite: "PRUDENCE" },
                { classe: "Bêta-bloquants", raison: "Peuvent aggraver les troubles du sommeil", gravite: "PRUDENCE" }
            ]
        },
        BIOLOGIE: { SURVEILLANCE_CIBLE: [], REGLES: [] }
    },
    "PAT_051": {
        ID: "PAT_051",
        NOM: "Syndrome des jambes sans repos (SJSR)",
        REFERENCE: "AASM 2024 RLS | EFNS 2012 | SFGG 2024",
        SOURCES_EBM: {
            "INITIER": {
                "Bilan martial (ferritine, coefficient saturation)": "AASM 2024 — cible ferritine > 75 ng/mL",
                "Gabapentine / Gabapentin énacarbil": "AASM 2024 — 1ère intention sujet âgé",
                "Ropinirole / Pramipexole faible dose": "AASM 2024 — alternative (risque d'augmentation)"
            },
            "EVITER": {
                "Antidopaminergiques (métoclopramide, antipsychotiques)": "Aggravent le SJSR",
                "Antidépresseurs sérotoninergiques": "Peuvent aggraver (sauf bupropion)"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Corriger carence martiale (ferritine < 75 → fer PO/IV). Éviter agonistes dopaminergiques en 1ère intention (augmentation paradoxale)." }
            ],
            INITIER: [
                { classe: "Fer oral ou IV si ferritine < 75 ng/mL", indication: "1ère intention étiologique", niveau_preuve: "A" },
                { classe: "Gabapentine (300-900 mg au coucher)", indication: "1ère intention pharmaco chez sujet âgé", niveau_preuve: "A" },
                { classe: "Prégabaline (75-300 mg)", indication: "Alternative gabapentinoïde", niveau_preuve: "A" },
                { classe: "Ropinirole (0.25-1 mg) / Pramipexole (0.125-0.5 mg)", indication: "Échec gabapentinoïdes — surveiller augmentation", niveau_preuve: "A" }
            ],
            EVITER: [
                { classe: "Métoclopramide, antipsychotiques", raison: "Antidopaminergiques — aggravation SJSR", gravite: "EVITER" },
                { classe: "ISRS/IRSN (sauf bupropion)", raison: "Peuvent aggraver le SJSR", gravite: "PRUDENCE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_020", "BIO_009"],
            REGLES: [
                { bio: "BIO_020", nom: "Ferritine", seuils: { bas: { max: 75, note: "Cible thérapeutique SJSR > 75 ng/mL (Allen 2018, AASM 2024 RLS). Si < 75 : supplémentation Fer PO 100-200 mg/j ou IV (Ferinject 1000 mg) — efficacité prouvée sur sévérité SJSR. Coefficient saturation transferrine > 20% à viser." }, alerte: { max: 30, note: "Carence martiale franche → Fer IV à privilégier (résorption PO insuffisante)" } }, frequence: "Avant traitement spécifique + 3 mois après supplémentation Fer + annuelle" },
                { bio: "BIO_009", nom: "Hb", frequence: "Bilan initial", note: "Anémie ferriprive associée à dépister/traiter" }
            ]
        }
    },
    "PAT_052": {
        ID: "PAT_052",
        NOM: "Syndrome d'apnées obstructives du sommeil (SAOS)",
        REFERENCE: "ERS/ESC 2023 | HAS 2014 SAOS | SFGG 2024",
        SOURCES_EBM: {
            "INITIER": {
                "PPC": "HAS 2014 — 1ère intention si IAH ≥ 30 ou IAH 15-30 symptomatique",
                "Règles hygiéno-diététiques (poids, OH, décubitus)": "HAS 2014"
            },
            "EVITER": { "Hypnotiques (BZD, opioïdes)": "Aggravent le SAOS" }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Dépister devant ronflements, somnolence, HTA résistante, FA, hypoxie nocturne. PPC + règles hygiéno-diététiques. Éviter sédatifs." }
            ],
            INITIER: [
                { classe: "PPC nocturne", indication: "IAH ≥ 30 ou IAH 15-30 avec comorbidités CV/somnolence", niveau_preuve: "A" },
                { classe: "Orthèse d'avancée mandibulaire", indication: "SAOS léger/modéré ou intolérance PPC", niveau_preuve: "B" },
                { classe: "Perte de poids, arrêt OH, décubitus latéral", indication: "Systématique", niveau_preuve: "A" }
            ],
            EVITER: [
                { classe: "Benzodiazépines, zopiclone, zolpidem", raison: "Aggravent obstruction pharyngée et hypoxie", gravite: "EVITER", ref_stopp: "STOPP B7" },
                { classe: "Opioïdes au long cours", raison: "Dépression respiratoire centrale", gravite: "PRUDENCE" },
                { classe: "Alcool vespéral", raison: "Aggrave obstruction et désaturations", gravite: "EVITER" }
            ]
        },
        BIOLOGIE: { SURVEILLANCE_CIBLE: [{param: "TA, glycémie, FA/rythme", cible: "Comorbidités CV associées", note: ""}], REGLES: [] }
    },
    "PAT_053": {
        ID: "PAT_053",
        NOM: "Reflux gastro-œsophagien (RGO)",
        REFERENCE: "SNFGE 2024 | HAS | ACG 2022 (Katz) | AGA 2022 (Yadlapati) | ESGE 2022 | STOPP/START v3",
        SOURCES_EBM: {
            "INITIER": {
                "Mesures hygiéno-diététiques (perte poids, surélévation tête de lit, repas fractionnés, arrêt tabac/alcool)": "ACG 2022 — 1ère intention systématique, IIA",
                "Alginate (Gaviscon)": "SNFGE — symptômes post-prandiaux, sujet âgé, à la demande",
                "Antiacides (Maalox, Rennie)": "ACG 2022 — soulagement ponctuel",
                "IPP demi-dose 4-8 sem (oméprazole 10-20, pantoprazole 20)": "ACG 2022 §3, A — RGO typique fréquent",
                "IPP pleine dose 8 sem (oméprazole 20-40)": "ACG 2022 §3, A — œsophagite érosive endoscopique",
                "Endoscopie haute (FOGD)": "SNFGE — drapeaux rouges (dysphagie, anémie, AEG, hémorragie, > 50 ans)"
            },
            "EVITER": {
                "IPP > 8 semaines sans réévaluation": "STOPP F1 ; ACG 2022 — step-down après cicatrisation",
                "Métoclopramide chronique > 75 ans": "Beers 2023, STOPP K2 — risque extrapyramidal",
                "Dompéridone fortes doses ou prolongée": "ANSM 2014 — torsades de pointes, mort subite",
                "IPP + clopidogrel (oméprazole/ésoméprazole)": "FDA Black Box — préférer pantoprazole ou rabéprazole",
                "Antiacides + tétracyclines/quinolones/bisphosphonates simultanés": "RCP — chélation, ↓ absorption majeure"
            }
        },
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Diagnostic clinique si symptômes typiques (pyrosis, régurgitations) sans drapeau rouge — pas d'endoscopie d'emblée chez < 50 ans. Drapeaux rouges (dysphagie, odynophagie, perte poids, anémie, méléna, AEG, > 50 ans avec NOUVEAU symptôme) → FOGD impérative." },
                { note: "Sujet âgé : RGO souvent atypique (toux, asthme, douleur thoracique) ; tolérance accrue aux symptômes ; risque accru d'œsophagite sévère asymptomatique → seuil d'endoscopie plus bas." },
                { note: "Stratégie en escalier : (1) règles hygiéno-diététiques + alginate/antiacide à la demande → (2) IPP demi-dose 4 sem si symptômes ≥ 2/sem → (3) IPP pleine dose si œsophagite documentée → (4) step-down dès cicatrisation." },
                { note: "Déprescription IPP : essai après 8 sem si RGO non érosif. Step-down (pleine dose → demi-dose → à la demande → arrêt) sur 4-8 sem pour limiter le rebond acide. STOPP F1 — réévaluer toute prescription IPP > 8 sem." }
            ],
            INITIER: [
                { classe: "Mesures hygiéno-diététiques", indication: "Systématique, 1ère intention", note: "Perte de poids si IMC > 25 (efficacité forte) | Surélévation tête de lit 15-20 cm si symptômes nocturnes | Pas de décubitus dans les 3 h post-repas | Repas fractionnés | Arrêt tabac/alcool/café/chocolat/menthe/agrumes/repas gras | Arrêt OH vespéral", niveau_preuve: "IIA" },
                { classe: "Alginate (Gaviscon, Topaal) — sachet ou suspension", indication: "Symptômes post-prandiaux, à la demande, 1ère intention chez sujet âgé", note: "Effet barrière physique (raft) sur le contenu gastrique. Pas d'effet systémique. Pris APRÈS les repas et au coucher. Peu d'interactions (sauf chélation tétracyclines/quinolones/bisphosphonates → décaler ≥ 2 h).", niveau_preuve: "B" },
                { classe: "Antiacides (Maalox, Rennie, Phosphalugel)", indication: "Soulagement symptomatique ponctuel", note: "Décaler ≥ 2 h des autres médicaments (chélation). Éviter usage chronique chez sujet âgé (charge sodée, hypermagnésémie si IRC, alcalose).", niveau_preuve: "C" },
                { classe: "IPP demi-dose 4-8 semaines (oméprazole 10 mg, pantoprazole 20 mg, ésoméprazole 20 mg, lansoprazole 15 mg, rabéprazole 10 mg)", indication: "RGO typique fréquent (≥ 2 épisodes/sem) ou symptômes invalidants", note: "Prise 30-60 min AVANT le petit-déjeuner. Réévaluation à 4-8 sem : si efficace, step-down vers à-la-demande puis arrêt.", niveau_preuve: "IA" },
                { classe: "IPP pleine dose 8 semaines (oméprazole 20-40 mg, pantoprazole 40 mg, ésoméprazole 40 mg, lansoprazole 30 mg, rabéprazole 20 mg)", indication: "Œsophagite érosive (LA-A à LA-D), endobrachyœsophage, sténose peptique", note: "Contrôle endoscopique post-traitement si grade C/D. Maintenance long cours uniquement si EBO ou récidive systématique à l'arrêt.", niveau_preuve: "IA" },
                { classe: "Anti-H2 (famotidine 20-40 mg)", indication: "Alternative à l'IPP si intolérance ou symptômes nocturnes résiduels sous IPP", note: "Tachyphylaxie en 4-6 sem (perte d'efficacité). Ranitidine RETIRÉE du marché (NDMA, 2020). Cimétidine à éviter chez sujet âgé (anticholinergique, interactions CYP).", niveau_preuve: "B" },
                { classe: "FOGD (endoscopie haute)", indication: "Drapeaux rouges : dysphagie, odynophagie, perte de poids, anémie ferriprive, méléna/hématémèse, vomissements persistants, échec IPP pleine dose 8 sem, > 50 ans avec nouveau symptôme, surveillance EBO", note: "Permet diagnostic œsophagite (Los Angeles), EBO, sténose, exclusion néoplasie", niveau_preuve: "IA" }
            ],
            ABSORPTION_INTERACTIONS: {
                note: "Le RGO et son traitement modifient l'absorption de nombreux médicaments — point clé chez le sujet âgé polymédiqué.",
                IPP_DIMINUE_ABSORPTION: [
                    { medicament: "Kétoconazole, itraconazole", mecanisme: "Besoin d'acidité gastrique pour dissolution", action: "Préférer fluconazole, voriconazole, posaconazole comprimés gastrorésistants ou suspension à jeun", gravite: "MAJEURE" },
                    { medicament: "Fer oral (sulfate, fumarate)", mecanisme: "Acidité réduit Fe³⁺ → Fe²⁺ absorbable", action: "Privilégier voie IV si carence martiale documentée sous IPP au long cours, ou décaler ≥ 4 h (efficacité réduite mais non nulle)", gravite: "MODÉRÉE" },
                    { medicament: "Calcium carbonate", mecanisme: "Solubilisation pH-dépendante", action: "Préférer calcium citrate (absorption pH-indépendante) chez sujet âgé sous IPP au long cours, surtout si ostéoporose", gravite: "MODÉRÉE" },
                    { medicament: "Vitamine B12 (cyanocobalamine)", mecanisme: "Acidité requise pour libération de la B12 alimentaire (pas la forme synthétique)", action: "Doser B12 si IPP > 12 mois ; supplémenter PO ou IM si carence", gravite: "MODÉRÉE — long cours uniquement" },
                    { medicament: "Lévothyroxine", mecanisme: "Absorption pH-dépendante", action: "Augmenter la dose de 10-30% si IPP introduit chez patient équilibré ; recontrôler TSH à 6 sem", gravite: "MODÉRÉE" },
                    { medicament: "Rilpivirine, atazanavir, dasatinib, erlotinib, gefitinib, pazopanib", mecanisme: "Solubilisation pH-dépendante", action: "CONTRE-INDICATION ou décalage strict (atazanavir + IPP : éviter)", gravite: "MAJEURE — onco/VIH" }
                ],
                ANTIACIDES_DIMINUE_ABSORPTION: [
                    { medicament: "Tétracyclines (doxycycline, minocycline)", mecanisme: "Chélation par cations divalents (Mg²⁺, Al³⁺, Ca²⁺)", action: "Décaler ≥ 2 h", gravite: "MAJEURE" },
                    { medicament: "Fluoroquinolones (ciprofloxacine, ofloxacine, lévofloxacine, moxifloxacine)", mecanisme: "Chélation cations", action: "Décaler ≥ 2 h (antiacide pris APRÈS la quinolone)", gravite: "MAJEURE" },
                    { medicament: "Bisphosphonates (alendronate, risédronate)", mecanisme: "Chélation Ca²⁺/Mg²⁺/Al³⁺", action: "Décaler ≥ 30-60 min (alendronate prise à jeun seul, antiacide ≥ 2 h après)", gravite: "MAJEURE" },
                    { medicament: "Lévothyroxine", mecanisme: "Adsorption sur Al³⁺", action: "Décaler ≥ 4 h ; surveillance TSH si association régulière", gravite: "MODÉRÉE" },
                    { medicament: "Digoxine, énoxacine, fer oral, isoniazide, kétoconazole, pénicillamine", mecanisme: "Chélation/adsorption", action: "Décaler ≥ 2 h", gravite: "MODÉRÉE" }
                ],
                ALGINATES_DIMINUE_ABSORPTION: [
                    { medicament: "Tétracyclines, fluoroquinolones, bisphosphonates, lévothyroxine, sels de fer", mecanisme: "Chélation/adsorption locale (effet moindre que les antiacides)", action: "Décaler ≥ 2 h par sécurité", gravite: "MODÉRÉE" }
                ],
                IPP_AUTRES_INTERACTIONS_PHARMACOCINETIQUES: [
                    { medicament: "Clopidogrel + oméprazole/ésoméprazole", mecanisme: "Inhibition CYP2C19 → ↓ activation clopidogrel", action: "PRÉFÉRER pantoprazole ou rabéprazole (peu d'inhibition CYP2C19) — FDA Black Box", gravite: "MAJEURE" },
                    { medicament: "Méthotrexate haute dose + IPP", mecanisme: "↓ excrétion rénale MTX", action: "Suspendre IPP 24-48 h avant MTX HD ; remplacer par H2 ou alginate", gravite: "MAJEURE" },
                    { medicament: "Tacrolimus + oméprazole/ésoméprazole", mecanisme: "Inhibition CYP3A4/2C19 → ↑ taux tacrolimus", action: "Préférer pantoprazole/rabéprazole + monitorage taux tacrolimus", gravite: "MODÉRÉE" },
                    { medicament: "AVK (warfarine, fluindione) + oméprazole/ésoméprazole", mecanisme: "↑ INR (inhibition CYP2C9/2C19)", action: "Surveillance INR rapprochée à l'introduction ; préférer pantoprazole", gravite: "MODÉRÉE" }
                ]
            },
            EVITER: [
                { classe: "AINS au long cours", raison: "Aggravation RGO et risque ulcéreux ; gastroprotection IPP requise si AINS indispensable", gravite: "PRUDENCE", ref_stopp: "STOPP F2" },
                { classe: "IPP > 8 semaines sans réévaluation ni indication documentée", raison: "Hypomagnésémie, carence B12, fractures ostéoporotiques (hanche/vertèbres), C. difficile, pneumopathie communautaire, néphrite interstitielle aiguë, démence (lien controversé)", gravite: "DEPRESCRIRE — step-down (demi-dose → à la demande → arrêt sur 4-8 sem)", ref_stopp: "STOPP F1" },
                { classe: "Métoclopramide (Primpéran) au long cours, surtout > 75 ans", raison: "Effets extrapyramidaux (dyskinésies tardives, parkinsonisme), majoration risque chute, effet anticholinergique central limité mais réel", gravite: "EVITER si > 75 ans ou Parkinson", ref_stopp: "STOPP K2 ; Beers 2023" },
                { classe: "Dompéridone (Motilium) fortes doses ou > 1 sem", raison: "Allongement QT, torsades de pointes, mort subite (ANSM 2014). Si nécessaire : 10 mg x3/j max, 1 semaine, ECG préalable, éviter associations QT-allongeurs", gravite: "PRUDENCE — réservé situations spécifiques" },
                { classe: "Cimétidine", raison: "Anticholinergique central, confusion, gynécomastie, inhibiteur CYP majeur (interactions multiples : warfarine, théophylline, phénytoïne)", gravite: "EVITER chez sujet âgé", ref_stopp: "STOPP B6 ; Beers 2023" },
                { classe: "Ranitidine", raison: "RETIRÉE du marché (NDMA potentielle cancérogène, ANSM 2020)", gravite: "RETIRÉE — ne plus prescrire" },
                { classe: "Tétracyclines/quinolones/bisphosphonates pris simultanément aux antiacides ou alginates", raison: "Chélation → ↓ absorption majeure (échec thérapeutique)", gravite: "DECALER ≥ 2 h" },
                { classe: "Atazanavir, rilpivirine, dasatinib, erlotinib, gefitinib + IPP", raison: "Absorption pH-dépendante : IPP CONTRE-INDIQUÉ ou réduit gravement l'efficacité", gravite: "CONTRE-INDICATION (selon molécule)" }
            ],
            DEPRESCRIPTION: {
                indication: "RGO non érosif après 8 sem d'IPP avec contrôle des symptômes",
                methode: "Step-down progressif sur 4-8 sem : pleine dose → demi-dose 2-4 sem → à-la-demande 2-4 sem → arrêt avec alginate/antiacide à la demande",
                rebond_acide: "Possible 2-4 sem après arrêt brutal — gérer avec alginate, ne pas reprendre IPP en réflexe",
                contre_indication_arret: "EBO documenté, œsophagite récidivante grade C/D, sténose peptique, double antithrombotique au long cours",
                ref: "STOPP F1 ; HAS 2018 — déprescription IPP"
            }
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_006", "BIO_021", "BIO_005", "BIO_009", "BIO_020"],
            REGLES: [
                { bio: "BIO_006", frequence: "Si IPP > 6 mois", seuils: { bas: { max: 0.75, note: "HypoMg sous IPP — supplémenter Mg PO ou arrêter IPP" } }, syndrome: "SYND_022" },
                { bio: "BIO_021", frequence: "Si IPP > 12 mois", note: "Carence B12 par achlorhydrie — supplémenter si < 200 pg/mL", syndrome: "SYND_007" },
                { bio: "BIO_005", frequence: "Annuel si IPP > 12 mois", note: "Hypocalcémie indirecte (via hypoMg) ; surveillance ostéoporose si IPP + corticoïdes ou inhibiteur aromatase" },
                { bio: "BIO_009", frequence: "Si saignement aigu (méléna/hématémèse) → urgent ; sinon dépistage anémie 6-12 mois si symptômes atypiques", syndrome: "SYND_005" },
                { bio: "BIO_020", frequence: "Si anémie (Hb < 12)", note: "Rechercher saignement digestif occulte sur RGO compliqué (œsophagite ulcérée, EBO, sténose)", syndrome: "SYND_006" }
            ]
        },
        DECOMPENSATION_BIO: {
            triggers: [
                { bio: "BIO_009", condition: "Chute Hb > 2 g/dL + méléna/hématémèse", action: "Urgence hémorragique — endoscopie < 24h, IPP IV double dose, arrêt AINS/antithrombotique", syndrome: "SYND_005" },
                { bio: "BIO_006", condition: "< 0.5 mmol/L sous IPP", action: "Arrêt IPP, supplémentation Mg sulfate IV si symptômes, puis Mg per os ; switch vers anti-H2 ou alginate", syndrome: "SYND_022" },
                { bio: "BIO_021", condition: "B12 < 150 pg/mL sous IPP > 12 mois", action: "Supplémentation B12 PO (1 mg/j) ou IM (1 mg/sem x 4 puis mensuel)", syndrome: "SYND_007" }
            ]
        }
    }
};

const PATHO_SYNDROME_MAP = {
    "PAT_002": ["SYND_029", "SYND_010", "SYND_036"],
    "PAT_003": ["SYND_029", "SYND_010"],
    "PAT_004": ["SYND_036", "SYND_027", "SYND_030"],
    "PAT_005": ["SYND_010", "SYND_009", "SYND_011", "SYND_015", "SYND_045", "SYND_046", "SYND_050", "SYND_051"],
    "PAT_006": ["SYND_003", "SYND_027", "SYND_012", "SYND_010"],
    "PAT_007": ["SYND_027", "SYND_030"],
    "PAT_008": ["SYND_027", "SYND_035", "SYND_036"],
    "PAT_009": ["SYND_009", "SYND_011", "SYND_013", "SYND_046", "SYND_050"],
    "PAT_010": ["SYND_013", "SYND_009", "SYND_046", "SYND_047", "SYND_048"],
    "PAT_011": ["SYND_013", "SYND_017", "SYND_009", "SYND_046", "SYND_047", "SYND_048"],
    "PAT_012": ["SYND_013", "SYND_009", "SYND_046", "SYND_047"],
    "PAT_013": ["SYND_013", "SYND_046", "SYND_047"],
    "PAT_014": ["SYND_009", "SYND_011", "SYND_013"],
    "PAT_015": ["SYND_007", "SYND_009", "SYND_001"],
    "PAT_016": ["SYND_017", "SYND_018", "SYND_015"],
    "PAT_016a": ["SYND_017", "SYND_018", "SYND_015", "SYND_038"],
    "PAT_016b": ["SYND_017", "SYND_018", "SYND_015", "SYND_038", "SYND_046"],
    "PAT_017": ["SYND_013", "SYND_020"],
    "PAT_018": ["SYND_012", "SYND_019", "SYND_003"],
    "PAT_019": ["SYND_030", "SYND_002"],
    "PAT_020": ["SYND_004", "SYND_014", "SYND_033", "SYND_049"],
    "PAT_021": ["SYND_005", "SYND_006"],
    "PAT_022": ["SYND_011"],
    "PAT_023": ["SYND_015"],
    "PAT_024": ["SYND_016", "SYND_015"],
    "PAT_025": ["SYND_025", "SYND_020", "SYND_049"],
    "PAT_026": ["SYND_023", "SYND_024"],
    "PAT_027": ["SYND_013"],
    "PAT_028": ["SYND_009"],
    "PAT_029": ["SYND_015", "SYND_010", "SYND_020", "SYND_045"],
    "PAT_030": ["SYND_005", "SYND_033", "SYND_049"],
    "PAT_031": ["SYND_033", "SYND_025", "SYND_017"],
    "PAT_032": ["SYND_004", "SYND_013"],
    "PAT_033": [],
    "PAT_034": ["SYND_001", "SYND_033"],
    "PAT_035": ["SYND_003"],
    "PAT_036": ["SYND_027", "SYND_030"],
    "PAT_037": ["SYND_033", "SYND_025"],
    "PAT_038": ["SYND_033"],
    "PAT_039": [],
    "PAT_041": ["SYND_013", "SYND_027", "SYND_009"],
    "PAT_042": ["SYND_013", "SYND_009"],
    "PAT_043": ["SYND_013"],
    "PAT_044": ["SYND_004", "SYND_013"],
    "PAT_045": ["SYND_013", "SYND_004"],
    "PAT_046": ["SYND_004", "SYND_013"],
    "PAT_047": ["SYND_013", "SYND_033"],
    "PAT_048": ["SYND_013", "SYND_009"],
    "PAT_049": ["SYND_013", "SYND_009"],
    "PAT_050": ["SYND_009", "SYND_013"],
    "PAT_051": ["SYND_009"],
    "PAT_052": ["SYND_009", "SYND_003"],
    "PAT_053": ["SYND_005", "SYND_006", "SYND_022", "SYND_007"]
};

const PATHO_MED_INTERDITS = {
    "PAT_002": [
        { terme: "ains", raison: "CI absolue dans HFrEF", gravite: "CONTRE-INDICATION" },
        { terme: "dronedarone", raison: "Surmortalité HFrEF (ANDROMEDA)", gravite: "CONTRE-INDICATION" },
        { terme: "verapamil", raison: "Inotrope négatif", gravite: "CONTRE-INDICATION" },
        { terme: "diltiazem", raison: "Inotrope négatif", gravite: "CONTRE-INDICATION" },
        { terme: "pioglitazone", raison: "Rétention hydrosodée", gravite: "CONTRE-INDICATION" },
        { terme: "moxonidine", raison: "Surmortalité (MOXCON)", gravite: "CONTRE-INDICATION" }
    ],
    "PAT_006": [
        { terme: "dronedarone", condition: "FEVG ≤ 40% ou FA permanente", raison: "Surmortalité (PALLAS)", gravite: "CONTRE-INDICATION CONDITIONNELLE" }
    ],
    "PAT_010": [
        { terme: "haloperidol", raison: "Surmortalité et AVC chez le dément", gravite: "DECONSEILLE" },
        { terme: "chlorpromazine", raison: "Anticholinergique + sédation + chutes", gravite: "DECONSEILLE" }
    ],
    "PAT_012": [
        { terme: "haloperidol", raison: "Sensibilité neuroleptique sévère en DCL — risque SNM/coma (McKeith 2017)", gravite: "CONTRE-INDICATION ABSOLUE" },
        { terme: "chlorpromazine", raison: "Antipsychotique typique CI absolue en DCL", gravite: "CONTRE-INDICATION ABSOLUE" },
        { terme: "clozapine", raison: "Risque de coma documenté en DCL (Watts 2022)", gravite: "CONTRE-INDICATION" },
        { terme: "risperidone", raison: "Aggravation parkinsonienne, sensibilité neuroleptique en DCL", gravite: "DECONSEILLE" },
        { terme: "olanzapine", raison: "Sensibilité neuroleptique, sédation excessive en DCL", gravite: "DECONSEILLE" },
        { terme: "metoclopramide", raison: "Antidopaminergique central — aggravation motrice en DCL", gravite: "CONTRE-INDICATION" },
        { terme: "biperidene", raison: "Anticholinergique — aggrave cognition et hallucinations en DCL", gravite: "CONTRE-INDICATION" },
        { terme: "trihexyphenidyle", raison: "Anticholinergique — aggrave cognition et hallucinations en DCL", gravite: "CONTRE-INDICATION" }
    ],
    "PAT_014": [
        { terme: "haloperidol", raison: "Anti-D2 → aggravation parkinsonisme", gravite: "CONTRE-INDICATION ABSOLUE" },
        { terme: "metoclopramide", raison: "Anti-D2 → aggravation parkinsonisme", gravite: "CONTRE-INDICATION ABSOLUE" },
        { terme: "risperidone", raison: "Anti-D2", gravite: "DECONSEILLE" }
    ],
    "PAT_022": [
        { terme: "propranolol", raison: "Bronchospasme — CI absolue dans l'asthme", gravite: "CONTRE-INDICATION ABSOLUE" },
        { terme: "timolol", raison: "Même collyre — CI dans asthme", gravite: "CONTRE-INDICATION" },
        { terme: "nadolol", raison: "BB non sélectif — CI asthme", gravite: "CONTRE-INDICATION" },
        { terme: "sotalol", raison: "BB non sélectif — CI asthme", gravite: "CONTRE-INDICATION" }
    ]
};

const PATHO_MED_INTERDITS_V2_ADDITIONS = {
    "PAT_007": [
        { terme: "ains", raison: "Risque thrombotique CV + hémorragique digestif en AOMI", gravite: "DECONSEILLE" }
    ],
    "PAT_008": [
        { terme: "ains", raison: "Risque thrombotique post-AVC", gravite: "DECONSEILLE" }
    ],
    "PAT_009": [
        { terme: "tamsulosine", raison: "Aggrave hypotension orthostatique", gravite: "DEPRESCRIRE si possible" },
        { terme: "alfuzosine", raison: "Aggrave hypotension orthostatique", gravite: "DEPRESCRIRE si possible" },
        { terme: "doxazosine", raison: "Alpha-bloquant hypotenseur", gravite: "DEPRESCRIRE" }
    ],
    "PAT_010": [
        { terme: "oxybutynine", raison: "ACB 3 — aggravation cognitive majeure", gravite: "CONTRE-INDICATION" },
        { terme: "hydroxyzine", raison: "ACB 3 — sédation et confusion", gravite: "CONTRE-INDICATION" },
        { terme: "amitriptyline", raison: "ACB 3 — sédation, confusion, chutes", gravite: "CONTRE-INDICATION" }
    ],
    "PAT_011": [
        { terme: "oxybutynine", raison: "Antagonise IAChE dans Alzheimer", gravite: "CONTRE-INDICATION" }
    ],
    "PAT_013": [
        { terme: "donepezil", raison: "Pas de déficit cholinergique dans DFT — risque aggravation", gravite: "DECONSEILLE" },
        { terme: "rivastigmine", raison: "Non indiqué dans DFT", gravite: "DECONSEILLE" }
    ],
    "PAT_015": [
        { terme: "tramadol", raison: "Abaisse seuil épileptogène", gravite: "DECONSEILLE" },
        { terme: "bupropion", raison: "Abaisse seuil épileptogène", gravite: "CONTRE-INDICATION" }
    ],
    "PAT_016": [
        { terme: "glibenclamide", raison: "Hypoglycémie prolongée grave chez le sujet âgé", gravite: "CONTRE-INDICATION gériatrique" },
        { terme: "pioglitazone", raison: "Rétention hydrosodée si IC, fractures si ostéoporose", gravite: "PRUDENCE" }
    ],
    "PAT_016a": [
        { terme: "glibenclamide", raison: "Inefficace en DT1 + hypoglycémie prolongée", gravite: "CONTRE-INDICATION" },
        { terme: "gliclazide", raison: "Inefficace en DT1 (déficit absolu d'insuline)", gravite: "CONTRE-INDICATION" },
        { terme: "metformine", raison: "Ne substitue pas l'insuline en DT1", gravite: "DECONSEILLE en monothérapie" },
        { terme: "pioglitazone", raison: "Non indiqué en DT1", gravite: "DECONSEILLE" }
    ],
    "PAT_016b": [
        { terme: "glibenclamide", raison: "Hypoglycémie prolongée grave chez le sujet âgé", gravite: "CONTRE-INDICATION gériatrique" },
        { terme: "pioglitazone", raison: "Rétention hydrosodée si IC, fractures si ostéoporose", gravite: "PRUDENCE" }
    ],
    "PAT_023": [
        { terme: "propranolol", raison: "BB non sélectif — bronchospasme dans BPCO sévère", gravite: "PRUDENCE" }
    ],
    "PAT_024": [
        { terme: "hydrochlorothiazide", raison: "Augmente uricémie, déclenche crises de goutte", gravite: "PRUDENCE — adapter hypouricémiant" },
        { terme: "furosemide", raison: "Augmente uricémie", gravite: "PRUDENCE" }
    ],
    "PAT_029": [
        { terme: "ains", raison: "Néphrotoxicité directe, CI si DFG < 30", gravite: "CONTRE-INDICATION" },
        { terme: "metformine", condition: "DFG < 30", raison: "Acidose lactique", gravite: "CONTRE-INDICATION" },
        { terme: "gentamicine", raison: "Néphrotoxicité cumulée", gravite: "PRUDENCE — dose unique/j + monitoring" }
    ]
};

const PATHO_MED_INTERDITS_V3_ADDITIONS = {
    "PAT_003": [
        { terme: "ains", raison: "Rétention hydrosodée, décompensation IC", gravite: "CONTRE-INDICATION" }
    ],
    "PAT_004": [
        { terme: "ains", raison: "Risque thrombotique CV + hémorragique digestif", gravite: "CONTRE-INDICATION RELATIVE" }
    ],
    "PAT_005": [
        { terme: "ains", raison: "Antagonise l'effet antihypertenseur, néphrotoxicité", gravite: "DECONSEILLE" },
        { terme: "doxazosine", raison: "Pas de réduction mortalité CV en monothérapie (ALLHAT), hypotension orthostatique", gravite: "DECONSEILLE sauf indication prostatique" },
        { terme: "prazosine", raison: "Alpha-bloquant — hypotension orthostatique chez le sujet âgé", gravite: "DECONSEILLE en monothérapie antihypertensive" }
    ],
    "PAT_017": [
        { terme: "lithium", raison: "Induit hypothyroïdie — surveillance TSH renforcée", gravite: "PRUDENCE" },
        { terme: "amiodarone", raison: "Hypothyroïdie induite fréquente (effet Wolff-Chaikoff)", gravite: "PRUDENCE — monitoring TSH /3 mois" }
    ],
    "PAT_018": [
        { terme: "amiodarone", raison: "Thyréotoxicose type 1 ou 2 si ATCD thyroïdien", gravite: "PRUDENCE — discussion cardio/endocrino" },
        { terme: "lithium", raison: "Peut masquer puis démasquer thyrotoxicose", gravite: "SURVEILLANCE renforcée TSH" }
    ],
    "PAT_019": [
        { terme: "gemfibrozil", raison: "Rhabdomyolyse par inhibition glucuronidation si associé à statine", gravite: "CONTRE-INDICATION ABSOLUE avec statine" }
    ],
    "PAT_021": [
        { terme: "ains", raison: "Récidive ulcéreuse, saignement digestif", gravite: "CONTRE-INDICATION si UGD actif ou récent" },
        { terme: "aspirine", condition: "UGD actif ou récent < 3 mois", raison: "Risque hémorragique digestif majeur", gravite: "CONTRE-INDICATION TEMPORAIRE — réévaluer après cicatrisation" },
        { terme: "corticoide", raison: "Risque ulcère gastrique, surtout si association AINS/aspirine", gravite: "PRUDENCE — associer IPP si indispensable" }
    ],
    "PAT_025": [
        { terme: "corticoide", raison: "Ostéoporose cortisonique — prévention par bisphosphonate si > 3 mois", gravite: "SURVEILLANCE" },
        { terme: "glitazone", raison: "Augmentation du risque fracturaire (pioglitazone)", gravite: "DECONSEILLE" },
        { terme: "pioglitazone", raison: "Augmentation du risque fracturaire", gravite: "DECONSEILLE" }
    ],
    "PAT_026": [
        { terme: "ciprofloxacine", condition: "Cystite simple", raison: "EI graves (tendinopathie, neuropathie, rupture aortique) — pas en 1ère intention", gravite: "DECONSEILLE en première intention" },
        { terme: "ofloxacine", condition: "Cystite simple", raison: "Fluoroquinolone — EI graves, sélection résistances", gravite: "DECONSEILLE en première intention" },
        { terme: "levofloxacine", condition: "Cystite simple", raison: "Fluoroquinolone — EI graves, sélection résistances", gravite: "DECONSEILLE en première intention" },
        { terme: "nitrofurantoine", condition: "Traitement > 14 jours", raison: "Pneumopathie interstitielle, hépatotoxicité au long cours", gravite: "CONTRE-INDICATION" }
    ],
    "PAT_027": [
        { terme: "benzodiazepine", raison: "Sédation résiduelle, chutes, confusion, dépendance chez le sujet âgé", gravite: "DECONSEILLE" },
        { terme: "zolpidem", raison: "Mêmes risques que BZD : chutes, confusion, dépendance", gravite: "DECONSEILLE" },
        { terme: "zopiclone", raison: "Mêmes risques que BZD : chutes, confusion, dépendance", gravite: "DECONSEILLE" },
        { terme: "hydroxyzine", raison: "Charge anticholinergique élevée, confusion, rétention urinaire", gravite: "DECONSEILLE" },
        { terme: "doxylamine", raison: "Antihistaminique sédatif — charge anticholinergique, confusion", gravite: "DECONSEILLE" }
    ],
    "PAT_028": [
        { terme: "acetylleucine", raison: "Retarde la compensation vestibulaire, sédation", gravite: "DECONSEILLE > 3-5 jours" },
        { terme: "meclozine", raison: "Retarde la compensation vestibulaire, sédation, anticholinergique", gravite: "DECONSEILLE > 3-5 jours" },
        { terme: "benzodiazepine", raison: "Sédation, chutes, retarde compensation vestibulaire", gravite: "DECONSEILLE > 48h" }
    ],
    "PAT_030": [
        { terme: "statine", raison: "Déprescrire en soins palliatifs — pas de bénéfice à court terme", gravite: "DEPRESCRIRE" },
        { terme: "bisphosphonate", raison: "Déprescrire en soins palliatifs — bénéfice différé", gravite: "DEPRESCRIRE" },
        { terme: "metformine", condition: "Pronostic < 3 mois", raison: "Risque acidose lactique, bénéfice nul en fin de vie", gravite: "DEPRESCRIRE" },
        { terme: "glibenclamide", condition: "Pronostic < 3 mois", raison: "Hypoglycémie grave, relâcher cibles glycémiques", gravite: "DEPRESCRIRE" }
    ],
    "PAT_031": [
        { terme: "benzodiazepine", raison: "Chutes, confusion, dépendance — sevrage progressif si > 4 semaines", gravite: "DEPRESCRIRE" },
        { terme: "oxybutynine", raison: "Charge anticholinergique élevée (ACB 3) chez patient fragile", gravite: "DECONSEILLE" },
        { terme: "hydroxyzine", raison: "Charge anticholinergique élevée (ACB 3) — confusion, sédation", gravite: "DECONSEILLE" },
        { terme: "amitriptyline", raison: "Charge anticholinergique élevée (ACB 3) — chutes, confusion", gravite: "DECONSEILLE" }
    ],
    "PAT_020": [
        { terme: "methotrexate", condition: "Sans surveillance NFS/hépatique", raison: "Pancytopénie, hépatotoxicité — surveillance NFS et bilan hépatique obligatoires", gravite: "SURVEILLANCE OBLIGATOIRE" },
        { terme: "ains", raison: "Néphrotoxicité, interaction avec chimiothérapie (ex: méthotrexate), risque hémorragique si thrombopénie", gravite: "PRUDENCE" }
    ],
    "PAT_032": [
        { terme: "amitriptyline", raison: "Tricyclique : ACB élevé, QT, chutes — non recommandé en 1ère intention", gravite: "DECONSEILLE" },
        { terme: "clomipramine", raison: "Tricyclique : ACB élevé, QT, sédation", gravite: "DECONSEILLE" },
        { terme: "imipramine", raison: "Tricyclique : ACB élevé, QT, sédation", gravite: "DECONSEILLE" },
        { terme: "dosulpine", raison: "Tricyclique : ACB 3, QT, PIM absolu en gériatrie", gravite: "CONTRE-INDICATION" },
        { terme: "benzodiazepine", raison: "Pas d'indication dans la dépression, risque de dépendance", gravite: "DECONSEILLE" }
    ],
    "PAT_033": [
        { terme: "oxybutynine", raison: "Anticholinergique systémique → mydriase → crise glaucome aigu", gravite: "CONTRE-INDICATION" },
        { terme: "solifenacine", raison: "Anticholinergique → risque glaucome aigu", gravite: "CONTRE-INDICATION" },
        { terme: "trospium", raison: "Anticholinergique → risque glaucome aigu", gravite: "CONTRE-INDICATION" },
        { terme: "fesoterodine", raison: "Anticholinergique → risque glaucome aigu", gravite: "CONTRE-INDICATION" },
        { terme: "amitriptyline", raison: "Anticholinergique puissant → mydriase", gravite: "CONTRE-INDICATION" },
        { terme: "clomipramine", raison: "Anticholinergique puissant → mydriase", gravite: "CONTRE-INDICATION" },
        { terme: "hydroxyzine", raison: "Anticholinergique → risque mydriase", gravite: "DECONSEILLE" },
        { terme: "ipratropium", raison: "Contact oculaire direct → crise glaucome", gravite: "PRUDENCE" },
        { terme: "tiotropium", raison: "Anticholinergique inhalé — risque résiduel", gravite: "PRUDENCE" }
    ],
    "PAT_034": [
        { terme: "ains", raison: "CI dans cirrhose : hémorragie digestive, décompensation rénale, ascite", gravite: "CONTRE-INDICATION" },
        { terme: "methotrexate", raison: "Hépatotoxicité directe — fibrose hépatique", gravite: "CONTRE-INDICATION" },
        { terme: "amiodarone", raison: "Hépatotoxicité cumulative sévère", gravite: "CONTRE-INDICATION" },
        { terme: "valproate", raison: "Hépatotoxicité idiosyncrasique", gravite: "CONTRE-INDICATION" },
        { terme: "paracetamol", condition: "> 2 g/j", raison: "Seuil hépatotoxicité abaissé en cirrhose (max 2 g/j)", gravite: "PRUDENCE" },
        { terme: "benzodiazepine", raison: "Encéphalopathie hépatique — métabolisme prolongé", gravite: "DECONSEILLE" },
        { terme: "morphine", raison: "Métabolisme hépatique ralenti — encéphalopathie", gravite: "DECONSEILLE" },
        { terme: "tramadol", raison: "Métabolisme hépatique — accumulation", gravite: "DECONSEILLE" }
    ],
    "PAT_035": [
        { terme: "betabloquant", raison: "Chronotrope négatif — aggravation bradycardie sévère", gravite: "CONTRE-INDICATION" },
        { terme: "verapamil", raison: "Chronotrope négatif — risque BAV complet", gravite: "CONTRE-INDICATION" },
        { terme: "diltiazem", raison: "Chronotrope négatif — risque BAV", gravite: "CONTRE-INDICATION" },
        { terme: "digoxine", raison: "Chronotrope négatif — BAV", gravite: "CONTRE-INDICATION" },
        { terme: "ivabradine", raison: "Bradycardisant direct (If)", gravite: "CONTRE-INDICATION" },
        { terme: "amiodarone", raison: "Bradycardie sinusale, BAV", gravite: "PRUDENCE" },
        { terme: "donepezil", raison: "Effet vagomimétique → bradycardie", gravite: "PRUDENCE" },
        { terme: "rivastigmine", raison: "Effet vagomimétique → bradycardie", gravite: "PRUDENCE" },
        { terme: "clonidine", raison: "Sympatholytique central → bradycardie", gravite: "DECONSEILLE" }
    ],
    "PAT_036": [
        { terme: "ains", raison: "Risque hémorragique sous anticoagulation", gravite: "CONTRE-INDICATION" },
        { terme: "tamoxifene", raison: "Risque thrombogène — CI si ATCD MTEV", gravite: "CONTRE-INDICATION" }
    ],
    "PAT_037": [
        { terme: "corticoide", raison: "Catabolisme protéique musculaire — aggravation sarcopénie", gravite: "DECONSEILLE au long cours" }
    ],
    "PAT_038": [
        { terme: "antipsychotique", raison: "Altère le réflexe de déglutition — pneumopathie d'inhalation", gravite: "DECONSEILLE" },
        { terme: "benzodiazepine", raison: "Sédation → diminution réflexes protecteurs voies aériennes", gravite: "PRUDENCE" }
    ],
    "PAT_039": [
        { terme: "oxybutynine", raison: "ACB 3, passage BHE élevé — confusion, déclin cognitif chez le sujet âgé (Beers 2023, STOPP H2)", gravite: "CONTRE-INDICATION gériatrique" },
        { terme: "solifenacine", raison: "Anticholinergique — charge cognitive, sécheresse, constipation. Préférer mirabégron.", gravite: "DECONSEILLE" },
        { terme: "tolterodine", raison: "Anticholinergique — préférer mirabégron chez le sujet âgé", gravite: "DECONSEILLE" },
        { terme: "fesoterodine", raison: "Anticholinergique — charge cognitive. Préférer mirabégron.", gravite: "DECONSEILLE" },
        { terme: "furosemide", condition: "si HTA seule indication", raison: "Aggrave l'incontinence par polyurie — switch vers thiazidique si possible", gravite: "DECONSEILLE" }
    ],
};

// ============================================================================
// PATHO_MED_INTERDITS_V4 — Couverture par CLASSE thérapeutique (EBM 2024-2025)
// Sources : ESC 2023 HF/AF/ACS/VTE Guidelines, KDIGO 2024, EASL Cirrhosis,
//           Beers 2023, STOPP/START v3, HAS recommandations gériatriques
// Le terme matche sur dci.includes(terme) || classe.includes(terme)
// ============================================================================
const PATHO_MED_INTERDITS_V4_CLASSES = {


    // PAT_002 — Cardiopathie (générale)
    "PAT_002": [
        { terme: "triptan", raison: "Vasospasme coronaire — CI si cardiopathie ischémique (EMA/FDA)", gravite: "CONTRE-INDICATION" }
    ],

    // PAT_003 — Fibrillation auriculaire
    "PAT_003": [
        { terme: "flecainide", condition: "si cardiopathie structurelle", raison: "Proarythmie — CI si FEVG altérée (ESC 2024 AF)", gravite: "PRUDENCE" },
        { terme: "propafenone", condition: "si cardiopathie structurelle", raison: "Proarythmie — CI si FEVG altérée", gravite: "PRUDENCE" }
    ],

    // PAT_004 — Coronarien / SCA
    "PAT_004": [
        { terme: "triptan", raison: "Vasospasme coronaire — CI absolue post-SCA (ESC 2023 ACS)", gravite: "CONTRE-INDICATION" },
        { terme: "ergot", raison: "Vasospasme coronaire — CI absolue", gravite: "CONTRE-INDICATION" }
    ],

    // PAT_005 — HTA non contrôlée
    "PAT_005": [
        { terme: "triptan", raison: "Risque vasculaire si HTA non contrôlée (> 180/110)", gravite: "CONTRE-INDICATION" },
        { terme: "corticoide", condition: "systémique", raison: "Rétention hydrosodée → aggravation HTA", gravite: "PRUDENCE" },
        { terme: "ergot", raison: "Vasospasme — CI si HTA sévère non contrôlée", gravite: "CONTRE-INDICATION" },
        { terme: "ciclosporine", raison: "HTA dose-dépendante (néphrotoxicité)", gravite: "PRUDENCE" }
    ],

    // PAT_006 — Diabète
    "PAT_006": [
        { terme: "corticoide", condition: "systémique", raison: "Hyperglycémie dose-dépendante — adapter insuline/ADO", gravite: "PRUDENCE" },
        { terme: "thiazidique", raison: "Hyperglycémie dose-dépendante, hypokaliémie → ↓ sécrétion insuline", gravite: "PRUDENCE" },
        { terme: "antipsychotique", raison: "Syndrome métabolique — prise de poids, dyslipidémie, insulinorésistance. Risque maximal : olanzapine, clozapine, quetiapine (ADA 2024)", gravite: "PRUDENCE" }
    ],

    // PAT_007 — Insuffisance rénale chronique (modérée)
    "PAT_007": [
        { terme: "metformine", condition: "si DFG < 30", raison: "Risque acidose lactique si IRC sévère (KDIGO 2024)", gravite: "CONTRE-INDICATION" },
        { terme: "lithium", raison: "Index thérapeutique étroit — accumulation rénale", gravite: "PRUDENCE" },
        { terme: "bisphosphonate", condition: "si DFG < 30-35", raison: "CI si IRC sévère — nécrose tubulaire", gravite: "PRUDENCE" }
    ],

    // PAT_008 — AVC / AIT
    "PAT_008": [
        { terme: "triptan", raison: "CI si ATCD AVC — risque vasospasme cérébral", gravite: "CONTRE-INDICATION" },
        { terme: "ergot", raison: "Vasospasme cérébral — CI absolue post-AVC", gravite: "CONTRE-INDICATION" },
        { terme: "antipsychotique", raison: "↑ mortalité cérébrovasculaire chez le sujet âgé (FDA black box)", gravite: "PRUDENCE" }
    ],

    // PAT_009 — HBP / troubles mictionnels
    "PAT_009": [
        { terme: "anticholinergique", raison: "Rétention urinaire — aggravation HBP", gravite: "DECONSEILLE" },
        { terme: "tricyclique", raison: "Effet anticholinergique → rétention urinaire", gravite: "DECONSEILLE" }
    ],

    // PAT_010 — Démence
    "PAT_010": [
        { terme: "anticholinergique", raison: "Aggravation cognitive — antagonisme du traitement pro-cholinergique (Beers 2023)", gravite: "CONTRE-INDICATION" },
        { terme: "benzodiazepine", raison: "Confusion, sédation, chutes — PIM en démence (STOPP v3)", gravite: "DECONSEILLE" },
        { terme: "antipsychotique", raison: "↑ mortalité et AVC chez déments (FDA black box)", gravite: "PRUDENCE" },
        { terme: "tricyclique", raison: "ACB élevé — aggravation cognitive", gravite: "CONTRE-INDICATION" }
    ],

    // PAT_012 — Maladie de Parkinson
    "PAT_012": [
        { terme: "antipsychotique", raison: "Antagonisme dopaminergique → aggravation syndrome parkinsonien", gravite: "CONTRE-INDICATION" },
        { terme: "metoclopramide", raison: "Antidopaminergique central — aggravation parkinson", gravite: "CONTRE-INDICATION" },
        { terme: "metopimazine", raison: "Antidopaminergique — risque extrapyramidal", gravite: "PRUDENCE" }
    ],

    // PAT_014 — Syndrome extrapyramidal
    "PAT_014": [
        { terme: "antipsychotique", raison: "Risque d'aggravation extrapyramidale", gravite: "PRUDENCE" }
    ],

    // PAT_015 — Épilepsie
    "PAT_015": [
        { terme: "fluoroquinolone", raison: "Abaisse seuil épileptogène (ANSM 2019)", gravite: "PRUDENCE" },
        { terme: "antipsychotique", raison: "Abaisse seuil épileptogène", gravite: "PRUDENCE" },
        { terme: "isrs", condition: "à dose élevée", raison: "Hyponatrémie → convulsions (rare)", gravite: "PRUDENCE" }
    ],

    // PAT_016 — Hypoglycémies (umbrella)
    "PAT_016": [
        { terme: "sulfamide", raison: "Risque hypoglycémique élevé chez le sujet âgé", gravite: "PRUDENCE" },
        { terme: "glinide", raison: "Sécrétagogue insuline — risque hypoglycémie", gravite: "PRUDENCE" },
        { terme: "fluoroquinolone", raison: "Dysglycémie (hypo et hyper) — FDA warning", gravite: "PRUDENCE" }
    ],
    // PAT_016a — Risques DT1
    "PAT_016a": [
        { terme: "betabloquant", raison: "Masque symptômes d'hypoglycémie (tachycardie, tremblements) ; favoriser cardiosélectif", gravite: "PRUDENCE" },
        { terme: "fluoroquinolone", raison: "Dysglycémie (hypo et hyper) — FDA warning", gravite: "PRUDENCE" },
        { terme: "corticoide", raison: "Hyperglycémie — réadapter l'insuline systématiquement", gravite: "PRUDENCE" }
    ],
    // PAT_016b — Hypoglycémies DT2
    "PAT_016b": [
        { terme: "sulfamide", raison: "Risque hypoglycémique élevé chez le sujet âgé", gravite: "PRUDENCE" },
        { terme: "glinide", raison: "Sécrétagogue insuline — risque hypoglycémie", gravite: "PRUDENCE" },
        { terme: "fluoroquinolone", raison: "Dysglycémie (hypo et hyper) — FDA warning", gravite: "PRUDENCE" }
    ],

    // PAT_019 — Insuffisance rénale (interaction statine)
    "PAT_019": [
        { terme: "ains", raison: "Néphrotoxicité — vasoconstriction afférente (KDIGO 2024)", gravite: "CONTRE-INDICATION" },
        { terme: "lithium", raison: "Index thérapeutique étroit — accumulation si IRC", gravite: "PRUDENCE" },
        { terme: "ciclosporine", raison: "Néphrotoxicité dose-dépendante", gravite: "PRUDENCE" }
    ],

    // PAT_020 — Polyarthrite / rhumatisme inflammatoire
    "PAT_020": [
        { terme: "corticoide", condition: "≤ 7.5 mg/j prednisone eq.", raison: "Dose minimale efficace — risque ostéoporose, diabète (EULAR 2023)", gravite: "PRUDENCE" }
    ],

    // PAT_021 — ATCD ulcère gastrique / hémorragie digestive
    "PAT_021": [
        { terme: "isrs", raison: "↑ risque hémorragique GI (inhibition sérotonine plaquettaire) — associer IPP", gravite: "PRUDENCE" },
        { terme: "irsna", raison: "↑ risque hémorragique GI — associer IPP si ATCD ulcère", gravite: "PRUDENCE" },
        { terme: "antiagregant", raison: "Risque hémorragique digestif — gastroprotection par IPP", gravite: "PRUDENCE" },
        { terme: "anticoagulant", raison: "Risque hémorragique digestif — gastroprotection recommandée", gravite: "PRUDENCE" }
    ],

    // PAT_022 — Asthme / BPCO
    "PAT_022": [
        { terme: "betabloquant", raison: "Bronchospasme — CI si asthme, prudence si BPCO (GINA 2024)", gravite: "CONTRE-INDICATION" }
    ],

    // PAT_024 — Goutte
    "PAT_024": [
        { terme: "thiazidique", raison: "Hyperuricémie — aggravation goutte", gravite: "DECONSEILLE" },
        { terme: "aspirine", condition: "faible dose", raison: "Diminue l'excrétion urique — aggravation potentielle", gravite: "PRUDENCE" },
        { terme: "ciclosporine", raison: "Hyperuricémie — aggravation goutte", gravite: "PRUDENCE" }
    ],

    // PAT_025 — Ostéoporose
    "PAT_025": [
        { terme: "ipp", condition: "> 1 an", raison: "↑ risque fracture si usage prolongé > 12 mois (ACG 2024)", gravite: "PRUDENCE" },
        { terme: "antiepileptique", raison: "Inducteurs enzymatiques ↓ vitamine D → perte osseuse", gravite: "PRUDENCE" }
    ],

    // PAT_026 — Infections urinaires récidivantes
    "PAT_026": [
        { terme: "anticholinergique", raison: "Rétention urinaire → stase → récidive IU", gravite: "PRUDENCE" }
    ],

    // PAT_027 — Chutes / troubles de l'équilibre
    "PAT_027": [
        { terme: "antipsychotique", raison: "Sédation, hypotension orthostatique → chutes (Beers 2023)", gravite: "PRUDENCE" },
        { terme: "tricyclique", raison: "Hypotension orthostatique, sédation → chutes", gravite: "DECONSEILLE" },
        { terme: "opioide", raison: "Sédation, confusion → risque de chutes chez le sujet âgé", gravite: "PRUDENCE" },
        { terme: "alpha-1 bloquant", raison: "Hypotension orthostatique → chutes", gravite: "PRUDENCE" },
        { terme: "isrs", condition: "initiation", raison: "Hyponatrémie, vertiges en début de traitement → chutes", gravite: "PRUDENCE" }
    ],

    // PAT_028 — Vertiges
    "PAT_028": [
        { terme: "antipsychotique", raison: "Sédation, hypotension → aggravation vertiges", gravite: "PRUDENCE" }
    ],

    // PAT_029 — IRC sévère / Dialyse
    "PAT_029": [
        { terme: "bisphosphonate", condition: "si DFG < 30", raison: "CI — risque néphrotoxicité, ostéomalacie adynamique", gravite: "CONTRE-INDICATION" },
        { terme: "lithium", raison: "Accumulation toxique — CI si IRC sévère", gravite: "CONTRE-INDICATION" },
        { terme: "enoxaparine", condition: "si DFG < 30", raison: "Accumulation HBPM — risque hémorragique (utiliser HNF)", gravite: "CONTRE-INDICATION" },
        { terme: "tinzaparine", condition: "si DFG < 30", raison: "Accumulation HBPM — privilégier HNF", gravite: "PRUDENCE" },
        { terme: "dalteparine", condition: "si DFG < 30", raison: "Accumulation HBPM — adapter posologie", gravite: "PRUDENCE" },
        { terme: "fondaparinux", condition: "si DFG < 20", raison: "CI si IRC sévère — élimination rénale exclusive", gravite: "CONTRE-INDICATION" },
        { terme: "isglt2", condition: "si DFG < 20", raison: "Inefficacité glycémique mais bénéfice cardiorénal maintenu (KDIGO 2024)", gravite: "PRUDENCE" },
        { terme: "gabapentine", raison: "Élimination rénale — réduire dose si DFG < 30", gravite: "PRUDENCE" },
        { terme: "pregabaline", raison: "Élimination rénale — adapter dose si IRC", gravite: "PRUDENCE" }
    ],

    // PAT_030 — Soins palliatifs
    "PAT_030": [
        { terme: "ipp", condition: "si pas d'indication active", raison: "Déprescription recommandée (STOPPFrail)", gravite: "PRUDENCE" },
        { terme: "antiagregant", condition: "prévention primaire", raison: "Bénéfice incertain en fin de vie (STOPPFrail)", gravite: "PRUDENCE" },
        { terme: "isglt2", raison: "Risque déshydratation en fin de vie", gravite: "PRUDENCE" }
    ],

    // PAT_031 — Confusion / delirium
    "PAT_031": [
        { terme: "anticholinergique", raison: "Facteur déclenchant majeur du delirium (Beers 2023)", gravite: "CONTRE-INDICATION" },
        { terme: "corticoide", raison: "Agitation, insomnie, confusion dose-dépendante", gravite: "PRUDENCE" },
        { terme: "opioide", raison: "Confusion, sédation — facteur de delirium", gravite: "PRUDENCE" },
        { terme: "fluoroquinolone", raison: "Neurotoxicité — confusion, hallucinations (FDA 2018)", gravite: "PRUDENCE" },
        { terme: "tricyclique", raison: "ACB élevé — facteur majeur de delirium", gravite: "CONTRE-INDICATION" }
    ],

    // PAT_032 — Dépression
    "PAT_032": [
        { terme: "betabloquant", raison: "Dépression iatrogène controversée mais prudence si lipophile (propranolol)", gravite: "PRUDENCE" },
        { terme: "corticoide", condition: "usage prolongé", raison: "Troubles de l'humeur dose-dépendants", gravite: "PRUDENCE" }
    ],

    // PAT_033 — Glaucome angle fermé
    "PAT_033": [
        { terme: "anticholinergique", raison: "Mydriase → crise de glaucome aigu par fermeture de l'angle", gravite: "CONTRE-INDICATION" },
        { terme: "tricyclique", raison: "Effet anticholinergique puissant → mydriase → crise GAF", gravite: "CONTRE-INDICATION" },
        { terme: "isrs", condition: "surtout paroxetine", raison: "Mydriase modérée possible — rare mais documentée", gravite: "PRUDENCE" },
        { terme: "irsna", raison: "Effet noradrénergique → mydriase possible", gravite: "PRUDENCE" },
        { terme: "phenothiazine", raison: "Effet anticholinergique → mydriase", gravite: "DECONSEILLE" }
    ],

    // PAT_034 — Hépatopathie / Cirrhose
    "PAT_034": [
        { terme: "statine", condition: "si transaminases > 3N ou cirrhose décompensée", raison: "Hépatotoxicité — CI si cirrhose Child C", gravite: "PRUDENCE" },
        { terme: "ketoconazole", raison: "Hépatotoxicité sévère — CI en cirrhose", gravite: "CONTRE-INDICATION" },
        { terme: "isoniazide", raison: "Hépatotoxicité majeure — CI en hépatopathie", gravite: "CONTRE-INDICATION" },
        { terme: "ciclosporine", raison: "Métabolisme hépatique — accumulation toxique", gravite: "PRUDENCE" },
        { terme: "fluoroquinolone", raison: "Hépatotoxicité idiosyncrasique possible", gravite: "PRUDENCE" }
    ],

    // PAT_035 — Bradycardie sévère
    "PAT_035": [
        { terme: "galantamine", raison: "Effet vagomimétique → bradycardie", gravite: "PRUDENCE" },
        { terme: "phenylephrine", raison: "Réflexe vagal si HTA → bradycardie réflexe", gravite: "PRUDENCE" }
    ],

    // PAT_036 — MTEV / maladie thromboembolique
    "PAT_036": [
        { terme: "corticoide", condition: "systémique", raison: "Augmente le risque thromboembolique", gravite: "PRUDENCE" },
        { terme: "raloxifene", raison: "SERM — risque thromboembolique (CI si ATCD MTEV)", gravite: "CONTRE-INDICATION" },
        { terme: "contraceptif", raison: "Risque thromboembolique — CI si ATCD MTEV", gravite: "CONTRE-INDICATION" },
        { terme: "erythropoietine", raison: "↑ viscosité sanguine → risque thrombotique", gravite: "PRUDENCE" }
    ],

    // PAT_017 — Dysthyroïdie
    "PAT_017": [
        { terme: "iec", condition: "hypothyroidie", raison: "Pas de CI mais surveillance TSH (interaction indirecte métabolique)", gravite: "PRUDENCE" }
    ],

    // PAT_024 — Goutte (ajouts diurétiques)
    "PAT_024": [
        { terme: "diuretique de l'anse", raison: "Hyperuricémie → aggravation goutte", gravite: "PRUDENCE" }
    ],

    // PAT_027 — Chutes (ajout diurétiques)
    "PAT_027": [
        { terme: "diuretique", raison: "Hypovolémie, hypotension orthostatique → chutes", gravite: "PRUDENCE" }
    ],

    // PAT_029 — IRC sévère (ajouts AVK, AOD)
    "PAT_029": [
        { terme: "avk", condition: "si DFG < 15 sans dialyse", raison: "Calciphylaxie possible — surveillance INR renforcée", gravite: "PRUDENCE" },
        { terme: "aod", condition: "selon seuils DFG spécifiques", raison: "Accumulation si IRC sévère — adapter ou CI selon molécule (EHRA 2024)", gravite: "PRUDENCE" }
    ],

    // PAT_037 — Sarcopénie (classes thérapeutiques)
    "PAT_037": [
        { terme: "corticoide", condition: "systémique > 1 mois", raison: "Myopathie cortisonique — catabolisme protéique musculaire accéléré (EWGSOP2 2019)", gravite: "DECONSEILLE au long cours" },
        { terme: "statine", condition: "si myalgies ou CPK > 5N", raison: "Myopathie statinoïde — réévaluer bénéfice/risque (ICFSR 2022)", gravite: "PRUDENCE" },
        { terme: "fluoroquinolone", raison: "Tendinopathie + myotoxicité (ANSM 2019, FDA 2018)", gravite: "PRUDENCE" }
    ],

    // PAT_038 — Dysphagie / Troubles de déglutition (classes)
    "PAT_038": [
        { terme: "antipsychotique", raison: "Altère réflexe de déglutition → pneumopathie d'inhalation (ESSD 2021)", gravite: "DECONSEILLE sauf psychiatrie" },
        { terme: "anticholinergique", raison: "Xérostomie aggravant la déglutition + sédation", gravite: "PRUDENCE" },
        { terme: "benzodiazepine", raison: "Sédation → diminution réflexes protecteurs voies aériennes", gravite: "PRUDENCE" },
        { terme: "opioid", raison: "Sédation + diminution réflexe toux → risque inhalation", gravite: "PRUDENCE" },
        { terme: "anticholinesterase", raison: "Nausées/sialorrhée — paradoxalement peut aider ou nuire selon le type de dysphagie", gravite: "PRUDENCE" }
    ],

    // PAT_039 — Incontinence urinaire (classes)
    "PAT_039": [
        { terme: "anticholinergique", raison: "Oxybutynine et apparentés : ACB élevé, confusion cognitive chez le sujet âgé (Beers 2023, STOPP H2). Préférer mirabégron.", gravite: "DECONSEILLE" },
        { terme: "diuretique", condition: "si incontinence par hyperactivité", raison: "Aggrave l'incontinence par augmentation du volume urinaire (STOPP v3 B10)", gravite: "PRUDENCE — réévaluer indication" },
        { terme: "alpha-bloquant", condition: "chez la femme", raison: "Aggravation incontinence d'effort par relâchement sphinctérien", gravite: "PRUDENCE" },
        { terme: "isrs", raison: "Peuvent aggraver l'incontinence urinaire (effet sérotoninergique sur détrusor)", gravite: "PRUDENCE" },
        { terme: "lithium", raison: "Polyurie + diabète insipide néphrogénique → aggravation incontinence", gravite: "PRUDENCE" }
    ],

    // PAT_012 — Démence à Corps de Lewy (classes) — fusionné depuis l'ancien PAT_040 (déduplication automatique par 'terme' lors du merge)
    "PAT_012": [
        { terme: "anticholinergique", raison: "Aggrave hallucinations et cognition en DCL (Watts 2022)", gravite: "CONTRE-INDICATION" }
    ],

    // PAT_053 — RGO (classes & molécules à risque)
    "PAT_053": [
        { terme: "ains", raison: "Aggravation RGO + risque ulcère/œsophagite peptique. Si AINS indispensable → gastroprotection IPP (STOPP F2)", gravite: "PRUDENCE" },
        { terme: "metoclopramide", condition: "âge > 75 ans ou Parkinson", raison: "Effets extrapyramidaux, dyskinésies tardives, chutes (STOPP K2 ; Beers 2023)", gravite: "EVITER" },
        { terme: "domperidone", raison: "Allongement QT, torsades de pointes, mort subite (ANSM 2014). Max 10 mg x3/j, 1 sem, ECG préalable", gravite: "PRUDENCE" },
        { terme: "cimetidine", raison: "Anticholinergique central + inhibiteur CYP majeur — confusion, gynécomastie, interactions multiples (STOPP B6 ; Beers 2023)", gravite: "EVITER" },
        { terme: "ranitidine", raison: "Médicament RETIRÉ du marché (NDMA potentielle, ANSM 2020)", gravite: "RETIRE — ne plus prescrire" },
        { terme: "atazanavir", raison: "IPP CONTRE-INDIQUÉ (absorption pH-dépendante)", gravite: "CONTRE-INDICATION si IPP associé" },
        { terme: "rilpivirine", raison: "IPP contre-indiqué (↓ absorption)", gravite: "CONTRE-INDICATION si IPP associé" }
    ]
};

// Merge V2, V3, and V4 additions into PATHO_MED_INTERDITS
(function() {
    [PATHO_MED_INTERDITS_V2_ADDITIONS, PATHO_MED_INTERDITS_V3_ADDITIONS, PATHO_MED_INTERDITS_V4_CLASSES].forEach(additions => {
        for (const [patId, rules] of Object.entries(additions)) {
            if (!PATHO_MED_INTERDITS[patId]) PATHO_MED_INTERDITS[patId] = [];
            rules.forEach(r => {
                if (!PATHO_MED_INTERDITS[patId].some(existing => existing.terme === r.terme)) {
                    PATHO_MED_INTERDITS[patId].push(r);
                }
            });
        }
    });
})();

// Wrappers getPathologyRules, getPathoSyndromes, getPathoInterditsMeds supprimés :
// DOUBLONS — accès direct PATHOLOGY_RULES_DB[id] / PATHO_MED_INTERDITS[id] utilisé partout

// Vérifier si un médicament est interdit pour une liste de pathologies actives
function checkMedContraPathologies(medDci, medClasse, activePathoList) {
    let alerts = [];
    activePathoList.forEach(pathoId => {
        let interdits = PATHO_MED_INTERDITS[pathoId];
        if (!interdits) return;
        interdits.forEach(rule => {
            let termS = rule.terme.toLowerCase();
            let dciS = (medDci || "").toLowerCase();
            let classeS = (medClasse || "").toLowerCase();
            if (dciS.includes(termS) || classeS.includes(termS)) {
                alerts.push({
                    patho: pathoId,
                    patho_nom: PATHOLOGY_RULES_DB[pathoId] ? PATHOLOGY_RULES_DB[pathoId].NOM : pathoId,
                    med: medDci,
                    raison: rule.raison,
                    gravite: rule.gravite,
                    condition: rule.condition || null,
                    exception: rule.exception || null
                });
            }
        });
    });
    return alerts;
}

// getRequiredBioSurveillance supprimé : DOUBLON de getRequiredBioMonitoring() dans geria_integration_module.js
// getTherapeuticOmissions supprimé : DOUBLON — GeriaEngineV2 INITIER (med_absent) assure cette fonctionnalité

