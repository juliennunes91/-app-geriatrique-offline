# GeriaAssist — Instructions projet

## Architecture dual-UI

Ce projet maintient **deux interfaces utilisateur en parallèle**, partageant le même backend JavaScript :

- **`index.html`** — Interface classique Bootstrap (stable, référence)
- **`index_modern.html`** — Interface moderne Tailwind « Precision Curator »

Les deux fichiers chargent les mêmes scripts JS dans le même ordre et exposent les **mêmes IDs d'éléments** pour que les fonctions JS (`analyserPrescription()`, `calculerDFG()`, `renderAlertes()`, etc.) fonctionnent sans adaptation.

## Règle de synchronisation (IMPORTANT)

**À chaque modification de `index.html`, il faut appliquer la modification équivalente dans `index_modern.html`.**

Règles d'adaptation :
- Préserver tous les **IDs d'éléments** à l'identique (ex : `patientAge`, `chkFoie`, `alertes-synthese`)
- Préserver tous les **handlers `onclick`/`oninput`/`onchange`** à l'identique
- Préserver tous les **attributs `name`, `value`, `min`, `max`, `step`, `placeholder`** à l'identique
- Adapter les **classes Bootstrap → Tailwind** selon le design Precision Curator (palette cyan/teal clinique, `rounded-xl`, `bg-surface-container-lowest`, etc.)
- Adapter les **composants Bootstrap spécifiques** (modals, tabs, nav) vers leur équivalent Tailwind custom déjà présent dans `index_modern.html`

Types de modifications à synchroniser :
- Ajout/suppression/renommage d'un champ input, select, checkbox
- Ajout/suppression d'un onglet (`tab-*` + `alertes-*`)
- Modification d'un handler JS ou d'un attribut
- Nouveau bouton, nouveau modal, nouvelle section
- Changement de texte de label visible

## Onglet PAAM (Auto-administration)

L'onglet **PAAM** (Prise en charge de l'Auto-Administration des Médicaments)
implémente la procédure EHPAD du CH Cosne-Cours-sur-Loire (Annexe 1) :

- Module dédié : `app_paam.js` (chargé après `app_ui.js`)
- Conteneur DOM : `#paam-container` dans `tab-paam` (présent dans les deux UIs)
- Modèle : `window.paamData` (purgé par `resetPatient()`, sérialisé via export JSON)
- Pré-remplissage best-effort depuis MMSE, ADL, dysphagie, délirium, médicaments actifs

L'export PDF GeriaAssist intègre l'annexe PAAM si l'utilisateur a coché « Inclure
la PAAM dans l'export PDF » (toggle dans l'onglet). Un bouton **Export PDF PAAM
seul** génère un PDF dédié (annexe 1 du document du CH).

## Maladie psychiatrique primaire chronique (psychogériatrie)

Patients gériatriques porteurs d'une pathologie psychiatrique **chronique
ancienne** (antérieure à 65 ans), indépendante du vieillissement (ex.
schizophrène de 75 ans malade depuis ses 20 ans).

- 15 pathologies `PAT_055`→`PAT_069` (catégorie `Psychiatrie chronique`),
  avec entrées `PATHOLOGY_RULES_DB` + `PATHO_SYNDROME_MAP` (axées maintenance).
- Cascade UI « Maladie psychiatrique primaire chronique » (`chkPsyChronique`)
  dans les deux UIs — 15 checkboxes `chkSchizoChronique`, `chkBipolaireI`, etc.
- Contextes-clés générés : `psychose_chronique`, `trouble_thymique_chronique`,
  `psychiatrie_primaire_chronique`.

**Recontextualisation des PIM (Bloc 2)** : quand `psychose_chronique` /
`trouble_thymique_chronique` est présent, certaines alertes « à éviter »
gériatriques sont **requalifiées** (et non masquées) en « traitement de fond
à surveiller, ne pas déprescrire » via `recontextualiserPsychiatrieChronique()`
dans `app_analysis.js` (allowlist stricte d'IDs : `EV_B18`, `EV_D05`, `EV_D16`,
`EV_K02`, `EV_PRISC_02` + doublon antipsychotique). **Ne jamais** y inclure une
alerte de sécurité dure (QT, Parkinson/DCL, dysphagie). Le rendu du bandeau est
dans `renderSingleAlert()` (geria_engine_v2.js) via `a._recontextualise`.

