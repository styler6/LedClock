import { useEffect, useState } from "react";
import { getCurrentProfile } from "@handwerker/api-client";
import type { Profile } from "@handwerker/shared-types";
import { supabase } from "./supabase";

export function useCurrentProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentProfile(supabase).then((result) => {
      if (!cancelled) {
        setProfile(result);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, isLoading };
}
