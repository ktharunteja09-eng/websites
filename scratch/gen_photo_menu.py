import json

with open('scratch/photo_dishes.json', 'r', encoding='utf-8') as f:
    dishes = json.load(f)

lines = [
    "import { PhotoMenuItem } from '../types';",
    "",
    "export const PHOTO_MENU_ITEMS: PhotoMenuItem[] = ["
]

for d in dishes:
    desc = d['description'].replace("'", "\\'")
    name = d['name'].replace("'", "\\'")
    note = d.get('portionNote', '').replace("'", "\\'")
    is_veg_str = 'true' if d['isVeg'] else 'false'
    lines.append('  {')
    lines.append(f"    id: '{d['id']}',")
    lines.append(f"    name: '{name}',")
    lines.append(f"    category: '{d['category']}',")
    lines.append(f"    price: {d['price']},")
    lines.append(f"    description: '{desc}',")
    lines.append(f"    isVeg: {is_veg_str},")
    if d.get('isChefSpecial'):
        lines.append('    isChefSpecial: true,')
    if note:
        lines.append(f"    portionNote: '{note}',")
    lines.append(f"    image: '{d['image']}'")
    lines.append('  },')

lines.append('];')
lines.append('')

with open('src/data/photoMenuData.ts', 'w', encoding='utf-8') as out:
    out.write('\n'.join(lines))

print('Generated src/data/photoMenuData.ts with', len(dishes), 'items')
