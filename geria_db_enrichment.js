// ============================================================================
// 💊 MASTER_DB ENRICHISSEMENT — 48 Médicaments Manquants + 7 Bio Règles
// Version 1.0 — Mars 2026
// ============================================================================
// À AJOUTER dans MASTER_DB.MEDICAMENTS (array push) via :
//   MASTER_DB.MEDICAMENTS.push(...MISSING_MEDS_ENRICHMENT);
//
// Sources pharmacologiques :
//   - Thériaque / ANSM RCP
//   - Boustani ACB Scale 2008, Carnahan CIA 2006, Rudolph ARS 2008
//   - DrugBank / Micromedex / UpToDate
//   - CredibleMeds (QTc risk)
// ============================================================================

const MISSING_MEDS_ENRICHMENT = [

    // ========================================================================
    // 🔴 CRITIQUE — Inhibiteurs acétylcholinestérase + Mémantine
    // ========================================================================
    {
        "dci": "Donepezil",
        "princeps": "Aricept",
        "classe": "Inhibiteur acetylcholinesterase (IAChE)",
        "poso_hab": "5-10 mg/j en 1 prise le soir",
        "poso_ger": "Debuter 5 mg/j pendant 4-6 semaines, puis 10 mg/j si tolere",
        "poso_ren": "Pas d'ajustement renal",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1 (passage BHE — action centrale)",
        "albumine": "96%",
        "qt_risque": "(PR) - Bradycardie et allongement PR, pas QTc directement",
        "ddi_interact": "Betabloquants, Digoxine, Diltiazem, Verapamil (bradycardie additive) | Anticholinergiques (antagonisme pharmacologique) | Inhibiteurs CYP3A4/2D6 (augmentation exposition)",
        "suivi_initial": "ECG (FC, PR, QTc) | Poids | Creatinine | Bilan hepatique",
        "suivi_periodique": "FC (chaque consultation) | ECG si bradycardisant co-prescrit | MMSE/MoCA (annuel) | Reevaluation benefice a 6-12 mois",
        "alerte_clinique": "Bradycardie < 50/min → ECG urgent, discuter arret | Syncope → arret et bilan cardiologique | Nausees/diarrhee/anorexie (dose-dependant) | Reevaluer si MMSE < 10 (STOPPFrail)",
        "bio_cible": ["BIO_031", "BIO_003", "BIO_013", "BIO_014"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Rivastigmine",
        "princeps": "Exelon",
        "classe": "Inhibiteur acetylcholinesterase (IAChE - double AChE + BuChE)",
        "poso_hab": "Oral: 3-12 mg/j en 2 prises | Patch: 4.6-9.5-13.3 mg/24h",
        "poso_ger": "Patch prefere (moins d'EI GI). Debuter 4.6 mg/24h, titrer toutes les 4 semaines",
        "poso_ren": "Pas d'ajustement renal (mais prudence si IRC severe — peu de donnees)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1 (passage BHE)",
        "albumine": "40%",
        "qt_risque": "",
        "ddi_interact": "Betabloquants, Digoxine (bradycardie) | Anticholinergiques (antagonisme) | Succinylcholine (prolongation bloc NM)",
        "suivi_initial": "ECG | Poids | NFS | Bilan hepatique",
        "suivi_periodique": "FC | Poids (perte poids sous traitement) | MMSE/MoCA annuel | Surveillance cutanee (patch)",
        "alerte_clinique": "Bradycardie → ECG | Nausees/vomissements (surtout forme orale) | Perte poids significative → reevaluer | Indication specifique MCL et Parkinson-Demence (START)",
        "bio_cible": ["BIO_031", "BIO_003", "BIO_009"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Galantamine",
        "princeps": "Reminyl",
        "classe": "Inhibiteur acetylcholinesterase (IAChE + modulateur nicotinique)",
        "poso_hab": "LP: 8 mg/j → 16 mg/j → 24 mg/j (paliers de 4 semaines)",
        "poso_ger": "Debuter 8 mg/j LP, max 16-24 mg selon tolerance",
        "poso_ren": "DFG 9-59: max 16 mg/j | DFG < 9: contre-indique",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "18%",
        "qt_risque": "",
        "ddi_interact": "Betabloquants, Digoxine (bradycardie) | Anticholinergiques (antagonisme) | Ketoconazole, Paroxetine (inhibiteurs CYP2D6/3A4 — augmentation exposition)",
        "suivi_initial": "ECG | Creatinine/DFG | Bilan hepatique",
        "suivi_periodique": "FC | Creatinine (semestriel) | MMSE/MoCA annuel",
        "alerte_clinique": "Bradycardie → ECG | Adaptation renale obligatoire | Nausees dose-dependantes",
        "bio_cible": ["BIO_031", "BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Memantine",
        "princeps": "Ebixa",
        "classe": "Antagoniste NMDA (anti-Alzheimer)",
        "poso_hab": "5 mg/j → 10 mg/j → 15 mg/j → 20 mg/j (paliers hebdomadaires)",
        "poso_ger": "Debuter 5 mg/j, titration lente. Max 20 mg/j",
        "poso_ren": "DFG 30-49: max 10 mg/j | DFG 5-29: max 10 mg/j (donnees limitees) | DFG < 5: CI",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "45%",
        "qt_risque": "",
        "ddi_interact": "Amantadine (synergie NMDA — EI majores) | Dextromethorphane, Ketamine (interaction NMDA) | Alcalinisants urinaires (diminuent elimination)",
        "suivi_initial": "Creatinine/DFG | MMSE",
        "suivi_periodique": "Creatinine (semestriel) | MMSE/MoCA annuel | Reevaluation benefice a 6-12 mois",
        "alerte_clinique": "Vertiges, cephalees (debut traitement) | STOPP3-D19: CI si epilepsie active | STOPPFrail: reevaluer si demence severe (MMSE < 10)",
        "bio_cible": ["BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },

    // ========================================================================
    // 🔴 CRITIQUE — Antidiabétiques
    // ========================================================================
    {
        "dci": "Gliclazide",
        "princeps": "Diamicron",
        "classe": "Sulfamide hypoglycemiant (demi-vie courte/intermediaire)",
        "poso_hab": "LM: 30-120 mg/j en 1 prise | LI: 40-320 mg/j en 2-3 prises",
        "poso_ger": "LM 30 mg/j, max 60 mg/j. Seul sulfamide acceptable en geriatrie (FORTA-C)",
        "poso_ren": "DFG 30-60: prudence, reduire dose | DFG < 30: CI (preferer iDPP4/iSGLT2)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "94-97%",
        "qt_risque": "",
        "ddi_interact": "Miconazole, Fluconazole (hypoglycemie majeure — CI) | AINS, Sulfamides ATB (deplace liaison albumine) | Betabloquants (masquent symptomes hypo)",
        "suivi_initial": "Glycemie a jeun | HbA1c | Creatinine/DFG | Bilan hepatique",
        "suivi_periodique": "HbA1c (trimestriel) | Glycemie capillaire | Creatinine (semestriel) | Poids",
        "alerte_clinique": "Hypoglycemie (surtout si IRC, denutrition, saut de repas) | Risque moindre que glibenclamide/glimepiride | Assouplir cibles si fragile (HbA1c 7.5-8.5%)",
        "bio_cible": ["BIO_025", "BIO_026", "BIO_003", "BIO_004", "BIO_035"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Glibenclamide",
        "princeps": "Daonil",
        "classe": "Sulfamide hypoglycemiant (longue demi-vie - PIM ABSOLU)",
        "poso_hab": "1.25-15 mg/j en 1-3 prises",
        "poso_ger": "EVITER chez sujet age (Beers ++, PRISCUS PIM, FORTA-D). Si inevitable: 1.25 mg max",
        "poso_ren": "CI si DFG < 30. Deconseille si DFG < 60",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "99%",
        "qt_risque": "",
        "ddi_interact": "Miconazole (CI absolue — hypoglycemie severe) | Fluconazole, AINS, Sulfamides ATB | Betabloquants non selectifs (masquent hypo)",
        "suivi_initial": "Glycemie | HbA1c | Creatinine/DFG | NFS",
        "suivi_periodique": "HbA1c (trimestriel) | Glycemie capillaire frequente | Creatinine (semestriel)",
        "alerte_clinique": "PIM ABSOLU en geriatrie — hypoglycemie prolongee (demi-vie 10-16h, metabolites actifs) | Remplacer par gliclazide LM ou iDPP4 | STOPP3-J1, Beers, PRISCUS, FORTA-D",
        "bio_cible": ["BIO_025", "BIO_026", "BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Glimepiride",
        "princeps": "Amarel",
        "classe": "Sulfamide hypoglycemiant (longue demi-vie - PIM)",
        "poso_hab": "1-6 mg/j en 1 prise",
        "poso_ger": "EVITER chez sujet age (Beers, PRISCUS, FORTA-D). Si inevitable: 1 mg max",
        "poso_ren": "CI si DFG < 30",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "99.5%",
        "qt_risque": "",
        "ddi_interact": "Miconazole, Fluconazole | AINS, Sulfamides ATB | Betabloquants non selectifs",
        "suivi_initial": "Glycemie | HbA1c | Creatinine/DFG",
        "suivi_periodique": "HbA1c trimestriel | Glycemie capillaire | Creatinine semestriel",
        "alerte_clinique": "PIM en geriatrie — hypoglycemie prolongee | Preferer gliclazide LM ou iDPP4 | STOPP3-J1, Beers, PRISCUS, FORTA-D",
        "bio_cible": ["BIO_025", "BIO_026", "BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Pioglitazone",
        "princeps": "Actos",
        "classe": "Thiazolidinedione (glitazone - PIM)",
        "poso_hab": "15-45 mg/j",
        "poso_ger": "EVITER (Beers, PRISCUS, FORTA-D). CI absolue si IC",
        "poso_ren": "Pas d'ajustement renal (mais prudence si retention hydrosodee)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "99%",
        "qt_risque": "",
        "ddi_interact": "Insuline (risque oedeme + hypoglycemie) | Gemfibrozil (augmente exposition x3 — CI)",
        "suivi_initial": "NFS | Bilan hepatique | ECG | Poids | Recherche IC",
        "suivi_periodique": "Bilan hepatique trimestriel | Poids | Signes d'IC | Densitometrie si FdR osteoporose",
        "alerte_clinique": "CI ABSOLUE si IC (toute FEVG) — retention hydrosodee, decompensation | Fractures (femmes ++) | Cancer vesical (controverse) | Beers/PRISCUS/FORTA-D",
        "bio_cible": ["BIO_028", "BIO_013", "BIO_014", "BIO_009", "BIO_025"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Linagliptine",
        "princeps": "Trajenta",
        "classe": "Inhibiteur DPP-4 (gliptine - pas d'ajustement renal)",
        "poso_hab": "5 mg/j en 1 prise",
        "poso_ger": "5 mg/j — aucun ajustement age/renal necessaire (FORTA-A)",
        "poso_ren": "Aucun ajustement quel que soit le DFG (elimination biliaire)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "70-80% (liaison concentration-dependante)",
        "qt_risque": "",
        "ddi_interact": "Rifampicine (diminue efficacite — inducteur P-gp) | Sulfamides, Insuline (risque hypo si association)",
        "suivi_initial": "HbA1c | Glycemie",
        "suivi_periodique": "HbA1c trimestriel",
        "alerte_clinique": "Tres bonne tolerance geriatrique — pas d'ajustement renal (FORTA-A) | Rare: pancreatite, arthralgie | Prefere aux sulfamides si IRC",
        "bio_cible": ["BIO_025", "BIO_026"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Repaglinide",
        "princeps": "Novonorm",
        "classe": "Glinide (secretagogue insuline - demi-vie courte)",
        "poso_hab": "0.5-4 mg avant chaque repas (max 16 mg/j)",
        "poso_ger": "0.5 mg avant repas, titrer lentement",
        "poso_ren": "DFG < 30: debuter 0.5 mg, titrer prudemment",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "98%",
        "qt_risque": "",
        "ddi_interact": "Gemfibrozil + Itraconazole (CI absolue — augmentation majeure exposition) | Clopidogrel (inhibiteur CYP2C8 — x5 exposition) | Ciclosporine",
        "suivi_initial": "Glycemie | HbA1c | Bilan hepatique",
        "suivi_periodique": "HbA1c trimestriel | Glycemie capillaire | Bilan hepatique annuel",
        "alerte_clinique": "PRISCUS PIM-B / EU7-PIM | Hypoglycemie possible mais demi-vie courte (moins que sulfamides) | Prise preprandiale obligatoire | Eviter si repas sautes",
        "bio_cible": ["BIO_025", "BIO_026", "BIO_013", "BIO_014"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Acarbose",
        "princeps": "Glucor",
        "classe": "Inhibiteur alpha-glucosidase (PIM PRISCUS/FORTA-D)",
        "poso_hab": "50-100 mg x3/j au debut des repas",
        "poso_ger": "EVITER (PRISCUS PIM, FORTA-D). Mauvaise tolerance digestive chez l'age",
        "poso_ren": "CI si DFG < 25",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "Faible (action locale intestinale)",
        "qt_risque": "",
        "ddi_interact": "Digoxine (diminution absorption) | Charbon actif (antagonise effet) | Insuline/sulfamides: traiter hypo avec glucose pur (pas sucrose)",
        "suivi_initial": "HbA1c | Bilan hepatique",
        "suivi_periodique": "HbA1c trimestriel | Transaminases si > 6 mois",
        "alerte_clinique": "PRISCUS PIM / FORTA-D — flatulences, diarrhee, mauvaise observance | Si hypo sous association: donner GLUCOSE PUR (le sucrose n'est pas absorbe) | Hepatotoxicite rare",
        "bio_cible": ["BIO_025", "BIO_026", "BIO_013", "BIO_014"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },

    // ========================================================================
    // 🔴 CRITIQUE — Cardiovasculaire
    // ========================================================================
    {
        "dci": "Moxonidine",
        "princeps": "Physiotens",
        "classe": "Antihypertenseur central agoniste I1 (PIM)",
        "poso_hab": "0.2-0.6 mg/j",
        "poso_ger": "EVITER (Beers, PRISCUS, FORTA-D). CI si HFrEF (MOXCON — surmortalite)",
        "poso_ren": "DFG 30-60: max 0.4 mg/j | DFG < 30: max 0.2 mg/j",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "7% (faible liaison)",
        "qt_risque": "",
        "ddi_interact": "Autres antihypertenseurs (hypotension additive) | BZD, Alcool (sedation) | Betabloquants (bradycardie)",
        "suivi_initial": "TA couche/debout | FC | Creatinine/DFG",
        "suivi_periodique": "TA | FC | Creatinine semestriel",
        "alerte_clinique": "PIM absolu geriatrie — sedation, secheresse buccale, hypotension orthostatique | CI ABSOLUE si HFrEF (MOXCON: surmortalite) | Ne pas arreter brutalement (rebond HTA)",
        "bio_cible": ["BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Rilmenidine",
        "princeps": "Hyperium",
        "classe": "Antihypertenseur central agoniste I1 (PIM)",
        "poso_hab": "1-2 mg/j",
        "poso_ger": "EVITER (Beers, PRISCUS, EU7-PIM)",
        "poso_ren": "Prudence si IRC (elimination renale partielle)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "10%",
        "qt_risque": "",
        "ddi_interact": "Autres antihypertenseurs | Sedatifs | Alcool",
        "suivi_initial": "TA couche/debout | FC",
        "suivi_periodique": "TA | Recherche hypotension orthostatique",
        "alerte_clinique": "PIM geriatrie — hypotension orthostatique, somnolence | Ne pas arreter brutalement",
        "bio_cible": ["BIO_003"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Mirabegron",
        "princeps": "Betmiga",
        "classe": "Agoniste beta-3 adrenergique (vessie hyperactive)",
        "poso_hab": "25-50 mg/j",
        "poso_ger": "25 mg/j (debuter), max 50 mg. FORTA-B — alternative preferee aux antimuscariniques",
        "poso_ren": "DFG 15-29: max 25 mg/j | DFG < 15: non recommande",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "71%",
        "qt_risque": "(PR) - Allongement QTc possible a forte dose",
        "ddi_interact": "Digoxine (augmente Cmax +11%) | Substrats CYP2D6 (inhibiteur modere: augmente metoprolol, desipramine) | Warfarine (surveiller INR)",
        "suivi_initial": "TA | FC | Creatinine/DFG | ECG si FdR QTc",
        "suivi_periodique": "TA (mensuel les 3 premiers mois) | Residuel post-mictionnel si HBP",
        "alerte_clinique": "STOPP3-I6: CI si HTA severe ou labile | Alternative FORTA-B aux antimuscariniques (pas de passage BHE, pas d'ACB) | Surveiller TA",
        "bio_cible": ["BIO_003", "BIO_004", "BIO_031"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Denosumab",
        "princeps": "Prolia",
        "classe": "Anti-RANKL (anticorps anti-osteoporotique)",
        "poso_hab": "60 mg SC tous les 6 mois",
        "poso_ger": "60 mg SC /6 mois. FORTA-A. Pas de CI renale (avantage si IRC)",
        "poso_ren": "Aucun ajustement (mais surveiller calcemie ++ si IRC severe)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "N/A (anticorps monoclonal)",
        "qt_risque": "",
        "ddi_interact": "Aucune interaction medicamenteuse significative",
        "suivi_initial": "Calcemie | Vitamine D (corriger avant initiation) | Creatinine/DFG | Bilan dentaire",
        "suivi_periodique": "Calcemie (2 semaines post-injection si IRC) | Vitamine D | Bilan dentaire annuel | DMO (18-24 mois)",
        "alerte_clinique": "⚠️ REBOND FRACTURAIRE A L'ARRET — ne jamais arreter sans relais bisphosphonate | Hypocalcemie (surtout si IRC/carence vit D) | Osteonecroses de la machoire (rare) | Supplementer vit D + Ca systematiquement",
        "bio_cible": ["BIO_005", "BIO_023", "BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Flecainide",
        "princeps": "Flecaine",
        "classe": "Antiarythmique classe Ic",
        "poso_hab": "100-300 mg/j en 2 prises | LP: 200 mg/j",
        "poso_ger": "Debuter 50 mg x2/j, titrer lentement. Max 200 mg/j",
        "poso_ren": "DFG < 35: CI (accumulation). DFG 35-50: reduire dose, dosage plasmatique",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "40%",
        "qt_risque": "(KR) - Elargit QRS (pas QTc directement mais pro-arythmie si cardiopathie)",
        "ddi_interact": "Amiodarone (augmente flecainide x2) | Betabloquants (bradycardie + inotrope negatif) | Ritonavir (CI — augmentation majeure) | CYP2D6 inhibiteurs (paroxetine, fluoxetine)",
        "suivi_initial": "ECG 12D (QRS, PR, QTc) | Creatinine/DFG | Bilan hepatique | Echo cardio (exclure cardiopathie structurelle)",
        "suivi_periodique": "ECG (mensuel les 3 premiers mois, puis semestriel) | Creatinine | Dosage plasmatique si IRC ou association CYP2D6",
        "alerte_clinique": "CI ABSOLUE si cardiopathie structurelle (IC, post-IDM, valvulopathie — CAST: surmortalite) | PRISCUS PIM / PIM-Check | Pro-arythmie si elargissement QRS > 25% | Toujours associer a un betabloquant ou ICa ralentisseur",
        "bio_cible": ["BIO_031", "BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": "",
        "epileptogene": "faible",
        "epileptogene_desc": "Neurotoxicité possible en surdosage"
    },
    {
        "dci": "Ivabradine",
        "princeps": "Procoralan",
        "classe": "Inhibiteur courant If (bradycardisant sinusal pur)",
        "poso_hab": "5-7.5 mg x2/j",
        "poso_ger": "Debuter 2.5 mg x2/j, titrer selon FC. Cible FC repos 50-60/min",
        "poso_ren": "DFG < 15: prudence (peu de donnees)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "70%",
        "qt_risque": "(CR) - Bradycardie sinusale, pas QTc directement",
        "ddi_interact": "Inhibiteurs CYP3A4 puissants (ketoconazole, itraconazole, clarithromycine — CI) | Verapamil, Diltiazem (bradycardie — CI) | Allongeants QTc (prudence)",
        "suivi_initial": "ECG (FC, rythme sinusal confirme) | TA",
        "suivi_periodique": "FC repos (chaque consultation) | ECG semestriel",
        "alerte_clinique": "NE PAS utiliser si FA/flutter (inefficace) | Phosphenes (lumineux) frequents debut | Bradycardie < 50 → reduire | CI: rythme non sinusal, BAV III, IC aigue",
        "bio_cible": ["BIO_031"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Finerenone",
        "princeps": "Kerendia",
        "classe": "Antagoniste selectif RM non-steroidien (MRC + DT2)",
        "poso_hab": "10-20 mg/j en 1 prise",
        "poso_ger": "10 mg/j si K+ ≤ 4.8 et DFG ≥ 25. Titrer a 20 mg si K+ ≤ 4.8",
        "poso_ren": "DFG 25-59: 10 mg/j (titrer si K ok) | DFG < 25: CI (pas de donnees)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "92%",
        "qt_risque": "",
        "ddi_interact": "Inhibiteurs CYP3A4 puissants (CI — augmentation majeure) | Inducteurs CYP3A4 (diminuent efficacite) | IEC/ARA2 + iSGLT2 (hyperkaliemie — surveiller K++)",
        "suivi_initial": "Kaliemie (doit etre ≤ 4.8) | Creatinine/DFG | Bilan hepatique",
        "suivi_periodique": "Kaliemie a M1, M3, puis trimestriel | DFG trimestriel | Transaminases",
        "alerte_clinique": "NE PAS initier si K+ > 5.0 | Arreter si K+ > 5.5 | FIDELIO-DKD/FIGARO-DKD: reduction progression MRC + evenements CV | Complementaire aux IEC/ARA2 et iSGLT2 dans la nephropathie diabetique",
        "bio_cible": ["BIO_001", "BIO_003", "BIO_004", "BIO_013", "BIO_014"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },

    // ========================================================================
    // 🟠 IMPORTANT — SNC
    // ========================================================================
    {
        "dci": "Phenytoine",
        "princeps": "Di-Hydan, Dilantin",
        "classe": "Antiepileptique (bloqueur NaV - PIM ABSOLU)",
        "poso_hab": "200-400 mg/j (cinetique non lineaire !)",
        "poso_ger": "EVITER (Beers, PRISCUS, FORTA-D). Si inevitable: 100 mg, doser phenytoinemie",
        "poso_ren": "Ajuster selon phenytoinemie libre si IRC (liaison albumine diminuee)",
        "acb": 1.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "90% (ATTENTION: cinetique non lineaire — variation albumine change fortement la fraction libre)",
        "qt_risque": "",
        "ddi_interact": "INDUCTEUR PUISSANT CYP (reduit warfarine, AOD, statines, ICa, corticoides, contraceptifs) | Interactions bidirectionnelles nombreuses | Valproate (deplace liaison albumine + inhibe metabolisme)",
        "suivi_initial": "Phenytoinemie | NFS | Bilan hepatique | Calcemie | Vitamine D | Albumine",
        "suivi_periodique": "Phenytoinemie (cible 10-20 µg/mL ou libre 1-2 µg/mL) | NFS | Calcemie/VitD (osteoporose induite) | Bilan hepatique",
        "alerte_clinique": "PIM ABSOLU geriatrie — cinetique non lineaire (petite variation dose = grande variation taux) | Inducteur enzymatique majeur (interactions ++) | Osteoporose, neuropathie, hyperplasie gingivale, acne | Preferer lamotrigine ou levetiracetam",
        "bio_cible": ["BIO_005", "BIO_023", "BIO_009", "BIO_013", "BIO_014", "BIO_035"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": "",
        "epileptogene": "faible",
        "epileptogene_desc": "Antiépileptique paradoxalement pro-convulsivant en surdosage"
    },
    {
        "dci": "Ropinirole",
        "princeps": "Requip",
        "classe": "Agoniste dopaminergique non-ergot (antiparkinsonien)",
        "poso_hab": "LP: 2-24 mg/j | LI: 0.75-24 mg/j en 3 prises",
        "poso_ger": "LP: debuter 2 mg/j, titrer lentement sur 4+ semaines",
        "poso_ren": "DFG < 30: non recommande (peu de donnees)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "40%",
        "qt_risque": "",
        "ddi_interact": "Ciprofloxacine (inhibiteur CYP1A2 — augmente exposition) | Antipsychotiques (antagonisme dopaminergique) | Hormones de substitution estrogenes (augmentation exposition)",
        "suivi_initial": "TA couche/debout | Somnolence",
        "suivi_periodique": "TA | Somnolence diurne (conduite) | Troubles du controle des impulsions (jeu, achats, hypersexualite) | Dyskiniesies",
        "alerte_clinique": "START — Parkinson avec handicap fonctionnel | Hypotension orthostatique (surtout debut) | Somnolence subite (conduite) | Troubles controle impulsions (rechercher activement) | Syndrome de sevrage si arret brutal",
        "bio_cible": ["BIO_003"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Rotigotine",
        "princeps": "Neupro",
        "classe": "Agoniste dopaminergique non-ergot (patch transdermique)",
        "poso_hab": "Patch 2-16 mg/24h (Parkinson) | 1-3 mg/24h (SJSR)",
        "poso_ger": "Debuter 2 mg/24h, titrer par paliers de 2 mg/semaine",
        "poso_ren": "Pas d'ajustement (mais prudence si dialyse)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "92%",
        "qt_risque": "",
        "ddi_interact": "Antipsychotiques (antagonisme) | Metoclopramide (antagonisme D2)",
        "suivi_initial": "TA couche/debout | Poids | Etat cutane",
        "suivi_periodique": "TA | Somnolence | Troubles controle impulsions | Site d'application (rotation, reactions cutanees)",
        "alerte_clinique": "START — Parkinson | Avantage du patch: liberation continue, moins de fluctuations | Reactions cutanees au site d'application (rotation obligatoire) | Troubles controle impulsions",
        "bio_cible": ["BIO_003"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Piribedil",
        "princeps": "Trivastal",
        "classe": "Agoniste dopaminergique non-ergot (D2/D3)",
        "poso_hab": "150-250 mg/j en 3 prises (apres repas)",
        "poso_ger": "Debuter 50 mg/j, titrer par 50 mg/semaine",
        "poso_ren": "Prudence si IRC severe",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "Donnees limitees",
        "qt_risque": "(CR) - QTc rapporté à forte dose",
        "ddi_interact": "Antipsychotiques (antagonisme) | Tetrabenazine (antagonisme)",
        "suivi_initial": "TA couche/debout",
        "suivi_periodique": "TA | Somnolence | Troubles controle impulsions",
        "alerte_clinique": "START — Parkinson | Nausees frequentes (prendre au milieu du repas) | Somnolence | Troubles controle impulsions | Molecule specificiquement francaise",
        "bio_cible": ["BIO_003"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": "",
        "epileptogene": "faible",
        "epileptogene_desc": "Agoniste dopaminergique — risque faible"
    },
    {
        "dci": "Rasagiline",
        "princeps": "Azilect",
        "classe": "IMAO-B selectif irreversible (antiparkinsonien)",
        "poso_hab": "1 mg/j en 1 prise",
        "poso_ger": "1 mg/j — pas de titration necessaire",
        "poso_ren": "Pas d'ajustement renal",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "60-70%",
        "qt_risque": "",
        "ddi_interact": "Antidepresseurs serotoninergiques (ISRS, IRSN, tricycliques — risque syndrome serotoninergique, delai 14j) | Tramadol, Pethidine (CI) | Ciprofloxacine (inhibiteur CYP1A2)",
        "suivi_initial": "Bilan hepatique | Liste medicaments co-prescrits (interactions ++)",
        "suivi_periodique": "Bilan hepatique annuel | Surveillance interactions",
        "alerte_clinique": "Bien tolere en geriatrie | CI avec tramadol, pethidine, dextromethorphane | Delai 14j avant introduction ISRS/IRSN apres arret | Tyramine: interaction dietetique negligeable avec IMAO-B selectif",
        "bio_cible": ["BIO_013", "BIO_014"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Safinamide",
        "princeps": "Xadago",
        "classe": "IMAO-B selectif reversible + antiglutamate (antiparkinsonien)",
        "poso_hab": "50-100 mg/j en 1 prise",
        "poso_ger": "Debuter 50 mg/j, augmenter a 100 mg/j apres 2 semaines si necessaire",
        "poso_ren": "DFG < 30: non recommande (peu de donnees)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "88-90%",
        "qt_risque": "",
        "ddi_interact": "ISRS, IRSN (syndrome serotoninergique — CI) | Pethidine, Tramadol (CI) | Substrats BCRP (rosuvastatine — augmentation exposition)",
        "suivi_initial": "Bilan hepatique | Examen ophtalmologique (retine)",
        "suivi_periodique": "Bilan hepatique semestriel | Examen ophtalmologique annuel (maculopathie rare) | Dyskiniesies (ajuster L-DOPA si besoin)",
        "alerte_clinique": "Adjuvant a la L-DOPA dans Parkinson avec fluctuations motrices | Double mecanisme IMAO-B + antiglutamate | CI si insuffisance hepatique severe | Surveiller oeil (degenerescence maculaire)",
        "bio_cible": ["BIO_013", "BIO_014", "BIO_003"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Opicapone",
        "princeps": "Ongentys",
        "classe": "Inhibiteur COMT peripherique (antiparkinsonien)",
        "poso_hab": "50 mg/j en 1 prise au coucher",
        "poso_ger": "50 mg/j — pas de titration. Prendre ≥1h avant/apres L-DOPA",
        "poso_ren": "Pas d'ajustement renal",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0 (action peripherique uniquement)",
        "albumine": "99.9% (tres forte liaison)",
        "qt_risque": "",
        "ddi_interact": "IMAO non selectifs (CI) | Antidepresseurs (prudence avec ISRS/IRSN) | Warfarine (surveiller INR — inhibe CYP2C9 in vitro) | Fer oral (chelation — espacement 1h)",
        "suivi_initial": "Bilan hepatique",
        "suivi_periodique": "Bilan hepatique (M3, M6, puis annuel) | Dyskiniesies (reduire L-DOPA de 10-30% si besoin)",
        "alerte_clinique": "Adjuvant L-DOPA: prolonge l'effet (reduit OFF) | Avantage: 1 prise/j au coucher | Souvent necessaire de reduire la dose de L-DOPA | CI si insuffisance hepatique severe | Coloration urine (brun-rouge, benin)",
        "bio_cible": ["BIO_013", "BIO_014"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },

    // ========================================================================
    // 🟠 IMPORTANT — Divers
    // ========================================================================
    {
        "dci": "Desmopressine",
        "princeps": "Minirin",
        "classe": "Analogue vasopressine (antidiuretique)",
        "poso_hab": "0.1-0.4 mg/j sublingual ou oral | 10-40 µg nasal",
        "poso_ger": "EVITER si > 65 ans (STOPP3-J10). Si inevitable: 60 µg sublingual au coucher, Na+ avant + J3",
        "poso_ren": "CI si DFG < 50 (risque hyponatremie majore)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "Faible (peptide)",
        "qt_risque": "",
        "ddi_interact": "AINS, ISRS, Carbamazepine, Thiazidiques (majorent hyponatremie ++) | Loperamide (augmente absorption — risque surcharge hydrique)",
        "suivi_initial": "Natremie AVANT initiation | Poids | Volume hydrique",
        "suivi_periodique": "Natremie a J3, J7, M1, puis mensuel les 3 premiers mois | Poids | Restriction hydrique le soir (< 250 mL apres prise)",
        "alerte_clinique": "STOPP3-J10 — Risque d'hyponatremie symptomatique (convulsions, coma) | CI relative chez > 65 ans | Si utilise: restriction hydrique le soir, Na+ frequent | Indications residuelles: enuresie, diabete insipide",
        "bio_cible": ["BIO_002", "BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Teriparatide",
        "princeps": "Forsteo",
        "classe": "Analogue PTH (anabolique osseux)",
        "poso_hab": "20 µg/j SC pendant 24 mois max",
        "poso_ger": "20 µg/j SC. START — osteoporose severe (≥ 2 fractures vertebrales ou echec anti-resorptif)",
        "poso_ren": "DFG < 30: non recommande (hyperCa risque)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "N/A (peptide)",
        "qt_risque": "",
        "ddi_interact": "Digoxine (hypercalcemie potentialise toxicite digitalique) | Diuretiques thiazidiques (hypercalcemie additive)",
        "suivi_initial": "Calcemie | Vitamine D | Creatinine/DFG | Uricemie | PAL",
        "suivi_periodique": "Calcemie a M1, M3 puis semestriel | Calciurie si ATCD lithiase | DMO a 18-24 mois",
        "alerte_clinique": "Duree limitee a 24 mois (risque osteosarcome chez le rat — non confirme humain) | TOUJOURS relayer par anti-resorptif apres arret (bisphosphonate ou denosumab) | Hypercalcemie transitoire (3-6h post-injection) | Hypotension orthostatique (1eres injections)",
        "bio_cible": ["BIO_005", "BIO_023", "BIO_003", "BIO_008", "BIO_016"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Pethidine",
        "princeps": "Dolosal",
        "classe": "Analgesique opioide phenylpiperidine (PIM ABSOLU)",
        "poso_hab": "50-100 mg IM/SC toutes les 3-4h",
        "poso_ger": "CONTRE-INDIQUE en geriatrie (Beers, PRISCUS, FORTA-D)",
        "poso_ren": "CI si IRC (accumulation norpethidine neurotoxique)",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1",
        "albumine": "58-75%",
        "qt_risque": "(CR) - QTc rapporté en surdosage",
        "ddi_interact": "IMAO (CI ABSOLUE — crise hypertensive, hyperthermie maligne) | ISRS (syndrome serotoninergique) | Phenytoine (augmente metabolite toxique)",
        "suivi_initial": "Ne pas prescrire",
        "suivi_periodique": "Ne pas prescrire",
        "alerte_clinique": "PIM ABSOLU — ne JAMAIS utiliser chez le sujet age | Metabolite norpethidine: neurotoxique (convulsions, agitation, hallucinations) | Demi-vie prolongee chez l'age | Remplacer par morphine, oxycodone ou fentanyl",
        "bio_cible": ["BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": "",
        "epileptogene": "eleve",
        "epileptogene_desc": "Métabolite norpéthidine pro-convulsivant — PIM absolu"
    },
    {
        "dci": "Meprobamate",
        "princeps": "Equanil (RETIRE du marche)",
        "classe": "Anxiolytique carbamate (PIM ABSOLU - retire)",
        "poso_hab": "400-1600 mg/j (usage historique)",
        "poso_ger": "CONTRE-INDIQUE — retire du marche francais",
        "poso_ren": "Sans objet (retire)",
        "acb": 1.0,
        "cia": 1.0,
        "bhe": "1",
        "albumine": "15-20%",
        "qt_risque": "",
        "ddi_interact": "Depresseurs SNC (sedation majeure) | Alcool (CI) | Inducteur enzymatique",
        "suivi_initial": "Ne pas prescrire (retire)",
        "suivi_periodique": "Si patient encore sous traitement ancien: sevrage progressif obligatoire",
        "alerte_clinique": "RETIRE DU MARCHE (France 2012, Europe) | PIM absolu Beers/PRISCUS | Si encore prescrit (importation, ancien stock): SEVRAGE PROGRESSIF — risque de convulsions si arret brutal | Remplacer par BZD courte duree (oxazepam) si sevrage necessaire",
        "bio_cible": [],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": "",
        "epileptogene": "modere",
        "epileptogene_desc": "Sevrage brutal → convulsions — PIM absolu"
    },
    {
        "dci": "Pentoxifylline",
        "princeps": "Torental",
        "classe": "Vasodilatateur peripherique xanthine (FORTA-D)",
        "poso_hab": "400 mg x3/j ou LP 400 mg x2/j",
        "poso_ger": "EVITER (FORTA-D, REMEDIES). Efficacite non demontree en AOMI",
        "poso_ren": "DFG < 30: reduire dose 50%",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "0",
        "albumine": "Faible",
        "qt_risque": "",
        "ddi_interact": "Anticoagulants (majore risque hemorragique) | Theophylline (augmente taux) | Antihypertenseurs (hypotension additive)",
        "suivi_initial": "Creatinine/DFG",
        "suivi_periodique": "Reevaluation de l'indication",
        "alerte_clinique": "FORTA-D / REMEDIES — efficacite non prouvee en AOMI | Vertiges, nausees, cephalees | Preferer exercice physique supervise et revascularisation si indiquee | Deprescrire si deja en cours",
        "bio_cible": ["BIO_003"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },

    // ========================================================================
    // 🔵 UTILE — Molécules complémentaires
    // ========================================================================
    {
        "dci": "Sildenafil",
        "princeps": "Viagra, Revatio",
        "classe": "Inhibiteur PDE5",
        "poso_hab": "25-100 mg a la demande (DE) | 20 mg x3/j (HTAP)",
        "poso_ger": "Debuter 25 mg. STOPP3-B14: CI si IC severe (PAS < 90) ou derives nitres",
        "poso_ren": "DFG < 30: debuter 25 mg",
        "acb": 0.0, "cia": 0.0, "bhe": "0", "albumine": "96%",
        "qt_risque": "(CR) - Modeste allongement QTc",
        "ddi_interact": "Derives nitres (CI ABSOLUE — hypotension severe) | Alpha-bloquants (hypotension) | Inhibiteurs CYP3A4 (augmentation exposition) | Riociguat (CI)",
        "suivi_initial": "TA | ECG si FdR CV",
        "suivi_periodique": "TA",
        "alerte_clinique": "STOPP3-B14: CI si IC severe PAS < 90 ou derives nitres concomitants — risque de collapsus | Priapisme (rare) | Perte audition/vision (rare, urgence)",
        "bio_cible": [], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Tadalafil",
        "princeps": "Cialis",
        "classe": "Inhibiteur PDE5 (longue duree d'action 36h)",
        "poso_hab": "5-20 mg a la demande | 5 mg/j quotidien",
        "poso_ger": "Debuter 5 mg. Idem sildenafil pour CI",
        "poso_ren": "DFG 30-50: max 5 mg/j | DFG < 30: eviter (peu de donnees)",
        "acb": 0.0, "cia": 0.0, "bhe": "0", "albumine": "94%",
        "qt_risque": "(CR) - Modeste allongement QTc",
        "ddi_interact": "Derives nitres (CI ABSOLUE) | Alpha-bloquants | Inhibiteurs CYP3A4",
        "suivi_initial": "TA", "suivi_periodique": "TA",
        "alerte_clinique": "STOPP3-B14: memes CI que sildenafil | Demi-vie longue (36h): interactions prolongees | Douleurs dorsolombaires (frequentes debut)",
        "bio_cible": [], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Zaleplon",
        "princeps": "Sonata",
        "classe": "Hypnotique Z non-benzodiazepinique (ultra-court)",
        "poso_hab": "5-10 mg au coucher",
        "poso_ger": "5 mg max. STOPP3/Beers/PRISCUS: ≥ 2 semaines = PIM",
        "poso_ren": "Pas d'ajustement si IRC legere-moderee",
        "acb": 0.0, "cia": 0.0, "bhe": "1", "albumine": "60%",
        "qt_risque": "",
        "ddi_interact": "Cimetidine (augmente exposition) | Depresseurs SNC | Alcool",
        "suivi_initial": "Evaluation insomnie (cause secondaire)",
        "suivi_periodique": "Reevaluer a 2 semaines — sevrage si > 2 sem",
        "alerte_clinique": "STOPP3-D11/K4: PIM si ≥ 2 semaines ou patient chuteur | Demi-vie ultra-courte (1h): plutot endormissement que maintien | Comportements complexes du sommeil (somnambulisme)",
        "bio_cible": [], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Itraconazole",
        "princeps": "Sporanox",
        "classe": "Antifongique azole (inhibiteur puissant CYP3A4 et P-gp)",
        "poso_hab": "100-400 mg/j selon indication",
        "poso_ger": "Dose minimale, cure courte. Surveiller interactions ++",
        "poso_ren": "Gelules: eviter si DFG < 30 (excipient cyclodextrine)",
        "acb": 0.0, "cia": 0.0, "bhe": "Faible", "albumine": "99.8%",
        "qt_risque": "(CR) - Allongement QTc par inhibition CYP3A4 (accumulation substrats)",
        "ddi_interact": "INHIBITEUR PUISSANT CYP3A4 + P-gp — interactions majeures avec AOD, statines, ICa, immunosuppresseurs, opiacees, BZD | AOD: STOPP3-C14 risque hemorragique | Simvastatine/Lovastatine CI | Domperidone CI (QTc)",
        "suivi_initial": "Bilan hepatique | ECG (QTc) | Liste complete co-medications",
        "suivi_periodique": "Bilan hepatique mensuel | ECG si QTc FdR",
        "alerte_clinique": "STOPP3-C14: interaction P-gp avec AOD — risque hemorragique | Inhibiteur CYP3A4 le plus puissant — verifier TOUTES les co-prescriptions | Hepatotoxicite | IC: inotrope negatif, eviter si IC",
        "bio_cible": ["BIO_013", "BIO_014", "BIO_031", "BIO_003"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Ketoconazole",
        "princeps": "Nizoral",
        "classe": "Antifongique azole systemique (inhibiteur puissant CYP3A4)",
        "poso_hab": "200-400 mg/j (usage systemique tres restreint)",
        "poso_ger": "Usage systemique deconseille en geriatrie (hepatotoxicite ++)",
        "poso_ren": "Pas d'ajustement renal",
        "acb": 0.0, "cia": 0.0, "bhe": "Faible", "albumine": "99%",
        "qt_risque": "(CR) - Allongement QTc",
        "ddi_interact": "INHIBITEUR PUISSANT CYP3A4 — memes interactions que itraconazole | IPP, Anti-H2 (diminuent absorption — pH-dependante)",
        "suivi_initial": "Bilan hepatique | ECG",
        "suivi_periodique": "Bilan hepatique hebdomadaire si > 2 semaines",
        "alerte_clinique": "Usage systemique tres restreint (syndrome de Cushing, cancer prostate) | Hepatotoxicite severe (Black Box FDA) | STOPP3-C14: interaction P-gp avec AOD | Usage topique (shampooing) n'a pas ces risques",
        "bio_cible": ["BIO_013", "BIO_014", "BIO_031"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": "",
        "epileptogene": "faible",
        "epileptogene_desc": "Neurotoxicité rapportée à forte dose"
    },
    {
        "dci": "Tamoxifene",
        "princeps": "Nolvadex",
        "classe": "Anti-oestrogene SERM (cancer du sein)",
        "poso_hab": "20 mg/j",
        "poso_ger": "20 mg/j. Utilise en oncologie geriatrique",
        "poso_ren": "Pas d'ajustement renal",
        "acb": 0.0, "cia": 0.0, "bhe": "0", "albumine": "99%",
        "qt_risque": "(PR) - Allongement QTc modere",
        "ddi_interact": "Inhibiteurs CYP2D6 (paroxetine, fluoxetine — reduisent formation endoxifene actif, eviter ++) | AOD (inhibiteur P-gp — STOPP3-C14) | Anticoagulants (augmente INR AVK)",
        "suivi_initial": "Examen gyneco | Bilan hepatique | NFS | Calcemie | Examen ophtalmologique",
        "suivi_periodique": "Examen gyneco annuel (endometre) | Bilan hepatique semestriel | Examen ophtalmologique (retinopathie) | DMO (perte osseuse pre-menopause)",
        "alerte_clinique": "STOPP3-C14: inhibiteur P-gp — interaction AOD | STOPP3-C15: CI si ATCD MTEV | NE PAS associer ISRS inhibiteurs CYP2D6 (paroxetine, fluoxetine) — perte d'efficacite anti-tumorale | Risque thrombo-embolique, cancer endometre, retinopathie",
        "bio_cible": ["BIO_013", "BIO_014", "BIO_030", "BIO_005"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Cinnarizine",
        "princeps": "Sureptil",
        "classe": "Antivertigineux / antihistaminique (piperazine)",
        "poso_hab": "25-75 mg/j",
        "poso_ger": "EVITER (EU7-PIM). Max 4-8 semaines si inevitable",
        "poso_ren": "Pas d'ajustement",
        "acb": 1.0, "cia": 1.0, "bhe": "1", "albumine": "91%",
        "qt_risque": "(CR) - QTc rapporté",
        "ddi_interact": "Depresseurs SNC (sedation additive) | Anti-Parkinson (antagonisme — CI)",
        "suivi_initial": "Recherche syndrome parkinsonien",
        "suivi_periodique": "Syndrome parkinsonien (survenue progressive) | Prise de poids | Depression",
        "alerte_clinique": "EU7-PIM — risque de parkinsonisme iatrogene (D2 blocker faible) | Depression | Prise de poids | Somnolence | Max 4-8 semaines",
        "bio_cible": [], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Flunarizine",
        "princeps": "Sibelium",
        "classe": "Antivertigineux / bloqueur calcique (piperazine)",
        "poso_hab": "5-10 mg/j le soir",
        "poso_ger": "EVITER (EU7-PIM). 5 mg/j max si inevitable, max 2 mois",
        "poso_ren": "Pas d'ajustement",
        "acb": 0.0, "cia": 0.0, "bhe": "1", "albumine": "99%",
        "qt_risque": "(PR) - Bloqueur calcique — QTc possible",
        "ddi_interact": "Depresseurs SNC | Anti-Parkinson (antagonisme)",
        "suivi_initial": "Recherche syndrome parkinsonien | Humeur",
        "suivi_periodique": "Syndrome parkinsonien | Depression | Prise de poids",
        "alerte_clinique": "EU7-PIM — risque parkinsonisme + depression (plus eleve que cinnarizine) | Prise de poids importante | CI si Parkinson ou depression | Max 2 mois",
        "bio_cible": [], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Betahistine",
        "princeps": "Serc, Lectil",
        "classe": "Analogue histamine H1 agoniste / H3 antagoniste (antivertigineux)",
        "poso_hab": "24-48 mg/j en 2-3 prises",
        "poso_ger": "24 mg/j. REMEDIES: efficacite limitee au long cours",
        "poso_ren": "Prudence si IRC",
        "acb": 0.0, "cia": 0.0, "bhe": "1", "albumine": "Faible (< 5%)",
        "qt_risque": "",
        "ddi_interact": "Antihistaminiques H1 (antagonisme pharmacologique) | IMAO (metabolisme retarde)",
        "suivi_initial": "Diagnostic ORL (Meniere vs autre cause)",
        "suivi_periodique": "Reevaluation de l'indication a 3 mois",
        "alerte_clinique": "REMEDIES — efficacite limitee au-dela de la crise de Meniere | Etude BEMED (2022): pas de superiorite vs placebo en prevention | Reevaluer et deprescrire si > 3 mois | Troubles GI frequents",
        "bio_cible": [], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Naftidrofuryl",
        "princeps": "Praxilene",
        "classe": "Vasodilatateur peripherique (antagoniste 5-HT2)",
        "poso_hab": "300-600 mg/j en 3 prises",
        "poso_ger": "EVITER (REMEDIES, EU7-PIM). Efficacite non prouvee en AOMI",
        "poso_ren": "Prudence si IRC",
        "acb": 0.0, "cia": 0.0, "bhe": "0", "albumine": "Donnees limitees",
        "qt_risque": "",
        "ddi_interact": "Aucune interaction majeure documentee",
        "suivi_initial": "Bilan hepatique",
        "suivi_periodique": "Reevaluation de l'indication",
        "alerte_clinique": "REMEDIES/EU7-PIM — efficacite non prouvee | Hepatotoxicite rare | Troubles GI | Preferer exercice physique et revascularisation si AOMI | Deprescrire",
        "bio_cible": ["BIO_013", "BIO_014"], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Nicergoline",
        "princeps": "Sermion",
        "classe": "Vasodilatateur cerebral (ergot de seigle derive)",
        "poso_hab": "30 mg/j en 3 prises ou 30 mg LP /j",
        "poso_ger": "EVITER (REMEDIES). Efficacite non prouvee",
        "poso_ren": "Prudence si IRC",
        "acb": 0.0, "cia": 0.0, "bhe": "1", "albumine": "90%",
        "qt_risque": "",
        "ddi_interact": "Antihypertenseurs (hypotension additive) | Anticoagulants (faible effet antiagreg)",
        "suivi_initial": "TA",
        "suivi_periodique": "TA | Reevaluation indication",
        "alerte_clinique": "REMEDIES — efficacite non prouvee dans troubles cognitifs vasculaires | Derive de l'ergot: fibrose rare (retro-peritoneale, valvulaire) | Deprescrire",
        "bio_cible": [], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Agomelatine",
        "princeps": "Valdoxan",
        "classe": "Antidepresseur melatoninergique (MT1/MT2 agoniste, 5-HT2C antagoniste)",
        "poso_hab": "25-50 mg/j au coucher",
        "poso_ger": "25 mg/j. FORTA-C (peu de donnees geriatriques)",
        "poso_ren": "Pas d'ajustement renal",
        "acb": 0.0, "cia": 0.0, "bhe": "1", "albumine": "95%",
        "qt_risque": "",
        "ddi_interact": "Inhibiteurs CYP1A2 puissants (fluvoxamine, ciprofloxacine — CI, augmentation majeure exposition) | Tabac (inducteur CYP1A2 — diminue efficacite)",
        "suivi_initial": "Bilan hepatique OBLIGATOIRE (transaminases avant traitement)",
        "suivi_periodique": "Transaminases a S3, S6, S12, S24 puis si augmentation dose | Arret si > 3N",
        "alerte_clinique": "FORTA-C — hepatotoxicite (surveillance transaminases obligatoire) | CI si transaminases > 3N | Peu de donnees > 75 ans | Pas d'effet anticholinergique ni serotoninergique | Pas de syndrome de sevrage | CI avec fluvoxamine/ciprofloxacine",
        "bio_cible": ["BIO_013", "BIO_014"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": "",
        "epileptogene": "faible",
        "epileptogene_desc": "Risque faible mais rapporté"
    },
    {
        "dci": "Thiamazole",
        "princeps": "Thyrozol",
        "classe": "Antithyroidien (thionamide — carbimazole metabolite actif)",
        "poso_hab": "10-40 mg/j selon gravite",
        "poso_ger": "Debuter 10-20 mg/j. Titrer selon T3L/T4L toutes les 4-6 semaines",
        "poso_ren": "Pas d'ajustement renal",
        "acb": 0.0, "cia": 0.0, "bhe": "1", "albumine": "Faible",
        "qt_risque": "",
        "ddi_interact": "Anticoagulants (thyrotoxicose modifie sensibilite — surveiller INR) | Iode, Amiodarone (interfere avec traitement)",
        "suivi_initial": "NFS + formule (avant traitement — reference) | TSH, T3L, T4L | Bilan hepatique",
        "suivi_periodique": "NFS si fievre ou angine (agranulocytose — urgence) | TSH/T4L toutes les 4-6 semaines puis trimestriel | Bilan hepatique mensuel les 3 premiers mois",
        "alerte_clinique": "Agranulocytose (0.2-0.5%) — informer le patient: fievre + angine = NFS urgente | Hepatotoxicite (cholestatique, parfois cytolytique) | Arthralgies, rash | Thyrotoxicose a l'amiodarone: avis endocrinologue",
        "bio_cible": ["BIO_019", "BIO_011", "BIO_012", "BIO_013", "BIO_014"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Midodrine",
        "princeps": "Gutron",
        "classe": "Alpha-1 agoniste (vasopresseur oral)",
        "poso_hab": "2.5-10 mg x2-3/j (pas apres 18h — HTA decubitus nocturne)",
        "poso_ger": "Debuter 2.5 mg x2/j. Derniere prise 4h avant le coucher",
        "poso_ren": "Prudence si IRC (accumulation metabolite actif)",
        "acb": 0.0, "cia": 0.0, "bhe": "0", "albumine": "Faible",
        "qt_risque": "",
        "ddi_interact": "Betabloquants (bradycardie reflexe augmentee) | Digoxine (bradycardie) | Alpha-bloquants (antagonisme)",
        "suivi_initial": "TA couche/debout + decubitus | FC",
        "suivi_periodique": "TA debout ET couche (risque HTA decubitus) | FC | Residuel vesical (risque retention)",
        "alerte_clinique": "Indication: hypotension orthostatique severe apres echec mesures non pharmacologiques | NE PAS donner le soir (HTA decubitus nocturne) | Retention urinaire possible (alpha-1 agoniste) | Pilotaxis | Prurit cuir chevelu",
        "bio_cible": ["BIO_003"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Gemfibrozil",
        "princeps": "Lipur",
        "classe": "Fibrate (inhibiteur puissant CYP2C8, OATP1B1)",
        "poso_hab": "600 mg x2/j",
        "poso_ger": "600 mg x2/j. Interactions majeures — preferer fenofibrate si possible",
        "poso_ren": "CI si DFG < 15",
        "acb": 0.0, "cia": 0.0, "bhe": "0", "albumine": "97%",
        "qt_risque": "(CR) - Interaction QTc via inhibition CYP2C8",
        "ddi_interact": "Statines (rhabdomyolyse — surtout simvastatine, lovastatine = CI. Prudence ++) | Repaglinide (augmentation x8 — CI) | Anticoagulants (augmente INR) | Pioglitazone (augmente exposition x3)",
        "suivi_initial": "Bilan lipidique | CPK | Bilan hepatique | Creatinine | NFS",
        "suivi_periodique": "Bilan lipidique trimestriel | CPK si myalgies | Bilan hepatique semestriel | NFS",
        "alerte_clinique": "INHIBITEUR PUISSANT CYP2C8 — interactions majeures avec statines (rhabdomyolyse), repaglinide (hypo severe) | CI avec simvastatine/lovastatine | Preferer fenofibrate (moins d'interactions) | Cholelithiase",
        "bio_cible": ["BIO_027", "BIO_018", "BIO_013", "BIO_014", "BIO_003"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Sucralfate",
        "princeps": "Ulcar",
        "classe": "Protecteur muqueux gastrique (sel d'aluminium)",
        "poso_hab": "1 g x4/j (1h avant repas et au coucher)",
        "poso_ger": "EVITER si possible (EU7-PIM, PRISCUS). Interactions absorption multiples",
        "poso_ren": "EVITER si DFG < 30 (accumulation aluminium — encephalopathie)",
        "acb": 0.0, "cia": 0.0, "bhe": "0", "albumine": "N/A (action topique)",
        "qt_risque": "",
        "ddi_interact": "DIMINUE ABSORPTION de nombreux medicaments (fluoroquinolones, levothyroxine, phenytoine, ketoconazole, digoxine, warfarine) — espacer ≥ 2h | Antiacides aluminiques (surcharge aluminium si IRC)",
        "suivi_initial": "Creatinine/DFG | Liste co-medications (espacement ≥ 2h)",
        "suivi_periodique": "Creatinine si usage prolonge | Phosphoremie si IRC (hypophosphatemie)",
        "alerte_clinique": "EU7-PIM/PRISCUS — constipation, interactions absorption multiples | CI si IRC severe (encephalopathie aluminique) | Espacer TOUS les medicaments de ≥ 2h | Preferer IPP a demi-dose",
        "bio_cible": ["BIO_003", "BIO_004"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Mebeverine",
        "princeps": "Duspatalin",
        "classe": "Antispasmodique musculotrope GI",
        "poso_hab": "200 mg x3/j ou LP 200 mg x2/j",
        "poso_ger": "200 mg x2-3/j. PRISCUS PIM / EU7-PIM / REMEDIES: reevaluer au long cours",
        "poso_ren": "Pas d'ajustement",
        "acb": 0.0, "cia": 0.0, "bhe": "0", "albumine": "75%",
        "qt_risque": "",
        "ddi_interact": "Aucune interaction majeure documentee",
        "suivi_initial": "Diagnostic SII confirme",
        "suivi_periodique": "Reevaluation a 3 mois — deprescrire si pas de benefice",
        "alerte_clinique": "PRISCUS PIM / EU7-PIM / REMEDIES — efficacite non prouvee en continu | Reevaluer a 3 mois | Alternatives: regles hygienodietetiques, psyllium (fibres solubles) | Cephalees, vertiges rares",
        "bio_cible": [], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },
    {
        "dci": "Phloroglucinol",
        "princeps": "Spasfon",
        "classe": "Antispasmodique musculotrope GI (non anticholinergique)",
        "poso_hab": "80 mg x3/j (lyoc ou cp) ou injectable",
        "poso_ger": "80 mg x2-3/j si besoin. REMEDIES: efficacite limitee au long cours",
        "poso_ren": "Pas d'ajustement",
        "acb": 0.0, "cia": 0.0, "bhe": "0", "albumine": "Faible",
        "qt_risque": "",
        "ddi_interact": "Aucune interaction significative",
        "suivi_initial": "Aucun",
        "suivi_periodique": "Reevaluation de l'indication",
        "alerte_clinique": "REMEDIES — usage PRN acceptable, usage chronique a reevaluer | Pas d'effet anticholinergique (avantage sur butylscopolamine) | Bonne tolerance geriatrique en aigu",
        "bio_cible": [], "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },

    // ========================================================================
    // 💊 Sacubitril/Valsartan (Entresto) — ARNI
    // ========================================================================
    {
        "dci": "Sacubitril/Valsartan",
        "princeps": "Entresto",
        "classe": "ARNI (Inhibiteur neprilysine + ARA2)",
        "poso_hab": "49/51 mg x2/j → cible 97/103 mg x2/j",
        "poso_ger": "Debuter 24/26 mg x2/j, titrer toutes les 2-4 semaines si tolere",
        "poso_ren": "DFG 15-30: debuter 24/26 mg x2/j, pas de titration rapide. CI si DFG < 15",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "",
        "albumine": "94%",
        "qt_risque": "",
        "ddi_interact": "IEC (CI absolue — wash-out 36h) | AINS (risque IRA + hyperK) | Diuretiques epargneurs K (hyperK) | Lithium (augmentation lithiemie) | Aliskiren (CI si diabete/IRC)",
        "suivi_initial": "TA | Creatinine + DFG | Kalieme | Natremie | BNP/NT-proBNP",
        "suivi_periodique": "TA (chaque consultation) | Creatinine + K (J7, J14, M1, puis /3 mois) | NT-proBNP (/6 mois) | Symptomes IC (NYHA)",
        "alerte_clinique": "Hypotension symptomatique → reduire diuretique d'abord | Hyperkaliemie > 5.5 → arret temporaire | Angio-oedeme (rare) → arret definitif | Ne JAMAIS associer a un IEC (risque angio-oedeme grave)",
        "bio_cible": ["BIO_001", "BIO_003", "BIO_004", "BIO_028"],
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    },

    // ========================================================================
    // 🌿 Millepertuis — Inducteur enzymatique critique (46 interactions ANSM)
    // ========================================================================
    {
        "dci": "Millepertuis",
        "princeps": "Procalmil / Arkogélules",
        "classe": "Phytothérapie - Inducteur enzymatique puissant",
        "poso_hab": "300-900 mg/j d'extrait standardisé",
        "poso_ger": "CONTRE-INDIQUÉ en polypharmacie — inducteur puissant du CYP3A4, CYP1A2, CYP2C9 et P-gp",
        "poso_ren": "Pas de donnée fiable",
        "acb": 0.0,
        "cia": 0.0,
        "bhe": "1 (passage BHE)",
        "albumine": "",
        "qt_risque": "",
        "ddi_interact": "CONTRE-INDIQUÉ avec : anticoagulants oraux (diminution INR), ciclosporine, tacrolimus, digoxine, antirétroviraux, contraceptifs oraux, ISRS, venlafaxine, méthadone, théophylline, irinotécan, imatinib — Inducteur puissant CYP3A4/CYP1A2/CYP2C9/P-gp",
        "suivi_initial": "Inventaire complet des traitements en cours",
        "suivi_periodique": "Vérifier interactions à chaque modification de traitement",
        "alerte_clinique": "Le millepertuis est un inducteur enzymatique PUISSANT responsable de nombreuses interactions graves. En gériatrie : arrêt recommandé si tout autre traitement à marge thérapeutique étroite",
        "bio_cible": [],
        "epileptogene": "faible",
        "epileptogene_desc": "Abaissement modeste du seuil épileptogène",
        "notes_cliniques": "Produit en vente libre souvent non déclaré — toujours interroger le patient sur l'automédication et la phytothérapie",
        "source": "ANSM Thesaurus 2024 | Prescrire 2023",
        "atb_legere": "", "atb_moderee": "", "atb_severe": "", "atb_terminale": ""
    }
];

// ============================================================================
// 🧪 RÈGLES BIOLOGIQUES ENRICHIES — 7 Bio sous-exploitées
// ============================================================================
// À ajouter dans les règles de surveillance syndromique et le moteur d'analyse

const BIO_RULES_ENRICHMENT = [
    {
        bio_id: "BIO_007",
        nom: "Urée",
        regles: [
            {
                condition: "Ratio urée/créatinine > 100 (en µmol/L)",
                interpretation: "Insuffisance rénale fonctionnelle (pré-rénale) — déshydratation, bas débit",
                action: "Rechercher déshydratation, hypotension, sepsis | Adapter diurétiques",
                meds_impliques: ["furosemide", "bumetanide", "hydrochlorothiazide", "iec", "ara2", "isglt2"],
                syndromes: ["SYND_015"]
            }
        ]
    },
    {
        bio_id: "BIO_015",
        nom: "GGT",
        regles: [
            {
                condition: "GGT > 3N isolée (PAL normales)",
                interpretation: "Induction enzymatique (alcool, phénobarbital, phénytoïne, carbamazépine) ou stéatose médicamenteuse",
                action: "Rechercher cause iatrogène | Bilan hépatique complet",
                meds_impliques: ["phenobarbital", "phenytoine", "carbamazepine", "valproate", "amiodarone"],
                syndromes: ["SYND_031"]
            },
            {
                condition: "GGT > 3N + PAL > 2N",
                interpretation: "Cholestase iatrogène (SYND_031)",
                action: "Arrêt médicament suspect | Imagerie hépatique | Avis gastro",
                meds_impliques: ["amoxicilline + acide clavulanique", "flucloxacilline", "chlorpromazine", "erythromycine"],
                syndromes: ["SYND_031"]
            }
        ]
    },
    {
        bio_id: "BIO_017",
        nom: "Bilirubine",
        regles: [
            {
                condition: "Bilirubine > 35 µmol/L (ictère clinique)",
                interpretation: "Hépatotoxicité iatrogène ou cholestase",
                action: "Bilan étiologique complet | Arrêt médicament suspect | Bilan d'hémostase",
                meds_impliques: ["paracetamol", "methotrexate", "valproate", "amoxicilline + acide clavulanique", "rifampicine", "isoniazide", "flucloxacilline"],
                syndromes: ["SYND_032"]
            }
        ]
    },
    {
        bio_id: "BIO_029",
        nom: "Lithiémie",
        regles: [
            {
                condition: "Lithiémie > 1.0 mEq/L",
                interpretation: "Risque de toxicité | Vérifier interactions",
                action: "Vérifier co-prescriptions (IEC, ARA2, AINS, thiazidiques augmentent la lithiémie) | Hydratation | Contrôle rénal",
                meds_impliques: ["iec", "ara2", "ains", "hydrochlorothiazide", "indapamide", "ibuprofene", "naproxene", "diclofenac"],
                syndromes: ["SYND_028"]
            },
            {
                condition: "Lithiémie > 1.5 mEq/L",
                interpretation: "INTOXICATION — urgence",
                action: "Arrêt lithium | Hyperhydratation NaCl 0.9% | Surveillance neuro/rénale | Dialyse si > 4 mEq/L",
                meds_impliques: ["lithium"],
                syndromes: ["SYND_028"]
            }
        ]
    },
    {
        bio_id: "BIO_037",
        nom: "Lactatémie",
        regles: [
            {
                condition: "Lactate > 2 mmol/L sous metformine",
                interpretation: "Risque d'acidose lactique — vérifier DFG, déshydratation, sepsis",
                action: "Contrôler DFG | Arrêter metformine si DFG < 30 ou sepsis ou déshydratation | Si lactate > 5: arrêt metformine + réanimation",
                meds_impliques: ["metformine"],
                syndromes: []
            }
        ]
    },
    {
        bio_id: "BIO_038",
        nom: "Réticulocytes",
        regles: [
            {
                condition: "Réticulocytes > 120 G/L avec Hb basse",
                interpretation: "Anémie régénérative — réponse médullaire à hémolyse, saignement ou supplémentation",
                action: "Si post-fer IV (IC): bonne réponse | Si spontané: rechercher hémolyse (haptoglobine, LDH, bilirubine) ou saignement",
                meds_impliques: [],
                syndromes: ["SYND_005"]
            },
            {
                condition: "Réticulocytes < 20 G/L avec Hb basse",
                interpretation: "Anémie arégénérative — atteinte médullaire possible (iatrogène, carence B12/folates)",
                action: "NFS + frottis | Dosage B12/B9 | Rechercher toxicité médullaire (MTX, clozapine, carbamazépine)",
                meds_impliques: ["methotrexate", "clozapine", "carbamazepine", "phenytoine", "valproate"],
                syndromes: ["SYND_037"]
            }
        ]
    },
    {
        bio_id: "BIO_039",
        nom: "VGM",
        regles: [
            {
                condition: "VGM > 100 fL (macrocytose)",
                interpretation: "Carence B12/folates, toxicité médicamenteuse (valproate, MTX, hydroxyurée), alcool, hypothyroïdie",
                action: "Doser B12, folates (BIO_021, BIO_022) | TSH | Recherche iatrogénie (valproate, MTX) | Si MTX: vérifier acide folique co-prescrit",
                meds_impliques: ["valproate", "methotrexate", "hydroxycarbamide", "phenytoine", "phenobarbital"],
                syndromes: []
            },
            {
                condition: "VGM < 80 fL (microcytose)",
                interpretation: "Carence martiale (la plus fréquente), inflammation chronique, thalassémie",
                action: "Ferritine + CST (BIO_020) | CRP (BIO_024) | Rechercher saignement si sous AINS/anticoagulant/antiagrégant",
                meds_impliques: ["ains", "anticoag", "antiagreg", "acide acetylsalicylique"],
                syndromes: ["SYND_005"]
            }
        ]
    }
];

// ============================================================================
// 🔌 INSTRUCTION D'INTÉGRATION
// ============================================================================
// 
// Dans votre code d'initialisation, après le chargement de geria_database.js :
//
//   // Ajouter les 48 médicaments manquants
//   if (typeof MISSING_MEDS_ENRICHMENT !== 'undefined') {
//       MASTER_DB.MEDICAMENTS.push(...MISSING_MEDS_ENRICHMENT);
//       console.log(`[ENRICHMENT] ${MISSING_MEDS_ENRICHMENT.length} médicaments ajoutés à MASTER_DB`);
//   }
//
//   // Les BIO_RULES_ENRICHMENT peuvent être intégrées dans le moteur
//   // via une fonction d'évaluation biologique étendue
//
