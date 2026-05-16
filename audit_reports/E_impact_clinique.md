# Impact clinique et logique des sources actualisées

**Date** : 2026-05-16
**Vérification** : sources web confirmées (PubMed, ESC, HAS, AGS)
**Sources actualisées au total** : 74 (GINA/GOLD/ESC HTA/HF/FA + HAS ostéoporose)

---

## 1. ESC HTA 2024 (Mancia, Eur Heart J 2024) — 51 entrées impactées

### Nouveautés majeures
- **Catégorie "elevated BP" (120-139/70-89)** introduite : intervention non-médicamenteuse +
  réévaluation médicamenteuse possible si haut risque CV (vs. seuil ≥ 140/90 strict avant).
- **Cible générale ≤ 130/80** confirmée, mais individualisée selon tolérance (≤ 140/80
  acceptable chez ≥ 80 ans fragile, hypotension symptomatique, polymédication).
- **Polypilule recommandée** dès l'initiation si HTA grade 2-3 (vs. addition séquentielle).
- **PA en automesure (HBPM) / MAPA** systématique au diagnostic.

### Impact sur la logique GeriaAssist
| Module | Conséquence | Action |
|---|---|---|
| `geria_pathology_rules_v3.js` (HTA) | Seuils OK déjà conservateurs chez âgé | **Pas de changement** : la cible 130/80 reste applicable, l'app respectait déjà l'individualisation par fragilité. |
| Alertes hypotension iatrogène | Confirmation du seuil PAS < 110 → alerte (cohérent avec recommandation tolérance individuelle) | **Pas de changement** |
| ACB / Beers | Aucun impact (sources distinctes) | — |

### Conclusion
La logique app reste cohérente avec ESC HTA 2024. Les âgés bénéficient déjà
de l'approche individualisée. **Pas d'évolution code requise.**

---

## 2. ESC FA 2024 (Van Gelder, Eur Heart J 2024) — 5 entrées DOAC/AVK

### Nouveautés majeures (CRITIQUES en gériatrie)
- **CHA₂DS₂-VA remplace CHA₂DS₂-VASc** : suppression du critère "sexe féminin"
  comme modificateur de risque (raison : effet modeste/conditionnel à âge ≥ 65).
- **Doses RÉDUITES de DOAC** : à n'utiliser que sur critères stricts spécifiques
  à chaque DOAC (poids, créatinine, âge — selon AMM). Le **sous-dosage** est
  désormais explicitement déconseillé : c'est une cause majeure d'AVC évitables
  chez l'âgé "fragile" sous-dosé "par précaution".
- **AVK 1ʳᵉ intention restreint** aux : valves mécaniques + RM modérée à sévère.
  Tous les autres patients âgés en FA → DOAC.
- **AF-CARE** : framework holistique (C-Comorbidities, A-Avoid stroke,
  R-Reduce symptoms, E-Evaluate dynamically).

### Impact sur la logique GeriaAssist
| Module | Logique actuelle | Conséquence ESC FA 2024 | Action recommandée |
|---|---|---|---|
| **DOAC dose check** (`app_analysis.js`) | Vérifie ClCr et alerte si dose inadaptée | Risque : ne distingue pas "sous-dosage par excès de précaution" du "dose réduite justifiée" | **Itération future** : ajouter un check explicite "dose réduite SANS critère réglementaire" → alerte sous-dosage |
| **Apixaban 2.5 mg x2** | Considéré OK si ≥ 80 ans + créat ≥ 1.5 mg/dL OU poids ≤ 60 kg | ✓ Cohérent ESC FA 2024 | — |
| **Score CHA₂DS₂-VASc UI** | Inclut "sexe féminin" comme +1 | ⚠️ Désormais score VA recommandé (sans sexe) | **Itération future** : actualiser le calculateur, garder VASc en référence historique |
| **AVK chez âgé** | Pas de recommandation explicite "préférer DOAC" | Renforcement justifié | **Itération future** : flag de préférence DOAC chez âgé hors RM/valve mécanique |

### Conclusion
**Évolution code recommandée** pour deux points : check sous-dosage DOAC +
score VA. Non urgent (la base actuelle est sécuritaire), mais à planifier.

---

## 3. ESC IC 2023 focused update (McDonagh, Eur Heart J 2023) — 3+ entrées

### Nouveautés majeures
- **Sacubitril/valsartan en 1ʳᵉ intention** (HFrEF), y compris naïfs d'IEC/ARA2.
- **iSGLT2 (dapagliflozine, empagliflozine) classe I** dans **HFrEF, HFmrEF et HFpEF**
  (extension du focus 2023 vers FE préservée — nouveau).
- **Finérénone** : recommandation dans IC + DT2 (essai FIDELIO/FIGARO).
- **Carence martiale** : ferinject IV si Ht ≤ 41% et ferritine < 100 µg/L
  (ou ferritine 100-300 + saturation transferrine < 20%).

