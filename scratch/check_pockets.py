from PIL import Image
import numpy as np
from collections import deque

img = Image.open('public/assets/images/vaibhav grand logo.png')
arr = np.array(img)
h, w, c = arr.shape

r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
brightness = (r + g + b) // 3

# Checkerboard candidate pixels
is_checker_candidate = (diff <= 12) & (brightness >= 225)

# In the checkerboard, is there a 15x15 square pattern?
# Notice: within any 20x20 window of the checkerboard, the standard deviation of brightness is > 4
# and has both min <= 242 and max >= 252!
# Whereas on the horse's white body, the white pixels are uniformly high (e.g. 250..255) with very low variation,
# OR smooth gradient shading with directional light.
# Even better: let's inspect the specific coordinates of the pockets:
# 1. Inside the bent front leg: x around 1000..1150, y around 300..450
# Let's inspect that area:
print("Crop around front legs: y=320..440, x=1000..1150")
crop_legs = arr[320:440, 1000:1150]
crop_diff = diff[320:440, 1000:1150]
crop_bright = brightness[320:440, 1000:1150]

# Check standard deviation of brightness in that pocket:
# In the pocket between the bent leg:
# Let's find outline in that crop:
outline_crop = crop_bright < 120
# Non-outline, high brightness:
pocket_pixels = (crop_bright >= 230) & (crop_diff <= 8)
print(f"Pocket pixels in crop: {np.sum(pocket_pixels)}")
print(f"Min brightness: {crop_bright[pocket_pixels].min()}, Max brightness: {crop_bright[pocket_pixels].max()}")
print(f"Std dev: {np.std(crop_bright[pocket_pixels]):.2f}")
