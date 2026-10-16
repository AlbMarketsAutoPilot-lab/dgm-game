# Android icon files (Step 8, A11, owner approved 16 Oct 2026), made once from public/icons/icon-maskable-512.png and
# committed in android/app/src/main/res. Run again only if the icon artwork changes:  python3 tools/android/icons.py
# Adaptive icon (Android 8+): background #4b2377 + the artwork as the foreground layer (108 dp, the artwork's safe zone
# on Android's 66 dp safe circle). Older phones (Android 7): a square icon with round corners and a round one.
# Also writes a preview of the icon on a round, square and squircle mask (path given as the first argument).
import os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")
BG = (0x4B, 0x23, 0x77, 255)
art = Image.open(os.path.join(ROOT, "public", "icons", "icon-maskable-512.png")).convert("RGBA")
DENS = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}

def foreground(px):  # 108 dp canvas; the maskable artwork's safe zone (80 % of it) = Android's 66 dp safe circle
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    s = round(px * 66 / 108 / 0.8)
    img.alpha_composite(art.resize((s, s), Image.LANCZOS), ((px - s) // 2, (px - s) // 2))
    return img

def full(px):  # what the phone shows: background + foreground, the middle 72 of 108 dp
    big = round(px * 108 / 72)
    img = Image.new("RGBA", (big, big), BG)
    img.alpha_composite(foreground(big))
    off = (big - px) // 2
    return img.crop((off, off, off + px, off + px))

def masked(img, shape):
    px = img.size[0]
    m = Image.new("L", (px * 4, px * 4), 0)
    d = ImageDraw.Draw(m)
    if shape == "round": d.ellipse((0, 0, px * 4 - 1, px * 4 - 1), fill=255)
    elif shape == "square": d.rounded_rectangle((0, 0, px * 4 - 1, px * 4 - 1), radius=px * 4 * 0.08, fill=255)
    else:  # squircle |x|^4 + |y|^4 = 1
        n, pts = px * 4 / 2, []
        for i in range(720):
            import math
            t = i / 720 * 2 * math.pi
            c, s = math.cos(t), math.sin(t)
            pts.append((n + n * (abs(c) ** 0.5) * (1 if c >= 0 else -1), n + n * (abs(s) ** 0.5) * (1 if s >= 0 else -1)))
        d.polygon(pts, fill=255)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), m.resize(img.size, Image.LANCZOS))
    return out

for name, k in DENS.items():
    d = os.path.join(RES, f"mipmap-{name}")
    os.makedirs(d, exist_ok=True)
    foreground(round(108 * k)).save(os.path.join(d, "ic_launcher_foreground.png"), optimize=True)
    legacy = full(round(48 * k))
    masked(legacy, "square").save(os.path.join(d, "ic_launcher.png"), optimize=True)
    masked(legacy, "round").save(os.path.join(d, "ic_launcher_round.png"), optimize=True)

if len(sys.argv) > 1:  # the preview for the owner
    size, pad = 240, 40
    sheet = Image.new("RGBA", (3 * size + 4 * pad, size + 2 * pad + 50), (0xF7, 0xF1, 0xE3, 255))
    draw = ImageDraw.Draw(sheet)
    try: font = ImageFont.truetype("DejaVuSans.ttf", 26)
    except OSError: font = ImageFont.load_default()
    for i, shape in enumerate(["round", "square", "squircle"]):
        x = pad + i * (size + pad)
        sheet.alpha_composite(masked(full(size), shape), (x, pad))
        w = draw.textlength(shape, font=font)
        draw.text((x + (size - w) / 2, pad + size + 12), shape, fill=(0x4B, 0x23, 0x77), font=font)
    sheet.save(sys.argv[1])
