from PIL import Image
import numpy as np

img = Image.open('scratch/test_transparent.png')
# Composite onto dark background #1C1C1C (same as Hero / Navbar)
bg_dark = Image.new('RGB', img.size, (28, 28, 28))
bg_dark.paste(img, (0, 0), img)
bg_dark.save('scratch/preview_on_dark.png')

# Composite onto light cream background #FDFBF7 (same as body)
bg_light = Image.new('RGB', img.size, (253, 251, 247))
bg_light.paste(img, (0, 0), img)
bg_light.save('scratch/preview_on_light.png')

print("Saved preview_on_dark.png and preview_on_light.png")
