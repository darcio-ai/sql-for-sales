import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

let session: Session | null = null;
let started = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function startAuthStore(onSignedIn?: (userId: string) => void) {
  if (started || typeof window === "undefined") return;
  started = true;

  void supabase.auth.getSession().then(({ data }) => {
    session = data.session;
    emit();
    if (session?.user.id) onSignedIn?.(session.user.id);
  });

  supabase.auth.onAuthStateChange((event, next) => {
    if (event === "TOKEN_REFRESHED") {
      session = next;
      return;
    }
    session = next;
    emit();
    if (event === "SIGNED_IN" && next?.user.id) onSignedIn?.(next.user.id);
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    subscribe,
    () => session,
    () => null,
  );
}

export function getCurrentUserId(): string | null {
  return session?.user.id ?? null;
}
