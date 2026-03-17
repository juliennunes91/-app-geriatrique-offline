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
        'BIO_009': getVal('bioHb'), 'BIO_010': getVal('bioPlaq'), 'BIO_013': getVal('bioAsat'), 'BIO_014': getVal('bioAlat'),
        'BIO_018': getVal('bioCpk'), 'BIO_019': getVal('bioTsh'), 'BIO_020': getVal('bioFer'), 'BIO_021': getVal('bioB12'),
        'BIO_024': getVal('bioCrp'), 'BIO_028': getVal('bioBnp'), 'BIO_031': getVal('bioQtc'),
        'BIO_011': getVal('bioHbA1c'), 'BIO_012': getVal('bioLdl'), 'BIO_022': getVal('bioVitD'), 'BIO_023': getVal('bioAlb')
    };

    const divs = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact', 'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi'];
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
    if(getVal('bioAlb') > 0 && getVal('bioAlb') < 30) ctxClinique.push("denutrition_severe");


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
        divScores.innerHTML += `<div class="alert alert-light border border-info mb-2 shadow-sm"><strong class="text-info">CHA₂DS₂-VASc : ${scoreCha} point(s)</strong><br><small class="text-muted">${ttCha.join(', ') || 'Aucun'}</small></div>`;

        let scoreHas = 0; let ttHas = [];
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 50) { scoreHas += 1; ttHas.push("IRC (+1)"); }
        if(activeComorbs.includes('PAT_008')) { scoreHas += 1; ttHas.push("ATCD AVC (+1)"); }
        if(patientAge > 65) { scoreHas += 1; ttHas.push("Âge >65 (+1)"); }
        if(patientHasMedClass('ains') || patientHasMedClass('antiagreg')) { scoreHas += 1; ttHas.push("AINS/AAS (+1)"); }
        divScores.innerHTML += `<div class="alert alert-light border border-danger mb-2 shadow-sm"><strong class="text-danger">HAS-BLED : ${scoreHas} point(s)</strong><br><small class="text-muted">${ttHas.join(', ') || 'Aucun'}</small></div>`;

        let scoreOrbit = 0; let ttOrbit = [];
        if(patientAge >= 75) { scoreOrbit += 1; ttOrbit.push("Âge ≥75 (+1)"); }
        if(bioValues['BIO_009'] > 0 && ((sexe === 'M' && bioValues['BIO_009'] < 13) || (sexe === 'F' && bioValues['BIO_009'] < 12))) { scoreOrbit += 2; ttOrbit.push("Anémie (+2)"); }
        if(isChecked('chkSaignement') || isChecked('chkAspirineForte')) { scoreOrbit += 2; ttOrbit.push("Saignement (+2)"); }
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 60) { scoreOrbit += 1; ttOrbit.push("DFG <60 (+1)"); }
        if(patientHasMedClass('antiagreg')) { scoreOrbit += 1; ttOrbit.push("Antiagrégant (+1)"); }
        divScores.innerHTML += `<div class="alert alert-light border border-warning mb-2 shadow-sm"><strong class="text-warning">ORBIT-AF : ${scoreOrbit} point(s)</strong><br><small class="text-muted">${ttOrbit.join(', ') || 'Aucun'}</small></div>`;

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
        divScores.innerHTML += `<div class="alert alert-light border border-primary mb-2 shadow-sm"><strong class="text-primary">RISQ-PATH : ${scoreRisq} point(s)</strong><br><small class="text-muted">${ttRisq.join(', ') || 'Aucun'}</small></div>`;

        let scoreTisdale = 0; let ttTisdale = [];
        if(patientAge >= 68) { scoreTisdale += 1; ttTisdale.push("Âge ≥68 (+1)"); }
        if(sexe === 'F') { scoreTisdale += 1; ttTisdale.push("Femme (+1)"); }
        if(patientHasMedClass('diuretique')) { scoreTisdale += 1; ttTisdale.push("Diurétique (+1)"); }
        if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] <= 3.5) { scoreTisdale += 2; ttTisdale.push("HypoK (+2)"); }
        if(bioValues['BIO_031'] >= 450) { scoreTisdale += 2; ttTisdale.push("QTc ≥450 (+2)"); }
        if(globalQT_CountKR > 0) { scoreTisdale += 3; ttTisdale.push("Médoc QT (+3)"); }
        divScores.innerHTML += `<div class="alert alert-light border border-dark mb-2 shadow-sm"><strong class="text-dark">Score de Tisdale : ${scoreTisdale} point(s)</strong><br><small class="text-muted">${ttTisdale.join(', ') || 'Aucun'}</small></div>`;
    }

    // =========================================================
    // 3. MOTEUR BIOLOGIQUE (Syndromes d'Iatrogénie)
    // =========================================================
    const checkBioSyndrome = (syndId, conditionRemplie) => {
        if(!conditionRemplie) return;
        try {
            let s = MASTER_DB.SYNDROMES[syndId]; if(!s) return;
            let causes = [];
            if(s.IMPUTABILITE_FREQ) s.IMPUTABILITE_FREQ.split(',').map(x=>x.trim()).forEach(c => { if(patientHasMedClass(c)) causes.push(c); });
            let imputStr = causes.length > 0 ? `<br><em>Imputabilité iatrogène détectée :</em> <b>${causes.join(', ').toUpperCase()}</b>` : '';
            let isSevere = String(s.GRAVITE).includes('Sévère') || String(s.GRAVITE).includes('Severe');
            addAlert('alertes-bio', `<div class="alert alert-${isSevere ? 'danger alert-stopp' : 'warning border-warning'} shadow-sm"><strong>${isSevere ? '🚨' : '⚠️'} ${s.NOM_SYNDROME}</strong>${imputStr}<br><em>Conduite :</em> ${s.CONDUITE_IMMEDIATE || 'Surveillance'}</div>`, 'bio');
        } catch(e) {}
    };

    if(bioValues['BIO_013'] > 135 || bioValues['BIO_014'] > 105) checkBioSyndrome('SYND_001', true);
    if(bioValues['BIO_018'] > 850) checkBioSyndrome('SYND_002', true);
    if(bioValues['BIO_031'] >= 450) checkBioSyndrome('SYND_003', true);
    if(bioValues['BIO_001'] > 5.0) checkBioSyndrome('SYND_010', true); 
    if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] < 3.5) checkBioSyndrome('SYND_011', true); 

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
                if(typeof DDI_AUC_DB !== 'undefined') {
                    let rootsA = [dciA]; let rootsB = [dciB];
                    if (dciA.includes('rifampic')) rootsA.push('rifampin');
                    if (dciA.includes('quetiap')) rootsA.push('quetiapine');
                    if (dciB.includes('rifampic')) rootsB.push('rifampin');
                    if (dciB.includes('quetiap')) rootsB.push('quetiapine');

                    let aucFiltered = DDI_AUC_DB.filter(d => {
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

                            if(!groupedAnsm[pairName].raw.some(ex => ex.desc.toLowerCase() === desc.toLowerCase())) {
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
            let itemsHtml = data.raw.map(x => `<li style="margin-bottom: 6px;"><span class="${x.isDanger ? 'text-danger' : 'text-dark'} fw-bold">${x.isDanger ? '🔴' : '🟠'} ${x.level}</span><br><span class="small text-muted">${x.desc}</span></li>`).join('');
            addAlert('alertes-ansm', `<div class="alert alert-${boxClass} shadow-sm"><strong style="font-size:1.05em;">${data.isDanger ? '🚨' : '⚡'} Risques ANSM : ${pair}</strong><ul class="mb-0 ps-3">${itemsHtml}</ul></div>`, 'ansm');
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
    if (typeof getRequiredBioMonitoring === 'function' && activeComorbs.length > 0) {
        try {
            const bioMonitors = getRequiredBioMonitoring(activeComorbs);
            for (const [bioId, data] of Object.entries(bioMonitors)) {
                let pNames = data.pathos.map(p => MASTER_DB.PATHOLOGIES[p]?.NOM_STANDARD || p).join(', ');
                let html = `<div class="alert alert-info border-info shadow-sm">
                    <strong class="text-info">🧪 Biologie Recommandée : ${MASTER_DB.BIOLOGIE[bioId]?.NOM_STANDARD || bioId}</strong>
                    <br><span class="small"><b>Pathologie(s) :</b> ${pNames}</span>
                    <br><span class="small"><b>Fréquence :</b> ${data.frequences.join(' / ')}</span>
                    <br><span class="badge bg-secondary mt-1" style="font-size:0.65em;">${data.sources.join(', ')}</span>
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

    let btnPdf = document.getElementById('btnPdf'); if(btnPdf) btnPdf.style.display = 'inline-block';
}
