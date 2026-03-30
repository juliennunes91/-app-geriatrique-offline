// app_analysis.js - V6.0 (Refactorisé - utilise drug_classes.js)

const medMatchesAnsmTerm = (med, term) => {
    if (!term || !med) return false;
    let dci = sanitizeText(med.dci); let classe = sanitizeText(med.classe);
    let t = sanitizeText(term);
    return matchesDrugClassAnsm(dci, classe, t);
};

function formatSuiviList(str) {
    if (!str) return "";
    let items = str.split('|').map(x => x.trim()).filter(x => x.length > 0);
    if (items.length === 0) return "";
    return `<ul class="mb-0 ps-3">` + items.map(i => `<li style="margin-bottom:3px;">${i}</li>`).join('') + `</ul>`;
}

function preCalculerScores() {
    scoreACB_global = 0; scoreCIA_global = 0; maxQTLevel_global = 0;
    globalQT_CountKR = 0; globalQT_CountCR_PR = 0; infoQT_global = [];

    activeMeds.forEach(m => {
        let ref = m.db_ref; if (!ref) return;
        let acb = parseFloat(ref.acb) || 0; let cia = parseFloat(ref.cia) || 0;
        if (acb > 0) scoreACB_global += acb;
        if (cia > 0) scoreCIA_global += cia;
        let qt = String(ref.qt_risque || "");
        if (qt.includes("(KR)")) { maxQTLevel_global = Math.max(maxQTLevel_global, 2); infoQT_global.push(`${m.dci}`); globalQT_CountKR++; }
        else if (qt.includes("(PR)") || qt.includes("(CR)")) { maxQTLevel_global = Math.max(maxQTLevel_global, 1); infoQT_global.push(`${m.dci}`); globalQT_CountCR_PR++; }
    });
}

