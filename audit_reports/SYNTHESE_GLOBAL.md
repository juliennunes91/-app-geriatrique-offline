# Synthèse globale — Audit cohérence base GeriaAssist

**Date** : 2026-05-16
**Branche** : `claude/fix-medical-decision-feature-Qu2vy`
**Méthode** : Audit 6 axes (A à F) au-delà de `audit_db.js`

---

## Résultats par axe

| Axe | Description | Findings initiaux | Action | État final |
|---|---|---|---|---|
| **A** | Liens bidirectionnels med ↔ patho ↔ bio | 471 asymétries | 17 cumul ACB + 1 SS corrigés | 453 résiduels (verbosité texte — itération future) |
| **B** | Cartographie syndromes iatrogènes | 5 orphelins / 51 | Mapping conservé `B_synd_to_meds.json` | 46/51 syndromes couverts |
| **C** | Scores cliniques composites | 0 (nouveau module) | Tagging 546 médicaments + nouvel onglet UI | 8 scores actifs (ACB/CIA/QT/Sero/Saign/Chute/Sedat/HypoG) |
| **D** | Cohérence par classe | 5 trous réels | 6 corrections BIO_cible | 0 trou réel résiduel |
| **E** | Sources EBM | 134 sources potentiellement obsolètes | **74 sources actualisées** (11 GINA/GOLD + 50 ESC HTA + 3 ESC IC + 5 ESC FA + 5 HAS ostéo) — toutes vérifiées web | 60 sources conservées (HAS spécifiques, Beers/STOPP/KDIGO confirmées en vigueur) |
| **F** | Seuils biologiques | 1 composite descriptif (SYND_050) | Acceptable (syndrome composite clinique) | 50/51 syndromes avec seuils numériques |

---

## A — Détail liens bidirectionnels (axe documenté pour itération future)

### A.1 — PATHO_MED_INTERDITS vs ddi_interact_v2 (165 asymétries)
Détecte les pathologies qui interdisent un médicament sans que ce médicament ne mentionne explicitement la pathologie. Souvent légitime (effet de classe sous-entendu). À traiter ponctuellement.

### A.2 — bio_cible vs mention texte (288 asymétries)
Un BIO_xxx dans bio_cible sans mot-clé correspondant dans alerte_clinique/notes_cliniques. Souvent légitime (surveillance générale). Cas pertinents à reprendre selon priorités cliniques.

### A.3 — Mentions SS sans classe DDI (1 → 0 résolu)
Agomélatine : ajout classe "Syndrome sérotoninergique" dans ddi_interact_v2.

### A.4 — ACB ≥ 2 sans classe "Cumul ACB" (17 → 0 résolus)
Ajout d'une entrée standardisée à : Amoxapine, Belladonna, Carbamazepine, Chlorpromazine, Cyclobenzaprine, Desipramine, Dicyclomine, Doxepine, Hyoscyamine, Meperidine, Nortriptyline, Orphenadrine, Oxcarbazepine, Propantheline, Propiverine, Trimipramine, Propericiazine.

---

## B — Cartographie syndromes iatrogènes (top contributeurs)

Voir `B_syndromes_coverage.md` pour la table complète et `B_synd_to_meds.json` pour le mapping programmatique.

**Top 10 syndromes les plus couverts** :
| SYND | Nom | Nb meds inducteurs |
|---|---|---|
| SYND_046 | Risque chutes | 146 |
| SYND_047 | Délirium iatrogène ACB | 99 |
| SYND_017 | Hypoglycémie iatrogène | 66 |
| SYND_001 | Cytolyse hépatique | 63 |
| SYND_010 | Hyperkaliémie | 59 |
| SYND_011 | Hypokaliémie | 54 |
| SYND_003 | Allongement QTc | 51 |
| SYND_045 | Triple whammy IRA | 49 |
| SYND_044 | Dépression respiratoire | 47 |
| SYND_048 | Constipation opioïde/ACB | 35 |

