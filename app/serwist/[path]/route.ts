import { createSerwistRoute } from "@serwist/turbopack";

// Changing this invalidates the precached offline page on every deployment.
const revision =
  process.env.VERCEL_DEPLOYMENT_ID ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  "development";

const serwistRoute = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "app/sw.ts",
});

// `dynamic`, `dynamicParams`, and `revalidate` are deliberately not re-exported:
// Cache Components rejects those route segment configs.
export const generateStaticParams = serwistRoute.generateStaticParams;
export const GET = serwistRoute.GET;
