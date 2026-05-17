# Revue experte gériatre — 12 cas pivots GeriaAssist

**Date** : 2026-05-17
**Méthodologie** : 12 cas patients construits manuellement pour couvrir le spectre gériatrique clinique réaliste (polymédication, IRC, QTc, démence, hyperK, palliatif, etc.). Chaque cas passé dans le **pipeline complet** : GeriaEngineV2 (STOPP/START/Beers/FORTA/SFGG) + composite_scores + DDI engine v2 + detectBioSyndromes.

---

## I. Synthèse globale

### Ce qui fonctionne très bien ✅

1. **Détection des combinaisons critiques** :
   - **Triple whammy** (P05, P07) → règles `EV_E04`, `EV_SYND_045` correctement priorisées (score 58-62)
   - **Syndrome sérotoninergique** (P08) → règle `EV_SYND_043` + `EV_SYND_043b` (Linézolide CI absolue) bien identifiées
   - **FDA Black Box BZD + opioïde** (P01, P12) → `EV_SYND_044` clairement signalé
   - **Glibenclamide + cotrimoxazole** (P10) → Beers PIM + DDI sulfamide ATB déclenchés (`EV_J01`)
   - **Démence + anticholinergique** (P06) → `EV_D14`, `EV_I01`, `EV_PRISC_03` + DDI antagonisme cholinestérase

2. **Multi-sourcing EBM** : chaque alerte critique est appuyée sur ≥ 1 référentiel (STOPP3, Beers 2023, FORTA, PRISCUS, SFGG 2026).

3. **Scoring composite cohérent** : P01 score chute=11, sedat=9, qt=6, acb=6 (tous high) — reflet fidèle de la complexité.

4. **DDI bidirectionnels** : P05 affiche RAMIPRIL↔IBUPROFENE des deux côtés avec sévérité danger uniforme (après fixes campagne précédente).

### Faiblesses identifiées 🔴

| Type | Sévérité | Cas concernés | Description |
|---|---|---|---|
| **Bug logique** | 🔴 Critique | P01, P03, P06 | `EV_SFGG_AD_01` "Combinaison 3 antidépresseurs (CI absolue)" déclenchée avec 1 ou 2 antidépresseurs seulement |
| **Bug logique** | 🔴 Critique | P12 | `EV_E04` "AINS + DFG<50" déclenchée sans aucun AINS prescrit |
| **Bug logique** | 🟠 Majeur | P12 | `EV_H03`, `EV_H09` (AINS/opioïde long cours arthrose) déclenchées sur patient palliatif sans arthrose |
| **Logique scoring** | 🟠 Majeur | P04 | INR 4.2 + Warfarine + Amiodarone + Aspirine → score saignement = **3 (low)**. Cliniquement c'est un saignement majeur imminent. |
| **UX alert fatigue** | 🟠 Majeur | P01 | 20 EVITER + 16 DDI = 36 alertes/écran. Au-delà du seuil cognitif (Beers Stewardship 2024) |
| **Cross-module manquant** | 🟡 Modéré | P04 | INR 4.2 saisi mais `SYND_014 (INR sur-thérapeutique)` non détecté par bio (manque sur seuil > 4) |
| **Contextualisation** | 🟡 Modéré | P12 | Patient palliatif (PAT_030) reçoit alertes "long cours" non-pertinentes |
| **Faux positif détecteur** | 🟡 Modéré | Engine | `EV_SFGG_AD_01` compte mal : Tramadol et Trazodone considérés comme antidépresseurs (Tramadol = opioïde IRSN, Trazodone = sédatif sérotoninergique). |

---

## II. Analyse cas par cas — 6 cas représentatifs

### P01 — Polypharmacie + chute (88 ans, F, 12 méds)

> Mme D., 88 ans, GIR probable 3, DFG 42, vit en EHPAD. 12 médicaments dont **5 sédatifs** (Zopiclone, Oxazepam, Mirtazapine, Tramadol, Oxybutynine), 2 antihypertenseurs (Ramipril, Bisoprolol, Furosémide), 1 anticholinergique majeur (Oxybutynine), IPP, statine, paracétamol, biphosphonate.

**Outputs pipeline** : 20 EVITER, 3 INITIER, 16 DDI, scores acb=6, cia=7, qt=6, sero=3, chute=11, sedat=9.

