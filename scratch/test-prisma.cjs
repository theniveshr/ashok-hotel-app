const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres.grzlzvidmccrjpqxpbcf:niveshARN%4012@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
      },
    },
  });

  try {
    console.log('Connecting to Prisma...');
    const count = await prisma.user.count();
    console.log('SUCCESS! User count in Supabase:', count);
    const users = await prisma.user.findMany({ take: 5, select: { id: true, name: true, phone: true, email: true } });
    console.log('Users found:', users);
  } catch (err) {
    console.error('FAILED to connect or query:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
