// app_core.js - V7.0 (v0.44 — escapeHtml, nettoyage code mort)
let activeComorbs = []; let activeMeds = []; window.suspendedMeds = [];
let globalQT_CountKR = 0; let globalQT_CountCR_PR = 0; let scoreACB_global = 0; let scoreCIA_global = 0;
let maxQTLevel_global = 0; let infoQT_global = [];
const unifiedMedsMap = new Map(); const allComorbs = [];

// Échappement HTML — prévient les injections XSS dans les interpolations
const escapeHtml = str => {
    if (!str) return "";
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

// Nettoyeur universel (enlève accents, espaces, majuscules)
const sanitizeText = (() => {
    const _cache = new Map();
    return str => {
        if (!str) return "";
        const k = String(str);
        let v = _cache.get(k);
        if (v !== undefined) return v;
        v = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
        _cache.set(k, v);
        if (_cache.size > 5000) _cache.clear(); // éviter fuite mémoire
        return v;
    };
})();

// ============================================================================
// EXPORT PDF & COPIE SYNTHÈSE
// ============================================================================

/**
 * Construit le texte brut de la synthèse (réutilisé par PDF et copier).
 */
function buildSyntheseText() {
    const age = document.getElementById('patientAge')?.value || '';
    const sexe = document.getElementById('patientSexe')?.value || '';
    const poids = document.getElementById('patientPoids')?.value || '';
    const dfg = document.getElementById('patientDFG')?.value || '';

    let lines = [];
    lines.push('=== SYNTHÈSE GERIAASSIST ===');
    lines.push(`Date : ${new Date().toLocaleDateString('fr-FR')}`);
    lines.push(`Patient : ${age} ans | ${sexe === 'F' ? 'Femme' : 'Homme'}${poids ? ' | ' + poids + ' kg' : ''}${dfg ? ' | DFG ' + dfg + ' ml/min' : ''}`);
    lines.push('');

    // Comorbidités
    lines.push('--- COMORBIDITÉS ---');
    if (activeComorbs.length === 0) {
        lines.push('Aucune comorbidité sélectionnée.');
    } else {
        activeComorbs.forEach(c => {
            const nom = (typeof MASTER_DB !== 'undefined' && MASTER_DB.PATHOLOGIES[c]) ? MASTER_DB.PATHOLOGIES[c].NOM_STANDARD : c;
            lines.push('• ' + nom);
        });
    }
    lines.push('');

    // Médicaments
    lines.push('--- MÉDICAMENTS ---');
    if (activeMeds.length === 0) {
        lines.push('Aucun médicament saisi.');
    } else {
        activeMeds.forEach(m => lines.push('• ' + m.dci + (m.classe ? ' (' + m.classe + ')' : '')));
    }
    lines.push('');

    // Scores — extraire le texte du div
    const divScores = document.getElementById('alertes-scores');
    if (divScores && divScores.innerText.trim()) {
        lines.push('--- SCORES CLINIQUES ---');
        divScores.querySelectorAll('.alert').forEach(a => {
            lines.push(a.innerText.replace(/\n+/g, ' | ').trim());
        });
        lines.push('');
    }

    // Conclusions par onglet
    const tabs = [
        { id: 'alertes-eviter', titre: 'PRESCRIPTIONS INAPPROPRIÉES (ÉVITER)' },
        { id: 'alertes-initier', titre: 'OMISSIONS THÉRAPEUTIQUES (INITIER)' },
        { id: 'alertes-interact', titre: 'INTERACTIONS CLINIQUES' },
        { id: 'alertes-ansm', titre: 'INTERACTIONS ANSM' },
        { id: 'alertes-bio', titre: 'SYNDROMES BIOLOGIQUES' },
        { id: 'alertes-usage', titre: 'ADAPTATIONS POSOLOGIQUES' },
        { id: 'alertes-suivi', titre: 'SUIVI BIOLOGIQUE' },
        { id: 'alertes-guidelines', titre: 'GUIDELINES PAR PATHOLOGIE' }
    ];
    tabs.forEach(t => {
        const el = document.getElementById(t.id);
        if (el && el.innerText.trim()) {
            lines.push('--- ' + t.titre + ' ---');
            el.querySelectorAll('.alert').forEach(a => {
                let txt = a.innerText.replace(/\n+/g, ' | ').trim();
                if (txt) lines.push('• ' + txt);
            });
            lines.push('');
        }
    });

    return lines.join('\n');
}

/**
 * Construit un élément HTML formaté pour l'export PDF (1 page, compact).
 */
function buildPdfContent() {
    const age = document.getElementById('patientAge')?.value || '—';
    const sexe = document.getElementById('patientSexe')?.value || '';
    const poids = document.getElementById('patientPoids')?.value || '';
    const dfg = document.getElementById('patientDFG')?.value || '';

    let html = `<div style="font-family:Arial,sans-serif;font-size:9px;color:#222;line-height:1.3;padding:8px;">`;

    // En-tête
    html += `<div style="border-bottom:2px solid #0d6efd;padding-bottom:4px;margin-bottom:6px;">
        <strong style="font-size:13px;color:#0d6efd;">GeriaAssist — Synthèse</strong>
        <span style="float:right;font-size:8px;color:#888;">${new Date().toLocaleDateString('fr-FR')}</span>
        <br><span style="font-size:9px;">Patient : ${age} ans | ${sexe === 'F' ? 'Femme' : 'Homme'}${poids ? ' | ' + poids + ' kg' : ''}${dfg ? ' | DFG ' + dfg + ' ml/min' : ''}</span>
    </div>`;

    // 2 colonnes : Comorbidités + Médicaments
    html += `<div style="display:flex;gap:8px;margin-bottom:6px;">`;

    // Comorbidités
    html += `<div style="flex:1;border:1px solid #ccc;border-radius:4px;padding:4px;">
        <strong style="font-size:9px;color:#0d6efd;">Comorbidités</strong><br>`;
    if (activeComorbs.length === 0) {
        html += `<em>Aucune</em>`;
    } else {
        activeComorbs.forEach(c => {
            const nom = (typeof MASTER_DB !== 'undefined' && MASTER_DB.PATHOLOGIES[c]) ? MASTER_DB.PATHOLOGIES[c].NOM_STANDARD : c;
            html += `<span style="display:inline-block;background:#e7f1ff;border-radius:3px;padding:1px 4px;margin:1px;font-size:8px;">${escapeHtml(nom)}</span>`;
        });
    }
    html += `</div>`;

    // Médicaments
    html += `<div style="flex:1;border:1px solid #ccc;border-radius:4px;padding:4px;">
        <strong style="font-size:9px;color:#0d6efd;">Médicaments (${activeMeds.length})</strong><br>`;
    if (activeMeds.length === 0) {
        html += `<em>Aucun</em>`;
    } else {
        activeMeds.forEach(m => {
            html += `<span style="display:inline-block;background:#fff3cd;border-radius:3px;padding:1px 4px;margin:1px;font-size:8px;">${escapeHtml(m.dci)}</span>`;
        });
    }
    html += `</div></div>`;

    // Scores — version compacte
    const divScores = document.getElementById('alertes-scores');
    if (divScores && divScores.querySelectorAll('.alert').length > 0) {
        html += `<div style="border:1px solid #0dcaf0;border-radius:4px;padding:4px;margin-bottom:6px;">
            <strong style="font-size:9px;color:#0dcaf0;">Scores cliniques</strong><br>`;
        divScores.querySelectorAll('.alert').forEach(a => {
            const strong = a.querySelector('strong');
            const concl = a.querySelectorAll('small');
            const label = strong ? strong.textContent.trim() : '';
            const detail = concl.length >= 2 ? concl[concl.length - 1].textContent.trim() : '';
            html += `<div style="margin:2px 0;"><strong style="font-size:8px;">${label}</strong> <span style="font-size:8px;color:#555;">${detail}</span></div>`;
        });
        html += `</div>`;
    }

    // Alertes par section
    const sections = [
        { id: 'alertes-eviter', titre: 'Prescriptions inappropriées', color: '#dc3545' },
        { id: 'alertes-initier', titre: 'Omissions thérapeutiques', color: '#198754' },
        { id: 'alertes-interact', titre: 'Interactions cliniques', color: '#fd7e14' },
        { id: 'alertes-ansm', titre: 'Interactions ANSM', color: '#6f42c1' },
        { id: 'alertes-bio', titre: 'Syndromes biologiques', color: '#20c997' },
        { id: 'alertes-usage', titre: 'Adaptations posologiques', color: '#0d6efd' },
        { id: 'alertes-suivi', titre: 'Suivi biologique', color: '#6c757d' },
        { id: 'alertes-guidelines', titre: 'Guidelines par pathologie', color: '#6f42c1' }
    ];

    sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const alerts = el.querySelectorAll('.alert');
        // Ne pas afficher les sections vides (texte "Aucune..." seulement)
        if (alerts.length === 0) return;
        const hasContent = Array.from(alerts).some(a => !a.classList.contains('alert-light') || a.querySelectorAll('strong').length > 1);
        if (!hasContent && alerts.length === 1 && alerts[0].textContent.includes('Aucun')) return;

        html += `<div style="border-left:3px solid ${s.color};padding-left:5px;margin-bottom:4px;">
            <strong style="font-size:9px;color:${s.color};">${s.titre} (${alerts.length})</strong>`;
        alerts.forEach(a => {
            const strong = a.querySelector('strong');
            const title = strong ? strong.textContent.trim() : a.textContent.substring(0, 80).trim();
            html += `<div style="font-size:8px;margin:1px 0;">• ${title}</div>`;
        });
        html += `</div>`;
    });

    html += `<div style="text-align:center;margin-top:6px;font-size:7px;color:#aaa;">Document généré par GeriaAssist — Usage professionnel uniquement</div>`;
    html += `</div>`;
    return html;
}

