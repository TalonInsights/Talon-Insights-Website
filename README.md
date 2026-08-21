# Talon Insights Website

Talon Insights' own website.

Its own repo — no shared history with the other projects under
`Website Development Area/`, or with the client sites under
`Talon Consulting Clients/`.

Stack not chosen yet.

## Deploying

Not yet deployed. No Vercel project exists for this repo.

    npm i -g vercel
    vercel login
    vercel        # first run creates the project and deploys a preview
    vercel --prod # once the placeholders below are filled in

### Before the first production deploy

`vercel.json` currently sends **`X-Robots-Tag: noindex, nofollow`** on every
response. That is deliberate — `index.html` still contains `__PHONE__`,
`__EMAIL__` and `__SITE_URL__` placeholders, and a live page showing those
must not reach Google. Remove that one header at launch, and not before.

Search `index.html` for `__` to find everything still to replace.

`Content-Security-Policy` allows `'unsafe-inline'` for script and style,
because this is a single file with an inline `<style>` and `<script>`.
Tighten it to hashes if the assets are ever split out.
