// ═══════════════════════════════════════════════════════════════════════════════
// bio_linkage.js — Maillage complet BIO ↔ Médicaments ↔ Pathologies
// ═══════════════════════════════════════════════════════════════════════════════
// Version : 1.0 — Mars 2026
// But     : Relier chaque paramètre biologique (BIO_001..039) aux médicaments
//           (SUIVI_BIOLOGIQUE_DB) et aux pathologies (PATHOLOGY_RULES_DB)
// Sources : RCP officiels, Vidal, Martindale, STOPP/START v3, Beers 2023
// ═══════════════════════════════════════════════════════════════════════════════

// ============================================================================
// 1. TABLE DE MAPPING : texte libre → codes BIO_xxx
//    Utilisé pour parser les champs bilan_initial / suivi_periodique / alerte
// ============================================================================
// Note: suivi_data.js a des accents manquants (ex: "Cratinine" au lieu de "Créatinine")
// Les patterns utilisent [eéèa]? pour matcher les deux formes
const BIO_TEXT_MAPPING = [
    // Rénal
    { pattern: /cr[eéèa]a?tinin/i,                    codes: ["BIO_003"] },
    { pattern: /DFG|clairance|fonction r[eéè]?nal/i,  codes: ["BIO_004"] },
    // Ionogramme
    { pattern: /ionogramme/i,                          codes: ["BIO_001", "BIO_002", "BIO_005"] },
    { pattern: /kali[eéè]?mi/i,                       codes: ["BIO_001"] },
    { pattern: /natr[eéè]?mi|hyponatr/i,              codes: ["BIO_002"] },
    { pattern: /calc[eéè]?mi|hypocalc/i,              codes: ["BIO_005"] },
    { pattern: /magn[eéè]?s[eéè]?mi|hypomag/i,        codes: ["BIO_006"] },
    { pattern: /ur[eéè]?[eé]?mi|ur[eéè]?e\b/i,       codes: ["BIO_007"] },
    { pattern: /uric[eéè]?mi|acide urique|hyperuric/i, codes: ["BIO_008"] },
    // Hémato
    { pattern: /NFS|h[eéè]?mogramme|num[eéè]?ration/i, codes: ["BIO_009", "BIO_010", "BIO_011"] },
    { pattern: /h[eéè]?moglobine|\bHb\b|\bHb\/Ht/i,   codes: ["BIO_009"] },
    { pattern: /plaquettes|thrombop[eéè]?ni/i,         codes: ["BIO_010"] },
    { pattern: /leucocyte|GB\b|leucop[eéè]?ni/i,      codes: ["BIO_011"] },
    { pattern: /PNN|neutro|agranulocytos/i,            codes: ["BIO_012"] },
    { pattern: /r[eéè]?ticulocyte/i,                   codes: ["BIO_038"] },
    { pattern: /VGM|volume globulaire/i,               codes: ["BIO_039"] },
    // Hépatique
    { pattern: /bilan h[eéè]?patique|transaminase/i,   codes: ["BIO_013", "BIO_014"] },
    { pattern: /ASAT|AST\b/i,                          codes: ["BIO_013"] },
    { pattern: /ALAT|ALT\b/i,                          codes: ["BIO_014"] },
    { pattern: /GGT|gamma.?GT/i,                       codes: ["BIO_015"] },
    { pattern: /PAL|phosphatases alcalines/i,           codes: ["BIO_016"] },
    { pattern: /bilirubine|bili\b|ict[eèé]?r/i,        codes: ["BIO_017"] },
    // Musculaire
    { pattern: /CPK|cr[eéè]?atine kinase|CK\b|rhabdomyolys/i, codes: ["BIO_018"] },
    // Thyroïde
    { pattern: /TSH|thyro[ïi]?d/i,                     codes: ["BIO_019"] },
    // Martial
    { pattern: /ferritine|bilan martial/i,             codes: ["BIO_020"] },
    // Vitamines
    { pattern: /vitamine B12|cobalamine|B12\b/i,       codes: ["BIO_021"] },
    { pattern: /vitamine B9|folate|acide folique/i,    codes: ["BIO_022"] },
    { pattern: /vitamine D|25.?OH/i,                   codes: ["BIO_023"] },
    // Inflammation
    { pattern: /CRP|prot[eéè]?ine C/i,                codes: ["BIO_024"] },
    // Glycémie
    { pattern: /glyc[eéè]?mi/i,                       codes: ["BIO_025"] },
    { pattern: /HbA1c|h[eéè]?moglobine glyqu/i,       codes: ["BIO_026"] },
    // Lipides
    { pattern: /bilan lipidique|cholest[eéè]?rol|LDL|triglyc[eéè]?ride/i, codes: ["BIO_027"] },
    // Cardiaque
    { pattern: /NT.?proBNP|BNP\b/i,                   codes: ["BIO_028"] },
    // Lithium
    { pattern: /lithi[eéè]?mi|lithium/i,              codes: ["BIO_029"] },
    // Coagulation
    { pattern: /\bINR\b|AVK|coagulation/i,            codes: ["BIO_030"] },
    // ECG
    { pattern: /QTc|espace QT|allongement QT/i,       codes: ["BIO_031"] },
    // Infection
    { pattern: /procalcitonine|PCT\b/i,               codes: ["BIO_032"] },
    { pattern: /D.?dim[eèé]?r/i,                      codes: ["BIO_033"] },
    // Cardiaque biomarqueurs
    { pattern: /troponine|TnI|TnT/i,                  codes: ["BIO_034"] },
    // Nutrition
    { pattern: /albumine|albumin[eéè]?mi/i,           codes: ["BIO_035"] },
    // Pancréas
    { pattern: /lipase|amylase|pancr[eéè]?at/i,       codes: ["BIO_036"] },
    // Métabolique
    { pattern: /lactat[eéè]?mi|lactate|acide lactique/i, codes: ["BIO_037"] },
    // Phosphatémie (pas de BIO dédié, mais calcémie souvent associée)
    { pattern: /phosphat[eéè]?mi/i,                    codes: ["BIO_005"] }
];

