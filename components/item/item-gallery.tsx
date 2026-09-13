"use client";

import { useState } from "react";
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
  const active = ordered[activeIndex] ?? ordered[0];

  if (!active) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-3/4 overflow-hidden rounded-card bg-subtle">
        <CloudImage
          key={active.publicId}
          src={active.publicId}
          alt={`${title} — ${t.item.imageRoles[active.role]}`}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ordered.map((image, index) => (
          <button
            key={image.publicId}
            type="button"
            onClick={() => setActiveIndex(index)}
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
              sizes="20vw"
              className="object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-foreground/60 py-1 text-center text-[11px] text-white">
              {t.item.imageRoles[image.role]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
