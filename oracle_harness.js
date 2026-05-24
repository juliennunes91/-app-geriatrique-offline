// oracle_harness.js — Exécute le VRAI analyserPrescription() hors navigateur.
// But : test différentiel (oracle clinique). Charge tous les modules applicatifs
// dans un sandbox vm avec un shim DOM minimal, puis expose analyzeCase(caseObj)
// qui renvoie la sortie structurée du logiciel (alertes par onglet).
//
// Usage : const { analyzeCase } = require('./oracle_harness');
//         const out = analyzeCase({ age:85, sexe:'F', dfg:35, comorbs:['PAT_006'], meds:['Warfarine'] });
'use strict';
const fs = require('fs');
const vm = require('vm');
const { performance } = require('perf_hooks');

// ---- Shim DOM minimal -------------------------------------------------------
function makeFakeEl(id) {
    const el = {
        id: id || '', _html: '', value: '', checked: false,
        style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        children: [], childNodes: [],
        appendChild(c) { this.childNodes.push(c); return c; },
        removeChild(c) { return c; }, insertBefore(c) { return c; },
        setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
        addEventListener() {}, removeEventListener() {},
        querySelector() { return null; }, querySelectorAll() { return []; },
        closest() { return null; }, remove() {}, focus() {}, click() {}, scrollIntoView() {},
        cloneNode() { return makeFakeEl(this.id); },
        getContext() { return null; },
        get innerHTML() { return this._html; },
        set innerHTML(v) { this._html = v; },
        get textContent() { return String(this._html).replace(/<[^>]+>/g, ''); },
        set textContent(v) { this._html = v; },
        insertAdjacentHTML(pos, html) { this._html += html; }
    };
    return el;
}

function buildSandbox() {
    const elCache = new Map();
    const inputs = {}; // id -> { value?, checked? }  (rempli par analyzeCase)

    const documentShim = {
        _inputs: inputs,
        getElementById(id) {
            if (!elCache.has(id)) {
                const el = makeFakeEl(id);
                elCache.set(id, el);
            }
            const el = elCache.get(id);
            if (inputs[id] !== undefined) {
                if (inputs[id].value !== undefined) el.value = String(inputs[id].value);
                if (inputs[id].checked !== undefined) el.checked = !!inputs[id].checked;
            }
            return el;
        },
        createElement() { return makeFakeEl(); },
        createElementNS() { return makeFakeEl(); },
        createDocumentFragment() { return makeFakeEl(); },
        createTextNode(t) { const e = makeFakeEl(); e._html = t; return e; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        addEventListener() {}, removeEventListener() {},
        getElementsByClassName() { return []; }, getElementsByTagName() { return []; },
        body: makeFakeEl('body'), head: makeFakeEl('head'), documentElement: makeFakeEl('html'),
        _elCache: elCache,
        resetOutputs() { elCache.forEach(el => { el._html = ''; el.value = ''; el.checked = false; }); }
    };

    const localStorageShim = (() => {
        const store = {};
        return { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; } };
    })();

    const sandbox = {
        console: { log() {}, info() {}, warn() {}, error() {}, debug() {} },
        performance,
        document: documentShim,
        localStorage: localStorageShim,
        navigator: { language: 'fr-FR', userAgent: 'node', onLine: true },
        location: { href: 'http://localhost/', protocol: 'http:' },
        matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
        requestAnimationFrame: cb => setTimeout(cb, 0),
        cancelAnimationFrame: () => {},
        setTimeout, clearTimeout, setInterval, clearInterval,
        alert() {}, confirm() { return true; }, prompt() { return ''; },
        fetch: () => Promise.reject(new Error('no network in harness'))
    };
    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;
    sandbox.self = sandbox;
    vm.createContext(sandbox);
    return { sandbox, documentShim };
}

const APP_FILES = [
    'ddi_general.js', 'ddi_merged_V2.js', 'app_legend.js',
    'geria_database.js', 'geria_pathology_rules_v3.js', 'geria_recos_final.js',
    'geria_integration_module.js', 'utils.js', 'patient_state.js', 'drug_classes.js',
    'geria_engine_v2.js', 'app_core.js', 'app_ui.js',
    'child_pugh_adaptations.js', 'composite_scores.js', 'app_analysis.js'
];

function loadApp() {
    const { sandbox, documentShim } = buildSandbox();
    for (const f of APP_FILES) {
        const code = fs.readFileSync(__dirname + '/' + f, 'utf8');
        try { vm.runInContext(code, sandbox, { filename: f }); }
        catch (e) { throw new Error(`Erreur chargement ${f}: ${e.message}`); }
    }
    return { sandbox, documentShim };
}

