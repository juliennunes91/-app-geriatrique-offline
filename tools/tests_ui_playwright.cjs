#!/usr/bin/env node
/**
 * tests_ui_playwright.cjs — ce que le harnais Node ne peut PAS atteindre.
 *
 * `oracle_harness.js` exécute `analyserPrescription()` dans un `vm` avec un shim de
 * DOM : il rend le HTML de chaque onglet, mais son `document.querySelectorAll()`
 * retourne `[]`. Or `buildPdfContent()` (app_core.js) est écrit CONTRE le DOM rendu —
 * il relit les cartes d'alerte, leur classe de sévérité, leur `<strong>`, leur clé de
 * masquage. Sous le harnais, le rapport sort donc VIDE et tous ses invariants passent
 * pour vrais : c'est un angle mort, et c'est exactement la zone qui a demandé le plus
 * de corrections de lisibilité (régimes de gravité, fusions, points de méthode,
 * prescriptions assumées).
 *
 * Ce fichier boote l'application réelle dans Chromium, injecte un dossier, appelle
 * `analyserPrescription()` puis `buildPdfContent()`, et vérifie le RAPPORT.
 *
 * Usage : node tools/tests_ui_playwright.cjs
 *
 * Playwright et Chromium ne sont pas des dépendances du dépôt (l'application est
 * hors ligne, sans build) : le test se déclare IGNORÉ, sans échouer, si le navigateur
 * est absent — il ne doit pas casser une machine où l'on ne fait que du JS.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');

// ── Playwright : résolution tolérante ────────────────────────────────────────
function chargerPlaywright() {
    const candidats = [
        'playwright',
        'playwright-core',
        '/opt/node22/lib/node_modules/playwright',
        path.join(RACINE, 'node_modules', 'playwright')
    ];
    for (const c of candidats) {
        try { return require(c); } catch (e) { /* suivant */ }
    }
    return null;
}

// ── Serveur statique local ───────────────────────────────────────────────────
// Le contenu doit être servi en http:// et non file:// — les modules et le
// service worker ne se chargent pas depuis le protocole fichier.
const MIME = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8', '.cjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2', '.wasm': 'application/wasm'
};

function demarrerServeur() {
    const srv = http.createServer((req, res) => {
        const rel = decodeURIComponent(String(req.url).split('?')[0]).replace(/^\/+/, '') || 'index.html';
        const abs = path.join(RACINE, rel);
        if (!abs.startsWith(RACINE)) { res.writeHead(403).end(); return; }
        fs.readFile(abs, (err, buf) => {
            if (err) { res.writeHead(404).end(); return; }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream' });
            res.end(buf);
        });
    });
    return new Promise(resolve => srv.listen(0, '127.0.0.1', () => resolve(srv)));
}

// ── Pilote de dossier, côté page ─────────────────────────────────────────────
// Même forme de `caseObj` que `analyzeCase()` du harnais Node, pour qu'un dossier
// écrit pour l'un se rejoue tel quel dans l'autre.
const BIO_INPUT_IDS = {
    k: 'patientK', na: 'patientNa', creat: 'bioCreat', dfg: 'patientDFG',
    hb: 'bioHb', vgm: 'bioVgm', crp: 'bioCrp', albumSg: 'bioAlbumSg', qtc: 'bioQtc'
};

