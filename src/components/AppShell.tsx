import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { List, SquareTerminal, Table2, BookOpen } from "lucide-react";
import { LICOES, blocos } from "@/lib/licoes";
import { useProgress } from "@/lib/progress";
import { SchemaExplorer } from "./SchemaExplorer";
import { DbStatus } from "./DbStatus";
import { ReseedButton } from "./ReseedButton";

function LessonNav() {
  const progress = useProgress();
  return (
    <nav className="text-[0.8125rem]">
      {blocos().map((b) => (
        <div key={b.bloco} className="mb-3">
          <div className="mb-1 px-1 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
            {b.bloco}. {b.nome}
          </div>
          {b.licoes.map((l) => {
            const estado = progress[l.id]?.estado ?? "nao_iniciada";
            return (
              <Link
                key={l.id}
                to="/licao/$id"
                params={{ id: l.id }}
                className="flex items-center gap-2 rounded-[3px] px-1.5 py-1 hover:bg-accent"
                activeProps={{ className: "bg-accent text-primary" }}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    estado === "resolvida"
                      ? "bg-success"
                      : estado === "resolvida_com_gabarito"
                        ? "bg-warning"
                        : "bg-border-strong"
                  }`}
                />
                <span className="font-mono text-muted-foreground">{l.id}</span>
                <span className="min-w-0 truncate">{l.titulo}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileTab, setMobileTab] = useState<"conteudo" | "referencia">("conteudo");
  const progress = useProgress();
  const solved = LICOES.filter((l) => (progress[l.id]?.estado ?? "nao_iniciada") !== "nao_iniciada")
    .length;

  const tabs = [
    { to: "/", label: "Lições", icon: List },
    { to: "/pratica", label: "Prática", icon: SquareTerminal },
    { to: "/referencia", label: "Referência", icon: Table2 },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <BookOpen size={16} className="shrink-0 text-primary" />
            <span className="truncate font-mono text-[0.9rem] font-semibold">
              SQL para quem vende
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden font-mono text-[0.75rem] text-muted-foreground sm:inline">
              {solved}/{LICOES.length}
            </span>
            <DbStatus />
          </div>
        </div>
        <div className="h-[2px] w-full bg-surface-2">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(solved / LICOES.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-4 px-3 py-4 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
        <aside className="hidden lg:block">
          <div className="sticky top-[68px] max-h-[calc(100vh-90px)] overflow-y-auto pr-1">
            <LessonNav />
          </div>
        </aside>

        <main className="min-w-0 pb-24 lg:pb-8">
          {/* Mobile tab switch between content and reference */}
          <div className="mb-3 flex gap-1 lg:hidden">
            <button
              type="button"
              className={`btn flex-1 ${mobileTab === "conteudo" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setMobileTab("conteudo")}
            >
              Conteúdo
            </button>
            <button
              type="button"
              className={`btn flex-1 ${mobileTab === "referencia" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setMobileTab("referencia")}
            >
              Referência
            </button>
          </div>
          <div className={mobileTab === "referencia" ? "lg:block" : "block"}>
            {mobileTab === "referencia" ? (
              <div className="lg:hidden">
                <SchemaExplorer />
              </div>
            ) : null}
            <div className={mobileTab === "referencia" ? "hidden lg:block" : "block"}>
              {children}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-border pt-3">
            <InstallButton />
            <ReseedButton />
          </div>

        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-[68px] max-h-[calc(100vh-90px)] overflow-y-auto pl-1">
            <SchemaExplorer />
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-surface lg:hidden">
        {tabs.map((t) => {
          const active =
            t.to === "/" ? pathname === "/" || pathname.startsWith("/licao") : pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              onClick={() => setMobileTab("conteudo")}
              className={`flex flex-col items-center gap-0.5 py-2 text-[0.7rem] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <t.icon size={17} />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
