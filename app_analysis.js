function preCalculerScores() {
    scoreACB_global = 0; scoreCIA_global = 0; maxQTLevel_global = 0;
    infoACB_global = []; infoCIA_global = []; infoQT_global = [];
    globalQT_CountKR = 0; globalQT_CountCR_PR = 0;

    activeMeds.forEach(m => {
        let dClean = sanitizeText(m.dci);
        if(dClean.includes('trihexyphenidyle')) { scoreACB_global += 3; infoACB_global.push(`${m.dci} (+3 [BHE+])`); }

        if(typeof GERIA_DB !== 'undefined' && GERIA_DB.medica_qt) {
            let row = GERIA_DB.medica_qt.find(q => sanitizeText(q["DCI (Molécule)"] || q["DCI"] || "").includes(dClean) || dClean.includes(sanitizeText(q["DCI (Molécule)"] || q["DCI"] || "")));
            if(row) {
                let keyQT = Object.keys(row).find(k => k && k.toLowerCase().includes("qt"));
                let qtVal = keyQT ? (row[keyQT] || "") : "";
                if(qtVal.includes("(KR)")) { maxQTLevel_global = Math.max(maxQTLevel_global, 2); infoQT_global.push(`${m.dci} (Connu)`); globalQT_CountKR++; }
                else if(qtVal.includes("(PR)")) { maxQTLevel_global = Math.max(maxQTLevel_global, 1); infoQT_global.push(`${m.dci} (Possible)`); globalQT_CountCR_PR++; }
                else if(qtVal.includes("(CR)")) { maxQTLevel_global = Math.max(maxQTLevel_global, 1); infoQT_global.push(`${m.dci} (Conditionnel)`); globalQT_CountCR_PR++; }
            }
        }
        
        if(typeof ANTICHOLINERGIC_DB !== 'undefined') {
            let found = ANTICHOLINERGIC_DB[dClean];
            if(!found) { let pKey = Object.keys(ANTICHOLINERGIC_DB).find(k => k.includes(dClean) || dClean.includes(k)); if(pKey) found = ANTICHOLINERGIC_DB[pKey]; }
            if(found && !dClean.includes('trihexyphenidyle')) {
                if(found.acb > 0) { scoreACB_global += found.acb; infoACB_global.push(`${m.dci} (+${found.acb})`); }
                if(found.cia > 0) { let bheStr = found.bhe === 1 ? " [BHE+]" : (found.bhe === 0 ? " [BHE-]" : ""); scoreCIA_global += found.cia; infoCIA_global.push(`${m.dci} (+${found.cia}${bheStr})`); }
            }
        }
    });
}