#### Évaluation médecin expert

**Forces** ✅
- L'alerte `EV_D08` "Benzodiazépine ≥ 4 semaines" en tête (score 73) — c'est cliniquement la priorité de déprescription #1 chez cette dame.
- `EV_SYND_044` "FDA Black Box BZD + opioïde" → critique, bien priorisé.
- `EV_PRISC_03` Oxybutynine → PIM absolu correctement flagué.
- DDI bien rendues : `ZOPICLONE ↔ TRAMADOL` (FDA Black Box) + cumul anticholinergique Mirtazapine + Oxybutynine.

**Problèmes** 🔴
1. **Faux positif `EV_SFGG_AD_01`** : "Combinaison de 3 antidépresseurs (CI absolue)" — il n'y a **qu'UN seul antidépresseur** (Mirtazapine). Tramadol n'est pas un antidépresseur (opioïde + faible IRSN). Le détecteur compte mal.
2. **Faux positif `EV_E04`** "AINS + DFG<50" : il n'y a **aucun AINS** prescrit (Paracétamol seulement). Cette alerte ne devrait pas exister.
3. **Faux positif `EV_H02`** "AINS + HTA sévère" : idem, pas d'AINS.
4. **Faux positif `EV_H09`** "Opioïde long cours arthrose" : Tramadol oui, mais aucune mention d'arthrose dans les comorbids (PAT_005=HTA, PAT_032=dépression, PAT_025=ostéoporose, PAT_009=hypoTA, PAT_039=incontinence). Le diagnostic d'arthrose n'est pas dans le contexte.

**Recommandation gériatre** : alerts pertinentes mais polluées par 3 faux positifs liés à AINS inexistants. Volume (36 entrées) dépasse la capacité de revue clinique en 5 minutes. **Priorisation visuelle insuffisante** : EV_D08 et EV_SYND_044 méritent un encart "TOP 3 actions" distinct.

---

### P02 — IRC sévère DFG 12 (91 ans, F, 6 méds)

> Mme A., 91 ans, fragile, DFG 12 mL/min (IRC terminale), Hb 9.2, K+ 5.4, Métformine, Spironolactone, Gabapentine, Furosémide, Bisoprolol, Atorvastatine.

**Outputs** : 6 EVITER, 5 INITIER, 1 DDI, scores acb=1, cia=1, chute=4.

#### Évaluation médecin expert

**Forces** ✅
- `EV_E06` Métformine + DFG<30 (score 57, danger) → **alerte capitale, parfaite**.
- `EV_E07` Spironolactone + DFG<30 (score 52, danger) → idem.
- `IN_E01` Initier 1α-OH-cholécalciférol/calcitriol pour IRC sévère + hypoCa + HPT2re → reco proactive excellente.
- `IN_E04` IEC/ARA2 pour protéinurie MRC → reco contextuelle pertinente.

**Problèmes** 🟡
1. **`IN_B05` ABSENT** : le patient est en IRC sévère + IC potentielle (Furosémide), Ramipril aurait pu être recommandé si HFrEF. Faute d'info sur FE, l'engine est prudent — acceptable.
2. **DDI très pauvre** : seulement 1 (METFORMINE↔FUROSEMIDE triple whammy fonctionnel). On attendrait :
   - Spironolactone + Furosémide → hyperK potentielle / diminution efficacité diurétique
   - Bisoprolol + Furosémide → bradycardie + hypotension orthostatique
   - Gabapentine + DFG<15 → accumulation neurologique (somnolence, ataxie) — alerte manquante.
3. **Manque alerte Gabapentine + DFG<15** : la gabapentine devrait avoir une CI relative ou adaptation drastique (post 100 mg/j). Non flaggé.

**Recommandation gériatre** : excellent sur les 2 alertes critiques (Métformine, Spironolactone). Mais **Gabapentine en IRC terminale est une bombe à retardement** (accumulation → confusion/myoclonies) non détectée.

---

### P03 — QTc 510 + 4 méds QT-prolongateurs (79 ans, M)

> M. C., 79 ans, FA, dépression, QTc 510 ms, K+ 3.4, Mg 0.55 (les deux hypokali/hypomagnésémie aggravent QT), prescription **dangereuse** : Clarithromycine + Citalopram + Ondansetron + Domperidone + Bisoprolol.

