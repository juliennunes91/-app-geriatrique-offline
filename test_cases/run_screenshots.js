#!/usr/bin/env node
// Génère screenshots pour les 12 cas patients via Playwright headless.
// Capture : page complète + zones header / biologie / alertes / synthèse.
// Sortie : test_cases/screenshots/<id>_<ui>_<zone>.png

process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { chromium } = require(require.resolve('playwright', { paths: ['/opt/node22/lib/node_modules'] }));
const path = require('path');
const fs = require('fs');
const http = require('http');
const handler = require('serve-handler');

function staticHandler(req, res) {
    return handler(req, res, { public: ROOT, cleanUrls: false, trailingSlash: false });
}

const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const CAS = JSON.parse(fs.readFileSync(path.join(__dirname, 'cas_patients.json'), 'utf-8'));

const UI_VARIANTS = [
    { name: 'classic', file: '/index.html' }
    // modern requires Tailwind CDN (offline timeout) — exclu temporairement
];

const TABS = ['synthese', 'eviter', 'initier', 'interact', 'bio', 'scores'];

// ─── Mapping bio JSON → IDs HTML ───
const BIO_MAP = {
    creat: 'bioCreat', dfg: 'patientDFG', k: 'patientK', na: 'patientNa',
    hb: 'bioHb', hba1c: 'bioHba1c', inr: 'bioInr', qtc: 'bioQtc',
    plaq: 'bioPlaq', alat: 'bioAlat', asat: 'bioAsat', tsh: 'bioTsh',
    t4: 'bioT4', t3: 'bioT3', albumine_sg: 'bioAlbumSg', uree: 'bioUree',
    mg: 'bioMg', ca: 'bioCa', ca_corr: 'bioCa', uric: 'bioUric',
    fer: 'bioFer', cst: 'bioCst', b12: 'bioB12', b9: 'bioB9',
    vit_d: 'bioVitD', cpk: 'bioCpk', ldl: 'bioLdl', hdl: 'bioHdl',
    tg: 'bioTg', crp: 'bioCrp', gb: 'bioGb', pnn: 'bioPnn',
    gly: 'bioGly', bili: 'bioBili', phos: 'bioPhos', lact: 'bioLact',
    pct: 'bioPct', lithium: 'bioLithium', lipase: 'bioLipase',
    ddim: 'bioDdim', tropo: 'bioTropo', temp: 'bioTemp', bnp: 'bioBnp',
    pal: 'bioPal', ggt: 'bioGgt', prealb: 'bioPrealb', tp: 'bioTp',
    osm: 'bioOsm', chlore: 'bioChlore'
};

