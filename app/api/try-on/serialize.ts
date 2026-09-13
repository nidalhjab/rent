import type { TryOnRender } from "@/lib/generated/prisma/client";

export type TryOnRenderDto = {
  id: string;
  status: TryOnRender["status"];
  front: string | null;
  back: string | null;
};

/** Only the fields the browser needs; measurements never travel back out. */
export const serializeRender = (render: TryOnRender): TryOnRenderDto => ({
  id: render.id,
  status: render.status,
  front: render.frontPublicId,
  back: render.backPublicId,
});
