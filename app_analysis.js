// app_analysis.js - V10.0 (v0.48 — synthèse intelligente, bio unifiée, registre structuré)

// Curation des règles « supplément » : IDs en quarantaine (non affichés) en attendant
// une revue clinique du corpus. Critères d'exclusion (vérifiés sur cas concrets) :
//  - SUP_CAUT_073 : faux positif (clé composée « ibuprofene topique » matchée par un
//    AINS oral → reco d'AINS topique injustifiée).
//  - SUP_PIMC_08 / SUP_STOP_078 : doublons du « Triple whammy » natif (SYND_045),
//    qui reste affiché car plus complet — évite 3 alertes pour le même mécanisme.
//  - SUP_STOP_043 : doublon de SUP_STOP_042 (« Antimuscarinique systemique », sous-
//    ensemble sans trospium) — on garde 042 (couverture complète).
//  - SUP_STOP_050 : doublon de SUP_STOP_049 (« Oestrogene systemique », clé « patch »
//    générique) — on garde 049 (clés plus précises).
// Revue éditoriale fine (volume d'alertes par thème) → curation_supplement_review.csv.
const SUPPLEMENT_QUARANTINE = new Set(['SUP_CAUT_073', 'SUP_PIMC_08', 'SUP_STOP_078', 'SUP_STOP_043', 'SUP_STOP_050']);

// #1 — Réconciliation par « cluster de mécanisme » : quand plusieurs alertes décrivent
// le MÊME mécanisme sous des libellés différents, ne garder que la plus prioritaire
// (score max) afin de réduire la redondance d'affichage. PRUDENCE : ne déclarer que des
// clusters où les variantes sont sémantiquement équivalentes (pas des angles cliniques
// distincts — DFG vs IC vs surveillance, qui doivent rester séparés). Liste à étendre
// après revue clinique (cf. curation_supplement_review.csv).
const ALERT_CLUSTERS = [
    { nom: 'triple_whammy', re: /triple whammy|triple association[^|]*(IEC|ARA2)[^|]*diur|m[ée]dicaments? n[ée]phrotoxiques en association/i }
];
function reconcileAlertClusters(alertes) {
    if (!Array.isArray(alertes) || alertes.length < 2) return alertes;
    const drop = new Set();
    ALERT_CLUSTERS.forEach(cl => {
        const membres = alertes.map((a, i) => ({ a, i })).filter(({ a }) => cl.re.test(a.titre || ''));
        if (membres.length > 1) {
            membres.sort((x, y) => (y.a.score || 0) - (x.a.score || 0)); // prioritaire en tête
            membres.slice(1).forEach(({ i }) => drop.add(i));
        }
    });
    return drop.size ? alertes.filter((a, i) => !drop.has(i)) : alertes;
}

