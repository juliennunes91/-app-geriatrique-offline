# Pièges rencontrés — GeriaAssist

Bug → solution. Le détail est dans la section correspondante de `CLAUDE.md`.

## Méthode
- `node tests.js` lancé dix fois par livraison → réponses de 30 min. **Une** suite avant
  commit, vérifications ciblées par `analyzeCase`, suites en arrière-plan.
- `while pgrep -f "node tests.js"` s'attend lui-même sans fin → `run_in_background`.
- Le golden ne fige pas les onglets AUC ni guidelines : une dérive nulle n'y prouve rien.
- Relire les cartes **ajoutées** par la dérive du golden, pas seulement les retirées.

## Matching
- Sous-chaînes : `fer` ⊂ calciférol, `citalopram` ⊂ escitalopram, `codeine` ⊂
  dihydrocodéine, `statine` ⊂ cilastatine → clés < 4 car. interdites, match exact,
  classes déclarées, audits de collision.
- Une DCI composée s'écrit **normalisée** dans `drug_classes.js` (`bicarbonatedesodium`).
- `_CLASS_EXCLUDE` n'agit que sur une classe déclarée dans `DRUG_CLASSES`.
- Clé d'objet JS répétée : la seconde **écrase** la première en silence.

## Données cliniques
- Bon chiffre, mauvaise source (nitrofurantoïne ; « ritonavir + quétiapine ×6,2 » = étude
  au kétoconazole) → toujours vérifier l'attribution.
- `bioAnormal()` rend `null` pour « normal » ET pour « pas de borne » : ne pas confondre.
- L'albumine n'est pas un critère de dénutrition (GLIM).
- Retirer une affirmation fausse ne doit pas retirer l'alerte vraie qu'elle habillait
  (`SUP_STOP_049`, œstrogène).

## Rendu / UI
- Apostrophe dans une clé `onclick` : échappement JS (`\'`), pas `&#39;` → `cleAttributJs()`.
- `buildPdfContent()` lit le DOM : invérifiable en Node (rapport vide) → Playwright.
- `resetPatient()` : tout champ ajouté doit y être nommé (test d'inventaire).
- `file://` : Chrome refuse `fetch`, `import()`, `new Worker(fichier)` → scripts inline.
- Tesseract.js 5.1.1 : langue en octets désignée par `data` au lieu de `code` → patch à
  la génération.

## Environnement
- Conteneur réinitialisé → dépôt vide : `git fetch origin main && git checkout -B main origin/main`.
- Proxy : sites d'éditeurs (OUP…) bloqués → demander le PDF à l'utilisateur.
- Fichiers téléversés : copier dans un dossier dédié, lire avec `python3 -I`.
