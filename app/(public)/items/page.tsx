import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { ItemGridSkeleton, Skeleton } from "@/components/ui/skeleton";
import { t } from "@/messages/ar";
import { ItemsFilters } from "./filters";
import { ItemsResults } from "./results";
import { pageMetadata } from "@/lib/seo";
import { buildItemsUrl, parseItemFilters } from "@/lib/search-params";

export async function generateMetadata({ searchParams }: PageProps<"/items">): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseItemFilters(params);
  const page = filters.page ?? 1;
  const hasFilters = Object.keys(params).some((key) => key !== "page");
  return {
    ...pageMetadata({
      title: `فساتين مستعملة للإيجار في فلسطين${page > 1 ? ` — صفحة ${page}` : ""}`,
      path: buildItemsUrl({ page }),
    }),
    ...(hasFilters ? { robots: { index: false, follow: true } } : {}),
  };
}

export default function ItemsPage({ searchParams }: PageProps<"/items">) {
  return (
    <Container className="space-y-8 py-10">
      <h1 className="text-3xl font-bold">{t.browse.title}</h1>
      <p className="max-w-3xl text-sm leading-relaxed text-muted">{t.browse.description}</p>

      {/* Both children read `searchParams`, so they stream while the shell is static. */}
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <ItemsFilters searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<ItemGridSkeleton />}>
        <ItemsResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
