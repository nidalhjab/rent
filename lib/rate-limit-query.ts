import { Prisma } from "@/lib/generated/prisma/client";

export function rateLimitStatement(key: string, limit: number, windowMs: number, now: Date) {
  const cutoff = new Date(now.getTime() - windowMs);
  // The INSERT/UPDATE and limit check hold the same row lock across instances.
  return Prisma.sql`
    INSERT INTO "RateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowStart" <= ${cutoff} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."windowStart" <= ${cutoff} THEN ${now} ELSE "RateLimit"."windowStart" END
    WHERE "RateLimit"."windowStart" <= ${cutoff} OR "RateLimit"."count" < ${limit}
    RETURNING "key"
  `;
}
