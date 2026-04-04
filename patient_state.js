// patient_state.js - Module d'état patient encapsulé
// Remplace les variables globales éparpillées dans app_core.js

const PatientState = (() => {
    let _comorbs = [];
    let _meds = [];
    let _suspended = [];
    let _scores = {
        qt_countKR: 0,
        qt_countCR_PR: 0,
        acb: 0,
        cia: 0,
        maxQTLevel: 0,
        infoQT: []
    };

    return {
        // --- Comorbidités ---
        get comorbs() { return _comorbs; },
        addComorb(id) { if (!_comorbs.includes(id)) _comorbs.push(id); },
        removeComorb(id) { _comorbs = _comorbs.filter(c => c !== id); },
        hasComorb(id) { return _comorbs.includes(id); },

        // --- Médicaments actifs ---
        get meds() { return _meds; },
        addMed(med) {
            if (!_meds.some(m => sanitizeText(m.dci) === sanitizeText(med.dci))) {
                _meds.push(med);
            }
        },
        removeMed(dci) { _meds = _meds.filter(m => m.dci !== dci); },
        hasMedDci(dci) { return _meds.some(m => sanitizeText(m.dci) === sanitizeText(dci)); },

        // --- Médicaments suspendus ---
        get suspended() { return _suspended; },
        suspend(dci) {
            const idx = _meds.findIndex(m => m.dci === dci);
            if (idx > -1) { _suspended.push(_meds[idx]); _meds.splice(idx, 1); }
        },
        unsuspend(dci) {
            const idx = _suspended.findIndex(m => m.dci === dci);
            if (idx > -1) { _meds.push(_suspended[idx]); _suspended.splice(idx, 1); }
        },
        removeSuspended(dci) { _suspended = _suspended.filter(m => m.dci !== dci); },

        // --- Scores globaux ---
        get scores() { return _scores; },
        resetScores() {
            _scores.qt_countKR = 0;
            _scores.qt_countCR_PR = 0;
            _scores.acb = 0;
            _scores.cia = 0;
            _scores.maxQTLevel = 0;
            _scores.infoQT.length = 0;
        },

        // --- Reset complet ---
        reset() {
            _comorbs.length = 0;
            _meds.length = 0;
            _suspended.length = 0;
            this.resetScores();
        },

        // --- Sérialisation ---
        toJSON() {
            return {
                comorbs: [..._comorbs],
                meds: _meds.map(m => ({ dci: m.dci, classe: m.classe, label: m.label, core_id: m.core_id })),
                suspended: _suspended.map(m => ({ dci: m.dci, classe: m.classe, label: m.label, core_id: m.core_id }))
            };
        },

        // --- Rétrocompatibilité (accès direct pour migration progressive) ---
        _internals: { get comorbs() { return _comorbs; }, get meds() { return _meds; }, get suspended() { return _suspended; } }
    };
})();

// Rétrocompatibilité : alias globaux (à supprimer progressivement)
let activeComorbs = PatientState._internals.comorbs;
let activeMeds = PatientState._internals.meds;
window.suspendedMeds = PatientState._internals.suspended;
let globalQT_CountKR = 0; let globalQT_CountCR_PR = 0;
let scoreACB_global = 0; let scoreCIA_global = 0;
let maxQTLevel_global = 0; let infoQT_global = [];
