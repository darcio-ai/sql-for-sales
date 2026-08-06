import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DbLoadingNotice } from "@/components/DbStatus";
import { LICOES, blocos } from "@/lib/licoes";
import { useProgress, stateLabel, type LessonState } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SQL para quem vende — curso prático de SQL no navegador" },
      {
        name: "description",
        content:
          "14 lições de SQL para times comerciais, com um PostgreSQL de verdade rodando no navegador e uma base de CRM para praticar.",
      },
      { property: "og:title", content: "SQL para quem vende" },
      {
        property: "og:description",
        content:
          "Aprenda SQL respondendo perguntas de negócio, com editor e PostgreSQL rodando direto no navegador.",
      },
    ],
  }),
  component: Home,
});

function Badge({ estado }: { estado: LessonState }) {
  const color =
    estado === "resolvida"
      ? "text-success border-success/40"
      : estado === "resolvida_com_gabarito"
        ? "text-warning border-warning/40"
        : "text-muted-foreground border-border";
  return (
    <span className={`shrink-0 rounded-[3px] border px-1.5 py-0.5 font-mono text-[0.65rem] ${color}`}>
      {stateLabel[estado]}
    </span>
  );
}

function Home() {
  const progress = useProgress();
  const solved = LICOES.filter(
    (l) => (progress[l.id]?.estado ?? "nao_iniciada") !== "nao_iniciada",
  ).length;

  return (
    <AppShell>
      <DbLoadingNotice />
      <h1 className="font-mono text-lg font-semibold">SQL para quem vende</h1>
      <p className="mt-1 text-[0.875rem] text-muted-foreground">
        14 lições sobre uma base de CRM com 900 negócios. Tudo roda no seu navegador.
      </p>

      <div className="panel mt-3 px-3 py-2">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[0.75rem] text-muted-foreground">
          <span>Progresso</span>
          <span>
            {solved}/{LICOES.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(solved / LICOES.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {blocos().map((b) => (
          <section key={b.bloco}>
            <h2 className="mb-2 font-mono text-[0.75rem] uppercase tracking-wider text-muted-foreground">
              Bloco {b.bloco} — {b.nome}
            </h2>
            <ul className="space-y-1.5">
              {b.licoes.map((l) => {
                const estado = progress[l.id]?.estado ?? "nao_iniciada";
                return (
                  <li key={l.id}>
                    <Link
                      to="/licao/$id"
                      params={{ id: l.id }}
                      className="panel block px-3 py-2 transition-colors hover:border-border-strong hover:bg-surface-2"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-baseline gap-2">
                            <span className="shrink-0 font-mono text-[0.75rem] text-primary">
                              {l.id}
                            </span>
                            <span className="truncate font-medium">{l.titulo}</span>
                          </div>
                          <p className="mt-0.5 truncate text-[0.8125rem] text-muted-foreground">
                            {l.pergunta_negocio}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge estado={estado} />
                          <span className="font-mono text-[0.7rem] text-muted-foreground">
                            {l.duracao_min} min
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
