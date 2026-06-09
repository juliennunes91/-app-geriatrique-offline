// app_core.js - V9.0 (v0.49 — refactored: state in patient_state.js, utils in utils.js)
// activeComorbs, activeMeds, suspendedMeds, scores → définis dans patient_state.js
// escapeHtml, sanitizeText, getVal, getStr, isChecked → définis dans utils.js
const unifiedMedsMap = new Map(); const allComorbs = [];

// ============================================================================
// MINI-LOGGER — Niveaux debug/info/warn/error avec timestamp
// ============================================================================
const GeriaLog = (() => {
    let _level = 1; // 0=debug, 1=info, 2=warn, 3=error
    const _ts = () => new Date().toISOString().slice(11, 23);
    return {
        setLevel: l => _level = l,
        debug: (...a) => { if (_level <= 0) console.debug(`[${_ts()}] 🔍`, ...a); },
        info:  (...a) => { if (_level <= 1) console.log(`[${_ts()}] ℹ️`, ...a); },
        warn:  (...a) => { if (_level <= 2) console.warn(`[${_ts()}] ⚠️`, ...a); },
        error: (...a) => { if (_level <= 3) console.error(`[${_ts()}] ❌`, ...a); }
    };
})();

// ============================================================================
// EXPORT / IMPORT PATIENT JSON
// ============================================================================
window.exporterPatientJSON = function() {
    const data = _collectPatientData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const nomPatient = (document.getElementById('patientNom')?.value || 'Patient').replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ_ -]/g, '');
    a.href = url; a.download = `GeriaAssist_${nomPatient}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    GeriaLog.info('Patient exporté en JSON');
};

window.importerPatientJSON = function() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                _restorePatientData(data);
                GeriaLog.info('Patient importé depuis JSON');
            } catch (err) { GeriaLog.error('Erreur import JSON:', err); alert('Fichier JSON invalide.'); }
        };
        reader.readAsText(file);
    };
    input.click();
};

function _collectPatientData() {
    const fields = {};
    document.querySelectorAll('#patientNom, #patientAge, #patientSexe, #patientPoids, #patientBmi, #bioCreat, #patientDFG, #dfgMethodSelect, #patientK, #patientNa, #bioAlbumSg, #bioUree, #bioMg, #bioCa, #bioUric, #bioHb, #bioPlaq, #bioFer, #bioCst, #bioB12, #bioB12Unit, #bioB9, #bioB9Unit, #bioVitD, #bioVitDUnit, #bioCpk, #bioAsat, #bioAlat, #bioPal, #bioGgt, #bioTsh, #bioT4, #bioT3, #bioBnp, #bioLdl, #bioHdl, #bioTg, #bioCrp, #bioGb, #bioPnn, #bioInr, #bioGly, #bioHba1c, #bioBili, #bioPhos, #bioLact, #bioPct, #bioLithium, #bioLipase, #bioDdim, #bioTropo, #bioTemp, #bioDigox, #bioDigoxUnit, #bioTp, #bioTca, #bioChlore, #bioOsm, #bioPrealb, #bioAlbuminurie, #bioVgm, #bioRetic, #scoreCFS, #bioQtc, #cpManual, #cpBili, #cpAlb, #cpTp, #cpAscite, #cpEnceph').forEach(el => {
        if (el) fields[el.id] = el.value;
    });
    const checkboxes = {};
    document.querySelectorAll('.form-check-input[type="checkbox"]').forEach(el => {
        if (el.id) checkboxes[el.id] = el.checked;
    });
    return {
        version: '0.45',
        date: new Date().toISOString(),
        fields, checkboxes,
        comorbs: [...activeComorbs],
        meds: activeMeds.map(m => ({ dci: m.dci, classe: m.classe, label: m.label, core_id: m.core_id })),
        suspended: window.suspendedMeds.map(m => ({ dci: m.dci, classe: m.classe, label: m.label, core_id: m.core_id }))
    };
}

function _restorePatientData(data) {
    if (!data || !data.fields) return;
    // Reset first
    resetPatient();
    // Restore form fields
    for (const [id, val] of Object.entries(data.fields)) {
        const el = document.getElementById(id); if (el) el.value = val;
    }
    // Restore checkboxes
    if (data.checkboxes) {
        for (const [id, val] of Object.entries(data.checkboxes)) {
            const el = document.getElementById(id); if (el) el.checked = val;
        }
    }
    // Synchroniser la visibilité des cascades (démence, MCI, psychose primaire,
    // delirium, sommeil) pour que l'utilisateur voie ce qui est coché.
    // Sans cela, le parent reste coché en arrière-plan et PAT_010 apparaît dans
    // les recos alors que la cascade est masquée (bug d'affichage fantôme).
    if (typeof window.toggleCascade === 'function') {
        [
            ['chkDemence',   'cascadeDemence'],
            ['chkMci',       'cascadeMci'],
            ['chkPsyPrim',   'cascadePsyPrim'],
            ['chkDelirium',  'cascadeDelirium'],
            ['chkSommeil',   'cascadeSommeil']
        ].forEach(([p, c]) => window.toggleCascade(p, c));
    }
    // Restore comorbs
    if (data.comorbs) {
        data.comorbs.forEach(c => { if (!activeComorbs.includes(c)) activeComorbs.push(c); });
    }
    // Restore meds — need to look up db_ref from unifiedMedsMap
    if (data.meds) {
        data.meds.forEach(m => {
            const key = sanitizeText(m.dci);
            const dbData = unifiedMedsMap.get(key);
            if (dbData && !activeMeds.some(am => sanitizeText(am.dci) === key)) {
                activeMeds.push({ label: m.label || m.dci, core_id: m.core_id || key, dci: m.dci, classe: m.classe || dbData.classe, albumine: dbData.albumine || 0, db_ref: dbData.db_ref });
            }
        });
    }
    if (data.suspended) {
        data.suspended.forEach(m => {
            const key = sanitizeText(m.dci);
            const dbData = unifiedMedsMap.get(key);
            if (dbData) {
                window.suspendedMeds.push({ label: m.label || m.dci, core_id: m.core_id || key, dci: m.dci, classe: m.classe || dbData.classe, albumine: dbData.albumine || 0, db_ref: dbData.db_ref });
            }
        });
    }
    if (typeof renderTags === 'function') renderTags();
    if (typeof calculerDFG === 'function') calculerDFG(false);
}

// ============================================================================
// A11Y — Auto-injection d'aria-label sur inputs sans label associé
// ============================================================================
// Bio inputs ont un texte adjacent mais pas de <label for>. Au chargement
// on infère le label depuis le texte précédent (label, span, small) pour
// satisfaire WCAG 1.3.1 et 4.1.2 (screen readers).
function _autoLabelInputs() {
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.type === 'hidden' || !el.id) return;
        if (document.querySelector(`label[for="${el.id}"]`)) return;
        if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return;
        // Stratégie : remonter dans le parent jusqu'à trouver un texte significatif
        let candidate = '';
        let node = el.previousElementSibling;
        while (node && !candidate) {
            const t = (node.textContent || '').trim();
            if (t.length >= 2 && t.length <= 80) candidate = t;
            node = node.previousElementSibling;
        }
        if (!candidate && el.parentElement) {
            const txt = (el.parentElement.textContent || '').replace(el.value || '', '').trim();
            if (txt.length >= 2 && txt.length <= 80) candidate = txt;
        }
        if (!candidate) candidate = el.placeholder || el.id;
        el.setAttribute('aria-label', candidate.replace(/\s+/g, ' ').slice(0, 80));
    });
}
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _autoLabelInputs);
    else _autoLabelInputs();
}

// ============================================================================
// SESSION STORAGE — Sauvegarde automatique du dernier patient
// ============================================================================
window._saveSession = function() {
    try {
        sessionStorage.setItem('geriaassist_session', JSON.stringify(_collectPatientData()));
    } catch(e) { GeriaLog.warn('Session save failed (quota?):', e.message); }
};

window._restoreSession = function() {
    try {
        const raw = sessionStorage.getItem('geriaassist_session');
        if (!raw) return false;
        const data = JSON.parse(raw);
        _restorePatientData(data);
        return true;
    } catch(e) { GeriaLog.warn('Session restore failed:', e.message); return false; }
};

// ============================================================================
// EXPORT PDF & COPIE SYNTHÈSE
// ============================================================================

/**
 * Construit le texte brut de la synthèse (réutilisé par PDF et copier).
 */
function buildSyntheseText() {
    const nom = document.getElementById('patientNom')?.value || '';
    const age = document.getElementById('patientAge')?.value || '';
    const sexe = document.getElementById('patientSexe')?.value || '';
    const poids = document.getElementById('patientPoids')?.value || '';
    const dfg = document.getElementById('patientDFG')?.value || '';
    const reg = window._analysisRegistry;
    const sd = (reg && reg.synthData) ? reg.synthData : null;

    let lines = [];
    lines.push('=== SYNTHÈSE GERIAASSIST ===');
    lines.push(`Date : ${new Date().toLocaleDateString('fr-FR')}`);
    lines.push(`Patient : ${nom ? nom + ' — ' : ''}${age} ans | ${sexe === 'F' ? 'Femme' : 'Homme'}${poids ? ' | ' + poids + ' kg' : ''}${dfg ? ' | DFG ' + dfg + ' ml/min' : ''}`);
    lines.push('');

    // Bandeau saisies aberrantes (synthData.aberrantInputs)
    if (sd && sd.aberrantInputs && sd.aberrantInputs.length > 0) {
        lines.push(`⚠️ SAISIES HORS PLAGES PLAUSIBLES (${sd.aberrantInputs.length}) — vérifier`);
        sd.aberrantInputs.forEach(a => lines.push(`  • ${a.field} = ${a.value}   (plausible : ${a.range})`));
        lines.push('');
    }

    // Bandeau de gravité (synthData.banner)
    if (sd && sd.banner && (sd.banner.nbDanger + sd.banner.nbWarning + sd.banner.nbOmissions) > 0) {
        const b = sd.banner;
        const counts = [];
        if (b.nbDanger > 0) counts.push(`${b.nbDanger} danger`);
        if (b.nbWarning > 0) counts.push(`${b.nbWarning} vigilance`);
        if (b.nbOmissions > 0) counts.push(`${b.nbOmissions} omission${b.nbOmissions > 1 ? 's' : ''}`);
        lines.push(`>> ${b.icon} ${b.msg}${counts.length ? ' — ' + counts.join(' · ') : ''}`);
        lines.push('');
    }

    // Profil de risque (synthData.riskChips)
    if (sd && sd.riskChips && sd.riskChips.length > 0) {
        lines.push('--- PROFIL DE RISQUE ---');
        lines.push(sd.riskChips.map(c => c.label).join(' · '));
        lines.push('');
    }

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

    // Top actions prioritaires (synthData.topActions)
    if (sd && sd.topActions && sd.topActions.length > 0) {
        lines.push(`--- TOP ${sd.topActions.length} ACTIONS PRIORITAIRES ---`);
        sd.topActions.forEach((a, i) => {
            lines.push(`${i + 1}. [${a.kind}] ${a.txt}`);
        });
        lines.push('');
    }

    // Mécanismes récurrents (synthData.mechanismClusters)
    if (sd && sd.mechanismClusters && sd.mechanismClusters.length > 0) {
        lines.push('--- MÉCANISMES RÉCURRENTS ---');
        sd.mechanismClusters.forEach(cl => {
            lines.push(`• ${cl.label}`);
            if (cl.summary) lines.push(`  ${cl.summary}`);
            if (cl.meds && cl.meds.length) lines.push(`  Médicaments : ${cl.meds.join(', ')}`);
            if (cl.advice) lines.push(`  → ${cl.advice}`);
        });
        lines.push('');
    }

    // Interactions DANGER (synthData.interactCritical)
    if (sd && sd.interactCritical && sd.interactCritical.length > 0) {
        const top = sd.interactCritical.slice(0, 5);
        lines.push(`--- INTERACTIONS CRITIQUES (${top.length}${sd.interactCritical.length > 5 ? '/' + sd.interactCritical.length : ''}) ---`);
        top.forEach(it => {
            const txt = (it.text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            if (txt) lines.push('• ' + txt);
        });
        lines.push('');
    }

    // Scores — extraire le texte du div
    const divScores = document.getElementById('alertes-scores');
    if (divScores && divScores.innerText.trim()) {
        lines.push('--- SCORES CLINIQUES ---');
        divScores.querySelectorAll('.alert').forEach(a => {
            lines.push(a.innerText.replace(/\n+/g, ' | ').trim());
        });
        lines.push('');
    }

    // Section synthèse intelligente (depuis le registre si disponible)
    if (reg && reg.byMed && Object.keys(reg.byMed).length > 0) {
        lines.push('--- SYNTHÈSE PAR MÉDICAMENT ---');
        for (const [dci, domains] of Object.entries(reg.byMed)) {
            let alerts = [];
            if (domains.eviter) domains.eviter.forEach(e => alerts.push(`[CI] ${e.text}`));
            if (domains.interact) domains.interact.forEach(e => alerts.push(`[INTER] ${e.text}`));
            if (domains.usage) domains.usage.forEach(e => alerts.push(`[DOSE] ${e.text}`));
            if (alerts.length > 0) lines.push(`• ${dci.toUpperCase()} : ${alerts.join(' | ')}`);
        }
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
    const reg = window._analysisRegistry;
    const sd = (reg && reg.synthData) ? reg.synthData : null;
    const nom = document.getElementById('patientNom')?.value || '';
    const age = document.getElementById('patientAge')?.value || '—';
    const sexe = document.getElementById('patientSexe')?.value || '';
    const poids = document.getElementById('patientPoids')?.value || '';
    const dfg = document.getElementById('patientDFG')?.value || '';

    // Pagebreak : autoriser le découpage multi-page, mais refuser la coupure À
    // L'INTÉRIEUR d'un bloc (.pdf-block). html2pdf v0.10+ respecte
    // page-break-inside:avoid. Évite les troncatures sur dossiers lourds.
    const blockStyle = 'page-break-inside:avoid;break-inside:avoid;margin-bottom:6px;';

    let html = `<div style="font-family:Arial,sans-serif;font-size:10px;color:#222;line-height:1.4;padding:10px;">`;

    // En-tête
    html += `<div class="pdf-block" style="${blockStyle}border-bottom:2px solid #0d6efd;padding-bottom:4px;">
        <strong style="font-size:14px;color:#0d6efd;">GeriaAssist — Synthèse Pharmaco-Clinique</strong>
        <span style="float:right;font-size:9px;color:#888;">${new Date().toLocaleDateString('fr-FR')}</span>
        <br><span style="font-size:10px;"><strong>${nom ? escapeHtml(nom) + ' — ' : ''}${age} ans | ${sexe === 'F' ? 'Femme' : 'Homme'}</strong>${poids ? ' | ' + poids + ' kg' : ''}${dfg ? ' | DFG ' + dfg + ' ml/min' : ''}</span>
    </div>`;

    // Bandeau saisies aberrantes (synthData.aberrantInputs) — en TÊTE pour visibilité
    if (sd && sd.aberrantInputs && sd.aberrantInputs.length > 0) {
        const items = sd.aberrantInputs.map(a =>
            `<span style="display:inline-block;background:#ffc107;color:#000;border-radius:2px;padding:1px 5px;margin:1px;font-size:8px;font-weight:bold;">${escapeHtml(a.field)} = ${escapeHtml(a.value)}</span>`
        ).join('');
        html += `<div class="pdf-block" style="${blockStyle}background:#fff3cd;border-left:3px solid #fd7e14;color:#664d03;border-radius:3px;padding:5px 8px;font-size:9px;">
            <strong>⚠️ Saisies hors plages plausibles (${sd.aberrantInputs.length})</strong> <span style="font-size:8px;">— vérifier l'unité / la valeur</span>
            <div style="margin-top:2px;">${items}</div>
        </div>`;
    }

    // Bandeau gravité (synthData.banner)
    if (sd && sd.banner && (sd.banner.nbDanger + sd.banner.nbWarning + sd.banner.nbOmissions) > 0) {
        const b = sd.banner;
        const bg = b.level === 'danger' ? '#f8d7da' : b.level === 'warning' ? '#fff3cd' : b.level === 'info' ? '#cff4fc' : '#d1e7dd';
        const fg = b.level === 'danger' ? '#58151c' : b.level === 'warning' ? '#664d03' : b.level === 'info' ? '#055160' : '#0f5132';
        const counts = [];
        if (b.nbDanger > 0) counts.push(`<strong>${b.nbDanger} danger</strong>`);
        if (b.nbWarning > 0) counts.push(`${b.nbWarning} vigilance`);
        if (b.nbOmissions > 0) counts.push(`${b.nbOmissions} omission${b.nbOmissions > 1 ? 's' : ''}`);
        html += `<div class="pdf-block" style="${blockStyle}background:${bg};color:${fg};border-radius:4px;padding:5px 8px;font-size:10px;">
            ${b.icon} <strong>${escapeHtml(b.msg)}</strong>${counts.length ? ' — <span style="font-size:9px;">' + counts.join(' · ') + '</span>' : ''}
        </div>`;
    }

    // Profil de risque (synthData.riskChips)
    if (sd && sd.riskChips && sd.riskChips.length > 0) {
        const chips = sd.riskChips.map(c => {
            const cbg = c.level === 'danger' ? '#dc3545' : c.level === 'warning' ? '#ffc107' : '#198754';
            const cfg = c.level === 'warning' ? '#000' : '#fff';
            return `<span style="display:inline-block;background:${cbg};color:${cfg};border-radius:3px;padding:1px 5px;margin:1px;font-size:8px;font-weight:bold;">${escapeHtml(c.label)}</span>`;
        }).join('');
        html += `<div class="pdf-block" style="${blockStyle}border:1px solid #ccc;border-radius:4px;padding:4px;">
            <strong style="font-size:9px;color:#0d6efd;">Profil de risque</strong><br>${chips}
        </div>`;
    }

    // Top actions prioritaires (synthData.topActions)
    if (sd && sd.topActions && sd.topActions.length > 0) {
        const items = sd.topActions.map(a => {
            const lbg = a.level === 'danger' ? '#dc3545' : a.level === 'warning' ? '#ffc107' : '#0dcaf0';
            const lfg = a.level === 'warning' ? '#000' : '#fff';
            return `<li style="margin:2px 0;font-size:9px;">${a.icon} <span style="background:${lbg};color:${lfg};border-radius:2px;padding:0 4px;font-size:7px;font-weight:bold;">${escapeHtml(a.kind)}</span> ${escapeHtml(a.txt)}</li>`;
        }).join('');
        html += `<div class="pdf-block" style="${blockStyle}border-left:3px solid #dc3545;background:#fff8e1;padding:4px 6px;">
            <strong style="font-size:10px;color:#664d03;">⚡ Top ${sd.topActions.length} actions prioritaires</strong>
            <ol style="margin:2px 0 0 16px;padding:0;">${items}</ol>
        </div>`;
    }

    // Mécanismes récurrents (synthData.mechanismClusters) — compact
    if (sd && sd.mechanismClusters && sd.mechanismClusters.length > 0) {
        const cls = sd.mechanismClusters.map(cl => {
            const c = cl.severity === 'danger' ? '#dc3545' : '#ffc107';
            const meds = (cl.meds || []).slice(0, 6).map(d => `<span style="display:inline-block;background:#f4f4f4;border:1px solid #ddd;border-radius:2px;padding:0 3px;margin:1px;font-size:7px;">${escapeHtml(d)}</span>`).join('');
            return `<div style="border-left:3px solid ${c};padding:2px 5px;margin:2px 0;">
                <strong style="font-size:9px;">${escapeHtml(cl.label)}</strong>
                <div style="font-size:8px;color:#555;">${escapeHtml(cl.summary || '')}</div>
                ${meds ? '<div style="margin-top:1px;">' + meds + '</div>' : ''}
                ${cl.advice ? `<em style="font-size:7.5px;color:#666;">${escapeHtml(cl.advice)}</em>` : ''}
            </div>`;
        }).join('');
        html += `<div class="pdf-block" style="${blockStyle}border:1px solid #9eeaf9;border-radius:4px;padding:4px;background:#f0fcff;">
            <strong style="font-size:10px;color:#055160;">🔍 Mécanismes récurrents (${sd.mechanismClusters.length})</strong>
            ${cls}
        </div>`;
    }

    // Interactions DANGER (synthData.interactCritical) — top 5
    if (sd && sd.interactCritical && sd.interactCritical.length > 0) {
        const its = sd.interactCritical.slice(0, 5).map(it => {
            const txt = (it.text || '').replace(/<[^>]+>/g, '').slice(0, 200);
            return `<li style="font-size:9px;margin:1px 0;">${escapeHtml(txt)}</li>`;
        }).join('');
        html += `<div class="pdf-block" style="${blockStyle}border-left:3px solid #dc3545;padding:3px 6px;background:#fff;">
            <strong style="font-size:10px;color:#dc3545;">⚠️ Interactions critiques (${Math.min(5, sd.interactCritical.length)}${sd.interactCritical.length > 5 ? ' / ' + sd.interactCritical.length : ''})</strong>
            <ul style="margin:2px 0 0 14px;padding:0;">${its}</ul>
        </div>`;
    }

    // 2 colonnes : Comorbidités + Médicaments
    html += `<div class="pdf-block" style="${blockStyle}display:flex;gap:8px;">`;

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
        html += `<div class="pdf-block" style="${blockStyle}border:1px solid #0dcaf0;border-radius:4px;padding:4px;">
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

    // Retiré volontairement : la "Synthèse par médicament" (liste des DCI
    // en cause). L'utilisateur ne souhaite plus voir les médicaments en
    // cause dans l'export PDF (confidentialité / concision).

    // Alertes par section — sélection : scores, prescriptions inappropriées,
    // omissions, et bilans à faire sur l'année. Pas d'interactions ni d'alertes
    // bio détaillées (consultables dans l'app, pas sur le PDF de synthèse).
    const sections = [
        { id: 'alertes-eviter',   titre: 'Prescriptions inappropriées', color: '#dc3545' },
        { id: 'alertes-initier',  titre: 'Omissions thérapeutiques',    color: '#198754' }
    ];

    sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const alerts = el.querySelectorAll('.alert:not(.alert-light)');
        if (alerts.length === 0) return;

        html += `<div class="pdf-block" style="${blockStyle}border-left:3px solid ${s.color};padding-left:6px;">
            <strong style="font-size:10px;color:${s.color};">${s.titre} (${alerts.length})</strong>`;
        alerts.forEach(a => {
            const strong = a.querySelector('strong');
            const title = strong ? strong.textContent.trim() : '';
            let detail = '';
            // Cibler prioritairement le corps du message ; tomber sur small/em en fallback
            const msgNode = a.querySelector('div.small, span.small, small, em');
            if (msgNode) detail = msgNode.textContent.trim().substring(0, 200);
            html += `<div style="font-size:9px;margin:2px 0;">• <strong>${escapeHtml(title)}</strong>${detail ? ' — <span style="color:#555;">' + escapeHtml(detail) + '</span>' : ''}</div>`;
        });
        html += `</div>`;
    });

    // Bilans à faire sur l'année (annuel + semestriel + trimestriel) — SANS DCI
    if (reg && reg.bioPlan && Object.keys(reg.bioPlan).length > 0) {
        const freqPriority = { 'hebdomadaire': 1, '/semaine': 1, 'bimensuel': 2, '/2sem': 2, 'mensuel': 3, '/mois': 3, '/1m': 3, '/1-3m': 4, 'trimestriel': 5, '/3m': 5, '/3 mois': 5, 'semestriel': 7, '/6m': 7, '/6 mois': 7, 'annuel': 10, '/an': 10, '/12m': 10, 'à la demande': 20 };
        const getFreqScore = (f) => { let fl = String(f || '').toLowerCase(); for (const [k, v] of Object.entries(freqPriority)) { if (fl.includes(k)) return v; } return 15; };
        const freqLabels = { 1: 'Hebdomadaire', 2: 'Bimensuel', 3: 'Mensuel', 5: 'Trimestriel', 7: 'Semestriel', 10: 'Annuel', 15: 'Selon contexte', 20: 'À la demande' };
        const byFreq = {};
        for (const [bioId, data] of Object.entries(reg.bioPlan)) {
            const bioName = (typeof MASTER_DB !== 'undefined' && MASTER_DB.BIOLOGIE && MASTER_DB.BIOLOGIE[bioId]) ? MASTER_DB.BIOLOGIE[bioId].NOM_STANDARD : bioId;
            const freqScore = data.freqs.length > 0 ? Math.min(...data.freqs.map(f => getFreqScore(f))) : 15;
            if (!byFreq[freqScore]) byFreq[freqScore] = [];
            byFreq[freqScore].push(bioName);
        }
        const keys = Object.keys(byFreq).map(Number).sort((a, b) => a - b);
        html += `<div class="pdf-block" style="${blockStyle}border-left:3px solid #6c757d;padding-left:6px;">
            <strong style="font-size:10px;color:#6c757d;">Bilans à prévoir sur l'année</strong>`;
        keys.forEach(score => {
            const lbl = freqLabels[score] || 'Variable';
            html += `<div style="font-size:9px;margin:2px 0;"><strong>${lbl} :</strong> <span style="color:#555;">${byFreq[score].map(b => escapeHtml(b)).join(', ')}</span></div>`;
        });
        html += `</div>`;
    }

    html += `<div style="text-align:center;margin-top:6px;font-size:7px;color:#aaa;">Document généré par GeriaAssist — Usage professionnel uniquement</div>`;
    html += `</div>`;
    return html;
}

