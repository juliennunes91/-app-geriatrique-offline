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

## Architecture des données cliniques

**Attribution des sources (important)** :
- `geria_recos_final.js` → outils **gériatriques** uniquement (STOPP/START, FORTA, Beers, STOPPFrail)
- `geria_pathology_rules_v3.js` → guidelines **par pathologie** (ESC, GOLD, KDIGO, etc.)

Le cross-référencement (affichage d'une source ESC sur une alerte STOPP/START) se fait via `findEbmSource()` dans `geria_engine_v2.js` — **ne pas mélanger** les sources entre les deux fichiers.

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
