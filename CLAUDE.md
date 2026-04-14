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

## Architecture des données cliniques

**Attribution des sources (important)** :
- `geria_recos_final.js` → outils **gériatriques** uniquement (STOPP/START, FORTA, Beers, STOPPFrail)
- `geria_pathology_rules_v3.js` → guidelines **par pathologie** (ESC, GOLD, KDIGO, etc.)

Le cross-référencement (affichage d'une source ESC sur une alerte STOPP/START) se fait via `findEbmSource()` dans `geria_engine_v2.js` — **ne pas mélanger** les sources entre les deux fichiers.

## Service Worker

À chaque ajout/renommage d'un fichier applicatif, mettre à jour :
- `sw.js` → `APP_ASSETS` ou `DATA_ASSETS`
- `sw.js` → `BUILD_ID` (incrémenter la date)
