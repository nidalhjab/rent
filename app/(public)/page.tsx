import { ItemCard } from "@/components/item/item-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import { countPublishedItems, listLatestItems } from "@/lib/items";
import { t } from "@/messages/ar";

export default async function HomePage() {
  // Both reads are `use cache` functions, so the whole page prerenders.
  const [items, total] = await Promise.all([
    listLatestItems(8),
    countPublishedItems(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft to-background">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-surface px-4 py-1.5 text-xs font-medium text-primary shadow-sm">
              {t.home.badge}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
              {t.home.title}
            </h1>
            <p className="mt-4 text-base text-muted sm:text-lg">
              {t.home.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/items" size="lg">
                {t.home.ctaBrowse}
              </ButtonLink>
              <ButtonLink href="/items/new" size="lg" variant="secondary">
                {t.home.ctaAdd}
              </ButtonLink>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-4 text-center">
              <div>
                <dt className="text-2xl font-bold text-primary">{total}</dt>
                <dd className="text-xs text-muted">{t.home.statsItems}</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold text-primary">
                  {site.cities.length}
                </dt>
                <dd className="text-xs text-muted">{t.home.statsCities}</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold text-primary">✓</dt>
                <dd className="text-xs text-muted">{t.home.statsFree}</dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">{t.home.featured}</h2>
          <ButtonLink href="/items" variant="ghost" size="sm">
            {t.home.viewAll}
          </ButtonLink>
        </div>

        {items.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-surface p-10 text-center text-muted">
            {t.home.empty}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </Container>

      <section className="bg-surface py-14">
        <Container>
          <h2 className="mb-8 text-center text-2xl font-bold">
            {t.home.howTitle}
          </h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.howSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-card border border-border bg-background p-6"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="py-14">
        <div className="rounded-card bg-foreground px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold">{t.home.ownerTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75">
            {t.home.ownerBody}
          </p>
          <ButtonLink href="/items/new" size="lg" className="mt-7">
            {t.home.ctaAdd}
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
