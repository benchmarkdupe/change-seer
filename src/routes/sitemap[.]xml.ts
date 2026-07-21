import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SAMPLE_OPPORTUNITIES } from "@/data/sample/opportunities";

const BASE_URL = "";

interface Entry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/build", changefreq: "monthly", priority: "0.5" },
          { path: "/cashflow", changefreq: "monthly", priority: "0.5" },
          { path: "/community", changefreq: "monthly", priority: "0.5" },
          { path: "/profile", changefreq: "monthly", priority: "0.4" },
          ...SAMPLE_OPPORTUNITIES.map((o) => ({
            path: `/opportunity/${o.id}`,
            changefreq: "weekly" as const,
            priority: "0.8",
          })),
        ];

        const urls = entries.map((e) =>
          [
            "  <url>",
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            "  </url>",
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
