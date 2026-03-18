// ═══════════════════════════════════════════════════════════════════════════════
// 📋 PATHOLOGY_RULES_V2_ENRICHMENT — Enrichissement complet toutes pathologies
// ═══════════════════════════════════════════════════════════════════════════════
// Version : 2.1 — Mars 2026
// Instruction : Fusionner ces entrées dans PATHOLOGY_RULES_DB (remplace les entrées existantes)
//               + Fusionner PATHO_MED_INTERDITS_V2 et PATHO_SYNDROME_MAP_V2
// ═══════════════════════════════════════════════════════════════════════════════

const PATHOLOGY_RULES_V2_ENRICHMENT = {

    // ═══════════════════════════════════════════════════════════
    // PAT_007 — AOMI (enrichi ESC 2024 PAD)
    // ═══════════════════════════════════════════════════════════

    "PAT_007": {
        ID: "PAT_007",
        NOM: "Artériopathie Oblitérante (AOMI)",
        REFERENCE: "ESC 2024 PAAD | COMPASS | VOYAGER-PAD | EUCLID",

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

    // ═══════════════════════════════════════════════════════════
    // PAT_008 — AVC/AIT (enrichi ESO 2024 + ESC 2024)
    // ═══════════════════════════════════════════════════════════

    "PAT_008": {
        ID: "PAT_008",
        NOM: "Accident Vasculaire Cérébral (AVC/AIT)",
        REFERENCE: "ESO 2024 | AHA/ASA 2024 | ESC 2024 AF | CHANCE | POINT | THALES | SPARCL",

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

    // ═══════════════════════════════════════════════════════════
    // PAT_009 — Hypotension Orthostatique (enrichi)
    // ═══════════════════════════════════════════════════════════

    "PAT_009": {
        ID: "PAT_009",
        NOM: "Hypotension Orthostatique",
        REFERENCE: "ESC 2018 Syncope | Consensus gériatrique 2023 | STOPP/START v3",

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

    // ═══════════════════════════════════════════════════════════
    // PAT_010 — Syndrome Démentiel (enrichi — surveillance IAChE)
    // ═══════════════════════════════════════════════════════════

    "PAT_010": {
        ID: "PAT_010",
        NOM: "Syndrome Démentiel (Générique)",
        REFERENCE: "EAN/EFNS 2023 | Beers 2023 | STOPP/START v3",

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

    // ═══════════════════════════════════════════════════════════
    // PAT_011 — Alzheimer (enrichi)
    // ═══════════════════════════════════════════════════════════

    "PAT_011": {
        ID: "PAT_011",
        NOM: "Maladie d'Alzheimer",
        REFERENCE: "EAN 2023 | NIA-AA 2024 | HAS 2024",
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

    // ═══════════════════════════════════════════════════════════
    // PAT_014 — Parkinson (enrichi MDS 2024 + DGN 2024)
    // ═══════════════════════════════════════════════════════════

    "PAT_014": {
        ID: "PAT_014",
        NOM: "Maladie de Parkinson",
        REFERENCE: "MDS EBM 2025 | DGN/EAN 2024 | NICE 2024",

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

    // ═══════════════════════════════════════════════════════════
    // PAT_017 — Hypothyroïdie (enrichi — titration complète)
    // ═══════════════════════════════════════════════════════════

    "PAT_017": {
        ID: "PAT_017",
        NOM: "Hypothyroïdie",
        REFERENCE: "ETA 2023 | ATA 2024 | TRUST trial",
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

    // ═══════════════════════════════════════════════════════════
    // PAT_018 — Hyperthyroïdie (enrichi)
    // ═══════════════════════════════════════════════════════════

    "PAT_018": {
        ID: "PAT_018",
        NOM: "Hyperthyroïdie",
        REFERENCE: "ETA 2023 | ATA | ESC 2024 (FA)",
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

    // ═══════════════════════════════════════════════════════════
    // PAT_019 — Dyslipidémie (enrichi — décompensation)
    // ═══════════════════════════════════════════════════════════

    "PAT_019": {
        ID: "PAT_019",
        NOM: "Dyslipidémie",
        REFERENCE: "ESC 2024 Dyslipidaemia | ESC 2021 CVD Prevention",
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

    // ═══════════════════════════════════════════════════════════
    // PAT_020 — Cancer (enrichi — toxicités détaillées)
    // ═══════════════════════════════════════════════════════════

    "PAT_020": {
        ID: "PAT_020",
        NOM: "Cancer / Tumeur solide",
        REFERENCE: "ESMO 2024 | ASCO 2024 | MASCC | ESC Cardio-Onco 2022",
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

    // ═══════════════════════════════════════════════════════════
    // PAT_021 — UGD (enrichi — décompensation)
    // ═══════════════════════════════════════════════════════════

    "PAT_021": {
        ID: "PAT_021",
        NOM: "Ulcère Gastro-Duodénal (UGD)",
        REFERENCE: "ESGE 2024 | HAS | ACG 2024",
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

    // ═══════════════════════════════════════════════════════════
    // PAT_022 — Asthme (enrichi)
    // ═══════════════════════════════════════════════════════════

    "PAT_022": {
        ID: "PAT_022",
        NOM: "Asthme",
        REFERENCE: "GINA 2024",
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

    // ═══════════════════════════════════════════════════════════
    // PAT_023 — BPCO (enrichi)
    // ═══════════════════════════════════════════════════════════

    "PAT_023": {
        ID: "PAT_023",
        NOM: "BPCO",
        REFERENCE: "GOLD 2024",
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

    // ═══════════════════════════════════════════════════════════
    // PAT_026 — Infection Urinaire (enrichi)
    // ═══════════════════════════════════════════════════════════

    "PAT_026": {
        ID: "PAT_026",
        NOM: "Infection Urinaire",
        REFERENCE: "SPILF 2024 | IDSA 2024 | HAS",
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

    // ═══════════════════════════════════════════════════════════
    // PAT_030 — Soins Palliatifs (enrichi)
    // ═══════════════════════════════════════════════════════════

    "PAT_030": {
        ID: "PAT_030",
        NOM: "Soins Palliatifs",
        REFERENCE: "SFAP 2024 | EAPC 2023 | NICE End of Life 2024",
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
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 PATHO_MED_INTERDITS V2 — Enrichi avec toutes les pathologies
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 Fonction de fusion : applique les enrichissements au PATHOLOGY_RULES_DB
// ═══════════════════════════════════════════════════════════════════════════════

function applyV2Enrichments() {
    // Fusionner les pathologies enrichies
    for (const [patId, patData] of Object.entries(PATHOLOGY_RULES_V2_ENRICHMENT)) {
        PATHOLOGY_RULES_DB[patId] = patData;
    }

    // Fusionner les médicaments interdits additionnels
    for (const [patId, rules] of Object.entries(PATHO_MED_INTERDITS_V2_ADDITIONS)) {
        if (!PATHO_MED_INTERDITS[patId]) PATHO_MED_INTERDITS[patId] = [];
        rules.forEach(r => {
            // Éviter les doublons
            if (!PATHO_MED_INTERDITS[patId].some(existing => existing.terme === r.terme)) {
                PATHO_MED_INTERDITS[patId].push(r);
            }
        });
    }

    console.log("✅ V2 Enrichments applied: " + Object.keys(PATHOLOGY_RULES_V2_ENRICHMENT).length + " pathologies enriched.");
}
