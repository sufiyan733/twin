const fs = require('fs');
const path = require('path');

const data = {
  animal: {
    meat: [
      ["chicken breast", 120, 22.5, 0, 2.6, 0, 0, 0.75, "Loses ~25% weight during cooking due to water loss", ["chicken", "murgh", "grilled chicken", "boiled chicken"], [{d: "1 medium breast", w: 150}, {d: "1 small breast", w: 100}]],
      ["mutton", 294, 25, 0, 21, 0, 0, 0.70, "Shrinks considerably during slow cooking", ["goat", "bakra", "gosht", "mutton curry cut"], [{d: "1 serving", w: 150}, {d: "1 small piece", w: 50}]],
      ["lamb", 294, 25, 0, 21, 0, 0, 0.70, "High fat loss during cooking", ["lamb chops"], [{d: "1 serving", w: 150}, {d: "1 chop", w: 75}]],
      ["turkey", 104, 17, 0, 3.5, 0, 0, 0.75, "Loses moisture quickly", ["turkey breast", "thanksgiving bird"], [{d: "1 slice", w: 50}, {d: "1 serving", w: 150}]],
      ["beef", 250, 26, 0, 15, 0, 0, 0.75, "Fat renders out during cooking", ["cow meat", "steak", "bade ka meat"], [{d: "1 steak", w: 200}, {d: "1 piece", w: 100}]],
      ["pork", 242, 27, 0, 14, 0, 0, 0.70, "Fat rendering reduces weight", ["pig meat", "pork chops"], [{d: "1 serving", w: 150}, {d: "1 chop", w: 100}]],
      ["chicken thigh", 177, 24, 0, 8, 0, 0, 0.75, "Retains more moisture than breast", ["murgh tangdi", "chicken thigh piece"], [{d: "1 thigh", w: 100}, {d: "1 serving", w: 150}]],
      ["chicken leg", 177, 24, 0, 8, 0, 0, 0.75, "Retains more moisture", ["tangdi"], [{d: "1 leg piece", w: 120}, {d: "1 small leg piece", w: 80}]],
      ["minced chicken", 143, 17, 0, 8, 0, 0, 0.80, "Loses water and fat", ["chicken keema"], [{d: "1 bowl", w: 150}, {d: "1 katori", w: 100}]],
      ["liver", 119, 19, 3.8, 3.6, 0, 0, 0.80, "Becomes dense when cooked", ["kaleji"], [{d: "1 serving", w: 100}, {d: "1 small piece", w: 30}]],
      ["duck", 337, 19, 0, 28, 0, 0, 0.65, "Heavy fat rendering", ["duck meat"], [{d: "1 serving", w: 150}, {d: "1 piece", w: 100}]],
      ["quail", 134, 22, 0, 4.5, 0, 0, 0.75, "Dries out easily", ["bater"], [{d: "1 whole quail", w: 100}, {d: "1 small quail", w: 75}]],
      ["chicken liver", 119, 17, 0, 4.8, 0, 0, 0.80, "Cooks very fast", ["murgh kaleji"], [{d: "1 serving", w: 100}, {d: "1 small bowl", w: 75}]],
      ["mutton liver", 135, 20, 2, 4, 0, 0, 0.80, "Cooks fast, gets rubbery if overcooked", ["bakre ki kaleji"], [{d: "1 serving", w: 100}, {d: "1 small bowl", w: 75}]],
      ["pork bacon", 541, 37, 1.4, 42, 0, 0, 0.40, "Extreme fat rendering", ["bacon strips"], [{d: "1 strip", w: 15}, {d: "2 strips", w: 30}]]
    ],
    fish_seafood: [
      ["salmon", 208, 20, 0, 13, 0, 0, 0.80, "Loses moisture and fat", ["rawas"], [{d: "1 fillet", w: 150}, {d: "1 small piece", w: 100}]],
      ["tuna", 132, 28, 0, 1, 0, 0, 0.75, "Dries out easily", ["kera"], [{d: "1 can", w: 130}, {d: "1 fillet", w: 150}]],
      ["rohu", 102, 16, 0, 3.5, 0, 0, 0.80, "Absorbs oil if fried", ["machli", "rui"], [{d: "1 piece", w: 100}, {d: "1 large piece", w: 150}]],
      ["catla", 110, 15, 0, 4, 0, 0, 0.80, "Firm texture when cooked", ["katla"], [{d: "1 piece", w: 100}, {d: "1 large piece", w: 150}]],
      ["pomfret", 96, 17, 0, 2.5, 0, 0, 0.80, "Delicate meat, minimal shrinkage", ["paplet"], [{d: "1 whole small", w: 150}, {d: "1 slice", w: 100}]],
      ["mackerel", 305, 19, 0, 25, 0, 0, 0.75, "Oily fish, retains moisture", ["bangda"], [{d: "1 piece", w: 100}, {d: "1 whole", w: 150}]],
      ["sardine", 208, 24, 0, 11, 0, 0, 0.80, "Cooks quickly", ["mathi", "pedvey"], [{d: "1 serving", w: 100}, {d: "1 fish", w: 50}]],
      ["prawn", 99, 24, 0, 0.3, 0, 0, 0.60, "Shrinks significantly", ["jhinga"], [{d: "10 pieces", w: 100}, {d: "1 cup", w: 150}]],
      ["shrimp", 99, 24, 0, 0.3, 0, 0, 0.60, "Shrinks fast", ["small jhinga"], [{d: "10 pieces", w: 100}, {d: "1 cup", w: 150}]],
      ["crab", 83, 18, 0, 0.7, 0, 0, 0.75, "Meat volume remains similar", ["kekda"], [{d: "1 crab meat", w: 100}, {d: "1 whole crab", w: 200}]],
      ["tilapia", 96, 20, 0, 1.7, 0, 0, 0.80, "Minimal shrinkage", ["tilapia fish"], [{d: "1 fillet", w: 120}, {d: "1 small piece", w: 80}]],
      ["hilsa", 310, 22, 0, 24, 0, 0, 0.80, "Very oily, melts slightly", ["ilish"], [{d: "1 piece", w: 100}, {d: "1 large piece", w: 150}]],
      ["surmai", 105, 19, 0, 2.5, 0, 0, 0.80, "Firm meat, holds structure", ["seer fish", "kingfish"], [{d: "1 piece", w: 100}, {d: "1 large slice", w: 150}]],
      ["bombay duck", 82, 15, 0, 1.5, 0, 0, 0.50, "Extremely high water content, shrinks heavily", ["bombil"], [{d: "1 piece", w: 50}, {d: "1 serving", w: 100}]],
      ["squid", 92, 15, 3, 1.3, 0, 0, 0.70, "Gets rubbery if overcooked", ["calamari", "koonthal"], [{d: "1 serving", w: 100}, {d: "1 cup rings", w: 150}]]
    ],
    dairy: [
      ["whole milk", 61, 3.2, 4.8, 3.3, 0, 4.8, 0.95, "Slight water evaporation when boiled", ["doodh", "full cream milk", "milk"], [{d: "1 cup", w: 250}, {d: "1 glass", w: 300}]],
      ["skimmed milk", 34, 3.4, 5, 0.1, 0, 5, 0.95, "Boils faster than whole milk", ["toned milk", "double toned milk"], [{d: "1 cup", w: 250}, {d: "1 glass", w: 300}]],
      ["greek yogurt", 97, 9, 4, 5, 0, 4, 1.0, "Used as is or in cold dishes", ["strained yogurt", "hung curd"], [{d: "1 small cup", w: 150}, {d: "1 large bowl", w: 250}]],
      ["curd", 98, 4.3, 3.4, 4.3, 0, 3.4, 1.0, "Used raw mostly", ["dahi", "plain yogurt"], [{d: "1 katori", w: 150}, {d: "1 bowl", w: 200}]],
      ["paneer", 296, 14, 3.4, 25, 0, 3.4, 0.90, "Releases little water when cooked", ["cottage cheese (indian)", "chenna"], [{d: "1 block", w: 100}, {d: "1 cup cubed", w: 150}]],
      ["cottage cheese", 98, 11, 3.4, 4.3, 0, 2.7, 0.90, "Melts slightly", ["low fat paneer"], [{d: "1 cup", w: 100}, {d: "1 bowl", w: 200}]],
      ["butter", 717, 0.8, 0.1, 81, 0, 0.1, 1.0, "Melts completely", ["makhan", "makkhan"], [{d: "1 tbsp", w: 15}, {d: "1 cube", w: 10}]],
      ["ghee", 900, 0, 0, 100, 0, 0, 1.0, "Stable at high heat", ["clarified butter", "pure ghee"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["cream", 340, 2, 3, 36, 0, 3, 0.95, "Reduces in gravies", ["malai", "fresh cream"], [{d: "1 tbsp", w: 15}, {d: "1 cup", w: 240}]],
      ["whey protein", 379, 76, 10, 4, 0, 2, 1.0, "Mixed with water", ["protein powder", "whey"], [{d: "1 scoop", w: 30}, {d: "half scoop", w: 15}]],
      ["mozzarella cheese", 280, 28, 3, 17, 0, 1, 0.90, "Melts and stretches", ["pizza cheese"], [{d: "1 slice", w: 20}, {d: "1 cup shredded", w: 110}]],
      ["cheddar cheese", 402, 25, 1.3, 33, 0, 0.5, 0.90, "Melts easily", ["yellow cheese"], [{d: "1 cube", w: 25}, {d: "1 slice", w: 20}]],
      ["buttermilk", 40, 3.3, 4.8, 0.9, 0, 4.8, 1.0, "Consumed raw", ["chaas", "mattha", "taak"], [{d: "1 glass", w: 250}, {d: "1 cup", w: 150}]],
      ["lassi", 75, 3.5, 12, 1.5, 0, 11, 1.0, "Consumed raw", ["sweet curd drink", "meethi dahi"], [{d: "1 glass", w: 250}, {d: "1 cup", w: 150}]],
      ["khoya", 353, 14, 15, 26, 0, 10, 0.95, "Used in sweets", ["mawa"], [{d: "1 piece", w: 50}, {d: "1 cup", w: 150}]],
      ["low fat curd", 43, 4, 5, 0.5, 0, 5, 1.0, "Used raw", ["skimmed dahi"], [{d: "1 katori", w: 150}, {d: "1 cup", w: 200}]],
      ["protein yogurt", 80, 10, 4, 0, 0, 3, 1.0, "Used raw", ["high protein dahi"], [{d: "1 cup", w: 150}, {d: "1 bowl", w: 250}]]
    ],
    eggs: [
      ["whole egg", 155, 13, 1.1, 11, 0, 1.1, 0.95, "Coagulates completely", ["anda", "eggs"], [{d: "1 large egg", w: 50}, {d: "2 large eggs", w: 100}]],
      ["egg white", 52, 11, 0.7, 0.2, 0, 0.7, 0.95, "Turns opaque and solid", ["safedi"], [{d: "1 egg white", w: 33}, {d: "3 egg whites", w: 100}]],
      ["egg yolk", 322, 16, 3.6, 27, 0, 0.6, 0.95, "Solidifies when cooked", ["zardi", "yolk"], [{d: "1 yolk", w: 17}, {d: "2 yolks", w: 34}]],
      ["boiled egg", 155, 13, 1.1, 11, 0, 1.1, 1.0, "Absorbs no fat", ["ubla anda"], [{d: "1 large", w: 50}, {d: "2 large", w: 100}]],
      ["scrambled egg", 149, 10, 1.5, 11, 0, 1.2, 0.90, "Loses slight moisture", ["bhurji (plain)"], [{d: "2 eggs scrambled", w: 100}, {d: "1 egg scrambled", w: 50}]],
      ["omelette", 154, 11, 0.6, 12, 0, 0.4, 0.90, "Absorbs cooking oil", ["omlet", "anda fry"], [{d: "1 omelette", w: 60}, {d: "2 egg omelette", w: 120}]],
      ["duck egg", 185, 13, 1.5, 14, 0, 0.9, 0.95, "Thicker shell, richer taste", ["batakh ka anda"], [{d: "1 large", w: 70}, {d: "2 large", w: 140}]],
      ["quail egg", 158, 13, 0.4, 11, 0, 0.4, 0.95, "Tiny, fast cooking", ["bater ka anda"], [{d: "1 egg", w: 9}, {d: "5 eggs", w: 45}]],
      ["poached egg", 143, 14, 0.7, 9.5, 0, 0.7, 1.0, "Cooked in water", ["poached"], [{d: "1 large", w: 50}, {d: "2 large", w: 100}]],
      ["half boiled egg", 155, 13, 1.1, 11, 0, 1.1, 1.0, "Runny yolk", ["soft boiled egg"], [{d: "1 large", w: 50}, {d: "2 large", w: 100}]],
      ["egg bhurji", 160, 12, 2, 12, 0.5, 1.5, 0.90, "Cooked with onions and oil", ["masala bhurji"], [{d: "1 serving", w: 100}, {d: "1 plate", w: 150}]],
      ["fried egg", 196, 14, 0.8, 15, 0, 0.4, 0.90, "Absorbs oil", ["sunny side up", "bullseye"], [{d: "1 egg", w: 50}, {d: "2 eggs", w: 100}]],
      ["desi egg", 155, 13, 1.1, 11, 0, 1.1, 0.95, "Country egg, richer yolk", ["country egg", "gavran anda"], [{d: "1 large", w: 50}, {d: "2 large", w: 100}]],
      ["liquid egg white", 52, 11, 0.7, 0.2, 0, 0.7, 0.95, "Solidifies completely", ["carton egg white"], [{d: "100ml", w: 100}, {d: "200ml", w: 200}]],
      ["salted egg", 180, 14, 1, 13, 0, 0, 0.95, "Preserved, high sodium", ["salted duck egg"], [{d: "1 egg", w: 60}, {d: "half egg", w: 30}]]
    ]
  },
  plant: {
    grains_cereals: [
      ["oats", 389, 16.9, 66.3, 6.9, 10.6, 0, 3.5, "Absorbs water and expands ~3.5x", ["jai", "oatmeal", "rolled oats"], [{d: "1 cup raw", w: 80}, {d: "1 bowl cooked", w: 250}]],
      ["white rice", 130, 2.7, 28, 0.3, 0.4, 0.1, 3.0, "Absorbs water, triples in weight", ["chawal", "safed chawal"], [{d: "1 katori cooked", w: 150}, {d: "1 plate", w: 250}]],
      ["brown rice", 111, 2.6, 23, 0.9, 1.8, 0.4, 2.5, "Expands less than white rice", ["brown chawal"], [{d: "1 katori cooked", w: 150}, {d: "1 plate", w: 250}]],
      ["roti", 297, 9.5, 46, 7.5, 6, 0, 0.8, "Loses water during roasting", ["phulka", "chapati", "fulka"], [{d: "1 medium roti", w: 40}, {d: "1 large roti", w: 60}]],
      ["quinoa", 120, 4.4, 21.3, 1.9, 2.8, 0.9, 3.0, "Expands rapidly in water", ["kinoa"], [{d: "1 cup cooked", w: 185}, {d: "1 bowl cooked", w: 250}]],
      ["poha", 350, 7, 77, 1.2, 1, 0, 2.0, "Absorbs water, doubles in weight", ["flattened rice", "aval", "chiwda"], [{d: "1 bowl cooked", w: 200}, {d: "1 plate", w: 250}]],
      ["upma", 200, 5, 25, 8, 2, 1, 2.5, "Semolina absorbs water heavily", ["sooji upma", "rava upma"], [{d: "1 bowl", w: 200}, {d: "1 plate", w: 250}]],
      ["bread", 265, 9, 49, 3.2, 2.7, 5, 1.0, "Toasting removes moisture", ["white bread", "pav"], [{d: "1 slice", w: 30}, {d: "2 slices", w: 60}]],
      ["wheat flour", 364, 10, 76, 1, 10, 0, 2.0, "Forms dough with water", ["atta", "gehu ka atta"], [{d: "1 cup", w: 120}, {d: "1/2 cup", w: 60}]],
      ["corn", 86, 3.2, 19, 1.2, 2.7, 3.2, 1.0, "Minimal weight change", ["makka", "bhutta", "sweet corn"], [{d: "1 cob", w: 100}, {d: "1 cup kernels", w: 150}]],
      ["bajra", 378, 11, 73, 4.2, 8.5, 0, 2.5, "Absorbs water", ["pearl millet", "bajri"], [{d: "1 roti", w: 50}, {d: "1 katori cooked", w: 150}]],
      ["jowar", 339, 11, 74, 3.3, 6.3, 0, 2.5, "Absorbs water", ["sorghum"], [{d: "1 roti", w: 50}, {d: "1 katori cooked", w: 150}]],
      ["barley", 354, 12, 73, 2.3, 17, 0.8, 3.0, "Expands heavily", ["jau"], [{d: "1 cup cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["ragi", 336, 7.3, 72, 1.3, 11, 0, 2.5, "Absorbs water for mudde or roti", ["finger millet", "nachni"], [{d: "1 ball/mudde", w: 150}, {d: "1 roti", w: 50}]],
      ["idli", 148, 4, 31, 0.5, 1, 0, 1.0, "Steamed fermented batter", ["idlai", "idly"], [{d: "1 medium idli", w: 30}, {d: "1 large idli", w: 50}]],
      ["dosa", 168, 3.5, 33, 2.5, 1, 0, 1.0, "Cooked with oil on griddle", ["dosha"], [{d: "1 plain dosa", w: 90}, {d: "1 small dosa", w: 50}]],
      ["paratha", 310, 8, 45, 10, 5, 0, 1.0, "Layered flatbread cooked with oil/ghee", ["parantha"], [{d: "1 paratha", w: 80}, {d: "1 small paratha", w: 50}]],
      ["suji", 360, 11, 73, 1, 3.9, 0, 2.5, "Absorbs water", ["semolina", "rava"], [{d: "1 cup", w: 160}, {d: "1/2 cup", w: 80}]],
      ["vermicelli", 358, 12, 73, 1, 2, 0, 2.5, "Expands when cooked", ["seviyan", "semiya"], [{d: "1 cup", w: 150}, {d: "1 katori", w: 100}]]
    ],
    legumes_pulses: [
      ["lentils", 116, 9, 20, 0.4, 8, 1.8, 2.5, "Absorbs water and expands", ["dal", "masoor dal"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["moong dal", 347, 24, 63, 1.2, 16, 0, 2.5, "Expands ~2.5x when cooked", ["yellow dal", "green gram"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["chana dal", 364, 25, 61, 5, 11, 0, 2.5, "Expands", ["bengal gram dal", "split chickpeas"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["toor dal", 343, 22, 63, 1.5, 15, 0, 2.5, "Expands into thick soup", ["arhar dal", "pigeon pea"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["urad dal", 341, 25, 59, 1.6, 18, 0, 2.5, "Expands, used in idli batter", ["black gram dal"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["rajma", 333, 24, 60, 0.8, 25, 2, 2.5, "Expands 2.5x after soaking and boiling", ["red kidney beans"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["chickpeas", 364, 19, 61, 6, 17, 10, 2.5, "Expands ~2.5x", ["chana", "kabuli chana", "chole"], [{d: "1 bowl cooked", w: 150}, {d: "1 katori", w: 100}]],
      ["black beans", 341, 21, 62, 1.4, 15, 0, 2.5, "Expands heavily", ["kala bean"], [{d: "1 cup cooked", w: 170}, {d: "1 katori", w: 150}]],
      ["kidney beans", 333, 24, 60, 0.8, 25, 2, 2.5, "Same as rajma", ["lobia red"], [{d: "1 cup cooked", w: 170}, {d: "1 katori", w: 150}]],
      ["soybeans", 446, 36, 30, 20, 9, 7, 2.5, "Expands heavily", ["soya chunks", "nutrela"], [{d: "1 cup cooked", w: 150}, {d: "1 katori", w: 100}]],
      ["tofu", 144, 16, 2.8, 8.7, 2.3, 0.6, 0.90, "Releases water if pressed", ["soya paneer"], [{d: "1 block", w: 100}, {d: "1 cup cubed", w: 150}]],
      ["tempeh", 192, 19, 7.6, 11, 0, 0, 1.0, "Cooks fast, absorbs marinades", ["fermented soy"], [{d: "1 serving", w: 100}, {d: "1 slice", w: 50}]],
      ["edamame", 121, 12, 8.9, 5.2, 5.2, 2.2, 1.0, "Boiled as is", ["green soybeans"], [{d: "1 cup", w: 155}, {d: "1 small bowl", w: 100}]],
      ["peas", 81, 5, 14, 0.4, 5, 5, 1.0, "Minimal change in volume", ["matar", "green peas"], [{d: "1 katori", w: 100}, {d: "1 cup", w: 150}]],
      ["masoor dal", 353, 25, 60, 1, 11, 2, 2.5, "Cooks quickly into mush", ["red lentils"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["moth beans", 343, 23, 62, 1, 15, 0, 2.5, "Expands", ["matki"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["black eyed peas", 336, 23, 60, 1, 11, 0, 2.5, "Expands", ["lobia"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["green moong whole", 347, 24, 63, 1, 16, 0, 2.5, "Expands", ["sabut moong"], [{d: "1 katori cooked", w: 150}, {d: "1 bowl", w: 200}]],
      ["sprouted moong", 30, 3, 6, 0.2, 1.8, 4, 1.0, "Consumed raw or lightly cooked", ["moong sprouts"], [{d: "1 cup", w: 100}, {d: "1 small bowl", w: 50}]]
    ],
    vegetables: [
      ["spinach", 23, 2.9, 3.6, 0.4, 2.2, 0.4, 0.50, "Wilts heavily, loses 50%+ volume", ["palak"], [{d: "1 bunch", w: 100}, {d: "1 cup cooked", w: 180}]],
      ["broccoli", 34, 2.8, 6.6, 0.4, 2.6, 1.7, 0.90, "Retains structure if steamed", ["hari phool gobi"], [{d: "1 cup", w: 90}, {d: "1 small head", w: 200}]],
      ["sweet potato", 86, 1.6, 20, 0.1, 3, 4.2, 1.0, "Absorbs slight water if boiled", ["shakarkandi"], [{d: "1 medium", w: 130}, {d: "1 large", w: 200}]],
      ["potato", 77, 2, 17, 0.1, 2.2, 0.8, 1.0, "Holds water", ["aloo", "batata"], [{d: "1 medium", w: 150}, {d: "1 small", w: 100}]],
      ["tomato", 18, 0.9, 3.9, 0.2, 1.2, 2.6, 0.50, "Breaks down into sauce", ["tamatar"], [{d: "1 medium", w: 100}, {d: "1 slice", w: 20}]],
      ["onion", 40, 1.1, 9.3, 0.1, 1.7, 4.2, 0.60, "Loses water when caramelized", ["pyaaz", "kanda"], [{d: "1 medium", w: 110}, {d: "1 slice", w: 15}]],
      ["garlic", 149, 6.4, 33, 0.5, 2.1, 1, 0.90, "Cooks down slightly", ["lehsun", "lasun"], [{d: "1 clove", w: 3}, {d: "1 bulb", w: 30}]],
      ["cucumber", 15, 0.7, 3.6, 0.1, 0.5, 1.7, 1.0, "Consumed raw", ["kheera", "kakdi"], [{d: "1 medium", w: 200}, {d: "1 cup sliced", w: 100}]],
      ["bitter gourd", 17, 1, 3.7, 0.2, 2.8, 1, 0.70, "Shrinks slightly when fried", ["karela"], [{d: "1 medium", w: 100}, {d: "1 cup cooked", w: 150}]],
      ["drumstick", 37, 2.1, 8.5, 0.2, 3.2, 1, 1.0, "Boiled for soups", ["moringa", "sahjan"], [{d: "1 stick", w: 50}, {d: "2 sticks", w: 100}]],
      ["cauliflower", 25, 1.9, 5, 0.3, 2, 1.9, 0.90, "Retains volume", ["phool gobi"], [{d: "1 cup", w: 100}, {d: "1 small head", w: 300}]],
      ["cabbage", 25, 1.3, 5.8, 0.1, 2.5, 3.2, 0.60, "Wilts when cooked", ["patta gobi", "bandh gobi"], [{d: "1 cup", w: 90}, {d: "1 cup cooked", w: 150}]],
      ["carrot", 41, 0.9, 10, 0.2, 2.8, 4.7, 0.90, "Softens but retains weight", ["gajar"], [{d: "1 medium", w: 60}, {d: "1 cup grated", w: 110}]],
      ["beetroot", 43, 1.6, 10, 0.2, 2.8, 7, 0.90, "Retains weight", ["chukandar"], [{d: "1 medium", w: 80}, {d: "1 cup sliced", w: 130}]],
      ["mushroom", 22, 3.1, 3.3, 0.3, 1, 2, 0.60, "Loses substantial water", ["kumbh"], [{d: "1 cup", w: 70}, {d: "1 whole mushroom", w: 15}]],
      ["bell pepper", 20, 0.9, 4.6, 0.2, 1.7, 2.4, 0.80, "Softens and shrinks", ["capsicum", "shimla mirch"], [{d: "1 medium", w: 120}, {d: "1 cup chopped", w: 150}]],
      ["zucchini", 17, 1.2, 3.1, 0.3, 1, 2.5, 0.70, "Loses water", ["courgette"], [{d: "1 medium", w: 150}, {d: "1 cup chopped", w: 120}]],
      ["eggplant", 25, 1, 6, 0.2, 3, 3.5, 0.60, "Acts like a sponge for oil, shrinks", ["baingan", "brinjal"], [{d: "1 cup", w: 100}, {d: "1 medium", w: 300}]],
      ["raw banana", 89, 1.1, 23, 0.3, 2.6, 12, 1.0, "Cooks like potato", ["kachha kela"], [{d: "1 medium", w: 120}, {d: "1 cup slices", w: 100}]],
      ["tinda", 21, 1.4, 3.4, 0.2, 1.6, 1.5, 0.80, "Softens in curry", ["apple gourd"], [{d: "1 cup", w: 100}, {d: "1 medium", w: 80}]],
      ["lauki", 14, 0.6, 3.4, 0.1, 1.2, 1.5, 0.70, "High water content, reduces heavily", ["bottle gourd", "dudhi", "ghiya"], [{d: "1 cup", w: 100}, {d: "1 katori cooked", w: 150}]],
      ["pumpkin", 26, 1, 6.5, 0.1, 0.5, 2.8, 0.80, "Mashes easily", ["kaddu", "bhopla"], [{d: "1 cup", w: 120}, {d: "1 katori mashed", w: 150}]],
      ["fenugreek leaves", 49, 4.4, 6, 0.9, 1, 0, 0.50, "Wilts heavily", ["methi"], [{d: "1 bunch", w: 100}, {d: "1 cup cooked", w: 150}]],
      ["amaranth leaves", 23, 2.5, 4, 0.3, 1, 0, 0.50, "Wilts heavily", ["chaulai"], [{d: "1 bunch", w: 100}, {d: "1 cup cooked", w: 150}]],
      ["ridge gourd", 17, 0.7, 3.4, 0.2, 1, 0, 0.80, "Softens", ["turai"], [{d: "1 cup", w: 100}, {d: "1 medium", w: 150}]],
      ["snake gourd", 18, 0.6, 3.3, 0.2, 0.8, 0, 0.80, "Softens", ["chichinda"], [{d: "1 cup", w: 100}, {d: "1 medium", w: 200}]],
      ["ivy gourd", 21, 1.2, 3.1, 0.1, 1.6, 0, 0.80, "Softens", ["kundru"], [{d: "1 cup", w: 100}, {d: "10 pieces", w: 50}]]
    ],
    fruits: [
      ["banana", 89, 1.1, 23, 0.3, 2.6, 12, 1.0, "Consumed raw", ["kela", "pazham"], [{d: "1 medium", w: 118}, {d: "1 large", w: 150}]],
      ["apple", 52, 0.3, 14, 0.2, 2.4, 10, 1.0, "Consumed raw", ["seb"], [{d: "1 medium", w: 180}, {d: "1 small", w: 120}]],
      ["mango", 60, 0.8, 15, 0.4, 1.6, 14, 1.0, "Consumed raw", ["aam"], [{d: "1 medium", w: 200}, {d: "1 cup sliced", w: 165}]],
      ["papaya", 43, 0.5, 11, 0.3, 1.7, 8, 1.0, "Consumed raw", ["papita"], [{d: "1 cup", w: 140}, {d: "1 slice", w: 200}]],
      ["orange", 47, 0.9, 12, 0.1, 2.4, 9, 1.0, "Consumed raw", ["santra"], [{d: "1 medium", w: 130}, {d: "1 small", w: 100}]],
      ["watermelon", 30, 0.6, 8, 0.2, 0.4, 6, 1.0, "Consumed raw", ["tarbooz"], [{d: "1 wedge", w: 280}, {d: "1 cup diced", w: 150}]],
      ["grapes", 69, 0.7, 18, 0.2, 0.9, 15, 1.0, "Consumed raw", ["angoor"], [{d: "1 cup", w: 150}, {d: "10 grapes", w: 50}]],
      ["strawberry", 32, 0.7, 7.7, 0.3, 2, 4.9, 1.0, "Consumed raw", ["strawberries"], [{d: "1 cup", w: 140}, {d: "1 large strawberry", w: 18}]],
      ["pineapple", 50, 0.5, 13, 0.1, 1.4, 10, 1.0, "Consumed raw", ["ananas"], [{d: "1 cup", w: 165}, {d: "1 slice", w: 80}]],
      ["guava", 68, 2.6, 14, 1, 5.4, 9, 1.0, "Consumed raw", ["amrood", "peru"], [{d: "1 medium", w: 165}, {d: "1 small", w: 100}]],
      ["pomegranate", 83, 1.7, 19, 1.2, 4, 14, 1.0, "Consumed raw", ["anaar"], [{d: "1 cup arils", w: 170}, {d: "1 whole", w: 280}]],
      ["kiwi", 61, 1.1, 15, 0.5, 3, 9, 1.0, "Consumed raw", ["kiwifruit"], [{d: "1 medium", w: 70}, {d: "2 kiwis", w: 140}]],
      ["dates", 282, 2.5, 75, 0.4, 8, 63, 1.0, "Consumed raw", ["khajoor", "khajur"], [{d: "1 date", w: 24}, {d: "3 dates", w: 72}]],
      ["fig", 74, 0.8, 19, 0.3, 2.9, 16, 1.0, "Consumed raw", ["anjeer"], [{d: "1 medium", w: 50}, {d: "2 figs", w: 100}]],
      ["muskmelon", 34, 0.8, 8, 0.2, 0.9, 8, 1.0, "Consumed raw", ["kharbooza"], [{d: "1 cup", w: 160}, {d: "1 wedge", w: 200}]],
      ["lychee", 66, 0.8, 17, 0.4, 1.3, 15, 1.0, "Consumed raw", ["litchi"], [{d: "1 fruit", w: 10}, {d: "1 cup", w: 190}]],
      ["chikoo", 83, 0.4, 20, 1.1, 5.3, 15, 1.0, "Consumed raw", ["sapota"], [{d: "1 medium", w: 170}, {d: "1 small", w: 100}]],
      ["jackfruit", 95, 1.7, 23, 0.6, 1.5, 19, 1.0, "Consumed raw", ["kathal"], [{d: "1 cup sliced", w: 165}, {d: "1 piece", w: 50}]],
      ["amla", 44, 0.9, 10, 0.6, 4.3, 0, 1.0, "Consumed raw or boiled", ["indian gooseberry"], [{d: "1 amla", w: 35}, {d: "1 cup", w: 150}]],
      ["tamarind", 239, 2.8, 62, 0.6, 5.1, 38, 1.0, "Used in small quantities", ["imli"], [{d: "1 tbsp pulp", w: 15}, {d: "1 pod", w: 5}]]
    ],
    nuts_seeds: [
      ["almonds", 579, 21, 22, 50, 12, 4.4, 1.0, "Consumed raw or soaked", ["badam"], [{d: "1 handful", w: 30}, {d: "10 almonds", w: 12}]],
      ["walnuts", 654, 15, 14, 65, 7, 2.6, 1.0, "Consumed raw", ["akhrot"], [{d: "1 handful", w: 30}, {d: "1 whole walnut", w: 5}]],
      ["cashews", 553, 18, 30, 44, 3.3, 5.9, 1.0, "Consumed raw", ["kaju"], [{d: "1 handful", w: 30}, {d: "10 cashews", w: 15}]],
      ["peanuts", 567, 26, 16, 49, 9, 4, 1.0, "Consumed roasted or boiled", ["mungfali", "shengdana"], [{d: "1 handful", w: 30}, {d: "1 cup", w: 140}]],
      ["peanut butter", 588, 25, 20, 50, 6, 9, 1.0, "Consumed as is", ["mungfali butter"], [{d: "1 tbsp", w: 16}, {d: "2 tbsp", w: 32}]],
      ["chia seeds", 486, 17, 42, 31, 34, 0, 1.0, "Expands in liquid", ["sabja"], [{d: "1 tbsp", w: 12}, {d: "1 tsp", w: 4}]],
      ["flaxseeds", 534, 18, 29, 42, 27, 1.5, 1.0, "Consumed powdered for absorption", ["alsi"], [{d: "1 tbsp", w: 10}, {d: "1 tsp", w: 3}]],
      ["sunflower seeds", 584, 21, 20, 51, 8.6, 2.6, 1.0, "Consumed roasted", ["surajmukhi beej"], [{d: "1 tbsp", w: 10}, {d: "1 handful", w: 30}]],
      ["pumpkin seeds", 559, 30, 10, 49, 6, 1.4, 1.0, "Consumed roasted", ["kaddu beej"], [{d: "1 tbsp", w: 10}, {d: "1 handful", w: 30}]],
      ["sesame seeds", 573, 18, 23, 50, 12, 0.3, 1.0, "Consumed roasted", ["til"], [{d: "1 tbsp", w: 9}, {d: "1 tsp", w: 3}]],
      ["pistachios", 562, 20, 28, 45, 10, 8, 1.0, "Consumed roasted", ["pista"], [{d: "1 handful", w: 30}, {d: "10 pistachios", w: 7}]],
      ["pine nuts", 673, 14, 13, 68, 3.7, 3.6, 1.0, "Consumed raw", ["chilgoza"], [{d: "1 tbsp", w: 10}, {d: "1 handful", w: 30}]],
      ["macadamia nuts", 718, 8, 14, 76, 8.6, 4.6, 1.0, "Consumed raw", ["macadamia"], [{d: "1 handful", w: 30}, {d: "10 nuts", w: 25}]],
      ["brazil nuts", 659, 14, 12, 67, 7.5, 2.3, 1.0, "Consumed raw", ["brazil nut"], [{d: "1 handful", w: 30}, {d: "1 nut", w: 5}]],
      ["makhana", 347, 9.7, 76.9, 0.1, 14.5, 0, 1.0, "Roasted till crunchy", ["lotus seeds", "fox nuts"], [{d: "1 cup roasted", w: 30}, {d: "1 large bowl", w: 60}]]
    ],
    dairy: [
      ["almond milk", 15, 0.6, 0.3, 1.2, 0, 0, 1.0, "Used raw", ["badam doodh"], [{d: "1 cup", w: 240}, {d: "1 glass", w: 300}]],
      ["soy milk", 33, 3.3, 1.8, 1.8, 0.6, 1, 1.0, "Used raw", ["soya milk"], [{d: "1 cup", w: 240}, {d: "1 glass", w: 300}]],
      ["coconut milk", 230, 2.3, 5.5, 24, 0, 3.3, 1.0, "Used in cooking", ["nariyal doodh"], [{d: "1 cup", w: 240}, {d: "1 tbsp", w: 15}]]
    ],
    oils_fats: [
      ["olive oil", 884, 0, 0, 100, 0, 0, 1.0, "Used for dressing or light cooking", ["jaitun ka tel"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["coconut oil", 862, 0, 0, 100, 0, 0, 1.0, "Stable at high heat", ["nariyal tel", "velichenna"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["mustard oil", 884, 0, 0, 100, 0, 0, 1.0, "High smoke point, strong flavor", ["sarson ka tel", "rai ka tel"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["sunflower oil", 884, 0, 0, 100, 0, 0, 1.0, "Neutral oil for cooking", ["surajmukhi tel"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["avocado", 160, 2, 8.5, 15, 6.7, 0.7, 1.0, "Consumed raw", ["butter fruit"], [{d: "1 medium", w: 150}, {d: "half avocado", w: 75}]],
      ["groundnut oil", 884, 0, 0, 100, 0, 0, 1.0, "High smoke point", ["peanut oil", "mungfali tel"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["sesame oil", 884, 0, 0, 100, 0, 0, 1.0, "Nutty flavor", ["til ka tel", "gingelly oil"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["soybean oil", 884, 0, 0, 100, 0, 0, 1.0, "Neutral oil", ["soya oil"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["palm oil", 884, 0, 0, 100, 0, 0, 1.0, "Used in processed foods", ["palmolein"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["canola oil", 884, 0, 0, 100, 0, 0, 1.0, "Neutral oil", ["rapeseed oil"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["rice bran oil", 884, 0, 0, 100, 0, 0, 1.0, "High smoke point", ["rice oil"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["almond oil", 884, 0, 0, 100, 0, 0, 1.0, "Used for dressing", ["badam rogan"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]],
      ["walnut oil", 884, 0, 0, 100, 0, 0, 1.0, "Nutty flavor", ["akhrot tel"], [{d: "1 tbsp", w: 15}, {d: "1 tsp", w: 5}]]
    ]
  }
};

const json1 = { categories: { animal: {}, plant: {} }, lingo_map: {} };
const json2 = { food_lookup: {}, goals_index: {}, prepared_meals: {}, cooking_conversions: { description: "Multiply raw weight by ratio to get cooked weight. Divide cooked weight by ratio to get raw equivalent.", ratios: {} }, portion_guide: {} };

for (const branch of ["animal", "plant"]) {
  for (const [cat, foods] of Object.entries(data[branch])) {
    json1.categories[branch][cat] = [];
    
    for (const food of foods) {
      const [name, cal, pro, carb, fat, fiber, sug, ratio, note, lingo, servings] = food;
      json1.categories[branch][cat].push(name);
      
      for (const term of lingo) {
        json1.lingo_map[term] = name;
      }
      json1.lingo_map[name] = name;
      
      const cFactor = 1 / ratio;
      
      const cookedBase = {
        calories: Math.round(cal * cFactor),
        protein: Number((pro * cFactor).toFixed(1)),
        carbs: Number((carb * cFactor).toFixed(1)),
        fat: Number((fat * cFactor).toFixed(1)),
        fiber: Number((fiber * cFactor).toFixed(1)),
        sugar: Number((sug * cFactor).toFixed(1))
      };
      
      const rawBase = { calories: cal, protein: pro, carbs: carb, fat: fat, fiber: fiber, sugar: sug };
      
      const methods = {};
      if (branch === "animal" && (cat === "meat" || cat === "fish_seafood" || cat === "eggs")) {
         methods["boiled"] = cookedBase;
         methods["grilled"] = {
           calories: Math.round(cal * cFactor) + 15,
           protein: Number((pro * cFactor).toFixed(1)),
           carbs: Number((carb * cFactor).toFixed(1)),
           fat: Number((fat * cFactor * 0.85).toFixed(1))
         };
         methods["fried"] = {
           calories: Math.round(cal * cFactor) + 80,
           protein: Number((pro * cFactor * 0.9).toFixed(1)),
           carbs: Number((carb * cFactor).toFixed(1)) + 4,
           fat: Number(((fat * cFactor) + 8).toFixed(1))
         };
      }
      
      const entry = {
        category: cat,
        branch: branch,
        lingo: lingo,
        raw: { per_100g: rawBase },
        cooked: { per_100g: cookedBase },
        raw_to_cooked_ratio: ratio,
        cooking_note: note,
        serving_examples: servings.map(s => ({ description: s.d, weight_g: s.w }))
      };
      
      if (Object.keys(methods).length > 0) {
        entry.cooked.methods = methods;
      }
      
      if (name === "pork bacon") {
        entry.cooked = {
          per_100g: { calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0, sugar: 0 },
          methods: {
            pan_fried: { calories: 576, protein: 37, carbs: 1.4, fat: 46 },
            oven_baked: { calories: 541, protein: 37, carbs: 1.4, fat: 42 },
            grilled: { calories: 510, protein: 38, carbs: 1.4, fat: 39 }
          }
        };
      }
      
      json2.food_lookup[name] = entry;
      json2.cooking_conversions.ratios[name] = { raw_to_cooked: ratio, cooked_to_raw: Number((1 / ratio).toFixed(2)) };
    }
  }
}

// Add drumstick disambiguation
json1.lingo_map["chicken drumstick"] = "chicken leg";
json1.lingo_map["murgi ki tangdi"] = "chicken leg";
json1.lingo_map["leg piece"] = "chicken leg";
json1.lingo_map["drumstick"] = "drumstick";
json1.lingo_map["moringa"] = "drumstick";
json1.lingo_map["sahjan"] = "drumstick";

json2.goals_index = {
  "muscle_gain": {
    "primary_foods": ["chicken breast", "whole egg", "paneer", "lentils", "oats", "brown rice", "whole milk", "greek yogurt", "salmon", "tofu"],
    "secondary_foods": ["banana", "peanut butter", "almonds", "sweet potato", "quinoa"],
    "minimize": ["oils_fats", "sugar", "processed foods"],
    "macro_targets_per_kg_bodyweight": { "protein": 1.8, "carbs": 4, "fat": 1, "calories_surplus": 300 },
    "meal_timing_note": "Prioritize protein within 2 hours post-workout"
  },
  "fat_loss": {
    "primary_foods": ["egg white", "chicken breast", "spinach", "broccoli", "greek yogurt", "cucumber", "moong dal", "pomfret"],
    "secondary_foods": ["oats", "apple", "almonds", "sweet potato"],
    "minimize": ["white rice", "banana", "ghee", "whole milk", "bread"],
    "macro_targets_per_kg_bodyweight": { "protein": 2.2, "carbs": 2, "fat": 0.8, "calories_deficit": 400 },
    "meal_timing_note": "Spread protein evenly across 4-5 meals to preserve muscle"
  },
  "maintain": {
    "primary_foods": ["oats", "whole egg", "lentils", "white rice", "paneer", "banana", "curd"],
    "secondary_foods": ["almonds", "spinach", "rohu"],
    "minimize": [],
    "macro_targets_per_kg_bodyweight": { "protein": 1.6, "carbs": 3.5, "fat": 1, "calories_surplus": 0 },
    "meal_timing_note": "Consistent meal timing matters more than strict tracking"
  },
  "athletic_performance": {
    "primary_foods": ["oats", "banana", "white rice", "chicken breast", "whole egg", "sweet potato", "dates"],
    "secondary_foods": ["greek yogurt", "almonds", "quinoa", "salmon"],
    "minimize": ["high fat foods pre-workout", "excessive fiber pre-workout"],
    "macro_targets_per_kg_bodyweight": { "protein": 1.8, "carbs": 5, "fat": 1.2, "calories_surplus": 200 },
    "meal_timing_note": "High carb meal 2-3 hours pre-workout, protein + carb within 30 mins post"
  },
  "vegan_muscle_gain": {
    "primary_foods": ["tofu", "tempeh", "soybeans", "lentils", "moong dal", "quinoa", "oats", "peanut butter", "chickpeas", "edamame"],
    "secondary_foods": ["brown rice", "sweet potato", "almonds", "walnuts", "banana"],
    "minimize": ["excessive oil", "processed vegan junk food"],
    "macro_targets_per_kg_bodyweight": { "protein": 1.8, "carbs": 4.5, "fat": 1, "calories_surplus": 300 },
    "meal_timing_note": "Combine protein sources (e.g., rice and beans) and prioritize high-protein soy products"
  }
};

json2.prepared_meals = {
  "dal chawal": {
    "lingo": ["dal rice", "dal bhat", "rice and dal"],
    "components": [
      { "food": "lentils", "weight_g": 150, "state": "cooked" },
      { "food": "white rice", "weight_g": 150, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 299, "protein": 9, "carbs": 38, "fat": 0.8, "fiber": 3.4, "sugar": 0.7 },
    "serving_note": "Standard 1 plate lunch portion"
  },
  "roti sabzi": {
    "lingo": ["roti with sabzi", "phulka sabzi"],
    "components": [
      { "food": "roti", "weight_g": 80, "state": "cooked" },
      { "food": "mixed vegetables", "weight_g": 150, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 350, "protein": 10, "carbs": 55, "fat": 10, "fiber": 8, "sugar": 4 },
    "serving_note": "2 roti + 150g mixed vegetable curry"
  },
  "khichdi": {
    "lingo": ["dal khichdi", "khichari"],
    "components": [
      { "food": "white rice", "weight_g": 125, "state": "cooked" },
      { "food": "moong dal", "weight_g": 125, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 300, "protein": 11, "carbs": 50, "fat": 4, "fiber": 6, "sugar": 1 },
    "serving_note": "rice + moong dal 50/50, 250g cooked"
  },
  "poha breakfast": {
    "lingo": ["kanda poha", "poha plate"],
    "components": [
      { "food": "poha", "weight_g": 200, "state": "cooked" },
      { "food": "sunflower oil", "weight_g": 5, "state": "raw" }
    ],
    "combined_per_serving": { "calories": 395, "protein": 7, "carbs": 77, "fat": 6.2, "fiber": 1, "sugar": 0 },
    "serving_note": "200g cooked poha + 1 tsp oil"
  },
  "upma breakfast": {
    "lingo": ["rava upma", "sooji upma"],
    "components": [
      { "food": "upma", "weight_g": 200, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 200, "protein": 5, "carbs": 25, "fat": 8, "fiber": 2, "sugar": 1 },
    "serving_note": "200g cooked upma"
  },
  "egg rice": {
    "lingo": ["anda chawal", "egg fried rice"],
    "components": [
      { "food": "white rice", "weight_g": 150, "state": "cooked" },
      { "food": "whole egg", "weight_g": 100, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 345, "protein": 15.7, "carbs": 29.1, "fat": 11.4, "fiber": 0.1, "sugar": 1.2 },
    "serving_note": "150g white rice cooked + 2 whole eggs scrambled"
  },
  "curd rice": {
    "lingo": ["thayir sadam", "dahi chawal"],
    "components": [
      { "food": "white rice", "weight_g": 150, "state": "cooked" },
      { "food": "curd", "weight_g": 100, "state": "raw" }
    ],
    "combined_per_serving": { "calories": 228, "protein": 7, "carbs": 31.4, "fat": 4.6, "fiber": 0.1, "sugar": 3.5 },
    "serving_note": "150g white rice cooked + 100g curd"
  },
  "paneer bhurji": {
    "lingo": ["scrambled paneer"],
    "components": [
      { "food": "paneer", "weight_g": 100, "state": "cooked" },
      { "food": "sunflower oil", "weight_g": 5, "state": "raw" }
    ],
    "combined_per_serving": { "calories": 341, "protein": 14, "carbs": 8.4, "fat": 30, "fiber": 2, "sugar": 3.4 },
    "serving_note": "100g paneer + 1 tsp oil + onion tomato base"
  },
  "egg bhurji plate": {
    "lingo": ["bhurji pav", "anda bhurji roti"],
    "components": [
      { "food": "egg bhurji", "weight_g": 100, "state": "cooked" },
      { "food": "roti", "weight_g": 80, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 398, "protein": 21.5, "carbs": 48, "fat": 18, "fiber": 6, "sugar": 1.5 },
    "serving_note": "2 eggs bhurji + 2 roti"
  },
  "oats with milk": {
    "lingo": ["oatmeal", "doodh oats"],
    "components": [
      { "food": "oats", "weight_g": 80, "state": "raw" },
      { "food": "whole milk", "weight_g": 250, "state": "raw" }
    ],
    "combined_per_serving": { "calories": 464, "protein": 21.5, "carbs": 65, "fat": 13.8, "fiber": 8.5, "sugar": 12 },
    "serving_note": "80g raw oats + 250ml whole milk"
  },
  "bread omelette": {
    "lingo": ["omelette pav"],
    "components": [
      { "food": "bread", "weight_g": 60, "state": "raw" },
      { "food": "omelette", "weight_g": 120, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 467, "protein": 27.4, "carbs": 30.6, "fat": 26, "fiber": 3, "sugar": 3.5 },
    "serving_note": "2 slices bread + 2 egg omelette"
  },
  "rajma chawal": {
    "lingo": ["rajma rice"],
    "components": [
      { "food": "rajma", "weight_g": 150, "state": "cooked" },
      { "food": "white rice", "weight_g": 150, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 330, "protein": 12.1, "carbs": 44, "fat": 1.8, "fiber": 8, "sugar": 1.2 },
    "serving_note": "150g rajma cooked + 150g white rice cooked"
  },
  "chana salad": {
    "lingo": ["chickpea salad", "chole salad"],
    "components": [
      { "food": "chickpeas", "weight_g": 100, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 164, "protein": 8.5, "carbs": 27.4, "fat": 2.6, "fiber": 7.6, "sugar": 4.8 },
    "serving_note": "100g chickpeas cooked + vegetables, no dressing"
  },
  "peanut butter banana": {
    "lingo": ["pb banana"],
    "components": [
      { "food": "peanut butter", "weight_g": 16, "state": "raw" },
      { "food": "banana", "weight_g": 118, "state": "raw" }
    ],
    "combined_per_serving": { "calories": 199, "protein": 5.3, "carbs": 30.3, "fat": 8.3, "fiber": 4, "sugar": 15.6 },
    "serving_note": "1 tbsp peanut butter + 1 medium banana"
  },
  "chicken rice bowl": {
    "lingo": ["chicken chawal", "chicken and rice"],
    "components": [
      { "food": "chicken breast", "weight_g": 150, "state": "cooked" },
      { "food": "white rice", "weight_g": 150, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 370, "protein": 47.7, "carbs": 28, "fat": 5.7, "fiber": 0.1, "sugar": 0 },
    "serving_note": "150g chicken breast cooked + 150g white rice cooked"
  },
  "tuna salad": {
    "lingo": ["tuna mixed salad"],
    "components": [
      { "food": "tuna", "weight_g": 130, "state": "cooked" }
    ],
    "combined_per_serving": { "calories": 171, "protein": 36.4, "carbs": 4, "fat": 1.3, "fiber": 1.5, "sugar": 2 },
    "serving_note": "130g tuna + cucumber + tomato, no mayo"
  }
};

json2.portion_guide = {
  "1 katori": { "volume_ml": 150, "typical_foods": ["dal", "sabzi", "curd", "rice"] },
  "1 small katori": { "volume_ml": 100, "typical_foods": ["dal", "chutney", "curd"] },
  "1 large katori": { "volume_ml": 200, "typical_foods": ["dal", "curry", "rice"] },
  "1 cup": { "volume_ml": 240, "typical_foods": ["oats", "milk", "salad"] },
  "1 tbsp": { "volume_ml": 15, "typical_foods": ["oil", "peanut butter", "ghee"] },
  "1 tsp": { "volume_ml": 5, "typical_foods": ["oil", "ghee", "sugar"] },
  "1 glass": { "volume_ml": 250, "typical_foods": ["milk", "buttermilk", "lassi", "juice"] },
  "1 shot glass": { "volume_ml": 30, "typical_foods": ["juice", "aloe vera"] },
  "1 mug": { "volume_ml": 300, "typical_foods": ["milk", "coffee", "tea"] },
  "1 bowl": { "volume_ml": 300, "typical_foods": ["oats", "poha", "upma", "soup"] },
  "1 plate": { "description": "Standard Indian meal plate", "components": "2 roti + 1 katori dal + 1 katori sabzi + 50g rice" },
  "1 pav": { "description": "Indian bread roll", "gram_weight": 40, "typical_foods": ["pav"] },
  "1 paratha": { "description": "Layered flatbread", "gram_weight": 80, "typical_foods": ["paratha"] },
  "1 idli": { "description": "Steamed rice cake", "gram_weight": 30, "typical_foods": ["idli"] },
  "1 dosa": { "description": "Thin crepe", "gram_weight": 90, "typical_foods": ["dosa"] },
  "1 vada": { "description": "Fried lentil donut", "gram_weight": 50, "typical_foods": ["vada"] },
  "1 ladoo": { "description": "Sweet ball", "gram_weight": 40, "typical_foods": ["ladoo", "sweets"] }
};

const microMap = {
  "chicken breast": { "iron_mg": 1.1, "calcium_mg": 11, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0.3, "zinc_mg": 0.9, "magnesium_mg": 25, "potassium_mg": 220, "omega3_g": 0.1 },
  "whole egg": { "iron_mg": 1.2, "calcium_mg": 25, "vitamin_d_iu": 41, "vitamin_b12_mcg": 0.4, "zinc_mg": 0.6, "magnesium_mg": 5, "potassium_mg": 60, "omega3_g": 0.04 },
  "salmon": { "iron_mg": 0.3, "calcium_mg": 9, "vitamin_d_iu": 526, "vitamin_b12_mcg": 3.2, "zinc_mg": 0.4, "magnesium_mg": 27, "potassium_mg": 363, "omega3_g": 2.3 },
  "spinach": { "iron_mg": 2.7, "calcium_mg": 99, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 0.5, "magnesium_mg": 79, "potassium_mg": 558, "omega3_g": 0.1 },
  "paneer": { "iron_mg": 0.1, "calcium_mg": 480, "vitamin_d_iu": 15, "vitamin_b12_mcg": 0.8, "zinc_mg": 2.5, "magnesium_mg": 15, "potassium_mg": 100, "omega3_g": 0 },
  "lentils": { "iron_mg": 3.3, "calcium_mg": 19, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 1.3, "magnesium_mg": 36, "potassium_mg": 369, "omega3_g": 0 },
  "oats": { "iron_mg": 4.7, "calcium_mg": 54, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 4, "magnesium_mg": 177, "potassium_mg": 429, "omega3_g": 0.1 },
  "banana": { "iron_mg": 0.3, "calcium_mg": 5, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 0.2, "magnesium_mg": 27, "potassium_mg": 358, "omega3_g": 0 },
  "almonds": { "iron_mg": 3.7, "calcium_mg": 268, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 3.1, "magnesium_mg": 270, "potassium_mg": 733, "omega3_g": 0 },
  "broccoli": { "iron_mg": 0.7, "calcium_mg": 47, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 0.4, "magnesium_mg": 21, "potassium_mg": 316, "omega3_g": 0.1 },
  "sweet potato": { "iron_mg": 0.6, "calcium_mg": 30, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 0.3, "magnesium_mg": 25, "potassium_mg": 337, "omega3_g": 0 },
  "curd": { "iron_mg": 0.1, "calcium_mg": 121, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0.4, "zinc_mg": 0.6, "magnesium_mg": 12, "potassium_mg": 155, "omega3_g": 0 },
  "whole milk": { "iron_mg": 0.1, "calcium_mg": 113, "vitamin_d_iu": 40, "vitamin_b12_mcg": 0.5, "zinc_mg": 0.4, "magnesium_mg": 10, "potassium_mg": 132, "omega3_g": 0 },
  "moong dal": { "iron_mg": 3.6, "calcium_mg": 27, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 1.4, "magnesium_mg": 40, "potassium_mg": 380, "omega3_g": 0 },
  "chickpeas": { "iron_mg": 2.9, "calcium_mg": 49, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 1.5, "magnesium_mg": 48, "potassium_mg": 291, "omega3_g": 0.1 },
  "tuna": { "iron_mg": 1.5, "calcium_mg": 11, "vitamin_d_iu": 227, "vitamin_b12_mcg": 10.9, "zinc_mg": 0.6, "magnesium_mg": 35, "potassium_mg": 252, "omega3_g": 0.2 },
  "tofu": { "iron_mg": 5.4, "calcium_mg": 350, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 1.6, "magnesium_mg": 58, "potassium_mg": 121, "omega3_g": 0.6 },
  "brown rice": { "iron_mg": 0.4, "calcium_mg": 10, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 0.6, "magnesium_mg": 43, "potassium_mg": 43, "omega3_g": 0 },
  "dates": { "iron_mg": 1, "calcium_mg": 39, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 0.3, "magnesium_mg": 43, "potassium_mg": 656, "omega3_g": 0 },
  "pumpkin seeds": { "iron_mg": 8.8, "calcium_mg": 46, "vitamin_d_iu": 0, "vitamin_b12_mcg": 0, "zinc_mg": 7.8, "magnesium_mg": 592, "potassium_mg": 809, "omega3_g": 0.1 }
};

for (const [food, macros] of Object.entries(microMap)) {
  if (json2.food_lookup[food]) {
    json2.food_lookup[food].micronutrients = macros;
  }
}

fs.writeFileSync(path.join(__dirname, '../lib', 'category-index.json'), JSON.stringify(json1));
fs.writeFileSync(path.join(__dirname, '../lib', 'nutrition-data.json'), JSON.stringify(json2));

console.log("Generated both files successfully.");
