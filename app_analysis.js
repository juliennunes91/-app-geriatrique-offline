// app_analysis.js - V7.0 (Scores complets, PD, Anticholinergiques, Hémorragie)

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

// =========================================================
// CLASSES PD — Définitions des groupes pharmacodynamiques
// =========================================================
const PD_CLASSES = {
    qt_prolonging: {
        label: "Allongement du QT",
        icon: "⚡",
        color: "danger",
        drugs: ['amiodarone','sotalol','dronedarone','flecainide','quinidine','disopyramide',
                'haloperidol','droperidol','pimozide','amisulpride','sulpiride','chlorpromazine','levomepromazine',
                'domperidone','ondansetron','granisetron',
                'erythromycine','clarithromycine','moxifloxacine','levofloxacine','azithromycine',
                'hydroxychloroquine','methadone','escitalopram','citalopram','fluoxetine',
                'amitriptyline','clomipramine','imipramine','doxepine'],
        classes: ['antiarythmique','antipsychotique','neuroleptique','macrolide','fluoroquinolone'],
        message: "Risque additif d'allongement du QTc — ECG recommandé, surveiller kaliémie/magnésémie"
    },
    sedation: {
        label: "Sédation / Dépression SNC",
        icon: "😴",
        color: "warning",
        drugs: ['morphine','oxycodone','fentanyl','tramadol','codeine','buprenorphine',
                'diazepam','lorazepam','oxazepam','alprazolam','bromazepam','clonazepam','midazolam','zolpidem','zopiclone',
                'pregabaline','gabapentine',
                'amitriptyline','doxepine','mirtazapine','trazodone',
                'haloperidol','olanzapine','quetiapine','risperidone','clozapine','chlorpromazine',
                'hydroxyzine','dexchlorpheniramine','promethazine','alimemazine','cetirizine'],
        classes: ['opioid','opioide','benzodiazepine','hypnotique','neuroleptique','antipsychotique','antihistaminique'],
        message: "Risque additif de sédation, chutes, dépression respiratoire — Réduire doses, surveiller vigilance"
    },
    bleeding: {
        label: "Risque hémorragique",
        icon: "🩸",
        color: "danger",
        drugs: ['warfarine','acenocoumarol','fluindione','rivaroxaban','apixaban','dabigatran','edoxaban',
                'heparine','enoxaparine','tinzaparine','dalteparine','fondaparinux',
                'aspirine','clopidogrel','prasugrel','ticagrelor','ticlopidine',
                'ibuprofene','naproxene','diclofenac','ketoprofene','piroxicam','meloxicam','celecoxib',
                'venlafaxine','duloxetine','fluoxetine','paroxetine','sertraline','citalopram','escitalopram'],
        classes: ['anticoag','anticoagulant','antiagreg','antiagregant','ains','isrs','irsn','heparine'],
        message: "Risque hémorragique cumulatif — Surveiller NFS, INR, signes de saignement"
    },
    serotonin: {
        label: "Syndrome sérotoninergique",
        icon: "🧠",
        color: "danger",
        drugs: ['fluoxetine','paroxetine','sertraline','citalopram','escitalopram','fluvoxamine',
                'venlafaxine','duloxetine','milnacipran','desvenlafaxine',
                'amitriptyline','clomipramine','imipramine','doxepine',
                'tramadol','fentanyl','methadone','tapentadol',
                'linezolide','moclobemide','selegiline','rasagiline',
                'lithium','tryptophane','buspirone','mirtazapine','trazodone'],
        classes: ['isrs','irsn','imao','antidepresseurtricyclique'],
        message: "Risque de syndrome sérotoninergique (agitation, myoclonies, hyperthermie) — Éviter associations"
    },
    nephrotoxicity: {
        label: "Néphrotoxicité",
        icon: "🫘",
        color: "warning",
        drugs: ['ibuprofene','naproxene','diclofenac','ketoprofene','piroxicam','meloxicam','celecoxib',
                'gentamicine','tobramycine','amikacine','vancomycine',
                'metformine','aciclovir','valaciclovir','tenofovir','cidofovir',
                'lithium','ciclosporine','tacrolimus',
                'furosemide','hydrochlorothiazide','spironolactone','amiloride'],
        classes: ['ains','aminoside','iec','ara2','diuretique','isglt2','sglt2'],
        message: "Risque néphrotoxique additif — Surveiller créatinine et DFG rapprochés"
    },
    hypotension: {
        label: "Hypotension / Chutes",
        icon: "📉",
        color: "warning",
        drugs: ['ramipril','enalapril','lisinopril','perindopril','captopril',
                'losartan','valsartan','candesartan','irbesartan','olmesartan','telmisartan',
                'amlodipine','felodipine','nifedipine','diltiazem','verapamil',
                'furosemide','hydrochlorothiazide','indapamide','spironolactone',
                'bisoprolol','metoprolol','atenolol','carvedilol','nebivolol','propranolol',
                'prazosine','doxazosine','tamsulosine','alfuzosine','silodosine',
                'levodopa','ropinirole','pramipexole',
                'quetiapine','olanzapine','chlorpromazine','risperidone'],
        classes: ['iec','ara2','inhibiteurcalcique','diuretique','betabloquant','alphabloquant','antihypertenseur'],
        message: "Risque d'hypotension orthostatique et de chutes — Mesurer PA couché/debout"
    },
    hyperkalemia: {
        label: "Hyperkaliémie",
        icon: "🔺",
        color: "danger",
        drugs: ['spironolactone','eplerenone','amiloride','triamterene',
                'ramipril','enalapril','lisinopril','perindopril','captopril',
                'losartan','valsartan','candesartan','irbesartan','olmesartan','telmisartan',
                'sacubitril','trimethoprime','ciclosporine','tacrolimus','heparine','enoxaparine'],
        classes: ['iec','ara2','mra','arni','epargneur_potassique'],
        message: "Risque d'hyperkaliémie — Contrôler kaliémie dans les 7 jours puis régulièrement"
    },
    anticholinergic: {
        label: "Charge anticholinergique",
        icon: "🧩",
        color: "warning",
        drugs: ['oxybutynine','solifenacine','toltérodine','fesoterodine','trospium','darifenacine',
                'amitriptyline','clomipramine','imipramine','doxepine','nortriptyline',
                'hydroxyzine','dexchlorpheniramine','promethazine','alimemazine','chlorphenamine',
                'chlorpromazine','levomepromazine','clozapine',
                'biperidene','trihexyphenidyle','tropatepine',
                'atropine','scopolamine','ipratropium','tiotropium'],
        classes: ['anticholinergique','antimuscarinique','antidepresseurtricyclique'],
        message: "Charge anticholinergique cumulative — Risque confusion, rétention urinaire, constipation, chutes"
    }
};

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

