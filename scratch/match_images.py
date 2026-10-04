import os, re, json

with open(r'src/data/restaurantData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Match each object in MENU_ITEMS
item_blocks = re.findall(r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*name:\s*[\'"]([^\'"]+)[\'"],\s*category:\s*[\'"]([^\'"]+)[\'"],\s*price:\s*(\d+),\s*description:\s*[\'"]([^\'"]+)[\'"],\s*isVeg:\s*(true|false)(?:,\s*isChefSpecial:\s*(true|false))?(?:,\s*portionNote:\s*[\'"]([^\'"]+)[\'"])?', content)

items = []
for b in item_blocks:
    items.append({
        'id': b[0],
        'name': b[1],
        'category': b[2],
        'price': int(b[3]),
        'description': b[4],
        'isVeg': b[5] == 'true',
        'isChefSpecial': b[6] == 'true' if b[6] else False,
        'portionNote': b[7] if b[7] else ''
    })

print(f"Total MENU_ITEMS extracted: {len(items)}")

img_dir = r'public/assets/images_processed'
webp_files = sorted([f for f in os.listdir(img_dir) if f.endswith('.webp')])

# Create alias mapping
aliases = {
    'apollo-fish.webp': 'Apollo Fish',
    'baby-corn-555.webp': 'Baby Corn 555',
    'baby-corn-manchurian.webp': 'Baby Corn Manchurian',
    'boiled-egg.webp': 'Boiled Egg',
    'butter-chicken.webp': 'Butter Chicken',
    'butter-kulcha.webp': 'Butter Kulcha',
    'butter-naan.webp': 'Butter Naan',
    'butter-roti.webp': 'Butter Roti',
    'chicken-65.webp': 'Chicken 65',
    'chicken-curry-bone.webp': 'Chicken Curry With Bone',
    'chicken-curry-boneless.webp': 'Chicken Curry Boneless',
    'chicken-drumstick.webp': 'Chicken Drumstick',
    'chicken-dum-biriyani.webp': 'Hyderabadi Chicken Dum Biryani',
    'chicken-fried-rice.webp': 'Chicken Fried Rice',
    'chicken-fry-curries.webp': 'Chicken Fry',
    'chicken-lollipop.webp': 'Chicken Lollipop',
    'chicken-mughlai-curry.webp': 'Mughlai Chicken Curry',
    'chicken-noodles.webp': 'Chicken Noodles',
    'chicken-rayalaseema.webp': 'Rayalaseema Chicken Curry',
    'chilli-paneer.webp': 'Chilli Paneer',
    'chocolate-milkshake.webp': 'Chocolate Milkshake',
    'egg-fried-rice.webp': 'Egg Fried Rice',
    'egg-noodles.webp': 'Egg Noodles',
    'fish-65.webp': 'Fish 65',
    'fish-biryani.webp': 'Fish Biryani',
    'fish-masala.webp': 'Fish Masala',
    'green-mint-mojito.webp': 'Green Mint Mojito',
    'jeera-rice.webp': 'Jeera Rice',
    'kadai-fish-curry.webp': 'Kadai Fish Curry',
    'kadai-veg.webp': 'Kadai Veg',
    'kulcha.webp': 'Kulcha',
    'loaded-chicken-fries.webp': 'Loaded Chicken Fries',
    'loaded-french-fries.webp': 'Loaded French Fries',
    'mandi.webp': 'Vaibhav Special Mandi',
    'masala-kulcha.webp': 'Masala Kulcha',
    'mushroom-65.webp': 'Mushroom 65',
    'mushroom-fried-rice.webp': 'Mushroom Fried Rice',
    'mushroom-noodles.webp': 'Mushroom Noodles',
    'oreo-milkshake.webp': 'Oreo Milkshake',
    'paneer-65.webp': 'Paneer 65',
    'paneer-biryani.webp': 'Paneer Biryani',
    'paneer-manchurian.webp': 'Paneer Manchurian',
    'panneer-kheema-masala.webp': 'Panneer Kheema Masala',
    'panneer-tikka-masala.webp': 'Panneer Tikka Masala',
    'panneer-tikka.webp': 'Panneer Tikka',
    'panner-tikka-fry.webp': 'Paneer Tikka Fry',
    'pepper-chicken.webp': 'Pepper Chicken',
    'pepper-fish.webp': 'Pepper Fish',
    'peri-peri-french-fries.webp': 'Peri Peri French Fries',
    'peri-peri-fried-chicken.webp': 'Peri Peri Fried Chicken',
    'prawns-65.webp': 'Prawns 65',
    'prawns-biryani.webp': 'Prawns Biryani',
    'prawns-noodles.webp': 'Prawns Noodles',
    'rayalaseema-chicken-curry.webp': 'Rayalaseema Chicken Curry',
    'sahi-paneer.webp': 'Shahi Paneer',
    'special-chicken-fried-rice.webp': 'Special Chicken Fried Rice',
    'special-curd-rice.webp': 'Special Curd Rice',
    'special-omlette.webp': 'Special Omlette',
    'strawberry-milkshake.webp': 'Strawberry Milkshake',
    'tandoori-chicken.webp': 'Tandoori Chicken',
    'veg-fried-rice.webp': 'Veg Fried Rice',
    'veg-noodles.webp': 'Veg Noodles'
}

photo_dishes = []
matched_count = 0

for w in webp_files:
    target_name = aliases.get(w, w.replace('.webp', '').replace('-', ' '))
    match = None
    for it in items:
        # Normalize
        norm_it = re.sub(r'[^a-z0-9]', '', it['name'].lower())
        norm_target = re.sub(r'[^a-z0-9]', '', target_name.lower())
        if norm_it == norm_target or norm_target in norm_it or norm_it in norm_target:
            match = it
            break

    if match:
        matched_count += 1
        photo_dishes.append({
            'id': match['id'],
            'name': match['name'],
            'category': match['category'],
            'price': match['price'],
            'description': match['description'],
            'isVeg': match['isVeg'],
            'isChefSpecial': match.get('isChefSpecial', False),
            'portionNote': match.get('portionNote', ''),
            'image': f"/assets/images_processed/{w}"
        })
    else:
        # Fallback
        cat = 'starters'
        is_veg = False
        if any(x in w for x in ['rice', 'biryani', 'biriyani']):
            cat = 'biryani' if 'biryani' in w or 'biriyani' in w else 'rice-noodles'
        elif 'mandi' in w:
            cat = 'mandi'
        elif any(x in w for x in ['curry', 'masala']):
            cat = 'curries'
        elif any(x in w for x in ['naan', 'roti', 'kulcha']):
            cat = 'breads'
            is_veg = True
        elif any(x in w for x in ['mojito', 'milkshake']):
            cat = 'beverages'
            is_veg = True
        elif any(x in w for x in ['paneer', 'corn', 'mushroom']):
            cat = 'starters'
            is_veg = True

        photo_dishes.append({
            'id': w.replace('.webp', ''),
            'name': target_name,
            'category': cat,
            'price': 250,
            'description': f"Freshly crafted {target_name} made with authentic herbs and spices.",
            'isVeg': is_veg,
            'isChefSpecial': False,
            'portionNote': '',
            'image': f"/assets/images_processed/{w}"
        })

print(f"Matched {matched_count} out of {len(webp_files)} images directly with existing menu items.")
with open(r'scratch/photo_dishes.json', 'w', encoding='utf-8') as out:
    json.dump(photo_dishes, out, indent=2)

print("Saved photo_dishes.json")
