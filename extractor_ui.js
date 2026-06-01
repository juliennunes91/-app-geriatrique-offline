// extractor_ui.js — UI minimaliste pour l'extracteur de texte libre (POC Tier 1).
// Branche le moteur GeriaTextExtractor sur le DOM, rend les résultats groupés
// avec cases à cocher et boutons d'action en masse, applique les éléments
// acceptés à l'état patient via selectComorb/selectMed/setBio existants.
//
// Éléments DOM attendus (mêmes ids dans index.html et index_modern.html) :
//   - <textarea id="extractorText">         — zone de saisie
//   - <button   id="btnExtractText">        — déclenche l'extraction
//   - <div      id="extractorResults">      — conteneur des résultats
//   - <button   id="btnExtractApply">       — applique la sélection
//   - <button   id="btnExtractCheckAll">    — coche tout
//   - <button   id="btnExtractCheckExact">  — coche seulement les exacts (non niés)
//   - <button   id="btnExtractClear">       — vide la sélection / les résultats
(function (global) {
    'use strict';

    let _lastResults = null;
    const BIO_INPUT_BY_CODE = {
        BIO_001: 'patientK', BIO_002: 'patientNa', BIO_003: 'bioCreat', BIO_004: 'patientDFG',
        BIO_005: 'bioCa', BIO_006: 'bioMg', BIO_007: 'bioUree', BIO_008: 'bioUric',
        BIO_009: 'bioHb', BIO_010: 'bioPlaq', BIO_013: 'bioAsat', BIO_014: 'bioAlat',
        BIO_015: 'bioGgt', BIO_016: 'bioPal', BIO_017: 'bioBili', BIO_019: 'bioTsh',
        BIO_020: 'bioFer', BIO_021: 'bioB12', BIO_023: 'bioVitD',
        BIO_025: 'bioGly', BIO_026: 'bioHba1c', BIO_028: 'bioBnp',
        BIO_030: 'bioInr', BIO_031: 'bioQtc', BIO_046: 'bioAlbuminurie'
    };

    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

    function snippet(fullText, hit, around = 25) {
        const s = Math.max(0, hit.start - around);
        const e = Math.min(fullText.length, hit.end + around);
        const pre = (s > 0 ? '…' : '') + fullText.slice(s, hit.start);
        const mid = fullText.slice(hit.start, hit.end);
        const post = fullText.slice(hit.end, e) + (e < fullText.length ? '…' : '');
        return `${esc(pre)}<mark style="background:#fff3cd;padding:0 2px;border-radius:2px;">${esc(mid)}</mark>${esc(post)}`;
    }

    function alreadyIn() {
        const out = { comorbs: new Set(), meds: new Set() };
        try { (typeof activeComorbs !== 'undefined' ? activeComorbs : []).forEach(c => out.comorbs.add(c)); } catch (e) { /* */ }
        try { (typeof activeMeds !== 'undefined' ? activeMeds : []).forEach(m => out.meds.add(String(m.dci || m.label || '').toLowerCase())); } catch (e) { /* */ }
        return out;
    }

    function renderGroup(title, items, kind, fullText, present) {
        if (!items || !items.length) return '';
        const rows = items.map((h, i) => {
            const id = `extr_${kind}_${i}`;
            const negated = !!h.negated;
            const inPatient = (kind === 'patho' && present.comorbs.has(h.target.id))
                || (kind === 'med' && present.meds.has(String(h.target.dci || '').toLowerCase()))
                || (kind === 'allergy');  // allergies non auto-appliquées (signalement seulement)
            // Construction du libellé principal
            let label;
            if (kind === 'patho') {
                label = `${esc(h.target.label)} <small style="color:#6c757d">[${h.target.id}]</small>`;
            } else if (kind === 'med') {
                const p = h.posology;
                const poso = p ? ` <span style="color:#0d6efd;font-weight:600;">${p.dose}${esc(p.unite)}${p.frequence ? ' ×' + p.frequence : ''}${p.periode ? '/' + esc(p.periode) : ''}</span>` : '';
                const duree = p && p.duree ? ` <span style="color:#6f42c1;font-size:11px;">⏱ ${p.duree.jours}j (${esc(p.duree.classe)})</span>` : '';
                label = `${esc(h.target.dci)}${poso}${duree}`;
            } else if (kind === 'allergy') {
                const dci = h.target && h.target.dci;
                label = `<b>${esc(h.substance)}</b>${dci ? ` <small style="color:#0d6efd;">→ ${esc(dci)}</small>` : ' <small style="color:#6c757d;">(générique)</small>'}`;
            } else {
                const conv = h.converted ? ` <small style="color:#fd7e14;" title="converti depuis ${esc(h.originalValue)} ${esc(h.originalUnit)}">⇄ converti</small>` : '';
                label = `${esc(h.target.label)} = <b>${h.value}</b> ${esc(h.unit || '')} <small style="color:#6c757d">[${h.target.code}]</small>${conv}`;
            }
            // Badges
            const tags = [];
            if (negated) tags.push('<span style="color:#c0392b;font-weight:bold;font-size:11px;">NIÉ</span>');
            if (inPatient) tags.push('<span style="color:#198754;font-weight:bold;font-size:11px;">DÉJÀ PRÉSENT</span>');
            if (h.historical && !negated) tags.push('<span style="color:#6f42c1;font-weight:bold;font-size:11px;">ATCD</span>');
            if (h.source === 'abbreviation') tags.push('<span style="color:#0d6efd;font-size:11px;">abrév.</span>');
            if (h.source === 'fuzzy') tags.push(`<span style="color:#fd7e14;font-size:11px;" title="distance ${h.fuzzyDistance}">fuzzy</span>`);
            if (typeof h.confidence === 'number' && h.confidence < 100) {
                const c = h.confidence;
                const col = c >= 90 ? '#198754' : (c >= 70 ? '#fd7e14' : '#c0392b');
                tags.push(`<span style="color:${col};font-size:10px;font-weight:600;" title="Confiance">${c}%</span>`);
            }
            const checked = (!negated && !inPatient) ? 'checked' : '';
            const disabled = inPatient ? 'disabled' : '';
            return `<div style="display:flex;align-items:flex-start;gap:8px;padding:4px 0;border-bottom:1px solid #f0f0f0;">
                <input type="checkbox" id="${id}" data-kind="${kind}" data-idx="${i}" ${checked} ${disabled} ${negated ? 'data-negated="1"' : ''} style="margin-top:4px;">
                <label for="${id}" style="flex:1;cursor:${disabled ? 'not-allowed' : 'pointer'};font-size:13px;">
                    <div>${label} ${tags.join(' ')}</div>
                    <div style="font-size:11px;color:#6c757d;margin-top:2px;">${snippet(fullText, h)}</div>
                </label>
            </div>`;
        }).join('');
        return `<details open style="margin-bottom:8px;"><summary style="font-weight:bold;font-size:13px;cursor:pointer;padding:4px 0;">${title} <span style="color:#6c757d;font-weight:normal;">(${items.length})</span></summary><div style="padding-left:8px;">${rows}</div></details>`;
    }

    function renderConflicts(conflicts) {
        if (!conflicts || !conflicts.length) return '';
        const rows = conflicts.map(c =>
            `<div style="padding:4px 0;"><strong>${esc(c.labels.join(' vs '))}</strong> — ${esc(c.reason)}</div>`
        ).join('');
        return `<div style="background:#f8d7da;color:#842029;border:1px solid #f5c2c7;padding:8px 12px;border-radius:6px;margin-bottom:10px;font-size:12px;">
            <div style="font-weight:bold;margin-bottom:4px;">⚠️ ${conflicts.length} conflit${conflicts.length > 1 ? 's' : ''} à arbitrer (cliniquement exclusifs) :</div>
            ${rows}
            <div style="margin-top:4px;font-style:italic;">Décochez l'une des deux propositions avant d'appliquer.</div>
        </div>`;
    }

    function renderAmbiguous(items, fullText) {
        if (!items || !items.length) return '';
        const rows = items.map((h, i) => {
            const radios = h.alternatives.map((alt, j) => {
                const rid = `extr_amb_${i}_${j}`;
                return `<label style="display:inline-flex;align-items:center;gap:4px;margin-right:12px;font-size:13px;cursor:pointer;">
                    <input type="radio" name="extr_amb_${i}" id="${rid}" data-amb-idx="${i}" data-alt-id="${esc(alt.id)}" ${j === 0 ? 'checked' : ''}>
                    ${esc(alt.label)} <small style="color:#6c757d;">[${esc(alt.id)}]</small>
                </label>`;
            }).join('');
            return `<div style="padding:4px 0;border-bottom:1px solid #f0f0f0;">
                <div style="font-size:13px;"><b>« ${esc(h.match)} »</b> <small style="color:#6c757d;">→ choisir :</small></div>
                <div style="margin:4px 0 2px 8px;">${radios}</div>
                <div style="font-size:11px;color:#6c757d;margin-left:8px;">${snippet(fullText, h)}</div>
            </div>`;
        }).join('');
        return `<details open style="margin-bottom:8px;background:#fff3cd;border:1px solid #ffe69c;border-radius:6px;padding:6px 10px;">
            <summary style="font-weight:bold;font-size:13px;cursor:pointer;color:#664d03;">🤔 Ambiguïtés (${items.length}) — choisissez avant d'appliquer</summary>
            <div style="padding-left:8px;margin-top:4px;">${rows}</div>
        </details>`;
    }

    function runExtraction() {
        const ta = $('extractorText'); if (!ta) return;
        const text = ta.value || '';
        const container = $('extractorResults');
        if (!container) return;
        if (!text.trim()) {
            container.innerHTML = '<div style="color:#6c757d;font-size:13px;padding:6px;">Collez d\'abord un texte clinique ci-dessus.</div>';
            return;
        }
        if (typeof MASTER_DB === 'undefined' || typeof GeriaTextExtractor === 'undefined') {
            container.innerHTML = '<div style="color:#c0392b;">Moteur indisponible.</div>';
            return;
        }
        _lastResults = GeriaTextExtractor.extract(text, MASTER_DB);
        const present = alreadyIn();
        const r = _lastResults;
        const total = (r.pathologies || []).length + (r.meds || []).length + (r.biology || []).length + (r.allergies || []).length;
        if (total === 0) {
            container.innerHTML = '<div style="color:#6c757d;font-size:13px;padding:6px;">Aucune entité détectée.</div>';
            return;
        }
        const allergiesCount = (r.allergies || []).length;
        const ambiguousCount = (r.ambiguous || []).length;
        const stoppedCount = (r.stoppedMeds || []).length;
        const total2 = total + allergiesCount + ambiguousCount + stoppedCount;
        const stoppedHtml = stoppedCount ? renderStopped(r.stoppedMeds, text) : '';
        const html = [
            renderConflicts(r.conflicts),
            renderAmbiguous(r.ambiguous, text),
            `<div style="font-size:12px;color:#6c757d;padding:4px 0 8px;">${total2} entité(s) détectée(s) — décochez les indésirables, puis « Appliquer la sélection ».</div>`,
            renderGroup('🩺 Pathologies', r.pathologies, 'patho', text, present),
            renderGroup('💊 Médicaments', r.meds, 'med', text, present),
            stoppedHtml,
            renderGroup('🧪 Biologie', r.biology, 'bio', text, present),
            renderGroup('⚠️ Allergies (signalement)', r.allergies, 'allergy', text, present)
        ].join('');
        container.innerHTML = html;
    }

    function renderStopped(items, fullText) {
        if (!items || !items.length) return '';
        const rows = items.map(h => {
            return `<div style="padding:4px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">
                <span style="text-decoration:line-through;color:#6c757d;">${esc(h.target.dci)}</span>
                <span style="color:#c0392b;font-weight:bold;font-size:11px;margin-left:6px;">STOP</span>
                <div style="font-size:11px;color:#6c757d;margin-top:2px;">${snippet(fullText, h)}</div>
            </div>`;
        }).join('');
        return `<details style="margin-bottom:8px;background:#fff3cd;border:1px solid #ffe69c;border-radius:6px;padding:6px 10px;">
            <summary style="font-weight:bold;font-size:13px;cursor:pointer;color:#664d03;">🛑 Médicaments arrêtés/sevrés (${items.length}) — informationnel, non appliqués</summary>
            <div style="padding-left:8px;margin-top:4px;">${rows}</div>
        </details>`;
    }

    function checkAll(mode) {
        const cbs = document.querySelectorAll('#extractorResults input[type="checkbox"]');
        cbs.forEach(cb => {
            if (cb.disabled) return;
            if (mode === 'all') cb.checked = true;
            else if (mode === 'none') cb.checked = false;
            else if (mode === 'exact') cb.checked = !cb.dataset.negated;
        });
    }

    function applySelected() {
        if (!_lastResults) return;
        const r = _lastResults;
        const accepted = { pathologies: [], meds: [], biology: [] };
        document.querySelectorAll('#extractorResults input[type="checkbox"]').forEach(cb => {
            if (!cb.checked || cb.disabled) return;
            const kind = cb.dataset.kind, idx = +cb.dataset.idx;
            if (kind === 'patho' && r.pathologies[idx]) accepted.pathologies.push(r.pathologies[idx]);
            else if (kind === 'med' && r.meds[idx]) accepted.meds.push(r.meds[idx]);
            else if (kind === 'bio' && r.biology[idx]) accepted.biology.push(r.biology[idx]);
        });
        // Ambiguïtés résolues par radio
        const ambByGroup = {};
        document.querySelectorAll('#extractorResults input[type="radio"][data-amb-idx]').forEach(rd => {
            if (!rd.checked) return;
            ambByGroup[rd.dataset.ambIdx] = rd.dataset.altId;
        });
        Object.entries(ambByGroup).forEach(([idx, altId]) => {
            const amb = (r.ambiguous || [])[+idx];
            if (!amb) return;
            const alt = amb.alternatives.find(a => a.id === altId);
            if (alt) accepted.pathologies.push({ target: { id: alt.id, label: alt.label }, source: 'abbreviation', match: amb.match });
        });

        const present = alreadyIn();
        const ctx = {
            already: present,
            selectComorb: (typeof selectComorb === 'function') ? selectComorb : null,
            selectMed: function (dci, posology) {
                if (typeof selectMed !== 'function') return;
                try {
                    if (typeof unifiedMedsMap !== 'undefined' && typeof sanitizeText === 'function') {
                        const key = sanitizeText(dci);
                        if (unifiedMedsMap.has(key)) selectMed(key);
                        else selectMed(dci);
                    } else {
                        selectMed(dci);
                    }
                    // Attacher la posologie au médicament fraîchement ajouté
                    if (posology && typeof activeMeds !== 'undefined' && typeof sanitizeText === 'function') {
                        const key = sanitizeText(dci);
                        const found = activeMeds.find(m => sanitizeText(m.dci) === key);
                        if (found) {
                            found.precisions = Object.assign({}, found.precisions || {}, {
                                dose: posology.dose, unite: posology.unite,
                                frequence: posology.frequence, periode: posology.periode,
                                raw: posology.raw, source: 'extracteur'
                            });
                        }
                    }
                } catch (e) { console.warn('selectMed failed for', dci, e); }
            },
            setBioValue: function (code, value) {
                const inputId = BIO_INPUT_BY_CODE[code]; if (!inputId) return;
                const el = document.getElementById(inputId); if (!el) return;
                el.value = String(value);
                try { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) { /* */ }
            }
        };
        const summary = GeriaTextExtractor.applyResults(accepted, ctx);
        const note = $('extractorResults');
        if (note) {
            const total = summary.comorbs + summary.meds + summary.bio;
            const banner = `<div style="background:#d1e7dd;color:#0f5132;padding:6px 10px;border-radius:6px;margin-bottom:8px;font-size:13px;">✅ Appliqué : ${summary.comorbs} pathologie(s), ${summary.meds} médicament(s), ${summary.bio} bio${summary.skipped ? ` (${summary.skipped} ignoré(s) car déjà présents)` : ''}.</div>`;
            note.innerHTML = banner + note.innerHTML;
        }
        // Rafraîchir les tags patient si la fonction est dispo
        try { if (typeof renderTags === 'function') renderTags(); } catch (e) { /* */ }
    }

    function clearAll() {
        const ta = $('extractorText'); if (ta) ta.value = '';
        const c = $('extractorResults'); if (c) c.innerHTML = '';
        _lastResults = null;
    }

    function exportJson() {
        if (!_lastResults) return;
        const blob = JSON.stringify({
            extractedAt: new Date().toISOString(),
            sourceText: ($('extractorText') || {}).value || '',
            results: _lastResults
        }, null, 2);
        try {
            const a = document.createElement('a');
            a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(blob);
            a.download = `extraction-${Date.now()}.json`;
            document.body.appendChild(a); a.click(); a.remove();
        } catch (e) {
            // Fallback : copier dans le presse-papier
            try { navigator.clipboard.writeText(blob); alert('JSON copié dans le presse-papier'); } catch (e2) { console.log(blob); }
        }
    }

    function bindEvents() {
        const wire = (id, fn) => { const el = $(id); if (el && !el.dataset.gxBound) { el.addEventListener('click', fn); el.dataset.gxBound = '1'; } };
        wire('btnExtractText', runExtraction);
        wire('btnExtractApply', applySelected);
        wire('btnExtractCheckAll', () => checkAll('all'));
        wire('btnExtractCheckExact', () => checkAll('exact'));
        wire('btnExtractClear', clearAll);
        wire('btnExtractExport', exportJson);
    }

    global.GeriaExtractorUI = { run: runExtraction, apply: applySelected, checkAll, clear: clearAll, exportJson, _bind: bindEvents };

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindEvents);
        else bindEvents();
    }
})(typeof window !== 'undefined' ? window : globalThis);
