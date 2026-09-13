import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { prisma } from "@/lib/db";
import { DAY, consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { renderTryOnView, type TryOnView } from "@/lib/try-on";
import { t } from "@/messages/ar";
import { serializeRender } from "../serialize";

/** Image generation takes ~10-25s per view. */
export const maxDuration = 60;

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/try-on/[id]">,
) {
  const { id } = await params;
  const render = await prisma.tryOnRender.findUnique({ where: { id } });
  if (!render) {
    return NextResponse.json({ error: t.tryOn.failed }, { status: 404 });
  }
  return NextResponse.json(serializeRender(render));
}

export async function POST(
  request: Request,
  { params }: RouteContext<"/api/try-on/[id]">,
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const view: TryOnView = body?.view === "BACK" ? "BACK" : "FRONT";

  // The job already passed the daily quota; this only stops hammering.
  const allowed = await consumeRateLimit({
    key: `try-on-run:${await getClientIp()}`,
    limit: site.limits.rendersPerDay * 3,
    windowMs: DAY,
  });
  if (!allowed) {
    return NextResponse.json({ error: t.tryOn.quota }, { status: 429 });
  }

  const render = await prisma.tryOnRender.findUnique({
    where: { id },
    include: {
      item: { select: { images: { select: { role: true, publicId: true } } } },
    },
  });
  if (!render) {
    return NextResponse.json({ error: t.tryOn.failed }, { status: 404 });
  }

  // Each view is generated at most once per profile, so the endpoint can't be
  // replayed to burn credits.
  if (view === "FRONT" && render.frontPublicId) {
    return NextResponse.json(serializeRender(render));
  }
  if (view === "BACK" && render.backPublicId) {
    return NextResponse.json(serializeRender(render));
  }
  if (view === "BACK" && !render.frontPublicId) {
    return NextResponse.json({ error: t.tryOn.failed }, { status: 409 });
  }

  const reference = render.item.images.find((image) => image.role === view);
  if (!reference) {
    return NextResponse.json(
      { error: t.tryOn.missingImages },
      { status: 400 },
    );
  }

  try {
    await prisma.tryOnRender.update({
      where: { id },
      data: { status: "GENERATING" },
    });

    const stored = await renderTryOnView({
      view,
      profile: {
        heightCm: render.heightCm,
        weightKg: render.weightKg,
        skinTone: render.skinTone,
        bodyNote: render.bodyNote ?? undefined,
      },
      dressPublicId: reference.publicId,
      frontRenderPublicId: render.frontPublicId,
    });

    const updated = await prisma.tryOnRender.update({
      where: { id },
      data:
        view === "FRONT"
          ? {
              frontPublicId: stored.publicId,
              status: render.backPublicId ? "READY" : "GENERATING",
              error: null,
            }
          : { backPublicId: stored.publicId, status: "READY", error: null },
    });

    return NextResponse.json(serializeRender(updated));
  } catch (error) {
    console.error("try-on: generation failed", error);
    await prisma.tryOnRender.update({
      where: { id },
      data: { status: "FAILED", error: String(error).slice(0, 300) },
    });
    return NextResponse.json({ error: t.tryOn.failed }, { status: 502 });
  }
}
