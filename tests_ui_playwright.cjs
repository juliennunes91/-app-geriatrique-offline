#!/usr/bin/env node
/* ============================================================================
 * tests_ui_playwright.cjs — Tests de la couche RENDU / PDF / MASQUAGE / BADGES.
 *
 * Le harness Node (oracle_harness) ne peut PAS tester cette couche : son
 * document-shim ne sait pas exécuter querySelectorAll('.alert:not(.alert-light)')
 * ni simuler les clics/CSS. Ces bugs ne se voient qu'en VRAI navigateur :
 *   - masquer une alerte (✖) doit la retirer du DOM ET du PDF (bug mémoïsation) ;
 *   - le compteur d'onglet doit égaler le nombre d'alertes rendues (bug off-by-one) ;
 *   - les 2 UIs se chargent sans erreur JS.
 *
 * Autonome (file://, pas de serveur). À lancer manuellement / en CI navigateur :
 *     node tests_ui_playwright.cjs
 * Skippe proprement (exit 0) si Playwright/Chromium absents (env Node minimal).
 * ========================================================================== */
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
const path = require('path');

let chromium;
try {
    chromium = require(require.resolve('playwright', { paths: ['/opt/node22/lib/node_modules', process.cwd()] })).chromium;
} catch (e) {
    console.log('⏭️  Playwright indisponible — tests UI navigateur SKIPPÉS (env Node minimal).');
    process.exit(0);
}
const CHROME = '/opt/pw-browsers/chromium';
const fileUrl = f => 'file://' + path.join(__dirname, f);

let passed = 0, failed = 0;
const ok = (name, cond, detail) => { if (cond) { passed++; console.log('  ✅ ' + name); } else { failed++; console.log('  ❌ ' + name + (detail ? ' — ' + detail : '')); } };

async function main() {
    const browser = await chromium.launch({ executablePath: CHROME });

    // ── Bloc 1 : chargement des 2 UIs sans erreur JS (hors Tailwind CDN offline) ──
    for (const file of ['index.html', 'index_modern.html']) {
        const page = await browser.newPage();
        const errs = [];
        page.on('pageerror', e => { if (!/tailwind/i.test(e.message)) errs.push(e.message); });
        await page.goto(fileUrl(file), { waitUntil: 'load', timeout: 60000 });
        await page.waitForFunction(() => typeof analyserPrescription === 'function' && typeof MASTER_DB !== 'undefined', { timeout: 30000 }).catch(() => {});
        const ready = await page.evaluate(() => typeof analyserPrescription === 'function' && typeof MASTER_DB !== 'undefined');
        ok(`Chargement ${file} sans erreur JS`, ready && errs.length === 0, errs.slice(0, 2).join(' | '));
        await page.close();
    }

    // ── Bloc 2 : rendu + masquage (DOM & PDF) + badges — sur index.html ──
    const page = await browser.newPage();
    await page.goto(fileUrl('index.html'), { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => typeof analyserPrescription === 'function' && typeof MASTER_DB !== 'undefined', { timeout: 30000 });

    const r = await page.evaluate(() => {
        const add = dci => { const m = MASTER_DB.MEDICAMENTS.find(x => sanitizeText(x.dci) === sanitizeText(dci)); if (m && !activeMeds.some(a => a.dci === m.dci)) activeMeds.push({ dci: m.dci, classe: m.classe, label: m.dci, core_id: sanitizeText(m.dci), albumine: 0, db_ref: m }); };
        document.getElementById('patientAge').value = '82';
        document.getElementById('patientDFG').value = '35';
        add('Spironolactone'); add('Ramipril'); add('Ibuprofene'); add('Diazepam');
        if (typeof activeComorbs !== 'undefined') activeComorbs.push('PAT_006');
        window.geriaPrefs = window.geriaPrefs || {}; window.geriaPrefs.skipMaskConfirm = true;
        analyserPrescription();

        const out = {};
        const evEl = document.getElementById('alertes-eviter');
        out.rendersAlerts = evEl.querySelectorAll('.alert:not(.alert-light)').length > 0;

        // Badge de l'onglet Éviter == nb d'alertes actionnables rendues
        const evBtn = document.querySelector('#myTab .nav-link[data-bs-target="#tab-eviter"]');
        const badge = evBtn && evBtn.querySelector('.tab-counter');
        out.badgeVal = badge ? parseInt(badge.textContent, 10) : 0;
        out.actionnables = evEl.querySelectorAll('.alert.alert-danger, .alert.alert-warning, .alert.alert-success').length;

        // Masquage : PDF + DOM contiennent une alerte, puis clic ✖.
        // Titre tronqué AVANT tout caractère spécial (<,>,&) car ils sont encodés
        // dans le HTML/PDF (« < » → « &lt; ») ; on compare sur le texte sans balises.
        const strip = h => h.replace(/<[^>]+>/g, ' ');
        const before = strip(buildPdfContent());
        const btn = evEl.querySelector('[onclick*="maskGeriaAlert"]');
        const rawTitle = btn ? (btn.closest('.alert').querySelector('strong')?.textContent || '') : '';
        const title = rawTitle.replace(/^[^A-Za-zÀ-ÿ]+/, '').split(/[<>&]/)[0].trim().slice(0, 22);
        out.domBefore = !!title && evEl.textContent.includes(title);
        out.pdfBefore = !!title && before.includes(title);
        if (btn) btn.click();  // → maskGeriaAlert → analyserPrescription
        const after = strip(buildPdfContent());
        out.domAfter = !!title && document.getElementById('alertes-eviter').textContent.includes(title);
        out.pdfAfter = !!title && after.includes(title);
        out.title = title;

        // Reset patient purge les alertes masquées
        resetPatient();
        out.maskClearedAfterReset = !window._maskedAlerts || window._maskedAlerts.size === 0;
        return out;
    });

    ok('Rendu — l\'analyse produit des alertes', r.rendersAlerts);
    ok('Badge — compteur onglet Éviter = alertes actionnables rendues', r.badgeVal === r.actionnables, `badge=${r.badgeVal} vs rendu=${r.actionnables}`);
    ok('Masquage — alerte présente au départ (DOM + PDF)', r.domBefore && r.pdfBefore, `"${r.title}" dom=${r.domBefore} pdf=${r.pdfBefore}`);
    ok('Masquage — clic ✖ retire l\'alerte du DOM', !r.domAfter);
    ok('Masquage — clic ✖ retire l\'alerte du PDF', !r.pdfAfter);
    ok('Reset — purge les alertes masquées', r.maskClearedAfterReset);

    await page.close();
    await browser.close();

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Tests UI (navigateur) : ${passed} passed, ${failed} failed, ${passed + failed} total`);
    console.log('='.repeat(50));
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('Erreur harness UI :', e.message); process.exit(1); });
