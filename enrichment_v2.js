// enrichment_v2.js — Enrichissement complet V2
// Classe pharmacologique + liaison albumine pour les médicaments manquants
// Sources: Martindale, Goodman & Gilman, Vidal, RCP officiels

// ============================================================================
// 1. CLASSES PHARMACOLOGIQUES pour les 134 médicaments sans classe
// ============================================================================
const CLASS_ENRICHMENT = {
    "acide actylsalicylique": "Antiagrégant plaquettaire (AINS)",
    "acide zoldronique": "Bisphosphonate IV",
    "acnocoumarol": "Anticoagulant AVK",
    "akineton biperidene": "Antiparkinsonien anticholinergique",
    "alimmazine": "Antihistaminique H1 sédatif (phénothiazine)",
    "anafranil": "Antidépresseur tricyclique (clomipramine)",
    "aprpitant": "Antiémétique (antagoniste NK1)",
    "artane / parkinane trihexyphenidyle": "Antiparkinsonien anticholinergique",
    "atarax": "Antihistaminique H1 sédatif (hydroxyzine)",
    "atnolol": "Bêtabloquant cardiosélectif",
    "atnolol + chlortalidone": "Bêtabloquant + Diurétique thiazidique",
    "aztreonam": "Antibiotique (monobactame)",
    "bclomtasone": "Corticoïde inhalé",
    "bipridne": "Antiparkinsonien anticholinergique (bipéridène)",
    "bromazpam": "Benzodiazépine (anxiolytique)",
    "btamthasone": "Corticoïde systémique",
    "btaxolol": "Bêtabloquant cardiosélectif",
    "budsonide": "Corticoïde inhalé",
    "calcifdiol": "Vitamine D (calcifédiol)",
    "cartolol": "Bêtabloquant non cardiosélectif",
    "carvdilol": "Bêtabloquant alpha-bloquant",
    "cefepime possible": "Antibiotique (céphalosporine 4e gen)",
    "cefpodoxime proxetil": "Antibiotique (céphalosporine 3e gen orale)",
    "ceftaroline fosamil": "Antibiotique (céphalosporine 5e gen)",
    "cefuroxime axetil": "Antibiotique (céphalosporine 2e gen)",
    "ceris": "Antipsychotique (palipéridone LP)",
    "chlordiazepoxide": "Benzodiazépine (anxiolytique)",
    "chlorthalidone": "Diurétique thiazidique-like",
    "cholcalcifrol": "Vitamine D (cholécalciférol)",
    "ciclsonide": "Corticoïde inhalé",
    "cicltanide": "Diurétique (apparenté thiazidique)",
    "cimtidine": "Anti-H2 (inhibiteur enzymatique)",
    "clindamycine": "Antibiotique (lincosamide)",
    "cliprolol": "Bêtabloquant cardiosélectif (céliprolol)",
    "clonazpam": "Benzodiazépine (antiépileptique)",
    "clopixol zuclopenthixol": "Antipsychotique FGA (thioxanthène)",
    "clorazpate": "Benzodiazépine (anxiolytique)",
    "clotiazpam": "Benzodiazépine (anxiolytique)",
    "clvidipine": "Inhibiteur calcique DHP (IV)",
    "colistine colistimethate sodique": "Antibiotique (polymyxine)",
    "ctirizine": "Antihistaminique H1 non sédatif",
    "cyammazine": "Antipsychotique FGA (phénothiazine)",
    "cyclosporine": "Immunosuppresseur (inhibiteur calcineurine)",
    "detrusitol": "Anticholinergique urinaire (toltérodine)",
    "dexamthasone": "Corticoïde systémique",
    "dexchlorphniramine": "Antihistaminique H1 sédatif",
    "diazpam": "Benzodiazépine (anxiolytique/myorelaxant)",
    "digoxin": "Digitalique (glycoside cardiaque)",
    "dihydrocodine": "Opioïde faible (antalgique palier 2)",
    "ditropan / driptane": "Anticholinergique urinaire (oxybutynine)",
    "donormyl / lidaprim": "Antihistaminique H1 sédatif (doxylamine)",
    "doxaban": "Anticoagulant AOD (anti-Xa)",
    "doxepin": "Antidépresseur tricyclique",
    "doxpine": "Antidépresseur tricyclique (doxépine)",
    "duloxtine": "Antidépresseur IRSN",
    "ergocalcifrol": "Vitamine D (ergocalciférol)",
    "fbuxostat": "Hypouricémiant (inhibiteur xanthine oxydase)",
    "fexofnadine": "Antihistaminique H1 non sédatif",
    "flodipine": "Inhibiteur calcique DHP",
    "fluanxol flupentixol": "Antipsychotique FGA (thioxanthène)",
    "fluoxtine": "Antidépresseur ISRS",
    "fluphnazine": "Antipsychotique FGA (phénothiazine)",
    "formotrol": "Bêta-2 agoniste longue durée (LABA)",
    "fosfomycine trometamol": "Antibiotique (fosfomycine orale)",
    "fsotrodine": "Anticholinergique urinaire (fésotérodine)",
    "hemigoxine / digoxine digoxine": "Digitalique (glycoside cardiaque)",
    "imipenem + cilastatine + relebactam": "Antibiotique (carbapénème + BLI)",
    "imodium": "Antidiarrhéique (lopéramide)",
    "indacatrol": "Bêta-2 agoniste longue durée (LABA)",
    "insuline dgludec": "Insuline ultra-longue (dégludec)",
    "insuline dtmir": "Insuline longue (détémir)",
    "labtalol": "Bêtabloquant alpha-bloquant",
    "laroxyl": "Antidépresseur tricyclique (amitriptyline)",
    "lepticur tropatepine": "Antiparkinsonien anticholinergique",
    "lopramide": "Antidiarrhéique (opioïde périphérique)",
    "lorazpam": "Benzodiazépine (anxiolytique)",
    "lormtazpam": "Benzodiazépine (hypnotique)",
    "lumirelax": "Myorelaxant (méthocarbamol)",
    "lvomthopromazine": "Antipsychotique FGA (phénothiazine sédative)",
    "lvtiractam": "Antiépileptique (lévétiracétam)",
    "meclizine": "Antihistaminique H1 (antivertigineux)",
    "meclozine": "Antihistaminique H1 (antivertigineux)",
    "meropenem + vaborbactam atb de reserve": "Antibiotique (carbapénème + BLI)",
    "methotrimeprazine": "Antipsychotique FGA (phénothiazine sédative)",
    "miorel / coltramyl": "Myorelaxant (thiocolchicoside)",
    "mthocarbamol": "Myorelaxant",
    "mthylprednisolone": "Corticoïde systémique",
    "mtoclopramide": "Prokinétique / Antiémétique (antagoniste D2)",
    "mtoprolol": "Bêtabloquant cardiosélectif",
    "nbivolol": "Bêtabloquant cardiosélectif vasodilatateur",
    "nfopam": "Antalgique non opioïde (néfopam)",
    "nifdipine": "Inhibiteur calcique DHP",
    "nitrazpam": "Benzodiazépine (hypnotique)",
    "nordazpam": "Benzodiazépine (anxiolytique)",
    "oxacilline": "Antibiotique (pénicilline M)",
    "oxybutynin": "Anticholinergique urinaire (oxybutynine)",
    "palipridone": "Antipsychotique SGA (palipéridone)",
    "paractamol": "Antalgique non opioïde (paracétamol)",
    "paroxtine": "Antidépresseur ISRS",
    "perphnazine": "Antipsychotique FGA (phénothiazine)",
    "phenergan": "Antihistaminique H1 sédatif (prométhazine)",
    "piportil pipotiazine": "Antipsychotique FGA (phénothiazine LP)",
    "pirtanide": "Diurétique de l'anse",
    "polaramine": "Antihistaminique H1 sédatif (dexchlorphéniramine)",
    "prazpam": "Benzodiazépine (anxiolytique)",
    "prgabaline": "Antiépileptique / Antalgique (gabapentinoïde)",
    "primperan": "Prokinétique / Antiémétique (métoclopramide)",
    "promthazine": "Antihistaminique H1 sédatif (phénothiazine)",
    "quitaxon": "Antidépresseur tricyclique (doxépine)",
    "qutiapine": "Antipsychotique SGA (quétiapine)",
    "rabprazole": "IPP (inhibiteur pompe à protons)",
    "risdronate": "Bisphosphonate oral",
    "salmtrol": "Bêta-2 agoniste longue durée (LABA)",
    "scopoderm scopolamine": "Anticholinergique (antiémétique transdermique)",
    "smaglutide": "Agoniste GLP-1",
    "solifenacin": "Anticholinergique urinaire",
    "solifnacine": "Anticholinergique urinaire (solifénacine)",
    "surmontil": "Antidépresseur tricyclique (trimipramine)",
    "temocilline": "Antibiotique (pénicilline anti-BGN)",
    "tenoretic": "Bêtabloquant + Diurétique (aténolol + chlortalidone)",
    "tercian cyamemazine": "Antipsychotique FGA (phénothiazine)",
    "theralene": "Antihistaminique H1 sédatif (alimémazine)",
    "ticagrlor": "Antiagrégant plaquettaire (anti-P2Y12)",
    "tirzpatide": "Agoniste GIP/GLP-1",
    "tofranil": "Antidépresseur tricyclique (imipramine)",
    "toltrodine": "Anticholinergique urinaire (toltérodine)",
    "torasmide": "Diurétique de l'anse (torasémide)",
    "toviaz": "Anticholinergique urinaire (fésotérodine)",
    "trihexyphnidyle": "Antiparkinsonien anticholinergique",
    "triprolidine": "Antihistaminique H1 sédatif",
    "tropatpine": "Antiparkinsonien anticholinergique",
    "vesicare": "Anticholinergique urinaire (solifénacine)",
    "visceralgine tiemonium": "Antispasmodique anticholinergique",
    "warfarin": "Anticoagulant AVK"
};

