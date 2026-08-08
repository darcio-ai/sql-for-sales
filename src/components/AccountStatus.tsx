import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startAuthStore, useSession } from "@/lib/auth-store";
import { syncProgress, stopProgressSync } from "@/lib/progress-sync";

export function AccountStatus() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    startAuthStore((userId) => {
      void syncProgress(userId);
    });
  }, []);

  if (!session) {
    return (
      <Link to="/auth" className="font-mono text-[0.75rem] text-primary hover:underline">
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[160px] truncate font-mono text-[0.7rem] text-muted-foreground sm:inline"
        title={session.user.email ?? ""}
      >
        {session.user.email}
      </span>
      <button
        type="button"
        className="font-mono text-[0.75rem] text-muted-foreground hover:text-foreground"
        onClick={async () => {
          stopProgressSync();
          await supabase.auth.signOut();
          void navigate({ to: "/" });
        }}
      >
        Sair
      </button>
    </div>
  );
}
