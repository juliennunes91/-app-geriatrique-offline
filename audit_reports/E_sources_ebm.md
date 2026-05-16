# AUDIT E — Sources EBM (traçabilité)
Date : 2026-05-16T09:42:09.356Z

## E.1 — Médicaments sans champ source / source vide

Total : 0 / 546


## E.2 — Sources potentiellement obsolètes (à actualiser)

### ESC HTA — ACTUALISÉ 2024 (51 entrées)
**Référence** : Mancia G et al, *2024 ESC Guidelines for the management of elevated blood pressure and hypertension*, Eur Heart J 2024.
→ Toutes les occurrences "ESC HTA 2023" ont été remplacées par "ESC HTA 2024".

### ESC HF — ACTUALISÉ 2023 (3 entrées)
**Référence** : McDonagh TA et al, *2023 Focused Update of the 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure*, Eur Heart J 2023.
→ Eplerenone, Piretanide, Spironolactone : "ESC HF 2021" remplacé par "ESC IC 2023".

### HAS 2018 ostéoporose → HAS 2023 (5 entrées) — ACTUALISÉ
**Référence vérifiée web** : *Bon usage des médicaments de l'ostéoporose — Fiche BUM*,
HAS, décision 5 janvier 2023, mise à jour publiée 24 janvier 2023.
**Nouveautés majeures** :
- Romosozumab (nouvelle classe, anti-sclérostine) intégré à l'arsenal
- Séquencement clarifié : bisphosphonate 1ʳᵉ intention → dénosumab en relais si risque élevé
- T-score < -2,5 seul **insuffisant** pour traiter : nécessite FRAX/facteurs de risque
→ Mises à jour : Acide zoledronique, Alendronate, Ibandronate, Risedronate +
  référence syndrome SYND_GIOP/ostéoporose dans `geria_pathology_rules_v3.js`.

### HAS antidépresseurs/antipsychotiques 2017 — VÉRIFIÉ, conservé
**Référence vérifiée web** : *Épisode dépressif caractérisé de l'adulte : prise en charge
en soins de premier recours*, HAS, novembre 2017 — **toujours en vigueur en 2025**
(aucune actualisation comprehensive publiée).
→ Les 39 entrées HAS 2017 (ISRS/IRSNa/tricycliques/antipsychotiques) restent valides.

### HAS 2008 AVK — VÉRIFIÉ, conservé
**Référence vérifiée web** : *Prise en charge des surdosages, situations à risque
hémorragique et accidents hémorragiques chez les patients traités par AVK*, HAS 2008 —
**toujours référence en vigueur** (complétée par ANSM 2018 sur fluindione).
→ 3 entrées (Acenocoumarol, Fluindione, Warfarine) maintenues.

### Autres HAS pré-2022 (61 entrées) — NON ACTUALISÉ
**Justification** : sans certitude d'une publication HAS plus récente pour
*chaque* indication spécifique, conservation des références originelles
pour éviter d'inventer une version inexistante.

### KDIGO 2009 transplant — VÉRIFIÉ, conservé
**Référence vérifiée web** : *KDIGO Clinical Practice Guideline for the Care of the
Kidney Transplant Recipient*, 2009. La KDIGO 2025 publiée concerne **ADPKD**
(polykystose) — **pas le post-transplant**. Aucune actualisation comprehensive
de la guideline transplant publiée à date.
→ 3 entrées (Ciclosporine, Tacrolimus, Mycophenolate mofetil) maintenues.

### ESC FA 2020 → ESC FA 2024 (5 entrées) — ACTUALISÉ
**Référence vérifiée web** : Van Gelder IC et al, *2024 ESC Guidelines for the management
of atrial fibrillation developed in collaboration with EACTS*, Eur Heart J 2024;45(36):3314.
**Nouveautés majeures impactant l'âgé** :
- AF-CARE framework (Comorbidities, Avoid stroke, Reduce symptoms, Evaluation)
- CHA₂DS₂-VA (gender-neutral) remplace CHA₂DS₂-VASc
- **Doses réduites de DOAC NON systématiques** : à appliquer uniquement si critères
  spécifiques remplis — sous-dosage = thromboses évitables (point géronto majeur)
- AVK 1ʳᵉ intention uniquement pour valves mécaniques / RM modérée à sévère
→ Mises à jour : Apixaban (Eliquis), Dabigatran (Pradaxa), Edoxaban (Savaysa),
  Rivaroxaban (Xarelto), Warfarine (Coumadine).

