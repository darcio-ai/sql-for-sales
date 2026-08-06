import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Markdown } from "@/components/Markdown";
import { ResultTable } from "@/components/ResultTable";
import { DbLoadingNotice } from "@/components/DbStatus";
import { runQuery, type QueryResult } from "@/lib/db";
import { compareResults } from "@/lib/normalize";
import { getLicao } from "@/lib/licoes";
import {
  setEditorSql,
  setLessonQuery,
  setLessonState,
  useActiveLesson,
  useEditorSql,
  getEntry,
} from "@/lib/progress";

const SqlEditor = lazy(() => import("@/components/SqlEditor"));

export const Route = createFileRoute("/pratica")({
  head: () => ({
    meta: [
      { title: "Prática — editor SQL | SQL para quem vende" },
      {
        name: "description",
        content:
          "Escreva e execute queries SQL em um PostgreSQL real rodando no navegador, sobre uma base de CRM de treino.",
      },
      { property: "og:title", content: "Prática — editor SQL | SQL para quem vende" },
      {
        property: "og:description",
        content: "Execute, verifique sua resposta e compare com o gabarito da lição.",
      },
    ],
  }),
  component: Pratica,
});

function Pratica() {
  const sqlText = useEditorSql();
  const activeId = useActiveLesson();
  const licao = activeId ? getLicao(activeId) : undefined;

  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [showDica, setShowDica] = useState(false);
  const [showGabarito, setShowGabarito] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!licao) return;
    const saved = getEntry(licao.id).query;
    if (saved && !sqlText) setEditorSql(saved);
    setShowDica(false);
    setShowGabarito(false);
    setFeedback(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licao?.id]);

  const onChange = (v: string) => {
    setEditorSql(v);
    if (licao) setLessonQuery(licao.id, v);
  };

  async function executar() {
    setBusy(true);
    setError(null);
    setFeedback(null);
    try {
      setResult(await runQuery(sqlText));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function verificar() {
    if (!licao) return;
    setBusy(true);
    setError(null);
    setFeedback(null);
    try {
      const mine = await runQuery(sqlText);
      setResult(mine);
      const expected = await runQuery(licao.exercicio.gabarito);
      const outcome = compareResults(mine, expected);
      setFeedback({ ok: outcome.correct, text: outcome.message });
      if (outcome.correct) setLessonState(licao.id, "resolvida");
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <DbLoadingNotice />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h1 className="min-w-0 truncate font-mono text-base font-semibold">
          Prática
          {licao && (
            <span className="ml-2 text-[0.8125rem] font-normal text-muted-foreground">
              {licao.id} · {licao.titulo}
            </span>
          )}
        </h1>
        {licao && (
          <Link to="/licao/$id" params={{ id: licao.id }} className="btn btn-ghost shrink-0">
            Ver lição
          </Link>
        )}
      </div>

      {licao && (
        <div className="panel mt-2 px-3 py-2">
          <Markdown>{licao.exercicio.enunciado}</Markdown>
        </div>
      )}

      <div className="panel mt-3 overflow-hidden">
        <ClientOnly
          fallback={<div className="min-h-[200px] bg-[oklch(0.145_0.008_250)]" aria-hidden />}
        >
          <Suspense
            fallback={<div className="min-h-[200px] bg-[oklch(0.145_0.008_250)]" aria-hidden />}
          >
            <SqlEditor value={sqlText} onChange={onChange} />
          </Suspense>
        </ClientOnly>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" disabled={busy} onClick={executar}>
          Executar
        </button>
        <button
          type="button"
          className="btn"
          disabled={busy || !licao}
          onClick={verificar}
          title={licao ? undefined : "Abra uma lição para verificar"}
        >
          Verificar resposta
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!licao}
          onClick={() => setShowDica((v) => !v)}
        >
          Ver dica
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!licao}
          onClick={() => {
            if (!licao) return;
            if (
              !window.confirm(
                "Ver o gabarito marca esta lição como resolvida com ajuda. Continuar?",
              )
            )
              return;
            setLessonState(licao.id, "resolvida_com_gabarito");
            setShowGabarito(true);
          }}
        >
          Ver gabarito
        </button>
      </div>

      {showDica && licao && (
        <div className="panel mt-3 border-l-2 border-primary px-3 py-2">
          <Markdown>{licao.exercicio.dica}</Markdown>
        </div>
      )}

      {showGabarito && licao && (
        <div className="mt-3">
          <div className="mb-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
            Gabarito
          </div>
          <CodeBlock code={licao.exercicio.gabarito} lessonId={licao.id} showCopy />
        </div>
      )}

      {feedback && (
        <div
          className={`mt-3 rounded-[4px] border px-3 py-2 text-[0.8125rem] ${
            feedback.ok
              ? "border-success/50 bg-success/10 text-success"
              : "border-warning/50 bg-warning/10 text-warning"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {error && (
        <div className="mt-3">
          <div className="mb-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-destructive">
            Erro do PostgreSQL
          </div>
          <pre className="overflow-x-auto rounded-[4px] border border-destructive/50 bg-[oklch(0.145_0.008_250)] p-3 text-[0.78rem] leading-relaxed whitespace-pre-wrap text-destructive">
            <code>{error}</code>
          </pre>
        </div>
      )}

      {result && (
        <div className="mt-3">
          <ResultTable result={result} />
        </div>
      )}
    </AppShell>
  );
}
