import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://stickythoughts.alexanderho.dev";
  const today = new Date("2026-02-06");

  return [
    {
      url: `${base}`,
      lastModified: today,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/letters`,
      lastModified: today,
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${base}/about`,
      lastModified: new Date("2026-01-21"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/contact`,
      lastModified: new Date("2023-11-22"),
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${base}/terms-and-conditions`,
      lastModified: new Date("2026-01-21"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${base}/privacy-policy`,
      lastModified: new Date("2026-01-21"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${base}/disclaimer`,
      lastModified: new Date("2026-01-21"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
