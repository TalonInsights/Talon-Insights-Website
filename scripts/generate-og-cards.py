# Per-page og cards, 1200x630, in the site's own idiom: ink-deep grounds,
# Space Grotesk display, JetBrains Mono labels, cobalt-lift accents, the
# lockup as the constant. Photo pages (work/about) get photo grounds with
# an ink band; the rest are type cards like the original og-card.png.
import os
from PIL import Image, ImageDraw, ImageFont

SCRATCH = os.path.dirname(os.path.abspath(__file__))
SITE = r"C:\Users\ishaq\Desktop\Website Development Area\Talon Insights Website"
IMG = os.path.join(SITE, "public", "images")
OUT = os.path.join(SITE, "public")

W, H = 1200, 630
INK = (6, 14, 28)        # --color-ink-deep #060E1C
INK_BAND = (4, 8, 15)    # #04080F, the footer's deeper black
SHEET = (245, 247, 249)  # --color-sheet
DIM = (245, 247, 249)
COBALT = (77, 124, 255)  # --color-cobalt-lift

def sg(size, wght=600):
    f = ImageFont.truetype(os.path.join(SCRATCH, "SpaceGrotesk.ttf"), size)
    try:
        f.set_variation_by_axes([wght])
    except Exception:
        pass
    return f

def jbm(size, wght=600):
    f = ImageFont.truetype(os.path.join(SCRATCH, "JetBrainsMono.ttf"), size)
    try:
        f.set_variation_by_axes([wght])
    except Exception:
        pass
    return f

def dim(alpha):
    return DIM + (int(255 * alpha),)

def cover(path, w, h, focus_y=0.35, top_crop=0.0):
    im = Image.open(path).convert("RGB")
    if top_crop:
        im = im.crop((0, round(im.height * top_crop), im.width, im.height))
    sw, sh = im.size
    scale = max(w / sw, h / sh)
    im = im.resize((round(sw * scale), round(sh * scale)), Image.LANCZOS)
    x = (im.width - w) // 2
    y = round((im.height - h) * focus_y)
    return im.crop((x, y, x + w, y + h))

def lockup(height):
    im = Image.open(os.path.join(IMG, "lockup.webp")).convert("RGBA")
    scale = height / im.height
    return im.resize((round(im.width * scale), height), Image.LANCZOS)

def tracked(draw, xy, text, font, fill, tracking=0):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x - tracking

def tracked_width(draw, text, font, tracking=0):
    return sum(draw.textlength(c, font=font) for c in text) + tracking * (len(text) - 1)

def band(card, label):
    # the ink band along the foot: lockup left, mono label right
    bh = 110
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle([0, H - bh, W, H], fill=INK_BAND + (255,))
    od.rectangle([0, H - bh, W, H - bh + 2], fill=COBALT + (255,))
    card.alpha_composite(overlay)
    d = ImageDraw.Draw(card)
    lk = lockup(40)
    card.alpha_composite(lk, (56, H - bh + (bh - 40) // 2))
    f = jbm(24, 640)
    tw = tracked_width(d, label, f, 5)
    tracked(d, (W - 56 - tw, H - bh + (bh - 24) // 2 - 4), label, f, dim(0.72), 5)

def save(card, name):
    path = os.path.join(OUT, name)
    if name.endswith(".jpg"):
        card.convert("RGB").save(path, "JPEG", quality=86, optimize=True)
    else:
        card.convert("RGB").save(path, "PNG", optimize=True)
    print(name, os.path.getsize(path) // 1024, "KB")

# ---------- /work: the two afters split by a cobalt rule ----------
card = Image.new("RGBA", (W, H), INK)
half = W // 2 - 3
card.paste(cover(os.path.join(IMG, "work-dj-after.webp"), half, H, 0.0, top_crop=0.09), (0, 0))
card.paste(cover(os.path.join(IMG, "work-wt-after.webp"), half, H, 0.0, top_crop=0.09), (W - half, 0))
d = ImageDraw.Draw(card)
d.rectangle([half, 0, W - half, H], fill=COBALT)
band(card, "SELECTED WORK · TWO BUSINESSES")
save(card, "og-work.jpg")

# ---------- /about: the meeting photo ----------
card = Image.new("RGBA", (W, H), INK)
card.paste(cover(os.path.join(IMG, "about-meeting.webp"), W, H, 0.30), (0, 0))
band(card, "ABOUT · WHO YOU'D BE HIRING")
save(card, "og-about.jpg")

# ---------- the type cards: booking / pricing / process ----------
def type_card(headline, sub, motif=None):
    card = Image.new("RGBA", (W, H), INK)
    d = ImageDraw.Draw(card)
    lk = lockup(46)
    card.alpha_composite(lk, (56, 64))
    if motif:
        motif(card, d)
    f = sg(84, 620)
    y = 330
    for line in headline:
        d.text((56, y), line, font=f, fill=SHEET)
        y += 96
    d.rectangle([56, y + 26, 196, y + 30], fill=COBALT)
    fm = jbm(23, 620)
    tracked(d, (56, y + 54), sub, fm, dim(0.66), 4)
    return card

card = type_card(["Book a visit."], "FREE WITHIN AN HOUR OF TELFORD · REPLY WITHIN ONE WORKING DAY")
save(card, "og-booking.png")

card = type_card(["One number,", "in writing."], "THE PRICE IS FIXED BEFORE THE BUILD STARTS")
save(card, "og-pricing.png")

def gantt(card, d):
    # the five stage bars, honest proportions, diamond where the build begins
    bars = [(56, 140), (56, 320), (56, 250), (56, 470), (56, 180)]
    x0, y = 700, 88
    lengths = [140, 320, 250, 470, 180]
    starts = [0, 60, 200, 300, 560]
    for i, (ln, st) in enumerate(zip(lengths, starts)):
        alpha = 255 if i != 3 else 255
        col = COBALT if i != 3 else SHEET
        d.rounded_rectangle([x0 - 560 + st * 0.78, y, x0 - 560 + st * 0.78 + ln * 0.78, y + 26], 13, fill=col + ((160 + i * 20),) if col == COBALT else col)
        y += 44
    # diamond at the build bar's start
    bx, by = x0 - 560 + 300 * 0.78, 88 + 3 * 44 - 12
    d.polygon([(bx, by), (bx + 9, by + 9), (bx, by + 18), (bx - 9, by + 9)], fill=(255, 193, 77))

card = Image.new("RGBA", (W, H), INK)
d = ImageDraw.Draw(card)
lk = lockup(46)
card.alpha_composite(lk, (56, 64))
# bars top-right
lengths = [150, 330, 260, 480, 190]
starts = [0, 50, 170, 260, 540]
y = 78
for i, (ln, st) in enumerate(zip(lengths, starts)):
    x = 560 + st * 0.72
    col = COBALT + (150 + i * 22,)
    d.rounded_rectangle([x, y, x + ln * 0.9, y + 24], 12, fill=col)
    y += 42
bx = 560 + 260 * 0.72
by = 78 + 3 * 42 + 12
d.polygon([(bx, by - 22), (bx + 9, by - 13), (bx, by - 4), (bx - 9, by - 13)], fill=(255, 193, 77))
f = sg(84, 620)
d.text((56, 356), "The whole job,", font=f, fill=SHEET)
d.text((56, 452), "stage by stage.", font=f, fill=SHEET)
d.rectangle([56, 574, 196, 578], fill=COBALT)
fm = jbm(23, 620)
tracked(d, (250, 574 - 4), "THE PRICE IS FIXED BEFORE THE BUILD BAR BEGINS", fm, dim(0.66), 4)
save(card, "og-process.png")
