# Changelog

All notable changes to **kavitha** are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

---

## [Unreleased]

### v0.2.0 backlog
P2 / polish items deferred from the v0.1.x deep review:

- **Build pipeline live** — populate `src/css/screen.css` and `src/js/source.js` from current `assets/built/` files, restore `npm ci && npm run build` in CI, gitignore `assets/built/`.
- **JSON-LD partials wired** — `partials/seo/jsonld-{article,website,person}.hbs` exist but no template includes them; render in post.hbs / default.hbs heads.
- **Syntax highlighting** — Prism CSS class hooks declared but no JS lib loaded; add Prism or Shiki + `.language-*` highlighting on code blocks.
- **Related posts** — `partials/related-posts.hbs` planned in directory tree but never authored; add `{{#get "posts" filter="..."}}` block to post.hbs / post-project.hbs.
- **Copy-to-clipboard** on `<pre>` code blocks (small JS, big DX win).
- **Reading TOC** on long posts (auto-generate from h2/h3 in post body).
- **Social share buttons** on post detail (X, LinkedIn, Mastodon, copy-link).
- **Scroll progress indicator** on post detail (top-of-page bar that fills as you scroll).
- **OG image generation** — for posts without a feature image, generate a default OG card via Cloudinary template or static fallback.
- **Hardcoded routes parameterized** — `/blog/`, `/projects/` literals in home.hbs/error.hbs/post-project.hbs should become a custom setting or routes-aware helper for forks that customize collection paths.
- **Magic numbers → tokens** — `min-height: 380px` (featured), `rgba(255,255,255,0.18)` (gradient overlay), `aspect-ratio: 16/10` (post-card image), luminance threshold `0.55` (bootstrap).
- **`<link rel="preload">`** for the two critical-path woff2 files in default.hbs head, for faster first paint.
- **Print styles use tokens** instead of raw `#fff` / `#000`.
- **44px touch targets** on `.site-search` and `.theme-toggle` (currently 32px; below WCAG AAA recommendation).
- **Skip-to-content link** at body start.
- **Ghost Custom Fonts UI** — verify `--gh-font-heading` / `--gh-font-body` flow end-to-end in admin Design → Customize → Fonts.

---

## [0.1.1] — 2026-04-28

Deep-review fixes. No breaking changes. gscan: still zero errors, zero warnings.

### Fixed
- **routes.yaml**: add `/: home` mapping. Without it, the root URL returned 404 because `/blog/` was the default collection — Ghost had no handler for `/`.
- **post-project.hbs**: drop invalid `prev_post in="primary_tag"` modifier. The `in=` parameter doesn't exist in Ghost's HBS — it was silently rendering nothing on every project page. routes.yaml lists `/projects/` first, so `primary_collection` already walks project → project naturally.
- **home.hbs heading hierarchy**: was `h1` → `h4`, breaking screen readers and SEO outline. Sidebar block headings now `h2`, list-item titles `h3`. Section-band label is now `h2`.
- **home.hbs empty-state**: when the site has zero posts, the home rendered a blank `<section>`. Added a fallback hero with site title + description + a "publish your first post" hint.
- **README**: custom-settings table was listing 25+ entries from the original schema; trimmed to match the actual 19 settings shipped in `package.json`.

### Improved
- **Featured-post excerpt contrast**: dropped `opacity: 0.92` so body copy on accent backgrounds meets WCAG AA at all accent colors.
- **Featured-post gradient in dark mode**: anchor color is now a fixed dark hex instead of `var(--ink)` (which becomes light gray in dark mode), preventing washed-out gradient.
- **Tablet breakpoint at 768px**: previously only 900/640px breakpoints existed — tablet portrait fell into the desktop bucket. Now scales gracefully.
- **Code-block border in dark mode**: `<pre>` border was `var(--line)`, near-invisible against `var(--surface)` in dark. Now uses a higher-contrast derived color.
- **`.post-body` typography**: explicit `h1`/`h5`/`h6` sizing added (previously only h2-h4 were sized).

### Added
- **Lexical card coverage** — `kg-product-card` and `kg-nft-card` were stubbed/missing. Both now have full styling (image, title, rating, description, button for product; image, title, creator, collection-name for NFT). Closes loophole #5.
- **`.gitignore`** — exclude `routes.yaml` (uploaded copy, not source-of-truth) and `.gitattributes` (Claude Code tooling).

---

## [0.1.0] — 2026-04-27

Initial release.

- Direction D magazine-spread layout (newspaper masthead, asymmetric featured-post hero, sidebar block, 3-up project grid in accent blocks).
- Fraunces × Geist × Geist Mono (self-hosted woff2 via `npm run fonts`).
- Light + dark with `prefers-color-scheme` + manual toggle, FOUC-free via inline bootstrap script.
- 19 admin-customizable theme settings.
- Full Ghost feature parity: members, comments, search, paid tiers, newsletter, magic-link auth via Portal.
- Custom `/projects/` collection via internal `#project` tag and `routes.yaml.example`.
- Custom `post-project.hbs` detail layout.
- All Lexical card variants styled (image, gallery, bookmark, callout, toggle, button, header, file, audio, video, embed; product/NFT minimal — fixed in v0.1.1).
- GitHub Actions: CI (gscan + build on PR), deploy on tag/manual, zip on release.
- gscan validation: zero errors, zero warnings, Ghost 6.x compatible.
