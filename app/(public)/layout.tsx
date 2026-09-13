import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OfflineBanner } from "@/components/pwa/offline-banner";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OfflineBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
