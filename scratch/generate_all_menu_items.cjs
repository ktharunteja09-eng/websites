const fs = require('fs');
const path = require('path');

const parsedData = require('./parsed_menu_items.json');
const restContent = fs.readFileSync(path.join(__dirname, '../src/data/restaurantData.ts'), 'utf8');
const photoContent = fs.readFileSync(path.join(__dirname, '../src/data/photoMenuData.ts'), 'utf8');

// Extract existing descriptions
const existingMap = new Map();

function parseItemsFromCode(code) {
  const lines = code.split('\n');
  let currentName = null;
  let currentDesc = null;

  for (const line of lines) {
    const nameMatch = line.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      currentName = nameMatch[1].trim();
    }
    const descMatch = line.match(/description:\s*['"]([^'"]+)['"]/);
    if (descMatch && currentName) {
      currentDesc = descMatch[1].trim();
      existingMap.set(currentName.toLowerCase(), currentDesc);
      // Also normalized without bracket notes e.g. "apollo fish"
      const clean = currentName.toLowerCase().replace(/\s*\(.*?\)/, '').replace(/\s*\[.*?\]/, '').trim();
      existingMap.set(clean, currentDesc);
    }
  }
}

parseItemsFromCode(restContent);
parseItemsFromCode(photoContent);

console.log(`Found ${existingMap.size} existing descriptions in codebase.`);

