# Audit structurel — base GeriaAssist
Date : 2026-05-04T09:07:44.296Z

## Synthèse
- Médicaments scannés : **556**
- Biologies : **44**
- Pathologies : **42** (master) / **54** (rules)
- Syndromes : **51**
- Erreurs : **0** | Avertissements : **21** | Infos : **90**
- Total findings : **111**


## MED (98)

1. [WRN] **[STR-CLASS-DIUR]** MED[183] Eplerenone
   - Diurétique sans BIO_002 (Natrémie)
2. [WRN] **[STR-CLASS-DIUR]** MED[346] Piretanide
   - Diurétique sans BIO_002 (Natrémie)
3. [WRN] **[STR-CLASS-DIUR]** MED[433] Triamterene
   - Diurétique sans BIO_002 (Natrémie)
4. [WRN] **[STR-CLASS-MTX]** MED[490] Methotrexate
   - Méthotrexate sans BIO_010 (Plaquettes)
5. [WRN] **[STR-CLASS-MTX]** MED[490] Methotrexate
   - Méthotrexate sans BIO_011 (Leucocytes)
6. [WRN] **[STR-MED-COH-INR]** MED[28] Apixaban
   - Texte mentionne "INR" mais BIO_030 absent de bio_cible
7. [WRN] **[STR-MED-COH-INR]** MED[294] Metronidazole
   - Texte mentionne "INR" mais BIO_030 absent de bio_cible
8. [WRN] **[STR-MED-COH-INR]** MED[376] Ritonavir
   - Texte mentionne "INR" mais BIO_030 absent de bio_cible
9. [WRN] **[STR-MED-COH-INR]** MED[394] Spiramycine + metronidazole
   - Texte mentionne "INR" mais BIO_030 absent de bio_cible
10. [INF] **[STR-MED-COH-CPK]** MED[20] Amisulpride
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
11. [INF] **[STR-MED-COH-CPK]** MED[31] Aripiprazole
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
12. [INF] **[STR-MED-COH-CPK]** MED[33] Asenapine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
13. [INF] **[STR-MED-COH-CPK]** MED[104] Chlorpromazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
14. [INF] **[STR-MED-COH-CPK]** MED[136] Cyamemazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
15. [INF] **[STR-MED-COH-CPK]** MED[188] Erythromycine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
16. [INF] **[STR-MED-COH-CPK]** MED[207] Flupentixol
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
17. [INF] **[STR-MED-COH-CPK]** MED[208] Fluphenazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
18. [INF] **[STR-MED-COH-CPK]** MED[223] Haloperidol
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
19. [INF] **[STR-MED-COH-CPK]** MED[262] Levomepromazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
20. [INF] **[STR-MED-COH-CPK]** MED[263] Levomethopromazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
21. [INF] **[STR-MED-COH-CPK]** MED[278] Loxapine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
22. [INF] **[STR-MED-COH-CPK]** MED[320] Olanzapine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
23. [INF] **[STR-MED-COH-CPK]** MED[330] Paliperidone
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
24. [INF] **[STR-MED-COH-CPK]** MED[335] Perphenazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
25. [INF] **[STR-MED-COH-CPK]** MED[340] Pimozide
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
26. [INF] **[STR-MED-COH-CPK]** MED[342] Pipamperone
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
27. [INF] **[STR-MED-COH-CPK]** MED[345] Pipotiazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
28. [INF] **[STR-MED-COH-CPK]** MED[358] Prochlorperazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
29. [INF] **[STR-MED-COH-CPK]** MED[366] Quetiapine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
30. [INF] **[STR-MED-COH-CPK]** MED[375] Risperidone
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
31. [INF] **[STR-MED-COH-CPK]** MED[398] Sulpiride
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
32. [INF] **[STR-MED-COH-CPK]** MED[413] Tiapride
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
33. [INF] **[STR-MED-COH-CPK]** MED[434] Trifluoperazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
34. [INF] **[STR-MED-COH-CPK]** MED[456] Zuclopenthixol
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
35. [INF] **[STR-MED-COH-QT]** MED[139] Cyproheptadine
   - Texte mentionne QT/QTc mais BIO_031 absent
36. [INF] **[STR-MED-COH-QT]** MED[201] Fesoterodine
   - Texte mentionne QT/QTc mais BIO_031 absent
