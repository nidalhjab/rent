import Link from "next/link";
import { ConditionBadge } from "@/components/item/item-badges";
import { CloudImage } from "@/components/ui/cloud-image";
import { formatPrice } from "@/config/site";
import type { ItemCard as ItemCardData } from "@/lib/items";
import { t } from "@/messages/ar";

export function ItemCard({ item }: { item: ItemCardData }) {
  const front = item.images[0];

  return (
    <Link
      href={`/items/${item.id}`}
      className="group block overflow-hidden rounded-card border border-border bg-surface transition hover:border-primary hover:shadow-md"
    >
      <div className="relative aspect-3/4 overflow-hidden bg-subtle">
        {front ? (
          <CloudImage
            src={front.publicId}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}

        {item.availability !== "AVAILABLE" ? (
          <span className="absolute start-3 top-3 rounded-full bg-foreground/85 px-3 py-1 text-xs font-medium text-white">
            {t.enums.availability[item.availability]}
          </span>
        ) : null}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 font-semibold">{item.title}</h3>
        <p className="text-sm text-muted">
          {item.color} · {t.item.size} {item.size} · {item.city}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-bold text-primary">
            {formatPrice(item.pricePerDay)}
            <span className="text-xs font-normal text-muted">
              {" "}
              / {t.item.perDay}
            </span>
          </span>
          <ConditionBadge condition={item.condition} />
        </div>
      </div>
    </Link>
  );
}
