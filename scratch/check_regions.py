from PIL import Image
import numpy as np
from scipy.ndimage import label

# Let's inspect unconnected candidate components
import scratch.check_flood as cf
arr = cf.arr
unconnected = cf.unconnected

# Find connected components of unconnected
lbl, num_features = label(unconnected)
print(f"Number of unconnected candidate regions: {num_features}")

# For each component, check its size and whether it contains the checkerboard pattern (alternating 238 and 255)
# Checkerboard has standard deviation across pixels around ~7-8 because of 238 vs 254
for i in range(1, num_features + 1):
    mask = (lbl == i)
    size = np.sum(mask)
    if size > 100:
        pixels = arr[mask]
        std = np.std(pixels[:, 0])
        mean = np.mean(pixels[:, 0])
        coords = np.where(mask)
        cy, cx = int(np.mean(coords[0])), int(np.mean(coords[1]))
        print(f"Region {i}: size={size}, mean={mean:.1f}, std={std:.2f}, center=({cx}, {cy})")
