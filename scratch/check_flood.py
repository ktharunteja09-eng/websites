from PIL import Image
import numpy as np
from collections import deque

img = Image.open('public/assets/images/vaibhav grand logo.png')
arr = np.array(img)
h, w, c = arr.shape

r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
brightness = (r + g + b) // 3

# Define checkerboard pixel candidates
# The checkerboard is grayscale (diff <= 6) and high brightness (>= 220)
is_checker_candidate = (diff <= 6) & (brightness >= 220)

print(f"Total checkerboard candidate pixels: {np.sum(is_checker_candidate)} / {w*h} ({np.mean(is_checker_candidate)*100:.2f}%)")

# Let's perform flood fill from image perimeter
visited = np.zeros((h, w), dtype=bool)
queue = deque()

# Add all perimeter pixels that match candidate
for x in range(w):
    if is_checker_candidate[0, x]:
        visited[0, x] = True
        queue.append((0, x))
    if is_checker_candidate[h-1, x]:
        visited[h-1, x] = True
        queue.append((h-1, x))

for y in range(h):
    if is_checker_candidate[y, 0]:
        visited[y, 0] = True
        queue.append((y, 0))
    if is_checker_candidate[y, w-1]:
        visited[y, w-1] = True
        queue.append((y, w-1))

# 8-way or 4-way BFS flood fill
while queue:
    cy, cx = queue.popleft()
    for ny, nx in [(cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)]:
        if 0 <= ny < h and 0 <= nx < w:
            if not visited[ny, nx] and is_checker_candidate[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

connected_count = np.sum(visited)
candidate_count = np.sum(is_checker_candidate)
print(f"Perimeter-connected background pixels: {connected_count}")
print(f"Candidate pixels NOT connected to perimeter: {candidate_count - connected_count}")

# Let's see where the unconnected candidate pixels are!
unconnected = is_checker_candidate & (~visited)
if np.any(unconnected):
    uy, ux = np.where(unconnected)
    print(f"Unconnected candidates found! min_y={uy.min()}, max_y={uy.max()}, min_x={ux.min()}, max_x={ux.max()}")
    print("These are INSIDE the logo (e.g. horse's white body or lettering)!")
