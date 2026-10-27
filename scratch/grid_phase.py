from PIL import Image
import numpy as np

img = Image.open('public/assets/images/vaibhav grand logo.png')
arr = np.array(img)
h, w, c = arr.shape

# In the top-left 200x200, let's find the exact grid step and phase
# Where are pixels with brightness < 245 (the gray square) vs >= 250 (the white square)?
gray = arr[:100, :100, 0] < 245

# Find transitions in row 10
transitions_x = np.where(np.diff(gray[10, :].astype(int)) != 0)[0]
print("X transitions in row 10:", transitions_x)
# Period in X
print("X block lengths:", np.diff(transitions_x))

transitions_y = np.where(np.diff(gray[:, 10].astype(int)) != 0)[0]
print("Y transitions in col 10:", transitions_y)
print("Y block lengths:", np.diff(transitions_y))
