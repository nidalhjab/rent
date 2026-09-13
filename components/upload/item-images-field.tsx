"use client";

import { useState } from "react";
import { downscaleImage } from "@/lib/downscale-image";
import { t } from "@/messages/ar";

const ROLES = ["FRONT", "BACK", "DETAIL"] as const;
type Role = (typeof ROLES)[number];

export const IMAGE_FIELD_NAMES: Record<Role, string> = {
  FRONT: "imageFront",
  BACK: "imageBack",
  DETAIL: "imageDetail",
};

type Slot = {
  status: "empty" | "uploading" | "done" | "error";
  publicId?: string;
  preview?: string;
};

const emptySlots = (): Record<Role, Slot> => ({
  FRONT: { status: "empty" },
  BACK: { status: "empty" },
  DETAIL: { status: "empty" },
});

async function uploadToCloudinary(blob: Blob): Promise<string> {
  const signResponse = await fetch("/api/uploads/sign", { method: "POST" });
  if (!signResponse.ok) throw new Error("sign failed");
  const sign = await signResponse.json();

  const body = new FormData();
  body.append("file", blob);
  body.append("api_key", sign.apiKey);
  body.append("timestamp", String(sign.timestamp));
  body.append("signature", sign.signature);
  body.append("folder", sign.folder);

  const upload = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body },
  );
  if (!upload.ok) throw new Error("upload failed");

  const result = await upload.json();
  return result.public_id as string;
}

export function ItemImagesField({ error }: { error?: string }) {
  const [slots, setSlots] = useState(emptySlots);

  async function handleChange(role: Role, file: File | undefined) {
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setSlots((prev) => ({ ...prev, [role]: { status: "uploading", preview } }));

    try {
      const publicId = await uploadToCloudinary(await downscaleImage(file));
      setSlots((prev) => ({
        ...prev,
        [role]: { status: "done", publicId, preview },
      }));
    } catch {
      setSlots((prev) => ({ ...prev, [role]: { status: "error", preview } }));
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted">{t.submit.imageHint}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ROLES.map((role) => {
          const slot = slots[role];
          return (
            <label
              key={role}
              className="group relative flex aspect-3/4 cursor-pointer flex-col items-center justify-center
                overflow-hidden rounded-2xl border-2 border-dashed border-border bg-subtle
                text-center transition hover:border-primary"
            >
              {slot.preview ? (
                // Local object URL for instant feedback; the stored asset is on Cloudinary.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slot.preview}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}

              <div
                className={`relative z-10 flex flex-col items-center gap-1 px-3 py-2 ${
                  slot.preview ? "rounded-xl bg-surface/90" : ""
                }`}
              >
                <span className="text-sm font-medium">
                  {t.item.imageRoles[role]}
                </span>
                <span className="text-xs text-muted">
                  {slot.status === "uploading"
                    ? t.submit.uploading
                    : slot.status === "done"
                      ? t.submit.change
                      : slot.status === "error"
                        ? t.form.genericError
                        : t.submit.upload}
                </span>
              </div>

              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) =>
                  handleChange(role, event.target.files?.[0])
                }
              />

              {slot.publicId ? (
                <input
                  type="hidden"
                  name={IMAGE_FIELD_NAMES[role]}
                  value={slot.publicId}
                />
              ) : null}
            </label>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
