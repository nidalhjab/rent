import { notFound } from "next/navigation";
import {
  AvailabilityBadge,
  ConditionBadge,
} from "@/components/item/item-badges";
import { ItemCard } from "@/components/item/item-card";
import { ItemGallery } from "@/components/item/item-gallery";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/config/site";
import { getItem, listRelatedItems } from "@/lib/items";
import { t } from "@/messages/ar";
import { ReserveSection } from "./reserve-section";
import { TryOnSection } from "./try-on-section";

export async function ItemDetail({
  params,
}: Pick<PageProps<"/items/[id]">, "params">) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const related = await listRelatedItems(item.id, item.category);
  const hasFrontAndBack =
    item.images.some((image) => image.role === "FRONT") &&
    item.images.some((image) => image.role === "BACK");

  return (
    <div className="space-y-14">
      <div className="grid gap-8 lg:grid-cols-2">
        <ItemGallery images={item.images} title={item.title} />

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <AvailabilityBadge availability={item.availability} />
              <ConditionBadge condition={item.condition} />
              <Badge>{t.enums.category[item.category]}</Badge>
            </div>

            <h1 className="text-3xl font-bold leading-snug">{item.title}</h1>

            <p className="text-2xl font-bold text-primary">
              {formatPrice(item.pricePerDay)}
              <span className="text-sm font-normal text-muted">
                {" "}
                / {t.item.perDay}
              </span>
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-4 rounded-card border border-border bg-surface p-5 text-sm">
            <div>
              <dt className="text-muted">{t.item.size}</dt>
              <dd className="font-medium">
                {item.size}
                {item.sizeSystem ? ` (${item.sizeSystem})` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t.item.color}</dt>
              <dd className="font-medium">{item.color}</dd>
            </div>
            <div>
              <dt className="text-muted">{t.item.city}</dt>
              <dd className="font-medium">{item.city}</dd>
            </div>
            <div>
              <dt className="text-muted">{t.item.condition}</dt>
              <dd className="font-medium">
                {t.item.timesWorn(item.timesWorn)}
              </dd>
            </div>
            {item.depositAmount ? (
              <div>
                <dt className="text-muted">{t.item.deposit}</dt>
                <dd className="font-medium">
                  {formatPrice(item.depositAmount)}
                </dd>
              </div>
            ) : null}
          </dl>

          {item.description ? (
            <section>
              <h2 className="mb-2 font-semibold">{t.item.description}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </section>
          ) : null}

          <ReserveSection
            itemId={item.id}
            available={item.availability === "AVAILABLE"}
          />
        </div>
      </div>

      <TryOnSection itemId={item.id} enabled={hasFrontAndBack} />

      {related.length > 0 ? (
        <section>
          <h2 className="mb-4 text-2xl font-bold">{t.item.relatedTitle}</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {related.map((relatedItem) => (
              <ItemCard key={relatedItem.id} item={relatedItem} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
