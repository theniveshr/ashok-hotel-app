const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Updating Ashok Raj Lodge & Restaurant A/C coordinates in Supabase ---');

  const HOTEL_LAT = 9.8465627;
  const HOTEL_LNG = 78.6356551;

  // 1. Update the main branch
  const updatedBranch = await prisma.branch.update({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    data: {
      name: 'Ashok Raj Lodge & Restaurant A/C',
      nameTa: 'அசோக் ராஜ் தங்குமிடம் மற்றும் உணவகம் குளிரூட்டி',
      address: 'No-1412, Madurai to Thondi Main Road, Kalaiyarkoil, opposite Petrol Pump',
      city: 'Kalaiyarkoil',
      lat: HOTEL_LAT,
      lng: HOTEL_LNG,
      isMainBranch: true,
      isActive: true,
    },
  });

  console.log('Updated branch in Supabase:', {
    id: updatedBranch.id,
    name: updatedBranch.name,
    lat: Number(updatedBranch.lat),
    lng: Number(updatedBranch.lng),
    city: updatedBranch.city,
  });

  // 2. Configure delivery zones for this branch in DB
  console.log('\n--- Configuring Delivery Zones in Supabase ---');
  await prisma.deliveryZone.deleteMany({
    where: { branchId: updatedBranch.id },
  });

  const zonesToCreate = [
    {
      id: '00000000-0000-0000-0000-000000000011',
      branchId: updatedBranch.id,
      name: 'Kalaiyarkoil Town Core',
      nameTa: 'காளையார்கோவில் நகர் மையம்',
      baseFee: 25,
      minOrderAmount: 100,
      freeDeliveryThreshold: 250,
      estimatedDeliveryMinutes: 25,
      radiusKm: 5.0,
      pincodes: ['630551'],
      isActive: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      branchId: updatedBranch.id,
      name: 'Sivagangai Highway & Murthi Nagar',
      nameTa: 'சிவகங்கை நெடுஞ்சாலை & மூர்த்தி நகர்',
      baseFee: 40,
      minOrderAmount: 150,
      freeDeliveryThreshold: 400,
      estimatedDeliveryMinutes: 35,
      radiusKm: 15.0,
      pincodes: ['630551', '630552'],
      isActive: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000013',
      branchId: updatedBranch.id,
      name: 'Outer Villages & Surrounding Areas',
      nameTa: 'வெளிப்புற கிராமங்கள் & சுற்றுப்புறங்கள்',
      baseFee: 60,
      minOrderAmount: 250,
      freeDeliveryThreshold: 600,
      estimatedDeliveryMinutes: 45,
      radiusKm: 25.0,
      pincodes: ['630551', '630552', '630554'],
      isActive: true,
    },
  ];

  for (const z of zonesToCreate) {
    const created = await prisma.deliveryZone.create({ data: z });
    console.log(`Created delivery zone: ${created.name} (Radius: ${created.radiusKm} km, BaseFee: ₹${created.baseFee})`);
  }

  console.log('\n✅ Successfully updated branch coordinates and delivery zones in Supabase Cloud DB!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error updating branch:', err);
  prisma.$disconnect();
  process.exit(1);
});
