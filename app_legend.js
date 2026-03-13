const FULL_LEGEND_HTML = `
<h6 class="fw-bold mb-3 border-bottom pb-1">🎨 Couleurs des Alertes</h6>
<div class="row mb-4">
    <div class="col-md-6">
        <ul class="list-unstyled small">
            <li class="mb-2"><span class="badge bg-danger" style="width: 80px;">Rouge</span> <b>Danger / À éviter :</b> Contre-indication absolue, conflit majeur (STOPP), charge anticholinergique forte.</li>
            <li class="mb-2"><span class="badge" style="background-color: #d63384; width: 80px;">Rose</span> <b>ANSM :</b> Interactions issues du Thésaurus officiel français.</li>
            <li class="mb-2"><span class="badge bg-warning text-dark" style="width: 80px;">Orange</span> <b>Prudence :</b> Interaction pharmacocinétique, cascade, risque clinique modéré.</li>
        </ul>
    </div>
    <div class="col-md-6">
        <ul class="list-unstyled small">
            <li class="mb-2"><span class="badge bg-success" style="width: 80px;">Vert</span> <b>Recommandé :</b> Omission détectée (START), posologie validée.</li>
            <li class="mb-2"><span class="badge bg-info text-dark" style="width: 80px;">Bleu</span> <b>Information :</b> Guideline (ESC, HAS), adaptation rénale, suivi.</li>
            <li class="mb-2"><span class="badge bg-secondary" style="width: 80px;">Gris</span> <b>Ignoré :</b> Recommandation désactivée (ex: patient palliatif).</li>
        </ul>
    </div>
</div>

<h6 class="fw-bold mt-4 mb-3 border-bottom pb-1">📚 Dictionnaire des Acronymes Médicaux</h6>
<div class="row">
    <div class="col-md-4">
        <h6 class="fw-bold text-primary small">💊 Classes Médicamenteuses</h6>
        <ul class="small list-unstyled ps-2 border-start border-2 border-primary mb-3">
            <li class="mb-1"><b>AC :</b> Anticholinergique</li>
            <li class="mb-1"><b>AAP :</b> Antiagrégant plaquettaire</li>
            <li class="mb-1"><b>AINS :</b> Anti-inflammatoire non stéroïdien</li>
            <li class="mb-1"><b>AOD / AVK :</b> Anticoagulant Oral Direct / Anti-Vitamine K</li>
            <li class="mb-1"><b>AP :</b> Antipsychotique (Neuroleptique)</li>
            <li class="mb-1"><b>ARA2 :</b> Antagoniste des Récepteurs de l'Angiotensine II</li>
            <li class="mb-1"><b>ARNI :</b> Inhibiteur de la Néprilysine (Entresto)</li>
            <li class="mb-1"><b>BB :</b> Bêtabloquant</li>
            <li class="mb-1"><b>BZD :</b> Benzodiazépine</li>
            <li class="mb-1"><b>IEC :</b> Inhibiteur de l'Enzyme de Conversion</li>
            <li class="mb-1"><b>IPP :</b> Inhibiteur de la Pompe à Protons</li>
            <li class="mb-1"><b>ISRS / IRSNA :</b> Inhibiteur Recapture Sérotonine / Noradrénaline</li>
            <li class="mb-1"><b>MRA :</b> Antagoniste des Récepteurs Minéralocorticoïdes</li>
            <li class="mb-1"><b>SGLT2 :</b> Gliflozines (Antidiabétique/IC)</li>
        </ul>
    </div>
    <div class="col-md-4">
        <h6 class="fw-bold text-success small">🫀 Pathologies & Syndromes</h6>
        <ul class="small list-unstyled ps-2 border-start border-2 border-success mb-3">
            <li class="mb-1"><b>AOMI :</b> Artériopathie Oblitérante des Membres Inférieurs</li>
            <li class="mb-1"><b>DFT :</b> Démence Fronto-Temporale</li>
            <li class="mb-1"><b>FA :</b> Fibrillation Atriale</li>
            <li class="mb-1"><b>HFpEF :</b> Insuffisance Cardiaque à Fraction d'Éjection Préservée</li>
            <li class="mb-1"><b>HFrEF :</b> Insuffisance Cardiaque à Fraction d'Éjection Réduite</li>
            <li class="mb-1"><b>MCL :</b> Maladie à Corps de Lewy</li>
            <li class="mb-1"><b>MRC :</b> Maladie Rénale Chronique</li>
            <li class="mb-1"><b>NAFLD :</b> Stéatose Hépatique Métabolique</li>
            <li class="mb-1"><b>SCC :</b> Syndrome Coronarien Chronique</li>
            <li class="mb-1"><b>SCPD :</b> Symptômes Comportementaux et Psychologiques de la Démence</li>
        </ul>
    </div>
    <div class="col-md-4">
        <h6 class="fw-bold text-secondary small">🧠 Scores & Général</h6>
        <ul class="small list-unstyled ps-2 border-start border-2 border-secondary mb-3">
            <li class="mb-1"><b>ACB / CIA :</b> Échelles de charge anticholinergique</li>
            <li class="mb-1"><b>BHE+ :</b> Franchit la Barrière Hémato-Encéphalique</li>
            <li class="mb-1"><b>CFS :</b> Clinical Frailty Scale (Score de fragilité)</li>
            <li class="mb-1"><b>DFGe :</b> Débit de Filtration Glomérulaire estimé</li>
            <li class="mb-1"><b>IPD :</b> Indice de Priorisation de Déprescription</li>
            <li class="mb-1"><b>QTc :</b> Espace QT corrigé</li>
        </ul>
    </div>
</div>
`;

document.addEventListener("DOMContentLoaded", function() {
    let container = document.getElementById('legendContainer');
    if(container) container.innerHTML = FULL_LEGEND_HTML;
});
