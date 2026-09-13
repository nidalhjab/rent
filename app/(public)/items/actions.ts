"use server";

import { site } from "@/config/site";
import { verifyUploadedImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { DAY, consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  fieldErrors,
  itemSubmissionSchema,
  reservationSchema,
  type FormState,
} from "@/lib/validation";
import { t } from "@/messages/ar";

export async function submitItem(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const allowed = await consumeRateLimit({
    key: `submit:${await getClientIp()}`,
    limit: site.limits.submissionsPerDay,
    windowMs: DAY,
  });
  if (!allowed) return { error: t.form.tooMany };

  const parsed = itemSubmissionSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) return fieldErrors(parsed.error);
  const data = parsed.data;

  // Never trust the browser about what was uploaded: re-read each asset from
  // Cloudinary to confirm it exists in our folder and to get real dimensions.
  const [front, back, detail] = await Promise.all([
    verifyUploadedImage(data.imageFront),
    verifyUploadedImage(data.imageBack),
    verifyUploadedImage(data.imageDetail),
  ]);
  if (!front || !back || !detail) {
    return { errors: { images: [t.validation.images] } };
  }

  await prisma.item.create({
    data: {
      category: data.category,
      title: data.title,
      description: data.description,
      color: data.color,
      size: data.size,
      condition: data.condition,
      timesWorn: data.timesWorn,
      pricePerDay: data.pricePerDay,
      depositAmount: data.depositAmount,
      city: data.city,
      ownerName: data.ownerName,
      ownerPhone: data.ownerPhone,
      images: {
        create: [
          { role: "FRONT", ...front },
          { role: "BACK", ...back },
          { role: "DETAIL", ...detail },
        ],
      },
    },
  });

  // Stays PENDING until the admin approves, so no public cache is affected.
  return { status: "success" };
}

export async function requestReservation(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const allowed = await consumeRateLimit({
    key: `reserve:${await getClientIp()}`,
    limit: site.limits.reservationsPerDay,
    windowMs: DAY,
  });
  if (!allowed) return { error: t.form.tooMany };

  const parsed = reservationSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) return fieldErrors(parsed.error);
  const data = parsed.data;

  const item = await prisma.item.findFirst({
    where: {
      id: data.itemId,
      moderation: "APPROVED",
      availability: "AVAILABLE",
    },
    select: { id: true },
  });
  if (!item) return { error: t.validation.unavailable };

  await prisma.reservation.create({
    data: {
      itemId: item.id,
      renterName: data.renterName,
      renterPhone: data.renterPhone,
      note: data.note,
      preferredDate: data.preferredDate,
    },
  });

  return { status: "success" };
}
