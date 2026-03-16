// 🧠 app_analysis.js - V5
const medMatchesAnsmTerm = (med, term) => {
    if (!term || !med) return false;
    let t = cleanAnsmString(term); let dci = sanitizeText(med.dci); let classe = sanitizeText(med.classe);
    if(t === 'ains' && (classe.includes('ains') || ['ibuprofene','ketoprofene','naproxene','diclofenac'].some(d=>dci.includes(d)))) return true;
    if(t === 'iec' && (classe.includes('iec') || dci.includes('pril'))) return true;
    if(t.includes('ara 2') && (classe.includes('ara2') || dci.includes('sartan'))) return true;
    if(t.includes('beta bloquant') && (classe.includes('beta') || dci.includes('lol'))) return true;
    if(t.includes('diuretique') && (classe.includes('diuretique') || ['furosemide','bumetanide','hydrochlorothiazide','indapamide','spironolactone'].some(d=>dci.includes(d)))) return true;
    return dci.includes(t) || classe.includes(t) || t.includes(dci);
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
    preCalculerScores();
    const patientAge = getVal('patientAge'); const sexe = getStr('patientSexe'); const isFragile = isChecked('patientFragile') || getVal('scoreCFS') >= 7;

    const bioValues = {
        'BIO_001': getVal('patientK'), 'BIO_002': getVal('patientNa'), 'BIO_003': getVal('bioCreat'), 'BIO_004': getVal('patientDFG'),
        'BIO_005': getVal('bioCa'), 'BIO_006': getVal('bioMg'), 'BIO_007': getVal('bioUree'), 'BIO_008': getVal('bioUric'),
        'BIO_009': getVal('bioHb'), 'BIO_010': getVal('bioPlaq'), 'BIO_013': getVal('bioAsat'), 'BIO_014': getVal('bioAlat'),
        'BIO_018': getVal('bioCpk'), 'BIO_019': getVal('bioTsh'), 'BIO_020': getVal('bioFer'), 'BIO_021': getVal('bioB12'),
        'BIO_024': getVal('bioCrp'), 'BIO_028': getVal('bioBnp'), 'BIO_031': getVal('bioQtc')
    };

    const divs = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact', 'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi'];
    divs.forEach(id => { let el = document.getElementById(id); if(el) el.innerHTML = ''; });
    let counts = { eviter: 0, initier: 0, interact: 0, ansm: 0, auc: 0, bio: 0, usage: 0, suivi: 0 };
    let alertCache = new Set();
    const addAlert = (targetId, htmlStr, countKey) => {
        let el = document.getElementById(targetId); if(!el || !htmlStr) return;
        let cacheKey = sanitizeText(String(htmlStr).replace(/<[^>]*>?/gm, '')); 
        if(!alertCache.has(cacheKey)) { alertCache.add(cacheKey); el.innerHTML += htmlStr; if(countKey) counts[countKey]++; }
    };

    // =========================================================
    // 1. PHÉNOTYPE ET SCORES (ACB/CIA RESTAURÉS)
    // =========================================================
    let divScores = document.getElementById('alertes-scores');
    let phenotype = [];
    if(patientAge >= 85) phenotype.push("Très Grand Âge"); else if(patientAge >= 75) phenotype.push("Gériatrique");
    if(isFragile) phenotype.push("Vulnérable/Fragile");
    if(['PAT_005','PAT_016','PAT_004','PAT_007','PAT_001','PAT_002','PAT_003','PAT_006'].some(c=>activeComorbs.includes(c))) phenotype.push("Cardio-Métabolique");
    if(['PAT_010','PAT_011','PAT_012','PAT_013','PAT_014'].some(c=>activeComorbs.includes(c))) phenotype.push("Neuro-dégénératif");
    if(scoreACB_global >= 3 || scoreCIA_global >= 3) phenotype.push("Haut risque Chute/Confusion");
    
    let phenoStr = phenotype.length ? phenotype.join(" • ") : "Standard";
    let polyAlerte = activeMeds.length >= 10 ? `<div class="alert alert-danger border-danger mb-2 shadow-sm"><strong>💊 Hyperpolypharmacie majeure (${activeMeds.length} médicaments)</strong></div>` : (activeMeds.length >= 5 ? `<div class="alert alert-warning border-warning mb-2 shadow-sm" style="padding:0.5rem;"><strong>💊 Polypharmacie (${activeMeds.length} médicaments)</strong></div>` : "");
    if(divScores) divScores.innerHTML = `<div class="alert alert-dark mb-2 shadow-sm"><strong>👤 Phénotype : ${phenoStr}</strong></div>` + polyAlerte;

    if(divScores) {
        // SCORES ACB & CIA
        let colorACB = scoreACB_global >= 3 ? "danger fw-bold" : (scoreACB_global > 0 ? "warning" : "success"); 
        let colorCIA = scoreCIA_global >= 3 ? "danger fw-bold" : (scoreCIA_global > 0 ? "warning" : "success");
        divScores.innerHTML += `<div class="alert alert-light border border-secondary mb-2 shadow-sm"><strong>🧠 Scores Anticholinergiques :</strong><br><span class="text-${colorACB}">• Échelle ACB : <b>${scoreACB_global} point(s)</b></span><br><span class="text-${colorCIA}">• Échelle CIA : <b>${scoreCIA_global} point(s)</b></span><br><small class="text-muted">Risque majeur de confusion/chute si ≥ 3.</small></div>`;

        // CHA2DS2-VASc
        let scoreCha = 0; let ttCha = [];
        if(patientAge >= 75) { scoreCha += 2; ttCha.push("Âge ≥75"); } else if(patientAge >= 65) { scoreCha += 1; ttCha.push("Âge ≥65"); }
        if(sexe === 'F') { scoreCha += 1; ttCha.push("Femme"); }
        if(activeComorbs.some(c=>['PAT_001','PAT_002','PAT_003'].includes(c))) { scoreCha += 1; ttCha.push("IC"); }
        if(activeComorbs.includes('PAT_005')) { scoreCha += 1; ttCha.push("HTA"); }
        if(activeComorbs.includes('PAT_016')) { scoreCha += 1; ttCha.push("Diabète"); }
        if(activeComorbs.includes('PAT_008')) { scoreCha += 2; ttCha.push("ATCD AVC"); } 
        if(activeComorbs.some(c=>['PAT_004','PAT_007'].includes(c))) { scoreCha += 1; ttCha.push("Vasc"); }
        divScores.innerHTML += `<div class="alert alert-light border border-info mb-2 shadow-sm"><strong class="text-info">CHA₂DS₂-VASc : ${scoreCha} point(s)</strong><br><small class="text-muted">${ttCha.join(', ') || 'Aucun'}</small></div>`;

        // HAS-BLED
        let scoreHas = 0; let ttHas = [];
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 50) { scoreHas += 1; ttHas.push("IRC"); }
        if(activeComorbs.includes('PAT_008')) { scoreHas += 1; ttHas.push("ATCD AVC"); }
        if(patientAge > 65) { scoreHas += 1; ttHas.push("Âge >65"); }
        if(patientHasMedClass('ains') || patientHasMedClass('antiagreg')) { scoreHas += 1; ttHas.push("AINS/AAS"); }
        divScores.innerHTML += `<div class="alert alert-light border border-danger mb-2 shadow-sm"><strong class="text-danger">HAS-BLED : ${scoreHas} point(s)</strong><br><small class="text-muted">${ttHas.join(', ') || 'Aucun'}</small><br><small>${scoreHas >= 3 ? '⚠️ Haut Risque' : ''}</small></div>`;
    }

    // =========================================================
    // 2. MOTEUR BIOLOGIQUE (Iatrogénie active)
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
    if(bioValues['BIO_010'] > 0 && bioValues['BIO_010'] < 100) checkBioSyndrome('SYND_004', true);
    if(bioValues['BIO_007'] > 0 && bioValues['BIO_003'] > 0 && (bioValues['BIO_007'] / (bioValues['BIO_003'] / 1000)) > 100) checkBioSyndrome('SYND_008', true);
    if(bioValues['BIO_002'] > 0 && bioValues['BIO_002'] < 130) checkBioSyndrome('SYND_009', true);
    if(bioValues['BIO_001'] > 5.0) checkBioSyndrome('SYND_010', true); 
    if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] < 3.5) checkBioSyndrome('SYND_011', true); 

    // =========================================================
    // 3. RÈGLES STOPP (À Éviter absolument) ET START (Omissions)
    // =========================================================
    // --- STOPP ---
    if (patientHasMedClass('ains')) {
        if (activeComorbs.some(c => ['PAT_001','PAT_002','PAT_003'].includes(c))) addAlert('alertes-eviter', `<div class="alert alert-danger shadow-sm"><strong>🛑 STOPP : AINS + Insuffisance Cardiaque</strong><br>Risque majeur de décompensation.</div>`, 'eviter');
        if (bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 30) addAlert('alertes-eviter', `<div class="alert alert-danger shadow-sm"><strong>🛑 STOPP : AINS + DFG < 30</strong><br>Risque d'IRA sévère.</div>`, 'eviter');
        if (patientHasMedClass('anticoag')) addAlert('alertes-eviter', `<div class="alert alert-danger shadow-sm"><strong>🛑 STOPP : AINS + Anticoagulant</strong><br>Risque hémorragique inacceptable.</div>`, 'eviter');
    }
    if ((scoreACB_global >= 3 || scoreCIA_global >= 3) && activeComorbs.some(c => ['PAT_010','PAT_011','PAT_012','PAT_013','PAT_014'].includes(c))) {
        addAlert('alertes-eviter', `<div class="alert alert-danger shadow-sm"><strong>🛑 STOPP : Charge Anticholinergique + Démence</strong><br>Aggravation cognitive et risque de confusion aiguë.</div>`, 'eviter');
    }
    if (patientAge >= 75 && patientHasMedClass('isrs') && bioValues['BIO_002'] > 0 && bioValues['BIO_002'] < 130) {
        addAlert('alertes-eviter', `<div class="alert alert-danger shadow-sm"><strong>🛑 STOPP : Antidépresseur ISRS + Hyponatrémie</strong><br>Risque de SIADH sévère.</div>`, 'eviter');
    }

    // --- START ---
    if (activeComorbs.includes('PAT_002')) { // HFrEF
        let missing = [];
        if (!patientHasMedClass('iec') && !patientHasMedClass('ara2') && !patientHasMedClass('arni')) missing.push("IEC / ARA2 ou ARNI (Entresto)");
        if (!patientHasMedClass('beta')) missing.push("Bêtabloquant (Bisoprolol, Carvédilol, Nébivolol, Métoprolol)");
        if (!patientHasMedClass('mra')) missing.push("ARM (Spironolactone, Éplérénone)");
        if (!patientHasMedClass('sglt2')) missing.push("iSGLT2 (Gliflozine)");
        if (missing.length > 0) addAlert('alertes-initier', `<div class="alert alert-danger shadow-sm"><strong>⚠️ Omission (IC FE Réduite)</strong><br>Absence des piliers pronostiques :<ul class="mb-0 mt-1">` + missing.map(m=>`<li>${m}</li>`).join('') + `</ul></div>`, 'initier');
    }
    if (activeComorbs.includes('PAT_006')) { // FA
        if (!patientHasMedClass('anticoag')) addAlert('alertes-initier', `<div class="alert alert-danger shadow-sm"><strong>⚠️ Omission (FA)</strong><br>Absence d'anticoagulation. Évaluer CHA2DS2-VASc.</div>`, 'initier');
    }

    // =========================================================
    // 4. MOTEUR DES INTERACTIONS (DDI & AUC)
    // =========================================================
    try {
        const getEnRoots = (dci) => {
            let s = sanitizeText(dci); let roots = [s];
            if (s.includes('rifampic')) roots.push('rifampin', 'rifampicin');
            if (s.includes('quetiap')) roots.push('quetiapine', 'quetiapin');
            if (s.includes('clarithromyc')) roots.push('clarithromycin');
            if (s.includes('apixaban')) roots.push('eliquis');
            if (s.includes('ritonavir')) roots.push('norvir');
            return roots;
        };

        // A. DDI SPÉCIFIQUES (Du fichier Excel, intelligentes)
        activeMeds.forEach(m => {
            let ref = m.db_ref; if(!ref) return;
            if(ref.ddi_interact && ref.ddi_interact !== "Aucune majeure documentee" && ref.ddi_interact !== "nan") {
                let interactors = ref.ddi_interact.split(/[,\/]/).map(x=>x.trim()).filter(x=>x.length > 2);
                let found = [];
                interactors.forEach(inter => {
                    let cInter = sanitizeText(inter);
                    if(patientHasMedClass(cInter) || activeMeds.some(am => sanitizeText(am.dci).includes(cInter) || sanitizeText(am.classe).includes(cInter))) {
                        found.push(inter);
                    }
                });
                if(found.length > 0) {
                    addAlert('alertes-interact', `<div class="alert alert-danger shadow-sm"><strong>🚨 Co-prescription à risque : ${ref.dci.toUpperCase()}</strong><br>Interaction détectée avec : <b>${found.join(', ')}</b></div>`, 'interact');
                }
            }
        });

        // B. ANSM & GPT & AUC
        let groupedAnsm = {}; let groupedAuc = {};
        for(let i=0; i<activeMeds.length; i++) {
            for(let j=i+1; j<activeMeds.length; j++) {
                let mA = activeMeds[i], mB = activeMeds[j];
                let rootsA = getEnRoots(mA.dci); let rootsB = getEnRoots(mB.dci);
                let pairName = `${mA.dci.toUpperCase()} + ${mB.dci.toUpperCase()}`;

                let matchesAuc = [];
                if(typeof DDI_AUC_DB !== 'undefined') {
                    matchesAuc = DDI_AUC_DB.filter(d => {
                        let p = sanitizeText(String(d.perpetrator)); let v = sanitizeText(String(d.victim));
                        return (rootsA.some(r => r.includes(p)) && rootsB.some(r => r.includes(v))) || (rootsB.some(r => r.includes(p)) && rootsA.some(r => r.includes(v)));
                    });
                }
                if ((rootsA.includes('ritonavir') && rootsB.includes('quetiapine')) || (rootsB.includes('ritonavir') && rootsA.includes('quetiapine'))) matchesAuc.push({ auc_ratio: 6.2, mechanism: "Inhibition puissante CYP3A4", note: "Monographie FDA (Quétiapine x6)" });
                if ((rootsA.includes('clarithromycin') && rootsB.includes('quetiapine')) || (rootsB.includes('clarithromycin') && rootsA.includes('quetiapine'))) matchesAuc.push({ auc_ratio: 2.8, mechanism: "Inhibition forte CYP3A4", note: "Littérature PK (Quétiapine x2.8)" });
                if ((rootsA.includes('ritonavir') && rootsB.includes('apixaban')) || (rootsB.includes('ritonavir') && rootsA.includes('apixaban'))) matchesAuc.push({ auc_ratio: 2.5, mechanism: "Inhibition CYP3A4 & P-gp (Risque Hémorragique Majeur)", note: "FDA (Apixaban x2.5)" });
                
                if (matchesAuc.length > 0) {
                    if(!groupedAuc[pairName]) groupedAuc[pairName] = { items: [] };
                    matchesAuc.forEach(m => { if(!isNaN(parseFloat(m.auc_ratio))) groupedAuc[pairName].items.push(m); });
                }

                if(typeof ANSM_DDI_DB !== 'undefined') {
                    ANSM_DDI_DB.forEach(d => {
                        if ((medMatchesAnsmTerm(mA, d.d1) && medMatchesAnsmTerm(mB, d.d2)) || (medMatchesAnsmTerm(mA, d.d2) && medMatchesAnsmTerm(mB, d.d1))) {
                            if(!groupedAnsm[pairName]) groupedAnsm[pairName] = { isDanger: false, raw: [] };
                            let isDanger = String(d.level).includes("CONTRE-INDICATION");
                            if(isDanger) groupedAnsm[pairName].isDanger = true;
                            if(!groupedAnsm[pairName].raw.some(ex => String(ex.desc).toLowerCase().includes(String(d.desc).toLowerCase()))) groupedAnsm[pairName].raw.push({ level: d.level, desc: d.desc, isDanger: isDanger });
                        }
                    });
                }
            }
        }

        for (const [pair, data] of Object.entries(groupedAuc)) {
            let uniqueItems = []; data.items.forEach(item => { if(!uniqueItems.some(u => parseFloat(u.auc_ratio) === parseFloat(item.auc_ratio))) uniqueItems.push(item); });
            let detailsHtml = uniqueItems.map(m => {
                let ratio = parseFloat(m.auc_ratio); let txtRatio = ratio < 1 ? `x${ratio} (Baisse de ${Math.round((1-ratio)*100)}%)` : `x${ratio} (Hausse de ${Math.round((ratio-1)*100)}%)`;
                return `<li style="margin-bottom:6px;"><span class="fw-bold">${(ratio >= 3 || ratio <= 0.3) ? '🔴' : '🟠'} Ratio ${txtRatio}</span><br><em class="text-muted small">${m.mechanism}</em></li>`;
            }).join('');
            addAlert('alertes-auc', `<div class="alert alert-warning border-warning shadow-sm"><strong style="font-size:1.05em;">📈 Pharmacocinétique (AUC) : ${pair}</strong><hr class="mt-2 mb-2" style="opacity:0.15;"><ul class="mb-0 ps-3">${detailsHtml}</ul></div>`, 'auc');
        }

        for (const [pair, data] of Object.entries(groupedAnsm)) {
            let boxClass = data.isDanger ? "danger alert-stopp" : "warning";
            let itemsHtml = data.raw.map(x => `<li style="margin-bottom: 6px;"><span class="${x.isDanger ? 'text-danger' : 'text-dark'} fw-bold">${x.isDanger ? '🔴' : '🟠'} ${x.level}</span><br><span class="small text-muted">${x.desc}</span></li>`).join('');
            addAlert('alertes-ansm', `<div class="alert alert-${boxClass} shadow-sm"><strong style="font-size:1.05em;">${data.isDanger ? '🚨' : '⚡'} Risques ANSM : ${pair}</strong><hr class="mt-2 mb-2" style="opacity:0.15;"><ul class="mb-0 ps-3">${itemsHtml}</ul></div>`, 'ansm');
        }
    } catch(e) { console.error("Erreur Interactions", e); }

    // =========================================================
    // 5. POSOLOGIES ET SUIVI BIOLOGIQUE
    // =========================================================
    activeMeds.forEach(m => {
        let ref = m.db_ref; if (!ref) return;

        let hasPoso = ref.poso_hab || ref.poso_ger || ref.poso_ren || ref.atb_legere || ref.atb_moderee || ref.atb_severe; 
        let alb = parseFloat(ref.albumine) || 0;

        if (hasPoso || alb >= 85) {
            let html = `<div class="alert alert-success border border-success shadow-sm"><strong class="text-success">💊 Posologies : ${ref.dci.toUpperCase()}</strong><br>`;
            if (ref.poso_hab) html += `<em>Standard :</em> ${ref.poso_hab}<br>`;
            if (ref.poso_ger) html += `<em>👴 Gériatrique :</em> <b>${ref.poso_ger}</b><br>`;
            
            let isRenalDanger = (bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 60);
            if (ref.poso_ren) html += `<span class="${isRenalDanger ? 'text-danger fw-bold' : 'text-dark'}"><em>🧪 Fonction Rénale :</em> ${ref.poso_ren}</span><br>`;
            if (ref.atb_legere || ref.atb_moderee || ref.atb_severe) {
                html += `<div class="mt-2 p-2 bg-white rounded border border-success border-opacity-50"><b>Adaptations ATB selon DFG :</b><br>`;
                if(ref.atb_legere) html += `- Légère (60-90) : ${ref.atb_legere}<br>`;
                if(ref.atb_moderee) html += `<span class="${bioValues['BIO_004'] > 0 && bioValues['BIO_004'] <= 60 && bioValues['BIO_004'] > 30 ? 'text-danger fw-bold' : ''}">- Modérée (30-60) : ${ref.atb_moderee}</span><br>`;
                if(ref.atb_severe) html += `<span class="${bioValues['BIO_004'] > 0 && bioValues['BIO_004'] <= 30 && bioValues['BIO_004'] > 15 ? 'text-danger fw-bold' : ''}">- Sévère (15-30) : ${ref.atb_severe}</span><br>`;
                if(ref.atb_terminale) html += `<span class="${bioValues['BIO_004'] > 0 && bioValues['BIO_004'] <= 15 ? 'text-danger fw-bold' : ''}">- Terminale (<15) : ${ref.atb_terminale}</span>`;
                html += `</div>`;
            }
            if (alb >= 85) html += `<span class="text-danger small d-block border-top pt-1 mt-1 border-success border-opacity-25"><em>🩸 Forte liaison à l'albumine :</em> <b>${alb}%</b> (Risque surdosage si dénutrition).</span>`;
            html += `</div>`;
            addAlert('alertes-usage', html, 'usage');
        }

        if (ref.suivi_initial || ref.suivi_periodique || ref.alerte_clinique) {
            let sHtml = `<div class="alert alert-light border border-primary shadow-sm"><strong class="text-primary" style="font-size:1.05em;">👁️ Protocole de Suivi : ${ref.dci.toUpperCase()}</strong><hr class="mt-2 mb-2" style="opacity:0.15;">`;
            if (ref.suivi_initial) sHtml += `<div class="mb-2 text-dark"><b>Initial :</b> ${formatSuiviList(ref.suivi_initial)}</div>`;
            if (ref.suivi_periodique) sHtml += `<div class="mb-2 text-dark"><b>Régulier :</b> ${formatSuiviList(ref.suivi_periodique)}</div>`;
            if (ref.alerte_clinique) sHtml += `<div style="color: #d97706;"><b>⚠️ À surveiller :</b> ${formatSuiviList(ref.alerte_clinique)}</div>`;
            sHtml += `</div>`;
            addAlert('alertes-suivi', sHtml, 'suivi');
        }
    });

    if(counts.eviter === 0) document.getElementById('alertes-eviter').innerHTML = '<div class="alert alert-light">Aucune prescription inappropriée détectée.</div>';
    if(counts.initier === 0) document.getElementById('alertes-initier').innerHTML = '<div class="alert alert-light">Aucune omission majeure détectée.</div>';
    if(counts.usage === 0) document.getElementById('alertes-usage').innerHTML = '<div class="alert alert-light">Aucune adaptation posologique spécifique requise.</div>';
    if(counts.suivi === 0) document.getElementById('alertes-suivi').innerHTML = '<div class="alert alert-light">Aucun suivi biologique spécifique.</div>';
    if(counts.ansm === 0) document.getElementById('alertes-ansm').innerHTML = '<div class="alert alert-light">Aucune interaction du thésaurus ANSM détectée.</div>';
    if(counts.interact === 0) document.getElementById('alertes-interact').innerHTML = '<div class="alert alert-light">Aucun risque clinique ou Pharmacocinétique détecté.</div>';
    if(counts.bio === 0) document.getElementById('alertes-bio').innerHTML = '<div class="alert alert-light">Aucune anomalie syndromique biologique.</div>';

    let btnPdf = document.getElementById('btnPdf'); if(btnPdf) btnPdf.style.display = 'inline-block';
}
