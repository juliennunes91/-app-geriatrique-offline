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

    // Initialize Tesseract worker
    async function init(onProgress) {
        if (_ready) return;
        if (_initializing) return;
        _initializing = true;
        try {
            const basePath = window.location.href.replace(/\/[^\/]*$/, '/');
            _worker = await Tesseract.createWorker('fra', 1, {
                workerPath: basePath + 'lib/tesseract-worker.min.js',
                corePath: basePath + 'lib/tesseract-core-simd.wasm.js',
                langPath: basePath + 'lib/tessdata',
                logger: m => {
                    if (onProgress && m.progress !== undefined) {
                        onProgress(m.status, m.progress);
                    }
                }
            });
            _ready = true;
        } catch (e) {
            console.error('[OCR] Init failed:', e);
            _initializing = false;
            throw e;
        }
    }

    // Run OCR on image and extract medications
    async function recognize(imageSource, onProgress) {
        if (!_ready) await init(onProgress);
        if (onProgress) onProgress('Lecture OCR en cours...', 0.5);
        const result = await _worker.recognize(imageSource);
        const rawText = result.data.text;
        if (onProgress) onProgress('Extraction des medicaments...', 0.9);
        const candidates = _extractCandidates(rawText);
        const medications = _matchMedications(candidates);
        if (onProgress) onProgress('Termine', 1);
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