// =========================================================
// SCORES_CONFIG — Seuils externalisés (modifiable sans toucher la logique)
// =========================================================
const SCORES_CONFIG = {
    CHA2DS2: {
        label: 'CHA₂DS₂-VA', desc: 'Risque thromboembolique dans la FA (ESC 2024)', border: 'info',
        seuils: { haut: 2 },
        conclusions: { 0: 'Risque faible — anticoagulation non recommandée', 1: 'Anticoagulation à considérer (évaluer bénéfice/risque)', haut: 'Anticoagulation recommandée (sauf CI)' }
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
    DOAC: {
        label: 'DOACscore', desc: 'Risque de saignement majeur sous AOD', border: 'warning',
        seuils: { modere: 4, haut: 7 },
        conclusions: { 0: 'Risque faible de saignement majeur', modere: 'Risque modéré — surveillance rapprochée', haut: 'Risque élevé — réévaluer bénéfice/risque AOD' }
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
    DOAC: {
        label: 'DOACscore', desc: 'Risque de saignement majeur sous AOD (Hijazi 2023)', border: 'warning',
        seuils: { modere: 4, haut: 7 },
        conclusions: { 0: 'Risque faible de saignement majeur', modere: 'Risque modéré — surveillance rapprochée', haut: 'Risque élevé — réévaluer bénéfice/risque AOD' }
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

// =========================================================
// SUIVI BIOLOGIQUE — Utilitaires + Rendus dual-mode
// =========================================================
const _FREQ_PRIORITY = { 'hebdomadaire': 1, '/semaine': 1, 'bimensuel': 2, '/2sem': 2, 'mensuel': 3, '/mois': 3, '/1m': 3, '/1-3m': 4, 'trimestriel': 5, '/3m': 5, '/3 mois': 5, 'semestriel': 7, '/6m': 7, '/6 mois': 7, 'annuel': 10, '/an': 10, '/12m': 10 };
function _getFreqScore(f) {
    if (!f) return 99;
    let fl = f.toLowerCase();
    for (const [k, v] of Object.entries(_FREQ_PRIORITY)) { if (fl.includes(k)) return v; }
    return 8;
}
function _freqCssClass(score) {
    if (score <= 1) return 'freq-hebdo';
    if (score <= 3) return 'freq-mensuel';
    if (score <= 5) return 'freq-trimestriel';
    return 'freq-annuel';
}
function _freqShortLabel(f) {
    if (!f) return '';
    let fl = f.toLowerCase();
    if (fl.includes('hebdo') || fl.includes('/semaine')) return 'H';
    if (fl.includes('bimensuel') || fl.includes('/2sem')) return '2S';
    if (fl.includes('mensuel') || fl.includes('/mois') || fl.includes('/1m')) return 'M';
    if (fl.includes('/1-3m')) return '1-3M';
    if (fl.includes('trimestriel') || fl.includes('/3m') || fl.includes('/3 mois')) return '3M';
    if (fl.includes('semestriel') || fl.includes('/6m') || fl.includes('/6 mois')) return '6M';
    if (fl.includes('annuel') || fl.includes('/an') || fl.includes('/12m')) return 'An';
    // Pas de troncature — afficher le texte complet si non reconnu
    return f;
}
function _extractFreqForBio(suiviStr, bioId) {
    if (!suiviStr) return '';
    let items = suiviStr.split('|').map(x => x.trim());
    // Chercher un item contenant le bioId ou un terme lié
    let bioName = (typeof MASTER_DB !== 'undefined' && MASTER_DB.BIOLOGIE && MASTER_DB.BIOLOGIE[bioId]) ? MASTER_DB.BIOLOGIE[bioId].NOM_STANDARD.toLowerCase() : '';
    for (const item of items) {
        let il = item.toLowerCase();
        // Matcher sur au moins 4 caractères du nom bio (accents inclus)
        let matched = false;
        if (bioName) {
            // Essayer longueurs décroissantes (8, 6, 4 chars) pour match progressif
            for (let len = Math.min(8, bioName.length); len >= 4; len--) {
                if (il.includes(bioName.substring(0, len))) { matched = true; break; }
            }
        }
        if (matched) {
            let match = item.match(/\(([^)]+)\)/);
            if (match) return match[1];
        }
    }
    return '';
}
function _bioStatusBadge(bioId, val) {
    if (!val || val <= 0) return '<span class="badge bg-secondary">—</span>';
    if (bioId === 'BIO_004' && val < 30) return '<span class="badge bg-danger">Bas</span>';
    if (bioId === 'BIO_004' && val < 60) return '<span class="badge bg-warning text-dark">Abaissé</span>';
    if (bioId === 'BIO_001' && (val < 3.5 || val > 5.0)) return '<span class="badge bg-danger">Anormal</span>';
    if (bioId === 'BIO_002' && val < 130) return '<span class="badge bg-warning text-dark">Bas</span>';
    if (bioId === 'BIO_009' && val < 12) return '<span class="badge bg-warning text-dark">Anémie</span>';
    if (bioId === 'BIO_031' && val >= 450) return '<span class="badge bg-danger">Allongé</span>';
    return '<span class="badge bg-success">OK</span>';
}

/**
 * Rendu MODE TABLEAU CROISÉ : matrice bio (lignes) × médicaments+pathologies (colonnes)
 */
function _renderSuiviCross(bioPlan, bioValues) {
    const bioIds = Object.keys(bioPlan);
    if (bioIds.length === 0) return '';

    // Collecter toutes les origines (médicaments + pathologies) comme colonnes
    const origins = new Set();
    for (const entry of Object.values(bioPlan)) {
        entry.meds.forEach(m => origins.add(m));
        entry.pathos.forEach(p => origins.add(p));
    }
    const cols = [...origins].sort();
    if (cols.length === 0) return '';

    // Trier les lignes bio par fréquence la plus stricte
    const sortedBio = bioIds.map(bioId => {
        const entry = bioPlan[bioId];
        const allFreqs = [...entry.freqs, ...Object.values(entry.freqByOrigin || {})].filter(Boolean);
        const bestScore = allFreqs.length > 0 ? Math.min(...allFreqs.map(_getFreqScore)) : 99;
        return { bioId, entry, bestScore };
    }).sort((a, b) => a.bestScore - b.bestScore);

    // Header
    let html = `<div class="alert alert-info border-info shadow-sm py-2 px-2">
        <strong class="text-info" style="font-size:1.05em;">🧪 Tableau croisé — Surveillance biologique</strong>
        <span class="badge bg-info float-end">${bioIds.length} param. / ${cols.length} origines</span>
        <div class="table-responsive mt-2">
        <table class="table table-sm table-bordered mb-0 suivi-cross-table">
        <thead><tr>
            <th style="min-width:130px;">Paramètre</th>
            <th class="text-center" style="width:55px;">Valeur</th>
            <th class="text-center" style="width:50px;">Freq.</th>`;
    cols.forEach(c => {
        let label = c.charAt(0).toUpperCase() + c.slice(1);
        html += `<th class="rotate text-center" title="${escapeHtml(c)}">${escapeHtml(label)}</th>`;
    });
    html += `</tr></thead><tbody>`;

    sortedBio.forEach(({ bioId, entry, bestScore }) => {
        let bioName = (MASTER_DB.BIOLOGIE && MASTER_DB.BIOLOGIE[bioId]) ? MASTER_DB.BIOLOGIE[bioId].NOM_STANDARD : bioId;
        let val = bioValues[bioId];
        let valStr = val > 0 ? `<b>${val}</b>` : '<span class="text-muted">—</span>';
        let status = _bioStatusBadge(bioId, val);

        // Fréquence globale la plus stricte
        const allFreqs = [...entry.freqs, ...Object.values(entry.freqByOrigin || {})].filter(Boolean);
        allFreqs.sort((a, b) => _getFreqScore(a) - _getFreqScore(b));
        let bestFreq = allFreqs.length > 0 ? allFreqs[0] : '';
        let freqLabel = _freqShortLabel(bestFreq);
        let freqClass = _freqCssClass(bestScore);

        html += `<tr>
            <td class="bio-row-name">${escapeHtml(bioName)}</td>
            <td class="bio-val">${valStr} ${status}</td>
            <td class="text-center ${freqClass}" title="${escapeHtml(bestFreq)}"><b>${freqLabel}</b></td>`;

        cols.forEach(col => {
            let isMed = entry.meds.includes(col);
            let isPatho = entry.pathos.includes(col);
            if (isMed || isPatho) {
                let freq = (entry.freqByOrigin || {})[col] || '';
                let fLabel = _freqShortLabel(freq);
                let fClass = freq ? _freqCssClass(_getFreqScore(freq)) : '';
                let icon = isMed ? '💊' : '🏥';
                html += `<td class="cell-check ${fClass}" title="${escapeHtml(col)}${freq ? ' — ' + escapeHtml(freq) : ''}">${icon}${fLabel ? '<br><small>' + fLabel + '</small>' : ''}</td>`;
            } else {
                html += `<td class="cell-check"></td>`;
            }
        });
        html += `</tr>`;
    });

    html += `</tbody></table></div>
        <div class="mt-1" style="font-size:0.7em; color:#888;">
            💊 = médicament &nbsp; 🏥 = pathologie &nbsp;
            <b>H</b>=hebdo <b>M</b>=mensuel <b>3M</b>=trimestriel <b>6M</b>=semestriel <b>An</b>=annuel
        </div>
    </div>`;
    return html;
}

/**
 * Rendu MODE PAR MÉDICAMENT : carte par médicament avec suivi initial, périodique, alertes
 */
function _renderSuiviPerMed(suiviPerMed, bioValues) {
    if (suiviPerMed.length === 0) return '';
    let html = '';
    suiviPerMed.forEach(med => {
        html += `<div class="suivi-med-card">`;
        html += `<h6>💊 ${escapeHtml(med.dci.toUpperCase())}</h6>`;
        if (med.initial) {
            html += `<div class="suivi-section"><span class="suivi-label">Bilan initial :</span> ${formatSuiviList(med.initial)}</div>`;
        }
        if (med.periodique) {
            html += `<div class="suivi-section"><span class="suivi-label">Suivi périodique :</span> ${formatSuiviList(med.periodique)}</div>`;
        }
        if (med.bioCibles.length > 0) {
            html += `<div class="suivi-section"><span class="suivi-label">Paramètres ciblés :</span><div class="d-flex flex-wrap gap-1 mt-1">`;
            med.bioCibles.forEach(b => {
                let badge = _bioStatusBadge(b.id, b.val);
                let valTxt = b.val > 0 ? b.val : '—';
                html += `<span class="badge bg-light text-dark border" style="font-size:0.8em;">${escapeHtml(b.name)} : <b>${valTxt}</b> ${badge}</span>`;
            });
            html += `</div></div>`;
        }
        if (med.alerte) {
            html += `<div class="suivi-section mt-1"><span class="suivi-label text-warning">Alertes cliniques :</span> ${formatSuiviList(med.alerte)}</div>`;
        }
        html += `</div>`;
    });
    return html;
}

/**
 * Fonction interne de rendu appelée par analyserPrescription et par le toggle UI
 */
function _renderSuiviBio(bioPlan, suiviPerMed, bioValues, mode, addAlertFn, countsObj) {
    const targetEl = document.getElementById('alertes-suivi');
    if (!targetEl) return;

    // Si appelé depuis le toggle (pas depuis analyserPrescription), on écrit directement dans le DOM
    const directMode = !addAlertFn;
    if (directMode) {
        targetEl.innerHTML = '';
    }

    let html = '';
    if (mode === 'croix') {
        html = _renderSuiviCross(bioPlan, bioValues);
    } else {
        html = _renderSuiviPerMed(suiviPerMed, bioValues);
    }

    if (html) {
        if (directMode) {
            targetEl.innerHTML = html;
        } else {
            addAlertFn('alertes-suivi', html, 'suivi');
        }
    }

    // Alertes cliniques (toujours affichées quel que soit le mode)
    if (!directMode) {
        activeMeds.forEach(m => {
            let ref = m.db_ref; if (!ref) return;
            if (ref.alerte_clinique) {
                addAlertFn('alertes-suivi', `<div class="alert alert-warning border-warning shadow-sm py-2 px-2">
                    <strong class="text-warning">⚠️ ${escapeHtml(ref.dci.toUpperCase())} — Alertes cliniques</strong>
                    ${formatSuiviList(ref.alerte_clinique)}
                </div>`, 'suivi');
            }
        });
    } else {
        // Mode direct (toggle) : ajouter les alertes cliniques
        activeMeds.forEach(m => {
            let ref = m.db_ref; if (!ref) return;
            if (ref.alerte_clinique) {
                targetEl.innerHTML += `<div class="alert alert-warning border-warning shadow-sm py-2 px-2">
                    <strong class="text-warning">⚠️ ${escapeHtml(ref.dci.toUpperCase())} — Alertes cliniques</strong>
                    ${formatSuiviList(ref.alerte_clinique)}
                </div>`;
            }
        });
    }

    if (!html && !directMode) {
        if (countsObj) countsObj.suivi = 0;
    }
}

/**
 * Fonction publique appelée par le toggle radio dans index.html
 */
window.renderSuiviBiologique = function(mode) {
    const reg = window._analysisRegistry;
    if (!reg || !reg.bioPlan) return;
    _renderSuiviBio(reg.bioPlan, reg.suiviPerMed || [], reg.bioValues || {}, mode, null, null);
};

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

/** Lit la valeur d'un <select> d'unité ; retourne l'unité par défaut si absent. */
function _getUnit(selectId, fallback) {
    const el = document.getElementById(selectId);
    return (el && el.value) ? el.value : fallback;
}

/**
 * Convertit une B12 en pmol/L (unité canonique interne).
 * 1 pmol/L = 1.355 ng/L (= pg/mL). Norme : ≥ 150 pmol/L (≈ 200 ng/L).
 */
function _convertB12ToPmol(val, unit) {
    if (!val || val <= 0) return val;
    if (unit === 'ng/L' || unit === 'pg/mL') return Math.round((val / 1.355) * 10) / 10;
    return val; // pmol/L par défaut
}

/**
 * Convertit une B9 (folates) en nmol/L (unité canonique interne).
 * 1 nmol/L = 0.441 µg/L (= ng/mL). Norme : ≥ 7 nmol/L (≈ 3 µg/L).
 */
function _convertB9ToNmol(val, unit) {
    if (!val || val <= 0) return val;
    if (unit === 'µg/L' || unit === 'ug/L' || unit === 'ng/mL') return Math.round((val / 0.441) * 10) / 10;
    return val; // nmol/L par défaut
}

/** Construit le contexte patient (bioValues, comorbidités, checkboxes) */
function _buildPatientContext(patientAge, sexe, isFragile) {
    const bioValues = {
        'BIO_001': getVal('patientK'), 'BIO_002': getVal('patientNa'), 'BIO_003': getVal('bioCreat'), 'BIO_004': getVal('patientDFG'),
        'BIO_005': getVal('bioCa'), 'BIO_006': getVal('bioMg'), 'BIO_007': getVal('bioUree'), 'BIO_008': getVal('bioUric'),
        'BIO_009': getVal('bioHb'), 'BIO_010': getVal('bioPlaq'), 'BIO_011': getVal('bioGb'), 'BIO_012': getVal('bioPnn'),
        'BIO_013': getVal('bioAsat'), 'BIO_014': getVal('bioAlat'), 'BIO_015': getVal('bioGgt'), 'BIO_016': getVal('bioPal'),
        'BIO_017': getVal('bioBili'), 'BIO_018': getVal('bioCpk'), 'BIO_019': getVal('bioTsh'),
        'BIO_020': getVal('bioFer'),
        'BIO_021': _convertB12ToPmol(getVal('bioB12'), _getUnit('bioB12Unit', 'pmol/L')),
        'BIO_022': _convertB9ToNmol(getVal('bioB9'), _getUnit('bioB9Unit', 'nmol/L')),
        'BIO_023': getVal('bioVitD'),
        'BIO_024': getVal('bioCrp'), 'BIO_025': getVal('bioGly'), 'BIO_026': getVal('bioHba1c'),
        'BIO_027_LDL': getVal('bioLdl'), 'BIO_027_TG': getVal('bioTg'),
        'BIO_028': getVal('bioBnp'), 'BIO_030': getVal('bioInr'), 'BIO_031': getVal('bioQtc'),
        'BIO_032': getVal('bioPct'), 'BIO_029': getVal('bioLithium'),
        'BIO_033': getVal('bioDdim'), 'BIO_034': getVal('bioTropo'), 'BIO_036': getVal('bioLipase'),
        'BIO_035': getVal('bioAlbumSg'), 'BIO_037': getVal('bioLact'),
        'BIO_CST': getVal('bioCst'), 'BIO_PHOS': getVal('bioPhos'),
        'BIO_TEMP': getVal('bioTemp'),
        'BIO_T4': getVal('bioT4'), 'BIO_T3': getVal('bioT3'),
        'BIO_TP': getVal('bioTp'), 'BIO_CL': getVal('bioChlore'),
        'BIO_OSM': getVal('bioOsm'), 'BIO_PREALB': getVal('bioPrealb'),
        'BIO_046': getVal('bioAlbuminurie')
    };

    // Auto-injection des PAT codes depuis les checkboxes cliniques
    const checkboxPatMap = {
        'chkAvc': 'PAT_008', 'chkAtcdUlcere': 'PAT_021', 'chkDialyse': 'PAT_029',
        'chkPalliatif': 'PAT_030', 'chkDepression': 'PAT_032', 'chkGlaucome': 'PAT_033',
        'chkFoie': 'PAT_034', 'chkBrady': 'PAT_035', 'chkTvp': 'PAT_036',
        'chkStent': 'PAT_004', 'chkScaAigu': 'PAT_004', 'chkHtaNonControlee': 'PAT_005',
        'chkIncontinence': 'PAT_039', 'chkDysphagie': 'PAT_038',
        'chkLewy': 'PAT_012',
        // Troubles cognitifs & neuropsychocomportementaux (SFGG 2024 SPC)
        'chkDemence': 'PAT_010',
        'demTypeMA': 'PAT_011', 'demTypeDP': 'PAT_014', 'demTypeDLFT': 'PAT_013',
        'demTypeVasc': 'PAT_041', 'demTypeMixte': 'PAT_042',
        'chkMci': 'PAT_043',
        'chkAnxieteTAG': 'PAT_044',
        'chkPsychoseTardive': 'PAT_045',
        'chkBipolaire': 'PAT_046',
        'chkCatatonie': 'PAT_047',
        'chkDelirium': 'PAT_048',
        'chkInsomnie': 'PAT_049',
        'chkTcsp': 'PAT_050',
        'chkSjsr': 'PAT_051',
        'chkSaos': 'PAT_052'
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
    if(isChecked('chkInstitution')) ctxClinique.push("institution");
    if(isChecked('chkConfine')) ctxClinique.push("confinement");
    if(isFragile) ctxClinique.push("fragilite");
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

    // Troubles cognitifs & neuropsychocomportementaux (SFGG 2024 SPC)
    if(isChecked('chkDemence')) ctxClinique.push("demence", "trouble_neurocognitif_majeur");
    if(isChecked('demTypeMA')) ctxClinique.push("alzheimer");
    if(isChecked('chkLewy')) ctxClinique.push("corps_de_lewy", "dcl");
    if(isChecked('demTypeDP')) ctxClinique.push("demence_parkinsonienne");
    if(isChecked('demTypeDLFT')) ctxClinique.push("dlft");
    if(isChecked('demTypeVasc')) ctxClinique.push("demence_vasculaire");
    if(isChecked('demTypeMixte')) ctxClinique.push("demence_mixte");
    if(isChecked('chkSpcAgitation')) ctxClinique.push("spc_agitation", "agitation");
    if(isChecked('chkSpcPsychose')) ctxClinique.push("spc_psychose", "hallucinations");
    if(isChecked('chkSpcApathie')) ctxClinique.push("spc_apathie");
    if(isChecked('chkSpcDepressionSpc')) ctxClinique.push("spc_depression");
    if(isChecked('chkSpcInsomnie')) ctxClinique.push("spc_insomnie", "inversion_nycthemerale");
    if(isChecked('chkSpcDesinhibition')) ctxClinique.push("spc_desinhibition", "errance");
    if(isChecked('chkSpcTca')) ctxClinique.push("spc_tca");
    if(isChecked('chkMci')) ctxClinique.push("mci", "tnc_leger");
    if(isChecked('chkMbiMotiv') || isChecked('chkMbiAffect') || isChecked('chkMbiImpuls') || isChecked('chkMbiSocial') || isChecked('chkMbiIdeat')) ctxClinique.push("mbi");
    if(isChecked('chkPsyPrim')) ctxClinique.push("psy_primaire");
    if(isChecked('chkAnxieteTAG')) ctxClinique.push("tag", "anxiete_generalisee");
    if(isChecked('chkPsychoseTardive')) ctxClinique.push("psychose_tardive");
    if(isChecked('chkBipolaire')) ctxClinique.push("trouble_bipolaire");
    if(isChecked('chkCatatonie')) ctxClinique.push("catatonie");
    if(isChecked('chkDelirium')) {
        ctxClinique.push("delirium", "confusion");
        if(isChecked('delHyper')) ctxClinique.push("delirium_hyperactif");
        else if(isChecked('delHypo')) ctxClinique.push("delirium_hypoactif");
        else ctxClinique.push("delirium_mixte");
    }
    if(isChecked('chkSommeil')) ctxClinique.push("trouble_sommeil_primaire");
    if(isChecked('chkInsomnie')) ctxClinique.push("insomnie_chronique");
    if(isChecked('chkTcsp')) ctxClinique.push("tcsp");
    if(isChecked('chkSjsr')) ctxClinique.push("sjsr");
    if(isChecked('chkSaos')) ctxClinique.push("saos");

    // Précisions par médicament saisies via le modal (durée/intensité) → contextes
    // cliniques. Elles désarment des faux positifs (ex. corticothérapie brève explicite,
    // douleur sévère justifiant un opioïde fort) sans modifier le comportement par défaut
    // quand rien n'est précisé.
    if (typeof activeMeds !== 'undefined' && Array.isArray(activeMeds)) {
        activeMeds.forEach(m => {
            const p = m && m.precisions; if (!p) return;
            // Détection de famille centralisée (drug_classes.js) — partagée avec app_ui.js.
            const fam = (typeof medPrecisionFamily === 'function') ? medPrecisionFamily(m.classe) : null;
            if (fam === 'cortico' && p.duree === 'courte') ctxClinique.push('cortico_duree_breve');
            if (fam === 'opioide' && p.indication === 'severe') ctxClinique.push('douleur_severe');
            if (fam === 'opioide' && p.indication === 'legere') ctxClinique.push('douleur_legere');
            if (fam === 'ipp' && p.duree === 'courte') ctxClinique.push('ipp_duree_breve');
        });
    }

    return { bioValues, ctxClinique };
}

// =========================================================
// MEMOIZATION — évite les re-analyses identiques
// =========================================================
let _lastAnalysisHash = null;
let _lastAnalysisResult = null;

function _computeAnalysisHash() {
    const parts = [
        getVal('patientAge'), getStr('patientSexe'), getVal('patientPoids'),
        getVal('patientDFG'), getVal('patientK'), getVal('patientNa'),
        getVal('bioAlbumSg'), getVal('bioCreat'), getVal('bioHb'),
        getVal('bioPlaq'), getVal('bioGly'), getVal('bioHba1c'),
        getVal('bioTsh'), getVal('bioBnp'), getVal('bioLdl'),
        getVal('bioCrp'), getVal('bioInr'), getVal('bioQtc'),
        getVal('scoreCFS'), getStr('cpManual'),
        isChecked('patientFragile'),
        activeComorbs.slice().sort().join(','),
        activeMeds.map(m => m.dci + (m.precisions ? ':' + JSON.stringify(m.precisions) : '')).sort().join(','),
        window.suspendedMeds.map(m => m.dci).sort().join(',')
    ];
    // Inclure toutes les checkboxes cliniques
    ['chkStent','chkAlcool','chkAnorexie','chkTabac','chkAvc','chkTvp','chkSaignement',
     'chkBrady','chkHtaNonControlee','chkArret','chkScaAigu','chkLqts','chkDialyse',
     'chkFoie','chkSepsis','chkPalliatif','chkAtcdUlcere','chkChutes','chkDepression',
     'chkInstitution','chkConfine',
     'chkIncontinence','chkHbp','chkConstipation','chkDysphagie','chkGlaucome',
     'chkStenoseAortique','chkAspirineForte','chkLewy',
     // Troubles cognitifs & neuropsychocomportementaux
     'chkDemence','demTypeMA','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte',
     'chkSpcAgitation','chkSpcPsychose','chkSpcApathie','chkSpcDepressionSpc',
     'chkSpcInsomnie','chkSpcDesinhibition','chkSpcTca',
     'chkMci','chkMbiMotiv','chkMbiAffect','chkMbiImpuls','chkMbiSocial','chkMbiIdeat',
     'chkPsyPrim','chkAnxieteTAG','chkPsychoseTardive','chkBipolaire','chkCatatonie',
     'chkDelirium','delHyper','delHypo','delMixte',
     'chkSommeil','chkInsomnie','chkTcsp','chkSjsr','chkSaos'
    ].forEach(id => parts.push(isChecked(id)));
    ['bioTp','bioChlore','bioOsm','bioPrealb','bioAlbuminurie'].forEach(id => parts.push(getVal(id)));
    return parts.join('|');
}

function analyserPrescription() {
    if (typeof MASTER_DB === 'undefined') return;

    // Memoization : skip si rien n'a changé
    const hash = _computeAnalysisHash();
    if (hash === _lastAnalysisHash && _lastAnalysisResult) {
        // Restaurer le DOM depuis le cache
        for (const [divId, html] of Object.entries(_lastAnalysisResult)) {
            const el = document.getElementById(divId);
            if (el) el.innerHTML = html;
        }
        GeriaLog.info('Analyse identique — résultats restaurés depuis le cache');
        return;
    }

    _initEngine();

    preCalculerScores();
    const patientAge = getVal('patientAge'); const sexe = getStr('patientSexe'); const isFragile = isChecked('patientFragile') || getVal('scoreCFS') >= 7;
    let cpClass = null; // Hoisted for use in posology section
    // Validation entrées critiques
    if (patientAge <= 0 || patientAge > 120) {
        let el = document.getElementById('alertes-scores');
        if(el) el.innerHTML = '<div class="alert alert-danger">Veuillez saisir un âge valide (18-120 ans) avant de lancer l\'analyse.</div>';
        _lastAnalysisHash = null;
        return;
    }

    const { bioValues, ctxClinique } = _buildPatientContext(patientAge, sexe, isFragile);

    const divs = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact', 'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi', 'alertes-guidelines', 'alertes-synthese', 'alertes-scores-exp'];
    divs.forEach(id => { let el = document.getElementById(id); if(el) el.innerHTML = ''; });

    // ── Scores composites expérimentaux (nouveau panneau) ──
    try {
        const expEl = document.getElementById('alertes-scores-exp');
        if (expEl && typeof renderCompositeScoresPanel === 'function') {
            // Construire la liste enrichie depuis activeMeds + MASTER_DB
            const dbMeds = (typeof MASTER_DB !== 'undefined' && MASTER_DB.MEDICAMENTS) ? MASTER_DB.MEDICAMENTS : [];
            const ordoFull = (typeof activeMeds !== 'undefined' ? activeMeds : []).map(am => {
                if (am.db_ref) return am.db_ref;
                const found = dbMeds.find(d => (d.dci || '').toLowerCase() === (am.dci || '').toLowerCase());
                return found || am;
            }).filter(Boolean);
            // Passer les valeurs bio pour potentialiser le score saignement (INR, Hb, Plaq)
            const bioContext = {
                inr: parseFloat(document.getElementById('bioInr')?.value || '0') || 0,
                hb: parseFloat(document.getElementById('bioHb')?.value || '0') || 0,
                plaq: parseFloat(document.getElementById('bioPlaq')?.value || '0') || 0,
                dfg: parseFloat(document.getElementById('patientDFG')?.value || '0') || 0
            };
            expEl.innerHTML = renderCompositeScoresPanel(ordoFull, bioContext);
        }
    } catch(e) { console.warn('Scores composites:', e); }
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
        // Registre transverse : enregistrer les alertes bio pour la Synthèse
        if (targetId === 'alertes-bio') {
            // Extraction best-effort du titre (<strong>…</strong>) et de la sévérité
            const titleMatch = String(htmlStr).match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
            const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
            const severity = /alert-danger|alert-stopp/.test(htmlStr) ? 'danger' : 'warning';
            if (title) _regAddDomain('bio', { titre: title, message: '', severity });
        }
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
        // Fragilité sévère STOPPFrail : CFS ≥ seuil (réf. CLINICAL_THRESHOLDS) ou palliatif.
        fragiliteSevere: (getVal('scoreCFS') >= ((typeof CLINICAL_THRESHOLDS !== 'undefined' && CLINICAL_THRESHOLDS.CFS_FRAGILITE_SEVERE) || 6)) || isChecked('chkPalliatif'),
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
            // Les règles « supplement » (PIM/interactions Beers, PRISCUS, EU(7)-PIM,
            // REMEDIES) sont évaluées par le moteur mais relèvent de l'onglet « éviter » :
            // on les fusionne ici (dédup par titre) — elles n'étaient pas rendues.
            const eviterAll = (recos.eviter || []).slice();
            // Clé de dédup = titre + sévérité (et non titre seul) : ne fusionne que de
            // vrais doublons, sans masquer deux règles distinctes au libellé identique
            // mais de gravité différente.
            const eviterKey = a => (a.titre || '').trim() + '|' + (a.severite || '');
            const seenEviter = new Set(eviterAll.map(eviterKey));
            (recos.supplement || []).forEach(a => {
                if (a.id && SUPPLEMENT_QUARANTINE.has(a.id)) return;
                const k = eviterKey(a);
                if (!seenEviter.has(k)) { seenEviter.add(k); eviterAll.push(a); }
            });
            eviterAll.sort((a, b) => (b.score || 0) - (a.score || 0));
            const eviterFinal = reconcileAlertClusters(eviterAll);

            const eviterHtml = eviterFinal.length ? GeriaEngineV2.renderAlertesTriees(eviterFinal, 'eviter') : '';
            const initierHtml = recos.initier ? GeriaEngineV2.renderAlertesTriees(recos.initier, 'initier') : '';
            document.getElementById('alertes-eviter').innerHTML = eviterHtml;
            document.getElementById('alertes-initier').innerHTML = initierHtml;

            counts.eviter = eviterFinal.length;
            counts.initier = recos.initier ? recos.initier.length : 0;
            // Registre: éviter/initier depuis le moteur V2
            eviterFinal.forEach(a => {
                (a.med_keys || []).forEach(k => _regAddMed(k, 'eviter', { text: a.titre || a.message || '', severity: a.severite || 'warning', source: a.sources_label || '' }));
                _regAddDomain('eviter', { titre: a.titre || '', meds: a.med_keys || [], severity: a.severite || 'warning' });
            });
            if (recos.initier) recos.initier.forEach(a => {
                _regAddDomain('initier', {
                    titre: a.titre || '',
                    message: a.message || '',
                    alternatives: a.alternatives || '',
                    sources_label: a.sources_label || '',
                    meds: a.med_absent || [],
                    severity: 'info'
                });
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
            CHA2DS2: 'IC +1 | HTA +1 | Âge≥75 +2 | Diabète +1 | AVC/AIT +2 | Vasculaire +1 | Âge 65-74 +1. Source: ESC 2024 (sexe retiré).',
            HAS_BLED: 'HTA +1 | IRC (DFG<50) +1 | AVC +1 | Saignement +1 | INR labile +1 | Âge>65 +1 | Alcool +1 | Méd. antiagrég/AINS +1. Source: Pisters 2010.',
            ORBIT: 'Âge≥75 +1 | Anémie +2 | Saignement +2 | DFG<60 +1 | Antiagrégant +1. Source: O\'Brien 2015.',
            RISQ_PATH: 'Âge≥65 +1 | Femme +1 | Obésité +1 | HypoK +2 | HypoCa +2 | IRC sévère +2 | Inflammation +1 | Cardiopathie +1 | FA +1 | Démence +1 | Méd QT(KR) +3. Source: Tisdale 2013 adapté.',
            TISDALE: 'Âge≥68 +1 | Femme +1 | Diurétique +1 | HypoK +2 | QTc≥450 +2 | Méd QT +3 | Sepsis +2 | IC +3. Source: Tisdale 2013.',
            DOAC: 'Âge≥75 +1 | DFG 30-49 +1 | DFG<30 +2 | Poids<60kg +1 | ATCD saignement +1 | Antiagrégant +1 | AINS +1 | Diabète +1 | Anémie +1 | IC +1. Source: Hijazi 2023.'
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

        // CHA₂DS₂-VA (ESC 2024 — sexe retiré du calcul)
        let scoreCha = 0; let ttCha = [];
        if(patientAge >= SA.cha_75) { scoreCha += 2; ttCha.push("Âge ≥75 (+2)"); } else if(patientAge >= SA.cha_65) { scoreCha += 1; ttCha.push("Âge ≥65 (+1)"); }
        if(activeComorbs.some(c=>['PAT_002','PAT_003'].includes(c))) { scoreCha += 1; ttCha.push("IC (+1)"); }
        if(activeComorbs.includes('PAT_005')) { scoreCha += 1; ttCha.push("HTA (+1)"); }
        if(activeComorbs.some(c=>['PAT_016','PAT_016a','PAT_016b'].includes(c))) { scoreCha += 1; ttCha.push("Diabète (+1)"); }
        if(activeComorbs.includes('PAT_008')) { scoreCha += 2; ttCha.push("ATCD AVC (+2)"); }
        if(activeComorbs.some(c=>['PAT_004','PAT_007'].includes(c))) { scoreCha += 1; ttCha.push("Vasc (+1)"); }
        let chaConc = scoreCha === 0 ? SC.CHA2DS2.conclusions[0] : (scoreCha === 1 ? SC.CHA2DS2.conclusions[1] : SC.CHA2DS2.conclusions.haut);
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

        // DOACscore (Hijazi et al. 2023 — risque de saignement majeur sous AOD)
        let scoreDoac = 0; let ttDoac = [];
        if(patientAge >= SA.orbit_75) { scoreDoac += 1; ttDoac.push("Âge ≥75 (+1)"); }
        let dfgDoac = bioValues['BIO_004'];
        if(dfgDoac > 0 && dfgDoac < 30) { scoreDoac += 2; ttDoac.push("DFG <30 (+2)"); }
        else if(dfgDoac > 0 && dfgDoac < 50) { scoreDoac += 1; ttDoac.push("DFG 30-49 (+1)"); }
        let poidsDoac = getVal('patientPoids');
        if(poidsDoac > 0 && poidsDoac < 60) { scoreDoac += 1; ttDoac.push("Poids <60kg (+1)"); }
        if(isChecked('chkSaignement')) { scoreDoac += 1; ttDoac.push("ATCD saignement (+1)"); }
        if(patientHasMedClass('antiagregant')) { scoreDoac += 1; ttDoac.push("Antiagrégant (+1)"); }
        if(patientHasMedClass('ains')) { scoreDoac += 1; ttDoac.push("AINS (+1)"); }
        if(activeComorbs.some(c=>['PAT_016','PAT_016a','PAT_016b'].includes(c))) { scoreDoac += 1; ttDoac.push("Diabète (+1)"); }
        if(bioValues['BIO_009'] > 0 && ((sexe === 'M' && bioValues['BIO_009'] < SB.anemia_M) || (sexe === 'F' && bioValues['BIO_009'] < SB.anemia_F))) { scoreDoac += 1; ttDoac.push("Anémie (+1)"); }
        if(activeComorbs.some(c=>['PAT_002','PAT_003'].includes(c))) { scoreDoac += 1; ttDoac.push("IC (+1)"); }
        renderScore(SC.DOAC, scoreDoac, ttDoac);

        // RISQ-PATH
        let scoreRisq = 0; let ttRisq = [];
        if(patientAge >= SA.risq_65) { scoreRisq += 1; ttRisq.push("Âge ≥65 (+1)"); }
        if(sexe === 'F') { scoreRisq += 1; ttRisq.push("Femme (+1)"); }
        if(getVal('patientBmi') >= 30) { scoreRisq += 1; ttRisq.push("Obésité (+1)"); }
        if(bioValues['BIO_001'] > 0 && bioValues['BIO_001'] <= SB.hypoK) { scoreRisq += 2; ttRisq.push("HypoK (+2)"); }
        if(bioValues['BIO_005'] > 0 && bioValues['BIO_005'] < SB.hypoCa) { scoreRisq += 2; ttRisq.push("HypoCa (+2)"); }
        if(bioValues['BIO_004'] > 0 && bioValues['BIO_004'] <= SB.irc_severe) { scoreRisq += 2; ttRisq.push("IRC Sévère (+2)"); }
        if(bioValues['BIO_024'] > 5) { scoreRisq += 1; ttRisq.push("Inflammation (+1)"); }
        if(['PAT_005','PAT_002','PAT_003'].some(c=>activeComorbs.includes(c))) { scoreRisq += 1; ttRisq.push("HTA/IC (+1)"); }
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

        // Charge Anticholinergique — Boustani 2008 ACB Scale (révisée AGS Beers 2023)
        // Seuils retenus :
        //   ACB ≥ 3   : haute charge — RR confusion x1.5, RR mortalité x1.26 (Fox 2011 JAGS)
        //   ACB 1-2   : charge modérée — surveillance
        //   ACB = 0   : aucune
        // CIA (Carnahan 2006, ADS) sert d'échelle complémentaire (charge sédative/cognitive)
        // BHE (Rudolph 2008 ARS) distingue passage central vs périphérique pour cibler la déprescription.
        let acbClass = scoreACB_global >= 3 ? 'danger' : (scoreACB_global >= 1 ? 'warning' : 'success');
        let acbInterp = scoreACB_global >= 3 ? 'Risque cognitif élevé — confusion, chutes, mortalité (Fox 2011, Beers 2023)'
            : (scoreACB_global >= 1 ? 'Charge modérée, surveiller (Boustani 2008)'
            : 'Charge nulle — aucun médicament anticholinergique détecté');
        let ciaInterp = scoreCIA_global >= 3 ? 'Risque sédatif élevé — chutes, somnolence'
            : (scoreCIA_global >= 1 ? 'Charge modérée'
            : 'Charge nulle — aucun médicament sédatif détecté');
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

        // =========================================================
        // SCREENINGS GÉRIATRIQUES STANDARDISÉS
        // =========================================================

        // --- Score de Fragilité CFS (déjà saisi) — interprétation enrichie ---
        {
            const cfs = getVal('scoreCFS');
            if (cfs >= 1) {
                let cfsColor = cfs <= 3 ? 'success' : (cfs <= 5 ? 'warning' : 'danger');
                let cfsLabels = { 1: 'Très en forme', 2: 'En forme', 3: 'Gère bien', 4: 'Vulnérable', 5: 'Légèrement fragile', 6: 'Modérément fragile', 7: 'Sévèrement fragile', 8: 'Très sévèrement fragile', 9: 'Phase terminale' };
                let cfsConc = cfs <= 3 ? 'Patient robuste — pas de restriction thérapeutique liée à la fragilité.' :
                    (cfs === 4 ? 'Vulnérable — surveillance rapprochée, prévention des décompensations.' :
                    (cfs <= 6 ? 'Fragile — adapter les cibles thérapeutiques (HbA1c, PA), déprescrire si bénéfice incertain, éviter les médicaments à forte charge anticholinergique.' :
                    (cfs <= 8 ? 'Très fragile — approche palliative à discuter, STOPPFrail applicable, objectif confort.' :
                    'Phase terminale — seuls les traitements de confort sont justifiés.')));
                addAlert('alertes-scores', `<div class="alert alert-light border border-${cfsColor} mb-2 shadow-sm">
                    <strong class="text-${cfsColor}">CFS : ${cfs}/9 — ${cfsLabels[cfs] || ''}</strong> <em class="text-muted small">— Clinical Frailty Scale (Rockwood 2005)</em>
                    <br><small class="fw-bold text-${cfsColor}">${cfsConc}</small>
                </div>`);
            }
        }

        // Score de Child-Pugh (saisie manuelle OU calcul automatique)
        let cpManualEl = document.getElementById('cpManual');
        let cpManualVal = cpManualEl ? cpManualEl.value : '0';
        let cpScore = 0;
        cpClass = null; // reset (declared at function scope)
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
            addAlert('alertes-bio', `<div class="alert alert-${isSevere ? 'danger alert-stopp' : 'warning border-warning'} shadow-sm"><strong>${isSevere ? '🚨' : '⚠️'} ${s.NOM_SYNDROME}</strong>${imputStr}<br><small>${s.CONDUITE_IMMEDIATE || 'Surveillance'}</small></div>`, 'bio');
        } catch(e) { GeriaLog.warn('Erreur syndrome bio:', e.message); }
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

            // SYND_006 : Anémie Ferriprive (critères ESC 2023 / HAS 2022)
            //   - Ferritine < 30 µg/L (carence absolue, pas d'inflammation requise)
            //   - OU Ferritine 30-299 + CST < 20% + CRP > 5 mg/L (carence fonctionnelle inflammatoire)
            //   - Ne PAS déclencher sur CST < 20% isolé si ferritine normale et pas d'inflammation
            //     (peut être dû à thalassémie, hypothyroïdie, variations préanalytiques)
            const ferBas = (fer > 0 && fer < 30);
            const ferFonctionnel = (fer > 0 && fer < 300 && cst > 0 && cst < 20 && crp > 5);
            if (ferBas || ferFonctionnel) {
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
            let thyroSev = isOvert ? 'danger' : 'warning';
            let thyroCauses = [];
            let hypoTerms = MASTER_DB.SYNDROMES['SYND_013'] && MASTER_DB.SYNDROMES['SYND_013'].IMPUTABILITE_FREQ ? MASTER_DB.SYNDROMES['SYND_013'].IMPUTABILITE_FREQ.split(',').map(x=>x.trim().replace(/\s*\(.*?\)/g, '')).filter(Boolean) : [];
            hypoTerms.forEach(d => { if(patientHasMedClass(d)) thyroCauses.push(d); });
            let thyroImput = thyroCauses.length > 0 ? `<br><em>Imputabilité iatrogène :</em> <b>${thyroCauses.join(', ').toUpperCase()}</b>` : '';
            let thyroLabel = isOvert ? (thyroCauses.length > 0 ? 'Hypothyroïdie iatrogène avérée' : 'Hypothyroïdie avérée') : (thyroCauses.length > 0 ? 'Hypothyroïdie iatrogène subclinique' : 'Hypothyroïdie subclinique');
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

    // --- TP bas (< 50%) — Risque hémorragique ---
    if (bioValues['BIO_TP'] > 0 && bioValues['BIO_TP'] < 50) {
        let tpCauses = [];
        ['avk', 'anticoag', 'rivaroxaban', 'apixaban', 'dabigatran'].forEach(d => { if (patientHasMedClass(d)) tpCauses.push(d); });
        let tpImput = tpCauses.length > 0 ? `<br><em>Imputabilité :</em> <b>${tpCauses.join(', ').toUpperCase()}</b>` : '';
        addAlert('alertes-bio', `<div class="alert alert-danger shadow-sm"><strong>🚨 TP bas (${bioValues['BIO_TP']}%) — Risque hémorragique</strong>${tpImput}
            <br><em>Conduite :</em> ${bioValues['BIO_TP'] < 30 ? 'TP < 30% — urgence hémostatique, vitamine K IV si AVK, PFC si IHC sévère.' : 'Rechercher cause : insuffisance hépatique, AVK, CIVD. Adapter anticoagulation.'}</div>`, 'bio');
    }

    // --- Hypochlorémie (< 95 mmol/L) ou Hyperchlorémie (> 110 mmol/L) ---
    if (bioValues['BIO_CL'] > 0) {
        if (bioValues['BIO_CL'] < 95) {
            addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Hypochlorémie (${bioValues['BIO_CL']} mmol/L)</strong>
                <br><em>Causes fréquentes :</em> Vomissements, aspirations gastriques, diurétiques (furosémide). Alcalose métabolique associée probable.
                <br><em>Conduite :</em> Corriger la cause, NaCl IV si sévère.</div>`, 'bio');
        } else if (bioValues['BIO_CL'] > 110) {
            addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Hyperchlorémie (${bioValues['BIO_CL']} mmol/L)</strong>
                <br><em>Causes fréquentes :</em> Perfusion NaCl excessive, acidose tubulaire, IRC. Acidose hyperchlorémique possible.
                <br><em>Conduite :</em> Trou anionique, gaz du sang, adapter les perfusions.</div>`, 'bio');
        }
    }

    // --- Hyperosmolalité (> 300 mOsm/kg) — Déshydratation ---
    if (bioValues['BIO_OSM'] > 300) {
        let osmCauses = [];
        ['diuretique', 'lithium', 'mannitol'].forEach(d => { if (patientHasMedClass(d)) osmCauses.push(d); });
        let osmImput = osmCauses.length > 0 ? `<br><em>Imputabilité :</em> <b>${osmCauses.join(', ').toUpperCase()}</b>` : '';
        addAlert('alertes-bio', `<div class="alert alert-${bioValues['BIO_OSM'] > 320 ? 'danger' : 'warning'} shadow-sm">
            <strong>${bioValues['BIO_OSM'] > 320 ? '🚨' : '⚠️'} Hyperosmolalité (${bioValues['BIO_OSM']} mOsm/kg)</strong>${osmImput}
            <br><em>Conduite :</em> ${bioValues['BIO_OSM'] > 320 ? 'Déshydratation sévère — réhydratation IV par soluté hypotonique. Rechercher coma hyperosmolaire si diabétique.' : 'Déshydratation modérée — réhydratation PO/IV, adapter diurétiques.'}</div>`, 'bio');
    }

    // --- Préalbumine (transthyrétine) — Marqueur de suivi nutritionnel ---
    // Normes : 0.20-0.40 g/L | Seuils révisés (Bouillanne 2017) : sévère < 0.12, modéré < 0.17
    // NB : HAS 2021 ne retient plus la préalbumine comme critère diagnostique de dénutrition,
    //       mais reste utile en suivi d'efficacité de la renutrition (demi-vie 2-4 jours).
    if (bioValues['BIO_PREALB'] > 0 && bioValues['BIO_PREALB'] < 0.12) {
        addAlert('alertes-bio', `<div class="alert alert-danger shadow-sm"><strong>🚨 Préalbumine très basse (${bioValues['BIO_PREALB']} g/L) — dénutrition sévère</strong>
            <br><em>Normes :</em> 0.20 – 0.40 g/L | Seuil sévère < 0.12 g/L (Bouillanne 2017)
            <br><em>Interprétation :</em> Dénutrition protéino-énergétique sévère (marqueur précoce, demi-vie 2-4 jours). Attention : abaissée aussi en syndrome inflammatoire (CRP élevée) et insuffisance hépatique.
            <br><em>Conduite :</em> Support nutritionnel urgent : CNO hypercaloriques/hyperprotidiques, envisager nutrition entérale. Adapter posologies des médicaments à forte liaison protéique. Contrôle à J15.</div>`, 'bio');
    } else if (bioValues['BIO_PREALB'] > 0 && bioValues['BIO_PREALB'] < 0.17) {
        addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Préalbumine basse (${bioValues['BIO_PREALB']} g/L) — dénutrition modérée</strong>
            <br><em>Normes :</em> 0.20 – 0.40 g/L | Seuil modéré < 0.17 g/L (Bouillanne 2017)
            <br><em>Conduite :</em> Enrichissement des repas, CNO, réévaluation à J15. Éliminer un syndrome inflammatoire surajouté (CRP).</div>`, 'bio');
    } else if (bioValues['BIO_PREALB'] > 0 && bioValues['BIO_PREALB'] < 0.20) {
        addAlert('alertes-bio', `<div class="alert alert-info border-info shadow-sm"><strong>💡 Préalbumine limite basse (${bioValues['BIO_PREALB']} g/L)</strong>
            <br><em>Normes :</em> 0.20 – 0.40 g/L
            <br><em>Conduite :</em> Surveillance nutritionnelle rapprochée. Enrichir les repas, peser régulièrement. Contrôle à 1 mois.</div>`, 'bio');
    }

    // --- Supplémentation vitamine D : couverture déléguée à STOPP/START v3 ---
    // L'ancienne alerte HAS 2011 hardcodée a été retirée pour éviter le doublon avec
    // IN_H03 (vit D ostéoporose) + IN_H05 (vit D carence < 20 ng/mL) du moteur
    // GERIA_RECOS_DB. Voir geria_recos_final.js.


    // --- Carence B12 isolée (sans anémie) — fréquente sous metformine/IPP ---
    if (bioValues['BIO_021'] > 0 && bioValues['BIO_021'] < 150 && !(bioValues['BIO_009'] > 0 && bioValues['BIO_009'] < 12)) {
        let b12Causes = [];
        ['metformine', 'omeprazole', 'esomeprazole', 'lansoprazole', 'pantoprazole', 'rabeprazole', 'phenytoine'].forEach(d => { if(patientHasMedClass(d)) b12Causes.push(d); });
        let b12Imput = b12Causes.length > 0 ? `<br><em>Imputabilité iatrogène :</em> <b>${b12Causes.join(', ').toUpperCase()}</b>` : '';
        addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Carence en Vitamine B12 (sans anémie)</strong> (B12 : ${bioValues['BIO_021']} pmol/L)${b12Imput}
            <br><em>Conduite :</em> Supplémentation B12 IM ou forte dose PO (1000 µg/j), contrôle à 3 mois. Neuropathie périphérique possible même sans anémie.</div>`, 'bio');
    }

    // --- HbA1c informative (cibles gériatriques individualisées — ADA 2025 §13 Table 13.1) ---
    if (bioValues['BIO_026'] > 0) {
        let hba1c = bioValues['BIO_026'];
        if (hba1c > 8.5 && patientAge >= 75) {
            addAlert('alertes-bio', `<div class="alert alert-danger shadow-sm"><strong>🚨 HbA1c élevée chez le sujet âgé</strong> (HbA1c ${hba1c}%)
                <br><em>Cibles ADA 2025 :</em> < 7.5% (robuste) | < 8% (complexe) | < 8.5% (très fragile/EHPAD)
                <br><em>Conduite :</em> Réévaluer traitement antidiabétique, attention hypoglycémies sous sulfamides/insuline.</div>`, 'bio');
        } else if (hba1c < 6.5 && patientAge >= 75 && (patientHasMedClass('sulfamide') || patientHasMedClass('insuline') || patientHasMedClass('glinide'))) {
            addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ HbA1c basse sous traitement hypoglycémiant</strong> (HbA1c ${hba1c}%)
                <br><em>Risque :</em> Hypoglycémie iatrogène chez le sujet âgé (chutes, confusion, AVC).
                <br><em>Conduite :</em> Envisager réduction de dose ou arrêt sulfamide/insuline. Cibles ADA 2025 : < 7.5% (robuste), < 8% (complexe), < 8.5% (très fragile).</div>`, 'bio');
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
    // 3a. DÉTECTION CASCADE IATROGÉNIQUE
    // =========================================================
    {
        const cascadePatterns = [
            // NB : la combinaison IEC + bêtabloquant + diurétique est un SOCLE THÉRAPEUTIQUE légitime
            // dans l'IC/HTA (ESC 2021/2023). On ne la traite donc plus comme une cascade iatrogène.
            // La détection d'hypotension / chutes iatrogène est couverte par les alertes
            // spécifiques (EV_K01, EV_K02, dashboard polypharmacie).
            { trigger: ['neuroleptique', 'antipsychotique'],
              effect: 'syndrome extrapyramidal', cascade: ['antiparkinsonien', 'levodopa'],
              desc: 'Neuroleptique → Syndrome extrapyramidal → Ajout antiparkinsonien. Privilégier l\'arrêt du neuroleptique plutôt que l\'ajout.' },
            { trigger: ['diuretique'],
              effect: 'hypokaliémie/déshydratation', cascade: ['potassium', 'sel'],
              desc: 'Diurétique → Hypokaliémie → Ajout potassium. Réévaluer l\'indication du diurétique, vérifier les doses.' },
            { trigger: ['opioid'],
              effect: 'constipation', cascade: ['laxatif'],
              desc: 'Opioïde → Constipation → Ajout laxatif. Si opioïde non indispensable, envisager rotation ou déprescription.' },
            { trigger: ['inhibiteurscholinesterase', 'donepezil', 'rivastigmine', 'galantamine'],
              effect: 'troubles digestifs', cascade: ['antiemetique', 'metoclopramide', 'domperidone'],
              desc: 'Anti-Alzheimer → Nausées/Diarrhées → Ajout antiémétique (risque extrapyramidal). Réévaluer le bénéfice de l\'anticholinestérasique.' },
            { trigger: ['ains'],
              effect: 'HTA/gastropathie', cascade: ['ipp', 'antihypertenseur'],
              desc: 'AINS → HTA secondaire + Gastropathie → Ajout IPP + Majoration antihypertenseur. Préférer le paracétamol.' },
            { trigger: ['corticoide'],
              effect: 'hyperglycémie/ostéoporose', cascade: ['insuline', 'antidiabetique', 'bisphosphonate'],
              desc: 'Corticoïde → Hyperglycémie + Ostéoporose → Ajout antidiabétique + Bisphosphonate. Évaluer la possibilité de sevrage.' },
            { trigger: ['benzodiazepine', 'hypnotique'],
              effect: 'somnolence/chutes', cascade: [],
              desc: 'BZD → Somnolence diurne, chutes, troubles cognitifs. Déprescription progressive recommandée (réduction 25% toutes les 2 semaines).' }
        ];

        let cascadeAlerts = [];
        cascadePatterns.forEach(p => {
            let triggerMeds = activeMeds.filter(m => p.trigger.some(cls => matchesDrugClass(sanitizeText(m.dci), sanitizeText(m.classe || ''), cls)));
            if (triggerMeds.length === 0) return;
            const triggerDcis = new Set(triggerMeds.map(m => sanitizeText(m.dci)));
            let cascadeMeds = p.cascade.length > 0 ? activeMeds.filter(m => !triggerDcis.has(sanitizeText(m.dci)) && p.cascade.some(cls => matchesDrugClass(sanitizeText(m.dci), sanitizeText(m.classe || ''), cls))) : [];
            if (p.cascade.length > 0 && cascadeMeds.length === 0) return;
            let trigNames = triggerMeds.map(m => m.dci.toUpperCase()).join(', ');
            let cascNames = cascadeMeds.length > 0 ? cascadeMeds.map(m => m.dci.toUpperCase()).join(', ') : '';
            cascadeAlerts.push({ trigger: trigNames, cascade: cascNames, effect: p.effect, desc: p.desc });
        });

        if (cascadeAlerts.length > 0) {
            let cascadeHtml = cascadeAlerts.map(c =>
                `<li class="mb-2"><span class="text-danger fw-bold">${c.trigger}</span> → ${c.effect}${c.cascade ? ` → <span class="text-warning fw-bold">${c.cascade}</span>` : ''}
                <br><small class="text-muted">${c.desc}</small></li>`
            ).join('');
            addAlert('alertes-eviter', `<div class="alert alert-warning border-warning shadow-sm">
                <strong>🔄 Cascades iatrogéniques détectées (${cascadeAlerts.length})</strong>
                <span class="badge bg-secondary float-end" style="font-size:0.65em;">Rochon 1997 / Scott 2015</span>
                <ul class="mb-0 ps-3 mt-1">${cascadeHtml}</ul>
            </div>`, 'eviter');
        }
    }

    // =========================================================
    // 3a-bis. DÉPRESCRIPTION GUIDÉE (BZD / Opioïdes / IPP / Statines)
    // =========================================================
    {
        const deprescriptionGuides = [];

        // BZD / Z-drugs
        const bzdMeds = activeMeds.filter(m => matchesDrugClass(sanitizeText(m.dci), sanitizeText(m.classe || ''), 'benzodiazepine') || matchesDrugClass(sanitizeText(m.dci), sanitizeText(m.classe || ''), 'hypnotique'));
        if (bzdMeds.length > 0 && (isFragile || patientAge >= 75 || isChecked('chkChutes'))) {
            deprescriptionGuides.push({
                meds: bzdMeds.map(m => m.dci.toUpperCase()).join(', '),
                classe: 'Benzodiazépines / Z-drugs',
                color: 'danger',
                protocol: `<b>Protocole de sevrage :</b> Réduction de 25% de la dose tous les 15 jours. Si dose faible : passage à demi-dose pendant 2 semaines puis arrêt.
                    <br>Si BZD à demi-vie longue (diazépam, clorazépate) → switch vers BZD demi-vie courte (oxazépam, lorazépam) avant sevrage.
                    <br><em>Alternatives :</em> Mélatonine LP 2mg, hygiène du sommeil, TCC-I. Ne pas substituer par un antihistaminique (charge anticholinergique).`,
                source: 'HAS 2015 / deprescribing.org'
            });
        }

        // Opioïdes
        const opioidMeds = activeMeds.filter(m => matchesDrugClass(sanitizeText(m.dci), sanitizeText(m.classe || ''), 'opioid'));
        if (opioidMeds.length > 0 && (isFragile || patientAge >= 80)) {
            deprescriptionGuides.push({
                meds: opioidMeds.map(m => m.dci.toUpperCase()).join(', '),
                classe: 'Opioïdes',
                color: 'danger',
                protocol: `<b>Réévaluation systématique :</b> Évaluer le bénéfice antalgique (EVA). Si douleur non cancéreuse chronique > 3 mois, envisager sevrage progressif.
                    <br>Réduction de 10% de la dose totale par semaine. Surveiller syndrome de sevrage (agitation, diarrhée, myalgies).
                    <br><em>Alternatives :</em> Paracétamol, TENS, kinésithérapie, duloxétine (si douleur neuropathique).`,
                source: 'CDC 2022 / Sociétés de douleur'
            });
        }

        // IPP au long cours
        const ippMeds = activeMeds.filter(m => matchesDrugClass(sanitizeText(m.dci), sanitizeText(m.classe || ''), 'ipp'));
        if (ippMeds.length > 0 && !isChecked('chkAtcdUlcere') && !activeComorbs.includes('PAT_021')) {
            let hasIndicationIPP = patientHasMedClass('ains') || patientHasMedClass('anticoag') || patientHasMedClass('antiagreg');
            if (!hasIndicationIPP) {
                deprescriptionGuides.push({
                    meds: ippMeds.map(m => m.dci.toUpperCase()).join(', '),
                    classe: 'IPP (sans indication claire)',
                    color: 'warning',
                    protocol: `<b>Sevrage :</b> Réduction à demi-dose pendant 4 semaines, puis passage à la demande, puis arrêt.
                        <br>Risque rebond acide : prévenir le patient (brûlures transitoires 1-2 semaines).
                        <br><em>Risques IPP au long cours :</em> Hyponatrémie, hypomagnésémie, carence B12/fer, fractures ostéoporotiques, C. difficile.`,
                    source: 'deprescribing.org / HAS'
                });
            }
        }

        // Statines chez le très fragile (CFS ≥ 7) sans ATCD cardiovasculaire
        const statinMeds = activeMeds.filter(m => matchesDrugClass(sanitizeText(m.dci), sanitizeText(m.classe || ''), 'statine'));
        if (statinMeds.length > 0 && getVal('scoreCFS') >= 7 && !activeComorbs.some(c => ['PAT_004', 'PAT_007', 'PAT_008'].includes(c))) {
            deprescriptionGuides.push({
                meds: statinMeds.map(m => m.dci.toUpperCase()).join(', '),
                classe: 'Statines (patient très fragile, prévention primaire)',
                color: 'info',
                protocol: `<b>Recommandation :</b> Chez le patient très fragile (CFS ≥ 7) en prévention primaire, le bénéfice des statines est incertain.
                    <br>Arrêt envisageable après discussion avec le patient/famille. Pas de protocole de sevrage nécessaire.`,
                source: 'STOPPFrail 2017 / Holmes 2015'
            });
        }

        if (deprescriptionGuides.length > 0) {
            let depHtml = deprescriptionGuides.map(d =>
                `<div class="alert alert-${d.color} py-2 mb-2 shadow-sm" style="border-left:4px solid;">
                    <strong>${d.classe} : ${d.meds}</strong>
                    <span class="badge bg-dark float-end" style="font-size:0.6em;">${d.source}</span>
                    <br><small>${d.protocol}</small>
                </div>`
            ).join('');
            addAlert('alertes-eviter', `<div class="card mb-2 shadow-sm">
                <div class="card-header py-2" style="background:linear-gradient(135deg,#ffecd2,#fcb69f);"><strong>📋 Protocoles de déprescription guidée (${deprescriptionGuides.length})</strong></div>
                <div class="card-body p-2">${depHtml}</div>
            </div>`, 'eviter');
        }
    }

    // =========================================================
    // 3a-bis. DÉTECTION DE DOUBLONS THÉRAPEUTIQUES (même classe)
    //   — Alerte "A EVITER" lorsque ≥ 2 médicaments d'une même classe
    //     sont co-prescrits sans justification EBM documentée.
    // =========================================================
    if (typeof DRUG_CLASSES !== 'undefined' && typeof matchesDrugClass === 'function') {
        // Classes à surveiller pour doublon — avec justification autorisée éventuelle
        const DUPLICATE_WATCH = [
            { key: 'iec',                          label: 'IEC',                          note: "Association IEC non recommandée (risque hyperK+/IRA ; ESC 2021)." },
            { key: 'ara2',                         label: 'ARA2',                         note: "Association ARA2 non recommandée (ONTARGET, VA NEPHRON-D)." },
            { key: 'betabloquant',                 label: 'Bêtabloquants',                note: "Association BB systémiques non recommandée (bradycardie, hypoTA)." },
            { key: 'isrs',                         label: 'ISRS',                         note: "Association de 2 ISRS = syndrome sérotoninergique (Beers 2023, STOPP D14).", exception: "Exception : NaSSA (mirtazapine, miansérine) + ISRS/IRSN n'est PAS un doublon (« California Rocket Fuel » de Stahl 2007 — augmentation potentialisatrice acceptée en dépression résistante chez l'âgé). Cette association sort du DUPLICATE_WATCH." },
            { key: 'irsn',                         label: 'IRSN',                         note: "Association de 2 IRSN non justifiée (sérotoninergique).", exception: "Exception : NaSSA (mirtazapine, miansérine) + IRSN n'est PAS un doublon (« California Rocket Fuel »). Cette association sort du DUPLICATE_WATCH." },
            { key: 'antidepresseur_tricyclique',   label: 'Antidépresseurs tricycliques', note: "Association ATC non justifiée (anticholinergique, cardiotox)." },
            { key: 'benzodiazepine',               label: 'Benzodiazépines',              note: "Association BZD déconseillée (STOPP D5, Beers 2023) — chutes, confusion.", exception: "Exception parfois : 1 hypnotique court + 1 anxiolytique, mais à éviter chez le sujet âgé." },
            { key: 'ipp',                          label: 'IPP',                          note: "Association IPP non justifiée." },
            { key: 'ains',                         label: 'AINS',                         note: "Association AINS formellement contre-indiquée (saignements, IRA)." },
            { key: 'antipsychotique',              label: 'Antipsychotiques',             note: "Association neuroleptiques à éviter (QT, sédation, surmortalité démence).", exception: "Exception transitoire possible pendant un switch progressif." },
            { key: 'diuretique_thiazidique',       label: 'Diurétiques thiazidiques',     note: "Association thiazidique non justifiée." },
            { key: 'diuretique_anse',              label: 'Diurétiques de l\'anse',       note: "Association de l\'anse non justifiée." },
            { key: 'opioid',                       label: 'Opioïdes',                     note: "Association opioïdes forts déconseillée (sédation, dépression respiratoire).", exception: "Exception : 1 opioïde fond + 1 opioïde interdose (même DCI ou LP+IR) si douleur chronique cancéreuse." },
            { key: 'statine',                      label: 'Statines',                     note: "Association de statines non justifiée." },
            { key: 'sulfamide_hypoglycemiant',     label: 'Sulfamides hypoglycémiants',   note: "Association sulfamides contre-indiquée (hypoglycémie sévère)." },
            { key: 'glinide',                      label: 'Glinides',                     note: "Association glinides non justifiée." },
            { key: 'anticoagulant',                label: 'Anticoagulants curatifs',      note: "Association AOD/AVK/HBPM curative = risque hémorragique majeur.", exception: "Exception : bridge AVK/HBPM transitoire péri-opératoire." },
            { key: 'antiagregant',                 label: 'Antiagrégants',                note: "Association d\'antiagrégants = risque hémorragique accru.", exception: "Exception : DAPT post-SCA/stent (aspirine + inhibiteur P2Y12) pendant durée limitée (ESC)." },
            { key: 'macrolide',                    label: 'Macrolides',                   note: "Association macrolides non justifiée." },
            { key: 'fluoroquinolone',              label: 'Fluoroquinolones',             note: "Association FQ non justifiée." },
            { key: 'valproate_salts',              label: 'Sels de valproate (Dépakine / Dépakote / Dépamide)', note: "Association de 2 sels de valproate = surdosage en acide valproïque (hépatotoxicité, hyperammoniémie, thrombopénie). Un seul sel de valproate à la fois." }
        ];

        const dupFound = [];
        // Exception « California Rocket Fuel » (Stahl 2007) :
        // NaSSA (mirtazapine, miansérine) + ISRS/IRSN n'est PAS un doublon thérapeutique
        // mais une potentialisation acceptée en dépression résistante chez l'âgé.
        const NASSA_DCIS = new Set(['mirtazapine', 'mianserine']);
        const hasNaSSA = activeMeds.some(m => NASSA_DCIS.has((m.dci || '').toLowerCase().trim()));
        DUPLICATE_WATCH.forEach(cls => {
            const members = activeMeds.filter(m => {
                const dci = sanitizeText(m.dci || '');
                const classe = sanitizeText(m.classe || '');
                return matchesDrugClass(dci, classe, cls.key);
            });
            // Dédupliquer par DCI (ignorer 2 formes du même médicament : LP + IR)
            let uniqDcis = [...new Set(members.map(m => (m.dci || '').toLowerCase().trim()))];
            // Filtrer NaSSA + ISRS/IRSN (California Rocket Fuel — exception légitime)
            if (hasNaSSA && (cls.key === 'isrs' || cls.key === 'irsn' || cls.key === 'antidepresseur')) {
                uniqDcis = uniqDcis.filter(d => !NASSA_DCIS.has(d));
            }
            if (uniqDcis.length >= 2) {
                dupFound.push({
                    label: cls.label,
                    note: cls.note,
                    exception: cls.exception || '',
                    dcis: uniqDcis
                });
            }
        });

        if (dupFound.length > 0) {
            dupFound.forEach(d => {
                const dciList = d.dcis.map(x => `<strong>${escapeHtml(x.toUpperCase())}</strong>`).join(' + ');
                addAlert('alertes-eviter', `<div class="alert alert-warning border-warning shadow-sm">
                    <strong>⚠️ Doublon thérapeutique — ${escapeHtml(d.label)}</strong>
                    <span class="badge bg-dark float-end" style="font-size:0.65em;">Doublon classe</span>
                    <br><span class="small">${dciList}</span>
                    <br><small>${escapeHtml(d.note)}</small>
                    ${d.exception ? `<br><small class="text-info fst-italic">${escapeHtml(d.exception)}</small>` : ''}
                    <br><span class="badge bg-warning text-dark" style="font-size:0.7em;">A ÉVITER sauf justification EBM</span>
                </div>`, 'eviter');
                d.dcis.forEach(dci => _regAddMed(dci, 'eviter', {
                    severity: 'warning',
                    text: `Doublon thérapeutique (${d.label}) : ${d.dcis.join(' + ')}`,
                    gravite: 'A EVITER',
                    source: 'Doublon classe'
                }));
            });
        }
    }

    // =========================================================
    // 3b. CONTRE-INDICATIONS MÉDICAMENT / PATHOLOGIE (pathology_rules_v3)
    // =========================================================
    if (typeof checkMedContraPathologies === 'function' && activeComorbs.length > 0) {
        activeMeds.forEach(m => {
            const alerts = checkMedContraPathologies(m.dci, m.classe, activeComorbs);
            const seenCI = new Set(); // un même médicament peut matcher la CI via sa classe ET son DCI
            alerts.forEach(a => {
                let isSevere = String(a.gravite).includes('CONTRE-INDICATION') || String(a.gravite).includes('ABSOLUE');
                let alertPrefix = isSevere ? 'CI' : (String(a.gravite).includes('PRUDENCE') ? 'Prudence' : 'Déconseillé');
                const ciSig = alertPrefix + '|' + a.patho_nom; // = titre affiché ; évite le doublon
                if (seenCI.has(ciSig)) return;
                seenCI.add(ciSig);
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
                    <strong>${isSevere ? '🚨' : '⚠️'} ${escapeHtml(m.dci.toUpperCase())} — ${alertPrefix} ${escapeHtml(a.patho_nom)}</strong>
                    <span class="badge bg-secondary float-end" style="font-size:0.65em;" title="${sourceLabel}">${sourceLabel.length > 30 ? sourceLabel.substring(0, 30) + '...' : sourceLabel}</span>
                    <br><span class="small">${a.raison}${a.condition ? ` <em class="text-muted">(${a.condition})</em>` : ''}${a.exception ? `<br><em class="text-info">Exception : ${a.exception}</em>` : ''}</span>
                    <br><span class="badge bg-${isSevere ? 'danger' : 'warning'} text-${isSevere ? 'white' : 'dark'}" style="font-size:0.7em;">${a.gravite}</span>
                </div>`, 'eviter');
                _regAddMed(m.dci, 'eviter', { severity: isSevere ? 'danger' : 'warning', text: `${alertPrefix} ${a.patho_nom} — ${a.raison}`, gravite: a.gravite, source: sourceLabel });
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

        // Dédoublonnage UI cross-source (alert fatigue, CDS 2024) :
        // une alerte (cible, classe, severite) émise par 2 sources n'est affichée qu'une fois.
        const ddiSeenInteractions = new Set();

        activeMeds.forEach(m => {
            let ref = m.db_ref; if(!ref) return;

            // ------ Schéma v2 structuré (ddi_interact_v2) ------
            // Chaque entrée : { classe, dcis:[], commentaire, severite } — on matche uniquement sur
            // les DCIs nominatives, avec self-guard sur la source (DCI + classe du médicament courant).
            if (Array.isArray(ref.ddi_interact_v2) && ref.ddi_interact_v2.length > 0) {
                const selfDci = sanitizeText(ref.dci || '');
                const selfClasse = sanitizeText(ref.classe || '');
                // Tokens atomiques de la DCI source (ex. "Sacubitril/Valsartan" → ["sacubitril","valsartan"])
                const selfParts = selfDci.split(/[\/\+\s,-]+/).filter(p => p && p.length >= 4);

                const foundGroups = []; // { classe, matched:[{dci, interactor}], commentaire, severite }
                ref.ddi_interact_v2.forEach(entry => {
                    if (!entry || !Array.isArray(entry.dcis) || entry.dcis.length === 0) return;
                    const matched = [];
                    entry.dcis.forEach(dciCanon => {
                        const cDci = sanitizeText(dciCanon);
                        if (!cDci) return;
                        // Self-guard sur DCI (composants)
                        for (const sp of selfParts) {
                            if (cDci === sp || (sp.length >= 4 && cDci.includes(sp)) || (cDci.length >= 4 && sp.includes(cDci))) return;
                        }
                        // Chercher dans les AUTRES meds actifs (hors source)
                        const hit = activeMeds.find(am => {
                            if (am === m) return false;
                            const amDci = sanitizeText(am.dci);
                            if (amDci.includes(cDci) || cDci.includes(amDci)) return true;
                            return false;
                        });
                        if (hit) matched.push({ dci: dciCanon, interactor: hit.dci });
                    });
                    if (matched.length > 0) {
                        const classeKey = sanitizeText(entry.classe || '');
                        const sevKey = entry.severite || 'warning';
                        const newMatched = matched.filter(x => {
                            const sig = `${sanitizeText(x.interactor)}::${classeKey}::${sevKey}`;
                            if (ddiSeenInteractions.has(sig)) return false;
                            ddiSeenInteractions.add(sig);
                            return true;
                        });
                        if (newMatched.length > 0) {
                            foundGroups.push({
                                classe: entry.classe || '',
                                matched: newMatched,
                                commentaire: entry.commentaire || '',
                                severite: entry.severite || 'warning',
                            });
                        }
                    }
                });

                if (foundGroups.length > 0) {
                    const isDanger = foundGroups.some(g => g.severite === 'danger');
                    const groupHtml = foundGroups.map(g => {
                        const drugs = g.matched.map(x => escapeHtml(x.interactor.toUpperCase())).join(', ');
                        const com = g.commentaire ? ` <em class="text-muted">(${escapeHtml(g.commentaire)})</em>` : '';
                        return `<li><b>${escapeHtml(g.classe)}</b> → ${drugs}${com}</li>`;
                    }).join('');
                    // Refléter la gravité maximale dans le TITRE (et pas seulement dans le
                    // détail déplié) : une contre-indication absolue doit être visible au
                    // premier coup d'œil.
                    const ciAbsolue = foundGroups.some(g => /CONTRE-?INDICATION ABSOLUE|CI ABSOLUE/i.test((g.classe || '') + ' ' + (g.commentaire || '')));
                    const alertClass = (isDanger || ciAbsolue) ? 'alert-danger' : 'alert-warning';
                    const icon = ciAbsolue ? '🚫' : (isDanger ? '🚨' : '⚠️');
                    const titreInteract = ciAbsolue
                        ? `CI ABSOLUE — ${escapeHtml(ref.dci.toUpperCase())}`
                        : `Co-prescription à risque : ${escapeHtml(ref.dci.toUpperCase())}`;
                    addAlert('alertes-interact', `<div class="alert ${alertClass} shadow-sm"><strong>${icon} ${titreInteract}</strong><ul class="mb-0 mt-1">${groupHtml}</ul></div>`, 'interact');
                    const flatList = foundGroups.map(g => `${g.classe}:${g.matched.map(x=>x.interactor).join('/')}`).join(' | ');
                    _regAddMed(m.dci, 'interact', { text: `Interaction ${flatList}`, severity: isDanger ? 'danger' : 'warning' });
                    // Émettre aussi UNE ligne par groupe danger dans byDomain pour
                    // que la Synthèse puisse résumer les interactions critiques.
                    foundGroups.forEach(g => {
                        if (g.severite !== 'danger') return;
                        const targets = g.matched.map(x => x.interactor.toUpperCase()).join(', ');
                        _regAddDomain('interact', {
                            text: `${ref.dci.toUpperCase()} ↔ ${targets} — ${g.classe}`,
                            severity: 'danger'
                        });
                    });
                }
                return; // v2 traité : on ne retombe pas sur le chemin texte libre pour cette entrée
            }

            // ------ Fallback : schéma texte libre (ddi_interact) ------
            if(ref.ddi_interact && ref.ddi_interact !== "Aucune majeure documentee" && ref.ddi_interact !== "nan") {
                let interactors = ref.ddi_interact.split(/[,\/]/).map(x=>x.trim()).filter(x=>x.length > 2);
                let found = [];
                const selfKey = sanitizeText(ref.dci || '');
                interactors.forEach(inter => {
                    let cInter = sanitizeText(inter);
                    if (!cInter) return;
                    // Self-match guard : ne pas flagger le médicament contre sa propre dci
                    if (selfKey && (selfKey.includes(cInter) || cInter.includes(selfKey))) return;
                    // Chercher uniquement parmi les AUTRES médicaments (exclure la source)
                    const hasOther = activeMeds.some(am => {
                        if (am === m) return false;
                        const amDci = sanitizeText(am.dci);
                        const amClasse = sanitizeText(am.classe);
                        if (amDci.includes(cInter) || amClasse.includes(cInter)) return true;
                        return (typeof matchesDrugClass === 'function') && matchesDrugClass(amDci, amClasse, cInter);
                    });
                    if (hasOther) found.push(inter);
                });
                if(found.length > 0) {
                    addAlert('alertes-interact', `<div class="alert alert-danger shadow-sm"><strong>🚨 Co-prescription à risque : ${escapeHtml(ref.dci.toUpperCase())}</strong><br>Interaction détectée avec : <b>${found.map(f => escapeHtml(f)).join(', ')}</b></div>`, 'interact');
                    _regAddMed(m.dci, 'interact', { text: `Interaction avec ${found.join(', ')}`, severity: 'danger' });
                    _regAddDomain('interact', {
                        text: `${ref.dci.toUpperCase()} ↔ ${found.join(', ').toUpperCase()}`,
                        severity: 'danger'
                    });
                }
            }
        });

        let groupedAnsm = {}; let groupedAuc = {};

        // --- Pré-indexation DDI_GENERAL_DB (ANSM + BNF/Micromedex fusionnées) ---
        let ddiGeneralDb = typeof DDI_GENERAL_DB !== 'undefined' && Array.isArray(DDI_GENERAL_DB) ? DDI_GENERAL_DB : null;
        let ddiGeneralIndex = new Map(); // medKey -> [{idx, side:'t1'|'t2'}]
        if (ddiGeneralDb) {
            activeMeds.forEach(med => {
                let key = sanitizeText(med.dci);
                let hits = [];
                ddiGeneralDb.forEach((d, idx) => {
                    if (medMatchesAnsmTerm(med, d.d1 || "")) hits.push({idx, side:'t1'});
                    if (medMatchesAnsmTerm(med, d.d2 || "")) hits.push({idx, side:'t2'});
                });
                ddiGeneralIndex.set(key, hits);
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

                // DDI_GENERAL_DB (ANSM + BNF/Micromedex) — utilise l'index pré-calculé
                if (ddiGeneralDb) {
                    let hitsA = ddiGeneralIndex.get(dciA) || [];
                    let hitsB = ddiGeneralIndex.get(dciB) || [];
                    let bByIdx = new Map();
                    hitsB.forEach(h => { if(!bByIdx.has(h.idx)) bByIdx.set(h.idx, new Set()); bByIdx.get(h.idx).add(h.side); });
                    hitsA.forEach(hA => {
                        let bSides = bByIdx.get(hA.idx);
                        if (!bSides) return;
                        let crossMatch = (hA.side === 't1' && bSides.has('t2')) || (hA.side === 't2' && bSides.has('t1'));
                        if (!crossMatch) return;
                        let d = ddiGeneralDb[hA.idx];
                        if(!groupedAnsm[pairName]) groupedAnsm[pairName] = { isDanger: false, raw: [] };
                        // Exploiter toutes les sources de la paire fusionnée
                        (d.details || []).forEach(detail => {
                            let niveau = String(detail.level || "Interaction").toUpperCase();
                            let desc = String(detail.desc || "");
                            let src = detail.source || 'ANSM';
                            let isDanger = niveau.includes("CONTRE-INDICATION") || niveau.includes("DECONSEILLE") || niveau.includes("MAJEUR");
                            if(isDanger) groupedAnsm[pairName].isDanger = true;
                            if(!groupedAnsm[pairName].raw.some(ex => ex.source === src && ex.desc.toLowerCase() === desc.toLowerCase())) {
                                groupedAnsm[pairName].raw.push({ level: niveau, desc: desc, isDanger: isDanger, source: src });
                            }
                        });
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
            let allSources = [...new Set(data.raw.map(x => x.source))];
            let sourceLabel = allSources.join(' + ');
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
            // Child-Pugh per-med hepatic adaptation
            if (typeof CHILD_PUGH_ADAPTATIONS !== 'undefined' && cpClass) {
                let cpKey = ref.dci.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                let cpAdapt = CHILD_PUGH_ADAPTATIONS[cpKey];
                if (!cpAdapt) { for (let k of Object.keys(CHILD_PUGH_ADAPTATIONS)) { if (cpKey.includes(k) || k.includes(cpKey)) { cpAdapt = CHILD_PUGH_ADAPTATIONS[k]; break; } } }
                if (cpAdapt && cpAdapt[cpClass]) {
                    let cpInfo = cpAdapt[cpClass];
                    let cpMedColor = cpInfo.ci ? 'danger' : (cpInfo.reduire ? 'warning' : 'info');
                    html += `<span class="text-${cpMedColor} small d-block border-top pt-1 mt-1 border-success border-opacity-25"><em>🫁 Hépatique (Child-Pugh ${cpClass}) :</em> <b>${cpInfo.msg}</b>${cpAdapt.src ? ` <small class="text-muted">[${cpAdapt.src}]</small>` : ''}</span>`;
                }
            }
            html += `</div>`;
            addAlert('alertes-usage', html, 'usage');
            // Registre: adaptation posologique
            let usageDetails = [];
            if (ref.poso_ger) usageDetails.push('Dose gériatrique');
            if (ref.poso_ren && dfg > 0 && dfg < 60) usageDetails.push('Adaptation rénale');
            if (alb >= 85) usageDetails.push('Forte liaison albumine');
            if (typeof CHILD_PUGH_ADAPTATIONS !== 'undefined' && cpClass) {
                let cpKey2 = ref.dci.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                let cpA2 = CHILD_PUGH_ADAPTATIONS[cpKey2];
                if (!cpA2) { for (let k of Object.keys(CHILD_PUGH_ADAPTATIONS)) { if (cpKey2.includes(k) || k.includes(cpKey2)) { cpA2 = CHILD_PUGH_ADAPTATIONS[k]; break; } } }
                if (cpA2 && cpA2[cpClass]) usageDetails.push(`Hépatique CP-${cpClass}`);
            }
            if (usageDetails.length) _regAddMed(m.dci, 'usage', { text: usageDetails.join(', '), severity: 'info' });
        }

        // Collecter bio_cible pour suivi unifié (per-drug)
        if (Array.isArray(ref.bio_cible)) {
            ref.bio_cible.forEach(bioId => {
                if (!_registry._bioPlan) _registry._bioPlan = {};
                if (!_registry._bioPlan[bioId]) _registry._bioPlan[bioId] = { meds: [], pathos: [], freqs: [], sources: [], freqByOrigin: {} };
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
    // 5b. SUIVI BIOLOGIQUE — Collecte des données + rendu dual-mode
    // =========================================================
    {
        // Initialiser le plan bio unifié
        const bioPlan = _registry._bioPlan || {};

        // Source 2: PATHO_BIO_MONITOR (via getRequiredBioMonitoring)
        if (typeof getRequiredBioMonitoring === 'function' && activeComorbs.length > 0) {
            try {
                const bioMonitors = getRequiredBioMonitoring(activeComorbs);
                for (const [bioId, data] of Object.entries(bioMonitors)) {
                    if (!bioPlan[bioId]) bioPlan[bioId] = { meds: [], pathos: [], freqs: [], sources: [], freqByOrigin: {} };
                    data.pathos.forEach((p, i) => {
                        let patName = MASTER_DB.PATHOLOGIES[p]?.NOM_STANDARD || p;
                        if (!bioPlan[bioId].pathos.includes(patName)) bioPlan[bioId].pathos.push(patName);
                        let freq = data.frequences[i] || data.frequences[0] || '';
                        if (freq && !bioPlan[bioId].freqs.includes(freq)) bioPlan[bioId].freqs.push(freq);
                        if (freq) bioPlan[bioId].freqByOrigin[patName] = freq;
                        let src = data.sources[i] || data.sources[0] || '';
                        if (src && !bioPlan[bioId].sources.includes(src)) bioPlan[bioId].sources.push(src);
                    });
                }
            } catch(e) { console.error("Erreur BioMonitor:", e); }
        }

        // Source 3: SURVEILLANCE_CIBLE + BIOLOGIE.REGLES from PATHOLOGY_RULES_DB
        if (typeof PATHOLOGY_RULES_DB !== 'undefined') {
            activeComorbs.forEach(patId => {
                const rule = PATHOLOGY_RULES_DB[patId];
                if (!rule || !rule.BIOLOGIE) return;
                let patName = rule.NOM || patId;
                (rule.BIOLOGIE.SURVEILLANCE_CIBLE || []).forEach(bioId => {
                    if (!bioPlan[bioId]) bioPlan[bioId] = { meds: [], pathos: [], freqs: [], sources: [], freqByOrigin: {} };
                    if (!bioPlan[bioId].pathos.includes(patName)) bioPlan[bioId].pathos.push(patName);
                });
                // Fréquences explicites définies dans BIOLOGIE.REGLES (ex: ECG annuel démence)
                (rule.BIOLOGIE.REGLES || []).forEach(r => {
                    if (!r || !r.bio || !r.frequence) return;
                    if (!bioPlan[r.bio]) bioPlan[r.bio] = { meds: [], pathos: [], freqs: [], sources: [], freqByOrigin: {} };
                    if (!bioPlan[r.bio].pathos.includes(patName)) bioPlan[r.bio].pathos.push(patName);
                    if (!bioPlan[r.bio].freqs.includes(r.frequence)) bioPlan[r.bio].freqs.push(r.frequence);
                    bioPlan[r.bio].freqByOrigin[patName] = r.frequence;
                });
            });
        }

        // Enrichir freqByOrigin pour les médicaments
        for (const [bioId, entry] of Object.entries(bioPlan)) {
            entry.meds.forEach(medDci => {
                if (!entry.freqByOrigin[medDci]) {
                    // Chercher la fréquence dans le suivi_periodique du médicament
                    const med = activeMeds.find(m => m.dci === medDci);
                    if (med && med.db_ref && med.db_ref.suivi_periodique) {
                        entry.freqByOrigin[medDci] = _extractFreqForBio(med.db_ref.suivi_periodique, bioId);
                    }
                }
            });
        }

        // ── FALLBACK : fréquences par défaut (pratique gériatrique standard) ──
        //   Appliqué uniquement si AUCUNE fréquence n'a été renseignée par le
        //   pathology rules, le médicament, ou le bio monitor. Conservateur.
        //   Référence : HAS bilan gériatrique, pratique de médecine interne du sujet âgé.
        const _DEFAULT_BIO_FREQ = {
            'BIO_001': 'Semestriel (trimestriel si diurétique/IEC/ARM)',
            'BIO_002': 'Semestriel (trimestriel si ISRS/thiazide)',
            'BIO_003': 'Semestriel',
            'BIO_004': 'Semestriel',
            'BIO_005': 'Annuel',
            'BIO_006': 'Annuel (selon contexte : IPP, diurétique)',
            'BIO_007': 'Semestriel si IC ou IR',
            'BIO_008': 'Annuel (si goutte ou diurétique)',
            'BIO_009': 'Annuel (NFS)',
            'BIO_010': 'Annuel (NFS)',
            'BIO_011': 'Annuel (NFS)',
            'BIO_012': 'Annuel (NFS)',
            'BIO_013': 'Annuel',
            'BIO_014': 'Annuel',
            'BIO_015': 'Annuel',
            'BIO_016': 'Annuel',
            'BIO_017': 'Annuel',
            'BIO_018': 'À l\'introduction statine/fibrate, puis à la demande',
            'BIO_019': 'Annuel',
            'BIO_020': 'Annuel',
            'BIO_021': 'Annuel',
            'BIO_022': 'Annuel',
            'BIO_023': 'Annuel',
            'BIO_024': 'À la demande (pas de surveillance systématique)',
            'BIO_025': 'Annuel (ou selon suivi diabète)',
            'BIO_026': 'Semestriel (diabète)',
            'BIO_027_LDL': 'Annuel',
            'BIO_027_TG': 'Annuel',
            'BIO_028': 'Semestriel (IC)',
            'BIO_029': 'Trimestriel sous lithium',
            'BIO_030': 'Mensuel sous AVK (ou selon stabilité)',
            'BIO_031': 'Annuel',
            'BIO_032': 'À la demande (marqueur aigu)',
            'BIO_033': 'À la demande',
            'BIO_034': 'À la demande (aigu)',
            'BIO_035': 'Annuel',
            'BIO_036': 'À la demande',
            'BIO_037': 'À la demande (aigu)',
            'BIO_038': 'À la demande (bilan anémie)',
            'BIO_039': 'Annuel (NFS)',
            'BIO_040': 'Annuel (mensuel si AVK)',
            'BIO_041': 'Semestriel (ionogramme)',
            'BIO_042': 'À la demande (dysnatrémie)',
            'BIO_043': 'À la demande (bilan nutritionnel)',
            'BIO_CST': 'Annuel',
            'BIO_PHOS': 'Annuel',
            'BIO_TEMP': 'À la demande',
            'BIO_T4': 'Selon TSH',
            'BIO_T3': 'Selon TSH',
            'BIO_TP': 'Annuel (mensuel si AVK)',
            'BIO_CL': 'Semestriel (ionogramme)',
            'BIO_OSM': 'À la demande',
            'BIO_PREALB': 'À la demande (nutrition)'
        };
        for (const [bioId, entry] of Object.entries(bioPlan)) {
            if (entry.freqs.length === 0 && _DEFAULT_BIO_FREQ[bioId]) {
                entry.freqs.push(_DEFAULT_BIO_FREQ[bioId]);
                entry.freqByOrigin['Défaut gériatrique'] = _DEFAULT_BIO_FREQ[bioId];
            }
        }

        // Collecter les données suivi per-médicament (pour le mode "par médicament")
        const suiviPerMed = [];
        activeMeds.forEach(m => {
            let ref = m.db_ref; if (!ref) return;
            let hasSuivi = ref.suivi_initial || ref.suivi_periodique || ref.alerte_clinique || (Array.isArray(ref.bio_cible) && ref.bio_cible.length > 0);
            if (!hasSuivi) return;
            suiviPerMed.push({
                dci: ref.dci,
                initial: ref.suivi_initial || '',
                periodique: ref.suivi_periodique || '',
                alerte: ref.alerte_clinique || '',
                bioCibles: (ref.bio_cible || []).map(id => {
                    let name = (MASTER_DB.BIOLOGIE && MASTER_DB.BIOLOGIE[id]) ? MASTER_DB.BIOLOGIE[id].NOM_STANDARD : id;
                    let val = bioValues[id];
                    return { id, name, val };
                })
            });
        });

        // Stocker dans le registre pour re-rendu dynamique
        _registry.bioPlan = bioPlan;
        _registry.suiviPerMed = suiviPerMed;
        _registry.bioValues = bioValues;

        // Afficher le toggle si des données existent
        const bioIds = Object.keys(bioPlan);
        if (bioIds.length > 0 || suiviPerMed.length > 0) {
            const toggleEl = document.getElementById('suivi-mode-toggle');
            if (toggleEl) toggleEl.style.display = '';
        }

        // Rendu initial (mode par défaut = tableau croisé)
        const currentMode = document.querySelector('input[name="suiviMode"]:checked');
        _renderSuiviBio(bioPlan, suiviPerMed, bioValues, currentMode ? currentMode.value : 'croix', addAlert, counts);
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
                <div class="card-header ga-card-header-recos">
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

            // CONTROLE_FREQUENCE (ex: FA — bêtabloquants, diltiazem, digoxine)
            const cFreq = rule.TRAITEMENTS.CONTROLE_FREQUENCE;
            if (cFreq) {
                guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-success small">CONTRÔLE DE LA FRÉQUENCE</strong></div>`;
                const pl = Array.isArray(cFreq.premiere_ligne) ? cFreq.premiere_ligne.join(', ') : (cFreq.premiere_ligne || '');
                guidelinesHtml += `<div class="alert alert-success py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #198754;">
                    ${pl ? `<strong class="small">1re ligne :</strong> <small>${pl}</small>` : ''}
                    ${cFreq.cible_fc ? `<br><small><strong>Cible FC :</strong> ${cFreq.cible_fc}</small>` : ''}
                    ${cFreq.cible_fc_strict ? `<br><small><strong>Cible stricte :</strong> ${cFreq.cible_fc_strict}</small>` : ''}
                    ${Array.isArray(cFreq.notes) ? `<ul class="ps-3 mb-0 mt-1">${cFreq.notes.map(n => `<li class="small text-muted">${n}</li>`).join('')}</ul>` : ''}
                </div>`;
            }

            // CONTROLE_RYTHME (ex: FA — antiarythmiques)
            const cRyt = rule.TRAITEMENTS.CONTROLE_RYTHME;
            if (cRyt && Array.isArray(cRyt.antiarythmiques) && cRyt.antiarythmiques.length > 0) {
                guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-info small">CONTRÔLE DU RYTHME (antiarythmiques)</strong></div>`;
                cRyt.antiarythmiques.forEach(a => {
                    guidelinesHtml += `<div class="alert alert-info py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #0dcaf0;">
                        <strong class="small">${a.dci || ''}</strong>
                        ${a.indication ? `<br><small>${a.indication}</small>` : ''}
                        ${a.note ? `<br><small class="text-muted fst-italic">${a.note}</small>` : ''}
                        ${a.ci ? `<br><small class="text-danger">CI : ${a.ci}</small>` : ''}
                    </div>`;
                });
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
                    // alert-light : ne pas compter dans le badge du tab Guidelines
                    // (updateTabCounters exclut .alert-light). Cf. user : les "à éviter"
                    // ne sont PAS prescrits chez ce patient — simple information de principe.
                    eviterItems += `<div class="alert alert-light py-1 px-2 mb-1" style="border-left:3px solid #adb5bd;">
                        <strong class="small text-muted">${trt.classe || ''}</strong>
                        ${trt.gravite ? ` <span class="badge bg-light text-muted border" style="font-size:0.6em;">${trt.gravite}</span>` : ''}
                        ${srcEbm ? ` <span class="badge bg-light text-muted border float-end" style="font-size:0.6em;" title="${srcEbm}">${srcEbm.length > 40 ? srcEbm.substring(0,40)+'...' : srcEbm}</span>` : ''}
                        ${!srcEbm && trt.ref_stopp ? ` <span class="badge bg-light text-muted border float-end me-1" style="font-size:0.6em;">${trt.ref_stopp}</span>` : ''}
                        ${trt.raison ? `<br><small class="text-muted">${trt.raison}</small>` : ''}
                        ${trt.condition ? `<br><small class="text-muted fst-italic">${trt.condition}</small>` : ''}
                    </div>`;
                    }
                });
                guidelinesHtml += `<details class="mb-2 mt-2"><summary class="text-muted small fw-bold" style="cursor:pointer;">À éviter en cas de prescription future (${eviter.length}) — information de principe</summary><div class="mt-1">${eviterItems}</div></details>`;
            }

            // Helper : ne proposer une déprescription que si le patient prend
            // réellement un médicament de la classe visée.
            const _activeMedsHasClass = (classLabel) => {
                if (!classLabel || typeof activeMeds === 'undefined' || activeMeds.length === 0) return false;
                // Extraire le mot-clé principal : ignorer parenthèses, conditions
                // ("si ...", "> 8 semaines", "(ACB ≥ 3)") pour ne garder que
                // la classe thérapeutique.
                const core = String(classLabel)
                    .split('(')[0]
                    .split(/\s+si\s+/i)[0]
                    .split(/\s+>\s*/)[0]
                    .split(/\s+\d/)[0]
                    .trim();
                const key = (typeof sanitizeText === 'function') ? sanitizeText(core) : core.toLowerCase();
                if (!key || key.length < 3) return false;
                return activeMeds.some(m => {
                    const dci = (typeof sanitizeText === 'function') ? sanitizeText(m.dci || '') : (m.dci || '').toLowerCase();
                    const cls = (typeof sanitizeText === 'function') ? sanitizeText(m.classe || '') : (m.classe || '').toLowerCase();
                    if (typeof matchesDrugClassAnsm === 'function') return matchesDrugClassAnsm(dci, cls, key);
                    if (typeof matchesDrugClass === 'function') return matchesDrugClass(dci, cls, key);
                    return dci.includes(key) || cls.includes(key) || key.includes(cls);
                });
            };

            // DEPRESCRIPTION (soins palliatifs, fragilité)
            // On filtre par activeMeds pour ne pas proposer de déprescrire
            // un médicament que le patient ne prend pas (bug #3).
            const deprescription = rule.TRAITEMENTS.DEPRESCRIPTION;
            if (deprescription) {
                if (deprescription.a_arreter_systematiquement) {
                    const aArr = deprescription.a_arreter_systematiquement.filter(d => _activeMedsHasClass(d.classe));
                    if (aArr.length > 0) {
                        guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-warning small">DEPRESCRIPTION</strong></div>`;
                        aArr.forEach(d => {
                            guidelinesHtml += `<div class="alert alert-warning py-1 px-2 mb-1" style="border-left:3px solid #ffc107;">
                                <strong class="small">${d.classe || ''}</strong>${d.raison ? `<br><small>${d.raison}</small>` : ''}
                            </div>`;
                        });
                    }
                }
                if (deprescription.a_conserver) {
                    guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-success small">A CONSERVER / OPTIONS UTILES</strong></div>`;
                    deprescription.a_conserver.forEach(d => {
                        const onBoard = _activeMedsHasClass(d.classe);
                        const badge = onBoard ? ' <span class="badge bg-success" style="font-size:0.6em;">en cours</span>' : ' <span class="badge bg-light text-muted border" style="font-size:0.6em;">option à envisager</span>';
                        guidelinesHtml += `<div class="alert alert-success py-1 px-2 mb-1" style="border-left:3px solid #198754;">
                            <strong class="small">${d.classe || ''}</strong>${badge}${d.indication ? `<br><small>${d.indication}</small>` : ''}
                        </div>`;
                    });
                }
            }

            // DEPRESCRIPTION_CIBLES (fragilité) — filtrer par activeMeds
            const depCibles = rule.TRAITEMENTS.DEPRESCRIPTION_CIBLES;
            if (depCibles) {
                const depFilt = depCibles.filter(d => _activeMedsHasClass(d.classe));
                if (depFilt.length > 0) {
                    guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-warning small">CIBLES DE DEPRESCRIPTION</strong></div>`;
                    depFilt.forEach(d => {
                        guidelinesHtml += `<div class="alert alert-warning py-1 px-2 mb-1" style="border-left:3px solid #ffc107;">
                            <strong class="small">${d.classe || ''}</strong>
                            ${d.ref ? ` <span class="badge bg-secondary float-end" style="font-size:0.6em;">${d.ref}</span>` : ''}
                            ${d.action ? `<br><small>${d.action}</small>` : ''}
                        </div>`;
                    });
                }
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

            // PRINCIPES (notes générales, ex: KC)
            const principes = rule.TRAITEMENTS.PRINCIPES;
            if (principes && principes.length > 0) {
                principes.forEach(p => {
                    if (p.note) guidelinesHtml += `<div class="alert alert-light py-1 px-2 mb-1 border"><small class="text-muted fst-italic">${p.note}</small></div>`;
                });
            }

            // SURVEILLANCE_TOXICITE (ex: KC tumeur solide — protocoles de surveillance par classe)
            const survTox = rule.TRAITEMENTS.SURVEILLANCE_TOXICITE;
            if (survTox && survTox.length > 0) {
                guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-info small">SURVEILLANCE DES TOXICITES</strong></div>`;
                survTox.forEach(st => {
                    let bioList = (st.bio || []).map(b => {
                        let name = (MASTER_DB.BIOLOGIE && MASTER_DB.BIOLOGIE[b]) ? MASTER_DB.BIOLOGIE[b].NOM_STANDARD : b;
                        return name;
                    }).join(', ');
                    guidelinesHtml += `<div class="alert alert-info py-1 px-2 mb-1 shadow-sm" style="border-left:3px solid #0dcaf0;">
                        <strong class="small">${st.classe || ''}</strong>
                        ${st.risque ? `<br><small class="text-danger">${st.risque}</small>` : ''}
                        ${st.schema ? `<br><small>${st.schema}</small>` : ''}
                        ${bioList ? `<br><small class="text-muted">Bio : ${bioList}</small>` : ''}
                        ${st.conduite ? `<br><small class="text-info fw-bold">${st.conduite}</small>` : ''}
                        ${st.conduite_neutropenie_febrile ? `<br><small class="text-danger fw-bold">${st.conduite_neutropenie_febrile}</small>` : ''}
                        ${st.conduite_grade3 ? `<br><small class="text-warning fw-bold">${st.conduite_grade3}</small>` : ''}
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
    // 🧠 SYNTHÈSE — version recentrée (v0.53)
    //   Contenu ciblé :
    //    1. Médicaments à AJOUTER (omissions INITIER)
    //    2. Médicaments à RETIRER / SUBSTITUER (CI, PIM, doublons)
    //    3. Problèmes biologiques (anomalies détectées)
    //   L'utilisateur ne souhaite PAS voir ici :
    //    - la vue transversale par médicament
    //    - le schéma de surveillance bio (déjà dans onglet Suivi)
    //    - les indicateurs chiffrés (déjà dans les badges d'onglets)
    // =========================================================
    {
        let synthHtml = '';

        // ── 1. MÉDICAMENTS À AJOUTER ──
        const toAdd = (_registry.byDomain.initier || []).map(a => ({
            titre: a.titre || '',
            message: a.message || '',
            alternatives: a.alternatives || '',
            source: a.sources_label || ''
        }));

        // ── 2. MÉDICAMENTS À RETIRER / SUBSTITUER ──
        //    (CI, PIM, doublons — classés par gravité)
        const toRemove = [];
        for (const [dci, domains] of Object.entries(_registry.byMed)) {
            if (!domains.eviter) continue;
            domains.eviter.forEach(e => {
                let isCI = e.gravite && (String(e.gravite).includes('CONTRE-INDICATION') || String(e.gravite).includes('ABSOLUE'));
                toRemove.push({
                    dci: dci,
                    action: isCI ? 'ARRÊTER' : 'SUBSTITUER / RÉÉVALUER',
                    severity: isCI ? 'danger' : 'warning',
                    priority: isCI ? 1 : 2,
                    reason: e.text || '',
                    source: e.source || ''
                });
            });
        }
        toRemove.sort((a, b) => a.priority - b.priority);
        // Dédupliquer par (dci + raison) — évite Spironolactone × 2 quand 2 règles génèrent
        // une alerte identique (ex: doublon thiazidique + doublon anse sur même méd).
        {
            const seen = new Set();
            const filtered = [];
            for (const r of toRemove) {
                const k = `${(r.dci || '').toLowerCase()}::${(r.reason || '').slice(0, 80).toLowerCase()}`;
                if (seen.has(k)) continue;
                seen.add(k);
                filtered.push(r);
            }
            toRemove.length = 0;
            toRemove.push(...filtered);
        }

        // ── 3. PROBLÈMES BIOLOGIQUES ──
        //    On récupère les alertes de l'onglet Bio (SYND_xxx déclenchés)
        const bioIssues = (_registry.byDomain.bio || []).map(a => ({
            titre: a.titre || a.text || '',
            message: a.message || '',
            severity: a.severity || 'warning'
        }));

        // ── 4. INTERACTIONS CRITIQUES (danger seulement, dédupliquées) ──
        //    L'utilisateur consulte d'abord la Synthèse → doit voir les interactions
        //    danger sans aller sur l'onglet dédié. Limite : top 8 par texte unique.
        const interactCritical = [];
        {
            const seenSig = new Set();
            (_registry.byDomain.interact || []).forEach(a => {
                if (a.severity !== 'danger') return;
                const sig = (a.text || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 200);
                if (seenSig.has(sig)) return;
                seenSig.add(sig);
                interactCritical.push({ text: a.text || '', severity: a.severity });
                if (interactCritical.length >= 8) return;
            });
        }

        // ── Rendu ──
        if (toAdd.length === 0 && toRemove.length === 0 && bioIssues.length === 0 && interactCritical.length === 0) {
            synthHtml = '<div class="alert alert-success shadow-sm"><strong>✅ Aucune action majeure identifiée</strong><br><small>Aucune omission, aucune prescription inappropriée, aucune anomalie biologique significative.</small></div>';
        } else {

            // Section 1 : à AJOUTER
            if (toAdd.length > 0) {
                synthHtml += `<div class="card mb-3 shadow-sm"><div class="card-header py-2" style="background:linear-gradient(135deg,#d1e7dd,#a3cfbb);color:#0f5132;">
                    <strong>➕ Médicaments à ajouter (${toAdd.length})</strong>
                    <span class="small ms-2" style="opacity:0.85;">Omissions thérapeutiques identifiées</span>
                </div><div class="card-body p-2">`;
                toAdd.forEach(a => {
                    synthHtml += `<div class="border-start border-success border-3 ps-2 py-1 mb-2">
                        <strong class="small">${escapeHtml(a.titre)}</strong>
                        ${a.source ? ` <span class="badge bg-light text-muted border float-end" style="font-size:0.6em;">${escapeHtml(a.source)}</span>` : ''}
                        ${a.message ? `<br><span class="small">${escapeHtml(a.message)}</span>` : ''}
                        ${a.alternatives ? `<br><em class="text-success small">Exemples : ${escapeHtml(a.alternatives)}</em>` : ''}
                    </div>`;
                });
                synthHtml += `</div></div>`;
            }

            // Section 2 : à RETIRER / SUBSTITUER
            if (toRemove.length > 0) {
                synthHtml += `<div class="card mb-3 shadow-sm"><div class="card-header py-2" style="background:linear-gradient(135deg,#f8d7da,#f1aeb5);color:#58151c;">
                    <strong>➖ Médicaments à retirer ou substituer (${toRemove.length})</strong>
                    <span class="small ms-2" style="opacity:0.85;">Prescriptions inappropriées identifiées</span>
                </div><div class="card-body p-2">`;
                toRemove.forEach(a => {
                    synthHtml += `<div class="border-start border-${a.severity} border-3 ps-2 py-1 mb-2">
                        <span class="badge bg-${a.severity} me-1" style="font-size:0.65em;">${a.action}</span>
                        <strong class="small">${escapeHtml(a.dci.toUpperCase())}</strong>
                        ${a.source ? ` <span class="badge bg-light text-muted border float-end" style="font-size:0.6em;">${escapeHtml(a.source)}</span>` : ''}
                        ${a.reason ? `<br><span class="small text-muted">${escapeHtml(a.reason)}</span>` : ''}
                    </div>`;
                });
                synthHtml += `</div></div>`;
            }

            // Section 3 : INTERACTIONS CRITIQUES (danger) — placée AVANT bio pour priorité visuelle
            if (interactCritical.length > 0) {
                synthHtml += `<div class="card mb-3 shadow-sm"><div class="card-header py-2" style="background:linear-gradient(135deg,#f8d7da,#f1aeb5);color:#58151c;">
                    <strong>🚨 Interactions critiques (${interactCritical.length})</strong>
                    <span class="small ms-2" style="opacity:0.85;">Co-prescriptions à risque danger — voir onglet Interactions</span>
                </div><div class="card-body p-2">`;
                interactCritical.forEach(it => {
                    synthHtml += `<div class="border-start border-danger border-3 ps-2 py-1 mb-2">
                        <span class="badge bg-danger me-1" style="font-size:0.65em;">DANGER</span>
                        <span class="small">${escapeHtml(it.text)}</span>
                    </div>`;
                });
                synthHtml += `</div></div>`;
            }

            // Section 4 : PROBLÈMES BIOLOGIQUES
            if (bioIssues.length > 0) {
                synthHtml += `<div class="card mb-3 shadow-sm"><div class="card-header py-2" style="background:linear-gradient(135deg,#fff3cd,#ffe69c);color:#664d03;">
                    <strong>🧪 Problèmes biologiques (${bioIssues.length})</strong>
                    <span class="small ms-2" style="opacity:0.85;">Anomalies à prendre en compte</span>
                </div><div class="card-body p-2">`;
                bioIssues.forEach(b => {
                    synthHtml += `<div class="border-start border-${b.severity} border-3 ps-2 py-1 mb-2">
                        <strong class="small">${escapeHtml(b.titre)}</strong>
                        ${b.message ? `<br><span class="small text-muted">${escapeHtml(b.message)}</span>` : ''}
                    </div>`;
                });
                synthHtml += `</div></div>`;
            }
        }

        // Commentaire libre (si renseigné)
        let freeText = (document.getElementById('freeTextNote') || {}).value || '';
        if (freeText.trim()) {
            synthHtml += `<div class="card mb-3 border-secondary"><div class="card-header py-2 bg-light">
                <strong>Commentaire clinique</strong>
            </div><div class="card-body p-2"><span class="small" style="white-space:pre-wrap;">${freeText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span></div></div>`;
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

    // Sauvegarder le résultat pour la memoization
    const divs_memo = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact', 'alertes-ansm', 'alertes-auc', 'alertes-bio', 'alertes-usage', 'alertes-suivi', 'alertes-guidelines', 'alertes-synthese'];
    _lastAnalysisResult = {};
    divs_memo.forEach(id => { const el = document.getElementById(id); if (el) _lastAnalysisResult[id] = el.innerHTML; });
    _lastAnalysisHash = hash;

    if (typeof GeriaLog !== 'undefined') GeriaLog.info(`Analyse terminée — ${activeMeds.length} médicaments, ${activeComorbs.length} comorbidités, ${counts.eviter} éviter, ${counts.initier} initier, ${counts.ansm} ANSM`);
}
