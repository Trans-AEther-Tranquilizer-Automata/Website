import { resolve } from "node:path";

const viewDir: string = resolve("public", "view");

async function serveView(
	name: string,
	variables?: Record<string, string>,
	status = 200,
): Promise<Response> {
	const filePath: string = resolve(viewDir, `${name}.html`);

	if (!filePath.startsWith(viewDir)) {
		return new Response("Forbidden", { status: 403 });
	}

	const file = Bun.file(filePath);

	if (!(await file.exists())) {
		return new Response("View Not Found", { status: 404 });
	}

	if (variables) {
		let html: string = await file.text();

		for (const [key, value] of Object.entries(variables)) {
			html = html.replaceAll(`{{${key}}}`, value);
		}

		return new Response(html, {
			status,
			headers: { "Content-Type": "text/html" },
		});
	}

	return new Response(file, {
		status,
		headers: { "Content-Type": "text/html" },
	});
}

export { serveView };