function analyserPrescription() {
    preCalculerScores();
    const isFragile = isChecked('patientFragile');
    const isFumeur = isChecked('chkTabac');
    const sexe = getStr('patientSexe');
    const patientAge = getVal('patientAge');
    
    const hasComorb = (c) => {
        let targets = [c];
        if(c === 'DEMENCE') targets.push('DEMENCE_ALZHEIMER', 'DEMENCE_CORPS_LEWY', 'DEMENCE_FRONTO');
        if(c === 'PARKINSON') targets.push('DEMENCE_CORPS_LEWY');
        if(c === 'IC' || c === 'IC_SYSTOLIQUE' || c === 'IC_FE_REDUITE') targets.push('IC_FE_REDUITE', 'IC_SYSTOLIQUE', 'IC');
        if(c === 'SCC') targets.push('POST_SCA');
        return targets.some(t => activeComorbs.includes(t));
    };
    const hasAnyIC = hasComorb('IC') || hasComorb('IC_FE_PRESERVEE'); 

    const bioPatient = {
        DFG: getVal('patientDFG'), K: getVal('patientK'), Na: getVal('patientNa'), Ca: getVal('bioCa'), Mg: getVal('bioMg'),
        CRP: getVal('bioCrp'), BMI: getVal('patientBmi'), Hb: getVal('bioHb'), Tsh: getVal('bioTsh'), Plaq: getVal('bioPlaq'),
        Albumine: getVal('bioAlbumSg'), Fer: getVal('bioFer'), B9: getVal('bioB9'), B12: getVal('bioB12'), VitD: getVal('bioVitD'), Uric: getVal('bioUric'),
        Uree: getVal('bioUree'), Creat: getVal('bioCreat'),
        Cpk: getVal('bioCpk'), Asat: getVal('bioAsat'), Alat: getVal('bioAlat'), Pal: getVal('bioPal'), Ggt: getVal('bioGgt'), Bnp: getVal('bioBnp'),
        QTc: getVal('bioQtc')
    };

    const divs = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact', 'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi'];
    divs.forEach(id => { let el = document.getElementById(id); if(el) el.innerHTML = ''; });
    let counts = { eviter: 0, initier: 0, interact: 0, ansm: 0, auc: 0, bio: 0, usage: 0, suivi: 0 };
    
    const divEviter = document.getElementById('alertes-eviter'), divInitier = document.getElementById('alertes-initier'), divInteract = document.getElementById('alertes-interact');
    const divAnsm = document.getElementById('alertes-ansm'), divAuc = document.getElementById('alertes-auc'), divBio = document.getElementById('alertes-bio');
    const divUsage = document.getElementById('alertes-usage'), divSuivi = document.getElementById('alertes-suivi'), divScores = document.getElementById('alertes-scores');
    
    let alertCache = new Set();
    const addAlert = (targetDiv, htmlStr, countKey) => {
        if(!targetDiv || !htmlStr) return;
        let cacheKey = sanitizeText(String(htmlStr).replace(/<[^>]*>?/gm, '')); 
        if(!alertCache.has(cacheKey)) { alertCache.add(cacheKey); targetDiv.innerHTML += htmlStr; if(countKey && counts[countKey] !== undefined) counts[countKey]++; }
    };

    let phenotype = [];
    if(patientAge >= 85) phenotype.push("Très Grand Âge"); else if(patientAge >= 75) phenotype.push("Gériatrique");
    if(isFragile || getVal('scoreCFS') >= 7) phenotype.push("Vulnérable/Fragile");
    if(hasComorb('HTA') || hasComorb('DIABETE') || hasComorb('SCC') || hasComorb('AOMI') || hasAnyIC || hasComorb('FA')) phenotype.push("Cardio-Métabolique");
    if(hasComorb('DEMENCE') || hasComorb('PARKINSON')) phenotype.push("Neuro-dégénératif");
    if(scoreACB_global >= 3 || scoreCIA_global >= 3) phenotype.push("Haut risque Chute/Confusion");
    if(hasComorb('VERTIGES')) phenotype.push("Troubles Vestibulaires");
    let phenoStr = phenotype.length ? phenotype.join(" • ") : "Standard";
    
    let nbMeds = activeMeds.length; let polyAlerte = "";
    if(nbMeds >= 10) { polyAlerte = `<div class="alert alert-danger border-danger mb-2 shadow-sm"><strong>💊 Hyperpolypharmacie majeure (${nbMeds} médicaments)</strong><br><em>Action :</em> Envisager une déprescription ciblée. <span class="badge bg-dark float-end">HAS</span></div>`; } 
    else if(nbMeds >= 5) { polyAlerte = `<div class="alert alert-warning border-warning mb-2 shadow-sm" style="padding:0.5rem;"><strong>💊 Polypharmacie (${nbMeds} médicaments)</strong></div>`; }
    if(divScores) divScores.innerHTML = `<div class="alert alert-dark mb-2 shadow-sm"><strong>👤 Phénotype : ${phenoStr}</strong></div>` + polyAlerte;

    let modePalliatif = isFragile || getVal('scoreCFS') >= 8;
    if (modePalliatif) { addAlert(divInitier, `<div class="alert alert-secondary border-secondary text-center shadow-sm"><strong>🛑 MODE PATIENT TRÈS FRAGILE ACTIVÉ</strong><br>Les alertes de prévention primaire (START) sont réduites au silence pour privilégier le confort.</div>`, null); }

    // =========================================================================
    // 🌉 1. DIAGNOSTIC SYNDROMIQUE CROISÉ
    try {
        let syndromeAlerts = [];
        if (bioPatient.Tsh > 0) {
            let hasAmio = patientHasMedClass('amiodarone'); let hasLithium = patientHasMedClass('lithium');
            if (bioPatient.Tsh < 0.4 && hasAmio) syndromeAlerts.push(`<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Hyperthyroïdie à l'Amiodarone (Type 1 ou 2)</strong><br>TSH effondrée (${bioPatient.Tsh} mUI/L). Risque de thyrotoxicose sévère.<br><em>Action :</em> Avis cardiologique et endocrinologique urgent. <span class="badge bg-dark float-end">Endocrino</span></div>`);
            else if (bioPatient.Tsh > 4.0) {
                if (hasAmio) syndromeAlerts.push(`<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Hypothyroïdie à l'Amiodarone</strong><br>TSH élevée (${bioPatient.Tsh} mUI/L). Effet Wolff-Chaikoff (blocage par excès d'iode).<br><em>Action :</em> L'arrêt n'est pas obligatoire. Substitution par Lévothyroxine possible. <span class="badge bg-dark float-end">Endocrino</span></div>`);
                if (hasLithium) syndromeAlerts.push(`<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Hypothyroïdie sous Lithium</strong><br>TSH élevée (${bioPatient.Tsh} mUI/L). Le lithium inhibe la libération hormonale. <span class="badge bg-dark float-end">Endocrino</span></div>`);
            }
        }
        if (bioPatient.Cpk > 850) {
            let medRhabdo = activeMeds.filter(m => ['statin', 'fibrate', 'colchicine', 'daptomycine'].some(x => sanitizeText(m.dci).includes(x) || sanitizeText(m.classe).includes(x)));
            if (medRhabdo.length > 0) syndromeAlerts.push(`<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 URGENCE : Rhabdomyolyse Sévère Iatrogène</strong><br>CPK > 5N (${bioPatient.Cpk} UI/L) sous <b>${medRhabdo.map(m=>m.dci).join(', ')}</b>.<br><em>Action :</em> ARRÊT IMMÉDIAT du traitement. <span class="badge bg-dark float-end">Néphro/Toxico</span></div>`);
        }
        if (bioPatient.Asat > 120 || bioPatient.Alat > 120) {
            let hepaMeds = activeMeds.filter(m => ['paracetamol', 'amiodarone', 'statin', 'valproate', 'methotrexate', 'isoniazide', 'rifampicine'].some(x => sanitizeText(m.dci).includes(x) || sanitizeText(m.classe).includes(x)));
            syndromeAlerts.push(`<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Cytolyse Hépatique Sévère (> 3N)</strong><br>ASAT=${bioPatient.Asat} / ALAT=${bioPatient.Alat} UI/L.<br><em>Imputabilité possible :</em> <b>${hepaMeds.length ? hepaMeds.map(m=>m.dci).join(', ') : 'Aucun traceur majeur'}</b>. <span class="badge bg-dark float-end">Gastro</span></div>`);
        }
        if (bioPatient.Plaq > 0 && bioPatient.Plaq < 100 && patientHasMedClass('heparine')) {
            syndromeAlerts.push(`<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 SUSPICION TIH (Thrombopénie à l'Héparine)</strong><br>Plaquettes effondrées (${bioPatient.Plaq} G/L) sous Héparine.<br><em>Action :</em> Arrêt immédiat. Relais Danaparoïde. <span class="badge bg-dark float-end">Hémato</span></div>`);
        }
        if (bioPatient.Uree > 10 && bioPatient.Creat > 100) {
            if ((bioPatient.Uree / (bioPatient.Creat / 1000)) > 100 && (patientHasMedClass('diuretique') || patientHasMedClass('iec') || patientHasMedClass('ara2'))) {
                syndromeAlerts.push(`<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Insuffisance Rénale d'allure Fonctionnelle</strong><br>Rapport Urée/Créatinine élevé. Déshydratation iatrogène suspectée. <span class="badge bg-dark float-end">Néphro</span></div>`);
            }
        }
        if (bioPatient.Bnp > 400 && hasAnyIC) {
            let icTox = activeMeds.filter(m => ['ains', 'ibuprofene', 'ketoprofene', 'naproxene', 'diclofenac', 'pioglitazone', 'pregabaline', 'gabapentine'].some(x => sanitizeText(m.dci).includes(x) || sanitizeText(m.classe).includes(x)));
            if (icTox.length > 0) syndromeAlerts.push(`<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Insuffisance Cardiaque Décompensée & Iatrogénie</strong><br>BNP = ${bioPatient.Bnp} pg/mL. Arrêt formel de : <b>${icTox.map(m=>m.dci).join(', ')}</b>. <span class="badge bg-dark float-end">Cardio</span></div>`);
        }
        if (bioPatient.Hb > 0 && ((sexe === 'M' && bioPatient.Hb < 13) || (sexe === 'F' && bioPatient.Hb < 12))) {
            if (bioPatient.Fer > 0 && bioPatient.Fer < 30) syndromeAlerts.push(`<div class="alert alert-warning border-warning shadow-sm"><strong>🩸 Diagnostic : Anémie Ferriprive</strong><br>Hb = ${bioPatient.Hb} g/dL | Ferritine = ${bioPatient.Fer} µg/L. ${patientHasMedClass('ipp')?'(Malabsorption IPP?)':''} <span class="badge bg-dark float-end">Hémato</span></div>`);
            if (bioPatient.B12 > 0 && bioPatient.B12 < 150) syndromeAlerts.push(`<div class="alert alert-warning border-warning shadow-sm"><strong>🩸 Diagnostic : Anémie Macrocytique</strong><br>Hb = ${bioPatient.Hb} g/dL | B12 = ${bioPatient.B12} pmol/L. ${(patientHasMedClass('metformine')||patientHasMedClass('ipp'))?'(Carence iatrogène Metformine/IPP possible)':'(Biermer/Dénutrition)'} <span class="badge bg-dark float-end">Hémato</span></div>`);
        }
        syndromeAlerts.forEach(a => addAlert(divBio, a, 'bio'));
    } catch(e) { console.error("Erreur Syndromes", e); }

    // =========================================================================
    // 🧠 2. MOTEUR BIOLOGIQUE STANDARD
    try {
        let alertesStandardBio = "";
        if (typeof BIO_DB !== 'undefined') {
            Object.keys(BIO_DB).forEach(bioKey => {
                let val = bioPatient[bioKey];
                if (val === 0 || isNaN(val) || val === null || val === undefined) return; 
                let def = BIO_DB[bioKey];
                if (val > def.max * 3 && val > 10 && !["Cpk", "Asat", "Alat", "Pal", "Ggt", "Bnp", "Plaq", "Fer", "B12"].includes(bioKey)) { 
                     addAlert(divBio, `<div class="alert alert-dark border-dark shadow-sm"><strong>🛑 Valeur aberrante : ${def.nom} à ${val} ${def.unite}</strong><br>Vérifiez la saisie.</div>`, null); return; 
                }
                let isHyper = val > def.max; let isHypo = val < def.min;
                let isCritHyper = def.critiqueMax && val >= def.critiqueMax; let isCritHypo = def.critiqueMin && val <= def.critiqueMin;

                if (isHyper) {
                    alertesStandardBio += `<li style="margin-bottom:3px;"><b>${def.hyperName}</b> (${val} ${def.unite}) ${isCritHyper ? '🚨' : ''}</li>`;
                    let medCauses = def.hyperMeds.filter(m => patientHasMedClass(m));
                    if (medCauses.length > 0) addAlert(divBio, `<div class="alert alert-${isCritHyper?'danger alert-stopp':'danger border-danger'} shadow-sm"><strong>${isCritHyper?'🚨':'⚠️'} Iatrogénie : ${def.hyperName} (${val} ${def.unite})</strong><br><em>Imputabilité :</em> <b>${medCauses.join(', ').toUpperCase()}</b>.</div>`, 'bio');
                    if (def.supplementClass && patientHasMedClass(def.supplementClass)) addAlert(divEviter, `<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Surcharge thérapeutique : ${def.nom} (${val} ${def.unite})</strong><br><em>Action :</em> Arrêter <b>${def.supplement}</b>.</div>`, 'eviter');
                } else if (isHypo) {
                    alertesStandardBio += `<li style="margin-bottom:3px;"><b>${def.hypoName}</b> (${val} ${def.unite}) ${isCritHypo ? '🚨' : ''}</li>`;
                    let medCauses = def.hypoMeds.filter(m => patientHasMedClass(m));
                    if (medCauses.length > 0) addAlert(divBio, `<div class="alert alert-${isCritHypo?'danger alert-stopp':'warning border-warning'} shadow-sm"><strong>${isCritHypo?'🚨':'⚠️'} Iatrogénie : ${def.hypoName} (${val} ${def.unite})</strong><br><em>Imputabilité :</em> <b>${medCauses.join(', ').toUpperCase()}</b>.</div>`, 'bio');
                    if (def.supplementClass && !patientHasMedClass(def.supplementClass) && !modePalliatif) addAlert(divInitier, `<div class="alert alert-success alert-start shadow-sm"><strong>Omission : ${def.hypoName} (${val} ${def.unite})</strong><br><em>Action :</em> Envisager <b>${def.supplement}</b>.</div>`, 'initier');
                }
            });
        }
        if (alertesStandardBio !== "") { let recapHtml = `<div class="alert alert-danger border border-danger mb-3 shadow-sm"><strong>⚠️ Récapitulatif Anomalies :</strong><ul class="mb-0">${alertesStandardBio}</ul></div>`; if(divBio) divBio.innerHTML = recapHtml + divBio.innerHTML; counts.bio++; }
    } catch(e) { console.error("Erreur Bio", e); }

    // =========================================================================
    // 🧠 3. MOTEUR GUIDELINES
    try {
        if(typeof GUIDELINES_DB !== 'undefined') {
            GUIDELINES_DB.forEach(rule => {
                let patho = "Guideline"; let decision = ""; let source = ""; let level = ""; let divergence = "";
                for (let k in rule) {
                    let keyClean = sanitizeText(k);
                    if(keyClean.includes("decision") || keyClean.includes("recommandation")) decision = String(rule[k]);
                    else if(keyClean.includes("patho")) patho = String(rule[k]);
                    else if(keyClean.includes("source") || keyClean.includes("annee")) source = String(rule[k]);
                    else if(keyClean.includes("niveau") || keyClean.includes("evidence")) level = String(rule[k]);
                    else if(keyClean.includes("divergence")) divergence = String(rule[k]);
                }
                if(!decision) return;

                let ruleId = String(rule["Rule ID"] || rule["id"] || rule["Rule_ID"] || rule["RuleID"] || "").toUpperCase();
                let isTriggered = false; let section = "";
                let badge = `<span class="badge bg-dark float-end" title="${divergence}">${source} (${level})</span>`;

                if(ruleId === "HYPO_ORTHO_ALPHA") { if(hasComorb('HYPOTENSION_ORTHO') && patientHasMedClass('alpha-bloquant')) { isTriggered = true; section = "eviter"; } }
                else if(ruleId === "HYPO_ORTHO_TCA") { if(hasComorb('HYPOTENSION_ORTHO') && patientHasMedClass('tricyclique')) { isTriggered = true; section = "eviter"; } }
                else if(ruleId === "HYPO_ORTHO_NEUROL") { if(hasComorb('HYPOTENSION_ORTHO') && patientHasMedClass('neuroleptique')) { isTriggered = true; section = "usage"; } }
                else if(ruleId === "HYPO_ORTHO_DOPA") { if(hasComorb('HYPOTENSION_ORTHO') && patientHasMedClass('dopaminergique')) { isTriggered = true; section = "usage"; } }
                else if(ruleId === "DEM_LEWY_NEUROL") { if(hasComorb('DEMENCE_CORPS_LEWY') && patientHasMedClass('neuroleptique')) { isTriggered = true; section = "eviter"; } }
                else if(ruleId === "DEM_DFT_ACH") { if(hasComorb('DEMENCE_FRONTO') && patientHasMedClass('achei')) { isTriggered = true; section = "eviter"; } }
                else if(ruleId.includes("SGLT2") && ruleId.includes("CKD")) {
                    if(hasComorb('DIABETE') && bioPatient.DFG > 0 && bioPatient.DFG <= 60 && bioPatient.DFG >= 20 && !hasAnyIC) {
                        if(!patientHasMedClass('sglt2')) { isTriggered = true; section = "initier"; }
                    }
                }
                else if(ruleId.includes("HTA")) { if(hasComorb('HTA')) { isTriggered = true; section = "bio"; } }
                else if(ruleId.includes("UTI")) { if(hasComorb('INFECTION_URINAIRE') || hasComorb('CYSTITE')) { isTriggered = true; section = "initier"; } }
                else if(ruleId.includes("ASPIRIN") || ruleId.includes("PREVENTION")) {
                    if(patientHasMedClass('antiagreg')) {
                        if(patientAge > 70 && !hasComorb('POST_SCA') && !hasComorb('AVC') && !isChecked('chkScaAigu') && !isChecked('chkAvc')) { 
                            isTriggered = true; section = "eviter"; 
                            let hasSecPrev = hasComorb('SCC') || hasComorb('AOMI') || hasComorb('AVC') || hasComorb('POST_SCA') || isChecked('chkScaAigu');
                            if (hasSecPrev) { decision = `<del>${decision}</del><br><span class="text-primary fw-bold">💡 Règle STOPP (Aspirine > 70 ans), MAIS indication de prévention secondaire présente. À rediscuter.</span>`; }
                        }
                    }
                }
                else if(ruleId === "EPI_1") { if(hasComorb('EPILEPSIE')) { isTriggered = true; section = "usage"; } }
                else if(ruleId === "CANCER_CAT") { if(hasComorb('CANCER') && patientHasMedClass('anticoagulant')) { isTriggered = true; section = "usage"; } }
                else if(ruleId === "AOMI_1") { 
                    if(hasComorb('AOMI')) { 
                        let missingAOMI = [];
                        if(!patientHasMedClass('statin')) missingAOMI.push("Statine");
                        if(!patientHasMedClass('antiagreg')) missingAOMI.push("Antiagrégant");
                        if(!patientHasMedClass('iec') && !patientHasMedClass('ara2')) missingAOMI.push("IEC/ARA2");
                        if(missingAOMI.length > 0) { isTriggered = true; section = "initier"; decision = `Il manque : <b>${missingAOMI.join(' + ')}</b>. (Recommandation : Statine forte, Antiagrégant, IEC).`; }
                    } 
                }

                if(modePalliatif && section === "initier") isTriggered = false;
                if(isTriggered && section !== "scores") {
                    addAlert(section === "eviter" ? divEviter : (section === "initier" ? divInitier : (section === "bio" ? divBio : divUsage)), `<div class="alert alert-light border border-info shadow-sm">${badge}<strong class="text-info">🌍 Guideline : ${patho}</strong><br><em>Recommandation :</em> ${decision}</div>`, section);
                }
            });
        }
    } catch(e) { console.error("Erreur Guidelines", e); }

    // =========================================================================
    // 🧠 4. CDSS - MÉTA-RÈGLES EXPERTES
    try {
        let antipsychotiquesIsoles = activeMeds.filter(m => {
            let cdci = sanitizeText(m.dci); let cclass = sanitizeText(m.classe);
            return ['quetiapine', 'risperidone', 'olanzapine', 'aripiprazole', 'haloperidol', 'tiapride', 'clozapine', 'loxapine', 'cyamemazine', 'chlorpromazine'].some(x => cdci.includes(x)) || cclass.includes('neurolepti') || cclass.includes('antipsychoti');
        });
        if (antipsychotiquesIsoles.length > 0 && patientAge >= 75) {
            addAlert(divEviter, `<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Alerte de Sécurité (FDA/HAS) : Antipsychotiques</strong><br>Prescription de <b>${antipsychotiquesIsoles.map(m=>m.dci).join(', ').toUpperCase()}</b> chez un patient de ${patientAge} ans. <br><em>Risque :</em> Augmentation démontrée du risque d'AVC et de mortalité cardiovasculaire/infectieuse.<br><em>Action :</em> À proscrire sauf diagnostic psychiatrique précis. <span class="badge bg-dark float-end">Beers / STOPP</span></div>`, 'eviter');
        }

        if (isFumeur) {
            let cyp1a2Substrates = activeMeds.filter(m => ['clozapine', 'olanzapine', 'duloxetine', 'theophylline', 'haloperidol', 'flecainide'].some(x => sanitizeText(m.dci).includes(x)));
            if (cyp1a2Substrates.length > 0) {
                addAlert(divInteract, `<div class="alert alert-warning border-warning shadow-sm"><strong>🚬 Interaction Tabac (Induction CYP1A2)</strong><br>Le tabagisme accélère considérablement l'élimination de : <b>${cyp1a2Substrates.map(m=>m.dci).join(', ').toUpperCase()}</b>.<br><em>Risque :</em> Sous-dosage et échappement thérapeutique.<br><em>Attention :</em> En cas de sevrage tabagique, le taux sanguin va exploser (risque toxique majeur, réduire la dose). <span class="badge bg-dark float-end">Pharmacocinétique</span></div>`, 'interact');
            }
        }

        if(hasComorb('IC_FE_REDUITE')) {
            let hasIecAra = patientHasMedClass('iec') || patientHasMedClass('ara2') || patientHasMedClass('arni');
            let hasBB = patientHasMedClass('beta'); let hasMRA = patientHasMedClass('mra'); let hasSGLT2 = patientHasMedClass('sglt2');
            let icScore = (hasIecAra?1:0) + (hasBB?1:0) + (hasMRA?1:0) + (hasSGLT2?1:0);
            let txtClass = icScore === 4 ? 'success' : (icScore >= 2 ? 'warning' : 'danger');
            addAlert(divInitier, `<div class="alert alert-${txtClass} border-${txtClass} shadow-sm"><strong>🫀 Optimisation IC FEVG Réduite (Quadrithérapie) : ${icScore}/4 piliers</strong><br><ul class="mb-0 small mt-1"><li>${hasBB ? '✅ Bêtabloquant présent' : '❌ Bêtabloquant (Manquant)'}</li><li>${hasIecAra ? '✅ IEC / ARA2 / ARNI présent' : '❌ Blocage SRAA (Manquant)'}</li><li>${hasMRA ? '✅ Anti-aldostérone présent' : '❌ Anti-aldostérone (Manquant)'}</li><li>${hasSGLT2 ? '✅ Gliflozine SGLT2 présente' : '❌ Gliflozine SGLT2 (Manquante)'}</li></ul><span class="badge bg-dark float-end">ESC 2024</span></div>`, 'initier');
        }
        
        if (hasComorb('IC_FE_PRESERVEE') && !patientHasMedClass('sglt2')) {
            addAlert(divInitier, `<div class="alert alert-success alert-start shadow-sm"><strong>🫀 Optimisation IC FEVG Préservée (HFpEF)</strong><br>Les inhibiteurs de SGLT2 (Dapagliflozine, Empagliflozine) sont recommandés en 1ère intention pour réduire les hospitalisations pour IC.<br><em>Action :</em> Envisager l'introduction d'une gliflozine. <span class="badge bg-dark float-end">ESC 2023/2024</span></div>`, 'initier');
        }

        if (patientHasMedClass('arni') && patientHasMedClass('iec')) addAlert(divEviter, `<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Contre-indication Absolue : IEC + Entresto (ARNI)</strong><br>Risque d'angioedème fatal. Délai de "wash-out" de 36h obligatoire. <span class="badge bg-dark float-end">ESC / HAS</span></div>`, 'eviter');
        if (patientHasMedClass('diuretique') && patientHasMedClass('ains') && (patientHasMedClass('iec') || patientHasMedClass('ara2') || patientHasMedClass('arni'))) addAlert(divEviter, `<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Triple Peine Rénale détectée ! (Diurétique + IEC/ARA2 + AINS)</strong><br>Risque majeur d'IRA. <span class="badge bg-dark float-end">ANSM</span></div>`, 'eviter');
        if (patientHasMedClass('IEC') && patientHasMedClass('ARA2')) addAlert(divEviter, `<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Double blocage du SRAA (IEC + ARA II)</strong><br>Risque majeur d'IRA et d'hyperkaliémie. <span class="badge bg-dark float-end">HAS</span></div>`, 'eviter');

        let hasAsp = activeMeds.some(m => sanitizeText(m.dci).includes("aspirin")); let hasClopi = activeMeds.some(m => sanitizeText(m.dci).includes("clopidogrel"));
        let isBitherapie = (hasAsp?1:0) + (hasClopi?1:0) + (patientHasMedClass('anticoagulant')?1:0) >= 2;
        let needIPP = false; let ippReason = [];
        if (patientHasMedClass('ains') && patientAge >= 65) { needIPP = true; ippReason.push("AINS > 65 ans"); }
        if (patientHasMedClass('ains') && patientHasMedClass('corticoide')) { needIPP = true; ippReason.push("AINS + Corticoïdes"); }
        if (hasAsp && patientAge >= 75) { needIPP = true; ippReason.push("Aspirine > 75 ans"); }
        if (isBitherapie) { needIPP = true; ippReason.push("Bithérapie antithrombotique"); }
        if ((patientHasMedClass('ains') || hasAsp || isBitherapie) && (hasComorb('ULCERE') || isChecked('chkSaignement'))) { needIPP = true; ippReason.push("ATCD d'ulcère / Saignement"); }
        if (needIPP && !patientHasMedClass('ipp')) addAlert(divInitier, `<div class="alert alert-info border-info shadow-sm"><strong>💡 Protection Gastrique recommandée</strong><br><em>Critères :</em> ${ippReason.join(' / ')}.<br><em>Action :</em> Introduction d'un IPP à discuter. <span class="badge bg-dark float-end">HAS / ESC</span></div>`, 'initier');

        let seroMeds = activeMeds.filter(m => ['tramadol', 'escitalopram', 'citalopram', 'sertraline', 'paroxetine', 'fluoxetine', 'venlafaxine', 'duloxetine', 'lithium', 'amitriptyline', 'clomipramine'].some(x => sanitizeText(m.dci).includes(x)));
        if(seroMeds.length >= 2) addAlert(divInteract, `<div class="alert alert-warning border-warning shadow-sm"><strong>⚡ Risque de Syndrome Sérotoninergique</strong><br><em>Cumul :</em> <b>${seroMeds.map(m=>m.dci).join(', ')}</b><br><em>Surveillance :</em> Sueurs, tremblements, myoclonies. <span class="badge bg-dark float-end">SFPT</span></div>`, 'interact');

        let bradyMeds = activeMeds.filter(m => sanitizeText(m.classe).includes('beta') || ['diltiazem', 'verapamil', 'amiodarone', 'donepezil', 'rivastigmine', 'galantamine', 'digoxine'].some(x => sanitizeText(m.dci).includes(x)));
        if(bradyMeds.length >= 2) addAlert(divInteract, `<div class="alert alert-warning border-warning shadow-sm"><strong>⚡ Bradycardie Cumulée (Risque de BAV)</strong><br><em>Cumul :</em> <b>${bradyMeds.map(m=>m.dci).join(', ')}</b>. Contrôle ECG recommandé. <span class="badge bg-dark float-end">ESC</span></div>`, 'interact');

        let hasBZD = patientHasMedClass('benzodiazepine') || patientHasMedClass('hypnotique');
        let nbAntiHTA = (patientHasMedClass('iec')?1:0) + (patientHasMedClass('ara2')?1:0) + (patientHasMedClass('beta')?1:0) + (patientHasMedClass('thiazid')?1:0) + (patientHasMedClass('ca')?1:0) + (patientHasMedClass('arni')?1:0);
        if ((isFragile || getVal('scoreCFS') >= 6) && nbAntiHTA >= 3) addAlert(divUsage, `<div class="alert alert-warning shadow-sm"><strong>🎯 Cible Tensionnelle Adaptative (Frail-BP)</strong><br>Sujet fragile sous polythérapie anti-hypertensive. Tolérer une PAS jusqu'à 150 mmHg. <span class="badge bg-dark float-end">ESC 2024</span></div>`, 'usage');

        if (hasBZD && nbAntiHTA >= 1 && patientHasMedClass('antidepresseur')) addAlert(divEviter, `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ "Cocktail Chuteur" (BZD + Anti-HTA + Antidépresseur)</strong><br>Le cumul majore drastiquement le risque de fracture du col du fémur. <span class="badge bg-dark float-end">STOPP v3</span></div>`, 'eviter');
        if (hasComorb('DEMENCE') && (patientHasMedClass('anticoagulant') || patientHasMedClass('antiagreg'))) addAlert(divInteract, `<div class="alert alert-info border-info shadow-sm"><strong>🧠 Risque Hémorragique Cérébral (Chutes)</strong><br>Patient dément sous antithrombotiques. Risque d'hématome sous-dural sur chute. <span class="badge bg-dark float-end">SFGG</span></div>`, 'interact');

        let medsBhe = infoACB_global.filter(i => i.includes('BHE+')).map(i => i.split(' ')[0]);
        if (medsBhe.length > 0 && hasComorb('DEMENCE')) addAlert(divEviter, `<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Toxicité Anticholinergique Centrale (BHE+)</strong><br>Prescrits chez un Dément : <b>${medsBhe.join(', ')}</b>. Risque absolu de délirium. <span class="badge bg-dark float-end">AGS Beers</span></div>`, 'eviter');

        if(patientHasMedClass('achei') && scoreACB_global >= 1) addAlert(divInteract, `<div class="alert alert-danger border-danger shadow-sm"><strong>🛑 Antagonisme Pharmacodynamique Démentiel</strong><br>Pro-cholinergique AVEC charge anticholinergique (Score ACB = ${scoreACB_global}). Vous annulez l'effet du traitement neurocognitif. <span class="badge bg-dark float-end">SFGG</span></div>`, 'interact');
        if(patientHasMedClass('diuretique') && patientHasMedClass('antispasmodique')) addAlert(divInteract, `<div class="alert alert-danger border-danger shadow-sm"><strong>🛑 "Vessie Claquée" (Antagonisme Urinaire)</strong><br>Diurétique (force remplissage) AVEC antispasmodique (empêche vidange). <span class="badge bg-dark float-end">STOPP</span></div>`, 'interact');
        if (patientHasMedClass('opiac') && !patientHasMedClass('laxatif')) addAlert(divInitier, `<div class="alert alert-success alert-start shadow-sm"><strong>Omission : Couverture Laxative</strong><br>Tout opiacé doit être assorti d'un laxatif osmotique pour prévenir le fécalome. <span class="badge bg-dark float-end">SFAP</span></div>`, 'initier');

        let zDrugs = activeMeds.filter(m => sanitizeText(m.dci).includes('zolpidem') || sanitizeText(m.dci).includes('zopiclone'));
        if (zDrugs.length > 0) addAlert(divEviter, `<div class="alert alert-secondary border-secondary text-secondary shadow-sm"><strong>😴 Z-Drugs Chroniques</strong><br>L'efficacité sur le sommeil s'épuise en 4 semaines. Au long cours, risque de chutes. Discuter décroissance. <span class="badge bg-dark float-end">HAS</span></div>`, 'eviter');
    } catch(e) { console.error("Erreur Meta", e); }

    // =========================================================================
    // 🧠 5. SCORES INTERACTIFS COMPLETS
    try {
        let scoreCha = 0; let ttCha = [];
        if(patientAge >= 75) { scoreCha += 2; ttCha.push("Âge ≥75 (+2)"); } else if(patientAge >= 65) { scoreCha += 1; ttCha.push("Âge ≥65 (+1)"); }
        if(sexe === 'F') { scoreCha += 1; ttCha.push("Sexe F (+1)"); }
        if(hasAnyIC) { scoreCha += 1; ttCha.push("IC (+1)"); }
        if(hasComorb('HTA') || isChecked('chkHtaNonControlee')) { scoreCha += 1; ttCha.push("HTA (+1)"); }
        if(hasComorb('DIABETE')) { scoreCha += 1; ttCha.push("Diabète (+1)"); }
        if(hasComorb('AVC') || isChecked('chkAvc')) { scoreCha += 2; ttCha.push("ATCD AVC/AIT (+2)"); } 
        if(hasComorb('POST_SCA') || isChecked('chkScaAigu') || hasComorb('AOMI')) { scoreCha += 1; ttCha.push("Vasc (+1)"); }
        let tooltipCha = ttCha.length ? ttCha.join(' | ') : 'Aucun critère actif';
        if(divScores) divScores.innerHTML += `<div class="alert alert-light border border-info mb-2 shadow-sm"><strong class="text-info tooltip-custom" data-bs-toggle="tooltip" data-bs-placement="top" title="${tooltipCha}">CHA₂DS₂-VASc : ${scoreCha} point(s)</strong><br><small>${scoreCha === 0 ? 'Risque faible.' : scoreCha === 1 ? 'Risque modéré.' : 'Risque élevé. Anticoagulation recommandée.'}</small></div>`;

        let scoreHas = 0; let ttHas = [];
        if(isChecked('chkHtaNonControlee')) { scoreHas += 1; ttHas.push("HTA non contrôlée (+1)"); }
        if((bioPatient.DFG > 0 && bioPatient.DFG < 50) || isChecked('chkDialyse')) { scoreHas += 1; ttHas.push("IRC (+1)"); }
        if(isChecked('chkFoie')) { scoreHas += 1; ttHas.push("Foie (+1)"); }
        if(hasComorb('AVC') || isChecked('chkAvc')) { scoreHas += 1; ttHas.push("ATCD AVC (+1)"); }
        if(isChecked('chkSaignement')) { scoreHas += 1; ttHas.push("Saignement (+1)"); }
        if(patientAge > 65) { scoreHas += 1; ttHas.push("Âge >65 (+1)"); }
        if(patientHasMedClass('AINS') || patientHasMedClass('ANTIAGREG')) { scoreHas += 1; ttHas.push("AINS/AAS (+1)"); }
        if(isChecked('chkAlcool')) { scoreHas += 1; ttHas.push("Alcool (+1)"); }
        let tooltipHas = ttHas.length ? ttHas.join(' | ') : 'Aucun critère actif';
        if(divScores) divScores.innerHTML += `<div class="alert alert-light border border-danger mb-2 shadow-sm"><strong class="text-danger tooltip-custom" data-bs-toggle="tooltip" data-bs-placement="top" title="${tooltipHas}">HAS-BLED : ${scoreHas} point(s)</strong><br><small>${scoreHas >= 3 ? '⚠️ Risque hémorragique élevé (≥3).' : 'Risque faible.'}</small></div>`;

        let scoreOrbit = 0; let ttOrbit = [];
        if(patientAge >= 75) { scoreOrbit += 1; ttOrbit.push("Âge ≥75 (+1)"); }
        if(bioPatient.Hb > 0 && ((sexe === 'M' && bioPatient.Hb < 13) || (sexe === 'F' && bioPatient.Hb < 12))) { scoreOrbit += 2; ttOrbit.push("Anémie (+2)"); }
        if(isChecked('chkSaignement')) { scoreOrbit += 2; ttOrbit.push("Saignement (+2)"); }
        if(bioPatient.DFG > 0 && bioPatient.DFG < 60) { scoreOrbit += 1; ttOrbit.push("DFG <60 (+1)"); }
        if(patientHasMedClass('ANTIAGREG')) { scoreOrbit += 1; ttOrbit.push("Antiagrégant (+1)"); }
        let tooltipOrbit = ttOrbit.length ? ttOrbit.join(' | ') : 'Aucun critère actif';
        if(divScores) divScores.innerHTML += `<div class="alert alert-light border border-warning mb-2 shadow-sm"><strong class="text-warning tooltip-custom" data-bs-toggle="tooltip" data-bs-placement="top" title="${tooltipOrbit}">ORBIT-AF : ${scoreOrbit} point(s)</strong><br><small>${scoreOrbit >= 4 ? '⚠️ Risque élevé.' : 'Risque faible.'}</small></div>`;

        let colorACB = scoreACB_global >= 4 ? "danger" : (scoreACB_global > 0 ? "warning" : "success"); let colorCIA = scoreCIA_global > 5 ? "danger" : (scoreCIA_global > 0 ? "warning" : "success");
        if(divScores) divScores.innerHTML += `<div class="alert alert-light border border-secondary mb-2 shadow-sm" id="alert-ach"><strong>🧠 Scores Anticholinergiques : ACB = ${scoreACB_global} | CIA = ${scoreCIA_global}</strong><br><span class="text-${colorACB}">• Échelle ACB : <b>${scoreACB_global} point(s)</b></span> <small class="text-muted">${infoACB_global.length ? '('+infoACB_global.join(', ')+')' : '(Aucun)'}</small><br><span class="text-${colorCIA}">• Échelle CIA : <b>${scoreCIA_global} point(s)</b></span> <small class="text-muted">${infoCIA_global.length ? '('+infoCIA_global.join(', ')+')' : '(Aucun)'}</small></div>`;

        let scoreRisq = 0; let ttRisq = [];
        if(patientAge >= 65) { scoreRisq += 1; ttRisq.push("Âge ≥65 (+1)"); }
        if(sexe === 'F') { scoreRisq += 1; ttRisq.push("Femme (+1)"); }
        if(bioPatient.BMI >= 30) { scoreRisq += 1; ttRisq.push("Obésité (+1)"); }
        if(bioPatient.K > 0 && bioPatient.K <= 3.5) { scoreRisq += 2; ttRisq.push("HypoK (+2)"); }
        if(bioPatient.Ca > 0 && bioPatient.Ca < 2.15) { scoreRisq += 2; ttRisq.push("HypoCa (+2)"); }
        if(bioPatient.DFG > 0 && bioPatient.DFG <= 30) { scoreRisq += 2; ttRisq.push("IRC Sévère (+2)"); }
        if(bioPatient.CRP > 5) { scoreRisq += 1; ttRisq.push("Inflammation (+1)"); }
        if(hasComorb('HTA') || hasAnyIC) { scoreRisq += 1; ttRisq.push("HTA/IC (+1)"); }
        if(hasComorb('FA') || hasComorb('ARRHYTHMIE')) { scoreRisq += 1; ttRisq.push("FA (+1)"); }
        if(isChecked('chkFoie')) { scoreRisq += 1; ttRisq.push("Hépatopathie (+1)"); }
        if(hasComorb('DEMENCE') || hasComorb('PARKINSON')) { scoreRisq += 1; ttRisq.push("Démence/Park (+1)"); }
        if(globalQT_CountKR > 0) { scoreRisq += (3 * globalQT_CountKR); ttRisq.push(`Médoc Risque Connu (+${3*globalQT_CountKR})`); }
        if(globalQT_CountCR_PR > 0) { scoreRisq += (1 * globalQT_CountCR_PR); ttRisq.push(`Médoc Risque Possible (+${1*globalQT_CountCR_PR})`); }
        let tooltipRisq = ttRisq.length ? ttRisq.join(' | ') : 'Aucun critère actif';
        if(divScores) divScores.innerHTML += `<div class="alert alert-light border border-primary mb-2 shadow-sm"><strong class="text-primary tooltip-custom" data-bs-toggle="tooltip" data-bs-placement="top" title="${tooltipRisq}">RISQ-PATH Score : ${scoreRisq} point(s)</strong><br><small>${scoreRisq < 10 ? 'Risque Faible (<10)' : '⚠️ Risque Élevé (≥10). ECG de contrôle recommandé.'}</small></div>`;

        let scoreMayo = 0; let ttMayo = [];
        if(sexe === 'F') { scoreMayo++; ttMayo.push("Femme (+1)"); }
        if(isChecked('chkScaAigu')) { scoreMayo++; ttMayo.push("SCA (+1)"); }
        if(isChecked('chkAnorexie')) { scoreMayo++; ttMayo.push("Anorexie (+1)"); }
        if(isChecked('chkBrady')) { scoreMayo++; ttMayo.push("Bradycardie (+1)"); }
        if(hasAnyIC) { scoreMayo++; ttMayo.push("IC (+1)"); }
        if(hasComorb('DIABETE')) { scoreMayo++; ttMayo.push("Diabète (+1)"); }
        if(hasComorb('CMH')) { scoreMayo++; ttMayo.push("CMH (+1)"); }
        if(isChecked('chkLqts')) { scoreMayo++; ttMayo.push("LQTS (+1)"); }
        if(isChecked('chkDialyse')) { scoreMayo++; ttMayo.push("Dialyse (+1)"); }
        if(isChecked('chkArret')) { scoreMayo++; ttMayo.push("Arrêt cardiaque (+1)"); }
        if(isChecked('chkAvc')) { scoreMayo++; ttMayo.push("AVC (+1)"); }
        if(bioPatient.K > 0 && bioPatient.K < 3.6) { scoreMayo++; ttMayo.push("HypoK (+1)"); }
        if(bioPatient.Ca > 0 && bioPatient.Ca < 2.15) { scoreMayo++; ttMayo.push("HypoCa (+1)"); }
        if(bioPatient.Mg > 0 && bioPatient.Mg < 0.70) { scoreMayo++; ttMayo.push("HypoMg (+1)"); }
        if((globalQT_CountKR + globalQT_CountCR_PR) >= 1) { scoreMayo++; ttMayo.push("Médicament QT (+1)"); }
        let tooltipMayo = ttMayo.length ? ttMayo.join(' | ') : 'Aucun critère actif';
        if(divScores) divScores.innerHTML += `<div class="alert alert-light border border-dark mb-2 shadow-sm"><strong class="text-dark tooltip-custom" data-bs-toggle="tooltip" data-bs-placement="top" title="${tooltipMayo}">Mayo Clinic pro-QTc Score : ${scoreMayo} point(s)</strong><br><small>Évalue le risque de mortalité si le QTc > 500 ms.</small></div>`;

        let qtcBase = getVal('bioQtc');
        let scoreTisdale = 0; let ttTisdale = [];
        if(patientAge >= 68) { scoreTisdale += 1; ttTisdale.push("Âge ≥68 (+1)"); }
        if(sexe === 'F') { scoreTisdale += 1; ttTisdale.push("Femme (+1)"); }
        if(patientHasMedClass('DIURETIQUES_ANSE')) { scoreTisdale += 1; ttTisdale.push("Diurétique Anse (+1)"); }
        if(bioPatient.K > 0 && bioPatient.K <= 3.5) { scoreTisdale += 2; ttTisdale.push("HypoK (+2)"); }
        if(qtcBase >= 450) { scoreTisdale += 2; ttTisdale.push("QTc ≥450 (+2)"); }
        if(isChecked('chkScaAigu')) { scoreTisdale += 2; ttTisdale.push("SCA (+2)"); }
        if(isChecked('chkSepsis')) { scoreTisdale += 1; ttTisdale.push("Sepsis (+1)"); }
        if(hasAnyIC) { scoreTisdale += 1; ttTisdale.push("IC (+1)"); }
        if((globalQT_CountKR + globalQT_CountCR_PR) > 0) { scoreTisdale += 3; ttTisdale.push("Médoc QT (+3)"); }
        let tooltipTisdale = ttTisdale.length ? ttTisdale.join(' | ') : 'Aucun critère actif';
        if(divScores) divScores.innerHTML += `<div class="alert alert-light border border-dark mb-2 shadow-sm"><strong class="text-dark tooltip-custom" data-bs-toggle="tooltip" data-bs-placement="top" title="${tooltipTisdale}">Score de Tisdale : ${scoreTisdale} point(s)</strong><br><small>${scoreTisdale <= 6 ? 'Risque Faible (≤6)' : scoreTisdale <= 10 ? 'Risque Modéré (7-10).' : '⚠️ Risque Élevé (≥11).'}</small></div>`;

        let medSafetyHtml = maxQTLevel_global === 2 ? `<span class="text-danger"><b>ÉLEVÉ</b> (Risque connu)</span>` : (maxQTLevel_global === 1 ? `<span class="text-warning"><b>MODÉRÉ</b></span>` : `<span class="text-success"><b>FAIBLE</b></span>`);
        if(divScores) divScores.innerHTML += `<div class="alert alert-light border border-dark mb-2 shadow-sm"><strong>⚡ MedSafety Scan (CredibleMeds) : ${medSafetyHtml}</strong><br><small>${infoQT_global.length ? 'Molécules : ' + infoQT_global.join(', ') : 'Aucun médicament QT détecté.'}</small></div>`;
    } catch(e) { console.error("Erreur Scores", e); }

    // =========================================================================
    // 🧠 6. INTERACTIONS CLASSIQUES, ANSM ET GPT_DDI (AVEC REGROUPEMENT INTELLIGENT)
    const getEnRoots = (dci) => {
        let s = sanitizeText(dci); let roots = [s];
        if (s.includes('rifampic')) roots.push('rifampin', 'rifampicin');
        if (s.includes('quetiap')) roots.push('quetiapine', 'quetiapin');
        if (s.includes('clarithromyc')) roots.push('clarithromycin');
        if (s.includes('statin')) roots.push(s.replace('statine', 'statin'));
        if (s.includes('amiodaron')) roots.push('amiodarone');
        return roots;
    };

    try {
        // Regroupement ANSM (Dédoublonnage sur la sémantique)
        let groupedAnsm = {};
        if(typeof ANSM_DDI_DB !== 'undefined') {
            for(let i=0; i<activeMeds.length; i++) {
                for(let j=i+1; j<activeMeds.length; j++) {
                    let mA = activeMeds[i], mB = activeMeds[j];
                    ANSM_DDI_DB.forEach(d => {
                        if ((medMatchesAnsmTerm(mA, d.d1) && medMatchesAnsmTerm(mB, d.d2)) || (medMatchesAnsmTerm(mA, d.d2) && medMatchesAnsmTerm(mB, d.d1))) {
                            let pairName = `${mA.dci.toUpperCase()} + ${mB.dci.toUpperCase()}`;
                            if(!groupedAnsm[pairName]) groupedAnsm[pairName] = { isDanger: false, raw: [] };
                            
                            let isDanger = String(d.level).includes("CONTRE-INDICATION");
                            if(isDanger) groupedAnsm[pairName].isDanger = true;
                            
                            let isDup = false;
                            // Concepts clés pour éviter de répéter deux fois "Risque de torsades de pointes..."
                            let concepts = ["torsade", "hyperkali", "bradycardi", "hypotension", "sédat", "sérotonin", "hémorrag", "lithémie", "convuls", "myopathie", "rhabdomyolyse", "allongement de l'intervalle qt"];
                            let matchedConcept = concepts.find(c => String(d.desc).toLowerCase().includes(c));

                            for (let ex of groupedAnsm[pairName].raw) {
                                let exDesc = String(ex.desc).toLowerCase();
                                if (exDesc === String(d.desc).toLowerCase() || exDesc.includes(String(d.desc).toLowerCase()) || String(d.desc).toLowerCase().includes(exDesc)) { 
                                    isDup = true; 
                                    if(isDanger && !String(ex.level).includes("CONTRE-INDICATION")) { ex.level = d.level; ex.desc = d.desc; }
                                    break; 
                                }
                                if (matchedConcept && exDesc.includes(matchedConcept)) {
                                    if (isDanger && !String(ex.level).includes("CONTRE-INDICATION")) { ex.level = d.level; ex.desc = d.desc; }
                                    isDup = true;
                                    break;
                                }
                            }
                            if (!isDup) groupedAnsm[pairName].raw.push({ level: d.level, desc: d.desc, isDanger: isDanger });
                        }
                    });
                }
            }
        }
        
        // Affichage des encadrés ANSM regroupés
        for (const [pair, data] of Object.entries(groupedAnsm)) {
            let boxClass = data.isDanger ? "danger alert-stopp" : "warning";
            let mainIcon = data.isDanger ? "🚨" : "⚡";
            let itemsHtml = data.raw.map(x => {
                let textColor = x.isDanger ? "text-danger" : "text-dark";
                let icon = x.isDanger ? "🔴" : "🟠";
                return `<li style="margin-bottom: 6px;"><span class="${textColor} fw-bold">${icon} ${x.level}</span><br><span class="small text-muted">${x.desc}</span></li>`;
            }).join('');
            
            let html = `<div class="alert alert-${boxClass} shadow-sm">
                <strong style="font-size:1.05em;">${mainIcon} Risques ANSM : ${pair}</strong>
                <hr class="mt-2 mb-2" style="opacity:0.15;">
                <ul class="mb-0 ps-3">
                    ${itemsHtml}
                </ul>
            </div>`;
            addAlert(divAnsm, html, 'ansm');
        }

        // Regroupement GPT DDI
        let groupedInteract = {};
        if(typeof GPT_DDI_DB !== 'undefined') {
            for(let i=0; i<activeMeds.length; i++) {
                for(let j=i+1; j<activeMeds.length; j++) {
                    let mA = activeMeds[i], mB = activeMeds[j];
                    let rootsA = getEnRoots(mA.dci); let rootsB = getEnRoots(mB.dci);
                    
                    GPT_DDI_DB.forEach(d => {
                        if (!d || !d.d1 || !d.d2) return;
                        let d1 = sanitizeText(d.d1); let d2 = sanitizeText(d.d2);
                        
                        let aIsD1 = rootsA.some(r => r === d1 || r.includes(d1) || d1.includes(r));
                        let bIsD2 = rootsB.some(r => r === d2 || r.includes(d2) || d2.includes(r));
                        let bIsD1 = rootsB.some(r => r === d1 || r.includes(d1) || d1.includes(r));
                        let aIsD2 = rootsA.some(r => r === d2 || r.includes(d2) || d2.includes(r));
                        
                        if ((aIsD1 && bIsD2) || (bIsD1 && aIsD2)) {
                            let niveau = String(d.niveau || "Interaction");
                            let isDanger = niveau.toLowerCase().includes("contre-indication") || niveau.toLowerCase().includes("majeure");
                            
                            let pairName = `${mA.dci.toUpperCase()} + ${mB.dci.toUpperCase()}`;
                            if(!groupedInteract[pairName]) groupedInteract[pairName] = { isDanger: false, raw: [] };
                            if(isDanger) groupedInteract[pairName].isDanger = true;
                            
                            let isDup = groupedInteract[pairName].raw.some(ex => ex.event.toLowerCase() === String(d.event).toLowerCase());
                            if(!isDup) groupedInteract[pairName].raw.push({ event: d.event, niveau: niveau, isDanger: isDanger, source: d.source });
                        }
                    });
                }
            }
        }

        // Affichage GPT DDI
        for (const [pair, data] of Object.entries(groupedInteract)) {
            let boxClass = data.isDanger ? "danger alert-stopp" : "warning border-warning";
            let mainIcon = data.isDanger ? "🚨" : "⚡";
            let itemsHtml = data.raw.map(x => {
                let textColor = x.isDanger ? "text-danger" : "text-warning text-dark";
                let icon = x.isDanger ? "🔴" : "🟠";
                let sourceTxt = x.source ? `<span class="badge bg-secondary ms-1" style="font-size:0.7em;">${x.source}</span>` : "";
                return `<li style="margin-bottom: 6px;"><span class="${textColor} fw-bold">${icon} ${x.event}</span> ${sourceTxt}<br><span class="small text-muted">Niveau : ${x.niveau}</span></li>`;
            }).join('');
            
            let html = `<div class="alert alert-${boxClass} shadow-sm">
                <strong style="font-size:1.05em;">${mainIcon} Risques Cliniques (Internationaux) : ${pair}</strong>
                <hr class="mt-2 mb-2" style="opacity:0.15;">
                <ul class="mb-0 ps-3">${itemsHtml}</ul>
            </div>`;
            addAlert(divInteract, html, 'interact');
        }

    } catch(e) { console.error("Erreur Interactions Globales", e); }

    // =========================================================================
    // 🧠 7. MOTEUR PK AVEC BYPASS D'EXPERT ET AGGRÉGATION DES ÉTUDES
    try {
        let groupedAuc = {};
        if (typeof DDI_AUC_DB !== 'undefined') {
            for(let i=0; i<activeMeds.length; i++) {
                for(let j=i+1; j<activeMeds.length; j++) {
                    let mA = activeMeds[i], mB = activeMeds[j];
                    let rootsA = getEnRoots(mA.dci); let rootsB = getEnRoots(mB.dci);
                    let pairName = `${mA.dci.toUpperCase()} + ${mB.dci.toUpperCase()}`;
                    
                    let matches = DDI_AUC_DB.filter(d => {
                        if (!d || !d.perpetrator || !d.victim) return false;
                        let p = sanitizeText(String(d.perpetrator)); let v = sanitizeText(String(d.victim));
                        if (p === "" || v === "") return false;

                        let aIsP = rootsA.some(r => r === p || r.includes(p) || p.includes(r));
                        let bIsV = rootsB.some(r => r === v || r.includes(v) || v.includes(r));
                        let bIsP = rootsB.some(r => r === p || r.includes(p) || p.includes(r));
                        let aIsV = rootsA.some(r => r === v || r.includes(v) || v.includes(r));
                        return (aIsP && bIsV) || (bIsP && aIsV);
                    });

                    // Bypass experts (Ajout des données FDA/RCP absentes des modèles statiques de base)
                    let isRifQuet = (rootsA.includes('rifampin') && rootsB.includes('quetiapine')) || (rootsB.includes('rifampin') && rootsA.includes('quetiapine'));
                    let isRitQuet = (rootsA.includes('ritonavir') && rootsB.includes('quetiapine')) || (rootsB.includes('ritonavir') && rootsA.includes('quetiapine'));
                    let isClariQuet = (rootsA.includes('clarithromycin') && rootsB.includes('quetiapine')) || (rootsB.includes('clarithromycin') && rootsA.includes('quetiapine'));

                    if (isRifQuet && !matches.some(m => String(m.auc_ratio) === "0.13")) matches.push({ auc_ratio: 0.13, mechanism: "Induction enzymatique puissante (CYP3A4)", note: "Littérature (Modèle Statique FDA)" });
                    if (isRitQuet && !matches.some(m => String(m.auc_ratio) === "6.2")) matches.push({ auc_ratio: 6.2, mechanism: "Inhibition enzymatique puissante (CYP3A4) : Surdosage clinique grave.", note: "Monographie (RCP) / FDA" });
                    if (isClariQuet && !matches.some(m => String(m.auc_ratio) === "2.8")) matches.push({ auc_ratio: 2.8, mechanism: "Inhibition enzymatique forte (CYP3A4) : Surdosage significatif (Risque Torsade de Pointes).", note: "Littérature PK" });

                    if (matches.length > 0) {
                        groupedAuc[pairName] = { items: [] };
                        matches.forEach(m => {
                            if(!isNaN(parseFloat(m.auc_ratio))) groupedAuc[pairName].items.push(m);
                        });
                    }
                }
            }
        }
        
        for (const [pair, data] of Object.entries(groupedAuc)) {
            if(data.items.length === 0) continue;
            
            // On dédoublonne sur la valeur ratio exacte pour ne pas spammer si la base contient 3x la même étude
            let uniqueItems = [];
            data.items.forEach(item => {
                if(!uniqueItems.some(u => parseFloat(u.auc_ratio) === parseFloat(item.auc_ratio))) uniqueItems.push(item);
            });
            
            let maxRatio = Math.max(...uniqueItems.map(m => parseFloat(m.auc_ratio)));
            let minRatio = Math.min(...uniqueItems.map(m => parseFloat(m.auc_ratio)));
            let isDanger = maxRatio >= 5 || minRatio <= 0.2;
            let isWarning = (maxRatio >= 2 && maxRatio < 5) || (minRatio <= 0.5 && minRatio > 0.2);
            let color = isDanger ? "danger alert-stopp" : (isWarning ? "warning border-warning" : "info border-info");
            
            let detailsHtml = uniqueItems.map(m => {
                let ratio = parseFloat(m.auc_ratio);
                let txtRatio = ratio < 1 ? `x${ratio} (Baisse de ${Math.round((1-ratio)*100)}%)` : `x${ratio} (Hausse de ${Math.round((ratio-1)*100)}%)`;
                let src = m.source || (m.note ? m.note : "Étude PK / Base DDI_AUC");
                let icon = (ratio >= 5 || ratio <= 0.2) ? "🔴" : ((ratio >= 2 || ratio <= 0.5) ? "🟠" : "🔵");
                return `<li style="margin-bottom:6px;"><span class="fw-bold">${icon} Ratio ${txtRatio}</span><br><em class="text-muted small">${m.mechanism}</em> <span class="badge bg-secondary ms-1" style="font-size:0.65em;">${src}</span></li>`;
            }).join('');

            addAlert(divAuc, `<div class="alert alert-${color} shadow-sm">
                <strong style="font-size:1.05em;">📈 Multi-Évaluations PK (AUC) : ${pair}</strong>
                <hr class="mt-2 mb-2" style="opacity:0.15;">
                <ul class="mb-0 ps-3">${detailsHtml}</ul>
            </div>`, 'auc');
        }
    } catch(e) { console.error("Erreur PK AUC", e); }

    // =========================================================================
    // 🧠 8. POSOLOGIES ET SUIVI BIOLOGIQUE CUMULATIF ET DÉBLOQUÉ
    try {
        activeMeds.forEach(m => {
            let isATB = (typeof ATB_DB !== 'undefined') && ATB_DB.some(a => a.nom_affichage === m.core_id || a.nom_affichage === m.dci);
            if(isATB) return; 

            let posHab = null, posGer = null, posNotes = null;
            let sourcePoso = "";

            // Priorité absolue à votre nouvelle base robuste POSOLOGIE_DB
            if (typeof POSOLOGIE_DB !== 'undefined') {
                let match = POSOLOGIE_DB.find(p => sanitizeText(p.medicament).includes(sanitizeText(m.dci)) || sanitizeText(m.dci).includes(sanitizeText(p.medicament)));
                if (match) {
                    posHab = match.posologie_adulte;
                    posGer = match.posologie_sujet_age;
                    posNotes = match.notes_cliniques;
                    sourcePoso = match.source;
                }
            }
            
            // Si le médicament n'est pas dans la nouvelle base, on fouille dans les anciennes données QT
            if(!posHab && !posGer) {
                let row = typeof GERIA_DB !== 'undefined' && GERIA_DB.medica_qt ? GERIA_DB.medica_qt.find(q => sanitizeText(q["DCI (Molécule)"] || q["DCI"] || "").includes(sanitizeText(m.dci))) : null;
                if(row) {
                    let keyHab = Object.keys(row).find(k => k && k.toLowerCase().includes("habituelle")); 
                    let keyGer = Object.keys(row).find(k => k && (k.toLowerCase().includes("gériatrique") || k.toLowerCase().includes("geriatrique"))); 
                    let keyRen = Object.keys(row).find(k => k && (k.toLowerCase().includes("rénale") || k.toLowerCase().includes("renale")));
                    posHab = keyHab ? row[keyHab] : null; 
                    posGer = keyGer ? row[keyGer] : null; 
                    if (keyRen && row[keyRen] && row[keyRen] !== "NA") {
                        posNotes = "Adaptation Rénale : " + row[keyRen];
                    }
                }
            }

            let hasPoso = (posGer && posGer !== "NA" && posGer !== "") || (posHab && posHab !== "NA" && posHab !== "") || (posNotes && posNotes !== "NA" && posNotes !== "");
            let hasAlb = m.albumine >= 85; 

            if(hasPoso || hasAlb) {
                let html = `<div class="alert alert-success border border-success shadow-sm"><strong class="text-success">💊 Posologies & PK : ${m.dci.toUpperCase()}</strong>`;
                if(sourcePoso) html += ` <span class="badge bg-secondary ms-1 float-end" style="font-size:0.65em;">${sourcePoso}</span>`;
                html += `<br>`;
                
                if(hasPoso) {
                    if(posHab && posHab !== "NA" && posHab !== "") html += `<em>Standard :</em> ${posHab}<br>`;
                    if(posGer && posGer !== "NA" && posGer !== "") {
                         // L'IA lit votre texte : si elle voit des mots liés au rein ET que le patient est IRC, ça passe au rouge !
                         let isRenalDanger = (bioPatient.DFG > 0 && bioPatient.DFG < 60) && (posGer.toLowerCase().includes('dfg') || posGer.toLowerCase().includes('rénal') || posGer.toLowerCase().includes('renal') || posGer.toLowerCase().includes('clairance') || posGer.toLowerCase().includes('créatinine'));
                         html += `<span class="${isRenalDanger ? 'text-danger fw-bold' : 'text-dark'}"><em>👴 Gériatrique / Rénal :</em> <b>${posGer}</b></span><br>`;
                    }
                    if(posNotes && posNotes !== "NA" && posNotes !== "") html += `<span class="text-dark small"><em>📝 Notes :</em> ${posNotes}</span><br>`;
                }
                if(hasAlb) html += `<span class="text-danger small d-block border-top pt-1 mt-1 border-success border-opacity-25"><em>🩸 Forte liaison à l'albumine :</em> <b>${m.albumine}%</b> (Risque de surdosage si hypoalbuminémie < 35 g/L).</span>`;
                html += `</div>`; 
                addAlert(divUsage, html, 'usage');
            }
        });

        const fixEncoding = (str) => {
            if(!str) return "";
            return String(str).replace(/calcmie/gi, "calcémie").replace(/cratinine/gi, "créatinine").replace(/svre/gi, "sévère")
                      .replace(/hpatique/gi, "hépatique").replace(/glycmie/gi, "glycémie").replace(/mchoire/gi, "mâchoire")
                      .replace(/fmorale/gi, "fémorale").replace(/ostoncrose/gi, "ostéonécrose").replace(/symptmes/gi, "symptômes")
                      .replace(/arrt/gi, "arrêt").replace(/immdiat/gi, "immédiat").replace(/valuation/gi, "évaluation")
                      .replace(/dyskinsie/gi, "dyskinésie").replace(/thrapeutique/gi, "thérapeutique").replace(/spcifique/gi, "spécifique")
                      .replace(/systmatique/gi, "systématique").replace(/prolong/gi, "prolongé").replace(/rnal/gi, "rénal")
                      .replace(/altration/gi, "altération").replace(/hmatologique/gi, "hématologique").replace(/amnorrhe/gi, "aménorrhée")
                      .replace(/ilus/gi, "iléus").replace(/atnolol/gi, "aténolol").replace(/phosphatmie/gi, "phosphatémie")
                      .replace(/zoldronique/gi, "zolédronique").replace(/risdronate/gi, "risédronate").replace(/uricmie/gi, "uricémie")
                      .replace(/dcd/gi, "décès").replace(/kalimie/gi, "kaliémie").replace(/hyponatrmie/gi, "hyponatrémie")
                      .replace(/\s*\?\s*/g, " ➔ ");
        };

        const formatSuiviList = (str, isAlert=false) => {
            if(!str || String(str).trim() === "") return "<span class='text-muted small'>Non spécifié</span>";
            let fixedStr = fixEncoding(str);
            let items = fixedStr.split('|').map(x => x.trim()).filter(x => x !== "");
            if(items.length === 1) return `<span class="text-dark">${items[0]}</span>`;
            return `<ul class="mb-0 ps-3 text-dark">` + items.map(x => `<li style="margin-bottom:3px;">${x}</li>`).join('') + `</ul>`;
        };

        // 1. Suivis issus du CSV
        if (typeof SUIVI_BIOLOGIQUE_DB !== 'undefined') {
            activeMeds.forEach(m => {
                let mDciClean = sanitizeText(m.dci);
                let match = SUIVI_BIOLOGIQUE_DB.find(row => mDciClean.includes(sanitizeText(String(row.medicament))) || sanitizeText(String(row.medicament)).includes(mDciClean));
                if (match) {
                    let sHtml = `<div class="alert alert-light border border-primary shadow-sm"><strong class="text-primary" style="font-size:1.05em;">👁️ Protocole de Suivi : ${String(match.medicament).toUpperCase()}</strong><hr class="mt-2 mb-2" style="opacity:0.15;">`;
                    if(match.bilan_initial) sHtml += `<div class="mb-2"><b class="text-dark">Bilan initial (Pré-thérapeutique) :</b><br>${formatSuiviList(match.bilan_initial, false)}</div>`;
                    if(match.suivi_periodique) sHtml += `<div class="mb-2"><b class="text-dark">Suivi régulier (Routine) :</b><br>${formatSuiviList(match.suivi_periodique, false)}</div>`;
                    if(match.alerte_clinique_biologique) sHtml += `<div><b style="color: #d97706;">⚠️ À surveiller (et conduite à tenir si apparition) :</b><br>${formatSuiviList(match.alerte_clinique_biologique, false)}</div>`;
                    
                    let alertText = fixEncoding(String(match.alerte_clinique_biologique || "") + " " + String(match.suivi_periodique || "")).toLowerCase();
                    let bioConfirmations = []; let checkable = false;
                    
                    if((alertText.includes('cytolyse') || alertText.includes('hépati') || alertText.includes('transaminase'))) {
                        if (bioPatient.Asat > 0 || bioPatient.Alat > 0) checkable = true;
                        if (bioPatient.Asat > 40 || bioPatient.Alat > 40) {
                            let isSevere = bioPatient.Asat > 120 || bioPatient.Alat > 120;
                            bioConfirmations.push(`🩸 <b>CYTOLYSE CONFIRMÉE CHEZ CE PATIENT ${isSevere ? '(SÉVÈRE)' : ''} :</b> ASAT=${bioPatient.Asat}, ALAT=${bioPatient.Alat} UI/L`);
                        }
                    }
                    if((alertText.includes('qtc') || alertText.includes('qt ') || alertText.includes('torsade'))) {
                        if (bioPatient.QTc > 0) checkable = true;
                        if (bioPatient.QTc >= 450) bioConfirmations.push(`⚡ <b>ALLONGEMENT QTc CONFIRMÉ CHEZ CE PATIENT :</b> ${bioPatient.QTc} ms`);
                    }
                    if((alertText.includes('rénal') || alertText.includes('dfg') || alertText.includes('créatinine') || alertText.includes('clairance'))) {
                        if (bioPatient.DFG > 0) checkable = true;
                        if (bioPatient.DFG > 0 && bioPatient.DFG < 60) bioConfirmations.push(`🧪 <b>INSUFFISANCE RÉNALE ACTIVE :</b> DFG=${bioPatient.DFG} ml/min`);
                    }
                    if(alertText.includes('potassium') || alertText.includes('kaliémie')) {
                        if (bioPatient.K > 0) checkable = true;
                        if(bioPatient.K > 5.0) bioConfirmations.push(`🧪 <b>HYPERKALIÉMIE CONFIRMÉE :</b> ${bioPatient.K} mmol/L`);
                        if(bioPatient.K > 0 && bioPatient.K < 3.5) bioConfirmations.push(`🧪 <b>HYPOKALIÉMIE CONFIRMÉE :</b> ${bioPatient.K} mmol/L`);
                    }
                    if(alertText.includes('sodium') || alertText.includes('natrémie')) {
                        if (bioPatient.Na > 0) checkable = true;
                        if(bioPatient.Na > 0 && bioPatient.Na < 135) bioConfirmations.push(`🧪 <b>HYPONATRÉMIE CONFIRMÉE :</b> ${bioPatient.Na} mmol/L`);
                    }
                    if((alertText.includes('anémie') || alertText.includes('hémoglobine'))) {
                        if (bioPatient.Hb > 0) checkable = true;
                        if(bioPatient.Hb > 0 && ((sexe==='M' && bioPatient.Hb<13) || (sexe==='F' && bioPatient.Hb<12))) bioConfirmations.push(`🩸 <b>ANÉMIE CONFIRMÉE :</b> Hb=${bioPatient.Hb} g/dL`);
                    }
                    if((alertText.includes('thrombopénie') || alertText.includes('plaquette'))) {
                        if (bioPatient.Plaq > 0) checkable = true;
                        if(bioPatient.Plaq > 0 && bioPatient.Plaq < 150) bioConfirmations.push(`🩸 <b>THROMBOPÉNIE CONFIRMÉE :</b> Plaquettes=${bioPatient.Plaq} G/L`);
                    }
                    if((alertText.includes('cpk') || alertText.includes('rhabdomyolyse') || alertText.includes('myalgie') || alertText.includes('musculaire'))) {
                        if (bioPatient.Cpk > 0) checkable = true;
                        if(bioPatient.Cpk > 170) bioConfirmations.push(`💪 <b>HYPER-CPK CONFIRMÉE :</b> ${bioPatient.Cpk} UI/L`);
                    }
                    if((alertText.includes('thyroïd') || alertText.includes('tsh'))) {
                        if (bioPatient.Tsh > 0) checkable = true;
                        if(bioPatient.Tsh > 4.0) bioConfirmations.push(`🦋 <b>HYPOTHYROÏDIE CONFIRMÉE :</b> TSH=${bioPatient.Tsh} mUI/L`);
                        if(bioPatient.Tsh > 0 && bioPatient.Tsh < 0.4) bioConfirmations.push(`🦋 <b>HYPERTHYROÏDIE CONFIRMÉE :</b> TSH=${bioPatient.Tsh} mUI/L`);
                    }
                    
                    if(bioConfirmations.length > 0) {
                        sHtml += `<div class="mt-3 p-2 bg-danger bg-opacity-10 border border-danger text-danger rounded shadow-sm">` + bioConfirmations.join('<br>') + `</div>`;
                    } else if (checkable) {
                        sHtml += `<div class="mt-2 p-1 px-2 bg-success bg-opacity-10 border border-success text-success rounded small shadow-sm">✅ <em>Anomalie(s) ciblée(s) non présente(s) sur la biologie saisie.</em></div>`;
                    }

                    sHtml += `</div>`;
                    addAlert(divSuivi, sHtml, 'suivi');
                }
            });
        }
        
        // 2. Suivis Génériques (S'additionnent TOUJOURS au reste)
        let suiviRules = [];
        if(patientHasMedClass('amiodarone')) suiviRules.push("<b>Amiodarone :</b> Bilan thyroïdien (TSH), Bilan hépatique, ECG (QTc), Rx Thorax 1x/an.");
        if(patientHasMedClass('anticoagulant')) suiviRules.push("<b>Anticoagulants :</b> Fonction rénale min 1x/an, NFS annuelle.");
        if(patientHasMedClass('lithium')) suiviRules.push("<b>Lithium :</b> Lithémie, TSH, Créatininémie, Calcémie.");
        if(patientHasMedClass('diuretique') || patientHasMedClass('iec') || patientHasMedClass('ara2')) suiviRules.push("<b>SRAA / Diurétiques :</b> Ionogramme (K+, Na+) et Créatininémie 7 à 14 jours après modification, puis 1 à 2 fois/an.");
        if(activeMeds.some(m => ['quetiapine', 'risperidone', 'olanzapine', 'clozapine', 'aripiprazole', 'haloperidol'].some(x => sanitizeText(m.dci).includes(x)))) {
            suiviRules.push("<b>Antipsychotiques :</b> Surveillance métabolique (Glycémie à jeun, Bilan lipidique), ECG (QTc) annuel, surveillance du poids.");
        }
        
        if(suiviRules.length > 0) {
            addAlert(divSuivi, `<div class="alert alert-light border border-primary shadow-sm"><strong class="text-primary" style="font-size:1.05em;">👁️ Protocoles de Suivi Standards :</strong><hr class="mt-2 mb-2" style="opacity:0.15;"><ul class="mb-0 ps-3 text-dark">` + suiviRules.map(r => `<li style="margin-bottom:6px;">${r}</li>`).join('') + `</ul></div>`, 'suivi');
        }

    } catch(e) { console.error("Erreur Posologie / Suivi", e); }

    // =========================================================================
    // FINALISATION UI
    if(counts.eviter === 0 && divEviter) divEviter.innerHTML = '<div class="alert alert-light">Aucune prescription inappropriée détectée.</div>';
    if(counts.initier === 0 && divInitier) divInitier.innerHTML = '<div class="alert alert-light">Aucune omission majeure détectée.</div>';
    if(counts.interact === 0 && divInteract) divInteract.innerHTML = '<div class="alert alert-light">Aucune interaction clinique classique détectée.</div>';
    if(counts.ansm === 0 && divAnsm) divAnsm.innerHTML = '<div class="alert alert-light">Aucune interaction du thésaurus ANSM détectée.</div>';
    if(counts.auc === 0 && divAuc) divAuc.innerHTML = '<div class="alert alert-light">Aucune interaction PK chiffrée (AUC) détectée.</div>';
    if(counts.bio === 0 && divBio) divBio.innerHTML = '<div class="alert alert-light">Aucune alerte biologique critique.</div>';
    if(counts.suivi === 0 && divSuivi) divSuivi.innerHTML = '<div class="alert alert-light">Aucun suivi biologique spécifique requis.</div>';

    try {
        let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) { return new bootstrap.Tooltip(tooltipTriggerEl); });
    } catch(e) {}

    let btnPdf = document.getElementById('btnPdf'); if(btnPdf) btnPdf.style.display = 'inline-block';
}