// =========================================================
// MOTEUR PD — Détection des interactions pharmacodynamiques
// =========================================================
function detecterInteractionsPD(meds) {
    const results = [];
    for (const [pdKey, pdDef] of Object.entries(PD_CLASSES)) {
        const matched = [];
        meds.forEach(m => {
            const dci = sanitizeText(m.dci);
            const classe = sanitizeText(m.classe);
            const isDrug = pdDef.drugs.some(d => dci.includes(sanitizeText(d)) || sanitizeText(d).includes(dci));
            const isClass = pdDef.classes.some(c => matchesDrugClass(dci, classe, c));
            if (isDrug || isClass) matched.push(m.dci);
        });
        if (matched.length >= 2) {
            results.push({
                key: pdKey,
                label: pdDef.label,
                icon: pdDef.icon,
                color: pdDef.color,
                drugs: matched,
                count: matched.length,
                message: pdDef.message
            });
        }
    }
    return results;
}

// =========================================================
// PANNEAU ANTICHOLINERGIQUE DÉTAILLÉ
// =========================================================
function renderAnticholinergicPanel(meds, albumSg) {
    let achMeds = [];
    let totalACB = 0, totalCIA = 0, countBHE = 0;
    meds.forEach(m => {
        let ref = m.db_ref; if (!ref) return;
        let acb = parseFloat(ref.acb) || 0;
        let cia = parseFloat(ref.cia) || 0;
        let bhe = (ref.bhe != null) ? parseInt(ref.bhe) : -1;
        let alb = parseFloat(ref.albumine) || 0;
        if (acb > 0 || cia > 0 || bhe === 1) {
            achMeds.push({ dci: m.dci, acb, cia, bhe, albumine: alb });
            totalACB += acb; totalCIA += cia;
            if (bhe === 1) countBHE++;
        }
    });
    if (achMeds.length === 0) return '';

    let acbColor = totalACB >= 5 ? 'danger' : (totalACB >= 3 ? 'warning' : 'info');
    let ciaColor = totalCIA >= 5 ? 'danger' : (totalCIA >= 3 ? 'warning' : 'info');

    let tableRows = achMeds.map(m => {
        let bheLabel = m.bhe === 1 ? '<span class="badge bg-danger">OUI</span>' : (m.bhe === 0 ? '<span class="badge bg-success">NON</span>' : '<span class="badge bg-secondary">?</span>');
        let albLabel = m.albumine >= 85 ? `<span class="text-danger fw-bold">${m.albumine}%</span>` : (m.albumine > 0 ? `${m.albumine}%` : '-');
        let acbBadge = m.acb >= 3 ? 'bg-danger' : (m.acb >= 2 ? 'bg-warning text-dark' : 'bg-secondary');
        return `<tr>
            <td class="fw-bold">${m.dci}</td>
            <td class="text-center"><span class="badge ${acbBadge}">${m.acb}</span></td>
            <td class="text-center">${m.cia}</td>
            <td class="text-center">${bheLabel}</td>
            <td class="text-center">${albLabel}</td>
        </tr>`;
    }).join('');

    let albWarning = '';
    if (albumSg > 0 && albumSg < 35) {
        let highBindMeds = achMeds.filter(m => m.albumine >= 85);
        if (highBindMeds.length > 0) {
            albWarning = `<div class="alert alert-danger mt-2 mb-0 py-1 px-2 small">
                <strong>Hypoalbuminémie (${albumSg} g/L) + forte liaison protéique :</strong>
                ${highBindMeds.map(m => m.dci).join(', ')} — Risque de fraction libre augmentée et surdosage
            </div>`;
        }
    }

    return `<div class="card border-${acbColor} shadow mb-3">
        <div class="card-header bg-${acbColor} ${acbColor === 'warning' ? 'text-dark' : 'text-white'} py-2">
            <strong>🧩 Charge Anticholinergique — ACB: ${totalACB} | CIA: ${totalCIA} | BHE+: ${countBHE}/${achMeds.length}</strong>
        </div>
        <div class="card-body p-2">
            <div class="row text-center g-1 mb-2">
                <div class="col-3"><div class="border rounded p-1"><div class="fw-bold text-${acbColor}" style="font-size:1.3em;">${totalACB}</div><small class="text-muted">ACB total</small></div></div>
                <div class="col-3"><div class="border rounded p-1"><div class="fw-bold text-${ciaColor}" style="font-size:1.3em;">${totalCIA}</div><small class="text-muted">CIA total</small></div></div>
                <div class="col-3"><div class="border rounded p-1"><div class="fw-bold text-danger" style="font-size:1.3em;">${countBHE}</div><small class="text-muted">Passent BHE</small></div></div>
                <div class="col-3"><div class="border rounded p-1"><div class="fw-bold text-dark" style="font-size:1.3em;">${achMeds.length}</div><small class="text-muted">Méd. ACH</small></div></div>
            </div>
            <table class="table table-sm table-bordered mb-0" style="font-size:0.85em;">
                <thead class="table-light"><tr><th>Médicament</th><th class="text-center">ACB</th><th class="text-center">CIA</th><th class="text-center">BHE</th><th class="text-center">Liaison Alb.</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
            ${totalACB >= 3 ? '<div class="alert alert-warning mt-2 mb-0 py-1 px-2 small"><strong>ACB ≥ 3 :</strong> Risque significatif de confusion, chutes, déclin cognitif chez le sujet âgé</div>' : ''}
            ${countBHE >= 2 ? '<div class="alert alert-danger mt-2 mb-0 py-1 px-2 small"><strong>' + countBHE + ' anticholinergiques passant la BHE :</strong> Risque majeur d\'effets centraux (confusion, hallucinations, déclin cognitif)</div>' : ''}
            ${albWarning}
        </div>
    </div>`;
}

