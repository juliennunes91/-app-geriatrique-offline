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
