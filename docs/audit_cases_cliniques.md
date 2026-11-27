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

## Lots suivants

- Lot 2 — gériatrie et syndromes (palliatif, ulcère, chutes, institution, confinement,
  incontinence, HBP, constipation, dysphagie, arthrose, glaucome, sténose aortique).
- Lot 3 — troubles cognitifs et SPC (cases lues par le code, pas par les règles : à auditer
  dans `_spcAlerte` et les encarts).
- Lot 4 — psychiatrie (aiguë et chronique) ; habitudes de vie (alcool, tabac, dénutrition).
