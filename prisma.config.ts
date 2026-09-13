import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrations and introspection need the direct (unpooled) Neon endpoint;
    // the app itself talks to the pooled one through the driver adapter.
    url: env("DATABASE_URL_UNPOOLED"),
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
