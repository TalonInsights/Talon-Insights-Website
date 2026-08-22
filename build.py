#!/usr/bin/env python3
"""Talon Insights static site generator.

Stitches _src/pages/*.html into _src/layout.html and writes the results to the
repo root. The generated pages ARE committed — Vercel serves them as-is with no
build step. Run after editing anything in _src/:

    python build.py

Each page source starts with a META comment:

    <!--META {"path": "/pricing", "title": "...", "desc": "...",
              "crumb": "Pricing"} -->

path "/" maps to index.html; everything else to <name>.html (served under
clean URLs by vercel.json). A BreadcrumbList is generated for every page with
a "crumb". Page-specific JSON-LD can simply be included in the page body.

sitemap.xml is generated from the same pass, so it cannot drift out of step
with the pages. Anything whose META declares noindex is left out of it.
"""
import json, re, subprocess, sys

import ogcards
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "_src"
SITE = "https://taloninsights.co.uk"

layout = (SRC / "layout.html").read_text(encoding="utf-8")

# snippets: {{SNIP:name}} anywhere in a page body pulls _src/snippets/name.html
snippets = {p.stem: p.read_text(encoding="utf-8").strip()
            for p in (SRC / "snippets").glob("*.html")}

def strip_comments(html):
    """Remove HTML comments from published output.

    Source files carry build notes - unwritten testimonials, credentials not
    yet in place, outstanding client figures. Those are for us, not for anyone
    who opens view-source on a live page. Script and style blocks are stashed
    first so nothing inside them is touched.
    """
    keep = []

    def stash(m):
        keep.append(m.group(0))
        return "@@KEEP%d@@" % (len(keep) - 1)

    html = re.sub(r"<(script|style)\b.*?</\1>", stash, html, flags=re.S | re.I)
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    html = re.sub(r"@@KEEP(\d+)@@", lambda m: keep[int(m.group(1))], html)
    return re.sub(r"\n[ \t]*\n[ \t]*\n+", "\n\n", html)
def esc(text):
    """Escape bare ampersands for use in an attribute or title.

    Page titles legitimately contain "Telford & Shropshire". Dropped into a
    content attribute unescaped that is invalid HTML. Entities already in the
    source are left alone, so &mdash; does not become &amp;mdash;.
    """
    return re.sub(r"&(?![a-zA-Z][a-zA-Z0-9]*;|#[0-9]+;|#x[0-9a-fA-F]+;)", "&amp;", text)


def expand(text):
    return re.sub(r"\{\{SNIP:([a-z-]+)\}\}",
                  lambda m: snippets[m.group(1)], text)
def last_modified(sources):
    """Map each page source to the date it last changed, for sitemap lastmod.

    One pass over git history rather than a call per file. Files with
    uncommitted changes are dated today, because a file edited but not yet
    committed did change today - the previous commit date would be a lie.
    Anything git cannot account for falls back to today as well, so a checkout
    without history still produces a valid sitemap.
    """
    today = date.today().isoformat()
    try:
        log = subprocess.run(["git", "log", "--format=%cs", "--name-only",
                              "--no-renames"], cwd=ROOT, capture_output=True,
                             text=True, check=True).stdout
        status = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT,
                                capture_output=True, text=True,
                                check=True).stdout
    except (OSError, subprocess.SubprocessError):
        return {src: today for src in sources}

    committed, stamp = {}, None
    for line in log.splitlines():          # newest commit first
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", line):
            stamp = line
        elif line and stamp:
            committed.setdefault(line, stamp)

    dirty = {line[3:].strip().strip('"') for line in status.splitlines()
             if len(line) > 3}

    dates = {}
    for src in sources:
        rel = src.relative_to(ROOT).as_posix()
        dates[src] = today if rel in dirty else committed.get(rel, today)
    return dates

pages = sorted((SRC / "pages").rglob("*.html"))
if not pages:
    sys.exit("no page sources found")

