import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (url && anonKey) {
  // Haeufiger Tippfehler: Supabase-Projekte enden auf .supabase.co, nicht .com.
  if (/\.supabase\.com\/?$/.test(url)) {
    console.warn(
      '[JaPerPo] VITE_SUPABASE_URL endet auf ".supabase.com" — Supabase-Projekte enden auf ".supabase.co". Bitte ENV pruefen.',
    );
  }
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
