-- =============================================================================
-- Ashok Raj Lodge & Restaurant — Supabase Auth Profile Sync & Triggers
-- Migration: 20261012_auth_profile_sync_and_triggers.sql
-- =============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enhanced Row Level Security (RLS) on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = id);

-- Allow authenticated users to update their own profile (with CHECK to prevent reassigning id)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = id)
  WITH CHECK ((select auth.uid())::text = id);

-- Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = id);

-- Allow service_role complete access for backend administrative tasks
DROP POLICY IF EXISTS "Service role has full access to users" ON public.users;
CREATE POLICY "Service role has full access to users" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Trigger Function: Automatically create public.users profile when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_role_id TEXT;
  v_phone VARCHAR(15);
  v_name VARCHAR(100);
BEGIN
  -- Extract name and phone from auth metadata or auth fields
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', 'Ashok Guest');
  v_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    REPLACE(COALESCE(NEW.phone, ''), '+91', ''),
    CONCAT('9', SUBSTRING(REPLACE(NEW.id::text, '-', '') FROM 1 FOR 9))
  );

  -- Ensure phone length within 15 chars
  IF LENGTH(v_phone) > 15 THEN
    v_phone := SUBSTRING(v_phone FROM 1 FOR 15);
  END IF;

  -- Insert profile record matching the exact auth.users.id
  INSERT INTO public.users (
    id,
    name,
    phone,
    email,
    "isVerified",
    "isActive",
    "preferredLanguage",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    NEW.id::text,
    v_name,
    v_phone,
    NEW.email,
    COALESCE((NEW.email_confirmed_at IS NOT NULL), false),
    true,
    COALESCE((NEW.raw_user_meta_data->>'preferredLanguage')::public."Language", 'en'::public."Language"),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    email = COALESCE(EXCLUDED.email, public.users.email),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    "updatedAt" = NOW();

  -- Assign default CUSTOMER role if it exists
  SELECT id INTO v_customer_role_id FROM public.roles WHERE name = 'CUSTOMER' LIMIT 1;
  IF v_customer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (id, "userId", "roleId", "assignedAt")
    VALUES (
      gen_random_uuid()::text,
      NEW.id::text,
      v_customer_role_id,
      NOW()
    )
    ON CONFLICT ("userId", "roleId", "branchId") DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Prevent signup failure even if profile trigger meets edge constraint
    RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Safe Profile Recovery Function
CREATE OR REPLACE FUNCTION public.get_or_create_profile(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_auth_user RECORD;
  v_customer_role_id TEXT;
BEGIN
  -- Check if profile already exists in public.users
  SELECT * INTO v_profile FROM public.users WHERE id = p_user_id::text;

  IF FOUND THEN
    RETURN to_jsonb(v_profile);
  END IF;

  -- Find corresponding record in auth.users
  SELECT * INTO v_auth_user FROM auth.users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Create missing profile
  INSERT INTO public.users (
    id,
    name,
    phone,
    email,
    "isVerified",
    "isActive",
    "preferredLanguage",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    p_user_id::text,
    COALESCE(v_auth_user.raw_user_meta_data->>'name', 'Ashok Guest'),
    COALESCE(
      v_auth_user.raw_user_meta_data->>'phone',
      REPLACE(COALESCE(v_auth_user.phone, ''), '+91', ''),
      CONCAT('9', SUBSTRING(REPLACE(p_user_id::text, '-', '') FROM 1 FOR 9))
    ),
    v_auth_user.email,
    COALESCE((v_auth_user.email_confirmed_at IS NOT NULL), false),
    true,
    'en',
    NOW(),
    NOW()
  )
  RETURNING * INTO v_profile;

  -- Assign CUSTOMER role
  SELECT id INTO v_customer_role_id FROM public.roles WHERE name = 'CUSTOMER' LIMIT 1;
  IF v_customer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (id, "userId", "roleId", "assignedAt")
    VALUES (
      gen_random_uuid()::text,
      p_user_id::text,
      v_customer_role_id,
      NOW()
    )
    ON CONFLICT ("userId", "roleId", "branchId") DO NOTHING;
  END IF;

  RETURN to_jsonb(v_profile);
END;
$$;
