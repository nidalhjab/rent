"use client";

import { useSyncExternalStore } from "react";
import { AvailabilityBadge } from "@/components/item/item-badges";
import type { Availability } from "@/lib/generated/prisma/enums";
import { formatBookingDate, nextAvailabilityAfterReservation, todayInPalestine } from "@/lib/booking-dates";
import { t } from "@/messages/ar";

function subscribeToDateChange(notify: () => void) {
  const timer = window.setInterval(notify, 30_000);
  window.addEventListener("focus", notify);
  document.addEventListener("visibilitychange", notify);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", notify);
    document.removeEventListener("visibilitychange", notify);
  };
}

export function ReservationStatus({ availability, bookedStarts, initialToday, compact = false }: {
  availability: Availability;
  bookedStarts: string[];
  initialToday: string;
  compact?: boolean;
}) {
  const today = useSyncExternalStore(subscribeToDateChange, todayInPalestine, () => initialToday);
  const nextDate = availability === "AVAILABLE"
    ? nextAvailabilityAfterReservation(today, bookedStarts)
    : null;
  const status = nextDate ? "RESERVED" : availability;

  if (compact && status === "AVAILABLE") return null;

  return (
    <div className="flex min-w-0 flex-col items-start gap-1" aria-live="polite">
      <AvailabilityBadge availability={status} />
      {nextDate ? (
        <p className="text-xs leading-relaxed text-muted">
          {t.item.nextAvailableDate}{" "}
          <time dateTime={nextDate}>{formatBookingDate(nextDate)}</time>
        </p>
      ) : null}
    </div>
  );
}
