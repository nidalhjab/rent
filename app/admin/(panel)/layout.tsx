import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/messages/ar";
import { logout } from "../actions";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <>
      <header className="border-b border-border bg-surface">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/admin/dashboard" className="font-bold text-primary">
            {site.name}
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full px-3 py-2 text-sm text-muted transition hover:text-foreground"
            >
              {t.nav.browse}
            </Link>
            <form action={logout}>
              <Button type="submit" variant="secondary" size="sm">
                {t.admin.logout}
              </Button>
            </form>
          </div>
        </Container>
      </header>

      <Container className="space-y-6 py-8">
        <AdminNav />
        {children}
      </Container>
    </>
  );
}
