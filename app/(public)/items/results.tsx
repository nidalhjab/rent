import { ItemCard } from "@/components/item/item-card";
import { ButtonLink } from "@/components/ui/button";
import { listItems } from "@/lib/items";
import { buildItemsUrl, parseItemFilters } from "@/lib/search-params";
import { t } from "@/messages/ar";

export async function ItemsResults({
  searchParams,
}: Pick<PageProps<"/items">, "searchParams">) {
  const filters = parseItemFilters(await searchParams);
  const { items, total, page, pageCount } = await listItems(filters);

  if (items.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-border bg-surface p-12 text-center text-muted">
        {t.browse.empty}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{t.browse.resultsCount(total)}</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {pageCount > 1 ? (
        <nav className="flex items-center justify-between gap-3 pt-2">
          {page > 1 ? (
            <ButtonLink
              href={buildItemsUrl(filters, { page: page - 1 })}
              variant="secondary"
              size="sm"
            >
              {t.browse.previous}
            </ButtonLink>
          ) : (
            <span />
          )}

          <span className="text-sm text-muted">
            {t.browse.page(page, pageCount)}
          </span>

          {page < pageCount ? (
            <ButtonLink
              href={buildItemsUrl(filters, { page: page + 1 })}
              variant="secondary"
              size="sm"
            >
              {t.browse.next}
            </ButtonLink>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
