// utils.js - Utilitaires partagés (source unique de vérité)
// Remplace les copies dupliquées dans app_core.js, geria_engine_v2.js, tests.js

// Échappement HTML — prévient les injections XSS dans les interpolations
const escapeHtml = str => {
    if (!str) return "";
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

// ─────────────────────────────────────────────────────────────────────────────
// Niveau de risque QT/torsades à partir du champ `qt_risque` (MASTER_DB).
// SOURCE UNIQUE DE VÉRITÉ : la base emploie plusieurs notations héritées pour
// une même catégorie CredibleMeds. Toute lecture du risque QT DOIT passer par
// cette fonction — un simple includes('(KR)') laissait 19 des 33 médicaments à
// risque ÉTABLI invisibles (méthadone, dompéridone, moxifloxacine, pimozide…),
// car ils sont notés « (RE) », « Risque Etabli » ou « CredibleMeds Known Risk ».
//   3 = risque établi/connu (KR, RE, Known Risk)
//   2 = risque possible (PR)
//   1 = risque conditionnel (CR) ou spécial β2-mimétique (SR — sous hypokaliémie)
//   0 = aucun risque répertorié
const QT_LEVEL_ETABLI = 3, QT_LEVEL_POSSIBLE = 2, QT_LEVEL_CONDITIONNEL = 1;
const qtRiskLevel = (qtRisque) => {
    const t = String(qtRisque == null ? '' : qtRisque);
    if (!t) return 0;
    if (/\bKR\b|\(RE\)|Known Risk|Risque [EÉ]tabli/i.test(t)) return QT_LEVEL_ETABLI;
    if (/\(PR\)/.test(t)) return QT_LEVEL_POSSIBLE;
    if (/\(CR\)|\(SR\)/.test(t)) return QT_LEVEL_CONDITIONNEL;
    return 0;
};

// Nettoyeur universel (enlève accents, espaces, majuscules) avec cache LRU
const sanitizeText = (() => {
    const _cache = new Map();
    const MAX_CACHE = 5000;
    return str => {
        if (!str) return "";
        const k = String(str);
        let v = _cache.get(k);
        if (v !== undefined) return v;
        v = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (_cache.size >= MAX_CACHE) {
            // Supprimer les 1000 plus anciennes entrées au lieu de tout vider
            const it = _cache.keys();
            for (let i = 0; i < 1000; i++) _cache.delete(it.next().value);
        }
        _cache.set(k, v);
        return v;
    };
})();

// Accès DOM : lecture de valeur numérique, texte, checkbox
// getVal : convention héritée — retourne 0 si champ vide/absent. Utilisée pour
// les calculs (DFG, scores) où 0 est un absent acceptable et où la prop. NaN
// casserait la chaîne arithmétique (DFG affiché "NaN", etc.).
const getVal = id => {
    let el = document.getElementById(id);
    if (!el || !el.value) return 0;
    let v = parseFloat(el.value.replace(',', '.'));
    return isNaN(v) ? 0 : v;
};
// getBioVal : version safe pour les valeurs biologiques — retourne NaN si vide.
// Toute comparaison avec NaN renvoyant false, on garantit STRUCTURELLEMENT
// l'absence de faux positif si un futur seuil bas est écrit sans le pattern
// défensif "val > 0 &&" (ex. `if (bioValues['BIO_xxx'] < 30)`).
const getBioVal = id => {
    const el = document.getElementById(id);
    if (!el || el.value == null || String(el.value).trim() === '') return NaN;
    const v = parseFloat(String(el.value).replace(',', '.'));
    return Number.isFinite(v) ? v : NaN;
};
// ---------------------------------------------------------------------------
// VOIE LOCALE — source unique de vérité
// ---------------------------------------------------------------------------
// Une molécule administrée par voie inhalée, topique, oculaire ou nasale n'expose
// pas l'organisme comme la même molécule par voie systémique. Deux conséquences
// dans cette application :
//   - elle ne doit pas alimenter les SCORES CUMULÉS (charge anticholinergique) ;
//   - elle ne doit pas satisfaire les règles de toxicité SYSTÉMIQUE.
// Cas concret : les LAMA inhalés (tiotropium, uméclidinium, glycopyrronium,
// ipratropium) portent un ACB de 2 à 3 en base, ce qui est vrai de la molécule
// mais pas de son exposition réelle — la biodisponibilité systémique du tiotropium
// inhalé est de l'ordre de 2 à 3 %. Les compter dans la charge anticholinergique
// cumulée faisait franchir le seuil de risque cognitif à un patient dont toute la
// charge venait d'un bronchodilatateur.
// Le marqueur « VOIE TOPIQUE » est ajouté au libellé de classe par app_analysis.js
// quand l'utilisateur précise la voie d'un AINS.
const VOIE_LOCALE_RE = /inhal|voie topique|topique|cutan|percutan|ophtalm|collyre|nasal|intraarticulaire|\bICS\b|\bLAMA\b|\bSAMA\b/i;
const estVoieLocale = classe => VOIE_LOCALE_RE.test(String(classe || ''));

const getStr = id => { let el = document.getElementById(id); return el ? el.value : ""; };
const isChecked = id => { let el = document.getElementById(id); return el ? el.checked : false; };

// Affiche/cache un conteneur de sous-options en fonction de l'état d'une checkbox parente.
// Utilisé par la rubrique « Troubles cognitifs & neuropsychocomportementaux » (SFGG 2024).
window.toggleCascade = function(parentId, containerId) {
    const parent = document.getElementById(parentId);
    const container = document.getElementById(containerId);
    if (!parent || !container) return;
    container.style.display = parent.checked ? '' : 'none';
};

// ═══════════════════════════════════════════════════════════════════════════
// NORMES BIOLOGIQUES — seuils de SIGNALEMENT, pas intervalles de référence
// ═══════════════════════════════════════════════════════════════════════════
// `_bioStatusBadge` ne connaissait que six paramètres et affichait un badge VERT
// « OK » pour tous les autres : une GGT à 138 UI/L, une albumine à 34 g/L et une
// CRP à 10 mg/L ressortaient comme normales. Un vert par défaut est pire que pas
// de badge du tout — il affirme une normalité que rien n'a vérifiée.
//
// Ces bornes servent à DÉCIDER DE SIGNALER, pas à rendre un compte-rendu : les
// intervalles de référence varient d'un laboratoire à l'autre (technique, calibrant)
// et ceux du laboratoire prévalent toujours. Elles sont volontairement absentes là
// où aucun seuil unique n'a de sens : INR (dépend de l'indication), troponine
// (dépend du réactif), NT-proBNP (dépend de l'âge — traité par SYND_029), bilan
// lipidique (cible fonction du risque cardiovasculaire).
// `f` / `h` : bornes propres à la femme / à l'homme quand elles diffèrent.
const BIO_NORMES = {
    BIO_001: { bas: 3.5,  haut: 5.0 },                                   // Kaliémie mmol/L
    BIO_002: { bas: 135,  haut: 145 },                                   // Natrémie mmol/L
    BIO_003: { f: { bas: 45, haut: 90 }, h: { bas: 60, haut: 110 } },    // Créatininémie µmol/L
    BIO_004: { bas: 60 },                                                // DFG ml/min — < 60 = stade 3 KDIGO
    BIO_005: { bas: 2.20, haut: 2.60 },                                  // Calcémie mmol/L
    BIO_006: { bas: 0.70, haut: 1.05 },                                  // Magnésémie mmol/L
    BIO_007: { bas: 2.5,  haut: 8.0 },                                   // Urée mmol/L
    BIO_008: { f: { bas: 150, haut: 360 }, h: { bas: 200, haut: 420 } }, // Uricémie µmol/L
    BIO_009: { f: { bas: 12, haut: 16.5 }, h: { bas: 13, haut: 18 } },   // Hémoglobine g/dL — seuils OMS
    BIO_010: { bas: 150,  haut: 400 },                                   // Plaquettes G/L
    BIO_011: { bas: 4,    haut: 10 },                                    // Leucocytes G/L
    BIO_012: { bas: 1.5,  haut: 7 },                                     // PNN G/L
    BIO_013: { haut: 45 },                                               // ASAT UI/L
    BIO_014: { haut: 35 },                                               // ALAT UI/L
    BIO_015: { f: { haut: 40 }, h: { haut: 60 } },                       // GGT UI/L
    BIO_016: { bas: 40,   haut: 130 },                                   // PAL UI/L
    BIO_017: { haut: 21 },                                               // Bilirubine totale µmol/L
    BIO_018: { f: { haut: 145 }, h: { haut: 170 } },                     // CPK UI/L
    BIO_019: { bas: 0.4,  haut: 4.5 },                                   // TSH mUI/L
    BIO_020: { f: { bas: 15, haut: 150 }, h: { bas: 30, haut: 300 } },   // Ferritine µg/L
    BIO_021: { bas: 148 },                                               // Vitamine B12 pmol/L
    BIO_022: { bas: 7 },                                                 // Vitamine B9 nmol/L
    BIO_023: { bas: 30 },                                                // Vitamine D ng/mL
    BIO_024: { haut: 5 },                                                // CRP mg/L
    BIO_025: { bas: 3.9,  haut: 6.0 },                                   // Glycémie à jeun mmol/L
    BIO_026: { haut: 8.0 },                                              // HbA1c % — cible assouplie chez l'âgé
    BIO_029: { bas: 0.4,  haut: 0.8 },                                   // Lithiémie mEq/L — cible gériatrique
    BIO_031: { f: { haut: 470 }, h: { haut: 450 } },                     // QTc ms
    BIO_032: { haut: 0.5 },                                              // Procalcitonine ng/mL
    BIO_033: { haut: 500 },                                              // D-dimères µg/L FEU
    BIO_035: { bas: 35,   haut: 50 },                                    // Albumine sérique g/L
    BIO_036: { haut: 60 },                                               // Lipasémie UI/L
    BIO_037: { haut: 2.0 },                                              // Lactatémie mmol/L
    BIO_038: { bas: 25,   haut: 100 },                                   // Réticulocytes ×10⁹/L
    BIO_039: { bas: 80,   haut: 100 },                                   // VGM fL
    BIO_040: { bas: 70 },                                                // TP %
    BIO_041: { bas: 98,   haut: 107 },                                   // Chlorémie mmol/L
    BIO_042: { bas: 275,  haut: 295 },                                   // Osmolalité mOsm/kg
    BIO_043: { bas: 0.20 },                                              // Préalbumine g/L
    BIO_044: { bas: 0.5,  haut: 0.9 },                                   // Digoxinémie ng/mL — cible gériatrique
    BIO_045: { bas: 0.8,  haut: 1.2 },                                   // TCA ratio
    BIO_046: { haut: 30 }                                                // Albuminurie mg/24h
};

/**
 * Statut d'une valeur biologique vis-à-vis des bornes de signalement.
 * @returns null si aucune borne connue OU valeur dans les bornes ;
 *          sinon { sens: 'bas'|'haut', borne: number }.
 * `sexe` accepte 'F' / 'M' ; toute autre valeur retombe sur les bornes féminines,
 * plus basses, donc plus sensibles — on préfère signaler à tort que taire.
 */
const bioAnormal = (bioId, val, sexe) => {
    const v = parseFloat(val);
    if (!isFinite(v) || v <= 0) return null;
    let n = BIO_NORMES[bioId];
    if (!n) return null;
    if (n.f || n.h) n = (String(sexe).toUpperCase() === 'M') ? n.h : n.f;
    if (!n) return null;
    if (typeof n.bas === 'number' && v < n.bas) return { sens: 'bas', borne: n.bas };
    if (typeof n.haut === 'number' && v > n.haut) return { sens: 'haut', borne: n.haut };
    return null;
};
