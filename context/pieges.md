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

## Synthèse (03/11)
- Repli d'une paire dans l'onglet ≠ repli au registre : chaque côté écrivait sa ligne →
  `_pairesCritiquesVues`.
- `_sevAffichee` retombait sur la sévérité déclarée sous le seuil rouge : une alerte assumée
  redevenait « danger » au bandeau.
- Fusion faite au PDF seulement (`FUSIONS_RAPPORT`) = redondance qui reste à l'écran.
- Pour inspecter l'état interne d'un cas : `analyzeCase(...)._synthData` (banner,
  toRemoveFiltered, interactCritical) ; le sandbox n'a pas de console.

## Suivi biologique (04/11)
- Une fréquence par RÈGLE recopiée sur chacun de ses paramètres → texte de la TSH sur la
  ligne ASAT. Une fréquence par PARAMÈTRE.
- `_freqShortLabel` recopie le texte brut quand il n'y trouve pas de rythme : un texte faux
  se voit tel quel dans la cellule.
- Clé de condition par sous-chaîne : `fludrocortisone` ⊃ `cortisone` ; `bisphosphonate`
  n'est pas une classe déclarée. → classe déclarée ou DCI exacte.
- Harnais : la bio se passe par identifiant de champ (`bioQtc`), pas par `BIO_031`.

## Biologie (04/11)
- Un seuil recopié d'une définition (« TG > 5,6 mmol/L ») comparé à un champ dans une autre
  unité (g/L) : vérifier l'unité du champ, pas seulement le chiffre.
- loinc.org et l'API NLM ne sont pas joignables depuis la session : vérifier les codes par
  recherche web (findacode, loinc.org en résultat).
- Lanceur de test isolé : remplacer `__dirname` par le chemin du dépôt.

## Migration (04/11)
- Changer l'unité d'un champ casse les dossiers JSON et la session déjà enregistrés :
  marquer l'unité à l'export, écarter à la relecture ce qui n'est pas marqué.

## Imputabilité (04/11)
- `split(',')` coupe dans les parenthèses → `termesImputabilite()`.
- Une conduite qui dit « diurétique de l'anse » est effacée par
  `CONDUITE_CLAUSES_CONDITIONNELLES` si le patient n'en reçoit pas, même pour dire « n'en
  donnez pas ».
- Mesurer la résolution d'un terme avec `patientHasMedClass` réel (activeMeds remplacé),
  pas avec une réimplémentation.

## Pièges de biologie (04/11)
- Le golden ne fige **pas** les cartes informatives (signature = `danger`/`warning`), et aucun
  dossier du panel ne déclenche un piège : ils ne sont gardés que par leur test dédié.
- Des boutons (« assumer ») s'insèrent entre `<div class="alert">` et `<strong>` : une
  regex de test doit tolérer ce qui les sépare.
- Le cliquet `runCouleurCodeeEnDurAudit` compte les `alert-info` littéraux : une famille de
  cartes de même nature partage UNE fonction de rendu (`_piegeBio`), sinon chaque lot l'use.
- `cmd &` dans un appel Bash survit, mais préférer `run_in_background` pour être notifié.
- Un critère d'association déjà expliqué par une comorbidité déclarée fait du bruit (CRAB
  sur l'anémie de l'IRC) : mesurer chaque nouvelle association sur le panel.
- Chevron `<` brut dans un titre de carte : casse la clé de masquage ; l'écrire en lettres.
- Avant d'ajouter une association, chercher dans l'onglet Bio du même dossier une carte qui la
  dit déjà (torsades ⊂ carte QTc ; TIH < 100 ⊂ SYND_004) : un fait, une carte.
- Modale ouverte par chaque `selectMed` : un import multiple fermait la précédente, seul le
  dernier médicament était demandé. File d'attente (`_precisionsEnAttente`, `app_ui.js`).
- OCR : un chiffre retiré par `_norm` laissait l'unité collée (« FORXIGA10mg » → « forxigamg »).
  Détacher le dosage AVANT de corriger les chiffres entre lettres, sinon « RISPERIDONE1mg »
  devient « RISPERIDONEImg ». « Vitamine » figurait comme marque de la cyanocobalamine :
  toute « VITAMINE D » était lue B12.
- Grille « Avis pharma » remplie au chargement puis seulement sur clic : additive, elle
  gardait les médicaments retirés, et le hash de mémoïsation l'ignorait.
- Playwright : le nom d'un médicament de la grille est dans `input.value`, pas dans
  `textContent` — lire le modèle, pas le DOM.
- Un score réimplémenté de mémoire dérive : HAS-BLED comptait le DFG < 50, le DOAC Score
  l'âge à 1 point et citait le mauvais auteur. Relire la table de la publication avant d'écrire.
- Extracteur de texte : « PTH » est à la fois la prothèse et la parathormone (exiger un côté) ;
  l'apostrophe ’ copiée d'un courrier ne correspond pas à ' de la base.
- La case « aspirine > 100 mg/j » poussait atcd_hemorragie : une dose déclarée devenait un
  saignement (STOPP C2 rouge, ORBIT +2). Vérifier ce qu'un contexte AFFIRME avant de le partager.
- Alias de classe contenant une clé générique (« laxatifdelest » ⊃ « laxatif ») : la Passe 2
  détourne la clé vers la nouvelle classe seule. Relire rule_keys_golden après tout ajout.
- OCR d'une capture d'écran : la police de 9 px est le vrai problème, pas l'appariement.
  Agrandir (~4 500 px de large) avant Tesseract ; mesurer sur capture FICTIVE.
- Une paire décrite depuis ses deux fiches prend la gravité la PLUS FORTE : une seule fiche
  en danger suffit à rendre l'interaction critique. Harmoniser toutes les fiches de la paire.
- Le thésaurus replié sous une carte la rend rouge (« Micromedex INTERACTION MAJEURE ») même
  quand la fiche est regradée : un plafond de gravité doit valoir pour TOUTES les lectures de
  la paire, au moment du repli, pas seulement sur l'entrée de la fiche.
- Une précision demandée et lue par personne (durée de BZD) : vérifier qu'un champ de la
  fenêtre de précision produit bien un contexte lu par une règle.
