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

/**
 * Rebuilds `/items?...` from parsed filters. `overrides` is merged on top, so
 * pagination links and the "remove this filter" chips share one code path.
 */
export function buildItemsUrl(
  filters: ItemFilters,
  overrides: Partial<ItemFilters> = {},
) {
  const merged = { ...filters, ...overrides };
  const query = new URLSearchParams();
  const set = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== "" && value !== 0) {
      query.set(key, String(value));
    }
  };

  set("q", merged.search);
  set("category", merged.category);
  set("size", merged.size);
  set("color", merged.color);
  set("condition", merged.condition);
  set("city", merged.city);
  set("maxPrice", merged.maxPrice);
  set("sort", merged.sort);
  if (merged.availableOnly) query.set("available", "1");

  const page = merged.page ?? 1;
  if (page > 1) query.set("page", String(page));

  const search = query.toString();
  return search ? `/items?${search}` : "/items";
}

export type { ItemSort };