// ============================================================================
// 2. ENRICHISSEMENT SUIVI_BIOLOGIQUE_DB → ajout champ bio_codes[]
// ============================================================================
function extractBioCodes(text) {
    if (!text) return [];
    var codes = new Set();
    BIO_TEXT_MAPPING.forEach(function(m) {
        if (m.pattern.test(text)) {
            m.codes.forEach(function(c) { codes.add(c); });
        }
    });
    return Array.from(codes);
}

function enrichSuiviBioCodes() {
    if (typeof SUIVI_BIOLOGIQUE_DB === 'undefined') return 0;
    var count = 0;
    SUIVI_BIOLOGIQUE_DB.forEach(function(s) {
        var allText = (s.bilan_initial || '') + ' | ' + (s.suivi_periodique || '') + ' | ' + (s.alerte_clinique_biologique || '');
        var codes = extractBioCodes(allText);
        if (codes.length > 0) {
            s.bio_codes = codes;
            count++;
        }
    });
    return count;
}

// ============================================================================
// 3. ENRICHISSEMENT PATHOLOGY_RULES_DB — BIO orphelins + faibles
//    Ajout de SURVEILLANCE_BIO pour les 8 orphelins + renfort des 3 faibles
// ============================================================================
const PATHOLOGY_BIO_ENRICHMENT = {

    // ── BIO_007 (Urée) — lier à IRC/MRC ──
    "PAT_017": {
        bio_additions: ["BIO_007"],
        regles_additions: [{
            bio: "BIO_007", nom: "Urée",
            seuils: {
                normal: { max: 7.5, unite: "mmol/L" },
                alerte: { min: 15, action: "Rechercher déshydratation, insuffisance rénale aiguë, hémorragie digestive haute" },
                critique: { min: 25, action: "Urgence — ratio urée/créatinine pour orienter étiologie" }
            },
            frequence: "Avec créatinine à chaque contrôle rénal",
            note: "Complémentaire au DFG — ratio urée/créat aide à distinguer IRA fonctionnelle vs organique"
        }]
    },

    // ── BIO_015 (GGT) + BIO_017 (Bilirubine) — lier à hépatopathies + médicaments hépatotoxiques ──
    "PAT_025": {
        bio_additions: ["BIO_015", "BIO_017"],
        regles_additions: [
            {
                bio: "BIO_015", nom: "GGT",
                seuils: {
                    normal: { max: 55, unite: "UI/L", note: "Variable selon sexe et âge" },
                    alerte: { min: 165, note: "> 3N — cholestase ou hépatotoxicité médicamenteuse" },
                    critique: { min: 550, note: "> 10N — cholestase obstructive, hépatite alcoolique sévère" }
                },
                frequence: "Avec bilan hépatique complet (ASAT/ALAT/PAL/Bili)",
                note: "Inducteur enzymatique — faux positifs sous phénobarbital, phénytoïne, rifampicine"
            },
            {
                bio: "BIO_017", nom: "Bilirubine totale",
                seuils: {
                    normal: { max: 17, unite: "µmol/L" },
                    alerte: { min: 34, action: "Bilan hépatique complet + échographie" },
                    critique: { min: 85, action: "Arrêt immédiat du médicament suspect, hospitalisation" }
                },
                frequence: "Avec bilan hépatique si traitement hépatotoxique",
                note: "Loi de Hy : ALAT > 3N + Bilirubine > 2N sans PAL = risque hépatite fulminante"
            }
        ]
    },

    // ── BIO_029 (Lithiémie) — CRITIQUE — lier au trouble bipolaire ──
    "PAT_015": {
        bio_additions: ["BIO_029"],
        regles_additions: [{
            bio: "BIO_029", nom: "Lithiémie",
            seuils: {
                therapeutique: { min: 0.6, max: 0.8, unite: "mEq/L", note: "Cible gériatrique 0.4-0.8 (AGS Beers 2023)" },
                alerte: { min: 1.0, action: "Réduire dose, contrôle 48h, rechercher interaction (AINS, IEC, diurétiques)" },
                toxique: { min: 1.5, action: "URGENCE — arrêt lithium, hydratation IV, hémodialyse si > 2.5" }
            },
            frequence: "Résiduelle (12h post-dose) — J5 puis hebdomadaire M1, puis mensuel M3, puis trimestriel",
            interactions_bio: ["BIO_003", "BIO_004", "BIO_001", "BIO_002", "BIO_019"],
            note: "Contrôle TSH/créatinine/ionogramme à chaque dosage. Marge thérapeutique très étroite chez le sujet âgé."
        }]
    },

    // ── BIO_033 (D-Dimères) — lier à MTEV/anticoagulation ──
    "PAT_006": {
        bio_additions: ["BIO_033"],
        regles_additions: [{
            bio: "BIO_033", nom: "D-Dimères",
            seuils: {
                normal_age_adapte: { formule: "seuil = âge × 10 µg/L si > 50 ans", note: "Seuil ajusté à l'âge (étude ADJUST-PE)" },
                positif: { note: "Faible spécificité chez le sujet âgé — ne confirme PAS le diagnostic, mais exclut si négatif" }
            },
            frequence: "Au diagnostic uniquement — pas de suivi sous anticoagulant",
            note: "Utile pour EXCLURE MTEV. Inutile en suivi. Faux positifs : infection, cancer, chirurgie récente, FA."
        }]
    },

    // ── BIO_037 (Lactatémie) — CRITIQUE — lier au diabète + metformine ──
    "PAT_016": {
        bio_additions: ["BIO_037"],
        regles_additions: [{
            bio: "BIO_037", nom: "Lactatémie",
            seuils: {
                normal: { max: 2.0, unite: "mmol/L" },
                alerte: { min: 4.0, action: "Suspendre metformine, hydratation, rechercher cause (sepsis, choc, hypoxie)" },
                critique: { min: 5.0, action: "URGENCE — acidose lactique (MALA). Arrêt metformine + hémodialyse si pH < 7.1" }
            },
            frequence: "Non systématique — doser si : nausées + asthénie + douleurs musculaires sous metformine, DFG < 30, sepsis",
            conditions_dosage: [
                "DFG < 30 mL/min sous metformine",
                "Chirurgie ou produit de contraste iodé",
                "Sepsis ou état de choc",
                "Insuffisance hépatique aiguë"
            ],
            note: "Acidose lactique associée à la metformine (MALA) : rare mais mortalité 50%. Risque majoré si IRC, insuffisance hépatique, alcool."
        }]
    },

    // ── BIO_038 (Réticulocytes) + BIO_039 (VGM) — lier à l'anémie ──
    "PAT_026": {
        bio_additions: ["BIO_038", "BIO_039"],
        regles_additions: [
            {
                bio: "BIO_038", nom: "Réticulocytes",
                seuils: {
                    regenerative: { min: 120, unite: "×10⁹/L", note: "Anémie régénérative — hémolyse, hémorragie" },
                    aregenerative: { max: 50, note: "Anémie arégénérative — carence, inflammation, insuffisance médullaire" }
                },
                frequence: "Avec NFS si anémie confirmée (Hb < 12 F / < 13 H)",
                note: "Indispensable pour classifier l'anémie. Réponse attendue J7-J10 après supplémentation fer/B12."
            },
            {
                bio: "BIO_039", nom: "VGM",
                seuils: {
                    microcytaire: { max: 80, unite: "fL", action: "Rechercher carence martiale (BIO_020), thalassémie, inflammation chronique" },
                    normocytaire: { min: 80, max: 100, note: "IRC, inflammation, hémorragie aiguë, mixte" },
                    macrocytaire: { min: 100, action: "Rechercher carence B12 (BIO_021), B9 (BIO_022), hypothyroïdie (BIO_019), éthylisme, médicaments" }
                },
                frequence: "Avec chaque NFS",
                medicaments_causals: ["Methotrexate", "Hydroxycarbamide", "Valproate", "Zidovudine", "Trimethoprime"],
                note: "Macrocytose médicamenteuse fréquente chez le sujet âgé polymédiqué. VGM > 100 + carence B12 = rechercher neuropathie."
            }
        ]
    },

    // ── BIO_032 (Procalcitonine) — renforcer lien infections ──
    "PAT_024": {
        bio_additions: ["BIO_032"],
        regles_additions: [{
            bio: "BIO_032", nom: "Procalcitonine (PCT)",
            seuils: {
                normal: { max: 0.1, unite: "ng/mL" },
                infection_possible: { min: 0.25, action: "Infection bactérienne probable — initier antibiothérapie" },
                infection_severe: { min: 2.0, action: "Sepsis probable — bilan complet, hémocultures, antibiothérapie urgente" },
                choc_septique: { min: 10.0, action: "Choc septique — réanimation" }
            },
            frequence: "Au diagnostic + J3 pour guider la durée de l'antibiothérapie",
            note: "Supérieure à la CRP pour distinguer infection bactérienne vs virale. Décroissance de 50%/48h attendue sous traitement efficace."
        }]
    },

    // ── Renfort BIO_006 (Magnésémie) — diurétiques, IPP, digoxine ──
    "PAT_001": {
        bio_additions: ["BIO_006"],
        regles_additions: [{
            bio: "BIO_006", nom: "Magnésémie",
            seuils: {
                bas: { max: 0.7, unite: "mmol/L", action: "Supplémenter Mg, rechercher cause (diurétiques, IPP, alcool)" },
                critique_bas: { max: 0.5, action: "Mg IV, risque arythmie — associer au contrôle kaliémie (hypokaliémie réfractaire si Mg bas)" }
            },
            frequence: "Avec ionogramme si diurétique de l'anse ou IPP au long cours",
            note: "Hypomagnésémie aggrave l'hypokaliémie et allonge le QTc. Fréquente sous IPP > 1 an (FDA warning)."
        }]
    },

    // ── Renfort BIO_016 (PAL) — compléter le bilan hépatique ──
    "PAT_005": {
        bio_additions: ["BIO_016"],
        regles_additions: [{
            bio: "BIO_016", nom: "Phosphatases Alcalines (PAL)",
            seuils: {
                normal: { max: 120, unite: "UI/L" },
                alerte: { min: 240, action: "Distinguer origine hépatique (GGT élevée) vs osseuse (GGT normale)" },
                critique: { min: 600, action: "Cholestase obstructive probable — échographie urgente" }
            },
            frequence: "Avec bilan hépatique complet si hépatotoxicité suspectée",
            note: "PAL isolément élevée + GGT normale = origine osseuse (Paget, métastases, fracture)."
        }]
    },

    // ── Renfort BIO_022 (Vitamine B9 / Folates) — méthotrexate, antiépileptiques ──
    "PAT_013": {
        bio_additions: ["BIO_022"],
        regles_additions: [{
            bio: "BIO_022", nom: "Vitamine B9 (Folates)",
            seuils: {
                carence: { max: 7, unite: "nmol/L", action: "Supplémentation acide folique 5 mg/j" },
                objectif: { min: 10, note: "Cible thérapeutique > 10 nmol/L" }
            },
            frequence: "Au bilan initial de démence + annuellement si antiépileptique ou méthotrexate",
            medicaments_depleteurs: ["Methotrexate", "Phénytoïne", "Phénobarbital", "Carbamazépine", "Valproate", "Triméthoprime", "Sulfasalazine"],
            note: "Carence B9 = cause réversible de troubles cognitifs. Doser avec B12 systématiquement."
        }]
    }
};

