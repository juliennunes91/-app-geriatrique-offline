// app_ui.js - V9.0 (v0.45 — DocumentFragment, a11y, validation feedback)
function initUI() {
    if(typeof MASTER_DB === 'undefined') return;

    // =====================================================================
    // 1. DDI : ddi_general.js (ANSM+BNF fusionnées) + ddi_merged_V2.js (AUC)
    // =====================================================================
    if (typeof DDI_GENERAL_DB !== 'undefined') {
        console.log(`[DDI] DDI_GENERAL_DB chargé : ${DDI_GENERAL_DB.length} interactions (ANSM + BNF/Micromedex fusionnées)`);
    }
    if (typeof DDI_MERGED_DB !== 'undefined') {
        console.log(`[DDI] DDI_MERGED_DB chargé : ${DDI_MERGED_DB.length} paires d'interactions AUC`);
    }

    // POSOLOGIE_DB, SUIVI_BIOLOGIQUE_DB, ATB_DB : données migrées dans MASTER_DB (v0.40)
    // Fichiers renommés posologie_data_old.js, suivi_data_old.js, atb_data_old.js

    allComorbs.length = 0; unifiedMedsMap.clear();

    // Pathologies umbrella masquées du sélecteur : un sous-type plus précis existe
    // et hérite de toute la logique (scores, règles, surveillance). PAT_016 (diabète
    // non précisé) reste défini en base comme clé canonique interne mais n'est plus
    // proposé — préférer DT1 (PAT_016a) ou DT2 (PAT_016b).
    const PATHO_HIDDEN_FROM_PICKER = new Set(['PAT_016']);
    for (const key in MASTER_DB.PATHOLOGIES) {
        let p = MASTER_DB.PATHOLOGIES[key];
        if (PATHO_HIDDEN_FROM_PICKER.has(p.ID_PATHO)) continue;
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

// getVal, getStr, isChecked → définis dans utils.js

function calculerDFG(autoSwitch = true) {
    const age = getVal('patientAge'); const poids = getVal('patientPoids'); const creat = getVal('bioCreat'); const sexe = getStr('patientSexe');
    const methodSelect = document.getElementById('dfgMethodSelect'); const dfgInput = document.getElementById('patientDFG');
    if(!methodSelect || !dfgInput) return;
    // Validation plausibilité
    const ageEl = document.getElementById('patientAge');
    const creatEl = document.getElementById('bioCreat');
    if (age > 0 && (age < 18 || age > 120)) { dfgInput.value = ''; if(ageEl) { ageEl.classList.add('is-invalid'); ageEl.title = 'Âge hors limites (18-120)'; } return; }
    if(ageEl) ageEl.classList.remove('is-invalid');
    if (creat > 0 && creat > 2000) { dfgInput.value = ''; if(creatEl) { creatEl.classList.add('is-invalid'); creatEl.title = 'Créatinine hors limites'; } return; }
    if(creatEl) creatEl.classList.remove('is-invalid');
    dfgInput.title = '';
    let cgValue = 0; let ckdEpiValue = 0;
    if (age > 0 && creat > 0) {
        let scrMgDl = creat / 88.4; let kappa = (sexe === 'F') ? 0.7 : 0.9; let alpha = (sexe === 'F') ? -0.241 : -0.302;
        let min = Math.min(scrMgDl / kappa, 1); let max = Math.max(scrMgDl / kappa, 1);
        // CKD-EPI 2021 race-free (Inker NEJM 2021) — préféré par KDIGO 2024 pour le diagnostic CKD.
        ckdEpiValue = 142 * Math.pow(min, alpha) * Math.pow(max, -1.200) * Math.pow(0.9938, age) * (sexe === 'F' ? 1.012 : 1);
        // Cockcroft-Gault — encore utilisé par les RCP/AMM pour adapter les posologies (DOAC, gabapentine, allopurinol).
        if (poids > 0) { let constante = (sexe === 'M') ? 1.23 : 1.04; cgValue = ((140 - age) * poids * constante) / creat; }
    }
    if (autoSwitch && methodSelect.value === 'manuel' && creat > 0 && age > 0) methodSelect.value = poids > 0 ? 'cg' : 'ckdepi';

    if (methodSelect.value === 'cg') {
        if (cgValue > 0) { dfgInput.value = Math.round(cgValue); dfgInput.placeholder = ""; } else dfgInput.value = "";
        dfgInput.style.backgroundColor = 'rgba(255, 193, 7, 0.25)';
        dfgInput.style.color = '#212529';
    }
    else if (methodSelect.value === 'ckdepi') {
        if (ckdEpiValue > 0) { dfgInput.value = Math.round(ckdEpiValue); dfgInput.placeholder = ""; } else dfgInput.value = "";
        dfgInput.style.backgroundColor = 'rgba(13, 202, 240, 0.25)';
        dfgInput.style.color = '#212529';
    }
    else {
        dfgInput.style.backgroundColor = '';
        dfgInput.style.color = '';
    }

    // Avertissement sarcopénie : DFGe surestime la fonction rénale réelle quand la masse musculaire
    // s'effondre (sujet âgé, dénutri, IMC < 21, poids < 50 kg, créat < 50 µmol/L). KDIGO 2024
    // recommande la cystatine C dans ce cas pour confirmer le DFG.
    if (dfgInput && age >= 75 && creat > 0 && creat < 50 && (poids > 0 && poids < 50)) {
        dfgInput.title = 'DFGe possiblement surestimé (sarcopénie : créat < 50 µmol/L + poids < 50 kg). Confirmer par DFGe-cystatine C (KDIGO 2024).';
        dfgInput.classList.add('border-warning');
    } else if (dfgInput) {
        dfgInput.classList.remove('border-warning');
    }
}

function setupAutocomplete(inputId, listId, searchFunc, selectFunc) {
    const input = document.getElementById(inputId); const list = document.getElementById(listId);
    if(!input || !list) return;
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-owns', listId);
    let _debounceTimer = null;
    let _activeIdx = -1;

    function _updateList() {
        const val = input.value.trim(); list.innerHTML = ''; _activeIdx = -1;
        if(val.length < 2) { list.style.display = 'none'; input.setAttribute('aria-expanded', 'false'); return; }
        const matches = searchFunc(val);
        if(matches.length > 0) {
            matches.slice(0, 8).forEach((match, i) => {
                let li = document.createElement('li'); li.textContent = match.display;
                li.setAttribute('role', 'option'); li.setAttribute('data-idx', i);
                li.addEventListener('click', () => { input.value = ''; list.style.display = 'none'; input.setAttribute('aria-expanded', 'false'); selectFunc(match.data); });
                list.appendChild(li);
            }); list.style.display = 'block'; input.setAttribute('aria-expanded', 'true');
        } else {
            let li = document.createElement('li'); li.textContent = 'Aucun résultat'; li.className = 'text-muted fst-italic'; li.style.pointerEvents = 'none';
            list.appendChild(li); list.style.display = 'block'; input.setAttribute('aria-expanded', 'true');
        }
    }

    input.addEventListener('input', function() {
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(_updateList, 150);
    });

    // Navigation clavier : flèches haut/bas + Entrée + Échap
    input.addEventListener('keydown', function(e) {
        const items = list.querySelectorAll('li[role="option"]');
        if (!items.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            _activeIdx = Math.min(_activeIdx + 1, items.length - 1);
            items.forEach((li, i) => li.classList.toggle('bg-primary', i === _activeIdx));
            items.forEach((li, i) => li.classList.toggle('text-white', i === _activeIdx));
            items[_activeIdx].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            _activeIdx = Math.max(_activeIdx - 1, 0);
            items.forEach((li, i) => li.classList.toggle('bg-primary', i === _activeIdx));
            items.forEach((li, i) => li.classList.toggle('text-white', i === _activeIdx));
            items[_activeIdx].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter' && _activeIdx >= 0) {
            e.preventDefault();
            items[_activeIdx].click();
        } else if (e.key === 'Escape') {
            list.style.display = 'none'; input.setAttribute('aria-expanded', 'false'); _activeIdx = -1;
        }
    });

    document.addEventListener('click', function(e) { if (e.target !== input && !list.contains(e.target)) { list.style.display = 'none'; _activeIdx = -1; } });
}

function searchComorbList(val) { const cleanVal = sanitizeText(val); return allComorbs.filter(c => c.search.includes(cleanVal) || c.id.toLowerCase().includes(cleanVal)).map(c => ({display: c.label, data: c.id})); }
function searchMedList(val) {
    const cleanVal = sanitizeText(val); let matches = []; let seenSignatures = new Set(); 
    unifiedMedsMap.forEach((data, key) => { 
        if(key.includes(cleanVal) || sanitizeText(data.princeps).includes(cleanVal)) { 
            let signature = sanitizeText(data.dci_pure);
            if(!seenSignatures.has(signature)) { seenSignatures.add(signature); matches.push({display: data.dci_pure, data: data}); }
        } 
    }); return matches;
}

function selectComorb(id) { if(!activeComorbs.includes(id)) { activeComorbs.push(id); renderTags(); } }
function selectMed(data) {
    if(!activeMeds.some(m => sanitizeText(m.dci) === sanitizeText(data.dci_pure))) {
        const med = { label: data.dci_pure + (data.princeps ? ` (${data.princeps})` : ''), core_id: data.core_id, dci: data.dci_pure, classe: data.classe, albumine: data.albumine || 0, db_ref: data.db_ref };
        activeMeds.push(med);
        renderTags();
        if(_medPrecisionSpec(med)) openMedPrecisionModal(med.dci);
    }
}
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

// =========================================================================
// Précisions par médicament (durée / posologie / indication) — modal optionnel
// Le médicament est ajouté immédiatement ; le modal propose d'affiner et peut
// être « passé ». Les précisions alimentent contexte_clinique côté moteur.
// =========================================================================
// Champs du modal par famille. La détection de famille est centralisée dans
// drug_classes.js (medPrecisionFamily) — partagée avec app_analysis.js.
const MED_PRECISION_FIELDS = {
    cortico: ['duree', 'dose'],
    opioide: ['indication', 'dose'],
    ipp: ['duree'],
    bzd: ['duree'],
    ains: ['duree']
};
const PRECISION_FIELD_DEFS = {
    duree: { label: 'Durée de traitement', type: 'select',
        options: [['', 'Non précisé'], ['courte', '< 1 mois'], ['moyenne', '1 à 3 mois'], ['longue', '> 3 mois / chronique']] },
    indication: { label: 'Indication / intensité de la douleur', type: 'select',
        options: [['', 'Non précisé'], ['legere', 'Douleur légère'], ['moderee', 'Douleur modérée'], ['severe', 'Douleur sévère']] },
    dose: { label: 'Posologie (mg/jour)', type: 'number', placeholder: 'ex. 10' }
};
function _medPrecisionSpec(med) {
    if (!med) return null;
    const key = (typeof medPrecisionFamily === 'function') ? medPrecisionFamily(med.classe) : null;
    if (!key) return null;
    return { key: key, fields: MED_PRECISION_FIELDS[key] || [] };
}
function _medPrecisionEsc(e) { if (e.key === 'Escape') closeMedPrecisionModal(); }
function closeMedPrecisionModal() {
    const o = document.getElementById('medPrecisionOverlay');
    if (o && o.remove) o.remove();
    if (document.removeEventListener) document.removeEventListener('keydown', _medPrecisionEsc);
}
function openMedPrecisionModal(dci) {
    const med = activeMeds.find(m => m.dci === dci);
    if (!med) return;
    const spec = _medPrecisionSpec(med);
    if (!spec) return;
    closeMedPrecisionModal();
    const prec = med.precisions || {};
    const overlay = document.createElement('div');
    overlay.id = 'medPrecisionOverlay';
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:20000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55);padding:16px;';
    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;color:#1e293b;max-width:420px;width:100%;border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.3);padding:20px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;';
    const h = document.createElement('div'); h.style.cssText = 'font-weight:700;font-size:15px;margin-bottom:4px;'; h.textContent = 'Préciser la prescription';
    const sub = document.createElement('div'); sub.style.cssText = 'font-size:13px;color:#64748b;margin-bottom:14px;'; sub.textContent = med.label || med.dci;
    card.appendChild(h); card.appendChild(sub);
    const controls = {};
    spec.fields.forEach(fk => {
        const def = PRECISION_FIELD_DEFS[fk]; if (!def) return;
        const wrap = document.createElement('div'); wrap.style.cssText = 'margin-bottom:12px;';
        const lab = document.createElement('label'); lab.textContent = def.label; lab.style.cssText = 'display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#334155;';
        wrap.appendChild(lab);
        let ctrl;
        if (def.type === 'select') {
            ctrl = document.createElement('select');
            def.options.forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; if ((prec[fk] || '') === v) o.selected = true; ctrl.appendChild(o); });
        } else {
            ctrl = document.createElement('input'); ctrl.type = 'number'; ctrl.min = '0'; if (def.placeholder) ctrl.placeholder = def.placeholder;
            if (prec[fk] != null && prec[fk] !== '') ctrl.value = prec[fk];
        }
        ctrl.style.cssText = 'width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;box-sizing:border-box;';
        wrap.appendChild(ctrl); controls[fk] = ctrl; card.appendChild(wrap);
    });
    const btns = document.createElement('div'); btns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:8px;';
    const skip = document.createElement('button'); skip.type = 'button'; skip.textContent = 'Passer';
    skip.style.cssText = 'padding:8px 14px;border:1px solid #cbd5e1;background:#fff;color:#475569;border-radius:8px;cursor:pointer;font-size:14px;';
    skip.addEventListener('click', closeMedPrecisionModal);
    const save = document.createElement('button'); save.type = 'button'; save.textContent = 'Enregistrer';
    save.style.cssText = 'padding:8px 14px;border:0;background:#0d9488;color:#fff;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;';
    save.addEventListener('click', () => {
        const p = {};
        spec.fields.forEach(fk => { const v = controls[fk].value; if (v !== '' && v != null) p[fk] = (PRECISION_FIELD_DEFS[fk].type === 'number') ? parseFloat(String(v).replace(',', '.')) : v; });
        med.precisions = Object.keys(p).length ? p : undefined;
        closeMedPrecisionModal(); renderTags();
        if (typeof analyserPrescription === 'function') analyserPrescription();
    });
    btns.appendChild(skip); btns.appendChild(save); card.appendChild(btns);
    overlay.appendChild(card);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeMedPrecisionModal(); });
    if (document.addEventListener) document.addEventListener('keydown', _medPrecisionEsc);
    document.body.appendChild(overlay);
    const first = card.querySelector('select,input'); if (first && first.focus) first.focus();
}

