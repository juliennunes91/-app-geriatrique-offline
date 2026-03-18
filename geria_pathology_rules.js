// ═══════════════════════════════════════════════════════════════════════════════
// 📋 PATHOLOGY_RULES_DB — Module de Règles Pharmaco-Biologiques par Pathologie
// ═══════════════════════════════════════════════════════════════════════════════
// Version : 2.0 — Mars 2026
// Auteur  : Module IA — Interniste / Multi-spécialiste EBM
// But     : Intégration logiciel d'aide à la décision pharmaco-médicale
// Codage  : Compatible MASTER_DB (BIO_xxx, PAT_xxx, SYND_xxx)
//
// Sources EBM (dernières mises à jour) :
//   • ESC 2021/2023 Focused Update — Insuffisance Cardiaque (HFrEF, HFmrEF, HFpEF)
//   • ESC 2024 — Fibrillation Atriale (AF-CARE pathway, CHA₂DS₂-VA)
//   • ESC 2024 — Dyslipidémies
//   • ESC 2024 — Hypertension Artérielle
//   • ADA Standards of Care 2025-2026 — Diabète
//   • KDIGO 2024 — Maladie Rénale Chronique
//   • GOLD 2024 — BPCO
//   • GINA 2024 — Asthme
//   • STOPP/START v3 (2023) — Critères gériatriques
//   • Critères de Beers (AGS 2023)
//   • HAS France — Recommandations multi-pathologies
//   • EULAR 2023 — Goutte
//   • IOF/ESCEO 2024 — Ostéoporose
//   • ILAE 2024 — Épilepsie
//   • EAN/MDS 2023–2024 — Parkinson, Démences
// ═══════════════════════════════════════════════════════════════════════════════

