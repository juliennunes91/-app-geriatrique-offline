// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 GERIA_INTEGRATION_MODULE — Pont entre PATHOLOGY_RULES_DB et GERIA_RECOS_DB
// ═══════════════════════════════════════════════════════════════════════════════
// Version : 1.0 — Mars 2026
// Prérequis : Charger AVANT geria_engine_v2.js et APRÈS geria_recos_final.js
//   <script src="geria_pathology_rules_v3.js"></script>
//   <script src="geria_recos_final.js"></script>
//   <script src="geria_integration_module.js"></script>  ← CE FICHIER
//   <script src="geria_engine_v2.js"></script>
//
// Ce module fournit :
//   1. REFERENTIEL_CSV_DB — 222 recommandations gériatriques sourcées (8 référentiels)
//   2. RECOS_SUPPLEMENT — 80 règles supplémentaires pour GeriaEngineV2
//   3. CROSS_REFERENCE_PATHO — Mapping PAT_xxx ↔ EV/IN rules
//   4. PATHO_BIO_MONITOR — Protocoles de surveillance biologique par pathologie
//   5. applyFullIntegration() — Fonction de fusion complète
// ═══════════════════════════════════════════════════════════════════════════════

// REFERENTIEL_CSV_DB supprimé (v0.42) : 222 recommandations, jamais lu par l'app.
// L'enrichissement multi-sources est assuré par PIM_DICT dans geria_engine_v2.js.

// REFERENTIEL_CSV_DB retiré v0.43 — données vérifiées redondantes et non référencées


// ═══════════════════════════════════════════════════════════════════════════════
// 2. RECOS_SUPPLEMENT — 80 règles non encore dans GERIA_RECOS_DB
// ═══════════════════════════════════════════════════════════════════════════════
// GeriaEngineV2.buildIndex() les intègre automatiquement à l'index inversé.
// Inclut : règles DEPRESCRIPTION, CAUTION/FORTA, PRISCUS-spécifiques, et
//          nouvelles règles STOPP v3 / Dalleur 2025 non encore converties.
// ═══════════════════════════════════════════════════════════════════════════════

