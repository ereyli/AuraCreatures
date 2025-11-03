import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function runMigrations() {
  // Only tokens table is needed - users and payments removed
  // Create tokens table with correct schema
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tokens (
      id SERIAL PRIMARY KEY,
      x_user_id VARCHAR(255) NOT NULL,
      token_id INTEGER NOT NULL DEFAULT 0,
      seed VARCHAR(64) NOT NULL,
      token_uri TEXT NOT NULL,
      metadata_uri TEXT NOT NULL,
      image_uri TEXT NOT NULL,
      traits JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Remove unique constraint on token_id (if exists)
  await db.execute(sql`
    ALTER TABLE tokens DROP CONSTRAINT IF EXISTS tokens_token_id_key;
  `);

  // Create unique index only for minted tokens (token_id > 0)
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_tokens_token_id_unique ON tokens(token_id) WHERE token_id > 0;
  `);

  // Create index on x_user_id for faster lookups
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_tokens_x_user_id ON tokens(x_user_id);
  `);

  // Create kv_store table for key-value storage (rate limiting)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kv_store (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT NOT NULL,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create index for expired key cleanup
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_kv_store_expires_at ON kv_store(expires_at) WHERE expires_at IS NOT NULL;
  `);
}