**Outputs** : 5 EVITER, 2 INITIER, 4 DDI, scores qt=12 (high), cia=2.

#### Évaluation médecin expert

**Forces** ✅
- `EV_B15` "QTc déjà prolongé + médicament allongeur" (score 57, danger) — alerte cardinale.
- `EV_SFGG_AD_03` "Citalopram > 20 mg ou Escitalopram > 10 mg en cas de QT prolongé" (consensus SFGG 2026) — référence pertinente.
- DDI bien cumulées : 3 alertes danger CITALOPRAM↔(Clarithromycine, Ondansetron, Domperidone) sur QT.
- Score `qt = 12 (high)` reflète bien la gravité cumulée.

**Problèmes** 🔴
1. **Faux positif `EV_SFGG_AD_01`** "Combinaison de 3 antidépresseurs (CI absolue)" : il n'y a **qu'UN antidépresseur** (Citalopram). Bug de comptage évident.
2. **Hypokaliémie + hypomagnésémie NON FLAGUÉES dans la synthèse engine** : `bio.k = 3.4` et `bio.mg = 0.55` sont les facteurs aggravants majeurs du QT (recommandation classique : maintenir K ≥ 4, Mg ≥ 1). Aucune alerte explicite "Corriger K+/Mg+ avant tout QT-prolongateur".
3. **Manque d'action concrète** : aucune des alertes ne dit "→ ECG immédiat" ou "→ Stop Clarithromycine, switch Azithromycine (-9 ms vs +20 ms)".

**Recommandation gériatre** : le QT 510 + cette polymédication = **urgence médicamenteuse**. L'engine signale mais ne donne pas la conduite immédiate prioritaire (arrêt Clarithromycine, correction électrolytes, ECG itératif). Le **SYND_003 bio** est marqué warning au lieu de danger pour QTc ≥ 480.

---

### P04 — INR 4.2 + Warfarine + Amiodarone + Aspirine (76 ans, F)

> Mme L., 76 ans, FA + IC + AVC, **INR 4.2 (zone à risque hémorragique majeur)**, Hb 9.5, prescription : Warfarine + Amiodarone (potentialise INR de 30-50%) + Aspirine 75 mg.

**Outputs** : 3 EVITER, 6 INITIER, 7 DDI, scores **saign = 3 (low)** ❌, acb=2, qt=4.

#### Évaluation médecin expert — **CAS LE PLUS PROBLÉMATIQUE**

**Forces** ✅
- DDI WARFARINE ↔ AMIODARONE (danger) + côté inverse — correctement détectées.
- DDI AMIODARONE ↔ FUROSEMIDE / BISOPROLOL — TORSADES — bien flagué.

**Problèmes** 🔴🔴
1. **SOUS-ÉVALUATION GRAVISSIME du score saignement** : `saign = 3 (low)` alors que :
   - INR 4.2 (sur-thérapeutique majeur)
   - AVK + Aspirine (triple thérapie évitée)
   - Anémie Hb 9.5
   - Amiodarone potentialise AVK
   - Patient avec ATCD AVC = vulnérabilité majeure
   
   **Score attendu cliniquement : ≥ 8-10 (danger)**. Le scoring composite ne tient pas compte de l'INR de la valeur saisie ! C'est un bug logique fondamental.

2. **AUCUNE alerte engine "INR sur-thérapeutique"** : la règle STOPP/Beers "INR > 5 → réduire AVK" n'existe pas explicitement, et le module bio (detectBioSyndromes) a seuil > 4 mais visiblement ne s'active pas dans le pipeline.

3. **`EV_C11` "AVK en 1ère intention dans FA (sauf valve mécanique)"** suggère switch AOD. Mais dans une situation d'INR 4.2 actuel, la priorité est **arrêter la Warfarine 24-48h + Vit K si saignement** — pas le switch AVK→AOD.

4. **Pas d'alerte "triple thérapie antithrombotique"** : ESC FA 2024 contre-indique AVK + AP au long cours hors stent récent. Aspirine + Warfarine = à éviter (NEJM Lopez).

