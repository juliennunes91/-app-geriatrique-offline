/* ============================================================================
 * app_conciliation.js — Onglet « Avis pharma » (Synthèse pharmaceutique
 * gériatrique)
 *
 * Synthèse pharmaceutique globale du sujet âgé : le pharmacien passe en revue
 * l'ordonnance et PROPOSE au prescripteur des changements (maintien /
 * modification / ajout / arrêt / substitution), avec justification.
 * Référentiels : SFPC (intervention pharmaceutique, bilan de médication),
 * STOPP/START. (NB : ce n'est PAS une conciliation médicamenteuse au sens du
 * rapprochement de listes aux transitions ; les identifiants internes
 * `conciliation*` sont conservés pour la stabilité du code.)
 *
 * Structure « liste unique + statut » :
 *   Médicament | Posologie | Statut (Maintien / Modification / Ajout / Arrêt /
 *   Substitution) | Commentaire.
 *
 * Implémente (jumeau de app_paam.js) :
 *   - Pré-remplissage best-effort depuis l'ordonnance active (activeMeds),
 *     statut « Maintien » par défaut, non destructif.
 *   - Sérialisation/restauration pour export/import JSON patient.
 *   - Export PDF autonome (« PDF Synthèse pharma seul ») + intégration au PDF
 *     synthèse GeriaAssist via un toggle.
 * ============================================================================ */
