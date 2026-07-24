import { environment } from "#environment";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "text/plain",
};

async function handler(_request: ExtendedRequest): Promise<Response> {
	const url = environment.siteUrl.replace(/\/+$/, "");

	const content = `User-agent: *
Allow: /
Disallow: /websocket

Sitemap: ${url}/sitemap.xml
`;

	return new Response(content, {
		status: 200,
		headers: {
			"Content-Type": "text/plain",
			"Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
		},
	});
}

export { handler, routeDef };
