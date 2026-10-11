-- =============================================================================
-- Ashok Raj Lodge & Restaurant — Supabase Row Level Security (RLS) Policies
-- Run this in the Supabase Dashboard SQL Editor to protect tables.
-- =============================================================================

-- Enable RLS on core tables
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "room_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "menu_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "menu_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tables" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies for Catalog Tables (Anyone can browse rooms, menu, branches)
CREATE POLICY "Public branches are viewable by everyone" ON "branches"
  FOR SELECT USING (true);

CREATE POLICY "Active room types are viewable by everyone" ON "room_types"
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Active menu categories are viewable by everyone" ON "menu_categories"
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Available menu items are viewable by everyone" ON "menu_items"
  FOR SELECT USING ("isAvailable" = true);

CREATE POLICY "Rooms rack overview is viewable by everyone" ON "rooms"
  FOR SELECT USING (true);

CREATE POLICY "Dining tables are viewable by everyone" ON "tables"
  FOR SELECT USING (true);

-- 2. User Profiles Security
CREATE POLICY "Users can view their own profile" ON "users"
  FOR SELECT USING (auth.uid()::text = id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own profile" ON "users"
  FOR UPDATE USING (auth.uid()::text = id OR auth.role() = 'service_role');

-- 3. Customer Bookings Security
CREATE POLICY "Users can view their own bookings" ON "bookings"
  FOR SELECT USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own bookings" ON "bookings"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- 4. Customer Orders Security
CREATE POLICY "Users can view their own orders" ON "orders"
  FOR SELECT USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own orders" ON "orders"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');
