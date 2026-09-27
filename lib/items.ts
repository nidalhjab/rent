import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import type { Category, Condition } from "@/lib/generated/prisma/enums";
import { addDays, dateValue, RESERVATION_GAP_DAYS, todayInPalestine } from "@/lib/booking-dates";

export const ITEMS_TAG = "items";
export const PAGE_SIZE = 12;

export type ItemSort = "newest" | "cheapest" | "expensive";

export type ItemFilters = {
  category?: Category;
  size?: string;
  color?: string;
  condition?: Condition;
  city?: string;
  maxPrice?: number;
  availableOnly?: boolean;
  search?: string;
  sort?: ItemSort;
  page?: number;
};

const reservationSelect = {
  where: { status: { in: ["PENDING", "APPROVED"] } },
  select: { preferredDate: true },
  orderBy: { preferredDate: "asc" },
} satisfies Prisma.ReservationFindManyArgs;

function outstandingReservations() {
  return {
    ...reservationSelect,
    where: {
      ...reservationSelect.where,
      preferredDate: { gt: dateValue(addDays(todayInPalestine(), -RESERVATION_GAP_DAYS)) },
    },
  };
}

const cardSelect = {
  id: true,
  title: true,
  color: true,
  size: true,
  condition: true,
  city: true,
  pricePerDay: true,
  availability: true,
  category: true,
  reservations: reservationSelect,
  images: {
    where: { role: "FRONT" as const },
    select: { publicId: true, width: true, height: true },
  },
} satisfies Prisma.ItemSelect;

export type ItemCard = Prisma.ItemGetPayload<{ select: typeof cardSelect }>;

function publicCardSelect() {
  // Fetch dates together with the catalog, without a query for each card.
  return { ...cardSelect, reservations: outstandingReservations() };
}

function publicWhere(filters: ItemFilters): Prisma.ItemWhereInput {
  return {
    moderation: "APPROVED",
    availability: filters.availableOnly ? "AVAILABLE" : { not: "HIDDEN" },
    ...(filters.availableOnly ? { reservations: { none: outstandingReservations().where } } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.size ? { size: filters.size } : {}),
    ...(filters.condition ? { condition: filters.condition } : {}),
    ...(filters.city ? { city: filters.city } : {}),
    ...(filters.color
      ? { color: { equals: filters.color, mode: "insensitive" } }
      : {}),
    ...(filters.maxPrice ? { pricePerDay: { lte: filters.maxPrice } } : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

function orderBy(sort: ItemSort = "newest"): Prisma.ItemOrderByWithRelationInput {
  if (sort === "cheapest") return { pricePerDay: "asc" };
  if (sort === "expensive") return { pricePerDay: "desc" };
  return { createdAt: "desc" };
}

export async function listItems(filters: ItemFilters) {
  "use cache";
  if (filters.availableOnly) {
    cacheLife({ stale: 0, revalidate: 30, expire: 60 });
  } else {
    cacheLife("hours");
  }
  cacheTag(ITEMS_TAG);

  const page = Math.max(1, filters.page ?? 1);
  const where = publicWhere(filters);

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      select: publicCardSelect(),
      orderBy: orderBy(filters.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function listLatestItems(take = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag(ITEMS_TAG);

  return prisma.item.findMany({
    where: { moderation: "APPROVED", availability: { not: "HIDDEN" } },
    select: publicCardSelect(),
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getItem(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(ITEMS_TAG);

  return prisma.item.findFirst({
    where: { id, moderation: "APPROVED", availability: { not: "HIDDEN" } },
    select: {
      id: true,
      category: true,
      title: true,
      description: true,
      color: true,
      size: true,
      sizeSystem: true,
      condition: true,
      timesWorn: true,
      pricePerDay: true,
      depositAmount: true,
      city: true,
      availability: true,
      createdAt: true,
      reservations: outstandingReservations(),
      images: {
        select: { role: true, publicId: true, width: true, height: true },
      },
    },
  });
}

export async function listRelatedItems(id: string, category: Category) {
  "use cache";
  cacheLife("hours");
  cacheTag(ITEMS_TAG);

  return prisma.item.findMany({
    where: {
      id: { not: id },
      category,
      moderation: "APPROVED",
      availability: { not: "HIDDEN" },
    },
    select: publicCardSelect(),
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

/** Colour list for the filter bar, derived from what is actually published. */
export async function listColors() {
  "use cache";
  cacheLife("hours");
  cacheTag(ITEMS_TAG);

  const rows = await prisma.item.findMany({
    where: { moderation: "APPROVED", availability: { not: "HIDDEN" } },
    select: { color: true },
    distinct: ["color"],
    orderBy: { color: "asc" },
    take: 40,
  });
  return rows.map((row) => row.color);
}

export async function countPublishedItems() {
  "use cache";
  cacheLife("hours");
  cacheTag(ITEMS_TAG);

  return prisma.item.count({
    where: { moderation: "APPROVED", availability: { not: "HIDDEN" } },
  });
}
