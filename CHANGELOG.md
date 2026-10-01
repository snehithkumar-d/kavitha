# Changelog

All notable changes to **kavitha** are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

---

## [Unreleased]

### Fixed
- **Dead "Sign up" link in the footer.** Ghost's default secondary navigation includes a Sign up item that opens the members portal (`#/portal/`), and Ghost admin cannot delete it. The footer now skips that item, and hides the secondary nav when nothing else is in it.
- **Collection page titles.** `/writing/`, `/projects/` and `/experience/` were all titled "Site title (Page 1)" because Ghost's `meta_title` does that for custom collections. Each collection template now sets its own title from its section heading (for example "Recent writing | Site title"). The 404 page gets a title too.
- **RSS.** The footer RSS link and a new `<link rel="alternate">` in the head point at `/writing/rss/`. Ghost's own alternate link still renders with an empty href when there is no `/rss/` route; that comes from `ghost_head` and cannot be changed from a theme. `routes.yaml.example` now sets `rss: true` on `/writing/`.

### Changed
- **Person JSON-LD now renders on every page**, not just the home page, and adds `alternateName` (the author's display name when it differs from the site title) and `image` (the author's profile image).

### Added
- **Owner Person JSON-LD on the home page** (`partials/person-jsonld.hbs`, included from `default.hbs`). Ghost's built-in structured data models the publisher as an Organization and gives the author no `@id` or `sameAs`, so other sites that reference the owner by `@id` (for example `https://example.com/#owner`) had nothing to resolve to. The `@id` is `{{@site.url}}/#<first author slug>`, and `sameAs` is built from the existing GitHub / X / LinkedIn settings. No new custom setting: the theme is at Ghost's 20-setting limit.

### v0.2.0 backlog
P2 / polish items still pending after v0.1.2:

- **Build pipeline live** — populate `src/css/screen.css` and `src/js/source.js` from current `assets/built/` files, restore `npm ci && npm run build` in CI, gitignore `assets/built/`.
- **Syntax highlighting** — Prism CSS class hooks declared but no JS lib loaded; add Prism or Shiki + `.language-*` highlighting on code blocks.
- **Reading TOC** on long posts (auto-generate from h2/h3 in post body) — deferred to v0.3 due to JS scope.
- **OG image generation** — for posts without a feature image, generate a default OG card via Cloudinary template or static fallback.
- **Hardcoded routes parameterized** — `/blog/`, `/projects/` literals in home.hbs/error.hbs/post-project.hbs should become a custom setting. Blocked: would push us over Ghost's 20-setting cap; needs a setting cut first.
- **Skip-to-content link** at body start.
- **Ghost Custom Fonts UI** — verify `--gh-font-heading` / `--gh-font-body` flow end-to-end in admin Design → Customize → Fonts.

---

## [0.1.2] — 2026-04-28

Polish + features pass following the deep-review punch list. No breaking changes. gscan: still zero errors, zero warnings.

### Added
- **Related posts** — new `partials/related-posts.hbs` pulls 3 posts sharing the current post's `primary_tag` (excluding self) via `{{#get}}`. Included in `post.hbs` and `post-project.hbs`.
- **Social share buttons** — new `partials/share-buttons.hbs` with X/LinkedIn share + copy-link button (wired to `data-share-copy` in `source.js`).
- **Copy-to-clipboard on code blocks** — `source.js` auto-injects a "Copy" button into every `.post-body pre`. `navigator.clipboard` with graceful fallback.
- **Reading scroll-progress bar** — top-of-page bar on post templates. Uses CSS `animation-timeline: scroll()` where supported; rAF JS fallback elsewhere. Marked up in `default.hbs`, only animates on `.post-template` and `.page-template-post-project` body classes.
- **Skip-to-content link** — first body element in `default.hbs`, hidden until keyboard focus. Improves keyboard navigation.
- **Font preloads** — `<link rel="preload" as="font">` for both Fraunces-Variable and Geist-Variable woff2 files in `default.hbs` head; eliminates FOUT on first paint when fonts are present.
- **All 9 Lexical callout color variants** styled (grey, white, blue, green, yellow, red, pink, purple, accent). Uses `color-mix()` against `--surface` so they work in both light and dark modes.

### Improved
- **Post-card srcset hint** corrected to match actual rendered size (200px desktop / 33vw tablet / 100vw mobile, not the stale 380px hint). Added explicit `width`/`height` attrs to reduce CLS.
- **Page-about portrait** now serves `xs`/`s` size variants for the 280px display, instead of wasting bandwidth on `m` (720w) for a 280px slot.
- **Single-post sidebar** — when the site has exactly 1 post, the sidebar's "Recent writing" block (which would have been empty + an orphaned "All writing" CTA) is now hidden entirely. The "Now" block still renders.
- **Touch targets** bumped from 32px to 40px (`--touch-target` token) for `.site-search` and `.theme-toggle`. Same token reused for share-button min-width.
- **Print styles** now override design tokens at `:root` instead of leaking raw `#fff`/`#000` throughout the print block. Adds the new v0.1.2 chrome (skip-link, scroll-progress, share buttons, code-copy) to the `display: none` list.

### Refactored
- **Magic numbers → tokens** — added `--featured-min-h` (380px), `--card-image-ratio` (16/10), `--overlay-light-soft` (rgba), `--overlay-dark-soft` (rgba), `--touch-target` (40px). All literal usages migrated.

### Removed
- **Empty `partials/seo/` and `partials/icons/` directories** — they were placeholders never populated. Verified Ghost's `{{ghost_head}}` already auto-injects JSON-LD `Article`/`Person`/`Website` schemas (matching how Casper and Source themes work), so manual JSON-LD partials would duplicate.

### Deferred to v0.2 / v0.3
- **Reading TOC** on long posts — JS scope (heading walk + IntersectionObserver + responsive sidebar) too heavy for this pass.
- **Hardcoded route parameterization** (`blog_url`, `projects_url` settings) — would push to 21 custom settings, over Ghost's 20-setting cap.
- **Conditional search button hide** — Ghost doesn't expose a `@site.search_enabled` flag; `data-ghost-search` is harmlessly inert when search is disabled.

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