/**
 * Exporte la synthèse en PDF via html2pdf.js (1 page A4).
 */
window.exporterPDF = function() {
    const content = document.createElement('div');
    content.innerHTML = buildPdfContent();

    const opt = {
        margin: [5, 5, 5, 5],
        filename: 'GeriaAssist_Synthese_' + new Date().toISOString().slice(0, 10) + '.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] }
    };

    html2pdf().set(opt).from(content).save();
};

/**
 * Copie la synthèse texte dans le presse-papier.
 */
window.copierSynthese = function() {
    const texte = buildSyntheseText();
    navigator.clipboard.writeText(texte).then(() => {
        const btn = document.getElementById('btnCopier');
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '✅ Copié !';
            btn.classList.replace('btn-outline-primary', 'btn-success');
            setTimeout(() => { btn.innerHTML = orig; btn.classList.replace('btn-success', 'btn-outline-primary'); }, 2000);
        }
    }).catch(() => {
        alert('Impossible de copier. Vérifiez les permissions du navigateur.');
    });
};

// ============================================================================
// RESET PATIENT — Efface toutes les données pour un nouveau patient
// ============================================================================
window.resetPatient = function() {
    // 1. Vider les listes actives
    activeComorbs.length = 0;
    activeMeds.length = 0;
    window.suspendedMeds.length = 0;

    // 2. Réinitialiser les scores globaux
    globalQT_CountKR = 0; globalQT_CountCR_PR = 0;
    scoreACB_global = 0; scoreCIA_global = 0;
    maxQTLevel_global = 0; infoQT_global.length = 0;

    // 3. Remettre les champs du formulaire à leurs valeurs par défaut
    const defaults = {
        'patientAge': '80', 'patientSexe': 'F', 'patientPoids': '', 'patientBmi': '',
        'bioCreat': '', 'patientDFG': '45', 'dfgMethodSelect': 'manuel',
        'patientK': '4.0', 'patientNa': '140', 'bioAlbumSg': '',
        'bioUree': '', 'bioMg': '', 'bioCa': '', 'bioUric': '',
        'bioHb': '', 'bioPlaq': '', 'bioFer': '', 'bioCst': '', 'bioB12': '',
        'bioB9': '', 'bioVitD': '', 'bioCpk': '',
        'bioAsat': '', 'bioAlat': '', 'bioPal': '', 'bioGgt': '',
        'bioTsh': '', 'bioT4': '', 'bioT3': '', 'bioBnp': '',
        'bioLdl': '', 'bioHdl': '', 'bioTg': '', 'bioCrp': '',
        'bioGb': '', 'bioPnn': '', 'bioInr': '', 'bioGly': '',
        'bioHba1c': '', 'bioBili': '', 'bioPhos': '', 'bioLact': '',
        'bioPct': '', 'bioLithium': '', 'bioLipase': '', 'bioDdim': '', 'bioTropo': '', 'bioTemp': '',
        'scoreCFS': '0', 'bioQtc': '',
        'cpBili': '1', 'cpAlb': '1', 'cpTp': '1', 'cpAscite': '1', 'cpEnceph': '1'
    };
    for (const [id, val] of Object.entries(defaults)) {
        const el = document.getElementById(id);
        if (el) el.value = val;
    }

    // 4. Décocher toutes les checkboxes
    const checkboxes = [
        'chkStent', 'chkAlcool', 'chkAnorexie', 'chkTabac',
        'chkAvc', 'chkTvp', 'chkSaignement', 'chkBrady', 'chkHtaNonControlee',
        'chkArret', 'chkScaAigu', 'chkLqts',
        'chkDialyse', 'chkFoie', 'chkSepsis',
        'chkPalliatif', 'chkAtcdUlcere', 'chkChutes', 'chkDepression',
        'chkIncontinence', 'chkHbp', 'chkConstipation', 'chkDysphagie',
        'chkGlaucome', 'chkStenoseAortique', 'chkAspirineForte',
        'patientFragile'
    ];
    checkboxes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });

    // 5. Vider l'affichage des tags et résultats
    if (typeof renderTags === 'function') renderTags();

    const divs = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact',
                   'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi', 'alertes-guidelines'];
    divs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<span class="text-muted">Cliquez sur Analyser...</span>';
    });

    // 6. Masquer les boutons d'export
    const btnPdf = document.getElementById('btnPdf');
    const btnCopier = document.getElementById('btnCopier');
    if (btnPdf) btnPdf.style.display = 'none';
    if (btnCopier) btnCopier.style.display = 'none';

    // 7. Réinitialiser le style DFG
    const dfgInput = document.getElementById('patientDFG');
    if (dfgInput) dfgInput.className = 'form-control fw-bold';

    // 8. Remettre le premier onglet actif
    const firstTab = document.querySelector('#myTab .nav-link');
    if (firstTab) {
        document.querySelectorAll('#myTab .nav-link').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => { p.classList.remove('show', 'active'); });
        firstTab.classList.add('active');
        const target = document.querySelector(firstTab.getAttribute('data-bs-target'));
        if (target) { target.classList.add('show', 'active'); }
    }
};

const patientHasMedClass = (classOrDci) => {
    let t = sanitizeText(classOrDci);
    return activeMeds.some(m => {
        let mDci = sanitizeText(m.dci); let mClasse = sanitizeText(m.classe);
        if(mDci.includes(t) || mClasse.includes(t)) return true;
        return matchesDrugClass(mDci, mClasse, t);
    });
};
