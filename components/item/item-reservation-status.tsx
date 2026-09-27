import { Suspense } from "react";
import { connection } from "next/server";
import type { Availability } from "@/lib/generated/prisma/enums";
import { todayInPalestine } from "@/lib/booking-dates";
import { ReservationStatus } from "@/components/item/reservation-status";

type Props = {
  item: {
    availability: Availability;
    reservations: { preferredDate: Date | null }[];
  };
  compact?: boolean;
};

async function CurrentReservationStatus({ item, compact }: Props) {
  // The catalog may be cached, but the date is current for every page request.
  await connection();
  return <ReservationStatus
    availability={item.availability}
    bookedStarts={item.reservations.flatMap((reservation) =>
      reservation.preferredDate ? [reservation.preferredDate.toISOString().slice(0, 10)] : [],
    )}
    initialToday={todayInPalestine()}
    compact={compact}
  />;
}

export function ItemReservationStatus(props: Props) {
  return <Suspense fallback={<span className="inline-block h-5 w-16 animate-pulse rounded-full bg-subtle" aria-hidden="true" />}>
    <CurrentReservationStatus {...props} />
  </Suspense>;
}
