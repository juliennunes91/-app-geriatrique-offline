// ⚙️ app_core.js - V5.3
let activeComorbs = []; let activeMeds = []; let resultatsSynthese = ""; window.suspendedMeds = [];
let globalQT_CountKR = 0; let globalQT_CountCR_PR = 0; let scoreACB_global = 0; let scoreCIA_global = 0;
let maxQTLevel_global = 0; let infoQT_global = [];
const unifiedMedsMap = new Map(); const allComorbs = [];

// Nettoyeur universel et indestructible (enlève accents, espaces, majuscules)
const sanitizeText = str => str ? String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "") : "";

window.genererPDF = function() { window.print(); };

const patientHasMedClass = (classOrDci) => {
    let t = sanitizeText(classOrDci);
    return activeMeds.some(m => {
        let mDci = sanitizeText(m.dci); let mClasse = sanitizeText(m.classe);
        if(mDci.includes(t) || mClasse.includes(t)) return true;
        if(t === 'ains' && (mClasse.includes('ains') || ['ibuprofene', 'ketoprofene', 'naproxene', 'diclofenac'].some(d => mDci.includes(d)))) return true;
        if(t === 'iec' && (mClasse.includes('iec') || mDci.includes('pril'))) return true;
        if((t === 'ara2' || t === 'ara 2') && (mClasse.includes('ara2') || mDci.includes('sartan'))) return true;
        if((t === 'beta' || t === 'beta bloquant') && (mClasse.includes('beta') || mDci.includes('lol'))) return true;
        if(t === 'anticoag' && (mClasse.includes('anticoag') || mClasse.includes('aod') || mClasse.includes('avk') || ['apixaban', 'rivaroxaban', 'dabigatran', 'warfarine', 'fluindione', 'acenocoumarol'].some(d => mDci.includes(d)))) return true;
        if((t === 'antiagreg' || t === 'aspirine') && (mClasse.includes('antiagreg') || ['aspirin', 'kardegic', 'clopidogrel', 'ticagrelor', 'prasugrel'].some(d => mDci.includes(d)))) return true;
        if(t === 'diuretique' && (mClasse.includes('diuretique') || ['furosemide', 'bumetanide', 'hydrochlorothiazide', 'indapamide', 'spironolactone', 'eplerenone', 'altizide'].some(d => mDci.includes(d)))) return true;
        if(t === 'mra' && ['spironolactone', 'eplerenone'].some(d => mDci.includes(d))) return true;
        if(t === 'sglt2' && ['dapagliflozine', 'empagliflozine', 'canagliflozine'].some(d => mDci.includes(d))) return true;
        if(t === 'arni' && ['sacubitril', 'entresto'].some(d => mDci.includes(d))) return true;
        if((t === 'isrs' || t === 'antidepresseur') && (mClasse.includes('antidepresseur') || mClasse.includes('isrs') || ['citalopram', 'escitalopram', 'sertraline', 'paroxetine', 'fluoxetine', 'venlafaxine', 'duloxetine', 'mianserine', 'mirtazapine'].some(d => mDci.includes(d)))) return true;
        if(t === 'statin' && (mClasse.includes('statin') || ['atorvastatine', 'simvastatine', 'pravastatine', 'rosuvastatine'].some(d => mDci.includes(d)))) return true;
        
        // Nouvelle classe pour Quétiapine & co
        if((t === 'antipsychotique' || t === 'neuroleptique') && (mClasse.includes('antipsychotique') || mClasse.includes('neuroleptique') || ['quetiapine', 'risperidone', 'olanzapine', 'haloperidol', 'aripiprazole', 'clozapine', 'tiapride', 'loxapine', 'cyamemazine'].some(d => mDci.includes(d)))) return true;
        
        return false;
    });
};