function pilote(c, BIO_IDS) {
    const setVal = (id, v) => { const e = document.getElementById(id); if (e) e.value = String(v); };
    const setChk = (id, v) => { const e = document.getElementById(id); if (e) e.checked = !!v; };

    // Un dossier précédent ne doit pas fuiter d'un cas au suivant.
    document.querySelectorAll('input[type=checkbox]').forEach(e => { e.checked = false; });
    setVal('patientAge', c.age != null ? c.age : 80);
    setVal('patientSexe', c.sexe || 'F');
    if (c.poids != null) setVal('patientPoids', c.poids);
    if (c.dfg != null) setVal('patientDFG', c.dfg);
    if (c.cfs != null) setVal('scoreCFS', c.cfs);
    setChk('patientFragile', !!c.fragile);
    Object.entries(c.bio || {}).forEach(([k, v]) => setVal(BIO_IDS[k] || k, v));
    (c.flags || []).forEach(f => setChk(f, true));

    const parDci = {};
    MASTER_DB.MEDICAMENTS.forEach(m => { parDci[sanitizeText(m.dci)] = m; });
    activeMeds.length = 0;
    const introuvables = [];
    (c.meds || []).forEach(nom => {
        const m = parDci[sanitizeText(nom)];
        if (!m) { introuvables.push(nom); return; }
        activeMeds.push({
            dci: m.dci, classe: m.classe, label: m.dci, core_id: sanitizeText(m.dci),
            albumine: parseFloat(m.albumine) || 0, db_ref: m
        });
    });
    activeComorbs.length = 0;
    (c.comorbs || []).forEach(x => activeComorbs.push(x));
    window.suspendedMeds = [];
    window._maskedAlerts = new Set(c.masked || []);
    window._justifiedAlerts = new Map((c.assumees || []).map(
        e => (typeof e === 'string') ? [e, { motif: '', date: '' }]
            : [e.cle, { motif: e.motif || '', date: e.date || '' }]));
    _lastAnalysisHash = null; _lastAnalysisResult = null;

    analyserPrescription();
    return { html: buildPdfContent(), introuvables, ecran: (document.getElementById('alertes-eviter') || {}).innerHTML || '' };
}

