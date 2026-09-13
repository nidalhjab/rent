import Link from "next/link";
import { InstallButton } from "@/components/pwa/install-button";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import { t } from "@/messages/ar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="text-xl font-bold text-primary"
          aria-label={site.name}
        >
          {site.name}
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/items"
            className="rounded-full px-3 py-2 text-sm text-muted transition hover:bg-subtle hover:text-foreground"
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
