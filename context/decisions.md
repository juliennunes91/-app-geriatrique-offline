# Décisions — GeriaAssist

Format : date — décision — raison. Ajouter en fin de fichier.

- **Avant 10/2026** — La sévérité déclarée en base est le plancher de sa bande de couleur
  (`danger` ≥ 60, `warning` ≥ 30). — La bibliographie ne doit pas primer sur le risque.
- **Avant 10/2026** — Fusions, absorptions et requalifications **déclarées par identifiant**,
  jamais devinées par ressemblance de texte. — Une heuristique ferait disparaître une alerte
  réellement distincte.
- **Avant 10/2026** — Une alerte « assumée » reste affichée, plafonnée sous le rouge, avec
  son motif et sa surveillance. — Masquer emportait la surveillance avec l'alerte.
- **Avant 10/2026** — Un fait clinique, deux chemins de saisie (liste ou case) → le même
  état ; retirer le fait retire les deux. — Le résultat ne doit dépendre que du dossier.
- **Avant 10/2026** — Les imports (PDF, OCR) et l'UI moderne ne chargent que des fichiers
  locaux par `<script>`. — Ouverture en `file://`, réseau d'établissement bloqué.
- **Avant 10/2026** — Données patient réelles jamais dans le dépôt ; tests sur dossiers
  fictifs. Clé de signature Android générée par l'utilisateur, jamais dans la conversation.
- **29/10/2026** — Onglet guidelines IC réécrit depuis le texte intégral ESC 2026 (FEVG < 50 %,
  niveaux B1/B2, CST < 20 %) ; libellé de la source gériatrique `ESC_HF` laissé à 2021/2023.
  — Ne pas attribuer à 2026 des critères qui n'ont pas été relus.
- **29/10/2026** — `ddi_merged_V2.js` remplacé par `ddi_pk.js` **généré** ; trois natures
  (mesuré avec référence, prédit DDI-Predictor avec P5–P95, hérité sans référence) ;
  appariement exact des DCI ; prédictions affichées à partir de ×2 / ×0,5 (FDA modéré) ;
  retrait des estimations « modèle statique » et de l'ancienne `DDI_DB`. — Provenances
  mêlées, appariement par sous-chaîne, chiffres mal attribués.
- **31/10/2026** — Mémoire durable du projet dans `context/`, mise à jour avant chaque
  commit. — Résister aux plantages et aux compactions de conversation.
- **03/11/2026** — Le registre de synthèse inscrit la sévérité **affichée** jusque dans le
  cas d'une alerte assumée (plafonnée sous le rouge) ; une paire d'interaction n'est inscrite
  qu'une fois. — Le bandeau doit résumer l'écran, pas la déclaration.
- **03/11/2026** — Scores d'anticoagulation conditionnés : CHA₂DS₂-VA si FA, HAS-BLED /
  ORBIT-AF / DOACscore si FA ou anticoagulant. — Un score sans objet affirme une conduite
  fausse (« anticoagulation recommandée » sans FA).
- **03/11/2026** — Deux règles de même condition et même conseil : on en retire une plutôt
  que de les fusionner au rendu (`SUP_REM_10` → `EV_REM_01`).
- **04/11/2026** — Une fréquence de surveillance biologique conditionnelle à un traitement
  ne sort que s'il est prescrit (`si_med` : classe déclarée ou DCI exacte ; `si_comorb`).
  Scores QT conditionnés comme ceux d'anticoagulation. — Le plan ne doit parler que du
  traitement en cours.
- **04/11/2026** — Les codes LOINC de `MASTER_DB.BIOLOGIE` sont figés par un test après
  vérification ; un seuil de syndrome est comparé dans l'unité où il est écrit (conversion
  explicite). — 13 codes faux, et une alerte TG décalée par une confusion g/L ↔ mmol/L.
