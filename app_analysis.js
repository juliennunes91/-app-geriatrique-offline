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
//  - SUP_START_* (21 règles, START3) : famille entière mal modélisée — chaque règle se
//    déclenche sur la PRÉSENCE du médicament (med_keys) au lieu de son absence, sans
//    condition clinique ; et toutes les règles « supplement » sont de toute façon
//    fusionnées dans le bucket « À ÉVITER » (cf. plus bas), à l'opposé d'une omission.
//    Elles restent donc toutes en quarantaine. Les 4 critères réellement convertibles
//    (comorbidité existante, pas de doublon) ont été RÉIMPLÉMENTÉS nativement dans
//    geria_recos_final.js (INITIER), correctement modélisés (med_absent + comorbs/bio) :
//      • SUP_START_007 → IN_B04 (bêtabloquant / coronaropathie symptomatique, PAT_004)
//      • SUP_START_020 → IN_D05 (ISRS-IRSNA / trouble anxieux généralisé, PAT_044)
//      • SUP_START_021 → IN_D06 (agoniste dopaminergique / SJSR, PAT_051)
//      • SUP_START_024 → IN_E03 (érythropoïèse / anémie MRC sévère, PAT_029 + DFG<30 + Hb<10)
//    Non convertibles : SUP_START_013 (doublon IN_C01) et _032 (doublon IN_G01) ;
//    _023 (pas de code bio phosphatémie) ; _038/_045 (comorbidités PAT_055/PAT_040
//    inexistantes) ; _022/_028/_046/_048 (aucune comorbidité modélisée) ; _029/_030/_033/
//    _039 (déclencheurs non structurés : antibiothérapie/H.pylori/hypoxémie/corticothérapie) ;
//    _040/_041 (états historiques post-arrêt) ; _047 (PAT_026 trop générique) ; _059
//    (vaccin universel). Réévaluables si l'app modélise ces états cliniques.
//  - Clés médicament malformées (mots collés / posologie embarquée / schéma non
//    détectable par DCI) rendant la règle morte OU sémantiquement cassée, ET dont
//    le concept est couvert par une règle native fonctionnelle, ou indétectable :
//      • SUP_STOP_003 (nifédipine forme immédiate) → doublon mort de EV_PRISC_01.
//      • SUP_STOP_009 (antiagrégant + anticoagulant) → clé collée exprimant une
//        combinaison ; concept couvert par EV_C02 / EV_C04 / SUP_PIMC_09.
//      • SUP_STOP_058 (patch lidocaïne pour arthrose) → indication non détectable
//        et en conflit avec IN_K03 (qui recommande le patch en douleur neuropathique).
//  - Règles mortes par médicament (audit « presenceDead ») couvertes par une règle
//    fonctionnelle, ou dont l'indication n'est pas détectable :
//      • SUP_STOP_076 (oxybutynine) → doublon de EV_PRISC_03 / SUP_STOP_042.
//      • SUP_STOP_077 (tianeptine)  → doublon de EV_SFGG_AD_06.
//      • SUP_STOP_080 (clonazepam)  → couvert par EV_D08 (BZD ≥ 4 sem).
//      • SUP_STOP_057 (opioïdes LP)  → couvert par EV_K07 / EV_L01 / EV_L02 ; la
//        spécificité « libération prolongée » n'est pas détectable par DCI.
//      • SUP_STOP_044 (duloxétine, STOPP3-I7 « pour incontinence ») → indication non
//        détectable ; raviver sur le DCI nu sur-déclencherait sur toute duloxétine.
//    Ravivés à l'inverse (vraie lacune, DCI en base, pas de doublon) : SUP_STOP_037
//    (→ indométacine, PIM AINS) et SUP_STOP_079 (→ dompéridone, risque QT établi).
//  - Médicaments ajoutés en base (estradiol, œstrogènes conjugués, testostérone,
//    somatropine, mégestrol, paraffine) → règles ravivées par correction de clé :
//    SUP_STOP_049 (œstrogène systémique), _054 (testostérone), _055 (somatropine),
//    _027 (mégestrol), SUP_EU7_07 (paraffine). Pour éviter d'empiler plusieurs alertes
//    sur le même médicament, les variantes œstrogènes redondantes ou à indication non
//    détectable restent en quarantaine : SUP_STOP_012 (ATCD MTEV — non détectable, +
//    doublon testostérone/œstrogène), _051 (œstro+progestatif — pas de médicament
//    combiné modélisé), _052 (sans progestatif / statut utérin — non détectable,
//    doublon de _049).
// Revue éditoriale fine (volume d'alertes par thème) → curation_supplement_review.csv.
const SUPPLEMENT_QUARANTINE = new Set([
    'SUP_CAUT_073', 'SUP_PIMC_08', 'SUP_STOP_078', 'SUP_STOP_043', 'SUP_STOP_050',
    // Clés malformées et/ou dose/forme non détectable.
    // (SUP_STOP_025 « fer oral fortes doses » a été RAVIVÉ après que l'extracteur
    // de texte libre injecte dose_fer_elevee dans le contexte clinique quand la
    // posologie extraite dépasse 600 mg/j — cf. text_extractor.js Tier 3.)
    // SUP_STOP_053 (insuline « sliding scale ») RAVIVÉ : insulines DCI ajoutées en base +
    // checkbox chkInsulineSlidingScale alimente le contexte_clinique "sliding_scale".
    'SUP_STOP_003', 'SUP_STOP_009', 'SUP_STOP_058',
    // Mortes par médicament : doublons de règles fonctionnelles, ou indication non détectable.
    'SUP_STOP_044', 'SUP_STOP_057', 'SUP_STOP_076', 'SUP_STOP_077', 'SUP_STOP_080',
    // Variantes œstrogènes redondantes / indication non détectable (cf. SUP_STOP_049 actif).
    'SUP_STOP_012', 'SUP_STOP_051', 'SUP_STOP_052',
    // Famille SUP_START_* (START3) — déclenchées sur présence, jamais sur absence.
    'SUP_START_007', 'SUP_START_013', 'SUP_START_020', 'SUP_START_021', 'SUP_START_022',
    'SUP_START_023', 'SUP_START_024', 'SUP_START_028', 'SUP_START_029', 'SUP_START_030',
    'SUP_START_032', 'SUP_START_033', 'SUP_START_038', 'SUP_START_039', 'SUP_START_040',
    'SUP_START_041', 'SUP_START_045', 'SUP_START_046', 'SUP_START_047', 'SUP_START_048',
    'SUP_START_059'
]);

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

/**
 * Convertit une digoxinémie en ng/mL (unité canonique interne, ESC).
 * 1 ng/mL = 1.28 nmol/L. Cible thérapeutique sujet âgé : 0.5-0.9 ng/mL (ESC 2021 IC).
 */
function _convertDigoxToNgMl(val, unit) {
    if (!val || val <= 0) return val;
    if (unit === 'nmol/L') return Math.round((val / 1.28) * 100) / 100;
    return val; // ng/mL par défaut (= µg/L)
}

/**
 * Convertit une vitamine D en ng/mL (unité canonique interne).
 * 1 ng/mL = 2.5 nmol/L. Seuil carence < 10, insuffisance < 30.
 */
function _convertVitDToNgMl(val, unit) {
    if (!val || val <= 0) return val;
    if (unit === 'nmol/L') return Math.round((val / 2.5) * 10) / 10;
    return val; // ng/mL par défaut
}

/** Construit le contexte patient (bioValues, comorbidités, checkboxes)
 *
 * IMPORTANT — convention bioValues = NaN si absent (pas 0).
 * Toute comparaison `bioValues['BIO_xxx'] OP seuil` avec NaN renvoie false.
 * Garantit STRUCTURELLEMENT qu'un seuil bas écrit sans le pattern défensif
 * historique `val > 0 &&` ne déclenche pas de faux positif silencieux.
 * Les calculs (DFG, scores ailleurs dans le code) continuent d'utiliser
 * getVal() qui retourne 0 — la propagation NaN ne traverse que bioValues.
 */