// Le rapport en texte lisible : c'est ce que le destinataire lit.
function enTexte(html) {
    return String(html)
        .replace(/<style[\s\S]*?<\/style>/g, '')
        .replace(/<\/(div|p|li|tr)>/g, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
        .split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n');
}

// ── Micro-runner ─────────────────────────────────────────────────────────────
let passes = 0; const echecs = [];
function test(nom, fn) {
    try { fn(); passes++; console.log(`  ✓ ${nom}`); }
    catch (e) { echecs.push({ nom, msg: e.message }); console.log(`  ✗ ${nom}\n      ${e.message}`); }
}
function ok(cond, msg) { if (!cond) throw new Error(msg); }

// ── Dossier de référence ─────────────────────────────────────────────────────
// F 85 ans, syndrome démentiel, cyamémazine seule. Ce dossier réunit les quatre
// familles que le rapport doit savoir rendre : une contre-indication rouge, deux
// critères STOPP sur la même molécule (assumables), une consigne de surveillance
// informative dont le titre énumère cinq classes, et une pathologie « ombrelle »
// dont la nomenclature interne ne doit pas ressortir.
const DOSSIER = {
    age: 85, sexe: 'F', dfg: 88,
    comorbs: ['PAT_010'], flags: ['chkDemence'], meds: ['Cyamemazine']
};
const MOTIF = 'Seconde ligne après échec de la rispéridone.';

(async () => {
    const pw = chargerPlaywright();
    if (!pw) {
        console.log('⚠ Playwright absent — tests de rendu PDF IGNORÉS (npm i -D playwright).');
        process.exit(0);
    }
    let exe;
    try { exe = pw.chromium.executablePath(); } catch (e) { exe = null; }
    if (exe && !fs.existsSync(exe)) exe = null;
    if (!exe && !process.env.PLAYWRIGHT_CHROMIUM) {
        console.log('⚠ Chromium absent — tests de rendu PDF IGNORÉS (npx playwright install chromium).');
        process.exit(0);
    }

    const srv = await demarrerServeur();
    const base = `http://127.0.0.1:${srv.address().port}`;
    const nav = await pw.chromium.launch({
        executablePath: process.env.PLAYWRIGHT_CHROMIUM || exe,
        args: ['--no-sandbox']
    });
    let code = 0;
    try {
        const page = await nav.newPage();
        const erreurs = [];
        page.on('pageerror', e => erreurs.push(String(e.message)));
        await page.goto(`${base}/index.html`, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForFunction(
            () => typeof MASTER_DB !== 'undefined' && typeof buildPdfContent === 'function',
            null, { timeout: 30000 });

        const jouer = (c) => page.evaluate(
            ([cas, ids, src]) => (new Function('c', 'BIO_IDS', 'return (' + src + ')(c, BIO_IDS)'))(cas, ids),
            [c, BIO_INPUT_IDS, pilote.toString()]);

        console.log('\nRendu du rapport PDF (buildPdfContent, navigateur réel)\n');

        const brut = await jouer(DOSSIER);
        ok(brut.introuvables.length === 0, `médicament absent de la base : ${brut.introuvables}`);
        const rBrut = enTexte(brut.html);
        const assum = await jouer({ ...DOSSIER, assumees: [{ cle: 'id:EV_D21', motif: MOTIF }] });
        const rAssum = enTexte(assum.html);

        test('Le rapport n\'est pas vide — c\'est ce que le harnais Node ne peut pas voir', () => {
            ok(rBrut.length > 500, `rapport de ${rBrut.length} caractères`);
            ok(/Prescriptions inappropriées/.test(rBrut), 'la section des PIM est rendue');
        });

        test('Sans rien d\'assumé, aucun relevé « Assumé par le prescripteur »', () => {
            ok(!/Assumé par le prescripteur/.test(rBrut),
                'le relevé ne doit exister que s\'il a quelque chose à relever');
            ok(/Phénothiazine chez le sujet âgé/.test(rBrut),
                'l\'alerte est bien dans le corps de la section tant qu\'elle n\'est pas assumée');
        });

        test('Une alerte assumée quitte le corps de la section pour le relevé, avec son motif', () => {
            ok(/Assumé par le prescripteur \(1\)/.test(rAssum), 'le relevé est présent et compte 1 décision');
            const iSect = rAssum.indexOf('Prescriptions inappropriées');
            const iBloc = rAssum.indexOf('Assumé par le prescripteur');
            const iPheno = rAssum.indexOf('Phénothiazine chez le sujet âgé');
            ok(iBloc > iSect, 'le relevé est DANS la section, pas au-dessus du tableau de synthèse');
            ok(iPheno > iBloc, 'l\'entrée assumée est sous le relevé, plus dans le corps de la section');
            ok(rAssum.includes(MOTIF), 'le motif écrit par le prescripteur est reporté');
            // Le compteur du corps de section perd bien une entrée.
            const nb = (r) => (r.match(/Prescriptions inappropriées (\d+)/) || [])[1];
            ok(nb(rBrut) === nb(rAssum), 'le nombre d\'alertes analysées ne change pas — seule leur mise en scène change');
        });

        test('Aucun identifiant de règle ne parvient au destinataire', () => {
            // Le premier jet du relevé n'affichait que la CLÉ de masquage (« EV_D21 »),
            // muette pour un confrère qui n'a pas l'application sous les yeux.
            ok(!/\b(EV|IN|SUP|SYND|PAT)_[A-Z0-9]{2,}/.test(rAssum),
                `code interne dans le rapport : ${(rAssum.match(/\b(?:EV|IN|SUP|SYND|PAT)_[A-Z0-9]{2,}/) || [])[0]}`);
            ok(!/maskGeriaAlert|justifyGeriaAlert/.test(rAssum), 'aucun handler ne fuit dans le rapport');
        });

        test('« (Générique) » est une nomenclature interne — elle ne s\'imprime pas', () => {
            ok(!/\(Générique\)/i.test(rBrut) && !/\(Générique\)/i.test(rAssum),
                'l\'ombrelle ne doit pas nommer sa propre généricité dans le rapport');
            ok(/Syndrome Démentiel/i.test(rBrut), 'la pathologie est bien nommée, elle');
        });

        test('Un point de méthode qui énumère des classes dit laquelle concerne ce patient', () => {
            // EV_SF02b ouvre sur cinq classes ; quatre ne concernent pas cette patiente.
            // L'écran porte l'attribution, le rapport la perdait : la consigne sortait
            // du chapeau.
            ok(/Concerné chez ce patient/.test(brut.ecran),
                'préalable : l\'écran attribue bien la règle à la molécule');
            const m = rBrut.match(/Points de méthode[\s\S]{0,600}/);
            ok(m, 'le groupe « Points de méthode » est rendu');
            ok(/couché-debout/i.test(m[0]), 'la consigne de TA couché-debout y figure');
            ok(/couché-debout[^·\n]*CYAMEMAZINE/i.test(m[0]),
                `la molécule concernée n'est pas rattachée à la consigne :\n      ${m[0].split('\n').slice(0, 3).join(' / ')}`);
        });

        test('Le rapport ne lève aucune erreur JavaScript', () => {
            ok(erreurs.length === 0, `erreurs de page : ${erreurs.join(' | ')}`);
        });

    } catch (e) {
        console.log(`\n✗ Erreur d'exécution : ${e.stack || e.message}`);
        code = 1;
    } finally {
        await nav.close();
        srv.close();
    }

    console.log(`\n${passes} test(s) réussi(s), ${echecs.length} échec(s).`);
    process.exit(code || (echecs.length ? 1 : 0));
})();
