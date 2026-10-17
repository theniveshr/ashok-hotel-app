const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3001/api/v1';

async function runTests() {
  console.log('====================================================');
  console.log('   ASHOK RAJ GROUPS: E2E VERIFICATION SUITE         ');
  console.log('   Delivery Address Persistence & Onboarding Tour   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Fetch or create two isolated test users in Supabase
  console.log('--- Step 1: Setting up isolated test users in Supabase ---');
  let userA = await prisma.user.findFirst({ where: { phone: '9876543210' } });
  if (!userA) {
    userA = await prisma.user.create({
      data: {
        phone: '9876543210',
        name: 'User A Test',
        tourStatus: 'not_started',
      },
    });
  } else {
    // Reset to not_started for clean test
    await prisma.user.update({
      where: { id: userA.id },
      data: { tourStatus: 'not_started', tourCompletedAt: null },
    });
  }

  let userB = await prisma.user.findFirst({ where: { phone: '9876543211' } });
  if (!userB) {
    userB = await prisma.user.create({
      data: {
        phone: '9876543211',
        name: 'User B Test',
        tourStatus: 'not_started',
      },
    });
  } else {
    await prisma.user.update({
      where: { id: userB.id },
      data: { tourStatus: 'not_started', tourCompletedAt: null },
    });
  }

  // Clean previous test addresses
  await prisma.address.deleteMany({
    where: { userId: { in: [userA.id, userB.id] } },
  });

  assert(userA && userB && userA.id !== userB.id, `Created distinct users: User A (${userA.id}), User B (${userB.id})`);

  // ── Scenario 1: Initial Tour Status for User A ───────────────────────────────
  console.log('\n--- Scenario 1: Check Initial Tour Status for User A ---');
  let res = await fetch(`${API_BASE}/customer/profile/tour-status`, {
    headers: { 'x-user-id': userA.id },
  });
  let json = await res.json();
  assert(res.ok && json.success && json.data.tourStatus === 'not_started', 'User A begins with tourStatus: not_started');

  // ── Scenario 2: User A Completes Tour ─────────────────────────────────────────
  console.log('\n--- Scenario 2: User A Completes Tour ---');
  res = await fetch(`${API_BASE}/customer/profile/tour-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userA.id },
    body: JSON.stringify({ status: 'completed' }),
  });
  json = await res.json();
  assert(res.ok && json.success && json.data.tourStatus === 'completed', 'Server confirmed tour completed');

  // Verify directly in Supabase Cloud DB
  const dbUserAAfterTour = await prisma.user.findUnique({ where: { id: userA.id } });
  assert(
    dbUserAAfterTour.tourStatus === 'completed' && dbUserAAfterTour.tourCompletedAt !== null,
    'Tour status persisted in Supabase Cloud DB with timestamp'
  );

  // ── Scenario 3: User A Saves GPS-Detected Location ────────────────────────────
  console.log('\n--- Scenario 3: User A Saves GPS Detected Location ---');
  const gpsPayload = {
    label: 'Current Location',
    line1: 'Near Ashok Raj Complex, Madurai Main Road',
    city: 'Kalaiyarkoil',
    state: 'Tamil Nadu',
    pincode: '630551',
    lat: 9.8456,
    lng: 78.6543,
    formattedAddress: 'Near Ashok Raj Complex, Madurai Main Road, Kalaiyarkoil, Tamil Nadu 630551',
    isDefault: true,
  };
  res = await fetch(`${API_BASE}/customer/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userA.id },
    body: JSON.stringify(gpsPayload),
  });
  json = await res.json();
  assert(res.ok && json.success && json.data?.id, `GPS detected address saved in DB with ID: ${json.data?.id}`);
  const addressA1Id = json.data?.id;

  // Verify in Supabase
  const dbAddress1 = await prisma.address.findUnique({ where: { id: addressA1Id } });
  assert(
    dbAddress1 && dbAddress1.userId === userA.id && Math.abs(dbAddress1.lat - 9.8456) < 0.001,
    'GPS address verified in Supabase Cloud DB with user ownership'
  );

  // ── Scenario 4: User A Completes Delivery Details ─────────────────────────────
  console.log('\n--- Scenario 4: User A Completes Detailed Delivery Form ---');
  const updatePayload = {
    recipientName: 'Nivesh ARN',
    recipientPhone: '9876543210',
    houseNumber: '42/B',
    buildingName: 'Royal Residency',
    streetName: 'Temple Street',
    area: 'West Gate',
    landmark: 'Opposite Sivan Temple',
    deliveryInstructions: 'Leave package at security gate',
    label: 'Home',
    isDefault: true,
  };
  res = await fetch(`${API_BASE}/customer/addresses/${addressA1Id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userA.id },
    body: JSON.stringify(updatePayload),
  });
  json = await res.json();
  assert(res.ok && json.success, 'Address details updated successfully');

  const dbAddressUpdated = await prisma.address.findUnique({ where: { id: addressA1Id } });
  assert(
    dbAddressUpdated.recipientName === 'Nivesh ARN' &&
      dbAddressUpdated.houseNumber === '42/B' &&
      dbAddressUpdated.buildingName === 'Royal Residency' &&
      dbAddressUpdated.label === 'Home',
    'Updated delivery fields verified in Supabase Cloud DB'
  );

  // ── Scenario 5: User A Adds a Second Address (Work) & Changes Default ─────────
  console.log('\n--- Scenario 5: User A Adds Second Address and Sets Default ---');
  const workPayload = {
    recipientName: 'Nivesh ARN (Office)',
    recipientPhone: '9876543210',
    houseNumber: 'Suite 201',
    buildingName: 'Tech Park',
    streetName: 'Bypass Road',
    area: 'Industrial Zone',
    city: 'Kalaiyarkoil',
    state: 'Tamil Nadu',
    pincode: '630551',
    line1: 'Suite 201, Tech Park, Bypass Road',
    label: 'Work',
    isDefault: true,
  };
  res = await fetch(`${API_BASE}/customer/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userA.id },
    body: JSON.stringify(workPayload),
  });
  json = await res.json();
  const addressA2Id = json.data?.id;
  assert(res.ok && json.success && addressA2Id, `Second address (Work) created with ID: ${addressA2Id}`);

  // Fetch all User A addresses
  res = await fetch(`${API_BASE}/customer/addresses`, {
    headers: { 'x-user-id': userA.id },
  });
  json = await res.json();
  assert(
    json.data.length === 2 && json.data[0].id === addressA2Id && json.data[0].isDefault === true,
    'Both addresses retrieved, new default address is ordered first'
  );

  // ── Scenario 6: User B Logs In - Strict User Isolation & Access Control ───────
  console.log('\n--- Scenario 6: User B Isolation & Unauthorized Access Prevention ---');
  // User B's addresses list must be empty
  res = await fetch(`${API_BASE}/customer/addresses`, {
    headers: { 'x-user-id': userB.id },
  });
  json = await res.json();
  assert(json.data.length === 0, "User B sees 0 addresses (cannot see User A's addresses)");

  // User B's tour status must be not_started
  res = await fetch(`${API_BASE}/customer/profile/tour-status`, {
    headers: { 'x-user-id': userB.id },
  });
  json = await res.json();
  assert(json.data.tourStatus === 'not_started', "User B has their own tourStatus: 'not_started'");

  // User B attempts to read User A's address directly
  res = await fetch(`${API_BASE}/customer/addresses/${addressA1Id}`, {
    headers: { 'x-user-id': userB.id },
  });
  assert(res.status === 404 || res.status === 403, `User B reading User A address returned safe status: ${res.status}`);

  // User B attempts to modify User A's address
  res = await fetch(`${API_BASE}/customer/addresses/${addressA1Id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userB.id },
    body: JSON.stringify({ recipientName: 'Hacker User' }),
  });
  assert(res.status === 404 || res.status === 403, `User B modifying User A address rejected with status: ${res.status}`);

  // User B attempts to delete User A's address
  res = await fetch(`${API_BASE}/customer/addresses/${addressA1Id}`, {
    method: 'DELETE',
    headers: { 'x-user-id': userB.id },
  });
  assert(res.status === 404 || res.status === 403, `User B deleting User A address rejected with status: ${res.status}`);

  // Verify User A's address remains intact in Supabase
  const dbUserAAddressIntact = await prisma.address.findUnique({ where: { id: addressA1Id } });
  assert(
    dbUserAAddressIntact && dbUserAAddressIntact.recipientName === 'Nivesh ARN' && !dbUserAAddressIntact.deletedAt,
    "User A's address intact and unchanged in Supabase"
  );

  // ── Scenario 7: User A Logs In Again - Addresses Load Automatically ───────────
  console.log('\n--- Scenario 7: User A Re-login Verification ---');
  res = await fetch(`${API_BASE}/customer/addresses`, {
    headers: { 'x-user-id': userA.id },
  });
  json = await res.json();
  assert(
    json.data.length === 2 && json.data.some((a) => a.id === addressA1Id) && json.data.some((a) => a.id === addressA2Id),
    'User A re-login successfully loads both saved addresses from Supabase'
  );

  // ── Scenario 8: Delete Address ────────────────────────────────────────────────
  console.log('\n--- Scenario 8: Address Deletion & Default Reassignment ---');
  res = await fetch(`${API_BASE}/customer/addresses/${addressA2Id}`, {
    method: 'DELETE',
    headers: { 'x-user-id': userA.id },
  });
  assert(res.ok, 'User A successfully deletes address');

  res = await fetch(`${API_BASE}/customer/addresses`, {
    headers: { 'x-user-id': userA.id },
  });
  json = await res.json();
  assert(
    json.data.length === 1 && json.data[0].id === addressA1Id && json.data[0].isDefault === true,
    'Remaining address automatically promoted to default after default address deleted'
  );

  // Clean up test data
  await prisma.address.deleteMany({
    where: { userId: { in: [userA.id, userB.id] } },
  });

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  prisma.$disconnect();
  process.exit(1);
});
