import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@handwerker/shared-types";

/** Browser-side client for client components (e.g. interactive forms with optimistic UI). */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
