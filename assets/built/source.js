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
        document.dispatchEvent(new CustomEvent('kavitha:theme-changed', { detail: { theme: next } }));
    }

    function toggleTheme() {
        setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    }

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
        btn.addEventListener('click', toggleTheme);
    });


    /* ---------------------------------------------------------------------
       Accent color toggle — two named presets (teal, terracotta).
       Persisted in localStorage; bootstrap script in default.hbs hydrates
       it before first paint to prevent FOUC. This script wires the click
       handlers and updates the active-swatch indicator.
       --------------------------------------------------------------------- */

    var ACCENT_KEY = 'kavitha-accent';
    var ACCENT_PRESETS = { teal: '#1e6b6b', terracotta: '#c15f3c' };

    function applyAccent(name) {
        var hex = ACCENT_PRESETS[name];
        if (!hex) return;
        doc.style.setProperty('--ghost-accent-color', hex);
        doc.style.setProperty('--accent', hex);
        var r = parseInt(hex.substr(1, 2), 16);
        var g = parseInt(hex.substr(3, 2), 16);
        var b = parseInt(hex.substr(5, 2), 16);
        var lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        doc.style.setProperty('--accent-text', lum > 0.55 ? '#0a0b0d' : '#ffffff');
        try { localStorage.setItem(ACCENT_KEY, name); } catch (e) { /* private mode */ }
        markActiveAccentSwatch(name);
    }

    function markActiveAccentSwatch(name) {
        document.querySelectorAll('.accent-swatch[data-accent]').forEach(function (b) {
            b.setAttribute('aria-pressed', b.getAttribute('data-accent') === name ? 'true' : 'false');
        });
    }

    document.querySelectorAll('.accent-swatch[data-accent]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            applyAccent(btn.getAttribute('data-accent'));
        });
    });

    /* Initial swatch state — match whichever accent the bootstrap settled on. */
    try {
        var storedAccent = localStorage.getItem(ACCENT_KEY);
        if (storedAccent && ACCENT_PRESETS[storedAccent]) {
            markActiveAccentSwatch(storedAccent);
        } else {
            var current = getComputedStyle(doc).getPropertyValue('--accent').trim().toLowerCase();
            markActiveAccentSwatch(current === '#c15f3c' ? 'terracotta' : 'teal');
        }
    } catch (e) { /* fall through */ }


    /* ---------------------------------------------------------------------
       Active nav marker — sets aria-current="page" on the nav link whose
       href matches the current URL path. CSS adds the `>` prompt prefix
       and ink-color via [aria-current="page"].
       --------------------------------------------------------------------- */

    var navLinks = Array.from(document.querySelectorAll('.site-nav-list a'));
    var marked = false;
    navLinks.forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href) return;
        var path = location.pathname;
        var normPath = path.replace(/\/$/, '') || '/';
        var normHref = href.replace(/\/$/, '') || '/';
        var matches = normHref === normPath
            || (normHref !== '/' && normPath.indexOf(normHref + '/') === 0);
        if (matches) {
            a.setAttribute('aria-current', 'page');
            marked = true;
        }
    });
    // Fallback: if no link matched (e.g. user is on /blog/ but their admin nav
    // doesn't include a /blog/ entry), mark the first link so the > prompt
    // still appears somewhere instead of leaving the nav looking "dead".
    if (!marked && navLinks.length) navLinks[0].setAttribute('aria-current', 'page');

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
       Code blocks — language label, copy button, mermaid diagrams.

       Pre/code rendering pipeline:
         1. Tag each .post-body pre with the resolved language (from the
            <code class="language-foo">). Used by CSS for the corner label.
         2. Inject the copy button (always visible on the dark code surface,
            unlike the prose-image hover behaviour).
         3. If any code blocks declare language-mermaid, lazy-import Mermaid
            from a CDN and replace those blocks with rendered SVG. Failure
            leaves the original <pre> in place with a small caption.
       --------------------------------------------------------------------- */

    var codeBlocks = Array.from(document.querySelectorAll('.post-body pre'));
    var mermaidBlocks = [];

    codeBlocks.forEach(function (pre) {
        var code = pre.querySelector('code');
        var lang = '';
        if (code) {
            var match = (code.className || '').match(/language-([\w-]+)/);
            if (match) lang = match[1].toLowerCase();
        }

        if (lang === 'mermaid') {
            mermaidBlocks.push({ pre: pre, source: (code || pre).textContent });
            return;
        }

        if (lang) pre.setAttribute('data-lang', lang);

        if (pre.querySelector('.code-copy')) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'code-copy';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
        btn.textContent = 'Copy';
        pre.appendChild(btn);
        btn.addEventListener('click', function () {
            var src = pre.querySelector('code') || pre;
            var text = src.innerText;
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
       Mermaid diagrams — lazy import only when at least one block exists.
       Theme-aware: re-renders when the user toggles dark/light.
       --------------------------------------------------------------------- */

    function currentMermaidTheme() {
        return doc.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
    }

    var mermaidLib = null;
    var mermaidNodes = [];

    function renderMermaid(lib, theme) {
        lib.initialize({ startOnLoad: false, theme: theme, securityLevel: 'strict', fontFamily: 'inherit' });
        mermaidNodes.forEach(function (entry, idx) {
            var id = 'kavitha-mermaid-' + idx + '-' + Date.now();
            lib.render(id, entry.source).then(function (result) {
                entry.host.innerHTML = result.svg;
            }).catch(function (err) {
                entry.host.innerHTML = '';
                var fallback = document.createElement('pre');
                fallback.className = 'mermaid-error';
                fallback.textContent = entry.source;
                var caption = document.createElement('span');
                caption.className = 'mermaid-error-caption';
                caption.textContent = 'Diagram failed to parse: ' + (err && err.message ? err.message : 'unknown error');
                entry.host.appendChild(caption);
                entry.host.appendChild(fallback);
            });
        });
    }

    if (mermaidBlocks.length) {
        mermaidBlocks.forEach(function (block) {
            var host = document.createElement('div');
            host.className = 'mermaid-diagram';
            block.pre.replaceWith(host);
            mermaidNodes.push({ host: host, source: block.source });
        });

        import('https://cdn.jsdelivr.net/npm/mermaid@10.9.1/+esm').then(function (mod) {
            mermaidLib = mod.default;
            renderMermaid(mermaidLib, currentMermaidTheme());
        }).catch(function () {
            mermaidNodes.forEach(function (entry) {
                entry.host.textContent = entry.source;
                entry.host.classList.add('mermaid-error');
            });
        });

        document.addEventListener('kavitha:theme-changed', function () {
            if (mermaidLib) renderMermaid(mermaidLib, currentMermaidTheme());
        });
    }


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
