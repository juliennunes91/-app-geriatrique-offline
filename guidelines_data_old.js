const GUIDELINES_DB = [
  {
    "Rule ID": "AGS_BEERS_2023_ANTICHOLINERGIC",
    "Pathologie": "Gériatrie",
    "Domaine": "Pharmacothérapie",
    "Type": "STOP",
    "Source/Année": "AGS 2023",
    "Décision": "Éviter anticholinergiques forts (âge ≥65)",
    "Niveau Evidence": "Strong / High",
    "Divergences potentielles": "AUCUNE"
  },
  {
    "Rule ID": "ESC_FA_2024_ANTICO_INIT",
    "Pathologie": "Fibrillation Atriale",
    "Domaine": "Anticoagulation",
    "Type": "Initiation",
    "Source/Année": "ESC 2024",
    "Décision": "AOD (apixaban, dabigatran) si CHA₂DS₂-VASc ≥ 2 (Homme) ou ≥ 3 (Femme)",
    "Niveau Evidence": "Classe I / Niveau A",
    "Divergences potentielles": "ACC/AHA: seuil similaire, AOD préférés"
  },
  {
    "Rule ID": "KDIGO_SGLT2i_CKD_INIT",
    "Pathologie": "MRC + DT2",
    "Domaine": "Néphroprotection",
    "Type": "Initiation",
    "Source/Année": "KDIGO 2024",
    "Décision": "SGLT2i recommandé si DT2 + MRC (eGFR ≥ 20)",
    "Niveau Evidence": "Classe I / Niveau A",
    "Divergences potentielles": "EASD: concordant"
  },
  {
    "Rule ID": "ADA_HBA1C_CARE_Elderly",
    "Pathologie": "Diabète Type 2",
    "Domaine": "Contrôle Glycémique",
    "Type": "Monitoring Target",
    "Source/Année": "ADA 2024",
    "Décision": "Cible HbA1c < 8.0-8.5% si âge ≥75 + fragilité",
    "Niveau Evidence": "IIa / Niveau B",
    "Divergences potentielles": "HAS: 7.5-8% chez fragiles"
  },
  {
    "Rule ID": "NICE_HTA_General",
    "Pathologie": "Hypertension",
    "Domaine": "Traitement",
    "Type": "Initiation",
    "Source/Année": "NICE 2024",
    "Décision": "Initier si TA > 140/90 (âge ≥65 + risque CV modéré)",
    "Niveau Evidence": "Classe I / Niveau A",
    "Divergences potentielles": "ESC: cible < 130/80 si bien toléré"
  },
  {
    "Rule ID": "WHO_HTA_2023_LMIC",
    "Pathologie": "Hypertension",
    "Domaine": "Traitement",
    "Type": "Initiation",
    "Source/Année": "WHO 2023",
    "Décision": "Initier si TA ≥ 140/90 (ressources limitées)",
    "Niveau Evidence": "Strong / Niveau A",
    "Divergences potentielles": "CDC: seuil 130/80 (populations US)"
  },
  {
    "Rule ID": "EASL_MASLD_2024",
    "Pathologie": "Stéatopathie métabolique (MASLD)",
    "Domaine": "Hépatologie",
    "Type": "Monitoring",
    "Source/Année": "EASL/EASD/EASO 2024",
    "Décision": "Surveillance biologique annuelle (FIB-4, NFS, bilan hépatique) + Perte de poids de 5 à 10% recommandée. Resmetirom (Rezdiffra) approuvé pour MASH avec fibrose F2-F3.",
    "Niveau Evidence": "Classe I / Niveau B",
    "Divergences potentielles": "AASLD 2023: concordant (nomenclature MASLD adoptée)"
  },
  {
    "Rule ID": "IDSA_UTI_AMBULATORY",
    "Pathologie": "Infection urinaire",
    "Domaine": "Infectiologie",
    "Type": "Initiation",
    "Source/Année": "IDSA 2024",
    "Décision": "Nitrofurantoïne 100mg 2x/j (5j) ou Fosfomycine 3g (dose unique)",
    "Niveau Evidence": "Classe I / Niveau A",
    "Divergences potentielles": "NICE: TMP-SMX si résistance < 20%"
  },
  {
    "Rule ID": "ESC_CVC_PREVENTION_2021",
    "Pathologie": "Prévention CV",
    "Domaine": "Prévention",
    "Type": "STOP",
    "Source/Année": "ESC 2021",
    "Décision": "STOP aspirine en prévention primaire si âge > 70",
    "Niveau Evidence": "Classe III / Niveau A",
    "Divergences potentielles": "USPSTF 2022: discussion 40-59 ans, contre-indiqué > 60"
  }
];