async function fillCase(page, cas) {
    // Bio
    await page.fill('#patientNom', cas.nom).catch(() => {});
    await page.fill('#patientAge', String(cas.age));
    await page.selectOption('#patientSexe', cas.sexe).catch(() => {});
    if (cas.poids) await page.fill('#patientPoids', String(cas.poids));

    for (const [key, val] of Object.entries(cas.bio || {})) {
        const id = BIO_MAP[key];
        if (!id) continue;
        await page.fill('#' + id, String(val)).catch(() => {});
    }

    // Trigger DFG recalc
    await page.evaluate(() => {
        if (typeof calculerDFG === 'function') calculerDFG(true);
    });

    // Comorbidités via checkboxes — chercher dynamiquement
    for (const c of (cas.comorbs || [])) {
        const found = await page.evaluate((label) => {
            const labels = Array.from(document.querySelectorAll('label'));
            const match = labels.find(l => l.textContent.toLowerCase().includes(label.toLowerCase()));
            if (match) {
                const id = match.getAttribute('for') || match.querySelector('input')?.id;
                const el = id ? document.getElementById(id) : match.querySelector('input');
                if (el && el.type === 'checkbox' && !el.checked) { el.click(); return id; }
            }
            return null;
        }, c);
    }

    // Médicaments via inputMed + ajout
    for (const med of (cas.meds || [])) {
        await page.fill('#inputMed', med).catch(() => {});
        await page.waitForTimeout(150);
        // Cliquer la 1ère suggestion ou submit
        const clicked = await page.evaluate(() => {
            const sugg = document.querySelector('.autocomplete-list li, [role="option"]');
            if (sugg) { sugg.click(); return true; }
            return false;
        });
        if (!clicked) {
            await page.press('#inputMed', 'Enter').catch(() => {});
        }
        await page.waitForTimeout(100);
    }

    // Lancer analyse via le bouton (préférable au call direct car certaines apps
    // dépendent de l'event handler pour init state)
    await page.click('#btnAnalyse').catch(async () => {
        await page.evaluate(() => {
            if (typeof analyserPrescription === 'function') analyserPrescription();
        });
    });
    await page.waitForTimeout(1500);

    // Scroller vers les alertes
    await page.evaluate(() => {
        const target = document.getElementById('alertes-synthese') ||
                       document.querySelector('.alert, [role="alert"]');
        if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(400);
}

async function capture(page, casId, uiName) {
    if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    const base = path.join(SCREENSHOTS_DIR, `${casId}_${uiName}`);

    await page.screenshot({ path: base + '_full.png', fullPage: true });

    // Capturer chaque tab : cliquer le bouton tab puis screenshot du contenu
    for (const tab of TABS) {
        const tabBtn = await page.$(`#tab-${tab}-btn, [data-bs-target="#tab-${tab}"], [aria-controls="tab-${tab}"]`);
        if (tabBtn) {
            await tabBtn.click().catch(() => {});
            await page.waitForTimeout(300);
            const content = await page.$(`#tab-${tab}, #alertes-${tab}`);
            if (content) {
                await content.screenshot({ path: `${base}_tab_${tab}.png` }).catch(() => {});
            }
        }
    }
}

async function evaluateAccessibility(page) {
    // Heuristiques WCAG 2.2 rapides
    return await page.evaluate(() => {
        const findings = [];

        // 1. Touch targets < 24×24
        const interactive = document.querySelectorAll('button, a, input, select, [onclick]');
        let smallTargets = 0;
        interactive.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24)) smallTargets++;
        });
        if (smallTargets > 0) findings.push({ type: 'small_targets', count: smallTargets });

        // 2. Images sans alt
        const imgsNoAlt = document.querySelectorAll('img:not([alt])').length;
        if (imgsNoAlt > 0) findings.push({ type: 'imgs_no_alt', count: imgsNoAlt });

        // 3. Inputs sans label associé
        let inputsNoLabel = 0;
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if (el.type === 'hidden') return;
            const id = el.id;
            if (!id) { inputsNoLabel++; return; }
            const lbl = document.querySelector(`label[for="${id}"]`);
            if (!lbl && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) inputsNoLabel++;
        });
        if (inputsNoLabel > 0) findings.push({ type: 'inputs_no_label', count: inputsNoLabel });

        // 4. Couleurs : alertes utilisant uniquement la couleur (red/orange/green sans texte/icône)
        let colorOnlyAlerts = 0;
        document.querySelectorAll('.alert, [role="alert"]').forEach(el => {
            const hasIcon = el.querySelector('i, svg, [class*="icon"], [class*="bi-"]') ||
                            /[🚨⚠️💡✅❌🔴🟠🟢]/u.test(el.textContent);
            const hasStrong = el.querySelector('strong, b') ||
                              /critique|important|attention|danger|alerte/i.test(el.textContent);
            if (!hasIcon && !hasStrong) colorOnlyAlerts++;
        });
        if (colorOnlyAlerts > 0) findings.push({ type: 'color_only_alerts', count: colorOnlyAlerts });

        // 5. Titres : ordre des h1→h6
        const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => parseInt(h.tagName[1]));
        let badHierarchy = 0;
        for (let i = 1; i < headings.length; i++) {
            if (headings[i] > headings[i-1] + 1) badHierarchy++;
        }
        if (badHierarchy > 0) findings.push({ type: 'heading_skip', count: badHierarchy });

        // 6. Boutons sans texte ni aria-label
        let buttonsNoLabel = 0;
        document.querySelectorAll('button').forEach(el => {
            const txt = (el.textContent || '').trim();
            const al = el.getAttribute('aria-label') || el.getAttribute('title');
            if (!txt && !al) buttonsNoLabel++;
        });
        if (buttonsNoLabel > 0) findings.push({ type: 'buttons_no_label', count: buttonsNoLabel });

        // 7. Largeur scroll horizontale ?
        const hasHorizScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth + 5;
        if (hasHorizScroll) findings.push({ type: 'horizontal_scroll', overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth });

        // 8. Alertes vides (rendues mais sans contenu)
        let emptyAlerts = 0;
        document.querySelectorAll('.alert, [role="alert"]').forEach(el => {
            if ((el.textContent || '').trim().length < 3) emptyAlerts++;
        });
        if (emptyAlerts > 0) findings.push({ type: 'empty_alerts', count: emptyAlerts });

        // 9. Doublons d'alertes affichées (signature texte normalisé)
        const alertSigs = new Map();
        document.querySelectorAll('.alert, [role="alert"]').forEach(el => {
            const sig = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 200);
            if (!sig) return;
            alertSigs.set(sig, (alertSigs.get(sig) || 0) + 1);
        });
        const visualDups = Array.from(alertSigs.entries()).filter(([, n]) => n > 1);
        if (visualDups.length > 0) findings.push({ type: 'visible_duplicate_alerts', count: visualDups.length, samples: visualDups.slice(0, 3).map(([s, n]) => `${n}x ${s.slice(0, 80)}`) });

        return findings;
    });
}

