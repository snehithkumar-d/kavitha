# kavitha

> *kuh-VEE-tha* · Sanskrit (कविता) for *poetry*.
> A publishing theme for writers and builders.

A native Ghost theme designed for personal sites that want both a blog and a project portfolio. Magazine-style home, asymmetric featured-post hero, custom `/projects/` collection, full Ghost feature parity (members, comments, search, paid tiers, newsletter, magic-link auth via Portal).

- **Native HBS** · Handlebars + vanilla CSS + ~80 LOC of vanilla JS. No frameworks, no JS runtime tax.
- **Two collections in one theme** · `/blog/` for posts, `/projects/` for posts tagged `#project` (internal tag, hidden from public taxonomy).
- **Full Ghost parity** · Newsletter signup, native comments, native search, paid tiers, magic-link auth — all wired through Portal.
- **Customizable from admin** · 25+ custom theme settings: color scheme, font choices, nav layout, section titles, social URLs, members CTA copy, more.
- **Light + dark + accent** · `prefers-color-scheme` default, manual toggle, accent color from Ghost admin with admin-controlled foreground contrast.
- **Open source · MIT** · Fork it, brand it, ship it.

---

## Install

### Option 1 — Upload via Ghost Admin (no GitHub needed)

1. Download the latest `kavitha.zip` from [Releases](https://github.com/snehithkumar-d/kavitha/releases).
2. In Ghost admin: **Settings → Design → Change theme → Upload theme** → upload `kavitha.zip` → Activate.
3. *(Optional, enables `/projects/` collection)* **Settings → Labs → Routes → Upload routes.yaml** → upload [`routes.yaml.example`](./routes.yaml.example) (rename to `routes.yaml` first).

### Option 2 — Auto-deploy via GitHub Actions

1. Fork this repo.
2. In Ghost admin: **Settings → Integrations → Add custom integration → "GitHub Actions"** → copy the Admin API URL and Admin API Key.
3. In GitHub: **Settings → Secrets and variables → Actions** → add `GHOST_ADMIN_API_URL` and `GHOST_ADMIN_API_KEY`.
4. Tag a release (`git tag v1.0.0 && git push --tags`) — the deploy workflow will validate with gscan, build, zip, and upload via the Ghost Admin API.

---

## Project posts (the `/projects/` collection)

Projects and blog posts are both Ghost posts but live in separate collections. Workflow:

1. Create a post in Ghost as you normally would.
2. Add the **internal tag** `#project` (with the hash — internal tags are hidden from public taxonomy).
3. Save & publish.
4. Visit `/projects/` — your post appears in the project grid. Visit `/projects/<your-slug>/` — it renders with `post-project.hbs` (sidebar metadata, project-specific layout).

`#project` posts are automatically excluded from `/blog/` and `/`. They get their own RSS at `/projects/rss/`.

> **Don't create a Ghost Page named `projects`, `blog`, `tag`, or `author`** — those slugs are reserved by `routes.yaml` and the page would become orphaned.

---

## Custom theme settings (admin → Design → Customize)

19 settings, all optional with sensible defaults. Ghost caps custom settings at 20 — we use 19 to leave headroom.

| Setting | Type | Default | What it does |
|---|---|---|---|
| Color scheme default | select | Auto | Auto follows OS; Light/Dark forces. Manual toggle in nav still wins. |
| Accent text color | select | Auto | Force readable text on top of accent backgrounds (Auto computes from luminance). |
| Body font | select | Serif | Fraunces (Serif) / Geist (Sans-serif) / Geist Mono. |
| Show author byline | boolean | true | Author chip on post detail. |
| Show reading time | boolean | true | "5 min read" on byline + cards. |
| Show feature image on post | boolean | true | Hero image on post detail. |
| Post image style | select | Wide | Full-width / Wide / Inline. |
| Home intro text | text | "Personal site — code, writing, and projects." | Sidebar "Now" block on home page. |
| Blog section title | text | "Recent writing" | Sidebar / blog index header. |
| Blog section subtitle | text | "All writing, in reverse-chronological order." | Subhead under the section title. |
| Projects section title | text | "Selected projects" | Section band on home + projects index header. |
| Projects section subtitle | text | "Things I've built and shipped." | Subhead on projects index. |
| Members CTA title | text | "Subscribe for new posts" | Heading inside the subscribe block. |
| Members CTA body | text | "Get new writing in your inbox. No spam, unsubscribe anytime." | Body copy inside the subscribe block. |
| Footer signature | text | "" | Optional line in footer (e.g. "Made in San Francisco"). |
| Show theme credit | boolean | true | "built with kavitha" link in footer (disable to remove attribution). |
| GitHub URL | text | "" | Footer social link. |
| Twitter / X URL | text | "" | Footer social link. |
| LinkedIn URL | text | "" | Footer social link. |

Heading-font choice, nav layout, dark/light comments toggle, and other v0.x ideas were trimmed to stay under Ghost's 20-setting limit. They'll come back in v0.2 if the limit is raised, or via Ghost's Custom Fonts feature (`--gh-font-heading` / `--gh-font-body`).

---

## Local development

```bash
git clone https://github.com/snehithkumar-d/kavitha.git
cd kavitha
npm install
npm run fonts        # download Fraunces, Geist, Geist Mono into assets/fonts/
npm run dev          # watch src/ and rebuild assets/built/
```

Then run a local Ghost on port 2368 and symlink the theme:

```bash
npm install -g ghost-cli
ghost install local --dir ~/ghost-local
ln -s "$PWD" ~/ghost-local/content/themes/kavitha
ghost restart
# In admin: Settings → Design → Activate "kavitha"
```

### Validate

```bash
npm run gscan        # must report zero errors before deploy
```

### Build a zip

```bash
npm run zip          # → dist/kavitha.zip
```

---

## Tech notes

- **Build pipeline** — PostCSS (postcss-import + postcss-preset-env stage 2 + autoprefixer + cssnano) + esbuild for JS. Single `build.mjs` orchestrator (~50 LOC), no gulp/rollup. Run `npm run build`.
- **Lexical editor cards** — full styling for `.kg-image-card`, `.kg-gallery-card`, `.kg-bookmark-card`, `.kg-callout-card`, `.kg-toggle-card`, `.kg-button-card`, `.kg-product-card`, `.kg-file-card`, `.kg-audio-card`, `.kg-video-card`, `.kg-header-card`, `.kg-embed-card`, `.kg-blockquote-alt`. Width modifiers (`.kg-width-wide`, `.kg-width-full`) supported.
- **No Google Fonts** — fonts self-hosted as woff2. `font-display: swap`.
- **No inline scripts** — except one `<head>` bootstrap that hydrates the theme (light/dark) and accent text color before first paint to prevent FOUC.
- **CI safety** — `gscan` runs before every deploy. Auto-deploy is gated behind `workflow_dispatch` + tag push (not every main commit).
- **WCAG-aware accent** — admin can pick any accent color; the bootstrap script computes luminance and assigns readable text. Override available as a custom theme setting.

---

## License

[MIT](./LICENSE) © Snehith Kumar D

Theme attribution (`built with kavitha` link in footer) is on by default but can be toggled off in admin → Design → Customize → "Show theme credit." If you fork this theme commercially or for a client, removing that link is fine — the MIT license requires only that the LICENSE file ships with redistribution.

---

## Credits

- Fonts: [Fraunces](https://github.com/undercase/Fraunces) (SIL OFL), [Geist](https://github.com/vercel/geist-font), [Geist Mono](https://github.com/vercel/geist-font) (both SIL OFL · Vercel)
- Architecture inspired by [Ghost's Source theme](https://github.com/TryGhost/Source)
- Built on [Ghost](https://ghost.org)
