"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { t } from "@/messages/ar";

export type FilterChip = { key: string; label: string; href: string };

/**
 * Collapsed by default so results stay above the fold on phones. Applying a
 * filter reloads the page, which remounts this shell and closes it again; the
 * active filters stay visible as removable chips in the header.
 */
export function FiltersAccordion({
  chips,
  children,
}: {
  chips: FilterChip[];
  children: ReactNode;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-card border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          {t.browse.filters}
          {chips.length > 0 ? (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
              {chips.length}
            </span>
          ) : (
            <span className="hidden text-xs font-normal text-muted sm:inline">
              {t.browse.filtersHint}
            </span>
          )}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {chips.map((chip) => (
          <Link
            key={chip.key}
            href={chip.href}
            scroll={false}
            aria-label={t.browse.removeFilter(chip.label)}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-subtle py-1.5 pe-1.5 ps-3 text-xs text-foreground transition hover:bg-primary-soft hover:text-primary"
          >
            <span className="truncate">{chip.label}</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </Link>
        ))}

        {chips.length > 1 ? (
          <Link
            href="/items"
            scroll={false}
            className="ms-auto rounded-full px-2 py-1 text-xs text-muted underline-offset-4 transition hover:text-primary hover:underline"
          >
            {t.browse.clearAll}
          </Link>
        ) : null}
      </div>

      <div
        id={panelId}
        hidden={!open}
        className="border-t border-border p-3 sm:p-4"
      >
        {children}
      </div>
    </section>
  );
}
