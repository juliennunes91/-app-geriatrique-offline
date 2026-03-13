const GUIDELINES_DB = [
  {
    "Rule ID": "AGS_BEERS_2023_ANTICHOLINERGIC",
    "Pathologie": "GÇriatrie",
    "Domaine": "PharmacothÇrapie",
    "Type": "STOP",
    "Source/AnnÇe": "AGS 2023",
    "DÇcision": "êviter anticholinergiques forts (age ?65)",
    "Niveau Evidence": "Expert/Consensus",
    "Divergences potentielles": "AUCUNE"
  },
  {
    "Rule ID": "ESC_FA_2024_ANTICO_INIT",
    "Pathologie": "Fibrillation Atriale",
    "Domaine": "Anticoagulation",
    "Type": "Initiation",
    "Source/AnnÇe": "ESC 2024",
    "DÇcision": "AOD (apixaban, dabigatran) si CHA₂DS₂-VASc ≥ 2 (Homme) ou ≥ 3 (Femme)",
    "Niveau Evidence": "Classe I / Niveau A",
    "Divergences potentielles": "ACC/AHA: seuil similaire, AOD prÇfÇrÇs"
  },
  {
    "Rule ID": "KDIGO_SGLT2i_CKD_INIT",
    "Pathologie": "MRC + DT2",
    "Domaine": "NÇphroprotection",
    "Type": "Initiation",
    "Source/AnnÇe": "KDIGO 2022",
    "DÇcision": "SGLT2i recommandÇ si DT2 + MRC (eGFR ? 20)",
    "Niveau Evidence": "Classe I / Niveau A",
    "Divergences potentielles": "EASD: concordant"
  },
  {
    "Rule ID": "ADA_HBA1C_CARE_Elderly",
    "Pathologie": "Diabäte Type 2",
    "Domaine": "Contrìle GlycÇmique",
    "Type": "Monitoring Target",
    "Source/AnnÇe": "ADA 2024",
    "DÇcision": "Cible HbA1c < 8.0-8.5% si age ?75 + fragilitÇ",
    "Niveau Evidence": "IIa / Niveau B",
    "Divergences potentielles": "HAS: 7.5-8% chez fragiles"
  },
  {
    "Rule ID": "NICE_HTA_General",
    "Pathologie": "Hypertension",
    "Domaine": "Traitement",
    "Type": "Initiation",
    "Source/AnnÇe": "NICE 2024",
    "DÇcision": "Initier si TA > 140/90 (age ?65 + risque CV modÇrÇ)",
    "Niveau Evidence": "Classe I / Niveau A",
    "Divergences potentielles": "ESC: cible < 130/80 si bien tolÇrÇ"
  },
  {
    "Rule ID": "WHO_HTA_2023_LMIC",
    "Pathologie": "Hypertension",
    "Domaine": "Traitement",
    "Type": "Initiation",
    "Source/AnnÇe": "WHO 2023",
    "DÇcision": "Initier si TA ? 140/90 (ressources limitÇes)",
    "Niveau Evidence": "Strong / Niveau A",
    "Divergences potentielles": "CDC: seuil 130/80 (populations US)"
  },
  {
    "Rule ID": "EASL_NAFLD_2018",
    "Pathologie": "StÇatose hÇpatique",
    "Domaine": "HÇpatologie",
    "Type": "Monitoring",
    "Source/AnnÇe": "EASL 2018",
    "DÇcision": "Surveillance biologique annuelle + Perte de poids de 5 à 10% recommandée",
    "Niveau Evidence": "Classe I / Niveau B",
    "Divergences potentielles": "ACG: biopsie si suspicion NASH"
  },
  {
    "Rule ID": "IDSA_UTI_AMBULATORY",
    "Pathologie": "Infection urinaire",
    "Domaine": "Infectiologie",
    "Type": "Initiation",
    "Source/AnnÇe": "IDSA 2024",
    "DÇcision": "Nitrofurantoïne 100mg 2x/j (5j) ou Fosfomycine 3g (dose unique)",
    "Niveau Evidence": "Classe I / Niveau A",
    "Divergences potentielles": "NICE: TMP-SMX si rÇsist < 20%"
  },
  {
    "Rule ID": "ESC_CVC_PREVENTION_2021",
    "Pathologie": "PrÇvention CV",
    "Domaine": "PrÇvention",
    "Type": "STOP",
    "Source/AnnÇe": "ESC 2021",
    "DÇcision": "STOP aspirine en prÇvention primaire si age > 70",
    "Niveau Evidence": "Classe III / Niveau A",
    "Divergences potentielles": "USPSTF: discussion 40-59, pas > 70"
  }
];