const PATHOLOGY_RULES_DB = {

    // ═══════════════════════════════════════════════════════════
    // 🫀  CARDIOLOGIE
    // ═══════════════════════════════════════════════════════════

    "PAT_001": {
        ID: "PAT_001",
        NOM: "Insuffisance Cardiaque Globale (IC)",
        REFERENCE: "ESC 2021 + Focused Update 2023 | ACC/AHA 2022 | STRONG-HF",

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
        REFERENCE: "ESC 2024 PAD | COMPASS | VOYAGER-PAD",

        TRAITEMENTS: {
            INITIER: [
                { classe: "Aspirine 75-100 mg/j OU Clopidogrel 75 mg/j", indication: "Tous les patients AOMI symptomatiques", niveau_preuve: "IA" },
                { classe: "Statine haute intensité", indication: "Cible LDL < 1.4 mmol/L", niveau_preuve: "IA" },
                { classe: "IEC ou ARA2", indication: "Si HTA ou diabète associé", niveau_preuve: "IA" },
                { classe: "Rivaroxaban 2.5mg x2/j + Aspirine", indication: "AOMI symptomatique (COMPASS/VOYAGER-PAD)", condition: "Sans haut risque hémorragique", niveau_preuve: "IIaB" }
            ],
            EVITER: [
                { classe: "Bêtabloquants non sélectifs", raison: "Risque théorique d'aggravation claudication (débattu — pas de CI absolue dans ESC 2024)", gravite: "PRUDENCE" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_027", "BIO_025", "BIO_026", "BIO_003", "BIO_004", "BIO_009"],
            REGLES: [
                { bio: "BIO_027", frequence: "Annuel, cible LDL < 1.4 mmol/L" },
                { bio: "BIO_009", frequence: "Annuel (rechercher anémie par saignement sous antithrombotique)" }
            ]
        }
    },

    "PAT_008": {
        ID: "PAT_008",
        NOM: "Accident Vasculaire Cérébral (AVC/AIT)",
        REFERENCE: "ESO 2024 | ESC 2024 AF | AHA/ASA 2024",

        TRAITEMENTS: {
            INITIER: [
                { classe: "Antiagrégant (Aspirine + Clopidogrel 21j puis monothérapie)", indication: "AVC/AIT non cardio-embolique", note: "DAPT courte (21j CHANCE/POINT) puis clopidogrel seul", niveau_preuve: "IA" },
                { classe: "AOD", indication: "Si FA documentée — voir PAT_006", note: "Ne pas switcher entre DOAC sans raison (ESC 2024)" },
                { classe: "Statine haute intensité", indication: "Cible LDL < 1.4 mmol/L", niveau_preuve: "IA" },
                { classe: "Antihypertenseur", indication: "PAS cible < 130 mmHg en prévention secondaire (après phase aiguë)", niveau_preuve: "IA" }
            ],
            EVITER: [
                { classe: "AOD + Antiagrégant au long cours", raison: "Pas de bénéfice additionnel sur récidive AVC, risque hémorragique majoré", gravite: "DECONSEILLE" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_027", "BIO_025", "BIO_026", "BIO_003", "BIO_030", "BIO_009"],
            REGLES: [
                { bio: "BIO_027", frequence: "6-8 semaines post-traitement, puis annuel", seuils: { cible_ldl: 1.4 } }
            ]
        }
    },

    "PAT_009": {
        ID: "PAT_009",
        NOM: "Hypotension Orthostatique",
        REFERENCE: "ESC 2018 Syncope | Consensus gériatrique 2023",

        TRAITEMENTS: {
            INITIER: [
                { classe: "Mesures non pharmacologiques d'abord", indication: "Hydratation, bas de contention, exercices de contre-pression" },
                { classe: "Midodrine", indication: "Si mesures non pharmacologiques insuffisantes", condition: "CI si HTA supine sévère, IC, rétention urinaire" },
                { classe: "Fludrocortisone 50-200 µg/j", indication: "Alternative ou complément", condition: "Attention à l'hypokaliémie et à la surcharge" }
            ],
            DEPRESCRIPTION: {
                description: "Rechercher et réduire/arrêter les médicaments aggravants",
                classes_en_cause: [
                    "Alpha-bloquants (Tamsulosine, Alfuzosine)",
                    "Diurétiques (surdosage)",
                    "Antihypertenseurs (excès de traitement)",
                    "Antidépresseurs tricycliques",
                    "Neuroleptiques / Antipsychotiques",
                    "Agonistes dopaminergiques (Parkinson)",
                    "Dérivés nitrés",
                    "Opioïdes"
                ],
                strategie: "Déprescrire par paliers, réévaluer TA debout/couché après chaque modification"
            }
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_001", "BIO_002", "BIO_019", "BIO_025", "BIO_003"],
            REGLES: [
                { bio: "BIO_002", nom: "Natrémie", note: "Rechercher hyponatrémie iatrogène (thiazidiques, ISRS)" },
                { bio: "BIO_019", nom: "TSH", note: "Exclure hypothyroïdie / insuffisance surrénale" }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 🧠  NEUROLOGIE & PSYCHIATRIE
    // ═══════════════════════════════════════════════════════════

    "PAT_010": {
        ID: "PAT_010",
        NOM: "Syndrome Démentiel (Générique)",
        REFERENCE: "EAN/EFNS 2023 | Beers 2023 | STOPP/START v3",

        TRAITEMENTS: {
            INITIER: [
                { classe: "Inhibiteur de l'Acétylcholinestérase (IAChE)", indication: "Démence légère à modérée (Alzheimer, Corps de Lewy, mixte)", dci: ["Donépézil", "Rivastigmine", "Galantamine"] },
                { classe: "Mémantine", indication: "Démence modérée à sévère, seul ou en association avec IAChE" }
            ],
            EVITER: [
                { classe: "Anticholinergiques", raison: "Aggravation cognitive, confusion, rétention urinaire. Score ACB ≥ 3 = risque démentiel majoré.", gravite: "CONTRE-INDICATION RELATIVE", ref_stopp: "STOPP D1-D5" },
                { classe: "Benzodiazépines", raison: "Sédation, chutes, aggravation cognitive", gravite: "DECONSEILLE", ref_stopp: "STOPP D5" },
                { classe: "Antipsychotiques", raison: "Surmortalité, AVC, déclin cognitif chez le dément. Limiter à < 12 semaines si SPCD sévères résistants.", gravite: "DECONSEILLE sauf urgence comportementale", ref_stopp: "STOPP D3", ref_beers: "AGS 2023" },
                { classe: "Antihistaminiques H1 de 1ère génération", raison: "Forte charge anticholinergique", gravite: "CONTRE-INDICATION" }
            ]
        },

        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_021", "BIO_022", "BIO_009", "BIO_002", "BIO_025", "BIO_023"],
            BILAN_ETIOLOGIQUE: {
                description: "Bilan biologique de démence réversible",
                parametres: [
                    { bio: "BIO_019", raison: "Hypothyroïdie = cause réversible" },
                    { bio: "BIO_021", raison: "Carence B12 = cause réversible" },
                    { bio: "BIO_022", raison: "Carence folates" },
                    { bio: "BIO_005", raison: "Hypercalcémie" },
                    { bio: "BIO_002", raison: "Hyponatrémie" },
                    { bio: "BIO_025", raison: "Hypoglycémie" },
                    { bio: "BIO_009", raison: "Anémie profonde" }
                ]
            }
        }
    },

    "PAT_011": {
        ID: "PAT_011",
        NOM: "Maladie d'Alzheimer",
        REFERENCE: "EAN 2023 | NIA-AA 2024 | HAS 2024",
        TRAITEMENTS: {
            INITIER: [
                { classe: "Donépézil 5-10mg/j", indication: "Stade léger à modéré (MMSE 10-26)", niveau_preuve: "IA" },
                { classe: "Rivastigmine patch 4.6-9.5-13.3 mg/24h", indication: "Alternative au donépézil, meilleur profil digestif en patch" },
                { classe: "Galantamine LP 8-16-24 mg/j", indication: "Alternative, composante vasculaire" },
                { classe: "Mémantine 10-20 mg/j", indication: "Stade modéré à sévère (MMSE < 20), seul ou + IAChE", niveau_preuve: "IA" }
            ],
            EVITER: [
                { classe: "Anticholinergiques (Score ACB ≥ 1)", raison: "Antagonise directement l'effet des IAChE", gravite: "CONTRE-INDICATION PHARMACOLOGIQUE" },
                { classe: "Antipsychotiques", raison: "Accélération du déclin, surmortalité CV/cérébro-vasculaire", gravite: "DECONSEILLE sauf SPCD sévères réfractaires, durée < 12 semaines" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_021", "BIO_009", "BIO_002", "BIO_025"],
            REGLES: [
                { bio: "BIO_019", frequence: "Annuel", note: "Exclure dysthyroïdie" },
                { bio: "BIO_021", frequence: "Annuel", note: "Carence B12 aggrave le déclin" }
            ]
        }
    },

    "PAT_012": {
        ID: "PAT_012",
        NOM: "Démence à Corps de Lewy",
        REFERENCE: "McKeith 2023 DLB Consortium | EAN 2023",
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
        REFERENCE: "MDS 2023 | EAN/MDS 2024 | NICE 2024",
        TRAITEMENTS: {
            INITIER: [
                { classe: "Lévodopa + inhibiteur DDC (Modopar, Sinemet)", indication: "Traitement le plus efficace, première intention chez le sujet âgé", niveau_preuve: "IA" },
                { classe: "Agonistes dopaminergiques (Ropinirole, Pramipexole, Rotigotine)", indication: "Sujet < 65-70 ans, pour retarder dyskinésies", note: "Prudence chez le sujet âgé : confusion, hallucinations, TCI, somnolence diurne" },
                { classe: "IMAO-B (Rasagiline, Safinamide)", indication: "En association avec lévodopa pour fluctuations motrices" },
                { classe: "Inhibiteur COMT (Entacapone, Opicapone)", indication: "Fluctuations motrices — allonge l'action de la lévodopa" }
            ],
            EVITER: [
                { classe: "Neuroleptiques classiques (Halopéridol)", raison: "Antagonistes D2 → aggravation parkinsonisme", gravite: "CONTRE-INDICATION ABSOLUE" },
                { classe: "Métoclopramide", raison: "Anti-D2 → syndrome extrapyramidal", gravite: "CONTRE-INDICATION ABSOLUE", alternative: "Dompéridone (attention QT)" },
                { classe: "Neuroleptiques atypiques sauf Clozapine/Quétiapine", raison: "Risque extrapyramidal", gravite: "DECONSEILLE" },
                { classe: "Antidépresseurs tricycliques", raison: "Anticholinergiques, confusion, hypotension orthostatique", gravite: "DECONSEILLE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_001", "BIO_002", "BIO_009", "BIO_019", "BIO_025"],
            REGLES: [
                { bio: "BIO_002", note: "Hyponatrémie fréquente (SIADH, iatrogénie)" },
                { bio: "BIO_025", note: "Hypoglycémie sous traitement dopaminergique (rare)" },
                { bio: "BIO_009", note: "Anémie : aggrave asthénie et hypotension orthostatique" }
            ]
        }
    },

    "PAT_015": {
        ID: "PAT_015",
        NOM: "Épilepsie",
        REFERENCE: "ILAE 2024 | HAS 2023 | EAN 2024",
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

    "PAT_027": {
        ID: "PAT_027",
        NOM: "Insomnie",
        REFERENCE: "ESRS 2023 | ACP 2024 | Beers 2023 | STOPP/START v3",
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

    // ═══════════════════════════════════════════════════════════
    // 🩸  ENDOCRINOLOGIE & MÉTABOLISME
    // ═══════════════════════════════════════════════════════════

    "PAT_016": {
        ID: "PAT_016",
        NOM: "Diabète (Type 2 ou 1)",
        REFERENCE: "ADA Standards 2025-2026 | ESC 2023 | KDIGO 2024 | EASD 2024",

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
        REFERENCE: "ETA 2023 | ATA 2024",
        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Lévothyroxine",
                    posologie: "Dose initiale 25-50 µg/j chez le sujet âgé (12.5 µg si coronarien ou IC)",
                    titration: "Augmentation par paliers de 12.5-25 µg toutes les 6-8 semaines",
                    cible: "TSH 0.5-4.0 mUI/L (tolérer 4-6 chez le très âgé)",
                    note: "Prise à jeun 30 min avant le petit-déjeuner. Interactions : IPP, fer, calcium (espacer 2-4h)",
                    niveau_preuve: "IA"
                }
            ],
            EVITER: [
                { classe: "Surdosage lévothyroxine (TSH < 0.4)", raison: "FA, ostéoporose, angor", gravite: "RISQUE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019"],
            REGLES: [
                {
                    bio: "BIO_019",
                    nom: "TSH",
                    frequence: "6-8 semaines après chaque modification de dose, puis semestriel si stable",
                    seuils: {
                        sous_traitement: { min: 0.4, max: 4.0, note: "Cible classique" },
                        sujet_tres_age: { min: 0.5, max: 6.0, note: "Tolérer TSH plus haute chez > 80 ans (TRUST trial)" },
                        surdosage: { max: 0.1, action: "Réduire dose, ECG (rechercher FA)", syndrome: "SYND_012" }
                    }
                }
            ]
        }
    },

    "PAT_018": {
        ID: "PAT_018",
        NOM: "Hyperthyroïdie",
        REFERENCE: "ETA 2023 | ATA",
        TRAITEMENTS: {
            INITIER: [
                { classe: "Antithyroïdiens de synthèse (Thiamazole, Carbimazole)", indication: "Première intention dans Basedow", bio_suivi: ["BIO_019", "BIO_011", "BIO_012"] },
                { classe: "Bêtabloquant (Propranolol, Aténolol)", indication: "Contrôle symptomatique (tachycardie, tremblements)" }
            ],
            EVITER: [
                { classe: "Amiodarone chez patient à risque thyroïdien", raison: "Thyréotoxicose à l'amiodarone type 1 ou 2", gravite: "PRUDENCE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_019", "BIO_011", "BIO_012", "BIO_013", "BIO_014", "BIO_031"],
            REGLES: [
                { bio: "BIO_019", frequence: "Toutes les 4-6 semaines sous ATS, puis trimestriel" },
                { bio: "BIO_012", frequence: "NFS avant ATS puis toutes les 2-4 semaines x 3 mois (agranulocytose)", syndrome: "SYND_014" },
                { bio: "BIO_013", frequence: "Semestriel (hépatotoxicité ATS)", syndrome: "SYND_001" }
            ]
        }
    },

    "PAT_019": {
        ID: "PAT_019",
        NOM: "Dyslipidémie",
        REFERENCE: "ESC 2024 Dyslipidaemia | ESC 2021 CVD Prevention",
        TRAITEMENTS: {
            INITIER: [
                {
                    classe: "Statine haute intensité",
                    cibles_ldl: {
                        tres_haut_risque: { max: 1.4, note: "mmol/L — ET réduction ≥ 50% du LDL basal" },
                        haut_risque: { max: 1.8, note: "mmol/L" },
                        risque_modere: { max: 2.6, note: "mmol/L" }
                    },
                    niveau_preuve: "IA"
                },
                { classe: "Ézétimibe", indication: "Si cible LDL non atteinte sous statine max tolérée", niveau_preuve: "IB" },
                { classe: "Anti-PCSK9 (Evolocumab, Alirocumab)", indication: "Si cible LDL toujours non atteinte sous statine + ézétimibe", niveau_preuve: "IA" },
                { classe: "Acide bempédoïque", indication: "Si intolérance aux statines (myalgies confirmées)", niveau_preuve: "IIaB" },
                { classe: "Inclisiran", indication: "Alternative anti-PCSK9, injection SC semestrielle", niveau_preuve: "IIaB" }
            ],
            EVITER: [
                { classe: "Fibrate + Statine (sauf fénofibrate)", raison: "Risque rhabdomyolyse (surtout gemfibrozil)", gravite: "CONTRE-INDICATION ABSOLUE avec gemfibrozil" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_027", "BIO_013", "BIO_014", "BIO_018", "BIO_025"],
            REGLES: [
                { bio: "BIO_027", frequence: "6-8 semaines après introduction, puis annuel", note: "Vérifier atteinte cible LDL" },
                { bio: "BIO_013", frequence: "Avant traitement, puis si symptômes", seuils: { alerte: "> 3N → arrêter statine" } },
                { bio: "BIO_018", frequence: "Si myalgies sous statine", seuils: { alerte: "> 5N → arrêter statine" }, syndrome: "SYND_002" }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 🫁  PNEUMOLOGIE
    // ═══════════════════════════════════════════════════════════

    "PAT_022": {
        ID: "PAT_022",
        NOM: "Asthme",
        REFERENCE: "GINA 2024",
        TRAITEMENTS: {
            INITIER: [
                { classe: "CSI faible dose (Budésonide, Fluticasone)", indication: "Tous les stades — traitement de fond de base" },
                { classe: "CSI-Formotérol à la demande (MART)", indication: "Stratégie préférée GINA 2024 : CSI-formotérol en traitement de fond ET secours", note: "Remplace le schéma SABA seul à la demande" },
                { classe: "CSI dose moyenne + LABA", indication: "Si non contrôlé sous CSI faible dose" },
                { classe: "Anti-IL5, Anti-IgE, Anti-TSLP", indication: "Asthme sévère réfractaire", condition: "Centre spécialisé" }
            ],
            EVITER: [
                { classe: "Bêtabloquants non cardiosélectifs", raison: "Bronchospasme — CI absolue dans l'asthme", gravite: "CONTRE-INDICATION ABSOLUE" },
                { classe: "SABA seul sans CSI", raison: "GINA 2024 : ne plus prescrire SABA seul, toujours associer CSI", gravite: "DECONSEILLE" },
                { classe: "AINS / Aspirine", raison: "Bronchospasme chez certains asthmatiques (syndrome de Widal)", gravite: "PRUDENCE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_001"],
            REGLES: [
                { bio: "BIO_001", note: "Hypokaliémie sous β2-agonistes à forte dose + corticoïdes" }
            ]
        }
    },

    "PAT_023": {
        ID: "PAT_023",
        NOM: "BPCO",
        REFERENCE: "GOLD 2024",
        TRAITEMENTS: {
            INITIER: [
                { classe: "LAMA (Tiotropium, Glycopyrronium, Uméclidinium)", indication: "Groupe B-E : première intention", niveau_preuve: "IA" },
                { classe: "LAMA + LABA", indication: "Si dyspnée persistante ou exacerbations malgré LAMA seul" },
                { classe: "LAMA + LABA + CSI (trithérapie)", indication: "Si éosinophiles sanguins ≥ 300/µL et/ou ≥ 2 exacerbations modérées ou 1 hospitalisation/an", note: "IMPACT, ETHOS : réduction mortalité sous trithérapie", niveau_preuve: "IA" },
                { classe: "Azithromycine 250 mg/j au long cours", indication: "Prévention exacerbations chez ex-fumeur", condition: "Pas d'allongement QTc, pas de tachycardie", bio: "BIO_031" }
            ],
            EVITER: [
                { classe: "Bêtabloquants non cardiosélectifs", raison: "Bronchospasme", gravite: "PRUDENCE (CI relative, moins stricte que dans l'asthme)" },
                { classe: "CSI seul sans LABA", raison: "Pas d'indication en monothérapie dans la BPCO (contrairement à l'asthme)", gravite: "DECONSEILLE" },
                { classe: "Benzodiazépines / Opioïdes", raison: "Dépression respiratoire, risque vital si BPCO sévère", gravite: "PRUDENCE EXTREME", note: "Sauf soins palliatifs" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_024", "BIO_011"],
            REGLES: [
                { bio: "BIO_009", frequence: "Annuel (polyglobulie si hypoxémie chronique, ou anémie inflammatoire)" },
                { bio: "BIO_024", frequence: "Si exacerbation (CRP guide antibiothérapie)" },
                { bio: "BIO_001", note: "Hypokaliémie sous β2-agonistes + corticoïdes" }
            ]
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 🦴  RHUMATOLOGIE
    // ═══════════════════════════════════════════════════════════

    "PAT_024": {
        ID: "PAT_024",
        NOM: "Goutte",
        REFERENCE: "EULAR 2023 | ACR 2020 | HAS",
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

    // ═══════════════════════════════════════════════════════════
    // 🩺  GASTRO / NÉPHRO / INFECTIO / ONCO / GÉRIA
    // ═══════════════════════════════════════════════════════════

    "PAT_021": {
        ID: "PAT_021",
        NOM: "Ulcère Gastro-Duodénal (UGD)",
        REFERENCE: "ESGE 2024 | HAS | ACG",
        TRAITEMENTS: {
            INITIER: [
                { classe: "IPP (Oméprazole 20-40mg, Pantoprazole, Ésoméprazole)", indication: "UGD actif, éradication H. pylori, gastroprotection si indication" },
                { classe: "Éradication H. pylori", indication: "Si HP+ : quadrithérapie bismuthée 10-14j OU concomitante" }
            ],
            GASTROPROTECTION: {
                indication: "IPP recommandé si : AINS + âge > 65 ans, antiagrégant + anticoagulant, ATCD UGD",
                note: "Réévaluer systématiquement la poursuite IPP (STOPP F1)"
            },
            EVITER: [
                { classe: "AINS", raison: "Récidive ulcéreuse, saignement digestif", gravite: "CONTRE-INDICATION si UGD actif ou récent" },
                { classe: "IPP > 8 semaines sans indication", raison: "Risque : hypoMg, fractures, C. difficile, carence B12, pneumopathie", gravite: "DEPRESCRIRE", ref_stopp: "STOPP F1" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_020", "BIO_006", "BIO_021"],
            REGLES: [
                { bio: "BIO_009", frequence: "Si saignement", syndrome: "SYND_005" },
                { bio: "BIO_006", frequence: "Si IPP > 6 mois (hypomagnésémie)", syndrome: "SYND_022" },
                { bio: "BIO_021", frequence: "Si IPP > 12 mois (carence B12)" }
            ]
        }
    },

    "PAT_026": {
        ID: "PAT_026",
        NOM: "Infection Urinaire",
        REFERENCE: "SPILF 2024 | IDSA 2024 | HAS",
        TRAITEMENTS: {
            CYSTITE_SIMPLE: [
                { classe: "Fosfomycine-trométamol dose unique", indication: "Première intention cystite simple" },
                { classe: "Pivmécillinam 400mg x2/j x 5j", indication: "Alternative" },
                { classe: "Nitrofurantoïne 100mg x3/j x 5j", indication: "Alternative", note: "CI si DFG < 40 (France) ou < 30 (IDSA). Pas au long cours (pneumopathie, hépatotoxicité)." }
            ],
            PYELONEPHRITE: {
                note: "Antibiothérapie probabiliste puis adaptée à l'antibiogramme. Durée 7-10j."
            },
            EVITER: [
                { classe: "Fluoroquinolones en première intention cystite", raison: "Effets indésirables graves (tendinopathie, neuropathie, rupture aortique, C. difficile). Épargner pour infections sévères.", gravite: "DECONSEILLE en première intention", ref: "ANSM 2024, EMA" },
                { classe: "Antibiothérapie si bactériurie asymptomatique", raison: "Pas de traitement sauf grossesse ou avant geste urologique", gravite: "INUTILE ET DELETERE" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_011", "BIO_012", "BIO_024", "BIO_032", "BIO_003"],
            REGLES: [
                { bio: "BIO_024", note: "CRP guide la sévérité et la réponse" },
                { bio: "BIO_032", note: "PCT si suspicion pyélonéphrite/sepsis" },
                { bio: "BIO_003", note: "Adapter antibiothérapie au DFG" }
            ]
        }
    },

    "PAT_029": {
        ID: "PAT_029",
        NOM: "Maladie Rénale Chronique (MRC)",
        REFERENCE: "KDIGO 2024 | ESC 2023 | ADA 2025",

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

    "PAT_020": {
        ID: "PAT_020",
        NOM: "Cancer / Tumeur solide",
        REFERENCE: "ESMO 2024 | ASCO 2024 | MASCC",
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Traitement spécifique onco = hors scope de ce module. Ce module se focalise sur la surveillance biologique de la toxicité et les interactions." }
            ],
            SURVEILLANCE_TOXICITE: [
                { classe: "Chimiothérapie cytotoxique", bio: ["BIO_009", "BIO_010", "BIO_011", "BIO_012"], risque: "Cytopénie (nadir J7-J14)", syndromes: ["SYND_005", "SYND_004", "SYND_014"] },
                { classe: "Anthracyclines (Doxorubicine)", bio: ["BIO_034", "BIO_028"], risque: "Cardiotoxicité dose-cumulative", syndrome: "SYND_029" },
                { classe: "Immunothérapie (anti-PD1/CTLA4)", bio: ["BIO_019", "BIO_013", "BIO_014", "BIO_018", "BIO_025"], risque: "Toxicité immune : thyroïdite, hépatite, myosite, diabète auto-immun" },
                { classe: "Anti-VEGF (Bévacizumab)", bio: ["BIO_003"], risque: "HTA, protéinurie, néphrotoxicité" }
            ]
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_010", "BIO_011", "BIO_012", "BIO_024", "BIO_032", "BIO_033", "BIO_034", "BIO_035"],
            REGLES: [
                { bio: "BIO_012", frequence: "Avant chaque cure, nadir J7-J14", seuils: { critique: { max: 0.5, note: "PNN < 0.5 G/L = neutropénie fébrile si fièvre" } }, syndrome: "SYND_014" },
                { bio: "BIO_010", frequence: "Avant chaque cure", seuils: { critique: { max: 20, note: "Plaq < 20 G/L → transfusion CPA" } }, syndrome: "SYND_004" },
                { bio: "BIO_035", frequence: "Mensuel", note: "Dénutrition = facteur pronostique majeur", syndrome: "SYND_033" }
            ]
        }
    },

    "PAT_030": {
        ID: "PAT_030",
        NOM: "Soins Palliatifs",
        REFERENCE: "SFAP 2024 | EAPC 2023 | NICE End of Life 2024",
        TRAITEMENTS: {
            PRINCIPES: [
                { note: "Objectif = confort. Déprescrire tout médicament non contributif au confort immédiat." }
            ],
            DEPRESCRIPTION: {
                a_arreter: [
                    "Statines (aucun bénéfice en fin de vie)",
                    "Antihypertenseurs (si TA basse ou pronostic < 3 mois)",
                    "Hypoglycémiants (cible glycémique assouplie, éviter hypoglycémie)",
                    "Bisphosphonates",
                    "Fer, Vitamines (sauf si carence symptomatique)",
                    "IPP (sauf si saignement digestif actif ou symptômes GERD)"
                ],
                a_conserver: [
                    "Antalgiques (morphine/opioïdes adaptés aux symptômes)",
                    "Antiémétiques",
                    "Anxiolytiques / Sédatifs si besoin",
                    "Anticholinergiques si encombrements bronchiques (scopolamine)",
                    "Corticoïdes si dyspnée ou anorexie symptomatique"
                ]
            }
        },
        BIOLOGIE: {
            SURVEILLANCE_CIBLE: ["BIO_009", "BIO_025", "BIO_035"],
            REGLES: [
                { note: "Bilans biologiques NON systématiques en fin de vie. Ne prélever que si le résultat modifie la prise en charge de confort." }
            ]
        }
    },

    "PAT_031": {
        ID: "PAT_031",
        NOM: "Fragilité / Sénescence",
        REFERENCE: "STOPP/START v3 (2023) | Beers 2023 | NICE Multimorbidity 2024 | Consensus Gériatrique International",
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

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 TABLE DE MAPPING RAPIDE : PATHOLOGIE → SYNDROMES DE DÉCOMPENSATION
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 TABLE DE MAPPING : MÉDICAMENTS INTERDITS PAR PATHOLOGIE (STOPP-like)
// ═══════════════════════════════════════════════════════════════════════════════
// Format : patho → [{ terme_recherche, raison, gravite }]
// terme_recherche sera matché via sanitizeText sur dci/classe des médicaments actifs

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

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 FONCTION UTILITAIRE : Récupérer les règles pour une pathologie active
// ═══════════════════════════════════════════════════════════════════════════════

function getPathologyRules(pathoId) {
    return PATHOLOGY_RULES_DB[pathoId] || null;
}

function getPathoSyndromes(pathoId) {
    return PATHO_SYNDROME_MAP[pathoId] || [];
}

function getPathoInterditsMeds(pathoId) {
    return PATHO_MED_INTERDITS[pathoId] || [];
}

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

// Récupérer toutes les surveillances biologiques requises pour les pathologies actives
function getRequiredBioSurveillance(activePathoList) {
    let bioSet = new Set();
    activePathoList.forEach(pathoId => {
        let rules = PATHOLOGY_RULES_DB[pathoId];
        if (rules && rules.BIOLOGIE && rules.BIOLOGIE.SURVEILLANCE_CIBLE) {
            rules.BIOLOGIE.SURVEILLANCE_CIBLE.forEach(b => bioSet.add(b));
        }
    });
    return Array.from(bioSet);
}

// Récupérer toutes les omissions thérapeutiques (START-like) pour les pathologies actives
function getTherapeuticOmissions(activePathoList, activeMedClasses) {
    let omissions = [];
    activePathoList.forEach(pathoId => {
        let rules = PATHOLOGY_RULES_DB[pathoId];
        if (!rules || !rules.TRAITEMENTS || !rules.TRAITEMENTS.INITIER) return;
        rules.TRAITEMENTS.INITIER.forEach(ttt => {
            if (ttt.niveau_preuve && ttt.niveau_preuve.startsWith("I")) {
                // Vérification simplifiée — la logique complète de matching sera dans app_analysis.js
                let found = false;
                let searchTerms = [];
                if (ttt.classe) searchTerms.push(ttt.classe.toLowerCase());
                if (ttt.dci_exemples) ttt.dci_exemples.forEach(d => searchTerms.push(d.toLowerCase()));

                activeMedClasses.forEach(mc => {
                    let mcl = mc.toLowerCase();
                    searchTerms.forEach(st => {
                        if (mcl.includes(st) || st.includes(mcl)) found = true;
                    });
                });

                if (!found) {
                    omissions.push({
                        patho: pathoId,
                        patho_nom: rules.NOM,
                        classe_manquante: ttt.classe,
                        indication: ttt.indication,
                        niveau_preuve: ttt.niveau_preuve
                    });
                }
            }
        });
    });
    return omissions;
}
