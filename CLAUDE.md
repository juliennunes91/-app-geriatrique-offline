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

## Onglet Vaccination

Relevé du carnet vaccinal du sujet âgé. Module dédié : `app_vaccination.js` (chargé
après `app_psy_scores.js`), conteneur `#vaccination-container` dans `tab-vaccination`
(présent dans les deux UIs), modèle `window.vaccinationData`.

**Quatre statuts, dont un qui n'est pas un détail d'ergonomie** : `fait` (avec date),
`a_faire`, `refus`, et surtout **`inconnu`** — le cas le plus fréquent en pratique,
quand le carnet n'est pas disponible. Un vaccin dont on ne sait rien n'est ni fait ni à
faire : le noter « à faire » expose à une injection redondante, le noter « fait » à une
absence de protection tenue pour acquise. Le rapport lui consacre donc sa propre
rubrique, « statut non documenté — à vérifier au carnet ».

- **Invariant statut/date** : quitter `fait` purge la date. Une date de vaccination sans
  vaccination faite est une contradiction que l'export irait imprimer. Testé, et validé
  par mutation.
- Liste de référence pré-remplie au statut `inconnu` (grippe, pneumocoque, COVID-19,
  dTP, zona, VRS) — **repères de périodicité, non des recommandations opposables** : le
  calendrier vaccinal en vigueur prévaut. Le pré-remplissage est non destructif.
- Les trois critères START v3 sur les vaccins (`IN_L01`, `IN_L02`, `IN_L03`) sont
  déclarés `type: "manual_review"` : le moteur les rejette d'emblée et ils ne se
  déclenchent jamais (ils font partie des 13 règles indéclenchables par construction).
  Cet onglet est l'endroit où cette revue manuelle a lieu.
- Sérialisé dans l'export JSON (clé `vaccination`), purgé par `resetPatient()`, intégré
  au PDF de synthèse sur toggle explicite (`buildVaccinationReportBlock`).
- `app_vaccination.js` est chargé par `oracle_harness.js` : ses invariants sont testables
  sans navigateur, contrairement à PAAM et à l'avis pharmaceutique.

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

## Panel de patients & couverture des règles (golden-master)

`PANEL` (`tests_audit_extended.js`) contient **106 patients** : 25 archétypes
écrits à la main + 81 patients de couverture nommés `cov_<ID_RÈGLE>[_<ID2>]`.
Il alimente le golden-master (`tests_golden_master.json`) et un second audit.

**Deux pièges qui ont déjà faussé une mesure — ne pas les refaire :**

1. **Ne JAMAIS mesurer la couverture par les titres d'alertes.** Le moteur
   **fusionne et réécrit** les titres au rendu (EV_D01 et EV_D02 ressortent tous
   deux sous « Antidépresseurs tricycliques chez le sujet âgé »). Seuls les
   **identifiants de règle** font foi ; ils survivent dans le HTML via
   `maskGeriaAlert('id:…')`.
2. **13 règles sont indéclenchables par construction** : `checkRuleOptimized`
   (`geria_engine_v2.js`) rejette d'emblée `type: 'manual_review'` et
   `type: 'duplication_check'`. Les exclure du dénominateur (247 déclenchables
   sur 260, dont **235 couvertes = 95 %**).

**Outil** — `node tools/coverage_panel.cjs` (rapport) ou `--generate` (dérive les
patients manquants depuis les conditions déclarées par les règles : `med_keys`
résolues par inversion exacte de `matchesDrugClass`, contextes ← cases à cocher,
seuils bio). Chaque patient généré est **vérifié** : il ne sort que s'il
déclenche réellement sa règle cible.

**À faire après tout ajout de règles** : lancer l'outil, coller les patients
proposés dans `PANEL`, puis `GOLDEN_UPDATE=1 node tests.js && node tests.js`.
Relire la dérive du golden : elle doit correspondre exactement à l'intention.

## Risque QT — source unique de vérité

