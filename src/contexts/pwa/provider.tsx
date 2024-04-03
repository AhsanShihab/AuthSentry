import React, { useContext, useEffect, useState } from "react";
import { PWAContext } from "./context";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(true);
  const [prompter, setPrompter] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setIsInstalled(false);
      setPrompter(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("transitionend", handler);
  }, []);

  const install = async () => {
    if (!prompter) {
      return;
    }
    const { outcome } = await prompter.prompt();
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
  };

  return (
    <PWAContext.Provider value={[isInstalled, install]}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("PWA context is not available on this component");
  }
  return context;
}
