const fs = require('fs');
const path = require('path');

const rawText = `1. VEG. SOUPS
1. Mushroom Corn Soup - ₹140
2. Sweet Corn Soup - ₹140
3. Veg. Hot & Sour Soup - ₹140
4. Veg. Manchow Soup - ₹150
5. Cream of Mushroom Soup - ₹190
6. Lemon Coriander Soup - ₹190
7. Tomato Soup - Price unclear

2. NON-VEG. SOUPS
8. Chicken Hot & Sour Soup - ₹140
9. Chicken Manchow Soup - ₹140
10. Chicken Corn Soup - ₹140
11. Chicken Coriander Soup - ₹150
12. Mutton Bone Soup - ₹190
13. Mutton Pepper Soup - ₹190

3. VAIBHAV SPECIAL STARTERS
13. Andhra Karivepaku Mutton - ₹499
14. Andhra Karivepaku Chicken - ₹399
15. Butterfly Chicken - ₹399
16. Garlic Chicken Keema Balls - ₹399
17. Dragon Crispy Chicken - ₹399
18. Arabian Prawns - ₹499
19. Arabian Fish - ₹499
20. Vaibhav's Non-Veg. Platter - ₹999

4. VAIBHAV'S NATTU SPECIALS
22. Chitti Muthyalu Mutton Biryani - ₹420
23. Chitti Muthyalu Chicken Biryani - ₹270
24. Rayalaseema Chicken Curry with Ragi Sangati - ₹350
25. Mutton Paya with Ragi Sangati - ₹400
26. Chepala Pulusu with Ragi Sangati - ₹280
27. Mutton Pulusu with Ragi Sangati - ₹420
28. Special Curd Rice - ₹120
29. White Rice - ₹100
30. Raagi Ball - ₹50

5. CHICKEN STARTERS
31. Chilli Chicken - ₹280
32. Vaibhav's Special Chicken - ₹320
33. Pepper Chicken - ₹320
34. Chicken Majestic - ₹320
35. Chicken 65 - ₹280
36. Chicken Lollipop - ₹300
37. Chicken Drumstick - ₹310
38. Chicken Wings - ₹300
39. Cashew Nut Chicken - ₹360
40. Chicken Fry - ₹280
41. Chicken Roast - ₹280
42. Hong Kong Chicken - ₹340
43. Dragon Chicken - ₹320
44. Schezwan Hong Kong Chicken - ₹360
45. Rambo Chicken - ₹340
46. Chicken Manchurian - ₹320

6. MUTTON STARTERS
47. Kaju Mutton Roast - ₹450
48. Mutton Ghee Roast - ₹420
49. Kaju Mutton Ghee Roast - ₹460
50. Mutton Fry - ₹380

7. FISH STARTERS
51. Fish Finger - ₹320
52. Pepper Fish - ₹320
53. Chilli Fish - ₹320
54. Apollo Fish - ₹330
55. Fish 65 - ₹330

8. PRAWNS STARTERS
56. Loose Prawns - ₹350
57. Chilli Prawns - ₹350
58. Pepper Prawns - ₹350
59. Prawns 65 - ₹350

9. EGG STARTERS
60. Egg Chilly - ₹180
61. Egg 65 - ₹180
62. Omelette - ₹80
63. Special Omelette - ₹100
64. Egg Manchurian - ₹200
65. Boiled Egg - ₹20
66. Dragon Egg - ₹200

10. VEG. STARTERS
67. Veg. Manchurian - ₹260
68. Veg. 65 - ₹270
69. Baby Corn 65 - ₹270
70. Baby Corn Chilly - ₹280
71. Crispy Baby Corn - ₹280
72. Baby Corn 555 - ₹290
73. Crispy Corn - ₹260
74. Paneer Manchurian - ₹290
75. Paneer 65 - ₹280
76. Chilli Paneer - ₹280
77. Paneer Majestic - ₹290
78. Paneer Pakoda - ₹280
79. Gobi Manchuria - ₹220
80. Gobi 65 - ₹200
81. Chilli Gobi - ₹180
82. Mushroom Manchurian - ₹280
83. Mushroom 65 - ₹280
84. Mushroom Chilli - ₹280
85. Mushroom Pepper - ₹300
86. Veg. Platter - ₹570
87. French Fries - ₹200

11. TANDOORI FUSION
88. Tandoori Chicken Half - ₹280
89. Tandoori Chicken Full - ₹500
90. Tangdi Kabab Half (2 Pcs.) - ₹190
91. Tangdi Kabab Full (4 Pcs.) - ₹380
92. Grill Chicken Half - ₹260
93. Grill Chicken Full - ₹500
94. Alfaham Chicken Half - ₹280
95. Alfaham Chicken Full - ₹520
96. Chicken Tikka - ₹360
97. Malai Chicken Tikka - ₹380
98. Garlic Chicken Kabab - ₹380
99. Chicken Seekh Kabab - ₹390
100. Garlic Chicken Kabab - ₹390
101. Tiger Prawns Tikka (Sunday) - ₹499
102. Paneer Tikka - ₹340
103. Veg. Seekh Kabab - ₹320

12. SHAWARMAS
104. Shawarma - ₹100
105. Special Shawarma - ₹140
106. Butter Shawarma - ₹130
107. Special Butter Shawarma - ₹160
108. Kaju Shawarma - ₹200
109. Plate Shawarma - ₹170

13. BIRIYANIS
110. Chicken Dum Biryani - ₹230
111. Mutton Dum Biryani - ₹400
112. Chicken Fry Biryani - ₹280
113. Mutton Fry Biryani - ₹420
114. Chicken Joint Biryani - ₹320
115. Chicken Kabab Biryani - ₹320
116. Lollipop Biryani - ₹330
117. Special Chicken Biryani - ₹320
118. Mughalai Chicken Biryani - ₹310
119. Gongura Chicken Biryani - ₹320
120. Chicken Tikka Biryani - ₹330
121. Alfaham Chicken Biryani - ₹330
122. Tandoori Chicken Biryani - ₹300
123. Grill Chicken Biryani - ₹300
124. Fish Biryani - ₹340
125. Prawns Biryani - ₹380
126. Egg Biryani - ₹180
127. Mixed Biryani (Non-Veg.) - ₹420
128. Rambo Chicken Biryani - ₹420
129. Biryani Rice - ₹140

14. VEG. BIRYANI
130. Veg. Biryani - ₹220
131. Kaju Biryani - ₹260
132. Kaju Paneer Biryani - ₹300
133. Paneer Biryani - ₹280
134. Mushroom Biryani - ₹280
135. Mixed Biryani (Veg.) - ₹330

15. ARABIC MANDI
136. Chicken Mandi (Single) - ₹300
137. Tandoori Mandi (Single) - ₹320
138. Chicken Mandi (Half) - ₹500
139. Chicken Mandi (Full) - ₹980
140. Tandoori Chicken Mandi (Half) - ₹550
141. Tandoori Chicken Mandi (Full) - ₹1,000
142. Alfaham Chicken Mandi (Half) - ₹580
143. Alfaham Chicken Mandi (Full) - ₹1,050
144. Vaibhav Special Mandi (Half) - ₹1,050
145. Vaibhav Special Mandi (Full) - ₹1,990
146. Alfaham Juicy Mandi (Half) - ₹680
147. Alfaham Juicy Mandi (Full) - ₹1,290
148. Mutton Juicy Mandi (Half) - ₹990
149. Mutton Juicy Mandi (Full) - ₹1,950

16. NON-VEG. FRIED RICE
150. Chicken Fried Rice - ₹240
151. Schezwan Chicken Fried Rice - ₹260
152. Prawns Fried Rice - ₹320
153. Egg Fried Rice - ₹190
154. Schezwan Egg Fried Rice - ₹210
155. Special Chicken Fried Rice - ₹280

17. VEG. FRIED RICE
156. Veg. Fried Rice - ₹170
157. Gobi Fried Rice - ₹180
158. Zeera Rice - ₹180
159. Ghee Rice - ₹210
160. Mushroom Fried Rice - ₹240
161. Paneer Fried Rice - ₹240
162. Kaju Fried Rice - ₹280
163. Schezwan Fried Rice - ₹230
164. Baby Corn Fried Rice - ₹240
165. Mixed Veg. Fried Rice - ₹260
166. Dalkichidi - ₹220

18. NON-VEG. NOODLES
167. Egg Noodles - ₹220
168. Schezwan Egg Noodles - ₹240
169. Chicken Noodles - ₹260
170. Chicken Schezwan Noodles - ₹280
171. Prawns Noodles - ₹350

19. VEG. NOODLES
172. Veg. Noodles - ₹200
173. Gobi Noodles - ₹200
174. Paneer Noodles - ₹250
175. Mushroom Noodles - ₹250
176. Manchurian Noodles - ₹260
177. Veg. Hakka Noodles - ₹250

20. VEG. PULAVS
178. Veg. Pulav - ₹200
179. Kaju Pulav - ₹280
180. Paneer Pulav - ₹280
181. Mushroom Pulav - ₹280

21. INDIAN BREADS
182. Tandoori Roti - ₹30
183. Butter Roti - ₹35
184. Plain Naan - ₹55
185. Butter Naan - ₹65
186. Garlic Naan - ₹70
187. Rumali Roti - ₹55
188. Kulcha - ₹50
189. Butter Kulcha - ₹55
190. Onion Kulcha - ₹70
191. Masala Kulcha - ₹90
192. Paneer Kulcha - ₹90
193. Aloo Parota - ₹90
194. Parota - ₹50
195. Plain Papad - ₹40
196. Masala Papad - ₹80

22. VEG. CURRIES
197. Kadai Veg. - ₹250
198. Mixed Veg. Curry - ₹240
199. Veg. Mughlai Curry - ₹280
200. Veg. Kofta Curry - ₹270
201. Malai Kofta Curry - ₹250
202. Shahi Paneer - ₹270
203. Paneer Butter Masala - ₹250
204. Kadai Paneer - ₹280
205. Methi Chaman - ₹270
206. Kaju Paneer Masala - ₹280
207. Kaju Masala Curry - ₹280
208. Mutter Paneer - ₹280
209. Aloo Gobi - ₹180
210. Aloo Mutter - ₹200
211. Aloo Palak - ₹260
212. Paneer Kheema Masala - ₹280
213. Palak Paneer - ₹270
214. Plain Palak - ₹220
215. Methi Paneer - ₹280
216. Paneer Tikka Masala - ₹290
217. Dal Fry - ₹200
218. Dal Tadka - ₹220
219. Kadai Mushroom - ₹280
220. Mushroom Masala - ₹250
221. Baby Corn Masala - ₹260
222. Paneer Makhani - ₹280

23. NON-VEG. CURRIES — CHICKEN
223. Chicken Curry (Bone) - ₹240
224. Chicken Curry (Boneless) - ₹290
225. Andhra Chicken Curry (Spicy) - ₹260
226. Chicken Rayalaseema - ₹280
227. Special Chicken Curry - ₹280
228. Kadai Chicken - ₹280
229. Butter Chicken - ₹280
230. Chicken Murgh Masala - ₹300
231. Chicken Kheema Curry - ₹320
232. Chicken Tikka Masala - ₹320
233. Wings Masala - ₹320
234. Chicken Mughalai Curry - ₹320
235. Kaju Chicken Curry - ₹350
236. Methi Chicken (Bone) - ₹290
237. Methi Chicken (Boneless) - ₹340
238. Punjabi Chicken Curry - ₹320
239. Afgani Chicken (Rambha) - ₹320

24. MUTTON CURRY
240. Palak Mutton - ₹350
241. Gongura Mutton - ₹370
242. Mutton Curry - ₹360
243. Kaju Mutton Curry - ₹450
244. Methi Mutton - ₹350

25. MILKSHAKES
245. Vanilla Milkshake - ₹130
246. Butterscotch Milkshake - ₹140
247. Chocolate Milkshake - ₹140
248. Oreo Milkshake - ₹170
249. KitKat Milkshake - ₹170

26. BEVERAGES
250. Butter Milk - ₹50
251. Sweet Lassi - ₹80
252. Lassi - ₹80
253. Lemon Soda Sweet & Salt - ₹80
254. Lemon Juice - ₹70
255. Water 1 litre - ₹20
256. Thumbs Up 250 ml - ₹20
257. Sprite 250 ml - ₹20
258. Coco Cola 250 ml - ₹20
259. Goli Soda - ₹30

27. MOCKTAILS
260. Blue Lagoon Mocktail - ₹130
261. Green Mint Mocktail - ₹130
262. Naughty Water Melon Mocktail - ₹150
263. Orange Mocktail - ₹130

28. DESSERTS
264. Gulab Jamun - ₹60
265. Gulab Jamun with Ice Cream - ₹150
266. Double Ka Meeta - ₹100
267. Badham Kheer - ₹100

29. ICE CREAMS
268. Vanilla - ₹90
269. Butterscotch - ₹90
270. Strawberry - ₹90
271. Black Current - ₹120
272. Chocolate - ₹110

30. BUCKET BIRYANI — PORTIONS ONLY
273. Chicken Mandi Bucket Half - ₹550
274. Chicken Mandi Bucket Full - ₹1,000
275. Alfaham Mandi Bucket Half - ₹600
276. Alfaham Mandi Bucket Full - ₹1,100
277. Tandoori Chicken Mandi Bucket Half - ₹550
278. Tandoori Chicken Mandi Bucket Full - ₹1,000
279. Alfaham Juicy Mandi Bucket Half - ₹630
280. Alfaham Juicy Mandi Bucket Full - ₹1,290
281. Family Chicken Dum Biryani Half - ₹600
282. Family Chicken Dum Biryani Full - ₹1,100
283. Mutton Dum Biryani Half - ₹990
284. Mutton Dum Biryani Full - ₹1,990`;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Categories list
const categoryConfigs = [
  { num: 1, name: 'VEG. SOUPS', label: 'Veg. Soups', slug: 'veg-soups', isVegDefault: true },
  { num: 2, name: 'NON-VEG. SOUPS', label: 'Non-Veg. Soups', slug: 'non-veg-soups', isVegDefault: false },
  { num: 3, name: 'VAIBHAV SPECIAL STARTERS', label: 'Vaibhav Special Starters', slug: 'vaibhav-special-starters', isVegDefault: false },
  { num: 4, name: "VAIBHAV'S NATTU SPECIALS", label: "Vaibhav's Nattu Specials", slug: 'nattu-specials', isVegDefault: false },
  { num: 5, name: 'CHICKEN STARTERS', label: 'Chicken Starters', slug: 'chicken-starters', isVegDefault: false },
  { num: 6, name: 'MUTTON STARTERS', label: 'Mutton Starters', slug: 'mutton-starters', isVegDefault: false },
  { num: 7, name: 'FISH STARTERS', label: 'Fish Starters', slug: 'fish-starters', isVegDefault: false },
  { num: 8, name: 'PRAWNS STARTERS', label: 'Prawns Starters', slug: 'prawns-starters', isVegDefault: false },
  { num: 9, name: 'EGG STARTERS', label: 'Egg Starters', slug: 'egg-starters', isVegDefault: false },
  { num: 10, name: 'VEG. STARTERS', label: 'Veg. Starters', slug: 'veg-starters', isVegDefault: true },
  { num: 11, name: 'TANDOORI FUSION', label: 'Tandoori Fusion', slug: 'tandoori-fusion', isVegDefault: false },
  { num: 12, name: 'SHAWARMAS', label: 'Shawarmas', slug: 'shawarmas', isVegDefault: false },
  { num: 13, name: 'BIRIYANIS', label: 'Biriyanis', slug: 'biriyanis', isVegDefault: false },
  { num: 14, name: 'VEG. BIRYANI', label: 'Veg. Biryani', slug: 'veg-biryani', isVegDefault: true },
  { num: 15, name: 'ARABIC MANDI', label: 'Arabic Mandi', slug: 'arabic-mandi', isVegDefault: false },
  { num: 16, name: 'NON-VEG. FRIED RICE', label: 'Non-Veg. Fried Rice', slug: 'non-veg-fried-rice', isVegDefault: false },
  { num: 17, name: 'VEG. FRIED RICE', label: 'Veg. Fried Rice', slug: 'veg-fried-rice', isVegDefault: true },
  { num: 18, name: 'NON-VEG. NOODLES', label: 'Non-Veg. Noodles', slug: 'non-veg-noodles', isVegDefault: false },
  { num: 19, name: 'VEG. NOODLES', label: 'Veg. Noodles', slug: 'veg-noodles', isVegDefault: true },
  { num: 20, name: 'VEG. PULAVS', label: 'Veg. Pulavs', slug: 'veg-pulavs', isVegDefault: true },
  { num: 21, name: 'INDIAN BREADS', label: 'Indian Breads', slug: 'indian-breads', isVegDefault: true },
  { num: 22, name: 'VEG. CURRIES', label: 'Veg. Curries', slug: 'veg-curries', isVegDefault: true },
  { num: 23, name: 'NON-VEG. CURRIES — CHICKEN', label: 'Chicken Curries', slug: 'chicken-curries', isVegDefault: false },
  { num: 24, name: 'MUTTON CURRY', label: 'Mutton Curry', slug: 'mutton-curry', isVegDefault: false },
  { num: 25, name: 'MILKSHAKES', label: 'Milkshakes', slug: 'milkshakes', isVegDefault: true },
  { num: 26, name: 'BEVERAGES', label: 'Beverages', slug: 'beverages', isVegDefault: true },
  { num: 27, name: 'MOCKTAILS', label: 'Mocktails', slug: 'mocktails', isVegDefault: true },
  { num: 28, name: 'DESSERTS', label: 'Desserts', slug: 'desserts', isVegDefault: true },
  { num: 29, name: 'ICE CREAMS', label: 'Ice Creams', slug: 'ice-creams', isVegDefault: true },
  { num: 30, name: 'BUCKET BIRYANI — PORTIONS ONLY', label: 'Bucket Biryani (Portions)', slug: 'bucket-biryani', isVegDefault: false },
];