// =========================================================
// PANNEAU DFG / FONCTION RÉNALE
// =========================================================
function renderDFGPanel(dfg, creat, age, poids, sexe) {
    if (dfg <= 0) return '';
    let stade, color, label;
    if (dfg >= 90) { stade = 'G1'; color = 'success'; label = 'Normal ou élevé'; }
    else if (dfg >= 60) { stade = 'G2'; color = 'success'; label = 'Légèrement diminué'; }
    else if (dfg >= 45) { stade = 'G3a'; color = 'warning'; label = 'Modérément diminué'; }
    else if (dfg >= 30) { stade = 'G3b'; color = 'warning'; label = 'Modérément à sévèrement diminué'; }
    else if (dfg >= 15) { stade = 'G4'; color = 'danger'; label = 'Sévèrement diminué'; }
    else { stade = 'G5'; color = 'danger'; label = 'Insuffisance rénale terminale'; }

    let medsAdapt = [];
    activeMeds.forEach(m => {
        let ref = m.db_ref; if (!ref) return;
        if (ref.poso_ren && dfg < 60) medsAdapt.push({ dci: m.dci, poso_ren: ref.poso_ren });
        if ((ref.atb_moderee || ref.atb_severe) && dfg < 60) medsAdapt.push({ dci: m.dci, poso_ren: dfg <= 30 ? (ref.atb_severe || ref.atb_moderee) : ref.atb_moderee });
    });
    // Dédupliquer
    let seen = new Set(); medsAdapt = medsAdapt.filter(m => { if (seen.has(m.dci)) return false; seen.add(m.dci); return true; });

    let adaptHtml = '';
    if (medsAdapt.length > 0) {
        adaptHtml = `<div class="mt-2"><strong class="small text-${color}">Adaptations requises (${medsAdapt.length} méd.) :</strong>
            <ul class="mb-0 ps-3 small">${medsAdapt.map(m => `<li><b>${m.dci}</b> : ${m.poso_ren}</li>`).join('')}</ul></div>`;
    }

    return `<div class="alert alert-light border border-${color} mb-2 shadow-sm">
        <strong class="text-${color}">🧪 DFG estimé : ${dfg} ml/min — Stade ${stade} (${label})</strong>
        ${creat > 0 ? `<br><small class="text-muted">Créatinine : ${creat} µmol/L | Âge : ${age} | Poids : ${poids > 0 ? poids + ' kg' : 'NC'} | Sexe : ${sexe}</small>` : ''}
        ${adaptHtml}
    </div>`;
}

