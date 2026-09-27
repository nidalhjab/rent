"use client";

import { useEffect, useRef, useState } from "react";
import { CloudImage } from "@/components/ui/cloud-image";
import type { ImageRole } from "@/lib/generated/prisma/enums";
import { t } from "@/messages/ar";

export type GalleryImage = { role: ImageRole; publicId: string };

const ROLE_ORDER: ImageRole[] = ["FRONT", "BACK", "DETAIL"];

export function ItemGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const ordered = ROLE_ORDER.map((role) =>
    images.find((image) => image.role === role),
  ).filter((image): image is GalleryImage => Boolean(image));

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerImage, setViewerImage] = useState<GalleryImage | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isViewerOpen = viewerImage !== null;
  const active = ordered[activeIndex] ?? ordered[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isViewerOpen || !dialog) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    const previousOverflow = document.body.style.overflow;
    const closeOnDesktop = () => {
      if (desktop.matches) dialog.close();
    };

    dialog.showModal();
    document.body.style.overflow = "hidden";
    desktop.addEventListener("change", closeOnDesktop);
    closeOnDesktop();

    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isViewerOpen]);

  function openImage(image: GalleryImage) {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setViewerImage(image);
    }
  }

  if (!active) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-3/4 overflow-hidden rounded-card bg-subtle">
        <CloudImage
          key={active.publicId}
          src={active.publicId}
          alt={`${title} — ${t.item.imageRoles[active.role]}`}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1152px) 536px, (min-width: 1024px) 48vw, calc(100vw - 32px)"
          className="object-cover"
        />
        <button
          type="button"
          onClick={() => openImage(active)}
          aria-label={`${t.item.openImage} — ${t.item.imageRoles[active.role]}`}
          aria-haspopup="dialog"
          className="absolute inset-0 cursor-zoom-in rounded-card focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary lg:hidden"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ordered.map((image, index) => (
          <button
            key={image.publicId}
            type="button"
            onClick={() => {
              setActiveIndex(index);
              openImage(image);
            }}
            aria-current={index === activeIndex}
            className={`relative aspect-3/4 overflow-hidden rounded-2xl border-2 transition ${
              index === activeIndex
                ? "border-primary"
                : "border-transparent hover:border-border"
            }`}
          >
            <CloudImage
              src={image.publicId}
              alt={t.item.imageRoles[image.role]}
              fill
              sizes="(min-width: 1152px) 171px, (min-width: 1024px) 16vw, 33vw"
              loading="lazy"
              className="object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-foreground/60 py-1 text-center text-[11px] text-white">
              {t.item.imageRoles[image.role]}
            </span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${title} — ${t.item.openImage}`}
        onClose={() => setViewerImage(null)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-black p-4 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-white backdrop:bg-black"
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label={t.item.closeImage}
          className="absolute end-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] flex size-12 items-center justify-center rounded-full bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-6"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        {viewerImage ? (
          <div className="relative h-full w-full">
            <CloudImage
              src={viewerImage.publicId}
              alt={`${title} — ${t.item.imageRoles[viewerImage.role]}`}
              fill
              loading="eager"
              sizes="100vw"
              className="object-contain"
            />
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
