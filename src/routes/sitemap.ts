import { environment } from "#environment";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "application/xml",
};

const pages = [
	{ path: "/", priority: "1.0", changefreq: "weekly" },
	{ path: "/commands", priority: "0.9", changefreq: "weekly" },
	{ path: "/leaderboard", priority: "0.8", changefreq: "daily" },
	{ path: "/showcase", priority: "0.7", changefreq: "monthly" },
	{ path: "/privacy", priority: "0.3", changefreq: "yearly" },
	{ path: "/terms", priority: "0.3", changefreq: "yearly" },
];

async function handler(_request: ExtendedRequest): Promise<Response> {
	const url = environment.siteUrl.replace(/\/+$/, "");
	const now = new Date().toISOString();

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `\t<url>\n\t\t<loc>${url}${p.path}</loc>\n\t\t<lastmod>${now}</lastmod>\n\t\t<changefreq>${p.changefreq}</changefreq>\n\t\t<priority>${p.priority}</priority>\n\t</url>`).join("\n")}
</urlset>`;

	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=3600, stale-while-revalidate=1800",
		},
	});
}

export { handler, routeDef };
