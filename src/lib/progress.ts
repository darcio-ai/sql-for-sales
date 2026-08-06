import { useSyncExternalStore } from "react";

export type LessonState = "nao_iniciada" | "resolvida" | "resolvida_com_gabarito";

type Entry = { estado: LessonState; query: string };
type Store = Record<string, Entry>;

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
    () => ({}) as Store,
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

export function setLessonQuery(id: string, query: string) {
  load();
  store = { ...store, [id]: { ...getEntry(id), query } };
  persist();
  emit();
}

export function setLessonState(id: string, estado: LessonState) {
  load();
  const current = getEntry(id);
  if (current.estado === "resolvida" && estado === "resolvida_com_gabarito") return;
  store = { ...store, [id]: { ...current, estado } };
  persist();
  emit();
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
