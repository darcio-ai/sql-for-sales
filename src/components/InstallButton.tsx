import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallButton() {
  const [deferred, setDeferred] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(true);
  const [ios, setIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as PromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  if (!deferred && !ios) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="btn btn-ghost text-[0.75rem]"
        onClick={async () => {
          if (deferred) {
            await deferred.prompt();
            await deferred.userChoice;
            setDeferred(null);
            return;
          }
          setShowIosHelp((v) => !v);
        }}
      >
        <Download size={12} />
        Instalar no celular
      </button>
      {showIosHelp ? (
        <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
          No iPhone: toque em Compartilhar na barra do Safari e escolha{" "}
          <span className="font-mono">Adicionar à Tela de Início</span>.
        </p>
      ) : null}
    </div>
  );
}
