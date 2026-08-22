#!/usr/bin/env python3
"""Branded Open Graph cards, one per page.

Every page used to share a single og:image, so a link to /work and a link
to /seo produced the same preview. These are rendered from the same META
block the build already reads, which means a new page gets a card without
anyone remembering to make one.

Called by build.py. If Pillow is not installed the build still runs and
pages fall back to the generic image, because a missing preview is a much
smaller problem than a build that will not run.

Output is deterministic: same text in, same bytes out. Nothing is stamped
with a time, so rebuilding does not produce a git diff for 21 binaries.
"""
from pathlib import Path

W, H = 1200, 630
PAD = 74

NAVY_TOP = (13, 36, 66)
NAVY_BOT = (7, 20, 38)
AMBER = (245, 166, 35)
WHITE = (255, 255, 255)
DIM = (150, 168, 190)

FONTS = Path(__file__).parent / "_fonts"
DISPLAY = FONTS / "SpaceGrotesk-Bold.ttf"
BODY_BOLD = FONTS / "Inter-Bold.ttf"
BODY_SEMI = FONTS / "Inter-SemiBold.ttf"


def _tracked(draw, xy, text, font, fill, tracking):
    """Draw text with letter spacing. Pillow has no tracking of its own."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def _tracked_width(draw, text, font, tracking):
    return sum(draw.textlength(c, font=font) for c in text) + tracking * max(len(text) - 1, 0)


def _wrap(draw, text, font, max_width):
    lines, line = [], ""
    for word in text.split():
        trial = (line + " " + word).strip()
        if draw.textlength(trial, font=font) <= max_width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def _redundant(eyebrow, headline):
    """True when the eyebrow only repeats the headline.

    Most crumbs are a short form of the page title, so printing both gives
    WEB DESIGN SHREWSBURY sitting above Web Design Shrewsbury. Where the
    crumb says something the headline does not - Work above Case Studies -
    it earns its place and stays.
    """
    def norm(t):
        words = "".join(c for c in t.lower() if c.isalnum() or c == " ").split()
        def stem(w):
            if len(w) > 4 and w.endswith("ies"):
                return w[:-3] + "y"
            if len(w) > 3 and w.endswith("s") and not w.endswith("ss"):
                return w[:-1]
            return w

        return " ".join(stem(w) for w in words)

    e, h = norm(eyebrow), norm(headline)
    return not e or e in h


def _backdrop(Image, ImageDraw, falcon_path):
    """Navy gradient with the falcon bled off the right edge."""
    grad = Image.new("RGB", (1, H))
    px = grad.load()
    for y in range(H):
        t = y / (H - 1)
        px[0, y] = tuple(round(a + (b - a) * t) for a, b in zip(NAVY_TOP, NAVY_BOT))
    card = grad.resize((W, H), Image.BILINEAR)

    if falcon_path.exists():
        bird = Image.open(falcon_path).convert("RGBA")
        target_h = 700
        bird = bird.resize((round(bird.width * target_h / bird.height), target_h),
                           Image.LANCZOS)
        alpha = bird.split()[-1].point(lambda a: round(a * 0.07))
        bird.putalpha(alpha)
        card.paste(bird, (W - bird.width + 130, (H - bird.height) // 2 + 20), bird)

    ImageDraw.Draw(card).rectangle([0, H - 6, W, H], fill=AMBER)
    return card


def render(out_path, headline, eyebrow=None):
    """Write one 1200x630 card. Returns False if Pillow is unavailable."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        return False

    if eyebrow and _redundant(eyebrow, headline):
        eyebrow = None

    card = _backdrop(Image, ImageDraw, Path(__file__).parent / "assets" / "falcon.webp")
    d = ImageDraw.Draw(card)

    # wordmark
    f_mark = ImageFont.truetype(str(DISPLAY), 27)
    _tracked(d, (PAD, PAD - 4), "TALON INSIGHTS", f_mark, WHITE, 3.4)

    # headline, shrunk until it fits three lines
    box = W - PAD * 2 - 40
    for size in range(68, 39, -2):
        f_head = ImageFont.truetype(str(DISPLAY), size)
        lines = _wrap(d, headline, f_head, box)
        if len(lines) <= 3:
            break
    leading = round(size * 1.16)

    # Laid out from the bottom up so the headline sits on a fixed baseline
    # whatever its length, and the eyebrow rides above it - the same order
    # the pages themselves use.
    y = H - 196 - leading * len(lines)
    if eyebrow:
        f_eye = ImageFont.truetype(str(BODY_BOLD), 21)
        _tracked(d, (PAD, y - 52), eyebrow.upper(), f_eye, AMBER, 2.6)
    for i, line in enumerate(lines):
        d.text((PAD, y + i * leading), line, font=f_head, fill=WHITE)
    last = d.textlength(lines[-1], font=f_head)
    if last + PAD + 26 < W - PAD:
        r = max(round(size * 0.11), 6)
        cy = y + (len(lines) - 1) * leading + round(size * 0.90)
        d.ellipse([PAD + last + 10, cy - r, PAD + last + 10 + r * 2, cy + r], fill=AMBER)

    # footer
    f_url = ImageFont.truetype(str(BODY_SEMI), 25)
    d.text((PAD, H - 130), "taloninsights.co.uk", font=f_url, fill=DIM)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    card.save(out_path, "JPEG", quality=88, optimize=True, progressive=True)
    return True

