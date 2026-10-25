from PIL import Image
import numpy as np

img = Image.open('public/assets/images/vaibhav grand logo.png')
arr = np.array(img)
h, w, c = arr.shape

r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
brightness = (r + g + b) // 3

# Let's check the checkerboard pattern structure:
# The checkerboard in this image:
# What is the grid size?
# Let's look at a 100x100 area at (10, 10):
patch = arr[10:110, 10:110, 0]
# Is there a clear grid?
# Where are values < 245 vs >= 250?
grid = patch < 245
# Print a 20x20 visual ascii map
for row in grid[:20]:
    print("".join(["#" if p else "." for p in row[:40]]))