const RECOS_SUPPLEMENT_INTEGRATION = [
    {
        "id": "SUP_STOP_001",
        "csv_ref": "RECO_0010",
        "sources": [
            "BEERS",
            "STOPPFRAIL"
        ],
        "ref_code": "RECO_0010",
        "section": "Cardiovasculaire",
        "titre": "Diuretique de l'anse en premiere ligne pour HTA",
        "message": "HTA sans insuffisance cardiaque concomitante necessitant un diuretique — \"Manque de donnees sur les outcomes",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "furosemide",
                "bumetanide",
                "torasemide"
            ]
        },
        "alternatives": "8",
        "nb_sources": 0
    },
    {
        "id": "SUP_STOP_002",
        "csv_ref": "RECO_0011",
        "sources": [
            "BEERS",
            "FORTA"
        ],
        "ref_code": "RECO_0011",
        "section": "Cardiovasculaire",
        "titre": "Diuretique de l'anse pour oedemes des chevilles isoles",
        "message": "Oedemes dependants sans signes cliniques/biologiques/radiologiques d'IC, hepatopathie, syndrome nephrotique ou insuffisance renale — \"Risque de deshydratation, hypokaliemie",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "furosemide",
                "bumetanide",
                "torasemide"
            ]
        },
        "alternatives": "8",
        "forta": "Oui",
        "nb_sources": 0
    },
    {
        "id": "SUP_STOP_003",
        "csv_ref": "RECO_0025",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0025",
        "section": "Cardiovasculaire",
        "titre": "Nifedipine forme immediate",
        "message": "HTA ou angor chez le sujet age (toute indication) — Hypotension reflex, tachycardie, risque SCA",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "nifedipine gelules 10mg"
            ]
        },
        "alternatives": "Utiliser uniquement formes LP. Nifedipine LP = acceptable",
        "forta": "D (FORTA D)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_004",
        "csv_ref": "RECO_0026",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0026",
        "section": "Cardiovasculaire",
        "titre": "Alpha-1 bloquants comme antihypertenseurs",
        "message": "Traitement de l'HTA (indication premiere ligne ou deuxieme ligne) — Hypotension orthostatique, syncope, augmentation mortalite cardiovasculaire (ALLHAT)",
        "severite": "danger",
        "condition": {
            "med_keys": [
                "doxazosine",
                "prazosine",
                "terazosine"
            ]
        },
        "alternatives": "Acceptable si indication urologiques (BPH). A eviter comme antihypertenseur seul",
        "forta": "D (FORTA D pour HTA)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_005",
        "csv_ref": "RECO_0027",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0027",
        "section": "Cardiovasculaire",
        "titre": "Antiarythmiques",
        "message": "Insuffisance cardiaque associee ou FEVG alteree (<40%) — Effet proarythmique, inotropisme negatif, decompensation cardiaque",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "flecainide",
                "propafenone",
                "dronedarone",
                "sotalol",
                "disopyramide"
            ]
        },
        "alternatives": "Sotalol et dronedarone: augmentent mortalite si FEVG alteree. Disopyramide: fort effet anti-cholinergique",
        "forta": "D (FORTA D si FEVG alteree)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_006",
        "csv_ref": "RECO_0028",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0028",
        "section": "Cardiovasculaire",
        "titre": "Amiodarone",
        "message": "En association avec d'autres medicaments allongeant QTc ou si dysthyroidie — Accumulation tissulaire, toxicite thyroidienne, pulmonaire, hepatique, oculaire",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "amiodarone"
            ]
        },
        "alternatives": "Surveillance TSH, bilan hepatique, EFR, ophtalmologie tous les 6 mois minimum",
        "forta": "C/D (FORTA C pour FA refractaire)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_007",
        "csv_ref": "RECO_0032",
        "sources": [
            "STOPP3",
            "BEERS",
            "FORTA",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-B4",
        "section": "Cardiovasculaire",
        "titre": "Beta-bloquant",
        "message": "Maladie coronarienne symptomatique (ischemique) — Reduction de l'angor, prevention des recidives",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "bisoprolol",
                "metoprolol",
                "carvedilol",
                "nebivolol"
            ]
        },
        "alternatives": "Cardioselectifs preferes. Maintien recommande longtemps apres IDM",
        "forta": "A (FORTA A)",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_008",
        "csv_ref": "RECO_0042",
        "sources": [
            "STOPP3",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-C3",
        "section": "Coagulation",
        "titre": "Aspirine + clopidogrel au long cours prevention AVC",
        "message": "Prevention secondaire AVC (sauf: stent coronaire <12 mois, SCA concurrent, stenose carotidienne symptomatique >50%) — Pas de benefice sur la prevention des recidives au-dela de 4 semaines. Risque hemorragique augmente",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "aspirine"
            ],
            "med_keys_2": [
                "clopidogrel"
            ]
        },
        "alternatives": "Bitherapie antiagregante justifiee uniquement dans les indications specifiees et pour duree limitee",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_009",
        "csv_ref": "RECO_0044",
        "sources": [
            "STOPP3",
            "BEERS",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-C5",
        "section": "Coagulation",
        "titre": "Antiagregant + anticoagulant",
        "message": "Maladie coronarienne, cerebrovasculaire ou arterielle peripherique STABLE — Pas de benefice additionnel. Risque hemorragique majeur",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "aspirineclopidogrel  aodavk"
            ]
        },
        "alternatives": "L'anticoagulation seule est suffisante en maladie vasculaire stable hors indication specifique d'antiagregation",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_010",
        "csv_ref": "RECO_0047",
        "sources": [
            "STOPP3",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-C8",
        "section": "Coagulation",
        "titre": "Anticoagulant prolonge premier episode TVP",
        "message": "Premier episode de TVP >6 mois sans facteur de risque persistant — Pas de benefice prouve au-dela de 6 mois. Risque hemorragique continu",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "aod",
                "avk"
            ],
            "contexte_clinique": "mtev"
        },
        "alternatives": "Reevaluer a 6 mois le rapport benefice/risque de la poursuite de l'anticoagulation",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_011",
        "csv_ref": "RECO_0048",
        "sources": [
            "STOPP3",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-C9",
        "section": "Coagulation",
        "titre": "Anticoagulant prolonge premier episode EP",
        "message": "Premier episode d'EP >12 mois sans facteur de risque persistant — Pas de benefice prouve au-dela de 12 mois. Risque hemorragique continu",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "aod",
                "avk"
            ],
            "contexte_clinique": "mtev"
        },
        "alternatives": "Reevaluer a 12 mois. Baisser dose AOD (rivaroxaban 10mg, apixaban 2.5mg) si poursuite justifiee",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_012",
        "csv_ref": "RECO_0054",
        "sources": [
            "STOPP3",
            "BEERS",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-C15",
        "section": "Coagulation",
        "titre": "Oestrogene ou androgene systemique",
        "message": "Antecedent de thrombose veineuse profonde ou embolie pulmonaire — Recidive thromboembolique veneuse",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "oestradiol oralpatch",
                "testosterone"
            ]
        },
        "alternatives": "CI absolue si ATCD TVP/EP personnel. Exception: oestrogene local (voie vaginale) = risque systemique minimal",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_013",
        "csv_ref": "RECO_0056",
        "sources": [
            "BEERS",
            "PRISCUS",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0056",
        "section": "Coagulation",
        "titre": "Anticoagulant",
        "message": "AVK si CI aux AOD\" — Fibrillation auriculaire chronique ou paroxystique (score CHA2DS2-VASc >=2 chez H, >=3 chez F)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "aod apixaban",
                "rivaroxaban",
                "dabigatran",
                "edoxaban"
            ]
        },
        "alternatives": "8",
        "priscus": "A (FORTA A)",
        "nb_sources": 0
    },
    {
        "id": "SUP_STOP_014",
        "csv_ref": "RECO_0064",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-D7",
        "section": "SNC",
        "titre": "ISRS",
        "message": "Saignement significatif en cours ou recent (hemorragie digestive, AVC hemorragique) — Risque hemorragique supplementaire par effet antiplaquettaire des ISRS",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "tous les isrs"
            ]
        },
        "alternatives": "Evaluer alternative. Si maintien ISRS: protection gastrique (IPP), surveillance hemostase",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_015",
        "csv_ref": "RECO_0080",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-D23",
        "section": "SNC",
        "titre": "Levodopa ou agoniste dopaminergique pour syndrome parkinsonien iatrogene",
        "message": "Syndrome parkinsonien induit par les antipsychotiques ou autres medicaments (cascade prescriptive) — Cascade iatrogene: augmentation des effets indesirables dopaminergiques sans traiter la cause",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "levodopacarbidopa",
                "pramipexole",
                "ropinirole"
            ]
        },
        "alternatives": "Traitement correct: arreter ou reduire l'agent causal. Si antipsychotique necessaire: changer pour quetiapine/clozapine",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_016",
        "csv_ref": "RECO_0083",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0083",
        "section": "SNC",
        "titre": "Paroxetine",
        "message": "Tout patient age (quelle que soit l'indication) — Effet anticholinergique fort parmi les ISRS (ACB=1-2). Hyponatremie. Syndrome de sevrage severe. Interactions CYP2D6",
        "severite": "danger",
        "condition": {
            "med_keys": [
                "paroxetine"
            ]
        },
        "alternatives": "Sertraline, escitalopram, ou mirtazapine preferes chez le sujet age",
        "forta": "D (FORTA: paroxetine D)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_017",
        "csv_ref": "RECO_0084",
        "sources": [
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0084",
        "section": "SNC",
        "titre": "Fluoxetine",
        "message": "Sujet age (particulierement si associe a d'autres medications) — Longue demi-vie (norfluoxetine actif t1/2 = 7-9 jours), risque accumulation, interactions CYP2D6 majeures, hyponatremie",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "fluoxetine"
            ]
        },
        "alternatives": "Escitalopram ou sertraline preferes chez le sujet age",
        "forta": "D (FORTA: C)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_018",
        "csv_ref": "RECO_0085",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0085",
        "section": "SNC",
        "titre": "Barbituriques",
        "message": "Tout usage (sauf epilepsie refractaire sous surveillance specialisee) — Dependance, confusion, chutes, interactions enzymatiques majeures (inducteurs CYP)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "phenobarbital",
                "pentobarbital"
            ]
        },
        "alternatives": "Exception: phenobarbital pour epilepsie refractaire si indication specialisee",
        "forta": "D (FORTA D)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_019",
        "csv_ref": "RECO_0086",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0086",
        "section": "SNC",
        "titre": "Medicaments myorelaxants",
        "message": "Tout patient age — Sedation excessive, confusion, chutes, effets anticholinergiques, tolerance limitee chez le sujet age",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "carisoprodol",
                "chlorzoxazone",
                "cyclobenzaprine",
                "methocarbamol",
                "orphenadrine",
                "tizanidine"
            ]
        },
        "alternatives": "Thiocolchicoside: usage court <7j uniquement. Baclofen: titration tres prudente, accumulation si IRC",
        "forta": "D (FORTA D: plupart des myorelaxants)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_020",
        "csv_ref": "RECO_0091",
        "sources": [
            "STOPP3",
            "FORTA",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-D5",
        "section": "SNC",
        "titre": "ISRS (ou IRSNA si ISRS CI, ou pregabaline)",
        "message": "Trouble anxieux generalis persistent et severe avec retentissement sur les activites et la qualite de vie — Reduction des symptomes anxieux. Maintien de l'autonomie",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "sertraline",
                "escitalopram",
                "venlafaxine",
                "pregabaline"
            ]
        },
        "alternatives": "Evaluer d'abord les causes organiques et iatrogenes d'anxiete. Approche non pharmacologique en complement",
        "forta": "A (FORTA A)",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_021",
        "csv_ref": "RECO_0092",
        "sources": [
            "STOPP3",
            "BEERS",
            "FORTA",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-D6",
        "section": "SNC",
        "titre": "Agoniste dopaminergique",
        "message": "Syndrome des jambes sans repos avec retentissement sur la qualite de vie (apres exclusion carence martiale et IRC severe - DFG<30) — Reduction des symptomes et amelioration du sommeil",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "ropinirole",
                "pramipexole",
                "rotigotine"
            ]
        },
        "alternatives": "Exclure carence en fer (ferritine <50 µg/L → supplementation d'abord). CI si DFG<30 pour pramipexole",
        "forta": "B (FORTA B)",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_022",
        "csv_ref": "RECO_0093",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-D7",
        "section": "SNC",
        "titre": "Propranolol",
        "message": "Tremblement essentiel avec retentissement fonctionnel — Reduction significative du tremblement (efficacite demontree)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "propranolol"
            ]
        },
        "alternatives": "Alternative: primidone. Attention bradycardie, hypoglycemie masquee, bronchospasme si asthme",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_023",
        "csv_ref": "RECO_0105",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-E2",
        "section": "Rénal",
        "titre": "Chelateurs du phosphore",
        "message": "IRC severe (DFG<30 ml/min) avec hyperphosphatemie persistante >1.76 mmol/L malgre regime alimentaire — Prevention de l'hyperparathyroidie secondaire et des calcifications vasculaires",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "carbonate de calcium",
                "sevelamer",
                "carbonate de lanthane"
            ]
        },
        "alternatives": "Sevelamer: prefere car n'entraine pas de surcharge calcique. Prise au repas obligatoire",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_024",
        "csv_ref": "RECO_0106",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-E3",
        "section": "Rénal",
        "titre": "Analogue de l'erythropoietine",
        "message": "IRC severe (DFG<30 ml/min) avec anemie symptomatique non attributable a une carence ferrique ou en hematinogens (Hb cible 10-12 g/dL) — Amelioration des symptomes de l'anemie, reduction des transfusions",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "darbepoetine",
                "epoetine alfa",
                "epoetine beta"
            ]
        },
        "alternatives": "Evaluer et corriger d'abord les carences (fer, B12, folates) avant EPO. Cible Hb: 10-12 g/dL",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_025",
        "csv_ref": "RECO_0111",
        "sources": [
            "STOPP3",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-F4",
        "section": "Gastro",
        "titre": "Fer oral a doses elevees",
        "message": "Doses elevees de fer oral (equivalent en element fer >200 mg/j) — Pas d'amelioration de l'absorption au-dela de ces doses. Effets indesirables digestifs augmentes",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "fumarate ferreux 600 mgj",
                "sulfate ferreux 600 mgj",
                "gluconate ferreux 1800 mgj"
            ]
        },
        "alternatives": "Dose maximale utile: 100-200 mg/j d'element fer. Si malabsorption: fer IV prefere",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_026",
        "csv_ref": "RECO_0113",
        "sources": [
            "STOPP3",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-F6",
        "section": "Gastro",
        "titre": "Antiagregant ou anticoagulant",
        "message": "Ectasie vasculaire antrale gastrique (estomac en pasteque / watermelon stomach) — Hemorragie digestive majeure",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "aspirine",
                "clopidogrel",
                "aod",
                "avk"
            ]
        },
        "alternatives": "Condition rare. Si anticoagulation ou antiagregation indispensable: traitement endoscopique de la GAVE d'abord",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_027",
        "csv_ref": "RECO_0115",
        "sources": [
            "STOPP3",
            "BEERS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-F8",
        "section": "Gastro",
        "titre": "Acetate de megestrol",
        "message": "Stimulation de l'appetit chez le sujet age (quelle qu'en soit l'indication) — Thrombose (MTEV), oedemes, insuffisance surrenalienne, mortalite sans efficacite prouvee",
        "severite": "danger",
        "condition": {
            "med_keys": [
                "megace"
            ]
        },
        "alternatives": "Complement nutritionnel oral, evaluation nutritionnelle dietetique. Mirtazapine si depression+anorexie associees",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_028",
        "csv_ref": "RECO_0119",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-F4",
        "section": "Gastro",
        "titre": "Fibre alimentaire",
        "message": "Diverticulose avec antecedent de constipation — Prevention des complications de la diverticulose, regularisation du transit",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "psyllium",
                "ispaghule",
                "methylcellulose"
            ]
        },
        "alternatives": "Hydratation suffisante indispensable (>1.5 L/j). Eviter si subocclusion",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_029",
        "csv_ref": "RECO_0121",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-F6",
        "section": "Gastro",
        "titre": "Probiotiques",
        "message": "Antibiotherapie (prevention de la diarrhee a Clostridioides difficile) - sauf immunodeprime severe ou denutrition severe — Reduction du risque de diarrhee a C.difficile sous antibiotiques",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "saccharomyces boulardii",
                "lactobacillus rhamnosus"
            ]
        },
        "alternatives": "Exclure immunodepression severe. Saccharomyces boulardii: CI si Candida bacteremie",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_030",
        "csv_ref": "RECO_0122",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-F7",
        "section": "Gastro",
        "titre": "Eradication H.pylori",
        "message": "Ulcere peptique actif associe a H.pylori — Guerison de l'ulcere, prevention des recidives, reduction du risque de cancer gastrique",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "triple therapie ou quadritherapie"
            ]
        },
        "alternatives": "Verification eradication par test respiratoire a l'uree ou coproantigenee a 4 semaines post-traitement",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_031",
        "csv_ref": "RECO_0124",
        "sources": [
            "STOPP3",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-G2",
        "section": "Respiratoire",
        "titre": "Corticosteroides systemiques a la place des inhales dans BPCO",
        "message": "Traitement de maintenance BPCO moderee a severe (a la place des CSI inhales) — Effets indesirables systemiques des corticosteroides (diabete, osteoporose, infections)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "prednisolone",
                "methylprednisolone"
            ]
        },
        "alternatives": "CSI inhales (fluticasone, budesonide) sont le standard de soin. Corticosteroides systemiques uniquement pour exacerbations aigues",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_032",
        "csv_ref": "RECO_0127",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0127",
        "section": "Respiratoire",
        "titre": "LAMA ou LABA",
        "message": "formoterol, salmeterol, indacaterol (LABA)\" — Asthme ou BPCO GOLD 1-2 symptomatiques",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "tiotropium",
                "aclidinium",
                "umeclidinium"
            ]
        },
        "alternatives": "8",
        "forta": "Oui",
        "priscus": "A (FORTA A)",
        "nb_sources": 0
    },
    {
        "id": "SUP_START_033",
        "csv_ref": "RECO_0129",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-G3",
        "section": "Respiratoire",
        "titre": "Oxygenotherapie de longue duree",
        "message": "Hypoxemie chronique (pO2 <8.0 kPa ou 60 mmHg) ou SaO2 <88% au repos — Reduction de la mortalite (COPD), amelioration symptomatique",
        "severite": "danger",
        "condition": {
            "med_keys": [
                "o2 concentrateur  15hj"
            ]
        },
        "alternatives": "Evaluation: 2 gazometries arterielles a distance d'une exacerbation. Cible SaO2: 88-92% dans la BPCO",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_034",
        "csv_ref": "RECO_0133",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-H4",
        "section": "Musculo",
        "titre": "Corticoide systemique au long cours en monotherapie",
        "message": "Polyarthrite rhumatoide en monotherapie (>3 mois) — Effets indesirables systemiques des corticoides au long cours (diabete, osteoporose, infections, cataracte)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "prednisolone",
                "prednisone",
                "methylprednisolone"
            ]
        },
        "alternatives": "Methotrexate ou biotherapie (anti-TNF, anti-IL6, abatacept) en association pour permettre reduction corticoides",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_035",
        "csv_ref": "RECO_0134",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-H5",
        "section": "Musculo",
        "titre": "Corticoide systemique pour arthrose",
        "message": "Arthrose (toute localisation) — Pas d'indication systemique dans l'arthrose. Effets indesirables majeurs (sauf injection intra-articulaire)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "prednisolone",
                "methylprednisolone"
            ]
        },
        "alternatives": "Injections intra-articulaires de corticoide: indication limitee, maximum 3/an par articulation",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_036",
        "csv_ref": "RECO_0137",
        "sources": [
            "STOPP3",
            "BEERS",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-H8",
        "section": "Musculo",
        "titre": "Bisphosphonates oraux",
        "message": "Antecedent d'oesophagite, gastrite, duodenite, ulcere gastroduodenal ou saignement digestif haut (actuel ou recent) — Rechute ou exacerbation de la maladie oesogastrique",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "alendronate",
                "risedronate",
                "ibandronate"
            ]
        },
        "alternatives": "Bisphosphonate IV (acide zoledronique 1x/an) si voie orale contre-indiquee. Denosumab: alternative",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_037",
        "csv_ref": "RECO_0139",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0139",
        "section": "Musculo",
        "titre": "Indomethacine et ketorolac",
        "message": "Tout patient age (voie orale ou parenterale) — Risque plus eleve d'effets indesirables que les autres AINS (GI, renaux, SNC, hematologiques)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "indocid",
                "toradol"
            ]
        },
        "alternatives": "Alternatives: paracetamol, AINS selectifs COX-2 si necessary",
        "forta": "D (FORTA D)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_038",
        "csv_ref": "RECO_0140",
        "sources": [
            "STOPP3",
            "BEERS",
            "FORTA",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-H1",
        "section": "Musculo",
        "titre": "Traitement de fond (DMARD) rhumatologie",
        "message": "Polyarthrite rhumatoide active et invalidante — Reduction de l'activite de la maladie, prevention des lesions articulaires",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "methotrexate",
                "leflunomide",
                "hydroxychloroquine",
                "sulfasalazine"
            ]
        },
        "alternatives": "Methotrexate en premiere ligne avec acide folique. Biotherapie si echec des csDMARD",
        "forta": "A (FORTA A)",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_039",
        "csv_ref": "RECO_0141",
        "sources": [
            "STOPP3",
            "BEERS",
            "FORTA",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-H2",
        "section": "Musculo",
        "titre": "Bisphosphonate + Vitamine D + Calcium",
        "message": "Corticotherapie systemique au long cours (>3 mois) — Prevention de l'osteoporose induite par les corticosteroides",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "alendronaterisedronate  cholecalciferol  calcium"
            ]
        },
        "alternatives": "Bisphosphonate des la premiere prescription de corticoide >3 mois. Densitometrie osseuse a la baseline",
        "forta": "A (FORTA A)",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_040",
        "csv_ref": "RECO_0145",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-H6",
        "section": "Musculo",
        "titre": "Traitement anti-resorptif apres arret denosumab",
        "message": "Apres arret de >=2 doses de denosumab (effet rebond documente) — Prevention du rebond de resorption osseuse et des fractures vertebrales post-arret denosumab",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "bisphosphonate alendronate",
                "acide zoledronique"
            ]
        },
        "alternatives": "Bisphosphonate IV (acide zoledronique) 3-6 mois apres derniere injection denosumab = plus efficace",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_041",
        "csv_ref": "RECO_0146",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-H7",
        "section": "Musculo",
        "titre": "Traitement anti-resorptif apres arret teriparatide",
        "message": "Apres arret de teriparatide ou abaloparatide (prevention perte du gain osseux) — Prevention de la perte de la densite osseuse acquise sous teriparatide",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "bisphosphonate ou denosumab"
            ]
        },
        "alternatives": "Sans relais anti-resorptif: perte rapide du benefice osseux dans les 12-18 mois",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_042",
        "csv_ref": "RECO_0150",
        "sources": [
            "STOPP3",
            "BEERS",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-I2",
        "section": "Urogénital",
        "titre": "Antimuscarinique systemique",
        "message": "Glaucome a angle ferme — Exacerbation aigue du glaucome",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "oxybutynine",
                "tolterodine",
                "solifenacine",
                "darifenacine",
                "fesoterodine",
                "trospium"
            ]
        },
        "alternatives": "Mirabegron: alternative si glaucome. Consultation ophtalmo pour confirmer le type de glaucome",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_043",
        "csv_ref": "RECO_0151",
        "sources": [
            "STOPP3",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-I3",
        "section": "Urogénital",
        "titre": "Antimuscarinique systemique",
        "message": "Symptomes du bas appareil urinaire lies a une HBP avec volume post-mictionnel eleve (>200 mL) — Retention urinaire aigue chez l'homme age",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "oxybutynine",
                "tolterodine",
                "solifenacine",
                "darifenacine",
                "fesoterodine"
            ]
        },
        "alternatives": "Mesurer le residu post-mictionnel systematiquement. Si >200 mL: eviter tout antimuscarinique",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_044",
        "csv_ref": "RECO_0155",
        "sources": [
            "STOPP3",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-I7",
        "section": "Urogénital",
        "titre": "Duloxetine",
        "message": "Incontinence par urgence mictionnelle ou urgenturie (sans composante de stress) — Indication dans l'incontinence de STRESS uniquement (pas dans l'incontinence par urgence)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "duloxetine yentreve",
                "cymbalta"
            ]
        },
        "alternatives": "Duloxetine: uniquement dans l'incontinence d'effort (stress). Antimuscarinique ou mirabegron si urgence",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_045",
        "csv_ref": "RECO_0158",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-I2",
        "section": "Urogénital",
        "titre": "Inhibiteur de la 5-alpha reductase",
        "message": "HBP avec volumes importants / SBAU persistants (quand prostatectomie non indiquee) — Reduction du volume prostatique, amelioration des symptomes a long terme, prevention de la retention",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "finasteride",
                "dutasteride"
            ]
        },
        "alternatives": "Effet apres 6 mois minimum. Efficacite accrue en association avec alpha-bloquant si volume prostatique >40mL",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_046",
        "csv_ref": "RECO_0159",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-I3",
        "section": "Urogénital",
        "titre": "Oestrogene local voie vaginale",
        "message": "Secheresse et atrophie vaginales symptomatiques (dyspareunie, prurit) — Amelioration des symptomes locaux, amelioration de la qualite de vie sexuelle",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "oestradiol ovule",
                "creme",
                "anneau vaginal"
            ]
        },
        "alternatives": "Tres faible absorption systemique (niveau physiologique). Peut etre utilisee meme si ATCD cancer sein si gyneco d'accord",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_047",
        "csv_ref": "RECO_0160",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-I4",
        "section": "Urogénital",
        "titre": "Oestrogene local voie vaginale",
        "message": "Infections urinaires recurrentes chez la femme (prevention) — Reduction significative du risque de recidives d'IU (restauration de la flore lactobacillaire)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "oestradiol vaginal"
            ]
        },
        "alternatives": "Indication validee par HAS dans les IU recurrentes de la femme post-menopausee",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_048",
        "csv_ref": "RECO_0161",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-I5",
        "section": "Urogénital",
        "titre": "Inhibiteur de la PDE5",
        "message": "Dysfonction erectile persistante causant une detresse psychologique — Amelioration de la fonction erectile, qualite de vie",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "sildenafil",
                "tadalafil",
                "vardenafil",
                "avanafil"
            ]
        },
        "alternatives": "CI absolue avec nitrates. Prudence si HTA non controlee, IC severe, ATCD AVC/IDM recent (<6 mois)",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_049",
        "csv_ref": "RECO_0166",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-J5",
        "section": "Endocrine",
        "titre": "Oestrogene systemique (oral ou patch)",
        "message": "Antecedent de cancer du sein — Recidive tumorale",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "oestradiol oral",
                "oestradiol patch",
                "oestrogenes conjugues"
            ]
        },
        "alternatives": "Exception: oestrogene local (vaginal) = risque systemique minimal, peut etre discute avec oncologue",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_050",
        "csv_ref": "RECO_0167",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-J6",
        "section": "Endocrine",
        "titre": "Oestrogene systemique (oral ou patch)",
        "message": "Antecedent de thrombose veineuse profonde ou embolie pulmonaire — Recidive thromboembolique",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "oestradiol oral",
                "patch",
                "oestrogenes conjugues"
            ]
        },
        "alternatives": "CI absolue si ATCD TVP/EP. Exception: oestrogene local (vaginal) - voir I3/I4",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_051",
        "csv_ref": "RECO_0168",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-J7",
        "section": "Endocrine",
        "titre": "Hormonotherapie menopausique (oestrogene + progestatif)",
        "message": "Maladies arterielles stenose coronarienne, cerebrovasculaire ou arterielle peripherique etablie — Thrombose arterielle aigue",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "ths combine oral ou patch"
            ]
        },
        "alternatives": "CI si maladie arterielle etablie. Oestrogene seul transdermal: profil thromboembolique plus favorable",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_052",
        "csv_ref": "RECO_0169",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-J8",
        "section": "Endocrine",
        "titre": "Oestrogene systemique sans progestatif",
        "message": "Uterus intact (non hypersterectomisee) — Cancer de l'endometre (hyperplasie puis neoplasie endometriale)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "oestradiol seul oral ou patch"
            ]
        },
        "alternatives": "Oestrogene seul uniquement si hysterectomie. Si uterus present: oestrogene+progestatif obligatoire",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_053",
        "csv_ref": "RECO_0172",
        "sources": [
            "BEERS",
            "FORTA",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0172",
        "section": "Endocrine",
        "titre": "Insuline en glissant ou sliding scale",
        "message": "Diabetique sous insuline sliding scale seule (sans insuline basale) — Hypoglycemies et hyperglycemies alternatives, controle glycemique mediocre",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "insuline rapide reactive seule"
            ]
        },
        "alternatives": "Schema basale-bolus prefere. Si injection unique: insuline basale 1x/j plus predictible",
        "forta": "C/D (FORTA)",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_054",
        "csv_ref": "RECO_0173",
        "sources": [
            "BEERS",
            "FORTA",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0173",
        "section": "Endocrine",
        "titre": "Testosterone ou androgene",
        "message": "\"Homme age avec hypogonadisme non confirme biologiquement ou symptomes vagues de \"\"vieillissement\"\"\" — Risque thrombotique (MTEV, AVC, IDM), polyglobulie, apnee du sommeil aggravee, cancer prostate",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "testosterone gel",
                "patch",
                "injectable"
            ]
        },
        "alternatives": "Indiquer uniquement si hypogonadisme confirme (testosterone totale <8 nmol/L) + symptomes. Surveillance PSA, NFS, hematocrite",
        "forta": "D (FORTA D)",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_055",
        "csv_ref": "RECO_0174",
        "sources": [
            "BEERS",
            "FORTA",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0174",
        "section": "Endocrine",
        "titre": "Hormone de croissance (GH)",
        "message": "Traitement de l'aging ou amelioration des performances physiques (anti-aging) — Risque de diabete, oedemes, syndrome du canal carpien, neoplasie",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "somatropine",
                "somatropin"
            ]
        },
        "alternatives": "Indication limitee: deficit severe confirme en GH d'origine hypothalamo-hypophysaire",
        "forta": "D (FORTA D)",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_056",
        "csv_ref": "RECO_0186",
        "sources": [
            "STOPP3",
            "BEERS",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-K11",
        "section": "Chutes",
        "titre": "Antihypertenseurs d'action centrale chez chuteur",
        "message": "Patient avec antecedent de chutes (ou TOUT patient age en prevention) — Alteration du sensorium, hypotension orthostatique",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "methyldopa",
                "clonidine",
                "moxonidine",
                "rilmenidine",
                "guanfacine"
            ]
        },
        "alternatives": "Ces molecules sont inappropriees chez le sujet age quelle que soit l'indication. Substituer systematiquement",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_057",
        "csv_ref": "RECO_0190",
        "sources": [
            "STOPP3",
            "BEERS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-L3",
        "section": "Antalgiques",
        "titre": "Opioide longue duree seul sans opioide de secours",
        "message": "Douleurs moderes a severes de fond (sans opioide d'action rapide pour acces douloureux) — Douleur de fond non soulagee, pas de possibilite de traitement des acces douloureux",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "morphine lp",
                "oxycodone lp",
                "fentanyl patch",
                "buprenorphine patch"
            ]
        },
        "alternatives": "Toujours associer un opioide d'action rapide (morphine IR, oxycodone IR) pour les acces douloureux paroxystiques",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_058",
        "csv_ref": "RECO_0191",
        "sources": [
            "STOPP3",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-L4",
        "section": "Antalgiques",
        "titre": "Patch de lidocaine pour arthrose chronique",
        "message": "Douleur chronique d'arthrose (quelle que soit la localisation) — Pas de preuve claire d'efficacite dans l'arthrose. Usage limite aux douleurs neuropathiques localisees",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "patch de lidocaine 5"
            ]
        },
        "alternatives": "Indication validee: nevralgie post-zosterienne et douleurs neuropathiques localisees. Pas d'indication dans l'arthrose",
        "nb_sources": 8
    },
    {
        "id": "SUP_START_059",
        "csv_ref": "RECO_0201",
        "sources": [
            "STOPP3",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "START3-L4",
        "section": "Vaccins",
        "titre": "Vaccin SARS-CoV2",
        "message": "Tous les patients ages selon les recommandations nationales (booster annuel en France 2024) — Prevention des formes graves, hospitalisations et deces COVID-19",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "covid-19 marn ou sous-unite"
            ]
        },
        "alternatives": "Rappels annuels recommandes pour les >65 ans et les immunodeprimes. Co-administration avec grippe possible",
        "nb_sources": 8
    },
    {
        "id": "SUP_DEP_060",
        "csv_ref": "RECO_0202",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0202",
        "section": "Cardiovasculaire",
        "titre": "Statines (STOPP/FRAIL)",
        "message": "Patient fragile severe (CFS >=6) ou esperance de vie estimee <1 an (soins palliatifs) — Rapport benefice/risque defavorable: pas de benefice cardiovasculaire documente sur horizon de vie residuel",
        "severite": "info",
        "condition": {
            "med_keys": [
                "atorvastatine",
                "rosuvastatine",
                "simvastatine"
            ],
            "fragilite": "severe"
        },
        "alternatives": "Arreter progressivement les statines chez le patient en fin de vie ou fragilite severe. Benefice preventif nul a court terme",
        "forta": "D (FORTA D: fragilite severe)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_DEP_061",
        "csv_ref": "RECO_0203",
        "sources": [
            "STOPP3",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "STOPP3-severe",
        "section": "Cardiovasculaire",
        "titre": "Antihypertenseurs (STOPP/FRAIL)",
        "message": "Patient fragile severe avec PA bien controlee, hypotension orthostatique ou asthenie severe — \"Risque de chutes, d'hypotension, d'insuffisance renale aigue",
        "severite": "info",
        "condition": {
            "med_keys": [
                "iec",
                "ara2",
                "ica",
                "beta-bloquants",
                "diuretiques"
            ],
            "fragilite": "severe"
        },
        "alternatives": "8",
        "nb_sources": 0
    },
    {
        "id": "SUP_DEP_062",
        "csv_ref": "RECO_0204",
        "sources": [
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0204",
        "section": "Coagulation",
        "titre": "Anticoagulants (STOPP/FRAIL)",
        "message": "Patient fragile severe avec risque de chute tres eleve (CFS >=7) et risque hemorragique majeur sans MTE recente — Rapport risque hemorragique/benefice antithrombotique defavorable chez le chuteur extreme",
        "severite": "info",
        "condition": {
            "med_keys": [
                "aod",
                "avk"
            ],
            "fragilite": "severe"
        },
        "alternatives": "Decision individuelle, multidisciplinaire. Discussions avec le patient et les proches. Continuer si FA + risque AVC tres eleve (CHA2DS2 >6)",
        "nb_sources": 8
    },
    {
        "id": "SUP_DEP_063",
        "csv_ref": "RECO_0205",
        "sources": [
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0205",
        "section": "Endocrine",
        "titre": "Bisphosphonates (STOPP/FRAIL)",
        "message": "Patient fragile severe ou esperance de vie <3 ans (pas de benefice fracturaire documente sur horizon court) — Pas de benefice osseux significatif avant 1-3 ans. Effets indesirables gastrointestinaux et renaux",
        "severite": "info",
        "condition": {
            "med_keys": [
                "alendronate",
                "risedronate",
                "acide zoledronique"
            ],
            "fragilite": "severe"
        },
        "alternatives": "Arreter si fragilite severe. Continuer vitamin D + calcium si carence confirmee (benefice sur chutes)",
        "nb_sources": 8
    },
    {
        "id": "SUP_DEP_064",
        "csv_ref": "RECO_0206",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0206",
        "section": "Gastro",
        "titre": "IPP (STOPP/FRAIL)",
        "message": "Patient fragile sans indication clara (pas de RGO, pas d'ulcere, pas de corticoide/AINS, pas d'antiagregant) — Effets indesirables cumules: hypomagnesemie, fractures, infections. Polypharmacie",
        "severite": "info",
        "condition": {
            "med_keys": [
                "ipp omeprazole",
                "pantoprazole",
                "etc"
            ],
            "fragilite": "severe"
        },
        "alternatives": "Les IPP sont tres largement sur-prescrits. Tentative d'arret par reduction graduelle dans les 4-8 semaines si pas d'indication",
        "forta": "C (FORTA: sans indication)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_DEP_065",
        "csv_ref": "RECO_0207",
        "sources": [
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0207",
        "section": "Métabolisme",
        "titre": "Deprescription preventive globale chez le fragile severe (STOPP/FRAIL)",
        "message": "Patient fragile severe (CFS >=7) ou en fin de vie avec ordonnance chargee (polypharmacie >=10 medicaments) — Elimination des medicaments preventifs dont le benefice se manifeste a un horizon superieur a l'esperance de vie. Reduction des effets indesirables, amelioration de la qualite de vie",
        "severite": "info",
        "condition": {
            "med_keys": [
                "statines",
                "antihypertenseurs",
                "bisphosphonates",
                "aspirine prevention primaire",
                "multivitamines sans carence",
                "supplements sans indication"
            ],
            "fragilite": "severe"
        },
        "alternatives": "Approche STOPP/FRAIL: revue systematique de toutes les medications preventives en fin de vie. Score FRAIL ou CFS avant deprescription",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_066",
        "csv_ref": "RECO_0208",
        "sources": [
            "BEERS",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0208",
        "section": "SNC",
        "titre": "Chlorpromazine, thioridazine, melperone (fortes doses)",
        "message": "Tout patient age (PRISCUS 2.0) — Effets anticholinergiques majeurs, risque de chutes, QTc prolongation (thioridazine surtout)",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "chlorpromazine",
                "thioridazine",
                "melperone"
            ]
        },
        "alternatives": "Thioridazine: usage tres restreint (retinopathie pigmentaire, arythmies). Non disponible dans de nombreux pays",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_067",
        "csv_ref": "RECO_0209",
        "sources": [
            "FORTA",
            "PRISCUS",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0209",
        "section": "Cardiovasculaire",
        "titre": "Antiarythmiques classe Ic en premisses chez le sujet age",
        "message": "Patient age (>65 ans) avec cardiopathie structurelle ou post-IDM — Effet proarythmique, augmentation de la mortalite post-IDM (etude CAST)",
        "severite": "danger",
        "condition": {
            "med_keys": [
                "flecainide",
                "propafenone"
            ]
        },
        "alternatives": "Flecainide et propafenone: uniquement si absence de cardiopathie structurelle et sous surveillance specialisee",
        "forta": "D (FORTA D: cardiopathie structurelle)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_068",
        "csv_ref": "RECO_0210",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0210",
        "section": "SNC",
        "titre": "Amitriptyline a fortes doses (>75 mg/j)",
        "message": "Tout patient age (PRISCUS 2.0: dose seuil) — Effets anticholinergiques, cardiotoxicite, risque de chutes proportionnels a la dose",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "amitriptyline"
            ]
        },
        "alternatives": "Amitriptyline a eviter chez le sujet age. Si utilise: dose minimale (<25-50 mg/j), duree courte",
        "forta": "D (FORTA D)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_069",
        "csv_ref": "RECO_0211",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0211",
        "section": "Endocrine",
        "titre": "Glibenclamide et glimepiride",
        "message": "Diabete de type 2 chez sujet age >65 ans — Hypoglycemies prolongees et severes (surtout glibenclamide t1/2 long, metabolites actifs)",
        "severite": "danger",
        "condition": {
            "med_keys": [
                "glibenclamide",
                "glimepiride"
            ]
        },
        "alternatives": "Preferer gliclazide LP ou DPP-4 inhibiteur ou metformine selon DFG. Cibles glycemiques moins strictes apres 75 ans",
        "forta": "D (FORTA D)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_CAUT_070",
        "csv_ref": "RECO_0212",
        "sources": [
            "FORTA",
            "PRISCUS",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0212",
        "section": "Cardiovasculaire",
        "titre": "Digoxine FORTA C (IC)",
        "message": "Insuffisance cardiaque a FE reduite (ICFEr) (prevention FA rapide) — Benefice sur la frequence mais pas sur la mortalite. Fenetre therapeutique etroite. Dose max 0.125 mg/j apres 70 ans",
        "severite": "info",
        "condition": {
            "med_keys": [
                "digoxine"
            ]
        },
        "alternatives": "Digoxine: FORTA C = utilisation avec prudence. Surveillance dosage serrique, ionogramme, creatinine",
        "forta": "C (FORTA C: ICFEr)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_CAUT_071",
        "csv_ref": "RECO_0213",
        "sources": [
            "FORTA",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0213",
        "section": "Cardiovasculaire",
        "titre": "Amiodarone FORTA C (FA refractaire)",
        "message": "FA refractaire aux autres traitements — FORTA C: efficace mais toxicite cumulee importante (thyroide, poumon, hepatique, oculaire, QT)",
        "severite": "info",
        "condition": {
            "med_keys": [
                "amiodarone"
            ]
        },
        "alternatives": "Surveillance semi-annuelle: TSH+FT4, bilan hepatique, EFR+radio thorax, bilan ophtalmique",
        "forta": "C (FORTA C)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_CAUT_072",
        "csv_ref": "RECO_0214",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0214",
        "section": "SNC",
        "titre": "Pregabaline et gabapentine FORTA C/D",
        "message": "Neuropathie, epilepsie ou anxiete generalisee — FORTA C: efficace mais risque de sedation, confusion, chutes, abus/dependance chez le sujet age",
        "severite": "info",
        "condition": {
            "med_keys": [
                "pregabaline",
                "gabapentine"
            ]
        },
        "alternatives": "8",
        "forta": "\"C/D (FORTA C: indication neuropathie",
        "priscus": "D: si hors indication)\"",
        "nb_sources": 0
    },
    {
        "id": "SUP_CAUT_073",
        "csv_ref": "RECO_0215",
        "sources": [
            "BEERS",
            "FORTA",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0215",
        "section": "Musculo",
        "titre": "AINS topiques FORTA B",
        "message": "Arthrose localisee accessible topiquement (genou, mains, epaules) — FORTA B: efficacite sur la douleur locale comparable aux AINS oraux avec moins d'effets systemiques",
        "severite": "info",
        "condition": {
            "med_keys": [
                "ains topiques diclofenac gel",
                "ketoprofene gel",
                "ibuprofene topique"
            ]
        },
        "alternatives": "A privilegier avant les AINS oraux si zone accessible. Eviter sur peau lesee ou muqueuses",
        "forta": "B (FORTA B)",
        "nb_sources": 8
    },
    {
        "id": "SUP_CAUT_074",
        "csv_ref": "RECO_0216",
        "sources": [
            "FORTA",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0216",
        "section": "SNC",
        "titre": "Mirtazapine FORTA B",
        "message": "Depression avec insomnie et/ou anorexie associees — FORTA B: bonne tolerance chez le sujet age mais risque de sedation, prise de poids, chutes",
        "severite": "info",
        "condition": {
            "med_keys": [
                "mirtazapine"
            ]
        },
        "alternatives": "Mirtazapine utile si depression + insomnie + anorexie. Prise unique le soir. Surveiller le poids",
        "forta": "B (FORTA B)",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_075",
        "csv_ref": "RECO_0217",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0217",
        "section": "SNC",
        "titre": "Trihexyphenidyle (Artane), biperiden (Akineton)",
        "message": "Tout patient age de plus de 65 ans (sauf indication specifique specialisee) — Effets anticholinergiques puissants: confusion, retention urinaire, glaucome, secheresse buccale. Score ACB=3",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "trihexyphenidyle",
                "biperiden",
                "tropatepine"
            ]
        },
        "alternatives": "Reserves aux EPS reels et recement apparus. Si indispensables: doses minimales, durees courtes",
        "forta": "D (FORTA D)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_076",
        "csv_ref": "RECO_0218",
        "sources": [
            "BEERS",
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0218",
        "section": "SNC",
        "titre": "Oxybutynine",
        "message": "Sujet age (particulierement >75 ans) — Fort profil anticholinergique, passage BHE important: deterioration cognitive, confusion, retention urinaire aigue. Score ACB=3",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "oxybutynine ditropan",
                "driptane"
            ]
        },
        "alternatives": "Preferer solifenacine, fesoterodine ou darifenacine (selectivite M3). Mirabegron si contre-indication anticholinergiques. Reeducation vesicale en premier",
        "forta": "D (FORTA D)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_077",
        "csv_ref": "RECO_0219",
        "sources": [
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0219",
        "section": "SNC",
        "titre": "Tianeptine",
        "message": "Tout patient age (risque d'abus et de pharmacodependance) — Potentiel d'abus et de dependance (agoniste opioide mu a fortes doses), syndrome de sevrage",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "stablon"
            ]
        },
        "alternatives": "ANSM: alertes repetees sur le detournement d'usage de la tianeptine. Surveillance accrue",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_078",
        "csv_ref": "RECO_0220",
        "sources": [
            "BEERS",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0220",
        "section": "Cardiovasculaire",
        "titre": "Medicaments nefrotoxiques en association chez le sujet age",
        "message": "Association triple: AINS + IEC ou ARA2 + diuretique (nephrotoxicite synergique) — Insuffisance renale aigue (IRA) severe (triple whammy = multiplicateur de risque x4)",
        "severite": "danger",
        "condition": {
            "med_keys": [
                "ains  iecara2  diuretique"
            ]
        },
        "alternatives": "Eviter systematiquement cette triple association. Si AINS indispensable: arreter temporairement IEC/ARA2 + diuretique",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_079",
        "csv_ref": "RECO_0221",
        "sources": [
            "FORTA",
            "PRISCUS",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0221",
        "section": "Gastro",
        "titre": "Domperidone",
        "message": "Tout patient age (particulierement si maladie cardiaque ou QTc allonge) — Risque de mort subite cardiaque (decede 1,8x risque, CE 2014). Prolongation QTc dose-dependante",
        "severite": "danger",
        "condition": {
            "med_keys": [
                "motilium"
            ]
        },
        "alternatives": "Dose maximale: 10 mg x3/j, duree maximale 7 jours. CI si QTc allonge, medicaments QT, hepatopathie severe. Metoclopramide: duree <5j",
        "forta": "D (FORTA D)",
        "priscus": "Oui",
        "nb_sources": 8
    },
    {
        "id": "SUP_STOP_080",
        "csv_ref": "RECO_0222",
        "sources": [
            "FORTA",
            "PRISCUS",
            "STOPPFRAIL",
            "REMEDIES",
            "PIM_CHECK"
        ],
        "ref_code": "RECO_0222",
        "section": "SNC",
        "titre": "Clonazepam (indication non epilepsie)",
        "message": "Utilisation comme anxiolytique ou hypnotique (hors epilepsie) — BZD de longue duree d'action: risque de chutes, sedation prolongee, dependance elevee. Non indique en dehors de l'epilepsie",
        "severite": "warning",
        "condition": {
            "med_keys": [
                "rivotril"
            ]
        },
        "alternatives": "Clonazepam uniquement pour epilepsie (indication AMM). Prescriptions chez le sujet age comme anxiolytique: inappropriees",
        "forta": "D (FORTA D: hors epilepsie)",
        "priscus": "Oui",
        "nb_sources": 8
    }
];

// CROSS_REFERENCE_PATHO retiré v0.43 — mapping jamais utilisé


// ═══════════════════════════════════════════════════════════════════════════════
// 4. PATHO_BIO_MONITOR — Protocoles de surveillance biologique par pathologie
// ═══════════════════════════════════════════════════════════════════════════════
// Dérivé de PATHOLOGY_RULES_DB. Permet à l'interface de rappeler les bilans
// biologiques requis pour chaque pathologie active du patient.
// ═══════════════════════════════════════════════════════════════════════════════

const PATHO_BIO_MONITOR = [
    {
        "id": "BIO_MON_IC",
        "pathos": [
            "PAT_002",
            "PAT_003"
        ],
        "bio": [
            "BIO_028",
            "BIO_001",
            "BIO_002",
            "BIO_003",
            "BIO_009"
        ],
        "frequence": "Trimestriel + post-titration",
        "source": "ESC_HF_2023"
    },
    {
        "id": "BIO_MON_FA",
        "pathos": [
            "PAT_006"
        ],
        "bio": [
            "BIO_031",
            "BIO_030",
            "BIO_019",
            "BIO_003"
        ],
        "frequence": "DFG/10 mois sous DOAC, TSH/6m sous amiodarone",
        "source": "ESC_AF_2024"
    },
    {
        "id": "BIO_MON_DT2",
        "pathos": [
            "PAT_016",
            "PAT_016a",
            "PAT_016b"
        ],
        "bio": [
            "BIO_026",
            "BIO_025",
            "BIO_003",
            "BIO_004",
            "BIO_021"
        ],
        "frequence": "HbA1c/3-6m, DFG/6m, B12/an si metformine",
        "source": "ADA_2025"
    },
    {
        "id": "BIO_MON_MRC",
        "pathos": [
            "PAT_029"
        ],
        "bio": [
            "BIO_003",
            "BIO_004",
            "BIO_001",
            "BIO_005",
            "BIO_009",
            "BIO_023"
        ],
        "frequence": "Selon stade: G3a/6m, G3b/3m, G4-5/1-3m",
        "source": "KDIGO_CKD_2024"
    },
    {
        "id": "BIO_MON_THYROID",
        "pathos": [
            "PAT_017",
            "PAT_018"
        ],
        "bio": [
            "BIO_019",
            "BIO_012",
            "BIO_013"
        ],
        "frequence": "TSH/6-8sem post-modif, PNN/2-4sem sous ATS",
        "source": "ETA_2023"
    },
    {
        "id": "BIO_MON_EPILEPSIE",
        "pathos": [
            "PAT_015"
        ],
        "bio": [
            "BIO_002",
            "BIO_013",
            "BIO_010",
            "BIO_023"
        ],
        "frequence": "Na/3-6m sous CBZ/OXC, BH/6m sous VPA",
        "source": "ILAE_2024"
    },
    {
        "id": "BIO_MON_PARKINSON",
        "pathos": [
            "PAT_014"
        ],
        "bio": [
            "BIO_002",
            "BIO_012",
            "BIO_031",
            "BIO_013"
        ],
        "frequence": "PNN/hebdo si clozapine, QTc si dompéridone",
        "source": "DGN_PD_2024"
    },
    {
        "id": "BIO_MON_GOUTTE",
        "pathos": [
            "PAT_024"
        ],
        "bio": [
            "BIO_008",
            "BIO_003",
            "BIO_004"
        ],
        "frequence": "Uricémie/1-3m titration, DFG/6m",
        "source": "EULAR_2023"
    },
    {
        "id": "BIO_MON_OSTEO",
        "pathos": [
            "PAT_025"
        ],
        "bio": [
            "BIO_023",
            "BIO_005",
            "BIO_003"
        ],
        "frequence": "VitD+Ca avant BP, Ca J14-28 post-dénosumab",
        "source": "IOF_2024"
    },
    {
        "id": "BIO_MON_CANCER",
        "pathos": [
            "PAT_020"
        ],
        "bio": [
            "BIO_012",
            "BIO_010",
            "BIO_009",
            "BIO_019",
            "BIO_034",
            "BIO_035"
        ],
        "frequence": "NFS pré-cure, TSH si immunothérapie",
        "source": "ESMO_2024"
    },
    {
        "id": "BIO_MON_DYSLIP",
        "pathos": [
            "PAT_019"
        ],
        "bio": [
            "BIO_027",
            "BIO_018",
            "BIO_013"
        ],
        "frequence": "LDL/6-8sem, CPK si myalgies",
        "source": "ESC_DYSLIP_2019"
    },
    {
        "id": "BIO_MON_AOMI",
        "pathos": [
            "PAT_007"
        ],
        "bio": [
            "BIO_027",
            "BIO_009",
            "BIO_003",
            "BIO_026"
        ],
        "frequence": "LDL/annuel, Hb/6m si antithrombotique",
        "source": "ESC_PAD_2024"
    }
];


// ═══════════════════════════════════════════════════════════════════════════════
// 5. FONCTIONS D'INTÉGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enrichit une alerte GeriaEngineV2 avec les données du REFERENTIEL_CSV_DB.
 * Ajoute les colonnes Beers, FORTA, PRISCUS, STOPPFrail, nb_sources.
 */
// enrichAlertWithCSV supprimé : fonction jamais appelée (0 références)
// L'enrichissement multi-sources est assuré par renderAlertesEviterEnriched() + PIM_DICT

// getRelevantRulesForPathos supprimé : fonction jamais appelée (0 références)
// GeriaEngineV2.evaluer() scanne directement toutes les règles EVITER/INITIER

/**
 * Pour une liste de pathologies actives, retourne les BIO à surveiller
 * avec fréquences et sources.
 */
function getRequiredBioMonitoring(activePathoList) {
    let bioMap = {}; // BIO_xxx → { frequences: [], sources: [], pathos: [] }
    
    PATHO_BIO_MONITOR.forEach(rule => {
        const relevant = rule.pathos.some(p => activePathoList.includes(p));
        if (!relevant) return;
        
        rule.bio.forEach(bioId => {
            if (!bioMap[bioId]) bioMap[bioId] = { frequences: [], sources: [], pathos: [] };
            bioMap[bioId].frequences.push(rule.frequence);
            bioMap[bioId].sources.push(rule.source);
            rule.pathos.filter(p => activePathoList.includes(p)).forEach(p => {
                if (!bioMap[bioId].pathos.includes(p)) bioMap[bioId].pathos.push(p);
            });
        });
    });
    
    // Dédupliquer et prendre la fréquence la plus stricte
    return bioMap;
}

/**
 * Applique l'intégration complète :
 * 1. Fusionne PATHOLOGY_RULES_V2_ENRICHMENT dans PATHOLOGY_RULES_DB (si disponible)
 * 2. Log les stats d'intégration
 */
function applyFullIntegration() {
    // Fusionner RECOS_SUPPLEMENT_INTEGRATION dans RECOS_SUPPLEMENT (source unique)
    if (typeof RECOS_SUPPLEMENT !== 'undefined' && typeof RECOS_SUPPLEMENT_INTEGRATION !== 'undefined') {
        const existingIds = new Set(RECOS_SUPPLEMENT.map(r => r.id));
        RECOS_SUPPLEMENT_INTEGRATION.forEach(r => {
            if (!existingIds.has(r.id)) RECOS_SUPPLEMENT.push(r);
        });
    }

    const suppCount = typeof RECOS_SUPPLEMENT !== 'undefined' ? RECOS_SUPPLEMENT.length : 0;
    const bioCount = PATHO_BIO_MONITOR.length;
    const pathoCount = typeof PATHOLOGY_RULES_DB !== 'undefined' ? Object.keys(PATHOLOGY_RULES_DB).length : 0;
    console.log(`[INTEGRATION] Module chargé : ${suppCount} règles RECOS_SUPPLEMENT, ${bioCount} protocoles BIO_MONITOR, ${pathoCount} pathologies EBM`);
    return { suppCount, bioCount, pathoCount };
}
