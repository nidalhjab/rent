import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getItem } from "@/lib/items";
import { t } from "@/messages/ar";
import { ItemDetail } from "./item-detail";
import { itemDescription, pageMetadata } from "@/lib/seo";
import { cloudImageUrl } from "@/lib/image-url";

export async function generateMetadata({
  params,
}: PageProps<"/items/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return { title: t.item.notFound, robots: { index: false, follow: false } };
  const image = item.images.find((image) => image.role === "FRONT") ?? item.images[0];
  return pageMetadata({
    title: `${item.title} للإيجار في ${item.city}، فلسطين`,
    description: itemDescription(item), path: `/items/${item.id}`,
    image: image ? cloudImageUrl(image.publicId, 1200) : undefined,
  });
}

export default function ItemPage({ params }: PageProps<"/items/[id]">) {
  return (
    <Container className="py-10">
      <Suspense
        fallback={
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-3/4 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        }
      >
        <ItemDetail params={params} />
      </Suspense>
    </Container>
  );
}
