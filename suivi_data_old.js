const SUIVI_BIOLOGIQUE_DB = [
  {
    "medicament": "Alendronate",
    "bilan_initial": "Calcmie | Phosphatmie | Cratinine/DFG | 25-OH vitamine D",
    "suivi_periodique": "Calcmie (annuelle) | Cratinine (annuelle) | DMO (tous les 35 ans sous traitement)",
    "alerte_clinique_biologique": "Douleur mchoire (ostoncrose) | Douleur fmorale (fracture atypique) | Symptmes hypocalcmie"
  },
  {
    "medicament": "Risdronate",
    "bilan_initial": "Calcmie | Phosphatmie | Cratinine/DFG | 25-OH vitamine D",
    "suivi_periodique": "Calcmie (annuelle) | Cratinine (annuelle) | DMO (tous les 35 ans)",
    "alerte_clinique_biologique": "Douleur mchoire | Douleur fmorale atypique"
  },
  {
    "medicament": "Acide zoldronique",
    "bilan_initial": "Calcmie | Phosphatmie | Cratinine/DFG (CI si DFG<35) | 25-OH vitamine D | Bilan dentaire",
    "suivi_periodique": "Calcmie (avant chaque perfusion) | Cratinine (avant chaque perfusion) | DMO (tous les 35 ans)",
    "alerte_clinique_biologique": "Douleur mchoire (ostoncrose) | Fracture fmorale atypique | Symptmes hypocalcmie post-perfusion"
  },
  {
    "medicament": "Ibandronate",
    "bilan_initial": "Calcmie | Cratinine/DFG (CI si DFG<30) | 25-OH vitamine D",
    "suivi_periodique": "Calcmie (annuelle) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Douleur mchoire | Symptmes hypocalcmie"
  },
  {
    "medicament": "Dapagliflozin",
    "bilan_initial": "HbA1c | Cratinine/DFG | Kalimie | ECBU",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine/DFG (annuelle)",
    "alerte_clinique_biologique": "Ctonmie si symptmes d'acidoctose | Fasciite de Fournier"
  },
  {
    "medicament": "Canagliflozin",
    "bilan_initial": "HbA1c | Cratinine/DFG (CI si DFG<30) | Kalimie | Bilan lipidique | ECBU",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine/DFG (annuelle) | Calcmie/Phosphatmie (prudence en cas d'IRC)",
    "alerte_clinique_biologique": "Ctonmie (acidoctose) | Fractures (risque osseux) | Amputation (surveillance pieds)"
  },
  {
    "medicament": "Ertugliflozin",
    "bilan_initial": "HbA1c | Cratinine/DFG (CI si DFG<30) | Kalimie",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine/DFG (annuelle)",
    "alerte_clinique_biologique": "Ctonmie (acidoctose) | Fasciite de Fournier"
  },
  {
    "medicament": "Exenatide",
    "bilan_initial": "HbA1c | Cratinine/DFG | Lipase/amylase (si antcdent pancratite)",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Douleur pigastrique intense ? lipase/amylase (pancratite)"
  },
  {
    "medicament": "Liraglutide",
    "bilan_initial": "HbA1c | Cratinine/DFG | Lipase | Bilan thyrodien si ATCD",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine (annuelle) | FC (tachycardie possible)",
    "alerte_clinique_biologique": "Douleur pigastrique ? lipase (pancratite) | Nodule thyrodien ? TSH + chographie"
  },
  {
    "medicament": "Dulaglutide",
    "bilan_initial": "HbA1c | Cratinine/DFG | Lipase",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Pancratite (douleur pigastrique)"
  },
  {
    "medicament": "Smaglutide",
    "bilan_initial": "HbA1c | Cratinine/DFG | Lipase | Bilan ophtalmique (rtinopathie)",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine (annuelle) | Fond d'il (si rtinopathie diabtique connue)",
    "alerte_clinique_biologique": "Pancratite | Aggravation rtinopathie"
  },
  {
    "medicament": "Tirzpatide",
    "bilan_initial": "HbA1c | Cratinine/DFG | Lipase | Bilan lipidique",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine (annuelle) | Bilan lipidique (annuel)",
    "alerte_clinique_biologique": "Pancratite | Chollithiase (douleur biliaire)"
  },
  {
    "medicament": "Cicltanide",
    "bilan_initial": "Ionogramme | Cratinine | Uricmie",
    "suivi_periodique": "Ionogramme + cratinine (annuel)",
    "alerte_clinique_biologique": "Hypokalimie | Hyponatrmie"
  },
  {
    "medicament": "Hydrochlorothiazide",
    "bilan_initial": "Ionogramme | Cratinine | Uricmie | Glycmie | Bilan lipidique",
    "suivi_periodique": "Ionogramme + cratinine (annuel) | Glycmie (annuelle) | Uricmie (annuelle)",
    "alerte_clinique_biologique": "Hypokalimie | Hyponatrmie | Hyperuricmie/goutte"
  },
  {
    "medicament": "Indapamide",
    "bilan_initial": "Ionogramme | Cratinine | Uricmie | Glycmie",
    "suivi_periodique": "Ionogramme + cratinine (annuel) | Uricmie (annuelle)",
    "alerte_clinique_biologique": "Hypokalimie | Hyponatrmie"
  },
  {
    "medicament": "Pirtanide",
    "bilan_initial": "Ionogramme | Cratinine",
    "suivi_periodique": "Ionogramme + cratinine (tous les 36 mois)",
    "alerte_clinique_biologique": "Hypokalimie | Dshydratation"
  },
  {
    "medicament": "Torasmide",
    "bilan_initial": "Ionogramme | Cratinine | Uricmie",
    "suivi_periodique": "Ionogramme + cratinine (tous les 36 mois)",
    "alerte_clinique_biologique": "Hypokalimie | Hyponatrmie"
  },
  {
    "medicament": "Telmisartan",
    "bilan_initial": "Cratinine/DFG | Kalimie | Bilan hpatique (prudence si insuffisance hpatique)",
    "suivi_periodique": "Cratinine + kalimie (annuel)",
    "alerte_clinique_biologique": "Insuffisance rnale aigu | Hyperkalimie"
  },
  {
    "medicament": "Atnolol",
    "bilan_initial": "Glycmie/HbA1c si diabte | Cratinine/DFG | ECG",
    "suivi_periodique": "FC/TA (consultations) | Cratinine (annuelle) | Glycmie (annuelle si DT2)",
    "alerte_clinique_biologique": "Bradycardie ? ECG"
  },
  {
    "medicament": "Btaxolol",
    "bilan_initial": "ECG | Glycmie si diabte",
    "suivi_periodique": "FC/TA (consultations) | Glycmie (annuelle si DT2)",
    "alerte_clinique_biologique": "Bradycardie ? ECG"
  },
  {
    "medicament": "Bisoprolol",
    "bilan_initial": "ECG | Glycmie/HbA1c si diabte | Cratinine si IRC",
    "suivi_periodique": "FC (consultation) | Glycmie (annuelle si DT2)",
    "alerte_clinique_biologique": "Bradycardie/BAV ? ECG"
  },
  {
    "medicament": "Cartolol",
    "bilan_initial": "ECG | Glycmie si diabte",
    "suivi_periodique": "FC/TA (consultations)",
    "alerte_clinique_biologique": "Bradycardie ? ECG"
  },
  {
    "medicament": "Carvdilol",
    "bilan_initial": "ECG | Bilan hpatique (limination hpatique) | Glycmie/HbA1c | Bilan lipidique",
    "suivi_periodique": "FC/TA (consultations) | Bilan hpatique (si symptmes) | Glycmie (annuelle)",
    "alerte_clinique_biologique": "Bradycardie ? ECG | Ictre ? bilan hpatique"
  },
  {
    "medicament": "Cliprolol",
    "bilan_initial": "ECG | Glycmie si diabte | Cratinine",
    "suivi_periodique": "FC/TA (consultations)",
    "alerte_clinique_biologique": "Bradycardie ? ECG"
  },
  {
    "medicament": "Labtalol",
    "bilan_initial": "ECG | Bilan hpatique | TA | NFS",
    "suivi_periodique": "Bilan hpatique (rgulier  risque hpatotoxicit) | FC/TA (consultations)",
    "alerte_clinique_biologique": "Hpatite mdicamenteuse (ALAT/ASAT si symptmes)"
  },
  {
    "medicament": "Mtoprolol",
    "bilan_initial": "ECG | Glycmie/HbA1c si diabte | Bilan lipidique",
    "suivi_periodique": "FC/TA (consultations) | Glycmie (annuelle si DT2)",
    "alerte_clinique_biologique": "Bradycardie ? ECG"
  },
  {
    "medicament": "Nadolol",
    "bilan_initial": "ECG | Cratinine/DFG | Glycmie si diabte",
    "suivi_periodique": "FC/TA (consultations) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Bradycardie ? ECG"
  },
  {
    "medicament": "Nbivolol",
    "bilan_initial": "ECG | Bilan hpatique (CI si insuffisance hpatique) | Glycmie si diabte",
    "suivi_periodique": "FC/TA (consultations) | Glycmie (annuelle si DT2)",
    "alerte_clinique_biologique": "Bradycardie ? ECG"
  },
  {
    "medicament": "Pindolol",
    "bilan_initial": "ECG | Glycmie si diabte",
    "suivi_periodique": "FC/TA (consultations)",
    "alerte_clinique_biologique": "Bradycardie ? ECG"
  },
  {
    "medicament": "Propranolol",
    "bilan_initial": "ECG | Glycmie/HbA1c si diabte | TSH (si hyperthyrodie)",
    "suivi_periodique": "FC/TA (consultations) | Glycmie (annuelle si DT2) | Bilan hpatique si symptmes",
    "alerte_clinique_biologique": "Bradycardie/BAV ? ECG | Hypoglycmie masque (diabte)"
  },
  {
    "medicament": "Amlodipine",
    "bilan_initial": "TA | Bilan hpatique (prudence si insuffisance hpatique svre)",
    "suivi_periodique": "TA (consultations) | Bilan hpatique si symptmes (ictre rare)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique | dmes des membres infrieurs (examen clinique)"
  },
  {
    "medicament": "Clvidipine",
    "bilan_initial": "TA | Bilan lipidique (mulsion lipidique IV) | Triglycrides",
    "suivi_periodique": "Surveillance continue TA (usage hospitalier) | Triglycrides (si perfusion prolonge)",
    "alerte_clinique_biologique": "Effet rebond HTA  l'arrt"
  },
  {
    "medicament": "Flodipine",
    "bilan_initial": "TA | Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "TA (consultations)",
    "alerte_clinique_biologique": "dmes | Tachycardie rflexe ? ECG si symptmes"
  },
  {
    "medicament": "Isradipine",
    "bilan_initial": "TA",
    "suivi_periodique": "TA (consultations)",
    "alerte_clinique_biologique": "dmes priphriques"
  },
  {
    "medicament": "Lercanidipine",
    "bilan_initial": "TA | Bilan hpatique (CI si insuffisance hpatique svre) | Cratinine",
    "suivi_periodique": "TA (consultations)",
    "alerte_clinique_biologique": "dmes"
  },
  {
    "medicament": "Manidipine",
    "bilan_initial": "TA | Cratinine",
    "suivi_periodique": "TA (consultations)",
    "alerte_clinique_biologique": "dmes"
  },
  {
    "medicament": "Nicardipine",
    "bilan_initial": "TA | ECG | Bilan hpatique",
    "suivi_periodique": "TA (consultations) | Bilan hpatique si traitement prolong",
    "alerte_clinique_biologique": "Tachycardie rflexe ? ECG"
  },
  {
    "medicament": "Nifdipine",
    "bilan_initial": "TA | ECG",
    "suivi_periodique": "TA (consultations)",
    "alerte_clinique_biologique": "Tachycardie rflexe ? ECG | Aggravation angor (formes LP)"
  },
  {
    "medicament": "Nimodipine",
    "bilan_initial": "TA | Bilan hpatique (CI si insuffisance hpatique svre)",
    "suivi_periodique": "TA (consultations lors de l'usage aigu)",
    "alerte_clinique_biologique": "Hypotension"
  },
  {
    "medicament": "Nitrendipine",
    "bilan_initial": "TA",
    "suivi_periodique": "TA (consultations)",
    "alerte_clinique_biologique": "Tachycardie rflexe"
  },
  {
    "medicament": "Apixaban",
    "bilan_initial": "Cratinine/DFG (CI si DFG<15) | Bilan hpatique | NFS | INR si relais AVK | Hb/Ht",
    "suivi_periodique": "Cratinine + bilan hpatique (annuel) | NFS (annuelle) | Hb si suspicion saignement occulte",
    "alerte_clinique_biologique": "Saignement ? Hb urgente | Insuffisance rnale aigu ? cratinine urgente"
  },
  {
    "medicament": "doxaban",
    "bilan_initial": "Cratinine/DFG (CI si DFG<15 \t rduction dose si DFG 1550) | NFS | Hb/Ht",
    "suivi_periodique": "Cratinine (annuelle) | NFS (annuelle)",
    "alerte_clinique_biologique": "Saignement ? Hb urgente"
  },
  {
    "medicament": "Rivaroxaban",
    "bilan_initial": "Cratinine/DFG (CI si DFG<15) | Bilan hpatique | NFS | Hb/Ht",
    "suivi_periodique": "Cratinine + bilan hpatique (annuel) | NFS (annuelle)",
    "alerte_clinique_biologique": "Saignement ? Hb urgente | Ictre ? bilan hpatique urgence"
  },
  {
    "medicament": "Acnocoumarol",
    "bilan_initial": "INR | NFS | Bilan hpatique | Cratinine",
    "suivi_periodique": "INR (tous les 828 jours selon stabilit  objectif 23 ou 2.53.5) | NFS (annuelle) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Saignement ? INR urgente + Hb | INR>5 ? adaptation dose ou antidote (Vit K)"
  },
  {
    "medicament": "Fluindione",
    "bilan_initial": "INR | NFS | Bilan hpatique | Cratinine",
    "suivi_periodique": "INR (tous les 828 jours selon stabilit) | NFS (annuelle)",
    "alerte_clinique_biologique": "Saignement ? INR + Hb urgente | INR>5 | Allergie (NFS + osinophiles)"
  },
  {
    "medicament": "Warfarine",
    "bilan_initial": "INR | NFS | Bilan hpatique | Cratinine",
    "suivi_periodique": "INR (tous les 828 jours selon stabilit) | NFS (annuelle) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Saignement ? INR + Hb urgente | INR>5 ? adaptation ou antidote"
  },
  {
    "medicament": "Acide actylsalicylique",
    "bilan_initial": "NFS | Cratinine | Bilan hpatique si forte dose | Temps de saignement si chirurgie",
    "suivi_periodique": "NFS (annuelle) | Cratinine (annuelle) | Recherche sang dans les selles si anmie",
    "alerte_clinique_biologique": "Saignement digestif ? NFS + rectorragie | Insuffisance rnale ? cratinine"
  },
  {
    "medicament": "Clopidogrel",
    "bilan_initial": "NFS | Bilan hpatique | Cratinine",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "PTT thrombotique (fivre + thrombopnie + anmie ? NFS urgente) | Saignement"
  },
  {
    "medicament": "Prasugrel",
    "bilan_initial": "NFS | Bilan hpatique (CI si insuffisance hpatique svre) | Poids/ge (dose rduite si <60kg ou >75ans)",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Saignement ? NFS + Hb urgente | PTT (thrombopnie + anmie)"
  },
  {
    "medicament": "Ticagrlor",
    "bilan_initial": "NFS | Cratinine (surveillance uricmie/cratinine) | Bilan hpatique | Uricmie",
    "suivi_periodique": "NFS (annuelle) | Cratinine + uricmie (annuelle  risque hyperuricmie) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Saignement ? NFS + Hb urgente | Dyspne (effet direct non thrombotique  examen clinique)"
  },
  {
    "medicament": "Ticlopidine",
    "bilan_initial": "NFS-plaquettes | Bilan hpatique",
    "suivi_periodique": "NFS-plaquettes (toutes les 2 semaines les 3 premiers mois  OBLIGATOIRE) | Bilan hpatique (mensuel les 3 premiers mois)",
    "alerte_clinique_biologique": "Thrombopnie ? arrt immdiat | PTT ? urgence hmatologique | Neutropnie ? arrt"
  },
  {
    "medicament": "Atorvastatine",
    "bilan_initial": "Bilan hpatique (ASAT/ALAT) | CPK | Glycmie/HbA1c | Bilan lipidique complet",
    "suivi_periodique": "Bilan lipidique ( 68 semaines puis annuel) | ASAT/ALAT (si symptmes hpatiques) | CPK si myalgies | HbA1c (annuelle  lgre augmentation risque DT2)",
    "alerte_clinique_biologique": "Myalgies/crampes ? CPK (rhabdomyolyse si CPK>10N) | Ictre ? ASAT/ALAT urgente"
  },
  {
    "medicament": "Fluvastatine",
    "bilan_initial": "Bilan hpatique | CPK | Bilan lipidique complet",
    "suivi_periodique": "Bilan lipidique ( 68 semaines puis annuel) | ASAT/ALAT (si symptmes) | CPK si myalgies",
    "alerte_clinique_biologique": "Myalgies ? CPK | Ictre ? bilan hpatique urgent"
  },
  {
    "medicament": "Pravastatine",
    "bilan_initial": "Bilan hpatique | CPK | Bilan lipidique complet",
    "suivi_periodique": "Bilan lipidique ( 68 semaines puis annuel) | ASAT/ALAT (si symptmes) | CPK si myalgies",
    "alerte_clinique_biologique": "Myalgies ? CPK | Ictre ? bilan hpatique urgent"
  },
  {
    "medicament": "Rosuvastatine",
    "bilan_initial": "Bilan hpatique | CPK | Bilan lipidique complet | Cratinine (protinurie rare)",
    "suivi_periodique": "Bilan lipidique ( 68 semaines puis annuel) | ASAT/ALAT (si symptmes) | CPK si myalgies | Bandelette urinaire (protinurie) si forte dose",
    "alerte_clinique_biologique": "Myalgies ? CPK | Protinurie ? bandelette + cratinine"
  },
  {
    "medicament": "Simvastatine",
    "bilan_initial": "Bilan hpatique | CPK | Bilan lipidique complet",
    "suivi_periodique": "Bilan lipidique ( 68 semaines puis annuel) | ASAT/ALAT (si symptmes) | CPK si myalgies",
    "alerte_clinique_biologique": "Myalgies/crampes ? CPK (rhabdomyolyse  risque lev si ?80mg/j ou associations CYP3A4) | Ictre ? bilan hpatique urgent"
  },
  {
    "medicament": "Duloxtine",
    "bilan_initial": "Bilan hpatique (CI si insuffisance hpatique) | Glycmie/HbA1c | TA | Ionogramme",
    "suivi_periodique": "Bilan hpatique (si symptmes) | TA (consultations) | Glycmie si diabte",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique urgent | Hypertension ? TA | SIADH ? natrmie"
  },
  {
    "medicament": "Escitalopram",
    "bilan_initial": "Ionogramme (natrmie) | ECG (QTc) | Bilan hpatique",
    "suivi_periodique": "Natrmie ( M1 puis annuelle) | ECG (QTc  annuel si facteur de risque)",
    "alerte_clinique_biologique": "Hyponatrmie | Allongement QTc"
  },
  {
    "medicament": "Fluoxtine",
    "bilan_initial": "Ionogramme (natrmie) | Bilan hpatique | NFS | Glycmie si diabte",
    "suivi_periodique": "Natrmie ( M1 puis annuelle) | Glycmie (annuelle si DT2) | Bilan hpatique si symptmes",
    "alerte_clinique_biologique": "Hyponatrmie (confusion) | Saignements (thrombopnie ? NFS)"
  },
  {
    "medicament": "Fluvoxamine",
    "bilan_initial": "Bilan hpatique (hpatotoxicit possible) | Ionogramme | ECG si cardiopathie",
    "suivi_periodique": "Bilan hpatique (trimestriel la 1re anne) | Natrmie (annuelle)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique urgent | Hyponatrmie"
  },
  {
    "medicament": "Milnacipran",
    "bilan_initial": "TA | FC | Cratinine/DFG | Ionogramme",
    "suivi_periodique": "TA/FC (consultations) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "HTA ? TA | Rtention urinaire ? examen clinique"
  },
  {
    "medicament": "Paroxtine",
    "bilan_initial": "Ionogramme (natrmie) | Bilan hpatique | NFS",
    "suivi_periodique": "Natrmie ( M1 puis annuelle) | Bilan hpatique si symptmes",
    "alerte_clinique_biologique": "Hyponatrmie (SIADH) | Syndrome srotoninergique si associations"
  },
  {
    "medicament": "Sertraline",
    "bilan_initial": "Ionogramme (natrmie) | Bilan hpatique | INR si AVK associ",
    "suivi_periodique": "Natrmie ( M1 puis annuelle) | Bilan hpatique si symptmes",
    "alerte_clinique_biologique": "Hyponatrmie | Saignements"
  },
  {
    "medicament": "Venlafaxine",
    "bilan_initial": "TA (HTA possible) | FC | Ionogramme (natrmie) | ECG si cardiopathie | Bilan hpatique",
    "suivi_periodique": "TA/FC (consultations rgulires) | Natrmie ( M1 puis annuelle) | Bilan hpatique si symptmes",
    "alerte_clinique_biologique": "HTA ? TA | Hyponatrmie | Syndrome srotoninergique"
  },
  {
    "medicament": "Alprazolam",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique | NFS si usage prolong",
    "suivi_periodique": "Pas de biologie systmatique  valuation clinique de dpendance/sevrage",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Bromazpam",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Clobazam",
    "bilan_initial": "Bilan hpatique | NFS",
    "suivi_periodique": "Bilan hpatique (annuel) | NFS (annuelle)",
    "alerte_clinique_biologique": "Cytolyse ? bilan hpatique"
  },
  {
    "medicament": "Clonazpam",
    "bilan_initial": "Bilan hpatique | NFS",
    "suivi_periodique": "Bilan hpatique (annuel) | NFS (annuelle)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique urgent"
  },
  {
    "medicament": "Clorazpate",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Clotiazpam",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Diazpam",
    "bilan_initial": "Bilan hpatique | NFS",
    "suivi_periodique": "Bilan hpatique (annuel si traitement prolong)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Estazolam",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Loprazolam",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Lorazpam",
    "bilan_initial": "Bilan hpatique | NFS",
    "suivi_periodique": "Bilan hpatique (annuel si traitement prolong)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Lormtazpam",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Nitrazpam",
    "bilan_initial": "Bilan hpatique",
    "suivi_periodique": "Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Nordazpam",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Prazpam",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Zolpidem",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique  valuation clinique de dpendance",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Zopiclone",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Amisulpride",
    "bilan_initial": "NFS | Bilan hpatique | Glycmie/HbA1c | Bilan lipidique | ECG (QTc) | Prolactinmie | Poids/IMC | Ionogramme",
    "suivi_periodique": "NFS (annuelle) | Glycmie/HbA1c (annuelle) | Bilan lipidique (annuel) | ECG (QTc annuel) | Prolactinmie (si symptmes) | Poids (chaque consultation)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG urgent | Syndrome malin neuroleptique (fivre + rigidit ? CPK urgente) | Agranulocytose ? NFS urgente"
  },
  {
    "medicament": "Aripiprazole",
    "bilan_initial": "NFS | Bilan hpatique | Glycmie/HbA1c | Bilan lipidique | ECG (QTc) | Poids/IMC",
    "suivi_periodique": "Glycmie/HbA1c (annuelle) | Bilan lipidique (annuel) | NFS (annuelle) | Poids (chaque consultation)",
    "alerte_clinique_biologique": "Syndrome malin neuroleptique ? CPK urgente | Hypoglycmie si associations"
  },
  {
    "medicament": "Clozapine",
    "bilan_initial": "NFS-plaquettes (OBLIGATOIRE avant initiation) | Bilan hpatique | Glycmie/HbA1c | Bilan lipidique | ECG (QTc) | Troponine (myocardite) | Poids/IMC | TA",
    "suivi_periodique": "NFS HEBDOMADAIRE les 18 premires semaines  OBLIGATOIRE (risque agranulocytose) | NFS bimensuelle de la semaine 19  M12 | NFS mensuelle  vie ensuite | Glycmie/HbA1c (tous les 36 mois) | Bilan lipidique (tous les 6 mois) | ECG (QTc annuel + si symptmes) | Troponine (si fivre/dyspne  myocardite) | Poids (chaque consultation)",
    "alerte_clinique_biologique": "NFS < 3000 GB ou < 1500 PNN ? arrt immdiat (ANSM) | Fivre ? NFS urgente (agranulocytose) | Myocardite (troponine + ECG si fivre+dyspne  J15J30) | Tachycardie sinusale inexplique ? ECG + troponine"
  },
  {
    "medicament": "Olanzapine",
    "bilan_initial": "NFS | Bilan hpatique | Glycmie/HbA1c | Bilan lipidique | ECG | Poids/IMC | TA",
    "suivi_periodique": "Glycmie/HbA1c (tous les 36 mois) | Bilan lipidique (tous les 6 mois) | Bilan hpatique (annuel) | NFS (annuelle) | Poids (chaque consultation)",
    "alerte_clinique_biologique": "Syndrome malin neuroleptique ? CPK urgente | Hyperglycmie svre ? glycmie urgente | Ictre ? bilan hpatique urgent"
  },
  {
    "medicament": "Palipridone",
    "bilan_initial": "NFS | Glycmie/HbA1c | Bilan lipidique | ECG (QTc) | Cratinine/DFG | Prolactinmie | Poids/IMC",
    "suivi_periodique": "Glycmie/HbA1c (annuelle) | Bilan lipidique (annuel) | Cratinine (annuelle) | ECG (QTc annuel) | Prolactinmie (si symptmes) | Poids (chaque consultation)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG | Syndrome malin neuroleptique ? CPK"
  },
  {
    "medicament": "Qutiapine",
    "bilan_initial": "NFS | Bilan hpatique | Glycmie/HbA1c | Bilan lipidique | ECG (QTc) | Poids/IMC | TSH (hypothyrodie possible) | TA",
    "suivi_periodique": "Glycmie/HbA1c (tous les 36 mois) | Bilan lipidique (tous les 6 mois) | Bilan hpatique (annuel) | NFS (annuelle) | TSH (annuelle) | ECG (QTc annuel) | Poids (chaque consultation)",
    "alerte_clinique_biologique": "Hyperglycmie ? glycmie urgente | Syndrome malin neuroleptique ? CPK urgente | QTc > 500 ms ? arrt"
  },
  {
    "medicament": "Tiapride",
    "bilan_initial": "NFS | Cratinine/DFG | ECG (QTc) | Prolactinmie",
    "suivi_periodique": "NFS (annuelle) | Cratinine (annuelle) | ECG (QTc annuel) | Prolactinmie (si symptmes)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG | Syndrome malin neuroleptique ? CPK"
  },
  {
    "medicament": "Gabapentine",
    "bilan_initial": "Cratinine/DFG (ajustement de dose selon DFG)",
    "suivi_periodique": "Cratinine (annuelle)",
    "alerte_clinique_biologique": "Insuffisance rnale ? cratinine urgente (risque surdosage) | Dpression respiratoire si associations opiodes"
  },
  {
    "medicament": "Lacosamide",
    "bilan_initial": "ECG (PR allongement) | Bilan hpatique | NFS",
    "suivi_periodique": "ECG (si symptmes) | Bilan hpatique (annuel) | NFS (annuelle)",
    "alerte_clinique_biologique": "BAV ? ECG urgent | Ictre ? bilan hpatique"
  },
  {
    "medicament": "Lvtiractam",
    "bilan_initial": "Cratinine/DFG (ajustement de dose) | NFS | Bilan hpatique",
    "suivi_periodique": "Cratinine (annuelle) | NFS (annuelle) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Troubles du comportement graves (examen clinique)"
  },
  {
    "medicament": "Prgabaline",
    "bilan_initial": "Cratinine/DFG (ajustement de dose) | Glycmie si diabte",
    "suivi_periodique": "Cratinine (annuelle)",
    "alerte_clinique_biologique": "Insuffisance rnale ? cratinine urgente"
  },
  {
    "medicament": "Zonisamide",
    "bilan_initial": "Cratinine | Bicarbonates | NFS | Bilan hpatique",
    "suivi_periodique": "Cratinine (annuelle) | Bicarbonates (annuels  acidose mtabolique) | NFS (annuelle) | Poids (chaque consultation  anorexie)",
    "alerte_clinique_biologique": "Hyperthermie oligurique (oligohydrose)  urgence pdiatrique | Calcul rnal (douleur lombaire)"
  },
  {
    "medicament": "Paractamol",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique ou alcoolisme | INR si AVK (interaction  forte dose)",
    "suivi_periodique": "Bilan hpatique (annuel si usage quotidien prolong) | INR si AVK associ (semestriel)",
    "alerte_clinique_biologique": "Surdosage ? ASAT/ALAT/TP/INR/cratinine EN URGENCE | Ictre ? bilan hpatique urgent"
  },
  {
    "medicament": "Nfopam",
    "bilan_initial": "ECG si cardiopathie (tachycardie) | TA",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Tachycardie/sueurs ? ECG + bilan clinique"
  },
  {
    "medicament": "Dihydrocodine",
    "bilan_initial": "Cratinine/DFG | Bilan hpatique",
    "suivi_periodique": "Cratinine (annuelle)",
    "alerte_clinique_biologique": "Dpression respiratoire (surdosage)"
  },
  {
    "medicament": "Tramadol",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique | Cratinine si IRC",
    "suivi_periodique": "Pas de biologie systmatique  valuation clinique",
    "alerte_clinique_biologique": "Surdosage ? urgence clinique | Syndrome srotoninergique si ISRS associ"
  },
  {
    "medicament": "Fentanyl",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique | Cratinine",
    "suivi_periodique": "Bilan hpatique (annuel) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Dpression respiratoire (surdosage ? urgence) | Surdosage par patch mal positionn"
  },
  {
    "medicament": "Hydromorphone",
    "bilan_initial": "Bilan hpatique | Cratinine/DFG",
    "suivi_periodique": "Bilan hpatique (annuel) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Dpression respiratoire"
  },
  {
    "medicament": "Morphine",
    "bilan_initial": "Bilan hpatique | Cratinine/DFG (accumulation mtabolites actifs si IRC)",
    "suivi_periodique": "Bilan hpatique (annuel) | Cratinine (annuelle  ajustement de dose si DFG diminu)",
    "alerte_clinique_biologique": "Dpression respiratoire | Surdosage ? urgence"
  },
  {
    "medicament": "Oxycodone",
    "bilan_initial": "Bilan hpatique | Cratinine/DFG",
    "suivi_periodique": "Bilan hpatique (annuel) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Dpression respiratoire | Surdosage"
  },
  {
    "medicament": "Tapentadol",
    "bilan_initial": "Bilan hpatique (CI si insuffisance hpatique svre) | Cratinine",
    "suivi_periodique": "Bilan hpatique (annuel si traitement prolong)",
    "alerte_clinique_biologique": "Dpression respiratoire | Syndrome srotoninergique si ISRS associ"
  },
  {
    "medicament": "Fbuxostat",
    "bilan_initial": "Uricmie | Cratinine/DFG | Bilan hpatique (ALAT/ASAT) | ECG (risque cardiovasculaire)",
    "suivi_periodique": "Uricmie (objectif <360 mol/L  tous les 36 mois jusqu' cible puis annuel) | Bilan hpatique (annuel) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique urgent | Douleur thoracique ? ECG (risque CV major vs allopurinol selon tude CARES)"
  },
  {
    "medicament": "Metformine",
    "bilan_initial": "Cratinine/DFG (CI si DFG<30) | Bilan hpatique | Vitamine B12 | NFS | Glycmie/HbA1c",
    "suivi_periodique": "HbA1c (tous les 36 mois jusqu' objectif puis annuel ou biannuel) | Cratinine/DFG (annuelle  suspension si DFG<30) | Vitamine B12 (tous les 2 ans  risque carence par malabsorption)",
    "alerte_clinique_biologique": "Insuffisance rnale aigu ? cratinine urgente + suspension | Acidose lactique (nauses + douleurs musculaires + cratinine) ? urgence"
  },
  {
    "medicament": "Alogliptine",
    "bilan_initial": "HbA1c | Cratinine/DFG (ajustement de dose) | Bilan hpatique | Lipase",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine (annuelle) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Ictre/cytolyse ? bilan hpatique urgent (hpatotoxicit documente) | Pancratite ? lipase"
  },
  {
    "medicament": "Saxagliptine",
    "bilan_initial": "HbA1c | Cratinine/DFG (ajustement de dose si DFG<50) | Bilan hpatique",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine (annuelle) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Pancratite ? lipase | Insuffisance cardiaque (surveillance clinique)"
  },
  {
    "medicament": "Sitagliptine",
    "bilan_initial": "HbA1c | Cratinine/DFG (ajustement si DFG<45) | NFS | Bilan hpatique",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Pancratite ? lipase/amylase | Eruption cutane svre ? arrt (ractions d'hypersensibilit)"
  },
  {
    "medicament": "Vildagliptine",
    "bilan_initial": "HbA1c | Cratinine/DFG | Bilan hpatique (hpatotoxicit  CI si ALAT ou ASAT >3N)",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Bilan hpatique (tous les 3 mois la 1re anne puis annuel) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Cytolyse ? bilan hpatique urgent | Pancratite ? lipase"
  },
  {
    "medicament": "Insuline Aspart",
    "bilan_initial": "HbA1c | Glycmie capillaire | Kalimie | NFS | Cratinine/DFG",
    "suivi_periodique": "HbA1c (tous les 3 mois) | Glycmie capillaire (auto-surveillance quotidienne) | Bilan rnal + ophtalmique + podologique (annuel) | Kalimie (annuelle  risque hypokalimie)",
    "alerte_clinique_biologique": "Hypoglycmie svre ? glycmie urgente | Hypokalimie ? ionogramme"
  },
  {
    "medicament": "Insuline Dgludec",
    "bilan_initial": "HbA1c | Glycmie capillaire | Cratinine/DFG",
    "suivi_periodique": "HbA1c (tous les 3 mois) | Glycmie capillaire (auto-surveillance quotidienne) | Bilan rnal + ophtalmique + podologique (annuel)",
    "alerte_clinique_biologique": "Hypoglycmie svre ? glycmie urgente"
  },
  {
    "medicament": "Insuline Dtmir",
    "bilan_initial": "HbA1c | Glycmie capillaire | Cratinine/DFG",
    "suivi_periodique": "HbA1c (tous les 3 mois) | Glycmie capillaire (auto-surveillance) | Bilan rnal + ophtalmique + podologique (annuel)",
    "alerte_clinique_biologique": "Hypoglycmie svre"
  },
  {
    "medicament": "Insuline Glargine",
    "bilan_initial": "HbA1c | Glycmie capillaire | Cratinine/DFG",
    "suivi_periodique": "HbA1c (tous les 3 mois) | Glycmie capillaire (auto-surveillance) | Bilan rnal + ophtalmique + podologique (annuel)",
    "alerte_clinique_biologique": "Hypoglycmie svre"
  },
  {
    "medicament": "Insuline Glulisine",
    "bilan_initial": "HbA1c | Glycmie capillaire",
    "suivi_periodique": "HbA1c (tous les 3 mois) | Glycmie capillaire (auto-surveillance)",
    "alerte_clinique_biologique": "Hypoglycmie svre"
  },
  {
    "medicament": "Insuline Humaine",
    "bilan_initial": "HbA1c | Glycmie capillaire | Kalimie",
    "suivi_periodique": "HbA1c (tous les 3 mois) | Glycmie capillaire (auto-surveillance) | Kalimie (annuelle) | Bilan rnal + ophtalmique (annuel)",
    "alerte_clinique_biologique": "Hypoglycmie svre | Hypokalimie"
  },
  {
    "medicament": "Insuline Lispro",
    "bilan_initial": "HbA1c | Glycmie capillaire",
    "suivi_periodique": "HbA1c (tous les 3 mois) | Glycmie capillaire (auto-surveillance)",
    "alerte_clinique_biologique": "Hypoglycmie svre"
  },
  {
    "medicament": "Tiratricol",
    "bilan_initial": "TSH | T3L | T4L | ECG",
    "suivi_periodique": "TSH + T3L + T4L (tous les 3 mois puis annuel)",
    "alerte_clinique_biologique": "Surdosage ? tachyarythmie"
  },
  {
    "medicament": "Calcifdiol",
    "bilan_initial": "25-OH vitamine D | Calcmie | Phosphatmie | Cratinine/DFG | PTH",
    "suivi_periodique": "25-OH vitamine D ( 3 mois puis annuelle  objectif 3060 ng/mL) | Calcmie (annuelle) | PTH (annuelle si IRC)",
    "alerte_clinique_biologique": "Hypercalcmie ? calcmie urgente"
  },
  {
    "medicament": "Calcitriol",
    "bilan_initial": "Calcmie | Phosphatmie | Cratinine/DFG | PTH",
    "suivi_periodique": "Calcmie + phosphatmie (tous les 3 mois) | PTH (tous les 6 mois) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Hypercalcmie ? calcmie urgente"
  },
  {
    "medicament": "Cholcalcifrol",
    "bilan_initial": "25-OH vitamine D | Calcmie | Cratinine/DFG",
    "suivi_periodique": "25-OH vitamine D ( 36 mois de la correction puis annuelle) | Calcmie (annuelle)",
    "alerte_clinique_biologique": "Hypercalcmie (surdosage massif uniquement  rare aux doses thrapeutiques)"
  },
  {
    "medicament": "Ergocalcifrol",
    "bilan_initial": "25-OH vitamine D | Calcmie | Cratinine/DFG",
    "suivi_periodique": "25-OH vitamine D ( 36 mois puis annuelle) | Calcmie (annuelle)",
    "alerte_clinique_biologique": "Hypercalcmie (surdosage)"
  },
  {
    "medicament": "Carbonate de calcium",
    "bilan_initial": "Calcmie | Phosphatmie | Cratinine/DFG",
    "suivi_periodique": "Calcmie (annuelle) | Cratinine (annuelle si IRC)",
    "alerte_clinique_biologique": "Hypercalcmie (syndrome lait-alcalin si surdosage) | Constipation (examen clinique)"
  },
  {
    "medicament": "Pidolate de calcium",
    "bilan_initial": "Calcmie",
    "suivi_periodique": "Calcmie (annuelle)",
    "alerte_clinique_biologique": "Hypercalcmie (rare aux doses thrapeutiques)"
  },
  {
    "medicament": "Lansoprazole",
    "bilan_initial": "Magnsmie si traitement prolong | Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Magnsmie (annuelle si usage prolong >1 an) | Vitamine B12 (tous les 23 ans si usage prolong)",
    "alerte_clinique_biologique": "Hypomagnsmie | NFS si anmie inexplique"
  },
  {
    "medicament": "Pantoprazole",
    "bilan_initial": "Magnsmie si traitement prolong | Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Magnsmie (annuelle si usage prolong) | Vitamine B12 (tous les 23 ans)",
    "alerte_clinique_biologique": "Hypomagnsmie"
  },
  {
    "medicament": "Rabprazole",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Magnsmie (annuelle si usage prolong) | Vitamine B12 (tous les 23 ans)",
    "alerte_clinique_biologique": "Hypomagnsmie"
  },
  {
    "medicament": "Lactitol",
    "bilan_initial": "Ionogramme si diarrhe prolonge",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Dshydratation (ionogramme + cratinine)"
  },
  {
    "medicament": "Lactulose",
    "bilan_initial": "Ionogramme si diarrhe prolonge | Amonimie (indication encphalopathie hpatique)",
    "suivi_periodique": "Amonimie si encphalopathie hpatique (selon clinique)",
    "alerte_clinique_biologique": "Dshydratation ? ionogramme"
  },
  {
    "medicament": "Macrogol",
    "bilan_initial": "Ionogramme si insuffisance rnale ou traitement prolong",
    "suivi_periodique": "Pas de biologie systmatique (peu absorb)",
    "alerte_clinique_biologique": "Dshydratation si diarrhe importante"
  },
  {
    "medicament": "Bclomtasone",
    "bilan_initial": "Cortisol si forte dose/traitement prolong (bilan surrnalien)",
    "suivi_periodique": "Cortisol matinal (annuel si >1000 g/j prolong) | Densitomtrie osseuse (si facteurs de risque + forte dose)",
    "alerte_clinique_biologique": "Insuffisance surrnalienne aigu (surtout si arrt brutal ou chirurgie)"
  },
  {
    "medicament": "Budsonide",
    "bilan_initial": "Cortisol si forte dose | Glycmie si DT2 (effet hyperglycmiant possible  forte dose)",
    "suivi_periodique": "Cortisol (annuel si forte dose prolonge) | Densitomtrie osseuse (si facteurs de risque)",
    "alerte_clinique_biologique": "Insuffisance surrnalienne"
  },
  {
    "medicament": "Ciclsonide",
    "bilan_initial": "Cortisol si forte dose",
    "suivi_periodique": "Cortisol (annuel si forte dose prolonge)",
    "alerte_clinique_biologique": "Insuffisance surrnalienne (rare aux doses thrapeutiques)"
  },
  {
    "medicament": "Fluticasone",
    "bilan_initial": "Cortisol si forte dose (fluticasone : puissance leve) | Glycmie si DT2",
    "suivi_periodique": "Cortisol (annuel si forte dose prolonge) | Densitomtrie osseuse (si facteurs de risque) | Glycmie (annuelle)",
    "alerte_clinique_biologique": "Insuffisance surrnalienne (inhibition axe HHA  forte dose) | Cataracte/glaucome (examen ophtalmique)"
  },
  {
    "medicament": "Formotrol",
    "bilan_initial": "ECG si cardiopathie (tachycardie) | Kalimie (hypokalimie possible)",
    "suivi_periodique": "Kalimie si forte dose (annuelle) | ECG si symptmes",
    "alerte_clinique_biologique": "Hypokalimie (notamment si diurtiques associs) | Tachycardie ? ECG"
  },
  {
    "medicament": "Glycopyrronium",
    "bilan_initial": "Pas de biologie spcifique systmatique",
    "suivi_periodique": "EFR (annuelle si BPCO)",
    "alerte_clinique_biologique": "Rtention urinaire/glaucome (examen clinique)"
  },
  {
    "medicament": "Indacatrol",
    "bilan_initial": "ECG si cardiopathie | Kalimie",
    "suivi_periodique": "EFR (annuelle si BPCO) | Kalimie (annuelle)",
    "alerte_clinique_biologique": "Hypokalimie | Tachycardie ? ECG"
  },
  {
    "medicament": "Ipratropium",
    "bilan_initial": "Pas de biologie spcifique",
    "suivi_periodique": "EFR (annuelle si BPCO)",
    "alerte_clinique_biologique": "Rtention urinaire (examen clinique) | Glaucome aigu (douleur oculaire ? urgence ophtalmo)"
  },
  {
    "medicament": "Salbutamol",
    "bilan_initial": "Kalimie si forte dose ou BPCO svre",
    "suivi_periodique": "Kalimie (annuelle si forte dose) | ECG si cardiopathie",
    "alerte_clinique_biologique": "Hypokalimie (surtout si fortes doses + diurtiques) | Tachycardie ? ECG"
  },
  {
    "medicament": "Salmtrol",
    "bilan_initial": "ECG si cardiopathie | Kalimie",
    "suivi_periodique": "EFR (annuelle si BPCO) | Kalimie (annuelle)",
    "alerte_clinique_biologique": "Hypokalimie | Tachycardie ? ECG"
  },
  {
    "medicament": "Terbutaline",
    "bilan_initial": "Kalimie si forte dose",
    "suivi_periodique": "Kalimie (annuelle si forte dose)",
    "alerte_clinique_biologique": "Hypokalimie | Tachycardie"
  },
  {
    "medicament": "Tiotropium",
    "bilan_initial": "Cratinine/DFG (prudence si DFG<50) | Pas de bilan biologique systmatique",
    "suivi_periodique": "EFR (annuelle si BPCO) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Rtention urinaire | Glaucome aigu"
  },
  {
    "medicament": "Umeclidinium",
    "bilan_initial": "Pas de biologie spcifique",
    "suivi_periodique": "EFR (annuelle si BPCO)",
    "alerte_clinique_biologique": "Rtention urinaire (examen clinique)"
  },
  {
    "medicament": "Alfuzosine",
    "bilan_initial": "ECG (QTc) | TA (hypotension orthostatique)",
    "suivi_periodique": "TA (consultations) | ECG (annuel si facteur de risque QTc) | PSA (annuel  ne pas confondre avec cancer prostate)",
    "alerte_clinique_biologique": "Hypotension orthostatique svre ? TA debout/couch | Allongement QTc"
  },
  {
    "medicament": "Doxazosine",
    "bilan_initial": "TA (hypotension orthostatique) | Bilan lipidique",
    "suivi_periodique": "TA (consultations) | Bilan lipidique (annuel)",
    "alerte_clinique_biologique": "Hypotension orthostatique svre"
  },
  {
    "medicament": "Prazosine",
    "bilan_initial": "TA | Bilan lipidique",
    "suivi_periodique": "TA (consultations)",
    "alerte_clinique_biologique": "Hypotension orthostatique (premire dose)"
  },
  {
    "medicament": "Silodosine",
    "bilan_initial": "TA | Cratinine/DFG (CI si DFG<30) | Bilan hpatique",
    "suivi_periodique": "Cratinine (annuelle)",
    "alerte_clinique_biologique": "Hypotension orthostatique"
  },
  {
    "medicament": "Tamsulosine",
    "bilan_initial": "TA",
    "suivi_periodique": "TA (consultations)",
    "alerte_clinique_biologique": "Hypotension orthostatique"
  },
  {
    "medicament": "Trazosine",
    "bilan_initial": "TA | Bilan lipidique",
    "suivi_periodique": "TA (consultations) | Bilan lipidique (annuel)",
    "alerte_clinique_biologique": "Hypotension orthostatique (premire dose)"
  },
  {
    "medicament": "Apraclonidine",
    "bilan_initial": "TA si insuffisance cardiovasculaire",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique)",
    "alerte_clinique_biologique": "Allergie conjonctivale locale (examen ophtalmologique)"
  },
  {
    "medicament": "Bimatoprost",
    "bilan_initial": "Pas de biologie systmatique",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique trimestriel)",
    "alerte_clinique_biologique": "Inflammation oculaire (examen ophtalmologique)"
  },
  {
    "medicament": "Brimonidine",
    "bilan_initial": "TA si traitement systmique hypotenseur associ",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique)",
    "alerte_clinique_biologique": "Hypotension (surtout si btabloquants systmiques associs)"
  },
  {
    "medicament": "Brinzolamide",
    "bilan_initial": "Cratinine/DFG si IRC (CI si DFG<30) | Calcmie (inhibiteur anhydrase carbonique)",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique) | Cratinine (annuelle si IRC)",
    "alerte_clinique_biologique": "Acidose mtabolique (insuffisance rnale svre)"
  },
  {
    "medicament": "Dorzolamide",
    "bilan_initial": "Cratinine/DFG (CI si DFG<30)",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique) | Cratinine (annuelle si IRC)",
    "alerte_clinique_biologique": "Acidose mtabolique si IRC svre"
  },
  {
    "medicament": "Latanoprost",
    "bilan_initial": "Pas de biologie systmatique",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique)",
    "alerte_clinique_biologique": "Uvite/inflammation ? examen ophtalmologique"
  },
  {
    "medicament": "Pilocarpine",
    "bilan_initial": "Pas de biologie systmatique",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique)",
    "alerte_clinique_biologique": "Bradycardie/bronchospasme si absorption systmique importante"
  },
  {
    "medicament": "Tafluprost",
    "bilan_initial": "Pas de biologie systmatique",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique)",
    "alerte_clinique_biologique": "Inflammation oculaire"
  },
  {
    "medicament": "Timolol",
    "bilan_initial": "ECG si cardiopathie (absorption systmique possible) | VEMS/DEP si asthme (CI si asthme)",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique) | FC si traitement systmique associ",
    "alerte_clinique_biologique": "Bradycardie (surtout si btabloquants systmiques associs) | Bronchospasme"
  },
  {
    "medicament": "Travoprost",
    "bilan_initial": "Pas de biologie systmatique",
    "suivi_periodique": "Pression intraoculaire (contrle ophtalmologique)",
    "alerte_clinique_biologique": "Uvite/inflammation"
  },
  {
    "medicament": "Btamthasone",
    "bilan_initial": "Glycmie/HbA1c | Ionogramme (kalimie) | Bilan lipidique | Cortisol matinal (si traitement prolong) | NFS | Cratinine | Densitomtrie osseuse si traitement >3 mois",
    "suivi_periodique": "Glycmie (semestrielle) | Ionogramme (annuel) | Bilan lipidique (annuel) | Cortisol (annuel) | Densitomtrie osseuse (tous les 2 ans si traitement prolong) | DMO/vitamine D/calcium si traitement prolong",
    "alerte_clinique_biologique": "Hyperglycmie ? glycmie urgente | Hypokalimie ? ionogramme urgent | Insuffisance surrnalienne  l'arrt"
  },
  {
    "medicament": "Cortisone",
    "bilan_initial": "Glycmie/HbA1c | Ionogramme | TA | NFS | Bilan lipidique | Cortisol (si test de substitution)",
    "suivi_periodique": "Glycmie (semestrielle) | Ionogramme (annuel) | Bilan lipidique (annuel) | Cortisol (annuel) | Densitomtrie (tous les 2 ans si traitement prolong)",
    "alerte_clinique_biologique": "Hyperglycmie | Hypokalimie | Insuffisance surrnalienne  l'arrt"
  },
  {
    "medicament": "Dexamthasone",
    "bilan_initial": "Glycmie/HbA1c | Ionogramme | NFS | Bilan lipidique | Cortisol (dpiste le syndrome de Cushing iatrogne)",
    "suivi_periodique": "Glycmie (semestrielle) | Ionogramme (annuel) | Bilan lipidique (annuel) | Cortisol (annuel si traitement prolong) | Densitomtrie (tous les 2 ans)",
    "alerte_clinique_biologique": "Hyperglycmie svre | Hypokalimie | Insuffisance surrnalienne  l'arrt brutal"
  },
  {
    "medicament": "Hydrocortisone",
    "bilan_initial": "Glycmie/HbA1c | Ionogramme | Cortisol (bilan surrnalien si substitution) | NFS | Cratinine",
    "suivi_periodique": "Cortisol + ACTH (annuels si insuffisance surrnalienne) | Glycmie (semestrielle) | Ionogramme (annuel) | Rnine si maladie d'Addison",
    "alerte_clinique_biologique": "Insuffisance surrnalienne aigu (urgence absolue  TA + ionogramme + glycmie) | Hyperglycmie"
  },
  {
    "medicament": "Mthylprednisolone",
    "bilan_initial": "Glycmie/HbA1c | Ionogramme | NFS | Bilan lipidique | Cortisol si traitement prolong",
    "suivi_periodique": "Glycmie (semestrielle) | Ionogramme (annuel) | Bilan lipidique (annuel) | Cortisol (annuel) | Densitomtrie (tous les 2 ans)",
    "alerte_clinique_biologique": "Hyperglycmie | Hypokalimie | Insuffisance surrnalienne  l'arrt"
  },
  {
    "medicament": "Prednisolone",
    "bilan_initial": "Glycmie/HbA1c | Ionogramme | NFS | Bilan lipidique | Cortisol si traitement >3 mois | Densitomtrie si traitement prolong",
    "suivi_periodique": "Glycmie (semestrielle) | Ionogramme (annuel) | Bilan lipidique (annuel) | Cortisol (annuel) | Densitomtrie (tous les 2 ans) | 25-OH vitamine D (annuelle)",
    "alerte_clinique_biologique": "Hyperglycmie | Hypokalimie | Insuffisance surrnalienne  l'arrt"
  },
  {
    "medicament": "Prednisone",
    "bilan_initial": "Glycmie/HbA1c | Ionogramme | NFS | Bilan lipidique | Cortisol si traitement >3 mois",
    "suivi_periodique": "Glycmie (semestrielle) | Ionogramme (annuel) | Bilan lipidique (annuel) | Cortisol (annuel) | Densitomtrie (tous les 2 ans)",
    "alerte_clinique_biologique": "Hyperglycmie | Hypokalimie | Insuffisance surrnalienne  l'arrt"
  },
  {
    "medicament": "Fumarate ferreux",
    "bilan_initial": "NFS + rticulocytes | Ferritine | Fer srique + transferrine + CST",
    "suivi_periodique": "NFS + rticulocytes ( 4 semaines) | Ferritine ( 3 mois) | Bilan martial ( 6 mois)",
    "alerte_clinique_biologique": "Absence de rponse ? bilan tiologique"
  },
  {
    "medicament": "Sulfate ferreux",
    "bilan_initial": "NFS + rticulocytes | Ferritine | Fer srique + transferrine + CST",
    "suivi_periodique": "NFS + rticulocytes ( 4 semaines) | Ferritine ( 3 mois) | Bilan martial ( 6 mois)",
    "alerte_clinique_biologique": "Absence de rponse ? bilan tiologique"
  },
  {
    "medicament": "Chlorpromazine",
    "bilan_initial": "NFS | Bilan hpatique | ECG (QTc) | Glycmie | Bilan lipidique | Poids/IMC | TA",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel) | Glycmie (annuelle) | Poids (chaque consultation)",
    "alerte_clinique_biologique": "Agranulocytose ? NFS urgente (fivre) | Ictre ? bilan hpatique urgent | Syndrome malin neuroleptique ? CPK urgente | Allongement QTc"
  },
  {
    "medicament": "Haloperidol",
    "bilan_initial": "NFS | Bilan hpatique | ECG (QTc) | Glycmie | Ionogramme | Prolactinmie | Poids/IMC",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel) | Ionogramme (annuel) | Glycmie (annuelle)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG urgent | Syndrome malin neuroleptique ? CPK urgente | Ictre cholestatique ? bilan hpatique"
  },
  {
    "medicament": "Fluphnazine",
    "bilan_initial": "NFS | Bilan hpatique | ECG (QTc) | Glycmie | Poids/IMC",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel) | Glycmie (annuelle)",
    "alerte_clinique_biologique": "Agranulocytose ? NFS urgente | Syndrome malin neuroleptique ? CPK"
  },
  {
    "medicament": "Perphnazine",
    "bilan_initial": "NFS | Bilan hpatique | ECG (QTc) | Glycmie",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel)",
    "alerte_clinique_biologique": "Agranulocytose ? NFS urgente | Syndrome malin neuroleptique ? CPK"
  },
  {
    "medicament": "Lvomthopromazine",
    "bilan_initial": "NFS | Bilan hpatique | ECG (QTc) | Glycmie | TA (hypotension orthostatique)",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel) | TA (consultations)",
    "alerte_clinique_biologique": "Agranulocytose ? NFS urgente | Ictre ? bilan hpatique | Syndrome malin neuroleptique ? CPK"
  },
  {
    "medicament": "Ritonavir",
    "bilan_initial": "NFS | Bilan hpatique (ASAT/ALAT/GGT/bilirubine) | Cratinine/DFG | Bilan lipidique | Glycmie/HbA1c | INR si AVK | ECG (QTc) | Srologies VHB/VHC",
    "suivi_periodique": "Bilan hpatique (tous les 36 mois) | Bilan lipidique (annuel) | Glycmie/HbA1c (annuelle) | NFS (annuelle) | ECG (annuel) | Charge virale + CD4 (selon protocole VIH)",
    "alerte_clinique_biologique": "Cytolyse svre ? bilan hpatique urgent | Allongement QTc ? ECG urgent | Hyperglycmie ? glycmie urgente"
  },
  {
    "medicament": "Cobicistat",
    "bilan_initial": "Cratinine/DFG (fausse lvation cratinine par inhibition scrtion tubulaire) | Bilan hpatique | NFS | Bilan lipidique | ECG",
    "suivi_periodique": "Cratinine (tous les 36 mois  attention: lvation de ~0.1 mg/dL normale avec cobicistat) | Bilan hpatique (tous les 6 mois) | Bilan lipidique (annuel) | Charge virale + CD4",
    "alerte_clinique_biologique": "lvation cratinine >0.4 mg/dL vs baseline ? vraie nphrotoxicit  explorer | Ictre (bilirubine)"
  },
  {
    "medicament": "Darunavir",
    "bilan_initial": "Bilan hpatique (sulfonamide  CI si allergie sulfa) | NFS | Bilan lipidique | Glycmie | Cratinine",
    "suivi_periodique": "Bilan hpatique (tous les 36 mois) | Bilan lipidique (annuel) | Glycmie (annuelle) | Charge virale + CD4",
    "alerte_clinique_biologique": "Ictre/cytolyse ? bilan hpatique urgent | Eruption cutane ? NFS + bilan hpatique (sulfonamide)"
  },
  {
    "medicament": "Lopinavir",
    "bilan_initial": "NFS | Bilan hpatique | Bilan lipidique | Glycmie/HbA1c | ECG (QTc) | Cratinine",
    "suivi_periodique": "Bilan hpatique (tous les 36 mois) | Bilan lipidique (annuel) | Glycmie (annuelle) | ECG (annuel) | Charge virale + CD4",
    "alerte_clinique_biologique": "Allongement QTc ? ECG urgent | Ictre ? bilan hpatique urgent | Dyslipidmie svre"
  },
  {
    "medicament": "Efavirenz",
    "bilan_initial": "Bilan hpatique | NFS | Bilan lipidique | Glycmie | Cratinine | Bilan psychiatrique (exclure ATCD psychose)",
    "suivi_periodique": "Bilan hpatique (tous les 36 mois) | Bilan lipidique (annuel) | Charge virale + CD4",
    "alerte_clinique_biologique": "Cytolyse svre ? bilan hpatique urgent | Symptmes psychiatriques (valuation clinique) | Eruption cutane svre (SJS rare)"
  },
  {
    "medicament": "Doravirine",
    "bilan_initial": "Bilan hpatique | NFS | Cratinine | Bilan lipidique",
    "suivi_periodique": "Bilan hpatique (tous les 6 mois) | Bilan lipidique (annuel) | Charge virale + CD4",
    "alerte_clinique_biologique": "Cytolyse ? bilan hpatique urgent"
  },
  {
    "medicament": "Emtricitabine",
    "bilan_initial": "Cratinine/DFG | Srologie VHB (risque flare  l'arrt si VHB+) | NFS | Bilan hpatique",
    "suivi_periodique": "Cratinine (tous les 36 mois) | Charge virale VIH + CD4 | AgHBs/VHB si co-infection",
    "alerte_clinique_biologique": "Pousse hpatite B  l'arrt ? bilan hpatique urgent | Acidose lactique (asthnie + nauses ? lactatmie urgente)"
  },
  {
    "medicament": "Chlorphniramine",
    "bilan_initial": "Pas de biologie spcifique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Rtention urinaire (examen clinique)"
  },
  {
    "medicament": "Ctirizine",
    "bilan_initial": "Cratinine/DFG si IRC svre (ajustement de dose)",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Pas de biologie d'alerte spcifique"
  },
  {
    "medicament": "Loratadine",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique svre",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Pas de biologie d'alerte spcifique"
  },
  {
    "medicament": "Fexofnadine",
    "bilan_initial": "Cratinine/DFG si IRC svre",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Pas de biologie d'alerte spcifique"
  },
  {
    "medicament": "Eletriptan",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique (CI si svre) | ECG si cardiopathie",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Douleur thoracique ? ECG (vasoconstriction coronaire)"
  },
  {
    "medicament": "Frovatriptan",
    "bilan_initial": "ECG si cardiopathie",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Douleur thoracique ? ECG"
  },
  {
    "medicament": "Naratriptan",
    "bilan_initial": "Cratinine/DFG (CI si DFG<15) | ECG si cardiopathie",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Douleur thoracique ? ECG"
  },
  {
    "medicament": "Sumatriptan",
    "bilan_initial": "ECG si cardiopathie",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Douleur thoracique/oppression ? ECG (vasoconstriction coronaire)"
  },
  {
    "medicament": "Zolmitriptan",
    "bilan_initial": "ECG si cardiopathie | Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Douleur thoracique ? ECG"
  },
  {
    "medicament": "Bosentan",
    "bilan_initial": "Bilan hpatique COMPLET (REMS  programme de surveillance obligatoire) | NFS (anmie) | Hmoglobine | Cratinine | Bilan lipidique | Test de grossesse (tratogne  CI absolue)",
    "suivi_periodique": "Bilan hpatique MENSUEL OBLIGATOIRE (programme REMS EU) | NFS + Hb (tous les 3 mois  anmie dilutionnelle) | Test de grossesse mensuel si femme en ge de procrer | Bilan lipidique (annuel) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "ALAT/ASAT >3N ? adaptation dose ou arrt (REMS) | >5N ? arrt immdiat | Anmie svre ? NFS urgente"
  },
  {
    "medicament": "Bupropion",
    "bilan_initial": "TA | ECG si cardiopathie | NFS | Bilan hpatique | Glycmie/HbA1c",
    "suivi_periodique": "TA (consultations) | Bilan hpatique (annuel) | NFS (annuelle)",
    "alerte_clinique_biologique": "Convulsions (examen clinique  risque pilepsie  dose leve) | HTA ? TA"
  },
  {
    "medicament": "Buspirone",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Mirtazapine",
    "bilan_initial": "NFS (agranulocytose rare) | Bilan hpatique | Glycmie/HbA1c | Bilan lipidique (prise de poids frquente)",
    "suivi_periodique": "NFS (si fivre/angine  agranulocytose) | Bilan lipidique + glycmie (annuels) | Bilan hpatique (annuel) | Poids (chaque consultation)",
    "alerte_clinique_biologique": "Fivre + angine ? NFS urgente (agranulocytose rare) | Ictre ? bilan hpatique urgent"
  },
  {
    "medicament": "Cimtidine",
    "bilan_initial": "Cratinine/DFG | Bilan hpatique | NFS",
    "suivi_periodique": "Cratinine (annuelle  lvation cratinine par inhibition scrtion tubulaire) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Cytolyse ? bilan hpatique urgent"
  },
  {
    "medicament": "Famotidine",
    "bilan_initial": "Cratinine/DFG si IRC",
    "suivi_periodique": "Cratinine (annuelle si IRC)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Cilostazol",
    "bilan_initial": "NFS-plaquettes | ECG (QTc) | Bilan hpatique | Cratinine/DFG",
    "suivi_periodique": "NFS-plaquettes (annuelle) | ECG (annuel) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Thrombocytopnie ? NFS urgente | Allongement QTc ? ECG urgent | Insuffisance cardiaque (CONTRE-INDIQU si FEVG altre)"
  },
  {
    "medicament": "Aprpitant",
    "bilan_initial": "Bilan hpatique (prudence si insuffisance hpatique svre)",
    "suivi_periodique": "Pas de biologie systmatique (utilisation courte)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Fosaprepitant",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique (utilisation courte)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Casopitant",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique",
    "suivi_periodique": "Pas de biologie systmatique (utilisation courte)",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  },
  {
    "medicament": "Miglitinide",
    "bilan_initial": "HbA1c | Bilan hpatique | Cratinine/DFG",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Hypoglycmie svre ? glycmie urgente"
  },
  {
    "medicament": "Nateglinide",
    "bilan_initial": "HbA1c | Bilan hpatique (CI si insuffisance hpatique svre) | Cratinine/DFG",
    "suivi_periodique": "HbA1c (tous les 36 mois) | Bilan hpatique (annuel) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Hypoglycmie svre ? glycmie urgente"
  },
  {
    "medicament": "Benzbromarone",
    "bilan_initial": "Uricmie | Cratinine/DFG (CI si DFG<20) | Bilan hpatique (hpatotoxicit) | NFS",
    "suivi_periodique": "Uricmie (tous les 36 mois jusqu' cible puis annuel) | Bilan hpatique (tous les 3 mois la 1re anne  hpatotoxicit svre documente) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Ictre ? arrt immdiat + bilan hpatique urgent (hpatite fulminante documente) | Colique nphrtique (uricosurique ? lithiase)"
  },
  {
    "medicament": "Albendazole",
    "bilan_initial": "NFS-plaquettes | Bilan hpatique (ASAT/ALAT) | Cratinine",
    "suivi_periodique": "NFS + bilan hpatique (toutes les 2 semaines si traitement prolong  chinococcose) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Leucopnie/thrombopnie ? NFS urgente | Ictre ? bilan hpatique urgent | Alopcie (examen clinique)"
  },
  {
    "medicament": "Oxybutynine",
    "bilan_initial": "Cratinine/DFG si IRC | ECG si QTc prolong",
    "suivi_periodique": "Pas de biologie systmatique | ECG si symptmes",
    "alerte_clinique_biologique": "Rtention urinaire (examen clinique) | Glaucome aigu"
  },
  {
    "medicament": "Solifnacine",
    "bilan_initial": "Cratinine/DFG (ajustement si DFG<30) | Bilan hpatique si insuffisance hpatique | ECG (QTc)",
    "suivi_periodique": "ECG (QTc annuel si facteur de risque) | Cratinine (annuelle)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG | Rtention urinaire"
  },
  {
    "medicament": "Toltrodine",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique | Cratinine/DFG | ECG (QTc)",
    "suivi_periodique": "ECG (annuel si facteur de risque QTc) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG | Ictre ? bilan hpatique"
  },
  {
    "medicament": "Fsotrodine",
    "bilan_initial": "Cratinine/DFG | Bilan hpatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Rtention urinaire | Allongement QTc si facteur de risque ? ECG"
  },
  {
    "medicament": "Trospium",
    "bilan_initial": "Cratinine/DFG (CI si DFG<30)",
    "suivi_periodique": "Cratinine (annuelle)",
    "alerte_clinique_biologique": "Rtention urinaire"
  },
  {
    "medicament": "Doxpine",
    "bilan_initial": "ECG (QTc) | NFS | Bilan hpatique | Ionogramme",
    "suivi_periodique": "ECG (tous les 612 mois) | NFS (annuelle) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG urgent | Ictre | SIADH"
  },
  {
    "medicament": "Trimipramine",
    "bilan_initial": "ECG (QTc) | NFS | Bilan hpatique | Ionogramme",
    "suivi_periodique": "ECG (tous les 612 mois) | NFS (annuelle) | Bilan hpatique (annuel)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG urgent | Ictre"
  },
  {
    "medicament": "Hydroxyzine",
    "bilan_initial": "ECG (QTc  allongement document) | Cratinine/DFG si IRC",
    "suivi_periodique": "ECG (annuel si facteur de risque QTc)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG urgent"
  },
  {
    "medicament": "Doxylamine",
    "bilan_initial": "Pas de biologie spcifique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Rtention urinaire (examen clinique)"
  },
  {
    "medicament": "Promthazine",
    "bilan_initial": "ECG (QTc) | NFS (agranulocytose rare) | Bilan hpatique",
    "suivi_periodique": "NFS (annuelle si traitement prolong) | Bilan hpatique (annuel) | ECG (QTc annuel)",
    "alerte_clinique_biologique": "Agranulocytose (fivre ? NFS urgente) | Allongement QTc ? ECG urgent | Ictre cholestatique ? bilan hpatique"
  },
  {
    "medicament": "Alimmazine",
    "bilan_initial": "ECG (QTc) | NFS | Bilan hpatique",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel)",
    "alerte_clinique_biologique": "Agranulocytose (fivre ? NFS urgente) | Allongement QTc"
  },
  {
    "medicament": "Dexchlorphniramine",
    "bilan_initial": "Pas de biologie spcifique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Rtention urinaire"
  },
  {
    "medicament": "Cyammazine",
    "bilan_initial": "NFS | Bilan hpatique | ECG (QTc) | Glycmie | TA",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel)",
    "alerte_clinique_biologique": "Agranulocytose ? NFS urgente | Syndrome malin neuroleptique ? CPK | Allongement QTc"
  },
  {
    "medicament": "Pipotiazine",
    "bilan_initial": "NFS | Bilan hpatique | ECG (QTc) | Glycmie",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel)",
    "alerte_clinique_biologique": "Agranulocytose ? NFS urgente | Syndrome malin neuroleptique ? CPK"
  },
  {
    "medicament": "Flupentixol",
    "bilan_initial": "NFS | Bilan hpatique | ECG (QTc) | Glycmie | Bilan lipidique | Poids/IMC",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel) | Glycmie + bilan lipidique (annuel)",
    "alerte_clinique_biologique": "Syndrome malin neuroleptique ? CPK urgente | Allongement QTc"
  },
  {
    "medicament": "Zuclopenthixol",
    "bilan_initial": "NFS | Bilan hpatique | ECG (QTc) | Glycmie | Bilan lipidique",
    "suivi_periodique": "NFS (annuelle) | Bilan hpatique (annuel) | ECG (QTc annuel) | Glycmie + bilan lipidique (annuel)",
    "alerte_clinique_biologique": "Syndrome malin neuroleptique ? CPK urgente | Allongement QTc"
  },
  {
    "medicament": "Trihexyphnidyle",
    "bilan_initial": "Pas de biologie spcifique systmatique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Rtention urinaire | Glaucome aigu | Confusion (examen clinique  anticholinergique fort)"
  },
  {
    "medicament": "Tropatpine",
    "bilan_initial": "Pas de biologie spcifique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Rtention urinaire | Glaucome aigu"
  },
  {
    "medicament": "Bipridne",
    "bilan_initial": "Pas de biologie spcifique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Rtention urinaire | Glaucome aigu"
  },
  {
    "medicament": "Scopolamine",
    "bilan_initial": "Pas de biologie spcifique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Rtention urinaire | Glaucome aigu | Confusion (examen clinique)"
  },
  {
    "medicament": "Timonium",
    "bilan_initial": "Pas de biologie spcifique",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Rtention urinaire (examen clinique)"
  },
  {
    "medicament": "Atropine",
    "bilan_initial": "ECG si usage systmique (tachycardie) | Pas de biologie spcifique si usage ponctuel",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Tachycardie ? ECG | Rtention urinaire | Glaucome aigu"
  },
  {
    "medicament": "Atnolol + Chlortalidone",
    "bilan_initial": "Ionogramme complet | Cratinine/DFG | ECG | Glycmie/HbA1c | Uricmie | Bilan lipidique",
    "suivi_periodique": "Ionogramme + cratinine (annuel) | Glycmie (annuelle) | Uricmie (annuelle) | ECG (annuel) | TA/FC (consultations)",
    "alerte_clinique_biologique": "Hypokalimie (chlortalidone) | Bradycardie (atnolol) ? ECG | Hyperuricmie/goutte"
  },
  {
    "medicament": "Mtoclopramide",
    "bilan_initial": "ECG (QTc) | Cratinine/DFG | Prolactinmie si amnorrhe",
    "suivi_periodique": "ECG (annuel si facteur de risque QTc) | valuation clinique syndrome extrapyramidal (traitement court recommand)",
    "alerte_clinique_biologique": "Allongement QTc ? ECG urgent | Mouvements anormaux (dyskinsie tardive  arrt immdiat) | Syndrome malin neuroleptique (rare)"
  },
  {
    "medicament": "Lopramide",
    "bilan_initial": "Pas de biologie spcifique si usage ponctuel | ECG (QTc) si usage prolong ou haute dose",
    "suivi_periodique": "ECG si usage prolong ou haute dose (allongement QTc/arythmies  dose suprathrapeutique)",
    "alerte_clinique_biologique": "Allongement QTc  forte dose ? ECG urgent | Ilus paralytique (examen clinique)"
  },
  {
    "medicament": "Thiocolchicoside",
    "bilan_initial": "Pas de biologie spcifique systmatique",
    "suivi_periodique": "Pas de biologie systmatique (usage court)",
    "alerte_clinique_biologique": "Pas de biologie d'alerte spcifique (usage court  <7 jours)"
  },
  {
    "medicament": "Mthocarbamol",
    "bilan_initial": "Bilan hpatique si insuffisance hpatique | Cratinine/DFG si IRC",
    "suivi_periodique": "Pas de biologie systmatique",
    "alerte_clinique_biologique": "Ictre ? bilan hpatique"
  }
];
