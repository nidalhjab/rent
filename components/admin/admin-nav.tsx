"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/messages/ar";

const links = [
  { href: "/admin/dashboard", label: t.admin.dashboard },
  { href: "/admin/submissions", label: t.admin.submissions },
  { href: "/admin/reservations", label: t.admin.reservations },
  { href: "/admin/items", label: t.admin.items },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-primary text-white"
                : "border border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
