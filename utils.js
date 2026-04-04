// utils.js - Utilitaires partagés (source unique de vérité)
// Remplace les copies dupliquées dans app_core.js, geria_engine_v2.js, tests.js

// Échappement HTML — prévient les injections XSS dans les interpolations
const escapeHtml = str => {
    if (!str) return "";
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
const getVal = id => {
    let el = document.getElementById(id);
    if (!el || !el.value) return 0;
    let v = parseFloat(el.value.replace(',', '.'));
    return isNaN(v) ? 0 : v;
};
const getStr = id => { let el = document.getElementById(id); return el ? el.value : ""; };
const isChecked = id => { let el = document.getElementById(id); return el ? el.checked : false; };
