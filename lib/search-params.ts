import { site } from "@/config/site";
import { Category, Condition } from "@/lib/generated/prisma/enums";
import type { ItemFilters, ItemSort } from "@/lib/items";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const SORTS = ["newest", "cheapest", "expensive"] as const;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const oneOf = <T extends string>(
  allowed: readonly T[],
  raw: string | string[] | undefined,
): T | undefined => {
  const value = first(raw);
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
};

/** Everything unrecognised is dropped, so the query string can't reach Prisma. */
export function parseItemFilters(params: RawSearchParams): ItemFilters {
  const maxPrice = Number(first(params.maxPrice));
  const page = Number(first(params.page));
  const search = first(params.q)?.trim();

  return {
    category: oneOf(Object.values(Category), params.category),
    condition: oneOf(Object.values(Condition), params.condition),
    size: oneOf(site.dressSizes, params.size),
    city: oneOf(site.cities, params.city),
    color: first(params.color)?.trim() || undefined,
    maxPrice:
      Number.isFinite(maxPrice) && maxPrice > 0 ? Math.floor(maxPrice) : undefined,
    availableOnly: first(params.available) === "1",
    search: search ? search.slice(0, 80) : undefined,
    sort: oneOf(SORTS, params.sort),
    page: Number.isFinite(page) && page > 1 ? Math.floor(page) : 1,
  };
}

/** Rebuilds `/items?...` from parsed filters, used by the pagination links. */
export function buildItemsUrl(filters: ItemFilters, overrides: { page?: number } = {}) {
  const query = new URLSearchParams();
  const set = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== "" && value !== 0) {
      query.set(key, String(value));
    }
  };

  set("q", filters.search);
  set("category", filters.category);
  set("size", filters.size);
  set("color", filters.color);
  set("condition", filters.condition);
  set("city", filters.city);
  set("maxPrice", filters.maxPrice);
  set("sort", filters.sort);
  if (filters.availableOnly) query.set("available", "1");

  const page = overrides.page ?? filters.page ?? 1;
  if (page > 1) query.set("page", String(page));

  const search = query.toString();
  return search ? `/items?${search}` : "/items";
}

export type { ItemSort };
