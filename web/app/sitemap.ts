import type { MetadataRoute } from "next";
import { medusa } from "@/lib/medusa";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://naran.mn").replace(/\/$/, "");
const CATEGORIES = ["Fragrance", "Skincare", "Makeup", "Body", "Gift"];

export const revalidate = 3600; // rebuild the sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map(c => ({
    url: `${BASE}/shop?category=${c}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data } = await medusa.products.list({});
    productRoutes = data.map(p => ({
      url: `${BASE}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch { /* backend unreachable → still emit static + category routes */ }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
