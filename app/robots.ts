import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://niftit.example";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/dashboard", "/admin", "/checkout"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