function _buildPatientContext(patientAge, sexe, isFragile) {
    const bioValues = {
        'BIO_001': getBioVal('patientK'), 'BIO_002': getBioVal('patientNa'), 'BIO_003': getBioVal('bioCreat'), 'BIO_004': getBioVal('patientDFG'),
        'BIO_005': getBioVal('bioCa'), 'BIO_006': getBioVal('bioMg'), 'BIO_007': getBioVal('bioUree'), 'BIO_008': getBioVal('bioUric'),
        'BIO_009': getBioVal('bioHb'), 'BIO_010': getBioVal('bioPlaq'), 'BIO_011': getBioVal('bioGb'), 'BIO_012': getBioVal('bioPnn'),
        'BIO_013': getBioVal('bioAsat'), 'BIO_014': getBioVal('bioAlat'), 'BIO_015': getBioVal('bioGgt'), 'BIO_016': getBioVal('bioPal'),
        'BIO_017': getBioVal('bioBili'), 'BIO_018': getBioVal('bioCpk'), 'BIO_019': getBioVal('bioTsh'),
        'BIO_020': getBioVal('bioFer'),
        'BIO_021': _convertB12ToPmol(getBioVal('bioB12'), _getUnit('bioB12Unit', 'pmol/L')),
        'BIO_022': _convertB9ToNmol(getBioVal('bioB9'), _getUnit('bioB9Unit', 'nmol/L')),
        'BIO_023': _convertVitDToNgMl(getBioVal('bioVitD'), _getUnit('bioVitDUnit', 'ng/mL')),
        'BIO_024': getBioVal('bioCrp'), 'BIO_025': getBioVal('bioGly'), 'BIO_026': getBioVal('bioHba1c'),
        'BIO_027_LDL': getBioVal('bioLdl'), 'BIO_027_TG': getBioVal('bioTg'),
        'BIO_028': getBioVal('bioBnp'), 'BIO_030': getBioVal('bioInr'), 'BIO_031': getBioVal('bioQtc'),
        'BIO_032': getBioVal('bioPct'), 'BIO_029': getBioVal('bioLithium'),
        'BIO_033': getBioVal('bioDdim'), 'BIO_034': getBioVal('bioTropo'), 'BIO_036': getBioVal('bioLipase'),
        'BIO_035': getBioVal('bioAlbumSg'), 'BIO_037': getBioVal('bioLact'),
        'BIO_027_HDL': getBioVal('bioHdl'),
        'BIO_038': getBioVal('bioRetic'),
        'BIO_039': getBioVal('bioVgm'),
        'BIO_040': getBioVal('bioTp'),
        'BIO_041': getBioVal('bioChlore'),
        'BIO_042': getBioVal('bioOsm'),
        'BIO_043': getBioVal('bioPrealb'),
        'BIO_044': _convertDigoxToNgMl(getBioVal('bioDigox'), _getUnit('bioDigoxUnit', 'ng/mL')),
        'BIO_045': getBioVal('bioTca'),
        'BIO_046': getBioVal('bioAlbuminurie'),
        // Alias non-canoniques (pas d'ID dans la base) : conservés sous préfixe BIO_
        'BIO_CST': getBioVal('bioCst'), 'BIO_PHOS': getBioVal('bioPhos'),
        'BIO_TEMP': getBioVal('bioTemp'),
        'BIO_T4': getBioVal('bioT4'), 'BIO_T3': getBioVal('bioT3')
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
        'chkSaos': 'PAT_052',
        // Maladie psychiatrique primaire CHRONIQUE (antérieure à 65 ans) — Bloc 1
        'chkSchizoChronique': 'PAT_055',
        'chkSchizoAffectif': 'PAT_056',
        'chkTroubleDelirant': 'PAT_057',
        'chkBipolaireI': 'PAT_058',
        'chkBipolaireII': 'PAT_059',
        'chkDepressionRecurrente': 'PAT_060',
        'chkDysthymie': 'PAT_061',
        'chkTOC': 'PAT_062',
        'chkTroublePanique': 'PAT_063',
        'chkTAGChronique': 'PAT_064',
        'chkESPT': 'PAT_065',
        'chkTroublePersonnalite': 'PAT_066',
        'chkUsageAlcool': 'PAT_067',
        'chkUsageSubstances': 'PAT_068',
        'chkTSADI': 'PAT_069'
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
    if(isChecked('chkArthrose')) ctxClinique.push("arthrose");
    if(isChecked('chkChutes')) ctxClinique.push("chutes");
    if(isChecked('chkInstitution')) ctxClinique.push("institution");
    if(isChecked('chkConfine')) ctxClinique.push("confinement");
    if(isFragile) ctxClinique.push("fragilite");
    if(isChecked('chkAnorexie') || (getVal('patientBmi') > 0 && getVal('patientBmi') < 18.5)) ctxClinique.push("denutrition");
    if(isChecked('chkGlaucome')) ctxClinique.push("glaucome");
    if(isChecked('chkPalliatif')) ctxClinique.push("palliatif", "esperance_vie_reduite", "stoppfrail");
    if(isChecked('chkAtcdUlcere')) ctxClinique.push("atcd_ulcere", "atcd_hemorragie_digestive");
    if(isChecked('chkAspirineForte')) ctxClinique.push("dose_aspirine_elevee");
    if(isChecked('chkInsulineSlidingScale')) ctxClinique.push("sliding_scale");
    if(getVal('bioAlbumSg') > 0 && getVal('bioAlbumSg') < 30) ctxClinique.push("denutrition_severe");
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

    // ── Maladie psychiatrique primaire CHRONIQUE (antérieure à 65 ans) — Bloc 1 ──
    // Ces contextes pilotent la recontextualisation des PIM psychotropes (Bloc 2) :
    //   psychose_chronique        → antipsychotiques = traitement de fond (≠ PIM à arrêter)
    //   trouble_thymique_chronique → lithium / thymorégulateurs = traitement de fond
    // psychiatrie_primaire_chronique = drapeau-parapluie (bandeau de synthèse).
    if(isChecked('chkSchizoChronique'))     ctxClinique.push("schizophrenie", "psychose_chronique", "psychiatrie_primaire_chronique");
    if(isChecked('chkSchizoAffectif'))      ctxClinique.push("trouble_schizoaffectif", "psychose_chronique", "trouble_thymique_chronique", "psychiatrie_primaire_chronique");
    if(isChecked('chkTroubleDelirant'))     ctxClinique.push("trouble_delirant", "psychose_chronique", "psychiatrie_primaire_chronique");
    if(isChecked('chkBipolaireI'))          ctxClinique.push("trouble_bipolaire", "trouble_thymique_chronique", "psychiatrie_primaire_chronique");
    if(isChecked('chkBipolaireII'))         ctxClinique.push("trouble_bipolaire", "trouble_thymique_chronique", "psychiatrie_primaire_chronique");
    if(isChecked('chkDepressionRecurrente'))ctxClinique.push("depression_recurrente", "depression", "trouble_thymique_chronique", "psychiatrie_primaire_chronique");
    if(isChecked('chkDysthymie'))           ctxClinique.push("dysthymie", "depression", "trouble_thymique_chronique", "psychiatrie_primaire_chronique");
    if(isChecked('chkTOC'))                 ctxClinique.push("toc", "psychiatrie_primaire_chronique");
    if(isChecked('chkTroublePanique'))      ctxClinique.push("trouble_panique", "anxiete_chronique", "psychiatrie_primaire_chronique");
    if(isChecked('chkTAGChronique'))        ctxClinique.push("tag", "anxiete_generalisee", "anxiete_chronique", "psychiatrie_primaire_chronique");
    if(isChecked('chkESPT'))                ctxClinique.push("espt", "psychiatrie_primaire_chronique");
    if(isChecked('chkTroublePersonnalite')) ctxClinique.push("trouble_personnalite", "psychiatrie_primaire_chronique");
    if(isChecked('chkUsageAlcool'))         ctxClinique.push("trouble_usage_alcool", "addiction", "alcool", "psychiatrie_primaire_chronique");
    if(isChecked('chkUsageSubstances'))     ctxClinique.push("trouble_usage_substances", "addiction", "psychiatrie_primaire_chronique");
    if(isChecked('chkTSADI'))               ctxClinique.push("tsa_di", "psychiatrie_primaire_chronique");
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
            const fam = (typeof medPrecisionFamily === 'function') ? medPrecisionFamily(m.classe, m.dci) : null;
            // Durée explicite (legacy : champ texte 'courte')
            if (fam === 'cortico' && p.duree === 'courte') ctxClinique.push('cortico_duree_breve');
            if (fam === 'opioide' && p.indication === 'severe') ctxClinique.push('douleur_severe');
            if (fam === 'opioide' && p.indication === 'legere') ctxClinique.push('douleur_legere');
            if (fam === 'ipp' && p.duree === 'courte') ctxClinique.push('ipp_duree_breve');
            // Antipsychotique durée brève → désarme EV_D05 (durée > 3 mois / 12 sem)
            if (fam === 'antipsychotique' && p.duree === 'courte') ctxClinique.push('antipsychotique_duree_breve');
            // REMEDIES « long cours » — durée brève désarme la suggestion de déprescription
            if (fam === 'fer' && p.duree === 'courte') ctxClinique.push('fer_duree_breve');
            if (fam === 'laxatif_stim' && p.duree === 'courte') ctxClinique.push('laxatif_stim_duree_breve');
            if (fam === 'antispasmodique' && p.duree === 'courte') ctxClinique.push('antispasmodique_duree_breve');
            if (fam === 'antivertigineux' && p.duree === 'courte') ctxClinique.push('antivertigineux_duree_breve');
            // Durée brève « usage ponctuel » désarme les règles « long cours » correspondantes
            if (fam === 'ains' && p.duree === 'courte') ctxClinique.push('ains_duree_breve');
            if (fam === 'opioide' && p.duree === 'courte') ctxClinique.push('opioide_duree_breve');
            if (fam === 'digoxine' && p.duree === 'courte') ctxClinique.push('digoxine_duree_breve');
            if (fam === 'metoclopramide' && p.duree === 'courte') ctxClinique.push('metoclopramide_duree_breve');
            if (fam === 'loperamide' && p.duree === 'courte') ctxClinique.push('loperamide_duree_breve');
            // Durée extraite (objet {jours, classe}) — source extracteur de texte libre
            const dureeObj = p.duree && typeof p.duree === 'object' ? p.duree : null;
            if (dureeObj) {
                if (fam === 'cortico' && dureeObj.classe === 'courte') ctxClinique.push('cortico_duree_breve');
                if (fam === 'ipp' && dureeObj.classe === 'courte') ctxClinique.push('ipp_duree_breve');
                if (fam === 'antipsychotique' && dureeObj.classe === 'courte') ctxClinique.push('antipsychotique_duree_breve');
            }
            // Précisions « surveillance récente OK » (Phase 1)
            // Désarment les règles « sans surveillance » quand le clinicien atteste que
            // le bilan/ECG/observance est en place.
            if ((fam === 'iec_ara2' || fam === 'epargnant_k') && p.k_recent === 'oui') ctxClinique.push('k_recent_ok');
            if (fam === 'diuretique' && p.iono_recent === 'oui') ctxClinique.push('iono_recent_ok');
            if (fam === 'lithium' && p.lithium_recent === 'oui') ctxClinique.push('lithium_recent_ok');
            if (fam === 'avk' && p.inr_recent === 'oui') ctxClinique.push('inr_recent_ok');
            if ((fam === 'antiarythmique' || fam === 'anticholinesterase') && p.ecg_recent === 'oui') ctxClinique.push('ecg_recent_ok');
            if (fam === 'digoxine' && p.digox_recent === 'oui') ctxClinique.push('digox_recent_ok');
            if (fam === 'clozapine' && p.nfs_recent === 'oui') ctxClinique.push('nfs_recent_ok');
            // Posologie extraite → contextes dose-dépendants
            if (typeof p.dose === 'number') {
                const dci = (m.dci || '').toLowerCase();
                if (fam === 'fer' && p.dose > 600) ctxClinique.push('dose_fer_elevee');
                // Calcium ≤ 1000 mg/j : sous le seuil REMEDIES (CV) → SUP_REM_02 désarmé.
                if (fam === 'calcium' && p.dose <= 1000) ctxClinique.push('calcium_dose_acceptable');
                if (/amitriptyline/i.test(dci) && p.dose > 75) ctxClinique.push('dose_amitriptyline_elevee');
                if (/acide\s*acetylsalicylique|aspirine/i.test(dci) && p.dose > 100) ctxClinique.push('dose_aspirine_elevee');
                // QT dose-dépendants : seuils RCP gériatriques (SFGG/SF3PA/SFPC 2026 item 18, ANSM/FDA 2011)
                if (/citalopram/i.test(dci) && !/escitalopram/i.test(dci) && p.dose > 20) ctxClinique.push('dose_citalopram_elevee');
                if (/escitalopram/i.test(dci) && p.dose > 10) ctxClinique.push('dose_escitalopram_elevee');
                // Digoxine : dose toxique chez ≥ 65 ans (Beers 2023, STOPP B12)
                if (/digoxine/i.test(dci) && p.dose > 125) ctxClinique.push('dose_digoxine_elevee');
                // Digoxine ≤ 125 µg/j : sous le seuil de toxicité → désarme EV_E01 (digoxine + DFG < 30).
                if (/digoxine/i.test(dci) && p.dose <= 125) ctxClinique.push('dose_digoxine_basse');
                // Statine dose basse (sous le seuil « haute intensité ») → désarme SUP_PIMC_12.
                // Seuils ESC/EAS : atorvastatine ≤ 40, rosuvastatine ≤ 20 ne sont PAS « haute intensité ».
                if (fam === 'statine') {
                    if (/atorvastatine/i.test(dci) && p.dose <= 40) ctxClinique.push('statine_dose_basse');
                    else if (/rosuvastatine/i.test(dci) && p.dose <= 20) ctxClinique.push('statine_dose_basse');
                }
            }
        });
    }

    return { bioValues, ctxClinique };
}

// =========================================================
// Bloc 2 — RECONTEXTUALISATION DES PIM PSYCHOTROPES
// (maladie psychiatrique primaire chronique chez le sujet âgé)
// =========================================================
// Allowlist STRICTE d'IDs de règles : on ne requalifie QUE des alertes dont la
// recommandation gériatrique par défaut (« arrêter/éviter ») devient inadaptée
// lorsque le médicament est le TRAITEMENT DE FOND d'une maladie psychiatrique
// primaire chronique. On ne touche JAMAIS une alerte de sécurité dure
// (QT — EV_N05, Parkinson/DCL, dysphagie, syndrome malin) : ces risques
// persistent quelle que soit l'indication.
const RECONTEXTE_PSY_RULES = {
    // Antipsychotiques = traitement de fond d'une psychose primaire chronique
    'EV_B18':      { contexte_any: ['psychose_chronique'], cible: 'antipsychotique' }, // long cours + maladie vasculaire
    'EV_D05':      { contexte_any: ['psychose_chronique'], cible: 'antipsychotique' }, // durée chez le dément (≠ SCPD ici)
    'EV_D16':      { contexte_any: ['psychose_chronique'], cible: 'antipsychotique' }, // « comme hypnotique » (en fait psychose)
    'EV_K02':      { contexte_any: ['psychose_chronique'], cible: 'antipsychotique' }, // chez le chuteur
    'EV_PRISC_02': { contexte_any: ['psychose_chronique'], cible: 'antipsychotique' }  // dose PRISCUS > 2 mg/j
};
const RECONTEXTE_PSY_NOTE = {
    antipsychotique: "⚕️ Traitement de fond d'une psychose primaire chronique — NE PAS déprescrire systématiquement. Viser la dose minimale efficace et renforcer la surveillance (QTc, syndrome métabolique, dyskinésie tardive) plutôt qu'arrêter.",
    thymoregulateur: "⚕️ Traitement de fond d'un trouble thymique chronique — NE PAS déprescrire systématiquement. Maintenir, optimiser la dose et renforcer la surveillance (lithémie, fonction rénale, thyroïde) plutôt qu'arrêter."
};
// Renvoie la note de recontextualisation si le contexte chronique l'exige, sinon ''.
function _recontexteNotePsy(cible, ctxClinique) {
    const set = ctxClinique instanceof Set ? ctxClinique : new Set(ctxClinique || []);
    if (cible === 'antipsychotique' && set.has('psychose_chronique')) return RECONTEXTE_PSY_NOTE.antipsychotique;
    if (cible === 'thymoregulateur' && set.has('trouble_thymique_chronique')) return RECONTEXTE_PSY_NOTE.thymoregulateur;
    return '';
}
// Marque les alertes du moteur (eviterFinal) à requalifier. N'enlève rien :
// ajoute _recontextualise + _recontexteNote, consommés par renderSingleAlert.
function recontextualiserPsychiatrieChronique(alertes, ctxClinique) {
    if (!Array.isArray(alertes) || !alertes.length) return;
    const set = new Set(ctxClinique || []);
    if (!set.has('psychose_chronique') && !set.has('trouble_thymique_chronique')) return;
    alertes.forEach(a => {
        const cfg = a && a.id && RECONTEXTE_PSY_RULES[a.id];
        if (!cfg) return;
        if (!cfg.contexte_any.some(c => set.has(c))) return;
        const note = _recontexteNotePsy(cfg.cible, set);
        if (!note) return;
        a._recontextualise = true;
        a._recontexteNote = note;
    });
}

// =========================================================
// MEMOIZATION — évite les re-analyses identiques
// =========================================================
let _lastAnalysisHash = null;
let _lastAnalysisResult = null;

