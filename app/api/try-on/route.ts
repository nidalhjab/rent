import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { prisma } from "@/lib/db";
import { DAY, consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { profileHash } from "@/lib/try-on";
import { tryOnSchema } from "@/lib/validation";
import { t } from "@/messages/ar";
import { serializeRender } from "./serialize";

/**
 * Creates (or reuses) a render job. Generation itself happens in
 * `POST /api/try-on/[id]` so each request stays short.
 */
export async function POST(request: Request) {
  const parsed = tryOnSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: t.form.genericError }, { status: 400 });
  }

  const { itemId, ...profile } = parsed.data;

  const item = await prisma.item.findFirst({
    where: { id: itemId, moderation: "APPROVED" },
    select: { images: { select: { role: true } } },
  });
  if (!item) {
    return NextResponse.json({ error: t.item.notFound }, { status: 404 });
  }

  const roles = new Set(item.images.map((image) => image.role));
  if (!roles.has("FRONT") || !roles.has("BACK")) {
    return NextResponse.json(
      { error: t.tryOn.missingImages },
      { status: 400 },
    );
  }

  const hash = profileHash(profile);
  const key = { itemId_profileHash: { itemId, profileHash: hash } };
  const existing = await prisma.tryOnRender.findUnique({ where: key });

  // A cached pair costs nothing, so it never touches the visitor's quota.
  if (existing?.status === "READY") {
    return NextResponse.json(serializeRender(existing));
  }

  const allowed = await consumeRateLimit({
    key: `try-on:${await getClientIp()}`,
    limit: site.limits.rendersPerDay,
    windowMs: DAY,
  });
  if (!allowed) {
    return NextResponse.json({ error: t.tryOn.quota }, { status: 429 });
  }

  const render = await prisma.tryOnRender.upsert({
    where: key,
    create: { itemId, profileHash: hash, ...profile, status: "PENDING" },
    update: { status: "PENDING", error: null },
  });

  return NextResponse.json(serializeRender(render));
}
