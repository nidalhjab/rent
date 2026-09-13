"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/messages/ar";

type InstallPromptEvent = Event & { prompt: () => Promise<void> };

/** Only renders where the browser actually offers an install prompt. */
export function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  if (!installPrompt) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="hidden sm:inline-flex"
      onClick={async () => {
        await installPrompt.prompt();
        setInstallPrompt(null);
      }}
    >
      {t.nav.install}
    </Button>
  );
}
