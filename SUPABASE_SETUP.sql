-- Supabase SQL Editor - Run this in Supabase SQL Editor
-- This creates all necessary tables for Aura Creatures NFT project

-- 1. Tokens table (for storing NFT generation data)
CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  x_user_id VARCHAR(255) NOT NULL,
  token_id INTEGER DEFAULT 0, -- Changed: Remove NOT NULL and UNIQUE, allow 0 for unminted tokens
  seed VARCHAR(64) NOT NULL,
  token_uri TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  image_uri TEXT NOT NULL,
  traits JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on x_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_tokens_x_user_id ON tokens(x_user_id);

-- Create unique index on token_id only when token_id > 0 (for minted tokens)
-- This allows multiple unminted tokens (token_id = 0) but ensures minted tokens are unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_tokens_token_id_unique ON tokens(token_id) WHERE token_id > 0;

-- 2. Users table (optional - for future use)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  x_user_id VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  profile_image_url TEXT,
  wallet_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Payments table (for tracking payments)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  x_user_id VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  amount VARCHAR(100) NOT NULL,
  transaction_hash VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  x402_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. KV Store table (for rate limiting and caching)
CREATE TABLE IF NOT EXISTS kv_store (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for expired key cleanup
CREATE INDEX IF NOT EXISTS idx_kv_store_expires_at ON kv_store(expires_at) WHERE expires_at IS NOT NULL;

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tokens', 'users', 'payments', 'kv_store');