### Impact sur la logique GeriaAssist
| Module | Conséquence | Action |
|---|---|---|
| iSGLT2 + IC | La base mentionne déjà l'extension HFpEF (Phase 53) | **Déjà cohérent** ✓ |
| Sacubitril/valsartan + iSGLT2 + β-bloquant + spironolactone (« quadruple thérapie ») | Logique synergie présente mais non explicite | **Itération future** : compléter les `synergies_cibles` dans HF |
| Ferinject (carbomaltose) | Pas dans la base (médicament hospitalier IV) | Pas d'action |
| Finérénone | Présente dans la base ; déjà tagguée IC+DT2 | ✓ |

### Conclusion
**Pas d'évolution code requise.** La quadruple thérapie HFrEF pourrait être
mise en avant comme "stratégie attendue" dans une future itération (information
au prescripteur).

---

## 4. HAS 2023 ostéoporose (5 entrées) — bisphosphonates + GIOP

### Nouveautés majeures
- **Romosozumab** (Evenity) intégré comme nouvelle option (anti-sclérostine ;
  efficacité > tériparatide en réduction de fracture vertébrale, contre-indication
  cardiovasculaire si IDM/AVC dans les 12 mois).
- **T-score < -2,5 SEUL = insuffisant** pour traiter : associer FRAX, antécédent
  fracturaire, traitement par corticoïdes ≥ 7,5 mg/j > 3 mois, etc.
- **Séquencement après dénosumab** : RELAIS BISPHOSPHONATE OBLIGATOIRE
  (rebond fracturaire +++ documenté si arrêt brutal — Tsourdi et al, Bone 2017).

### Impact sur la logique GeriaAssist
| Module | Conséquence | Action |
|---|---|---|
| Bisphosphonates + DFG | Logique correcte (Acide zoledronique CI si DFG < 35) | ✓ |
| Dénosumab — sevrage | **Risque non explicite** dans la base | **Itération future** : ajouter une note `arret_geriatrique` sur Dénosumab : "JAMAIS arrêt brutal — relais bisphosphonate obligatoire (rebond fracturaire — HAS 2023)" |
| Romosozumab | Absent de la base | Pas d'action (médicament d'usage spécialisé) |
| GIOP (corticoïdes long cours) | Référence "ACR 2017 ; HAS 2023 ostéoporose ; STOPP/START v3 F1" | ✓ |

### Conclusion
**Une amélioration ciblée** : ajouter l'alerte "rebond fracturaire" sur le
Dénosumab. Risque clinique réel mais non couvert actuellement.

---

## 5. Bibliographie confirmée en vigueur — pas de changement

| Source | Vérification web | Action |
|---|---|---|
| **Beers 2023** (AGS, JAGS 2023) | Version centrale courante. Publication *Alternative Treatments* 2025 ne remplace pas les critères. | Maintenu (111 entrées) |
| **STOPP/START v3** (O'Mahony 2023) | 190 critères, dernière version | Maintenu (8 entrées) |
| **KDIGO 2009 transplant** | KDIGO 2025 = ADPKD, pas transplant | Maintenu (3 entrées) |
| **HAS 2017 dépression** | Toujours en vigueur (vérifié) | Maintenu (39 entrées antidépresseurs/antipsychotiques) |
| **HAS 2008 AVK** | Toujours référence (complétée ANSM 2018) | Maintenu (3 entrées AVK) |
| **ESC HTAP 2022** | Dernière version (ESC/ERS 2022) | Maintenu |
| **ACR 2020 gout** | Pas de mise à jour ACR depuis | Maintenu |
| **ESC arythmie 2022** (ventriculaires/SCD) | Dernière version | Maintenu |
| **ESC SCA 2023** | Dernière version | Maintenu |

---

## 6. Synthèse des évolutions code/logique recommandées

Toutes en **itérations futures** (non urgentes — base actuellement sécuritaire) :

1. **DOAC sous-dosage check** — alerter si dose réduite sans critère AMM
   (point géronto critique ESC FA 2024).
2. **Score CHA₂DS₂-VA** — moderniser le calculateur (supprimer "sexe féminin"
   comme item, garder VASc comme référence historique).
3. **Dénosumab arrêt brutal** — ajouter `arret_geriatrique` rebond fracturaire
   + relais bisphosphonate obligatoire (HAS 2023).
4. **HF "Quadruple thérapie"** — info prescripteur (Sac/Val + β-bloquant +
   ARM + iSGLT2) selon ESC IC 2023.

Aucune correction code n'est **immédiatement requise** : la base reste
sécuritaire avec les sources actualisées. Les évolutions ci-dessus sont
des améliorations qualitatives à inscrire dans le backlog.

---

## 7. Méthodologie de vérification

Toutes les sources ont été vérifiées le 2026-05-16 via :
- PubMed / NCBI
- Sites officiels des sociétés savantes (ESC.org, has-sante.fr, americangeriatrics.org)
- Aucune référence inventée ou extrapolée
- Sources non confirmées comme "à jour" → **conservées avec leur année d'origine**
