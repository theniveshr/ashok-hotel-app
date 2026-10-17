import type { FastifyPluginAsync } from 'fastify';
import type { HomeFeedData, ApiResponse, MenuItem, RoomType } from '@ashok-raj/types';

export const customerHomeRoutes: FastifyPluginAsync = async (fastify) => {
  // ── GET /branches — List all active branches ──────────────────────────────
  fastify.get('/branches', async (_request, reply) => {
    try {
      const branches = await fastify.prisma.branch.findMany({
        where: { isActive: true },
        orderBy: [{ isMainBranch: 'desc' }, { name: 'asc' }],
      });
      return reply.send({ success: true, data: branches });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch branches',
        },
      });
    }
  });

  // ── POST /delivery/check-coverage — Server-Side Delivery Coverage Check ────
  const checkDeliveryCoverageHandler = async (request: any, reply: any) => {
    try {
      const body = (request.body as any) || {};
      let lat = body.lat != null ? Number(body.lat) : null;
      let lng = body.lng != null ? Number(body.lng) : null;
      const addressId = body.addressId ? String(body.addressId) : null;
      const pincode = body.pincode ? String(body.pincode).trim() : null;
      const address = body.address ? String(body.address) : '';

      // If addressId is provided, retrieve verified coordinates from Supabase
      if (addressId) {
        try {
          const savedAddr = await fastify.prisma.address.findUnique({
            where: { id: addressId },
          });
          if (savedAddr) {
            if (savedAddr.lat != null) lat = Number(savedAddr.lat);
            if (savedAddr.lng != null) lng = Number(savedAddr.lng);
            if (!address && savedAddr.line1) address = `${savedAddr.line1}, ${savedAddr.city || ''}`;
            if (!pincode && savedAddr.pincode) pincode = savedAddr.pincode;
          }
        } catch {
          // Fallback to request body coordinates
        }
      }

      // If customer coordinates are missing, attempt geocoding the customer destination address
      if ((lat == null || lng == null || isNaN(lat) || isNaN(lng)) && (address || pincode)) {
        const query = [address, pincode, 'Tamil Nadu'].filter(Boolean).join(', ');
        const apiKey = process.env['GOOGLE_MAPS_API_KEY'] || process.env['GOOGLE_ROUTES_API_KEY'];

        let geocoded: { lat: number; lng: number } | null = null;

        // 1. Google Geocoding API if key is present
        if (apiKey) {
          try {
            const gRes = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
            );
            if (gRes.ok) {
              const gData = await gRes.json();
              if (gData.results?.[0]?.geometry?.location) {
                geocoded = {
                  lat: gData.results[0].geometry.location.lat,
                  lng: gData.results[0].geometry.location.lng,
                };
              }
            }
          } catch {}
        }

        // 2. OpenStreetMap Nominatim geocoding
        if (!geocoded) {
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`,
              {
                headers: {
                  'User-Agent': 'AshokRajGroupsHotelApp/1.0',
                  'Accept-Language': 'en',
                },
              }
            );
            if (nomRes.ok) {
              const nomData = await nomRes.json();
              if (nomData?.[0]?.lat && nomData?.[0]?.lon) {
                geocoded = {
                  lat: parseFloat(nomData[0].lat),
                  lng: parseFloat(nomData[0].lon),
                };
              }
            }
          } catch {}
        }

        // 3. Known Localities fallback based on text / pincode
        if (!geocoded) {
          const lower = query.toLowerCase();
          if (lower.includes('kalaiyarkoil') || lower.includes('kalayarkoil') || pincode === '630551') {
            geocoded = { lat: 9.8491, lng: 78.6366 };
          } else if (lower.includes('sivagangai') || lower.includes('sivaganga') || pincode === '630561') {
            geocoded = { lat: 9.8433, lng: 78.4809 };
          } else if (lower.includes('ilayangudi') || pincode === '630702') {
            geocoded = { lat: 9.6385, lng: 78.6368 };
          } else if (lower.includes('madurai') || pincode?.startsWith('625')) {
            geocoded = { lat: 9.9252, lng: 78.1198 };
          }
        }

        if (geocoded) {
          lat = geocoded.lat;
          lng = geocoded.lng;

          // If addressId exists, persist geocoded coordinates back to Supabase
          if (addressId) {
            try {
              await fastify.prisma.address.update({
                where: { id: addressId },
                data: { lat, lng },
              });
            } catch {}
          }
        }
      }

      // Query active branches with their configured delivery zones from database
      const branches = await fastify.prisma.branch.findMany({
        where: { isActive: true },
        include: {
          deliveryZones: {
            where: { isActive: true },
            orderBy: { radiusKm: 'asc' },
          },
        },
      });

      // Default fallback hotel coordinates: Ashok Raj Lodge & Restaurant A/C (verified Google Maps)
      const HOTEL_COORDINATES = { lat: 9.8465627, lng: 78.6356551 };
      const HOTEL_MAPS_URL =
        'https://www.google.com/maps/place/Ashok+Raj+Lodge+%26+Restaurant+A%2FC/@9.8465627,78.6356551,17z';

      if (!branches || branches.length === 0) {
        return reply.send({
          success: true,
          data: {
            status: 'UNVERIFIABLE',
            statusTitle: 'Unable to verify delivery availability',
            statusTitleTa: 'டெலிவரி கிடைப்பதை உறுதிப்படுத்த முடியவில்லை',
            isDeliverable: false,
            message: 'No delivery branches are currently active. Please try again later.',
            messageTa: 'தற்போது எந்த கிளையும் பயன்பாட்டில் இல்லை.',
            nearestBranch: null,
            eligibleBranches: [],
            distanceKm: null,
            distanceType: null,
            distanceLabel: null,
            distanceLabelTa: null,
            estimatedMinutes: null,
            deliveryFee: null,
          },
        });
      }

      // Check if coordinates are valid
      const hasValidCoordinates =
        lat != null &&
        lng != null &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

      // Haversine straight-line distance calculation in km
      const calculateHaversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's mean radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
      };

      // Road distance calculation via Google Routes API when API key is configured
      const computeGoogleRoadDistance = async (
        origLat: number,
        origLng: number,
        destLat: number,
        destLng: number
      ): Promise<{ distanceKm: number; durationMinutes: number } | null> => {
        const apiKey = process.env['GOOGLE_ROUTES_API_KEY'] || process.env['GOOGLE_MAPS_API_KEY'];
        if (!apiKey) return null;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
            },
            body: JSON.stringify({
              origin: { location: { latLng: { latitude: origLat, longitude: origLng } } },
              destination: { location: { latLng: { latitude: destLat, longitude: destLng } } },
              travelMode: 'DRIVE',
              routingPreference: 'TRAFFIC_UNAWARE',
            }),
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const route = data.routes?.[0];
            if (route?.distanceMeters) {
              const distanceKm = Math.round((route.distanceMeters / 1000) * 10) / 10;
              const durationSeconds = parseInt(route.duration?.replace('s', '') || '0', 10);
              const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
              return { distanceKm, durationMinutes };
            }
          }
        } catch {
          // Google Routes API unreachable or timed out
        }
        return null;
      };

      if (hasValidCoordinates) {
        let nearestBranch: any = null;
        let minDistance = Infinity;
        let distanceType: 'road' | 'straight_line' = 'straight_line';
        let matchedZone: any = null;
        let roadDurationMinutes: number | null = null;
        const eligibleBranches: any[] = [];

        for (const b of branches) {
          // Always use verified Google Maps coordinates for Ashok Raj Lodge & Restaurant A/C
          const bLat =
            b.isMainBranch || b.name.includes('Kalaiyarkoil') || b.id === '00000000-0000-0000-0000-000000000001'
              ? HOTEL_COORDINATES.lat
              : b.lat != null
              ? Number(b.lat)
              : HOTEL_COORDINATES.lat;
          const bLng =
            b.isMainBranch || b.name.includes('Kalaiyarkoil') || b.id === '00000000-0000-0000-0000-000000000001'
              ? HOTEL_COORDINATES.lng
              : b.lng != null
              ? Number(b.lng)
              : HOTEL_COORDINATES.lng;

          // Attempt road distance calculation via Google Routes if configured
          let distance = calculateHaversineKm(bLat, bLng, lat!, lng!);
          let branchDistanceType: 'road' | 'straight_line' = 'straight_line';

          const roadResult = await computeGoogleRoadDistance(bLat, bLng, lat!, lng!);
          if (roadResult) {
            distance = roadResult.distanceKm;
            branchDistanceType = 'road';
            roadDurationMinutes = roadResult.durationMinutes;
          }

          // Active zones for this branch from DB (or default configured zones)
          const zones =
            b.deliveryZones && b.deliveryZones.length > 0
              ? b.deliveryZones
              : [
                  {
                    id: 'zone-town',
                    name: 'Kalaiyarkoil Town Core',
                    nameTa: 'காளையார்கோவில் நகர் மையம்',
                    radiusKm: 5.0,
                    baseFee: 25,
                    freeDeliveryThreshold: 250,
                    minOrderAmount: 100,
                    estimatedDeliveryMinutes: 25,
                  },
                  {
                    id: 'zone-highway',
                    name: 'Sivagangai Highway & Murthi Nagar',
                    nameTa: 'சிவகங்கை நெடுஞ்சாலை & மூர்த்தி நகர்',
                    radiusKm: 15.0,
                    baseFee: 40,
                    freeDeliveryThreshold: 400,
                    minOrderAmount: 150,
                    estimatedDeliveryMinutes: 35,
                  },
                  {
                    id: 'zone-outer',
                    name: 'Outer Villages & Surrounding Areas',
                    nameTa: 'வெளிப்புற கிராமங்கள் & சுற்றுப்புறங்கள்',
                    radiusKm: 25.0,
                    baseFee: 60,
                    freeDeliveryThreshold: 600,
                    minOrderAmount: 250,
                    estimatedDeliveryMinutes: 45,
                  },
                ];

          const maxBranchRadius = Math.max(...zones.map((z: any) => Number(z.radiusKm)), 25.0);
          const foundZone = zones.find((z: any) => Number(z.radiusKm) >= distance);

          if (distance < minDistance) {
            minDistance = distance;
            distanceType = branchDistanceType;
            matchedZone = foundZone || null;
            nearestBranch = {
              id: b.id,
              name: b.name,
              nameTa: b.nameTa,
              address: b.address,
              city: b.city,
              coordinates: { lat: bLat, lng: bLng },
              mapsUrl: HOTEL_MAPS_URL,
              distanceKm: distance,
              maxDeliveryRadiusKm: maxBranchRadius,
            };
          }

          if (distance <= maxBranchRadius) {
            eligibleBranches.push({
              id: b.id,
              name: b.name,
              distanceKm: distance,
              zoneName: foundZone?.name || 'Standard Delivery Zone',
            });
          }
        }

        const maxCoverageRadius = nearestBranch?.maxDeliveryRadiusKm || 25.0;
        const isDeliverable = minDistance <= maxCoverageRadius;

        const distanceLabel =
          distanceType === 'road'
            ? `${minDistance} km (Road distance)`
            : `${minDistance} km (Straight-line distance)`;
        const distanceLabelTa =
          distanceType === 'road'
            ? `${minDistance} கி.மீ (சாலை தூரம்)`
            : `${minDistance} கி.மீ (நேரடி தூரம்)`;

        if (isDeliverable) {
          const estimatedMinutes =
            roadDurationMinutes != null
              ? Math.max(15, roadDurationMinutes + 10)
              : matchedZone?.estimatedDeliveryMinutes || Math.max(20, 15 + Math.round(minDistance * 2));
          const deliveryFee = Number(matchedZone?.baseFee || 25);
          const freeDeliveryThreshold = Number(matchedZone?.freeDeliveryThreshold || 250);
          const minOrderAmount = Number(matchedZone?.minOrderAmount || 100);

          return reply.send({
            success: true,
            data: {
              status: 'AVAILABLE',
              statusTitle: 'Delivery Available',
              statusTitleTa: 'டெலிவரி கிடைக்கும்',
              isDeliverable: true,
              nearestBranch,
              eligibleBranches,
              distanceKm: minDistance,
              distanceType,
              distanceLabel,
              distanceLabelTa,
              estimatedMinutes,
              deliveryFee,
              freeDeliveryThreshold,
              minOrderAmount,
              matchedZone: matchedZone ? { id: matchedZone.id, name: matchedZone.name } : null,
              message: `Delivery available in ~${estimatedMinutes} mins from ${nearestBranch.name} (${distanceLabel})`,
              messageTa: `டெலிவரி கிடைக்கும்: ~${estimatedMinutes} நிமிடங்களில் (${nearestBranch.nameTa || nearestBranch.name}-லிருந்து ${distanceLabelTa})`,
            },
          });
        } else {
          return reply.send({
            success: true,
            data: {
              status: 'OUTSIDE_COVERAGE',
              statusTitle: 'Outside Standard Delivery Area',
              statusTitleTa: 'நிலையான டெலிவரி பகுதிக்கு வெளியே உள்ளது',
              isDeliverable: false,
              nearestBranch,
              eligibleBranches: [],
              distanceKm: minDistance,
              distanceType,
              distanceLabel,
              distanceLabelTa,
              estimatedMinutes: null,
              deliveryFee: null,
              freeDeliveryThreshold: null,
              minOrderAmount: null,
              matchedZone: null,
              message: `Delivery is currently unavailable at this address (${distanceLabel} from ${nearestBranch.name}). Standard delivery coverage is up to ${maxCoverageRadius} km. Takeaway, Dine-in & Room bookings are available.`,
              messageTa: `இந்த முகவரியில் டெலிவரி தற்போது கிடைக்கவில்லை (${distanceLabelTa}). நிலையான டெலிவரி எல்லை ${maxCoverageRadius} கி.மீ வரை மட்டுமே. பார்சல் மற்றும் உணவகத்தில் அமர்ந்து உண்ணும் வசதி உள்ளது.`,
            },
          });
        }
      }

      // If coordinates are missing or invalid: do not fabricate distances!
      const mainBranch = branches.find((b) => b.isMainBranch) || branches[0];
      return reply.send({
        success: true,
        data: {
          status: 'UNVERIFIABLE',
          statusTitle: 'Unable to verify delivery availability',
          statusTitleTa: 'டெலிவரி கிடைப்பதை உறுதிப்படுத்த முடியவில்லை',
          isDeliverable: false,
          nearestBranch: mainBranch
            ? {
                id: mainBranch.id,
                name: mainBranch.name,
                nameTa: mainBranch.nameTa,
                city: mainBranch.city,
                coordinates: HOTEL_COORDINATES,
                mapsUrl: HOTEL_MAPS_URL,
              }
            : null,
          eligibleBranches: [],
          distanceKm: null,
          distanceType: null,
          distanceLabel: null,
          distanceLabelTa: null,
          estimatedMinutes: null,
          deliveryFee: null,
          freeDeliveryThreshold: null,
          minOrderAmount: null,
          matchedZone: null,
          message:
            'Unable to verify delivery availability for this location. Please detect your GPS location or select a specific address on the map.',
          messageTa:
            'இந்த இருப்பிடத்திற்கு டெலிவரி கிடைப்பதை உறுதிப்படுத்த முடியவில்லை. தயவுசெய்து உங்கள் ஜிபிஎஸ் இருப்பிடத்தைத் தேர்ந்தெடுக்கவும்.',
        },
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to verify delivery coverage',
        },
      });
    }
  };

  fastify.post('/delivery/check-coverage', checkDeliveryCoverageHandler);
  fastify.post('/check-coverage', checkDeliveryCoverageHandler);

  // ── GET /home — Customer home feed ────────────────────────────────────────
  fastify.get('/home', async (request, reply) => {
    try {
      // 0. Resolve Branch from query or fallback to main branch
      const requestedBranchId = (request.query as any)?.branchId;
      let activeBranch = null;
      if (requestedBranchId) {
        activeBranch = await fastify.prisma.branch.findUnique({
          where: { id: requestedBranchId },
        });
      }
      if (!activeBranch) {
        activeBranch = await fastify.prisma.branch.findFirst({
          where: { isActive: true },
          orderBy: [{ isMainBranch: 'desc' }, { createdAt: 'asc' }],
        });
      }

      const allBranches = await fastify.prisma.branch.findMany({
        where: { isActive: true },
        orderBy: [{ isMainBranch: 'desc' }, { name: 'asc' }],
      });

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
          take: 8,
          include: { category: true },
          orderBy: [{ isBestseller: 'desc' }, { displayOrder: 'asc' }],
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
        // Fallback to empty if DB query fails
      }

      // 4. Query room types from Prisma
      let featuredRooms: any[] = [];
      try {
        const roomTypesRaw = await fastify.prisma.roomType.findMany({
          take: 4,
          orderBy: { basePrice: 'asc' },
        });

        featuredRooms = roomTypesRaw.map((rt: any) => {
          const imgs = Array.isArray(rt.imageUrls) && rt.imageUrls.length > 0
            ? rt.imageUrls
            : ['https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp'];

          return {
            id: rt.id,
            branchId: activeBranch?.id || '00000000-0000-0000-0000-000000000001',
            title: rt.name,
            titleTa: rt.nameTa,
            name: rt.name,
            nameTa: rt.nameTa,
            roomType: rt.name,
            description: rt.description ?? '',
            descriptionTa: rt.descriptionTa ?? '',
            basePrice: Number(rt.basePrice),
            pricePerNight: Number(rt.basePrice),
            price: Number(rt.basePrice),
            maxOccupancy: rt.maxOccupancy,
            capacity: rt.maxOccupancy,
            isAc: true,
            isAvailable: true,
            roomSizeSqft: rt.sizeSqFt || 280,
            totalRooms: 10,
            amenities: rt.amenities ?? ['Air Conditioning', 'WiFi', 'Attached Bathroom', 'Room Service'],
            amenitiesTa: rt.amenitiesTa ?? ['குளிரூட்டி', 'வைஃபை', 'இணைக்கப்பட்ட குளியலறை', 'அறை சேவை'],
            images: imgs,
            imageUrl: imgs[0],
            createdAt: rt.createdAt.toISOString(),
            updatedAt: rt.updatedAt.toISOString(),
          };
        });
      } catch {
        // Fallback to empty if DB query fails
      }

      // 5. Dynamic customer home feed
      const homeFeed: HomeFeedData & { branches?: any[]; selectedBranchId?: string } = {
        greeting: {
          userName,
          branchName: activeBranch?.name || 'Kalaiyarkoil Main Branch',
          branchNameTa: activeBranch?.nameTa || 'காளையார்கோவில் முதன்மை கிளை',
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
        branches: allBranches.map((b: any) => ({
          id: b.id,
          name: b.name,
          nameTa: b.nameTa,
          phone: b.phone,
          address: b.address,
          city: b.city,
          state: b.state,
          pincode: b.pincode,
          isMainBranch: b.isMainBranch,
        })),
        selectedBranchId: activeBranch?.id || '00000000-0000-0000-0000-000000000001',
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
