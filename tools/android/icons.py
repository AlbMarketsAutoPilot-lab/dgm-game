# The Android app icon (Step 8, D11; owner approved option A, 16 Oct 2026): the owner's picture
# (android/icon-source.png), whole, filling the part of the icon the phone shows, on every icon shape.
# Makes every size Android needs; the session runs it and commits the result (the owner does not need to).
#   python3 tools/android/icons.py        (needs Pillow and NumPy)
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
RES = ROOT / "android/app/src/main/res"
DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}


def layer(size: int) -> Image.Image:
    """The adaptive icon's 108dp layer: the picture fills the 72dp the phone shows; around it (seen only while the
    icon moves) the marble goes on: the picture's own edge, stretched outwards and blurred, so no road shows."""
    pic = round(size * 72 / 108)
    im = Image.open(ROOT / "android/icon-source.png").convert("RGB").resize((pic, pic), Image.LANCZOS)
    pad = (size - pic + 1) // 2
    out = Image.fromarray(np.pad(np.asarray(im), ((pad, pad), (pad, pad), (0, 0)), mode="edge"))
    out = out.filter(ImageFilter.GaussianBlur(size / 30))
    out.paste(im, (pad, pad))
    return out.crop((0, 0, size, size))


def legacy(size: int, round_: bool) -> Image.Image:
    """Android 7 (no adaptive icons): the picture in a rounded square, or in a circle."""
    im = Image.open(ROOT / "android/icon-source.png").convert("RGB").resize((size, size), Image.LANCZOS).convert("RGBA")
    big = size * 4
    mask = Image.new("L", (big, big), 0)
    d = ImageDraw.Draw(mask)
    if round_:
        d.ellipse((0, 0, big - 1, big - 1), fill=255)
    else:
        d.rounded_rectangle((0, 0, big - 1, big - 1), radius=big * 8 // 72, fill=255)
    im.putalpha(mask.resize((size, size), Image.LANCZOS))
    return im


for name, k in DENSITIES.items():
    folder = RES / f"mipmap-{name}"
    folder.mkdir(parents=True, exist_ok=True)
    layer(round(108 * k)).save(folder / "ic_launcher_background.png", optimize=True)
    legacy(round(48 * k), False).save(folder / "ic_launcher.png", optimize=True)
    legacy(round(48 * k), True).save(folder / "ic_launcher_round.png", optimize=True)

ADAPTIVE = """<?xml version="1.0" encoding="utf-8"?>
<!-- The owner's picture (android/icon-source.png, made by tools/android/icons.py); the phone gives it its shape. -->
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@android:color/transparent" />
</adaptive-icon>
"""
(RES / "mipmap-anydpi-v26").mkdir(parents=True, exist_ok=True)
for f in ("ic_launcher.xml", "ic_launcher_round.xml"):
    (RES / "mipmap-anydpi-v26" / f).write_text(ADAPTIVE)
