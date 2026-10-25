from PIL import Image
import numpy as np

img = Image.open('public/assets/images/vaibhav grand logo.png')
arr = np.array(img)
h, w, c = arr.shape
print(f"Dimensions: w={w}, h={h}, channels={c}")

# Let's inspect the background pattern
# Sample a 50x50 block from top-left (0..50, 0..50)
sample = arr[0:50, 0:50]
unique_colors = np.unique(sample.reshape(-1, c), axis=0)
print(f"Unique colors in top-left 50x50: {len(unique_colors)}")
print("Sample colors:", unique_colors[:10])

# Check checkerboard period
# Look at row 5 across columns
row5 = arr[5, :100]
print("Row 5, first 30 pixels:\n", row5[:30, 0])