// ============================================================================
// 2. LIAISON À L'ALBUMINE (%) — Sources: Martindale, Goodman & Gilman, RCP
// ============================================================================
const ALBUMIN_ENRICHMENT = {
    // --- Anticoagulants ---
    "warfarine": 99, "acenocoumarol": 97, "fluindione": 97,
    "rivaroxaban": 95, "apixaban": 87, "edoxaban": 55, "dabigatran": 35,
    // --- Antiagrégants ---
    "clopidogrel": 98, "prasugrel": 98, "ticagrelor": 99,
    "aspirine": 80, "acide acetylsalicylique": 80,
    // --- AINS ---
    "ibuprofene": 99, "naproxene": 99, "diclofenac": 99, "ketoprofene": 99,
    "piroxicam": 99, "meloxicam": 99, "celecoxib": 97, "indometacine": 97,
    // --- Bêtabloquants ---
    "propranolol": 90, "bisoprolol": 30, "metoprolol": 12, "atenolol": 5,
    "carvedilol": 98, "nebivolol": 98, "acebutolol": 26, "sotalol": 0,
    // --- IEC ---
    "ramipril": 73, "enalapril": 50, "perindopril": 20, "lisinopril": 0,
    "captopril": 30, "benazepril": 97, "fosinopril": 95, "quinapril": 97,
    // --- ARA2 ---
    "losartan": 99, "valsartan": 95, "candesartan": 99, "irbesartan": 90,
    "olmesartan": 99, "telmisartan": 99,
    // --- Inhibiteurs calciques ---
    "amlodipine": 98, "felodipine": 99, "nifedipine": 96, "diltiazem": 78,
    "verapamil": 90, "lercanidipine": 98, "nicardipine": 95,
    // --- Diurétiques ---
    "furosemide": 98, "hydrochlorothiazide": 68, "indapamide": 79,
    "spironolactone": 90, "eplerenone": 50, "torasemide": 99,
    "bumetanide": 97, "amiloride": 23,
    // --- Antiarythmiques ---
    "amiodarone": 96, "dronedarone": 98, "flecainide": 40, "digoxine": 25,
    // --- Statines ---
    "atorvastatine": 98, "rosuvastatine": 90, "simvastatine": 95,
    "pravastatine": 50, "fluvastatine": 98,
    // --- IPP ---
    "omeprazole": 95, "esomeprazole": 97, "lansoprazole": 97,
    "pantoprazole": 98, "rabeprazole": 97,
    // --- Antidépresseurs ---
    "amitriptyline": 96, "clomipramine": 97, "imipramine": 90, "doxepine": 80,
    "nortriptyline": 93, "fluoxetine": 95, "paroxetine": 95, "sertraline": 98,
    "citalopram": 80, "escitalopram": 80, "venlafaxine": 27, "duloxetine": 96,
    "mirtazapine": 85, "trazodone": 93, "bupropion": 84,
    // --- Antipsychotiques ---
    "haloperidol": 92, "chlorpromazine": 95, "levomepromazine": 95,
    "olanzapine": 93, "quetiapine": 83, "risperidone": 90,
    "aripiprazole": 99, "clozapine": 95, "amisulpride": 16, "paliperidone": 74,
    // --- Benzodiazépines ---
    "diazepam": 98, "lorazepam": 85, "oxazepam": 97, "alprazolam": 80,
    "bromazepam": 70, "clonazepam": 85, "midazolam": 97, "clorazepate": 97,
    "zolpidem": 92, "zopiclone": 45,
    // --- Antiépileptiques ---
    "valproate": 90, "acide valproique": 90, "carbamazepine": 76,
    "phenytoine": 90, "lamotrigine": 55, "levetiracetam": 0,
    "pregabaline": 0, "gabapentine": 0, "topiramate": 15,
    "oxcarbazepine": 40, "lacosamide": 15,
    // --- Opioïdes ---
    "morphine": 35, "oxycodone": 45, "fentanyl": 80, "tramadol": 20,
    "codeine": 7, "buprenorphine": 96, "methadone": 85, "tapentadol": 20,
    // --- Antidiabétiques ---
    "metformine": 0, "gliclazide": 95, "glibenclamide": 99, "glimepiride": 99,
    "repaglinide": 98, "pioglitazone": 99, "sitagliptine": 38,
    "empagliflozine": 86, "dapagliflozine": 91, "canagliflozine": 99,
    "liraglutide": 98, "semaglutide": 99, "dulaglutide": 0,
    // --- Antibiotiques ---
    "amoxicilline": 17, "amoxicilline + acide clavulanique": 17,
    "ceftriaxone": 95, "cefotaxime": 40, "ciprofloxacine": 30,
    "levofloxacine": 35, "moxifloxacine": 48, "azithromycine": 50,
    "clarithromycine": 70, "doxycycline": 93, "metronidazole": 20,
    "vancomycine": 55, "linezolide": 31, "trimethoprime": 44,
    "sulfamethoxazole": 70, "rifampicine": 89, "gentamicine": 0,
    "tobramycine": 0, "amikacine": 4,
    // --- Immunosuppresseurs ---
    "ciclosporine": 90, "tacrolimus": 99, "mycophenolate": 97,
    "azathioprine": 30, "methotrexate": 50,
    // --- Anticholinergiques urinaires ---
    "oxybutynine": 99, "solifenacine": 98, "tolterodine": 96,
    "fesoterodine": 50, "trospium": 60, "darifenacine": 98,
    // --- Antiparkinsoniens ---
    "levodopa": 10, "ropinirole": 40, "pramipexole": 15,
    "entacapone": 98, "rasagiline": 88, "selegiline": 94,
    // --- Antalgiques ---
    "paracetamol": 15, "nefopam": 73, "celecoxib": 97,
    // --- Corticoïdes ---
    "prednisone": 70, "prednisolone": 90, "methylprednisolone": 78,
    "dexamethasone": 77, "hydrocortisone": 90, "betamethasone": 64,
    // --- Thyroïde ---
    "levothyroxine": 99, "carbimazole": 0, "propylthiouracile": 80,
    // --- Antigoutteux ---
    "allopurinol": 0, "febuxostat": 99, "colchicine": 39,
    // --- Bisphosphonates ---
    "alendronate": 78, "riSedronate": 24, "acide zoledronique": 55,
    // --- Autres ---
    "lithium": 0, "hydroxychloroquine": 40, "theophylline": 40,
    "montelukast": 99, "tamsulosine": 99, "alfuzosine": 90,
    "finasteride": 90, "dutasteride": 99, "sildenafil": 96
};