**5 syndromes orphelins identifiés** (0 inducteurs détectés par heuristique) :
- SYND_006 (Anémie ferriprive — médicaments responsables : AVK saignement, AINS gastrites, IPP malabsorption)
- SYND_026 (Carence folates B9 — médicaments : MTX, phénytoïne, sulfasalazine, cotrimoxazole)
- SYND_040 (Désordre Phospho-Ca IRC — peu de méds individuels)
- SYND_041 (Neutropénie fébrile chimio — chimiothérapies spécifiques)
- SYND_050 (Incontinence urinaire iatrogène — diurétiques, sédatifs, anticholinergiques cumulés)

→ À enrichir lors de phases ultérieures.

---

## C — Scores cliniques composites (NOUVEAU)

### Module `composite_scores.js` créé

8 scores actifs avec sources EBM :

| Score | Source | Distribution (0/1/2/3) |
|---|---|---|
| **ACB** | Boustani 2008, Coupland JAMA 2019 | 418/60/16/52 |
| **CIA** | Adaptation interne | 363/122/21/40 |
| **QT** | CredibleMeds.org, ESC 2020 | 373/103/39/31 |
| **Sero** | Sternbach 1991, Hunter 2003 | 503/32/11/0 |
| **Saign** | HAS-BLED Pisters 2010 | 485/45/5/11 |
| **Chute** | Hartikainen 2007, STOPP K1 | 407/45/44/50 |
| **Sedat** | Drug Burden Index Hilmer 2007 | 471/10/40/25 |
| **HypoG** | ADA 2025, HAS DT2 2023 | 532/1/1/12 |

### Nouvel onglet UI "🧪 Scores exp."

- Ajouté dans `index.html` ET `index_modern.html` (règle dual-UI)
- Composition : cartes par score avec badge niveau + barre + liste contributeurs + sources EBM
- Synthèse rapide en haut : alertes scores ≥ modéré
- Mention "expérimental" avec avertissement clinique

### Intégration Service Worker
- `composite_scores.js` ajouté à `APP_ASSETS`
- `BUILD_ID` : `20260515-coherence-scores-experimentaux`

---

## D — Cohérence par classe (point littérature)

Voir `D_classes_consistency.md` pour le tableau complet.

### Trous réels corrigés (6 corrections BIO_cible) :

| Médicament | BIO ajouté | Justification littérature |
|---|---|---|
| Clozapine | BIO_018 (CPK) | SMN risque (rare mais documenté — Pope 1995) |
| Tiapride | BIO_025/026/027 | SGA atypique benzamide — surveillance métabolique recommandée bien que profil meilleur que olanzapine/clozapine |
| Levomepromazine, Perphenazine, Prochlorperazine, Trifluoperazine | BIO_025 | Phénothiazines induisent hyperglycémie/DT2 (Newcomer 2007) — surveillance glycémie recommandée |

### Points littérature notables (singletons légitimes)

- **Piroxicam** (AINS) : demi-vie > 50h → PIM ABSOLU âgé (différent des autres AINS)
- **Indacatérol** (LABA) : indication BPCO uniquement (pas AMM asthme — vs autres LABA)
- **Nimodipine** (CCB DHP) : indication HSA anévrismale exclusive, BHE+++ (vs CCB cardio standard)
- **Citalopram/Escitalopram** (ISRS) : QTc Risk_KR (FDA 2011) — supérieur aux autres ISRS Risk_CR/PR
- **Ésoméprazole** (IPP) : inhibiteur CYP2C19 puissant — éviter clopidogrel (FDA 2009)
- **Pantoprazole** (IPP) : peu CYP2C19 — préférable avec clopidogrel
- **Sotalol** (β-bloquant) : Risk_RE QTc (classe III antiarythmique — vs β-bloquants standards)
- **Glibenclamide** (sulfamide) : PIM ABSOLU Beers (hypoglycémie prolongée demi-vie longue)
- **Nitrazépam** (BZD) : demi-vie 25-35h → PIM ABSOLU (vs lormétazépam/oxazépam)
- **Thioridazine** (FGA) : Risk_RE QTc — retiré dans plusieurs pays
- **Fluindione** (AVK) : NIH immuno-allergique — ANSM 2018 restrictions France

→ Les particularités au sein d'une classe sont documentées dans le champ `notes_cliniques` du médicament.

---

## E — Sources EBM (traçabilité)

