// Construit les fichiers OCR « embarqués » : moteur, worker et modèle français chargés par
// de simples balises <script>, sans fetch ni worker lancé depuis une URL de fichier.
//
// Pourquoi : ouvert en file:// (double-clic sur index.html, partage réseau d'un
// établissement), Chrome refuse fetch(), import() et new Worker(fichier). L'OCR échouait
// donc à la première étape (« URL scheme file is not supported »). Une balise <script>
// classique, elle, se charge en file://. On y place :
//   - le code du worker Tesseract et celui du moteur, sous forme de FONCTIONS dont
//     ocr_module.js relit le texte (Function.prototype.toString) pour fabriquer un worker
//     en mémoire (blob:) — le worker trouve TesseractCore déjà défini et ne télécharge rien ;
//   - le modèle français, en base64, passé au worker sous forme d'octets ({code, data}).
//
// Sources (entrées de construction seulement, jamais servies) : tools/vendor/tesseract/
// tesseract-worker.min.js, tesseract-core-simd.wasm.js, tesseract-core.wasm.js
// (Tesseract.js 5.1.1, moteur WASM embarqué en base64) et fra.traineddata.gz. Usage : node tools/build_ocr_offline.cjs
const fs = require('fs');
const path = require('path');
const R = path.resolve(__dirname, '..');
const lire = f => fs.readFileSync(path.join(R, f), 'utf8');
const ENTETE = '// Fichier GÉNÉRÉ par tools/build_ocr_offline.cjs — ne pas éditer.\n';
// Défaut de Tesseract.js 5.1.1 : à l'initialisation, une langue fournie en octets
// ({code, data}) est désignée par `data` au lieu de `code` — le moteur cherche alors un
// fichier nommé « 31,139,8,… » et échoue (« couldn't load any languages »). Le chargement,
// lui, écrit bien le fichier sous `code`. Correction ciblée, motif vérifié unique.
const DEFAUT_LANGUE = 'return"string"==typeof t?t:t.data})).join("+")';
let worker = lire('tools/vendor/tesseract/tesseract-worker.min.js');
if (worker.split(DEFAUT_LANGUE).length !== 2) throw new Error('motif Tesseract introuvable : version changée ? revoir la correction');
worker = worker.replace(DEFAUT_LANGUE, 'return"string"==typeof t?t:t.code})).join("+")');
const sorties = {
    'lib/ocr/tesseract-worker.inline.js':
        `${ENTETE}window.__GERIA_TESS_WORKER = function () {\n${worker}\n};\n`,
    'lib/ocr/tesseract-core-simd.inline.js':
        `${ENTETE}window.__GERIA_TESS_CORE_SIMD = function () {\n${lire('tools/vendor/tesseract/tesseract-core-simd.wasm.js')}\nself.TesseractCore = TesseractCore;\n};\n`,
    'lib/ocr/tesseract-core.inline.js':
        `${ENTETE}window.__GERIA_TESS_CORE = function () {\n${lire('tools/vendor/tesseract/tesseract-core.wasm.js')}\nself.TesseractCore = TesseractCore;\n};\n`,
    'lib/ocr/fra.traineddata.inline.js':
        `${ENTETE}window.__GERIA_TESS_FRA = "${fs.readFileSync(path.join(R, 'tools/vendor/tesseract/fra.traineddata.gz')).toString('base64')}";\n`
};
fs.mkdirSync(path.join(R, 'lib/ocr'), { recursive: true });
for (const [f, txt] of Object.entries(sorties)) {
    fs.writeFileSync(path.join(R, f), txt);
    console.log(f, (txt.length / 1e6).toFixed(2), 'Mo');
}
