from PIL import Image
import os

files_to_check = [
    'public/assets/vaibhav-grand-webp-images/people2.webp',
    'public/assets/vaibhav-grand-webp-images/food8.webp',
    'public/assets/vaibhav-grand-webp-images/front1.webp',
    'public/assets/vaibhav-grand-webp-images/people.webp',
    'public/assets/vaibhav-grand-webp-images/food2.webp',
    'public/assets/vaibhav-grand-webp-images/front6.webp',
    'public/assets/vaibhav-grand-webp-images/food.webp',
    'public/assets/vaibhav-grand-webp-images/food14.webp',
    'public/assets/images_processed/prawns-biryani.webp',
    'public/assets/images_processed/butter-naan.webp',
    'public/assets/images_processed/pepper-chicken.webp',
    'public/assets/vaibhav-grand-webp-images/drinlk.webp',
    'public/assets/images_processed/veg-noodles.webp',
    'public/assets/vaibhav-grand-webp-images/food6.webp',
    'public/assets/images_processed/fish-biryani.webp',
    'public/assets/vaibhav-grand-webp-images/food12.webp',
    'public/assets/vaibhav-grand-webp-images/ambiance.webp',
]

for f in files_to_check:
    if os.path.exists(f):
        with Image.open(f) as img:
            size_kb = os.path.getsize(f) / 1024
            print(f"{f}: {img.size[0]}x{img.size[1]} ({size_kb:.1f} KB)")
