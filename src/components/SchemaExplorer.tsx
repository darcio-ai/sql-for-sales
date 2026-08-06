import { SCHEMA } from "@/lib/schema";
import { setEditorSql, useEditorSql } from "@/lib/progress";

export function SchemaExplorer() {
  const current = useEditorSql();

  const insert = (text: string) => {
    const sep = current.length === 0 || /\s$/.test(current) ? "" : " ";
    setEditorSql(current + sep + text);
  };

  return (
    <div className="text-[0.8125rem]">
      <div className="mb-2 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
        Schema — clique para inserir no editor
      </div>
      <div className="space-y-3">
        {SCHEMA.map((t) => (
          <div key={t.name} className="panel overflow-hidden">
            <button
              type="button"
              onClick={() => insert(t.name)}
              className="w-full border-b border-border bg-surface-2 px-2.5 py-1.5 text-left font-mono font-semibold text-primary hover:bg-accent"
            >
              {t.name}
            </button>
            <ul>
              {t.columns.map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => insert(c.name)}
                    className="flex w-full items-baseline justify-between gap-3 px-2.5 py-1 text-left font-mono hover:bg-accent"
                  >
                    <span className="text-foreground/85">{c.name}</span>
                    <span className="shrink-0 text-[0.7rem] text-muted-foreground">{c.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
