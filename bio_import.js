// bio_import.js — Import d'un compte rendu de biologie (PDF à couche texte).
//
// Un compte rendu de laboratoire n'est pas du texte libre : c'est un TABLEAU, où le
// résultat du jour voisine avec l'intervalle de référence et l'antériorité (la valeur
// du bilan précédent). Prendre « le premier nombre après le libellé » sur un texte
// aplati, c'est s'exposer à saisir l'antériorité, ou une créatinine en mg/L comme des
// µmol/L. On lit donc les LIGNES reconstruites depuis les positions de pdf.js, et l'on
// n'accepte une valeur que si son unité est déclarée pour ce paramètre — sinon elle est
// montrée, jamais appliquée.
//
// Rien n'est appliqué sans aperçu : chaque ligne montre le libellé lu, la valeur et
// l'unité du laboratoire, la valeur convertie dans l'unité de GeriaAssist, l'intervalle
// de référence du laboratoire (il prévaut sur les bornes de l'application) et la valeur
// actuellement saisie, qui sera remplacée.
//
// Partie pure (testable sans navigateur) : BIO_IMPORT_PARAMS, uniteCle(), lireValeur(),
// analyserCompteRendu(). Partie navigateur : bioImportOuvrir(), bioImportFichier().
(function (global) {
    'use strict';

    // ── Normalisation ──────────────────────────────────────────────────────────────
    // Les comptes rendus emploient le signe moins U+2212 dans les dates et les intervalles
    // (« 01−10−2026 », « (4,00−6,20) »), et le mu grec U+03BC dans « μmol/L ».
    const _tirets = s => String(s == null ? '' : s).replace(/[−‐-―]/g, '-');
    const norm = s => _tirets(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

    // Libellé nettoyé : sans parenthèses, ponctuation, ni qualificatif de milieu
    // (« Créatinine Sanguine », « Sodium sérique » → « creatinine », « sodium »).
    const MILIEU = /\b(seriques?|sanguines?|sanguins?|plasmatiques?|dans le sang|sang total|sang)\b/g;
    function libelleCle(s) {
        return norm(s).replace(/\([^)]*\)/g, ' ').replace(/[:.*]/g, '').replace(MILIEU, ' ')
            .replace(/\s+/g, ' ').trim();
    }

    // Unité réduite à une clé de table : minuscules, µ/μ/mc → u, sans espaces.
    function uniteCle(u) {
        return norm(u).replace(/[µμ]/g, 'u').replace(/\bmc(?=[gl])/g, 'u')
            .replace(/\s+/g, '').replace(/litre/g, 'l').replace(/\.$/, '').replace(/²/g, '2');
    }

    // ── Facteurs de conversion ─────────────────────────────────────────────────────
    // Conversion masse → quantité de matière : facteur = 1000 / masse molaire (g/mol) pour
    // passer de mg/L à µmol/L, ou 1 / masse molaire pour passer de mg/L à mmol/L. Masses
    // molaires : créatinine 113,12 ; urée 60,06 ; glucose 180,16 ; calcium 40,08 ;
    // magnésium 24,305 ; phosphore 30,97 ; acide urique 168,11 ; bilirubine 584,66 ;
    // cholestérol 386,65 ; triglycérides (trioléine) 885,4. Les autres lignes sont des
    // égalités de notation (mEq/L = mmol/L pour un ion monovalent ; ng/mL = µg/L ;
    // pg/mL = ng/L ; µUI/mL = mUI/L) ou des changements d'échelle (g/dL = 10 g/L).
    const COMPTE = { 'g/l': 1, 'giga/l': 1, '10^9/l': 1, '10*9/l': 1, 'x10^9/l': 1, '10e9/l': 1, '109/l': 1, '/mm3': 0.001, '/ul': 0.001 };
    const UI = { 'ui/l': 1, 'u/l': 1, 'iu/l': 1 };

    // `champ` : id de l'input (identique dans les deux interfaces). `motifs` : libellés
    // acceptés, ANCRÉS — « hémoglobine » ne doit pas capter « hémoglobine glyquée », ni
    // « BNP » le NT-proBNP (deux dosages distincts, seuils distincts). `unites` : clé →
    // facteur vers l'unité de GeriaAssist. `selectUnite` : champ à unité choisie, dont on
    // positionne le sélecteur au lieu de convertir.
    //
    // Volontairement ABSENTS : T4 et T3 (le champ ne dit pas si c'est la fraction libre,
    // en pmol/L, ou totale, en nmol/L), D-dimères (unités FEU / DDU non interchangeables),
    // TCA (ratio ou secondes), albuminurie (24 h ou rapport sur créatinine), et le DFG du
    // laboratoire — GeriaAssist le recalcule depuis la créatinine (CKD-EPI dès 75 ans).
    const BIO_IMPORT_PARAMS = [
        { champ: 'patientK', nom: 'Kaliémie', unite: 'mmol/L', motifs: [/^(potassium|kaliemie|k\+?)$/], unites: { 'mmol/l': 1, 'meq/l': 1 } },
        { champ: 'patientNa', nom: 'Natrémie', unite: 'mmol/L', motifs: [/^(sodium|natremie|na\+?)$/], unites: { 'mmol/l': 1, 'meq/l': 1 } },
        { champ: 'bioChlore', nom: 'Chlore', unite: 'mmol/L', motifs: [/^(chlore|chlorures?|chloremie|cl-?)$/], unites: { 'mmol/l': 1, 'meq/l': 1 } },
        { champ: 'bioUree', nom: 'Urée', unite: 'mmol/L', motifs: [/^(uree|uremie)$/], unites: { 'mmol/l': 1, 'g/l': 16.65, 'mg/l': 0.01665, 'mg/dl': 0.1665 } },
        { champ: 'bioCreat', nom: 'Créatinine', unite: 'µmol/L', motifs: [/^(creatinine|creatininemie)$/], unites: { 'umol/l': 1, 'mg/l': 8.84, 'mg/dl': 88.4 } },
        { champ: 'bioOsm', nom: 'Osmolalité', unite: 'mOsm/kg', motifs: [/^osmolalite$/], unites: { 'mosm/kg': 1, 'mosm/kgh2o': 1, 'mosmol/kg': 1 } },
        { champ: 'bioPhos', nom: 'Phosphore', unite: 'mmol/L', motifs: [/^(phosphore|phosphates?|phosphoremie)$/], unites: { 'mmol/l': 1, 'mg/l': 0.03229, 'mg/dl': 0.3229 } },
        { champ: 'bioCa', nom: 'Calcémie', unite: 'mmol/L', motifs: [/^(calcium|calcium total|calcemie)$/], unites: { 'mmol/l': 1, 'mg/l': 0.02495, 'mg/dl': 0.2495 } },
        { champ: 'bioMg', nom: 'Magnésium', unite: 'mmol/L', motifs: [/^(magnesium|magnesemie)$/], unites: { 'mmol/l': 1, 'mg/l': 0.04114, 'mg/dl': 0.4114, 'meq/l': 0.5 } },
        { champ: 'bioUric', nom: 'Uricémie', unite: 'µmol/L', motifs: [/^(acide urique|uricemie)$/], unites: { 'umol/l': 1, 'mg/l': 5.948, 'mg/dl': 59.48 } },
        { champ: 'bioHb', nom: 'Hémoglobine', unite: 'g/dL', motifs: [/^(hemoglobine|hb)$/], unites: { 'g/dl': 1, 'g/l': 0.1 } },
        { champ: 'bioVgm', nom: 'VGM', unite: 'fL', motifs: [/^(vgm|volume globulaire moyen)$/], unites: { 'fl': 1, 'um3': 1, 'u3': 1 } },
        { champ: 'bioPlaq', nom: 'Plaquettes', unite: 'G/L', motifs: [/^(plaquettes|numeration plaquettaire)$/], unites: COMPTE },
        { champ: 'bioGb', nom: 'Leucocytes', unite: 'G/L', motifs: [/^(leucocytes|globules blancs)$/], unites: COMPTE },
        { champ: 'bioPnn', nom: 'Polynucléaires neutrophiles', unite: 'G/L', motifs: [/^(polynucleaires neutrophiles|neutrophiles)$/], unites: COMPTE },
        { champ: 'bioRetic', nom: 'Réticulocytes', unite: 'G/L', motifs: [/^reticulocytes$/], unites: COMPTE },
        { champ: 'bioFer', nom: 'Ferritine', unite: 'µg/L', motifs: [/^ferritine(mie)?$/], unites: { 'ug/l': 1, 'ng/ml': 1 } },
        { champ: 'bioCst', nom: 'Coefficient de saturation de la transferrine', unite: '%', motifs: [/^(cst|coefficient de saturation( de la transferrine)?)$/], unites: { '%': 1 } },
        { champ: 'bioB12', nom: 'Vitamine B12', motifs: [/^(vitamine b12|cobalamine)$/], selectUnite: { id: 'bioB12Unit', unites: { 'pmol/l': 'pmol/L', 'ng/l': 'ng/L', 'pg/ml': 'ng/L' } } },
        { champ: 'bioB9', nom: 'Folates', motifs: [/^(folates?|vitamine b9|acide folique)$/], selectUnite: { id: 'bioB9Unit', unites: { 'nmol/l': 'nmol/L', 'ug/l': 'µg/L', 'ng/ml': 'µg/L' } } },
        { champ: 'bioVitD', nom: 'Vitamine D', motifs: [/^(25-?oh vitamine d[23]?|vitamine d( totale)?|25-?oh-?d|25 oh d)$/], selectUnite: { id: 'bioVitDUnit', unites: { 'ng/ml': 'ng/mL', 'ug/l': 'ng/mL', 'nmol/l': 'nmol/L' } } },
        { champ: 'bioInr', nom: 'INR', unite: '', motifs: [/^inr$/], unites: { '': 1 } },
        { champ: 'bioTp', nom: 'Taux de prothrombine', unite: '%', motifs: [/^(tp|taux de prothrombine)$/], unites: { '%': 1 } },
        { champ: 'bioAsat', nom: 'ASAT', unite: 'UI/L', motifs: [/^(asat|tgo|aspartate aminotransferase)$/], unites: UI },
        { champ: 'bioAlat', nom: 'ALAT', unite: 'UI/L', motifs: [/^(alat|tgp|alanine aminotransferase)$/], unites: UI },
        { champ: 'bioPal', nom: 'Phosphatases alcalines', unite: 'UI/L', motifs: [/^(pal|phosphatases alcalines)$/], unites: UI },
        { champ: 'bioGgt', nom: 'GGT', unite: 'UI/L', motifs: [/^(ggt|gamma-? ?gt|gamma-? ?glutamyl-? ?transferase)$/], unites: UI },
        { champ: 'bioBili', nom: 'Bilirubine totale', unite: 'µmol/L', motifs: [/^bilirubine( totale)?$/], unites: { 'umol/l': 1, 'mg/l': 1.710, 'mg/dl': 17.10 } },
        { champ: 'bioAlbumSg', nom: 'Albumine', unite: 'g/L', motifs: [/^(albumine|albuminemie)$/], unites: { 'g/l': 1, 'g/dl': 10 } },
        { champ: 'bioPrealb', nom: 'Préalbumine', unite: 'g/L', motifs: [/^(prealbumine|transthyretine)$/], unites: { 'g/l': 1, 'mg/l': 0.001, 'mg/dl': 0.01 } },
        { champ: 'bioGly', nom: 'Glycémie', unite: 'mmol/L', motifs: [/^(glycemie|glucose|glycemie a jeun)$/], unites: { 'mmol/l': 1, 'g/l': 5.551, 'mg/dl': 0.05551 } },
        { champ: 'bioHba1c', nom: 'HbA1c', unite: '%', motifs: [/^(hba1c|hemoglobine glyquee)$/], unites: { '%': 1 } },
        { champ: 'bioTsh', nom: 'TSH', unite: 'mUI/L', motifs: [/^(tsh|tsh us|tshus|tsh ultrasensible|thyreostimuline)$/], unites: { 'mui/l': 1, 'mu/l': 1, 'uui/ml': 1, 'uu/ml': 1 } },
        { champ: 'bioLdl', nom: 'LDL-cholestérol', unite: 'g/L', motifs: [/^(ldl|ldl-?c|ldl-? ?cholesterol|cholesterol ldl)( calcule)?$/], unites: { 'g/l': 1, 'mmol/l': 0.3866, 'mg/dl': 0.01 } },
        { champ: 'bioHdl', nom: 'HDL-cholestérol', unite: 'g/L', motifs: [/^(hdl|hdl-?c|hdl-? ?cholesterol|cholesterol hdl)$/], unites: { 'g/l': 1, 'mmol/l': 0.3866, 'mg/dl': 0.01 } },
        { champ: 'bioTg', nom: 'Triglycérides', unite: 'g/L', motifs: [/^triglycerides?$/], unites: { 'g/l': 1, 'mmol/l': 0.8854, 'mg/dl': 0.01 } },
        { champ: 'bioCrp', nom: 'CRP', unite: 'mg/L', motifs: [/^(crp|proteine c-? ?reactive)$/], unites: { 'mg/l': 1, 'mg/dl': 10 } },
        { champ: 'bioPct', nom: 'Procalcitonine', unite: 'ng/mL', motifs: [/^(pct|procalcitonine)$/], unites: { 'ng/ml': 1, 'ug/l': 1 } },
        { champ: 'bioTropo', nom: 'Troponine', unite: 'ng/L', motifs: [/^troponine( [ti])?( (hs|ultrasensible|us))?$/], unites: { 'ng/l': 1, 'pg/ml': 1 } },
        { champ: 'bioBnp', nom: 'NT-proBNP', unite: 'pg/mL', motifs: [/^nt-? ?pro-? ?bnp$/], unites: { 'pg/ml': 1, 'ng/l': 1 } },
        { champ: 'bioLipase', nom: 'Lipase', unite: 'UI/L', motifs: [/^lipase$/], unites: UI },
        { champ: 'bioLact', nom: 'Lactates', unite: 'mmol/L', motifs: [/^(lactates?|acide lactique)$/], unites: { 'mmol/l': 1 } },
        { champ: 'bioCpk', nom: 'CPK', unite: 'UI/L', motifs: [/^(cpk|ck|creatine kinase|creatine phosphokinase)$/], unites: UI },
        { champ: 'bioLithium', nom: 'Lithiémie', unite: 'mEq/L', motifs: [/^(lithium|lithiemie)$/], unites: { 'meq/l': 1, 'mmol/l': 1 } },
        { champ: 'bioDigox', nom: 'Digoxinémie', motifs: [/^(digoxine|digoxinemie)$/], selectUnite: { id: 'bioDigoxUnit', unites: { 'ng/ml': 'ng/mL', 'ug/l': 'ng/mL', 'nmol/l': 'nmol/L' } } }
    ];
    // Lu pour être MONTRÉ, jamais appliqué.
    const DFG_LABO = /^(dfg|debit de filtration glomerulaire)\b/;

    // ── Lecture d'une valeur ───────────────────────────────────────────────────────
    // « 1 349,0 » (espace de milliers), « 4,28 », « < 0,5 » (valeur censurée : bornée,
    // pas mesurée — elle est montrée et jamais appliquée).
    const RE_VALEUR = /^([<>≤≥]=?)?\s*(\d{1,3}(?:[   ]\d{3})+|\d+)(?:[,.](\d+))?$/;
    function lireValeur(s) {
        const m = RE_VALEUR.exec(_tirets(s).trim());
        if (!m) return null;
        const v = parseFloat(m[2].replace(/[   ]/g, '') + (m[3] ? '.' + m[3] : ''));
        return isFinite(v) ? { valeur: v, censure: m[1] || '', brut: s.trim() } : null;
    }
    // Une cellule peut aussi porter valeur ET unité (« 10,3 g/dl »).
    function scinderCellule(s) {
        const t = _tirets(s).trim();
        const m = /^([<>≤≥]=?\s*)?(\d{1,3}(?:[   ]\d{3})+|\d+)(?:[,.]\d+)?(?=\s|$)/.exec(t);
        if (!m) return null;
        const v = lireValeur(m[0]);
        return v ? { v, reste: t.slice(m[0].length).trim() } : null;
    }
    const estIntervalle = s => /^\(.*\)$/.test(_tirets(s).trim());

    // ── Reconstitution des lignes ──────────────────────────────────────────────────
    // `items` : [{ str, x, y, page }] (x/y = transform[4]/[5] de pdf.js, y croissant vers
    // le haut). Deux items appartiennent à la même ligne s'ils sont à moins de 2,5 points
    // de hauteur l'un de l'autre.
    function lignes(items) {
        const parPage = new Map();
        (items || []).forEach(it => {
            if (!it || !String(it.str || '').trim()) return;
            const p = it.page || 1;
            if (!parPage.has(p)) parPage.set(p, []);
            parPage.get(p).push(it);
        });
        const out = [];
        [...parPage.keys()].sort((a, b) => a - b).forEach(p => {
            const its = parPage.get(p).slice().sort((a, b) => b.y - a.y || a.x - b.x);
            let cur = null;
            its.forEach(it => {
                if (cur && Math.abs(cur.y - it.y) <= 2.5) cur.items.push(it);
                else { cur = { page: p, y: it.y, items: [it] }; out.push(cur); }
            });
        });
        out.forEach(l => l.items.sort((a, b) => a.x - b.x));
        return out;
    }

    // ── Analyse ────────────────────────────────────────────────────────────────────
    // Rend { valeurs, ignores, date, identite, dfgLabo }. Une valeur est retenue sur la
    // ligne de son LIBELLÉ : le libellé est en tête, le résultat est le PREMIER nombre qui
    // le suit, et l'unité la cellule d'après. L'antériorité, toujours à droite de
    // l'intervalle de référence (ou sur une ligne sans libellé), n'est jamais lue.
    function analyserCompteRendu(items) {
        const ls = lignes(items);
        const valeurs = [], ignores = [];
        let dfgLabo = null;
        ls.forEach((l, i) => {
            const cells = l.items.map(it => String(it.str).trim());
            let k = -1, sc = null;
            for (let j = 1; j < cells.length; j++) { // j ≥ 1 : un libellé doit précéder
                if (estIntervalle(cells[j])) break;
                sc = scinderCellule(cells[j]);
                if (sc) { k = j; break; }
            }
            if (k < 1) return;
            const libelle = cells.slice(0, k).join(' ');
            const cle = libelleCle(libelle);
            if (!cle || /%$/.test(cle)) return; // « Polynucléaires neutrophiles % »
            let unite = sc.reste;
            if (!unite && cells[k + 1] && !estIntervalle(cells[k + 1]) && !lireValeur(cells[k + 1])) unite = cells[k + 1];
            // Intervalle de référence : sur la ligne, ou sur la ligne sans libellé juste
            // au-dessus (mise en page sur deux lignes, avec l'antériorité à droite).
            let ref = cells.find(estIntervalle) || '';
            if (!ref && i > 0) {
                const prec = ls[i - 1];
                if (prec.page === l.page && prec.y - l.y < 16 && prec.items[0].x > l.items[0].x + 20)
                    ref = (prec.items.map(it => String(it.str).trim()).find(estIntervalle)) || '';
            }
            if (DFG_LABO.test(cle)) {
                if (!dfgLabo && !sc.v.censure) dfgLabo = { libelle, valeur: sc.v.valeur, unite };
                return;
            }
            const p = BIO_IMPORT_PARAMS.find(q => q.motifs.some(re => re.test(cle)));
            if (!p) return;
            valeurs.push(_evaluer(p, libelle, sc.v, unite, _tirets(ref)));
        });
        // Une même analyse lue deux fois avec deux résultats différents : on ne choisit
        // pas à la place du lecteur.
        const parChamp = new Map();
        valeurs.forEach(v => { (parChamp.get(v.champ) || parChamp.set(v.champ, []).get(v.champ)).push(v); });
        const retenues = [];
        parChamp.forEach(liste => {
            const ok = liste.filter(v => v.statut === 'ok');
            const base = ok[0] || liste[0];
            const autres = liste.filter(v => v !== base && v.statut === 'ok' && v.valeurCible !== base.valeurCible);
            if (autres.length) { base.statut = 'conflit'; base.motif = `lu ${autres.length + 1} fois avec des valeurs différentes (${[base, ...autres].map(v => v.brut + ' ' + v.uniteLue).join(' ; ')}) — saisir à la main`; }
            retenues.push(base);
            liste.filter(v => v !== base && v.statut !== 'ok').forEach(v => ignores.push(v));
        });
        retenues.sort((a, b) => BIO_IMPORT_PARAMS.findIndex(q => q.champ === a.champ) - BIO_IMPORT_PARAMS.findIndex(q => q.champ === b.champ));
        const texte = ls.map(l => l.items.map(it => it.str).join(' ')).join('\n');
        return { valeurs: retenues, ignores, date: datePrelevement(texte), identite: identite(texte, ls), dfgLabo };
    }

    function _arrondi(v) {
        const a = Math.abs(v);
        const d = a >= 100 ? 0 : a >= 10 ? 1 : 2;
        return +v.toFixed(d);
    }

    function _evaluer(p, libelle, v, uniteLue, ref) {
        const r = { champ: p.champ, nom: p.nom, libelle, brut: v.brut, valeurLue: v.valeur, uniteLue: uniteLue || '', ref, unite: p.unite || '', valeurCible: null, uniteSelect: null, statut: 'ok', motif: '' };
        if (v.censure) { r.statut = 'censure'; r.motif = `valeur bornée (${v.brut}), pas un résultat mesuré`; return r; }
        const u = uniteCle(uniteLue);
        if (p.selectUnite) {
            const opt = p.selectUnite.unites[u];
            if (!opt) { r.statut = 'unite'; r.motif = uniteLue ? `unité « ${uniteLue} » non reconnue pour ce paramètre` : 'unité absente'; return r; }
            r.valeurCible = v.valeur; r.uniteSelect = opt; r.unite = opt;
        } else {
            const f = p.unites[u];
            if (f == null) { r.statut = 'unite'; r.motif = uniteLue ? `unité « ${uniteLue} » non reconnue pour ce paramètre` : 'unité absente'; return r; }
            r.valeurCible = f === 1 ? v.valeur : _arrondi(v.valeur * f);
            r.converti = f !== 1;
        }
        return r;
    }

    // « Prélevé le 01-10-2026 », « Prélèvement du 01/10/2026 ». La date d'ÉDITION ou de
    // dossier n'est pas celle du prélèvement : sans mention du prélèvement, rien n'est
    // proposé — l'absence de date reste l'absence de date.
    function datePrelevement(texte) {
        const m = /prel[a-z]*\s+(?:le|du)\s+(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(norm(texte));
        if (!m) return null;
        const [j, mo, a] = [+m[1], +m[2], +m[3]];
        if (mo < 1 || mo > 12 || j < 1 || j > 31) return null;
        return `${a}-${String(mo).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
    }

    // Identité : montrée pour l'identitovigilance (est-ce bien le bon patient ?). Âge et
    // sexe peuvent être appliqués ; le nom n'est jamais reporté d'office.
    function identite(texte, ls) {
        const t = norm(texte);
        const out = { nom: '', naissance: null, sexe: '' };
        const n = /(?:date de naissance|ne\(e\)[^\n]*?\ble)\s*:?\s*(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(t);
        if (n) out.naissance = `${n[3]}-${n[2].padStart(2, '0')}-${n[1].padStart(2, '0')}`;
        const s = /\bsexe\s*:?\s*([mf])\b/.exec(t);
        if (s) out.sexe = s[1].toUpperCase();
        for (const l of ls || []) {
            const txt = _tirets(l.items.map(it => it.str).join(' ')).replace(/\s+/g, ' ').trim();
            const m = /^(?:nom utilis[ée]\s+)?((?:M\.|Mme|Mlle|Monsieur|Madame)\s+[^|]{2,60}?)(?:\s{2,}|$|\s+n[ée]\(e\))/.exec(txt);
            if (m) { out.nom = m[1].trim(); break; }
        }
        return out;
    }

    function ageA(naissanceIso, refIso) {
        if (!naissanceIso) return null;
        const [a, m, j] = naissanceIso.split('-').map(Number);
        const r = refIso ? refIso.split('-').map(Number) : (() => { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()]; })();
        let age = r[0] - a;
        if (r[1] < m || (r[1] === m && r[2] < j)) age--;
        return age >= 0 && age < 130 ? age : null;
    }

    // ── Partie navigateur ──────────────────────────────────────────────────────────
    let _pdfjs = null;
    async function _chargerPdfjs() {
        if (_pdfjs) return _pdfjs;
        const base = new URL('lib/', document.baseURI).href;
        _pdfjs = await import(base + 'pdf.min.js');
        _pdfjs.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js';
        return _pdfjs;
    }

    async function itemsDuPdf(buffer) {
        const pdfjs = await _chargerPdfjs();
        const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false }).promise;
        const items = [];
        for (let p = 1; p <= doc.numPages; p++) {
            const tc = await (await doc.getPage(p)).getTextContent();
            tc.items.forEach(it => { if (it.str && it.str.trim()) items.push({ str: it.str, x: it.transform[4], y: it.transform[5], page: p }); });
        }
        return items;
    }

    function bioImportOuvrir() {
        const inp = document.getElementById('bioImportFile');
        if (inp) inp.click();
    }

    async function bioImportFichier(fichier) {
        if (!fichier) return;
        let res;
        try {
            const items = await itemsDuPdf(await fichier.arrayBuffer());
            if (!items.length) return _message('Ce PDF ne contient pas de texte (document scanné ou photographié). Utiliser l\'import par image (OCR), ou saisir les valeurs.');
            res = analyserCompteRendu(items);
        } catch (e) {
            console.warn('bio_import', e);
            return _message('Lecture du PDF impossible : ' + (e && e.message ? e.message : e));
        }
        if (!res.valeurs.length && !res.date) return _message('Aucun paramètre biologique reconnu dans ce document.');
        _apercu(res);
    }

    const _esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const _fr = v => String(v).replace('.', ',');

    function _fenetre(titre) {
        const overlay = document.createElement('div');
        overlay.id = 'bioImportDialog';
        overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:20000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55);padding:16px;';
        const card = document.createElement('div');
        card.style.cssText = 'background:#fff;color:#0f172a;border-radius:12px;max-width:820px;width:100%;max-height:90vh;overflow:auto;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.3);font-size:13px;';
        card.innerHTML = `<div style="font-weight:700;font-size:15px;margin-bottom:6px;">${_esc(titre)}</div>`;
        overlay.appendChild(card);
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        const prev = document.getElementById('bioImportDialog'); if (prev) prev.remove();
        document.body.appendChild(overlay);
        return { overlay, card };
    }

    function _message(txt) {
        const { overlay, card } = _fenetre('Import d\'un bilan biologique');
        card.insertAdjacentHTML('beforeend', `<div style="margin:8px 0 12px;line-height:1.45;">${_esc(txt)}</div><div style="text-align:right;"><button type="button" data-act="fermer" style="padding:6px 14px;border-radius:8px;border:1px solid #94a3b8;background:#fff;">Fermer</button></div>`);
        card.querySelector('[data-act="fermer"]').onclick = () => overlay.remove();
    }

    const _val = id => { const el = document.getElementById(id); return el ? String(el.value || '') : ''; };

    function _apercu(res) {
        const { overlay, card } = _fenetre('Import d\'un bilan biologique — vérifier avant d\'appliquer');
        const id = res.identite || {};
        const age = ageA(id.naissance);
        const ageSaisi = _val('patientAge'), sexeSaisi = _val('patientSexe');
        const ecartId = (age != null && ageSaisi && +ageSaisi !== age) || (id.sexe && sexeSaisi && id.sexe !== sexeSaisi);
        let h = '';
        if (id.nom || id.naissance) {
            h += `<div style="padding:8px 10px;border-radius:8px;margin-bottom:8px;${ecartId ? 'background:#fef3c7;border:1px solid #f59e0b;' : 'background:#f1f5f9;'}">`
                + `<b>Patient du compte rendu :</b> ${_esc(id.nom || '—')}${id.naissance ? ` — né(e) le ${_esc(id.naissance.split('-').reverse().join('/'))}${age != null ? ` (${age} ans)` : ''}` : ''}${id.sexe ? ` — sexe ${_esc(id.sexe)}` : ''}`
                + (ecartId ? `<br><b>⚠ Diffère de la saisie actuelle</b> (${_esc(ageSaisi)} ans, ${_esc(sexeSaisi)}) : vérifier qu'il s'agit du bon patient.` : '')
                + `</div>`;
        }
        const ligne = (cle, coche, actif, cells, style) =>
            `<tr style="${style || ''}"><td style="padding:3px 4px;"><input type="checkbox" data-cle="${_esc(cle)}" ${coche ? 'checked' : ''} ${actif ? '' : 'disabled'}></td>${cells.map(c => `<td style="padding:3px 4px;vertical-align:top;">${c}</td>`).join('')}</tr>`;
        let rows = '';
        if (res.date) {
            const d = res.date.split('-').reverse().join('/');
            rows += ligne('date', true, true, ['<b>Date du prélèvement</b>', _esc(d), '', _esc(d), _esc(_val('bioDate') ? _val('bioDate').split('-').reverse().join('/') : '—'), '']);
        }
        if (age != null) rows += ligne('age', !ageSaisi || +ageSaisi !== age, true, ['Âge', `${age} ans`, '', `${age}`, _esc(ageSaisi || '—'), '']);
        if (id.sexe) rows += ligne('sexe', id.sexe !== sexeSaisi, true, ['Sexe', _esc(id.sexe), '', _esc(id.sexe), _esc(sexeSaisi || '—'), '']);
        res.valeurs.forEach((v, i) => {
            const ok = v.statut === 'ok';
            const cible = ok ? `<b>${_esc(_fr(v.valeurCible))}</b> ${_esc(v.unite)}${v.converti ? ' <span style="color:#0369a1;">(converti)</span>' : ''}` : `<span style="color:#b91c1c;">${_esc(v.motif)}</span>`;
            // Hors des bornes de saisie du champ : presque toujours une erreur d'unité.
            const el = document.getElementById(v.champ);
            let horsBornes = false;
            if (ok && el && el.min !== '' && el.max !== '' && !v.uniteSelect) horsBornes = v.valeurCible < +el.min || v.valeurCible > +el.max;
            const note = horsBornes ? `<br><span style="color:#b45309;">hors des bornes de saisie (${_esc(el.min)}–${_esc(el.max)}) — vérifier l'unité</span>` : '';
            rows += ligne('v' + i, ok && !horsBornes, ok, [_esc(v.nom) + `<br><span style="color:#64748b;font-size:11px;">« ${_esc(v.libelle)} »</span>`, `${_esc(v.brut)} ${_esc(v.uniteLue)}`, _esc(v.ref), cible + note, _esc(_val(v.champ) ? _val(v.champ) + (v.uniteSelect ? ' ' + _val(BIO_IMPORT_PARAMS.find(q => q.champ === v.champ).selectUnite.id) : '') : '—'), ''], ok ? '' : 'background:#fef2f2;');
        });
        h += `<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="text-align:left;border-bottom:1px solid #cbd5e1;"><th></th><th>Paramètre</th><th>Lu (laboratoire)</th><th>Réf. labo</th><th>Importé dans GeriaAssist</th><th>Saisie actuelle</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
        if (res.dfgLabo) h += `<div style="margin-top:8px;color:#475569;">DFG du laboratoire : ${_esc(_fr(res.dfgLabo.valeur))} ${_esc(res.dfgLabo.unite)} (« ${_esc(res.dfgLabo.libelle)} ») — non importé : GeriaAssist le recalcule depuis la créatinine.</div>`;
        h += `<div style="margin-top:6px;color:#475569;">Seul le résultat du jour est lu : les antériorités et les intervalles de référence ne sont jamais importés. Les intervalles du laboratoire prévalent sur les bornes de l'application.</div>`;
        h += `<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;"><button type="button" data-act="annuler" style="padding:6px 14px;border-radius:8px;border:1px solid #94a3b8;background:#fff;">Annuler</button><button type="button" data-act="appliquer" id="bioImportAppliquer" style="padding:6px 14px;border-radius:8px;border:0;background:#0d9488;color:#fff;font-weight:600;">Appliquer la sélection</button></div>`;
        card.insertAdjacentHTML('beforeend', h);
        card.querySelector('[data-act="annuler"]').onclick = () => overlay.remove();
        card.querySelector('[data-act="appliquer"]').onclick = () => {
            const coches = new Set([...card.querySelectorAll('input[type=checkbox][data-cle]:checked')].map(c => c.dataset.cle));
            const n = appliquer(res, coches);
            overlay.remove();
            _message(`${n} valeur(s) importée(s). Relancer l'analyse pour en tenir compte.`);
        };
    }

    function _poser(id, valeur) {
        const el = document.getElementById(id); if (!el) return false;
        el.value = String(valeur);
        try { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) { /* */ }
        return true;
    }

    // Applique les lignes cochées. Le sexe et l'âge passent AVANT la créatinine : le DFG
    // est recalculé à chaque saisie, et doit l'être avec la bonne identité.
    function appliquer(res, coches) {
        let n = 0;
        const id = res.identite || {};
        const age = ageA(id.naissance);
        if (coches.has('sexe') && id.sexe && _poser('patientSexe', id.sexe)) n++;
        if (coches.has('age') && age != null && _poser('patientAge', age)) n++;
        if (coches.has('date') && res.date && _poser('bioDate', res.date)) n++;
        res.valeurs.forEach((v, i) => {
            if (!coches.has('v' + i) || v.statut !== 'ok') return;
            if (v.uniteSelect) {
                const p = BIO_IMPORT_PARAMS.find(q => q.champ === v.champ);
                _poser(p.selectUnite.id, v.uniteSelect);
            }
            if (_poser(v.champ, v.valeurCible)) n++;
        });
        // Les valeurs vont pour la plupart dans la biologie complète, repliée par défaut.
        const det = document.getElementById('patientK') && document.getElementById('patientK').closest('details');
        if (det) det.open = true;
        try { if (typeof calculerDFG === 'function') calculerDFG(); } catch (e) { /* */ }
        return n;
    }

    const api = { BIO_IMPORT_PARAMS, uniteCle, lireValeur, libelleCle, lignes, analyserCompteRendu, datePrelevement, identite, ageA, appliquer };
    global.GeriaBioImport = api;
    global.bioImportOuvrir = bioImportOuvrir;
    global.bioImportFichier = bioImportFichier;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
