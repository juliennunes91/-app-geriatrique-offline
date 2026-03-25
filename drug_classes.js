// ============================================================================
// 💊 DRUG_CLASSES - Référentiel Unique des Classes Médicamenteuses
// Version 1.0 - Mars 2026
// ============================================================================
// Source unique de vérité pour toutes les listes de médicaments par classe.
// Utilisé par : app_core.js, app_analysis.js, geria_engine_v2.js
// ============================================================================

const DRUG_CLASSES = {

    ains: {
        aliases: ['ains', 'antiinflammatoire', 'antiinflammatoirenonsteroidien'],
        classeMatch: ['ains'],
        dcis: ['ibuprofene', 'ketoprofene', 'naproxene', 'diclofenac', 'piroxicam', 'meloxicam', 'celecoxib', 'etoricoxib', 'indometacine', 'aceclofenac']
    },
    iec: {
        aliases: ['iec', 'enzymedeconversion', 'inhibiteurenzymedelaconversion'],
        classeMatch: ['iec'],
        dciSuffix: ['pril'],
        dcis: []
    },
    ara2: {
        aliases: ['ara2', 'ara 2', 'sartan', 'angiotensine'],
        classeMatch: ['ara2'],
        dciSuffix: ['sartan'],
        dcis: []
    },
    betabloquant: {
        aliases: ['beta', 'beta bloquant', 'betabloquant', 'betabloquants'],
        classeMatch: ['beta'],
        dcis: ['bisoprolol', 'metoprolol', 'nebivolol', 'carvedilol', 'atenolol', 'propranolol', 'acebutolol', 'betaxolol', 'sotalol', 'nadolol', 'pindolol', 'timolol', 'celiprolol', 'labetalol']
    },
    diuretique: {
        aliases: ['diuretique', 'diuretiques'],
        classeMatch: ['diuretique', 'diuretique'],
        dcis: ['furosemide', 'bumetanide', 'hydrochlorothiazide', 'indapamide', 'spironolactone', 'altizide', 'chlortalidone', 'amiloride', 'triamterene', 'eplerenone']
    },
    anticoagulant: {
        aliases: ['anticoag', 'anticoagulant', 'aod', 'avk'],
        classeMatch: ['anticoag', 'aod', 'avk'],
        dcis: ['apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban', 'acenocoumarol', 'warfarine', 'fluindione', 'enoxaparine', 'tinzaparine', 'dalteparine', 'fondaparinux']
    },
    antiagregant: {
        aliases: ['antiagreg', 'antiagregant', 'aspirine', 'acetylsalicylique'],
        classeMatch: ['antiagreg', 'antiagr'],
        dcis: ['acideacetylsalicylique', 'clopidogrel', 'prasugrel', 'ticagrelor', 'ticlopidine', 'dipyridamole']
    },
    antipsychotique: {
        aliases: ['antipsychotique', 'neuroleptique'],
        classeMatch: ['antipsychotique', 'neuroleptique'],
        dcis: ['quetiapine', 'risperidone', 'olanzapine', 'haloperidol', 'aripiprazole', 'clozapine', 'tiapride', 'loxapine', 'cyamemazine']
    },
    benzodiazepine: {
        aliases: ['benzodiazepine', 'benzodiazepines'],
        classeMatch: ['benzodiaz', 'hypnotique'],
        dcis: ['diazepam', 'lorazepam', 'oxazepam', 'bromazepam', 'alprazolam', 'clonazepam', 'clorazepate', 'prazepam', 'zolpidem', 'zopiclone', 'lormetazepam', 'nitrazepam', 'midazolam']
    },
    isrs: {
        aliases: ['isrs', 'ssri'],
        classeMatch: ['isrs', 'ssri'],
        dcis: ['citalopram', 'escitalopram', 'sertraline', 'paroxetine', 'fluoxetine', 'fluvoxamine']
    },
    irsn: {
        aliases: ['irsn', 'snri'],
        classeMatch: [],
        dcis: ['venlafaxine', 'duloxetine', 'milnacipran', 'desvenlafaxine']
    },
    antidepresseur: {
        aliases: ['antidepresseur', 'serotonine'],
        classeMatch: ['antidepresseur'],
        dcis: ['citalopram', 'escitalopram', 'sertraline', 'paroxetine', 'fluoxetine', 'venlafaxine', 'duloxetine', 'mianserine', 'mirtazapine', 'amitriptyline', 'fluvoxamine', 'milnacipran']
    },
    antidepresseur_tricyclique: {
        aliases: ['antidepresseurtricyclique'],
        classeMatch: ['tricyclique'],
        dcis: ['amitriptyline', 'clomipramine', 'imipramine', 'doxepine', 'nortriptyline']
    },
    opioid: {
        aliases: ['opioid', 'opioide', 'opiace'],
        classeMatch: ['opio'],
        dcis: ['morphine', 'oxycodone', 'fentanyl', 'buprenorphine', 'tramadol', 'codeine', 'pethidine', 'methadone']
    },
    statine: {
        aliases: ['statine', 'statines'],
        classeMatch: ['statine'],
        dciSuffix: ['statine', 'vastatine'],
        dcis: ['atorvastatine', 'simvastatine', 'pravastatine', 'rosuvastatine', 'fluvastatine']
    },
    ipp: {
        aliases: ['ipp', 'inhibiteurpompe'],
        classeMatch: ['ipp', 'inhibiteurpompe'],
        dcis: ['omeprazole', 'esomeprazole', 'lansoprazole', 'pantoprazole', 'rabeprazole']
    },
    corticoide: {
        aliases: ['corticoide', 'corticoidesystemique'],
        classeMatch: ['corticoidesystemique', 'corticoide'],
        dcis: ['prednisone', 'prednisolone', 'methylprednisolone', 'dexamethasone', 'betamethasone', 'hydrocortisone']
    },
    arni: {
        aliases: ['arni'],
        classeMatch: [],
        dcis: ['sacubitrilvalsartan']
    },
    mra: {
        aliases: ['mra'],
        classeMatch: [],
        dcis: ['spironolactone', 'eplerenone', 'aldactazine']
    },
    sglt2: {
        aliases: ['sglt2', 'isglt2'],
        classeMatch: ['sglt2'],
        dcis: ['canagliflozin', 'dapagliflozin', 'empagliflozin', 'ertugliflozin']
    },
    inhibiteur_calcique: {
        aliases: ['inhibiteurcalcique', 'calcique'],
        classeMatch: ['inhibiteurcalcique', 'calcique'],
        dcis: ['amlodipine', 'nifedipine', 'felodipine', 'lercanidipine', 'nicardipine', 'diltiazem', 'verapamil', 'manidipine']
    },
    antiepileptique: {
        aliases: ['antiepileptique'],
        classeMatch: ['antiepileptique'],
        dcis: ['valproate', 'carbamazepine', 'phenytoine', 'lamotrigine', 'levetiracetam', 'pregabaline', 'gabapentine', 'topiramate', 'lacosamide']
    },
    macrolide: {
        aliases: ['macrolide'],
        classeMatch: ['macrolide'],
        dcis: ['clarithromycine', 'erythromycine', 'azithromycine', 'roxithromycine', 'spiramycine']
    },
    inducteur_enzymatique: {
        aliases: ['inducteurenzymatique'],
        classeMatch: [],
        dcis: ['rifampicine', 'rifabutine', 'millepertuis', 'carbamazepine', 'phenytoine', 'phenobarbital', 'primidone', 'efavirenz', 'nevirapine', 'bosentan', 'enzalutamide']
    },
    inhibiteur_cyp3a4: {
        aliases: ['inhibiteurcyp3a4'],
        classeMatch: [],
        dcis: ['ritonavir', 'clarithromycine', 'erythromycine', 'telithromycine', 'itraconazole', 'ketoconazole', 'posaconazole', 'voriconazole', 'idelalisib', 'cobicistat', 'jusdepamplemousse', 'pamplemousse']
    },
    inhibiteur_protease: {
        aliases: ['inhibiteurprotease'],
        classeMatch: [],
        dcis: ['darunavir', 'atazanavir', 'lopinavir', 'ritonavir']
    }
};

