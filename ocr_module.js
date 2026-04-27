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

    // Build search index from unifiedMedsMap
    function _buildSearchTerms() {
        const terms = [];
        if (typeof unifiedMedsMap === 'undefined') return terms;
        unifiedMedsMap.forEach((data, key) => {
            terms.push({ clean: key, dci: data.dci_pure, princeps: data.princeps, data: data });
            // Also index princeps names (split by / , space)
            if (data.princeps) {
                data.princeps.split(/[\/,]+/).forEach(p => {
                    const cleanP = sanitizeText(p.trim());
                    if (cleanP.length >= 3) {
                        terms.push({ clean: cleanP, dci: data.dci_pure, princeps: data.princeps, data: data });
                    }
                });
            }
        });
        return terms;
    }

    // Extract candidate words from OCR text
    function _extractCandidates(rawText) {
        // Split on whitespace, punctuation, line breaks
        // Keep words that could be medication names (>= 3 chars, mostly alpha)
        const words = rawText.split(/[\s,;:\-\(\)\[\]\/\n\r\t\|]+/);
        const candidates = [];
        const seen = new Set();
        for (const w of words) {
            const cleaned = w.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '').trim();
            if (cleaned.length < 3) continue;
            const key = sanitizeText(cleaned);
            if (key.length < 3 || seen.has(key)) continue;
            seen.add(key);
            candidates.push({ original: cleaned, clean: key });
        }
        // Also try multi-word combinations (e.g., "acide clavulanique")
        const lines = rawText.split(/[\n\r]+/);
        for (const line of lines) {
            const lineWords = line.trim().split(/\s+/);
            for (let i = 0; i < lineWords.length - 1; i++) {
                const bigram = lineWords[i] + ' ' + lineWords[i + 1];
                const cleanBigram = sanitizeText(bigram);
                if (cleanBigram.length >= 5 && !seen.has(cleanBigram)) {
                    seen.add(cleanBigram);
                    candidates.push({ original: bigram, clean: cleanBigram });
                }
                if (i < lineWords.length - 2) {
                    const trigram = lineWords[i] + ' ' + lineWords[i + 1] + ' ' + lineWords[i + 2];
                    const cleanTrigram = sanitizeText(trigram);
                    if (cleanTrigram.length >= 8 && !seen.has(cleanTrigram)) {
                        seen.add(cleanTrigram);
                        candidates.push({ original: trigram, clean: cleanTrigram });
                    }
                }
            }
        }
        return candidates;
    }

    // Match candidates against medication database
    function _matchMedications(candidates) {
        const searchTerms = _buildSearchTerms();
        if (searchTerms.length === 0) return [];

        const matches = new Map(); // dci -> best match info

        for (const candidate of candidates) {
            for (const term of searchTerms) {
                let score = 0;
                const cLen = candidate.clean.length;
                const tLen = term.clean.length;

                // Exact match
                if (candidate.clean === term.clean) {
                    score = 100;
                }
                // Substring match (candidate contains the DB term or vice versa)
                else if (cLen >= 4 && tLen >= 4) {
                    if (term.clean.includes(candidate.clean) && cLen >= tLen * 0.6) {
                        score = 80;
                    } else if (candidate.clean.includes(term.clean) && tLen >= cLen * 0.6) {
                        score = 80;
                    }
                    // Prefix match (first 4+ chars match)
                    else if (cLen >= 4 && tLen >= 4) {
                        const prefixLen = Math.min(cLen, tLen, 8);
                        if (candidate.clean.substring(0, prefixLen) === term.clean.substring(0, prefixLen)) {
                            score = 70;
                        }
                    }
                }

                // Fuzzy match (Levenshtein) for longer words
                if (score === 0 && cLen >= 5 && tLen >= 5) {
                    const maxDist = Math.max(1, Math.floor(Math.min(cLen, tLen) * 0.25));
                    const dist = levenshtein(candidate.clean, term.clean);
                    if (dist <= maxDist) {
                        score = Math.max(0, 60 - dist * 10);
                    }
                }

                if (score > 0) {
                    const dciKey = sanitizeText(term.dci);
                    const existing = matches.get(dciKey);
                    if (!existing || existing.score < score) {
                        matches.set(dciKey, {
                            dci: term.dci,
                            princeps: term.princeps,
                            data: term.data,
                            score: score,
                            matchedText: candidate.original
                        });
                    }
                }
            }
        }

        // Sort by score descending
        return Array.from(matches.values()).sort((a, b) => b.score - a.score);
    }

    // Pre-fetch language data with progress tracking so Tesseract finds it in HTTP cache
    async function _prefetchLangData(onProgress) {
        const base = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
        const url = base + 'lib/tessdata/fra.traineddata.gz';
        let response;
        try {
            response = await fetch(url);
        } catch (e) {
            // Erreur typique : le Service Worker n'a pas (encore) caché le fichier ou le SW est obsolète.
            // On suggère explicitement la procédure de récupération.
            const isOffline = !navigator.onLine;
            const hint = isOffline
                ? "Vous semblez être hors ligne et le modèle OCR n'est pas encore en cache. Connectez-vous une première fois en ligne pour télécharger le modèle français (≈ 6 Mo)."
                : "Si l'application a été mise à jour récemment, videz le cache (Ctrl+Shift+Suppr) ou désactivez puis réactivez le service worker (DevTools → Application → Service Workers → Unregister).";
            throw new Error('Impossible de charger les données OCR françaises (' + e.message + '). ' + hint);
        }
        if (!response.ok) throw new Error('Données OCR introuvables (HTTP ' + response.status + '). Vérifiez que lib/tessdata/fra.traineddata.gz est bien servi par votre serveur.');

        const total = parseInt(response.headers.get('Content-Length') || '0');
        const reader = response.body.getReader();
        let received = 0;
        // Consume the stream so the browser caches the response
        // and to track real download progress
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            received += value.length;
            if (onProgress) {
                const pct = total > 0 ? received / total : 0.3;
                onProgress('Chargement modèle français (' + Math.round(pct * 100) + '%)...', pct * 0.6);
            }
        }
    }

    // Initialize Tesseract worker
    async function init(onProgress) {
        if (_ready) return;
        if (_initializing) return;
        _initializing = true;
        try {
            const base = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');

            // Step 1: pre-fetch language data ourselves (tracks 0→60% progress)
            if (onProgress) onProgress('Chargement modèle français...', 0);
            await _prefetchLangData(onProgress);
            if (onProgress) onProgress('Initialisation OCR...', 0.65);

            // Step 2: create worker — language data is now in HTTP cache, loads instantly
            _worker = await Tesseract.createWorker('fra', 1, {
                workerPath: base + 'lib/tesseract-worker.min.js',
                corePath: base + 'lib/tesseract-core-simd.wasm.js',
                langPath: base + 'lib/tessdata',
                cacheMethod: 'none',   // évite les blocages IndexedDB
                logger: m => {
                    if (onProgress && m.status === 'recognizing text') {
                        onProgress('Lecture OCR...', 0.7 + m.progress * 0.25);
                    }
                }
            });
            _ready = true;
            if (onProgress) onProgress('Prêt', 0.95);
        } catch (e) {
            console.error('[OCR] Init failed:', e);
            _initializing = false;
            throw e;
        }
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

    return { init, recognize, processImage, terminate, _matchMedications, _extractCandidates };
})();