`qtRiskLevel()` (`utils.js`) est le **seul** point de lecture du risque QT.
La base emploie plusieurs notations héritées pour une même catégorie —
`KR`, `(RE)`, « Known Risk », « Risque Etabli » — et un `includes('(KR)')` naïf
avait laissé **19 médicaments à risque établi invisibles** (méthadone,
dompéridone, moxifloxacine…). Tout nouveau consommateur doit passer par cette
fonction : 3 = établi, 2 = possible, 1 = conditionnel (CR ou SR), 0 = aucun.

- `qt_cr {mecanisme, conditions[]}` : le risque **conditionnel** n'est compté que
  si la condition propre au médicament est réunie chez le patient (`hypoK`,
  `hypoMg`, `hypoCa`, `bradycardie`, `association_qt`, `substrat_qt_coprescrit`).
  `surdosage` n'est pas détectable — une règle qui n'aurait QUE cette condition
  ne se déclencherait jamais (invariant de test dédié).
- `qt_divergence {statut, libelle, detail, source}` : trace les classifications
  **non consensuelles** (hors listes CredibleMeds, mécanisme non-QT, preuve
  négative). Affiché en pastille « ⚠QT? » à l'ajout du médicament et en encart
  dans l'onglet Suivi.
- Référence officielle : `qt_ref_crediblemeds.json` (Known + Possible).
  L'appariement avec la base doit gérer les graphies FR/EN (`Ciprofloxacine` vs
  `Ciprofloxacin`) — un appariement strict sautait silencieusement 17 molécules.

## Application Android (APK)

Coquille WebView native dans `android/`, sans Capacitor ni Cordova. Distribution
par **Releases GitHub** (tag `v*`) ou build manuel (`workflow_dispatch`).
Paquet : `io.github.juliennunes91.geriaassist`.

- **Le SDK Android n'est pas installable dans l'environnement de développement**
  (`dl.google.com` bloqué) : la compilation se valide **en CI**, pas en local.
- Les assets ne sont **pas dupliqués** dans le dépôt : une tâche Gradle les copie
  depuis la racine. Exclus de l'APK : `index_modern.html` (dépend de Tailwind CDN,
  inutilisable hors ligne), `sw.js` (son `cache.addAll()` atomique référencerait
  un fichier retiré), le moteur Tesseract non-SIMD, les harnais de test.
- **Trois adaptations WebView indispensables** : les exports PDF/JSON passent par
  un shim injecté (`html2pdf` produit un `blob:` + clic d'ancre que la WebView
  ignore **silencieusement**) ; l'OCR exige `onShowFileChooser` ; `localStorage`
  exige `domStorageEnabled`. Contenu servi via `WebViewAssetLoader` sur
  `https://appassets.androidplatform.net` — **pas** en `file://`, qui interdit
  workers et WASM.