function _computeAnalysisHash() {
    const parts = [
        getVal('patientAge'), getStr('patientSexe'), getVal('patientPoids'),
        getVal('patientBmi'),
        getStr('cpManual'),
        isChecked('patientFragile'),
        activeComorbs.slice().sort().join(','),
        activeMeds.map(m => m.dci + (m.precisions ? ':' + JSON.stringify(m.precisions) : '')).sort().join(','),
        window.suspendedMeds.map(m => m.dci).sort().join(',')
    ];
    // TOUS les champs numériques lus par _buildPatientContext / les scores.
    // ⚠️ Cette liste DOIT couvrir tout getVal() consommé par l'analyse, sinon une
    // modification de ce seul champ renverrait un résultat MÉMOÏSÉ périmé (bug de
    // sécurité clinique). Un test anti-dérive (tests.js) vérifie la couverture.
    _HASH_NUMERIC_FIELDS.forEach(id => parts.push(getVal(id)));
    // Sélecteurs d'unité (changent la valeur convertie B12/B9) + scoreCFS.
    parts.push(getVal('scoreCFS'));
    _HASH_SELECT_FIELDS.forEach(id => { const el = document.getElementById(id); parts.push(el ? el.value : ''); });
    // Inclure toutes les checkboxes cliniques
    ['chkStent','chkAlcool','chkAnorexie','chkTabac','chkAvc','chkTvp','chkSaignement',
     'chkBrady','chkHtaNonControlee','chkArret','chkScaAigu','chkLqts','chkDialyse',
     'chkFoie','chkSepsis','chkPalliatif','chkAtcdUlcere','chkChutes','chkDepression',
     'chkInstitution','chkConfine',
     'chkIncontinence','chkHbp','chkConstipation','chkDysphagie','chkGlaucome',
     'chkStenoseAortique','chkAspirineForte','chkInsulineSlidingScale','chkLewy',
     // Troubles cognitifs & neuropsychocomportementaux
     'chkDemence','demTypeMA','demTypeDP','demTypeDLFT','demTypeVasc','demTypeMixte',
     'chkSpcAgitation','chkSpcPsychose','chkSpcApathie','chkSpcDepressionSpc',
     'chkSpcInsomnie','chkSpcDesinhibition','chkSpcTca',
     'chkMci','chkMbiMotiv','chkMbiAffect','chkMbiImpuls','chkMbiSocial','chkMbiIdeat',
     'chkPsyPrim','chkAnxieteTAG','chkPsychoseTardive','chkBipolaire','chkCatatonie',
     'chkDelirium','delHyper','delHypo','delMixte',
     'chkSommeil','chkInsomnie','chkTcsp','chkSjsr','chkSaos',
     // Maladie psychiatrique primaire chronique (Bloc 1)
     'chkSchizoChronique','chkSchizoAffectif','chkTroubleDelirant','chkBipolaireI','chkBipolaireII',
     'chkDepressionRecurrente','chkDysthymie','chkTOC','chkTroublePanique','chkTAGChronique',
     'chkESPT','chkTroublePersonnalite','chkUsageAlcool','chkUsageSubstances','chkTSADI'
    ].forEach(id => parts.push(isChecked(id)));
    return parts.join('|');
}

