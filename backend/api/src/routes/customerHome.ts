import type { FastifyPluginAsync } from 'fastify';
import type { HomeFeedData, ApiResponse, MenuItem, RoomType } from '@ashok-raj/types';

export const customerHomeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/home', async (request, reply) => {
    try {
      // 1. Resolve user from auth token or header
      let userId: string | null = null;
      let userName = 'Guest';

      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const decoded: any = await (request as any).jwtVerify?.();
          if (decoded && (decoded.id || decoded.userId)) {
            userId = decoded.id || decoded.userId;
          }
        } catch {
          // Unauthenticated guest
        }
      }
      if (!userId && request.headers['x-user-id']) {
        userId = request.headers['x-user-id'] as string;
      }

      // 2. Fetch User & Loyalty if authenticated
      let loyaltyData: {
        points: number;
        tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
        rupeeEquivalent: number;
      } = {
        points: 0,
        tier: 'BRONZE',
        rupeeEquivalent: 0,
      };

      let activeOrderData: any = undefined;
      let activeBookingData: any = undefined;

      if (userId) {
        try {
          const dbUser = await fastify.prisma.user.findUnique({
            where: { id: userId },
            include: { loyaltyAccount: true },
          });
          if (dbUser) {
            userName = dbUser.name || 'Valued Guest';
            if (dbUser.loyaltyAccount) {
              loyaltyData = {
                points: dbUser.loyaltyAccount.points,
                tier: (dbUser.loyaltyAccount.tier as any) || 'BRONZE',
                rupeeEquivalent: dbUser.loyaltyAccount.points * 0.25,
              };
            }
          }
        } catch {}

        // Check active order
        try {
          const activeOrder: any = await fastify.prisma.order.findFirst({
            where: {
              userId,
              status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] as any },
            },
            orderBy: { createdAt: 'desc' },
            include: { items: true, table: true },
          });

          if (activeOrder) {
            activeOrderData = {
              id: activeOrder.id,
              orderNumber: activeOrder.orderNumber,
              status: activeOrder.status,
              type: activeOrder.type,
              estimatedMinutes: 20,
              itemsCount: activeOrder.items ? activeOrder.items.length : 0,
              totalAmount: Number(activeOrder.total || 0),
              tableNumber: activeOrder.table?.tableNumber ?? undefined,
            };
          }
        } catch {}

        // Check active booking
        try {
          const activeBooking = await fastify.prisma.booking.findFirst({
            where: {
              userId,
              status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            },
            orderBy: { createdAt: 'desc' },
            include: { room: { include: { type: true } } },
          });

          if (activeBooking) {
            activeBookingData = {
              id: activeBooking.id,
              bookingNumber: activeBooking.bookingNumber,
              roomTypeTitle: activeBooking.room?.type?.name ?? 'Room Stay',
              roomTypeTitleTa: activeBooking.room?.type?.nameTa ?? 'அறை',
              roomNumber: activeBooking.room?.roomNumber ?? '—',
              status: activeBooking.status,
              checkInDate: activeBooking.checkIn.toISOString(),
              checkOutDate: activeBooking.checkOut.toISOString(),
            };
          }
        } catch {}
      }

      // 3. Query featured menu items from Prisma
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
          reviewCount: item.reviewCount ?? 0,
          ingredients: item.ingredients ?? [],
          allergens: item.allergens ?? [],
          tags: item.tags ?? [],
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }));
      } catch {
        // Fallback to empty if DB query fails
      }

      // 4. Query room types from Prisma
      let featuredRooms: RoomType[] = [];
      try {
        const roomTypesRaw = await fastify.prisma.roomType.findMany({
          take: 3,
          orderBy: { basePrice: 'asc' },
        });

        featuredRooms = roomTypesRaw.map((rt: any) => ({
          id: rt.id,
          branchId: '00000000-0000-0000-0000-000000000001',
          title: rt.name,
          titleTa: rt.nameTa,
          description: rt.description ?? '',
          descriptionTa: rt.descriptionTa ?? '',
          basePrice: Number(rt.basePrice),
          maxOccupancy: rt.maxOccupancy,
          isAc: true,
          roomSizeSqft: 280,
          totalRooms: 10,
          amenities: rt.amenities ?? [],
          images: rt.imageUrls ?? [],
          createdAt: rt.createdAt.toISOString(),
          updatedAt: rt.updatedAt.toISOString(),
        }));
      } catch {
        // Fallback to empty if DB query fails
      }

      // 5. Dynamic customer home feed
      const homeFeed: HomeFeedData = {
        greeting: {
          userName,
          branchName: 'Kalaiyarkoil Main Branch',
          branchNameTa: 'காளையார்கோவில் முதன்மை கிளை',
        },
        loyalty: loyaltyData,
        activeOrder: activeOrderData,
        activeBooking: activeBookingData,
        banners: [
          {
            id: 'b1',
            title: 'Special Chettinad Biryani Feast',
            titleTa: 'சிறப்பு செட்டிநாடு பிரியாணி விருந்து',
            subtitle: 'Authentic flavors and fresh spices daily',
            subtitleTa: 'அசல் சுவை மற்றும் பாரம்பரிய மசாலா மணத்துடன்',
            imageUrl: 'https://www.ashokrajgroups.com/images/Restaurant/hero-image.JPG',
            badgeText: 'POPULAR',
            badgeTextTa: 'பிரபலம்',
            code: 'CHETTINAD',
          },
          {
            id: 'b2',
            title: 'Lodge Comfort Stay',
            titleTa: 'லாட்ஜ் வசதியான தங்குமிடம்',
            subtitle: 'AC Rooms with 24/7 room service & parking',
            subtitleTa: 'குளிரூட்டி அறைகள், 24/7 அறை சேவை மற்றும் பார்க்கிங்',
            imageUrl: 'https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp',
            badgeText: 'LODGE',
            badgeTextTa: 'லாட்ஜ்',
            code: 'STAYSAFE',
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
        popularFoods,
        recommendedFoods: [],
        featuredRooms,
        offers: [],
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
