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


    /* ---------------------------------------------------------------------
       Copy-to-clipboard on code blocks (.post-body pre)
       --------------------------------------------------------------------- */

    document.querySelectorAll('.post-body pre').forEach(function (pre) {
        if (pre.querySelector('.code-copy')) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'code-copy';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
        btn.textContent = 'Copy';
        pre.appendChild(btn);
        btn.addEventListener('click', function () {
            var code = pre.querySelector('code') || pre;
            var text = code.innerText;
            var done = function (ok) {
                btn.textContent = ok ? 'Copied' : 'Failed';
                setTimeout(function () { btn.textContent = 'Copy'; }, 1800);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
            } else {
                done(false);
            }
        });
    });


    /* ---------------------------------------------------------------------
       Share-link copy button (data-share-copy in partials/share-buttons.hbs)
       --------------------------------------------------------------------- */

    document.querySelectorAll('[data-share-copy]').forEach(function (btn) {
        var status = btn.querySelector('[data-share-status]');
        var url = btn.getAttribute('data-url') || window.location.href;
        btn.addEventListener('click', function () {
            var done = function (ok) {
                if (status) status.textContent = ok ? 'Copied' : 'Failed';
                setTimeout(function () { if (status) status.textContent = 'Copy link'; }, 1800);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
            } else {
                done(false);
            }
        });
    });


    /* ---------------------------------------------------------------------
       Scroll progress bar — only animates on post templates.
       Uses CSS scroll-timeline where supported (browsers w/ animation-timeline:
       scroll()). Falls back to this rAF listener everywhere else.
       --------------------------------------------------------------------- */

    var bar = document.querySelector('.scroll-progress-bar');
    var isPost = document.body.classList.contains('post-template') ||
                 document.body.classList.contains('page-template-post-project');
    if (bar && isPost) {
        // Feature-detect CSS scroll-timeline. If supported, screen.css drives the
        // animation and we skip the JS path.
        var supportsScrollTimeline = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline: scroll()');
        if (!supportsScrollTimeline) {
            var ticking = false;
            var update = function () {
                var h = document.documentElement;
                var max = h.scrollHeight - h.clientHeight;
                var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
                bar.style.width = pct + '%';
                ticking = false;
            };
            window.addEventListener('scroll', function () {
                if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
            }, { passive: true });
            update();
        }
    }

})();
