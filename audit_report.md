# Audit structurel — base GeriaAssist
Date : 2026-05-08T12:28:14.165Z

## Synthèse
- Médicaments scannés : **556**
- Biologies : **45**
- Pathologies : **53** (master) / **53** (rules)
- Syndromes : **51**
- Erreurs : **0** | Avertissements : **0** | Infos : **90**
- Total findings : **90**


## MED (89)

1. [INF] **[STR-MED-COH-CPK]** MED[20] Amisulpride
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
2. [INF] **[STR-MED-COH-CPK]** MED[31] Aripiprazole
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
3. [INF] **[STR-MED-COH-CPK]** MED[33] Asenapine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
4. [INF] **[STR-MED-COH-CPK]** MED[104] Chlorpromazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
5. [INF] **[STR-MED-COH-CPK]** MED[136] Cyamemazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
6. [INF] **[STR-MED-COH-CPK]** MED[188] Erythromycine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
7. [INF] **[STR-MED-COH-CPK]** MED[207] Flupentixol
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
8. [INF] **[STR-MED-COH-CPK]** MED[208] Fluphenazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
9. [INF] **[STR-MED-COH-CPK]** MED[223] Haloperidol
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
10. [INF] **[STR-MED-COH-CPK]** MED[262] Levomepromazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
11. [INF] **[STR-MED-COH-CPK]** MED[263] Levomethopromazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
12. [INF] **[STR-MED-COH-CPK]** MED[278] Loxapine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
13. [INF] **[STR-MED-COH-CPK]** MED[320] Olanzapine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
14. [INF] **[STR-MED-COH-CPK]** MED[330] Paliperidone
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
15. [INF] **[STR-MED-COH-CPK]** MED[335] Perphenazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
16. [INF] **[STR-MED-COH-CPK]** MED[340] Pimozide
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
17. [INF] **[STR-MED-COH-CPK]** MED[342] Pipamperone
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
18. [INF] **[STR-MED-COH-CPK]** MED[345] Pipotiazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
19. [INF] **[STR-MED-COH-CPK]** MED[358] Prochlorperazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
20. [INF] **[STR-MED-COH-CPK]** MED[366] Quetiapine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
21. [INF] **[STR-MED-COH-CPK]** MED[375] Risperidone
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
22. [INF] **[STR-MED-COH-CPK]** MED[398] Sulpiride
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
23. [INF] **[STR-MED-COH-CPK]** MED[413] Tiapride
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
24. [INF] **[STR-MED-COH-CPK]** MED[434] Trifluoperazine
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
25. [INF] **[STR-MED-COH-CPK]** MED[456] Zuclopenthixol
   - Texte mentionne CPK/rhabdo/myalgies mais BIO_018 absent
26. [INF] **[STR-MED-COH-QT]** MED[139] Cyproheptadine
   - Texte mentionne QT/QTc mais BIO_031 absent
27. [INF] **[STR-MED-COH-QT]** MED[201] Fesoterodine
   - Texte mentionne QT/QTc mais BIO_031 absent
28. [INF] **[STR-MED-COH-QT]** MED[270] Lithium
   - Texte mentionne QT/QTc mais BIO_031 absent
29. [INF] **[STR-MED-COH-QT]** MED[357] Pristinamycine
   - Texte mentionne QT/QTc mais BIO_031 absent
30. [INF] **[STR-MED-COH-QT]** MED[386] Sertraline
   - Texte mentionne QT/QTc mais BIO_031 absent
31. [INF] **[STR-MED-COH-QT]** MED[482] Desvenlafaxine
   - Texte mentionne QT/QTc mais BIO_031 absent
32. [INF] **[STR-MED-COH-QT]** MED[553] Pimavansérine
   - Texte mentionne QT/QTc mais BIO_031 absent
33. [INF] **[STR-MED-COH-QT]** MED[554] Vortioxétine
   - Texte mentionne QT/QTc mais BIO_031 absent