// Liste canonique des champs numériques lus par l'analyse — partagée par la
// mémoïsation (_computeAnalysisHash) ET _buildPatientContext (bioValues + scores +
// contextes). Exposée sur window pour le test anti-dérive (tests.js).
const _HASH_NUMERIC_FIELDS = [
    'patientDFG', 'patientK', 'patientNa',
    'bioCreat', 'bioCa', 'bioMg', 'bioUree', 'bioUric', 'bioHb', 'bioPlaq',
    'bioGb', 'bioPnn', 'bioAsat', 'bioAlat', 'bioGgt', 'bioPal', 'bioBili',
    'bioCpk', 'bioTsh', 'bioFer', 'bioB12', 'bioB9', 'bioVitD', 'bioCrp',
    'bioGly', 'bioHba1c', 'bioLdl', 'bioHdl', 'bioTg', 'bioBnp', 'bioInr', 'bioQtc',
    'bioPct', 'bioLithium', 'bioDdim', 'bioTropo', 'bioLipase', 'bioAlbumSg',
    'bioLact', 'bioCst', 'bioPhos', 'bioTemp', 'bioT4', 'bioT3', 'bioTp', 'bioTca',
    'bioChlore', 'bioOsm', 'bioPrealb', 'bioAlbuminurie',
    'bioDigox', 'bioVgm', 'bioRetic',
    // Child-Pugh manuel (utilisé si cpManual=1)
    'cpBili', 'cpAlb', 'cpTp', 'cpAscite', 'cpEnceph'
];
const _HASH_SELECT_FIELDS = ['bioB12Unit', 'bioB9Unit', 'bioVitDUnit', 'bioDigoxUnit'];
if (typeof window !== 'undefined') { window._HASH_NUMERIC_FIELDS = _HASH_NUMERIC_FIELDS; window._HASH_SELECT_FIELDS = _HASH_SELECT_FIELDS; }

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
        // Alertes bio (HTML brut) : extraction du titre + masquage session via ✖
        // — la clé est stable (titre + sévérité), donc les filtres écran/synthèse/PDF
        // restent cohérents tant que la valeur biologique source n'a pas changé.
        if (targetId === 'alertes-bio') {
            const titleMatch = String(htmlStr).match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
            const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
            const severity = /alert-danger|alert-stopp/.test(htmlStr) ? 'danger' : 'warning';
            if (title) {
                const maskKey = 'tt:' + title + '|' + severity;
                // Filtre amont : si l'alerte a été masquée, on n'ajoute rien (écran +
                // synthèse + PDF en cohérence + compteur badge bio cohérent).
                if (window._maskedAlerts && window._maskedAlerts.has(maskKey)) return;
                // Injection du bouton ✖ juste après le <div class="alert …">.
                const safeKey = maskKey.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
                const btn = `<button type="button" class="btn-close float-end ms-2" style="font-size:0.7em;" aria-label="Masquer cette alerte" title="Masquer pour la session" onclick="if(typeof maskGeriaAlert==='function')maskGeriaAlert('${safeKey}');return false;"></button>`;
                htmlStr = String(htmlStr).replace(/(<div\s+class="alert[^"]*"[^>]*>)/i, '$1' + btn);
                _regAddDomain('bio', { titre: title, message: '', severity });
            }
        }
        if(_htmlBuffers[targetId]) _htmlBuffers[targetId].push(htmlStr);
        else { let el = document.getElementById(targetId); if(el) el.innerHTML += htmlStr; }
        if(countKey) counts[countKey]++;
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

            // Dédup PAR MÉDICAMENT (réduction du bruit de l'import SUP_*) : une règle
            // « supplement » purement générique (flag PIM sur la seule présence d'un
            // médicament, sans autre condition) est masquée si CHAQUE médicament qu'elle
            // vise est déjà couvert par une autre alerte « éviter » de sévérité ≥.
            // Garde-fous : on ne supprime jamais une règle native, ni la SEULE couverture
            // d'un médicament, ni un signal de sévérité supérieure. En cas de doute sur le
            // matching (matchesDrugClass indisponible), on conserve l'alerte.
            const _normTxt = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const _sevRank = s => ({ danger: 3, warning: 2, info: 1 }[s] || 0);
            const _canMatch = typeof matchesDrugClass === 'function';
            const _medsConcerned = a => {
                const keys = (a.condition && a.condition.med_keys) || a.med_keys || [];
                if (!keys.length || !_canMatch) return [];
                return activeMeds.filter(m => {
                    const dci = _normTxt(m.dci), classe = _normTxt(m.classe);
                    return keys.some(k => matchesDrugClass(dci, classe, _normTxt(k)));
                }).map(m => m.core_id || _normTxt(m.dci));
            };
            // Générique STRICT : la condition ne contient QUE med_keys (aucun autre gate —
            // ni comorbidité, bio, contexte, fragilité, âge, ACB, QT, polypharmacie…).
            // Toute règle portant une sémantique clinique distincte (ex. STOPPFrail gaté
            // sur la fragilité) est ainsi exclue du masquage.
            const _isGenericPim = a => {
                const c = a.condition || {};
                return Object.keys(c).every(k => k === 'med_keys' || k === 'type') && !!c.med_keys;
            };
            const _medCoverSev = {};
            eviterAll.forEach(a => _medsConcerned(a).forEach(mid => { _medCoverSev[mid] = Math.max(_medCoverSev[mid] || 0, _sevRank(a.severite)); }));

            (recos.supplement || []).forEach(a => {
                if (a.id && SUPPLEMENT_QUARANTINE.has(a.id)) return;
                const k = eviterKey(a);
                if (seenEviter.has(k)) return;
                const meds = _medsConcerned(a);
                if (_isGenericPim(a) && meds.length && meds.every(mid => (_medCoverSev[mid] || 0) >= _sevRank(a.severite))) {
                    return; // flag PIM générique déjà couvert ailleurs (sévérité ≥) → masqué
                }
                seenEviter.add(k);
                eviterAll.push(a);
                meds.forEach(mid => { _medCoverSev[mid] = Math.max(_medCoverSev[mid] || 0, _sevRank(a.severite)); });
            });
            eviterAll.sort((a, b) => (b.score || 0) - (a.score || 0));
            let eviterFinal = reconcileAlertClusters(eviterAll);

            // Filtrage des alertes masquées par l'utilisateur (Phase 2) — appliqué AVANT
            // rendu HTML, registre, comptage et synthèse, pour que le masque soit cohérent
            // sur l'écran, la synthèse et l'export PDF.
            const _filterMasked = (typeof filterMaskedAlerts === 'function') ? filterMaskedAlerts : (x => x);
            eviterFinal = _filterMasked(eviterFinal);
            const initierFiltered = recos.initier ? _filterMasked(recos.initier) : null;

            // ── Bloc 2 — Recontextualisation des PIM psychotropes pour maladie ──
            // psychiatrique primaire CHRONIQUE. Quand le patient gériatrique porte
            // une psychose/bipolarité ancienne, certains « à éviter » gériatriques
            // ne sont PAS des prescriptions inappropriées mais le TRAITEMENT DE FOND
            // de sa maladie : on ne les masque pas (le risque dose/QT/métabolique
            // reste réel) — on REQUALIFIE la recommandation en « maintien à
            // surveiller, ne pas déprescrire ». Allowlist d'IDs (jamais une alerte
            // de sécurité dure : QT, Parkinson, dysphagie ne sont pas touchées).
            recontextualiserPsychiatrieChronique(eviterFinal, ctx.contexte_clinique || []);

            const eviterHtml = eviterFinal.length ? GeriaEngineV2.renderAlertesTriees(eviterFinal, 'eviter') : '';
            const initierHtml = initierFiltered ? GeriaEngineV2.renderAlertesTriees(initierFiltered, 'initier') : '';
            document.getElementById('alertes-eviter').innerHTML = eviterHtml;
            document.getElementById('alertes-initier').innerHTML = initierHtml;

            counts.eviter = eviterFinal.length;
            counts.initier = initierFiltered ? initierFiltered.length : 0;
            // Registre: éviter/initier depuis le moteur V2 (post-filtrage des masquées)
            eviterFinal.forEach(a => {
                (a.med_keys || []).forEach(k => _regAddMed(k, 'eviter', { text: a.titre || a.message || '', severity: a.severite || 'warning', source: a.sources_label || '' }));
                _regAddDomain('eviter', { titre: a.titre || '', meds: a.med_keys || [], severity: a.severite || 'warning' });
            });
            if (initierFiltered) initierFiltered.forEach(a => {
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
    const checkBioSyndrome = (syndId, conditionRemplie, opts) => {
        if(!conditionRemplie) return;
        opts = opts || {};
        try {
            let s = MASTER_DB.SYNDROMES[syndId]; if(!s) return;
            let causes = [];
            if(s.IMPUTABILITE_FREQ) s.IMPUTABILITE_FREQ.split(',').map(x=>x.trim().replace(/\s*\(.*?\)/g, '')).filter(x=>x).forEach(c => { if(patientHasMedClass(c)) causes.push(c); });
            let imputStr = causes.length > 0 ? `<br><em>Imputabilité iatrogène détectée :</em> <b>${causes.join(', ').toUpperCase()}</b>` : '';
            // Sévérité : par défaut depuis la base (GRAVITE), surchargeable par valeur (opts.severe).
            let isSevere = (typeof opts.severe === 'boolean') ? opts.severe
                : (String(s.GRAVITE).includes('Sévère') || String(s.GRAVITE).includes('Severe'));
            // Libellé : surchargeable pour les syndromes gradués (ex. hyponatrémie légère/modérée/sévère).
            let nom = opts.labelOverride || s.NOM_SYNDROME;
            addAlert('alertes-bio', `<div class="alert alert-${isSevere ? 'danger alert-stopp' : 'warning border-warning'} shadow-sm"><strong>${isSevere ? '🚨' : '⚠️'} ${nom}</strong>${imputStr}<br><small>${s.CONDUITE_IMMEDIATE || 'Surveillance'}</small></div>`, 'bio');
        } catch(e) { GeriaLog.warn('Erreur syndrome bio:', e.message); }
    };

    // --- SYND_001 : Cytolyse Hépatique (ASAT > 3N ou ALAT > 3N) ---
    if(bioValues['BIO_013'] > 135 || bioValues['BIO_014'] > 105) checkBioSyndrome('SYND_001', true);

    // --- SYND_002 : Rhabdomyolyse (CPK > 5N) ---
    if(bioValues['BIO_018'] > 850) checkBioSyndrome('SYND_002', true);

    // --- SYND_003 : QTc allongé — gradué + distinction sexe ---
    // H : limite normale > 450 ; F : > 470. Palier DANGER ≥ 500 (risque torsades).
    {
        const qtc = bioValues['BIO_031'];
        if (qtc > 0) {
            const seuilSexe = (sexe === 'F') ? 470 : 450;
            if (qtc >= seuilSexe) {
                const severe = qtc >= 500;
                const grade = qtc >= 500 ? `sévère (≥ 500 ms — risque torsades)` : `prolongé (≥ ${seuilSexe} ms)`;
                checkBioSyndrome('SYND_003', true, { severe, labelOverride: `QTc ${grade} — ${qtc} ms` });
            }
        }
    }

    // --- SYND_004 : Thrombopénie — graduée (modérée 100-149 / sévère < 100 / très sévère < 50) ---
    {
        const plaq = bioValues['BIO_010'];
        if (plaq > 0 && plaq < 150) {
            const severe = plaq < 50;
            const grade = plaq < 50 ? 'très sévère (< 50)' : plaq < 100 ? 'sévère (50-99)' : 'modérée (100-149)';
            checkBioSyndrome('SYND_004', true, { severe, labelOverride: `Thrombopénie ${grade} — ${plaq} G/L` });
        }
    }

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
            } else if (!(fer > 0) && !(cst > 0) && hb < seuilAnemia) {
                // Ferritine et CST non dosés → recommander le bilan martial
                let inflNote = (crp > 0 && crp > 5) ? ' <em class="text-warning">(CRP élevée : interpréter ferritine avec prudence, seuil carentiel < 100 µg/L en contexte inflammatoire)</em>' : '';
                addAlert('alertes-bio', `<div class="alert alert-info border-info shadow-sm"><strong>💡 Anémie détectée — Bilan martial recommandé</strong>
                    <br><span class="small">Hb ${hb} g/dL (seuil ${seuilAnemia}). Dosage ferritine + CST + CRP indispensable pour orienter le diagnostic étiologique.${inflNote}</span>
                    <br><em>Si ferritine &lt; 30 µg/L (ou &lt; 100 en inflammation) : carence martiale → fer PO/IV. Si ferritine normale avec CST &lt; 20% : carence fonctionnelle.</em></div>`, 'bio');
            }

            // SYND_007 : Anémie Macrocytaire / Carence B12-B9
            if ((b12 > 0 && b12 < 150) || (b9 > 0 && b9 < 7)) {
                checkBioSyndrome('SYND_007', true);
            } else if (!(b12 > 0) && !(b9 > 0)) {
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

    // --- SYND_009 : Hyponatrémie — graduée (légère 130-134 / modérée 125-129 / sévère < 125) ---
    // Seuil clinique = < 135 (et non < 130) : l'hyponatrémie légère 130-134 est fréquente
    // chez l'âgé (SIADH iatrogène ISRS/thiazidiques) et justifie une alerte. Cohérent avec
    // le badge bio de la synthèse (< 135). DANGER si < 125, sinon VIGILANCE.
    {
        const na = bioValues['BIO_002'];
        if (na > 0 && na < 135) {
            const severe = na < 125;
            const grade = na < 125 ? 'sévère (< 125)' : na < 130 ? 'modérée (125-129)' : 'légère (130-134)';
            checkBioSyndrome('SYND_009', true, { severe, labelOverride: `Hyponatrémie ${grade} — Na ${na} mmol/L` });
        }
    }

    // --- SYND_010 : Hyperkaliémie — graduée (modérée 5.0-5.5 / sévère 5.5-6.5 / critique ≥ 6.5) ---
    {
        const k = bioValues['BIO_001'];
        if (k > 5.0) {
            const severe = k >= 5.5;
            const grade = k >= 6.5 ? 'critique (≥ 6.5 — risque FV/arrêt)' : k >= 5.5 ? 'sévère (5.5-6.4)' : 'modérée (5.0-5.4)';
            checkBioSyndrome('SYND_010', true, { severe, labelOverride: `Hyperkaliémie ${grade} — K ${k} mmol/L` });
        }
    }

    // --- SYND_011 : Hypokaliémie — graduée (légère 3.0-3.4 / sévère < 3.0 / critique < 2.5) ---
    {
        const k = bioValues['BIO_001'];
        if (k > 0 && k < 3.5) {
            const severe = k < 3.0;
            const grade = k < 2.5 ? 'critique (< 2.5 — risque arythmie/torsades)' : k < 3.0 ? 'sévère (2.5-2.9)' : 'légère (3.0-3.4)';
            checkBioSyndrome('SYND_011', true, { severe, labelOverride: `Hypokaliémie ${grade} — K ${k} mmol/L` });
        }
    }

    // --- SYND_012/013 : Dysthyroïdie (TSH + T4/T3) ---
    let tsh = bioValues['BIO_019']; let t4 = bioValues['BIO_T4']; let t3 = bioValues['BIO_T3'];
    if (tsh > 0) {
        if (tsh > 4.0) {
            // Hypothyroïdie (SYND_013) : alerte détaillée custom ci-dessous (pas de
            // checkBioSyndrome générique, qui ferait un doublon d'affichage ET de comptage).
            let isOvert = (t4 > 0 && t4 < 60) || tsh > 10;
            let thyroSev = isOvert ? 'danger' : 'warning';
            let thyroCauses = [];
            let hypoTerms = MASTER_DB.SYNDROMES['SYND_013'] && MASTER_DB.SYNDROMES['SYND_013'].IMPUTABILITE_FREQ ? MASTER_DB.SYNDROMES['SYND_013'].IMPUTABILITE_FREQ.split(',').map(x=>x.trim().replace(/\s*\(.*?\)/g, '')).filter(Boolean) : [];
            hypoTerms.forEach(d => { if(patientHasMedClass(d)) thyroCauses.push(d); });
            let thyroImput = thyroCauses.length > 0 ? `<br><em>Imputabilité iatrogène :</em> <b>${thyroCauses.join(', ').toUpperCase()}</b>` : '';
            let thyroLabel = isOvert ? (thyroCauses.length > 0 ? 'Hypothyroïdie iatrogène avérée' : 'Hypothyroïdie avérée') : (thyroCauses.length > 0 ? 'Hypothyroïdie iatrogène subclinique' : 'Hypothyroïdie subclinique');
            let thyroConc = isOvert ? 'Traitement substitutif par lévothyroxine recommandé. Débuter 12.5-25 µg/j chez le sujet âgé, titrer par paliers de 12.5 µg toutes les 6-8 semaines.' : (tsh > 10 ? 'TSH > 10 — substitution recommandée même si subclinique.' : 'TSH 4-10 — à contrôler à 6-8 semaines, substituer si symptômes ou progression.');
            addAlert('alertes-bio', `<div class="alert alert-${thyroSev} shadow-sm"><strong>${isOvert ? '🚨' : '⚠️'} ${thyroLabel}</strong> (TSH ${tsh} mUI/L${t4 > 0 ? ', T4 ' + t4 + ' nmol/L' : ''})${thyroImput}<br><em>Conduite :</em> ${thyroConc}</div>`, 'bio');
        } else if (tsh < 0.4 && tsh > 0) {
            // Hyperthyroïdie (SYND_012, ou SYND_019 si thyrotoxicose sévère) : alerte
            // détaillée custom ci-dessous (pas de checkBioSyndrome générique = doublon).
            let isOvert = (t4 > 0 && t4 > 120) || (t3 > 0 && t3 > 2.7);
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

    // --- Calcémie corrigée par l'albumine (formule de Payne) ---
    // Ca corrigé = Ca mesuré + 0.02 × (40 − albumine g/L). Indispensable chez le
    // sujet âgé hypoalbuminémique : la calcémie totale sous-estime le Ca ionisé,
    // d'où fausse hypocalcémie et vraie hypercalcémie manquée. On corrige seulement
    // si l'albumine est dosée ; sinon on retient la valeur brute.
    let caEval, caLabel;
    {
        const caRaw = bioValues['BIO_005'];
        const alb = bioValues['BIO_035'];
        if (caRaw > 0 && alb > 0 && alb < 40) {
            caEval = Math.round((caRaw + 0.02 * (40 - alb)) * 100) / 100;
            caLabel = `Ca corrigé ${caEval} mmol/L (brut ${caRaw}, albumine ${alb} g/L)`;
        } else {
            caEval = caRaw;
            caLabel = `Ca ${caRaw} mmol/L`;
        }
    }

    // --- SYND_020 : Hypocalcémie — graduée (légère 2.0-2.19 / sévère < 2.0 / symptomatique < 1.9) ---
    if (caEval > 0 && caEval < 2.20) {
        const severe = caEval < 1.9;
        const grade = caEval < 1.9 ? 'symptomatique (< 1.9)' : caEval < 2.0 ? 'modérée (< 2.0)' : 'légère (2.0-2.19)';
        checkBioSyndrome('SYND_020', true, { severe, labelOverride: `Hypocalcémie ${grade} — ${caLabel}` });
    }

    // --- SYND_021 : Hypercalcémie — graduée (légère 2.65-3.0 / sévère 3.0-3.5 / crise > 3.5) ---
    if (caEval > 2.65) {
        const severe = caEval > 3.0;
        const grade = caEval > 3.5 ? 'crise hypercalcémique (> 3.5 — urgence)' : caEval > 3.0 ? 'sévère (3.0-3.5)' : 'légère (2.65-3.0)';
        checkBioSyndrome('SYND_021', true, { severe, labelOverride: `Hypercalcémie ${grade} — ${caLabel}` });
    }

    // --- SYND_022 : Hypomagnésémie — graduée (légère 0.70-0.75 / sévère 0.50-0.70 / critique < 0.50) ---
    {
        const mg = bioValues['BIO_006'];
        if (mg > 0 && mg < 0.75) {
            const severe = mg < 0.50;
            const grade = mg < 0.50 ? 'critique (< 0.50 — risque torsades)' : mg < 0.70 ? 'sévère (0.50-0.69)' : 'légère (0.70-0.74)';
            checkBioSyndrome('SYND_022', true, { severe, labelOverride: `Hypomagnésémie ${grade} — Mg ${mg} mmol/L` });
        }
    }

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

    // --- SYND_028 : Lithiémie — graduée sujet âgé (cible 0.4-0.8 / vigilance > 0.8 / toxique > 1.2 / sévère > 1.5) ---
    {
        const li = bioValues['BIO_029'];
        if (li > 0.8) {
            const severe = li > 1.2;
            const grade = li > 2.0 ? 'sévère (> 2.0 — toxicité, néphrotoxicité)' : li > 1.5 ? 'surdosage (1.5-2.0)' : li > 1.2 ? 'toxique sujet âgé (> 1.2)' : 'vigilance (> 0.8 — limite haute sujet âgé)';
            checkBioSyndrome('SYND_028', true, { severe, labelOverride: `Lithiémie ${grade} — ${li} mEq/L` });
        }
    }

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

    // --- SYND_032 : Ictère / Hyperbilirubinémie — gradué (ictère 35-50 / cholestase 50-100 / sévère > 100) ---
    {
        const bili = bioValues['BIO_017'];
        if (bili > 35) {
            const severe = bili > 100;
            const grade = bili > 200 ? 'sévère (> 200 — risque encéphalopathie si cirrhose)' : bili > 100 ? 'marquée (100-200)' : bili > 50 ? 'cholestase clinique (50-100)' : 'ictère débutant (35-50)';
            checkBioSyndrome('SYND_032', true, { severe, labelOverride: `Hyperbilirubinémie ${grade} — ${bili} µmol/L` });
        }
    }

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

    // --- SYND_036 : Syndrome Coronarien Aigu — Troponine hs sexe-spécifique (ESC 2023) ---
    // 99e percentile : F > 16 ng/L, H > 34 ng/L. Seuil "rule-in SCA" : > 52 ng/L (cohorte mixte).
    {
        const tn = bioValues['BIO_034'];
        const seuilSexe = (sexe === 'F') ? 16 : 34;
        if (tn > seuilSexe) {
            const severe = tn > 52;
            const grade = tn > 52 ? `rule-in SCA (> 52 ng/L)` : `élévation > 99e percentile ${sexe} (> ${seuilSexe} ng/L)`;
            checkBioSyndrome('SYND_036', true, { severe, labelOverride: `Troponine hs ${grade} — ${tn} ng/L` });
        }
    }

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

    // --- SYND_042 : Hypernatrémie — graduée (modérée 145-150 / sévère 150-160 / critique > 160) ---
    {
        const na = bioValues['BIO_002'];
        if (na > 145) {
            const severe = na > 155;
            const grade = na > 160 ? 'critique (> 160 — encéphalopathie/coma)' : na > 155 ? 'sévère (155-160)' : na > 150 ? 'modérée (150-155)' : 'légère (145-150)';
            checkBioSyndrome('SYND_042', true, { severe, labelOverride: `Hypernatrémie ${grade} — Na ${na} mmol/L` });
        }
    }

    // --- Digoxinémie (BIO_044) — fenêtre thérapeutique étroite (ESC 2021 IC, sujet âgé) ---
    // Cible 0.5-0.9 ng/mL chez l'âgé ; > 1.2 = surdosage probable ; > 2.0 = toxicité.
    {
        const dig = bioValues['BIO_044'];
        if (dig > 0.9) {
            const severe = dig > 1.2;
            const grade = dig > 2.0 ? 'toxique (> 2.0)' : dig > 1.2 ? 'surdosage (1.2-2.0)' : 'limite haute sujet âgé (> 0.9)';
            const cls = dig > 1.2 ? 'danger' : 'warning border-warning';
            const icon = dig > 1.2 ? '🚨' : '⚠️';
            const digCauses = [];
            ['amiodarone', 'verapamil', 'spironolactone', 'macrolide', 'itraconazole', 'quinidine', 'propafenone'].forEach(d => { if (patientHasMedClass(d)) digCauses.push(d); });
            const digImput = digCauses.length > 0 ? `<br><em>Interactions augmentant la digoxinémie :</em> <b>${digCauses.join(', ').toUpperCase()}</b>` : '';
            const irc = bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 50 ? `<br><em>Facteur de risque :</em> IRC (DFG ${bioValues['BIO_004']} ml/min) — accumulation rénale.` : '';
            addAlert('alertes-bio', `<div class="alert alert-${cls} shadow-sm"><strong>${icon} Digoxinémie ${grade} — ${dig} ng/mL</strong>${digImput}${irc}
                <br><em>Cible ESC 2021 sujet âgé :</em> 0.5-0.9 ng/mL.
                <br><em>Conduite :</em> ${dig > 1.2 ? 'Arrêt transitoire digoxine, ECG (BAV, arythmie), contrôler K+/Mg, doser à 24-48h. Fab anti-digoxine si toxicité menaçante.' : 'Réduire dose de 25 %, contrôler digoxinémie à 1 semaine, surveiller fonction rénale et K+.'}</div>`, 'bio');
        }
    }

    // --- TCA (BIO_045) — surveillance HNF (cible 1.5-2.5 vs témoin) ---
    {
        const tca = bioValues['BIO_045'];
        if (tca > 0 && patientHasMedClass('heparine')) {
            if (tca > 2.5) {
                addAlert('alertes-bio', `<div class="alert alert-${tca > 3.0 ? 'danger' : 'warning border-warning'} shadow-sm"><strong>${tca > 3.0 ? '🚨' : '⚠️'} TCA supra-thérapeutique sous HNF (ratio ${tca})</strong>
                    <br><em>Cible :</em> 1.5-2.5 vs témoin.
                    <br><em>Conduite :</em> ${tca > 3.0 ? 'Arrêt transitoire HNF, contrôle à 4-6h, surveiller hémorragie. Protamine si saignement actif.' : 'Réduire débit HNF de 25 %, contrôle à 6h.'}</div>`, 'bio');
            } else if (tca < 1.5) {
                addAlert('alertes-bio', `<div class="alert alert-info border-info shadow-sm"><strong>💡 TCA infra-thérapeutique sous HNF (ratio ${tca})</strong>
                    <br><em>Cible :</em> 1.5-2.5. Augmenter débit HNF de 10-15 %, contrôle à 6h.</div>`, 'bio');
            }
        }
    }

    // --- Albuminurie / RAC (BIO_046) — stadification KDIGO ---
    // A1 < 30, A2 30-300, A3 ≥ 300 (mg/g RAC ou mg/24h). Impact pronostique CV + indication iSGLT2/ARMi.
    {
        const acr = bioValues['BIO_046'];
        if (acr >= 30) {
            const a3 = acr >= 300;
            const stade = a3 ? 'A3 — protéinurie sévère (≥ 300)' : 'A2 — microalbuminurie (30-299)';
            const cls = a3 ? 'danger' : 'warning border-warning';
            const icon = a3 ? '🚨' : '⚠️';
            const diabete = activeComorbs.some(c => ['PAT_016', 'PAT_016a', 'PAT_016b'].includes(c)) || (bioValues['BIO_026'] > 6.5);
            const indication = diabete
                ? 'Diabète + albuminurie → indication forte IEC/ARA2 + iSGLT2 (dapagliflozine, empagliflozine) — réduction progression IRC et CV (KDIGO 2022).'
                : 'Atteinte rénale précoce → IEC/ARA2 à doses néphroprotectrices, contrôle TA cible < 130/80.';
            addAlert('alertes-bio', `<div class="alert alert-${cls} shadow-sm"><strong>${icon} Albuminurie KDIGO ${stade} — ${acr} mg/g (ou mg/24h)</strong>
                <br><em>Conduite :</em> ${indication}</div>`, 'bio');
        }
    }

    // --- Anémie subtypée par VGM (BIO_039) — si Hb basse + VGM disponible ---
    {
        const hb = bioValues['BIO_009'];
        const vgm = bioValues['BIO_039'];
        const seuilHbF = 12, seuilHbM = 13;
        const anemique = hb > 0 && ((sexe === 'F' && hb < seuilHbF) || (sexe === 'M' && hb < seuilHbM));
        if (anemique && vgm > 0) {
            let subtype = '', etiologies = '';
            if (vgm < 80) { subtype = 'microcytaire (VGM < 80)'; etiologies = 'Carence martiale (ferritine bas + CST < 20 %), thalassémie, saturnisme, anémie inflammatoire chronique.'; }
            else if (vgm > 100) { subtype = 'macrocytaire (VGM > 100)'; etiologies = 'Carence B12/B9, hypothyroïdie, alcool, médicaments (méthotrexate, hydroxyurée), syndrome myélodysplasique.'; }
            else { subtype = 'normocytaire (VGM 80-100)'; etiologies = 'Anémie inflammatoire, hémolyse, IRC (EPO), médullaire (réticulocytes utiles).'; }
            addAlert('alertes-bio', `<div class="alert alert-info border-info shadow-sm"><strong>💡 Anémie ${subtype} — Hb ${hb} g/dL</strong>
                <br><em>Étiologies à explorer :</em> ${etiologies}${bioValues['BIO_038'] > 0 ? `<br><em>Réticulocytes ${bioValues['BIO_038']} G/L :</em> ${bioValues['BIO_038'] < 50 ? 'arégénérative (origine centrale / carentielle)' : 'régénérative (hémolyse, hémorragie récente)'}.` : ''}</div>`, 'bio');
        }
    }

    // --- TP bas (< 50%) — Risque hémorragique ---
    if (bioValues['BIO_040'] > 0 && bioValues['BIO_040'] < 50) {
        let tpCauses = [];
        ['avk', 'anticoag', 'rivaroxaban', 'apixaban', 'dabigatran'].forEach(d => { if (patientHasMedClass(d)) tpCauses.push(d); });
        let tpImput = tpCauses.length > 0 ? `<br><em>Imputabilité :</em> <b>${tpCauses.join(', ').toUpperCase()}</b>` : '';
        addAlert('alertes-bio', `<div class="alert alert-danger shadow-sm"><strong>🚨 TP bas (${bioValues['BIO_040']}%) — Risque hémorragique</strong>${tpImput}
            <br><em>Conduite :</em> ${bioValues['BIO_040'] < 30 ? 'TP < 30% — urgence hémostatique, vitamine K IV si AVK, PFC si IHC sévère.' : 'Rechercher cause : insuffisance hépatique, AVK, CIVD. Adapter anticoagulation.'}</div>`, 'bio');
    }

    // --- Hypochlorémie (< 95 mmol/L) ou Hyperchlorémie (> 110 mmol/L) ---
    if (bioValues['BIO_041'] > 0) {
        if (bioValues['BIO_041'] < 95) {
            addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Hypochlorémie (${bioValues['BIO_041']} mmol/L)</strong>
                <br><em>Causes fréquentes :</em> Vomissements, aspirations gastriques, diurétiques (furosémide). Alcalose métabolique associée probable.
                <br><em>Conduite :</em> Corriger la cause, NaCl IV si sévère.</div>`, 'bio');
        } else if (bioValues['BIO_041'] > 110) {
            addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Hyperchlorémie (${bioValues['BIO_041']} mmol/L)</strong>
                <br><em>Causes fréquentes :</em> Perfusion NaCl excessive, acidose tubulaire, IRC. Acidose hyperchlorémique possible.
                <br><em>Conduite :</em> Trou anionique, gaz du sang, adapter les perfusions.</div>`, 'bio');
        }
    }

    // --- Hyperosmolalité (> 300 mOsm/kg) — Déshydratation ---
    if (bioValues['BIO_042'] > 300) {
        let osmCauses = [];
        ['diuretique', 'lithium', 'mannitol'].forEach(d => { if (patientHasMedClass(d)) osmCauses.push(d); });
        let osmImput = osmCauses.length > 0 ? `<br><em>Imputabilité :</em> <b>${osmCauses.join(', ').toUpperCase()}</b>` : '';
        addAlert('alertes-bio', `<div class="alert alert-${bioValues['BIO_042'] > 320 ? 'danger' : 'warning'} shadow-sm">
            <strong>${bioValues['BIO_042'] > 320 ? '🚨' : '⚠️'} Hyperosmolalité (${bioValues['BIO_042']} mOsm/kg)</strong>${osmImput}
            <br><em>Conduite :</em> ${bioValues['BIO_042'] > 320 ? 'Déshydratation sévère — réhydratation IV par soluté hypotonique. Rechercher coma hyperosmolaire si diabétique.' : 'Déshydratation modérée — réhydratation PO/IV, adapter diurétiques.'}</div>`, 'bio');
    }

    // --- Préalbumine (transthyrétine) — Marqueur de suivi nutritionnel ---
    // Normes : 0.20-0.40 g/L | Seuils révisés (Bouillanne 2017) : sévère < 0.12, modéré < 0.17
    // NB : HAS 2021 ne retient plus la préalbumine comme critère diagnostique de dénutrition,
    //       mais reste utile en suivi d'efficacité de la renutrition (demi-vie 2-4 jours).
    if (bioValues['BIO_043'] > 0 && bioValues['BIO_043'] < 0.12) {
        addAlert('alertes-bio', `<div class="alert alert-danger shadow-sm"><strong>🚨 Préalbumine très basse (${bioValues['BIO_043']} g/L) — dénutrition sévère</strong>
            <br><em>Normes :</em> 0.20 – 0.40 g/L | Seuil sévère < 0.12 g/L (Bouillanne 2017)
            <br><em>Interprétation :</em> Dénutrition protéino-énergétique sévère (marqueur précoce, demi-vie 2-4 jours). Attention : abaissée aussi en syndrome inflammatoire (CRP élevée) et insuffisance hépatique.
            <br><em>Conduite :</em> Support nutritionnel urgent : CNO hypercaloriques/hyperprotidiques, envisager nutrition entérale. Adapter posologies des médicaments à forte liaison protéique. Contrôle à J15.</div>`, 'bio');
    } else if (bioValues['BIO_043'] > 0 && bioValues['BIO_043'] < 0.17) {
        addAlert('alertes-bio', `<div class="alert alert-warning border-warning shadow-sm"><strong>⚠️ Préalbumine basse (${bioValues['BIO_043']} g/L) — dénutrition modérée</strong>
            <br><em>Normes :</em> 0.20 – 0.40 g/L | Seuil modéré < 0.17 g/L (Bouillanne 2017)
            <br><em>Conduite :</em> Enrichissement des repas, CNO, réévaluation à J15. Éliminer un syndrome inflammatoire surajouté (CRP).</div>`, 'bio');
    } else if (bioValues['BIO_043'] > 0 && bioValues['BIO_043'] < 0.20) {
        addAlert('alertes-bio', `<div class="alert alert-info border-info shadow-sm"><strong>💡 Préalbumine limite basse (${bioValues['BIO_043']} g/L)</strong>
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
            // Bloc 2 — recontextualisation : la bithérapie antipsychotique peut être
            // un choix délibéré (résistance, augmentation clozapine) dans une psychose
            // primaire chronique. On garde l'alerte (risque cumulé QT/métabolique réel)
            // mais on requalifie « à éviter » → « parfois justifié, surveiller ».
            const _ctxDup = (typeof ctx !== 'undefined' && ctx && ctx.contexte_clinique) ? ctx.contexte_clinique : [];
            const _notePsyApsy = _recontexteNotePsy('antipsychotique', _ctxDup);
            dupFound.forEach(d => {
                const dciList = d.dcis.map(x => `<strong>${escapeHtml(x.toUpperCase())}</strong>`).join(' + ');
                const _recontextDup = (d.label === 'Antipsychotiques' && _notePsyApsy)
                    ? `<br><div class="mt-1 p-2 rounded" style="background:#e7f1ff;border-left:3px solid #0d6efd;"><small><strong>${escapeHtml(_notePsyApsy)}</strong></small></div>`
                    : '';
                addAlert('alertes-eviter', `<div class="alert alert-warning border-warning shadow-sm">
                    <strong>⚠️ Doublon thérapeutique — ${escapeHtml(d.label)}</strong>
                    <span class="badge bg-dark float-end" style="font-size:0.65em;">Doublon classe</span>
                    <br><span class="small">${dciList}</span>
                    <br><small>${escapeHtml(d.note)}</small>
                    ${d.exception ? `<br><small class="text-info fst-italic">${escapeHtml(d.exception)}</small>` : ''}
                    ${_recontextDup}
                    <br><span class="badge bg-warning text-dark" style="font-size:0.7em;">${_recontextDup ? 'Parfois justifié — surveiller' : 'A ÉVITER sauf justification EBM'}</span>
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
                // mechanism est null dans ~65% de DDI_MERGED_DB → fallback sur effet
                // (toujours renseigné) pour ne pas afficher "null" dans l'onglet AUC.
                let mecanisme = m.mechanism || m.effet || '';
                let mecHtml = mecanisme ? `<br><em class="text-muted small">${escapeHtml(String(mecanisme))}</em>` : '';
                return `<li style="margin-bottom:6px;"><span class="fw-bold">${(ratio >= 3 || ratio <= 0.3) ? '🔴' : '🟠'} Ratio ${txtRatio}</span>${srcBadge}${mecHtml}</li>`;
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
                let isLegere = (dfg > 60 && dfg <= 90); let isModeree = (dfg > 30 && dfg <= 60); let isSevere = (dfg > 15 && dfg <= 30); let isTerminale = (dfg > 0 && dfg <= 15); let isUnk = !(dfg > 0);
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
            'BIO_044': 'Trimestriel sous digoxine (ESC 2021)',
            'BIO_045': 'Toutes les 6h en initiation HNF, quotidien à l\'équilibre',
            'BIO_046': 'Annuel si HTA/diabète/IRC (KDIGO 2022)',
            'BIO_CST': 'Annuel',
            'BIO_PHOS': 'Annuel',
            'BIO_T4': 'Selon TSH',
            'BIO_T3': 'Selon TSH'
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
            // Une interaction n'est un danger ACTIF que si toute la combinaison est
            // réellement prescrite. Sinon c'est une information de principe : on la
            // bascule en « Contre-indiqué en cas de prescription future » (gris, repliée)
            // au lieu du rouge alarmant, qui était trop fort pour une simple mise en garde.
            const interCrit = rule.INTERACTIONS_CRITIQUES;
            if (interCrit && interCrit.length > 0) {
                // Un élément (ex. « IEC ou ARA2 ou ARNI ») est présent si au moins une de
                // ses alternatives correspond à un médicament actif ; la combinaison est
                // prescrite si TOUS ses éléments sont présents.
                const _comboElementPresent = (elem) => String(elem || '')
                    .split(/\bou\b/i)
                    .some(alt => _activeMedsHasClass(alt.trim()));
                const _comboPrescribed = (combo) => Array.isArray(combo) && combo.length > 0
                    && combo.every(_comboElementPresent);

                const interActive = interCrit.filter(ic => _comboPrescribed(ic.combinaison));
                const interFuture = interCrit.filter(ic => !_comboPrescribed(ic.combinaison));

                if (interActive.length > 0) {
                    guidelinesHtml += `<div class="mb-2 mt-2"><strong class="text-danger small">INTERACTIONS CRITIQUES SPECIFIQUES</strong></div>`;
                    interActive.forEach(ic => {
                        guidelinesHtml += `<div class="alert alert-danger py-1 px-2 mb-1 bg-danger bg-opacity-10" style="border-left:3px solid #dc3545;">
                            <strong class="small">${ic.combinaison ? ic.combinaison.join(' + ') : ''}</strong>
                            ${ic.gravite ? ` <span class="badge bg-danger" style="font-size:0.6em;">${ic.gravite}</span>` : ''}
                            ${ic.risque ? `<br><small class="text-danger">${ic.risque}</small>` : ''}
                            ${ic.conduite ? `<br><small>${ic.conduite}</small>` : ''}
                            ${ic.surveillance ? `<br><small class="text-info">${ic.surveillance}</small>` : ''}
                        </div>`;
                    });
                }

                if (interFuture.length > 0) {
                    let futItems = '';
                    interFuture.forEach(ic => {
                        futItems += `<div class="alert alert-light py-1 px-2 mb-1" style="border-left:3px solid #adb5bd;">
                            <strong class="small text-muted">${ic.combinaison ? ic.combinaison.join(' + ') : ''}</strong>
                            ${ic.gravite ? ` <span class="badge bg-light text-muted border" style="font-size:0.6em;">${ic.gravite}</span>` : ''}
                            ${ic.risque ? `<br><small class="text-muted">${ic.risque}</small>` : ''}
                            ${ic.conduite ? `<br><small class="text-muted">${ic.conduite}</small>` : ''}
                            ${ic.surveillance ? `<br><small class="text-muted">${ic.surveillance}</small>` : ''}
                        </div>`;
                    });
                    guidelinesHtml += `<details class="mb-2 mt-2"><summary class="text-muted small fw-bold" style="cursor:pointer;">Contre-indiqué en cas de prescription future (${interFuture.length}) — information de principe</summary><div class="mt-1">${futItems}</div></details>`;
                }
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

        // =====================================================
        // ── NOUVEAUTÉS Commit 1 : EN-TÊTE + PROFIL + BIO + TOP ACTIONS + BANDEAU
        // =====================================================

        // Données structurées partagées écran ↔ PDF (single source of truth).
        // Alimentées par les synthBuild* avant retour HTML, exposées via _registry.synthData.
        const synthData = {
            riskChips: [],         // [{ label, level, title }]
            topActions: [],        // [{ icon, txt, level, kind }]
            banner: null,          // { level, icon, msg, nbDanger, nbWarning, nbOmissions }
            mechanismClusters: null,  // lien vers var existante (rempli plus bas)
            interactCritical: null,
            bioIssues: null,
            toAdd: null,
            toRemoveFiltered: null,
            aberrantInputs: []     // [{ field, value, range }] — saisies hors plages plausibles
        };

        // [Z] Détection de saisies aberrantes (typo unité, inversion décimale, ordre
        // de grandeur). Bornes physiologiquement plausibles incluant les extrêmes
        // cliniques (pas les bornes "normales"). Non bloquant — flag visuel.
        {
            const ranges = [
                { field: 'Âge',      val: patientAge,            min: 18,   max: 115, unit: 'ans' },
                { field: 'Poids',    val: parseFloat(getVal && getVal('patientPoids')) || 0, min: 25, max: 300, unit: 'kg', skipZero: true },
                { code: 'BIO_004',   field: 'DFG',       min: 1,    max: 200,  unit: 'ml/min' },
                { code: 'BIO_001',   field: 'K+',        min: 1.5,  max: 8.5,  unit: 'mmol/L' },
                { code: 'BIO_002',   field: 'Na+',       min: 105,  max: 180,  unit: 'mmol/L' },
                { code: 'BIO_003',   field: 'Créat',     min: 10,   max: 3000, unit: 'µmol/L' },
                { code: 'BIO_009',   field: 'Hb',        min: 3,    max: 22,   unit: 'g/dL' },
                { code: 'BIO_010',   field: 'Plaquettes',min: 1,    max: 2000, unit: 'G/L' },
                { code: 'BIO_026',   field: 'HbA1c',     min: 3,    max: 20,   unit: '%' },
                { code: 'BIO_030',   field: 'INR',       min: 0.5,  max: 15,   unit: '' },
                { code: 'BIO_031',   field: 'QTc',       min: 250,  max: 700,  unit: 'ms' },
                { code: 'BIO_019',   field: 'TSH',       min: 0.001,max: 200,  unit: 'mUI/L' },
                { code: 'BIO_025',   field: 'Glycémie',  min: 0.5,  max: 50,   unit: 'mmol/L' },
                { code: 'BIO_017',   field: 'Bili',      min: 1,    max: 1000, unit: 'µmol/L' },
                { code: 'BIO_005',   field: 'Calcémie',  min: 1.0,  max: 4.0,  unit: 'mmol/L' },
                { code: 'BIO_006',   field: 'Magnésium', min: 0.3,  max: 2.0,  unit: 'mmol/L' },
                { code: 'BIO_029',   field: 'Lithium',   min: 0,    max: 5,    unit: 'mEq/L' },
                { code: 'BIO_034',   field: 'Troponine', min: 0,    max: 100000, unit: 'ng/L' },
                { code: 'BIO_044',   field: 'Digoxinémie', min: 0,  max: 10,   unit: 'ng/mL' },
                { code: 'BIO_045',   field: 'TCA',       min: 0.5,  max: 10,   unit: 'ratio' },
                { code: 'BIO_046',   field: 'Albuminurie', min: 0,  max: 10000, unit: 'mg/g' },
                { code: 'BIO_039',   field: 'VGM',       min: 40,   max: 140,  unit: 'fL' },
                { code: 'BIO_023',   field: 'Vit D',     min: 0,    max: 200,  unit: 'ng/mL' }
            ];
            ranges.forEach(r => {
                let v = r.code ? bioValues[r.code] : r.val;
                if (v == null || v === '' || isNaN(v)) return;
                const num = parseFloat(v);
                if (!isFinite(num)) return;
                if (r.skipZero && num === 0) return;
                if (num === 0 && r.code) return;  // 0 = non saisi pour les bio
                if (num < r.min || num > r.max) {
                    synthData.aberrantInputs.push({
                        field: r.field,
                        value: num + (r.unit ? ' ' + r.unit : ''),
                        range: r.min + '-' + r.max + (r.unit ? ' ' + r.unit : '')
                    });
                }
            });
        }

        // [A] EN-TÊTE NARRATIF PATIENT
        const synthBuildHeader = () => {
            const sexeLabel = sexe === 'F' ? 'Mme' : (sexe === 'M' ? 'M.' : 'Patient(e)');
            const ageStr = patientAge > 0 ? `${patientAge} ans` : 'âge non renseigné';
            const fragLabel = (typeof getVal === 'function' && getVal('scoreCFS') >= 7) ? ' fragile sévère (CFS ' + getVal('scoreCFS') + ')'
                : (isFragile ? ' fragile (CFS ' + (getVal('scoreCFS') || '≥6') + ')' : '');
            const nbComorbs = (activeComorbs || []).length;
            const nbMeds = (activeMeds || []).length;
            const polyLabel = nbMeds >= 10 ? ' — <span class="text-danger fw-bold">polypharmacie majeure</span>'
                : nbMeds >= 5 ? ' — polypharmacie' : '';
            // Top 3 comorbs (pour synthèse en 1 ligne)
            const comorbLabels = (activeComorbs || []).slice(0, 5).map(c => {
                const p = (typeof MASTER_DB !== 'undefined' && MASTER_DB.PATHOLOGIES) ? MASTER_DB.PATHOLOGIES[c] : null;
                return p ? (p.NOM_STANDARD || c) : c;
            });
            const moreComorbs = nbComorbs > 5 ? ` +${nbComorbs - 5}` : '';
            const comorbStr = comorbLabels.length ? comorbLabels.join(', ') + moreComorbs : 'aucune comorbidité saisie';
            return `<div class="card mb-2 shadow-sm" style="border-left:4px solid #0d6efd;">
                <div class="card-body py-2 px-3">
                    <strong>${sexeLabel} ${ageStr}${fragLabel}</strong>
                    <span class="text-muted"> — ${nbComorbs} comorbidité${nbComorbs > 1 ? 's' : ''} · ${nbMeds} médicament${nbMeds > 1 ? 's' : ''}${polyLabel}</span>
                    <br><span class="small text-muted">${escapeHtml(comorbStr)}</span>
                </div>
            </div>`;
        };

        // [B] PROFIL DE RISQUE (chips de scores composites)
        const synthBuildRiskProfile = () => {
            const chipsData = [];   // [{label, level, title}]
            const pushChip = (label, level, title) => chipsData.push({ label, level, title: title || '' });
            // CHA₂DS₂-VA (recalcul léger, ESC 2024 sans sexe)
            let cha = 0;
            if (patientAge >= 75) cha += 2; else if (patientAge >= 65) cha += 1;
            if (activeComorbs.some(c => ['PAT_002', 'PAT_003'].includes(c))) cha += 1;
            if (activeComorbs.includes('PAT_005')) cha += 1;
            if (activeComorbs.some(c => ['PAT_016', 'PAT_016a', 'PAT_016b'].includes(c))) cha += 1;
            if (activeComorbs.includes('PAT_008')) cha += 2;
            if (activeComorbs.some(c => ['PAT_004', 'PAT_007'].includes(c))) cha += 1;
            if (activeComorbs.includes('PAT_006')) {
                pushChip(`CHA₂DS₂-VA ${cha}`, cha >= 2 ? 'danger' : (cha >= 1 ? 'warning' : 'success'), 'ESC 2024 — anticoag si ≥2');
            }
            // HAS-BLED
            let hb = 0;
            if (bioValues && bioValues['BIO_004'] > 0 && bioValues['BIO_004'] < 50) hb += 1;
            if (activeComorbs.includes('PAT_008')) hb += 1;
            if (patientAge > 65) hb += 1;
            const hasAINS = (activeMeds || []).some(m => /ains|ibuprof|naprox|diclof|ketoprof/i.test(m.dci + ' ' + (m.classe || '')));
            const hasAAS = (activeMeds || []).some(m => /aspirine|acetylsali|clopidogrel|prasug|ticagre/i.test(m.dci));
            if (hasAINS || hasAAS) hb += 1;
            if (activeComorbs.includes('PAT_006')) {
                pushChip(`HAS-BLED ${hb}`, hb >= 3 ? 'danger' : (hb >= 1 ? 'warning' : 'success'), 'Pisters 2010 — risque hémorragique sous anticoag');
            }
            // ACB
            if (scoreACB_global > 0) {
                const lbl = scoreACB_global >= 3 ? 'élevée' : 'modérée';
                pushChip(`ACB ${scoreACB_global} (${lbl})`, scoreACB_global >= 3 ? 'danger' : (scoreACB_global >= 1 ? 'warning' : 'success'), 'Boustani 2008 — risque cognitif/chutes');
            }
            // QT
            if (typeof maxQTLevel_global !== 'undefined' && maxQTLevel_global > 0) {
                const lvl = maxQTLevel_global >= 3 ? 'Établi (KR)' : maxQTLevel_global >= 2 ? 'Possible' : 'Conditionnel';
                pushChip(`QT ${lvl}`, maxQTLevel_global >= 3 ? 'danger' : 'warning', 'CredibleMeds');
            }
            // Polypharmacie
            const nbMeds = (activeMeds || []).length;
            if (nbMeds >= 10) pushChip(`Polypharmacie majeure ${nbMeds}`, 'danger', '≥10 médicaments');
            else if (nbMeds >= 5) pushChip(`Polypharmacie ${nbMeds}`, 'warning', '');
            // Expose pour le PDF
            synthData.riskChips = chipsData;
            if (!chipsData.length) return '';
            const chips = chipsData.map(c => `<span class="badge bg-${c.level === 'warning' ? 'warning text-dark' : c.level} me-1"${c.title ? ` title="${escapeHtml(c.title)}"` : ''}>${c.label}</span>`);
            return `<div class="card mb-2 shadow-sm">
                <div class="card-body py-2 px-3">
                    <strong class="small">🎯 Profil de risque : </strong>
                    ${chips.join(' ')}
                </div>
            </div>`;
        };

        // [I] BIO EN 1 LIGNE — anomalies les plus saillantes
        const synthBuildBioSummary = () => {
            const bv = bioValues || {};
            const issues = [];
            if (bv['BIO_004'] > 0 && bv['BIO_004'] < 60) {
                const grade = bv['BIO_004'] < 30 ? 'sévère' : bv['BIO_004'] < 45 ? 'modérée' : 'légère';
                issues.push(`<span class="badge bg-warning text-dark">DFG ${bv['BIO_004']} (IRC ${grade})</span>`);
            }
            if (bv['BIO_001'] > 0 && (bv['BIO_001'] < 3.5 || bv['BIO_001'] > 5.0)) {
                const dir = bv['BIO_001'] < 3.5 ? 'hypoK' : 'hyperK';
                const col = (bv['BIO_001'] < 3.0 || bv['BIO_001'] > 5.5) ? 'danger' : 'warning text-dark';
                issues.push(`<span class="badge bg-${col}">K+ ${bv['BIO_001']} (${dir})</span>`);
            }
            if (bv['BIO_002'] > 0 && (bv['BIO_002'] < 135 || bv['BIO_002'] > 145)) {
                const dir = bv['BIO_002'] < 135 ? 'hypoNa' : 'hyperNa';
                issues.push(`<span class="badge bg-warning text-dark">Na ${bv['BIO_002']} (${dir})</span>`);
            }
            if (bv['BIO_009'] > 0 && bv['BIO_009'] < 12) {
                const grade = bv['BIO_009'] < 8 ? 'sévère' : bv['BIO_009'] < 10 ? 'modérée' : 'légère';
                const col = bv['BIO_009'] < 10 ? 'danger' : 'warning text-dark';
                issues.push(`<span class="badge bg-${col}">Hb ${bv['BIO_009']} (anémie ${grade})</span>`);
            }
            if (bv['BIO_026'] > 0 && bv['BIO_026'] > 7) {
                const col = bv['BIO_026'] > 9 ? 'danger' : 'warning text-dark';
                issues.push(`<span class="badge bg-${col}">HbA1c ${bv['BIO_026']}% (mal équilibré)</span>`);
            }
            if (bv['BIO_031'] > 0 && bv['BIO_031'] >= 450) {
                const col = bv['BIO_031'] >= 500 ? 'danger' : 'warning text-dark';
                issues.push(`<span class="badge bg-${col}">QTc ${bv['BIO_031']} ms</span>`);
            }
            if (bv['BIO_030'] > 0 && (bv['BIO_030'] < 2 || bv['BIO_030'] > 3.5)) {
                const dir = bv['BIO_030'] < 2 ? 'sous-dosé' : 'surdosé';
                issues.push(`<span class="badge bg-warning text-dark">INR ${bv['BIO_030']} (${dir})</span>`);
            }
            if (bv['BIO_019'] > 0 && (bv['BIO_019'] < 0.4 || bv['BIO_019'] > 4)) {
                issues.push(`<span class="badge bg-warning text-dark">TSH ${bv['BIO_019']}</span>`);
            }
            if (!issues.length) return '';
            return `<div class="card mb-2 shadow-sm">
                <div class="card-body py-2 px-3">
                    <strong class="small">🧪 Biologie clé : </strong>
                    ${issues.join(' ')}
                </div>
            </div>`;
        };

        // [C] TOP ACTIONS PRIORITAIRES (mix danger éviter + initier + interact)
        const synthBuildTopActions = () => {
            const actions = [];
            // Interactions critiques en premier
            interactCritical.slice(0, 3).forEach(it => actions.push({
                icon: '🚨', txt: (it.text || '').slice(0, 130), level: 'danger', kind: 'INTERACTION'
            }));
            // Puis méd à retirer danger
            toRemove.filter(r => r.severity === 'danger').slice(0, 5).forEach(r => {
                actions.push({
                    icon: '➖', txt: `${r.dci.toUpperCase()} : ${(r.reason || 'à retirer').slice(0, 110)}`,
                    level: 'danger', kind: r.action
                });
            });
            // Puis bio danger
            bioIssues.filter(b => b.severity === 'danger').slice(0, 3).forEach(b => actions.push({
                icon: '🧪', txt: (b.titre || '').slice(0, 130), level: 'danger', kind: 'BIO'
            }));
            // Puis omissions piliers/anticoag critiques (par mots-clés)
            (toAdd || []).filter(a => /pilier|anticoag.*FA|piliers? HFrEF|sgl[mt]2|aldost/i.test(a.titre + ' ' + a.message))
                .slice(0, 3).forEach(a => actions.push({
                    icon: '➕', txt: (a.titre || '').slice(0, 130), level: 'warning', kind: 'OMISSION'
                }));
            const top = actions.slice(0, 5);
            // Expose pour le PDF
            synthData.topActions = top;
            if (!top.length) return '';
            const items = top.map((a, i) => `<li class="mb-1">
                ${a.icon} <span class="badge bg-${a.level} text-white" style="font-size:0.6em;">${a.kind}</span>
                <span class="small">${escapeHtml(a.txt)}</span>
            </li>`).join('');
            return `<div class="card mb-3 shadow-sm" style="border-left:4px solid #dc3545;">
                <div class="card-header py-2" style="background:linear-gradient(135deg,#fff3cd,#ffe69c);color:#664d03;">
                    <strong>⚡ Top ${top.length} actions prioritaires</strong>
                </div>
                <div class="card-body py-2 px-3">
                    <ol class="mb-0 ps-3">${items}</ol>
                </div>
            </div>`;
        };

        // [E] BANDEAU GLOBAL — gravité du dossier
        const synthBuildBanner = () => {
            const nbDanger = toRemove.filter(r => r.severity === 'danger').length
                + interactCritical.length
                + bioIssues.filter(b => b.severity === 'danger').length;
            const nbWarning = toRemove.filter(r => r.severity === 'warning').length
                + bioIssues.filter(b => b.severity === 'warning').length;
            const nbOmissions = (toAdd || []).length;
            let level = 'success', icon = '✅', msg = 'Dossier sans alerte critique';
            if (nbDanger >= 3) { level = 'danger'; icon = '🔴'; msg = 'Dossier à HAUT risque'; }
            else if (nbDanger >= 1) { level = 'danger'; icon = '🟠'; msg = 'Dossier avec alertes critiques'; }
            else if (nbWarning >= 3 || nbOmissions >= 3) { level = 'warning'; icon = '🟡'; msg = 'Dossier nécessitant vigilance'; }
            else if (nbWarning >= 1 || nbOmissions >= 1) { level = 'info'; icon = '🔵'; msg = 'Actions de réévaluation suggérées'; }
            // Expose pour le PDF
            synthData.banner = { level, icon, msg, nbDanger, nbWarning, nbOmissions };
            const counts = [];
            if (nbDanger > 0) counts.push(`<strong>${nbDanger} danger</strong>`);
            if (nbWarning > 0) counts.push(`${nbWarning} vigilance`);
            if (nbOmissions > 0) counts.push(`${nbOmissions} omission${nbOmissions > 1 ? 's' : ''}`);
            return `<div class="alert alert-${level === 'success' ? 'success' : level === 'info' ? 'info' : (level === 'warning' ? 'warning' : 'danger')} mb-2 py-2 px-3 shadow-sm" style="font-size:1.05em;">
                <span style="font-size:1.3em;">${icon}</span> <strong>${msg}</strong>
                ${counts.length ? '<span class="small ms-2">— ' + counts.join(' · ') + '</span>' : ''}
            </div>`;
        };

        // =====================================================
        // ── NOUVEAUTÉS Commit 2 : REGROUPEMENT MÉCANISMES + LIMITE + RX ACTIVE
        // =====================================================

        // [D] DÉTECTION DE MÉCANISMES RÉCURRENTS — fusionne N alertes du même
        // mécanisme en une seule entrée synthétique.
        const mechanismClusters = [];
        const seenMedsInClusters = new Set();
        const classifyMed = (dci) => {
            const m = (activeMeds || []).find(x => (x.dci || '').toLowerCase() === dci.toLowerCase());
            return m ? (m.classe || '') : '';
        };
        // Cluster anticholinergique : utilise scoreACB_global déjà calculé
        if (scoreACB_global >= 3) {
            const acbMeds = (activeMeds || [])
                .filter(m => m.db_ref && parseFloat(m.db_ref.acb) >= 2)
                .map(m => m.dci.toLowerCase());
            if (acbMeds.length >= 2) {
                mechanismClusters.push({
                    label: `🧠 Charge anticholinergique (ACB ${scoreACB_global})`,
                    severity: 'danger',
                    summary: `${acbMeds.length} médicaments cumulent ACB élevé → risque de confusion, chutes, déclin cognitif`,
                    meds: acbMeds.slice(0, 6),
                    advice: 'Cibler une réduction ACB <3 : prioriser remplacement par alternatives non anticholinergiques (mirabégron, sertraline, antiH2 si IPP suffit, hydroxyzine→trazodone, etc.).',
                    source: 'Boustani 2008 / Beers 2023'
                });
                acbMeds.forEach(d => seenMedsInClusters.add(d));
            }
        }
        // Cluster QT : utilise maxQTLevel_global déjà calculé
        if (typeof maxQTLevel_global !== 'undefined' && maxQTLevel_global >= 2) {
            const qtMeds = (activeMeds || [])
                .filter(m => m.db_ref && String(m.db_ref.qt_risque || '').match(/\(KR\)|\(KP\)/i))
                .map(m => m.dci.toLowerCase());
            if (qtMeds.length >= 1) {
                mechanismClusters.push({
                    label: `❤️ Charge QT-allongeante`,
                    severity: maxQTLevel_global >= 3 ? 'danger' : 'warning',
                    summary: `${qtMeds.length} médicament(s) prolongeant le QTc — risque additif de torsades de pointes`,
                    meds: qtMeds.slice(0, 6),
                    advice: 'ECG + ionogramme (K+, Mg2+) ; ne pas associer 2 QT-prolongateurs ; vérifier QTc <500 ms et corriger hypokaliémie/hypomagnésémie.',
                    source: 'CredibleMeds'
                });
                qtMeds.forEach(d => seenMedsInClusters.add(d));
            }
        }
        // Cluster FRID (chutes) : ≥3 médicaments à risque de chute
        const fridMeds = (activeMeds || [])
            .filter(m => m.db_ref && m.db_ref.scores && parseFloat(m.db_ref.scores.chute) >= 2)
            .map(m => m.dci.toLowerCase());
        if (fridMeds.length >= 3) {
            mechanismClusters.push({
                label: `🚶 Risque de chute (FRID ${fridMeds.length})`,
                severity: 'warning',
                summary: `${fridMeds.length} médicaments à risque de chute concomitants (FRID = Fall-Risk-Increasing Drugs)`,
                meds: fridMeds.slice(0, 6),
                advice: 'Évaluer indication de chaque sédatif/antihypertenseur central/BZD/opioïde ; mesurer TA couché-debout ; envisager déprescription.',
                source: 'STOPP K1-K12'
            });
            fridMeds.forEach(d => seenMedsInClusters.add(d));
        }
        // Filtrer toRemove pour retirer les méds déjà englobés dans un cluster
        // (évite l'effet "Amitriptyline listée 4 fois")
        const toRemoveFiltered = toRemove.filter(r => !seenMedsInClusters.has((r.dci || '').toLowerCase()));

        // [F] TABLEAU RX ACTIVE — médicaments groupés par grande classe
        const synthBuildActiveRx = () => {
            const meds = (activeMeds || []);
            if (meds.length === 0) return '';
            const buckets = { 'Cardiovasculaire': [], 'SNC / Psychotrope': [], 'Antidiabétique': [], 'Antalgique / AINS': [], 'Endocrine / Hormone': [], 'Gastro / IPP / Lax.': [], 'Anticoagulant / Antiagrégant': [], 'Autre': [] };
            const classify = (m) => {
                const cl = (m.classe || '').toLowerCase();
                const dci = (m.dci || '').toLowerCase();
                if (/anticoag|antiagreg|aod|avk|warfar|fluindion|acenocouma|aspirine|clopidogrel|apixaban|rivaroxaban|dabigatran|edoxaban/i.test(cl + dci)) return 'Anticoagulant / Antiagrégant';
                if (/cardio|hypertens|β-bloq|beta.?bloq|inhibiteur de l.?enzyme|iec|ara2|antagoniste.*angiotensine|diuretique|inhibiteur calcique|antiarythm|nitre|sgl?t2|arni|aldost|spironolactone/i.test(cl)) return 'Cardiovasculaire';
                if (/antidépresseur|antidepresseur|antipsychot|hypnotique|benzodiazépine|benzodiazepine|opio|antiépile|antiepile|nootro|antiparkin|iache|anticholin/i.test(cl)) return 'SNC / Psychotrope';
                if (/antidia|insuline|metformin|sulfonyl|gliptin|sglt|glp.?1/i.test(cl)) return 'Antidiabétique';
                if (/ains|paracetamol|opio|antalg|colchicine|fentanyl|morphine|tramadol|codeine|gabapent|prégaba|pregaba/i.test(cl)) return 'Antalgique / AINS';
                if (/œstro|oestro|thyro|androgène|androgene|testost|somatropi|gh\b|hormono/i.test(cl)) return 'Endocrine / Hormone';
                if (/ipp|pompe à protons|laxatif|antémét|antiemet|antiémét|antispasm|antiacid|sucralfat|alginat/i.test(cl)) return 'Gastro / IPP / Lax.';
                return 'Autre';
            };
            meds.forEach(m => buckets[classify(m)].push(m));
            const groups = Object.entries(buckets).filter(([k, v]) => v.length > 0);
            if (!groups.length) return '';
            const items = groups.map(([groupName, list]) => {
                const dcis = list.map(m => {
                    const dose = m.precisions && typeof m.precisions.dose === 'number' ? ` <span class="text-muted small">${m.precisions.dose}${m.precisions.unite || 'mg'}${m.precisions.periode ? '/' + m.precisions.periode : ''}</span>` : '';
                    return `<span class="badge bg-light text-dark border me-1 mb-1">${escapeHtml(m.dci)}${dose}</span>`;
                }).join('');
                return `<div class="mb-2"><strong class="small text-muted">${escapeHtml(groupName)} (${list.length})</strong><br>${dcis}</div>`;
            }).join('');
            return `<details class="card mb-2 shadow-sm">
                <summary class="card-header py-2 small" style="cursor:pointer;">
                    💊 <strong>Prescription active (${meds.length})</strong>
                    <span class="text-muted ms-2">— cliquer pour déplier</span>
                </summary>
                <div class="card-body py-2 px-3">${items}</div>
            </details>`;
        };

        // [H] HELPER : rendu d'une liste avec limite + bouton "voir plus"
        const renderLimited = (items, max, renderItem) => {
            if (items.length <= max) return items.map(renderItem).join('');
            const visible = items.slice(0, max).map(renderItem).join('');
            const hidden = items.slice(max).map(renderItem).join('');
            return visible + `<details class="mt-1">
                <summary class="small text-muted" style="cursor:pointer;">▾ Voir ${items.length - max} de plus…</summary>
                <div class="mt-2">${hidden}</div>
            </details>`;
        };

        // [G] SECTION ARRÊTS / SEVRAGES — lus depuis la dernière extraction de texte libre
        // (window.GeriaExtractorLastStopped populé par extractor_ui.js après applySelected).
        // Informationnel uniquement (non appliqué au state patient) — sert à alerter
        // qu'un médicament dans le compte-rendu N'EST PAS une prescription active.
        const synthBuildStoppedMeds = () => {
            const stopped = (typeof window !== 'undefined' && Array.isArray(window.GeriaExtractorLastStopped))
                ? window.GeriaExtractorLastStopped : [];
            if (!stopped.length) return '';
            const chips = stopped.slice(0, 8).map(s => {
                return `<span class="badge bg-light text-dark border me-1 mb-1" style="text-decoration:line-through;">
                    ${escapeHtml(s.dci || s.raw || '?')}
                </span>`;
            }).join('');
            const overflow = stopped.length > 8 ? `<span class="small text-muted">+${stopped.length - 8} autres</span>` : '';
            return `<div class="card mb-2 shadow-sm" style="border-left:4px solid #ffc107;">
                <div class="card-body py-2 px-3">
                    <strong class="small">🛑 Médicaments arrêtés/sevrés détectés dans le texte (${stopped.length})</strong>
                    <span class="small text-muted ms-2">— informationnel, non appliqué au state patient</span>
                    <div class="mt-1">${chips} ${overflow}</div>
                </div>
            </div>`;
        };

        // [J] HELPER : lien vers un onglet détaillé (compatible classic + modern)
        const tabLink = (tabId, label) => {
            return `<a href="#${tabId}" class="ms-2 small text-decoration-none"
                onclick="try{var t=document.getElementById('${tabId}');if(t){var bt=document.querySelector('[data-bs-target=\\'#'+'${tabId}'+'\\']');if(bt){bt.click();}else if(typeof showView==='function'){showView('${tabId}');}t.scrollIntoView({behavior:'smooth',block:'start'});}}catch(e){};return false;"
                title="Voir l'onglet détaillé">→ ${label}</a>`;
        };

        // [Y] Banner saisies aberrantes (rendu au-dessus du bandeau de gravité)
        const synthBuildAberrantBanner = () => {
            if (!synthData.aberrantInputs.length) return '';
            const items = synthData.aberrantInputs.map(a =>
                `<span class="badge bg-warning text-dark me-1" title="Plage plausible : ${escapeHtml(a.range)}">${escapeHtml(a.field)} = ${escapeHtml(a.value)}</span>`
            ).join('');
            return `<div class="alert alert-warning py-2 px-3 mb-2 shadow-sm" style="border-left:4px solid #fd7e14;">
                <strong>⚠️ Saisies hors plages plausibles (${synthData.aberrantInputs.length})</strong>
                <span class="small ms-2 text-muted">— vérifier l'unité / la valeur saisie</span>
                <div class="mt-1">${items}</div>
            </div>`;
        };

        const headerHtml = synthBuildAberrantBanner() + synthBuildBanner() + synthBuildHeader() + synthBuildRiskProfile() + synthBuildBioSummary() + synthBuildStoppedMeds() + synthBuildActiveRx() + synthBuildTopActions();

        // Bloc Mécanismes (entre TOP et sections détaillées)
        let mechanismHtml = '';
        if (mechanismClusters.length > 0) {
            mechanismHtml = `<div class="card mb-3 shadow-sm"><div class="card-header py-2" style="background:linear-gradient(135deg,#cff4fc,#9eeaf9);color:#055160;">
                <strong>🔍 Mécanismes récurrents (${mechanismClusters.length})</strong>
                <span class="small ms-2" style="opacity:0.85;">Agrégation des alertes par mécanisme partagé</span>
            </div><div class="card-body p-2">`;
            mechanismClusters.forEach(cl => {
                const medChips = cl.meds.map(d => `<span class="badge bg-light text-dark border me-1">${escapeHtml(d)}</span>`).join('');
                mechanismHtml += `<div class="border-start border-${cl.severity} border-3 ps-2 py-1 mb-2">
                    <span class="badge bg-${cl.severity} me-1" style="font-size:0.65em;">${cl.severity === 'danger' ? 'DANGER' : 'VIGILANCE'}</span>
                    <strong class="small">${cl.label}</strong>
                    ${cl.source ? ` <span class="badge bg-light text-muted border float-end" style="font-size:0.6em;">${escapeHtml(cl.source)}</span>` : ''}
                    <br><span class="small">${escapeHtml(cl.summary)}</span>
                    <div class="mt-1">${medChips}</div>
                    <em class="text-muted small d-block mt-1">${escapeHtml(cl.advice)}</em>
                </div>`;
            });
            mechanismHtml += `</div></div>`;
        }

        // ── Rendu ──
        if (toAdd.length === 0 && toRemove.length === 0 && bioIssues.length === 0 && interactCritical.length === 0) {
            synthHtml = headerHtml + '<div class="alert alert-success shadow-sm"><strong>✅ Aucune action majeure identifiée</strong><br><small>Aucune omission, aucune prescription inappropriée, aucune anomalie biologique significative.</small></div>';
        } else {
            synthHtml = headerHtml + mechanismHtml;

            // Section 1 : à AJOUTER (limite 6)
            if (toAdd.length > 0) {
                synthHtml += `<div class="card mb-3 shadow-sm"><div class="card-header py-2" style="background:linear-gradient(135deg,#d1e7dd,#a3cfbb);color:#0f5132;">
                    <strong>➕ Médicaments à ajouter (${toAdd.length})</strong>
                    <span class="small ms-2" style="opacity:0.85;">Omissions thérapeutiques identifiées</span>${tabLink('alertes-initier', 'À INITIER')}
                </div><div class="card-body p-2">`;
                synthHtml += renderLimited(toAdd, 6, a => `<div class="border-start border-success border-3 ps-2 py-1 mb-2">
                    <strong class="small">${escapeHtml(a.titre)}</strong>
                    ${a.source ? ` <span class="badge bg-light text-muted border float-end" style="font-size:0.6em;">${escapeHtml(a.source)}</span>` : ''}
                    ${a.message ? `<br><span class="small">${escapeHtml(a.message)}</span>` : ''}
                    ${a.alternatives ? `<br><em class="text-success small">Exemples : ${escapeHtml(a.alternatives)}</em>` : ''}
                </div>`);
                synthHtml += `</div></div>`;
            }

            // Section 2 : à RETIRER / SUBSTITUER (limite 8, mécanismes déjà retirés)
            if (toRemoveFiltered.length > 0) {
                const headerSuffix = (toRemove.length !== toRemoveFiltered.length) ? ` <span class="small text-muted">— ${toRemove.length - toRemoveFiltered.length} agrégé(s) ci-dessus</span>` : '';
                synthHtml += `<div class="card mb-3 shadow-sm"><div class="card-header py-2" style="background:linear-gradient(135deg,#f8d7da,#f1aeb5);color:#58151c;">
                    <strong>➖ Médicaments à retirer ou substituer (${toRemoveFiltered.length})</strong>
                    <span class="small ms-2" style="opacity:0.85;">Prescriptions inappropriées${headerSuffix}</span>${tabLink('alertes-eviter', 'À ÉVITER')}
                </div><div class="card-body p-2">`;
                synthHtml += renderLimited(toRemoveFiltered, 8, a => `<div class="border-start border-${a.severity} border-3 ps-2 py-1 mb-2">
                    <span class="badge bg-${a.severity} me-1" style="font-size:0.65em;">${a.action}</span>
                    <strong class="small">${escapeHtml(a.dci.toUpperCase())}</strong>
                    ${a.source ? ` <span class="badge bg-light text-muted border float-end" style="font-size:0.6em;">${escapeHtml(a.source)}</span>` : ''}
                    ${a.reason ? `<br><span class="small text-muted">${escapeHtml(a.reason)}</span>` : ''}
                </div>`);
                synthHtml += `</div></div>`;
            }

            // Section 3 : INTERACTIONS CRITIQUES (danger) — placée AVANT bio pour priorité visuelle
            if (interactCritical.length > 0) {
                synthHtml += `<div class="card mb-3 shadow-sm"><div class="card-header py-2" style="background:linear-gradient(135deg,#f8d7da,#f1aeb5);color:#58151c;">
                    <strong>🚨 Interactions critiques (${interactCritical.length})</strong>
                    <span class="small ms-2" style="opacity:0.85;">Co-prescriptions à risque danger</span>${tabLink('alertes-interact', 'INTERACTIONS')}
                </div><div class="card-body p-2">`;
                synthHtml += renderLimited(interactCritical, 6, it => `<div class="border-start border-danger border-3 ps-2 py-1 mb-2">
                    <span class="badge bg-danger me-1" style="font-size:0.65em;">DANGER</span>
                    <span class="small">${escapeHtml(it.text)}</span>
                </div>`);
                synthHtml += `</div></div>`;
            }

            // Section 4 : PROBLÈMES BIOLOGIQUES
            if (bioIssues.length > 0) {
                synthHtml += `<div class="card mb-3 shadow-sm"><div class="card-header py-2" style="background:linear-gradient(135deg,#fff3cd,#ffe69c);color:#664d03;">
                    <strong>🧪 Problèmes biologiques (${bioIssues.length})</strong>
                    <span class="small ms-2" style="opacity:0.85;">Anomalies à prendre en compte</span>${tabLink('alertes-bio', 'BIO')}
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

        // Lier les structures partagées écran ↔ PDF (banner / topActions / riskChips
        // déjà alimentés par les synthBuild*).
        synthData.mechanismClusters = mechanismClusters;
        synthData.interactCritical = interactCritical;
        synthData.bioIssues = bioIssues;
        synthData.toAdd = toAdd;
        synthData.toRemoveFiltered = toRemoveFiltered;
        _registry.synthData = synthData;
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
