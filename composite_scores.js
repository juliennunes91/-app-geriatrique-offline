// ═══════════════════════════════════════════════════════════════════════════════
// 🧮 COMPOSITE_SCORES — Module de calcul des scores cliniques composites
// ═══════════════════════════════════════════════════════════════════════════════
// Date    : 2026-05
// Auteur  : GeriaAssist — Module Scores Expérimentaux
// But     : Calculer les scores cumulés à partir d'une ordonnance
//
// SCORES DISPONIBLES :
//   ACB    — Anticholinergic Burden (Boustani 2008, Salahudeen 2015)
//   CIA    — Charge anticholinergique générale
//   QT     — Charge QTc cumulée (CredibleMeds-like : RE/KR/PR/CR)
//   SERO   — Score sérotoninergique
//   SAIGN  — Score saignement (HAS-BLED inspirée)
//   CHUTE  — Score chutes médicamenteuses (Hartikainen 2007)
//   SEDAT  — Charge sédative cumulée (Drug Burden Index)
//   HYPOG  — Risque hypoglycémie
//
// CHAQUE SCORE INDIVIDUEL : 0 (rien) / 1 (faible) / 2 (modéré) / 3 (élevé)
// ═══════════════════════════════════════════════════════════════════════════════

const SCORE_DEFINITIONS = {
    acb: {
        label: 'ACB — Anticholinergic Burden',
        description: 'Charge anticholinergique cumulée (Boustani 2008). Cible : < 3 chez âgé fragile (Coupland JAMA Int Med 2019 — démence ↑ x2-3 si charge ≥ 3 chronique).',
        thresholds: { low: 1, moderate: 2, high: 3 },
        units: 'points',
        sources: ['Boustani 2008 ARS', 'Salahudeen 2015 (méta-analyse)', 'Coupland JAMA Int Med 2019']
    },
    cia: {
        label: 'CIA — Charge Inhibiteurs Anticholinergiques (étendue)',
        description: 'Variante interne intégrant des molécules au passage BHE limité (ammoniums quaternaires inclus). Pour comparaison avec ACB strict.',
        thresholds: { low: 1, moderate: 2, high: 3 },
        units: 'points',
        sources: ['Adaptation interne']
    },
    qt: {
        label: 'QTc — Charge QT cumulée',
        description: 'Score basé sur classification CredibleMeds (Risque Établi/Connu/Possible/Conditionnel). Si cumul ≥ 2 médicaments QT-prolongateurs : ECG baseline + ions (K+/Mg) + monitoring.',
        thresholds: { low: 1, moderate: 3, high: 5 },
        units: 'points',
        sources: ['CredibleMeds.org', 'ESC 2020 QT', 'AHA/ACC 2017 ECG']
    },
    sero: {
        label: 'Score sérotoninergique',
        description: 'Score basé sur potentiel sérotoninergique. Cumul ≥ 2 médicaments modérés ou tout fort (linezolide, IMAO, tramadol) = risque syndrome sérotoninergique (Sternbach/Hunter).',
        thresholds: { low: 1, moderate: 2, high: 3 },
        units: 'points',
        sources: ['Sternbach 1991', 'Hunter Criteria 2003', 'FDA 2006/2019 alertes triptans/opioïdes']
    },
    saign: {
        label: 'Score saignement',
        description: 'Score cumulé inspiré HAS-BLED. Anticoagulants (3 pts), antiagrégants (2 pts), AINS/ISRS/corticoïdes (1 pt). Cumul ≥ 4 = haut risque hémorragique → réévaluation indication.',
        thresholds: { low: 2, moderate: 4, high: 6 },
        units: 'points',
        sources: ['Pisters HAS-BLED 2010', 'Lip 2011 (validation)', 'ESC AF 2024']
    },
    chute: {
        label: 'Score chutes médicamenteuses',
        description: 'Score basé Hartikainen 2007 + FRAT. BZD/antipsychotiques/opioïdes forts (3 pts), antidép. sédatifs/α-bloquants/antihistaminiques 1ère gén (2 pts), antiHTA/diurétiques/anti-épileptiques modernes (1 pt). Cumul ≥ 3 = haut risque chute.',
        thresholds: { low: 2, moderate: 3, high: 5 },
        units: 'points',
        sources: ['Hartikainen 2007 J Gerontol', 'Park 2015 Drugs Aging', 'STOPP/START v3 K1']
    },
    sedat: {
        label: 'Charge sédative cumulée (DBI)',
        description: 'Drug Burden Index — Hilmer 2007. BZD/opioïdes forts (3 pts), antihistaminiques 1ère gén + antipsychotiques sédatifs (2 pts), gabapentinoïdes/myorelaxants/tramadol (1 pt).',
        thresholds: { low: 1, moderate: 2, high: 4 },
        units: 'points',
        sources: ['Hilmer 2007 Arch Intern Med', 'Faure 2018 BMC Geriatr']
    },
    hypoG: {
        label: 'Risque hypoglycémie',
        description: 'Insulines + sulfamides demi-vie longue (glibenclamide/glimépiride) = 3 pts. Sulfamides courts/glinides = 2 pts. Cumul ≥ 3 = risque hypoglycémie sévère chez âgé.',
        thresholds: { low: 1, moderate: 2, high: 3 },
        units: 'points',
        sources: ['ADA 2025', 'HAS DT2 2023', 'Beers 2023 (glibenclamide PIM)']
    }
};

