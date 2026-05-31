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
                || (kind === 'med' && present.meds.has(String(h.target.dci || '').toLowerCase()));
            const label = kind === 'patho' ? `${h.target.label} <small style="color:#6c757d">[${h.target.id}]</small>`
                : kind === 'med' ? esc(h.target.dci)
                    : `${esc(h.target.label)} = <b>${h.value}</b> ${esc(h.unit || '')} <small style="color:#6c757d">[${h.target.code}]</small>`;
            const tags = [];
            if (negated) tags.push('<span style="color:#c0392b;font-weight:bold;font-size:11px;">NIÉ</span>');
            if (inPatient) tags.push('<span style="color:#198754;font-weight:bold;font-size:11px;">DÉJÀ PRÉSENT</span>');
            if (h.source === 'abbreviation') tags.push('<span style="color:#0d6efd;font-size:11px;">abrév.</span>');
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
        const total = (r.pathologies || []).length + (r.meds || []).length + (r.biology || []).length;
        if (total === 0) {
            container.innerHTML = '<div style="color:#6c757d;font-size:13px;padding:6px;">Aucune entité détectée.</div>';
            return;
        }
        const html = [
            `<div style="font-size:12px;color:#6c757d;padding:4px 0 8px;">${total} entité(s) détectée(s) — décochez les indésirables, puis « Appliquer la sélection ».</div>`,
            renderGroup('🩺 Pathologies', r.pathologies, 'patho', text, present),
            renderGroup('💊 Médicaments', r.meds, 'med', text, present),
            renderGroup('🧪 Biologie', r.biology, 'bio', text, present)
        ].join('');
        container.innerHTML = html;
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

        const present = alreadyIn();
        const ctx = {
            already: present,
            selectComorb: (typeof selectComorb === 'function') ? selectComorb : null,
            selectMed: function (dci) {
                // selectMed prend un id de l'autocomplete ; on utilise la map unifiedMedsMap
                if (typeof selectMed !== 'function') return;
                try {
                    if (typeof unifiedMedsMap !== 'undefined' && typeof sanitizeText === 'function') {
                        const key = sanitizeText(dci);
                        if (unifiedMedsMap.has(key)) { selectMed(key); return; }
                    }
                    selectMed(dci);
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

    function bindEvents() {
        const wire = (id, fn) => { const el = $(id); if (el && !el.dataset.gxBound) { el.addEventListener('click', fn); el.dataset.gxBound = '1'; } };
        wire('btnExtractText', runExtraction);
        wire('btnExtractApply', applySelected);
        wire('btnExtractCheckAll', () => checkAll('all'));
        wire('btnExtractCheckExact', () => checkAll('exact'));
        wire('btnExtractClear', clearAll);
    }

    global.GeriaExtractorUI = { run: runExtraction, apply: applySelected, checkAll, clear: clearAll, _bind: bindEvents };

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindEvents);
        else bindEvents();
    }
})(typeof window !== 'undefined' ? window : globalThis);
