// app_analysis.js - V10.0 (v0.48 — synthèse intelligente, bio unifiée, registre structuré)

// =========================================================
// SCORES_CONFIG — Seuils externalisés (modifiable sans toucher la logique)
// =========================================================
const SCORES_CONFIG = {
    CHA2DS2: {
        label: 'CHA₂DS₂-VASc', desc: 'Risque thromboembolique dans la FA', border: 'info',
        seuils: { haut: 2 },
        conclusions: { 0: 'Risque faible — anticoagulation non indiquée', 1: 'Risque intermédiaire — anticoagulation optionnelle', haut: 'Anticoagulation recommandée (sauf CI)' }
    },
    HAS_BLED: {
        label: 'HAS-BLED', desc: 'Risque hémorragique sous anticoagulant', border: 'danger',
        seuils: { modere: 1, haut: 3 },
        conclusions: { 0: 'Risque faible', modere: 'Risque modéré — réévaluer bénéfice/risque', haut: 'Risque hémorragique élevé — prudence avec anticoagulant' }
    },
    ORBIT: {
        label: 'ORBIT-AF', desc: 'Risque de saignement sous AOD', border: 'warning',
        seuils: { modere: 3, haut: 4 },
        conclusions: { 0: 'Risque faible (2.4%/an)', modere: 'Risque modéré (4.7%/an)', haut: 'Risque hémorragique élevé (7.3%/an)' }
    },
    RISQ_PATH: {
        label: 'RISQ-PATH', desc: 'Risque d\'allongement du QT', border: 'primary',
        seuils: { modere: 5, haut: 10 },
        conclusions: { 0: 'Risque modéré', modere: 'Risque élevé — prudence avec QTc-allongeants', haut: 'Risque très élevé de TdP' }
    },
    TISDALE: {
        label: 'Score de Tisdale', desc: 'Risque de TdP en hospitalisation', border: 'dark',
        seuils: { modere: 7, haut: 11 },
        conclusions: { 0: 'Risque faible', modere: 'Risque modéré — ECG quotidien recommandé', haut: 'Risque élevé de TdP — monitoring ECG continu' }
    },
    // Seuils biologiques pour les scores
    BIO: {
        anemia_M: 13, anemia_F: 12,   // g/dL
        hypoK: 3.5,                     // mmol/L
        hypoCa: 2.15,                   // mmol/L
        irc_has: 50, irc_orbit: 60, irc_severe: 30, // ml/min DFG
        qtc_prolonge: 450               // ms
    },
    AGE: {
        cha_75: 75, cha_65: 65,
        has_65: 65,
        orbit_75: 75,
        risq_65: 65,
        tisdale_68: 68
    }
};

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
        // Cache parseFloat dans db_ref pour éviter recalculs
        if (ref._acb === undefined) { ref._acb = parseFloat(ref.acb) || 0; ref._cia = parseFloat(ref.cia) || 0; }
        if (ref._acb > 0) scoreACB_global += ref._acb;
        if (ref._cia > 0) scoreCIA_global += ref._cia;
        let qt = String(ref.qt_risque || "");
        if (qt.includes("(KR)")) { maxQTLevel_global = Math.max(maxQTLevel_global, 2); infoQT_global.push(m.dci); globalQT_CountKR++; }
        else if (qt.includes("(PR)") || qt.includes("(CR)")) { maxQTLevel_global = Math.max(maxQTLevel_global, 1); infoQT_global.push(m.dci); globalQT_CountCR_PR++; }
    });
}

// =========================================================
// SOUS-FONCTIONS EXTRAITES DE analyserPrescription()
// =========================================================

/** Initialise le moteur V2 une seule fois */
function _initEngine() {
    if (typeof applyFullIntegration === 'function' && !window.engineInitialized) {
        applyFullIntegration();
        if (typeof GeriaEngineV2 !== 'undefined') {
            GeriaEngineV2.buildIndex();
            window.engineInitialized = true;
            console.log("🚀 Moteur GeriaEngineV2 initialisé et indexé.");
        }
    }
}

/** Construit le contexte patient (bioValues, comorbidités, checkboxes) */
function _buildPatientContext(patientAge, sexe, isFragile) {
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

    // Auto-injection des PAT codes depuis les checkboxes cliniques
    const checkboxPatMap = {
        'chkAvc': 'PAT_008', 'chkAtcdUlcere': 'PAT_021', 'chkDialyse': 'PAT_029',
        'chkPalliatif': 'PAT_030', 'chkDepression': 'PAT_032', 'chkGlaucome': 'PAT_033',
        'chkFoie': 'PAT_034', 'chkBrady': 'PAT_035', 'chkTvp': 'PAT_036',
        'chkStent': 'PAT_004', 'chkScaAigu': 'PAT_004', 'chkHtaNonControlee': 'PAT_005'
    };
    for (const [chkId, patCode] of Object.entries(checkboxPatMap)) {
        if (isChecked(chkId) && !activeComorbs.includes(patCode)) {
            if (typeof MASTER_DB !== 'undefined' && MASTER_DB.PATHOLOGIES && MASTER_DB.PATHOLOGIES[patCode]) {
                activeComorbs.push(patCode);
            }
        }
    }
    if (isFragile && !activeComorbs.includes('PAT_031') && typeof MASTER_DB !== 'undefined' && MASTER_DB.PATHOLOGIES && MASTER_DB.PATHOLOGIES['PAT_031']) {
        activeComorbs.push('PAT_031');
    }

    // Contexte clinique
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
    if(isChecked('chkFoie')) ctxClinique.push("hepatopathie");
    if(isChecked('chkTvp')) ctxClinique.push("mtev");
    if(isChecked('chkAvc')) ctxClinique.push("avc");
    if(isChecked('chkDialyse')) ctxClinique.push("hemodialyse");
    if(isChecked('chkStent') || isChecked('chkScaAigu')) ctxClinique.push("coronarien_aigu");
    if(isChecked('chkHtaNonControlee')) ctxClinique.push("hta_non_controlee");
    if(isChecked('chkAlcool')) ctxClinique.push("alcool");
    if(isChecked('chkTabac')) ctxClinique.push("tabac");
    if(isChecked('chkSepsis')) ctxClinique.push("sepsis");
    if(isChecked('chkArret')) ctxClinique.push("arret_cardiaque");
    if(isChecked('chkLqts')) ctxClinique.push("qt_long_congenital");

    return { bioValues, ctxClinique };
}

