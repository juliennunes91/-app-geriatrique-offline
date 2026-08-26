/* ============================================================================
 * app_update.js — Mise à jour depuis le logiciel
 *
 * GeriaAssist est une application HORS LIGNE : une fois installée, elle ne
 * rappelle jamais le serveur. C'est sa raison d'être, et c'est aussi ce qui
 * faisait qu'un utilisateur pouvait travailler des mois sur une version périmée
 * sans le savoir — la bannière « nouvelle version disponible » n'apparaissait
 * que si le navigateur décidait de lui-même de revérifier `sw.js`.
 *
 * Ce module rend la vérification EXPLICITE et son résultat LISIBLE :
 *   - la version installée et l'identifiant de build sont affichés ;
 *   - un bouton déclenche `registration.update()`, qui refetche `sw.js` ;
 *   - les quatre issues sont distinguées et nommées : à jour / mise à jour prête
 *     / pas de réseau / navigateur sans service worker (coquille Android).
 *
 * Aucune vérification automatique au démarrage : l'application est utilisée en
 * EHPAD sur des réseaux capricieux, et un appel réseau silencieux à l'ouverture
 * n'apporterait qu'un délai et un risque d'erreur trompeuse. C'est l'utilisateur
 * qui demande.
 * ============================================================================ */
