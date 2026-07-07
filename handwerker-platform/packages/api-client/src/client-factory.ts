import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@handwerker/shared-types";

/**
 * Every function in this package takes an already-configured SupabaseClient
 * as its first argument instead of constructing its own. The web app
 * (server components/actions) and the Expo app each build their own client
 * with platform-appropriate session storage, then pass it in here — that's
 * how business logic stays identical across both without duplicating it.
 */
export type HandwerkerSupabaseClient = SupabaseClient<Database>;
