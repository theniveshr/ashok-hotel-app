const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const branches = await prisma.branch.findMany();
  console.log('Branches in DB count:', branches.length);
  for (const b of branches) {
    console.log({
      id: b.id,
      name: b.name,
      nameTa: b.nameTa,
      address: b.address,
      city: b.city,
      lat: b.lat ? Number(b.lat) : null,
      lng: b.lng ? Number(b.lng) : null,
      isMainBranch: b.isMainBranch,
      isActive: b.isActive,
    });
  }
  await prisma.$disconnect();
}

main().catch(console.error);
