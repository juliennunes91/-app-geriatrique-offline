// app_core.js - V6.0 (Refactorisé - utilise drug_classes.js)
let activeComorbs = []; let activeMeds = []; let resultatsSynthese = ""; window.suspendedMeds = [];
let globalQT_CountKR = 0; let globalQT_CountCR_PR = 0; let scoreACB_global = 0; let scoreCIA_global = 0;
let maxQTLevel_global = 0; let infoQT_global = [];
const unifiedMedsMap = new Map(); const allComorbs = [];

// Nettoyeur universel (enlève accents, espaces, majuscules)
const sanitizeText = str => str ? String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "") : "";

window.genererPDF = function() { window.print(); };

function copierSynthese() {
    const tabs = ['alertes-scores','alertes-eviter','alertes-initier','alertes-interact','alertes-auc','alertes-ansm','alertes-bio','alertes-usage','alertes-suivi','alertes-pd'];
    const labels = ['SCORES','À ÉVITER','OMISSIONS','INTERACTIONS','PK (AUC)','ANSM','BIOLOGIE','DOSES','SUIVI','PHARMACODYNAMIE'];
    let txt = `=== GeriaAssist — Synthèse Pharmaco-Clinique ===\n`;
    txt += `Date : ${new Date().toLocaleDateString('fr-FR')} | Âge : ${document.getElementById('patientAge')?.value || '?'} | Sexe : ${document.getElementById('patientSexe')?.value || '?'}\n`;
    txt += `DFG : ${document.getElementById('patientDFG')?.value || '?'} ml/min\n`;
    txt += `Comorbidités : ${activeComorbs.map(c => MASTER_DB?.PATHOLOGIES?.[c]?.NOM_STANDARD || c).join(', ') || 'Aucune'}\n`;
    txt += `Médicaments : ${activeMeds.map(m => m.dci).join(', ') || 'Aucun'}\n\n`;
    tabs.forEach((id, i) => {
        let el = document.getElementById(id);
        if (el && el.innerText.trim()) {
            txt += `--- ${labels[i]} ---\n${el.innerText.trim()}\n\n`;
        }
    });
    navigator.clipboard.writeText(txt).then(() => {
        let btn = document.getElementById('btnCopier');
        if (btn) { btn.textContent = '✅ Copié !'; setTimeout(() => { btn.textContent = '📋 Copier'; }, 2000); }
    }).catch(() => {
        let ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    });
}

function exporterPDF() {
    const el = document.querySelector('.col-md-7 .section-box');
    if (!el) { window.print(); return; }
    if (typeof html2pdf === 'undefined') { window.print(); return; }
    const age = document.getElementById('patientAge')?.value || '?';
    const dfg = document.getElementById('patientDFG')?.value || '?';
    html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `GeriaAssist_${age}ans_DFG${dfg}_${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(el).save();
}

const patientHasMedClass = (classOrDci) => {
    let t = sanitizeText(classOrDci);
    return activeMeds.some(m => {
        let mDci = sanitizeText(m.dci); let mClasse = sanitizeText(m.classe);
        if(mDci.includes(t) || mClasse.includes(t)) return true;
        return matchesDrugClass(mDci, mClasse, t);
    });
};
