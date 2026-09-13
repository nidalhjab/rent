"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/messages/ar";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Only renders where the browser actually offers an install prompt. */
export function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    const capture = (event: Event) => {
      // Chrome's own mini-infobar is suppressed so the prompt stays in our UI.
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const installed = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!installPrompt) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t.nav.install}
      className="px-2.5 sm:px-3.5"
      onClick={async () => {
        await installPrompt.prompt();
        await installPrompt.userChoice;
        setInstallPrompt(null);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 20h16" />
      </svg>
      <span className="hidden sm:inline">{t.nav.install}</span>
    </Button>
  );
}
