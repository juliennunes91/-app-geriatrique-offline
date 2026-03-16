function initUI() {
    if(typeof GERIA_DB === 'undefined') return;

    const maladiesA_Ajouter = [
        {id: 'IC_FE_REDUITE', nom: 'Insuffisance Cardiaque FE Réduite (HFrEF)'},
        {id: 'IC_FE_PRESERVEE', nom: 'Insuffisance Cardiaque FE Préservée (HFpEF)'},
        {id: 'SCC', nom: 'Syndrome Coronarien Chronique (Angor, Stent, IDM)'},
        {id: 'DEMENCE_ALZHEIMER', nom: 'Maladie d\'Alzheimer'},
        {id: 'DEMENCE_CORPS_LEWY', nom: 'Démence à Corps de Lewy / Parkinson'},
        {id: 'DEMENCE_FRONTO', nom: 'Démence Fronto-Temporale (DFT)'},
        {id: 'EPILEPSIE', nom: 'Épilepsie'},
        {id: 'CANCER', nom: 'Cancer (Tumeur solide)'},
        {id: 'HYPERCHOLESTEROLEMIE', nom: 'Hypercholestérolémie / Dyslipidémie'},
        {id: 'AOMI', nom: 'AOMI / Artériopathie'},
        {id: 'INSOMNIE', nom: 'Insomnie / Troubles du sommeil'},
        {id: 'OSTEOPOROSE', nom: 'Ostéoporose'},
        {id: 'CORTICOTHERAPIE', nom: 'Corticothérapie chronique (Long cours)'},
        {id: 'ULCERE', nom: 'Ulcère gastroduodénal (UGDT)'},
        {id: 'ASTHME', nom: 'Asthme'},
        {id: 'BPCO', nom: 'BPCO'},
        {id: 'GOUTTE', nom: 'Goutte'},
        {id: 'HYPOTENSION_ORTHO', nom: 'Hypotension orthostatique'},
        {id: 'HYPOTHYROIDIE', nom: 'Hypothyroïdie'},
        {id: 'HYPERTHYROIDIE', nom: 'Hyperthyroïdie'},
        {id: 'VERTIGES', nom: 'Vertiges / Troubles de l\'équilibre'}
    ];
    
    maladiesA_Ajouter.forEach(maladie => {
        if(!GERIA_DB.comorbidites.some(c => c.comorb_id === maladie.id)) {
            GERIA_DB.comorbidites.push({comorb_id: maladie.id, nom: maladie.nom});
        }
    });

    GERIA_DB.comorbidites.forEach(c => { 
        if(c.comorb_id === 'IC_SYSTOLIQUE' || c.comorb_id === 'IC') return; 
        allComorbs.push({id: c.comorb_id, label: c.nom, search: sanitizeText(c.nom)}); 
    });

    const cleanDCI = (str) => {
        if(!str) return "";
        let s = str.replace(/\b(IV|PO|SC|IM|IV\/PO|per os|comprimés?|gélules?|sirop|collyre|ampoules?|mg|ml|µg|solution|injectable)\b/gi, '');
        return s.trim();
    };

    // Le Nouveau Moteur de Fusion Intelligent anti-doublons
    const smartMergeMed = (dciRaw, princepsRaw, classeRaw, id, albumine = 0) => {
        if (!dciRaw) return;
        let testStr = dciRaw.toLowerCase();
        if (dciRaw.length > 45 || testStr.includes('tableau') || testStr.includes('adaptation') || testStr.includes('mg/j') || testStr.includes('clairance')) return;

        let rawClean = cleanDCI(dciRaw);
        // On sépare intelligemment ce qui est dans les parenthèses
        let parts = rawClean.split(/[\(\/\)]/).map(x => x.replace(/[\*\[\]]/g, '').trim()).filter(x => x.length > 2);
        if (parts.length === 0) return;
        
        let mainDci = parts[0];
        let key = sanitizeText(mainDci);
        if (!key || key.length < 3) return;

        let others = parts.slice(1);
        let pRaw = (princepsRaw || "").trim();
        if (others.length > 0) pRaw = pRaw ? pRaw + ", " + others.join(', ') : others.join(', ');
        let cRaw = (classeRaw || "").trim();

        // Résolution de clé croisée (Si "miorel" arrive mais que "thiocolchicoside" existe déjà dans les alias)
        let targetKey = key;
        if (!unifiedMedsMap.has(key)) {
            for (let o of others) {
                let oKey = sanitizeText(o);
                if (unifiedMedsMap.has(oKey)) { targetKey = oKey; break; }
            }
            if (targetKey === key) {
                for (let existingKey of unifiedMedsMap.keys()) {
                    if (existingKey.length > 5 && key.includes(existingKey)) { targetKey = existingKey; break; }
                }
            }
        }

        // Fusion parfaite
        if (unifiedMedsMap.has(targetKey)) {
            let existing = unifiedMedsMap.get(targetKey);
            if (pRaw) {
                pRaw.split(',').forEach(p => {
                    let pt = p.trim();
                    if (pt && !existing.princeps.toLowerCase().includes(pt.toLowerCase()) && !existing.dci_pure.toLowerCase().includes(pt.toLowerCase())) {
                        existing.princeps = existing.princeps ? existing.princeps + ', ' + pt : pt;
                    }
                });
            }
            if (cRaw && cRaw !== 'Médicament avec suivi spécifique' && cRaw !== 'Classe Médicamenteuse') {
                if (!existing.classe.toLowerCase().includes(cRaw.toLowerCase())) {
                    existing.classe = existing.classe.includes('Médicament') || !existing.classe ? cRaw : existing.classe + ' / ' + cRaw;
                }
            }
            if (albumine > existing.albumine) existing.albumine = albumine;
            
            // On s'assure que le plus long nom est utilisé comme DCI (car c'est souvent la molécule, et le nom court est le princeps)
            if (mainDci.length > existing.dci_pure.length && others.length === 0 && !mainDci.includes(' ')) {
                if (!existing.princeps.toLowerCase().includes(existing.dci_pure.toLowerCase())) {
                    existing.princeps = existing.princeps ? existing.princeps + ', ' + existing.dci_pure : existing.dci_pure;
                }
                existing.dci_pure = mainDci;
            }
        } else {
            unifiedMedsMap.set(targetKey, { dci_pure: mainDci, princeps: pRaw, classe: cRaw, core_id: id, albumine: albumine });
        }
    };

    // Chargement de TOUTES les bases de données (sans aucun doublon possible)
    if(GERIA_DB.dci_mapping) {
        for (const [dci, info] of Object.entries(GERIA_DB.dci_mapping)) { 
            smartMergeMed(dci, info.princeps, info.classe_qt, info.med_id_clinique || dci, parsePourcentage(info.liaison_albumine || info.liaison_proteique)); 
        }
    }
    
    if(GERIA_DB.medicaments) {
        GERIA_DB.medicaments.forEach(m => { 
            let albScore = parsePourcentage(m.liaison_albumine || m.liaison_proteique || m.Liaison_albumine);
            if(!unifiedMedsMap.has(sanitizeText(m.nom_classe))) unifiedMedsMap.set(sanitizeText(m.nom_classe), { dci_pure: `[Classe] ${m.nom_classe}`, princeps: '', classe: 'Classe Médicamenteuse', core_id: m.med_id, albumine: 0 });
            if(m.sous_classes_exemples) m.sous_classes_exemples.split(',').forEach(ex => smartMergeMed(ex, '', m.nom_classe, m.med_id, albScore));
        });
    }

    if(GERIA_DB.medica_qt) {
        GERIA_DB.medica_qt.forEach(row => {
            smartMergeMed(row["DCI (Molécule)"] || row["DCI"], row["Noms de marque (Princeps)"], row["Classe Médicamenteuse"], row["DCI (Molécule)"] || row["DCI"], parsePourcentage(row["Liaison Albumine (%)"]));
        });
    }

    if (typeof ATB_DB !== 'undefined') ATB_DB.forEach(atb => smartMergeMed(atb.nom_affichage, '', 'Antibiotique', atb.nom_affichage, 0));
    if (typeof SUIVI_BIOLOGIQUE_DB !== 'undefined') SUIVI_BIOLOGIQUE_DB.forEach(row => smartMergeMed(row.medicament, '', 'Médicament avec suivi spécifique', row.medicament, 0));
    if (typeof POSOLOGIE_DB !== 'undefined') POSOLOGIE_DB.forEach(row => smartMergeMed(row.medicament, '', row.classe_pharmacologique || 'Médicament', row.medicament, 0));
    
    // Forçages Experts
    smartMergeMed('miansérine', 'Athymil', 'Antidépresseur tétracyclique', 'mianserine', 90);
    smartMergeMed('mirtazapine', 'Norset', 'Antidépresseur tétracyclique', 'mirtazapine', 85);
    smartMergeMed('rifampicine', 'Rifadine', 'Antibiotique / Inducteur CYP3A4', 'rifampicine', 80);
    smartMergeMed('ritonavir', 'Norvir', 'Inhibiteur puissant CYP3A4', 'ritonavir', 98);
    smartMergeMed('quétiapine', 'Xeroquel', 'Antipsychotique atypique', 'quetiapine', 83);
    smartMergeMed('aspirine', 'Kardegic', 'Antiagrégant', 'aspirine', 90);
    smartMergeMed('clopidogrel', 'Plavix', 'Antiagrégant', 'clopidogrel', 98);
    smartMergeMed('acétylleucine', 'Tanganil', 'Antivertigineux', 'acetylleucine', 0);
    smartMergeMed('bétahistine', 'Serc, Betaserc', 'Antivertigineux', 'betahistine', 5);
    smartMergeMed('trihexyphénidyle', 'Artane, Parkinane', 'Anticholinergique', 'trihexyphenidyle', 0);
    smartMergeMed('sacubitril/valsartan', 'Entresto', 'ARNI', 'arni', 97);
    smartMergeMed('acide folique', 'Spéciafoldine', 'Vitamine B9', 'b9', 70);
    smartMergeMed('spironolactone', 'Aldactone', 'Diurétique épargneur K+', 'spironolactone', 90);
    smartMergeMed('clarithromycine', 'Zeclar', 'Macrolide / Inhibiteur CYP3A4', 'clarithromycine', 70);

    setupAutocomplete('inputComorb', 'listComorb', searchComorbList, selectComorb);
    setupAutocomplete('inputMed', 'listMed', searchMedList, selectMed);
}

