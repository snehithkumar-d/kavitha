/* =========================================================================
   kavitha — source.js
   Vanilla JS bundle. ES2020. No dependencies.
   v0.1.0 ships this hand-written; v0.2+ builds it from src/js/*.js via esbuild.

   Inline theme/accent bootstrap lives in default.hbs <head> (the only
   inline script the theme ships). Everything else is here.
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
        document.dispatchEvent(new CustomEvent('kavitha:accent-changed', { detail: { accent: name } }));
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
                btn.textContent = ok ? 'Copied' : 'Try again';
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
       - Theme-aware: re-renders when the user toggles dark/light.
       - Generation guard: rapid theme toggles can fire overlapping renders;
         each render bumps a counter so stale resolves are dropped (the
         host's data-gen attribute is the latest committed generation).
       - bindFunctions: invoked after innerHTML so clickable / linkable
         diagram nodes work.
       - Pan + zoom controls: a small toolbar overlays each rendered SVG
         with — / + / reset / fullscreen. Pure CSS transform; no extra
         lib. Each diagram tracks its own scale + translate locally.
       --------------------------------------------------------------------- */

    /* Mermaid theme — derive every variable from the live CSS custom props on
       :root so diagrams match the kavitha palette (mono font, ink + muted +
       accent only, no neon defaults) and auto-flip with light/dark. */
    function cssVar(name, fallback) {
        var v = getComputedStyle(doc).getPropertyValue(name).trim();
        return v || fallback;
    }

    function currentMermaidThemeVars() {
        var bg       = cssVar('--bg',        '#fbf9f4');
        var surface  = cssVar('--surface',   '#f4f1ea');
        var ink      = cssVar('--ink',       '#0a0b0d');
        var muted    = cssVar('--muted',     '#4a5562');
        var line     = cssVar('--line',      '#dcdacc');
        var lineBold = cssVar('--line-bold', '#2a2f37');
        var accent   = cssVar('--accent',    '#1e6b6b');
        return {
            background:           'transparent',
            primaryColor:         surface,
            primaryTextColor:     ink,
            primaryBorderColor:   lineBold,
            secondaryColor:       bg,
            secondaryTextColor:   ink,
            secondaryBorderColor: line,
            tertiaryColor:        bg,
            tertiaryTextColor:    ink,
            tertiaryBorderColor:  line,
            lineColor:            muted,
            textColor:            ink,
            mainBkg:              surface,
            nodeBorder:           lineBold,
            clusterBkg:           'transparent',
            clusterBorder:        line,
            defaultLinkColor:     muted,
            titleColor:           ink,
            edgeLabelBackground:  bg,
            nodeTextColor:        ink,
            fontFamily:           '"Geist Mono", ui-monospace, monospace',
            fontSize:             '13px',
            arrowheadColor:       muted,
            actorBorder:          lineBold,
            actorBkg:             surface,
            actorTextColor:       ink,
            actorLineColor:       muted,
            signalColor:          muted,
            signalTextColor:      ink,
            labelBoxBkgColor:     bg,
            labelBoxBorderColor:  line,
            labelTextColor:       ink,
            loopTextColor:        ink,
            noteBkgColor:         surface,
            noteTextColor:        ink,
            noteBorderColor:      line,
            activationBkgColor:   surface,
            activationBorderColor: line,
            sequenceNumberColor:  bg
        };
    }

    var mermaidLib = null;
    var mermaidNodes = [];
    var mermaidRenderGen = 0;

    function attachPanZoom(host) {
        var stage = host.querySelector('.mermaid-stage');
        if (!stage) return;
        var state = { scale: 1, x: 0, y: 0 };
        var apply = function () {
            stage.style.transform = 'translate(' + state.x + 'px, ' + state.y + 'px) scale(' + state.scale + ')';
        };
        host.querySelectorAll('[data-mermaid-action]').forEach(function (b) {
            b.addEventListener('click', function (e) {
                e.preventDefault();
                var action = b.getAttribute('data-mermaid-action');
                if (action === 'in')      state.scale = Math.min(state.scale * 1.25, 6);
                else if (action === 'out')  state.scale = Math.max(state.scale / 1.25, 0.4);
                else if (action === 'reset') { state.scale = 1; state.x = 0; state.y = 0; }
                else if (action === 'full') {
                    if (!document.fullscreenElement) {
                        if (host.requestFullscreen) host.requestFullscreen();
                    } else if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
                apply();
            });
        });

        // Drag to pan
        var dragging = false, lastX = 0, lastY = 0;
        stage.addEventListener('pointerdown', function (e) {
            dragging = true; lastX = e.clientX; lastY = e.clientY;
            stage.setPointerCapture(e.pointerId);
            stage.style.cursor = 'grabbing';
        });
        stage.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            state.x += e.clientX - lastX;
            state.y += e.clientY - lastY;
            lastX = e.clientX; lastY = e.clientY;
            apply();
        });
        stage.addEventListener('pointerup', function () {
            dragging = false; stage.style.cursor = 'grab';
        });

        // Wheel to zoom (Cmd/Ctrl + wheel only — never hijack page scroll).
        // Stash the latest state-mutator on the host and bind the wheel listener
        // exactly once per host, so re-renders (theme toggles) don't pile up
        // listeners. The closure captures the LATEST state via the host prop.
        host._kavithaZoomState = state;
        host._kavithaApply = apply;
        if (!host._kavithaWheelBound) {
            host._kavithaWheelBound = true;
            host.addEventListener('wheel', function (e) {
                if (!e.ctrlKey && !e.metaKey) return;
                e.preventDefault();
                var s = host._kavithaZoomState;
                if (!s) return;
                var delta = e.deltaY < 0 ? 1.1 : 1 / 1.1;
                s.scale = Math.max(0.4, Math.min(6, s.scale * delta));
                if (host._kavithaApply) host._kavithaApply();
            }, { passive: false });
        }
    }

    function renderMermaid(lib) {
        var gen = ++mermaidRenderGen;
        lib.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: currentMermaidThemeVars(),
            securityLevel: 'strict',
            fontFamily: '"Geist Mono", ui-monospace, monospace',
            flowchart: { curve: 'basis', padding: 16, nodeSpacing: 40, rankSpacing: 50, useMaxWidth: true },
            sequence: { useMaxWidth: true, mirrorActors: false, messageFontFamily: '"Geist Mono", ui-monospace, monospace' },
            gantt:    { useMaxWidth: true },
            er:       { useMaxWidth: true },
            journey:  { useMaxWidth: true }
        });
        mermaidNodes.forEach(function (entry, idx) {
            var id = 'kavitha-mermaid-' + idx + '-' + gen;
            lib.render(id, entry.source).then(function (result) {
                if (gen !== mermaidRenderGen) return; // stale; a newer render is in flight
                entry.host.innerHTML =
                    '<div class="mermaid-toolbar" role="group" aria-label="Diagram controls">' +
                        '<button type="button" data-mermaid-action="out" aria-label="Zoom out">−</button>' +
                        '<button type="button" data-mermaid-action="reset" aria-label="Reset view">⟲</button>' +
                        '<button type="button" data-mermaid-action="in" aria-label="Zoom in">+</button>' +
                        '<button type="button" data-mermaid-action="full" aria-label="Toggle fullscreen">⛶</button>' +
                    '</div>' +
                    '<div class="mermaid-stage">' + result.svg + '</div>';
                if (typeof result.bindFunctions === 'function') {
                    var stage = entry.host.querySelector('.mermaid-stage');
                    if (stage) result.bindFunctions(stage);
                }
                attachPanZoom(entry.host);
            }).catch(function (err) {
                if (gen !== mermaidRenderGen) return;
                entry.host.innerHTML = '';
                var caption = document.createElement('span');
                caption.className = 'mermaid-error-caption';
                caption.textContent = 'Diagram failed to parse: ' + (err && err.message ? err.message : 'unknown error');
                var fallback = document.createElement('pre');
                fallback.className = 'mermaid-error';
                fallback.textContent = entry.source;
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
            renderMermaid(mermaidLib);
        }).catch(function () {
            mermaidNodes.forEach(function (entry) {
                entry.host.textContent = entry.source;
                entry.host.classList.add('mermaid-error');
            });
        });

        // Theme toggle (dark/light) re-renders. Accent toggle does too —
        // colors are derived from --accent / --ink / --line / etc., so any
        // change to those should flow through.
        document.addEventListener('kavitha:theme-changed', function () {
            if (mermaidLib) renderMermaid(mermaidLib);
        });
        document.addEventListener('kavitha:accent-changed', function () {
            if (mermaidLib) renderMermaid(mermaidLib);
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
                if (status) status.textContent = ok ? 'Copied' : 'Try again';
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


    /* ---------------------------------------------------------------------
       Reading rail — sticky table-of-contents on the left of post pages.
       Resting state: a vertical column of small dashes, one per heading,
       active dash highlighted. Hover (or keyboard focus) expands the rail
       into a panel showing the full heading labels. Click a row to jump.
       Active heading tracked via IntersectionObserver as the reader scrolls.

       Visibility: post / project-post templates only, only when ≥2 headings,
       hidden on viewports <1280px (no room) and on print.
       --------------------------------------------------------------------- */

    (function buildReadingRail() {
        var isPost = document.body.classList.contains('post-template') ||
                     document.body.classList.contains('page-template-post-project');
        if (!isPost) return;

        var postBody = document.querySelector('.post-body');
        if (!postBody) return;

        var headings = Array.from(postBody.querySelectorAll('h2, h3'));
        if (headings.length < 2) return;

        var slugSeen = Object.create(null);
        function slugify(text) {
            var base = (text || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 60) || 'section';
            var slug = base, n = 1;
            while (slugSeen[slug] || (document.getElementById(slug) && document.getElementById(slug) !== headings.find(function (h) { return h.id === slug; }))) {
                slug = base + '-' + (++n);
            }
            slugSeen[slug] = true;
            return slug;
        }
        headings.forEach(function (h) {
            if (!h.id) h.id = slugify(h.textContent);
            else slugSeen[h.id] = true;
        });

        var rail = document.createElement('aside');
        rail.className = 'reading-rail';
        rail.setAttribute('aria-label', 'On this page');
        var list = document.createElement('ol');
        list.className = 'reading-rail-list';
        headings.forEach(function (h) {
            var item = document.createElement('li');
            item.className = 'reading-rail-item reading-rail-' + h.tagName.toLowerCase();
            var link = document.createElement('a');
            link.className = 'reading-rail-link';
            link.href = '#' + h.id;
            link.setAttribute('data-target', h.id);
            link.innerHTML =
                '<span class="reading-rail-dash" aria-hidden="true"></span>' +
                '<span class="reading-rail-label"></span>';
            link.querySelector('.reading-rail-label').textContent = h.textContent;
            item.appendChild(link);
            list.appendChild(item);
        });
        rail.appendChild(list);
        document.body.appendChild(rail);

        var prefersReducedMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        rail.addEventListener('click', function (e) {
            var link = e.target.closest('.reading-rail-link');
            if (!link) return;
            var id = link.getAttribute('data-target');
            var target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
            history.replaceState(null, '', '#' + id);
        });

        var visibleTops = new Map();
        var activeId = null;

        function setActive(id) {
            if (id === activeId) return;
            activeId = id;
            rail.querySelectorAll('.reading-rail-link').forEach(function (link) {
                if (link.getAttribute('data-target') === id) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }

        function pickActive() {
            if (visibleTops.size) {
                var topId = null, minTop = Infinity;
                visibleTops.forEach(function (top, id) {
                    if (top < minTop) { minTop = top; topId = id; }
                });
                if (topId) { setActive(topId); return; }
            }
            // Nothing intersecting — find the last heading scrolled past
            var passed = null;
            for (var i = 0; i < headings.length; i++) {
                if (headings[i].getBoundingClientRect().top < 120) passed = headings[i].id;
                else break;
            }
            if (passed) setActive(passed);
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    visibleTops.set(entry.target.id, entry.boundingClientRect.top);
                } else {
                    visibleTops.delete(entry.target.id);
                }
            });
            pickActive();
        }, { rootMargin: '-80px 0px -65% 0px', threshold: 0 });

        headings.forEach(function (h) { observer.observe(h); });
        pickActive();
    })();

})();
