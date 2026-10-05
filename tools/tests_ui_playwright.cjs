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

    // Un dossier précédent ne doit pas fuiter d'un cas au suivant. Les champs laissés
    // en place sont le piège : `bioDate` gardait la valeur du cas précédent, et le test
    // « aucune date n'est fabriquée » passait pour faux alors que le code était bon.
    document.querySelectorAll('input[type=checkbox]').forEach(e => { e.checked = false; });
    Object.values(BIO_IDS).forEach(id => setVal(id, ''));
    setVal('bioDate', '');
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
// L'amlodipine est là pour EV_SF02b, qui exige deux molécules hypotensantes ou
// orthostatiques : c'est cette règle qui fournit le « point de méthode » dont on
// vérifie l'attribution.
const DOSSIER = {
    age: 85, sexe: 'F', dfg: 88,
    comorbs: ['PAT_010'], flags: ['chkDemence'], meds: ['Cyamemazine', 'Amlodipine']
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

        const dossierDate = { ...DOSSIER, bio: { creat: 101, bioDate: '2026-08-12' } };
        const avecDate = enTexte((await jouer(dossierDate)).html);
        const sansDate = enTexte((await jouer({ ...DOSSIER, bio: { creat: 101 } })).html);

        test('Le rapport dit de quand datent les valeurs biologiques', () => {
            // Sans elle, « créatinine 126 µmol/L » se lit pareil qu'il s'agisse du
            // prélèvement de la veille ou de celui du trimestre dernier — et c'est ce
            // qui décide si le tiers qui lit doit agir sur le chiffre ou le refaire.
            ok(/Bilan biologique du 12\/08\/2026/.test(avecDate),
                'la date de prélèvement figure en tête de rapport');
            ok(/dernier bilan le 12\/08\/2026/.test(avecDate),
                'et sous « Plan biologique », où elle sert à prescrire le suivant');
            // Elle ne doit pas se confondre avec la date du RAPPORT, en haut à droite.
            const auj = new Date().toLocaleDateString('fr-FR');
            ok(avecDate.includes(auj), 'la date du rapport reste présente, distincte');
            ok(!/Bilan biologique du ' + auj/.test(avecDate), 'les deux ne sont pas confondues');
        });

        test('Une date de bilan absente est DITE, jamais inventée', () => {
            ok(!/Bilan biologique du/.test(sansDate), 'aucune date n\'est fabriquée');
            ok(/date du dernier bilan non renseignée/i.test(sansDate),
                'le lecteur doit distinguer « pas de date » de « pas de bilan »');
        });

        // ── Deux défauts d'ÉTAT D'INTERFACE, hors de portée du harnais Node ──────────
        const etat = await page.evaluate(() => {
            const r = {};
            resetPatient();
            document.getElementById('patientAge').value = 87;
            document.getElementById('patientDFG').value = 85;
            // Chemin « liste déroulante » : la cascade coche la case correspondante.
            selectComorb('PAT_043');
            r.apresAjout = { comorbs: [...activeComorbs], caseCochee: document.getElementById('chkMci').checked };
            analyserPrescription();
            removeComorb('PAT_043');
            r.apresRetrait = { comorbs: [...activeComorbs], caseCochee: document.getElementById('chkMci').checked };
            analyserPrescription();
            r.apresSecondeAnalyse = [...activeComorbs];
            r.aliasIntact = (PatientState._internals.comorbs === activeComorbs);

            // Aller-retour JSON avec une précision saisie.
            resetPatient();
            const m = MASTER_DB.MEDICAMENTS.find(x => sanitizeText(x.dci) === 'macrogol');
            activeMeds.push({ dci: m.dci, classe: m.classe, label: m.dci, core_id: 'macrogol',
                albumine: 0, db_ref: m, precisions: { indication_peg: 'preparation_colique' } });
            const json = JSON.parse(JSON.stringify(_collectPatientData()));
            r.exporte = json.meds[0].precisions || null;
            _restorePatientData(json);
            r.restaure = (activeMeds[0] || {}).precisions || null;
            return r;
        });

        test('Une comorbidité retirée ne revient pas à l\'analyse suivante', () => {
            ok(etat.apresAjout.caseCochee, 'préalable : le choix par la liste coche la case');
            ok(etat.apresRetrait.comorbs.length === 0, 'le retrait vide bien activeComorbs');
            ok(etat.apresRetrait.caseCochee === false,
                'la case qui déclare la pathologie est décochée — un retour visible, pas un registre caché');
            ok(etat.apresSecondeAnalyse.length === 0,
                `la comorbidité est repoussée par la case restée cochée : ${JSON.stringify(etat.apresSecondeAnalyse)}`);
            ok(etat.aliasIntact,
                'le retrait se fait EN PLACE : remplacer le tableau rompait l\'alias de patient_state.js');
        });

        test('Une précision survit à l\'aller-retour JSON', () => {
            // `precisions` distingue le méthotrexate hebdomadaire de l'oncologique, le
            // macrogol de la préparation colique : perdue, l'application retombe sur la
            // forme la plus exposante ou réarme une règle qu'une précision désarmait.
            ok(etat.exporte && etat.exporte.indication_peg === 'preparation_colique',
                `la précision est écrite dans l'export : ${JSON.stringify(etat.exporte)}`);
            ok(etat.restaure && etat.restaure.indication_peg === 'preparation_colique',
                `et relue à l'import : ${JSON.stringify(etat.restaure)}`);
        });

        // ── Assumer en masse, et interaction assumée dans le PDF ─────────────────────
        const masse = await page.evaluate(() => {
            const r = {};
            resetPatient();
            document.getElementById('patientAge').value = 96;
            document.getElementById('patientDFG').value = 37;
            document.getElementById('chkChutes').checked = true;
            const parDci = {}; MASTER_DB.MEDICAMENTS.forEach(m => { parDci[sanitizeText(m.dci)] = m; });
            ['Levothyroxine', 'Pantoprazole', 'Zopiclone', 'Escitalopram', 'Acide acetylsalicylique'].forEach(n => {
                const m = parDci[sanitizeText(n)];
                activeMeds.push({ dci: m.dci, classe: m.classe, label: m.dci, core_id: sanitizeText(m.dci), albumine: 0, db_ref: m });
            });
            _lastAnalysisHash = null; analyserPrescription();
            const barre = document.querySelector('#alertes-eviter .geria-assumer-masse button');
            r.barre = barre ? barre.textContent : null;
            const n = _alertesAssumables('alertes-eviter').length;
            r.candidates = n;
            justifyGeriaAlertsEnMasse('alertes-eviter');
            const modal = document.getElementById('geriaJustifyOverlay');
            const cases = [...modal.querySelectorAll('input[type=checkbox]')];
            r.aucuneCocheeDavance = cases.every(c => !c.checked);
            cases[0].checked = true; cases[0].dispatchEvent(new Event('change'));   // « tout cocher »
            modal.querySelector('textarea').value = 'Décision collégiale du 28/09';
            [...modal.querySelectorAll('button')].find(b => /Assumer la sélection/.test(b.textContent)).click();
            r.assumees = window._justifiedAlerts.size;
            r.motifsIdentiques = [...window._justifiedAlerts.values()].every(v => v.motif === 'Décision collégiale du 28/09');
            r.pdf = buildPdfContent();
            // Interaction critique assumée : hors des « critiques » du rapport.
            const btn = [...document.querySelectorAll('#alertes-interact button[onclick*="justifyGeriaAlert("]')]
                .find(b => /LEVOTHYROXINE/.test(b.getAttribute('onclick')));
            const m = btn && btn.getAttribute('onclick').match(/justifyGeriaAlert\('((?:[^'\\]|\\.)*)'/);
            r.cleInteraction = m ? m[1].replace(/\\(.)/g, '$1') : null;
            if (r.cleInteraction) window._justifiedAlerts.set(r.cleInteraction, { motif: 'Prises espacées, TSH stable', date: '2026-09-28' });
            _lastAnalysisHash = null; analyserPrescription();
            r.pdfInteraction = buildPdfContent();
            return r;
        });
        const pdfMasse = enTexte(masse.pdf), pdfInter = enTexte(masse.pdfInteraction);

        test('On peut assumer plusieurs alertes d\'un coup, avec un motif commun', () => {
            ok(masse.barre && /Assumer plusieurs/.test(masse.barre), `la barre est posée dans l'onglet : ${masse.barre}`);
            ok(masse.candidates >= 2, `au moins deux candidates : ${masse.candidates}`);
            ok(masse.aucuneCocheeDavance, 'rien n\'est coché d\'avance — assumer reste une décision');
            ok(masse.assumees === masse.candidates, `toutes les cochées sont assumées : ${masse.assumees}/${masse.candidates}`);
            ok(masse.motifsIdentiques, 'le motif commun est porté par chacune');
            const occ = (pdfMasse.match(/Décision collégiale du 28\/09/g) || []).length;
            ok(occ === 1, `le rapport écrit le motif commun UNE fois, pas ${occ}`);
        });

        test('Une interaction assumée quitte « Interactions critiques » du PDF, avec son motif', () => {
            ok(masse.cleInteraction, 'préalable : la carte lévothyroxine porte un bouton « assumer »');
            const crit = (pdfInter.match(/Interactions critiques[\s\S]{0,400}/) || [''])[0];
            ok(!/LEVOTHYROXINE ↔ PANTOPRAZOLE/.test(crit), 'la paire n\'est plus listée parmi les critiques');
            ok(/Interactions assumées par le prescripteur[\s\S]{0,200}LEVOTHYROXINE ↔ PANTOPRAZOLE[\s\S]{0,60}TSH stable/.test(pdfInter),
                'elle figure au relevé des interactions assumées, avec le motif');
        });

        const dopa = await page.evaluate(() => {
            resetPatient();
            const m = MASTER_DB.MEDICAMENTS.find(x => x.dci === 'Levodopa');
            activeMeds.push({ dci: m.dci, classe: m.classe, label: m.label || m.dci, core_id: 'levodopa', albumine: 0, db_ref: m });
            openMedPrecisionModal('Levodopa', { force: true });
            const sel = [...document.querySelectorAll('#medPrecisionOverlay select')];
            const opts = sel.length ? [...sel[0].options].map(o => o.textContent) : [];
            if (typeof closeMedPrecisionModal === 'function') closeMedPrecisionModal();
            return opts;
        });
        test('La saisie d\'une lévodopa propose le type d\'association', () => {
            ok(dopa.length >= 7, `options proposées : ${dopa.length}`);
            ok(dopa.some(o => /bensérazide/.test(o)) && dopa.some(o => /entacapone \(Stalevo\)/.test(o)),
                `Modopar et Stalevo figurent parmi les choix : ${dopa.join(' | ')}`);
        });

        // Import d'un bilan PDF : un compte rendu FICTIF est imprimé en PDF par Chromium,
        // puis relu par pdf.js dans l'application — le chemin réel, worker compris.
        const os = require('os');
        const cr = await nav.newPage();
        const cell = (x, y, s) => `<span style="position:absolute;left:${x}px;top:${y}px;">${s}</span>`;
        await cr.setContent(`<html><body style="font:12px Arial;position:relative;">${[
            cell(30, 20, 'M. Patient FICTIF'), cell(30, 40, 'Date de naissance'), cell(160, 40, '03−04−1945'), cell(240, 40, '(81 ans) Sexe : F'),
            cell(30, 60, 'Prélevé le 02−09−2026 à 08:30'),
            cell(420, 100, '(13,0−18,0)'), cell(540, 100, '9,3'),
            cell(30, 114, 'Hémoglobine'), cell(320, 114, '11,4'), cell(360, 114, 'g/dl'),
            cell(30, 140, 'Créatinine'), cell(320, 140, '13,6'), cell(360, 140, 'mg/L'), cell(420, 140, '(6,7−11,8)'),
            cell(30, 166, 'Sodium sérique'), cell(320, 166, '133'), cell(360, 166, 'mmol/L'),
            cell(30, 192, 'Magnésium'), cell(320, 192, '0,8'), cell(360, 192, 'mmol/kg')
        ].join('')}</body></html>`);
        const pdfFictif = path.join(os.tmpdir(), `bilan_fictif_${process.pid}.pdf`);
        fs.writeFileSync(pdfFictif, await cr.pdf({ format: 'A4' }));
        await cr.close();
        await page.evaluate(() => { resetPatient(); document.getElementById('patientSexe').value = 'M'; document.getElementById('patientAge').value = '80'; });
        await page.setInputFiles('#bioImportFile', pdfFictif);
        await page.waitForSelector('#bioImportAppliquer', { timeout: 20000 });
        const apercu = await page.evaluate(() => {
            const d = document.getElementById('bioImportDialog');
            const coche = t => { const tr = [...d.querySelectorAll('tr')].find(r => r.textContent.includes(t)); const c = tr && tr.querySelector('input'); return c ? { coche: c.checked, actif: !c.disabled } : null; };
            return { texte: d.textContent, mg: coche('Magnésium'), hb: coche('Hémoglobine') };
        });
        await page.click('#bioImportAppliquer');
        const importe = await page.evaluate(() => ({
            hb: document.getElementById('bioHb').value, creat: document.getElementById('bioCreat').value,
            na: document.getElementById('patientNa').value, mg: document.getElementById('bioMg').value,
            date: document.getElementById('bioDate').value, sexe: document.getElementById('patientSexe').value,
            age: document.getElementById('patientAge').value
        }));
        fs.unlinkSync(pdfFictif);
        test('Un bilan PDF s\'importe : résultat du jour, unité convertie, aperçu avant application', () => {
            ok(/Diffère de la saisie actuelle/.test(apercu.texte), 'l\'écart d\'identité (F 81 ans / M 80 ans) est signalé');
            ok(apercu.hb && apercu.hb.coche, 'l\'hémoglobine est proposée cochée');
            ok(apercu.mg && !apercu.mg.actif, 'une unité inconnue (mmol/kg) n\'est pas applicable');
            ok(importe.hb === '11.4', `résultat du jour, pas l'antériorité : ${importe.hb}`);
            ok(importe.creat === '120', `créatinine 13,6 mg/L convertie en µmol/L : ${importe.creat}`);
            ok(importe.na === '133', `natrémie : ${importe.na}`);
            ok(importe.mg === '', `magnésium non appliqué : ${importe.mg}`);
            ok(importe.date === '2026-09-02', `date de prélèvement : ${importe.date}`);
            ok(importe.sexe === 'F' && importe.age === '81', `identité appliquée : ${importe.sexe} ${importe.age}`);
        });

        // ── Imports en file://, réseau coupé ─────────────────────────────────────────
        // Ouverte depuis un disque ou un partage d'établissement, l'application est en
        // file:// : Chrome y refuse fetch(), import() et new Worker(fichier). L'OCR et
        // l'import PDF doivent fonctionner quand même, SANS aucune requête hors du disque.
        // Le second passage simule un navigateur sans WebAssembly SIMD.
        const ordo = path.join(os.tmpdir(), `ordo_fictive_${process.pid}.png`);
        const pdfF = path.join(os.tmpdir(), `bilan_fictif2_${process.pid}.pdf`);
        {
            const p = await nav.newPage();
            await p.setContent('<div style="font:28px Arial;padding:30px;background:#fff;">ORDONNANCE<br>Amlodipine 5 mg 1 cp le matin<br>Furosemide 40 mg 1 cp/j</div>');
            await p.screenshot({ path: ordo });
            await p.setContent(`<body style="font:12px Arial;position:relative;">${cell(30, 20, 'Prélevé le 02−09−2026')}${cell(30, 60, 'Hémoglobine')}${cell(320, 60, '11,4')}${cell(360, 60, 'g/dl')}</body>`);
            fs.writeFileSync(pdfF, await p.pdf({ format: 'A4' }));
            await p.close();
        }
        const horsLigne = async (simd) => {
            const ctx = await nav.newContext();
            const externes = [];
            await ctx.route('**/*', r => { const u = r.request().url(); if (/^(file|data|blob):/.test(u)) return r.continue(); externes.push(u); return r.abort(); });
            if (!simd) await ctx.addInitScript(() => { WebAssembly.validate = () => false; });
            const p = await ctx.newPage();
            const errs = []; p.on('pageerror', e => errs.push(e.message));
            await p.goto('file://' + path.join(RACINE, 'index.html'));
            await p.evaluate(() => ocrOpenModal());
            await p.setInputFiles('#ocrFileInput', ordo);
            let st = {}; const t0 = Date.now();
            while (Date.now() - t0 < 90000) {
                st = await p.evaluate(() => ({ etat: document.getElementById('ocrProgressText').textContent, meds: document.getElementById('ocrMedList').textContent }));
                if (/Erreur/.test(st.etat) || st.meds) break;
                await p.waitForTimeout(500);
            }
            await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => { m.classList.remove('show'); m.style.display = 'none'; }); document.querySelectorAll('.modal-backdrop').forEach(b => b.remove()); });
            await p.setInputFiles('#bioImportFile', pdfF);
            await p.waitForSelector('#bioImportDialog', { timeout: 30000 }).catch(() => {});
            const pdf = await p.evaluate(() => { const d = document.getElementById('bioImportDialog'); return d ? d.textContent : ''; });
            await ctx.close();
            return { st, pdf, externes, errs };
        };
        const avecSimd = await horsLigne(true);
        const sansSimd = await horsLigne(false);
        fs.unlinkSync(ordo); fs.unlinkSync(pdfF);
        for (const [nom, r] of [['avec SIMD', avecSimd], ['sans SIMD', sansSimd]]) {
            test(`OCR et import PDF fonctionnent en file://, sans réseau (${nom})`, () => {
                ok(/Amlodipine/.test(r.st.meds) && /Furosemide/.test(r.st.meds), `OCR : ${r.st.etat} | ${r.st.meds}`);
                ok(/Hémoglobine/.test(r.pdf) && /11,4/.test(r.pdf), `import PDF : ${r.pdf.slice(0, 160)}`);
                ok(r.externes.length === 0, `aucune requête hors du disque : ${r.externes.join(' ; ')}`);
                ok(r.errs.length === 0, `aucune erreur JavaScript : ${r.errs.join(' | ')}`);
            });
        }

        // « Nouveau patient » : le dossier précédent ne doit rien laisser à l'écran.
        const apresReset = await page.evaluate(() => {
            resetPatient();
            const m = MASTER_DB.MEDICAMENTS.find(x => x.dci === 'Cyamemazine');
            activeMeds.push({ dci: m.dci, classe: m.classe, label: m.dci, core_id: 'cyamemazine', albumine: 0, db_ref: m });
            document.getElementById('extractorText').value = 'Texte libre du patient précédent';
            document.getElementById('freeTextNote').value = 'Commentaire du patient précédent';
            document.getElementById('chkArthrose').checked = true;
            _lastAnalysisHash = null; analyserPrescription();
            const avant = (document.getElementById('alertes-synthese').textContent || '').length;
            resetPatient();
            return {
                avant,
                synthese: document.getElementById('alertes-synthese').textContent,
                texte: document.getElementById('extractorText').value,
                note: document.getElementById('freeTextNote').value,
                arthrose: document.getElementById('chkArthrose').checked,
                meds: activeMeds.length
            };
        });
        test('« Nouveau patient » efface la synthèse, le texte libre et le commentaire', () => {
            ok(apresReset.avant > 50, `préalable : une synthèse était affichée (${apresReset.avant} caractères)`);
            ok(!/CYAMEMAZINE|Cyamemazine/i.test(apresReset.synthese), `la synthèse du patient précédent a disparu : ${apresReset.synthese.slice(0, 120)}`);
            ok(apresReset.texte === '' && apresReset.note === '', 'texte libre et commentaire vidés');
            ok(!apresReset.arthrose && apresReset.meds === 0, 'cases et ordonnance remises à zéro');
        });

        // Interface moderne en file://, réseau coupé : mise en page, polices et icônes locales.
        {
            const ctx = await nav.newContext();
            const externes = [];
            await ctx.route('**/*', r => { const u = r.request().url(); if (/^(file|data|blob):/.test(u)) return r.continue(); externes.push(u); return r.abort(); });
            const p = await ctx.newPage();
            const errs = []; p.on('pageerror', e => errs.push(e.message));
            await p.goto('file://' + path.join(RACINE, 'index_modern.html'));
            await p.evaluate(() => document.fonts.ready);
            const m = await p.evaluate(() => ({
                fond: getComputedStyle(document.body).backgroundColor,
                icones: document.fonts.check('22px "Material Symbols Outlined"'),
                titres: document.fonts.check('16px Manrope'),
                // Une icône rendue par la police a la largeur d'un glyphe, pas d'un mot.
                largeurIcone: (() => { const s = [...document.querySelectorAll('.material-symbols-outlined')].find(x => x.textContent.trim() === 'settings'); return s ? s.getBoundingClientRect().width : -1; })()
            }));
            await ctx.close();
            test('L\'interface moderne est entièrement locale (file://, sans réseau)', () => {
                ok(externes.length === 0, `aucune requête hors du disque : ${externes.join(' ; ')}`);
                ok(m.fond === 'rgb(247, 249, 251)', `Tailwind compilé appliqué (fond « surface ») : ${m.fond}`);
                ok(m.icones && m.titres, `polices embarquées chargées : icônes ${m.icones}, Manrope ${m.titres}`);
                ok(m.largeurIcone > 0 && m.largeurIcone < 40, `l'icône « settings » est un glyphe, pas un mot : ${m.largeurIcone}px`);
                ok(errs.length === 0, `aucune erreur JavaScript : ${errs.join(' | ')}`);
            });
        }

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
