/* ============================================================================
 * app_paam.js — Onglet PAAM (Prise en charge de l'Auto-Administration des
 * Médicaments) — référentiel CH Cosne-Cours-sur-Loire V2
 *
 * Implémente :
 *   - Grille d'évaluation 25 critères × 5 domaines (Annexe 1 du document CH)
 *   - Score temps réel + décision automatique selon seuils (≥40 ok, 30-39
 *     partielle, <30 refusée)
 *   - Pré-remplissage best-effort depuis les autres saisies de l'app
 *     (MMSE, dysphagie, delirium, nb médicaments, stupéfiants, MTE)
 *   - Sérialisation/restauration pour export JSON patient
 *   - Génération HTML de l'annexe PDF (intégrable au PDF synthèse ou export
 *     PDF PAAM autonome)
 * ============================================================================ */
(function () {
    'use strict';

    // ---- 1. Référentiel des 25 critères ------------------------------------
    const PAAM_DOMAINS = [
        { id: 'cognitif',      titre: 'Domaine 1 — Capacités cognitives' },
        { id: 'connaissances', titre: 'Domaine 2 — Connaissances sur le traitement' },
        { id: 'fonctionnel',   titre: 'Domaine 3 — Capacités fonctionnelles' },
        { id: 'comportement',  titre: 'Domaine 4 — Comportement / motivation' },
        { id: 'pharmaceutique',titre: 'Domaine 5 — Compatibilité pharmaceutique' }
    ];
    const PAAM_GRID = [
        // Domaine 1 — Cognitif
        { id: '1.1', dom: 'cognitif',      libelle: 'MMSE (≥ 20/30 recommandé)' },
        { id: '1.2', dom: 'cognitif',      libelle: 'Orientation temporelle' },
        { id: '1.3', dom: 'cognitif',      libelle: 'Compréhension consigne 3 étapes' },
        { id: '1.4', dom: 'cognitif',      libelle: 'Mémoire des horaires de prise' },
        { id: '1.5', dom: 'cognitif',      libelle: 'Absence de confusion (CAM)' },
        // Domaine 2 — Connaissances
        { id: '2.1', dom: 'connaissances', libelle: 'Nom des médicaments' },
        { id: '2.2', dom: 'connaissances', libelle: 'Indications' },
        { id: '2.3', dom: 'connaissances', libelle: 'Moments de prise' },
        { id: '2.4', dom: 'connaissances', libelle: 'Effets indésirables' },
        { id: '2.5', dom: 'connaissances', libelle: "Sait quand appeler l'IDE" },
        // Domaine 3 — Fonctionnel
        { id: '3.1', dom: 'fonctionnel',   libelle: 'Acuité visuelle suffisante' },
        { id: '3.2', dom: 'fonctionnel',   libelle: 'Dextérité manuelle (pilulier test)' },
        { id: '3.3', dom: 'fonctionnel',   libelle: 'Capacité de déglutition' },
        { id: '3.4', dom: 'fonctionnel',   libelle: 'Autonomie ADL (≥ 4/6)' },
        { id: '3.5', dom: 'fonctionnel',   libelle: 'Capacité à écrire / cocher' },
        // Domaine 4 — Comportement
        { id: '4.1', dom: 'comportement',  libelle: 'Souhait exprimé' },
        { id: '4.2', dom: 'comportement',  libelle: 'Absence de troubles du comportement' },
        { id: '4.3', dom: 'comportement',  libelle: 'Absence de mésusage connu' },
        { id: '4.4', dom: 'comportement',  libelle: "Absence d'idées suicidaires" },
        { id: '4.5', dom: 'comportement',  libelle: 'Observance antérieure' },
        // Domaine 5 — Pharmaceutique
        { id: '5.1', dom: 'pharmaceutique',libelle: 'Nombre de médicaments compatible' },
        { id: '5.2', dom: 'pharmaceutique',libelle: 'Absence de stupéfiants dans le périmètre' },
        { id: '5.3', dom: 'pharmaceutique',libelle: 'Absence de médicaments à MTE non compatibles' },
        { id: '5.4', dom: 'pharmaceutique',libelle: 'Formes galéniques adaptées' },
        { id: '5.5', dom: 'pharmaceutique',libelle: 'Stabilité en pilulier vérifiée' }
    ];

    // Marge thérapeutique étroite : familles incompatibles avec la PAAM sans
    // décision médicale argumentée tracée (cf. § 2 procédure CH).
    const _MTE_PATTERNS = /lithium|warfarine|fluindione|acenocoumarol|acénocoumarol|digoxine|theophylline|théophylline|carbamazepine|carbamazépine|phenytoine|phénytoïne|valproate|ciclosporine|tacrolimus/i;
    // Stupéfiants/assimilés explicitement exclus du périmètre PAAM.
    const _STUPEFIANTS_PATTERNS = /\bmorphine\b|oxycodone|fentanyl|methadone|méthadone|hydromorphone|buprenorphine|buprénorphine|ketamine|kétamine|pethidine|p[eé]thidine|tapentadol/i;

    // ---- 2. Modèle de données globale --------------------------------------
    function _emptyData() {
        const scores = {};
        const observations = {};
        PAAM_GRID.forEach(c => { scores[c.id] = null; observations[c.id] = ''; });
        return {
            // Identification
            unite: '', chambre: '', dateEval: '',
            // Grille
            scores: scores,
            scoresAuto: {},     // { 'X.Y': true } pour les critères pré-remplis
            observations: observations,
            // Décision
            decision: '',                // 'totale' | 'partielle' | 'refusee' | ''
            medicamentsConcernes: '',    // si partielle
            motif: '',                   // si refusée
            reevalDate: '',              // date prochaine réévaluation
            // Signataires
            medecinNom: '', medecinDate: '',
            pharmacienNom: '', pharmacienDate: '',
            ideNom: '', ideDate: '',
            // Préférence PDF
            includeInPdf: false
        };
    }
    window.paamData = window.paamData || _emptyData();

    function paamReset() {
        window.paamData = _emptyData();
        // Refresh l'onglet si déjà rendu
        const wrap = document.getElementById('paam-container');
        if (wrap) renderPaamTab();
    }

    // ---- 3. Pré-remplissage best-effort depuis l'app -----------------------
    // Ne remplit QUE les critères jamais saisis manuellement (scores[id] === null
    // OU déjà marqués comme auto). Toute saisie utilisateur désactive l'auto
    // sur ce critère (cf. _setScore qui supprime de scoresAuto).
    function paamAutofill() {
        const d = window.paamData;
        const _getVal = id => { const el = document.getElementById(id); if (!el) return ''; return el.value || ''; };
        const _isChk = id => { const el = document.getElementById(id); return !!(el && el.checked); };
        const _setAuto = (cid, val) => {
            if (d.scores[cid] != null && !d.scoresAuto[cid]) return; // surcharge utilisateur prioritaire
            d.scores[cid] = val;
            d.scoresAuto[cid] = true;
        };

        // 1.1 MMSE : ≥ 20 → 2 ; 15-19 → 1 ; < 15 → 0
        const mmse = parseFloat(_getVal('scoreMMSE'));
        if (!isNaN(mmse) && mmse > 0) _setAuto('1.1', mmse >= 20 ? 2 : (mmse >= 15 ? 1 : 0));

        // 1.5 Absence de confusion : delirium coché → 0 ; non coché → 2
        // (on ne pré-remplit que si la case délirium est cochée, signal positif clair)
        if (_isChk('chkDelirium')) _setAuto('1.5', 0);

        // 3.3 Déglutition : dysphagie cochée → 0
        if (_isChk('chkDysphagie')) _setAuto('3.3', 0);

        // 3.4 ADL : si un champ scoreADL existe (best-effort). Seuil procédure : ≥ 4/6.
        const adl = parseFloat(_getVal('scoreADL'));
        if (!isNaN(adl) && adl > 0) _setAuto('3.4', adl >= 4 ? 2 : (adl >= 2 ? 1 : 0));

        // 5.1 Nombre de médicaments : ≤ 8 → 2 ; 9-12 → 1 ; > 12 → 0
        const nbMeds = (typeof activeMeds !== 'undefined' && Array.isArray(activeMeds)) ? activeMeds.length : 0;
        if (nbMeds > 0) _setAuto('5.1', nbMeds <= 8 ? 2 : (nbMeds <= 12 ? 1 : 0));

        // 5.2 Absence stupéfiants : présence d'un stupéfiant → 0, sinon 2
        if (typeof activeMeds !== 'undefined' && Array.isArray(activeMeds)) {
            const hasStup = activeMeds.some(m => _STUPEFIANTS_PATTERNS.test(m.dci || '') || _STUPEFIANTS_PATTERNS.test(m.classe || ''));
            _setAuto('5.2', hasStup ? 0 : 2);
            // 5.3 Absence MTE : présence d'un MTE → 0 ; sinon 2
            const hasMTE = activeMeds.some(m => _MTE_PATTERNS.test(m.dci || '') || _MTE_PATTERNS.test(m.classe || ''));
            _setAuto('5.3', hasMTE ? 0 : 2);
        }
    }

    // ---- 4. Calcul des scores ----------------------------------------------
    function paamComputeScores() {
        const d = window.paamData;
        const byDom = {};
        PAAM_DOMAINS.forEach(dom => { byDom[dom.id] = { score: 0, max: 0 }; });
        let total = 0, complets = 0;
        PAAM_GRID.forEach(c => {
            const v = d.scores[c.id];
            byDom[c.dom].max += 2;
            if (v != null) {
                byDom[c.dom].score += Number(v);
                total += Number(v);
                complets++;
            }
        });
        let decisionAuto = '';
        if (complets === PAAM_GRID.length) {
            if (total >= 40) decisionAuto = 'totale';
            else if (total >= 30) decisionAuto = 'partielle';
            else decisionAuto = 'refusee';
        }
        return { byDom, total, max: 50, complets, totalCriteres: PAAM_GRID.length, decisionAuto };
    }

    // ---- 5. Rendu de l'onglet ----------------------------------------------
    function _decisionBadge(decisionAuto, complets, total) {
        if (complets === 0) return '<span class="badge bg-secondary">À évaluer</span>';
        if (complets < PAAM_GRID.length) {
            const restants = PAAM_GRID.length - complets;
            return `<span class="badge bg-info">En cours — ${complets}/${PAAM_GRID.length} critères, score partiel ${total}/50 (reste ${restants})</span>`;
        }
        if (decisionAuto === 'totale')    return '<span class="badge bg-success">✅ PAAM autorisée (totale)</span>';
        if (decisionAuto === 'partielle') return '<span class="badge bg-warning text-dark">⚠ PAAM partielle ou surveillance renforcée</span>';
        if (decisionAuto === 'refusee')   return '<span class="badge bg-danger">❌ PAAM non autorisée</span>';
        return '';
    }

    function renderPaamTab() {
        const wrap = document.getElementById('paam-container');
        if (!wrap) return;
        const d = window.paamData;
        const compute = paamComputeScores();

        // En-tête identification + toggle PDF
        let html = `
        <div class="card mb-3"><div class="card-body">
            <h5 class="card-title">📋 Procédure PAAM — Évaluation de la capacité d'auto-administration</h5>
            <p class="text-muted small mb-3">Référentiel : <em>Procédure PRO-PHA-PAAM-001 — CH Cosne-Cours-sur-Loire</em>. Cotation : 0 = Non acquis · 1 = Partiellement acquis · 2 = Acquis.</p>
            <div class="row g-2">
                <div class="col-md-4"><label class="fw-bold small">Unité</label><input type="text" class="form-control form-control-sm" id="paamUnite" value="${_esc(d.unite)}" oninput="window.paamSet('unite', this.value)"></div>
                <div class="col-md-3"><label class="fw-bold small">Chambre</label><input type="text" class="form-control form-control-sm" id="paamChambre" value="${_esc(d.chambre)}" oninput="window.paamSet('chambre', this.value)"></div>
                <div class="col-md-3"><label class="fw-bold small">Date d'évaluation</label><input type="date" class="form-control form-control-sm" id="paamDateEval" value="${_esc(d.dateEval)}" oninput="window.paamSet('dateEval', this.value)"></div>
                <div class="col-md-2 d-flex align-items-end"><button type="button" class="btn btn-sm btn-outline-primary w-100" onclick="window.paamAutofillRefresh()" title="Recalculer les pré-remplissages depuis l'analyse"> Pré-remplir</button></div>
            </div>
            <div class="form-check mt-3">
                <input type="checkbox" class="form-check-input" id="paamIncludePdf" ${d.includeInPdf ? 'checked' : ''} onchange="window.paamSet('includeInPdf', this.checked)">
                <label class="form-check-label small" for="paamIncludePdf"><strong>Inclure la PAAM dans l'export PDF GeriaAssist</strong> (sinon utiliser le bouton « PDF PAAM seul »)</label>
            </div>
        </div></div>`;

        // Synthèse score + décision auto (épinglée en haut)
        html += `<div class="card mb-3 border-primary"><div class="card-body py-2">
            <div class="row align-items-center">
                <div class="col-md-7">
                    <strong>Score total :</strong> ${compute.total} / ${compute.max}
                    <span class="text-muted small ms-2">(${compute.complets}/${compute.totalCriteres} critères renseignés)</span>
                    <div class="small mt-1">`;
        PAAM_DOMAINS.forEach(dom => {
            const s = compute.byDom[dom.id];
            html += `<span class="me-3"><strong>${_domShort(dom.id)} :</strong> ${s.score}/${s.max}</span>`;
        });
        html += `</div></div>
                <div class="col-md-5 text-md-end">${_decisionBadge(compute.decisionAuto, compute.complets, compute.total)}</div>
            </div>
        </div></div>`;

        // Grille par domaine
        PAAM_DOMAINS.forEach(dom => {
            html += `<div class="card mb-2"><div class="card-body py-2">
                <h6 class="text-primary mb-2">${_esc(dom.titre)}</h6>
                <div class="table-responsive"><table class="table table-sm table-borderless mb-0" style="font-size:0.875rem;">
                <thead><tr><th style="width:35px;">#</th><th>Critère</th><th style="width:240px;">Cotation</th><th>Observations</th></tr></thead><tbody>`;
            PAAM_GRID.filter(c => c.dom === dom.id).forEach(c => {
                const v = d.scores[c.id];
                const isAuto = !!d.scoresAuto[c.id];
                const autoTag = isAuto ? ' <span class="badge bg-info-subtle text-info border border-info" title="Valeur pré-remplie automatiquement — modifiable">auto</span>' : '';
                html += `<tr>
                    <td class="text-muted small">${c.id}</td>
                    <td>${_esc(c.libelle)}${autoTag}</td>
                    <td><div class="btn-group btn-group-sm" role="group" aria-label="Score ${c.id}">
                        <input type="radio" class="btn-check" name="paam_${c.id}" id="paam_${c.id}_0" autocomplete="off" ${v===0?'checked':''} onchange="window.paamSetScore('${c.id}', 0)">
                        <label class="btn btn-outline-danger" for="paam_${c.id}_0">0</label>
                        <input type="radio" class="btn-check" name="paam_${c.id}" id="paam_${c.id}_1" autocomplete="off" ${v===1?'checked':''} onchange="window.paamSetScore('${c.id}', 1)">
                        <label class="btn btn-outline-warning" for="paam_${c.id}_1">1</label>
                        <input type="radio" class="btn-check" name="paam_${c.id}" id="paam_${c.id}_2" autocomplete="off" ${v===2?'checked':''} onchange="window.paamSetScore('${c.id}', 2)">
                        <label class="btn btn-outline-success" for="paam_${c.id}_2">2</label>
                        <button type="button" class="btn btn-outline-secondary" title="Effacer" onclick="window.paamSetScore('${c.id}', null)">×</button>
                    </div></td>
                    <td><input type="text" class="form-control form-control-sm" placeholder="optionnel" value="${_esc(d.observations[c.id]||'')}" oninput="window.paamSetObs('${c.id}', this.value)"></td>
                </tr>`;
            });
            html += `</tbody></table></div></div></div>`;
        });

        // Décision collégiale
        html += `<div class="card mb-3"><div class="card-body">
            <h6 class="text-primary">Décision collégiale</h6>
            <div class="row g-2">
                <div class="col-md-4">
                    <div class="form-check"><input type="radio" name="paamDecision" id="paamDecTotale" class="form-check-input" ${d.decision==='totale'?'checked':''} onchange="window.paamSet('decision','totale')"><label class="form-check-label" for="paamDecTotale">✅ PAAM autorisée (totale)</label></div>
                    <div class="form-check"><input type="radio" name="paamDecision" id="paamDecPartielle" class="form-check-input" ${d.decision==='partielle'?'checked':''} onchange="window.paamSet('decision','partielle')"><label class="form-check-label" for="paamDecPartielle">⚠ PAAM autorisée (partielle)</label></div>
                    <div class="form-check"><input type="radio" name="paamDecision" id="paamDecRefus" class="form-check-input" ${d.decision==='refusee'?'checked':''} onchange="window.paamSet('decision','refusee')"><label class="form-check-label" for="paamDecRefus">❌ PAAM non autorisée</label></div>
                </div>
                <div class="col-md-8">
                    <label class="fw-bold small">${d.decision==='partielle' ? 'Médicaments concernés' : (d.decision==='refusee' ? 'Motif' : 'Médicaments concernés ou motif')}</label>
                    <textarea class="form-control form-control-sm" rows="2" placeholder="Liste des médicaments concernés (si partielle) ou motif du refus (si non autorisée)" oninput="window.paamSet(${d.decision==='refusee' ? "'motif'" : "'medicamentsConcernes'"}, this.value)">${_esc(d.decision==='refusee' ? d.motif : d.medicamentsConcernes)}</textarea>
                    <label class="fw-bold small mt-2">Prochaine réévaluation</label>
                    <input type="date" class="form-control form-control-sm" value="${_esc(d.reevalDate)}" oninput="window.paamSet('reevalDate', this.value)">
                </div>
            </div>
        </div></div>`;

        // Signataires
        html += `<div class="card mb-3"><div class="card-body">
            <h6 class="text-primary">Signataires (décision collégiale tracée)</h6>
            <div class="row g-2">
                <div class="col-md-4">
                    <label class="fw-bold small">Médecin (nom)</label>
                    <input type="text" class="form-control form-control-sm" value="${_esc(d.medecinNom)}" oninput="window.paamSet('medecinNom', this.value)">
                    <label class="fw-bold small mt-1">Date</label>
                    <input type="date" class="form-control form-control-sm" value="${_esc(d.medecinDate)}" oninput="window.paamSet('medecinDate', this.value)">
                </div>
                <div class="col-md-4">
                    <label class="fw-bold small">Pharmacien (nom)</label>
                    <input type="text" class="form-control form-control-sm" value="${_esc(d.pharmacienNom)}" oninput="window.paamSet('pharmacienNom', this.value)">
                    <label class="fw-bold small mt-1">Date</label>
                    <input type="date" class="form-control form-control-sm" value="${_esc(d.pharmacienDate)}" oninput="window.paamSet('pharmacienDate', this.value)">
                </div>
                <div class="col-md-4">
                    <label class="fw-bold small">IDE (nom)</label>
                    <input type="text" class="form-control form-control-sm" value="${_esc(d.ideNom)}" oninput="window.paamSet('ideNom', this.value)">
                    <label class="fw-bold small mt-1">Date</label>
                    <input type="date" class="form-control form-control-sm" value="${_esc(d.ideDate)}" oninput="window.paamSet('ideDate', this.value)">
                </div>
            </div>
            <div class="mt-3 text-end">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="window.exporterPaamPDF()" title="PDF dédié PAAM (Annexe 1 du document du CH)">📄 Export PDF PAAM seul</button>
            </div>
        </div></div>`;

        wrap.innerHTML = html;
    }

    function _domShort(id) {
        return { cognitif:'Cog.', connaissances:'Conn.', fonctionnel:'Fonct.', comportement:'Comport.', pharmaceutique:'Pharma.' }[id] || id;
    }
    function _esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    // ---- 6. Setters (déclarés via window pour les onclick/oninput inline) --
    window.paamSet = function (key, value) {
        if (window.paamData && key in window.paamData) {
            window.paamData[key] = value;
            renderPaamTab();
        }
    };
    window.paamSetScore = function (cid, value) {
        if (!window.paamData.scores || !(cid in window.paamData.scores)) return;
        window.paamData.scores[cid] = (value === null ? null : Number(value));
        // Toute saisie utilisateur retire le tag "auto"
        if (window.paamData.scoresAuto) delete window.paamData.scoresAuto[cid];
        renderPaamTab();
    };
    window.paamSetObs = function (cid, value) {
        if (!window.paamData.observations || !(cid in window.paamData.observations)) return;
        // Pas de re-render pour éviter de perdre le focus — la valeur est juste stockée
        window.paamData.observations[cid] = value;
    };
    window.paamAutofillRefresh = function () {
        paamAutofill();
        renderPaamTab();
    };

    // ---- 7. Sérialisation pour export/import JSON --------------------------
    window.paamSerialize = function () { return JSON.parse(JSON.stringify(window.paamData || _emptyData())); };
    window.paamRestore   = function (saved) {
        if (!saved || typeof saved !== 'object') return;
        const base = _emptyData();
        // Merge prudent — on n'écrase que les clés connues, on garde la structure attendue
        Object.keys(base).forEach(k => {
            if (saved[k] != null) base[k] = saved[k];
        });
        // Conformer les sous-objets scores/observations à la grille (au cas où la grille évoluerait)
        const fixedScores = {}, fixedObs = {}, fixedAuto = {};
        PAAM_GRID.forEach(c => {
            fixedScores[c.id] = (base.scores && c.id in base.scores) ? base.scores[c.id] : null;
            fixedObs[c.id]    = (base.observations && c.id in base.observations) ? base.observations[c.id] : '';
            if (base.scoresAuto && base.scoresAuto[c.id]) fixedAuto[c.id] = true;
        });
        base.scores = fixedScores; base.observations = fixedObs; base.scoresAuto = fixedAuto;
        window.paamData = base;
        const wrap = document.getElementById('paam-container');
        if (wrap) renderPaamTab();
    };

    // ---- 8. Construction du HTML PDF (Annexe 1 fidèle au document CH) -----
    function _buildPaamPdfHtml(opts) {
        opts = opts || {};
        const standalone = !!opts.standalone;
        const d = window.paamData;
        const compute = paamComputeScores();
        const nom = (document.getElementById('patientNom')?.value || '').trim();
        const age = (document.getElementById('patientAge')?.value || '').trim();
        const sexe = (document.getElementById('patientSexe')?.value || '').trim();
        const today = new Date().toLocaleDateString('fr-FR');
        const decisionLbl = ({totale:'✅ PAAM autorisée (totale)', partielle:'⚠ PAAM partielle / surveillance renforcée', refusee:'❌ PAAM non autorisée'}[d.decision]) || compute.decisionAuto ? ({totale:'✅ PAAM autorisée (totale)', partielle:'⚠ PAAM partielle / surveillance renforcée', refusee:'❌ PAAM non autorisée'}[compute.decisionAuto] + ' (calcul auto)') : '— en cours d\'évaluation —';

        let html = `<div class="pdf-block" style="page-break-before:${standalone?'auto':'always'};font-family:Arial,sans-serif;color:#222;">
            <div style="text-align:center;border-bottom:2px solid #0d6efd;padding-bottom:6px;margin-bottom:8px;">
                <div style="font-size:14px;font-weight:700;color:#0d6efd;">PROCÉDURE PAAM — GRILLE D'ÉVALUATION</div>
                <div style="font-size:9px;color:#666;">Annexe 1 — Procédure PRO-PHA-PAAM-001 (CH Cosne-Cours-sur-Loire)</div>
            </div>
            <div style="font-size:10px;margin-bottom:6px;">
                <strong>Résident :</strong> ${_esc(nom) || '...........................'}
                &nbsp; <strong>Âge :</strong> ${_esc(age)}
                &nbsp; <strong>Sexe :</strong> ${_esc(sexe)}
                &nbsp; <strong>Unité :</strong> ${_esc(d.unite) || '..............'}
                &nbsp; <strong>Chambre :</strong> ${_esc(d.chambre) || '......'}
                &nbsp; <strong>Date :</strong> ${_esc(d.dateEval) || today}
            </div>
            <div style="font-size:8.5px;color:#555;margin-bottom:4px;"><em>Cotation : 0 = Non acquis · 1 = Partiellement acquis · 2 = Acquis</em></div>
            <table style="width:100%;border-collapse:collapse;font-size:8.5px;">
                <thead><tr style="background:#e7f1ff;">
                    <th style="border:1px solid #999;padding:2px 4px;text-align:left;width:30px;">N°</th>
                    <th style="border:1px solid #999;padding:2px 4px;text-align:left;">Critère</th>
                    <th style="border:1px solid #999;padding:2px 4px;text-align:center;width:35px;">Score</th>
                    <th style="border:1px solid #999;padding:2px 4px;text-align:left;">Observations</th>
                </tr></thead><tbody>`;
        PAAM_DOMAINS.forEach(dom => {
            html += `<tr style="background:#f0f0f0;"><td colspan="4" style="border:1px solid #999;padding:2px 4px;font-weight:700;color:#0d6efd;">${_esc(dom.titre)}</td></tr>`;
            PAAM_GRID.filter(c => c.dom === dom.id).forEach(c => {
                const v = d.scores[c.id];
                const vTxt = (v == null ? '' : String(v));
                html += `<tr>
                    <td style="border:1px solid #999;padding:2px 4px;">${c.id}</td>
                    <td style="border:1px solid #999;padding:2px 4px;">${_esc(c.libelle)}</td>
                    <td style="border:1px solid #999;padding:2px 4px;text-align:center;font-weight:700;">${vTxt}</td>
                    <td style="border:1px solid #999;padding:2px 4px;color:#555;">${_esc(d.observations[c.id]||'')}</td>
                </tr>`;
            });
            const s = compute.byDom[dom.id];
            html += `<tr><td colspan="2" style="border:1px solid #999;padding:2px 4px;text-align:right;"><em>Sous-total ${_esc(dom.titre.split('—')[0].trim())}</em></td><td style="border:1px solid #999;padding:2px 4px;text-align:center;font-weight:700;">${s.score}/${s.max}</td><td style="border:1px solid #999;"></td></tr>`;
        });
        html += `</tbody></table>`;

        // Score total + décision
        html += `<table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:6px;">
            <tr><td style="border:1px solid #999;padding:4px 6px;background:#e7f1ff;font-weight:700;width:200px;">SCORE TOTAL</td>
                <td style="border:1px solid #999;padding:4px 6px;font-weight:700;font-size:12px;">${compute.total} / ${compute.max}</td></tr>
            <tr><td style="border:1px solid #999;padding:4px 6px;background:#e7f1ff;font-weight:700;">DÉCISION COLLÉGIALE</td>
                <td style="border:1px solid #999;padding:4px 6px;font-weight:700;">${_esc(decisionLbl)}</td></tr>`;
        if (d.decision === 'partielle' && d.medicamentsConcernes) {
            html += `<tr><td style="border:1px solid #999;padding:4px 6px;">Médicaments concernés</td><td style="border:1px solid #999;padding:4px 6px;">${_esc(d.medicamentsConcernes)}</td></tr>`;
        }
        if (d.decision === 'refusee' && d.motif) {
            html += `<tr><td style="border:1px solid #999;padding:4px 6px;">Motif</td><td style="border:1px solid #999;padding:4px 6px;">${_esc(d.motif)}</td></tr>`;
        }
        if (d.reevalDate) {
            html += `<tr><td style="border:1px solid #999;padding:4px 6px;">Prochaine réévaluation</td><td style="border:1px solid #999;padding:4px 6px;">${_esc(d.reevalDate)}</td></tr>`;
        }
        html += `</table>`;

        // Signataires (le PDF imprime les noms et laisse une zone signature manuscrite)
        html += `<table style="width:100%;border-collapse:collapse;font-size:9px;margin-top:8px;">
            <thead><tr style="background:#e7f1ff;">
                <th style="border:1px solid #999;padding:3px 4px;width:33%;">Médecin</th>
                <th style="border:1px solid #999;padding:3px 4px;width:33%;">Pharmacien</th>
                <th style="border:1px solid #999;padding:3px 4px;width:33%;">IDE</th>
            </tr></thead><tbody>
            <tr style="height:50px;vertical-align:top;">
                <td style="border:1px solid #999;padding:4px;"><strong>Nom :</strong> ${_esc(d.medecinNom)}<br><strong>Date :</strong> ${_esc(d.medecinDate)}<br><em style="color:#777;">Signature :</em></td>
                <td style="border:1px solid #999;padding:4px;"><strong>Nom :</strong> ${_esc(d.pharmacienNom)}<br><strong>Date :</strong> ${_esc(d.pharmacienDate)}<br><em style="color:#777;">Signature :</em></td>
                <td style="border:1px solid #999;padding:4px;"><strong>Nom :</strong> ${_esc(d.ideNom)}<br><strong>Date :</strong> ${_esc(d.ideDate)}<br><em style="color:#777;">Signature :</em></td>
            </tr></tbody></table>
            <div style="font-size:7px;color:#aaa;text-align:center;margin-top:6px;">Généré par GeriaAssist — Procédure PAAM CH Cosne-Cours-sur-Loire — Usage professionnel</div>
        </div>`;
        return html;
    }
    window.buildPaamPdfHtml = _buildPaamPdfHtml;

    // ---- 9. Export PDF PAAM autonome ---------------------------------------
    window.exporterPaamPDF = function () {
        if (typeof html2pdf === 'undefined') {
            (window.GeriaLog || console).error('html2pdf non chargé');
            alert('Erreur : bibliothèque PDF non chargée. Recharge la page.');
            return;
        }
        const content = document.createElement('div');
        content.innerHTML = _buildPaamPdfHtml({ standalone: true });
        const nom = (document.getElementById('patientNom')?.value || 'Patient').replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ_ -]/g, '');
        html2pdf().set({
            margin: [8, 6, 10, 6],
            filename: 'GeriaAssist_PAAM_' + nom + '_' + new Date().toISOString().slice(0, 10) + '.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'], avoid: '.pdf-block' }
        }).from(content).save();
    };

    // ---- 10. Initialisation ------------------------------------------------
    function _init() {
        const wrap = document.getElementById('paam-container');
        if (!wrap) return; // onglet absent (ex. autre page) → no-op
        // Auto-fill initial (best-effort, ne remplace pas une saisie utilisateur).
        paamAutofill();
        renderPaamTab();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
    else _init();

    // Exposer publiquement
    window.paamReset = paamReset;
    window.paamRenderTab = renderPaamTab;
    window.paamComputeScores = paamComputeScores;
    window.PAAM_GRID = PAAM_GRID;
    window.PAAM_DOMAINS = PAAM_DOMAINS;
})();