// ============================================================================
// Moteur de matching unifié
// ============================================================================

/**
 * Vérifie si un médicament (dci + classe) correspond à une classe thérapeutique donnée.
 * @param {string} dci - DCI normalisée (sanitizeText appliqué)
 * @param {string} classe - Classe normalisée (sanitizeText appliqué)
 * @param {string} key - Clé de classe recherchée (normalisée)
 * @returns {boolean}
 */
function matchesDrugClass(dci, classe, key) {
    // Recherche directe dans le référentiel
    for (const [classId, def] of Object.entries(DRUG_CLASSES)) {
        if (def.aliases.some(a => key === a || key.includes(a))) {
            // Match par classe
            if (def.classeMatch.some(cm => classe.includes(cm))) return true;
            // Match par DCI exacte
            if (def.dcis.some(d => dci.includes(d))) return true;
            // Match par suffixe DCI
            if (def.dciSuffix && def.dciSuffix.some(s => dci.includes(s))) return true;
            return false;
        }
    }
    // Cas spécial : antihypertenseur (composite)
    if (key === 'antihypertenseur') {
        return classe.includes('hypertens') ||
            matchesDrugClass(dci, classe, 'iec') ||
            matchesDrugClass(dci, classe, 'ara2') ||
            matchesDrugClass(dci, classe, 'inhibiteurcalcique') ||
            matchesDrugClass(dci, classe, 'diuretique') ||
            matchesDrugClass(dci, classe, 'betabloquant');
    }
    // Fallback : matching direct DCI/classe
    return dci.includes(key) || classe.includes(key) || key.includes(dci);
}

/**
 * Version avec gestion du pluriel et ANSM (pour medMatchesAnsmTerm).
 * Normalise le terme de recherche (pluriels, accords) avant matching.
 */
function matchesDrugClassAnsm(dci, classe, rawTerm) {
    let t = rawTerm;
    // Gestion pluriels
    if (t.endsWith('s') && !t.includes('ains') && !t.includes('isrs')) t = t.slice(0, -1);
    if (t.endsWith('aux')) t = t.replace('aux', 'al');
    // Matching direct DCI/classe avant le référentiel
    if (dci.includes(t) || t.includes(dci)) return true;
    if (classe.includes(t) || t.includes(classe)) return true;
    // Matching via référentiel
    return matchesDrugClass(dci, classe, t);
}
