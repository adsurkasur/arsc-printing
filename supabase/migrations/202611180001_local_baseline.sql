-- Isolated LOCAL Supabase only. No users, credentials or live data are seeded.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public.orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_name text NOT NULL,
 contact text NOT NULL, file_name text NOT NULL DEFAULT '', file_url text,
 file_path text, file_expires_at timestamptz, file_deleted boolean NOT NULL DEFAULT false,
 payment_proof_url text, payment_proof_path text, payment_proof_expires_at timestamptz,
 payment_proof_deleted boolean NOT NULL DEFAULT false,
 color_mode text NOT NULL DEFAULT 'bw', copies integer NOT NULL DEFAULT 1,
 pages integer NOT NULL DEFAULT 1, actual_pages integer,
 paper_size text NOT NULL DEFAULT 'A4', layout text NOT NULL DEFAULT '1-up',
 scale_mode text NOT NULL DEFAULT 'fit', orientation text NOT NULL DEFAULT 'portrait',
 status text NOT NULL DEFAULT 'pending', estimated_time integer NOT NULL DEFAULT 0,
 notes text, user_note text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id),
 role text NOT NULL CHECK (role IN ('admin','customer')), created_at timestamptz DEFAULT now(),
 UNIQUE(user_id,role)
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
INSERT INTO storage.buckets(id,name,public) VALUES('documents','documents',false)
ON CONFLICT(id) DO UPDATE SET public=false;
