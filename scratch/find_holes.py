from PIL import Image
import numpy as np

img = Image.open('scratch/test_transparent.png')
arr = np.array(img)
alpha = arr[:, :, 3]

r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
brightness = (r + g + b) // 3

from collections import deque

candidate = (alpha == 255) & (diff <= 4) & (brightness >= 235)
visited = np.zeros_like(candidate)

for y in range(arr.shape[0]):
    for x in range(arr.shape[1]):
        if candidate[y, x] and not visited[y, x]:
            comp = []
            q = deque([(y, x)])
            visited[y, x] = True
            while q:
                cy, cx = q.popleft()
                comp.append((cy, cx))
                for ny, nx in [(cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)]:
                    if 0 <= ny < arr.shape[0] and 0 <= nx < arr.shape[1]:
                        if candidate[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            q.append((ny, nx))
            
            comp_pixels = [brightness[py, px] for py, px in comp]
            has_gray = any(p <= 242 for p in comp_pixels)
            has_white = any(p >= 253 for p in comp_pixels)
            if len(comp) > 200 and has_gray and has_white:
                coords = np.array(comp)
                min_y, max_y = coords[:, 0].min(), coords[:, 0].max()
                min_x, max_x = coords[:, 1].min(), coords[:, 1].max()
                print(f"Candidate: size={len(comp)}, y=[{min_y}..{max_y}], x=[{min_x}..{max_x}]")
