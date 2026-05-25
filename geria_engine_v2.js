// ============================================================================
// ⚡ GERIA_ENGINE_V2 - Moteur Optimisé d'Évaluation des Recommandations
// Version 2.0 - Mars 2026
// ============================================================================
// Remplace evaluerRecommandations() de geria_recos_db.js
//
// OPTIMISATIONS :
//   1. INDEX INVERSÉ : med_key → règles candidates (÷10 sur le temps)
//   2. CACHE hasMedKey : chaque classe testée une seule fois
//   3. SCORING MULTI-DIMENSIONNEL : chaque alerte reçoit un score composite
//   4. TRIAGE 3 NIVEAUX : Critique / Important / Informatif
//   5. DASHBOARD PIM GLOBAL : vision synthétique de l'ordonnance
// ============================================================================

const GeriaEngineV2 = (() => {

    // ========================================================================
    // 1. INDEX INVERSÉ — Construit au chargement, pas à chaque évaluation
    // ========================================================================
    
    let _invertedIndex = null;   // { med_key: [rule_ids...] }
    let _ruleMap = null;         // { rule_id: rule }
    
    /**
     * Construit l'index inversé à partir de toutes les règles.
     * Appelé une seule fois au chargement.
     */
    function buildIndex() {
        if (_invertedIndex) return; // déjà construit
        
        _invertedIndex = {};
        _ruleMap = {};
        
        const allRules = [
            ...GERIA_RECOS_DB.EVITER.map(r => ({ ...r, _type: 'eviter' })),
            ...GERIA_RECOS_DB.INITIER.map(r => ({ ...r, _type: 'initier' })),
            ...(typeof RECOS_SUPPLEMENT !== 'undefined' ? RECOS_SUPPLEMENT.map(r => ({ ...r, _type: 'supplement' })) : [])
        ];
        
        allRules.forEach(rule => {
            _ruleMap[rule.id] = rule;
            const c = rule.condition;
            if (!c) return;
            
            // Indexer par med_keys
            const keys = [
                ...(c.med_keys || []),
                ...(c.med_keys_2 || []),
                ...(c.med_keys_3 || []),
                ...(c.med_absent || [])
            ];
            
            if (keys.length === 0) {
                // Règles sans med_keys (polypharmacie, ACB, manual_review, etc.)
                if (!_invertedIndex['__GLOBAL__']) _invertedIndex['__GLOBAL__'] = [];
                _invertedIndex['__GLOBAL__'].push(rule.id);
            } else {
                keys.forEach(k => {
                    const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (!_invertedIndex[nk]) _invertedIndex[nk] = [];
                    if (!_invertedIndex[nk].includes(rule.id)) {
                        _invertedIndex[nk].push(rule.id);
                    }
                });
            }
        });
        
        console.log(`[GeriaEngineV2] Index inversé construit : ${Object.keys(_invertedIndex).length} clés, ${allRules.length} règles indexées.`);
    }
    
    // ========================================================================
    // 2. CACHE hasMedKey — Évalué une seule fois par classe par contexte
    // ========================================================================
    
    let _medKeyCache = null;
    
    function initMedKeyCache(ctx) {
        _medKeyCache = {};
        
        if (!ctx.activeMeds) return;
        
        // Pré-calculer les propriétés de chaque med actif
        ctx._medsNormalized = ctx.activeMeds.map(m => ({
            dci: (m.dci || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''),
            classe: (m.classe || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''),
            raw: m
        }));
    }
    
    function hasMedKeyCached(key, ctx) {
        if (!ctx.activeMeds || !key) return false;

        const k = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (_medKeyCache[k] !== undefined) return _medKeyCache[k];

        // Cas spécial : antihypertenseur (composite)
        if (k === 'antihypertenseur') {
            const result = ctx._medsNormalized.some(m => m.classe.includes('hypertens')) ||
                hasMedKeyCached('iec', ctx) || hasMedKeyCached('ara2', ctx) ||
                hasMedKeyCached('inhibiteurcalcique', ctx) || hasMedKeyCached('diuretique', ctx) ||
                hasMedKeyCached('betabloquant', ctx);
            _medKeyCache[k] = result;
            return result;
        }

        // Utilise le référentiel centralisé de drug_classes.js
        const result = ctx._medsNormalized.some(m => matchesDrugClass(m.dci, m.classe, k));

        _medKeyCache[k] = result;
        return result;
    }

    // ========================================================================
    // 3. SCORING MULTI-DIMENSIONNEL
    // ========================================================================
    
    /**
     * Calcule un score composite pour chaque alerte déclenchée.
     * Score = consensus × gravité × contexte × vulnérabilité
     * 
     * Échelle finale : 0-100
     *   0-29  = Informatif (vert)
     *   30-59 = Important (orange) 
     *   60-100 = Critique (rouge)
     */
    const SEVERITY_WEIGHTS = {
        // Poids de base selon sévérité déclarée
        'danger': 40,
        'warning': 20,
        'info': 8
    };
    
    const SOURCE_CONSENSUS_WEIGHT = {
        // Bonus par nombre de sources convergentes
        1: 0,
        2: 5,
        3: 10,
        4: 15,
        5: 22,
        6: 28,
        7: 33,
        8: 38  // unanimité 8 sources
    };
    
    const FORTA_WEIGHT = {
        'D': 15,   // à éviter formellement
        'C': 8,    // discutable, rapport B/R défavorable
        'B': 0,    // bénéfique (pas de malus)
        'A': -5    // indispensable (bonus négatif = protecteur)
    };
    
    function computeAlertScore(alert, ctx) {
        let score = 0;
        
        // (A) Gravité de base
        score += SEVERITY_WEIGHTS[alert.severite] || 15;

        // (A bis) Contre-indication absolue → priorité critique garantie.
        // Une CI absolue (danger 40 + 35) atteint le seuil CRITIQUE (≥ 60) et remonte
        // en tête, quelle que soit la richesse des autres facteurs.
        const _ciText = ((alert.titre || '') + ' ' + (alert.message || '')).toUpperCase();
        if (/CONTRE-?INDICATION ABSOLUE|\bCI ABSOLUE\b/.test(_ciText)) score += 35;
        
        // (B) Consensus multi-sources
        const effectiveSources = alert.all_sources || alert.sources || [];
        const numSources = Math.min(effectiveSources.length, 8);
        score += SOURCE_CONSENSUS_WEIGHT[numSources] || 0;
        
        // (C) FORTA classification (si disponible via PIM_DICT)
        if (alert.pim_dict_keys && typeof PIM_DICT !== 'undefined') {
            let worstForta = null;
            alert.pim_dict_keys.forEach(dciKey => {
                const pim = PIM_DICT[dciKey];
                if (pim && pim.forta) {
                    if (!worstForta || 'DCBA'.indexOf(pim.forta) < 'DCBA'.indexOf(worstForta)) {
                        worstForta = pim.forta;
                    }
                }
            });
            if (worstForta) score += FORTA_WEIGHT[worstForta] || 0;
        }
        
        // (D) Confirmation biologique (si bio anormale renforce l'alerte)
        if (alert.condition && ctx.bioValues && (alert.condition.bio || alert.condition.bio_any)) {
            let bioConfirmed = false;
            const matchCrit = (crit, val) =>
                (crit.op === '<' && val < crit.val) ||
                (crit.op === '>' && val > crit.val) ||
                (crit.op === '<=' && val <= crit.val) ||
                (crit.op === '>=' && val >= crit.val);
            const scanBio = (bioObj) => {
                if (!bioObj) return;
                for (const [bioId, critRaw] of Object.entries(bioObj)) {
                    const val = ctx.bioValues[bioId];
                    if (val > 0 && (Array.isArray(critRaw) ? critRaw : [critRaw]).some(c => matchCrit(c, val))) {
                        bioConfirmed = true;
                    }
                }
            };
            scanBio(alert.condition.bio);
            scanBio(alert.condition.bio_any);
            if (bioConfirmed) score += 12; // Bio confirme le risque
        }
        
        // (E) Vulnérabilité du patient
        if (ctx.isFragile) score += 8;
        if (ctx.patientAge >= 85) score += 6;
        else if (ctx.patientAge >= 80) score += 3;
        
        // (F) Co-prescription amplifiante (si med_keys_2 → interaction = plus grave)
        if (alert.condition && alert.condition.med_keys_2) score += 8;
        
        // (G) Score ACB cumulé élevé → amplificateur pour alertes ACB
        if (alert.condition && (alert.condition.acb_cumul || alert.condition.acb_check)) {
            if (ctx.scoreACB_global >= 5) score += 10;
            else if (ctx.scoreACB_global >= 3) score += 5;
        }
        
        // Clamp 0-100
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    /**
     * Détermine le niveau de triage à partir du score.
     */
    function getTriageLevel(score) {
        if (score >= 60) return { level: 'CRITIQUE', color: 'danger', icon: '🔴', priority: 1, label: 'Action immédiate requise' };
        if (score >= 30) return { level: 'IMPORTANT', color: 'warning', icon: '🟠', priority: 2, label: 'Réévaluation planifiée' };
        return { level: 'INFORMATIF', color: 'info', icon: '🔵', priority: 3, label: 'À discuter / documenter' };
    }

    // ========================================================================
    // 4. ÉVALUATION OPTIMISÉE (index inversé + cache + scoring)
    // ========================================================================
    
    function checkRuleOptimized(rule, ctx) {
        const c = rule.condition;
        if (!c) return false;
        if (c.type === 'manual_review' || c.type === 'duplication_check') return false;

        if (c.med_keys && !c.med_keys.some(k => hasMedKeyCached(k, ctx))) return false;
        if (c.med_keys_2 && !c.med_keys_2.some(k => hasMedKeyCached(k, ctx))) return false;
        // med_keys_3 : pour les règles nécessitant 3 classes distinctes (ex : triple whammy AINS+IEC+diurétique → SYND_045)
        if (c.med_keys_3 && !c.med_keys_3.some(k => hasMedKeyCached(k, ctx))) return false;
        if (c.med_absent && c.med_absent.some(k => hasMedKeyCached(k, ctx))) return false;
        if (c.comorbs && !c.comorbs.every(p => ctx.activeComorbs && ctx.activeComorbs.includes(p))) return false;
        if (c.comorbs_any && !c.comorbs_any.some(p => ctx.activeComorbs && ctx.activeComorbs.includes(p))) return false;
        if (c.comorbs_absent && c.comorbs_absent.some(p => ctx.activeComorbs && ctx.activeComorbs.includes(p))) return false;

        if (c.contexte_clinique) {
            const ctxClin = ctx.contexte_clinique || [];
            if (typeof c.contexte_clinique === 'string') {
                if (!ctxClin.includes(c.contexte_clinique)) return false;
            } else if (Array.isArray(c.contexte_clinique)) {
                if (!c.contexte_clinique.every(cc => ctxClin.includes(cc))) return false;
            }
        }
        // contexte_clinique_any : au moins un des contextes listés (OU logique)
        if (c.contexte_clinique_any) {
            const ctxClin = ctx.contexte_clinique || [];
            if (!c.contexte_clinique_any.some(cc => ctxClin.includes(cc))) return false;
        }
        // contexte_clinique_absent : aucun des contextes listés ne doit être présent.
        // Sert aux précisions par médicament (durée/intensité) qui désarment un faux
        // positif, ex. corticothérapie brève explicite, douleur sévère explicite.
        if (c.contexte_clinique_absent) {
            const ctxClin = ctx.contexte_clinique || [];
            if (c.contexte_clinique_absent.some(cc => ctxClin.includes(cc))) return false;
        }

        if (c.bio) {
            for (const [bioId, critRaw] of Object.entries(c.bio)) {
                const val = ctx.bioValues && ctx.bioValues[bioId];
                if (!val || val <= 0) {
                    // Bio requise mais non renseignée.
                    // INITIER (omissions) : par défaut on NE bloque PAS (la bio est remontée en
                    // caveat dans le message). SAUF si la règle déclare bio_strict : la bio est
                    // alors la justification clinique, son absence empêche le déclenchement
                    // (évite les faux positifs « carence/protéinurie » affirmés sans donnée).
                    // EVITER : on reste prudent et on ne déclenche pas (faux positif danger).
                    if (rule._type === 'initier' && !c.bio_strict) {
                        continue;
                    }
                    return false;
                }
                // Un critère {op,val} OU un tableau de critères (tous requis) pour une
                // fourchette, ex. TSH ∈ [4,10[ : [{op:'>=',val:4},{op:'<',val:10}].
                const crits = Array.isArray(critRaw) ? critRaw : [critRaw];
                for (const crit of crits) {
                    if (crit.op === '<' && !(val < crit.val)) return false;
                    if (crit.op === '>' && !(val > crit.val)) return false;
                    if (crit.op === '<=' && !(val <= crit.val)) return false;
                    if (crit.op === '>=' && !(val >= crit.val)) return false;
                }
            }
        }

        // bio_any : au moins UN analyte renseigné et conforme (OU logique). Un analyte
        // non renseigné est ignoré ; si aucun n'est conforme, la règle ne se déclenche pas.
        if (c.bio_any) {
            const matchCrit = (val, crit) => {
                if (crit.op === '<') return val < crit.val;
                if (crit.op === '>') return val > crit.val;
                if (crit.op === '<=') return val <= crit.val;
                if (crit.op === '>=') return val >= crit.val;
                return false;
            };
            let anyOk = false;
            for (const [bioId, critRaw] of Object.entries(c.bio_any)) {
                const val = ctx.bioValues && ctx.bioValues[bioId];
                if (!val || val <= 0) continue;
                const crits = Array.isArray(critRaw) ? critRaw : [critRaw];
                if (crits.every(cr => matchCrit(val, cr))) { anyOk = true; break; }
            }
            if (!anyOk) return false;
        }

        if (c.age_min && (!ctx.patientAge || ctx.patientAge < c.age_min)) return false;
        if (c.age_max && ctx.patientAge && ctx.patientAge > c.age_max) return false;
        if (c.fragile === true && !ctx.isFragile) return false;
        // Déprescription STOPPFrail : ne s'applique qu'en fragilité sévère (CFS ≥ 6
        // ou fin de vie). Sans ce garde, les règles « (STOPP/FRAIL) » se déclenchaient
        // dès la présence du médicament (faux positif chez le sujet robuste).
        if (c.fragilite === 'severe' && !ctx.fragiliteSevere) return false;
        // Symétrique : exclut la règle si le patient est fragile (utile pour les START
        // dont le bénéfice s'effondre en fin de vie ou fragilité sévère — STOPPFrail v2,
        // ex. statine prévention 2° si EV < 1-2 ans).
        if (c.frailty_exclude === true && ctx.isFragile) return false;
        if (c.acb_cumul && c.acb_seuil) {
            if (!ctx.scoreACB_global || ctx.scoreACB_global < c.acb_seuil) return false;
            // Exiger au moins 2 médicaments avec ACB ≥ 2 (anticholinergique cliniquement significatif)
            // — évite les faux positifs quand un seul médicament fort (ACB 3) + un ACB=1 trivial
            // (furosémide, digoxine) font artificiellement franchir le seuil cumulatif.
            let acbMedCount = ctx.activeMeds
                ? ctx.activeMeds.filter(m => m.db_ref && parseFloat(m.db_ref.acb) >= 2).length
                : 0;
            if (acbMedCount < 2) return false;
        }
        if (c.acb_check && !(ctx.activeMeds && ctx.activeMeds.some(m => m.db_ref && parseFloat(m.db_ref.acb) >= 2))) return false;
        if (c.qt_check && !(ctx.activeMeds && ctx.activeMeds.some(m => m.db_ref && String(m.db_ref.qt_risque || '').includes('(KR)')))) return false;
        if (c.polypharmacie && c.seuil) {
            // Si med_keys est défini : on exige seuil méds DIFFÉRENTS de la liste
            // (ex: ≥ 3 antidépresseurs distincts). Sinon, seuil sur le total.
            if (c.med_keys && c.med_keys.length > 0) {
                const matchCount = (ctx._medsNormalized || []).filter(m =>
                    c.med_keys.some(k => matchesDrugClass(m.dci, m.classe, k))
                ).length;
                if (matchCount < c.seuil) return false;
            } else if (!ctx.activeMeds || ctx.activeMeds.length < c.seuil) {
                return false;
            }
        }

        return true;
    }
    
    /**
     * Point d'entrée principal — Évalue toutes les recommandations
     * avec index inversé, scoring et triage.
     */
    let _lastActiveComorbs = []; // Stored for findEbmSource during rendering

    // Normalisation des comorbidités mutuellement exclusives.
    // Si un sous-type spécifique est coché, le générique est retiré pour éviter les doublons d'alertes.
    const COMORB_GENERIC_OVERRIDES = {
        "PAT_010": ["PAT_011", "PAT_012", "PAT_013"], // Syndrome démentiel générique → Alzheimer / DCL / DFT
        "PAT_016": ["PAT_016a", "PAT_016b"],          // Diabète non précisé → DT1 / DT2
    };
    function normalizeActiveComorbs(list) {
        if (!Array.isArray(list) || list.length === 0) return list || [];
        const set = new Set(list);
        Object.entries(COMORB_GENERIC_OVERRIDES).forEach(([generic, specifics]) => {
            if (set.has(generic) && specifics.some(s => set.has(s))) {
                set.delete(generic);
            }
        });
        return Array.from(set);
    }

    function evaluer(ctx) {
        const t0 = performance.now();
        // Normalisation : retirer les comorbidités génériques quand un sous-type est coché
        if (ctx.activeComorbs) ctx.activeComorbs = normalizeActiveComorbs(ctx.activeComorbs);
        _lastActiveComorbs = ctx.activeComorbs || [];

        // Construire l'index si nécessaire
        buildIndex();
        
        // Initialiser le cache
        initMedKeyCache(ctx);
        
        // Collecter les règles candidates via l'index inversé
        const candidateIds = new Set();
        
        // Ajouter les règles globales (polypharmacie, ACB, etc.)
        (_invertedIndex['__GLOBAL__'] || []).forEach(id => candidateIds.add(id));
        
        // Pour chaque med actif, trouver les règles liées
        if (ctx._medsNormalized) {
            ctx._medsNormalized.forEach(m => {
                // Chercher par DCI directe
                for (const [indexKey, ruleIds] of Object.entries(_invertedIndex)) {
                    if (indexKey === '__GLOBAL__') continue;
                    if (m.dci.includes(indexKey) || indexKey.includes(m.dci) || 
                        m.classe.includes(indexKey) || indexKey.includes(m.classe)) {
                        ruleIds.forEach(id => candidateIds.add(id));
                    }
                }
            });
            
            // Ajouter les classes génériques (dérivées du référentiel centralisé)
            const classAliases = typeof DRUG_CLASSES !== 'undefined'
                ? Object.values(DRUG_CLASSES).flatMap(def => def.aliases)
                : ['ains','iec','ara2','betabloquant','diuretique','anticoag','antiagreg',
                   'antiagregant','antipsychotique','benzodiazepine','isrs','irsn','opioid',
                   'statine','ipp','corticoide','arni','mra','sglt2','isglt2','antihypertenseur',
                   'inhibiteurcalcique','antiepileptique','antidepresseurtricyclique'];
            
            classAliases.forEach(alias => {
                if (hasMedKeyCached(alias, ctx) && _invertedIndex[alias]) {
                    _invertedIndex[alias].forEach(id => candidateIds.add(id));
                }
            });
        }
        
        // Ajouter les règles indexées par comorbidités (via med_absent pour START)
        if (ctx.activeComorbs) {
            // Pour les règles START, on doit aussi vérifier celles indexées par les médicaments absents
            // On ajoute toutes les règles INITIER par sécurité (elles sont peu nombreuses)
            GERIA_RECOS_DB.INITIER.forEach(r => candidateIds.add(r.id));
        }
        
        // Évaluer seulement les candidats
        const resultats = { eviter: [], initier: [], supplement: [], all: [] };
        
        candidateIds.forEach(ruleId => {
            const rule = _ruleMap[ruleId];
            if (!rule) return;
            
            if (checkRuleOptimized(rule, ctx)) {
                // Enrichir avec cross-ref si disponible
                let enriched = rule;
                if (typeof enrichRuleWithCrossRef === 'function') {
                    enriched = enrichRuleWithCrossRef(rule);
                }
                
                // Calculer le score
                const score = computeAlertScore(enriched, ctx);
                const triage = getTriageLevel(score);
                
                const alert = {
                    ...enriched,
                    score: score,
                    triage: triage,
                    // Sources : utiliser les sources propres à la règle (pas les cross-ref merged)
                    sources_label: (enriched.sources || [])
                        .map(s => GERIA_RECOS_DB.SOURCES[s] ? GERIA_RECOS_DB.SOURCES[s].nom : s).join(' | ')
                };
                
                if (rule._type === 'eviter') resultats.eviter.push(alert);
                else if (rule._type === 'initier') resultats.initier.push(alert);
                else if (rule._type === 'supplement') resultats.supplement.push(alert);
                resultats.all.push(alert);
            }
        });
        
        // Trier par score décroissant
        const sortByScore = (a, b) => b.score - a.score;
        resultats.eviter.sort(sortByScore);
        resultats.initier.sort(sortByScore);
        resultats.supplement.sort(sortByScore);
        resultats.all.sort(sortByScore);
        
        const t1 = performance.now();
        
        // Calculer le dashboard global
        resultats.dashboard = computeDashboard(resultats, ctx);
        resultats._perf = {
            candidates: candidateIds.size,
            triggered: resultats.all.length,
            time_ms: Math.round((t1 - t0) * 100) / 100
        };
        
        return resultats;
    }

    // ========================================================================
    // 5. DASHBOARD PIM GLOBAL
    // ========================================================================
    
    function computeDashboard(resultats, ctx) {
        const allAlerts = resultats.all;
        const totalMeds = (ctx.activeMeds || []).length;
        
        // Compter les meds flaggés PIM
        let medsWithPIM = new Set();
        if (typeof PIM_DICT !== 'undefined' && ctx.activeMeds) {
            ctx.activeMeds.forEach(m => {
                const dci = (m.dci || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                for (const [dictKey, entry] of Object.entries(PIM_DICT)) {
                    const ndk = dictKey.replace(/[^a-z0-9]/g, '');
                    if (dci.includes(ndk) || ndk.includes(dci)) {
                        if (entry.priscus || entry.forta === 'D' || entry.forta === 'C' || entry.beers || entry.eu7pim) {
                            medsWithPIM.add(m.dci);
                        }
                        break;
                    }
                }
            });
        }
        
        // Distribution par triage
        const critiques = allAlerts.filter(a => a.triage.priority === 1);
        const importants = allAlerts.filter(a => a.triage.priority === 2);
        const informatifs = allAlerts.filter(a => a.triage.priority === 3);
        
        // Score PIM global (0-100)
        // Pondéré : ratio meds PIM, score moyen des alertes, ACB
        let globalScore = 0;
        if (totalMeds > 0) {
            const ratioMedsPIM = medsWithPIM.size / totalMeds;
            const avgAlertScore = allAlerts.length > 0 ? allAlerts.reduce((s, a) => s + a.score, 0) / allAlerts.length : 0;
            const acbPenalty = Math.min((ctx.scoreACB_global || 0) * 5, 20);
            const polyPenalty = totalMeds >= 10 ? 15 : (totalMeds >= 5 ? 8 : 0);
            
            globalScore = Math.round(
                ratioMedsPIM * 30 +          // 30% = ratio médicaments PIM
                (avgAlertScore / 100) * 30 +  // 30% = sévérité moyenne des alertes
                acbPenalty +                   // 0-20 = charge anticholinergique
                polyPenalty                    // 0-15 = polypharmacie
            );
        }
        globalScore = Math.max(0, Math.min(100, globalScore));
        
        // Catégorisation du risque global
        let globalRisk;
        if (globalScore >= 60) globalRisk = { label: 'RISQUE ÉLEVÉ', color: 'danger', icon: '🔴' };
        else if (globalScore >= 35) globalRisk = { label: 'RISQUE MODÉRÉ', color: 'warning', icon: '🟠' };
        else if (globalScore >= 15) globalRisk = { label: 'RISQUE FAIBLE', color: 'info', icon: '🔵' };
        else globalRisk = { label: 'ACCEPTABLE', color: 'success', icon: '🟢' };
        
        // Top 3 alertes critiques (pour affichage rapide)
        const top3 = critiques.slice(0, 3).map(a => ({
            titre: a.titre,
            score: a.score,
            sources: (a.all_sources || a.sources || []).length
        }));
        
        return {
            global_score: globalScore,
            global_risk: globalRisk,
            total_alerts: allAlerts.length,
            critiques: critiques.length,
            importants: importants.length,
            informatifs: informatifs.length,
            meds_total: totalMeds,
            meds_pim: medsWithPIM.size,
            meds_pim_ratio: totalMeds > 0 ? Math.round(medsWithPIM.size / totalMeds * 100) : 0,
            meds_pim_list: [...medsWithPIM],
            top3_critiques: top3,
            acb_global: ctx.scoreACB_global || 0,
            polypharmacie: totalMeds >= 5
        };
    }

    // ========================================================================
    // 6. RENDU HTML — Dashboard + alertes triées
    // ========================================================================
    
    /**
     * Génère le dashboard global en HTML
     */
    function renderDashboard(dashboard) {
        const d = dashboard;
        const riskClass = d.global_risk.color;
        
        // Jauge visuelle du score
        const gaugeColor = d.global_score >= 60 ? '#dc3545' : (d.global_score >= 35 ? '#ffc107' : (d.global_score >= 15 ? '#0dcaf0' : '#198754'));
        
        return `
        <div class="card border-${riskClass} shadow mb-3">
            <div class="card-header bg-${riskClass} ${riskClass === 'warning' ? 'text-dark' : 'text-white'}">
                <strong>${d.global_risk.icon} Score PIM Global : ${d.global_score}/100 — ${d.global_risk.label}</strong>
            </div>
            <div class="card-body p-2">
                <!-- Jauge -->
                <div class="progress mb-2" style="height: 12px;">
                    <div class="progress-bar" role="progressbar" style="width: ${d.global_score}%; background-color: ${gaugeColor};" 
                         aria-valuenow="${d.global_score}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                
                <!-- Métriques clés -->
                <div class="row text-center g-1 mb-2">
                    <div class="col-3">
                        <div class="border rounded p-1">
                            <div class="fw-bold text-danger" style="font-size:1.4em;">${d.critiques}</div>
                            <small class="text-muted">🔴 Critiques</small>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="border rounded p-1">
                            <div class="fw-bold text-warning" style="font-size:1.4em;">${d.importants}</div>
                            <small class="text-muted">🟠 Importants</small>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="border rounded p-1">
                            <div class="fw-bold text-info" style="font-size:1.4em;">${d.informatifs}</div>
                            <small class="text-muted">🔵 Informatifs</small>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="border rounded p-1">
                            <div class="fw-bold text-dark" style="font-size:1.4em;">${d.meds_pim}/${d.meds_total}</div>
                            <small class="text-muted">💊 Meds PIM</small>
                        </div>
                    </div>
                </div>
                
                ${d.meds_pim > 0 ? `<div class="small text-muted mb-1">
                    <strong>${d.meds_pim_ratio}%</strong> de l'ordonnance classée PIM : 
                    <em>${d.meds_pim_list.join(', ')}</em>
                </div>` : ''}
                
                ${d.top3_critiques.length > 0 ? `
                <div class="mt-1">
                    <strong class="text-danger small">⚡ Priorités absolues :</strong>
                    ${d.top3_critiques.map((t, i) => `<div class="small"><span class="badge bg-danger">${t.score}</span> ${t.titre} <span class="text-muted">(${t.sources} sources)</span></div>`).join('')}
                </div>` : ''}
            </div>
        </div>`;
    }
    
    /**
     * Génère le HTML des alertes EVITER, triées et scorées.
     * Affiche d'abord les critiques, puis importants, puis informatifs.
     * Les informatifs sont en accordéon repliable.
     */
    function renderAlertesTriees(alertes, type) {
        if (!alertes || alertes.length === 0) {
            return `<div class="alert alert-light">Aucune ${type === 'eviter' ? 'prescription inappropriée' : 'omission thérapeutique'} détectée.</div>`;
        }
        
        // Dédupliquer si cross-ref disponible
        let deduped = alertes;
        if (typeof deduplicateAlerts === 'function') {
            deduped = deduplicateAlerts(alertes);
        }
        
        const critiques = deduped.filter(a => a.triage && a.triage.priority === 1);
        const importants = deduped.filter(a => a.triage && a.triage.priority === 2);
        const informatifs = deduped.filter(a => a.triage && a.triage.priority === 3);
        
        let html = '';
        
        // CRITIQUES — toujours visibles, fond rouge prononcé
        if (critiques.length > 0) {
            html += `<div class="mb-2"><strong class="text-danger">🔴 Action immédiate (${critiques.length})</strong></div>`;
            html += critiques.map(a => renderSingleAlert(a)).join('');
        }
        
        // IMPORTANTS — toujours visibles, fond orange
        if (importants.length > 0) {
            html += `<div class="mb-2 mt-3"><strong class="text-warning">🟠 Réévaluation planifiée (${importants.length})</strong></div>`;
            html += importants.map(a => renderSingleAlert(a)).join('');
        }
        
        // INFORMATIFS — repliables par défaut.
        // Fallback vanilla JS + ARIA. ATTENTION : ne PAS utiliser data-bs-toggle/target
        // en plus de l'onclick — provoque un double-toggle (le bouton reste fermé).
        if (informatifs.length > 0) {
            const collapseId = `collapse_${type}_info_${Math.random().toString(36).substr(2,5)}`;
            const labelClosed = `🔵 Informatifs (${informatifs.length}) — cliquer pour voir ▾`;
            const labelOpen = `🔵 Informatifs (${informatifs.length}) — masquer ▴`;
            const toggleJs = `(function(btn){var c=document.getElementById('${collapseId}');if(!c)return;var hidden=c.style.display==='none'||c.style.display==='';c.style.display=hidden?'block':'none';btn.setAttribute('aria-expanded',hidden?'true':'false');btn.innerHTML=hidden?'${labelOpen}':'${labelClosed}';})(this);return false;`;
            html += `
            <div class="mb-2 mt-3">
                <button type="button" class="btn btn-link text-info text-decoration-none p-1" aria-expanded="false"
                   style="cursor:pointer;"
                   onclick="${toggleJs.replace(/"/g,'&quot;')}">
                    ${labelClosed}
                </button>
            </div>
            <div id="${collapseId}" style="display:none;">
                ${informatifs.map(a => renderSingleAlert(a)).join('')}
            </div>`;
        }
        
        return html;
    }
    
    /**
     * Registre des classes EBM canoniques.
     * Phase 5 : on n'a pas réécrit les 189 clés texte de PATHOLOGY_RULES_DB.SOURCES_EBM
     * (au profit de la lisibilité éditoriale), mais on normalise les clés ET les med_keys
     * vers un code de classe canonique avant matching, pour éliminer les disparités
     * synonymes/casse/pluriel ("AOD" vs "DOAC", "Statine" vs "Statines", "BZD" vs
     * "Benzodiazépines", etc.). Étendre ici pour couvrir de nouveaux synonymes.
     */
    const EBM_CLASS_REGISTRY = {
        CLS_IEC:           ['iec', 'inhibiteurs ec', 'ieca', 'enalapril', 'lisinopril', 'ramipril', 'perindopril', 'captopril', 'quinapril', 'benazepril', 'fosinopril', 'trandolapril'],
        CLS_ARA2:          ['ara2', 'ara ii', 'sartan', 'sartans', 'losartan', 'valsartan', 'irbesartan', 'candesartan', 'telmisartan', 'olmesartan'],
        CLS_IECARA2:       ['iec/ara2', 'iec ara2', 'iec + ara2', 'rasi'],
        CLS_BB:            ['bb', 'bêtabloquant', 'bêtabloquants', 'betabloquant', 'betabloquants', 'beta bloquant'],
        CLS_BB_NS:         ['bb non sélectifs', 'bb non sélectif', 'propranolol', 'sotalol', 'nadolol'],
        CLS_DIURETIQUE_ANSE: ['diurétique de l\'anse', 'diurétiques de l\'anse', 'furosemide', 'bumetanide', 'torasemide'],
        CLS_DIURETIQUE_THIAZIDIQUE: ['thiazidique', 'thiazidiques', 'hydrochlorothiazide', 'indapamide', 'chlortalidone'],
        CLS_DIURETIQUE:    ['diurétique', 'diurétiques', 'diuretique', 'diuretiques'],
        CLS_ARM:           ['arm', 'armi', 'spironolactone', 'eplerenone', 'antialdosterone', 'finerenone'],
        CLS_FINERENONE:    ['finerenone', 'finérénone'],
        CLS_AOD:           ['aod', 'doac', 'anticoagulants oraux directs', 'apixaban', 'rivaroxaban', 'edoxaban', 'dabigatran'],
        CLS_AVK:           ['avk', 'warfarine', 'acenocoumarol', 'fluindione'],
        CLS_ANTICOAGULANT: ['anticoagulant', 'anticoagulants', 'anticoagulation', 'hbpm relais avk', 'hbpm'],
        CLS_AAP:           ['antiagrégant', 'antiagrégants', 'aspirine', 'clopidogrel', 'ticagrelor', 'prasugrel', 'aspirine faible dose'],
        CLS_DAPT:          ['dapt', 'dapt courte', 'bithérapie', 'monothérapie antiagrégante'],
        CLS_AINS:          ['ains', 'ibuprofene', 'naproxene', 'diclofenac', 'ketoprofene', 'celecoxib', 'meloxicam'],
        CLS_BZD:           ['bzd', 'benzodiazépines', 'benzodiazepines', 'bzd et apparentés', 'bzd/opioïdes', 'diazepam', 'lorazepam', 'oxazepam', 'midazolam', 'alprazolam', 'bromazepam', 'clonazepam'],
        CLS_ZDRUGS:        ['zopiclone', 'zolpidem', 'eszopiclone'],
        CLS_OPIOIDES:      ['opioïdes', 'opioides', 'morphine', 'oxycodone', 'fentanyl', 'tramadol', 'codeine', 'hydromorphone'],
        CLS_ISRS:          ['isrs', 'ssri', 'citalopram', 'escitalopram', 'fluoxetine', 'sertraline', 'paroxetine', 'fluvoxamine'],
        CLS_IRSN:          ['irsn', 'snri', 'duloxetine', 'venlafaxine', 'milnacipran'],
        CLS_TCA:           ['tricycliques', 'tricyclique', 'tca', 'amitriptyline', 'clomipramine', 'imipramine', 'nortriptyline'],
        CLS_ANTIDEP:       ['antidépresseurs', 'antidepresseurs', 'antidépresseur sérotoninergique', 'antidépresseurs sérotoninergiques', 'mirtazapine'],
        CLS_ANTIPSY:       ['antipsychotiques', 'antipsychotique', 'neuroleptiques', 'neuroleptique', 'haloperidol', 'rispéridone', 'risperidone', 'olanzapine', 'quetiapine', 'aripiprazole', 'clozapine', 'antipsychotiques typiques', 'antipsychotiques atypiques à faible dose'],
        CLS_ANTICHOL:      ['anticholinergiques', 'anticholinergique', 'oxybutynine', 'solifenacine', 'trospium', 'tolterodine', 'fesoterodine', 'darifenacin'],
        CLS_ANTI_H1:       ['antihistaminiques h1', 'antihistaminique h1', 'hydroxyzine', 'doxylamine', 'cetirizine'],
        CLS_STATINE:       ['statine', 'statines', 'atorvastatine', 'rosuvastatine', 'simvastatine', 'pravastatine', 'fluvastatine'],
        CLS_FIBRATE:       ['fibrate', 'fibrates', 'gemfibrozil', 'fenofibrate'],
        CLS_EZETIMIBE:     ['ézétimibe', 'ezetimibe'],
        CLS_PCSK9:         ['anti-pcsk9', 'pcsk9', 'evolocumab', 'alirocumab'],
        CLS_BEMPEDOIQUE:   ['bempédoïque', 'bempedoique'],
        CLS_METFORMINE:    ['metformine', 'metformin'],
        CLS_ISGLT2:        ['isglt2', 'sglt2', 'dapagliflozine', 'empagliflozine', 'canagliflozine', 'ertugliflozine'],
        CLS_GLP1:          ['glp-1', 'glp1', 'glp-1 ra', 'liraglutide', 'semaglutide', 'sémaglutide', 'dulaglutide', 'exenatide'],
        CLS_DPP4:          ['dpp-4', 'dpp4', 'sitagliptine', 'vildagliptine', 'linagliptine', 'saxagliptine', 'alogliptine'],
        CLS_SULFAMIDE:     ['sulfamides', 'sulfamide', 'sulfamides hypoglycémiants', 'sulfamides / glinides', 'glimepiride', 'gliclazide', 'glibenclamide', 'glipizide'],
        CLS_GLINIDE:       ['glinides', 'glinide', 'repaglinide'],
        CLS_PIOGLITAZONE:  ['pioglitazone', 'thiazolidinedione'],
        CLS_INSULINE:      ['insuline', 'insulin', 'insuline basale', 'insuline basale-bolus', 'glargine', 'detemir', 'degludec', 'aspart', 'lispro'],
        CLS_DIGOXINE:      ['digoxine', 'digoxin'],
        CLS_AMIODARONE:    ['amiodarone'],
        CLS_DRONEDARONE:   ['dronedarone', 'dronédarone'],
        CLS_VERAPAMIL:     ['verapamil', 'vérapamil', 'verapamil/diltiazem'],
        CLS_DILTIAZEM:     ['diltiazem'],
        CLS_IVABRADINE:    ['ivabradine'],
        CLS_VERICIGUAT:    ['vericiguat'],
        CLS_HYDRALAZINE:   ['hydralazine'],
        CLS_NITRES:        ['isosorbide', 'nitré', 'nitrés', 'dérivés nitrés'],
        CLS_IPP:           ['ipp', 'omeprazole', 'esomeprazole', 'lansoprazole', 'pantoprazole', 'rabeprazole', 'ipp long cours'],
        CLS_ARH2:          ['anti-h2', 'ranitidine', 'famotidine', 'cimetidine'],
        CLS_LAXATIF:       ['lactulose', 'macrogol', 'sennosides', 'bisacodyl'],
        CLS_BISPHOSPHONATE:['bisphosphonates', 'bisphosphonate', 'alendronate', 'risedronate', 'zoledronique', 'ibandronate'],
        CLS_DENOSUMAB:     ['dénosumab', 'denosumab'],
        CLS_TERIPARATIDE:  ['tériparatide', 'teriparatide'],
        CLS_VITAMINE_D:    ['vitamine d', 'cholecalciferol', 'calciferol'],
        CLS_CORTICOIDE:    ['corticoïdes', 'corticoides', 'corticoïde', 'corticoide', 'prednisone', 'prednisolone', 'methylprednisolone', 'dexamethasone'],
        CLS_IMMUNOTHERAPIE:['immunothérapie', 'immunotherapie', 'methotrexate', 'azathioprine', 'leflunomide'],
        CLS_COLCHICINE:    ['colchicine'],
        CLS_ALLOPURINOL:   ['allopurinol'],
        CLS_FEBUXOSTAT:    ['febuxostat', 'fébuxostat'],
        CLS_ALPHABLOQ:     ['alpha-bloquants', 'alpha bloquant', 'alphabloquant', 'tamsulosine', 'alfuzosine', 'doxazosine'],
        CLS_MIRABEGRON:    ['mirabégron', 'mirabegron'],
        CLS_OXYBUTYNINE:   ['oxybutynine', 'oxybutynin'],
        CLS_LEVOTHYROXINE: ['lévothyroxine', 'levothyroxine', 'lt4'],
        CLS_THIAMAZOLE:    ['thiamazole', 'carbimazole'],
        CLS_PTU:           ['ptu', 'propylthiouracile'],
        CLS_LEVODOPA:      ['lévodopa', 'levodopa', 'l-dopa'],
        CLS_AGONISTE_DA:   ['agonistes da', 'pramipexole', 'ropinirole', 'rotigotine'],
        CLS_IMAOB:         ['imao-b', 'rasagiline', 'sélégiline', 'selegiline', 'safinamide'],
        CLS_IMAO:          ['imao', 'iproniazide', 'moclobemide', 'imao-b+péthidine'],
        CLS_ICOMT:         ['icomt', 'entacapone', 'tolcapone', 'opicapone'],
        CLS_IACHE:         ['iache', 'inhibiteurs cholinestérase', 'donépézil', 'donepezil', 'rivastigmine', 'galantamine'],
        CLS_MEMANTINE:     ['mémantine', 'memantine'],
        CLS_ANTIEPILEPTIQUE:['valproate', 'phénytoïne', 'phenytoin', 'carbamazépine', 'carbamazepine', 'lamotrigine', 'lévétiracétam', 'levetiracetam', 'lacosamide', 'phénobarbital', 'phenobarbital', 'gabapentine', 'gabapentin'],
        CLS_LITHIUM:       ['lithium'],
        CLS_MELATONINE:    ['mélatonine', 'melatonine'],
        CLS_FLUOROQUINOLONE:['fluoroquinolone', 'ciprofloxacine', 'lévofloxacine', 'levofloxacine', 'moxifloxacine', 'ofloxacine', 'fq 1ère intention'],
        CLS_MACROLIDE:     ['macrolides', 'azithromycine', 'clarithromycine', 'erythromycine'],
        CLS_AMINOSIDE:     ['aminosides', 'gentamicine', 'amikacine', 'tobramycine'],
        CLS_FOSFOMYCINE:   ['fosfomycine'],
        CLS_NITROFURANTOINE:['nitrofurantoïne', 'nitrofurantoine'],
        CLS_CSI:           ['csi', 'csi seul', 'csi-formoterol', 'corticostéroïde inhalé'],
        CLS_LAMA:          ['lama', 'lama inhalés', 'tiotropium', 'umeclidinium', 'glycopyrronium'],
        CLS_LABA:          ['laba', 'salmeterol', 'formoterol', 'indacaterol'],
        CLS_SABA:          ['saba', 'saba seul', 'salbutamol', 'terbutaline'],
        CLS_MIDODRINE:     ['midodrine'],
        CLS_FLUDROCORTISONE:['fludrocortisone'],
        CLS_BETAHISTINE:   ['bétahistine', 'betahistine'],
        CLS_FER_IV:        ['fer iv', 'carboxymaltose ferrique', 'fer injectable'],
        CLS_RIFAXIMINE:    ['rifaximine'],
        CLS_ECT:           ['ect', 'électroconvulsivothérapie'],
        CLS_TCC:           ['tcc', 'tcc-i', 'thérapie cognitivo-comportementale'],
    };

    // Cache : pré-calcule la map normalisée terme → code de classe (au premier appel).
    let _ebmTermToCode = null;
    function _buildEbmTermIndex() {
        if (_ebmTermToCode) return _ebmTermToCode;
        _ebmTermToCode = new Map();
        const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
        for (const [code, terms] of Object.entries(EBM_CLASS_REGISTRY)) {
            for (const t of terms) {
                const k = norm(t);
                if (k) _ebmTermToCode.set(k, code);
            }
        }
        return _ebmTermToCode;
    }
    function _resolveEbmCode(term) {
        const idx = _buildEbmTermIndex();
        const norm = String(term||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
        if (!norm) return null;
        if (idx.has(norm)) return idx.get(norm);
        // Fallback : recherche par préfixe (ex. "iec/ara2" → CLS_IECARA2 si présent ; sinon CLS_IEC ou CLS_ARA2)
        for (const [k, code] of idx) {
            if (k.length >= 4 && (norm.includes(k) || k.includes(norm))) return code;
        }
        return null;
    }

    /**
     * Recherche la source EBM spécifique (société savante / essai clinique)
     * dans PATHOLOGY_RULES_DB pour enrichir l'affichage au-delà du simple "STOPP/START".
     */
    function findEbmSource(alert) {
        if (typeof PATHOLOGY_RULES_DB === 'undefined' || !_lastActiveComorbs || _lastActiveComorbs.length === 0) return '';
        const c = alert.condition;
        if (!c) return '';

        // Collecter TOUS les termes de l'alerte (med_keys pour EVITER, med_absent pour INITIER, + titre)
        const medKeys = [...(c.med_keys || []), ...(c.med_keys_2 || []), ...(c.med_absent || [])];
        const titleTerms = (alert.titre || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 3);

        // Identifier les pathologies ciblées par cette règle
        const targetPathos = [...(c.comorbs || []), ...(c.comorbs_any || [])];

        // ⚠ Règle pathologie-agnostique (pas de comorbs ciblés)
        // → ne pas chercher dans les SOURCES_EBM des pathologies actives
        // (sinon ESC/GOLD/KDIGO fuitent sur des alertes sans lien, ex : anticholinergiques + HFrEF).
        if (targetPathos.length === 0) return '';

        const pathosToSearch = targetPathos.filter(p => _lastActiveComorbs.includes(p));
        if (pathosToSearch.length === 0) return '';

        const category = alert._type === 'initier' ? 'INITIER' : 'EVITER';
        let found = [];

        pathosToSearch.forEach(pathoId => {
            const rule = PATHOLOGY_RULES_DB[pathoId];
            if (!rule) return;

            // Chercher dans SOURCES_EBM si disponible.
            // Phase 5 : matching par code de classe canonique (EBM_CLASS_REGISTRY) pour éviter
            // les disparités synonymes/casse/pluriel. Fallback substring conservé si la clé
            // texte n'est pas (encore) cataloguée dans le registre.
            if (rule.SOURCES_EBM && rule.SOURCES_EBM[category] && medKeys.length > 0) {
                const ebmCat = rule.SOURCES_EBM[category];
                // Pré-résoudre chaque medKey vers son code de classe (peut être null).
                const medCodes = medKeys.map(mk => ({ mk, code: _resolveEbmCode(mk) }));

                for (const [classKey, ref] of Object.entries(ebmCat)) {
                    const keyCode = _resolveEbmCode(classKey);
                    let matched = false;

                    if (keyCode) {
                        // Match canonique par code de classe.
                        matched = medCodes.some(({ code }) => code && code === keyCode);
                    }

                    if (!matched) {
                        // Fallback legacy substring (clé/medKey hors registre).
                        const cleanKey = classKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                        matched = medKeys.some(mk => {
                            const cleanMk = mk.toLowerCase().replace(/[^a-z0-9]/g, '');
                            return cleanMk && cleanKey && (cleanMk.includes(cleanKey) || cleanKey.includes(cleanMk));
                        });
                    }

                    if (matched && found.length === 0) found.push(ref);
                }
            }

            // Fallback: référence générale de la pathologie, uniquement si la règle cible
            // explicitement cette pathologie ET porte sur des médicaments (med_keys/med_absent).
            if (found.length === 0 && rule.REFERENCE && medKeys.length > 0) {
                found.push(rule.REFERENCE.split('|')[0].trim());
            }
        });

        return found.length > 0 ? found[0] : '';
    }

    function renderSingleAlert(a) {
        const triage = a.triage || getTriageLevel(a.score || 0);
        const borderClass = triage.priority === 1 ? 'danger' : (triage.priority === 2 ? 'warning' : 'info');
        const bgOpacity = triage.priority === 1 ? 'bg-danger bg-opacity-10' : '';

        // Badge de score
        const scoreBadge = a.score != null ?
            `<span class="badge bg-${borderClass} me-1" title="Score de priorité">${a.score}</span>` : '';

        // Badges PIM par molécule
        let pimBadges = '';
        if (a.pim_dict_keys && typeof renderPimBadges === 'function') {
            pimBadges = a.pim_dict_keys
                .filter(k => typeof activeMeds !== 'undefined' && activeMeds.some(m => m.dci && m.dci.toLowerCase().includes(k)))
                .map(d => renderPimBadges(d)).join('');
        }

        let compHtml = '';
        if (a.complementary_messages && a.complementary_messages.length > 0) {
            compHtml = `<ul class="mb-1 ps-3 mt-1" style="font-size:0.88em;">${a.complementary_messages.map(m => `<li>${m}</li>`).join('')}</ul>`;
        }

        // Enrichir avec la source EBM spécifique (société savante / essai clinique).
        // Pour les INITIER (omissions) : la source pertinente est le guideline EBM (ESC, GOLD, KDIGO…),
        // pas l'outil de screening (STOPP/START, FORTA). On remplace sources_label par l'EBM source.
        // Pour les EVITER : on garde sources_label (l'outil PIM EST la source) + badge EBM complémentaire.
        const ebmSource = findEbmSource(a);
        let displaySourceLabel = a.sources_label || '';
        let ebmBadge = '';
        if (ebmSource) {
            if (a._type === 'initier') {
                // Omission : le guideline EBM remplace STOPP/START dans le header
                displaySourceLabel = ebmSource;
            } else {
                // EVITER : badge EBM secondaire sauf si déjà affiché dans le header
                const srcLabelLc = String(a.sources_label || '').toLowerCase();
                const ebmSrcLc = ebmSource.toLowerCase();
                const alreadyShown = a.merged_count > 1 || (srcLabelLc.includes(ebmSrcLc.substring(0, 10)) || ebmSrcLc.includes(srcLabelLc.substring(0, 10)));
                if (!alreadyShown) {
                    ebmBadge = `<br><span class="badge" style="font-size:0.6em; background-color:#6f42c1;" title="${ebmSource}">${ebmSource.length > 60 ? ebmSource.substring(0,60)+'...' : ebmSource}</span>`;
                }
            }
        }

        const esc = typeof escapeHtml === 'function' ? escapeHtml : s => String(s||'');
        // Titre amélioré pour les recommandations groupées (multi-thérapie)
        // On calque sur le format INITIER : titre générique (cross_ref_theme)
        // + badge "N critères fusionnés", sans bullet redondante avec la classe.
        let displayTitle = esc(a.titre);
        let mergedBadge = '';
        if (a.merged_count > 1) {
            const genericTitle = a.cross_ref_theme || `Multi-thérapie — ${a.merged_count} traitements recommandés`;
            displayTitle = `${triage.icon} ${esc(genericTitle)}`;
            mergedBadge = ` <span class="badge bg-primary" style="font-size:0.65em;">${a.merged_count} critères fusionnés</span>`;
        } else {
            displayTitle = `${triage.icon} ${displayTitle}`;
        }
        // Fallback : si aucun message, on affiche au moins le ref_code et l'indication minimale.
        // Évite que l'utilisateur voie un titre STOPP sans détail.
        const safeMessage = (a.message && String(a.message).trim() !== '')
            ? a.message
            : (a.ref_code
                ? `<em>Critère ${esc(a.ref_code)} — détail non documenté dans la base.</em>`
                : '<em>Détail clinique non documenté.</em>');
        return `<div class="alert alert-${borderClass} ${bgOpacity} shadow-sm mb-2" style="border-left: 4px solid var(--bs-${borderClass}); padding-left: 0.9rem;">
            ${scoreBadge}<strong>${displayTitle}</strong>${mergedBadge}
            <span class="badge bg-secondary float-end" style="font-size:0.65em;">${esc(displaySourceLabel)}</span>
            <div class="small mt-1" style="padding-left: 0.25rem;">${safeMessage}</div>
            ${compHtml}
            ${pimBadges}
            ${ebmBadge}
            ${a.alternatives ? `<div class="text-success small mt-1" style="padding-left: 0.25rem;"><em>${a.alternatives}</em></div>` : ''}
        </div>`;
    }

    // ========================================================================
    // API PUBLIQUE
    // ========================================================================
    
    return {
        buildIndex,
        evaluer,
        computeAlertScore,
        getTriageLevel,
        renderDashboard,
        renderAlertesTriees,
        
        // Accès aux stats internes (debug)
        getIndexStats: () => ({
            indexKeys: _invertedIndex ? Object.keys(_invertedIndex).length : 0,
            totalRules: _ruleMap ? Object.keys(_ruleMap).length : 0,
            cacheHits: _medKeyCache ? Object.keys(_medKeyCache).length : 0
        })
    };
    
})();

// ============================================================================
// 🔌 INTÉGRATION DANS app_analysis.js
// ============================================================================
// 
// Dans analyserPrescription(), remplacer :
//
//   const recos = evaluerRecommandations({...});
//   document.getElementById('alertes-eviter').innerHTML += renderAlertesEviter(recos.eviter);
//   document.getElementById('alertes-initier').innerHTML += renderAlertesInitier(recos.initier);
//
// Par :
//
//   const recos = GeriaEngineV2.evaluer({
//       activeMeds, activeComorbs, bioValues,
//       patientAge, isFragile, scoreACB_global
//   });
//
//   // Dashboard global en tête
//   document.getElementById('alertes-scores').innerHTML += GeriaEngineV2.renderDashboard(recos.dashboard);
//
//   // Alertes triées par priorité
//   document.getElementById('alertes-eviter').innerHTML = GeriaEngineV2.renderAlertesTriees(recos.eviter, 'eviter');
//   document.getElementById('alertes-initier').innerHTML = GeriaEngineV2.renderAlertesTriees(recos.initier, 'initier');
//
//   // Stats performance (console)
//   console.log(`[PIM] ${recos._perf.candidates} candidats → ${recos._perf.triggered} alertes en ${recos._perf.time_ms}ms`);
//
