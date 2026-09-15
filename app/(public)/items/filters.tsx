import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice, site } from "@/config/site";
import { Category, Condition } from "@/lib/generated/prisma/enums";
import { listColors, type ItemFilters } from "@/lib/items";
import { buildItemsUrl, parseItemFilters } from "@/lib/search-params";
import { t } from "@/messages/ar";
import { FiltersAccordion, type FilterChip } from "./filters-accordion";

const sortLabels = {
  newest: t.browse.sortNewest,
  cheapest: t.browse.sortCheapest,
  expensive: t.browse.sortExpensive,
};

/** One chip per active filter, each linking to the same page without it. */
function activeChips(filters: ItemFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  const add = (key: string, label: string, patch: Partial<ItemFilters>) =>
    chips.push({
      key,
      label,
      href: buildItemsUrl(filters, { ...patch, page: 1 }),
    });

  if (filters.search)
    add("q", t.browse.chipSearch(filters.search), { search: undefined });
  if (filters.category)
    add("category", t.enums.category[filters.category], { category: undefined });
  if (filters.size)
    add("size", t.browse.chipSize(filters.size), { size: undefined });
  if (filters.color) add("color", filters.color, { color: undefined });
  if (filters.condition)
    add("condition", t.enums.condition[filters.condition], {
      condition: undefined,
    });
  if (filters.city) add("city", filters.city, { city: undefined });
  if (filters.maxPrice)
    add("maxPrice", t.browse.chipMaxPrice(formatPrice(filters.maxPrice)), {
      maxPrice: undefined,
    });
  if (filters.availableOnly)
    add("available", t.browse.availableOnly, { availableOnly: false });
  if (filters.sort && filters.sort !== "newest")
    add("sort", sortLabels[filters.sort], { sort: undefined });

  return chips;
}

/**
 * A plain GET form: filtering keeps working without JavaScript and every result
 * page stays linkable and shareable.
 */
export async function ItemsFilters({
  searchParams,
}: Pick<PageProps<"/items">, "searchParams">) {
  const [params, colors] = await Promise.all([searchParams, listColors()]);
  const filters = parseItemFilters(params);
  const chips = activeChips(filters);

  return (
    // Remounts whenever the query changes, which collapses the panel on apply.
    <FiltersAccordion key={buildItemsUrl(filters)} chips={chips}>
      <form
        method="get"
        action="/items"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="sm:col-span-2">
          <label className="label" htmlFor="q">
            {t.browse.search}
          </label>
          <input
            id="q"
            name="q"
            className="field"
            placeholder={t.browse.searchPlaceholder}
            defaultValue={filters.search ?? ""}
          />
        </div>

        <div>
          <label className="label" htmlFor="category">
            {t.browse.category}
          </label>
          <select
            id="category"
            name="category"
            className="field"
            defaultValue={filters.category ?? ""}
          >
            <option value="">{t.browse.all}</option>
            {Object.values(Category).map((value) => (
              <option key={value} value={value}>
                {t.enums.category[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="sort">
            {t.browse.sort}
          </label>
          <select
            id="sort"
            name="sort"
            className="field"
            defaultValue={filters.sort ?? "newest"}
          >
            <option value="newest">{t.browse.sortNewest}</option>
            <option value="cheapest">{t.browse.sortCheapest}</option>
            <option value="expensive">{t.browse.sortExpensive}</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="size">
            {t.browse.size}
          </label>
          <select
            id="size"
            name="size"
            className="field"
            defaultValue={filters.size ?? ""}
          >
            <option value="">{t.browse.all}</option>
            {site.dressSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="color">
            {t.browse.color}
          </label>
          <select
            id="color"
            name="color"
            className="field"
            defaultValue={filters.color ?? ""}
          >
            <option value="">{t.browse.all}</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="condition">
            {t.browse.condition}
          </label>
          <select
            id="condition"
            name="condition"
            className="field"
            defaultValue={filters.condition ?? ""}
          >
            <option value="">{t.browse.all}</option>
            {Object.values(Condition).map((value) => (
              <option key={value} value={value}>
                {t.enums.condition[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="city">
            {t.browse.city}
          </label>
          <select
            id="city"
            name="city"
            className="field"
            defaultValue={filters.city ?? ""}
          >
            <option value="">{t.browse.all}</option>
            {site.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="maxPrice">
            {t.browse.maxPrice}
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={1}
            className="field"
            defaultValue={filters.maxPrice ?? ""}
          />
        </div>

        <label className="flex items-center gap-2 text-sm sm:col-span-2 sm:self-end sm:pb-3">
          <input
            type="checkbox"
            name="available"
            value="1"
            defaultChecked={filters.availableOnly}
            className="size-4 accent-primary"
          />
          {t.browse.availableOnly}
        </label>

        <div className="flex items-end gap-2 sm:col-span-2">
          <Button type="submit" className="flex-1">
            {t.browse.apply}
          </Button>
          <ButtonLink href="/items" variant="secondary">
            {t.browse.reset}
          </ButtonLink>
        </div>
      </form>
    </FiltersAccordion>
  );
}
