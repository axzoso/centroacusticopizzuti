# Genera le icone del sito dal simbolo del logo (mockup/public/logos/mark-color.png).
#   py -3 tools/favicon.py -> wp/pizzuti-core/icone/{favicon.ico, apple-touch-icon.png, icona-512.png}
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
src = root / 'mockup' / 'public' / 'logos' / 'mark-color.png'
out = root / 'wp' / 'pizzuti-core' / 'icone'
out.mkdir(parents=True, exist_ok=True)

im = Image.open(src).convert('RGBA')
# Ritaglia eventuale bordo trasparente vuoto per massimizzare la leggibilità alle misure piccole
bbox = im.getbbox()
if bbox:
    im = im.crop(bbox)


def centra(lato, sfondo=None, margine=0):
    canvas = Image.new('RGBA', (lato, lato), sfondo or (0, 0, 0, 0))
    utile = lato - 2 * margine
    w, h = im.size
    scala = min(utile / w, utile / h)
    nw, nh = max(1, round(w * scala)), max(1, round(h * scala))
    rid = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(rid, ((lato - nw) // 2, (lato - nh) // 2), rid)
    return canvas


ico = [centra(n, margine=1 if n >= 32 else 0) for n in (16, 32, 48)]
ico[2].save(out / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], append_images=ico[:2])
# iOS riempie di nero la trasparenza: sfondo bianco con margine pulito
centra(180, sfondo='#FFFFFF', margine=20).save(out / 'apple-touch-icon.png', optimize=True)
centra(512, margine=24).save(out / 'icona-512.png', optimize=True)
print('Icone generate in', out, sorted(p.name for p in out.iterdir()))