/**
 * Calcule les scores cumulés à partir d'une ordonnance.
 * @param {Array<Object>} prescription - tableau de médicaments (objets DB)
 * @param {Object} [bio] - valeurs biologiques optionnelles (INR, Hb, plaq, DFG)
 *                         utilisées pour potentialiser certains scores composites.
 * @returns {Object} - scores par catégorie + médicaments contributeurs
 */
function calculateCompositeScores(prescription, bio) {
    const results = {};

    Object.keys(SCORE_DEFINITIONS).forEach(scoreKey => {
        results[scoreKey] = {
            total: 0,
            contributors: [],  // [{dci, points}]
            level: 'none'
        };
    });

    prescription.forEach(med => {
        if (!med) return;
        const scores = med.scores || {};
        // Fallback: si pas de tag scores, calculer depuis acb/cia
        if (med.acb !== undefined) {
            const acbVal = Number(med.acb) || 0;
            if (acbVal > 0) {
                results.acb.total += acbVal;
                results.acb.contributors.push({ dci: med.dci, points: acbVal });
            }
        }
        if (med.cia !== undefined) {
            const ciaVal = Number(med.cia) || 0;
            if (ciaVal > 0) {
                results.cia.total += ciaVal;
                results.cia.contributors.push({ dci: med.dci, points: ciaVal });
            }
        }
        ['qt','sero','saign','chute','sedat','hypoG'].forEach(k => {
            const v = Number(scores[k]) || 0;
            if (v > 0) {
                results[k].total += v;
                results[k].contributors.push({ dci: med.dci, points: v });
            }
        });
    });

    // Bio booster : INR sur-thérapeutique + Hb basse + plaq basse → score saignement
    // Ceci capture le risque hémorragique LIÉ À LA SITUATION BIOLOGIQUE actuelle,
    // pas seulement à la combinaison médicamenteuse (cf P04 : Warfarine+Amio+Aspirine
    // avec INR 4.2 → score saign 3 avant fix, 8-10 après fix).
    if (bio) {
        const inr = Number(bio.inr || bio.BIO_030) || 0;
        const hb  = Number(bio.hb  || bio.BIO_009) || 0;
        const plq = Number(bio.plaq || bio.BIO_010) || 0;
        const sx = results.saign;
        if (inr >= 5) { sx.total += 4; sx.contributors.push({ dci: `INR ${inr}`, points: 4 }); }
        else if (inr >= 4) { sx.total += 3; sx.contributors.push({ dci: `INR ${inr}`, points: 3 }); }
        else if (inr >= 3) { sx.total += 1; sx.contributors.push({ dci: `INR ${inr}`, points: 1 }); }
        if (hb > 0 && hb < 10) { sx.total += 2; sx.contributors.push({ dci: `Hb ${hb}`, points: 2 }); }
        else if (hb > 0 && hb < 11) { sx.total += 1; sx.contributors.push({ dci: `Hb ${hb}`, points: 1 }); }
        if (plq > 0 && plq < 50) { sx.total += 3; sx.contributors.push({ dci: `Plaq ${plq}`, points: 3 }); }
        else if (plq > 0 && plq < 100) { sx.total += 2; sx.contributors.push({ dci: `Plaq ${plq}`, points: 2 }); }
        else if (plq > 0 && plq < 150) { sx.total += 1; sx.contributors.push({ dci: `Plaq ${plq}`, points: 1 }); }
    }

    // Déterminer le niveau pour chaque score
    Object.keys(results).forEach(k => {
        const r = results[k];
        const def = SCORE_DEFINITIONS[k];
        if (r.total === 0) r.level = 'none';
        else if (r.total < def.thresholds.low) r.level = 'minimal';
        else if (r.total < def.thresholds.moderate) r.level = 'low';
        else if (r.total < def.thresholds.high) r.level = 'moderate';
        else r.level = 'high';
        // Trier contributeurs par points décroissants
        r.contributors.sort((a, b) => b.points - a.points);
    });

    return results;
}

