from PIL import Image
import numpy as np

img = Image.open('public/assets/images/vaibhav grand logo.png')
arr = np.array(img)
h, w, c = arr.shape

# Let's inspect specific locations:
# Inside letter 'A' of 'VAIBHAV':
# 'VAIBHAV' is roughly in the middle vertical range (y=400..600)
# Let's inspect the inside of letters and horse pockets:
# Let's find all pixels in the entire image where:
# a pixel is adjacent to another pixel with difference of ~13 (253 - 240) in a 15-pixel period
# Or better: let's test if flood fill from (0,0) with edge stopping reaches all outer areas.

from collections import deque
r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
brightness = (r + g + b) // 3

# Logo outline: What is the logo outline color?
# The logo has a dark outline!
# In the entire logo perimeter, the outline is dark brown/maroon:
# e.g. R in [40..100], G in [0..20], B in [0..20], or brightness <= 150
# Let's check brightness of the outer stroke of the logo:
is_outline = (brightness < 120)

print(f"Total outline pixels: {np.sum(is_outline)}")

# Flood fill from (0,0) stopping at the outline:
# If we flood fill all pixels that are NOT outline, starting from the image border:
bg_mask = np.zeros((h, w), dtype=bool)
q = deque([(0, 0)])
bg_mask[0, 0] = True

# Also add all 4 borders
for x in range(w):
    for y in [0, h-1]:
        if not is_outline[y, x] and not bg_mask[y, x]:
            bg_mask[y, x] = True
            q.append((y, x))

for y in range(h):
    for x in [0, w-1]:
        if not is_outline[y, x] and not bg_mask[y, x]:
            bg_mask[y, x] = True
            q.append((y, x))

# Flood fill condition:
# We only expand into pixels that are:
# 1) NOT dark outline (brightness >= 160)
# 2) AND neutral grayscale (diff <= 15)
# This prevents flooding into colored parts (gold wings, green letters)
# AND the outline (brightness < 120) completely prevents flooding into the white horse or white letters!
while q:
    cy, cx = q.popleft()
    for ny, nx in [(cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)]:
        if 0 <= ny < h and 0 <= nx < w:
            if not bg_mask[ny, nx]:
                # Must be background-like: neutral gray/white and not dark outline
                if diff[ny, nx] <= 15 and brightness[ny, nx] >= 160:
                    bg_mask[ny, nx] = True
                    q.append((ny, nx))

print(f"Total flooded background pixels: {np.sum(bg_mask)}")

# Let's save a test transparent image and inspect it!
rgba = np.zeros((h, w, 4), dtype=np.uint8)
rgba[:, :, :3] = arr
# Where bg_mask is True, alpha is 0. Everywhere else, alpha is 255.
rgba[:, :, 3] = np.where(bg_mask, 0, 255)

test_img = Image.fromarray(rgba, 'RGBA')
test_img.save('scratch/test_transparent.png')
print("Saved scratch/test_transparent.png successfully!")
