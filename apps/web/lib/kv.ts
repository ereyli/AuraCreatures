import { createClient } from "@vercel/kv";
import { env, isMockMode } from "../env.mjs";

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

// Real KV client
let realKv: ReturnType<typeof createClient> | null = null;

if (!isMockMode && env.KV_REST_API_URL && !env.KV_REST_API_URL.includes("localhost")) {
  try {
    realKv = createClient({
      url: env.KV_REST_API_URL,
      token: env.KV_REST_API_TOKEN || "",
    });
  } catch (error) {
    console.warn("Failed to connect to KV, using mock mode:", error);
  }
}

export const kv = (isMockMode || !realKv ? mockKvClient : realKv) as any;

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
