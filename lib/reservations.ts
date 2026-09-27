import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { addDays, dateValue, RESERVATION_GAP_DAYS } from "@/lib/booking-dates";

export class ReservationConflict extends Error {}
export class ItemUnavailable extends Error {}

/** Serializes booking/admin decisions for one dress across all server instances. */
export async function lockItem(tx: Prisma.TransactionClient, itemId: string) {
  await tx.$queryRaw`SELECT "id" FROM "Item" WHERE "id" = ${itemId} FOR UPDATE`;
}

export async function createReservation(data: {
  itemId: string;
  renterName: string;
  renterPhone: string;
  note?: string;
  preferredDate: string;
}) {
  return prisma.$transaction(async (tx) => {
    await lockItem(tx, data.itemId);
    const item = await tx.item.findFirst({
      where: { id: data.itemId, moderation: "APPROVED", availability: "AVAILABLE" },
      select: { id: true },
    });
    if (!item) throw new ItemUnavailable();

    const conflict = await tx.reservation.findFirst({
      where: {
        itemId: data.itemId,
        status: { in: ["PENDING", "APPROVED"] },
        preferredDate: {
          gt: dateValue(addDays(data.preferredDate, -RESERVATION_GAP_DAYS)),
          lt: dateValue(addDays(data.preferredDate, RESERVATION_GAP_DAYS)),
        },
      },
      select: { id: true },
    });
    if (conflict) throw new ReservationConflict();

    // PostgreSQL's exclusion constraint is a second, independent line of defence.
    return tx.reservation.create({
      data: { ...data, preferredDate: dateValue(data.preferredDate) },
      select: { id: true },
    });
  }, { maxWait: 5_000, timeout: 10_000 });
}
