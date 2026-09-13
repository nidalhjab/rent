import Link from "next/link";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AvailabilityBadge } from "@/components/item/item-badges";
import { Button } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { formatPrice } from "@/config/site";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Availability } from "@/lib/generated/prisma/enums";
import { t } from "@/messages/ar";
import { deleteItem, setItemAvailability } from "../actions";

export const instant = false;

export default async function AdminItemsPage() {
  await requireAdmin();

  const items = await prisma.item.findMany({
    where: { moderation: "APPROVED" },
    orderBy: { approvedAt: "desc" },
    select: {
      id: true,
      title: true,
      city: true,
      size: true,
      pricePerDay: true,
      availability: true,
      ownerName: true,
      ownerPhone: true,
      images: {
        where: { role: "FRONT" },
        select: { publicId: true },
      },
      _count: { select: { reservations: true } },
    },
  });

  if (items.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-border bg-surface p-12 text-center text-muted">
        {t.admin.noItems}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface p-4"
        >
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-subtle">
            {item.images[0] ? (
              <CloudImage
                src={item.images[0].publicId}
                alt={item.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="min-w-40 flex-1">
            <Link
              href={`/items/${item.id}`}
              className="font-medium text-primary"
            >
              {item.title}
            </Link>
            <p className="text-xs text-muted">
              {item.city} · {t.item.size} {item.size} ·{" "}
              {formatPrice(item.pricePerDay)}
            </p>
            <p className="text-xs text-muted" dir="ltr">
              {item.ownerName} — {item.ownerPhone}
            </p>
          </div>

          <AvailabilityBadge availability={item.availability} />

          <form action={setItemAvailability} className="flex items-center gap-2">
            <input type="hidden" name="id" value={item.id} />
            <select
              name="availability"
              defaultValue={item.availability}
              className="rounded-full border border-border bg-surface px-3 py-2 text-xs"
              aria-label={t.admin.status}
            >
              {Object.values(Availability).map((value) => (
                <option key={value} value={value}>
                  {t.enums.availability[value]}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary" size="sm">
              {t.browse.apply}
            </Button>
          </form>

          <form action={deleteItem}>
            <input type="hidden" name="id" value={item.id} />
            <ConfirmButton
              type="submit"
              variant="danger"
              size="sm"
              message={t.admin.confirmDeleteItem}
            >
              {t.admin.deleteItem}
            </ConfirmButton>
          </form>
        </li>
      ))}
    </ul>
  );
}
