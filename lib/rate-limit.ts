import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { rateLimitStatement } from "@/lib/rate-limit-query";

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export async function getClientIp() {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || store.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window counter kept in Postgres: no extra infrastructure, and the
 * volumes here (public forms, AI renders, admin logins) never justify Redis.
 */
export async function consumeRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ key: string }[]>(
    rateLimitStatement(key, limit, windowMs, new Date()),
  );
  return rows.length === 1;
}

export async function clearRateLimit(key: string) {
  await prisma.rateLimit.deleteMany({ where: { key } });
}
