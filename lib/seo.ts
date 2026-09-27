import type { Metadata } from "next";
import { site, siteUrl } from "@/config/site";
import { cloudImageUrl } from "@/lib/image-url";

export const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export function pageMetadata({ title, description = site.description, path, image }: {
  title: string; description?: string; path: string; image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path, languages: { "ar-PS": path } },
    openGraph: {
      type: "website", locale: "ar_PS", siteName: site.name,
      url: absoluteUrl(path), title, description,
      images: [{ url: image ?? absoluteUrl("/icon-512.png"), alt: title }],
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: [image ?? absoluteUrl("/icon-512.png")] },
  };
}

type SeoItem = {
  id: string; title: string; description: string | null; city: string;
  size: string; color: string; pricePerDay: number; availability: string;
  images: { publicId: string; role: string }[];
};

export function itemDescription(item: SeoItem) {
  return `${item.title} للإيجار في ${item.city}، فلسطين. المقاس ${item.size}، اللون ${item.color}، ${item.pricePerDay} شيكل لليوم. اطّلعي على مواعيد الحجز المتاحة. ${item.description ?? ""}`.trim().slice(0, 170);
}

export function itemStructuredData(item: SeoItem) {
  const url = absoluteUrl(`/items/${item.id}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product", "@id": `${url}#product`, name: item.title,
        description: itemDescription(item), url, sku: item.id,
        image: item.images.map((image) => cloudImageUrl(image.publicId, 1200)),
        color: item.color, size: item.size, itemCondition: "https://schema.org/UsedCondition",
        offers: {
          "@type": "Offer", url, price: item.pricePerDay, priceCurrency: "ILS",
          businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
          areaServed: { "@type": "Country", name: "فلسطين" },
          priceSpecification: { "@type": "UnitPriceSpecification", price: item.pricePerDay, priceCurrency: "ILS", unitCode: "DAY", unitText: "لليوم" },
        },
      },
      {
        "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "فساتين للإيجار في فلسطين", item: absoluteUrl("/items") },
          { "@type": "ListItem", position: 3, name: item.title, item: url },
        ],
      },
    ],
  };
}