34. [INF] **[STR-MED-POSREN]** MED[7] Alfacalcidol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adaptation necessaire"
35. [INF] **[STR-MED-POSREN]** MED[9] Alimemazine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
36. [INF] **[STR-MED-POSREN]** MED[39] Atropine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "N/A (absorption systemique faible mais possible)"
37. [INF] **[STR-MED-POSREN]** MED[45] Bedaquiline
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC severe"
38. [INF] **[STR-MED-POSREN]** MED[46] Belladonna
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adapter si IRC severe"
39. [INF] **[STR-MED-POSREN]** MED[54] Biperidene
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence majeure"
40. [INF] **[STR-MED-POSREN]** MED[63] Brompheniramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
41. [INF] **[STR-MED-POSREN]** MED[69] Calcifediol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adaptation"
42. [INF] **[STR-MED-POSREN]** MED[70] Calcitriol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adaptation"
43. [INF] **[STR-MED-POSREN]** MED[77] Carbinoxamine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
44. [INF] **[STR-MED-POSREN]** MED[100] Cetirizine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Si eGFR <50: 5mg/j"
45. [INF] **[STR-MED-POSREN]** MED[111] Ciclosporine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Monitoring taux"
46. [INF] **[STR-MED-POSREN]** MED[113] Cilostazol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Reduction si IRC moderee"
47. [INF] **[STR-MED-POSREN]** MED[114] Cimetidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Reduction si IRC"
48. [INF] **[STR-MED-POSREN]** MED[118] Clemastine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
49. [INF] **[STR-MED-POSREN]** MED[123] Clomipramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence (augmentation demi-vie)"
50. [INF] **[STR-MED-POSREN]** MED[136] Cyamemazine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
51. [INF] **[STR-MED-POSREN]** MED[153] Dexchlorpheniramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
52. [INF] **[STR-MED-POSREN]** MED[160] Dimenhydrinate
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
53. [INF] **[STR-MED-POSREN]** MED[161] Diphenhydramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
54. [INF] **[STR-MED-POSREN]** MED[169] Doxepine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
55. [INF] **[STR-MED-POSREN]** MED[171] Doxylamine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence (risque de retention et sedation accrue)"
56. [INF] **[STR-MED-POSREN]** MED[179] Emtricitabine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Reduction si eGFR <30"
57. [INF] **[STR-MED-POSREN]** MED[196] Famotidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Si eGFR <30: 20mg/j"
58. [INF] **[STR-MED-POSREN]** MED[207] Flupentixol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
59. [INF] **[STR-MED-POSREN]** MED[233] Imipramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
60. [INF] **[STR-MED-POSREN]** MED[237] Insuline degludec
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Surveillance"
61. [INF] **[STR-MED-POSREN]** MED[238] Insuline detemir
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Surveillance"
62. [INF] **[STR-MED-POSREN]** MED[290] Methocarbamol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si insuffisance renale severe"
63. [INF] **[STR-MED-POSREN]** MED[298] Minocycline
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC severe"
64. [INF] **[STR-MED-POSREN]** MED[312] Nimodipine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Surveillance"
65. [INF] **[STR-MED-POSREN]** MED[328] Oxybutynine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence (risque d'accumulation des metabolites)"
66. [INF] **[STR-MED-POSREN]** MED[345] Pipotiazine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
67. [INF] **[STR-MED-POSREN]** MED[359] Promethazine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
68. [INF] **[STR-MED-POSREN]** MED[371] Ranitidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "RETIRE DU MARCHE - ne pas prescrire"
69. [INF] **[STR-MED-POSREN]** MED[383] Scopolamine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence (effets centraux accrus)"
70. [INF] **[STR-MED-POSREN]** MED[400] Tacrolimus
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Monitoring taux"
71. [INF] **[STR-MED-POSREN]** MED[411] Thiocolchicoside
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
72. [INF] **[STR-MED-POSREN]** MED[416] Tiemonium
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
73. [INF] **[STR-MED-POSREN]** MED[435] Trihexyphenidyl
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence majeure (accumulation)"
74. [INF] **[STR-MED-POSREN]** MED[436] Trihexyphenidyle
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence majeure (accumulation)"
75. [INF] **[STR-MED-POSREN]** MED[438] Trimipramine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
76. [INF] **[STR-MED-POSREN]** MED[439] Triprolidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC severe (peu de donnees)"
77. [INF] **[STR-MED-POSREN]** MED[440] Tropatepine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence majeure"
78. [INF] **[STR-MED-POSREN]** MED[444] Valpromide
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Adapter si IRC severe (valproate libre augmente si IRC)"
79. [INF] **[STR-MED-POSREN]** MED[456] Zuclopenthixol
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence"
80. [INF] **[STR-MED-POSREN]** MED[483] Dosulpine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC sévère."
81. [INF] **[STR-MED-POSREN]** MED[520] Rilmenidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC (elimination renale partielle)"
82. [INF] **[STR-MED-POSREN]** MED[526] Phenytoine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Ajuster selon phenytoinemie libre si IRC (liaison albumine diminuee)"
83. [INF] **[STR-MED-POSREN]** MED[527] Piribedil
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC severe"
84. [INF] **[STR-MED-POSREN]** MED[530] Pethidine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "CI si IRC (accumulation norpethidine neurotoxique)"
85. [INF] **[STR-MED-POSREN]** MED[531] Meprobamate
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Sans objet (retire)"
86. [INF] **[STR-MED-POSREN]** MED[541] Betahistine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
87. [INF] **[STR-MED-POSREN]** MED[542] Naftidrofuryl
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
88. [INF] **[STR-MED-POSREN]** MED[543] Nicergoline
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC"
89. [INF] **[STR-MED-POSREN]** MED[546] Midodrine
   - poso_ren ne mentionne ni DFG/Cl créat/ajustement: "Prudence si IRC (accumulation metabolite actif)"

## PATH (1)

1. [INF] **[STR-PATH-007]** PAT PAT_032 (Dépression)
   - Diverge NOM: rules="Dépression (sujet âgé / Late-Life Depression)" / master="Dépression"
