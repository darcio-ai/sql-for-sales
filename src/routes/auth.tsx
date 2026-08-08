import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — sincronizar progresso | SQL para quem vende" },
      {
        name: "description",
        content:
          "Entre com e-mail ou Google para sincronizar seu progresso das lições entre celular e computador.",
      },
      { property: "og:title", content: "Entrar | SQL para quem vende" },
      {
        property: "og:description",
        content: "Sincronize o progresso das lições entre todos os seus aparelhos.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setMsg({ ok: true, text: "Conta criada. Confirme o e-mail que enviamos para entrar." });
          return;
        }
        void navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        void navigate({ to: "/" });
      }
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    setMsg(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      setMsg({ ok: false, text: "Não foi possível entrar com Google." });
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/" });
  }

  return (
    <AppShell>
      <h1 className="font-mono text-base font-semibold">Entrar</h1>
      <p className="mt-1 text-[0.8125rem] text-muted-foreground">
        Sua conta guarda o progresso das lições na nuvem, para continuar de onde parou em qualquer
        aparelho. A base de treino continua no próprio navegador.
      </p>

      <div className="panel mt-3 max-w-md px-3 py-3">
        <button type="button" className="btn w-full" disabled={busy} onClick={google}>
          Entrar com Google
        </button>

        <div className="my-3 flex items-center gap-2 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-2">
          <label className="text-[0.75rem] text-muted-foreground" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[3px] border border-border bg-surface-2 px-2 py-1.5 font-mono text-[0.8125rem] outline-none focus:border-primary"
          />
          <label className="mt-1 text-[0.75rem] text-muted-foreground" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "criar" ? "new-password" : "current-password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="rounded-[3px] border border-border bg-surface-2 px-2 py-1.5 font-mono text-[0.8125rem] outline-none focus:border-primary"
          />
          <button type="submit" className="btn btn-primary mt-2" disabled={busy}>
            {mode === "criar" ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-ghost mt-2 w-full"
          onClick={() => {
            setMode(mode === "entrar" ? "criar" : "entrar");
            setMsg(null);
          }}
        >
          {mode === "entrar" ? "Não tenho conta" : "Já tenho conta"}
        </button>

        {msg && (
          <div
            className={`mt-3 rounded-[4px] border px-3 py-2 text-[0.8125rem] ${
              msg.ok
                ? "border-success/50 bg-success/10 text-success"
                : "border-destructive/50 bg-destructive/10 text-destructive"
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>
    </AppShell>
  );
}
