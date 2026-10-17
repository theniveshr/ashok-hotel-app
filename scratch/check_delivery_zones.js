const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const zones = await prisma.deliveryZone.findMany({
    include: { branch: true },
  });
  console.log('Delivery zones count in DB:', zones.length);
  for (const z of zones) {
    console.log({
      id: z.id,
      name: z.name,
      branchId: z.branchId,
      branchName: z.branch?.name,
      baseFee: Number(z.baseFee),
      minOrderAmount: Number(z.minOrderAmount),
      freeDeliveryThreshold: Number(z.freeDeliveryThreshold),
      estimatedDeliveryMinutes: z.estimatedDeliveryMinutes,
      radiusKm: Number(z.radiusKm),
      pincodes: z.pincodes,
      isActive: z.isActive,
    });
  }
  await prisma.$disconnect();
}

main().catch(console.error);