// Mapping nom convivial -> id d'input du formulaire
const BIO_INPUT_IDS = {
    k: 'patientK', na: 'patientNa', creat: 'bioCreat', dfg: 'patientDFG',
    ca: 'bioCa', mg: 'bioMg', uree: 'bioUree', uric: 'bioUric',
    hb: 'bioHb', plaq: 'bioPlaq', gb: 'bioGb', pnn: 'bioPnn',
    asat: 'bioAsat', alat: 'bioAlat', ggt: 'bioGgt', pal: 'bioPal', bili: 'bioBili',
    cpk: 'bioCpk', tsh: 'bioTsh', fer: 'bioFer', b12: 'bioB12', b9: 'bioB9',
    vitd: 'bioVitD', crp: 'bioCrp', gly: 'bioGly', hba1c: 'bioHba1c',
    ldl: 'bioLdl', tg: 'bioTg', bnp: 'bioBnp', inr: 'bioInr', qtc: 'bioQtc',
    lithium: 'bioLithium', lipase: 'bioLipase', alb: 'bioAlb', albumSg: 'bioAlbumSg',
    albuminurie: 'bioAlbuminurie', rac: 'bioAlbuminurie'
};

function parseAlerts(html) {
    if (!html) return [];
    const out = [];
    // Découpe grossière par bloc .alert / carte ; on extrait titre (<strong>) + sévérité.
    const blocks = String(html).split(/(?=<div class="[^"]*alert)/);
    blocks.forEach(b => {
        const m = b.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
        if (!m) return;
        const titre = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (!titre) return;
        let severity = 'info';
        if (/alert-danger|alert-stopp|border-danger/.test(b)) severity = 'danger';
        else if (/alert-warning|border-warning/.test(b)) severity = 'warning';
        else if (/alert-success/.test(b)) severity = 'success';
        out.push({ titre, severity });
    });
    return out;
}

let _app = null;

function analyzeCase(caseObj) {
    if (!_app) _app = loadApp();
    const { sandbox, documentShim } = _app;

    // Reset sorties + inputs
    documentShim.resetOutputs();
    for (const k in documentShim._inputs) delete documentShim._inputs[k];
    const inp = documentShim._inputs;
    const setInput = (id, value, checked) => { inp[id] = {}; if (value !== undefined) inp[id].value = value; if (checked !== undefined) inp[id].checked = checked; };

    setInput('patientAge', caseObj.age != null ? caseObj.age : 80);
    setInput('patientSexe', caseObj.sexe || 'F');
    if (caseObj.poids != null) setInput('patientPoids', caseObj.poids);
    if (caseObj.dfg != null) setInput('patientDFG', caseObj.dfg);
    if (caseObj.cfs != null) setInput('scoreCFS', caseObj.cfs);
    setInput('patientFragile', undefined, !!caseObj.fragile);

    const bio = caseObj.bio || {};
    for (const [k, v] of Object.entries(bio)) {
        const id = BIO_INPUT_IDS[k] || k;
        setInput(id, v);
    }
    (caseObj.flags || []).forEach(chk => setInput(chk, undefined, true));

    // Médicaments + comorbidités : muter en place les tableaux liés à PatientState
    vm.runInContext(`
        (function(){
            const dbByDci = {};
            MASTER_DB.MEDICAMENTS.forEach(m => { dbByDci[sanitizeText(m.dci)] = m; });
            activeMeds.length = 0;
            (${JSON.stringify(caseObj.meds || [])}).forEach(name => {
                const key = sanitizeText(name);
                const m = dbByDci[key] || MASTER_DB.MEDICAMENTS.find(x => sanitizeText(x.dci).includes(key) || key.includes(sanitizeText(x.dci)));
                if (m) activeMeds.push({ dci: m.dci, classe: m.classe, label: m.dci, core_id: sanitizeText(m.dci), albumine: parseFloat(m.albumine)||0, db_ref: m });
                else activeMeds.push({ dci: name, classe: '', label: name, core_id: sanitizeText(name), albumine: 0, db_ref: null, _notFound: true });
            });
            activeComorbs.length = 0;
            (${JSON.stringify(caseObj.comorbs || [])}).forEach(c => activeComorbs.push(c));
            window.suspendedMeds = [];
            _lastAnalysisHash = null; _lastAnalysisResult = null;
        })();
    `, sandbox);

    // Médicaments non trouvés (pour signaler les cas mal mappés)
    const notFound = vm.runInContext('activeMeds.filter(m=>m._notFound).map(m=>m.dci)', sandbox);

    vm.runInContext('analyserPrescription();', sandbox);

    const containers = ['alertes-scores', 'alertes-eviter', 'alertes-initier', 'alertes-interact', 'alertes-bio', 'alertes-usage', 'alertes-suivi', 'alertes-guidelines', 'alertes-synthese'];
    const result = {};
    result._html = {};
    containers.forEach(id => {
        const el = documentShim.getElementById(id);
        result[id] = parseAlerts(el._html);
        result._html[id] = el._html || '';
    });
    result._notFoundMeds = notFound;
    result._rawScores = (documentShim.getElementById('alertes-scores')._html || '');
    return result;
}

module.exports = { analyzeCase, loadApp };

// CLI : node oracle_harness.js '<json-case>'
if (require.main === module) {
    const arg = process.argv[2];
    const testCase = arg ? JSON.parse(arg) : { age: 78, sexe: 'M', dfg: 45, comorbs: ['PAT_006', 'PAT_016b'], meds: ['Warfarine', 'Bisoprolol', 'Propranolol'], bio: { inr: 3.2 } };
    const out = analyzeCase(testCase);
    console.log(JSON.stringify(out, null, 2));
}
