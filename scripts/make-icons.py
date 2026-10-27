"""Generate EasyWord app icons / splash marks.

Run:  python scripts/make-icons.py
Outputs into ./assets:
  icon.png            1024x1024  full-bleed app icon (iOS + fallback)
  adaptive-icon.png   1024x1024  transparent foreground for Android adaptive icon
  splash-icon.png     1024x1024  transparent mark for the splash screen
  favicon.png           64x64    web favicon
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)

GREEN_TOP = (111, 136, 119)
GREEN_BOTTOM = (85, 112, 97)
CREAM = (245, 244, 239)
INK = (40, 44, 39)

SS = 4  # supersampling factor
SIZE = 1024


def gradient(size):
    img = Image.new("RGB", (size, size), GREEN_TOP)
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        c = tuple(round(a + (b - a) * t) for a, b in zip(GREEN_TOP, GREEN_BOTTOM))
        d.line([(0, y), (size, y)], fill=c)
    return img


def glyph_layer(size, color, target_ratio, font_path):
    """Transparent layer with 'Aa' centered, glyph width = target_ratio * size."""
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    font = ImageFont.truetype(str(font_path), 10)
    # Scale the font until the rendered word matches the requested width.
    probe = ImageDraw.Draw(layer)
    fs = 10
    while True:
        font = ImageFont.truetype(str(font_path), fs)
        box = probe.textbbox((0, 0), "Aa", font=font)
        w = box[2] - box[0]
        if w >= size * target_ratio:
            break
        fs += 2
    box = probe.textbbox((0, 0), "Aa", font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    x = (size - w) / 2 - box[0]
    y = (size - h) / 2 - box[1]
    probe.text((x, y), "Aa", font=font, fill=color)
    return layer


def rounded_mask(size, radius):
    m = Image.new("L", (size * SS, size * SS), 0)
    ImageDraw.Draw(m).rounded_rectangle(
        [0, 0, size * SS - 1, size * SS - 1], radius=radius * SS, fill=255
    )
    return m.resize((size, size), Image.LANCZOS)


def main():
    font = Path(r"C:\Windows\Fonts\georgiab.ttf")

    # --- icon.png : full-bleed square, OS applies its own mask -------------
    base = gradient(SIZE * SS)
    base = base.convert("RGBA")
    base.alpha_composite(glyph_layer(SIZE * SS, CREAM + (255,), 0.46, font))
    base.resize((SIZE, SIZE), Image.LANCZOS).convert("RGB").save(ASSETS / "icon.png")

    # --- adaptive-icon.png : transparent fg, mark inside the 66% safe zone -
    fg = glyph_layer(SIZE, CREAM + (255,), 0.34, font)
    fg.save(ASSETS / "adaptive-icon.png")

    # --- splash-icon.png : transparent ink mark ---------------------------
    splash = glyph_layer(SIZE, INK + (255,), 0.46, font)
    splash.save(ASSETS / "splash-icon.png")

    # --- favicon.png : rounded square -------------------------------------
    small = gradient(64 * SS).convert("RGBA")
    small.alpha_composite(glyph_layer(64 * SS, CREAM + (255,), 0.5, font))
    small = small.resize((64, 64), Image.LANCZOS)
    small.putalpha(rounded_mask(64, 14))
    small.save(ASSETS / "favicon.png")

    for f in sorted(ASSETS.iterdir()):
        print(f"{f.name:20} {Image.open(f).size}")


if __name__ == "__main__":
    main()
