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
  _browser = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _browser;
}
