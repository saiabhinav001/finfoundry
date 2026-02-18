import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/bootstrap"],
      },
    ],
    sitemap: "https://cbitfinfoundry.vercel.app/sitemap.xml",
  };
}
