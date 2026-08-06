import type { QueryResult } from "./db";

function normalizeCell(value: unknown): string {
  if (value === null || value === undefined) return "\u0000null";
  if (value instanceof Date) return value.toISOString();
  const raw = typeof value === "object" ? JSON.stringify(value) : String(value);
  const trimmed = raw.trim();
  const num = Number(trimmed);
  if (trimmed !== "" && Number.isFinite(num)) {
    return (Math.round(num * 100) / 100).toFixed(2);
  }
  return trimmed.toLowerCase();
}

export function normalizeResult(result: QueryResult): string[] {
  return result.rows.map((row) => row.map(normalizeCell).join("\u0001")).sort();
}

export type CheckOutcome = {
  correct: boolean;
  message: string;
};

export function compareResults(user: QueryResult, expected: QueryResult): CheckOutcome {
  const a = normalizeResult(user);
  const b = normalizeResult(expected);

  if (a.length === b.length && a.every((line, i) => line === b[i])) {
    return { correct: true, message: "Resultado correto" };
  }

  const parts: string[] = [];
  parts.push(`Linhas esperadas: ${b.length} — obtidas: ${a.length}.`);
  parts.push(
    `Colunas esperadas: ${expected.columns.length} (${expected.columns.join(", ") || "—"}) — obtidas: ${user.columns.length} (${user.columns.join(", ") || "—"}).`,
  );

  if (b.length > 0 && a.length > b.length && a.length % b.length === 0) {
    parts.push(
      "Sua query provavelmente sofreu fan-out: um join está multiplicando linhas.",
    );
  } else if (a.length === b.length) {
    parts.push("A quantidade de linhas bate, mas os valores não. Confira agregações, filtros e arredondamentos.");
  }

  return { correct: false, message: parts.join(" ") };
}
