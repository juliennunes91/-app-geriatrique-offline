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
- **04/11/2026** — T4/T3 saisies en fraction libre (pmol/L), bornes T4L 12-22, T3L 3,1-6,8
  (choix de l'utilisateur) ; troponine : sélecteur de réactif ; phosphore : code canonique +
  alerte d'hypophosphatémie ; LDL affiché sur la ligne lipides. — Décisions de l'utilisateur.
- **04/11/2026** — Une valeur de dossier dont la grandeur a changé de définition (T4/T3
  totales → libres) n'est pas reprise sans marqueur d'unité ; ressaisie demandée. — Un
  chiffre ancien relu dans la nouvelle unité affirme un diagnostic faux.
- **04/11/2026** — Imputabilité biologique : on affiche la DCI prescrite, jamais le terme de
  la liste ; un terme ne désigne un médicament que par classe déclarée ou recherche ≥ 4 car.
  hors classe déclarée ; tout terme mort est motivé dans le test. — Listes muettes et faux
  amis (cétirizine « IEC », Lokelma « potassium »).
- **04/11/2026** — Un correcteur prescrit est jugé aussi sur la surcorrection (ASE/Hb,
  vitamine D, thyroïde) ; une règle ne déduit pas l'indication d'une valeur mesurée sous
  traitement (`EV_J09`). — Le dossier ne montre que l'état actuel.
- **04/11/2026** — Trouble ionique : on affiche les ions associés dosés et on demande les
  autres (+ ECG) ; les causes non médicamenteuses ont leur champ (`CAUSES_AUTRES`), jamais la
  liste d'imputabilité. — Demande de l'utilisateur (hypophosphatémie → Mg, K, ECG).
- **04/11/2026** — Pièges d'interprétation : carte informative, seulement si valeur ET
  circonstance réunies, titre autoportant (PDF) ; écrit dans la carte existante quand il y en
  a une. — Dire comment lire sans ajouter de bruit ni de gravité.
- **04/11/2026** — Présentation atypique : armée par un contexte déclaré (confusion, chutes,
  troubles cognitifs), jamais par l'âge seul ; deux lectures d'un même chiffre ne sortent
  pas ensemble (hémorragie digestive l'emporte sur hémoconcentration quand il y a anémie). —
  Éviter un en-tête qui sortirait chez tout le monde.
- **04/11/2026** — Association de signes = table déclarée avec sévérité par entrée, couleur
  dérivée ; suspicion plafonnée à l'orange ; un critère expliqué par une pathologie déclarée
  ne compte pas (IRC dans CRAB). — Éviter de présumer un myélome chez tout insuffisant rénal
  anémique.
- **04/11/2026** — Urines (osmolalité, natriurèse) sans bornes propres, lues dans la carte
  d'hyponatrémie selon l'arbre ESE 2014 ; le SIADH n'est nommé qu'après exclusion (diurétique,
  TSH, cortisol, DFG). Non importées du PDF. — Demande de l'utilisateur.
- **04/11/2026** — Éosinophiles (PNE) ajoutés, importés du PDF ; une éosinophilie isolée se
  tait quand une association plus précise (DRESS, NIA) l'explique. — Demande de l'utilisateur.
- **04/11/2026** — Onglet Bio en rubriques (anomalies / associations / pièges) plutôt qu'un
  onglet de plus ; pas d'en-tête pour une rubrique seule. — Choix de l'utilisateur (option 1).
- **04/11/2026** — PDF de synthèse : pas de cartes de l'onglet Bio (urgences comprises), pour
  le moment. — Choix de l'utilisateur.
- **25/11/2026** — Grille « Avis pharma » : une ligne reprise automatiquement et jamais
  touchée suit l'ordonnance (retirée avec le médicament) ; une ligne travaillée par le
  pharmacien n'est jamais supprimée, elle est signalée « retiré de l'ordonnance » /
  « suspendu ». — Signalement : médicament retiré toujours présent dans la synthèse pharma.
- **25/11/2026** — Retirer un médicament relance l'analyse si une analyse est affichée (comme
  la suspension). — Même signalement.
- **26/11/2026** — Scores de saignement calculés selon leur publication d'origine (Pisters
  2010, Aggarwal 2023) ; un DOAC Score élevé ne conclut pas à l'arrêt de l'AOD (ESC 2024).
- **27/11/2026** — Les cases qui qualifient un médicament se demandent dans sa fenêtre de
  précision ; la case reste comme second chemin de saisie, synchronisée.
- **27/11/2026** — Douleur : le statut est déclaré par le clinicien ; un score (EN, Algoplus)
  est affiché mais n'est jamais converti en « non contrôlée ».
- **27/11/2026** — Gabapentinoïde + BZD : vigilance (warning) ; danger réservé au terrain
  respiratoire (BPCO, SAOS) et à l'association avec un opioïde. — Signalement utilisateur.
- **27/11/2026** — Gabapentinoïde + opioïde : orange par défaut, rouge si dose élevée (MME ≥ 50,
  gabapentine ≥ 900, prégabaline > 300) ou terrain respiratoire. Équivalent diazépam affiché sans
  seuil (aucune source). — Demande utilisateur après point biblio.
- **27/11/2026** — Audit lot 1 : paracétamol en posologie (pas d'éviction) dans la cirrhose ;
  antécédent de MTEV ≠ indication d'anticoagulation ; constantes FC/PAS saisies (une mesure vaut
  une case). — Arbitrages confiés par l'utilisateur.
- **27/11/2026** — BZD/Z + opioïde : orange par défaut (dose faible ou inconnue), rouge à dose
  élevée (équiv. diazépam > 20 mg/j, MME ≥ 50) ou BPCO/SAOS. La carte d'interaction est plafonnée
  pour les paires sédatives (toutes sources), texte ANSM inchangé. — « 5 mg de Seresta + 1 mg de
  morphine en rouge ? un peu de pragmatisme ».
- **27/11/2026** — STOPP L1 ne sort que sur douleur légère déclarée ; sans intensité, elle est
  demandée (info). Protocoles de déprescription : informatifs (un mode d'emploi, pas un verdict).