**Surveillance dédiée (Bloc 3)** : 7 règles `SUP_PSYC_01`→`SUP_PSYC_07`
(`RECOS_SUPPLEMENT`), gatées sur `psychiatrie_primaire_chronique` /
`trouble_thymique_chronique` (sauf clozapine `age_min: 65`, LAI sur contexte,
tabac sur contexte) : dyskinésie tardive (AIMS), surveillance métabolique,
ECG/QTc + prolactine, lithium au long cours (rein/thyroïde/parathyroïde),
clozapine du sujet âgé, tabac↔clozapine/olanzapine (CYP1A2, `SUP_PSYC_06`),
antipsychotique retard LAI/dépôt (`SUP_PSYC_07`, contexte `antipsychotique_lai`
via `chkAntipsyLAI`). Complètent la recontextualisation sans dupliquer
SUP_PIMC_03/11.

**Symétrie thymique (Bloc 2)** : `trouble_thymique_chronique` requalifie
`EV_K08` (antidépresseur chuteur) et `EV_K05` (antiépileptique chuteur, garde
`requiert_med_keys` = vrai thymorégulateur présent, sinon ne touche pas p. ex.
une gabapentine antalgique).

**Rigueur chronicité (`psyOnsetAge`)** : champ « âge de début » dans la cascade.
Si ≥ 65 → forme tardive → les contextes `_chronique` ne sont PAS générés
(pas de recontextualisation), contexte `psychiatrie_debut_tardif` à la place.
Câblé dans `_pushPsy()` (app_analysis.js) + hash mémoïsation + reset.

**Scores psychiatriques** : `app_psy_scores.js` (chargé après `app_paam.js`) —
AIMS (dyskinésie tardive, critère Schooler-Kane) + syndrome métabolique
(NCEP ATP III, TG/HDL depuis la bio + tour de taille/TA saisis). Conteneur
`#psy-scores-container` (onglet Scores exp., non écrasé par
`analyserPrescription`). `window.psyScoresData` purgé par `resetPatient()`,
sérialisé en JSON. Export **« Plan de surveillance psychiatrique »**
(`exporterPsySurveillancePDF()`) : diagnostics + traitements de fond +
calendrier de surveillance daté (modèle PAAM).

## Architecture des données cliniques

**Attribution des sources (important)** :
- `geria_recos_final.js` → outils **gériatriques** uniquement (STOPP/START, FORTA, Beers, STOPPFrail)
- `geria_pathology_rules_v3.js` → guidelines **par pathologie** (ESC, GOLD, KDIGO, etc.)