(function () {
    'use strict';

    // Couleurs posées EN LIGNE, jamais par classe : l'UI classique est en Bootstrap,
    // l'UI moderne en Tailwind. Écrire `text-success` dans les deux laissait le message
    // sans couleur dans l'une des deux — et un statut de mise à jour incolore se lit
    // exactement comme un statut neutre.
    const ETATS = {
        inconnu:  { icone: '',   couleur: '#5a636c' },
        verif:    { icone: '⏳', couleur: '#5a636c' },
        ajour:    { icone: '✅', couleur: '#198754' },
        prete:    { icone: '⬆️', couleur: '#0d6efd' },
        horsligne:{ icone: '📴', couleur: '#b8860b' },
        native:   { icone: '📱', couleur: '#5a636c' },
        erreur:   { icone: '⚠️', couleur: '#dc3545' }
    };
    const GRIS = '#8a939c';

    // URL des versions publiées — la coquille Android se met à jour par là.
    const URL_RELEASES = 'https://github.com/juliennunes91/-app-geriatrique-offline/releases';

    function _versionAffichee() {
        const el = document.getElementById('appVersion');
        return el ? String(el.textContent || '').trim() : '';
    }

    function _estCoquilleNative() {
        return /GeriaAssistApp\//.test(navigator.userAgent || '');
    }

    function _setEtat(etat, message, actionHtml) {
        const zone = document.getElementById('majStatut');
        if (!zone) return;
        const e = ETATS[etat] || ETATS.inconnu;
        zone.style.color = e.couleur;   // les classes de mise en page de l'UI restent
        zone.innerHTML = (e.icone ? e.icone + ' ' : '') + message + (actionHtml || '');
    }

    function _setBouton(actif, libelle) {
        const b = document.getElementById('btnVerifierMaj');
        if (!b) return;
        b.disabled = !actif;
        if (libelle) b.textContent = libelle;
    }

    // Identifiant de build du service worker ACTIF (celui qui sert réellement les
    // fichiers). Le numéro de version du pied de page dit ce que le code annonce ;
    // le build dit ce que le cache contient. Les deux peuvent diverger le temps
    // d'un rechargement — c'est précisément ce qu'on veut pouvoir constater.
    function _buildActif() {
        return new Promise(resolve => {
            const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
            if (!sw || typeof MessageChannel === 'undefined') return resolve('');
            let repondu = false;
            const canal = new MessageChannel();
            canal.port1.onmessage = ev => {
                repondu = true;
                resolve((ev.data && ev.data.buildId) || '');
            };
            try { sw.postMessage('CHECK_UPDATE', [canal.port2]); }
            catch (e) { return resolve(''); }
            // Un service worker qui ne répond pas ne doit pas figer l'interface.
            setTimeout(() => { if (!repondu) resolve(''); }, 1500);
        });
    }

    // Un service worker fraîchement découvert est encore en TÉLÉCHARGEMENT : son
    // `install` récupère la totalité des fichiers (plusieurs mégaoctets de base de
    // médicaments). Proposer « Redémarrer » à cet instant est un piège — le
    // rechargement serait servi par l'ANCIEN worker, l'utilisateur retrouverait sa
    // version précédente et croirait la mise à jour faite. On n'ouvre donc le
    // redémarrage qu'une fois l'installation terminée.
    const _PRETS = ['installed', 'activated', 'activating'];
    function _proposerRedemarrage() {
        _setEtat('prete',
            'Nouvelle version installée. '
            + '<a href="#" onclick="geriaAppliquerMaj();return false;" style="font-weight:700;">Redémarrer pour l\'appliquer</a>.');
    }
    function _suivreInstallation(worker) {
        if (!worker) return false;
        if (_PRETS.indexOf(worker.state) >= 0) { _proposerRedemarrage(); return true; }
        _setEtat('verif', 'Téléchargement de la nouvelle version… (l\'application reste utilisable)');
        worker.addEventListener('statechange', () => {
            if (_PRETS.indexOf(worker.state) >= 0) _proposerRedemarrage();
            else if (worker.state === 'redundant') {
                _setEtat('erreur', 'Le téléchargement de la mise à jour a échoué. Réessayez une fois la connexion stable.');
            }
        });
        return true;
    }

    function _appliquer() {
        // Le nouveau service worker s'active de lui-même (skipWaiting dans install),
        // mais la page en cours exécute toujours l'ANCIEN JavaScript, déjà en mémoire.
        // Seul un rechargement bascule réellement sur la nouvelle version.
        location.reload();
    }
    window.geriaAppliquerMaj = _appliquer;

    async function verifierMiseAJour() {
        const zone = document.getElementById('majStatut');
        if (!zone) return;

        if (_estCoquilleNative()) {
            _setEtat('native',
                `Application Android : les mises à jour se téléchargent depuis la page des versions. `
                + `<a href="${URL_RELEASES}" target="_blank" rel="noopener">Ouvrir la page des versions</a>.`);
            return;
        }
        if (!('serviceWorker' in navigator)) {
            _setEtat('erreur', 'Ce navigateur ne gère pas la mise à jour hors ligne. Rechargez la page pour obtenir la dernière version.');
            return;
        }
        if (navigator.onLine === false) {
            _setEtat('horsligne', 'Pas de connexion : impossible de vérifier. L\'application continue de fonctionner hors ligne avec la version installée.');
            return;
        }

        _setBouton(false, 'Vérification…');
        _setEtat('verif', 'Recherche d\'une nouvelle version…');
        try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (!reg) {
                _setEtat('erreur', 'Aucun service de mise à jour enregistré. Rechargez la page une fois en ligne.');
                return;
            }
            const avant = await _buildActif();
            // update() refetche sw.js en contournant le cache HTTP (l'enregistrement
            // pose updateViaCache:'none'). S'il diffère, le navigateur installe.
            await reg.update();
            // Laisser à l'installation le temps de démarrer avant de conclure.
            await new Promise(r => setTimeout(r, 900));
            if (_suivreInstallation(reg.installing || reg.waiting)) return;
            const apres = await _buildActif();
            if (avant && apres && avant !== apres) { _proposerRedemarrage(); return; }
            _setEtat('ajour', 'Vous utilisez la dernière version'
                + (apres ? ` <span style="color:${GRIS};">(build ${apres})</span>` : '') + '.');
        } catch (e) {
            // Une coupure réseau pendant update() rejette : ce n'est pas une panne
            // de l'application, et le dire évite une inquiétude inutile.
            _setEtat('horsligne', 'Vérification impossible (réseau indisponible). La version installée reste utilisable hors ligne.');
        } finally {
            _setBouton(true, 'Vérifier les mises à jour');
        }
    }
    window.verifierMiseAJour = verifierMiseAJour;

    // Affichage initial : version installée, sans aucun appel réseau.
    async function _initAffichage() {
        const zone = document.getElementById('majStatut');
        if (!zone) return;
        const v = _versionAffichee();
        if (_estCoquilleNative()) {
            _setEtat('native', `Version ${v || '—'} — application Android, mise à jour par la page des versions.`);
            return;
        }
        // Au tout premier chargement, le service worker ne contrôle pas encore la
        // page : sans cette attente, le build ne s'afficherait jamais la première fois.
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            try { await Promise.race([navigator.serviceWorker.ready, new Promise(r => setTimeout(r, 2500))]); }
            catch (e) { /* pas de service worker : on affichera la version seule */ }
        }
        const build = await _buildActif();
        _setEtat('inconnu', `Version ${v || '—'}${build ? ` <span style="color:${GRIS};">(build ${build})</span>` : ''}.`);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _initAffichage);
    else _initAffichage();
})();
