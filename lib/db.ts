import { PrismaNeon } from "@prisma/adapter-neon";
import { requireEnv } from "@/lib/env";
import { PrismaClient } from "@/lib/generated/prisma/client";

const createPrismaClient = () =>
  new PrismaClient({
    // Pooled Neon endpoint over WebSockets, which is what serverless needs.
    adapter: new PrismaNeon({ connectionString: requireEnv("DATABASE_URL") }),
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

// Hot reload in development would otherwise open a new pool on every change.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
