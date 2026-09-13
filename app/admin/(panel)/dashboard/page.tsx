import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { t } from "@/messages/ar";

export const instant = false;

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [submissions, reservations, published, reserved] = await Promise.all([
    prisma.item.count({ where: { moderation: "PENDING" } }),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.item.count({ where: { moderation: "APPROVED" } }),
    prisma.item.count({
      where: { moderation: "APPROVED", availability: "RESERVED" },
    }),
  ]);

  const cards = [
    {
      href: "/admin/submissions",
      label: t.admin.pendingSubmissions,
      value: submissions,
      highlight: submissions > 0,
    },
    {
      href: "/admin/reservations",
      label: t.admin.pendingReservations,
      value: reservations,
      highlight: reservations > 0,
    },
    { href: "/admin/items", label: t.admin.publishedItems, value: published },
    { href: "/admin/items", label: t.admin.reservedItems, value: reserved },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className={`rounded-card border bg-surface p-6 transition hover:border-primary ${
            card.highlight ? "border-primary" : "border-border"
          }`}
        >
          <p className="text-3xl font-bold text-primary">{card.value}</p>
          <p className="mt-1 text-sm text-muted">{card.label}</p>
        </Link>
      ))}
    </div>
  );
}