const getVal = id => { let el = document.getElementById(id); return el && el.value ? parseFloat(el.value) : 0; };
const getStr = id => { let el = document.getElementById(id); return el ? el.value : ""; };
const isChecked = id => { let el = document.getElementById(id); return el ? el.checked : false; };

function calculerDFG(autoSwitch = true) {
    const age = getVal('patientAge'); const poids = getVal('patientPoids'); const creat = getVal('bioCreat'); const sexe = getStr('patientSexe');
    const methodSelect = document.getElementById('dfgMethodSelect'); const dfgInput = document.getElementById('patientDFG');
    if(!methodSelect || !dfgInput) return;

    let cgValue = 0; let ckdEpiValue = 0;
    if (age > 0 && creat > 0) {
        let scrMgDl = creat / 88.4;
        let kappa = (sexe === 'F') ? 0.7 : 0.9;
        let alpha = (sexe === 'F') ? -0.241 : -0.302;
        let min = Math.min(scrMgDl / kappa, 1); let max = Math.max(scrMgDl / kappa, 1);
        ckdEpiValue = 142 * Math.pow(min, alpha) * Math.pow(max, -1.200) * Math.pow(0.9938, age) * (sexe === 'F' ? 1.012 : 1);
        if (poids > 0) { 
            let constante = (sexe === 'M') ? 1.23 : 1.04; 
            cgValue = ((140 - age) * poids * constante) / creat; 
        }
    }

    if (autoSwitch && methodSelect.value === 'manuel' && creat > 0 && age > 0) { 
        methodSelect.value = poids > 0 ? 'cg' : 'ckdepi'; 
    }

    if (methodSelect.value === 'cg') { 
        if (cgValue > 0) { dfgInput.value = Math.round(cgValue); } else { dfgInput.value = ""; dfgInput.placeholder = "Poids?"; }
        dfgInput.className = "form-control fw-bold bg-warning bg-opacity-25 text-dark"; 
    } 
    else if (methodSelect.value === 'ckdepi') { 
        if (ckdEpiValue > 0) { dfgInput.value = Math.round(ckdEpiValue); } else { dfgInput.value = ""; dfgInput.placeholder = "Âge?"; }
        dfgInput.className = "form-control fw-bold bg-info bg-opacity-25 text-dark"; 
    } 
    else { dfgInput.className = "form-control fw-bold"; }
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
                li.onclick = () => { input.value = ''; list.style.display = 'none'; selectFunc(match.data); };
                list.appendChild(li);
            });
            list.style.display = 'block';
        } else { list.style.display = 'none'; }
    });
    document.addEventListener('click', function(e) { if (e.target !== input && e.target !== list) { list.style.display = 'none'; } });
}