// =========================================================
// FONCTION PRINCIPALE — ANALYSE DE PRESCRIPTION
// =========================================================
function analyserPrescription() {
    if (typeof MASTER_DB === 'undefined') return;

    // Initialisation moteur V2
    if (typeof applyFullIntegration === 'function' && !window.engineInitialized) {
        applyFullIntegration();
        if (typeof GeriaEngineV2 !== 'undefined') {
            GeriaEngineV2.buildIndex();
            window.engineInitialized = true;
        }
    }

    preCalculerScores();
    const patientAge = getVal('patientAge'); const sexe = getStr('patientSexe');
    const isFragile = isChecked('patientFragile') || getVal('scoreCFS') >= 7;
    const poids = getVal('patientPoids');
    const albumSg = getVal('bioAlbumSg');

    const bioValues = {
        'BIO_001': getVal('patientK'), 'BIO_002': getVal('patientNa'), 'BIO_003': getVal('bioCreat'), 'BIO_004': getVal('patientDFG'),
        'BIO_005': getVal('bioCa'), 'BIO_006': getVal('bioMg'), 'BIO_007': getVal('bioUree'), 'BIO_008': getVal('bioUric'),
        'BIO_009': getVal('bioHb'), 'BIO_010': getVal('bioPlaq'), 'BIO_013': getVal('bioAsat'), 'BIO_014': getVal('bioAlat'),
        'BIO_018': getVal('bioCpk'), 'BIO_019': getVal('bioTsh'), 'BIO_020': getVal('bioFer'), 'BIO_021': getVal('bioB12'),
        'BIO_024': getVal('bioCrp'), 'BIO_028': getVal('bioBnp'), 'BIO_031': getVal('bioQtc'),
        'BIO_011': getVal('bioHbA1c'), 'BIO_012': getVal('bioLdl'), 'BIO_022': getVal('bioVitD'), 'BIO_023': getVal('bioAlbumSg'),
        'BIO_032': getVal('bioINR'), 'BIO_033': getVal('bioGlyc'), 'BIO_015': getVal('bioPal'), 'BIO_016': getVal('bioGgt'),
        'BIO_034': getVal('bioPNN'), 'BIO_035': getVal('bioPhos'), 'BIO_036': getVal('bioLact')
    };

    const divs = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact', 'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi', 'alertes-pd'];
    divs.forEach(id => { let el = document.getElementById(id); if(el) el.innerHTML = ''; });
    let counts = { eviter: 0, initier: 0, interact: 0, ansm: 0, auc: 0, bio: 0, usage: 0, suivi: 0, pd: 0 };
    const addAlert = (targetId, htmlStr, countKey) => {
        let el = document.getElementById(targetId); if(!el || !htmlStr) return;
        el.innerHTML += htmlStr; if(countKey) counts[countKey]++;
    };

    // =========================================================
    // 1. MOTEUR EXPERT GERIA ENGINE V2
    // =========================================================
    let divScores = document.getElementById('alertes-scores');

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
    if(albumSg > 0 && albumSg < 30) ctxClinique.push("denutrition_severe");

    const ctx = {
        activeMeds, activeComorbs, bioValues, patientAge, isFragile,
        scoreACB_global, contexte_clinique: ctxClinique
    };

    if (typeof GeriaEngineV2 !== 'undefined') {
        const recos = GeriaEngineV2.evaluer(ctx);
        if (divScores) divScores.innerHTML += GeriaEngineV2.renderDashboard(recos.dashboard);
        document.getElementById('alertes-eviter').innerHTML = GeriaEngineV2.renderAlertesTriees(recos.eviter, 'eviter');
        document.getElementById('alertes-initier').innerHTML = GeriaEngineV2.renderAlertesTriees(recos.initier, 'initier');
        counts.eviter = recos.eviter.length;
        counts.initier = recos.initier.length;
    } else {
        if (divScores) divScores.innerHTML += `<div class="alert alert-danger">Le moteur GeriaEngineV2 est introuvable.</div>`;
    }

    // =========================================================
    // 2. PANNEAU DFG + ANTICHOLINERGIQUE
    // =========================================================
    if (divScores) {
        divScores.innerHTML += renderDFGPanel(bioValues['BIO_004'], bioValues['BIO_003'], patientAge, poids, sexe);
        divScores.innerHTML += renderAnticholinergicPanel(activeMeds, albumSg);
    }

    // =========================================================
    // 3. SCORES CLINIQUES COMPLETS
    // =========================================================
    if (divScores) {
        // --- CHA₂DS₂-VASc ---
        let scoreCha = 0; let ttCha = [];
        if(patientAge >= 75) { scoreCha += 2; ttCha.push("Âge ≥75 (+2)"); } else if(patientAge >= 65) { scoreCha += 1; ttCha.push("Âge ≥65 (+1)"); }
        if(sexe === 'F') { scoreCha += 1; ttCha.push("Femme (+1)"); }
        if(activeComorbs.some(c=>['PAT_001','PAT_002','PAT_003'].includes(c))) { scoreCha += 1; ttCha.push("IC (+1)"); }
        if(activeComorbs.includes('PAT_005')) { scoreCha += 1; ttCha.push("HTA (+1)"); }
        if(activeComorbs.includes('PAT_016')) { scoreCha += 1; ttCha.push("Diabète (+1)"); }
        if(activeComorbs.includes('PAT_008')) { scoreCha += 2; ttCha.push("ATCD AVC (+2)"); }
        if(activeComorbs.some(c=>['PAT_004','PAT_007'].includes(c))) { scoreCha += 1; ttCha.push("Vasc (+1)"); }
        let chaInterp = scoreCha === 0 ? 'Risque faible' : (scoreCha === 1 ? 'Risque intermédiaire' : 'Anticoagulation recommandée');
        divScores.innerHTML += `<div class="alert alert-light border border-info mb-2 shadow-sm"><strong class="text-info">CHA₂DS₂-VASc : ${scoreCha}</strong> — <em class="small">${chaInterp}</em><br><small class="text-muted">${ttCha.join(', ') || 'Aucun critère'}</small></div>`;

        // --- HAS-BLED COMPLET ---
        let scoreHas = 0; let ttHas = [];
        if(isChecked('chkHtaNonControlee')) { scoreHas += 1; ttHas.push("HTA non contrôlée (+1)"); }
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 50) { scoreHas += 1; ttHas.push("IRC DFG<50 (+1)"); }
        if(isChecked('chkFoie')) { scoreHas += 1; ttHas.push("Hépatopathie (+1)"); }
        if(activeComorbs.includes('PAT_008') || isChecked('chkAvc')) { scoreHas += 1; ttHas.push("ATCD AVC (+1)"); }
        if(isChecked('chkSaignement') || isChecked('chkAtcdUlcere')) { scoreHas += 1; ttHas.push("ATCD saignement (+1)"); }
        if(isChecked('chkINRlabile')) { scoreHas += 1; ttHas.push("INR labile (+1)"); }
        if(patientAge > 65) { scoreHas += 1; ttHas.push("Âge >65 (+1)"); }
        if(patientHasMedClass('ains') || patientHasMedClass('antiagreg')) { scoreHas += 1; ttHas.push("AINS/Antiagrégant (+1)"); }
        if(isChecked('chkAlcool')) { scoreHas += 1; ttHas.push("Alcool (+1)"); }
        let hasInterp = scoreHas >= 3 ? 'Risque hémorragique élevé — Prudence anticoagulation' : (scoreHas >= 1 ? 'Risque modéré' : 'Risque faible');
        let hasColor = scoreHas >= 3 ? 'danger' : (scoreHas >= 1 ? 'warning' : 'success');
        divScores.innerHTML += `<div class="alert alert-light border border-${hasColor} mb-2 shadow-sm"><strong class="text-${hasColor}">HAS-BLED : ${scoreHas}/9</strong> — <em class="small">${hasInterp}</em><br><small class="text-muted">${ttHas.join(', ') || 'Aucun critère'}</small></div>`;

        // --- HEMORR₂HAGES ---
        let scoreHem = 0; let ttHem = [];
        if(isChecked('chkFoie')) { scoreHem += 1; ttHem.push("Hépatopathie (+1)"); }
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 50) { scoreHem += 1; ttHem.push("IRC (+1)"); }
        if(isChecked('chkAlcool')) { scoreHem += 1; ttHem.push("Alcool (+1)"); }
        if(activeComorbs.some(c=>['PAT_009','PAT_010','PAT_011','PAT_012'].includes(c))) { scoreHem += 1; ttHem.push("Cancer/Tumeur (+1)"); }
        if(patientAge >= 75) { scoreHem += 1; ttHem.push("Âge ≥75 (+1)"); }
        if(bioValues['BIO_010'] > 0 && bioValues['BIO_010'] < 75) { scoreHem += 1; ttHem.push("Thrombopénie (+1)"); }
        if(isChecked('chkSaignement')) { scoreHem += 2; ttHem.push("ATCD saignement (+2)"); }
        if(isChecked('chkHtaNonControlee')) { scoreHem += 1; ttHem.push("HTA non contrôlée (+1)"); }
        if(bioValues['BIO_009'] > 0 && ((sexe === 'M' && bioValues['BIO_009'] < 13) || (sexe === 'F' && bioValues['BIO_009'] < 12))) { scoreHem += 1; ttHem.push("Anémie (+1)"); }
        if(activeComorbs.includes('PAT_008')) { scoreHem += 1; ttHem.push("ATCD AVC (+1)"); }
        if(isChecked('chkChutes')) { scoreHem += 1; ttHem.push("Risque de chutes (+1)"); }
        let hemInterp = scoreHem >= 4 ? 'Risque hémorragique très élevé' : (scoreHem >= 2 ? 'Risque modéré' : 'Risque faible');
        let hemColor = scoreHem >= 4 ? 'danger' : (scoreHem >= 2 ? 'warning' : 'success');
        divScores.innerHTML += `<div class="alert alert-light border border-${hemColor} mb-2 shadow-sm"><strong class="text-${hemColor}">HEMORR₂HAGES : ${scoreHem}/12</strong> — <em class="small">${hemInterp}</em><br><small class="text-muted">${ttHem.join(', ') || 'Aucun critère'}</small></div>`;

        // --- ORBIT-AF ---
        let scoreOrbit = 0; let ttOrbit = [];
        if(patientAge >= 75) { scoreOrbit += 1; ttOrbit.push("Âge ≥75 (+1)"); }
        if(bioValues['BIO_009'] > 0 && ((sexe === 'M' && bioValues['BIO_009'] < 13) || (sexe === 'F' && bioValues['BIO_009'] < 12))) { scoreOrbit += 2; ttOrbit.push("Anémie (+2)"); }
        if(isChecked('chkSaignement') || isChecked('chkAspirineForte')) { scoreOrbit += 2; ttOrbit.push("ATCD saignement (+2)"); }
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 60) { scoreOrbit += 1; ttOrbit.push("DFG <60 (+1)"); }
        if(patientHasMedClass('antiagreg')) { scoreOrbit += 1; ttOrbit.push("Antiagrégant (+1)"); }
        divScores.innerHTML += `<div class="alert alert-light border border-warning mb-2 shadow-sm"><strong class="text-warning">ORBIT-AF : ${scoreOrbit}</strong><br><small class="text-muted">${ttOrbit.join(', ') || 'Aucun critère'}</small></div>`;

        // --- RISQ-PATH ---
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
        divScores.innerHTML += `<div class="alert alert-light border border-primary mb-2 shadow-sm"><strong class="text-primary">RISQ-PATH : ${scoreRisq}</strong><br><small class="text-muted">${ttRisq.join(', ') || 'Aucun critère'}</small></div>`;

        // --- Tisdale ---
        let scoreTisdale = 0; let ttTisdale = [];
        if(patientAge >= 68) { scoreTisdale += 1; ttTisdale.push("Âge ≥68 (+1)"); }
        if(sexe === 'F') { scoreTisdale += 1; ttTisdale.push("Femme (+1)"); }
        if(patientHasMedClass('diuretique')) { scoreTisdale += 1; ttTisdale.push("Diurétique (+1)"); }
        if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] <= 3.5) { scoreTisdale += 2; ttTisdale.push("HypoK (+2)"); }
        if(bioValues['BIO_006'] > 0 && bioValues['BIO_006'] < 0.7) { scoreTisdale += 1; ttTisdale.push("HypoMg (+1)"); }
        if(bioValues['BIO_031'] >= 500) { scoreTisdale += 3; ttTisdale.push("QTc ≥500 (+3)"); }
        else if(bioValues['BIO_031'] >= 450) { scoreTisdale += 2; ttTisdale.push("QTc ≥450 (+2)"); }
        if(globalQT_CountKR > 0) { scoreTisdale += 3; ttTisdale.push("Médoc QT-KR (+3)"); }
        if(globalQT_CountCR_PR > 0) { scoreTisdale += 1; ttTisdale.push("Médoc QT-CR/PR (+1)"); }
        if(isChecked('chkSepsis')) { scoreTisdale += 1; ttTisdale.push("Sepsis (+1)"); }
        if(activeComorbs.some(c=>['PAT_001','PAT_002','PAT_003'].includes(c))) { scoreTisdale += 1; ttTisdale.push("IC (+1)"); }
        let tisInterp = scoreTisdale >= 11 ? 'Risque élevé de TdP' : (scoreTisdale >= 7 ? 'Risque modéré' : 'Risque faible');
        let tisColor = scoreTisdale >= 11 ? 'danger' : (scoreTisdale >= 7 ? 'warning' : 'secondary');
        divScores.innerHTML += `<div class="alert alert-light border border-${tisColor} mb-2 shadow-sm"><strong class="text-${tisColor}">Tisdale (QTc) : ${scoreTisdale}</strong> — <em class="small">${tisInterp}</em><br><small class="text-muted">${ttTisdale.join(', ') || 'Aucun critère'}</small></div>`;

        // --- Liaison albumine résumé ---
        let highAlbMeds = activeMeds.filter(m => m.db_ref && parseFloat(m.db_ref.albumine) >= 85);
        if (highAlbMeds.length > 0) {
            let albRows = highAlbMeds.map(m => `<b>${m.dci}</b> (${m.db_ref.albumine}%)`).join(', ');
            let albWarn = (albumSg > 0 && albumSg < 35) ? `<br><span class="text-danger fw-bold">Hypoalbuminémie ${albumSg} g/L : fraction libre augmentée, risque de toxicité</span>` : '';
            divScores.innerHTML += `<div class="alert alert-light border border-info mb-2 shadow-sm"><strong class="text-info">🩸 Forte liaison à l'albumine :</strong> ${albRows}${albWarn}</div>`;
        }
    }

    // =========================================================
    // 4. MOTEUR BIOLOGIQUE (Syndromes d'Iatrogénie)
    // =========================================================
    const checkBioSyndrome = (syndId, conditionRemplie) => {
        if(!conditionRemplie) return;
        try {
            let s = MASTER_DB.SYNDROMES[syndId]; if(!s) return;
            let causes = [];
            if(s.IMPUTABILITE_FREQ) s.IMPUTABILITE_FREQ.split(',').map(x=>x.trim()).forEach(c => { if(patientHasMedClass(c)) causes.push(c); });
            let imputStr = causes.length > 0 ? `<br><em>Imputabilité iatrogène :</em> <b>${causes.join(', ').toUpperCase()}</b>` : '';
            let isSevere = String(s.GRAVITE).includes('Sévère') || String(s.GRAVITE).includes('Severe');
            addAlert('alertes-bio', `<div class="alert alert-${isSevere ? 'danger alert-stopp' : 'warning border-warning'} shadow-sm"><strong>${isSevere ? '🚨' : '⚠️'} ${s.NOM_SYNDROME}</strong>${imputStr}<br><em>Conduite :</em> ${s.CONDUITE_IMMEDIATE || 'Surveillance'}</div>`, 'bio');
        } catch(e) {}
    };

    if(bioValues['BIO_013'] > 135 || bioValues['BIO_014'] > 105) checkBioSyndrome('SYND_001', true);
    if(bioValues['BIO_018'] > 850) checkBioSyndrome('SYND_002', true);
    if(bioValues['BIO_031'] >= 450) checkBioSyndrome('SYND_003', true);
    if(bioValues['BIO_001'] > 5.0) checkBioSyndrome('SYND_010', true);
    if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] < 3.5) checkBioSyndrome('SYND_011', true);
    if(bioValues['BIO_002'] > 0 && bioValues['BIO_002'] < 130) checkBioSyndrome('SYND_012', true);
    if(bioValues['BIO_002'] > 145) checkBioSyndrome('SYND_013', true);
    if(bioValues['BIO_009'] > 0 && ((sexe === 'M' && bioValues['BIO_009'] < 10) || (sexe === 'F' && bioValues['BIO_009'] < 9))) checkBioSyndrome('SYND_020', true);
    if(bioValues['BIO_010'] > 0 && bioValues['BIO_010'] < 100) checkBioSyndrome('SYND_021', true);
    if(bioValues['BIO_034'] > 0 && bioValues['BIO_034'] < 1.5) checkBioSyndrome('SYND_022', true);
    if(bioValues['BIO_036'] > 0 && bioValues['BIO_036'] > 4) {
        addAlert('alertes-bio', `<div class="alert alert-danger alert-stopp shadow-sm"><strong>🚨 Hyperlactatémie (${bioValues['BIO_036']} mmol/L)</strong><br>Rechercher acidose lactique iatrogène (metformine, INTI, linézolide)<br><em>Conduite : arrêt médicament suspect, hydratation</em></div>`, 'bio');
    }

    // =========================================================
    // 5. MOTEUR DES INTERACTIONS (TABAC, DDI, ANSM & AUC)
    // =========================================================
    try {
        if (isChecked('chkTabac')) {
            let cyp1a2_drugs = ['clozapine', 'olanzapine', 'duloxetine', 'theophylline', 'erlotinib', 'haloperidol', 'fluvoxamine', 'agomelatine'];
            let affected = activeMeds.filter(m => cyp1a2_drugs.some(d => sanitizeText(m.dci).includes(d)));
            if (affected.length > 0) {
                let medNames = affected.map(m => m.dci.toUpperCase()).join(', ');
                addAlert('alertes-auc', `<div class="alert alert-warning border-warning shadow-sm"><strong style="color:#d97706;">🚬 Interaction Tabac (Induction CYP1A2)</strong><br>Efficacité diminuée de : <b>${medNames}</b>.<br><em class="text-danger small">Arrêt brutal = risque de surdosage.</em></div>`, 'auc');
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
                    addAlert('alertes-interact', `<div class="alert alert-danger shadow-sm"><strong>🚨 Co-prescription à risque : ${ref.dci.toUpperCase()}</strong><br>Interaction avec : <b>${found.join(', ')}</b></div>`, 'interact');
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

                if ((dciA.includes('ritonavir') && dciB.includes('quetiapine')) || (dciB.includes('ritonavir') && dciA.includes('quetiapine'))) matchesAuc.push({ auc_ratio: 6.2, mechanism: "Inhibition puissante CYP3A4", note: "FDA" });
                if ((dciA.includes('clarithromycin') && dciB.includes('quetiapine')) || (dciB.includes('clarithromycin') && dciA.includes('quetiapine'))) matchesAuc.push({ auc_ratio: 2.8, mechanism: "Inhibition forte CYP3A4", note: "PK" });
                if ((dciA.includes('ritonavir') && dciB.includes('apixaban')) || (dciB.includes('ritonavir') && dciA.includes('apixaban'))) matchesAuc.push({ auc_ratio: 2.5, mechanism: "Inhibition CYP3A4 & P-gp", note: "FDA" });
                if ((dciA.includes('clarithromycin') && dciB.includes('apixaban')) || (dciB.includes('clarithromycin') && dciA.includes('apixaban'))) matchesAuc.push({ auc_ratio: 1.6, mechanism: "Inhibition CYP3A4", note: "PK" });

                if (matchesAuc.length > 0) {
                    if(!groupedAuc[pairName]) groupedAuc[pairName] = { items: [] };
                    matchesAuc.forEach(m => { if(!isNaN(parseFloat(m.auc_ratio))) groupedAuc[pairName].items.push(m); });
                }

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
                                groupedAnsm[pairName].raw.push({ level: niveau, desc, isDanger, source: 'ANSM' });
                            }
                        }
                    });
                }

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
                                groupedAnsm[pairName].raw.push({ level: niveau, desc, isDanger, source: d.source || 'BNF+Micromedex' });
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
            addAlert('alertes-auc', `<div class="alert alert-warning border-warning shadow-sm"><strong>📈 PK (AUC) : ${pair}</strong><ul class="mb-0 ps-3">${detailsHtml}</ul></div>`, 'auc');
        }

        for (const [pair, data] of Object.entries(groupedAnsm)) {
            let boxClass = data.isDanger ? "danger alert-stopp" : "warning";
            let itemsHtml = data.raw.map(x => `<li style="margin-bottom:6px;"><span class="${x.isDanger ? 'text-danger' : 'text-dark'} fw-bold">${x.isDanger ? '🔴' : '🟠'} ${x.level}</span><br><span class="small text-muted">${x.desc}</span></li>`).join('');
            addAlert('alertes-ansm', `<div class="alert alert-${boxClass} shadow-sm"><strong>${data.isDanger ? '🚨' : '⚡'} ANSM : ${pair}</strong><ul class="mb-0 ps-3">${itemsHtml}</ul></div>`, 'ansm');
        }
    } catch(e) { console.error("Erreur Interactions", e); }

    // =========================================================
    // 6. INTERACTIONS PHARMACODYNAMIQUES (PD)
    // =========================================================
    const pdResults = detecterInteractionsPD(activeMeds);
    if (pdResults.length > 0) {
        pdResults.forEach(pd => {
            let html = `<div class="alert alert-${pd.color} shadow-sm" style="border-left: 5px solid var(--bs-${pd.color});">
                <strong>${pd.icon} ${pd.label} (${pd.count} médicaments)</strong>
                <br><span class="small">${pd.drugs.map(d => `<span class="badge bg-${pd.color} ${pd.color === 'warning' ? 'text-dark' : ''} me-1">${d}</span>`).join('')}</span>
                <br><em class="small text-dark">${pd.message}</em>
            </div>`;
            addAlert('alertes-pd', html, 'pd');
        });
    }

    // =========================================================
    // 7. POSOLOGIES ET PROTOCOLES BIOLOGIQUES
    // =========================================================
    activeMeds.forEach(m => {
        let ref = m.db_ref; if (!ref) return;
        let hasPoso = ref.poso_hab || ref.poso_ger || ref.poso_ren || ref.atb_legere || ref.atb_moderee || ref.atb_severe;
        let dfg = bioValues['BIO_004']; let alb = parseFloat(ref.albumine) || 0;

        if (hasPoso || alb >= 85) {
            let html = `<div class="alert alert-success border border-success shadow-sm"><strong class="text-success">💊 ${ref.dci.toUpperCase()}</strong><br>`;
            if (ref.poso_hab) html += `<em>Standard :</em> ${ref.poso_hab}<br>`;
            if (ref.poso_ger) html += `<em>👴 Gériatrique :</em> <b>${ref.poso_ger}</b><br>`;
            if (ref.poso_ren) {
                let isDanger = (dfg > 0 && dfg < 50 && (ref.poso_ren.toLowerCase().includes('ci') || ref.poso_ren.toLowerCase().includes('contre-ind')));
                let color = isDanger ? 'text-danger fw-bold' : (dfg > 0 && dfg < 50 ? 'text-warning text-dark fw-bold' : 'text-dark');
                html += `<span class="${color}"><em>🧪 Fonction Rénale :</em> ${ref.poso_ren}</span><br>`;
            }
            if (ref.atb_legere || ref.atb_moderee || ref.atb_severe) {
                let isLegere = (dfg > 60 && dfg <= 90); let isModeree = (dfg > 30 && dfg <= 60); let isSevere = (dfg > 15 && dfg <= 30); let isTerminale = (dfg > 0 && dfg <= 15);
                html += `<div class="mt-2 p-2 bg-white rounded border border-success border-opacity-50"><b>Adaptations ATB / DFG :</b><br>`;
                if(ref.atb_legere) html += `<span class="${isLegere ? 'bg-warning bg-opacity-25 fw-bold px-1 rounded' : 'text-muted'}">Légère (60-90) : ${ref.atb_legere}</span><br>`;
                if(ref.atb_moderee) html += `<span class="${isModeree ? 'bg-warning bg-opacity-50 fw-bold px-1 rounded' : 'text-muted'}">Modérée (30-60) : ${ref.atb_moderee}</span><br>`;
                if(ref.atb_severe) html += `<span class="${isSevere ? 'bg-danger text-white fw-bold px-1 rounded' : 'text-muted'}">Sévère (15-30) : ${ref.atb_severe}</span><br>`;
                if(ref.atb_terminale) html += `<span class="${isTerminale ? 'bg-danger text-white fw-bold px-1 rounded' : 'text-muted'}">Terminale (<15) : ${ref.atb_terminale}</span>`;
                html += `</div>`;
            }
            if (alb >= 85) html += `<span class="text-danger small d-block border-top pt-1 mt-1"><em>🩸 Liaison albumine :</em> <b>${alb}%</b>${albumSg > 0 && albumSg < 35 ? ' — <b>HYPOALBUMINÉMIE : surdosage probable</b>' : ''}</span>`;
            html += `</div>`;
            addAlert('alertes-usage', html, 'usage');
        }

        if (ref.suivi_initial || ref.suivi_periodique || ref.alerte_clinique) {
            let sHtml = `<div class="alert alert-light border border-primary shadow-sm"><strong class="text-primary">👁️ Suivi : ${ref.dci.toUpperCase()}</strong><hr class="mt-2 mb-2" style="opacity:0.15;">`;
            if (ref.suivi_initial) sHtml += `<div class="mb-2"><b>Initial :</b> ${formatSuiviList(ref.suivi_initial)}</div>`;
            if (ref.suivi_periodique) sHtml += `<div class="mb-2"><b>Régulier :</b> ${formatSuiviList(ref.suivi_periodique)}</div>`;
            if (ref.alerte_clinique) sHtml += `<div style="color:#d97706;"><b>⚠️ À surveiller :</b> ${formatSuiviList(ref.alerte_clinique)}</div>`;
            let anomalies = [];
            if(Array.isArray(ref.bio_cible)) {
                ref.bio_cible.forEach(bio_id => {
                    let val = bioValues[bio_id];
                    if (val > 0) {
                        if (bio_id === 'BIO_004' && val < 60) anomalies.push(`🧪 DFG abaissé (${val} ml/min)`);
                        if (bio_id === 'BIO_001' && (val < 3.5 || val > 5.0)) anomalies.push(`🩸 Dyskaliémie (${val} mmol/L)`);
                        if (bio_id === 'BIO_031' && val >= 450) anomalies.push(`⚡ QTc allongé (${val} ms)`);
                    }
                });
            }
            if (anomalies.length > 0) sHtml += `<div class="mt-3 p-2 bg-danger bg-opacity-10 border border-danger text-danger rounded"><b>Anomalies :</b><br>` + anomalies.join('<br>') + `</div>`;
            sHtml += `</div>`;
            addAlert('alertes-suivi', sHtml, 'suivi');
        }
    });

    // Protocoles par pathologie
    if (typeof getRequiredBioMonitoring === 'function' && activeComorbs.length > 0) {
        try {
            const bioMonitors = getRequiredBioMonitoring(activeComorbs);
            for (const [bioId, data] of Object.entries(bioMonitors)) {
                let pNames = data.pathos.map(p => MASTER_DB.PATHOLOGIES[p]?.NOM_STANDARD || p).join(', ');
                addAlert('alertes-suivi', `<div class="alert alert-info border-info shadow-sm">
                    <strong class="text-info">🧪 Bio Recommandée : ${MASTER_DB.BIOLOGIE[bioId]?.NOM_STANDARD || bioId}</strong>
                    <br><small><b>Pathologie(s) :</b> ${pNames}</small>
                    <br><small><b>Fréquence :</b> ${data.frequences.join(' / ')}</small>
                    <br><span class="badge bg-secondary mt-1" style="font-size:0.65em;">${data.sources.join(', ')}</span>
                </div>`, 'suivi');
            }
        } catch(e) { console.error("Erreur BioMonitor:", e); }
    }

    // =========================================================
    // 8. MESSAGES PAR DÉFAUT
    // =========================================================
    if(counts.eviter === 0) document.getElementById('alertes-eviter').innerHTML = '<div class="alert alert-light">Aucune prescription inappropriée détectée.</div>';
    if(counts.initier === 0) document.getElementById('alertes-initier').innerHTML = '<div class="alert alert-light">Aucune omission majeure détectée.</div>';
    if(counts.usage === 0) document.getElementById('alertes-usage').innerHTML = '<div class="alert alert-light">Aucune adaptation posologique spécifique.</div>';
    if(counts.suivi === 0) document.getElementById('alertes-suivi').innerHTML = '<div class="alert alert-light">Aucun suivi biologique spécifique.</div>';
    if(counts.ansm === 0) document.getElementById('alertes-ansm').innerHTML = '<div class="alert alert-light">Aucune interaction ANSM détectée.</div>';
    if(counts.interact === 0) document.getElementById('alertes-interact').innerHTML = '<div class="alert alert-light">Aucun risque clinique détecté.</div>';
    if(counts.bio === 0) document.getElementById('alertes-bio').innerHTML = '<div class="alert alert-light">Aucune anomalie syndromique biologique.</div>';
    if(counts.auc === 0) document.getElementById('alertes-auc').innerHTML = '<div class="alert alert-light">Aucune interaction pharmacocinétique détectée.</div>';
    if(counts.pd === 0) document.getElementById('alertes-pd').innerHTML = '<div class="alert alert-light">Aucune interaction pharmacodynamique additive détectée.</div>';

    document.getElementById('btnPdf').style.display = 'inline-block';
    document.getElementById('btnCopier').style.display = 'inline-block';
}
