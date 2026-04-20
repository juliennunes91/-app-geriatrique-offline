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
        if (alert.condition && alert.condition.bio && ctx.bioValues) {
            let bioConfirmed = false;
            for (const [bioId, crit] of Object.entries(alert.condition.bio)) {
                const val = ctx.bioValues[bioId];
                if (val > 0) {
                    if (crit.op === '<' && val < crit.val) bioConfirmed = true;
                    if (crit.op === '>' && val > crit.val) bioConfirmed = true;
                }
            }
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

        if (c.bio) {
            for (const [bioId, crit] of Object.entries(c.bio)) {
                const val = ctx.bioValues && ctx.bioValues[bioId];
                if (!val || val <= 0) {
                    // Bio requise mais non renseignée
                    // Pour les règles INITIER (omissions), on NE bloque PAS : la bio conditionnelle
                    // est remontée en caveat dans le message. Pour les règles EVITER, on reste prudent
                    // et on ne déclenche pas (évite les faux positifs danger sans donnée).
                    if (rule._type === 'initier') {
                        continue;
                    }
                    return false;
                }
                if (crit.op === '<' && !(val < crit.val)) return false;
                if (crit.op === '>' && !(val > crit.val)) return false;
                if (crit.op === '<=' && !(val <= crit.val)) return false;
                if (crit.op === '>=' && !(val >= crit.val)) return false;
            }
        }

        if (c.age_min && (!ctx.patientAge || ctx.patientAge < c.age_min)) return false;
        if (c.fragile === true && !ctx.isFragile) return false;
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
        if (c.polypharmacie && c.seuil && (!ctx.activeMeds || ctx.activeMeds.length < c.seuil)) return false;

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
        // Fallback vanilla JS + ARIA (n'impose pas Bootstrap JS).
        if (informatifs.length > 0) {
            const collapseId = `collapse_${type}_info_${Math.random().toString(36).substr(2,5)}`;
            const toggleJs = `(function(btn){var c=document.getElementById('${collapseId}');if(!c)return;var open=c.classList.toggle('show');c.style.display=open?'':'none';btn.setAttribute('aria-expanded',open?'true':'false');btn.innerHTML=open?'🔵 Informatifs (${informatifs.length}) — masquer ▴':'🔵 Informatifs (${informatifs.length}) — cliquer pour voir ▾';})(this);return false;`;
            html += `
            <div class="mb-2 mt-3">
                <a href="#${collapseId}" class="text-info text-decoration-none" role="button" aria-expanded="false"
                   style="cursor:pointer; display:inline-block; padding:4px 0;"
                   onclick="${toggleJs.replace(/"/g,'&quot;')}"
                   data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                    🔵 Informatifs (${informatifs.length}) — cliquer pour voir ▾
                </a>
            </div>
            <div class="collapse" id="${collapseId}" style="display:none;">
                ${informatifs.map(a => renderSingleAlert(a)).join('')}
            </div>`;
        }
        
        return html;
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

            // Chercher dans SOURCES_EBM si disponible
            if (rule.SOURCES_EBM && rule.SOURCES_EBM[category] && (medKeys.length > 0 || titleTerms.length > 0)) {
                const ebmCat = rule.SOURCES_EBM[category];
                for (const [classKey, ref] of Object.entries(ebmCat)) {
                    const cleanKey = classKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                    // Match strict : on exige un recouvrement sur med_keys (classe pharmaco).
                    // Le match sur titleTerms est trop permissif (ex: "anticholinergique" matchait ESC).
                    const matched = medKeys.some(mk => {
                        const cleanMk = mk.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return cleanMk && cleanKey && (cleanMk.includes(cleanKey) || cleanKey.includes(cleanMk));
                    });

                    if (matched) {
                        if (found.length === 0) found.push(ref);
                    }
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
        return `<div class="alert alert-${borderClass} ${bgOpacity} shadow-sm mb-2" style="border-left: 4px solid var(--bs-${borderClass}); padding-left: 0.9rem;">
            ${scoreBadge}<strong>${displayTitle}</strong>${mergedBadge}
            <span class="badge bg-secondary float-end" style="font-size:0.65em;">${esc(displaySourceLabel)}</span>
            <div class="small mt-1" style="padding-left: 0.25rem;">${a.message}</div>
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
