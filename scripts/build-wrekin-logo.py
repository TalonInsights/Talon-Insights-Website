"""Turn the supplied dark-on-white Wrekin Forge logo into light steel on
transparent, and compose a horizontal lockup for the hero's nav strip.

Coverage and tone are derived separately: a flattened dark-on-white file
cannot tell 'opaque grey ink' from 'half-strength black ink', so a plain
luminance->alpha matte would render the grey FORGE half-transparent. Alpha
therefore comes from a threshold band (antialiasing only), and the ink's own
tone drives a steel ramp instead — darkest source becomes brightest steel, so
the original's hierarchy (WREKIN dominant, FORGE secondary) survives inversion.
"""
from PIL import Image
import numpy as np

SRC = r'C:\Users\ishaq\Pictures\Website Artefacts\Wrekin Forge\Logo.png'
INK_FULL, PAPER = 185.0, 250.0          # alpha band
BRIGHT = np.array([242, 245, 247], float)  # matches the headline's steel crown
MID    = np.array([138, 146, 154], float)  # ...and its waist

src = np.array(Image.open(SRC).convert('L')).astype(float)

def steel(box):
    x0, y0, x1, y1 = box
    L = src[y0:y1 + 1, x0:x1 + 1]
    alpha = np.clip((PAPER - L) / (PAPER - INK_FULL), 0, 1)
    t = np.clip((INK_FULL - L) / INK_FULL, 0, 1)[..., None]
    rgb = MID + (BRIGHT - MID) * t
    out = np.concatenate([rgb, (alpha * 255)[..., None]], axis=2)
    return Image.fromarray(out.round().astype(np.uint8), 'RGBA')

mark = steel((377, 419, 888, 682))       # the WF monogram
word = steel((98, 718, 1164, 789))       # the WREKIN FORGE wordmark

# Horizontal lockup: the monogram at twice the wordmark's cap height, optically
# centred on it, with the gap set from the monogram's own height.
MH = word.height * 2
mark_h = mark.resize((round(mark.width * MH / mark.height), MH), Image.LANCZOS)
GAP = round(MH * 0.42)
W, H = mark_h.width + GAP + word.width, MH
lock = Image.new('RGBA', (W, H), (0, 0, 0, 0))
lock.paste(mark_h, (0, 0), mark_h)
lock.paste(word, (mark_h.width + GAP, (H - word.height) // 2), word)

for name, img in (('wf-lockup.png', lock), ('wf-mark.png', mark), ('wf-wordmark.png', word)):
    img.save(name)
    print(f'{name:18} {img.width}x{img.height}')

# proof sheets on the page's own ground
for bg, tag in (((1, 1, 1, 255), 'dark'),):
    sheet = Image.new('RGBA', (lock.width + 120, lock.height + 80), bg)
    sheet.paste(lock, (60, 40), lock)
    sheet.convert('RGB').save(f'proof-{tag}.png')
print('proof written')
