import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/config/site";
import { Category, Condition } from "@/lib/generated/prisma/enums";
import { listColors } from "@/lib/items";
import { parseItemFilters } from "@/lib/search-params";
import { t } from "@/messages/ar";

/**
 * A plain GET form: filtering keeps working without JavaScript and every result
 * page stays linkable and shareable.
 */
export async function ItemsFilters({
  searchParams,
}: Pick<PageProps<"/items">, "searchParams">) {
  const [params, colors] = await Promise.all([searchParams, listColors()]);
  const filters = parseItemFilters(params);

  return (
    <form
      method="get"
      action="/items"
      className="grid gap-4 rounded-card border border-border bg-surface p-5 md:grid-cols-4"
    >
      <div className="md:col-span-2">
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

      <label className="flex items-center gap-2 self-end pb-1 text-sm md:col-span-2">
        <input
          type="checkbox"
          name="available"
          value="1"
          defaultChecked={filters.availableOnly}
          className="size-4 accent-primary"
        />
        {t.browse.availableOnly}
      </label>

      <div className="flex items-end gap-2 md:col-span-2">
        <Button type="submit" className="flex-1">
          {t.browse.apply}
        </Button>
        <ButtonLink href="/items" variant="secondary">
          {t.browse.reset}
        </ButtonLink>
      </div>
    </form>
  );
}
