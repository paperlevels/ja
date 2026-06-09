import type { APIRoute } from "astro";
import { getLoglines } from "@/lib/data";

const site = "https://ja.paperlevels.workers.dev";

function toIso(value: string | null | undefined) {
  return value ? new Date(value).toISOString() : new Date().toISOString();
}

export const GET: APIRoute = async () => {
  const loglines = await getLoglines("newest");
  const now = new Date().toISOString();

  const urls = [
    {
      loc: `${site}/`,
      lastmod: now,
      priority: "1.0",
    },
    {
      loc: `${site}/about`,
      lastmod: now,
      priority: "0.5",
    },
    ...loglines.map((logline) => ({
      loc: `${site}/p/${logline.id}`,
      lastmod: toIso(logline.updated_at),
      priority: "0.8",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
