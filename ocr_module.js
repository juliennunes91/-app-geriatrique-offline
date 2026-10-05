// ============================================================================
// OCR Module — Extraction de médicaments depuis capture d'écran/photo
// Tesseract.js v5 (WASM) — 100% offline
// ============================================================================

const OcrModule = (() => {
    let _worker = null;
    let _ready = false;
    let _initializing = false;

    // Levenshtein distance for fuzzy matching
    function levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[b.length][a.length];
    }

    // ── Reconnaissance des médicaments dans le texte OCR ─────────────────────────
    // Sur une capture de logiciel de prescription, l'ancien appariement reconnaissait
    // vingt-quatre médicaments fantômes pour quatre vrais : le champ « princeps » était
    // découpé sur « / » et « , », si bien que « Bonviva (PO 150 mg/mois ou IV 3 mg/3 mois) »
    // devenait un « nom » « mois » — et le mot « mois » de la posologie désignait
    // l'ibandronate et le dénosumab, notés « Fiable » ; la correspondance par PRÉFIXE faisait
    // de « ACIDE » (acide folique) un acide fusidique, zolédronique, acétylsalicylique…
    // Désormais : correspondance EXACTE d'une DCI entière ou d'un nom de marque extrait
    // comme un nom ; tolérance d'une faute de frappe sur les mots longs seulement. Ni
    // préfixe, ni sous-chaîne.
    const MOTS_GENERIQUES = new Set(['comprime', 'comprimes', 'gelule', 'gelules', 'solution', 'injectable', 'buvable',
        'voie', 'orale', 'oral', 'patch', 'sachet', 'sirop', 'collyre', 'creme', 'pommade', 'forme', 'formes', 'faible',
        'dose', 'generique', 'generiques', 'mois', 'jour', 'jours', 'semaine', 'semaines', 'avec', 'sans', 'pour', 'dans',
        'chez', 'seul', 'adulte', 'enfant', 'retard', 'unidose', 'ampoule', 'flacon', 'stylo', 'poudre', 'suspension',
        'goutte', 'gouttes', 'matin', 'soir', 'nuit', 'midi', 'pendant', 'besoin', 'acide', 'sodium', 'calcium']);
    const _norm = s => sanitizeText(String(s || '')).replace(/[0-9]+/g, '');
    // Noms de marque d'un champ princeps : listes séparées par « / », « ; », « | » ou une
    // virgule NON décimale ; chaque segment est lu comme un nom (avant toute parenthèse
    // ou dose), un ou deux mots.
    function _marques(princeps) {
        const out = new Set();
        // Parenthèses retirées AVANT le découpage : « (mal des transports/soins palliatifs) »
        // découpé sur « / » donnait un nom « soins ».
        let s = String(princeps || '');
        while (/\([^()]*\)/.test(s)) s = s.replace(/\([^()]*\)/g, ' ');
        s = s.replace(/[()]/g, ' ');
        s.split(/[\/;|]|,(?!\d)|\s[—–-]\s/).forEach(seg => {
            const nom = seg.replace(/\d.*$/, '').trim();
            const mots = nom.split(/\s+/).filter(Boolean);
            if (!mots.length) return;
            const un = _norm(mots[0]);
            if (un.length >= 4 && !MOTS_GENERIQUES.has(un)) out.add(un);
            if (mots.length >= 2) {
                const deux = _norm(mots[0] + mots[1]);
                if (deux.length >= 6 && !MOTS_GENERIQUES.has(_norm(mots[1]))) out.add(deux);
            }
        });
        return [...out];
    }
    function _buildSearchTerms() {
        const terms = [];
        if (typeof unifiedMedsMap === 'undefined') return terms;
        unifiedMedsMap.forEach((data) => {
            const dci = _norm(data.dci_pure);
            if (dci.length >= 4) terms.push({ clean: dci, dci: data.dci_pure, princeps: data.princeps, data });
            _marques(data.princeps).forEach(m => terms.push({ clean: m, dci: data.dci_pure, princeps: data.princeps, data }));
        });
        return terms;
    }

    // Candidats : mots et suites de deux ou trois mots d'une MÊME ligne (« ACIDE FOLIQUE »),
    // chiffres retirés (« GABAPENTINE100 »).
    function _extractCandidates(rawText) {
        const candidates = [];
        const seen = new Set();
        String(rawText || '').split(/[\n\r]+/).forEach(line => {
            const mots = line.split(/[\s,;:()\[\]\/|]+/).map(_norm).filter(w => w.length >= 2);
            for (let i = 0; i < mots.length; i++) {
                for (let n = 1; n <= 3 && i + n <= mots.length; n++) {
                    const clean = mots.slice(i, i + n).join('');
                    if (clean.length < 4 || seen.has(clean)) continue;
                    if (n === 1 && MOTS_GENERIQUES.has(clean)) continue;
                    seen.add(clean);
                    candidates.push({ original: line.trim().split(/\s+/).slice(i, i + n).join(' '), clean });
                }
            }
        });
        return candidates;
    }

    function _matchMedications(candidates) {
        const searchTerms = _buildSearchTerms();
        if (searchTerms.length === 0) return [];
        const exact = new Map();
        searchTerms.forEach(t => { if (!exact.has(t.clean)) exact.set(t.clean, []); exact.get(t.clean).push(t); });
        const longs = searchTerms.filter(t => t.clean.length >= 7);
        const matches = new Map();
        const retenir = (term, score, cand) => {
            const k = sanitizeText(term.dci);
            const ex = matches.get(k);
            if (!ex || ex.score < score) matches.set(k, { dci: term.dci, princeps: term.princeps, data: term.data, score, matchedText: cand.original });
        };
        for (const cand of candidates) {
            const hits = exact.get(cand.clean);
            if (hits) { hits.forEach(t => retenir(t, 100, cand)); continue; }
            // Faute de lecture : une lettre sur un mot long (≥ 7), deux sur un très long (≥ 11).
            const c = cand.clean;
            if (c.length < 7) continue;
            for (const t of longs) {
                if (Math.abs(t.clean.length - c.length) > 2) continue;
                const d = levenshtein(c, t.clean);
                if (d === 1) retenir(t, 75, cand);
                else if (d === 2 && c.length >= 11 && t.clean.length >= 11) retenir(t, 50, cand);
            }
        }
        return Array.from(matches.values()).sort((a, b) => b.score - a.score);
    }

    // ── Chargement 100 % local, compatible file:// ─────────────────────────────────
    // Ouvert en file:// (double-clic sur index.html, partage réseau d'un établissement),
    // Chrome refuse fetch(), import() et new Worker(fichier) : l'OCR échouait dès le
    // chargement du modèle (« URL scheme file is not supported »). Tout passe donc par des
    // balises <script> classiques (fichiers lib/ocr/*.inline.js, générés par
    // tools/build_ocr_offline.cjs) : le worker est fabriqué EN MÉMOIRE à partir du texte du
    // moteur et du worker, et le modèle français lui est remis en octets. Aucun accès
    // réseau, aucune dépendance au service worker — même chemin en http(s), en file:// et
    // dans l'APK.
    function _base() {
        return new URL('.', document.baseURI).href;
    }
    const _scripts = new Map();
    function _chargerScript(rel) {
        if (_scripts.has(rel)) return _scripts.get(rel);
        const p = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = _base() + rel;
            s.onload = () => resolve();
            s.onerror = () => { _scripts.delete(rel); reject(new Error('fichier introuvable : ' + rel + ' (copie de l\'application incomplète ?)')); };
            document.head.appendChild(s);
        });
        _scripts.set(rel, p);
        return p;
    }
    // WebAssembly SIMD (wasm-feature-detect) : absent des navigateurs anciens, il faut
    // alors le moteur sans SIMD — imposer le SIMD faisait échouer l'OCR sans explication.
    function _simd() {
        try {
            return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
        } catch (e) { return false; }
    }
    function _octets(b64) {
        const bin = atob(b64);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
    }

    // Initialize Tesseract worker
    async function init(onProgress) {
        if (_ready) return;
        if (_initializing) return _initializing;
        _initializing = (async () => {
            if (typeof WebAssembly !== 'object') throw new Error('WebAssembly est désactivé dans ce navigateur (politique de sécurité de l\'établissement ?) : l\'OCR ne peut pas fonctionner. Saisir les médicaments à la main.');
            if (typeof Tesseract === 'undefined') throw new Error('moteur OCR non chargé (lib/tesseract.min.js).');
            const simd = _simd();
            if (onProgress) onProgress('Chargement du moteur OCR (local)...', 0.1);
            await _chargerScript('lib/ocr/tesseract-worker.inline.js');
            await _chargerScript(simd ? 'lib/ocr/tesseract-core-simd.inline.js' : 'lib/ocr/tesseract-core.inline.js');
            if (onProgress) onProgress('Chargement du modèle français (local)...', 0.4);
            await _chargerScript('lib/ocr/fra.traineddata.inline.js');
            const core = simd ? window.__GERIA_TESS_CORE_SIMD : window.__GERIA_TESS_CORE;
            const source = '(' + core.toString() + ')();\n(' + window.__GERIA_TESS_WORKER.toString() + ')();';
            const url = URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
            if (onProgress) onProgress('Initialisation OCR...', 0.65);
            // Un échec d'initialisation du moteur ne rejette pas toujours la promesse : sans
            // délai maximal, la barre restait figée sur « Initialisation OCR... ».
            let delai;
            const expire = new Promise((_, rej) => { delai = setTimeout(() => rej(new Error('le moteur OCR ne s\'est pas initialisé en 60 s (mémoire insuffisante ou fichiers lib/ocr endommagés).')), 60000); });
            _worker = await Promise.race([expire, Tesseract.createWorker([{ code: 'fra', data: _octets(window.__GERIA_TESS_FRA) }], 1, {
                workerPath: url,
                workerBlobURL: false,
                corePath: url,         // inutilisé : TesseractCore est déjà défini dans le worker
                cacheMethod: 'none',
                logger: m => {
                    if (onProgress && m.status === 'recognizing text') {
                        onProgress('Lecture OCR...', 0.7 + m.progress * 0.25);
                    }
                }
            })]).finally(() => clearTimeout(delai));
            _ready = true;
            if (onProgress) onProgress('Prêt', 0.95);
        })();
        try { await _initializing; }
        catch (e) { console.error('[OCR] Init failed:', e); throw e; }
        finally { _initializing = false; }
    }

    // Run OCR on image and extract medications
    async function recognize(imageSource, onProgress) {
        if (!_ready) await init(onProgress);
        if (onProgress) onProgress('Analyse de l\'image...', 0.97);
        const result = await _worker.recognize(imageSource);
        const rawText = result.data.text;
        if (onProgress) onProgress('Recherche des médicaments...', 0.99);
        const candidates = _extractCandidates(rawText);
        const medications = _matchMedications(candidates);
        if (onProgress) onProgress('Terminé', 1);
        return { rawText, medications };
    }

    // Process a File/Blob (from input or paste)
    async function processImage(file, onProgress) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const result = await recognize(reader.result, onProgress);
                    resolve(result);
                } catch (e) { reject(e); }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    // Terminate worker (free memory)
    async function terminate() {
        if (_worker) {
            await _worker.terminate();
            _worker = null;
            _ready = false;
            _initializing = false;
        }
    }

    return { init, recognize, processImage, terminate, _matchMedications, _extractCandidates, _marques };
})();
