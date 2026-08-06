import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { LICOES, getLicao } from "@/lib/licoes";
import { setActiveLesson, useProgress, stateLabel, type LessonState } from "@/lib/progress";

export const Route = createFileRoute("/licao/$id")({
  head: ({ params }) => {
    const l = getLicao(params.id);
    const title = l ? `${l.id} — ${l.titulo} | SQL para quem vende` : "Lição | SQL para quem vende";
    const desc = l?.pergunta_negocio ?? "Lição de SQL para times comerciais.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: LicaoPage,
});

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 font-mono text-[0.75rem] uppercase tracking-wider text-muted-foreground">
        {label}
      </h2>
      {children}
    </section>
  );
}

function LicaoPage() {
  const { id } = Route.useParams();
  const licao = getLicao(id);
  const progress = useProgress();

  useEffect(() => {
    if (licao) setActiveLesson(licao.id);
  }, [licao]);

  if (!licao) {
    notFound();
    return null;
  }

  const estado: LessonState = progress[licao.id]?.estado ?? "nao_iniciada";
  const idx = LICOES.findIndex((l) => l.id === licao.id);
  const prev = LICOES[idx - 1];
  const next = LICOES[idx + 1];

  return (
    <AppShell>
      <div className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
        Bloco {licao.bloco} — {licao.bloco_nome}
      </div>
      <h1 className="mt-1 text-lg font-semibold">
        <span className="mr-2 font-mono text-primary">{licao.id}</span>
        {licao.titulo}
      </h1>
      <p className="mt-1 text-[0.875rem] text-muted-foreground">{licao.pergunta_negocio}</p>
      <div className="mt-2 flex flex-wrap gap-2 font-mono text-[0.7rem] text-muted-foreground">
        <span className="rounded-[3px] border border-border px-1.5 py-0.5">
          {licao.duracao_min} min
        </span>
        <span className="rounded-[3px] border border-border px-1.5 py-0.5">
          {stateLabel[estado]}
        </span>
      </div>

      <Section label="O conceito">
        <Markdown>{licao.conceito}</Markdown>
      </Section>

      <Section label="A sintaxe">
        <CodeBlock code={licao.sintaxe.codigo} lessonId={licao.id} />
        <div className="mt-2">
          <Markdown>{licao.sintaxe.explicacao}</Markdown>
        </div>
      </Section>

      {licao.inversao && (
        <section className="mt-6 rounded-[4px] border-l-2 border-primary bg-surface px-3 py-2.5">
          <div className="mb-1 font-mono text-[0.75rem] font-semibold text-primary">
            Inversão — {licao.inversao.titulo}
          </div>
          <Markdown>{licao.inversao.texto}</Markdown>
        </section>
      )}

      <Section label="A variação">
        <CodeBlock code={licao.variacao.codigo} lessonId={licao.id} />
        <div className="mt-2">
          <Markdown>{licao.variacao.explicacao}</Markdown>
        </div>
      </Section>

      <Section label="O erro clássico">
        <div className="rounded-[4px] border border-destructive/50 bg-destructive/5 p-2">
          <CodeBlock code={licao.erro_classico.codigo} lessonId={licao.id} variant="error" />
          <pre className="mt-2 overflow-x-auto rounded-[3px] border border-destructive/40 bg-[oklch(0.145_0.008_250)] p-2.5 text-[0.75rem] leading-relaxed text-destructive">
            <code>{licao.erro_classico.mensagem}</code>
          </pre>
          <div className="mt-2">
            <Markdown>{licao.erro_classico.explicacao}</Markdown>
          </div>
        </div>
      </Section>

      <Section label="Exercício">
        <div className="panel px-3 py-2.5">
          <Markdown>{licao.exercicio.enunciado}</Markdown>
          {licao.exercicio.resultado_esperado && (
            <p className="mt-2 font-mono text-[0.75rem] text-muted-foreground">
              Resultado esperado: {licao.exercicio.resultado_esperado}
            </p>
          )}
          <Link
            to="/pratica"
            onClick={() => setActiveLesson(licao.id)}
            className="btn btn-primary mt-3"
          >
            Resolver na prática
          </Link>
        </div>
        {licao.pratica_extra && licao.pratica_extra.length > 0 && (
          <div className="mt-3">
            <div className="mb-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
              Prática extra
            </div>
            <ul className="space-y-1.5">
              {licao.pratica_extra.map((p, i) => (
                <li key={i} className="panel px-3 py-2 text-[0.875rem]">
                  <Markdown>{p.enunciado}</Markdown>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <div className="mt-8 flex justify-between gap-2">
        {prev ? (
          <Link to="/licao/$id" params={{ id: prev.id }} className="btn btn-ghost">
            ← {prev.id}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/licao/$id" params={{ id: next.id }} className="btn btn-ghost">
            {next.id} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </AppShell>
  );
}