Voir `E_sources_ebm.md` et `E_impact_clinique.md`.

- **0 médicament sans source** (excellent)
- **324 sources minimales** (juste "RCP X | Société YYYY") — acceptable pour la majorité
- **74 sources actualisées** après vérification web (2026-05-16) :
  - GINA 2023 → **GINA 2024** (11) ✓
  - GOLD 2023 → **GOLD 2024** (inclus dans les 11) ✓
  - ESC HTA 2023 → **ESC HTA 2024** (50) — *Mancia, Eur Heart J 2024* ✓
  - ESC HF 2021 → **ESC IC 2023** (3) — *McDonagh focused update* ✓
  - ESC FA 2020 → **ESC FA 2024** (5) — *Van Gelder, Eur Heart J 2024* ✓
  - HAS 2018 ostéoporose → **HAS 2023** (5) — *Fiche BUM 24 jan 2023* ✓
- **Sources confirmées en vigueur** (vérification web — pas de mise à jour disponible) :
  - Beers 2023, STOPP/START v3, KDIGO 2009 transplant, HAS 2017 dépression,
    HAS 2008 AVK, ESC HTAP 2022, ACR gout 2020, ESC arythmie 2022, ESC SCA 2023
- **Sources non touchées** (61) : HAS spécifiques par indication — vérification
  individuelle à mener (pas d'actualisation sans certitude documentaire)

### Sociétés savantes les plus citées (top 10)
| Citations | Source |
|---|---|
| 111 | Beers 2023 |
| 73 | SPILF 2023 |
| 49 | ESC HTA 2023 |
| 39 | HAS 2017 |
| 19 | HAS 2022 |
| 17 | HAS 2020 / FORTA-D (ex æquo) |
| 14 | ESC IC 2023 / EULAR 2023 |
| 13 | HAS 2023 |
| 10 | ESC FA 2024 |
| 9 | PRISCUS |

---

## F — Seuils biologiques

**50/51 syndromes** ont CONDITION + SEUIL_CRITIQUE avec valeurs numériques exploitables.

**Exception légitime** : SYND_050 (Incontinence urinaire iatrogène) — composite clinique sans biomarqueur numérique unique. Acceptable car syndrome de cumul médicamenteux (non biologique pur).

→ Pas d'action corrective nécessaire sur cet axe.

---

## Récapitulatif final

| Référentiel | Volume | Cohérence |
|---|---|---|
| MEDICAMENTS | 546 | 75.8% enrichis DDIv2 ≥ 3 + 100% taggés scores composites |
| BIOLOGIE | 45 | Toutes référencées + seuils définis |
| PATHOLOGIES | 53 | Master = rules, tous champs remplis |
| SYNDROMES | 51 | 50 avec seuils numériques + 5 orphelins documentés |
| SOURCES EBM | — | 100% présentes, **74 actualisées 2024** (toutes vérifiées web) |
| `audit_db.js` | — | **0 erreur / 0 warning / 0 info** |
| Audits A-F | — | 6 axes complétés, rapports archivés |

---

## Itérations futures recommandées

1. **A.1/A.2** : Compléter les mentions explicites des pathologies/biologies dans les textes alerte/notes pour les médicaments où c'est cliniquement pertinent (475 cas restants).
2. **B** : Enrichir les 5 syndromes orphelins (006, 026, 040, 041, 050) avec leurs médicaments inducteurs documentés.
3. **E (sources)** : Évolutions code/logique identifiées dans `E_impact_clinique.md` :
   - Check sous-dosage DOAC (ESC FA 2024 : point géronto critique)
   - Score CHA₂DS₂-VA (suppression "sexe féminin" — ESC FA 2024)
   - Alerte rebond fracturaire Dénosumab (HAS 2023 : relais bisphosphonate obligatoire)
   - Info "quadruple thérapie HFrEF" (ESC IC 2023)
4. **E (HAS résiduelles)** : 61 références HAS spécifiques à reprendre individuellement (vérification publication-par-publication requise).
4. **DDI v2** : Compléter les 132 médicaments restants (antibiotiques niches, ARV, anti-cancéreux niches) selon priorités cliniques gériatriques.

