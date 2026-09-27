import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/serwist/", "/~offline"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