- **Signature** : sans le secret `KEYSTORE_BASE64`, la CI signe avec la clé debug.
  Changer de clé ensuite impose une désinstallation/réinstallation (Android refuse
  un changement de signature). Secrets attendus : `KEYSTORE_BASE64`,
  `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
- L'UI web détecte la coquille via l'UA (`GeriaAssistApp/`) pour masquer le bouton
  « UI Moderne » et ne pas enregistrer le service worker.

## Ergonomie mobile (UI classique)

Corrections sous `@media (max-width: 576px)` dans `geria-theme.css` — le rendu
grand écran doit rester inchangé.

- **Libellés de cases à cocher** : 73 des 87 `<label class="form-check-label">`
  n'avaient pas d'attribut `for`, donc taper le texte ne cochait rien.
  `linkOrphanCheckboxLabels()` (`app_ui.js`) les apparie automatiquement au
  chargement — préférer cela à l'édition de dizaines de balises.
- **Piège Bootstrap** : `.form-check` reçoit `padding-left:1.5em` et le curseur
  `margin-left:-2.5em` ; la classe utilitaire `p-2` écrase ce padding et fait
  **sortir le curseur de son conteneur**. Ajouter un `padding-left` explicite.

## Criticité affichée — la sévérité déclarée est un plancher

`computeAlertScore()` (`geria_engine_v2.js`) faisait dépendre la **couleur** d'une
alerte du nombre de sources citées : `danger` = 40 pts, seuil rouge = 60, bonus de
consensus jusqu'à **+38**. Une contre-indication de RCP citée par une seule source
restait donc orange pendant qu'un PIM à huit sources passait au rouge — 58 des 111
règles `danger` déclenchées sur le panel n'atteignaient jamais le rouge.

**La sévérité déclarée en base est désormais le plancher de sa propre bande** :
`danger` ≥ 60, `warning` ≥ 30 (`SCORE_MIN_CRITIQUE` / `SCORE_MIN_IMPORTANT`). Le
score continue de trier AU-DESSUS du plancher. Ne jamais rétablir une graduation
qui laisse la bibliographie primer sur le risque encouru.

Corollaire : le rendu ne doit pas court-circuiter le scoring. `DUPLICATE_WATCH`
(`app_analysis.js`) codait `alert-warning` en dur pour toutes les classes — un
doublon d'anticoagulants curatifs était gradué comme un doublon de statines. Chaque
entrée porte maintenant sa `severite`.

## Collisions de sous-chaîne — deux familles, deux audits

1. **Collision de DCI** (citalopram ⊂ escitalopram) → `runCollisionAudit`.
2. **Collision de LIBELLÉ DE CLASSE** — invisible pour l'audit ci-dessus, qui appelle
   le matcheur avec `classe = ''`. C'est cette famille qui a produit les faux positifs
   les plus coûteux : `paracetamol` ⊂ la classe du **néfopam** (« alternative
   paracétamol »), `calcique` ⊂ « … déficit calcique » (carbonate de calcium reconnu
   inhibiteur calcique ET antihypertenseur), `statine` ⊂ cila-**statine**, `corticoide`
   ⊂ « corticoïde **inhalé** », `thyroidien` ⊂ « **anti**thyroïdien » (carbimazole pris
   pour une hormone substitutive), `fer` ⊂ calci-**fér**-ol.
   → `runRuleKeyResolutionAudit` fige, pour **chaque clé employée par le corpus**, la
   liste des médicaments qu'elle résout, avec le vrai `classe` (`rule_keys_golden.json`).

Trois garde-fous à connaître dans `matchesDrugClass()` :
- `_CLASS_EXCLUDE` teste le **libellé de classe**, `_CLASS_EXCLUDE_DCI` teste la **DCI**
  (nécessaire pour les collisions passant par `dciSuffix`).
- une clé de **moins de 4 caractères** ne matche plus par sous-chaîne, ni du libellé
  **ni de la DCI** ; les acronymes légitimes (`iec`, `ara2`) sont des alias exacts.
- déclarer une molécule dans une classe la fait entrer dans `_ALL_DCIS_SET`, ce qui
  déclenche la garde « match EXACT » — c'est le remède aux libellés qui *citent* une
  molécule sans en être (classes mono-molécule `aspirine`, `paracetamol`).

**Invariant « aucune clé morte »** : une clé qui ne résout aucun médicament est soit
une erreur de saisie, soit une molécule absente de `MASTER_DB`. Les cas connus sont
listés nommément dans `CLES_MORTES_CONNUES` avec leur motif — on ne retire une entrée
qu'en corrigeant la règle ou en ajoutant la molécule, **jamais** en amendant le test.
Point ouvert : `IN_E03` est la seule règle dont toutes les clés `med_absent` sont
mortes (les agents stimulant l'érythropoïèse ne sont pas en base), donc elle propose
d'initier un ASE chez un patient qui en reçoit déjà.

## Le filet de régression — trois instruments, et leurs angles morts

1. **`tests_golden_master.json`** — signature par patient des 106 dossiers du panel.
   Il capture **la sévérité ET le titre** (`severity | titre`) de chaque entrée : sans la
   sévérité, un changement de gradation reste invisible — c'était le défaut de
   `DUPLICATE_WATCH`. Huit onglets sont figés, dont **`alertes-scores` et
   `alertes-synthese`**, ajoutés après avoir constaté qu'une correction du score
   anticholinergique (voies inhalées) ne produisait **aucune dérive** alors qu'elle
   changeait l'ACB de 2 à 0 sur plusieurs patients.
2. **`pathology_rules_golden.json`** — contenu de `PATHOLOGY_RULES_DB` par pathologie
   (classes INITIER/EVITER, référence, nombre de sources). L'onglet « guidelines » n'est
   volontairement PAS dans le golden des patients : il dépend des comorbidités, pas de
   l'ordonnance, et serait répété à l'identique d'un dossier à l'autre. Motivation :
   l'ajout des ASE aux traitements de la MRC n'avait été détecté par aucun test.
3. **`rule_keys_golden.json` et `class_members_golden.json`** — résolution de chaque clé
   de règle et composition de chaque classe (voir la section sur les collisions).

**Règle de méthode** : après toute modification d'un de ces instruments, le **revalider
par mutation** — casser volontairement ce qu'il est censé attraper et vérifier qu'il
échoue. Un filet qu'on étend sans le retester peut avoir été désarmé sans qu'on le voie.

## Quatre invariants issus de l'audit croisé

Quatre familles de défaut expliquaient l'essentiel des divergences des 106 dossiers.
Un audit ponctuel les trouve une fois ; l'invariant les empêche de revenir — y compris
de la main de celui qui corrige. **Deux fois pendant ce chantier, un test automatique a
rattrapé ce qu'une relecture avait laissé passer** (collision `ase` ⊂ asénapine,
neutralisation par erreur de `SUP_DEP_065`).

1. **`runTitreConditionAudit`** — le titre d'une règle ne doit pas affirmer un terrain
   que sa condition ne vérifie pas. Compare le terrain *nommé* au terrain *vérifié*
   (comorbidités résolues en clair, contextes, fragilité, âge, biologie). Sept défauts
   de cette famille avaient été trouvés à la main : `EV_SF02b`, `EV_C04`, `EV_L01`,
   `EV_D08`, `EV_SYND_051`, `EV_SYND_047`, `EV_H01`. Les cas relus et acceptés sont
   dans `TITRE_ALLOWLIST` **avec leur justification** — toute nouvelle entrée s'arbitre.
2. **`runMedAbsentOperantAudit`** — une liste `med_absent` dont *aucune* clé ne résout
   est un garde-fou inopérant : la règle propose d'initier un traitement que le patient
   reçoit peut-être déjà (défaut d'`IN_E03`). Plus fort que « aucune clé morte » : c'est
   la liste **entière** qui doit résoudre au moins un médicament.
3. **`runLibelleClasseAudit`** — un libellé de classe ne doit pas faire capter une autre
   molécule. Trois collisions de ce chantier ont été créées **en rédigeant des libellés**
   (« à distinguer des PAMORA », « dérivé PEGylé de la naloxone », « alternative
   paracétamol »). N'alerte que si la mention provoque une **vraie** fausse
   correspondance, pas sur la simple citation d'une molécule voisine.
4. **`runCouleurCodeeEnDurAudit`** — cliquet sur les couleurs de sévérité écrites en dur
   dans `app_analysis.js`. `DUPLICATE_WATCH` codait `alert-warning` pour toutes les
   classes : un doublon d'anticoagulants curatifs était gradué comme un doublon de
   statines. Une alerte issue d'une **table** doit tirer sa couleur de la sévérité de
   son entrée.

**Les quatre sont validés par mutation** : casser volontairement `EV_C04`, `IN_E03`, un
libellé de classe ou ajouter une couleur en dur fait bien échouer le test correspondant.
Un linter qui n'échoue jamais ne prouve rien — le revérifier après toute modification
de ces audits.

## Une alerte ne parle que du patient qu'on a devant soi

Trois familles de message affirmaient un fait que la prescription ne portait pas.
Le remède n'est jamais de supprimer l'information : c'est de la **rattacher à la
condition qui la rend vraie**.

1. **Commentaire d'interaction qui nomme une molécule absente.** Une entrée
   `ddi_interact_v2` s'affiche dès qu'**une** de ses `dcis` est présente, mais son
   `commentaire` est unique. Cinq entrées « Antipsychotiques » portaient une phrase
   propre à la clozapine (« Miansérine + Clozapine : agranulocytose », « Diazépam +
   Clozapine : collapsus mortel ») : un patient sous rispéridone lisait un texte
   parlant d'un médicament qu'il ne prend pas. **Scinder l'entrée** — la molécule
   citée reçoit sa propre `dcis` — plutôt que retirer la phrase.
   Invariant : **`runDdiCommentaireConjonctionAudit`**, qui n'alerte que sur une
   conjonction explicite « hôte + X ». Les phrases qui se donnent pour un cas
   particulier (« notamment… », « NB : … », citation du bras d'une étude) sont dans
   `DDI_CONJONCTION_ALLOWLIST` avec leur motif.

2. **Plan de conduite portant sur un traitement non prescrit.** `SYND_029` proposait
   « adaptation des diurétiques de l'anse, arrêt des AINS » à un patient qui ne
   recevait ni l'un ni l'autre. Le mécanisme existait déjà —
   `CONDUITE_CLAUSES_CONDITIONNELLES` dans `app_analysis.js` — il suffisait d'y
   déclarer les deux clauses. **Toute clause nommant une molécule dans un
   `CONDUITE_IMMEDIATE` doit y figurer.**

3. **Diagnostic déduit d'un seul chiffre.** Un NT-proBNP au-dessus du seuil d'âge
   n'est pas une décompensation cardiaque : chez le sujet âgé il monte aussi avec
   l'insuffisance rénale, la FA, l'anémie, l'embolie pulmonaire, le sepsis. Sans
   `PAT_002`/`PAT_003` codée, l'alerte annonce une **élévation à interpréter**,
   liste les facteurs confondants réellement présents chez ce patient, et ne
   propose aucune titration de diurétique.

**Le thésaurus ANSM n'est pas réécrit.** Il range AVK et AOD sous « anticoagulants
oraux » et rédige la surveillance pour les AVK (« contrôle de l'INR au 8ᵉ jour ») ;
affiché tel quel sous apixaban, c'est inapplicable. Le texte officiel est une
transcription — on ajoute une **mise au point au rendu** (`_noteAodAvk`), jamais une
correction dans `ddi_general.js`.

## Formes galéniques : une DCI, deux médicaments

Certaines molécules recouvrent deux produits que tout oppose. La saisie doit donc
poser la question, et la réponse doit **désarmer les règles d'un seul coup** plutôt
que d'être gatée règle par règle.

- Le mécanisme est le **marqueur de libellé de classe** (`— VOIE TOPIQUE`,
  `— VOIE ORALE NON ABSORBEE`), posé depuis la précision saisie, plus une entrée
  `_CLASS_EXCLUDE`. Attention : `_CLASS_EXCLUDE` n'est consulté que pour un
  **identifiant de classe déclaré** dans `DRUG_CLASSES` — une entrée pour une classe
  inexistante est morte sans bruit.
- **Diurétique de l'anse** : STOPP v3 lui consacre deux critères que SEULE l'indication
  sépare — première intention dans l'HTA (`EV_B07`), œdèmes isolés (`EV_B08`). Sans la
  question, les deux se déclenchaient ensemble en affirmant chacun une indication
  différente pour la même ligne. La précision `indication_diu` en désarme au moins un ;
  une indication de surcharge (insuffisance cardiaque, rénale, hépatique, syndrome
  néphrotique) les désarme tous les deux. Non renseignée, les deux restent et le rapport
  les fusionne en « préciser l'indication » — ce qui est exactement l'état de la question.
- **Amphotéricine B** : la suspension buvable n'est pratiquement pas absorbée (ni
  hypokaliémie, ni néphrotoxicité, ni interaction) ; l'injectable porte toute la
  toxicité. La forme non absorbée est en outre exclue du **matching
  `ddi_interact_v2`**, des deux côtés (`_nonAbsorbe`) — le marqueur de classe seul
  ne suffisait pas, ce matching se faisant par DCI.
- **Méthotrexate** : 7,5-25 mg par *semaine* en rhumatologie contre des doses cent
  fois supérieures en oncologie. `IN_H09` et `SUP_PIMC_04` (acide folique
  hebdomadaire) sont désarmés sur `mtx_haute_dose`, et `SUP_MTX_01` prend le relais
  avec le sauvetage folinique. **Désarmer une prévention impose d'en afficher une
  autre** — sans quoi le protocole le plus toxique devient le plus silencieux.
- Défaut par défaut : tant que la précision n'est pas saisie, on retient la forme
  **la plus exposante** (systémique, injectable).

## Masquage — ce que l'utilisateur peut écarter

`window._maskedAlerts` couvre trois familles de clés, toutes filtrées **en amont du
rendu** pour que écran, synthèse, PDF et compteurs restent cohérents :

- `id:` / `rc:` — alertes de règle (moteur, `renderSingleAlert`) ;
- `tt:<titre>|<sévérité>` — blocs HTML bruts des onglets listés dans
  `ONGLETS_MASQUABLES` (bio, interactions, ANSM, AUC) ;
- `gl:<pathologie>|<classe>` — recommandations de sociétés savantes, une par une.

La clé `gl:` porte la pathologie pour que masquer « AINS » dans l'insuffisance
cardiaque ne le masque pas dans l'arthrose. Le post-traitement
(`_recosMasquables`) ne capture que les blocs `alert … py-1 px-2` **sans `<div>`
imbriqué** : cartes et `<details>` environnants restent équilibrés — c'est
vérifiable en comptant `<div>` et `</div>` après masquage.

## DFGe : deux formules, deux usages

`calculerDFG()` (`app_ui.js`) retient **CKD-EPI 2021 dès 75 ans**, même quand le poids
est renseigné. Cockcroft-Gault porte l'âge dans sa formule — (140 − âge) — et s'appuie
sur le poids TOTAL : chez le sujet âgé sarcopénique il sous-estime nettement. Sur une
patiente de 84 ans (55 kg, créatinine 126 µmol/L) il rend 25 ml/min quand CKD-EPI rend
36 — l'écart enjambe le seuil de 30 qui contre-indique plusieurs molécules.

**Les deux formules ne servent pas à la même chose** et l'application n'en garde qu'une
valeur : CKD-EPI stadifie la maladie rénale (KDIGO 2024), Cockcroft-Gault est celle sur
laquelle les RCP ont calé leurs paliers d'adaptation posologique (AOD, gabapentine,
allopurinol). Dès que les deux tombent dans des paliers différents (15/30/50/60),
l'encart `#dfgDivergenceNote` affiche **les deux valeurs** et rappelle laquelle sert à
quoi. Ne jamais supprimer cet encart en croyant simplifier : c'est lui qui empêche de
doser un anticoagulant sur un estimateur qui n'a pas servi à établir le palier.

