const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const branches = await prisma.branch.findMany();
  console.log('BRANCHES:', JSON.stringify(branches, null, 2));
  const menuCount = await prisma.menuItem.count();
  console.log('MENU ITEMS COUNT:', menuCount);
  const sampleItems = await prisma.menuItem.findMany({ take: 3, include: { category: true } });
  console.log('SAMPLE ITEMS:', JSON.stringify(sampleItems, null, 2));
  const roomCount = await prisma.room.count();
  const roomTypeCount = await prisma.roomType.count();
  console.log('ROOM COUNT:', roomCount, 'ROOM TYPES:', roomTypeCount);
  const sampleRoomTypes = await prisma.roomType.findMany({ take: 2 });
  console.log('SAMPLE ROOM TYPES:', JSON.stringify(sampleRoomTypes, null, 2));
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