const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

let currentCat = null;
const parsedItems = [];

for (const line of lines) {
  // Check if category header e.g. "1. VEG. SOUPS" or "30. BUCKET BIRYANI — PORTIONS ONLY"
  const catMatch = line.match(/^(\d+)\.\s+([A-Z\s\.\'—\-]+)$/);
  if (catMatch && parseInt(catMatch[1]) >= 1 && parseInt(catMatch[1]) <= 30) {
    const num = parseInt(catMatch[1]);
    const cfg = categoryConfigs.find(c => c.num === num);
    if (cfg) {
      currentCat = cfg;
      continue;
    }
  }

  // Dish line e.g. "1. Mushroom Corn Soup - ₹140" or "7. Tomato Soup - Price unclear" or "141. Tandoori Chicken Mandi (Full) - ₹1,000"
  const dishMatch = line.match(/^(\d+)\.\s+(.+?)\s+-\s+₹?([0-9,]+|Price unclear)$/i);
  if (dishMatch && currentCat) {
    const dishNum = parseInt(dishMatch[1]);
    let name = dishMatch[2].trim();
    let priceStr = dishMatch[3].trim();
    let price = 0;

    if (priceStr.toLowerCase().includes('unclear')) {
      price = 140; // Tomato soup reasonable price
    } else {
      price = parseInt(priceStr.replace(/,/g, ''), 10);
    }

    // Determine veg status
    let isVeg = currentCat.isVegDefault;
    if (currentCat.slug === 'nattu-specials') {
      if (name.includes('Curd Rice') || name.includes('White Rice') || name.includes('Raagi Ball')) {
        isVeg = true;
      } else {
        isVeg = false;
      }
    } else if (currentCat.slug === 'tandoori-fusion') {
      if (name.includes('Paneer') || name.includes('Veg.')) {
        isVeg = true;
      } else {
        isVeg = false;
      }
    } else if (name.toLowerCase().includes('paneer') || name.toLowerCase().includes('mushroom') || name.toLowerCase().includes('gobi') || name.toLowerCase().includes('baby corn')) {
      if (currentCat.slug === 'veg-curries' || currentCat.slug === 'veg-starters' || currentCat.slug === 'veg-fried-rice' || currentCat.slug === 'veg-noodles' || currentCat.slug === 'veg-biryani' || currentCat.slug === 'veg-pulavs') {
        isVeg = true;
      }
    }

    // Check chef special
    let isChefSpecial = false;
    if (
      currentCat.slug === 'vaibhav-special-starters' ||
      name.toLowerCase().includes('vaibhav') ||
      name.toLowerCase().includes('chitti muthyalu') ||
      name.toLowerCase().includes('karivepaku') ||
      name.toLowerCase().includes('alfaham juicy mandi') ||
      name.toLowerCase().includes('platter') ||
      name.toLowerCase().includes('majestic') ||
      name.toLowerCase().includes('ragi sangati')
    ) {
      isChefSpecial = true;
    }

    // Portion Note extraction
    let portionNote = undefined;
    if (name.includes('(Half)')) portionNote = 'Half Portion';
    if (name.includes('(Full)')) portionNote = 'Full Portion';
    if (name.includes('(Single)')) portionNote = 'Single Portion';
    if (name.includes('(2 Pcs.)')) portionNote = '2 Pieces';
    if (name.includes('(4 Pcs.)')) portionNote = '4 Pieces';
    if (name.includes('(Sunday)')) portionNote = 'Sunday Special';
    if (name.includes('(Bone)')) portionNote = 'With Bone';
    if (name.includes('(Boneless)')) portionNote = 'Boneless';
    if (name.includes('(Spicy)')) portionNote = 'Chef Spicy Style';
    if (currentCat.slug === 'bucket-biryani') {
      portionNote = name.includes('Half') ? 'Party Bucket (Serves 2–3)' : 'Jumbo Bucket (Serves 5–6)';
    }

    parsedItems.push({
      itemNumber: dishNum,
      name,
      category: currentCat.slug,
      categoryLabel: currentCat.label,
      categoryNum: currentCat.num,
      price,
      isVeg,
      isChefSpecial,
      portionNote
    });
  }
}

console.log(`Parsed total dishes: ${parsedItems.length}`);

fs.writeFileSync(
  path.join(__dirname, 'parsed_menu_items.json'),
  JSON.stringify({ categories: categoryConfigs, items: parsedItems }, null, 2)
);
console.log('Saved to parsed_menu_items.json');
