"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _browser: SupabaseClient | null = null;

/**
 * Singleton browser — patrón Singleton (GoF).
 * Una sola instancia del cliente Supabase en el cliente.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (_browser) return _browser;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el cliente");
  }

  _browser = createBrowserClient(url, key);
  return _browser;
}
