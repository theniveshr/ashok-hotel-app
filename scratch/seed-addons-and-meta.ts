import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Enriching menu items with metadata and addons...');

  // 1. Ingredients, Allergens, Tags & Calories map
  const metaMap: Record<string, { ingredients: string[]; allergens: string[]; tags: string[]; calories: number }> = {
    // Restaurant Breakfast
    'rest-idly': {
      ingredients: ['Parboiled Rice', 'Urad Dal', 'Fenugreek', 'Purified Water', 'Rock Salt'],
      allergens: [],
      tags: ['breakfast', 'idly', 'healthy', 'tiffin', 'steamed', 'gluten-free'],
      calories: 140,
    },
    'rest-vada': {
      ingredients: ['Urad Dal', 'Curry Leaves', 'Crushed Peppercorns', 'Ginger', 'Green Chilies', 'Peanut Oil'],
      allergens: [],
      tags: ['breakfast', 'vada', 'crispy', 'snack', 'sambar'],
      calories: 180,
    },
    'rest-pongal': {
      ingredients: ['Raw Rice', 'Moong Dal', 'Pure Cow Ghee', 'Black Pepper', 'Cumin Seeds', 'Ginger', 'Cashew Nuts'],
      allergens: ['Dairy', 'Tree Nuts'],
      tags: ['breakfast', 'pongal', 'ghee', 'comfort food', 'traditional'],
      calories: 320,
    },
    'rest-poori': {
      ingredients: ['Whole Wheat Flour', 'Potatoes', 'Onions', 'Turmeric', 'Green Chilies', 'Mustard Seeds'],
      allergens: ['Gluten'],
      tags: ['breakfast', 'poori', 'masala', 'fluffy'],
      calories: 310,
    },
    'rest-idiyappam': {
      ingredients: ['Roasted Rice Flour', 'Cardamom', 'Fresh Coconut Milk', 'Purified Water'],
      allergens: [],
      tags: ['breakfast', 'idiyappam', 'string hoppers', 'steamed', 'light'],
      calories: 190,
    },
    'rest-parotto': {
      ingredients: ['All Purpose Flour', 'Milk', 'Refined Oil', 'Sugar', 'Salt'],
      allergens: ['Gluten', 'Dairy'],
      tags: ['parotta', 'layered', 'tiffin', 'salna'],
      calories: 340,
    },
    'rest-chapati': {
      ingredients: ['Whole Wheat Atta', 'Purified Water', 'Salt', 'Refined Sunflower Oil'],
      allergens: ['Gluten'],
      tags: ['chapati', 'healthy', 'roti', 'wheat'],
      calories: 180,
    },
    'rest-ghee-dosa': {
      ingredients: ['Rice Flour', 'Urad Dal', 'Pure Cow Ghee', 'Fenugreek', 'Curry Leaves'],
      allergens: ['Dairy'],
      tags: ['dosa', 'ghee', 'breakfast', 'crispy', 'bestseller'],
      calories: 380,
    },
    'rest-ordinary-dosa': {
      ingredients: ['Rice Flour', 'Urad Dal', 'Fenugreek Seeds', 'Gingelly Oil'],
      allergens: [],
      tags: ['dosa', 'tiffin', 'simple', 'traditional'],
      calories: 220,
    },
    'rest-onion-dosa': {
      ingredients: ['Rice Flour', 'Urad Dal', 'Finely Diced Shallots', 'Green Chilies', 'Curry Leaves', 'Cumin'],
      allergens: [],
      tags: ['dosa', 'onion', 'crunchy', 'breakfast'],
      calories: 260,
    },
    'rest-podi-dosa': {
      ingredients: ['Rice Flour', 'Urad Dal', 'Chettinad Gunpowder (Idli Podi)', 'Pure Gingelly Oil'],
      allergens: ['Sesame'],
      tags: ['dosa', 'podi', 'spicy', 'chettinad'],
      calories: 310,
    },
    'rest-rava-dosa': {
      ingredients: ['Semolina (Rava)', 'Rice Flour', 'Cracked Black Pepper', 'Cumin', 'Cashews', 'Ginger'],
      allergens: ['Gluten', 'Tree Nuts'],
      tags: ['rava', 'dosa', 'netted', 'crispy'],
      calories: 290,
    },
    'rest-special-dosa': {
      ingredients: ['Rice Batter', 'Butter', 'Chettinad Masala', 'Chopped Cashews', 'Grated Paneer'],
      allergens: ['Dairy', 'Tree Nuts'],
      tags: ['dosa', 'special', 'chef special', 'rich'],
      calories: 420,
    },
    'rest-egg-dosa': {
      ingredients: ['Rice Batter', 'Farm Fresh Egg', 'Crushed Black Pepper', 'Curry Leaves', 'Chicken Salna Drizzle'],
      allergens: ['Eggs'],
      tags: ['egg', 'dosa', 'non-veg', 'madurai style'],
      calories: 340,
    },
    'rest-egg-kalaki': {
      ingredients: ['Farm Egg', 'Chettinad Chicken Gravy', 'Black Pepper', 'Onion', 'Curry Leaves'],
      allergens: ['Eggs'],
      tags: ['egg', 'kalaki', 'madurai', 'street food', 'spicy'],
      calories: 160,
    },
    'rest-omelette': {
      ingredients: ['2 Country Eggs', 'Chopped Onions', 'Green Chilies', 'Black Pepper', 'Coriander'],
      allergens: ['Eggs'],
      tags: ['egg', 'omelette', 'quick', 'protein'],
      calories: 210,
    },
    'rest-egg-podimass': {
      ingredients: ['Eggs', 'Finely Chopped Onions', 'Green Chilies', 'Turmeric', 'Mustard Seeds'],
      allergens: ['Eggs'],
      tags: ['egg', 'podimass', 'scrambled', 'protein'],
      calories: 220,
    },
    'rest-half-boil': {
      ingredients: ['Farm Fresh Egg', 'Cracked Black Pepper', 'Rock Salt'],
      allergens: ['Eggs'],
      tags: ['egg', 'half boil', 'bullseye', 'quick'],
      calories: 90,
    },
    'rest-boiled-egg': {
      ingredients: ['2 Hard Boiled Eggs', 'Salt', 'Black Pepper Powder'],
      allergens: ['Eggs'],
      tags: ['egg', 'boiled', 'protein', 'fitness'],
      calories: 140,
    },
    'rest-mutton-biryani': {
      ingredients: ['Seeraga Samba Rice', 'Tender Country Mutton', 'Pure Ghee', 'Chettinad Spices', 'Mint', 'Yogurt'],
      allergens: ['Dairy'],
      tags: ['biryani', 'mutton', 'seeraga samba', 'bestseller', 'chettinad', 'spicy'],
      calories: 680,
    },
    'rest-chicken-biryani': {
      ingredients: ['Seeraga Samba Rice', 'Country Chicken', 'Pure Cow Ghee', 'Star Anise', 'Cardamom', 'Cloves'],
      allergens: ['Dairy'],
      tags: ['biryani', 'chicken', 'traditional', 'lunch', 'spicy'],
      calories: 590,
    },
    'rest-nonveg-meals': {
      ingredients: ['Ponni Boiled Rice', 'Mutton Salna', 'Chicken Kuzhambu', 'Fish Gravy', 'Rasam', 'Kootu', 'Appalam'],
      allergens: ['Fish'],
      tags: ['meals', 'nonveg', 'thali', 'chettinad', 'full meals'],
      calories: 820,
    },
    'rest-chicken-65': {
      ingredients: ['Boneless Chicken', 'Kashmiri Chili', 'Ginger-Garlic Paste', 'Curry Leaves', 'Lemon Juice'],
      allergens: [],
      tags: ['chicken 65', 'starter', 'crispy', 'spicy'],
      calories: 390,
    },
    'rest-bun-parotta': {
      ingredients: ['Maida Dough', 'Milk', 'Pure Ghee', 'Salna Gravy'],
      allergens: ['Gluten', 'Dairy'],
      tags: ['bun parotta', 'madurai', 'fluffy', 'dinner', 'bestseller'],
      calories: 460,
    },

    // Pure Veg
    'veg-ghee-roast': {
      ingredients: ['Aromatic Rice Batter', 'Pure Desi Cow Ghee', 'Fenugreek', 'Curry Leaves'],
      allergens: ['Dairy'],
      tags: ['pure veg', 'ghee roast', 'dosa', 'crispy'],
      calories: 380,
    },
    'veg-mini-idly': {
      ingredients: ['Mini Steamed Idlis (14 Pcs)', 'Piping Hot Drumstick Sambar', 'Pure Cow Ghee Garnish'],
      allergens: ['Dairy'],
      tags: ['pure veg', 'mini idly', 'sambar', 'ghee'],
      calories: 260,
    },
    'veg-pongal-vada': {
      ingredients: ['Ven Pongal in Desi Ghee', 'Crispy Golden Medu Vada', 'Sambar', 'Coconut Chutney'],
      allergens: ['Dairy', 'Tree Nuts'],
      tags: ['pure veg', 'combo', 'pongal', 'vada', 'tiffin'],
      calories: 460,
    },
    'veg-banana-leaf-meals': {
      ingredients: ['Ponni Rice', 'Drumstick Sambar', 'Tomato Rasam', 'Cabbage Poriyal', 'Chow-Chow Kootu', 'Payasam', 'Appalam'],
      allergens: ['Dairy'],
      tags: ['pure veg', 'banana leaf', 'full meals', 'traditional', 'thali'],
      calories: 650,
    },
    'veg-paneer-biryani': {
      ingredients: ['Basmati Rice', 'Fresh Malai Paneer Cubes', 'Fried Onions', 'Saffron', 'Whole Spices', 'Pure Ghee'],
      allergens: ['Dairy'],
      tags: ['pure veg', 'paneer', 'biryani', 'dum'],
      calories: 520,
    },
    'veg-paneer-butter-masala': {
      ingredients: ['Fresh Soft Paneer', 'Plum Tomato Gravy', 'Cashew Cream', 'Butter', 'Kasturi Methi'],
      allergens: ['Dairy', 'Tree Nuts'],
      tags: ['pure veg', 'paneer butter masala', 'curry', 'naan'],
      calories: 410,
    },
    'veg-filter-coffee': {
      ingredients: ['Freshly Ground Peaberry & Plantation A Coffee Beans', 'Boiled Farm Milk', 'Sugar'],
      allergens: ['Dairy'],
      tags: ['coffee', 'beverage', 'filter coffee', 'degree coffee', 'traditional'],
      calories: 110,
    },

    // Bakery & Sweets
    'bakery-pani-puri': {
      ingredients: ['Crisp Semolina Puris', 'Sprouted Moong & Potato Masala', 'Tangy Mint-Coriander Pani', 'Sweet Tamarind Chutney'],
      allergens: ['Gluten'],
      tags: ['bakery', 'chaat', 'pani puri', 'street food', 'tangy'],
      calories: 190,
    },
    'bakery-samosa-chaat': {
      ingredients: ['Crispy Potato Samosa', 'Spiced White Pea Gravy (Ragda)', 'Thick Curd', 'Sweet & Green Chutneys', 'Nylon Sev'],
      allergens: ['Gluten', 'Dairy'],
      tags: ['bakery', 'chaat', 'samosa', 'sev', 'spicy'],
      calories: 340,
    },
    'bakery-ghee-halwa': {
      ingredients: ['Wheat Milk Extract', 'Pure Cow Ghee', 'Raw Cane Sugar', 'Roasted Cashews', 'Cardamom'],
      allergens: ['Dairy', 'Tree Nuts', 'Gluten'],
      tags: ['bakery', 'sweets', 'halwa', 'pure ghee', 'tirunelveli style', 'bestseller'],
      calories: 480,
    },
    'bakery-mysore-pak': {
      ingredients: ['Gram Flour (Besan)', 'Generous Pure Desi Ghee', 'Fine Sugar', 'Cardamom Essence'],
      allergens: ['Dairy'],
      tags: ['bakery', 'sweets', 'mysore pak', 'ghee', 'melt in mouth'],
      calories: 520,
    },
    'bakery-butter-murukku': {
      ingredients: ['Rice Flour', 'Roasted Gram Dal', 'Pure Butter', 'Cumin Seeds', 'Asafoetida', 'Cold Pressed Oil'],
      allergens: ['Dairy'],
      tags: ['bakery', 'savouries', 'murukku', 'butter', 'crunchy', 'snack'],
      calories: 360,
    },
    'bakery-veg-puff': {
      ingredients: ['Flaky Puff Pastry', 'Spiced Carrot, Potato & Green Peas Filling', 'Coriander', 'Baking Butter'],
      allergens: ['Gluten', 'Dairy'],
      tags: ['bakery', 'puff', 'pastry', 'snack', 'hot'],
      calories: 280,
    },
    'bakery-black-forest': {
      ingredients: ['Rich Dark Chocolate Sponge', 'Whipped Vanilla Cream', 'Red Maraschino Cherries', 'Chocolate Shavings'],
      allergens: ['Gluten', 'Dairy'],
      tags: ['bakery', 'cake', 'black forest', 'celebration', 'chocolate', 'bestseller'],
      calories: 420,
    },
    'bakery-custom-cake': {
      ingredients: ['Velvety Vanilla Sponge', 'Whipped Cream', 'Fondant Accents', 'Natural Fruit Puree'],
      allergens: ['Gluten', 'Dairy'],
      tags: ['bakery', 'cake', 'custom cake', 'birthday', 'celebration'],
      calories: 450,
    },
    'bakery-butter-cookies': {
      ingredients: ['Refined Wheat Flour', 'Madagascar Vanilla Extract', 'Pure Unsalted Butter', 'Fine Castor Sugar'],
      allergens: ['Gluten', 'Dairy'],
      tags: ['bakery', 'cookies', 'butter biscuits', 'artisanal', 'tea time'],
      calories: 310,
    },
    'bakery-jigarthanda': {
      ingredients: ['Full Cream Almond Gum (Badam Pisin)', 'Nannari Syrup', 'Thick Reduced Milk (Basundi)', 'Homemade Ice Cream Scoop'],
      allergens: ['Dairy', 'Tree Nuts'],
      tags: ['bakery', 'dessert', 'beverage', 'jigarthanda', 'royal', 'madurai special', 'bestseller'],
      calories: 380,
    },
  };

  // 2. Update all items with meta
  for (const [id, meta] of Object.entries(metaMap)) {
    await prisma.menuItem.updateMany({
      where: { id },
      data: {
        ingredients: meta.ingredients,
        allergens: meta.allergens,
        tags: meta.tags,
        calories: meta.calories,
      },
    });
  }
  console.log('✅ Menu items metadata updated');

  // 3. Addons mapping
  const addonsData: Array<{
    menuItemId: string;
    name: string;
    nameTa: string;
    price: number;
    isRequired?: boolean;
    maxSelect?: number;
  }> = [
    // Bakery Cakes
    {
      menuItemId: 'bakery-black-forest',
      name: 'Size: 1 Kg (+500g extra)',
      nameTa: 'அளவு: 1 கிலோ (+500 கிராம்)',
      price: 350,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-black-forest',
      name: 'Size: 2 Kg Celebration Size',
      nameTa: 'அளவு: 2 கிலோ கொண்டாட்ட அளவு',
      price: 950,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-black-forest',
      name: 'Birthday Candle & Knife Set',
      nameTa: 'மெழுகுவர்த்தி & கத்தி தொகுப்பு',
      price: 25,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-black-forest',
      name: 'Sparkler Firework Candle',
      nameTa: 'ஸ்பார்க்லர் மெழுகுவர்த்தி',
      price: 40,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'bakery-custom-cake',
      name: 'Size: 2 Kg Grand Celebration',
      nameTa: 'அளவு: 2 கிலோ பிரம்மாண்டம்',
      price: 700,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-custom-cake',
      name: 'Premium Gift Box Packing',
      nameTa: 'பிரீமியம் பரிசுப் பெட்டி',
      price: 50,
      isRequired: false,
      maxSelect: 1,
    },

    // Bakery Sweets & Savouries
    {
      menuItemId: 'bakery-ghee-halwa',
      name: 'Pack: 500g (+250g extra)',
      nameTa: 'அளவு: 500 கிராம்',
      price: 160,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-ghee-halwa',
      name: 'Pack: 1 Kg Family Box',
      nameTa: 'அளவு: 1 கிலோ குடும்ப பெட்டி',
      price: 480,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-ghee-halwa',
      name: 'Extra Roasted Golden Cashews',
      nameTa: 'கூடுதல் வறுத்த முந்திரி',
      price: 50,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'bakery-mysore-pak',
      name: 'Pack: 500g (+250g extra)',
      nameTa: 'அளவு: 500 கிராம்',
      price: 170,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-mysore-pak',
      name: 'Pack: 1 Kg Box',
      nameTa: 'அளவு: 1 கிலோ பெட்டி',
      price: 510,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-butter-murukku',
      name: 'Pack: 500g (+250g extra)',
      nameTa: 'அளவு: 500 கிராம்',
      price: 100,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-butter-cookies',
      name: 'Pack: 500g Tin Pack',
      nameTa: 'அளவு: 500 கிராம் டின் பேக்',
      price: 120,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-veg-puff',
      name: 'Extra Hot Mint Chutney Dip',
      nameTa: 'கூடுதல் புதினா சட்னி',
      price: 10,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'bakery-pani-puri',
      name: 'Extra Crisp Puris (6 Pcs)',
      nameTa: 'கூடுதல் பூரி (6 பிஸ்)',
      price: 25,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'bakery-pani-puri',
      name: 'Extra Sweet Tamarind Chutney',
      nameTa: 'கூடுதல் இனிப்பு புளி சட்னி',
      price: 15,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-samosa-chaat',
      name: 'Extra Creamy Dahi (Curd)',
      nameTa: 'கூடுதல் தயிர்',
      price: 15,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-samosa-chaat',
      name: 'Extra Nylon Sev Crisp',
      nameTa: 'கூடுதல் நைலான் சேவ்',
      price: 10,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'bakery-jigarthanda',
      name: 'Extra Royal Basundi Scoop',
      nameTa: 'கூடுதல் பாசுந்தி ஸ்கூப்',
      price: 30,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'bakery-jigarthanda',
      name: 'Extra Roasted Almonds & Cashews',
      nameTa: 'கூடுதல் பாதாம் & முந்திரி',
      price: 25,
      isRequired: false,
      maxSelect: 1,
    },

    // Restaurant Dosa & Breakfast
    {
      menuItemId: 'rest-ghee-dosa',
      name: 'Extra Sambar Bowl',
      nameTa: 'கூடுதல் சாம்பார் கிண்ணம்',
      price: 20,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-ghee-dosa',
      name: 'Extra Gunpowder (Podi) with Pure Ghee',
      nameTa: 'இட்லி பொடி + நெய் கிண்ணம்',
      price: 25,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'rest-ghee-dosa',
      name: 'Extra Fresh Butter Chunk',
      nameTa: 'கூடுதல் வெண்ணெய் துண்டு',
      price: 15,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'veg-ghee-roast',
      name: 'Extra Sambar Bowl',
      nameTa: 'கூடுதல் சாம்பார் கிண்ணம்',
      price: 20,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'veg-ghee-roast',
      name: 'Extra Chettinad Podi & Pure Ghee',
      nameTa: 'இட்லி பொடி + நெய் கிண்ணம்',
      price: 25,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'rest-idly',
      name: 'Extra Drumstick Sambar Bowl',
      nameTa: 'கூடுதல் முருங்கைக்காய் சாம்பார்',
      price: 15,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-idly',
      name: 'Extra Chutney Trio (Coconut, Tomato, Mint)',
      nameTa: 'கூடுதல் 3 வகை சட்னி',
      price: 20,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'rest-pongal',
      name: 'Medu Vada (1 Pc)',
      nameTa: 'மெது வடை (1 பிஸ்)',
      price: 35,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-pongal',
      name: 'Extra Pure Cow Ghee Topping',
      nameTa: 'கூடுதல் பசு நெய்',
      price: 20,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'veg-pongal-vada',
      name: 'Extra Cow Ghee Topping',
      nameTa: 'கூடுதல் பசு நெய்',
      price: 20,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'rest-poori',
      name: 'Extra Potato Masala Bowl',
      nameTa: 'கூடுதல் உருளைக்கிழங்கு மசாலா',
      price: 25,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'rest-poori',
      name: 'Extra Hot Poori (1 Pc)',
      nameTa: 'கூடுதல் பூரி (1 பிஸ்)',
      price: 25,
      isRequired: false,
      maxSelect: 3,
    },
    {
      menuItemId: 'rest-parotto',
      name: 'Extra Chicken Salna Gravy',
      nameTa: 'கூடுதல் சிக்கன் சால்னா',
      price: 35,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-bun-parotta',
      name: 'Extra Rich Mutton Salna',
      nameTa: 'கூடுதல் மட்டன் சால்னா',
      price: 50,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-bun-parotta',
      name: 'Chettinad Egg Kalaki (1 Pc)',
      nameTa: 'செட்டிநாடு முட்டை கலக்கி',
      price: 35,
      isRequired: false,
      maxSelect: 1,
    },

    // Biryani & Meals
    {
      menuItemId: 'rest-mutton-biryani',
      name: 'Size: Full Portion (+Generous Mutton Pieces)',
      nameTa: 'அளவு: முழு பிரியாணி (கூடுதல் கறி துண்டுகள்)',
      price: 160,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'rest-mutton-biryani',
      name: 'Boiled Egg (1 Pc)',
      nameTa: 'அவித்த முட்டை (1 பிஸ்)',
      price: 15,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-mutton-biryani',
      name: 'Chettinad Chicken 65 (2 Pcs)',
      nameTa: 'செட்டிநாடு சிக்கன் 65 (2 பிஸ்)',
      price: 70,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'rest-mutton-biryani',
      name: 'Extra Onion Raitha & Rich Salna',
      nameTa: 'கூடுதல் தயிர் பச்சடி & சால்னா',
      price: 25,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-chicken-biryani',
      name: 'Size: Full Portion (+Extra Chicken Leg)',
      nameTa: 'அளவு: முழு பிரியாணி (கூடுதல் சிக்கன் லெக்)',
      price: 130,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'rest-chicken-biryani',
      name: 'Boiled Egg (1 Pc)',
      nameTa: 'அவித்த முட்டை (1 பிஸ்)',
      price: 15,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-chicken-biryani',
      name: 'Chettinad Chicken 65 (2 Pcs)',
      nameTa: 'செட்டிநாடு சிக்கன் 65 (2 பிஸ்)',
      price: 60,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'veg-paneer-biryani',
      name: 'Size: Full Portion (+Extra Paneer)',
      nameTa: 'அளவு: முழு பிரியாணி (கூடுதல் பனீர்)',
      price: 110,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'veg-paneer-biryani',
      name: 'Extra Grilled Paneer Cubes (6 Pcs)',
      nameTa: 'கூடுதல் வறுத்த பனீர் (6 பிஸ்)',
      price: 50,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-nonveg-meals',
      name: 'Chettinad Fish Fry Cutlet (1 Pc)',
      nameTa: 'செட்டிநாடு மீன் வறுவல்',
      price: 80,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'rest-nonveg-meals',
      name: 'Country Chicken Chukka Cup',
      nameTa: 'நாட்டுக்கோழி சுக்கா கிண்ணம்',
      price: 90,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'veg-banana-leaf-meals',
      name: 'Extra Sweet Semiya Payasam Cup',
      nameTa: 'கூடுதல் சேமியா பாயாசம்',
      price: 30,
      isRequired: false,
      maxSelect: 2,
    },
    {
      menuItemId: 'veg-filter-coffee',
      name: 'Size: Large Brass Tumbler',
      nameTa: 'அளவு: பெரிய பித்தளை டம்ளர்',
      price: 15,
      isRequired: false,
      maxSelect: 1,
    },
    {
      menuItemId: 'veg-filter-coffee',
      name: 'Extra Strong Decoction Shot',
      nameTa: 'கூடுதல் ஸ்ட்ராங் டிகாஷன்',
      price: 10,
      isRequired: false,
      maxSelect: 1,
    },
  ];

  // Clean existing addons to prevent duplicate runs
  await prisma.menuItemAddon.deleteMany({});

  for (const addon of addonsData) {
    await prisma.menuItemAddon.create({
      data: {
        menuItemId: addon.menuItemId,
        name: addon.name,
        nameTa: addon.nameTa,
        price: addon.price,
        isRequired: addon.isRequired ?? false,
        maxSelect: addon.maxSelect ?? 1,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${addonsData.length} addons with variants`);
}

main()
  .catch((e) => {
    console.error('Error seeding addons:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
