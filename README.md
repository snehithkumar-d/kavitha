# kavitha

> *kuh-VEE-tha* · Sanskrit (कविता) for *poetry*.
> A publishing theme for writers and builders.

A native Ghost theme designed for personal sites that want a blog, a project portfolio, and a work-experience timeline in one place. Magazine-style home, asymmetric featured-post hero, custom `/projects/` and `/experience/` collections, full Ghost feature parity (members, comments, search, paid tiers, newsletter, magic-link auth via Portal).

- **Native HBS** · Handlebars + vanilla CSS + ~80 LOC of vanilla JS. No frameworks, no JS runtime tax.
- **Three collections in one theme** · `/writing/` for posts, `/projects/` for posts tagged `#project` (internal), `/experience/` for posts tagged `#experience` (internal). Internal tags hidden from public taxonomy.
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
4. Push to `main` — the deploy workflow auto-fires (gscan → fetch fonts → upload via Ghost Admin API). Tag pushes also fire.

---

## First-run admin setup (do these once after install)

The theme renders correctly out of the box, but a few admin-side decisions unlock its intended look. Do these in **Ghost admin** after activating:

1. **Settings → Design → Brand → Accent color** — pick any hex. The bootstrap script computes readable foreground; admin can also override via the *Accent text color* theme setting.

2. **Settings → Design → Customize → Theme settings** — at minimum set:
   - **GitHub / Twitter / LinkedIn URLs** — surface as icons in the footer.
   - **Now (status)** — short note rendered in the home hero's status sidebar. The whole sidebar hides if this is empty.

3. **Settings → Navigation** — populate the primary nav. Recommended entries (URLs match the routes shipped in `routes.yaml.example`):
   | Label | URL |
   |---|---|
   | `Home` | `/` |
   | `Writing` | `/writing/` |
   | `Projects` | `/projects/` |
   | `Experience` | `/experience/` |
   | `About` | `/about/` |

   The active item shows a `>` accent prefix automatically. If no nav link matches the current URL, the first nav link gets the marker as a fallback so the prompt is always visible.

4. **Settings → Labs → Routes → Upload routes.yaml** — upload [`routes.yaml.example`](./routes.yaml.example) (rename to `routes.yaml` first). Without this:
   - `/` returns 404 (no handler for root)
   - `/writing/` returns 404
   - `/projects/` returns 404
   - `/experience/` returns 404
   - Posts don't get the `/writing/{slug}/` permalink

5. **Pages → New page** — create an "About" page (slug: `about`). The theme renders it via `page-about.hbs`.

6. **(Optional) Settings → Membership → toggle on Members** — unlocks Subscribe CTAs and Portal modal. The members CTA partial gracefully hides when members are disabled.

---

## Project posts (the `/projects/` collection)

Projects and blog posts are both Ghost posts but live in separate collections. Workflow:

1. Create a post in Ghost as you normally would.
2. Add the **internal tag** `#project` (with the hash — internal tags are hidden from public taxonomy).
3. Save & publish.
4. Visit `/projects/` — your post appears in the project grid. Visit `/projects/<your-slug>/` — it renders with `post-project.hbs` (sidebar metadata, project-specific layout).

`#project` posts are automatically excluded from `/writing/` and `/`. They get their own RSS at `/projects/rss/`. Regular posts live at `/writing/{slug}/`; project posts live at `/projects/{slug}/`.

> **Don't create a Ghost Page named `projects`, `writing`, `experience`, `tag`, or `author`** — those slugs are reserved by `routes.yaml` and the page would become orphaned.

---

## Experience posts (the `/experience/` collection)

Each role you've held is its own Ghost post tagged `#experience` (internal). The theme renders them as a developer-minimal vertical timeline at `/experience/`, sorted newest-first by publish date.

Authoring convention:

| Concept | Ghost field | Example |
|---|---|---|
| Role + Company | `Title` | `Senior Software Engineer @ Stripe` |
| Date range / location / type | `Excerpt` | `2022 – 2024 · San Francisco · Full-time` |
| Company website (optional) | `Canonical URL` in Post Settings | `https://stripe.com` — adds a small "website ↗" chip on the rail |
| Sort key | `Publish date` | role end date (or `2099-12-31` for current roles to pin to top) |
| Stack | Public tags | `typescript`, `postgres`, `react` |
| Routing | Internal tag | `#experience` (with the hash) |
| Summary + bullets | Post body | first paragraph becomes the rail summary; full body lives on the detail page |

`#experience` posts are automatically excluded from `/writing/` and `/projects/`. To reorder, change the publish date. To remove a role, unpublish or delete the post.

> A note on `canonical_url`: Ghost normally uses it to mark a post as syndicated. Setting it to the company website means search engines may de-prioritize indexing the individual `/experience/<slug>/` page. For an experience timeline this is usually fine. If you want the role's detail page indexed, leave canonical empty and put the company link inside the post body instead.

---

## Custom theme settings (admin → Design → Customize)

20 settings, all optional with sensible defaults. Ghost caps custom settings at 20.

| Setting | Type | Default | What it does |
|---|---|---|---|
| Color scheme default | select | Auto | Auto follows OS; Light/Dark forces. Manual toggle in nav still wins. |
| Body font | select | Serif | Fraunces (Serif) / Geist (Sans-serif) / Geist Mono. |
| Show author byline | boolean | true | Author chip on post detail. |
| Show rss link | boolean | true | Show the RSS icon in the footer. Off hides it; `/rss/` still works. |
| Accent preset | select | Teal | Default accent color (Teal or Terracotta). Visitors can override via the footer swatch. |
| Blog section title | text | "Recent writing" | Section band on home + writing index header. |
| Projects section title | text | "Selected projects" | Section band on home + projects index header. |
| Members CTA title | text | "Subscribe for new posts" | Heading inside the subscribe block. |
| Members CTA body | text | "Get new writing in your inbox. No spam, unsubscribe anytime." | Body copy inside the subscribe block. |
| **Show hero card** | boolean | false | Wrap home hero (name + bio) in a teal accent card. Off = plain terminal text. |
| Hero title | text | "" | Override the home page hero title. Empty falls back to site title. |
| **Now (status)** | text | "" | Status sidebar — what you're working on now. Sidebar hides if empty. |
| **Based (status)** | text | "" | Status sidebar — where you're based. Hides row if empty. |
| Experience section title | text | "Experience" | Heading shown on `/experience/`. |
| **Show search** | boolean | true | Show the search button in the header. Off hides it entirely. |
| **Show signup** | boolean | true | Show the Subscribe CTA under each post and on the homepage. |
| Show theme credit | boolean | true | "built with kavitha" link in footer (disable to remove). |
| GitHub URL | text | "" | Footer social icon. |
| Twitter / X URL | text | "" | Footer social icon. |
| LinkedIn URL | text | "" | Footer social icon. |

### Home layout

The home page is an asymmetric 2-column grid:

- **Left (1.6fr)**: Hero — `~ /home/{site title}` breadcrumb + site title (h1) + bio. Toggle **Show hero card** wraps this in a teal accent card.
- **Right (1fr)**: Status sidebar — Now / Based rows. Each row hides when its setting is empty. The whole sidebar hides if `Now` is empty.

Below the hero: terminal-style recent-writing list, then the 2-up project grid, then the members CTA (if `show_signup` is on).

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