/**
 * Rend un score sous forme HTML (badge + barre + liste contributeurs)
 * @param {string} scoreKey
 * @param {Object} result
 * @returns {string} HTML
 */
function renderScoreCard(scoreKey, result) {
    const def = SCORE_DEFINITIONS[scoreKey];
    const colors = {
        none: '#94a3b8',     // gris
        minimal: '#10b981',  // vert
        low: '#84cc16',      // lime
        moderate: '#f59e0b', // ambre
        high: '#dc2626'      // rouge
    };
    const labels = {
        none: 'Aucun',
        minimal: 'Minimal',
        low: 'Faible',
        moderate: 'Modéré',
        high: 'Élevé'
    };
    const color = colors[result.level];
    const label = labels[result.level];

    const contribsHTML = result.contributors.length === 0
        ? '<em style="color:#64748b">Aucun médicament contributeur</em>'
        : result.contributors.map(c => `<li><span style="font-weight:600">${c.dci}</span> <span style="color:#64748b">(+${c.points})</span></li>`).join('');

    return `
    <div style="border:1px solid #e2e8f0; border-radius:12px; padding:16px; background:#fff; margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
        <div>
          <h4 style="margin:0 0 4px 0; color:#1e293b">${def.label}</h4>
          <small style="color:#64748b">${def.description}</small>
        </div>
        <div style="text-align:right;">
          <div style="font-size:28px; font-weight:700; color:${color}; line-height:1">${result.total}</div>
          <span style="background:${color}; color:#fff; padding:2px 10px; border-radius:9999px; font-size:11px; font-weight:600; text-transform:uppercase;">${label}</span>
        </div>
      </div>
      <details>
        <summary style="cursor:pointer; color:#475569; font-size:13px; margin-top:8px;">Détails (${result.contributors.length} contributeur${result.contributors.length>1?'s':''})</summary>
        <ul style="margin:8px 0 0 0; padding-left:20px; font-size:13px;">${contribsHTML}</ul>
        <p style="margin:8px 0 0 0; font-size:11px; color:#94a3b8;">Sources : ${def.sources.join(' · ')}</p>
      </details>
    </div>`;
}

/**
 * Rend l'ensemble du panneau scores composites.
 * @param {Array<Object>} prescription
 * @returns {string} HTML
 */
function renderCompositeScoresPanel(prescription, bio) {
    if (!prescription || prescription.length === 0) {
        return '<div style="padding:32px; text-align:center; color:#64748b;"><em>Ajoutez des médicaments à l\'ordonnance pour calculer les scores composites.</em></div>';
    }
    const results = calculateCompositeScores(prescription, bio);
    const cards = Object.entries(results).map(([key, r]) => renderScoreCard(key, r)).join('');

    // Synthèse rapide en haut
    const alertScores = Object.entries(results).filter(([k, r]) => r.level === 'high' || r.level === 'moderate');
    const synthHTML = alertScores.length === 0
        ? '<div style="background:#f0fdf4; border-left:4px solid #10b981; padding:12px; border-radius:6px; margin-bottom:16px;"><strong style="color:#15803d;">✓ Profil pharmacologique acceptable</strong><br><small>Aucun score composite ne dépasse le seuil d\'alerte.</small></div>'
        : `<div style="background:#fef2f2; border-left:4px solid #dc2626; padding:12px; border-radius:6px; margin-bottom:16px;"><strong style="color:#991b1b;">⚠ ${alertScores.length} score${alertScores.length>1?'s':''} d'alerte</strong><br><small>${alertScores.map(([k, r]) => `${SCORE_DEFINITIONS[k].label.split(' — ')[0]} (${r.total} pts, ${r.level})`).join(' · ')}</small></div>`;

    return `
    <div style="max-width:1000px; margin:0 auto;">
      <div style="background:#fffbeb; border:1px solid #fbbf24; border-radius:8px; padding:12px; margin-bottom:20px;">
        <strong style="color:#92400e;">🧪 Scores expérimentaux</strong> — Ces scores sont des indicateurs de cumul à visée pédagogique/d\'aide à la déprescription. Ils ne remplacent pas le jugement clinique. Calculs basés sur le tag <code>scores</code> de chaque médicament + champs <code>acb</code>/<code>cia</code>.
      </div>
      ${synthHTML}
      ${cards}
    </div>`;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SCORE_DEFINITIONS, calculateCompositeScores, renderScoreCard, renderCompositeScoresPanel };
}
if (typeof window !== 'undefined') {
    window.SCORE_DEFINITIONS = SCORE_DEFINITIONS;
    window.calculateCompositeScores = calculateCompositeScores;
    window.renderCompositeScoresPanel = renderCompositeScoresPanel;
}
