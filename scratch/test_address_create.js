const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function test() {
  const user = await p.user.findFirst();
  if (!user) throw new Error('No user found');
  console.log('Testing with user:', user.id, user.name);

  // Test creating address with new fields
  const addr = await p.address.create({
    data: {
      userId: user.id,
      label: 'Home',
      line1: 'Door No. 10, West Street',
      line2: 'Near Bus Stop',
      recipientName: 'Nivesh Kumar',
      recipientPhone: '9876543210',
      houseNumber: '10',
      buildingName: 'Nivesh Illam',
      streetName: 'West Street',
      area: 'Town Area',
      landmark: 'Near Bus Stand',
      city: 'Kalayarkoil',
      state: 'Tamil Nadu',
      pincode: '630551',
      country: 'India',
      formattedAddress: 'Door No. 10, Nivesh Illam, West Street, Town Area, Kalayarkoil - 630551',
      deliveryInstructions: 'Call when you arrive at gate',
      isDefault: true,
    }
  });

  console.log('Created address in Supabase:', addr);

  // Test reading back
  const readBack = await p.address.findUnique({
    where: { id: addr.id }
  });
  console.log('Read back address:', readBack);

  // Cleanup test record
  await p.address.delete({ where: { id: addr.id } });
  console.log('Cleanup successful');
}

test().then(() => process.exit(0)).catch(e => { console.error('Error:', e); process.exit(1); });
