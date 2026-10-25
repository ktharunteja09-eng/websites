-- Reset and re-seed all 284 menu items with dine-in prices
DELETE FROM menu_items;
    -- Category 1. VEG. SOUPS (7 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Mushroom Corn Soup', 'veg-soups', 140, 170, true, true, false, current_date),
      ('Sweet Corn Soup', 'veg-soups', 140, 170, true, true, false, current_date),
      ('Veg. Hot & Sour Soup', 'veg-soups', 140, 170, true, true, false, current_date),
      ('Veg. Manchow Soup', 'veg-soups', 150, 180, true, true, false, current_date),
      ('Cream of Mushroom Soup', 'veg-soups', 190, 230, true, true, false, current_date),
      ('Lemon Coriander Soup', 'veg-soups', 190, 230, true, true, false, current_date),
      ('Tomato Soup', 'veg-soups', 140, 170, true, true, false, current_date);

    -- Category 2. NON-VEG. SOUPS (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Hot & Sour Soup', 'non-veg-soups', 140, 170, false, true, false, current_date),
      ('Chicken Manchow Soup', 'non-veg-soups', 140, 170, false, true, false, current_date),
      ('Chicken Corn Soup', 'non-veg-soups', 140, 170, false, true, false, current_date),
      ('Chicken Coriander Soup', 'non-veg-soups', 150, 180, false, true, false, current_date),
      ('Mutton Bone Soup', 'non-veg-soups', 190, 230, false, true, false, current_date),
      ('Mutton Pepper Soup', 'non-veg-soups', 190, 230, false, true, false, current_date);

    -- Category 3. VAIBHAV SPECIAL STARTERS (8 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Andhra Karivepaku Mutton', 'vaibhav-special-starters', 499, 600, false, true, false, current_date),
      ('Andhra Karivepaku Chicken', 'vaibhav-special-starters', 399, 480, false, true, false, current_date),
      ('Butterfly Chicken', 'vaibhav-special-starters', 399, 480, false, true, false, current_date),
      ('Garlic Chicken Keema Balls', 'vaibhav-special-starters', 399, 480, false, true, false, current_date),
      ('Dragon Crispy Chicken', 'vaibhav-special-starters', 399, 480, false, true, false, current_date),
      ('Arabian Prawns', 'vaibhav-special-starters', 499, 600, false, true, false, current_date),
      ('Arabian Fish', 'vaibhav-special-starters', 499, 600, false, true, false, current_date),
      ('Vaibhav''s Non-Veg. Platter', 'vaibhav-special-starters', 999, 1200, false, true, false, current_date);

    -- Category 4. VAIBHAV'S NATTU SPECIALS (9 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chitti Muthyalu Mutton Biryani', 'nattu-specials', 420, 500, false, true, false, current_date),
      ('Chitti Muthyalu Chicken Biryani', 'nattu-specials', 270, 320, false, true, false, current_date),
      ('Rayalaseema Chicken Curry with Ragi Sangati', 'nattu-specials', 350, 420, false, true, false, current_date),
      ('Mutton Paya with Ragi Sangati', 'nattu-specials', 400, 480, false, true, false, current_date),
      ('Chepala Pulusu with Ragi Sangati', 'nattu-specials', 280, 340, false, true, false, current_date),
      ('Mutton Pulusu with Ragi Sangati', 'nattu-specials', 420, 500, false, true, false, current_date),
      ('Special Curd Rice', 'nattu-specials', 120, 140, true, true, false, current_date),
      ('White Rice', 'nattu-specials', 100, 120, true, true, false, current_date),
      ('Raagi Ball', 'nattu-specials', 50, 60, true, true, false, current_date);

    -- Category 5. CHICKEN STARTERS (16 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chilli Chicken', 'chicken-starters', 280, 340, false, true, false, current_date),
      ('Vaibhav''s Special Chicken', 'chicken-starters', 320, 380, false, true, false, current_date),
      ('Pepper Chicken', 'chicken-starters', 320, 380, false, true, false, current_date),
      ('Chicken Majestic', 'chicken-starters', 320, 380, false, true, false, current_date),
      ('Chicken 65', 'chicken-starters', 280, 340, false, true, false, current_date),
      ('Chicken Lollipop', 'chicken-starters', 300, 360, false, true, false, current_date),
      ('Chicken Drumstick', 'chicken-starters', 310, 370, false, true, false, current_date),
      ('Chicken Wings', 'chicken-starters', 300, 360, false, true, false, current_date),
      ('Cashew Nut Chicken', 'chicken-starters', 360, 430, false, true, false, current_date),
      ('Chicken Fry', 'chicken-starters', 280, 340, false, true, false, current_date),
      ('Chicken Roast', 'chicken-starters', 280, 340, false, true, false, current_date),
      ('Hong Kong Chicken', 'chicken-starters', 340, 410, false, true, false, current_date),
      ('Dragon Chicken', 'chicken-starters', 320, 380, false, true, false, current_date),
      ('Schezwan Hong Kong Chicken', 'chicken-starters', 360, 430, false, true, false, current_date),
      ('Rambo Chicken', 'chicken-starters', 340, 410, false, true, false, current_date),
      ('Chicken Manchurian', 'chicken-starters', 320, 380, false, true, false, current_date);

    -- Category 6. MUTTON STARTERS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Kaju Mutton Roast', 'mutton-starters', 450, 540, false, true, false, current_date),
      ('Mutton Ghee Roast', 'mutton-starters', 420, 500, false, true, false, current_date),
      ('Kaju Mutton Ghee Roast', 'mutton-starters', 460, 550, false, true, false, current_date),
      ('Mutton Fry', 'mutton-starters', 380, 460, false, true, false, current_date);

    -- Category 7. FISH STARTERS (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Fish Finger', 'fish-starters', 320, 380, false, true, false, current_date),
      ('Pepper Fish', 'fish-starters', 320, 380, false, true, false, current_date),
      ('Chilli Fish', 'fish-starters', 320, 380, false, true, false, current_date),
      ('Apollo Fish', 'fish-starters', 330, 400, false, true, false, current_date),
      ('Fish 65', 'fish-starters', 330, 400, false, true, false, current_date);

    -- Category 8. PRAWNS STARTERS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Loose Prawns', 'prawns-starters', 350, 420, false, true, false, current_date),
      ('Chilli Prawns', 'prawns-starters', 350, 420, false, true, false, current_date),
      ('Pepper Prawns', 'prawns-starters', 350, 420, false, true, false, current_date),
      ('Prawns 65', 'prawns-starters', 350, 420, false, true, false, current_date);

    -- Category 9. EGG STARTERS (7 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Egg Chilly', 'egg-starters', 180, 220, false, true, false, current_date),
      ('Egg 65', 'egg-starters', 180, 220, false, true, false, current_date),
      ('Omelette', 'egg-starters', 80, 100, false, true, false, current_date),
      ('Special Omelette', 'egg-starters', 100, 120, false, true, false, current_date),
      ('Egg Manchurian', 'egg-starters', 200, 240, false, true, false, current_date),
      ('Boiled Egg', 'egg-starters', 20, 20, false, false, false, current_date),
      ('Dragon Egg', 'egg-starters', 200, 240, false, true, false, current_date);

    -- Category 10. VEG. STARTERS (21 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Manchurian', 'veg-starters', 260, 310, true, true, false, current_date),
      ('Veg. 65', 'veg-starters', 270, 320, true, true, false, current_date),
      ('Baby Corn 65', 'veg-starters', 270, 320, true, true, false, current_date),
      ('Baby Corn Chilly', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Crispy Baby Corn', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Baby Corn 555', 'veg-starters', 290, 350, true, true, false, current_date),
      ('Crispy Corn', 'veg-starters', 260, 310, true, true, false, current_date),
      ('Paneer Manchurian', 'veg-starters', 290, 350, true, true, false, current_date),
      ('Paneer 65', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Chilli Paneer', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Paneer Majestic', 'veg-starters', 290, 350, true, true, false, current_date),
      ('Paneer Pakoda', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Gobi Manchuria', 'veg-starters', 220, 260, true, true, false, current_date),
      ('Gobi 65', 'veg-starters', 200, 240, true, true, false, current_date),
      ('Chilli Gobi', 'veg-starters', 180, 220, true, true, false, current_date),
      ('Mushroom Manchurian', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Mushroom 65', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Mushroom Chilli', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Mushroom Pepper', 'veg-starters', 300, 360, true, true, false, current_date),
      ('Veg. Platter', 'veg-starters', 570, 680, true, true, false, current_date),
      ('French Fries', 'veg-starters', 200, 240, true, true, false, current_date);

    -- Category 11. TANDOORI FUSION (16 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Tandoori Chicken Half', 'tandoori-fusion', 280, 340, false, true, false, current_date),
      ('Tandoori Chicken Full', 'tandoori-fusion', 500, 600, false, true, false, current_date),
      ('Tangdi Kabab Half (2 Pcs.)', 'tandoori-fusion', 190, 230, false, true, false, current_date),
      ('Tangdi Kabab Full (4 Pcs.)', 'tandoori-fusion', 380, 460, false, true, false, current_date),
      ('Grill Chicken Half', 'tandoori-fusion', 260, 310, false, true, false, current_date),
      ('Grill Chicken Full', 'tandoori-fusion', 500, 600, false, true, false, current_date),
      ('Alfaham Chicken Half', 'tandoori-fusion', 280, 340, false, true, false, current_date),
      ('Alfaham Chicken Full', 'tandoori-fusion', 520, 620, false, true, false, current_date),
      ('Chicken Tikka', 'tandoori-fusion', 360, 430, false, true, false, current_date),
      ('Malai Chicken Tikka', 'tandoori-fusion', 380, 460, false, true, false, current_date),
      ('Garlic Chicken Kabab', 'tandoori-fusion', 380, 460, false, true, false, current_date),
      ('Chicken Seekh Kabab', 'tandoori-fusion', 390, 470, false, true, false, current_date),
      ('Garlic Chicken Kabab', 'tandoori-fusion', 390, 470, false, true, false, current_date),
      ('Tiger Prawns Tikka (Sunday)', 'tandoori-fusion', 499, 600, false, true, false, current_date),
      ('Paneer Tikka', 'tandoori-fusion', 340, 410, true, true, false, current_date),
      ('Veg. Seekh Kabab', 'tandoori-fusion', 320, 380, true, true, false, current_date);

    -- Category 12. SHAWARMAS (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Shawarma', 'shawarmas', 100, 120, false, true, false, current_date),
      ('Special Shawarma', 'shawarmas', 140, 170, false, true, false, current_date),
      ('Butter Shawarma', 'shawarmas', 130, 160, false, true, false, current_date),
      ('Special Butter Shawarma', 'shawarmas', 160, 190, false, true, false, current_date),
      ('Kaju Shawarma', 'shawarmas', 200, 240, false, true, false, current_date),
      ('Plate Shawarma', 'shawarmas', 170, 200, false, true, false, current_date);

    -- Category 13. BIRIYANIS (20 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Dum Biryani', 'biriyanis', 230, 280, false, true, false, current_date),
      ('Mutton Dum Biryani', 'biriyanis', 400, 480, false, true, false, current_date),
      ('Chicken Fry Biryani', 'biriyanis', 280, 340, false, true, false, current_date),
      ('Mutton Fry Biryani', 'biriyanis', 420, 500, false, true, false, current_date),
      ('Chicken Joint Biryani', 'biriyanis', 320, 380, false, true, false, current_date),
      ('Chicken Kabab Biryani', 'biriyanis', 320, 380, false, true, false, current_date),
      ('Lollipop Biryani', 'biriyanis', 330, 400, false, true, false, current_date),
      ('Special Chicken Biryani', 'biriyanis', 320, 380, false, true, false, current_date),
      ('Mughalai Chicken Biryani', 'biriyanis', 310, 370, false, true, false, current_date),
      ('Gongura Chicken Biryani', 'biriyanis', 320, 380, false, true, false, current_date),
      ('Chicken Tikka Biryani', 'biriyanis', 330, 400, false, true, false, current_date),
      ('Alfaham Chicken Biryani', 'biriyanis', 330, 400, false, true, false, current_date),
      ('Tandoori Chicken Biryani', 'biriyanis', 300, 360, false, true, false, current_date),
      ('Grill Chicken Biryani', 'biriyanis', 300, 360, false, true, false, current_date),
      ('Fish Biryani', 'biriyanis', 340, 410, false, true, false, current_date),
      ('Prawns Biryani', 'biriyanis', 380, 460, false, true, false, current_date),
      ('Egg Biryani', 'biriyanis', 180, 220, false, true, false, current_date),
      ('Mixed Biryani (Non-Veg.)', 'biriyanis', 420, 500, false, true, false, current_date),
      ('Rambo Chicken Biryani', 'biriyanis', 420, 500, false, true, false, current_date),
      ('Biryani Rice', 'biriyanis', 140, 170, false, true, false, current_date);

    -- Category 14. VEG. BIRYANI (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Biryani', 'veg-biryani', 220, 260, true, true, false, current_date),
      ('Kaju Biryani', 'veg-biryani', 260, 310, true, true, false, current_date),
      ('Kaju Paneer Biryani', 'veg-biryani', 300, 360, true, true, false, current_date),
      ('Paneer Biryani', 'veg-biryani', 280, 340, true, true, false, current_date),
      ('Mushroom Biryani', 'veg-biryani', 280, 340, true, true, false, current_date),
      ('Mixed Biryani (Veg.)', 'veg-biryani', 330, 400, true, true, false, current_date);

    -- Category 15. ARABIC MANDI (14 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Mandi (Single)', 'arabic-mandi', 300, 360, false, true, false, current_date),
      ('Tandoori Mandi (Single)', 'arabic-mandi', 320, 380, false, true, false, current_date),
      ('Chicken Mandi (Half)', 'arabic-mandi', 500, 600, false, true, false, current_date),
      ('Chicken Mandi (Full)', 'arabic-mandi', 980, 1180, false, true, false, current_date),
      ('Tandoori Chicken Mandi (Half)', 'arabic-mandi', 550, 660, false, true, false, current_date),
      ('Tandoori Chicken Mandi (Full)', 'arabic-mandi', 1000, 1200, false, true, false, current_date),
      ('Alfaham Chicken Mandi (Half)', 'arabic-mandi', 580, 700, false, true, false, current_date),
      ('Alfaham Chicken Mandi (Full)', 'arabic-mandi', 1050, 1260, false, true, false, current_date),
      ('Vaibhav Special Mandi (Half)', 'arabic-mandi', 1050, 1260, false, true, false, current_date),
      ('Vaibhav Special Mandi (Full)', 'arabic-mandi', 1990, 2390, false, true, false, current_date),
      ('Alfaham Juicy Mandi (Half)', 'arabic-mandi', 680, 820, false, true, false, current_date),
      ('Alfaham Juicy Mandi (Full)', 'arabic-mandi', 1290, 1550, false, true, false, current_date),
      ('Mutton Juicy Mandi (Half)', 'arabic-mandi', 990, 1190, false, true, false, current_date),
      ('Mutton Juicy Mandi (Full)', 'arabic-mandi', 1950, 2340, false, true, false, current_date);

    -- Category 16. NON-VEG. FRIED RICE (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Fried Rice', 'non-veg-fried-rice', 240, 290, false, true, false, current_date),
      ('Schezwan Chicken Fried Rice', 'non-veg-fried-rice', 260, 310, false, true, false, current_date),
      ('Prawns Fried Rice', 'non-veg-fried-rice', 320, 380, false, true, false, current_date),
      ('Egg Fried Rice', 'non-veg-fried-rice', 190, 230, false, true, false, current_date),
      ('Schezwan Egg Fried Rice', 'non-veg-fried-rice', 210, 250, false, true, false, current_date),
      ('Special Chicken Fried Rice', 'non-veg-fried-rice', 280, 340, false, true, false, current_date);

    -- Category 17. VEG. FRIED RICE (11 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Fried Rice', 'veg-fried-rice', 170, 200, true, true, false, current_date),
      ('Gobi Fried Rice', 'veg-fried-rice', 180, 220, true, true, false, current_date),
      ('Zeera Rice', 'veg-fried-rice', 180, 220, true, true, false, current_date),
      ('Ghee Rice', 'veg-fried-rice', 210, 250, true, true, false, current_date),
      ('Mushroom Fried Rice', 'veg-fried-rice', 240, 290, true, true, false, current_date),
      ('Paneer Fried Rice', 'veg-fried-rice', 240, 290, true, true, false, current_date),
      ('Kaju Fried Rice', 'veg-fried-rice', 280, 340, true, true, false, current_date),
      ('Schezwan Fried Rice', 'veg-fried-rice', 230, 280, true, true, false, current_date),
      ('Baby Corn Fried Rice', 'veg-fried-rice', 240, 290, true, true, false, current_date),
      ('Mixed Veg. Fried Rice', 'veg-fried-rice', 260, 310, true, true, false, current_date),
      ('Dalkichidi', 'veg-fried-rice', 220, 260, true, true, false, current_date);

    -- Category 18. NON-VEG. NOODLES (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Egg Noodles', 'non-veg-noodles', 220, 260, false, true, false, current_date),
      ('Schezwan Egg Noodles', 'non-veg-noodles', 240, 290, false, true, false, current_date),
      ('Chicken Noodles', 'non-veg-noodles', 260, 310, false, true, false, current_date),
      ('Chicken Schezwan Noodles', 'non-veg-noodles', 280, 340, false, true, false, current_date),
      ('Prawns Noodles', 'non-veg-noodles', 350, 420, false, true, false, current_date);

    -- Category 19. VEG. NOODLES (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Noodles', 'veg-noodles', 200, 240, true, true, false, current_date),
      ('Gobi Noodles', 'veg-noodles', 200, 240, true, true, false, current_date),
      ('Paneer Noodles', 'veg-noodles', 250, 300, true, true, false, current_date),
      ('Mushroom Noodles', 'veg-noodles', 250, 300, true, true, false, current_date),
      ('Manchurian Noodles', 'veg-noodles', 260, 310, true, true, false, current_date),
      ('Veg. Hakka Noodles', 'veg-noodles', 250, 300, true, true, false, current_date);

    -- Category 20. VEG. PULAVS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Pulav', 'veg-pulavs', 200, 240, true, true, false, current_date),
      ('Kaju Pulav', 'veg-pulavs', 280, 340, true, true, false, current_date),
      ('Paneer Pulav', 'veg-pulavs', 280, 340, true, true, false, current_date),
      ('Mushroom Pulav', 'veg-pulavs', 280, 340, true, true, false, current_date);

    -- Category 21. INDIAN BREADS (15 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Tandoori Roti', 'indian-breads', 30, 40, true, true, false, current_date),
      ('Butter Roti', 'indian-breads', 35, 40, true, true, false, current_date),
      ('Plain Naan', 'indian-breads', 55, 70, true, true, false, current_date),
      ('Butter Naan', 'indian-breads', 65, 80, true, true, false, current_date),
      ('Garlic Naan', 'indian-breads', 70, 80, true, true, false, current_date),
      ('Rumali Roti', 'indian-breads', 55, 70, true, true, false, current_date),
      ('Kulcha', 'indian-breads', 50, 60, true, true, false, current_date),
      ('Butter Kulcha', 'indian-breads', 55, 70, true, true, false, current_date),
      ('Onion Kulcha', 'indian-breads', 70, 80, true, true, false, current_date),
      ('Masala Kulcha', 'indian-breads', 90, 110, true, true, false, current_date),
      ('Paneer Kulcha', 'indian-breads', 90, 110, true, true, false, current_date),
      ('Aloo Parota', 'indian-breads', 90, 110, true, true, false, current_date),
      ('Parota', 'indian-breads', 50, 60, true, true, false, current_date),
      ('Plain Papad', 'indian-breads', 40, 50, true, false, false, current_date),
      ('Masala Papad', 'indian-breads', 80, 100, true, true, false, current_date);

    -- Category 22. VEG. CURRIES (26 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Kadai Veg.', 'veg-curries', 250, 300, true, true, false, current_date),
      ('Mixed Veg. Curry', 'veg-curries', 240, 290, true, true, false, current_date),
      ('Veg. Mughlai Curry', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Veg. Kofta Curry', 'veg-curries', 270, 320, true, true, false, current_date),
      ('Malai Kofta Curry', 'veg-curries', 250, 300, true, true, false, current_date),
      ('Shahi Paneer', 'veg-curries', 270, 320, true, true, false, current_date),
      ('Paneer Butter Masala', 'veg-curries', 250, 300, true, true, false, current_date),
      ('Kadai Paneer', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Methi Chaman', 'veg-curries', 270, 320, true, true, false, current_date),
      ('Kaju Paneer Masala', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Kaju Masala Curry', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Mutter Paneer', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Aloo Gobi', 'veg-curries', 180, 220, true, true, false, current_date),
      ('Aloo Mutter', 'veg-curries', 200, 240, true, true, false, current_date),
      ('Aloo Palak', 'veg-curries', 260, 310, true, true, false, current_date),
      ('Paneer Kheema Masala', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Palak Paneer', 'veg-curries', 270, 320, true, true, false, current_date),
      ('Plain Palak', 'veg-curries', 220, 260, true, true, false, current_date),
      ('Methi Paneer', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Paneer Tikka Masala', 'veg-curries', 290, 350, true, true, false, current_date),
      ('Dal Fry', 'veg-curries', 200, 240, true, true, false, current_date),
      ('Dal Tadka', 'veg-curries', 220, 260, true, true, false, current_date),
      ('Kadai Mushroom', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Mushroom Masala', 'veg-curries', 250, 300, true, true, false, current_date),
      ('Baby Corn Masala', 'veg-curries', 260, 310, true, true, false, current_date),
      ('Paneer Makhani', 'veg-curries', 280, 340, true, true, false, current_date);

    -- Category 23. NON-VEG. CURRIES — CHICKEN (17 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Curry (Bone)', 'chicken-curries', 240, 290, false, true, false, current_date),
      ('Chicken Curry (Boneless)', 'chicken-curries', 290, 350, false, true, false, current_date),
      ('Andhra Chicken Curry (Spicy)', 'chicken-curries', 260, 310, false, true, false, current_date),
      ('Chicken Rayalaseema', 'chicken-curries', 280, 340, false, true, false, current_date),
      ('Special Chicken Curry', 'chicken-curries', 280, 340, false, true, false, current_date),
      ('Kadai Chicken', 'chicken-curries', 280, 340, false, true, false, current_date),
      ('Butter Chicken', 'chicken-curries', 280, 340, false, true, false, current_date),
      ('Chicken Murgh Masala', 'chicken-curries', 300, 360, false, true, false, current_date),
      ('Chicken Kheema Curry', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Chicken Tikka Masala', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Wings Masala', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Chicken Mughalai Curry', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Kaju Chicken Curry', 'chicken-curries', 350, 420, false, true, false, current_date),
      ('Methi Chicken (Bone)', 'chicken-curries', 290, 350, false, true, false, current_date),
      ('Methi Chicken (Boneless)', 'chicken-curries', 340, 410, false, true, false, current_date),
      ('Punjabi Chicken Curry', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Afgani Chicken (Rambha)', 'chicken-curries', 320, 380, false, true, false, current_date);

    -- Category 24. MUTTON CURRY (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Palak Mutton', 'mutton-curry', 350, 420, false, true, false, current_date),
      ('Gongura Mutton', 'mutton-curry', 370, 440, false, true, false, current_date),
      ('Mutton Curry', 'mutton-curry', 360, 430, false, true, false, current_date),
      ('Kaju Mutton Curry', 'mutton-curry', 450, 540, false, true, false, current_date),
      ('Methi Mutton', 'mutton-curry', 350, 420, false, true, false, current_date);

    -- Category 25. MILKSHAKES (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Vanilla Milkshake', 'milkshakes', 130, 160, true, true, false, current_date),
      ('Butterscotch Milkshake', 'milkshakes', 140, 170, true, true, false, current_date),
      ('Chocolate Milkshake', 'milkshakes', 140, 170, true, true, false, current_date),
      ('Oreo Milkshake', 'milkshakes', 170, 200, true, true, false, current_date),
      ('KitKat Milkshake', 'milkshakes', 170, 200, true, true, false, current_date);

    -- Category 26. BEVERAGES (10 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Butter Milk', 'beverages', 50, 60, true, true, false, current_date),
      ('Sweet Lassi', 'beverages', 80, 100, true, true, false, current_date),
      ('Lassi', 'beverages', 80, 100, true, true, false, current_date),
      ('Lemon Soda Sweet & Salt', 'beverages', 80, 100, true, true, false, current_date),
      ('Lemon Juice', 'beverages', 70, 80, true, true, false, current_date),
      ('Water 1 litre', 'beverages', 20, 20, true, false, false, current_date),
      ('Thumbs Up 250 ml', 'beverages', 20, 20, true, true, false, current_date),
      ('Sprite 250 ml', 'beverages', 20, 20, true, true, false, current_date),
      ('Coco Cola 250 ml', 'beverages', 20, 20, true, true, false, current_date),
      ('Goli Soda', 'beverages', 30, 40, true, true, false, current_date);

    -- Category 27. MOCKTAILS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Blue Lagoon Mocktail', 'mocktails', 130, 160, true, true, false, current_date),
      ('Green Mint Mocktail', 'mocktails', 130, 160, true, true, false, current_date),
      ('Naughty Water Melon Mocktail', 'mocktails', 150, 180, true, true, false, current_date),
      ('Orange Mocktail', 'mocktails', 130, 160, true, true, false, current_date);

    -- Category 28. DESSERTS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Gulab Jamun', 'desserts', 60, 70, true, true, false, current_date),
      ('Gulab Jamun with Ice Cream', 'desserts', 150, 180, true, true, false, current_date),
      ('Double Ka Meeta', 'desserts', 100, 120, true, true, false, current_date),
      ('Badham Kheer', 'desserts', 100, 120, true, true, false, current_date);

    -- Category 29. ICE CREAMS (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Vanilla', 'ice-creams', 90, 110, true, true, false, current_date),
      ('Butterscotch', 'ice-creams', 90, 110, true, true, false, current_date),
      ('Strawberry', 'ice-creams', 90, 110, true, true, false, current_date),
      ('Black Current', 'ice-creams', 120, 140, true, true, false, current_date),
      ('Chocolate', 'ice-creams', 110, 130, true, true, false, current_date);

    -- Category 30. BUCKET BIRYANI — PORTIONS ONLY (12 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Mandi Bucket Half', 'bucket-biryani', 550, 660, false, true, false, current_date),
      ('Chicken Mandi Bucket Full', 'bucket-biryani', 1000, 1200, false, true, false, current_date),
      ('Alfaham Mandi Bucket Half', 'bucket-biryani', 600, 720, false, true, false, current_date),
      ('Alfaham Mandi Bucket Full', 'bucket-biryani', 1100, 1320, false, true, false, current_date),
      ('Tandoori Chicken Mandi Bucket Half', 'bucket-biryani', 550, 660, false, true, false, current_date),
      ('Tandoori Chicken Mandi Bucket Full', 'bucket-biryani', 1000, 1200, false, true, false, current_date),
      ('Alfaham Juicy Mandi Bucket Half', 'bucket-biryani', 630, 760, false, true, false, current_date),
      ('Alfaham Juicy Mandi Bucket Full', 'bucket-biryani', 1290, 1550, false, true, false, current_date),
      ('Family Chicken Dum Biryani Half', 'bucket-biryani', 600, 720, false, true, false, current_date),
      ('Family Chicken Dum Biryani Full', 'bucket-biryani', 1100, 1320, false, true, false, current_date),
      ('Mutton Dum Biryani Half', 'bucket-biryani', 990, 1190, false, true, false, current_date),
      ('Mutton Dum Biryani Full', 'bucket-biryani', 1990, 2390, false, true, false, current_date);


SELECT COUNT(*) AS total_dishes_inserted FROM menu_items;
