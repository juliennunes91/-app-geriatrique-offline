// Service Worker - GeriaAssist v0.43
const CACHE_NAME = 'geriaassist-v43';
const ASSETS = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    './lib/bootstrap.min.css',
    './lib/bootstrap.bundle.min.js',
    './lib/html2pdf.bundle.min.js',
    './app_core.js',
    './app_ui.js',
    './app_analysis.js',
    './app_legend.js',
    './drug_classes.js',
    './geria_engine_v2.js',
    './geria_database.js',
    './geria_db_enrichment.js',
    './geria_pathology_rules_v3.js',
    './geria_recos_final.js',
    './geria_integration_module.js',
    './child_pugh_adaptations.js',
    './ansm_ddi_data.js',
    './ddi_merged_V2.js',
    './gpt_ddi_data_filtered.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
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
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./offline.html');
                }
            })
    );
});
