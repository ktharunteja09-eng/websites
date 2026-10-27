from PIL import Image
import numpy as np

img = Image.open('scratch/test_transparent.png')
arr = np.array(img)
alpha = arr[:, :, 3]

# Check white parts of horse and letters:
# Horse is located roughly around x in [600..1200], y in [10..400]
horse_area_alpha = alpha[10:400, 600:1200]
horse_area_rgb = arr[10:400, 600:1200, :3]
white_horse_pixels = (horse_area_rgb[:, :, 0] > 200) & (horse_area_alpha == 255)
print(f"Opaque white pixels in horse area: {np.sum(white_horse_pixels)}")

# Check VAIBHAV lettering area: y in [450..650], x in [300..1500]
letters_area_alpha = alpha[450:650, 300:1500]
letters_area_rgb = arr[450:650, 300:1500, :3]
white_letter_pixels = (letters_area_rgb[:, :, 0] > 200) & (letters_area_alpha == 255)
print(f"Opaque white pixels in VAIBHAV letters: {np.sum(white_letter_pixels)}")

# Now check: are there any checkerboard pixels that STILL HAVE alpha == 255?
# In the original image, checkerboard pixels had:
# diff <= 4 and (brightness in [236..244] or brightness in [251..255])
# AND they have the 15x15 periodic pattern!
r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
brightness = (r + g + b) // 3

# Look for any pockets where alpha == 255 but it's a checkerboard pixel:
# Note: horse pixels are smooth or shaded, whereas checkerboard has sharp 15-pixel steps.
# Let's check if there are any enclosed areas between the horse legs or wings:
# Let's inspect where alpha == 255 and brightness in [238..242] (the gray checkerboard square!)
# Does the horse or letters use the exact gray color [238, 238, 238] to [242, 242, 242]?
gray_check = (alpha == 255) & (diff <= 3) & (brightness >= 238) & (brightness <= 242)
print(f"Pixels with gray checkerboard color still opaque: {np.sum(gray_check)}")
if np.sum(gray_check) > 0:
    coords = np.where(gray_check)
    print(f"y range: {coords[0].min()}..{coords[0].max()}, x range: {coords[1].min()}..{coords[1].max()}")
