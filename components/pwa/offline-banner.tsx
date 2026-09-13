"use client";

import { useOffline } from "next/offline";
import { t } from "@/messages/ar";

export function OfflineBanner() {
  const isOffline = useOffline();
  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="bg-warning-soft px-4 py-2 text-center text-sm font-medium text-warning"
    >
      {t.offline.banner}
    </div>
  );
}
