from PIL import Image
import numpy as np
from collections import deque

img = Image.open('public/assets/images/vaibhav grand logo.png')
arr = np.array(img)
h, w, c = arr.shape

r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
brightness = (r + g + b) // 3

# Dark outline
is_outline = (brightness < 125)

# First, flood fill from perimeter
perimeter_bg = np.zeros((h, w), dtype=bool)
q = deque([(0, 0)])
perimeter_bg[0, 0] = True

for x in range(w):
    for y in [0, h-1]:
        if not is_outline[y, x] and not perimeter_bg[y, x]:
            perimeter_bg[y, x] = True
            q.append((y, x))

for y in range(h):
    for x in [0, w-1]:
        if not is_outline[y, x] and not perimeter_bg[y, x]:
            perimeter_bg[y, x] = True
            q.append((y, x))

while q:
    cy, cx = q.popleft()
    for ny, nx in [(cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)]:
        if 0 <= ny < h and 0 <= nx < w:
            if not perimeter_bg[ny, nx]:
                if diff[ny, nx] <= 15 and brightness[ny, nx] >= 160:
                    perimeter_bg[ny, nx] = True
                    q.append((ny, nx))

visited = np.copy(perimeter_bg | is_outline)

for y in range(h):
    for x in range(w):
        if not visited[y, x]:
            comp = []
            cq = deque([(y, x)])
            visited[y, x] = True
            while cq:
                py, px = cq.popleft()
                comp.append((py, px))
                for ny, nx in [(py-1, px), (py+1, px), (py, px-1), (py, px+1)]:
                    if 0 <= ny < h and 0 <= nx < w:
                        if not visited[ny, nx]:
                            visited[ny, nx] = True
                            cq.append((ny, nx))
            
            if len(comp) > 300:
                comp_arr = np.array(comp)
                min_y, max_y = comp_arr[:, 0].min(), comp_arr[:, 0].max()
                min_x, max_x = comp_arr[:, 1].min(), comp_arr[:, 1].max()
                b_vals = brightness[comp_arr[:, 0], comp_arr[:, 1]]
                d_vals = diff[comp_arr[:, 0], comp_arr[:, 1]]
                std_b = np.std(b_vals)
                mean_d = np.mean(d_vals)
                print(f"Large Component: size={len(comp)}, y=[{min_y}..{max_y}], x=[{min_x}..{max_x}], std_b={std_b:.2f}, min_b={b_vals.min()}, max_b={b_vals.max()}, mean_d={mean_d:.2f}")
