-- ARSC Printing Database Schema
-- Run this in your Supabase SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  color_mode TEXT NOT NULL CHECK (color_mode IN ('bw', 'color')),
  copies INTEGER NOT NULL DEFAULT 1,
  paper_size TEXT NOT NULL CHECK (paper_size IN ('A4', 'A3')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'completed', 'cancelled')),
  estimated_time INTEGER NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create orders (for customers)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Anyone can read their order by ID (for tracking)
CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only authenticated users can update orders
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can upload documents
CREATE POLICY "Anyone can upload documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'documents');

-- Storage policy: Anyone can read documents
CREATE POLICY "Anyone can read documents"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'documents');

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Create an index for faster status queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
