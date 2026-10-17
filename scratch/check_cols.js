const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  const addressCols = await p.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'addresses' ORDER BY ordinal_position");
  console.log('Address columns in Supabase:');
  console.table(addressCols);

  const userCols = await p.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
  console.log('User columns in Supabase:');
  console.table(userCols.filter(c => c.column_name.includes('tour')));
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
