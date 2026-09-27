import Link from "next/link";
import { InstallButton } from "@/components/pwa/install-button";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import { t } from "@/messages/ar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <Container className="flex min-h-16 flex-wrap items-center justify-between gap-2 py-3 sm:flex-nowrap">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold text-primary"
          aria-label={site.name}
        >
          {site.name}
        </Link>

        <nav aria-label={t.nav.menu} className="flex max-w-full flex-wrap items-center gap-1">
          <Link
            href="/items"
            className="flex min-h-11 items-center rounded-full px-2 py-2 text-xs text-muted transition hover:bg-subtle hover:text-foreground sm:px-3 sm:text-sm"
          >
            {t.nav.browse}
          </Link>
          <InstallButton />
          <ButtonLink href="/items/new" size="sm">
            {t.nav.addItem}
          </ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
