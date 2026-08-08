import { useSyncExternalStore } from "react";

export type LessonState = "nao_iniciada" | "resolvida" | "resolvida_com_gabarito";

type Entry = { estado: LessonState; query: string };
type Store = Record<string, Entry>;

const EMPTY: Store = {};
const KEY = "sqlvende:progress";
const EDITOR_KEY = "sqlvende:editor";

let store: Store = {};
let editorSql = "";
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    store = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    store = {};
  }
  editorSql = localStorage.getItem(EDITOR_KEY) ?? "";
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
    localStorage.setItem(EDITOR_KEY, editorSql);
  } catch {
    /* ignore */
  }
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProgress(): Store {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return store;
    },
    () => EMPTY,
  );
}

export function useEditorSql(): string {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return editorSql;
    },
    () => "",
  );
}

export function setEditorSql(sql: string) {
  load();
  editorSql = sql;
  persist();
  emit();
}

export function getEntry(id: string): Entry {
  load();
  return store[id] ?? { estado: "nao_iniciada", query: "" };
}

export type ProgressEntry = Entry;

let syncHook: ((id: string, entry: Entry) => void) | null = null;

export function setProgressSyncHook(fn: ((id: string, entry: Entry) => void) | null) {
  syncHook = fn;
}

export function getAllProgress(): Store {
  load();
  return store;
}

const RANK: Record<LessonState, number> = {
  nao_iniciada: 0,
  resolvida_com_gabarito: 1,
  resolvida: 2,
};

/** Une o progresso remoto com o local e devolve o que precisa subir para a nuvem. */
export function mergeRemoteProgress(remote: Record<string, Entry>): Record<string, Entry> {
  load();
  const merged: Store = { ...store };
  const toPush: Record<string, Entry> = {};

  const ids = new Set([...Object.keys(store), ...Object.keys(remote)]);
  for (const id of ids) {
    const local = store[id] ?? { estado: "nao_iniciada" as LessonState, query: "" };
    const cloud = remote[id] ?? { estado: "nao_iniciada" as LessonState, query: "" };
    const estado = RANK[local.estado] >= RANK[cloud.estado] ? local.estado : cloud.estado;
    const query = local.query || cloud.query;
    merged[id] = { estado, query };
    if (estado !== cloud.estado || query !== cloud.query) toPush[id] = merged[id];
  }

  store = merged;
  persist();
  emit();
  return toPush;
}

export function setLessonQuery(id: string, query: string) {
  load();
  const entry = { ...getEntry(id), query };
  store = { ...store, [id]: entry };
  persist();
  emit();
  syncHook?.(id, entry);
}

export function setLessonState(id: string, estado: LessonState) {
  load();
  const current = getEntry(id);
  if (current.estado === "resolvida" && estado === "resolvida_com_gabarito") return;
  const entry = { ...current, estado };
  store = { ...store, [id]: entry };
  persist();
  emit();
  syncHook?.(id, entry);
}

export const stateLabel: Record<LessonState, string> = {
  nao_iniciada: "não iniciada",
  resolvida: "resolvida",
  resolvida_com_gabarito: "resolvida com gabarito",
};

const ACTIVE_KEY = "sqlvende:active";
let activeLesson = "";
let activeLoaded = false;

function loadActive() {
  if (activeLoaded || typeof window === "undefined") return;
  activeLoaded = true;
  activeLesson = localStorage.getItem(ACTIVE_KEY) ?? "";
}

export function setActiveLesson(id: string) {
  loadActive();
  activeLesson = id;
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* ignore */
  }
  emit();
}

export function useActiveLesson(): string {
  return useSyncExternalStore(
    subscribe,
    () => {
      loadActive();
      return activeLesson;
    },
    () => "",
  );
}