function searchComorbList(val) { const cleanVal = sanitizeText(val); return allComorbs.filter(c => c.search.includes(cleanVal) || c.id.toLowerCase().includes(cleanVal)).map(c => ({display: c.label, data: c.id})); }

function searchMedList(val) {
    const cleanVal = sanitizeText(val); let matches = []; let seenSignatures = new Set(); 
    unifiedMedsMap.forEach((data, key) => { 
        if(!data.dci_pure.startsWith('[Classe]') && (key.includes(cleanVal) || sanitizeText(data.princeps).includes(cleanVal))) { 
            // Signature unique pour unifier l'affichage et bloquer tout doublon visuel résiduel
            let signature = sanitizeText(data.dci_pure);
            if(!seenSignatures.has(signature)) { 
                seenSignatures.add(signature); 
                matches.push({display: `${data.dci_pure}${data.princeps ? ` (${data.princeps})` : ''} - ${data.classe}`, data: data}); 
            }
        } 
    });
    return matches;
}

function selectComorb(id) { if(!activeComorbs.includes(id)) { activeComorbs.push(id); renderTags(); } }
function selectMed(data) {
    let dciClean = data.dci_pure.replace('[Classe] ', '');
    if(!activeMeds.some(m => sanitizeText(m.dci) === sanitizeText(dciClean))) {
        activeMeds.push({ label: data.dci_pure + (data.princeps ? ` (${data.princeps})` : ''), core_id: data.core_id, dci: dciClean, classe: data.classe, albumine: data.albumine || 0 }); renderTags();
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
    renderTags(); analyserPrescription();
}

function renderTags() {
    let elComorb = document.getElementById('selectedComorbs'); let elMeds = document.getElementById('selectedMeds');
    if(elComorb) elComorb.innerHTML = activeComorbs.map(c => `<span class="badge bg-secondary tag-badge" onclick="removeComorb('${c}')">${c} ✖</span>`).join('');
    if(elMeds) {
        let htmlActifs = activeMeds.map(m => `<span class="badge bg-primary tag-badge">${m.label} <span title="Suspendre (Simulateur)" onclick="toggleSuspend('${m.dci}')" style="cursor:pointer;">⏸️</span> <span onclick="removeMed('${m.dci}')" style="cursor:pointer; color:#ffcccc;">✖</span></span>`).join('');
        let htmlSuspendus = window.suspendedMeds.map(m => `<span class="badge bg-light text-muted border tag-badge" style="text-decoration: line-through;">${m.label} <span title="Réactiver" onclick="toggleSuspend('${m.dci}')" style="cursor:pointer;">▶️</span> <span onclick="window.suspendedMeds = window.suspendedMeds.filter(x=>x.dci!=='${m.dci}');renderTags();" style="cursor:pointer;">✖</span></span>`).join('');
        elMeds.innerHTML = htmlActifs + htmlSuspendus;
    }
}
function checkFrail() { let el = document.getElementById('patientFragile'); if(el) el.checked = (getVal('scoreCFS') >= 7); }
window.onload = initUI;