(function () {
    'use strict';

    // ---- 1. Référentiel des statuts ----------------------------------------
    const STATUTS = [
        { v: 'maintien',     lbl: 'Maintien',     cls: 'success' },
        { v: 'modification', lbl: 'Modification', cls: 'warning' },
        { v: 'ajout',        lbl: 'Ajout',        cls: 'primary' },
        { v: 'arret',        lbl: 'Arrêt',        cls: 'danger'  },
        { v: 'substitution', lbl: 'Substitution', cls: 'info'    }
    ];

    let _seq = 1; // identifiant monotone des lignes (stable pour les setters)

    // ---- 2. Modèle de données globale --------------------------------------
    function _emptyData() {
        return { dateConcil: '', type: '', lignes: [], discussion: '', includeInPdf: true };
    }
    window.conciliationData = window.conciliationData || _emptyData();

    function _newLine(o) {
        o = o || {};
        return {
            id: _seq++,
            medicament: o.medicament || '',
            posologie: o.posologie || '',
            statut: o.statut || 'maintien',
            substitutVers: o.substitutVers || '',  // médicament de remplacement (statut « substitution »)
            commentaire: o.commentaire || '',
            auto: !!o.auto
        };
    }

    function conciliationReset() {
        window.conciliationData = _emptyData();
        const wrap = document.getElementById('conciliation-container');
        if (wrap) { conciliationAutofill(); renderConciliationTab(); }
    }

    // ---- 3. Pré-remplissage best-effort (non destructif) -------------------
    // Ajoute chaque médicament actif absent de la grille (statut « Maintien »).
    // Ne touche jamais une ligne existante (saisie utilisateur préservée).
    function conciliationAutofill() {
        const d = window.conciliationData;
        if (typeof activeMeds === 'undefined' || !Array.isArray(activeMeds)) return;
        const norm = s => String(s || '').trim().toLowerCase();
        const present = new Set(d.lignes.map(l => norm(l.medicament)));
        activeMeds.forEach(m => {
            const nom = m.dci || m.label || '';
            if (!nom || present.has(norm(nom))) return;
            d.lignes.push(_newLine({ medicament: nom, statut: 'maintien', auto: true }));
            present.add(norm(nom));
        });
    }

    // ---- 4. Utilitaires -----------------------------------------------------
    function _esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function _statutSelect(line) {
        const opts = STATUTS.map(s => `<option value="${s.v}" ${line.statut === s.v ? 'selected' : ''}>${s.lbl}</option>`).join('');
        return `<select class="form-select form-select-sm" aria-label="Statut" onchange="window.conciliationSetLine(${line.id},'statut',this.value)">${opts}</select>`;
    }

    // ---- 5. Rendu de l'onglet ----------------------------------------------
    function renderConciliationTab() {
        const wrap = document.getElementById('conciliation-container');
        if (!wrap) return;
        const d = window.conciliationData;
        const counts = {}; STATUTS.forEach(s => counts[s.v] = 0);
        d.lignes.forEach(l => { if (counts[l.statut] != null) counts[l.statut]++; });

        let html = `
        <div class="card mb-3"><div class="card-body">
            <h5 class="card-title">💊 Synthèse pharmaceutique gériatrique</h5>
            <p class="text-muted small mb-3">Propositions d'optimisation thérapeutique adressées au prescripteur (référentiels <em>SFPC</em> — intervention pharmaceutique / bilan de médication, <em>STOPP/START</em>). Proposition ligne par ligne : maintien, modification, ajout, arrêt, substitution.</p>
            <div class="row g-2">
                <div class="col-md-4"><label class="fw-bold small">Date de la synthèse</label><input type="date" class="form-control form-control-sm" value="${_esc(d.dateConcil)}" oninput="window.conciliationSet('dateConcil',this.value)"></div>
                <div class="col-md-5"><label class="fw-bold small">Type / contexte</label><input type="text" class="form-control form-control-sm" placeholder="Entrée / Sortie / Transfert — optionnel" value="${_esc(d.type)}" oninput="window.conciliationSet('type',this.value)"></div>
                <div class="col-md-3 d-flex align-items-end"><button type="button" class="btn btn-sm btn-outline-primary w-100" onclick="window.conciliationAutofillRefresh()" title="Reprendre les médicaments de l'ordonnance saisie">Pré-remplir depuis l'ordonnance</button></div>
            </div>
            <div class="form-check mt-3">
                <input type="checkbox" class="form-check-input" id="concilIncludePdf" ${d.includeInPdf ? 'checked' : ''} onchange="window.conciliationSet('includeInPdf',this.checked)">
                <label class="form-check-label small" for="concilIncludePdf"><strong>Inclure les propositions dans le rapport de synthèse GeriaAssist</strong> (en 2ᵉ position ; sinon utiliser le bouton « PDF Synthèse pharma seul »)</label>
            </div>
        </div></div>`;

        html += `<div class="card mb-3"><div class="card-body py-2">
            <div class="table-responsive"><table class="table table-sm align-middle mb-2" style="font-size:0.875rem;">
                <thead><tr>
                    <th style="width:32px;">#</th>
                    <th>Médicament</th>
                    <th style="width:22%;">Posologie</th>
                    <th style="width:150px;">Proposition</th>
                    <th>Commentaire</th>
                    <th style="width:36px;"></th>
                </tr></thead><tbody>`;
        if (!d.lignes.length) {
            html += `<tr><td colspan="6" class="text-center text-muted small py-3">Aucune ligne. Cliquez « Ajouter une ligne » ou « Pré-remplir depuis l'ordonnance ».</td></tr>`;
        }
        d.lignes.forEach((l, i) => {
            const autoTag = l.auto ? ' <span class="badge bg-info-subtle text-info border border-info" title="Repris de l’ordonnance — modifiable">auto</span>' : '';
            html += `<tr>
                <td class="text-muted small">${i + 1}</td>
                <td><input type="text" class="form-control form-control-sm" value="${_esc(l.medicament)}" oninput="window.conciliationSetLine(${l.id},'medicament',this.value)">${autoTag}</td>
                <td><input type="text" class="form-control form-control-sm" placeholder="ex. 5 mg 1-0-0" value="${_esc(l.posologie)}" oninput="window.conciliationSetLine(${l.id},'posologie',this.value)"></td>
                <td>${_statutSelect(l)}${l.statut === 'substitution' ? `<input type="text" class="form-control form-control-sm mt-1" placeholder="→ remplacé par…" value="${_esc(l.substitutVers || '')}" oninput="window.conciliationSetLine(${l.id},'substitutVers',this.value)">` : ''}</td>
                <td><input type="text" class="form-control form-control-sm" placeholder="justification / précision" value="${_esc(l.commentaire)}" oninput="window.conciliationSetLine(${l.id},'commentaire',this.value)"></td>
                <td><button type="button" class="btn btn-outline-danger btn-sm" title="Supprimer la ligne" onclick="window.conciliationDeleteLine(${l.id})">×</button></td>
            </tr>`;
        });
        html += `</tbody></table></div>
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="window.conciliationAddLine()">+ Ajouter une ligne</button>
            <div class="small text-muted mt-2">
                ${STATUTS.map(s => `<span class="me-2"><span class="badge bg-${s.cls}${s.cls === 'warning' ? ' text-dark' : ''}">${s.lbl}</span> ${counts[s.v]}</span>`).join('')}
                <span class="ms-2">Total : <strong>${d.lignes.length}</strong></span>
            </div>
        </div></div>`;

        html += `<div class="card mb-3"><div class="card-body py-2">
            <label class="fw-bold small text-primary">Discussion / commentaire pharmaceutique</label>
            <textarea class="form-control form-control-sm mt-1" rows="3" placeholder="Analyse pharmaceutique globale, justification des propositions, points de vigilance, échange avec le prescripteur…" oninput="window.conciliationSet('discussion', this.value)">${_esc(d.discussion || '')}</textarea>
        </div></div>`;

        html += `<div class="text-end mb-2"><button type="button" class="btn btn-outline-danger btn-sm" onclick="window.exporterConciliationPDF()" title="PDF dédié à la synthèse pharmaceutique">📄 Export PDF Synthèse pharma seul</button></div>`;

        wrap.innerHTML = html;
    }

    // ---- 6. Setters (window pour les handlers inline) ----------------------
    window.conciliationSet = function (key, value) {
        // Pas de re-render (préserve le focus des champs d'en-tête et la case PDF).
        if (window.conciliationData && key in window.conciliationData) window.conciliationData[key] = value;
    };
    window.conciliationSetLine = function (id, field, value) {
        const l = (window.conciliationData.lignes || []).find(x => x.id === id);
        if (!l) return;
        l[field] = value;
        if (field === 'statut') { renderConciliationTab(); }  // met à jour les compteurs
        else { l.auto = false; }                              // champ texte : pas de re-render (focus)
    };
    window.conciliationAddLine = function () {
        window.conciliationData.lignes.push(_newLine({ statut: 'ajout' }));
        renderConciliationTab();
    };
    window.conciliationDeleteLine = function (id) {
        const a = window.conciliationData.lignes;
        const i = a.findIndex(x => x.id === id);
        if (i >= 0) a.splice(i, 1);
        renderConciliationTab();
    };
    window.conciliationAutofillRefresh = function () {
        conciliationAutofill();
        renderConciliationTab();
    };

    // ---- 7. Sérialisation pour export/import JSON --------------------------
    window.conciliationSerialize = function () { return JSON.parse(JSON.stringify(window.conciliationData || _emptyData())); };
    window.conciliationRestore = function (saved) {
        if (!saved || typeof saved !== 'object') return;
        const base = _emptyData();
        ['dateConcil', 'type', 'discussion', 'includeInPdf'].forEach(k => { if (saved[k] != null) base[k] = saved[k]; });
        if (Array.isArray(saved.lignes)) {
            base.lignes = saved.lignes.map(l => _newLine({
                medicament: l.medicament, posologie: l.posologie, statut: l.statut,
                substitutVers: l.substitutVers, commentaire: l.commentaire, auto: l.auto
            }));
        }
        window.conciliationData = base;
        const wrap = document.getElementById('conciliation-container');
        if (wrap) renderConciliationTab();
    };

    // ---- 8. Construction du HTML PDF ---------------------------------------
    function _buildConciliationPdfHtml(opts) {
        opts = opts || {};
        const standalone = !!opts.standalone;
        const d = window.conciliationData;
        const nom = (document.getElementById('patientNom')?.value || '').trim();
        const age = (document.getElementById('patientAge')?.value || '').trim();
        const sexe = (document.getElementById('patientSexe')?.value || '').trim();
        const today = new Date().toLocaleDateString('fr-FR');
        const statutLbl = v => (STATUTS.find(s => s.v === v) || {}).lbl || '';

        let html = `<div class="pdf-block" style="page-break-before:${standalone ? 'auto' : 'always'};font-family:Arial,sans-serif;color:#222;">
            <div style="text-align:center;border-bottom:2px solid #0d6efd;padding-bottom:6px;margin-bottom:8px;">
                <div style="font-size:14px;font-weight:700;color:#0d6efd;">SYNTHÈSE PHARMACEUTIQUE GÉRIATRIQUE</div>
                <div style="font-size:9px;color:#666;">Propositions d'optimisation thérapeutique adressées au prescripteur — SFPC (intervention pharmaceutique / bilan de médication) · STOPP/START</div>
            </div>
            <div style="font-size:10px;margin-bottom:6px;">
                <strong>Patient :</strong> ${_esc(nom) || '...........................'}
                &nbsp; <strong>Âge :</strong> ${_esc(age)}
                &nbsp; <strong>Sexe :</strong> ${_esc(sexe)}
                &nbsp; <strong>Type :</strong> ${_esc(d.type) || '..............'}
                &nbsp; <strong>Date :</strong> ${_esc(d.dateConcil) || today}
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:9px;">
                <thead><tr style="background:#e7f1ff;">
                    <th style="border:1px solid #999;padding:3px 4px;text-align:left;width:28px;">N°</th>
                    <th style="border:1px solid #999;padding:3px 4px;text-align:left;">Médicament</th>
                    <th style="border:1px solid #999;padding:3px 4px;text-align:left;width:20%;">Posologie</th>
                    <th style="border:1px solid #999;padding:3px 4px;text-align:left;width:80px;">Proposition</th>
                    <th style="border:1px solid #999;padding:3px 4px;text-align:left;">Commentaire</th>
                </tr></thead><tbody>`;
        if (!d.lignes.length) {
            html += `<tr><td colspan="5" style="border:1px solid #999;padding:6px;text-align:center;color:#777;">Aucune ligne renseignée</td></tr>`;
        }
        d.lignes.forEach((l, i) => {
            html += `<tr>
                <td style="border:1px solid #999;padding:3px 4px;">${i + 1}</td>
                <td style="border:1px solid #999;padding:3px 4px;">${_esc(l.medicament)}${l.statut === 'substitution' && l.substitutVers ? ' <strong>&rarr;</strong> ' + _esc(l.substitutVers) : ''}</td>
                <td style="border:1px solid #999;padding:3px 4px;">${_esc(l.posologie)}</td>
                <td style="border:1px solid #999;padding:3px 4px;font-weight:700;">${_esc(statutLbl(l.statut))}</td>
                <td style="border:1px solid #999;padding:3px 4px;color:#555;">${_esc(l.commentaire)}</td>
            </tr>`;
        });
        html += `</tbody></table>`;

        const counts = {}; STATUTS.forEach(s => counts[s.v] = 0);
        d.lignes.forEach(l => { if (counts[l.statut] != null) counts[l.statut]++; });
        html += `<div style="font-size:9px;margin-top:6px;">${STATUTS.map(s => `<strong>${s.lbl} :</strong> ${counts[s.v]} &nbsp;`).join('')} <strong>Total :</strong> ${d.lignes.length}</div>`;

        if (d.discussion && d.discussion.trim()) {
            html += `<div style="font-size:9.5px;margin-top:6px;border:1px solid #999;border-radius:3px;padding:4px 6px;"><strong>Discussion / commentaire pharmaceutique :</strong><br><span style="white-space:pre-wrap;">${_esc(d.discussion)}</span></div>`;
        }

        html += `<table style="width:100%;border-collapse:collapse;font-size:9px;margin-top:8px;">
            <tr style="height:44px;vertical-align:top;">
                <td style="border:1px solid #999;padding:4px;width:50%;"><strong>Pharmacien (propose) :</strong><br><em style="color:#777;">Nom, date, signature</em></td>
                <td style="border:1px solid #999;padding:4px;width:50%;"><strong>Médecin (valide) :</strong><br><em style="color:#777;">Nom, date, signature</em></td>
            </tr></table>
            <div style="font-size:7px;color:#aaa;text-align:center;margin-top:6px;">Généré par GeriaAssist — Synthèse pharmaceutique gériatrique — Usage professionnel</div>
        </div>`;
        return html;
    }
    window.buildConciliationPdfHtml = _buildConciliationPdfHtml;

    // Bloc compact pour intégration dans le rapport de synthèse (2ᵉ position) —
    // pas de saut de page, pas de bloc signature (réservé au PDF autonome).
    function _buildConciliationReportBlock() {
        const d = window.conciliationData;
        if (!d || !Array.isArray(d.lignes) || !d.lignes.length) return '';
        const statutLbl = v => (STATUTS.find(s => s.v === v) || {}).lbl || '';
        // Aération alignée sur l'export de synthèse (cf. buildPdfContent) : cellules
        // à 5px/7px et interlignage 1.55, sinon le tableau ressort comme un pavé
        // dense au milieu d'un rapport désormais aéré.
        const _td = 'border:1px solid #ccd3da;padding:5px 7px;line-height:1.55;vertical-align:top;';
        const rows = d.lignes.map((l, i) => `<tr>
            <td style="${_td}">${i + 1}</td>
            <td style="${_td}">${_esc(l.medicament)}${l.statut === 'substitution' && l.substitutVers ? ' <strong>&rarr;</strong> ' + _esc(l.substitutVers) : ''}</td>
            <td style="${_td}">${_esc(l.posologie)}</td>
            <td style="${_td}font-weight:700;">${_esc(statutLbl(l.statut))}</td>
            <td style="${_td}color:#5a636c;">${_esc(l.commentaire)}</td>
        </tr>`).join('');
        const _th = 'border:1px solid #ccd3da;padding:5px 7px;text-align:left;letter-spacing:0.04em;text-transform:uppercase;font-size:8.5px;';
        let html = `<div class="pdf-block" style="page-break-inside:avoid;break-inside:avoid;margin:0 0 14px 0;border:1px solid #b6d4fe;border-radius:6px;padding:10px 12px;background:#f7fbff;">
            <div style="margin:0 0 8px 0;padding-bottom:5px;border-bottom:1px solid rgba(13,110,253,0.35);">
                <span style="font-size:10.5px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#0d6efd;">💊 Synthèse pharmaceutique — propositions au prescripteur</span>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:9px;">
                <thead><tr style="background:#e7f1ff;">
                    <th style="${_th}width:24px;">N°</th>
                    <th style="${_th}">Médicament</th>
                    <th style="${_th}width:20%;">Posologie</th>
                    <th style="${_th}width:80px;">Proposition</th>
                    <th style="${_th}">Commentaire</th>
                </tr></thead><tbody>${rows}</tbody>
            </table>`;
        if (d.discussion && d.discussion.trim()) {
            html += `<div style="font-size:9.5px;line-height:1.6;margin-top:9px;padding-top:7px;border-top:1px dotted #c4d4e8;"><strong>Discussion :</strong> <span style="white-space:pre-wrap;">${_esc(d.discussion)}</span></div>`;
        }
        html += `</div>`;
        return html;
    }
    window.buildConciliationReportBlock = _buildConciliationReportBlock;

    // ---- 9. Export PDF autonome --------------------------------------------
    window.exporterConciliationPDF = function () {
        if (typeof html2pdf === 'undefined') {
            (window.GeriaLog || console).error('html2pdf non chargé');
            alert('Erreur : bibliothèque PDF non chargée. Recharge la page.');
            return;
        }
        const content = document.createElement('div');
        content.innerHTML = _buildConciliationPdfHtml({ standalone: true });
        const nom = (document.getElementById('patientNom')?.value || 'Patient').replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ_ -]/g, '');
        html2pdf().set({
            margin: [8, 6, 10, 6],
            filename: 'GeriaAssist_SynthesePharma_' + nom + '_' + new Date().toISOString().slice(0, 10) + '.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'], avoid: '.pdf-block' }
        }).from(content).save();
    };

    // ---- 10. Initialisation ------------------------------------------------
    function _init() {
        const wrap = document.getElementById('conciliation-container');
        if (!wrap) return; // onglet absent → no-op
        conciliationAutofill();
        renderConciliationTab();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
    else _init();

    // Exposer publiquement
    window.conciliationReset = conciliationReset;
    window.conciliationRenderTab = renderConciliationTab;
    window.CONCILIATION_STATUTS = STATUTS;
})();
