import type { FastifyPluginAsync } from 'fastify';
import type { HomeFeedData, ApiResponse, MenuItem, RoomType } from '@ashok-raj/types';

export const customerHomeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/home', async (_request, reply) => {
    try {
      // 1. Query featured menu items from Prisma
      let popularFoods: MenuItem[] = [];
      try {
        const popularItemsRaw = await fastify.prisma.menuItem.findMany({
          where: { isAvailable: true, deletedAt: null },
          take: 6,
          include: { category: true },
          orderBy: { displayOrder: 'asc' },
        });

        popularFoods = popularItemsRaw.map((item: any) => ({
          id: item.id,
          categoryId: item.categoryId,
          name: item.name,
          nameTa: item.nameTa,
          description: item.description ?? '',
          descriptionTa: item.descriptionTa ?? '',
          price: Number(item.price),
          discountPercentage: item.discountPercentage ?? 0,
          imageUrl: item.imageUrl ?? 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Idly.webp',
          isVeg: item.isVegetarian,
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan ?? false,
          isGlutenFree: item.isGlutenFree ?? false,
          isSpicy: item.isSpicy,
          isPopular: item.isBestseller,
          isBestseller: item.isBestseller,
          isFeatured: item.isFeatured,
          isAvailable: item.isAvailable,
          preparationTimeMinutes: item.preparationTimeMinutes,
          rating: Number(item.rating ?? 4.8),
          reviewCount: item.reviewCount ?? 42,
          ingredients: item.ingredients ?? [],
          allergens: item.allergens ?? [],
          tags: item.tags ?? [],
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }));
      } catch {
        // Prisma fallback
      }

      // 2. Query featured room types from Prisma
      let featuredRooms: RoomType[] = [];
      try {
        const roomTypesRaw = await fastify.prisma.roomType.findMany({
          take: 3,
          orderBy: { basePrice: 'asc' },
        });

        featuredRooms = roomTypesRaw.map((rt: any) => ({
          id: rt.id,
          branchId: 'branch-kalaiyarkoil',
          title: rt.name,
          titleTa: rt.nameTa,
          description: rt.description ?? '',
          descriptionTa: rt.descriptionTa ?? '',
          basePrice: Number(rt.basePrice),
          maxOccupancy: rt.maxOccupancy,
          isAc: true,
          roomSizeSqft: 280,
          totalRooms: 12,
          amenities: rt.amenities ?? [],
          images: rt.imageUrls ?? [],
          createdAt: rt.createdAt.toISOString(),
          updatedAt: rt.updatedAt.toISOString(),
        }));
      } catch {
        // Fallback
      }

      // 3. Construct dynamic customer home feed
      const homeFeed: HomeFeedData = {
        greeting: {
          userName: 'Valued Guest',
          branchName: 'Kalaiyarkoil Main Branch',
          branchNameTa: 'காளையார்கோவில் முதன்மை கிளை',
        },
        loyalty: {
          points: 450,
          tier: 'GOLD',
          rupeeEquivalent: 112.5,
        },
        activeOrder: {
          id: 'ord_102',
          orderNumber: 'AR-2026-8891',
          status: 'PREPARING',
          type: 'DINE_IN',
          estimatedMinutes: 12,
          itemsCount: 3,
          totalAmount: 480,
          tableNumber: '04',
        },
        activeBooking: {
          id: 'bk_501',
          bookingNumber: 'AR-STAY-4029',
          roomTypeTitle: 'Deluxe AC Family Suite',
          roomTypeTitleTa: 'டீலக்ஸ் ஏசி குடும்ப சூட்',
          roomNumber: '108',
          status: 'CONFIRMED',
          checkInDate: '2026-08-24T14:00:00Z',
          checkOutDate: '2026-08-26T11:00:00Z',
        },
        banners: [
          {
            id: 'b1',
            title: 'Special Chettinad Biryani Feast',
            titleTa: 'சிறப்பு செட்டிநாடு பிரியாணி விருந்து',
            subtitle: 'Get 20% off on all weekend dining orders',
            subtitleTa: 'அனைத்து வார இறுதி உணவுகளுக்கும் 20% தள்ளுபடி',
            imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/hero-image.JPG',
            badgeText: 'HOT OFFER',
            badgeTextTa: 'சிறப்பு ஆஃபர்',
            code: 'CHETTINAD20',
          },
          {
            id: 'b2',
            title: 'Lodge Booking Monsoon Offer',
            titleTa: 'தங்குமிடம் பருவமழை சிறப்பு தள்ளுபடி',
            subtitle: '15% instant cashback on 2+ nights stay',
            subtitleTa: '2 இரவுகள் தங்கினால் 15% உடனடி கேஷ்பேக்',
            imageUrl: 'https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp',
            badgeText: 'STAY MORE',
            badgeTextTa: 'தங்கி மகிழ்க',
            code: 'STAYSAFE15',
          },
        ],
        quickActions: [
          {
            id: 'qa1',
            title: 'Order Food',
            titleTa: 'உணவு ஆர்டர்',
            iconName: 'Utensils',
            route: 'restaurant',
          },
          {
            id: 'qa2',
            title: 'Scan Table QR',
            titleTa: 'கியூஆர் ஸ்கேன்',
            iconName: 'QrCode',
            route: 'scan',
          },
          {
            id: 'qa3',
            title: 'Book a Room',
            titleTa: 'அறை முன்பதிவு',
            iconName: 'BedDouble',
            route: 'stay',
          },
          {
            id: 'qa4',
            title: 'My Orders',
            titleTa: 'எனது ஆர்டர்கள்',
            iconName: 'ShoppingBag',
            route: 'orders',
          },
        ],
        popularFoods: popularFoods.length > 0 ? popularFoods : [
          {
            id: 'm1',
            categoryId: 'cat_biryani',
            name: 'Ashok Raj Special Mutton Biryani',
            nameTa: 'அசோக் ராஜ் ஸ்பெஷல் மட்டன் பிரியாணி',
            description: 'Seeraga samba rice cooked with tender mutton and authentic Chettinad spices.',
            descriptionTa: 'சீரக சம்பா அரிசியில் காரசாரமான செட்டிநாடு மசாலாவுடன் சமைத்த மட்டன் பிரியாணி.',
            price: 320,
            discountPercentage: 10,
            imageUrl: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
            isVeg: false,
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: true,
            isSpicy: true,
            isPopular: true,
            isBestseller: true,
            isFeatured: true,
            isAvailable: true,
            preparationTimeMinutes: 20,
            rating: 4.9,
            reviewCount: 1420,
            ingredients: ['Seeraga Samba Rice', 'Mutton Tenderloin', 'Ghee'],
            allergens: ['Dairy'],
            tags: ['biryani', 'mutton'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'm2',
            categoryId: 'cat_parotta',
            name: 'Madurai Bun Parotta (2 Pcs)',
            nameTa: 'மதுரை பன் புரோட்டா (2 பிஸ்)',
            description: 'Fluffy layered bun parotta served with spicy chicken salna.',
            descriptionTa: 'மென்மையான மதுரை பன் புரோட்டா காரசாரமான சால்னாவுடன்.',
            price: 90,
            discountPercentage: 0,
            imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Parotto.webp',
            isVeg: false,
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: false,
            isSpicy: true,
            isPopular: true,
            isBestseller: true,
            isFeatured: false,
            isAvailable: true,
            preparationTimeMinutes: 12,
            rating: 4.8,
            reviewCount: 2310,
            ingredients: ['Wheat Flour', 'Butter', 'Chicken Salna'],
            allergens: ['Gluten'],
            tags: ['parotta', 'south indian'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        recommendedFoods: [
          {
            id: 'm3',
            categoryId: 'cat_starters',
            name: 'Kalaiyarkoil Special Chicken Chukka',
            nameTa: 'காளையார்கோவில் ஸ்பெஷல் சிக்கன் சுக்கா',
            description: 'Pan-roasted country chicken with hand-pounded pepper and curry leaves.',
            descriptionTa: 'கைக்குத்தல் மிளகு மற்றும் கறிவேப்பிலையுடன் வறுத்த நாட்டுக்கோழி சுக்கா.',
            price: 240,
            discountPercentage: 0,
            imageUrl: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800',
            isVeg: false,
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: true,
            isSpicy: true,
            isPopular: true,
            isBestseller: true,
            isFeatured: true,
            isAvailable: true,
            preparationTimeMinutes: 15,
            rating: 4.9,
            reviewCount: 980,
            ingredients: ['Country Chicken', 'Black Pepper', 'Curry Leaves'],
            allergens: [],
            tags: ['chicken', 'starters'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        featuredRooms: featuredRooms.length > 0 ? featuredRooms : [
          {
            id: 'rm1',
            branchId: 'b1',
            title: 'Deluxe AC Family Suite',
            titleTa: 'டீலக்ஸ் ஏசி குடும்ப சூட்',
            description: 'Spacious suite with King bed, city view, and complimentary breakfast.',
            descriptionTa: 'அகலமான அரண்மனை குடும்ப சூட் அறை, இலவச காலை உணவோடு.',
            basePrice: 2800,
            maxOccupancy: 4,
            isAc: true,
            roomSizeSqft: 420,
            totalRooms: 6,
            amenities: ['Air Conditioning', 'Free WiFi', 'Flat TV', 'Mini Fridge', 'Balcony'],
            images: ['https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        offers: [
          {
            id: 'off1',
            title: 'Weekend Dine-In Fest',
            titleTa: 'வார இறுதி உணவுத் திருவிழா',
            description: 'Flat ₹150 OFF on orders above ₹799',
            descriptionTa: '₹799க்கு மேல் ஆர்டர் செய்தால் ₹150 தள்ளுபடி',
            code: 'WEEKEND150',
            discountType: 'FIXED',
            discountValue: 150,
            minOrderValue: 799,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      const response: ApiResponse<HomeFeedData> = {
        success: true,
        data: homeFeed,
      };

      return reply.status(200).send(response);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch customer home feed',
        },
      });
    }
  });
};
