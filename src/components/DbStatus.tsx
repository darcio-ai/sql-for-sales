import { useEffect, useState } from "react";
import { getDb } from "@/lib/db";

export type DbPhase = "loading" | "ready" | "error";

let phase: DbPhase = "loading";
let errorMessage = "";
const listeners = new Set<() => void>();

export function ensureDb() {
  if (typeof window === "undefined") return;
  getDb()
    .then(() => {
      phase = "ready";
    })
    .catch((e: unknown) => {
      phase = "error";
      errorMessage = e instanceof Error ? e.message : String(e);
    })
    .finally(() => listeners.forEach((l) => l()));
}

export function useDbPhase() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    ensureDb();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return { phase, errorMessage };
}

export function DbStatus() {
  const { phase: p, errorMessage: err } = useDbPhase();
  return (
    <div className="flex items-center gap-2 font-mono text-[0.7rem] text-muted-foreground">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          p === "ready" ? "bg-success" : p === "error" ? "bg-destructive" : "bg-warning"
        }`}
      />
      <span className="hidden sm:inline">
        {p === "ready" ? "postgres pronto" : p === "error" ? err.slice(0, 40) : "preparando…"}
      </span>
    </div>
  );
}

export function DbLoadingNotice() {
  const { phase: p, errorMessage: err } = useDbPhase();
  if (p === "ready") return null;
  return (
    <div className="panel mb-3 px-3 py-2 text-[0.8125rem] text-muted-foreground">
      {p === "error" ? (
        <span className="text-destructive">Falha ao iniciar o banco: {err}</span>
      ) : (
        "Preparando um PostgreSQL completo dentro do navegador (WebAssembly) e carregando a base de treino. Na primeira vez leva alguns segundos."
      )}
    </div>
  );
}
