import { useNavigate } from "@tanstack/react-router";
import { Play, Copy, Check } from "lucide-react";
import { useState } from "react";
import { setActiveLesson, setEditorSql } from "@/lib/progress";

type Props = {
  code: string;
  variant?: "default" | "error";
  showRun?: boolean;
  showCopy?: boolean;
  lessonId?: string;
};

export function CodeBlock({
  code,
  variant = "default",
  showRun = true,
  showCopy = false,
  lessonId,
}: Props) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-[4px] border ${
        variant === "error" ? "border-destructive/60" : "border-border-strong"
      } bg-[oklch(0.145_0.008_250)]`}
    >
      <pre className="overflow-x-auto p-3 text-[0.8125rem] leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
      {(showRun || showCopy) && (
        <div className="flex flex-wrap gap-2 border-t border-border px-2 py-1.5">
          {showRun && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (lessonId) setActiveLesson(lessonId);
                setEditorSql(code);
                void navigate({ to: "/pratica" });
              }}
            >
              <Play size={13} /> Rodar no editor
            </button>
          )}
          {showCopy && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                void navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copiado" : "Copiar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