// ============================================================================
// 3. Fonction d'enrichissement (appelée dans initUI)
// ============================================================================
function applyEnrichmentV2() {
    if (typeof MASTER_DB === 'undefined') return;
    var classCount = 0, albCount = 0;

    MASTER_DB.MEDICAMENTS.forEach(function(m) {
        var key = sanitizeText(m.dci);

        // Enrichir classe manquante
        if (!m.classe || m.classe === '') {
            for (var rawDci in CLASS_ENRICHMENT) {
                if (sanitizeText(rawDci) === key || key.includes(sanitizeText(rawDci)) || sanitizeText(rawDci).includes(key)) {
                    m.classe = CLASS_ENRICHMENT[rawDci];
                    classCount++;
                    break;
                }
            }
        }

        // Enrichir albumine manquante
        if (!m.albumine || parseFloat(m.albumine) === 0) {
            for (var albDci in ALBUMIN_ENRICHMENT) {
                var albKey = sanitizeText(albDci);
                if (key === albKey || (key.length >= 4 && albKey.length >= 4 && (key.includes(albKey) || albKey.includes(key)))) {
                    m.albumine = ALBUMIN_ENRICHMENT[albDci];
                    albCount++;
                    break;
                }
            }
        }
    });

    console.log("[ENRICHMENT_V2] " + classCount + " classes + " + albCount + " albumines ajoutées");
}
