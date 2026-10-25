from PIL import Image

img = Image.open('scratch/clean_transparent_logo.png')
bbox = img.getbbox()
# Crop to tight bounds with small 4px margin
crop_box = (max(0, bbox[0]-4), max(0, bbox[1]-4), min(img.width, bbox[2]+4), min(img.height, bbox[3]+4))
cropped = img.crop(crop_box)

print(f"Cropped size: {cropped.size}")

# Save master PNG
cropped.save('public/assets/images/vaibhav-grand-logo.png', 'PNG', optimize=True)

# Save high-performance WebP
cropped.save('public/assets/images/vaibhav-grand-logo.webp', 'WEBP', quality=95, method=6)

print("Saved public/assets/images/vaibhav-grand-logo.png and .webp")
