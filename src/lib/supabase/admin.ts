import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

/**
 * Service-role Supabase client that bypasses RLS.
 * Use ONLY in trusted server contexts (webhooks, background jobs).
 * Never expose this client to user-facing code paths.
 */
export function createAdminClient() {
  const config = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!config) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Required for admin operations (webhooks, credit management)."
    );
  }

  return createClient(config.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
