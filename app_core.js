let activeComorbs = []; 
let activeMeds = [];    
let resultatsSynthese = ""; 
window.suspendedMeds = [];

let globalQT_CountKR = 0; let globalQT_CountCR_PR = 0;
let scoreACB_global = 0; let infoACB_global = [];
let scoreCIA_global = 0; let infoCIA_global = [];
let maxQTLevel_global = 0; let infoQT_global = [];

const sanitizeText = str => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "") : "";
const cleanAnsmString = str => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/['\-]/g, " ").replace(/\s+/g, " ").toLowerCase().trim() : "";
const unifiedMedsMap = new Map();
const allComorbs = [];

// 🧬 MATRICE BIOLOGIQUE UNIVERSELLE (Normes, Seuils critiques, Iatrogénie)
const BIO_DB = {
    K: { nom: "Kaliémie", min: 3.5, max: 5.0, unite: "mmol/L", hyperName: "Hyperkaliémie", hypoName: "Hypokaliémie", critiqueMin: 2.5, critiqueMax: 6.0, hyperMeds: ['iec', 'ara2', 'arni', 'mra', 'ains', 'potassium', 'heparine', 'bactrim'], hypoMeds: ['anse', 'thiazid', 'corticoide', 'laxatif'], supplement: "Chlorure de potassium (Diffu-K...)", supplementClass: "potassium" },
    Na: { nom: "Natrémie", min: 135, max: 145, unite: "mmol/L", hyperName: "Hypernatrémie", hypoName: "Hyponatrémie (SIADH ?)", critiqueMin: 120, critiqueMax: 160, hyperMeds: ['corticoide', 'lithium'], hypoMeds: ['thiazid', 'anse', 'isrs', 'irsna', 'carbamazepine', 'tramadol'] },
    Ca: { nom: "Calcémie", min: 2.15, max: 2.60, unite: "mmol/L", hyperName: "Hypercalcémie", hypoName: "Hypocalcémie", critiqueMin: 1.8, critiqueMax: 3.0, hyperMeds: ['calcium', 'vitamine d', 'thiazid', 'lithium'], hypoMeds: ['anse', 'bisphosphonate'], supplement: "Calcium (Cacit...)", supplementClass: "calcium" },
    Mg: { nom: "Magnésémie", min: 0.70, max: 1.05, unite: "mmol/L", hyperName: "Hypermagnésémie", hypoName: "Hypomagnésémie", critiqueMin: 0.5, critiqueMax: 2.0, hyperMeds: ['magnesium'], hypoMeds: ['ipp', 'anse', 'thiazid'], supplement: "Magnésium (Magne B6...)", supplementClass: "magnesium" },
    Uree: { nom: "Urée", min: 2.5, max: 7.5, unite: "mmol/L", hyperName: "Hyperurémie", hypoName: "Hypourémie", hyperMeds: ['diuretique'], hypoMeds: [] },
    Creat: { nom: "Créatininémie", min: 45, max: 105, unite: "µmol/L", hyperName: "Hypercréatininémie", hypoName: "Hypocréatininémie", hyperMeds: ['ains', 'iec', 'ara2', 'arni', 'diuretique'], hypoMeds: [] },
    Uric: { nom: "Acide Urique", min: 150, max: 360, unite: "µmol/L", hyperName: "Hyperuricémie", hypoName: "Hypouricémie", hyperMeds: ['thiazid', 'anse', 'aspirine'], hypoMeds: ['allopurinol', 'febuxostat'] },
    Hb: { nom: "Hémoglobine", min: 12.0, max: 16.0, unite: "g/dL", hyperName: "Polyglobulie", hypoName: "Anémie", critiqueMin: 7.0, hyperMeds: [], hypoMeds: ['anticoagulant', 'antiagreg', 'ains'] },
    Plaq: { nom: "Plaquettes", min: 150, max: 400, unite: "G/L", hyperName: "Thrombocytose", hypoName: "Thrombopénie", critiqueMin: 50, hyperMeds: [], hypoMeds: ['heparine', 'valproate', 'chimio'] },
    Fer: { nom: "Ferritine", min: 30, max: 300, unite: "µg/L", hyperName: "Hyperferritinémie", hypoName: "Carence martiale", hyperMeds: ['fer'], hypoMeds: ['ipp'], supplement: "Fer (Fumafer, Tardyferon...)", supplementClass: "fer" },
    B12: { nom: "Vitamine B12", min: 150, max: 700, unite: "pmol/L", hyperName: "Hypervitaminémie B12", hypoName: "Carence B12", hyperMeds: ['b12'], hypoMeds: ['metformine', 'ipp'], supplement: "Cyanocobalamine", supplementClass: "b12" },
    B9: { nom: "Vitamine B9", min: 10, max: 40, unite: "nmol/L", hyperName: "Hypervitaminémie B9", hypoName: "Carence B9", hyperMeds: ['b9'], hypoMeds: ['methotrexate', 'bactrim'], supplement: "Acide folique", supplementClass: "b9" },
    VitD: { nom: "Vitamine D", min: 30, max: 80, unite: "ng/mL", hyperName: "Hypervitaminémie D", hypoName: "Carence Vit D", hyperMeds: ['vitamine d'], hypoMeds: ['antiepileptique'], supplement: "Cholécalciférol (ZymaD...)", supplementClass: "vitamine d" },
    Cpk: { nom: "CPK", min: 20, max: 170, unite: "UI/L", hyperName: "Hyper-CPK", hypoName: "CPK basse", hyperMeds: ['statin', 'fibrate', 'colchicine'], hypoMeds: [] },
    Asat: { nom: "ASAT", min: 10, max: 40, unite: "UI/L", hyperName: "Cytolyse (ASAT)", hypoName: "ASAT basse", hyperMeds: ['paracetamol', 'statin', 'amiodarone', 'valproate'], hypoMeds: [] },
    Alat: { nom: "ALAT", min: 10, max: 40, unite: "UI/L", hyperName: "Cytolyse (ALAT)", hypoName: "ALAT basse", hyperMeds: ['paracetamol', 'statin', 'amiodarone', 'valproate'], hypoMeds: [] },
    Pal: { nom: "PAL", min: 40, max: 120, unite: "UI/L", hyperName: "Cholestase (PAL)", hypoName: "PAL basse", hyperMeds: ['phenytoine', 'carbamazepine'], hypoMeds: [] },
    Ggt: { nom: "GGT", min: 10, max: 55, unite: "UI/L", hyperName: "Cholestase (GGT)", hypoName: "GGT basse", hyperMeds: ['alcool', 'carbamazepine'], hypoMeds: [] },
    Tsh: { nom: "TSH", min: 0.4, max: 4.0, unite: "mUI/L", hyperName: "Hypothyroïdie (TSH haute)", hypoName: "Hyperthyroïdie (TSH basse)", hyperMeds: ['amiodarone', 'lithium'], hypoMeds: ['levothyroxine', 'amiodarone', 'corticoide'] }
};

const parsePourcentage = (val) => {
    if(!val) return 0;
    let strVal = String(val).replace(/,/g, '.'); 
    let matches = strVal.match(/\d+(\.\d+)?/g);
    if(matches) {
        let nums = matches.map(m => { let n = parseFloat(m); return (n > 0 && n <= 1) ? n * 100 : n; });
        return Math.min(100, Math.round(Math.max(...nums)));
    }
    return 0;
};

const expandMedClass = (med) => {
    let m = med.toUpperCase().trim();
    if(m === 'IEC') return ['IEC', 'RAMIPRIL', 'PERINDOPRIL', 'ENALAPRIL', 'LISINOPRIL'];
    if(m === 'ARA2' || m === 'ARA_II' || m === 'SARTAN') return ['ARA2', 'ARA_II', 'SARTAN', 'VALSARTAN', 'CANDESARTAN', 'IRBESARTAN', 'LOSARTAN'];
    if(m === 'AINS') return ['AINS', 'ANTIINFLAMMATOIRE', 'IBUPROFENE', 'KETOPROFENE', 'NAPROXENE', 'DICLOFENAC'];
    return [m];
};

const patientHasMedClass = (classOrDci) => {
    let targets = expandMedClass(classOrDci).map(t => sanitizeText(t));
    return activeMeds.some(m => {
        let mId = sanitizeText(m.core_id || ""); let mDci = sanitizeText(m.dci || ""); let mClasse = sanitizeText(m.classe || "");
        
        if ((targets.includes("ap") || targets.includes("antipsychotique") || targets.includes("neuroleptique")) && (mDci.includes("mianserine") || mDci.includes("mirtazapine"))) return false;
        if ((targets.includes("isrs") || targets.includes("irsna")) && (mDci.includes("mianserine") || mDci.includes("mirtazapine") || mDci.includes("amitriptyline"))) return false;

        return targets.some(t => {
            if(!t || t === 'anti') return false; 
            if(mId === t || mDci === t || mClasse === t || mDci.includes(t)) return true;

            // Strict Separation
            if(t === 'avk' && (mClasse.includes('avk') || ['warfarine', 'fluindione', 'acenocoumarol'].some(d => mDci.includes(d)))) return true;
            if(t === 'aod' && (mClasse.includes('aod') || ['apixaban', 'rivaroxaban', 'dabigatran'].some(d => mDci.includes(d)))) return true;
            if(t.includes('anticoag') && (mClasse.includes('anticoag') || mClasse.includes('aod') || mClasse.includes('avk') || ['apixaban', 'rivaroxaban', 'dabigatran', 'warfarine', 'fluindione', 'acenocoumarol'].some(d => mDci.includes(d)))) return true;
            if(t === 'iec' && (mClasse.includes('iec') || mDci.includes('pril'))) return true;
            if((t === 'ara2' || t === 'sartan') && (mClasse.includes('ara2') || mClasse.includes('sartan') || mDci.includes('sartan') || mDci.includes('entresto'))) return true;
            if((t === 'arni' || t === 'sacubitril') && (mClasse.includes('arni') || mDci.includes('sacubitril') || mDci.includes('entresto'))) return true;

            if((t === 'diuretique') && (mClasse.includes('diuretique') || mClasse.includes('anse') || mClasse.includes('thiazid') || mClasse.includes('mra') || ['furosemide', 'bumetanide', 'hydrochlorothiazide', 'indapamide', 'spironolactone', 'eplerenone'].some(d => mDci.includes(d)))) return true;
            if(t === 'bactrim' && (mDci.includes('sulfamethoxazole') || mDci.includes('bactrim'))) return true;
            if(t === 'heparine' && (mClasse.includes('heparine') || mDci.includes('enoxaparine') || mDci.includes('tinzaparine') || mDci.includes('fondaparinux'))) return true;

            if((t === 'antih1' || t.includes('antihistaminique')) && (mClasse.includes('antihistaminique') || ['alimemazine', 'promethazine', 'hydroxyzine', 'dexchlorpheniramine'].some(d => mDci.includes(d)))) return true;
            if((t.includes('antidepresseur') || t.includes('isrs') || t.includes('irsna') || t === 'ad') && (mClasse.includes('antidepresseur') || mClasse.includes('isrs') || mClasse.includes('irsna') || ['escitalopram', 'citalopram', 'sertraline', 'paroxetine', 'fluoxetine', 'venlafaxine', 'duloxetine', 'mianserine', 'mirtazapine', 'amitriptyline'].some(d => mDci.includes(d)))) return true;
            if((t.includes('antiagreg') || t.includes('aap')) && (mClasse.includes('antiagreg') || mClasse.includes('aap') || ['aspirin', 'acetylsalicylique', 'clopidogrel', 'ticagrelor', 'prasugrel'].some(d => mDci.includes(d)))) return true;
            if((t.includes('beta') || t.includes('bloquant')) && (mClasse.includes('beta') || mClasse.includes('bloquant') || ['bisoprolol', 'metoprolol', 'nebivolol', 'carvedilol', 'atenolol'].some(d => mDci.includes(d)))) return true;
            if((t.includes('hypnotique') || t.includes('somnifere')) && (mClasse.includes('hypnotique') || ['zopiclone', 'zolpidem', 'lormetazepam', 'melatonine'].some(d => mDci.includes(d)))) return true;
            if((t.includes('mra') || t.includes('spironolactone') || t.includes('eplerenone')) && (mClasse.includes('mra') || mClasse.includes('aldosterone') || ['spironolactone', 'eplerenone'].some(d=>mDci.includes(d)))) return true;
            if((t.includes('sglt2') || t.includes('gliflozine')) && (mClasse.includes('sglt2') || mClasse.includes('gliflozine') || ['dapagliflozine', 'empagliflozine'].some(d=>mDci.includes(d)))) return true;
            if((t.includes('neuroleptique') || t.includes('antipsychotique') || t === 'ap') && (mClasse.includes('neuroleptique') || mClasse.includes('antipsychotique') || ['haloperidol', 'risperidone', 'quetiapine', 'olanzapine', 'clozapine', 'aripiprazole', 'tiapride', 'loxapine'].some(d => mDci.includes(d)))) return true;
            if((t.includes('achei') || t.includes('anticholinesterasique')) && ['donepezil', 'rivastigmine', 'galantamine'].some(d => mDci.includes(d))) return true;
            if((t.includes('statin') || t.includes('hypolipemiant')) && (mClasse.includes('statin') || mClasse.includes('hypolipemiant') || ['ezetimibe', 'atorvastatine', 'rosuvastatine', 'pravastatine', 'simvastatine'].some(d => mDci.includes(d)))) return true;
            if((t.includes('vitamine d') || t.includes('cholecalciferol')) && ['vitamine d', 'cholecalciferol', 'zymad', 'uvedose'].some(d => mDci.includes(d))) return true;
            if((t.includes('calcium') || t === 'ca') && (mClasse.includes('calcium') || ['calcium', 'orocal', 'cacit'].some(d => mDci.includes(d)))) return true;
            if((t.includes('alpha') && t.includes('bloquant')) && (mClasse.includes('alpha') || ['tamsulosine', 'alfuzosine', 'urapidil', 'terazosine'].some(d => mDci.includes(d)))) return true;
            if((t.includes('tricyclique') || t === 'tca') && (mClasse.includes('tricyclique') || ['amitriptyline', 'clomipramine', 'imipramine'].some(d => mDci.includes(d)))) return true;
            if((t.includes('dopaminergique') || t.includes('levodopa') || t.includes('l-dopa')) && (mClasse.includes('dopaminergique') || ['levodopa', 'modopar', 'sinemet', 'pramipexole', 'ropinirole', 'rotigotine'].some(d => mDci.includes(d)))) return true;
            if((t.includes('anse') || t.includes('furosemide')) && (mClasse.includes('anse') || ['furosemide', 'bumetanide'].some(d => mDci.includes(d)))) return true;
            if((t.includes('thiazid') || t.includes('thiazidique')) && (mClasse.includes('thiazid') || ['hydrochlorothiazide', 'indapamide'].some(d => mDci.includes(d)))) return true;
            if((t.includes('corticoide') || t.includes('corticosteroide')) && (mClasse.includes('cortico') || ['prednisone', 'prednisolone', 'dexamethasone'].some(d => mDci.includes(d)))) return true;
            if((t.includes('thyroid') || t.includes('levothyroxine')) && (mClasse.includes('thyroid') || ['levothyroxine', 'euthyrox'].some(d => mDci.includes(d)))) return true;
            if((t.includes('potassium') || t.includes('kcl')) && (mClasse.includes('potassium') || ['potassium', 'diffu-k', 'kaleorid'].some(d => mDci.includes(d)))) return true;
            
            if((t === 'fer' || t.includes('martial')) && (mClasse.includes('fer') || ['fer', 'fumafer', 'tardyferon', 'innofer', 'venofer'].some(d => mDci.includes(d)))) return true;
            if((t === 'b9' || t.includes('folique') || t === 'folates') && (mClasse.includes('folique') || ['folique', 'speciafoldine'].some(d => mDci.includes(d)))) return true;
            if((t === 'b12' || t.includes('cobalamine')) && (mClasse.includes('cobalamine') || ['cyanocobalamine', 'hydroxocobalamine'].some(d => mDci.includes(d)))) return true;
            if((t.includes('magnesium') || t === 'mg') && (mClasse.includes('magnesium') || ['magnesium', 'magne', 'spasmyl'].some(d => mDci.includes(d)))) return true;
            
            if((t.includes('ipp') || t === 'prazole') && (mClasse.includes('ipp') || mDci.includes('prazole'))) return true;
            if((t.includes('laxatif') || t === 'macrogol') && (mClasse.includes('laxatif') || ['macrogol', 'lactulose', 'movicol', 'forlax'].some(d => mDci.includes(d)))) return true;
            if((t.includes('allopurinol') || t.includes('febuxostat')) && ['allopurinol', 'zyloric', 'febuxostat', 'adenuric'].some(d => mDci.includes(d))) return true;
            if(t.includes('antispasmodique') && (mClasse.includes('antispasmodique') || ['oxybutynine', 'trospium', 'solifenacine', 'phloroglucinol'].some(d => mDci.includes(d)))) return true;

            return false;
        });
    });
};

const medMatchesAnsmTerm = (med, ansmTerm) => {
    if(!ansmTerm || ansmTerm.length < 4) return false;
    let t = cleanAnsmString(ansmTerm);
    let mDci = sanitizeText(med.dci || ""); let mClasse = sanitizeText(med.classe || "");
    let ansmNoSpace = t.replace(/\s+/g, "");
    if(ansmNoSpace === mDci || ansmNoSpace.includes(mDci) || mDci.includes(ansmNoSpace)) return true;
    
    if (mDci.includes('ritonavir') && t.includes('quetiapine')) return true;
    if (mDci.includes('quetiapine') && t.includes('ritonavir')) return true;
    if(t.includes('inhibiteur') && (t.includes('cyp3a4') || t.includes('enzymatique') || t.includes('puissant'))) { if(['ritonavir', 'cobicistat', 'itraconazole', 'ketoconazole', 'clarithromycine', 'erythromycine', 'posaconazole'].some(d => mDci.includes(d))) return true; }
    if(t.includes('inducteur')) { if(['carbamazepine', 'phenobarbital', 'phenytoine', 'rifampicine', 'millepertuis'].some(d => mDci.includes(d))) return true; }
    if(t.includes('antivitamine k') && (mClasse.includes('avk') || ['warfarine', 'fluindione', 'acenocoumarol'].some(d => mDci.includes(d)))) return true;
    if(t.includes('anti inflammatoires non steroidiens') && (mClasse.includes('ains') || ['ibuprofene', 'ketoprofene', 'naproxene', 'diclofenac'].some(d=>mDci.includes(d)))) return true;
    if(t.includes('inhibiteurs de la pompe a protons') && (mClasse.includes('ipp') || mDci.includes('prazole'))) return true;
    if(t.includes('antidepresseurs imipraminiques') && (mClasse.includes('tricyclique') || ['amitriptyline', 'clomipramine', 'imipramine'].some(d => mDci.includes(d)))) return true;
    if(t.includes('diuretiques hypokaliemiants') && (mClasse.includes('thiazid') || mClasse.includes('anse') || ['furosemide', 'hydrochlorothiazide', 'indapamide'].some(d => mDci.includes(d)))) return true;
    if(t.includes('diuretiques hyperkaliemiants') && (mClasse.includes('mra') || ['spironolactone', 'eplerenone', 'amiloride'].some(d => mDci.includes(d)))) return true;
    if(t.includes('inhibiteurs de l enzyme de conversion') && mClasse.includes('iec')) return true;
    if(t.includes('antagonistes des recepteurs de l angiotensine') && mClasse.includes('ara2')) return true;
    if(t.includes('beta bloquants') && (mClasse.includes('beta') || mClasse.includes('bloquant') || mDci.includes('olol'))) return true;
    if(t.includes('bradycardisants') && (mClasse.includes('beta') || mClasse.includes('bloquant') || ['diltiazem', 'verapamil', 'amiodarone', 'digoxine', 'donepezil', 'rivastigmine', 'galantamine', 'ivabradine', 'sotalol'].some(d => mDci.includes(d)))) return true;
    if((t.includes('torsades de pointes') || t.includes('allongeant l intervalle qt') || t.includes('allongeant le qt')) && (mClasse.includes('neuroleptique') || ['amiodarone', 'sotalol', 'escitalopram', 'citalopram', 'quetiapine', 'hydroxyzine', 'methadone', 'domperidone'].some(d => mDci.includes(d)))) return true;
    if(t.includes('hypotension orthostatique') && (mClasse.includes('neuroleptique') || mClasse.includes('alpha') || mClasse.includes('dopaminergique') || mClasse.includes('tricyclique') || ['tamsulosine', 'alfuzosine', 'urapidil', 'levodopa', 'pramipexole', 'ropinirole', 'quetiapine', 'risperidone', 'olanzapine', 'clozapine'].some(d => mDci.includes(d)))) return true;
    if(t.includes('abaissant le seuil epileptogene') && (mClasse.includes('neuroleptique') || mClasse.includes('tricyclique') || ['tramadol', 'bupropion', 'clozapine'].some(d => mDci.includes(d)))) return true;
    if((t.includes('medicaments sedatifs') || t.includes('substances sedatives')) && (mClasse.includes('hypnotique') || mClasse.includes('benzodiazepine') || mClasse.includes('opiac') || mClasse.includes('neuroleptique') || mClasse.includes('antidepresseur') || ['zolpidem', 'zopiclone', 'diazepam', 'oxazepam', 'alprazolam', 'morphine', 'oxycodone', 'tramadol', 'codeine', 'pregabaline', 'gabapentine', 'mianserine', 'mirtazapine'].some(d => mDci.includes(d)))) return true;

    return false;
};