Le cross-référencement (affichage d'une source ESC sur une alerte STOPP/START) se fait via `findEbmSource()` dans `geria_engine_v2.js` — **ne pas mélanger** les sources entre les deux fichiers.

## Ajout d'un médicament dans la base (PROCÉDURE OBLIGATOIRE)

**À chaque ajout d'une DCI**, suivre cette checklist dans l'ordre. Ne jamais
livrer un médicament « à moitié intégré » (entrée DB sans classe, sans interaction,
ou sans surveillance). Chaque donnée chiffrée DOIT citer sa source primaire
(RCP/AMM, STOPP/START v3, Beers 2023, PRISCUS 2.0, FORTA, ANSM, ESC/KDIGO…) —
**attribution exacte** (leçon nitrofurantoïne : bon chiffre ≠ bonne source).

### 1. Entrée `MASTER_DB.MEDICAMENTS` (`geria_database.js`)
Renseigner **tous** les champs (laisser `""`/`0`/`[]` si non applicable, jamais
absent) :
- `dci`, `princeps`, `classe` (libellé cohérent avec la famille — préfixe utilisé
  par le matching, ex. « AOD … » / « AVK … » / « β-bloquant … »).
- `poso_hab`, **`poso_ger`** (adaptation gériatrique explicite), **`poso_ren`**
  (paliers DFG), `atb_legere/moderee/severe/terminale` (posologie ATB par stade
  rénal — antibiotiques uniquement).
- `acb` / `cia` (charge anticholinergique, échelle ACB 0-3), `bhe` (passage
  barrière hémato-encéphalique), `albumine` (% liaison protéique — pour le
  déplacement), `qt_risque` (statut **CredibleMeds** : known/possible/conditional).
- `scores` `{qt, sero, saign, chute, sedat, hypoG}` (0-3) — alimente les scores
  composites ; à sourcer.
- `suivi_initial`, `suivi_periodique` (séparés par `|`), `alerte_clinique`,
  `notes_cliniques`, `source` (références EBM datées).
- `bio_cible` : liste des `BIO_xxx` de surveillance pertinents (voir §4).

### 2. Recherches littérature à faire AVANT de saisir
- Posologie **gériatrique** + adaptation **rénale** et **hépatique** (Child-Pugh).
- Statut **PIM/omission** : figure-t-il dans STOPP/START v3, Beers 2023, PRISCUS,
  FORTA, EU(7)-PIM, STOPPFrail ? Avec quel seuil (âge/dose/DFG) ?
- **QT** (CredibleMeds), **charge anticholinergique** (ACB), **liaison albumine**.
- **Métabolisme** (CYP450, P-gp) → base des interactions PK (§3).

### 3. Rattachement de classe + interactions
- `drug_classes.js` : ajouter la DCI (normalisée) dans la liste `dcis` de la
  **bonne classe**. Créer une classe seulement si nécessaire. **Ne jamais créer
  d'alias court (< 4 car.) ni ambigu** (cf. bug `beta`⊂bêtahistine, `fer`⊂calciférol).
  Si la DCI se distingue mal d'une famille sœur, vérifier qu'elle tombe du bon côté
  du préfixe de `classe` (ex. AVK vs AOD).
- Si la DCI porte une **précision** (durée/dose/indication), câbler
  `medPrecisionFamily()` (`drug_classes.js`).
- **Interactions ANSM** : ajouter la/les paires dans `ddi_general.js`
  (`d1`/`d2`/`couleur`/`details`). **Interactions PK** (magnitude) : `ddi_merged_V2.js`
  (`perpetrator`/`victim`/`auc_ratio`/`mechanism`/`note` **avec citation nommée**).
  Refléter aussi dans `ddi_interact` (texte) et `ddi_interact_v2` (structuré) de
  l'entrée MASTER_DB.

### 4. Paramètres biologiques
- Lier les `BIO_xxx` de surveillance dans `bio_cible`.
- Si le médicament introduit un **seuil bio déclencheur** (ex. « éviter si K+ > X »),
  ajouter la règle correspondante dans `geria_recos_final.js` (`condition.bio`).

### 5. Paramètres cliniques / pathologiques
- Si le médicament est un **traitement d'une pathologie** : l'ajouter dans
  `PATHOLOGY_RULES_DB` (`geria_pathology_rules_v3.js`) — bloc `TRAITEMENTS`
  (`INITIER`/`EVITER`), avec `niveau_preuve`/`niveau`, `SOURCES_EBM` et `REFERENCE`
  (guideline **existante** et datée).
- Si le médicament est un **PIM ou une omission** gériatrique : l'ajouter aux
  `med_keys`/`med_absent` des règles STOPP/START/Beers/FORTA (`geria_recos_final.js`).
- Si une **cascade UI** (checkbox/précision) est nécessaire : synchroniser
  `index.html` **ET** `index_modern.html` (IDs, handlers, attributs identiques).

### 6. Vérification obligatoire (anti-régression)
- Lancer `node tests.js` → **tout doit passer**. En particulier `runCollisionAudit`
  (audit de collision de sous-chaîne sur toute la base) : si la nouvelle DCI crée
  une collision, l'ajouter à l'`ALLOWLIST` **si légitime** (prodrogue/sel/association),
  sinon corriger la classe/denylist. Vérifier de visu qu'elle ne déclenche pas une
  alerte/interaction d'une famille sans rapport.
- Ajouter au moins un **test de bornes** si un nouveau seuil chiffré est introduit
  (bloc `SEUILS`, `tests_audit_extended.js`).

### 7. Version + Service Worker
- Bumper le numéro de version (pied de page `index.html`/`index_modern.html`) et le
  `BUILD_ID` de `sw.js` dans le même commit (voir sections dédiées ci-dessous).

## Service Worker

À chaque ajout/renommage d'un fichier applicatif, mettre à jour :
- `sw.js` → `APP_ASSETS` ou `DATA_ASSETS`
- `sw.js` → `BUILD_ID` (incrémenter la date)

## Numéro de version (IMPORTANT)

**À chaque modification fonctionnelle livrée, incrémenter le numéro de version
en pied de page dans `index.html` ET `index_modern.html`** (ligne « version X.YY
— créé par Dr Julien Nunes à l'aide de l'IA »).

- Patch (bug fix mineur, ajustement texte) → +0.01
- Mineur (nouvelle fonctionnalité, nouvelles règles, refonte d'un onglet) → +0.10

Le numéro de version du pied de page et le `BUILD_ID` du `sw.js` doivent être
bumpés dans le même commit que les changements qu'ils décrivent.
