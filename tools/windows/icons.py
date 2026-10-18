# The Windows app's package images (owner approved, 18 Oct 2026), made like the Android icon (tools/android/icons.py)
# from the owner's picture (android/icon-source.png), only resized. The square ones are the whole picture; the wide
# tile and the splash screen have it in the middle, and on each side its marble goes on: the picture's own edge,
# stretched outwards and blurred.
# The session runs it and commits the result (the owner does not need to).
#   python3 tools/windows/icons.py        (needs Pillow and NumPy)
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "windows/DGM/Assets"
SQUARE = {"Square150x150Logo": 150, "Square44x44Logo": 44, "StoreLogo": 50}
WIDE = {"Wide310x150Logo": (310, 150), "SplashScreen": (620, 300)}


def picture(size: int) -> Image.Image:
    return Image.open(ROOT / "android/icon-source.png").convert("RGB").resize((size, size), Image.LANCZOS)


def wide(width: int, height: int) -> Image.Image:
    im = picture(height)
    left = (width - height) // 2
    out = Image.fromarray(np.pad(np.asarray(im), ((0, 0), (left, width - height - left), (0, 0)), mode="edge"))
    out = out.filter(ImageFilter.GaussianBlur(height / 30))
    # The picture's sides fade into the blur, so no seam shows
    fade = max(1, height // 8)
    ramp = np.minimum(np.minimum(np.arange(height), np.arange(height)[::-1]) / fade, 1)
    out.paste(im, (left, 0), Image.fromarray(np.tile((ramp * 255).astype(np.uint8), (height, 1))))
    return out


ASSETS.mkdir(parents=True, exist_ok=True)
for name, size in SQUARE.items():
    picture(size).save(ASSETS / f"{name}.png", optimize=True)
for name, (w, h) in WIDE.items():
    wide(w, h).save(ASSETS / f"{name}.png", optimize=True)
print(f"The package images are in {ASSETS.relative_to(ROOT)}")
