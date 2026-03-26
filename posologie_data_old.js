const POSOLOGIE_DB = [
  {
    "medicament": "Alendronate",
    "classe_pharmacologique": "Bisphosphonate",
    "posologie_adulte": "70 mg/sem PO (ostéoporose) ; 10 mg/j ; 40 mg/j (Paget)",
    "posologie_sujet_age": "Même dose. CI si DFG<35. Pas d'ajustement lié à l'âge.",
    "notes_cliniques": "À jeun + grand verre d'eau, rester debout 30 min",
    "source": "RCP Fosamax ; HAS 2018"
  },
  {
    "medicament": "Risédronate",
    "classe_pharmacologique": "Bisphosphonate",
    "posologie_adulte": "35 mg/sem PO ou 75 mg 2j consécutifs/mois ou 150 mg/mois ou 5 mg/j",
    "posologie_sujet_age": "Même dose. CI si DFG<30.",
    "notes_cliniques": "À jeun, rester debout 30 min",
    "source": "RCP Actonel ; HAS 2018"
  },
  {
    "medicament": "Acide zolédronique",
    "classe_pharmacologique": "Bisphosphonate",
    "posologie_adulte": "5 mg IV/an (ostéoporose) ; 4 mg IV/3–4 sem (métastases)",
    "posologie_sujet_age": "Même dose. CI si DFG<35. Hydratation obligatoire (risque IRA ↑).",
    "notes_cliniques": "Perfusion ≥15 min. Supplémentation Ca/Vit D obligatoire",
    "source": "RCP Aclasta ; HAS 2018"
  },
  {
    "medicament": "Ibandronate",
    "classe_pharmacologique": "Bisphosphonate",
    "posologie_adulte": "150 mg/mois PO ou 3 mg IV/3 mois",
    "posologie_sujet_age": "Même dose. CI si DFG<30.",
    "notes_cliniques": "PO : à jeun, rester debout 60 min",
    "source": "RCP Bonviva ; HAS 2018"
  },
  {
    "medicament": "Carbimazole",
    "classe_pharmacologique": "Antithyroïdien de synthèse",
    "posologie_adulte": "20–60 mg/j PO en 2–3 prises (attaque) ; 5–15 mg/j (entretien)",
    "posologie_sujet_age": "Même dose. Prudence comorbidités cardiaques. Pas d'ajustement officiel.",
    "notes_cliniques": "NFS si fièvre (agranulocytose)",
    "source": "RCP Néo-Mercazole ; HAS 2022"
  },
  {
    "medicament": "Propylthiouracile",
    "classe_pharmacologique": "Antithyroïdien de synthèse",
    "posologie_adulte": "300–600 mg/j PO en 3 prises (attaque) ; 50–150 mg/j (entretien)",
    "posologie_sujet_age": "Même dose. Hépatotoxicité plus fréquente → surveillance renforcée.",
    "notes_cliniques": "Préféré au 1er trimestre grossesse et crise thyrotoxique",
    "source": "RCP PTU ; HAS 2022"
  },
  {
    "medicament": "Empagliflozin",
    "classe_pharmacologique": "iSGLT2",
    "posologie_adulte": "10 mg/j PO (DT2, IC, MRC) ; 25 mg/j si tolérance (DT2)",
    "posologie_sujet_age": "Pas d'ajustement à l'âge. CI si DFG<20. Prudence hypotension.",
    "notes_cliniques": "Pause péri-opératoire 3–4 j",
    "source": "RCP Jardiance ; HAS 2023"
  },
  {
    "medicament": "Dapagliflozin",
    "classe_pharmacologique": "iSGLT2",
    "posologie_adulte": "10 mg/j PO (DT2, IC, MRC)",
    "posologie_sujet_age": "Pas d'ajustement à l'âge. Protecteur rénal/cardiaque maintenu. Prudence DFG<45.",
    "notes_cliniques": "Pause péri-opératoire 3–4 j",
    "source": "RCP Forxiga ; HAS 2023"
  },
  {
    "medicament": "Canagliflozin",
    "classe_pharmacologique": "iSGLT2",
    "posologie_adulte": "100 mg/j PO ; 300 mg/j si tolérance et DFG≥60",
    "posologie_sujet_age": "Pas d'ajustement à l'âge. CI si DFG<30. Risque fractures/amputations.",
    "notes_cliniques": "Pause péri-opératoire 3–4 j",
    "source": "RCP Invokana ; HAS 2023"
  },
  {
    "medicament": "Ertugliflozin",
    "classe_pharmacologique": "iSGLT2",
    "posologie_adulte": "5 mg/j PO ; 15 mg/j si tolérance",
    "posologie_sujet_age": "Pas d'ajustement à l'âge. CI si DFG<30. Prudence hypotension.",
    "notes_cliniques": "Pause péri-opératoire 3–4 j",
    "source": "RCP Steglatro ; HAS 2023"
  },
  {
    "medicament": "Exenatide",
    "classe_pharmacologique": "Analogue GLP-1",
    "posologie_adulte": "5 µg x2/j SC (4 sem) → 10 µg x2/j ; ou 2 mg/sem SC (LP)",
    "posologie_sujet_age": "Pas d'ajustement à l'âge. CI LP si DFG<30. Nausées plus fréquentes.",
    "notes_cliniques": "Injection 60 min avant repas (forme courte)",
    "source": "RCP Byetta/Bydureon ; HAS 2023"
  },
  {
    "medicament": "Liraglutide",
    "classe_pharmacologique": "Analogue GLP-1",
    "posologie_adulte": "0,6 mg/j SC → 1,2 mg/j → 1,8 mg/j (DT2) ; jusqu'à 3 mg/j (obésité)",
    "posologie_sujet_age": "Pas d'ajustement à l'âge. Nausées fréquentes. Prudence IR/IH.",
    "notes_cliniques": "Titration progressive",
    "source": "RCP Victoza/Saxenda ; HAS 2023"
  },
  {
    "medicament": "Dulaglutide",
    "classe_pharmacologique": "Analogue GLP-1",
    "posologie_adulte": "0,75 mg/sem SC → 1,5 mg/sem → 3 mg/sem → 4,5 mg/sem",
    "posologie_sujet_age": "Pas d'ajustement. Données limitées >75 ans.",
    "notes_cliniques": "Titration toutes les 4 semaines",
    "source": "RCP Trulicity ; HAS 2023"
  },
  {
    "medicament": "Sémaglutide",
    "classe_pharmacologique": "Analogue GLP-1",
    "posologie_adulte": "SC : 0,25→0,5→1→2 mg/sem (DT2) ; PO : 3→7→14 mg/j (Rybelsus) ; 2,4 mg/sem (obésité)",
    "posologie_sujet_age": "Pas d'ajustement. Données insuffisantes >75 ans. Prudence dénutrition.",
    "notes_cliniques": "PO : à jeun avec ≤120 mL eau, attendre 30 min",
    "source": "RCP Ozempic/Wegovy/Rybelsus ; HAS 2023"
  },
  {
    "medicament": "Tirzépatide",
    "classe_pharmacologique": "Analogue GLP-1/GIP",
    "posologie_adulte": "2,5 mg/sem SC (4 sem) → 5→7,5→10→12,5→15 mg/sem",
    "posologie_sujet_age": "Pas d'ajustement officiel. Données limitées >75 ans. Prudence dénutrition/hypotension.",
    "notes_cliniques": "Titration toutes les 4 semaines",
    "source": "RCP Mounjaro ; HAS 2024"
  },
  {
    "medicament": "Amiloride",
    "classe_pharmacologique": "Diurétique épargneur de potassium",
    "posologie_adulte": "5–20 mg/j PO",
    "posologie_sujet_age": "Débuter à 5 mg/j. Risque hyperkaliémie ↑. Réduire si DFG diminué.",
    "notes_cliniques": "Toujours associé à diurétique kaliurétique",
    "source": "RCP Modamide"
  },
  {
    "medicament": "Bumétanide",
    "classe_pharmacologique": "Diurétique de l'anse",
    "posologie_adulte": "0,5–2 mg/j PO ; jusqu'à 10 mg/j (IC sévère)",
    "posologie_sujet_age": "Débuter à dose minimale. Risque déshydratation/hyponatrémie/chutes.",
    "notes_cliniques": "1 mg bumétanide ≈ 40 mg furosémide",
    "source": "RCP Burinex ; ESC HF 2021"
  },
  {
    "medicament": "Ciclétanide",
    "classe_pharmacologique": "Diurétique de l'anse",
    "posologie_adulte": "100–200 mg/j PO",
    "posologie_sujet_age": "Prudence : déshydratation, hyponatrémie. Dose minimale.",
    "notes_cliniques": "Usage principalement HTA",
    "source": "RCP Tenstaten"
  },
  {
    "medicament": "Éplérénone",
    "classe_pharmacologique": "Anti-aldostérone",
    "posologie_adulte": "Post-IDM : 25 mg/j → 50 mg/j à 4 sem ; IC : 25 mg/j → 50 mg/j",
    "posologie_sujet_age": "Même dose. CI si DFG<30 ou K+>5 mmol/L. Risque hyperkaliémie ↑ >75 ans.",
    "notes_cliniques": "Ne pas associer IEC+ARA2+anti-aldostérone (triple blocage SRA)",
    "source": "RCP Inspra ; ESC HF 2021"
  },
  {
    "medicament": "Furosémide",
    "classe_pharmacologique": "Diurétique de l'anse",
    "posologie_adulte": "HTA : 20–40 mg/j ; IC : 20–80 mg/j (jusqu'à 600 mg/j IV OAP)",
    "posologie_sujet_age": "Débuter à 20 mg/j. Risque déshydratation/hyponatrémie/chutes/IRA fonctionnelle ↑.",
    "notes_cliniques": "Prendre le matin (nycturie)",
    "source": "RCP Lasilix ; ESC HF 2021"
  },
  {
    "medicament": "Hydrochlorothiazide",
    "classe_pharmacologique": "Thiazidique",
    "posologie_adulte": "HTA : 12,5–25 mg/j PO ; max 50 mg/j",
    "posologie_sujet_age": "Débuter à 12,5 mg/j. Risque hyponatrémie/déshydratation. Prudence si DFG<30.",
    "notes_cliniques": "Photosensibilisation ; risque carcinome cutané prolongé",
    "source": "RCP HCTZ ; ESC HTA 2023"
  },
  {
    "medicament": "Indapamide",
    "classe_pharmacologique": "Thiazidique-like",
    "posologie_adulte": "1,5 mg/j (LP) ou 2,5 mg/j PO",
    "posologie_sujet_age": "Même dose. Surveillance natrémie. Préféré aux thiazidiques en IRC modérée.",
    "notes_cliniques": "Préféré aux thiazidiques en IRC modérée",
    "source": "RCP Fludex ; ESC HTA 2023"
  },
  {
    "medicament": "Pirétanide",
    "classe_pharmacologique": "Diurétique de l'anse",
    "posologie_adulte": "3–6 mg/j PO (LP) ; 6–12 mg/j si IR",
    "posologie_sujet_age": "Débuter à dose minimale. Même précautions que furosémide.",
    "notes_cliniques": "Usage HTA et IC",
    "source": "RCP Eurelix"
  },
  {
    "medicament": "Spironolactone",
    "classe_pharmacologique": "Anti-aldostérone",
    "posologie_adulte": "IC : 25–50 mg/j PO ; HTA réfractaire : 25 mg/j ; hyperaldostéronisme : 100–400 mg/j",
    "posologie_sujet_age": "Débuter à 25 mg/j. Risque hyperkaliémie majeur (IRC fréquente). K+ rapproché.",
    "notes_cliniques": "Gynécomastie dose-dépendante",
    "source": "RCP Aldactone ; ESC HF 2021"
  },
  {
    "medicament": "Torasémide",
    "classe_pharmacologique": "Diurétique de l'anse",
    "posologie_adulte": "HTA : 2,5–5 mg/j ; IC : 5–20 mg/j PO ou IV",
    "posologie_sujet_age": "Même dose. Biodisponibilité orale meilleure que furosémide (80–100%).",
    "notes_cliniques": "Biodisponibilité orale supérieure au furosémide",
    "source": "RCP Torem ; ESC HF 2021"
  },
  {
    "medicament": "Bénazépril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 10 mg/j PO → 20–40 mg/j",
    "posologie_sujet_age": "Débuter à 5 mg/j. Surveillance créatinine/K+. Risque hypotension 1ère dose.",
    "notes_cliniques": "Ajustement si DFG<30",
    "source": "RCP Cibacen ; ESC HTA 2023"
  },
  {
    "medicament": "Captopril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 25–50 mg x2–3/j ; IC : 6,25 mg (test) → 50 mg x3/j ; post-IDM : 6,25→50 mg x3/j",
    "posologie_sujet_age": "Débuter à 6,25 mg. Surveillance K+/créatinine. Demi-vie courte = adaptation plus facile.",
    "notes_cliniques": "Seul IEC avec risque neutropénie (NFS si connectivite/IRC)",
    "source": "RCP Lopril ; ESC 2023"
  },
  {
    "medicament": "Cilazapril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 1–2,5 mg/j PO → 5 mg/j",
    "posologie_sujet_age": "Débuter à 0,5–1 mg/j. Prudence hypotension.",
    "notes_cliniques": "Ajustement si DFG<10",
    "source": "RCP Justor ; ESC HTA 2023"
  },
  {
    "medicament": "Énalapril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 5–20 mg/j PO (1–2 prises) ; IC : 2,5 mg x2/j → 10–20 mg x2/j",
    "posologie_sujet_age": "Débuter à 2,5 mg/j. Surveillance K+/créatinine. Hypotension 1ère dose.",
    "notes_cliniques": "Médicament de référence de la classe",
    "source": "RCP Renitec ; ESC HTA/HF 2023"
  },
  {
    "medicament": "Fosinopril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 10 mg/j PO → 40 mg/j",
    "posologie_sujet_age": "Pas d'ajustement officiel. Double élimination rénale/hépatique = avantage IRC.",
    "notes_cliniques": "Double élimination → peu d'ajustement en IRC",
    "source": "RCP Fozitec ; ESC HTA 2023"
  },
  {
    "medicament": "Lisinopril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 10 mg/j PO → 40 mg/j ; IC : 2,5–5 mg/j → 30–35 mg/j",
    "posologie_sujet_age": "Débuter à 2,5–5 mg/j. Ajustement obligatoire si DFG diminué (élimination rénale exclusive).",
    "notes_cliniques": "Élimination rénale exclusive → ajustement strict IRC",
    "source": "RCP Zestril ; ESC HTA/HF 2023"
  },
  {
    "medicament": "Moexipril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 7,5 mg/j PO → 15–30 mg/j",
    "posologie_sujet_age": "Débuter à 3,75 mg/j. Prudence hypotension.",
    "notes_cliniques": "Prise 1h avant repas",
    "source": "RCP Fempress ; ESC HTA 2023"
  },
  {
    "medicament": "Périndopril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 5 mg/j PO → 10 mg/j ; IC : 2 mg/j → 4–8 mg/j",
    "posologie_sujet_age": "Débuter à 2 mg/j. Ajustement si DFG<30. Surveillance K+/créatinine.",
    "notes_cliniques": "Prise le matin avant repas",
    "source": "RCP Coversyl ; ESC HTA/HF 2023"
  },
  {
    "medicament": "Quinapril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 10 mg/j PO → 40 mg/j",
    "posologie_sujet_age": "Débuter à 5 mg/j. Prudence hypotension/hyperkaliémie.",
    "notes_cliniques": "Ajustement si DFG<60",
    "source": "RCP Acuitel ; ESC HTA 2023"
  },
  {
    "medicament": "Ramipril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 2,5 mg/j PO → 10 mg/j ; IC post-IDM : 1,25 mg x2/j → 5 mg x2/j ; néphroprotection : 2,5–10 mg/j",
    "posologie_sujet_age": "Débuter à 1,25 mg/j. Surveillance K+/créatinine. Risque hypotension.",
    "notes_cliniques": "Molécule la plus étudiée en cardioprotection (HOPE)",
    "source": "RCP Triatec ; ESC HTA/HF 2023"
  },
  {
    "medicament": "Trandolapril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 0,5–2 mg/j PO → 4 mg/j",
    "posologie_sujet_age": "Débuter à 0,5 mg/j. Prudence hypotension.",
    "notes_cliniques": "Longue demi-vie → 1 prise/j",
    "source": "RCP Odrik ; ESC HTA 2023"
  },
  {
    "medicament": "Zofénopril",
    "classe_pharmacologique": "IEC",
    "posologie_adulte": "HTA : 30 mg/j PO → 60 mg/j ; post-IDM : 7,5 mg x2/j → 30 mg x2/j",
    "posologie_sujet_age": "Débuter à dose minimale. Surveillance K+/créatinine.",
    "notes_cliniques": "Propriétés antioxydantes spécifiques",
    "source": "RCP Zofenil ; ESC HTA 2023"
  },
  {
    "medicament": "Candésartan",
    "classe_pharmacologique": "ARA2",
    "posologie_adulte": "HTA : 8 mg/j PO → 32 mg/j ; IC : 4 mg/j → 32 mg/j",
    "posologie_sujet_age": "Débuter à 4 mg/j. Surveillance K+/créatinine.",
    "notes_cliniques": "Double élimination → peu d'ajustement IRC modérée",
    "source": "RCP Atacand ; ESC HTA/HF 2023"
  },
  {
    "medicament": "Éprosartan",
    "classe_pharmacologique": "ARA2",
    "posologie_adulte": "HTA : 600 mg/j PO (1 ou 2 prises)",
    "posologie_sujet_age": "Pas d'ajustement à l'âge. Prudence hypotension.",
    "notes_cliniques": "Faible volume de distribution",
    "source": "RCP Teveten ; ESC HTA 2023"
  },
  {
    "medicament": "Irbésartan",
    "classe_pharmacologique": "ARA2",
    "posologie_adulte": "HTA : 150 mg/j PO → 300 mg/j ; Néphropathie DT2 : 300 mg/j",
    "posologie_sujet_age": "Débuter à 75 mg/j si hémodialyse. Pas d'ajustement officiel.",
    "notes_cliniques": "CI grossesse",
    "source": "RCP Aprovel ; ESC HTA 2023"
  },
  {
    "medicament": "Losartan",
    "classe_pharmacologique": "ARA2",
    "posologie_adulte": "HTA : 50 mg/j PO → 100 mg/j ; Néphropathie DT2 : 50–100 mg/j",
    "posologie_sujet_age": "Débuter à 25 mg/j. Effet uricosurique bénéfique (goutte).",
    "notes_cliniques": "Seul ARA2 avec effet uricosurique",
    "source": "RCP Cozaar ; ESC HTA 2023"
  },
  {
    "medicament": "Olmésartan",
    "classe_pharmacologique": "ARA2",
    "posologie_adulte": "HTA : 20 mg/j PO → 40 mg/j",
    "posologie_sujet_age": "Pas d'ajustement à l'âge. Surveillance entéropathie (diarrhée chronique).",
    "notes_cliniques": "Risque entéropathie sprue-like",
    "source": "RCP Olmetec ; ESC HTA 2023"
  },
  {
    "medicament": "Telmisartan",
    "classe_pharmacologique": "ARA2",
    "posologie_adulte": "HTA : 40 mg/j PO → 80 mg/j",
    "posologie_sujet_age": "Pas d'ajustement à l'âge. Prudence insuffisance hépatique.",
    "notes_cliniques": "Longue demi-vie (24h). Élimination biliaire exclusive.",
    "source": "RCP Micardis ; ESC HTA 2023"
  },
  {
    "medicament": "Valsartan",
    "classe_pharmacologique": "ARA2",
    "posologie_adulte": "HTA : 80–160 mg/j PO → 320 mg/j ; IC : 40 mg x2/j → 160 mg x2/j",
    "posologie_sujet_age": "Débuter à 40 mg/j. Surveillance K+/créatinine.",
    "notes_cliniques": "Référence IC avec FE préservée",
    "source": "RCP Nisis ; ESC HTA/HF 2023"
  },
  {
    "medicament": "Acébutolol",
    "classe_pharmacologique": "Bêta-bloquant cardiosélectif (ASI+)",
    "posologie_adulte": "HTA : 400–800 mg/j PO (1–2 prises) ; Arythmie : 400–1200 mg/j",
    "posologie_sujet_age": "Débuter à 200 mg/j. Surveillance FC/TA. Prudence insuffisance rénale.",
    "notes_cliniques": "Activité sympathomimétique intrinsèque",
    "source": "RCP Sectral ; ESC HTA 2023"
  },
  {
    "medicament": "Aténolol",
    "classe_pharmacologique": "Bêta-bloquant cardiosélectif",
    "posologie_adulte": "HTA/angor : 50–100 mg/j PO",
    "posologie_sujet_age": "Débuter à 25 mg/j. Élimination rénale → ajustement si DFG<35.",
    "notes_cliniques": "Élimination rénale exclusive → ajustement IRC obligatoire",
    "source": "RCP Ténormine ; ESC HTA 2023"
  },
  {
    "medicament": "Bétaxolol",
    "classe_pharmacologique": "Bêta-bloquant cardiosélectif",
    "posologie_adulte": "HTA : 20 mg/j PO (débuter à 10 mg/j) ; Collyre : 1 gtte x2/j",
    "posologie_sujet_age": "PO : débuter à 10 mg/j. Collyre : même posologie, surveiller FC (absorption systémique).",
    "notes_cliniques": "Usage systémique et ophtalmologique",
    "source": "RCP Kerlone/Betoptic ; ESC HTA 2023"
  },
  {
    "medicament": "Bisoprolol",
    "classe_pharmacologique": "Bêta-bloquant cardiosélectif",
    "posologie_adulte": "HTA/angor : 5–10 mg/j PO ; IC : 1,25 mg/j → 10 mg/j (titration sur 3 mois)",
    "posologie_sujet_age": "IC : débuter à 1,25 mg/j. Titration très lente (toutes les 2 sem). HTA : débuter à 2,5 mg/j.",
    "notes_cliniques": "Titration IC : 1,25→2,5→3,75→5→7,5→10 mg/j",
    "source": "RCP Cardensiel ; ESC HF 2021 ; ESC HTA 2023"
  },
  {
    "medicament": "Cartéolol",
    "classe_pharmacologique": "Bêta-bloquant non sélectif (ASI+)",
    "posologie_adulte": "HTA : 10–20 mg/j PO ; Collyre : 1 gtte x2/j",
    "posologie_sujet_age": "PO : débuter à 5 mg/j. Collyre : même posologie.",
    "notes_cliniques": "Usage systémique et ophtalmologique",
    "source": "RCP Mikelan/Carteol ; ESC HTA 2023"
  },
  {
    "medicament": "Carvédilol",
    "classe_pharmacologique": "Bêta-bloquant non sélectif + alpha-bloquant",
    "posologie_adulte": "IC : 3,125 mg x2/j → 25 mg x2/j (50 mg x2/j si >85 kg) ; HTA : 12,5–25 mg x2/j",
    "posologie_sujet_age": "IC : débuter à 3,125 mg x2/j. Titration très lente. Risque hypotension orthostatique.",
    "notes_cliniques": "Titration IC : 3,125→6,25→12,5→25 mg x2/j toutes les 2 sem",
    "source": "RCP Kredex ; ESC HF 2021"
  },
  {
    "medicament": "Céliprolol",
    "classe_pharmacologique": "Bêta-bloquant cardiosélectif (ASI+)",
    "posologie_adulte": "HTA : 200 mg/j PO → 400 mg/j (à jeun)",
    "posologie_sujet_age": "Débuter à 100–200 mg/j. Même prudence que classe.",
    "notes_cliniques": "À prendre à jeun (chélation par calcium alimentaire)",
    "source": "RCP Célectol ; ESC HTA 2023"
  },
  {
    "medicament": "Esmolol",
    "classe_pharmacologique": "Bêta-bloquant ultra-court d'action IV",
    "posologie_adulte": "IV : charge 500 µg/kg/min sur 1 min, puis 50–200 µg/kg/min",
    "posologie_sujet_age": "Même schéma. Surveillance FC/TA continue. Réduction dose si hypotension.",
    "notes_cliniques": "Usage exclusivement hospitalier (t1/2 = 9 min)",
    "source": "RCP Brevibloc"
  },
  {
    "medicament": "Labétalol",
    "classe_pharmacologique": "Bêta-bloquant non sélectif + alpha-bloquant",
    "posologie_adulte": "HTA : 100 mg x2/j PO → 400 mg x2/j ; IV : 50–200 mg bolus ou 2 mg/min",
    "posologie_sujet_age": "Débuter à 100 mg/j. Surveillance hépatique. Prudence hypotension orthostatique.",
    "notes_cliniques": "Usage HTA gravidique. Risque hépatotoxicité.",
    "source": "RCP Trandate ; ESC HTA 2023"
  },
  {
    "medicament": "Métoprolol",
    "classe_pharmacologique": "Bêta-bloquant cardiosélectif",
    "posologie_adulte": "HTA/angor : 50–200 mg/j PO (1–2 prises) ; IC (LP) : 12,5–25 mg/j → 200 mg/j",
    "posologie_sujet_age": "IC : débuter à 12,5 mg/j (LP). HTA : débuter à 25–50 mg/j. Métabolisme hépatique = pas d'ajustement rénal.",
    "notes_cliniques": "Forme LP préférable en IC (MERIT-HF). CYP2D6.",
    "source": "RCP Lopressor/Seloken ; ESC HF 2021"
  },
  {
    "medicament": "Nadolol",
    "classe_pharmacologique": "Bêta-bloquant non sélectif",
    "posologie_adulte": "HTA : 40–80 mg/j PO → 240 mg/j ; Arythmie : 80–240 mg/j",
    "posologie_sujet_age": "Débuter à 20–40 mg/j. Élimination rénale → ajustement IRC obligatoire.",
    "notes_cliniques": "Longue demi-vie (20h) ; élimination rénale exclusive",
    "source": "RCP Corgard ; ESC HTA 2023"
  },
  {
    "medicament": "Nébivolol",
    "classe_pharmacologique": "Bêta-bloquant cardiosélectif + libération NO",
    "posologie_adulte": "HTA : 5 mg/j PO ; IC ≥70 ans : 1,25 mg/j → 10 mg/j",
    "posologie_sujet_age": "IC ≥70 ans : débuter à 1,25 mg/j (étude SENIORS). HTA : 2,5 mg/j. CI si insuffisance hépatique.",
    "notes_cliniques": "Seul BB indiqué en IC chez ≥70 ans (SENIORS trial)",
    "source": "RCP Temerit ; ESC HF 2021 (SENIORS)"
  },
  {
    "medicament": "Pindolol",
    "classe_pharmacologique": "Bêta-bloquant non sélectif (ASI++)",
    "posologie_adulte": "HTA : 10–30 mg/j PO (2–3 prises)",
    "posologie_sujet_age": "Débuter à 5 mg/j. Forte ASI → moins de bradycardie.",
    "notes_cliniques": "Forte ASI → moins de bradycardie",
    "source": "RCP Visken ; ESC HTA 2023"
  },
  {
    "medicament": "Propranolol",
    "classe_pharmacologique": "Bêta-bloquant non sélectif",
    "posologie_adulte": "HTA : 80–160 mg/j PO (2–3 prises) ; Tachyarythmies : 40–240 mg/j ; Migraine prophylaxie : 80–240 mg/j",
    "posologie_sujet_age": "Débuter à 40 mg/j. Biodisponibilité augmentée (first-pass réduit).",
    "notes_cliniques": "Lipophile → effets centraux. Hypoglycémie masquée (DT2).",
    "source": "RCP Avlocardyl ; ESC HTA 2023"
  },
  {
    "medicament": "Sotalol",
    "classe_pharmacologique": "Bêta-bloquant non sélectif + classe III",
    "posologie_adulte": "80–160 mg x2/j PO ; max 320–640 mg/j (ajustement selon DFG et QTc)",
    "posologie_sujet_age": "Débuter à 40–80 mg x2/j. Élimination rénale → ajustement obligatoire si DFG<60. Risque QTc ↑.",
    "notes_cliniques": "Initiation hospitalière recommandée. CI si QTc>450ms.",
    "source": "RCP Sotalex ; ESC arythmie 2020"
  },
  {
    "medicament": "Amlodipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP",
    "posologie_adulte": "HTA/angor : 5 mg/j PO → 10 mg/j",
    "posologie_sujet_age": "Même dose. Prudence insuffisance hépatique sévère.",
    "notes_cliniques": "Demi-vie très longue (35–50h) = 1 prise/j",
    "source": "RCP Amlor ; ESC HTA 2023"
  },
  {
    "medicament": "Clévidipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP IV",
    "posologie_adulte": "IV : débuter 1–2 mg/h, titrer toutes les 2 min (max 32 mg/h)",
    "posologie_sujet_age": "Même schéma. Surveillance TA continue.",
    "notes_cliniques": "Usage exclusivement hospitalier. Émulsion lipidique IV.",
    "source": "RCP Cleviprex"
  },
  {
    "medicament": "Diltiazem",
    "classe_pharmacologique": "Inhibiteur calcique benzothiazépine",
    "posologie_adulte": "HTA/angor : 120–360 mg/j PO (LP) ; Arythmies : 60 mg x3/j ou LP 120–180 mg x2 ; IV : 0,25 mg/kg bolus + 5–15 mg/h",
    "posologie_sujet_age": "Débuter à 120 mg/j LP. Surveillance FC/ECG. Prudence IH/IR.",
    "notes_cliniques": "Inhibiteur modéré CYP3A4. Nombreuses interactions.",
    "source": "RCP Tildiem ; ESC 2023"
  },
  {
    "medicament": "Félodipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP",
    "posologie_adulte": "HTA : 5 mg/j PO → 10 mg/j (LP)",
    "posologie_sujet_age": "Débuter à 2,5 mg/j. Biodisponibilité augmentée chez SA.",
    "notes_cliniques": "Interaction jus de pamplemousse",
    "source": "RCP Flodil ; ESC HTA 2023"
  },
  {
    "medicament": "Isradipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP",
    "posologie_adulte": "HTA : 2,5 mg x2/j PO → 5 mg x2/j",
    "posologie_sujet_age": "Débuter à 1,25–2,5 mg x2/j. Biodisponibilité augmentée.",
    "notes_cliniques": "Moins utilisé actuellement",
    "source": "RCP Icaz ; ESC HTA 2023"
  },
  {
    "medicament": "Lercanidipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP",
    "posologie_adulte": "HTA : 10 mg/j PO → 20 mg/j",
    "posologie_sujet_age": "Même dose. CI si DFG<10.",
    "notes_cliniques": "Prise 15 min avant repas. Moins d'œdèmes.",
    "source": "RCP Zanidip ; ESC HTA 2023"
  },
  {
    "medicament": "Manidipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP",
    "posologie_adulte": "HTA : 10 mg/j PO → 20 mg/j",
    "posologie_sujet_age": "Débuter à 10 mg/j. Prudence IH sévère.",
    "notes_cliniques": "Moins d'œdèmes des membres inférieurs",
    "source": "RCP Iperten ; ESC HTA 2023"
  },
  {
    "medicament": "Nicardipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP",
    "posologie_adulte": "HTA : 20–40 mg x3/j PO ou LP 40–80 mg x2/j ; IV : 3–15 mg/h",
    "posologie_sujet_age": "PO : débuter à 20 mg x3/j. Biodisponibilité augmentée.",
    "notes_cliniques": "Usage IV en urgences hypertensives",
    "source": "RCP Loxen ; ESC HTA 2023"
  },
  {
    "medicament": "Nifédipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP",
    "posologie_adulte": "HTA/angor : 30–60 mg/j PO (LP) ; Raynaud : 10–20 mg x3/j (IR)",
    "posologie_sujet_age": "Même dose (LP uniquement). Formes IR CI en HTA.",
    "notes_cliniques": "Formes IR CI en HTA",
    "source": "RCP Adalate ; ESC HTA 2023"
  },
  {
    "medicament": "Nimodipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP",
    "posologie_adulte": "Vasospasme HSA : 60 mg/4h PO x21 j ou 2 mg/h IV",
    "posologie_sujet_age": "Même schéma. Surveillance TA. Prudence IH (biodisponibilité augmentée).",
    "notes_cliniques": "Indication spécifique : vasospasme après HSA",
    "source": "RCP Nimotop"
  },
  {
    "medicament": "Nitrendipine",
    "classe_pharmacologique": "Inhibiteur calcique DHP",
    "posologie_adulte": "HTA : 10 mg/j PO → 20 mg x2/j",
    "posologie_sujet_age": "Débuter à 10 mg/j. Biodisponibilité augmentée (étude SYST-EUR SA spécifique).",
    "notes_cliniques": "Étude SYST-EUR (SA isolée systolique)",
    "source": "RCP Baypress ; ESC HTA 2023"
  },
  {
    "medicament": "Vérapamil",
    "classe_pharmacologique": "Inhibiteur calcique phénylalkylamine",
    "posologie_adulte": "HTA/angor : 120–240 mg/j PO (LP) ou 80 mg x3/j ; Arythmies : 120–480 mg/j ; IV : 5–10 mg bolus",
    "posologie_sujet_age": "Débuter à 120 mg/j. Constipation fréquente et mal tolérée. Biodisponibilité augmentée. Risque BAV ↑.",
    "notes_cliniques": "Inhibiteur modéré CYP3A4 + P-gp. Nombreuses interactions.",
    "source": "RCP Isoptine ; ESC 2023"
  },
  {
    "medicament": "Apixaban",
    "classe_pharmacologique": "AOD anti-Xa",
    "posologie_adulte": "FA : 5 mg x2/j PO ; MTEV : 10 mg x2/j (7 j) → 5 mg x2/j ; Prévention MTEV : 2,5 mg x2/j",
    "posologie_sujet_age": "FA : 2,5 mg x2/j si ≥2 critères : âge≥80 / poids≤60 kg / créatinine≥133 µmol/L.",
    "notes_cliniques": "Réduction FA : 2 critères sur 3 (âge/poids/créatinine)",
    "source": "RCP Eliquis ; HAS 2023 ; ESC FA 2020"
  },
  {
    "medicament": "Dabigatran",
    "classe_pharmacologique": "AOD anti-IIa",
    "posologie_adulte": "FA : 150 mg x2/j PO ; MTEV : 150 mg x2/j (après 5–10 j héparine)",
    "posologie_sujet_age": "FA : 110 mg x2/j si âge≥80 ans, verapamil associé ou haut risque hémorragique. CI si DFG<30.",
    "notes_cliniques": "Élimination rénale exclusive. Ajustement DFG obligatoire.",
    "source": "RCP Pradaxa ; HAS 2023 ; ESC FA 2020"
  },
  {
    "medicament": "Édoxaban",
    "classe_pharmacologique": "AOD anti-Xa",
    "posologie_adulte": "FA/MTEV : 60 mg/j PO (après 5–10 j héparine pour MTEV)",
    "posologie_sujet_age": "30 mg/j si DFG 15–50, poids≤60 kg ou P-gp inhibiteurs forts. Pas d'ajustement à l'âge seul.",
    "notes_cliniques": "Réduction à 30 mg/j si DFG 15–50 ou poids ≤60 kg",
    "source": "RCP Savaysa ; HAS 2023 ; ESC FA 2020"
  },
  {
    "medicament": "Rivaroxaban",
    "classe_pharmacologique": "AOD anti-Xa",
    "posologie_adulte": "FA : 20 mg/j PO au dîner ; MTEV : 15 mg x2/j (3 sem) → 20 mg/j ; Prévention MTEV : 10 mg/j",
    "posologie_sujet_age": "FA : 15 mg/j si DFG 15–49. Pas d'ajustement à l'âge seul. Prudence hémorragique.",
    "notes_cliniques": "À prendre au cours du repas (biodisponibilité ++)",
    "source": "RCP Xarelto ; HAS 2023 ; ESC FA 2020"
  },
  {
    "medicament": "Acénocoumarol",
    "classe_pharmacologique": "AVK",
    "posologie_adulte": "Dose individuelle selon INR (objectif 2–3 ou 2,5–3,5) ; initiale ~2–4 mg/j",
    "posologie_sujet_age": "Débuter à 1–2 mg/j. INR instable fréquent. Risque chute/hémorragie ↑.",
    "notes_cliniques": "Demi-vie courte (8–11h). Moins stable que warfarine.",
    "source": "RCP Sintrom ; HAS 2008 AVK"
  },
  {
    "medicament": "Fluindione",
    "classe_pharmacologique": "AVK",
    "posologie_adulte": "Dose individuelle selon INR (objectif 2–3) ; initiale ~20 mg/j",
    "posologie_sujet_age": "Débuter à dose réduite. Risque allergique (indanedione).",
    "notes_cliniques": "Seul indanedione disponible en France",
    "source": "RCP Previscan ; HAS 2008 AVK"
  },
  {
    "medicament": "Warfarine",
    "classe_pharmacologique": "AVK",
    "posologie_adulte": "Dose individuelle selon INR (objectif 2–3 ou 2,5–3,5) ; initiale ~5 mg/j",
    "posologie_sujet_age": "Débuter à 2,5 mg/j. Sensibilité accrue (CYP2C9). Risque hémorragique ↑. INR rapproché.",
    "notes_cliniques": "Référence internationale. Antidote : vitamine K.",
    "source": "RCP Coumadine ; HAS 2008 AVK ; ESC FA 2020"
  },
  {
    "medicament": "Acide acétylsalicylique",
    "classe_pharmacologique": "Antiagrégant / AINS (selon dose)",
    "posologie_adulte": "Antiagrégant : 75–100 mg/j PO ; Anti-inflammatoire : 500 mg–4 g/j ; Antalgique : 500 mg–1 g/prise",
    "posologie_sujet_age": "Antiagrégant : même dose 75–100 mg/j. IPP souvent associé (>70 ans). Prudence IR.",
    "notes_cliniques": "IPP recommandé si >70 ans ou ATCD digestifs",
    "source": "RCP Cardégic ; ESC SCA 2023"
  },
  {
    "medicament": "Clopidogrel",
    "classe_pharmacologique": "Antiagrégant (thienopyridine)",
    "posologie_adulte": "75 mg/j PO (entretien) ; charge : 300–600 mg (SCA)",
    "posologie_sujet_age": "Même dose. Risque hémorragique ↑. Prudence si métaboliseur lent CYP2C19.",
    "notes_cliniques": "Prodrogue CYP2C19. Interaction oméprazole/ésoméprazole à éviter.",
    "source": "RCP Plavix ; ESC SCA 2023"
  },
  {
    "medicament": "Prasugrel",
    "classe_pharmacologique": "Antiagrégant (thienopyridine)",
    "posologie_adulte": "Charge : 60 mg PO → entretien : 10 mg/j",
    "posologie_sujet_age": "≥75 ans ou <60 kg : 5 mg/j. Déconseillé si >75 ans sauf diabète/récidive. CI si ATCD AVC/AIT.",
    "notes_cliniques": "Réduction à 5 mg/j si ≥75 ans ou <60 kg",
    "source": "RCP Efient ; ESC SCA 2023"
  },
  {
    "medicament": "Ticagrélor",
    "classe_pharmacologique": "Antiagrégant (CPTP)",
    "posologie_adulte": "Charge : 180 mg PO → entretien : 90 mg x2/j (SCA) ou 60 mg x2/j (prévention secondaire)",
    "posologie_sujet_age": "Même dose. Dyspnée plus fréquente. Prudence DFG<30.",
    "notes_cliniques": "Dyspnée non liée à bronchospasme. Pas de prodrogue.",
    "source": "RCP Brilique ; ESC SCA 2023"
  },
  {
    "medicament": "Ticlopidine",
    "classe_pharmacologique": "Antiagrégant (thienopyridine 1ère génération)",
    "posologie_adulte": "250 mg x2/j PO (avec repas)",
    "posologie_sujet_age": "Même dose. Risque hématologique ↑. Préférer clopidogrel/ticagrélor.",
    "notes_cliniques": "NFS bimensuelle obligatoire 3 premiers mois. Quasi-abandonné (PTT, agranulocytose).",
    "source": "RCP Ticlid ; ANSM"
  },
  {
    "medicament": "Atorvastatine",
    "classe_pharmacologique": "Statine",
    "posologie_adulte": "10–80 mg/j PO (1 prise/j, n'importe quand)",
    "posologie_sujet_age": "Même dose. Débuter à 10 mg/j. Prudence myopathie (CPK si myalgies).",
    "notes_cliniques": "Dose élevée (40–80 mg) en prévention CV haute. Demi-vie 14h.",
    "source": "RCP Tahor ; ESC prévention 2021"
  },
  {
    "medicament": "Fluvastatine",
    "classe_pharmacologique": "Statine",
    "posologie_adulte": "20–80 mg/j PO (LP 80 mg/j ou IR 20–40 mg x2/j)",
    "posologie_sujet_age": "Même dose. Moins d'interactions CYP3A4 (métabolisme CYP2C9).",
    "notes_cliniques": "Métabolisme CYP2C9 → moins d'interactions",
    "source": "RCP Lescol ; ESC prévention 2021"
  },
  {
    "medicament": "Pravastatine",
    "classe_pharmacologique": "Statine",
    "posologie_adulte": "10–40 mg/j PO (le soir)",
    "posologie_sujet_age": "Même dose. Bien tolérée. Non métabolisée CYP → peu d'interactions.",
    "notes_cliniques": "Statine de choix si interactions CYP (ciclosporine, ARV)",
    "source": "RCP Elisor ; ESC prévention 2021"
  },
  {
    "medicament": "Rosuvastatine",
    "classe_pharmacologique": "Statine",
    "posologie_adulte": "5–40 mg/j PO (1 prise/j)",
    "posologie_sujet_age": "Débuter à 5 mg/j. Max 20 mg/j recommandé. Prudence IRC.",
    "notes_cliniques": "Statine la plus puissante. Départ 5 mg/j chez SA ou IRC.",
    "source": "RCP Crestor ; ESC prévention 2021"
  },
  {
    "medicament": "Simvastatine",
    "classe_pharmacologique": "Statine",
    "posologie_adulte": "10–40 mg/j PO (le soir) ; 80 mg/j déconseillé",
    "posologie_sujet_age": "Même dose. 80 mg/j CI si nouveau traitement. Nombreuses interactions CYP3A4.",
    "notes_cliniques": "80 mg/j CI si nouveau patient. Max recommandé 40 mg/j en pratique.",
    "source": "RCP Zocor ; ESC prévention 2021"
  },
  {
    "medicament": "Citalopram",
    "classe_pharmacologique": "ISRS",
    "posologie_adulte": "20 mg/j PO → 40 mg/j (max 40 mg/j)",
    "posologie_sujet_age": "Max 20 mg/j (ANSM 2011 — allongement QTc dose-dépendant). Débuter à 10 mg/j.",
    "notes_cliniques": "Max 20 mg/j chez SA. Risque hyponatrémie.",
    "source": "RCP Seropram ; ANSM 2011 ; HAS 2017"
  },
  {
    "medicament": "Duloxétine",
    "classe_pharmacologique": "IRSN",
    "posologie_adulte": "Dépression : 60 mg/j PO ; Douleurs neuropathiques : 60 mg/j ; Incontinence : 40 mg x2/j",
    "posologie_sujet_age": "Débuter à 30 mg/j. Même dose max (120 mg/j). Prudence HTA.",
    "notes_cliniques": "CI si DFG<30",
    "source": "RCP Cymbalta ; HAS 2017"
  },
  {
    "medicament": "Escitalopram",
    "classe_pharmacologique": "ISRS",
    "posologie_adulte": "10 mg/j PO → 20 mg/j (max 20 mg/j)",
    "posologie_sujet_age": "Max 10 mg/j (ANSM 2011 — risque QTc). Débuter à 5 mg/j.",
    "notes_cliniques": "Max 10 mg/j chez SA. Isomère actif du citalopram.",
    "source": "RCP Seroplex ; ANSM 2011 ; HAS 2017"
  },
  {
    "medicament": "Fluoxétine",
    "classe_pharmacologique": "ISRS",
    "posologie_adulte": "Dépression : 20 mg/j PO → 60 mg/j ; TOC/boulimie : 60 mg/j",
    "posologie_sujet_age": "Débuter à 10 mg/j. Longue demi-vie (norfluoxétine : 1–4 sem). Même dose max.",
    "notes_cliniques": "Demi-vie très longue. Inhibiteur puissant CYP2D6.",
    "source": "RCP Prozac ; HAS 2017"
  },
  {
    "medicament": "Fluvoxamine",
    "classe_pharmacologique": "ISRS",
    "posologie_adulte": "Dépression : 50 mg/j PO → 300 mg/j ; TOC : 100–300 mg/j",
    "posologie_sujet_age": "Débuter à 50 mg/j. Même dose max. Prudence interactions (inhibiteur puissant CYP1A2/2C19).",
    "notes_cliniques": "Inhibiteur puissant CYP1A2/2C19",
    "source": "RCP Floxyfral ; HAS 2017"
  },
  {
    "medicament": "Milnacipran",
    "classe_pharmacologique": "IRSN",
    "posologie_adulte": "25 mg x2/j PO → 50 mg x2/j (max 100 mg/j)",
    "posologie_sujet_age": "Débuter à 25 mg/j. Élimination rénale → ajustement si DFG<30.",
    "notes_cliniques": "Indication principale : dépression",
    "source": "RCP Ixel ; HAS 2017"
  },
  {
    "medicament": "Paroxétine",
    "classe_pharmacologique": "ISRS",
    "posologie_adulte": "Dépression : 20 mg/j PO → 50 mg/j ; TOC/panique : 40–60 mg/j",
    "posologie_sujet_age": "Débuter à 10 mg/j. Max 40 mg/j. Effets anticholinergiques ↑. Prudence constipation/rétention.",
    "notes_cliniques": "Effets anticholinergiques marqués. Inhibiteur puissant CYP2D6.",
    "source": "RCP Deroxat ; HAS 2017"
  },
  {
    "medicament": "Sertraline",
    "classe_pharmacologique": "ISRS",
    "posologie_adulte": "Dépression : 50 mg/j PO → 200 mg/j",
    "posologie_sujet_age": "Débuter à 25 mg/j. ISRS de référence chez SA (profil favorable).",
    "notes_cliniques": "ISRS de choix en 1ère intention chez SA",
    "source": "RCP Zoloft ; HAS 2017"
  },
  {
    "medicament": "Venlafaxine",
    "classe_pharmacologique": "IRSN",
    "posologie_adulte": "Dépression : 75 mg/j PO → 225 mg/j (LP) ; TAG : 75–225 mg/j",
    "posologie_sujet_age": "Débuter à 37,5 mg/j. HTA dose-dépendante → surveillance TA. Titration lente.",
    "notes_cliniques": "HTA dose-dépendante (surtout >150 mg/j). Syndrome de sevrage marqué.",
    "source": "RCP Effexor ; HAS 2017"
  },
  {
    "medicament": "Alprazolam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "0,25–0,5 mg x3/j PO ; max 4 mg/j",
    "posologie_sujet_age": "Max 2 mg/j. Débuter à 0,25 mg x1–2/j. Risque chutes/sédation/dépendance ↑. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER chez SA. Usage ≤4 sem.",
    "source": "RCP Xanax ; HAS BZD 2022 ; Beers 2023"
  },
  {
    "medicament": "Bromazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "1,5–3 mg x3/j PO ; max 18 mg/j",
    "posologie_sujet_age": "Max 6 mg/j. Demi-vie allongée. Risque chutes/sédation ↑. HAS : réduire de moitié.",
    "notes_cliniques": "Beers 2023 : À ÉVITER. Durée max 4–12 sem.",
    "source": "RCP Lexomil ; HAS BZD 2022 ; Beers 2023"
  },
  {
    "medicament": "Clobazam",
    "classe_pharmacologique": "Benzodiazépine (1,5-BZD)",
    "posologie_adulte": "Anxiété : 10–30 mg/j PO ; Épilepsie : 20–40 mg/j",
    "posologie_sujet_age": "Réduire de moitié. Moins sédatif que 1,4-BZD.",
    "notes_cliniques": "Moins de sédation que autres BZD",
    "source": "RCP Urbanyl ; HAS BZD 2022"
  },
  {
    "medicament": "Clonazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Épilepsie : 0,5 mg → 1–4 mg/j PO ; Anxiété : 1–6 mg/j",
    "posologie_sujet_age": "Débuter à 0,25 mg/j. Titration très lente. Risque chutes/dépendance ↑.",
    "notes_cliniques": "Usage épilepsie principalement. Demi-vie 18–50h.",
    "source": "RCP Rivotril ; HAS BZD 2022"
  },
  {
    "medicament": "Clorazépate",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "5–20 mg/j PO ; jusqu'à 60–90 mg/j (sevrage alcoolique)",
    "posologie_sujet_age": "Réduire de moitié. Prodrogue → nordazépam (longue demi-vie → accumulation ↑↑).",
    "notes_cliniques": "Accumulation chez SA (prodrogue longue demi-vie)",
    "source": "RCP Tranxène ; HAS BZD 2022"
  },
  {
    "medicament": "Clotiazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "5 mg x2–3/j PO ; max 30 mg/j",
    "posologie_sujet_age": "Réduire de moitié (5–10 mg/j). Demi-vie courte (6h) = moins d'accumulation.",
    "notes_cliniques": "Demi-vie courte = moins d'accumulation",
    "source": "RCP Vératran ; HAS BZD 2022"
  },
  {
    "medicament": "Diazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Anxiété : 2–10 mg x2–4/j PO ; Sevrage alcoolique : jusqu'à 80 mg/j",
    "posologie_sujet_age": "Max 5 mg/j. Demi-vie 20–100h (métabolites actifs). Accumulation massive. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER. Risque chutes/fractures ↑↑.",
    "source": "RCP Valium ; HAS BZD 2022 ; Beers 2023"
  },
  {
    "medicament": "Estazolam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Insomnie : 1–2 mg au coucher",
    "posologie_sujet_age": "0,5–1 mg au coucher. Prudence dépression respiratoire/chutes.",
    "notes_cliniques": "Usage hypnotique uniquement",
    "source": "RCP Nuctalon ; HAS BZD 2022"
  },
  {
    "medicament": "Loprazolam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Insomnie : 1–2 mg au coucher",
    "posologie_sujet_age": "1 mg au coucher. Prudence chutes/confusion matinale.",
    "notes_cliniques": "Demi-vie intermédiaire (8h)",
    "source": "RCP Havlane ; HAS BZD 2022"
  },
  {
    "medicament": "Lorazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Anxiété : 1–2,5 mg x2–3/j PO ; max 7,5 mg/j ; IV : 2–4 mg (SE)",
    "posologie_sujet_age": "Max 2 mg/j PO. Glucurono-conjugaison → moins d'accumulation. Préféré si IH.",
    "notes_cliniques": "Glucuronidation → moins d'accumulation. BZD à privilégier chez SA si nécessaire.",
    "source": "RCP Temesta ; HAS BZD 2022"
  },
  {
    "medicament": "Lormétazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Insomnie : 1–2 mg au coucher",
    "posologie_sujet_age": "0,5–1 mg au coucher. Demi-vie intermédiaire.",
    "notes_cliniques": "Demi-vie 10h",
    "source": "RCP Noctamide ; HAS BZD 2022"
  },
  {
    "medicament": "Nitrazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Insomnie : 5–10 mg au coucher",
    "posologie_sujet_age": "2,5–5 mg au coucher. Demi-vie longue (24h) → accumulation. Risque chutes ↑↑.",
    "notes_cliniques": "Demi-vie longue. À éviter chez SA.",
    "source": "RCP Mogadon ; HAS BZD 2022"
  },
  {
    "medicament": "Nordazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Anxiété : 5–15 mg/j PO",
    "posologie_sujet_age": "Réduire de moitié. Demi-vie très longue (50–100h). Accumulation majeure.",
    "notes_cliniques": "Métabolite actif de plusieurs BZD. Demi-vie extrêmement longue.",
    "source": "RCP Nordaz ; HAS BZD 2022"
  },
  {
    "medicament": "Oxazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Anxiété : 10–30 mg x3/j PO ; Sevrage alcoolique : 30–60 mg x3/j",
    "posologie_sujet_age": "10 mg x2–3/j. Glucurono-conjugaison = peu d'accumulation. BZD à privilégier chez SA.",
    "notes_cliniques": "BZD préféré chez SA avec lorazépam (glucuronidation, demi-vie courte 4–15h)",
    "source": "RCP Séresta ; HAS BZD 2022"
  },
  {
    "medicament": "Prazépam",
    "classe_pharmacologique": "Benzodiazépine",
    "posologie_adulte": "Anxiété : 10–30 mg/j PO (1–2 prises)",
    "posologie_sujet_age": "Réduire de moitié. Prodrogue → nordazépam (accumulation).",
    "notes_cliniques": "Prodrogue nordazépam (longue demi-vie)",
    "source": "RCP Lysanxia ; HAS BZD 2022"
  },
  {
    "medicament": "Zolpidem",
    "classe_pharmacologique": "Hypnotique Z (imidazopyridine)",
    "posologie_adulte": "Insomnie : 10 mg au coucher PO",
    "posologie_sujet_age": "5 mg au coucher (ANSM : demi-dose SA et femmes). Risque somnambulisme/chutes/confusion ↑.",
    "notes_cliniques": "Dose SA : 5 mg (ANSM). Durée max 4 sem.",
    "source": "RCP Stilnox ; ANSM ; HAS BZD 2022"
  },
  {
    "medicament": "Zopiclone",
    "classe_pharmacologique": "Hypnotique Z (cyclopyrrolone)",
    "posologie_adulte": "Insomnie : 7,5 mg au coucher PO",
    "posologie_sujet_age": "3,75 mg au coucher. Demi-vie allongée → somnolence résiduelle. Prudence chutes.",
    "notes_cliniques": "Durée max 4 sem",
    "source": "RCP Imovane ; HAS BZD 2022"
  },
  {
    "medicament": "Amisulpride",
    "classe_pharmacologique": "Antipsychotique atypique (benzamide)",
    "posologie_adulte": "Schizophrénie : 400–800 mg/j PO (2 prises) ; max 1200 mg/j ; Symptômes négatifs : 50–300 mg/j",
    "posologie_sujet_age": "Réduire de 50% si DFG<30. Allongement QTc. Prudence prolactine.",
    "notes_cliniques": "Élimination rénale → ajustement IRC obligatoire",
    "source": "RCP Solian ; HAS 2017"
  },
  {
    "medicament": "Aripiprazole",
    "classe_pharmacologique": "Antipsychotique atypique (agoniste partiel D2)",
    "posologie_adulte": "Schizophrénie/bipolaire : 10–15 mg/j PO → 30 mg/j ; Injection retard : 400 mg/mois IM",
    "posologie_sujet_age": "Même dose. Profil favorable SA (moins sédatif, moins d'hypotension).",
    "notes_cliniques": "Agoniste partiel D2 = profil différent. Moins de PRL.",
    "source": "RCP Abilify ; HAS 2017"
  },
  {
    "medicament": "Clozapine",
    "classe_pharmacologique": "Antipsychotique atypique",
    "posologie_adulte": "12,5 mg/j PO → titration → 300–450 mg/j (max 900 mg/j) sur 2–4 sem",
    "posologie_sujet_age": "Débuter à 6,25–12,5 mg/j. Titration très lente. Max 300–450 mg/j. Risques : myocardite, agranulocytose, constipation, sédation. Mortalité ↑ chez déments.",
    "notes_cliniques": "NFS hebdomadaire 18 premières semaines OBLIGATOIRE (REMS ANSM)",
    "source": "RCP Leponex ; ANSM REMS ; HAS 2017"
  },
  {
    "medicament": "Olanzapine",
    "classe_pharmacologique": "Antipsychotique atypique (thiénobenzodiazépine)",
    "posologie_adulte": "Schizophrénie : 5–20 mg/j PO ; Bipolaire : 5–20 mg/j ; Injection retard : 150–300 mg/2 sem IM",
    "posologie_sujet_age": "Débuter à 2,5–5 mg/j. Max 10 mg/j recommandé. CI chez déments (mortalité ↑).",
    "notes_cliniques": "Forte prise de poids. CI chez déments.",
    "source": "RCP Zyprexa ; HAS 2017"
  },
  {
    "medicament": "Palipéridone",
    "classe_pharmacologique": "Antipsychotique atypique (9-OH-rispéridone)",
    "posologie_adulte": "6 mg/j PO → 3–12 mg/j ; Injection retard : 150 mg J1, 100 mg J8 → 75 mg/mois IM",
    "posologie_sujet_age": "Débuter à 3 mg/j PO. Élimination rénale → ajustement si DFG<80.",
    "notes_cliniques": "Élimination rénale exclusive → ajustement strict IRC",
    "source": "RCP Invega ; HAS 2017"
  },
  {
    "medicament": "Quétiapine",
    "classe_pharmacologique": "Antipsychotique atypique (dibenzothiazépine)",
    "posologie_adulte": "Schizophrénie : 50 mg/j → 300–450 mg/j (max 750 mg/j) ; Bipolaire : 50 mg/j → 200–800 mg/j",
    "posologie_sujet_age": "Débuter à 25 mg/j. Titration très lente. Forte sédation/hypotension orthostatique. Risque chutes ↑↑. Déconseillé chez déments.",
    "notes_cliniques": "CI chez déments (mortalité ↑). Sédation marquée.",
    "source": "RCP Xeroquel ; HAS 2017"
  },
  {
    "medicament": "Rispéridone",
    "classe_pharmacologique": "Antipsychotique atypique (benzisoxazole)",
    "posologie_adulte": "Schizophrénie : 1 mg x2/j → 4–8 mg/j PO ; Injection retard : 25–50 mg/2 sem IM",
    "posologie_sujet_age": "Débuter à 0,5 mg x2/j → 1–2 mg x2/j. Max 4 mg/j. Risque AVC/EPS chez déments (AMM retirée).",
    "notes_cliniques": "Précaution majeure : risque AVC chez déments âgés.",
    "source": "RCP Risperdal ; HAS 2017 ; EMA"
  },
  {
    "medicament": "Tiapride",
    "classe_pharmacologique": "Antipsychotique (benzamide)",
    "posologie_adulte": "Dyskinésies/Huntington : 200–400 mg/j PO (3 prises) ; Alcoolisme : 300–600 mg/j ; max 1200 mg/j",
    "posologie_sujet_age": "Réduire de 50% si IRC. Allongement QTc. Débuter à dose minimale.",
    "notes_cliniques": "Élimination rénale → ajustement IRC",
    "source": "RCP Tiapridal ; HAS 2017"
  },
  {
    "medicament": "Carbamazépine",
    "classe_pharmacologique": "Antiépileptique (iminostilbène)",
    "posologie_adulte": "Épilepsie : 400–1200 mg/j PO (2–4 prises ou LP x2) ; Névralgie trigéminale : 600–1200 mg/j",
    "posologie_sujet_age": "Débuter à 100–200 mg/j. Titration lente. Risque : hyponatrémie ↑↑, interactions ↑, confusion. Max 600–800 mg/j souvent.",
    "notes_cliniques": "Inducteur puissant CYP3A4/2C9. Taux plasmatique 4–12 mg/L.",
    "source": "RCP Tégrétol ; HAS 2020"
  },
  {
    "medicament": "Gabapentine",
    "classe_pharmacologique": "Antiépileptique / Antialgique",
    "posologie_adulte": "300 mg/j → 900–3600 mg/j PO (3 prises)",
    "posologie_sujet_age": "Débuter à 100 mg x3/j. Titration très lente. Risque : sédation, chutes, confusion, œdèmes. Ajustement IRC obligatoire.",
    "notes_cliniques": "Ajustement DFG obligatoire. Potentiel d'abus.",
    "source": "RCP Neurontin ; HAS 2020"
  },
  {
    "medicament": "Lacosamide",
    "classe_pharmacologique": "Antiépileptique",
    "posologie_adulte": "100 mg/j PO → 200–400 mg/j (2 prises) ; IV : même posologie",
    "posologie_sujet_age": "Même dose. Prudence si DFG<30 (max 250 mg/j). Surveillance ECG (PR).",
    "notes_cliniques": "Max 250 mg/j si DFG<30. Surveillance BAV.",
    "source": "RCP Vimpat ; HAS 2020"
  },
  {
    "medicament": "Lamotrigine",
    "classe_pharmacologique": "Antiépileptique",
    "posologie_adulte": "Monothérapie : 25 mg/j → 100–200 mg/j (2 prises) ; schéma dépend co-médications",
    "posologie_sujet_age": "Même dose. Pas d'ajustement officiel. Titration lente obligatoire (risque SJS).",
    "notes_cliniques": "Titration très lente selon co-médications. Taux plasmatique 2–14 mg/L.",
    "source": "RCP Lamictal ; HAS 2020"
  },
  {
    "medicament": "Lévétiracétam",
    "classe_pharmacologique": "Antiépileptique",
    "posologie_adulte": "1000–3000 mg/j PO (2 prises) ou IV",
    "posologie_sujet_age": "Débuter à 250–500 mg x2/j. Ajustement DFG obligatoire. Prudence : irritabilité, dépression.",
    "notes_cliniques": "Ajustement DFG : max 1500 mg/j si DFG<80 ; max 1000 mg/j si DFG<50.",
    "source": "RCP Keppra ; HAS 2020"
  },
  {
    "medicament": "Oxcarbazépine",
    "classe_pharmacologique": "Antiépileptique",
    "posologie_adulte": "300 mg x2/j → 600–1200 mg x2/j PO (max 2400 mg/j)",
    "posologie_sujet_age": "Débuter à 150–300 mg/j. Risque hyponatrémie ↑↑ (fréquent SA). Ionogramme rapproché.",
    "notes_cliniques": "Hyponatrémie fréquente (15%). Inducteur modéré CYP3A4.",
    "source": "RCP Trileptal ; HAS 2020"
  },
  {
    "medicament": "Prégabaline",
    "classe_pharmacologique": "Antiépileptique / Antialgique / Anxiolytique",
    "posologie_adulte": "Neuropathie : 75 mg x2/j → 300 mg x2/j ; Épilepsie/TAG : 150–600 mg/j",
    "posologie_sujet_age": "Débuter à 25–50 mg x2/j. Titration lente. Risque : sédation, chutes, œdèmes. Ajustement IRC.",
    "notes_cliniques": "Prescription sécurisée (abus/dépendance). Ajustement DFG obligatoire.",
    "source": "RCP Lyrica ; HAS 2020"
  },
  {
    "medicament": "Topiramate",
    "classe_pharmacologique": "Antiépileptique",
    "posologie_adulte": "Épilepsie : 25 mg/j → 200–400 mg/j (2 prises) ; Migraine prophylaxie : 25→100 mg/j",
    "posologie_sujet_age": "Débuter à 12,5–25 mg/j. Titration très lente. Risque : confusion, troubles cognitifs, anorexie.",
    "notes_cliniques": "Perte de poids fréquente. Risque lithiase rénale.",
    "source": "RCP Epitomax ; HAS 2020"
  },
  {
    "medicament": "Valproate",
    "classe_pharmacologique": "Antiépileptique / Thymorégulateur",
    "posologie_adulte": "Épilepsie : 600–2000 mg/j PO (2–3 prises) ; Bipolaire : 1000–2000 mg/j",
    "posologie_sujet_age": "Débuter à 250 mg/j. Titration lente. Risque : encéphalopathie hyperammoniémique, tremblement, hépatotoxicité.",
    "notes_cliniques": "TÉRATOGÈNE — CI femme en âge de procréer sans contraception (Accord de soins). Taux 50–100 mg/L.",
    "source": "RCP Dépakine ; HAS 2020 ; ANSM"
  },
  {
    "medicament": "Zonisamide",
    "classe_pharmacologique": "Antiépileptique",
    "posologie_adulte": "100–500 mg/j PO (2 prises)",
    "posologie_sujet_age": "Débuter à 50 mg/j. Prudence anorexie/déshydratation. Ajustement IRC si DFG<50.",
    "notes_cliniques": "Perte de poids fréquente. Risque lithiase.",
    "source": "RCP Zonegran ; HAS 2020"
  },
  {
    "medicament": "Paracétamol",
    "classe_pharmacologique": "Antalgique/Antipyrétique palier I",
    "posologie_adulte": "500 mg–1 g/prise, toutes les 4–6h ; max 4 g/j",
    "posologie_sujet_age": "Max 3 g/j si poids<50 kg, dénutrition, alcoolisme. Max 2 g/j si IH.",
    "notes_cliniques": "Antalgique de 1ère intention chez SA. Dose max 3 g/j si poids<50 kg.",
    "source": "RCP Doliprane ; HAS douleur 2022"
  },
  {
    "medicament": "Néfopam",
    "classe_pharmacologique": "Antalgique non opioïde",
    "posologie_adulte": "20 mg x3–6/j PO ou IV ; max 120 mg/j",
    "posologie_sujet_age": "Déconseillé chez SA (anticholinergique : tachycardie, confusion, rétention urinaire). Si nécessaire : 20 mg x2–3/j. Beers 2023.",
    "notes_cliniques": "Effets anticholinergiques. Déconseillé SA.",
    "source": "RCP Acupan ; Beers 2023"
  },
  {
    "medicament": "Codéine",
    "classe_pharmacologique": "Opioïde faible palier II",
    "posologie_adulte": "30–60 mg/4–6h PO ; max 240 mg/j",
    "posologie_sujet_age": "Débuter à 15–30 mg/4–6h. Risque accumulation. Prudence dépression respiratoire/constipation/confusion.",
    "notes_cliniques": "Prodrogue CYP2D6. Ultra-métaboliseurs : toxicité sévère.",
    "source": "RCP Codéine ; HAS douleur 2022"
  },
  {
    "medicament": "Dihydrocodéine",
    "classe_pharmacologique": "Opioïde faible palier II",
    "posologie_adulte": "60 mg/12h PO (LP) ; max 120 mg x2/j",
    "posologie_sujet_age": "Débuter à 60 mg/j. Ajustement DFG. Prudence constipation/sédation.",
    "notes_cliniques": "LP uniquement. Ajustement IRC.",
    "source": "RCP Dicodin ; HAS douleur 2022"
  },
  {
    "medicament": "Poudre d'opium",
    "classe_pharmacologique": "Opioïde faible palier II",
    "posologie_adulte": "15–60 mg/6h PO ; max 200 mg/j",
    "posologie_sujet_age": "Réduire de 25–50%. Prudence constipation/sédation/confusion.",
    "notes_cliniques": "Composition variable (morphine + autres alcaloïdes)",
    "source": "RCP Poudre d'opium ; HAS douleur 2022"
  },
  {
    "medicament": "Tramadol",
    "classe_pharmacologique": "Opioïde faible palier II",
    "posologie_adulte": "50–100 mg/4–6h PO ; max 400 mg/j (300 mg/j LP)",
    "posologie_sujet_age": "Max 300 mg/j. Risque : convulsions, sédation, syndrome sérotoninergique, confusion.",
    "notes_cliniques": "CI si épilepsie non contrôlée. Max 300 mg/j chez SA.",
    "source": "RCP Topalgic ; HAS douleur 2022"
  },
  {
    "medicament": "Buprénorphine",
    "classe_pharmacologique": "Opioïde fort / TSO",
    "posologie_adulte": "Douleur : 35–140 µg/h patch/72h ; TSO : 4–24 mg/j SL (max 32 mg/j)",
    "posologie_sujet_age": "TSO : même dose (ajustement individuel). Patch douleur : débuter à faible dose. Prudence sédation/dépression respiratoire.",
    "notes_cliniques": "Agoniste partiel µ = effet plafond. Patch changé toutes les 72–96h.",
    "source": "RCP Subutex/Transtec ; HAS TSO 2020"
  },
  {
    "medicament": "Fentanyl",
    "classe_pharmacologique": "Opioïde fort palier III",
    "posologie_adulte": "Patch : 12,5–100 µg/h/72h ; IV : 1–3 µg/kg ; Accès douloureux paroxystiques : selon formulation",
    "posologie_sujet_age": "Débuter à faible dose (12,5 µg/h patch). Prudence : hyperthermie, risque sédation/dépression respiratoire ↑.",
    "notes_cliniques": "Patch : changement toutes les 72h. Ne pas chauffer le patch.",
    "source": "RCP Durogésic ; HAS douleur 2022"
  },
  {
    "medicament": "Hydromorphone",
    "classe_pharmacologique": "Opioïde fort palier III",
    "posologie_adulte": "LP : 4 mg → 32 mg/j PO ; IR : 1,3 mg/4h ; ratio conversion morphine/hydromorphone ≈ 7,5:1",
    "posologie_sujet_age": "Débuter à faible dose. Prudence accumulation métabolites actifs. Ajustement IRC.",
    "notes_cliniques": "Puissant (ratio 7,5:1 avec morphine)",
    "source": "RCP Sophidone ; HAS douleur 2022"
  },
  {
    "medicament": "Morphine",
    "classe_pharmacologique": "Opioïde fort palier III (référence)",
    "posologie_adulte": "IR : 5–20 mg/4h PO ou 2,5–10 mg SC/IV ; LP : titration individuelle",
    "posologie_sujet_age": "Débuter à 2,5–5 mg/4–6h. M6G s'accumule en IRC → intervalle allongé (6–8h).",
    "notes_cliniques": "Antidote : naloxone. M6G actif s'accumule en IRC.",
    "source": "RCP Actiskenan/Skenan ; HAS douleur 2022"
  },
  {
    "medicament": "Oxycodone",
    "classe_pharmacologique": "Opioïde fort palier III",
    "posologie_adulte": "IR : 5–10 mg/4h PO ; LP : 10–40 mg x2/j ; ratio morphine/oxycodone = 1,5:1",
    "posologie_sujet_age": "Débuter à 5 mg/12h (LP). Titration lente. Prudence sédation/constipation/confusion.",
    "notes_cliniques": "LP : avaler entier",
    "source": "RCP Oxycontin ; HAS douleur 2022"
  },
  {
    "medicament": "Tapentadol",
    "classe_pharmacologique": "Opioïde fort palier III (agoniste µ + IRSN)",
    "posologie_adulte": "IR : 50–100 mg/4–6h PO (max 600 mg/j) ; LP : 50–250 mg x2/j (max 500 mg/j)",
    "posologie_sujet_age": "Débuter à 50 mg x2/j (LP). Prudence sédation. CI si IH sévère.",
    "notes_cliniques": "CI si DFG<30. Double mécanisme µ + IRSN.",
    "source": "RCP Palexia ; HAS douleur 2022"
  },
  {
    "medicament": "Allopurinol",
    "classe_pharmacologique": "Hypouricémiant (inhibiteur XO)",
    "posologie_adulte": "100–300 mg/j PO → 300–600 mg/j (titration selon uricémie cible)",
    "posologie_sujet_age": "Débuter à 50–100 mg/j. Titration lente. Ajustement strict si DFG<60. Risque DRESS ↑.",
    "notes_cliniques": "Ne jamais débuter en crise (attendre 2–4 sem). Test HLA-B*5801 si Asiatique.",
    "source": "RCP Zyloric ; SFR 2020 ; EULAR 2022"
  },
  {
    "medicament": "Colchicine",
    "classe_pharmacologique": "Anti-inflammatoire antigouteux",
    "posologie_adulte": "Crise : 1 mg PO puis 0,5 mg après 1h (max 2 mg/épisode) ; Prophylaxie : 0,5–1 mg/j",
    "posologie_sujet_age": "Crise : max 1 mg (0,5+0,5 mg). Prophylaxie : 0,5 mg/j. Ajustement si DFG<30. Risque myopathie ↑.",
    "notes_cliniques": "REMS FDA 2009 : abandon des anciens schémas à doses élevées. Interactions CYP3A4/P-gp.",
    "source": "RCP Colchicine Opocalcium ; SFR 2020 ; EULAR 2022"
  },
  {
    "medicament": "Fébuxostat",
    "classe_pharmacologique": "Hypouricémiant (inhibiteur XO)",
    "posologie_adulte": "80 mg/j PO → 120 mg/j si uricémie cible non atteinte",
    "posologie_sujet_age": "Même dose. Pas d'ajustement à l'âge. Prudence IH. Surveillance cardiovasculaire.",
    "notes_cliniques": "Risque CV discuté (CARES). Pas d'ajustement rénal.",
    "source": "RCP Adenuric ; SFR 2020 ; EULAR 2022"
  },
  {
    "medicament": "Metformine",
    "classe_pharmacologique": "Biguanide",
    "posologie_adulte": "500 mg/j PO → 500–850 mg x3/j (max 3000 mg/j ; habituellement 2000 mg/j)",
    "posologie_sujet_age": "Débuter à 500 mg/j. Réduire à 500–1000 mg/j si DFG 30–44. CI si DFG<30.",
    "notes_cliniques": "Suspension péri-opératoire et si produit de contraste iodé",
    "source": "RCP Glucophage ; HAS DT2 2023"
  },
  {
    "medicament": "Alogliptine",
    "classe_pharmacologique": "Gliptine (DPP-4i)",
    "posologie_adulte": "25 mg/j PO",
    "posologie_sujet_age": "12,5 mg/j si DFG 30–59 ; 6,25 mg/j si DFG<30. Pas d'ajustement à l'âge seul.",
    "notes_cliniques": "Prudence IH sévère",
    "source": "RCP Vipidia ; HAS DT2 2023"
  },
  {
    "medicament": "Saxagliptine",
    "classe_pharmacologique": "Gliptine (DPP-4i)",
    "posologie_adulte": "5 mg/j PO",
    "posologie_sujet_age": "2,5 mg/j si DFG<50. Prudence IC (risque hospitalisation IC légèrement ↑).",
    "notes_cliniques": "Réduire à 2,5 mg/j si DFG<50 ou inhibiteurs CYP3A4",
    "source": "RCP Onglyza ; HAS DT2 2023"
  },
  {
    "medicament": "Sitagliptine",
    "classe_pharmacologique": "Gliptine (DPP-4i)",
    "posologie_adulte": "100 mg/j PO",
    "posologie_sujet_age": "50 mg/j si DFG 30–44 ; 25 mg/j si DFG<30. Pas d'ajustement à l'âge seul.",
    "notes_cliniques": "Ajustement DFG : 50 mg si DFG<45 ; 25 mg si DFG<30",
    "source": "RCP Januvia ; HAS DT2 2023"
  },
  {
    "medicament": "Vildagliptine",
    "classe_pharmacologique": "Gliptine (DPP-4i)",
    "posologie_adulte": "50 mg x1–2/j PO",
    "posologie_sujet_age": "50 mg/j (1x/j) si DFG<30 ou dialyse. Surveillance hépatique obligatoire.",
    "notes_cliniques": "Surveillance hépatique renforcée (tous les 3 mois la 1ère année)",
    "source": "RCP Galvus ; HAS DT2 2023"
  },
  {
    "medicament": "Insuline Aspart",
    "classe_pharmacologique": "Insuline rapide analogue",
    "posologie_adulte": "Individuelle SC : 0,5–1 UI/kg/j total ; bolus 0–15 min avant repas",
    "posologie_sujet_age": "Même principe. Doses plus faibles. Objectifs HbA1c souvent assouplis (7,5–8%). Risque hypoglycémie ↑.",
    "notes_cliniques": "Peut être injectée après repas si appétit incertain",
    "source": "RCP Novorapid ; HAS DT1/DT2 2023"
  },
  {
    "medicament": "Insuline Dégludec",
    "classe_pharmacologique": "Insuline basale ultra-longue",
    "posologie_adulte": "Individuelle SC : 10 UI/j → titration selon glycémie à jeun",
    "posologie_sujet_age": "Même principe. Débuter à 10 UI/j. Moins d'hypoglycémies nocturnes (avantage SA).",
    "notes_cliniques": "Demi-vie 25h. Flexibilité horaire. Moins d'hypoglycémies nocturnes.",
    "source": "RCP Tresiba ; HAS DT1/DT2 2023"
  },
  {
    "medicament": "Insuline Détémir",
    "classe_pharmacologique": "Insuline basale longue",
    "posologie_adulte": "Individuelle SC : 10 UI/j → titration (1–2 injections/j)",
    "posologie_sujet_age": "Même principe. Débuter à doses réduites. Objectifs assouplis.",
    "notes_cliniques": "Durée 12–24h selon dose",
    "source": "RCP Levemir ; HAS DT1/DT2 2023"
  },
  {
    "medicament": "Insuline Glargine",
    "classe_pharmacologique": "Insuline basale longue",
    "posologie_adulte": "Individuelle SC : 10 UI/j → titration selon glycémie à jeun",
    "posologie_sujet_age": "Même principe. Débuter à 10 UI/j. Objectifs assouplis (>75 ans : HbA1c 7,5–8,5%).",
    "notes_cliniques": "Glargine 300 UI/mL (Toujeo) : durée >24h",
    "source": "RCP Lantus/Toujeo ; HAS DT1/DT2 2023"
  },
  {
    "medicament": "Insuline Glulisine",
    "classe_pharmacologique": "Insuline rapide analogue",
    "posologie_adulte": "Individuelle SC : bolus 0–15 min avant repas ou immédiatement après",
    "posologie_sujet_age": "Même principe. Peut être donnée après repas si appétit incertain.",
    "notes_cliniques": "Injection avant ou immédiatement après repas",
    "source": "RCP Apidra ; HAS DT1/DT2 2023"
  },
  {
    "medicament": "Insuline Humaine",
    "classe_pharmacologique": "Insuline humaine (rapide ou NPH)",
    "posologie_adulte": "Individuelle SC : 0,5–1 UI/kg/j ; Rapide 30 min avant repas ; NPH x1–2/j",
    "posologie_sujet_age": "Même principe. NPH : risque hypoglycémie nocturne > analogues. Objectifs assouplis.",
    "notes_cliniques": "Rapide : 30 min avant repas (différent des analogues)",
    "source": "RCP Actrapid/Insulatard ; HAS DT1/DT2 2023"
  },
  {
    "medicament": "Insuline Lispro",
    "classe_pharmacologique": "Insuline rapide analogue",
    "posologie_adulte": "Individuelle SC : bolus 0–15 min avant repas",
    "posologie_sujet_age": "Même principe. Peut être injectée après repas (SA institutionalisé).",
    "notes_cliniques": "Début action 15 min. Peut être injectée après repas.",
    "source": "RCP Humalog ; HAS DT1/DT2 2023"
  },
  {
    "medicament": "Lévothyroxine",
    "classe_pharmacologique": "Hormone thyroïdienne",
    "posologie_adulte": "Hypothyroïdie : 1,6 µg/kg/j PO → ajustement TSH ; dose initiale 25–50 µg/j",
    "posologie_sujet_age": "Débuter à 12,5–25 µg/j. Titration très lente (paliers de 12,5–25 µg toutes les 4–6 sem). Objectif TSH 1–3 mU/L (éviter surdosage : FA, ostéoporose).",
    "notes_cliniques": "Prudence si cardiopathie. TSH cible normale ou haute-normale chez SA.",
    "source": "RCP Levothyrox ; HAS 2019 ; ETA 2019"
  },
  {
    "medicament": "Liothyronine",
    "classe_pharmacologique": "Hormone thyroïdienne active (T3)",
    "posologie_adulte": "5–20 µg x2–3/j PO",
    "posologie_sujet_age": "Débuter à 2,5–5 µg/j. Titration très lente. Risque arythmie ↑ chez SA.",
    "notes_cliniques": "Demi-vie courte (24h). Usage limité.",
    "source": "RCP Cytomel ; HAS 2019"
  },
  {
    "medicament": "Tiratricol",
    "classe_pharmacologique": "Hormone thyroïdienne (acide triiodothyroacétique)",
    "posologie_adulte": "1,35–2,7 mg/j PO en 3 prises",
    "posologie_sujet_age": "Débuter à dose minimale. Risque arythmie. Usage très limité.",
    "notes_cliniques": "Indication : thyroïde résistante aux hormones",
    "source": "RCP Teatrois"
  },
  {
    "medicament": "Alfacalcidol",
    "classe_pharmacologique": "Vitamine D active (1α-OH-D3)",
    "posologie_adulte": "0,25–1 µg/j PO ; IRC : 0,25–1 µg/j selon PTH/calcémie",
    "posologie_sujet_age": "Même dose. Surveillance calcémie rapprochée.",
    "notes_cliniques": "Pas besoin d'hydroxylation rénale → IRC sévère",
    "source": "RCP Un-Alfa ; HAS IRC 2022"
  },
  {
    "medicament": "Calcifédiol",
    "classe_pharmacologique": "Vitamine D (25-OH-D3)",
    "posologie_adulte": "Carence : 300–1000 µg/mois PO ; IRC : selon protocole",
    "posologie_sujet_age": "Même principe. Objectif 25-OH-D >30 ng/mL. Préféré en IRC modérée.",
    "notes_cliniques": "Forme semi-activée. Avantage en IRC modérée.",
    "source": "RCP Dédrogyl ; HAS 2022"
  },
  {
    "medicament": "Calcitriol",
    "classe_pharmacologique": "Vitamine D active (1,25-OH2-D3)",
    "posologie_adulte": "0,25–0,5 µg/j PO ; IRC/HPT secondaire : 0,25–1 µg/j",
    "posologie_sujet_age": "Même dose. Surveillance calcémie++ (risque hypercalcémie ↑).",
    "notes_cliniques": "Forme la plus active. Surveillance calcémie/phosphatémie rapprochée.",
    "source": "RCP Rocaltrol ; HAS IRC 2022"
  },
  {
    "medicament": "Cholécalciférol",
    "classe_pharmacologique": "Vitamine D3 native",
    "posologie_adulte": "Supplémentation : 800–1000 UI/j PO ou 50 000 UI/mois ; Correction carence : 50 000–100 000 UI/mois x3",
    "posologie_sujet_age": "1000–1200 UI/j recommandés. Supplémentation quasi systématique après 65 ans (chutes/ostéoporose).",
    "notes_cliniques": "Dose cumulée mensuelle préférable",
    "source": "RCP Uvedose/Zymad ; HAS 2022 ; Grio 2022"
  },
  {
    "medicament": "Ergocalciférol",
    "classe_pharmacologique": "Vitamine D2 native",
    "posologie_adulte": "Supplémentation : 800–1000 UI/j PO ; Carence : 50 000 UI/sem x8",
    "posologie_sujet_age": "Même principe. D3 préférée (plus efficace).",
    "notes_cliniques": "D2 moins efficace que D3",
    "source": "RCP Stérogyl ; HAS 2022"
  },
  {
    "medicament": "Carbonate de calcium",
    "classe_pharmacologique": "Supplément calcique",
    "posologie_adulte": "1000–1500 mg/j Ca élémentaire PO (2–3 prises pendant repas)",
    "posologie_sujet_age": "1000–1200 mg/j. Max 500 mg Ca/prise. Prudence constipation/lithiase.",
    "notes_cliniques": "À prendre pendant repas. Max 500 mg Ca/prise.",
    "source": "RCP Cacit/Calperos ; HAS 2022 ; SFR"
  },
  {
    "medicament": "Pidolate de calcium",
    "classe_pharmacologique": "Supplément calcique",
    "posologie_adulte": "500–1000 mg/j Ca élémentaire PO",
    "posologie_sujet_age": "Même principe. Fractionnement des doses.",
    "notes_cliniques": "Bonne tolérance digestive",
    "source": "RCP Calcium Sandoz ; HAS 2022"
  },
  {
    "medicament": "Ésoméprazole",
    "classe_pharmacologique": "IPP",
    "posologie_adulte": "RGO/UGD : 20–40 mg/j PO ; Éradication H. pylori : 20 mg x2/j ; Z-E : 40–80 mg x2/j",
    "posologie_sujet_age": "Même dose. Durée la plus courte efficace. Surveillance magnésémie et B12 si usage prolongé.",
    "notes_cliniques": "Prendre 30 min avant repas. Réévaluation annuelle si usage prolongé.",
    "source": "RCP Inexium ; HAS 2020 IPP"
  },
  {
    "medicament": "Lansoprazole",
    "classe_pharmacologique": "IPP",
    "posologie_adulte": "15–30 mg/j PO ; Éradication H. pylori : 30 mg x2/j",
    "posologie_sujet_age": "Même dose. Mêmes précautions IPP.",
    "notes_cliniques": "Prendre 30 min avant repas. Capsules peuvent être ouvertes.",
    "source": "RCP Ogastoro ; HAS 2020 IPP"
  },
  {
    "medicament": "Oméprazole",
    "classe_pharmacologique": "IPP",
    "posologie_adulte": "10–40 mg/j PO ; Éradication H. pylori : 20 mg x2/j ; Prévention AINS : 20 mg/j",
    "posologie_sujet_age": "Même dose. Interaction clopidogrel à éviter → préférer pantoprazole.",
    "notes_cliniques": "Inhibiteur CYP2C19 → interaction clopidogrel. Prendre 30 min avant repas.",
    "source": "RCP Mopral ; HAS 2020 IPP"
  },
  {
    "medicament": "Pantoprazole",
    "classe_pharmacologique": "IPP",
    "posologie_adulte": "20–40 mg/j PO ou IV ; Éradication H. pylori : 40 mg x2/j",
    "posologie_sujet_age": "Même dose. Moins d'interactions CYP2C19 → préféré si clopidogrel.",
    "notes_cliniques": "Moins d'interactions CYP2C19. Préféré avec clopidogrel.",
    "source": "RCP Eupantol ; HAS 2020 IPP"
  },
  {
    "medicament": "Rabéprazole",
    "classe_pharmacologique": "IPP",
    "posologie_adulte": "10–20 mg/j PO ; Éradication H. pylori : 20 mg x2/j",
    "posologie_sujet_age": "Même dose. Métabolisme moins dépendant CYP2C19.",
    "notes_cliniques": "Moins sensible au polymorphisme CYP2C19",
    "source": "RCP Pariet ; HAS 2020 IPP"
  },
  {
    "medicament": "Lactitol",
    "classe_pharmacologique": "Laxatif osmotique",
    "posologie_adulte": "Constipation : 10–20 g/j PO ; EH : 30–60 g/j",
    "posologie_sujet_age": "Même dose. Ajustement selon transit. Prudence déshydratation.",
    "notes_cliniques": "Délai action 48h",
    "source": "RCP Importal"
  },
  {
    "medicament": "Lactulose",
    "classe_pharmacologique": "Laxatif osmotique",
    "posologie_adulte": "Constipation : 15–30 mL x2/j PO ; EH : 30–50 mL x3/j",
    "posologie_sujet_age": "Même dose. Flatulences fréquentes. Prudence déshydratation.",
    "notes_cliniques": "EH : objectif 2–3 selles molles/j",
    "source": "RCP Duphalac"
  },
  {
    "medicament": "Macrogol",
    "classe_pharmacologique": "Laxatif osmotique (PEG)",
    "posologie_adulte": "Constipation : 1–3 sachets/j PO ; Fécalome : 6–8 sachets/j x3 j",
    "posologie_sujet_age": "1–2 sachets/j. Bien toléré. Préféré chez SA.",
    "notes_cliniques": "Laxatif de référence SA. Peu absorbé.",
    "source": "RCP Movicol/Forlax ; HAS"
  },
  {
    "medicament": "Béclométasone",
    "classe_pharmacologique": "Corticoïde inhalé",
    "posologie_adulte": "Asthme : 200–1000 µg/j inhalé ; BPCO : 400 µg x2/j",
    "posologie_sujet_age": "Même dose. Rinçage bouche après inhalation. Prudence forte dose prolongée.",
    "notes_cliniques": "Rinçage bouche obligatoire",
    "source": "RCP Becotide ; GINA 2023"
  },
  {
    "medicament": "Budésonide",
    "classe_pharmacologique": "Corticoïde inhalé",
    "posologie_adulte": "Asthme : 200–1600 µg/j inhalé ; BPCO : 400 µg x2/j",
    "posologie_sujet_age": "Même dose. Rinçage bouche. Disponible en nébulisation (BPCO sévère).",
    "notes_cliniques": "Disponible en nébulisation",
    "source": "RCP Pulmicort ; GINA 2023"
  },
  {
    "medicament": "Ciclésonide",
    "classe_pharmacologique": "Corticoïde inhalé (prodrogue)",
    "posologie_adulte": "Asthme : 160 µg/j → 320 µg/j inhalé",
    "posologie_sujet_age": "Même dose. Moins de candidose (activation locale).",
    "notes_cliniques": "Prodrogue activée localement → moins de candidose",
    "source": "RCP Alvesco ; GINA 2023"
  },
  {
    "medicament": "Fluticasone",
    "classe_pharmacologique": "Corticoïde inhalé",
    "posologie_adulte": "Asthme : 100–1000 µg/j inhalé ; BPCO : 500 µg x2/j (propionate) ou 100 µg/j (furoate)",
    "posologie_sujet_age": "Même dose. Forte puissance → surveillance axe HHA si dose élevée. Rinçage bouche.",
    "notes_cliniques": "Furoate : 1x/j. Propionate : 2x/j.",
    "source": "RCP Flixotide/Arnuity ; GINA 2023"
  },
  {
    "medicament": "Formotérol",
    "classe_pharmacologique": "BLDA (bêta-2 agoniste longue durée)",
    "posologie_adulte": "Asthme/BPCO : 12 µg x1–2/j inhalé ; max 24 µg/j",
    "posologie_sujet_age": "Même dose. Surveillance FC. Hypokaliémie si forte dose.",
    "notes_cliniques": "Toujours associé à CI en asthme",
    "source": "RCP Foradil ; GINA 2023"
  },
  {
    "medicament": "Glycopyrronium",
    "classe_pharmacologique": "BLCA (anticholinergique longue durée)",
    "posologie_adulte": "BPCO : 44–55 µg/j inhalé (1x/j)",
    "posologie_sujet_age": "Même dose. Prudence rétention urinaire/glaucome.",
    "notes_cliniques": "1 prise quotidienne",
    "source": "RCP Seebri ; GOLD 2023"
  },
  {
    "medicament": "Indacatérol",
    "classe_pharmacologique": "BLDA",
    "posologie_adulte": "BPCO : 150 µg/j inhalé (1x/j) → 300 µg/j",
    "posologie_sujet_age": "Même dose. Toussotement post-inhalation fréquent et bénin.",
    "notes_cliniques": "1 prise/j. Toussotement bénin post-inhalation.",
    "source": "RCP Onbrez ; GOLD 2023"
  },
  {
    "medicament": "Ipratropium",
    "classe_pharmacologique": "BCDA (anticholinergique courte durée)",
    "posologie_adulte": "20–40 µg x3–4/j inhalé ; Nébulisation : 250–500 µg x3–4/j",
    "posologie_sujet_age": "Même dose. Prudence : rétention urinaire (prostate), glaucome aigu.",
    "notes_cliniques": "Durée d'action 4–6h",
    "source": "RCP Atrovent ; GOLD 2023"
  },
  {
    "medicament": "Salbutamol",
    "classe_pharmacologique": "BCDA (bêta-2 agoniste courte durée)",
    "posologie_adulte": "Bronchospasme : 100–200 µg (1–2 bouffées) x3–4/j ; Crise : 400–800 µg ; Nébulisation : 2,5–5 mg",
    "posologie_sujet_age": "Même dose. Tachycardie/hypokaliémie possibles. Prudence cardiopathie.",
    "notes_cliniques": "À la demande en asthme (usage excessif = mauvais contrôle)",
    "source": "RCP Ventoline ; GINA 2023"
  },
  {
    "medicament": "Salmétérol",
    "classe_pharmacologique": "BLDA",
    "posologie_adulte": "50 µg x2/j inhalé (asthme/BPCO)",
    "posologie_sujet_age": "Même dose. Toujours associé à CI en asthme.",
    "notes_cliniques": "Toujours associé à CI en asthme (jamais seul)",
    "source": "RCP Serevent ; GINA 2023"
  },
  {
    "medicament": "Terbutaline",
    "classe_pharmacologique": "BCDA (bêta-2 agoniste)",
    "posologie_adulte": "250–500 µg (1–2 bouffées) x3–4/j ; SC : 0,25 mg",
    "posologie_sujet_age": "Même dose. Prudence tachycardie/hypokaliémie si forte dose.",
    "notes_cliniques": "Disponible en voie SC (crise sévère)",
    "source": "RCP Bricanyl ; GINA 2023"
  },
  {
    "medicament": "Tiotropium",
    "classe_pharmacologique": "BLCA",
    "posologie_adulte": "BPCO : 18 µg/j (Handihaler) ou 5 µg/j (Respimat) (1x/j)",
    "posologie_sujet_age": "Même dose. Prudence rétention urinaire/glaucome. Respimat préféré.",
    "notes_cliniques": "Prise unique/j. Respimat : moins d'effets systémiques.",
    "source": "RCP Spiriva ; GOLD 2023"
  },
  {
    "medicament": "Umeclidinium",
    "classe_pharmacologique": "BLCA",
    "posologie_adulte": "BPCO : 62,5 µg/j inhalé (1x/j)",
    "posologie_sujet_age": "Même dose. Prudence rétention urinaire.",
    "notes_cliniques": "1 prise quotidienne",
    "source": "RCP Incruse ; GOLD 2023"
  },
  {
    "medicament": "Alfuzosine",
    "classe_pharmacologique": "Alpha-1 bloquant",
    "posologie_adulte": "HBP : 10 mg/j PO (LP, après repas)",
    "posologie_sujet_age": "Même dose. Prudence : hypotension orthostatique surtout en début et si antihypertenseurs.",
    "notes_cliniques": "À prendre après repas (LP). Hypotension 1ère dose.",
    "source": "RCP Xatral ; EAU 2022"
  },
  {
    "medicament": "Doxazosine",
    "classe_pharmacologique": "Alpha-1 bloquant",
    "posologie_adulte": "HBP/HTA : 1 mg/j PO → 4–8 mg/j (LP jusqu'à 8 mg/j)",
    "posologie_sujet_age": "Débuter à 1 mg/j. Prudence hypotension orthostatique (risque chutes).",
    "notes_cliniques": "Effet favorable profil lipidique. Hypotension 1ère dose.",
    "source": "RCP Zoxan ; EAU 2022 ; ESC HTA 2023"
  },
  {
    "medicament": "Prazosine",
    "classe_pharmacologique": "Alpha-1 bloquant",
    "posologie_adulte": "HTA : 0,5 mg x2/j → 1–5 mg x2–3/j",
    "posologie_sujet_age": "Débuter à 0,5 mg au coucher. Hypotension orthostatique sévère possible (1ère dose).",
    "notes_cliniques": "Phénomène 1ère dose : débuter au coucher",
    "source": "RCP Alpress ; ESC HTA 2023"
  },
  {
    "medicament": "Silodosine",
    "classe_pharmacologique": "Alpha-1A bloquant sélectif",
    "posologie_adulte": "HBP : 8 mg/j PO (après repas)",
    "posologie_sujet_age": "4 mg/j si DFG 30–50. Moins d'hypotension orthostatique.",
    "notes_cliniques": "Éjaculation rétrograde fréquente",
    "source": "RCP Silodyx ; EAU 2022"
  },
  {
    "medicament": "Tamsulosine",
    "classe_pharmacologique": "Alpha-1A/D bloquant",
    "posologie_adulte": "HBP : 0,4 mg/j PO (après repas)",
    "posologie_sujet_age": "Même dose. Moins d'hypotension orthostatique.",
    "notes_cliniques": "Éjaculation rétrograde possible",
    "source": "RCP Josir ; EAU 2022"
  },
  {
    "medicament": "Térazosine",
    "classe_pharmacologique": "Alpha-1 bloquant",
    "posologie_adulte": "HBP/HTA : 1 mg au coucher → 5–10 mg/j",
    "posologie_sujet_age": "Débuter à 1 mg au coucher. Prudence hypotension orthostatique.",
    "notes_cliniques": "Phénomène 1ère dose : débuter au coucher",
    "source": "RCP Hytrine ; EAU 2022"
  },
  {
    "medicament": "Apraclonidine",
    "classe_pharmacologique": "Alpha-2 agoniste collyre",
    "posologie_adulte": "0,5% : 1 gtte x3/j ; 1% : 1 gtte 1h avant et après laser",
    "posologie_sujet_age": "Même dose. Tachyphylaxie rapide → usage court terme.",
    "notes_cliniques": "Tachyphylaxie → usage court terme",
    "source": "RCP Iopidine ; EGS 2020"
  },
  {
    "medicament": "Bimatoprost",
    "classe_pharmacologique": "Analogue prostaglandine (collyre)",
    "posologie_adulte": "0,01–0,03% : 1 gtte/soir",
    "posologie_sujet_age": "Même posologie. Prudence uvéite/inflammation oculaire.",
    "notes_cliniques": "1x/soir. Modification pigmentation iris/cils.",
    "source": "RCP Lumigan ; EGS 2020"
  },
  {
    "medicament": "Brimonidine",
    "classe_pharmacologique": "Alpha-2 agoniste collyre",
    "posologie_adulte": "0,1–0,2% : 1 gtte x2/j",
    "posologie_sujet_age": "Même dose. Prudence si antihypertenseurs systémiques.",
    "notes_cliniques": "Absorption systémique possible",
    "source": "RCP Alphagan ; EGS 2020"
  },
  {
    "medicament": "Brinzolamide",
    "classe_pharmacologique": "Inhibiteur anhydrase carbonique collyre",
    "posologie_adulte": "1% : 1 gtte x2–3/j",
    "posologie_sujet_age": "Même dose. CI si DFG<30.",
    "notes_cliniques": "CI si DFG<30 ou allergie sulfonamides",
    "source": "RCP Azopt ; EGS 2020"
  },
  {
    "medicament": "Dorzolamide",
    "classe_pharmacologique": "Inhibiteur anhydrase carbonique collyre",
    "posologie_adulte": "2% : 1 gtte x3/j (monothérapie) ou x2/j (association)",
    "posologie_sujet_age": "Même dose. CI si DFG<30.",
    "notes_cliniques": "CI si DFG<30 ou allergie sulfonamides",
    "source": "RCP Trusopt ; EGS 2020"
  },
  {
    "medicament": "Latanoprost",
    "classe_pharmacologique": "Analogue prostaglandine F2α (collyre)",
    "posologie_adulte": "0,005% : 1 gtte/soir",
    "posologie_sujet_age": "Même posologie. Modification pigmentation iris.",
    "notes_cliniques": "1x/soir. Risque uvéite antérieure.",
    "source": "RCP Xalatan ; EGS 2020"
  },
  {
    "medicament": "Pilocarpine",
    "classe_pharmacologique": "Parasympathomimétique collyre/PO",
    "posologie_adulte": "Collyre : 1–4% : 1 gtte x2–4/j ; Sjögren (PO) : 5 mg x3/j",
    "posologie_sujet_age": "Collyre : même posologie. PO : débuter à 5 mg x2/j. Prudence bradycardie/bronchospasme.",
    "notes_cliniques": "PO : Sjögren. Collyre : glaucome. Myosis ++.",
    "source": "RCP Pilocarpine/Salagen ; EGS 2020"
  },
  {
    "medicament": "Tafluprost",
    "classe_pharmacologique": "Analogue prostaglandine sans conservateur (collyre)",
    "posologie_adulte": "0,0015% : 1 gtte/soir",
    "posologie_sujet_age": "Même posologie. Avantage : sans conservateur (moins d'irritation).",
    "notes_cliniques": "Sans BAC → moins d'irritation oculaire",
    "source": "RCP Saflutan ; EGS 2020"
  },
  {
    "medicament": "Timolol",
    "classe_pharmacologique": "Bêta-bloquant collyre",
    "posologie_adulte": "0,25–0,5% : 1 gtte x1–2/j",
    "posologie_sujet_age": "Débuter par 0,25% x1/j. Absorption systémique → bradycardie/bronchospasme. CI si asthme/BAV.",
    "notes_cliniques": "CI asthme/BAV/bradycardie. Absorption systémique.",
    "source": "RCP Timoptol ; EGS 2020"
  },
  {
    "medicament": "Travoprost",
    "classe_pharmacologique": "Analogue prostaglandine (collyre)",
    "posologie_adulte": "0,004% : 1 gtte/soir",
    "posologie_sujet_age": "Même posologie. Profil identique à latanoprost.",
    "notes_cliniques": "1x/soir. Modification pigmentation iris/cils.",
    "source": "RCP Travatan ; EGS 2020"
  },
  {
    "medicament": "Bétaméthasone",
    "classe_pharmacologique": "Corticoïde systémique",
    "posologie_adulte": "0,5–8 mg/j PO ou IM selon indication ; équivalence : 0,75 mg ≈ 5 mg prednisone",
    "posologie_sujet_age": "Même dose. Prudence : hyperglycémie, HTA, ostéoporose, infections, confusion.",
    "notes_cliniques": "Puissance : 25x cortisone. Pas d'effet minéralocorticoïde.",
    "source": "RCP Célestène ; HAS 2022"
  },
  {
    "medicament": "Cortisone",
    "classe_pharmacologique": "Corticoïde systémique",
    "posologie_adulte": "Substitution IS : 25–37,5 mg/j PO (2–3 prises) ; Anti-inflammatoire : variable",
    "posologie_sujet_age": "Même dose de substitution. Prudence glycémie/TA/infections.",
    "notes_cliniques": "Prodrogue (cortisol). Effet minéralocorticoïde modéré.",
    "source": "RCP Cortisone ; SFEDM 2017"
  },
  {
    "medicament": "Dexaméthasone",
    "classe_pharmacologique": "Corticoïde systémique",
    "posologie_adulte": "Anti-inflammatoire/Antiémétique : 4–20 mg/j IV/PO ; HTIC : 8–24 mg/j ; COVID-19 : 6 mg/j x10 j",
    "posologie_sujet_age": "Même dose. Forte activité glucocorticoïde. Hyperglycémie fréquente. Surveillance++.",
    "notes_cliniques": "Puissance : 30–40x cortisone. Pas d'effet minéralocorticoïde.",
    "source": "RCP Dectancyl ; HAS 2022"
  },
  {
    "medicament": "Hydrocortisone",
    "classe_pharmacologique": "Corticoïde systémique (cortisol naturel)",
    "posologie_adulte": "Substitution IS : 15–25 mg/j PO (2–3 prises) ; Crise addisonnienne : 100 mg IV bolus + 200 mg/24h ; Anti-inflammatoire : 100–500 mg IV",
    "posologie_sujet_age": "Substitution : même dose (0,15–0,2 mg/kg/j). Prudence glycémie/TA. Carte urgence obligatoire si IS.",
    "notes_cliniques": "Cortisol naturel. Effet minéralocorticoïde. Carte urgence surrénalienne.",
    "source": "RCP Hydrocortisone ; SFEDM IS 2017"
  },
  {
    "medicament": "Méthylprednisolone",
    "classe_pharmacologique": "Corticoïde systémique",
    "posologie_adulte": "Anti-inflammatoire : 20–80 mg/j PO/IV ; Bolus IV : 500–1000 mg/j x3 (NORB, vascularite) ; 4 mg ≈ 5 mg prednisone",
    "posologie_sujet_age": "Même dose. Hyperglycémie fréquente (y compris si bolus).",
    "notes_cliniques": "Puissance : 5x prednisone. Pas d'effet minéralocorticoïde.",
    "source": "RCP Médrol ; HAS 2022"
  },
  {
    "medicament": "Prednisolone",
    "classe_pharmacologique": "Corticoïde systémique",
    "posologie_adulte": "Anti-inflammatoire : 0,5–1 mg/kg/j PO → dégression progressive ; Maintenance : 5–15 mg/j",
    "posologie_sujet_age": "Même principe. Dégression lente. Prévention OPM systématique si >3 mois >5 mg/j.",
    "notes_cliniques": "Prise le matin. Prévention OPM + Ca/Vit D si traitement prolongé.",
    "source": "RCP Solupred ; HAS 2022 ; SFR"
  },
  {
    "medicament": "Prednisone",
    "classe_pharmacologique": "Corticoïde systémique",
    "posologie_adulte": "Anti-inflammatoire : 0,5–1 mg/kg/j PO → dégression progressive",
    "posologie_sujet_age": "Même principe. Prévention OPM + Ca/Vit D si >3 mois. Prudence : infections, glycémie, ostéoporose.",
    "notes_cliniques": "Prodrogue → prednisolone. Prévention OPM.",
    "source": "RCP Cortancyl ; HAS 2022 ; SFR"
  },
  {
    "medicament": "Ascorbate ferreux",
    "classe_pharmacologique": "Supplément en fer",
    "posologie_adulte": "Carence : 100–200 mg fer élémentaire/j PO (2 prises à distance des repas)",
    "posologie_sujet_age": "Même dose. Tolérance digestive souvent meilleure pendant repas (au détriment absorption).",
    "notes_cliniques": "Selles noires normales. Administrer à distance des repas si toléré.",
    "source": "RCP Ascofer ; HAS 2021"
  },
  {
    "medicament": "Fumarate ferreux",
    "classe_pharmacologique": "Supplément en fer",
    "posologie_adulte": "100–200 mg fer élémentaire/j PO",
    "posologie_sujet_age": "Même dose. Prise pendant repas si mauvaise tolérance.",
    "notes_cliniques": "Bonne tolérance digestive",
    "source": "RCP Fumafer ; HAS 2021"
  },
  {
    "medicament": "Sulfate ferreux",
    "classe_pharmacologique": "Supplément en fer",
    "posologie_adulte": "100–200 mg fer élémentaire/j PO (1h avant repas)",
    "posologie_sujet_age": "Même dose. Constipation fréquente → hydratation. Prise pendant repas si intolérance.",
    "notes_cliniques": "Référence carence martiale. Plus d'effets GI.",
    "source": "RCP Tardyféron ; HAS 2021"
  },
  {
    "medicament": "Chlorpromazine",
    "classe_pharmacologique": "Antipsychotique classique (phénothiazine)",
    "posologie_adulte": "Psychose : 75–300 mg/j PO (3 prises) ; max 1000 mg/j en hospitalier",
    "posologie_sujet_age": "Débuter à 25 mg/j. Max 100–150 mg/j. Sédation/hypotension orthostatique/EPS. Décès ↑ chez déments.",
    "notes_cliniques": "Nombreux EI. Préférer AP atypiques chez SA.",
    "source": "RCP Largactil ; HAS 2017"
  },
  {
    "medicament": "Haloperidol",
    "classe_pharmacologique": "Antipsychotique classique (butyrophénone)",
    "posologie_adulte": "Psychose : 2–10 mg/j PO (jusqu'à 20 mg/j) ; Urgence : 5 mg IM",
    "posologie_sujet_age": "Débuter à 0,5–1 mg/j PO. Max 5 mg/j. EPS fréquents. Délirium : 0,5–1 mg IM (usage off-label).",
    "notes_cliniques": "Référence délirium hospitalier (0,5–1 mg). EPS fréquents SA.",
    "source": "RCP Haldol ; HAS 2017"
  },
  {
    "medicament": "Fluphénazine",
    "classe_pharmacologique": "Antipsychotique classique (phénothiazine)",
    "posologie_adulte": "2,5–10 mg/j PO (2–3 prises) ; Décanoate : 12,5–25 mg/2–4 sem IM",
    "posologie_sujet_age": "Débuter à 1–2,5 mg/j. Prudence EPS/hypotension. Décanoate : espacement injections.",
    "notes_cliniques": "Disponible en forme retard (décanoate)",
    "source": "RCP Modécate ; HAS 2017"
  },
  {
    "medicament": "Perphénazine",
    "classe_pharmacologique": "Antipsychotique classique (phénothiazine)",
    "posologie_adulte": "Psychose : 8–24 mg/j PO (2–3 prises) ; Antiémétique : 2–4 mg x3/j",
    "posologie_sujet_age": "Réduire de 50%. EPS fréquents chez SA.",
    "notes_cliniques": "Également utilisé comme antiémétique",
    "source": "RCP Trilifan ; HAS 2017"
  },
  {
    "medicament": "Lévométhopromazine",
    "classe_pharmacologique": "Antipsychotique classique (phénothiazine)",
    "posologie_adulte": "Psychose : 75–300 mg/j PO ; Sédation palliative : 25–100 mg/24h SC/IV",
    "posologie_sujet_age": "Débuter à 12,5–25 mg/j. Forte sédation/hypotension orthostatique. Usage surtout palliatif.",
    "notes_cliniques": "Forte sédation. Usage principalement soins palliatifs.",
    "source": "RCP Nozinan ; HAS 2017"
  },
  {
    "medicament": "Ritonavir",
    "classe_pharmacologique": "Antiprotéase/Booster",
    "posologie_adulte": "Booster PK : 100 mg/j avec repas ; Traitement seul (obsolète) : 600 mg x2/j",
    "posologie_sujet_age": "Même dose (100 mg/j booster). Nombreuses interactions médicamenteuses ↑ chez SA polymédiqué.",
    "notes_cliniques": "Faible dose (100 mg/j) pour booster IP. Inhibiteur fort CYP3A4.",
    "source": "RCP Norvir ; HAS VIH 2023"
  },
  {
    "medicament": "Cobicistat",
    "classe_pharmacologique": "Booster PK (non antiviral)",
    "posologie_adulte": "150 mg/j PO (toujours en association)",
    "posologie_sujet_age": "Même dose. Fausse élévation créatinine (inhibition sécrétion tubulaire MATE).",
    "notes_cliniques": "Inhibiteur fort CYP3A4. Fausse élévation créatinine.",
    "source": "RCP Tybost ; HAS VIH 2023"
  },
  {
    "medicament": "Darunavir",
    "classe_pharmacologique": "Antiprotéase",
    "posologie_adulte": "Naïf : 800 mg/j + booster avec repas ; Expérimenté : 600 mg x2/j + booster",
    "posologie_sujet_age": "Même dose. Nombreuses interactions. Prudence polymédication.",
    "notes_cliniques": "Toujours associé à ritonavir 100 mg ou cobicistat 150 mg",
    "source": "RCP Prezista ; HAS VIH 2023"
  },
  {
    "medicament": "Atazanavir",
    "classe_pharmacologique": "Antiprotéase",
    "posologie_adulte": "300 mg/j + ritonavir 100 mg PO avec repas",
    "posologie_sujet_age": "Même dose. Ictère (bilirubinémie) bénin. Risque lithiase rénale.",
    "notes_cliniques": "Ictère par inhibition UGT1A1 (bénin). Risque lithiase rénale.",
    "source": "RCP Reyataz ; HAS VIH 2023"
  },
  {
    "medicament": "Lopinavir",
    "classe_pharmacologique": "Antiprotéase (co-formulé lopinavir/ritonavir)",
    "posologie_adulte": "400/100 mg x2/j PO avec repas",
    "posologie_sujet_age": "Même dose. Diarrhée fréquente. Nombreuses interactions.",
    "notes_cliniques": "Co-formulé avec ritonavir (Kaletra). Fort potentiel dyslipidémiant.",
    "source": "RCP Kaletra ; HAS VIH 2023"
  },
  {
    "medicament": "Efavirenz",
    "classe_pharmacologique": "INNTI",
    "posologie_adulte": "600 mg/j PO au coucher (estomac vide)",
    "posologie_sujet_age": "Même dose. Troubles neuropsychiatriques fréquents.",
    "notes_cliniques": "Au coucher à jeun. Inducteur CYP3A4.",
    "source": "RCP Sustiva ; HAS VIH 2023"
  },
  {
    "medicament": "Doravirine",
    "classe_pharmacologique": "INNTI",
    "posologie_adulte": "100 mg/j PO (avec ou sans repas)",
    "posologie_sujet_age": "Même dose. Bon profil tolérance neuropsychiatrique. Peu d'interactions.",
    "notes_cliniques": "Peu d'interactions. Profil tolérance favorable.",
    "source": "RCP Pifeltro ; HAS VIH 2023"
  },
  {
    "medicament": "Emtricitabine",
    "classe_pharmacologique": "INTI (NRTI)",
    "posologie_adulte": "200 mg/j PO (avec ou sans repas)",
    "posologie_sujet_age": "Ajustement DFG : 200 mg/48h si DFG 30–49 ; 200 mg/72h si DFG 15–29.",
    "notes_cliniques": "Élimination rénale → ajustement IRC. Activité anti-VHB.",
    "source": "RCP Emtriva ; HAS VIH 2023"
  },
  {
    "medicament": "Asunaprevir",
    "classe_pharmacologique": "Antivirale VHC (NS3/4A inhibiteur)",
    "posologie_adulte": "100 mg x2/j PO (Sunvepra — retiré EU 2018)",
    "posologie_sujet_age": "Non applicable (retiré du marché européen).",
    "notes_cliniques": "Retiré du marché EU 2018",
    "source": "RCP Sunvepra (retiré)"
  },
  {
    "medicament": "Boceprevir",
    "classe_pharmacologique": "Antivirale VHC (NS3 inhibiteur 1ère génération)",
    "posologie_adulte": "800 mg x3/j PO avec repas (toutes les 7–9h)",
    "posologie_sujet_age": "Même dose. Retiré EU 2015.",
    "notes_cliniques": "Retiré du marché EU 2015",
    "source": "RCP Victrelis (retiré)"
  },
  {
    "medicament": "Daclatasvir",
    "classe_pharmacologique": "Antivirale VHC (NS5A inhibiteur)",
    "posologie_adulte": "60 mg/j PO (avec ou sans repas)",
    "posologie_sujet_age": "Même dose. Pas d'ajustement à l'âge. Prudence interactions CYP3A4.",
    "notes_cliniques": "30 mg/j si inhibiteurs CYP3A4 forts ; 90 mg/j si inducteurs.",
    "source": "RCP Daklinza ; EASL VHC 2020"
  },
  {
    "medicament": "Sofosbuvir",
    "classe_pharmacologique": "Antivirale VHC (NS5B polymérase inhibiteur)",
    "posologie_adulte": "400 mg/j PO avec repas",
    "posologie_sujet_age": "Même dose. CI si DFG<30 (sofosbuvir seul).",
    "notes_cliniques": "CI avec amiodarone (bradycardie sévère). CI si DFG<30.",
    "source": "RCP Sovaldi ; EASL VHC 2020"
  },
  {
    "medicament": "Amiodarone",
    "classe_pharmacologique": "Antiarythmique classe III",
    "posologie_adulte": "Charge : 600–1200 mg/j PO x1 sem → entretien 100–400 mg/j (habituellement 200 mg/j) ; IV : 300 mg en 10–20 min puis 1200 mg/24h",
    "posologie_sujet_age": "Entretien : 100–200 mg/j (demi-dose préférable). Demi-vie 40–55 j → accumulation. Complications thyroïdiennes/pulmonaires/hépatiques plus fréquentes.",
    "notes_cliniques": "Demi-vie 40–55 jours. Surveillance multiorgane obligatoire.",
    "source": "RCP Cordarone ; ESC arythmie 2020"
  },
  {
    "medicament": "Dronédarone",
    "classe_pharmacologique": "Antiarythmique classe III (analogue amiodarone sans iode)",
    "posologie_adulte": "400 mg x2/j PO avec repas (FA non permanente)",
    "posologie_sujet_age": "Même dose. CI si IC décompensée/FA permanente. Surveillance hépatique mensuelle.",
    "notes_cliniques": "CI si IC sévère/FA permanente. Hépatotoxicité fatale documentée.",
    "source": "RCP Multaq ; ESC arythmie 2020"
  },
  {
    "medicament": "Disopyramide",
    "classe_pharmacologique": "Antiarythmique classe Ia",
    "posologie_adulte": "400–800 mg/j PO (4 prises ou LP x2/j) ; IV : 2 mg/kg bolus lent",
    "posologie_sujet_age": "Réduire de 25–50%. Anticholinergique fort (rétention urinaire, constipation, confusion). Risque QTc. Beers 2023 : déconseillé SA.",
    "notes_cliniques": "Effets anticholinergiques marqués. Déconseillé Beers 2023.",
    "source": "RCP Rythmodan ; ESC arythmie 2020"
  },
  {
    "medicament": "Chlorphéniramine",
    "classe_pharmacologique": "Antihistaminique H1 (1ère génération)",
    "posologie_adulte": "4 mg x3–4/j PO ; max 24 mg/j",
    "posologie_sujet_age": "Déconseillé (anticholinergique, sédation, confusion). Si nécessaire : 2 mg x2/j. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER (anticholinergique, confusion, rétention, chutes).",
    "source": "RCP Polaramine ; Beers 2023"
  },
  {
    "medicament": "Cétirizine",
    "classe_pharmacologique": "Antihistaminique H1 (2ème génération)",
    "posologie_adulte": "10 mg/j PO",
    "posologie_sujet_age": "5 mg/j (légèrement sédatif). Ajustement DFG<30 (5 mg/j).",
    "notes_cliniques": "Légère sédation possible",
    "source": "RCP Zyrtec ; HAS allergie 2020"
  },
  {
    "medicament": "Loratadine",
    "classe_pharmacologique": "Antihistaminique H1 (2ème génération, non sédatif)",
    "posologie_adulte": "10 mg/j PO",
    "posologie_sujet_age": "Même dose. Non sédatif. Pas d'ajustement officiel.",
    "notes_cliniques": "Non sédatif. Pas d'anticholinergique.",
    "source": "RCP Clarityne ; HAS allergie 2020"
  },
  {
    "medicament": "Fexofénadine",
    "classe_pharmacologique": "Antihistaminique H1 (2ème génération, non sédatif)",
    "posologie_adulte": "120–180 mg/j PO",
    "posologie_sujet_age": "Même dose. Préféré chez SA (non sédatif, pas d'anticholinergique).",
    "notes_cliniques": "Non sédatif. Pas de passage BHE. Préféré chez SA.",
    "source": "RCP Telfast ; HAS allergie 2020"
  },
  {
    "medicament": "Eletriptan",
    "classe_pharmacologique": "Triptan",
    "posologie_adulte": "40 mg PO à la crise ; répéter à 2h si nécessaire (max 80 mg/24h)",
    "posologie_sujet_age": "Même dose. Données insuffisantes >65 ans. Déconseillé si cardiopathie.",
    "notes_cliniques": "Max 80 mg/24h. CI cardiopathie ischémique.",
    "source": "RCP Relpax ; HAS migraine 2013"
  },
  {
    "medicament": "Frovatriptan",
    "classe_pharmacologique": "Triptan",
    "posologie_adulte": "2,5 mg PO ; répéter à 2h (max 7,5 mg/24h)",
    "posologie_sujet_age": "Même dose. Longue demi-vie (26h) → avantage migraine menstruelle.",
    "notes_cliniques": "Longue demi-vie (26h). Moins de récidives.",
    "source": "RCP Tigreat ; HAS migraine 2013"
  },
  {
    "medicament": "Naratriptan",
    "classe_pharmacologique": "Triptan",
    "posologie_adulte": "2,5 mg PO ; répéter à 4h (max 5 mg/24h)",
    "posologie_sujet_age": "Même dose. Demi-vie longue (6h). Ajustement si DFG<15.",
    "notes_cliniques": "Demi-vie plus longue que sumatriptan. Moins d'EI.",
    "source": "RCP Naramig ; HAS migraine 2013"
  },
  {
    "medicament": "Sumatriptan",
    "classe_pharmacologique": "Triptan (référence)",
    "posologie_adulte": "PO : 50–100 mg ; SC : 6 mg ; Spray nasal : 20 mg (répéter à 2h) ; max 300 mg/24h PO",
    "posologie_sujet_age": "Même dose. Données insuffisantes SA. Déconseillé si cardiopathie.",
    "notes_cliniques": "Triptan de référence. Plusieurs voies d'administration.",
    "source": "RCP Imigrane ; HAS migraine 2013"
  },
  {
    "medicament": "Zolmitriptan",
    "classe_pharmacologique": "Triptan",
    "posologie_adulte": "2,5 mg PO/spray nasal ; répéter à 2h (max 10 mg/24h)",
    "posologie_sujet_age": "Même dose. Prudence IH.",
    "notes_cliniques": "Formes PO et spray nasal. Max 10 mg/24h.",
    "source": "RCP Zomig ; HAS migraine 2013"
  },
  {
    "medicament": "Ciclosporine",
    "classe_pharmacologique": "Immunosuppresseur (inhibiteur calcineurine)",
    "posologie_adulte": "Transplantation : 10–15 mg/kg/j initiale → taux résiduel guidé ; Maladies auto-immunes : 2,5–5 mg/kg/j PO",
    "posologie_sujet_age": "Même principe (taux résiduel guidé). Prudence néphrotoxicité (IRC pré-existante). HTA fréquente.",
    "notes_cliniques": "Taux résiduel C0 guidé. Nombreuses interactions CYP3A4/P-gp.",
    "source": "RCP Néoral ; HAS 2022 transplantation"
  },
  {
    "medicament": "Tacrolimus",
    "classe_pharmacologique": "Immunosuppresseur (inhibiteur calcineurine)",
    "posologie_adulte": "Transplantation : 0,1–0,3 mg/kg/j PO → taux résiduel guidé ; Atopie topique : crème 0,03–0,1%",
    "posologie_sujet_age": "Même principe (taux guidé). Prudence : PTDM fréquent, néphrotoxicité, neurotoxicité.",
    "notes_cliniques": "Taux résiduel C0 guidé selon indication et phase post-transplantation.",
    "source": "RCP Prograf/Advagraf ; HAS 2022 transplantation"
  },
  {
    "medicament": "Mycophénolate mofétil",
    "classe_pharmacologique": "Immunosuppresseur (inhibiteur IMPDH)",
    "posologie_adulte": "Transplantation rénale : 1 g x2/j PO ; cardiaque/hépatique : 1,5 g x2/j",
    "posologie_sujet_age": "Même dose. Prudence leucopénie (NFS rapprochée). Réduction dose si leucopénie.",
    "notes_cliniques": "Ne pas écraser (tératogène). Prise 1h avant ou 2h après repas.",
    "source": "RCP Cellcept ; HAS 2022 transplantation"
  },
  {
    "medicament": "Bosentan",
    "classe_pharmacologique": "Antagoniste double endothéline",
    "posologie_adulte": "62,5 mg x2/j PO x4 sem → 125 mg x2/j (HTAP)",
    "posologie_sujet_age": "Même dose. Surveillance hépatique mensuelle obligatoire. Nombreuses interactions (inducteur CYP).",
    "notes_cliniques": "Surveillance hépatique mensuelle OBLIGATOIRE (REMS). Tératogène.",
    "source": "RCP Tracleer ; ESC HTAP 2022"
  },
  {
    "medicament": "Ambrisentan",
    "classe_pharmacologique": "Antagoniste sélectif endothéline ETA",
    "posologie_adulte": "5 mg/j PO → 10 mg/j (HTAP)",
    "posologie_sujet_age": "Même dose. Moins hépatotoxique que bosentan.",
    "notes_cliniques": "Moins hépatotoxique que bosentan. Tératogène.",
    "source": "RCP Volibris ; ESC HTAP 2022"
  },
  {
    "medicament": "Bupropion",
    "classe_pharmacologique": "Antidépresseur (IRND) / Aide au sevrage tabac",
    "posologie_adulte": "Dépression : 150 mg/j PO → 300 mg/j (LP) ; Sevrage tabac : 150 mg/j x3j → 150 mg x2/j x7–9 sem",
    "posologie_sujet_age": "Débuter à 150 mg/j. Risque convulsions ↑ dose-dépendant.",
    "notes_cliniques": "CI si ATCD épilepsie/troubles alimentaires",
    "source": "RCP Wellbutrin/Zyban ; HAS 2017"
  },
  {
    "medicament": "Buspirone",
    "classe_pharmacologique": "Anxiolytique non benzodiazépinique",
    "posologie_adulte": "5 mg x3/j PO → 15–30 mg/j (max 60 mg/j)",
    "posologie_sujet_age": "Débuter à 2,5–5 mg x2/j. Pas de dépendance. Alternative BZD chez SA. Délai 2–4 sem.",
    "notes_cliniques": "Délai 2–4 sem. Pas de sevrage ni dépendance.",
    "source": "RCP Buspar ; HAS anxiété 2017"
  },
  {
    "medicament": "Mirtazapine",
    "classe_pharmacologique": "Antidépresseur NaSSA",
    "posologie_adulte": "15 mg au coucher PO → 30–45 mg/j (max 45 mg/j)",
    "posologie_sujet_age": "Débuter à 7,5–15 mg au coucher. Stimule appétit (bénéfique si dénutrition). Sédation à faible dose.",
    "notes_cliniques": "Stimulation appétit utile chez SA dénutri. Moins sédatif à forte dose.",
    "source": "RCP Norset ; HAS 2017"
  },
  {
    "medicament": "Liotrix",
    "classe_pharmacologique": "Hormone thyroïdienne (T4+T3 combinées)",
    "posologie_adulte": "Dose individuelle selon TSH (T4 + T3 en proportion fixe)",
    "posologie_sujet_age": "Même principe. Prudence arythmie. Usage très limité.",
    "notes_cliniques": "Usage très limité. Préférer lévothyroxine.",
    "source": "RCP Euthyral ; HAS 2019"
  },
  {
    "medicament": "Cimétidine",
    "classe_pharmacologique": "Antihistaminique H2",
    "posologie_adulte": "400–800 mg au coucher PO ; UGD : 400 mg x2/j ou 800 mg/soir",
    "posologie_sujet_age": "Réduire de 50%. Confusion/effets antiandrogéniques. Inhibiteur CYP nombreux. Préférer IPP. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Nombreuses interactions CYP. Préférer IPP. Beers 2023 : À ÉVITER.",
    "source": "RCP Tagamet ; HAS 2020 ; Beers 2023"
  },
  {
    "medicament": "Famotidine",
    "classe_pharmacologique": "Antihistaminique H2",
    "posologie_adulte": "20 mg x2/j ou 40 mg/soir PO ; max 40 mg x2/j",
    "posologie_sujet_age": "Réduire de 50% si DFG<30. Moins d'interactions que cimétidine.",
    "notes_cliniques": "Moins d'interactions que cimétidine. Ajustement IRC.",
    "source": "RCP Pepcid ; HAS 2020"
  },
  {
    "medicament": "Cilostazol",
    "classe_pharmacologique": "Inhibiteur phosphodiestérase 3 / Antiagrégant",
    "posologie_adulte": "100 mg x2/j PO (avant repas)",
    "posologie_sujet_age": "Même dose. CI si IC. Prudence tachycardie/arythmie. Réduire à 50 mg x2/j si inhibiteurs CYP3A4/2C19.",
    "notes_cliniques": "CI si IC (quelque soit le stade). Prise 30 min avant repas.",
    "source": "RCP Pletal ; ESC artériopathie 2017"
  },
  {
    "medicament": "Aprépitant",
    "classe_pharmacologique": "Antagoniste NK1 (antiémétique)",
    "posologie_adulte": "125 mg J1, 80 mg J2 et J3 PO (antiémèse chimio) ; 40 mg/prise (anesthésie)",
    "posologie_sujet_age": "Même dose. Pas d'ajustement à l'âge.",
    "notes_cliniques": "Usage court (3 jours). Inducteur CYP3A4 modéré.",
    "source": "RCP Emend ; HAS 2022"
  },
  {
    "medicament": "Fosaprepitant",
    "classe_pharmacologique": "Antagoniste NK1 IV (prodrogue aprépitant)",
    "posologie_adulte": "150 mg IV J1 (prise unique) ou 115 mg IV J1 + aprépitant 80 mg J2–J3",
    "posologie_sujet_age": "Même dose. Pas d'ajustement à l'âge.",
    "notes_cliniques": "Usage hospitalier IV. Prodrogue aprépitant.",
    "source": "RCP Ivemend ; HAS 2022"
  },
  {
    "medicament": "Casopitant",
    "classe_pharmacologique": "Antagoniste NK1 (antiémétique)",
    "posologie_adulte": "Non disponible en France (développement arrêté)",
    "posologie_sujet_age": "Non disponible.",
    "notes_cliniques": "Non commercialisé en France",
    "source": "Développement arrêté (GSK)"
  },
  {
    "medicament": "Miglitinide",
    "classe_pharmacologique": "Glinide",
    "posologie_adulte": "10 mg x3/j PO (avant repas) ; max 10–30 mg/repas selon formulation",
    "posologie_sujet_age": "Débuter à 5 mg/repas. Titration lente. Risque hypoglycémie ↑.",
    "notes_cliniques": "Hypoglycémie si repas sauté. Usage limité en France.",
    "source": "RCP classe glinides ; HAS DT2 2023"
  },
  {
    "medicament": "Nateglinide",
    "classe_pharmacologique": "Glinide",
    "posologie_adulte": "60–120 mg x3/j PO (immédiatement avant repas) ; max 120 mg x3/j",
    "posologie_sujet_age": "Débuter à 60 mg x3/j. Prudence hypoglycémie. CI si IH sévère.",
    "notes_cliniques": "Prendre immédiatement avant repas. CI si repas sauté.",
    "source": "RCP Starlix ; HAS DT2 2023"
  },
  {
    "medicament": "Benzbromarone",
    "classe_pharmacologique": "Uricosurique",
    "posologie_adulte": "50 mg/j PO → 100–200 mg/j",
    "posologie_sujet_age": "Même dose. CI si DFG<20. Surveillance hépatique obligatoire (hépatotoxicité fatale).",
    "notes_cliniques": "Surveillance hépatique tous les 3 mois la 1ère année. ANSM usage restreint.",
    "source": "RCP Désuric ; SFR 2020 ; ANSM"
  },
  {
    "medicament": "Albendazole",
    "classe_pharmacologique": "Anthelminthique (benzimidazole)",
    "posologie_adulte": "Échinococcose : 400 mg x2/j PO (par cycles de 28 j) ; Ascaridiose/oxyurose : 400 mg dose unique",
    "posologie_sujet_age": "Même dose. Surveillance NFS/bilan hépatique rapprochée.",
    "notes_cliniques": "À prendre avec repas gras (absorption ↑)",
    "source": "RCP Zentel ; HAS parasitoses 2019"
  },
  {
    "medicament": "Oxybutynine",
    "classe_pharmacologique": "Antimuscarinique urinaire",
    "posologie_adulte": "2,5–5 mg x2–3/j PO (IR) ou 5–15 mg/j (LP)",
    "posologie_sujet_age": "Débuter à 2,5 mg x1–2/j. Effets anticholinergiques (confusion, rétention, constipation) fréquents. Beers 2023 : À ÉVITER si possible.",
    "notes_cliniques": "Beers 2023 : À ÉVITER (confusion cognitive, rétention). Préférer solifénacine ou mirabégron.",
    "source": "RCP Ditropan ; EAU OAB 2023 ; Beers 2023"
  },
  {
    "medicament": "Solifénacine",
    "classe_pharmacologique": "Antimuscarinique urinaire",
    "posologie_adulte": "5 mg/j PO → 10 mg/j",
    "posologie_sujet_age": "Même dose. Moins d'effets anticholinergiques centraux. Prudence QTc.",
    "notes_cliniques": "5 mg/j si DFG<30 ou inhibiteurs CYP3A4 forts",
    "source": "RCP Vesicare ; EAU OAB 2023"
  },
  {
    "medicament": "Toltérodine",
    "classe_pharmacologique": "Antimuscarinique urinaire",
    "posologie_adulte": "2 mg x2/j PO (IR) ou 4 mg/j (LP)",
    "posologie_sujet_age": "1 mg x2/j (IR) ou 2 mg/j (LP). Prudence QTc/IH.",
    "notes_cliniques": "Réduire de 50% si IH ou DFG<30",
    "source": "RCP Détrusitol ; EAU OAB 2023"
  },
  {
    "medicament": "Fésotérodine",
    "classe_pharmacologique": "Antimuscarinique urinaire",
    "posologie_adulte": "4 mg/j PO → 8 mg/j",
    "posologie_sujet_age": "4 mg/j (ne pas augmenter à 8 mg/j si DFG<30, IH modérée ou inhibiteurs CYP3A4).",
    "notes_cliniques": "Max 4 mg/j si DFG<30 ou IH modérée",
    "source": "RCP Toviaz ; EAU OAB 2023"
  },
  {
    "medicament": "Trospium",
    "classe_pharmacologique": "Antimuscarinique urinaire (ammonium quaternaire)",
    "posologie_adulte": "20 mg x2/j PO (IR) ou 60 mg/j (LP)",
    "posologie_sujet_age": "20 mg/j (1x/j). Réduction 50% si DFG<30. Peu de passage BHE → moins de confusion cognitive.",
    "notes_cliniques": "Peu de passage BHE → moins de confusion cognitive que autres antimuscariniques. Préféré chez SA.",
    "source": "RCP Ceris ; EAU OAB 2023"
  },
  {
    "medicament": "Amitriptyline",
    "classe_pharmacologique": "Antidépresseur tricyclique",
    "posologie_adulte": "Dépression : 75–150 mg/j PO (le soir) ; max 300 mg/j ; Douleurs neuropathiques : 10–75 mg/j",
    "posologie_sujet_age": "Débuter à 10–25 mg/j (le soir). Max 100 mg/j. Effets anticholinergiques ++ (rétention, constipation, confusion). Risque QTc ↑. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER (anticholinergique, arythmie, chutes). Taux plasmatique 80–200 ng/mL.",
    "source": "RCP Laroxyl ; HAS 2017 ; Beers 2023"
  },
  {
    "medicament": "Clomipramine",
    "classe_pharmacologique": "Antidépresseur tricyclique",
    "posologie_adulte": "Dépression/TOC : 25 mg/j PO → 75–250 mg/j ; max 300 mg/j",
    "posologie_sujet_age": "Débuter à 10 mg/j. Max 75–150 mg/j. Beers 2023 : À ÉVITER. Risque QTc/arythmie.",
    "notes_cliniques": "Beers 2023 : À ÉVITER. Taux plasmatique 230–450 ng/mL.",
    "source": "RCP Anafranil ; HAS 2017 ; Beers 2023"
  },
  {
    "medicament": "Imipramine",
    "classe_pharmacologique": "Antidépresseur tricyclique",
    "posologie_adulte": "Dépression : 75–200 mg/j PO ; Énurésie : 25–75 mg au coucher ; max 300 mg/j",
    "posologie_sujet_age": "Débuter à 10–25 mg/j. Max 100 mg/j. Beers 2023 : À ÉVITER. Risque QTc/hypotension.",
    "notes_cliniques": "Beers 2023 : À ÉVITER. Hypotension orthostatique fréquente.",
    "source": "RCP Tofranil ; HAS 2017 ; Beers 2023"
  },
  {
    "medicament": "Doxépine",
    "classe_pharmacologique": "Antidépresseur tricyclique",
    "posologie_adulte": "Dépression : 75–150 mg/j PO (le soir) ; max 300 mg/j ; Insomnie (faible dose) : 3–6 mg",
    "posologie_sujet_age": "Débuter à 10 mg/j. Faible dose insomnie (3 mg) mieux tolérée. Beers 2023 : À ÉVITER si >6 mg/j.",
    "notes_cliniques": "Beers 2023 : À ÉVITER >6 mg/j. Faible dose (≤6 mg) pour insomnie SA acceptable.",
    "source": "RCP Quitaxon ; HAS 2017 ; Beers 2023"
  },
  {
    "medicament": "Trimipramine",
    "classe_pharmacologique": "Antidépresseur tricyclique",
    "posologie_adulte": "Dépression : 75–200 mg/j PO ; max 300 mg/j",
    "posologie_sujet_age": "Débuter à 25 mg/j. Max 100–150 mg/j. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER (anticholinergique, QTc, chutes).",
    "source": "RCP Surmontil ; HAS 2017 ; Beers 2023"
  },
  {
    "medicament": "Hydroxyzine",
    "classe_pharmacologique": "Antihistaminique H1 sédatif (anxiolytique)",
    "posologie_adulte": "Anxiété : 25–100 mg x3/j PO ; Prémédication : 50–100 mg ; Prurit : 25 mg x3/j",
    "posologie_sujet_age": "Débuter à 25 mg x1–2/j. Max 50 mg/j. Allongement QTc. Sedation ↑. Rétention urinaire. Prudence.",
    "notes_cliniques": "Max posologie SA : ANSM 2015 (QTc). EMA 2015.",
    "source": "RCP Atarax ; ANSM/EMA 2015"
  },
  {
    "medicament": "Doxylamine",
    "classe_pharmacologique": "Antihistaminique H1 sédatif",
    "posologie_adulte": "Insomnie : 15 mg au coucher PO (Donormyl) ; Nausées grossesse : 10 mg au coucher + 10 mg matin (Cariban)",
    "posologie_sujet_age": "Usage déconseillé (anticholinergique, sédation résiduelle). Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER chez SA. Anticholinergique.",
    "source": "RCP Donormyl ; Beers 2023"
  },
  {
    "medicament": "Prométhazine",
    "classe_pharmacologique": "Phénothiazine antihistaminique H1 sédatif",
    "posologie_adulte": "Allergie/prurit : 25 mg x2/j PO ou 25 mg au coucher ; Antiémétique : 25 mg/prise ; max 100 mg/j",
    "posologie_sujet_age": "Débuter à 6,25–12,5 mg/j. Beers 2023 : À ÉVITER. Risque EPS, sédation, confusion, rétention urinaire, QTc.",
    "notes_cliniques": "Beers 2023 : À ÉVITER (EPS, QTc, sédation, anticholinergique).",
    "source": "RCP Phénergan ; Beers 2023"
  },
  {
    "medicament": "Alimémazine",
    "classe_pharmacologique": "Phénothiazine antihistaminique H1 sédatif",
    "posologie_adulte": "Allergie/prurit : 5–10 mg x2–3/j PO ; Sédation : 5–20 mg au coucher ; max 40 mg/j",
    "posologie_sujet_age": "Débuter à 5 mg/j. Risque QTc/sédation/EPS. Usage déconseillé SA.",
    "notes_cliniques": "Risque QTc/sédation/EPS. Déconseillé SA.",
    "source": "RCP Théralène ; HAS"
  },
  {
    "medicament": "Dexchlorphéniramine",
    "classe_pharmacologique": "Antihistaminique H1 (1ère génération)",
    "posologie_adulte": "2 mg x3/j PO ; max 12 mg/j (LP : 6 mg x1–2/j)",
    "posologie_sujet_age": "Déconseillé SA (anticholinergique, sédation). Si nécessaire : 2 mg x1–2/j. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER (anticholinergique).",
    "source": "RCP Polaramine ; Beers 2023"
  },
  {
    "medicament": "Cyamémazine",
    "classe_pharmacologique": "Antipsychotique classique (phénothiazine)",
    "posologie_adulte": "Anxiété sévère : 25–75 mg/j PO ; Psychose : 100–300 mg/j",
    "posologie_sujet_age": "Débuter à 12,5–25 mg/j. Prudence sédation/hypotension/QTc.",
    "notes_cliniques": "Usage anxiolyse en psychiatrie (France)",
    "source": "RCP Tercian ; HAS 2017"
  },
  {
    "medicament": "Pipotiazine",
    "classe_pharmacologique": "Antipsychotique classique (phénothiazine)",
    "posologie_adulte": "PO : 10–30 mg/j ; Décanoate : 50–200 mg/4 sem IM ; Palmitate : 25–200 mg/4 sem IM",
    "posologie_sujet_age": "Réduire de 50%. EPS. Décanoate : espacement des injections.",
    "notes_cliniques": "Forme retard disponible (palmitate, décanoate)",
    "source": "RCP Piportil ; HAS 2017"
  },
  {
    "medicament": "Flupentixol",
    "classe_pharmacologique": "Antipsychotique classique (thioxanthène)",
    "posologie_adulte": "PO : 6–18 mg/j ; Dépôt : 20–40 mg/2–4 sem IM",
    "posologie_sujet_age": "Débuter à 1–2 mg/j PO. Prudence EPS/hypotension.",
    "notes_cliniques": "Usage dépression résistante à faible dose (off-label)",
    "source": "RCP Fluanxol ; HAS 2017"
  },
  {
    "medicament": "Zuclopenthixol",
    "classe_pharmacologique": "Antipsychotique classique (thioxanthène)",
    "posologie_adulte": "PO : 20–50 mg/j (3 prises) ; Acuphase : 50–150 mg IM (répétable à 72h) ; Décanoate : 200–400 mg/2–4 sem IM",
    "posologie_sujet_age": "Réduire de 50–75% PO. Acuphase : 50 mg maximum. Prudence sédation/EPS/hypotension.",
    "notes_cliniques": "Acuphase (acétate) : agitation aiguë — effet 72h",
    "source": "RCP Clopixol ; HAS 2017"
  },
  {
    "medicament": "Trihexyphénidyle",
    "classe_pharmacologique": "Antiparkinsonien anticholinergique",
    "posologie_adulte": "Parkinson/EPS : 2 mg/j PO → 6–10 mg/j (3 prises) ; max 15 mg/j",
    "posologie_sujet_age": "Débuter à 1 mg/j. Max 6 mg/j. Risque : confusion, rétention urinaire, glaucome, hallucinations. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER (confusion, hallucinations, rétention urinaire, glaucome).",
    "source": "RCP Artane ; HAS Parkinson 2016 ; Beers 2023"
  },
  {
    "medicament": "Tropatépine",
    "classe_pharmacologique": "Antiparkinsonien anticholinergique",
    "posologie_adulte": "EPS : 5–10 mg x2–3/j PO",
    "posologie_sujet_age": "Débuter à 5 mg/j. Mêmes risques anticholinergiques. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER. Même profil que trihexyphénidyle.",
    "source": "RCP Lepticur ; HAS Parkinson 2016"
  },
  {
    "medicament": "Bipéridène",
    "classe_pharmacologique": "Antiparkinsonien anticholinergique",
    "posologie_adulte": "Parkinson/EPS : 2 mg x3/j PO → 12–16 mg/j ; IM/IV : 2–4 mg",
    "posologie_sujet_age": "Débuter à 1 mg/j. Même profil anticholinergique. Beers 2023 : À ÉVITER.",
    "notes_cliniques": "Beers 2023 : À ÉVITER. Anticholinergique fort.",
    "source": "RCP Akineton ; HAS Parkinson 2016 ; Beers 2023"
  },
  {
    "medicament": "Scopolamine",
    "classe_pharmacologique": "Anticholinergique (hyoscine)",
    "posologie_adulte": "Patch : 1,5 mg/72h (mal des transports) ; SC/IV : 0,2–0,6 mg/prise (soins palliatifs)",
    "posologie_sujet_age": "Patch : demi-dose (0,75 mg patch) ou 1,5 mg toutes les 96h. Confusion/sédation fréquentes. Usage principalement palliatif.",
    "notes_cliniques": "Effets anticholinergiques marqués. Usage palliatif/MAV.",
    "source": "RCP Scopoderm"
  },
  {
    "medicament": "Tiémonium",
    "classe_pharmacologique": "Antispasmodique anticholinergique",
    "posologie_adulte": "50 mg x2–4/j PO ou 25–50 mg IM",
    "posologie_sujet_age": "Débuter à 50 mg x2/j. Prudence rétention urinaire (prostate). Effets anticholinergiques limités.",
    "notes_cliniques": "Peu de passage BHE → moins de confusion centrale",
    "source": "RCP Viscéralgine"
  },
  {
    "medicament": "Atropine",
    "classe_pharmacologique": "Anticholinergique",
    "posologie_adulte": "Bradycardie : 0,5–1 mg IV (répéter toutes les 5 min, max 3 mg) ; Prémédication : 0,5 mg IM ; Collyre : 0,3–1%",
    "posologie_sujet_age": "Usage IV : même schéma. Prudence : tachycardie, rétention urinaire, glaucome, confusion. Collyre : même posologie.",
    "notes_cliniques": "Usage hospitalier principalement (ACLS). Collyre : mydriase/cycloplégie.",
    "source": "RCP Atropine"
  },
  {
    "medicament": "Digoxine",
    "classe_pharmacologique": "Cardiotonique (glycoside)",
    "posologie_adulte": "FA : 0,125–0,250 mg/j PO (taux cible 0,5–0,9 ng/mL) ; IC : même dose",
    "posologie_sujet_age": "0,0625–0,125 mg/j (demi-dose ou moins). Taux cible 0,5–0,8 ng/mL. Risque toxicité ↑↑ (hypokaliémie, IRC). Surveillance étroite.",
    "notes_cliniques": "SA : demi-dose + taux résiduel 0,5–0,8 ng/mL. Toxicité augmentée par hypokaliémie/IRC.",
    "source": "RCP Digoxine ; ESC HF 2021 ; ESC FA 2020"
  },
  {
    "medicament": "Aténolol + Chlortalidone",
    "classe_pharmacologique": "Bêta-bloquant + Thiazidique (association fixe)",
    "posologie_adulte": "HTA : 50/12,5 mg/j PO → 100/25 mg/j",
    "posologie_sujet_age": "Débuter à 50/12,5 mg/j. Surveillance ionogramme/créatinine/glycémie/FC/TA.",
    "notes_cliniques": "Ajustement IRC (aténolol élimination rénale). Risque hypokaliémie (chlortalidone).",
    "source": "RCP Tenoretic ; ESC HTA 2023"
  },
  {
    "medicament": "Métoclopramide",
    "classe_pharmacologique": "Prokinétique / Antiémétique (antagoniste D2)",
    "posologie_adulte": "5–10 mg x3/j PO/IV (max 30 mg/j) ; max 5 jours selon ANSM",
    "posologie_sujet_age": "Débuter à 5 mg x2/j. Max 5 jours (ANSM). Risque EPS/dyskinésie tardive ↑. Beers 2023 : À ÉVITER au long cours.",
    "notes_cliniques": "ANSM 2013 : max 5 jours. Beers 2023 : À ÉVITER au long cours (dyskinésie tardive).",
    "source": "RCP Primpéran ; ANSM 2013 ; Beers 2023"
  },
  {
    "medicament": "Lopéramide",
    "classe_pharmacologique": "Antidiarrhéique (agoniste µ-opioïde périphérique)",
    "posologie_adulte": "2 mg après chaque selle molle (max 16 mg/j) ; diarrhée aiguë : 4 mg puis 2 mg",
    "posologie_sujet_age": "Même dose. Max 6–8 mg/j prudence. Risque QTc à doses élevées.",
    "notes_cliniques": "Risque QTc/arythmie à doses suprathérapeutiques (ANSM 2017). Usage ≤2 jours si aigu.",
    "source": "RCP Imodium ; ANSM 2017"
  },
  {
    "medicament": "Thiocolchicoside",
    "classe_pharmacologique": "Myorelaxant (dérivé colchicine)",
    "posologie_adulte": "4–8 mg x2/j PO ou 4 mg x2/j IM ; max 7 jours",
    "posologie_sujet_age": "Même dose. Usage court (max 7 jours). Prudence sédation légère.",
    "notes_cliniques": "ANSM : max 7 jours (génotoxicité potentielle). Usage lombalgies aiguës.",
    "source": "RCP Miorel ; ANSM 2013"
  },
  {
    "medicament": "Méthocarbamol",
    "classe_pharmacologique": "Myorelaxant central",
    "posologie_adulte": "1500 mg x3–4/j PO → 750 mg x3/j (entretien) ; IV : 1–3 g/j",
    "posologie_sujet_age": "Débuter à 750 mg x2/j. Prudence sédation, vertige, confusion.",
    "notes_cliniques": "Sédation fréquente. Usage lombalgies/contractures.",
    "source": "RCP Lumirelax"
  }
];