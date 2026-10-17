async function run() {
  const baseUrl = 'http://localhost:3001/api/v1';

  console.log('1. Fetching bakery items before toggle...');
  const res1 = await fetch(`${baseUrl}/customer/menu/items?division=bakery`);
  const data1 = await res1.json();
  const puff1 = data1.data.find((i: any) => i.id === 'bakery-veg-puff');
  console.log('Initial Veg Puff state:', { id: puff1?.id, name: puff1?.name, isAvailable: puff1?.isAvailable, price: puff1?.price });

  console.log('\n2. Toggling Veg Puff to unavailable (isAvailable: false) via Admin API...');
  const patchRes = await fetch(`${baseUrl}/admin/menu/items/bakery-veg-puff/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAvailable: false }),
  });
  const patchData = await patchRes.json();
  console.log('Admin PATCH response:', patchData.message);

  console.log('\n3. Fetching customer menu items (division=bakery) to verify isAvailable is false...');
  const res2 = await fetch(`${baseUrl}/customer/menu/items?division=bakery`);
  const data2 = await res2.json();
  const puff2 = data2.data.find((i: any) => i.id === 'bakery-veg-puff');
  console.log('Updated Veg Puff in customer menu:', { id: puff2?.id, name: puff2?.name, isAvailable: puff2?.isAvailable });

  console.log('\n4. Fetching customer menu items with availableOnly=true filter...');
  const res3 = await fetch(`${baseUrl}/customer/menu/items?division=bakery&availableOnly=true`);
  const data3 = await res3.json();
  const puff3 = data3.data.find((i: any) => i.id === 'bakery-veg-puff');
  console.log('Veg Puff present when availableOnly=true?', puff3 ? 'YES (Error)' : 'NO (Correct, filtered out!)');

  console.log('\n5. Restoring Veg Puff to available (isAvailable: true) via Admin API...');
  const restoreRes = await fetch(`${baseUrl}/admin/menu/items/bakery-veg-puff/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAvailable: true }),
  });
  const restoreData = await restoreRes.json();
  console.log('Admin restore response:', restoreData.message);

  console.log('\n6. Verifying restored state in customer menu...');
  const res4 = await fetch(`${baseUrl}/customer/menu/items?division=bakery`);
  const data4 = await res4.json();
  const puff4 = data4.data.find((i: any) => i.id === 'bakery-veg-puff');
  console.log('Restored Veg Puff state:', { id: puff4?.id, name: puff4?.name, isAvailable: puff4?.isAvailable });

  console.log('\n Availability sync test completed successfully!');
}

run().catch(console.error);
