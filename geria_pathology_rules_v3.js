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


const PATHOLOGY_RULES_DB = {

    "PAT_001": {
        ID: "PAT_001",
        NOM: "Insuffisance Cardiaque Globale (IC)",
        REFERENCE: "ESC 2021 + Focused Update 2023 | ACC/AHA 2022 | STRONG-HF",
        SOURCES_EBM: {
                  "INITIER": {
                            "iSGLT2": "ESC_HF_2023, Rec Table 1, Class IA",
                            "Diurétique": "ESC_HF_2021, §5.3, Class IC"
                  },
                  "EVITER": {
                            "AINS": "ESC_HF_2021 §5.12 + STOPP H2",
                            "Calciques": "STOPP H4",
                            "Thiazolidinediones": "ESC_HF_2021 §11.4",
                            "DPP-4": "ADA_2025 §9 + SAVOR-TIMI"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "iSGLT2",
                    dci_exemples: ["Dapagliflozine", "Empagliflozine"],
                    indication: "Recommandé sur tout le spectre de FEVG (Class I, LOE A - ESC 2023 Update)",
                    condition: "Tous les patients IC symptomatiques, y compris HFpEF",
                    bio_pre_requis: ["BIO_003", "BIO_004", "BIO_001"],
                    contre_indication_dfg: "Ne pas initier si DFG < 20 mL/min (mais poursuivre si déjà en cours)",
                    niveau_preuve: "IA"
                },
                {
                    classe: "Diurétique de l'anse",
                    dci_exemples: ["Furosémide", "Bumétanide"],
                    indication: "Soulagement des symptômes congestifs (Class I, LOE C)",
                    condition: "Signes/symptômes de congestion",
                    bio_pre_requis: ["BIO_001", "BIO_002", "BIO_003"],
                    niveau_preuve: "IC"
                }
            ],
            EVITER: [
                {
                    classe: "AINS",
                    raison: "Rétention hydrosodée, décompensation IC, néphrotoxicité",
                    gravite: "CONTRE-INDICATION",
                    ref_stopp: "STOPP H2",
                    syndromes_risque: ["SYND_029", "SYND_010", "SYND_015"]
                },
                {
                    classe: "Inhibiteurs Calciques non-DHP (Vérapamil, Diltiazem)",
                    raison: "Effet inotrope négatif, aggravation IC si FEVG réduite",
                    gravite: "CONTRE-INDICATION si HFrEF",
                    condition: "Si FEVG ≤ 40%",
                    ref_stopp: "STOPP H4"
                },
                {
                    classe: "Thiazolidinediones (Pioglitazone)",
                    raison: "Rétention hydrosodée, augmentation risque décompensation IC",
                    gravite: "CONTRE-INDICATION",
                    syndromes_risque: ["SYND_029"]
                },
                {
                    classe: "Inhibiteurs DPP-4 (Saxagliptine, Alogliptine)",
                    raison: "Risque accru d'hospitalisation pour IC (SAVOR-TIMI 53, EXAMINE)",
                    gravite: "DECONSEILLE",
                    condition: "Préférer iSGLT2 ou GLP-1 RA"
                }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_028", "BIO_001", "BIO_002", "BIO_003", "BIO_004", "BIO_009", "BIO_034"],
            REGLES: [
                {
                    bio: "BIO_028",
                    nom: "NT-proBNP",
                    seuils: {
                        normal: { max: 125, unite: "pg/mL", note: "Exclut IC si < 125 (ambulatoire)" },
                        alerte: { min: 450, note: "Suspecter décompensation si < 50 ans" },
                        alerte_75: { min: 1800, note: "Seuil ajusté > 75 ans" },
                        critique: { min: 5000, note: "Décompensation aiguë, hospitalisation" }
                    },
                    frequence: "Tous les 3-6 mois stable, immédiat si symptômes",
                    syndrome_declenche: "SYND_029"
                },
                {
                    bio: "BIO_001",
                    nom: "Kaliémie",
                    seuils: {
                        bas: { max: 3.5, action: "Risque arythmie sous diurétiques, supplémenter K+" },
                        haut: { min: 5.0, action: "Réduire IEC/ARA2/ARM, contrôler" },
                        critique_haut: { min: 5.5, action: "Arrêt ARM, Kayexalate/Patiromer, ECG" },
                        critique_tres_haut: { min: 6.0, action: "Urgence — gluconate Ca IV, insuline-glucose" }
                    },
                    frequence: "J3-J7 après introduction/titration IEC-ARA2-ARM, puis mensuel x3, puis trimestriel",
                    syndromes: ["SYND_010", "SYND_011"]
                },
                {
                    bio: "BIO_003",
                    nom: "Créatininémie",
                    seuils: {
                        hausse_acceptable: { delta_pct: 30, note: "Hausse ≤30% acceptable après introduction IEC/ARA2/iSGLT2 (dip hémodynamique)" },
                        hausse_alerte: { delta_pct: 50, note: "Hausse > 50% → réévaluer, arrêter si nécessaire" }
                    },
                    frequence: "J7-J14 après chaque titration, puis trimestriel"
                },
                {
                    bio: "BIO_009",
                    nom: "Hémoglobine",
                    seuils: {
                        carence_fer: { max: 13, note: "Rechercher carence martiale si Hb < 13 g/dL (H) ou < 12 (F)" },
                        indication_fer_iv: { condition: "Ferritine < 100 µg/L OU (Ferritine 100-299 + CST < 20%)", note: "Fer IV recommandé (Class I, LOE A - ESC 2023)" }
                    },
                    syndrome_declenche: "SYND_005"
                }
            ]
        },

        INTERACTIONS_CRITIQUES: [
            {
                combinaison: ["IEC ou ARA2", "ARM (Spironolactone/Éplérénone)", "iSGLT2"],
                risque: "Hyperkaliémie",
                surveillance: "BIO_001 — Kaliémie à J7, J14, M1, puis trimestriel",
                conduite: "Arrêter ARM si K+ > 5.5. Patiromer/SZC si récurrent et ARM nécessaire."
            },
            {
                combinaison: ["Diurétique de l'anse", "IEC ou ARA2"],
                risque: "Insuffisance rénale fonctionnelle, hyponatrémie",
                surveillance: "BIO_002, BIO_003 — Créatinine + Na à J3-J7",
                conduite: "Adapter diurétique en premier, ne pas arrêter IEC/ARA2 en première intention"
            }
        ],

        DECOMPENSATION_BIO: {
            syndrome_principal: "SYND_029",
            triggers: [
                { bio: "BIO_028", condition: "> seuil âge-adapté", action: "Optimiser diurétiques, arrêt AINS, bilan rénal/iono" },
                { bio: "BIO_001", condition: "> 5.5 mmol/L", action: "Réduire ARM, contrôle ECG" },
                { bio: "BIO_002", condition: "< 130 mmol/L", action: "Restriction hydrique, adapter diurétiques" },
                { bio: "BIO_003", condition: "Hausse > 50%", action: "Suspendre IEC/ARA2/iSGLT2, rechercher cause" }
            ]
        }
    },

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
                        { rang: 4, classe: "iSGLT2 (Dapagliflozine ou Empagliflozine)", niveau: "IA", note: "Bénéfice indépendant du diabète. Peut être initié en premier." }
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
                            "ARM": "ESC_HF_2021 §6.2, IIbB + TOPCAT",
                            "GLP-1": "STEP-HFpEF, IIaB"
                  }
        },

        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "iSGLT2 (Dapagliflozine, Empagliflozine)",
                    indication: "Recommandé pour réduire les hospitalisations pour IC (Class I, LOE A - ESC 2023)",
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
                    classe: "Bêtabloquant",
                    indication: "Si post-infarctus récent ou angor résiduel ou FEVG ≤ 40%",
                    note: "Bénéfice pronostique post-IDM remis en question chez patients sans dysfonction VG (ABYSS trial)",
                    niveau_preuve: "IA post-IDM, IIb si pas d'IC"
                },
                {
                    classe: "Rivaroxaban 2.5 mg x2/j + Aspirine (Stratégie COMPASS)",
                    indication: "Considérer si haut risque athéromateux (polyvasculaire, diabète) sans haut risque hémorragique",
                    condition: "HAS-BLED acceptable",
                    niveau_preuve: "IIaB"
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
                            "IEC + ARA2": "ONTARGET",
                            "Alpha-bloquants": "ALLHAT"
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
                    niveau_preuve: "IB"
                }
            ],
            CIBLES: {
                general: { PAS: "120-130 mmHg si toléré", note: "SPRINT / STEP" },
                sujet_age_75: { PAS: "130-139 mmHg", note: "Individualiser, attention à l'hypotension orthostatique" },
                sujet_fragile: { PAS: "< 150 mmHg", note: "Déprescription si PAS < 110 ou symptômes" },
                diabetique: { PAS: "< 130 mmHg", note: "ADA 2025" },
                mrc: { PAS: "< 120 mmHg si protéinurie", note: "KDIGO 2024" }
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
                { bio: "BIO_001", condition: "> 5.5 sous IEC/ARA2/ARM", action: "Adapter traitement, rechercher cause" },
                { bio: "BIO_002", condition: "< 130 sous thiazidique", action: "Réduire ou arrêter thiazidique", syndrome: "SYND_009" },
                { bio: "BIO_004", condition: "Chute > 25% en < 3 mois", action: "Rechercher sténose artère rénale, adapter posologie" }
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
                indication: "Tous les patients FA avec CHA₂DS₂-VA ≥ 1 (homme) ou ≥ 2 (femme) — ESC 2024 remplace CHA₂DS₂-VASc par CHA₂DS₂-VA (retire le critère sexe du score)",
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
                premiere_ligne: ["Bêtabloquant", "Diltiazem", "Vérapamil (si FEVG > 40%)", "Digoxine"],
                cible_fc: "< 110 bpm au repos (stratégie lenient - RACE II)",
                cible_fc_strict: "< 80 bpm si symptômes persistants",
                notes: [
                    "Diltiazem/Vérapamil CI si FEVG ≤ 40%",
                    "Digoxine : dose faible (digoxinémie cible 0.5-0.9 ng/mL), prudence chez le sujet âgé",
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
            SURVEILLANCE_CIBLE: ["BIO_031", "BIO_030", "BIO_019", "BIO_001", "BIO_003", "BIO_004", "BIO_009", "BIO_013", "BIO_014"],
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
                    { item: "IC", points: 1, patho: ["PAT_001", "PAT_002", "PAT_003"] },
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
                { bio: "BIO_009", condition: "Chute Hb > 2 g/dL sous anticoagulant", action: "Rechercher saignement, endoscopie, arrêt AOD si hémorragie grave + antidote spécifique" }
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
                            "Rivaroxaban": "ESC_PAD_2024 §8.2, IIaA + COMPASS + VOYAGER-PAD",
                            "Statine": "ESC_PAD_2024 §8.1, IA",
                            "Exercice": "ESC_PAD_2024 §8.3, IA"
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
                { classe: "Bêtabloquants non sélectifs", raison: "Risque théorique d'aggravation claudication (non confirmé dans méta-analyses récentes — ESC 2024 : pas de CI absolue)", gravite: "PRUDENCE, ne pas contre-indiquer si indication cardiaque" }
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
                            "Statine": "SPARCL + ESC_DYSLIP_2019, IA",
                            "Antihypertenseur": "PROGRESS + ESC_HTN_2024, IA"
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
                    note: "Si AVC sous statine : considérer LDL < 1.0 mmol/L (ajout ézétimibe/anti-PCSK9)",
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
                        cible_recidive: { max_mmol: 1.0, note: "Si récidive sous statine max" }
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
                            "Fludrocortisone": "ESC_SYNCOPE_2018 §5.4, IIaC"
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
            DEPRESCRIPTION: {
                description: "ÉTAPE CLÉ : Rechercher et réduire/arrêter les médicaments aggravants AVANT toute introduction",
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
        REFERENCE: "EAN 2023 | NIA-AA 2024 | HAS 2024",
        SOURCES_EBM: {
                  "INITIER": {
                            "Donépézil": "EAN_DEMENTIA_2023 §4.1, A",
                            "Mémantine": "EAN_DEMENTIA_2023 §4.2, A"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Donépézil 5→10 mg/j", indication: "Stade léger à modéré (MMSE 10-26)", titration: "5 mg x 4 semaines puis 10 mg", surveillance: "ECG (bradycardie), poids, transit", niveau_preuve: "IA" },
                { classe: "Rivastigmine patch 4.6→9.5→13.3 mg/24h", indication: "Alternative, meilleur profil digestif en patch", note: "Préféré si problème d'observance ou nausées sous oral" },
                { classe: "Galantamine LP 8→16→24 mg/j", indication: "Alternative, peut bénéficier composante vasculaire", note: "CI si DFG < 9" },
                { classe: "Mémantine 5→10→15→20 mg/j", indication: "Stade modéré à sévère (MMSE < 20)", note: "Association IAChE + mémantine = bénéfice additif (Tariot 2004)", ci_dfg: "Dose max 10 mg si DFG < 30", niveau_preuve: "IA" }
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
        NOM: "Démence à Corps de Lewy",
        REFERENCE: "McKeith 2023 DLB Consortium | EAN 2023",
        SOURCES_EBM: {
                  "INITIER": {
                            "Rivastigmine": "McKeith DLB 2023 §5.1, A"
                  },
                  "EVITER": {
                            "Neuroleptiques": "McKeith DLB 2023 §5.3, CI absolue"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Rivastigmine", indication: "Traitement de choix (meilleur niveau de preuve dans MCL)", note: "Bénéfice sur hallucinations et cognition" },
                { classe: "Donépézil", indication: "Alternative à rivastigmine" },
                { classe: "Quetiapine faible dose (12.5-50 mg)", indication: "SPCD sévères (hallucinations, agitation) si IAChE insuffisant", note: "SEUL antipsychotique toléré dans MCL (moindre risque extrapyramidal)" }
            ],
            EVITER: [
                { classe: "Neuroleptiques classiques (Halopéridol, etc.)", raison: "Hypersensibilité sévère aux neuroleptiques = critère diagnostique MCL. Risque syndrome malin, rigidité, décès.", gravite: "CONTRE-INDICATION ABSOLUE" },
                { classe: "Rispéridone, Olanzapine", raison: "Syndrome extrapyramidal sévère", gravite: "CONTRE-INDICATION FORTE" },
                { classe: "Anticholinergiques", raison: "Aggravent hallucinations et confusion", gravite: "CONTRE-INDICATION" },
                { classe: "Métoclopramide", raison: "Antagoniste D2 → syndrome parkinsonien", gravite: "CONTRE-INDICATION" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_009", "BIO_002"],
            REGLES: [
                { bio: "BIO_031", note: "Surveillance QTc si quétiapine" }
            ]
        }
    },

    "PAT_013": {
        ID: "PAT_013",
        NOM: "Démence Fronto-Temporale (DFT)",
        REFERENCE: "FTD Consortium 2023",
        SOURCES_EBM: {
                  "INITIER": {
                            "ISRS": "FTD Consortium 2023 §4, C"
                  },
                  "EVITER": {
                            "IAChE": "FTD Consortium 2023, B"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "ISRS (Sertraline, Citalopram, Trazodone)", indication: "Troubles comportementaux (désinhibition, compulsions, apathie)", note: "Pas d'IAChE prouvé efficace dans DFT" }
            ],
            EVITER: [
                { classe: "IAChE (Donépézil, Rivastigmine, Galantamine)", raison: "Pas de déficit cholinergique dans DFT, risque d'aggravation comportementale", gravite: "DECONSEILLE" },
                { classe: "Antipsychotiques", raison: "Sensibilité accrue, syndrome extrapyramidal", gravite: "DECONSEILLE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_009"],
            REGLES: [
                { bio: "BIO_002", note: "Hyponatrémie sous ISRS (SIADH)" }
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

    "PAT_016": {
        ID: "PAT_016",
        NOM: "Diabète (Type 2 ou 1)",
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
                general: { max: 7.0, note: "La plupart des adultes" },
                sujet_age_robuste: { max: 7.5, note: "Espérance de vie > 10 ans, peu de comorbidités" },
                sujet_age_fragile: { max: 8.0, max_haut: 8.5, note: "Espérance de vie limitée, polymédication, risque hypoglycémie" },
                fin_de_vie: { note: "Éviter hyperglycémie symptomatique, pas de cible stricte" },
                ref: "ADA 2025 — Older Adults"
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
                        alerte_basse: { max: 6.0, note: "Sur-traitement si sujet âgé → déprescrire" }
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
                            "Lévothyroxine": "ETA_2023 §3.1, A + TRUST"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Lévothyroxine",
                    posologie_adulte: "1.6 µg/kg/j (dose cible théorique)",
                    posologie_geriatrique: "Débuter 25 µg/j (12.5 µg si coronarien, IC, ou > 80 ans)",
                    titration: "Paliers de 12.5-25 µg toutes les 6-8 semaines selon TSH",
                    cible_tsh: { general: "0.5-4.0 mUI/L", sujet_age_75: "1.0-5.0 mUI/L", sujet_age_80: "1.0-6.0 mUI/L (TRUST trial : pas de bénéfice à traiter si TSH 4-10 chez > 80 ans)" },
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
                { classe: "Surdosage LT4 (TSH < 0.4)", raison: "FA, ostéoporose, angor, agitation", gravite: "RISQUE IMPORTANT chez le sujet âgé" },
                { classe: "Traitement hypothyroïdie subclinique chez > 80 ans si TSH < 10", raison: "TRUST trial : pas de bénéfice", gravite: "DISCUTER avant de traiter" }
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
                            "Thiamazole": "ETA_2023 §4.1, A"
                  }
        },
        TRAITEMENTS: {
            INITIER: [
                { classe: "Thiamazole (Thyrozol) 10-40 mg/j OU Carbimazole (Néo-Mercazole) 15-60 mg/j", indication: "Maladie de Basedow, adénome toxique en attente chirurgie/IRA", titration: "Dose d'attaque x 4-6 semaines, puis entretien 5-15 mg/j", duree: "12-18 mois dans Basedow, puis tentative d'arrêt", niveau_preuve: "IA" },
                { classe: "Propylthiouracile (PTU) 300-600 mg/j", indication: "UNIQUEMENT si : T1 grossesse OU allergie thiamazole/carbimazole OU tempête thyroïdienne", note: "Hépatotoxicité grave → pas de traitement au long cours" },
                { classe: "Bêtabloquant (Propranolol 40-120 mg/j OU Aténolol 50-100 mg/j)", indication: "Contrôle symptomatique (tachycardie, tremblements, anxiété)", note: "Propranolol inhibe aussi conversion T4→T3", niveau_preuve: "IC" },
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
        REFERENCE: "GINA 2024",
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
        REFERENCE: "GOLD 2024",
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
                  }
        },
        TRAITEMENTS: {
            CRISE_AIGUE: [
                { classe: "Colchicine 0.5-1 mg (J1 : 1mg puis 0.5mg 1h après, puis 0.5mg/j)", indication: "Crise < 12h", note: "Adapter si DFG < 30 : réduire dose. CI si DFG < 10.", bio_suivi: ["BIO_003", "BIO_004"] },
                { classe: "AINS courte durée (3-5j max)", indication: "Si pas de CI (IC, IRC, UGD)", gravite_si_ci: "CI si PAT_001/PAT_002/PAT_003 ou DFG < 30" },
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
                            "Bisphosphonates": "IOF_2024 §5.1, A",
                            "Dénosumab": "IOF_2024 §5.2, A"
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
                            "Manoeuvre Epley": "Bárány 2023 §3.1, A"
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
                            "AINS": "KDIGO_2024 §4.1"
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
                            "Déprescription": "SFAP_2024 + EAPC_2023"
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
                            "Déprescription": "STOPP/START v3 + Beers 2023 + NICE 2024"
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
                { classe: "Hypoglycémiants (sulfamides)", action: "Déprescrire en priorité. Relâcher cible HbA1c à 8-8.5%", ref: "ADA 2025 Older Adults" },
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
            }
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_023", "BIO_035", "BIO_025", "BIO_003", "BIO_004", "BIO_019", "BIO_021"],
            REGLES: [
                { bio: "BIO_035", frequence: "Trimestriel si dénutrition connue", syndrome: "SYND_033" },
                { bio: "BIO_023", frequence: "Semestriel", syndrome: "SYND_025" },
                { bio: "BIO_021", frequence: "Annuel" }
            ]
        }
    }
};

const PATHO_SYNDROME_MAP = {
    "PAT_001": ["SYND_029", "SYND_010", "SYND_009", "SYND_011"],
    "PAT_002": ["SYND_029", "SYND_010", "SYND_036"],
    "PAT_003": ["SYND_029", "SYND_010"],
    "PAT_004": ["SYND_036", "SYND_027", "SYND_030"],
    "PAT_005": ["SYND_010", "SYND_009", "SYND_011", "SYND_015"],
    "PAT_006": ["SYND_003", "SYND_027", "SYND_012", "SYND_010"],
    "PAT_007": ["SYND_027", "SYND_030"],
    "PAT_008": ["SYND_027", "SYND_035", "SYND_036"],
    "PAT_009": ["SYND_009", "SYND_011", "SYND_013"],
    "PAT_010": ["SYND_013", "SYND_009"],
    "PAT_011": ["SYND_013", "SYND_017", "SYND_009"],
    "PAT_012": ["SYND_013", "SYND_009"],
    "PAT_013": ["SYND_013"],
    "PAT_014": ["SYND_009", "SYND_011", "SYND_013"],
    "PAT_015": ["SYND_007", "SYND_009", "SYND_001"],
    "PAT_016": ["SYND_017", "SYND_018", "SYND_015"],
    "PAT_017": ["SYND_013", "SYND_020"],
    "PAT_018": ["SYND_012", "SYND_019", "SYND_003"],
    "PAT_019": ["SYND_030", "SYND_002"],
    "PAT_020": ["SYND_004", "SYND_014", "SYND_033"],
    "PAT_021": ["SYND_005", "SYND_006"],
    "PAT_022": ["SYND_011"],
    "PAT_023": ["SYND_015"],
    "PAT_024": ["SYND_016", "SYND_015"],
    "PAT_025": ["SYND_025", "SYND_020"],
    "PAT_026": ["SYND_023", "SYND_024"],
    "PAT_027": ["SYND_013"],
    "PAT_028": ["SYND_009"],
    "PAT_029": ["SYND_015", "SYND_010", "SYND_020"],
    "PAT_030": ["SYND_005", "SYND_033"],
    "PAT_031": ["SYND_033", "SYND_025", "SYND_017"]
};

const PATHO_MED_INTERDITS = {
    "PAT_001": [
        { terme: "ains", raison: "Décompensation IC (rétention Na/H2O)", gravite: "CONTRE-INDICATION" },
        { terme: "pioglitazone", raison: "Rétention hydrosodée, aggravation IC", gravite: "CONTRE-INDICATION" },
        { terme: "verapamil", raison: "Inotrope négatif (CI si FEVG ≤ 40%)", gravite: "PRUDENCE" },
        { terme: "diltiazem", raison: "Inotrope négatif (CI si FEVG ≤ 40%)", gravite: "PRUDENCE" },
        { terme: "saxagliptine", raison: "Risque hospitalisation IC (SAVOR-TIMI)", gravite: "DECONSEILLE" },
        { terme: "alogliptine", raison: "Signal hospitalisation IC", gravite: "DECONSEILLE" }
    ],
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
        { terme: "haloperidol", raison: "Hypersensibilité aux NL dans MCL — risque vital", gravite: "CONTRE-INDICATION ABSOLUE" },
        { terme: "risperidone", raison: "Syndrome extrapyramidal sévère dans MCL", gravite: "CONTRE-INDICATION" },
        { terme: "olanzapine", raison: "Syndrome extrapyramidal dans MCL", gravite: "CONTRE-INDICATION" },
        { terme: "metoclopramide", raison: "Anti-D2 → parkinsonisme", gravite: "CONTRE-INDICATION" }
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
    ]
};

// Merge V2 and V3 additions into PATHO_MED_INTERDITS
(function() {
    [PATHO_MED_INTERDITS_V2_ADDITIONS, PATHO_MED_INTERDITS_V3_ADDITIONS].forEach(additions => {
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
                    condition: rule.condition || null
                });
            }
        });
    });
    return alerts;
}

// getRequiredBioSurveillance supprimé : DOUBLON de getRequiredBioMonitoring() dans geria_integration_module.js
// getTherapeuticOmissions supprimé : DOUBLON — GeriaEngineV2 INITIER (med_absent) assure cette fonctionnalité

