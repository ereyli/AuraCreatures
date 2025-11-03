// Supabase client for database operations
import { createClient } from "@supabase/supabase-js";
import { env } from "../env.mjs";

// Initialize Supabase client
export const supabase = env.SUPABASE_URL && env.SUPABASE_ANON_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  : null;

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return !!supabase && !!env.SUPABASE_URL && !!env.SUPABASE_ANON_KEY;
};

