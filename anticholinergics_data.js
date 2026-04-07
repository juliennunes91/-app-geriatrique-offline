// ANTICHOLINERGIC_DB — Scores anticholinergiques par DCI
// Sources: ACB Scale (Boustani et al. Aging Ment Health 2008),
//          CIA Scale (Carnahan et al. JAGS 2006),
//          BHE (Rudolph et al. J Clin Pharm Ther 2008)
// Beers Criteria (AGS 2023) | STOPP/START v3 (2023)

const ANTICHOLINERGIC_DB = {
  "alimemazine": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "alprazolam": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "alverine": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "amantadine": {
    "cia": 2,
    "bhe": 1,
    "acb": 2
  },
  "aminophylline": {
    "cia": 1,
    "bhe": 1
  },
  "amisulpride": {
    "cia": 1,
    "bhe": 1
  },
  "amitriptyline": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "amoxapine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "ampicilline": {
    "cia": 1,
    "bhe": 1
  },
  "aripiprazole": {
    "cia": 1,
    "bhe": 1
  },
  "asenapine": {
    "cia": 1,
    "bhe": 1
  },
  "atenolol": {
    "cia": 1,
    "bhe": 0,
    "acb": 1
  },
  "azathioprine": {
    "cia": 1,
    "bhe": 0
  },
  "baclofene": {
    "cia": 2,
    "bhe": 1
  },
  "benazepril": {
    "cia": 1,
    "bhe": 0
  },
  "betaxolol": {
    "cia": 1,
    "bhe": 1
  },
  "biperidene": {
    "cia": 3,
    "bhe": 1
  },
  "bisacodyl": {
    "cia": 1,
    "bhe": 0
  },
  "bromazepam": {
    "cia": 1,
    "bhe": 1
  },
  "bromocriptine": {
    "cia": 1,
    "bhe": 1
  },
  "brompheniramine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "bupropion": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "captopril": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "carbamazepine": {
    "cia": 2,
    "bhe": 1,
    "acb": 2
  },
  "carbidopa": {
    "cia": 1,
    "bhe": 1
  },
  "cefamandole": {
    "cia": 1,
    "bhe": 0
  },
  "cefoxitine": {
    "cia": 1,
    "bhe": 0
  },
  "celecoxib": {
    "cia": 1,
    "bhe": 0
  },
  "cetirizine": {
    "cia": 1,
    "bhe": 1
  },
  "chlordiazepoxide": {
    "cia": 1,
    "bhe": 1
  },
  "chloroquine": {
    "cia": 1,
    "bhe": 1
  },
  "chlorpromazine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "chlortalidone": {
    "cia": 1,
    "bhe": 0
  },
  "cimetidine": {
    "cia": 2,
    "bhe": 0,
    "acb": 1
  },
  "citalopram": {
    "cia": 1,
    "bhe": 1
  },
  "clidinium": {
    "cia": 1,
    "bhe": 0,
    "acb": 1
  },
  "clindamycine": {
    "cia": 1,
    "bhe": 0
  },
  "clomipramine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "clonazepam": {
    "cia": 1,
    "bhe": 1
  },
  "clorazepate": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "clozapine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "codeine": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "colchicine": {
    "cia": 1,
    "bhe": 0,
    "acb": 1
  },
  "cyamemazine": {
    "cia": 3,
    "bhe": 1
  },
  "cycloserine": {
    "cia": 1,
    "bhe": 1
  },
  "cyclosporine": {
    "cia": 1,
    "bhe": 0
  },
  "cyproheptadine": {
    "cia": 3,
    "bhe": 1,
    "acb": 2
  },
  "desloratadine": {
    "cia": 1,
    "bhe": 0,
    "acb": 1
  },
  "dexamethasone": {
    "cia": 1,
    "bhe": 0
  },
  "dexchlorpheniramine": {
    "cia": 3,
    "bhe": 1
  },
  "dextromethorphane": {
    "cia": 1,
    "bhe": 1
  },
  "diazepam": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "digoxine": {
    "cia": 1,
    "bhe": 1
  },
  "diltiazem": {
    "cia": 1,
    "bhe": 1
  },
  "dimenhydrinate": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "diphenhydramine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "dipyridamole": {
    "cia": 1,
    "bhe": 0,
    "acb": 1
  },
  "disopyramide": {
    "cia": 2,
    "bhe": 1,
    "acb": 1
  },
  "domperidone": {
    "cia": 1,
    "bhe": 0
  },
  "dosulepine": {
    "cia": 2,
    "bhe": 1
  },
  "doxepine": {
    "cia": 3,
    "bhe": 1
  },
  "doxylamine": {
    "cia": 2,
    "bhe": 1,
    "acb": 3
  },
  "duloxetine": {
    "cia": 1,
    "bhe": 1
  },
  "entacapone": {
    "cia": 1,
    "bhe": 1
  },
  "ephedrine": {
    "cia": 1,
    "bhe": 1
  },
  "escitalopram": {
    "cia": 1,
    "bhe": 1
  },
  "esketamine": {
    "cia": 1,
    "bhe": 1
  },
  "estazolam": {
    "cia": 1,
    "bhe": 1
  },
  "famotidine": {
    "cia": 1,
    "bhe": 1
  },
  "fentanyl": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "fesoterodine": {
    "cia": 3,
    "bhe": 0,
    "acb": 3
  },
  "fexofenadine": {
    "cia": 2,
    "bhe": 0
  },
  "flavoxate": {
    "cia": 3,
    "bhe": 0,
    "acb": 3
  },
  "fluoxetine": {
    "cia": 1,
    "bhe": 1
  },
  "fluphenazine": {
    "cia": 3,
    "bhe": 1
  },
  "fluvoxamine": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "intraventriculaire": {
    "cia": 1,
    "bhe": 1
  },
  "intramusculaire": {
    "cia": 1,
    "bhe": 0
  },
  "guaifenesine": {
    "cia": 1,
    "bhe": 1
  },
  "haloperidol": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "injectable": {
    "cia": 1,
    "bhe": 1
  },
  "hydroxyzine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "imipramine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "ipratropium": {
    "cia": 3,
    "bhe": 0
  },
  "iproniazide": {
    "cia": 1,
    "bhe": 1
  },
  "ketamine": {
    "cia": 1,
    "bhe": 1
  },
  "levocetirizine": {
    "cia": 1,
    "bhe": 1
  },
  "levodopa": {
    "cia": 1,
    "bhe": 1
  },
  "lithium": {
    "cia": 1,
    "bhe": 1
  },
  "loperamide": {
    "cia": 2,
    "bhe": 0,
    "acb": 1
  },
  "loratadine": {
    "cia": 2,
    "bhe": 0,
    "acb": 1
  },
  "lorazepam": {
    "cia": 1,
    "bhe": 1
  },
  "loxapine": {
    "cia": 2,
    "bhe": 1,
    "acb": 2
  },
  "maprotiline": {
    "cia": 3,
    "bhe": 1
  },
  "meclozine": {
    "cia": 3,
    "bhe": 1
  },
  "mequitazine": {
    "cia": 3,
    "bhe": 1
  },
  "metformine": {
    "cia": 1,
    "bhe": 1
  },
  "methadone": {
    "cia": 2,
    "bhe": 1
  },
  "methocarbamol": {
    "cia": 1,
    "bhe": 1,
    "acb": 3
  },
  "methylprednisolone": {
    "cia": 1,
    "bhe": 1
  },
  "metoclopramide": {
    "cia": 1,
    "bhe": 1
  },
  "metoprolol": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "midazolam": {
    "cia": 1,
    "bhe": 1
  },
  "milnacipran": {
    "cia": 1,
    "bhe": 1
  },
  "mirtazapine": {
    "cia": 1,
    "bhe": 1
  },
  "morphine": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "nalbuphine": {
    "cia": 1,
    "bhe": 1
  },
  "naratriptan": {
    "cia": 1,
    "bhe": 1
  },
  "nefopam": {
    "cia": 1,
    "bhe": 1
  },
  "nifedipine": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "olanzapine": {
    "cia": 2,
    "bhe": 1,
    "acb": 3
  },
  "oxazepam": {
    "cia": 1,
    "bhe": 1
  },
  "oxcarbazepine": {
    "cia": 2,
    "bhe": 1,
    "acb": 2
  },
  "oxybutynine": {
    "cia": 3,
    "bhe": 1
  },
  "oxycodone": {
    "cia": 1,
    "bhe": 1
  },
  "paliperidone": {
    "cia": 1,
    "bhe": 1
  },
  "paroxetine": {
    "cia": 2,
    "bhe": 1,
    "acb": 3
  },
  "pheniramine": {
    "cia": 3,
    "bhe": 1
  },
  "phenobarbital": {
    "cia": 1,
    "bhe": 1
  },
  "pimozide": {
    "cia": 2,
    "bhe": 1,
    "acb": 2
  },
  "pipamperone": {
    "cia": 1,
    "bhe": 1
  },
  "piperacilline": {
    "cia": 1,
    "bhe": 1
  },
  "pipotiazine": {
    "cia": 2,
    "bhe": 1
  },
  "pramipexole": {
    "cia": 1,
    "bhe": 1
  },
  "prednisolone": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "prednisone": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "prochlorperazine": {
    "cia": 2,
    "bhe": 1
  },
  "promethazine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "pseudoephedrine": {
    "cia": 2,
    "bhe": 1
  },
  "quetiapine": {
    "cia": 2,
    "bhe": 1,
    "acb": 3
  },
  "quinidine": {
    "cia": 1,
    "bhe": 0,
    "acb": 1
  },
  "ranitidine": {
    "cia": 1,
    "bhe": 0,
    "acb": 1
  },
  "risperidone": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "scopolamine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "selegiline": {
    "cia": 1,
    "bhe": 1
  },
  "sertraline": {
    "cia": 1,
    "bhe": 1
  },
  "solifenacine": {
    "cia": 3,
    "bhe": 1
  },
  "sulpiride": {
    "cia": 1,
    "bhe": 1
  },
  "sumatriptan": {
    "cia": 1,
    "bhe": 1
  },
  "theophylline": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "tizanidine": {
    "cia": 3,
    "bhe": 1
  },
  "tolterodine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "tramadol": {
    "cia": 1,
    "bhe": 1
  },
  "trandolapril": {
    "cia": 1,
    "bhe": 1
  },
  "triamcinolone": {
    "cia": 1,
    "bhe": 1
  },
  "triamterene": {
    "cia": 1,
    "bhe": 0,
    "acb": 1
  },
  "trihexyphenidyle": {
    "cia": 3,
    "bhe": 1
  },
  "trimipramine": {
    "cia": 3,
    "bhe": 1,
    "acb": 3
  },
  "triprolidine": {
    "cia": 2,
    "bhe": 1
  },
  "tropatepine": {
    "cia": 3,
    "bhe": 1
  },
  "trospium": {
    "cia": 3,
    "bhe": 0,
    "acb": 3
  },
  "valproate": {
    "cia": 1,
    "bhe": 1
  },
  "valpromide": {
    "cia": 1,
    "bhe": 1
  },
  "vancomycine": {
    "cia": 1,
    "bhe": 0
  },
  "venlafaxine": {
    "cia": 1,
    "bhe": 1,
    "acb": 1
  },
  "warfarine": {
    "cia": 1,
    "bhe": 1
  },
  "zolmitriptan": {
    "cia": 1,
    "bhe": 1
  },
  "zuclopenthixol": {
    "cia": 1,
    "bhe": 1
  },
  "chlorthalidone": {
    "acb": 1
  },
  "digoxin": {
    "acb": 1
  },
  "furosemide": {
    "acb": 1
  },
  "hydralazine": {
    "acb": 1
  },
  "hydrocortisone": {
    "acb": 1
  },
  "isosorbide": {
    "acb": 1
  },
  "trazodone": {
    "acb": 1
  },
  "warfarin": {
    "acb": 1
  },
  "belladonna": {
    "acb": 2
  },
  "cyclobenzaprine": {
    "acb": 2
  },
  "meperidine": {
    "acb": 2
  },
  "methotrimeprazine": {
    "acb": 2
  },
  "atropine": {
    "acb": 3
  },
  "benztropine": {
    "acb": 3
  },
  "carbinoxamine": {
    "acb": 3
  },
  "chlorpheniramine": {
    "acb": 3
  },
  "clemastine": {
    "acb": 3
  },
  "darifenacin": {
    "acb": 3
  },
  "desipramine": {
    "acb": 3
  },
  "dicyclomine": {
    "acb": 3
  },
  "doxepin": {
    "acb": 3
  },
  "hyoscyamine": {
    "acb": 3
  },
  "meclizine": {
    "acb": 3
  },
  "nortriptyline": {
    "acb": 3
  },
  "orphenadrine": {
    "acb": 3
  },
  "oxybutynin": {
    "acb": 3
  },
  "perphenazine": {
    "acb": 3
  },
  "propantheline": {
    "acb": 3
  },
  "propiverine": {
    "acb": 3
  },
  "solifenacin": {
    "acb": 3
  },
  "thioridazine": {
    "acb": 3
  },
  "trifluoperazine": {
    "acb": 3
  },
  "trihexyphenidyl": {
    "acb": 3
  }
};
