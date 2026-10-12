import { PrismaClient, RoleName, Language } from '@prisma/client';
import { BUSINESS } from '@ashok-raj/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Roles ─────────────────────────────────────────────────────────────────
  const roles: { name: RoleName; description: string }[] = [
    { name: 'SUPER_ADMIN', description: 'Full system access' },
    { name: 'ADMIN', description: 'Branch administration' },
    { name: 'MANAGER', description: 'Branch manager' },
    { name: 'RECEPTIONIST', description: 'Front desk operations' },
    { name: 'WAITER', description: 'Restaurant floor operations' },
    { name: 'KITCHEN_STAFF', description: 'Kitchen operations' },
    { name: 'HOUSEKEEPER', description: 'Room housekeeping' },
    { name: 'DELIVERY_PARTNER', description: 'Food delivery partner' },
    { name: 'CUSTOMER', description: 'Customer' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles seeded');

  // ── Main Branch ───────────────────────────────────────────────────────────
  const mainBranch = await prisma.branch.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: BUSINESS.name,
      nameTa: BUSINESS.nameTa,
      phone: BUSINESS.phone,
      address: `${BUSINESS.address.line1}, ${BUSINESS.address.line2}`,
      city: BUSINESS.address.city,
      state: BUSINESS.address.state,
      pincode: BUSINESS.address.pincode,
      lat: 10.0850,
      lng: 78.5671,
      isMainBranch: true,
      isActive: true,
    },
  });
  console.log('✅ Main branch seeded:', mainBranch.name);

  // ── Users: none seeded (clean fresh start for new customer and staff registrations) ─

  // ── Room Types ─────────────────────────────────────────────────────────────
  const roomTypes = [
    {
      name: 'Standard AC Room',
      nameTa: 'நிலையான குளிரூட்டி அறை',
      description: 'Comfortable standard room with air conditioning, attached bathroom, and essential amenities.',
      descriptionTa: 'குளிரூட்டி, இணைக்கப்பட்ட குளியலறை மற்றும் அத்தியாவசிய வசதிகளுடன் கூடிய வசதியான அறை.',
      basePrice: 1200,
      maxOccupancy: 2,
      bedType: 'Double',
      amenities: ['Air Conditioning', 'Attached Bathroom', 'TV', 'WiFi', 'Hot Water', 'Room Service'],
      amenitiesTa: ['குளிரூட்டி', 'இணைக்கப்பட்ட குளியலறை', 'தொலைக்காட்சி', 'வைஃபை', 'சூடான நீர்', 'அறை சேவை'],
      displayOrder: 1,
    },
    {
      name: 'Deluxe AC Room',
      nameTa: 'டீலக்ஸ் குளிரூட்டி அறை',
      description: 'Spacious deluxe room with premium furnishings, air conditioning, and enhanced amenities.',
      descriptionTa: 'குளிரூட்டி, பிரீமியம் தளபாடங்கள் மற்றும் மேம்பட்ட வசதிகளுடன் கூடிய விரிவான டீலக்ஸ் அறை.',
      basePrice: 1800,
      maxOccupancy: 3,
      bedType: 'King',
      amenities: ['Air Conditioning', 'Attached Bathroom', 'LED TV', 'WiFi', 'Hot Water', 'Room Service', 'Mini Fridge', 'Work Desk'],
      amenitiesTa: ['குளிரூட்டி', 'இணைக்கப்பட்ட குளியலறை', 'LED தொலைக்காட்சி', 'வைஃபை', 'சூடான நீர்', 'அறை சேவை', 'மினி குளிர்சாதன பெட்டி', 'பணி மேசை'],
      displayOrder: 2,
    },
    {
      name: 'Family AC Room',
      nameTa: 'குடும்ப குளிரூட்டி அறை',
      description: 'Large family room accommodating up to 4 guests with twin beds and all modern amenities.',
      descriptionTa: '4 விருந்தினர்கள் வரை தங்கக்கூடிய இரட்டை கட்டில்கள் மற்றும் அனைத்து நவீன வசதிகளுடன் கூடிய பெரிய குடும்ப அறை.',
      basePrice: 2400,
      maxOccupancy: 4,
      bedType: 'Twin',
      amenities: ['Air Conditioning', 'Attached Bathroom', 'LED TV', 'WiFi', 'Hot Water', 'Room Service', 'Extra Beds Available'],
      amenitiesTa: ['குளிரூட்டி', 'இணைக்கப்பட்ட குளியலறை', 'LED தொலைக்காட்சி', 'வைஃபை', 'சூடான நீர்', 'அறை சேவை', 'கூடுதல் கட்டில்கள் கிடைக்கும்'],
      displayOrder: 3,
    },
  ];

  for (const rt of roomTypes) {
    await prisma.roomType.upsert({
      where: {
        id: `00000000-0000-0000-0001-${String(rt.displayOrder).padStart(12, '0')}`,
      },
      update: {},
      create: {
        id: `00000000-0000-0000-0001-${String(rt.displayOrder).padStart(12, '0')}`,
        ...rt,
        imageUrls: [],
      },
    });
  }
  console.log('✅ Room types seeded');

  // ── Menu Categories ────────────────────────────────────────────────────────
  const menuCategories = [
    { name: 'Breakfast', nameTa: 'காலை உணவு', displayOrder: 1 },
    { name: 'Starters', nameTa: 'முன்பகுதி உணவுகள்', displayOrder: 2 },
    { name: 'Veg Main Course', nameTa: 'சைவ முக்கிய உணவு', displayOrder: 3 },
    { name: 'Non-Veg Main Course', nameTa: 'அசைவ முக்கிய உணவு', displayOrder: 4 },
    { name: 'Rice & Biryani', nameTa: 'சோறு மற்றும் பிரியாணி', displayOrder: 5 },
    { name: 'Breads', nameTa: 'ரொட்டி', displayOrder: 6 },
    { name: 'Beverages', nameTa: 'பானங்கள்', displayOrder: 7 },
    { name: 'Desserts', nameTa: 'இனிப்பு', displayOrder: 8 },
  ];

  for (const cat of menuCategories) {
    await prisma.menuCategory.upsert({
      where: {
        id: `00000000-0000-0000-0002-${String(cat.displayOrder).padStart(12, '0')}`,
      },
      update: {},
      create: {
        id: `00000000-0000-0000-0002-${String(cat.displayOrder).padStart(12, '0')}`,
        ...cat,
        isActive: true,
      },
    });
  }
  console.log('✅ Menu categories seeded');

  // ── Restaurant Tables ──────────────────────────────────────────────────────
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: {
        branchId_tableNumber: {
          branchId: mainBranch.id,
          tableNumber: String(i),
        },
      },
      update: {},
      create: {
        branchId: mainBranch.id,
        tableNumber: String(i),
        floor: 1,
        capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
        qrCode: `TABLE-${mainBranch.id.slice(0, 8)}-${i}`,
      },
    });
  }
  console.log('✅ Tables seeded (10 tables)');

  // ── Rooms ─────────────────────────────────────────────────────────────────
  const roomsToSeed = [
    { roomNumber: '101', floor: 1, typeIdx: 0 },
    { roomNumber: '102', floor: 1, typeIdx: 0 },
    { roomNumber: '103', floor: 1, typeIdx: 0 },
    { roomNumber: '104', floor: 1, typeIdx: 1 },
    { roomNumber: '105', floor: 1, typeIdx: 1 },
    { roomNumber: '201', floor: 2, typeIdx: 0 },
    { roomNumber: '202', floor: 2, typeIdx: 0 },
    { roomNumber: '203', floor: 2, typeIdx: 1 },
    { roomNumber: '204', floor: 2, typeIdx: 2 },
    { roomNumber: '205', floor: 2, typeIdx: 2 },
  ];

  const typeIds = [
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0001-000000000003',
  ] as const;

  for (const r of roomsToSeed) {
    await prisma.room.upsert({
      where: {
        branchId_roomNumber: {
          branchId: mainBranch.id,
          roomNumber: r.roomNumber,
        },
      },
      update: {},
      create: {
        branchId: mainBranch.id,
        roomNumber: r.roomNumber,
        floor: r.floor,
        typeId: typeIds[r.typeIdx]!,
      },
    });
  }
  console.log('✅ Rooms seeded (10 rooms)');

  // ── Default Settings ───────────────────────────────────────────────────────
  const defaultSettings = [
    { key: 'restaurant.isOpen', value: 'true', group: 'restaurant' },
    { key: 'restaurant.openTime', value: '07:00', group: 'restaurant' },
    { key: 'restaurant.closeTime', value: '22:00', group: 'restaurant' },
    { key: 'delivery.enabled', value: 'true', group: 'delivery' },
    { key: 'delivery.minOrderAmount', value: '100', group: 'delivery' },
    { key: 'delivery.radiusKm', value: '10', group: 'delivery' },
    { key: 'loyalty.enabled', value: 'true', group: 'loyalty' },
    { key: 'loyalty.pointsPerRupee', value: '1', group: 'loyalty' },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: {
        branchId_key: {
          branchId: mainBranch.id,
          key: s.key,
        },
      },
      update: {},
      create: {
        branchId: mainBranch.id,
        ...s,
      },
    });
  }
  console.log('✅ Default settings seeded');

  console.log('');
  console.log('🎉 Database seed complete!');
  console.log('');
  console.log('  Admin phone: 9999999999');
  console.log('  Branch ID:   00000000-0000-0000-0000-000000000001');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
