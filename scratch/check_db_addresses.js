const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const addresses = await prisma.address.findMany();
  console.log('Total addresses in DB:', addresses.length);
  addresses.forEach((a) => {
    console.log({
      id: a.id,
      userId: a.userId,
      label: a.label,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      pincode: a.pincode,
      lat: a.lat,
      lng: a.lng,
      isDefault: a.isDefault,
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
