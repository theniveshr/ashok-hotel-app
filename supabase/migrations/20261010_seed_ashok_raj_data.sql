-- =============================================================================
-- Ashok Raj Lodge & Restaurant — Supabase Seed Data (Corrected)
-- Run this in the Supabase Dashboard SQL Editor after running the schema migration.
-- =============================================================================

-- 1. Insert System Roles
INSERT INTO "roles" ("id", "name", "description", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'SUPER_ADMIN', 'Full system access', NOW(), NOW()),
  (gen_random_uuid(), 'ADMIN', 'Branch administration', NOW(), NOW()),
  (gen_random_uuid(), 'MANAGER', 'Branch manager', NOW(), NOW()),
  (gen_random_uuid(), 'RECEPTIONIST', 'Front desk operations', NOW(), NOW()),
  (gen_random_uuid(), 'WAITER', 'Restaurant floor operations', NOW(), NOW()),
  (gen_random_uuid(), 'KITCHEN_STAFF', 'Kitchen operations', NOW(), NOW()),
  (gen_random_uuid(), 'HOUSEKEEPER', 'Room housekeeping', NOW(), NOW()),
  (gen_random_uuid(), 'DELIVERY_PARTNER', 'Food delivery partner', NOW(), NOW()),
  (gen_random_uuid(), 'CUSTOMER', 'Customer', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- 2. Insert Main Branch
INSERT INTO "branches" ("id", "name", "nameTa", "phone", "address", "city", "state", "pincode", "lat", "lng", "isMainBranch", "isActive", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Ashok Raj Lodge & Restaurant A/C',
  'அசோக் ராஜ் தங்குமிடம் மற்றும் உணவகம் குளிரூட்டி',
  '04575 232 333',
  'No-1412, Madurai to Thondi Main Road, Kalaiyarkoil, opposite Petrol Pump',
  'Kalayarkoil',
  'Tamil Nadu',
  '630551',
  9.8465627,
  78.6356551,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- 3. Insert Admin User (Phone: 9999999999)
INSERT INTO "users" ("id", "name", "phone", "email", "isVerified", "isActive", "preferredLanguage", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0001-000000000001',
  'Super Admin',
  '9999999999',
  'admin@ashokrajgroups.com',
  true,
  true,
  'en',
  NOW(),
  NOW()
)
ON CONFLICT ("phone") DO NOTHING;

-- 4. Assign SUPER_ADMIN role to Admin User
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
  v_branch_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  SELECT "id" INTO v_user_id
  FROM "users"
  WHERE "phone" = '9999999999';

  SELECT "id" INTO v_role_id
  FROM "roles"
  WHERE "name" = 'SUPER_ADMIN';

  IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
    INSERT INTO "user_roles"
      ("id", "userId", "roleId", "branchId")
    VALUES
      (gen_random_uuid(), v_user_id, v_role_id, v_branch_id)
    ON CONFLICT ("userId", "roleId", "branchId")
    DO NOTHING;
  END IF;
END $$;

-- 5. Insert Room Types
INSERT INTO "room_types" ("id", "name", "nameTa", "description", "descriptionTa", "basePrice", "maxOccupancy", "bedType", "amenities", "amenitiesTa", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
  (
    '00000000-0000-0000-0003-000000000001',
    'Standard AC Room',
    'நிலையான குளிரூட்டி அறை',
    'Comfortable standard room with air conditioning, attached bathroom, and essential amenities.',
    'குளிரூட்டி, இணைக்கப்பட்ட குளியலறை மற்றும் அத்தியாவசிய வசதிகளுடன் கூடிய வசதியான அறை.',
    1200.00,
    2,
    'Double',
    ARRAY['Air Conditioning', 'Attached Bathroom', 'TV', 'WiFi', 'Hot Water', 'Room Service'],
    ARRAY['குளிரூட்டி', 'இணைக்கப்பட்ட குளியலறை', 'தொலைக்காட்சி', 'வைஃபை', 'சூடான நீர்', 'அறை சேவை'],
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0003-000000000002',
    'Deluxe AC Room',
    'டீலக்ஸ் குளிரூட்டி அறை',
    'Spacious deluxe room with premium furnishings, air conditioning, and enhanced amenities.',
    'குளிரூட்டி, பிரீமியம் தளபாடங்கள் மற்றும் மேம்பட்ட வசதிகளுடன் கூடிய விரிவான டீலக்ஸ் அறை.',
    1800.00,
    3,
    'King',
    ARRAY['Air Conditioning', 'Attached Bathroom', 'LED TV', 'WiFi', 'Hot Water', 'Room Service', 'Mini Fridge', 'Work Desk'],
    ARRAY['குளிரூட்டி', 'இணைக்கப்பட்ட குளியலறை', 'LED தொலைக்காட்சி', 'வைஃபை', 'சூடான நீர்', 'அறை சேவை', 'மினி குளிர்சாதன பெட்டி', 'பணி மேசை'],
    2,
    true,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0003-000000000003',
    'Family AC Room',
    'குடும்ப குளிரூட்டி அறை',
    'Large family room accommodating up to 4 guests with twin beds and all modern amenities.',
    '4 விருந்தினர்கள் வரை தங்கக்கூடிய இரட்டை கட்டில்கள் மற்றும் அனைத்து நவீன வசதிகளுடன் கூடிய பெரிய குடும்ப அறை.',
    2400.00,
    4,
    'Twin Double',
    ARRAY['Air Conditioning', 'Attached Bathroom', 'LED TV', 'WiFi', 'Hot Water', 'Room Service', 'Extra Bed Support'],
    ARRAY['குளிரூட்டி', 'இணைக்கப்பட்ட குளியலறை', 'LED தொலைக்காட்சி', 'வைஃபை', 'சூடான நீர்', 'அறை சேவை'],
    3,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT ("id") DO NOTHING;

-- 6. Insert Menu Categories
INSERT INTO "menu_categories" ("id", "branchId", "name", "nameTa", "description", "descriptionTa", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'Breakfast', 'காலை உணவு', 'Fresh traditional South Indian breakfast', 'பாரம்பரிய தென்னிந்திய காலை உணவு', 1, true, NOW(), NOW()),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'Lunch & Meals', 'மதிய உணவு', 'Authentic Chettinad & Tamil Nadu meals', 'செட்டிநாடு மற்றும் தமிழ்நாடு மதிய உணவு', 2, true, NOW(), NOW()),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'Dinner & Tiffin', 'இரவு உணவு', 'Hot dosas, parottas, and gravies', 'தோசை, பரோட்டா மற்றும் சுவையான குருமா', 3, true, NOW(), NOW()),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 'Beverages', 'பானங்கள்', 'Filter coffee, fresh juices, tea', 'ஃபில்டர் காபி, புதிய பழச்சாறுகள், தேநீர்', 4, true, NOW(), NOW()),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000001', 'Bakery & Desserts', 'பேக்கரி மற்றும் இனிப்புகள்', 'Fresh cakes, pastries, and Indian sweets', 'கேக்குகள் மற்றும் இனிப்புகள்', 5, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 7. Insert Restaurant Tables (T1 to T10)
INSERT INTO "tables" ("id", "branchId", "tableNumber", "floor", "capacity", "status", "qrCode", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T1', 1, 4, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T1', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T2', 1, 4, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T2', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T3', 1, 6, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T3', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T4', 1, 2, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T4', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T5', 1, 8, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T5', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T6', 1, 6, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T6', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T7', 1, 4, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T7', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T8', 1, 4, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T8', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T9', 1, 2, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T9', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'T10', 1, 2, 'AVAILABLE', 'https://ashokrajgroups.com/qr/T10', NOW(), NOW())
ON CONFLICT ("branchId", "tableNumber") DO NOTHING;

-- 8. Insert Lodge Rooms (101 to 105 Standard, 201 to 203 Deluxe, 301 to 302 Family)
INSERT INTO "rooms" ("id", "branchId", "typeId", "roomNumber", "floor", "status", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000001', '101', 1, 'AVAILABLE', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000001', '102', 1, 'AVAILABLE', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000001', '103', 1, 'AVAILABLE', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000001', '104', 1, 'AVAILABLE', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000001', '105', 1, 'AVAILABLE', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000002', '201', 2, 'AVAILABLE', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000002', '202', 2, 'AVAILABLE', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000002', '203', 2, 'AVAILABLE', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000003', '301', 3, 'AVAILABLE', NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0003-000000000003', '302', 3, 'AVAILABLE', NOW(), NOW())
ON CONFLICT ("branchId", "roomNumber") DO NOTHING;
