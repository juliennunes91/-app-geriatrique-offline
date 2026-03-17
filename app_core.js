// app_core.js - V6.0 (Refactorisé - utilise drug_classes.js)
let activeComorbs = []; let activeMeds = []; let resultatsSynthese = ""; window.suspendedMeds = [];
let globalQT_CountKR = 0; let globalQT_CountCR_PR = 0; let scoreACB_global = 0; let scoreCIA_global = 0;
let maxQTLevel_global = 0; let infoQT_global = [];
const unifiedMedsMap = new Map(); const allComorbs = [];

// Nettoyeur universel (enlève accents, espaces, majuscules)
const sanitizeText = str => str ? String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "") : "";

window.genererPDF = function() { window.print(); };

const patientHasMedClass = (classOrDci) => {
    let t = sanitizeText(classOrDci);
    return activeMeds.some(m => {
        let mDci = sanitizeText(m.dci); let mClasse = sanitizeText(m.classe);
        if(mDci.includes(t) || mClasse.includes(t)) return true;
        return matchesDrugClass(mDci, mClasse, t);
    });
};
