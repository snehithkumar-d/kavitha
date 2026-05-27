# Experience post — authoring template

A copy-paste reference for creating a role in the `/experience/` timeline.
Every role is a single Ghost post tagged `#experience`. The fields below map
to specific positions in the rail entry; the body becomes the role's detail
page (and its first paragraph becomes the rail summary).

---

## Where to type what (Ghost admin)

Open Ghost admin → **Posts → New post**, then fill in:

| Ghost field | What to type | Example | Where it shows |
|---|---|---|---|
| **Title** (top of editor) | `Role @ Company` | `Senior Software Engineer @ Stripe` | Bold serif title on the rail entry |
| **Post Settings → Excerpt** | `Start – End · Location · Type` | `2022 – 2024 · San Francisco · Full-time` | Mono uppercase meta line under the title |
| **Post Settings → Canonical URL** (optional) | Company LinkedIn URL (or any external link) | `https://linkedin.com/company/stripe` | Adds a small LinkedIn icon next to the title |
| **Post Settings → Publish date** | Role end date | `2024-06-30` for past, `2099-12-31` for current | Sort key — newest first; current roles pinned to top |
| **Post Settings → Tags** | `#experience` (internal) + stack tags (public) + employment-type tag | `#experience`, `Full-time`, `ruby`, `go`, `kafka`, `grpc` | `#experience` routes the post into `/experience/`. Public tags appear as the stack line. |
| **Body** | Summary paragraph + bullets (template below) | see below | First paragraph = rail summary. Full body = detail page. |
| **Feature image** | Leave empty | — | Not used by the experience rail. |

### Four rules worth memorizing

1. **The `#` matters**. Type `#experience` with the hash, not `experience`. That makes Ghost treat it as an internal tag (hidden from public taxonomy). Without the hash, the post won't route into `/experience/`.
2. **Pin current roles** by setting the publish date to a far-future date (e.g., `2099-12-31`). Otherwise a new past-role post you publish today will outrank your current role in the rail.
3. **The first public tag becomes the "Type"** chip if you ever add a detail-page template. Drag `Full-time` / `Contract` / `Internship` to the top of the tag list to make it primary.
4. **Set the Template dropdown to "Experience"** in Post Settings to get the role-detail layout (breadcrumb, back-to-all-roles link, prev/next role nav). Default is also fine — it renders via post.hbs and works correctly, just with the standard post layout (share buttons, members CTA, comments, related posts) rather than the cleaner role-focused page.

---

## Body template (paste into the editor)

Lexical accepts pasted markdown and converts it on the fly. Open the body, paste this whole block, then fill in:

```markdown
[ One or two sentences describing what you owned and what you shipped. This
  paragraph becomes the summary shown on the timeline rail — keep it under
  40 words. Lead with the *what* and *outcome*, not the title. ]

## What I worked on

- [ Project or area you owned, with the outcome — "Built X that delivered Y" ]
- [ A second deliverable, ideally with a measurable result ]
- [ Cross-functional thing — leading a migration, mentoring, RFC, etc. ]
- [ Optional: anything specific to this role that's worth surfacing ]

## Impact

- [ Quantified outcome — latency, revenue, headcount, adoption ]
- [ A second metric, even if soft — "shipped weekly", "onboarded N engineers" ]
- [ Optional: an external artifact — talk, blog post, patent, open-source release ]

## Tech

`language` · `runtime` · `database` · `infra` · `other tooling`
```

---

## Worked example — copy-paste this for your first role

> Replace company name, dates, summary, and bullets with your own. Submit
> Publish when you're ready — the role appears at `/experience/` immediately.

**Title**:
```
Senior Software Engineer @ Stripe
```

**Excerpt**:
```
2022 – 2024 · San Francisco · Full-time
```

**Canonical URL** (LinkedIn for the role or the company):
```
https://www.linkedin.com/company/stripe/
```

**Publish date**: `2024-06-30` (your last day at the role)

**Tags** (in this order — the first determines the Type chip):
```
Full-time, ruby, go, kafka, grpc, #experience
```

**Body**:
```markdown
Owned the v2 webhooks delivery system end-to-end — design, implementation,
on-call. Shipped behind a per-merchant rollout in 11 weeks.

## What I worked on

- Rebuilt the webhook fan-out pipeline on Kafka. Reduced p99 delivery latency
  from 800ms to 320ms; eliminated the previous tail of stuck-message incidents.
- Designed and shipped a new retry-and-backoff scheme. Cut paid customer
  support tickets tagged "webhook missed" by 64% over the next quarter.
- Owned the migration from legacy SQS to Kafka across 30+ internal consumers.
  Co-authored the RFC; led the cutover; wrote the runbook the on-call team
  used through Black Friday.

## Impact

- p99 webhook delivery 800ms → 320ms (–60%)
- Webhook-related Sev2 incidents: 7 in the prior year, 0 in the year after
- Onboarded 4 new engineers to the Webhooks team; wrote the onboarding guide
- Authored the internal "Webhooks at Stripe" deep-dive talk (300+ attendees)

## Tech

`ruby` · `go` · `kafka` · `grpc` · `aws` · `terraform`
```

---

## How current vs past roles differ

| | Current role | Past role |
|---|---|---|
| **Publish date** | `2099-12-31` (or any far-future date) | The role's actual end date |
| **Excerpt date segment** | `2024 – Present` | `2022 – 2024` |
| **Anything else** | identical | identical |

If you change roles, do two things on the old role's post:

1. Edit the publish date to its actual end date (the date you left).
2. Edit the excerpt to replace `Present` with the end year.

The rail re-sorts automatically.

---

## Tips

- **Reorder roles** by editing publish dates. The rail is `published_at DESC`.
- **Hide a role temporarily** by setting it to Draft instead of Published — it disappears from the rail without deleting the content.
- **Skip the LinkedIn link** by leaving Canonical URL empty. The icon just won't render.
- **Tech stack chips** come from your public tags in the order Ghost shows them. Drag to reorder.
- **The first paragraph is the rail summary** — write it as a standalone sentence even if more context follows. The detail page (`/experience/<slug>/`) shows the full body.

---

## SEO note on `canonical_url`

`canonical_url` normally tells search engines: "this content's canonical home
is at another URL." Setting it to a LinkedIn URL means Google may not bother
indexing the individual `/experience/<slug>/` page — it'll prefer to direct
traffic to LinkedIn instead.

For an experience timeline this is usually fine: nobody Googles for
"Senior Engineer @ Stripe site:yourdomain.com". If you'd rather have the
detail page indexed for portfolio SEO, leave Canonical URL blank and link to
LinkedIn from inside the post body (`[View role on LinkedIn](https://...)`
on a line of its own works well).

The rail's LinkedIn icon only renders when Canonical URL is set, so this
choice is also the link-or-no-link toggle.
