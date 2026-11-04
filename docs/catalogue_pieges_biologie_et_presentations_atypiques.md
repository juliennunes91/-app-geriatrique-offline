# Pièges d'interprétation de la biologie et présentations atypiques du sujet âgé

Catalogue de référence pour GeriaAssist — état au 04/11/2026 (version 4.60).

**Statut**
- ✅ **implémenté** : l'application le signale quand le dossier réunit la valeur et la circonstance ;
- 🔜 **détectable** : implémentable si l'on ajoute un champ ou une précision (indiqué) ;
- 📚 **savoir clinique** : non détectable depuis une ordonnance et un bilan, à connaître.

**Vérification de la source**
- **TI** : texte intégral lu ;
- **R** : résumé (abstract) ou texte de recommandation repris par une source fiable ;
- **S** : sources secondaires concordantes ;
- **NV** : référence classique, non vérifiée pendant la session — à contrôler avant de
  l'écrire dans l'application.

Aucune entrée ne change une gravité : un piège dit **comment lire**, pas quoi conclure.

---

## 1. Pré-analytique — le tube ment avant l'automate

| # | Piège | Ce qui se passe | Statut | Référence | Vérif. |
|---|---|---|---|---|---|
| 1.1 | Pseudo-hyperkaliémie (thrombocytose, hyperleucocytose) | K⁺ libéré dans le tube pendant la coagulation | ✅ | Šálek, *Biochem Med* 2018 | S |
| 1.2 | Hémolyse du prélèvement | ↑ K⁺, LDH, ASAT, phosphore, magnésium | 📚 seul le labo la voit (index d'hémolyse) | — | NV |
| 1.3 | Garrot prolongé, poing serré | ↑ K⁺ (jusqu'à 1-2 mmol/L), ↑ protéines et calcium | 📚 | — | NV |
| 1.4 | Prélèvement sur la ligne de perfusion | dilution, ou ↑ glucose / Na / K selon le soluté | 📚 | — | NV |
| 1.5 | Délai d'acheminement, tube non centrifugé | ↓ glucose (glycolyse ~5-7 %/h), ↑ K⁺ | 📚 | — | NV |
| 1.6 | Contamination par l'EDTA (ordre des tubes) | ↑ K⁺ et ↓ Ca²⁺ ensemble, sans traduction ECG | 🔜 (K haut + Ca bas sans IRC) | — | NV |
| 1.7 | Pseudothrombopénie à l'EDTA | agrégats in vitro, ~0,1 % ; frottis + tube citraté | ✅ (thrombopénie isolée < 100) | séries et revues (Chili 2025, prévalence 0,044 %) | S |
| 1.8 | Lithiémie sur tube hépariné au lithium | lithiémie faussement élevée (cas 2,05 → < 0,1) | ✅ (dans la carte lithiémie) | manuels de laboratoire, cas rapportés | S |
| 1.9 | Lithiémie hors des 12 h | valeur ininterprétable | ✅ | idem | S |
| 1.10 | Digoxinémie < 8 h après la prise | surestimée (distribution non achevée) | ✅ | RCP Hémigoxine / Digoxine Nativelle | S |
| 1.11 | Aminosides, vancomycine : résiduelle mal datée | décision de dose faussée | 🔜 (heure de prélèvement) | — | NV |
| 1.12 | Glycémie capillaire : hypoperfusion, anémie, hématocrite haut | lecture faussée ; contrôler en veineux | 📚 | — | NV |

## 2. Interférences analytiques et médicamenteuses

| # | Piège | Ce qui se passe | Statut | Référence | Vérif. |
|---|---|---|---|---|---|
| 2.1 | Créatinine ↑ sans baisse du DFG : triméthoprime, cimétidine, cobicistat, ritonavir | blocage de la sécrétion tubulaire (OCT2/MATE), réversible | ✅ | Lepist, *Kidney Int* 2014 ; German, *JAIDS* 2012 | R |
| 2.2 | Créatinine ↑ réversible sous fénofibrate | ~+10 µmol/L, normalisée à l'arrêt | ✅ | FIELD — Davis, *Diabetologia* 2011 | R |
| 2.3 | Créatinine ↑ attendue sous IEC/ARA2 ou iSGLT2 (≤ 30 %) | hémodynamique, pas une toxicité | ✅ en partie (table `DDI_RISQUE_INSTAURATION`) | KDIGO 2024 | S |
| 2.4 | Créatinine (Jaffé) faussée : céfoxitine, corps cétoniques, bilirubine | interférence chimique | 🔜 (méthode du labo) | — | NV |
| 2.5 | T4 libre ↑ sous héparine | lipolyse in vitro, acides gras libres | ✅ | Jaume, *Thyroid* 1996 | S |
| 2.6 | TSH ↓ sous corticoïdes, agonistes dopaminergiques, analogues de la somatostatine | freinage hypophysaire sans dysthyroïdie | ✅ (corticoïdes) | Haugen, *Best Pract Res Clin Endocrinol Metab* 2009 | R |
| 2.7 | Biotine (fortes doses) et immunodosages | TSH ↓ faussement, T4/T3 ↑, troponine ↓ | 🔜 (biotine absente de la base) | alerte FDA 2017-2019 | NV |
| 2.8 | Anticorps hétérophiles, macro-TSH, macro-CK, macroprolactine | valeur haute sans maladie | 📚 discordance clinique → le labo | — | NV |
| 2.9 | Lévothyroxine mal absorbée : calcium, fer, IPP, résines | TSH haute malgré une dose « suffisante » | ✅ (conduite sous lévothyroxine) | RCP lévothyroxine | NV |
| 2.10 | Tocilizumab : CRP effondrée | infection masquée | 🔜 (absent de la base) | RCP | NV |
| 2.11 | Corticoïdes : leucocytose sans infection | démargination des neutrophiles | ✅ | Shoenfeld, *Am J Med* 1981 | R |
| 2.12 | AOD et tests de coagulation (TP, TCA, thrombophilie) | tests faussés, non interprétables | 📚 | — | NV |
| 2.13 | Rasburicase : urate effondré in vitro | prélèvement sur glace | 🔜 (absent de la base) | RCP | NV |
| 2.14 | Hydroxocobalamine (cyanure), bleu de méthylène | interférences colorimétriques multiples | 🔜 | — | NV |
| 2.15 | BNP (et non NT-proBNP) ↑ sous sacubitril/valsartan | le BNP est substrat de la néprilysine | ✅ sans objet : le champ est le NT-proBNP | ESC IC | NV |
| 2.16 | Médicaments élevant l'HbA1c ou l'abaissant (dapsone, ribavirine, hydroxyurée ↓) | durée de vie des hématies | 🔜 (absents de la base) | ADA *Standards of Care* | S |

## 3. Physiologie du sujet âgé et lecture d'un paramètre

| # | Piège | Ce qui se passe | Statut | Référence | Vérif. |
|---|---|---|---|---|---|
| 3.1 | HbA1c ↑ par la carence martiale | durée de vie des hématies allongée | ✅ | English, *Diabetologia* 2015 | R |
| 3.2 | HbA1c ↓ ou peu fiable : ASE, IRC avancée, anémie, transfusion, hémolyse | renouvellement accéléré | ✅ | ADA *Standards of Care* ; English 2015 | S |
| 3.3 | Fructosamine ↓ par l'hypoalbuminémie | glycation des protéines diminuée | 🔜 (pas de champ fructosamine) | — | NV |
| 3.4 | Hyponatrémie de translocation (hyperglycémie) | Na corrigée ≈ Na + 2,4 × (gly − 5,6)/5,6 | ✅ | Hillier, *Am J Med* 1999 | R |
| 3.5 | Pseudo-hyponatrémie (hypertriglycéridémie, myélome) avec électrode indirecte | Na faussement bas, osmolalité normale | 🔜 (TG très hauts + Na bas + osmolalité normale) | — | NV |
| 3.6 | D-dimères ajustés à l'âge (âge × 10 µg/L FEU) | seuil d'exclusion relevé après 50 ans | ✅ | ADJUST-PE, Righini, *JAMA* 2014 | R |
| 3.7 | TSH monte avec l'âge | 97,5ᵉ percentile 5,9 (70-79 ans) et 7,49 (≥ 80 ans) | ✅ | Surks, *JCEM* 2007 | R |
| 3.8 | Thyroïde en maladie aiguë (syndrome de maladie non thyroïdienne) | TSH, T4L, T3L perturbées sans thyroïdopathie | ✅ (CRP > 100 ou PCT > 2) | AACE/ATA, via revue | S |
| 3.9 | DFG surestimé en cas de faible masse musculaire | créatinine basse ; cystatine C | ✅ (IMC < 22 à ≥ 70 ans) | KDIGO 2024 | S |
| 3.10 | DFG ininterprétable hors état stable (insuffisance rénale aiguë) | les équations supposent l'équilibre | 🔜 (date de deux créatinines) | KDIGO | NV |
| 3.11 | Cockcroft-Gault ≠ CKD-EPI : paliers de dose | divergence de stade | ✅ (`#dfgDivergenceNote`) | voir `CLAUDE.md` | — |
| 3.12 | Hémoconcentration : Hb et albumine surestimées | déshydratation | ✅ | physiologie | — |
| 3.13 | Rapport urée/créatinine élevé + anémie : hémorragie digestive haute | sang digéré = charge protéique ; LR 7,5 | ✅ | Srygley, *JAMA* 2012 | R |
| 3.14 | Calcémie corrigée par l'albumine : imprécise | calcium ionisé si la décision en dépend | ✅ partiellement (formule de Payne seule) | — | NV |
| 3.15 | Magnésémie normale n'exclut pas une déplétion | 1 % du magnésium est extracellulaire | 📚 (hypokaliémie réfractaire) | — | NV |
| 3.16 | Ferritine élevée par l'inflammation | seuil carentiel à 100 si CRP haute | ✅ (encart d'anémie) | — | — |
| 3.17 | Hyperferritinémie sans surcharge | la surcharge se lit sur la saturation (> 45 %) | ✅ | EASL, hémochromatose 2022 | R |
| 3.18 | B12 normale n'exclut pas une carence | acide méthylmalonique en seconde ligne | ✅ (encart macrocytaire) | BSH, Devalia 2014 | R |
| 3.19 | B12 élevée : hépatopathie, hémopathie myéloproliférative, cancer, IRC | n'est pas une « bonne réserve » | 🔜 (pas de borne haute B12) | — | NV |
| 3.20 | Folates sériques reflètent les apports récents | un repas les normalise | 📚 | BSH 2014 | R |
| 3.21 | Microcytose avec ferritine normale : trait thalassémique | indice de Mentzer (VGM/GR) | 🔜 (pas de champ GR) | — | NV |
| 3.22 | Carence mixte (fer + B12) : VGM normal | les deux tendances s'annulent | 📚 (RDW) | — | NV |
| 3.23 | PAL élevées, GGT normale : origine osseuse | fracture, Paget, métastases, ostéomalacie | ✅ | ACG, Kwo 2017 | S |
| 3.24 | ASAT élevées + CPK élevées : origine musculaire | ASAT non hépatospécifique | ✅ | ACG, Kwo 2017 | S |
| 3.25 | GGT isolée sous inducteurs enzymatiques (carbamazépine, phénytoïne, phénobarbital) ou alcool | induction, pas hépatotoxicité | 🔜 (source à confirmer) | — | NV |
| 3.26 | Transaminases normales dans la cirrhose | masse hépatocytaire réduite | 📚 | — | NV |
| 3.27 | CPK élevées après chute avec station au sol, IM, hypothyroïdie | pas d'emblée une myopathie à la statine | ✅ (causes de la rhabdomyolyse) | — | — |
| 3.28 | Troponine chroniquement élevée en IRC | un dosage isolé est peu spécifique ; cinétique | ✅ | ESC 2023 SCA ; méta-analyse *EHJ-ACVC* | S |
| 3.29 | hs-cTnT élevée dans les myopathies squelettiques | la cTnI ne l'est pas | 🔜 (réactif déjà déclaré + CPK haute) | — | NV |
| 3.30 | NT-proBNP abaissé par l'obésité | seuils −25/−30/−40 % selon l'IMC | ✅ | ESC-HFA 2023, via étude d'Oxford | S |
| 3.31 | NT-proBNP élevé : IRC, FA, anémie, EP, sepsis, âge | ce n'est pas une décompensation | ✅ (`SYND_029`) | — | — |
| 3.32 | Procalcitonine peu spécifique en IRC avancée et en dialyse | jusqu'à 44 % entre 0,6 et 1,5 sans infection | ✅ | revue systématique 2022 | R |
| 3.33 | Procalcitonine élevée après chirurgie, traumatisme, choc | sans infection | 🔜 (contexte post-opératoire) | — | NV |
| 3.34 | CRP élevée sans infection (poussée inflammatoire, cancer, AVC) | non spécifique | 📚 | — | NV |
| 3.35 | QTc de Bazett surcorrigé quand la FC est haute | préférer Fridericia | 🔜 (pas de champ fréquence cardiaque) | — | NV |
| 3.36 | Albumine ≠ dénutrition | inflammation, hémodilution, fuites | ✅ | GLIM | — |
| 3.37 | Fraction libre des médicaments liés (valproate, phénytoïne) en hypoalbuminémie | totale normale, libre toxique | ✅ (`SUP_ALB_01`) | Doré 2017 | — |
| 3.38 | Hyperkaliémie sans traduction ECG | un ECG normal ne rassure pas | 📚 | — | NV |
| 3.39 | Lithium ou digoxine toxiques à des taux « thérapeutiques » chez l'âgé (hypokaliémie, déshydratation) | sensibilité accrue | ✅ en partie (cibles gériatriques) | — | — |

## 4. Fièvre et infection

| # | Piège | Ce qui se passe | Statut | Référence | Vérif. |
|---|---|---|---|---|---|
| 4.1 | La fièvre du sujet âgé commence plus bas | > 37,8 °C oral, répétée > 37,2 °C, ou +1,1 °C sur la base | ✅ | IDSA, High, *Clin Infect Dis* 2009 | R |
| 4.2 | Infection sans fièvre (20-30 % des infections sévères) | révélée par confusion, chute, déclin fonctionnel | ✅ (CRP > 50 ou PCT ≥ 0,5 sans fièvre) | Norman, *Clin Infect Dis* 2000 | S |
| 4.3 | Bactériurie asymptomatique : ne pas dépister, ne pas traiter | même chez le confus ou le chuteur sans signe urinaire ni fièvre | ✅ (carte confusion) ; 🔜 (champ ECBU) | IDSA, Nicolle/Trautner 2019 | S |
| 4.4 | Sonde à demeure : bactériurie attendue | ne pas traiter une colonisation | ✅ (`SUP_SAD_01`) | SPILF 2015 | — |
| 4.5 | Leucocytose absente dans une infection grave | réponse médullaire émoussée | 📚 | — | NV |
| 4.6 | Pneumopathie sans toux ni fièvre | tachypnée et confusion au premier plan | 📚 | — | NV |
| 4.7 | Abdomen aigu pauvre (appendicite, cholécystite, perforation, ischémie mésentérique) | douleur et défense modestes, sans fièvre ni leucocytose | 📚 | — | NV |
| 4.8 | Endocardite, tuberculose, abcès profond | fébricule et altération de l'état général seulement | 📚 | — | NV |
| 4.9 | Zona en phase prééruptive | douleur thoracique ou abdominale sans cause | 📚 | — | NV |
| 4.10 | Hémocultures à contaminant (staphylocoque à coagulase négative) | une seule bouteille positive | 📚 | — | NV |

## 5. Présentations atypiques — la maladie ne se présente pas comme dans le manuel

| # | Présentation | Ce qu'elle peut cacher | Statut | Référence | Vérif. |
|---|---|---|---|---|---|
| 5.1 | **Confusion aiguë** | infection, rétention urinaire, fécalome, douleur, hypoxie, hypo- ou hyperglycémie, hyponatrémie, hypercalcémie, SCA, AVC, médicament, sevrage | ✅ bilan HAS 2009 (manquants listés) | HAS, confusion aiguë 2009 | S |
| 5.2 | **Chute** | hyponatrémie même légère, hypotension orthostatique, hypoglycémie, anémie, infection, troubles du rythme, médicaments | ✅ (hyponatrémie + chutes) | Renneboog, *Am J Med* 2006 | R |
| 5.3 | **Déclin fonctionnel, « glissement »** | infection, dépression, hypothyroïdie, dénutrition, iatrogénie | 📚 | — | NV |
| 5.4 | **Syndrome coronarien aigu sans douleur** | dyspnée, malaise, confusion, chute, syncope | 📚 (troponine : dans la carte) | AHA, Alexander, *Circulation* 2007 | S |
| 5.5 | **Insuffisance cardiaque** | fatigue, nycturie, confusion, anorexie plutôt que dyspnée | 📚 | — | NV |
| 5.6 | **Embolie pulmonaire** | syncope, tachycardie inexpliquée, confusion | ✅ en partie (D-dimères ajustés) | — | — |
| 5.7 | **Hyperthyroïdie apathique** | amaigrissement, FA, dépression, sans tremblement ni hyperactivité | 🔜 (anorexie / FA + TSH non dosée) | — | NV |
| 5.8 | **Hypothyroïdie** | ralentissement pris pour une démence ou une dépression | ✅ en partie (bilan des troubles cognitifs) | HAS 2011 | S |
| 5.9 | **Hypercalcémie** | confusion, constipation, polyurie, anorexie | ✅ (bilan de la confusion demande la calcémie) | — | — |
| 5.10 | **Carence en B12** | troubles cognitifs, neuropathie, ataxie, sans anémie | ✅ (bilan des troubles cognitifs) | BSH 2014 | R |
| 5.11 | **Dépression** | plaintes cognitives (« pseudo-démence »), somatiques, douleurs | 📚 | — | NV |
| 5.12 | **Délirium hypoactif** | pris pour une somnolence ou une dépression | ✅ (sous-type déclarable) | — | — |
| 5.13 | **Rétention urinaire** | agitation, confusion (anticholinergiques, opioïdes, HBP) | ✅ (carte confusion) | — | — |
| 5.14 | **Fécalome** | confusion, diarrhée de débordement, rétention urinaire | ✅ (carte confusion, renforcé si constipation ou opioïde) | — | — |
| 5.15 | **Hématome sous-dural chronique** | déclin cognitif ou marche progressive après une chute minime, sous anticoagulant | 🔜 (chutes + anticoagulant + troubles cognitifs) | — | NV |
| 5.16 | **AVC ou leurre d'AVC** | hypoglycémie sous sulfamide ou insuline mimant un déficit | ✅ en partie (hypoglycémie iatrogène) | — | — |
| 5.17 | **Artérite à cellules géantes** | asthénie, anorexie, fébricule, pseudopolyarthrite ; CRP | 📚 | — | NV |
| 5.18 | **Insuffisance surrénale** (arrêt brutal d'une corticothérapie) | fatigue, chutes, hyponatrémie, hypotension | 🔜 (corticoïde arrêté + hyponatrémie) | — | NV |
| 5.19 | **Douleur chez le dément** | agitation, refus de soins, cris | 📚 | — | NV |
| 5.20 | **Déshydratation** | soif absente, pli cutané trompeur ; hypernatrémie | ✅ (hypernatrémie, hémoconcentration) | — | — |
| 5.21 | **Anémie attribuée à l'âge** | carence, saignement, myélodysplasie | ✅ (encart d'orientation) | — | — |
| 5.22 | **Effet indésirable pris pour une maladie nouvelle** (cascade de prescription) | | ✅ (cascades iatrogènes) | — | — |
| 5.23 | **Syndrome sérotoninergique, malin des neuroleptiques, intoxication anticholinergique** | confusion fébrile mise sur le compte d'une infection | ✅ en partie (`SYND_043`, charge anticholinergique) | — | — |
| 5.24 | **Hypothermie** | confusion, bradycardie ; sepsis grave sans fièvre | 📚 | — | NV |

## 6. Associations et triades — ce que plusieurs anomalies disent ensemble

Une anomalie isolée oriente peu ; leur réunion désigne un diagnostic. Chaque association
détectée porte sa sévérité dans une table déclarée (`ASSOCIATIONS_BIO`, `app_analysis.js`) :
**une suspicion n'est jamais rouge**, le texte dit quoi faire.

| # | Association | Déclencheur | Statut | Référence | Vérif. |
|---|---|---|---|---|---|
| 6.1 | **CRAB → myélome** | ≥ 2 de : Ca > 2,75 ; insuffisance rénale (créat > 177 ou DFG < 40) **non expliquée par une IRC déclarée** ; Hb < 10 | ✅ orange | IMWG, Rajkumar, *Lancet Oncol* 2014 | S |
| 6.2 | **Hypercalcémie + phosphore bas → hyperparathyroïdie primaire** | Ca > 2,65 et P < 0,80 | ✅ info | 5ᵉ atelier international (Bilezikian 2022) ; NICE NG132 | S |
| 6.3 | **Lyse tumorale biologique** | cancer déclaré + ≥ 2 de urate ≥ 476, K ≥ 6, P ≥ 1,45, Ca ≤ 1,75 | ✅ orange | Cairo-Bishop | S |
| 6.4 | **Angiocholite (triade de Charcot incomplète)** | T ≥ 38 °C, CRP ≥ 10 ou leucocytose + bilirubine ≥ 34 ou PAL/GGT > 1,5 N | ✅ orange | Tokyo Guidelines 2018 | S |
| 6.5 | **Syndrome malin des neuroleptiques** | T > 38 °C + CPK ≥ 4 N + antipsychotique ou métoclopramide | ✅ orange | Gurrera, *J Clin Psychiatry* 2011 | R |
| 6.6 | **Syndrome hyperglycémique hyperosmolaire** | glycémie ≥ 33,3 et 2 × Na + glucose > 300 | ✅ orange | ADA/EASD, *Diabetes Care* 2024 | R |
| 6.7 | **Hyponatrémie non hypotonique** | Na < 135 et osmolalité ≥ 275 | ✅ info | ESE/ESICM/ERBP 2014 | R |
| 6.8 | **Trou osmolaire** | mesurée − (2 × Na + glucose + urée) > 10 | ✅ info | Kraut, *Am J Kidney Dis* 2011 | S |
| 6.9 | **Hypokaliémie + HTA sans diurétique → hyperaldostéronisme** | K < 3,5, HTA déclarée, aucun diurétique | ✅ info | Endocrine Society, Funder 2016 (mise à jour 2025) | R |
| 6.10 | **Hyponatrémie + hyperkaliémie → insuffisance surrénale** | Na < 135, K > 5, sans médicament hyperkaliémiant ni DFG < 30 | ✅ info | Endocrine Society, Bornstein 2016 | R |
| 6.11 | **BRASH** (bradycardie, insuffisance rénale, ralentisseur nodal, choc, hyperkaliémie) | K > 5, bradycardie déclarée, DFG < 60, bêtabloquant/vérapamil/diltiazem/digoxine/amiodarone | ✅ orange | Farkas, *J Emerg Med* 2020 | R |
| 6.12 | **Anémie + thrombopénie → microangiopathie thrombotique** | anémie, plaquettes < 150, leucocytes non bas | ✅ info | BSH, Scully 2023 | S |
| 6.13 | **Profil biologique d'alcoolisation** | ASAT/ALAT ≥ 2 avec GGT haute ou VGM > 100 | ✅ info (non spécifique, dit) | revues ; ratio non spécifique | S |
| 6.14 | **Encéphalopathie de Wernicke** | alcool + confusion + dénutrition (2 critères de Caine sur 4) | ✅ orange | EFNS, Galvin 2010 | R |
| 6.15 | **Triade de Hakim → hydrocéphalie à pression normale** | chutes + incontinence + troubles cognitifs | ✅ info | critères internationaux 2005 / japonais | S |
| 6.16 | **Hémolyse** | anémie + réticulocytes et bilirubine au-dessus des bornes | ✅ info | BSH, Hill 2017 | S |
| 6.17 | **Rhabdomyolyse avec atteinte rénale** | CPK > 5 N + créatinine haute ou DFG < 60 (± K > 5 : ECG) | ✅ orange | Bosch, *NEJM* 2009 | S |
| 6.18 | SIADH (diagnostic d'exclusion) | hyponatrémie hypotonique, Uosm > 100, natriurèse > 30 sans diurétique ; hypothyroïdie, insuffisance surrénale et rénale à écarter | ✅ (champs `bioOsmU`, `bioNaU`, dans la carte d'hyponatrémie) | ESE/ESICM/ERBP 2014 | R |
| 6.19 | Syndrome sérotoninergique (critères de Hunter) | signes neuromusculaires cliniques | 📚 (`SYND_043` : association de médicaments) | — | NV |
| 6.20 | Hyperthyroïdie + FA | TSH basse et FA | 📚 (dans la carte thyroïdienne) | — | — |
| 6.21 | Triade de Whipple (hypoglycémie documentée) | symptômes + glycémie basse + correction | 📚 | — | NV |
| 6.22 | **Agranulocytose médicamenteuse** | PNN < 1,0, ou < 1,5 avec fièvre, sous antithyroïdien ou clozapine | ✅ orange | ATA 2016 ; RCP clozapine | S |
| 6.23 | **Crise thyrotoxique** | TSH < 0,1, T4L/T3L hautes + fièvre ou confusion | ✅ orange | ATA 2016 (score de Burch-Wartofsky) | S |
| 6.24 | **Coma myxœdémateux** | hypothyroïdie avérée + confusion + hypothermie < 35 °C, Na < 130 ou hypoglycémie | ✅ orange | Popoveniuc 2014 (score) | S |
| 6.25 | **Atteinte hépatique aiguë avec coagulopathie** | ASAT ou ALAT > 3 N + INR > 1,5 sans anticoagulant ; confusion → insuffisance hépatique aiguë ; paracétamol → N-acétylcystéine | ✅ orange | EASL, Wendon 2017 | S |
| 6.26 | **Diabète insipide** (néphrogénique sous lithium) | Na > 145 + osmolalité urinaire < plasmatique (mesurée ou calculée) | ✅ orange | revues de cas ; prévalence 20-40 % sous lithium prolongé | S |
| 6.27 | **Syndrome sérotoninergique** | ≥ 2 agents sérotoninergiques + fièvre > 38 °C ou confusion → chercher le clonus | ✅ orange | Hunter, Dunkley *QJM* 2003 | R |
| 6.28 | **Hématome sous-dural** | chutes + anticoagulant ou antiagrégant hors aspirine + troubles cognitifs ou confusion | ✅ info | NICE NG232, 2023 | S |
| 6.29 | **Ictère cholestatique apyrétique avec amaigrissement** | bilirubine ≥ 34 + PAL/GGT > 1,5 N, sans fièvre, dénutrition ou anorexie | ✅ info | ACG, Kwo 2017 | S |
| 6.30 | **Hypercalcémie + PAL osseuses** | Ca > 2,65 + PAL haute, GGT normale (remplace alors le piège « PAL osseuses ») | ✅ info | ACG, Kwo 2017 | S |
| 6.31 | DRESS (fièvre, éosinophilie, cytolyse sous allopurinol, carbamazépine…) | pas de champ éosinophiles | 🔜 | RegiSCAR | NV |
| 6.32 | Acidose lactique sous metformine | lactates + metformine + DFG < 30 | ✅ en partie (imputabilité de `SYND_038`) | RCP metformine | — |

---

## Ce qu'il faudrait ajouter pour détecter davantage

Par ordre d'intérêt clinique :

1. **Date de chaque créatinine** (deux valeurs) → insuffisance rénale aiguë, DFG non interprétable (3.10).
2. **Fréquence cardiaque** → QTc de Fridericia (3.35).
3. **ECBU / bandelette urinaire** → bactériurie asymptomatique (4.3). *(Osmolalité et natriurèse urinaires : ajoutées en 4.50.)*
4. **Corticothérapie arrêtée récemment** (précision) → insuffisance surrénale (5.18).
5. **Heure de prélèvement** (lithium, digoxine, aminosides, vancomycine) → 1.9-1.11.
6. **Globules rouges, RDW** → trait thalassémique, carence mixte (3.21-3.22).
7. **Biotine, tocilizumab, rasburicase** dans la base → 2.7, 2.10, 2.13.
