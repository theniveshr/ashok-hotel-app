import type { FastifyPluginAsync } from 'fastify';

export const customerMenuRoutes: FastifyPluginAsync = async (app) => {
  const MENU_CACHE_TTL = 300; // 5 minutes cache

  // ── GET /categories — List all active categories ──────────────────────────
  app.get('/categories', async (_req, reply) => {
    const cacheKey = 'menu:categories';

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
      categories = await app.prisma.menuCategory.findMany({
        where: { isActive: true, deletedAt: null },
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { menuItems: true },
          },
        },
      });
    } catch {
      // Return rich seed categories if DB is offline
      categories = [
        {
          id: 'cat-rest-breakfast',
          name: 'Breakfast & Tiffin',
          nameTa: 'காலை உணவு & டிபன்',
          description: 'Hot idlis, medu vada, ven pongal, poori & parotta',
          descriptionTa: 'சுடச்சுட இட்லி, மெது வடை, வெண் பொங்கல், பூரி & புரோட்டா',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Idly.webp',
          displayOrder: 1,
          isActive: true,
          _count: { menuItems: 7 },
        },
        {
          id: 'cat-rest-dosa',
          name: 'Dosa & Uthappam Varieties',
          nameTa: 'தோசை & உத்தப்பம் வகைகள்',
          description: 'Ghee roast, podi, onion, rava, special & uthappam',
          descriptionTa: 'நெய் ரோஸ்ட், பொடி, வெங்காயம், ரவா & உத்தப்பம்',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Ghee-Dosa.webp',
          displayOrder: 2,
          isActive: true,
          _count: { menuItems: 6 },
        },
        {
          id: 'cat-rest-egg',
          name: 'Egg Specialties',
          nameTa: 'முட்டை வகைகள்',
          description: 'Egg kalaki, egg dosa, omelette, podimass & half-boil',
          descriptionTa: 'முட்டை கலக்கி, முட்டை தோசை, ஆம்லெட், பொடிமாஸ்',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Egg-kalaki.jpg',
          displayOrder: 3,
          isActive: true,
          _count: { menuItems: 6 },
        },
        {
          id: 'cat-rest-lunch',
          name: 'Biryani & Chettinad Meals',
          nameTa: 'பிரியாணி & செட்டிநாடு சாப்பாடு',
          description: 'Seeraga samba mutton & chicken biryani, non-veg meals',
          descriptionTa: 'சீரக சம்பா மட்டன், சிக்கன் பிரியாணி & அசைவ சாப்பாடு',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/hero-image.JPG',
          displayOrder: 4,
          isActive: true,
          _count: { menuItems: 3 },
        },
        {
          id: 'cat-rest-dinner',
          name: 'Dinner & Parotta Specials',
          nameTa: 'இரவு உணவு & பன் புரோட்டா',
          description: 'Madurai bun parotta, kothu parotta, chicken fry & salna',
          descriptionTa: 'மதுரை பன் புரோட்டா, கொத்து புரோட்டா & சிக்கன் வறுவல்',
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Parotto.webp',
          displayOrder: 5,
          isActive: true,
          _count: { menuItems: 2 },
        },
      ];
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
      search?: string;
      isVeg?: string;
      isSpicy?: string;
      isBestseller?: string;
      isFeatured?: string;
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
      const where: any = { isAvailable: true, deletedAt: null };
      if (query.categoryId) where.categoryId = query.categoryId;
      if (query.isVeg === 'true') where.isVegetarian = true;
      if (query.isSpicy === 'true') where.isSpicy = true;
      if (query.isBestseller === 'true') where.isBestseller = true;
      if (query.isFeatured === 'true') where.isFeatured = true;
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { nameTa: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { tags: { has: query.search.toLowerCase() } },
        ];
      }

      items = await app.prisma.menuItem.findMany({
        where,
        orderBy: [{ isBestseller: 'desc' }, { displayOrder: 'asc' }],
        include: {
          category: {
            select: { id: true, name: true, nameTa: true },
          },
          addons: {
            where: { isActive: true },
          },
        },
      });
    } catch {
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
          isVegan: true,
          isGlutenFree: true,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 5,
          isAvailable: true,
          displayOrder: 1,
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
          isVegan: true,
          isGlutenFree: true,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 5,
          isAvailable: true,
          displayOrder: 2,
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
          isVegan: false,
          isGlutenFree: true,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 10,
          isAvailable: true,
          displayOrder: 3,
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
          isVegan: false,
          isGlutenFree: true,
          isSpicy: false,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 12,
          isAvailable: true,
          displayOrder: 4,
        },
        {
          id: 'rest-podi-dosa',
          categoryId: 'cat-rest-dosa',
          name: 'Podi Dosa',
          nameTa: 'பொடி தோசை',
          description: 'Crispy dosa dusted with spicy homemade Chettinad idli podi and gingelly sesame oil.',
          descriptionTa: 'காரசாரமான இட்லி பொடி மற்றும் நல்லெண்ணெய் தூவிய பொடி தோசை.',
          price: 80,
          discountPercentage: 0,
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Podi-Dosa.webp',
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isSpicy: true,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 12,
          isAvailable: true,
          displayOrder: 5,
        },
        {
          id: 'rest-egg-kalaki',
          categoryId: 'cat-rest-egg',
          name: 'Chettinad Egg Kalaki',
          nameTa: 'செட்டிநாடு முட்டை கலக்கி',
          description: 'Famous Madurai street-style semi-cooked egg pocket prepared with rich chicken gravy.',
          descriptionTa: 'சிக்கன் குழம்புடன் சமைத்த மென்மையான செட்டிநாடு முட்டை கலக்கி.',
          price: 35,
          discountPercentage: 0,
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Egg-kalaki.jpg',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          isSpicy: true,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 5,
          isAvailable: true,
          displayOrder: 6,
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
          isVegan: false,
          isGlutenFree: true,
          isSpicy: true,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 20,
          isAvailable: true,
          displayOrder: 7,
        },
        {
          id: 'rest-chicken-biryani',
          categoryId: 'cat-rest-lunch',
          name: 'Chettinad Chicken Biryani',
          nameTa: 'செட்டிநாடு சிக்கன் பிரியாணி',
          description: 'Traditional wood-fired chicken biryani cooked with secret spices, served with egg, raitha & gravy.',
          descriptionTa: 'காரசாரமான செட்டிநாடு சிக்கன் பிரியாணி முட்டை, தயிர் பச்சடி மற்றும் சால்னாவுடன்.',
          price: 220,
          discountPercentage: 0,
          imageUrl: 'https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=800',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          isSpicy: true,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 15,
          isAvailable: true,
          displayOrder: 8,
        },
        {
          id: 'rest-bun-parotta',
          categoryId: 'cat-rest-dinner',
          name: 'Madurai Bun Parotta (2 Pcs)',
          nameTa: 'மதுரை பன் புரோட்டா (2 பிஸ்)',
          description: 'Puffy, golden-brown crusty bun parottas served with rich non-veg chicken mutton salna.',
          descriptionTa: 'மென்மையான மதுரை பன் புரோட்டா சூடான அசைவ சால்னாவுடன்.',
          price: 90,
          discountPercentage: 0,
          imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Parotto.webp',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isSpicy: true,
          isBestseller: true,
          isFeatured: true,
          preparationTimeMinutes: 12,
          isAvailable: true,
          displayOrder: 9,
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
      item = await app.prisma.menuItem.findUnique({
        where: { id },
        include: {
          category: true,
          addons: { where: { isActive: true } },
          reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });
    } catch {
      // Fallback detail mock
      item = {
        id,
        categoryId: 'cat-1',
        name: 'Special Ghee Roast Dosa',
        nameTa: 'ஸ்பெஷல் நெய் ரோஸ்ட் தோசை',
        description: 'Crispy golden dosa made with pure cow ghee, served with 3 coconut chutneys and hot sambar.',
        descriptionTa: 'சுத்தமான பசு நெய்யில் சுடப்பட்ட மொறுமொறு தோசை, 3 வகை சட்னி மற்றும் சாம்பாருடன்.',
        price: 110,
        discountPercentage: 10,
        imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Ghee-Dosa.webp',
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        isSpicy: false,
        isBestseller: true,
        isFeatured: true,
        preparationTimeMinutes: 15,
        isAvailable: true,
        displayOrder: 1,
        calories: 380,
        rating: 4.9,
        reviewCount: 128,
        ingredients: ['Rice Flour', 'Urad Dal', 'Pure Cow Ghee', 'Fenugreek', 'Curry Leaves'],
        allergens: ['Dairy'],
        tags: ['dosa', 'ghee', 'breakfast', 'south indian'],
        addons: [
          { id: 'addon-1', name: 'Extra Sambar Bowl', nameTa: 'கூடுதல் சாம்பார்', price: 20, isRequired: false, maxSelect: 2 },
          { id: 'addon-2', name: 'Extra Gunpowder (Podi)', nameTa: 'இட்லி பொடி + நெய்', price: 25, isRequired: false, maxSelect: 1 },
          { id: 'addon-3', name: 'Extra Butter Chunk', nameTa: 'கூடுதல் வெண்ணெய் துண்டு', price: 15, isRequired: false, maxSelect: 1 },
        ],
        reviews: [
          { id: 'rev-1', userName: 'Karthik Subramanian', rating: 5, comment: 'Crispiest ghee roast in Kalaiyarkoil! Sambar flavor is outstanding.', commentTa: 'காளையார்கோவிலில் மிகச்சிறந்த நெய் ரோஸ்ட்!', createdAt: new Date().toISOString() },
          { id: 'rev-2', userName: 'Priya Rajendran', rating: 5, comment: 'Served boiling hot with authentic coconut chutney. Loved it!', commentTa: 'அற்புதமான தேங்காய் சட்னியுடன் பரிமாறப்பட்டது.', createdAt: new Date().toISOString() },
        ],
      };
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
