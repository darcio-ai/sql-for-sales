import type { QueryResult } from "@/lib/db";

function renderCell(value: unknown) {
  if (value === null || value === undefined) {
    return <span className="italic text-muted-foreground/60">NULL</span>;
  }
  if (value instanceof Date) return value.toISOString().replace("T", " ").replace("Z", "");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ResultTable({ result }: { result: QueryResult }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[0.75rem] text-muted-foreground">
        <span>
          {result.rows.length} {result.rows.length === 1 ? "linha" : "linhas"}
        </span>
        <span>{result.ms.toFixed(1)} ms</span>
      </div>
      <div className="max-h-[55vh] overflow-auto">
        <table className="w-full min-w-max border-collapse text-[0.8125rem]">
          <thead className="sticky top-0 z-10">
            <tr>
              {result.columns.map((c, i) => (
                <th
                  key={`${c}-${i}`}
                  className="whitespace-nowrap border-b border-border-strong bg-surface-2 px-3 py-1.5 text-left font-semibold text-foreground"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 1 ? "bg-surface-2/40" : undefined}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="whitespace-nowrap border-b border-border/60 px-3 py-1.5 text-foreground/85"
                  >
                    {renderCell(cell)}
                  </td>
                ))}
              </tr>
            ))}
            {result.rows.length === 0 && (
              <tr>
                <td
                  colSpan={Math.max(result.columns.length, 1)}
                  className="px-3 py-4 text-center text-muted-foreground"
                >
                  Nenhuma linha retornada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