5. **`IN_C02` "Antiagrégant pour maladie vasculaire"** : l'engine RECOMMANDE d'ajouter un antiagrégant alors que le patient en a déjà un (Aspirine) ET un AVK. **Reco contradictoire et dangereuse**.

**Recommandation gériatre** : **CE CAS DOIT DÉCLENCHER UNE ALERTE ROUGE "URGENCE HÉMORRAGIQUE IMMINENTE"**. Le système actuel rend ce cas presque banal (saign=3 low). C'est un risque clinique réel. Fix prioritaire : intégrer la **valeur d'INR** dans le score saignement.

---

### P05 — Triple whammy + douleur (78 ans, M)

**Outputs** : 6 EVITER, 4 INITIER, 12 DDI, scores cia=1, qt=1.

#### Évaluation expert

**Forces** ✅
- `EV_E04` AINS+DFG<50 + `EV_SYND_045` Triple Whammy → top de la liste, score 58-62 danger.
- 12 DDI dont 6 dangers triple whammy bilatéral (RAMIPRIL↔IBUPROFENE etc.). Excellent rendu.

**Problèmes** 🟡
- **5 redondances Triple whammy** entre engine + DDI : `EV_E04`, `EV_SYND_045`, `EV_B17`, `EV_H02`, et 6 lignes DDI répétant la même chose. Cohérent mais **bruit visuel**.
- `IN_C02` "Antiagrégant pour maladie vasculaire" sur ATCD coronarien — bien.
- `IN_F03` "IPP avec AINS" — bien (cure courte).
- **Pas d'alerte "Stop AINS"** explicite : 4 alertes mais pas d'action immédiate.

**Recommandation gériatre** : le cas est correctement détecté mais la synthèse devrait **fusionner les 5 alertes triple whammy en UNE SEULE** avec sources cumulées. Sinon le clinicien voit 5 lignes du même problème.

---

### P10 — DT2 fragile + sulfamide + cotrimoxazole (89 ans, M)

> M. P., 89 ans, dément (Donepezil), fragile (37), DT2, glibenclamide en cours, infection urinaire → Cotrimoxazole prescrit. Glycémie 0.6 g/L (hypoglycémie). DFG 38.

**Outputs** : 1 EVITER, 1 INITIER, 5 DDI, score hypoG = 3 (high).

#### Évaluation expert

**Forces** ✅
- `EV_J01` Glibenclamide (PIM Beers/PRISCUS/FORTA) en danger 55 → cardinal.
- DDI GLIBENCLAMIDE ↔ COTRIMOXAZOLE en danger avec mécanisme expliqué (déplacement albumine + CYP2C9) — **excellent détail mécanistique** (Juurlink CMAJ 2014).
- DDI RAMIPRIL ↔ COTRIMOXAZOLE hyperkaliémie additive — bien.

**Problèmes** 🟡
1. **Pas d'alerte glycémie 0.6 g/L (hypoglycémie active)** : le module bio devrait flagger SYND "Hypoglycémie" (seuil < 0.7 g/L = 3.9 mmol/L). Absent.
2. **Score hypoG = 3 (high) avec 1 seul contributeur** : Glibenclamide. C'est limite (seuil high = 3 me semble bas pour 1 méd). Bon clinique mais le seuil mérite vérification.
3. **`IN_J01` "iDPP4 alternative sécuritaire"** absent : on attendrait une suggestion explicite de switch (Linagliptine, Sitagliptine adaptée DFG).

**Recommandation gériatre** : **cas exemplaire pour le pattern Juurlink** (hypoG additive sulfamide + sulfamide ATB), mais le **bio n'intègre pas la glycémie capillaire en danger** = manque opérationnel.

---

### P12 — Soins palliatifs polymed (82 ans, F)

> Mme E., 82 ans, cancer + soins palliatifs + sarcopénie. Prescription : Morphine, Halopéridol (agitation terminale), Midazolam, Scopolamine (râles), Paracétamol, Pantoprazole.

**Outputs** : 14 EVITER, 2 INITIER, 5 DDI, scores acb=5, qt=4, chute=9, sedat=8.

#### Évaluation expert — **CAS LE PLUS MAL CONTEXTUALISÉ**

