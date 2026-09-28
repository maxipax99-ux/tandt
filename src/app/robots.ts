import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/q/", "/d/", "/delete-my-data/verify", "/order/success"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