## Le rapport PDF n'est pas l'écran imprimé

L'export est lu par un tiers — confrère, pharmacien, IDE — hors de l'application. Sur
un dossier de 17 médicaments il sortait 23 « prescriptions inappropriées » toutes
rendues avec la même insistance, des identifiants internes en tête de phrase, des
flèches en guise de verbe et des titres répétés mot pour mot dans leur propre détail.
Tout est traité **au rendu** (`buildPdfContent`, `app_core.js`) — on ne réécrit pas les
300 messages de la base :

- **Trois régimes selon la gravité** : `danger` reçoit l'explication complète,
  `warning` une explication courte, `info` son seul titre, regroupé en fin de section
  sous « Points de méthode ». Rien n'est supprimé, l'application affiche tout.
- **`texteClinique()`** retire l'identifiant de règle en tête (`SYND_043 :`,
  `PIM-Check :`), convertit les flèches (une seule → « d'où », une chaîne → « puis »),
  répare les élisions et pose la ponctuation finale.
- **`sansRedite()`** supprime du détail le préfixe qui répète le titre.
- **`clamp()`** coupe à la fin d'une PHRASE, plus au milieu d'un mot.
- **`FUSIONS_RAPPORT`** regroupe des règles qui, venant de référentiels différents,
  disent au lecteur la même chose (STOPP + PIM-Check sur la corticothérapie prolongée ;
  les deux critères « diurétique de l'anse » sur l'indication). Les groupes sont
  **déclarés par identifiant de règle**, jamais devinés par ressemblance — une
  heuristique ferait disparaître une alerte réellement distincte.
- **« Top actions prioritaires » ne figure PAS dans le rapport** : ce bloc ne contenait
  rien qui ne soit ailleurs (interactions critiques, alertes danger, omissions), tronqué
  à 130 caractères. Il reste à l'écran, où il sert de point d'entrée.
- **Les plafonds de troncature sont hauts** (700 caractères pour une alerte `danger`,
  450 pour une `warning`) et `clamp()` coupe à la fin d'une phrase : le rapport a maigri
  par le nombre d'entrées, pas en amputant les messages.
- **Le commentaire libre est encadré et suivi d'un filet** « Analyse automatisée
  GeriaAssist » : c'est la seule partie écrite par un humain, et fondue dans les mêmes
  cartes grises que le reste, elle se lisait comme une conclusion de l'application.
  Il est titré « Commentaire **au** prescripteur » : le rapport lui est *adressé* par
  celui qui a mené la revue d'ordonnance — ne pas rétablir « du ».
- Le panneau des scores apparie chaque `<strong>` au texte qui le suit
  (il affichait le score ACB avec le commentaire du CIA) après avoir retiré
  l'infobulle `.score-tooltip`, qui déversait la grille de cotation complète.

## Le plan biologique se range par criticité, pas par fréquence

Le bloc « Bilans à prévoir » listait les 30 paramètres du plan rangés par fréquence,
avec deux fourre-tout — « Selon contexte » et « À la demande » — qui ne sont pas des
échéances mais l'aveu qu'aucune n'a été fixée. Le lecteur y cherchait en vain ce qu'il
doit prescrire au prochain bilan. Trois paliers, dans cet ordre :

1. **À recontrôler** — le paramètre est déjà anormal chez CE patient. Valeur, unité,
   borne franchie, échéance. C'est là que le dossier parle.
2. **Surveillance d'un traitement** — groupée par échéance, avec la molécule qui
   l'impose (jusqu'au semestriel ; au palier annuel l'énumération fait plus de bruit
   que de sens, seuls les noms d'examens y figurent).
3. **Bilan de suivi des comorbidités** — le reste, en une ligne.

Ce qui n'a **ni échéance ni origine médicamenteuse** ne figure plus au plan : c'est un
examen d'orientation, pas un bilan à programmer (une case « Cancer » cochée y faisait
entrer troponine, procalcitonine, lipase et TSH). Le compte des paramètres écartés est
affiché — **jamais de réduction silencieuse** — et le tableau croisé complet reste dans
l'onglet Suivi.

