/* ============================================================================
 * app_vaccination.js — Onglet « Vaccination »
 *
 * Relevé du statut vaccinal du sujet âgé : pour chaque vaccin, ce qui a été FAIT
 * (avec sa date), ce qui reste À FAIRE, et — cas le plus fréquent en pratique —
 * ce dont on IGNORE le statut faute de carnet de vaccination à disposition.
 *
 * Le troisième état n'est pas un détail d'ergonomie. Un vaccin dont on ne sait
 * rien n'est ni fait ni à faire : le noter « à faire » exposerait à une injection
 * redondante, le noter « fait » à une absence de protection. Il est donc distingué,
 * et le rapport le signale comme une information à récupérer.
 *
 * Les trois critères START v3 sur les vaccins (IN_L01 grippe, IN_L02 pneumocoque,
 * IN_L03 zona) sont déclarés `type: "manual_review"` : le moteur les rejette
 * d'emblée, ils ne se déclenchent jamais. Cet onglet est l'endroit où cette revue
 * manuelle a lieu.
 *
 * Implémente (jumeau de app_paam.js / app_conciliation.js) :
 *   - Liste de référence pré-remplie au statut « inconnu », non destructive.
 *   - Ajout libre d'un vaccin hors liste, suppression d'une ligne.
 *   - Sérialisation/restauration pour export/import JSON patient.
 *   - Intégration au PDF de synthèse via un toggle (bloc « Statut vaccinal »).
 * ============================================================================ */
