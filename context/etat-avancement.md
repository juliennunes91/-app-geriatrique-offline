# État d'avancement — GeriaAssist

*Dernière mise à jour : 31/10/2026 — version 3.93 (`BUILD_ID` 20261029-ddi-predictor).*

## Où on en est

- Application hors ligne, deux UIs synchronisées (`index.html` Bootstrap, `index_modern.html`
  Tailwind compilé en local), APK Android en CI.
- Dernières livraisons :
  - **3.93** — interactions pharmacocinétiques refondues : `ddi_pk.js` généré par
    `tools/build_ddi_pk.cjs` depuis l'extraction DDI-Predictor (CSV brut dans
    `tools/vendor/ddi_predictor/`) et `tools/data/pk_mesures.json` (valeurs mesurées, à la
    main). Trois natures : mesuré / prédit / hérité sans référence.
  - **3.83** — recos insuffisance cardiaque (onglet guidelines) alignées sur l'ESC 2026.
  - **3.73** — OCR : appariement exact des DCI et marques.
  - Avant : imports PDF/OCR 100 % hors ligne (`file://`), import de bilan biologique PDF,
    dispositifs implantés, correcteurs de l'IRC, alertes assumées, rapport PDF allégé.
- Tests : `node tests.js` (≈ 1250, 3-4 min, une seule fois avant commit) +
  `node tools/tests_ui_playwright.cjs` (19). Tout est vert à 3.93.

## Prochaines étapes / points ouverts

- Relire les **196 valeurs PK « héritées sans référence »** (`tools/data/pk_mesures.json`,
  `n: non_source`) : retrouver la référence (→ `mesure`) ou retirer.
- Molécules DDI-Predictor absentes de la base (lidocaïne, quinine, ranolazine, glipizide…) :
  à ajouter selon la procédure médicament, puis relancer `build_ddi_pk.cjs`.
- Le PDF « ESC2026 HF.pdf » (document sous droits) est à la racine du dépôt : à retirer si
  le dépôt est public (décision de l'utilisateur).
- `IN_E03` : clés `med_absent` mortes (ASE absents de la base).
- Constats ouverts de `runContexteOrphelinAudit` : 7 questions SPC lues partiellement,
  5 items MBI, albuminémie.
- `global_score` : la moyenne des scores d'alerte remonte quand on retire des alertes
  informatives — arbitrage de formule non tranché.
- Pas de paramètre « bicarbonate plasmatique » dans `MASTER_DB.BIOLOGIE`.