## Bornes biologiques (`BIO_NORMES`, `bioAnormal()` dans `utils.js`)

`_bioStatusBadge` ne connaissait que **six** paramètres et rendait un badge VERT « OK »
pour tous les autres : une GGT à 138 UI/L, une albumine à 34 g/L et une CRP à 10 mg/L
ressortaient normales. **Un vert par défaut est pire que pas de badge** — il affirme une
normalité que rien n'a vérifiée.

- Ce sont des **seuils de signalement**, pas des intervalles de référence : ceux du
  laboratoire prévalent toujours (technique, calibrant).
- Volontairement **absentes** là où aucun seuil unique n'a de sens : INR (dépend de
  l'indication), troponine (du réactif), NT-proBNP (de l'âge — traité par `SYND_029`),
  bilan lipidique (du risque cardiovasculaire). `bioAnormal()` rend alors `null`, et le
  badge affiche « n. c. » plutôt qu'un verdict.
- Bornes propres au sexe pour créatinine, uricémie, hémoglobine, GGT, CPK, ferritine
  et QTc. Sexe inconnu → bornes féminines, plus basses donc plus sensibles.

## Ce que le rapport ne doit pas nommer

- **Libellé d'interaction** : le `classe` d'une entrée `ddi_interact_v2` ÉNUMÈRE les
  molécules couvertes, pas celles que le patient prend. Sous furosémide + venlafaxine,
  « Carbamazépine / IRSS — hyponatrémie (SIADH) » faisait lire le nom d'un antiépileptique
  absent. `_libelleInteraction()` (`app_analysis.js`) ne garde que la partie **mécanisme**
  quand le libellé nomme une molécule non prescrite ; le libellé officiel reste en infobulle.