(function () {
    'use strict';

    // ---- 1. Statuts --------------------------------------------------------
    const STATUTS = [
        { v: 'inconnu', lbl: 'Statut inconnu', cls: 'secondary' },
        { v: 'fait',    lbl: 'Fait',           cls: 'success'   },
        { v: 'a_faire', lbl: 'À faire',        cls: 'warning'   },
        { v: 'refus',   lbl: 'Refus / contre-indication', cls: 'danger' }
    ];

    // ---- 2. Liste de référence (calendrier vaccinal, sujet âgé) ------------
    // Repères de périodicité, NON des recommandations opposables : le calendrier
    // vaccinal en vigueur et l'avis de la HAS prévalent toujours. Ils servent à
    // ce que le relevé soit exhaustif, pas à décider à la place du prescripteur.
    const REFERENCE = [
        { vaccin: 'Grippe saisonnière',                 rappel: 'Chaque automne — dose renforcée disponible après 65 ans' },
        { vaccin: 'Pneumocoque',                        rappel: 'Schéma selon le calendrier vaccinal en vigueur' },
        { vaccin: 'COVID-19',                           rappel: 'Rappel selon les campagnes en cours après 65 ans' },
        { vaccin: 'Diphtérie – tétanos – poliomyélite', rappel: 'Rappel décennal après 65 ans (65, 75, 85 ans)' },
        { vaccin: 'Zona',                               rappel: 'Vaccin recombinant adjuvanté, 2 doses, à partir de 65 ans' },
        { vaccin: 'Virus respiratoire syncytial (VRS)',  rappel: 'Recommandé après 75 ans (et plus tôt si comorbidité respiratoire ou cardiaque)' }
    ];

    let _seq = 1;

    // ---- 3. Modèle de données ---------------------------------------------
    function _emptyData() {
        return { lignes: [], commentaire: '', includeInPdf: false };
    }
    window.vaccinationData = window.vaccinationData || _emptyData();

    function _newLine(o) {
        o = o || {};
        return {
            id: _seq++,
            vaccin: o.vaccin || '',
            statut: o.statut || 'inconnu',
            date: o.date || '',
            rappel: o.rappel || '',
            commentaire: o.commentaire || '',
            reference: !!o.reference   // ligne issue de la liste de référence
        };
    }

    function _esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ---- 4. Pré-remplissage (non destructif) ------------------------------
    // N'ajoute que les vaccins de référence ABSENTS de la grille : une ligne déjà
    // saisie n'est jamais touchée.
    function vaccinationAutofill() {
        const d = window.vaccinationData;
        const norm = s => String(s || '').trim().toLowerCase();
        const present = new Set(d.lignes.map(l => norm(l.vaccin)));
        REFERENCE.forEach(r => {
            if (present.has(norm(r.vaccin))) return;
            d.lignes.push(_newLine({ vaccin: r.vaccin, rappel: r.rappel, statut: 'inconnu', reference: true }));
        });
    }

    function vaccinationReset() {
        window.vaccinationData = _emptyData();
        const wrap = document.getElementById('vaccination-container');
        if (wrap) { vaccinationAutofill(); renderVaccinationTab(); }
    }
    window.vaccinationReset = vaccinationReset;

    // ---- 5. Rendu ----------------------------------------------------------
    function _statutSelect(l) {
        const opts = STATUTS.map(s =>
            `<option value="${s.v}" ${l.statut === s.v ? 'selected' : ''}>${s.lbl}</option>`).join('');
        return `<select class="form-select form-select-sm" aria-label="Statut vaccinal" onchange="window.vaccinationSetLine(${l.id},'statut',this.value)">${opts}</select>`;
    }

    function renderVaccinationTab() {
        const wrap = document.getElementById('vaccination-container');
        if (!wrap) return;
        const d = window.vaccinationData;
        if (!d.lignes.length) vaccinationAutofill();

        const n = v => d.lignes.filter(l => l.statut === v).length;
        const compteurs = STATUTS.map(s =>
            `<span class="badge bg-${s.cls} me-1">${s.lbl} : ${n(s.v)}</span>`).join('');

        let html = `
            <div class="alert alert-light border mb-3">
                <strong class="text-primary">💉 Statut vaccinal</strong>
                <div class="small text-muted mt-1">
                    Relevé du carnet de vaccination. Un vaccin dont le statut n'est pas documenté
                    reste « statut inconnu » — ni fait, ni à faire : c'est une information à récupérer,
                    pas une décision à prendre. Les périodicités affichées sont des repères ;
                    le calendrier vaccinal en vigueur prévaut.
                </div>
                <div class="mt-2">${compteurs}</div>
                <div class="form-check form-switch mt-2">
                    <input type="checkbox" class="form-check-input" id="vaccIncludePdf" ${d.includeInPdf ? 'checked' : ''}
                        onchange="window.vaccinationSet('includeInPdf', this.checked)">
                    <label class="form-check-label small" for="vaccIncludePdf">Inclure le statut vaccinal dans l'export PDF</label>
                </div>
            </div>
            <div class="table-responsive">
            <!-- min-width sur le TABLEAU, pas seulement sur les colonnes : sans lui, le
                 navigateur comprime pour tenir dans le conteneur (la colonne de résultats
                 fait la moitié de l'écran) et le menu déroulant du statut se réduisait à
                 un caractère. Avec une largeur plancher, .table-responsive fait défiler. -->
            <table class="table table-sm table-bordered align-middle" style="min-width:720px;">
                <thead class="table-light"><tr>
                    <th style="min-width:190px;">Vaccin</th>
                    <th style="min-width:150px;">Statut</th>
                    <th style="min-width:145px;">Date de vaccination</th>
                    <th style="min-width:190px;">Commentaire</th>
                    <th style="min-width:46px;"></th>
                </tr></thead><tbody>`;

        d.lignes.forEach(l => {
            const dateActive = (l.statut === 'fait');
            html += `<tr>
                <td>
                    <input type="text" class="form-control form-control-sm" value="${_esc(l.vaccin)}"
                        placeholder="Nom du vaccin" oninput="window.vaccinationSetLine(${l.id},'vaccin',this.value)">
                    ${l.rappel ? `<div class="small text-muted mt-1">${_esc(l.rappel)}</div>` : ''}
                </td>
                <td>${_statutSelect(l)}</td>
                <td>
                    <input type="date" class="form-control form-control-sm" value="${_esc(l.date)}"
                        ${dateActive ? '' : 'disabled'} title="${dateActive ? 'Date de la vaccination' : 'Renseignable une fois le vaccin noté « Fait »'}"
                        oninput="window.vaccinationSetLine(${l.id},'date',this.value)">
                </td>
                <td><input type="text" class="form-control form-control-sm" value="${_esc(l.commentaire)}"
                        placeholder="lot, effet indésirable, motif du refus…"
                        oninput="window.vaccinationSetLine(${l.id},'commentaire',this.value)"></td>
                <td><button type="button" class="btn btn-outline-danger btn-sm" title="Supprimer la ligne"
                        onclick="window.vaccinationDeleteLine(${l.id})">×</button></td>
            </tr>`;
        });

        html += `</tbody></table></div>
            <div class="d-flex gap-2 flex-wrap mb-3">
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="window.vaccinationAddLine()">+ Ajouter un vaccin</button>
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="window.vaccinationAutofillRefresh()"
                    title="Réintroduire les vaccins de la liste de référence absents du tableau">Compléter depuis la liste de référence</button>
            </div>
            <label class="fw-bold small">Commentaire</label>
            <textarea class="form-control form-control-sm mt-1" rows="2"
                placeholder="Carnet non disponible, vaccinations réalisées en ville, contre-indication…"
                oninput="window.vaccinationSet('commentaire', this.value)">${_esc(d.commentaire || '')}</textarea>`;

        wrap.innerHTML = html;
    }
    window.renderVaccinationTab = renderVaccinationTab;

    // ---- 6. Setters --------------------------------------------------------
    window.vaccinationSet = function (key, value) {
        if (window.vaccinationData && key in window.vaccinationData) window.vaccinationData[key] = value;
    };
    window.vaccinationSetLine = function (id, field, value) {
        const l = (window.vaccinationData.lignes || []).find(x => x.id === id);
        if (!l) return;
        l[field] = value;
        // Le statut commande l'activation du champ date et les compteurs : re-render.
        // Un champ texte n'en déclenche pas, sous peine de perdre le focus à chaque frappe.
        if (field === 'statut') {
            // Quitter « Fait » vide la date : une date de vaccination sans vaccination
            // faite est une contradiction que l'export irait ensuite imprimer.
            if (value !== 'fait') l.date = '';
            renderVaccinationTab();
        }
    };
    window.vaccinationAddLine = function () {
        window.vaccinationData.lignes.push(_newLine({ statut: 'a_faire' }));
        renderVaccinationTab();
    };
    window.vaccinationDeleteLine = function (id) {
        const a = window.vaccinationData.lignes;
        const i = a.findIndex(x => x.id === id);
        if (i >= 0) a.splice(i, 1);
        renderVaccinationTab();
    };
    window.vaccinationAutofillRefresh = function () {
        vaccinationAutofill();
        renderVaccinationTab();
    };

    // ---- 7. Sérialisation --------------------------------------------------
    window.vaccinationSerialize = function () {
        return JSON.parse(JSON.stringify(window.vaccinationData || _emptyData()));
    };
    window.vaccinationRestore = function (saved) {
        if (!saved || typeof saved !== 'object') return;
        const base = _emptyData();
        ['commentaire', 'includeInPdf'].forEach(k => { if (saved[k] != null) base[k] = saved[k]; });
        if (Array.isArray(saved.lignes)) {
            base.lignes = saved.lignes.map(l => _newLine({
                vaccin: l.vaccin, statut: l.statut, date: l.date,
                rappel: l.rappel, commentaire: l.commentaire, reference: l.reference
            }));
        }
        window.vaccinationData = base;
        const wrap = document.getElementById('vaccination-container');
        if (wrap) renderVaccinationTab();
    };

    // ---- 8. Bloc PDF -------------------------------------------------------
    // Rendu dans le rapport de synthèse UNIQUEMENT si l'utilisateur l'a demandé.
    // Ce qui décide, ce sont les vaccins À FAIRE et ceux dont le statut est INCONNU :
    // ils viennent en tête. Les vaccins faits suivent, avec leur date — c'est la
    // trace qui évite la réinjection.
    window.buildVaccinationReportBlock = function () {
        const d = window.vaccinationData;
        if (!d || !Array.isArray(d.lignes) || d.lignes.length === 0) return '';
        const par = v => d.lignes.filter(l => l.statut === v && String(l.vaccin || '').trim());
        const aFaire = par('a_faire'), inconnu = par('inconnu'), faits = par('fait'), refus = par('refus');
        if (!aFaire.length && !inconnu.length && !faits.length && !refus.length) return '';

        const dateFr = s => {
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
            return m ? `${m[3]}/${m[2]}/${m[1]}` : String(s || '');
        };
        const S = { item: 'font-size:9.5px;line-height:1.55;padding:5px 0;', muted: '#5a636c', rule: '1px dotted #e4e8ec' };
        let bloc = 0;
        const ligne = (titre, corps, couleur) => {
            const h = `<div style="${S.item}${bloc ? 'border-top:' + S.rule + ';' : ''}"><strong${couleur ? ` style="color:${couleur};"` : ''}>${titre}</strong> <span style="color:${S.muted};">${corps}</span></div>`;
            bloc++; return h;
        };

        let html = `<div class="pdf-block" style="page-break-inside:avoid;break-inside:avoid;margin:0 0 14px 0;border-left:4px solid #6f42c1;border-radius:0 5px 5px 0;background:rgba(111,66,193,0.04);padding:10px 12px;">
            <div style="margin:0 0 8px 0;padding-bottom:5px;border-bottom:1px solid rgba(111,66,193,0.35);">
                <span style="font-size:10.5px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#6f42c1;">💉 Statut vaccinal</span>
            </div>`;
        if (aFaire.length) {
            html += ligne('À faire :', aFaire.map(l => _esc(l.vaccin)
                + (l.commentaire ? ` <em style="color:#8a939c;">(${_esc(l.commentaire)})</em>` : '')).join(' ; ') + '.', '#b8860b');
        }
        if (inconnu.length) {
            html += ligne('Statut non documenté — à vérifier au carnet :',
                inconnu.map(l => _esc(l.vaccin)).join(', ') + '.', '#5a636c');
        }
        if (faits.length) {
            html += ligne('Vaccinations réalisées :', faits.map(l => _esc(l.vaccin)
                + (l.date ? ` <em style="color:#8a939c;">(${_esc(dateFr(l.date))})</em>` : ' <em style="color:#8a939c;">(date non précisée)</em>')).join(' ; ') + '.');
        }
        if (refus.length) {
            html += ligne('Refus ou contre-indication :', refus.map(l => _esc(l.vaccin)
                + (l.commentaire ? ` <em style="color:#8a939c;">(${_esc(l.commentaire)})</em>` : '')).join(' ; ') + '.', '#b02a37');
        }
        if (String(d.commentaire || '').trim()) {
            html += ligne('Commentaire :', _esc(d.commentaire.trim()));
        }
        html += `</div>`;
        return html;
    };

    // ---- 9. Initialisation -------------------------------------------------
    function _init() {
        const wrap = document.getElementById('vaccination-container');
        if (!wrap) return;
        if (!window.vaccinationData.lignes.length) vaccinationAutofill();
        renderVaccinationTab();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
    else _init();
})();
