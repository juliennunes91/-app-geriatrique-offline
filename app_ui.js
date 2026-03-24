// app_ui.js - V7.0
function initUI() {
    if(typeof MASTER_DB === 'undefined') return;

    // =====================================================================
    // 1. Intégrer les 48 médicaments d'enrichissement dans MASTER_DB
    // =====================================================================
    if (typeof MISSING_MEDS_ENRICHMENT !== 'undefined') {
        MASTER_DB.MEDICAMENTS.push(...MISSING_MEDS_ENRICHMENT);
        console.log(`[ENRICHMENT] ${MISSING_MEDS_ENRICHMENT.length} médicaments ajoutés à MASTER_DB`);
    }

    // =====================================================================
    // 2. DDI_MERGED_DB remplace DDI_DB + DDI_AUC_DB (fichier pré-fusionné)
    // =====================================================================
    if (typeof DDI_MERGED_DB !== 'undefined') {
        console.log(`[DDI] DDI_MERGED_DB chargé : ${DDI_MERGED_DB.length} paires d'interactions AUC`);
    }

    // =====================================================================
    // 3. Enrichir MASTER_DB avec POSOLOGIE_DB, SUIVI_BIOLOGIQUE_DB, ATB_DB
    // =====================================================================
    if (typeof POSOLOGIE_DB !== 'undefined') {
        let enriched = 0;
        POSOLOGIE_DB.forEach(poso => {
            const key = sanitizeText(poso.medicament);
            const match = MASTER_DB.MEDICAMENTS.find(m => sanitizeText(m.dci) === key);
            if (match) {
                if (!match.poso_hab && poso.posologie_adulte) { match.poso_hab = poso.posologie_adulte; enriched++; }
                if (!match.poso_ger && poso.posologie_sujet_age) match.poso_ger = poso.posologie_sujet_age;
                if (!match.notes_cliniques && poso.notes_cliniques) match.notes_cliniques = poso.notes_cliniques;
            }
        });
        console.log(`[POSOLOGIE] ${enriched} médicaments enrichis depuis POSOLOGIE_DB`);
    }

    if (typeof SUIVI_BIOLOGIQUE_DB !== 'undefined') {
        let enriched = 0;
        SUIVI_BIOLOGIQUE_DB.forEach(suivi => {
            const key = sanitizeText(suivi.medicament);
            const match = MASTER_DB.MEDICAMENTS.find(m => sanitizeText(m.dci) === key);
            if (match) {
                if (!match.suivi_initial && suivi.bilan_initial) { match.suivi_initial = suivi.bilan_initial; enriched++; }
                if (!match.suivi_periodique && suivi.suivi_periodique) match.suivi_periodique = suivi.suivi_periodique;
                if (!match.alerte_clinique && suivi.alerte_clinique_biologique) match.alerte_clinique = suivi.alerte_clinique_biologique;
            }
        });
        console.log(`[SUIVI] ${enriched} médicaments enrichis depuis SUIVI_BIOLOGIQUE_DB`);
    }

    if (typeof ATB_DB !== 'undefined') {
        let enriched = 0;
        ATB_DB.forEach(atb => {
            if (!atb.nom_affichage || atb.normale === 'Non spécifié') return;
            const key = sanitizeText(atb.nom_affichage);
            const match = MASTER_DB.MEDICAMENTS.find(m => sanitizeText(m.dci).includes(key) || key.includes(sanitizeText(m.dci)));
            if (match) {
                if (!match.atb_legere && atb.legere && atb.legere !== 'Non spécifié') { match.atb_legere = atb.legere; enriched++; }
                if (!match.atb_moderee && atb.moderee && atb.moderee !== 'Non spécifié') match.atb_moderee = atb.moderee;
                if (!match.atb_severe && atb.severe && atb.severe !== 'Non spécifié') match.atb_severe = atb.severe;
                if (!match.atb_terminale && atb.terminale && atb.terminale !== 'Non spécifié') match.atb_terminale = atb.terminale;
            }
        });
        console.log(`[ATB] ${enriched} antibiotiques enrichis depuis ATB_DB`);
    }

    allComorbs.length = 0; unifiedMedsMap.clear();

    for (const key in MASTER_DB.PATHOLOGIES) {
        let p = MASTER_DB.PATHOLOGIES[key];
        allComorbs.push({ id: p.ID_PATHO, label: p.NOM_STANDARD, search: sanitizeText(p.NOM_STANDARD + " " + p.SYNONYMES) });
    }
    MASTER_DB.MEDICAMENTS.forEach(m => {
        let key = sanitizeText(m.dci);
        if(!key) return;
        unifiedMedsMap.set(key, { dci_pure: m.dci, princeps: m.princeps || "", classe: m.classe || "Médicament", core_id: key, albumine: parseFloat(m.albumine) || 0, db_ref: m });
    });

    setupAutocomplete('inputComorb', 'listComorb', searchComorbList, selectComorb);
    setupAutocomplete('inputMed', 'listMed', searchMedList, selectMed);
}