- **Cascades iatrogéniques** : ne jamais employer la clé générique `antimuscarinique`,
  qui atteint par sous-chaîne l'alias `antimuscariniqueinhale` et capte les LAMA de la
  BPCO. Les DCI vésicales sont nommées une à une.
- **Plan biologique** : `BIO_CONDITIONNEL` retire un paramètre dont la pertinence dépend
  d'une AUTRE prescription. L'INR figure dans la cible du paracétamol (déséquilibre d'un
  AVK sous forte dose chronique) : sans AVK au dossier, une patiente sous apixaban se
  voyait réclamer un « INR mensuel » que l'INR ne sait pas mesurer.
- **Charge anticholinergique** : les voies locales sont hors du total ; elles étaient
  pourtant listées parmi les contributeurs, si bien que la somme ne correspondait pas à
  la liste qui la suivait. Elles ont leur propre ligne et **gardent leur valeur**.

## Fragilité sévère (`frailty_exclude`)

Ne s'active qu'à **CFS ≥ 7** ou case « patient fragile » cochée — le seuil de
STOPPFrail, pas la fragilité modérée. Porté par les omissions dont le bénéfice
demande des années : `IN_B02` (statine), `IN_H04` (anti-résorptif), `IN_E04` et
`IN_J01` (néphroprotection). **Ne pas** l'étendre à la vitamine D (`IN_H03`,
`IN_H05` — STOPPFrail la conserve pour la prévention des chutes), ni aux vaccins
grippe/pneumocoque, ni à `IN_B01` dont la cible s'assouplit déjà chez le fragile.

