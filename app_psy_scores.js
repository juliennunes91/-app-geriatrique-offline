/* ============================================================================
 * app_psy_scores.js — Calculateurs psychiatriques (Item 3)
 *   • AIMS (Abnormal Involuntary Movement Scale) — dépistage dyskinésie tardive
 *   • Syndrome métabolique (NCEP ATP III) — surveillance antipsychotiques
 *
 * Rendu dans #psy-scores-container (onglet « Scores exp. »), non écrasé par
 * analyserPrescription (contrairement à #alertes-scores-exp). Les résultats sont
 * exposés via window.psyScoresData pour l'export « Plan de surveillance » (Item 4).
 * Modèle purgé par resetPatient(). Patron calqué sur app_paam.js.
 * ============================================================================ */
(function () {
    'use strict';

    // ---- AIMS : 12 items (7 moteurs cotés 0-4 → score /28 ; 3 jugements
    // globaux ; 2 items dentaires oui/non). Score dyskinésie = somme items 1-7.
    const AIMS_ITEMS = [
        { id: 1, groupe: 'Facial / oral', libelle: 'Muscles de l\'expression faciale (front, sourcils, région péri-orbitaire, joues ; grimaces)' },
        { id: 2, groupe: 'Facial / oral', libelle: 'Lèvres et région péri-orale (moue, claquements)' },
        { id: 3, groupe: 'Facial / oral', libelle: 'Mâchoire (mordillement, serrement, mastication, latéralité)' },
        { id: 4, groupe: 'Facial / oral', libelle: 'Langue (mouvements, protrusions)' },
        { id: 5, groupe: 'Extrémités',    libelle: 'Membres supérieurs (bras, poignets, mains, doigts — choréiques/athétosiques)' },
        { id: 6, groupe: 'Extrémités',    libelle: 'Membres inférieurs (jambes, genoux, chevilles, orteils)' },
        { id: 7, groupe: 'Tronc',         libelle: 'Cou, épaules, hanches (balancement, torsion, rotation)' }
    ];
    const AIMS_GLOBAL = [
        { id: 8,  libelle: 'Sévérité globale des mouvements anormaux' },
        { id: 9,  libelle: 'Incapacité liée aux mouvements anormaux' },
        { id: 10, libelle: 'Conscience du patient de ses mouvements (0 = inconscient ; 4 = détresse sévère)' }
    ];
    const AIMS_DENTAL = [
        { id: 11, libelle: 'Problèmes dentaires / prothèses actuels' },
        { id: 12, libelle: 'Le patient porte-t-il une prothèse dentaire ?' }
    ];
    const AIMS_COT = [ [0,'0 — Aucun'], [1,'1 — Minime (limite)'], [2,'2 — Léger'], [3,'3 — Modéré'], [4,'4 — Sévère'] ];

    function _emptyData() {
        const aims = {};
        AIMS_ITEMS.concat(AIMS_GLOBAL).forEach(i => aims[i.id] = null);
        AIMS_DENTAL.forEach(i => aims[i.id] = null); // 0 = non, 1 = oui
        return {
            aims: aims,
            metab: { tourTaille: null, tas: null, tad: null } // les autres critères viennent des bio
        };
    }
    window.psyScoresData = window.psyScoresData || _emptyData();

    function psyScoresReset() {
        window.psyScoresData = _emptyData();
        const w = document.getElementById('psy-scores-container');
        if (w) renderPsyScores();
    }

    // ---- Calcul AIMS ----
    function computeAims() {
        const d = window.psyScoresData.aims;
        let moteur = 0, renseignes = 0, itemsPos2 = 0, itemsPos1 = 0;
        AIMS_ITEMS.forEach(i => {
            const v = d[i.id];
            if (v != null) { moteur += Number(v); renseignes++; if (v >= 2) itemsPos2++; if (v >= 1) itemsPos1++; }
        });
        // Critère de dyskinésie tardive probable (Schooler-Kane) : ≥ 2 sur un item,
        // OU ≥ 1 sur au moins deux items moteurs.
        const complet = renseignes === AIMS_ITEMS.length;
        const significatif = itemsPos2 >= 1 || itemsPos1 >= 2;
        return { moteur, max: 28, renseignes, total: AIMS_ITEMS.length, complet, significatif };
    }

    // ---- Calcul syndrome métabolique (NCEP ATP III, ≥ 3 critères / 5) ----
    // Unités app : HDL et TG en g/L, glycémie en mmol/L. Seuils :
    //   tour de taille > 102 cm (H) / > 88 cm (F)
    //   TG ≥ 1.5 g/L ; HDL < 0.40 g/L (H) / < 0.50 g/L (F)
    //   TA ≥ 130/85 ; glycémie à jeun ≥ 5.6 mmol/L
    function computeMetabolique() {
        const _g = id => { const el = document.getElementById(id); const v = el ? parseFloat(String(el.value).replace(',', '.')) : NaN; return isNaN(v) ? null : v; };
        const sexe = (document.getElementById('patientSexe') || {}).value || 'F';
        const m = window.psyScoresData.metab;
        const tg = _g('bioTg'), hdl = _g('bioHdl'), gly = _g('bioGly');
        const crit = [];
        const add = (nom, present, detail) => { if (present != null) crit.push({ nom, present, detail }); };
        // Tour de taille
        if (m.tourTaille != null) add('Tour de taille', m.tourTaille > (sexe === 'M' ? 102 : 88), `${m.tourTaille} cm (seuil ${sexe === 'M' ? '>102' : '>88'})`);
        // TG
        if (tg != null) add('Triglycérides', tg >= 1.5, `${tg} g/L (seuil ≥ 1.5)`);
        // HDL bas
        if (hdl != null) add('HDL bas', hdl < (sexe === 'M' ? 0.40 : 0.50), `${hdl} g/L (seuil ${sexe === 'M' ? '<0.40' : '<0.50'})`);
        // TA
        if (m.tas != null || m.tad != null) add('Pression artérielle', (m.tas != null && m.tas >= 130) || (m.tad != null && m.tad >= 85), `${m.tas || '?'}/${m.tad || '?'} mmHg (seuil ≥130/85)`);
        // Glycémie
        if (gly != null) add('Glycémie à jeun', gly >= 5.6, `${gly} mmol/L (seuil ≥ 5.6)`);
        const presents = crit.filter(c => c.present).length;
        const evaluables = crit.length;
        const syndrome = evaluables >= 3 ? (presents >= 3) : null; // besoin d'au moins 3 critères évaluables pour conclure
        return { crit, presents, evaluables, syndrome };
    }

    // ---- Rendu ----
    function _esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

    function renderPsyScores() {
        const wrap = document.getElementById('psy-scores-container');
        if (!wrap) return;
        const d = window.psyScoresData;
        const aims = computeAims();
        const metab = computeMetabolique();

        let html = '<div class="card mb-3"><div class="card-body">';
        html += `<h6 class="text-primary">🧠 AIMS — dépistage de la dyskinésie tardive</h6>
            <p class="text-muted small mb-2">Échelle des mouvements involontaires anormaux (Guy 1976). Cotation 0-4. Score dyskinésie = somme des 7 items moteurs (/28).</p>`;

        const _cotSelect = (item, val) => {
            let s = `<select class="form-select form-select-sm" onchange="window.psySetAims(${item.id}, this.value)">`;
            s += `<option value=""${val == null ? ' selected' : ''}>—</option>`;
            AIMS_COT.forEach(([v, t]) => { s += `<option value="${v}"${String(val) === String(v) ? ' selected' : ''}>${t}</option>`; });
            s += '</select>';
            return s;
        };

        html += '<table class="table table-sm align-middle mb-2" style="font-size:0.85rem;"><tbody>';
        let lastGroupe = '';
        AIMS_ITEMS.forEach(i => {
            if (i.groupe !== lastGroupe) { html += `<tr class="table-light"><td colspan="2" class="fw-bold small text-secondary">${_esc(i.groupe)}</td></tr>`; lastGroupe = i.groupe; }
            html += `<tr><td>${i.id}. ${_esc(i.libelle)}</td><td style="width:180px;">${_cotSelect(i, d.aims[i.id])}</td></tr>`;
        });
        html += `<tr class="table-light"><td colspan="2" class="fw-bold small text-secondary">Jugements globaux</td></tr>`;
        AIMS_GLOBAL.forEach(i => { html += `<tr><td>${i.id}. ${_esc(i.libelle)}</td><td>${_cotSelect(i, d.aims[i.id])}</td></tr>`; });
        html += `<tr class="table-light"><td colspan="2" class="fw-bold small text-secondary">Statut dentaire</td></tr>`;
        AIMS_DENTAL.forEach(i => {
            html += `<tr><td>${i.id}. ${_esc(i.libelle)}</td><td>
                <div class="btn-group btn-group-sm">
                    <input type="radio" class="btn-check" name="aims_${i.id}" id="aims_${i.id}_0" ${d.aims[i.id] === 0 ? 'checked' : ''} onchange="window.psySetAims(${i.id}, 0)"><label class="btn btn-outline-secondary" for="aims_${i.id}_0">Non</label>
                    <input type="radio" class="btn-check" name="aims_${i.id}" id="aims_${i.id}_1" ${d.aims[i.id] === 1 ? 'checked' : ''} onchange="window.psySetAims(${i.id}, 1)"><label class="btn btn-outline-secondary" for="aims_${i.id}_1">Oui</label>
                </div></td></tr>`;
        });
        html += '</tbody></table>';

        // Résultat AIMS
        let aimsBadge;
        if (aims.renseignes === 0) aimsBadge = '<span class="badge bg-secondary">Non évalué</span>';
        else if (aims.significatif) aimsBadge = '<span class="badge bg-danger">Dyskinésie tardive probable (critère de Schooler-Kane atteint)</span>';
        else aimsBadge = `<span class="badge bg-success">Pas de dyskinésie significative (${aims.renseignes}/${aims.total} items)</span>`;
        html += `<div class="alert alert-light border mb-0 py-2"><strong>Score moteur AIMS : ${aims.moteur} / ${aims.max}</strong> ${aimsBadge}
            <div class="small text-muted mt-1">Seuil de significativité : ≥ 2 sur un item OU ≥ 1 sur au moins deux items moteurs.</div></div>`;
        html += '</div></div>';

        // ---- Syndrome métabolique ----
        html += '<div class="card mb-3"><div class="card-body">';
        html += `<h6 class="text-primary">⚖️ Syndrome métabolique (NCEP ATP III)</h6>
            <p class="text-muted small mb-2">Surveillance des antipsychotiques au long cours. ≥ 3 critères / 5 = syndrome métabolique. TG/HDL repris de l'onglet Biologie ; renseigner tour de taille et TA ci-dessous.</p>
            <div class="row g-2 mb-2">
                <div class="col-md-4"><label class="small fw-bold">Tour de taille (cm)</label><input type="number" class="form-control form-control-sm" min="40" max="200" value="${d.metab.tourTaille != null ? d.metab.tourTaille : ''}" oninput="window.psySetMetab('tourTaille', this.value)"></div>
                <div class="col-md-4"><label class="small fw-bold">TA systolique (mmHg)</label><input type="number" class="form-control form-control-sm" min="60" max="260" value="${d.metab.tas != null ? d.metab.tas : ''}" oninput="window.psySetMetab('tas', this.value)"></div>
                <div class="col-md-4"><label class="small fw-bold">TA diastolique (mmHg)</label><input type="number" class="form-control form-control-sm" min="30" max="160" value="${d.metab.tad != null ? d.metab.tad : ''}" oninput="window.psySetMetab('tad', this.value)"></div>
            </div>`;
        if (metab.crit.length) {
            html += '<ul class="list-group list-group-flush mb-2">';
            metab.crit.forEach(c => {
                html += `<li class="list-group-item d-flex justify-content-between align-items-center py-1 px-2" style="font-size:0.85rem;">
                    <span>${c.present ? '🔴' : '🟢'} ${_esc(c.nom)} <span class="text-muted small">${_esc(c.detail)}</span></span>
                    <span class="badge ${c.present ? 'bg-danger' : 'bg-success'}">${c.present ? 'présent' : 'absent'}</span></li>`;
            });
            html += '</ul>';
        }
        let metabBadge;
        if (metab.evaluables < 3) metabBadge = `<span class="badge bg-secondary">Incomplet (${metab.evaluables}/5 critères évaluables — renseigner TG, HDL, glycémie, tour de taille, TA)</span>`;
        else if (metab.syndrome) metabBadge = `<span class="badge bg-danger">Syndrome métabolique (${metab.presents}/${metab.evaluables} critères présents)</span>`;
        else metabBadge = `<span class="badge bg-success">Pas de syndrome métabolique (${metab.presents}/${metab.evaluables} critères présents)</span>`;
        html += `<div class="alert alert-light border mb-0 py-2">${metabBadge}</div>`;
        html += '</div></div>';

        // Bouton export « Plan de surveillance psychiatrique » (Item 4)
        html += `<div class="text-end mb-2"><button type="button" class="btn btn-outline-danger btn-sm" onclick="window.exporterPsySurveillancePDF()" title="PDF regroupant diagnostics, traitements de fond et calendrier de surveillance">📄 Export « Plan de surveillance psychiatrique »</button></div>`;

        wrap.innerHTML = html;
    }

    // ---- Setters ----
    window.psySetAims = function (id, value) {
        window.psyScoresData.aims[id] = (value === '' || value == null) ? null : Number(value);
        renderPsyScores();
    };
    window.psySetMetab = function (key, value) {
        if (!(key in window.psyScoresData.metab)) return;
        const v = parseFloat(String(value).replace(',', '.'));
        window.psyScoresData.metab[key] = isNaN(v) ? null : v;
        renderPsyScores();
    };

    // ---- Sérialisation (export/import JSON patient) ----
    window.psyScoresSerialize = function () { return JSON.parse(JSON.stringify(window.psyScoresData || _emptyData())); };
    window.psyScoresRestore = function (saved) {
        if (!saved || typeof saved !== 'object') return;
        const base = _emptyData();
        if (saved.aims) Object.keys(base.aims).forEach(k => { if (saved.aims[k] != null) base.aims[k] = saved.aims[k]; });
        if (saved.metab) Object.keys(base.metab).forEach(k => { if (saved.metab[k] != null) base.metab[k] = saved.metab[k]; });
        window.psyScoresData = base;
        const w = document.getElementById('psy-scores-container');
        if (w) renderPsyScores();
    };

    // ---- Exposition pour l'export « Plan de surveillance » (Item 4) ----
    window.psyScoresSummary = function () {
        return { aims: computeAims(), metabolique: computeMetabolique() };
    };

    // ========================================================================
    // Item 4 — EXPORT « PLAN DE SURVEILLANCE PSYCHIATRIQUE » (PDF autonome)
    // Assemble : diagnostics chroniques actifs + traitements psychotropes de fond
    // + tableau de surveillance (paramètre / fréquence / dernier résultat /
    // prochaine échéance) construit selon les médicaments réellement présents.
    // ========================================================================
    function _activeMedsSafe() { return (typeof activeMeds !== 'undefined' && Array.isArray(activeMeds)) ? activeMeds : []; }
    function _hasMed(re) { return _activeMedsSafe().some(m => re.test((m.dci || '') + ' ' + (m.classe || ''))); }
    function _isChk(id) { const el = document.getElementById(id); return !!(el && el.checked); }

    // Libellés des diagnostics chroniques (checkbox → texte).
    const _PSY_CHRONIQUE_LABELS = {
        chkSchizoChronique: 'Schizophrénie chronique (F20)', chkSchizoAffectif: 'Trouble schizo-affectif (F25)',
        chkTroubleDelirant: 'Trouble délirant persistant (F22.0)', chkBipolaireI: 'Trouble bipolaire type I (F31)',
        chkBipolaireII: 'Trouble bipolaire type II (F31.81)', chkDepressionRecurrente: 'Trouble dépressif récurrent (F33)',
        chkDysthymie: 'Dysthymie (F34.1)', chkTOC: 'TOC (F42)', chkTroublePanique: 'Trouble panique (F41.0)',
        chkTAGChronique: 'TAG chronique (F41.1)', chkESPT: 'ESPT (F43.1)', chkTroublePersonnalite: 'Trouble de la personnalité (F60)',
        chkUsageAlcool: "Trouble de l'usage de l'alcool (F10.2)", chkUsageSubstances: "Trouble de l'usage de substances (F19)",
        chkTSADI: 'TSA / déficience intellectuelle (F84/F70)'
    };

    // Construit les lignes de surveillance selon les traitements de fond présents.
    function _surveillanceRows() {
        const rows = [];
        const antipsy = _hasMed(/antipsychot|neuroleptique|haloperidol|risperidone|rispéridone|olanzapine|quetiapine|quétiapine|aripiprazole|paliperidone|palipéridone|clozapine|amisulpride|chlorpromazine|cyamemazine|loxapine|tiapride|sulpiride/i);
        const lithium = _hasMed(/lithium/i);
        const clozapine = _hasMed(/clozapine/i);
        const s = window.psyScoresSummary();
        if (antipsy) {
            const aimsTxt = s.aims.renseignes ? (s.aims.significatif ? `AIMS ${s.aims.moteur}/28 — dyskinésie probable` : `AIMS ${s.aims.moteur}/28 — non significatif`) : '';
            rows.push(['Dyskinésie tardive (échelle AIMS)', 'Au moins 1×/an (3-6 mois si facteurs de risque)', aimsTxt]);
            const metabTxt = s.metabolique.evaluables >= 3 ? (s.metabolique.syndrome ? `Syndrome métabolique (${s.metabolique.presents}/${s.metabolique.evaluables})` : `Pas de syndrome (${s.metabolique.presents}/${s.metabolique.evaluables})`) : '';
            rows.push(['Bilan métabolique (poids/IMC/tour de taille, glycémie/HbA1c, lipides, TA)', 'Baseline, 3 mois, puis annuel', metabTxt]);
            rows.push(['ECG — QTc', 'Baseline puis annuel / changement de dose', '']);
            rows.push(['Prolactine', 'Si signes (galactorrhée, troubles sexuels, ostéoporose)', '']);
        }
        if (lithium) {
            rows.push(['Lithémie', 'J5 de toute modification, puis trimestrielle', '']);
            rows.push(['DFG / créatinine', 'Trimestrielle', '']);
            rows.push(['TSH', 'Semestrielle', '']);
            rows.push(['Calcémie / PTH', 'Annuelle', '']);
        }
        if (clozapine) {
            rows.push(['NFS (PNN) — agranulocytose', 'Hebdomadaire 18 sem puis mensuelle', '']);
            rows.push(['CRP + troponine (myocardite)', 'Hebdomadaire les 4 premières semaines', '']);
            rows.push(['Transit / dépistage occlusion (laxatif prophylactique)', 'Continue', '']);
        }
        return rows;
    }

    function _buildPsySurveillancePdfHtml() {
        const nom = (document.getElementById('patientNom')?.value || '').trim();
        const age = (document.getElementById('patientAge')?.value || '').trim();
        const onset = (document.getElementById('psyOnsetAge')?.value || '').trim();
        const today = new Date().toLocaleDateString('fr-FR');
        const dx = Object.keys(_PSY_CHRONIQUE_LABELS).filter(_isChk).map(k => _PSY_CHRONIQUE_LABELS[k]);
        const lai = _isChk('chkAntipsyLAI');
        const meds = _activeMedsSafe().filter(m => /antipsychot|neuroleptique|lithium|valproate|lamotrigine|carbamazepine|clozapine|antidepresseur|antidépresseur|isrs|irsn|tricyclique|haloperidol|risperidone|olanzapine|quetiapine|aripiprazole/i.test((m.dci||'')+' '+(m.classe||''))).map(m => m.dci);
        const rows = _surveillanceRows();

        let html = `<div class="pdf-block" style="font-family:Arial,sans-serif;color:#222;">
            <div style="text-align:center;border-bottom:2px solid #0d6efd;padding-bottom:6px;margin-bottom:8px;">
                <div style="font-size:14px;font-weight:700;color:#0d6efd;">PLAN DE SURVEILLANCE PSYCHIATRIQUE</div>
                <div style="font-size:9px;color:#666;">Maladie psychiatrique primaire chronique du sujet âgé — traitements psychotropes de fond</div>
            </div>
            <div style="font-size:10px;margin-bottom:6px;">
                <strong>Patient :</strong> ${_esc(nom) || '...........................'}
                &nbsp; <strong>Âge :</strong> ${_esc(age)}
                ${onset ? `&nbsp; <strong>Âge de début :</strong> ${_esc(onset)} ans` : ''}
                &nbsp; <strong>Date :</strong> ${today}
            </div>`;

        html += `<div style="font-size:10px;margin-bottom:4px;"><strong style="color:#0d6efd;">Diagnostic(s) psychiatrique(s) chronique(s)</strong></div>`;
        html += dx.length ? `<ul style="font-size:9px;margin:0 0 8px 16px;">${dx.map(d => `<li>${_esc(d)}</li>`).join('')}</ul>`
                          : `<div style="font-size:9px;color:#888;margin-bottom:8px;">— aucun diagnostic chronique coché —</div>`;

        html += `<div style="font-size:10px;margin-bottom:4px;"><strong style="color:#0d6efd;">Traitement(s) psychotrope(s) de fond</strong>${lai ? ' <span style="font-size:8px;background:#e7f1ff;padding:1px 4px;border-radius:3px;">💉 forme retard (LAI/dépôt) — réversibilité lente</span>' : ''}</div>`;
        html += meds.length ? `<div style="font-size:9px;margin-bottom:8px;">${meds.map(_esc).join(' · ')}</div>`
                            : `<div style="font-size:9px;color:#888;margin-bottom:8px;">— aucun psychotrope de fond identifié —</div>`;

        html += `<div style="font-size:10px;margin-bottom:4px;"><strong style="color:#0d6efd;">Calendrier de surveillance</strong></div>`;
        if (rows.length) {
            html += `<table style="width:100%;border-collapse:collapse;font-size:8.5px;">
                <thead><tr style="background:#e7f1ff;">
                    <th style="border:1px solid #999;padding:3px 4px;text-align:left;">Paramètre</th>
                    <th style="border:1px solid #999;padding:3px 4px;text-align:left;width:150px;">Fréquence recommandée</th>
                    <th style="border:1px solid #999;padding:3px 4px;text-align:left;width:120px;">Dernier résultat</th>
                    <th style="border:1px solid #999;padding:3px 4px;text-align:left;width:70px;">Prochaine échéance</th>
                </tr></thead><tbody>`;
            rows.forEach(r => {
                html += `<tr>
                    <td style="border:1px solid #999;padding:3px 4px;">${_esc(r[0])}</td>
                    <td style="border:1px solid #999;padding:3px 4px;">${_esc(r[1])}</td>
                    <td style="border:1px solid #999;padding:3px 4px;">${_esc(r[2])}</td>
                    <td style="border:1px solid #999;padding:3px 4px;">......./......./.......</td>
                </tr>`;
            });
            html += `</tbody></table>`;
        } else {
            html += `<div style="font-size:9px;color:#888;">— aucun traitement de fond nécessitant une surveillance spécifique identifié —</div>`;
        }

        html += `<div style="font-size:8px;color:#555;margin-top:8px;"><em>Rappel : les psychotropes de fond d'une maladie psychiatrique primaire chronique ne sont pas des prescriptions inappropriées à déprescrire systématiquement — les maintenir à dose minimale efficace et surveiller selon ce calendrier.</em></div>
            <div style="font-size:9px;margin-top:10px;">Médecin : ..............................  Date : ......./......./.......  Signature :</div>
            <div style="font-size:7px;color:#aaa;text-align:center;margin-top:6px;">Généré par GeriaAssist — Plan de surveillance psychiatrique — Usage professionnel</div>
        </div>`;
        return html;
    }
    window.buildPsySurveillancePdfHtml = _buildPsySurveillancePdfHtml;

    window.exporterPsySurveillancePDF = function () {
        if (typeof html2pdf === 'undefined') { (window.GeriaLog || console).error('html2pdf non chargé'); alert('Erreur : bibliothèque PDF non chargée. Recharge la page.'); return; }
        const content = document.createElement('div');
        content.innerHTML = _buildPsySurveillancePdfHtml();
        const nom = (document.getElementById('patientNom')?.value || 'Patient').replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ_ -]/g, '');
        html2pdf().set({
            margin: [8, 6, 10, 6],
            filename: 'GeriaAssist_SurveillancePsy_' + nom + '_' + new Date().toISOString().slice(0, 10) + '.pdf',
            image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['css', 'legacy'], avoid: '.pdf-block' }
        }).from(content).save();
    };

    function _init() {
        if (!document.getElementById('psy-scores-container')) return;
        renderPsyScores();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
    else _init();

    window.psyScoresReset = psyScoresReset;
    window.renderPsyScores = renderPsyScores;
    window.computeAims = computeAims;
    window.computeMetaboliqueSyndrome = computeMetabolique;
})();
