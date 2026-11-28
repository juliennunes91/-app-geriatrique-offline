# Inventaire des cases cliniques (généré par tools/inventaire_cases.cjs — ne pas éditer)

Règles lectrices = règles dont la condition lit le contexte produit ou la pathologie équivalente. Les lectures par le CODE (encarts SPC, recontextualisation psychiatrique, pièges biologiques) n'y figurent pas : voir docs/audit_cases_cliniques.md.

### chkAlcool — Alcool excessif
- pathologie équivalente : — · contextes : alcool
- règles lectrices (3) : EV_N03[d] EV_N04[d] IN_N01[d]
- médicaments visés : benzodiazepine, diazepam, lorazepam, oxazepam, alprazolam, bromazepam, zolpidem, zopiclone, opioid, morphine, tramadol, codeine, hydroxyzine, doxylamine, promethazine, methotrexate, paracetamol
- usages directs : app_analysis:133 ajoute(isChecked('chkAlcool'), 'Alcool'); ‖ app_analysis:813 if(_declare('chkAlcool')) ctxClinique.push("alcool");

### chkAnorexie — Anorexie / Dénutrition sévère
- pathologie équivalente : — · contextes : denutrition
- règles lectrices (1) : EV_L06[d]
- médicaments visés : paracetamol
- usages directs : app_analysis:797 if(_declare('chkAnorexie') || (getVal('patientBmi') > 0 && getVal('patientBmi') < 18.5)) c

