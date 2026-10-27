from PIL import Image
import numpy as np

img = Image.open('scratch/test_transparent.png')
arr = np.array(img)
alpha = arr[:, :, 3]

alpha_bool = alpha > 0
edge = (alpha_bool) & (
    (~np.roll(alpha_bool, 1, axis=0)) |
    (~np.roll(alpha_bool, -1, axis=0)) |
    (~np.roll(alpha_bool, 1, axis=1)) |
    (~np.roll(alpha_bool, -1, axis=1))
)

edge_rgb = arr[edge, :3]
edge_brightness = np.mean(edge_rgb, axis=1)
print(f"Number of boundary pixels: {np.sum(edge)}")
print(f"Boundary pixels brightness: min={edge_brightness.min():.1f}, mean={edge_brightness.mean():.1f}, max={edge_brightness.max():.1f}")
print(f"Number of boundary pixels with brightness > 150: {np.sum(edge_brightness > 150)} / {len(edge_brightness)}")
print(f"Number of boundary pixels with brightness > 180: {np.sum(edge_brightness > 180)} / {len(edge_brightness)}")