/**
 * Exporte la synthèse en PDF via html2pdf.js (1 page A4).
 */
window.exporterPDF = function() {
    if (typeof html2pdf === 'undefined') {
        GeriaLog.error('html2pdf non chargé');
        alert('Erreur : bibliothèque PDF non chargée. Recharge la page.');
        return;
    }
    try {
        const content = document.createElement('div');
        content.innerHTML = buildPdfContent();

        const opt = {
            margin: [8, 6, 10, 6],
            filename: 'GeriaAssist_' + (document.getElementById('patientNom')?.value || 'Patient').replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ_ -]/g, '') + '_' + new Date().toISOString().slice(0, 10) + '.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            // Autorise le multi-page (mode 'css' respecte page-break-inside:avoid
            // sur .pdf-block) + fallback legacy. Plus de troncature silencieuse.
            pagebreak: { mode: ['css', 'legacy'], avoid: '.pdf-block' }
        };

        html2pdf().set(opt).from(content).save().catch(err => {
            GeriaLog.error('Échec export PDF:', err);
            alert('Échec de l\'export PDF : ' + (err && err.message ? err.message : err));
        });
    } catch (err) {
        GeriaLog.error('Échec export PDF:', err);
        alert('Échec de l\'export PDF : ' + (err && err.message ? err.message : err));
    }
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
        'patientNom': '', 'patientAge': '80', 'patientSexe': 'F', 'patientPoids': '', 'patientBmi': '',
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
        'bioDigox': '', 'bioDigoxUnit': 'ng/mL', 'bioTca': '',
        'bioVitDUnit': 'ng/mL',
        'scoreCFS': '0', 'bioQtc': '',
        'bioTp': '', 'bioChlore': '', 'bioOsm': '', 'bioPrealb': '', 'bioAlbuminurie': '',
        'bioVgm': '', 'bioRetic': '',
        'cpManual': '0', 'cpBili': '1', 'cpAlb': '1', 'cpTp': '1', 'cpAscite': '1', 'cpEnceph': '1'
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
        'patientFragile',
        // Troubles cognitifs & neuropsychocomportementaux (SFGG 2024)
        'chkDemence', 'chkMci', 'chkPsyPrim', 'chkDelirium', 'chkSommeil',
        'chkSpcAgitation', 'chkSpcPsychose', 'chkSpcApathie', 'chkSpcDepressionSpc',
        'chkSpcInsomnie', 'chkSpcDesinhibition', 'chkSpcTca',
        'chkMbiMotiv', 'chkMbiAffect', 'chkMbiImpuls', 'chkMbiSocial', 'chkMbiIdeat',
        'chkAnxieteTAG', 'chkPsychoseTardive', 'chkBipolaire', 'chkCatatonie',
        'chkInsomnie', 'chkTcsp', 'chkSjsr', 'chkSaos'
    ];
    checkboxes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });

    // 4a. Types de démence (checkboxes multi-sélection) et delirium (radios)
    ['demTypeMA','chkLewy','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte','demTypeNP'].forEach(id => {
        const el = document.getElementById(id); if (el) el.checked = false;
    });
    ['delHyper','delHypo'].forEach(id => {
        const el = document.getElementById(id); if (el) el.checked = false;
    });
    const delMix = document.getElementById('delMixte'); if (delMix) delMix.checked = true;

    // 4b. Masquer toutes les cascades
    ['cascadeDemence','cascadeMci','cascadePsyPrim','cascadeDelirium','cascadeSommeil'].forEach(id => {
        const el = document.getElementById(id); if (el) el.style.display = 'none';
    });

    // 4c. Réinitialiser le cache d'analyse
    if (typeof _lastAnalysisHash !== 'undefined') _lastAnalysisHash = null;
    if (typeof _lastAnalysisResult !== 'undefined') _lastAnalysisResult = null;
    if (typeof window.engineInitialized !== 'undefined') window.engineInitialized = false;

    // 5. Vider l'affichage des tags et résultats
    if (typeof renderTags === 'function') renderTags();

    const divs = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact',
                   'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi', 'alertes-guidelines'];
    divs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<span class="text-muted">Cliquez sur Analyser...</span>';
    });

    // 6. Masquer les boutons d'export
    ['btnPdf','btnCopier','btnPrint','btnCompare'].forEach(id => { const b = document.getElementById(id); if(b) b.style.display = 'none'; });

    // 7. Réinitialiser le style DFG (préserve les classes Bootstrap/Tailwind existantes)
    const dfgInput = document.getElementById('patientDFG');
    if (dfgInput) { dfgInput.style.backgroundColor = ''; dfgInput.style.color = ''; }

    // 8. Remettre le premier onglet actif
    const firstTab = document.querySelector('#myTab .nav-link');
    if (firstTab) {
        document.querySelectorAll('#myTab .nav-link').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => { p.classList.remove('show', 'active'); });
        firstTab.classList.add('active');
        const target = document.querySelector(firstTab.getAttribute('data-bs-target'));
        if (target) { target.classList.add('show', 'active'); }
    }

    // 9. Vider les badges de comptage (counters d'onglet)
    document.querySelectorAll('#myTab .tab-counter, .tab-counter').forEach(c => c.remove());

    // 10. Vider les zones secondaires : OCR results, modals patient, autocompletes
    ['ocrResults', 'ocrPreview', 'ocrText', 'ocrFilename'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = '';
            else el.innerHTML = '';
        }
    });
    // Fermer les listes d'autocomplete encore ouvertes
    document.querySelectorAll('.autocomplete-container ul, [id^="auto"][id$="List"]').forEach(ul => {
        ul.style.display = 'none';
        ul.innerHTML = '';
    });

    // 11. Vider le titre patient et le compteur de meds dans le header (index_modern)
    ['hdrPatientName'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = 'Nouveau patient';
    });

    // 12. Reset cache analysis hash dans window (au cas où une autre référence existe)
    window._lastAnalysisHash = null;
    window._lastAnalysisResult = null;

    // 13. Purger la session persistée (sessionStorage) — sinon l'ancien patient
    // serait restauré au prochain rechargement, ce qui contredit « Nouveau patient »
    // (correction + confidentialité : pas de fuite du patient précédent).
    try { sessionStorage.removeItem('geriaassist_session'); } catch (e) { /* quota / mode privé */ }
    // Réinitialiser aussi le registre d'analyse exposé.
    window._analysisRegistry = null;
};

