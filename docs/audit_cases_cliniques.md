# Audit logique des cases cliniques

Demande du 27/11/2026 : pour chaque case « cochable » des paramètres cliniques, vérifier
l'enchevêtrement pathologie ↔ médicament ↔ posologie ↔ biologie. Travail en plusieurs
sessions, par lots. L'inventaire brut (contexte produit, règles lectrices, médicaments visés,
biologie lue, usages directs) est **généré** : `node tools/inventaire_cases.cjs` →
`docs/inventaire_cases_cliniques.md`.

**Méthode, pour chaque case.**

1. Ce que la case **affirme** (le libellé) et ce que le code en **déduit** (contextes,
   pathologie équivalente, scores). Une déduction qui va au-delà du libellé est un défaut :
   c'était le cas de « aspirine > 100 mg/j » → « antécédent d'hémorragie » (corrigé en 4.95).
2. Les règles qui la lisent : leur **titre** dit-il ce que leur **condition** vérifie
   (seuil, sévérité, ancienneté) ?
3. Ce qui **manque** : la case est-elle croisée avec la biologie qui la mesure, la posologie
   qui l'aggrave, l'indication qui la justifie ?
4. Chaque constat est vérifié sur un dossier fictif (`analyzeCase`) avant d'être écrit.

Légende : **D** défaut (affirmation fausse ou règle qui sort à tort) — **T** trou (lien
absent) — **A** arbitrage clinique requis avant correction.

---

## Lot 1 — cardiovasculaire, hémorragique, organes (12 cases)