function renderTags() {
    let elComorb = document.getElementById('selectedComorbs'); let elMeds = document.getElementById('selectedMeds');
    if(elComorb) {
        const frag = document.createDocumentFragment();
        activeComorbs.forEach(c => {
            let p = MASTER_DB.PATHOLOGIES[c]; let label = p ? p.NOM_STANDARD : c;
            let span = document.createElement('span'); span.className = 'badge bg-secondary tag-badge'; span.textContent = label + ' ✖';
            span.onclick = () => removeComorb(c); frag.appendChild(span);
        });
        elComorb.innerHTML = ''; elComorb.appendChild(frag);
    }
    if(elMeds) {
        const frag = document.createDocumentFragment();
        activeMeds.forEach(m => {
            let span = document.createElement('span'); span.className = 'badge bg-primary tag-badge';
            let labelNode = document.createTextNode(m.label + ' ');
            let btnSuspend = document.createElement('span');
            btnSuspend.textContent = '⏸️'; btnSuspend.title = 'Suspendre'; btnSuspend.style.cursor = 'pointer';
            btnSuspend.setAttribute('aria-label', 'Suspendre ' + m.dci);
            btnSuspend.setAttribute('role', 'button'); btnSuspend.setAttribute('tabindex', '0');
            btnSuspend.addEventListener('click', () => toggleSuspend(m.dci));
            btnSuspend.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSuspend(m.dci); } });
            let btnRemove = document.createElement('span');
            btnRemove.textContent = '✖'; btnRemove.style.cssText = 'cursor:pointer;color:#ffcccc;margin-left:4px;';
            btnRemove.setAttribute('aria-label', 'Retirer ' + m.dci);
            btnRemove.setAttribute('role', 'button'); btnRemove.setAttribute('tabindex', '0');
            btnRemove.addEventListener('click', () => removeMed(m.dci));
            btnRemove.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); removeMed(m.dci); } });
            span.appendChild(labelNode); span.appendChild(btnSuspend);
            if (_medPrecisionSpec(m)) {
                const hasP = m.precisions && Object.keys(m.precisions).length;
                let btnEdit = document.createElement('span');
                btnEdit.textContent = hasP ? '📝' : '✎';
                btnEdit.title = hasP ? 'Modifier les précisions (durée/dose/indication)' : 'Préciser durée/dose/indication';
                btnEdit.style.cssText = 'cursor:pointer;margin-left:4px;';
                btnEdit.setAttribute('aria-label', 'Préciser ' + m.dci);
                btnEdit.setAttribute('role', 'button'); btnEdit.setAttribute('tabindex', '0');
                btnEdit.addEventListener('click', () => openMedPrecisionModal(m.dci));
                btnEdit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMedPrecisionModal(m.dci); } });
                span.appendChild(btnEdit);
            }
            span.appendChild(btnRemove);
            frag.appendChild(span);
        });
        window.suspendedMeds.forEach(m => {
            let span = document.createElement('span'); span.className = 'badge bg-light text-muted border tag-badge'; span.style.textDecoration = 'line-through';
            let labelNode = document.createTextNode(m.label + ' ');
            let btnResume = document.createElement('span');
            btnResume.textContent = '▶️'; btnResume.title = 'Réactiver'; btnResume.style.cursor = 'pointer';
            btnResume.setAttribute('aria-label', 'Réactiver ' + m.dci);
            btnResume.setAttribute('role', 'button'); btnResume.setAttribute('tabindex', '0');
            btnResume.addEventListener('click', () => toggleSuspend(m.dci));
            btnResume.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSuspend(m.dci); } });
            let btnDel = document.createElement('span');
            btnDel.textContent = '✖'; btnDel.style.cssText = 'cursor:pointer;margin-left:4px;';
            btnDel.setAttribute('aria-label', 'Supprimer ' + m.dci);
            btnDel.setAttribute('role', 'button'); btnDel.setAttribute('tabindex', '0');
            btnDel.addEventListener('click', () => { window.suspendedMeds = window.suspendedMeds.filter(x => x.dci !== m.dci); renderTags(); });
            btnDel.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.suspendedMeds = window.suspendedMeds.filter(x => x.dci !== m.dci); renderTags(); } });
            span.appendChild(labelNode); span.appendChild(btnResume); span.appendChild(btnDel);
            frag.appendChild(span);
        });
        elMeds.innerHTML = ''; elMeds.appendChild(frag);
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
        // Synchroniser la checkbox hépatopathie
        let chk = document.getElementById('chkFoie');
        if (chk) chk.checked = (val === 'B' || val === 'C');
    }
}

