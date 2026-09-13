import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { ItemGridSkeleton, Skeleton } from "@/components/ui/skeleton";
import { t } from "@/messages/ar";
import { ItemsFilters } from "./filters";
import { ItemsResults } from "./results";

export const metadata: Metadata = {
  title: t.browse.title,
};

export default function ItemsPage({ searchParams }: PageProps<"/items">) {
  return (
    <Container className="space-y-8 py-10">
      <h1 className="text-3xl font-bold">{t.browse.title}</h1>

      {/* Both children read `searchParams`, so they stream while the shell is static. */}
      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <ItemsFilters searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<ItemGridSkeleton />}>
        <ItemsResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