## Service Worker

À chaque ajout/renommage d'un fichier applicatif, mettre à jour :
- `sw.js` → `APP_ASSETS` ou `DATA_ASSETS`
- `sw.js` → `BUILD_ID` (incrémenter la date)

Un test le vérifie désormais : **tout `<script src>` local des deux UIs doit être
déclaré dans `sw.js`**. L'oubli ne se voyait qu'à l'usage, hors ligne, chez
l'utilisateur — l'application se chargeait à moitié, sans message.

## Mise à jour depuis le logiciel (`app_update.js`)

L'application ne rappelle jamais le serveur : c'est sa raison d'être, et c'est ce qui
permettait de travailler des mois sur une version périmée. La bannière « nouvelle
version » n'apparaissait que si le navigateur décidait de lui-même de revérifier
`sw.js`. Un bouton **« Vérifier les mises à jour »** (réglages des deux UIs) rend la
vérification explicite ; il n'y a **aucune vérification automatique au démarrage** —
réseaux d'EHPAD capricieux, et un appel silencieux n'apporterait qu'un délai.

Trois pièges, tous rencontrés et traités :

1. **`updateViaCache: 'none'` à l'enregistrement.** Sans cela le navigateur peut
   resservir un `sw.js` de son cache HTTP, et la vérification conclut à tort « à jour ».
