// =========================================================================
// 🎨 MOTEUR D'INTERFACE UTILISATEUR (app_ui.js) - OPTIMISÉ
// =========================================================================

let alertBuffer = {
    urgences: [], // Priorité Absolue
    eviter: [],   // STOPP / Beers
    bio: [],      // Anomalies biologiques
    initier: [],  // START
    pk: [],       // Pharmacocinétique
    interact: [], // Interactions
    suivi: [],    // Suivi biologique
    usage: []     // Posologies
};

function addAlert(targetDivId, htmlContent, category) {
    if (!htmlContent) return;
    
    // Triage clinique automatique : si c'est rouge ou 🚨, ça part en haut !
    let isUrgent = htmlContent.includes('alert-stopp') || htmlContent.includes('🚨');
    
    if (isUrgent) {
        alertBuffer.urgences.push(htmlContent);
    } else if (category && alertBuffer[category] !== undefined) {
        alertBuffer[category].push(htmlContent);
    } else {
        alertBuffer.eviter.push(htmlContent);
    }
}

function renderAllAlerts() {
    console.log("🎨 Injection des alertes dans le DOM...");
    
    const divs = ['alertes-eviter', 'alertes-initier', 'alertes-bio', 'alertes-interact', 'alertes-auc', 'alertes-suivi', 'alertes-usage'];
    divs.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.innerHTML = ''; 
    });

    // 1. Les urgences vitales tout en haut (dans la div 'alertes-eviter')
    let divEviter = document.getElementById('alertes-eviter');
    if (divEviter && alertBuffer.urgences.length > 0) {
        let urgencesHtml = `
            <div class="alert alert-danger shadow mb-4" style="border-left: 6px solid darkred;">
                <h5 class="alert-heading fw-bold">🚨 URGENCES MAJEURES DÉTECTÉES (${alertBuffer.urgences.length})</h5>
                <hr style="opacity:0.2">
                ${alertBuffer.urgences.join('')}
            </div>`;
        divEviter.insertAdjacentHTML('beforeend', urgencesHtml);
    }

    // 2. Le reste des alertes dans leurs onglets respectifs
    if (divEviter && alertBuffer.eviter.length > 0) divEviter.insertAdjacentHTML('beforeend', alertBuffer.eviter.join(''));
    if (document.getElementById('alertes-initier') && alertBuffer.initier.length > 0) document.getElementById('alertes-initier').insertAdjacentHTML('beforeend', alertBuffer.initier.join(''));
    if (document.getElementById('alertes-bio') && alertBuffer.bio.length > 0) document.getElementById('alertes-bio').insertAdjacentHTML('beforeend', alertBuffer.bio.join(''));
    if (document.getElementById('alertes-interact') && alertBuffer.interact.length > 0) document.getElementById('alertes-interact').insertAdjacentHTML('beforeend', alertBuffer.interact.join(''));
    if (document.getElementById('alertes-auc') && alertBuffer.pk.length > 0) document.getElementById('alertes-auc').insertAdjacentHTML('beforeend', alertBuffer.pk.join(''));
    if (document.getElementById('alertes-suivi') && alertBuffer.suivi.length > 0) document.getElementById('alertes-suivi').insertAdjacentHTML('beforeend', alertBuffer.suivi.join(''));
    if (document.getElementById('alertes-usage') && alertBuffer.usage.length > 0) document.getElementById('alertes-usage').insertAdjacentHTML('beforeend', alertBuffer.usage.join(''));

    // Optionnel : Afficher le bouton PDF
    let btnPdf = document.getElementById('btnPdf'); 
    if(btnPdf) btnPdf.style.display = 'inline-block';
}

function resetUI() {
    alertBuffer = { urgences: [], eviter: [], bio: [], initier: [], pk: [], interact: [], suivi: [], usage: [] };
    renderAllAlerts();
}
