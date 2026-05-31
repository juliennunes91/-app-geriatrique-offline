// text_extractor.js — POC Tier 1 : extraction d'entités cliniques (médicaments,
// pathologies, biologie) depuis du texte libre, avec détection d'abréviations
// médicales françaises et de négations contextuelles.
//
// Périmètre Tier 1 (volontairement bornée, faible risque clinique) :
//   - Matching EXACT (DCI, NOM_STANDARD, SYNONYMES, CIM-10, princeps).
//   - Expansion d'abréviations médicales courantes (FA, IC, HTA, BPCO, …).
//   - Détection de négation simple (« pas de X », « sans X », « absence de X »,
//     « X écarté/exclu », « non X »).
//   - Extraction valeur biologique « analyte ± unité » avec virgule décimale.
//
// HORS Tier 1 (pour plus tard) : fuzzy matching (Levenshtein), extraction de
// posologie complète, ML/LLM, désambiguïsation avancée.
//
// API publique :
//   GeriaTextExtractor.extract(text, MASTER_DB) → { meds, pathologies, biology, abbreviations }
//   GeriaTextExtractor.applyResults(accepted, ctx)
//   GeriaTextExtractor.MEDICAL_ABBREVIATIONS
(function (global) {
    'use strict';

    // === Abréviations médicales françaises (cas-sensible pour éviter les faux positifs
    //     sur des mots courants : « fa » dans « fait », « ic » dans « voici », etc.) ===
    const MEDICAL_ABBREVIATIONS = {
        // Cardiovasculaire
        'FA': 'fibrillation atriale', 'HTA': 'hypertension arterielle',
        'IC': 'insuffisance cardiaque', 'HFrEF': 'insuffisance cardiaque a fraction d ejection reduite',
        'HFpEF': 'insuffisance cardiaque a fraction d ejection preservee',
        'IDM': 'infarctus du myocarde', 'SCA': 'syndrome coronarien aigu',
        'AVC': 'accident vasculaire cerebral', 'AIT': 'accident ischemique transitoire',
        'AOMI': 'arteriopathie obliterante des membres inferieurs',
        'TVP': 'thrombose veineuse profonde', 'EP': 'embolie pulmonaire',
        'MTEV': 'maladie thromboembolique veineuse', 'SCC': 'syndrome coronarien chronique',
        // Respiratoire
        'BPCO': 'bronchopneumopathie chronique obstructive',
        'SAOS': 'syndrome d apnees obstructives du sommeil', 'EFR': 'epreuves fonctionnelles respiratoires',
        // Endocrinien
        'DT1': 'diabete de type 1', 'DT2': 'diabete de type 2',
        // Rénal / digestif
        'IRC': 'insuffisance renale chronique', 'MRC': 'maladie renale chronique', 'IRA': 'insuffisance renale aigue',
        'RGO': 'reflux gastro oesophagien', 'UGD': 'ulcere gastro duodenal',
        // SNC
        'TAG': 'trouble anxieux generalise', 'SJSR': 'syndrome des jambes sans repos',
        'TCSP': 'trouble du comportement en sommeil paradoxal',
        // Urologie / Rhumato
        'HBP': 'hypertrophie benigne de la prostate', 'HBP': 'hypertrophie benigne de la prostate',
        'PR': 'polyarthrite rhumatoide',
        // Classes médicamenteuses
        'AINS': 'anti inflammatoire non steroidien', 'IPP': 'inhibiteur de la pompe a protons',
        'AOD': 'anticoagulant oral direct', 'AVK': 'antivitamine k',
        'IEC': 'inhibiteur de l enzyme de conversion', 'ARA2': 'antagoniste des recepteurs de l angiotensine ii',
        'ARNI': 'inhibiteur du recepteur de l angiotensine et de la neprilysine',
        'ISRS': 'inhibiteur selectif de recapture de la serotonine',
        'IRSN': 'inhibiteur de recapture de la serotonine et de la noradrenaline',
        'IMAO': 'inhibiteur de la monoamine oxydase', 'TCA': 'antidepresseur tricyclique',
        'BZD': 'benzodiazepine', 'IAChE': 'inhibiteur de l acetylcholinesterase',
        'iSGLT2': 'inhibiteur du sglt2', 'ARM': 'antagoniste des recepteurs des mineralocorticoides',
        // Examens / biologie (servent à matcher analyte BIO_*)
        'Hb': 'hemoglobine', 'NFS': 'numeration formule sanguine',
        'TSH': 'thyreostimuline', 'INR': 'international normalized ratio',
        'DFG': 'debit de filtration glomerulaire', 'GFR': 'debit de filtration glomerulaire',
        'CRP': 'proteine c reactive', 'HbA1c': 'hemoglobine glyquee',
        'PSA': 'antigene specifique de la prostate', 'NTproBNP': 'nt probnp',
        'QTc': 'qtc',
        // Contexte clinique
        'ATCD': 'antecedent', 'CFS': 'clinical frailty scale', 'NYHA': 'classe nyha',
        'MMSE': 'mini mental state examination', 'MoCA': 'montreal cognitive assessment'
    };

    // === Normalisation 1-pour-1 (préserve les positions char par char) ===
    const ACCENTS = {
        'à': 'a', 'â': 'a', 'ä': 'a', 'á': 'a', 'ã': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'î': 'i', 'ï': 'i', 'í': 'i',
        'ô': 'o', 'ö': 'o', 'ó': 'o', 'õ': 'o',
        'ù': 'u', 'û': 'u', 'ü': 'u', 'ú': 'u',
        'ç': 'c', 'ÿ': 'y', 'ñ': 'n',
        'À': 'a', 'Â': 'a', 'Ä': 'a', 'Á': 'a',
        'É': 'e', 'È': 'e', 'Ê': 'e', 'Ë': 'e',
        'Î': 'i', 'Ï': 'i', 'Ô': 'o', 'Ö': 'o',
        'Ù': 'u', 'Û': 'u', 'Ü': 'u', 'Ç': 'c'
    };
    function norm(s) {
        if (!s) return '';
        let out = '';
        for (let i = 0; i < s.length; i++) {
            const c = s[i];
            out += ACCENTS[c] !== undefined ? ACCENTS[c] : c.toLowerCase();
        }
        return out;
    }

    // === Construction de l'index de recherche depuis MASTER_DB ===
    function buildIndex(MASTER_DB) {
        const idx = { meds: [], pathologies: [], biology: [] };
        const splitSyn = s => String(s || '').split(/[,;]/).map(x => x.trim()).filter(Boolean);

        // Médicaments : DCI + princeps (séparés par , ou /)
        (MASTER_DB.MEDICAMENTS || []).forEach(m => {
            const terms = new Set();
            if (m.dci) terms.add(m.dci);
            if (m.princeps) String(m.princeps).split(/[,/]/).map(s => s.trim()).filter(Boolean).forEach(p => terms.add(p));
            terms.forEach(t => {
                const n = norm(t);
                if (n.length >= 4) idx.meds.push({ term: t, normTerm: n, target: { dci: m.dci, classe: m.classe || '' } });
            });
        });

        // Pathologies : NOM_STANDARD + SYNONYMES + CIM_10
        Object.values(MASTER_DB.PATHOLOGIES || {}).forEach(p => {
            const terms = new Set();
            if (p.NOM_STANDARD) terms.add(p.NOM_STANDARD);
            splitSyn(p.SYNONYMES).forEach(s => terms.add(s));
            if (p.CIM_10) terms.add(p.CIM_10);
            terms.forEach(t => {
                const n = norm(t);
                if (n.length >= 3) idx.pathologies.push({ term: t, normTerm: n, target: { id: p.ID_PATHO, label: p.NOM_STANDARD } });
            });
        });

        // Biologie : NOM_STANDARD + SYNONYMES (utilisé pour extraction valeur)
        Object.entries(MASTER_DB.BIOLOGIE || {}).forEach(([code, b]) => {
            const terms = new Set();
            if (b.NOM_STANDARD) terms.add(b.NOM_STANDARD);
            splitSyn(b.SYNONYMES).forEach(s => terms.add(s));
            terms.forEach(t => {
                const n = norm(t);
                // Seuil court pour biologie (K, Na, Ca, Mg…) car le contexte est strict
                // (analyte suivi obligatoirement d'une valeur numérique dans findBioHits).
                if (n.length >= 1) idx.biology.push({ term: t, normTerm: n, target: { code, label: b.NOM_STANDARD, unit: b.UNITE || '' } });
            });
        });

        // Tri par longueur décroissante (matches plus longs préférés)
        ['meds', 'pathologies', 'biology'].forEach(k => idx[k].sort((a, b) => b.normTerm.length - a.normTerm.length));
        return idx;
    }

    // === Détection des abréviations dans le texte ORIGINAL (case-sensible) ===
    function detectAbbreviations(text) {
        const hits = [];
        Object.keys(MEDICAL_ABBREVIATIONS).forEach(abbr => {
            const re = new RegExp('(?<![A-Za-z0-9])' + abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z0-9])', 'g');
            let m;
            while ((m = re.exec(text))) {
                hits.push({ start: m.index, end: m.index + abbr.length, abbr, expansion: MEDICAL_ABBREVIATIONS[abbr] });
            }
        });
        return hits;
    }

    // === Recherche d'entités (terme normalisé dans le texte normalisé) ===
    function findEntityHits(text, items) {
        const normText = norm(text);
        const used = new Uint8Array(normText.length);
        const hits = [];
        for (const it of items) {
            const t = it.normTerm;
            let from = 0;
            while (from < normText.length) {
                const idx = normText.indexOf(t, from);
                if (idx === -1) break;
                const before = idx > 0 ? normText[idx - 1] : '';
                const after = idx + t.length < normText.length ? normText[idx + t.length] : '';
                const isWB = !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after);
                let overlap = false;
                if (isWB) {
                    for (let k = idx; k < idx + t.length; k++) if (used[k]) { overlap = true; break; }
                }
                if (isWB && !overlap) {
                    hits.push({
                        start: idx, end: idx + t.length,
                        match: text.slice(idx, idx + t.length),
                        target: it.target
                    });
                    for (let k = idx; k < idx + t.length; k++) used[k] = 1;
                }
                from = idx + Math.max(1, t.length);
            }
        }
        return hits;
    }

    // === Bio : « analyte [=|:]? valeur unité? » avec virgule décimale FR ===
    function findBioHits(text, bioItems) {
        const normText = norm(text);
        const hits = [];
        const seen = new Uint8Array(normText.length);
        const VALUE = '(\\d+(?:[,.]\\d+)?)';
        const UNIT = '([a-zµ%][a-zµ%/.]{0,8})?';
        for (const it of bioItems) {
            // Pas de seuil min ici : « K 4,1 » / « Na 138 » sont sûrs car la regex
            // exige un word-boundary strict + une valeur numérique qui suit immédiatement.
            const esc = it.normTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp('(?<![a-z0-9])' + esc + '(?![a-z0-9])\\s*[:=]?\\s*' + VALUE + '\\s*' + UNIT, 'g');
            let m;
            while ((m = re.exec(normText))) {
                if (seen[m.index]) continue;
                const v = parseFloat(m[1].replace(',', '.'));
                if (!isFinite(v)) continue;
                const end = m.index + m[0].length;
                hits.push({
                    start: m.index, end,
                    match: text.slice(m.index, end),
                    target: it.target,
                    value: v,
                    unit: (m[2] || '').replace(/\.$/, '')
                });
                for (let k = m.index; k < end; k++) seen[k] = 1;
            }
        }
        return hits;
    }

    // === Détection de négation (fenêtre 40 chars avant, CLIPPÉE à la dernière fin
    //     de phrase pour éviter les faux positifs cross-phrase) ===
    const NEGATION_RE = /(pas d[e'’ ]|sans\s|absence d[e'’]|aucun[e]?\b|non\s+(?:de\s+|d['’]\s*)?|exclu[ets]*|ecart[ets]*|elimin[ets]*|jamais|ni\s+|infirm[ets]*)/i;
    function isNegated(text, start) {
        let window = text.slice(Math.max(0, start - 40), start);
        // Clipper à la dernière frontière de phrase (préserve la sémantique)
        const seps = ['.', '?', '!', ';', '\n', ':'];
        let cut = -1;
        seps.forEach(s => { const i = window.lastIndexOf(s); if (i > cut) cut = i; });
        if (cut >= 0) window = window.slice(cut + 1);
        return NEGATION_RE.test(norm(window));
    }

    // === Distance de Levenshtein (fuzzy matching pour fautes de frappe) ===
    function levenshtein(a, b) {
        if (a === b) return 0;
        const m = a.length, n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        if (Math.abs(m - n) > 3) return 99; // short-circuit (on ne tolère pas > 3)
        let prev = new Array(n + 1);
        for (let j = 0; j <= n; j++) prev[j] = j;
        let curr = new Array(n + 1);
        for (let i = 1; i <= m; i++) {
            curr[0] = i;
            for (let j = 1; j <= n; j++) {
                const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
                curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
            }
            [prev, curr] = [curr, prev];
        }
        return prev[n];
    }

    // === Fuzzy hits — pour les mots ≥6 chars non déjà capturés exactement ===
    // Conservateur : seuil 1 pour 6-8 chars, 2 pour ≥9 chars. Uniquement contre les
    // termes ≥6 chars (les synonymes courts type "FA" ou brand resteraient ambigus).
    function findFuzzyHits(text, items, alreadyTaken) {
        const normText = norm(text);
        // Extraire les tokens-mots avec leurs positions
        const tokenRe = /[a-z][a-z']{4,}/g;
        const hits = [];
        const longItems = items.filter(it => it.normTerm.length >= 6 && !/\s/.test(it.normTerm));
        let m;
        while ((m = tokenRe.exec(normText))) {
            const tok = m[0], start = m.index, end = start + tok.length;
            if (tok.length < 6) continue;
            // Skip si chevauche un hit déjà capturé
            let overlap = false;
            for (let k = start; k < end; k++) if (alreadyTaken[k]) { overlap = true; break; }
            if (overlap) continue;
            const maxDist = tok.length >= 9 ? 2 : 1;
            // Filtre rapide par première lettre
            const c0 = tok[0];
            let best = null;
            for (const it of longItems) {
                if (it.normTerm[0] !== c0) continue;
                if (Math.abs(it.normTerm.length - tok.length) > maxDist) continue;
                const d = levenshtein(tok, it.normTerm);
                if (d <= maxDist && (!best || d < best.dist)) {
                    best = { it, dist: d };
                    if (d === 0) break;
                }
            }
            if (best && best.dist > 0) {
                hits.push({
                    start, end,
                    match: text.slice(start, end),
                    target: best.it.target,
                    source: 'fuzzy',
                    fuzzyDistance: best.dist
                });
                for (let k = start; k < end; k++) alreadyTaken[k] = 1;
            }
        }
        return hits;
    }

    // === Extraction de posologie (juste après un médicament) ===
    // Patterns supportés : « 5 mg », « 1 g x 3 », « 40 mg/j », « 25 µg x 2/j »,
    //                      « 1 cp matin », « 100 UI/sem ».
    const POSO_RE = /^\s*[:=]?\s*(\d+(?:[,.]\d+)?)\s*(mg|µg|mcg|g|ml|ui|u|gouttes?|cp|comprim[ée]s?)\s*(?:x\s*(\d+))?\s*(?:\/\s*(j|jour|sem|semaine|mois|h))?/i;
    function extractPosology(text, hit) {
        const tail = text.slice(hit.end, hit.end + 60);
        const m = POSO_RE.exec(tail);
        if (!m) return null;
        const dose = parseFloat(m[1].replace(',', '.'));
        if (!isFinite(dose)) return null;
        return {
            dose,
            unite: (m[2] || '').toLowerCase(),
            frequence: m[3] ? parseInt(m[3], 10) : null,
            periode: m[4] ? m[4].toLowerCase().replace(/^jour$/, 'j').replace(/^semaine$/, 'sem') : null,
            raw: m[0].trim()
        };
    }

    // === Historique (ATCD / antécédent / connu / depuis…) ===
    const HISTORICAL_RE = /\b(atcd|antecedents?|antecedent\s+de|histoire d[e'’]|connu[e]?|en\s+remission|sequelle[s]?|status post)\b/i;
    function isHistorical(text, start) {
        let window = text.slice(Math.max(0, start - 35), start);
        const seps = ['.', '?', '!', ';', '\n'];
        let cut = -1;
        seps.forEach(s => { const i = window.lastIndexOf(s); if (i > cut) cut = i; });
        if (cut >= 0) window = window.slice(cut + 1);
        return HISTORICAL_RE.test(norm(window));
    }

    // === Paires mutuellement exclusives (cliniquement) ===
    const MUTEX_PAIRS = [
        { ids: ['PAT_002', 'PAT_003'], reason: 'HFrEF et HFpEF s’excluent (un patient a l’une OU l’autre)' },
        { ids: ['PAT_016a', 'PAT_016b'], reason: 'Diabète type 1 et type 2 sont distincts' }
    ];
    function detectConflicts(pathos) {
        const ids = new Set(pathos.filter(p => !p.negated).map(p => p.target.id));
        return MUTEX_PAIRS
            .filter(p => p.ids.every(id => ids.has(id)))
            .map(p => ({ ids: p.ids, reason: p.reason, labels: p.ids.map(id => (pathos.find(h => h.target.id === id) || {}).target?.label || id) }));
    }

    // === Mapping direct abréviation → PAT_id (robuste, sans dépendre des libellés) ===
    // Évite les échecs quand l'expansion textuelle diffère du NOM_STANDARD
    // (ex. HFrEF expansion "à fraction d'éjection réduite" vs NOM "FE Réduite").
    const ABBR_TO_PAT_ID = {
        'HFrEF': 'PAT_002', 'HFpEF': 'PAT_003',
        'FA': 'PAT_006', 'HTA': 'PAT_005', 'AVC': 'PAT_008', 'AIT': 'PAT_008',
        'AOMI': 'PAT_007', 'IDM': 'PAT_004', 'SCA': 'PAT_004', 'SCC': 'PAT_004',
        'BPCO': 'PAT_023', 'SAOS': 'PAT_052',
        'DT1': 'PAT_016a', 'DT2': 'PAT_016b',
        'IRC': 'PAT_029', 'MRC': 'PAT_029',
        'RGO': 'PAT_053', 'UGD': 'PAT_021',
        'TAG': 'PAT_044', 'SJSR': 'PAT_051', 'TCSP': 'PAT_050',
        'HBP': 'PAT_040', 'PR': 'PAT_055',
        'MTEV': 'PAT_036', 'TVP': 'PAT_036', 'EP': 'PAT_036'
    };
    const ABBR_TO_BIO_CODE = {
        'Hb': 'BIO_009', 'DFG': 'BIO_004', 'GFR': 'BIO_004',
        'TSH': 'BIO_019', 'INR': 'BIO_030', 'HbA1c': 'BIO_026',
        'QTc': 'BIO_031', 'CRP': 'BIO_027' // CRP peut ne pas exister; ignoré si absent
    };

    // === Extraction de durée (« depuis 6 mois », « il y a 2 ans », « pendant 3 sem ») ===
    // Cherche dans la fenêtre 100 chars APRÈS la fin du hit (typiquement même phrase).
    const DUREE_RE = /\b(?:depuis|il y a|pendant|pour)\s+(\d+(?:[,.]\d+)?)\s*(jours?|j\b|sem(?:aines?)?|mois|ans?|annees?)/i;
    function extractDuree(text, hit) {
        const tail = text.slice(hit.end, hit.end + 100);
        const m = DUREE_RE.exec(tail);
        if (!m) return null;
        const n = parseFloat(m[1].replace(',', '.'));
        const u = m[2].toLowerCase();
        const jours = /^j(?:our)?s?$/.test(u) ? n :
            /^sem/.test(u) ? n * 7 :
                /^mois$/.test(u) ? n * 30 :
                    /^(an|annee)/.test(u) ? n * 365 : null;
        if (jours === null) return null;
        const classe = jours < 14 ? 'courte' : (jours >= 90 ? 'longue' : 'intermediaire');
        return { value: n, unite: u, jours: Math.round(jours), classe, raw: m[0] };
    }

    // === Allergies (« allergie à X », « allergique à X », « intolérance à X ») ===
    // Note : on accepte « é » dans intol(é)rance — sinon "Intolérance" est manqué.
    const ALLERGY_RE = /\b(allergies?|allergiques?|intol[eé]ranc[eé]s?)\s*(?:[àa]u?x?\s+|[:à]\s*)([a-zà-ÿ' \-]{3,40})/gi;
    function findAllergyHits(text, idx) {
        const hits = [];
        const re = new RegExp(ALLERGY_RE.source, 'gi');
        let m;
        while ((m = re.exec(text)) !== null) {
            const start = m.index;
            const phrase = (m[2] || '').trim().replace(/[.,;:].*$/, '');
            if (!phrase) continue;
            // Filtrer les non-substances (aucune connue, connue, non précisée…)
            if (/^(aucun|connue?s?|non\s|nkda|nil\b)/i.test(phrase)) continue;
            // Ignorer si négation explicite avant
            const before = text.slice(Math.max(0, start - 25), start).toLowerCase();
            if (/(aucun|sans\s|pas d|nie\b|non\s)/i.test(before)) continue;
            // Tenter de matcher contre un med ; sinon allergie générique
            const firstWord = norm(phrase.split(/\s/)[0]);
            let target = null;
            for (const it of idx.meds) {
                if (it.normTerm.length >= 4 && (firstWord.indexOf(it.normTerm) !== -1 || it.normTerm.indexOf(firstWord) !== -1)) {
                    target = it.target; break;
                }
            }
            hits.push({
                start, end: start + m[0].length,
                match: m[0].trim(),
                substance: phrase,
                target: target || { dci: null },
                source: 'allergy'
            });
        }
        return hits;
    }

    // === Conversion d'unités biologiques courantes vers l'unité standard de l'app ===
    function convertBioUnit(code, value, rawUnit) {
        if (!rawUnit) return null;
        const u = String(rawUnit).toLowerCase().replace(/\s/g, '');
        if (code === 'BIO_003') { // Créatinine : standard µmol/L, alt mg/dL
            if (u === 'mg/dl' || u === 'mgdl' || u === 'mg%') return { value: +(value * 88.4).toFixed(1), unit: 'µmol/L', from: rawUnit };
        }
        if (code === 'BIO_025') { // Glycémie : standard mmol/L
            if (u === 'g/l' || u === 'gl') return { value: +(value * 5.55).toFixed(2), unit: 'mmol/L', from: rawUnit };
            if (u === 'mg/dl' || u === 'mgdl') return { value: +(value * 0.0555).toFixed(2), unit: 'mmol/L', from: rawUnit };
        }
        if (code === 'BIO_007') { // Urée : standard mmol/L
            if (u === 'g/l' || u === 'gl') return { value: +(value * 16.65).toFixed(2), unit: 'mmol/L', from: rawUnit };
        }
        return null;
    }

    // === Match d'une abréviation → entité ===
    function matchAbbreviationToEntities(abbrHit, idx, MASTER_DB) {
        // 1) Mapping direct (le plus robuste)
        const patId = ABBR_TO_PAT_ID[abbrHit.abbr];
        if (patId && MASTER_DB.PATHOLOGIES && MASTER_DB.PATHOLOGIES[patId]) {
            const p = MASTER_DB.PATHOLOGIES[patId];
            return { kind: 'patho', target: { id: patId, label: p.NOM_STANDARD } };
        }
        const bioCode = ABBR_TO_BIO_CODE[abbrHit.abbr];
        if (bioCode && MASTER_DB.BIOLOGIE && MASTER_DB.BIOLOGIE[bioCode]) {
            const b = MASTER_DB.BIOLOGIE[bioCode];
            return { kind: 'bio', target: { code: bioCode, label: b.NOM_STANDARD, unit: b.UNITE || '' } };
        }
        // 2) Fallback : recherche de l'expansion par inclusion
        const expN = norm(abbrHit.expansion).trim();
        if (expN.length < 4) return null;
        const matches = (h, n) => h === n || (h.length >= n.length && h.indexOf(n) !== -1);
        let best = null;
        for (const it of idx.pathologies) {
            if (matches(it.normTerm, expN)) {
                if (!best || it.normTerm.length > best.it.normTerm.length) best = { kind: 'patho', it };
                if (it.normTerm === expN) break;
            }
        }
        if (best) return { kind: best.kind, target: best.it.target };
        for (const it of idx.biology) {
            if (it.normTerm === expN) return { kind: 'bio', target: it.target };
        }
        return null;
    }

    // === API principale ===
    function extract(text, MASTER_DB) {
        const empty = { meds: [], pathologies: [], biology: [], allergies: [], abbreviations: [], conflicts: [] };
        if (!text || !MASTER_DB) return empty;
        const idx = buildIndex(MASTER_DB);

        const abbrHits = detectAbbreviations(text);
        const pathoHits = findEntityHits(text, idx.pathologies);
        const medHits = findEntityHits(text, idx.meds);
        const bioHits = findBioHits(text, idx.biology);

        // Augmenter les pathologies via les abréviations
        abbrHits.forEach(ah => {
            const match = matchAbbreviationToEntities(ah, idx, MASTER_DB);
            if (match && match.kind === 'patho') {
                if (!pathoHits.some(h => h.start === ah.start && h.target.id === match.target.id)) {
                    pathoHits.push({
                        start: ah.start, end: ah.end,
                        match: ah.abbr,
                        target: match.target,
                        viaAbbreviation: ah.abbr
                    });
                }
            }
        });

        // === Fuzzy fallback : pour les tokens non capturés exactement ===
        // Marquer les positions déjà occupées par les hits exacts.
        const taken = new Uint8Array(text.length);
        [...pathoHits, ...medHits].forEach(h => { for (let k = h.start; k < h.end; k++) taken[k] = 1; });
        const fuzzyPathoHits = findFuzzyHits(text, idx.pathologies, taken);
        const fuzzyMedHits = findFuzzyHits(text, idx.meds, taken);
        pathoHits.push(...fuzzyPathoHits);
        medHits.push(...fuzzyMedHits);

        // Annotation : négation + historique + source + posologie/durée + conversion bio
        const annotate = (h, kind) => {
            h.negated = isNegated(text, h.start);
            if (!h.negated && (kind === 'patho' || kind === 'med')) {
                h.historical = isHistorical(text, h.start);
            }
            h.source = h.source || (h.viaAbbreviation ? 'abbreviation' : 'exact');
            if (kind === 'med') {
                const poso = extractPosology(text, h);
                if (poso) h.posology = poso;
                const duree = extractDuree(text, h);
                if (duree) {
                    h.posology = h.posology || {};
                    h.posology.duree = duree;
                }
            }
            if (kind === 'bio' && h.unit && h.target && h.target.code) {
                const conv = convertBioUnit(h.target.code, h.value, h.unit);
                if (conv) {
                    h.originalValue = h.value;
                    h.originalUnit = h.unit;
                    h.value = conv.value;
                    h.unit = conv.unit;
                    h.converted = true;
                }
            }
            return h;
        };
        const allPatho = pathoHits.map(h => annotate(h, 'patho'));
        const allMed = medHits.map(h => annotate(h, 'med'));
        const allBio = bioHits.map(h => annotate(h, 'bio'));

        // Allergies (entité distincte)
        const allergyHits = findAllergyHits(text, idx);

        // Dédup par cible (garder la première occurrence ou la plus longue)
        const dedupByTarget = (arr, keyFn) => {
            const map = new Map();
            arr.forEach(h => {
                const k = keyFn(h);
                if (!k) return;
                // Préférer un hit exact à un fuzzy
                const existing = map.get(k);
                if (!existing) { map.set(k, h); return; }
                const isExisting_exact = existing.source !== 'fuzzy';
                const isH_exact = h.source !== 'fuzzy';
                if (isH_exact && !isExisting_exact) { map.set(k, h); return; }
                if (!isH_exact && isExisting_exact) return;
                // Préférer le hit avec posology si égalité
                if (h.posology && !existing.posology) { map.set(k, h); return; }
                if ((h.end - h.start) > (existing.end - existing.start)) map.set(k, h);
            });
            return [...map.values()].sort((a, b) => a.start - b.start);
        };

        const finalPatho = dedupByTarget(allPatho, h => h.target.id);
        let finalMed = dedupByTarget(allMed, h => h.target.dci);
        const finalBio = dedupByTarget(allBio, h => h.target.code);

        // Si le token médicament chevauche un hit d'allergie (« intolérance à X »),
        // il ne s'agit pas d'une prescription active : on le retire de la liste meds.
        if (allergyHits.length) {
            finalMed = finalMed.filter(m => !allergyHits.some(a => m.start >= a.start && m.end <= a.end));
        }

        return {
            pathologies: finalPatho,
            meds: finalMed,
            biology: finalBio,
            allergies: allergyHits,
            abbreviations: abbrHits,
            conflicts: detectConflicts(finalPatho)
        };
    }

    // === Application des résultats acceptés à l'état patient ===
    // ctx = { selectComorb(id), selectMed(dci), setBioValue(code, value), already: {comorbs:Set, meds:Set} }
    function applyResults(accepted, ctx) {
        const summary = { comorbs: 0, meds: 0, bio: 0, skipped: 0 };
        (accepted.pathologies || []).forEach(p => {
            if (ctx.already && ctx.already.comorbs && ctx.already.comorbs.has(p.target.id)) { summary.skipped++; return; }
            if (ctx.selectComorb) { ctx.selectComorb(p.target.id); summary.comorbs++; }
        });
        (accepted.meds || []).forEach(m => {
            const k = (m.target.dci || '').toLowerCase();
            if (ctx.already && ctx.already.meds && ctx.already.meds.has(k)) { summary.skipped++; return; }
            if (ctx.selectMed) { ctx.selectMed(m.target.dci, m.posology || null); summary.meds++; }
        });
        (accepted.biology || []).forEach(b => {
            if (ctx.setBioValue) { ctx.setBioValue(b.target.code, b.value); summary.bio++; }
        });
        return summary;
    }

    global.GeriaTextExtractor = { extract, applyResults, MEDICAL_ABBREVIATIONS, _buildIndex: buildIndex, _norm: norm };
})(typeof window !== 'undefined' ? window : globalThis);
