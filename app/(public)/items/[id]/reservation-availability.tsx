import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { addDays, BOOKING_WINDOW_DAYS, dateValue, todayInPalestine } from "@/lib/booking-dates";
import { ReserveSection } from "./reserve-section";

export async function ReservationAvailability({ itemId }: { itemId: string }) {
  // Availability must be live even when the product description is cached.
  await connection();
  const today = todayInPalestine();
  const maxDate = addDays(today, BOOKING_WINDOW_DAYS);
  const item = await prisma.item.findFirst({
    where: { id: itemId, moderation: "APPROVED", availability: { not: "HIDDEN" } },
    select: {
      availability: true,
      reservations: {
        where: {
          status: { in: ["PENDING", "APPROVED"] },
          preferredDate: { gt: dateValue(addDays(today, -3)), lt: dateValue(addDays(maxDate, 3)) },
        },
        orderBy: { preferredDate: "asc" },
        select: { preferredDate: true },
      },
    },
  });
  return <ReserveSection
    itemId={itemId}
    available={item?.availability === "AVAILABLE"}
    today={today}
    maxDate={maxDate}
    bookedStarts={item?.reservations.flatMap((row) => row.preferredDate ? [row.preferredDate.toISOString().slice(0, 10)] : []) ?? []}
  />;
}