// ============================================================================
// 4. SUIVI BIOLOGIQUE PAR CLASSE MÉDICAMENTEUSE
//    Table de référence : pour chaque classe, quels BIO surveiller
// ============================================================================
const CLASSE_BIO_SURVEILLANCE = {
    // Cardiovasculaire
    "IEC":                    { init: ["BIO_003","BIO_004","BIO_001"], suivi: ["BIO_003","BIO_001"], freq: "J7-J14, M1, puis trimestriel" },
    "ARA2":                   { init: ["BIO_003","BIO_004","BIO_001"], suivi: ["BIO_003","BIO_001"], freq: "J7-J14, M1, puis trimestriel" },
    "Diurétique de l'anse":   { init: ["BIO_001","BIO_002","BIO_003","BIO_006","BIO_008"], suivi: ["BIO_001","BIO_002","BIO_003","BIO_006"], freq: "J3-J7, puis trimestriel" },
    "Diurétique thiazidique":  { init: ["BIO_001","BIO_002","BIO_003","BIO_005","BIO_006","BIO_008","BIO_025"], suivi: ["BIO_001","BIO_002","BIO_003","BIO_025"], freq: "M1, puis annuel" },
    "ARM":                    { init: ["BIO_001","BIO_003","BIO_004"], suivi: ["BIO_001","BIO_003"], freq: "J3-J7, M1, puis trimestriel" },
    "Digitalique":            { init: ["BIO_001","BIO_002","BIO_003","BIO_004","BIO_006"], suivi: ["BIO_001","BIO_003","BIO_006"], freq: "Trimestriel + à chaque modification" },
    "Bêtabloquant":           { init: ["BIO_031","BIO_025"], suivi: ["BIO_025"], freq: "Annuel si diabète" },
    "Inhibiteur calcique":    { init: [], suivi: [], freq: "Pas de biologie systématique" },
    "Antiarythmique classe III": { init: ["BIO_019","BIO_013","BIO_014","BIO_031","BIO_001","BIO_006"], suivi: ["BIO_019","BIO_013","BIO_031"], freq: "TSH/BH semestriel, QTc si symptômes" },

    // Anticoagulants
    "AVK":                    { init: ["BIO_030","BIO_009","BIO_013","BIO_014","BIO_003"], suivi: ["BIO_030","BIO_009"], freq: "INR J3,J6,J8 puis /8-28j stable" },
    "AOD anti-Xa":            { init: ["BIO_003","BIO_004","BIO_009","BIO_013","BIO_014"], suivi: ["BIO_003","BIO_009"], freq: "Créat+NFS annuel, +souvent si DFG<60" },
    "AOD anti-IIa":           { init: ["BIO_003","BIO_004","BIO_009"], suivi: ["BIO_003","BIO_009"], freq: "Créat+NFS annuel" },
    "Antiagrégant":           { init: ["BIO_009","BIO_010","BIO_013"], suivi: ["BIO_009","BIO_010"], freq: "NFS annuelle" },

    // Métabolique
    "Statine":                { init: ["BIO_027","BIO_013","BIO_014","BIO_018","BIO_025"], suivi: ["BIO_027","BIO_018"], freq: "Lipides 6-8sem puis annuel, CPK si myalgies" },
    "IPP":                    { init: ["BIO_006"], suivi: ["BIO_006","BIO_021","BIO_005"], freq: "Mg annuel si >1 an, B12 /2-3 ans" },
    "Antidiabétique oral":    { init: ["BIO_025","BIO_026","BIO_003","BIO_004"], suivi: ["BIO_026","BIO_003"], freq: "HbA1c /3-6 mois" },
    "Metformine":             { init: ["BIO_025","BIO_026","BIO_003","BIO_004","BIO_021","BIO_037"], suivi: ["BIO_026","BIO_003","BIO_021"], freq: "HbA1c /3-6m, Créat annuel, B12 /2ans" },
    "Insuline":               { init: ["BIO_025","BIO_026","BIO_001","BIO_003"], suivi: ["BIO_026","BIO_025","BIO_001"], freq: "HbA1c /3m, glycémie quotidienne" },
    "iSGLT2":                 { init: ["BIO_026","BIO_003","BIO_004","BIO_001"], suivi: ["BIO_026","BIO_003"], freq: "HbA1c /3-6m, Créat semestriel" },
    "Agoniste GLP-1":         { init: ["BIO_026","BIO_003","BIO_036"], suivi: ["BIO_026","BIO_003"], freq: "HbA1c /3-6m, lipase si symptômes" },
    "Sulfamide hypoglycémiant": { init: ["BIO_025","BIO_026","BIO_003","BIO_013"], suivi: ["BIO_026","BIO_025","BIO_003"], freq: "HbA1c /3m, glycémie fréquente" },

    // Anti-goutteux
    "Hypouricémiant":         { init: ["BIO_008","BIO_003","BIO_013","BIO_014"], suivi: ["BIO_008","BIO_003","BIO_013"], freq: "Uricémie /3-6m, BH annuel" },

    // Neuropsychiatrie
    "Antidépresseur ISRS":    { init: ["BIO_002","BIO_013","BIO_014","BIO_031"], suivi: ["BIO_002"], freq: "Natrémie M1 puis annuelle" },
    "Antidépresseur IRSN":    { init: ["BIO_002","BIO_013","BIO_014"], suivi: ["BIO_002"], freq: "Natrémie M1 puis annuelle" },
    "Antidépresseur tricyclique": { init: ["BIO_031","BIO_013","BIO_014","BIO_002"], suivi: ["BIO_031","BIO_002"], freq: "ECG /6-12m, natrémie annuelle" },
    "Antipsychotique":        { init: ["BIO_025","BIO_027","BIO_009","BIO_013","BIO_031","BIO_018"], suivi: ["BIO_025","BIO_027","BIO_031","BIO_009"], freq: "Glycémie+lipides annuel, QTc annuel, NFS annuelle" },
    "Lithium":                { init: ["BIO_029","BIO_019","BIO_003","BIO_004","BIO_001","BIO_002","BIO_005"], suivi: ["BIO_029","BIO_019","BIO_003","BIO_001","BIO_002"], freq: "Lithiémie J5,hebdo M1,mensuel M3, puis trimestriel" },
    "Antiépileptique":        { init: ["BIO_009","BIO_013","BIO_014","BIO_003"], suivi: ["BIO_009","BIO_013","BIO_003"], freq: "NFS+BH annuel" },
    "Benzodiazépine":         { init: ["BIO_013","BIO_014"], suivi: [], freq: "BH annuel si traitement prolongé" },

    // Anti-infectieux
    "Aminoside":              { init: ["BIO_003","BIO_004","BIO_009"], suivi: ["BIO_003","BIO_009"], freq: "Créat quotidienne, pic/résiduel" },
    "Glycopeptide":           { init: ["BIO_003","BIO_004","BIO_009"], suivi: ["BIO_003"], freq: "Résiduel J3, créat quotidienne" },
    "Antituberculeux":        { init: ["BIO_013","BIO_014","BIO_015","BIO_017","BIO_009"], suivi: ["BIO_013","BIO_014"], freq: "BH mensuel × 3 mois puis si symptômes" },

    // Immunosuppresseurs
    "Méthotrexate":           { init: ["BIO_009","BIO_010","BIO_011","BIO_013","BIO_014","BIO_003","BIO_022"], suivi: ["BIO_009","BIO_013","BIO_003","BIO_022"], freq: "NFS+BH mensuel × 3m puis trimestriel" },

    // Bisphosphonates
    "Bisphosphonate":         { init: ["BIO_005","BIO_003","BIO_023"], suivi: ["BIO_005","BIO_003"], freq: "Calcémie annuelle" },

    // Thyroïde
    "Lévothyroxine":          { init: ["BIO_019"], suivi: ["BIO_019"], freq: "TSH à 6-8 sem puis annuelle" },
    "Antithyroïdien":         { init: ["BIO_019","BIO_009","BIO_012","BIO_013"], suivi: ["BIO_019","BIO_009","BIO_012"], freq: "NFS+TSH mensuel × 3m" },

    // Corticoïdes
    "Corticoïde systémique":  { init: ["BIO_025","BIO_001","BIO_027","BIO_009","BIO_005","BIO_023"], suivi: ["BIO_025","BIO_001","BIO_027","BIO_005"], freq: "Glycémie semestrielle, iono+lipides annuel" },

    // Opioïdes
    "Opioïde":                { init: ["BIO_003","BIO_004","BIO_013","BIO_014"], suivi: ["BIO_003"], freq: "Créat annuelle" },

    // AINS
    "AINS":                   { init: ["BIO_003","BIO_004","BIO_001","BIO_009","BIO_013"], suivi: ["BIO_003","BIO_009"], freq: "Créat+NFS si traitement > 5 jours" },

    // Anticholinergiques urinaires
    "Anticholinergique urinaire": { init: ["BIO_003","BIO_031"], suivi: ["BIO_003"], freq: "Créat annuelle, QTc si facteur de risque" },

    // Antiparkinsoniens
    "Antiparkinsonien dopaminergique": { init: ["BIO_013","BIO_014","BIO_009"], suivi: ["BIO_013"], freq: "BH semestriel si iCOMT" }
};