const getVal = id => { let el = document.getElementById(id); return el && el.value ? parseFloat(el.value.replace(',', '.')) : 0; };
const getStr = id => { let el = document.getElementById(id); return el ? el.value : ""; };
const isChecked = id => { let el = document.getElementById(id); return el ? el.checked : false; };

function calculerDFG(autoSwitch = true) {
    const age = getVal('patientAge'); const poids = getVal('patientPoids'); const creat = getVal('bioCreat'); const sexe = getStr('patientSexe');
    const methodSelect = document.getElementById('dfgMethodSelect'); const dfgInput = document.getElementById('patientDFG');
    if(!methodSelect || !dfgInput) return;
    let cgValue = 0; let ckdEpiValue = 0;
    if (age > 0 && creat > 0) {
        let scrMgDl = creat / 88.4; let kappa = (sexe === 'F') ? 0.7 : 0.9; let alpha = (sexe === 'F') ? -0.241 : -0.302;
        let min = Math.min(scrMgDl / kappa, 1); let max = Math.max(scrMgDl / kappa, 1);
        ckdEpiValue = 142 * Math.pow(min, alpha) * Math.pow(max, -1.200) * Math.pow(0.9938, age) * (sexe === 'F' ? 1.012 : 1);
        if (poids > 0) { let constante = (sexe === 'M') ? 1.23 : 1.04; cgValue = ((140 - age) * poids * constante) / creat; }
    }
    if (autoSwitch && methodSelect.value === 'manuel' && creat > 0 && age > 0) methodSelect.value = poids > 0 ? 'cg' : 'ckdepi';
    
    if (methodSelect.value === 'cg') { 
        if (cgValue > 0) { dfgInput.value = Math.round(cgValue); dfgInput.placeholder = ""; } else dfgInput.value = "";
        dfgInput.className = "form-control fw-bold bg-warning bg-opacity-25 text-dark"; 
    } 
    else if (methodSelect.value === 'ckdepi') { 
        if (ckdEpiValue > 0) { dfgInput.value = Math.round(ckdEpiValue); dfgInput.placeholder = ""; } else dfgInput.value = "";
        dfgInput.className = "form-control fw-bold bg-info bg-opacity-25 text-dark"; 
    } 
    else dfgInput.className = "form-control fw-bold";
}

function setupAutocomplete(inputId, listId, searchFunc, selectFunc) {
    const input = document.getElementById(inputId); const list = document.getElementById(listId);
    if(!input || !list) return;
    input.addEventListener('input', function() {
        const val = this.value.trim(); list.innerHTML = '';
        if(val.length < 2) { list.style.display = 'none'; return; }
        const matches = searchFunc(val);
        if(matches.length > 0) {
            matches.slice(0, 5).forEach(match => {
                let li = document.createElement('li'); li.textContent = match.display;
                li.onclick = () => { input.value = ''; list.style.display = 'none'; selectFunc(match.data); }; list.appendChild(li);
            }); list.style.display = 'block';
        } else list.style.display = 'none';
    });
    document.addEventListener('click', function(e) { if (e.target !== input && e.target !== list) list.style.display = 'none'; });
}

