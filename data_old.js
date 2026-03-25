const GERIA_DB = {
  "medicaments": [
    {
      "med_id": "AC",
      "nom_classe": "Anticholinergiques (toutes sous-classes)",
      "sous_classes_exemples": "Antihistaminiques H1 1ère gén., Antispasmodiques urinaires, Antispasmodiques GI, Antidépresseurs tricycliques, Antiparkinsoniens AC, Antipsychotiques phénothiaziniques, Antiémétiques AC",
      "categorie_pharmacologique": "Diverses classes à effet anticholinergique",
      "code_atc_principal": "N/A"
    },
    {
      "med_id": "BZD",
      "nom_classe": "Benzodiazépines (toutes) et Z-drugs",
      "sous_classes_exemples": "Diazépam, Lorazépam, Oxazépam, Alprazolam, Nitrazépam, Lormétazépam, Triazolam, Midazolam, Brotizolam, Zolpidem, Zopiclone, Zaleplon",
      "categorie_pharmacologique": "Anxiolytiques / Hypnotiques",
      "code_atc_principal": "N05C"
    },
    {
      "med_id": "AP",
      "nom_classe": "Antipsychotiques (1ère et 2ème génération)",
      "sous_classes_exemples": "Halopéridol, Rispéridone, Olanzapine, Quétiapine, Aripiprazole, Clozapine, Chlorpromazine, Cyamémazine, Melpérone",
      "categorie_pharmacologique": "Antipsychotiques",
      "code_atc_principal": "N05A"
    },
    {
      "med_id": "AINS",
      "nom_classe": "AINS non sélectifs et inhibiteurs COX-2",
      "sous_classes_exemples": "Ibuprofène, Naproxène, Indométacine, Kétorolac, Piroxicam, Phénylbutazone, Célécoxib, Diclofénac",
      "categorie_pharmacologique": "Anti-inflammatoires non stéroïdiens",
      "code_atc_principal": "M01A"
    },
    {
      "med_id": "ALPHA_HTA",
      "nom_classe": "Alpha-1 bloquants périphériques (usage antihypertenseur)",
      "sous_classes_exemples": "Doxazosine, Prazosine, Térazosine, Urapidil",
      "categorie_pharmacologique": "Antihypertenseurs",
      "code_atc_principal": "C02C"
    },
    {
      "med_id": "ALPHA_URO",
      "nom_classe": "Alpha-1 bloquants (usage urologique / prostatisme)",
      "sous_classes_exemples": "Tamsulosine, Silodosine",
      "categorie_pharmacologique": "Médicaments de la prostate",
      "code_atc_principal": "G04C"
    },
    {
      "med_id": "ANTIHTA_CENTRAL",
      "nom_classe": "Antihypertenseurs d'action centrale",
      "sous_classes_exemples": "Clonidine, Méthyldopa, Réserpine",
      "categorie_pharmacologique": "Antihypertenseurs centraux",
      "code_atc_principal": "C02A"
    },
    {
      "med_id": "ATC",
      "nom_classe": "Antidépresseurs tricycliques",
      "sous_classes_exemples": "Amitriptyline, Clomipramine, Imipramine, Désipramine, Doxépine",
      "categorie_pharmacologique": "Antidépresseurs",
      "code_atc_principal": "N06AA"
    },
    {
      "med_id": "SULFA_GLIN",
      "nom_classe": "Sulfamides hypoglycémiants et Glinides",
      "sous_classes_exemples": "Glibenclamide, Glimépiride, Répaglinide, Glipizide, Gliclazide",
      "categorie_pharmacologique": "Antidiabétiques oraux",
      "code_atc_principal": "A10BB"
    },
    {
      "med_id": "DIGOXINE",
      "nom_classe": "Digoxine",
      "sous_classes_exemples": "Digoxine, Digitoxine",
      "categorie_pharmacologique": "Glycosides cardiaques",
      "code_atc_principal": "C01AA"
    },
    {
      "med_id": "AMIODARONE",
      "nom_classe": "Amiodarone",
      "sous_classes_exemples": "Amiodarone",
      "categorie_pharmacologique": "Antiarythmique classe III",
      "code_atc_principal": "C01BD01"
    },
    {
      "med_id": "ANTIARYTHMIQUE_I",
      "nom_classe": "Antiarythmiques classe I et Dronédarone",
      "sous_classes_exemples": "Quinidine, Disopyramide, Hydroquinidine (Ia), Flécaïnide (Ic), Dronédarone",
      "categorie_pharmacologique": "Antiarythmiques",
      "code_atc_principal": "C01B"
    },
    {
      "med_id": "AVK",
      "nom_classe": "Anticoagulants AVK / Rivaroxaban au long cours",
      "sous_classes_exemples": "Warfarine, Acénocoumarol, Fluindione, Rivaroxaban (FA long cours)",
      "categorie_pharmacologique": "Anticoagulants",
      "code_atc_principal": "B01AA"
    },
    {
      "med_id": "IPP",
      "nom_classe": "Inhibiteurs de la pompe à protons",
      "sous_classes_exemples": "Oméprazole, Ésoméprazole, Pantoprazole, Lansoprazole, Rabéprazole",
      "categorie_pharmacologique": "Antiulcéreux",
      "code_atc_principal": "A02BC"
    },
    {
      "med_id": "ANTI_H2",
      "nom_classe": "Anti-sécrétoires H2",
      "sous_classes_exemples": "Cimétidine, Ranitidine, Famotidine, Nizatidine",
      "categorie_pharmacologique": "Antiulcéreux H2",
      "code_atc_principal": "A02BA"
    },
    {
      "med_id": "NITRATES",
      "nom_classe": "Dérivés nitrés (abus ou long cours)",
      "sous_classes_exemples": "Trinitrate de glycéryle, Isosorbide dinitrate, Isosorbide mononitrate",
      "categorie_pharmacologique": "Antiangineux",
      "code_atc_principal": "C01D"
    },
    {
      "med_id": "OPIOIDES",
      "nom_classe": "Opioïdes (antalgiques de palier II-III)",
      "sous_classes_exemples": "Morphine, Codéine, Tramadol, Oxycodone, Hydromorphone, Buprénorphine, Fentanyl, Péthidine",
      "categorie_pharmacologique": "Antalgiques opioïdes",
      "code_atc_principal": "N02A"
    },
    {
      "med_id": "ISRS",
      "nom_classe": "Inhibiteurs sélectifs de la recapture de la sérotonine",
      "sous_classes_exemples": "Sertraline, Escitalopram, Citalopram, Fluoxétine, Paroxétine, Fluvoxamine",
      "categorie_pharmacologique": "Antidépresseurs",
      "code_atc_principal": "N06AB"
    },
    {
      "med_id": "METFORMINE",
      "nom_classe": "Metformine",
      "sous_classes_exemples": "Metformine",
      "categorie_pharmacologique": "Antidiabétique biguanide",
      "code_atc_principal": "A10BA02"
    },
    {
      "med_id": "IEC",
      "nom_classe": "Inhibiteurs de l'enzyme de conversion",
      "sous_classes_exemples": "Périndopril, Énalapril, Ramipril, Lisinopril",
      "categorie_pharmacologique": "Antihypertenseurs / cardioprotecteurs",
      "code_atc_principal": "C09A"
    },
    {
      "med_id": "ARA2",
      "nom_classe": "Antagonistes des récepteurs de l'angiotensine II",
      "sous_classes_exemples": "Valsartan, Losartan, Candésartan, Irbésartan, Olmésartan",
      "categorie_pharmacologique": "Antihypertenseurs",
      "code_atc_principal": "C09C"
    },
    {
      "med_id": "BB",
      "nom_classe": "Bêta-bloquants",
      "sous_classes_exemples": "Bisoprolol, Métoprolol, Carvédilol, Nébivolol, Propranolol, Aténolol",
      "categorie_pharmacologique": "Antihypertenseurs / antiarythmiques",
      "code_atc_principal": "C07A"
    },
    {
      "med_id": "CA",
      "nom_classe": "Inhibiteurs calciques",
      "sous_classes_exemples": "Amlodipine, Lercanidipine, Vérapamil, Diltiazem, Félodipine",
      "categorie_pharmacologique": "Antihypertenseurs / antiangineux",
      "code_atc_principal": "C08"
    },
    {
      "med_id": "STATINES",
      "nom_classe": "Statines (inhibiteurs HMG-CoA réductase)",
      "sous_classes_exemples": "Atorvastatine, Rosuvastatine, Simvastatine, Pravastatine",
      "categorie_pharmacologique": "Hypolipémiants",
      "code_atc_principal": "C10AA"
    },
    {
      "med_id": "BIPHOSPHONATES",
      "nom_classe": "Bisphosphonates",
      "sous_classes_exemples": "Alendronate, Risédronate, Zolédronate, Ibandronate",
      "categorie_pharmacologique": "Antirésorptifs osseux",
      "code_atc_principal": "M05BA"
    },
    {
      "med_id": "DENOSUMAB",
      "nom_classe": "Dénosumab",
      "sous_classes_exemples": "Dénosumab",
      "categorie_pharmacologique": "Antirésorptif osseux (anticorps anti-RANKL)",
      "code_atc_principal": "M05BX04"
    },
    {
      "med_id": "CALCIUM_VITD",
      "nom_classe": "Calcium + Vitamine D",
      "sous_classes_exemples": "Cholécalciférol, Carbonate de calcium, Calcitriol",
      "categorie_pharmacologique": "Suppléments minéraux / vitaminiques",
      "code_atc_principal": "A12AA"
    },
    {
      "med_id": "AOD",
      "nom_classe": "Anticoagulants oraux directs",
      "sous_classes_exemples": "Apixaban, Rivaroxaban, Dabigatran, Édoxaban",
      "categorie_pharmacologique": "Anticoagulants oraux",
      "code_atc_principal": "B01A"
    },
    {
      "med_id": "ANTIAGREG",
      "nom_classe": "Antiagrégants plaquettaires",
      "sous_classes_exemples": "Aspirine ≤ 100 mg, Clopidogrel, Ticagrélor, Ticlopidine, Dipyridamole",
      "categorie_pharmacologique": "Antithrombotiques",
      "code_atc_principal": "B01AC"
    },
    {
      "med_id": "COLCHICINE",
      "nom_classe": "Colchicine",
      "sous_classes_exemples": "Colchicine",
      "categorie_pharmacologique": "Antigoutte",
      "code_atc_principal": "M04AC01"
    },
    {
      "med_id": "NITROFURANT",
      "nom_classe": "Nitrofurantoïne",
      "sous_classes_exemples": "Nitrofurantoïne",
      "categorie_pharmacologique": "Antibiotique urinaire",
      "code_atc_principal": "J01XE01"
    },
    {
      "med_id": "SPIRO",
      "nom_classe": "Antagonistes de l'aldostérone / Diurétiques épargnants K⁺",
      "sous_classes_exemples": "Spironolactone, Éplérénone, Amiloride, Triamtérène",
      "categorie_pharmacologique": "Diurétiques épargnants K⁺",
      "code_atc_principal": "C03D"
    },
    {
      "med_id": "ACHECHOLINESTINHIBITEURS",
      "nom_classe": "Inhibiteurs de l'acétylcholinestérase",
      "sous_classes_exemples": "Donépézil, Galantamine, Rivastigmine",
      "categorie_pharmacologique": "Médicaments anti-Alzheimer",
      "code_atc_principal": "N06DA"
    },
    {
      "med_id": "MEMANTINE",
      "nom_classe": "Mémantine",
      "sous_classes_exemples": "Mémantine",
      "categorie_pharmacologique": "Médicament anti-Alzheimer",
      "code_atc_principal": "N06DX01"
    },
    {
      "med_id": "BACLOFENE",
      "nom_classe": "Baclofène",
      "sous_classes_exemples": "Baclofène",
      "categorie_pharmacologique": "Myorelaxant",
      "code_atc_principal": "M03BX01"
    },
    {
      "med_id": "GABAPENTINOÏDES",
      "nom_classe": "Gabapentinoïdes",
      "sous_classes_exemples": "Gabapentine, Prégabaline",
      "categorie_pharmacologique": "Anticonvulsivants / antalgiques neuropathiques",
      "code_atc_principal": "N03AX"
    },
    {
      "med_id": "TRAMADOL",
      "nom_classe": "Tramadol",
      "sous_classes_exemples": "Tramadol",
      "categorie_pharmacologique": "Antalgique opioïde faible",
      "code_atc_principal": "N02AX02"
    },
    {
      "med_id": "LITHIUM",
      "nom_classe": "Lithium",
      "sous_classes_exemples": "Carbonate de lithium, Gluconate de lithium",
      "categorie_pharmacologique": "Thymorégulateur",
      "code_atc_principal": "N05AN01"
    },
    {
      "med_id": "PHENYTOÏNE",
      "nom_classe": "Phénytoïne",
      "sous_classes_exemples": "Phénytoïne, Fosphénytoïne",
      "categorie_pharmacologique": "Anticonvulsivant",
      "code_atc_principal": "N03AB02"
    },
    {
      "med_id": "COTRIMOXAZOLE",
      "nom_classe": "Triméthoprime-Sulfaméthoxazole (Cotrimoxazole)",
      "sous_classes_exemples": "TMP-SMX, Co-trimoxazole",
      "categorie_pharmacologique": "Antibiotique",
      "code_atc_principal": "J01EE01"
    },
    {
      "med_id": "DIURETIQUES_ANSE",
      "nom_classe": "Diurétiques de l'anse",
      "sous_classes_exemples": "Furosémide, Bumétanide, Torasémide",
      "categorie_pharmacologique": "Diurétiques",
      "code_atc_principal": "C03C"
    },
    {
      "med_id": "INSULINE",
      "nom_classe": "Insuline",
      "sous_classes_exemples": "Insuline basale, rapide, prémixée",
      "categorie_pharmacologique": "Antidiabétiques injectables",
      "code_atc_principal": "A10A"
    },
    {
      "med_id": "FLUOROQUINOLONES",
      "nom_classe": "Fluoroquinolones",
      "sous_classes_exemples": "Ciprofloxacine, Lévofloxacine, Ofloxacine, Norfloxacine",
      "categorie_pharmacologique": "Antibiotiques quinolones",
      "code_atc_principal": "J01MA"
    },
    {
      "med_id": "MACROLIDES",
      "nom_classe": "Macrolides",
      "sous_classes_exemples": "Clarithromycine, Érythromycine, Azithromycine, Roxithromycine, Spiramycine",
      "categorie_pharmacologique": "Antibiotiques macrolides",
      "code_atc_principal": "J01FA"
    },
    {
      "med_id": "VACC_GRIPPE",
      "nom_classe": "Vaccin grippe",
      "sous_classes_exemples": "Grippe (saisonnier)",
      "categorie_pharmacologique": "Vaccins",
      "code_atc_principal": "J07BB"
    },
    {
      "med_id": "VACC_PNEUMO",
      "nom_classe": "Vaccin pneumocoque",
      "sous_classes_exemples": "PCV20, PCV13, PPV23",
      "categorie_pharmacologique": "Vaccins",
      "code_atc_principal": "J07AL"
    },
    {
      "med_id": "VACC_ZONA",
      "nom_classe": "Vaccin zona",
      "sous_classes_exemples": "Vaccin zona recombinant (Shingrix)",
      "categorie_pharmacologique": "Vaccins",
      "code_atc_principal": "J07BK"
    },
    {
      "med_id": "IPP_GI",
      "nom_classe": "Probiotiques",
      "sous_classes_exemples": "Lactobacillus spp., Saccharomyces boulardii",
      "categorie_pharmacologique": "Probiotiques",
      "code_atc_principal": "A07FA"
    },
    {
      "med_id": "ACIDE_FOLIQUE",
      "nom_classe": "Acide folique",
      "sous_classes_exemples": "Acide folique, Méthylfolate",
      "categorie_pharmacologique": "Vitamines du groupe B",
      "code_atc_principal": "B03BB01"
    },
    {
      "med_id": "L_DOPA",
      "nom_classe": "L-DOPA et associations",
      "sous_classes_exemples": "Lévodopa, Lévodopa/carbidopa, Lévodopa/benzérazide",
      "categorie_pharmacologique": "Antiparkinsoniens",
      "code_atc_principal": "N04BA"
    },
    {
      "med_id": "DULOXETINE",
      "nom_classe": "Duloxétine",
      "sous_classes_exemples": "Duloxétine",
      "categorie_pharmacologique": "Antidépresseur ISRN",
      "code_atc_principal": "N06AX21"
    },
    {
      "med_id": "VENLAFAXINE",
      "nom_classe": "Venlafaxine",
      "sous_classes_exemples": "Venlafaxine",
      "categorie_pharmacologique": "Antidépresseur ISRN",
      "code_atc_principal": "N06AX16"
    },
    {
      "med_id": "ALLOPURINOL",
      "nom_classe": "Inhibiteur xanthine-oxydase",
      "sous_classes_exemples": "Allopurinol, Fébuxostat",
      "categorie_pharmacologique": "Médicaments anti-goutte",
      "code_atc_principal": "M04AA01"
    },
    {
      "med_id": "METHOTREXATE",
      "nom_classe": "Méthotrexate",
      "sous_classes_exemples": "Méthotrexate hebdomadaire",
      "categorie_pharmacologique": "Immunomodulateurs / Antinéoplasiques",
      "code_atc_principal": "L04AX03"
    },
    {
      "med_id": "OXYGENE",
      "nom_classe": "Oxygénothérapie",
      "sous_classes_exemples": "O2 longue durée domicile",
      "categorie_pharmacologique": "Thérapie respiratoire",
      "code_atc_principal": "N/A"
    },
    {
      "med_id": "ESTROGENES_LOC",
      "nom_classe": "Œstrogènes vaginaux (topiques)",
      "sous_classes_exemples": "Promestriène, Estriol local",
      "categorie_pharmacologique": "Hormones sexuelles locales",
      "code_atc_principal": "G03C (local)"
    },
    {
      "med_id": "DABIGATRAN",
      "nom_classe": "Dabigatran",
      "sous_classes_exemples": "Dabigatran étexilate",
      "categorie_pharmacologique": "Anticoagulant oral direct (IDT)",
      "code_atc_principal": "B01AE07"
    },
    {
      "med_id": "LAXATIFS",
      "nom_classe": "Laxatifs osmotiques",
      "sous_classes_exemples": "Macrogol, Lactulose",
      "categorie_pharmacologique": "Laxatifs",
      "code_atc_principal": "A06AC"
    },
    {
      "med_id": "THEOPHYLLINE",
      "nom_classe": "Théophylline",
      "sous_classes_exemples": "Théophylline",
      "categorie_pharmacologique": "Bronchodilatateur xanthine",
      "code_atc_principal": "R03DA04"
    },
    {
      "med_id": "DONEPEZIL_GALANT",
      "nom_classe": "Inhibiteurs de l'AChE spécifiques",
      "sous_classes_exemples": "Donépézil, Galantamine, Rivastigmine",
      "categorie_pharmacologique": "Médicaments Alzheimer",
      "code_atc_principal": "N06DA"
    },
    {
      "med_id": "SGLT2",
      "nom_classe": "Inhibiteurs SGLT2",
      "sous_classes_exemples": "Empagliflozine, Dapagliflozine, Canagliflozine",
      "categorie_pharmacologique": "Antidiabétiques",
      "code_atc_principal": "A10BK"
    },
    {
      "med_id": "GLP1",
      "nom_classe": "Analogues du GLP-1",
      "sous_classes_exemples": "Sémaglutide, Liraglutide, Exénatide",
      "categorie_pharmacologique": "Antidiabétiques",
      "code_atc_principal": "A10BJ"
    },
    {
      "med_id": "DPP4",
      "nom_classe": "Inhibiteurs DPP-4",
      "sous_classes_exemples": "Sitagliptine, Vildagliptine, Saxagliptine, Alogliptine",
      "categorie_pharmacologique": "Antidiabétiques",
      "code_atc_principal": "A10BH"
    },
    {
      "med_id": "LAMA",
      "nom_classe": "LAMA (bronchodilatateurs anticholinergiques longue durée)",
      "sous_classes_exemples": "Tiotropium, Aclidinium, Glycopyrronium, Uméclidinium",
      "categorie_pharmacologique": "Bronchodilatateurs",
      "code_atc_principal": "R03BB"
    },
    {
      "med_id": "LABA",
      "nom_classe": "LABA (bêta2-agonistes longue durée)",
      "sous_classes_exemples": "Salmétérol, Formotérol, Indacatérol, Olodatérol",
      "categorie_pharmacologique": "Bronchodilatateurs",
      "code_atc_principal": "R03AC"
    },
    {
      "med_id": "CSI",
      "nom_classe": "Corticostéroïdes inhalés",
      "sous_classes_exemples": "Budésonide, Fluticasone, Béclométhasone",
      "categorie_pharmacologique": "Corticoïdes inhalés",
      "code_atc_principal": "R03BA"
    }
  ],
  "comorbidites": [
    {
      "comorb_id": "DEMENCE",
      "nom": "Démence / Troubles neurocognitifs majeurs",
      "systeme": "Neurologie/Psychiatrie",
      "precisions": "Alzheimer, Lewy, vasculaire, frontotemporal"
    },
    {
      "comorb_id": "DELIRIUM",
      "nom": "Délirium / Syndrome confusionnel aigu",
      "systeme": "Neurologie/Psychiatrie",
      "precisions": "Agitation, confusion aiguë, SCA"
    },
    {
      "comorb_id": "CHUTES",
      "nom": "Antécédents de chutes / Haut risque de chute",
      "systeme": "Gériatrie transversale",
      "precisions": "Chutes récurrentes, fractures de fragilité"
    },
    {
      "comorb_id": "PARKINSON",
      "nom": "Maladie de Parkinson",
      "systeme": "Neurologie",
      "precisions": "Parkinson idiopathique, syndromes parkinsoniens"
    },
    {
      "comorb_id": "DEPRESSION",
      "nom": "Dépression majeure",
      "systeme": "Psychiatrie",
      "precisions": "Episode dépressif caractérisé, dépression résistante"
    },
    {
      "comorb_id": "ANXIETE",
      "nom": "Anxiété sévère persistante",
      "systeme": "Psychiatrie",
      "precisions": "TAG, anxiété généralisée"
    },
    {
      "comorb_id": "INSOMNIE",
      "nom": "Insomnie chronique",
      "systeme": "Psychiatrie/Gériatrie",
      "precisions": "Insomnie d'endormissement et/ou de maintien"
    },
    {
      "comorb_id": "HTA",
      "nom": "Hypertension artérielle",
      "systeme": "Cardiovasculaire",
      "precisions": "TAs ≥ 140 mmHg robuste, ≥ 160 mmHg fragile"
    },
    {
      "comorb_id": "IC_SYSTOLIQUE",
      "nom": "Insuffisance cardiaque systolique (HFrEF)",
      "systeme": "Cardiovasculaire",
      "precisions": "FEVG < 40%, IC congestive"
    },
    {
      "comorb_id": "FA",
      "nom": "Fibrillation auriculaire",
      "systeme": "Cardiovasculaire",
      "precisions": "Paroxystique, persistante ou permanente"
    },
    {
      "comorb_id": "POST_SCA",
      "nom": "Athérosclérose confirmée / Post-SCA",
      "systeme": "Cardiovasculaire",
      "precisions": "Post-IDM, post-AVC, AOMI, angor stable"
    },
    {
      "comorb_id": "IRC",
      "nom": "Insuffisance rénale chronique",
      "systeme": "Néphrologie",
      "precisions": "CKD stade 3a–5, DFG < 60 ml/min/1,73m²"
    },
    {
      "comorb_id": "DIABETE",
      "nom": "Diabète de type 2",
      "systeme": "Endocrinologie",
      "precisions": "DT2 chez sujet âgé"
    },
    {
      "comorb_id": "OSTEOPOROSE",
      "nom": "Ostéoporose confirmée",
      "systeme": "Rhumatologie",
      "precisions": "T-score < -2,5 DS et/ou fracture de fragilité"
    },
    {
      "comorb_id": "RISQUE_CHUTES_OSTEOPENIE",
      "nom": "Ostéopénie / Risque chutes sans ostéoporose",
      "systeme": "Rhumatologie",
      "precisions": "T-score -2,5 à -1 DS, confinement"
    },
    {
      "comorb_id": "CORTICOTHERAPIE",
      "nom": "Corticothérapie systémique > 3 mois",
      "systeme": "Transversale",
      "precisions": "Maladies inflammatoires chroniques"
    },
    {
      "comorb_id": "HBP",
      "nom": "Hypertrophie bénigne de la prostate / Prostatisme",
      "systeme": "Urologie",
      "precisions": "LUTS obstructifs, pas d'indication opératoire"
    },
    {
      "comorb_id": "INCONTINENT_URINAIRE",
      "nom": "Incontinence urinaire",
      "systeme": "Gériatrie/Urologie",
      "precisions": "Urgentiste, effort, mixte"
    },
    {
      "comorb_id": "GOUTTE",
      "nom": "Goutte récurrente",
      "systeme": "Rhumatologie",
      "precisions": "Hyperuricémie avec arthrite goutteuse"
    },
    {
      "comorb_id": "PR",
      "nom": "Polyarthrite rhumatoïde active",
      "systeme": "Rhumatologie",
      "precisions": "PR traitée / en poussée"
    },
    {
      "comorb_id": "BPCO_LEGER",
      "nom": "BPCO stade léger à modéré (Gold 1-2)",
      "systeme": "Pneumologie",
      "precisions": "VEMS ≥ 50%, peu symptomatique"
    },
    {
      "comorb_id": "BPCO_SEVERE",
      "nom": "BPCO stade sévère (Gold 3-4)",
      "systeme": "Pneumologie",
      "precisions": "VEMS < 50%, exacerbations fréquentes"
    },
    {
      "comorb_id": "HYPOXIE",
      "nom": "Hypoxie chronique (pO₂ < 60 mmHg)",
      "systeme": "Pneumologie",
      "precisions": "BPCO sévère ou IR respiratoire chronique"
    },
    {
      "comorb_id": "DEPRESSION_MA",
      "nom": "Maladie d'Alzheimer (cognition)",
      "systeme": "Neurologie",
      "precisions": "Stade léger à avancé, SCPD"
    },
    {
      "comorb_id": "CORPS_LEWY",
      "nom": "Démence à corps de Lewy",
      "systeme": "Neurologie",
      "precisions": "Fluctuations, hallucinations, syndrome parkinsonien"
    },
    {
      "comorb_id": "TREMBLEMENT_ESSENTIEL",
      "nom": "Tremblement essentiel",
      "systeme": "Neurologie",
      "precisions": "Tremblement d'action, non parkinsonien"
    },
    {
      "comorb_id": "JAMBES_SANS_REPOS",
      "nom": "Syndrome des jambes sans repos",
      "systeme": "Neurologie",
      "precisions": "Exclusion carence martiale et IRC sévère"
    },
    {
      "comorb_id": "CONSTIPATION",
      "nom": "Constipation chronique",
      "systeme": "Gastroentérologie",
      "precisions": "Idiopathique ou iatrogène (opioïdes, immobilité)"
    },
    {
      "comorb_id": "RGO_ULCERE",
      "nom": "Reflux gastro-œsophagien sévère / Ulcère peptique",
      "systeme": "Gastroentérologie",
      "precisions": "FOGD documentée, sténose peptique"
    },
    {
      "comorb_id": "HP",
      "nom": "Ulcère peptique à Helicobacter pylori",
      "systeme": "Gastroentérologie",
      "precisions": "Nécessite éradication"
    },
    {
      "comorb_id": "VAGINITE",
      "nom": "Vaginite atrophique / IU récurrentes (femme)",
      "systeme": "Gynécologie/Urologie",
      "precisions": "Femme ménopausée"
    },
    {
      "comorb_id": "IU_EFFORT",
      "nom": "Incontinence urinaire d'effort (femme)",
      "systeme": "Urologie/Gynécologie",
      "precisions": "Incontinence à l'effort"
    },
    {
      "comorb_id": "DYSFONC_ERECT",
      "nom": "Dysfonction érectile invalidante",
      "systeme": "Urologie",
      "precisions": "Sans CI cardiovasculaire"
    },
    {
      "comorb_id": "MICROALBUMINURIE",
      "nom": "Diabète avec microalbuminurie / néphropathie",
      "systeme": "Néphrologie",
      "precisions": "Albuminurie > 30 mg/g"
    },
    {
      "comorb_id": "IRC_MINERAL",
      "nom": "IRC avec complications minérales",
      "systeme": "Néphrologie",
      "precisions": "DFG < 30 + hypocalcémie/hyperparathyroïdie/anémie"
    },
    {
      "comorb_id": "PATIENT_TRES_FRAGILE",
      "nom": "Patient très fragile / Soins palliatifs",
      "systeme": "Gériatrie",
      "precisions": "STOPPFrail : espérance de vie < 1 an ou Frailty Index sévère"
    },
    {
      "comorb_id": "HYPOTENSION_ORTHOSTATIQUE",
      "nom": "Hypotension orthostatique confirmée",
      "systeme": "Gériatrie/Cardiovasculaire",
      "precisions": "Chute ≥ 20 mmHg systolique en orthostatisme"
    },
    {
      "comorb_id": "SCPD",
      "nom": "Symptômes comportementaux et psychologiques de la démence",
      "systeme": "Neurologie/Psychiatrie",
      "precisions": "SCPD : agitation, agressivité, hallucinations"
    },
    {
      "comorb_id": "BRADYCARDIE",
      "nom": "Bradycardie / Bloc auriculo-ventriculaire",
      "systeme": "Cardiovasculaire",
      "precisions": "FC < 55/min, BAV, syncope inexpliquée"
    },
    {
      "comorb_id": "GLAUCOME",
      "nom": "Glaucome primaire à angle ouvert",
      "systeme": "Ophtalmologie",
      "precisions": "GPAO"
    },
    {
      "comorb_id": "CARENCE_MARTIALE",
      "nom": "Carence martiale",
      "systeme": "Hématologie",
      "precisions": "Ferritine < 100 ng/mL ou CST < 20%"
    },
    {
      "comorb_id": "VACCINATIONS",
      "nom": "Âge ≥ 65 ans — Vaccinations recommandées",
      "systeme": "Médecine préventive",
      "precisions": "Grippe, pneumocoque, zona, COVID-19"
    },
    {
      "comorb_id": "MTX_TRAITEMENT",
      "nom": "Traitement par Méthotrexate hebdomadaire",
      "systeme": "Rhumatologie/Oncologie",
      "precisions": "PR, psoriasis, cancer"
    },
    {
      "comorb_id": "ATBS_PROPHYLAXIE",
      "nom": "Prise d'antibiotiques",
      "systeme": "Infectiologie",
      "precisions": "Antibiothérapie courte, risque C. difficile"
    },
    {
      "comorb_id": "DOULEUR_CHRONIQUE",
      "nom": "Douleur chronique",
      "systeme": "Gériatrie transversale",
      "precisions": "Toute douleur chronique ≥ 3 mois, palier adapté"
    },
    {
      "comorb_id": "DENOSUMAB_ARRET",
      "nom": "Interruption Dénosumab > 12 mois",
      "systeme": "Rhumatologie",
      "precisions": "Relais obligatoire bisphosphonate"
    }
  ],
  "biologie": [
    {
      "bio_id": "DFG",
      "nom": "DFG (débit de filtration glomérulaire)",
      "unite": "ml/min/1,73 m²",
      "valeur_normale": "≥ 60",
      "commentaire": "Mesure ou estimation (CKD-EPI, MDRD). Seuils clés : 80, 60, 50, 45, 30, 15."
    },
    {
      "bio_id": "CREATININE",
      "nom": "Créatinine sérique",
      "unite": "µmol/L (ou mg/dL)",
      "valeur_normale": "<106 µmol/L",
      "commentaire": "Doit toujours être interprétée avec le DFG estimé."
    },
    {
      "bio_id": "HBA1C",
      "nom": "HbA1c (glycémie chronique)",
      "unite": "%",
      "valeur_normale": "Cible ≥ 65 ans : < 7% (robuste) / < 8% (fragile)",
      "commentaire": "STOPPFrail : ne pas intensifier si HbA1c < 8% chez fragile."
    },
    {
      "bio_id": "DIGOXINEMIE",
      "nom": "Digoxinémie sérique",
      "unite": "µg/L",
      "valeur_normale": "0,5–1,2",
      "commentaire": "Cible gériatrique. Doser 6–8h après la prise. Toxicité > 1,5 µg/L."
    },
    {
      "bio_id": "INR",
      "nom": "INR (International Normalized Ratio)",
      "unite": "ratio",
      "valeur_normale": "2–3 (FA non valvulaire)",
      "commentaire": "CI AVK. Contrôle rapproché si interaction."
    },
    {
      "bio_id": "KALIEMIE",
      "nom": "Kaliémie",
      "unite": "mmol/L",
      "valeur_normale": "3,5–5,0",
      "commentaire": "Hyperkaliémie > 5,5 : risque IC, BAV. Hypokaliémie < 3,5 : arythmies."
    },
    {
      "bio_id": "NATREMIE",
      "nom": "Natrémie",
      "unite": "mmol/L",
      "valeur_normale": "135–145",
      "commentaire": "Hyponatrémie < 135. SIADH avec ISRS, Carbamazépine, Venlafaxine."
    },
    {
      "bio_id": "QTC",
      "nom": "QTc (QT corrigé à l'ECG)",
      "unite": "ms",
      "valeur_normale": "< 450 (H) / < 470 (F)",
      "commentaire": "Risque de torsade de pointes > 500 ms."
    },
    {
      "bio_id": "LITHEMIE",
      "nom": "Lithémie sérique",
      "unite": "mmol/L",
      "valeur_normale": "0,6–1,2",
      "commentaire": "Toxicité probable > 1,5 mmol/L."
    },
    {
      "bio_id": "PHENYTOÏNEMIE",
      "nom": "Phénytoinémie",
      "unite": "mg/L",
      "valeur_normale": "10–20",
      "commentaire": "Marge étroite. Hypoalbuminémie → interpréter la fraction libre."
    },
    {
      "bio_id": "T_SCORE",
      "nom": "T-score ostéodensitométrique (DMO)",
      "unite": "écart-type",
      "valeur_normale": "≥ -1",
      "commentaire": "Ostéoporose < -2,5 DS. Ostéopénie -2,5 à -1 DS."
    },
    {
      "bio_id": "PO2",
      "nom": "pO₂ (pression partielle oxygène artériel)",
      "unite": "mmHg",
      "valeur_normale": "80–100",
      "commentaire": "Indication O2LDD si pO₂ < 60 mmHg au repos."
    },
    {
      "bio_id": "SAO2",
      "nom": "SaO₂ (saturation en oxygène)",
      "unite": "%",
      "valeur_normale": "95–100",
      "commentaire": "O2LDD si SaO₂ < 89%."
    },
    {
      "bio_id": "FERRITINE",
      "nom": "Ferritine sérique",
      "unite": "ng/mL",
      "valeur_normale": "> 100",
      "commentaire": "Carence si < 100 ng/mL. À interpréter avec CRP (syndrome inflammatoire)."
    },
    {
      "bio_id": "CST",
      "nom": "Coefficient de saturation de la transferrine",
      "unite": "%",
      "valeur_normale": "20–45",
      "commentaire": "Carence si CST < 20%."
    },
    {
      "bio_id": "NFS",
      "nom": "NFS (numération formule sanguine)",
      "unite": "multi",
      "valeur_normale": "Hb > 12 g/dL femme, > 13 g/dL homme",
      "commentaire": "Anémie, thrombopénie, leucopénie en lien avec traitements."
    },
    {
      "bio_id": "ALBUMINURIE",
      "nom": "Albuminurie (microalbuminurie)",
      "unite": "mg/g créatinine",
      "valeur_normale": "< 30",
      "commentaire": "Microalbuminurie ≥ 30 mg/g → IEC/ARA II si DFG > 30."
    },
    {
      "bio_id": "FC",
      "nom": "Fréquence cardiaque",
      "unite": "bat/min",
      "valeur_normale": "60–80",
      "commentaire": "Bradycardie FC < 55 bat/min : surveiller Inh.AChE + bradycardisants."
    },
    {
      "bio_id": "VEMS",
      "nom": "VEMS (volume expiratoire maximal seconde)",
      "unite": "L ou % théorique",
      "valeur_normale": "Dépend taille/âge/sexe",
      "commentaire": "Gold BPCO : < 50% = sévère."
    }
  ],
  "regles_eviter": [
    {
      "regle_id": "EV001",
      "med_id": "AC",
      "comorb_ids_principaux": "DEMENCE|DELIRIUM|CHUTES|HBP|INCONTINENT_URINAIRE|PARKINSON|INSOMNIE|PATIENT_TRES_FRAGILE",
      "action": "ÉVITER",
      "rationnel": "Charge anticholinergique : déclin cognitif, délirium, rétention urinaire, chutes. Score ACB/ADS à évaluer.",
      "sources": "BEERS 2023, STOPP v3, REMEDIES, EU(7)-PIM, PRISCUS, FORTA, STOPPFrail",
      "divergences": "Consensus absolu. Nuances par sous-classe (voir antispasmodiques urinaires EU-PIM)."
    },
    {
      "regle_id": "EV002",
      "med_id": "BZD",
      "comorb_ids_principaux": "DEMENCE|DELIRIUM|CHUTES|INSOMNIE|PATIENT_TRES_FRAGILE",
      "action": "ÉVITER / Doses réduites",
      "rationnel": "Sédation, ataxie, dépendance. Z-drugs : profil similaire aux BZD.",
      "sources": "BEERS 2023, STOPP v3, REMEDIES, EU(7)-PIM, PRISCUS, FORTA, STOPPFrail",
      "divergences": "Z-drugs : BEERS évite, FORTA C, EU-PIM tolère ≤ demi-dose. Durée max : anxiolytiques ≤ 12 sem, hypnotiques ≤ 4 sem (REMEDI[e]S)."
    },
    {
      "regle_id": "EV003",
      "med_id": "AP",
      "comorb_ids_principaux": "DEMENCE|CHUTES|PARKINSON|PATIENT_TRES_FRAGILE",
      "action": "ÉVITER sauf urgence ou SCPD menaçant",
      "rationnel": "Surmortalité en démence (×1,6–1,9), AVC, déclin cognitif, syndrome extrapyramidal.",
      "sources": "BEERS 2023, STOPP v3, REMEDIES, EU(7)-PIM, FORTA, STOPPFrail",
      "divergences": "BEERS tolère si danger immédiat. FORTA C pour Rispéridone/Quétiapine en SCPD. STOPPFrail D1 : arrêter si > 12 sem sans SCPD actifs."
    },
    {
      "regle_id": "EV004",
      "med_id": "AINS",
      "comorb_ids_principaux": "IC_SYSTOLIQUE|IRC|DOULEUR_CHRONIQUE|PATIENT_TRES_FRAGILE|HYPOTENSION_ORTHOSTATIQUE",
      "action": "ÉVITER (chronique) / Adapter si DFG↓",
      "rationnel": "Risque GI, rénal, cardiovasculaire. Association anticoagulant/antiagrégant = contre-indication.",
      "sources": "BEERS 2023, STOPP v3, REMEDIES, EU(7)-PIM, FORTA, STOPPFrail",
      "divergences": "Seuil rénal : STOPP évite si DFG < 50, BEERS/EU-PIM si DFG < 30 → retenir DFG < 50 (plus prudent). STOPPFrail G4 : arrêter si ≥ 2 mois réguliers."
    },
    {
      "regle_id": "EV005",
      "med_id": "ALPHA_HTA",
      "comorb_ids_principaux": "HYPOTENSION_ORTHOSTATIQUE|CHUTES|INCONTINENT_URINAIRE|PATIENT_TRES_FRAGILE",
      "action": "ÉVITER comme antihypertenseur",
      "rationnel": "Hypotension orthostatique, vertiges, incontinence chez la femme, risque syncopal.",
      "sources": "BEERS 2023, STOPP v3, REMEDIES, EU(7)-PIM, FORTA, STOPPFrail",
      "divergences": "FORTA C pour Urapidil (moins sévère que FORTA D). STOPPFrail B2 : arrêter chez tout très fragile."
    },
    {
      "regle_id": "EV006",
      "med_id": "ANTIHTA_CENTRAL",
      "comorb_ids_principaux": "HYPOTENSION_ORTHOSTATIQUE|CHUTES|HTA",
      "action": "ÉVITER",
      "rationnel": "Hypotension orthostatique, bradycardie, sédation centrale.",
      "sources": "FORTA, REMEDIES, EU(7)-PIM, PRISCUS",
      "divergences": "Clonidine : FORTA D. Réserpine : CI si ClCr < 10."
    },
    {
      "regle_id": "EV007",
      "med_id": "ATC",
      "comorb_ids_principaux": "DEPRESSION|DOULEUR_CHRONIQUE|CHUTES|HYPOTENSION_ORTHOSTATIQUE|DELIRIUM",
      "action": "ÉVITER",
      "rationnel": "Anticholinergiques, cardiotoxicité, hypotension orthostatique, déclin cognitif.",
      "sources": "BEERS 2023, STOPP v3, REMEDIES, EU(7)-PIM, FORTA, PRISCUS",
      "divergences": "FORTA D en dépression et si ATC > 10 mg/j en douleur. EU-PIM tolère faibles doses avec ISRS comme alternative."
    },
    {
      "regle_id": "EV008",
      "med_id": "SULFA_GLIN",
      "comorb_ids_principaux": "DIABETE|PATIENT_TRES_FRAGILE",
      "action": "ÉVITER (Glibenclamide) / PRUDENCE (Glimépiride)",
      "rationnel": "Hypoglycémies sévères et prolongées.",
      "sources": "BEERS 2023, REMEDIES, FORTA, EU(7)-PIM, STOPPFrail",
      "divergences": "Glimépiride : FORTA C vs BEERS qui évite tout sulfamide. Alternative : Gliclazide, DPP-4."
    },
    {
      "regle_id": "EV009",
      "med_id": "DIGOXINE",
      "comorb_ids_principaux": "FA|IC_SYSTOLIQUE|IRC",
      "action": "ÉVITER en 1ère ligne / Dose-limiter",
      "rationnel": "Marge étroite, sensibilité accrue, toxicité si IRC.",
      "sources": "BEERS 2023, STOPP v3, REMEDIES, EU(7)-PIM, FORTA",
      "divergences": "FORTA C (moins strict). REMEDI[e]S : max 0,125 mg/j. STOPP arrête si dose ≥ 125 µg/j et DFG < 30."
    },
    {
      "regle_id": "EV010",
      "med_id": "AMIODARONE",
      "comorb_ids_principaux": "FA",
      "action": "ÉVITER en 1ère intention",
      "rationnel": "Toxicités cumulatives thyroïdienne, pulmonaire, hépatique. Demi-vie très longue.",
      "sources": "BEERS 2023, STOPP v3, FORTA, EU(7)-PIM",
      "divergences": "BEERS tolère si IC ou HVG. FORTA C."
    },
    {
      "regle_id": "EV011",
      "med_id": "ANTIARYTHMIQUE_I",
      "comorb_ids_principaux": "IC_SYSTOLIQUE|FA",
      "action": "ÉVITER",
      "rationnel": "Proarythmiques, inotrope négatif, anticholinergiques (Disopyramide).",
      "sources": "BEERS 2023, FORTA, EU(7)-PIM, REMEDIES",
      "divergences": "Consensus. Disopyramide : triple risque."
    },
    {
      "regle_id": "EV012",
      "med_id": "AVK",
      "comorb_ids_principaux": "FA",
      "action": "ÉVITER d'initier (préférer AOD)",
      "rationnel": "Marge thérapeutique étroite, interactions, INR instable.",
      "sources": "BEERS 2023, FORTA",
      "divergences": "Divergence Rivaroxaban : BEERS l'évite en FA long cours (saignements > alternatives). FORTA B pour tous AOD, A pour Apixaban."
    },
    {
      "regle_id": "EV013",
      "med_id": "IPP",
      "comorb_ids_principaux": "PATIENT_TRES_FRAGILE",
      "action": "ARRÊTER si > 8 sem sans indication active",
      "rationnel": "C. difficile, ostéoporose, carence B12/Mg, néphrite interstitielle.",
      "sources": "BEERS 2023, REMEDIES, STOPPFrail",
      "divergences": "STOPPFrail E1 : arrêter dose thérapeutique ≥ 8 sem. IPP INDIQUÉ si AINS ou ulcère actif."
    },
    {
      "regle_id": "EV014",
      "med_id": "ANTI_H2",
      "comorb_ids_principaux": "DEMENCE|DELIRIUM|IRC",
      "action": "ÉVITER si > 8 sem / Adapter si IRC",
      "rationnel": "Confusion, état mental altéré, accumulation si IRC.",
      "sources": "BEERS 2023, REMEDIES, EU(7)-PIM",
      "divergences": "Cimétidine : le plus à risque (interactions enzymatiques). Famotidine : réduire si DFG < 50."
    },
    {
      "regle_id": "EV015",
      "med_id": "THEOPHYLLINE",
      "comorb_ids_principaux": "PATIENT_TRES_FRAGILE",
      "action": "ÉVITER",
      "rationnel": "Marge étroite, interactions, effets SNC.",
      "sources": "STOPPFrail F1",
      "divergences": "STOPPFrail F1 : arrêter chez tout patient très fragile."
    },
    {
      "regle_id": "EV016",
      "med_id": "BB",
      "comorb_ids_principaux": "PARKINSON",
      "action": "PRUDENCE",
      "rationnel": "Aggravation de la bradykinésie (Propranolol non sélectif).",
      "sources": "FORTA, EU(7)-PIM",
      "divergences": "Aténolol : FORTA D en HTA. Autres BB cardiosélectifs : FORTA A en IC et FA."
    }
  ],
  "regles_initier": [
    {
      "regle_id": "IN001",
      "comorb_id": "POST_SCA",
      "med_ids_recommandes": "ANTIAGREG|STATINES|IEC|BB",
      "action": "INITIER — Prévention secondaire",
      "rationnel": "Réduction morbi-mortalité cardiovasculaire secondaire.",
      "sources": "START, REMEDIES",
      "divergences": "Ne pas initier si ≥ 85 ans très fragile (espérance de vie < 3 ans). STOPPFrail arrête statines chez très fragile."
    },
    {
      "regle_id": "IN002",
      "comorb_id": "FA",
      "med_ids_recommandes": "AOD|BB",
      "action": "INITIER après évaluation CHA₂DS₂-VASc et HAS-BLED",
      "rationnel": "Prévention des AVC ischémiques et embolie systémique.",
      "sources": "START, REMEDIES, FORTA",
      "divergences": "Apixaban : FORTA A. Autres AOD : FORTA B. AVK : FORTA B. STOPPFrail ne suspend pas si bien toléré."
    },
    {
      "regle_id": "IN003",
      "comorb_id": "IC_SYSTOLIQUE",
      "med_ids_recommandes": "IEC|BB|SGLT2|SPIRO",
      "action": "INITIER / OPTIMISER — Quadrithérapie de base",
      "rationnel": "Réduction dramatique de la mortalité et des réhospitalisations.",
      "sources": "START, REMEDIES, FORTA",
      "divergences": "Spironolactone : FORTA C, INITIER si DFG > 30 (START), ARRÊTER si DFG < 30 (STOPP). ARNI si IEC insuffisant."
    },
    {
      "regle_id": "IN004",
      "comorb_id": "HTA",
      "med_ids_recommandes": "IEC|CA|BB",
      "action": "INITIER / OPTIMISER",
      "rationnel": "Réduction mortalité cardiovasculaire et rénale.",
      "sources": "START, REMEDIES, FORTA",
      "divergences": "FORTA A : IEC/ARA II, Amlodipine, Indapamide. FORTA C : BB. FORTA D : Aténolol. Max 3 antihypertenseurs."
    },
    {
      "regle_id": "IN005",
      "comorb_id": "DIABETE",
      "med_ids_recommandes": "DPP4|METFORMINE|SGLT2|GLP1|INSULINE",
      "action": "INITIER — Hiérarchie gériatrique",
      "rationnel": "Contrôle glycémique adapté. Éviter les hypoglycémies.",
      "sources": "START, FORTA, STOPPFrail, REMEDIES",
      "divergences": "Cible HbA1c : < 8% chez fragile (STOPPFrail) vs < 7% chez robuste. DPP4 : FORTA A. Glibenclamide : FORTA D."
    },
    {
      "regle_id": "IN006",
      "comorb_id": "MICROALBUMINURIE",
      "med_ids_recommandes": "IEC|ARA2",
      "action": "INITIER sauf si DFG < 30 ml/min",
      "rationnel": "Néphroprotection : réduction de la protéinurie.",
      "sources": "START, REMEDIES",
      "divergences": "STOPPFrail I2/I3 : arrêter si uniquement néphroprotection chez très fragile."
    },
    {
      "regle_id": "IN007",
      "comorb_id": "OSTEOPOROSE",
      "med_ids_recommandes": "CALCIUM_VITD|BIPHOSPHONATES|DENOSUMAB",
      "action": "INITIER",
      "rationnel": "Prévention secondaire des fractures.",
      "sources": "START, REMEDIES, FORTA",
      "divergences": "STOPPFrail G1/G2 arrête chez très fragile (délai d'action osseux trop long). Population différente."
    },
    {
      "regle_id": "IN008",
      "comorb_id": "RISQUE_CHUTES_OSTEOPENIE",
      "med_ids_recommandes": "CALCIUM_VITD",
      "action": "INITIER",
      "rationnel": "Prévention des chutes et fractures de fragilité.",
      "sources": "START, REMEDIES, FORTA",
      "divergences": "Vitamine D seule même sans ostéoporose prouvée si confinement ou chutes récurrentes."
    },
    {
      "regle_id": "IN009",
      "comorb_id": "CORTICOTHERAPIE",
      "med_ids_recommandes": "CALCIUM_VITD|BIPHOSPHONATES",
      "action": "INITIER systématiquement",
      "rationnel": "Prévention de l'ostéoporose cortico-induite.",
      "sources": "START, REMEDIES",
      "divergences": "Co-prescription obligatoire dès 3 mois de corticothérapie systémique."
    },
    {
      "regle_id": "IN010",
      "comorb_id": "IRC_MINERAL",
      "med_ids_recommandes": "CALCIUM_VITD|DIURETIQUES_ANSE",
      "action": "INITIER selon les anomalies biologiques",
      "rationnel": "Traitement des complications minérales de l'IRC.",
      "sources": "START",
      "divergences": "Seuils biologiques précis dans la table seuils_bio_clin."
    },
    {
      "regle_id": "IN011",
      "comorb_id": "DEPRESSION",
      "med_ids_recommandes": "ISRS",
      "action": "INITIER",
      "rationnel": "Traitement de l'épisode dépressif caractérisé.",
      "sources": "START, REMEDIES, FORTA",
      "divergences": "FORTA B : ISRS. FORTA C : Venlafaxine, Mirtazapine. FORTA D : ATC. EU-PIM : Fluvoxamine déconseillée."
    },
    {
      "regle_id": "IN012",
      "comorb_id": "DEPRESSION_MA",
      "med_ids_recommandes": "ACHECHOLINESTINHIBITEURS",
      "action": "INITIER (stade léger–modéré)",
      "rationnel": "Stabilisation transitoire du déclin cognitif.",
      "sources": "START, FORTA",
      "divergences": "CI : bradycardie, syncope inexpliquée. Inh.AChE + bradycardisant = risque BAV. STOPPFrail D2 : arrêter Mémantine si pas de bénéfice SCPD."
    },
    {
      "regle_id": "IN013",
      "comorb_id": "PARKINSON",
      "med_ids_recommandes": "L_DOPA",
      "action": "INITIER",
      "rationnel": "Amélioration de la fonction motrice.",
      "sources": "START, FORTA",
      "divergences": "L-DOPA : FORTA A. ÉVITER Anticholinergiques, Métoclopramide, AP typiques."
    },
    {
      "regle_id": "IN014",
      "comorb_id": "ANXIETE",
      "med_ids_recommandes": "ISRS",
      "action": "INITIER",
      "rationnel": "Anxiolyse de fond sans dépendance.",
      "sources": "START",
      "divergences": "Éviter BZD et Hydroxyzine."
    },
    {
      "regle_id": "IN015",
      "comorb_id": "JAMBES_SANS_REPOS",
      "med_ids_recommandes": "L_DOPA",
      "action": "INITIER",
      "rationnel": "Réduction des symptômes moteurs nocturnes.",
      "sources": "START",
      "divergences": "Éliminer carence martiale et IRC sévère préalablement."
    },
    {
      "regle_id": "IN016",
      "comorb_id": "TREMBLEMENT_ESSENTIEL",
      "med_ids_recommandes": "BB",
      "action": "INITIER",
      "rationnel": "Réduction du tremblement essentiel.",
      "sources": "START",
      "divergences": "Propranolol (BB non sélectif) : exception à la règle EU-PIM dans cette indication spécifique."
    },
    {
      "regle_id": "IN017",
      "comorb_id": "RGO_ULCERE",
      "med_ids_recommandes": "IPP",
      "action": "INITIER si indication prouvée",
      "rationnel": "Gastroprotection documentée.",
      "sources": "START, BEERS 2023, REMEDIES",
      "divergences": "IPP INDIQUÉ si AINS actif ou antécédent d'ulcère. À ARRÊTER si > 8 sem sans indication."
    },
    {
      "regle_id": "IN018",
      "comorb_id": "CONSTIPATION",
      "med_ids_recommandes": "LAXATIFS",
      "action": "INITIER systématiquement (surtout sous opioïdes)",
      "rationnel": "Prévention et traitement de la constipation iatrogène.",
      "sources": "START, REMEDIES",
      "divergences": "Sous opioïdes : laxatif OBLIGATOIRE (omission grave si absent)."
    },
    {
      "regle_id": "IN019",
      "comorb_id": "MTX_TRAITEMENT",
      "med_ids_recommandes": "ACIDE_FOLIQUE",
      "action": "INITIER systématiquement",
      "rationnel": "Prévention des effets indésirables du Méthotrexate.",
      "sources": "START, REMEDIES",
      "divergences": "≥ 5 mg/sem à distance du MTX (48h minimum)."
    },
    {
      "regle_id": "IN020",
      "comorb_id": "HP",
      "med_ids_recommandes": "IPP|MACROLIDES|ACIDE_FOLIQUE",
      "action": "INITIER — Quadrithérapie d'éradication",
      "rationnel": "Éradication H. pylori.",
      "sources": "START",
      "divergences": "Quadrithérapie préférée en France (résistances Clarithromycine)."
    },
    {
      "regle_id": "IN021",
      "comorb_id": "ATBS_PROPHYLAXIE",
      "med_ids_recommandes": "IPP_GI",
      "action": "INITIER",
      "rationnel": "Prévention diarrhée à C. difficile sous antibiotiques.",
      "sources": "START",
      "divergences": "Preuves modérées ; bénéfice/risque favorable chez sujet âgé.\"\"\""
    },
    {
      "regle_id": "IN022",
      "comorb_id": "BPCO_LEGER",
      "med_ids_recommandes": "LAMA|LABA",
      "action": "INITIER",
      "rationnel": "Amélioration du VEMS et réduction des exacerbations.",
      "sources": "START, REMEDIES",
      "divergences": "STOPP : arrêter LAMA si glaucome à angle aigu ou obstruction vésicale."
    },
    {
      "regle_id": "IN023",
      "comorb_id": "BPCO_SEVERE",
      "med_ids_recommandes": "LAMA|LABA|CSI",
      "action": "INITIER — Trithérapie",
      "rationnel": "Réduction des exacerbations sévères.",
      "sources": "START, REMEDIES",
      "divergences": "Corticoïdes INHALÉS uniquement (pas systémiques de fond)."
    },
    {
      "regle_id": "IN024",
      "comorb_id": "HYPOXIE",
      "med_ids_recommandes": "OXYGENE",
      "action": "INITIER si pO₂ < 60 mmHg ou SaO₂ < 89%",
      "rationnel": "Amélioration prouvée de la survie.",
      "sources": "START",
      "divergences": "O2LDD > 15h/j."
    },
    {
      "regle_id": "IN025",
      "comorb_id": "HBP",
      "med_ids_recommandes": "ALPHA_URO",
      "action": "INITIER",
      "rationnel": "Réduction des symptômes urinaires obstructifs.",
      "sources": "START",
      "divergences": "STOPPFrail H1/H2 : arrêter si sonde à demeure. Risque de chutes avec alpha-bloquants."
    },
    {
      "regle_id": "IN026",
      "comorb_id": "VAGINITE",
      "med_ids_recommandes": "ESTROGENES_LOC",
      "action": "INITIER",
      "rationnel": "Restauration trophicité vaginale, prévention IU récurrentes.",
      "sources": "START, BEERS 2023",
      "divergences": "BEERS : exception explicite pour œstrogènes vaginaux à faible dose."
    },
    {
      "regle_id": "IN027",
      "comorb_id": "IU_EFFORT",
      "med_ids_recommandes": "DULOXETINE",
      "action": "INITIER",
      "rationnel": "Amélioration du contrôle sphinctérien.",
      "sources": "START",
      "divergences": "CI si incontinence d'urgence (STOPP)."
    },
    {
      "regle_id": "IN028",
      "comorb_id": "DYSFONC_ERECT",
      "med_ids_recommandes": "CA",
      "action": "INITIER si pas de CI cardiovasculaire",
      "rationnel": "Amélioration qualité de vie.",
      "sources": "START",
      "divergences": "CI absolue si dérivés nitrés (inhibiteurs PDE5 dans START)."
    },
    {
      "regle_id": "IN029",
      "comorb_id": "GOUTTE",
      "med_ids_recommandes": "ALLOPURINOL",
      "action": "INITIER",
      "rationnel": "Prévention des crises de goutte récurrentes.",
      "sources": "START",
      "divergences": "Démarrer à faible dose, ajuster à la fonction rénale."
    },
    {
      "regle_id": "IN030",
      "comorb_id": "PR",
      "med_ids_recommandes": "METHOTREXATE",
      "action": "INITIER (avis rhumatologue)",
      "rationnel": "Réduction du handicap et des destructions articulaires.",
      "sources": "START",
      "divergences": "Acide folique obligatoire en co-prescription."
    },
    {
      "regle_id": "IN031",
      "comorb_id": "DENOSUMAB_ARRET",
      "med_ids_recommandes": "BIPHOSPHONATES",
      "action": "INITIER — Relais obligatoire",
      "rationnel": "Prévention de l'effet rebond ostéoporotique.",
      "sources": "START",
      "divergences": "Arrêt Dénosumab sans relais = danger (rebond de résorption osseuse)."
    },
    {
      "regle_id": "IN032",
      "comorb_id": "VACCINATIONS",
      "med_ids_recommandes": "VACC_GRIPPE|VACC_PNEUMO|VACC_ZONA",
      "action": "INITIER / MAINTENIR",
      "rationnel": "Prévention des infections respiratoires basses et zona.",
      "sources": "START, REMEDIES",
      "divergences": "Absence de vaccin à jour = OMISSION médicale (REMEDI[e]S O-11/12/13)."
    },
    {
      "regle_id": "IN033",
      "comorb_id": "DOULEUR_CHRONIQUE",
      "med_ids_recommandes": "CALCIUM_VITD|OPIOIDES",
      "action": "INITIER selon palier",
      "rationnel": "Paracétamol 1ère ligne. Opioïdes si insuffisant. Éviter AINS longue durée.",
      "sources": "START, FORTA",
      "divergences": "FORTA A : Paracétamol. FORTA B : Oxycodone/Buprénorphine/Hydromorphone. FORTA C : Tramadol. FORTA D : AINS/ATC."
    },
    {
      "regle_id": "IN034",
      "comorb_id": "CARENCE_MARTIALE",
      "med_ids_recommandes": "IC",
      "action": "INITIER (Fer IV si IC + carence martiale)",
      "rationnel": "Correction de la carence martiale en IC systolique.",
      "sources": "START",
      "divergences": "Ferritine < 100 ng/mL ou CST < 20% chez patient IC symptomatique."
    }
  ],
  "seuils_bio_med": [
    {
      "seuil_id": "SBM001",
      "bio_id": "DFG",
      "med_id": "AINS",
      "seuil_valeur_texte": "< 50 ml/min (STOPP) / < 30 ml/min (BEERS)",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": "50",
      "operateur": "<",
      "action": "ÉVITER",
      "sources": "STOPP v3, BEERS 2023, EU(7)-PIM, REMEDIES",
      "divergences": "⚠️ STOPP évite si DFG < 50 ; BEERS/EU-PIM si DFG < 30 → Retenir DFG < 50 (plus prudent)"
    },
    {
      "seuil_id": "SBM002",
      "bio_id": "DFG",
      "med_id": "NITROFURANT",
      "seuil_valeur_texte": "< 45 ml/min (STOPP) / < 30 ml/min (BEERS)",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": "45",
      "operateur": "<",
      "action": "ÉVITER (perte d'efficacité + toxicité)",
      "sources": "STOPP v3, BEERS 2023, EU(7)-PIM",
      "divergences": "STOPP : éviter si DFG < 45 ; BEERS : CrCl < 30 (suppression long terme) ; EU-PIM : max 1 sem quelle que soit la valeur"
    },
    {
      "seuil_id": "SBM003",
      "bio_id": "DFG",
      "med_id": "DABIGATRAN",
      "seuil_valeur_texte": "< 30 ml/min",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "ÉVITER",
      "sources": "BEERS 2023, STOPP v3, PRISCUS",
      "divergences": "Consensus. Risque d'accumulation → hémorragie."
    },
    {
      "seuil_id": "SBM004",
      "bio_id": "DFG",
      "med_id": "AOD",
      "seuil_valeur_texte": "< 15 ml/min (éviter IFXa) ; 15-50 réduire dose",
      "seuil_numerique_bas": "15",
      "seuil_numerique_haut": "50",
      "operateur": "<",
      "action": "ÉVITER (< 15) / Réduire dose (15–50)",
      "sources": "STOPP v3, BEERS 2023",
      "divergences": "Apixaban : ÉVITER si CrCl < 15, réduire si ≥ 2 critères : âge ≥ 80 ans, poids ≤ 60 kg, créatinine ≥ 1,5 mg/dL. Rivaroxaban : réduire si 15-50, éviter si < 15."
    },
    {
      "seuil_id": "SBM005",
      "bio_id": "DFG",
      "med_id": "DIGOXINE",
      "seuil_valeur_texte": "< 30 ml/min (si dose ≥ 125 µg/j et > 90 jours)",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "ARRÊTER ou Réduire dose ≤ 0,125 mg/j",
      "sources": "STOPP v3, REMEDIES, EU(7)-PIM",
      "divergences": "STOPP : arrêter si DFG < 30 ET dose ≥ 125 µg/j (> 90 j). REMEDI[e]S : max 0,125 mg/j chez tout sujet âgé."
    },
    {
      "seuil_id": "SBM006",
      "bio_id": "DFG",
      "med_id": "SPIRO",
      "seuil_valeur_texte": "< 30 ml/min",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "ÉVITER (< 30) — INITIER si > 30 en IC (START)",
      "sources": "BEERS 2023, STOPP v3, START",
      "divergences": "Seuil charnière : START recommande si DFG > 30 ; STOPP arrête si DFG < 30. Risque hyperkaliémie sévère."
    },
    {
      "seuil_id": "SBM007",
      "bio_id": "DFG",
      "med_id": "METFORMINE",
      "seuil_valeur_texte": "< 30 ml/min",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "ÉVITER (risque acidose lactique)",
      "sources": "STOPP v3, PRISCUS",
      "divergences": "Réduire dose si DFG 30-45. Contre-indiqué si DFG < 30."
    },
    {
      "seuil_id": "SBM008",
      "bio_id": "DFG",
      "med_id": "METHOTREXATE",
      "seuil_valeur_texte": "< 30 ml/min",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "ÉVITER",
      "sources": "STOPP v3",
      "divergences": "Risque de toxicité hématologique sévère."
    },
    {
      "seuil_id": "SBM009",
      "bio_id": "DFG",
      "med_id": "BIPHOSPHONATES",
      "seuil_valeur_texte": "< 30 ml/min",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "ÉVITER",
      "sources": "STOPP v3",
      "divergences": null
    },
    {
      "seuil_id": "SBM010",
      "bio_id": "DFG",
      "med_id": "COLCHICINE",
      "seuil_valeur_texte": "< 30 (réduire) / < 10 (arrêter)",
      "seuil_numerique_bas": "10",
      "seuil_numerique_haut": "30",
      "operateur": "<",
      "action": "Réduire dose si DFG < 30 / ÉVITER si DFG < 10",
      "sources": "STOPP v3, BEERS 2023, EU(7)-PIM, REMEDIES",
      "divergences": "STOPP : ÉVITER si DFG < 10 ; BEERS/EU-PIM : réduire si DFG < 30 ; REMEDI[e]S : dose de charge max 1 mg"
    },
    {
      "seuil_id": "SBM011",
      "bio_id": "DFG",
      "med_id": "BACLOFENE",
      "seuil_valeur_texte": "< 60 ml/min",
      "seuil_numerique_bas": "60",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "ÉVITER (risque encéphalopathie)",
      "sources": "BEERS 2023",
      "divergences": "Seuil spécifique à 60 ml/min (plus strict que seuils habituels à 30)."
    },
    {
      "seuil_id": "SBM012",
      "bio_id": "DFG",
      "med_id": "DULOXETINE",
      "seuil_valeur_texte": "< 30 ml/min",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "ÉVITER",
      "sources": "BEERS 2023",
      "divergences": "EI gastro-intestinaux accrus."
    },
    {
      "seuil_id": "SBM013",
      "bio_id": "DFG",
      "med_id": "GABAPENTINOÏDES",
      "seuil_valeur_texte": "< 60 ml/min",
      "seuil_numerique_bas": "60",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "Réduire dose",
      "sources": "BEERS 2023",
      "divergences": "Seuil identique pour Gabapentine et Prégabaline. Sédation, ataxie."
    },
    {
      "seuil_id": "SBM014",
      "bio_id": "DFG",
      "med_id": "TRAMADOL",
      "seuil_valeur_texte": "< 30 ml/min",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "Réduire dose (LI) / ÉVITER LP",
      "sources": "BEERS 2023, REMEDIES",
      "divergences": "Libération prolongée : éviter si DFG < 30. REMEDI[e]S : max 200 mg/j chez > 75 ans."
    },
    {
      "seuil_id": "SBM015",
      "bio_id": "DFG",
      "med_id": "FLUOROQUINOLONES",
      "seuil_valeur_texte": "< 30 ml/min",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "Réduire dose",
      "sources": "BEERS 2023",
      "divergences": null
    },
    {
      "seuil_id": "SBM016",
      "bio_id": "DFG",
      "med_id": "COTRIMOXAZOLE",
      "seuil_valeur_texte": "< 30 ml/min (réduire 15-29) / < 15 (éviter)",
      "seuil_numerique_bas": "15",
      "seuil_numerique_haut": "30",
      "operateur": "<",
      "action": "Réduire dose si DFG 15-29 / ÉVITER si < 15",
      "sources": "BEERS 2023",
      "divergences": "Risque hyperkaliémie et aggravation rénale. Interaction IEC (REMEDI[e]S I-9/I-10)."
    },
    {
      "seuil_id": "SBM017",
      "bio_id": "DFG",
      "med_id": "ANTI_H2",
      "seuil_valeur_texte": "< 50 ml/min",
      "seuil_numerique_bas": "50",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "Réduire dose",
      "sources": "BEERS 2023",
      "divergences": "Risque confusion, état mental altéré."
    },
    {
      "seuil_id": "SBM018",
      "bio_id": "HBA1C",
      "med_id": "INSULINE",
      "seuil_valeur_texte": "Cible < 8% (fragile) vs < 7% (robuste)",
      "seuil_numerique_bas": null,
      "seuil_numerique_haut": null,
      "operateur": "cible",
      "action": "Ne pas intensifier si HbA1c < 8% chez patient fragile",
      "sources": "STOPPFrail",
      "divergences": "Divergence volontaire avec guidelines endocrinologiques (< 7%). Éviter hypoglycémies chez le fragile."
    },
    {
      "seuil_id": "SBM019",
      "bio_id": "DIGOXINEMIE",
      "med_id": "DIGOXINE",
      "seuil_valeur_texte": "0,5–1,2 µg/L (cible gériatrique)",
      "seuil_numerique_bas": "0.5",
      "seuil_numerique_haut": "1.2",
      "operateur": "cible",
      "action": "Adapter la dose pour maintenir dans la cible",
      "sources": "REMEDIES, EU(7)-PIM",
      "divergences": "Cible adulte standard 1,5–2 µg/L : trop élevée en gériatrie."
    },
    {
      "seuil_id": "SBM020",
      "bio_id": "INR",
      "med_id": "AVK",
      "seuil_valeur_texte": "Cible 2–3 (FA non valvulaire)",
      "seuil_numerique_bas": "2.0",
      "seuil_numerique_haut": "3.0",
      "operateur": "cible",
      "action": "Surveiller INR étroitement si co-prescription",
      "sources": "BEERS 2023",
      "divergences": "Interactions : Amiodarone, Ciprofloxacine, Macrolides, TMP-SMX, ISRS → surveiller INR rapproché."
    },
    {
      "seuil_id": "SBM021",
      "bio_id": "KALIEMIE",
      "med_id": "SPIRO",
      "seuil_valeur_texte": "> 5,5 mmol/L",
      "seuil_numerique_bas": "5.5",
      "seuil_numerique_haut": null,
      "operateur": ">",
      "action": "Surveiller kaliémie — Éviter associations hyperkaliémiantes si DFG réduit",
      "sources": "BEERS 2023, REMEDIES, STOPP v3",
      "divergences": "REMEDI[e]S D-2 : double SRAA interdit. IEC/ARA II + Cotrimoxazole = surveillance étroite."
    },
    {
      "seuil_id": "SBM022",
      "bio_id": "NATREMIE",
      "med_id": "ISRS",
      "seuil_valeur_texte": "< 130 mmol/L (hyponatrémie sévère)",
      "seuil_numerique_bas": "130",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "Surveiller natrémie — Risque SIADH",
      "sources": "EU(7)-PIM, PRISCUS",
      "divergences": "Fluoxétine : risque SIADH. Carbamazépine : risque SIADH également."
    },
    {
      "seuil_id": "SBM023",
      "bio_id": "QTC",
      "med_id": "AP",
      "seuil_valeur_texte": "> 450 ms (H) / > 470 ms (F)",
      "seuil_numerique_bas": "450",
      "seuil_numerique_haut": "470",
      "operateur": ">",
      "action": "ÉVITER ou surveiller ECG",
      "sources": "EU(7)-PIM, BEERS 2023",
      "divergences": "Ne pas associer plusieurs médicaments allongeant le QT. ECG de contrôle recommandé."
    },
    {
      "seuil_id": "SBM024",
      "bio_id": "LITHEMIE",
      "med_id": "LITHIUM",
      "seuil_valeur_texte": "0,6–1,2 mmol/L",
      "seuil_numerique_bas": "0.6",
      "seuil_numerique_haut": "1.2",
      "operateur": "cible",
      "action": "Surveiller lithémie si co-prescription IEC/ARA II/diurétiques/AINS",
      "sources": "BEERS 2023",
      "divergences": "Toxicité probable si > 1,5 mmol/L."
    },
    {
      "seuil_id": "SBM025",
      "bio_id": "T_SCORE",
      "med_id": "BIPHOSPHONATES",
      "seuil_valeur_texte": "< -2,5 DS",
      "seuil_numerique_bas": "-2.5",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "INITIER Calcium+VitD + Bisphosphonates/Dénosumab",
      "sources": "START, REMEDIES, FORTA",
      "divergences": "STOPPFrail G1/G2 : arrêter si espérance de vie < 1 an."
    },
    {
      "seuil_id": "SBM026",
      "bio_id": "PO2",
      "med_id": "OXYGENE",
      "seuil_valeur_texte": "< 60 mmHg",
      "seuil_numerique_bas": "60",
      "seuil_numerique_haut": null,
      "operateur": "<",
      "action": "INITIER oxygénothérapie longue durée (> 15h/j)",
      "sources": "START",
      "divergences": null
    },
    {
      "seuil_id": "SBM027",
      "bio_id": "DFG",
      "med_id": "SPIRO",
      "seuil_valeur_texte": "> 30 ml/min",
      "seuil_numerique_bas": "30",
      "seuil_numerique_haut": null,
      "operateur": ">",
      "action": "INITIER Spironolactone en IC systolique (START)",
      "sources": "START",
      "divergences": "Seuil charnière START : INITIER si DFG > 30, STOPP : ARRÊTER si DFG < 30."
    }
  ],
  "seuils_bio_clin": [
    {
      "seuil_id": "SBC001",
      "comorb_id": "IC_SYSTOLIQUE",
      "bio_id": "DFG",
      "seuil_valeur_texte": "> 30 → INITIER Spironolactone / < 30 → ARRÊTER",
      "seuil_numerique": "30.0",
      "operateur": ">/<",
      "med_ids_concernes": "SPIRO",
      "sources": "START, STOPP v3",
      "divergences": null
    },
    {
      "seuil_id": "SBC002",
      "comorb_id": "IRC",
      "bio_id": "DFG",
      "seuil_valeur_texte": "< 50 : AINS éviter (STOPP) / < 30 : multiples méd. à adapter / < 15 : AOD éviter",
      "seuil_numerique": "15.0",
      "operateur": "<",
      "med_ids_concernes": "AINS|AOD|METFORMINE|DABIGATRAN|SPIRO|METHOTREXATE|BIPHOSPHONATES",
      "sources": "STOPP v3, BEERS 2023, EU(7)-PIM, REMEDIES",
      "divergences": "Divergence principale : AINS DFG < 50 (STOPP) vs < 30 (BEERS)."
    },
    {
      "seuil_id": "SBC003",
      "comorb_id": "DIABETE",
      "bio_id": "HBA1C",
      "seuil_valeur_texte": "< 8% (fragile) / < 7% (robuste) — ne pas intensifier si < 8% chez fragile",
      "seuil_numerique": null,
      "operateur": "cible",
      "med_ids_concernes": "INSULINE|SULFA_GLIN|DPP4",
      "sources": "STOPPFrail",
      "divergences": "Divergence volontaire."
    },
    {
      "seuil_id": "SBC004",
      "comorb_id": "MICROALBUMINURIE",
      "bio_id": "ALBUMINURIE",
      "seuil_valeur_texte": "≥ 30 mg/g ou ≥ 300 mg/24h",
      "seuil_numerique": "30.0",
      "operateur": ">=",
      "med_ids_concernes": "IEC|ARA2",
      "sources": "START, REMEDIES",
      "divergences": "STOPPFrail : arrêter si uniquement néphroprotection chez très fragile."
    },
    {
      "seuil_id": "SBC005",
      "comorb_id": "FA",
      "bio_id": "INR",
      "seuil_valeur_texte": "Cible 2–3 si sous AVK",
      "seuil_numerique": "2.0",
      "operateur": "cible",
      "med_ids_concernes": "AVK",
      "sources": "BEERS 2023",
      "divergences": "Surveiller si interactions (Amiodarone, ISRS, Macrolides, Ciprofloxacine, TMP-SMX)."
    },
    {
      "seuil_id": "SBC006",
      "comorb_id": "DEMENCE",
      "bio_id": "DIGOXINEMIE",
      "seuil_valeur_texte": "Cible gériatrique 0,5–1,2 µg/L",
      "seuil_numerique": "0.5",
      "operateur": "cible",
      "med_ids_concernes": "DIGOXINE",
      "sources": "REMEDIES, EU(7)-PIM, STOPP v3",
      "divergences": null
    },
    {
      "seuil_id": "SBC007",
      "comorb_id": "GOUTTE",
      "bio_id": "KALIEMIE",
      "seuil_valeur_texte": "> 5,5 mmol/L = hyperkaliémie",
      "seuil_numerique": "5.5",
      "operateur": ">",
      "med_ids_concernes": "IEC|ARA2|SPIRO|COTRIMOXAZOLE",
      "sources": "BEERS 2023, REMEDIES, STOPP v3",
      "divergences": "Surveiller si associations hyperkaliémiantes + IRC."
    },
    {
      "seuil_id": "SBC008",
      "comorb_id": "DEPRESSION",
      "bio_id": "NATREMIE",
      "seuil_valeur_texte": "< 135 mmol/L : hyponatrémie ; < 130 : sévère",
      "seuil_numerique": "135.0",
      "operateur": "<",
      "med_ids_concernes": "ISRS|VENLAFAXINE",
      "sources": "EU(7)-PIM, PRISCUS",
      "divergences": null
    },
    {
      "seuil_id": "SBC009",
      "comorb_id": "DEMENCE",
      "bio_id": "LITHEMIE",
      "seuil_valeur_texte": "0,6–1,2 mmol/L. Toxicité > 1,5 mmol/L",
      "seuil_numerique": "0.6",
      "operateur": "cible",
      "med_ids_concernes": "LITHIUM",
      "sources": "BEERS 2023",
      "divergences": null
    },
    {
      "seuil_id": "SBC010",
      "comorb_id": "OSTEOPOROSE",
      "bio_id": "T_SCORE",
      "seuil_valeur_texte": "< -2,5 DS : traitement complet / -2,5 à -1 : VitD seule",
      "seuil_numerique": "-2.5",
      "operateur": "<",
      "med_ids_concernes": "CALCIUM_VITD|BIPHOSPHONATES|DENOSUMAB",
      "sources": "START, REMEDIES, FORTA, STOPPFrail",
      "divergences": "STOPPFrail G1/G2 : arrêter si espérance de vie < 1 an."
    },
    {
      "seuil_id": "SBC011",
      "comorb_id": "HYPOXIE",
      "bio_id": "PO2",
      "seuil_valeur_texte": "< 60 mmHg OU SaO₂ < 89%",
      "seuil_numerique": "60.0",
      "operateur": "<",
      "med_ids_concernes": "OXYGENE",
      "sources": "START",
      "divergences": null
    },
    {
      "seuil_id": "SBC012",
      "comorb_id": "IRC_MINERAL",
      "bio_id": "DFG",
      "seuil_valeur_texte": "< 30 + anomalies biologiques",
      "seuil_numerique": "30.0",
      "operateur": "<",
      "med_ids_concernes": "CALCIUM_VITD|DIURETIQUES_ANSE",
      "sources": "START",
      "divergences": "Initier selon les anomalies biologiques constatées."
    },
    {
      "seuil_id": "SBC013",
      "comorb_id": "CARENCE_MARTIALE",
      "bio_id": "FERRITINE",
      "seuil_valeur_texte": "< 100 ng/mL ou CST < 20%",
      "seuil_numerique": "100.0",
      "operateur": "<",
      "med_ids_concernes": "IEC",
      "sources": "START",
      "divergences": "Fer IV si IC + carence martiale."
    },
    {
      "seuil_id": "SBC014",
      "comorb_id": "BRADYCARDIE",
      "bio_id": "FC",
      "seuil_valeur_texte": "< 55 bat/min ou trouble de conduction ECG",
      "seuil_numerique": "55.0",
      "operateur": "<",
      "med_ids_concernes": "ACHECHOLINESTINHIBITEURS|BB|DIGOXINE",
      "sources": "REMEDIES, STOPP v3, BEERS 2023",
      "divergences": "REMEDI[e]S I-1 : éviter association Inh.AChE + bradycardisant."
    }
  ],
  "interactions": [
    {
      "inter_id": "INT001",
      "med_cible_id": "OPIOIDES",
      "med_interagissant_id": "BZD",
      "action": "ÉVITER",
      "risque": "Sédation sévère, dépression respiratoire, décès.",
      "sources": "BEERS 2023",
      "notes": null
    },
    {
      "inter_id": "INT002",
      "med_cible_id": "OPIOIDES",
      "med_interagissant_id": "GABAPENTINOÏDES",
      "action": "ÉVITER (sauf transition)",
      "risque": "Dépression respiratoire et sédation profonde.",
      "sources": "BEERS 2023",
      "notes": null
    },
    {
      "inter_id": "INT003",
      "med_cible_id": "IEC",
      "med_interagissant_id": "ARA2",
      "action": "ÉVITER (double blocage SRAA)",
      "risque": "Hyperkaliémie, IRA, hypotension.",
      "sources": "BEERS 2023, REMEDIES",
      "notes": "REMEDI[e]S D-2 : monothérapie SRAA obligatoire."
    },
    {
      "inter_id": "INT004",
      "med_cible_id": "AC",
      "med_interagissant_id": "AC",
      "action": "MINIMISER (charge AC cumulée)",
      "risque": "Déclin cognitif, délirium, chutes, rétention urinaire.",
      "sources": "BEERS 2023, REMEDIES",
      "notes": "Évaluer avec score ACB ou ADS."
    },
    {
      "inter_id": "INT005",
      "med_cible_id": "AP",
      "med_interagissant_id": "ISRS",
      "action": "PRUDENCE ≥ 3 médicaments SNC",
      "risque": "Chutes et fractures ×2-3, sédation, confusion.",
      "sources": "BEERS 2023, REMEDIES",
      "notes": "REMEDI[e]S D-7 : ne jamais associer 2 psychotropes de même classe."
    },
    {
      "inter_id": "INT006",
      "med_cible_id": "LITHIUM",
      "med_interagissant_id": "IEC",
      "action": "SURVEILLER lithémie",
      "risque": "Toxicité au lithium (marge étroite). IEC modifie la volémie.",
      "sources": "BEERS 2023",
      "notes": null
    },
    {
      "inter_id": "INT007",
      "med_cible_id": "PHENYTOÏNE",
      "med_interagissant_id": "COTRIMOXAZOLE",
      "action": "ÉVITER",
      "risque": "TMP-SMX inhibe le métabolisme de la Phénytoïne → toxicité.",
      "sources": "BEERS 2023, EU(7)-PIM",
      "notes": null
    },
    {
      "inter_id": "INT008",
      "med_cible_id": "THEOPHYLLINE",
      "med_interagissant_id": "FLUOROQUINOLONES",
      "action": "ÉVITER",
      "risque": "Toxicité de la théophylline (inhibition métabolisme).",
      "sources": "BEERS 2023",
      "notes": null
    },
    {
      "inter_id": "INT009",
      "med_cible_id": "AVK",
      "med_interagissant_id": "AMIODARONE",
      "action": "SURVEILLER INR étroitement",
      "risque": "Saignement majeur (Amiodarone inhibe métabolisme AVK).",
      "sources": "BEERS 2023",
      "notes": null
    },
    {
      "inter_id": "INT010",
      "med_cible_id": "ALPHA_HTA",
      "med_interagissant_id": "DIURETIQUES_ANSE",
      "action": "ÉVITER (chez la femme)",
      "risque": "Incontinence urinaire aggravée.",
      "sources": "BEERS 2023",
      "notes": null
    },
    {
      "inter_id": "INT011",
      "med_cible_id": "AOD",
      "med_interagissant_id": "ANTIAGREG",
      "action": "RÉSERVER au post-SCA/stent",
      "risque": "Risque hémorragique majeur.",
      "sources": "REMEDIES",
      "notes": "REMEDI[e]S I-3/D-4 : 1 seul antithrombotique sauf indication validée."
    },
    {
      "inter_id": "INT012",
      "med_cible_id": "AOD",
      "med_interagissant_id": "AINS",
      "action": "INTERROMPRE l'AINS",
      "risque": "Hémorragie iatrogène (cause majeure d'hospitalisation gériatrique).",
      "sources": "REMEDIES",
      "notes": "REMEDI[e]S I-4/I-6."
    },
    {
      "inter_id": "INT013",
      "med_cible_id": "IEC",
      "med_interagissant_id": "COTRIMOXAZOLE",
      "action": "CONTRE-INDIQUÉ ou surveillance étroite kaliémie",
      "risque": "Hyperkaliémie sévère.",
      "sources": "REMEDIES",
      "notes": "REMEDI[e]S I-9/I-10 : IEC/ARA II + Cotrimoxazole ou Sels K⁺."
    },
    {
      "inter_id": "INT014",
      "med_cible_id": "BB",
      "med_interagissant_id": "ACHECHOLINESTINHIBITEURS",
      "action": "PRUDENCE / Surveillance ECG",
      "risque": "Trouble de conduction, bradycardie excessive, syncope.",
      "sources": "REMEDIES",
      "notes": "REMEDI[e]S I-1 : éviter l'association si possible."
    },
    {
      "inter_id": "INT015",
      "med_cible_id": "DIURETIQUES_ANSE",
      "med_interagissant_id": "DIURETIQUES_ANSE",
      "action": "NE PAS ASSOCIER",
      "risque": "Troubles hydro-électrolytiques, IRA fonctionnelle.",
      "sources": "REMEDIES",
      "notes": "REMEDI[e]S D-1 : max 1 diurétique en HTA."
    },
    {
      "inter_id": "INT016",
      "med_cible_id": "AINS",
      "med_interagissant_id": "AINS",
      "action": "CONTRE-INDIQUÉ",
      "risque": "Ulcère, hémorragie digestive, IRA.",
      "sources": "REMEDIES",
      "notes": "REMEDI[e]S D-5/D-6 : monothérapie AINS obligatoire."
    },
    {
      "inter_id": "INT017",
      "med_cible_id": "COLCHICINE",
      "med_interagissant_id": "MACROLIDES",
      "action": "CONTRE-INDICATION ABSOLUE (sauf Spiramycine)",
      "risque": "Surdosage fatal : pancytopénie, défaillance multiviscérale.",
      "sources": "REMEDIES",
      "notes": "REMEDI[e]S I-19. URGENCE : changer l'antibiotique."
    },
    {
      "inter_id": "INT018",
      "med_cible_id": "BZD",
      "med_interagissant_id": "AP",
      "action": "ÉVITER si ≥ 3 dépresseurs SNC",
      "risque": "Dépression centrale, chutes, confusion.",
      "sources": "BEERS 2023, REMEDIES",
      "notes": "REMEDI[e]S I-15 : ≥ 3 dépresseurs SNC = risque élevé."
    },
    {
      "inter_id": "INT019",
      "med_cible_id": "AVK",
      "med_interagissant_id": "ISRS",
      "action": "SURVEILLER INR",
      "risque": "ISRS inhibent la recapture plaquettaire + métabolisme AVK.",
      "sources": "BEERS 2023",
      "notes": null
    },
    {
      "inter_id": "INT020",
      "med_cible_id": "DIGOXINE",
      "med_interagissant_id": "AMIODARONE",
      "action": "SURVEILLER digoxinémie",
      "risque": "Amiodarone inhibe le transport rénal de la Digoxine → toxicité.",
      "sources": "BEERS 2023",
      "notes": null
    },
    {
      "inter_id": "INT021",
      "med_cible_id": "CA",
      "med_interagissant_id": "BB",
      "action": "PRUDENCE si Vérapamil ou Diltiazem",
      "risque": "Bloc auriculo-ventriculaire, bradycardie excessive.",
      "sources": "BEERS 2023, FORTA",
      "notes": "CI si IC : Vérapamil et Diltiazem sont FORTA D en IC."
    },
    {
      "inter_id": "INT022",
      "med_cible_id": "ANTIAGREG",
      "med_interagissant_id": "ANTIAGREG",
      "action": "RÉSERVER aux indications validées",
      "risque": "Risque hémorragique sans bénéfice supplémentaire en dehors du post-SCA/stent.",
      "sources": "REMEDIES",
      "notes": "REMEDI[e]S D-4 : 1 seul antiagrégant max sauf indication validée."
    }
  ],
  "pims_forta": [
    {
      "forta_id": "FORTA001",
      "comorb_id": "HTA",
      "med_id": "IEC",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Indispensable"
    },
    {
      "forta_id": "FORTA002",
      "comorb_id": "HTA",
      "med_id": "CA",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Indispensable"
    },
    {
      "forta_id": "FORTA003",
      "comorb_id": "HTA",
      "med_id": "ISRS",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Indapamide — Indispensable"
    },
    {
      "forta_id": "FORTA004",
      "comorb_id": "HTA",
      "med_id": "BB",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "Prudence — hors Aténolol"
    },
    {
      "forta_id": "FORTA005",
      "comorb_id": "HTA",
      "med_id": "ALPHA_HTA",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "Prudence (hypotension)"
    },
    {
      "forta_id": "FORTA006",
      "comorb_id": "HTA",
      "med_id": "BB",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "Aténolol : À éviter"
    },
    {
      "forta_id": "FORTA007",
      "comorb_id": "HTA",
      "med_id": "ANTIHTA_CENTRAL",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "Clonidine, Minoxidil : À éviter"
    },
    {
      "forta_id": "FORTA008",
      "comorb_id": "IC_SYSTOLIQUE",
      "med_id": "IEC",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Indispensable"
    },
    {
      "forta_id": "FORTA009",
      "comorb_id": "IC_SYSTOLIQUE",
      "med_id": "BB",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Indispensable"
    },
    {
      "forta_id": "FORTA010",
      "comorb_id": "IC_SYSTOLIQUE",
      "med_id": "SGLT2",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Bénéfique"
    },
    {
      "forta_id": "FORTA011",
      "comorb_id": "IC_SYSTOLIQUE",
      "med_id": "SPIRO",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "Prudence (hyperkaliémie)"
    },
    {
      "forta_id": "FORTA012",
      "comorb_id": "IC_SYSTOLIQUE",
      "med_id": "DIGOXINE",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "Prudence (marge étroite)"
    },
    {
      "forta_id": "FORTA013",
      "comorb_id": "FA",
      "med_id": "BB",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Contrôle de fréquence — Indispensable"
    },
    {
      "forta_id": "FORTA014",
      "comorb_id": "FA",
      "med_id": "AOD",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Apixaban — 1er choix gériatrique"
    },
    {
      "forta_id": "FORTA015",
      "comorb_id": "FA",
      "med_id": "AVK",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "AVK — Bénéfique"
    },
    {
      "forta_id": "FORTA016",
      "comorb_id": "FA",
      "med_id": "AMIODARONE",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "2ème ligne — Prudence"
    },
    {
      "forta_id": "FORTA017",
      "comorb_id": "FA",
      "med_id": "ANTIARYTHMIQUE_I",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "À éviter"
    },
    {
      "forta_id": "FORTA018",
      "comorb_id": "FA",
      "med_id": "CA",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "Vérapamil, Diltiazem si IC : À éviter"
    },
    {
      "forta_id": "FORTA019",
      "comorb_id": "DOULEUR_CHRONIQUE",
      "med_id": "CALCIUM_VITD",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Paracétamol — 1ère ligne"
    },
    {
      "forta_id": "FORTA020",
      "comorb_id": "DOULEUR_CHRONIQUE",
      "med_id": "OPIOIDES",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Bupréno/Oxycodone/Hydromorphone"
    },
    {
      "forta_id": "FORTA021",
      "comorb_id": "DOULEUR_CHRONIQUE",
      "med_id": "TRAMADOL",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "Prudence"
    },
    {
      "forta_id": "FORTA022",
      "comorb_id": "DOULEUR_CHRONIQUE",
      "med_id": "AINS",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "AINS long cours : À éviter"
    },
    {
      "forta_id": "FORTA023",
      "comorb_id": "DOULEUR_CHRONIQUE",
      "med_id": "ATC",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "ATC > 10 mg/j : À éviter"
    },
    {
      "forta_id": "FORTA024",
      "comorb_id": "DIABETE",
      "med_id": "DPP4",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Meilleur profil gériatrique — Indispensable"
    },
    {
      "forta_id": "FORTA025",
      "comorb_id": "DIABETE",
      "med_id": "METFORMINE",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Bénéfique"
    },
    {
      "forta_id": "FORTA026",
      "comorb_id": "DIABETE",
      "med_id": "INSULINE",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Bénéfique"
    },
    {
      "forta_id": "FORTA027",
      "comorb_id": "DIABETE",
      "med_id": "SGLT2",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Bénéfique"
    },
    {
      "forta_id": "FORTA028",
      "comorb_id": "DIABETE",
      "med_id": "GLP1",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Bénéfique"
    },
    {
      "forta_id": "FORTA029",
      "comorb_id": "DIABETE",
      "med_id": "SULFA_GLIN",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "Glimépiride — Prudence"
    },
    {
      "forta_id": "FORTA030",
      "comorb_id": "DIABETE",
      "med_id": "SULFA_GLIN",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "Glibenclamide — À éviter"
    },
    {
      "forta_id": "FORTA031",
      "comorb_id": "OSTEOPOROSE",
      "med_id": "CALCIUM_VITD",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Indispensable"
    },
    {
      "forta_id": "FORTA032",
      "comorb_id": "OSTEOPOROSE",
      "med_id": "BIPHOSPHONATES",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "IV/Dénosumab — Indispensable"
    },
    {
      "forta_id": "FORTA033",
      "comorb_id": "OSTEOPOROSE",
      "med_id": "BIPHOSPHONATES",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Oraux — Bénéfique"
    },
    {
      "forta_id": "FORTA034",
      "comorb_id": "DEPRESSION_MA",
      "med_id": "ACHECHOLINESTINHIBITEURS",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Stade léger-modéré"
    },
    {
      "forta_id": "FORTA035",
      "comorb_id": "DEPRESSION_MA",
      "med_id": "MEMANTINE",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Stade modéré-avancé si bénéfice SCPD"
    },
    {
      "forta_id": "FORTA036",
      "comorb_id": "SCPD",
      "med_id": "AP",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "Rispéridone/Quétiapine/Olanzapine — courte durée"
    },
    {
      "forta_id": "FORTA037",
      "comorb_id": "SCPD",
      "med_id": "AP",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "Halopéridol/Clozapine/Aripiprazole : À éviter"
    },
    {
      "forta_id": "FORTA038",
      "comorb_id": "DEPRESSION",
      "med_id": "ISRS",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "1ère ligne"
    },
    {
      "forta_id": "FORTA039",
      "comorb_id": "DEPRESSION",
      "med_id": "VENLAFAXINE",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "Prudence"
    },
    {
      "forta_id": "FORTA040",
      "comorb_id": "DEPRESSION",
      "med_id": "ATC",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "À éviter"
    },
    {
      "forta_id": "FORTA041",
      "comorb_id": "INSOMNIE",
      "med_id": "CALCIUM_VITD",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Mélatonine LP si efficace"
    },
    {
      "forta_id": "FORTA042",
      "comorb_id": "INSOMNIE",
      "med_id": "BZD",
      "classe_forta": "C",
      "signification": "Prudence",
      "commentaire": "Z-drugs doses réduites : Prudence"
    },
    {
      "forta_id": "FORTA043",
      "comorb_id": "INSOMNIE",
      "med_id": "BZD",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "BZD : À éviter"
    },
    {
      "forta_id": "FORTA044",
      "comorb_id": "PARKINSON",
      "med_id": "L_DOPA",
      "classe_forta": "A",
      "signification": "Indispensable",
      "commentaire": "Traitement de référence — Indispensable"
    },
    {
      "forta_id": "FORTA045",
      "comorb_id": "PARKINSON",
      "med_id": "LAMA",
      "classe_forta": "B",
      "signification": "Bénéfique",
      "commentaire": "Inh.COMT / Agonistes dopaminergiques"
    },
    {
      "forta_id": "FORTA046",
      "comorb_id": "PARKINSON",
      "med_id": "AC",
      "classe_forta": "D",
      "signification": "À éviter",
      "commentaire": "Anticholinergiques antiparkinsoniens : À éviter"
    }
  ],
  "stoppfrail": [
    {
      "code": "A1",
      "systeme": "Général",
      "medicament_classe": "Tout médicament",
      "recommandation": "ARRÊTER si non toléré ou non pris malgré éducation adéquate.",
      "med_id_ref": null,
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "A2",
      "systeme": "Général",
      "medicament_classe": "Tout médicament",
      "recommandation": "ARRÊTER si absence d'indication clinique claire.",
      "med_id_ref": null,
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "B1",
      "systeme": "Cardiovasculaire",
      "medicament_classe": "Hypolipémiants (statines, ézétimibe, fibrates)",
      "recommandation": "ARRÊTER. Délai d'action trop long.",
      "med_id_ref": "STATINES",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "B2",
      "systeme": "Cardiovasculaire",
      "medicament_classe": "Alpha-bloquants antihypertenseurs",
      "recommandation": "ARRÊTER. Risque hypotension/chutes.",
      "med_id_ref": "ALPHA_HTA",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "C1",
      "systeme": "Coagulation",
      "medicament_classe": "Antiagrégants plaquettaires",
      "recommandation": "ÉVITER en prévention primaire. Pas de preuve chez très fragile.",
      "med_id_ref": "ANTIAGREG",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "D1",
      "systeme": "SNC",
      "medicament_classe": "Antipsychotiques / Neuroleptiques",
      "recommandation": "RÉDUIRE et ARRÊTER progressivement si > 12 sem sans SCPD actuels.",
      "med_id_ref": "AP",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "D2",
      "systeme": "SNC",
      "medicament_classe": "Mémantine",
      "recommandation": "ARRÊTER si aucune amélioration visible des SCPD.",
      "med_id_ref": "MEMANTINE",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "E1",
      "systeme": "Gastro-intestinal",
      "medicament_classe": "IPP",
      "recommandation": "ARRÊTER dose thérapeutique si ≥ 8 sem sauf dyspepsie persistante.",
      "med_id_ref": "IPP",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "E2",
      "systeme": "Gastro-intestinal",
      "medicament_classe": "Antagonistes H2",
      "recommandation": "ARRÊTER dose thérapeutique si ≥ 8 sem sauf dyspepsie persistante.",
      "med_id_ref": "ANTI_H2",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "E3",
      "systeme": "Gastro-intestinal",
      "medicament_classe": "Antispasmodiques GI",
      "recommandation": "ARRÊTER prescription régulière (anticholinergiques). Exception : coliques fréquentes.",
      "med_id_ref": "AC",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "F1",
      "systeme": "Respiratoire",
      "medicament_classe": "Théophylline",
      "recommandation": "ARRÊTER. Marge étroite ; interactions nombreuses.",
      "med_id_ref": "THEOPHYLLINE",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "F2",
      "systeme": "Respiratoire",
      "medicament_classe": "Montélukast",
      "recommandation": "ARRÊTER dans la BPCO. Indication exclusive à l'asthme.",
      "med_id_ref": null,
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "G1",
      "systeme": "Musculo-squelettique",
      "medicament_classe": "Supplémentation calcique",
      "recommandation": "ARRÊTER. Pas de bénéfice à court terme.",
      "med_id_ref": "CALCIUM_VITD",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "G2",
      "systeme": "Musculo-squelettique",
      "medicament_classe": "Bisphosphonates / Dénosumab",
      "recommandation": "ARRÊTER. Délai d'action trop long vs espérance de vie.",
      "med_id_ref": "BIPHOSPHONATES|DENOSUMAB",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "G3",
      "systeme": "Musculo-squelettique",
      "medicament_classe": "SERM (Raloxifène)",
      "recommandation": "ARRÊTER. Risque TEV et AVC.",
      "med_id_ref": null,
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "G4",
      "systeme": "Musculo-squelettique",
      "medicament_classe": "AINS oraux au long cours",
      "recommandation": "ARRÊTER. Si ≥ 2 mois réguliers.",
      "med_id_ref": "AINS",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "G5",
      "systeme": "Musculo-squelettique",
      "medicament_classe": "Corticostéroïdes oraux au long cours",
      "recommandation": "ARRÊTER si > 2 mois. Réduction progressive.",
      "med_id_ref": null,
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "H1",
      "systeme": "Urologique",
      "medicament_classe": "Inhibiteurs 5-alpha-réductase",
      "recommandation": "ARRÊTER si sonde à demeure.",
      "med_id_ref": "ALPHA_URO",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "H2",
      "systeme": "Urologique",
      "medicament_classe": "Alpha-bloquants (prostatisme)",
      "recommandation": "ARRÊTER si sonde à demeure.",
      "med_id_ref": "ALPHA_URO",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "H3",
      "systeme": "Urologique",
      "medicament_classe": "Antagonistes muscariniques",
      "recommandation": "ARRÊTER si sonde à demeure, sauf hyperactivité douloureuse du détrusor.",
      "med_id_ref": "AC",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "I1",
      "systeme": "Endocrinien",
      "medicament_classe": "Antidiabétiques oraux (polythérapie)",
      "recommandation": "Monothérapie. Cible HbA1c < 8%. Contrôle strict inutile et dangereux.",
      "med_id_ref": "SULFA_GLIN|DPP4|METFORMINE",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "I2",
      "systeme": "Endocrinien",
      "medicament_classe": "IEC (néphroprotection diabétique)",
      "recommandation": "ARRÊTER si prescrit UNIQUEMENT pour néphroprotection. Pas de bénéfice chez très fragile.",
      "med_id_ref": "IEC",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "I3",
      "systeme": "Endocrinien",
      "medicament_classe": "ARA II (néphroprotection diabétique)",
      "recommandation": "ARRÊTER si prescrit UNIQUEMENT pour néphroprotection.",
      "med_id_ref": "ARA2",
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "I4",
      "systeme": "Endocrinien",
      "medicament_classe": "Œstrogènes systémiques",
      "recommandation": "ARRÊTER. Risque AVC et TEV.",
      "med_id_ref": null,
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "J1",
      "systeme": "Divers",
      "medicament_classe": "Suppléments multivitaminés (prophylaxie)",
      "recommandation": "ARRÊTER si prophylaxie (pas de carence avérée).",
      "med_id_ref": null,
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "J2",
      "systeme": "Divers",
      "medicament_classe": "Suppléments nutritionnels (prophylaxie)",
      "recommandation": "ARRÊTER si prophylaxie.",
      "med_id_ref": null,
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    },
    {
      "code": "J3",
      "systeme": "Divers",
      "medicament_classe": "Antibiotiques prophylactiques",
      "recommandation": "ARRÊTER. Pas de preuves solides.",
      "med_id_ref": null,
      "population_cible": "Patient très fragile (Frailty Index sévère) ou en soins palliatifs. Espérance de vie < 1 an."
    }
  ],
  "remedies": [
    {
      "alerte_id": "REM001",
      "categorie": "Dose inadaptée",
      "code": "DO-1",
      "alerte_medicament": "Colchicine > 1,5 mg/j",
      "rationnel": "Surdosage potentiellement fatal.",
      "recommandation": "Max 1 mg en dose de charge. Adapter à la fonction rénale.",
      "med_ids_ref": "COLCHICINE"
    },
    {
      "alerte_id": "REM002",
      "categorie": "Dose inadaptée",
      "code": "DO-2",
      "alerte_medicament": "Digoxine > 0,125 mg/j",
      "rationnel": "Marge étroite, intoxication.",
      "recommandation": "Digoxine ≤ 0,125 mg/j. Cible digoxinémie 0,5–1,2 µg/L.",
      "med_ids_ref": "DIGOXINE"
    },
    {
      "alerte_id": "REM003",
      "categorie": "Dose inadaptée",
      "code": "DO-3",
      "alerte_medicament": "Tramadol > 200 mg/j (> 75 ans)",
      "rationnel": "Demi-vie prolongée, effets SNC.",
      "recommandation": "Max 200 mg/j chez > 75 ans.",
      "med_ids_ref": "TRAMADOL"
    },
    {
      "alerte_id": "REM004",
      "categorie": "Dose inadaptée",
      "code": "DO-4",
      "alerte_medicament": "BZD > demi-dose adulte jeune",
      "rationnel": "Majoration des EI sans efficacité supérieure.",
      "recommandation": "≤ 50% dose adulte.",
      "med_ids_ref": "BZD"
    },
    {
      "alerte_id": "REM005",
      "categorie": "Durée inadaptée",
      "code": "DU-1/DU-2",
      "alerte_medicament": "BZD anxiolytiques > 12 sem ou hypnotiques > 4 sem",
      "rationnel": "Dépendance, accumulation, chutes.",
      "recommandation": "Décroissance progressive et arrêt.",
      "med_ids_ref": "BZD"
    },
    {
      "alerte_id": "REM006",
      "categorie": "Durée inadaptée",
      "code": "DU-6",
      "alerte_medicament": "IPP > 8 sem sans indication active",
      "rationnel": "C. difficile, ostéoporose, carence B12.",
      "recommandation": "Ne pas reconduire sans indication endoscopique ou AINS actif.",
      "med_ids_ref": "IPP"
    },
    {
      "alerte_id": "REM007",
      "categorie": "B/R défavorable",
      "code": "B/R-1",
      "alerte_medicament": "Antihistaminiques H1 1ère gén.",
      "rationnel": "Effets anticholinergiques.",
      "recommandation": "Antihistaminique récent (cétirizine, desloratadine).",
      "med_ids_ref": "AC"
    },
    {
      "alerte_id": "REM008",
      "categorie": "B/R défavorable",
      "code": "B/R-2",
      "alerte_medicament": "Antiarythmiques classe Ia (Disopyramide, Hydroquinidine)",
      "rationnel": "Anticholinergiques ; risque IC.",
      "recommandation": "Sotalol, amiodarone (cardiologue).",
      "med_ids_ref": "ANTIARYTHMIQUE_I"
    },
    {
      "alerte_id": "REM009",
      "categorie": "B/R défavorable",
      "code": "B/R-6",
      "alerte_medicament": "Antidépresseurs imipraminiques (ATC)",
      "rationnel": "Anticholinergiques ; cardiotoxicité.",
      "recommandation": "ISRS ou ISRNA.",
      "med_ids_ref": "ATC"
    },
    {
      "alerte_id": "REM010",
      "categorie": "B/R défavorable",
      "code": "B/R-7",
      "alerte_medicament": "Antiparkinsoniens anticholinergiques",
      "rationnel": "Anticholinergiques ; chutes.",
      "recommandation": "Agonistes dopaminergiques.",
      "med_ids_ref": "AC"
    },
    {
      "alerte_id": "REM011",
      "categorie": "B/R défavorable",
      "code": "B/R-8",
      "alerte_medicament": "Antipsychotiques phénothiaziniques",
      "rationnel": "AC ; allongement QT ; AVC ; décès.",
      "recommandation": "Rispéridone, Olanzapine, Tiapride.",
      "med_ids_ref": "AP"
    },
    {
      "alerte_id": "REM012",
      "categorie": "B/R défavorable",
      "code": "B/R-10",
      "alerte_medicament": "Anxiolytiques AC (Hydroxyzine)",
      "rationnel": "Anticholinergiques ; allongement QT.",
      "recommandation": "TCC, ISRS/ISRNA ou BZD courte durée.",
      "med_ids_ref": "AC"
    },
    {
      "alerte_id": "REM013",
      "categorie": "B/R défavorable",
      "code": "B/R-11",
      "alerte_medicament": "Hypnotiques AC (Alimémazine, Doxylamine)",
      "rationnel": "Anticholinergiques.",
      "recommandation": "TCC, mélatonine, BZD courte durée.",
      "med_ids_ref": "AC"
    },
    {
      "alerte_id": "REM014",
      "categorie": "B/R défavorable",
      "code": "B/R-13",
      "alerte_medicament": "Antispasmodiques urinaires AC",
      "rationnel": "Anticholinergiques.",
      "recommandation": "Mirabégron, Trospium.",
      "med_ids_ref": "AC"
    },
    {
      "alerte_id": "REM015",
      "categorie": "B/R défavorable",
      "code": "B/R-15",
      "alerte_medicament": "Antihypertenseurs d'action centrale",
      "rationnel": "Hypotension orthostatique ; bradycardie ; sédation.",
      "recommandation": "Autres classes antihypertensives.",
      "med_ids_ref": "ANTIHTA_CENTRAL"
    },
    {
      "alerte_id": "REM016",
      "categorie": "B/R défavorable",
      "code": "B/R-16",
      "alerte_medicament": "Alpha-1 bloquants antihypertenseurs",
      "rationnel": "Hypotension ; chutes ; incontinence.",
      "recommandation": "Autres classes antihypertensives.",
      "med_ids_ref": "ALPHA_HTA"
    },
    {
      "alerte_id": "REM017",
      "categorie": "B/R défavorable",
      "code": "B/R-18",
      "alerte_medicament": "Statines en prévention primaire > 75 ans",
      "rationnel": "Efficacité non prouvée ; myalgies.",
      "recommandation": "Contrôle des FDR, abstention.",
      "med_ids_ref": "STATINES"
    },
    {
      "alerte_id": "REM018",
      "categorie": "B/R défavorable",
      "code": "B/R-19",
      "alerte_medicament": "Antiagrégants en prévention primaire ≥ 70 ans",
      "rationnel": "Risque hémorragique > bénéfice.",
      "recommandation": "Abstention thérapeutique.",
      "med_ids_ref": "ANTIAGREG"
    },
    {
      "alerte_id": "REM019",
      "categorie": "B/R défavorable",
      "code": "B/R-24",
      "alerte_medicament": "Indométacine",
      "rationnel": "Effets neuropsychiques fréquents.",
      "recommandation": "Autre AINS en monothérapie, dose minimale.",
      "med_ids_ref": "AINS"
    },
    {
      "alerte_id": "REM020",
      "categorie": "B/R défavorable",
      "code": "B/R-25",
      "alerte_medicament": "Myorelaxants (Baclofène)",
      "rationnel": "Sédation ; chutes.",
      "recommandation": "Kiné, chaleur locale.",
      "med_ids_ref": "BACLOFENE"
    },
    {
      "alerte_id": "REM021",
      "categorie": "B/R défavorable",
      "code": "B/R-26/27",
      "alerte_medicament": "Sulfamides hypoglycémiants et Glinides",
      "rationnel": "Hypoglycémies sévères.",
      "recommandation": "Autres classes antidiabétiques.",
      "med_ids_ref": "SULFA_GLIN"
    },
    {
      "alerte_id": "REM022",
      "categorie": "B/R défavorable",
      "code": "B/R-34",
      "alerte_medicament": "Fluoroquinolones",
      "rationnel": "Tendinopathies ; dysglycémies ; QT long.",
      "recommandation": "Autres antibiotiques.",
      "med_ids_ref": "FLUOROQUINOLONES"
    },
    {
      "alerte_id": "REM023",
      "categorie": "B/R défavorable",
      "code": "B/R-35",
      "alerte_medicament": "BZD longue demi-vie > 20h (Diazépam, Clorazépate)",
      "rationnel": "Accumulation ; confusion ; chutes.",
      "recommandation": "BZD courte durée (Oxazépam, Alprazolam).",
      "med_ids_ref": "BZD"
    },
    {
      "alerte_id": "REM024",
      "categorie": "Omission",
      "code": "O-1",
      "alerte_medicament": "FA sans anticoagulant",
      "rationnel": "Risque thrombo-embolique.",
      "recommandation": "AOD ou AVK après CHA₂DS₂-VASc et HAS-BLED.",
      "med_ids_ref": "AOD|AVK"
    },
    {
      "alerte_id": "REM025",
      "categorie": "Omission",
      "code": "O-2",
      "alerte_medicament": "HTA persistante > 150/90 mmHg non traitée",
      "rationnel": "Risque cardiovasculaire.",
      "recommandation": "Monothérapie optimisée (max 3 antihypertenseurs).",
      "med_ids_ref": "IEC|CA"
    },
    {
      "alerte_id": "REM026",
      "categorie": "Omission",
      "code": "O-3",
      "alerte_medicament": "IC systolique sans traitement de base",
      "rationnel": "Pronostic vital.",
      "recommandation": "IEC (ou ARA II) + BB ± diurétiques.",
      "med_ids_ref": "IEC|BB"
    },
    {
      "alerte_id": "REM027",
      "categorie": "Omission",
      "code": "O-4",
      "alerte_medicament": "Post-SCA sans traitement secondaire",
      "rationnel": "Prévention secondaire.",
      "recommandation": "Antiagrégant + BB + IEC + statine.",
      "med_ids_ref": "ANTIAGREG|BB|IEC|STATINES"
    },
    {
      "alerte_id": "REM028",
      "categorie": "Omission",
      "code": "O-6",
      "alerte_medicament": "Diabète avec microalbuminurie sans IEC/ARA II",
      "rationnel": "Néphroprotection.",
      "recommandation": "IEC ou ARA II.",
      "med_ids_ref": "IEC|ARA2"
    },
    {
      "alerte_id": "REM029",
      "categorie": "Omission",
      "code": "O-7",
      "alerte_medicament": "Dépression majeure non traitée",
      "rationnel": "Épisode dépressif.",
      "recommandation": "ISRS ou ISRNA en 1ère ligne.",
      "med_ids_ref": "ISRS"
    },
    {
      "alerte_id": "REM030",
      "categorie": "Omission",
      "code": "O-9",
      "alerte_medicament": "BPCO non traitée",
      "rationnel": "Contrôle des symptômes.",
      "recommandation": "BB2 agonistes ou anticholinergiques inhalés ± CSI.",
      "med_ids_ref": "LAMA|LABA"
    },
    {
      "alerte_id": "REM031",
      "categorie": "Omission",
      "code": "O-10",
      "alerte_medicament": "Ostéoporose / Fracture de fragilité sans traitement",
      "rationnel": "Prévention des fractures.",
      "recommandation": "Calcium + Vitamine D + bisphosphonates.",
      "med_ids_ref": "CALCIUM_VITD|BIPHOSPHONATES"
    },
    {
      "alerte_id": "REM032",
      "categorie": "Omission",
      "code": "O-11/12/13",
      "alerte_medicament": "Vaccination incomplète (Grippe, Pneumocoque, Zona)",
      "rationnel": "Prévention des infections.",
      "recommandation": "Vaccination selon calendrier ≥ 65 ans.",
      "med_ids_ref": "VACC_GRIPPE|VACC_PNEUMO|VACC_ZONA"
    },
    {
      "alerte_id": "REM033",
      "categorie": "Omission",
      "code": "O-14",
      "alerte_medicament": "Traitement opioïde sans laxatif",
      "rationnel": "Constipation iatrogène sévère.",
      "recommandation": "Laxatifs osmotiques systématiques.",
      "med_ids_ref": "LAXATIFS"
    },
    {
      "alerte_id": "REM034",
      "categorie": "Omission",
      "code": "O-15",
      "alerte_medicament": "Corticothérapie systémique > 3 mois sans protection osseuse",
      "rationnel": "Ostéoporose cortico-induite.",
      "recommandation": "Calcium + Vitamine D.",
      "med_ids_ref": "CALCIUM_VITD"
    },
    {
      "alerte_id": "REM035",
      "categorie": "Omission",
      "code": "O-16",
      "alerte_medicament": "Méthotrexate sans acide folique",
      "rationnel": "EI hématologiques et muqueux.",
      "recommandation": "Acide folique ≥ 5 mg/sem.",
      "med_ids_ref": "ACIDE_FOLIQUE"
    },
    {
      "alerte_id": "REM036",
      "categorie": "Condition clinique",
      "code": "CC-1",
      "alerte_medicament": "Alpha-1 bloquants si hypotension orthostatique",
      "rationnel": "Aggravation de l'hypotension.",
      "recommandation": "Prendre en compte le risque de chutes.",
      "med_ids_ref": "ALPHA_HTA"
    },
    {
      "alerte_id": "REM037",
      "categorie": "Condition clinique",
      "code": "CC-3",
      "alerte_medicament": "AINS dans l'IC chronique",
      "rationnel": "Décompensation cardiaque.",
      "recommandation": "Éviter AINS ; Paracétamol ou opioïdes faibles.",
      "med_ids_ref": "AINS"
    },
    {
      "alerte_id": "REM038",
      "categorie": "Condition clinique",
      "code": "CC-8",
      "alerte_medicament": "BZD si troubles neurocognitifs majeurs",
      "rationnel": "Aggravation cognitive, confusion, chutes.",
      "recommandation": "Antidépresseur si anxiété ; mélatonine si insomnie.",
      "med_ids_ref": "BZD"
    },
    {
      "alerte_id": "REM039",
      "categorie": "Condition clinique",
      "code": "CC-10",
      "alerte_medicament": "Neuroleptiques conventionnels dans les TCN",
      "rationnel": "Déclin cognitif, AVC, décès.",
      "recommandation": "Approches comportementales.",
      "med_ids_ref": "AP"
    },
    {
      "alerte_id": "REM040",
      "categorie": "Interaction",
      "code": "I-1",
      "alerte_medicament": "Bradycardisant + Inh. AChE (Donépézil)",
      "rationnel": "Bradycardie excessive, syncope, bloc.",
      "recommandation": "ECG ; préférer le traitement CV seul.",
      "med_ids_ref": "BB|DIGOXINE|ACHECHOLINESTINHIBITEURS"
    },
    {
      "alerte_id": "REM041",
      "categorie": "Interaction",
      "code": "I-3",
      "alerte_medicament": "Anticoagulant + Antiagrégant (non justifié)",
      "rationnel": "Risque hémorragique.",
      "recommandation": "Réserver au post-infarctus, stent récent.",
      "med_ids_ref": "AOD|AVK|ANTIAGREG"
    },
    {
      "alerte_id": "REM042",
      "categorie": "Interaction",
      "code": "I-4/I-6",
      "alerte_medicament": "Anticoagulant ou Antiagrégant + AINS",
      "rationnel": "Hémorragie iatrogène.",
      "recommandation": "Interrompre l'AINS.",
      "med_ids_ref": "AOD|AVK|ANTIAGREG|AINS"
    },
    {
      "alerte_id": "REM043",
      "categorie": "Interaction",
      "code": "I-9/I-10",
      "alerte_medicament": "IEC/ARA II/Diurétique épargnant K⁺ + Cotrimoxazole",
      "rationnel": "Hyperkaliémie sévère.",
      "recommandation": "CI ou surveillance très étroite de la kaliémie.",
      "med_ids_ref": "IEC|ARA2|SPIRO|COTRIMOXAZOLE"
    },
    {
      "alerte_id": "REM044",
      "categorie": "Interaction",
      "code": "I-15",
      "alerte_medicament": "≥ 3 dépresseurs du SNC",
      "rationnel": "Dépression centrale, chutes, confusion.",
      "recommandation": "Limiter à 2 max.",
      "med_ids_ref": "BZD|AP|OPIOIDES"
    },
    {
      "alerte_id": "REM045",
      "categorie": "Interaction",
      "code": "I-19",
      "alerte_medicament": "Colchicine + Macrolides (sauf spiramycine)",
      "rationnel": "Surdosage fatal.",
      "recommandation": "CI absolue. Changer d'antibiotique.",
      "med_ids_ref": "COLCHICINE|MACROLIDES"
    },
    {
      "alerte_id": "REM046",
      "categorie": "Duplication",
      "code": "D-1",
      "alerte_medicament": "2+ diurétiques dans l'HTA",
      "rationnel": "Troubles hydro-électrolytiques, IRA.",
      "recommandation": "1 diurétique max.",
      "med_ids_ref": "DIURETIQUES_ANSE"
    },
    {
      "alerte_id": "REM047",
      "categorie": "Duplication",
      "code": "D-2",
      "alerte_medicament": "2+ inhibiteurs du SRAA (IEC, ARA II)",
      "rationnel": "Hyperkaliémie, IRA, hypotension.",
      "recommandation": "Monothérapie obligatoire.",
      "med_ids_ref": "IEC|ARA2"
    },
    {
      "alerte_id": "REM048",
      "categorie": "Duplication",
      "code": "D-3",
      "alerte_medicament": "4+ antihypertenseurs",
      "rationnel": "Troubles hydro-électrolytiques, IRA.",
      "recommandation": "Max 3 antihypertenseurs.",
      "med_ids_ref": "IEC|CA|BB|DIURETIQUES_ANSE"
    },
    {
      "alerte_id": "REM049",
      "categorie": "Duplication",
      "code": "D-4",
      "alerte_medicament": "2+ antiagrégants plaquettaires (hors indication)",
      "rationnel": "Risque hémorragique.",
      "recommandation": "1 antiagrégant max.",
      "med_ids_ref": "ANTIAGREG"
    },
    {
      "alerte_id": "REM050",
      "categorie": "Duplication",
      "code": "D-5/D-6",
      "alerte_medicament": "2+ AINS",
      "rationnel": "Ulcère, hémorragie, IRA.",
      "recommandation": "Monothérapie AINS.",
      "med_ids_ref": "AINS"
    },
    {
      "alerte_id": "REM051",
      "categorie": "Duplication",
      "code": "D-7",
      "alerte_medicament": "2+ psychotropes de même classe",
      "rationnel": "EI potentialisés sans efficacité.",
      "recommandation": "Réévaluation globale.",
      "med_ids_ref": "BZD|AP|ATC|ISRS"
    }
  ],
  "eviter_comorb": [
    {
      "regle_id": "EV001",
      "med_id": "AC",
      "comorb_id": "DEMENCE"
    },
    {
      "regle_id": "EV001",
      "med_id": "AC",
      "comorb_id": "DELIRIUM"
    },
    {
      "regle_id": "EV001",
      "med_id": "AC",
      "comorb_id": "CHUTES"
    },
    {
      "regle_id": "EV001",
      "med_id": "AC",
      "comorb_id": "HBP"
    },
    {
      "regle_id": "EV001",
      "med_id": "AC",
      "comorb_id": "INCONTINENT_URINAIRE"
    },
    {
      "regle_id": "EV001",
      "med_id": "AC",
      "comorb_id": "PARKINSON"
    },
    {
      "regle_id": "EV001",
      "med_id": "AC",
      "comorb_id": "INSOMNIE"
    },
    {
      "regle_id": "EV001",
      "med_id": "AC",
      "comorb_id": "PATIENT_TRES_FRAGILE"
    },
    {
      "regle_id": "EV002",
      "med_id": "BZD",
      "comorb_id": "DEMENCE"
    },
    {
      "regle_id": "EV002",
      "med_id": "BZD",
      "comorb_id": "DELIRIUM"
    },
    {
      "regle_id": "EV002",
      "med_id": "BZD",
      "comorb_id": "CHUTES"
    },
    {
      "regle_id": "EV002",
      "med_id": "BZD",
      "comorb_id": "INSOMNIE"
    },
    {
      "regle_id": "EV002",
      "med_id": "BZD",
      "comorb_id": "PATIENT_TRES_FRAGILE"
    },
    {
      "regle_id": "EV003",
      "med_id": "AP",
      "comorb_id": "DEMENCE"
    },
    {
      "regle_id": "EV003",
      "med_id": "AP",
      "comorb_id": "CHUTES"
    },
    {
      "regle_id": "EV003",
      "med_id": "AP",
      "comorb_id": "PARKINSON"
    },
    {
      "regle_id": "EV003",
      "med_id": "AP",
      "comorb_id": "PATIENT_TRES_FRAGILE"
    },
    {
      "regle_id": "EV004",
      "med_id": "AINS",
      "comorb_id": "IC_SYSTOLIQUE"
    },
    {
      "regle_id": "EV004",
      "med_id": "AINS",
      "comorb_id": "IRC"
    },
    {
      "regle_id": "EV004",
      "med_id": "AINS",
      "comorb_id": "DOULEUR_CHRONIQUE"
    },
    {
      "regle_id": "EV004",
      "med_id": "AINS",
      "comorb_id": "PATIENT_TRES_FRAGILE"
    },
    {
      "regle_id": "EV004",
      "med_id": "AINS",
      "comorb_id": "HYPOTENSION_ORTHOSTATIQUE"
    },
    {
      "regle_id": "EV005",
      "med_id": "ALPHA_HTA",
      "comorb_id": "HYPOTENSION_ORTHOSTATIQUE"
    },
    {
      "regle_id": "EV005",
      "med_id": "ALPHA_HTA",
      "comorb_id": "CHUTES"
    },
    {
      "regle_id": "EV005",
      "med_id": "ALPHA_HTA",
      "comorb_id": "INCONTINENT_URINAIRE"
    },
    {
      "regle_id": "EV005",
      "med_id": "ALPHA_HTA",
      "comorb_id": "PATIENT_TRES_FRAGILE"
    },
    {
      "regle_id": "EV006",
      "med_id": "ANTIHTA_CENTRAL",
      "comorb_id": "HYPOTENSION_ORTHOSTATIQUE"
    },
    {
      "regle_id": "EV006",
      "med_id": "ANTIHTA_CENTRAL",
      "comorb_id": "CHUTES"
    },
    {
      "regle_id": "EV006",
      "med_id": "ANTIHTA_CENTRAL",
      "comorb_id": "HTA"
    },
    {
      "regle_id": "EV007",
      "med_id": "ATC",
      "comorb_id": "DEPRESSION"
    },
    {
      "regle_id": "EV007",
      "med_id": "ATC",
      "comorb_id": "DOULEUR_CHRONIQUE"
    },
    {
      "regle_id": "EV007",
      "med_id": "ATC",
      "comorb_id": "CHUTES"
    },
    {
      "regle_id": "EV007",
      "med_id": "ATC",
      "comorb_id": "HYPOTENSION_ORTHOSTATIQUE"
    },
    {
      "regle_id": "EV007",
      "med_id": "ATC",
      "comorb_id": "DELIRIUM"
    },
    {
      "regle_id": "EV008",
      "med_id": "SULFA_GLIN",
      "comorb_id": "DIABETE"
    },
    {
      "regle_id": "EV008",
      "med_id": "SULFA_GLIN",
      "comorb_id": "PATIENT_TRES_FRAGILE"
    },
    {
      "regle_id": "EV009",
      "med_id": "DIGOXINE",
      "comorb_id": "FA"
    },
    {
      "regle_id": "EV009",
      "med_id": "DIGOXINE",
      "comorb_id": "IC_SYSTOLIQUE"
    },
    {
      "regle_id": "EV009",
      "med_id": "DIGOXINE",
      "comorb_id": "IRC"
    },
    {
      "regle_id": "EV010",
      "med_id": "AMIODARONE",
      "comorb_id": "FA"
    },
    {
      "regle_id": "EV011",
      "med_id": "ANTIARYTHMIQUE_I",
      "comorb_id": "IC_SYSTOLIQUE"
    },
    {
      "regle_id": "EV011",
      "med_id": "ANTIARYTHMIQUE_I",
      "comorb_id": "FA"
    },
    {
      "regle_id": "EV012",
      "med_id": "AVK",
      "comorb_id": "FA"
    },
    {
      "regle_id": "EV013",
      "med_id": "IPP",
      "comorb_id": "PATIENT_TRES_FRAGILE"
    },
    {
      "regle_id": "EV014",
      "med_id": "ANTI_H2",
      "comorb_id": "DEMENCE"
    },
    {
      "regle_id": "EV014",
      "med_id": "ANTI_H2",
      "comorb_id": "DELIRIUM"
    },
    {
      "regle_id": "EV014",
      "med_id": "ANTI_H2",
      "comorb_id": "IRC"
    },
    {
      "regle_id": "EV015",
      "med_id": "THEOPHYLLINE",
      "comorb_id": "PATIENT_TRES_FRAGILE"
    },
    {
      "regle_id": "EV016",
      "med_id": "BB",
      "comorb_id": "PARKINSON"
    }
  ],
  "medica_qt": [
    {
      "Classe Médicamenteuse": "Bisphosphonates",
      "DCI (Molécule)": "Alendronate",
      "Noms de marque (Princeps)": "Fosomax",
      "Posologie habituelle": "10 mg/j ou 70 mg/semaine",
      "Posologie gériatrique": "5-10 mg/j",
      "Adaptation fonction rénale": "ClCr > 30: dose normale",
      "Interactions Médicamenteuses (DDI)": "Calcium, Fer, Oméprazole",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bisphosphonates",
      "DCI (Molécule)": "Risédronate",
      "Noms de marque (Princeps)": "Actonel",
      "Posologie habituelle": "5 mg/j ou 35 mg/semaine",
      "Posologie gériatrique": "5 mg/j",
      "Adaptation fonction rénale": "ClCr > 30: dose normale",
      "Interactions Médicamenteuses (DDI)": "Calcium, IPP, Fer",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,24",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bisphosphonates",
      "DCI (Molécule)": "Acide zolédronique",
      "Noms de marque (Princeps)": "Aclasta",
      "Posologie habituelle": "5 mg IV/an",
      "Posologie gériatrique": "5 mg IV/an",
      "Adaptation fonction rénale": "ClCr 30-60: ajustement nécessaire",
      "Interactions Médicamenteuses (DDI)": "Aminosides, Diurétiques",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "22 - 56 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bisphosphonates",
      "DCI (Molécule)": "Ibandronate",
      "Noms de marque (Princeps)": "Bonviva",
      "Posologie habituelle": "150 mg/mois ou 3 mg IV/3 mois",
      "Posologie gériatrique": "150 mg/mois",
      "Adaptation fonction rénale": "ClCr > 30: dose normale",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,85",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antithyroïdiens de synthèse",
      "DCI (Molécule)": "Carbimazole",
      "Noms de marque (Princeps)": "Néomercazole",
      "Posologie habituelle": "15-60 mg/j en 2-3 prises",
      "Posologie gériatrique": "15-30 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement nécessaire",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,4",
      "Commentaire liaison albumine": "pour son métabolite actif le thiamazole",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antithyroïdiens de synthèse",
      "DCI (Molécule)": "Propylthiouracile",
      "Noms de marque (Princeps)": "Propycil",
      "Posologie habituelle": "100-300 mg/j en 2-3 prises",
      "Posologie gériatrique": "100-150 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement nécessaire",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,8",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs SGLT2",
      "DCI (Molécule)": "Empagliflozin",
      "Noms de marque (Princeps)": "Jardiance",
      "Posologie habituelle": "10-25 mg/j",
      "Posologie gériatrique": "10 mg/j",
      "Adaptation fonction rénale": "ClCr < 45: efficacité réduite",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,86",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs SGLT2",
      "DCI (Molécule)": "Dapagliflozin",
      "Noms de marque (Princeps)": "Forxiga",
      "Posologie habituelle": "5-10 mg/j",
      "Posologie gériatrique": "5 mg/j",
      "Adaptation fonction rénale": "ClCr < 45: pas recommandé",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,91",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs SGLT2",
      "DCI (Molécule)": "Canagliflozin",
      "Noms de marque (Princeps)": "Invokana",
      "Posologie habituelle": "100-300 mg/j",
      "Posologie gériatrique": "100 mg/j",
      "Adaptation fonction rénale": "ClCr < 45: dose réd. recommandée",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs SGLT2",
      "DCI (Molécule)": "Ertugliflozin",
      "Noms de marque (Princeps)": "Steglatro",
      "Posologie habituelle": "5-15 mg/j",
      "Posologie gériatrique": "5 mg/j",
      "Adaptation fonction rénale": "ClCr < 45: surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,93",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Agonistes GLP-1",
      "DCI (Molécule)": "Exenatide",
      "Noms de marque (Princeps)": "Byetta, Bydureon",
      "Posologie habituelle": "5-10 µg SC 2x/j ou 2 mg/sem",
      "Posologie gériatrique": "5 µg SC 2x/j",
      "Adaptation fonction rénale": "ClCr < 30: éviter",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Agonistes GLP-1",
      "DCI (Molécule)": "Liraglutide",
      "Noms de marque (Princeps)": "Victoza",
      "Posologie habituelle": "0,6-1,8 mg/j SC",
      "Posologie gériatrique": "0,6-1,2 mg/j SC",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Anticoagulants léger effet",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Agonistes GLP-1",
      "DCI (Molécule)": "Dulaglutide",
      "Noms de marque (Princeps)": "Trulicity",
      "Posologie habituelle": "0,75-1,5 mg/sem SC",
      "Posologie gériatrique": "0,75 mg/sem SC",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Agonistes GLP-1",
      "DCI (Molécule)": "Sémaglutide",
      "Noms de marque (Princeps)": "Ozempic, Wegovy",
      "Posologie habituelle": "0,5-1 mg/sem SC",
      "Posologie gériatrique": "0,5 mg/sem SC",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Agonistes GLP-1",
      "DCI (Molécule)": "Tirzépatide",
      "Noms de marque (Princeps)": "Mounjaro",
      "Posologie habituelle": "2,5-15 mg/sem SC",
      "Posologie gériatrique": "2,5-5 mg/sem SC",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Amiloride",
      "Noms de marque (Princeps)": "Modamide",
      "Posologie habituelle": "5-10 mg/j",
      "Posologie gériatrique": "5 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: CI",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "10 - 20 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Bumétanide",
      "Noms de marque (Princeps)": "Burinex",
      "Posologie habituelle": "0,5-2 mg/j en 1-2 prises",
      "Posologie gériatrique": "0,5-1 mg/j",
      "Adaptation fonction rénale": "Adaptation selon ClCr",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Ciclétanine",
      "Noms de marque (Princeps)": "Tenstaten",
      "Posologie habituelle": "25 mg 2x/j",
      "Posologie gériatrique": "25 mg/j",
      "Adaptation fonction rénale": "Adaptation selon ClCr",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Éplérénone",
      "Noms de marque (Princeps)": "Inspra",
      "Posologie habituelle": "25-50 mg/j",
      "Posologie gériatrique": "25 mg/j",
      "Adaptation fonction rénale": "ClCr 30-59: surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,5",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Furosémide",
      "Noms de marque (Princeps)": "Lasilix",
      "Posologie habituelle": "20-250 mg/j",
      "Posologie gériatrique": "20-40 mg/j",
      "Adaptation fonction rénale": "Augmenter si ClCr < 30",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Hydrochlorothiazide",
      "Noms de marque (Princeps)": "Esidrex",
      "Posologie habituelle": "25-100 mg/j",
      "Posologie gériatrique": "12,5-25 mg/j",
      "Adaptation fonction rénale": "Éviter si ClCr < 30",
      "Interactions Médicamenteuses (DDI)": "Lithium, AINS, K+, Corticoïdes",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "40 - 68 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Indapamide",
      "Noms de marque (Princeps)": "Fludex",
      "Posologie habituelle": "2,5 mg/j",
      "Posologie gériatrique": "1,25-2,5 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,79",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Pirétanide",
      "Noms de marque (Princeps)": "Eurelix",
      "Posologie habituelle": "3-12 mg/j",
      "Posologie gériatrique": "3-6 mg/j",
      "Adaptation fonction rénale": "Augmenter si ClCr < 20",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Spironolactone",
      "Noms de marque (Princeps)": "Aldactone",
      "Posologie habituelle": "75-400 mg/j",
      "Posologie gériatrique": "25-75 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: surveillance",
      "Interactions Médicamenteuses (DDI)": "IEC, ARA2, AINS, K+, Lithium, Trimethoprime",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 90 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Diurétiques",
      "DCI (Molécule)": "Torasémide",
      "Noms de marque (Princeps)": "Torental",
      "Posologie habituelle": "2,5-10 mg/j",
      "Posologie gériatrique": "2,5-5 mg/j",
      "Adaptation fonction rénale": "Augmenter si ClCr < 20",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Bénazépril",
      "Noms de marque (Princeps)": "Cibacène",
      "Posologie habituelle": "5-40 mg/j",
      "Posologie gériatrique": "2,5-5 mg/j",
      "Adaptation fonction rénale": "ClCr 30-60: 50% dose",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Captopril",
      "Noms de marque (Princeps)": "Lopril",
      "Posologie habituelle": "25-150 mg/j en 2-3 prises",
      "Posologie gériatrique": "6,25-25 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: réduction 50%",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,3",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Cilazapril",
      "Noms de marque (Princeps)": "Justor",
      "Posologie habituelle": "0,5-2,5 mg/j",
      "Posologie gériatrique": "0,5 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "25 - 30 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Énalapril",
      "Noms de marque (Princeps)": "Renitec",
      "Posologie habituelle": "5-40 mg/j en 1-2 prises",
      "Posologie gériatrique": "2,5-5 mg/j",
      "Adaptation fonction rénale": "ClCr 30-60: 50% dose",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,5",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Fosinopril",
      "Noms de marque (Princeps)": "Fozitec",
      "Posologie habituelle": "10-40 mg/j",
      "Posologie gériatrique": "5-10 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 95 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Lisinopril",
      "Noms de marque (Princeps)": "Zestril, Prinivil",
      "Posologie habituelle": "5-40 mg/j",
      "Posologie gériatrique": "2,5-5 mg/j",
      "Adaptation fonction rénale": "ClCr 30-60: 5-10 mg/j",
      "Interactions Médicamenteuses (DDI)": "AINS, K+, Spironolactone, Diurétiques",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Moexipril",
      "Noms de marque (Princeps)": "Moex",
      "Posologie habituelle": "7,5-30 mg/j en 1-2 prises",
      "Posologie gériatrique": "3,75-7,5 mg/j",
      "Adaptation fonction rénale": "ClCr < 40: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,5",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Périndopril",
      "Noms de marque (Princeps)": "Coversyl",
      "Posologie habituelle": "2-8 mg/j",
      "Posologie gériatrique": "2 mg/j",
      "Adaptation fonction rénale": "ClCr 30-60: 2 mg/j",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "10 - 20 % (Pour le métabolite actif)",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Quinapril",
      "Noms de marque (Princeps)": "Acuitel",
      "Posologie habituelle": "10-40 mg/j",
      "Posologie gériatrique": "5-10 mg/j",
      "Adaptation fonction rénale": "ClCr < 60: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Ramipril",
      "Noms de marque (Princeps)": "Triatec",
      "Posologie habituelle": "1,25-10 mg/j",
      "Posologie gériatrique": "1,25-2,5 mg/j",
      "Adaptation fonction rénale": "ClCr < 60: 0,625-1,25 mg",
      "Interactions Médicamenteuses (DDI)": "AINS, K+, Spironolactone, Diurétiques",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,73",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Trandolapril",
      "Noms de marque (Princeps)": "Odrik",
      "Posologie habituelle": "0,5-4 mg/j",
      "Posologie gériatrique": "0,5 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 80 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IEC",
      "DCI (Molécule)": "Zofénopril",
      "Noms de marque (Princeps)": "Zofenil",
      "Posologie habituelle": "7,5-30 mg/j en 1-2 prises",
      "Posologie gériatrique": "7,5 mg/j",
      "Adaptation fonction rénale": "ClCr < 40: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,88",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Sartans (ARA II)",
      "DCI (Molécule)": "Candésartan",
      "Noms de marque (Princeps)": "Atacand, Kenzen",
      "Posologie habituelle": "4-32 mg/j",
      "Posologie gériatrique": "4-8 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Sartans (ARA II)",
      "DCI (Molécule)": "Éprosartan",
      "Noms de marque (Princeps)": "Teveten",
      "Posologie habituelle": "400-800 mg/j en 1-2 prises",
      "Posologie gériatrique": "400 mg/j",
      "Adaptation fonction rénale": "Surveillance si ClCr < 30",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Sartans (ARA II)",
      "DCI (Molécule)": "Irbésartan",
      "Noms de marque (Princeps)": "Aprovel",
      "Posologie habituelle": "75-300 mg/j",
      "Posologie gériatrique": "75-150 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,96",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Sartans (ARA II)",
      "DCI (Molécule)": "Losartan",
      "Noms de marque (Princeps)": "Cozaar",
      "Posologie habituelle": "25-100 mg/j en 1-2 prises",
      "Posologie gériatrique": "25-50 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "AINS, K+, Spironolactone, IEC",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Sartans (ARA II)",
      "DCI (Molécule)": "Olmésartan",
      "Noms de marque (Princeps)": "Alteis, Olmetec",
      "Posologie habituelle": "20-40 mg/j",
      "Posologie gériatrique": "20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,99",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Sartans (ARA II)",
      "DCI (Molécule)": "Telmisartan",
      "Noms de marque (Princeps)": "Micardis, Pritor",
      "Posologie habituelle": "20-80 mg/j",
      "Posologie gériatrique": "20-40 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Sartans (ARA II)",
      "DCI (Molécule)": "Valsartan",
      "Noms de marque (Princeps)": "Tareg",
      "Posologie habituelle": "80-320 mg/j",
      "Posologie gériatrique": "80 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: surveillance",
      "Interactions Médicamenteuses (DDI)": "AINS, K+, Spironolactone, IEC, ARA2",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Acébutolol",
      "Noms de marque (Princeps)": "Sectral",
      "Posologie habituelle": "200-400 mg/j",
      "Posologie gériatrique": "200 mg/j",
      "Adaptation fonction rénale": "ClCr < 50: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,25",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Aténolol",
      "Noms de marque (Princeps)": "Ténormine",
      "Posologie habituelle": "25-100 mg/j",
      "Posologie gériatrique": "25-50 mg/j",
      "Adaptation fonction rénale": "ClCr < 35: 50 mg/j max",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "< 10 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Bétaxolol",
      "Noms de marque (Princeps)": "Kerlone",
      "Posologie habituelle": "1 goutte x 2/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,5",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Bisoprolol",
      "Noms de marque (Princeps)": "Detensiel, Cardensiel",
      "Posologie habituelle": "1,25-10 mg/j",
      "Posologie gériatrique": "1,25 mg/j",
      "Adaptation fonction rénale": "ClCr < 20: 1,25 mg/j",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,3",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Cartéolol",
      "Noms de marque (Princeps)": "Mikelan",
      "Posologie habituelle": "1 goutte x 2/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,15",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Carvédilol",
      "Noms de marque (Princeps)": "Kredex",
      "Posologie habituelle": "6,25-25 mg/j en 2 prises",
      "Posologie gériatrique": "3,125-6,25 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Céliprololol",
      "Noms de marque (Princeps)": "Célectol",
      "Posologie habituelle": "200-400 mg/j",
      "Posologie gériatrique": "200 mg/j",
      "Adaptation fonction rénale": "Adapter si ClCr < 30",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Esmolol",
      "Noms de marque (Princeps)": "Brévibloc",
      "Posologie habituelle": "IV: 50-300 µg/kg/min",
      "Posologie gériatrique": "Demi-dose",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,55",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Labétalol",
      "Noms de marque (Princeps)": "Trandate",
      "Posologie habituelle": "100-400 mg/j en 2 prises",
      "Posologie gériatrique": "100 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,5",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Métoprolol",
      "Noms de marque (Princeps)": "Seloken, Lopressor",
      "Posologie habituelle": "100-250 mg/j en 2-3 prises",
      "Posologie gériatrique": "50-100 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "10 - 12 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Nadolol",
      "Noms de marque (Princeps)": "Corgard",
      "Posologie habituelle": "40-240 mg/j",
      "Posologie gériatrique": "20-40 mg/j",
      "Adaptation fonction rénale": "ClCr < 50: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,3",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Nébivolol",
      "Noms de marque (Princeps)": "Temerit, Nebilox",
      "Posologie habituelle": "5 mg/j",
      "Posologie gériatrique": "2,5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Pindolol",
      "Noms de marque (Princeps)": "Visken",
      "Posologie habituelle": "7,5-15 mg/j",
      "Posologie gériatrique": "5-7,5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "40 - 57 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Propranolol",
      "Noms de marque (Princeps)": "Avlocardyl",
      "Posologie habituelle": "80-320 mg/j en 2-4 prises",
      "Posologie gériatrique": "40-80 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bêtabloquants",
      "DCI (Molécule)": "Sotalol",
      "Noms de marque (Princeps)": "Sotalex",
      "Posologie habituelle": "80-320 mg/j en 2 prises",
      "Posologie gériatrique": "80-160 mg/j",
      "Adaptation fonction rénale": "ClCr 30-60: 50% dose",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Amlodipine",
      "Noms de marque (Princeps)": "Amlor",
      "Posologie habituelle": "5-10 mg/j",
      "Posologie gériatrique": "2,5-5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Macrolides, Diltiazem, Vérapamil, Grapefruit",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Clévidipine",
      "Noms de marque (Princeps)": "Cleviprex",
      "Posologie habituelle": "IV: 0,5-4 mg/h",
      "Posologie gériatrique": "0,5-2 mg/h",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Diltiazem",
      "Noms de marque (Princeps)": "Tildiem, Bi-Tildiem",
      "Posologie habituelle": "90-360 mg/j en 3-4 prises",
      "Posologie gériatrique": "90-180 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Beta-bloquants, Statines, Digoxine, CYP3A4",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,8",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Félodipine",
      "Noms de marque (Princeps)": "Flodil",
      "Posologie habituelle": "2,5-10 mg/j",
      "Posologie gériatrique": "2,5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Isradipine",
      "Noms de marque (Princeps)": "Icaz",
      "Posologie habituelle": "2,5-10 mg/j en 2-3 prises",
      "Posologie gériatrique": "2,5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Lercanidipine",
      "Noms de marque (Princeps)": "Zanidip",
      "Posologie habituelle": "10-20 mg/j",
      "Posologie gériatrique": "10 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Manidipine",
      "Noms de marque (Princeps)": "Iperten",
      "Posologie habituelle": "10-20 mg/j",
      "Posologie gériatrique": "10 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Nicardipine",
      "Noms de marque (Princeps)": "Loxen",
      "Posologie habituelle": "60-120 mg/j en 3 prises",
      "Posologie gériatrique": "30-60 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 95 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Nifédipine",
      "Noms de marque (Princeps)": "Chronadalate, Adalate",
      "Posologie habituelle": "30-120 mg/j selon forme",
      "Posologie gériatrique": "30-60 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Nimodipine",
      "Noms de marque (Princeps)": "Nimotop",
      "Posologie habituelle": "180 mg/j (60 mg x 3)",
      "Posologie gériatrique": "120-180 mg/j",
      "Adaptation fonction rénale": "Surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 95 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Nitrendipine",
      "Noms de marque (Princeps)": "Baypress",
      "Posologie habituelle": "10-20 mg/j en 2 prises",
      "Posologie gériatrique": "10 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs calciques",
      "DCI (Molécule)": "Vérapamil",
      "Noms de marque (Princeps)": "Isoptine",
      "Posologie habituelle": "240-480 mg/j en 3-4 prises",
      "Posologie gériatrique": "120-240 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Beta-bloquants, Digoxine, Carbamazépine",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "AOD (Anticoagulants)",
      "DCI (Molécule)": "Apixaban",
      "Noms de marque (Princeps)": "Eliquis",
      "Posologie habituelle": "5 mg 2x/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "ClCr < 15: CI",
      "Interactions Médicamenteuses (DDI)": "AINS, Aspirine, Fluconazole",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "AOD (Anticoagulants)",
      "DCI (Molécule)": "Dabigatran",
      "Noms de marque (Princeps)": "Pradaxa",
      "Posologie habituelle": "150 mg 2x/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "ClCr < 15: CI",
      "Interactions Médicamenteuses (DDI)": "Clarithromycine, Azoles, Ciclosporine, Antiviraux",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,35",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "AOD (Anticoagulants)",
      "DCI (Molécule)": "Édoxaban",
      "Noms de marque (Princeps)": "Lixiana",
      "Posologie habituelle": "60 mg/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "ClCr < 15: CI",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,55",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "AOD (Anticoagulants)",
      "DCI (Molécule)": "Rivaroxaban",
      "Noms de marque (Princeps)": "Xarelto",
      "Posologie habituelle": "20 mg/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "ClCr < 15: CI",
      "Interactions Médicamenteuses (DDI)": "Macrolides, Ketoconazole, Fluconazole",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "92 - 95 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "AVK",
      "DCI (Molécule)": "Acénocoumarol",
      "Noms de marque (Princeps)": "Sintrom",
      "Posologie habituelle": "2-10 mg/j (INR)",
      "Posologie gériatrique": "Identique (INR cible)",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "AVK",
      "DCI (Molécule)": "Fluindione",
      "Noms de marque (Princeps)": "Previscan",
      "Posologie habituelle": "25-75 mg/j (INR)",
      "Posologie gériatrique": "Identique (INR cible)",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "AVK",
      "DCI (Molécule)": "Warfarine",
      "Noms de marque (Princeps)": "Coumadine",
      "Posologie habituelle": "2-10 mg/j (INR)",
      "Posologie gériatrique": "Identique (INR cible)",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aspirine, AINS, Macrolides, Fluconazole, Méthotrexate",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiagrégants",
      "DCI (Molécule)": "Acide acétylsalicylique",
      "Noms de marque (Princeps)": "Kardegic, Aspegic",
      "Posologie habituelle": "300-500 mg x 3-4/j",
      "Posologie gériatrique": "100-300 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "80 - 90 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiagrégants",
      "DCI (Molécule)": "Clopidogrel",
      "Noms de marque (Princeps)": "Plavix",
      "Posologie habituelle": "600 mg puis 75 mg/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Oméprazole, AINS, Warfarine, Lansoprazole",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiagrégants",
      "DCI (Molécule)": "Prasugrel",
      "Noms de marque (Princeps)": "Efient",
      "Posologie habituelle": "600 mg puis 5-10 mg/j",
      "Posologie gériatrique": "600 mg puis 5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiagrégants",
      "DCI (Molécule)": "Ticagrélor",
      "Noms de marque (Princeps)": "Brilique",
      "Posologie habituelle": "600 mg puis 60-90 mg x2/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiagrégants",
      "DCI (Molécule)": "Ticlopidine",
      "Noms de marque (Princeps)": "Ticlid",
      "Posologie habituelle": "250 mg 2x/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Statines",
      "DCI (Molécule)": "Atorvastatine",
      "Noms de marque (Princeps)": "Tahor",
      "Posologie habituelle": "10-80 mg/j",
      "Posologie gériatrique": "10-40 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Macrolides, Azoles, Amiodarone, Protéase",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Statines",
      "DCI (Molécule)": "Fluvastatine",
      "Noms de marque (Princeps)": "Lescol",
      "Posologie habituelle": "20-80 mg/j",
      "Posologie gériatrique": "20-40 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Statines",
      "DCI (Molécule)": "Pravastatine",
      "Noms de marque (Princeps)": "Elisor, Vasten",
      "Posologie habituelle": "10-40 mg/j",
      "Posologie gériatrique": "10-20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,5",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Statines",
      "DCI (Molécule)": "Rosuvastatine",
      "Noms de marque (Princeps)": "Crestor",
      "Posologie habituelle": "5-40 mg/j",
      "Posologie gériatrique": "5-20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Cyclosporine, Atazanavir",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Statines",
      "DCI (Molécule)": "Simvastatine",
      "Noms de marque (Princeps)": "Zocor, Lodales",
      "Posologie habituelle": "10-80 mg/j",
      "Posologie gériatrique": "10-40 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Macrolides, Fluconazole, Clarithromycine, Vérapamil",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs IRS/N",
      "DCI (Molécule)": "Citalopram",
      "Noms de marque (Princeps)": "Seropram",
      "Posologie habituelle": "20-40 mg/j",
      "Posologie gériatrique": "20 mg/j max",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "IMAO, Macrolides, QT long",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,8",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs IRS/N",
      "DCI (Molécule)": "Duloxétine",
      "Noms de marque (Princeps)": "Cymbalta",
      "Posologie habituelle": "30-60 mg/j",
      "Posologie gériatrique": "30 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: éviter",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 90 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs IRS/N",
      "DCI (Molécule)": "Escitalopram",
      "Noms de marque (Princeps)": "Seroplex",
      "Posologie habituelle": "10-20 mg/j",
      "Posologie gériatrique": "10 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,56",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs IRS/N",
      "DCI (Molécule)": "Fluoxétine",
      "Noms de marque (Princeps)": "Prozac",
      "Posologie habituelle": "20-60 mg/j",
      "Posologie gériatrique": "20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "IMAO, Tramadol, Warfarine",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs IRS/N",
      "DCI (Molécule)": "Fluvoxamine",
      "Noms de marque (Princeps)": "Floxyfral",
      "Posologie habituelle": "50-300 mg/j en 1-2 prises",
      "Posologie gériatrique": "50 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,8",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs IRS/N",
      "DCI (Molécule)": "Milnacipran",
      "Noms de marque (Princeps)": "Ixel",
      "Posologie habituelle": "100 mg/j en 2 prises",
      "Posologie gériatrique": "50-100 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,13",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs IRS/N",
      "DCI (Molécule)": "Paroxétine",
      "Noms de marque (Princeps)": "Deroxat",
      "Posologie habituelle": "20-60 mg/j",
      "Posologie gériatrique": "20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs IRS/N",
      "DCI (Molécule)": "Sertraline",
      "Noms de marque (Princeps)": "Zoloft",
      "Posologie habituelle": "50-200 mg/j",
      "Posologie gériatrique": "50 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "IMAO, Tramadol, Lithium, Warfarine, QT",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs IRS/N",
      "DCI (Molécule)": "Venlafaxine",
      "Noms de marque (Princeps)": "Effexor",
      "Posologie habituelle": "75-375 mg/j",
      "Posologie gériatrique": "37,5-75 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: réduction 50%",
      "Interactions Médicamenteuses (DDI)": "IMAO, Lithium, Tramadol, QT",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "27 - 30 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Alprazolam",
      "Noms de marque (Princeps)": "Xanax",
      "Posologie habituelle": "0,25-3 mg/j",
      "Posologie gériatrique": "0,125-0,5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,8",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Bromazépam",
      "Noms de marque (Princeps)": "Lexomil",
      "Posologie habituelle": "3-18 mg/j",
      "Posologie gériatrique": "1,5-6 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,7",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Clobazam",
      "Noms de marque (Princeps)": "Urbanyl",
      "Posologie habituelle": "20-80 mg/j",
      "Posologie gériatrique": "20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,85",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Clonazépam",
      "Noms de marque (Princeps)": "Rivotril",
      "Posologie habituelle": "1-8 mg/j",
      "Posologie gériatrique": "0,25-1 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,85",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Clorazépate",
      "Noms de marque (Princeps)": "Tranxène",
      "Posologie habituelle": "7,5-60 mg/j",
      "Posologie gériatrique": "7,5-15 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Clotiazépam",
      "Noms de marque (Princeps)": "Vératran",
      "Posologie habituelle": "5-20 mg/j",
      "Posologie gériatrique": "2,5-5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Diazépam",
      "Noms de marque (Princeps)": "Valium",
      "Posologie habituelle": "5-40 mg/j",
      "Posologie gériatrique": "2-5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Estazolam",
      "Noms de marque (Princeps)": "Nuctaion",
      "Posologie habituelle": "1-2 mg au coucher",
      "Posologie gériatrique": "0,5-1 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,93",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Loprazolam",
      "Noms de marque (Princeps)": "Havlane",
      "Posologie habituelle": "1-2 mg au coucher",
      "Posologie gériatrique": "0,5-1 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,8",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Lorazépam",
      "Noms de marque (Princeps)": "Temesta",
      "Posologie habituelle": "2-9 mg/j",
      "Posologie gériatrique": "0,5-2 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,85",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Lormétazépam",
      "Noms de marque (Princeps)": "Noctamide",
      "Posologie habituelle": "1-2 mg au coucher",
      "Posologie gériatrique": "0,5-1 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,85",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Nitrazépam",
      "Noms de marque (Princeps)": "Mogadon",
      "Posologie habituelle": "5-10 mg au coucher",
      "Posologie gériatrique": "2,5-5 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,87",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Nordazépam",
      "Noms de marque (Princeps)": "Nordaz",
      "Posologie habituelle": "15-30 mg/j",
      "Posologie gériatrique": "7,5-15 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Oxazépam",
      "Noms de marque (Princeps)": "Seresta",
      "Posologie habituelle": "15-60 mg/j",
      "Posologie gériatrique": "7,5-15 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Prazépam",
      "Noms de marque (Princeps)": "Lysanxia",
      "Posologie habituelle": "20-60 mg/j",
      "Posologie gériatrique": "10-20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Zolpidem",
      "Noms de marque (Princeps)": "Stilnox",
      "Posologie habituelle": "5-10 mg au coucher",
      "Posologie gériatrique": "5 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,92",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Benzodiazépines & Z",
      "DCI (Molécule)": "Zopiclone",
      "Noms de marque (Princeps)": "Imovane",
      "Posologie habituelle": "3,75-7,5 mg au coucher",
      "Posologie gériatrique": "3,75 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,45",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atyp.",
      "DCI (Molécule)": "Amisulpride",
      "Noms de marque (Princeps)": "Solian",
      "Posologie habituelle": "50-800 mg/j",
      "Posologie gériatrique": "50-300 mg/j",
      "Adaptation fonction rénale": "ClCr 30-60: 50% dose",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,16",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atyp.",
      "DCI (Molécule)": "Aripiprazole",
      "Noms de marque (Princeps)": "Abilify",
      "Posologie habituelle": "10-15 mg/j",
      "Posologie gériatrique": "10 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atyp.",
      "DCI (Molécule)": "Clozapine",
      "Noms de marque (Princeps)": "Leponex",
      "Posologie habituelle": "150-600 mg/j",
      "Posologie gériatrique": "50-300 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atyp.",
      "DCI (Molécule)": "Olanzapine",
      "Noms de marque (Princeps)": "Zyprexa",
      "Posologie habituelle": "5-20 mg/j",
      "Posologie gériatrique": "5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,93",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atyp.",
      "DCI (Molécule)": "Palipéridone",
      "Noms de marque (Princeps)": "Xeplion, Invega",
      "Posologie habituelle": "3-12 mg/j",
      "Posologie gériatrique": "3 mg/j",
      "Adaptation fonction rénale": "ClCr < 60: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,74",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atyp.",
      "DCI (Molécule)": "Quétiapine",
      "Noms de marque (Princeps)": "Xeroquel",
      "Posologie habituelle": "150-750 mg/j",
      "Posologie gériatrique": "100-300 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,83",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atyp.",
      "DCI (Molécule)": "Rispéridone",
      "Noms de marque (Princeps)": "Risperdal",
      "Posologie habituelle": "2-8 mg/j",
      "Posologie gériatrique": "1-4 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atyp.",
      "DCI (Molécule)": "Tiapride",
      "Noms de marque (Princeps)": "Tiapridal",
      "Posologie habituelle": "100-600 mg/j",
      "Posologie gériatrique": "100-300 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "< 10 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Carbamazépine",
      "Noms de marque (Princeps)": "Tégretol",
      "Posologie habituelle": "400-1200 mg/j",
      "Posologie gériatrique": "400-800 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Warfarine, Contraceptifs, Statines",
      "Score ACB": "2",
      "Score CIA": "2",
      "Liaison Albumine (%)": "70 - 80 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Gabapentine",
      "Noms de marque (Princeps)": "Neurontin",
      "Posologie habituelle": "900-3600 mg/j",
      "Posologie gériatrique": "900-1800 mg/j",
      "Adaptation fonction rénale": "ClCr < 60: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "< 3 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Lacosamide",
      "Noms de marque (Princeps)": "Vimpat",
      "Posologie habituelle": "200-400 mg/j",
      "Posologie gériatrique": "200 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "< 15 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Lamotrigine",
      "Noms de marque (Princeps)": "Lamictal",
      "Posologie habituelle": "100-500 mg/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Contraceptifs, Valproate",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,55",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Lévétiracétam",
      "Noms de marque (Princeps)": "Keppra",
      "Posologie habituelle": "1000-3000 mg/j",
      "Posologie gériatrique": "500-1500 mg/j",
      "Adaptation fonction rénale": "ClCr < 60: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "< 10 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Oxcarbazépine",
      "Noms de marque (Princeps)": "Trileptal",
      "Posologie habituelle": "600-2400 mg/j",
      "Posologie gériatrique": "600-1200 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "2",
      "Score CIA": "2",
      "Liaison Albumine (%)": "0,4",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Prégabaline",
      "Noms de marque (Princeps)": "Lyrica",
      "Posologie habituelle": "150-600 mg/j",
      "Posologie gériatrique": "75-300 mg/j",
      "Adaptation fonction rénale": "ClCr < 60: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Topiramate",
      "Noms de marque (Princeps)": "Epitomax",
      "Posologie habituelle": "25-400 mg/j",
      "Posologie gériatrique": "25-100 mg/j",
      "Adaptation fonction rénale": "ClCr < 60: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "15 - 41 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Valproate",
      "Noms de marque (Princeps)": "Dépakine",
      "Posologie habituelle": "500-2500 mg/j",
      "Posologie gériatrique": "500-1000 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Warfarine, Lamotrigine, Méthotrexate",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiépileptiques/Doul.",
      "DCI (Molécule)": "Zonisamide",
      "Noms de marque (Princeps)": "Zonegran",
      "Posologie habituelle": "100-500 mg/j",
      "Posologie gériatrique": "100 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "40 - 50 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 1",
      "DCI (Molécule)": "Paracétamol",
      "Noms de marque (Princeps)": "Doliprane, Dafalgan, Efferalgan",
      "Posologie habituelle": "500-1000 mg x 3-4/j",
      "Posologie gériatrique": "Max 3 g/j",
      "Adaptation fonction rénale": "ClCr < 30: espacer",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "10 - 25 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 1",
      "DCI (Molécule)": "Néfopam",
      "Noms de marque (Princeps)": "Acupan",
      "Posologie habituelle": "180-360 mg/j",
      "Posologie gériatrique": "180 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,73",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 2",
      "DCI (Molécule)": "Codéine",
      "Noms de marque (Princeps)": "Codenfan, Dicodin",
      "Posologie habituelle": "30-60 mg x 3-4/j",
      "Posologie gériatrique": "15-30 mg/j",
      "Adaptation fonction rénale": "Espacer si ClCr < 30",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "7 - 25 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 2",
      "DCI (Molécule)": "Dihydrocodéine",
      "Noms de marque (Princeps)": "Dicodin LP",
      "Posologie habituelle": "30 mg x 2-3/j",
      "Posologie gériatrique": "15-30 mg/j",
      "Adaptation fonction rénale": "Espacer si ClCr < 30",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,5",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 2",
      "DCI (Molécule)": "Poudre d'opium",
      "Noms de marque (Princeps)": "Lamaline, Izalgi",
      "Posologie habituelle": "10-30 mg x 2-3/j",
      "Posologie gériatrique": "10 mg/j",
      "Adaptation fonction rénale": "Espacer si ClCr < 30",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "Variable (Morphine 35%, Codéine 7%)",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 2",
      "DCI (Molécule)": "Tramadol",
      "Noms de marque (Princeps)": "Topalgic, Contramal, Ixprim",
      "Posologie habituelle": "50-100 mg x 2-4/j",
      "Posologie gériatrique": "50-100 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: 100 mg/j max",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,2",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 3",
      "DCI (Molécule)": "Buprénorphine",
      "Noms de marque (Princeps)": "Temgesic, Transtec",
      "Posologie habituelle": "0,2-0,4 mg x 2-3/j",
      "Posologie gériatrique": "0,1-0,2 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,96",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 3",
      "DCI (Molécule)": "Fentanyl",
      "Noms de marque (Princeps)": "Durogesic, Actiq, Abstral",
      "Posologie habituelle": "12-100 µg patches",
      "Posologie gériatrique": "12-25 µg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "80 - 85 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 3",
      "DCI (Molécule)": "Hydromorphone",
      "Noms de marque (Princeps)": "Sophidone",
      "Posologie habituelle": "4-16 mg/j",
      "Posologie gériatrique": "2-4 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "8 - 19 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 3",
      "DCI (Molécule)": "Morphine",
      "Noms de marque (Princeps)": "Skénan, Actiskenan, Oramorph",
      "Posologie habituelle": "10-30 mg x 3-4/j",
      "Posologie gériatrique": "5-10 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,35",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 3",
      "DCI (Molécule)": "Oxycodone",
      "Noms de marque (Princeps)": "Oxycontin, Oxynorm",
      "Posologie habituelle": "5-20 mg x 2-4/j",
      "Posologie gériatrique": "2,5-5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,45",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antalgiques Palier 3",
      "DCI (Molécule)": "Tapentadol",
      "Noms de marque (Princeps)": "Palexia",
      "Posologie habituelle": "50-100 mg x 1-2/j",
      "Posologie gériatrique": "50 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,2",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antigouteux",
      "DCI (Molécule)": "Allopurinol",
      "Noms de marque (Princeps)": "Zyloric",
      "Posologie habituelle": "100-800 mg/j",
      "Posologie gériatrique": "100-300 mg/j",
      "Adaptation fonction rénale": "ClCr < 60: réduction",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "< 5 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antigouteux",
      "DCI (Molécule)": "Colchicine",
      "Noms de marque (Princeps)": "Colchicine Opocalcium, Colchimax",
      "Posologie habituelle": "0,5-1 mg/j",
      "Posologie gériatrique": "0,5 mg/j",
      "Adaptation fonction rénale": "ClCr < 30: 0,5 mg x2/sem",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,39",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antigouteux",
      "DCI (Molécule)": "Fébusostat",
      "Noms de marque (Princeps)": "Adenuric",
      "Posologie habituelle": "40-120 mg/j",
      "Posologie gériatrique": "40-80 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Biguanides",
      "DCI (Molécule)": "Metformine",
      "Noms de marque (Princeps)": "Glucophage, Stagid",
      "Posologie habituelle": "500-2550 mg/j",
      "Posologie gériatrique": "500-1000 mg/j",
      "Adaptation fonction rénale": "ClCr < 45: réduction",
      "Interactions Médicamenteuses (DDI)": "Contraste iodé, Alcool, Diurétiques, SGLT2i",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs DPP-4",
      "DCI (Molécule)": "Alogliptine",
      "Noms de marque (Princeps)": "Vipidia",
      "Posologie habituelle": "25 mg/j",
      "Posologie gériatrique": "25 mg/j",
      "Adaptation fonction rénale": "ClCr < 60: 12,5 mg/j",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,2",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs DPP-4",
      "DCI (Molécule)": "Saxagliptine",
      "Noms de marque (Princeps)": "Onglyza",
      "Posologie habituelle": "2,5-5 mg/j",
      "Posologie gériatrique": "2,5 mg/j",
      "Adaptation fonction rénale": "ClCr < 45: 2,5 mg/j",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs DPP-4",
      "DCI (Molécule)": "Sitagliptine",
      "Noms de marque (Princeps)": "Januvia, Xelevia",
      "Posologie habituelle": "100 mg/j",
      "Posologie gériatrique": "100 mg/j",
      "Adaptation fonction rénale": "ClCr 45-50: 50 mg/j",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,38",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Inhibiteurs DPP-4",
      "DCI (Molécule)": "Vildagliptine",
      "Noms de marque (Princeps)": "Galvus",
      "Posologie habituelle": "50-100 mg/j",
      "Posologie gériatrique": "50 mg/j",
      "Adaptation fonction rénale": "ClCr < 50: 50 mg/j",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,09",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Insulines",
      "DCI (Molécule)": "Insuline Aspart",
      "Noms de marque (Princeps)": "Novorapid, Fiasp",
      "Posologie habituelle": "Variée selon schéma",
      "Posologie gériatrique": "Réduite",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0 - 9 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Insulines",
      "DCI (Molécule)": "Insuline Dégludec",
      "Noms de marque (Princeps)": "Tresiba",
      "Posologie habituelle": "10-100 U/j",
      "Posologie gériatrique": "Réduite",
      "Adaptation fonction rénale": "Surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Insulines",
      "DCI (Molécule)": "Insuline Détémir",
      "Noms de marque (Princeps)": "Levemir",
      "Posologie habituelle": "10-100 U/j",
      "Posologie gériatrique": "Réduite",
      "Adaptation fonction rénale": "Surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Insulines",
      "DCI (Molécule)": "Insuline Glargine",
      "Noms de marque (Princeps)": "Lantus, Toujeo, Abasaglar",
      "Posologie habituelle": "10-100 U/j",
      "Posologie gériatrique": "Réduite",
      "Adaptation fonction rénale": "Surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "Faible",
      "Commentaire liaison albumine": "(mais se lie localement en s.c.)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Insulines",
      "DCI (Molécule)": "Insuline Glulisine",
      "Noms de marque (Princeps)": "Apidra",
      "Posologie habituelle": "Variée selon repas",
      "Posologie gériatrique": "Réduite",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Insulines",
      "DCI (Molécule)": "Insuline Humaine",
      "Noms de marque (Princeps)": "Umuline, Actrapid",
      "Posologie habituelle": "Variée selon schéma",
      "Posologie gériatrique": "Réduite",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "< 5 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Insulines",
      "DCI (Molécule)": "Insuline Lispro",
      "Noms de marque (Princeps)": "Humalog",
      "Posologie habituelle": "Variée selon repas",
      "Posologie gériatrique": "Réduite",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Hormones thyroïdiennes",
      "DCI (Molécule)": "Lévothyroxine",
      "Noms de marque (Princeps)": "Levothyrox, TCaps, L-Thyroxin",
      "Posologie habituelle": "25-200 µg/j",
      "Posologie gériatrique": "25-75 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": "(TBG, TTR, albumine",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Hormones thyroïdiennes",
      "DCI (Molécule)": "Liothyronine",
      "Noms de marque (Princeps)": "Cynomel",
      "Posologie habituelle": "25-100 µg/j",
      "Posologie gériatrique": "12,5-25 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Hormones thyroïdiennes",
      "DCI (Molécule)": "Tiratricol",
      "Noms de marque (Princeps)": "Teatrois",
      "Posologie habituelle": "1-4 mg/j",
      "Posologie gériatrique": "1 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Vitamine D",
      "DCI (Molécule)": "Alfacalcidol",
      "Noms de marque (Princeps)": "Un-Alfa",
      "Posologie habituelle": "0,5-2 µg/j",
      "Posologie gériatrique": "0,5-1 µg/j",
      "Adaptation fonction rénale": "Adaptation nécessaire",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": "(Lié à la DBP - Vitamin D Binding Protein)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Vitamine D",
      "DCI (Molécule)": "Calcifédiol",
      "Noms de marque (Princeps)": "Dedrogyl",
      "Posologie habituelle": "20-100 µg/j",
      "Posologie gériatrique": "20-50 µg/j",
      "Adaptation fonction rénale": "Adaptation",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": "(Lié à la DBP - Vitamin D Binding Protein)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Vitamine D",
      "DCI (Molécule)": "Calcitriol",
      "Noms de marque (Princeps)": "Rocaltrol",
      "Posologie habituelle": "0,25-2 µg x 2/j",
      "Posologie gériatrique": "0,25 µg x2/j",
      "Adaptation fonction rénale": "Adaptation",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": "(Lié à la DBP - Vitamin D Binding Protein)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Vitamine D",
      "DCI (Molécule)": "Cholécalciférol",
      "Noms de marque (Princeps)": "Uvedose, ZymaD, Adrigyl",
      "Posologie habituelle": "400-2000 UI/j",
      "Posologie gériatrique": "800-1000 UI/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": "(Lié à la DBP - Vitamin D Binding Protein)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Vitamine D",
      "DCI (Molécule)": "Ergocalciférol",
      "Noms de marque (Princeps)": "Sterogyl",
      "Posologie habituelle": "400-1000 UI/j",
      "Posologie gériatrique": "600-800 UI/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": "(Lié à la DBP - Vitamin D Binding Protein)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Suppléments calciques",
      "DCI (Molécule)": "Carbonate de calcium",
      "Noms de marque (Princeps)": "Orocal, Calciforte, Caltrate",
      "Posologie habituelle": "1-3 g/j",
      "Posologie gériatrique": "1-2 g/j",
      "Adaptation fonction rénale": "ClCr < 30: surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "~ 45 %",
      "Commentaire liaison albumine": "(fraction liée dans le sang)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Suppléments calciques",
      "DCI (Molécule)": "Pidolate de calcium",
      "Noms de marque (Princeps)": "Ostéocalcium",
      "Posologie habituelle": "1-3 g/j",
      "Posologie gériatrique": "1-2 g/j",
      "Adaptation fonction rénale": "ClCr < 30: surveillance",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "~ 45 %",
      "Commentaire liaison albumine": "(fraction liée dans le sang)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "IPP",
      "DCI (Molécule)": "Ésoméprazole",
      "Noms de marque (Princeps)": "Inexium",
      "Posologie habituelle": "20-40 mg/j",
      "Posologie gériatrique": "20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "IPP",
      "DCI (Molécule)": "Lansoprazole",
      "Noms de marque (Princeps)": "Ogast, Lanzor",
      "Posologie habituelle": "15-30 mg/j",
      "Posologie gériatrique": "15 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Clopidogrel, Anticoagulants, Méthotrexate",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "IPP",
      "DCI (Molécule)": "Oméprazole",
      "Noms de marque (Princeps)": "Mopral, Zoltum",
      "Posologie habituelle": "20-40 mg/j",
      "Posologie gériatrique": "20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Clopidogrel, Méthotrexate, Atazanavir",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "IPP",
      "DCI (Molécule)": "Pantoprazole",
      "Noms de marque (Princeps)": "Inipomp, Eupantol",
      "Posologie habituelle": "20-40 mg/j",
      "Posologie gériatrique": "20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Clopidogrel, Méthotrexate",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "IPP",
      "DCI (Molécule)": "Rabéprazole",
      "Noms de marque (Princeps)": "Pariet",
      "Posologie habituelle": "10-20 mg/j",
      "Posologie gériatrique": "10 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Laxatifs osmotiques",
      "DCI (Molécule)": "Lactitol",
      "Noms de marque (Princeps)": "Importal",
      "Posologie habituelle": "10-20 g/j",
      "Posologie gériatrique": "10 g/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": "Non absorbé",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Laxatifs osmotiques",
      "DCI (Molécule)": "Lactulose",
      "Noms de marque (Princeps)": "Duphalac, Melaxose",
      "Posologie habituelle": "15-30 ml/j",
      "Posologie gériatrique": "15 ml/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": "Non absorbé",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Laxatifs osmotiques",
      "DCI (Molécule)": "Macrogol",
      "Noms de marque (Princeps)": "Forlax, Transipeg, Movicol",
      "Posologie habituelle": "1-4 sachets/j",
      "Posologie gériatrique": "1-2 sachets/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": "Non absorbé",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Béclométasone",
      "Noms de marque (Princeps)": "Qvar, Becotide",
      "Posologie habituelle": "200-800 µg/j inhalé",
      "Posologie gériatrique": "200-400 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,87",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Budésonide",
      "Noms de marque (Princeps)": "Pulmicort",
      "Posologie habituelle": "200-800 µg/j inhalé",
      "Posologie gériatrique": "200-400 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "85 - 90 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Ciclésonide",
      "Noms de marque (Princeps)": "Alvesco",
      "Posologie habituelle": "160-320 µg/j inhalé",
      "Posologie gériatrique": "160 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,99",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Fluticasone",
      "Noms de marque (Princeps)": "Flixotide",
      "Posologie habituelle": "88-880 µg/j inhalé",
      "Posologie gériatrique": "88-220 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,99",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Formotérol",
      "Noms de marque (Princeps)": "Foradil, Asmelor",
      "Posologie habituelle": "12-24 µg/j inhalé",
      "Posologie gériatrique": "12 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "50 - 65 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Spécial (SR)"
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Glycopyrronium",
      "Noms de marque (Princeps)": "Seebri",
      "Posologie habituelle": "50 µg/j inhalé",
      "Posologie gériatrique": "50 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "2",
      "Score CIA": "2",
      "Liaison Albumine (%)": "38 - 41 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Indacatérol",
      "Noms de marque (Princeps)": "Onbrez",
      "Posologie habituelle": "75-150 µg/j inhalé",
      "Posologie gériatrique": "75 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Spécial (SR)"
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Ipratropium",
      "Noms de marque (Princeps)": "Atrovent",
      "Posologie habituelle": "40-80 µg x 3-4/j inhalé",
      "Posologie gériatrique": "40 µg x 2-3/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "2",
      "Score CIA": "2",
      "Liaison Albumine (%)": "< 9 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Salbutamol",
      "Noms de marque (Princeps)": "Ventoline",
      "Posologie habituelle": "100-200 µg inhalé",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,1",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Spécial (SR)"
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Salmétérol",
      "Noms de marque (Princeps)": "Sérévent",
      "Posologie habituelle": "25-50 µg x 2/j inhalé",
      "Posologie gériatrique": "25 µg x2/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,96",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Spécial (SR)"
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Terbutaline",
      "Noms de marque (Princeps)": "Bricanyl",
      "Posologie habituelle": "0,25-0,5 mg",
      "Posologie gériatrique": "0,25 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,25",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Spécial (SR)"
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Tiotropium",
      "Noms de marque (Princeps)": "Spiriva",
      "Posologie habituelle": "18 µg/j inhalé",
      "Posologie gériatrique": "18 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "2",
      "Score CIA": "2",
      "Liaison Albumine (%)": "0,72",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Bronchodilatateurs/CSI",
      "DCI (Molécule)": "Umeclidinium",
      "Noms de marque (Princeps)": "Incruse",
      "Posologie habituelle": "62,5 µg/j inhalé",
      "Posologie gériatrique": "62,5 µg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "2",
      "Score CIA": "2",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Alphabloquants (HBP)",
      "DCI (Molécule)": "Alfuzosine",
      "Noms de marque (Princeps)": "Xatral",
      "Posologie habituelle": "2,5-10 mg/j",
      "Posologie gériatrique": "2,5-5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Alphabloquants (HBP)",
      "DCI (Molécule)": "Doxazosine",
      "Noms de marque (Princeps)": "Zoxan",
      "Posologie habituelle": "1-16 mg/j",
      "Posologie gériatrique": "1-4 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Alphabloquants (HBP)",
      "DCI (Molécule)": "Prazosine",
      "Noms de marque (Princeps)": "Minipress",
      "Posologie habituelle": "0,5-15 mg/j",
      "Posologie gériatrique": "0,5-2 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Alphabloquants (HBP)",
      "DCI (Molécule)": "Silodosine",
      "Noms de marque (Princeps)": "Silodyx",
      "Posologie habituelle": "8 mg/j",
      "Posologie gériatrique": "8 mg/j",
      "Adaptation fonction rénale": "ClCr < 50: 4 mg/j",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,96",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Alphabloquants (HBP)",
      "DCI (Molécule)": "Tamsulosine",
      "Noms de marque (Princeps)": "Josir, Omix, Mecir",
      "Posologie habituelle": "0,4 mg/j",
      "Posologie gériatrique": "0,4 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,99",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Alphabloquants (HBP)",
      "DCI (Molécule)": "Térazosine",
      "Noms de marque (Princeps)": "Dysalpha, Hytrine",
      "Posologie habituelle": "1-20 mg/j",
      "Posologie gériatrique": "1-5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "90 - 94 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Apraclonidine",
      "Noms de marque (Princeps)": "Iopidine",
      "Posologie habituelle": "1 goutte x 3/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "Faible",
      "Commentaire liaison albumine": "(absorption systémique minime)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Bétaxolol",
      "Noms de marque (Princeps)": "Betoptic",
      "Posologie habituelle": "1 goutte x 2/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,5",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Bimatoprost",
      "Noms de marque (Princeps)": "Lumigan",
      "Posologie habituelle": "1 goutte/j soir",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,88",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Brimonidine",
      "Noms de marque (Princeps)": "Alphagan",
      "Posologie habituelle": "1 goutte x 2-3/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,29",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Brinzolamide",
      "Noms de marque (Princeps)": "Azopt",
      "Posologie habituelle": "1 goutte x 3/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,6",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Cartéolol",
      "Noms de marque (Princeps)": "Carteol",
      "Posologie habituelle": "1 goutte x 2/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,15",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Dorzolamide",
      "Noms de marque (Princeps)": "Trusopt",
      "Posologie habituelle": "1 goutte x 3/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,33",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Latanoprost",
      "Noms de marque (Princeps)": "Xalatan",
      "Posologie habituelle": "1 goutte/j soir",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,87",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Pilocarpine",
      "Noms de marque (Princeps)": "Isopto Pilocarpine",
      "Posologie habituelle": "1 goutte x 2-4/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Tafluprost",
      "Noms de marque (Princeps)": "Saflutan",
      "Posologie habituelle": "1 goutte/j soir",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,99",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Timolol",
      "Noms de marque (Princeps)": "Timoptol",
      "Posologie habituelle": "1 goutte x 2/j",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,6",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Collyres glaucome",
      "DCI (Molécule)": "Travoprost",
      "Noms de marque (Princeps)": "Travatan",
      "Posologie habituelle": "1 goutte/j soir",
      "Posologie gériatrique": "Identique",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "Faible",
      "Commentaire liaison albumine": "(absorption systémique minime)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Corticoïdes oraux",
      "DCI (Molécule)": "Bétaméthasone",
      "Noms de marque (Princeps)": "Célestène",
      "Posologie habituelle": "0,5-7 mg/j",
      "Posologie gériatrique": "0,5-2 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "60 - 65 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Corticoïdes oraux",
      "DCI (Molécule)": "Cortisone",
      "Noms de marque (Princeps)": "Cortisone Roussel",
      "Posologie habituelle": "20-300 mg/j",
      "Posologie gériatrique": "10-25 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": "CBG et albumine",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Corticoïdes oraux",
      "DCI (Molécule)": "Dexaméthasone",
      "Noms de marque (Princeps)": "Dectancyl",
      "Posologie habituelle": "0,5-10 mg/j",
      "Posologie gériatrique": "0,5-2 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,77",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Corticoïdes oraux",
      "DCI (Molécule)": "Hydrocortisone",
      "Noms de marque (Princeps)": "Hydrocortisone Roussel",
      "Posologie habituelle": "20-300 mg/j",
      "Posologie gériatrique": "20-40 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "> 90 %",
      "Commentaire liaison albumine": "CBG et albumine",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Corticoïdes oraux",
      "DCI (Molécule)": "Méthylprednisolone",
      "Noms de marque (Princeps)": "Médrol",
      "Posologie habituelle": "4-48 mg/j",
      "Posologie gériatrique": "4-8 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,77",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Corticoïdes oraux",
      "DCI (Molécule)": "Prednisolone",
      "Noms de marque (Princeps)": "Solupred",
      "Posologie habituelle": "5-60 mg/j",
      "Posologie gériatrique": "5-20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "70 - 90 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Corticoïdes oraux",
      "DCI (Molécule)": "Prednisone",
      "Noms de marque (Princeps)": "Cortancyl",
      "Posologie habituelle": "5-60 mg/j",
      "Posologie gériatrique": "5-20 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "70 - 73 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Fer oral",
      "DCI (Molécule)": "Ascorbate ferreux",
      "Noms de marque (Princeps)": "Ascofer",
      "Posologie habituelle": "100-300 mg/j",
      "Posologie gériatrique": "100 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 90 %",
      "Commentaire liaison albumine": "Lié à la transferrine, pas albumine",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Fer oral",
      "DCI (Molécule)": "Fumarate ferreux",
      "Noms de marque (Princeps)": "Fumafer",
      "Posologie habituelle": "100-300 mg/j",
      "Posologie gériatrique": "100 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 90 %",
      "Commentaire liaison albumine": "Lié à la transferrine, pas albumine",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Fer oral",
      "DCI (Molécule)": "Sulfate ferreux",
      "Noms de marque (Princeps)": "Tardyféron, Timférol",
      "Posologie habituelle": "100-300 mg/j",
      "Posologie gériatrique": "100 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure documentée",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 90 %",
      "Commentaire liaison albumine": "Lié à la transferrine, pas albumine",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atypiques",
      "DCI (Molécule)": "Chlorpromazine",
      "Noms de marque (Princeps)": "Largactil",
      "Posologie habituelle": "50-300 mg/jour",
      "Posologie gériatrique": "25-50 mg/jour",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Haloperidol, Métoclopramide, Tricycliques, QT long",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "95 - 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atypiques",
      "DCI (Molécule)": "Haloperidol",
      "Noms de marque (Princeps)": "Haldol",
      "Posologie habituelle": "2-10 mg/jour",
      "Posologie gériatrique": "0.5-2 mg/jour",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "ISRS, Métoclopramide, Macrolides, QT long",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atypiques",
      "DCI (Molécule)": "Fluphenazine",
      "Noms de marque (Princeps)": "Moditen",
      "Posologie habituelle": "2-10 mg/jour",
      "Posologie gériatrique": "0.5-2 mg/jour",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Lithium, Tricycliques, Anticholinergiques",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atypiques",
      "DCI (Molécule)": "Perphenazine",
      "Noms de marque (Princeps)": "Trilafon",
      "Posologie habituelle": "4-12 mg/jour",
      "Posologie gériatrique": "1-4 mg/jour",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Anticholinergiques, Tricycliques, ISRS",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Neuroleptiques atypiques",
      "DCI (Molécule)": "Levomepromazine",
      "Noms de marque (Princeps)": "Nozinan",
      "Posologie habituelle": "25-75 mg/jour",
      "Posologie gériatrique": "10-25 mg/jour",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Alcool, Dépresseurs SNC, Anticholinergiques, QT",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Antiviraux antiretroviraux",
      "DCI (Molécule)": "Ritonavir",
      "Noms de marque (Princeps)": "Norvir",
      "Posologie habituelle": "600 mg x2/j",
      "Posologie gériatrique": "300-600 mg x2/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Protéase inhibitor (CYP3A4 puissant)",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "98 - 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antiviraux antiretroviraux",
      "DCI (Molécule)": "Cobicistat",
      "Noms de marque (Princeps)": "Tybost",
      "Posologie habituelle": "150 mg/j",
      "Posologie gériatrique": "150 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 inhibiteur puissant",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "97 - 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Antiviraux antiretroviraux",
      "DCI (Molécule)": "Darunavir",
      "Noms de marque (Princeps)": "Prezista",
      "Posologie habituelle": "600 mg x2/j + ritonavir",
      "Posologie gériatrique": "300-400 mg x2/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Protéase (CYP3A4)",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": "Liée à l'AAGP",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiviraux antiretroviraux",
      "DCI (Molécule)": "Atazanavir",
      "Noms de marque (Princeps)": "Reyataz",
      "Posologie habituelle": "300 mg/j + ritonavir",
      "Posologie gériatrique": "200 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Protéase (CYP3A4)",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,86",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Antiviraux antiretroviraux",
      "DCI (Molécule)": "Lopinavir",
      "Noms de marque (Princeps)": "Kaletra",
      "Posologie habituelle": "400/100 mg x2/j",
      "Posologie gériatrique": "400/100 mg x2/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Protéase (CYP3A4)",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "98 - 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antiviraux antiretroviraux",
      "DCI (Molécule)": "Efavirenz",
      "Noms de marque (Princeps)": "Stocrin",
      "Posologie habituelle": "600 mg/j",
      "Posologie gériatrique": "600 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "INNTI (CYP3A4 inducteur)",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antiviraux antiretroviraux",
      "DCI (Molécule)": "Doravirine",
      "Noms de marque (Princeps)": "Pifeltro",
      "Posologie habituelle": "100 mg/j",
      "Posologie gériatrique": "100 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "INNTI",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,76",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiviraux antiretroviraux",
      "DCI (Molécule)": "Emtricitabine",
      "Noms de marque (Princeps)": "Emtriva",
      "Posologie habituelle": "200 mg/j",
      "Posologie gériatrique": "200 mg/j",
      "Adaptation fonction rénale": "Réduction si eGFR <30",
      "Interactions Médicamenteuses (DDI)": "INTI",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "< 4 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiviraux hépatite C",
      "DCI (Molécule)": "Asunaprevir",
      "Noms de marque (Princeps)": "Sunvepra",
      "Posologie habituelle": "100 mg x2/j",
      "Posologie gériatrique": "100 mg x2/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Protéase VHC (CYP3A4)",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiviraux hépatite C",
      "DCI (Molécule)": "Boceprevir",
      "Noms de marque (Princeps)": "Victrelis",
      "Posologie habituelle": "800 mg x3/j",
      "Posologie gériatrique": "800 mg x3/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Protéase VHC",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,75",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiviraux hépatite C",
      "DCI (Molécule)": "Daclatasvir",
      "Noms de marque (Princeps)": "Daklinza",
      "Posologie habituelle": "60 mg/j",
      "Posologie gériatrique": "60 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "NS5A",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,99",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antiviraux hépatite C",
      "DCI (Molécule)": "Sofosbuvir",
      "Noms de marque (Princeps)": "Sovaldi",
      "Posologie habituelle": "400 mg/j",
      "Posologie gériatrique": "400 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Polymerase inhibiteur",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "61 - 65 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antiarythmiques",
      "DCI (Molécule)": "Amiodarone",
      "Noms de marque (Princeps)": "Cordarone",
      "Posologie habituelle": "200-400 mg/j",
      "Posologie gériatrique": "100-200 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP3A4/1A2 inhibiteur puissant, QT long",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 96 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Antiarythmiques",
      "DCI (Molécule)": "Dronedarone",
      "Noms de marque (Princeps)": "Multaq",
      "Posologie habituelle": "400 mg x2/j",
      "Posologie gériatrique": "400 mg x2/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 inhibiteur",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Antiarythmiques",
      "DCI (Molécule)": "Disopyramide",
      "Noms de marque (Princeps)": "Rythmodan",
      "Posologie habituelle": "400-600 mg/j",
      "Posologie gériatrique": "250-400 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Anticholinergique léger",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "50 - 80 %",
      "Commentaire liaison albumine": "(Saturable)",
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Antihistaminiques H1",
      "DCI (Molécule)": "Chlorphéniramine",
      "Noms de marque (Princeps)": "Polaramine",
      "Posologie habituelle": "12-16 mg/j",
      "Posologie gériatrique": "4-8 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Sédatif, Anticholinergique",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,72",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antihistaminiques H1",
      "DCI (Molécule)": "Cétirizine",
      "Noms de marque (Princeps)": "Virlix",
      "Posologie habituelle": "10 mg/j",
      "Posologie gériatrique": "5-10 mg/j",
      "Adaptation fonction rénale": "Si eGFR <50: 5mg/j",
      "Interactions Médicamenteuses (DDI)": "Non sédatif",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,93",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antihistaminiques H1",
      "DCI (Molécule)": "Loratadine",
      "Noms de marque (Princeps)": "Clarityne",
      "Posologie habituelle": "10 mg/j",
      "Posologie gériatrique": "10 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Non sédatif",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antihistaminiques H1",
      "DCI (Molécule)": "Fexofénadine",
      "Noms de marque (Princeps)": "Telfast",
      "Posologie habituelle": "180 mg/j",
      "Posologie gériatrique": "180 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Non sédatif, Substrat P-gp",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "60 - 70 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antimigraine (Triptans)",
      "DCI (Molécule)": "Eletriptan",
      "Noms de marque (Princeps)": "Relert",
      "Posologie habituelle": "40 mg (dose max 80mg)",
      "Posologie gériatrique": "20-40 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 substrat",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,85",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antimigraine (Triptans)",
      "DCI (Molécule)": "Frovatriptan",
      "Noms de marque (Princeps)": "Fractal",
      "Posologie habituelle": "2.5 mg (max 7.5mg/j)",
      "Posologie gériatrique": "2.5 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Minimal CYP3A4",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,15",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antimigraine (Triptans)",
      "DCI (Molécule)": "Naratriptan",
      "Noms de marque (Princeps)": "Naramig",
      "Posologie habituelle": "2.5 mg (max 5mg/j)",
      "Posologie gériatrique": "1.25-2.5 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Faible CYP3A4",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,29",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antimigraine (Triptans)",
      "DCI (Molécule)": "Sumatriptan",
      "Noms de marque (Princeps)": "Imigrane",
      "Posologie habituelle": "50-100 mg (max 200mg/j)",
      "Posologie gériatrique": "25-50 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Faible métabolisme",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "14 - 21 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antimigraine (Triptans)",
      "DCI (Molécule)": "Zolmitriptan",
      "Noms de marque (Princeps)": "Zomig",
      "Posologie habituelle": "2.5 mg (max 10mg/j)",
      "Posologie gériatrique": "1.25-2.5 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP1A2 substrat",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,25",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Immunosuppresseurs",
      "DCI (Molécule)": "Ciclosporine",
      "Noms de marque (Princeps)": "Neoral/Sandimmun",
      "Posologie habituelle": "3-5 mg/kg/j",
      "Posologie gériatrique": "2-3 mg/kg/j",
      "Adaptation fonction rénale": "Monitoring taux",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 substrat puissant",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": "Lipoprotéines majoritairement",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Immunosuppresseurs",
      "DCI (Molécule)": "Tacrolimus",
      "Noms de marque (Princeps)": "Prograf",
      "Posologie habituelle": "0.1-0.3 mg/kg/j",
      "Posologie gériatrique": "0.05-0.1 mg/kg/j",
      "Adaptation fonction rénale": "Monitoring taux",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 substrat, Inducteur léger",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,99",
      "Commentaire liaison albumine": "Erythrocytes et protéines",
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Immunosuppresseurs",
      "DCI (Molécule)": "Mycophenolate mofétil",
      "Noms de marque (Princeps)": "Cellcept",
      "Posologie habituelle": "1-1.5 g x2/j",
      "Posologie gériatrique": "500 mg-1g x2/j",
      "Adaptation fonction rénale": "Pas d'ajustement majeur",
      "Interactions Médicamenteuses (DDI)": "Peu d'interactions",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antagonistes endothéline",
      "DCI (Molécule)": "Bosentan",
      "Noms de marque (Princeps)": "Tracleer",
      "Posologie habituelle": "62.5-125 mg x2/j",
      "Posologie gériatrique": "62.5 mg x2/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 inducteur puissant",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antagonistes endothéline",
      "DCI (Molécule)": "Ambrisentan",
      "Noms de marque (Princeps)": "Volibris",
      "Posologie habituelle": "5-10 mg/j",
      "Posologie gériatrique": "5 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Peu d'interaction",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs atypiques",
      "DCI (Molécule)": "Bupropion",
      "Noms de marque (Princeps)": "Wellbutrin",
      "Posologie habituelle": "300 mg/j",
      "Posologie gériatrique": "150-300 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP2D6 inhibiteur puissant",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,84",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs atypiques",
      "DCI (Molécule)": "Buspirone",
      "Noms de marque (Princeps)": "Buspar",
      "Posologie habituelle": "15-30 mg/j",
      "Posologie gériatrique": "7.5-15 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 substrat",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,86",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Antidépresseurs atypiques",
      "DCI (Molécule)": "Mirtazapine",
      "Noms de marque (Princeps)": "Norset",
      "Posologie habituelle": "15-45 mg/j",
      "Posologie gériatrique": "15-30 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Anticholinergique léger",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,85",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Hormones thyroïdiennes synthétiques",
      "DCI (Molécule)": "Liothyronine",
      "Noms de marque (Princeps)": "Cynomel",
      "Posologie habituelle": "50-100 mcg/j",
      "Posologie gériatrique": "25-50 mcg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Hormones thyroïdiennes synthétiques",
      "DCI (Molécule)": "Liotrix",
      "Noms de marque (Princeps)": "Éuthyral",
      "Posologie habituelle": "1 comprimé/j",
      "Posologie gériatrique": "0.5-1 comprimé/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Antiulcéreux H2",
      "DCI (Molécule)": "Cimétidine",
      "Noms de marque (Princeps)": "Tagamet",
      "Posologie habituelle": "800 mg-1g/j",
      "Posologie gériatrique": "400-600 mg/j",
      "Adaptation fonction rénale": "Réduction si IRC",
      "Interactions Médicamenteuses (DDI)": "CYP3A4/2D6 inhibiteur",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,2",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Antiulcéreux H2",
      "DCI (Molécule)": "Famotidine",
      "Noms de marque (Princeps)": "Pepcidine",
      "Posologie habituelle": "20-40 mg/j",
      "Posologie gériatrique": "20 mg/j",
      "Adaptation fonction rénale": "Si eGFR <30: 20mg/j",
      "Interactions Médicamenteuses (DDI)": "Minimal d'interaction",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "15 - 20 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Cinétiques anti-VGCC",
      "DCI (Molécule)": "Cilostazol",
      "Noms de marque (Princeps)": "Pletal",
      "Posologie habituelle": "100 mg x2/j",
      "Posologie gériatrique": "50-100 mg x2/j",
      "Adaptation fonction rénale": "Réduction si IRC modérée",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 substrat",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "95 - 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "?? Risque Connu (KR)"
    },
    {
      "Classe Médicamenteuse": "Modulateurs CRF1",
      "DCI (Molécule)": "Aprepitant",
      "Noms de marque (Princeps)": "Emend",
      "Posologie habituelle": "125 mg (1h avant chémo)",
      "Posologie gériatrique": "125 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 substrat/inducteur",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Modulateurs CRF1",
      "DCI (Molécule)": "Fosaprepitant",
      "Noms de marque (Princeps)": "Emend IV",
      "Posologie habituelle": "150 mg IV",
      "Posologie gériatrique": "150 mg IV",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Métabolite actif aprepitant",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Modulateurs CRF1",
      "DCI (Molécule)": "Casopitant",
      "Noms de marque (Princeps)": "GW679769",
      "Posologie habituelle": "90-200 mg/j",
      "Posologie gériatrique": "Doses titration",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "CYP3A4 substrat",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 97 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Activateurs canaux K+ pancréatique",
      "DCI (Molécule)": "Miglitinide",
      "Noms de marque (Princeps)": "Novonorm",
      "Posologie habituelle": "360 mg/j (3x120)",
      "Posologie gériatrique": "60-120 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Activateurs canaux K+ pancréatique",
      "DCI (Molécule)": "Nateglinide",
      "Noms de marque (Princeps)": "Starlix",
      "Posologie habituelle": "360 mg/j (3x120)",
      "Posologie gériatrique": "60-120 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Aucune majeure",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": null,
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Anthelminthiques",
      "DCI (Molécule)": "Benzbromarone",
      "Noms de marque (Princeps)": "Narcaricine",
      "Posologie habituelle": "100-200 mg/j",
      "Posologie gériatrique": "100 mg/j",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Uricosurique",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "> 99 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Anthelminthiques",
      "DCI (Molécule)": "Albendazole",
      "Noms de marque (Princeps)": "Zentel",
      "Posologie habituelle": "400 mg x2/j 3j",
      "Posologie gériatrique": "400 mg",
      "Adaptation fonction rénale": "Pas d'ajustement",
      "Interactions Médicamenteuses (DDI)": "Peu d'interaction",
      "Score ACB": "0",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,7",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Urologie (Incontinence vésicale)",
      "DCI (Molécule)": "Ditropan / Driptane",
      "Noms de marque (Princeps)": "(Oxybutynine)",
      "Posologie habituelle": "5 mg 2 à 3x/jour",
      "Posologie gériatrique": "2.5 mg 2x/jour (déconseillé si troubles cognitifs)",
      "Adaptation fonction rénale": "Prudence (risque d'accumulation des métabolites)",
      "Interactions Médicamenteuses (DDI)": "Autres anticholinergiques - Inhibiteurs CYP3A4",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "83 à 85 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Urologie (Incontinence vésicale)",
      "DCI (Molécule)": "Vesicare",
      "Noms de marque (Princeps)": "(Solifénacine)",
      "Posologie habituelle": "5 à 10 mg/jour",
      "Posologie gériatrique": "5 mg/jour (dose max recommandée)",
      "Adaptation fonction rénale": "Max 5 mg/jour si DFG < 30 mL/min",
      "Interactions Médicamenteuses (DDI)": "Inhibiteurs puissants du CYP3A4 (kétoconazole)",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "~ 98 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Urologie (Incontinence vésicale)",
      "DCI (Molécule)": "Detrusitol",
      "Noms de marque (Princeps)": "(Toltérodine)",
      "Posologie habituelle": "2 mg 2x/jour",
      "Posologie gériatrique": "1 mg 2x/jour",
      "Adaptation fonction rénale": "1 mg 2x/jour si DFG < 30 mL/min",
      "Interactions Médicamenteuses (DDI)": "Autres anticholinergiques - Inhibiteurs CYP3A4",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,96",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Urologie (Incontinence vésicale)",
      "DCI (Molécule)": "Toviaz",
      "Noms de marque (Princeps)": "(Fésotérodine)",
      "Posologie habituelle": "4 à 8 mg/jour",
      "Posologie gériatrique": "4 mg/jour (augmentation prudente)",
      "Adaptation fonction rénale": "Max 4 mg/jour si DFG < 30 mL/min",
      "Interactions Médicamenteuses (DDI)": "Inhibiteurs CYP3A4",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "50 % (pour son métabolite actif)",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Urologie (Incontinence vésicale)",
      "DCI (Molécule)": "Ceris",
      "Noms de marque (Princeps)": "(Trospium)",
      "Posologie habituelle": "20 mg 2x/jour",
      "Posologie gériatrique": "20 mg/jour",
      "Adaptation fonction rénale": "20 mg/jour ou 1 prise un jour sur deux si DFG < 30",
      "Interactions Médicamenteuses (DDI)": "Anticholinergiques",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "50 à 80 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Psychiatrie (Antidépresseurs Tricycliques)",
      "DCI (Molécule)": "Laroxyl",
      "Noms de marque (Princeps)": "(Amitriptyline)",
      "Posologie habituelle": "50 à 150 mg/jour",
      "Posologie gériatrique": "10 à 25 mg/jour (à éviter si possible)",
      "Adaptation fonction rénale": "Pas d'adaptation stricte mais élimination ralentie",
      "Interactions Médicamenteuses (DDI)": "IMAO - Sérotoninergiques - Anticholinergiques",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Psychiatrie (Antidépresseurs Tricycliques)",
      "DCI (Molécule)": "Anafranil",
      "Noms de marque (Princeps)": "(Clomipramine)",
      "Posologie habituelle": "75 à 150 mg/jour",
      "Posologie gériatrique": "10 à 50 mg/jour (à éviter si possible)",
      "Adaptation fonction rénale": "Prudence (augmentation demi-vie)",
      "Interactions Médicamenteuses (DDI)": "IMAO - ISRS - Dépresseurs SNC",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Psychiatrie (Antidépresseurs Tricycliques)",
      "DCI (Molécule)": "Tofranil",
      "Noms de marque (Princeps)": "(Imipramine)",
      "Posologie habituelle": "75 à 150 mg/jour",
      "Posologie gériatrique": "10 à 50 mg/jour (à éviter si possible)",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "IMAO - Clonidine - Anticholinergiques",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,86",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Psychiatrie (Antidépresseurs Tricycliques)",
      "DCI (Molécule)": "Quitaxon",
      "Noms de marque (Princeps)": "(Doxépine)",
      "Posologie habituelle": "50 à 150 mg/jour",
      "Posologie gériatrique": "10 à 50 mg/jour (à éviter si possible)",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "IMAO - Dépresseurs SNC",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,76",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Psychiatrie (Antidépresseurs Tricycliques)",
      "DCI (Molécule)": "Surmontil",
      "Noms de marque (Princeps)": "(Trimipramine)",
      "Posologie habituelle": "50 à 150 mg/jour",
      "Posologie gériatrique": "10 à 50 mg/jour (à éviter si possible)",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "IMAO - Antihypertenseurs centraux",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,95",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Sommeil / Allergologie (Anti-H1 1ère gén.)",
      "DCI (Molécule)": "Atarax",
      "Noms de marque (Princeps)": "(Hydroxyzine)",
      "Posologie habituelle": "50 à 100 mg/jour",
      "Posologie gériatrique": "25 à 50 mg/jour max (déconseillé)",
      "Adaptation fonction rénale": "Réduire la dose de 50 % si IR modérée/sévère",
      "Interactions Médicamenteuses (DDI)": "Médicaments allongeant le QT - Dépresseurs SNC",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,8",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Sommeil / Allergologie (Anti-H1 1ère gén.)",
      "DCI (Molécule)": "Donormyl / Lidaprim",
      "Noms de marque (Princeps)": "(Doxylamine)",
      "Posologie habituelle": "15 mg/jour (le soir)",
      "Posologie gériatrique": "7.5 mg/jour (le soir - déconseillé)",
      "Adaptation fonction rénale": "Prudence (risque de rétention et sédation accrue)",
      "Interactions Médicamenteuses (DDI)": "Dépresseurs SNC - Alcool",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "~ 25 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Sommeil / Allergologie (Anti-H1 1ère gén.)",
      "DCI (Molécule)": "Phenergan",
      "Noms de marque (Princeps)": "(Prométhazine)",
      "Posologie habituelle": "25 à 50 mg/jour",
      "Posologie gériatrique": "10 à 25 mg/jour (déconseillé)",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "Dépresseurs SNC - Autres anticholinergiques",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "80 à 90 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Sommeil / Allergologie (Anti-H1 1ère gén.)",
      "DCI (Molécule)": "Théralène",
      "Noms de marque (Princeps)": "(Alimémazine)",
      "Posologie habituelle": "5 à 10 mg/jour",
      "Posologie gériatrique": "2.5 à 5 mg/jour (déconseillé)",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "Dépresseurs SNC",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "> 90 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Sommeil / Allergologie (Anti-H1 1ère gén.)",
      "DCI (Molécule)": "Polaramine",
      "Noms de marque (Princeps)": "(Dexchlorphéniramine)",
      "Posologie habituelle": "2 mg 3 à 4x/jour",
      "Posologie gériatrique": "2 mg 1 à 2x/jour (déconseillé)",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "Dépresseurs SNC - Alcool",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,72",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Psychiatrie (Neuroleptiques / Phénothiazines)",
      "DCI (Molécule)": "Tercian (Cyamémazine)",
      "Noms de marque (Princeps)": "cyamémazine",
      "Posologie habituelle": "25 à 300 mg/jour (selon indication)",
      "Posologie gériatrique": "12.5 à 25 mg/jour (à manier avec précaution)",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "Allongement QT - Dépresseurs SNC",
      "Score ACB": "NC",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,9",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Psychiatrie (Neuroleptiques / Phénothiazines)",
      "DCI (Molécule)": "Piportil (Pipotiazine)",
      "Noms de marque (Princeps)": "Pipotiazine",
      "Posologie habituelle": "10 à 20 mg/jour",
      "Posologie gériatrique": "5 mg/jour",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "Médicaments abaissant le seuil épileptogène",
      "Score ACB": "NC",
      "Score CIA": "3",
      "Liaison Albumine (%)": "Forte (> 90 %)",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Psychiatrie (Neuroleptiques / Phénothiazines)",
      "DCI (Molécule)": "Fluanxol (Flupentixol)",
      "Noms de marque (Princeps)": "Flupentixol",
      "Posologie habituelle": "1 à 3 mg/jour",
      "Posologie gériatrique": "0.5 à 1 mg/jour",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "LévoDOPA - Dépresseurs SNC",
      "Score ACB": "1",
      "Score CIA": "2",
      "Liaison Albumine (%)": "0,99",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Psychiatrie (Neuroleptiques / Phénothiazines)",
      "DCI (Molécule)": "Clopixol (Zuclopenthixol)",
      "Noms de marque (Princeps)": "Zuclopenthixol",
      "Posologie habituelle": "20 à 40 mg/jour",
      "Posologie gériatrique": "2 à 6 mg/jour",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "LévoDOPA - Autres neuroleptiques",
      "Score ACB": "1",
      "Score CIA": "2",
      "Liaison Albumine (%)": "0,98",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Neurologie (Antiparkinsoniens Anticholin.)",
      "DCI (Molécule)": "Artane / Parkinane (Trihexyphénidyle)",
      "Noms de marque (Princeps)": "(Trihexyphénidyle)",
      "Posologie habituelle": "2 à 10 mg/jour",
      "Posologie gériatrique": "1 à 2 mg/jour (très déconseillé confusion/chutes)",
      "Adaptation fonction rénale": "Prudence majeure (accumulation)",
      "Interactions Médicamenteuses (DDI)": "Anticholinergiques (majoration des effets)",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "~ 50 %",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Neurologie (Antiparkinsoniens Anticholin.)",
      "DCI (Molécule)": "Lepticur (Tropatépine)",
      "Noms de marque (Princeps)": "tropatépine",
      "Posologie habituelle": "10 mg/jour",
      "Posologie gériatrique": "5 mg/jour (déconseillé)",
      "Adaptation fonction rénale": "Prudence majeure",
      "Interactions Médicamenteuses (DDI)": "Anticholinergiques",
      "Score ACB": "NC",
      "Score CIA": "3",
      "Liaison Albumine (%)": "Forte",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Neurologie (Antiparkinsoniens Anticholin.)",
      "DCI (Molécule)": "Akineton (Bipéridène)",
      "Noms de marque (Princeps)": "Bipéridène",
      "Posologie habituelle": "2 à 4 mg/jour",
      "Posologie gériatrique": "1 à 2 mg/jour (déconseillé)",
      "Adaptation fonction rénale": "Prudence majeure",
      "Interactions Médicamenteuses (DDI)": "Anticholinergiques - Quinidine",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,94",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Gastro-entérologie (Antispasmodiques)",
      "DCI (Molécule)": "Scopoderm (Scopolamine)",
      "Noms de marque (Princeps)": "Scopolamine",
      "Posologie habituelle": "1 patch toutes les 72h",
      "Posologie gériatrique": "1/2 ou 1 patch avec surveillance étroite",
      "Adaptation fonction rénale": "Prudence (effets centraux accrus)",
      "Interactions Médicamenteuses (DDI)": "Autres anticholinergiques",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,1",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Gastro-entérologie (Antispasmodiques)",
      "DCI (Molécule)": "Viscéralgine (Tiémonium)",
      "Noms de marque (Princeps)": "Tiémonium",
      "Posologie habituelle": "100 à 300 mg/jour",
      "Posologie gériatrique": "50 à 100 mg/jour",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "Autres anticholinergiques",
      "Score ACB": "NC",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,1",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Cardiologie / Ophtalmologie",
      "DCI (Molécule)": "Atropine (collyre)",
      "Noms de marque (Princeps)": "atropine",
      "Posologie habituelle": "1 goutte 1 à 2x/jour",
      "Posologie gériatrique": "1 goutte 1 à 2x/jour (fermer le canal lacrymal)",
      "Adaptation fonction rénale": "N/A (absorption systémique faible mais possible)",
      "Interactions Médicamenteuses (DDI)": "N/A en local (interactions si passage systémique)",
      "Score ACB": "3",
      "Score CIA": "3",
      "Liaison Albumine (%)": "0,5",
      "Commentaire liaison albumine": "(fraction absorbée)",
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Cardiologie (Anti-arythmiques / Diurétiques)",
      "DCI (Molécule)": "Hemigoxine / Digoxine (Digoxine)",
      "Noms de marque (Princeps)": "Digoxine",
      "Posologie habituelle": "0.25 mg/jour",
      "Posologie gériatrique": "0.0625 à 0.125 mg/jour (surveillance digoxinémie)",
      "Adaptation fonction rénale": "DFG 10-50 : dose divisée par 2 ou 4. CI si < 10",
      "Interactions Médicamenteuses (DDI)": "Amiodarone - Hypokaliémiants (diurétiques) - Calcium",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "0,25",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Possible (PR)"
    },
    {
      "Classe Médicamenteuse": "Cardiologie (Anti-arythmiques / Diurétiques)",
      "DCI (Molécule)": "Tenoretic",
      "Noms de marque (Princeps)": "(Aténolol + Chlortalidone)",
      "Posologie habituelle": "1 cp/jour",
      "Posologie gériatrique": "1/2 à 1 cp/jour",
      "Adaptation fonction rénale": "Contre-indiqué si DFG < 30 mL/min",
      "Interactions Médicamenteuses (DDI)": "Antiarythmiques - AINS - Lithium",
      "Score ACB": "1",
      "Score CIA": "0",
      "Liaison Albumine (%)": "5 % (Aténolol) et 75 % (Chlortalidone)",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Gastro-entérologie (Antinauséeux / Autres)",
      "DCI (Molécule)": "Primpéran",
      "Noms de marque (Princeps)": "(Métoclopramide)",
      "Posologie habituelle": "10 mg 3x/jour (max 5 jours)",
      "Posologie gériatrique": "5 mg 3x/jour (max 5 jours)",
      "Adaptation fonction rénale": "DFG < 60 : dose divisée par 2. DFG < 15 : dose divisée par 4",
      "Interactions Médicamenteuses (DDI)": "LévoDOPA (antagonisme) - Neuroleptiques",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,3",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Gastro-entérologie (Antinauséeux / Autres)",
      "DCI (Molécule)": "Imodium",
      "Noms de marque (Princeps)": "(Lopéramide)",
      "Posologie habituelle": "2 à 8 mg/jour",
      "Posologie gériatrique": "2 à 4 mg/jour max",
      "Adaptation fonction rénale": "Pas d'adaptation stricte",
      "Interactions Médicamenteuses (DDI)": "Inhibiteurs de la P-gp (Kétoconazole - Itraconazole)",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,97",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": "? Risque Conditionnel (CR)"
    },
    {
      "Classe Médicamenteuse": "Rhumatologie (Myorelaxants)",
      "DCI (Molécule)": "Miorel / Coltramyl",
      "Noms de marque (Princeps)": "(Thiocolchicoside)",
      "Posologie habituelle": "8 mg 2x/jour (max 7 jours)",
      "Posologie gériatrique": "À éviter si possible",
      "Adaptation fonction rénale": "Prudence",
      "Interactions Médicamenteuses (DDI)": "AINS (risque épileptogène potentiel)",
      "Score ACB": "0",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,13",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    },
    {
      "Classe Médicamenteuse": "Rhumatologie (Myorelaxants)",
      "DCI (Molécule)": "Lumirelax",
      "Noms de marque (Princeps)": "(Méthocarbamol)",
      "Posologie habituelle": "1.5 g 3x/jour",
      "Posologie gériatrique": "À éviter ou réduire de moitié",
      "Adaptation fonction rénale": "Prudence si insuffisance rénale sévère",
      "Interactions Médicamenteuses (DDI)": "Dépresseurs SNC",
      "Score ACB": "1",
      "Score CIA": "1",
      "Liaison Albumine (%)": "0,46",
      "Commentaire liaison albumine": null,
      "Risque allongement QT": null
    }
  ],
  "dci_mapping": {
    "Alendronate": {
      "med_id_clinique": "BIPHOSPHONATES",
      "princeps": "Fosomax",
      "classe_qt": "Bisphosphonates"
    },
    "Risédronate": {
      "med_id_clinique": "BIPHOSPHONATES",
      "princeps": "Actonel",
      "classe_qt": "Bisphosphonates"
    },
    "Acide zolédronique": {
      "med_id_clinique": "BIPHOSPHONATES",
      "princeps": "Aclasta",
      "classe_qt": "Bisphosphonates"
    },
    "Ibandronate": {
      "med_id_clinique": "BIPHOSPHONATES",
      "princeps": "Bonviva",
      "classe_qt": "Bisphosphonates"
    },
    "Carbimazole": {
      "med_id_clinique": null,
      "princeps": "Néomercazole",
      "classe_qt": "Antithyroïdiens de synthèse"
    },
    "Propylthiouracile": {
      "med_id_clinique": null,
      "princeps": "Propycil",
      "classe_qt": "Antithyroïdiens de synthèse"
    },
    "Empagliflozin": {
      "med_id_clinique": "SGLT2",
      "princeps": "Jardiance",
      "classe_qt": "Inhibiteurs SGLT2"
    },
    "Dapagliflozin": {
      "med_id_clinique": "SGLT2",
      "princeps": "Forxiga",
      "classe_qt": "Inhibiteurs SGLT2"
    },
    "Canagliflozin": {
      "med_id_clinique": "SGLT2",
      "princeps": "Invokana",
      "classe_qt": "Inhibiteurs SGLT2"
    },
    "Ertugliflozin": {
      "med_id_clinique": "SGLT2",
      "princeps": "Steglatro",
      "classe_qt": "Inhibiteurs SGLT2"
    },
    "Exenatide": {
      "med_id_clinique": null,
      "princeps": "Byetta, Bydureon",
      "classe_qt": "Agonistes GLP-1"
    },
    "Liraglutide": {
      "med_id_clinique": "GLP1",
      "princeps": "Victoza",
      "classe_qt": "Agonistes GLP-1"
    },
    "Dulaglutide": {
      "med_id_clinique": null,
      "princeps": "Trulicity",
      "classe_qt": "Agonistes GLP-1"
    },
    "Sémaglutide": {
      "med_id_clinique": "GLP1",
      "princeps": "Ozempic, Wegovy",
      "classe_qt": "Agonistes GLP-1"
    },
    "Tirzépatide": {
      "med_id_clinique": null,
      "princeps": "Mounjaro",
      "classe_qt": "Agonistes GLP-1"
    },
    "Amiloride": {
      "med_id_clinique": "SPIRO",
      "princeps": "Modamide",
      "classe_qt": "Diurétiques"
    },
    "Bumétanide": {
      "med_id_clinique": "SPIRO",
      "princeps": "Burinex",
      "classe_qt": "Diurétiques"
    },
    "Ciclétanine": {
      "med_id_clinique": "SPIRO",
      "princeps": "Tenstaten",
      "classe_qt": "Diurétiques"
    },
    "Éplérénone": {
      "med_id_clinique": "SPIRO",
      "princeps": "Inspra",
      "classe_qt": "Diurétiques"
    },
    "Furosémide": {
      "med_id_clinique": "SPIRO",
      "princeps": "Lasilix",
      "classe_qt": "Diurétiques"
    },
    "Hydrochlorothiazide": {
      "med_id_clinique": "SPIRO",
      "princeps": "Esidrex",
      "classe_qt": "Diurétiques"
    },
    "Indapamide": {
      "med_id_clinique": "SPIRO",
      "princeps": "Fludex",
      "classe_qt": "Diurétiques"
    },
    "Pirétanide": {
      "med_id_clinique": "SPIRO",
      "princeps": "Eurelix",
      "classe_qt": "Diurétiques"
    },
    "Spironolactone": {
      "med_id_clinique": "SPIRO",
      "princeps": "Aldactone",
      "classe_qt": "Diurétiques"
    },
    "Torasémide": {
      "med_id_clinique": "SPIRO",
      "princeps": "Torental",
      "classe_qt": "Diurétiques"
    },
    "Bénazépril": {
      "med_id_clinique": null,
      "princeps": "Cibacène",
      "classe_qt": "IEC"
    },
    "Captopril": {
      "med_id_clinique": null,
      "princeps": "Lopril",
      "classe_qt": "IEC"
    },
    "Cilazapril": {
      "med_id_clinique": null,
      "princeps": "Justor",
      "classe_qt": "IEC"
    },
    "Énalapril": {
      "med_id_clinique": "IEC",
      "princeps": "Renitec",
      "classe_qt": "IEC"
    },
    "Fosinopril": {
      "med_id_clinique": null,
      "princeps": "Fozitec",
      "classe_qt": "IEC"
    },
    "Lisinopril": {
      "med_id_clinique": "IEC",
      "princeps": "Zestril, Prinivil",
      "classe_qt": "IEC"
    },
    "Moexipril": {
      "med_id_clinique": null,
      "princeps": "Moex",
      "classe_qt": "IEC"
    },
    "Périndopril": {
      "med_id_clinique": "IEC",
      "princeps": "Coversyl",
      "classe_qt": "IEC"
    },
    "Quinapril": {
      "med_id_clinique": null,
      "princeps": "Acuitel",
      "classe_qt": "IEC"
    },
    "Ramipril": {
      "med_id_clinique": "IEC",
      "princeps": "Triatec",
      "classe_qt": "IEC"
    },
    "Trandolapril": {
      "med_id_clinique": null,
      "princeps": "Odrik",
      "classe_qt": "IEC"
    },
    "Zofénopril": {
      "med_id_clinique": null,
      "princeps": "Zofenil",
      "classe_qt": "IEC"
    },
    "Candésartan": {
      "med_id_clinique": "ARA2",
      "princeps": "Atacand, Kenzen",
      "classe_qt": "Sartans (ARA II)"
    },
    "Éprosartan": {
      "med_id_clinique": null,
      "princeps": "Teveten",
      "classe_qt": "Sartans (ARA II)"
    },
    "Irbésartan": {
      "med_id_clinique": "ARA2",
      "princeps": "Aprovel",
      "classe_qt": "Sartans (ARA II)"
    },
    "Losartan": {
      "med_id_clinique": "ARA2",
      "princeps": "Cozaar",
      "classe_qt": "Sartans (ARA II)"
    },
    "Olmésartan": {
      "med_id_clinique": "ARA2",
      "princeps": "Alteis, Olmetec",
      "classe_qt": "Sartans (ARA II)"
    },
    "Telmisartan": {
      "med_id_clinique": null,
      "princeps": "Micardis, Pritor",
      "classe_qt": "Sartans (ARA II)"
    },
    "Valsartan": {
      "med_id_clinique": "ARA2",
      "princeps": "Tareg",
      "classe_qt": "Sartans (ARA II)"
    },
    "Acébutolol": {
      "med_id_clinique": null,
      "princeps": "Sectral",
      "classe_qt": "Bêtabloquants"
    },
    "Aténolol": {
      "med_id_clinique": "BB",
      "princeps": "Ténormine",
      "classe_qt": "Bêtabloquants"
    },
    "Bétaxolol": {
      "med_id_clinique": null,
      "princeps": "Betoptic",
      "classe_qt": "Collyres glaucome"
    },
    "Bisoprolol": {
      "med_id_clinique": "BB",
      "princeps": "Detensiel, Cardensiel",
      "classe_qt": "Bêtabloquants"
    },
    "Cartéolol": {
      "med_id_clinique": null,
      "princeps": "Carteol",
      "classe_qt": "Collyres glaucome"
    },
    "Carvédilol": {
      "med_id_clinique": "BB",
      "princeps": "Kredex",
      "classe_qt": "Bêtabloquants"
    },
    "Céliprololol": {
      "med_id_clinique": null,
      "princeps": "Célectol",
      "classe_qt": "Bêtabloquants"
    },
    "Esmolol": {
      "med_id_clinique": null,
      "princeps": "Brévibloc",
      "classe_qt": "Bêtabloquants"
    },
    "Labétalol": {
      "med_id_clinique": null,
      "princeps": "Trandate",
      "classe_qt": "Bêtabloquants"
    },
    "Métoprolol": {
      "med_id_clinique": "BB",
      "princeps": "Seloken, Lopressor",
      "classe_qt": "Bêtabloquants"
    },
    "Nadolol": {
      "med_id_clinique": null,
      "princeps": "Corgard",
      "classe_qt": "Bêtabloquants"
    },
    "Nébivolol": {
      "med_id_clinique": "BB",
      "princeps": "Temerit, Nebilox",
      "classe_qt": "Bêtabloquants"
    },
    "Pindolol": {
      "med_id_clinique": null,
      "princeps": "Visken",
      "classe_qt": "Bêtabloquants"
    },
    "Propranolol": {
      "med_id_clinique": "BB",
      "princeps": "Avlocardyl",
      "classe_qt": "Bêtabloquants"
    },
    "Sotalol": {
      "med_id_clinique": null,
      "princeps": "Sotalex",
      "classe_qt": "Bêtabloquants"
    },
    "Amlodipine": {
      "med_id_clinique": "CA",
      "princeps": "Amlor",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Clévidipine": {
      "med_id_clinique": "CA",
      "princeps": "Cleviprex",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Diltiazem": {
      "med_id_clinique": "CA",
      "princeps": "Tildiem, Bi-Tildiem",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Félodipine": {
      "med_id_clinique": "CA",
      "princeps": "Flodil",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Isradipine": {
      "med_id_clinique": "CA",
      "princeps": "Icaz",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Lercanidipine": {
      "med_id_clinique": "CA",
      "princeps": "Zanidip",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Manidipine": {
      "med_id_clinique": "CA",
      "princeps": "Iperten",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Nicardipine": {
      "med_id_clinique": "CA",
      "princeps": "Loxen",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Nifédipine": {
      "med_id_clinique": "CA",
      "princeps": "Chronadalate, Adalate",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Nimodipine": {
      "med_id_clinique": "CA",
      "princeps": "Nimotop",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Nitrendipine": {
      "med_id_clinique": "CA",
      "princeps": "Baypress",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Vérapamil": {
      "med_id_clinique": "CA",
      "princeps": "Isoptine",
      "classe_qt": "Inhibiteurs calciques"
    },
    "Apixaban": {
      "med_id_clinique": "AOD",
      "princeps": "Eliquis",
      "classe_qt": "AOD (Anticoagulants)"
    },
    "Dabigatran": {
      "med_id_clinique": "AOD",
      "princeps": "Pradaxa",
      "classe_qt": "AOD (Anticoagulants)"
    },
    "Édoxaban": {
      "med_id_clinique": "AOD",
      "princeps": "Lixiana",
      "classe_qt": "AOD (Anticoagulants)"
    },
    "Rivaroxaban": {
      "med_id_clinique": "AVK",
      "princeps": "Xarelto",
      "classe_qt": "AOD (Anticoagulants)"
    },
    "Acénocoumarol": {
      "med_id_clinique": "AVK",
      "princeps": "Sintrom",
      "classe_qt": "AVK"
    },
    "Fluindione": {
      "med_id_clinique": "AVK",
      "princeps": "Previscan",
      "classe_qt": "AVK"
    },
    "Warfarine": {
      "med_id_clinique": "AVK",
      "princeps": "Coumadine",
      "classe_qt": "AVK"
    },
    "Acide acétylsalicylique": {
      "med_id_clinique": "ANTIAGREG",
      "princeps": "Kardegic, Aspegic",
      "classe_qt": "Antiagrégants"
    },
    "Clopidogrel": {
      "med_id_clinique": "ANTIAGREG",
      "princeps": "Plavix",
      "classe_qt": "Antiagrégants"
    },
    "Prasugrel": {
      "med_id_clinique": "ANTIAGREG",
      "princeps": "Efient",
      "classe_qt": "Antiagrégants"
    },
    "Ticagrélor": {
      "med_id_clinique": "ANTIAGREG",
      "princeps": "Brilique",
      "classe_qt": "Antiagrégants"
    },
    "Ticlopidine": {
      "med_id_clinique": "ANTIAGREG",
      "princeps": "Ticlid",
      "classe_qt": "Antiagrégants"
    },
    "Atorvastatine": {
      "med_id_clinique": "STATINES",
      "princeps": "Tahor",
      "classe_qt": "Statines"
    },
    "Fluvastatine": {
      "med_id_clinique": "STATINES",
      "princeps": "Lescol",
      "classe_qt": "Statines"
    },
    "Pravastatine": {
      "med_id_clinique": "STATINES",
      "princeps": "Elisor, Vasten",
      "classe_qt": "Statines"
    },
    "Rosuvastatine": {
      "med_id_clinique": "STATINES",
      "princeps": "Crestor",
      "classe_qt": "Statines"
    },
    "Simvastatine": {
      "med_id_clinique": "STATINES",
      "princeps": "Zocor, Lodales",
      "classe_qt": "Statines"
    },
    "Citalopram": {
      "med_id_clinique": "ISRS",
      "princeps": "Seropram",
      "classe_qt": "Antidépresseurs IRS/N"
    },
    "Duloxétine": {
      "med_id_clinique": "DULOXETINE",
      "princeps": "Cymbalta",
      "classe_qt": "Antidépresseurs IRS/N"
    },
    "Escitalopram": {
      "med_id_clinique": "ISRS",
      "princeps": "Seroplex",
      "classe_qt": "Antidépresseurs IRS/N"
    },
    "Fluoxétine": {
      "med_id_clinique": "ISRS",
      "princeps": "Prozac",
      "classe_qt": "Antidépresseurs IRS/N"
    },
    "Fluvoxamine": {
      "med_id_clinique": "ISRS",
      "princeps": "Floxyfral",
      "classe_qt": "Antidépresseurs IRS/N"
    },
    "Milnacipran": {
      "med_id_clinique": null,
      "princeps": "Ixel",
      "classe_qt": "Antidépresseurs IRS/N"
    },
    "Paroxétine": {
      "med_id_clinique": "ISRS",
      "princeps": "Deroxat",
      "classe_qt": "Antidépresseurs IRS/N"
    },
    "Sertraline": {
      "med_id_clinique": "ISRS",
      "princeps": "Zoloft",
      "classe_qt": "Antidépresseurs IRS/N"
    },
    "Venlafaxine": {
      "med_id_clinique": "VENLAFAXINE",
      "princeps": "Effexor",
      "classe_qt": "Antidépresseurs IRS/N"
    },
    "Alprazolam": {
      "med_id_clinique": "BZD",
      "princeps": "Xanax",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Bromazépam": {
      "med_id_clinique": null,
      "princeps": "Lexomil",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Clobazam": {
      "med_id_clinique": null,
      "princeps": "Urbanyl",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Clonazépam": {
      "med_id_clinique": null,
      "princeps": "Rivotril",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Clorazépate": {
      "med_id_clinique": null,
      "princeps": "Tranxène",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Clotiazépam": {
      "med_id_clinique": null,
      "princeps": "Vératran",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Diazépam": {
      "med_id_clinique": "BZD",
      "princeps": "Valium",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Estazolam": {
      "med_id_clinique": null,
      "princeps": "Nuctaion",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Loprazolam": {
      "med_id_clinique": null,
      "princeps": "Havlane",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Lorazépam": {
      "med_id_clinique": "BZD",
      "princeps": "Temesta",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Lormétazépam": {
      "med_id_clinique": "BZD",
      "princeps": "Noctamide",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Nitrazépam": {
      "med_id_clinique": "BZD",
      "princeps": "Mogadon",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Nordazépam": {
      "med_id_clinique": null,
      "princeps": "Nordaz",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Oxazépam": {
      "med_id_clinique": "BZD",
      "princeps": "Seresta",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Prazépam": {
      "med_id_clinique": null,
      "princeps": "Lysanxia",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Zolpidem": {
      "med_id_clinique": "BZD",
      "princeps": "Stilnox",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Zopiclone": {
      "med_id_clinique": "BZD",
      "princeps": "Imovane",
      "classe_qt": "Benzodiazépines & Z"
    },
    "Amisulpride": {
      "med_id_clinique": null,
      "princeps": "Solian",
      "classe_qt": "Neuroleptiques atyp."
    },
    "Aripiprazole": {
      "med_id_clinique": "AP",
      "princeps": "Abilify",
      "classe_qt": "Neuroleptiques atyp."
    },
    "Clozapine": {
      "med_id_clinique": "AP",
      "princeps": "Leponex",
      "classe_qt": "Neuroleptiques atyp."
    },
    "Olanzapine": {
      "med_id_clinique": "AP",
      "princeps": "Zyprexa",
      "classe_qt": "Neuroleptiques atyp."
    },
    "Palipéridone": {
      "med_id_clinique": null,
      "princeps": "Xeplion, Invega",
      "classe_qt": "Neuroleptiques atyp."
    },
    "Quétiapine": {
      "med_id_clinique": "AP",
      "princeps": "Xeroquel",
      "classe_qt": "Neuroleptiques atyp."
    },
    "Rispéridone": {
      "med_id_clinique": "AP",
      "princeps": "Risperdal",
      "classe_qt": "Neuroleptiques atyp."
    },
    "Tiapride": {
      "med_id_clinique": null,
      "princeps": "Tiapridal",
      "classe_qt": "Neuroleptiques atyp."
    },
    "Carbamazépine": {
      "med_id_clinique": null,
      "princeps": "Tégretol",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Gabapentine": {
      "med_id_clinique": "GABAPENTINOÏDES",
      "princeps": "Neurontin",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Lacosamide": {
      "med_id_clinique": null,
      "princeps": "Vimpat",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Lamotrigine": {
      "med_id_clinique": null,
      "princeps": "Lamictal",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Lévétiracétam": {
      "med_id_clinique": null,
      "princeps": "Keppra",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Oxcarbazépine": {
      "med_id_clinique": null,
      "princeps": "Trileptal",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Prégabaline": {
      "med_id_clinique": "GABAPENTINOÏDES",
      "princeps": "Lyrica",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Topiramate": {
      "med_id_clinique": null,
      "princeps": "Epitomax",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Valproate": {
      "med_id_clinique": null,
      "princeps": "Dépakine",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Zonisamide": {
      "med_id_clinique": null,
      "princeps": "Zonegran",
      "classe_qt": "Antiépileptiques/Doul."
    },
    "Paracétamol": {
      "med_id_clinique": null,
      "princeps": "Doliprane, Dafalgan, Efferalgan",
      "classe_qt": "Antalgiques Palier 1"
    },
    "Néfopam": {
      "med_id_clinique": null,
      "princeps": "Acupan",
      "classe_qt": "Antalgiques Palier 1"
    },
    "Codéine": {
      "med_id_clinique": "OPIOIDES",
      "princeps": "Codenfan, Dicodin",
      "classe_qt": "Antalgiques Palier 2"
    },
    "Dihydrocodéine": {
      "med_id_clinique": null,
      "princeps": "Dicodin LP",
      "classe_qt": "Antalgiques Palier 2"
    },
    "Poudre d'opium": {
      "med_id_clinique": null,
      "princeps": "Lamaline, Izalgi",
      "classe_qt": "Antalgiques Palier 2"
    },
    "Tramadol": {
      "med_id_clinique": "OPIOIDES",
      "princeps": "Topalgic, Contramal, Ixprim",
      "classe_qt": "Antalgiques Palier 2"
    },
    "Buprénorphine": {
      "med_id_clinique": "OPIOIDES",
      "princeps": "Temgesic, Transtec",
      "classe_qt": "Antalgiques Palier 3"
    },
    "Fentanyl": {
      "med_id_clinique": "OPIOIDES",
      "princeps": "Durogesic, Actiq, Abstral",
      "classe_qt": "Antalgiques Palier 3"
    },
    "Hydromorphone": {
      "med_id_clinique": "OPIOIDES",
      "princeps": "Sophidone",
      "classe_qt": "Antalgiques Palier 3"
    },
    "Morphine": {
      "med_id_clinique": "OPIOIDES",
      "princeps": "Skénan, Actiskenan, Oramorph",
      "classe_qt": "Antalgiques Palier 3"
    },
    "Oxycodone": {
      "med_id_clinique": "OPIOIDES",
      "princeps": "Oxycontin, Oxynorm",
      "classe_qt": "Antalgiques Palier 3"
    },
    "Tapentadol": {
      "med_id_clinique": null,
      "princeps": "Palexia",
      "classe_qt": "Antalgiques Palier 3"
    },
    "Allopurinol": {
      "med_id_clinique": "ALLOPURINOL",
      "princeps": "Zyloric",
      "classe_qt": "Antigouteux"
    },
    "Colchicine": {
      "med_id_clinique": "COLCHICINE",
      "princeps": "Colchicine Opocalcium, Colchimax",
      "classe_qt": "Antigouteux"
    },
    "Fébusostat": {
      "med_id_clinique": null,
      "princeps": "Adenuric",
      "classe_qt": "Antigouteux"
    },
    "Metformine": {
      "med_id_clinique": "METFORMINE",
      "princeps": "Glucophage, Stagid",
      "classe_qt": "Biguanides"
    },
    "Alogliptine": {
      "med_id_clinique": "DPP4",
      "princeps": "Vipidia",
      "classe_qt": "Inhibiteurs DPP-4"
    },
    "Saxagliptine": {
      "med_id_clinique": "DPP4",
      "princeps": "Onglyza",
      "classe_qt": "Inhibiteurs DPP-4"
    },
    "Sitagliptine": {
      "med_id_clinique": "DPP4",
      "princeps": "Januvia, Xelevia",
      "classe_qt": "Inhibiteurs DPP-4"
    },
    "Vildagliptine": {
      "med_id_clinique": "DPP4",
      "princeps": "Galvus",
      "classe_qt": "Inhibiteurs DPP-4"
    },
    "Insuline Aspart": {
      "med_id_clinique": "INSULINE",
      "princeps": "Novorapid, Fiasp",
      "classe_qt": "Insulines"
    },
    "Insuline Dégludec": {
      "med_id_clinique": "INSULINE",
      "princeps": "Tresiba",
      "classe_qt": "Insulines"
    },
    "Insuline Détémir": {
      "med_id_clinique": "INSULINE",
      "princeps": "Levemir",
      "classe_qt": "Insulines"
    },
    "Insuline Glargine": {
      "med_id_clinique": "INSULINE",
      "princeps": "Lantus, Toujeo, Abasaglar",
      "classe_qt": "Insulines"
    },
    "Insuline Glulisine": {
      "med_id_clinique": "INSULINE",
      "princeps": "Apidra",
      "classe_qt": "Insulines"
    },
    "Insuline Humaine": {
      "med_id_clinique": "INSULINE",
      "princeps": "Umuline, Actrapid",
      "classe_qt": "Insulines"
    },
    "Insuline Lispro": {
      "med_id_clinique": "INSULINE",
      "princeps": "Humalog",
      "classe_qt": "Insulines"
    },
    "Lévothyroxine": {
      "med_id_clinique": null,
      "princeps": "Levothyrox, TCaps, L-Thyroxin",
      "classe_qt": "Hormones thyroïdiennes"
    },
    "Liothyronine": {
      "med_id_clinique": null,
      "princeps": "Cynomel",
      "classe_qt": "Hormones thyroïdiennes synthétiques"
    },
    "Tiratricol": {
      "med_id_clinique": null,
      "princeps": "Teatrois",
      "classe_qt": "Hormones thyroïdiennes"
    },
    "Alfacalcidol": {
      "med_id_clinique": "CALCIUM_VITD",
      "princeps": "Un-Alfa",
      "classe_qt": "Vitamine D"
    },
    "Calcifédiol": {
      "med_id_clinique": "CALCIUM_VITD",
      "princeps": "Dedrogyl",
      "classe_qt": "Vitamine D"
    },
    "Calcitriol": {
      "med_id_clinique": "CALCIUM_VITD",
      "princeps": "Rocaltrol",
      "classe_qt": "Vitamine D"
    },
    "Cholécalciférol": {
      "med_id_clinique": "CALCIUM_VITD",
      "princeps": "Uvedose, ZymaD, Adrigyl",
      "classe_qt": "Vitamine D"
    },
    "Ergocalciférol": {
      "med_id_clinique": "CALCIUM_VITD",
      "princeps": "Sterogyl",
      "classe_qt": "Vitamine D"
    },
    "Carbonate de calcium": {
      "med_id_clinique": "CALCIUM_VITD",
      "princeps": "Orocal, Calciforte, Caltrate",
      "classe_qt": "Suppléments calciques"
    },
    "Pidolate de calcium": {
      "med_id_clinique": null,
      "princeps": "Ostéocalcium",
      "classe_qt": "Suppléments calciques"
    },
    "Ésoméprazole": {
      "med_id_clinique": "VACC_GRIPPE",
      "princeps": "Inexium",
      "classe_qt": "IPP"
    },
    "Lansoprazole": {
      "med_id_clinique": "VACC_GRIPPE",
      "princeps": "Ogast, Lanzor",
      "classe_qt": "IPP"
    },
    "Oméprazole": {
      "med_id_clinique": "VACC_GRIPPE",
      "princeps": "Mopral, Zoltum",
      "classe_qt": "IPP"
    },
    "Pantoprazole": {
      "med_id_clinique": "VACC_GRIPPE",
      "princeps": "Inipomp, Eupantol",
      "classe_qt": "IPP"
    },
    "Rabéprazole": {
      "med_id_clinique": "VACC_GRIPPE",
      "princeps": "Pariet",
      "classe_qt": "IPP"
    },
    "Lactitol": {
      "med_id_clinique": "LAXATIFS",
      "princeps": "Importal",
      "classe_qt": "Laxatifs osmotiques"
    },
    "Lactulose": {
      "med_id_clinique": "LAXATIFS",
      "princeps": "Duphalac, Melaxose",
      "classe_qt": "Laxatifs osmotiques"
    },
    "Macrogol": {
      "med_id_clinique": "LAXATIFS",
      "princeps": "Forlax, Transipeg, Movicol",
      "classe_qt": "Laxatifs osmotiques"
    },
    "Béclométasone": {
      "med_id_clinique": null,
      "princeps": "Qvar, Becotide",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Budésonide": {
      "med_id_clinique": "CSI",
      "princeps": "Pulmicort",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Ciclésonide": {
      "med_id_clinique": null,
      "princeps": "Alvesco",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Fluticasone": {
      "med_id_clinique": "CSI",
      "princeps": "Flixotide",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Formotérol": {
      "med_id_clinique": "LABA",
      "princeps": "Foradil, Asmelor",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Glycopyrronium": {
      "med_id_clinique": "LAMA",
      "princeps": "Seebri",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Indacatérol": {
      "med_id_clinique": "LABA",
      "princeps": "Onbrez",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Ipratropium": {
      "med_id_clinique": null,
      "princeps": "Atrovent",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Salbutamol": {
      "med_id_clinique": null,
      "princeps": "Ventoline",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Salmétérol": {
      "med_id_clinique": "LABA",
      "princeps": "Sérévent",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Terbutaline": {
      "med_id_clinique": null,
      "princeps": "Bricanyl",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Tiotropium": {
      "med_id_clinique": "LAMA",
      "princeps": "Spiriva",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Umeclidinium": {
      "med_id_clinique": null,
      "princeps": "Incruse",
      "classe_qt": "Bronchodilatateurs/CSI"
    },
    "Alfuzosine": {
      "med_id_clinique": null,
      "princeps": "Xatral",
      "classe_qt": "Alphabloquants (HBP)"
    },
    "Doxazosine": {
      "med_id_clinique": "ALPHA_HTA",
      "princeps": "Zoxan",
      "classe_qt": "Alphabloquants (HBP)"
    },
    "Prazosine": {
      "med_id_clinique": "ALPHA_HTA",
      "princeps": "Minipress",
      "classe_qt": "Alphabloquants (HBP)"
    },
    "Silodosine": {
      "med_id_clinique": "ALPHA_URO",
      "princeps": "Silodyx",
      "classe_qt": "Alphabloquants (HBP)"
    },
    "Tamsulosine": {
      "med_id_clinique": "ALPHA_URO",
      "princeps": "Josir, Omix, Mecir",
      "classe_qt": "Alphabloquants (HBP)"
    },
    "Térazosine": {
      "med_id_clinique": "ALPHA_HTA",
      "princeps": "Dysalpha, Hytrine",
      "classe_qt": "Alphabloquants (HBP)"
    },
    "Apraclonidine": {
      "med_id_clinique": null,
      "princeps": "Iopidine",
      "classe_qt": "Collyres glaucome"
    },
    "Bimatoprost": {
      "med_id_clinique": null,
      "princeps": "Lumigan",
      "classe_qt": "Collyres glaucome"
    },
    "Brimonidine": {
      "med_id_clinique": null,
      "princeps": "Alphagan",
      "classe_qt": "Collyres glaucome"
    },
    "Brinzolamide": {
      "med_id_clinique": null,
      "princeps": "Azopt",
      "classe_qt": "Collyres glaucome"
    },
    "Dorzolamide": {
      "med_id_clinique": null,
      "princeps": "Trusopt",
      "classe_qt": "Collyres glaucome"
    },
    "Latanoprost": {
      "med_id_clinique": null,
      "princeps": "Xalatan",
      "classe_qt": "Collyres glaucome"
    },
    "Pilocarpine": {
      "med_id_clinique": null,
      "princeps": "Isopto Pilocarpine",
      "classe_qt": "Collyres glaucome"
    },
    "Tafluprost": {
      "med_id_clinique": null,
      "princeps": "Saflutan",
      "classe_qt": "Collyres glaucome"
    },
    "Timolol": {
      "med_id_clinique": null,
      "princeps": "Timoptol",
      "classe_qt": "Collyres glaucome"
    },
    "Travoprost": {
      "med_id_clinique": null,
      "princeps": "Travatan",
      "classe_qt": "Collyres glaucome"
    },
    "Bétaméthasone": {
      "med_id_clinique": null,
      "princeps": "Célestène",
      "classe_qt": "Corticoïdes oraux"
    },
    "Cortisone": {
      "med_id_clinique": null,
      "princeps": "Cortisone Roussel",
      "classe_qt": "Corticoïdes oraux"
    },
    "Dexaméthasone": {
      "med_id_clinique": null,
      "princeps": "Dectancyl",
      "classe_qt": "Corticoïdes oraux"
    },
    "Hydrocortisone": {
      "med_id_clinique": null,
      "princeps": "Hydrocortisone Roussel",
      "classe_qt": "Corticoïdes oraux"
    },
    "Méthylprednisolone": {
      "med_id_clinique": null,
      "princeps": "Médrol",
      "classe_qt": "Corticoïdes oraux"
    },
    "Prednisolone": {
      "med_id_clinique": null,
      "princeps": "Solupred",
      "classe_qt": "Corticoïdes oraux"
    },
    "Prednisone": {
      "med_id_clinique": null,
      "princeps": "Cortancyl",
      "classe_qt": "Corticoïdes oraux"
    },
    "Ascorbate ferreux": {
      "med_id_clinique": null,
      "princeps": "Ascofer",
      "classe_qt": "Fer oral"
    },
    "Fumarate ferreux": {
      "med_id_clinique": null,
      "princeps": "Fumafer",
      "classe_qt": "Fer oral"
    },
    "Sulfate ferreux": {
      "med_id_clinique": null,
      "princeps": "Tardyféron, Timférol",
      "classe_qt": "Fer oral"
    },
    "Chlorpromazine": {
      "med_id_clinique": "AP",
      "princeps": "Largactil",
      "classe_qt": "Neuroleptiques atypiques"
    },
    "Haloperidol": {
      "med_id_clinique": null,
      "princeps": "Haldol",
      "classe_qt": "Neuroleptiques atypiques"
    },
    "Fluphenazine": {
      "med_id_clinique": null,
      "princeps": "Moditen",
      "classe_qt": "Neuroleptiques atypiques"
    },
    "Perphenazine": {
      "med_id_clinique": null,
      "princeps": "Trilafon",
      "classe_qt": "Neuroleptiques atypiques"
    },
    "Levomepromazine": {
      "med_id_clinique": null,
      "princeps": "Nozinan",
      "classe_qt": "Neuroleptiques atypiques"
    },
    "Ritonavir": {
      "med_id_clinique": null,
      "princeps": "Norvir",
      "classe_qt": "Antiviraux antiretroviraux"
    },
    "Cobicistat": {
      "med_id_clinique": null,
      "princeps": "Tybost",
      "classe_qt": "Antiviraux antiretroviraux"
    },
    "Darunavir": {
      "med_id_clinique": null,
      "princeps": "Prezista",
      "classe_qt": "Antiviraux antiretroviraux"
    },
    "Atazanavir": {
      "med_id_clinique": null,
      "princeps": "Reyataz",
      "classe_qt": "Antiviraux antiretroviraux"
    },
    "Lopinavir": {
      "med_id_clinique": null,
      "princeps": "Kaletra",
      "classe_qt": "Antiviraux antiretroviraux"
    },
    "Efavirenz": {
      "med_id_clinique": null,
      "princeps": "Stocrin",
      "classe_qt": "Antiviraux antiretroviraux"
    },
    "Doravirine": {
      "med_id_clinique": null,
      "princeps": "Pifeltro",
      "classe_qt": "Antiviraux antiretroviraux"
    },
    "Emtricitabine": {
      "med_id_clinique": null,
      "princeps": "Emtriva",
      "classe_qt": "Antiviraux antiretroviraux"
    },
    "Asunaprevir": {
      "med_id_clinique": null,
      "princeps": "Sunvepra",
      "classe_qt": "Antiviraux hépatite C"
    },
    "Boceprevir": {
      "med_id_clinique": null,
      "princeps": "Victrelis",
      "classe_qt": "Antiviraux hépatite C"
    },
    "Daclatasvir": {
      "med_id_clinique": null,
      "princeps": "Daklinza",
      "classe_qt": "Antiviraux hépatite C"
    },
    "Sofosbuvir": {
      "med_id_clinique": null,
      "princeps": "Sovaldi",
      "classe_qt": "Antiviraux hépatite C"
    },
    "Amiodarone": {
      "med_id_clinique": "ANTIARYTHMIQUE_I",
      "princeps": "Cordarone",
      "classe_qt": "Antiarythmiques"
    },
    "Dronedarone": {
      "med_id_clinique": "ANTIARYTHMIQUE_I",
      "princeps": "Multaq",
      "classe_qt": "Antiarythmiques"
    },
    "Disopyramide": {
      "med_id_clinique": "ANTIARYTHMIQUE_I",
      "princeps": "Rythmodan",
      "classe_qt": "Antiarythmiques"
    },
    "Chlorphéniramine": {
      "med_id_clinique": null,
      "princeps": "Polaramine",
      "classe_qt": "Antihistaminiques H1"
    },
    "Cétirizine": {
      "med_id_clinique": null,
      "princeps": "Virlix",
      "classe_qt": "Antihistaminiques H1"
    },
    "Loratadine": {
      "med_id_clinique": null,
      "princeps": "Clarityne",
      "classe_qt": "Antihistaminiques H1"
    },
    "Fexofénadine": {
      "med_id_clinique": null,
      "princeps": "Telfast",
      "classe_qt": "Antihistaminiques H1"
    },
    "Eletriptan": {
      "med_id_clinique": null,
      "princeps": "Relert",
      "classe_qt": "Antimigraine (Triptans)"
    },
    "Frovatriptan": {
      "med_id_clinique": null,
      "princeps": "Fractal",
      "classe_qt": "Antimigraine (Triptans)"
    },
    "Naratriptan": {
      "med_id_clinique": null,
      "princeps": "Naramig",
      "classe_qt": "Antimigraine (Triptans)"
    },
    "Sumatriptan": {
      "med_id_clinique": null,
      "princeps": "Imigrane",
      "classe_qt": "Antimigraine (Triptans)"
    },
    "Zolmitriptan": {
      "med_id_clinique": null,
      "princeps": "Zomig",
      "classe_qt": "Antimigraine (Triptans)"
    },
    "Ciclosporine": {
      "med_id_clinique": null,
      "princeps": "Neoral/Sandimmun",
      "classe_qt": "Immunosuppresseurs"
    },
    "Tacrolimus": {
      "med_id_clinique": null,
      "princeps": "Prograf",
      "classe_qt": "Immunosuppresseurs"
    },
    "Mycophenolate mofétil": {
      "med_id_clinique": null,
      "princeps": "Cellcept",
      "classe_qt": "Immunosuppresseurs"
    },
    "Bosentan": {
      "med_id_clinique": null,
      "princeps": "Tracleer",
      "classe_qt": "Antagonistes endothéline"
    },
    "Ambrisentan": {
      "med_id_clinique": null,
      "princeps": "Volibris",
      "classe_qt": "Antagonistes endothéline"
    },
    "Bupropion": {
      "med_id_clinique": null,
      "princeps": "Wellbutrin",
      "classe_qt": "Antidépresseurs atypiques"
    },
    "Buspirone": {
      "med_id_clinique": null,
      "princeps": "Buspar",
      "classe_qt": "Antidépresseurs atypiques"
    },
    "Mirtazapine": {
      "med_id_clinique": null,
      "princeps": "Norset",
      "classe_qt": "Antidépresseurs atypiques"
    },
    "Liotrix": {
      "med_id_clinique": null,
      "princeps": "Éuthyral",
      "classe_qt": "Hormones thyroïdiennes synthétiques"
    },
    "Cimétidine": {
      "med_id_clinique": "ANTI_H2",
      "princeps": "Tagamet",
      "classe_qt": "Antiulcéreux H2"
    },
    "Famotidine": {
      "med_id_clinique": "ANTI_H2",
      "princeps": "Pepcidine",
      "classe_qt": "Antiulcéreux H2"
    },
    "Cilostazol": {
      "med_id_clinique": null,
      "princeps": "Pletal",
      "classe_qt": "Cinétiques anti-VGCC"
    },
    "Aprepitant": {
      "med_id_clinique": null,
      "princeps": "Emend",
      "classe_qt": "Modulateurs CRF1"
    },
    "Fosaprepitant": {
      "med_id_clinique": null,
      "princeps": "Emend IV",
      "classe_qt": "Modulateurs CRF1"
    },
    "Casopitant": {
      "med_id_clinique": null,
      "princeps": "GW679769",
      "classe_qt": "Modulateurs CRF1"
    },
    "Miglitinide": {
      "med_id_clinique": null,
      "princeps": "Novonorm",
      "classe_qt": "Activateurs canaux K+ pancréatique"
    },
    "Nateglinide": {
      "med_id_clinique": null,
      "princeps": "Starlix",
      "classe_qt": "Activateurs canaux K+ pancréatique"
    },
    "Benzbromarone": {
      "med_id_clinique": null,
      "princeps": "Narcaricine",
      "classe_qt": "Anthelminthiques"
    },
    "Albendazole": {
      "med_id_clinique": null,
      "princeps": "Zentel",
      "classe_qt": "Anthelminthiques"
    },
    "Ditropan / Driptane": {
      "med_id_clinique": null,
      "princeps": "(Oxybutynine)",
      "classe_qt": "Urologie (Incontinence vésicale)"
    },
    "Vesicare": {
      "med_id_clinique": null,
      "princeps": "(Solifénacine)",
      "classe_qt": "Urologie (Incontinence vésicale)"
    },
    "Detrusitol": {
      "med_id_clinique": null,
      "princeps": "(Toltérodine)",
      "classe_qt": "Urologie (Incontinence vésicale)"
    },
    "Toviaz": {
      "med_id_clinique": null,
      "princeps": "(Fésotérodine)",
      "classe_qt": "Urologie (Incontinence vésicale)"
    },
    "Ceris": {
      "med_id_clinique": null,
      "princeps": "(Trospium)",
      "classe_qt": "Urologie (Incontinence vésicale)"
    },
    "Laroxyl": {
      "med_id_clinique": "ATC",
      "princeps": "(Amitriptyline)",
      "classe_qt": "Psychiatrie (Antidépresseurs Tricycliques)"
    },
    "Anafranil": {
      "med_id_clinique": "ATC",
      "princeps": "(Clomipramine)",
      "classe_qt": "Psychiatrie (Antidépresseurs Tricycliques)"
    },
    "Tofranil": {
      "med_id_clinique": "ATC",
      "princeps": "(Imipramine)",
      "classe_qt": "Psychiatrie (Antidépresseurs Tricycliques)"
    },
    "Quitaxon": {
      "med_id_clinique": "ATC",
      "princeps": "(Doxépine)",
      "classe_qt": "Psychiatrie (Antidépresseurs Tricycliques)"
    },
    "Surmontil": {
      "med_id_clinique": "ATC",
      "princeps": "(Trimipramine)",
      "classe_qt": "Psychiatrie (Antidépresseurs Tricycliques)"
    },
    "Atarax": {
      "med_id_clinique": null,
      "princeps": "(Hydroxyzine)",
      "classe_qt": "Sommeil / Allergologie (Anti-H1 1ère gén.)"
    },
    "Donormyl / Lidaprim": {
      "med_id_clinique": null,
      "princeps": "(Doxylamine)",
      "classe_qt": "Sommeil / Allergologie (Anti-H1 1ère gén.)"
    },
    "Phenergan": {
      "med_id_clinique": null,
      "princeps": "(Prométhazine)",
      "classe_qt": "Sommeil / Allergologie (Anti-H1 1ère gén.)"
    },
    "Théralène": {
      "med_id_clinique": null,
      "princeps": "(Alimémazine)",
      "classe_qt": "Sommeil / Allergologie (Anti-H1 1ère gén.)"
    },
    "Polaramine": {
      "med_id_clinique": null,
      "princeps": "(Dexchlorphéniramine)",
      "classe_qt": "Sommeil / Allergologie (Anti-H1 1ère gén.)"
    },
    "Tercian (Cyamémazine)": {
      "med_id_clinique": null,
      "princeps": "cyamémazine",
      "classe_qt": "Psychiatrie (Neuroleptiques / Phénothiazines)"
    },
    "Piportil (Pipotiazine)": {
      "med_id_clinique": null,
      "princeps": "Pipotiazine",
      "classe_qt": "Psychiatrie (Neuroleptiques / Phénothiazines)"
    },
    "Fluanxol (Flupentixol)": {
      "med_id_clinique": null,
      "princeps": "Flupentixol",
      "classe_qt": "Psychiatrie (Neuroleptiques / Phénothiazines)"
    },
    "Clopixol (Zuclopenthixol)": {
      "med_id_clinique": null,
      "princeps": "Zuclopenthixol",
      "classe_qt": "Psychiatrie (Neuroleptiques / Phénothiazines)"
    },
    "Artane / Parkinane (Trihexyphénidyle)": {
      "med_id_clinique": null,
      "princeps": "(Trihexyphénidyle)",
      "classe_qt": "Neurologie (Antiparkinsoniens Anticholin.)"
    },
    "Lepticur (Tropatépine)": {
      "med_id_clinique": null,
      "princeps": "tropatépine",
      "classe_qt": "Neurologie (Antiparkinsoniens Anticholin.)"
    },
    "Akineton (Bipéridène)": {
      "med_id_clinique": null,
      "princeps": "Bipéridène",
      "classe_qt": "Neurologie (Antiparkinsoniens Anticholin.)"
    },
    "Scopoderm (Scopolamine)": {
      "med_id_clinique": null,
      "princeps": "Scopolamine",
      "classe_qt": "Gastro-entérologie (Antispasmodiques)"
    },
    "Viscéralgine (Tiémonium)": {
      "med_id_clinique": null,
      "princeps": "Tiémonium",
      "classe_qt": "Gastro-entérologie (Antispasmodiques)"
    },
    "Atropine (collyre)": {
      "med_id_clinique": null,
      "princeps": "atropine",
      "classe_qt": "Cardiologie / Ophtalmologie"
    },
    "Hemigoxine / Digoxine (Digoxine)": {
      "med_id_clinique": null,
      "princeps": "Digoxine",
      "classe_qt": "Cardiologie (Anti-arythmiques / Diurétiques)"
    },
    "Tenoretic": {
      "med_id_clinique": null,
      "princeps": "(Aténolol + Chlortalidone)",
      "classe_qt": "Cardiologie (Anti-arythmiques / Diurétiques)"
    },
    "Primpéran": {
      "med_id_clinique": null,
      "princeps": "(Métoclopramide)",
      "classe_qt": "Gastro-entérologie (Antinauséeux / Autres)"
    },
    "Imodium": {
      "med_id_clinique": null,
      "princeps": "(Lopéramide)",
      "classe_qt": "Gastro-entérologie (Antinauséeux / Autres)"
    },
    "Miorel / Coltramyl": {
      "med_id_clinique": null,
      "princeps": "(Thiocolchicoside)",
      "classe_qt": "Rhumatologie (Myorelaxants)"
    },
    "Lumirelax": {
      "med_id_clinique": null,
      "princeps": "(Méthocarbamol)",
      "classe_qt": "Rhumatologie (Myorelaxants)"
    }
  }
};