function exporterPDF() {
    const element = document.createElement('div');
    element.style.width = "800px"; element.style.padding = "40px"; element.style.backgroundColor = "white";
    
    let htmlContent = `
        <div style="border-bottom: 3px solid #0d6efd; margin-bottom: 25px; padding-bottom: 10px;">
            <h2 style="color: #0d6efd; margin: 0; font-size: 24px;">Synthèse Pharmaco-Clinique</h2>
            <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 12px;">Généré par GeriaAssist CDSS</p>
        </div>
        <div style="background-color: #f8f9fa; border-left: 4px solid #0d6efd; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
            <p style="margin:0 0 5px 0;"><strong>Patient(e) :</strong> ${document.getElementById('patientAge') ? document.getElementById('patientAge').value : ''} ans</p>
            <p style="margin:0;"><strong>Comorbidités :</strong> ${activeComorbs.length ? activeComorbs.join(', ') : 'Aucune renseignée'}</p>
        </div>
        <h3 style="color: #212529; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px;">Recommandations d'Expert</h3>
    `;

    let alertesHtml = "";
    const divsToCopy = ['alertes-eviter', 'alertes-initier', 'alertes-bio', 'alertes-interact', 'alertes-suivi'];
    divsToCopy.forEach(id => {
        let el = document.getElementById(id);
        if(el && !el.innerHTML.includes('Aucune') && !el.innerHTML.includes('Aucun')) alertesHtml += el.innerHTML;
    });
    
    htmlContent += alertesHtml.replace(/class="alert/g, 'style="margin-bottom:10px; padding:10px; border-radius:5px; border-left:4px solid #aaa; background:#f9f9f9;" class="alert');
    element.innerHTML = htmlContent;
    element.style.position = 'absolute'; element.style.left = '-9999px'; document.body.appendChild(element);
    
    let btn = document.getElementById('btnPdf'); let txtOriginal = btn.innerHTML; btn.innerHTML = "⏳ Génération...";
    const opt = { margin: 10, filename: 'Synthese_GeriaAssist.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    
    html2pdf().set(opt).from(element).save().then(() => { document.body.removeChild(element); btn.innerHTML = txtOriginal; });
}
