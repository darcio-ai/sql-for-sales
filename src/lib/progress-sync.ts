import { supabase } from "@/integrations/supabase/client";
import {
  getAllProgress,
  mergeRemoteProgress,
  setProgressSyncHook,
  type LessonState,
  type ProgressEntry,
} from "./progress";

type Row = { lesson_id: string; estado: string; query: string };

const ESTADOS: LessonState[] = ["nao_iniciada", "resolvida", "resolvida_com_gabarito"];

function toEstado(value: string): LessonState {
  return (ESTADOS as string[]).includes(value) ? (value as LessonState) : "nao_iniciada";
}

async function upsertMany(userId: string, entries: Record<string, ProgressEntry>) {
  const rows = Object.entries(entries).map(([lesson_id, e]) => ({
    user_id: userId,
    lesson_id,
    estado: e.estado,
    query: e.query,
    updated_at: new Date().toISOString(),
  }));
  if (!rows.length) return;
  const { error } = await supabase
    .from("lesson_progress")
    .upsert(rows, { onConflict: "user_id,lesson_id" });
  if (error) console.error("Falha ao sincronizar progresso:", error.message);
}

/** Baixa o progresso da nuvem, mescla com o local e devolve o que faltava lá. */
export async function syncProgress(userId: string) {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, estado, query")
    .eq("user_id", userId);

  if (error) {
    console.error("Falha ao carregar progresso:", error.message);
    return;
  }

  const remote: Record<string, ProgressEntry> = {};
  for (const row of (data ?? []) as Row[]) {
    remote[row.lesson_id] = { estado: toEstado(row.estado), query: row.query ?? "" };
  }

  const toPush = mergeRemoteProgress(remote);
  await upsertMany(userId, toPush);

  setProgressSyncHook((lessonId, entry) => {
    void upsertMany(userId, { [lessonId]: entry });
  });
}

export function stopProgressSync() {
  setProgressSyncHook(null);
}

export function localProgressCount(): number {
  return Object.values(getAllProgress()).filter((e) => e.estado !== "nao_iniciada").length;
}
