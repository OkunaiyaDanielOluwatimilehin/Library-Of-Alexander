/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

// Initialize the Supabase Client. If missing, we supply mock strings to prevent crashing at setup,
// but expose a configuration check utility for our hooks to handle gracefully/alert the user.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== "https://your-supabase-url.supabase.co" &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== "your-supabase-anon-key"
  );
};
