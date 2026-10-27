from PIL import Image
import numpy as np

img = Image.open('public/assets/images/vaibhav grand logo.png')
arr = np.array(img)
h, w, c = arr.shape

# Let's check the checkerboard color distribution outside
# In the checkerboard, is max(R,G,B) - min(R,G,B) very small?
r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
brightness = (r + g + b) // 3

# Checkerboard pixels have diff <= 5 and brightness >= 225
is_checker = (diff <= 5) & (brightness >= 225)
print(f"Top-left corner 100x100 is_checker ratio: {np.mean(is_checker[:100, :100]):.4f}")
print(f"Bottom-left corner 100x100 is_checker ratio: {np.mean(is_checker[-100:, :100]):.4f}")
print(f"Top-right corner 100x100 is_checker ratio: {np.mean(is_checker[:100, -100:]):.4f}")
print(f"Bottom-right corner 100x100 is_checker ratio: {np.mean(is_checker[-100:, -100:]):.4f}")

# What about the logo's outer border?
# Let's inspect a horizontal slice through the middle (y = 440)
y = 440
row = arr[y]
# Find first pixel from left where is_checker is False
first_non_checker = np.where(~is_checker[y])[0]
if len(first_non_checker) > 0:
    x_left = first_non_checker[0]
    x_right = first_non_checker[-1]
    print(f"Row {y}: first non-checker at x={x_left}, color={row[x_left]}")
    print(f"Row {y}: last non-checker at x={x_right}, color={row[x_right]}")
    print(f"Previous 3 pixels at left:", row[x_left-3:x_left])
    print(f"First 3 non-checker pixels at left:", row[x_left:x_left+3])