function searchComorbList(val) { const cleanVal = sanitizeText(val); return allComorbs.filter(c => c.search.includes(cleanVal) || c.id.toLowerCase().includes(cleanVal)).map(c => ({display: c.label, data: c.id})); }
function searchMedList(val) {
    const cleanVal = sanitizeText(val); let matches = []; let seenSignatures = new Set(); 
    unifiedMedsMap.forEach((data, key) => { 
        if(key.includes(cleanVal) || sanitizeText(data.princeps).includes(cleanVal)) { 
            let signature = sanitizeText(data.dci_pure);
            if(!seenSignatures.has(signature)) { seenSignatures.add(signature); matches.push({display: `${data.dci_pure}${data.princeps ? ` (${data.princeps})` : ''} - ${data.classe}`, data: data}); }
        } 
    }); return matches;
}

function selectComorb(id) { if(!activeComorbs.includes(id)) { activeComorbs.push(id); renderTags(); } }
function selectMed(data) { if(!activeMeds.some(m => sanitizeText(m.dci) === sanitizeText(data.dci_pure))) { activeMeds.push({ label: data.dci_pure + (data.princeps ? ` (${data.princeps})` : ''), core_id: data.core_id, dci: data.dci_pure, classe: data.classe, albumine: data.albumine || 0, db_ref: data.db_ref }); renderTags(); } }
function addComorbManual() { let input = document.getElementById('inputComorb'); if(!input) return; const val = input.value.trim(); if(val) { let match = searchComorbList(val); if(match.length > 0) selectComorb(match[0].data); } input.value = ''; document.getElementById('listComorb').style.display = 'none'; }
function addMedManual() { let input = document.getElementById('inputMed'); if(!input) return; const val = input.value.trim(); if(val) { let match = searchMedList(val); if(match.length > 0) selectMed(match[0].data); } input.value = ''; document.getElementById('listMed').style.display = 'none'; }
function removeComorb(val) { activeComorbs = activeComorbs.filter(c => c !== val); renderTags(); }
function removeMed(dci) { activeMeds = activeMeds.filter(m => m.dci !== dci); renderTags(); }
function toggleSuspend(dci) {
    let idx = activeMeds.findIndex(m => m.dci === dci);
    if(idx > -1) { window.suspendedMeds.push(activeMeds[idx]); activeMeds.splice(idx, 1); }
    else { let sIdx = window.suspendedMeds.findIndex(m => m.dci === dci); if(sIdx > -1) { activeMeds.push(window.suspendedMeds[sIdx]); window.suspendedMeds.splice(sIdx, 1); } }
    renderTags(); if(typeof analyserPrescription === 'function') analyserPrescription();
}

function renderTags() {
    let elComorb = document.getElementById('selectedComorbs'); let elMeds = document.getElementById('selectedMeds');
    if(elComorb) elComorb.innerHTML = activeComorbs.map(c => { let p = MASTER_DB.PATHOLOGIES[c]; let label = p ? p.NOM_STANDARD : c; return `<span class="badge bg-secondary tag-badge" onclick="removeComorb('${c}')">${label} ✖</span>`; }).join('');
    if(elMeds) {
        let htmlActifs = activeMeds.map(m => `<span class="badge bg-primary tag-badge">${m.label} <span title="Suspendre" onclick="toggleSuspend('${m.dci}')" style="cursor:pointer;">⏸️</span> <span onclick="removeMed('${m.dci}')" style="cursor:pointer; color:#ffcccc;">✖</span></span>`).join('');
        let htmlSuspendus = window.suspendedMeds.map(m => `<span class="badge bg-light text-muted border tag-badge" style="text-decoration: line-through;">${m.label} <span title="Réactiver" onclick="toggleSuspend('${m.dci}')" style="cursor:pointer;">▶️</span> <span onclick="window.suspendedMeds = window.suspendedMeds.filter(x=>x.dci!=='${m.dci}');renderTags();" style="cursor:pointer;">✖</span></span>`).join('');
        elMeds.innerHTML = htmlActifs + htmlSuspendus;
    }
}
function checkFrail() { let el = document.getElementById('patientFragile'); if(el) el.checked = (getVal('scoreCFS') >= 7); }

function toggleCpDetails(val) {
    const block = document.getElementById('cpDetailsBlock');
    if (!block) return;
    if (val === '0') {
        block.style.display = '';
    } else {
        block.style.display = 'none';
        // Also check the hepatopathy checkbox automatically when manually setting Child-Pugh B or C
        if (val === 'B' || val === 'C') {
            let chk = document.getElementById('chkFoie');
            if (chk) chk.checked = true;
        }
    }
}

window.onload = initUI;
