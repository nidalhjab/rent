import type { Metadata } from "next";
import { t } from "@/messages/ar";

// Every admin screen depends on the session cookie, so there is no static shell
// to validate here. Public routes keep their instant-navigation guarantees.
export const instant = false;

export const metadata: Metadata = {
  title: t.admin.dashboard,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex min-h-full flex-col bg-subtle">{children}</div>;
}