### chkTabac — Fumeur actif (Tabagisme)
- pathologie équivalente : — · contextes : tabac
- règles lectrices (2) : IN_G03[w] SUP_PSYC_06[w]
- médicaments visés : clozapine, olanzapine
- usages directs : app_analysis:814 if(_declare('chkTabac')) ctxClinique.push("tabac"); ‖ app_analysis:3825 if (isChecked('chkTabac')) {

### chkSAD — Sonde urinaire à demeure (SAD)
- pathologie équivalente : — · contextes : sonde_urinaire_demeure
- règles lectrices (1) : SUP_SAD_01[i]
- médicaments visés : antibiotique
- usages directs : app_analysis:818 if(_declare('chkSAD')) ctxClinique.push("sonde_urinaire_demeure"); ‖ utils:309 { id: 'chkSAD', libelle: 'sonde urinaire à demeure' },

### chkPTH — Prothèse totale de hanche (PTH)
- pathologie équivalente : — · contextes : prothese_articulaire
- règles lectrices (1) : SUP_PROTH_01[i]
- médicaments visés : antibiotique
- usages directs : app_analysis:819 if(_declare('chkPTH') || _declare('chkPTG') || _declare('chkPTE')) ctxClinique.push("proth ‖ utils:310 { id: 'chkPTH', libelle: 'prothèse totale de hanche' },

### chkPTG — Prothèse totale de genou (PTG)
- pathologie équivalente : — · contextes : prothese_articulaire
- règles lectrices (1) : SUP_PROTH_01[i]
- médicaments visés : antibiotique
- usages directs : app_analysis:819 if(_declare('chkPTH') || _declare('chkPTG') || _declare('chkPTE')) ctxClinique.push("proth ‖ utils:311 { id: 'chkPTG', libelle: 'prothèse totale de genou' },

### chkPTE — Prothèse totale d'épaule (PTE)
- pathologie équivalente : — · contextes : prothese_articulaire
- règles lectrices (1) : SUP_PROTH_01[i]
- médicaments visés : antibiotique
- usages directs : app_analysis:819 if(_declare('chkPTH') || _declare('chkPTG') || _declare('chkPTE')) ctxClinique.push("proth ‖ utils:312 { id: 'chkPTE', libelle: "prothèse totale d'épaule" }

### chkAvc — ATCD d'AVC / AIT
- pathologie équivalente : PAT_008 · contextes : avc
- règles lectrices (8) : EV_B16[w] EV_B17[d] EV_B18[d] EV_C16[w] IN_B02[w] IN_C02[w] SUP_STOP_049[w] SUP_STOP_051[w]
- médicaments visés : atorvastatine, rosuvastatine, simvastatine, pravastatine, fluvastatine, pitavastatine, ains, antipsychotique, acide acetylsalicylique, aspirine, estradiol, estrogenes conjugues
- usages directs : app_analysis:809 if(_declare('chkAvc')) ctxClinique.push("avc");

### chkTvp — ATCD d'EP / TVP
- pathologie équivalente : PAT_036 · contextes : mtev
- règles lectrices (5) : IN_M01[w] SUP_STOP_010[w] SUP_STOP_011[w] SUP_STOP_012[w] SUP_STOP_050[w]
- médicaments visés : aod, avk, oestradiol oralpatch, testosterone, oestradiol oral, patch, oestrogenes conjugues
- usages directs : app_analysis:808 if(_declare('chkTvp')) ctxClinique.push("mtev");

### chkMtevActive — MTEV en cours de traitement (< 6 mois) ou récidivante
- pathologie équivalente : — · contextes : mtev_active
- règles lectrices (1) : IN_M01[w]
- médicaments visés : —
- usages directs : app_analysis:757 if(isChecked('chkMtevActive')) ctxClinique.push("mtev_active");

### chkSaignement — ATCD de Saignement majeur
- pathologie équivalente : — · contextes : risque_hemorragique, atcd_hemorragie
- règles lectrices (3) : EV_C02[d] EV_C12[d] SUP_STOP_014[w]
- médicaments visés : anticoag, antiagreg, antiagregant, isrs, citalopram, escitalopram, fluoxetine, fluvoxamine, paroxetine, sertraline, apixaban, rivaroxaban, dabigatran, edoxaban, acenocoumarol, warfarine, fluindione, tous les isrs
- usages directs : app_analysis:130 ajoute(isChecked('chkSaignement') || anemie, anemie && !isChecked('chkSaignement') ? 'Préd ‖ app_analysis:151 if (isChecked('chkSaignement')) ajoute(3, 'ATCD de saignement'); ‖ app_analysis:748 if(_declare('chkSaignement')) { ctxClinique.push("risque_hemorragique"); ctxClinique.push( ‖ app_analysis:1737 if(isChecked('chkSaignement')) { scoreOrbit += 2; ttOrbit.push("Saignement (+2)"); }

### chkBrady — Bradycardie sévère (< 45 bpm)
- pathologie équivalente : PAT_035 · contextes : bradycardie, terrain_qt
- règles lectrices (4) : EV_B04[d] EV_D17[d] EV_SFGG_AD_03[d] EV_N08[d]
- médicaments visés : betabloquant, verapamil, diltiazem, digoxine, donepezil, rivastigmine, galantamine, citalopram, escitalopram, amitriptyline, clomipramine, imipramine, doxepine, bisoprolol, atenolol, propranolol, metoprolol, nebivolol, carvedilol, ivabradine, amiodarone
- usages directs : app_analysis:741 if(_declare('chkBrady')) ctxClinique.push("bradycardie"); ‖ app_analysis:777 if (activeComorbs.includes('PAT_006') || activeComorbs.includes('PAT_035') || _declare('ch

### chkHtaNonControlee — HTA non contrôlée (>160 mmHg)
- pathologie équivalente : PAT_005 · contextes : hta_non_controlee
- règles lectrices (8) : EV_B05[w] EV_B07[w] EV_B10[w] EV_D03[d] EV_H02[d] EV_I06[w] IN_B01[w] SUP_STOP_004[d]
- médicaments visés : betabloquant, furosemide, bumetanide, venlafaxine, duloxetine, milnacipran, desvenlafaxine, ains, mirabegron, doxazosine, prazosine, terazosine
- usages directs : app_analysis:126 ajoute(isChecked('chkHtaNonControlee'), 'HTA non contrôlée'); ‖ app_analysis:812 if(_declare('chkHtaNonControlee')) ctxClinique.push("hta_non_controlee");

### chkArret — Post-arrêt cardiaque
- pathologie équivalente : — · contextes : arret_cardiaque
- règles lectrices (1) : EV_N09[w]
- médicaments visés : verapamil, diltiazem
- usages directs : app_analysis:821 if(_declare('chkArret')) ctxClinique.push("arret_cardiaque");

### chkCardioversion — Cardioversion de FA récente (< 4 sem) ou programmée
- pathologie équivalente : — · contextes : cardioversion_fa
- règles lectrices (1) : SUP_CV_01[d]
- médicaments visés : —
- usages directs : app_analysis:834 if(_declare('chkCardioversion')) ctxClinique.push("cardioversion_fa");

### chkScaAigu — Syndrome Coronarien Aigu (IDM récent)
- pathologie équivalente : PAT_004 · contextes : coronarien_aigu, antithrombotique_coro_justifie
- règles lectrices (13) : EV_B05[w] EV_B16[w] EV_B17[d] EV_B18[d] EV_C16[w] EV_PIM_02[d] IN_B02[w] IN_B03[w] IN_B04[w] IN_C02[w] IN_M03[w] SUP_STOP_049[w] SUP_STOP_051[w]
- médicaments visés : betabloquant, atorvastatine, rosuvastatine, simvastatine, pravastatine, fluvastatine, pitavastatine, ains, antipsychotique, acide acetylsalicylique, aspirine, flecainide, propafenone, estradiol, estrogenes conjugues
- usages directs : app_analysis:811 if(_declare('chkStent') || _declare('chkScaAigu')) ctxClinique.push("coronarien_aigu"); ‖ app_analysis:964 if (_declare('chkStent') || _declare('chkScaAigu')) ctxClinique.push("antithrombotique_cor

### chkStent — Stent coronaire récent (< 6 mois)
- pathologie équivalente : PAT_004 · contextes : coronarien_aigu, antithrombotique_coro_justifie
- règles lectrices (13) : EV_B05[w] EV_B16[w] EV_B17[d] EV_B18[d] EV_C16[w] EV_PIM_02[d] IN_B02[w] IN_B03[w] IN_B04[w] IN_C02[w] IN_M03[w] SUP_STOP_049[w] SUP_STOP_051[w]
- médicaments visés : betabloquant, atorvastatine, rosuvastatine, simvastatine, pravastatine, fluvastatine, pitavastatine, ains, antipsychotique, acide acetylsalicylique, aspirine, flecainide, propafenone, estradiol, estrogenes conjugues
- usages directs : app_analysis:811 if(_declare('chkStent') || _declare('chkScaAigu')) ctxClinique.push("coronarien_aigu"); ‖ app_analysis:964 if (_declare('chkStent') || _declare('chkScaAigu')) ctxClinique.push("antithrombotique_cor

### chkLqts — Syndrome du QT Long Congénital
- pathologie équivalente : — · contextes : qt_long_congenital
- règles lectrices (1) : EV_N05[d]
- médicaments visés : —
- usages directs : app_analysis:835 if(_declare('chkLqts')) ctxClinique.push("qt_long_congenital"); ‖ app_analysis:1752 || bioValues['BIO_031'] > 0 || isChecked('chkLqts');

### chkDialyse — Hémodialyse
- pathologie équivalente : PAT_029 · contextes : hemodialyse
- règles lectrices (5) : EV_B08[w] IN_E03[w] IN_E04[w] IN_E06[w] IN_E05[w]
- médicaments visés : furosemide, bumetanide
- biologie lue : BIO_004, BIO_009, BIO_046, BIO_001
- usages directs : app_analysis:127 ajoute(isChecked('chkDialyse') || bioValues['BIO_003'] >= SCORES_CONFIG.BIO.creat_has, 'Re ‖ app_analysis:810 if(_declare('chkDialyse')) ctxClinique.push("hemodialyse");

### chkFoie — Hépatopathie / Cirrhose (préciser le Child-Pugh ci-dessus)
- pathologie équivalente : PAT_034 · contextes : encephalopathie_hepatique, hepatopathie
- règles lectrices (4) : EV_N01[d] EV_N02[d] IN_M02[i] SUP_FOIE_01[i]
- médicaments visés : methotrexate, amiodarone, valproate, acide valproique, benzodiazepine, diazepam, lorazepam, oxazepam, alprazolam, bromazepam, clorazepate, opioid, morphine, oxycodone, fentanyl, tramadol, codeine, paracetamol
- usages directs : app_analysis:772 else if (_declare('chkFoie')) { const sc = getVal('cpBili') + getVal('cpAlb') + getVal('cp ‖ app_analysis:774 if ((cp || _declare('chkFoie')) && getVal('cpEnceph') >= 2) ctxClinique.push("encephalopat ‖ app_analysis:807 if(_declare('chkFoie')) ctxClinique.push("hepatopathie"); ‖ app_analysis:1907 } else if (isChecked('chkFoie')) { ‖ app_analysis:1927 if (cpClass || isChecked('chkFoie')) { ‖ app_ui:734 let chk = document.getElementById('chkFoie');

### chkSepsis — Sepsis / Maladie aiguë en cours
- pathologie équivalente : — · contextes : sepsis
- règles lectrices (3) : EV_N06[d] EV_N07[d] SUP_SEPSIS_01[w]
- médicaments visés : methotrexate, azathioprine, ciclosporine, tacrolimus, mycophenolate, prednisone, prednisolone, methylprednisolone, dexamethasone, ains, ibuprofene, naproxene, diclofenac, ketoprofene, piroxicam, meloxicam, celecoxib, gentamicine, amikacine, tobramycine, iec, ara2, metformine, isglt2, dapagliflozin
- usages directs : app_analysis:820 if(_declare('chkSepsis')) ctxClinique.push("sepsis");

### chkPalliatif — Soins palliatifs / Espérance de vie < 1 an
- pathologie équivalente : PAT_030 · contextes : palliatif, esperance_vie_reduite, stoppfrail
- règles lectrices (6) : EV_D08[d] EV_D11[d] EV_F02[w] EV_H09[w] EV_L01[d] SUP_OPIO_01[i]
- médicaments visés : benzodiazepine_stricte, diazepam, bromazepam, lorazepam, oxazepam, alprazolam, clorazepate, prazepam, nordazepam, clobazam, clonazepam, nitrazepam, lormetazepam, temazepam, midazolam, zolpidem, zopiclone, zaleplon, omeprazole, esomeprazole, lansoprazole, pantoprazole, rabeprazole, ipp, opioid
- usages directs : app_analysis:799 if(_declare('chkPalliatif')) ctxClinique.push("palliatif", "esperance_vie_reduite", "stopp ‖ app_analysis:1455 fragiliteSevere: (getVal('scoreCFS') >= ((typeof CLINICAL_THRESHOLDS !== 'undefined' && CL ‖ app_core:1265 document.getElementById('chkPalliatif').checked = true;

### chkAtcdUlcere — ATCD d'Ulcère ou Saignement digestif
- pathologie équivalente : PAT_021 · contextes : atcd_ulcere, atcd_hemorragie_digestive
- règles lectrices (5) : EV_F05[d] EV_H01[d] IN_F02[w] SUP_STOP_014[w] SUP_STOP_036[w]
- médicaments visés : corticoide, prednisone, prednisolone, methylprednisolone, dexamethasone, betamethasone, hydrocortisone, ainsnonselectif, acide acetylsalicylique, aspirine, tous les isrs, alendronate, risedronate, ibandronate
- usages directs : app_analysis:800 if(_declare('chkAtcdUlcere')) ctxClinique.push("atcd_ulcere", "atcd_hemorragie_digestive") ‖ app_analysis:3514 if (ippMeds.length > 0 && !isChecked('chkAtcdUlcere') && !activeComorbs.includes('PAT_021'

### chkChutes — Chutes fréquentes
- pathologie équivalente : — · contextes : chutes
- règles lectrices (11) : EV_K01[d] EV_K02[d] EV_K04[d] EV_K05[w] EV_K06[d] EV_K07[w] EV_K08[w] EV_K09[d] EV_K10[d] EV_K12[w] IN_H05[w]
- médicaments visés : benzodiazepine_stricte, antipsychotique, zolpidem, zopiclone, zaleplon, antiepileptique, valproate, carbamazepine, phenytoine, phenobarbital, pregabaline, gabapentine, levetiracetam, lamotrigine, topiramate, hydroxyzine, dexchlorpheniramine, mequitazine, promethazine, alimemazine, diphenhydramine, chlorpheniramine, doxylamine, opioid, tramadol
- usages directs : app_analysis:793 if(_declare('chkChutes')) ctxClinique.push("chutes"); ‖ app_analysis:3486 if (bzdMeds.length > 0 && (isFragile || patientAge >= 75 || isChecked('chkChutes'))) {

### chkInstitution — Institutionnalisé (EHPAD / USLD)
- pathologie équivalente : — · contextes : institution
- règles lectrices (1) : IN_H05[w]
- médicaments visés : —
- usages directs : app_analysis:794 if(_declare('chkInstitution')) ctxClinique.push("institution");

### chkConfine — Confiné au domicile / grabataire
- pathologie équivalente : — · contextes : confinement
- règles lectrices (2) : IN_H05[w] SUP_LEST_03[w]
- médicaments visés : mucilage
- usages directs : app_analysis:795 if(_declare('chkConfine')) ctxClinique.push("confinement");

### chkIncontinence — Incontinence urinaire
- pathologie équivalente : PAT_039 · contextes : incontinence
- règles lectrices (3) : EV_B10[w] SUP_INC_01[w] SUP_STOP_044[w]
- médicaments visés : furosemide, bumetanide, doxazosine, prazosine, terazosine, duloxetine
- usages directs : app_analysis:742 if(_declare('chkIncontinence')) ctxClinique.push("incontinence");

### chkHbp — HBP / Rétention urinaire
- pathologie équivalente : — · contextes : hbp
- règles lectrices (5) : EV_D04[d] EV_G03[w] IN_I01[i] SUP_TCA_01[d] SUP_STOP_043[w]
- médicaments visés : chlorpromazine, clozapine, flupentixol, olanzapine, levomepromazine, pipotiazine, promazine, thioridazine, tiotropium, aclidinium, umeclidinium, glycopyrronium, antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine, oxybutynine, tolterodine, solifenacine
- usages directs : app_analysis:749 if(_declare('chkHbp')) ctxClinique.push("hbp");

### chkConstipation — Constipation chronique sévère
- pathologie équivalente : — · contextes : constipation_chronique
- règles lectrices (5) : EV_F03[w] EV_F08[d] EV_I04[w] IN_F05[i] SUP_TCA_01[d]
- médicaments visés : verapamil, fer oral, opioid, clozapine, oxybutynine, tolterodine, solifenacine, fesoterodine, trospium, flavoxate, darifenacine, antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine
- usages directs : app_analysis:751 if(_declare('chkConstipation')) ctxClinique.push("constipation_chronique");

### chkDysphagie — Dysphagie / Troubles de déglutition
- pathologie équivalente : PAT_038 · contextes : dysphagie
- règles lectrices (3) : EV_F07[d] SUP_LEST_01[d] SUP_STOP_036[w]
- médicaments visés : antipsychotique, mucilage, alendronate, risedronate, ibandronate
- usages directs : app_analysis:752 if(_declare('chkDysphagie')) ctxClinique.push("dysphagie"); ‖ app_paam:122 if (_isChk('chkDysphagie')) _setAuto('3.3', 0);

### chkArthrose — Arthrose / douleur arthrosique chronique
- pathologie équivalente : — · contextes : arthrose
- règles lectrices (3) : EV_H03[w] EV_H09[w] SUP_STOP_035[w]
- médicaments visés : ains, opioid, tramadol, codeine, morphine, oxycodone, fentanyl, buprenorphine, prednisolone, methylprednisolone
- usages directs : app_analysis:753 if(_declare('chkArthrose')) ctxClinique.push("arthrose");

### chkGlaucome — Glaucome à angle fermé
- pathologie équivalente : PAT_033 · contextes : glaucome
- règles lectrices (3) : EV_D01[d] EV_G03[w] SUP_STOP_042[w]
- médicaments visés : antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine, tiotropium, aclidinium, umeclidinium, glycopyrronium, oxybutynine, tolterodine, solifenacine, darifenacine, fesoterodine, trospium
- usages directs : app_analysis:798 if(_declare('chkGlaucome')) ctxClinique.push("glaucome");

### chkStenoseAortique — Sténose aortique serrée symptomatique
- pathologie équivalente : — · contextes : stenose_aortique
- règles lectrices (1) : EV_B20[d]
- médicaments visés : antihypertenseur, inhibiteur calcique, betabloquant, diuretique
- usages directs : app_analysis:743 if(_declare('chkStenoseAortique')) ctxClinique.push("stenose_aortique");

### chkAspirineForte — Aspirine > 100 mg/j (Dose élevée) — ou dose saisie à l'ajout
- pathologie équivalente : — · contextes : dose_aspirine_elevee
- règles lectrices (1) : EV_C01[w]
- médicaments visés : acide acetylsalicylique, aspirine
- usages directs : app_analysis:801 if(_declare('chkAspirineForte')) ctxClinique.push("dose_aspirine_elevee");

### chkInsulineSlidingScale — Insuline « sliding scale » seule (sans basale) — ou schéma saisi à l'ajout
- pathologie équivalente : — · contextes : sliding_scale
- règles lectrices (2) : EV_BEERS_02[w] SUP_STOP_053[w]
- médicaments visés : insuline aspart, insuline lispro, insuline glulisine, insuline humaine, insuline glargine, insuline detemir, insuline degludec
- usages directs : app_analysis:802 if(_declare('chkInsulineSlidingScale')) ctxClinique.push("sliding_scale");

### chkDemence — Maladie neurocognitive majeure (démence)
- pathologie équivalente : PAT_010 · contextes : demence, trouble_neurocognitif_majeur
- règles lectrices (9) : EV_D01[d] EV_D05[w] EV_D09[d] EV_D14[d] EV_D16[w] EV_D20[w] EV_I01[d] EV_SF06[w] SUP_DOUL_03[i]
- médicaments visés : antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine, antipsychotique, benzodiazepine_stricte, ginkgo, piracetam, pramiracetam, oxybutynine, tolterodine, solifenacine, fesoterodine, trospium, flavoxate, darifenacine, donepezil, rivastigmine, galantamine
- usages directs : app_analysis:838 if(_declare('chkDemence')) ctxClinique.push("demence", "trouble_neurocognitif_majeur"); ‖ app_ui:242 PAT_011: { case: 'demTypeMA',   parent: 'chkDemence', bloc: 'cascadeDemence' }, ‖ app_ui:243 PAT_012: { case: 'chkLewy',     parent: 'chkDemence', bloc: 'cascadeDemence' }, ‖ app_ui:244 PAT_013: { case: 'demTypeDLFT', parent: 'chkDemence', bloc: 'cascadeDemence' }, ‖ app_ui:245 PAT_014: { case: 'demTypeDP',   parent: 'chkDemence', bloc: 'cascadeDemence' }, ‖ app_ui:246 PAT_041: { case: 'demTypeVasc', parent: 'chkDemence', bloc: 'cascadeDemence' },

### demTypeMA — Maladie d'Alzheimer (MA)
- pathologie équivalente : PAT_011 · contextes : alzheimer
- règles lectrices (8) : EV_D01[d] EV_D05[w] EV_D09[d] EV_D14[d] EV_D16[w] EV_D20[w] EV_I01[d] EV_SF06[w]
- médicaments visés : antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine, antipsychotique, benzodiazepine_stricte, ginkgo, piracetam, pramiracetam, oxybutynine, tolterodine, solifenacine, fesoterodine, trospium, flavoxate, darifenacine, donepezil, rivastigmine, galantamine
- usages directs : app_analysis:839 if(_declare('demTypeMA')) ctxClinique.push("alzheimer"); ‖ app_core:1172 ['demTypeMA','chkLewy','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte','demTypeNP'] ‖ app_ui:242 PAT_011: { case: 'demTypeMA',   parent: 'chkDemence', bloc: 'cascadeDemence' },

### chkLewy — Démence à corps de Lewy (DCL)
- pathologie équivalente : PAT_012 · contextes : corps_de_lewy, dcl
- règles lectrices (12) : EV_D01[d] EV_D05[w] EV_D09[d] EV_D12[d] EV_D14[d] EV_D16[w] EV_D20[w] EV_D22[w] EV_I01[d] EV_SF06[w] IN_D04[w] SUP_STOP_015[w]
- médicaments visés : antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine, antipsychotique, benzodiazepine_stricte, haloperidol, risperidone, olanzapine, aripiprazole, amisulpride, chlorpromazine, levomepromazine, cyamemazine, ginkgo, piracetam, pramiracetam, levodopa, ropinirole
- usages directs : app_analysis:840 if(_declare('chkLewy')) ctxClinique.push("corps_de_lewy", "dcl"); ‖ app_core:1172 ['demTypeMA','chkLewy','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte','demTypeNP'] ‖ app_ui:243 PAT_012: { case: 'chkLewy',     parent: 'chkDemence', bloc: 'cascadeDemence' },

### demTypeDP — Démence parkinsonienne
- pathologie équivalente : PAT_014 · contextes : demence_parkinsonienne
- règles lectrices (9) : EV_D01[d] EV_D09[d] EV_D12[d] EV_D14[d] EV_D22[w] EV_F01[d] EV_I01[d] IN_D01[w] SUP_STOP_015[w]
- médicaments visés : antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine, benzodiazepine_stricte, antipsychotique, haloperidol, risperidone, olanzapine, aripiprazole, amisulpride, chlorpromazine, levomepromazine, cyamemazine, levodopa, ropinirole, pramipexole, rotigotine, piribedil
- usages directs : app_analysis:841 if(_declare('demTypeDP')) ctxClinique.push("demence_parkinsonienne"); ‖ app_core:1172 ['demTypeMA','chkLewy','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte','demTypeNP'] ‖ app_ui:245 PAT_014: { case: 'demTypeDP',   parent: 'chkDemence', bloc: 'cascadeDemence' },

### demTypeDLFT — Dégénérescence lobaire fronto-temporale (DLFT)
- pathologie équivalente : PAT_013 · contextes : dlft
- règles lectrices (7) : EV_D01[d] EV_D05[w] EV_D09[d] EV_D14[d] EV_D20[w] EV_I01[d] EV_SF06[w]
- médicaments visés : antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine, antipsychotique, benzodiazepine_stricte, ginkgo, piracetam, pramiracetam, oxybutynine, tolterodine, solifenacine, fesoterodine, trospium, flavoxate, darifenacine, donepezil, rivastigmine, galantamine
- usages directs : app_analysis:842 if(_declare('demTypeDLFT')) ctxClinique.push("dlft"); ‖ app_core:1172 ['demTypeMA','chkLewy','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte','demTypeNP'] ‖ app_ui:244 PAT_013: { case: 'demTypeDLFT', parent: 'chkDemence', bloc: 'cascadeDemence' },

### demTypeVasc — Démence vasculaire
- pathologie équivalente : PAT_041 · contextes : demence_vasculaire
- règles lectrices (8) : EV_D01[d] EV_D05[w] EV_D09[d] EV_D14[d] EV_D16[w] EV_D20[w] EV_I01[d] EV_SF06[w]
- médicaments visés : antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine, antipsychotique, benzodiazepine_stricte, ginkgo, piracetam, pramiracetam, oxybutynine, tolterodine, solifenacine, fesoterodine, trospium, flavoxate, darifenacine, donepezil, rivastigmine, galantamine
- usages directs : app_analysis:843 if(_declare('demTypeVasc')) ctxClinique.push("demence_vasculaire"); ‖ app_core:1172 ['demTypeMA','chkLewy','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte','demTypeNP'] ‖ app_ui:246 PAT_041: { case: 'demTypeVasc', parent: 'chkDemence', bloc: 'cascadeDemence' },

### demTypeMixte — Démence mixte (Alzheimer + vasculaire)
- pathologie équivalente : PAT_042 · contextes : demence_mixte
- règles lectrices (8) : EV_D01[d] EV_D05[w] EV_D09[d] EV_D14[d] EV_D16[w] EV_D20[w] EV_I01[d] EV_SF06[w]
- médicaments visés : antidepresseur tricyclique, amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, maprotiline, amoxapine, dosulepine, antipsychotique, benzodiazepine_stricte, ginkgo, piracetam, pramiracetam, oxybutynine, tolterodine, solifenacine, fesoterodine, trospium, flavoxate, darifenacine, donepezil, rivastigmine, galantamine
- usages directs : app_analysis:844 if(_declare('demTypeMixte')) ctxClinique.push("demence_mixte"); ‖ app_core:1172 ['demTypeMA','chkLewy','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte','demTypeNP'] ‖ app_ui:247 PAT_042: { case: 'demTypeMixte',parent: 'chkDemence', bloc: 'cascadeDemence' },

### demTypeNP — Non précisée
- pathologie équivalente : — · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_core:1172 ['demTypeMA','chkLewy','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte','demTypeNP']

### chkSpcAgitation — Agitation / agressivité (IPA 2015)
- pathologie équivalente : — · contextes : spc_agitation, agitation
- règles lectrices (1) : SUP_DOUL_03[i]
- médicaments visés : —
- usages directs : app_analysis:845 if(_declare('chkSpcAgitation')) ctxClinique.push("spc_agitation", "agitation");

### chkSpcPsychose — Idées délirantes / hallucinations
- pathologie équivalente : — · contextes : spc_psychose, hallucinations
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:846 if(_declare('chkSpcPsychose')) ctxClinique.push("spc_psychose", "hallucinations");

### chkSpcApathie — Apathie
- pathologie équivalente : — · contextes : spc_apathie
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:847 if(_declare('chkSpcApathie')) ctxClinique.push("spc_apathie");

### chkSpcDepressionSpc — Dépression / anxiété associée
- pathologie équivalente : — · contextes : spc_depression
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:848 if(_declare('chkSpcDepressionSpc')) ctxClinique.push("spc_depression");

### chkSpcInsomnie — Troubles du sommeil / inversion nycthémérale
- pathologie équivalente : — · contextes : spc_insomnie, inversion_nycthemerale
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:849 if(_declare('chkSpcInsomnie')) ctxClinique.push("spc_insomnie", "inversion_nycthemerale");

### chkSpcDesinhibition — Désinhibition / CMA / errance
- pathologie équivalente : — · contextes : spc_desinhibition, errance
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:850 if(_declare('chkSpcDesinhibition')) ctxClinique.push("spc_desinhibition", "errance");

### chkSpcTca — Troubles du comportement alimentaire
- pathologie équivalente : — · contextes : spc_tca
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:851 if(_declare('chkSpcTca')) ctxClinique.push("spc_tca");

### chkMci — Trouble neurocognitif léger (MCI) / MBI
- pathologie équivalente : PAT_043 · contextes : mci, tnc_leger
- règles lectrices (2) : EV_D14[d] EV_I01[d]
- médicaments visés : oxybutynine, tolterodine, solifenacine, fesoterodine, trospium, flavoxate, darifenacine
- usages directs : app_analysis:852 if(_declare('chkMci')) ctxClinique.push("mci", "tnc_leger"); ‖ app_ui:249 PAT_043: { case: 'chkMci',      parent: null,         bloc: 'cascadeMci' }

### chkMbiMotiv — Baisse de motivation / intérêt
- pathologie équivalente : — · contextes : mbi
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:853 if(_declare('chkMbiMotiv') || _declare('chkMbiAffect') || _declare('chkMbiImpuls') || _dec

### chkMbiAffect — Dérégulation affective (anxiété, dysphorie)
- pathologie équivalente : — · contextes : mbi
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:853 if(_declare('chkMbiMotiv') || _declare('chkMbiAffect') || _declare('chkMbiImpuls') || _dec

### chkMbiImpuls — Impulsivité / dérégulation du contrôle
- pathologie équivalente : — · contextes : mbi
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:853 if(_declare('chkMbiMotiv') || _declare('chkMbiAffect') || _declare('chkMbiImpuls') || _dec

### chkMbiSocial — Inadéquation sociale / désinhibition
- pathologie équivalente : — · contextes : mbi
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:853 if(_declare('chkMbiMotiv') || _declare('chkMbiAffect') || _declare('chkMbiImpuls') || _dec

### chkMbiIdeat — Idéation / perception anormale (contenu psychotique léger)
- pathologie équivalente : — · contextes : mbi
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:853 if(_declare('chkMbiMotiv') || _declare('chkMbiAffect') || _declare('chkMbiImpuls') || _dec

### chkPsyPrim — Trouble psychiatrique primaire
- pathologie équivalente : — · contextes : psy_primaire
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:854 if(_declare('chkPsyPrim')) ctxClinique.push("psy_primaire");

### chkDepression — Dépression majeure caractérisée (EDM)
- pathologie équivalente : PAT_032 · contextes : depression
- règles lectrices (3) : EV_SFGG_AD_08[d] IN_D02[w] IN_SFGG_AD_01[i]
- médicaments visés : amitriptyline, clomipramine, imipramine, doxepine, nortriptyline, trimipramine, dosulepine
- usages directs : app_analysis:750 if(_declare('chkDepression')) ctxClinique.push("depression");

### chkAnxieteTAG — Trouble anxieux généralisé (TAG)
- pathologie équivalente : PAT_044 · contextes : tag, anxiete_generalisee
- règles lectrices (2) : IN_D05[w] SUP_GABA_02[i]
- médicaments visés : gabapentine, pregabaline
- usages directs : app_analysis:855 if(_declare('chkAnxieteTAG')) ctxClinique.push("tag", "anxiete_generalisee");

### chkPsychoseTardive — Psychose tardive (VLOSLP) / schizophrénie tardive
- pathologie équivalente : PAT_045 · contextes : psychose_tardive
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:856 if(_declare('chkPsychoseTardive')) ctxClinique.push("psychose_tardive");

### chkBipolaire — Trouble bipolaire
- pathologie équivalente : PAT_046 · contextes : trouble_bipolaire
- règles lectrices (1) : SUP_BIP_01[w]
- médicaments visés : antidepresseur, isrs, irsn, mirtazapine, mianserine, venlafaxine, duloxetine, antidepresseur tricyclique, agomelatine, vortioxetine
- usages directs : app_analysis:857 if(_declare('chkBipolaire')) ctxClinique.push("trouble_bipolaire");

### chkCatatonie — Catatonie
- pathologie équivalente : PAT_047 · contextes : catatonie
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:858 if(_declare('chkCatatonie')) ctxClinique.push("catatonie");

### chkPsyChronique — Maladie psychiatrique primaire chronique (antérieure à 65 ans)
- pathologie équivalente : — · contextes : —
- règles lectrices (0) : 
- médicaments visés : —

### chkSchizoChronique — Schizophrénie chronique (F20)
- pathologie équivalente : PAT_055 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:883 if(_declare('chkSchizoChronique'))     _pushPsy(["schizophrenie"], ["psychose_chronique", 

### chkSchizoAffectif — Trouble schizo-affectif (F25)
- pathologie équivalente : PAT_056 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:884 if(_declare('chkSchizoAffectif'))      _pushPsy(["trouble_schizoaffectif"], ["psychose_chr

### chkTroubleDelirant — Trouble délirant persistant / paranoïa (F22.0)
- pathologie équivalente : PAT_057 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:885 if(_declare('chkTroubleDelirant'))     _pushPsy(["trouble_delirant"], ["psychose_chronique

### chkBipolaireI — Trouble bipolaire type I (F31)
- pathologie équivalente : PAT_058 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:886 if(_declare('chkBipolaireI'))          _pushPsy(["trouble_bipolaire"], ["trouble_thymique_

### chkBipolaireII — Trouble bipolaire type II (F31.81)
- pathologie équivalente : PAT_059 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:887 if(_declare('chkBipolaireII'))         _pushPsy(["trouble_bipolaire"], ["trouble_thymique_

### chkDepressionRecurrente — Trouble dépressif récurrent (F33)
- pathologie équivalente : PAT_060 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:888 if(_declare('chkDepressionRecurrente'))_pushPsy(["depression_recurrente", "depression"], [

### chkDysthymie — Trouble dépressif persistant / dysthymie (F34.1)
- pathologie équivalente : PAT_061 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:889 if(_declare('chkDysthymie'))           _pushPsy(["dysthymie", "depression"], ["trouble_thy

### chkTOC — Trouble obsessionnel-compulsif / TOC (F42)
- pathologie équivalente : PAT_062 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:890 if(_declare('chkTOC'))                 _pushPsy(["toc"], ["psychiatrie_primaire_chronique"

### chkTroublePanique — Trouble panique (F41.0)
- pathologie équivalente : PAT_063 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:891 if(_declare('chkTroublePanique'))      _pushPsy(["trouble_panique", "anxiete_chronique"], 

### chkTAGChronique — Trouble anxieux généralisé chronique (F41.1)
- pathologie équivalente : PAT_064 · contextes : —
- règles lectrices (1) : SUP_GABA_02[i]
- médicaments visés : gabapentine, pregabaline
- usages directs : app_analysis:892 if(_declare('chkTAGChronique'))        _pushPsy(["tag", "anxiete_generalisee", "anxiete_ch

### chkESPT — État de stress post-traumatique / ESPT (F43.1)
- pathologie équivalente : PAT_065 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:893 if(_declare('chkESPT'))                _pushPsy(["espt"], ["psychiatrie_primaire_chronique

### chkTroublePersonnalite — Trouble de la personnalité (F60)
- pathologie équivalente : PAT_066 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:894 if(_declare('chkTroublePersonnalite')) _pushPsy(["trouble_personnalite"], ["psychiatrie_pr

### chkUsageAlcool — Trouble de l'usage de l'alcool (F10.2)
- pathologie équivalente : PAT_067 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:895 if(_declare('chkUsageAlcool'))         _pushPsy(["trouble_usage_alcool", "addiction", "alc

### chkUsageSubstances — Trouble de l'usage de substances (F19)
- pathologie équivalente : PAT_068 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:896 if(_declare('chkUsageSubstances'))     _pushPsy(["trouble_usage_substances", "addiction"],

### chkTSADI — TSA / déficience intellectuelle (F84/F70)
- pathologie équivalente : PAT_069 · contextes : —
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:897 if(_declare('chkTSADI'))               _pushPsy(["tsa_di"], ["psychiatrie_primaire_chroniq

### chkAntipsyLAI — 💉 Antipsychotique d'action prolongée (LAI / dépôt)
- pathologie équivalente : — · contextes : antipsychotique_lai
- règles lectrices (1) : SUP_PSYC_07[i]
- médicaments visés : —
- usages directs : app_analysis:898 if(isChecked('chkAntipsyLAI'))          ctxClinique.push("antipsychotique_lai");

### chkDelirium — Syndrome confusionnel (delirium)
- pathologie équivalente : PAT_048 · contextes : —
- règles lectrices (1) : EV_D14[d]
- médicaments visés : —
- usages directs : app_analysis:900 if(_declare('chkDelirium')) { ‖ app_paam:119 if (_isChk('chkDelirium')) _setAuto('1.5', 0);

### chkSommeil — Trouble du sommeil primaire
- pathologie équivalente : — · contextes : trouble_sommeil_primaire
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:906 if(isChecked('chkSommeil')) ctxClinique.push("trouble_sommeil_primaire");

### chkInsomnie — Insomnie chronique
- pathologie équivalente : PAT_049 · contextes : insomnie_chronique
- règles lectrices (0) : 
- médicaments visés : —
- usages directs : app_analysis:907 if(isChecked('chkInsomnie')) ctxClinique.push("insomnie_chronique");

### chkTcsp — Trouble comportemental du sommeil paradoxal (TCSP)
- pathologie équivalente : PAT_050 · contextes : tcsp
- règles lectrices (1) : SUP_TCSP_01[i]
- médicaments visés : isrs, irsn, antidepresseur tricyclique, mirtazapine
- usages directs : app_analysis:908 if(isChecked('chkTcsp')) ctxClinique.push("tcsp");

### chkSjsr — Syndrome des jambes sans repos (SJSR)
- pathologie équivalente : PAT_051 · contextes : sjsr
- règles lectrices (3) : EV_D22[w] IN_D06[w] SUP_STOP_015[w]
- médicaments visés : levodopa, ropinirole, pramipexole, rotigotine, piribedil, antipsychotique, metoclopramide, metopimazine, flunarizine, cinnarizine
- usages directs : app_analysis:909 if(isChecked('chkSjsr')) ctxClinique.push("sjsr");

### chkSaos — Syndrome d'apnées obstructives du sommeil (SAOS)
- pathologie équivalente : PAT_052 · contextes : saos
- règles lectrices (1) : SUP_GABA_01[d]
- médicaments visés : pregabaline, gabapentine, benzodiazepine, zolpidem, zopiclone, opioide
- usages directs : app_analysis:910 if(isChecked('chkSaos')) ctxClinique.push("saos");