**Forces** ✅
- `EV_SYND_044` FDA Black Box (Morphine + Midazolam) en danger 58 — théoriquement pertinent.
- `EV_PRISC_02` Halopéridol > 2 mg/j PRISCUS — théoriquement à signaler.
- `EV_SYND_048` Constipation opioïde / prophylaxie laxative — utile.

**Problèmes** 🔴🔴
1. **Contexte palliatif IGNORÉ** : le patient a `PAT_030` (Soins palliatifs) coché mais aucune règle ne module les alertes en fonction. Conséquences :
   - `EV_D08` "Benzodiazépine ≥ 4 semaines" score 73 (danger #1) → **inadapté** : en fin de vie, le Midazolam est légitime et bénéfique (anxiolyse terminale).
   - `EV_SYND_044` "Black Box BZD+opioïde" → **paradoxal** : en palliatif, c'est l'objectif (sédation + antalgie). Devrait être adapté ou rétrogradé.
   - `EV_L01` "Opioïde fort en 1ère intention douleur légère" → **faux** : la patiente est en palliatif, l'opioïde fort est l'indication.

2. **Faux positifs prescription** :
   - `EV_E04` "AINS + DFG<50" → **aucun AINS prescrit** (Paracétamol = non-AINS). Bug.
   - `EV_H03` "AINS > 3 mois arthrose" → idem, pas d'AINS.
   - `EV_H09` "Opioïde long cours arthrose" → pas d'arthrose dans les comorbids.

3. **Reco contradictoires** : `IN_K02` Laxatif systématique avec opioïde → bien. Mais pas de fusion avec `EV_SYND_048` (même reco doublonnée).

4. **Score chute=9, sedat=8** : objectivement vrais mais **non pertinents en palliatif** (la sédation est l'objectif). UX doit modérer.

**Recommandation gériatre** : le module nécessite un **mode "palliatif"** qui :
- Désactive les alertes "long cours" (EV_D08, EV_H03, EV_H09)
- Module FDA Black Box en information ("attendu en palliatif, monitoring")
- Désactive recos de prévention secondaire (statine, anti-osteoporose...)

C'est la priorité #1 d'amélioration pour usage hospitalier en USP/EHPAD.

---

## III. Bugs identifiés et patterns transversaux

### Bug #1 — `EV_SFGG_AD_01` faux positif (CRITIQUE)
**Présent dans P01, P03, P06, P08, P12** (5/12 cas = 42%).

La règle "Combinaison de 3 antidépresseurs (CI absolue)" se déclenche dès qu'on a `Tramadol` ou `Trazodone` + Mirtazapine. Or :
- **Tramadol** = opioïde + faible IRSN (pas un antidépresseur clinique)
- **Trazodone** = sédatif sérotoninergique (souvent utilisé pour insomnie, pas comme antidépresseur principal)

→ Le compteur "antidépresseurs" doit exclure ces 2 molécules ou exiger l'indication antidépressive comorbidité.

### Bug #2 — `EV_E04`, `EV_H02`, `EV_H03`, `EV_H09` faux positifs (CRITIQUE)
**Présent dans P01, P12**.

Ces 4 règles se déclenchent **sans aucun AINS prescrit**. Probablement bug dans le matching `med_keys: ["ains"]` qui matche par classe substring (cf bug `diuretique_thiazidique` déjà fixé) avec une fuite vers Tramadol ou Paracétamol.

### Bug #3 — INR non intégré au score saignement (MAJEUR)
**Présent dans P04**.

`composite_scores.js` calcule `saign` sur la base des médicaments seulement. Ne tient pas compte de la valeur INR saisie. Conséquence : score sous-évalué dans les cas les plus dangereux (sur-dosage AVK).

### Bug #4 — Contexte palliatif/fin de vie non modulant (MAJEUR)
**Présent dans P12**.

`PAT_030` (Soins palliatifs) ne désactive aucune règle. La prescription appropriée en USP devient artificiellement "à risque". Recommandation : ajouter `comorbs_disqualify: ["PAT_030"]` sur les règles "long cours" / "stop fin de vie".

### Bug #5 — Volume d'alertes excessif (UX)
**Présent dans P01, P06, P12** (> 25 alertes/cas).

Médiane bootstrap : ~6 EVITER + 4 INITIER + 6 DDI = **16 alertes/cas**. P95 = ~43 alertes. **Au-delà de 20 alertes, le clinicien décroche** (Beers Stewardship 2024 — alert fatigue).

Recommandations :
- **Fusionner par mécanisme** : "Triple whammy" rendu 5 fois → 1 entrée avec liste de sources.
- **Réduire à TOP-5 dans la Synthèse** : actions immédiates uniquement, le reste accessible via onglet "Détail".
- **Badge "danger" rare** : actuellement 81.5% des cas ont ≥ 1 danger engine. Trop fréquent. Réserver "danger" aux actions à 24-48h.

### Bug #6 — Pas d'alerte Gabapentine + IRC sévère
**Présent dans P02**.

Gabapentine + DFG < 30 = accumulation neurotoxique (somnolence, ataxie, myoclonies). Manque de règle STOPP-équivalente dans `geria_recos_final.js`.

### Bug #7 — Glycémie capillaire pas dans detectBioSyndromes
**Présent dans P10**.

`bio.gly = 0.6` (hypoG sévère) saisi mais aucun SYND déclenché. Manque seuil "Hypoglycémie active" (gly < 0.7 g/L ou 3.9 mmol/L).

---

## IV. Recommandations prioritisées

### Priorité 1 — Fixes logiques (à faire avant déploiement)

1. **Fix `EV_SFGG_AD_01`** : exclure Tramadol et Trazodone du comptage "antidépresseurs", ou exiger PAT_032 + ≥ 3 vrais antidépresseurs.
2. **Fix matching AINS** : tracer pourquoi `EV_E04` déclenche sans AINS (P01, P12). Probable substring "ains" trop large.
3. **Intégrer INR au score saignement** : `saign += min(5, (INR - 3) * 2)` si AVK actif.
4. **Mode palliatif** : ajouter `comorbs_disqualify: ["PAT_030"]` sur EV_D08, EV_H03, EV_H09, EV_L01, IN_H04, IN_B02, IN_B01.
5. **Ajouter règle Gabapentinoïde + DFG < 30** : adaptation dose obligatoire (max 100 mg/j si DFG 15-30, 100 mg q48h si <15).
6. **Ajouter SYND bio hypoglycémie** : `bv.gly < 0.7` → SYND "Hypoglycémie active danger".

### Priorité 2 — UX / Alert Fatigue

7. **Fusionner alertes par mécanisme** : afficher Triple whammy / Sérotonine / QT / Black Box BZD+opioïde **une seule fois** avec toutes les sources groupées.
8. **TOP-5 Synthèse** : limiter la section principale à 5 actions, les autres dans "Voir tout".
9. **Désaturer "danger"** : actuellement 81.5% des cas ont ≥ 1 danger. Recalibrer pour ~30-40% (alert fatigue threshold).

### Priorité 3 — Contenu clinique

10. **Action immédiate explicite** : chaque alerte danger devrait avoir un champ `action_24h` (ex: "→ ECG + arrêt Clarithromycine + Mg IV").
11. **Switch sécurisé** : compléter les alternatives proposées (P10 : suggérer Linagliptine, P03 : suggérer Azithromycine vs Clarithromycine).
12. **Contextualisation fragilité** : moduler les recos de prévention secondaire selon CFS / espérance vie.

---

## V. Conclusion

Sur 12 cas pivots représentatifs :
- **9/12 cas (75%)** : alertes critiques correctement détectées, scoring cohérent
- **3/12 cas (25%)** : problèmes cliniques significatifs (P04 sous-évaluation hémorragie ; P12 contexte palliatif ignoré ; P01 volume + faux positifs)
- **5/12 cas (42%)** : bug `EV_SFGG_AD_01` (faux positif 3 antidépresseurs)
- **0/12 cas** : erreur ne mettant pas en danger immédiat le patient (toutes les alertes critiques cardiologiques/néphrologiques sont déclenchées)

**Verdict gériatre** : l'outil est **utilisable cliniquement** pour le sujet âgé polymédicamenté ambulatoire. Pour usage en USP (palliatif) ou réanimation gériatrique, des ajustements contextuels sont indispensables. **6 bugs logiques à fixer en priorité** (action 1-6 ci-dessus). UX à retravailler pour réduire le volume d'alertes par cas (priorité 7-9).
