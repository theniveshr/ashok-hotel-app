import type { FastifyPluginAsync } from 'fastify';

export const customerMenuRoutes: FastifyPluginAsync = async (app) => {
  const MENU_CACHE_TTL = 300; // 5 minutes cache

  // Helper to determine division from category id or name
  const getDivision = (id?: string | null, name?: string | null): 'restaurant' | 'veg' | 'bakery' => {
    const sId = (id || '').toLowerCase();
    const sName = (name || '').toLowerCase();
    if (
      sId.includes('bakery') ||
      sName.includes('bakery') ||
      sName.includes('cake') ||
      sName.includes('sweet') ||
      sName.includes('chaat') ||
      sName.includes('pastr') ||
      sName.includes('puff') ||
      sName.includes('cookie')
    ) {
      return 'bakery';
    }
    if (sId.includes('veg') || sName.includes('pure veg') || sName.includes('vegetarian')) {
      return 'veg';
    }
    return 'restaurant';
  };

  // ── GET /categories — List all active categories ──────────────────────────
  app.get('/categories', async (req, reply) => {
    const query = req.query as {
      branchId?: string;
      division?: 'restaurant' | 'veg' | 'bakery';
    };

    const cacheKey = `menu:categories:${query.branchId || 'all'}:${query.division || 'all'}`;

    try {
      if (app.redis) {
        const cached = await app.redis.get(cacheKey);
        if (cached) {
          return reply.send({
            success: true,
            data: JSON.parse(cached),
            cached: true,
          });
        }
      }
    } catch {
      // Redis optional fallback
    }

    let categories: any[] = [];
    try {
      const where: any = { isActive: true, deletedAt: null };
      if (query.branchId) {
        where.OR = [{ branchId: query.branchId }, { branchId: null }];
      }

      const dbCategories = await app.prisma.menuCategory.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { menuItems: { where: { deletedAt: null } } },
          },
        },
      });

      categories = dbCategories.map((c: any) => ({
        id: c.id,
        branchId: c.branchId,
        name: c.name,
        nameTa: c.nameTa,
        description: c.description,
        descriptionTa: c.descriptionTa,
        imageUrl: c.imageUrl,
        displayOrder: c.displayOrder,
        isActive: c.isActive,
        division: getDivision(c.id, c.name),
        itemCount: c._count?.menuItems ?? 0,
        _count: c._count,
      }));

      if (query.division) {
        categories = categories.filter((c: any) => c.division === query.division);
      }
    } catch {
      // Robust multi-division fallback if DB is offline
      const fallbackList = [
        // Restaurant
        {
          id: 'cat-rest-breakfast',
          division: 'restaurant',
          name: 'Breakfast & Tiffin',
          nameTa: 'காலை உணவு & டிபன்',
          description: 'Hot idlis, medu vada, ven pongal, poori & parotta',
          descriptionTa: 'சுடச்சுட இட்லி, மெது வடை, வெண் பொங்கல், பூரி & புரோட்டா',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Idly.webp',
          displayOrder: 1,
          isActive: true,
          itemCount: 7,
          _count: { menuItems: 7 },
        },
        {
          id: 'cat-rest-dosa',
          division: 'restaurant',
          name: 'Dosa & Uthappam Varieties',
          nameTa: 'தோசை & உத்தப்பம் வகைகள்',
          description: 'Ghee roast, podi, onion, rava, special & uthappam',
          descriptionTa: 'நெய் ரோஸ்ட், பொடி, வெங்காயம், ரவா & உத்தப்பம்',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Ghee-Dosa.webp',
          displayOrder: 2,
          isActive: true,
          itemCount: 6,
          _count: { menuItems: 6 },
        },
        {
          id: 'cat-rest-egg',
          division: 'restaurant',
          name: 'Egg Specialties',
          nameTa: 'முட்டை வகைகள்',
          description: 'Egg kalaki, egg dosa, omelette, podimass & half-boil',
          descriptionTa: 'முட்டை கலக்கி, முட்டை தோசை, ஆம்லெட், பொடிமாஸ்',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Egg-kalaki.jpg',
          displayOrder: 3,
          isActive: true,
          itemCount: 6,
          _count: { menuItems: 6 },
        },
        {
          id: 'cat-rest-lunch',
          division: 'restaurant',
          name: 'Biryani & Chettinad Meals',
          nameTa: 'பிரியாணி & செட்டிநாடு சாப்பாடு',
          description: 'Seeraga samba mutton & chicken biryani, non-veg meals',
          descriptionTa: 'சீரக சம்பா மட்டன், சிக்கன் பிரியாணி & அசைவ சாப்பாடு',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/hero-image.JPG',
          displayOrder: 4,
          isActive: true,
          itemCount: 3,
          _count: { menuItems: 3 },
        },
        {
          id: 'cat-rest-dinner',
          division: 'restaurant',
          name: 'Dinner & Parotta Specials',
          nameTa: 'இரவு உணவு & பன் புரோட்டா',
          description: 'Madurai bun parotta, kothu parotta, chicken fry & salna',
          descriptionTa: 'மதுரை பன் புரோட்டா, கொத்து புரோட்டா & சிக்கன் வறுவல்',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Parotto.webp',
          displayOrder: 5,
          isActive: true,
          itemCount: 2,
          _count: { menuItems: 2 },
        },
        // Pure Veg
        {
          id: 'cat-veg-breakfast',
          division: 'veg',
          name: 'Pure Veg Tiffin',
          nameTa: 'தூய சைவ டிபன்',
          description: 'Soft idlis, ghee ven pongal, poori masala & crispy vada',
          descriptionTa: 'மல்லிகைப் பூ இட்லி, நெய் பொங்கல், பூரி & வடை',
          displayOrder: 6,
          isActive: true,
          itemCount: 2,
          _count: { menuItems: 2 },
        },
        {
          id: 'cat-veg-dosa',
          division: 'veg',
          name: 'Ghee Roast & Dosa Specials',
          nameTa: 'நெய் ரோஸ்ட் & தோசை வகைகள்',
          description: 'Crispy pure ghee roast, podi dosa, onion & rava dosa',
          descriptionTa: 'சுத்தமான பசு நெய் ரோஸ்ட், பொடி தோசை, ரவா தோசை',
          displayOrder: 7,
          isActive: true,
          itemCount: 1,
          _count: { menuItems: 1 },
        },
        {
          id: 'cat-veg-meals',
          division: 'veg',
          name: 'Banana Leaf Veg Meals',
          nameTa: 'வாழை இலை சைவ சாப்பாடு',
          description: 'Traditional full meals with sambar, rasam, kootu, poriyal & payasam',
          descriptionTa: 'பாரம்பரிய வாழை இலை சாப்பாடு, சாம்பார், ரசம், கூட்டு, பாயாசம்',
          displayOrder: 8,
          isActive: true,
          itemCount: 1,
          _count: { menuItems: 1 },
        },
        {
          id: 'cat-veg-biryani',
          division: 'veg',
          name: 'Veg & Paneer Biryani',
          nameTa: 'சைவ & பனீர் பிரியாணி',
          description: 'Aromatic vegetable dum biryani, paneer biryani & fried rice',
          descriptionTa: 'காய்கறி தம் பிரியாணி, பனீர் பிரியாணி & ஃப்ரைட் ரைஸ்',
          displayOrder: 9,
          isActive: true,
          itemCount: 1,
          _count: { menuItems: 1 },
        },
        {
          id: 'cat-veg-curries',
          division: 'veg',
          name: 'Paneer Curries & Naan',
          nameTa: 'பனீர் கிரேவி & ரொட்டி',
          description: 'Paneer butter masala, mushroom gravy, butter naan & chapati',
          descriptionTa: 'பனீர் பட்டர் மசாலா, காளான் கிரேவி, பட்டர் நான் & சப்பாத்தி',
          displayOrder: 10,
          isActive: true,
          itemCount: 1,
          _count: { menuItems: 1 },
        },
        {
          id: 'cat-veg-beverages',
          division: 'veg',
          name: 'Filter Coffee & Drinks',
          nameTa: 'ஃபில்டர் காபி & பானங்கள்',
          description: 'Kalaiyarkoil filter degree coffee, fresh tea & badam milk',
          descriptionTa: 'காளையார்கோவில் ஃபில்டர் காபி, டீ & சூடான பாதாம் பால்',
          displayOrder: 11,
          isActive: true,
          itemCount: 1,
          _count: { menuItems: 1 },
        },
        // Bakery & Sweets
        {
          id: 'cat-bakery-chaat',
          division: 'bakery',
          name: 'Chaats & Street Food',
          nameTa: 'சாட்ஸ் & தெருவோர உணவுகள்',
          description: 'Pani puri, bhel puri, samosa chaat, sev puri & pav bhaji',
          descriptionTa: 'பானி பூரி, பேல் பூரி, சமோசா சாட் & பாவ் பாஜி',
          displayOrder: 12,
          isActive: true,
          itemCount: 2,
          _count: { menuItems: 2 },
        },
        {
          id: 'cat-bakery-sweets',
          division: 'bakery',
          name: 'Traditional Pure Ghee Sweets',
          nameTa: 'பாரம்பரிய நெய் இனிப்புகள்',
          description: 'Pure ghee wheat halwa, laddu, gulab jamun, mysore pak & kaju katli',
          descriptionTa: 'சுத்த நெய் கோதுமை அல்வா, லட்டு, குலாப் ஜாமூன், மைசூர்பாக்',
          displayOrder: 13,
          isActive: true,
          itemCount: 2,
          _count: { menuItems: 2 },
        },
        {
          id: 'cat-bakery-savouries',
          division: 'bakery',
          name: 'Savouries & Puffs',
          nameTa: 'கார வகைகள் & பப்ஸ்',
          description: 'Butter murukku, mixture, veg puff, egg puff, samosa & pakoda',
          descriptionTa: 'வெண்ணெய் முறுக்கு, மிக்சர், வெஜ் பப்ஸ், முட்டை பப்ஸ் & சமோசா',
          displayOrder: 14,
          isActive: true,
          itemCount: 2,
          _count: { menuItems: 2 },
        },
        {
          id: 'cat-bakery-cakes',
          division: 'bakery',
          name: 'Fresh Celebration Cakes',
          nameTa: 'புதிய கேக் வகைகள்',
          description: 'Black forest, red velvet, chocolate truffle & custom cakes',
          descriptionTa: 'பிளாக் ஃபாரஸ்ட், ரெட் வெல்வெட் & தனிப்பயன் கேக்குகள்',
          displayOrder: 15,
          isActive: true,
          itemCount: 2,
          _count: { menuItems: 2 },
        },
        {
          id: 'cat-bakery-cookies',
          division: 'bakery',
          name: 'Artisanal Cookies & Biscuits',
          nameTa: 'குக்கீஸ் & பிஸ்கட் வகைகள்',
          description: 'Fresh baked coconut cookies, butter biscuits & osmania biscuits',
          descriptionTa: 'தேங்காய் பிஸ்கட், பட்டர் பிஸ்கட் & உஸ்மானியா பிஸ்கட்',
          displayOrder: 16,
          isActive: true,
          itemCount: 1,
          _count: { menuItems: 1 },
        },
        {
          id: 'cat-bakery-juices',
          division: 'bakery',
          name: 'Fresh Fruits & Juices',
          nameTa: 'பழங்கள் & பழச்சாறுகள்',
          description: 'Fresh orange juice, pomegranate, Kalaiyarkoil jigarthanda & milkshakes',
          descriptionTa: 'ஆரஞ்சு ஜூஸ், மாதுளை ஜூஸ், ஜிகர்தண்டா & மில்க்‌ஷேக்',
          displayOrder: 17,
          isActive: true,
          itemCount: 1,
          _count: { menuItems: 1 },
        },
      ];

      categories = query.division
        ? fallbackList.filter((c: any) => c.division === query.division)
        : fallbackList;
    }

    try {
      if (app.redis) {
        await app.redis.set(cacheKey, JSON.stringify(categories), 'EX', MENU_CACHE_TTL);
      }
    } catch {
      // Redis optional fallback
    }

    return reply.send({
      success: true,
      data: categories,
      cached: false,
    });
  });

  // ── GET /items — List/Filter Menu items ───────────────────────────────────
  app.get('/items', async (req, reply) => {
    const query = req.query as {
      categoryId?: string;
      branchId?: string;
      division?: 'restaurant' | 'veg' | 'bakery';
      search?: string;
      isVeg?: string;
      isSpicy?: string;
      isBestseller?: string;
      isFeatured?: string;
      availableOnly?: string;
      sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'prep_time';
    };

    const cacheKey = `menu:items:${JSON.stringify(query)}`;

    try {
      if (app.redis) {
        const cached = await app.redis.get(cacheKey);
        if (cached) {
          return reply.send({
            success: true,
            data: JSON.parse(cached),
            cached: true,
          });
        }
      }
    } catch {
      // Redis optional fallback
    }

    let items: any[] = [];
    try {
      const where: any = { deletedAt: null };

      // Availability filter: if availableOnly=true, only show in-stock items
      if (query.availableOnly === 'true') {
        where.isAvailable = true;
      }

      if (query.categoryId) where.categoryId = query.categoryId;
      if (query.isVeg === 'true') where.isVegetarian = true;
      if (query.isSpicy === 'true') where.isSpicy = true;
      if (query.isBestseller === 'true') where.isBestseller = true;
      if (query.isFeatured === 'true') where.isFeatured = true;

      // Branch filter on category
      if (query.branchId) {
        where.category = {
          OR: [{ branchId: query.branchId }, { branchId: null }],
        };
      }

      // Division filter
      if (query.division === 'bakery') {
        where.categoryId = { startsWith: 'cat-bakery' };
      } else if (query.division === 'veg') {
        where.OR = [
          { categoryId: { startsWith: 'cat-veg' } },
          { isVegetarian: true, categoryId: { not: { startsWith: 'cat-bakery' } } },
        ];
      } else if (query.division === 'restaurant') {
        where.categoryId = { startsWith: 'cat-rest' };
      }

      // Search keyword filter
      if (query.search && query.search.trim()) {
        const term = query.search.trim();
        const searchConditions = [
          { name: { contains: term, mode: 'insensitive' } },
          { nameTa: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { tags: { has: term.toLowerCase() } },
        ];
        if (where.OR) {
          where.AND = [{ OR: where.OR }, { OR: searchConditions }];
          delete where.OR;
        } else {
          where.OR = searchConditions;
        }
      }

      // Sorting
      let orderBy: any = [{ isBestseller: 'desc' }, { displayOrder: 'asc' }];
      if (query.sortBy === 'price_asc') {
        orderBy = [{ price: 'asc' }, { displayOrder: 'asc' }];
      } else if (query.sortBy === 'price_desc') {
        orderBy = [{ price: 'desc' }, { displayOrder: 'asc' }];
      } else if (query.sortBy === 'rating') {
        orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
      } else if (query.sortBy === 'prep_time') {
        orderBy = [{ preparationTimeMinutes: 'asc' }, { displayOrder: 'asc' }];
      }

      const rawItems = await app.prisma.menuItem.findMany({
        where,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, nameTa: true, branchId: true },
          },
          addons: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
          },
        },
      });

      // Format items with numeric prices and booleans for frontend consistency
      items = rawItems.map((item: any) => ({
        ...item,
        price: Number(item.price),
        rating: Number(item.rating ?? 4.8),
        isVeg: Boolean(item.isVegetarian),
        isAvailable: Boolean(item.isAvailable),
        addons: (item.addons || []).map((addon: any) => ({
          ...addon,
          price: Number(addon.price),
        })),
      }));
    } catch {
      // Fallback items if DB is unavailable
      items = [
        {
          id: 'rest-idly',
          categoryId: 'cat-rest-breakfast',
          name: 'Idly (2 Pcs)',
          nameTa: 'இட்லி (2 பிஸ்)',
          description: 'Soft and fluffy steamed rice cakes served with aromatic sambar and 3 freshly ground coconut chutneys.',
          descriptionTa: 'பஞ்சு போன்ற மல்லிகைப் பூ இட்லி, மணமணக்கும் சாம்பார் மற்றும் 3 வகை சட்னியுடன்.',
          price: 30,
          discountPercentage: 0,
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Idly.webp',
          isVegetarian: true,
          isVeg: true,
          isVegan: true,
          isGlutenFree: true,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 5,
          isAvailable: true,
          displayOrder: 1,
          addons: [],
        },
        {
          id: 'rest-vada',
          categoryId: 'cat-rest-breakfast',
          name: 'Vada Sambar (1 Pc)',
          nameTa: 'வடை சாம்பார் (1 பிஸ்)',
          description: 'Crispy golden medu vada soaked in hot drumstick sambar, garnished with fresh coriander.',
          descriptionTa: 'சூடான சாம்பாரில் ஊறவைத்த மொறுமொறு மெது வடை.',
          price: 40,
          discountPercentage: 0,
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Vada-Sambar.webp',
          isVegetarian: true,
          isVeg: true,
          isVegan: true,
          isGlutenFree: true,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 5,
          isAvailable: true,
          displayOrder: 2,
          addons: [],
        },
        {
          id: 'rest-pongal',
          categoryId: 'cat-rest-breakfast',
          name: 'Ven Pongal with Ghee',
          nameTa: 'வெண் பொங்கல் நெய்யுடன்',
          description: 'Traditional pepper and cumin rice-lentil porridge tempered in pure cow ghee and roasted cashews.',
          descriptionTa: 'தூய பசு நெய், மிளகு, சீரகம் மற்றும் முந்திரி தாளித்த சுவையான வெண் பொங்கல்.',
          price: 70,
          discountPercentage: 0,
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/ven-pongal.webp',
          isVegetarian: true,
          isVeg: true,
          isVegan: false,
          isGlutenFree: true,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 10,
          isAvailable: true,
          displayOrder: 3,
          addons: [],
        },
        {
          id: 'rest-ghee-dosa',
          categoryId: 'cat-rest-dosa',
          name: 'Special Ghee Roast Dosa',
          nameTa: 'ஸ்பெஷல் நெய் ரோஸ்ட் தோசை',
          description: 'Crisp golden crepe roasted in generous pure cow ghee, served with 3 chutneys & sambar.',
          descriptionTa: 'சுத்தமான பசு நெய்யில் மொறுமொறுப்பாக சுடப்பட்ட நெய் ரோஸ்ட் தோசை.',
          price: 110,
          discountPercentage: 10,
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Ghee-Dosa.webp',
          isVegetarian: true,
          isVeg: true,
          isVegan: false,
          isGlutenFree: true,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 12,
          isAvailable: true,
          displayOrder: 4,
          addons: [
            { id: 'addon-1', name: 'Extra Sambar Bowl', nameTa: 'கூடுதல் சாம்பார்', price: 20, isRequired: false, maxSelect: 2 },
            { id: 'addon-2', name: 'Extra Gunpowder (Podi)', nameTa: 'இட்லி பொடி + நெய்', price: 25, isRequired: false, maxSelect: 1 },
          ],
        },
        {
          id: 'rest-mutton-biryani',
          categoryId: 'cat-rest-lunch',
          name: 'Seeraga Samba Mutton Biryani',
          nameTa: 'சீரக சம்பா மட்டன் பிரியாணி',
          description: 'Fragrant Dum biryani cooked in pure ghee with tender country mutton, served with raitha and salna.',
          descriptionTa: 'மென்மையான ஆட்டுக்கறியுடன் சீரக சம்பா அரிசியில் தயாரான மணமணக்கும் தம் பிரியாணி.',
          price: 320,
          discountPercentage: 10,
          imageUrl: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
          isVegetarian: false,
          isVeg: false,
          isVegan: false,
          isGlutenFree: true,
          isSpicy: true,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 20,
          isAvailable: true,
          displayOrder: 7,
          addons: [],
        },
        {
          id: 'bakery-black-forest',
          categoryId: 'cat-bakery-cakes',
          name: 'Black Forest Cake (500g)',
          nameTa: 'பிளாக் ஃபாரஸ்ட் கேக் (500g)',
          description: 'Soft chocolate sponge layered with fresh whipped cream, dark chocolate shavings & red cherries.',
          descriptionTa: 'மெல்லிய சாக்லேட் ஸ்பாஞ்ச், புதிய கிரீம் மற்றும் செர்ரிகளுடன் கூடிய கேக்.',
          price: 380,
          discountPercentage: 0,
          imageUrl: 'https://www.ashokrajgroups.com/images/Bakery/Cakes/Black-Forest.webp',
          isVegetarian: true,
          isVeg: true,
          isVegan: false,
          isGlutenFree: false,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 15,
          isAvailable: true,
          displayOrder: 15,
          addons: [
            { id: 'addon-c1', name: 'Size: 1 Kg (+500g extra)', nameTa: 'அளவு: 1 கிலோ', price: 350, isRequired: false, maxSelect: 1 },
            { id: 'addon-c2', name: 'Birthday Candle Set', nameTa: 'மெழுகுவர்த்தி தொகுப்பு', price: 25, isRequired: false, maxSelect: 1 },
          ],
        },
        {
          id: 'bakery-ghee-halwa',
          categoryId: 'cat-bakery-sweets',
          name: 'Pure Ghee Wheat Halwa (250g)',
          nameTa: 'தூய நெய் கோதுமை அல்வா (250g)',
          description: 'Glossy Tirunelveli-style wheat halwa cooked in pure cow ghee and loaded with fried cashews.',
          descriptionTa: 'தூய பசு நெய்யில் தயாரிக்கப்பட்ட சுவையான திருநெல்வேலி கோதுமை அல்வா.',
          price: 160,
          discountPercentage: 0,
          imageUrl: 'https://images.pexels.com/photos/14463004/pexels-photo-14463004.jpeg?auto=compress&cs=tinysrgb&w=800',
          isVegetarian: true,
          isVeg: true,
          isVegan: false,
          isGlutenFree: false,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 5,
          isAvailable: true,
          displayOrder: 16,
          addons: [
            { id: 'addon-h1', name: 'Pack: 500g (+250g extra)', nameTa: 'அளவு: 500 கிராம்', price: 160, isRequired: false, maxSelect: 1 },
          ],
        },
        {
          id: 'bakery-pani-puri',
          categoryId: 'cat-bakery-chaat',
          name: 'Special Pani Puri (6 Pcs)',
          nameTa: 'ஸ்பெஷல் பானி பூரி (6 பிஸ்)',
          description: 'Crispy hollow puris filled with spiced potato and sprouted moong, served with tangy mint water & sweet tamarind chutney.',
          descriptionTa: 'மொறுமொறு பூரிகளில் உருளைக்கிழங்கு, கார புதினா தண்ணீர் மற்றும் இனிப்பு சட்னியுடன்.',
          price: 45,
          discountPercentage: 0,
          imageUrl: 'https://images.pexels.com/photos/14883752/pexels-photo-14883752.jpeg?auto=compress&cs=tinysrgb&w=800',
          isVegetarian: true,
          isVeg: true,
          isVegan: true,
          isGlutenFree: false,
          isSpicy: true,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 5,
          isAvailable: true,
          displayOrder: 17,
          addons: [
            { id: 'addon-p1', name: 'Extra Crisp Puris (6 Pcs)', nameTa: 'கூடுதல் பூரி (6 பிஸ்)', price: 25, isRequired: false, maxSelect: 2 },
          ],
        },
      ];
    }

    try {
      if (app.redis) {
        await app.redis.set(cacheKey, JSON.stringify(items), 'EX', MENU_CACHE_TTL);
      }
    } catch {
      // Redis optional fallback
    }

    return reply.send({
      success: true,
      data: items,
      cached: false,
    });
  });

  // ── GET /items/:id — Food Detail View ────────────────────────────────────
  app.get('/items/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const cacheKey = `menu:item:${id}`;

    try {
      if (app.redis) {
        const cached = await app.redis.get(cacheKey);
        if (cached) {
          return reply.send({
            success: true,
            data: JSON.parse(cached),
            cached: true,
          });
        }
      }
    } catch {
      // Redis optional fallback
    }

    let item: any = null;
    try {
      const raw = await app.prisma.menuItem.findUnique({
        where: { id },
        include: {
          category: true,
          addons: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
          },
          reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });

      if (raw) {
        item = {
          ...raw,
          price: Number(raw.price),
          rating: Number(raw.rating ?? 4.8),
          isVeg: Boolean(raw.isVegetarian),
          isAvailable: Boolean(raw.isAvailable),
          addons: (raw.addons || []).map((a: any) => ({
            ...a,
            price: Number(a.price),
          })),
        };
      }
    } catch {
      // DB error handling
    }

    if (!item) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Menu item not found' },
      });
    }

    try {
      if (app.redis) {
        await app.redis.set(cacheKey, JSON.stringify(item), 'EX', MENU_CACHE_TTL);
      }
    } catch {
      // Redis optional fallback
    }

    return reply.send({
      success: true,
      data: item,
      cached: false,
    });
  });
};
