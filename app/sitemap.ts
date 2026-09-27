import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/db";
import { ITEMS_TAG } from "@/lib/items";
import { absoluteUrl } from "@/lib/seo";
import { cloudImageUrl } from "@/lib/image-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");
  cacheTag(ITEMS_TAG);
  const items = await prisma.item.findMany({
    where: { moderation: "APPROVED", availability: { not: "HIDDEN" } },
    select: { id: true, images: { select: { publicId: true } } },
    orderBy: { id: "asc" },
  });
  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/items"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/items/new"), changeFrequency: "monthly", priority: 0.5 },
    ...items.map((item) => ({
      url: absoluteUrl(`/items/${item.id}`),
      images: item.images.map((image) => cloudImageUrl(image.publicId, 1200)),
      changeFrequency: "weekly" as const, priority: 0.8,
    })),
  ];
}