2. **Ne PAS proposer « Redémarrer » tant que l'installation n'est pas finie.** Un worker
   fraîchement découvert télécharge encore plusieurs mégaoctets ; recharger à cet instant
   est servi par l'ANCIEN worker — l'utilisateur retrouve sa version précédente en croyant
   la mise à jour faite. C'est arrivé au premier essai. On attend l'état `installed` /
   `activated` (`_suivreInstallation`).
3. **Couleurs en ligne, jamais par classe.** L'UI classique est en Bootstrap, la moderne
   en Tailwind : `text-success` laissait le message sans couleur dans l'une des deux.

Le numéro de version a une source unique par UI, `<span id="appVersion">`, lue par le
module ; le `BUILD_ID` du service worker est affiché à côté — la version dit ce que le
code annonce, le build ce que le cache contient. La coquille Android n'a pas de service
worker : elle affiche un renvoi vers la page des versions GitHub.

## Numéro de version (IMPORTANT)

**À chaque modification fonctionnelle livrée, incrémenter le numéro de version
en pied de page dans `index.html` ET `index_modern.html`** (ligne « version X.YY
— créé par Dr Julien Nunes à l'aide de l'IA »).

- Patch (bug fix mineur, ajustement texte) → +0.01
- Mineur (nouvelle fonctionnalité, nouvelles règles, refonte d'un onglet) → +0.10

Le numéro de version du pied de page et le `BUILD_ID` du `sw.js` doivent être
bumpés dans le même commit que les changements qu'ils décrivent.