| Case | Constat | Type |
|---|---|---|
| HTA non contrôlée | `EV_H02` « AINS + HTA **sévère** (PAS > 170) » ne vérifie que l'HTA déclarée : il sort en rouge sur toute HTA, contrôlée comprise (vérifié : HTA + ibuprofène). Même défaut pour `EV_I06` (mirabégron + HTA « sévère ou labile »). La case existe et n'est pas lue par ces deux règles. | D |
| HTA non contrôlée | Aucun champ de pression artérielle : « non contrôlée » ne se confronte à aucune mesure, et la TA couché-debout recommandée par `EV_SF02b` n'a nulle part où s'écrire. | T |
| Hépatopathie | `EV_N01` met le **paracétamol** en rouge dans toute hépatopathie (vérifié). Dans la cirrhose, le paracétamol reste l'antalgique de référence à dose réduite (≤ 2-3 g/j) ; c'est une **posologie**, pas une éviction. Le Child-Pugh saisi n'est pas lu par la règle. | D / A |
| Hépatopathie | `EV_N02` titre « cirrhose **sévère** » mais sort sur toute hépatopathie : le Child-Pugh (B/C), déjà saisi, devrait le décider. | D |
| Hépatopathie | `IN_M02` propose lactulose/rifaximine « pour encéphalopathie hépatique » à toute hépatopathie (vérifié, sans médicament) ; le champ Child-Pugh « encéphalopathie » existe et n'est pas lu. | D |
| ATCD d'EP / TVP | `IN_M01` propose un anticoagulant « pour MTEV documentée » à tout antécédent (vérifié) : une TVP provoquée ancienne n'est pas une indication en cours. La case ne dit ni l'ancienneté ni le caractère récidivant. | D / A |
| Bradycardie | Libellé « < 45 bpm », titre d'`EV_D17` « < 60 / BAV » : deux seuils pour un même fait, et aucun champ de **fréquence cardiaque** pour les départager. | T |
| (arythmie / QT) | `EV_SFGG_AD_03` titre « citalopram **> 20 mg** / escitalopram **> 10 mg** » mais ne lit ni la dose ni le QTc ni la kaliémie : il sort sur 10 mg de citalopram dans toute FA (vérifié). Dose saisissable par précision (comme l'aspirine), QTc et K⁺ déjà saisis. | D |
| Sepsis | `EV_N07` liste AINS, aminosides, IEC/ARA2 ; manquent les autres médicaments à suspendre en maladie aiguë (règles « sick day ») : **metformine** (acidose lactique — les lactates sont saisis), **iSGLT2** (acidocétose euglycémique), diurétiques, sulfamides (vérifié : sepsis + metformine + dapagliflozine → rien). | T |
| Hémodialyse | La case ne fixe pas le palier rénal des posologies si le DFG n'est pas saisi : un dialysé sans DFG reçoit les posologies standard. | T |
| SCA / stent récent | `IN_M03` titre « antiagrégant / **statine** » mais ne vérifie que l'antiagrégant. Stent < 6 mois sous anticoagulant : la durée de l'association n'est pas abordée. | D / T |
| Post-arrêt / cardioversion | Deux situations sans rapport dans une case ; la cardioversion de FA appelle une anticoagulation encadrée (≥ 3 semaines avant, 4 après), non abordée. | A |
| ATCD de saignement | Lu par HAS-BLED, ORBIT, DOAC Score et `EV_C02`/`EV_C12` — cohérent depuis 4.92/4.95. | — |
| QT long congénital | Cohérent : `EV_N05` lit le risque QT de chaque molécule. | — |

**État : corrigé en 5.30** (arbitrages A tranchés par l'utilisateur : « corrige les problèmes
de l'audit »). Restent ouverts : la durée d'association antiagrégant + anticoagulant après
stent, et la case « post-arrêt cardiaque / cardioversion », qui mêle deux situations.

**Corrections proposées (lot 1)**, par ordre de sécurité :

1. `EV_H02`, `EV_I06` : exiger `hta_non_controlee`. *(défaut pur)*
2. `EV_N02`, `IN_M02` : lire le Child-Pugh (classe B/C ; item encéphalopathie). *(défaut pur)*
3. `EV_SFGG_AD_03` : précision de dose pour citalopram/escitalopram ; armer sur QTc > 450 ou
   K⁺ < 3,5 mesurés. *(défaut pur)*
4. Sepsis : règle « médicaments à suspendre en maladie aiguë » (metformine, iSGLT2,
   diurétiques, sulfamides, IEC/ARA2, AINS) avec lactates et DFG. *(source à relire)*
5. `EV_N01` paracétamol : sortir de l'éviction, garder une **posologie** dans la cirrhose. **A**
6. `IN_M01` : remplacer par une question « MTEV en cours de traitement / ancienne ». **A**
7. Champs à créer : fréquence cardiaque, pression artérielle (couché/debout). **A**

## Lot 2 — gériatrie et syndromes (12 cases)

| Case | Constat | Type | Suite |
|---|---|---|---|
| Arthrose | `EV_H03` « AINS > 3 mois, paracétamol **non essayé** » sortait sous paracétamol (vérifié : arthrose + ibuprofène + paracétamol) ; durée inconnue affirmée « > 3 mois ». | D | corrigé 5.50 (`med_absent` paracétamol, titre « ou durée non précisée ») |
| Arthrose | `EV_H09` « opioïde **au long cours** » sur durée inconnue. | D | titre corrigé 5.50 |
| HBP / rétention | `EV_D01` (tricyclique) nommait rétention, constipation et chutes dans son titre ; sa condition ne lisait que des comorbidités (vérifié : HBP + amitriptyline → rien). | D / T | 5.50 : titre ramené au vérifié ; `SUP_TCA_01` (HBP, constipation chronique) ; chutes déjà portées par `EV_K08` |
| HBP / rétention | `EV_G03` « LAMA + glaucome / **obstruction vésicale** » ne lisait que le glaucome (vérifié : HBP + tiotropium → rien). | D | 5.50 : `contexte_clinique_any` glaucome, hbp |
| Incontinence | `EV_B10` « diurétique de l'anse **pour HTA** » sortait avec l'indication « insuffisance cardiaque » déclarée. | D | 5.50 : se tait sur indication de surcharge ou d'œdèmes |
| Incontinence | Beers 2023 : doxazosine, prazosine, térazosine à éviter chez la femme incontinente — aucune règle. | T | 5.50 : `SUP_INC_01` (warning, femme) |
| ATCD d'ulcère | `IN_F01` « IPP pour **RGO** sévère ou sténose peptique » sortait sur l'ulcère seul, sans gastrotoxique (vérifié). Un ulcère guéri n'est pas une indication d'IPP au long cours ; le RGO existe en base (`PAT_053`). | D | 5.50 : lit `PAT_053` |
| Insomnie / hypnotique Z | `EV_D11` « Z ≥ 2 semaines » sur durée inconnue ; la durée « < 1 mois » de la fenêtre de précision ne départage pas deux semaines. | D / A | titre corrigé ; **A** : ajouter « < 2 semaines » aux durées ? |
| Sténose aortique | `EV_B20` « antihypertenseur (hors IEC/ARA2) » sort sur un diurétique déclaré pour insuffisance cardiaque (vérifié). Le diurétique y est un traitement de la congestion, à manier prudemment, pas un antihypertenseur. | A | à trancher : faire taire le diurétique de surcharge ? |
| Palliatif, chutes, institution, confinement, constipation, dysphagie, glaucome | Cohérents : chaque lecteur vérifie ce que son titre nomme. | — | — |

**État : corrigé en 5.50.** Restent ouverts (arbitrages) : durée « < 2 semaines » pour les
hypnotiques Z ; diurétique de surcharge dans la sténose aortique.

## Lot 3 — troubles cognitifs, SPC, MCI, MBI

| Case | Constat | Type | Suite |
|---|---|---|---|
| Démence + insomnie | `EV_D09` « BZD **pour agitation/SCPD** » sortait en rouge sur la zopiclone (clé `benzodiazepine` = apparentés compris), sous l'encart SPC qui la retient 14-28 j à 3,75 mg (SFGG 2024) ; l'indication « agitation » n'était pas déclarée. | D | corrigé 5.60 : `benzodiazepine_stricte`, titre au vérifié |
| Démence parkinsonienne (`PAT_014`) | Absente de `EV_D01`, `EV_D09`, `EV_D14`, `EV_I01` (vérifié : DP + oxybutynine → pas de règle démence). | T | 5.60 |
| MCI (`PAT_043`) | Lu par aucune règle. Beers 2023 vise « démence **ou trouble cognitif** » pour les anticholinergiques. | T | 5.60 : `EV_D14`, `EV_I01` |
| Delirium | `EV_D14` titrait « démence ou delirium » sans lire `PAT_048` ; et le contexte `delirium` ne naissait que de la case (`isChecked`), pas de la liste. | D | 5.60 : `_declare`, `PAT_048` dans `EV_D14` |
| IAChE + bradycardie | `EV_D17`, `EV_D18`, `SUP_INT_008` : trois cartes (deux rouges) pour une conduite. | D | 5.60 : `GRP_IACHE_BRADY` |
| Alzheimer | `IN_D03` propose un IAChE « Alzheimer **léger à modéré** » : aucun MMSE n'est saisi. | D / A | titre « stade à vérifier » ; **A** : champ MMSE ? et IAChE déremboursés en France (HAS 2016, 2018) — garder la proposition START ? |
| SPC, MBI | Lus par le code (`_spcAlerte`, encarts) : cohérents à l'essai (apathie sous ISRS, sommeil sous zopiclone, MBI). | — | — |

## Lot 4 — psychiatrie, habitudes de vie

| Case | Constat | Type | Suite |
|---|---|---|---|
| Catatonie | `EV_D08` sortait en rouge sur le lorazépam — qui est le traitement de première ligne de la catatonie. | D | 5.60 |
| Trouble bipolaire | Antidépresseur seul, sans thymorégulateur : aucune règle (vérifié : bipolaire + sertraline → rien). CANMAT/ISBD 2018 : pas de monothérapie dans le type I. | T | 5.60 : `SUP_BIP_01` (warning) |
| Trouble de l'usage de l'alcool | Produit bien `alcool` : `EV_N03`, `EV_N04`, `IN_N01` lus (vérifié). | — | — |
| SAOS (case) | Équivalente à `PAT_052` : `SUP_BZD_OPIO_01` sort (vérifié). | — | — |
| Psychose chronique + chutes | `EV_K02` requalifié « traitement de fond — surveiller » (recontextualisation). | — | — |
| TCSP | Aucun lecteur. Prodrome de synucléinopathie ; les antidépresseurs peuvent l'aggraver. | A | règle à créer ? (source à arrêter) |
| Tabac, dénutrition, IMC < 18,5 | Cohérents. | — | — |

**État : lots 3 et 4 corrigés en 5.60.**

---

## Rapport final — ce qui reste à trancher

Quatre lots, 83 cases de l'inventaire ; corrigé en 5.30, 5.40 (doses des sédatifs), 5.50 et 5.60. Les
défauts purs (titre affirmant un terrain non vérifié, chemin de saisie ignoré, carte en double)
sont tous corrigés. Restent les points qui demandent une **décision clinique** ou une **donnée
nouvelle** — rien n'y a été deviné.

### A. Arbitrages cliniques

| # | Question | Ce que fait l'application aujourd'hui | Options |
|---|---|---|---|
| A1 | **IAChE** (`IN_D03`) : les proposer dans l'Alzheimer alors qu'ils sont déremboursés en France (HAS, SMR insuffisant, 2018) ? | Propose (START v3), titre « stade à vérifier » | garder / informatif / retirer |
| A2 | **Stade de la démence** : aucun MMSE saisi, donc « léger à modéré » (`IN_D03`) et « démence sévère » (`EV_SF06`) ne se vérifient pas | Ne vérifie pas | ajouter un champ MMSE (ou stade) |
| A3 | **Hypnotique Z ≥ 2 semaines** (`EV_D11`) : la durée « < 1 mois » ne départage pas deux semaines | Sort si durée non « courte » | **Écarté** par le prescripteur (sevrage refusé en institution) |
| A4 | **Sténose aortique** (`EV_B20`) : un diurétique prescrit pour insuffisance cardiaque y sort comme « antihypertenseur » (danger) | Sort | faire taire le diurétique de surcharge déclaré |
| A5 | **Stent récent sous anticoagulant** : durée de la trithérapie / bithérapie non abordée | **Corrigé en 5.80** : champ `dateAngioplastie`, `SUP_ATC_01`→`05` (ESC 2023 SCA) | — |
| A6 | Case **« post-arrêt cardiaque / cardioversion »** : deux situations sans rapport | Une case | scinder (anticoagulation péri-cardioversion) |
| A7 | **TCSP** (trouble du comportement en sommeil paradoxal) : lu par aucune règle | Rien | règle (antidépresseurs aggravants ; prodrome de synucléinopathie) — source à arrêter |
| A8 | **Score PIM global** : la moyenne remonte quand on retire des alertes informatives | **Corrigé en 5.81** : somme saturante | — |

### B. Données manquantes (champ ou molécule)

- Bicarbonate plasmatique (`MASTER_DB.BIOLOGIE`) ; chélateurs du phosphore (sévélamer) ;
  agents stimulant l'érythropoïèse pour `IN_E03` (clés mortes).
- Durée de l'association antiagrégant + anticoagulant (A5) et MMSE (A2) : ajoutés (5.80, 5.70).

### C. Questions posées, jamais lues (`runContexteOrphelinAudit`, « CONSTAT OUVERT »)

- 7 symptômes psycho-comportementaux et 5 items MBI : lus par le **code** (encarts), pas par
  les règles — cohérents à l'essai (lot 3), l'audit les compte toujours comme orphelins.
- Albuminémie < 30 g/L : partiellement lue (`SUP_ALB_01`).

### D. Sources lues indirectement (à relire au texte intégral)

- Beers 2023, interactions médicament-maladie (incontinence de la femme) : source secondaire.
- CANMAT/ISBD 2018 (antidépresseur dans la bipolarité) : de mémoire, à vérifier au texte.
- HCSP asplénie, GRIO 2019, laxatifs de lest (RCP) : sources secondaires (déjà signalé).
