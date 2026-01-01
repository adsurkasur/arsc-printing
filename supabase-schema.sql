-- ARSC Printing Database Schema
-- Run this in your Supabase SQL Editor
-- Last Updated: 2026-01-01

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

-- Create orders table
-- NOTE: If you're upgrading an existing DB, add 'delivered' to the status CHECK via:
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
-- ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending','printing','completed','delivered','cancelled'));

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  color_mode TEXT NOT NULL CHECK (color_mode IN ('bw', 'color')),
  copies INTEGER NOT NULL DEFAULT 1,
  paper_size TEXT NOT NULL DEFAULT 'A4' CHECK (paper_size = 'A4'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'completed', 'delivered', 'cancelled')),
  estimated_time INTEGER NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Stores printing orders from customers';

-- ============================================================================
-- USER ROLES TABLE
-- ============================================================================

-- Create user_roles table for role-based access control (RBAC)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

COMMENT ON TABLE user_roles IS 'Tracks user roles for RBAC. Users can have multiple roles.';
COMMENT ON COLUMN user_roles.role IS 'User role: admin (can manage all orders) or customer (can only view own orders)';

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current authenticated user has admin role';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: ORDERS TABLE
-- ============================================================================

-- Policy: Anyone can create orders (for customers submitting print jobs)
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Anyone can read orders (for tracking via order ID)
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only admins can update orders (status changes, etc.)
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Only admins can update orders" ON orders;
CREATE POLICY "Only admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy: Only admins can delete orders
DROP POLICY IF EXISTS "Only admins can delete orders" ON orders;
CREATE POLICY "Only admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- RLS POLICIES: USER_ROLES TABLE
-- ============================================================================

-- Policy: Only admins can read user roles
DROP POLICY IF EXISTS "Only admins can read user roles" ON user_roles;
CREATE POLICY "Only admins can read user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy: Only admins can insert user roles
DROP POLICY IF EXISTS "Only admins can insert user roles" ON user_roles;
CREATE POLICY "Only admins can insert user roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Policy: Only admins can update user roles
DROP POLICY IF EXISTS "Only admins can update user roles" ON user_roles;
CREATE POLICY "Only admins can update user roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy: Only admins can delete user roles
DROP POLICY IF EXISTS "Only admins can delete user roles" ON user_roles;
CREATE POLICY "Only admins can delete user roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- STORAGE BUCKET & POLICIES
-- ============================================================================

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can upload documents
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
CREATE POLICY "Anyone can upload documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'documents');

-- Storage policy: Anyone can read documents
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;
CREATE POLICY "Anyone can read documents"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'documents');

-- Storage policy: Only admins can delete documents (for cleanup)
DROP POLICY IF EXISTS "Only admins can delete documents" ON storage.objects;
CREATE POLICY "Only admins can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND 
    public.is_admin()
  );

-- ============================================================================
-- REALTIME & INDEXES
-- ============================================================================

-- Enable realtime for orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END
$$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Add file lifecycle columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS file_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS file_deleted BOOLEAN DEFAULT FALSE;

-- Add payment proof lifecycle columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_path TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_deleted BOOLEAN DEFAULT FALSE;
-- Public URL for uploaded payment proof (if any). Nullable to support demo mode and legacy rows.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
COMMENT ON COLUMN public.orders.payment_proof_url IS 'Public URL for uploaded payment proof (if any)';

CREATE INDEX IF NOT EXISTS idx_orders_file_expires_at ON orders(file_expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_file_deleted ON orders(file_deleted);
CREATE INDEX IF NOT EXISTS idx_orders_payment_proof_expires_at ON orders(payment_proof_expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_proof_deleted ON orders(payment_proof_deleted);

-- ============================================================================
-- DEMO ADMIN USER
-- ============================================================================

-- NOTE: To create the demo admin user, you have two options:
--
-- OPTION 1 (RECOMMENDED): Create via Supabase Dashboard
--   1. Go to Authentication > Users
--   2. Click "Add user" > "Create new user"
--   3. Email: admin@arsc-printing.com
--   4. Password: admin123
--   5. After creation, run the INSERT below to assign admin role
--
-- OPTION 2: Create via SQL (Advanced)
--   Uncomment and run the following SQL statements:
--
-- First, insert the user into auth.users (password is 'admin123' hashed with bcrypt)
-- NOTE: This requires proper password hashing. It's better to use the Dashboard.
--
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   is_super_admin,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'admin@arsc-printing.com',
--   crypt('admin123', gen_salt('bf')), -- Requires pgcrypto extension
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"provider":"email","providers":["email"]}',
--   '{}',
--   false,
--   '',
--   '',
--   '',
--   ''
-- )
-- ON CONFLICT (email) DO NOTHING;

-- Assign admin role to the demo admin user
-- Run this AFTER creating the user (via Dashboard or SQL above)
-- Replace the email with the actual admin email if different
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@arsc-printing.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these queries to verify the setup:
--
-- Check if admin user exists:
-- SELECT id, email, created_at FROM auth.users WHERE email = 'admin@arsc-printing.com';
--
-- Check if admin role is assigned:
-- SELECT ur.*, u.email 
-- FROM public.user_roles ur
-- JOIN auth.users u ON u.id = ur.user_id
-- WHERE u.email = 'admin@arsc-printing.com';
--
-- Test is_admin() function:
-- SELECT public.is_admin(); -- Should return true if you're logged in as admin

-- Verify `payment_proof_url` column exists on `orders`:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_proof_url';

-- Test inserting an order with a `payment_proof_url` (run in a dev or test environment):
-- INSERT INTO public.orders (customer_name, contact, file_name, color_mode, copies, paper_size, estimated_time, payment_proof_url)
-- VALUES ('Test User','+000000000','test.pdf','bw',1,'A4',5,'https://example.com/documents/test-proof.pdf');

-- SELECT id, customer_name, payment_proof_url, payment_proof_expires_at FROM public.orders WHERE customer_name = 'Test User' ORDER BY created_at DESC LIMIT 1;

-- After testing, optionally delete the test row:
-- DELETE FROM public.orders WHERE customer_name = 'Test User';