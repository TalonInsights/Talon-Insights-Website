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
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "_src"

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
def expand(text):
    return re.sub(r"\{\{SNIP:([a-z-]+)\}\}",
                  lambda m: snippets[m.group(1)], text)
pages = sorted((SRC / "pages").rglob("*.html"))
if not pages:
    sys.exit("no page sources found")

written = []
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
    html = html.replace("{{TITLE}}", meta["title"])
    html = html.replace("{{DESC}}", meta["desc"])
    html = html.replace("{{PATH}}", "/" if path == "/" else path)
    html = html.replace("{{SCHEMA}}", schema)
    if meta.get("robots"):
        html = html.replace('<meta name="robots" content="index,follow">',
                            '<meta name="robots" content="%s">' % meta["robots"])
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

print(f"built {len(written)} pages: " + ", ".join(written))