(async () => {
    // Lancer serveur statique
    const server = http.createServer(staticHandler);
    await new Promise(r => server.listen(0, r));
    const port = server.address().port;
    console.log('Server on port', port);

    const browser = await chromium.launch({
        executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    const allFindings = [];

    // Sélection ciblée — classic seulement (modern timeout Tailwind CDN)
    const SELECTED = (process.env.SCREENSHOT_CASES || 'C04,C07,C09,C10,C11,C12').split(',');
    const casList = CAS.filter(c => SELECTED.includes(c.id));
    for (const cas of casList) {
        for (const ui of UI_VARIANTS) {
            const url = `http://localhost:${port}${ui.file}`;
            console.log(`→ ${cas.id} (${ui.name})`);
            // Recréer page à chaque cas pour isoler crashes
            const ctx = await browser.newContext({
                viewport: { width: 1440, height: 1800 },
                bypassCSP: true,
                serviceWorkers: 'block'
            });
            const p = await ctx.newPage();
            p.on('pageerror', err => console.log('  [JS error]', err.message.slice(0, 120)));
            try {
                await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
                await p.waitForLoadState('load', { timeout: 20000 }).catch(() => {});
                await p.waitForTimeout(2000);
                await fillCase(p, cas);
                await capture(p, cas.id, ui.name);
                const findings = await evaluateAccessibility(p);
                allFindings.push({ cas: cas.id, ui: ui.name, findings });
            } catch (e) {
                console.error('  ERROR:', e.message.slice(0, 200));
                allFindings.push({ cas: cas.id, ui: ui.name, error: e.message.slice(0, 200) });
            } finally {
                await p.close().catch(() => {});
                await ctx.close().catch(() => {});
            }
        }
    }

    fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'a11y_findings.json'), JSON.stringify(allFindings, null, 2));
    console.log('\nFindings écrits dans test_cases/screenshots/a11y_findings.json');

    await browser.close();
    server.close();
})().catch(e => { console.error(e); process.exit(1); });