### Beers 2023 / STOPP-START v3 — VÉRIFIÉ, à jour
**Vérifications web** :
- AGS Beers 2023 (JAGS 2023) reste la version courante. Une publication
  *Alternative Treatments* (juillet 2025) **complète** mais ne remplace pas
  les critères centraux. Une éventuelle Beers v3-2026 n'est pas publiée à date.
- STOPP/START v3 (O'Mahony, Eur Geriatr Med 2023) : version courante.
→ 111 entrées Beers 2023 + 8 entrées STOPP/START v3 maintenues.

### ESC ACS 2023 / ESC HTAP 2022 / ACR gout 2020 / ESC arythmie 2022 — VÉRIFIÉ
Toutes confirmées comme dernières versions disponibles à date (recherche web 2026-05-16).


## E.3 — Sources minimales / RCP seul

Total : 324 médicaments avec source courte type RCP seul

  - Acebutolol : "RCP Sectral ; ESC HTA 2023"
  - Acenocoumarol : "RCP Sintrom ; HAS 2008 AVK"
  - Acide acetylsalicylique : "RCP Cardégic ; ESC SCA 2023"
  - Acide fusidique : "RCP Fucidine | SPILF 2023"
  - Acide zoledronique : "RCP Aclasta ; HAS 2018"
  - Alendronate : "RCP Fosamax ; HAS 2018"
  - Alfacalcidol : "RCP Un-Alfa ; HAS IRC 2022"
  - Alimemazine : "RCP Théralène ; HAS"
  - Alogliptine : "RCP Vipidia ; HAS DT2 2023"
  - Ambrisentan : "RCP Volibris ; ESC HTAP 2022"
  - Amikacine : "RCP Amiklin | SPILF 2023"
  - Amiloride : "RCP Modamide"
  - Aminophylline : "RCP Aminophylline | GINA 2024"
  - Amisulpride : "RCP Solian ; HAS 2017"
  - Amoxicilline : "RCP Clamoxyl | SPILF 2023"
  - Amoxicilline + acide clavulanique : "RCP Augmentin | SPILF 2023"
  - Ampicilline : "RCP Totapen | SPILF 2023"
  - Ampicilline + sulbactam : "RCP Unasyn | SPILF 2023"
  - Apraclonidine : "RCP Iopidine ; EGS 2020"
  - Aprepitant : "RCP Emend ; HAS 2022"

## E.4 — Top sociétés savantes / guidelines citées (post-actualisation)

   111 × Beers 2023
    73 × SPILF 2023
    51 × ESC HTA 2024  ← actualisé
    39 × HAS 2017
    21 × ESC IC 2023   ← actualisé (cumul +3 entrées HF)
    19 × HAS 2022
    17 × HAS 2020
    17 × FORTA-D
    14 × EULAR 2023
    13 × HAS 2023
    11 × GINA 2024
    10 × ESC FA 2024
     9 × PRISCUS
     8 × STOPP/START v3
     8 × GOLD 2024
     6 × SFGG
     5 × FDA 2011
     5 × ESC FA 2020
     4 × ESC SCA 2023 / HAS 2018 / FORTA-C / EULAR 2022 / ACR 2020 / ANSM 2018 / ESC arythmie 2022 / ANSM 2014 / ANSM 2019
     3 × HAS 2008 / HAS 2021 / KDIGO 2009

## E.5 — Synthèse actions

| Action | Volume | Source vérifiée |
|---|---|---|
| GINA/GOLD 2023 → 2024 | 11 | (commit antérieur) |
| ESC HTA 2023 → 2024 | 50 | Mancia, Eur Heart J 2024 |
| ESC HF 2021 → ESC IC 2023 | 3 | McDonagh, Eur Heart J 2023 |
| ESC FA 2020 → ESC FA 2024 | 5 | Van Gelder, Eur Heart J 2024 |
| HAS 2018 ostéoporose → HAS 2023 | 5 | Décision HAS 5 jan 2023 |
| **TOTAL actualisé** | **74 entrées** | **Toutes sources vérifiées web 2026-05-16** |
| Beers 2023, STOPP/START v3, KDIGO 2009 transplant, HAS 2017 dépression, HAS 2008 AVK, ESC HTAP 2022, ACR 2020 gout, ESC arythmie 2022, ESC SCA 2023 | ~150 | **Confirmées en vigueur — aucune mise à jour disponible** |
| Autres HAS pré-2022 (61) | 61 | Non actualisé volontairement (vérification individuelle requise) |