import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase Admin (côté serveur uniquement)
 * Utilise SUPABASE_SERVICE_ROLE_KEY pour contourner RLS
 * 
 * ⚠️ NE JAMAIS exposer cette clé au client
 * ⚠️ À utiliser UNIQUEMENT dans les Server Actions et routes API
 */
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase admin credentials are missing. Check .env.local: " +
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
