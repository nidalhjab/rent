import Link from "next/link";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import { t } from "@/messages/ar";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <Container className="flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted sm:flex-row">
        <div>
          <p className="font-semibold text-foreground">{site.name}</p>
          <p>{t.footer.tagline}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="transition hover:text-foreground">
            {t.footer.admin}
          </Link>
          <span>{t.footer.rights}</span>
        </div>
      </Container>
    </footer>
  );
}
