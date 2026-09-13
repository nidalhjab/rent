import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/config/site";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { t } from "@/messages/ar";
import { approveReservation, rejectReservation } from "../actions";

const requestTone = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
} as const;

export const instant = false;

export default async function AdminReservationsPage() {
  await requireAdmin();

  const [pending, decided] = await Promise.all([
    prisma.reservation.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        item: {
          select: { id: true, title: true, pricePerDay: true, city: true },
        },
      },
    }),
    prisma.reservation.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { decidedAt: "desc" },
      take: 20,
      include: { item: { select: { id: true, title: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        {pending.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-surface p-12 text-center text-muted">
            {t.admin.noPendingReservations}
          </p>
        ) : (
          pending.map((reservation) => (
            <article
              key={reservation.id}
              className="space-y-4 rounded-card border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/items/${reservation.item.id}`}
                  className="font-semibold text-primary"
                >
                  {reservation.item.title}
                </Link>
                <span className="text-xs text-muted">
                  {t.admin.submittedAt}: {formatDate(reservation.createdAt)}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted">{t.admin.renter}</dt>
                  <dd className="font-medium">{reservation.renterName}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t.admin.phone}</dt>
                  <dd className="font-medium" dir="ltr">
                    <a href={`tel:${reservation.renterPhone}`}>
                      {reservation.renterPhone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t.item.perDay}</dt>
                  <dd className="font-medium">
                    {formatPrice(reservation.item.pricePerDay)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t.admin.preferredDate}</dt>
                  <dd className="font-medium">
                    {reservation.preferredDate
                      ? formatDate(reservation.preferredDate)
                      : "—"}
                  </dd>
                </div>
              </dl>

              {reservation.note ? (
                <p className="rounded-xl bg-subtle p-3 text-sm text-muted">
                  {reservation.note}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <form action={approveReservation}>
                  <input type="hidden" name="id" value={reservation.id} />
                  <Button type="submit" variant="success" size="sm">
                    {t.admin.approve}
                  </Button>
                </form>

                <form action={rejectReservation}>
                  <input type="hidden" name="id" value={reservation.id} />
                  <Button type="submit" variant="danger" size="sm">
                    {t.admin.reject}
                  </Button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>

      {decided.length > 0 ? (
        <section>
          <h2 className="mb-3 font-semibold">{t.admin.history}</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
            {decided.map((reservation) => (
              <li
                key={reservation.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
              >
                <span className="font-medium">{reservation.item.title}</span>
                <span className="text-muted">{reservation.renterName}</span>
                <span className="text-muted" dir="ltr">
                  {reservation.renterPhone}
                </span>
                <Badge tone={requestTone[reservation.status]}>
                  {t.enums.request[reservation.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
