import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@handwerker/shared-types";

/**
 * Service-role client. Bypasses RLS entirely — only ever import this from
 * Server Actions/Route Handlers, and only for the narrow set of privileged
 * operations called out in the plan: company signup (creating the first
 * owner profile) and inviting new employees.
 */
export function createAdminSupabaseClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
