"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AuthState = {
  loading: boolean;
  loggedIn: boolean;
  /** profiles.status — "pending" | "approved" | "rejected", or null when logged out. */
  status: string | null;
};

// Client-side auth + approval status, kept in sync with sign in/out. Used by
// chrome that needs to reflect the gate (e.g. the cart drawer).
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ loading: true, loggedIn: false, status: null });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setState({ loading: false, loggedIn: false, status: null });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();
      if (active) setState({ loading: false, loggedIn: true, status: profile?.status ?? "pending" });
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