// ============================================================================
// FRAGILE → PALLIATIF — Prompt automatique
// ============================================================================
window.onFragileChange = function() {
    if (document.getElementById('patientFragile').checked) {
        if (confirm('Espérance de vie < 1 an / Soins palliatifs ?')) {
            document.getElementById('chkPalliatif').checked = true;
        }
    }
};

// ============================================================================
// IMPRESSION OPTIMISÉE — Fenêtre dédiée avec tous les onglets dépliés
// ============================================================================
window.imprimerSynthese = function(mode) {
    mode = mode || 'complet';
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) { alert('Popup bloquée. Autorisez les popups pour ce site.'); return; }
    const content = buildPdfContent();

    let sections = '';
    if (mode === 'complet') {
        const tabs = [
            { id: 'alertes-scores', titre: 'Scores Cliniques' },
            { id: 'alertes-eviter', titre: 'Prescriptions Inappropriées' },
            { id: 'alertes-initier', titre: 'Omissions Thérapeutiques' },
            { id: 'alertes-interact', titre: 'Interactions Cliniques' },
            { id: 'alertes-auc', titre: 'Pharmacocinétique AUC' },
            { id: 'alertes-ansm', titre: 'Interactions ANSM' },
            { id: 'alertes-bio', titre: 'Syndromes Biologiques' },
            { id: 'alertes-usage', titre: 'Adaptations Posologiques' },
            { id: 'alertes-suivi', titre: 'Suivi Biologique' },
            { id: 'alertes-guidelines', titre: 'Guidelines' }
        ];
        tabs.forEach(t => {
            const el = document.getElementById(t.id);
            if (el && el.innerHTML && !el.innerHTML.includes('Cliquez sur Analyser')) {
                sections += `<h3 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:4px;margin-top:16px;">${escapeHtml(t.titre)}</h3>${el.innerHTML}`;
            }
        });
    }
    // Synthèse intelligente (toujours incluse)
    const synthEl = document.getElementById('alertes-synthese');
    let synthSection = '';
    if (synthEl && synthEl.innerHTML && !synthEl.innerHTML.includes('Cliquez sur Analyser')) {
        synthSection = `<h3 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:4px;margin-top:16px;">Synthèse Intelligente</h3>${synthEl.innerHTML}`;
    }

    const modeLabel = mode === 'synthese' ? 'Synthèse seule' : 'Rapport complet';
    w.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>GeriaAssist — ${modeLabel}</title>
        <link href="lib/bootstrap.min.css" rel="stylesheet">
        <style>body{font-size:10pt;padding:20px;} .alert{page-break-inside:avoid;margin-bottom:8px;} .card{page-break-inside:avoid;} @media print{body{padding:10px;} .no-print{display:none;}}</style>
    </head><body>${content}${synthSection}${mode === 'complet' ? '<hr>' + sections : ''}
        <div class="text-center mt-3 no-print"><button onclick="window.print()" class="btn btn-primary">Imprimer</button> <button onclick="window.close()" class="btn btn-secondary">Fermer</button></div>
    </body></html>`);
    w.document.close();
};

const patientHasMedClass = (classOrDci) => {
    let t = sanitizeText(classOrDci);
    return activeMeds.some(m => {
        let mDci = sanitizeText(m.dci); let mClasse = sanitizeText(m.classe);
        if(mDci.includes(t) || mClasse.includes(t)) return true;
        return matchesDrugClass(mDci, mClasse, t);
    });
};
