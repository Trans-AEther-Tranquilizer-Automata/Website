import { resolve } from "node:path";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "*/*",
};

const showcaseDir = resolve("data", "showcase");

async function handler(request: ExtendedRequest): Promise<Response> {
	const fileName = request.params?.file;

	if (!fileName) {
		return new Response("Not Found", { status: 404 });
	}

	const filePath = resolve(showcaseDir, fileName);

	if (!filePath.startsWith(showcaseDir)) {
		return new Response("Forbidden", { status: 403 });
	}

	const file = Bun.file(filePath);

	if (await file.exists()) {
		return new Response(file, {
			headers: {
				"Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
			},
		});
	}

	return new Response("Not Found", { status: 404 });
}

export { handler, routeDef };
