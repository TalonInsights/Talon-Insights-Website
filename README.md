# Talon Insights Website

Talon Insights' own website. Static multi-page site, no framework, no build
step on Vercel — the generated pages are committed.

## Structure

    _src/layout.html     shared shell (head, header, footer)
    _src/pages/*.html    one source per page: META comment + body
    _src/snippets/*.html reusable fragments ({{SNIP:name}})
    build.py             stitches _src into the root *.html files
    assets/              styles.css, site.js, logo art, og-image
    vercel.json          clean URLs, security headers, noindex hold

Edit anything under `_src/` or `assets/`, then:

    python build.py

and commit both the source and the regenerated pages. Editing the root
`*.html` files directly gets overwritten by the next build.

Local preview with clean URLs (`/pricing` -> `pricing.html`):

    python .claude/serve.py    # http://127.0.0.1:4173

`_shot.html` is a dev-only harness for scrolled headless screenshots;
`.vercelignore` keeps it and `_src/` off the deployment.

## Deploying

Vercel project: talon-insights-website (TalonInsights team). Pushes to
`main` auto-deploy. Public URL: https://talon-insights-website.vercel.app

### Before removing the noindex hold

`vercel.json` sends **`X-Robots-Tag: noindex, nofollow`** on every response,
deliberately: the pages still contain `__PHONE__`, `__EMAIL__` and
`__SITE_URL__` placeholders and must not reach Google in that state.
Search the repo for `__` to find every token. When all are filled:

1. Remove the X-Robots-Tag block from `vercel.json`.
2. Confirm `robots.txt` and `sitemap.xml` carry the real domain.
3. Push.

### Content still owed (marked in place in the pages)

- Real screenshots: scheduler (work + home), WulfTek renderer, one deck slide.
- A photograph of Talon (about + home).
- Client-approved testimonials and outcome figures — publish nothing a
  client hasn't approved in writing.
- Trust badges (PI insurance, ICO) only once genuinely in place.
