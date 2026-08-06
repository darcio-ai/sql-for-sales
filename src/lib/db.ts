import type { PGlite } from "@electric-sql/pglite";
import seedSql from "@/data/seed.sql?raw";

export type QueryResult = {
  columns: string[];
  rows: unknown[][];
  ms: number;
};

let dbPromise: Promise<PGlite> | null = null;

async function init(): Promise<PGlite> {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite("idb://sqlvende");
  await db.waitReady;
  const check = await db.query<{ exists: boolean }>(
    "select exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'deals') as exists",
  );
  if (!check.rows[0]?.exists) {
    await db.exec(seedSql);
  }
  return db;
}

export function getDb(): Promise<PGlite> {
  if (!dbPromise) dbPromise = init();
  return dbPromise;
}

export async function reseed(): Promise<void> {
  const db = await getDb();
  await db.exec(seedSql);
}

export async function runQuery(sql: string): Promise<QueryResult> {
  const db = await getDb();
  const started = performance.now();
  const res = await db.query(sql, [], { rowMode: "array" });
  const ms = performance.now() - started;
  return {
    columns: (res.fields ?? []).map((f) => f.name),
    rows: (res.rows ?? []) as unknown[][],
    ms,
  };
}