// Quand l'utilisateur coche "Hépatopathie" sans avoir renseigné le Child-Pugh,
// ouvrir la section des paramètres cliniques et mettre le focus sur le sélecteur CP
function syncFoieToChildPugh() {
    let chk = document.getElementById('chkFoie');
    let cpManual = document.getElementById('cpManual');
    if (!chk || !cpManual) return;
    if (chk.checked && cpManual.value === '0') {
        // Ouvrir le details parent si fermé
        let details = cpManual.closest('details');
        if (details && !details.open) details.open = true;
        // Mettre en surbrillance le sélecteur
        cpManual.classList.add('border-warning');
        cpManual.focus();
        setTimeout(() => cpManual.classList.remove('border-warning'), 3000);
    }
}

// ============================================================================
// OCR — Fonctions UI pour le modal d'import d'ordonnance
// ============================================================================
let _ocrModal = null;

function ocrOpenModal() {
    if (!_ocrModal) _ocrModal = new bootstrap.Modal(document.getElementById('ocrModal'));
    ocrReset();
    _ocrModal.show();
}

function ocrReset() {
    document.getElementById('ocrStep1').style.display = '';
    document.getElementById('ocrStep2').style.display = 'none';
    document.getElementById('ocrFooter').style.display = 'none';
    document.getElementById('ocrResults').style.display = 'none';
    document.getElementById('ocrRawText').style.display = 'none';
    document.getElementById('ocrProgressBar').style.width = '0%';
    document.getElementById('ocrProgressText').textContent = '';
    document.getElementById('ocrMedList').innerHTML = '';
    document.getElementById('ocrNoMatch').style.display = 'none';
    const fi = document.getElementById('ocrFileInput');
    if (fi) fi.value = '';
}

function ocrHandleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
        document.getElementById('ocrPreviewImg').src = reader.result;
        document.getElementById('ocrStep1').style.display = 'none';
        document.getElementById('ocrStep2').style.display = '';
        _ocrRunRecognition(reader.result);
    };
    reader.readAsDataURL(file);
}

async function ocrPasteClipboard() {
    try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
            const imageType = item.types.find(t => t.startsWith('image/'));
            if (imageType) {
                const blob = await item.getType(imageType);
                ocrHandleFile(new File([blob], 'clipboard.png', { type: imageType }));
                return;
            }
        }
        alert('Aucune image dans le presse-papiers. Copiez d\'abord une capture (Ctrl+C).');
    } catch (e) {
        alert('Impossible de lire le presse-papiers. Utilisez Ctrl+V dans la fenetre ou choisissez un fichier.');
    }
}

async function _ocrRunRecognition(imageData) {
    const progressBar = document.getElementById('ocrProgressBar');
    const progressText = document.getElementById('ocrProgressText');
    const resultsDiv = document.getElementById('ocrResults');
    const rawTextDiv = document.getElementById('ocrRawText');
    const medListDiv = document.getElementById('ocrMedList');
    const noMatchDiv = document.getElementById('ocrNoMatch');
    const footerDiv = document.getElementById('ocrFooter');

    // Afficher immédiatement un état de démarrage visible
    progressBar.style.width = '5%';
    progressText.textContent = 'Démarrage...';
    document.getElementById('ocrProgress').style.display = '';

    function onProgress(status, progress) {
        const pct = Math.max(5, Math.round(progress * 100));
        progressBar.style.width = pct + '%';
        progressText.textContent = status;
    }

    try {
        const result = await OcrModule.recognize(imageData, onProgress);

        // Show raw text (collapsed)
        rawTextDiv.textContent = result.rawText || '(aucun texte detecte)';
        rawTextDiv.style.display = '';

        // Show medication matches
        if (result.medications.length === 0) {
            noMatchDiv.style.display = '';
            resultsDiv.style.display = '';
            footerDiv.style.display = '';
            return;
        }

        medListDiv.innerHTML = '';
        const alreadyActive = new Set(activeMeds.map(m => sanitizeText(m.dci)));

        result.medications.forEach((med, idx) => {
            const isAlready = alreadyActive.has(sanitizeText(med.dci));
            const confidence = med.score >= 80 ? 'text-success' : med.score >= 50 ? 'text-warning' : 'text-danger';
            const confidenceLabel = med.score >= 80 ? 'Fiable' : med.score >= 50 ? 'Probable' : 'Incertain';

            const div = document.createElement('div');
            div.className = 'form-check mb-1';
            div.innerHTML =
                '<input class="form-check-input" type="checkbox" id="ocrMed' + idx + '" value="' + idx + '"' +
                (isAlready ? ' disabled' : ' checked') + '>' +
                '<label class="form-check-label" for="ocrMed' + idx + '">' +
                '<strong>' + escapeHtml(med.dci) + '</strong>' +
                (med.princeps ? ' <small class="text-muted">(' + escapeHtml(med.princeps) + ')</small>' : '') +
                ' <span class="badge bg-light border ' + confidence + '" style="font-size:0.7em;">' + confidenceLabel + '</span>' +
                (isAlready ? ' <span class="badge bg-secondary" style="font-size:0.7em;">Deja ajoute</span>' : '') +
                '</label>';
            medListDiv.appendChild(div);
        });

        // Store matches for validation
        window._ocrMatches = result.medications;
        resultsDiv.style.display = '';
        footerDiv.style.display = '';
        document.getElementById('ocrProgress').style.display = 'none';
    } catch (e) {
        console.error('[OCR] Recognition error:', e);
        progressText.textContent = 'Erreur : ' + e.message;
        progressText.className = 'text-danger small';
    }
}

function ocrValidateSelection() {
    if (!window._ocrMatches) return;
    const checkboxes = document.querySelectorAll('#ocrMedList input[type="checkbox"]:checked:not(:disabled)');
    let added = 0;
    checkboxes.forEach(cb => {
        const idx = parseInt(cb.value);
        const med = window._ocrMatches[idx];
        if (med && med.data) {
            selectMed(med.data);
            added++;
        }
    });
    window._ocrMatches = null;
    if (_ocrModal) _ocrModal.hide();
    // Free OCR worker memory after use
    OcrModule.terminate();
}

// Ctrl+V paste handler on the modal
document.addEventListener('paste', function(e) {
    const modal = document.getElementById('ocrModal');
    if (!modal || !modal.classList.contains('show')) return;
    const items = e.clipboardData.items;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            if (file) ocrHandleFile(file);
            return;
        }
    }
});

window.onload = initUI;
