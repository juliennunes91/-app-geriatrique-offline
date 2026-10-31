# État d'avancement — GeriaAssist

*Dernière mise à jour : 31/10/2026 — **version 3.93**, `BUILD_ID` `20261029-ddi-predictor`,
cache `geriaassist-v141`. Dernier commit applicatif : `0a54440`.*

> **Reprise après plantage** : lire ce fichier en entier, puis `decisions.md` et
> `pieges.md`. Vérifier l'état réel avec `git log --oneline -5` et `git status` : tout ce
> qui est décrit ici comme livré est commité et poussé sur `main`. S'il y a des fichiers
> modifiés non commités, ils appartiennent au chantier « En cours » ci-dessous.

---

## 1. Le projet en une page

**GeriaAssist** — aide à la revue d'ordonnance du sujet âgé (Dr Julien Nunes, gériatre).
Application web **100 % hors ligne, sans build ni serveur** : on ouvre `index.html` en
double-clic (`file://`, Chrome, réseau d'établissement souvent bloqué). Aussi distribuée
en APK Android (coquille WebView, `android/`, compilée en CI GitHub Actions).

Entrées : âge, sexe, poids, créatinine/DFG, biologie (47 paramètres), comorbidités
(69 pathologies `PAT_xxx`), cases cliniques (contextes), médicaments (606 DCI) avec
**précisions** (indication, forme, dose). Sortie : onglets d'alertes + rapport PDF pour un
tiers (confrère, pharmacien, IDE).

**Onglets de résultats** (`alertes-*`) : synthèse (bandeau de gravité), éviter (STOPP,
Beers, PRISCUS, FORTA, contre-indications par pathologie, doublons, cascades), initier
(START, omissions), interactions (`ddi_interact_v2` + ANSM replié), ANSM (thésaurus),
AUC (interactions PK chiffrées), bio, usage/posologie, suivi (plan biologique), scores
(ACB, CIA, QT, chutes…), guidelines (sociétés savantes par pathologie). Onglets à part :
PAAM (auto-administration EHPAD), Vaccination, Scores psy, Conciliation.

**Utilisateur** : clinicien, relit des dossiers réels et signale ce qui est faux ou
redondant. Répondre **en français, concis**. Un signalement = un commit. Travailler sur
`main`, commiter et pousser après chaque livraison.

---

## 2. Carte des fichiers

Ordre de chargement (identique dans les deux UIs) :
`lib/html2pdf`, `lib/bootstrap` → **`ddi_general.js`** → **`ddi_pk.js`** → `app_legend.js`
→ **`geria_database.js`** → **`geria_pathology_rules_v3.js`** → **`geria_recos_final.js`**
→ `geria_integration_module.js` → **`utils.js`** → `patient_state.js` → **`drug_classes.js`**
→ **`geria_engine_v2.js`** → `lib/tesseract` → **`app_core.js`** → **`app_ui.js`** →
`app_paam.js` → `app_conciliation.js` → `app_psy_scores.js` → `app_vaccination.js` →
`app_update.js` → `ocr_module.js` → `child_pugh_adaptations.js` → `composite_scores.js` →
**`app_analysis.js`** → `text_extractor.js` → `extractor_ui.js` → `bio_import.js`.

| Fichier | Rôle |
|---|---|
| `geria_database.js` | `MASTER_DB` : MEDICAMENTS (606), PATHOLOGIES (69), BIOLOGIE (47). Fiche médicament = poso, rénal, ACB, QT, scores, suivi, `ddi_interact_v2`… |
| `geria_recos_final.js` | Règles **gériatriques** (STOPP/START v3, Beers 2023, PRISCUS, FORTA, STOPPFrail) + `RECOS_SUPPLEMENT` (`SUP_*`) + `SOURCES`. |
| `geria_integration_module.js` | Règles importées `SUP_STOP_*` (revues en 3.71/3.72). |
| `geria_pathology_rules_v3.js` | `PATHOLOGY_RULES_DB` (guidelines par pathologie : ESC, KDIGO, GOLD…), `GUIDELINE_INDEX`, `PATHO_MED_INTERDITS_V4_CLASSES` (CI médicament/pathologie). |
| `drug_classes.js` | `DRUG_CLASSES` (82 classes), `matchesDrugClass()`, `medPrecisionFamily()`, exclusions. |
| `geria_engine_v2.js` | Moteur de règles : `checkRuleOptimized`, `computeAlertScore` (plancher de sévérité, plafond « assumé »), `renderSingleAlert`, dédoublonnage. |
| `app_analysis.js` | `analyserPrescription()` : contexte patient, toutes les alertes, interactions, AUC, bio, synthèse, mémoïsation. **Le plus gros fichier.** |
| `app_core.js` | `resetPatient()`, export/import JSON, `buildPdfContent()` (rapport PDF). |
| `app_ui.js` | Saisie, pastilles, recherche, `calculerDFG()` (CKD-EPI ≥ 75 ans), cascades UI, assumer en masse. |
| `utils.js` | Points de passage uniques : `sanitizeText`, `qtRiskLevel`, `bioAnormal`/`BIO_NORMES`, `bilanBioDate`, `nomPathoAffiche`, `cleAttributJs`, `CASE_PATHOLOGIE`, `DISPOSITIFS`, `DOPA_ASSOCIATIONS`, `pkLignes`/`pkRatio`/`pkAmpleur`. |
| `ddi_general.js` | Thésaurus ANSM + BNF fusionnés (2669 paires) — transcription, **jamais réécrite**. |
| `ddi_pk.js` | **GÉNÉRÉ** (ne pas éditer) : 2278 rapports d'AUC (mesurés / prédits / hérités). |
| `bio_import.js`, `ocr_module.js` | Import bilan PDF (pdf.js 3.11 local) et OCR ordonnance (Tesseract inline). |
| `sw.js` | Service worker (liste des assets + `BUILD_ID`). |
| `index.html` / `index_modern.html` | Deux UIs, **mêmes IDs et handlers**, toute modif à faire dans les deux. |

Outils (`tools/`) : `build_ddi_pk.cjs` (régénère `ddi_pk.js` ; `--verifier`, `--rapport`),
`build_ocr_offline.cjs`, `build_modern_offline.cjs` (Tailwind + polices, réseau requis),
`coverage_panel.cjs` (couverture des règles, `--generate`), `tests_ui_playwright.cjs`.
Données sources : `tools/vendor/ddi_predictor/auc_ratios_2026-10.csv` (brut),
`tools/data/pk_mesures.json` (à la main), `tools/vendor/tesseract/`.

---

## 3. Tests et commandes

| Commande | Durée | Quand |
|---|---|---|
| `node -e "const {analyzeCase}=require('./oracle_harness'); …"` | secondes | pendant le travail, et pour chaque mutation |
| `node tests.js` | 3-4 min, ~1250 tests | **une fois** avant commit, en arrière-plan |
| `GOLDEN_UPDATE=1 node tests.js` | 3-4 min | si la dérive est voulue, puis relancer une fois |
| `node tools/tests_ui_playwright.cjs` | ~1 min, 19 tests | après toute modif d'UI, PDF, import, reset |
| `node tools/build_ddi_pk.cjs` | secondes | après modif de `pk_mesures.json` ou ajout de DCI |

`analyzeCase({age, sexe, dfg, bio:{BIO_xxx:v}, comorbs:['PAT_xxx'], flags:['chkXxx'],
meds:['DCI'], precisions:{DCI:{…}}, assumees})` → objet par onglet + `_html[onglet]`.

**Filet de régression** : `tests_golden_master.json` (114 dossiers du `PANEL`, 8 onglets :
éviter, initier, bio, interact, suivi, usage, scores, synthèse — **pas** AUC ni
guidelines), `pathology_rules_golden.json`, `rule_keys_golden.json`,
`class_members_golden.json`. Relire la dérive par script (sauvegarder le golden avant).
Tout nouvel invariant est **validé par mutation** (casser → le test échoue → restaurer).

À chaque livraison : version +0.01 (correctif) ou +0.10 (fonctionnalité) dans les **deux**
pieds de page (`<span id="appVersion">`) + `BUILD_ID` et numéro de cache dans `sw.js`,
dans le même commit ; section `CLAUDE.md` ; mise à jour de `context/`.

---

## 4. Historique des livraisons (récent → ancien)

- **3.93** (29/10) — Interactions PK refondues : `ddi_merged_V2.js` supprimé, `ddi_pk.js`
  généré depuis DDI-Predictor (extraction 280 × 170 fournie par l'utilisateur, accord de
  M. Tod) + valeurs mesurées sourcées. Appariement exact, une carte par sens, couleur FDA,
  tabac chiffré.
- **3.83** (29/10) — Onglet guidelines IC (`PAT_002`/`PAT_003`) réécrit sur ESC 2026
  (texte intégral fourni par l'utilisateur).
- **3.73** — OCR : appariement exact des DCI et marques (24 → 4 médicaments détectés).
- **3.72 / 3.71** — Revue des 60 règles du module d'intégration (terrain vérifié ou
  retiré), œstrogène systémique (Beers) rétabli.
- **3.70** — Dossier IRC G4 : une carte IRC, une carte anémie (ASE), doublons retirés.
- **3.69** — « Nouveau patient » efface tout (inventaire testé).
- **3.68** — Dispositifs implantés (SAD, PTH/PTG/PTE).
- **3.58 / 3.57** — UI moderne locale ; OCR et import PDF hors ligne en `file://`.
- **3.56** — Bicarbonate de sodium, Kayexalate, Lokelma.
- **3.55** — Import d'un bilan biologique PDF.
- **3.44 / 3.45** — Dopathérapie (associations), bensérazide, iproniazide.
- **3.34** et avant — fusions BZD, alertes assumées (unitaire puis en masse), synthèse par
  médicament, contre-indications par pathologie réindexées, SPC/MBI (SFGG 2024),
  hypoalbuminémie, CKD-EPI ≥ 75 ans, rapport PDF lisible, vaccination, mise à jour depuis
  le logiciel, ESC 2026 côté règles gériatriques (ARM, CST, finérénone).

---

## 5. En cours

**Rien en cours.** Tout est commité et poussé (`660b0b5` puis ce fichier).

---

## 6. Prochaines étapes / points ouverts (par priorité suggérée)

1. **196 valeurs PK « héritées sans référence »** (`tools/data/pk_mesures.json`,
   `n: "non_source"`) : retrouver la référence (→ `mesure` + `ref`) ou retirer, puis
   `node tools/build_ddi_pk.cjs`.
2. **Molécules DDI-Predictor absentes de la base** (lidocaïne, quinine, ranolazine,
   glipizide, triazolam…) : `node tools/build_ddi_pk.cjs --rapport` ; ajout selon la
   procédure médicament de `CLAUDE.md`.
3. **`ESC2026 HF.pdf`** à la racine (document sous droits) : à retirer si le dépôt est
   public — **décision de l'utilisateur**, signalée, pas encore tranchée.
4. Source gériatrique `ESC_HF` encore libellée « ESC 2021/2023 » : relire les critères qui
   la citent avant de la renommer.
5. `IN_E03` : `med_absent` morts (agents stimulant l'érythropoïèse absents de la base).
6. Constats ouverts de `runContexteOrphelinAudit` : questions SPC, 5 items MBI,
   albuminémie < 30 g/L partiellement lues.
7. `global_score` : la moyenne des scores d'alerte remonte quand on retire des alertes
   informatives — formule à arbitrer.
8. Pas de paramètre « bicarbonate plasmatique » dans `MASTER_DB.BIOLOGIE`.

---

## 7. Contraintes permanentes (à ne jamais oublier)

- **Aucune donnée patient réelle dans le dépôt** (comptes rendus, JSON de dossiers : nom,
  date de naissance, INS). Tests sur dossiers **fictifs** uniquement.
- **Clé de signature Android** : générée en local par l'utilisateur, jamais dans la
  conversation ni dans le conteneur (secrets CI `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`,
  `KEY_ALIAS`, `KEY_PASSWORD`).
- Toute donnée chiffrée cite sa **source primaire exacte** (bon chiffre ≠ bonne source).
- Rien d'externe au chargement : pas de CDN, pas de `fetch`, pas d'`import()` (règle
  `file://`).
- Ne jamais réécrire le texte ANSM : ajouter une mise au point au rendu.
- Environnement : le SDK Android ne s'installe pas en local (CI seulement) ; le proxy
  bloque les sites d'éditeurs — demander les PDF à l'utilisateur ; un conteneur
  réinitialisé se répare par `git fetch origin main && git checkout -B main origin/main`.
