// ============================================================================
// 💊 DRUG_CLASSES - Référentiel Unique des Classes Médicamenteuses
// Version 1.0 - Mars 2026
// ============================================================================
// Source unique de vérité pour toutes les listes de médicaments par classe.
// Utilisé par : app_core.js, app_analysis.js, geria_engine_v2.js
// ============================================================================
// Sources: Classification ATC OMS 2024 | ANSM Thesaurus 2024
//          Beers Criteria (AGS 2023) | STOPP/START v3 (2023)
//          RCP Vidal 2024 | CredibleMeds QT (Woosley 2024)

const DRUG_CLASSES = {

    ains: {
        aliases: ['ains', 'antiinflammatoire', 'antiinflammatoirenonsteroidien', 'antiinflammatoiresnonsteroidien', 'autresantiinflammatoiresnonsteroidien'],
        classeMatch: ['ains'],
        dcis: ['ibuprofene', 'ketoprofene', 'naproxene', 'diclofenac', 'piroxicam', 'meloxicam', 'celecoxib', 'etoricoxib', 'indometacine', 'aceclofenac']
    },
    iec: {
        aliases: ['iec', 'enzymedeconversion', 'inhibiteurenzymedelaconversion', 'inhibiteursdelenzymedelaconversion', 'inhibiteursdelenzymedelaconversion'],
        classeMatch: ['iec'],
        dciSuffix: ['pril'],
        dcis: []
    },
    ara2: {
        aliases: ['ara2', 'ara2', 'sartan', 'angiotensine', 'antagonistesdesrecepteursdelangiotensineii', 'antagonistesdesrecepteursdelangiotensine'],
        classeMatch: ['ara2'],
        dciSuffix: ['sartan'],
        dcis: []
    },
    betabloquant: {
        aliases: ['beta', 'betabloquant', 'betabloquants', 'betabloquantsdanslinsuffisancecardiaque'],
        classeMatch: ['beta'],
        dcis: ['bisoprolol', 'metoprolol', 'nebivolol', 'carvedilol', 'atenolol', 'propranolol', 'acebutolol', 'betaxolol', 'sotalol', 'nadolol', 'pindolol', 'timolol', 'celiprolol', 'labetalol']
    },
    diuretique: {
        aliases: ['diuretique', 'diuretiques', 'diuretiqueshypokaliemiant', 'autreshypokaliemiant', 'hypokaliemiant'],
        classeMatch: ['diuretique'],
        dcis: ['furosemide', 'bumetanide', 'hydrochlorothiazide', 'indapamide', 'spironolactone', 'altizide', 'chlortalidone', 'amiloride', 'triamterene', 'eplerenone', 'piretanide', 'torasemide', 'cicletanide']
    },
    diuretique_anse: {
        aliases: ['diuretiquedelanse', 'diuretiquesdelanse'],
        classeMatch: ['diuretiquedelanse'],
        dcis: ['furosemide', 'bumetanide', 'piretanide', 'torasemide']
    },
    diuretique_thiazidique: {
        aliases: ['diuretiquethiazidique', 'diuretiquesthiazidiquesetapparente'],
        classeMatch: ['thiazid'],
        dcis: ['hydrochlorothiazide', 'indapamide', 'chlortalidone', 'cicletanide']
    },
    anticoagulant: {
        aliases: ['anticoag', 'anticoagulant', 'aod', 'avk', 'antivitaminesk', 'anticoagulantsoraux', 'autresanticoagulantsoraux', 'antiinfectieuxethemostase'],
        classeMatch: ['anticoag', 'aod', 'avk'],
        dcis: ['apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban', 'acenocoumarol', 'warfarine', 'fluindione', 'enoxaparine', 'tinzaparine', 'dalteparine', 'fondaparinux']
    },
    heparine: {
        aliases: ['heparine', 'heparinesdosescurativesetousujetage'],
        classeMatch: ['hbpm', 'heparine'],
        dcis: ['enoxaparine', 'tinzaparine', 'dalteparine', 'fondaparinux']
    },
    antiagregant: {
        aliases: ['antiagreg', 'antiagregant', 'aspirine', 'acetylsalicylique', 'antiagregantplaquettaire', 'antiagregantplaquettaires'],
        classeMatch: ['antiagreg', 'antiagr'],
        dcis: ['acideacetylsalicylique', 'clopidogrel', 'prasugrel', 'ticagrelor', 'ticlopidine', 'dipyridamole']
    },
    antipsychotique: {
        aliases: ['antipsychotique', 'neuroleptique', 'neuroleptiques', 'neuroleptiquesantiemetique'],
        classeMatch: ['antipsychotique', 'neuroleptique'],
        dcis: ['quetiapine', 'risperidone', 'olanzapine', 'haloperidol', 'aripiprazole', 'clozapine', 'tiapride', 'loxapine', 'cyamemazine', 'paliperidone', 'amisulpride', 'sulpiride', 'pipamperone']
    },
    benzodiazepine: {
        aliases: ['benzodiazepine', 'benzodiazepines', 'benzodiazepinesetapparente'],
        classeMatch: ['benzodiaz', 'hypnotique'],
        dcis: ['diazepam', 'lorazepam', 'oxazepam', 'bromazepam', 'alprazolam', 'clonazepam', 'clorazepate', 'prazepam', 'zolpidem', 'zopiclone', 'lormetazepam', 'nitrazepam', 'midazolam']
    },
    isrs: {
        aliases: ['isrs', 'ssri', 'inhibiteursselectifsdelarecapturedelaserotonine'],
        classeMatch: ['isrs', 'ssri'],
        dcis: ['citalopram', 'escitalopram', 'sertraline', 'paroxetine', 'fluoxetine', 'fluvoxamine']
    },
    irsn: {
        aliases: ['irsn', 'snri', 'medicamentsmixtesadrenergiquesserotoninergiqu'],
        classeMatch: [],
        dcis: ['venlafaxine', 'duloxetine', 'milnacipran', 'desvenlafaxine']
    },
    antidepresseur: {
        aliases: ['antidepresseur', 'serotonine'],
        classeMatch: ['antidepresseur'],
        dcis: ['citalopram', 'escitalopram', 'sertraline', 'paroxetine', 'fluoxetine', 'venlafaxine', 'duloxetine', 'mianserine', 'mirtazapine', 'amitriptyline', 'fluvoxamine', 'milnacipran']
    },
    antidepresseur_tricyclique: {
        aliases: ['antidepresseurtricyclique', 'antidepresseursimipraminique', 'imipraminique'],
        classeMatch: ['tricyclique', 'imipraminique'],
        dcis: ['amitriptyline', 'clomipramine', 'imipramine', 'doxepine', 'nortriptyline', 'trimipramine', 'dosulpine']
    },
    opioid: {
        aliases: ['opioid', 'opioide', 'opiace', 'morphinique'],
        classeMatch: ['opio', 'morphinique'],
        dcis: ['morphine', 'oxycodone', 'fentanyl', 'buprenorphine', 'tramadol', 'codeine', 'pethidine', 'methadone', 'alfentanil', 'sufentanil']
    },
    statine: {
        aliases: ['statine', 'statines', 'inhibiteursdelhmgcoareductasestatine', 'inhibiteursdelhmgcoareductase'],
        classeMatch: ['statine'],
        dciSuffix: ['statine', 'vastatine'],
        dcis: ['atorvastatine', 'simvastatine', 'pravastatine', 'rosuvastatine', 'fluvastatine']
    },
    ipp: {
        aliases: ['ipp', 'inhibiteurpompe', 'antisecretoiresinhibiteursdelapompeaproton'],
        classeMatch: ['ipp', 'inhibiteurpompe'],
        dcis: ['omeprazole', 'esomeprazole', 'lansoprazole', 'pantoprazole', 'rabeprazole']
    },
    anti_h2: {
        aliases: ['antih2', 'antisecretoiresantihistaminiquesh2'],
        classeMatch: ['antih2', 'antiulcereux'],
        dcis: ['cimetidine', 'ranitidine', 'famotidine']
    },
    corticoide: {
        aliases: ['corticoide', 'corticoidesystemique', 'corticoides', 'corticoidesvoi', 'glucocorticoidesparvoieintraarticulaireetmetabolise', 'corticoidesvoieintraarticulaire', 'corticoidesmetabolisenotammentinhale'],
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
        aliases: ['inhibiteurcalcique', 'calcique', 'antagonistesdescanauxcalcique', 'antagonistesdescanauxcalciques', 'antagonistesdescanaux'],
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
    fluoroquinolone: {
        aliases: ['fluoroquinolone', 'fluoroquinolones'],
        classeMatch: ['fluoroquinolone'],
        dcis: ['ciprofloxacine', 'ofloxacine', 'levofloxacine', 'moxifloxacine', 'norfloxacine']
    },
    cycline: {
        aliases: ['cycline', 'cyclines'],
        classeMatch: ['cycline', 'tetracycline'],
        dcis: ['doxycycline', 'minocycline', 'tetracycline', 'lymecycline']
    },
    aminoside: {
        aliases: ['aminoside', 'aminosides'],
        classeMatch: ['aminoside', 'aminoglycoside'],
        dcis: ['gentamicine', 'amikacine', 'tobramycine', 'netilmicine']
    },
    inducteur_enzymatique: {
        aliases: ['inducteurenzymatique', 'inducteursenzymatique', 'inducteursenzymatiquespuissant'],
        classeMatch: [],
        dcis: ['rifampicine', 'rifabutine', 'millepertuis', 'carbamazepine', 'phenytoine', 'phenobarbital', 'primidone', 'efavirenz', 'nevirapine', 'bosentan', 'enzalutamide']
    },
    inhibiteur_cyp3a4: {
        aliases: ['inhibiteurcyp3a4', 'inhibiteurspuissantsducyp3a4'],
        classeMatch: [],
        dcis: ['ritonavir', 'clarithromycine', 'erythromycine', 'telithromycine', 'itraconazole', 'ketoconazole', 'posaconazole', 'voriconazole', 'idelalisib', 'cobicistat', 'jusdepamplemousse', 'pamplemousse']
    },
    inhibiteur_protease: {
        aliases: ['inhibiteurprotease'],
        classeMatch: [],
        dcis: ['darunavir', 'atazanavir', 'lopinavir', 'ritonavir']
    },
    sulfamide_hypoglycemiant: {
        aliases: ['sulfamidehypoglycemiant', 'sulfamideshypoglycemiant'],
        classeMatch: ['sulfamidehypoglycemiant'],
        dcis: ['gliclazide', 'glibenclamide', 'glimepiride', 'glipizide']
    },
    glinide: {
        aliases: ['glinide', 'glinides'],
        classeMatch: ['glinide'],
        dcis: ['repaglinide', 'nateglinide']
    },
    immunosuppresseur: {
        aliases: ['immunosuppresseur', 'immunosuppresseurs'],
        classeMatch: ['immunosuppresseur'],
        dcis: ['ciclosporine', 'tacrolimus', 'sirolimus', 'everolimus', 'mycophenolate', 'azathioprine', 'methotrexate', 'leflunomide']
    },
    antiparkinsonien_anticholinergique: {
        aliases: ['antiparkinsonienanticholinergique', 'antiparkinsoniensanticholinergique', 'antiparkinsonienanticholi', 'medicamentsatropinique'],
        classeMatch: ['antiparkinsonienanticholi'],
        dcis: ['trihexyphenidyle', 'biperidene', 'tropatepine']
    },
    anticholinesterasique: {
        aliases: ['anticholinesterasique', 'anticholinesterasiques'],
        classeMatch: ['acetylcholinesterase'],
        dcis: ['donepezil', 'rivastigmine', 'galantamine']
    },
    antihypertenseur_central: {
        aliases: ['antihypertenseurcentral', 'antihypertenseurscentraux'],
        classeMatch: ['antihypertenseurcentral'],
        dcis: ['clonidine', 'moxonidine', 'rilmenidine', 'methyldopa']
    },
    torsadogene: {
        aliases: ['torsadogene', 'substancessusceptiblesdedonnerdestorsadesdepointe', 'substancessusceptiblesdedonnerdestorsade'],
        classeMatch: [],
        dcis: ['amiodarone', 'sotalol', 'dronedarone', 'haloperidol', 'chlorpromazine', 'citalopram', 'escitalopram', 'ondansetron', 'domperidone', 'hydroxychloroquine', 'moxifloxacine', 'erythromycine', 'clarithromycine', 'methadone', 'fluconazole', 'pimozide']
    },
    bradycardisant: {
        aliases: ['bradycardisant', 'bradycardisants'],
        classeMatch: [],
        dcis: ['bisoprolol', 'metoprolol', 'nebivolol', 'carvedilol', 'atenolol', 'propranolol', 'sotalol', 'diltiazem', 'verapamil', 'amiodarone', 'dronedarone', 'digoxine', 'ivabradine', 'donepezil', 'rivastigmine', 'galantamine', 'clonidine']
    },
    hormone_thyroidienne: {
        aliases: ['hormonethyroidienne', 'hormonesthyroidiennes'],
        classeMatch: ['thyroidien'],
        dcis: ['levothyroxine', 'liothyronine']
    },
    fibrate: {
        aliases: ['fibrate', 'fibrates'],
        classeMatch: ['fibrate'],
        dcis: ['fenofibrate', 'gemfibrozil', 'bezafibrate', 'ciprofibrate']
    },
    dopaminergique: {
        aliases: ['dopaminergique', 'dopaminergiques'],
        classeMatch: ['dopaminergique', 'agonistedopaminergique'],
        dcis: ['levodopa', 'ropinirole', 'pramipexole', 'rotigotine', 'piribedil', 'bromocriptine', 'amantadine']
    },
    triptan: {
        aliases: ['triptan', 'triptans'],
        classeMatch: ['triptan'],
        dcis: ['sumatriptan', 'zolmitriptan', 'rizatriptan', 'almotriptan', 'eletriptan', 'naratriptan', 'frovatriptan']
    },
    sedatif: {
        aliases: ['sedatif', 'medicamentssedatif'],
        classeMatch: [],
        dcis: ['diazepam', 'lorazepam', 'oxazepam', 'bromazepam', 'alprazolam', 'zolpidem', 'zopiclone', 'hydroxyzine', 'doxylamine', 'alimemazine', 'promethazine']
    },
    hypotenseur_orthostatique: {
        aliases: ['hypotenseurorthostatique', 'medicamentsaloriginedunehypotensionorthostatique', 'medicamentsaloriginedunehypotension'],
        classeMatch: [],
        dcis: ['doxazosine', 'prazosine', 'tamsulosine', 'alfuzosine', 'clonidine', 'moxonidine']
    },
    atropinique: {
        aliases: ['atropinique', 'medicamentsatropiniques', 'medicamentaeffetantimuscarinic'],
        classeMatch: ['anticholinergique', 'atropinique'],
        dcis: ['trihexyphenidyle', 'biperidene', 'tropatepine', 'oxybutynine', 'solifenacine', 'fesoterodine', 'tolterodin', 'amitriptyline', 'clomipramine', 'imipramine', 'hydroxyzine', 'doxylamine', 'alimemazine', 'promethazine', 'chlorpromazine', 'cyamemazine', 'clozapine', 'quetiapine', 'scopolamine', 'atropine', 'ipratropium', 'tiotropium']
    },
    imao: {
        aliases: ['imao', 'imaoreversible', 'imaoreversibleycomprisoxazolidinonesetbleudemethylene', 'imaoreversiblesinhibiteursdelamonoamineoxydas', 'imaobnonselecif'],
        classeMatch: ['imao'],
        dcis: ['phenelzine', 'tranylcypromine', 'iproniazide', 'moclobemide', 'linezolide', 'selegiline', 'rasagiline', 'safinamide']
    },
    serotoninergique: {
        aliases: ['serotoninergique', 'medicamentsserotoninergiqu', 'medicamentsserotonergique'],
        classeMatch: ['isrs', 'irsn', 'ssri'],
        dcis: ['citalopram', 'escitalopram', 'sertraline', 'paroxetine', 'fluoxetine', 'fluvoxamine', 'venlafaxine', 'duloxetine', 'milnacipran', 'amitriptyline', 'clomipramine', 'imipramine', 'tramadol', 'triptans', 'linezolide', 'mirtazapine']
    },
    digitalique: {
        aliases: ['digitalique', 'digitalepur', 'digitaliques'],
        classeMatch: ['digitalique'],
        dcis: ['digoxine', 'digitoxine']
    },
    lithium: {
        aliases: ['lithium'],
        classeMatch: ['lithium'],
        dcis: ['lithium']
    },
    antidiabetique: {
        aliases: ['antidiabetique', 'antidiabetiques', 'medicamentssusceptiblesdedonnerdeshypoglycemie'],
        classeMatch: ['antidiabetique', 'diabete'],
        dcis: ['metformine', 'gliclazide', 'glibenclamide', 'glimepiride', 'glipizide', 'repaglinide', 'sitagliptine', 'vildagliptine', 'saxagliptine', 'linagliptine', 'canagliflozin', 'dapagliflozin', 'empagliflozin', 'liraglutide', 'semaglutide', 'dulaglutide', 'insuline', 'pioglitazone', 'acarbose']
    },
    potassium: {
        aliases: ['potassium', 'selsdepotassium', 'hyperkaliemiant', 'medicamentshyperkaliemiant'],
        classeMatch: [],
        dcis: ['potassium']
    },
    antiarythmique: {
        aliases: ['antiarythmique', 'antiarythmiques'],
        classeMatch: ['antiarythmique'],
        dcis: ['amiodarone', 'dronedarone', 'flecainide', 'propafenone', 'sotalol', 'lidocaine', 'mexiletine']
    },
    inhibiteur_5alpha_reductase: {
        aliases: ['5alphareductase', '5ari', 'inhibiteur5alpha', 'inhibiteurdelareductase'],
        classeMatch: ['inhibiteur de la 5-alpha-réductase', '5-alpha réductase', '5-alpha-réductase'],
        dcis: ['finasteride', 'dutasteride'],
        dciSuffix: ['asteride']
    }
};

// ============================================================================
// Index inversé alias → classId (construit une seule fois au chargement)
// ============================================================================
const _ALIAS_EXACT_INDEX = new Map();   // alias exact → [classId, ...]
const _ALIAS_SUBSTR_LIST = [];          // [{alias, classId}] pour matching substring
const _DCI_SET = new Map();             // classId → Set de dcis (pour O(1) lookup)

(function _buildDrugClassIndex() {
    for (const [classId, def] of Object.entries(DRUG_CLASSES)) {
        // Index exact
        def.aliases.forEach(a => {
            if (!_ALIAS_EXACT_INDEX.has(a)) _ALIAS_EXACT_INDEX.set(a, []);
            _ALIAS_EXACT_INDEX.get(a).push(classId);
        });
        // Liste substring (alias >= 4 chars)
        def.aliases.filter(a => a.length >= 4).forEach(a => {
            _ALIAS_SUBSTR_LIST.push({ alias: a, classId });
        });
        // Set de DCIs pour lookup rapide
        _DCI_SET.set(classId, new Set(def.dcis));
    }
})();

function _classMatchesMed(classId, dci, classe) {
    const def = DRUG_CLASSES[classId];
    if (!def) return false;
    if (def.classeMatch.some(cm => classe.includes(cm))) return true;
    if (_DCI_SET.get(classId).has(dci)) return true;
    // Fallback inclusion pour DCIs composées (ex: "acideacetylsalicylique" contient "aspirine" non)
    if (def.dcis.some(d => dci.includes(d))) return true;
    if (def.dciSuffix && def.dciSuffix.some(s => dci.includes(s))) return true;
    return false;
}

// ============================================================================
// Moteur de matching unifié (optimisé par index inversé)
// ============================================================================

/**
 * Vérifie si un médicament (dci + classe) correspond à une classe thérapeutique donnée.
 * @param {string} dci - DCI normalisée (sanitizeText appliqué)
 * @param {string} classe - Classe normalisée (sanitizeText appliqué)
 * @param {string} key - Clé de classe recherchée (normalisée)
 * @returns {boolean}
 */
function matchesDrugClass(dci, classe, key) {
    // Cas spécial : antihypertenseur (composite) — testé en premier
    if (key === 'antihypertenseur') {
        return classe.includes('hypertens') ||
            matchesDrugClass(dci, classe, 'iec') ||
            matchesDrugClass(dci, classe, 'ara2') ||
            matchesDrugClass(dci, classe, 'inhibiteurcalcique') ||
            matchesDrugClass(dci, classe, 'diuretique') ||
            matchesDrugClass(dci, classe, 'betabloquant');
    }
    // Passe 1 : match alias EXACT via index O(1)
    const exactClasses = _ALIAS_EXACT_INDEX.get(key);
    if (exactClasses) {
        for (const classId of exactClasses) {
            if (_classMatchesMed(classId, dci, classe)) return true;
        }
        return false;
    }
    // Passe 2 : match alias par inclusion (substring) — seulement si aucun exact
    if (key.length >= 4) {
        let foundAlias = false;
        for (const entry of _ALIAS_SUBSTR_LIST) {
            if (key.includes(entry.alias) || entry.alias.includes(key)) {
                foundAlias = true;
                if (_classMatchesMed(entry.classId, dci, classe)) return true;
            }
        }
        if (foundAlias) return false;
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
    // Gestion pluriels (trailing)
    if (t.endsWith('s') && !t.includes('ains') && !t.includes('isrs')) t = t.slice(0, -1);
    if (t.endsWith('aux')) t = t.replace(/aux$/, 'al');
    // Matching direct DCI/classe avant le référentiel
    if (dci.includes(t) || t.includes(dci)) return true;
    if (classe.includes(t) || t.includes(classe)) return true;
    // Matching via référentiel (essai avec et sans pluriel)
    if (matchesDrugClass(dci, classe, t)) return true;
    // Essai supplémentaire : singulariser les pluriels internes (ex: inhibiteursselectifs → inhibiteurselectif)
    let tSing = t.replace(/([a-z])s([a-z])/g, '$1$2');
    if (tSing !== t && matchesDrugClass(dci, classe, tSing)) return true;
    return false;
}
