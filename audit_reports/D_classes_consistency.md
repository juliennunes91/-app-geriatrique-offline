# AUDIT D — Cohérence par classe (point littérature)
Date : 2026-05-16T09:39:46.600Z

## Méthodologie

Pour chaque classe thérapeutique, vérifier homogénéité de **profil de surveillance** (bio_cible, qt_risque, acb, alerte_clinique pivots). Les écarts identifiés sont **soit légitimes** (effet singleton documenté), **soit incohérents** (à uniformiser).

## Synthèse par classe — médicaments × profil de surveillance

| Classe | N | BIO_cible communs (top 3) | qt_risque % | acb=3 | Singleton à noter |
|---|---|---|---|---|---|
| β-bloquants | 19 | BIO_031 (18/19), BIO_025 (13/19), BIO_003 (8/19) | 0% | 0 | Sotalol = QTc Risk_RE (vs β-bloquants standard) |
| AVK | 3 | BIO_030 (3/3), BIO_009 (3/3), BIO_013 (3/3) | 0% | 0 | Fluindione : NIH immuno-allergique (ANSM 2018 — restrictions France) |
| Bisphosphonates | 5 | BIO_005 (5/5), BIO_023 (5/5), BIO_003 (5/5) | 0% | 0 | - |
| Antihistaminiques H1 1ère gén | 11 | BIO_031 (11/11), BIO_009 (2/11), BIO_011 (2/11) | 100% | 10 | - |
| IDPP-4 | 5 | BIO_025 (5/5), BIO_026 (5/5), BIO_003 (4/5) | 0% | 0 | - |
| BZD | 20 | BIO_013 (20/20), BIO_014 (20/20), BIO_009 (5/20) | 5% | 1 | Nitrazépam demi-vie 25-35h PIM ABSOLU |
| Antipsychotiques SGA | 8 | BIO_009 (8/8), BIO_011 (8/8), BIO_031 (8/8) | 100% | 2 | - |
| Antidépresseurs tricycliques | 10 | BIO_031 (10/10), BIO_013 (10/10), BIO_014 (10/10) | 100% | 8 | - |
| CCB DHP | 12 | BIO_013 (5/12), BIO_014 (5/12), BIO_031 (5/12) | 33% | 0 | Nimodipine = indication unique HSA anévrismale (BHE+++) |
| AOD | 4 | BIO_003 (4/4), BIO_004 (4/4), BIO_013 (4/4) | 0% | 0 | - |
| Statines | 5 | BIO_013 (5/5), BIO_014 (5/5), BIO_018 (5/5) | 0% | 0 | - |
| ICS | 4 | BIO_023 (4/4), BIO_025 (2/4) | 0% | 0 | - |
| IEC | 12 | BIO_003 (12/12), BIO_004 (12/12), BIO_001 (12/12) | 0% | 0 | - |
| Diurétiques anse | 4 | BIO_001 (4/4), BIO_002 (4/4), BIO_003 (4/4) | 50% | 0 | - |
| iSGLT2 | 4 | BIO_025 (4/4), BIO_026 (4/4), BIO_003 (4/4) | 0% | 0 | - |
| ARA2 | 8 | BIO_003 (8/8), BIO_004 (8/8), BIO_001 (8/8) | 0% | 0 | - |
| Antiépileptiques | 14 | BIO_013 (12/14), BIO_009 (11/14), BIO_014 (11/14) | 29% | 0 | - |
| Antithyroïdiens | 3 | BIO_019 (3/3), BIO_012 (3/3), BIO_011 (3/3) | 0% | 0 | - |
| AINS | 15 | BIO_003 (14/15), BIO_009 (14/15), BIO_004 (14/15) | 0% | 0 | Piroxicam demi-vie > 50h PIM ABSOLU |
| Antihistaminiques H1 2ème gén | 5 | BIO_003 (3/5), BIO_013 (1/5), BIO_014 (1/5) | 0% | 0 | - |
| Antipsychotiques FGA | 16 | BIO_009 (16/16), BIO_011 (16/16), BIO_031 (16/16) | 100% | 8 | Thioridazine retirée QTc Risk_RE |
| Diurétiques thiazidique | 5 | BIO_001 (5/5), BIO_002 (5/5), BIO_003 (5/5) | 60% | 0 | - |
| ISRS | 11 | BIO_013 (8/11), BIO_014 (8/11), BIO_002 (7/11) | 45% | 1 | Citalopram/Escitalopram = QTc Risk_KR (vs autres ISRS Risk_CR/PR) |
| Opioïdes faibles | 4 | BIO_013 (4/4), BIO_014 (4/4), BIO_003 (4/4) | 25% | 0 | - |
| Anticholinergiques urinaires | 9 | BIO_003 (8/9), BIO_031 (6/9), BIO_013 (4/9) | 44% | 7 | - |
| GLP-1 RA | 5 | BIO_025 (5/5), BIO_026 (5/5), BIO_003 (5/5) | 0% | 0 | - |
| Triptans | 5 | BIO_031 (5/5), BIO_013 (2/5), BIO_014 (2/5) | 40% | 0 | - |
| IPP | 6 | BIO_006 (5/6), BIO_021 (5/6), BIO_031 (5/6) | 83% | 0 | Ésoméprazole inhibiteur CYP2C19 puissant — éviter clopidogrel • Pantoprazole peu CYP2C19 — préférer avec clopidogrel |
| Opioïdes forts | 5 | BIO_013 (5/5), BIO_014 (5/5), BIO_003 (5/5) | 0% | 0 | - |
| LABA | 3 | BIO_001 (3/3), BIO_031 (3/3) | 100% | 0 | Indacatérol = uLABA BPCO uniquement (pas AMM asthme) |
| LAMA | 2 |  | 0% | 0 | - |
| Insulines | 7 | BIO_026 (7/7), BIO_025 (7/7), BIO_003 (5/7) | 0% | 0 | - |
| Corticoïdes systémiques | 4 | BIO_025 (4/4), BIO_026 (4/4), BIO_001 (4/4) | 0% | 0 | - |
| Glinides | 3 | BIO_025 (2/3), BIO_026 (2/3), BIO_013 (2/3) | 0% | 0 | - |
| SABA | 2 | BIO_001 (2/2), BIO_031 (2/2) | 100% | 0 | - |
| IRSN | 1 | BIO_002 (1/1), BIO_013 (1/1), BIO_014 (1/1) | 0% | 0 | - |
| Sulfamides hypogly | 3 | BIO_025 (3/3), BIO_026 (3/3), BIO_003 (3/3) | 0% | 0 | Glibenclamide PIM ABSOLU Beers (hypoglycémie prolongée) |
| Z-drugs | 1 |  | 0% | 0 | - |

## Trous de surveillance par classe (incohérences)

- AINS : 1/15 medicaments sans BIO_003 → Paracetamol
- AINS : 1/15 medicaments sans BIO_001 → Paracetamol
- Diurétiques thiazidique : 1/5 medicaments sans BIO_008 → Aldactazine
- Antipsychotiques FGA : 1/16 medicaments sans BIO_018 → Thioridazine
- Antipsychotiques FGA : 4/16 medicaments sans BIO_025 → Levomepromazine, Perphenazine, Prochlorperazine, Trifluoperazine
- Antipsychotiques SGA : 1/8 medicaments sans BIO_018 → Clozapine
- Antipsychotiques SGA : 1/8 medicaments sans BIO_025 → Tiapride
- Antipsychotiques SGA : 1/8 medicaments sans BIO_026 → Tiapride
- Antipsychotiques SGA : 1/8 medicaments sans BIO_027 → Tiapride
- ISRS : 4/11 medicaments sans BIO_002 → Febuxostat, Mycophenolate mofetil, Fondaparinux, Finastéride
- IPP : 1/6 medicaments sans BIO_006 → Pidolate de calcium