// Default culinary description generator for any unmatched items
function generateDescription(item) {
  const name = item.name;
  const lower = name.toLowerCase();
  const cat = item.category;

  // Try exact or clean match
  const clean = lower.replace(/\s*\(.*?\)/, '').replace(/\s*\[.*?\]/, '').trim();
  if (existingMap.has(lower)) return existingMap.get(lower);
  if (existingMap.has(clean)) return existingMap.get(clean);

  // Soups
  if (cat === 'veg-soups') {
    if (lower.includes('mushroom corn')) return 'Comforting warm broth loaded with fresh button mushrooms and sweet golden corn.';
    if (lower.includes('sweet corn')) return 'Silky Chinese sweet corn soup gently simmered with finely chopped garden vegetables.';
    if (lower.includes('hot & sour')) return 'Tangy, spicy Indo-Chinese vegetable soup with bamboo shoots, chillies and dark vinegar.';
    if (lower.includes('manchow')) return 'Spicy dark vegetable soup flavored with ginger, garlic and topped with crisp fried noodles.';
    if (lower.includes('cream of mushroom')) return 'Rich, velvety soup prepared with sautéed button mushrooms, fresh cream and ground pepper.';
    if (lower.includes('lemon coriander')) return 'Clear citrusy soup infused with fresh coriander leaves, lemon juice and crushed black pepper.';
    if (lower.includes('tomato')) return 'Classic ripe tomato soup slow-simmered with aromatic Indian herbs and spices.';
    return 'Hot, soothing bowl of wholesome chef-prepared soup.';
  }

  if (cat === 'non-veg-soups') {
    if (lower.includes('hot & sour')) return 'Zesty, peppery broth loaded with tender shredded chicken, egg drops and chillies.';
    if (lower.includes('manchow')) return 'Hearty chicken soup infused with garlic, coriander and topped with crunchy noodles.';
    if (lower.includes('corn')) return 'Smooth comforting soup made with tender chicken shreds and sweet American golden corn.';
    if (lower.includes('coriander')) return 'Light, refreshing chicken broth elevated with vibrant cilantro and a splash of lime.';
    if (lower.includes('bone soup')) return 'Traditional slow-cooked mutton marrow bone broth packed with robust spices and nutrition.';
    if (lower.includes('mutton pepper')) return 'Fiery, aromatic country mutton soup spiced with freshly ground Tellicherry black pepper.';
    return 'Warm, nourishing non-veg soup prepared with freshly extracted stocks.';
  }

  // Vaibhav Special Starters
  if (cat === 'vaibhav-special-starters') {
    if (lower.includes('karivepaku mutton')) return 'Tender mutton tossed with roasted curry leaf paste, crushed peppercorns and Andhra spices.';
    if (lower.includes('karivepaku chicken')) return 'Succulent chicken morsels wok-tossed in signature fried curry leaf masala and green chillies.';
    if (lower.includes('butterfly chicken')) return 'Golden crumb-fried chicken cutlets shaped like butterfly wings with spicy dipping sauce.';
    if (lower.includes('garlic chicken keema balls')) return 'Crisp-coated meatballs of spiced minced chicken with rich garlic essence and herbs.';
    if (lower.includes('dragon crispy chicken')) return 'Crispy fried chicken strips glazed in fiery dragon red sauce with capsicum and scallions.';
    if (lower.includes('arabian prawns')) return 'Juicy coastal prawns marinated in Middle Eastern zaatar, olive oil and char-grilled.';
    if (lower.includes('arabian fish')) return 'Fresh fish fillets steeped in Arabian spices, garlic and char-roasted to delicate perfection.';
    if (lower.includes('platter')) return 'Grand communal platter featuring an assorted feast of chef special chicken, mutton and seafood starters.';
    return 'House specialty starter crafted with secret royal spices.';
  }

  // Nattu Specials
  if (cat === 'nattu-specials') {
    if (lower.includes('chitti muthyalu mutton')) return 'Traditional Andhra biryani cooked with fragrant baby Chitti Muthyalu rice and tender goat meat.';
    if (lower.includes('chitti muthyalu chicken')) return 'Aromatic small-grain Chitti Muthyalu rice dum-cooked with spicy country chicken and ghee.';
    if (lower.includes('rayalaseema chicken curry')) return 'Authentic spicy Rayalaseema country chicken curry served with piping-hot finger millet Ragi Sangati.';
    if (lower.includes('mutton paya')) return 'Slow-simmered rich goat trotters broth seasoned with native spices, paired with hot Ragi Sangati.';
    if (lower.includes('chepala pulusu')) return 'Tangy tamarind fish gravy with country spices and shallots, served alongside nutritious Ragi Sangati.';
    if (lower.includes('mutton pulusu')) return 'Home-style Andhra mutton gravy slow-cooked with tomatoes and spices, served with fresh Ragi Sangati.';
    if (lower.includes('curd rice')) return 'Cooling tempered curd rice garnished with mustard seeds, curry leaves, pomegranate and cashews.';
    if (lower.includes('white rice')) return 'Steamed long-grain white rice, cooked fluffy and fresh.';
    if (lower.includes('raagi ball')) return 'Traditional Rayalaseema steamed finger millet ball packed with wholesome rustic goodness.';
    return 'Authentic Rayalaseema country preparation served traditional style.';
  }

  // Chicken Starters
  if (cat === 'chicken-starters') {
    if (lower.includes('chilli chicken')) return 'Wok-tossed battered chicken cubes with vibrant green chillies, onions and soy garlic glaze.';
    if (lower.includes('vaibhav\'s special chicken')) return 'House specialty chicken tossed in a secret spicy red masala with roasted cashews and herbs.';
    if (lower.includes('pepper chicken')) return 'Pan-roasted chicken cubes coated with freshly cracked black pepper, onions and curry leaves.';
    if (lower.includes('majestic')) return 'Fried chicken strips tossed in aromatic spiced curd sauce with mint and green chillies.';
    if (lower.includes('65')) return 'Classic spicy deep-fried chicken cubes tempered with mustard, curry leaves and curd.';
    if (lower.includes('lollipop')) return 'Crispy frenched chicken winglets marinated in spicy batter and deep-fried to perfection.';
    if (lower.includes('drumstick')) return 'Tender chicken drumsticks marinated in spicy paste and fried crisp with tangy dipping sauce.';
    if (lower.includes('wings')) return 'Juicy chicken wings glazed in flavorful house spices with crispy skin.';
    if (lower.includes('cashew nut chicken')) return 'Stir-fried chicken tossed with crunchy golden roasted cashew nuts and rich sauce.';
    if (lower.includes('fry')) return 'Homestyle Andhra chicken fry sautéed dry with onions, crushed ginger and garam masala.';
    if (lower.includes('roast')) return 'Slow-roasted chicken pieces cooked in thick spicy onion-tomato masala until browned.';
    if (lower.includes('hong kong')) return 'Crispy chicken tossed in sweet, tangy and spicy Hong Kong style sauce with bell peppers.';
    if (lower.includes('dragon chicken')) return 'Spicy Indo-Chinese chicken strips tossed with red chillies, garlic and crunchy cashews.';
    if (lower.includes('schezwan')) return 'Battered chicken wok-tossed in pungent Schezwan pepper sauce with spring onions.';
    if (lower.includes('rambo chicken')) return 'Signature spicy chicken starter prepared with bold fiery Andhra masalas.';
    if (lower.includes('manchurian')) return 'Battered fried chicken morsels simmered in classic savory garlic-coriander Manchurian sauce.';
    return 'Delicious spiced chicken starter prepared fresh to order.';
  }

  // Mutton Starters
  if (cat === 'mutton-starters') {
    if (lower.includes('kaju mutton ghee roast')) return 'Tender mutton slow-roasted in pure country ghee with a generous heap of roasted cashews.';
    if (lower.includes('kaju mutton roast')) return 'Spiced tender mutton pieces roasted with whole crunchy cashew nuts and ground spices.';
    if (lower.includes('mutton ghee roast')) return 'Rich Mangalorean-style mutton roast cooked in aromatic pure desi ghee with roasted whole spices.';
    if (lower.includes('mutton fry')) return 'Traditional dry mutton fry cooked with onions, green chillies and fragrant masala.';
    return 'Succulent mutton starter prepared with choice spices.';
  }

  // Fish Starters
  if (cat === 'fish-starters') {
    if (lower.includes('fish finger')) return 'Crisp golden panko-breaded fish batons served with house tartar dipping sauce.';
    if (lower.includes('pepper fish')) return 'Pan-seared fish fillets tossed with crushed black pepper, shallots and curry leaves.';
    if (lower.includes('chilli fish')) return 'Wok-tossed crispy fish fillets with capsicum, green chillies and savory Chinese glaze.';
    if (lower.includes('apollo fish')) return 'Signature Hyderabadi boneless fish fillets sautéed in spicy curd, mustard and curry leaf tempering.';
    if (lower.includes('fish 65')) return 'Crisp-fried fish cubes seasoned with vibrant Andhra 65 spice mix.';
    return 'Fresh fish specialty starter cooked to golden perfection.';
  }

  // Prawns Starters
  if (cat === 'prawns-starters') {
    if (lower.includes('loose prawns')) return 'Crispy batter-fried juicy prawns tossed with chopped garlic, green chillies and spring onions.';
    if (lower.includes('chilli prawns')) return 'Plump prawns stir-fried with bell peppers, green chillies and savory garlic soy sauce.';
    if (lower.includes('pepper prawns')) return 'Spicy dry-fried prawns tossed in freshly cracked Tellicherry black pepper and curry leaves.';
    if (lower.includes('prawns 65')) return 'Crispy fried coastal prawns seasoned with fiery red 65 spices and lemon.';
    return 'Succulent coastal prawns starter.';
  }

  // Egg Starters
  if (cat === 'egg-starters') {
    if (lower.includes('egg chilly')) return 'Hard-boiled egg wedges batter-fried and tossed with sliced green chillies and capsicum.';
    if (lower.includes('egg 65')) return 'Crispy egg bites tossed in classic South Indian red spiced yogurt sauce.';
    if (lower.includes('special omelette')) return 'Fluffy triple-egg omelette stuffed with chopped onions, green chillies, tomatoes and cheese.';
    if (lower.includes('omelette')) return 'Golden pan-cooked country style spiced egg omelette with fresh cilantro.';
    if (lower.includes('manchurian')) return 'Fried egg dumplings simmered in savory Indo-Chinese Manchurian sauce.';
    if (lower.includes('boiled egg')) return 'Freshly boiled protein-rich eggs sprinkled with salt and pepper.';
    if (lower.includes('dragon egg')) return 'Crispy fried egg cubes tossed in fiery dragon sauce with cashews and spring onions.';
    return 'Delicious farm-fresh egg preparation.';
  }

  // Veg Starters
  if (cat === 'veg-starters') {
    if (lower.includes('crispy baby corn')) return 'Golden-fried baby corn sticks tossed in zesty garlic sauce and spring onions.';
    if (lower.includes('crispy corn')) return 'Crunchy golden sweet corn kernels tossed with spices, chopped onions and fresh lime juice.';
    if (lower.includes('baby corn 555')) return 'Crispy baby corn batons tossed in signature 555 spicy cashew-garlic sauce.';
    if (lower.includes('baby corn chilly')) return 'Stir-fried baby corn with crunchy bell peppers and spicy Chinese chilli sauce.';
    if (lower.includes('baby corn 65')) return 'Battered baby corn tossed in spicy South Indian red chilli and curd tempering.';
    if (lower.includes('paneer majestic')) return 'Paneer batons tossed in a rich spiced yogurt marinade with mint and green chillies.';
    if (lower.includes('paneer pakoda')) return 'Deep-fried golden gram flour fritters stuffed with soft spiced paneer cubes.';
    if (lower.includes('paneer 65')) return 'Crispy paneer cubes tossed in classic Andhra red masala with curry leaves.';
    if (lower.includes('chilli paneer')) return 'Fresh paneer cubes wok-tossed with capsicum, onion petals and spicy soya sauce.';
    if (lower.includes('paneer manchurian')) return 'Crispy paneer balls simmered in fragrant garlic Manchurian gravy or dry toss.';
    if (lower.includes('gobi manchuria')) return 'Crisp cauliflower florets tossed in tangy Indo-Chinese Manchurian sauce.';
    if (lower.includes('gobi 65')) return 'Deep-fried cauliflower florets seasoned with red chilli spices and curry leaves.';
    if (lower.includes('chilli gobi')) return 'Cauliflower tossed with green chillies, onions and savory soy sauce.';
    if (lower.includes('mushroom pepper')) return 'Fresh button mushrooms pan-roasted with freshly crushed black pepper and onions.';
    if (lower.includes('mushroom chilli')) return 'Crispy button mushrooms wok-tossed with green chillies and bell peppers.';
    if (lower.includes('mushroom 65')) return 'Button mushrooms coated in spicy batter and fried crisp with curry leaves.';
    if (lower.includes('mushroom manchurian')) return 'Mushroom florets tossed in savory garlic Indo-Chinese sauce.';
    if (lower.includes('veg. platter')) return 'Grand platter of assorted vegetarian starters: Paneer Tikka, Baby Corn 555, Crispy Corn & Gobi 65.';
    if (lower.includes('french fries')) return 'Crisp golden salted potato french fries served with ketchup.';
    if (lower.includes('veg. manchurian')) return 'Fried mixed vegetable dumplings tossed in tangy and spicy Manchurian sauce.';
    if (lower.includes('veg. 65')) return 'Crispy mixed vegetable bites tossed in spicy 65 curd tempering.';
    return 'Crispy fresh vegetarian starter prepared to perfection.';
  }

  // Tandoori Fusion
  if (cat === 'tandoori-fusion') {
    if (lower.includes('tandoori chicken')) return 'Whole chicken cuts marinated in Kashmiri red chilli and Greek yogurt, smoked in clay tandoor.';
    if (lower.includes('tangdi kabab')) return 'Plump chicken drumsticks steeped in spiced ginger-garlic yogurt and roasted on skewers.';
    if (lower.includes('grill chicken')) return 'Juicy succulent chicken grilled over glowing coals with house barbecue herbs.';
    if (lower.includes('alfaham chicken')) return 'Authentic Arabian barbecued chicken marinated in Arabian sumac, garlic and lemon herbs.';
    if (lower.includes('malai chicken tikka')) return 'Melt-in-mouth boneless chicken chunks steeped in cream, hung curd, cheese and mild spices.';
    if (lower.includes('chicken tikka')) return 'Classic fiery red chicken cubes roasted on skewers with capsicum and red onions.';
    if (lower.includes('garlic chicken kabab')) return 'Skewered chicken morsels infused with robust roasted garlic marinade and charred in tandoor.';
    if (lower.includes('chicken seekh kabab')) return 'Spiced minced chicken skewers blended with fresh coriander, mint and cooked over charcoal.';
    if (lower.includes('tiger prawns tikka')) return 'Jumbo tiger prawns marinated in carom seeds and tandoori spices, char-grilled (Sunday Special).';
    if (lower.includes('paneer tikka')) return 'Cubes of fresh cottage cheese, capsicum and onions skewered and roasted in clay oven.';
    if (lower.includes('veg. seekh kabab')) return 'Minced spiced garden vegetables and potatoes molded on skewers and tandoor-roasted.';
    return 'Authentic clay-oven tandoori specialty charred over natural coals.';
  }

  // Shawarmas
  if (cat === 'shawarmas') {
    if (lower.includes('special butter shawarma')) return 'Loaded spiced shredded chicken wrap with extra melted butter, creamy garlic toum and pickles.';
    if (lower.includes('butter shawarma')) return 'Shredded rotisserie chicken wrapped in flatbread with generous dollop of butter and garlic sauce.';
    if (lower.includes('kaju shawarma')) return 'Decadent chicken shawarma stuffed with roasted crunchy cashews and rich garlic mayonnaise.';
    if (lower.includes('plate shawarma')) return 'Open plate of slow-roasted chicken shreds served with khubz bread, garlic dip and salad.';
    if (lower.includes('special shawarma')) return 'Extra chicken loaded shawarma roll with crisp fries, pickles and signature garlic toum.';
    if (lower.includes('shawarma')) return 'Classic Arabian slow-turned chicken roll wrapped in soft flatbread with creamy garlic sauce.';
    return 'Delicious Middle Eastern chicken shawarma.';
  }

  // Biriyanis
  if (cat === 'biriyanis') {
    if (lower.includes('chicken dum biryani')) return 'Authentic Hyderabadi slow-cooked dum biryani layered with fragrant basmati, tender chicken and saffron.';
    if (lower.includes('mutton dum biryani')) return 'Royal dum biryani cooked on firewood embers with succulent bone-in goat meat and whole spices.';
    if (lower.includes('chicken fry biryani')) return 'Aromatic biryani rice served with spicy, crispy Andhra fried chicken chunks on top.';
    if (lower.includes('mutton fry biryani')) return 'Fragrant basmati biryani crowned with rich pan-fried mutton pieces and caramelised onions.';
    if (lower.includes('chicken joint biryani')) return 'Full tender whole chicken leg joint roasted and served over spiced dum biryani rice.';
    if (lower.includes('chicken kabab biryani')) return 'Fragrant biryani rice paired with smoky, charred clay-oven chicken kabab skewers.';
    if (lower.includes('lollipop biryani')) return 'Crisp spiced chicken lollipops served atop piping-hot seasoned basmati biryani.';
    if (lower.includes('special chicken biryani')) return 'Vaibhav house special biryani with boneless spiced chicken morsels and cashew nut garnish.';
    if (lower.includes('mughalai chicken biryani')) return 'Rich creamy biryani cooked with mild royal spices, eggs, cashews and tender chicken.';
    if (lower.includes('gongura chicken biryani')) return 'Tangy Andhra biryani infused with authentic sorrel leaves (Gongura) and spicy chicken.';
    if (lower.includes('chicken tikka biryani')) return 'Charred smoky tandoori chicken tikka pieces folded into long-grain saffron dum rice.';
    if (lower.includes('alfaham chicken biryani')) return 'Arabian barbecued Alfaham chicken served over a bed of fragrant spiced dum rice.';
    if (lower.includes('tandoori chicken biryani')) return 'Smoky tandoori chicken leg served atop aromatic Hyderabadi basmati biryani.';
    if (lower.includes('grill chicken biryani')) return 'Coal-grilled barbecue chicken cuts served over steaming hot biryani rice.';
    if (lower.includes('fish biryani')) return 'Delicate spiced fish fillets layered between fragrant saffron basmati rice.';
    if (lower.includes('prawns biryani')) return 'Plump coastal prawns cooked in rich coastal masala and layered with aged basmati rice.';
    if (lower.includes('egg biryani')) return 'Spiced boiled eggs nestled in fragrant dum biryani rice with caramelized onions.';
    if (lower.includes('mixed biryani')) return 'Grand feast biryani packed with a combination of chicken, mutton and prawns.';
    if (lower.includes('rambo chicken biryani')) return 'Fiery house signature biryani tossed with spicy Rambo chicken morsels.';
    if (lower.includes('biryani rice')) return 'Aromatic aged long-grain basmati rice cooked in fragrant biryani spices and ghee.';
    return 'Royal dum biryani prepared with authentic house spices.';
  }

  // Veg Biryani
  if (cat === 'veg-biryani') {
    if (lower.includes('kaju paneer biryani')) return 'Rich vegetarian dum biryani layered with golden paneer cubes and whole roasted cashews.';
    if (lower.includes('kaju biryani')) return 'Fragrant basmati rice dum-cooked with a royal bounty of roasted whole cashew nuts.';
    if (lower.includes('paneer biryani')) return 'Soft spiced paneer cubes layered with aromatic saffron rice, mint and fried onions.';
    if (lower.includes('mushroom biryani')) return 'Tender button mushrooms cooked with biryani spices and layered with fragrant basmati.';
    if (lower.includes('mixed biryani (veg.)')) return 'Assorted garden vegetables, paneer and mushrooms slow-cooked in dum style.';
    if (lower.includes('veg. biryani')) return 'Classic garden vegetable dum biryani cooked with whole spices, carrots, beans and peas.';
    return 'Delicious aromatic vegetarian dum biryani.';
  }

  // Arabic Mandi
  if (cat === 'arabic-mandi') {
    if (lower.includes('vaibhav special mandi')) return 'Royal Arabian mandi platter with lavish char-grilled chicken cuts, fragrant saffron rice and dry fruits.';
    if (lower.includes('alfaham juicy mandi')) return 'Succulent barbecued Alfaham chicken steeped in herb marinade, served on long-grain mandi rice.';
    if (lower.includes('mutton juicy mandi')) return 'Slow-cooked fork-tender mutton pieces resting atop rich Arabian mandi spiced basmati.';
    if (lower.includes('tandoori chicken mandi')) return 'Smoky clay-oven tandoori chicken cuts nestled over fragrant Mandi rice with house dips.';
    if (lower.includes('alfaham chicken mandi')) return 'Traditional Arabic Mandi rice served with succulent barbecued Alfaham chicken cuts.';
    if (lower.includes('chicken mandi')) return 'Classic Yemeni style Mandi rice topped with slow-roasted tender chicken, raisins and fried cashews.';
    return 'Traditional Middle Eastern communal Mandi rice platter.';
  }

  // Fried Rice & Noodles
  if (cat.includes('fried-rice') || cat.includes('noodles') || cat === 'veg-pulavs') {
    if (lower.includes('schezwan')) return 'Wok-tossed in pungent fiery Schezwan red pepper sauce with fresh vegetables.';
    if (lower.includes('hakka')) return 'Classic Indo-Chinese style noodles tossed with crunchy shredded vegetables and white pepper.';
    if (lower.includes('dalkichidi')) return 'Comforting home-style yellow lentil and rice khichdi tempered with cumin and desi ghee.';
    if (lower.includes('zeera rice')) return 'Fluffy basmati rice tempered with roasted fragrant cumin seeds and pure ghee.';
    if (lower.includes('ghee rice')) return 'Rich South Indian style basmati rice gently cooked with whole spices and pure desi ghee.';
    if (lower.includes('pulav')) return 'Fragrant basmati pulav cooked with whole spices, caramelized onions and fresh ingredients.';
    if (cat.includes('noodles')) return 'Wok-tossed noodles with crunchy vegetables, soy sauce and Chinese seasonings.';
    return 'Wok-tossed long grain rice prepared with fresh ingredients and aromatic seasonings.';
  }

  // Breads
  if (cat === 'indian-breads') {
    if (lower.includes('butter naan')) return 'Soft and pillowy clay-oven baked white flour flatbread brushed with generous butter.';
    if (lower.includes('garlic naan')) return 'Tandoor-baked naan infused with minced roasted garlic and fresh coriander.';
    if (lower.includes('plain naan')) return 'Traditional tear-drop shaped flatbread baked against the piping hot tandoor wall.';
    if (lower.includes('butter roti')) return 'Whole wheat tandoori roti freshly baked and topped with melting butter.';
    if (lower.includes('tandoori roti')) return 'Healthy whole wheat flatbread charred to perfection in clay oven.';
    if (lower.includes('rumali roti')) return 'Paper-thin handkerchief soft flatbread baked over an inverted griddle.';
    if (lower.includes('kulcha')) return 'Soft leavened tandoori flatbread with choice fillings and herbs.';
    if (lower.includes('parota')) return 'Multi-layered flaky South Indian flatbread cooked golden on griddle.';
    if (lower.includes('papad')) return 'Crisp roasted or fried spiced lentil wafer.';
    return 'Freshly baked Indian flatbread prepared in traditional tandoor.';
  }

  // Curries
  if (cat.includes('curries') || cat === 'mutton-curry') {
    if (lower.includes('butter chicken')) return 'Tender tandoori chicken pieces simmered in silky, mildly sweet tomato-butter gravy with fenugreek.';
    if (lower.includes('tikka masala')) return 'Char-grilled tikka morsels cooked in rich, spiced onion-tomato gravy with capsicum.';
    if (lower.includes('andhra chicken curry')) return 'Fiery Andhra homestyle chicken gravy with country spices, poppy seeds and coconut.';
    if (lower.includes('rayalaseema')) return 'Spicy regional Rayalaseema gravy cooked with crushed peppercorns and dry roasted spices.';
    if (lower.includes('paneer butter masala')) return 'Soft cottage cheese cubes cooked in velvety smooth tomato, cream and cashew nut gravy.';
    if (lower.includes('kadai')) return 'Cooked in a traditional iron wok with crushed coriander seeds, capsicum and freshly ground kadai spices.';
    if (lower.includes('palak')) return 'Healthy, vibrant pureed spinach gravy infused with garlic, cumin and spices.';
    if (lower.includes('gongura')) return 'Authentic sour and spicy Andhra curry made with freshly pureed red sorrel leaves.';
    if (lower.includes('kaju')) return 'Luxurious rich curry laden with whole roasted cashew nuts in creamy onion gravy.';
    if (lower.includes('dal fry') || lower.includes('dal tadka')) return 'Yellow lentils cooked soft and tempered with ghee, cumin seeds, garlic and red chillies.';
    if (lower.includes('mutton curry')) return 'Slow-simmered tender mutton pieces cooked in rich, aromatic Indian brown onion gravy.';
    return 'Rich, aromatic curry simmered in fragrant house-ground masalas.';
  }

  // Beverages, Shakes, Desserts
  if (cat === 'milkshakes') return 'Thick, creamy rich milkshake blended with whole milk and luscious ice cream.';
  if (cat === 'mocktails') return 'Refreshing hand-crafted signature cooler with crushed ice, citrus and fresh mint.';
  if (cat === 'desserts') {
    if (lower.includes('gulab jamun')) return 'Warm, melt-in-the-mouth golden milk-solid dumplings soaked in rose-cardamom sugar syrup.';
    if (lower.includes('double ka meeta')) return 'Royal Hyderabadi golden fried bread pudding soaked in saffron milk and garnished with nuts.';
    if (lower.includes('kheer')) return 'Traditional rich slow-simmered almond and milk pudding with saffron and cardamom.';
    return 'Delicious traditional sweet treat.';
  }
  if (cat === 'ice-creams') return 'Scoop of premium smooth and creamy dessert ice cream.';
  if (cat === 'beverages') {
    if (lower.includes('lassi')) return 'Thick churned sweet yogurt drink, chilled and refreshing.';
    if (lower.includes('butter milk')) return 'Light, spiced cooling country buttermilk seasoned with ginger, green chillies and curry leaves.';
    if (lower.includes('lemon soda')) return 'Fizzy thirst-quenching soda with freshly squeezed lime juice.';
    return 'Chilled refreshing beverage.';
  }

  // Bucket Biryani
  if (cat === 'bucket-biryani') {
    return 'Grand family party bucket packed with aromatic dum rice, succulent meat pieces, boiled eggs, gravy and raita.';
  }

  return 'Authentic specialty prepared fresh daily with signature house spices.';
}

const finalItems = parsedData.items.map((item, idx) => {
  const desc = generateDescription(item);
  const directEligible = !(
    item.name.toLowerCase() === 'boiled egg' ||
    item.name.toLowerCase().includes('water 1 litre') ||
    item.name.toLowerCase().includes('plain papad')
  );

  return {
    id: `dish-${item.itemNumber}`,
    name: item.name,
    category: item.category,
    price: item.price,
    description: desc,
    isVeg: item.isVeg,
    isChefSpecial: item.isChefSpecial,
    portionNote: item.portionNote,
    directOrderEligible: directEligible
  };
});

console.log(`Generated all ${finalItems.length} items with complete descriptions.`);

fs.writeFileSync(
  path.join(__dirname, 'all_284_menu_items.json'),
  JSON.stringify(finalItems, null, 2)
);
console.log('Saved to scratch/all_284_menu_items.json');
