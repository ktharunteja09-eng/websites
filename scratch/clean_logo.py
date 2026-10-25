from PIL import Image
import numpy as np
from collections import deque

img = Image.open('public/assets/images/vaibhav grand logo.png')
arr = np.array(img)
h, w, c = arr.shape

r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
brightness = (r + g + b) // 3

# The logo's outer border is dark maroon:
# Pure outline has brightness around 30..80 and diff around 10..40 (reddish).
# The checkerboard is strictly neutral (diff <= 8) and bright (>= 220).
# The anti-aliasing zone between checkerboard and dark outline has:
# brightness tapering from 240 down to 70, with diff <= 15.
# Let's flood fill starting from perimeter:
# Any pixel with diff <= 12 and brightness >= 90 can be reached as background.
# Then for pixels in the transition zone (brightness between 85 and 200), we calculate soft alpha!

is_bg_solid = (diff <= 12) & (brightness >= 170)

# Flood fill solid background
bg_mask = np.zeros((h, w), dtype=bool)
q = deque()

for x in range(w):
    for y in [0, h-1]:
        if is_bg_solid[y, x] and not bg_mask[y, x]:
            bg_mask[y, x] = True
            q.append((y, x))

for y in range(h):
    for x in [0, w-1]:
        if is_bg_solid[y, x] and not bg_mask[y, x]:
            bg_mask[y, x] = True
            q.append((y, x))

while q:
    cy, cx = q.popleft()
    for ny, nx in [(cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)]:
        if 0 <= ny < h and 0 <= nx < w:
            if not bg_mask[ny, nx]:
                if diff[ny, nx] <= 15 and brightness[ny, nx] >= 110:
                    bg_mask[ny, nx] = True
                    q.append((ny, nx))

# Now let's create a smooth alpha channel
alpha = np.ones((h, w), dtype=np.float32) * 255.0
alpha[bg_mask] = 0.0

# 1-pixel feathering / erosion along the outer edge of bg_mask to remove any residual white fringe
# Find pixels directly adjacent to bg_mask that have high brightness
bg_expanded = bg_mask.copy()
for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
    rolled = np.roll(np.roll(bg_mask, dy, axis=0), dx, axis=1)
    # If adjacent to bg and brightness is light neutral:
    fringe = rolled & (~bg_mask) & (brightness >= 90) & (diff <= 20)
    bg_expanded |= fringe

alpha[bg_expanded] = 0.0

# Soft edge for pixels adjacent to bg_expanded:
edge_pixels = np.zeros((h, w), dtype=bool)
for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
    rolled = np.roll(np.roll(bg_expanded, dy, axis=0), dx, axis=1)
    edge_pixels |= (rolled & (~bg_expanded))

# On the edge pixels, if brightness is high (light fringe), dim it to match the dark outline
edge_rgb = arr.astype(np.float32)
for y, x in zip(*np.where(edge_pixels)):
    b_val = brightness[y, x]
    if b_val > 80 and diff[y, x] <= 25:
        # Scale color down towards outline color [55, 10, 12]
        factor = max(0.0, min(1.0, (150 - b_val) / 70.0))
        edge_rgb[y, x, 0] = arr[y, x, 0] * factor + 55 * (1 - factor)
        edge_rgb[y, x, 1] = arr[y, x, 1] * factor + 10 * (1 - factor)
        edge_rgb[y, x, 2] = arr[y, x, 2] * factor + 12 * (1 - factor)

rgba = np.zeros((h, w, 4), dtype=np.uint8)
rgba[:, :, :3] = np.clip(edge_rgb, 0, 255).astype(np.uint8)
rgba[:, :, 3] = alpha.astype(np.uint8)

clean_img = Image.fromarray(rgba, 'RGBA')
clean_img.save('scratch/clean_transparent_logo.png')

# Preview on dark background
bg_dark = Image.new('RGB', clean_img.size, (28, 28, 28))
bg_dark.paste(clean_img, (0, 0), clean_img)
bg_dark.save('scratch/preview_clean_dark.png')

# Preview on light background
bg_light = Image.new('RGB', clean_img.size, (253, 251, 247))
bg_light.paste(clean_img, (0, 0), clean_img)
bg_light.save('scratch/preview_clean_light.png')

print("Saved scratch/clean_transparent_logo.png and previews successfully!")
