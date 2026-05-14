// Service Worker - GeriaAssist v1.00 (Phase 48 — Cardio anti-arythmiques : Amiodarone (T½ 40-55j toxicité multiviscérale dysthyroïdie/PID/hépatite, CredibleMeds KR), Dronédarone (CI FA permanente PALLAS / IC NYHA III-IV ANDROMEDA / hépatotoxicité fatale FDA 2011), Flécaïnide & Propafénone (classe Ic — CAST trial CI cardiopathie structurelle), Disopyramide (PIM ABSOLU Beers — anticholinergique +++ + hypoglycémie insulino-sécrétagogue), Quinidine (le + pro-arythmique — CredibleMeds RE, thrombopénie immunoallergique, ↓ codéine/tramadol via CYP2D6))
// Version auto-incrémentée : modifier BUILD_ID à chaque déploiement
const BUILD_ID = '20260513-phase48-cardio-antiar';
const CACHE_NAME = `geriaassist-v100-${BUILD_ID}`;

// Fichiers applicatifs (cache-first, rarement modifiés)
const APP_ASSETS = [
    './',
    './index.html',
    './index_modern.html',
    './index_modern_V2.html',
    './offline.html',
    './manifest.json',
    './lib/bootstrap.min.css',
    './geria-theme.css',
    './geria-styles.css',
    './geria-shell.js',
    './lib/bootstrap.bundle.min.js',
    './lib/html2pdf.bundle.min.js',
    './lib/tesseract.min.js',
    './lib/tesseract-worker.min.js',
    './lib/tesseract-core-simd.wasm.js',
    './lib/tesseract-core.wasm.js',
    './lib/tessdata/fra.traineddata.gz',
    './ocr_module.js',
    './utils.js',
    './patient_state.js',
    './app_core.js',
    './app_ui.js',
    './app_analysis.js',
    './app_legend.js',
    './drug_classes.js',
    './geria_engine_v2.js',
    './child_pugh_adaptations.js'
];

// Fichiers de données (stale-while-revalidate, volumineux)
const DATA_ASSETS = [
    './geria_database.js',
    './geria_pathology_rules_v3.js',
    './geria_recos_final.js',
    './geria_integration_module.js',
    './ddi_general.js',
    './ddi_merged_V2.js'
];

const ALL_ASSETS = [...APP_ASSETS, ...DATA_ASSETS];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ALL_ASSETS))
            .then(() => self.skipWaiting())
            .catch(err => console.warn('SW cache install error:', err))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const isDataAsset = DATA_ASSETS.some(a => url.pathname.endsWith(a.replace('./', '/')));

    if (isDataAsset) {
        // Stale-while-revalidate pour les données volumineuses
        event.respondWith(
            caches.match(event.request).then(cached => {
                const fetchPromise = fetch(event.request).then(response => {
                    if (response && response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => cached);
                return cached || fetchPromise;
            })
        );
    } else {
        // Cache-first pour les fichiers applicatifs
        event.respondWith(
            caches.match(event.request)
                .then(cached => cached || fetch(event.request))
                .catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('./offline.html');
                    }
                })
        );
    }
});

// Notification de mise à jour disponible
self.addEventListener('message', event => {
    if (event.data === 'CHECK_UPDATE') {
        event.ports[0].postMessage({ version: CACHE_NAME, buildId: BUILD_ID });
    }
});
