import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabase = client;

export function hasSupabase(): boolean {
  return client !== null;
}

// Untyped Client — Type-Safety lebt in den Mapper-Funktionen unter
// src/lib/storage/supabase/. Bei Schema-Aenderungen muessen die Mapper aktualisiert werden.
export type AppSupabaseClient = SupabaseClient;
