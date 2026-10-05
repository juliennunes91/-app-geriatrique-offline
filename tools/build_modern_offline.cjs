// Construit les ressources LOCALES de l'interface moderne (index_modern.html), qui
// dépendait de trois ressources en ligne : Tailwind (cdn.tailwindcss.com, compilé dans le
// navigateur) et Google Fonts (Manrope, Inter, Material Symbols). Un établissement qui
// bloque ces domaines — ou une ouverture en file:// sans réseau — lui faisait perdre toute
// mise en page, et les icônes s'affichaient comme des mots (« settings », « print »).
//
//   1. lib/fonts-modern.css — polices EMBARQUÉES en base64 (une police chargée par url()
//      depuis file:// n'est pas garantie selon le navigateur). Manrope et Inter : sous-
//      ensemble « latin » seulement (il couvre le français, œ et guillemets compris).
//      Material Symbols : réduit aux SEULES icônes employées par index_modern.html
//      (paramètre icon_names de Google Fonts) — quelques Ko au lieu de plusieurs Mo.
//   2. lib/tailwind-modern.css — Tailwind 3.4 compilé avec tools/tailwind.modern.config.cjs
//      (la configuration qui vivait en ligne dans la page), sur index_modern.html et les
//      scripts qui fabriquent du HTML.
//
// Usage (poste de développement, réseau requis) : node tools/build_modern_offline.cjs
// À relancer après tout ajout d'une classe Tailwind ou d'une icône dans index_modern.html —
// un test le signale (classe ou icône absente des fichiers générés).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const R = path.resolve(__dirname, '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const get = (url, binaire) => execFileSync('curl', ['-sSL', '--fail', '-A', UA, url], { encoding: binaire ? 'buffer' : 'utf8', maxBuffer: 64 << 20 });

function iconesEmployees() {
    const h = fs.readFileSync(path.join(R, 'index_modern.html'), 'utf8');
    const re = /<span[^>]*class="[^"]*material-symbols-outlined[^"]*"[^>]*>\s*([a-z_0-9]+)\s*<\/span>/g;
    const s = new Set(); let m;
    while ((m = re.exec(h))) s.add(m[1]);
    return [...s].sort();
}

function policesEmbarquees() {
    const icones = iconesEmployees();
    const feuilles = [
        // Polices variables : une seule fonte par famille couvre toutes les graisses.
        { url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&family=Inter:wght@300..600&display=swap', latinSeul: true },
        { url: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300,0..1,0&icon_names=${icones.join(',')}`, latinSeul: false }
    ];
    let css = `/* Fichier GÉNÉRÉ par tools/build_modern_offline.cjs — ne pas éditer.\n   Polices : Manrope, Inter (SIL Open Font License 1.1), Material Symbols Outlined (Apache 2.0), via Google Fonts.\n   Icônes embarquées : ${icones.join(', ')} */\n`;
    for (const f of feuilles) {
        const src = get(f.url);
        // Google précède chaque @font-face d'un commentaire nommant son sous-ensemble
        // (« /* latin */ ») ; Material Symbols n'en a pas.
        const blocs = (/\/\*/.test(src) ? src.split(/(?=\/\*)/) : src.split(/(?=@font-face)/)).filter(b => /@font-face/.test(b));
        for (const b of blocs) {
            const sousEnsemble = (/\/\*\s*([^*]+?)\s*\*\//.exec(b) || [])[1] || '';
            if (f.latinSeul && sousEnsemble !== 'latin') continue;
            const corps = b.replace(/\/\*[^*]*\*\//, '').trim();
            css += corps.replace(/url\((https:[^)]+)\)/g, (_, u) => `url(data:font/woff2;base64,${get(u, true).toString('base64')})`) + '\n';
        }
    }
    fs.writeFileSync(path.join(R, 'lib/fonts-modern.css'), css);
    console.log('lib/fonts-modern.css', (css.length / 1024).toFixed(0), 'Ko —', icones.length, 'icônes');
}

function tailwind() {
    // Tailwind n'est PAS une dépendance du dépôt : npx récupère la version figée.
    execFileSync('npx', ['-y', 'tailwindcss@3.4.19', '-c', path.join(R, 'tools/tailwind.modern.config.cjs'),
        '-o', path.join(R, 'lib/tailwind-modern.css'), '--minify'], { cwd: R, stdio: 'inherit' });
    const css = fs.readFileSync(path.join(R, 'lib/tailwind-modern.css'), 'utf8');
    fs.writeFileSync(path.join(R, 'lib/tailwind-modern.css'), '/* Fichier GÉNÉRÉ par tools/build_modern_offline.cjs (Tailwind CSS 3.4.19, MIT) — ne pas éditer. */\n' + css);
    console.log('lib/tailwind-modern.css', (css.length / 1024).toFixed(0), 'Ko');
}

policesEmbarquees();
tailwind();
