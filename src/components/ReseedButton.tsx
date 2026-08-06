import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { reseed } from "@/lib/db";

export function ReseedButton() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="btn btn-ghost text-[0.75rem]"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm("Recriar a base de dados do zero? Seu progresso é preservado.")) return;
        setBusy(true);
        try {
          await reseed();
          setDone(true);
          setTimeout(() => setDone(false), 2500);
        } catch (e) {
          window.alert(e instanceof Error ? e.message : String(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      <RotateCcw size={12} />
      {busy ? "Recriando…" : done ? "Base recriada" : "Recriar base de dados"}
    </button>
  );
}