// ============================================================================
// 5. FONCTION PRINCIPALE D'ENRICHISSEMENT
// ============================================================================
function applyBioLinkage() {
    var suiviCount = 0, pathoCount = 0, classCount = 0;

    // A. Enrichir SUIVI_BIOLOGIQUE_DB avec bio_codes
    suiviCount = enrichSuiviBioCodes();

    // B. Enrichir PATHOLOGY_RULES_DB avec BIO orphelins/faibles
    if (typeof PATHOLOGY_RULES_DB !== 'undefined') {
        for (var patId in PATHOLOGY_BIO_ENRICHMENT) {
            var enrichment = PATHOLOGY_BIO_ENRICHMENT[patId];
            var pat = PATHOLOGY_RULES_DB[patId];
            if (!pat) continue;

            // Ajouter BIO aux SURVEILLANCE_CIBLE
            if (!pat.BIOLOGIE) pat.BIOLOGIE = { SURVEILLANCE_CIBLE: [], REGLES: [] };
            if (!pat.BIOLOGIE.SURVEILLANCE_CIBLE) pat.BIOLOGIE.SURVEILLANCE_CIBLE = [];
            if (!pat.BIOLOGIE.REGLES) pat.BIOLOGIE.REGLES = [];

            enrichment.bio_additions.forEach(function(bio) {
                if (pat.BIOLOGIE.SURVEILLANCE_CIBLE.indexOf(bio) === -1) {
                    pat.BIOLOGIE.SURVEILLANCE_CIBLE.push(bio);
                    pathoCount++;
                }
            });

            // Ajouter les règles détaillées
            if (enrichment.regles_additions) {
                enrichment.regles_additions.forEach(function(r) {
                    var exists = pat.BIOLOGIE.REGLES.some(function(existing) { return existing.bio === r.bio; });
                    if (!exists) {
                        pat.BIOLOGIE.REGLES.push(r);
                    }
                });
            }
        }
    }

    // C. Enrichir MASTER_DB.MEDICAMENTS avec bio_surveillance basée sur la classe
    if (typeof MASTER_DB !== 'undefined' && MASTER_DB.MEDICAMENTS) {
        MASTER_DB.MEDICAMENTS.forEach(function(m) {
            if (m.bio_surveillance && m.bio_surveillance.length > 0) return;
            var classe = (m.classe || '').toLowerCase();
            for (var classKey in CLASSE_BIO_SURVEILLANCE) {
                if (classe.indexOf(classKey.toLowerCase()) !== -1 || classKey.toLowerCase().indexOf(classe) !== -1) {
                    var mapping = CLASSE_BIO_SURVEILLANCE[classKey];
                    m.bio_surveillance = {
                        init: mapping.init,
                        suivi: mapping.suivi,
                        frequence: mapping.freq
                    };
                    classCount++;
                    break;
                }
            }
        });
    }

    console.log("[BIO_LINKAGE] Suivi: " + suiviCount + " médicaments enrichis avec bio_codes | Patho: " + pathoCount + " BIO ajoutés | Classes: " + classCount + " médicaments mappés");
}
