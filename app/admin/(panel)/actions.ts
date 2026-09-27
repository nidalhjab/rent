"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteImages } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { Availability } from "@/lib/generated/prisma/enums";
import { ITEMS_TAG } from "@/lib/items";
import { lockItem } from "@/lib/reservations";
import { dateValue, todayInPalestine } from "@/lib/booking-dates";

const idOf = (formData: FormData) => String(formData.get("id") ?? "");

async function purgeItem(id: string) {
  const item = await prisma.item.findUnique({
    where: { id },
    select: { images: { select: { publicId: true } } },
  });
  if (!item) return;

  // Rows go first: an orphaned Cloudinary asset is harmless, a broken item row
  // is not. Cascades clean up images, reservations, and renders.
  await prisma.item.delete({ where: { id } });
  await deleteImages(item.images.map((image) => image.publicId));
}

export async function approveSubmission(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) return;

  await prisma.item.update({
    where: { id },
    data: { moderation: "APPROVED", approvedAt: new Date() },
  });
  updateTag(ITEMS_TAG);
}

export async function declineSubmission(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) return;

  await purgeItem(id);
  updateTag(ITEMS_TAG);
}

export async function approveReservation(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) return;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    select: { itemId: true },
  });
  if (!reservation) return;

  await prisma.$transaction(async (tx) => {
    await lockItem(tx, reservation.itemId);
    // A stale admin form cannot approve a rejected/already decided request.
    // Dates already belong to the pending request; other dates stay bookable.
    await tx.reservation.updateMany({
      where: {
        id, status: "PENDING",
        preferredDate: { gte: dateValue(todayInPalestine()) },
        item: { moderation: "APPROVED", availability: "AVAILABLE" },
      },
      data: { status: "APPROVED", decidedAt: new Date() },
    });
  });
  updateTag(ITEMS_TAG);
  revalidatePath("/admin/reservations");
  revalidatePath(`/items/${reservation.itemId}`);
}

export async function rejectReservation(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) return;

  const reservation = await prisma.reservation.findUnique({ where: { id }, select: { itemId: true } });
  if (!reservation) return;
  await prisma.$transaction(async (tx) => {
    await lockItem(tx, reservation.itemId);
    await tx.reservation.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "REJECTED", decidedAt: new Date() },
    });
  });
  updateTag(ITEMS_TAG);
  revalidatePath("/admin/reservations");
  revalidatePath(`/items/${reservation.itemId}`);
}

export async function setItemAvailability(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  const raw = String(formData.get("availability") ?? "");
  if (!id || !(raw in Availability)) return;

  await prisma.item.update({
    where: { id },
    data: { availability: raw as Availability },
  });
  updateTag(ITEMS_TAG);
}

export async function deleteItem(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) return;

  await purgeItem(id);
  updateTag(ITEMS_TAG);
}
