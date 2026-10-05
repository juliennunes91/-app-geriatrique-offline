// Configuration Tailwind de l'interface moderne — source UNIQUE (elle vivait en ligne
// dans index_modern.html, compilée à chaque ouverture par cdn.tailwindcss.com).
// Compilée par tools/build_modern_offline.cjs vers lib/tailwind-modern.css.
const path = require('path');
const R = path.resolve(__dirname, '..');
module.exports = Object.assign({
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#00151b",
                "primary-container": "#002b36",
                "on-primary": "#ffffff",
                "on-primary-container": "#cae8f2",
                "secondary": "#00677d",
                "secondary-container": "#50d9fe",
                "on-secondary": "#ffffff",
                "on-secondary-container": "#001f27",
                "secondary-fixed": "#b3ebff",
                "on-secondary-fixed": "#001f27",
                "surface": "#f7f9fb",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f2f4f6",
                "surface-container": "#eceef0",
                "surface-container-high": "#e6e8ea",
                "surface-container-highest": "#e0e3e5",
                "on-surface": "#191c1e",
                "on-surface-variant": "#41484b",
                "error": "#ba1a1a",
                "error-container": "#ffdad6",
                "on-error": "#ffffff",
                "on-error-container": "#93000a",
                "outline": "#71787b",
                "outline-variant": "#c1c7cb",
                "tertiary": "#230b00",
                "tertiary-container": "#3d1f0b",
                "on-tertiary": "#ffffff",
                "on-tertiary-container": "#ffe1ce"
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px"
            },
            fontFamily: {
                headline: ["Manrope", "sans-serif"],
                body: ["Inter", "sans-serif"],
                label: ["Inter", "sans-serif"]
            }
        }
    }
}, {
    // La page, et les scripts qui fabriquent du HTML pour elle.
    content: [path.join(R, 'index_modern.html'), path.join(R, '*.js')]
});