written, indexable, cards = [], [], []
for src in pages:
    raw = src.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--META\s*(\{.*?\})\s*-->\s*", raw, re.S)
    if not m:
        sys.exit(f"{src.name}: missing META block")
    meta = json.loads(m.group(1))
    body = expand(raw[m.end():])

    path = meta["path"]
    out = ROOT / ("index.html" if path == "/" else path.strip("/") + ".html")
    out.parent.mkdir(parents=True, exist_ok=True)

    schema = ""
    if meta.get("crumb"):
        crumbs = [{"@type": "ListItem", "position": 1, "name": "Home",
                   "item": "https://taloninsights.co.uk/"},
                  {"@type": "ListItem", "position": 2, "name": meta["crumb"],
                   "item": "https://taloninsights.co.uk" + path}]
        schema = ('<script type="application/ld+json">'
                  + json.dumps({"@context": "https://schema.org",
                                "@type": "BreadcrumbList",
                                "itemListElement": crumbs},
                               ensure_ascii=False)
                  + "</script>")

    html = layout
    html = html.replace("{{TITLE}}", esc(meta["title"]))
    html = html.replace("{{DESC}}", esc(meta["desc"]))
    html = html.replace("{{PATH}}", "/" if path == "/" else path)
    html = html.replace("{{SCHEMA}}", schema)
    if meta.get("robots"):
        html = html.replace('<meta name="robots" content="index,follow">',
                            '<meta name="robots" content="%s">' % meta["robots"])
    # Open Graph card. The headline is the META "og" where one is given,
    # otherwise the title with the brand suffix taken off. The eyebrow comes
    # from the section rather than the crumb, so it says something the
    # headline does not.
    slug = "home" if path == "/" else path.strip("/").replace("/", "-")
    card = ROOT / "assets" / "og" / (slug + ".jpg")
    headline = meta.get("og") or re.sub(r"\s*\|\s*Talon Insights\s*$", "",
                                        meta["title"]).strip()
    if path.startswith("/blog/"):
        eyebrow = "Article"
    elif path == "/work":
        eyebrow = "Case study"
    else:
        eyebrow = meta.get("crumb")
    if ogcards.render(card, headline, eyebrow):
        cards.append(slug)
        og_url = "/assets/og/" + slug + ".jpg"
    else:
        og_url = "/assets/og-image.jpg"
    html = html.replace("{{OG}}", og_url)
    html = html.replace("{{OGALT}}", esc("Talon Insights &mdash; " + headline))

    html = html.replace("{{BODY}}", body.rstrip())
    # nav current-page markers
    html = re.sub(r"\{\{CUR:([^}]*)\}\}",
                  lambda mm: ' aria-current="page"' if mm.group(1) == meta.get("nav", path) else "",
                  html)
    # {{SEC:/a|/b}} — marks a dropdown trigger current when the page sits under it
    html = re.sub(r"\{\{SEC:([^}]*)\}\}",
                  lambda mm: ' data-current="true"'
                  if meta.get("nav", path) in mm.group(1).split("|") else "",
                  html)

    html = strip_comments(html)
    out.write_text(html, encoding="utf-8", newline="\n")
    written.append(out.name)
    if "noindex" not in meta.get("robots", ""):
        indexable.append((path, src))

# sitemap: loc and lastmod only. Google ignores priority and changefreq, and a
# field nobody reads is a field that quietly goes stale.
modified = last_modified([src for _, src in indexable])
lines = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for path, src in sorted(indexable):
    lines += ["  <url>",
              f"    <loc>{SITE}{path}</loc>",
              f"    <lastmod>{modified[src]}</lastmod>",
              "  </url>"]
lines.append("</urlset>")
(ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n",
                                  encoding="utf-8", newline="\n")

# security.txt (RFC 9116). Expires is a required field, and the whole point
# of it is that nobody trusts stale contact details - so it is generated with
# a rolling date rather than typed once and left to rot.
expires = date.today().replace(year=date.today().year + 1) - timedelta(days=30)
lines = [
    "# Found a security problem with this site? Please tell me.",
    "# One person, so expect a human reply rather than a ticket number.",
    "",
    "Contact: mailto:taloninsights@gmail.com",
    f"Expires: {expires.isoformat()}T00:00:00.000Z",
    "Preferred-Languages: en",
    f"Canonical: {SITE}/.well-known/security.txt",
]
sec = ROOT / ".well-known" / "security.txt"
sec.parent.mkdir(parents=True, exist_ok=True)
sec.write_text("\n".join(lines) + "\n",
               encoding="utf-8", newline="\n")

print(f"built {len(written)} pages: " + ", ".join(written))
print(f"og cards: {len(cards)}" if cards else "og cards: skipped (Pillow not installed)")
print(f"sitemap: {len(indexable)} urls"
      + (f" ({len(written) - len(indexable)} excluded as noindex)"
         if len(written) != len(indexable) else ""))
