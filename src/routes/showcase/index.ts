import { readdir } from "node:fs/promises";
import { parse, resolve } from "node:path";
import { environment } from "#environment";
import { serveView } from "#utils/view";

const routeDef: RouteDef = {
	method: "GET",
	accepts: "*/*",
	returns: "text/html",
};

const showcaseDir = resolve("data", "showcase");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);

async function handler(_request: ExtendedRequest): Promise<Response> {
	let entries: string[] = [];

	try {
		entries = await readdir(showcaseDir);
	} catch {
		entries = [];
	}

	const images = entries.filter((f) =>
		imageExtensions.has(parse(f).ext.toLowerCase()),
	);
	images.sort((a, b) => a.localeCompare(b));

	const items: string[] = [];

	for (const image of images) {
		const { name } = parse(image);
		const src = `/showcase/${image}`;

		let desc = "";
		const txtFile = Bun.file(resolve(showcaseDir, `${name}.txt`));

		if (await txtFile.exists()) {
			desc = (await txtFile.text()).trim();
		}

		const descHtml = desc
			? `<p class="showcase-desc">${desc.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
			: "";

		items.push(
			`<div class="showcase-item"><img src="${src}" alt="${name}" class="showcase-img" loading="lazy" />${descHtml}</div>`,
		);
	}

	const content =
		items.length > 0
			? `<div class="showcase-grid">\n\t\t\t\t\t${items.join("\n\t\t\t\t\t")}\n\t\t\t\t</div>`
			: '<p class="showcase-empty">No showcases yet.</p>';

	return await serveView("showcase", {
		BOT_INVITE: environment.botInvite,
		SHOWCASE_CONTENT: content,
		SHOWCASE_COUNT: images.length.toString(),
	});
}

export { handler, routeDef };