37. [INF] **[STR-MED-COH-QT]** MED[270] Lithium
   - Texte mentionne QT/QTc mais BIO_031 absent
38. [INF] **[STR-MED-COH-QT]** MED[357] Pristinamycine
   - Texte mentionne QT/QTc mais BIO_031 absent
39. [INF] **[STR-MED-COH-QT]** MED[386] Sertraline
   - Texte mentionne QT/QTc mais BIO_031 absent
40. [INF] **[STR-MED-COH-QT]** MED[483] Desvenlafaxine
   - Texte mentionne QT/QTc mais BIO_031 absent
41. [INF] **[STR-MED-COH-QT]** MED[553] Pimavansérine
   - Texte mentionne QT/QTc mais BIO_031 absent
42. [INF] **[STR-MED-COH-QT]** MED[554] Vortioxétine
   - Texte mentionne QT/QTc mais BIO_031 absent
43. [INF] **[STR-MED-POSREN]** MED[7] Alfacalcidol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adaptation necessaire"
44. [INF] **[STR-MED-POSREN]** MED[9] Alimemazine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
45. [INF] **[STR-MED-POSREN]** MED[39] Atropine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "N/A (absorption systemique faible mais possible)"
46. [INF] **[STR-MED-POSREN]** MED[45] Bedaquiline
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC severe"
47. [INF] **[STR-MED-POSREN]** MED[46] Belladonna
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adapter si IRC severe"
48. [INF] **[STR-MED-POSREN]** MED[54] Biperidene
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence majeure"
49. [INF] **[STR-MED-POSREN]** MED[63] Brompheniramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
50. [INF] **[STR-MED-POSREN]** MED[69] Calcifediol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adaptation"
51. [INF] **[STR-MED-POSREN]** MED[70] Calcitriol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adaptation"
52. [INF] **[STR-MED-POSREN]** MED[77] Carbinoxamine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
53. [INF] **[STR-MED-POSREN]** MED[100] Cetirizine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Si eGFR <50: 5mg/j"
54. [INF] **[STR-MED-POSREN]** MED[111] Ciclosporine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Monitoring taux"
55. [INF] **[STR-MED-POSREN]** MED[113] Cilostazol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Reduction si IRC moderee"
56. [INF] **[STR-MED-POSREN]** MED[114] Cimetidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Reduction si IRC"
57. [INF] **[STR-MED-POSREN]** MED[118] Clemastine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
58. [INF] **[STR-MED-POSREN]** MED[123] Clomipramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence (augmentation demi-vie)"
59. [INF] **[STR-MED-POSREN]** MED[136] Cyamemazine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
60. [INF] **[STR-MED-POSREN]** MED[153] Dexchlorpheniramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
61. [INF] **[STR-MED-POSREN]** MED[160] Dimenhydrinate
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
62. [INF] **[STR-MED-POSREN]** MED[161] Diphenhydramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
63. [INF] **[STR-MED-POSREN]** MED[169] Doxepine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
64. [INF] **[STR-MED-POSREN]** MED[171] Doxylamine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence (risque de retention et sedation accrue)"
65. [INF] **[STR-MED-POSREN]** MED[179] Emtricitabine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Reduction si eGFR <30"
66. [INF] **[STR-MED-POSREN]** MED[196] Famotidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Si eGFR <30: 20mg/j"
67. [INF] **[STR-MED-POSREN]** MED[207] Flupentixol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
68. [INF] **[STR-MED-POSREN]** MED[233] Imipramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
69. [INF] **[STR-MED-POSREN]** MED[237] Insuline degludec
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Surveillance"
70. [INF] **[STR-MED-POSREN]** MED[238] Insuline detemir
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Surveillance"
71. [INF] **[STR-MED-POSREN]** MED[290] Methocarbamol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si insuffisance renale severe"
72. [INF] **[STR-MED-POSREN]** MED[298] Minocycline
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC severe"
73. [INF] **[STR-MED-POSREN]** MED[312] Nimodipine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Surveillance"
74. [INF] **[STR-MED-POSREN]** MED[328] Oxybutynine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence (risque d'accumulation des metabolites)"
75. [INF] **[STR-MED-POSREN]** MED[345] Pipotiazine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
76. [INF] **[STR-MED-POSREN]** MED[359] Promethazine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
77. [INF] **[STR-MED-POSREN]** MED[371] Ranitidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "RETIRE DU MARCHE - ne pas prescrire"
78. [INF] **[STR-MED-POSREN]** MED[383] Scopolamine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence (effets centraux accrus)"
79. [INF] **[STR-MED-POSREN]** MED[400] Tacrolimus
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Monitoring taux"
80. [INF] **[STR-MED-POSREN]** MED[411] Thiocolchicoside
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
81. [INF] **[STR-MED-POSREN]** MED[416] Tiemonium
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
82. [INF] **[STR-MED-POSREN]** MED[435] Trihexyphenidyl
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence majeure (accumulation)"
83. [INF] **[STR-MED-POSREN]** MED[436] Trihexyphenidyle
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence majeure (accumulation)"
84. [INF] **[STR-MED-POSREN]** MED[438] Trimipramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
85. [INF] **[STR-MED-POSREN]** MED[439] Triprolidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC severe (peu de donnees)"
86. [INF] **[STR-MED-POSREN]** MED[440] Tropatepine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence majeure"
87. [INF] **[STR-MED-POSREN]** MED[444] Valpromide
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adapter si IRC severe (valproate libre augmente si IRC)"
88. [INF] **[STR-MED-POSREN]** MED[456] Zuclopenthixol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
89. [INF] **[STR-MED-POSREN]** MED[484] Dosulpine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC sévère."
90. [INF] **[STR-MED-POSREN]** MED[520] Rilmenidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC (elimination renale partielle)"
91. [INF] **[STR-MED-POSREN]** MED[526] Phenytoine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Ajuster selon phenytoinemie libre si IRC (liaison albumine diminuee)"
92. [INF] **[STR-MED-POSREN]** MED[527] Piribedil
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC severe"
93. [INF] **[STR-MED-POSREN]** MED[530] Pethidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "CI si IRC (accumulation norpethidine neurotoxique)"
94. [INF] **[STR-MED-POSREN]** MED[531] Meprobamate
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Sans objet (retire)"
95. [INF] **[STR-MED-POSREN]** MED[541] Betahistine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
96. [INF] **[STR-MED-POSREN]** MED[542] Naftidrofuryl
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
97. [INF] **[STR-MED-POSREN]** MED[543] Nicergoline
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
98. [INF] **[STR-MED-POSREN]** MED[546] Midodrine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC (accumulation metabolite actif)"

## PATH (13)

1. [WRN] **[STR-PATH-008]** RULES PAT_041
   - PATHOLOGY_RULES_DB.PAT_041 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
2. [WRN] **[STR-PATH-008]** RULES PAT_042
   - PATHOLOGY_RULES_DB.PAT_042 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
3. [WRN] **[STR-PATH-008]** RULES PAT_043
   - PATHOLOGY_RULES_DB.PAT_043 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
4. [WRN] **[STR-PATH-008]** RULES PAT_044
   - PATHOLOGY_RULES_DB.PAT_044 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
5. [WRN] **[STR-PATH-008]** RULES PAT_045
   - PATHOLOGY_RULES_DB.PAT_045 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
6. [WRN] **[STR-PATH-008]** RULES PAT_046
   - PATHOLOGY_RULES_DB.PAT_046 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
7. [WRN] **[STR-PATH-008]** RULES PAT_047
   - PATHOLOGY_RULES_DB.PAT_047 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
8. [WRN] **[STR-PATH-008]** RULES PAT_048
   - PATHOLOGY_RULES_DB.PAT_048 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
9. [WRN] **[STR-PATH-008]** RULES PAT_049
   - PATHOLOGY_RULES_DB.PAT_049 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
10. [WRN] **[STR-PATH-008]** RULES PAT_050
   - PATHOLOGY_RULES_DB.PAT_050 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
11. [WRN] **[STR-PATH-008]** RULES PAT_051
   - PATHOLOGY_RULES_DB.PAT_051 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
12. [WRN] **[STR-PATH-008]** RULES PAT_052
   - PATHOLOGY_RULES_DB.PAT_052 sans entrée dans MASTER_DB.PATHOLOGIES (autocomplete impossible)
13. [INF] **[STR-PATH-007]** PAT PAT_032 (Dépression)
   - Diverge NOM: rules="Dépression (sujet âgé / Late-Life Depression)" / master="Dépression"
