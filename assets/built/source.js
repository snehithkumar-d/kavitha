/* =========================================================================
   kavitha — source.js
   Vanilla JS bundle. ES2020. No dependencies.
   v0.1.0 ships this hand-written; v0.2+ builds it from src/js/*.js via esbuild.

   Inline theme/accent bootstrap lives in default.hbs <head> (one inline
   script — see loophole #11). Everything else is here.
   ======================================================================== */

(function () {
    'use strict';

    var doc = document.documentElement;
    var STORAGE_KEY = 'kavitha-theme';

    /* ---------------------------------------------------------------------
       Theme toggle
       --------------------------------------------------------------------- */

    function currentTheme() {
        var explicit = doc.getAttribute('data-theme');
        if (explicit === 'light' || explicit === 'dark') return explicit;
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }

    function setTheme(next) {
        if (next !== 'light' && next !== 'dark') return;
        doc.setAttribute('data-theme', next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode */ }
    }

    function toggleTheme() {
        setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    }

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
        btn.addEventListener('click', toggleTheme);
    });

    /* React to OS-level theme changes when the user hasn't explicitly chosen.
       (When localStorage has a value, that wins.) */
    if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        var listener = function () {
            try {
                if (localStorage.getItem(STORAGE_KEY)) return;
            } catch (e) { /* fall through */ }
            doc.removeAttribute('data-theme');
        };
        if (mq.addEventListener) mq.addEventListener('change', listener);
        else if (mq.addListener) mq.addListener(listener);
    }


    /* ---------------------------------------------------------------------
       Lexical toggle cards (.kg-toggle-card)
       Click the heading to open/close. The card ships data-kg-toggle-state.
       --------------------------------------------------------------------- */

    document.querySelectorAll('.kg-toggle-card').forEach(function (card) {
        var heading = card.querySelector('.kg-toggle-heading');
        if (!heading) return;
        heading.addEventListener('click', function () {
            var open = card.getAttribute('data-kg-toggle-state') === 'open';
            card.setAttribute('data-kg-toggle-state', open ? 'close' : 'open');
        });
    });


    /* ---------------------------------------------------------------------
       Mobile nav (placeholder hook)
       The current header is responsive without a hamburger; if we add one
       later, wire it here.
       --------------------------------------------------------------------- */

    /* (no-op for v0.1.0) */


    /* ---------------------------------------------------------------------
       Keyboard shortcut: '/' opens search modal (Sodo Search)
       --------------------------------------------------------------------- */

    document.addEventListener('keydown', function (e) {
        if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
        var tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
        var trigger = document.querySelector('[data-ghost-search]');
        if (trigger) {
            e.preventDefault();
            trigger.click();
        }
    });

})();
