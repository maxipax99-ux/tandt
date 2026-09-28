import type { MetadataRoute } from "next";

const PATHS = [
  "", "/weddings", "/memorials", "/occasions", "/pricing", "/how-it-works", "/samples", "/faq", "/about",
  "/contact", "/order", "/privacy", "/terms", "/refunds", "/accessibility", "/delete-my-data",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return PATHS.map((p) => ({ url: `${site}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 }));
}
