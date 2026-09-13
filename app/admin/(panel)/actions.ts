"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteImages } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { Availability } from "@/lib/generated/prisma/enums";
import { ITEMS_TAG } from "@/lib/items";

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

  const decidedAt = new Date();

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id },
      data: { status: "APPROVED", decidedAt },
    }),
    // Once one request wins, the others for the same item can't be honoured.
    prisma.reservation.updateMany({
      where: { itemId: reservation.itemId, status: "PENDING", id: { not: id } },
      data: { status: "REJECTED", decidedAt },
    }),
    prisma.item.update({
      where: { id: reservation.itemId },
      data: { availability: "RESERVED" },
    }),
  ]);

  updateTag(ITEMS_TAG);
}

export async function rejectReservation(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) return;

  await prisma.reservation.update({
    where: { id },
    data: { status: "REJECTED", decidedAt: new Date() },
  });
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
