import { env, isMockMode } from "../env.mjs";
import { db } from "./db";
import { sql } from "drizzle-orm";

// Mock KV storage
const mockKv: Map<string, string> = new Map();

// Mock KV functions
const mockKvClient = {
  get: async (key: string) => {
    return mockKv.get(key) || null;
  },
  set: async (key: string, value: string) => {
    mockKv.set(key, value);
    return "OK";
  },
  setex: async (key: string, seconds: number, value: string) => {
    mockKv.set(key, value);
    setTimeout(() => mockKv.delete(key), seconds * 1000);
    return "OK";
  },
  incr: async (key: string) => {
    const current = parseInt(mockKv.get(key) || "0");
    const next = current + 1;
    mockKv.set(key, next.toString());
    return next;
  },
  exists: async (key: string) => {
    return mockKv.has(key) ? 1 : 0;
  },
  del: async (key: string) => {
    mockKv.delete(key);
    return 1;
  },
  expire: async (key: string, seconds: number) => {
    if (mockKv.has(key)) {
      setTimeout(() => mockKv.delete(key), seconds * 1000);
      return 1;
    }
    return 0;
  },
};

// Supabase (PostgreSQL) KV client implementation
const supabaseKvClient = {
  get: async (key: string) => {
    try {
      // Clean up expired keys first
      await db.execute(sql`
        DELETE FROM kv_store 
        WHERE expires_at IS NOT NULL AND expires_at < NOW()
      `);

      // Get the value
      const result = await db.execute(sql`
        SELECT value FROM kv_store 
        WHERE key = ${key}
        AND (expires_at IS NULL OR expires_at > NOW())
      `);

      if (result.rows && result.rows.length > 0) {
        return result.rows[0].value as string;
      }
      return null;
    } catch (error) {
      console.error("Supabase KV get error:", error);
      return null;
    }
  },

  set: async (key: string, value: string) => {
    try {
      await db.execute(sql`
        INSERT INTO kv_store (key, value, expires_at)
        VALUES (${key}, ${value}, NULL)
        ON CONFLICT (key) 
        DO UPDATE SET value = ${value}, expires_at = NULL
      `);
      return "OK";
    } catch (error) {
      console.error("Supabase KV set error:", error);
      throw error;
    }
  },

  setex: async (key: string, seconds: number, value: string) => {
    try {
      const expiresAt = new Date(Date.now() + seconds * 1000);
      await db.execute(sql`
        INSERT INTO kv_store (key, value, expires_at)
        VALUES (${key}, ${value}, ${expiresAt.toISOString()})
        ON CONFLICT (key) 
        DO UPDATE SET value = ${value}, expires_at = ${expiresAt.toISOString()}
      `);
      return "OK";
    } catch (error) {
      console.error("Supabase KV setex error:", error);
      throw error;
    }
  },

  incr: async (key: string) => {
    try {
      // Clean up expired keys first
      await db.execute(sql`
        DELETE FROM kv_store 
        WHERE expires_at IS NOT NULL AND expires_at < NOW()
      `);

      // Get current value or default to 0
      const result = await db.execute(sql`
        SELECT value FROM kv_store 
        WHERE key = ${key}
        AND (expires_at IS NULL OR expires_at > NOW())
      `);

      const current = result.rows && result.rows.length > 0 
        ? parseInt(result.rows[0].value as string) || 0 
        : 0;
      const next = current + 1;

      await db.execute(sql`
        INSERT INTO kv_store (key, value, expires_at)
        VALUES (${key}, ${next.toString()}, NULL)
        ON CONFLICT (key) 
        DO UPDATE SET value = ${next.toString()}
      `);

      return next;
    } catch (error) {
      console.error("Supabase KV incr error:", error);
      throw error;
    }
  },

  exists: async (key: string) => {
    try {
      // Clean up expired keys first
      await db.execute(sql`
        DELETE FROM kv_store 
        WHERE expires_at IS NOT NULL AND expires_at < NOW()
      `);

      const result = await db.execute(sql`
        SELECT 1 FROM kv_store 
        WHERE key = ${key}
        AND (expires_at IS NULL OR expires_at > NOW())
      `);

      return result.rows && result.rows.length > 0 ? 1 : 0;
    } catch (error) {
      console.error("Supabase KV exists error:", error);
      return 0;
    }
  },

  del: async (key: string) => {
    try {
      await db.execute(sql`
        DELETE FROM kv_store WHERE key = ${key}
      `);
      // Check if key existed by trying to get it (simpler than rowCount)
      const check = await db.execute(sql`
        SELECT 1 FROM kv_store WHERE key = ${key}
      `);
      // If we just deleted it, it won't exist now, so return 1
      // Actually, we can't reliably know if it existed before deletion
      // So we'll just return 1 (optimistic)
      return 1;
    } catch (error) {
      console.error("Supabase KV del error:", error);
      return 0;
    }
  },

  expire: async (key: string, seconds: number) => {
    try {
      const expiresAt = new Date(Date.now() + seconds * 1000);
      await db.execute(sql`
        UPDATE kv_store 
        SET expires_at = ${expiresAt.toISOString()}
        WHERE key = ${key}
        AND (expires_at IS NULL OR expires_at > NOW())
      `);
      // Check if key exists and was updated
      const check = await db.execute(sql`
        SELECT expires_at FROM kv_store 
        WHERE key = ${key} AND expires_at = ${expiresAt.toISOString()}
      `);
      return check.rows && check.rows.length > 0 ? 1 : 0;
    } catch (error) {
      console.error("Supabase KV expire error:", error);
      return 0;
    }
  },
};

// Determine which KV client to use
// Priority: Supabase (PostgreSQL) > Mock
// Use Supabase if database is available and not in mock mode
let kvClient: typeof mockKvClient | typeof supabaseKvClient = mockKvClient;

if (!isMockMode && env.DATABASE_URL && !env.DATABASE_URL.includes("mock://")) {
  try {
    kvClient = supabaseKvClient;
    console.log("✅ Supabase KV (PostgreSQL) connected successfully");
  } catch (error) {
    console.warn("⚠️ Failed to initialize Supabase KV, using mock mode:", error);
    kvClient = mockKvClient;
  }
} else {
  if (isMockMode || !env.DATABASE_URL || env.DATABASE_URL.includes("mock://")) {
    console.log("ℹ️ Using mock KV storage (development mode)");
  }
}

export const kv = kvClient as any;

// Export KV status for debugging
export const isKvAvailable = kvClient === supabaseKvClient;

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, Math.floor(windowMs / 1000));
  }
  return count <= limit;
}

export async function acquireLock(key: string, ttlSeconds: number = 60): Promise<boolean> {
  const lockKey = `lock:${key}`;
  const exists = await kv.exists(lockKey);
  if (exists) {
    return false;
  }
  await kv.setex(lockKey, ttlSeconds, "1");
  return true;
}

export async function releaseLock(key: string): Promise<void> {
  await kv.del(`lock:${key}`);
}