function analyserPrescription() {
    if (typeof MASTER_DB === 'undefined') return;
    
    // 🔥 INITIALISATION DU MOTEUR V2 (Une seule fois)
    if (typeof applyFullIntegration === 'function' && !window.engineInitialized) {
        applyFullIntegration();
        if (typeof GeriaEngineV2 !== 'undefined') {
            GeriaEngineV2.buildIndex();
            window.engineInitialized = true;
            console.log("🚀 Moteur GeriaEngineV2 initialisé et indexé.");
        }
    }

    preCalculerScores();
    const patientAge = getVal('patientAge'); const sexe = getStr('patientSexe'); const isFragile = isChecked('patientFragile') || getVal('scoreCFS') >= 7;

    const bioValues = {
        'BIO_001': getVal('patientK'), 'BIO_002': getVal('patientNa'), 'BIO_003': getVal('bioCreat'), 'BIO_004': getVal('patientDFG'),
        'BIO_005': getVal('bioCa'), 'BIO_006': getVal('bioMg'), 'BIO_007': getVal('bioUree'), 'BIO_008': getVal('bioUric'),
        'BIO_009': getVal('bioHb'), 'BIO_010': getVal('bioPlaq'), 'BIO_011': getVal('bioGb'), 'BIO_012': getVal('bioPnn'),
        'BIO_013': getVal('bioAsat'), 'BIO_014': getVal('bioAlat'), 'BIO_015': getVal('bioGgt'), 'BIO_016': getVal('bioPal'),
        'BIO_017': getVal('bioBili'), 'BIO_018': getVal('bioCpk'), 'BIO_019': getVal('bioTsh'),
        'BIO_020': getVal('bioFer'), 'BIO_021': getVal('bioB12'), 'BIO_022': getVal('bioB9'), 'BIO_023': getVal('bioVitD'),
        'BIO_024': getVal('bioCrp'), 'BIO_025': getVal('bioGly'), 'BIO_026': getVal('bioHba1c'),
        'BIO_027_LDL': getVal('bioLdl'), 'BIO_027_TG': getVal('bioTg'),
        'BIO_028': getVal('bioBnp'), 'BIO_030': getVal('bioInr'), 'BIO_031': getVal('bioQtc'),
        'BIO_032': getVal('bioPct'), 'BIO_029': getVal('bioLithium'),
        'BIO_033': getVal('bioDdim'), 'BIO_034': getVal('bioTropo'), 'BIO_036': getVal('bioLipase'),
        'BIO_035': getVal('bioAlbumSg'), 'BIO_037': getVal('bioLact'),
        'BIO_CST': getVal('bioCst'), 'BIO_PHOS': getVal('bioPhos'),
        'BIO_TEMP': getVal('bioTemp'),
        'BIO_T4': getVal('bioT4'), 'BIO_T3': getVal('bioT3')
    };

    const divs = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact', 'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi', 'alertes-guidelines'];
    divs.forEach(id => { let el = document.getElementById(id); if(el) el.innerHTML = ''; });
    let counts = { eviter: 0, initier: 0, interact: 0, ansm: 0, auc: 0, bio: 0, usage: 0, suivi: 0 };
    const addAlert = (targetId, htmlStr, countKey) => {
        let el = document.getElementById(targetId); if(!el || !htmlStr) return;
        el.innerHTML += htmlStr; if(countKey) counts[countKey]++;
    };

    // =========================================================
    // 1. 🚀 BRANCHEMENT AU NOUVEAU MOTEUR EXPERT (GERIA ENGINE V2)
    // =========================================================
    let divScores = document.getElementById('alertes-scores');

    // ---- Auto-injection des PAT codes depuis les checkboxes cliniques ----
    // Garantit que les règles STOPP/START (qui vérifient activeComorbs) se déclenchent
    const checkboxPatMap = {
        'chkAvc':              'PAT_008',   // AVC/AIT
        'chkAtcdUlcere':       'PAT_021',   // UGD
        'chkDialyse':          'PAT_029',   // MRC (hémodialyse implique MRC sévère)
        'chkPalliatif':        'PAT_030',   // Soins palliatifs
        'chkDepression':       'PAT_032',   // Dépression (nouveau PAT)
        'chkGlaucome':         'PAT_033',   // Glaucome à angle fermé (nouveau PAT)
        'chkFoie':             'PAT_034',   // Hépatopathie chronique / Cirrhose (nouveau PAT)
        'chkBrady':            'PAT_035',   // Bradycardie (nouveau PAT)
        'chkTvp':              'PAT_036',   // MTEV - TVP/EP (nouveau PAT)
        'chkStent':            'PAT_004',   // Stent → SCC
        'chkScaAigu':          'PAT_004',   // SCA → SCC
        'chkHtaNonControlee':  'PAT_005'    // HTA non contrôlée → HTA
    };
    // Injection sans doublon
    for (const [chkId, patCode] of Object.entries(checkboxPatMap)) {
        if (isChecked(chkId) && !activeComorbs.includes(patCode)) {
            // Vérifier que le PAT existe dans la base avant d'injecter
            if (typeof MASTER_DB !== 'undefined' && MASTER_DB.PATHOLOGIES && MASTER_DB.PATHOLOGIES[patCode]) {
                activeComorbs.push(patCode);
            }
        }
    }
    // Fragilité → flag utilisé par STOPPFrail
    if (isFragile && !activeComorbs.includes('PAT_031') && typeof MASTER_DB !== 'undefined' && MASTER_DB.PATHOLOGIES && MASTER_DB.PATHOLOGIES['PAT_031']) {
        activeComorbs.push('PAT_031');
    }

    // Contexte Clinique
    const ctxClinique = [];
    if(isChecked('chkBrady')) ctxClinique.push("bradycardie");
    if(isChecked('chkIncontinence')) ctxClinique.push("incontinence");
    if(isChecked('chkStenoseAortique')) ctxClinique.push("stenose_aortique");
    if(isChecked('chkSaignement') || isChecked('chkAspirineForte')) { ctxClinique.push("risque_hemorragique"); ctxClinique.push("atcd_hemorragie"); }
    if(isChecked('chkHbp')) ctxClinique.push("hbp");
    if(isChecked('chkDepression')) ctxClinique.push("depression");
    if(isChecked('chkConstipation')) ctxClinique.push("constipation_chronique");
    if(isChecked('chkDysphagie')) ctxClinique.push("dysphagie");
    if(isChecked('chkChutes')) ctxClinique.push("chutes");
    if(isChecked('chkAnorexie') || (getVal('patientBmi') > 0 && getVal('patientBmi') < 18.5)) ctxClinique.push("denutrition");
    if(isChecked('chkGlaucome')) ctxClinique.push("glaucome");
    if(isChecked('chkPalliatif')) ctxClinique.push("palliatif", "esperance_vie_reduite", "stoppfrail");
    if(isChecked('chkAtcdUlcere')) ctxClinique.push("atcd_ulcere", "atcd_hemorragie_digestive");
    if(isChecked('chkAspirineForte')) ctxClinique.push("dose_aspirine_elevee");
    if(getVal('bioAlb') > 0 && getVal('bioAlb') < 30) ctxClinique.push("denutrition_severe");

    // Contexte clinique pour checkboxes avec pont PAT (doublon contexte + comorbs pour couverture complète)
    if(isChecked('chkFoie')) ctxClinique.push("hepatopathie");
    if(isChecked('chkTvp')) ctxClinique.push("mtev");
    if(isChecked('chkAvc')) ctxClinique.push("avc");
    if(isChecked('chkDialyse')) ctxClinique.push("hemodialyse");
    if(isChecked('chkStent') || isChecked('chkScaAigu')) ctxClinique.push("coronarien_aigu");
    if(isChecked('chkHtaNonControlee')) ctxClinique.push("hta_non_controlee");

    // Contexte clinique pour checkboxes sans PAT code
    if(isChecked('chkAlcool')) ctxClinique.push("alcool");
    if(isChecked('chkTabac')) ctxClinique.push("tabac");
    if(isChecked('chkSepsis')) ctxClinique.push("sepsis");
    if(isChecked('chkArret')) ctxClinique.push("arret_cardiaque");
    if(isChecked('chkLqts')) ctxClinique.push("qt_long_congenital");


    const ctx = {
        activeMeds: activeMeds,
        activeComorbs: activeComorbs,
        bioValues: bioValues,
        patientAge: patientAge,
        isFragile: isFragile,
        scoreACB_global: scoreACB_global,
        contexte_clinique: ctxClinique
    };

    // ÉVALUATION V2
    if (typeof GeriaEngineV2 !== 'undefined') {
        const recos = GeriaEngineV2.evaluer(ctx);
        
        // Affichage du Dashboard Global
        if (divScores) divScores.innerHTML += GeriaEngineV2.renderDashboard(recos.dashboard);
        
        // Affichage des Recommandations (Triées et Sourcées)
        document.getElementById('alertes-eviter').innerHTML = GeriaEngineV2.renderAlertesTriees(recos.eviter, 'eviter');
        document.getElementById('alertes-initier').innerHTML = GeriaEngineV2.renderAlertesTriees(recos.initier, 'initier');
        
        counts.eviter = recos.eviter.length;
        counts.initier = recos.initier.length;
    } else {
        divScores.innerHTML += `<div class="alert alert-danger">⚠️ Le moteur GeriaEngineV2 est introuvable. Avez-vous actualisé la page ?</div>`;
    }

    // =========================================================
    // 2. SCORES CLINIQUES (Risq-Path, Tisdale, CHA2DS2, etc.)
    // =========================================================
    if(divScores) {
        let scoreCha = 0; let ttCha = [];
        if(patientAge >= 75) { scoreCha += 2; ttCha.push("Âge ≥75 (+2)"); } else if(patientAge >= 65) { scoreCha += 1; ttCha.push("Âge ≥65 (+1)"); }
        if(sexe === 'F') { scoreCha += 1; ttCha.push("Femme (+1)"); }
        if(activeComorbs.some(c=>['PAT_001','PAT_002','PAT_003'].includes(c))) { scoreCha += 1; ttCha.push("IC (+1)"); }
        if(activeComorbs.includes('PAT_005')) { scoreCha += 1; ttCha.push("HTA (+1)"); }
        if(activeComorbs.includes('PAT_016')) { scoreCha += 1; ttCha.push("Diabète (+1)"); }
        if(activeComorbs.includes('PAT_008')) { scoreCha += 2; ttCha.push("ATCD AVC (+2)"); } 
        if(activeComorbs.some(c=>['PAT_004','PAT_007'].includes(c))) { scoreCha += 1; ttCha.push("Vasc (+1)"); }
        let chaConc = scoreCha === 0 ? 'Risque faible — anticoagulation non indiquée' : (scoreCha === 1 ? (sexe === 'M' ? 'Risque faible (H) — anticoagulation optionnelle' : 'Score lié au sexe seul — anticoagulation non indiquée (F)') : 'Anticoagulation recommandée (sauf CI)');
        divScores.innerHTML += `<div class="alert alert-light border border-info mb-2 shadow-sm"><strong class="text-info">CHA₂DS₂-VASc : ${scoreCha} point(s)</strong> <em class="text-muted small">— Risque thromboembolique dans la FA</em><br><small class="text-muted">${ttCha.join(', ') || 'Aucun'}</small><br><small class="fw-bold text-${scoreCha >= 2 ? 'danger' : 'success'}">${chaConc}</small></div>`;

        let scoreHas = 0; let ttHas = [];
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 50) { scoreHas += 1; ttHas.push("IRC (+1)"); }
        if(activeComorbs.includes('PAT_008')) { scoreHas += 1; ttHas.push("ATCD AVC (+1)"); }
        if(patientAge > 65) { scoreHas += 1; ttHas.push("Âge >65 (+1)"); }
        if(patientHasMedClass('ains') || patientHasMedClass('antiagreg')) { scoreHas += 1; ttHas.push("AINS/AAS (+1)"); }
        let hasConc = scoreHas >= 3 ? 'Risque hémorragique élevé — prudence avec anticoagulant' : (scoreHas >= 1 ? 'Risque modéré — réévaluer bénéfice/risque' : 'Risque faible');
        divScores.innerHTML += `<div class="alert alert-light border border-danger mb-2 shadow-sm"><strong class="text-danger">HAS-BLED : ${scoreHas} point(s)</strong> <em class="text-muted small">— Risque hémorragique sous anticoagulant</em><br><small class="text-muted">${ttHas.join(', ') || 'Aucun'}</small><br><small class="fw-bold text-${scoreHas >= 3 ? 'danger' : 'muted'}">${hasConc}</small></div>`;

        let scoreOrbit = 0; let ttOrbit = [];
        if(patientAge >= 75) { scoreOrbit += 1; ttOrbit.push("Âge ≥75 (+1)"); }
        if(bioValues['BIO_009'] > 0 && ((sexe === 'M' && bioValues['BIO_009'] < 13) || (sexe === 'F' && bioValues['BIO_009'] < 12))) { scoreOrbit += 2; ttOrbit.push("Anémie (+2)"); }
        if(isChecked('chkSaignement') || isChecked('chkAspirineForte')) { scoreOrbit += 2; ttOrbit.push("Saignement (+2)"); }
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 60) { scoreOrbit += 1; ttOrbit.push("DFG <60 (+1)"); }
        if(patientHasMedClass('antiagreg')) { scoreOrbit += 1; ttOrbit.push("Antiagrégant (+1)"); }
        let orbitConc = scoreOrbit >= 4 ? 'Risque hémorragique élevé (7.3%/an)' : (scoreOrbit >= 3 ? 'Risque modéré (4.7%/an)' : 'Risque faible (2.4%/an)');
        divScores.innerHTML += `<div class="alert alert-light border border-warning mb-2 shadow-sm"><strong class="text-warning">ORBIT-AF : ${scoreOrbit} point(s)</strong> <em class="text-muted small">— Risque de saignement sous AOD</em><br><small class="text-muted">${ttOrbit.join(', ') || 'Aucun'}</small><br><small class="fw-bold text-${scoreOrbit >= 4 ? 'danger' : 'muted'}">${orbitConc}</small></div>`;

        let scoreRisq = 0; let ttRisq = [];
        if(patientAge >= 65) { scoreRisq += 1; ttRisq.push("Âge ≥65 (+1)"); }
        if(sexe === 'F') { scoreRisq += 1; ttRisq.push("Femme (+1)"); }
        if(getVal('patientBmi') >= 30) { scoreRisq += 1; ttRisq.push("Obésité (+1)"); }
        if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] <= 3.5) { scoreRisq += 2; ttRisq.push("HypoK (+2)"); }
        if(bioValues['BIO_005'] > 0 && bioValues['BIO_005'] < 2.15) { scoreRisq += 2; ttRisq.push("HypoCa (+2)"); }
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] <= 30) { scoreRisq += 2; ttRisq.push("IRC Sévère (+2)"); }
        if(bioValues['BIO_024'] > 5) { scoreRisq += 1; ttRisq.push("Inflammation (+1)"); }
        if(['PAT_005','PAT_001','PAT_002','PAT_003'].some(c=>activeComorbs.includes(c))) { scoreRisq += 1; ttRisq.push("HTA/IC (+1)"); }
        if(activeComorbs.includes('PAT_006')) { scoreRisq += 1; ttRisq.push("FA (+1)"); }
        if(['PAT_010','PAT_011','PAT_012','PAT_013','PAT_014'].some(c=>activeComorbs.includes(c))) { scoreRisq += 1; ttRisq.push("Démence/Park (+1)"); }
        if(globalQT_CountKR > 0) { scoreRisq += (3 * globalQT_CountKR); ttRisq.push(`Médoc QT (+${3*globalQT_CountKR})`); }
        let risqConc = scoreRisq >= 10 ? 'Risque très élevé de TdP' : (scoreRisq >= 5 ? 'Risque élevé — prudence avec QTc-allongeants' : 'Risque modéré');
        divScores.innerHTML += `<div class="alert alert-light border border-primary mb-2 shadow-sm"><strong class="text-primary">RISQ-PATH : ${scoreRisq} point(s)</strong> <em class="text-muted small">— Risque d'allongement du QT</em><br><small class="text-muted">${ttRisq.join(', ') || 'Aucun'}</small><br><small class="fw-bold text-${scoreRisq >= 10 ? 'danger' : 'muted'}">${risqConc}</small></div>`;

        let scoreTisdale = 0; let ttTisdale = [];
        if(patientAge >= 68) { scoreTisdale += 1; ttTisdale.push("Âge ≥68 (+1)"); }
        if(sexe === 'F') { scoreTisdale += 1; ttTisdale.push("Femme (+1)"); }
        if(patientHasMedClass('diuretique')) { scoreTisdale += 1; ttTisdale.push("Diurétique (+1)"); }
        if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] <= 3.5) { scoreTisdale += 2; ttTisdale.push("HypoK (+2)"); }
        if(bioValues['BIO_031'] >= 450) { scoreTisdale += 2; ttTisdale.push("QTc ≥450 (+2)"); }
        if(globalQT_CountKR > 0) { scoreTisdale += 3; ttTisdale.push("Médoc QT (+3)"); }
        let tisdaleConc = scoreTisdale >= 11 ? 'Risque élevé de TdP — monitoring ECG continu' : (scoreTisdale >= 7 ? 'Risque modéré — ECG quotidien recommandé' : 'Risque faible');
        divScores.innerHTML += `<div class="alert alert-light border border-dark mb-2 shadow-sm"><strong class="text-dark">Score de Tisdale : ${scoreTisdale} point(s)</strong> <em class="text-muted small">— Risque de TdP en hospitalisation</em><br><small class="text-muted">${ttTisdale.join(', ') || 'Aucun'}</small><br><small class="fw-bold text-${scoreTisdale >= 11 ? 'danger' : 'muted'}">${tisdaleConc}</small></div>`;

        // Charge Anticholinergique (ACB + CIA)
        let acbClass = scoreACB_global >= 3 ? 'danger' : (scoreACB_global >= 1 ? 'warning' : 'success');
        let acbInterp = scoreACB_global >= 3 ? 'Risque cognitif élevé — confusion, chutes, démence' : (scoreACB_global >= 1 ? 'Charge modérée, surveiller' : 'Charge faible');
        let ciaInterp = scoreCIA_global >= 3 ? 'Risque sédatif élevé — chutes, somnolence' : (scoreCIA_global >= 1 ? 'Charge modérée' : 'Charge faible');
        let acbMeds = activeMeds.filter(m => m.db_ref && parseFloat(m.db_ref.acb) > 0).map(m => `${m.dci} (ACB ${m.db_ref.acb})`);
        let ciaMeds = activeMeds.filter(m => m.db_ref && parseFloat(m.db_ref.cia) > 0).map(m => `${m.dci} (CIA ${m.db_ref.cia})`);
        divScores.innerHTML += `<div class="alert alert-light border border-${acbClass} mb-2 shadow-sm">
            <strong class="text-${acbClass}">Score ACB : ${scoreACB_global}</strong> <em class="text-muted small">— Charge anticholinergique cumulée</em><br>
            <small class="text-muted">${acbInterp}${acbMeds.length > 0 ? ' — ' + acbMeds.join(', ') : ''}</small><br>
            <strong class="text-${scoreCIA_global >= 3 ? 'danger' : (scoreCIA_global >= 1 ? 'warning' : 'success')}">Score CIA : ${scoreCIA_global}</strong> <em class="text-muted small">— Charge sédative/cognitive cumulée</em><br>
            <small class="text-muted">${ciaInterp}${ciaMeds.length > 0 ? ' — ' + ciaMeds.join(', ') : ''}</small>
        </div>`;

        // Score de Child-Pugh (saisie manuelle OU calcul automatique)
        let cpManualEl = document.getElementById('cpManual');
        let cpManualVal = cpManualEl ? cpManualEl.value : '0';
        let cpScore = 0;
        let cpClass = null;
        let cpSource = '';

        if (cpManualVal !== '0') {
            // Saisie manuelle directe de la classe Child-Pugh
            cpClass = cpManualVal; // 'A', 'B' ou 'C'
            cpScore = cpClass === 'A' ? 6 : (cpClass === 'B' ? 8 : 12); // Score estimé médian
            cpSource = '(saisie manuelle)';
        } else if (isChecked('chkFoie')) {
            // Calcul automatique à partir des 5 items — uniquement si hépatopathie cochée
            cpScore = getVal('cpBili') + getVal('cpAlb') + getVal('cpTp') + getVal('cpAscite') + getVal('cpEnceph');
            if (cpScore >= 6) {
                cpClass = cpScore <= 6 ? 'A' : (cpScore <= 9 ? 'B' : 'C');
                cpSource = `(${cpScore} pts calculés)`;
            }
        }

        // Pont Child-Pugh → PAT_034 : injection automatique même sans chkFoie
        if (cpClass && !activeComorbs.includes('PAT_034')) {
            if (typeof MASTER_DB !== 'undefined' && MASTER_DB.PATHOLOGIES && MASTER_DB.PATHOLOGIES['PAT_034']) {
                activeComorbs.push('PAT_034');
            }
        }
        // Pont Child-Pugh → contexte_clinique
        if (cpClass && !ctxClinique.includes("hepatopathie")) {
            ctxClinique.push("hepatopathie");
        }

        if (cpClass || isChecked('chkFoie')) {
            if (!cpClass) cpClass = 'C'; // Si checkbox "Hépatopathie sévère" cochée sans score → considérer C par prudence
            if (!cpSource) cpSource = '(hépatopathie sévère cochée, classe C par prudence)';
            let cpColor = cpClass === 'A' ? 'success' : (cpClass === 'B' ? 'warning' : 'danger');
            let cpConc = cpClass === 'A' ? 'Bonne fonction hépatique — peu d\'adaptations'
                : (cpClass === 'B' ? 'Insuffisance modérée — réduire doses des médicaments à métabolisme hépatique'
                : 'Insuffisance sévère — CI de nombreux médicaments hépatotoxiques');

            // Médicaments à forte liaison albumine (risque surdosage si IHC)
            let hepatoMeds = activeMeds.filter(m => {
                let ref = m.db_ref; if (!ref) return false;
                let alb = parseFloat(ref.albumine) || 0;
                return alb >= 85;
            }).map(m => m.dci.toUpperCase());
            let hepatoAlert = hepatoMeds.length > 0 ? `<br><span class="text-danger small fw-bold">Médicaments à forte liaison albumine (risque surdosage) : ${hepatoMeds.join(', ')}</span>` : '';

            // ---- Adaptations posologiques hépatiques par médicament ----
            let cpDrugAlerts = '';
            if (typeof CHILD_PUGH_ADAPTATIONS !== 'undefined') {
                let drugAlertList = [];
                activeMeds.forEach(m => {
                    let key = m.dci.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                    let adapt = CHILD_PUGH_ADAPTATIONS[key];
                    if (!adapt) {
                        // Essayer avec le nom sans espace
                        for (let k of Object.keys(CHILD_PUGH_ADAPTATIONS)) {
                            if (key.includes(k) || k.includes(key)) { adapt = CHILD_PUGH_ADAPTATIONS[k]; break; }
                        }
                    }
                    if (adapt) {
                        let info = adapt[cpClass];
                        if (info) {
                            let alertColor = info.ci ? 'danger' : (info.reduire ? 'warning' : 'info');
                            let icon = info.ci ? '🛑 CI' : (info.reduire ? '⚠️ Adapter' : 'ℹ️');
                            drugAlertList.push(`<span class="badge bg-${alertColor} me-1">${icon} ${m.dci.toUpperCase()}</span> <small>${info.msg}</small>`);
                        }
                    }
                });
                if (drugAlertList.length > 0) {
                    cpDrugAlerts = `<br><hr class="my-1"><strong class="small text-dark">Adaptations posologiques hépatiques :</strong><br>` + drugAlertList.join('<br>');
                }
            }

            divScores.innerHTML += `<div class="alert alert-light border border-${cpColor} mb-2 shadow-sm">
                <strong class="text-${cpColor}">Child-Pugh : Classe ${cpClass}</strong> <small class="text-muted">${cpSource}</small>
                <em class="text-muted small"> — Sévérité de l'insuffisance hépatique</em><br>
                <small class="fw-bold text-${cpColor}">${cpConc}</small>
                ${hepatoAlert}${cpDrugAlerts}
            </div>`;
        }
    }

    // =========================================================
    // 3. MOTEUR BIOLOGIQUE (Syndromes d'Iatrogénie)
    // =========================================================
    const checkBioSyndrome = (syndId, conditionRemplie) => {
        if(!conditionRemplie) return;
        try {
            let s = MASTER_DB.SYNDROMES[syndId]; if(!s) return;
            let causes = [];
            if(s.IMPUTABILITE_FREQ) s.IMPUTABILITE_FREQ.split(',').map(x=>x.trim().replace(/\s*\(.*?\)/g, '')).filter(x=>x).forEach(c => { if(patientHasMedClass(c)) causes.push(c); });
            let imputStr = causes.length > 0 ? `<br><em>Imputabilité iatrogène détectée :</em> <b>${causes.join(', ').toUpperCase()}</b>` : '';
            let isSevere = String(s.GRAVITE).includes('Sévère') || String(s.GRAVITE).includes('Severe');
            addAlert('alertes-bio', `<div class="alert alert-${isSevere ? 'danger alert-stopp' : 'warning border-warning'} shadow-sm"><strong>${isSevere ? '🚨' : '⚠️'} ${s.NOM_SYNDROME}</strong>${imputStr}<br><em>Conduite :</em> ${s.CONDUITE_IMMEDIATE || 'Surveillance'}</div>`, 'bio');
        } catch(e) {}
    };

    // --- SYND_001 : Cytolyse Hépatique (ASAT > 3N ou ALAT > 3N) ---
    if(bioValues['BIO_013'] > 135 || bioValues['BIO_014'] > 105) checkBioSyndrome('SYND_001', true);

    // --- SYND_002 : Rhabdomyolyse (CPK > 5N) ---
    if(bioValues['BIO_018'] > 850) checkBioSyndrome('SYND_002', true);

    // --- SYND_003 : Allongement du QTc ---
    if(bioValues['BIO_031'] >= 450) checkBioSyndrome('SYND_003', true);

    // --- SYND_004 : Thrombopénie Sévère (Plaquettes < 100 G/L) ---
    if(bioValues['BIO_010'] > 0 && bioValues['BIO_010'] < 100) checkBioSyndrome('SYND_004', true);

    // --- SYND_005 : Anémie (Hb < 13 H / < 12 F) ---
    {
        let hb = bioValues['BIO_009'];
        let seuilAnemia = (sexe === 'M') ? 13 : 12;
        if (hb > 0 && hb < seuilAnemia) {
            checkBioSyndrome('SYND_005', true);
            // Sous-typage anémie : ferriprive vs macrocytaire vs rénale
            let fer = bioValues['BIO_020']; let cst = bioValues['BIO_CST']; let crp = bioValues['BIO_024'];
            let b12 = bioValues['BIO_021']; let b9 = bioValues['BIO_022']; let dfg = bioValues['BIO_004'];

            // SYND_006 : Anémie Ferriprive (Hb basse + Ferritine < 30 ou CST < 20%)
            if ((fer > 0 && fer < 30) || (cst > 0 && cst < 20)) {
                checkBioSyndrome('SYND_006', true);
            } else if (fer <= 0 && cst <= 0 && hb < seuilAnemia) {
                // Ferritine et CST non dosés → recommander le bilan martial
                let inflNote = (crp > 0 && crp > 5) ? ' <em class="text-warning">(CRP élevée : interpréter ferritine avec prudence, seuil carentiel < 100 µg/L en contexte inflammatoire)</em>' : '';
                addAlert('alertes-bio', `<div class="alert alert-info border-info shadow-sm"><strong>💡 Anémie détectée — Bilan martial recommandé</strong>
                    <br><span class="small">Hb ${hb} g/dL (seuil ${seuilAnemia}). Dosage ferritine + CST + CRP indispensable pour orienter le diagnostic étiologique.${inflNote}</span>
                    <br><em>Si ferritine &lt; 30 µg/L (ou &lt; 100 en inflammation) : carence martiale → fer PO/IV. Si ferritine normale avec CST &lt; 20% : carence fonctionnelle.</em></div>`, 'bio');
            }

            // SYND_007 : Anémie Macrocytaire / Carence B12-B9
            if ((b12 > 0 && b12 < 150) || (b9 > 0 && b9 < 7)) {
                checkBioSyndrome('SYND_007', true);
            } else if (b12 <= 0 && b9 <= 0) {
                addAlert('alertes-bio', `<div class="alert alert-info border-info shadow-sm"><strong>💡 Anémie — doser B12 et folates</strong>
                    <br><span class="small">Hb ${hb} g/dL. Dosage vitamine B12 et folates recommandé pour exclure une carence (fréquente sous metformine, IPP, antiépileptiques).</span></div>`, 'bio');
            }

            // SYND_039 : Anémie Rénale (Hb < 11 + DFG < 45)
            if (hb < 11 && dfg > 0 && dfg < 45) {
                checkBioSyndrome('SYND_039', true);
            }
        }
    }

    // --- SYND_008 : Insuffisance Rénale Fonctionnelle (Urée/Créat > 100) ---
    if (bioValues['BIO_007'] > 0 && bioValues['BIO_003'] > 0) {
        let ratioUreCreat = (bioValues['BIO_007'] * 1000) / bioValues['BIO_003'];
        if (ratioUreCreat > 100) checkBioSyndrome('SYND_008', true);
    }

    // --- SYND_009 : Hyponatrémie Sévère (Na < 130) ---
    if (bioValues['BIO_002'] > 0 && bioValues['BIO_002'] < 130) checkBioSyndrome('SYND_009', true);

    // --- SYND_010 : Hyperkaliémie (K > 5.0) ---
    if(bioValues['BIO_001'] > 5.0) checkBioSyndrome('SYND_010', true);

    // --- SYND_011 : Hypokaliémie (K < 3.5) ---
    if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] < 3.5) checkBioSyndrome('SYND_011', true);

    // --- SYND_012/013 : Dysthyroïdie (TSH + T4/T3) ---
    let tsh = bioValues['BIO_019']; let t4 = bioValues['BIO_T4']; let t3 = bioValues['BIO_T3'];
    if (tsh > 0) {
        if (tsh > 4.0) {
            let isOvert = (t4 > 0 && t4 < 60) || tsh > 10;
            checkBioSyndrome(isOvert ? 'SYND_013' : 'SYND_013', true);
            let thyroLabel = isOvert ? 'Hypothyroïdie avérée' : 'Hypothyroïdie subclinique';
            let thyroSev = isOvert ? 'danger' : 'warning';
            let thyroCauses = [];
            ['amiodarone', 'lithium', 'carbamazepine', 'interferon', 'sunitinib', 'ipilimumab', 'nivolumab'].forEach(d => { if(patientHasMedClass(d)) thyroCauses.push(d); });
            let thyroImput = thyroCauses.length > 0 ? `<br><em>Imputabilité iatrogène :</em> <b>${thyroCauses.join(', ').toUpperCase()}</b>` : '';
            let thyroConc = isOvert ? 'Traitement substitutif par lévothyroxine recommandé. Débuter 12.5-25 µg/j chez le sujet âgé, titrer par paliers de 12.5 µg toutes les 6-8 semaines.' : (tsh > 10 ? 'TSH > 10 — substitution recommandée même si subclinique.' : 'TSH 4-10 — à contrôler à 6-8 semaines, substituer si symptômes ou progression.');
            addAlert('alertes-bio', `<div class="alert alert-${thyroSev} shadow-sm"><strong>${isOvert ? '🚨' : '⚠️'} ${thyroLabel}</strong> (TSH ${tsh} mUI/L${t4 > 0 ? ', T4 ' + t4 + ' nmol/L' : ''})${thyroImput}<br><em>Conduite :</em> ${thyroConc}</div>`, 'bio');
        } else if (tsh < 0.4 && tsh > 0) {
            let isOvert = (t4 > 0 && t4 > 120) || (t3 > 0 && t3 > 2.7);
            // SYND_019 si thyrotoxicose sévère, sinon SYND_012
            if (tsh < 0.1 && t4 > 30) { checkBioSyndrome('SYND_019', true); }
            else { checkBioSyndrome('SYND_012', true); }
            let thyroLabel = isOvert ? 'Hyperthyroïdie avérée' : 'Hyperthyroïdie subclinique';
            let thyroCauses = [];
            ['amiodarone', 'lithium', 'interferon', 'levothyroxine'].forEach(d => { if(patientHasMedClass(d)) thyroCauses.push(d); });
            let thyroImput = thyroCauses.length > 0 ? `<br><em>Imputabilité iatrogène :</em> <b>${thyroCauses.join(', ').toUpperCase()}</b>` : '';
            addAlert('alertes-bio', `<div class="alert alert-${isOvert ? 'danger' : 'warning'} shadow-sm"><strong>${isOvert ? '🚨' : '⚠️'} ${thyroLabel}</strong> (TSH ${tsh} mUI/L${t4 > 0 ? ', T4 ' + t4 + ' nmol/L' : ''}${t3 > 0 ? ', T3 ' + t3 + ' nmol/L' : ''})<br>${thyroImput}<em>Conduite :</em> ${isOvert ? 'Avis endocrino, rechercher cause (Basedow, nodule toxique, amiodarone). Risque FA et ostéoporose.' : 'Contrôle à 6-8 semaines, ECG (risque FA), densitométrie si post-ménopause.'}</div>`, 'bio');
        }
    }

    // --- SYND_014 : Agranulocytose / Neutropénie Sévère (PNN < 0.5) ---
    if (bioValues['BIO_012'] > 0 && bioValues['BIO_012'] < 0.5) checkBioSyndrome('SYND_014', true);
    // Neutropénie modérée (PNN < 1.5 mais > 0.5) — alerte informative
    else if (bioValues['BIO_012'] > 0 && bioValues['BIO_012'] < 1.5) {
        addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Neutropénie modérée</strong> (PNN ${bioValues['BIO_012']} G/L)
            <br><em>Conduite :</em> Contrôle NFS à 48-72h, rechercher cause iatrogène, arrêt médicament suspect si PNN en baisse.</div>`, 'bio');
    }

    // --- SYND_015 : IRC Avancée (DFG < 30) ---
    if (bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 30) checkBioSyndrome('SYND_015', true);

    // --- SYND_016 : Hyperuricémie (> 420 µmol/L H, > 360 F) ---
    {
        let seuilUric = (sexe === 'M') ? 420 : 360;
        if (bioValues['BIO_008'] > seuilUric) checkBioSyndrome('SYND_016', true);
    }

    // --- SYND_017 : Hypoglycémie (Glycémie < 3.9 mmol/L) ---
    if (bioValues['BIO_025'] > 0 && bioValues['BIO_025'] < 3.9) checkBioSyndrome('SYND_017', true);

    // --- SYND_018 : Hyperglycémie Sévère (Glycémie > 20 ou HbA1c > 10%) ---
    if ((bioValues['BIO_025'] > 20) || (bioValues['BIO_026'] > 10)) checkBioSyndrome('SYND_018', true);

    // --- SYND_020 : Hypocalcémie (Ca < 2.0 mmol/L) ---
    if (bioValues['BIO_005'] > 0 && bioValues['BIO_005'] < 2.0) checkBioSyndrome('SYND_020', true);

    // --- SYND_021 : Hypercalcémie (Ca > 2.65 mmol/L) ---
    if (bioValues['BIO_005'] > 2.65) checkBioSyndrome('SYND_021', true);

    // --- SYND_022 : Hypomagnésémie (Mg < 0.75 mmol/L) ---
    if (bioValues['BIO_006'] > 0 && bioValues['BIO_006'] < 0.75) checkBioSyndrome('SYND_022', true);

    // --- SYND_023 : Syndrome Inflammatoire Marqué (CRP > 100) ---
    if (bioValues['BIO_024'] > 100) checkBioSyndrome('SYND_023', true);

    // --- SYND_024 : Sepsis Biologique (PCT > 2 ng/mL) ---
    if (bioValues['BIO_032'] > 2) checkBioSyndrome('SYND_024', true);

    // --- SYND_025 : Carence en Vitamine D Sévère (< 10 ng/mL) ---
    if (bioValues['BIO_023'] > 0 && bioValues['BIO_023'] < 10) checkBioSyndrome('SYND_025', true);
    // Insuffisance en vitamine D (10-30 ng/mL) — alerte modérée
    else if (bioValues['BIO_023'] > 0 && bioValues['BIO_023'] < 30) {
        addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Insuffisance en Vitamine D</strong> (${bioValues['BIO_023']} ng/mL — seuil recommandé ≥ 30)
            <br><em>Conduite :</em> Supplémentation cholécalciférol 800-1000 UI/j ou charge mensuelle, supplémenter calcium si apports insuffisants.</div>`, 'bio');
    }

    // --- SYND_026 : Carence en Folates / B9 (< 7 nmol/L) ---
    if (bioValues['BIO_022'] > 0 && bioValues['BIO_022'] < 7) checkBioSyndrome('SYND_026', true);

    // --- SYND_027 : Surdosage AVK / INR Suprathérapeutique (INR > 4) ---
    if (bioValues['BIO_030'] > 4.0) checkBioSyndrome('SYND_027', true);

    // --- SYND_028 : Lithiémie Toxique / Surdosage Lithium (> 1.5 mEq/L) ---
    if (bioValues['BIO_029'] > 1.5) checkBioSyndrome('SYND_028', true);

    // --- SYND_029 : IC Décompensation Biologique (NT-proBNP élevé selon âge) ---
    {
        let bnp = bioValues['BIO_028'];
        if (bnp > 0) {
            let seuilBnp = patientAge > 75 ? 1800 : (patientAge > 50 ? 900 : 450);
            if (bnp > seuilBnp) checkBioSyndrome('SYND_029', true);
        }
    }

    // --- SYND_030 : Dyslipidémie / Hypertriglycéridémie Sévère ---
    if (bioValues['BIO_027_TG'] > 5.6) checkBioSyndrome('SYND_030', true);

    // --- SYND_031 : Cholestase Biologique (GGT > 3N ou PAL > 2N) ---
    if ((bioValues['BIO_015'] > 150 || bioValues['BIO_016'] > 135)) checkBioSyndrome('SYND_031', true);

    // --- SYND_032 : Ictère / Hyperbilirubinémie (Bili > 35 µmol/L) ---
    if (bioValues['BIO_017'] > 35) checkBioSyndrome('SYND_032', true);

    // --- SYND_033 : Dénutrition / Hypoalbuminémie Sévère (Albumine < 30 g/L) ---
    if (bioValues['BIO_035'] > 0 && bioValues['BIO_035'] < 30) checkBioSyndrome('SYND_033', true);
    // Dénutrition modérée (Albumine 30-35 g/L) — alerte informative
    else if (bioValues['BIO_035'] > 0 && bioValues['BIO_035'] < 35) {
        let albCauses = [];
        ['corticoides', 'prednisone', 'prednisolone', 'dexamethasone'].forEach(d => { if(patientHasMedClass(d)) albCauses.push(d); });
        let albImput = albCauses.length > 0 ? `<br><em>Imputabilité :</em> <b>${albCauses.join(', ').toUpperCase()}</b>` : '';
        addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Hypoalbuminémie modérée / Dénutrition</strong> (Albumine ${bioValues['BIO_035']} g/L)${albImput}
            <br><em>Conduite :</em> Évaluation nutritionnelle (MNA), compléments nutritionnels oraux, adapter posologies des médicaments à forte liaison albumine (risque surdosage).</div>`, 'bio');
    }

    // --- SYND_034 : Pancréatite Aiguë Biologique (Lipase > 3N = 180 UI/L) ---
    if (bioValues['BIO_036'] > 180) checkBioSyndrome('SYND_034', true);

    // --- SYND_035 : Suspicion MTEV / Embolie Pulmonaire (D-Dimères > 500 µg/L, seuil ajusté âge) ---
    {
        let ddim = bioValues['BIO_033'];
        let seuilDdim = patientAge > 50 ? patientAge * 10 : 500;
        if (ddim > seuilDdim) checkBioSyndrome('SYND_035', true);
    }

    // --- SYND_036 : Syndrome Coronarien Aigu (Troponine hs > 52 ng/L) ---
    if (bioValues['BIO_034'] > 52) checkBioSyndrome('SYND_036', true);

    // --- SYND_037 : Pancytopénie (Hb < 10 + Plaq < 100 + GB < 2) ---
    if (bioValues['BIO_009'] > 0 && bioValues['BIO_009'] < 10 && bioValues['BIO_010'] > 0 && bioValues['BIO_010'] < 100 && bioValues['BIO_011'] > 0 && bioValues['BIO_011'] < 2) {
        checkBioSyndrome('SYND_037', true);
    }

    // --- SYND_038 : Hyperlactatémie / Acidose Lactique (Lactates > 2 mmol/L) ---
    if (bioValues['BIO_037'] > 2) checkBioSyndrome('SYND_038', true);

    // --- SYND_040 : Désordre Phospho-Calcique IRC (Phosphore > 1.45 + DFG < 45) ---
    if (bioValues['BIO_PHOS'] > 1.45 && bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 45) checkBioSyndrome('SYND_040', true);

    // --- SYND_041 : Neutropénie Fébrile sous Chimiothérapie (PNN < 1.0 + T > 38.3°C) ---
    if (bioValues['BIO_012'] > 0 && bioValues['BIO_012'] < 1.0 && bioValues['BIO_TEMP'] > 38.3) checkBioSyndrome('SYND_041', true);

    // --- SYND_042 : Hypernatrémie / Déshydratation Intracellulaire (Na > 145) ---
    if (bioValues['BIO_002'] > 145) checkBioSyndrome('SYND_042', true);

    // --- Supplémentation vitamine D systématique si âge avancé (sans carence documentée) ---
    if (patientAge >= 70 && (!bioValues['BIO_023'] || bioValues['BIO_023'] <= 0) && !patientHasMedClass('cholecalciferol') && !patientHasMedClass('vitamine d') && !patientHasMedClass('calcifediol')) {
        addAlert('alertes-initier', `<div class="alert alert-info border-info shadow-sm"><strong>💡 Vitamine D — supplémentation systématique recommandée</strong>
            <span class="badge bg-secondary float-end" style="font-size:0.65em;">HAS 2011 / Sociétés savantes</span>
            <br><span class="small">Chez le sujet âgé ≥ 70 ans, notamment institutionnalisé ou à risque de chute/fracture, un apport systématique de vitamine D par voie orale (800-1000 UI/j) est recommandé sans dosage préalable obligatoire.</span>
        </div>`, 'initier');
    }

    // --- Carence B12 isolée (sans anémie) — fréquente sous metformine/IPP ---
    if (bioValues['BIO_021'] > 0 && bioValues['BIO_021'] < 150 && !(bioValues['BIO_009'] > 0 && bioValues['BIO_009'] < 12)) {
        let b12Causes = [];
        ['metformine', 'omeprazole', 'esomeprazole', 'lansoprazole', 'pantoprazole', 'rabeprazole', 'phenytoine'].forEach(d => { if(patientHasMedClass(d)) b12Causes.push(d); });
        let b12Imput = b12Causes.length > 0 ? `<br><em>Imputabilité iatrogène :</em> <b>${b12Causes.join(', ').toUpperCase()}</b>` : '';
        addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Carence en Vitamine B12 (sans anémie)</strong> (B12 : ${bioValues['BIO_021']} pmol/L)${b12Imput}
            <br><em>Conduite :</em> Supplémentation B12 IM ou forte dose PO (1000 µg/j), contrôle à 3 mois. Neuropathie périphérique possible même sans anémie.</div>`, 'bio');
    }

    // --- HbA1c informative (cibles gériatriques adaptées) ---
    if (bioValues['BIO_026'] > 0) {
        let hba1c = bioValues['BIO_026'];
        if (hba1c > 8.5 && patientAge >= 75) {
            addAlert('alertes-bio', `<div class="alert alert-danger shadow-sm"><strong>🚨 HbA1c élevée chez le sujet âgé</strong> (HbA1c ${hba1c}%)
                <br><em>Cibles gériatriques :</em> HbA1c 7-8% si robuste, 8-8.5% si fragile, 8.5-9% si très dépendant (ADA/EASD 2022).
                <br><em>Conduite :</em> Réévaluer traitement antidiabétique, attention hypoglycémies sous sulfamides/insuline.</div>`, 'bio');
        } else if (hba1c < 6.5 && patientAge >= 75 && (patientHasMedClass('sulfamide') || patientHasMedClass('insuline') || patientHasMedClass('glinide'))) {
            addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ HbA1c basse sous traitement hypoglycémiant</strong> (HbA1c ${hba1c}%)
                <br><em>Risque :</em> Hypoglycémie iatrogène chez le sujet âgé (chutes, confusion, AVC).
                <br><em>Conduite :</em> Envisager réduction de dose ou arrêt sulfamide/insuline. Cible HbA1c gériatrique : 7-8%.</div>`, 'bio');
        }
    }

    // Médicaments abaissant le seuil épileptogène (si épilepsie active)
    // Données lues depuis MASTER_DB champ epileptogene (eleve/modere/faible)
    if (activeComorbs.includes('PAT_015')) {
        let found = [];
        activeMeds.forEach(m => {
            let ref = m.db_ref || {};
            if (ref.epileptogene) {
                let niveau = ref.epileptogene === 'eleve' ? '🔴' : ref.epileptogene === 'modere' ? '🟠' : '🟡';
                found.push({ med: m.dci.toUpperCase(), desc: ref.epileptogene_desc || ref.epileptogene, niveau: niveau });
            }
        });
        if (found.length > 0) {
            found.sort((a, b) => a.niveau < b.niveau ? -1 : 1); // élevé en premier
            let list = found.map(f => `<li>${f.niveau} <b>${f.med}</b> — ${f.desc}</li>`).join('');
            addAlert('alertes-eviter', `<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Médicaments abaissant le seuil épileptogène</strong>
                <span class="badge bg-secondary float-end" style="font-size:0.65em;">Epilepsie active</span>
                <br><span class="small">Patient épileptique — les médicaments suivants augmentent le risque de crise :</span>
                <ul class="mb-0 ps-3 small">${list}</ul>
            </div>`, 'eviter');
        }
    }

    // =========================================================
    // 3b. CONTRE-INDICATIONS MÉDICAMENT / PATHOLOGIE (pathology_rules_v3)
    // =========================================================
    if (typeof checkMedContraPathologies === 'function' && activeComorbs.length > 0) {
        activeMeds.forEach(m => {
            const alerts = checkMedContraPathologies(m.dci, m.classe, activeComorbs);
            alerts.forEach(a => {
                let isSevere = String(a.gravite).includes('CONTRE-INDICATION') || String(a.gravite).includes('ABSOLUE');
                // Enrichir avec source ESC si disponible
                let sourceLabel = 'Pathology Rules';
                if (typeof PATHOLOGY_RULES_DB !== 'undefined' && PATHOLOGY_RULES_DB[a.patho]) {
                    let ref = PATHOLOGY_RULES_DB[a.patho].REFERENCE;
                    if (ref) sourceLabel = ref.split('|')[0].trim();
                    let srcEbm = PATHOLOGY_RULES_DB[a.patho].SOURCES_EBM;
                    if (srcEbm && srcEbm.EVITER) {
                        let termLc = sanitizeText(a.med);
                        for (const [k, v] of Object.entries(srcEbm.EVITER)) {
                            if (sanitizeText(k).includes(termLc) || termLc.includes(sanitizeText(k))) {
                                sourceLabel = v; break;
                            }
                        }
                    }
                }
                addAlert('alertes-eviter', `<div class="alert alert-${isSevere ? 'danger alert-stopp' : 'warning border-warning'} shadow-sm">
                    <strong>${isSevere ? '🚨' : '⚠️'} ${m.dci.toUpperCase()} — CI ${a.patho_nom}</strong>
                    <span class="badge bg-secondary float-end" style="font-size:0.65em;" title="${sourceLabel}">${sourceLabel.length > 30 ? sourceLabel.substring(0, 30) + '...' : sourceLabel}</span>
                    <br><span class="small">${a.raison}${a.condition ? ` <em class="text-muted">(${a.condition})</em>` : ''}</span>
                    <br><span class="badge bg-${isSevere ? 'danger' : 'warning'} text-${isSevere ? 'white' : 'dark'}" style="font-size:0.7em;">${a.gravite}</span>
                </div>`, 'eviter');
            });
        });
    }

    // =========================================================
    // 4. MOTEUR DES INTERACTIONS (TABAC, DDI, ANSM & AUC)
    // =========================================================
    try {
        if (isChecked('chkTabac')) {
            let cyp1a2_drugs = ['clozapine', 'olanzapine', 'duloxetine', 'theophylline', 'erlotinib', 'haloperidol', 'fluvoxamine', 'agomelatine'];
            let affected = activeMeds.filter(m => cyp1a2_drugs.some(d => sanitizeText(m.dci).includes(d)));
            if (affected.length > 0) {
                let medNames = affected.map(m => m.dci.toUpperCase()).join(', ');
                addAlert('alertes-auc', `<div class="alert alert-warning border-warning shadow-sm"><strong style="font-size:1.05em; color:#d97706;">🚬 Interaction Tabac (Induction CYP1A2)</strong><br>Le tabagisme diminue fortement l'efficacité de : <b>${medNames}</b>.<br><em class="text-danger small">⚠️ Attention : arrêt brutal = risque de surdosage.</em></div>`, 'auc');
            }
        }

        activeMeds.forEach(m => {
            let ref = m.db_ref; if(!ref) return;
            if(ref.ddi_interact && ref.ddi_interact !== "Aucune majeure documentee" && ref.ddi_interact !== "nan") {
                let interactors = ref.ddi_interact.split(/[,\/]/).map(x=>x.trim()).filter(x=>x.length > 2);
                let found = [];
                interactors.forEach(inter => {
                    let cInter = sanitizeText(inter);
                    if(patientHasMedClass(cInter) || activeMeds.some(am => sanitizeText(am.dci).includes(cInter) || sanitizeText(am.classe).includes(cInter))) found.push(inter);
                });
                if(found.length > 0) {
                    addAlert('alertes-interact', `<div class="alert alert-danger shadow-sm"><strong>🚨 Co-prescription à risque : ${ref.dci.toUpperCase()}</strong><br>Interaction détectée avec : <b>${found.join(', ')}</b></div>`, 'interact');
                }
            }
        });

        let groupedAnsm = {}; let groupedAuc = {};
        for(let i=0; i<activeMeds.length; i++) {
            for(let j=i+1; j<activeMeds.length; j++) {
                let mA = activeMeds[i], mB = activeMeds[j];
                let pairName = `${mA.dci.toUpperCase()} + ${mB.dci.toUpperCase()}`;
                let dciA = sanitizeText(mA.dci); let dciB = sanitizeText(mB.dci);
                let matchesAuc = [];
                
                // AUC EXTERNE
                if(typeof DDI_MERGED_DB !== 'undefined') {
                    let rootsA = [dciA]; let rootsB = [dciB];
                    if (dciA.includes('rifampic')) rootsA.push('rifampin');
                    if (dciA.includes('quetiap')) rootsA.push('quetiapine');
                    if (dciB.includes('rifampic')) rootsB.push('rifampin');
                    if (dciB.includes('quetiap')) rootsB.push('quetiapine');

                    let aucFiltered = DDI_MERGED_DB.filter(d => {
                        let p = sanitizeText(String(d.perpetrator)); let v = sanitizeText(String(d.victim));
                        return (rootsA.some(r => r.includes(p)) && rootsB.some(r => r.includes(v))) || (rootsB.some(r => r.includes(p)) && rootsA.some(r => r.includes(v)));
                    });
                    matchesAuc.push(...aucFiltered);
                }
                
                // AUC RÈGLES
                if ((dciA.includes('ritonavir') && dciB.includes('quetiapine')) || (dciB.includes('ritonavir') && dciA.includes('quetiapine'))) matchesAuc.push({ auc_ratio: 6.2, mechanism: "Inhibition puissante CYP3A4", note: "FDA" });
                if ((dciA.includes('clarithromycin') && dciB.includes('quetiapine')) || (dciB.includes('clarithromycin') && dciA.includes('quetiapine'))) matchesAuc.push({ auc_ratio: 2.8, mechanism: "Inhibition forte CYP3A4", note: "PK" });
                if ((dciA.includes('ritonavir') && dciB.includes('apixaban')) || (dciB.includes('ritonavir') && dciA.includes('apixaban'))) matchesAuc.push({ auc_ratio: 2.5, mechanism: "Inhibition CYP3A4 & P-gp (Risque Hémorragique Majeur)", note: "FDA" });
                if ((dciA.includes('clarithromycin') && dciB.includes('apixaban')) || (dciB.includes('clarithromycin') && dciA.includes('apixaban'))) matchesAuc.push({ auc_ratio: 1.6, mechanism: "Inhibition CYP3A4", note: "PK" });
                
                if (matchesAuc.length > 0) {
                    if(!groupedAuc[pairName]) groupedAuc[pairName] = { items: [] };
                    matchesAuc.forEach(m => { if(!isNaN(parseFloat(m.auc_ratio))) groupedAuc[pairName].items.push(m); });
                }

                // ANSM
                let ansmDb = typeof ANSM_DDI_DB !== 'undefined' ? ANSM_DDI_DB : (typeof ansm_ddi_data !== 'undefined' ? ansm_ddi_data : null);
                if(ansmDb && Array.isArray(ansmDb)) {
                    ansmDb.forEach(d => {
                        let term1 = d.d1 || d.molecule1 || d.nom1 || "";
                        let term2 = d.d2 || d.molecule2 || d.nom2 || "";
                        let niveau = String(d.level || d.niveau || "Interaction").toUpperCase();
                        let desc = String(d.desc || d.description || d.message || "");

                        if ((medMatchesAnsmTerm(mA, term1) && medMatchesAnsmTerm(mB, term2)) ||
                            (medMatchesAnsmTerm(mA, term2) && medMatchesAnsmTerm(mB, term1))) {

                            if(!groupedAnsm[pairName]) groupedAnsm[pairName] = { isDanger: false, raw: [] };
                            let isDanger = niveau.includes("CONTRE-INDICATION") || niveau.includes("DECONSEILLE") || niveau.includes("MAJEUR");
                            if(isDanger) groupedAnsm[pairName].isDanger = true;

                            if(!groupedAnsm[pairName].raw.some(ex => ex.source === 'ANSM' && ex.level === niveau && ex.desc.toLowerCase() === desc.toLowerCase())) {
                                groupedAnsm[pairName].raw.push({ level: niveau, desc: desc, isDanger: isDanger, source: 'ANSM' });
                            }
                        }
                    });
                }

                // GPT_DDI_DB (BNF + Micromedex — événements cliniques)
                if(typeof GPT_DDI_DB !== 'undefined' && Array.isArray(GPT_DDI_DB)) {
                    GPT_DDI_DB.forEach(d => {
                        if ((medMatchesAnsmTerm(mA, d.d1) && medMatchesAnsmTerm(mB, d.d2)) ||
                            (medMatchesAnsmTerm(mA, d.d2) && medMatchesAnsmTerm(mB, d.d1))) {

                            if(!groupedAnsm[pairName]) groupedAnsm[pairName] = { isDanger: false, raw: [] };
                            let niveau = String(d.niveau || "Interaction").toUpperCase();
                            let isDanger = niveau.includes("CONTRE-INDICATION") || niveau.includes("MAJEUR");
                            if(isDanger) groupedAnsm[pairName].isDanger = true;
                            let desc = `${d.event || ''} — ${d.source || 'BNF+Micromedex'}`;

                            if(!groupedAnsm[pairName].raw.some(ex => ex.desc.toLowerCase() === desc.toLowerCase())) {
                                groupedAnsm[pairName].raw.push({ level: niveau, desc: desc, isDanger: isDanger, source: d.source || 'BNF+Micromedex' });
                            }
                        }
                    });
                }
            }
        }

        for (const [pair, data] of Object.entries(groupedAuc)) {
            let uniqueItems = []; data.items.forEach(item => { if(!uniqueItems.some(u => parseFloat(u.auc_ratio) === parseFloat(item.auc_ratio))) uniqueItems.push(item); });
            let detailsHtml = uniqueItems.map(m => {
                let ratio = parseFloat(m.auc_ratio); let txtRatio = ratio < 1 ? `x${ratio} (Baisse)` : `x${ratio} (Hausse)`;
                return `<li style="margin-bottom:6px;"><span class="fw-bold">${(ratio >= 3 || ratio <= 0.3) ? '🔴' : '🟠'} Ratio ${txtRatio}</span><br><em class="text-muted small">${m.mechanism}</em></li>`;
            }).join('');
            addAlert('alertes-auc', `<div class="alert alert-warning border-warning shadow-sm"><strong style="font-size:1.05em;">📈 Pharmacocinétique (AUC) : ${pair}</strong><ul class="mb-0 ps-3">${detailsHtml}</ul></div>`, 'auc');
        }

        for (const [pair, data] of Object.entries(groupedAnsm)) {
            let boxClass = data.isDanger ? "danger alert-stopp" : "warning";
            // Séparer les sources ANSM et Micromedex/BNF
            let ansmItems = data.raw.filter(x => x.source === 'ANSM');
            let otherItems = data.raw.filter(x => x.source !== 'ANSM');
            let itemsHtml = '';
            if (ansmItems.length > 0) {
                itemsHtml += ansmItems.map(x => `<li style="margin-bottom: 6px;"><span class="${x.isDanger ? 'text-danger' : 'text-dark'} fw-bold">${x.isDanger ? '🔴' : '🟠'} ${x.level}</span> <span class="badge bg-primary" style="font-size:0.6em;">ANSM</span><br><span class="small text-muted">${x.desc}</span></li>`).join('');
            }
            if (otherItems.length > 0) {
                itemsHtml += otherItems.map(x => `<li style="margin-bottom: 6px;"><span class="${x.isDanger ? 'text-danger' : 'text-dark'} fw-bold">${x.isDanger ? '🔴' : '🟠'} ${x.level}</span> <span class="badge bg-info" style="font-size:0.6em;">${x.source}</span><br><span class="small text-muted">${x.desc}</span></li>`).join('');
            }
            let sourceLabel = ansmItems.length > 0 && otherItems.length > 0 ? 'ANSM + Micromedex' : (ansmItems.length > 0 ? 'ANSM' : 'Micromedex');
            addAlert('alertes-ansm', `<div class="alert alert-${boxClass} shadow-sm"><strong style="font-size:1.05em;">${data.isDanger ? '🚨' : '⚡'} Interactions ${sourceLabel} : ${pair}</strong><ul class="mb-0 ps-3">${itemsHtml}</ul></div>`, 'ansm');
        }
    } catch(e) { console.error("Erreur Interactions", e); }

    // =========================================================
    // 5. POSOLOGIES ET PROTOCOLES BIOLOGIQUES INTÉGRÉS V2
    // =========================================================
    activeMeds.forEach(m => {
        let ref = m.db_ref; if (!ref) return;

        let hasPoso = ref.poso_hab || ref.poso_ger || ref.poso_ren || ref.atb_legere || ref.atb_moderee || ref.atb_severe; 
        let dfg = bioValues['BIO_004']; let alb = parseFloat(ref.albumine) || 0;

        if (hasPoso || alb >= 85) {
            let html = `<div class="alert alert-success border border-success shadow-sm"><strong class="text-success">💊 Posologies : ${ref.dci.toUpperCase()}</strong><br>`;
            if (ref.poso_hab) html += `<em>Standard :</em> ${ref.poso_hab}<br>`;
            if (ref.poso_ger) html += `<em>👴 Gériatrique :</em> <b>${ref.poso_ger}</b><br>`;
            
            if (ref.poso_ren) {
                let isDanger = (dfg > 0 && dfg < 50 && (ref.poso_ren.toLowerCase().includes('ci') || ref.poso_ren.toLowerCase().includes('contre-ind')));
                let color = isDanger ? 'text-danger fw-bold' : (dfg > 0 && dfg < 50 ? 'text-warning text-dark fw-bold' : 'text-dark');
                html += `<span class="${color}"><em>🧪 Fonction Rénale :</em> ${ref.poso_ren}</span><br>`;
            }
            if (ref.atb_legere || ref.atb_moderee || ref.atb_severe) {
                let isLegere = (dfg > 60 && dfg <= 90); let isModeree = (dfg > 30 && dfg <= 60); let isSevere = (dfg > 15 && dfg <= 30); let isTerminale = (dfg > 0 && dfg <= 15); let isUnk = (dfg <= 0);
                html += `<div class="mt-2 p-2 bg-white rounded border border-success border-opacity-50"><b>Adaptations ATB selon DFG :</b><br>`;
                if(ref.atb_legere) html += `<span class="${isLegere ? 'bg-warning bg-opacity-25 fw-bold px-1 rounded' : 'text-muted'}">- Légère (60-90) : ${ref.atb_legere}</span><br>`;
                if(ref.atb_moderee) html += `<span class="${isModeree ? 'bg-warning bg-opacity-50 fw-bold px-1 rounded' : 'text-muted'}">- Modérée (30-60) : ${ref.atb_moderee}</span><br>`;
                if(ref.atb_severe) html += `<span class="${isSevere ? 'bg-danger text-white fw-bold px-1 rounded' : 'text-muted'}">- Sévère (15-30) : ${ref.atb_severe}</span><br>`;
                if(ref.atb_terminale) html += `<span class="${isTerminale ? 'bg-danger text-white fw-bold px-1 rounded' : 'text-muted'}">- Terminale (<15) : ${ref.atb_terminale}</span>`;
                html += `</div>`;
            }
            if (alb >= 85) html += `<span class="text-danger small d-block border-top pt-1 mt-1 border-success border-opacity-25"><em>🩸 Forte liaison à l'albumine :</em> <b>${alb}%</b> (Risque surdosage si dénutrition).</span>`;
            html += `</div>`;
            addAlert('alertes-usage', html, 'usage');
        }

        if (ref.suivi_initial || ref.suivi_periodique || ref.alerte_clinique) {
            let sHtml = `<div class="alert alert-light border border-primary shadow-sm"><strong class="text-primary" style="font-size:1.05em;">👁️ Protocole de Suivi Médicamenteux : ${ref.dci.toUpperCase()}</strong><hr class="mt-2 mb-2" style="opacity:0.15;">`;
            if (ref.suivi_initial) sHtml += `<div class="mb-2 text-dark"><b>Initial :</b> ${formatSuiviList(ref.suivi_initial)}</div>`;
            if (ref.suivi_periodique) sHtml += `<div class="mb-2 text-dark"><b>Régulier :</b> ${formatSuiviList(ref.suivi_periodique)}</div>`;
            if (ref.alerte_clinique) sHtml += `<div style="color: #d97706;"><b>⚠️ À surveiller :</b> ${formatSuiviList(ref.alerte_clinique)}</div>`;
            
            let anomaliesTrouvees = [];
            if(Array.isArray(ref.bio_cible)) {
                ref.bio_cible.forEach(bio_id => {
                    let val = bioValues[bio_id];
                    if (val > 0) {
                        if (bio_id === 'BIO_004' && val < 60) anomaliesTrouvees.push(`🧪 DFG abaissé (${val} ml/min)`);
                        if (bio_id === 'BIO_001' && (val < 3.5 || val > 5.0)) anomaliesTrouvees.push(`🩸 Dyskaliémie (${val} mmol/L)`);
                        if (bio_id === 'BIO_031' && val >= 450) anomaliesTrouvees.push(`⚡ QTc allongé (${val} ms)`);
                    }
                });
            }
            if (anomaliesTrouvees.length > 0) sHtml += `<div class="mt-3 p-2 bg-danger bg-opacity-10 border border-danger text-danger rounded shadow-sm"><b>⚠️ Anomalies détectées :</b><br>` + anomaliesTrouvees.join('<br>') + `</div>`;
            sHtml += `</div>`;
            addAlert('alertes-suivi', sHtml, 'suivi');
        }
    });

    // 🧪 INJECTION DES PROTOCOLES DE SURVEILLANCE BIOLOGIQUE PAR PATHOLOGIE (V2)
    // Regroupement par pathologie pour lisibilité
    if (typeof getRequiredBioMonitoring === 'function' && activeComorbs.length > 0) {
        try {
            const bioMonitors = getRequiredBioMonitoring(activeComorbs);
            // Regrouper par pathologie
            const byPatho = {};
            for (const [bioId, data] of Object.entries(bioMonitors)) {
                data.pathos.forEach((p, i) => {
                    if (!byPatho[p]) byPatho[p] = [];
                    byPatho[p].push({
                        bioId,
                        nom: MASTER_DB.BIOLOGIE[bioId]?.NOM_STANDARD || bioId,
                        frequence: data.frequences[i] || data.frequences[0] || '',
                        source: data.sources[i] || data.sources[0] || ''
                    });
                });
            }
            for (const [patId, bios] of Object.entries(byPatho)) {
                let patName = MASTER_DB.PATHOLOGIES[patId]?.NOM_STANDARD || patId;
                let rows = bios.map(b => `<tr><td class="small">${b.nom}</td><td class="small text-muted">${b.frequence}</td></tr>`).join('');
                let sources = [...new Set(bios.map(b => b.source).filter(Boolean))].join(', ');
                let html = `<div class="alert alert-info border-info shadow-sm py-2 px-2">
                    <strong class="text-info" style="font-size:0.95em;">🧪 Surveillance biologique — ${patName}</strong>
                    ${sources ? `<span class="badge bg-secondary float-end" style="font-size:0.6em;">${sources}</span>` : ''}
                    <table class="table table-sm table-borderless mb-0 mt-1" style="font-size:0.88em;">
                    <tbody>${rows}</tbody></table>
                </div>`;
                addAlert('alertes-suivi', html, 'suivi');
            }
        } catch(e) { console.error("Erreur BioMonitor:", e); }
    }


    if(counts.eviter === 0) document.getElementById('alertes-eviter').innerHTML = '<div class="alert alert-light">Aucune prescription inappropriée détectée.</div>';
    if(counts.initier === 0) document.getElementById('alertes-initier').innerHTML = '<div class="alert alert-light">Aucune omission majeure détectée.</div>';
    if(counts.usage === 0) document.getElementById('alertes-usage').innerHTML = '<div class="alert alert-light">Aucune adaptation posologique spécifique requise.</div>';
    if(counts.suivi === 0) document.getElementById('alertes-suivi').innerHTML = '<div class="alert alert-light">Aucun suivi biologique spécifique.</div>';
    if(counts.ansm === 0) document.getElementById('alertes-ansm').innerHTML = '<div class="alert alert-light">Aucune interaction du thésaurus ANSM détectée.</div>';
    if(counts.interact === 0) document.getElementById('alertes-interact').innerHTML = '<div class="alert alert-light">Aucun risque clinique ou Pharmacocinétique détecté.</div>';
    if(counts.bio === 0) document.getElementById('alertes-bio').innerHTML = '<div class="alert alert-light">Aucune anomalie syndromique biologique.</div>';

    // =========================================================
    // 8. ONGLET GUIDELINES — Recommandations EBM par pathologie
    // =========================================================
    const divGuidelines = document.getElementById('alertes-guidelines');
    if (divGuidelines && typeof PATHOLOGY_RULES_DB !== 'undefined' && activeComorbs.length > 0) {
        let guidelinesHtml = '';
        activeComorbs.forEach(pathoId => {
            const rule = PATHOLOGY_RULES_DB[pathoId];
            if (!rule || !rule.TRAITEMENTS) return;

            // Résoudre la référence complète via GUIDELINE_INDEX
            let refFull = rule.REFERENCE || '';
            let refDetails = '';
            if (typeof GUIDELINE_INDEX !== 'undefined' && rule.SOURCES_EBM) {
                const allKeys = new Set();
                ['INITIER', 'EVITER'].forEach(cat => {
                    if (rule.SOURCES_EBM[cat]) {
                        Object.values(rule.SOURCES_EBM[cat]).forEach(v => {
                            // Extract guideline keys like ESC_HF_2023, COMPASS, etc.
                            const matches = v.match(/[A-Z][A-Z0-9_]+/g);
                            if (matches) matches.forEach(k => { if (GUIDELINE_INDEX[k]) allKeys.add(k); });
                        });
                    }
                });
                if (allKeys.size > 0) {
                    refDetails = Array.from(allKeys).map(k =>
                        `<li class="small text-muted">${GUIDELINE_INDEX[k].ref}</li>`
                    ).join('');
                }
            }

            guidelinesHtml += `<div class="card border-0 shadow-sm mb-3">
                <div class="card-header" style="background: linear-gradient(135deg, #6f42c1 0%, #4a1a8a 100%); color: white;">
                    <strong>${rule.NOM}</strong>
                    <br><small style="opacity:0.85;">${refFull}</small>
                </div>
                <div class="card-body p-2">`;

            // Références bibliographiques détaillées
            if (refDetails) {
                guidelinesHtml += `<details class="mb-2">
                    <summary class="small fw-bold" style="color:#6f42c1; cursor:pointer;">Références bibliographiques</summary>
                    <ul class="ps-3 mt-1 mb-0" style="font-size:0.8em;">${refDetails}</ul>
                </details>`;
            }

            // INITIER
            const initier = rule.TRAITEMENTS.INITIER;
            if (initier && initier.length > 0) {
                guidelinesHtml += `<div class="mb-2"><strong class="text-success small">A INITIER</strong></div>`;
                initier.forEach(trt => {
                    // Chercher la source EBM spécifique
                    let srcEbm = '';
                    if (rule.SOURCES_EBM && rule.SOURCES_EBM.INITIER) {
                        for (const [k, v] of Object.entries(rule.SOURCES_EBM.INITIER)) {
                            if (sanitizeText(trt.classe).includes(sanitizeText(k)) || sanitizeText(k).includes(sanitizeText(trt.classe.split('(')[0].trim()))) {
                                srcEbm = v; break;
                            }
                        }
                    }

                    // Composants (quadrithérapie IC)
                    let composantsHtml = '';
                    if (trt.composants) {
                        composantsHtml = `<ul class="ps-3 mb-1">${trt.composants.map(c =>
                            `<li class="small">${c.classe || ''} ${c.niveau ? `<span class="badge bg-success" style="font-size:0.6em;">Niveau ${c.niveau}</span>` : ''}${c.note ? ` <em class="text-muted" style="font-size:0.85em;">${c.note}</em>` : ''}</li>`
                        ).join('')}</ul>`;
                    }

                    guidelinesHtml += `<div class="alert alert-success py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #198754;">
                        <strong class="small">${trt.classe}</strong>
                        ${trt.niveau_preuve ? ` <span class="badge bg-success" style="font-size:0.6em;">Niveau ${trt.niveau_preuve}</span>` : ''}
                        ${srcEbm ? ` <span class="badge bg-dark float-end" style="font-size:0.6em;" title="${srcEbm}">${srcEbm.length > 40 ? srcEbm.substring(0,40)+'...' : srcEbm}</span>` : ''}
                        ${trt.dci_exemples ? `<br><small class="text-muted">DCI : ${trt.dci_exemples.join(', ')}</small>` : ''}
                        ${trt.indication ? `<br><small>${trt.indication}</small>` : (trt.posologie ? `<br><small>${trt.posologie}</small>` : '')}
                        ${composantsHtml}
                        ${trt.condition ? `<br><small class="text-muted fst-italic">Condition : ${trt.condition}</small>` : ''}
                        ${trt.note ? `<br><small class="text-info">${trt.note}</small>` : ''}
                        ${trt.contre_indication_dfg ? `<br><small class="text-danger">${trt.contre_indication_dfg}</small>` : ''}
                        ${trt.ref && !srcEbm ? ` <span class="badge bg-secondary float-end" style="font-size:0.6em;">${trt.ref}</span>` : ''}
                    </div>`;
                });
            }

            // CRISE_AIGUE (ex: Goutte)
            const criseAigue = rule.TRAITEMENTS.CRISE_AIGUE;
            if (criseAigue && criseAigue.length > 0) {
                guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-warning small">TRAITEMENT DE LA CRISE</strong></div>`;
                criseAigue.forEach(trt => {
                    guidelinesHtml += `<div class="alert alert-warning py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #ffc107;">
                        <strong class="small">${trt.classe || ''}</strong>
                        ${trt.indication ? `<br><small>${trt.indication}</small>` : (trt.posologie ? `<br><small>${trt.posologie}</small>` : '')}
                        ${trt.note ? `<br><small class="text-muted">${trt.note}</small>` : ''}
                    </div>`;
                });
            }

            // TRAITEMENT_FOND (ex: Goutte)
            const traitFond = rule.TRAITEMENTS.TRAITEMENT_FOND;
            if (traitFond && traitFond.length > 0) {
                guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-success small">TRAITEMENT DE FOND</strong></div>`;
                traitFond.forEach(trt => {
                    let srcEbm = '';
                    if (rule.SOURCES_EBM && rule.SOURCES_EBM.INITIER) {
                        for (const [k, v] of Object.entries(rule.SOURCES_EBM.INITIER)) {
                            if (sanitizeText(trt.classe).includes(sanitizeText(k)) || sanitizeText(k).includes(sanitizeText(trt.classe.split('(')[0].trim()))) {
                                srcEbm = v; break;
                            }
                        }
                    }
                    guidelinesHtml += `<div class="alert alert-success py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #198754;">
                        <strong class="small">${trt.classe || ''}</strong>
                        ${trt.niveau_preuve ? ` <span class="badge bg-success" style="font-size:0.6em;">Niveau ${trt.niveau_preuve}</span>` : ''}
                        ${srcEbm ? ` <span class="badge bg-dark float-end" style="font-size:0.6em;">${srcEbm}</span>` : ''}
                        ${trt.indication ? `<br><small>${trt.indication}</small>` : (trt.posologie ? `<br><small>${trt.posologie}</small>` : '')}
                        ${trt.note ? `<br><small class="text-info">${trt.note}</small>` : ''}
                    </div>`;
                });
            }

            // ANTICOAGULATION (ex: FA)
            const anticoag = rule.TRAITEMENTS.ANTICOAGULATION;
            if (anticoag) {
                guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-primary small">ANTICOAGULATION</strong></div>`;
                guidelinesHtml += `<div class="alert alert-primary py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #0d6efd;">
                    <small>${anticoag.indication || ''}</small>
                    ${anticoag.premiere_ligne ? `<br><strong class="small">${anticoag.premiere_ligne.classe || ''}</strong> <small class="text-muted">${anticoag.premiere_ligne.note || ''}</small>` : ''}
                </div>`;
                if (anticoag.regles_specifiques_doac) {
                    anticoag.regles_specifiques_doac.forEach(d => {
                        guidelinesHtml += `<div class="small ps-3 mb-1"><strong>${d.dci || ''}</strong> : ${d.dose_pleine || ''} ${d.dose_reduite ? `| Réduite : ${d.dose_reduite}` : ''} ${d.ci_dfg ? `| CI : DFG ${d.ci_dfg}` : ''}</div>`;
                    });
                }
            }

            // EVITER (liste déroulante — médicaments non prescrits)
            const eviter = rule.TRAITEMENTS.EVITER;
            if (eviter && eviter.length > 0) {
                let eviterItems = '';
                eviter.forEach(trt => {
                    let srcEbm = '';
                    if (rule.SOURCES_EBM && rule.SOURCES_EBM.EVITER) {
                        for (const [k, v] of Object.entries(rule.SOURCES_EBM.EVITER)) {
                            if (sanitizeText(trt.classe).includes(sanitizeText(k)) || sanitizeText(k).includes(sanitizeText(trt.classe.split('(')[0].trim()))) {
                                srcEbm = v; break;
                            }
                        }
                    }
                    eviterItems += `<div class="alert alert-danger py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #dc3545;">
                        <strong class="small">${trt.classe}</strong>
                        ${trt.gravite ? ` <span class="badge bg-${trt.gravite === 'CONTRE-INDICATION' || String(trt.gravite).includes('ABSOLUE') ? 'danger' : 'warning text-dark'}" style="font-size:0.6em;">${trt.gravite}</span>` : ''}
                        ${srcEbm ? ` <span class="badge bg-dark float-end" style="font-size:0.6em;" title="${srcEbm}">${srcEbm.length > 40 ? srcEbm.substring(0,40)+'...' : srcEbm}</span>` : ''}
                        ${trt.ref_stopp ? ` <span class="badge bg-secondary float-end me-1" style="font-size:0.6em;">${trt.ref_stopp}</span>` : ''}
                        ${trt.raison ? `<br><small>${trt.raison}</small>` : ''}
                        ${trt.condition ? `<br><small class="text-muted fst-italic">${trt.condition}</small>` : ''}
                    </div>`;
                });
                guidelinesHtml += `<details class="mb-2 mt-2"><summary class="text-danger small fw-bold" style="cursor:pointer;">A EVITER (${eviter.length}) — cliquer pour dérouler</summary><div class="mt-1">${eviterItems}</div></details>`;
            }

            // DEPRESCRIPTION (soins palliatifs, fragilité)
            const deprescription = rule.TRAITEMENTS.DEPRESCRIPTION;
            if (deprescription) {
                if (deprescription.a_arreter_systematiquement) {
                    guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-warning small">DEPRESCRIPTION</strong></div>`;
                    deprescription.a_arreter_systematiquement.forEach(d => {
                        guidelinesHtml += `<div class="alert alert-warning py-1 px-2 mb-1" style="border-left:3px solid #ffc107;">
                            <strong class="small">${d.classe || ''}</strong>${d.raison ? `<br><small>${d.raison}</small>` : ''}
                        </div>`;
                    });
                }
                if (deprescription.a_conserver) {
                    guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-success small">A CONSERVER</strong></div>`;
                    deprescription.a_conserver.forEach(d => {
                        guidelinesHtml += `<div class="alert alert-success py-1 px-2 mb-1" style="border-left:3px solid #198754;">
                            <strong class="small">${d.classe || ''}</strong>${d.indication ? `<br><small>${d.indication}</small>` : ''}
                        </div>`;
                    });
                }
            }

            // DEPRESCRIPTION_CIBLES (fragilité)
            const depCibles = rule.TRAITEMENTS.DEPRESCRIPTION_CIBLES;
            if (depCibles) {
                guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-warning small">CIBLES DE DEPRESCRIPTION</strong></div>`;
                depCibles.forEach(d => {
                    guidelinesHtml += `<div class="alert alert-warning py-1 px-2 mb-1" style="border-left:3px solid #ffc107;">
                        <strong class="small">${d.classe || ''}</strong>
                        ${d.ref ? ` <span class="badge bg-secondary float-end" style="font-size:0.6em;">${d.ref}</span>` : ''}
                        ${d.action ? `<br><small>${d.action}</small>` : ''}
                    </div>`;
                });
            }

            // CIBLES HbA1c (diabète)
            const cibles = rule.TRAITEMENTS.CIBLES_HBA1C;
            if (cibles) {
                guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-info small">CIBLES HbA1c INDIVIDUALISEES</strong>
                    ${cibles.ref ? ` <span class="badge bg-dark" style="font-size:0.6em;">${cibles.ref}</span>` : ''}</div>`;
                ['general', 'sujet_age_robuste', 'sujet_age_fragile', 'fin_de_vie'].forEach(k => {
                    if (cibles[k]) {
                        guidelinesHtml += `<div class="small ps-2 mb-1">${cibles[k].max ? `<strong>HbA1c ≤ ${cibles[k].max}%</strong> — ` : ''}${cibles[k].note || ''}</div>`;
                    }
                });
            }

            // INTERACTIONS CRITIQUES
            const interCrit = rule.INTERACTIONS_CRITIQUES;
            if (interCrit && interCrit.length > 0) {
                guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-danger small">INTERACTIONS CRITIQUES SPECIFIQUES</strong></div>`;
                interCrit.forEach(ic => {
                    guidelinesHtml += `<div class="alert alert-danger py-1 px-2 mb-1 bg-danger bg-opacity-10" style="border-left:3px solid #dc3545;">
                        <strong class="small">${ic.combinaison ? ic.combinaison.join(' + ') : ''}</strong>
                        ${ic.gravite ? ` <span class="badge bg-danger" style="font-size:0.6em;">${ic.gravite}</span>` : ''}
                        ${ic.risque ? `<br><small class="text-danger">${ic.risque}</small>` : ''}
                        ${ic.conduite ? `<br><small>${ic.conduite}</small>` : ''}
                        ${ic.surveillance ? `<br><small class="text-info">${ic.surveillance}</small>` : ''}
                    </div>`;
                });
            }

            guidelinesHtml += `</div></div>`;
        });

        if (guidelinesHtml) {
            divGuidelines.innerHTML = guidelinesHtml;
        } else {
            divGuidelines.innerHTML = '<div class="alert alert-light">Aucune guideline spécifique pour les pathologies sélectionnées.</div>';
        }
    } else if (divGuidelines) {
        divGuidelines.innerHTML = activeComorbs.length === 0
            ? '<div class="alert alert-light">Ajoutez des comorbidités pour voir les recommandations des sociétés savantes.</div>'
            : '<div class="alert alert-light">Données PATHOLOGY_RULES_DB non disponibles.</div>';
    }

    let btnPdf = document.getElementById('btnPdf'); if(btnPdf) btnPdf.style.display = 'inline-block';
    let btnCopier = document.getElementById('btnCopier'); if(btnCopier) btnCopier.style.display = 'inline-block';
}