function analyserPrescription() {
    if (typeof MASTER_DB === 'undefined') return;
    _initEngine();

    preCalculerScores();
    const patientAge = getVal('patientAge'); const sexe = getStr('patientSexe'); const isFragile = isChecked('patientFragile') || getVal('scoreCFS') >= 7;
    // Validation entrées critiques
    if (patientAge <= 0 || patientAge > 120) {
        let el = document.getElementById('alertes-scores');
        if(el) el.innerHTML = '<div class="alert alert-danger">Veuillez saisir un âge valide (18-120 ans) avant de lancer l\'analyse.</div>';
        return;
    }

    const { bioValues, ctxClinique } = _buildPatientContext(patientAge, sexe, isFragile);

    const divs = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact', 'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi', 'alertes-guidelines', 'alertes-synthese'];
    divs.forEach(id => { let el = document.getElementById(id); if(el) el.innerHTML = ''; });
    let counts = { eviter: 0, initier: 0, interact: 0, ansm: 0, auc: 0, bio: 0, usage: 0, suivi: 0 };

    // ── Registre structuré d'alertes (pour synthèse transversale) ──
    const _registry = { byMed: {}, byDomain: {}, actions: [] };
    const _regAddMed = (dci, domain, entry) => {
        const k = (dci || '').toLowerCase();
        if (!k) return;
        if (!_registry.byMed[k]) _registry.byMed[k] = {};
        if (!_registry.byMed[k][domain]) _registry.byMed[k][domain] = [];
        _registry.byMed[k][domain].push(entry);
    };
    const _regAddDomain = (domain, entry) => {
        if (!_registry.byDomain[domain]) _registry.byDomain[domain] = [];
        _registry.byDomain[domain].push(entry);
    };

    // Batch DOM: accumulate HTML, flush once at end
    const _htmlBuffers = {};
    divs.forEach(id => _htmlBuffers[id] = []);
    const addAlert = (targetId, htmlStr, countKey) => {
        if(!htmlStr) return;
        if(_htmlBuffers[targetId]) _htmlBuffers[targetId].push(htmlStr);
        else { let el = document.getElementById(targetId); if(el) el.innerHTML += htmlStr; }
        if(countKey) counts[countKey]++;
    };
    const flushAlerts = () => {
        for(const [id, parts] of Object.entries(_htmlBuffers)) {
            if(parts.length === 0) continue;
            let el = document.getElementById(id);
            if(el) el.innerHTML += parts.join('');
        }
    };

    // =========================================================
    // 1. 🚀 BRANCHEMENT AU NOUVEAU MOTEUR EXPERT (GERIA ENGINE V2)
    // =========================================================
    let divScores = document.getElementById('alertes-scores');

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
        if (recos) {
            // Affichage du Dashboard Global
            if (divScores && recos.dashboard) addAlert('alertes-scores', GeriaEngineV2.renderDashboard(recos.dashboard));

            // Affichage des Recommandations (Triées et Sourcées)
            const eviterHtml = recos.eviter ? GeriaEngineV2.renderAlertesTriees(recos.eviter, 'eviter') : '';
            const initierHtml = recos.initier ? GeriaEngineV2.renderAlertesTriees(recos.initier, 'initier') : '';
            document.getElementById('alertes-eviter').innerHTML = eviterHtml;
            document.getElementById('alertes-initier').innerHTML = initierHtml;

            counts.eviter = recos.eviter ? recos.eviter.length : 0;
            counts.initier = recos.initier ? recos.initier.length : 0;
            // Registre: éviter/initier depuis le moteur V2
            if (recos.eviter) recos.eviter.forEach(a => {
                (a.med_keys || []).forEach(k => _regAddMed(k, 'eviter', { text: a.titre || a.message || '', severity: a.severite || 'warning', source: a.sources_label || '' }));
                _regAddDomain('eviter', { titre: a.titre || '', meds: a.med_keys || [], severity: a.severite || 'warning' });
            });
            if (recos.initier) recos.initier.forEach(a => {
                _regAddDomain('initier', { titre: a.titre || '', meds: a.med_absent || [], severity: 'info' });
            });
        } else {
            addAlert('alertes-scores', `<div class="alert alert-warning">Le moteur d'évaluation n'a retourné aucun résultat.</div>`);
        }
    } else {
        addAlert('alertes-scores', `<div class="alert alert-danger">⚠️ Le moteur GeriaEngineV2 est introuvable. Avez-vous actualisé la page ?</div>`);
    }

    // =========================================================
    // 2. SCORES CLINIQUES (Risq-Path, Tisdale, CHA2DS2, etc.)
    // =========================================================
    if(divScores) {
        const SC = SCORES_CONFIG; const SB = SC.BIO; const SA = SC.AGE;

        // Helper rendu score (avec tooltip explicatif)
        const SCORE_TOOLTIPS = {
            CHA2DS2: 'IC +1 | HTA +1 | Âge≥75 +2 | Diabète +1 | AVC/AIT +2 | Vasculaire +1 | Femme +1 | Âge 65-74 +1. Source: ESC 2020.',
            HAS_BLED: 'HTA +1 | IRC (DFG<50) +1 | AVC +1 | Saignement +1 | INR labile +1 | Âge>65 +1 | Alcool +1 | Méd. antiagrég/AINS +1. Source: Pisters 2010.',
            ORBIT: 'Âge≥75 +1 | Anémie +2 | Saignement +2 | DFG<60 +1 | Antiagrégant +1. Source: O\'Brien 2015.',
            RISQ_PATH: 'Âge≥65 +1 | Femme +1 | Obésité +1 | HypoK +2 | HypoCa +2 | IRC sévère +2 | Inflammation +1 | Cardiopathie +1 | FA +1 | Démence +1 | Méd QT(KR) +3. Source: Tisdale 2013 adapté.',
            TISDALE: 'Âge≥68 +1 | Femme +1 | Diurétique +1 | HypoK +2 | QTc≥450 +2 | Méd QT +3 | Sepsis +2 | IC +3. Source: Tisdale 2013.'
        };
        const renderScore = (cfg, score, details) => {
            let conc = cfg.conclusions[0];
            let dangerClass = 'success';
            if (cfg.seuils.haut && score >= cfg.seuils.haut) { conc = cfg.conclusions.haut; dangerClass = 'danger'; }
            else if (cfg.seuils.modere && score >= cfg.seuils.modere) { conc = cfg.conclusions.modere; dangerClass = 'muted'; }
            const tipKey = Object.keys(SCORES_CONFIG).find(k => SCORES_CONFIG[k] === cfg) || '';
            const tipText = SCORE_TOOLTIPS[tipKey] || '';
            const tooltip = tipText ? ` <span class="score-tooltip" tabindex="0"><span class="badge bg-light text-dark border" style="font-size:0.6em; cursor:help;">?</span><span class="score-tip-text">${escapeHtml(tipText)}</span></span>` : '';
            addAlert('alertes-scores', `<div class="alert alert-light border border-${cfg.border} mb-2 shadow-sm"><strong class="text-${cfg.border}">${cfg.label} : ${score} point(s)</strong>${tooltip} <em class="text-muted small">— ${cfg.desc}</em><br><small class="text-muted">${details.join(', ') || 'Aucun'}</small><br><small class="fw-bold text-${dangerClass}">${conc}</small></div>`);
        };

        // CHA₂DS₂-VASc
        let scoreCha = 0; let ttCha = [];
        if(patientAge >= SA.cha_75) { scoreCha += 2; ttCha.push("Âge ≥75 (+2)"); } else if(patientAge >= SA.cha_65) { scoreCha += 1; ttCha.push("Âge ≥65 (+1)"); }
        if(sexe === 'F') { scoreCha += 1; ttCha.push("Femme (+1)"); }
        if(activeComorbs.some(c=>['PAT_001','PAT_002','PAT_003'].includes(c))) { scoreCha += 1; ttCha.push("IC (+1)"); }
        if(activeComorbs.includes('PAT_005')) { scoreCha += 1; ttCha.push("HTA (+1)"); }
        if(activeComorbs.includes('PAT_016')) { scoreCha += 1; ttCha.push("Diabète (+1)"); }
        if(activeComorbs.includes('PAT_008')) { scoreCha += 2; ttCha.push("ATCD AVC (+2)"); }
        if(activeComorbs.some(c=>['PAT_004','PAT_007'].includes(c))) { scoreCha += 1; ttCha.push("Vasc (+1)"); }
        let chaConc = scoreCha === 0 ? SC.CHA2DS2.conclusions[0] : (scoreCha === 1 ? (sexe === 'M' ? 'Risque faible (H) — anticoagulation optionnelle' : 'Score lié au sexe seul — anticoagulation non indiquée (F)') : SC.CHA2DS2.conclusions.haut);
        addAlert('alertes-scores', `<div class="alert alert-light border border-${SC.CHA2DS2.border} mb-2 shadow-sm"><strong class="text-${SC.CHA2DS2.border}">${SC.CHA2DS2.label} : ${scoreCha} point(s)</strong> <em class="text-muted small">— ${SC.CHA2DS2.desc}</em><br><small class="text-muted">${ttCha.join(', ') || 'Aucun'}</small><br><small class="fw-bold text-${scoreCha >= SC.CHA2DS2.seuils.haut ? 'danger' : 'success'}">${chaConc}</small></div>`);

        // HAS-BLED
        let scoreHas = 0; let ttHas = [];
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < SB.irc_has) { scoreHas += 1; ttHas.push("IRC (+1)"); }
        if(activeComorbs.includes('PAT_008')) { scoreHas += 1; ttHas.push("ATCD AVC (+1)"); }
        if(patientAge > SA.has_65) { scoreHas += 1; ttHas.push("Âge >65 (+1)"); }
        if(patientHasMedClass('ains') || patientHasMedClass('antiagreg')) { scoreHas += 1; ttHas.push("AINS/AAS (+1)"); }
        renderScore(SC.HAS_BLED, scoreHas, ttHas);

        // ORBIT-AF
        let scoreOrbit = 0; let ttOrbit = [];
        if(patientAge >= SA.orbit_75) { scoreOrbit += 1; ttOrbit.push("Âge ≥75 (+1)"); }
        if(bioValues['BIO_009'] > 0 && ((sexe === 'M' && bioValues['BIO_009'] < SB.anemia_M) || (sexe === 'F' && bioValues['BIO_009'] < SB.anemia_F))) { scoreOrbit += 2; ttOrbit.push("Anémie (+2)"); }
        if(isChecked('chkSaignement') || isChecked('chkAspirineForte')) { scoreOrbit += 2; ttOrbit.push("Saignement (+2)"); }
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < SB.irc_orbit) { scoreOrbit += 1; ttOrbit.push("DFG <60 (+1)"); }
        if(patientHasMedClass('antiagreg')) { scoreOrbit += 1; ttOrbit.push("Antiagrégant (+1)"); }
        renderScore(SC.ORBIT, scoreOrbit, ttOrbit);

        // RISQ-PATH
        let scoreRisq = 0; let ttRisq = [];
        if(patientAge >= SA.risq_65) { scoreRisq += 1; ttRisq.push("Âge ≥65 (+1)"); }
        if(sexe === 'F') { scoreRisq += 1; ttRisq.push("Femme (+1)"); }
        if(getVal('patientBmi') >= 30) { scoreRisq += 1; ttRisq.push("Obésité (+1)"); }
        if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] <= SB.hypoK) { scoreRisq += 2; ttRisq.push("HypoK (+2)"); }
        if(bioValues['BIO_005'] > 0 && bioValues['BIO_005'] < SB.hypoCa) { scoreRisq += 2; ttRisq.push("HypoCa (+2)"); }
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] <= SB.irc_severe) { scoreRisq += 2; ttRisq.push("IRC Sévère (+2)"); }
        if(bioValues['BIO_024'] > 5) { scoreRisq += 1; ttRisq.push("Inflammation (+1)"); }
        if(['PAT_005','PAT_001','PAT_002','PAT_003'].some(c=>activeComorbs.includes(c))) { scoreRisq += 1; ttRisq.push("HTA/IC (+1)"); }
        if(activeComorbs.includes('PAT_006')) { scoreRisq += 1; ttRisq.push("FA (+1)"); }
        if(['PAT_010','PAT_011','PAT_012','PAT_013','PAT_014'].some(c=>activeComorbs.includes(c))) { scoreRisq += 1; ttRisq.push("Démence/Park (+1)"); }
        if(globalQT_CountKR > 0) { scoreRisq += (3 * globalQT_CountKR); ttRisq.push(`Médoc QT (+${3*globalQT_CountKR})`); }
        renderScore(SC.RISQ_PATH, scoreRisq, ttRisq);

        // Tisdale
        let scoreTisdale = 0; let ttTisdale = [];
        if(patientAge >= SA.tisdale_68) { scoreTisdale += 1; ttTisdale.push("Âge ≥68 (+1)"); }
        if(sexe === 'F') { scoreTisdale += 1; ttTisdale.push("Femme (+1)"); }
        if(patientHasMedClass('diuretique')) { scoreTisdale += 1; ttTisdale.push("Diurétique (+1)"); }
        if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] <= SB.hypoK) { scoreTisdale += 2; ttTisdale.push("HypoK (+2)"); }
        if(bioValues['BIO_031'] >= SB.qtc_prolonge) { scoreTisdale += 2; ttTisdale.push("QTc ≥450 (+2)"); }
        if(globalQT_CountKR > 0) { scoreTisdale += 3; ttTisdale.push("Médoc QT (+3)"); }
        renderScore(SC.TISDALE, scoreTisdale, ttTisdale);

        // Charge Anticholinergique (ACB + CIA) avec distinction BHE
        let acbClass = scoreACB_global >= 3 ? 'danger' : (scoreACB_global >= 1 ? 'warning' : 'success');
        let acbInterp = scoreACB_global >= 3 ? 'Risque cognitif élevé — confusion, chutes, démence' : (scoreACB_global >= 1 ? 'Charge modérée, surveiller' : 'Charge faible');
        let ciaInterp = scoreCIA_global >= 3 ? 'Risque sédatif élevé — chutes, somnolence' : (scoreCIA_global >= 1 ? 'Charge modérée' : 'Charge faible');
        // Classer les médicaments ACB par passage de la BHE
        let acbCentral = []; let acbPeripheral = []; let acbUnknown = [];
        activeMeds.filter(m => m.db_ref && parseFloat(m.db_ref.acb) > 0).forEach(m => {
            let bhe = String(m.db_ref.bhe || '').trim();
            let bheVal = parseFloat(bhe);
            let label = `${escapeHtml(m.dci)} (ACB ${m.db_ref.acb})`;
            if (bheVal >= 1 || bhe.includes('1')) acbCentral.push(label);
            else if (bhe === '0' || bhe === '0.0' || bhe.includes('ne traverse pas')) acbPeripheral.push(label);
            else acbUnknown.push(label);
        });
        let ciaMeds = activeMeds.filter(m => m.db_ref && parseFloat(m.db_ref.cia) > 0).map(m => `${escapeHtml(m.dci)} (CIA ${m.db_ref.cia})`);
        let bheHtml = '';
        if (acbCentral.length > 0) bheHtml += `<br><span class="text-danger small">🧠 <em>Traverse la BHE (effets centraux) :</em> <b>${acbCentral.join(', ')}</b></span>`;
        if (acbPeripheral.length > 0) bheHtml += `<br><span class="text-success small">🛡️ <em>Ne traverse pas la BHE (effets périphériques) :</em> ${acbPeripheral.join(', ')}</span>`;
        if (acbUnknown.length > 0) bheHtml += `<br><span class="text-muted small"><em>BHE non documentée :</em> ${acbUnknown.join(', ')}</span>`;
        addAlert('alertes-scores', `<div class="alert alert-light border border-${acbClass} mb-2 shadow-sm">
            <strong class="text-${acbClass}">Score ACB : ${scoreACB_global}</strong> <em class="text-muted small">— Charge anticholinergique cumulée</em><br>
            <small class="text-muted">${acbInterp}</small>${bheHtml}<br>
            <strong class="text-${scoreCIA_global >= 3 ? 'danger' : (scoreCIA_global >= 1 ? 'warning' : 'success')}">Score CIA : ${scoreCIA_global}</strong> <em class="text-muted small">— Charge sédative/cognitive cumulée</em><br>
            <small class="text-muted">${ciaInterp}${ciaMeds.length > 0 ? ' — ' + ciaMeds.join(', ') : ''}</small>
        </div>`);

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
            }).map(m => escapeHtml(m.dci.toUpperCase()));
            let hepatoAlert = hepatoMeds.length > 0 ? `<br><span class="text-danger small fw-bold">Médicaments à forte liaison albumine (risque surdosage) : ${hepatoMeds.join(', ')}</span>` : '';

            // Score Child-Pugh dans l'onglet Scores (sans adaptations médicamenteuses)
            addAlert('alertes-scores', `<div class="alert alert-light border border-${cpColor} mb-2 shadow-sm">
                <strong class="text-${cpColor}">Child-Pugh : Classe ${cpClass}</strong> <small class="text-muted">${cpSource}</small>
                <em class="text-muted small"> — Sévérité de l'insuffisance hépatique</em><br>
                <small class="fw-bold text-${cpColor}">${cpConc}</small>
                ${hepatoAlert}
            </div>`);

            // ---- Adaptations posologiques hépatiques → Onglet Doses ----
            if (typeof CHILD_PUGH_ADAPTATIONS !== 'undefined') {
                let drugAlertList = [];
                activeMeds.forEach(m => {
                    let key = m.dci.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                    let adapt = CHILD_PUGH_ADAPTATIONS[key];
                    if (!adapt) {
                        for (let k of Object.keys(CHILD_PUGH_ADAPTATIONS)) {
                            if (key.includes(k) || k.includes(key)) { adapt = CHILD_PUGH_ADAPTATIONS[k]; break; }
                        }
                    }
                    if (adapt) {
                        let info = adapt[cpClass];
                        if (info) {
                            let alertColor = info.ci ? 'danger' : (info.reduire ? 'warning' : 'info');
                            let icon = info.ci ? '🛑 CI' : (info.reduire ? '⚠️ Adapter' : 'ℹ️');
                            drugAlertList.push(`<span class="badge bg-${alertColor} me-1">${icon} ${escapeHtml(m.dci.toUpperCase())}</span> <small>${escapeHtml(info.msg)}</small>`);
                        }
                    }
                });
                if (drugAlertList.length > 0) {
                    addAlert('alertes-usage', `<div class="alert alert-light border border-${cpColor} shadow-sm">
                        <strong class="text-${cpColor}">🫁 Adaptations hépatiques — Child-Pugh ${cpClass}</strong>
                        <span class="badge bg-secondary float-end" style="font-size:0.65em;">Child-Pugh</span>
                        <br>${drugAlertList.join('<br>')}
                    </div>`, 'usage');
                }
            }
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
            let hypoTerms = MASTER_DB.SYNDROMES['SYND_013'] && MASTER_DB.SYNDROMES['SYND_013'].IMPUTABILITE_FREQ ? MASTER_DB.SYNDROMES['SYND_013'].IMPUTABILITE_FREQ.split(',').map(x=>x.trim().replace(/\s*\(.*?\)/g, '')).filter(Boolean) : [];
            hypoTerms.forEach(d => { if(patientHasMedClass(d)) thyroCauses.push(d); });
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
            let hyperTerms = MASTER_DB.SYNDROMES['SYND_012'] && MASTER_DB.SYNDROMES['SYND_012'].IMPUTABILITE_FREQ ? MASTER_DB.SYNDROMES['SYND_012'].IMPUTABILITE_FREQ.split(',').map(x=>x.trim().replace(/\s*\(.*?\)/g, '')).filter(Boolean) : [];
            hyperTerms.forEach(d => { if(patientHasMedClass(d)) thyroCauses.push(d); });
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
        let albTerms = MASTER_DB.SYNDROMES['SYND_033'] && MASTER_DB.SYNDROMES['SYND_033'].IMPUTABILITE_FREQ ? MASTER_DB.SYNDROMES['SYND_033'].IMPUTABILITE_FREQ.split(',').map(x=>x.trim().replace(/\s*\(.*?\)/g, '')).filter(Boolean) : [];
        albTerms.forEach(d => { if(patientHasMedClass(d)) albCauses.push(d); });
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
                found.push({ med: escapeHtml(m.dci.toUpperCase()), desc: escapeHtml(ref.epileptogene_desc || ref.epileptogene), niveau: niveau });
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
                    <strong>${isSevere ? '🚨' : '⚠️'} ${escapeHtml(m.dci.toUpperCase())} — CI ${escapeHtml(a.patho_nom)}</strong>
                    <span class="badge bg-secondary float-end" style="font-size:0.65em;" title="${sourceLabel}">${sourceLabel.length > 30 ? sourceLabel.substring(0, 30) + '...' : sourceLabel}</span>
                    <br><span class="small">${a.raison}${a.condition ? ` <em class="text-muted">(${a.condition})</em>` : ''}</span>
                    <br><span class="badge bg-${isSevere ? 'danger' : 'warning'} text-${isSevere ? 'white' : 'dark'}" style="font-size:0.7em;">${a.gravite}</span>
                </div>`, 'eviter');
                _regAddMed(m.dci, 'eviter', { severity: isSevere ? 'danger' : 'warning', text: `CI ${a.patho_nom} — ${a.raison}`, gravite: a.gravite, source: sourceLabel });
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
                let medNames = affected.map(m => escapeHtml(m.dci.toUpperCase())).join(', ');
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
                    addAlert('alertes-interact', `<div class="alert alert-danger shadow-sm"><strong>🚨 Co-prescription à risque : ${escapeHtml(ref.dci.toUpperCase())}</strong><br>Interaction détectée avec : <b>${found.map(f => escapeHtml(f)).join(', ')}</b></div>`, 'interact');
                    _regAddMed(m.dci, 'interact', { text: `Interaction avec ${found.join(', ')}`, severity: 'danger' });
                }
            }
        });

        let groupedAnsm = {}; let groupedAuc = {};

        // --- Pré-indexation ANSM & GPT_DDI : pour chaque med, quels entries matchent sur term1 ou term2 ---
        let ansmDb = typeof ANSM_DDI_DB !== 'undefined' ? ANSM_DDI_DB : (typeof ansm_ddi_data !== 'undefined' ? ansm_ddi_data : null);
        let ansmIndex = new Map(); // medKey -> [{idx, side:'t1'|'t2'}]
        if (ansmDb && Array.isArray(ansmDb)) {
            activeMeds.forEach(med => {
                let key = sanitizeText(med.dci);
                let hits = [];
                ansmDb.forEach((d, idx) => {
                    if (medMatchesAnsmTerm(med, d.d1 || d.molecule1 || d.nom1 || "")) hits.push({idx, side:'t1'});
                    if (medMatchesAnsmTerm(med, d.d2 || d.molecule2 || d.nom2 || "")) hits.push({idx, side:'t2'});
                });
                ansmIndex.set(key, hits);
            });
        }
        let gptDb = typeof GPT_DDI_DB !== 'undefined' && Array.isArray(GPT_DDI_DB) ? GPT_DDI_DB : null;
        let gptIndex = new Map();
        if (gptDb) {
            activeMeds.forEach(med => {
                let key = sanitizeText(med.dci);
                let hits = [];
                gptDb.forEach((d, idx) => {
                    if (medMatchesAnsmTerm(med, d.d1 || "")) hits.push({idx, side:'t1'});
                    if (medMatchesAnsmTerm(med, d.d2 || "")) hits.push({idx, side:'t2'});
                });
                gptIndex.set(key, hits);
            });
        }

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

                // ANSM — utilise l'index pré-calculé
                if (ansmDb) {
                    let hitsA = ansmIndex.get(dciA) || [];
                    let hitsB = ansmIndex.get(dciB) || [];
                    // Pour chaque entry ANSM, vérifier si A match un côté et B match l'autre
                    let bByIdx = new Map();
                    hitsB.forEach(h => { if(!bByIdx.has(h.idx)) bByIdx.set(h.idx, new Set()); bByIdx.get(h.idx).add(h.side); });
                    hitsA.forEach(hA => {
                        let bSides = bByIdx.get(hA.idx);
                        if (!bSides) return;
                        // A matche t1 et B matche t2, ou A matche t2 et B matche t1
                        let crossMatch = (hA.side === 't1' && bSides.has('t2')) || (hA.side === 't2' && bSides.has('t1'));
                        if (!crossMatch) return;
                        let d = ansmDb[hA.idx];
                        let niveau = String(d.level || d.niveau || "Interaction").toUpperCase();
                        let desc = String(d.desc || d.description || d.message || "");
                        if(!groupedAnsm[pairName]) groupedAnsm[pairName] = { isDanger: false, raw: [] };
                        let isDanger = niveau.includes("CONTRE-INDICATION") || niveau.includes("DECONSEILLE") || niveau.includes("MAJEUR");
                        if(isDanger) groupedAnsm[pairName].isDanger = true;
                        if(!groupedAnsm[pairName].raw.some(ex => ex.source === 'ANSM' && ex.level === niveau && ex.desc.toLowerCase() === desc.toLowerCase())) {
                            groupedAnsm[pairName].raw.push({ level: niveau, desc: desc, isDanger: isDanger, source: 'ANSM' });
                        }
                    });
                }

                // GPT_DDI_DB (BNF + Micromedex) — utilise l'index pré-calculé
                if (gptDb) {
                    let hitsA = gptIndex.get(dciA) || [];
                    let hitsB = gptIndex.get(dciB) || [];
                    let bByIdx = new Map();
                    hitsB.forEach(h => { if(!bByIdx.has(h.idx)) bByIdx.set(h.idx, new Set()); bByIdx.get(h.idx).add(h.side); });
                    hitsA.forEach(hA => {
                        let bSides = bByIdx.get(hA.idx);
                        if (!bSides) return;
                        let crossMatch = (hA.side === 't1' && bSides.has('t2')) || (hA.side === 't2' && bSides.has('t1'));
                        if (!crossMatch) return;
                        let d = gptDb[hA.idx];
                        if(!groupedAnsm[pairName]) groupedAnsm[pairName] = { isDanger: false, raw: [] };
                        let niveau = String(d.niveau || "Interaction").toUpperCase();
                        let isDanger = niveau.includes("CONTRE-INDICATION") || niveau.includes("MAJEUR");
                        if(isDanger) groupedAnsm[pairName].isDanger = true;
                        let desc = `${d.event || ''} — ${d.source || 'BNF+Micromedex'}`;
                        if(!groupedAnsm[pairName].raw.some(ex => ex.desc.toLowerCase() === desc.toLowerCase())) {
                            groupedAnsm[pairName].raw.push({ level: niveau, desc: desc, isDanger: isDanger, source: d.source || 'BNF+Micromedex' });
                        }
                    });
                }
            }
        }

        for (const [pair, data] of Object.entries(groupedAuc)) {
            let uniqueItems = []; data.items.forEach(item => { if(!uniqueItems.some(u => parseFloat(u.auc_ratio) === parseFloat(item.auc_ratio))) uniqueItems.push(item); });
            let detailsHtml = uniqueItems.map(m => {
                let ratio = parseFloat(m.auc_ratio); let txtRatio = ratio < 1 ? `x${ratio} (Baisse)` : `x${ratio} (Hausse)`;
                let src = m.source || m.note || m.ref || '';
                let srcBadge = src ? ` <span class="badge bg-info" style="font-size:0.6em;">${escapeHtml(String(src))}</span>` : '';
                return `<li style="margin-bottom:6px;"><span class="fw-bold">${(ratio >= 3 || ratio <= 0.3) ? '🔴' : '🟠'} Ratio ${txtRatio}</span>${srcBadge}<br><em class="text-muted small">${m.mechanism}</em></li>`;
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
            let html = `<div class="alert alert-success border border-success shadow-sm"><strong class="text-success">💊 Posologies : ${escapeHtml(ref.dci.toUpperCase())}</strong><br>`;
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
            // Registre: adaptation posologique
            let usageDetails = [];
            if (ref.poso_ger) usageDetails.push('Dose gériatrique');
            if (ref.poso_ren && dfg > 0 && dfg < 60) usageDetails.push('Adaptation rénale');
            if (alb >= 85) usageDetails.push('Forte liaison albumine');
            if (usageDetails.length) _regAddMed(m.dci, 'usage', { text: usageDetails.join(', '), severity: 'info' });
        }

        // Collecter bio_cible pour suivi unifié (per-drug)
        if (Array.isArray(ref.bio_cible)) {
            ref.bio_cible.forEach(bioId => {
                if (!_registry._bioPlan) _registry._bioPlan = {};
                if (!_registry._bioPlan[bioId]) _registry._bioPlan[bioId] = { meds: [], pathos: [], freqs: [], sources: [] };
                _registry._bioPlan[bioId].meds.push(ref.dci);
            });
        }
        // Alertes cliniques (suivi) per med — on les garde dans le registre
        if (ref.suivi_initial || ref.suivi_periodique || ref.alerte_clinique) {
            _regAddMed(m.dci, 'suivi', {
                initial: ref.suivi_initial || '',
                periodique: ref.suivi_periodique || '',
                alerte: ref.alerte_clinique || ''
            });
        }
    });

    // =========================================================
    // 5b. TABLE DE SUIVI BIOLOGIQUE UNIFIÉE (dédup multi-sources)
    // =========================================================
    {
        // Initialiser le plan bio unifié
        const bioPlan = _registry._bioPlan || {};

        // Source 2: PATHO_BIO_MONITOR (via getRequiredBioMonitoring)
        if (typeof getRequiredBioMonitoring === 'function' && activeComorbs.length > 0) {
            try {
                const bioMonitors = getRequiredBioMonitoring(activeComorbs);
                for (const [bioId, data] of Object.entries(bioMonitors)) {
                    if (!bioPlan[bioId]) bioPlan[bioId] = { meds: [], pathos: [], freqs: [], sources: [] };
                    data.pathos.forEach((p, i) => {
                        let patName = MASTER_DB.PATHOLOGIES[p]?.NOM_STANDARD || p;
                        if (!bioPlan[bioId].pathos.includes(patName)) bioPlan[bioId].pathos.push(patName);
                        let freq = data.frequences[i] || data.frequences[0] || '';
                        if (freq && !bioPlan[bioId].freqs.includes(freq)) bioPlan[bioId].freqs.push(freq);
                        let src = data.sources[i] || data.sources[0] || '';
                        if (src && !bioPlan[bioId].sources.includes(src)) bioPlan[bioId].sources.push(src);
                    });
                }
            } catch(e) { console.error("Erreur BioMonitor:", e); }
        }

        // Source 3: SURVEILLANCE_CIBLE from PATHOLOGY_RULES_DB
        if (typeof PATHOLOGY_RULES_DB !== 'undefined') {
            activeComorbs.forEach(patId => {
                const rule = PATHOLOGY_RULES_DB[patId];
                if (!rule || !rule.BIOLOGIE || !rule.BIOLOGIE.SURVEILLANCE_CIBLE) return;
                let patName = rule.NOM || patId;
                rule.BIOLOGIE.SURVEILLANCE_CIBLE.forEach(bioId => {
                    if (!bioPlan[bioId]) bioPlan[bioId] = { meds: [], pathos: [], freqs: [], sources: [] };
                    if (!bioPlan[bioId].pathos.includes(patName)) bioPlan[bioId].pathos.push(patName);
                });
            });
        }

        // Render: table unifiée par BIO_ID
        const bioIds = Object.keys(bioPlan);
        if (bioIds.length > 0) {
            // Fréquence la plus stricte = la plus courte
            const freqPriority = { 'hebdomadaire': 1, '/semaine': 1, 'bimensuel': 2, '/2sem': 2, 'mensuel': 3, '/mois': 3, '/1m': 3, '/1-3m': 4, 'trimestriel': 5, '/3m': 5, '/3 mois': 5, 'semestriel': 7, '/6m': 7, '/6 mois': 7, 'annuel': 10, '/an': 10, '/12m': 10 };
            const getFreqScore = (f) => {
                let fl = f.toLowerCase();
                for (const [k, v] of Object.entries(freqPriority)) { if (fl.includes(k)) return v; }
                return 8; // défaut entre semestriel et annuel
            };

            let rows = bioIds.map(bioId => {
                let entry = bioPlan[bioId];
                let bioName = (typeof MASTER_DB !== 'undefined' && MASTER_DB.BIOLOGIE && MASTER_DB.BIOLOGIE[bioId]) ? MASTER_DB.BIOLOGIE[bioId].NOM_STANDARD : bioId;
                let val = bioValues[bioId];
                let valStr = val > 0 ? val : '<span class="text-muted fst-italic">—</span>';
                // Statut : simple heuristique
                let statusBadge = '';
                if (val > 0) {
                    if (bioId === 'BIO_004' && val < 30) statusBadge = '<span class="badge bg-danger">Bas</span>';
                    else if (bioId === 'BIO_004' && val < 60) statusBadge = '<span class="badge bg-warning text-dark">Abaissé</span>';
                    else if (bioId === 'BIO_001' && (val < 3.5 || val > 5.0)) statusBadge = '<span class="badge bg-danger">Anormal</span>';
                    else if (bioId === 'BIO_002' && val < 130) statusBadge = '<span class="badge bg-warning text-dark">Bas</span>';
                    else if (bioId === 'BIO_009' && val < 12) statusBadge = '<span class="badge bg-warning text-dark">Anémie</span>';
                    else if (bioId === 'BIO_031' && val >= 450) statusBadge = '<span class="badge bg-danger">Allongé</span>';
                    else statusBadge = '<span class="badge bg-success">OK</span>';
                } else {
                    statusBadge = '<span class="badge bg-secondary">Non renseigné</span>';
                }
                // Fréquence la plus stricte
                let strictFreq = '—';
                if (entry.freqs.length > 0) {
                    entry.freqs.sort((a, b) => getFreqScore(a) - getFreqScore(b));
                    strictFreq = entry.freqs[0];
                }
                // Raisons (meds + pathos combinés)
                let reasons = [...new Set([...entry.meds.map(m => m.charAt(0).toUpperCase() + m.slice(1)), ...entry.pathos])];
                let srcBadges = entry.sources.map(s => `<span class="badge bg-dark me-1" style="font-size:0.55em;">${s}</span>`).join('');
                return { bioId, html: `<tr>
                    <td class="small fw-semibold">${bioName}</td>
                    <td class="small text-center">${valStr} ${statusBadge}</td>
                    <td class="small">${strictFreq}</td>
                    <td class="small">${reasons.join(', ')} ${srcBadges}</td>
                </tr>`, freqScore: entry.freqs.length > 0 ? getFreqScore(entry.freqs[0]) : 99 };
            });
            // Trier: fréquence la plus stricte en premier
            rows.sort((a, b) => a.freqScore - b.freqScore);

            let tableHtml = `<div class="alert alert-info border-info shadow-sm py-2 px-2">
                <strong class="text-info" style="font-size:1.05em;">🧪 Plan de surveillance biologique unifié</strong>
                <span class="badge bg-info float-end">${bioIds.length} paramètres</span>
                <table class="table table-sm table-hover mb-0 mt-2" style="font-size:0.88em;">
                <thead><tr>
                    <th style="width:25%;">Paramètre</th>
                    <th style="width:20%;" class="text-center">Valeur / Statut</th>
                    <th style="width:20%;">Fréquence</th>
                    <th style="width:35%;">Raisons (méd/patho)</th>
                </tr></thead>
                <tbody>${rows.map(r => r.html).join('')}</tbody>
                </table>
            </div>`;
            addAlert('alertes-suivi', tableHtml, 'suivi');
        }

        // Alertes cliniques spécifiques per-drug (suivi_initial, suivi_periodique, alerte_clinique)
        activeMeds.forEach(m => {
            let ref = m.db_ref; if (!ref) return;
            if (ref.alerte_clinique) {
                addAlert('alertes-suivi', `<div class="alert alert-warning border-warning shadow-sm py-2 px-2">
                    <strong class="text-warning">⚠️ ${escapeHtml(ref.dci.toUpperCase())} — Alertes cliniques</strong>
                    ${formatSuiviList(ref.alerte_clinique)}
                </div>`, 'suivi');
            }
        });

        _registry.bioPlan = bioPlan;
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
                        `<li class="small text-muted">${(GUIDELINE_INDEX[k] && GUIDELINE_INDEX[k].ref) || k}</li>`
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
                    if (rule.SOURCES_EBM && rule.SOURCES_EBM.INITIER && trt.classe) {
                        for (const [k, v] of Object.entries(rule.SOURCES_EBM.INITIER)) {
                            if (trt.classe && (sanitizeText(trt.classe).includes(sanitizeText(k)) || sanitizeText(k).includes(sanitizeText(trt.classe.split('(')[0].trim())))) {
                                srcEbm = v; break;
                            }
                        }
                    }

                    // Composants (quadrithérapie IC, bithérapie HTA)
                    let composantsHtml = '';
                    if (trt.composants && Array.isArray(trt.composants) && trt.composants.length > 0) {
                        composantsHtml = `<ul class="ps-3 mb-1">${trt.composants.map(c => {
                            if (typeof c === 'string') return `<li class="small">${c}</li>`;
                            return `<li class="small">${c.classe || ''} ${c.niveau ? `<span class="badge bg-success" style="font-size:0.6em;">Niveau ${c.niveau}</span>` : ''}${c.note ? ` <em class="text-muted" style="font-size:0.85em;">${c.note}</em>` : ''}</li>`;
                        }).join('')}</ul>`;
                    }

                    if (trt.classe || trt.indication || composantsHtml) {
                    guidelinesHtml += `<div class="alert alert-success py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #198754;">
                        <strong class="small">${trt.classe || ''}</strong>
                        ${trt.niveau_preuve ? ` <span class="badge bg-success" style="font-size:0.6em;">Niveau ${trt.niveau_preuve}</span>` : ''}
                        ${srcEbm ? ` <span class="badge bg-dark float-end" style="font-size:0.6em;" title="${srcEbm}">${srcEbm.length > 40 ? srcEbm.substring(0,40)+'...' : srcEbm}</span>` : ''}
                        ${trt.dci_exemples ? `<br><small class="text-muted">DCI : ${trt.dci_exemples.join(', ')}</small>` : ''}
                        ${trt.indication ? `<br><small>${trt.indication}</small>` : (trt.posologie ? `<br><small>${trt.posologie}</small>` : '')}
                        ${trt.exception ? `<br><small class="text-muted fst-italic">${trt.exception}</small>` : ''}
                        ${composantsHtml}
                        ${trt.condition ? `<br><small class="text-muted fst-italic">Condition : ${trt.condition}</small>` : ''}
                        ${trt.note ? `<br><small class="text-info">${trt.note}</small>` : ''}
                        ${trt.contre_indication_dfg ? `<br><small class="text-danger">${trt.contre_indication_dfg}</small>` : ''}
                        ${trt.ref && !srcEbm ? ` <span class="badge bg-secondary float-end" style="font-size:0.6em;">${trt.ref}</span>` : ''}
                    </div>`;
                    }
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
                            if (trt.classe && (sanitizeText(trt.classe).includes(sanitizeText(k)) || sanitizeText(k).includes(sanitizeText(trt.classe.split('(')[0].trim())))) {
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
                            if (trt.classe && (sanitizeText(trt.classe).includes(sanitizeText(k)) || sanitizeText(k).includes(sanitizeText(trt.classe.split('(')[0].trim())))) {
                                srcEbm = v; break;
                            }
                        }
                    }
                    if (trt.classe || trt.raison) {
                    eviterItems += `<div class="alert alert-danger py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #dc3545;">
                        <strong class="small">${trt.classe || ''}</strong>
                        ${trt.gravite ? ` <span class="badge bg-${trt.gravite === 'CONTRE-INDICATION' || String(trt.gravite).includes('ABSOLUE') ? 'danger' : 'warning text-dark'}" style="font-size:0.6em;">${trt.gravite}</span>` : ''}
                        ${srcEbm ? ` <span class="badge bg-dark float-end" style="font-size:0.6em;" title="${srcEbm}">${srcEbm.length > 40 ? srcEbm.substring(0,40)+'...' : srcEbm}</span>` : ''}
                        ${trt.ref_stopp ? ` <span class="badge bg-secondary float-end me-1" style="font-size:0.6em;">${trt.ref_stopp}</span>` : ''}
                        ${trt.raison ? `<br><small>${trt.raison}</small>` : ''}
                        ${trt.condition ? `<br><small class="text-muted fst-italic">${trt.condition}</small>` : ''}
                    </div>`;
                    }
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

    // =========================================================
    // 🧠 BLOC SYNTHÈSE INTELLIGENTE
    // =========================================================
    {
        let synthHtml = '';

        // ── Indicateurs clés ──
        let critCount = counts.eviter;
        let interactCount = counts.interact + counts.ansm;
        let bioAnomalyCount = counts.bio;
        let bioMissing = 0;
        if (_registry.bioPlan) {
            Object.keys(_registry.bioPlan).forEach(bioId => { if (!bioValues[bioId] || bioValues[bioId] <= 0) bioMissing++; });
        }
        synthHtml += `<div class="row g-2 mb-3">
            <div class="col-3"><div class="card text-center border-${critCount > 0 ? 'danger' : 'success'} shadow-sm"><div class="card-body py-2">
                <div style="font-size:1.8em;font-weight:bold;" class="text-${critCount > 0 ? 'danger' : 'success'}">${critCount}</div>
                <div class="small text-muted">CI / PIM</div>
            </div></div></div>
            <div class="col-3"><div class="card text-center border-${interactCount > 0 ? 'warning' : 'success'} shadow-sm"><div class="card-body py-2">
                <div style="font-size:1.8em;font-weight:bold;" class="text-${interactCount > 0 ? 'warning' : 'success'}">${interactCount}</div>
                <div class="small text-muted">Interactions</div>
            </div></div></div>
            <div class="col-3"><div class="card text-center border-${scoreACB_global >= 3 ? 'danger' : (scoreACB_global >= 1 ? 'warning' : 'success')} shadow-sm"><div class="card-body py-2">
                <div style="font-size:1.8em;font-weight:bold;" class="text-${scoreACB_global >= 3 ? 'danger' : (scoreACB_global >= 1 ? 'warning' : 'success')}">${scoreACB_global}</div>
                <div class="small text-muted">Score ACB</div>
            </div></div></div>
            <div class="col-3"><div class="card text-center border-${bioAnomalyCount > 0 ? 'danger' : 'success'} shadow-sm"><div class="card-body py-2">
                <div style="font-size:1.8em;font-weight:bold;" class="text-${bioAnomalyCount > 0 ? 'danger' : 'success'}">${bioAnomalyCount}</div>
                <div class="small text-muted">Anomalies bio</div>
            </div></div></div>
        </div>`;

        // ── Anomalies biologiques détectées (résumé) ──
        if (bioAnomalyCount > 0) {
            synthHtml += `<div class="alert alert-danger border-danger shadow-sm py-2 mb-3">
                <strong>🧪 Anomalies biologiques détectées (${bioAnomalyCount})</strong>
                <span class="small text-muted ms-2">— Détails dans l'onglet Bio</span>
            </div>`;
        }

        // ── Synthèse transversale par médicament ──
        const medKeys = Object.keys(_registry.byMed);
        if (medKeys.length > 0) {
            synthHtml += `<div class="card shadow-sm mb-3"><div class="card-header py-2" style="background:linear-gradient(135deg,#0d6efd 0%,#0a58ca 100%);color:white;">
                <strong>📋 Vue transversale par médicament</strong>
            </div><div class="card-body p-2">`;

            const medSorted = medKeys.map(k => ({ dci: k, domains: _registry.byMed[k], count: Object.values(_registry.byMed[k]).reduce((s, arr) => s + arr.length, 0) })).sort((a, b) => b.count - a.count);

            medSorted.forEach(med => {
                let badges = [];
                const d = med.domains;
                if (d.eviter) {
                    let hasDanger = d.eviter.some(e => e.severity === 'danger' || (e.gravite && e.gravite.includes('CONTRE-INDICATION')));
                    badges.push(`<span class="badge bg-${hasDanger ? 'danger' : 'warning text-dark'} me-1">${hasDanger ? '🔴' : '🟠'} ${d.eviter.length} CI</span>`);
                }
                if (d.interact) badges.push(`<span class="badge bg-danger me-1">⚡ ${d.interact.length} interact</span>`);
                if (d.usage) badges.push(`<span class="badge bg-info me-1">💊 Adapter</span>`);
                if (d.suivi) badges.push(`<span class="badge bg-primary me-1">👁️ Suivi</span>`);

                let details = [];
                if (d.eviter) d.eviter.forEach(e => details.push(`<span class="text-${e.severity || 'warning'} small">• ${e.text}</span>`));
                if (d.interact) d.interact.forEach(e => details.push(`<span class="text-danger small">• ${e.text}</span>`));
                if (d.usage) d.usage.forEach(e => details.push(`<span class="text-info small">• ${e.text}</span>`));

                synthHtml += `<div class="border-bottom py-1">
                    <div class="d-flex align-items-center">
                        <strong class="me-2" style="min-width:120px;">${med.dci.charAt(0).toUpperCase() + med.dci.slice(1)}</strong>
                        <div>${badges.join('')}</div>
                    </div>
                    ${details.length > 0 ? `<div class="ps-3" style="line-height:1.6;">${details.join('<br>')}</div>` : ''}
                </div>`;
            });
            synthHtml += `</div></div>`;
        }

        // ── Actions concrètes priorisées (sans bio) ──
        let actions = [];
        for (const [dci, domains] of Object.entries(_registry.byMed)) {
            if (domains.eviter) {
                domains.eviter.forEach(e => {
                    if (e.gravite && (e.gravite.includes('CONTRE-INDICATION') || e.gravite.includes('ABSOLUE'))) {
                        actions.push({ priority: 1, type: 'ARRÊTER', icon: '🔴', color: 'danger', med: dci, detail: e.text });
                    } else {
                        actions.push({ priority: 2, type: 'SUBSTITUER', icon: '🟠', color: 'warning', med: dci, detail: e.text });
                    }
                });
            }
            if (domains.usage) {
                domains.usage.forEach(e => {
                    actions.push({ priority: 3, type: 'ADAPTER', icon: '🟡', color: 'info', med: dci, detail: e.text });
                });
            }
        }
        if (_registry.byDomain.initier) {
            _registry.byDomain.initier.forEach(a => {
                actions.push({ priority: 5, type: 'INITIER', icon: '🟢', color: 'success', med: a.titre, detail: '' });
            });
        }
        actions.sort((a, b) => a.priority - b.priority);

        if (actions.length > 0) {
            synthHtml += `<div class="card shadow-sm mb-3"><div class="card-header py-2" style="background:linear-gradient(135deg,#198754 0%,#0f5132 100%);color:white;">
                <strong>✅ Actions concrètes priorisées</strong>
                <span class="badge bg-light text-dark float-end">${actions.length}</span>
            </div><div class="card-body p-0">
            <table class="table table-sm table-hover mb-0" style="font-size:0.9em;">
            <tbody>`;
            actions.forEach(a => {
                synthHtml += `<tr>
                    <td style="width:30px;" class="text-center">${a.icon}</td>
                    <td style="width:90px;"><span class="badge bg-${a.color}">${a.type}</span></td>
                    <td><strong>${a.med.charAt(0).toUpperCase() + a.med.slice(1)}</strong>${a.detail ? ` <span class="text-muted small">— ${a.detail}</span>` : ''}</td>
                </tr>`;
            });
            synthHtml += `</tbody></table></div></div>`;
        }

        // ── Schéma de surveillance biologique (groupé par fréquence) ──
        if (_registry.bioPlan && Object.keys(_registry.bioPlan).length > 0) {
            const freqPriority = { 'hebdomadaire': 1, '/semaine': 1, 'bimensuel': 2, '/2sem': 2, 'mensuel': 3, '/mois': 3, '/1m': 3, '/1-3m': 4, 'trimestriel': 5, '/3m': 5, '/3 mois': 5, 'semestriel': 7, '/6m': 7, '/6 mois': 7, 'annuel': 10, '/an': 10, '/12m': 10 };
            const getFreqScore = (f) => { let fl = f.toLowerCase(); for (const [k, v] of Object.entries(freqPriority)) { if (fl.includes(k)) return v; } return 8; };
            const freqLabels = { 1: 'Hebdomadaire', 2: 'Bimensuel', 3: 'Mensuel', 4: '1 à 3 mois', 5: 'Trimestriel', 7: 'Semestriel', 8: 'Selon contexte', 10: 'Annuel', 99: 'Fréquence non précisée' };

            // Grouper par fréquence
            const byFreq = {};
            for (const [bioId, data] of Object.entries(_registry.bioPlan)) {
                let bioName = (MASTER_DB.BIOLOGIE && MASTER_DB.BIOLOGIE[bioId]) ? MASTER_DB.BIOLOGIE[bioId].NOM_STANDARD : bioId;
                let freqScore = data.freqs.length > 0 ? Math.min(...data.freqs.map(f => getFreqScore(f))) : 99;
                if (!byFreq[freqScore]) byFreq[freqScore] = [];
                byFreq[freqScore].push(bioName);
            }

            let freqKeys = Object.keys(byFreq).map(Number).sort((a, b) => a - b);
            synthHtml += `<div class="card shadow-sm mb-3"><div class="card-header py-2" style="background:linear-gradient(135deg,#6f42c1 0%,#4a1a8a 100%);color:white;">
                <strong>🗓️ Schéma de surveillance biologique</strong>
                <span class="small ms-2" style="opacity:0.8;">Détails dans l'onglet Suivi</span>
            </div><div class="card-body p-2">`;
            freqKeys.forEach(score => {
                let label = freqLabels[score] || `Fréquence ${score}`;
                let bios = byFreq[score];
                synthHtml += `<div class="mb-2">
                    <span class="badge bg-primary me-2">${label}</span>
                    <span class="small">${bios.join(', ')}</span>
                </div>`;
            });
            if (bioMissing > 0) {
                synthHtml += `<div class="mt-2 text-muted small fst-italic">⚠️ ${bioMissing} paramètre(s) non renseigné(s) — voir onglet Suivi pour le détail</div>`;
            }
            synthHtml += `</div></div>`;
        }

        if (!synthHtml) synthHtml = '<div class="alert alert-light">Lancez l\'analyse pour voir la synthèse.</div>';
        addAlert('alertes-synthese', synthHtml);
    }

    // Exposer le registre pour PDF et synthèse texte
    window._analysisRegistry = _registry;

    // Flush all accumulated HTML into DOM (single reflow)
    flushAlerts();

    ['btnPdf','btnCopier','btnCompare','btnPrint'].forEach(id => { let b = document.getElementById(id); if(b) b.style.display = id === 'btnPrint' ? 'inline-flex' : 'inline-block'; });

    // Post-analyse : compteurs onglets, sauvegarde session
    if (typeof updateTabCounters === 'function') updateTabCounters();
    if (typeof _saveSession === 'function') _saveSession();
    if (typeof GeriaLog !== 'undefined') GeriaLog.info(`Analyse terminée — ${activeMeds.length} médicaments, ${activeComorbs.length} comorbidités, ${counts.eviter} éviter, ${counts.initier} initier, ${counts.ansm} ANSM`);
}
